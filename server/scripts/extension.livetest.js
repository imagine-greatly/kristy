// Acceptance — Dietary Focuses + Education extension. Engine + education checks are
// deterministic; the note-guardrail check makes 2 real Haiku calls.
//   node --use-system-ca scripts/extension.livetest.js   (needs ANTHROPIC_API_KEY)

import 'dotenv/config';
import { evaluateIngredients } from '../lib/verdictEngine.js';
import { selectCardIsm, ismContext } from '../lib/education.js';
import { composeNote } from '../lib/verdictNote.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };
const ism = (ingredients, opts = {}) => {
  const ev = evaluateIngredients(ingredients, opts);
  return selectCardIsm(ismContext({ matched: ev.matched, tier: ev.tier, ingredientCount: ingredients.split(',').length, focuses: opts.focuses || [] }));
};

console.log('\n═══ ENGINE ESCALATION (bounded, honest) ═══');
const p = 'canola oil, maltodextrin';
const noFocus = evaluateIngredients(p);
const bs = evaluateIngredients(p, { focuses: ['blood_sugar'] });
ck('#1 no focus → normal verdict (swap_recommended)', noFocus.tier === 'swap_recommended');
ck('#1 blood_sugar triggers + surfaces maltodextrin first', bs.focus.triggered.includes('blood_sugar') && bs.universalLayer[0].name.toLowerCase().includes('maltodextrin'));
ck('#1 bounded — never skip via focus', bs.tier === 'swap_recommended');
const dextrose = evaluateIngredients('dextrose', { focuses: ['blood_sugar'] });
ck('#1b below-cap product escalates one step (use_with_intention→swap)', evaluateIngredients('dextrose').tier === 'use_with_intention' && dextrose.tier === 'swap_recommended');
const sodOn = evaluateIngredients('sea salt, water', { focuses: ['lower_sodium'], nutrition: { sodium: 0.9 } });
const sodOff = evaluateIngredients('sea salt, water', { nutrition: { sodium: 0.9 } });
ck('#2 lower_sodium escalates a high-sodium product; off → unchanged', sodOn.tier !== 'approved' && sodOff.tier === 'approved');
const clean = evaluateIngredients('organic whole milk, live active cultures', { focuses: ['lower_sugar', 'blood_sugar', 'lower_sodium', 'heart'], nutrition: { sodium: 0.05, addedSugar: 0 } });
ck('#4 clean product keeps the stamp regardless of focuses', clean.tier === 'approved' && clean.stamp === true && clean.focus.triggered.length === 0);

console.log('\n═══ EDUCATION — one contextual ism, priority-matched ═══');
const malto = ism('maltodextrin');
ck('maltodextrin → sugar_names (not stolen by pronounce)', malto?.id === 'sugar_names');
ck('clean/approved → clean_label', ism('organic whole milk, live active cultures')?.id === 'clean_label');
ck('banned ingredient wins (priority 9)', ism('red 3, sugar')?.id === 'banned_elsewhere');
ck('lower_sodium focus → sodium_hidden ism', ism('sea salt, water', { focuses: ['lower_sodium'], nutrition: { sodium: 0.9 } })?.id === 'sodium_hidden');
ck('selection returns at most ONE (object or null)', malto === null || (typeof malto === 'object' && !!malto.id));

console.log('\n═══ NOTE GUARDRAIL (live) — preference framing, no treatment claim ═══');
const FORBIDDEN = /\b(treats?|manages?|cures?|reverses?|lowers your|prevents?|diagnos)\b|you have (diabetes|hypertension|a condition|prediabetes)|your (diabetes|condition|disease)|prescrib/i;
async function noteCheck(label, ingredients, opts, focusWord) {
  const ev = evaluateIngredients(ingredients, opts);
  const { note } = await composeNote({ tier: ev.tier, goal: 'gut health', nonNegotiables: [], matched: ev.matched, focus: ev.focus });
  console.log(`\n  ${label}: ${note}`);
  ck(`${label}: note is non-empty`, !!note?.trim());
  ck(`${label}: references the focus (${focusWord})`, new RegExp(focusWord, 'i').test(note));
  ck(`${label}: NO treatment/diagnosis claim`, !FORBIDDEN.test(note));
}
try {
  await noteCheck('blood_sugar', p, { focuses: ['blood_sugar'] }, 'blood sugar');
  await noteCheck('lower_sodium', 'sea salt, water, natural flavors', { focuses: ['lower_sodium'], nutrition: { sodium: 0.9 } }, 'sodium');
  console.log(`\n${fails === 0 ? 'ALL EXTENSION CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
  process.exit(fails === 0 ? 0 : 1);
} catch (err) {
  console.error('\nLive test error:', err?.message || err);
  process.exit(1);
}
