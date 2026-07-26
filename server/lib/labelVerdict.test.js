// The label-photo path, end to end, minus the network: what VISION extracted goes
// through the EXISTING engine + KB and comes out claim-locked.
//
// This is the proof for the whole "vision as first-class fallback" idea. Vision only
// ever transcribes; every judgment below comes from kristy_ingredient_knowledge_base
// and the tier rubric that were already there. If someone later lets the vision call
// return a verdict of its own, these tests are the tripwire.

import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateIngredients } from './verdictEngine.js';
import { parseIngredientsJSON, LABEL_VISION_SYSTEM } from './labelVision.js';
import { guardIncompleteRead } from '../routes/verdict.js';

// A realistic vision reply for a mass-market snack panel.
const SNACK_REPLY = JSON.stringify({
  product_name: 'Cheddar Snack Crackers',
  brand: 'Storebrand',
  ingredients: [
    'Enriched flour',
    'Vegetable oil (canola, soybean)',
    'Cheddar cheese',
    'Salt',
    'TBHQ (preservative)',
    'Yellow 5',
    'Artificial flavors',
  ],
  panel: 'full',
});

const idsOf = (layer) => (layer || []).map((x) => x.id);

/* ─────────────── Vision extracts; the engine judges ─────────────── */

test('vision returns identity + list + panel completeness, and no judgment', () => {
  const out = parseIngredientsJSON(SNACK_REPLY);
  assert.equal(out.productName, 'Cheddar Snack Crackers');
  assert.equal(out.brand, 'Storebrand');
  assert.equal(out.panel, 'full');
  assert.equal(out.ingredients.length, 7);
  // The contract has no field a health claim could travel in.
  for (const k of Object.keys(out)) {
    assert.ok(
      ['ingredients', 'productName', 'brand', 'panel'].includes(k),
      `unexpected field from vision: ${k}`
    );
  }
});

test('the vision prompt is transcribe-only and forbids inventing identity', () => {
  assert.match(LABEL_VISION_SYSTEM, /You do not interpret, judge, rank, or comment/);
  assert.match(LABEL_VISION_SYSTEM, /never assess whether a food is healthy/);
  assert.match(LABEL_VISION_SYSTEM, /Never guess a product or brand/);
  // The honesty default on completeness.
  assert.match(LABEL_VISION_SYSTEM, /If you are unsure whether you saw the whole list, say "partial"/);
});

test("seed oils, a petroleum-derived preservative, a dye and artificial flavors all flag — from the KB", () => {
  const { ingredients } = parseIngredientsJSON(SNACK_REPLY);
  const v = evaluateIngredients(ingredients.join(', '));
  const ids = idsOf(v.universalLayer);

  // Kristy's holistic lens, applied by the existing engine to a photographed label.
  assert.ok(ids.includes('canola_oil'), 'canola flagged');
  assert.ok(ids.includes('soybean_oil'), 'soybean flagged');
  assert.ok(ids.includes('tbhq'), 'TBHQ flagged');
  assert.ok(ids.includes('yellow_5'), 'Yellow 5 flagged');
  assert.ok(ids.includes('artificial_flavors'), 'artificial flavors flagged');

  assert.equal(v.stamp, false, 'no seal on a product like this');
  assert.ok(['use_with_intention', 'swap_recommended', 'skip'].includes(v.tier), `tier was ${v.tier}`);
});

test('every flag carries an honest evidence tier, named as such', () => {
  const { ingredients } = parseIngredientsJSON(SNACK_REPLY);
  const v = evaluateIngredients(ingredients.join(', '));
  for (const item of v.universalLayer) {
    assert.ok(
      ['established', 'credible_concern', 'kristys_standard', 'time_tested'].includes(
        item.evidence_tier
      ),
      `${item.id} had tier ${item.evidence_tier}`
    );
  }
  const byId = Object.fromEntries(v.universalLayer.map((i) => [i.id, i.evidence_tier]));
  // Her standard is labelled HER standard; a documented concern is labelled that.
  assert.equal(byId.canola_oil, 'kristys_standard');
  assert.equal(byId.tbhq, 'credible_concern');
});

test('"vegetable oil" alone still flags — the generic name hides the same thing', () => {
  const v = evaluateIngredients('Wheat flour, vegetable oil, salt');
  assert.ok(idsOf(v.universalLayer).includes('vegetable_oil'));
});

/* ───── Oil-blend parentheticals: the way US labels actually print seed oils ─────
   Found by running a realistic label through the engine. "Vegetable oil (canola,
   soybean)" flagged canola and SILENTLY MISSED soybean, because parentheses were
   split away and the KB keys the entry on "soybean oil". Kristy's loudest position
   was blind to the commonest form of the thing she objects to. */

test('a bare source inside an oil parenthetical resolves to that oil', () => {
  const v = evaluateIngredients('Enriched flour, vegetable oil (canola, soybean), salt');
  const ids = idsOf(v.universalLayer);
  assert.ok(ids.includes('canola_oil'), 'canola');
  assert.ok(ids.includes('soybean_oil'), 'soybean — the one that used to vanish');
  assert.ok(ids.includes('vegetable_oil'), 'and the head itself');
});

test('"and/or" alternatives both resolve', () => {
  // Fused into one token, only the first could ever match.
  const ids = idsOf(
    evaluateIngredients('Wheat flour, vegetable oil (soybean and/or canola oil), salt').universalLayer
  );
  assert.ok(ids.includes('soybean_oil'));
  assert.ok(ids.includes('canola_oil'));
});

test('shortening and fat parentheticals expand the same way', () => {
  const ids = idsOf(evaluateIngredients('Sugar, shortening (palm, cottonseed)').universalLayer);
  assert.ok(ids.includes('cottonseed_oil'));
  assert.ok(ids.includes('refined_palm_oil'));
});

test('"palm kernel" is not mangled into "palm oil kernel"', () => {
  const ids = idsOf(evaluateIngredients('Cocoa, vegetable oil (palm kernel oil)').universalLayer);
  assert.ok(ids.length > 0, 'still matched something');
});

test('TRIPWIRE: a bare soybean that is FOOD is never read as soybean oil', () => {
  // This is why the expansion is scoped to an oil/shortening/fat head instead of
  // becoming a bare "soybean" alias — an alias cannot tell where it appeared, and
  // flagging tofu for seed oil is a false claim, which is worse than a missed one.
  for (const label of ['Organic soybeans, water', 'Edamame (soybeans), sea salt']) {
    const v = evaluateIngredients(label);
    assert.equal(
      idsOf(v.universalLayer).includes('soybean_oil'),
      false,
      `should not flag soybean oil: "${label}"`
    );
  }
});

test('TRIPWIRE: whole-food fats stay clean through the expansion', () => {
  // The Block E invariant. Nothing added here may cost butter/ghee/tallow a stamp.
  for (const label of ['Butter', 'Ghee', 'Beef tallow', 'Cultured pasteurized milk, salt']) {
    const v = evaluateIngredients(label);
    assert.equal(v.universalLayer.length, 0, `${label} should carry no flag`);
    assert.equal(v.stamp, true, `${label} should keep its stamp`);
  }
});

/* ─────────────── Whole foods: affirmed, not merely unflagged ─────────────── */

test('a whole-food label is affirmed, not just silent', () => {
  const reply = JSON.stringify({
    product_name: 'Raw Honey',
    brand: null,
    ingredients: ['Raw honey'],
    panel: 'full',
  });
  const { ingredients, productName } = parseIngredientsJSON(reply);
  assert.equal(productName, 'Raw Honey');

  const v = evaluateIngredients(ingredients.join(', '));
  assert.ok(idsOf(v.affirmationLayer).includes('raw_honey'), 'affirmed as a whole food');
  assert.equal(v.universalLayer.length, 0, 'nothing to flag');
  assert.equal(v.tier, 'approved');
  assert.equal(v.stamp, true, 'a clean whole food earns the seal');
});

test('an affirmation never costs a clean product its stamp', () => {
  // The Block E invariant, re-checked through the vision path: affirmations ride in
  // their own layer precisely so a positive entry can never score as a concern.
  const v = evaluateIngredients('Extra virgin olive oil');
  assert.equal(v.universalLayer.length, 0);
  assert.equal(v.stamp, true);
});

/* ─────────────── A half-read panel may not approve ─────────────── */

test('a partial read keeps its real flags', () => {
  // Flags are found, never inferred — so what the readable half showed still stands.
  const v = evaluateIngredients('Enriched flour, canola oil, salt');
  const guarded = guardIncompleteRead(v, false);
  assert.ok(idsOf(guarded.universalLayer).includes('canola_oil'));
  assert.equal(guarded.tier, v.tier, 'tier is not invented or downgraded');
  assert.equal(guarded.incompleteRead, undefined, 'nothing withheld — it was never an approval');
});

test('a partial read may NOT produce a clean approval', () => {
  // The unread tail is exactly where the seed oil hides. `approved` asserts "there is
  // nothing here to flag", which a half-read list cannot support.
  const v = evaluateIngredients('Organic rolled oats');
  assert.equal(v.tier, 'approved');
  assert.equal(v.stamp, true);

  const guarded = guardIncompleteRead(v, false);
  assert.equal(guarded.stamp, false, 'the seal is withheld');
  assert.equal(guarded.incompleteRead, true, 'and the card is told why');
});

test('a complete read is untouched by the guard', () => {
  const v = evaluateIngredients('Organic rolled oats');
  const guarded = guardIncompleteRead(v, true);
  assert.equal(guarded, v, 'same object — no decoration on the normal path');
  assert.equal(guarded.stamp, true);
});

/* ─────────────── Illegible / partial reporting ─────────────── */

test('no legible list reports panel:none, never an empty approval', () => {
  const out = parseIngredientsJSON(JSON.stringify({ ingredients: [], panel: 'full' }));
  // Even when the model claims "full", zero ingredients IS none — the route turns
  // this into a re-shot ask rather than an ingredient-free verdict.
  assert.equal(out.panel, 'none');
  assert.equal(out.ingredients.length, 0);
});

test('an unrecognized panel value degrades to partial, not full', () => {
  const out = parseIngredientsJSON(
    JSON.stringify({ ingredients: ['Oats'], panel: 'mostly readable' })
  );
  assert.equal(out.panel, 'partial', 'an unparseable claim never reads as complete');
});

test('malformed vision output yields nothing, not a guess', () => {
  assert.equal(parseIngredientsJSON('not json at all'), null);
});
