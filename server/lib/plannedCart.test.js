import { test } from 'node:test';
import assert from 'node:assert/strict';
import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { nonEmpty } from './testGuards.js';
import { PLANNED_CARTS, buildPlannedCart } from './plannedCart.js';
import { sectionForItem } from './listMatch.js';
import { isPick } from './perimeter.js';
import { kindFor, sectionForCategory } from './counterCards.js';
import { HARD_LINE_VALUES } from './taxonomy.js';
import guestRouter from '../routes/guest.js';

const BY_ID = new Map(perimeterKb.entries.map((e) => [e.id, e]));
const KEYS = nonEmpty(Object.keys(PLANNED_CARTS), 'planned cart keys', 3);
const SLOTS = { produce: 5, meat: 3, seafood: 2, eggs_dairy: 4, bulk_pantry: 5, frozen: 1 };
const stripIds = (list) => ({ ...list, items: list.items.map(({ id, ...rest }) => rest) });

test('the three carts are the ruled keys', () => {
  assert.deepEqual(KEYS, ['everyday', 'nose_to_tail', 'garden_and_sea']);
  assert.ok(Object.isFrozen(PLANNED_CARTS));
  for (const k of KEYS) assert.ok(Object.isFrozen(PLANNED_CARTS[k]), k);
});

for (const key of KEYS) {
  test(`${key}: 20 rows, every section at its slot count on the displayed section`, () => {
    const list = buildPlannedCart({ cart: key });
    const items = nonEmpty(list.items, `${key} items`, 20);
    assert.equal(items.length, 20);
    assert.equal(list.cart, key);
    assert.equal(list.goal, null);
    const counts = {};
    for (const it of items) {
      const s = sectionForItem(it);
      counts[s] = (counts[s] || 0) + 1;
    }
    assert.deepEqual(counts, SLOTS);
    // The authored section column agrees with where the row actually displays.
    for (const [i, r] of PLANNED_CARTS[key].entries()) assert.equal(sectionForItem(items[i]), r.section, r.id);
  });

  test(`${key}: every row is its own card's cart_pick, byte-equal, stamped user`, () => {
    const items = nonEmpty(buildPlannedCart({ cart: key }).items, `${key} items`, 20);
    items.forEach((it, i) => {
      const id = PLANNED_CARTS[key][i].id;
      assert.equal(it.name, BY_ID.get(id).cart_pick, id);
      assert.equal(it.perimeterId, id);
      assert.equal(it.cardSlug, id);
      assert.equal(it.source, 'user');
      assert.equal(it.carded, true);
    });
  });

  test(`${key}: no home, label_terms or pick ids`, () => {
    for (const { id } of nonEmpty(PLANNED_CARTS[key], key, 20)) {
      const e = BY_ID.get(id);
      assert.ok(e, `${id} missing from KB`);
      assert.equal(isPick(e), false, `${id} is a pick`);
      assert.notEqual(kindFor(id), 'home', `${id} is home`);
      assert.notEqual(sectionForCategory(e.category), 'label_terms', `${id} is label_terms`);
    }
  });

  test(`${key}: tags cover what the food is (a missed tag leaks past a hard line)`, () => {
    for (const r of nonEmpty(PLANNED_CARTS[key], key, 20)) {
      const name = BY_ID.get(r.id).cart_pick;
      if (r.section === 'meat') assert.ok(r.tags.includes('meat'), r.id);
      if (r.section === 'seafood') assert.ok(r.tags.includes('fish'), r.id);
      if (/\beggs?\b/i.test(name)) assert.ok(r.tags.includes('egg'), r.id);
      if (r.section === 'eggs_dairy' && !/\beggs?\b/i.test(name)) assert.ok(r.tags.includes('dairy'), r.id);
      if (/\b(lard|tallow|bones?|liver)\b/i.test(name)) assert.ok(r.tags.includes('meat'), r.id);
      if (/\b(bread|wheat|barley|grain|oats|miso)\b/i.test(name)) assert.ok(r.tags.includes('gluten'), r.id);
    }
  });

  test(`${key}: no price word, day, meal name or brand in a row name`, () => {
    for (const { name } of nonEmpty(buildPlannedCart({ cart: key }).items, key, 20)) {
      assert.doesNotMatch(name, /\$|\bprice|\bcheap|\bsale\b|\bcost|\bbudget|\bdollar|\bdeal\b/i, name);
      assert.doesNotMatch(name, /\b(mon|tues|wednes|thurs|fri|satur|sun)day\b|\bweekend\b/i, name);
      assert.doesNotMatch(name, /\b(breakfast|brunch|lunch|dinner|supper|snack|meal|recipe)s?\b/i, name);
      assert.doesNotMatch(name, /[®™©]/, name);
      // A brand reads as a capitalized word mid-name; only these place/style words may.
      const caps = name.split(/\s+/).slice(1).filter((w) => /^[A-Z]/.test(w));
      for (const w of caps) assert.ok(['Greek', 'American'].includes(w), `${name}: ${w}`);
    }
  });
}

const ALL_ROWS = KEYS.flatMap((k) => PLANNED_CARTS[k]);
const tagsByName = new Map(ALL_ROWS.map((r) => [BY_ID.get(r.id).cart_pick, r.tags]));

const HARD = [
  ['vegan', ['meat', 'fish', 'egg', 'dairy', 'honey']],
  ['vegetarian', ['meat', 'fish']],
  ['dairy-free', ['dairy']],
  ['gluten-free', ['gluten']],
];
for (const [line, banned] of HARD) {
  test(`hard line ${line} drops every row tagged ${banned.join('/')}`, () => {
    assert.ok(HARD_LINE_VALUES.includes(line), `${line} is a real hard line id`);
    for (const key of KEYS) {
      const full = PLANNED_CARTS[key].filter((r) => r.tags.some((t) => banned.includes(t)));
      nonEmpty(full, `${key} rows a ${line} line must drop`);
      const items = nonEmpty(buildPlannedCart({ cart: key, nonNegotiables: [line] }).items, `${key} ${line}`);
      assert.equal(items.length, 20 - full.length, `${key} ${line}`);
      for (const it of items) assert.ok(!tagsByName.get(it.name).some((t) => banned.includes(t)), `${key} ${line}: ${it.name}`);
    }
  });
}

test('two builds are deep-equal once row ids are ignored; unknown cart is everyday', () => {
  for (const key of KEYS) assert.deepEqual(stripIds(buildPlannedCart({ cart: key })), stripIds(buildPlannedCart({ cart: key })));
  const everyday = stripIds(buildPlannedCart({ cart: 'everyday' }));
  for (const cart of [undefined, 'nope', '__proto__', 'toString', 7, ['everyday']])
    assert.deepEqual(stripIds(buildPlannedCart({ cart })), everyday, String(cart));
});

/* ═══ The real route handler, walked off the Express stack (tripGateRoutes.test.js pattern) ═══ */
const listHandler = guestRouter.stack.find((l) => l.route?.path === '/list' && l.route.methods.post)?.route.stack.at(-1).handle;

async function post(body, ip) {
  let status = 200;
  let json;
  const res = { status(c) { status = c; return this; }, json(b) { json = b; return this; } };
  await listHandler({ body, headers: { 'x-forwarded-for': ip }, ip }, res);
  return { status, json };
}

test('POST /api/guest/list {plan:kristy} serves the planned cart without goals', async () => {
  assert.ok(listHandler, 'POST /list handler found');
  const { status, json } = await post({ plan: 'kristy', cart: 'nose_to_tail' }, '203.0.113.71');
  assert.equal(status, 200);
  assert.equal(json.planned, true);
  assert.equal(json.list.cart, 'nose_to_tail');
  assert.equal(nonEmpty(json.list.items, 'route items', 20).length, 20);
  assert.ok(json.prefs);

  const vegan = await post({ plan: 'kristy', cart: 'nose_to_tail', non_negotiables: ['vegan'] }, '203.0.113.72');
  assert.equal(vegan.status, 200);
  assert.ok(vegan.json.list.items.length < 20);
});

test('POST /api/guest/list {} is still 400 goals_required', async () => {
  const { status, json } = await post({}, '203.0.113.73');
  assert.equal(status, 400);
  assert.deepEqual(json, { error: 'goals_required' });
  const notPlan = await post({ plan: 'other' }, '203.0.113.74');
  assert.equal(notPlan.status, 400);
});

// Independent of PLANNED_CARTS: the Appendix of docs/PLANNED-CART-PLAN.md, in order.
const APPENDIX = {
  everyday: 'produce_leafy_greens berries_picking produce_root_vegetables produce_onions_garlic produce_bananas beef_grassfed_vs_grainfed chicken_cuts_basics pork_cuts_and_enhanced salmon_wild_vs_farmed canned_fish_choosing egg_labels grassfed_butter whole_vs_reduced_fat_milk yogurt_plain_vs_flavored olive_oil_grades oats_steelcut_rolled_instant beans_dried_vs_canned nuts_raw_vs_roasted honey_adulteration frozen_vs_fresh_produce',
  nose_to_tail: 'produce_brassicas sprouts_raw produce_mushrooms produce_citrus produce_apples_pears organ_meats lamb_goat butcher_counter_asking shrimp_imported_vs_domestic farmed_fish_by_species egg_duck_quail raw_kefir raw_aged_cheese ghee sauerkraut lard_tallow raw_cider_vinegar sprouted_grain_bread seeds frozen_vs_fresh_produce',
  garden_and_sea: 'produce_peppers produce_stone_fruit produce_green_beans produce_onions_garlic berries_picking ground_turkey bison chicken_breast white_fish scallops egg_labels plain_kefir cottage_cheese cheese_real_vs_processed grains_beyond_rice rice_arsenic miso hummus nut_butter_ingredients frozen_vs_fresh_produce',
};
const APPENDIX_SECTIONS = [...Array(5).fill('produce'), ...Array(3).fill('meat'), ...Array(2).fill('seafood'),
  ...Array(4).fill('eggs_dairy'), ...Array(5).fill('bulk_pantry'), 'frozen'];

test('each cart is the Appendix, ids and sections in order', () => {
  for (const key of KEYS) {
    assert.deepEqual(PLANNED_CARTS[key].map((r) => r.id), APPENDIX[key].split(' '), key);
    assert.deepEqual(PLANNED_CARTS[key].map((r) => r.section), APPENDIX_SECTIONS, key);
    assert.deepEqual(buildPlannedCart({ cart: key }).items.map((r) => r.perimeterId), APPENDIX[key].split(' '), `${key} built`);
  }
});

test('honey is tagged and never reaches a vegan cart', () => {
  const honey = PLANNED_CARTS.everyday.find((r) => r.id === 'honey_adulteration');
  assert.ok(honey?.tags.includes('honey'));
  assert.ok(buildPlannedCart({ cart: 'everyday' }).items.some((r) => r.perimeterId === 'honey_adulteration'));
  assert.ok(!buildPlannedCart({ cart: 'everyday', nonNegotiables: ['vegan'] }).items.some((r) => r.perimeterId === 'honey_adulteration'));
});
