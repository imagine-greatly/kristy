// REFINING A LIST — the three defects that made "no seafood" unsafe.
//   node --test lib/listRefine.test.js
//
// The compose ENGINE already refines: `mode:'edit'` over an existing list returns a
// removal, not a rebuild. The 2026-08-05 list-creation audit measured that and found
// three defects between the engine and the shopper, none of which had a test:
//
//   (a) `cartCommandMode` returned 'build' for every refinement phrasing tested, and a
//       build with nothing to add REPLACED a 9-row list with 0 rows.
//   (b) `applyCompose` could not match "Wild-caught salmon fillets" from "no seafood" —
//       the row and the instruction share no word — so a category exclusion silently
//       no-opped on every row the shopper had typed or imported.
//   (c) The summary was the model's, unreconciled, so it read "Seafood out." with the
//       seafood still on the list.
//
// THE THREE ARE ONE FAILURE. Each alone is survivable; together they are a list that
// gets emptied, or silently not edited, under a sentence saying it worked. This file
// states each rule once, in the unit all three doors share, and each assertion here was
// verified to FAIL on the pre-fix tree (`git stash` over the lib, run, restore).
//
// Both DIRECTIONS are pinned deliberately. The spine rule — "a row the shopper added is
// never removed unless their own words name it" — is what these fixes widen, and a fix
// that widens it too far is a worse defect than the one it closes. So every test that
// asserts a removal now happens is paired with one asserting a VAGUE instruction still
// cannot reach an owned row.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from './testGuards.js';
import {
  applyCompose,
  buildCart,
  composeOutcome,
  reconcileSummary,
  EXCLUSION_CATEGORIES,
} from './cartEdit.js';
import { cartCommandMode } from './chatRouting.js';

/* The list the audit measured, and the composed row names the product actually emits —
   "Wild-caught salmon fillets", not "salmon". A bare-noun fixture would pass (b) by
   accident, which is precisely how the Phase 1 probe missed the double-prose row. */
const NAMES = [
  'Rotisserie chicken',
  'Wild-caught salmon fillets',
  'Frozen shrimp',
  'Brown rice or pasta',
  'Frozen broccoli',
  'Eggs',
  'Whole-grain bread',
  'Apples',
  'Cheddar cheese',
];
const SEAFOOD = ['Wild-caught salmon fillets', 'Frozen shrimp'];

const cart = (source) => ({
  goal: null,
  intro: '',
  items: NAMES.map((name, i) => ({ id: `x${i}`, name, category: 'Added', checked: false, source })),
});
const names = (list) => list.items.map((i) => i.name);
const has = (list, name) => names(list).includes(name);

/* Every phrasing the audit ran through the router. Real refinements, none of which
   carries a leading edit verb — which is exactly why they all fell through to 'build'. */
const REFINEMENTS = [
  'no seafood',
  'the kids will not eat fish',
  'take the salmon off',
  'make it cheaper',
  'nothing that needs an oven',
];

/* ═══════════════ (a) A REFINEMENT MUST NEVER ROUTE TO THE DESTRUCTIVE MODE ═══════════════
   'build' REPLACES. So it is only the right answer when there is nothing to lose, or when
   the shopper asked for a whole cart in so many words. The old default was the other way
   round: anything without a leading edit verb was a rebuild. */

test('(a) with a list to lose, a refinement is an edit — never a build', () => {
  for (const m of nonEmpty(REFINEMENTS, 'REFINEMENTS')) {
    assert.equal(cartCommandMode(m, { hasItems: true }), 'edit', `must not rebuild: "${m}"`);
  }
});

test('(a) an EMPTY cart still builds — the trip question is unchanged', () => {
  // TripQuestion asks on an empty cart and hardcodes 'build'. Nothing about that moves.
  for (const m of ['three dinners this week', 'chicken, rice, something for breakfast', 'no seafood']) {
    assert.equal(cartCommandMode(m, { hasItems: false }), 'build', `empty cart should build: "${m}"`);
  }
});

test('(a) asking for a whole cart in so many words still replaces one', () => {
  for (const m of [
    'build me a cart for the week',
    'start over',
    'scrap the list and give me a new one',
    'make me a new grocery list',
  ]) {
    assert.equal(cartCommandMode(m, { hasItems: true }), 'build', `should replace: "${m}"`);
  }
});

test('(a) STRUCTURAL: a build with nothing to add cannot empty a list that has rows', () => {
  // The measured failure: "no seafood" in build mode returned add:[] — correctly, there
  // is nothing to add — and buildCart carried forward only swap/scan rows. 9 → 0.
  // The router fix above makes this unreachable by phrasing; this makes it unreachable
  // full stop, because a phrasing gate is one gate and this repo has been wrong about
  // two gates agreeing before.
  const before = cart('template');
  const after = buildCart(before, [], { summary: 'Seafood out.' });
  assert.equal(after.items.length, NAMES.length, 'a build with no items is not a reason to empty a cart');
  assert.equal(after.intro, before.intro, 'and it must not stamp a summary describing a build that did not happen');
});

test('(a) a real build still replaces her previous suggestions', () => {
  const before = cart('template');
  const after = buildCart(before, [{ name: 'Ground beef', section: 'Meat & Seafood' }], { summary: 'Beef night.' });
  assert.ok(has(after, 'Ground beef'));
  assert.ok(!has(after, 'Rotisserie chicken'), 'a rebuild is still a rebuild when there is something to build');
  assert.equal(after.intro, 'Beef night.');
});

/* ═══════════════ (b) A CATEGORY IS A NAME ═══════════════
   `namedInInstruction` required a word from the ROW to appear in the instruction. "no
   seafood" shares nothing with "Wild-caught salmon fillets", so the protection on an
   owned row refused the shopper's own explicit exclusion. */

test('(b) "no seafood" reaches the shopper\'s OWN salmon and shrimp', () => {
  const before = cart('user');
  const after = applyCompose(before, { add: [], remove: SEAFOOD }, { instruction: 'no seafood' });
  for (const n of SEAFOOD) assert.ok(!has(after, n), `${n} must come off`);
  assert.equal(after.items.length, NAMES.length - 2, 'and nothing else moves');
});

test('(b) it works on an IMPORTED row too — the same protection covered both', () => {
  const before = cart('imported');
  const after = applyCompose(before, { add: [], remove: SEAFOOD }, { instruction: 'no fish, the kids will not eat it' });
  for (const n of SEAFOOD) assert.ok(!has(after, n), `${n} must come off`);
});

test('(b) a VAGUE instruction still cannot touch an owned row', () => {
  // The spine rule. "make this healthier" names no item and no category, so it names
  // nothing — and a model that proposes emptying the cart gets refused, as before.
  for (const instruction of ['make this healthier', 'clean it up', 'sort this out for me']) {
    const before = cart('user');
    const after = applyCompose(before, { add: [], remove: [...NAMES] }, { instruction });
    assert.equal(after.items.length, NAMES.length, `"${instruction}" must not empty the cart`);
  }
});

test('(b) a category the shopper did NOT name still cannot remove their row', () => {
  const before = cart('user');
  const after = applyCompose(before, { add: [], remove: ['Cheddar cheese'] }, { instruction: 'no seafood' });
  assert.ok(has(after, 'Cheddar cheese'), 'naming seafood does not name the cheese');
});

test('(b) the category veto stops a false member: "no dairy" leaves oat milk alone', () => {
  // `butter` and `milk` are dairy words that appear in things that are not dairy. Without
  // the veto, "no dairy" removes the oat milk and the peanut butter — a wrong removal of a
  // row the shopper typed, which is the exact harm the protection exists for.
  const before = {
    goal: null, intro: '',
    items: [
      { id: '1', name: 'Oat milk', source: 'user' },
      { id: '2', name: 'Peanut butter', source: 'user' },
      { id: '3', name: 'Cheddar cheese', source: 'user' },
    ],
  };
  const after = applyCompose(
    before,
    { add: [], remove: ['Oat milk', 'Peanut butter', 'Cheddar cheese'] },
    { instruction: 'no dairy' }
  );
  assert.ok(has(after, 'Oat milk'), 'oat milk is not dairy');
  assert.ok(has(after, 'Peanut butter'), 'peanut butter is not dairy');
  assert.ok(!has(after, 'Cheddar cheese'), 'the cheddar is');
});

test('(b) her own rows are still removable by a loose instruction, as they always were', () => {
  const before = cart('template');
  const after = applyCompose(before, { add: [], remove: SEAFOOD }, { instruction: 'clean it up' });
  for (const n of SEAFOOD) assert.ok(!has(after, n), 'a template row was her suggestion in the first place');
});

test('(b) the category table is explicit, and every entry is checkable off a label', () => {
  for (const cat of nonEmpty(EXCLUSION_CATEGORIES, 'EXCLUSION_CATEGORIES', 4)) {
    assert.ok(cat.names.length >= 1, 'a category needs a word a shopper would type');
    assert.ok(cat.members.size >= 2, 'and members, or it names nothing');
    for (const n of cat.names) {
      assert.ok(!/\s/.test(n), `a trigger is one word, matched whole: "${n}"`);
    }
  }
});

/* ═══════════════ (c) THE SUMMARY MAY NOT OUTRUN THE EDIT ═══════════════
   Measured: applyCompose refused both seafood rows and the shopper read "Seafood out."
   `describeCartResult` was written for exactly this and only ran when the model returned
   NO summary — so the honest path was the rare one. */

test('(c) a refused removal is counted, off the two lists rather than off the proposal', () => {
  const before = cart('user');
  const proposed = { add: [], remove: SEAFOOD };
  const after = applyCompose(before, proposed, { instruction: 'clean it up' });
  const outcome = composeOutcome(before, after, proposed);
  assert.equal(outcome.removed.length, 0);
  assert.equal(outcome.refused.length, 2, 'both proposed removals were declined');
  assert.equal(outcome.changed, false);
});

test('(c) a summary claiming a removal that did not happen is DISCARDED', () => {
  const before = cart('user');
  const proposed = { add: [], remove: SEAFOOD };
  const after = applyCompose(before, proposed, { instruction: 'clean it up' });
  const outcome = composeOutcome(before, after, proposed);
  const line = reconcileSummary('Seafood out. Chicken and eggs cover protein.', outcome, 'edit');
  assert.notEqual(line, 'Seafood out. Chicken and eggs cover protein.');
  assert.match(line, /nothing came off/i, 'and it says what actually happened');
  assert.ok(!/seafood out/i.test(line), 'the claim cannot survive in any form');
});

test('(c) a PARTIAL refusal names what came off and what stayed', () => {
  const before = {
    goal: null, intro: '',
    items: [
      { id: '1', name: 'Wild-caught salmon fillets', source: 'template' }, // removable
      { id: '2', name: 'Frozen shrimp', source: 'user' },                  // protected
    ],
  };
  const proposed = { add: [], remove: ['Wild-caught salmon fillets', 'Frozen shrimp'] };
  const after = applyCompose(before, proposed, { instruction: 'clean it up' });
  const outcome = composeOutcome(before, after, proposed);
  assert.equal(outcome.removed.length, 1);
  assert.equal(outcome.refused.length, 1);
  const line = reconcileSummary('Seafood out.', outcome, 'edit');
  assert.match(line, /salmon/i, 'what came off is named');
  assert.match(line, /shrimp/i, 'and so is what stayed');
});

test('(c) when the edit did what it said, her own line stands untouched', () => {
  const before = cart('template');
  const proposed = { add: [], remove: SEAFOOD };
  const after = applyCompose(before, proposed, { instruction: 'no seafood' });
  const outcome = composeOutcome(before, after, proposed);
  assert.equal(outcome.refused.length, 0);
  assert.equal(reconcileSummary('Seafood out.', outcome, 'edit'), 'Seafood out.');
});

test('(c) a build that was refused says so instead of claiming a cart', () => {
  const before = cart('template');
  const after = buildCart(before, [], { summary: 'Here is the trip.' });
  const outcome = composeOutcome(before, after, { add: [], remove: [] });
  const line = reconcileSummary('Here is the trip.', outcome, 'build');
  assert.notEqual(line, 'Here is the trip.');
  assert.ok(!/here is the trip/i.test(line));
});

test('(c) NO FIRST PERSON in any reconciled line — VOICE_SPEC binds here too', () => {
  const before = cart('user');
  const proposed = { add: [], remove: SEAFOOD };
  const after = applyCompose(before, proposed, { instruction: 'clean it up' });
  const outcome = composeOutcome(before, after, proposed);
  const lines = [
    reconcileSummary('x', outcome, 'edit'),
    reconcileSummary('x', composeOutcome(before, buildCart(before, []), {}), 'build'),
  ];
  for (const line of nonEmpty(lines, 'reconciled lines')) {
    assert.ok(!/\b(I|I'?m|I'?ll|I'?ve|me|my|mine)\b/i.test(line), `first person in: "${line}"`);
    assert.ok(!/—/.test(line), `em-dash aside in: "${line}"`);
  }
});
