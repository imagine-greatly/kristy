import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OLD_CARTS } from './cartPlain.js';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const NEW = {
  frozen_vs_fresh_produce: 'Frozen vegetables', sprouts_raw: 'Broccoli sprouts', produce_root_vegetables: 'Carrots and potatoes',
  produce_brassicas: 'Broccoli, cauliflower, or cabbage', produce_onions_garlic: 'Onions and garlic', produce_peppers: 'Bell peppers',
  produce_apples_pears: 'Apples or pears', produce_citrus: 'Oranges, lemons, or limes', produce_stone_fruit: 'Peaches, plums, or cherries',
  produce_mushrooms: 'Mushrooms', produce_bananas: 'Green bananas', produce_green_beans: 'Green beans',
};
const picks = kb.entries.filter((e) => e.cart_pick);
nonEmpty(picks, 'cart_pick entries', 20);

test('produce carts are plain names', () => {
  for (const [id, name] of Object.entries(NEW)) assert.equal(kb.entries.find((e) => e.id === id).cart_pick, name, id);
  for (const [id, name] of Object.entries({ berries_picking: 'Berries', produce_leafy_greens: 'Lettuce', oats_steelcut_rolled_instant: 'Rolled or steel-cut oats', pork_cuts_and_enhanced: 'Organic pasture-raised pork chops', hummus: 'Hummus: chickpeas and tahini' }))
    assert.equal(kb.entries.find((e) => e.id === id).cart_pick, name, id);
  assert.ok(Object.keys(OLD_CARTS).length > Object.keys(NEW).length, 'old names kept');
});

test('produce cart_picks never say organic', () => {
  // retired: whole-KB form; the pilot merge (P4) names organic as the floor on animal-product picks (stance 2026-10-20).
  for (const id of Object.keys(NEW)) assert.doesNotMatch(picks.find((e) => e.id === id).cart_pick, /organic/i, id);
});
