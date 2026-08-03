// The trip lifecycle, proven by RUNNING it.
//
// THE CLAIM IS A SEQUENCE, SO ONLY A SEQUENCE DEMONSTRATES IT — the same argument
// productStoreLoop.test.js makes about the self-heal loop. "One active per user", "a
// completed trip is archived rather than erased" and "same as last week reads the last
// completed one" are statements about what happens over time, and reading the source can
// only ever show that the code looks right.
//
// The fake client is a Map with just enough PostgREST shape to run the real functions
// unmodified. It enforces the partial unique index itself, because that constraint is the
// thing holding "one active trip" up and a fake that ignored it would let a bug through.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  activeTrip,
  lastCompletedTrip,
  completeTrip,
  startNewTrip,
  insertTrip,
  adoptLegacyList,
  activeTripOrAdopt,
  buildNextTripList,
  seedItem,
} from './trips.js';
import { nonEmpty } from './testGuards.js';

/* ═══════════════ A fake Supabase, honest about the one constraint that matters ═══════════════ */

function fakeClient() {
  const rows = [];
  const api = {
    rows,
    from() {
      let filters = [];
      let order = null;
      let limit = null;
      const q = {
        select() { return q; },
        eq(col, val) { filters.push([col, val]); return q; },
        gte(col, val) { filters.push(['__gte', [col, val]]); return q; },
        order(col, opts) { order = [col, opts?.ascending !== false]; return q; },
        limit(n) { limit = n; return q; },
        single() { return q.then((r) => ({ data: r.data?.[0] ?? r.data ?? null, error: r.error })); },
        insert(row) {
          // THE PARTIAL UNIQUE INDEX, enforced here too. Without it this fake would happily
          // hold two active trips and the test would pass while production rejected the write.
          if (row.status === 'active' && rows.some((r) => r.user_id === row.user_id && r.status === 'active')) {
            return { select: () => ({ single: async () => ({ data: null, error: { message: 'trips_one_active' } }) }) };
          }
          const full = { started_at: new Date().toISOString(), completed_at: null, ...row };
          rows.push(full);
          return { select: () => ({ single: async () => ({ data: full, error: null }) }) };
        },
        update(patch) {
          const upd = { eq(col, val) { filters.push([col, val]); return upd; },
            select() { return upd; },
            async single() { const hit = api._match(filters)[0]; if (hit) Object.assign(hit, patch); return { data: hit || null, error: null }; },
            then(res) { const hits = api._match(filters); hits.forEach((h) => Object.assign(h, patch)); return Promise.resolve({ data: hits, error: null }).then(res); } };
          return upd;
        },
        then(resolve) {
          let out = api._match(filters);
          if (order) out = [...out].sort((a, b) => (order[1] ? 1 : -1) * String(a[order[0]] ?? '').localeCompare(String(b[order[0]] ?? '')));
          if (limit != null) out = out.slice(0, limit);
          return Promise.resolve({ data: out, error: null }).then(resolve);
        },
      };
      return q;
    },
    _match(filters) {
      return rows.filter((r) =>
        filters.every(([c, v]) => (c === '__gte' ? String(r[v[0]] ?? '') >= String(v[1]) : r[c] === v))
      );
    },
  };
  return api;
}

const USER = 'u1';
const item = (name, over = {}) => ({ id: `x-${name}`, name, category: 'Added', checked: false, source: 'user', ...over });

/* ═══════════════ The lifecycle, run start to finish ═══════════════ */

test('the full loop: build → check → complete → same as last week', async () => {
  const db = fakeClient();

  // 1. A trip, with something checked off.
  const t1 = await insertTrip(USER, { goal: 'eating_cleaner', items: [item('Blueberries'), item('Olive oil')] }, db);
  assert.ok(t1, 'the first trip was created');
  assert.equal(t1.status, 'active');
  t1.items = t1.items.map((i) => ({ ...i, checked: true, carded: true, cardSlug: 'x', cardSection: 'produce' }));

  // 2. Completing archives it. It is not deleted, and there is no active trip afterwards.
  const done = await completeTrip(USER, db);
  assert.equal(done.ok, true);
  assert.equal(done.trip.status, 'completed');
  assert.ok(done.trip.completed_at, 'completed_at is stamped');
  assert.equal(await activeTrip(USER, db), null, 'no active trip once one is finished');
  assert.equal(db.rows.length, 1, 'the finished trip still EXISTS — archived, not erased');

  // 3. "Same as last week" reads it back.
  const last = await lastCompletedTrip(USER, db);
  assert.equal(last.id, t1.id);

  const next = buildNextTripList({ completed: last, scans: [] });
  const names = nonEmpty(next.items, 'seeded items').map((i) => i.name);
  assert.deepEqual(names.sort(), ['Blueberries', 'Olive oil']);
  assert.equal(next.items.every((i) => !i.checked), true, 'everything arrives UNCHECKED');
});

test('ONE ACTIVE TRIP PER USER — the second insert is rejected', async () => {
  const db = fakeClient();
  assert.ok(await insertTrip(USER, { items: [item('Eggs')] }, db));
  assert.equal(await insertTrip(USER, { items: [item('Milk')] }, db), null, 'a second active trip must not exist');
  assert.equal(db.rows.filter((r) => r.status === 'active').length, 1);
});

/* ═══════════════ Starting over ═══════════════ */

test('an UNTOUCHED trip is reused, not archived', async () => {
  const db = fakeClient();
  await insertTrip(USER, { items: [item('Eggs')] }, db);
  const out = await startNewTrip(USER, db);
  assert.equal(out.reused, true, 'nothing was checked, so there is no history to keep');
  assert.equal(db.rows.length, 1, 'filing a no-op as history would fill the archive with nothing');
  assert.equal(db.rows[0].items.length, 0, 'and it comes back empty');
});

test('a trip with anything checked is ABANDONED, never completed', async () => {
  const db = fakeClient();
  const t = await insertTrip(USER, { items: [item('Eggs', { checked: true }), item('Milk')] }, db);
  const out = await startNewTrip(USER, db);
  assert.equal(out.reused, false);
  assert.equal(db.rows.find((r) => r.id === t.id).status, 'abandoned');
  // The distinction that matters: marking it completed would lie to the Haul and let a
  // half-built list seed the next trip.
  assert.equal(await lastCompletedTrip(USER, db), null, 'an abandoned trip is not a week worth repeating');
  assert.equal(db.rows.filter((r) => r.status === 'active').length, 1, 'a fresh one is active');
});

/* ═══════════════ What a row loses on the way into a new trip ═══════════════ */

test('a seeded row drops the trip that just ended, and keeps the groceries', () => {
  const seeded = seedItem({
    id: 'old', name: 'Whole milk', category: 'Added', source: 'user',
    checked: true, tier: 'approved', why: 'Authored line.', perimeterId: 'whole_vs_reduced_fat_milk',
    alt: 'Or plain.', offered: true, swapOffer: 'Try this?', offerId: 'o1', swapTo: 'Raw milk',
    carded: true, cardSlug: 'whole_vs_reduced_fat_milk', cardSection: 'eggs_dairy',
  });

  assert.equal(seeded.name, 'Whole milk');
  assert.equal(seeded.why, 'Authored line.', 'an authored reason is about the food, not the trip');
  assert.equal(seeded.perimeterId, 'whole_vs_reduced_fat_milk');
  assert.equal(seeded.checked, false);
  assert.equal(seeded.tier, undefined, 'a verdict belongs to the scan that produced it');
  assert.equal(seeded.offered, undefined, 'a resolved offer is spent');
  assert.equal(seeded.swapOffer, undefined);
  assert.notEqual(seeded.id, 'old', 'a new trip means new row ids');

  // THE ONE WORTH ARGUING ABOUT. Keeping the match would freeze the list against a corpus
  // that grows weekly — and an item bought every single trip is the likeliest to have had a
  // card authored for it since.
  assert.equal(seeded.carded, undefined, 'the match is re-run on the new trip');
  assert.equal(seeded.cardSlug, undefined);
});

test('a re-matched seed comes back carded, so the loop keeps up with the corpus', () => {
  const completed = { goal: null, items: [item('Blueberries'), item('Paper towels')] };
  const next = buildNextTripList({ completed, scans: [] });
  const berries = next.items.find((i) => i.name === 'Blueberries');
  const towels = next.items.find((i) => i.name === 'Paper towels');
  assert.equal(berries.cardSlug, 'berries_picking', 'it matched again on the way in');
  assert.equal(berries.cardSection, 'produce');
  assert.equal(towels.carded, true, 'and the miss was looked at exactly once');
  assert.equal(towels.cardSlug, undefined);
});

/* ═══════════════ Carry-forwards ride in as part of the seed ═══════════════ */

test('a kept scan that was never a row rides in; a flagged one arrives as a SUGGESTION', () => {
  const completed = { goal: null, items: [item('Eggs')] };
  const scans = [
    { product_name: 'Fage yogurt', tier: 'approved' },
    { product_name: 'Wonder Bread', tier: 'swap_recommended' },
  ];
  const next = buildNextTripList({ completed, scans });

  const kept = next.items.find((i) => i.name === 'Fage yogurt');
  assert.ok(kept, 'scanned with no objection → worth repeating');
  assert.equal(kept.source, 'user');
  assert.equal(kept.checked, false);

  const flagged = next.items.find((i) => i.name === 'Swap out: Wonder Bread');
  assert.ok(flagged, 'she would have picked differently → offered');
  assert.equal(flagged.source, 'swap', 'a suggestion, not a shoppable row');
  assert.equal(flagged.checked, false, 'never preselected — that would be words in their mouth');
});

test('`missed` is gone as a concept, because the whole trip seeds unchecked', () => {
  // It meant "on the cart and never checked off", and only existed because there was no
  // trip record to seed from. A row that was never checked is simply in the seed.
  const completed = { goal: null, items: [item('Sardines'), item('Eggs', { checked: true })] };
  const next = buildNextTripList({ completed, scans: [] });
  assert.equal(next.items.filter((i) => i.name === 'Sardines').length, 1, 'present exactly once');
  assert.equal(next.items.find((i) => i.name === 'Sardines').checked, false);
});

/* ═══════════════ Adoption ═══════════════ */

test('a pre-trips list becomes the first trip on first read', async () => {
  const db = fakeClient();
  const legacy = { goal: 'family', intro: 'x', items: [item('Bananas')] };
  const adopted = await activeTripOrAdopt(USER, legacy, db);
  assert.ok(adopted, 'the shopper does not lose their list');
  assert.equal(adopted.items[0].name, 'Bananas');
});

test('ADOPTION HAPPENS ONCE — completing the adopted trip does not resurrect it', async () => {
  // The bug this gate exists to prevent, run end to end. Gating on "no ACTIVE trip" instead
  // of "no trips at all" would re-adopt from shopping_lists.list on every completion,
  // forever, because that column keeps its items.
  const db = fakeClient();
  const legacy = { goal: null, intro: '', items: [item('Bananas')] };

  await activeTripOrAdopt(USER, legacy, db);
  await completeTrip(USER, db);

  const again = await activeTripOrAdopt(USER, legacy, db);
  assert.equal(again, null, 'the legacy list must not come back as a new active trip');
  assert.equal(db.rows.length, 1, 'and no second row was written');
});

test('adoption never fires for a shopper who already has trips', async () => {
  const db = fakeClient();
  await insertTrip(USER, { items: [item('Eggs')] }, db);
  assert.equal(await adoptLegacyList(USER, { items: [item('Bananas')] }, db), null);
});

test('an empty legacy list is not adopted — there is nothing to keep', async () => {
  const db = fakeClient();
  assert.equal(await adoptLegacyList(USER, { items: [] }, db), null);
  assert.equal(db.rows.length, 0);
});
