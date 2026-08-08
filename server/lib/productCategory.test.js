// THE CATEGORY VOCABULARY, PINNED IN THE UNIT BOTH DOORS SHARE.
//
// ⚠️ THESE TESTS HAVE NEVER EXECUTED. Node is not on the machine this was written on
// (CLAUDE.md, Verifying), so what follows is SOURCE, NOT EVIDENCE. "Tests pass" is an
// assumption here and must not be repeated as a measurement — the same statement the held
// import route carries. Run `cd server && npm test` before pushing any of this.
//
// The subject is the thing this repo has been wrong about most often: a rule stated in a
// comment, correct when written, quietly untrue three edits later. Three specifically:
//
//   1. The two doors must categorise on ONE list. A second copy is how the retrieval floor
//      was wrong three times in three different ways.
//   2. An unrecognized value must collapse to `other`, never to null and never to a guess.
//      A null says "nobody looked"; `other` plus the raw string says "we looked and it did
//      not fit". Those are different facts and only one of them is diagnosable.
//   3. The OFF aisle map is ORDER-DEPENDENT. The specific sits above the generic it would
//      be eaten by, and a well-meaning alphabetical sort would break it silently.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_CATEGORIES,
  UNCATEGORIZED,
  normalizeCategory,
  categoryFromAisle,
  categoryFields,
} from './productCategory.js';
import { nonEmpty } from './testGuards.js';

// Bound at the collection, not at the loop: a module-level nonEmpty throws at import, so
// every test in this file is honest by construction rather than by discipline.
const CATEGORIES = nonEmpty(PRODUCT_CATEGORIES, 'PRODUCT_CATEGORIES', 10);

test('the vocabulary is closed, unique, and carries its own escape', () => {
  assert.equal(new Set(CATEGORIES).size, CATEGORIES.length, 'a duplicate category');
  assert.ok(CATEGORIES.includes(UNCATEGORIZED), 'the escape value is not in the list');
  for (const c of CATEGORIES) {
    assert.match(c, /^[a-z][a-z_]*$/, `${c} is not a lowercase snake_case token`);
  }
});

test('every listed category normalizes to itself', () => {
  for (const c of CATEGORIES) {
    assert.equal(normalizeCategory(c), c, `${c} did not survive its own normalizer`);
  }
});

test('an unrecognized value collapses to other — never null, never a guess', () => {
  for (const junk of ['protein bar', 'gluten free wrap', '', null, undefined, 42, 'BAR ']) {
    const out = normalizeCategory(junk);
    assert.ok(CATEGORIES.includes(out), `${JSON.stringify(junk)} produced ${out}`);
  }
  // Casing and separators are noise, not a different category.
  assert.equal(normalizeCategory('Chip-Snack'), 'chip_snack');
  assert.equal(normalizeCategory('  YOGURT '), 'yogurt');
  // But an unknown string is `other`, not a coerced near-match.
  assert.equal(normalizeCategory('protein bar'), UNCATEGORIZED);
});

test('THE ORDER OF THE OFF AISLE MAP IS LOAD-BEARING — the specific beats the generic', () => {
  // Each of these contains a substring that an earlier-or-later generic pattern would also
  // match. If the list is ever sorted alphabetically these are what go red.
  const orderTraps = [
    ['energy drinks', 'sports_energy_drink'],  // contains "drink"; must not be soda_drink
    ['peanut butter', 'nut_butter'],           // contains "butter"; must not be oil_fat
    ['breakfast cereals', 'cereal'],           // contains "bar"? no — but must not be bread
    ['tortilla chips', 'chip_snack'],          // contains "tortilla"; must not be bread
  ];
  for (const [aisle, expected] of nonEmpty(orderTraps, 'orderTraps')) {
    assert.equal(categoryFromAisle(aisle), expected, `"${aisle}" mapped wrong`);
  }
});

test('a real OFF aisle string maps, and an unmapped one is other rather than a guess', () => {
  assert.equal(categoryFromAisle('breakfast cereals'), 'cereal');
  assert.equal(categoryFromAisle('carbonated drinks'), 'soda_drink');
  assert.equal(categoryFromAisle('yogurts'), 'yogurt');
  // The honest miss. `other` here is a real answer and `category_raw` carries the evidence.
  assert.equal(categoryFromAisle('novelty gift hampers'), UNCATEGORIZED);
  assert.equal(categoryFromAisle(''), UNCATEGORIZED);
  assert.equal(categoryFromAisle(null), UNCATEGORIZED);
});

test('categoryFields never returns a category without the raw string that explains it', () => {
  // The vision door.
  const vision = categoryFields({ category: 'bar' });
  assert.equal(vision.category, 'bar');
  assert.equal(vision.category_raw, 'bar');

  // The OFF door — the aisle we already derive and used to discard.
  const off = categoryFields({ aisle: 'breakfast cereals' });
  assert.equal(off.category, 'cereal');
  assert.equal(off.category_raw, 'breakfast cereals', 'the raw aisle was not kept');

  // ⚠️ THE CASE THE COLUMN EXISTS FOR: a miss keeps what the source said, so `other` is
  // diagnosable and the vocabulary can be widened from evidence rather than from intuition.
  const miss = categoryFields({ aisle: 'novelty gift hampers' });
  assert.equal(miss.category, UNCATEGORIZED);
  assert.equal(miss.category_raw, 'novelty gift hampers');

  // Nothing at all is the only case with no raw string, and it is honest: nobody looked.
  const empty = categoryFields({});
  assert.equal(empty.category, UNCATEGORIZED);
  assert.equal(empty.category_raw, null);
});

test('free text from a model or a third party is capped before it reaches a column', () => {
  const long = 'x'.repeat(500);
  assert.ok(categoryFields({ aisle: long }).category_raw.length <= 120);
});

test('THE PROMPT AND THE VOCABULARY ARE ONE LIST — a second copy is how this drifts', async () => {
  // The prompt names the values inline, which is the only way a model can be held to them.
  // That makes it a SECOND statement of the list, so it is checked against the first rather
  // than trusted — the retrieval floor was wrong three times for exactly this reason.
  const { LABEL_VISION_SYSTEM } = await import('./labelVision.js');
  for (const c of CATEGORIES) {
    assert.ok(
      LABEL_VISION_SYSTEM.includes(c),
      `${c} is in PRODUCT_CATEGORIES but not offered to the model — it can never be returned`
    );
  }
});
