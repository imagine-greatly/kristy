// The Haul closes the loop into the next cart.
//   node --test lib/haul.test.js
//
// The carry-forward is deterministic on purpose: it's built from the shopper's own
// scans and the cart rows they never checked off, so no model is involved and no
// name can be invented. These tests pin that contract.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCarryForward, seedNextCart, distribution, tierBucket } from './haul.js';

const scans = [
  { product_name: 'Wild Alaskan salmon', tier: 'approved' },
  { product_name: 'Pasture-raised eggs', tier: 'approved_with_note' },
  { product_name: 'Sourdough', tier: 'use_with_intention' },
  { product_name: 'Honey Hazelnut Creamer', tier: 'swap_recommended' },
  { product_name: 'Toaster pastries', tier: 'skip' },
  { product_name: 'Wild Alaskan salmon', tier: 'approved' }, // scanned twice
];

const cartItems = [
  { name: 'Wild-caught fish', checked: false, source: 'template' },
  { name: 'Grass-fed ground beef', checked: true, source: 'template' },
  { name: 'Swap out: Creamer', checked: false, source: 'swap' },
  { name: 'Olive oil', checked: false, source: 'user' },
  { name: 'Scanned thing', checked: false, source: 'scan' },
];

test('kept, flagged and skipped are sorted into their own lanes', () => {
  const cf = buildCarryForward({ scans, cartItems });

  assert.deepEqual(
    cf.keep.map((x) => x.name),
    ['Wild Alaskan salmon', 'Pasture-raised eggs', 'Sourdough']
  );
  assert.deepEqual(
    cf.replace.map((x) => x.name),
    ['Honey Hazelnut Creamer', 'Toaster pastries']
  );
  // Only unchecked SHOPPABLE rows count as "never made it in": a checked row was
  // bought, a swap callout is a note, and a scanned row is already in hand.
  assert.deepEqual(
    cf.missed.map((x) => x.name),
    ['Wild-caught fish', 'Olive oil']
  );
});

test('a product scanned twice carries forward once', () => {
  const cf = buildCarryForward({ scans, cartItems: [] });
  const salmon = cf.keep.filter((x) => x.name === 'Wild Alaskan salmon');
  assert.equal(salmon.length, 1);
});

test('nothing to carry forward is an empty result, not a crash', () => {
  const cf = buildCarryForward({});
  assert.deepEqual(cf, { keep: [], replace: [], missed: [] });
});

test('seedNextCart produces plain cart rows, deduped, tagged to the haul', () => {
  const items = seedNextCart(['Olive oil', 'olive oil', '', '  Wild salmon  ']);
  assert.deepEqual(
    items.map((i) => i.name),
    ['Olive oil', 'Wild salmon']
  );
  for (const i of items) {
    assert.equal(i.checked, false);
    assert.equal(i.category, 'From your haul');
    // Rows are NAMES ONLY — a cart row never carries a claim.
    assert.deepEqual(Object.keys(i).sort(), ['category', 'checked', 'name', 'source']);
  }
});

test('the default carry-forward never includes a product she flagged', () => {
  const cf = buildCarryForward({ scans, cartItems });
  const defaults = [...cf.keep, ...cf.missed].map((x) => x.name);
  for (const flagged of cf.replace) {
    assert.ok(
      !defaults.includes(flagged.name),
      `"${flagged.name}" was flagged — it must be offered, never pre-selected`
    );
  }
});

test('distribution still buckets the five tiers into three', () => {
  const d = distribution(scans);
  assert.equal(d.total, 6);
  assert.equal(d.approved, 2);
  assert.equal(d.note, 2); // approved_with_note + use_with_intention
  assert.equal(d.swap, 2); // swap_recommended + skip
  assert.equal(tierBucket('skip'), 'swap');
});
