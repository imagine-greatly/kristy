# Concern coverage

Analysis, not card copy. Built 2026-10-18 by grepping every counter-KB entry (`server/kristy_perimeter_kb.json`, 211 entries incl. picks) for each register concern's label terms across `decision`, `short_answer`, `detail`, `buying_tips`, `watch_out`, `labels_decoded` and `pick_steps`, lowercased. Engine ids checked against `server/kristy_ingredient_knowledge_base.json` (74 entries). Concern ids and evidence: `docs/CONCERN-REGISTER.md`.

**Status rule (mechanical).** Each concern names its *home cards*: the cards where a shopper meets it.
- **COVERED**: every home card mentions the concern's terms.
- **PARTIAL**: some home cards mention it, or only non-home cards do.
- **MISSING**: no card mentions it, or no card exists where the shopper meets it.

A term match is a mention, not a verdict: a card can name "organic" without giving a ladder. The ladder list in B is the judgement layer.

**Totals:** 100 concerns: 13 COVERED, 66 PARTIAL, 21 MISSING.

## A. Matrix

| concern | status | home cards mentioning | home cards missing | other cards mentioning | engine KB |
|---|---|---|---|---|---|
| `synthetic_dyes` | PARTIAL | label_artificial_color | breakfast_cereal, frozen_waffles, snack_bars, pick_juice, snacks, yogurt_plain_vs_flavored | ketchup_mustard | red_40, yellow_5, yellow_6, red_3, blue_1 |
| `caramel_color` | PARTIAL (non-home only) | — | hot_soy_sauce, condiments, pasta_sauce | label_multigrain_vs_whole_grain | caramel_color_iv |
| `titanium_dioxide` | PARTIAL (non-home only) | — | cream_vs_creamer | label_artificial_color | titanium_dioxide |
| `bha_bht` | MISSING | — | breakfast_cereal, crackers, potato_chips | — | bha, bht |
| `tbhq_propyl_gallate` | MISSING | — | frozen_nuggets, crackers, cooking_oils, frozen_fries | — | tbhq (propyl gallate: none) |
| `sodium_benzoate` | MISSING | — | pick_juice, condiments, fermented_pickles, ketchup_mustard | — | sodium_benzoate |
| `potassium_bromate` | PARTIAL | sandwich_bread, flour_basics | buns_rolls, bagels, bread_aisle | — | potassium_bromate |
| `azodicarbonamide` | PARTIAL | sandwich_bread | buns_rolls | — | azodicarbonamide |
| `propylparaben` | MISSING | — | tortillas, pastries_muffins | — | none |
| `bvo` | MISSING | — | pick_juice | — | brominated_vegetable_oil |
| `carrageenan` | PARTIAL | cream_vs_creamer | almond_milk, oat_milk, soy_milk, coconut_milk_beverage, ice_cream, cottage_cheese, sour_cream, cream_cheese, deli_meat_uncured | — | carrageenan |
| `synthetic_emulsifiers` | MISSING | — | ice_cream, cream_vs_creamer | — | polysorbate_80, carboxymethylcellulose |
| `gums_stabilizers` | PARTIAL | coconut_milk_beverage, canned_coconut_milk | almond_milk, oat_milk, soy_milk | label_pasture_raised_feed, chicken_cuts_basics, cream_vs_creamer, label_artificial_color, canned_tuna, gluten_free_bread, ketchup_mustard, hummus +1 | guar_gum, xanthan_gum |
| `natural_flavors` | PARTIAL | label_no_artificial_flavors | yogurt_plain_vs_flavored, bottled_water_buying, kombucha, deli_meat_uncured | plant_butter | natural_flavors, artificial_flavors |
| `hidden_glutamates` | PARTIAL (non-home only) | — | canned_soup, broth, potato_chips, frozen_meals | hot_soy_sauce | msg, autolyzed_yeast_extract, hydrolyzed_vegetable_protein |
| `artificial_sweeteners` | PARTIAL | label_sugar_free_substitutes, yogurt_plain_vs_flavored | snack_bars | — | aspartame, sucralose, acesulfame_potassium, saccharin |
| `sugar_alcohols` | PARTIAL | label_sugar_free_substitutes | snack_bars, ice_cream | — | none |
| `phosphate_additives` | PARTIAL | pork_cuts_and_enhanced, rotisserie_chicken | deli_meat_uncured, ham, hot_dogs, turkey_bacon, frozen_nuggets | ground_beef_lean_ratio, sandwich_bread, scallops | none |
| `hidden_sugars` | PARTIAL | label_ingredient_order, label_lightly_sweetened, breakfast_cereal, snack_bars | pasta_sauce, ketchup_mustard, bacon | frozen_vs_fresh_produce, whole_vs_reduced_fat_milk, yogurt_plain_vs_flavored, oats_steelcut_rolled_instant, honey_adulteration, label_made_with_real, canned_fish_choosing, cream_vs_creamer +11 | high_fructose_corn_syrup, corn_syrup, dextrose, maltodextrin, evaporated_cane_juice, fruit_juice_concentrate |
| `added_nitrite` | PARTIAL | deli_meat_uncured, bacon, ham, turkey_bacon, cured_pork | hot_dogs, pick_sausage, pick_jerky | — | sodium_nitrite, sodium_nitrate, potassium_nitrite |
| `celery_powder_uncured` | PARTIAL | deli_meat_uncured, bacon, hot_dogs, ham, turkey_bacon, cured_pork | pick_sausage, pick_jerky | revive_greens, pick_celery, cream_cheese | none |
| `processed_meat_iarc` | PARTIAL | deli_meat_uncured | bacon, hot_dogs, ham | — | none |
| `enhanced_meat` | PARTIAL | pork_cuts_and_enhanced, turkey_whole, chicken_breast, rotisserie_chicken | chicken_cuts_basics | beef_cuts_basics, baking_soda_soak, ground_turkey, ham, lamb_goat, scallops, tortilla_chips, pretzels | none |
| `deli_binders` | PARTIAL (non-home only) | — | deli_meat_uncured, ham, hot_dogs | rotisserie_chicken, ground_beef_lean_ratio, cheese_real_vs_processed, label_no_added_hormones, produce_storage, cream_vs_creamer, flour_basics, nut_butter_ingredients +7 | carrageenan, maltodextrin, modified_food_starch |
| `natural_label_meat` | COVERED | label_natural, chicken_breast, judging_meat_at_the_case | — | organic_worth_it_by_type, label_organic_scope, label_lightly_sweetened, chicken_cuts_basics, pork_cuts_and_enhanced, deli_meat_uncured, flour_basics, nut_butter_ingredients +10 | none |
| `welfare_claims` | PARTIAL | chicken_cuts_basics, pork_cuts_and_enhanced, label_third_party_seals | chicken_breast, ground_turkey, turkey_whole, judging_meat_at_the_case, butcher_counter_asking | beef_grassfed_vs_grainfed, egg_labels, label_natural, label_no_added_hormones, label_cage_free, label_grass_fed_term, label_pasture_raised_feed | none |
| `grassfed_claim` | COVERED | beef_grassfed_vs_grainfed, ground_beef_lean_ratio, beef_cuts_basics, label_grass_fed_term, bison, lamb_goat | — | whole_vs_reduced_fat_milk, yogurt_plain_vs_flavored, label_natural, label_pasture_raised_feed, label_third_party_seals, plain_kefir | none |
| `routine_antibiotics` | PARTIAL | chicken_cuts_basics | chicken_breast, ground_turkey, turkey_whole, pork_cuts_and_enhanced, beef_grassfed_vs_grainfed, rotisserie_chicken | salmon_wild_vs_farmed, egg_labels, label_organic_scope | none |
| `ractopamine` | MISSING | — | pork_cuts_and_enhanced, beef_grassfed_vs_grainfed, ground_beef_lean_ratio | — | none |
| `poultry_chill_wash` | PARTIAL | chicken_breast, chicken_cuts_basics, turkey_whole | ground_turkey | sandwich_bread | none |
| `organ_meat_value` | COVERED | organ_meats, ground_beef_lean_ratio | — | beef_grassfed_vs_grainfed, rotisserie_chicken, egg_labels, organic_worth_it_by_type, baking_soda_soak, yogurt_plain_vs_flavored, rice_arsenic, label_natural +18 | organ_meats |
| `mechanically_separated` | PARTIAL | hot_dogs, frozen_nuggets | deli_meat_uncured, pick_sausage | — | none |
| `liquid_smoke` | MISSING | — | bacon, ham, hot_dogs, pick_jerky, smoked_salmon | — | none |
| `mechanically_tenderized` | PARTIAL | beef_cuts_basics | judging_meat_at_the_case, butcher_counter_asking | venison_game | none |
| `animal_feed_organic` | PARTIAL | chicken_cuts_basics, rotisserie_chicken | pork_cuts_and_enhanced, bacon, ham, cured_pork, deli_meat_uncured, hot_dogs, chicken_breast, turkey_whole, ground_turkey, pick_sausage | beef_grassfed_vs_grainfed, egg_labels, organic_worth_it_by_type, baking_soda_soak, yogurt_plain_vs_flavored, rice_arsenic, label_natural, label_nonGMO_vs_organic +16 | none |
| `traditional_cure` | PARTIAL | cured_pork | ham | salmon_wild_vs_farmed, shrimp_imported_vs_domestic, rotisserie_chicken, raw_milk, rice_arsenic, honey_adulteration, label_cage_free, judging_meat_at_the_case +27 | none |
| `egg_feed` | PARTIAL | egg_labels, label_pasture_raised_feed | label_cage_free, egg_duck_quail, pick_egg_whites | salmon_wild_vs_farmed, grassfed_butter, label_natural, label_nonGMO_vs_organic, label_organic_scope, chicken_cuts_basics, farmed_fish_by_species, seafood_certifications +2 | none |
| `egg_organic_rung` | PARTIAL | egg_labels, label_pasture_raised_feed | label_cage_free, egg_duck_quail, pick_egg_whites | beef_grassfed_vs_grainfed, rotisserie_chicken, organic_worth_it_by_type, baking_soda_soak, yogurt_plain_vs_flavored, rice_arsenic, label_natural, label_nonGMO_vs_organic +15 | none |
| `egg_carton_terms` | COVERED | egg_labels, label_cage_free, label_pasture_raised_feed | — | label_natural, pork_cuts_and_enhanced | none |
| `vegetarian_fed` | PARTIAL | egg_labels | label_pasture_raised_feed | — | none |
| `omega3_eggs` | COVERED | egg_labels | — | salmon_wild_vs_farmed, mercury_by_fish | none |
| `rbst` | MISSING | — | whole_vs_reduced_fat_milk, dairy_case, cheese_real_vs_processed, yogurt_plain_vs_flavored, ice_cream | — | none |
| `ultra_pasteurized` | PARTIAL | whole_vs_reduced_fat_milk | dairy_case, cream_vs_creamer | raw_milk, goat_sheep_dairy | none |
| `raw_vs_pasteurized` | COVERED | raw_milk, raw_kefir, raw_aged_cheese, whole_vs_reduced_fat_milk | — | sauerkraut, kimchi, raw_cider_vinegar, miso, fermented, vinegar | none |
| `homogenization` | PARTIAL | whole_vs_reduced_fat_milk | dairy_case | raw_milk, raw_aged_cheese, goat_sheep_dairy | none |
| `a1_a2` | PARTIAL | whole_vs_reduced_fat_milk | goat_sheep_dairy | — | none |
| `dairy_ladder` | PARTIAL | whole_vs_reduced_fat_milk, grassfed_butter, yogurt_plain_vs_flavored, plain_kefir, dairy_case | cheese_real_vs_processed, sour_cream, cream_cheese, cottage_cheese, ice_cream, ghee, cream_vs_creamer, raw_aged_cheese | beef_grassfed_vs_grainfed, rotisserie_chicken, beef_cuts_basics, ground_beef_lean_ratio, egg_labels, organic_worth_it_by_type, baking_soda_soak, raw_milk +23 | none |
| `flavored_yogurt_sugar` | PARTIAL | yogurt_plain_vs_flavored | plain_kefir | rotisserie_chicken, frozen_vs_fresh_produce, whole_vs_reduced_fat_milk, oats_steelcut_rolled_instant, honey_adulteration, label_made_with_real, label_lightly_sweetened, canned_fish_choosing +36 | none |
| `shredded_cellulose` | PARTIAL | cheese_real_vs_processed | dairy_case | raw_cider_vinegar, salt | none |
| `natamycin` | COVERED | cheese_real_vs_processed | — | — | none |
| `milk_protein_concentrate` | MISSING | — | cheese_real_vs_processed, yogurt_plain_vs_flavored | — | none |
| `processed_cheese_salts` | COVERED | cheese_real_vs_processed | — | raw_aged_cheese | none |
| `plant_milk_oils` | PARTIAL | oat_milk, almond_milk, cream_vs_creamer, plant_butter | soy_milk, coconut_milk_beverage | salmon_wild_vs_farmed, grassfed_butter, nuts_raw_vs_roasted, canned_fish_choosing, nut_butter_ingredients, label_cold_pressed_expeller, pastries_muffins, cooking_oils +2 | canola_oil, sunflower_oil |
| `seed_oils` | PARTIAL | cooking_oils, nut_butter_ingredients, plant_butter, label_cold_pressed_expeller | mayo, potato_chips, tortilla_chips, crackers, frozen_fries, frozen_nuggets, snack_bars, hummus, rotisserie_chicken, popcorn, deli_salads | salmon_wild_vs_farmed, grassfed_butter, nuts_raw_vs_roasted, canned_fish_choosing, cream_vs_creamer, oat_milk, buns_rolls, pastries_muffins +4 | canola_oil, soybean_oil, corn_oil, sunflower_oil, safflower_oil, cottonseed_oil, grapeseed_oil, rice_bran_oil, vegetable_oil |
| `rbd_hexane` | PARTIAL | cooking_oils, label_cold_pressed_expeller | mayo | label_made_with_real, label_multigrain_vs_whole_grain, cream_vs_creamer, flour_basics, olive_oil_grades, sandwich_bread, breakfast_cereal, sprouted_grains +4 | none |
| `pho_trans` | PARTIAL | pastries_muffins, nut_butter_ingredients | crackers, frozen_pizza, plant_butter | lard_tallow, snack_bars | partially_hydrogenated_oil, margarine |
| `interesterified_fat` | MISSING | — | plant_butter, pastries_muffins, crackers | — | none |
| `palm_oil` | PARTIAL | nut_butter_ingredients | plant_butter, crackers, snack_bars | produce_ripeness_by_item, ice_cream, sugars | refined_palm_oil |
| `avocado_oil_blends` | PARTIAL (non-home only) | — | cooking_oils, mayo, potato_chips | plant_butter | none |
| `traditional_fats` | COVERED | cooking_oils, lard_tallow, ghee, grassfed_butter, olive_oil_grades | — | label_nonGMO_vs_organic, canned_fish_choosing, rancidity_check, nut_butter_ingredients, label_cold_pressed_expeller, produce_apples_pears, pick_anchovies, pastries_muffins +8 | extra_virgin_olive_oil |
| `glyphosate_desiccation` | MISSING | — | oats_steelcut_rolled_instant, breakfast_cereal, muesli, snack_bars, flour_basics, sandwich_bread, hummus, beans_dried_vs_canned, pasta_dry | — | none |
| `chlormequat` | MISSING | — | oats_steelcut_rolled_instant, breakfast_cereal, muesli | — | none |
| `protein_isolates` | PARTIAL (non-home only) | — | snack_bars, pick_jerky, frozen_nuggets | hot_soy_sauce | none |
| `bioengineered` | PARTIAL | label_nonGMO_vs_organic | pick_corn, soy_milk, pick_tofu, cooking_oils, sugars, tortilla_chips, tortillas, popcorn, breakfast_cereal | egg_labels, label_natural, label_organic_scope, label_third_party_seals | none |
| `chocolate_metals` | PARTIAL (non-home only) | — | cocoa | sprouted_grain_bread, sugars, pasta_sauce, mayo, condiments, crackers, snack_bars, trail_mix +3 | none |
| `rice_arsenic` | PARTIAL | rice_arsenic, grains_beyond_rice | crackers, gluten_free_bread | — | none |
| `protein_powder_metals` | MISSING | — | no home card | — | none |
| `whole_grain_tricks` | PARTIAL | sandwich_bread, label_multigrain_vs_whole_grain, bread_aisle, crackers, breakfast_cereal, tortillas, buns_rolls | bagels | flour_basics, bulk_bins_buying, rancidity_check, label_ingredient_order, pasta_dry, sprouted_grain_bread, sprouted_grains, specialty_flours +7 | none |
| `phytic_acid` | PARTIAL | sourdough, sprouted_grain_bread, sprouted_grains | sandwich_bread, oats_steelcut_rolled_instant, beans_dried_vs_canned, nuts_raw_vs_roasted | organic_worth_it_by_type, produce_seasonality, washing_produce, baking_soda_soak, yogurt_plain_vs_flavored, rice_arsenic, berries_picking, produce_storage +28 | none |
| `acrylamide` | MISSING | — | potato_chips, frozen_fries, crackers, coffee_beans | — | none |
| `bleached_enriched_flour` | PARTIAL | flour_basics, sandwich_bread, buns_rolls | specialty_flours, pastries_muffins, bagels | egg_labels, label_multigrain_vs_whole_grain, label_ingredient_order, label_cold_pressed_expeller, pasta_dry, bread_aisle, cooking_oils, snack_bars +1 | enriched_bleached_flour, bleached_flour |
| `dutch_cocoa` | COVERED | cocoa | — | bagels, tortillas, tortilla_chips, pretzels | none |
| `juice_vs_fruit` | PARTIAL (non-home only) | — | pick_juice | jam | fruit_juice_concentrate |
| `no_added_sugar_claims` | PARTIAL | label_lightly_sweetened, label_sugar_free_substitutes | snack_bars | yogurt_plain_vs_flavored, almond_milk, soy_milk, coconut_milk_beverage, cocoa, jam, crackers | none |
| `health_halo` | COVERED | label_front_vs_back, label_made_with_real, snacks | — | whole_vs_reduced_fat_milk, label_natural, label_pasture_raised_feed, label_lightly_sweetened, judging_meat_at_the_case, seafood_certifications, rancidity_check | none |
| `formula_dha_ara` | MISSING | — | no home card | salmon_wild_vs_farmed, grassfed_butter, label_no_artificial_flavors, cream_vs_creamer, turkey_whole, ground_turkey, pasta_dry, oat_milk +2 | none |
| `dirty_dozen` | PARTIAL | organic_worth_it_by_type, produce_leafy_greens, berries_picking, produce_apples_pears, produce_stone_fruit, produce_root_vegetables, produce_green_beans, produce_peppers | pick_swiss_chard | beef_grassfed_vs_grainfed, rotisserie_chicken, egg_labels, washing_produce, baking_soda_soak, yogurt_plain_vs_flavored, rice_arsenic, label_natural +14 | none |
| `clean_fifteen` | PARTIAL | organic_worth_it_by_type, produce_onions_garlic, produce_mushrooms, produce_bananas, produce_brassicas | pick_corn, pick_asparagus, pick_mangoes, pick_frozen_peas | egg_labels, baking_soda_soak, label_cage_free, produce_ripeness_by_item, berries_picking, nut_butter_ingredients, produce_root_vegetables, produce_citrus | none |
| `pfas_pesticides` | MISSING | — | organic_worth_it_by_type, produce_stone_fruit, berries_picking | — | none |
| `produce_coatings` | PARTIAL (non-home only) | — | produce_apples_pears, produce_citrus, washing_produce, pick_cucumbers, produce_peppers | cheese_real_vs_processed, nuts_raw_vs_roasted, grains_beyond_rice, produce_green_beans, popcorn | carnauba_wax |
| `citrus_fungicides` | PARTIAL (non-home only) | — | produce_citrus | baking_soda_soak | none |
| `sulfites` | PARTIAL | dried_fruit | shrimp_imported_vs_domestic | — | sulfites |
| `raw_sprouts` | COVERED | sprouts_raw | — | shrimp_imported_vs_domestic, beef_grassfed_vs_grainfed, rotisserie_chicken, egg_labels, freezing_produce, grassfed_butter, whole_vs_reduced_fat_milk, yogurt_plain_vs_flavored +52 | none |
| `irradiation` | PARTIAL | dried_herbs | whole_spices, label_organic_scope | — | none |
| `seasonal_local` | COVERED | produce_seasonality | — | rotisserie_chicken, ground_beef_lean_ratio, grassfed_butter, produce_ripeness_by_item, raw_aged_cheese, pick_sausage, ground_turkey, dairy_case +5 | none |
| `farmed_salmon_contaminants` | MISSING | — | salmon_wild_vs_farmed, smoked_salmon, label_wild_vs_farm_raised | — | none |
| `salmon_color_added` | PARTIAL | salmon_wild_vs_farmed | smoked_salmon, label_wild_vs_farm_raised | label_artificial_color | none |
| `seafood_antibiotics` | PARTIAL | salmon_wild_vs_farmed | shrimp_imported_vs_domestic, farmed_fish_by_species | egg_labels, label_organic_scope, chicken_cuts_basics | none |
| `shrimp_bacteria` | PARTIAL (non-home only) | — | shrimp_imported_vs_domestic | egg_labels, whole_vs_reduced_fat_milk, yogurt_plain_vs_flavored, raw_kefir, sprouts_raw, sourdough, pick_egg_whites, plain_kefir +10 | none |
| `seafood_stpp` | PARTIAL | scallops | shrimp_imported_vs_domestic, white_fish, seafood_counter | rotisserie_chicken, ground_beef_lean_ratio, pork_cuts_and_enhanced, sandwich_bread, tortillas, muesli, seeds, seaweed +1 | none |
| `co_treated_fish` | MISSING | — | seafood_counter | — | none |
| `mercury` | PARTIAL | mercury_by_fish, canned_tuna, canned_fish_choosing | seafood_counter | — | none |
| `seafood_mislabeling` | PARTIAL | white_fish | seafood_counter, crab | label_pasture_raised_feed, label_sugar_free_substitutes, label_wild_vs_farm_raised, seaweed, frozen_pizza | none |
| `pangasius_tilapia` | PARTIAL | farmed_fish_by_species | white_fish, pick_fish_sticks | mercury_by_fish | none |
| `msc_low_bar` | PARTIAL | seafood_certifications | canned_tuna, pick_fish_sticks | — | none |
| `phthalates_bisphenols` | PARTIAL (non-home only) | — | cheese_real_vs_processed, prepared_meals, frozen_meals | berries_picking, bottled_water_buying, produce_brassicas, produce_onions_garlic, produce_leafy_greens, produce_apples_pears, produce_mushrooms, canned_soup +1 | none |
| `bpa_cans` | PARTIAL | beans_dried_vs_canned | canned_soup, canned_fish_choosing, canned_tuna, pick_canned_tomatoes, canned_coconut_milk | bottled_water_buying | none |
| `pfas_packaging` | MISSING | — | popcorn, prepared_meals | — | none |
| `plastic_teabags` | PARTIAL (non-home only) | — | tea | berries_picking, bottled_water_buying, produce_brassicas, produce_onions_garlic, produce_leafy_greens, produce_apples_pears, produce_mushrooms, canned_soup +1 | none |
| `aluminum_contact` | MISSING | — | no home card | — | none |

## B. Per-card gaps

114 cards miss at least one concern that applies to them. Concerns are listed with the priority concern first (celery/uncured, nitrite, feed, egg rungs, dairy ladder, seed oils), then register order.

### 1. Deli and cured meats

| card | category | missing concerns |
|---|---|---|
| `deli_meat_uncured` | deli | animal_feed_organic, carrageenan, natural_flavors, phosphate_additives, deli_binders, mechanically_separated |
| `ham` | deli | animal_feed_organic, phosphate_additives, processed_meat_iarc, deli_binders, liquid_smoke, traditional_cure |
| `hot_dogs` | deli | added_nitrite, animal_feed_organic, phosphate_additives, processed_meat_iarc, deli_binders, liquid_smoke |
| `bacon` | deli | animal_feed_organic, hidden_sugars, processed_meat_iarc, liquid_smoke |
| `pick_jerky` | pork | celery_powder_uncured, added_nitrite, liquid_smoke, protein_isolates |
| `pick_sausage` | pork | celery_powder_uncured, added_nitrite, animal_feed_organic, mechanically_separated |
| `cured_pork` | deli | animal_feed_organic |
| `turkey_bacon` | deli | phosphate_additives |

### 2. Eggs (feed first, organic second)

| card | category | missing concerns |
|---|---|---|
| `egg_duck_quail` | poultry_eggs | egg_feed, egg_organic_rung |
| `label_cage_free` | label_terms | egg_feed, egg_organic_rung |
| `pick_egg_whites` | poultry_eggs | egg_feed, egg_organic_rung |
| `label_pasture_raised_feed` | label_terms | vegetarian_fed |

### 3. Dairy

| card | category | missing concerns |
|---|---|---|
| `ice_cream` | dairy | dairy_ladder, carrageenan, synthetic_emulsifiers, sugar_alcohols, rbst |
| `cheese_real_vs_processed` | dairy | dairy_ladder, rbst, milk_protein_concentrate, phthalates_bisphenols |
| `cream_vs_creamer` | dairy | dairy_ladder, titanium_dioxide, synthetic_emulsifiers, ultra_pasteurized |
| `dairy_case` | dairy | rbst, ultra_pasteurized, homogenization, shredded_cellulose |
| `soy_milk` | dairy | carrageenan, gums_stabilizers, plant_milk_oils, bioengineered |
| `yogurt_plain_vs_flavored` | dairy | synthetic_dyes, natural_flavors, rbst, milk_protein_concentrate |
| `plant_butter` | dairy | pho_trans, interesterified_fat, palm_oil |
| `almond_milk` | dairy | carrageenan, gums_stabilizers |
| `coconut_milk_beverage` | dairy | carrageenan, plant_milk_oils |
| `cottage_cheese` | dairy | dairy_ladder, carrageenan |
| `cream_cheese` | dairy | dairy_ladder, carrageenan |
| `oat_milk` | dairy | carrageenan, gums_stabilizers |
| `sour_cream` | dairy | dairy_ladder, carrageenan |
| `ghee` | dairy | dairy_ladder |
| `goat_sheep_dairy` | dairy | a1_a2 |
| `plain_kefir` | dairy | flavored_yogurt_sugar |
| `raw_aged_cheese` | dairy | dairy_ladder |
| `whole_vs_reduced_fat_milk` | dairy | rbst |

### 4. Oils and fats

| card | category | missing concerns |
|---|---|---|
| `cooking_oils` | bulk_pantry | tbhq_propyl_gallate, avocado_oil_blends, bioengineered |
| `mayo` | bulk_pantry | seed_oils, rbd_hexane, avocado_oil_blends |

### 5. Everything else

| card | category | missing concerns |
|---|---|---|
| `crackers` | bulk_pantry | seed_oils, bha_bht, tbhq_propyl_gallate, pho_trans, interesterified_fat, palm_oil, rice_arsenic, acrylamide |
| `snack_bars` | bulk_pantry | seed_oils, synthetic_dyes, artificial_sweeteners, sugar_alcohols, palm_oil, glyphosate_desiccation, protein_isolates, no_added_sugar_claims |
| `breakfast_cereal` | bulk_pantry | synthetic_dyes, bha_bht, glyphosate_desiccation, chlormequat, bioengineered |
| `potato_chips` | bulk_pantry | seed_oils, bha_bht, hidden_glutamates, avocado_oil_blends, acrylamide |
| `frozen_nuggets` | bulk_pantry | seed_oils, tbhq_propyl_gallate, phosphate_additives, protein_isolates |
| `ground_turkey` | poultry | animal_feed_organic, welfare_claims, routine_antibiotics, poultry_chill_wash |
| `pick_juice` | bulk_pantry | synthetic_dyes, sodium_benzoate, bvo, juice_vs_fruit |
| `seafood_counter` | seafood | seafood_stpp, co_treated_fish, mercury, seafood_mislabeling |
| `shrimp_imported_vs_domestic` | seafood | sulfites, seafood_antibiotics, shrimp_bacteria, seafood_stpp |
| `bagels` | bulk_pantry | potassium_bromate, whole_grain_tricks, bleached_enriched_flour |
| `chicken_breast` | poultry | animal_feed_organic, welfare_claims, routine_antibiotics |
| `frozen_fries` | bulk_pantry | seed_oils, tbhq_propyl_gallate, acrylamide |
| `oats_steelcut_rolled_instant` | bulk_pantry | glyphosate_desiccation, chlormequat, phytic_acid |
| `pastries_muffins` | bulk_pantry | propylparaben, interesterified_fat, bleached_enriched_flour |
| `popcorn` | bulk_pantry | seed_oils, bioengineered, pfas_packaging |
| `pork_cuts_and_enhanced` | pork | animal_feed_organic, routine_antibiotics, ractopamine |
| `smoked_salmon` | seafood | liquid_smoke, farmed_salmon_contaminants, salmon_color_added |
| `turkey_whole` | poultry | animal_feed_organic, welfare_claims, routine_antibiotics |
| `beans_dried_vs_canned` | bulk_pantry | glyphosate_desiccation, phytic_acid |
| `beef_grassfed_vs_grainfed` | beef | routine_antibiotics, ractopamine |
| `buns_rolls` | bulk_pantry | potassium_bromate, azodicarbonamide |
| `butcher_counter_asking` | meat_counter | welfare_claims, mechanically_tenderized |
| `canned_soup` | bulk_pantry | hidden_glutamates, bpa_cans |
| `canned_tuna` | seafood | msc_low_bar, bpa_cans |
| `condiments` | bulk_pantry | caramel_color, sodium_benzoate |
| `frozen_meals` | bulk_pantry | hidden_glutamates, phthalates_bisphenols |
| `hummus` | bulk_pantry | seed_oils, glyphosate_desiccation |
| `judging_meat_at_the_case` | meat_counter | welfare_claims, mechanically_tenderized |
| `ketchup_mustard` | bulk_pantry | sodium_benzoate, hidden_sugars |
| `label_wild_vs_farm_raised` | label_terms | farmed_salmon_contaminants, salmon_color_added |
| `muesli` | bulk_pantry | glyphosate_desiccation, chlormequat |
| `pasta_sauce` | bulk_pantry | caramel_color, hidden_sugars |
| `pick_corn` | produce | bioengineered, clean_fifteen |
| `pick_fish_sticks` | seafood | pangasius_tilapia, msc_low_bar |
| `prepared_meals` | bulk_pantry | phthalates_bisphenols, pfas_packaging |
| `produce_citrus` | produce | produce_coatings, citrus_fungicides |
| `rotisserie_chicken` | poultry | seed_oils, routine_antibiotics |
| `sandwich_bread` | bulk_pantry | glyphosate_desiccation, phytic_acid |
| `tortilla_chips` | bulk_pantry | seed_oils, bioengineered |
| `tortillas` | bulk_pantry | propylparaben, bioengineered |
| `white_fish` | seafood | seafood_stpp, pangasius_tilapia |
| `berries_picking` | produce | pfas_pesticides |
| `bottled_water_buying` | bulk_pantry | natural_flavors |
| `bread_aisle` | bulk_pantry | potassium_bromate |
| `broth` | bulk_pantry | hidden_glutamates |
| `canned_coconut_milk` | bulk_pantry | bpa_cans |
| `canned_fish_choosing` | seafood | bpa_cans |
| `chicken_cuts_basics` | poultry | enhanced_meat |
| `cocoa` | bulk_pantry | chocolate_metals |
| `coffee_beans` | bulk_pantry | acrylamide |
| `crab` | seafood | seafood_mislabeling |
| `deli_salads` | bulk_pantry | seed_oils |
| `farmed_fish_by_species` | seafood | seafood_antibiotics |
| `fermented_pickles` | bulk_pantry | sodium_benzoate |
| `flour_basics` | bulk_pantry | glyphosate_desiccation |
| `frozen_pizza` | bulk_pantry | pho_trans |
| `frozen_waffles` | bulk_pantry | synthetic_dyes |
| `gluten_free_bread` | bulk_pantry | rice_arsenic |
| `ground_beef_lean_ratio` | beef | ractopamine |
| `hot_soy_sauce` | bulk_pantry | caramel_color |
| `kombucha` | bulk_pantry | natural_flavors |
| `label_organic_scope` | label_terms | irradiation |
| `nuts_raw_vs_roasted` | bulk_pantry | phytic_acid |
| `organic_worth_it_by_type` | produce | pfas_pesticides |
| `pasta_dry` | bulk_pantry | glyphosate_desiccation |
| `pick_asparagus` | produce | clean_fifteen |
| `pick_canned_tomatoes` | bulk_pantry | bpa_cans |
| `pick_cucumbers` | produce | produce_coatings |
| `pick_frozen_peas` | produce | clean_fifteen |
| `pick_mangoes` | produce | clean_fifteen |
| `pick_swiss_chard` | produce | dirty_dozen |
| `pick_tofu` | produce | bioengineered |
| `produce_apples_pears` | produce | produce_coatings |
| `produce_peppers` | produce | produce_coatings |
| `produce_stone_fruit` | produce | pfas_pesticides |
| `salmon_wild_vs_farmed` | seafood | farmed_salmon_contaminants |
| `snacks` | bulk_pantry | synthetic_dyes |
| `specialty_flours` | bulk_pantry | bleached_enriched_flour |
| `sugars` | bulk_pantry | bioengineered |
| `tea` | bulk_pantry | plastic_teabags |
| `washing_produce` | produce | produce_coatings |
| `whole_spices` | bulk_pantry | irradiation |

### Cards lacking an organic / grass-fed / pasture ladder where one applies

From the misses on `animal_feed_organic`, `grassfed_claim`, `dairy_ladder`, `egg_organic_rung`, `egg_feed`, `dirty_dozen`, `welfare_claims`. 24 cards.

| card | category | ladder missing |
|---|---|---|
| `bacon` | deli | animal_feed_organic |
| `cured_pork` | deli | animal_feed_organic |
| `deli_meat_uncured` | deli | animal_feed_organic |
| `ham` | deli | animal_feed_organic |
| `hot_dogs` | deli | animal_feed_organic |
| `pick_sausage` | pork | animal_feed_organic |
| `egg_duck_quail` | poultry_eggs | egg_feed, egg_organic_rung |
| `label_cage_free` | label_terms | egg_feed, egg_organic_rung |
| `pick_egg_whites` | poultry_eggs | egg_feed, egg_organic_rung |
| `cheese_real_vs_processed` | dairy | dairy_ladder |
| `cottage_cheese` | dairy | dairy_ladder |
| `cream_cheese` | dairy | dairy_ladder |
| `cream_vs_creamer` | dairy | dairy_ladder |
| `ghee` | dairy | dairy_ladder |
| `ice_cream` | dairy | dairy_ladder |
| `raw_aged_cheese` | dairy | dairy_ladder |
| `sour_cream` | dairy | dairy_ladder |
| `butcher_counter_asking` | meat_counter | welfare_claims |
| `chicken_breast` | poultry | welfare_claims, animal_feed_organic |
| `ground_turkey` | poultry | welfare_claims, animal_feed_organic |
| `judging_meat_at_the_case` | meat_counter | welfare_claims |
| `pick_swiss_chard` | produce | dirty_dozen |
| `pork_cuts_and_enhanced` | pork | animal_feed_organic |
| `turkey_whole` | poultry | welfare_claims, animal_feed_organic |

## C. Proposed engine KB additions

Only sourced concerns that would appear on a packaged-scan ingredient list and have no (or incomplete) engine entry. Proposals for review under the server governance rule; nothing is applied. 19 lines.

- **blue_2 / green_3 (aliases or new entries)**: aliases blue 2, fd&c blue no. 2, indigotine, green 3, fd&c green no. 3, fast green fcf. Synthetic dyes with no engine entry; same class as red_40/blue_1. Concern `synthetic_dyes`. Source: `additives/ewg-dirty-dozen-food-chemicals.md`.
- **propyl_gallate**: aliases propyl gallate, e310. Synthetic antioxidant preservative paired with BHA/BHT in fats. Concern `tbhq_propyl_gallate`. Source: `additives/ewg-dirty-dozen-food-chemicals.md`.
- **sodium_benzoate (aliases)**: aliases benzoic acid, potassium benzoate, e211, e212. Same preservative family; aliases missing from engine. Concern `sodium_benzoate`. Source: `additives/cspi-sodium-benzoate.md`.
- **propylparaben**: aliases propylparaben, propyl paraben, propyl p-hydroxybenzoate, e216. Paraben preservative named in CA AB418. Concern `propylparaben`. Source: `additives/ca-ab418-text.md`; `additives/ewg-dirty-dozen-food-chemicals.md`.
- **polysorbate_80 (aliases)**: aliases polysorbate 60, polysorbate 65, e433, e435, e436. Same emulsifier family; only 80 is in the engine. Concern `synthetic_emulsifiers`. Source: `additives/cspi-polysorbate.md`.
- **sugar_alcohols (+ erythritol)**: aliases erythritol, maltitol, sorbitol, xylitol, mannitol, isomalt, lactitol, maltitol syrup. Polyols used to claim "no added sugar"; erythritol has its own research thread. Concern `sugar_alcohols`. Source: `additives/cspi-chemical-cuisine-ratings-list.md`; `packaged/clevelandclinic-erythritol.md`.
- **phosphate_additives**: aliases sodium phosphate, disodium phosphate, trisodium phosphate, sodium tripolyphosphate, sodium hexametaphosphate, phosphoric acid, sodium acid pyrophosphate. Inorganic phosphate salts used to hold water in meat and seafood. Concern `phosphate_additives`. Source: `meat/theconversation-deli-meat.md`; `additives/cspi-chemical-cuisine-ratings-list.md`.
- **celery_powder**: aliases celery powder, cultured celery powder, celery juice powder, celery juice, celery extract, cultured celery extract. Plant source of nitrite used to cure "uncured" meats. Concern `celery_powder_uncured`. Source: `meat/npr-no-nitrates-added.md`; `meat/cr-decoding-meat-labels.md`.
- **mechanically_separated_meat**: aliases mechanically separated chicken, mechanically separated turkey, mechanically separated pork, mechanically deboned. Meat paste recovered from bones under pressure. Concern `mechanically_separated`. Source: `meat/wikipedia-mechanically-separated-meat.md` (WEAK).
- **smoke_flavoring**: aliases smoke flavoring, smoke flavour, liquid smoke, natural smoke flavor, hickory smoke flavor. Condensed smoke added in place of smoking. Concern `liquid_smoke`. Source: `meat/iastate-liquid-smoke.md`.
- **powdered_cellulose**: aliases cellulose, powdered cellulose, cellulose powder (anti-caking). Anti-caking filler; flag as processing, counter-view on harm. Concern `shredded_cellulose`. Source: `dairy_eggs_packaging/healthyuwellness-shredded-cheese.md` (COUNTER-VIEW).
- **natamycin**: aliases natamycin, pimaricin, e235, natural mold inhibitor. Antifungal preservative on cheese; counter-view on harm. Concern `natamycin`. Source: `dairy_eggs_packaging/slate-natamycin.md` (COUNTER-VIEW).
- **milk_protein_concentrate**: aliases milk protein concentrate, milk protein isolate, mpc. Ultrafiltered dairy powder used to build texture/protein. Concern `milk_protein_concentrate`. Source: `dairy_eggs_packaging/thinkusadairy-mpc-technical-report.md` (industry).
- **emulsifying_salts**: aliases sodium citrate, sodium hexametaphosphate, disodium phosphate, sodium aluminum phosphate (in cheese). Salts that turn cheese into processed cheese. Concern `processed_cheese_salts`. Source: `dairy_eggs_packaging/pubmed-emulsifying-salts-processed-cheese.md`.
- **interesterified_oil**: aliases interesterified oil, interesterified soybean oil, interesterified fat, fully hydrogenated soybean oil (blend). Chemically rearranged fat replacing PHO. Concern `interesterified_fat`. Source: `pantry/cspi-interesterified-oil.md`.
- **protein_isolates**: aliases soy protein isolate, isolated soy protein, pea protein isolate, whey protein isolate, textured vegetable protein, soy protein concentrate. Industrially fractionated proteins used to inflate protein claims. Concern `protein_isolates`. Source: `pantry/wapf-ploy-of-soy.md`; `packaged/wapf-snack-attack.md` (WEAK).
- **dha_ara_oils**: aliases dha algal oil, arachidonic acid, ara, c. cohnii oil, m. alpina oil, schizochytrium oil. Lab-grown algal/fungal oils, often hexane-extracted, in formula. Concern `formula_dha_ara`. Source: `packaged/cornucopia-infant-formula.md`.
- **added_color_fish_feed**: aliases color added, astaxanthin, canthaxanthin (on salmon/trout labels). Feed-derived color in farmed salmon, required label line. Concern `salmon_color_added`. Source: `produce_seafood/qz-farmed-salmon-color-added.md`.
- **cheese_powder**: aliases cheese powder, cheese sauce mix, dehydrated cheese. Ingredient flag for the highest-phthalate food tested. Concern `phthalates_bisphenols`. Source: `dairy_eggs_packaging/cfs-mac-cheese-phthalates.md`.

## D. Top-20 actions by shopper impact

1. **Deli cure truth on the uncovered cured items** (`celery_powder_uncured`, `added_nitrite`): `pick_sausage` and `pick_jerky` name neither celery cure nor nitrite; `hot_dogs` never names nitrite in its card fields (only in a source URL). Highest-traffic gap in the priority-1 group.
2. **Organic / pasture feed ladder for pork, poultry and deli** (`animal_feed_organic`): missing on 10 cards incl. `pork_cuts_and_enhanced`, `bacon`, `ham`, `cured_pork`, `deli_meat_uncured`, `hot_dogs`, `chicken_breast`, `turkey_whole`, `ground_turkey`, `pick_sausage`. Evidence is WEAK (farm sources); pair with `welfare_claims` (STRONG, CR/ASPCA) for the seal rungs.
3. **Deli ingredient-list reading** (`phosphate_additives`, `deli_binders`, `carrageenan`, `mechanically_separated`): `deli_meat_uncured`, `ham`, `hot_dogs`, `turkey_bacon` miss phosphates; deli/ham/hot dogs miss binders; `deli_meat_uncured` misses carrageenan and mechanically separated meat.
4. **IARC Group 1 classification on bacon, hot dogs, ham** (`processed_meat_iarc`): only `deli_meat_uncured` carries it. State the classification as label-truth context, never as an effect.
5. **Smoke flavoring** (`liquid_smoke`, MISSING): no card names it; home cards `bacon`, `ham`, `hot_dogs`, `pick_jerky`, `smoked_salmon`. Pair with the `smoke_flavoring` engine proposal in C.
6. **Egg rungs off the main egg card** (`egg_feed`, `egg_organic_rung`): `egg_labels` covers both; `label_cage_free`, `egg_duck_quail`, `pick_egg_whites` carry neither rung. Feed first, organic second.
7. **Dairy grass-fed/organic ladder** (`dairy_ladder`): missing on `cheese_real_vs_processed`, `sour_cream`, `cream_cheese`, `cottage_cheese`, `ice_cream`, `ghee`, `cream_vs_creamer`, `raw_aged_cheese`.
8. **rBST** (`rbst`, MISSING): no card names it; home `whole_vs_reduced_fat_milk`, `dairy_case`, `cheese_real_vs_processed`, `yogurt_plain_vs_flavored`, `ice_cream`. Evidence WEAK (advocacy) — use as a label-term gloss, not a concern claim.
9. **Carrageenan where shoppers meet it** (`carrageenan`): only `cream_vs_creamer` names it; missing on all four plant milks, `ice_cream`, `cottage_cheese`, `sour_cream`, `cream_cheese`, `deli_meat_uncured`.
10. **Seed oils on packaged cards** (`seed_oils`): named on `cooking_oils`, `nut_butter_ingredients`, `plant_butter`, `label_cold_pressed_expeller`; missing on `mayo`, `potato_chips`, `tortilla_chips`, `crackers`, `frozen_fries`, `frozen_nuggets`, `snack_bars`, `hummus`, `rotisserie_chicken`, `popcorn`, `deli_salads`. Keep the CSPI counter-view on file.
11. **Glyphosate drying + chlormequat on oats, grains, pulses** (`glyphosate_desiccation`, `chlormequat`, both MISSING): no card names either; home `oats_steelcut_rolled_instant`, `breakfast_cereal`, `muesli`, `flour_basics`, `sandwich_bread`, `pasta_dry`, `hummus`, `beans_dried_vs_canned`, `snack_bars`. STRONG evidence (EWG testing, Cornucopia, Sask Pulse).
12. **Engine additions for scan-visible gaps** (section C): first `celery_powder`, `phosphate_additives`, `sugar_alcohols`, `propylparaben`, `smoke_flavoring`, `protein_isolates`; then the alias-only fixes (blue 2/green 3, benzoates, polysorbate 60/65). Server governance: propose, approve, then add.
13. **Synthetic dyes on the products that carry them** (`synthetic_dyes`): only `label_artificial_color` names them; missing on `breakfast_cereal`, `frozen_waffles`, `snack_bars`, `pick_juice`, `snacks`, `yogurt_plain_vs_flavored`.
14. **Synthetic antioxidants** (`bha_bht`, `tbhq_propyl_gallate`, both MISSING): no card names BHA/BHT/TBHQ; home `breakfast_cereal`, `crackers`, `potato_chips`, `frozen_nuggets`, `frozen_fries`, `cooking_oils`.
15. **Poultry/pork raising claims** (`routine_antibiotics`, `welfare_claims`, `ractopamine`): antibiotics missing on 6 poultry/pork/beef cards; welfare seals missing on `chicken_breast`, `ground_turkey`, `turkey_whole`, `judging_meat_at_the_case`, `butcher_counter_asking`; ractopamine on no card.
16. **Canned-food linings** (`bpa_cans`): only `beans_dried_vs_canned` names BPA; missing on `canned_soup`, `canned_fish_choosing`, `canned_tuna`, `pick_canned_tomatoes`, `canned_coconut_milk`.
17. **Farmed salmon** (`farmed_salmon_contaminants` MISSING, `salmon_color_added` PARTIAL): PCB/dioxin finding on no card; color-added missing on `smoked_salmon` and `label_wild_vs_farm_raised`.
18. **Shrimp and counter fish** (`seafood_stpp`, `seafood_antibiotics`, `co_treated_fish`, `mercury`, `seafood_mislabeling`): `shrimp_imported_vs_domestic` misses STPP/antibiotics/bacteria/sulfites; `seafood_counter` misses four of these.
19. **Bioengineered disclosure on GMO-crop foods** (`bioengineered`): named on `label_nonGMO_vs_organic` and a few others; missing on `pick_corn`, `pick_tofu`, `soy_milk`, `cooking_oils`, `sugars`, `tortillas`, `tortilla_chips`, `popcorn`, `breakfast_cereal`.
20. **Drinks and condiments preservatives + concerns with no card** (`sodium_benzoate`, `bvo` MISSING; `juice_vs_fruit`): `pick_juice`, `condiments`, `ketchup_mustard`, `fermented_pickles`. Separately, Devon decision: `protein_powder_metals` (STRONG, 3 sources), `formula_dha_ara` and `aluminum_contact` have no home card at all.
