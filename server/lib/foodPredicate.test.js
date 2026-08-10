// ONE PREDICATE, MULTIPLE INPUTS — "nothing confirms this is a food label we read".
//
// The three gates this replaces were three conditions that happened to agree, and each had
// its own hole: the panel gate could not see a category, the category could not see the
// document, and both were conditioned on a tier that meant a product was protected from the
// food treatment only by containing a flagged food ingredient.
//
// ⚠️ **EVERY ASSERTION BELOW WAS PROVEN TO FAIL BEFORE IT WAS TRUSTED** (commit, plant,
// revert — CLAUDE.md's working discipline). The rows are named after the real barcodes they
// came from so a future session can re-run them against production rather than against this
// file's idea of them.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateIngredients,
  nothingConfirmsFood,
  readsAsNutrientPanel,
  buildUnverifiedRead,
  tokenizeIngredients,
} from './verdictEngine.js';

// The live ingredient texts, as `pickEnglishText` actually returns them from Open Food Facts.
// Measured 2026-08-10 — not paraphrased, because a fixture copied from an idea of a record
// inherits the idea rather than the record.
const SIDI_ALI = 'sodium, calcium, magnesium, potassium, bicarbonates, sulfates, chlorides,';
const DYED_DAWN =
  'WATER, SODIUM, LAURYL SULFATE, LAURAMINE OXIDE, DECETH-8, PHENOXYETHANOL, C9-11 PARETH-8, ' +
  'ALCOHOL DENAT., SODIUM CHLORIDE, CHLOROXYLENOL, PPG-26, PEI-14 PEG-24/PPG-16 COPOLYMER, ' +
  'FRAGRANCE/PARFUM, YELLOW 5, BLUE 1';
const NUTELLA =
  'Sugar, palm oil, HAZELNUTS 13%, skimmed MILK powder 8.7%, low-fat cocoa 7.4%, ' +
  'emulsifiers: lecithin [SOYA]; vanillin. Gluten free';

const toks = (s) => tokenizeIngredients(s);

/* ── the content signal ──────────────────────────────────────────────────────────────── */

test('readsAsNutrientPanel: a mineral analysis is not an ingredient list', () => {
  assert.equal(readsAsNutrientPanel(toks(SIDI_ALI)), true);
});

test('readsAsNutrientPanel: a real food label is not a panel', () => {
  assert.equal(readsAsNutrientPanel(toks(NUTELLA)), false);
  assert.equal(readsAsNutrientPanel(toks(DYED_DAWN)), false);
});

test('readsAsNutrientPanel: an empty list asserts nothing (never vacuously true)', () => {
  // `[].every()` is `true`, which is the findings family's first member. If this ever flips,
  // an unreadable list starts withholding the seal for the wrong reason.
  assert.equal(readsAsNutrientPanel([]), false);
  assert.equal(readsAsNutrientPanel(null), false);
});

test('readsAsNutrientPanel: ONE non-nutrient token is enough to make it a list', () => {
  assert.equal(readsAsNutrientPanel(['sodium', 'calcium', 'water']), false);
});

/* ── the exclusions: mineral compounds that are genuinely food ───────────────────────── */

test('the mineral foods keep their seal — salt, baking soda, cream of tartar', () => {
  for (const food of ['salt', 'sea salt', 'sodium chloride', 'sodium bicarbonate',
    'baking soda', 'cream of tartar', 'potassium bitartrate']) {
    assert.equal(readsAsNutrientPanel([food]), false, `${food} must not read as a panel`);
  }
});

test('the deny-set survives a widening of NUTRIENT_NAMES', () => {
  // The point of a deny-set rather than an absence: a future session adding the ion that the
  // next mineral water names must not silently re-capture salt. A mixed list containing an
  // excluded food stands down as a whole.
  assert.equal(readsAsNutrientPanel(['sodium', 'calcium', 'salt']), false);
});

test('the exclusions cost nothing on the case the rule exists for', () => {
  // Verified rather than assumed: none of Sidi Ali's seven tokens is an excluded compound.
  assert.equal(readsAsNutrientPanel(toks(SIDI_ALI)), true);
});

/* ── the predicate: the three inputs, and the OR that makes (c) reachable ────────────── */

test('(c) is an OR — a vouching category does NOT rescue a mineral analysis', () => {
  // Sidi Ali IS water and water IS food, so the category exemption legitimately vouches for
  // the product. The misread is about the DOCUMENT. If this ever returns false, (c) has been
  // ANDed in and is unreachable exactly where it is needed.
  assert.equal(
    nothingConfirmsFood({
      tokens: toks(SIDI_ALI),
      nutrition: { nutritionPanel: 'absent', category: 'water' },
    }),
    true,
  );
});

test('(c) fires even when a panel is PRESENT — the 0 kcal water', () => {
  // 0 is not null, so a water declaring zero calories has `nutritionPanel: 'present'`. The
  // product-level half stands down and the document-level half must still catch it. This is
  // also why the copy may not name the panel.
  assert.equal(
    nothingConfirmsFood({
      tokens: toks(SIDI_ALI),
      nutrition: { nutritionPanel: 'present', category: 'water' },
    }),
    true,
  );
});

test('an allowlisted category exempts a product with an ordinary list', () => {
  assert.equal(
    nothingConfirmsFood({
      tokens: toks('spring water'),
      nutrition: { nutritionPanel: 'absent', category: 'water' },
    }),
    false,
  );
});

test('`other` and NULL are BOTH non-exempt, permanently', () => {
  // The live table's argument: of its four `nutrition_panel: 'absent'` rows, two are waters
  // and two are dish soap. Any rule shaped like "we have a category, so trust it" exempts
  // dish soap.
  for (const category of ['other', null, undefined, '', 'OTHER']) {
    assert.equal(
      nothingConfirmsFood({ tokens: toks('spring water'), nutrition: { nutritionPanel: 'absent', category } }),
      true,
      `category ${JSON.stringify(category)} must not exempt`,
    );
  }
});

test('the exemption is exact-match and never a substring', () => {
  // It must never ride on `categoryFromAisle`'s `includes` matching, which is what lets
  // `watermelons` become a drink. A value that merely contains "water" is not the category.
  assert.equal(
    nothingConfirmsFood({ tokens: toks('spring water'), nutrition: { nutritionPanel: 'absent', category: 'watermelon' } }),
    true,
  );
});

test('`unknown` withholds nothing — the photo path is untouched', () => {
  // The photo path discards calories deliberately, so it reports no panel at all. A two-state
  // read here would strip the seal off every product a shopper photographs.
  assert.equal(nothingConfirmsFood({ tokens: toks(NUTELLA), nutrition: null }), false);
  assert.equal(
    nothingConfirmsFood({ tokens: toks(NUTELLA), nutrition: { nutritionPanel: 'unknown' } }),
    false,
  );
});

/* ── the decoupling: the tier is no longer an input ──────────────────────────────────── */

test('THE DYED DAWN: a flagged non-food is caught, on a non-approved tier', () => {
  const v = evaluateIngredients(DYED_DAWN, { nutrition: { nutritionPanel: 'absent', category: 'other' } });
  assert.notEqual(v.tier, 'approved', 'precondition: it matches yellow_5 / blue_1');
  assert.equal(v.unverifiedAsFood, true, 'the tier must not be able to protect it');
  assert.ok(v.unverifiedRead, 'the withheld read is populated on every tier');
});

test('FLAGS STAND — withholding never silences a warning', () => {
  const v = evaluateIngredients(DYED_DAWN, { nutrition: { nutritionPanel: 'absent', category: 'other' } });
  assert.ok(v.universalLayer.length > 0, 'a matched concern was really printed and stays');
  assert.equal(v.stamp, false);
  assert.equal(v.approvedRead, null);
});

test('a full-panel food is untouched by all of it — the control', () => {
  const v = evaluateIngredients(NUTELLA, { nutrition: { nutritionPanel: 'present', category: 'other' } });
  assert.equal(v.unverifiedAsFood, false);
  assert.equal(v.unverifiedRead, null);
});

/* ── the copy ────────────────────────────────────────────────────────────────────────── */

test('the withheld read is ONE sentence that states the standard, not the product', () => {
  const read = buildUnverifiedRead(SIDI_ALI);
  assert.equal(read.why, 'The seal is earned on a food label, and nothing here confirms one.');
  // The old clause became false under (c) — a 0 kcal water HAS a panel. Pinned absent rather
  // than merely pinning the new wording present, so it cannot quietly come back.
  assert.ok(!/no panel to read/i.test(read.why), 'the panel clause may not return');
  assert.equal(read.why.split('.').filter((s) => s.trim()).length, 1, 'one sentence, one claim');
});
