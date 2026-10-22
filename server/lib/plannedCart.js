import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { EXCLUDE_TAGS } from './list.js';
import { sanitizeList } from './cartEdit.js';
import { attachCards } from './listMatch.js';

/* SEVEN FIXED, HAND-CURATED CARTS (Devon's ruling 2026-10-20), plus garden_and_sea
   for older clients. Goals add nothing. Each slot takes the first allowed, untaken row;
   compatible hard lines keep every slot filled, other hard lines may remove slots.

   `tags` are set by hand from what the food IS, never from foodTags(): the name regex misses
   bison, lard, tallow, soup bones, mussels, scallops and miso, and a missed tag is a meat row
   in a vegan's cart. plannedCart.test.js pins every meat/seafood/egg/dairy row's tag.
   Gluten is tagged conservatively (oats for cross-contact, miso for barley koji, whole/hulled
   grain for barley and farro). */
const row = (id, section, ...tags) => Object.freeze({ id, section, tags: Object.freeze(tags) });

const slot = (...rows) => Object.freeze(rows);

export const LISTED_CARTS = Object.freeze([
  'everyday', 'mediterranean', 'farmhouse', 'nose_to_tail', 'animal_based', 'vegetarian', 'vegan',
]);

export const CART_HARD_LINES = Object.freeze({
  everyday: Object.freeze(['gluten-free', 'dairy-free']),
  mediterranean: Object.freeze(['gluten-free', 'dairy-free']),
  farmhouse: Object.freeze(['gluten-free', 'dairy-free']),
  nose_to_tail: Object.freeze(['gluten-free', 'dairy-free']),
  animal_based: Object.freeze(['gluten-free', 'dairy-free']),
  vegetarian: Object.freeze(['gluten-free', 'dairy-free', 'vegetarian']),
  vegan: Object.freeze(['gluten-free', 'dairy-free', 'vegetarian', 'vegan']),
});

// Later choices cover collisions: roots, rice, tallow or pickles may already be taken.
// Kimchi mentions fish sauce in the KB; vegetarian slots use natto instead.
export const PLANNED_CARTS = Object.freeze({
  everyday: Object.freeze([
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('salmon_wild_vs_farmed', 'seafood', 'fish')),
    slot(row('canned_fish_choosing', 'seafood', 'fish')),
    slot(row('ground_beef_lean_ratio', 'meat', 'meat')),
    slot(row('chicken_cuts_basics', 'meat', 'meat')),
    slot(row('whole_vs_reduced_fat_milk', 'eggs_dairy', 'dairy'), row('canned_coconut_milk', 'bulk_pantry')),
    slot(row('cheese_real_vs_processed', 'eggs_dairy', 'dairy'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('olives', 'bulk_pantry')),
    slot(row('grassfed_butter', 'eggs_dairy', 'dairy'), row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('olive_oil_grades', 'bulk_pantry')),
    slot(row('produce_leafy_greens', 'produce')),
    slot(row('produce_root_vegetables', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('produce_brassicas', 'produce')),
    slot(row('berries_picking', 'produce')),
    slot(row('produce_apples_pears', 'produce')),
    slot(row('produce_bananas', 'produce')),
    slot(row('sourdough', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('yogurt_plain_vs_flavored', 'eggs_dairy', 'dairy'), row('fermented_pickles', 'bulk_pantry'), row('kimchi', 'bulk_pantry', 'fish'), row('natto', 'bulk_pantry')),
    slot(row('sauerkraut', 'bulk_pantry')),
    slot(row('salt', 'bulk_pantry')),
  ]),
  mediterranean: Object.freeze([
    slot(row('white_fish', 'seafood', 'fish')),
    slot(row('chicken_cuts_basics', 'meat', 'meat')),
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('beans_dried_vs_canned', 'bulk_pantry')),
    slot(row('olive_oil_grades', 'bulk_pantry')),
    slot(row('olives', 'bulk_pantry')),
    slot(row('produce_leafy_greens', 'produce')),
    slot(row('pasta_sauce', 'bulk_pantry')),
    slot(row('fermented_pickles', 'bulk_pantry')),
    slot(row('produce_peppers', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('produce_mushrooms', 'produce')),
    slot(row('produce_citrus', 'produce')),
    slot(row('produce_stone_fruit', 'produce')),
    slot(row('dried_fruit', 'bulk_pantry')),
    slot(row('sourdough', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('pasta_dry', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('cheese_real_vs_processed', 'eggs_dairy', 'dairy'), row('egg_duck_quail', 'eggs_dairy', 'egg'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('seeds', 'bulk_pantry')),
    slot(row('yogurt_plain_vs_flavored', 'eggs_dairy', 'dairy'), row('fermented_pickles', 'bulk_pantry'), row('kimchi', 'bulk_pantry', 'fish'), row('natto', 'bulk_pantry')),
    slot(row('dried_herbs', 'bulk_pantry')),
  ]),
  farmhouse: Object.freeze([
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('chicken_cuts_basics', 'meat', 'meat')),
    slot(row('pork_cuts_and_enhanced', 'meat', 'meat')),
    slot(row('beef_cuts_basics', 'meat', 'meat')),
    slot(row('bacon', 'meat', 'meat')),
    slot(row('grassfed_butter', 'eggs_dairy', 'dairy'), row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('produce_leafy_greens', 'produce')),
    slot(row('produce_root_vegetables', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('produce_green_beans', 'produce')),
    slot(row('produce_apples_pears', 'produce')),
    slot(row('berries_picking', 'produce')),
    slot(row('sourdough', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('oats_steelcut_rolled_instant', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('whole_vs_reduced_fat_milk', 'eggs_dairy', 'dairy'), row('egg_duck_quail', 'eggs_dairy', 'egg'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('seeds', 'bulk_pantry')),
    slot(row('raw_aged_cheese', 'eggs_dairy', 'dairy'), row('egg_duck_quail', 'eggs_dairy', 'egg'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('seeds', 'bulk_pantry')),
    slot(row('sauerkraut', 'bulk_pantry')),
    slot(row('salt', 'bulk_pantry')),
    slot(row('broth', 'bulk_pantry', 'meat')),
  ]),
  nose_to_tail: Object.freeze([
    slot(row('organ_meats', 'meat', 'meat')),
    slot(row('ground_beef_lean_ratio', 'meat', 'meat')),
    slot(row('clams_mussels_oysters', 'seafood', 'fish')),
    slot(row('canned_fish_choosing', 'seafood', 'fish')),
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('lamb_goat', 'meat', 'meat')),
    slot(row('butcher_counter_asking', 'meat', 'meat')),
    slot(row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('grassfed_butter', 'eggs_dairy', 'dairy'), row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('produce_leafy_greens', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('produce_root_vegetables', 'produce')),
    slot(row('berries_picking', 'produce')),
    slot(row('produce_citrus', 'produce')),
    slot(row('rice_arsenic', 'bulk_pantry')),
    slot(row('raw_kefir', 'eggs_dairy', 'dairy'), row('fermented_pickles', 'bulk_pantry'), row('kimchi', 'bulk_pantry', 'fish'), row('natto', 'bulk_pantry')),
    slot(row('sauerkraut', 'bulk_pantry')),
    slot(row('broth', 'bulk_pantry', 'meat')),
    slot(row('salt', 'bulk_pantry')),
    slot(row('dried_herbs', 'bulk_pantry')),
  ]),
  animal_based: Object.freeze([
    slot(row('beef_cuts_basics', 'meat', 'meat')),
    slot(row('ground_beef_lean_ratio', 'meat', 'meat')),
    slot(row('lamb_goat', 'meat', 'meat')),
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('organ_meats', 'meat', 'meat')),
    slot(row('salmon_wild_vs_farmed', 'seafood', 'fish')),
    slot(row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('grassfed_butter', 'eggs_dairy', 'dairy'), row('lard_tallow', 'bulk_pantry', 'meat'), row('cooking_oils', 'bulk_pantry')),
    slot(row('fermented_pickles', 'bulk_pantry')),
    slot(row('produce_root_vegetables', 'produce')),
    slot(row('berries_picking', 'produce')),
    slot(row('produce_bananas', 'produce')),
    slot(row('produce_citrus', 'produce')),
    slot(row('produce_stone_fruit', 'produce')),
    slot(row('produce_apples_pears', 'produce')),
    slot(row('honey_adulteration', 'bulk_pantry', 'honey')),
    slot(row('maple_syrup', 'bulk_pantry')),
    slot(row('whole_vs_reduced_fat_milk', 'eggs_dairy', 'dairy'), row('egg_duck_quail', 'eggs_dairy', 'egg'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('seeds', 'bulk_pantry')),
    slot(row('raw_kefir', 'eggs_dairy', 'dairy'), row('fermented_pickles', 'bulk_pantry'), row('kimchi', 'bulk_pantry', 'fish'), row('natto', 'bulk_pantry')),
    slot(row('raw_aged_cheese', 'eggs_dairy', 'dairy'), row('egg_duck_quail', 'eggs_dairy', 'egg'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('seeds', 'bulk_pantry')),
    slot(row('salt', 'bulk_pantry')),
  ]),
  vegetarian: Object.freeze([
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('beans_dried_vs_canned', 'bulk_pantry')),
    slot(row('tempeh', 'bulk_pantry')),
    slot(row('nuts_raw_vs_roasted', 'bulk_pantry')),
    slot(row('grassfed_butter', 'eggs_dairy', 'dairy'), row('cooking_oils', 'bulk_pantry')),
    slot(row('olive_oil_grades', 'bulk_pantry')),
    slot(row('produce_leafy_greens', 'produce')),
    slot(row('produce_brassicas', 'produce')),
    slot(row('produce_peppers', 'produce')),
    slot(row('produce_mushrooms', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('produce_root_vegetables', 'produce')),
    slot(row('berries_picking', 'produce')),
    slot(row('produce_apples_pears', 'produce')),
    slot(row('produce_citrus', 'produce')),
    slot(row('sourdough', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('oats_steelcut_rolled_instant', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('raw_aged_cheese', 'eggs_dairy', 'dairy'), row('nuts_raw_vs_roasted', 'bulk_pantry'), row('seeds', 'bulk_pantry')),
    slot(row('yogurt_plain_vs_flavored', 'eggs_dairy', 'dairy'), row('fermented_pickles', 'bulk_pantry'), row('natto', 'bulk_pantry')),
    slot(row('miso', 'bulk_pantry', 'gluten'), row('fermented_pickles', 'bulk_pantry'), row('natto', 'bulk_pantry'), row('raw_cider_vinegar', 'bulk_pantry')),
    slot(row('dried_herbs', 'bulk_pantry')),
  ]),
  vegan: Object.freeze([
    slot(row('beans_dried_vs_canned', 'bulk_pantry')),
    slot(row('tempeh', 'bulk_pantry')),
    slot(row('natto', 'bulk_pantry')),
    slot(row('nuts_raw_vs_roasted', 'bulk_pantry')),
    slot(row('seeds', 'bulk_pantry')),
    slot(row('olive_oil_grades', 'bulk_pantry')),
    slot(row('cooking_oils', 'bulk_pantry')),
    slot(row('produce_leafy_greens', 'produce')),
    slot(row('produce_brassicas', 'produce')),
    slot(row('produce_mushrooms', 'produce')),
    slot(row('produce_green_beans', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('seaweed', 'bulk_pantry')),
    slot(row('berries_picking', 'produce')),
    slot(row('produce_bananas', 'produce')),
    slot(row('produce_citrus', 'produce')),
    slot(row('grains_beyond_rice', 'bulk_pantry', 'gluten'), row('rice_arsenic', 'bulk_pantry'), row('produce_root_vegetables', 'produce'), row('bulk_bins_buying', 'bulk_pantry')),
    slot(row('produce_root_vegetables', 'produce')),
    slot(row('miso', 'bulk_pantry', 'gluten'), row('fermented_pickles', 'bulk_pantry'), row('natto', 'bulk_pantry'), row('raw_cider_vinegar', 'bulk_pantry')),
    slot(row('sauerkraut', 'bulk_pantry')),
    slot(row('dried_herbs', 'bulk_pantry')),
  ]),
  garden_and_sea: Object.freeze([
    slot(row('produce_peppers', 'produce')),
    slot(row('produce_stone_fruit', 'produce')),
    slot(row('produce_green_beans', 'produce')),
    slot(row('produce_onions_garlic', 'produce')),
    slot(row('berries_picking', 'produce')),
    slot(row('ground_turkey', 'meat', 'meat')),
    slot(row('bison', 'meat', 'meat')),
    slot(row('chicken_breast', 'meat', 'meat')),
    slot(row('white_fish', 'seafood', 'fish')),
    slot(row('scallops', 'seafood', 'fish')),
    slot(row('egg_labels', 'eggs_dairy', 'egg')),
    slot(row('plain_kefir', 'eggs_dairy', 'dairy')),
    slot(row('cottage_cheese', 'eggs_dairy', 'dairy')),
    slot(row('cheese_real_vs_processed', 'eggs_dairy', 'dairy')),
    slot(row('grains_beyond_rice', 'bulk_pantry', 'gluten')),
    slot(row('rice_arsenic', 'bulk_pantry')),
    slot(row('miso', 'bulk_pantry', 'gluten')),
    slot(row('hummus', 'bulk_pantry')),
    slot(row('nut_butter_ingredients', 'bulk_pantry')),
    slot(row('frozen_vs_fresh_produce', 'frozen')),
  ]),
});

const entriesById = new Map(perimeterKb.entries.map((entry) => [entry.id, entry]));

/** The cart key a request names, or `everyday` for anything else. */
export function plannedCartKey(cart) {
  return typeof cart === 'string' && Object.hasOwn(PLANNED_CARTS, cart) ? cart : 'everyday';
}

/** Plain shopper-facing row names. The how-to-shop wording stays on the card (`cart_pick`). */
export const CART_NAMES = {
  egg_labels: 'Eggs',
  salmon_wild_vs_farmed: 'Salmon',
  canned_fish_choosing: 'Canned sardines',
  ground_beef_lean_ratio: 'Ground beef',
  chicken_cuts_basics: 'Chicken',
  whole_vs_reduced_fat_milk: 'Milk',
  canned_coconut_milk: 'Coconut milk',
  cheese_real_vs_processed: 'Cheese',
  nuts_raw_vs_roasted: 'Almonds',
  olives: 'Olives',
  grassfed_butter: 'Butter',
  lard_tallow: 'Lard or tallow',
  cooking_oils: 'Cooking oil',
  olive_oil_grades: 'Olive oil',
  produce_leafy_greens: 'Lettuce',
  produce_root_vegetables: 'Carrots and potatoes',
  produce_onions_garlic: 'Onions and garlic',
  produce_brassicas: 'Broccoli, cauliflower, or cabbage',
  berries_picking: 'Berries',
  produce_apples_pears: 'Apples or pears',
  produce_bananas: 'Bananas',
  sourdough: 'Sourdough bread',
  rice_arsenic: 'Rice',
  bulk_bins_buying: 'Lentils',
  yogurt_plain_vs_flavored: 'Yogurt',
  fermented_pickles: 'Pickles',
  kimchi: 'Kimchi',
  natto: 'Natto',
  sauerkraut: 'Sauerkraut',
  salt: 'Salt',
  white_fish: 'White fish',
  beans_dried_vs_canned: 'Beans',
  pasta_sauce: 'Pasta sauce',
  produce_peppers: 'Bell peppers',
  produce_mushrooms: 'Mushrooms',
  produce_citrus: 'Oranges, lemons, or limes',
  produce_stone_fruit: 'Peaches, plums, or cherries',
  dried_fruit: 'Dried fruit',
  pasta_dry: 'Pasta',
  egg_duck_quail: 'Duck or quail eggs',
  seeds: 'Flaxseed',
  dried_herbs: 'Dried herbs',
  pork_cuts_and_enhanced: 'Pork shoulder',
  beef_cuts_basics: 'Chuck roast',
  bacon: 'Bacon',
  produce_green_beans: 'Green beans',
  oats_steelcut_rolled_instant: 'Oats',
  raw_aged_cheese: 'Aged cheddar',
  broth: 'Broth',
  organ_meats: 'Beef liver',
  clams_mussels_oysters: 'Shellfish',
  lamb_goat: 'Lamb',
  butcher_counter_asking: 'Soup bones',
  raw_kefir: 'Kefir',
  honey_adulteration: 'Honey',
  maple_syrup: 'Maple syrup',
  tempeh: 'Tempeh',
  miso: 'Miso',
  raw_cider_vinegar: 'Apple cider vinegar',
  seaweed: 'Seaweed',
  grains_beyond_rice: 'Whole grains',
  ground_turkey: 'Ground turkey',
  bison: 'Bison',
  chicken_breast: 'Chicken breast',
  scallops: 'Scallops',
  plain_kefir: 'Kefir',
  cottage_cheese: 'Cottage cheese',
  hummus: 'Hummus',
  nut_butter_ingredients: 'Peanut butter',
  frozen_vs_fresh_produce: 'Frozen vegetables',
};

/**
 * One planned cart as an ordinary list. Rows are stamped `source: 'user'` (the ruling
 * supersedes composition rule 7) so they behave exactly like rows the shopper typed: a
 * later compose never wipes them. Names are plain (`CART_NAMES`); the card carries the how-to-shop wording.
 */
export function buildPlannedCart({ cart, nonNegotiables = [] } = {}) {
  const key = plannedCartKey(cart);
  const excluded = new Set(
    (nonNegotiables || []).flatMap((nn) => EXCLUDE_TAGS[String(nn).toLowerCase()] || [])
  );
  const taken = new Set();
  const items = PLANNED_CARTS[key].flatMap((choices) => {
    const r = choices.find((candidate) => !taken.has(candidate.id)
      && !candidate.tags.some((t) => excluded.has(t)));
    if (!r) return [];
    taken.add(r.id);
    const entry = entriesById.get(r.id);
    if (!entry?.cart_pick) throw new Error(`planned cart ${key}: ${r.id} has no cart_pick`);
    return [{ name: CART_NAMES[r.id] || entry.title, perimeterId: r.id, source: 'user' }];
  });
  return { ...attachCards(sanitizeList({ goal: null, items })), cart: key };
}
