// The shopper's real baseline — unit tests. NO network, NO model.
//
// The long-term edge: a list that nudges from where the shopper ACTUALLY is, trip
// after trip, instead of from a blank ideal every time. These pin the three things
// the baseline has to get right — remember what they really buy, never re-suggest
// what they removed, and never re-offer what they turned down.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildBaseline, suppressedByBaseline } from './listBaseline.js';
import { declinedItemNames, offerForItem } from './listVoice.js';
import { generateList } from './list.js';
import { buildComposeInput, LIST_COMPOSE_SYSTEM } from './listCompose.js';

/* ── Remember what they really buy ─────────────────────────────────────────────── */

test('a staple is something bought more than once, ranked by how often', () => {
  const b = buildBaseline({
    kept: ['White rice', 'Bananas', 'White rice', 'Whole milk', 'White rice', 'Bananas'],
  });
  assert.deepEqual(b.staples, ['White rice', 'Bananas']);
  assert.ok(!b.staples.includes('Whole milk'), 'one trip is not a pattern');
});

test('frequency survives the shopper writing an item slightly differently', () => {
  // "Greek yogurt" and "Plain whole-milk Greek yogurt" are the same habit.
  const b = buildBaseline({ kept: ['Greek yogurt', 'Plain whole-milk Greek yogurt'] });
  assert.equal(b.staples.length, 1);
});

test('an empty history produces an empty baseline, not a guess', () => {
  const b = buildBaseline({});
  assert.deepEqual(b.staples, []);
  assert.equal(b.avoided.size, 0);
  assert.equal(b.declined.size, 0);
});

/* ── Never re-suggest what they took off ───────────────────────────────────────── */

test('a removed item is suppressed from any future suggestion', () => {
  const b = buildBaseline({ removed: ['Sardines'] });
  assert.equal(suppressedByBaseline('Sardines', b), true);
  assert.equal(suppressedByBaseline('Canned wild sardines', b), false, 'a different item is not suppressed');
  assert.equal(suppressedByBaseline('Bananas', b), false);
});

/* ── Never re-offer what they turned down ──────────────────────────────────────── */

test('a declined swap stops being OFFERED and stops being GENERATED', () => {
  // Silencing the note but still putting the item in the cart is the same suggestion
  // arriving by a side door. Both paths have to honour the no.
  assert.deepEqual(declinedItemNames(['white_rice']), ['Brown or jasmine rice']);

  const b = buildBaseline({ declinedSwaps: ['white_rice'] });
  assert.equal(suppressedByBaseline('Brown or jasmine rice', b), true);
  assert.equal(offerForItem('White rice', { declined: ['white_rice'] }), null);

  const list = generateList({ goal: 'eating_cleaner', premium: true, signals: { declinedSwaps: ['white_rice'] } });
  assert.ok(
    !list.items.some((i) => /brown or jasmine rice/i.test(i.name)),
    'a declined swap came back as a generated row'
  );
});

test('declining one swap suppresses only that one', () => {
  const b = buildBaseline({ declinedSwaps: ['white_rice'] });
  assert.equal(suppressedByBaseline('Sparkling water', b), false);
  assert.equal(suppressedByBaseline('Grass-fed butter', b), false);
});

test('an unknown offer id resolves to nothing rather than throwing', () => {
  assert.deepEqual(declinedItemNames(['not_a_real_offer']), []);
  assert.deepEqual(declinedItemNames(), []);
});

/* ── The baseline reaches the composer as evidence, never as a request ─────────── */

test('staples ride into the compose payload as plain grocery names', () => {
  const input = buildComposeInput({
    instruction: 'dinner for four',
    staples: ['White rice', 'Bananas', ''],
    focuses: [],
    hardLines: [],
    constraints: [],
  });
  assert.deepEqual(input.staples, ['White rice', 'Bananas'], 'blanks dropped');
  // Names only. Nothing here is derived, inferred, or capable of carrying a claim.
  for (const s of input.staples) assert.equal(typeof s, 'string');
});

test('the prompt may lean on the basket but never add from it', () => {
  assert.ok(LIST_COMPOSE_SYSTEM.includes('THEIR REAL BASKET, WHEN IT IS KNOWN:'));
  assert.ok(LIST_COMPOSE_SYSTEM.includes('It is evidence, not a request.'));
  assert.ok(
    LIST_COMPOSE_SYSTEM.includes('It is NEVER a reason to add an item.'),
    'a staple must not become a padded row'
  );
});

/* ── Restraint ─────────────────────────────────────────────────────────────────── */

test('the baseline holds grocery names and nothing else', () => {
  // No scores, no health model, no profile of the person. Just what they bought,
  // what they took off, and what they said no to.
  const b = buildBaseline({
    kept: ['White rice', 'White rice'],
    removed: ['Sardines'],
    declinedSwaps: ['white_rice'],
    acceptedSwaps: ['Some product'],
  });
  assert.deepEqual(Object.keys(b).sort(), ['avoided', 'declined', 'staples']);
  assert.ok(Array.isArray(b.staples));
  assert.ok(b.avoided instanceof Set && b.declined instanceof Set);
});

test('the staple list is bounded', () => {
  const kept = [];
  for (let i = 0; i < 60; i++) kept.push(`Item ${i}`, `Item ${i}`);
  assert.ok(buildBaseline({ kept }).staples.length <= 20);
});
