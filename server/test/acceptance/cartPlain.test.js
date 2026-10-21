import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OLD_CARTS } from './cartPlain.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const NEW = {
  frozen_vs_fresh_produce: 'Frozen vegetables', sprouts_raw: 'Broccoli sprouts', produce_root_vegetables: 'Carrots and potatoes',
  produce_brassicas: 'Broccoli, cauliflower, or cabbage', produce_onions_garlic: 'Onions and garlic', produce_peppers: 'Bell peppers',
  produce_apples_pears: 'Apples or pears', produce_citrus: 'Oranges, lemons, or limes', produce_stone_fruit: 'Peaches, plums, or cherries',
  produce_mushrooms: 'Mushrooms', produce_bananas: 'Green bananas', produce_green_beans: 'Green beans',
};

test('twelve produce carts are plain names; berries and leafy greens keep Organic', () => {
  assert.equal(Object.keys(NEW).length, Object.keys(OLD_CARTS).length);
  for (const [id, name] of Object.entries(NEW)) assert.equal(kb.entries.find((e) => e.id === id).cart_pick, name, id);
  for (const id of ['berries_picking', 'produce_leafy_greens']) assert.match(kb.entries.find((e) => e.id === id).cart_pick, /or organic$/, id);
});
