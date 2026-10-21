// 2026-10-21: twelve produce `cart_pick` names dropped "Organic" (cartPlain.test.js owns the new names).
// Older acceptance tests pin the strings they shipped; they call this on the loaded KB to read them as before.
export const OLD_CARTS = {
  frozen_vs_fresh_produce: 'Organic frozen vegetables', sprouts_raw: 'Organic broccoli sprouts',
  produce_root_vegetables: 'Organic carrots and potatoes', produce_brassicas: 'Organic broccoli, cauliflower, or cabbage',
  produce_onions_garlic: 'Organic onions and garlic', produce_peppers: 'Organic bell peppers',
  produce_apples_pears: 'Organic apples or pears', produce_citrus: 'Organic oranges, lemons, or limes',
  produce_stone_fruit: 'Organic peaches, plums, or cherries', produce_mushrooms: 'Organic mushrooms',
  produce_bananas: 'Organic green bananas', produce_green_beans: 'Organic green beans',
};
export const restoreOrganicCarts = (kb) => {
  for (const e of kb.entries) if (OLD_CARTS[e.id]) e.cart_pick = OLD_CARTS[e.id];
  return kb;
};
