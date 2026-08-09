// THE SEAL GATE, THROUGH THE CACHE — the half of finding I that was live for a day.
//
// The gate itself (`unverifiedAsFood`) shipped correct and tested. It was also unreachable in
// the one direction that matters, and nothing said so: it reads `nutrition.nutritionPanel`, and
// `scanned_products` stored no nutrition, so the moment a product was retained the barcode door
// answered `source:"store"` with `nutrition:null`, the panel resolved to `unknown`, and
// `unknown` withholds nothing. Verified on production: 0030772117484 came back `stamp: true`.
//
// ⚠️ THIS IS THE FAMILY, AND IT IS WHY THESE TESTS DRIVE `extractFromBarcode` RATHER THAN
// REBUILDING ITS MAPPING. Every piece was individually right — the engine's gate, the OFF
// path's tri-state, the client handing the field back — and the defect lived in the branch none
// of them covered. A test that read a row and assembled its own `nutrition` object would prove
// the engine works on input the test invented, which is the props-supplied harness defect
// (CLAUDE.md, Verifying) and is exactly how this got shipped in the first place. So the fake
// stands in for the DATABASE and nothing else; the mapping, the branch and the engine are real.
//
// A store hit returns before any OFF fetch, so this needs no network and no migration.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { lookupProduct, retainProduct } from './productStore.js';
import { extractFromBarcode } from './scanExtract.js';
import { evaluateIngredients } from './verdictEngine.js';

/* Dawn Platinum Plus Powerwash, 0030772117484 — OFF's own ingredient string, verbatim from the
   production response. It matches ZERO knowledge-base entries, which is precisely why it earns
   the seal: `approved` means "nothing matched", and that is also the signature of the cleanest
   possible food. No scoring change can separate them, so the panel has to. */
const DAWN =
  'WATER, DIPROPYLENE GLYCOL BUTYL ETHER, C10-16 ALKYLDIMETHYLAMINE OXIDE, LAURYL GLUCOSIDE, ' +
  'HEXYL ETHOXYLATE, TETRASODIUM GLUTAMATE DIACETATE, SODIUM XYLENESULFONATE, ETHANOLAMINE, ' +
  'ALCOHOL DENAT., PHENOXYETHANOL, FRAGRANCES, SODIUM CITRATE, PPG-26';

/* A real food that also matches nothing — the control. Every assertion below that withholds a
   seal has to leave this one alone, or the fix for a false seal on detergent becomes a missing
   seal on food, which is the strictly worse trade. */
const OLIVES = 'Olives, water, sea salt';

/* ───────────────────────── A fake Supabase, honest about the chain ─────────────────────────
   Mirrors the call shapes productStore uses. `missingColumn` simulates an UNMIGRATED table the
   way PostgREST actually behaves: it fails the WHOLE select, it does not omit one field. */
function fakeStore(seed = [], { missingColumn = null } = {}) {
  let autoId = 1;
  const rows = seed.map((r) => ({ id: `row-${autoId++}`, scan_count: 1, ...r }));
  const log = { inserted: [], updated: [], selects: [] };

  const matches = (row, filters) => filters.every(([col, val]) => row[col] === val);

  function query(kind, columns) {
    const filters = [];
    let patch = null;
    const api = {
      eq(col, val) {
        filters.push([col, val]);
        return api;
      },
      match(obj) {
        for (const [col, val] of Object.entries(obj)) filters.push([col, val]);
        return api;
      },
      async maybeSingle() {
        if (missingColumn && String(columns || '').includes(missingColumn)) {
          return {
            data: null,
            error: { message: `column scanned_products.${missingColumn} does not exist` },
          };
        }
        return { data: rows.filter((r) => matches(r, filters))[0] || null, error: null };
      },
      then(resolve, reject) {
        try {
          if (kind === 'update') {
            for (const r of rows.filter((x) => matches(x, filters))) Object.assign(r, patch);
          }
          resolve({ error: null });
        } catch (err) {
          reject(err);
        }
      },
    };
    api._setPatch = (p) => {
      patch = p;
    };
    return api;
  }

  const client = {
    from() {
      return {
        select(columns) {
          log.selects.push(columns);
          return query('select', columns);
        },
        insert(row) {
          log.inserted.push(row);
          rows.push({ id: `row-${autoId++}`, scan_count: 1, ...row });
          return query('insert');
        },
        update(p) {
          log.updated.push(p);
          const q = query('update');
          q._setPatch(p);
          return q;
        },
      };
    },
  };
  return { client, rows, log };
}

/* The production sequence, minus the network: a cached barcode resolves through the real
   `extractFromBarcode`, and its real response goes to the real engine. Nothing in between is
   authored by the test. */
async function scanCached(row) {
  const { client } = fakeStore([row]);
  const read = await extractFromBarcode(row.barcode, { client });
  const verdict = evaluateIngredients(read.ingredients, { nutrition: read.nutrition });
  return { read, verdict };
}

/* ─────────────── The defect, end to end: a cached non-food may not be sealed ─────────────── */

test('a CACHED detergent loses the seal — the branch the live gate never entered', async () => {
  const { read, verdict } = await scanCached({
    barcode: '0030772117484',
    name: 'Dawn Platinum Plus Powerwash',
    brand: 'Dawn',
    ingredients: DAWN,
    source: 'off',
    confidence: 'high',
    nutrition_panel: 'absent',
  });

  assert.equal(read.source, 'store', 'the point of this test is the CACHE path');
  assert.equal(
    read.nutrition?.nutritionPanel,
    'absent',
    'the store must hand the panel back; before this it returned nutrition:null and the gate could not fire',
  );

  assert.equal(verdict.tier, 'approved', 'nothing matched — that is not the thing being fixed');
  assert.equal(verdict.stamp, false, 'NON-NEGOTIABLE #4: the stamp is earned, and dish soap did not earn it');
  assert.equal(verdict.unverifiedAsFood, true);
  assert.equal(verdict.approvedRead, null, 'a client cannot fail closed on a field it never receives');
  assert.ok(verdict.unverifiedRead, 'the withheld read takes its place');
});

test('a CACHED clean food keeps its seal — the fix may not cost food its stamp', async () => {
  const { read, verdict } = await scanCached({
    barcode: '0000000000001',
    name: 'Olives',
    ingredients: OLIVES,
    source: 'off',
    confidence: 'high',
    nutrition_panel: 'present',
  });

  assert.equal(read.source, 'store');
  assert.equal(read.nutrition?.nutritionPanel, 'present');
  assert.equal(verdict.tier, 'approved');
  assert.equal(verdict.stamp, true, 'a declared panel is untouched by this gate');
  assert.equal(verdict.unverifiedAsFood, false);
  assert.ok(verdict.approvedRead, 'and it still reads the list back');
});

test('a row from BEFORE this column withholds nothing — NULL is unknown, not absent', async () => {
  // Every row in the live table is NULL right now. If NULL read as 'absent', applying the
  // migration would strip the seal off every clean food already in the catalog — a far worse
  // regression than the one being fixed, and it would look like the fix working.
  const { read, verdict } = await scanCached({
    barcode: '0000000000002',
    name: 'Olives',
    ingredients: OLIVES,
    source: 'off',
    confidence: 'high',
    nutrition_panel: null,
  });

  assert.equal(read.nutrition, null, 'no panel means no nutrition object at all — the unknown state');
  assert.equal(verdict.stamp, true);
  assert.equal(verdict.unverifiedAsFood, false);
});

test('an UNMIGRATED table still resolves the product — the loop must not go down with the panel', async () => {
  // PostgREST fails the whole select on an undeclared column, so without the retry this answers
  // null for every row and every product we own but OFF cannot resolve reports "not found".
  // That is a bigger outage than the defect: retention failing loses tomorrow's coverage, this
  // would lose today's answers.
  const { client, log } = fakeStore(
    [
      {
        barcode: '0030772117484',
        name: 'Dawn Platinum Plus Powerwash',
        ingredients: DAWN,
        source: 'off',
        confidence: 'high',
      },
    ],
    { missingColumn: 'nutrition_panel' },
  );

  const read = await extractFromBarcode('0030772117484', { client });
  assert.equal(read.found, true, 'the self-heal loop keeps answering');
  assert.equal(read.source, 'store');
  assert.equal(read.ingredients, DAWN);
  assert.equal(read.nutrition, null, 'and degrades to exactly the pre-migration behaviour: unknown');
  assert.ok(
    log.selects.some((c) => String(c).includes('nutrition_panel')),
    'it must ASK for the column first — a read that never asks would never notice it arrived',
  );
  assert.ok(
    log.selects.some((c) => !String(c).includes('nutrition_panel')),
    'and fall back to the legacy column list',
  );
});

/* ─────────────────────────── What may be written, and when ─────────────────────────── */

test("only 'present' and 'absent' are ever stored — 'unknown' is a READ state", async () => {
  for (const [sent, stored] of [
    ['present', 'present'],
    ['absent', 'absent'],
    ['unknown', null],
    ['', null],
    ['ABSENT', null],
    [undefined, null],
  ]) {
    const { client, log } = fakeStore();
    await retainProduct({
      barcode: `x-${sent}`,
      ingredients: OLIVES,
      source: 'off',
      nutritionPanel: sent,
      client,
    });
    assert.equal(
      log.inserted[0].nutrition_panel,
      stored,
      `${JSON.stringify(sent)} must store ${JSON.stringify(stored)}`,
    );
  }
});

test('an unrecognised value normalizes to NULL and never to absent — the failure direction', async () => {
  // Getting this backwards does not fail loudly. It quietly withholds the seal from every clean
  // food whose panel state was written by anything that was not the OFF door.
  const { client, log } = fakeStore();
  await retainProduct({ barcode: 'y', ingredients: OLIVES, source: 'off', nutritionPanel: 'nope', client });
  assert.notEqual(log.inserted[0].nutrition_panel, 'absent');
  assert.equal(log.inserted[0].nutrition_panel, null);
});

test('a label photo does NOT erase a stored absent — the TRUST RULE is what stops it', async () => {
  // ⚠️ NAMED FOR THE MECHANISM THAT ACTUALLY DOES THE WORK, because the obvious wording was
  // wrong. A label photo cannot erase an OFF row's panel because `vision` ranks BELOW `off`, so
  // it never reaches the panel write at all — not because of the `if (panelOf)` guard. Written
  // the tidy way, this test passed with that guard deleted, which made it a green tick over an
  // untested invariant. The guard has its own test below.
  const { client, rows } = fakeStore([
    {
      barcode: '0030772117484',
      ingredients: DAWN,
      source: 'off',
      confidence: 'high',
      nutrition_panel: 'absent',
    },
  ]);

  await retainProduct({
    barcode: '0030772117484',
    ingredients: DAWN,
    source: 'vision',
    panel: 'full',
    client,
  });

  assert.equal(rows[0].nutrition_panel, 'absent', 'a read with nothing to say must say nothing');
});

test('an EQUAL-rank read with nothing to say says nothing — the guard, tested on its own', async () => {
  // This is the case `if (panelOf)` exists for, and the only one that reaches it: a read that
  // outranks nothing and is outranked by nothing, carrying no panel opinion. Two vision reads
  // of the same row do that (rank 2 vs 2 → the incoming read is authoritative for the list).
  //
  // ⚠️ NO CURRENT CALL SITE PRODUCES THIS, and that is exactly why it is pinned here rather
  // than left to a comment. The OFF door always computes a panel and the vision door never
  // writes one, so the guard is protecting the NEXT writer. Delete it and this test is the only
  // thing in the suite that notices — verified by deleting it.
  const { client, rows } = fakeStore([
    {
      barcode: 'v',
      ingredients: OLIVES,
      source: 'vision',
      confidence: 'high',
      nutrition_panel: 'absent',
    },
  ]);

  await retainProduct({
    barcode: 'v',
    ingredients: `${OLIVES}, olive oil`,
    source: 'vision',
    panel: 'full',
    client,
  });

  assert.equal(rows[0].ingredients, `${OLIVES}, olive oil`, 'the equal-rank read IS authoritative for the list');
  assert.equal(rows[0].nutrition_panel, 'absent', 'and still may not erase a panel it knows nothing about');
});

test('a WEAKER read may not relabel the panel, exactly as it may not relabel the list', async () => {
  const { client, rows } = fakeStore([
    {
      barcode: 'z',
      ingredients: OLIVES,
      source: 'off',
      confidence: 'high',
      nutrition_panel: 'present',
    },
  ]);

  await retainProduct({
    barcode: 'z',
    ingredients: 'Olives, water',
    source: 'vision',
    panel: 'partial',
    nutritionPanel: 'absent',
    client,
  });

  assert.equal(rows[0].nutrition_panel, 'present', 'a cropped photo cannot declare a product panel-less');
  assert.equal(rows[0].ingredients, OLIVES, 'and the existing trust rule still holds beside it');
});

test('an equal-or-better read DOES move the panel — a corrected OFF record must land', async () => {
  const { client, rows } = fakeStore([
    {
      barcode: 'w',
      ingredients: OLIVES,
      source: 'off',
      confidence: 'high',
      nutrition_panel: 'absent',
    },
  ]);

  await retainProduct({
    barcode: 'w',
    ingredients: OLIVES,
    source: 'off',
    nutritionPanel: 'present',
    client,
  });

  assert.equal(rows[0].nutrition_panel, 'present', 'OFF filling in a panel must be able to restore the seal');
});

/* ─────────────────────── The retain side of the sequence, for real ─────────────────────── */

test('lookupProduct reads back exactly what retainProduct wrote', async () => {
  const { client } = fakeStore();
  await retainProduct({
    barcode: '0030772117484',
    name: 'Dawn',
    ingredients: DAWN,
    source: 'off',
    nutritionPanel: 'absent',
    client,
  });

  const own = await lookupProduct('0030772117484', { client });
  assert.equal(own.nutritionPanel, 'absent', 'the round trip is the claim, not either half of it');
});
