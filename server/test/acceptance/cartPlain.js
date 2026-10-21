import { readFileSync } from 'node:fs';
// 2026-10-21: every cart_pick dropped "Organic" and card decisions no longer lead with it (cartPlain.test.js owns the new names).
// Older acceptance tests pin the strings they shipped; they call restoreOrganicCarts on the loaded KB to read them as before.
export const OLD = {
 "rotisserie_chicken": {
  "cart_pick": "Organic or pasture-raised rotisserie chicken"
 },
 "oats_steelcut_rolled_instant": {
  "cart_pick": "Organic steel-cut oats"
 },
 "beans_dried_vs_canned": {
  "cart_pick": "Organic dried beans",
  "decision": "Organic dried beans, whole with unbroken skins."
 },
 "pork_cuts_and_enhanced": {
  "cart_pick": "Organic or pasture-raised pork shoulder",
  "decision": "Organic or pasture-raised pork with no added solution."
 },
 "deli_meat_uncured": {
  "decision": "Organic or pasture-raised whole roasted meat, sliced thin."
 },
 "berries_picking": {
  "cart_pick": "Berries: grown without sprays, or organic"
 },
 "grains_beyond_rice": {
  "cart_pick": "Organic whole or hulled grain, not pearled",
  "decision": "Organic grains with the bran still on, not polished off."
 },
 "sprouts_raw": {
  "decision": "Organic sprouts from the cold case, white roots, crisp stems."
 },
 "produce_brassicas": {
  "decision": "Organic broccoli, cauliflower and cabbage, tight heads, no soft spots."
 },
 "produce_onions_garlic": {
  "decision": "Organic onions and garlic, firm, with a dry neck."
 },
 "produce_leafy_greens": {
  "cart_pick": "Lettuce: grown without sprays, or organic"
 },
 "produce_citrus": {
  "decision": "Organic oranges, lemons and limes, firm with a smooth rind."
 },
 "pick_canned_tomatoes": {
  "decision": "Organic tomatoes: skip dented, rusted or swollen cans and read for BPA-free; the date marks quality."
 },
 "pick_frozen_peas": {
  "decision": "Organic peas frozen solid, with no pack drips or off smell."
 },
 "pick_frozen_broccoli": {
  "decision": "Organic broccoli frozen solid; pack drips or off smell mean it thawed."
 },
 "pick_asparagus": {
  "decision": "Organic asparagus with dry, closed, compact tips and no limp stalks."
 },
 "pick_corn": {
  "decision": "Organic corn with green husks and fresh silk, without dried-out ears."
 },
 "pick_eggplant": {
  "decision": "Organic eggplant, heavy, shiny and smooth, with a green stem free of mold."
 },
 "pick_zucchini": {
  "decision": "Organic zucchini, small-to-medium, glossy and firm, that feel heavy for their size."
 },
 "pick_snap_peas": {
  "decision": "Organic snap peas in firm, bright green pods, without blemishes."
 },
 "pick_kohlrabi": {
  "decision": "Organic kohlrabi bulbs, firm and heavy in your hand, without cracks or bruises."
 },
 "pick_okra": {
  "decision": "Organic okra, firm and bright green, without limp, moldy or dried-out pods."
 },
 "pick_mangoes": {
  "decision": "Organic mangoes that yield slightly to gentle pressure; red color does not indicate ripeness."
 },
 "pick_tofu": {
  "decision": "Organic tofu by firmness: soybeans, water, coagulant such as nigari or gypsum."
 },
 "tortillas": {
  "cart_pick": "Organic corn tortillas",
  "decision": "Organic corn tortillas of masa, water and salt."
 },
 "ground_turkey": {
  "cart_pick": "Pasture-raised or organic plain ground turkey"
 },
 "pasta_dry": {
  "cart_pick": "Organic dry durum semolina pasta",
  "decision": "Organic dry pasta of durum semolina and water."
 },
 "bacon": {
  "cart_pick": "Organic or pasture-raised sliced bacon",
  "decision": "Organic or pasture-raised bacon with a short curing list."
 },
 "hot_dogs": {
  "cart_pick": "Organic packaged beef hot dogs",
  "decision": "Organic beef hot dogs with no phosphates or binders."
 },
 "chicken_breast": {
  "cart_pick": "Pasture-raised or organic chicken breast"
 },
 "produce_mushrooms": {
  "decision": "Organic mushrooms, dry and firm, with no dark spots."
 },
 "produce_bananas": {
  "decision": "Organic bananas, green, to finish ripening on the counter."
 },
 "egg_duck_quail": {
  "cart_pick": "Pasture-raised organic duck or quail eggs"
 },
 "pick_winter_squash": {
  "decision": "Organic winter squash, firm and heavy-for-size, with hard skin and no sunken or moldy spots."
 },
 "pick_ginger_turmeric": {
  "decision": "Organic ginger and turmeric roots, firm, ginger smooth and uncracked; keep both sealed and refrigerated."
 },
 "pick_egg_whites": {
  "decision": "Organic whites: certified organic feed and outdoor access, pasteurized per federal standard."
 },
 "ham": {
  "cart_pick": "Organic or pasture-raised sliced ham",
  "decision": "Organic or pasture-raised ham named just “Ham”."
 },
 "turkey_bacon": {
  "cart_pick": "Organic or pasture-raised turkey bacon strips",
  "decision": "Organic or pasture-raised turkey bacon with no added sugar."
 },
 "cured_pork": {
  "cart_pick": "Organic or pasture-raised guanciale pork jowl",
  "decision": "Organic or pasture-raised pork, with cut and curing ingredients named."
 },
 "raw_cider_vinegar": {
  "cart_pick": "Organic raw cider vinegar with the mother"
 },
 "miso": {
  "cart_pick": "Organic miso paste",
  "decision": "Organic miso of soybeans, salt and koji, any grain named."
 },
 "tempeh": {
  "cart_pick": "Firm organic tempeh cake",
  "decision": "Organic tempeh in a firm cake, bound white all through."
 },
 "natto": {
  "cart_pick": "Organic natto beans",
  "decision": "Organic natto in sealed trays, chilled or frozen."
 },
 "sugars": {
  "cart_pick": "Organic coconut sugar or pure maple sugar",
  "decision": "Organic coconut or maple sugar first, each from one sap."
 },
 "hot_soy_sauce": {
  "cart_pick": "Organic naturally brewed soy sauce",
  "decision": "Organic soy sauce, traditionally brewed, not made fast with acid."
 },
 "tortilla_chips": {
  "cart_pick": "Organic masa tortilla chips: olive oil",
  "decision": "Organic masa tortilla chips in olive oil or tallow."
 },
 "potato_chips": {
  "cart_pick": "Sliced organic potato chips: olive oil"
 },
 "popcorn": {
  "cart_pick": "Organic plain popcorn kernels",
  "decision": "Organic plain popcorn kernels, popped at home in coconut oil."
 },
 "snack_bars": {
  "cart_pick": "Organic oat snack bars",
  "decision": "Organic bars with oats or another whole grain listed first."
 },
 "hummus": {
  "cart_pick": "Organic hummus: chickpeas and tahini",
  "decision": "Organic hummus of chickpeas and tahini, with no gums."
 },
 "frozen_nuggets": {
  "cart_pick": "Organic chicken nuggets",
  "decision": "Organic or pasture-raised white meat nuggets, one solid piece."
 }
};
const TWELVE = {
  frozen_vs_fresh_produce: 'Organic frozen vegetables', sprouts_raw: 'Organic broccoli sprouts',
  produce_root_vegetables: 'Organic carrots and potatoes', produce_brassicas: 'Organic broccoli, cauliflower, or cabbage',
  produce_onions_garlic: 'Organic onions and garlic', produce_peppers: 'Organic bell peppers',
  produce_apples_pears: 'Organic apples or pears', produce_citrus: 'Organic oranges, lemons, or limes',
  produce_stone_fruit: 'Organic peaches, plums, or cherries', produce_mushrooms: 'Organic mushrooms',
  produce_bananas: 'Organic green bananas', produce_green_beans: 'Organic green beans',
};
for (const [id, cart_pick] of Object.entries(TWELVE)) OLD[id] = { ...OLD[id], cart_pick };
const DECISIONS = {
  rotisserie_chicken: 'Pasture-raised or organic rotisserie chicken, salt and spices only.',
  ground_turkey: 'Pasture-raised or organic ground turkey, fat content printed.',
  chicken_breast: 'Pasture-raised or organic bone-in, skin-on breast; no solution added.',
  egg_duck_quail: 'Pasture-raised duck or quail eggs with organic feed.',
};
for (const [id, decision] of Object.entries(DECISIONS)) OLD[id] = { ...OLD[id], decision };
export const OLD_CARTS = Object.fromEntries(Object.entries(OLD).filter(([, v]) => v.cart_pick).map(([id, v]) => [id, v.cart_pick]));
export const restoreOrganicCarts = (kb) => {
  for (const e of kb.entries) if (OLD[e.id]) Object.assign(e, OLD[e.id]);
  return kb;
};
const RAW = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
// The decision as the live KB serves it (list rows read it through the matcher, so restored KBs cannot stand in).
export const liveDecision = (id) => RAW.entries.find((e) => e.id === id).decision;
