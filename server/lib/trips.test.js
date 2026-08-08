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
  saveTripItems,
  importGuestTrips,
  IMPORT_MAX_TRIPS,
} from './trips.js';
import { sanitizeList } from './cartEdit.js';
import { nonEmpty } from './testGuards.js';

/* ═══════════════ A fake Supabase, honest about the one constraint that matters ═══════════════ */

/**
 * @param {object} [seed]
 * @param {object} [seed.legacyList]  a pre-trips `shopping_lists.list`, for the adoption
 *   and import paths. **The fake is table-AWARE from here on**: it used to ignore the
 *   table name entirely and answer every `from()` out of the trips array, which was
 *   harmless while trips was the only table this file touched and is not harmless now that
 *   `importGuestTrips` reads `shopping_lists` to adopt. A fake that answers the wrong table
 *   with plausible data is the findings family in miniature.
 */
function fakeClient({ legacyList = null } = {}) {
  const rows = [];
  const lists = legacyList ? [{ user_id: USER, list: legacyList }] : [];
  const api = {
    rows,
    lists,
    from(table) {
      const store = table === 'shopping_lists' ? lists : rows;
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
        // PostgREST's tolerant single: no row is `null`, not an error.
        maybeSingle() { return q.single(); },
        insert(input) {
          // THE PARTIAL UNIQUE INDEX, enforced here too. Without it this fake would happily
          // hold two active trips and the test would pass while production rejected the write.
          // Checked over the WHOLE batch before anything is pushed, so a rejected multi-row
          // insert cannot leave half of itself behind — which a real one could not either.
          const incoming = Array.isArray(input) ? input : [input];
          const activeUsers = new Set(store.filter((r) => r.status === 'active').map((r) => r.user_id));
          for (const row of incoming) {
            if (row.status !== 'active') continue;
            if (activeUsers.has(row.user_id)) return rejected({ message: 'trips_one_active' });
            activeUsers.add(row.user_id);
          }
          const added = incoming.map((row) => {
            const full = { started_at: new Date().toISOString(), completed_at: null, ...row };
            store.push(full);
            return full;
          });
          return resolved(added);
        },
        update(patch) {
          const upd = { eq(col, val) { filters.push([col, val]); return upd; },
            select() { return upd; },
            async single() { const hit = api._match(store, filters)[0]; if (hit) Object.assign(hit, patch); return { data: hit || null, error: null }; },
            then(res) { const hits = api._match(store, filters); hits.forEach((h) => Object.assign(h, patch)); return Promise.resolve({ data: hits, error: null }).then(res); } };
          return upd;
        },
        then(resolve) {
          let out = api._match(store, filters);
          if (order) out = [...out].sort((a, b) => (order[1] ? 1 : -1) * String(a[order[0]] ?? '').localeCompare(String(b[order[0]] ?? '')));
          if (limit != null) out = out.slice(0, limit);
          return Promise.resolve({ data: out, error: null }).then(resolve);
        },
      };
      return q;
    },
    _match(store, filters) {
      return store.filter((r) =>
        filters.every(([c, v]) => (c === '__gte' ? String(r[v[0]] ?? '') >= String(v[1]) : r[c] === v))
      );
    },
  };
  return api;
}

/* An insert's result, awaitable either way: `.select().single()` for one row, `.select()`
   awaited directly for a batch. Both spellings are in the shipping code. */
const resolved = (added) => ({
  select: () => ({
    single: async () => ({ data: added[0] ?? null, error: null }),
    then: (res) => Promise.resolve({ data: added, error: null }).then(res),
  }),
});
const rejected = (error) => ({
  select: () => ({
    single: async () => ({ data: null, error }),
    then: (res) => Promise.resolve({ data: null, error }).then(res),
  }),
});

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

/* ═══════════════ Bought-vs-skipped, across the boundary AND across a save ═══════════════

   THE DEFECT THIS SECTION EXISTS FOR IS INVISIBLE TO A TEST THAT NEVER SAVES. `seedItem`
   can stamp `boughtLast` correctly, the carry-forward rows can carry it, every assertion
   over the returned object can pass — and the field can still be gone from the product,
   because `sanitizeList` is a strict whitelist and a field it does not name is dropped on
   the first write. So the assertions below are made on the far side of a real save and a
   real read-back through the fake client, not on the value the seeder happened to return.

   (`buildNextTripList` sanitizes its own output, so the whitelist is in fact load-bearing
   one line before the seeder returns. That makes the first test here fail without the
   whitelist entry too — which is welcome, and not the reason the round trip is written
   out. The route is where the shopper's copy of the list is actually persisted, and that
   is the path a regression would take.) */

test('BOUGHT-VS-SKIPPED SURVIVES THE SAVE — the whole point, run as a round trip', async () => {
  const db = fakeClient();

  // A trip where one thing was bought and one thing was walked past.
  const t1 = await insertTrip(USER, { items: [item('Blueberries'), item('Olive oil')] }, db);
  t1.items = t1.items.map((i) => ({ ...i, checked: i.name === 'Blueberries' }));
  await completeTrip(USER, db);

  const seeded = buildNextTripList({ completed: await lastCompletedTrip(USER, db), scans: [] });

  // The SAVE. This is what `POST /api/list` does to the shopper's list on every mutation,
  // and it is the step that erased the field.
  const t2 = await insertTrip(USER, {}, db);
  await saveTripItems(t2.id, sanitizeList(seeded), db);

  // The READ-BACK. Off the stored row, not off the object we just built.
  const stored = nonEmpty((await activeTrip(USER, db)).items, 'stored items');
  const berries = stored.find((i) => i.name === 'Blueberries');
  const oil = stored.find((i) => i.name === 'Olive oil');

  assert.equal(berries.boughtLast, true, 'they bought it — that has to survive the write');
  assert.equal(oil.boughtLast, false, 'on the list, never ticked: the signal worth having');
  assert.equal(berries.checked, false, 'and the NEW trip still starts unchecked');
  assert.equal(oil.checked, false);
});

test('an item never seeded carries NO boughtLast — absent is not the same as skipped', () => {
  // The tri-state. A row typed this morning has not skipped anything, and collapsing it
  // into `false` would invent a week that never happened.
  const typed = nonEmpty(sanitizeList({ items: [item('Bananas')] }).items, 'typed items')[0];
  assert.equal('boughtLast' in typed, false);

  // And a `false` is preserved rather than dropped, which the truthy-spread idiom used by
  // every other optional field on the row would have got wrong.
  const skipped = sanitizeList({ items: [item('Bananas', { boughtLast: false })] }).items[0];
  assert.equal(skipped.boughtLast, false);
});

test('a carry-forward row is stamped bought; a swap SUGGESTION is not', () => {
  const completed = { goal: null, items: [item('Blueberries', { checked: true })] };
  const scans = [
    { product_name: 'Canned sardines', tier: 'approved' },
    { product_name: 'Toaster pastries', tier: 'swap_recommended' },
  ];
  const next = buildNextTripList({ completed, scans });

  const carried = next.items.find((i) => i.name === 'Canned sardines');
  assert.ok(carried, 'the scan came forward');
  assert.equal(carried.boughtLast, true, 'it was scanned in the store, which is how we know');

  const suggestion = next.items.find((i) => i.name.startsWith('Swap out:'));
  assert.ok(suggestion, 'the flagged product is still offered');
  assert.equal('boughtLast' in suggestion, false, 'they bought the product, not the suggestion');
});

test('boughtLast REPLACES, never accumulates — one hop is the whole claim', () => {
  // A row that was skipped last week and bought this week reports bought. Carrying the old
  // value forward would let a stale stamp ride under a name that says it is fresh.
  const seeded = seedItem({ ...item('Olive oil'), checked: true, boughtLast: false });
  assert.equal(seeded.boughtLast, true);

  const dropped = seedItem({ ...item('Olive oil'), checked: false, boughtLast: true });
  assert.equal(dropped.boughtLast, false);
});

/* ═══════════════ The conversion door ═══════════════

   THE ORDER IS THE WHOLE FEATURE AND IT IS SILENTLY DESTRUCTIVE BACKWARDS, so the first
   test here is a sequence rather than an assertion about a return value. Adoption is gated
   on "has this user ever had a trip at all"; import writes trips. Land the archive first
   and that gate closes forever, stranding the shopper's ACTIVE cart in
   `shopping_lists.list` — the one list they were actually holding, lost, with nothing to
   fail. Both halves live inside `importGuestTrips` for exactly that reason, and what this
   asserts is that the live cart survives an import that happens in the same breath. */

const guestTrip = (name, over = {}) => ({
  clientId: `local-${name}`,
  goal: null,
  intro: '',
  items: [item(name, { checked: true })],
  startedAt: '2026-07-24T09:00:00.000Z',
  completedAt: '2026-07-24T10:30:00.000Z',
  ...over,
});

test('ADOPT THEN IMPORT — the live cart is not stranded by the archive landing', async () => {
  const db = fakeClient({ legacyList: { goal: 'eating_cleaner', intro: '', items: [item('Bananas')] } });

  const out = await importGuestTrips(USER, { trips: [guestTrip('Blueberries'), guestTrip('Olive oil')] }, db);
  assert.equal(out.ok, true);
  assert.equal(out.active, 'adopted', 'the cart they were holding became their active trip');
  assert.equal(out.imported.length, 2, 'and both completed trips crossed');
  assert.equal(out.seedable, true, '"same as last week" is true immediately');

  // The assertion that would fail if the order were reversed: adoption would have found
  // trips and declined, and this would be null.
  const live = await activeTrip(USER, db);
  assert.ok(live, 'THE ACTIVE CART SURVIVED');
  assert.equal(live.items[0].name, 'Bananas');
  assert.equal(nonEmpty(db.rows, 'trip rows').length, 3, 'one active, two archived');
  assert.equal(db.rows.filter((r) => r.status === 'completed').length, 2);
});

test('and the imported archive is what the next trip seeds from', async () => {
  const db = fakeClient();
  await importGuestTrips(USER, { trips: [guestTrip('Blueberries')] }, db);
  const last = await lastCompletedTrip(USER, db);
  assert.ok(last, 'the converting guest has a last week');
  const next = buildNextTripList({ completed: last, scans: [] });
  const row = nonEmpty(next.items, 'seeded items')[0];
  assert.equal(row.name, 'Blueberries');
  assert.equal(row.boughtLast, true, 'their history came with it — that is the retention mechanic');
});

test('ONE SHOT — an account with trips is declined, not merged into', async () => {
  const db = fakeClient();
  await insertTrip(USER, { items: [item('Eggs')] }, db);

  const out = await importGuestTrips(USER, { trips: [guestTrip('Blueberries')] }, db);
  assert.equal(out.ok, false);
  assert.equal(out.reason, 'has_trips', 'an account with history is not converting');
  assert.equal(db.rows.length, 1, 'and nothing was written');
});

test('a replay is a decline, which is where the idempotency comes from', async () => {
  const db = fakeClient();
  const trips = [guestTrip('Blueberries')];
  assert.equal((await importGuestTrips(USER, { trips }, db)).ok, true);
  assert.equal((await importGuestTrips(USER, { trips }, db)).reason, 'has_trips');
  assert.equal(db.rows.length, 1, 'no duplicate archive');
});

/* ── Forgery ── */

test('THE YEAR 3000 CANNOT PIN ITSELF TO THE TOP OF "same as last week"', async () => {
  // Not merely wrong-looking: `lastCompletedTrip` orders by completed_at desc, so an
  // unclamped future timestamp becomes the thing EVERY future seed reads, forever, on an
  // account that has since shopped for real.
  const db = fakeClient();
  await importGuestTrips(USER, {
    trips: [
      guestTrip('Forged', { completedAt: '3000-01-01T00:00:00.000Z' }),
      guestTrip('Ancient', { completedAt: '1970-01-01T00:00:00.000Z', startedAt: '1970-01-01T00:00:00.000Z' }),
    ],
  }, db);

  const now = Date.now();
  const year = 365 * 24 * 60 * 60 * 1000;
  for (const row of nonEmpty(db.rows, 'imported rows')) {
    const at = Date.parse(row.completed_at);
    assert.ok(at <= now + 1000, `${row.items[0].name}: clamped back to now`);
    assert.ok(at >= now - year - 1000, `${row.items[0].name}: clamped forward to the floor`);
    assert.ok(Date.parse(row.started_at) <= at, 'a trip cannot finish before it began');
  }
});

test('status is SERVER-written — a client cannot post a second active trip', async () => {
  const db = fakeClient({ legacyList: { items: [item('Bananas')] } });
  await importGuestTrips(USER, {
    trips: [guestTrip('Sneaky', { status: 'active' }), guestTrip('Also', { status: 'abandoned' })],
  }, db);
  assert.equal(db.rows.filter((r) => r.status === 'active').length, 1, 'only the adopted cart is active');
  assert.equal(db.rows.filter((r) => r.status === 'completed').length, 2, 'the rest are completed, as written here');
  assert.equal(db.rows.filter((r) => r.status === 'abandoned').length, 0);
});

test('every row goes through sanitizeList, so nothing can be invented', async () => {
  const db = fakeClient();
  await importGuestTrips(USER, {
    trips: [guestTrip('Milk', {
      items: [{
        id: 'x', name: 'Whole milk', category: 'Added', checked: true, boughtLast: true,
        source: 'admin', tier: 'kristy_says_yes', why: 'x'.repeat(500), invented: 'nope',
      }],
    })],
  }, db);
  const row = nonEmpty(db.rows, 'imported rows')[0].items[0];
  assert.equal(row.source, 'user', 'an unrecognised source is rewritten');
  assert.equal(row.tier, undefined, 'an invented tier does not survive the enum guard');
  assert.equal(row.invented, undefined, 'and an unknown field is not a field');
  assert.equal(row.why.length, 200, 'lengths are capped');
  assert.equal(row.boughtLast, true, 'while the history the door exists to carry does');
});

test('an empty trip is skipped and SAID, never silently dropped', async () => {
  const db = fakeClient();
  const out = await importGuestTrips(USER, {
    trips: [guestTrip('Real'), guestTrip('Hollow', { items: [] })],
  }, db);
  assert.equal(out.imported.length, 1);
  assert.deepEqual(out.skipped, [{ clientId: 'local-Hollow', reason: 'empty' }]);
});

test('the cap is reported rather than applied quietly', async () => {
  const db = fakeClient();
  const many = Array.from({ length: IMPORT_MAX_TRIPS + 3 }, (_, i) => guestTrip(`Week ${i}`));
  const out = await importGuestTrips(USER, { trips: many }, db);
  assert.equal(out.imported.length, IMPORT_MAX_TRIPS);
  assert.equal(out.skipped.length, 3, 'a cap nobody is told about reads as "we took everything"');
  assert.equal(out.skipped.every((s) => s.reason === 'over_limit'), true);
});

test('clientId is echoed and never stored — it cannot become a row key', async () => {
  const db = fakeClient();
  const out = await importGuestTrips(USER, { trips: [guestTrip('Blueberries')] }, db);
  assert.equal(out.imported[0].clientId, 'local-Blueberries', 'the client can mark what crossed');
  assert.notEqual(out.imported[0].id, 'local-Blueberries', 'but the row id is ours');
  assert.equal(nonEmpty(db.rows, 'imported rows')[0].clientId, undefined, 'and it is not persisted');
});

test('nothing to import is still a successful adoption', async () => {
  const db = fakeClient({ legacyList: { items: [item('Bananas')] } });
  const out = await importGuestTrips(USER, { trips: [] }, db);
  assert.equal(out.ok, true);
  assert.equal(out.active, 'adopted', 'a guest with no completed trips still keeps their cart');
  assert.equal(out.seedable, false, 'and is honestly told there is no last week');
});
