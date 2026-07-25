// The cart as one object — the shared edit primitives + the composer's routing.
//   node --test lib/cartEdit.test.js
//
// Covers the two things the docked-composer restructure depends on: that a scanned
// row survives persistence with Kristy's read attached, and that a cart COMMAND is
// told apart from a question and from a standing preference.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeList, applyCompose, buildCart, CART_TIERS } from './cartEdit.js';
import {
  looksLikeCartCommand,
  cartCommandMode,
  looksLikePerimeterQuestion,
  looksLikePreferenceDeclaration,
} from './chatRouting.js';

/* ───────── sanitizeList: the scan lands in the cart and keeps her verdict ───────── */

test('a scanned row survives with its source and tier', () => {
  const out = sanitizeList({
    items: [{ id: 'a', name: 'Nature Valley bars', category: 'Scanned', checked: true, source: 'scan', tier: 'swap_recommended' }],
  });
  assert.equal(out.items[0].source, 'scan');
  assert.equal(out.items[0].tier, 'swap_recommended');
  assert.equal(out.items[0].checked, true);
});

test('a tier the engine never assigns is dropped, and an unknown source falls back to user', () => {
  const out = sanitizeList({
    items: [{ name: 'Mystery', source: 'hacked', tier: 'kristy_approved_platinum' }],
  });
  assert.equal(out.items[0].source, 'user');
  assert.equal(out.items[0].tier, undefined, 'an invented tier must never persist');
});

test('every tier the verdict engine can assign is accepted', () => {
  for (const tier of CART_TIERS) {
    const out = sanitizeList({ items: [{ name: 'X', source: 'scan', tier }] });
    assert.equal(out.items[0].tier, tier);
  }
});

test('the perimeter refinement flag survives a round-trip', () => {
  const out = sanitizeList({ items: [{ name: 'Fresh, dark-bottle EVOO', source: 'template', refined: true }] });
  assert.equal(out.items[0].refined, true);
});

/* ───────── applyCompose / buildCart: her notes and the shopper's own choices ───────── */

test('a text instruction cannot remove a haul callout or a scanned row', () => {
  const current = {
    items: [
      { id: '1', name: 'Swap out: Chewy bars', source: 'swap' },
      { id: '2', name: 'Chewy bars', source: 'scan', tier: 'skip' },
      { id: '3', name: 'White rice', source: 'template' },
    ],
  };
  const next = applyCompose(current, { add: [], remove: ['chewy bars', 'white rice'] });
  const names = next.items.map((i) => i.name);
  assert.ok(names.includes('Swap out: Chewy bars'), "Kristy's haul callout is a note, not a shopping row");
  assert.ok(names.includes('Chewy bars'), "a scanned row is the shopper's own decision");
  assert.ok(!names.includes('White rice'), 'an ordinary template row is removable');
});

test('applyCompose does not duplicate an item already in the cart', () => {
  const current = { items: [{ id: '1', name: 'Eggs', source: 'template' }] };
  const next = applyCompose(current, { add: [{ name: 'eggs', section: 'Dairy & Eggs' }], remove: [] });
  assert.equal(next.items.length, 1);
});

test('build replaces the template rows but carries the trip forward', () => {
  const current = {
    intro: 'old',
    items: [
      { id: '1', name: 'Swap out: Soda', source: 'swap' },
      { id: '2', name: 'Greek yogurt', source: 'scan', tier: 'approved' },
      { id: '3', name: 'Old template item', source: 'template' },
    ],
  };
  const next = buildCart(current, [{ name: 'Ground beef', section: 'Meat & Seafood' }], {
    goal: 'high_protein',
    summary: 'Three dinners for four.',
  });
  const names = next.items.map((i) => i.name);
  assert.ok(names.includes('Swap out: Soda'));
  assert.ok(names.includes('Greek yogurt'), 'what you already put in the cart stays in it');
  assert.ok(!names.includes('Old template item'), 'a rebuild replaces her previous suggestions');
  assert.ok(names.includes('Ground beef'));
  assert.equal(next.intro, 'Three dinners for four.');
});

/* ───────── Routing: the composer's one input, three jobs ───────── */

test('cart commands route to the compose engine', () => {
  for (const m of [
    'add taco night',
    'swap the rice for something faster',
    'remove the yogurt',
    'build me three high-protein dinners for four',
    'make me a cart for the week',
    'drop the crackers',
  ]) {
    assert.ok(looksLikeCartCommand(m), `should be a cart command: "${m}"`);
  }
});

test('questions, meal reports and preference declarations are NOT cart commands', () => {
  for (const m of [
    'is wild or farmed salmon better?',
    'I had chicken and rice',
    'I eat holistically, take that into account for all ur recs',
    "I'm shopping for a family on a budget",
    'what does "natural" actually mean',
    'make sense of this label for me',
  ]) {
    assert.ok(!looksLikeCartCommand(m), `should NOT be a cart command: "${m}"`);
  }
});

test('build/make imply a fresh cart; everything else edits the one you have', () => {
  assert.equal(cartCommandMode('build me a cart for three dinners'), 'build');
  assert.equal(cartCommandMode('make me a week of lunches'), 'build');
  assert.equal(cartCommandMode('add taco night'), 'edit');
  assert.equal(cartCommandMode('swap the rice for couscous'), 'edit');
});

test('the three composer jobs stay in their own lanes', () => {
  const cartCmd = 'add taco night';
  const question = 'is wild or farmed salmon better?';
  const preference = 'I eat holistically, take that into account for all ur recs';

  assert.ok(looksLikeCartCommand(cartCmd) && !looksLikePerimeterQuestion(cartCmd) && !looksLikePreferenceDeclaration(cartCmd));
  assert.ok(looksLikePerimeterQuestion(question) && !looksLikeCartCommand(question));
  assert.ok(looksLikePreferenceDeclaration(preference) && !looksLikeCartCommand(preference));
});
