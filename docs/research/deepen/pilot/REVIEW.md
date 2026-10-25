# Pilot review sheet

Generated 2026-10-26 from the four pilot tables and `server/kristy_perimeter_kb.json` (read-only; no KB edits). Status rule: a row is FETCHED if any listed source is FETCHED, HIGHLIGHT if all resolved sources are search-excerpt only, UNSOURCED if `source_id` is empty or `?`. In the source column, `~` after an id marks a HIGHLIGHT/transcribed source. TODAY = KB `decision` (cards, picks, families); `[delta]` appended for produce/frozen items. Verdict cell: **Org**anic / Either / Skip as in the tables.

## Failures first

### 1. UNSOURCED and HIGHLIGHT-only rows per aisle

| aisle | rows | UNSOURCED | HIGHLIGHT-only | UNFLAGGED | unresolved id |
|---|---|---|---|---|---|
| produce | 61 | 0 | 0 | - | - |
| frozen | 28 | 0 | 0 | 28 | - |
| meat | 25 | 2 | 3 | - | - |
| eggs | 5 | 1 | 4 | - | - |
| seafood | 19 | 2 | 7 | - | - |
| dairy | 23 | 1 | 6 | - | - |
| oils | 7 | 0 | 5 | - | - |
| grains-bread | 18 | 1 | 7 | - | - |
| sweeteners | 6 | 1 | 0 | - | - |
| nuts-seeds | 6 | 1 | 0 | - | - |
| canned-jarred | 5 | 0 | 2 | - | - |
| snacks-condiments | 14 | 0 | 2 | - | - |
| beverages | 7 | 0 | 0 | - | - |
| **total** | 224 | 9 | 36 | 28 | 0 |

UNFLAGGED = frozen: `frozen-sources.tsv` / `frozen-sources-v2.tsv` carry no FETCHED/HIGHLIGHT flag lines, so fetch depth was not checked here; every frozen id resolves to a source row. Meat file: only S5 S6 S7 S16-S23 are flagged HIGHLIGHT; all other S ids are treated as FETCHED because the flag line implies it (not independently checked). Produce: F129-F136 are flagged TRANSCRIBED from highlights/scrapling, counted HIGHLIGHT (conservative); F127/F128 (law.cornell organic rules) are FETCHED and appear in almost every row, so produce rows read FETCHED even where the item cue rests on one TRANSCRIBED source; check the `~` marks.

Unsourced rows (id | aisle):

- meat: pick_jerky, organ_meats
- eggs: pick_egg_whites
- seafood: seafood_trout, mercury_by_fish
- dairy: goat_sheep_dairy
- grains-bread: specialty_flours
- sweeteners: fam_named_sweeteners
- nuts-seeds: nutritional_yeast

HIGHLIGHT-only rows:

- meat: venison_game, beef_veal, chicken_breast
- eggs: egg_labels, label_cage_free, label_pasture_raised_feed, egg_duck_quail
- seafood: seafood_certifications, canned_tuna, canned_fish_choosing, seafood_fish_roe, scallops, crab, clams_mussels_oysters
- dairy: yogurt_plain_vs_flavored, yogurt_flavored, sour_cream, pick_margarine, plant_butter, pick_whipped_topping
- oils: cooking_oils, oil_blend_vegetable, olive_oil_grades, avocado_oil, rancidity_check
- grains-bread: fam_whole_grains, rice_arsenic, fam_pulses, beans_dried_vs_canned, breakfast_cereal, sprouted_grain_bread, sandwich_bread
- canned-jarred: canned_foods, hummus
- snacks-condiments: condiments, pretzels

### 2. New-table ids with no KB entry (id match)

- **Produce fresh: all 61 ids** (`f_*` slugs) and **frozen: all 28 ids** have no KB entry by id. Their TODAY column uses the nearest KB card/pick (marked `~id`), my mapping, not an id match.
- No nearby KB card at all: f_leeks, f_rhubarb, f_kiwi, f_pomegranate.
- Meat/dairy/pantry file ids with no KB entry (14): yogurt_flavored (dairy), creamer_nondairy (dairy), cheese_food_slices (dairy), oil_blend_vegetable (oils), avocado_oil (oils), bagels_buns (grains-bread), refined_syrups (sweeteners), canned_foods (canned-jarred), soy_sauce (snacks-condiments), p_bottled_water (beverages), p_juice (beverages), p_soda (beverages), p_kombucha (beverages), p_coconut_water (beverages).

### 3. KB card/pick/family ids in these aisles missing from the tables

Scope: KB categories produce, seafood, beef, poultry, poultry_eggs, pork, meat_counter, deli, dairy, bulk_pantry, label_terms, and every `aisle_*` family. Produce/frozen count as covered when some row maps to the entry (see section 2). **143 ids missing.** Many are cross-aisle label_terms or technique cards, not items; they are listed so nothing is hidden.

- card/bulk_pantry (47): bulk_bins_buying, bottled_water_buying, bagels, tortillas, pasta_dry, sprouted_grains, buns_rolls, pastries_muffins, muesli, bread_aisle, kombucha, sauerkraut, kimchi, fermented_pickles, miso, tempeh, natto, fermented, broth, cocoa, dried_fruit, jam, mayo, hot_soy_sauce, canned_soup, olives, salsa, coconut_water, tortilla_chips, potato_chips, popcorn, deli_salads, prepared_meals, fresh_pasta, deli, frozen_pizza, frozen_meals, frozen_fries, frozen_waffles, frozen_nuggets, frozen, dark_chocolate, split_peas, applesauce, salad_dressing, bbq_sauce_marinades, pesto
- card/dairy (4): raw_milk, raw_kefir, raw_aged_cheese, dairy_case
- card/deli (1): deli_liverwurst_pate
- card/label_terms (14): label_natural, label_made_with_real, label_no_added_hormones, label_nonGMO_vs_organic, label_grass_fed_term, label_organic_scope, label_lightly_sweetened, label_no_artificial_flavors, label_front_vs_back, label_ingredient_order, label_third_party_seals, label_sugar_free_substitutes, label_serving_size, label_artificial_color
- card/meat_counter (2): judging_meat_at_the_case, butcher_counter_asking
- card/produce (9): organic_worth_it_by_type, freezing_produce, produce_seasonality, washing_produce, baking_soda_soak, precut_produce_tradeoffs, produce_ripeness_by_item, produce_storage, revive_greens
- family/aisle_bread_bakery (4): fam_whole_grain_baking, fam_whole_grain_sourdough, fam_sprouted_whole_grain_bread, fam_sweet_bakery
- family/aisle_condiments (6): fam_vinegar, fam_olive_oil_pesto, fam_mayonnaise_oils, fam_dressings_deli_salads, fam_fruit_preserves, fam_barbecue_marinades
- family/aisle_dairy_alt (5): fam_fluid_animal_milk, fam_plain_cultured_dairy, fam_real_cheese, fam_concentrated_dairy_fats, fam_plain_plant_drinks
- family/aisle_deli_prepared (2): fam_prepared_meats, fam_fresh_egg_pasta
- family/aisle_drinks (1): fam_bottled_water
- family/aisle_ferments (2): fam_unheated_refrigerated_ferments, fam_fermented_soy
- family/aisle_frozen (5): fam_actual_ice_cream, fam_frozen_fries, fam_whole_grain_waffles, fam_frozen_produce, fam_frozen_plain_produce
- family/aisle_meat_eggs (3): fam_ruminant_meat, fam_poultry_pork, fam_eggs
- family/aisle_pantry_bulk (9): fam_whole_coconut_cooking_milk, fam_specialty_flours, fam_masa_foods, fam_cooking_fats, fam_plain_fruit_preparations, fam_bone_broth_soups, fam_botanicals, fam_occasional_cocoa, fam_plain_muesli
- family/aisle_produce (7): fam_finish_at_home, fam_buy_at_eating_quality, fam_living_leaf, fam_storage_crops, fam_crisp_heads_pods, fam_dry_firm_mushrooms, fam_produce_signs
- family/aisle_seafood (7): fam_wild_first_seafood, fam_trout_conditional, fam_tinned_fish, fam_live_crustaceans, fam_tagged_live_bivalves, fam_dry_packed_scallops, fam_cured_seafood
- family/aisle_snacks (2): fam_potato_chips, fam_popcorn_kernels
- pick/bulk_pantry (10): pick_canned_tomatoes, pick_juice, pick_english_muffins, pick_pita_naan, pick_artificial_sweetener, pick_shortening, pick_soda, pick_sports_drink, pick_energy_drink, pick_fruit_snacks
- pick/produce (2): pick_parsley, pick_tofu
- pick/seafood (1): pick_anchovies

### 4. Coffee / tea conflict

- Source D036 (WAPF Shopping Guide, FETCHED in the flag list) AVOID line reads: "...fruit and vegetable juices; fluoridated water; coffee; tea (except for organic black tea used to make kombucha); water in plastic bottles; ..." D035 allows only organic black tea inside kombucha.
- Rows: `coffee_beans` = **Organic** ("Organic seal on the coffee bag", source D045 Cornucopia, organic residues); `tea` = **Organic** ("Leaves or herbs named alone", source D023 = 21 CFR 101.22 natural-flavor definition). Neither row cites D036, so the WAPF avoid is in the source file but unreconciled in the table. TODAY KB: coffee "Organic whole-bean coffee with a roasted-on date"; tea "Organic loose-leaf herbal tea, no natural flavors".
- Decision needed from Devon: keep Organic (organic is a floor, WAPF is one holistic voice), or move coffee and tea to Skip/Either per WAPF. Also note beverages premise says "Water, tea, coffee beans" are the good path, which the WAPF line contradicts.

### 5. New verdict contradicts today's decision

- **Hard** (new Skip on the carton name; today recommends that product)
  - oat_milk: Skip vs "Unsweetened oat milk made with oats and water"
  - almond_milk: Skip vs "Unsweetened almond milk made with almonds and water"
  - soy_milk: Skip vs "Unsweetened soy milk of whole soybeans and water"
  - coconut_milk_beverage: Skip vs "Unsweetened whole coconut milk of coconut and water"
  - pick_margarine: Skip vs "...or plant butter made with only coconut or olive oil"
- **Produce** (new "Organic for every item" ruling, 2026-10-26, vs today text)
  - f_pineapple / f_avocados: new Organic; KB organic_worth_it_by_type delta still says "pineapple and avocado lead its Clean Fifteen"
  - f_papaya, f_sweet_corn, f_summer_squash, f_cantaloupe/honeydew/watermelon, f_mangoes, f_cucumbers, f_winter_squash: new Organic; today decision (produce_tropical_fruit, pick_corn, pick_zucchini, produce_melons, pick_mangoes, pick_cucumbers, pick_winter_squash) gives shelf cues only and no organic floor: silent, not opposed
- **Soft** (new Skip is the conventional form; today names an organic version, so these read as narrowing, check wording)
  - beef_veal: Skip unless pasture-raised plus humane seal vs "Veal raised beside its mother on pasture"
  - plant_butter, breakfast_cereal, sandwich_bread, gluten_free_bread, trail_mix, condiments, crackers, pretzels: Skip vs an organic/sourdough/sprouted version in today text
  - whole_vs_reduced_fat_milk and the other dairy cards: new verdict Organic; today leads with grass-fed (raw or low-temp grass-fed for milk): standard shifted from grass-fed to organic

Not flagged as contradictions: every other row agrees in direction with its KB decision (Organic/Either vs an organic/pasture/grass-fed decision). I judged this by reading all meat and dairy/pantry TODAY texts; for produce and frozen I compared the nearest-card decision, so those are less exact.

---
## Aisles

### Produce fresh

**Premise:** Organic by default; look for a PLU starting with 9 or the USDA seal.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Apples | **Organic** — Skip apples with rough, scab-like patches at the stem end. | ~produce_apples_pears: Organic apples and pears, firm, unbruised, unwaxed when possible. [delta: “Unwaxed” on the sign means no coating was added to the fru…] | FETCHED (F137 F130~ F002) |
| Pears | **Organic** — Press the narrow neck by the stem, which should give slightly. | ~produce_apples_pears: Organic apples and pears, firm, unbruised, unwaxed when possible. [delta: “Unwaxed” on the sign means no coating was added to the fru…] | FETCHED (F138 F127) |
| Grapes | **Organic** — Grapes should hang firmly on green stems, not brown ones. | ~produce_grapes: Organic, always: a Dirty Dozen fruit eaten skin-on. [delta: Plump grapes stay firmly attached to the stems.] | FETCHED (F196 F139 F127 F007) |
| Peaches and nectarines | **Organic** — Look for fuzzy peach skin in red or yellow. | ~produce_stone_fruit: Organic peaches, nectarines and cherries, plump with stems on. [delta: Peaches yield gently when ripe; cherries will not ripen onc…] | FETCHED (F140 F127 F007) |
| Plums | **Organic** — A white or gray sheen on the skin is natural, so leave it. | ~produce_stone_fruit: Organic peaches, nectarines and cherries, plump with stems on. [delta: Peaches yield gently when ripe; cherries will not ripen onc…] | FETCHED (F141 F127) |
| Cherries | **Organic** — Pick shiny, dark cherries with green stems still attached. | ~produce_stone_fruit: Organic peaches, nectarines and cherries, plump with stems on. [delta: Peaches yield gently when ripe; cherries will not ripen onc…] | FETCHED (F197 F142 F127) |
| Strawberries | **Organic** — Skip berries with white or green shoulders around the caps. | ~berries_picking: Organic berries, dry and mold-free through the whole box. [delta: One moldy berry means spores have traveled through the whol…] | FETCHED (F143 F127 F007) |
| Blueberries | **Organic** — Look for a silver-white frost on the skin and no leaves in the box. | ~berries_picking: Organic berries, dry and mold-free through the whole box. [delta: One moldy berry means spores have traveled through the whol…] | FETCHED (F144 F127) |
| Wild blueberries | **Organic** — Read the label for the word wild or lowbush. | ~berries_picking: Organic berries, dry and mold-free through the whole box. [delta: One moldy berry means spores have traveled through the whol…] | FETCHED (F018 F127) |
| Raspberries and blackberries | **Organic** — Check the clamshell bottom for juice stains. | ~berries_picking: Organic berries, dry and mold-free through the whole box. [delta: One moldy berry means spores have traveled through the whol…] | FETCHED (F145 F127) |
| Bell peppers | **Organic** — Pick firm, thick-walled, brightly colored peppers with a fresh green stem. | ~produce_peppers: Organic bell peppers, firm, in full red or yellow color. [delta: Red and yellow bells are green peppers left to ripen fully.] | FETCHED (F198 F146 F127) |
| Tomatoes | **Organic** — Skip tomatoes with blotchy green or brown patches on the skin. | ~produce_tomatoes: Organic tomatoes with plump, shiny, unwrinkled skins. [delta: A slight give when squeezed gently means ready to eat now.] | FETCHED (F147 F127) |
| Cucumbers | **Organic** — Read the bin sign for the word waxed before deciding to peel. | ~pick_cucumbers: Unwaxed, firm, dark green cucumbers, else the USDA Organic seal. | FETCHED (F148 F127 F028) |
| Green beans | **Organic** — Run a finger along the pod and skip lumpy sections. | ~produce_green_beans: Organic green beans, slim and firm, free of soft spots. [delta: A fresh bean snaps in two rather than bending.] | FETCHED (F149 F127) |
| Snap and snow peas | **Organic** — Choose snap pods that look plump and snug around the peas. | ~pick_snap_peas: Snap peas in firm, bright green pods, without blemishes. | FETCHED (F150 F127) |
| Okra | **Organic** — Pick pods about 2 to 4 inches long, not dull or shriveled. | ~pick_okra: Okra, firm and bright green, without limp, moldy or dried-out pods. | FETCHED (F151 F127) |
| Eggplant | **Organic** — Pick eggplant that feels relatively light for its size, with shiny skin. | ~pick_eggplant: Eggplant, heavy, shiny and smooth, with a green stem free of mold. | FETCHED (F152 F130~ F095) |
| Potatoes | **Organic** — Skip any potato with a green tint on the skin. | ~produce_potatoes: Organic potatoes with good color and no sprouts or wrinkles. [delta: Skip potatoes with dark spots or wilted skin.] | FETCHED (F153 F130~ F109 F133~) |
| Sweet potatoes | **Organic** — Pick small to medium sweet potatoes with even, deep-colored skin and no holes. | ~produce_root_vegetables: Organic carrots and roots, firm, smooth and bright in color. [delta: Skip carrots that are cracked, forked, limp or rubbery.] | FETCHED (F191 F154 F127) |
| Carrots | **Organic** — Skip carrots with large green areas at the top. | ~produce_root_vegetables: Organic carrots and roots, firm, smooth and bright in color. [delta: Skip carrots that are cracked, forked, limp or rubbery.] | FETCHED (F155 F128) |
| Beets | **Organic** — Pick small beets with a slender tap root and leaf stems still attached. | ~produce_root_vegetables: Organic carrots and roots, firm, smooth and bright in color. [delta: Skip carrots that are cracked, forked, limp or rubbery.] | FETCHED (F194 F195 F156 F128) |
| Radishes | **Organic** — Pick brightly colored radishes still topped with fresh green leaves. | ~produce_root_vegetables: Organic carrots and roots, firm, smooth and bright in color. [delta: Skip carrots that are cracked, forked, limp or rubbery.] | FETCHED (F193 F157 F128) |
| Turnips | **Organic** — Skip turnips with many leaf scars ringing the top. | ~produce_root_vegetables: Organic carrots and roots, firm, smooth and bright in color. [delta: Skip carrots that are cracked, forked, limp or rubbery.] | FETCHED (F158 F128) |
| Celery | **Organic** — Split a stalk apart and look for pale to bright green, crisp inside. | ~pick_celery: Celery with the USDA Organic seal and crisp stalks. | FETCHED (F159 F127) |
| Kohlrabi | **Organic** — Skip kohlrabi bulbs with cracks or brown spots; attached leaves should be firm. | ~pick_kohlrabi: Kohlrabi bulbs, firm and heavy in your hand, without cracks or bruises. | FETCHED (F192 F160 F128) |
| Ginger | **Organic** — Choose a piece with few knobs and little branching. | ~pick_ginger_turmeric: Ginger and turmeric roots, firm, ginger smooth and uncracked; keep both sealed and refrigerate… | FETCHED (F055 F128) |
| Turmeric root | **Organic** — Snap off a small knob and it should break apart easily. | ~pick_ginger_turmeric: Ginger and turmeric roots, firm, ginger smooth and uncracked; keep both sealed and refrigerate… | FETCHED (F135~ F128) |
| Spinach | **Organic** — Pick spinach with broad, crisp, dark green leaves. | ~produce_leafy_greens: Organic spinach, kale and lettuce with crisp, colorful leaves. [delta: Lettuce heads or bunches should feel heavy for their size.] | FETCHED (F161 F127) |
| Kale and collard greens | **Organic** — Choose dark kale with small to medium leaves. | ~produce_leafy_greens: Organic spinach, kale and lettuce with crisp, colorful leaves. [delta: Lettuce heads or bunches should feel heavy for their size.] | FETCHED (F059 F127) |
| Romaine and leaf lettuce | **Organic** — Skip extremely solid, pale heads, which are mostly core. | ~produce_leafy_greens: Organic spinach, kale and lettuce with crisp, colorful leaves. [delta: Lettuce heads or bunches should feel heavy for their size.] | FETCHED (F162 F127) |
| Iceberg lettuce | **Organic** — Press the top of the head and avoid hard bumps. | ~produce_leafy_greens: Organic spinach, kale and lettuce with crisp, colorful leaves. [delta: Lettuce heads or bunches should feel heavy for their size.] | FETCHED (F163 F127) |
| Swiss chard | **Organic** — Look for red, pink, orange, yellow or white stems. | ~pick_swiss_chard: Chard with the USDA Organic seal, dark green with unsplit stalks. | FETCHED (F064 F127) |
| Cilantro and parsley | **Organic** — Look for bright green cilantro or deep-green parsley leaves. | ~pick_cilantro: Cilantro with the USDA Organic seal, in bright, upright bunches. | FETCHED (F066 F127) |
| Basil | **Organic** — Look for smooth, whole, brightly colored basil leaves. | ~pick_basil: Basil with the USDA Organic seal, bright and upright. | FETCHED (F068 F127) |
| Microgreens | **Organic** — Check that leaves and stems both look crisp, not limp. | ~pick_microgreens: Microgreens with the USDA Organic seal; rinse before use. | FETCHED (F069 F127) |
| Raw sprouts | **Organic** — Reject any tub holding dry or slimy sprouts. | ~sprouts_raw: Organic mung bean sprouts, refrigerated, bought for cooking. [delta: Choose the mung bean variety for thoroughly cooked dishes.] | FETCHED (F164 F127) |
| Broccoli | **Organic** — Skip heads whose flower ends part easily or show yellow blooms. | ~produce_brassicas: Organic broccoli, cabbage and cauliflower, compact and heavy. [delta: Cauliflower heads should be compact with no spaces between …] | FETCHED (F165 F127) |
| Cauliflower | **Organic** — Skip heads with gaps between the curds. | ~produce_brassicas: Organic broccoli, cabbage and cauliflower, compact and heavy. [delta: Cauliflower heads should be compact with no spaces between …] | FETCHED (F166 F127) |
| Brussels sprouts | **Organic** — Look for bright green heads with white stem ends. | ~produce_brassicas: Organic broccoli, cabbage and cauliflower, compact and heavy. [delta: Cauliflower heads should be compact with no spaces between …] | FETCHED (F167 F127) |
| Cabbage | **Organic** — Skip heads that are oblong or cracked. | ~produce_brassicas: Organic broccoli, cabbage and cauliflower, compact and heavy. [delta: Cauliflower heads should be compact with no spaces between …] | FETCHED (F168 F127) |
| Asparagus | **Organic** — Choose spears with tips firmly closed. | ~pick_asparagus: Asparagus with dry, closed, compact tips and no limp stalks. | FETCHED (F169 F127) |
| Mushrooms | **Organic** — Peek under the cap for pink or light tan gills. | ~produce_mushrooms: Whole organic mushrooms with dry, springy caps. [delta: Dry brown bruises differ from wet, spreading dark patches.] | FETCHED (F170 F127) |
| Leeks | **Organic** — Choose leeks with fresh green tops and necks no thicker than 1.5 inches. | **no KB entry; no nearby card** | FETCHED (F171 F127) |
| Rhubarb | **Organic** — Stem colour varies, so light green stalks can still be good. | **no KB entry; no nearby card** | FETCHED (F172 F130~) |
| Sweet corn | **Organic** — Check the silk ends for decay or worm damage. | ~pick_corn: Corn with green husks and fresh silk, without dried-out ears. | FETCHED (F173 F130~ F089 F132~) |
| Zucchini and yellow squash | **Organic** — Pick squash about 4 inches long with bright, healthy skin. | ~pick_zucchini: Zucchini, small-to-medium, glossy and firm, that feel heavy for their size. | FETCHED (F174 F130~ F092 F131~) |
| Papaya | **Organic** — Look for some yellow streaks on the skin. | ~produce_tropical_fruit: Whole tropical fruit, uncut, with origin on the sticker. [delta: A ripe mango gives slightly; Sugarloaf pineapple stays gree…] | FETCHED (F175 F130~ F095 F134~) |
| Bananas | **Organic** — Check for slight green at the stem and tip. | ~produce_bananas: Organic bananas, green-tipped for later or yellow for today. [delta: Yellow with brown spots is the fully ripe, sweetest stage.] | FETCHED (F176 F127) |
| Avocados | **Organic** — Skip avocados with large indentations in the skin. | ~produce_avocados: Organic avocados that yield to a gentle palm squeeze. [delta: Squeeze in the palm, not with fingertips; avocados ripen on…] | FETCHED (F177 F127) |
| Cantaloupe | **Organic** — Look for a smooth, rounded scar where the stem was. | ~produce_melons: Whole watermelon with a cream ground spot and dull skin. [delta: On cantaloupe, the skin between the netting turns light tan…] | FETCHED (F178 F127) |
| Honeydew | **Organic** — Choose pale yellow to light lemon skin with little green. | ~produce_melons: Whole watermelon with a cream ground spot and dull skin. [delta: On cantaloupe, the skin between the netting turns light tan…] | FETCHED (F179 F127) |
| Watermelon | **Organic** — Turn it over and look for a yellow, not white, underside. | ~produce_melons: Whole watermelon with a cream ground spot and dull skin. [delta: On cantaloupe, the skin between the netting turns light tan…] | FETCHED (F180 F127) |
| Pineapple | **Organic** — Check that the crown leaves look fresh, not dry and brown. | ~produce_tropical_fruit: Whole tropical fruit, uncut, with origin on the sticker. [delta: A ripe mango gives slightly; Sugarloaf pineapple stays gree…] | FETCHED (F181 F130~ F109 F136~) |
| Mangoes | **Organic** — Skip mangoes with sap on the skin. | ~pick_mangoes: Mangoes that yield slightly to gentle pressure; red color does not indicate ripeness. | FETCHED (F182 F127) |
| Kiwi | **Organic** — Press lightly: ripe kiwi releases to gentle pressure. | **no KB entry; no nearby card** | FETCHED (F183 F127) |
| Oranges and grapefruit | **Organic** — Pick oranges and grapefruit heavy for their size, with smooth skin. | ~produce_citrus: Organic citrus, unwaxed when the peel gets zested. [delta: Before zesting, check the sign for a shellac-based or petro…] | FETCHED (F190 F184 F127) |
| Lemons and limes | **Organic** — For limes, look for smooth, glossy dark green skin. | ~produce_citrus: Organic citrus, unwaxed when the peel gets zested. [delta: Before zesting, check the sign for a shellac-based or petro…] | FETCHED (F185 F127) |
| Pomegranate | **Organic** — Look for a slightly square shape, not perfectly round. | **no KB entry; no nearby card** | FETCHED (F186 F127) |
| Dry onions | **Organic** — Check the neck: small and dry, with no moisture. | ~produce_onions_garlic: Organic onions and garlic, firm, dry and papery-skinned. [delta: Garlic heads should be firm with no cuts or soft cloves.] | FETCHED (F187 F127) |
| Garlic | **Organic** — Choose heavy bulbs that stay closed, with dry outer skins. | ~produce_onions_garlic: Organic onions and garlic, firm, dry and papery-skinned. [delta: Garlic heads should be firm with no cuts or soft cloves.] | FETCHED (F188 F127) |
| Winter squash and pumpkin | **Organic** — Check the stem: it should be dry and firm. | ~pick_winter_squash: Winter squash, firm and heavy-for-size, with hard skin and no sunken or moldy spots. | FETCHED (F189 F127) |

### Frozen

**Premise:** Frozen is picked and chilled fast; read the bag: organic, one ingredient, loose pieces.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Wild blueberries | **Organic** (preferred_over_fresh) — Bag says "wild"; ingredients list blueberries alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S01 S02 S03 S24 S04 S05) |
| Blueberries without the word wild | **Organic** (good_offseason) — No "wild" on the bag means planted highbush; ingredients blueberries alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S05 S06 S02) |
| Strawberries | **Organic** (good_offseason) — Berries loose and individually frozen; ingredients strawberries alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S18 S07) |
| Raspberries | **Organic** (good_offseason) — Whole berries, loose in the bag; ingredients raspberries alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S42 S46 S43) |
| Blackberries | **Organic** (good_offseason) — Plump glossy berries loose in the bag; ingredients blackberries alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S45 S46) |
| Cherries, pitted | **Organic** (good_offseason) — Cherries loose, deep dark color; ingredients cherries alone, no sugar. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S48 S49) |
| Mixed berry blends | **Organic** (good_offseason) — Ingredients name each berry, such as strawberry and blueberry; no sugar or juice. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S17) |
| Mango chunks | **Organic** (good_offseason) — Chunks loose, not fused; ingredients mango alone, no sugar line. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S51 S50 S54) |
| Tropical fruit blends | **Organic** (good_offseason) — Ingredients name mango, pineapple or papaya; no sugar, syrup or juice. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S17) |
| Papaya chunks | **Organic** (good_offseason) — Organic seal on the bag; ingredients papaya alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S14 S15) |
| Acai and smoothie packs | **Organic** (good_offseason) — Ingredients name acai alone; skip packs listing sweeteners before the fruit. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S52 S53 S17) |
| Peas | **Organic** (preferred_over_fresh) — Bright round peas, loose in the bag; ingredients peas alone. | ~pick_frozen_peas: Peas frozen solid, with no pack drips or off smell. | UNFLAGGED (S11 S12 S29 S30) |
| Sweet corn kernels | **Organic** (preferred_over_fresh) — Kernels loose, not one block; ingredients corn alone, organic seal. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S13 S14 S15 S54) |
| Spinach | **Organic** (good_offseason) — Ingredients spinach alone; skip creamed bags listing cream or starch. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S08 S07 S17) |
| Kale, collards and mixed greens | **Organic** (good_offseason) — Chopped leaves loose, not one solid block; ingredients name the greens only. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S39 S38) |
| Broccoli florets | **Organic** (good_offseason) — Dark green compact florets, no yellow buds; ingredients broccoli alone. | ~pick_frozen_broccoli: Broccoli frozen solid; pack drips or off smell mean it thawed. | UNFLAGGED (S27 S28 S09 S10) |
| Cauliflower florets | **Organic** (good_offseason) — Creamy white florets, no grey or brown; ingredients cauliflower alone. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S34 S33 S35) |
| Riced cauliflower and riced veg | **Organic** (good_offseason) — Riced cauliflower bag: ingredients say cauliflower alone, no starch or seasoning. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S17) |
| Carrots | **Organic** (fresh_better) — Pieces separate, not a frozen clump; ingredients carrots alone, organic seal. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S08 S09) |
| Green beans | **Organic** (good_offseason) — Slim crisp-looking pods, ingredients green beans alone, no white frost. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S22 S08 S07 S31 S32) |
| Brussels sprouts | **Organic** (good_offseason) — Small tight sprouts; ingredients Brussels sprouts alone, no loose leaves. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S36 S37) |
| Edamame | **Organic** (preferred_over_fresh) — Beans or pods loose in the bag; ingredients edamame alone, organic seal. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S21 S14 S15 S54) |
| Stir-fry blends | **Organic** (good_offseason) — Skip bags with a sauce packet; ingredients name vegetables only. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S20 S19) |
| Mixed vegetables (peas, carrots, corn, beans) | **Organic** (good_offseason) — Ingredients name peas, carrots, corn and green beans; bag tips loose, not a block. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S19 S20) |
| Zucchini and summer squash | **Organic** (good_offseason) — Slices separate; ingredients squash or zucchini alone, organic seal. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S14 S15) |
| Butternut and winter squash cubes | **Organic** (good_offseason) — Orange cubes loose; ingredients squash alone, no butter or brown sugar. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S40 S41) |
| Sauced, buttered or seasoned veg bags | **Skip** (fresh_better) — Skip bags with butter, cream, cheese, sauce or seasoning in the ingredients. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S17) |
| Sweetened or syrup-packed fruit | **Skip** (fresh_better) — Skip bags listing sugar, syrup or juice concentrate; fruit should be the whole list. | ~frozen_vs_fresh_produce: Organic frozen fruit or vegetables, single ingredient, free-flowing. [delta: Frozen fruit sometimes comes packed in syrup or added sugar.] | UNFLAGGED (S17) |

### Meat

**Premise:** Organic is the floor; grass-fed, pasture seals show the animal lived outdoors.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Grass-fed beef `beef_grassfed_vs_grainfed` | **Organic** — AGA Grassfed seal; label reads 100% grass-fed and grass-finished | Grass-finished beef first, then AGA Grassfed or USDA Organic. | FETCHED (S1) |
| Beef cuts `beef_cuts_basics` | **Organic** — Whole cut in a sealed tray with AGA Grassfed seal and USDA Organic | 100% grass-fed and grass-finished beef, in whole cuts. | FETCHED (S3) |
| Ground beef `ground_beef_lean_ratio` | **Organic** — Ground beef pack naming grass-finished; ratio printed beside the AGA seal | Grass-fed ground beef first, then organic, nothing added. | FETCHED (S4) |
| Hot dogs `hot_dogs` | **Either** — AGA seal on pack with a short ingredient list | 100% grass-fed beef hot dogs with a short ingredient list. | FETCHED (S1) |
| Beef jerky `pick_jerky` | **Either** — First ingredient beef; AGA or organic seal on the bag | Whole-muscle grass-fed, grass-finished beef jerky with a short list; celery powder in “uncured… | UNSOURCED (?) |
| Soup bones `pick_soup_bones` | **Organic** — Marrow bones from the counter, tagged grass-finished or AGA | Ask your meat counter for grass-fed, grass-finished marrow or knuckle soup bones. | FETCHED (S1) |
| Organ meats `organ_meats` | **Organic** — Liver or heart pack carrying an organic or AGA seal | Grass-fed beef liver or heart first, then organic. | UNSOURCED (?) |
| Lamb and goat `lamb_goat` | **Organic** — Lamb tray stamped AWA pasture; chops with pale pink fat | Grass-fed lamb or goat first, then AGA or organic. | FETCHED (S2) |
| Bison `bison` | **Organic** — Pack lists bison only; AGA Grassfed mark beside the cut | AGA Grassfed bison, with bison the only meat listed. | FETCHED (S1) |
| Venison `venison_game` | **Either** — Tray names deer and shows an inspected and approved mark | Plain venison cuts with the deer species named. | HIGHLIGHT (S17~) |
| Veal `beef_veal` | **Skip** — Only if label says pasture-raised with a humane seal | Veal raised beside its mother on pasture, as labeled. | HIGHLIGHT (S18~) |
| Chicken breast `chicken_breast` | **Organic** — Bone-in, skin-on breast with USDA Organic plus Certified Humane Pasture Raised | Pasture-raised breast first, then organic; bone-in and skin-on. | HIGHLIGHT (S5~) |
| Chicken cuts `chicken_cuts_basics` | **Organic** — Whole bird with AWA seal; skin cream-yellow, no basting solution listed | Pasture-raised whole chicken first, then organic with a welfare seal. | FETCHED (S2) |
| Chicken wings `poultry_chicken_wings` | **Organic** — Wings with skin intact, pack states organic and pasture-raised | Pasture-raised chicken wings first, then organic; plain, uncoated. | FETCHED (S3) |
| Rotisserie chicken `rotisserie_chicken` | **Either** — Ingredients list only chicken and salt; organic seal on sticker | Pasture-raised rotisserie chicken, with salt and named herbs. | FETCHED (S3) |
| Whole turkey `turkey_whole` | **Organic** — Tag reads not basted; USDA Organic, Certified Humane Pasture Raised | Pasture-raised whole turkey with no basting solution. | FETCHED (S3) |
| Ground turkey `ground_turkey` | **Organic** — Pack states thigh and breast meat only, organic seal | Pasture-raised ground turkey, breast and thigh meat only. | FETCHED (S4) |
| Duck `poultry_duck` | **Organic** — Whole duck with skin on and AWA or organic seal | Pasture-raised whole duck with the skin on. | FETCHED (S2) |
| Pork cuts `pork_cuts_and_enhanced` | **Organic** — Chop pack without added solution; AWA or Certified Humane pasture seal | Pasture-raised pork first, then organic, no added solution. | FETCHED (S2) |
| Bacon `bacon` | **Either** — Ingredients show pork, salt, celery powder only; pasture seal on pack | Pasture-raised bacon, dry-cured with salt and wood-smoked. | FETCHED (S9) |
| Ham `ham` | **Either** — Whole-muscle ham whose name begins Uncured, ingredients listing salt and pork | Pasture-raised whole-muscle ham, dry-cured with pork and salt. | FETCHED (S9) |
| Turkey bacon `turkey_bacon` | **Either** — Name reads Uncured turkey bacon; turkey listed first | Pasture-raised turkey bacon, turkey named, no added sugar. | FETCHED (S9) |
| Cured pork `cured_pork` | **Either** — Dry-cured wording on pack; ingredient list is pork and salt | Pasture-raised whole pork cuts, dry-cured with salt. | FETCHED (S9) |
| Sausage `pick_sausage` | **Organic** — Casing ingredients short; third-party welfare seal for outdoor access | Sausage with a third-party welfare seal for outdoor access; “uncured” celery powder supplies n… | FETCHED (S2) |
| Deli meat `deli_meat_uncured` | **Either** — Uncured on the deli label; whole roast sliced fresh | Organic pasture-raised whole roasted meat, sliced at the counter. | FETCHED (S9) |

### Eggs

**Premise:** Pick pasture-raised with a third-party seal over cage-free wording.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Eggs `egg_labels` | **Organic** — Carton shows USDA Organic and Certified Humane Pasture Raised | Soy-free, corn-free eggs from hens on pasture. | HIGHLIGHT (S5~) |
| Cage-free eggs `label_cage_free` | **Skip** — Cage-free only on carton, no outdoor access seal | USDA Organic pasture-raised eggs with a Real Organic seal. | HIGHLIGHT (S5~) |
| Pasture-raised eggs `label_pasture_raised_feed` | **Organic** — Certified Humane or AWA Pasture Raised plus USDA Organic seal | Certified Humane or AWA pasture-raised eggs, organic feed. | HIGHLIGHT (S5~) |
| Duck and quail eggs `egg_duck_quail` | **Either** — Carton names duck and says pastured | Pasture-raised duck or quail eggs first, then organic. | HIGHLIGHT (S19~) |
| Egg whites `pick_egg_whites` | **Either** — Carton lists egg whites only, with an organic seal | Whites from soy-free, corn-free pastured hens, then certified organic feed and outdoor access;… | UNSOURCED (?) |

### Seafood

**Premise:** Wild with named species and origin first; shellfish live, scallops dry.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Salmon `salmon_wild_vs_farmed` | **Organic** — Label says wild Alaskan; sockeye flesh deep red | Wild salmon, frozen wild Alaskan before fresh farmed. | FETCHED (S8) |
| Seafood seals `seafood_certifications` | **Organic** — Blue MSC fish checkmark with a chain-of-custody code | Wild fish with a named origin and catch method. | HIGHLIGHT (S7~) |
| Wild vs farm-raised `label_wild_vs_farm_raised` | **Organic** — Tag spells wild or farm-raised plus country and catch method | Wild-caught fish with species, country and catch method named. | FETCHED (S8) |
| Farmed fish `farmed_fish_by_species` | **Either** — ASC logo on pack when fish is farmed | Filter-feeding shellfish first; US rainbow trout for finfish. | FETCHED (S15) |
| Trout `seafood_trout` | **Either** — Whole trout with bright eyes and shiny skin | Wild trout, or US farmed rainbow trout. | UNSOURCED (?) |
| Shrimp `shrimp_imported_vs_domestic` | **Organic** — Bag names Gulf or US wild shrimp, shell on, no additives | Wild American or Gulf shrimp; read the country of origin. | FETCHED (S8) |
| White fish `white_fish` | **Organic** — Pacific cod fillet, grey-brown skin side, species named on tag | Wild-caught white fish by its named species, firm, mild-smelling. | FETCHED (S13) |
| Fish sticks `pick_fish_sticks` | **Either** — Pack says wild pollock fillet, not formed from minced pieces | Wild-caught fish sticks from whole fillet, not ones labeled “made from minced fish” in bold. | FETCHED (S14) |
| Canned tuna `canned_tuna` | **Either** — Label says pole-caught, troll-caught, FAD-free or school-caught | Canned light tuna, or a can naming skipjack. | HIGHLIGHT (S22~) |
| Canned fish `canned_fish_choosing` | **Either** — Sardines labelled skin and bones, wild-caught, in olive oil | Fish in olive oil or water, bone-in and skin-on. | HIGHLIGHT (S21~) |
| Mercury choices `mercury_by_fish` | **Either** — Can names sardines or anchovies | Sardines, anchovies, salmon and canned light tuna, small and short-lived. | UNSOURCED (?) |
| Fresh sardines and mackerel `seafood_fresh_sardines_mackerel` | **Organic** — Mackerel with vivid stripes still bright; sardines with shiny skin | Whole wild sardines or Atlantic mackerel on ice. | FETCHED (S12) |
| Fish roe `seafood_fish_roe` | **Either** — Jar lists salmon roe and salt only | Wild salmon roe with only roe and salt listed. | HIGHLIGHT (S20~) |
| Scallops `scallops` | **Organic** — Dry-packed scallops sitting without milky liquid in the tray | Dry or dry-packed scallops, with no phosphate or water listed. | HIGHLIGHT (S6~) |
| Lobster `lobster` | **Organic** — Live lobster moving its claws; frozen tails hard with no ice glaze | A live lobster that moves, or hard-frozen tails. | FETCHED (S11) |
| Crab `crab` | **Either** — Live crab showing leg movement | Live crab that moves, or cooked with bright orange-red shells. | HIGHLIGHT (S23~) |
| Shellfish `clams_mussels_oysters` | **Either** — Shells close when tapped; harvest tag on the bag | Live shellfish with a tag, closed shells and none cracked. | HIGHLIGHT (S23~) |
| Smoked salmon `smoked_salmon` | **Either** — Label says wild or farm-raised, with origin; sold chilled | Wild-caught smoked salmon, nova or lox, kept cold. | FETCHED (S8) |
| Seafood counter `seafood_counter` | **Either** — Whole fish on ice with clear eyes and species sign | Named species on ice, clean briny smell, springy flesh. | FETCHED (S10) |

### Dairy

**Premise:** Plain, whole, cultured; milk and cultures are the only ingredients.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Milk `whole_vs_reduced_fat_milk` | **Organic** — Whole fat on the front; 'ultra-pasteurized' printed near the date means skip. | Trusted raw milk from a farm, or low-temp pasteurized 100% grass-fed. | FETCHED (D013 D007~) |
| Plain yogurt `yogurt_plain_vs_flavored` | **Organic** — Ingredient list reads milk and named cultures, with no sugar, pectin or flavors. | Plain Greek yogurt made from 100% grass-fed milk. | HIGHLIGHT (D009~ D010~) |
| Flavored yogurt `yogurt_flavored` | **Skip** — Skip when 'organic sugar' or 'natural flavors' sits in the ingredient list. | **no KB entry** | HIGHLIGHT (D011~) |
| Kefir `plain_kefir` | **Organic** — Whole milk kefir; ingredients are milk and kefir cultures. | Plain kefir from 100% grass-fed whole milk. | FETCHED (D041) |
| Sour cream `sour_cream` | **Organic** — Ingredients: cream and cultures; no starch, gums or flavor words. | Grass-fed sour cream made with cream and cultures. | HIGHLIGHT (D008~) |
| Cream `cream_vs_creamer` | **Organic** — Cream is the only ingredient; 'ultra-pasteurized' not stamped on the carton. | Grass-fed cream, with cream alone on the list. | FETCHED (D043 D013) |
| Non-dairy creamer `creamer_nondairy` | **Skip** — Oil or sugar listed ahead of any dairy word in the ingredients. | **no KB entry** | FETCHED (D043) |
| Butter `grassfed_butter` | **Organic** — Ingredients: cream, salt; skip any 'natural flavor' entry. | Grass-fed butter of cream and salt first, then organic. | FETCHED (D042) |
| Ghee `ghee` | **Organic** — Ingredient reads butterfat or clarified butter alone; no oil blended in. | Grass-fed ghee with butter as its only ingredient. | FETCHED (D042) |
| Cheese `cheese_real_vs_processed` | **Organic** — Name reads 'cheese', never 'cheese food' or 'cheese product'. | Grass-fed block cheese first, then organic; never cheese food. | FETCHED (D014) |
| Cheese food slices `cheese_food_slices` | **Skip** — 'Pasteurized process cheese food' or 'cheese product' printed on the wrapper. | **no KB entry** | FETCHED (D014) |
| Cream cheese `cream_cheese` | **Organic** — Ingredients: cream, milk, salt, cultures; no gums or added thickeners. | Plain grass-fed cream cheese made with live cultures. | FETCHED (D044) |
| Cottage cheese `cottage_cheese` | **Organic** — Cultures named; carrageenan or gums not in the ingredient list. | Grass-fed full-fat cottage cheese with cultured curds. | FETCHED (D044) |
| Ice cream `ice_cream` | **Organic** — Cream, milk, egg yolks and real vanilla; no 'flavor' words or extenders. | Grass-fed ice cream of cream, milk, sugar and yolks. | FETCHED (D032) |
| Goat and sheep dairy `goat_sheep_dairy` | **Organic** — Ingredients: milk and cultures only. | Plain whole goat or sheep milk first, then organic. | UNSOURCED (?) |
| Oat milk `oat_milk` | **Skip** — 'Oat milk' or 'oat drink' on the carton means skip. | Unsweetened oat milk made with oats and water. | FETCHED (D037) |
| Almond milk `almond_milk` | **Skip** — 'Almond milk' or 'almond drink' on the carton means skip. | Unsweetened almond milk made with almonds and water. | FETCHED (D037) |
| Soy milk `soy_milk` | **Skip** — 'Soy protein isolate' in the ingredients, or 'soy milk' on the carton. | Unsweetened soy milk of whole soybeans and water. | FETCHED (D037 D028~) |
| Coconut milk drink `coconut_milk_beverage` | **Skip** — Boxed (aseptic) carton means skip; canned coconut milk passes. | Unsweetened whole coconut milk of coconut and water. | FETCHED (D003) |
| Canned coconut milk `canned_coconut_milk` | **Organic** — Can with coconut and water only; BPA-free lining stated. | Organic full-fat canned coconut milk listing only coconut and water. | FETCHED (D003 D022~) |
| Margarine `pick_margarine` | **Skip** — 'Vegetable oil' leads the ingredient list of any tub or stick. | Look for deep yellow grass-fed butter, or plant butter made with only coconut or olive oil. | HIGHLIGHT (D001~) |
| Plant butter `plant_butter` | **Skip** — Palm, canola or 'vegetable oil blend' in the ingredient list. | Virgin coconut oil as the plant-based solid fat. | HIGHLIGHT (D001~) |
| Whipped topping `pick_whipped_topping` | **Skip** — 'Hydrogenated' or vegetable oil on a canned or tub topping. | Look for grass-fed heavy cream from a small dairy, pasteurized, not ultra-pasteurized. | HIGHLIGHT (D008~) |

### Oils

**Premise:** One named oil, dated and dark-bottled; unnamed vegetable oil blends are the skip.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Cooking oil `cooking_oils` | **Organic** — One oil named on the label: olive, coconut or avocado, not a blend. | Olive or coconut oil, tallow, lard, butter or ghee. | HIGHLIGHT (D001~) |
| Vegetable oil blend `oil_blend_vegetable` | **Skip** — Bottle reads 'vegetable oil' or lists soybean, canola, corn, cottonseed. | **no KB entry** | HIGHLIGHT (D001~) |
| Olive oil `olive_oil_grades` | **Organic** — Harvest date printed, dark glass or tin, 'extra virgin' on the front. | Organic extra virgin olive oil with a recent harvest date. | HIGHLIGHT (D015~) |
| Avocado oil `avocado_oil` | **Organic** — Harvest or production date printed; virgin, not 'refined', on the label. | **no KB entry** | HIGHLIGHT (D016~) |
| Cold-pressed oils `label_cold_pressed_expeller` | **Organic** — 'Cold pressed' or 'expeller pressed' printed on the front of the bottle. | Organic extra virgin olive oil or unrefined cold-pressed coconut oil. | FETCHED (D017) |
| Lard and tallow `lard_tallow` | **Organic** — Lard or tallow the only ingredient; 'pastured' or 'grass-fed' on the label. | Organic pastured lard or 100% grass-fed tallow, no added oils. | FETCHED (D031) |
| Rancid oil check `rancidity_check` | **Organic** — Smell of stale nuts or Play-Doh on opening; clear plastic bottle gets skipped. | Harvest-dated organic extra virgin olive oil, dark bottle or tin. | HIGHLIGHT (D016~ D015~) |

### Grains-bread

**Premise:** One whole grain named first; sourdough over enriched; organic for glyphosate.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Whole grains `fam_whole_grains` | **Organic** — Ingredient list is one grain, with 'whole' before its name. | Plain organic whole grain in a sealed bag, one grain listed, sprouted if sold. | HIGHLIGHT (D018~) |
| Oats `oats_steelcut_rolled_instant` | **Organic** — Ingredient reads whole grain oats; instant packets listing flavor or sugar fail. | Plain organic steel-cut or rolled oats, oats only. | FETCHED (D029 D027~) |
| Rice `rice_arsenic` | **Organic** — Rice the only ingredient; brown rice syrup is a separate skip. | Organic white basmati grown in California, in a sealed bag. | HIGHLIGHT (D026~) |
| Quinoa, millet, buckwheat `grains_beyond_rice` | **Organic** — Quinoa, millet or buckwheat the only ingredient; organic seal. | Organic intact grains with their bran left on. | FETCHED (D033 D046) |
| Wild rice `wild_rice` | **Organic** — 'Wild rice' is the sole ingredient; no blend with white rice. | Certified organic, hand-harvested lake or river wild rice. | FETCHED (D033 D046) |
| Cornmeal and grits `cornmeal_polenta_grits` | **Organic** — USDA Organic seal on the bag; skip 'degerminated' cornmeal. | Organic whole-grain cornmeal, polenta or grits, germ kept. | FETCHED (F130~ D047) |
| Lentils and split peas `fam_pulses` | **Organic** — One legume named; soak-and-cook directions printed on the bag. | Organic dried beans, peas and lentils, plain, in a sealed bag. | HIGHLIGHT (D027~) |
| Beans `beans_dried_vs_canned` | **Organic** — Dry bag lists beans alone; canned label states a BPA-free lining. | Organic dried beans, or canned beans in a BPA-free can. | HIGHLIGHT (D022~) |
| Pasta `fam_dry_pasta` | **Organic** — Durum or whole wheat semolina named; no 'enriched' entry in the ingredients. | Organic whole-grain, buckwheat, brown rice or legume pasta with a short list. | FETCHED (D033) |
| Flour `flour_basics` | **Organic** — 'Whole wheat' on the bag; 'bleached' or 'enriched' flour means skip. | Organic sprouted flour, or whole-grain flour with a recent date. | FETCHED (D007~ D039) |
| Alternative flours `specialty_flours` | **Organic** — One flour named in the ingredient list; organic printed on the bag. | Organic sprouted or whole specialty flour, “whole” in its name. | UNSOURCED (?) |
| Whole grain label `label_multigrain_vs_whole_grain` | **Organic** — '100% whole grain' or 'whole' before the grain name; 'multigrain' alone is not enough. | Organic bread with every grain ingredient listed as whole. | FETCHED (D046 D047) |
| Breakfast cereal `breakfast_cereal` | **Skip** — Extruded o's, flakes or puffs, or 'natural' printed on the box. | Soaked, cooked oats; if boxed, organic soaked granola. | HIGHLIGHT (D019~ D025~) |
| Sourdough bread `sourdough` | **Organic** — 'Sourdough' with a starter or culture named in the ingredients. | Organic whole-grain sourdough listing a starter, no baker’s yeast. | FETCHED (D038 D020~) |
| Sprouted grain bread `sprouted_grain_bread` | **Organic** — 'Sprouted' before each grain in the ingredient list, not flour first. | Organic sprouted whole-grain sourdough: grains, water, starter, salt. | HIGHLIGHT (D027~) |
| Sandwich bread `sandwich_bread` | **Skip** — 'Enriched wheat flour', sugar or soybean oil near the top of the ingredient list. | Organic whole-grain sourdough or sprouted sliced sandwich loaf. | HIGHLIGHT (D007~) |
| Gluten-free bread `gluten_free_bread` | **Skip** — Skip unless the first ingredient names a flour with 'whole' before it. | Organic gluten-free whole-grain sourdough with a short ingredient list. | FETCHED (D047) |
| Bagels and buns `bagels_buns` | **Skip** — Skip when ascorbic acid is listed; sourdough or sprouted on the bag passes. | **no KB entry** | FETCHED (D038) |

### Sweeteners

**Premise:** Name the sweetener on the label; unnamed sugar and syrups are the skip.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Sugar `sugars` | **Organic** — 'Dehydrated cane juice' or organic cane sugar named, not 'sugar' alone. | Organic coconut or maple sugar, sugar alone. | FETCHED (D006) |
| Maple syrup `maple_syrup` | **Organic** — 'Pure maple syrup' only; corn syrup in the ingredients means imitation. | Organic pure maple syrup, Dark or Very Dark grade. | FETCHED (D006) |
| Honey `honey_adulteration` | **Organic** — 'Raw' and 'unfiltered' on the jar; cloudy with pollen, not clear. | Organic raw, unfiltered honey, honey the only ingredient. | FETCHED (D021~ D006) |
| Molasses `molasses_whole_cane_sweeteners` | **Organic** — Ingredient reads molasses or dehydrated cane juice, no 'sugar' ahead of it. | Organic whole cane sweetener, nothing added. | FETCHED (D006) |
| Date and coconut sugar `fam_named_sweeteners` | **Organic** — Sweetener named by its plant in the ingredients, not 'natural sweetener'. | Organic single-ingredient sweetener: raw honey, pure maple, molasses or coconut sugar. | UNSOURCED (?) |
| Corn, agave, rice syrups `refined_syrups` | **Skip** — Corn syrup, agave or brown rice syrup anywhere in the ingredients. | **no KB entry** | FETCHED (D006) |

### Nuts-seeds

**Premise:** Raw or dry-roasted, sealed, ingredient list is the nut or seed alone.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Nuts and seeds `fam_nuts_seeds` | **Organic** — Sealed package, ingredient list the nut alone; skip open bins. | Organic raw or dry-roasted nuts and seeds in sealed packs, nothing added. | FETCHED (D002) |
| Roasted nuts `nuts_raw_vs_roasted` | **Organic** — 'Raw' printed on a sealed pack; coated or sugared nuts mean skip. | Organic raw or dry-roasted nuts, nut and salt only. | FETCHED (D002) |
| Nut butter `nut_butter_ingredients` | **Organic** — Ingredients: nuts, maybe salt; sugar, palm or 'hydrogenated' words mean skip. | Organic nut butter of nuts and salt, oil on top. | FETCHED (D002) |
| Seeds `seeds` | **Organic** — Raw seeds sealed with a date; the seed is the lone ingredient. | Organic raw seeds in sealed packs, species named. | FETCHED (D002) |
| Trail mix `trail_mix` | **Skip** — Sugar, chocolate or vegetable oil listed beside the nuts. | Organic nuts and unsweetened dried fruit, nothing else. | FETCHED (D002) |
| Nutritional yeast `nutritional_yeast` | **Either** — Flakes list yeast alone in the ingredients. | Organic, non-fortified nutritional yeast with yeast as the only ingredient. | UNSOURCED (?) |

### Canned-jarred

**Premise:** Glass or stated BPA-free cans; ingredients are the food, salt, named oil.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Canned vegetables and fish `canned_foods` | **Organic** — Label states BPA-free lining; ingredients are the food, water, salt. | **no KB entry** | HIGHLIGHT (D022~) |
| Pasta sauce `pasta_sauce` | **Organic** — Tomatoes first, oil named; no sugar or 'natural flavors' listed. | Organic tomato sauce with olive oil and no sweetener. | FETCHED (D004) |
| Jarred vegetable sauces `fam_vegetable_sauces` | **Organic** — Glass jar; vegetables, oil by name, salt and spices, nothing else. | Organic sauce with vegetables first, a short list, and no added sugar. | FETCHED (D004) |
| Seaweed `seaweed` | **Organic** — Sea vegetable named alone; country of origin printed, and not China. | Organic sea vegetables in a sealed pack, kind named. | FETCHED (D034) |
| Hummus `hummus` | **Organic** — Chickpeas, tahini, olive oil named; canola or soybean oil means skip. | Organic hummus: chickpeas, tahini, lemon, extra virgin olive oil. | HIGHLIGHT (D001~) |

### Snacks-condiments

**Premise:** Short list you could stock yourself; no natural flavors, no unnamed oil.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Dried herbs `dried_herbs` | **Organic** — One herb named on the jar; no blend listing citric acid or MSG. | Organic non-irradiated dried herbs, single herb named. | FETCHED (D005) |
| Whole spices `whole_spices` | **Organic** — Whole seeds or sticks of one spice named; no 'spices' blend. | Organic whole spices, non-irradiated, in sealed jars. | FETCHED (D005) |
| Salt `salt` | **Either** — Grey, pink, red or beige colour; 'iodized' on the label means skip. | Unrefined gray, pink or beige salt, salt alone. | FETCHED (D005) |
| Baking powder `baking_powder` | **Either** — 'Aluminum-free' printed on the tin. | Aluminum-free baking powder with organic starch. | FETCHED (D039) |
| Raw apple cider vinegar `raw_cider_vinegar` | **Organic** — 'Raw' and 'unfiltered' printed; cloudy strands of mother at the bottom. | Organic raw unfiltered apple cider vinegar with the mother. | FETCHED (D004) |
| Distilled vinegar `vinegar` | **Skip** — 'Distilled white vinegar' printed; apple cider, wine or balsamic named passes. | Organic raw apple cider vinegar, percent acidity on the label. | FETCHED (D004) |
| Ketchup and mustard `ketchup_mustard` | **Organic** — Tomatoes, vinegar, spices listed; no 'natural flavors' entry. | Organic fermented ketchup, or mustard of seed, vinegar and salt. | FETCHED (D004) |
| Soy sauce `soy_sauce` | **Organic** — Naturally fermented or brewed on the label; liquid amino acids mean skip. | **no KB entry** | FETCHED (D004) |
| Mayonnaise and dressings `condiments` | **Skip** — Soybean or canola oil named as the first oil on the label. | Organic fermented ketchup or mustard, short ingredient list. | HIGHLIGHT (D001~) |
| Crackers `crackers` | **Skip** — Skip when white flour, hydrogenated oil or soy flour is listed. | Sourdough or sprouted organic crackers in olive oil or butter. | FETCHED (D040) |
| Pretzels `pretzels` | **Skip** — Skip when refined white flour leads the ingredient list. | Organic sprouted whole-wheat pretzels made with olive oil. | HIGHLIGHT (D007~) |
| Snack bars `snack_bars` | **Skip** — Brown rice syrup, agave or soy protein isolate in the ingredients means skip. | Whole nuts, fruit, jerky or cheese ahead of any bar. | FETCHED (D006 D028~) |
| Chips `snacks` | **Organic** — Potatoes or corn, olive or coconut oil named, salt; nothing else. | Whole-food snacks, or organic whole grain listed first. | FETCHED (D001~ D031) |
| Rice cakes and puffs `rice_cakes_puffed_grains` | **Skip** — Puffed grain with flavor coating, 'natural flavor' or syrup in ingredients. | Organic fermented whole-grain crackers in place of rice cakes. | FETCHED (D033) |

### Beverages

**Premise:** Water, tea, coffee beans; sugar or natural flavors listed means skip.

| item | NEW verdict + cue | TODAY | source |
|---|---|---|---|
| Bottled water `p_bottled_water` | **Either** — 'Spring water' printed on the label. | **no KB entry** | FETCHED (D024) |
| Coffee beans `coffee_beans` | **Organic** — Organic seal on the coffee bag. | Organic whole-bean coffee with a roasted-on date. | FETCHED (D045) |
| Tea `tea` | **Organic** — Leaves or herbs named alone; 'natural flavors' not in the ingredients. | Organic loose-leaf herbal tea, no natural flavors. | FETCHED (D023) |
| Juice `p_juice` | **Skip** — 'From concentrate' or 'juice cocktail' on the front, sugar listed. | **no KB entry** | FETCHED (D036) |
| Soda `p_soda` | **Skip** — Sugar, caramel color or 'natural flavors' in the ingredients. | **no KB entry** | FETCHED (D036) |
| Kombucha `p_kombucha` | **Organic** — Organic on the label, in a glass bottle; black tea listed. | **no KB entry** | FETCHED (D035) |
| Coconut water `p_coconut_water` | **Organic** — Coconut water the sole ingredient; aseptic box means skip. | **no KB entry** | FETCHED (D003) |
