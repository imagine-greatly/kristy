// Kristy's voice on the list — unit tests. NO network, NO model.
//
// The list is the shopper's. These pin the four promises that make that true while
// still letting Kristy have an opinion: the item always stays, she comments once,
// the comment carries no guilt, and a no is permanent.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { SWAP_OFFERS, offerForItem, offerLine, attachOffers } from './listVoice.js';
import { sanitizeList } from './cartEdit.js';
import { pickForName } from './list.js';

const listOf = (...names) => ({
  goal: null,
  intro: '',
  items: names.map((name, i) => ({ id: `i${i}`, name, category: 'Added', checked: false, source: 'user' })),
});

/* ── 1. The item always stays ──────────────────────────────────────────────────── */

test('an offer never removes, renames, or strikes the item', () => {
  const before = listOf('Soda', 'White bread', 'Bananas');
  const after = attachOffers(before);
  assert.equal(after.items.length, before.items.length);
  after.items.forEach((it, i) => {
    assert.equal(it.name, before.items[i].name, 'the shopper\'s own word was changed');
    assert.equal(it.checked, false);
    assert.ok(!('removed' in it) && !('struck' in it));
  });
  // The comment is a field NEXT TO the item, never a mutation of it.
  assert.ok(after.items[0].swapOffer);
  assert.equal(after.items[0].name, 'Soda');
});

test('a swap is only ever OFFERED — taking it is the shopper\'s tap, never automatic', () => {
  const after = attachOffers(listOf('Margarine'));
  const row = after.items[0];
  assert.equal(row.name, 'Margarine', 'the row was rewritten instead of offered to');
  assert.equal(row.swapTo, 'Grass-fed butter', 'the alternative rides alongside, unapplied');
});

/* ── 2. Flag once ──────────────────────────────────────────────────────────────── */

test('attachOffers is idempotent — a reload can never produce a second comment', () => {
  const once = attachOffers(listOf('Soda', 'Bananas'));
  const twice = attachOffers(once);
  const thrice = attachOffers(twice);
  assert.deepEqual(twice, once, 'a second pass changed the list');
  assert.deepEqual(thrice, once, 'a third pass changed the list');
  // The same object comes back, so nothing downstream even sees a write.
  assert.equal(twice, once);
});

test('a row that earned no comment is still marked, so a bigger table can\'t re-open it', () => {
  // The subtle version of nagging: an item passes silently today, the offer table
  // grows next month, and suddenly the app has an opinion about a two-week-old row.
  const after = attachOffers(listOf('Bananas'));
  assert.equal(after.items[0].offered, true);
  assert.ok(!after.items[0].swapOffer);
});

test('the once-only marker survives the round-trip through the store', () => {
  // If `offered` is dropped by sanitizeList, every save re-flags the whole cart.
  const saved = sanitizeList(attachOffers(listOf('Soda')));
  assert.equal(saved.items[0].offered, true);
  assert.equal(saved.items[0].offerId, 'soda');
  assert.equal(saved.items[0].swapTo, 'Sparkling water');
  assert.ok(saved.items[0].swapOffer);
  assert.deepEqual(attachOffers(saved), saved, 'a restored list got re-flagged');
});

test('Kristy does not second-guess her own rows', () => {
  const hers = { goal: null, intro: '', items: [{ id: 'a', name: 'White rice', source: 'template' }] };
  assert.equal(attachOffers(hers), hers, 'a template row was annotated');
});

/* ── 3. The offer, briefly, with no guilt ──────────────────────────────────────── */

test('the offer line opens by confirming the item stays', () => {
  const line = offerLine('Lucky Charms', 'Steel-cut oats');
  assert.match(line, /^Lucky Charms stays\./);
  assert.match(line, /Steel-cut oats if you want the same thing cleaner\.$/);
});

test('no offer line scolds, guilts, or lectures', () => {
  const GUILT =
    /\b(should(n'?t)?|shouldn|bad|unhealthy|junk|avoid|instead of|really\?|too much|cut back|careful|warning|guilty|shame|sorry|but )\b/i;
  for (const row of SWAP_OFFERS) {
    const line = offerLine('That item', row.better);
    assert.doesNotMatch(line, GUILT, `${row.id} scolds`);
    // Brief. One sentence of confirmation, one of offer, and nothing else.
    assert.ok(line.split(/(?<=\.)\s/).filter(Boolean).length <= 2, `${row.id} runs long`);
  }
});

test('an offer carries no health claim, no price, and no first person', () => {
  const OUTCOME = /\b(cures?|heals?|treats?|prevents?|reverses?|detox\w*|toxic|inflam\w*|disease|cancer|diabet\w*)\b/i;
  const FIRST_PERSON = /\b(i|i'?d|i'?ll|me|my|mine)\b/i;
  for (const row of SWAP_OFFERS) {
    const line = offerLine('That item', row.better);
    assert.doesNotMatch(line, OUTCOME, `${row.id} makes a health claim`);
    assert.doesNotMatch(line, FIRST_PERSON, `${row.id} speaks in first person`);
    assert.doesNotMatch(line, /[$£€]|\d+\s*(cents?|dollars?)/i, `${row.id} quotes a price`);
    assert.doesNotMatch(line, /—/, `${row.id} uses an em-dash aside`);
  }
});

test('the alternative is a grocery NAME, and mostly one Kristy already authored', () => {
  // Same guarantee as a perimeter cart_pick: a name cannot carry a claim. Resolving to
  // an existing PICK also means a taken swap inherits that pick's claim-safe reason
  // rather than landing in the cart as a bare checkbox.
  let known = 0;
  for (const row of SWAP_OFFERS) {
    assert.equal(typeof row.better, 'string');
    assert.ok(row.better.length > 2 && row.better.length <= 44, `${row.id}: "${row.better}" is not a cart row`);
    assert.doesNotMatch(row.better, /[.!?]$/, `${row.id} is a sentence, not a name`);
    assert.doesNotMatch(row.better, /[$£€%]/, `${row.id} carries a price`);
    if (pickForName(row.better)) known += 1;
  }
  assert.ok(known >= 6, `only ${known} offers resolve to an authored pick`);
});

/* ── 4. A no is permanent ──────────────────────────────────────────────────────── */

test('a declined swap is never offered again, on any item, on any trip', () => {
  assert.ok(offerForItem('White rice'), 'the first offer should happen');
  assert.equal(offerForItem('White rice', { declined: ['white_rice'] }), null);
  // And not through a differently-worded item either — the decline is keyed on the
  // offer, not on how the shopper spelled the grocery that day.
  assert.equal(offerForItem('2 bags white rice', { declined: ['white_rice'] }), null);
  const after = attachOffers(listOf('White rice'), { declined: ['white_rice'] });
  assert.ok(!after.items[0].swapOffer, 'a declined swap came back');
  assert.equal(after.items[0].offered, true, 'and the row still closes for good');
});

test('declining one swap does not silence the others', () => {
  const after = attachOffers(listOf('White rice', 'Soda'), { declined: ['white_rice'] });
  assert.ok(!after.items[0].swapOffer);
  assert.ok(after.items[1].swapOffer, 'an unrelated offer was silenced');
});

/* ── Restraint: silence is the default ─────────────────────────────────────────── */

test('an ordinary grocery gets no comment at all', () => {
  for (const name of ['Bananas', 'Chicken thighs', 'Whole milk', 'Spinach', 'Olive oil', 'Eggs', 'Toothpaste']) {
    assert.equal(offerForItem(name), null, `"${name}" drew a comment it should not have`);
  }
});

test('a bare brand name draws no comment, because there is nothing to ground one in', () => {
  // Kristy has no read on a box from its name. Inventing one would be a fabricated
  // claim AND a negative statement about a named product, and both are forbidden.
  // A barcode is how she reads a branded box; the scan path already carries a real
  // tier from the verdict engine.
  for (const brand of ['Lucky Charms', 'Snickers', 'Oreos', 'Doritos', 'Coca-Cola']) {
    assert.equal(offerForItem(brand), null, `${brand} was judged from its name alone`);
  }
  // And it stays on the list, untouched, like everything else.
  const after = attachOffers(listOf('Lucky Charms'));
  assert.equal(after.items[0].name, 'Lucky Charms');
  assert.equal(after.items.length, 1);
});

test('the offer never proposes the item the shopper is already holding', () => {
  assert.equal(offerForItem('Sparkling water'), null);
  assert.equal(offerForItem('Grass-fed butter'), null);
});

test('every offer id is unique and stable', () => {
  // Declines are recorded against these, so a duplicate or a rename resurrects a
  // suggestion somebody already turned down.
  const ids = SWAP_OFFERS.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[a-z][a-z0-9_]*$/);
});
