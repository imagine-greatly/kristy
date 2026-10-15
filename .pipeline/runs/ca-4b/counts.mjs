import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { lintSections } from '../../../server/lib/counterCardLint.js';
import { sectionForCategory } from '../../../server/lib/counterCards.js';
const root = new URL('../../../', import.meta.url);
const kb = JSON.parse(readFileSync(new URL('server/kristy_perimeter_kb.json', root), 'utf8'));
const IDS = ['plain_kefir', 'raw_kefir', 'sour_cream', 'cream_cheese', 'cottage_cheese', 'cheese_real_vs_processed', 'raw_aged_cheese', 'goat_sheep_dairy', 'cream_vs_creamer', 'ice_cream', 'dairy_case', 'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'plant_butter'];
const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
for (const id of IDS) if (!kb.entries.some(e => e.id === id)) throw new Error(`Missing ${id}`);
const sections = lintSections([TIP], kb.entries);
console.log(JSON.stringify({
  baseRef: 'a392e36',
  observedHead: execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim(),
  curatedCardCount: kb.entries.filter(e => e.kind !== 'pick').length,
  pickCount: kb.entries.filter(e => e.kind === 'pick').length,
  totalEntryCount: kb.entries.length,
  eggsDairyCardCount: kb.entries.filter(e => e.kind !== 'pick' && sectionForCategory(e.category) === 'eggs_dairy').length,
  ca4bCardCount: IDS.length,
  sectionHitCount: sections.length,
  sectionHitsByCode: Object.fromEntries([...new Set(sections.map(h => h.code))].map(code => [code, sections.filter(h => h.code === code).length])),
  sections,
  mixedSections: sections.filter(h => h.ids?.some(id => IDS.includes(id)) && !h.ids.every(id => IDS.includes(id))),
}, null, 2));
