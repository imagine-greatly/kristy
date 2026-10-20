// The photo door reuses shop matching and never gives a counter read a verdict.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLabelResult } from './scan.js';
import { matchItemToCard, matchItemToPick } from '../lib/listMatch.js';
import { perimeterKb as kb, NO_ANSWER } from '../lib/perimeter.js';
import { kindFor } from '../lib/counterCards.js';
import { looksNonEnglish, isReadableIngredientList } from '../lib/scanExtract.js';
import { sugarsPer100g } from '../lib/labelVision.js';
import { nonEmpty } from '../lib/testGuards.js';

function harness(overrides = {}) {
  const retained = [];
  const deps = { retain: (row) => retained.push(row), card: matchItemToCard, pick: matchItemToPick, kb, ...overrides };
  return { retained, run: (input, barcode) => buildLabelResult(input, barcode, deps) };
}

function legacyMiss(body) {
  assert.equal(body.found, false);
  assert.equal(body.source, 'vision');
  assert.equal(body.ingredients, '');
  assert.equal(body.product, null);
  for (const key of nonEmpty(['stamp', 'verdict', 'matched', 'nutrition', 'partialRead'], 'verdict fields')) {
    assert.equal(Object.hasOwn(body, key), false, key);
  }
}

test('ground beef uses the real shop matcher, without retention', () => {
  const { run, retained } = harness({ pick: () => assert.fail('card must win before pick') });
  const out = run({ kind: 'counter', item: 'ground beef', ingredients: [] });
  const expected = matchItemToCard('ground beef');
  assert.ok(expected);
  assert.equal(out.counter.slug, expected.slug);
  assert.equal(out.counter.section, expected.section);
  assert.equal(out.counter.item, 'ground beef');
  assert.deepEqual(out.counter.onLabel, []);
  assert.equal(retained.length, 0);
  legacyMiss(out);
});

test('lettuce never gets a home card', () => {
  const { run, retained } = harness();
  const out = run({ kind: 'counter', item: 'lettuce', ingredients: [] });
  assert.ok(out.counter);
  assert.notEqual(out.counter.slug, 'revive_greens');
  assert.notEqual(kindFor(out.counter.slug), 'home');
  assert.equal(retained.length, 0);
  legacyMiss(out);
});

test('egg claims only return the egg card vocabulary, as written', () => {
  const { run } = harness();
  const out = run({ kind: 'counter', item: 'eggs', claims: ['Cage Free', 'Grade A'] });
  const entry = kb.entries.find((e) => e.id === out.counter.slug);
  const terms = nonEmpty(entry.labels_decoded.map((label) => label.term), 'egg terms');
  const onLabel = nonEmpty(out.counter.onLabel, 'egg terms on carton');
  assert.ok(onLabel.includes('Cage-free'));
  assert.equal(onLabel.includes('Grade A'), terms.includes('Grade A'));
  assert.ok(onLabel.every((term) => terms.includes(term)));
  legacyMiss(out);
});

test('a printed claim outside the card vocabulary cannot reach onLabel', () => {
  const { run } = harness();
  const out = run({ kind: 'counter', item: 'eggs', claims: ['heart healthy'] });
  assert.deepEqual(out.counter.onLabel, []);
});

test('onLabel normalizes variants and whole words, preserving card order and deduping', () => {
  const { run } = harness({
    card: () => ({ slug: 'fixture', section: 'eggs_dairy' }),
    kb: { entries: [{ id: 'fixture', labels_decoded: [
      { term: 'Cage-free', meaning: 'Never sent' }, { term: 'Soy-free / corn-free' },
      { term: 'Organic' }, { term: 'Cage-free' },
    ] }, { id: 'other-card', labels_decoded: [{ term: 'Grade A' }] }] },
  });
  const out = run({ kind: 'counter', item: 'eggs', claims: [
    'Certified “corn-free” eggs', '‘Cage   Free’!', 'inorganic', 'Grade A',
  ] });
  nonEmpty(out.counter.onLabel, 'normalized terms');
  assert.deepEqual(out.counter.onLabel, ['Cage-free', 'Soy-free / corn-free']);
  assert.deepEqual(run({ kind: 'counter', item: 'eggs', claims: ['organicish', 'uncage-free'] }).counter.onLabel, []);
});

test('counter card with no decoded terms has an empty onLabel', () => {
  const { run } = harness({ card: () => ({ slug: 'fixture', section: 'produce' }), kb: { entries: [] } });
  assert.deepEqual(run({ kind: 'counter', item: 'lettuce', claims: ['organic'] }).counter.onLabel, []);
});

test('pick fallback preserves its authored line and optional avoid without retaining', () => {
  for (const avoid of nonEmpty([undefined, 'An authored avoid line.'], 'pick variants')) {
    const { run, retained } = harness({
      card: () => null,
      pick: (item) => {
        assert.equal(item, 'carrots');
        return { id: 'carrots', line: 'An authored pick line.', ...(avoid ? { avoid } : {}) };
      },
    });
    const out = run({ kind: 'counter', item: 'carrots' });
    assert.deepEqual(out.pick, { id: 'carrots', line: 'An authored pick line.', ...(avoid ? { avoid } : {}), item: 'carrots' });
    assert.equal(retained.length, 0);
    legacyMiss(out);
  }
});

test('counter miss reuses the honest counter answer without retaining', () => {
  const { run, retained } = harness({ card: () => null, pick: () => null });
  const out = run({ kind: 'counter', item: 'unmatched food' });
  assert.equal(out.counterMiss, true);
  assert.equal(out.item, 'unmatched food');
  assert.equal(out.message, NO_ANSWER);
  assert.equal(retained.length, 0);
  legacyMiss(out);
});

test('non-food with or without ingredients bypasses matching and retention', () => {
  const { run, retained } = harness({
    card: () => assert.fail('non-food cannot match a card'),
    pick: () => assert.fail('non-food cannot match a pick'),
  });
  for (const ingredients of nonEmpty([[], ['water', 'fragrance']], 'non-food reads')) {
    const out = run({ kind: 'not_food', ingredients });
    assert.equal(out.notFood, true);
    assert.equal(out.message, "That isn't something Kristy reads.");
    legacyMiss(out);
  }
  assert.equal(retained.length, 0);
});

test('panel results and retention are deep-equal to the BASE behavior', () => {
  const fixtures = nonEmpty([
    { ingredients: ['Oats', 'sugar', 'salt'], productName: 'Oat Cereal', brand: 'Storebrand', panel: 'full', sugarsG: 5, servingG: 40, category: 'cereal' },
    { ingredients: ['Oats', 'sugar'], panel: 'partial', sugarsG: null, servingG: null },
    { ingredients: [], panel: 'none' },
    { ingredients: ['azúcar', 'aceite de girasol'], panel: 'full' },
    { ingredients: ['unknown'], panel: 'full' },
  ], 'BASE panel fixtures');
  for (const fixture of fixtures) {
    const { run, retained } = harness({
      card: () => assert.fail('panel cannot match a card'), pick: () => assert.fail('panel cannot match a pick'),
    });
    baseRetained.length = 0;
    const expected = baseBuildLabelResult(fixture, ' 012345678905 ');
    assert.deepEqual(run({ ...fixture, kind: 'panel' }, ' 012345678905 '), expected);
    assert.deepEqual(retained, baseRetained);
  }
});

// Frozen BASE 0083653 implementation follows. Its dependencies are local pure
// functions plus a recording retain stub; no product is written by this comparison.
const baseRetained = [];
const retainProduct = (row) => baseRetained.push(row);
const PANEL_UNREADABLE = "That panel didn't come through. One more shot of the ingredients list — straight on, close enough to fill the frame.";
const NO_INGREDIENTS = 'No ingredient list readable on that one. Type the product name instead.';

function baseBuildLabelResult({ ingredients, productName, brand, panel, sugarsG, servingG, category }, barcode = null) {
  const joined = ingredients.join(', ');

  if (panel === 'none' || !ingredients.length) {
    return {
      found: false,
      source: 'vision',
      product: null,
      ingredients: '',
      panel: 'none',
      // A re-shot is the useful next move, so it gets its own state rather than
      // being lumped in with "type it instead".
      retryPhoto: true,
      message: PANEL_UNREADABLE,
    };
  }

  if (looksNonEnglish(joined) || !isReadableIngredientList(joined)) {
    return { found: false, source: 'vision', product: null, ingredients: '', message: NO_INGREDIENTS };
  }

  /* THE SELF-HEALING MOMENT. When this photo followed a barcode MISS, the client
     sends that barcode along — so the read is retained under it and the gap closes
     permanently: the next shopper to scan that code resolves from Kristy's own store
     instead of missing again. This is the whole moat, and it costs one field.

     The barcode is client-supplied, so it is treated as an association claim, not as
     truth: productStore ranks a vision read BELOW an Open Food Facts record, which
     means a photo filed under an existing product's code can never overwrite it.
     Fire-and-forget — retention is a background asset and must never delay a verdict. */
  const code = String(barcode || '').trim() || null;
  retainProduct({
    barcode: code,
    name: productName || null,
    brand: brand || null,
    ingredients: joined,
    source: 'vision',
    panel,
    // WHAT IT IS, read off the package by the call that was already looking at it. Retained
    // rather than returned: the client has no use for it and a category on the verdict card
    // would be a claim about the product that the claim lock never authorised.
    category,
  });

  /* THE ONE NUMBER OFF THE NUTRITION PANEL. Everything else there is ignored — a
     shopper can read "12g protein" themselves and nobody can read "tripotassium
     phosphate". Sugars is the exception because the seal gate needs grams: the label
     says "sugar" but never how much, and position was the proxy we rejected.

     Null when the panel was not in frame or not legible, which is the honest
     degradation — no withholding, and no false seal either, because the ingredient
     engine still scores the list it did read. */
  const addedSugar = sugarsPer100g({ sugarsG, servingG });

  return {
    found: true,
    source: 'vision',
    // Identity comes straight off the package when it was legible, else stays null.
    // Never inferred — a wrong name on a right verdict is still a wrong product.
    product: { barcode: code, name: productName || null, brand: brand || null, image: null, aisle: '' },
    ingredients: joined,
    // Shaped exactly like the OFF path's nutrition so /verdict and the engine cannot
    // tell which door the number came in through — which now includes the category, read
    // off the package by the vision call that was already looking at it. It is the same
    // field the retain a few lines up stores; sending it too is what lets a PHOTOGRAPHED
    // water reach the seal gate's exemption, rather than only an Open Food Facts one.
    //
    // ⚠️ `nutritionPanel` IS STILL DELIBERATELY ABSENT HERE. The photo path discards
    // calories on purpose, so this door has not asked and must report `unknown`, never
    // `absent` — a two-state read would strip the seal off every product a shopper
    // photographs. Adding a category does not change what this door knows about a panel.
    nutrition: addedSugar == null && !category
      ? null
      : { sodium: null, addedSugar, fiber: null, caffeine: null, category: category ?? null },
    // Carried so /verdict can withhold approval on a half-read list.
    ...(panel === 'partial' ? { partialRead: true } : {}),
  };
}
