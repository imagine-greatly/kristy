// Subtle goal weighting — unit tests. NO network, NO model.
//
// The shopper's list is the spine. Goals weight the MARGINAL choices; they never
// replace what the shopper built. These pin the three places the push used to become
// an overhaul: the model removing a row nobody named, a profile change regenerating
// the cart, and focuses pulling in everything they anchor on at once.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { applyCompose, buildCart, sanitizeList } from './cartEdit.js';
import { generateList, canonicalItem } from './list.js';
import { LIST_COMPOSE_SYSTEM } from './listCompose.js';

const row = (name, source = 'user') => ({ id: name, name, category: 'Added', checked: false, source });
const cart = (...items) => ({ goal: null, intro: '', items });

/* ── The shopper's own rows are the spine ──────────────────────────────────────── */

test('a vague instruction never removes the shopper\'s own item', () => {
  // "Make this healthier" must not quietly delete the thing they are actually buying.
  // That is the moment a coach turns into a parent.
  const current = cart(row('Lucky Charms'), row('Soda'), row('Bananas'));
  const next = applyCompose(
    current,
    { add: [], remove: ['Lucky Charms', 'Soda'] },
    { instruction: 'make this cart healthier' }
  );
  const names = next.items.map((i) => i.name);
  assert.ok(names.includes('Lucky Charms'), 'the shopper\'s item was deleted');
  assert.ok(names.includes('Soda'), 'the shopper\'s item was deleted');
});

test('but their OWN words still remove their own item', () => {
  // The protection is not a lock. "Remove the soda" has to work, or the list stops
  // being theirs in the other direction.
  const current = cart(row('Lucky Charms'), row('Soda'));
  const next = applyCompose(current, { add: [], remove: ['Soda'] }, { instruction: 'take the soda off' });
  const names = next.items.map((i) => i.name);
  assert.ok(!names.includes('Soda'), 'an explicitly named removal was blocked');
  assert.ok(names.includes('Lucky Charms'), 'an unnamed item went with it');
});

test('an imported list gets the same protection as a manual add', () => {
  const current = cart(row('Fairlife 2% milk', 'imported'));
  const next = applyCompose(current, { add: [], remove: ['Fairlife 2% milk'] }, { instruction: 'clean this up' });
  assert.equal(next.items.length, 1, 'their own written list was edited out from under them');
});

test('Kristy\'s own suggestions stay removable by a loose instruction', () => {
  // She put those there. Second-guessing a removal of her own row would make the
  // cart harder to edit for no gain.
  const current = cart(row('Steel-cut oats', 'template'), row('Lucky Charms'));
  const next = applyCompose(
    current,
    { add: [], remove: ['Steel-cut oats'] },
    { instruction: 'simplify the cart' }
  );
  const names = next.items.map((i) => i.name);
  assert.ok(!names.includes('Steel-cut oats'));
  assert.ok(names.includes('Lucky Charms'));
});

test('scans and haul callouts stay protected, as before', () => {
  const current = cart(row('Scanned cereal', 'scan'), row('Swap out: Chips', 'swap'));
  const next = applyCompose(
    current,
    { add: [], remove: ['Scanned cereal', 'Swap out: Chips'] },
    { instruction: 'remove scanned cereal and swap out chips' }
  );
  assert.equal(next.items.length, 2, 'a scan or a haul callout was removed by text');
});

/* ── A goal weights the margins, it does not rewrite the cart ──────────────────── */

test('focuses nudge, they do not overhaul', () => {
  // Four focuses used to pull in everything each one anchors on. The cart that came
  // back was Kristy's ideal rather than a list leaning her way.
  const plain = generateList({ goal: 'high_protein', premium: true });
  const loaded = generateList({
    goal: 'high_protein',
    focuses: ['higher_fiber', 'lower_sodium', 'lower_sugar', 'blood_sugar', 'heart', 'processed_fats'],
    constraints: ['budget'],
    premium: true,
  });
  const added = loaded.items.length - plain.items.length;
  assert.ok(added > 0, 'focuses should still shape the list');
  assert.ok(added <= 4, `focuses added ${added} items — that is an overhaul, not a nudge`);
});

test('one focus still lands its anchor', () => {
  // Restraint must not become silence: the capability is real and has to show.
  const free = generateList({ goal: 'high_protein', focuses: ['higher_fiber'], premium: false });
  const prem = generateList({ goal: 'high_protein', focuses: ['higher_fiber'], premium: true });
  assert.ok(prem.items.length > free.items.length, 'a focus changed nothing at all');
});

test('a built cart is the shopper\'s sentence, never padded from a template', () => {
  // buildCart takes ONLY what the composer proposed from their words.
  const next = buildCart(cart(), [{ name: 'Ground beef', section: 'Meat & Seafood' }], { goal: 'high_protein' });
  assert.equal(next.items.length, 1, 'the cart was padded with items nobody asked for');
  assert.equal(next.items[0].name, 'Ground beef');
});

/* ── The composer prompt still says the shopper drives ─────────────────────────── */

test('the compose prompt keeps the shopper in charge, verbatim', () => {
  assert.ok(LIST_COMPOSE_SYSTEM.includes('THE SHOPPER DRIVES. THIS IS THE MOST IMPORTANT RULE.'));
  assert.ok(LIST_COMPOSE_SYSTEM.includes('SPECIFY what they named, rather than replacing it'));
  assert.ok(LIST_COMPOSE_SYSTEM.includes('DO NOT PAD.'));
  assert.ok(
    LIST_COMPOSE_SYSTEM.includes('they are not a reason to add extra items'),
    'goals must shape which version goes on the list, not how many'
  );
  // Never scold. The summary is a text message, not a correction.
  assert.ok(LIST_COMPOSE_SYSTEM.includes('NO FIRST PERSON.'));
  assert.doesNotMatch(LIST_COMPOSE_SYSTEM, /\bscold|lecture them|tell them off\b/i);
});

/* ── Canonical matching, which is what keeps a nudge from duplicating a row ────── */

test('a nudge compares canonically, so near-identical rows do not double up', () => {
  assert.equal(canonicalItem('Plain whole-milk Greek yogurt'), canonicalItem('Greek yogurt'));
  assert.equal(canonicalItem('Frozen broccoli'), canonicalItem('Broccoli'));
  assert.notEqual(canonicalItem('Brown rice'), canonicalItem('White rice'));
});

test('offer fields survive a compose round-trip', () => {
  // A cart edit must not wipe the record that Kristy already commented on a row.
  const current = cart({ ...row('Soda'), offered: true, offerId: 'soda', swapTo: 'Sparkling water' });
  const next = sanitizeList(applyCompose(current, { add: [], remove: [] }, { instruction: 'add bananas' }));
  assert.equal(next.items[0].offered, true);
  assert.equal(next.items[0].offerId, 'soda');
});
