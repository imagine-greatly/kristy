// KTIGHT L2: the ratchet ledger. A batch's cards gain pick_steps + science only when the
// batch joins DONE; the suite stays green between batches.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from '../lib/testGuards.js';
import { lintPickSteps, readability } from '../lib/counterCardLint.js';
import { projectEntry, cardToRow } from '../lib/counterCards.js';
import { questionEntries } from '../lib/perimeter.js';
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };

const BATCHES = {
  B01: ['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish', 'mercury_by_fish', 'fish_freshness_at_counter', 'canned_fish_choosing', 'farmed_fish_by_species', 'seafood_certifications'],
  B02: ['canned_tuna', 'white_fish', 'crab', 'lobster', 'scallops', 'clams_mussels_oysters', 'smoked_salmon', 'seafood_counter'],
  B03: ['beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio', 'beef_grades_usda', 'dry_brine', 'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'lamb_goat', 'organ_meats', 'bison', 'venison_game', 'meat_case'],
  B04: ['rotisserie_chicken', 'air_chilled_chicken', 'no_antibiotics_poultry', 'chicken_cuts_basics', 'turkey_whole', 'ground_turkey', 'chicken_breast', 'duck_meat', 'egg_labels', 'egg_shell_color', 'egg_freshness', 'egg_grades_sizes', 'egg_feed_claims', 'egg_storage', 'egg_duck_quail'],
  B05: ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'],
  B06: ['organic_worth_it_by_type', 'frozen_vs_fresh_produce', 'produce_seasonality', 'precut_produce_tradeoffs', 'produce_picking_ripeness', 'produce_ripeness_by_item', 'berries_picking', 'strawberries_organic_residue', 'sprouts_raw', 'produce_mushrooms', 'produce_green_beans', 'produce_stone_fruit'],
  B07: ['freezing_produce', 'washing_produce', 'baking_soda_soak', 'produce_storage', 'revive_greens', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_leafy_greens', 'produce_peppers', 'produce_apples_pears', 'produce_citrus'],
  B08: ['grassfed_butter', 'whole_vs_reduced_fat_milk', 'a2_vs_a1_milk', 'milk_processing', 'raw_milk', 'raw_kefir', 'raw_aged_cheese', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'yogurt_live_cultures', 'plain_kefir', 'cream_vs_creamer'],
  B09: ['sour_cream', 'cream_cheese', 'cottage_cheese', 'ice_cream', 'ghee', 'goat_sheep_dairy', 'oat_milk', 'almond_milk', 'soy_milk', 'coconut_milk_beverage', 'plant_butter', 'dairy_case'],
  B10: ['label_natural', 'label_made_with_real', 'label_no_added_hormones', 'label_nonGMO_vs_organic', 'label_cage_free', 'label_grass_fed_term', 'label_pasture_raised_feed', 'label_organic_scope', 'label_wild_vs_farm_raised', 'label_third_party_seals'],
  B11: ['label_multigrain_vs_whole_grain', 'label_lightly_sweetened', 'label_no_artificial_flavors', 'label_front_vs_back', 'label_ingredient_order', 'label_cold_pressed_expeller', 'label_sugar_free_substitutes', 'label_serving_size', 'label_artificial_color'],
  B12: ['rice_arsenic', 'oats_steelcut_rolled_instant', 'grains_beyond_rice', 'flour_basics', 'specialty_flours', 'sprouted_grains', 'beans_dried_vs_canned', 'bean_soak_salt', 'bulk_bins_buying', 'nuts_raw_vs_roasted', 'seeds', 'rancidity_check', 'whole_spices', 'dried_herbs'],
  B13: ['sandwich_bread', 'sourdough', 'pretzel_bread', 'bagels', 'tortillas', 'sprouted_grain_bread', 'gluten_free_bread', 'buns_rolls', 'pastries_muffins', 'bread_aisle', 'breakfast_cereal', 'muesli', 'pasta_dry'],
  B14: ['kombucha', 'sauerkraut', 'kimchi', 'fermented_pickles', 'raw_cider_vinegar', 'miso', 'tempeh', 'natto', 'fermented'],
  B15: ['olive_oil_grades', 'cooking_oils', 'lard_tallow', 'nut_butter_ingredients', 'honey_adulteration', 'maple_syrup', 'sugars', 'salt', 'cocoa', 'baking_soda_powder', 'nutritional_yeast', 'dried_fruit', 'vinegar'],
  B16: ['broth', 'canned_soup', 'canned_coconut_milk', 'pasta_sauce', 'jam', 'ketchup_mustard', 'mayo', 'hot_soy_sauce', 'condiments', 'salsa', 'olives', 'seaweed', 'coffee_beans', 'tea'],
  B17: ['bottled_water_buying', 'coconut_water', 'crackers', 'tortilla_chips', 'potato_chips', 'popcorn', 'pretzels', 'snack_bars', 'trail_mix', 'snacks'],
  B18: ['frozen_pizza', 'frozen_meals', 'frozen_fries', 'frozen_waffles', 'frozen_nuggets', 'frozen'],
};
// The spec's n column: a batch that drifts from its row is a ledger defect.
const SIZES = { B01: 8, B02: 8, B03: 14, B04: 15, B05: 11, B06: 12, B07: 12, B08: 12, B09: 12, B10: 10, B11: 9, B12: 14, B13: 13, B14: 9, B15: 13, B16: 14, B17: 10, B18: 6 };

const DONE = ['B06', 'B07', 'B01', 'B02', 'B03', 'B04', 'B05', 'B08', 'B09', 'B10', 'B11'];

const has = (e, f) => Object.prototype.hasOwnProperty.call(e, f);
const QUESTIONS = nonEmpty(questionEntries(kb.entries), 'question entries', 202);
const byId = new Map(QUESTIONS.map((e) => [e.id, e]));
const PICKS = nonEmpty(kb.entries.filter((e) => e.kind === 'pick'), 'picks');
const ALL_IDS = nonEmpty(Object.values(BATCHES).flat(), 'batched ids', 202);
const doneIds = DONE.flatMap((b) => BATCHES[b] || []);
const openIds = Object.entries(BATCHES).filter(([b]) => !DONE.includes(b)).flatMap(([, ids]) => ids);
const withFields = kb.entries.filter((e) => has(e, 'pick_steps') || has(e, 'science'));

test('T1: BATCHES matches the corpus', () => {
  nonEmpty(Object.keys(BATCHES), 'batches', 18);
  for (const [b, ids] of Object.entries(BATCHES)) assert.equal(ids.length, SIZES[b], `${b} size`);
  assert.equal(new Set(ALL_IDS).size, ALL_IDS.length, 'no id in two batches');
  for (const id of ALL_IDS) assert.ok(byId.has(id), `${id} is a question entry`);
  const batched = new Set(ALL_IDS);
  for (const e of QUESTIONS) {
    assert.ok(batched.has(e.id) || (has(e, 'pick_steps') && has(e, 'science')), `${e.id} is batched or born compliant`);
  }
  for (const b of DONE) assert.ok(BATCHES[b], `DONE names a real batch: ${b}`);
});

test('T2: every card in a DONE batch carries both fields, lint- and readability-clean', () => {
  if (DONE.length) nonEmpty(doneIds, 'done ids');
  for (const id of doneIds) {
    const e = byId.get(id);
    assert.ok(has(e, 'pick_steps') && has(e, 'science'), `${id} has both fields`);
    assert.deepEqual(lintPickSteps(e), [], id);
    assert.deepEqual(readability(e).filter((f) => f.field === 'pick_steps' || f.field === 'science'), [], id);
  }
});

test('T3: no card in a not-DONE batch carries either field', () => {
  if (DONE.length < 18) nonEmpty(openIds, 'not-done ids');
  for (const id of openIds) {
    const e = byId.get(id);
    assert.ok(!has(e, 'pick_steps') && !has(e, 'science'), `${id} gained KTIGHT fields outside DONE`);
  }
});

test('T4: any entry carrying either field passes lintPickSteps', () => {
  if (!DONE.length) assert.deepEqual(withFields.map((e) => e.id), [], 'nothing carries the fields before a batch lands');
  for (const e of withFields) assert.deepEqual(lintPickSteps(e), [], e.id);
});

test('T5: no pick carries either field', () => {
  for (const p of PICKS) assert.ok(!has(p, 'pick_steps') && !has(p, 'science'), p.id);
});

test('the fields never reach a counter_cards row (no columns: PGRST204 on migrate)', () => {
  const e = { ...structuredClone(kb.entries.find((x) => x.id === 'berries_picking')), pick_steps: ['Take a cold carton.'], science: 'Berries do not ripen after picking.' };
  const row = cardToRow(projectEntry(e));
  nonEmpty(Object.keys(row), 'row keys');
  assert.ok(!('pick_steps' in row) && !('science' in row));
});
