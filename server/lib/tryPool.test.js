import { test } from 'node:test';
import assert from 'node:assert/strict';
import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from './doLines.json' with { type: 'json' };
import { projectAll } from './counterCards.js';
import { TRY_POOL, buildTryPool } from './tryPool.js';
import { nonEmpty } from './testGuards.js';
import { supabase } from './supabase.js';
import { counterRouter } from '../routes/counter.js';

const POOL = nonEmpty(TRY_POOL, 'Try this week pool', 20);
const entriesById = new Map(perimeterKb.entries.map((entry) => [entry.id, entry]));
const cardsById = new Map(projectAll().map((card) => [card.slug, card]));
const PAID_KEYS = nonEmpty([
  'why', 'look_for', 'watch_out', 'detail', 'kristy_take', 'labels_decoded', 'sources', 'decision',
], 'paid keys', 8);

function get(url, user) {
  const parsed = new URL(url, 'http://localhost');
  const req = { method: 'GET', url, headers: {}, query: Object.fromEntries(parsed.searchParams) };
  if (user !== undefined) req.user = user;
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(body) { resolve({ status: this.statusCode, body }); },
    };
    counterRouter.handle(req, res, (err) => reject(err || new Error(`No GET route for ${url}`)));
  });
}

test('TRY_POOL is frozen with exactly 20 unique authored ids in the approved order', () => {
  assert.ok(Object.isFrozen(TRY_POOL));
  assert.equal(POOL.length, 20);
  assert.equal(new Set(POOL).size, 20);
  assert.deepEqual(POOL, [
    'ground_beef_organ_blend', 'butcher_counter_asking', 'beef_cuts_basics',
    'pork_cuts_and_enhanced', 'air_chilled_chicken', 'salmon_wild_vs_farmed',
    'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish',
    'canned_fish_choosing', 'farmed_fish_by_species', 'yogurt_live_cultures',
    'grains_beyond_rice', 'beans_dried_vs_canned', 'bulk_bins_buying',
    'oats_steelcut_rolled_instant', 'honey_adulteration', 'nuts_raw_vs_roasted',
    'sourdough', 'pretzel_bread', 'tortillas',
  ]);
  for (const id of POOL) {
    const entry = entriesById.get(id);
    assert.ok(entry, `${id}: missing KB entry`);
    assert.equal(typeof entry.cart_pick, 'string', `${id}: cart_pick must be a string`);
    assert.ok(entry.cart_pick.trim(), `${id}: empty cart_pick`);
    assert.ok(Object.hasOwn(doLines, id), `${id}: missing do line`);
  }
});

test('GET /counter/try serves only the four free keys to guests and signed-in users', async (t) => {
  const database = t.mock.method(supabase, 'from', () => { throw new Error('Unexpected database read'); });
  const auth = t.mock.method(supabase.auth, 'getUser', () => { throw new Error('Unexpected auth read'); });
  const responses = nonEmpty([
    await get('/counter/try'),
    await get('/counter/try', { id: 'member' }),
  ], 'guest and signed-in responses', 2);
  for (const { status, body } of responses) {
    assert.equal(status, 200);
    assert.deepEqual(Object.keys(body), ['items']);
    const items = nonEmpty(body.items, 'Try this week response items', 20);
    assert.equal(items.length, 20);
    assert.deepEqual(items.map((item) => item.id), POOL);
    for (const item of items) {
      assert.deepEqual(Object.keys(item).sort(), ['cart_pick', 'do', 'id', 'section']);
    }
    const serialized = JSON.stringify(body);
    for (const key of PAID_KEYS) {
      assert.doesNotMatch(serialized, new RegExp(`"${key}"\\s*:`), `${key}: paid key in response`);
    }
  }
  assert.deepEqual(responses[0].body, responses[1].body);
  assert.equal(database.mock.callCount(), 0);
  assert.equal(auth.mock.callCount(), 0);
});

test('Try this week returns byte-equal do lines and cart picks with counter sections', async () => {
  const { status, body } = await get('/counter/try');
  assert.equal(status, 200);
  for (const item of nonEmpty(body.items, 'verbatim pool items', 20)) {
    assert.equal(item.do, doLines[item.id], `${item.id}: do line changed`);
    assert.equal(item.cart_pick, entriesById.get(item.id).cart_pick, `${item.id}: cart_pick changed`);
    assert.equal(item.section, cardsById.get(item.id).section, `${item.id}: counter section changed`);
    assert.ok(item.section, `${item.id}: missing section`);
  }
});

test('two GET /counter/try calls return deterministic bodies', async () => {
  const first = await get('/counter/try');
  const second = await get('/counter/try');
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.deepEqual(first.body, second.body);
  assert.deepEqual(first.body, { items: buildTryPool() });
});

test('TRY_POOL excludes label, produce, body-claim and safety-caveat cards', () => {
  const excluded = new Set(['a2_vs_a1_milk', 'raw_milk', 'raw_kefir', 'raw_aged_cheese', 'sprouts_raw']);
  for (const id of POOL) {
    assert.doesNotMatch(id, /^(label_|produce_)/, `${id}: excluded prefix`);
    assert.ok(!excluded.has(id), `${id}: excluded card`);
    assert.notEqual(cardsById.get(id).section, 'produce', `${id}: produce card`);
    assert.equal(cardsById.get(id).kind, 'shelf', `${id}: home card`);
  }
});
