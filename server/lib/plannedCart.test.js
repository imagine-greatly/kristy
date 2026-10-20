import { test } from 'node:test';
import assert from 'node:assert/strict';
import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { nonEmpty } from './testGuards.js';
import { PLANNED_CARTS, LISTED_CARTS, CART_HARD_LINES, plannedCartKey, buildPlannedCart } from './plannedCart.js';
import { attachCards, sectionForItem } from './listMatch.js';
import { sanitizeList } from './cartEdit.js';
import { EXCLUDE_TAGS } from './list.js';
import { isPick } from './perimeter.js';
import { kindFor, sectionForCategory } from './counterCards.js';
import { HARD_LINE_VALUES } from './taxonomy.js';
import guestRouter from '../routes/guest.js';

const BY_ID = new Map(perimeterKb.entries.map((e) => [e.id, e]));
const KEYS = nonEmpty(Object.keys(PLANNED_CARTS), 'planned cart keys', 8);
const SLOTS = Object.fromEntries(KEYS.map((key) => [key, nonEmpty(PLANNED_CARTS[key], `${key} slots`, 20)]));
const rowsFor = (key) => SLOTS[key].flatMap((choices, i) => nonEmpty(choices, `${key} slot ${i}`));
const stripIds = (list) => ({ ...list, items: list.items.map(({ id, ...rest }) => rest) });

test('the seven listed carts and legacy cart are the ruled keys', () => {
  assert.deepEqual(LISTED_CARTS, ['everyday', 'mediterranean', 'farmhouse', 'nose_to_tail', 'animal_based', 'vegetarian', 'vegan']);
  assert.deepEqual(KEYS, [...LISTED_CARTS, 'garden_and_sea']);
  assert.ok(!LISTED_CARTS.includes('garden_and_sea'));
  assert.equal(plannedCartKey('garden_and_sea'), 'garden_and_sea');
  assert.ok(Object.isFrozen(PLANNED_CARTS));
  for (const k of KEYS) {
    assert.ok(Object.isFrozen(PLANNED_CARTS[k]), k);
    for (const choices of SLOTS[k]) assert.ok(Object.isFrozen(choices), k);
  }
});


test('compatibility table names exactly the supported hard lines', () => {
  assert.deepEqual(Object.keys(CART_HARD_LINES), LISTED_CARTS);
  for (const key of nonEmpty(LISTED_CARTS, 'listed carts', 7)) {
    assert.deepEqual(CART_HARD_LINES[key], [
      'gluten-free', 'dairy-free',
      ...(['vegetarian', 'vegan'].includes(key) ? ['vegetarian'] : []),
      ...(key === 'vegan' ? ['vegan'] : []),
    ], key);
  }
});

for (const key of nonEmpty(LISTED_CARTS, 'compatible carts', 7)) {
  const lines = nonEmpty(CART_HARD_LINES[key], key + ' hard lines', 2);
  // All combinations include every single and pair, plus simultaneous hard lines.
  for (let mask = 1; mask < 2 ** lines.length; mask++) {
    const chosen = lines.filter((_, i) => mask & (1 << i));
    test(key + ': all slots survive ' + chosen.join('+'), () => {
      const banned = new Set(chosen.flatMap((line) => EXCLUDE_TAGS[line]));
      const slots = nonEmpty(SLOTS[key], key + ' slots', 20);
      const items = nonEmpty(buildPlannedCart({ cart: key, nonNegotiables: chosen }).items, key + ' built');
      assert.equal(items.length, slots.length);
      assert.equal(new Set(items.map((it) => it.perimeterId)).size, items.length);
      const taken = new Set();
      slots.forEach((choices, i) => {
        const allowed = nonEmpty(choices, key + ' slot ' + i).filter((r) =>
          !taken.has(r.id) && !r.tags.some((tag) => banned.has(tag)));
        const expected = nonEmpty(allowed, key + ' surviving choices ' + i)[0];
        const it = items[i];
        assert.equal(it.perimeterId, expected.id);
        assert.ok(!expected.tags.some((tag) => banned.has(tag)));
        assert.equal(it.name, BY_ID.get(expected.id).cart_pick);
        assert.equal(it.cardSlug, expected.id);
        assert.equal(it.source, 'user');
        assert.equal(it.carded, true);
        assert.equal(sectionForItem(it), expected.section);
        taken.add(it.perimeterId);
      });
    });
  }
}

test('every authored primary and backup has safe KB copy and consistent pinned tags', () => {
  const pins = {
    meat: 'beef_grassfed_vs_grainfed beef_cuts_basics ground_beef_lean_ratio chicken_cuts_basics pork_cuts_and_enhanced bacon broth pick_soup_bones butcher_counter_asking organ_meats lamb_goat lard_tallow ground_turkey bison chicken_breast',
    fish: 'salmon_wild_vs_farmed white_fish clams_mussels_oysters canned_fish_choosing scallops kimchi',
    egg: 'egg_labels egg_duck_quail',
    dairy: 'grassfed_butter whole_vs_reduced_fat_milk raw_milk raw_kefir raw_aged_cheese cheese_real_vs_processed yogurt_plain_vs_flavored plain_kefir cottage_cheese',
    honey: 'honey_adulteration',
    gluten: 'oats_steelcut_rolled_instant sourdough pasta_dry sprouted_grain_bread miso grains_beyond_rice',
  };
  const seenTags = new Map();
  for (const r of ALL_ROWS) {
    const e = BY_ID.get(r.id);
    assert.ok(e?.cart_pick, r.id);
    assert.doesNotMatch(e.cart_pick, /seed oil|canola|soybean oil|vegetable oil|avocado oil|plant butter|oat milk/i, r.id);
    const expected = Object.entries(pins).filter(([, ids]) => ids.split(' ').includes(r.id)).map(([tag]) => tag);
    assert.deepEqual(r.tags, expected, r.id);
    if (seenTags.has(r.id)) assert.deepEqual(r.tags, seenTags.get(r.id), r.id);
    seenTags.set(r.id, r.tags);
  }
  for (const [tag, ids] of Object.entries(pins)) {
    const present = nonEmpty(ALL_ROWS.filter((r) => ids.split(' ').includes(r.id)), tag + ' rows');
    for (const r of present) assert.ok(r.tags.includes(tag), r.id);
  }
});

test('vegetarian and vegan choices preserve their philosophy without an extra hard line', () => {
  for (const key of ['vegetarian', 'vegan']) {
    const banned = EXCLUDE_TAGS[key];
    for (const r of nonEmpty(rowsFor(key), key + ' choices')) {
      assert.ok(!r.tags.some((tag) => banned.includes(tag)), key + ': ' + r.id);
    }
  }
});

test('garden_and_sea is byte-equal to the BASE literal through the original pipeline', () => {
  for (const choices of SLOTS.garden_and_sea) assert.equal(choices.length, 1);
  const baseItems = APPENDIX.garden_and_sea.split(' ').map((id) => ({
    name: BY_ID.get(id).cart_pick, perimeterId: id, source: 'user',
  }));
  const base = { ...attachCards(sanitizeList({ goal: null, items: baseItems })), cart: 'garden_and_sea' };
  assert.equal(JSON.stringify(stripIds(buildPlannedCart({ cart: 'garden_and_sea' }))), JSON.stringify(stripIds(base)));
});

test('legacy cart remains served by POST /api/guest/list', async () => {
  const { status, json } = await post({ plan: 'kristy', cart: 'garden_and_sea' }, '203.0.113.75');
  assert.equal(status, 200);
  assert.equal(json.planned, true);
  assert.deepEqual(stripIds(json.list), stripIds(buildPlannedCart({ cart: 'garden_and_sea' })));
});

test('collisions move forward to the next untaken backup', () => {
  const ids = (cart, nonNegotiables) => buildPlannedCart({ cart, nonNegotiables }).items.map((it) => it.perimeterId);
  const everyday = ids('everyday', ['gluten-free', 'dairy-free']);
  assert.equal(everyday[4], 'lard_tallow');
  assert.equal(everyday[14], 'rice_arsenic');
  assert.equal(everyday[15], 'bulk_bins_buying');
  assert.equal(everyday[16], 'fermented_pickles');
  const farmhouse = ids('farmhouse', ['dairy-free']);
  assert.equal(farmhouse[5], 'lard_tallow');
  assert.equal(farmhouse[6], 'cooking_oils');
  assert.equal(farmhouse[15], 'egg_duck_quail');
  assert.equal(farmhouse[16], 'nuts_raw_vs_roasted');
  const vegetarian = ids('vegetarian', ['vegetarian', 'gluten-free', 'dairy-free']);
  assert.deepEqual(ids('vegetarian', ['gluten-free', 'dairy-free']), vegetarian);
  assert.equal(vegetarian[17], 'seeds');
  assert.equal(vegetarian[18], 'fermented_pickles');
  assert.equal(vegetarian[19], 'natto');
  const animal = ids('animal_based', ['vegan']);
  assert.ok(animal.length < SLOTS.animal_based.length);
  assert.ok(!animal.includes('honey_adulteration'));
});

// Opt-in verification output: the requested carts, names only, one line each.
if (process.env.PRINT_PLANNED_CART_NAMES === '1') {
  for (const [cart, nonNegotiables] of [
    ['everyday', []],
    ['everyday', ['gluten-free', 'dairy-free']],
    ['vegan', ['vegan', 'gluten-free']],
  ]) console.log(buildPlannedCart({ cart, nonNegotiables }).items.map((it) => it.name).join(' | '));
}


for (const key of KEYS) {
  test(`${key}: one primary per slot, every section at its authored count`, () => {
    const list = buildPlannedCart({ cart: key });
    const items = nonEmpty(list.items, `${key} items`, 20);
    assert.equal(items.length, SLOTS[key].length);
    assert.equal(list.cart, key);
    assert.equal(list.goal, null);
    const counts = {};
    for (const it of items) {
      const s = sectionForItem(it);
      counts[s] = (counts[s] || 0) + 1;
    }
    const expectedCounts = {};
    for (const section of APPENDIX_SECTIONS[key].split(' ')) expectedCounts[section] = (expectedCounts[section] || 0) + 1;
    assert.deepEqual(counts, expectedCounts);
    // The authored section column agrees with where the row actually displays.
    for (const [i, [r]] of SLOTS[key].entries()) assert.equal(sectionForItem(items[i]), r.section, r.id);
  });

  test(`${key}: every row is its own card's cart_pick, byte-equal, stamped user`, () => {
    const items = nonEmpty(buildPlannedCart({ cart: key }).items, `${key} items`, 20);
    items.forEach((it, i) => {
      const id = PLANNED_CARTS[key][i][0].id;
      assert.equal(it.name, BY_ID.get(id).cart_pick, id);
      assert.equal(it.perimeterId, id);
      assert.equal(it.cardSlug, id);
      assert.equal(it.source, 'user');
      assert.equal(it.carded, true);
    });
  });

  test(`${key}: no home, label_terms or pick ids`, () => {
    for (const { id } of nonEmpty(rowsFor(key), key, 20)) {
      const e = BY_ID.get(id);
      assert.ok(e, `${id} missing from KB`);
      assert.equal(isPick(e), false, `${id} is a pick`);
      assert.notEqual(kindFor(id), 'home', `${id} is home`);
      assert.notEqual(sectionForCategory(e.category), 'label_terms', `${id} is label_terms`);
    }
  });

  test(`${key}: tags cover what the food is (a missed tag leaks past a hard line)`, () => {
    for (const r of nonEmpty(rowsFor(key), key, 20)) {
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

const ALL_ROWS = nonEmpty(KEYS.flatMap(rowsFor), 'all authored rows');
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
      const full = SLOTS[key].filter(([r]) => r.tags.some((t) => banned.includes(t)));
      nonEmpty(ALL_ROWS.filter((r) => r.tags.some((t) => banned.includes(t))), `rows a ${line} line must drop`);
      const items = nonEmpty(buildPlannedCart({ cart: key, nonNegotiables: [line] }).items, `${key} ${line}`);
      if (key === 'garden_and_sea') assert.equal(items.length, 20 - full.length, `${key} ${line}`);
      else assert.ok(items.length >= SLOTS[key].length - full.length, `${key} ${line}`);
      for (const [r] of full) assert.ok(!items.some((it) => it.perimeterId === r.id), r.id);
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

// Independent primary fixtures: Devon's seven carts, with existing KB stand-ins.
// garden_and_sea is the literal 20-row order at BASE 64485ea.
const APPENDIX = {
  everyday: 'egg_labels salmon_wild_vs_farmed ground_beef_lean_ratio chicken_cuts_basics grassfed_butter olive_oil_grades produce_leafy_greens produce_root_vegetables produce_onions_garlic produce_brassicas produce_peppers berries_picking produce_apples_pears produce_bananas oats_steelcut_rolled_instant sourdough yogurt_plain_vs_flavored sauerkraut salt dried_herbs',
  mediterranean: 'white_fish chicken_cuts_basics egg_labels beans_dried_vs_canned olive_oil_grades olives produce_leafy_greens pasta_sauce fermented_pickles produce_peppers produce_onions_garlic produce_mushrooms produce_citrus produce_stone_fruit dried_fruit sourdough pasta_dry cheese_real_vs_processed yogurt_plain_vs_flavored dried_herbs',
  farmhouse: 'egg_labels chicken_cuts_basics pork_cuts_and_enhanced beef_cuts_basics bacon grassfed_butter lard_tallow produce_leafy_greens produce_root_vegetables produce_onions_garlic produce_green_beans produce_apples_pears berries_picking sourdough oats_steelcut_rolled_instant whole_vs_reduced_fat_milk raw_aged_cheese sauerkraut salt broth',
  nose_to_tail: 'organ_meats ground_beef_lean_ratio clams_mussels_oysters canned_fish_choosing egg_labels lamb_goat butcher_counter_asking lard_tallow grassfed_butter produce_leafy_greens produce_onions_garlic produce_root_vegetables berries_picking produce_citrus rice_arsenic raw_kefir sauerkraut broth salt dried_herbs',
  animal_based: 'beef_cuts_basics ground_beef_lean_ratio lamb_goat egg_labels organ_meats salmon_wild_vs_farmed lard_tallow grassfed_butter fermented_pickles produce_root_vegetables berries_picking produce_bananas produce_citrus produce_stone_fruit produce_apples_pears honey_adulteration maple_syrup whole_vs_reduced_fat_milk raw_kefir raw_aged_cheese salt',
  vegetarian: 'egg_labels beans_dried_vs_canned tempeh nuts_raw_vs_roasted grassfed_butter olive_oil_grades produce_leafy_greens produce_brassicas produce_peppers produce_mushrooms produce_onions_garlic produce_root_vegetables berries_picking produce_apples_pears produce_citrus sourdough oats_steelcut_rolled_instant raw_aged_cheese yogurt_plain_vs_flavored miso dried_herbs',
  vegan: 'beans_dried_vs_canned tempeh natto nuts_raw_vs_roasted seeds olive_oil_grades cooking_oils produce_leafy_greens produce_brassicas produce_mushrooms produce_green_beans produce_onions_garlic seaweed berries_picking produce_bananas produce_citrus grains_beyond_rice produce_root_vegetables miso sauerkraut dried_herbs',
  garden_and_sea: 'produce_peppers produce_stone_fruit produce_green_beans produce_onions_garlic berries_picking ground_turkey bison chicken_breast white_fish scallops egg_labels plain_kefir cottage_cheese cheese_real_vs_processed grains_beyond_rice rice_arsenic miso hummus nut_butter_ingredients frozen_vs_fresh_produce',
};
const APPENDIX_SECTIONS = {
  everyday: 'eggs_dairy seafood meat meat eggs_dairy bulk_pantry produce produce produce produce produce produce produce produce bulk_pantry bulk_pantry eggs_dairy bulk_pantry bulk_pantry bulk_pantry',
  mediterranean: 'seafood meat eggs_dairy bulk_pantry bulk_pantry bulk_pantry produce bulk_pantry bulk_pantry produce produce produce produce produce bulk_pantry bulk_pantry bulk_pantry eggs_dairy eggs_dairy bulk_pantry',
  farmhouse: 'eggs_dairy meat meat meat meat eggs_dairy bulk_pantry produce produce produce produce produce produce bulk_pantry bulk_pantry eggs_dairy eggs_dairy bulk_pantry bulk_pantry bulk_pantry',
  nose_to_tail: 'meat meat seafood seafood eggs_dairy meat meat bulk_pantry eggs_dairy produce produce produce produce produce bulk_pantry eggs_dairy bulk_pantry bulk_pantry bulk_pantry bulk_pantry',
  animal_based: 'meat meat meat eggs_dairy meat seafood bulk_pantry eggs_dairy bulk_pantry produce produce produce produce produce produce bulk_pantry bulk_pantry eggs_dairy eggs_dairy eggs_dairy bulk_pantry',
  vegetarian: 'eggs_dairy bulk_pantry bulk_pantry bulk_pantry eggs_dairy bulk_pantry produce produce produce produce produce produce produce produce produce bulk_pantry bulk_pantry eggs_dairy eggs_dairy bulk_pantry bulk_pantry',
  vegan: 'bulk_pantry bulk_pantry bulk_pantry bulk_pantry bulk_pantry bulk_pantry bulk_pantry produce produce produce produce produce bulk_pantry produce produce produce bulk_pantry produce bulk_pantry bulk_pantry bulk_pantry',
  garden_and_sea: 'produce produce produce produce produce meat meat meat seafood seafood eggs_dairy eggs_dairy eggs_dairy eggs_dairy bulk_pantry bulk_pantry bulk_pantry bulk_pantry bulk_pantry frozen',
};

test('each cart is the Appendix, ids and sections in order', () => {
  for (const key of KEYS) {
    assert.deepEqual(PLANNED_CARTS[key].map(([r]) => r.id), APPENDIX[key].split(' '), key);
    assert.deepEqual(PLANNED_CARTS[key].map(([r]) => r.section), APPENDIX_SECTIONS[key].split(' '), key);
    assert.deepEqual(buildPlannedCart({ cart: key }).items.map((r) => r.perimeterId), APPENDIX[key].split(' '), `${key} built`);
  }
});

test('honey is tagged and never reaches a vegan cart', () => {
  const honey = rowsFor('animal_based').find((r) => r.id === 'honey_adulteration');
  assert.ok(honey?.tags.includes('honey'));
  assert.ok(buildPlannedCart({ cart: 'animal_based' }).items.some((r) => r.perimeterId === 'honey_adulteration'));
  assert.ok(!buildPlannedCart({ cart: 'animal_based', nonNegotiables: ['vegan'] }).items.some((r) => r.perimeterId === 'honey_adulteration'));
});
