// Acceptance — CONSTRAINTS, the fourth preference dimension (the shopper's real-life
// circumstances). Proves the five verify criteria from the spec:
//   1. goal + focus + constraints compose — the list reflects all three at once.
//   2. the two retired goals (budget_clean / kids_snacks) migrate to goal + constraint.
//   3. a budget list favors cheap whole-food staples and NEVER states/implies a price.
//   4. a flagged product stays flagged regardless of constraints (no tier lift, no seal).
//   5. free text maps onto KNOWN goal/focus/constraint values only.
// Plus: constraints are a premium capability (free lists ignore them). Pure logic +
// source assertions — no DB, no model.
//   node scripts/constraints.livetest.js

import { readFileSync } from 'node:fs';
import { generateList } from '../lib/list.js';
import { evaluateIngredients } from '../lib/verdictEngine.js';
import {
  migratePreferences,
  CONSTRAINTS,
  CONSTRAINT_VALUES,
  GOAL_VALUES,
} from '../lib/taxonomy.js';
import { filterToTaxonomy } from '../lib/preferenceMap.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };
const src = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const names = (list) => list.items.map((i) => i.name.toLowerCase());
const has = (list, n) => names(list).includes(n.toLowerCase());

/* ───────── 1 · RESTRUCTURE + migration (criterion 2) ───────── */
console.log('\n═══ 1 · The two retired goals become goal + constraint ═══');
ck('budget_clean is no longer a goal', !GOAL_VALUES.includes('budget_clean'));
ck("kids_snacks is no longer a goal", !GOAL_VALUES.includes('kids_snacks'));
ck('there are 5 constraints', CONSTRAINT_VALUES.length === 5 && CONSTRAINTS.length === 5);
const mBudget = migratePreferences({ goal: 'budget_clean', constraints: [] });
ck('budget_clean → goal=eating_cleaner + constraint=budget',
  mBudget.goal === 'eating_cleaner' && mBudget.constraints.includes('budget'));
const mKids = migratePreferences({ goal: 'kids_snacks', constraints: ['budget'] });
ck('kids_snacks → eating_cleaner + picky_kids, composing with an existing constraint',
  mKids.goal === 'eating_cleaner' && mKids.constraints.includes('picky_kids') && mKids.constraints.includes('budget'));
const mKeep = migratePreferences({ goal: 'high_protein', constraints: ['budget'] });
ck('a current goal is untouched (constraints pass through)',
  mKeep.goal === 'high_protein' && mKeep.constraints.length === 1);
ck('"family" stays a goal (whose cart), distinct from the picky_kids constraint',
  GOAL_VALUES.includes('family') && CONSTRAINT_VALUES.includes('picky_kids'));

/* ───────── 2 · The list reflects goal + focus + constraints at once (criterion 1) ───────── */
console.log('\n═══ 2 · goal=high_protein + focus=lower_sodium + constraints=[budget, short_on_time] ═══');
const combo = generateList({
  goal: 'high_protein',
  focuses: ['lower_sodium'],
  constraints: ['budget', 'short_on_time'],
  premium: true,
});
ck('the goal anchor is present (Chicken breast)', has(combo, 'Chicken breast'));
ck('the focus item is present (Unsalted nuts, lower_sodium)', has(combo, 'Unsalted nuts'));
ck('a budget staple is present (Whole chicken)', has(combo, 'Whole chicken'));
ck('a short-on-time item is present (Rotisserie chicken)', has(combo, 'Rotisserie chicken'));
ck('the intro names BOTH active constraints in her voice',
  /easy on the receipt/.test(combo.intro) && /little to no cooking/.test(combo.intro));

/* ───────── 3 · Budget favors cheap staples + NEVER a price (criterion 3) ───────── */
console.log('\n═══ 3 · Budget = cost-conscious selection, never a price ═══');
const budget = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: true });
const cheapStaples = ['Whole chicken', 'Dried or canned beans', 'Brown rice', 'Frozen vegetables', 'Canned sardines or salmon', 'Potatoes'];
ck('budget pulls in cheap whole-food staples', cheapStaples.filter((s) => has(budget, s)).length >= 4);
const priceInText = (s) => /[$£€¢]|\b\d+\b|\bcents?\b|\bdollars?\b|\bcheaper by\b|\bcosts?\b/i.test(s);
ck('no item name states or implies a price', !budget.items.some((i) => priceInText(i.name)));
ck('the intro states no price', !priceInText(budget.intro));

/* ───────── 4 · A flagged product stays flagged regardless of constraints (criterion 4) ───────── */
console.log('\n═══ 4 · Constraints never move a verdict (tier / seal untouched) ═══');
// The engine never even receives constraints — they are wired only into the note.
const flaggedLabel = 'water, high fructose corn syrup, red 40';
const v = evaluateIngredients(flaggedLabel, { hardLines: [], focuses: [] });
ck(`a junk label flags (tier=${v.tier}, not approved)`, v.tier !== 'approved' && v.stamp !== true);
const verdictSrc = src('../routes/verdict.js');
ck('the route passes constraints to composeNote (the note), never to the engine',
  /composeNote\(\{[^}]*constraints/.test(verdictSrc) &&
  !/evaluateIngredients\([^)]*constraints/.test(verdictSrc));
const noteSrc = src('../lib/verdictNote.js');
ck('the note prompt marks constraints as emphasis-only, never the verdict',
  /shapes EMPHASIS and which swap you name — NEVER the verdict/.test(noteSrc));
ck('the note prompt forbids price ("BUDGET IS FOOD SELECTION, NOT PRICE")',
  /BUDGET IS FOOD SELECTION, NOT PRICE/.test(noteSrc));

/* ───────── 5 · Premium gating — free lists ignore constraints ───────── */
console.log('\n═══ 5 · Constraints are a premium capability ═══');
const freeBudget = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: false });
ck('free list adds no constraint item (Whole chicken absent)', !has(freeBudget, 'Whole chicken'));
ck('free list intro does not name the constraint (no "Kept it")', !/Kept it/.test(freeBudget.intro));
const premBudget = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: true });
ck('premium list is longer than the free one (constraint staples added)', premBudget.items.length > freeBudget.items.length);

/* ───────── 6 · Free text maps onto KNOWN values only (criterion 5) ───────── */
console.log('\n═══ 6 · "cheap, fast, kids won\'t eat fish" → known constraint values only ═══');
// The structural filter (not the prompt) is the guard: an invented constraint is dropped.
const mapped = filterToTaxonomy({
  goal: 'eating_cleaner',
  focuses: [],
  hard_lines: [],
  constraints: ['budget', 'short_on_time', 'picky_kids', 'teleport_my_groceries'],
});
ck('the three real constraints survive', ['budget', 'short_on_time', 'picky_kids'].every((c) => mapped.constraints.includes(c)));
ck('the invented constraint is dropped by the enum filter', !mapped.constraints.includes('teleport_my_groceries'));
ck('every mapped constraint is a known taxonomy value', mapped.constraints.every((c) => CONSTRAINT_VALUES.includes(c)));

console.log('\n═══ THE LINE ═══');
console.log('  constraints are CIRCUMSTANCES — budget, time, kids, kitchen, portions');
console.log('  they shape the LIST heavily and the note lightly, and NEVER a verdict tier');
console.log('  budget = cheaper FOOD, never a price we don\'t have');

console.log(`\n${fails === 0 ? 'ALL CONSTRAINT CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
process.exit(fails === 0 ? 0 : 1);
