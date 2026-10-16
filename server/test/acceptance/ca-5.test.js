// CA-5: section rules rewritten; section lints turned on (docs/CARD-ALIGNMENT-PLAN.md CA-5). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const raw = JSON.parse(readFileSync(join(SERVER, 'lib', 'sectionRules.json'), 'utf8'));
const rows = Array.isArray(raw) ? raw : raw.sections ?? raw.rules ?? Object.values(raw).find(Array.isArray);
const row = (s) => rows.find((r) => r.section === s);

const TIPS = [
  { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] },
  { section: 'eggs_dairy', rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.', checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'] },
  { section: 'produce', rule: 'Choose produce grown organic or unsprayed, and pick it whole and in season.', checks: ['Local and in season comes first; ask the produce staff what that is this week.', 'Frozen fruit and vegetables with nothing added count as whole food too.'] },
  { section: 'seafood', rule: 'Wild-caught fish ate its natural diet; choose wild first and ask where it was caught.', checks: ['Ask the counter where the fish was caught and how.'] },
  { section: 'bulk_pantry', rule: 'Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil.', checks: ['Skip seed oils and avocado oil, whatever the front of the package says.', 'The ingredient line tells more than the front; read it first.'] },
  { section: 'frozen', rule: 'Frozen food counts as whole when the bag lists the food and nothing else.', checks: ['Frozen meals follow the pantry rule: real ingredients, natural fats only.'] },
];
const CARDS_ALIGNED = new Set(['meat', 'eggs_dairy']);
const SOURCES = {
  meat: ['beef_grassfed_vs_grainfed', 'butcher_counter_asking', 'organ_meats', 'deli_meat_uncured'],
  eggs_dairy: ['egg_labels', 'whole_vs_reduced_fat_milk', 'cheese_real_vs_processed'],
  produce: ['produce_ripeness_by_item'],
};

test('C1 the six tips carry the approved text in order', () => {
  assert.deepEqual(rows.map((r) => r.section), TIPS.map((t) => t.section));
  for (const t of TIPS) {
    assert.equal(row(t.section).rule, t.rule, t.section);
    assert.deepEqual(row(t.section).checks, t.checks, t.section);
  }
});

test('C2 flags turn the section lints on', () => {
  for (const t of TIPS) {
    assert.equal(row(t.section).tip_aligned, true, `${t.section} tip_aligned`);
    assert.equal(row(t.section).cards_aligned === true, CARDS_ALIGNED.has(t.section), `${t.section} cards_aligned`);
  }
});

test('C3 sources point at cards that exist', () => {
  for (const [s, ids] of Object.entries(SOURCES)) assert.deepEqual(row(s).sources, ids, s);
  const have = new Set(kb.entries.map((e) => e.id));
  for (const r of rows) for (const id of r.sources ?? []) assert.ok(have.has(id), `${r.section} source ${id} missing from the KB`);
});

test('C4 lintSections is clean with the flags on', () => {
  assert.ok(rows.some((r) => r.cards_aligned === true), 'no section has cards_aligned; the lint would be vacuous');
  assert.deepEqual(lint.lintSections(rows, kb.entries), []);
});

test('C5 tip copy passes the punctuation, price and voice greps', () => {
  for (const s of TIPS.flatMap((t) => [t.rule, ...t.checks])) {
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
    assert.doesNotMatch(s, /\bprice\b|\bcheap(er|est)?\b|\$[0-9]/i, s);
    assert.doesNotMatch(s, /\b(I|me|my)\b/, s);
  }
});
