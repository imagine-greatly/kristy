// Acceptance — Block C server core: hard-line matching + the free-text mapper.
// Everything except the two clearly-marked live checks is deterministic.
//   node scripts/preferences.livetest.js            (structural only)
//   node --use-system-ca scripts/preferences.livetest.js   (adds the 2 Haiku calls)

import 'dotenv/config';
import { evaluateIngredients } from '../lib/verdictEngine.js';
import { matchHardLines, searchIngredients, resolveHardLines } from '../lib/hardLines.js';
import { filterToTaxonomy, interpretPreferences } from '../lib/preferenceMap.js';
import { HARD_LINE_VALUES, FOCUS_VALUES, GOAL_VALUES } from '../lib/taxonomy.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };

console.log('\n═══ HARD LINES — a declared absolute escalates and gets named ═══');
const LABEL = 'water, organic oats, carrageenan';
const off = evaluateIngredients(LABEL);
const on = evaluateIngredients(LABEL, { hardLines: ['no carrageenan'] });
ck('violated line is reported with the exact ingredient that crossed it',
  on.hardLines.violated.length === 1 && on.hardLines.violated[0].names.includes('Carrageenan'));
ck('the line escalates the tier above the un-declared baseline',
  on.tier !== off.tier || off.tier === 'swap_recommended');

// A hard line must be able to move a product that would otherwise pass.
const mild = 'water, soy lecithin';
const mildOff = evaluateIngredients(mild);
const mildOn = evaluateIngredients(mild, { hardLines: ['kb:soy_lecithin'] });
ck(`a custom line escalates an otherwise-mild product (${mildOff.tier} → ${mildOn.tier})`,
  mildOn.tier !== mildOff.tier);
ck('a custom line names the KB entry the user picked',
  mildOn.hardLines.violated[0]?.label === 'no soy lecithin');

console.log('\n═══ BOUNDED — a preference can never manufacture a verdict ═══');
ck('a clean label keeps its stamp with hard lines declared',
  evaluateIngredients('organic whole milk, live active cultures', { hardLines: ['no carrageenan', 'no seed oils'] }).stamp === true);
ck('hard lines never push past swap_recommended (only a critical KB entry reaches skip)',
  evaluateIngredients('water, canola oil, red 40, bha', {
    hardLines: ['no seed oils', 'no artificial dyes'], focuses: ['additive_sensitive', 'processed_fats'],
  }).tier === 'swap_recommended');
ck('category lines cover every entry in the category',
  matchHardLines([{ id: 'sunflower_oil', name: 'Sunflower Oil' }], ['no seed oils']).length === 1);

console.log('\n═══ HONESTY — we only claim to check what the KB can check ═══');
ck('gluten-free matches nothing (the KB has no gluten data)',
  matchHardLines([{ id: 'red_40', name: 'Red 40' }], ['gluten-free']).length === 0);
ck('dairy-free is resolved as advisory, not as a matcher',
  resolveHardLines(['dairy-free'])[0].advisory === true && resolveHardLines(['dairy-free'])[0].ids.size === 0);
ck('an unknown line degrades to advisory rather than silently vanishing',
  resolveHardLines(['no unicorn tears'])[0].advisory === true);

console.log('\n═══ KB SEARCH — custom hard lines over names + aliases ═══');
ck('name hit', searchIngredients('carrag').some((r) => r.id === 'carrageenan'));
ck('alias hit resolves to the canonical entry', searchIngredients('shortening').some((r) => r.id === 'partially_hydrogenated_oil'));
ck('search returns a directly usable hard-line value', searchIngredients('carrag')[0].value === 'kb:carrageenan');
ck('a 1-char query returns nothing (no runaway list)', searchIngredients('c').length === 0);

console.log('\n═══ FREE TEXT — the structural guard, not the prompt ═══');
const evil = filterToTaxonomy({
  goal: 'cure_diabetes',
  focuses: ['lower_sugar', 'reverse_insulin_resistance'],
  hard_lines: ['no seed oils', 'no_everything_i_dislike'],
  unmapped: ['keto'],
});
ck('an invented goal is dropped', evil.goal === null);
ck('an invented focus is dropped, the real one kept',
  evil.focuses.length === 1 && evil.focuses[0] === 'lower_sugar');
ck('an invented hard line is dropped, the real one kept',
  evil.hardLines.length === 1 && evil.hardLines[0] === 'no seed oils');
ck('every taxonomy value the mapper may emit is enumerable',
  GOAL_VALUES.length > 0 && FOCUS_VALUES.length > 0 && HARD_LINE_VALUES.length > 0);

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('\n(ANTHROPIC_API_KEY unset — skipping the 2 live mapping checks)');
} else {
  console.log('\n═══ FREE TEXT (live) — maps onto known values, honest about the rest ═══');
  const a = await interpretPreferences('high protein, no seed oils, keto');
  console.log(`    → ${a.reply}`);
  ck('maps the mappable', a.goal === 'high_protein' && a.hardLines.includes('no seed oils'));
  ck('names what it could not map', a.unmapped.length > 0 && /keto/i.test(a.reply));

  const b = await interpretPreferences("shopping for my kids' lunches, nothing with carrageenan");
  console.log(`    → ${b.reply}`);
  ck('maps a goal + a custom-ish line', b.goal === 'kids_snacks' && b.hardLines.includes('no carrageenan'));
}

console.log(fails ? `\n✗ ${fails} FAILED\n` : '\n✓ all checks passed\n');
process.exit(fails ? 1 : 0);
