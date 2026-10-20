// CA-5: section rules rewritten; section lints turned on (docs/CARD-ALIGNMENT-PLAN.md CA-5). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import * as lint from '../../lib/counterCardLint.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const raw = JSON.parse(readFileSync(join(SERVER, 'lib', 'sectionRules.json'), 'utf8'));
const rows = Array.isArray(raw) ? raw : raw.sections ?? raw.rules ?? Object.values(raw).find(Array.isArray);
const row = (s) => rows.find((r) => r.section === s);
// SR (clean-pick) rewrote produce, eggs_dairy and frozen; their CA-5 strings are pinned on the 951441c ref.
const baseRows = JSON.parse(execFileSync('git', ['show', '951441c:server/lib/sectionRules.json'], { cwd: join(SERVER, '..') }).toString());
const SR_OVERLAID = new Set(['produce', 'eggs_dairy', 'frozen']);
const pinned = (s) => (SR_OVERLAID.has(s) ? baseRows : rows).find((r) => r.section === s);

const TIPS = [
  { section: 'meat', rule: 'Butcher first; at the case, grass-fed and pasture-raised.', checks: ['Ask the butcher what the animal ate and how it lived.', 'Liver and heart count too; add one now and then.', 'Packaged meat: meat, salt and spices, nothing else.'] },
  { section: 'eggs_dairy', rule: 'Hens on pasture, cows on grass, dairy with few ingredients.', checks: ['Read how the hens lived before anything else.', 'Pick cheese with a short label and nothing added.'] },
  { section: 'produce', rule: 'Organic on anything you eat the skin of.', checks: ['Buy it whole and in season.', 'Turn berry boxes over; the bottom tells the truth.'] },
  { section: 'seafood', rule: 'Wild-caught first, and ask where it was caught.', checks: ['Ask the counter where and how the fish was caught.'] },
  { section: 'bulk_pantry', rule: 'Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil.', checks: ['Skip seed oils and avocado oil, whatever the front of the package says.', 'The ingredient line tells more than the front; read it first.'] },
  { section: 'frozen', rule: 'Frozen counts as whole when the bag lists the food and nothing else.', checks: ['Frozen meals follow the pantry rule: real ingredients, natural fats.', 'Pick bags frozen solid, not clumped.'] },
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
    assert.equal(pinned(t.section).rule, t.rule, t.section);
    assert.deepEqual(pinned(t.section).checks, t.checks, t.section);
  }
});

test('C2 flags turn the section lints on', () => {
  for (const t of TIPS) {
    assert.equal(row(t.section).tip_aligned, true, `${t.section} tip_aligned`);
    assert.equal(row(t.section).cards_aligned === true, CARDS_ALIGNED.has(t.section), `${t.section} cards_aligned`);
  }
});

test('C3 sources point at cards that exist', () => {
  for (const [s, ids] of Object.entries(SOURCES)) assert.deepEqual(pinned(s).sources, ids, s);
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
