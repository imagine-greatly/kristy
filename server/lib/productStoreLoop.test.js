// The self-healing loop, proven by BEHAVIOUR.
//
// productStore.test.js covers the pure helpers and greps the source for the
// disciplines. That is necessary and not sufficient: the claim this loop rests on is
// a SEQUENCE — a product Open Food Facts cannot answer for gets photographed once,
// and the next shopper to scan that barcode resolves from our own store. Nothing
// short of running it end to end actually demonstrates that.
//
// So these drive the real functions against a fake Supabase client, which is why the
// client is injectable. No network, no database, no migration required.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { lookupProduct, retainProduct, coverageStats } from './productStore.js';

/* ───────────────────────── A fake Supabase, honest about the chain ─────────────────────────
   Mirrors exactly the call shapes productStore uses: .select().eq().maybeSingle(),
   .select().match().maybeSingle(), .insert(), .update().eq(), and the head/count
   form. Awaiting a query resolves it; chaining filters narrows it. */
function fakeStore(seed = []) {
  let autoId = 1;
  const rows = seed.map((r) => ({ id: `row-${autoId++}`, scan_count: 1, ...r }));
  const log = { inserted: [], updated: [], selectedColumns: [] };

  const matches = (row, filters) =>
    filters.every(([op, col, val]) => (op === 'gte' ? String(row[col] ?? '') >= val : row[col] === val));

  function query(kind, countMode) {
    const filters = [];
    const api = {
      eq(col, val) {
        filters.push(['eq', col, val]);
        return api;
      },
      gte(col, val) {
        filters.push(['gte', col, val]);
        return api;
      },
      match(obj) {
        for (const [col, val] of Object.entries(obj)) filters.push(['eq', col, val]);
        return api;
      },
      async maybeSingle() {
        return { data: rows.filter((r) => matches(r, filters))[0] || null, error: null };
      },
      // Awaited directly: the insert / update / count forms.
      then(resolve, reject) {
        try {
          if (countMode) {
            resolve({ count: rows.filter((r) => matches(r, filters)).length, error: null });
          } else if (kind === 'update') {
            for (const r of rows.filter((x) => matches(x, filters))) Object.assign(r, api._patch);
            resolve({ error: null });
          } else {
            resolve({ error: null });
          }
        } catch (err) {
          reject(err);
        }
      },
    };
    return api;
  }

  const client = {
    from() {
      return {
        select(columns, opts) {
          log.selectedColumns.push(columns);
          return query('select', opts?.count === 'exact' && opts?.head === true);
        },
        insert(row) {
          log.inserted.push(row);
          rows.push({ id: `row-${autoId++}`, scan_count: 1, ...row });
          return query('insert');
        },
        update(patch) {
          log.updated.push(patch);
          const q = query('update');
          q._patch = patch;
          return q;
        },
      };
    },
  };

  return { client, rows, log };
}

/* ═════════════════ The loop, start to finish ═════════════════ */

test('THE SELF-HEAL: a product OFF cannot answer for resolves from our store on the next scan', async () => {
  const { client, rows } = fakeStore();

  // Trip 1 — no barcode database has it, so a shopper photographs the panel.
  const first = await retainProduct({
    barcode: '0012345678905',
    name: 'Regional Oat Crackers',
    ingredients: 'Whole oat flour, water, sea salt',
    source: 'vision',
    panel: 'full',
    client,
  });
  assert.equal(first.retained, true);
  assert.equal(first.created, true, 'the first sighting creates the row');
  assert.equal(rows.length, 1);

  // Trip 2 — a DIFFERENT shopper scans the same barcode. The gap has closed.
  const second = await lookupProduct('0012345678905', { client });
  assert.ok(second, 'the barcode must now resolve from our own store');
  assert.equal(second.source, 'store');
  assert.equal(second.ingredients, 'Whole oat flour, water, sea salt');
  assert.equal(second.originalSource, 'vision', 'provenance survives — this row is an OCR read');
  assert.equal(second.product.name, 'Regional Oat Crackers');
});

test('a repeat sighting bumps the counter instead of duplicating the product', async () => {
  const { client, rows } = fakeStore();
  const payload = {
    barcode: '0012345678905',
    ingredients: 'Whole oat flour, water, sea salt',
    source: 'vision',
    panel: 'full',
    client,
  };

  await retainProduct(payload);
  const again = await retainProduct(payload);

  assert.equal(again.created, false, 'the second sighting must not create a second row');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].scan_count, 2, 'the sighting is counted');
});

test('a partial vision read may not overwrite an Open Food Facts record', async () => {
  const { client, rows } = fakeStore([
    {
      barcode: '0012345678905',
      ingredients: 'Oats, cane sugar, canola oil',
      source: 'off',
      confidence: 'high',
    },
  ]);

  const result = await retainProduct({
    barcode: '0012345678905',
    ingredients: 'Oats', // a cropped photo that missed the tail
    source: 'vision',
    panel: 'partial',
    client,
  });

  assert.equal(result.replaced, false, 'the weaker read must not win');
  assert.equal(
    rows[0].ingredients,
    'Oats, cane sugar, canola oil',
    'the known-good ingredient list survives the bad photo'
  );
  assert.equal(rows[0].scan_count, 2, 'the sighting is still counted');
});

test('a low-confidence store row stays honest about it, so approval can be withheld', async () => {
  const { client } = fakeStore([
    {
      barcode: '0012345678905',
      ingredients: 'Oats, sugar',
      source: 'vision',
      confidence: 'low',
    },
  ]);

  const hit = await lookupProduct('0012345678905', { client });
  assert.equal(hit.confidence, 'low', 'a partial read must not silently read as complete');
});

test('an empty store is a miss, not an error — OFF still gets its turn', async () => {
  const { client } = fakeStore();
  assert.equal(await lookupProduct('0012345678905', { client }), null);
});

/* ═════════════════ Coverage: is the moat actually compounding? ═════════════════ */

test('coverage counts the split that matters — borrowed vs owned', async () => {
  const { client } = fakeStore([
    { barcode: '1', source: 'off', confidence: 'high', first_seen: '2026-07-29T00:00:00.000Z' },
    { barcode: '2', source: 'off', confidence: 'high', first_seen: '2026-07-29T00:00:00.000Z' },
    { barcode: '3', source: 'vision', confidence: 'high', first_seen: '2026-07-29T00:00:00.000Z' },
    { barcode: '4', source: 'vision', confidence: 'low', first_seen: '2020-01-01T00:00:00.000Z' },
  ]);

  const stats = await coverageStats({ client });
  assert.equal(stats.available, true);
  assert.equal(stats.total, 4);
  assert.equal(stats.fromOff, 2, 'coverage we borrow');
  assert.equal(stats.fromVision, 2, 'coverage we own — the moat');
  assert.equal(stats.lowConfidence, 1, 'the curation queue');
  assert.equal(stats.learnedRecently, 3, 'three landed inside the recent window');
});

test('a MISSING table reports unavailable, not a healthy empty catalog', async () => {
  // The trap this closes: PostgREST answers a head+count against a non-existent table
  // with 204, no error and a null count. Read naively that is "available, zero
  // products" — indistinguishable from a migrated table nobody has scanned into yet,
  // and the difference is "waiting for shoppers" versus "capturing nothing, forever".
  const missingTable = {
    from: () => ({
      select: () => {
        const q = {
          eq: () => q,
          gte: () => q,
          then: (resolve) => resolve({ count: null, error: null }),
        };
        return q;
      },
    }),
  };

  const stats = await coverageStats({ client: missingTable });
  assert.equal(stats.available, false, 'a null count must never read as a healthy empty table');
  assert.equal(stats.total, 0);
});

test('an unmigrated table reports unavailable rather than breaking the dashboard', async () => {
  const broken = {
    from: () => ({
      select: () => ({
        eq: () => broken.from().select(),
        gte: () => broken.from().select(),
        then: (_res, rej) => rej(new Error('relation "scanned_products" does not exist')),
      }),
    }),
  };
  const stats = await coverageStats({ client: broken });
  assert.equal(stats.available, false);
  assert.equal(stats.total, 0);
});

/* ═════════════════ Products, not people — at every layer ═════════════════ */

test('nothing the loop writes carries an identity', async () => {
  const { client, log } = fakeStore();
  await retainProduct({
    barcode: '0012345678905',
    name: 'Regional Oat Crackers',
    ingredients: 'Whole oat flour, water, sea salt',
    source: 'vision',
    panel: 'full',
    client,
  });

  const written = Object.keys(log.inserted[0] || {}).join(' ');
  for (const forbidden of ['user', 'account', 'session', 'ip', 'device']) {
    assert.equal(
      new RegExp(forbidden, 'i').test(written),
      false,
      `the retained row must carry no ${forbidden} field — it is a catalog, not a log of who bought what`
    );
  }
});

test('the coverage read asks for no identifying column', async () => {
  const { client, log } = fakeStore();
  await coverageStats({ client });
  for (const columns of log.selectedColumns) {
    assert.equal(/user|account|session/i.test(String(columns)), false);
  }
});

/* ═════════════════ The lookup ORDER, where it is actually decided ═════════════════ */

test('the barcode resolver consults our own store BEFORE Open Food Facts', () => {
  // The order is the loop. If OFF were consulted first, a product we already learned
  // would still cost a network round trip and would silently stop compounding the
  // moment OFF happened to gain a thin record for it.
  const src = readFileSync(new URL('./scanExtract.js', import.meta.url), 'utf8');
  const ownStore = src.indexOf('lookupProduct(');
  const offFetch = src.indexOf('OFF_BASE');
  const offCall = src.indexOf(`fetch(\`\${OFF_BASE}`);

  assert.ok(ownStore > 0, 'scanExtract must consult the product store');
  assert.ok(offCall > 0, 'scanExtract must have an Open Food Facts call');
  assert.ok(
    ownStore < offCall,
    'the own-store lookup must come before the Open Food Facts fetch'
  );
  assert.ok(offFetch > 0);
});

/* ═══════ A LOW-CONFIDENCE ROW IS SERVED, AND IT IS A CURATION QUEUE ═══════

   Under photo-first, most rows in the catalog get built from a shopper's panel photo,
   and the vision call reports `partial` far more often than `full` — four out of four
   on Open Food Facts' own deliberately-cropped panels. Withholding a `low` row would
   fill the store with rows it refuses to serve and leave the moat at four.

   So it IS served, and the only thing it costs is the seal: the row travels with its
   confidence, `extractFromBarcode` marks it `partialRead`, and /verdict withholds
   `approved`. The FLAGS stand, which is right on its own terms — a half-read list can
   never falsely flag (everything matched was really printed) and can only falsely
   approve. A flagged product with no seal is a useful answer.

   Driven through the real functions rather than by seeding a row, because the claim is
   a sequence: a partial read is stored, served, and then superseded. */

test('a low-confidence row answers, and a fuller read replaces it', async () => {
  const { client, rows } = fakeStore();

  await retainProduct({
    barcode: '0012345678905', name: 'Photographed thing',
    ingredients: 'oats, canola oil', source: 'vision', panel: 'partial', client,
  });
  assert.equal(rows[0].confidence, 'low', 'a partial panel is stored as low confidence');

  const served = await lookupProduct('0012345678905', { client });
  assert.ok(served, 'a low-confidence row is NOT withheld from the next shopper');
  assert.equal(served.ingredients, 'oats, canola oil');
  assert.equal(served.confidence, 'low', 'and its confidence rides along so the seal can be withheld');

  // vision/full (2) outranks vision/partial (1), so the queue drains on a better scan.
  await retainProduct({
    barcode: '0012345678905', name: 'Photographed thing',
    ingredients: 'oats, canola oil, salt, natural flavor', source: 'vision', panel: 'full', client,
  });
  const better = await lookupProduct('0012345678905', { client });
  assert.equal(better.confidence, 'high', 'the curation queue drains as the product is re-scanned');
  assert.match(better.ingredients, /natural flavor/, 'the fuller list wins');
});
