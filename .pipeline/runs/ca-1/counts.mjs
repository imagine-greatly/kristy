import { readFileSync } from 'node:fs';
import * as lint from '../../../server/lib/counterCardLint.js';
import { projectEntry } from '../../../server/lib/counterCards.js';

const kb = JSON.parse(readFileSync('/Users/m1/kristy/server/kristy_perimeter_kb.json', 'utf8'));
const doLines = JSON.parse(readFileSync('/Users/m1/kristy/server/lib/doLines.json', 'utf8'));
const rules = JSON.parse(readFileSync('/Users/m1/kristy/server/lib/sectionRules.json', 'utf8'));
const tally = {};
const add = (k) => { tally[k] = (tally[k] || 0) + 1; };
const call = (name, ...args) => {
  if (typeof lint[name] !== 'function') return add(`${name}:MISSING`);
  let hits;
  try { hits = lint[name](...args); } catch { return add(`${name}:THREW`); }
  if (hits && !Array.isArray(hits) && Array.isArray(hits.violations)) hits = hits.violations;
  if (!Array.isArray(hits)) return add(`${name}:NOT_ARRAY`);
  for (const h of hits) add(`${name}:${h?.code ?? 'NO_CODE'}`);
};
const projected = [];
for (const e of kb.entries) {
  for (const name of ['readability', 'lintRepeatedClaim', 'lintCulinaryAim', 'lintPickSteps']) call(name, e);
  add(`entries:${e.kind ?? 'card'}`);
  if (e.kind === 'pick') call('lintPick', e);
  else {
    const p = projectEntry(e, { doLine: doLines[e.id] || '' });
    projected.push(p);
    call('lintCard', p);
  }
}
call('lintCorpus', projected);
console.log(JSON.stringify(Object.fromEntries(Object.entries(tally).sort()), null, 1));
if (typeof lint.lintSections === 'function') {
  const forced = lint.lintSections(rules.map((r) => ({ ...r, tip_aligned: true, cards_aligned: true })), kb.entries);
  const bySection = {};
  for (const h of forced) bySection[`${h.section}:${h.code}`] = (bySection[`${h.section}:${h.code}`] || 0) + 1;
  console.error(`forced-flag lintSections: ${JSON.stringify(bySection)}`);
}
