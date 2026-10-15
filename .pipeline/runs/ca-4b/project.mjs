// Offline projection only: no KB, review table, or server file is written.
import { readFileSync } from 'node:fs';
import { perimeterKb } from '../../../server/lib/perimeter.js';
import doLines from '../../../server/lib/doLines.json' with { type: 'json' };
export const ROOT = new URL('../../../', import.meta.url);
export const fragments = Object.fromEntries(['F', 'G', 'H', 'I'].map(part => [part, readFileSync(new URL(`.pipeline/specs/ca-4b-cards-${part}.md`, ROOT), 'utf8')]));
export const original = Object.assign({}, ...Object.values(fragments).flatMap(text => [...text.matchAll(/```js\n([\s\S]*?)\n```/g)].map(m => Function(`return ({${m[1]}});`)())));
export const overrides = JSON.parse(readFileSync(new URL('./overrides.json', import.meta.url), 'utf8'));
export const SPEC = structuredClone(original);
for (const [id, fields] of Object.entries(overrides.cards)) Object.assign(SPEC[id], fields);
export const DO = overrides.do;
export const IDS = Object.keys(SPEC);
export const before = structuredClone(perimeterKb);
export const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
export function project() {
  for (const [id, fields] of Object.entries(SPEC)) Object.assign(perimeterKb.entries.find(e => e.id === id), structuredClone(fields));
  Object.assign(doLines, DO);
  let reviewText = readFileSync(new URL('docs/do-lines-review.md', ROOT), 'utf8');
  reviewText = reviewText.split('\n').map(line => {
    const id = line.match(/^\| `([^`]+)` \|/)?.[1];
    if (!SPEC[id]) return line;
    const cells = line.split('|');
    cells[3] = ` ${perimeterKb.entries.find(e => e.id === id).decision} `;
    if (DO[id]) cells[4] = ` ${DO[id]} `;
    return cells.join('|');
  }).join('\n');
  return { kb: perimeterKb, doLines, reviewText };
}
