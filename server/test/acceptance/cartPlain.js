import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
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
// clean-sweep-J1 (2026-10-22): produce, potato and four picks after 52b0a8c; cleanPickJ1.test.js owns the live copy.
// Every older pin reads them as of 52b0a8c, then the OLD strings above.
export const CLEAN_J1 = new Set(['produce_root_vegetables', 'organic_worth_it_by_type', 'frozen_vs_fresh_produce', 'produce_peppers', 'produce_citrus', 'produce_stone_fruit', 'produce_green_beans', 'pick_cucumbers', 'pick_canned_tomatoes', 'pick_juice', 'pick_egg_whites']);
export const CLEAN_J1_BASE = '52b0a8c';
const PRE_J1 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J1_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ1 = (e) => (e && CLEAN_J1.has(e.id) ? structuredClone(PRE_J1.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J3 (2026-10-22): meat and poultry after 69bb605; cleanPickJ3.test.js owns the live copy.
// Every older pin reads them as of 69bb605 (J3 and J1 ids are disjoint, so the order is free).
export const CLEAN_J3 = new Set(['beef_grassfed_vs_grainfed', 'butcher_counter_asking', 'bacon', 'ham', 'pick_sausage', 'pick_jerky', 'rotisserie_chicken', 'chicken_cuts_basics', 'chicken_breast', 'turkey_whole', 'ground_turkey']);
export const CLEAN_J3_BASE = '69bb605';
const PRE_J3 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J3_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ3 = (e) => (e && CLEAN_J3.has(e.id) ? structuredClone(PRE_J3.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J4 (2026-10-22): seafood after 6d98564; cleanPickJ4.test.js owns the live copy.
// Every older pin reads them as of 6d98564 (J4, J3 and J1 ids are disjoint).
export const CLEAN_J4 = new Set(['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'canned_fish_choosing', 'farmed_fish_by_species', 'white_fish', 'smoked_salmon', 'seafood_counter', 'pick_fish_sticks', 'pick_anchovies']);
export const CLEAN_J4_BASE = '6d98564';
const PRE_J4 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J4_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ4 = (e) => (e && CLEAN_J4.has(e.id) ? structuredClone(PRE_J4.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J5 (2026-10-22): dairy and plant milks after 5706fee; cleanPickJ5.test.js owns the live copy.
// Every older pin reads them as of 5706fee (J5, J4, J3 and J1 ids are disjoint).
export const CLEAN_J5 = new Set(['grassfed_butter', 'whole_vs_reduced_fat_milk', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'cream_vs_creamer', 'ice_cream', 'goat_sheep_dairy', 'plant_butter', 'dairy_case', 'almond_milk', 'soy_milk', 'coconut_milk_beverage', 'oat_milk']);
export const CLEAN_J5_BASE = '5706fee';
const PRE_J5 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J5_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ5 = (e) => (e && CLEAN_J5.has(e.id) ? structuredClone(PRE_J5.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J6 (2026-10-22): deli, eggs and frozen after 8600937; cleanPickJ6.test.js owns the live copy.
// Every older pin reads them as of 8600937 (J6 ids are disjoint from J1-J5).
export const CLEAN_J6 = new Set(['egg_labels', 'deli_meat_uncured', 'deli_salads', 'frozen_pizza', 'frozen_meals', 'frozen_fries', 'frozen_nuggets', 'frozen_waffles']);
export const CLEAN_J6_BASE = '8600937';
const PRE_J6 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J6_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ6 = (e) => (e && CLEAN_J6.has(e.id) ? structuredClone(PRE_J6.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J7 (2026-10-22): pantry and fats after 974ec27; cleanPickJ7.test.js owns the live copy.
// Every older pin reads them as of 974ec27 (J7 ids are disjoint from J1-J6).
export const CLEAN_J7 = new Set(['nuts_raw_vs_roasted', 'honey_adulteration', 'beans_dried_vs_canned', 'bulk_bins_buying', 'cooking_oils', 'lard_tallow', 'canned_coconut_milk', 'canned_soup', 'raw_cider_vinegar', 'whole_spices']);
export const CLEAN_J7_BASE = '974ec27';
const PRE_J7 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J7_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ7 = (e) => (e && CLEAN_J7.has(e.id) ? structuredClone(PRE_J7.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J8 (2026-10-22): bread, grains and drinks after e8cf851; cleanPickJ8.test.js owns the live copy.
// Every older pin reads them as of e8cf851 (J8 ids are disjoint from J1-J7).
export const CLEAN_J8 = new Set(['sandwich_bread', 'bagels', 'gluten_free_bread', 'buns_rolls', 'pastries_muffins', 'breakfast_cereal', 'oats_steelcut_rolled_instant', 'grains_beyond_rice', 'sourdough']);
export const CLEAN_J8_BASE = 'e8cf851';
const PRE_J8 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J8_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ8 = (e) => (e && CLEAN_J8.has(e.id) ? structuredClone(PRE_J8.entries.find((x) => x.id === e.id)) : e);
// clean-sweep-J9 (2026-10-22): snacks, condiments and labels after 53c6f90; cleanPickJ9.test.js owns the live copy.
// Eight live-flagged ids plus the explicitly pinned rBST label; J1-J8 ids are disjoint.
export const CLEAN_J9 = new Set(['mayo', 'crackers', 'potato_chips', 'popcorn', 'snack_bars', 'label_nonGMO_vs_organic', 'label_organic_scope', 'label_cold_pressed_expeller', 'label_no_added_hormones']);
export const CLEAN_J9_BASE = '53c6f90';
const PRE_J9 = JSON.parse(execFileSync('git', ['show', `${CLEAN_J9_BASE}:server/kristy_perimeter_kb.json`], { cwd: join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..'), maxBuffer: 64 << 20 }).toString());
export const preCleanJ9 = (e) => (e && CLEAN_J9.has(e.id) ? structuredClone(PRE_J9.entries.find((x) => x.id === e.id)) : e);
export const restoreOrganicCarts = (kb) => {
  kb.entries = kb.entries.map(preCleanJ9).map(preCleanJ8).map(preCleanJ7).map(preCleanJ6).map(preCleanJ5).map(preCleanJ4).map(preCleanJ3).map(preCleanJ1);
  for (const e of kb.entries) if (OLD[e.id]) Object.assign(e, OLD[e.id]);
  return kb;
};
const RAW = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
// The decision as the live KB serves it (list rows read it through the matcher, so restored KBs cannot stand in).
export const liveDecision = (id) => RAW.entries.find((e) => e.id === id).decision;
