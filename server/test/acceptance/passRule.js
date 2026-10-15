// Pass rule for the readability rewrites (VOICE_SPEC "Readable in the aisle"): rephrasing, never deletion.
import assert from 'node:assert/strict';
import { CULINARY_LEXICON } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

export const FROZEN = ['id', 'sources', 'aliases', 'asked_as', 'category', 'evidence_tier', 'cart_pick', 'instead', 'labels_decoded'];
export const REWRITABLE = ['decision', 'short_answer', 'why', 'buying_tips', 'watch_out', 'detail', 'kristy_take', 'tier_note', 'eyebrow_short', 'question'];
// Health-first REWRITE ids (docs/plans/card-health-first-plan.md, Piece 4): the approved plan
// re-aims cart_pick, adds asked_as/sources, drops cook-verb aliases and re-words label meanings.
// 4a, 4b and 4c ids; listed together so C12 re-anchors once.
export const HEALTH_FIRST_REWRITE = new Set([
  'ground_beef_lean_ratio', 'beef_cuts_basics', 'beef_grades_usda', 'meat_case', 'butcher_counter_asking',
  'pick_soup_bones', 'egg_grades_sizes', 'pork_cuts_and_enhanced', 'lamb_goat',
  'flour_basics', 'cooking_oils', 'salt', 'sugars', 'maple_syrup', 'cocoa', 'tea', 'broth', 'grains_beyond_rice',
  'bagels', 'pretzels', 'kimchi', 'miso', 'pick_tofu', 'goat_sheep_dairy', 'coconut_milk_beverage',
  // chf-5 fold absorbers: aliases/asked_as gained from retired cards (additive; keepsAll guards losses).
  'chicken_cuts_basics', 'beans_dried_vs_canned',
]);
// Item-card fold survivors and ladder fronts (docs/ITEM-CARDS-PLAN.md IC-3..IC-7): they gain
// aliases/asked_as/sources/labels_decoded from folded cards. chicken_cuts_basics and
// beef_cuts_basics are already in HEALTH_FIRST_REWRITE.
export const ITEM_CARD_REWRITE = new Set([
  'produce_ripeness_by_item', 'berries_picking', 'egg_labels', 'judging_meat_at_the_case', 'seafood_counter',
  'whole_vs_reduced_fat_milk', 'yogurt_plain_vs_flavored', 'plain_kefir', 'organic_worth_it_by_type',
  'beef_grassfed_vs_grainfed', 'salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'grassfed_butter',
  'produce_apples_pears', 'produce_citrus', 'produce_peppers', 'produce_leafy_greens', 'produce_root_vegetables',
  'produce_brassicas', 'produce_onions_garlic', 'produce_green_beans', 'produce_mushrooms', 'produce_stone_fruit',
]);
// Card-alignment rewrites (docs/CARD-ALIGNMENT-PLAN.md milestone 1).
export const CARD_ALIGN_REWRITE = new Set([
  'beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking',
  'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones',
  'pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast',
  'rotisserie_chicken', 'turkey_whole', 'ground_turkey',
  'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured',
  'egg_labels', 'egg_duck_quail', 'pick_egg_whites',
  'whole_vs_reduced_fat_milk', 'raw_milk', 'yogurt_plain_vs_flavored', 'grassfed_butter', 'ghee', 'plain_kefir',
  'raw_kefir', 'sour_cream', 'cream_cheese', 'cottage_cheese', 'cheese_real_vs_processed', 'raw_aged_cheese',
  'goat_sheep_dairy', 'cream_vs_creamer', 'ice_cream', 'dairy_case',
  'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'plant_butter',
]);
// alias → ids carrying it in the current KB: an item-card id may drop an alias that moved to another card.
const ALIAS_OWNERS = new Map();
for (const e of kb.entries || []) {
  for (const a of e.aliases || []) {
    if (!ALIAS_OWNERS.has(a)) ALIAS_OWNERS.set(a, new Set());
    ALIAS_OWNERS.get(a).add(e.id);
  }
}
const RELAXED = ['cart_pick', 'asked_as', 'aliases', 'sources', 'labels_decoded'];
const CA_RELAXED = ['cart_pick', 'instead', 'asked_as', 'aliases', 'labels_decoded'];
// By value: sources may be {url, ...} objects, which includes() compares by reference.
const keepsAll = (newList, oldList) => {
  const have = new Set((newList || []).map((x) => JSON.stringify(x)));
  return (oldList || []).every((x) => have.has(JSON.stringify(x)));
};

const NUMBER = /\d+(?:[.,]\d+)?%?/g;
const isEmpty = (v) => v == null || (typeof v === 'string' ? v.trim() === '' : Array.isArray(v) && v.length === 0);

export function assertPassRule(t, oldEntry, newEntry) {
  const id = oldEntry.id;
  const hf = HEALTH_FIRST_REWRITE.has(id) || ITEM_CARD_REWRITE.has(id);
  const ca = CARD_ALIGN_REWRITE.has(id);
  const rewrite = hf || ca;
  for (const f of FROZEN) {
    if ((hf && RELAXED.includes(f)) || (ca && CA_RELAXED.includes(f))) continue;
    assert.deepEqual(newEntry[f], oldEntry[f], `${id}: frozen field ${f} changed`);
  }
  if (rewrite) {
    assert.ok(keepsAll(newEntry.asked_as, oldEntry.asked_as), `${id}: asked_as lost a phrasing`);
    assert.ok(keepsAll(newEntry.sources, oldEntry.sources), `${id}: sources lost an entry`);
    for (const a of oldEntry.aliases || []) {
      if (!(newEntry.aliases || []).includes(a)) {
        assert.ok(
          CULINARY_LEXICON.test(a) || (ITEM_CARD_REWRITE.has(id) && [...(ALIAS_OWNERS.get(a) ?? [])].some((o) => o !== id)),
          `${id}: alias "${a}" dropped but is not a cook-verb alias and no other card carries it`
        );
      }
    }
    const terms = (newEntry.labels_decoded || []).map((l) => l.term);
    for (const l of oldEntry.labels_decoded || []) assert.ok(terms.includes(l.term), `${id}: label term "${l.term}" dropped`);
  }
  for (const [f, v] of Object.entries(oldEntry)) {
    if (!isEmpty(v)) assert.ok(!isEmpty(newEntry[f]), `${id}: ${f} was non-empty and is now empty`);
  }
  assert.ok((newEntry.watch_out || []).length >= (oldEntry.watch_out || []).length, `${id}: watch_out lost an item`);
  const oldText = REWRITABLE.map((f) => JSON.stringify(oldEntry[f] ?? '')).join(' ');
  // Rewritable fields only: a number surviving in a source URL is not a surviving fact.
  const newText = REWRITABLE.map((f) => JSON.stringify(newEntry[f] ?? '')).join(' ');
  for (const n of new Set(oldText.match(NUMBER) || [])) {
    assert.ok(newText.includes(n), `${id}: number ${n} from the old text is gone`);
  }
}
