// Two-line card rule check (docs/CARD-STYLE-SAMPLES.md). Usage:
//   node scripts/twoLineCheck.js [proposals.json ...]   (from server/)
// With proposals ({id: {decision, buying_tips}}), checks them applied to an in-memory KB copy;
// without, checks the KB as it stands. Exit 1 on any violation.
import { readFileSync } from 'node:fs';
import { projectEntry } from '../lib/counterCards.js';
import { lintCard, words } from '../lib/counterCardLint.js';

const kb = JSON.parse(readFileSync(new URL('../kristy_perimeter_kb.json', import.meta.url)));
const doLines = JSON.parse(readFileSync(new URL('../lib/doLines.json', import.meta.url)));
const doFor = (id) => (Array.isArray(doLines) ? doLines.find((d) => d.slug === id || d.id === id)?.do : doLines[id]?.do ?? doLines[id]) || '';
const proposals = Object.assign({}, ...process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, 'utf8'))));
const byId = new Map(kb.entries.map((e) => [e.id, e]));
const FIRST_PERSON = /\b(I|me|my|mine|we|our|us)\b/;
const APPROVED_LONG = new Set(['ground_beef_lean_ratio', 'whole_vs_reduced_fat_milk']);
let bad = 0;
const ids = Object.keys(proposals).length ? Object.keys(proposals) : kb.entries.filter((e) => e.kind !== 'pick').map((e) => e.id);
for (const id of ids) {
  const base = byId.get(id);
  if (!base) { console.log(`${id}: NO_SUCH_ENTRY`); bad++; continue; }
  const e = { ...base, ...(proposals[id] || {}) };
  const out = [];
  const tip0 = (e.buying_tips || [])[0] || '';
  // Devon approved the CARD-STYLE-SAMPLES line 1s verbatim (2026-10-17); "10 words plus the food" lets ground beef run 12.
  if (words(e.decision) > (APPROVED_LONG.has(id) ? 12 : 10)) out.push(`LINE1_LONG ${words(e.decision)}w`);
  const card = projectEntry(e, { doLine: doFor(id) });
  if (card.look_for?.[0] !== tip0) out.push(`LINE2_NOT_FIRST_LOOK_FOR (cautionary wording or authored watch_out?)`);
  if (tip0.length > 90) out.push(`LINE2_LONG ${tip0.length}c`);
  for (const [f, v] of [['decision', e.decision], ['tip0', tip0]]) if (FIRST_PERSON.test(v)) out.push(`FIRST_PERSON ${f}`);
  if (/—/.test(e.decision) || /—/.test(tip0)) out.push('EM_DASH');
  for (const v of lintCard(card) || []) out.push(`${v.code}${v.field ? `[${v.field}]` : ''} ${v.detail || ''}`.trim());
  if (out.length) { bad++; console.log(`${id}: ${out.join(' | ')}`); }
}
console.log(`${ids.length} checked, ${bad} with violations`);
process.exit(bad ? 1 : 0);
