import { readFileSync } from 'node:fs';
import { lintSections } from '../../../server/lib/counterCardLint.js';
import { matchItemToCard } from '../../../server/lib/listMatch.js';
import { sectionForCategory } from '../../../server/lib/counterCards.js';
const kb = JSON.parse(readFileSync(new URL('../../../server/kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const IDS = new Set(['egg_labels', 'whole_vs_reduced_fat_milk', 'yogurt_plain_vs_flavored', 'raw_milk', 'egg_duck_quail', 'ghee', 'grassfed_butter', 'pick_egg_whites']);
const MILK_ROWS = ['milk', 'whole milk', 'a gallon of milk', 'gallon of milk', 'milk carton', 'carton of milk'];
const CART_IDS = ['egg_labels', 'whole_vs_reduced_fat_milk', 'yogurt_plain_vs_flavored', 'grassfed_butter'];
const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
for (const id of IDS) if (!kb.entries.some((e) => e.id === id)) throw new Error(`Missing ${id}`);
const hits = lintSections([TIP], kb.entries);
const mine = (h) => (h.id && IDS.has(h.id)) || (h.ids?.length && h.ids.every((id) => IDS.has(id))) || h.code === 'SECTION_TIP_HANDLING';
const match = (s) => matchItemToCard(s)?.slug ?? null;
console.log(JSON.stringify({
  curatedCardCount: kb.entries.filter((e) => e.kind !== 'pick').length,
  pickCount: kb.entries.filter((e) => e.kind === 'pick').length,
  eggsDairyCardCount: kb.entries.filter((e) => e.kind !== 'pick' && sectionForCategory(e.category) === 'eggs_dairy').length,
  sections: hits.filter(mine),
  mixedSections: hits.filter((h) => h.ids?.some((id) => IDS.has(id)) && !h.ids.every((id) => IDS.has(id))),
  milkRows: Object.fromEntries(MILK_ROWS.map((s) => [s, match(s)])),
  cartPickMatch: Object.fromEntries(CART_IDS.map((id) => {
    const e = kb.entries.find((e) => e.id === id);
    return [id, { cart_pick: e.cart_pick, characters: e.cart_pick.length, slug: match(e.cart_pick) }];
  })),
}, null, 2));
