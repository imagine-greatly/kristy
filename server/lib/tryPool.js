import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { projectAll } from './counterCards.js';

export const TRY_POOL = Object.freeze([
  'ground_beef_organ_blend',
  'butcher_counter_asking',
  'beef_cuts_basics',
  'pork_cuts_and_enhanced',
  'air_chilled_chicken',
  'salmon_wild_vs_farmed',
  'shrimp_imported_vs_domestic',
  'fresh_vs_previously_frozen_fish',
  'canned_fish_choosing',
  'farmed_fish_by_species',
  'yogurt_live_cultures',
  'grains_beyond_rice',
  'beans_dried_vs_canned',
  'bulk_bins_buying',
  'oats_steelcut_rolled_instant',
  'honey_adulteration',
  'nuts_raw_vs_roasted',
  'sourdough',
  'pretzel_bread',
  'tortillas',
]);

const entriesById = new Map(perimeterKb.entries.map((entry) => [entry.id, entry]));

export function buildTryPool() {
  // Reuse the counter's do-line join and section projection from the authored KB.
  const cardsById = new Map(
    projectAll(TRY_POOL.map((id) => entriesById.get(id))).map((card) => [card.slug, card])
  );
  return TRY_POOL.map((id) => {
    const entry = entriesById.get(id);
    const card = cardsById.get(id);
    return { id, cart_pick: entry.cart_pick, do: card.do, section: card.section };
  });
}
