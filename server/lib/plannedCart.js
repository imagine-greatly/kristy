import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { EXCLUDE_TAGS } from './list.js';
import { sanitizeList } from './cartEdit.js';
import { attachCards } from './listMatch.js';

/* THREE FIXED, HAND-CURATED CARTS (docs/PLANNED-CART-PLAN.md, Appendix + Devon's ruling
   2026-10-20). Not random, and goals add nothing: every shopper sees the same three, and a
   hard line only removes rows.

   `tags` are set by hand from what the food IS, never from foodTags(): the name regex misses
   bison, lard, tallow, soup bones, mussels, scallops and miso, and a missed tag is a meat row
   in a vegan's cart. plannedCart.test.js pins every meat/seafood/egg/dairy row's tag.
   Gluten is tagged conservatively (oats for cross-contact, miso for barley koji, whole/hulled
   grain for barley and farro). */
const row = (id, section, ...tags) => Object.freeze({ id, section, tags: Object.freeze(tags) });

export const PLANNED_CARTS = Object.freeze({
  everyday: Object.freeze([
    row('produce_leafy_greens', 'produce'),
    row('berries_picking', 'produce'),
    row('produce_root_vegetables', 'produce'),
    row('produce_onions_garlic', 'produce'),
    row('produce_bananas', 'produce'),
    row('beef_grassfed_vs_grainfed', 'meat', 'meat'),
    row('chicken_cuts_basics', 'meat', 'meat'),
    row('pork_cuts_and_enhanced', 'meat', 'meat'),
    row('salmon_wild_vs_farmed', 'seafood', 'fish'),
    row('canned_fish_choosing', 'seafood', 'fish'),
    row('egg_labels', 'eggs_dairy', 'egg'),
    row('grassfed_butter', 'eggs_dairy', 'dairy'),
    row('whole_vs_reduced_fat_milk', 'eggs_dairy', 'dairy'),
    row('yogurt_plain_vs_flavored', 'eggs_dairy', 'dairy'),
    row('olive_oil_grades', 'bulk_pantry'),
    row('oats_steelcut_rolled_instant', 'bulk_pantry', 'gluten'),
    row('beans_dried_vs_canned', 'bulk_pantry'),
    row('nuts_raw_vs_roasted', 'bulk_pantry'),
    row('honey_adulteration', 'bulk_pantry', 'honey'),
    row('frozen_vs_fresh_produce', 'frozen'),
  ]),
  nose_to_tail: Object.freeze([
    row('produce_brassicas', 'produce'),
    row('sprouts_raw', 'produce'),
    row('produce_mushrooms', 'produce'),
    row('produce_citrus', 'produce'),
    row('produce_apples_pears', 'produce'),
    row('organ_meats', 'meat', 'meat'),
    row('lamb_goat', 'meat', 'meat'),
    row('butcher_counter_asking', 'meat', 'meat'),
    row('shrimp_imported_vs_domestic', 'seafood', 'fish'),
    row('farmed_fish_by_species', 'seafood', 'fish'),
    row('egg_duck_quail', 'eggs_dairy', 'egg'),
    row('raw_kefir', 'eggs_dairy', 'dairy'),
    row('raw_aged_cheese', 'eggs_dairy', 'dairy'),
    row('ghee', 'eggs_dairy', 'dairy'),
    row('sauerkraut', 'bulk_pantry'),
    row('lard_tallow', 'bulk_pantry', 'meat'),
    row('raw_cider_vinegar', 'bulk_pantry'),
    row('sprouted_grain_bread', 'bulk_pantry', 'gluten'),
    row('seeds', 'bulk_pantry'),
    row('frozen_vs_fresh_produce', 'frozen'),
  ]),
  garden_and_sea: Object.freeze([
    row('produce_peppers', 'produce'),
    row('produce_stone_fruit', 'produce'),
    row('produce_green_beans', 'produce'),
    row('produce_onions_garlic', 'produce'),
    row('berries_picking', 'produce'),
    row('ground_turkey', 'meat', 'meat'),
    row('bison', 'meat', 'meat'),
    row('chicken_breast', 'meat', 'meat'),
    row('white_fish', 'seafood', 'fish'),
    row('scallops', 'seafood', 'fish'),
    row('egg_labels', 'eggs_dairy', 'egg'),
    row('plain_kefir', 'eggs_dairy', 'dairy'),
    row('cottage_cheese', 'eggs_dairy', 'dairy'),
    row('cheese_real_vs_processed', 'eggs_dairy', 'dairy'),
    row('grains_beyond_rice', 'bulk_pantry', 'gluten'),
    row('rice_arsenic', 'bulk_pantry'),
    row('miso', 'bulk_pantry', 'gluten'),
    row('hummus', 'bulk_pantry'),
    row('nut_butter_ingredients', 'bulk_pantry'),
    row('frozen_vs_fresh_produce', 'frozen'),
  ]),
});

const entriesById = new Map(perimeterKb.entries.map((entry) => [entry.id, entry]));

/** The cart key a request names, or `everyday` for anything else. */
export function plannedCartKey(cart) {
  return typeof cart === 'string' && Object.hasOwn(PLANNED_CARTS, cart) ? cart : 'everyday';
}

/**
 * One planned cart as an ordinary list. Rows are stamped `source: 'user'` (the ruling
 * supersedes composition rule 7) so they behave exactly like rows the shopper typed: a
 * later compose never wipes them. Names are the KB `cart_pick`, byte-equal; no new copy.
 */
export function buildPlannedCart({ cart, nonNegotiables = [] } = {}) {
  const key = plannedCartKey(cart);
  const excluded = new Set(
    (nonNegotiables || []).flatMap((nn) => EXCLUDE_TAGS[String(nn).toLowerCase()] || [])
  );
  const items = PLANNED_CARTS[key]
    .filter((r) => !r.tags.some((t) => excluded.has(t)))
    .map((r) => {
      const entry = entriesById.get(r.id);
      if (!entry?.cart_pick) throw new Error(`planned cart ${key}: ${r.id} has no cart_pick`);
      return { name: entry.cart_pick, perimeterId: r.id, source: 'user' };
    });
  return { ...attachCards(sanitizeList({ goal: null, items })), cart: key };
}
