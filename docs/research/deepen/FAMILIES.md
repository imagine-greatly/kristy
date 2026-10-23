# Shop cascade: proposed families

Read-only classification of `../../../server/kristy_perimeter_kb.json`, using `id`, `title`, `category`, `decision`, and `short_answer`; `groups.json` defines the card inventory. The source contains 243 entries: 205 cards and 38 excluded picks. This is an information-architecture proposal, not a factual or safety validation of the source's advice. “Ladder” below means the preference order visible in those two summary fields.

**L0:** Shop by source, food form, and the one check that changes the purchase. Inspect the actual product and back label; use the relevant aisle briefing, then a family. Keep package condition and temperature checks visible. Do not turn a product-specific sourcing preference into a store-wide requirement.

**Assignment convention:** Every card ID occurs once, in an assignment table below. All members in the family table are **FAMILY-MEMBER**. **Yes** introduces a proposed L3 delta of at most 12 words; **No** means the family covers the purchase decision. Deltas refine the family; they cannot reverse its rule. Preparation detail can remain in the source card without becoming an L3 shopping delta. Family rules are deliberately bounded: a common handling rule does not imply an identical organic threshold, ingredient recipe, or storage temperature.

## 1. L2 families and L3 item deltas

| Working ID / family | Aisle | Membership-defining shopping logic | Member card IDs — needs ITEM DELTA; idea |
|---|---|---|---|
| F01 · Buy firm, finish at home | Produce | These fruits can finish ripening after purchase; select maturity for the day needed. | `produce_bananas` — Yes: Organic; buy green or just turning.<br>`produce_avocados` — Yes: Firm Hass; organic when stocked; refrigerate once ripe.<br>`produce_tomatoes` — Yes: Organic; source keeps whole tomatoes unchilled, even ripe. |
| F02 · Buy ready; no later sweetening | Produce | Buy berries, grapes and citrus at eating quality; waiting will not improve sweetness. | `berries_picking` — Yes: Local unsprayed, then organic; inspect container underside for wetness.<br>`produce_grapes` — Yes: Prioritize organic; refrigerate immediately.<br>`produce_citrus` — Yes: Seek untreated, uncoated fruit; green peel can conceal maturity. |
| F03 · Living leaf | Produce | Buy crisp, intact leaves and moist, sound stems; reject decay rather than accepting wilt. | `produce_leafy_greens` — Yes: Unsprayed local or living greenhouse lettuce, then organic. |
| F04 · Dark, cool storage crops | Produce | Buy firm, undamaged potatoes or cured alliums for cool, dark, ventilated storage. | `produce_onions_garlic` — Yes: Unsprayed local; dry necks, cured cloves, no sprouts.<br>`produce_potatoes` — Yes: Prioritize organic potatoes; sweet potatoes have a different source ladder. |
| F05 · Crisp heads and pods | Produce | Buy firm, undamaged vegetables at usable maturity; inspect heads, skins or pods for deterioration. | `produce_brassicas` — Yes: Unsprayed local, then organic; closed broccoli florets, sound cabbage heads.<br>`produce_peppers` — Yes: Unsprayed local or greenhouse; reject cracks and bruises.<br>`produce_green_beans` — Yes: Unsprayed seasonal local; crisp pods without bulging seeds. |
| F06 · Dry, firm mushrooms | Produce | Buy dry, firm mushrooms without dark deterioration; plan cold storage in paper. | `produce_mushrooms` — Yes: Unsprayed local, then organic; cap opening predicts flavor strength. |
| F08 · Grass-finished ruminant meat | Meat & eggs | For these beef, lamb, goat and bison products, establish 100% grass-fed/finished sourcing before choosing form. | `beef_grassfed_vs_grainfed` — No.<br>`beef_cuts_basics` — Yes: Choose whole chuck or round; avoid mechanical tenderization.<br>`ground_beef_lean_ratio` — Yes: Ask for an organ blend; otherwise nothing added.<br>`lamb_goat` — Yes: Goat lacks grading; inspect firm flesh and white fat.<br>`bison` — Yes: Check inspection mark; ground bison needs prompt use.<br>`hot_dogs` — Yes: Beef only; check phosphates, binders, and mechanically separated poultry. |
| F09 · Pastured poultry and pork | Meat & eggs; deli; frozen | Establish pasture-raised sourcing; then identify the actual cut or product and its declared additions. | `chicken_cuts_basics` — Yes: Air-chilled whole bird first, then bone-in, skin-on thighs.<br>`turkey_whole` — Yes: Reject injected basting solution.<br>`ground_turkey` — Yes: Read printed fat content alongside any lean claim.<br>`chicken_breast` — Yes: Bone-in, skin-on; distinguish added solution from retained chilling water.<br>`poultry_duck` — Yes: Ask for soy-free feed; retain rendered fat.<br>`poultry_chicken_wings` — Yes: Ask for soy-free feed where offered.<br>`pork_cuts_and_enhanced` — Yes: Reject added solution; inspect the product name.<br>`rotisserie_chicken` — Yes: Chicken, salt and spices; reject injected seasoning solution.<br>`frozen_nuggets` — Yes: White meat, solid pieces; inspect the breading separately. |
| F10 · Eggs: pasture plus feed | Meat & eggs | Choose eggs from pastured birds; investigate feed separately from the housing claim. | `egg_labels` — Yes: Prefer organic, corn-free and soy-free together; verify pasture certification.<br>`egg_duck_quail` — Yes: Soy-free where offered; account for markedly different egg sizes. |
| F11 · Prepared pastured meats | Deli & prepared foods | Require pasture sourcing and identifiable meat; read preparation and curing ingredients for the specific product. | `deli_meat_uncured` — Yes: Prefer whole roasted meat; celery curing still counts as curing.<br>`bacon` — Yes: Short curing list; inspect the uncured qualifier.<br>`ham` — Yes: Dry-cured or plain Ham; distinguish water-added product names.<br>`turkey_bacon` — Yes: No added sugar; verify the named turkey cut.<br>`cured_pork` — Yes: Name the cut and cure; salami is fermented ground meat.<br>`deli_liverwurst_pate` — Yes: Liver with its own animal fat; inspect binders and extenders. |
| F12 · Wild-first seafood | Seafood | Establish species and origin; prefer wild for these fish and shrimp, with species-specific fallbacks. | `salmon_wild_vs_farmed` — Yes: Frozen wild Alaskan outranks fresh farmed salmon.<br>`shrimp_imported_vs_domestic` — Yes: Wild American or Gulf; inspect country of origin.<br>`white_fish` — Yes: Ask exact species; firm, springy flesh without dried edges.<br>`seafood_fresh_sardines_mackerel` — Yes: Choose sardines or Atlantic mackerel; exclude king mackerel.<br>`seafood_trout` — Yes: US farmed rainbow trout is the named fallback. |
| F13 · Tinned fish: species and packing medium | Seafood | Identify the fish, then read the packing liquid; choose water or olive oil. | `canned_fish_choosing` — Yes: Sardines and salmon: keep bones and skin.<br>`canned_tuna` — Yes: Light or named skipjack; prefer pole-and-troll or troll caught. |
| F14 · Moving live crustaceans | Seafood | If buying live crab or lobster, require movement; use the product-specific check for other formats. | `crab` — Yes: Cooked crab: bright orange-red shell and no off odor.<br>`lobster` — Yes: Live tail curls; frozen tails must be hard-frozen. |
| F15 · Tagged live bivalves | Seafood | Buy live clams, mussels and oysters with traceability tags and intact, responsive shells. | `clams_mussels_oysters` — No. |
| F16 · Dry-packed scallops | Seafood | Ask for dry scallops; the ingredient list must not add phosphate or water. | `scallops` — No. |
| F17 · Cured seafood: method and format | Seafood | Identify the actual cure and required storage format; curing does not imply shelf stability. | `smoked_salmon` — Yes: Wild-caught; distinguish salt-cured lox from smoked refrigerated formats.<br>`seafood_fish_roe` — Yes: Salt-only cure; reject dyed roe and inspect jar preservatives. |
| F18 · Fluid animal milk | Dairy & alternatives | Verify farm source and grass feeding; distinguish raw from low-temperature-pasteurized fluid milk. | `whole_vs_reduced_fat_milk` — Yes: Source fallback: low-temperature pasteurized, 100% grass-fed whole milk.<br>`raw_milk` — Yes: Named farm, published testing, continuous cold chain. |
| F19 · Plain cultured dairy | Dairy & alternatives | Choose plain, grass-fed cultured dairy; identify the cultured base rather than a flavored or imitation product. | `yogurt_plain_vs_flavored` — Yes: Greek first; organic whole-milk yogurt is the stated fallback.<br>`plain_kefir` — Yes: Whole milk; keep refrigerated.<br>`sour_cream` — Yes: Cream and cultures only; distinguish acidified sour cream.<br>`cream_cheese` — Yes: Standard cream cheese name; no stabilizers.<br>`cottage_cheese` — Yes: Culture-set; avoid directly-set curd and carrageenan. |
| F20 · Raw-milk cheese | Dairy & alternatives | Read raw-milk identity and actual cheese ingredients; distinguish cheese from processed cheese products. | `cheese_real_vs_processed` — Yes: Grass-fed block; avoid shred coatings and process-cheese formulations.<br>`raw_aged_cheese` — Yes: Verify aging and raw-milk wording; source specifies sixty days. |
| F21 · Concentrated dairy fats | Dairy & alternatives | Choose grass-fed cream or butter as the fat base, with a minimal formula. | `grassfed_butter` — Yes: Cream, optional salt; yellow color varies seasonally.<br>`ghee` — Yes: Butter only; clarification removes water and milk solids.<br>`cream_vs_creamer` — Yes: Small dairy; not ultra-pasteurized; distinguish cream from creamer. |
| F22 · Plain plant drinks | Dairy & alternatives | For oat, almond and soy drinks, read the actual formula; source prefers unsweetened, unfortified versions. | `oat_milk` — Yes: Inspect added oils; formulations vary by carton.<br>`almond_milk` — Yes: Inspect added oils and protein rather than assuming milk equivalence.<br>`soy_milk` — Yes: Soybeans and water, little else. |
| F23 · Whole coconut cooking milk | Pantry; dairy alternatives | Read coconut content and additions; choose additive-free canned whole coconut milk over diluted carton formulations. | `canned_coconut_milk` — No.<br>`coconut_milk_beverage` — No. |
| F24 · Actual ice cream | Frozen; dairy | Verify the ice-cream product name and a grass-fed cream, milk and sugar formula without gums. | `ice_cream` — No. |
| F25 · Grains for soaking, sprouting or cooking | Pantry & bulk | Identify the grain and processing form; choose plain whole-grain foods with the source's soaked/sprouted preparation route. | `oats_steelcut_rolled_instant` — Yes: Organic; plain steel-cut, rolled or instant all qualify.<br>`grains_beyond_rice` — Yes: Organic whole or hulled grains; pearling removes bran.<br>`sprouted_grains` — Yes: Organic; verify sprouted whole grain, not sprouted wording alone.<br>`wild_rice` — Yes: Wildcrafted; source specifies seven-hour soaking. |
| F26 · Dried pulses | Pantry & bulk | Prefer intact dried beans, peas and lentils; inspect condition before canned convenience. | `beans_dried_vs_canned` — Yes: Canned is the fallback; rinse to reduce sodium.<br>`split_peas` — Yes: Organic split peas or lentils; source calls for soaking. |
| F27 · Nuts, seeds and their simple mixtures | Pantry & bulk; snacks | Read additions: identifiable nuts/seeds, optionally fruit or salt, without added roasting or stabilizing oils. | `nuts_raw_vs_roasted` — Yes: Organic raw or dry-roasted.<br>`nut_butter_ingredients` — Yes: Organic nuts and optional salt; separated oil is acceptable.<br>`seeds` — Yes: Raw organic chia/flax, sealed; source excludes hemp.<br>`trail_mix` — Yes: Raw or soaked nuts; unsulphured fruit, no extras. |
| F28 · Flour: grain identity and preparation | Pantry & bulk | Prefer organic whole-grain flour, freshly ground or sprouted; read actual grain identity and preparation. | `specialty_flours` — Yes: Stoneground does not prove whole; spelt and einkorn contain gluten. |
| F29 · Fermented or sprouted whole-grain baking | Bread & bakery; snacks | Check whole-grain identity; prefer genuine sourdough or sprouted processing where the product offers it. | `sandwich_bread` — Yes: Organic; no added gluten, soy or bran.<br>`sourdough` — Yes: Starter, flour, water, salt; acids alone do not establish fermentation.<br>`bagels` — Yes: Whole wheat; no added gluten.<br>`sprouted_grain_bread` — Yes: Organic sprouted grains first; no added flour.<br>`buns_rolls` — Yes: Organic whole grain; no added sugar.<br>`crackers` — Yes: Organic; olive oil or butter.<br>`pretzels` — Yes: Organic whole wheat; short list. |
| F30 · Dry pasta: read the flour | Pantry & bulk | Choose organic whole-grain, buckwheat or legume formulations; verify flour identity on the box. | `pasta_dry` — Yes: Source ranks white-flour and quinoa pasta lower. |
| F31 · Fresh egg pasta | Deli & prepared foods | Choose organic fresh pasta made from flour and egg, without additional formulation ingredients. | `fresh_pasta` — Yes: Refrigerate; opened packs have a short use window. |
| F32 · Masa foods | Pantry & bulk; snacks | Read for masa or lime-treated corn; corn wording alone does not establish nixtamalization. | `tortillas` — Yes: Masa, water and salt; distinguish flour tortillas.<br>`tortilla_chips` — Yes: Organic; inspect frying fat separately. |
| F33 · Potato chips: slices and frying fat | Snacks | Choose organic sliced-potato chips in lard, coconut or olive oil; read every added fat. | `potato_chips` — Yes: Distinguish actual slices from reconstituted potato flakes. |
| F07 · Frozen fries: potato and frying fat | Frozen | Choose organic frozen fries in tallow, lard or coconut oil; inspect the entire formula. | `frozen_fries` — No. |
| F34 · Cooking fats: read every fat named | Pantry; dairy alternatives | Identify the actual fat and processing; source accepts olive/coconut oils, dairy fats and appropriately sourced animal fats. | `cooking_oils` — No.<br>`lard_tallow` — Yes: Pastured leaf lard or grass-fed tallow; no hardening additions.<br>`plant_butter` — Yes: Coconut or olive oil base; inspect the entire blend. |
| F35 · Named-source sweeteners | Pantry & bulk | Read the actual sweetener identity; buy the named sugar, honey or syrup without substitute syrup blends. | `honey_adulteration` — Yes: Raw, unfiltered; named local producer.<br>`sugars` — Yes: Coconut or maple sugar first.<br>`maple_syrup` — Yes: Pure maple, named sugarhouse; darker for stronger flavor.<br>`molasses_whole_cane_sweeteners` — Yes: Organic molasses or whole cane juice; limit overall sweets. |
| F36 · Fruit-only preparations | Pantry & bulk; drinks | Read the ingredient list for fruit alone, without sweetening or preservation additions. | `dried_fruit` — Yes: Organic and unsulphured.<br>`applesauce` — Yes: Organic; apples alone.<br>`coconut_water` — Yes: Fresh from coconut first; packaged fallback lists only coconut water. |
| F37 · Unheated refrigerated ferments | Ferments; dairy | Require both an unheated/raw fermentation claim and cold sale; refrigeration alone does not prove an unheated ferment. | `sauerkraut` — No.<br>`kimchi` — Yes: No vinegar; inspect pack date and fish or shellfish ingredients.<br>`fermented_pickles` — Yes: Salt-brine fermentation; inspect for added vinegar.<br>`kombucha` — Yes: Plain, glass, organic tea; inspect added sugar and alcohol.<br>`raw_kefir` — Yes: Choose a named farm. |
| F38 · Fermented soy foods | Ferments | Read named soybeans, fermentation ingredients and any added grain; source prefers organic formulations. | `miso` — Yes: Soybeans, salt, koji; identify any grain.<br>`tempeh` — Yes: Firm, cohesive cake; verify any grain.<br>`natto` — Yes: Whole soybeans; chilled or frozen, with date checked. |
| F39 · Vinegar: source, process and acidity | Ferments; condiments | Identify the fermented source and raw/aged process; match labeled acidity to intended use. | `raw_cider_vinegar` — Yes: Organic, raw, unfiltered, with mother; inspect dilution and blends.<br>`vinegar` — Yes: Aged balsamic is another route; pickling requires recipe-specific acidity. |
| F40 · Bone-broth bases and soups | Pantry & bulk | Prefer homemade bone-broth foundations; packaged versions need an identifiable broth base and short food ingredient list. | `broth` — Yes: Pastured bones first; source rejects aseptic, bouillon and dehydrated formats.<br>`canned_soup` — Yes: Broth-based; inspect can integrity and flavor enhancers. |
| F41 · Vegetable-led tomato sauces | Condiments | Read the leading ingredients for actual tomatoes/vegetables; then choose the preparation format for the use. | `pasta_sauce` — Yes: Organic tomatoes first; glass, olive oil, no sweetener.<br>`salsa` — Yes: Fermented or fresh cold-case salsa before shelf jars. |
| F42 · Olive-oil dressings and prepared sauces | Condiments; deli | Read the full oil blend; source requires olive oil as the dressing/sauce oil. | `mayo` — Yes: Olive oil alone, egg yolk and acid.<br>`salad_dressing` — No.<br>`pesto` — Yes: Extra virgin olive oil, basil, pine nuts and parmesan.<br>`deli_salads` — Yes: Cold case; buy quantities usable within days. |
| F43 · Named leaves, herbs and spices | Pantry & bulk; drinks | Read the botanical identity; choose organic named herbs, spices or tea rather than anonymous flavoring. | `whole_spices` — Yes: Whole, small quantities; grind as needed.<br>`dried_herbs` — Yes: Single herb; source prefers non-irradiated.<br>`tea` — Yes: Loose leaf or named herbs; true tea generally contains caffeine. |
| F44 · Occasional cocoa foods | Pantry & bulk; snacks | Treat cocoa powder and chocolate as occasional purchases; read cocoa form and the complete formula. | `cocoa` — Yes: Organic, one ingredient; distinguish alkalized cocoa.<br>`dark_chocolate` — Yes: Short list; source's lower-percentage metals heuristic needs separate validation. |
| F45 · Sweet bakery: read fat and sweetener | Bread & bakery | Choose butter/coconut fat, a natural sweetener and soaked/sprouted whole-grain flour; ask the baker if unlabeled. | `pastries_muffins` — No. |
| F46 · Fruit preserves | Condiments | Verify jam/preserves identity and organic fruit; source accepts a natural sweetener in this cooked product. | `jam` — Yes: Source excludes citric/ascorbic additions; refrigerate after opening. |
| F47 · Barbecue sauces and marinades | Condiments | Read the sauce formula and sweetener; source prefers a short food-based list with natural sweetening. | `bbq_sauce_marinades` — Yes: Check smoke flavoring, preservatives and added oils. |
| F48 · Plain muesli | Pantry & bulk | Read for oats, fruit, nuts and seeds only; sweetness should come from the fruit. | `muesli` — No. |
| F49 · Kernels to pop at home | Snacks | Buy organic plain popcorn kernels; choose the cooking fat at home. | `popcorn` — No. |
| F50 · Whole-grain frozen waffles | Frozen | Read the first flour: organic whole grain rather than enriched flour; check the remaining formula. | `frozen_waffles` — No. |

### One shared ingredient-list avoid list

Maintain this once at L0/L4 and link it from families. These are **source-policy flags**, not newly established health claims. Family tables name positive recipes and decisive local distinctions; they do not each carry another copy of this list.

| Shared check | Scope / exception that prevents a false universal rule |
|---|---|
| Added soybean, canola, sunflower, cottonseed or unspecified “vegetable” oils; hydrogenated oils and shortening | Added extracted oils in the source's formulations. Whole nuts, seeds, soybeans and tahini are not excluded by this check. Read all oils, not merely the first. |
| Corn syrup/HFCS, artificial sweetener substitutions, concealed sweetening | Unsweetened families exclude sweetening; F35, F45, F46 and F47 intentionally admit their named sweeteners. Ice cream explicitly includes sugar. Do not impose “zero sugar” across the store. |
| Artificial colors, unspecified color additions and formulation flavorings | Use the relevant label decision; BBQ smoke flavoring is a scoped exclusion. Herbs, spices, fermentation and actual smoking are not automatically the same thing. |
| MSG, yeast extract, hydrolyzed protein and smoke flavor additives | Apply to the source's soup, prepared-food and sauce checks. Do not confuse yeast extract with the separately classified nutritional yeast food. |
| Gums, stabilizers, carrageenan, phosphates, EDTA and similar formulation additions | Apply where the named family promises a simple formula. Gluten-free bread may require binding gums; scallop phosphates and water are a separate decisive check. Cultures, rennet, salt, vinegar and koji are not blanket exclusions. |
| Added fortification, acidulants, sulphites or hardening agents | Scoped checks: fortification for plant drinks/yeast; citric/ascorbic acid for the source's jam preference; sulphites for dried fruit; hardeners for rendered fats. Never a universal “no acids/no vitamins” rule. |

## 2. L1 aisle briefings

Each cell is a proposed three-line briefing. These are navigation summaries, not additional card assignments. Cross-aisle families retain one canonical membership.

| Aisle | Three-line briefing | L2 routes |
|---|---|---|
| Produce | Choose maturity for when you will eat it.<br>Separate ripening fruit, ready-to-eat fruit, living leaves and storage crops.<br>Apply the item's sourcing priority; mixed-species cards and sprouts require L4. | F01–F06 |
| Meat & eggs | Establish ruminant feed or poultry/pork pasture sourcing first.<br>Choose the cut or form, then inspect additions and package condition.<br>Egg housing and feed are separate checks; veal, game and organs retain decisions. | F08–F10; F11 at deli |
| Seafood | Name the species, origin and product format.<br>Wild-first fish, tagged live bivalves and tinned fish need different checks.<br>Use the mercury and farming decisions before transferring a rule between species. | F12–F17 |
| Dairy & alternatives | Choose fluid milk, cultured dairy, cheese, concentrated fat or plant drink.<br>Read processing and the actual ingredient formula.<br>Keep raw-dairy evaluation separate; plant cartons are not one interchangeable recipe. | F18–F24; F37 for raw kefir |
| Pantry & bulk | Pick the one label field that distinguishes the food: grain, flour, fat or sweetener.<br>Use the shared ingredient screen with its stated exceptions.<br>Check turnover and packaging; rice and bulk-storage tradeoffs retain decisions. | F23, F25–F28, F30, F32, F34–F36, F40, F43–F44, F48 |
| Bread & bakery | Identify the actual grain and preparation method.<br>Distinguish genuine fermentation or sprouting from front-label wording.<br>For sweet bakery, read fat and sweetener; gluten-free needs its own decision. | F29, F45 |
| Ferments | Choose the food before judging raw, chilled or shelf-stable wording.<br>Cold sale alone does not establish an unheated ferment.<br>Brined vegetables, fermented soy and vinegar have different ingredient and process checks. | F37–F39 |
| Condiments | Start with the sauce's base: vegetables, oil, fruit or sweetened marinade.<br>Read the whole formula, using the shared avoid list only within scope.<br>Do not apply a ketchup, mustard or soy-sauce rule to every condiment. | F39, F41–F42, F46–F47 |
| Snacks | Whole foods, kernels and short formulas are distinct purchase routes.<br>Check grain processing and frying fat separately.<br>Bars and puffed grains keep their own substitution decisions. | F27, F29, F32–F33, F44, F49 |
| Drinks | Identify the actual beverage and its source.<br>Read added ingredients, sweetening and any required refrigeration.<br>Spring water, coconut water, tea, coffee and kombucha keep distinct checks. | F22, F36–F37, F43; L4 water and coffee |
| Deli & prepared foods | Identify actual meat, pasta or salad ingredients before judging the package.<br>Inspect preparation, holding conditions and realistic use window.<br>Whole roasted meat, cured meat and ready meals do not share one ingredient recipe. | F09, F11, F31, F42; L4 holding decision |
| Frozen | Choose the product family before applying freezer checks.<br>Buy frozen-solid packages and collect them near checkout.<br>Plain components, nuggets, fries, waffles, ice cream and pizza retain distinct rules. | F07, F09, F24, F50; L4 meals and pizza |

## 3. Standalone and label assignments

**STANDALONE-DECISION** is L4: cross-family comparisons, mixed-scope routing, or a unique purchase decision with no defensible shared family. A singleton family is used when a stable repeatable product recipe exists; L4 is used when the card principally asks the shopper to resolve a choice or exception. Existing aisle hubs are assigned here once; their concise navigation can be projected into L1 without duplicating their canonical assignment.

| Card ID | Classification | Retained decision / reason no family applies |
|---|---|---|
| `organic_worth_it_by_type` | STANDALONE-DECISION | Produce sourcing priorities across skin-on and peeled types; L1 source. |
| `frozen_vs_fresh_produce` | STANDALONE-DECISION | Fresh seasonal versus frozen fallback across produce families. |
| `freezing_produce` | STANDALONE-DECISION | Preservation workflow; vegetable-specific blanching cannot be one universal duration. |
| `produce_seasonality` | STANDALONE-DECISION | Season/locality versus frozen fallback; L1 source. |
| `washing_produce` | STANDALONE-DECISION | Cross-family washing/coating decision; ready-washed advice needs review. |
| `baking_soda_soak` | STANDALONE-DECISION | Sourcing versus residue-removal intervention. |
| `precut_produce_tradeoffs` | STANDALONE-DECISION | Whole versus cut tradeoff across heads, vegetables and fruit. |
| `produce_ripeness_by_item` | STANDALONE-DECISION | Routes item-specific maturity checks; weight and smell are not universal tests. |
| `produce_storage` | STANDALONE-DECISION | Cross-family storage and ripening-gas routing. |
| `revive_greens` | STANDALONE-DECISION | Recovery versus spoilage after purchase, not another leaf-shopping member. |
| `sprouts_raw` | STANDALONE-DECISION | Species selection and cooked-versus-raw decision; do not inherit ready-to-eat leaf rules. |
| `produce_root_vegetables` | STANDALONE-DECISION | Mixed roots: firm-at-purchase is shared; potato versus carrot/beet storage is not. |
| `produce_apples_pears` | STANDALONE-DECISION | Apples bought crisp versus pears deliberately bought firm to finish. |
| `produce_stone_fruit` | STANDALONE-DECISION | Peaches/nectarines/plums versus cherries need different post-purchase expectations. |
| `produce_melons` | STANDALONE-DECISION | Whole versus cut plus melon-specific maturity; no universal later sweetening. |
| `produce_tropical_fruit` | STANDALONE-DECISION | Pineapple versus mango/papaya/kiwi; do not inherit the source's blanket ripening claim. |
| `judging_meat_at_the_case` | STANDALONE-DECISION | Package condition/date versus misleading color across meat families. |
| `butcher_counter_asking` | STANDALONE-DECISION | Service-counter sourcing, custom grinding and bones; L1 source. |
| `organ_meats` | STANDALONE-DECISION | Cross-species feed requirements and organ-specific use window. |
| `venison_game` | STANDALONE-DECISION | Refrigerated processor and handling, rather than a livestock feed certification. |
| `beef_veal` | STANDALONE-DECISION | Mother-raised pasture veal versus crate system; adult grass-finished rule is unsuitable. |
| `mercury_by_fish` | STANDALONE-DECISION | Species/size exposure decision across fresh, frozen and canned fish. |
| `farmed_fish_by_species` | STANDALONE-DECISION | Wild-first fish versus farmed bivalves; species/operation changes the ladder. |
| `seafood_counter` | STANDALONE-DECISION | Counter questions and holding/condition checks; L1 source. |
| `goat_sheep_dairy` | STANDALONE-DECISION | Species overlay across fluid milk, yogurt, cheese and butter. |
| `dairy_case` | STANDALONE-DECISION | Type-first dairy navigation; L1 source. |
| `rice_arsenic` | STANDALONE-DECISION | Rice-specific origin, variety, bran and cooking tradeoff; not F25. |
| `cornmeal_polenta_grits` | STANDALONE-DECISION | Whole corn, lime treatment and quick-cooking rejection; differs from oats' format permissions. |
| `flour_basics` | STANDALONE-DECISION | Conflicting fresh-ground versus sprouted order inside the source summaries; unresolved ladder. |
| `bulk_bins_buying` | STANDALONE-DECISION | Open-bin turnover versus sealed packages by food stability. |
| `rancidity_check` | STANDALONE-DECISION | Deterioration across oils, nuts, seeds and whole-grain flour. |
| `olive_oil_grades` | STANDALONE-DECISION | Grade, harvest and packaging decision; deeper route from F34. |
| `bottled_water_buying` | STANDALONE-DECISION | Named spring source versus treatment-defined purified water. |
| `breakfast_cereal` | STANDALONE-DECISION | Soaked cooked oats versus boxed/extruded cereal; no shared ladder with F48. |
| `coffee_beans` | STANDALONE-DECISION | Occasional-use, roast/source and mold-testing decision; not a tea rule. |
| `gluten_free_bread` | STANDALONE-DECISION | Gluten constraint and gum tradeoff; cannot inherit whole-wheat membership. |
| `bread_aisle` | STANDALONE-DECISION | Bread-type and grain navigation; L1 source. |
| `fermented` | STANDALONE-DECISION | Ferment-type and heating navigation; L1 source. |
| `salt` | STANDALONE-DECISION | Named sea/coast sourcing; no interchangeable spice-processing ladder. |
| `nutritional_yeast` | STANDALONE-DECISION | Inactive food yeast, fortified versus unfortified; not a live ferment. |
| `ketchup_mustard` | STANDALONE-DECISION | Combined card: fermented/unsweetened ketchup versus vinegar-based mustard. |
| `hot_soy_sauce` | STANDALONE-DECISION | Combined card: brewed soy sauce versus multiple hot-sauce processes. |
| `olives` | STANDALONE-DECISION | Brine versus lye curing; cannot assume raw, live or refrigerated sale. |
| `seaweed` | STANDALONE-DECISION | Named seaweed species and kelp-specific constraint; not a generic herb rule. |
| `condiments` | STANDALONE-DECISION | Base ingredient and comparable serving sizes; L1 source. |
| `snack_bars` | STANDALONE-DECISION | Whole foods before bars; nuts/seeds/dates only as the bar fallback. |
| `snacks` | STANDALONE-DECISION | Whole-food versus packaged-snack routing; L1 source. |
| `prepared_meals` | STANDALONE-DECISION | Visible whole-food dishes plus hot/cold holding check; spans multiple recipes. |
| `hummus` | STANDALONE-DECISION | Chickpea/tahini formula versus thickened dips; cannot inherit F42's olive-oil requirement. |
| `deli` | STANDALONE-DECISION | Meat, cheese, salad and holding navigation; L1 source. |
| `frozen_pizza` | STANDALONE-DECISION | Composite crust, oil and cheese checks; one family's rule is insufficient. |
| `frozen_meals` | STANDALONE-DECISION | Plain frozen components versus formulated boxed dinners. |
| `frozen` | STANDALONE-DECISION | Frozen-solid condition and checkout timing across families; L1 source. |
| `baking_powder` | STANDALONE-DECISION | Aluminum-containing versus aluminum-free leavener; unique ingredient decision. |
| `rice_cakes_puffed_grains` | STANDALONE-DECISION | Puffed-product rejection and replacement; cannot inherit cooked-grain approval. |

LABEL-TERM cards remain independently addressable L4 explainers. Classification follows their function, so the seafood-seal explainer joins the label group even though its original category is seafood. The egg product card remains F10 despite its historical ID.

| Card ID | Classification | Label question |
|---|---|---|
| `seafood_certifications` | LABEL-TERM | MSC, ASC and BAP scope versus origin/catch information. |
| `label_natural` | LABEL-TERM | What natural establishes. |
| `label_made_with_real` | LABEL-TERM | Presence versus ingredient proportion. |
| `label_no_added_hormones` | LABEL-TERM | Species-dependent meaning of the hormone claim. |
| `label_nonGMO_vs_organic` | LABEL-TERM | Genetic-engineering scope versus organic production scope. |
| `label_cage_free` | LABEL-TERM | Housing claims versus feed. |
| `label_grass_fed_term` | LABEL-TERM | Grass-fed versus explicit finishing/100% wording. |
| `label_pasture_raised_feed` | LABEL-TERM | Pasture does not specify the supplemental ration. |
| `label_organic_scope` | LABEL-TERM | What organic covers and leaves unresolved. |
| `label_multigrain_vs_whole_grain` | LABEL-TERM | Grain count versus intact grain. |
| `label_lightly_sweetened` | LABEL-TERM | Marketing language versus added-sugar disclosure. |
| `label_no_artificial_flavors` | LABEL-TERM | Flavor claims versus actual formulation. |
| `label_front_vs_back` | LABEL-TERM | Front claims versus ingredient/nutrition panels. |
| `label_ingredient_order` | LABEL-TERM | Weight order and split ingredients. |
| `label_third_party_seals` | LABEL-TERM | Published standard and independent audit. |
| `label_cold_pressed_expeller` | LABEL-TERM | Extraction wording and refining. |
| `label_sugar_free_substitutes` | LABEL-TERM | Sugar-free versus unsweetened; named replacements. |
| `label_wild_vs_farm_raised` | LABEL-TERM | Species, production method and origin wording. |
| `label_serving_size` | LABEL-TERM | Comparable portions and servings per container. |
| `label_artificial_color` | LABEL-TERM | Named dyes versus generic color declarations. |

## 4. Flags and resolved boundaries

The standalone table is the complete list of cards fitting no shared family. The label table is the complete label-explainer exception list. Titles and family references below deliberately avoid repeating card IDs.

| Boundary / cards straddling two routes | Resolution keeping the family rule true |
|---|---|
| Apples and pears; stone fruit; tropical fruit; melons | Keep combined cards at L4. They straddle F01/F02 or require a species branch. Ripening/softening is not synonymous with gaining sweetness. A future content split can create atomic members; this proposal does not split or invent source IDs. |
| Root vegetables | L4 branches refrigerated roots versus F04 storage crops. Do not place carrots and beets under dark, cool room storage. F04 does not imply potatoes and onions should share a container or identical humidity. |
| Living leaf versus sprouts | F03 versus a standalone species/cooking decision. Crisp leaves do not imply roots-attached greenhouse production, and sprouts do not inherit a ready-to-eat leaf rule. |
| Banana/tomato sourcing versus avocado availability | F01 shares ripening behavior only. Organic requirements remain item-specific; “organic is the floor” cannot become the family rule. |
| Ruminant adults versus veal, game and mixed-species organs | F08 excludes the three L4 decisions. Milk-fed calves, hunted game and poultry organs cannot all satisfy an adult grass-finished ladder. |
| Poultry/pork versus eggs; beef franks versus other deli meat | F08/F09/F10/F11 separate the sourcing tests. Beef franks remain in F08 because their decisive ladder is 100% grass-fed beef; prepared-form details are a delta. Do not require soy-free/corn-free feed across F09. |
| Ground beef and mixed organ products | F08 owns the ground-beef card and its organ-blend delta. The mixed-species organ decision stays L4; this is navigation overlap, not duplicate membership. |
| Rotisserie and nuggets | F09 owns pasture sourcing; deli/frozen briefings provide handling context. F09 never claims all members are raw or unbreaded. |
| Wild-first fish versus farmed bivalves | F12/F15 split. The farmed-fish decision owns the exception; “wild always wins” is prohibited. Trout's named fallback refines, rather than reverses, F12. |
| Fresh, canned, live and cured seafood | F12–F17 separate purchase format. Bones/skin apply only to selected tinned species; closed shells apply only to live bivalves; live movement never applies to cooked crab. |
| Fluid milk, cream and raw kefir | F18, F21 and F37 split. A raw-milk preference must not propagate to cream or all cultured dairy. F19 makes no claim that every cultured product is raw or unheated after fermentation. |
| Goat/sheep dairy | L4 species overlay routes into F18–F21; it spans processing families and cannot inherit yellow cow-butter color. |
| Raw dairy, source temperature advice and raw-aged cheese | Keep as source-specific decisions, not universal safety guarantees. Named farms/testing and aging duration do not establish a common “safe raw” rule. Review raw-dairy recommendations before publishing shopper-facing copy. |
| Plant drinks, coconut cooking milk and plant butter | F22/F23/F34 split. Plain oat/almond/soy cartons remain the relevant format in F22; coconut's source ladder prefers canned whole milk. F34 reads fat blends, not drink fortification. |
| Cooked whole grains versus rice, puffed cereal and rice cakes | F25 excludes the L4 exceptions: rice's bran tradeoff reverses a universal whole-grain preference; puffed products do not inherit approval from their grain ingredient. |
| Instant oats versus quick-cooking corn | Split: oats remain F25; the corn-processing comparison stays L4. Corn's quick-cooking rejection must not override the explicit permission for plain instant oats. |
| Flour summaries | Split: specialty flour remains F28; the general flour card stays L4 because its decision puts sprouted first, while its short answer puts freshly ground/soaked first. Flag ordering as unresolved; do not invent a reconciled ladder. |
| Bread, gluten-free bread, dry pasta, fresh pasta and waffles | F29/F30/F31/F50 plus gluten-free L4 split. Fresh egg pasta does not inherit dry pasta's white-flour rejection; waffles do not inherit a fermentation requirement; gluten-free does not inherit whole-wheat or no-gum rules. |
| Bread versus pizza and sweet pastry | Pizza stays a composite L4 decision. F45 separates sweetened bakery from F29's loaf checks; added-sugar bans cannot spread to all baked products. |
| Chips, fries, kernels and rice cakes | F32/F33/F07/F49 plus puffed-grain L4 split. Masa processing, potato fat and home-popping are different checks. Chips and fries have separate families because their stated fat selections differ: chips permit olive oil; fries name tallow. |
| Nuts/seeds/trail mix versus bars and muesli | F27/F48 and bar L4 split. F27's added-oil check does not require every nut to be raw; dry-roasted nuts are allowed. Bars remain a fallback, not an equal rung. |
| Fruit-only products, jam, BBQ sauce and ice cream | F36/F46/F47/F24 split because sweetening rules disagree. “No added sugar” stays out of the store-wide rule. |
| Live ferments versus olives, soy ferments and vinegar | F37/F38/F39 plus olive L4 split. Salt-brine fermentation does not prove raw sale; vinegar is intentional in F39, not a universal defect. F38 does not promise all products are uncooked or live at eating. |
| Soy sauce/hot sauce; ketchup/mustard | Mixed cards stay L4. Do not apply soy brewing to every hot sauce, or vinegar-free fermentation to mustard. |
| Tomato sauce versus salsa; mayo versus deli salads | F41 shares a vegetable-led base only, not cold sale or fermentation. F42 shares the oil check only, not identical recipes or shelf life. |
| Honey, maple syrup and other sugars | F35 shares authentic sweetener identity only. Honey's raw requirement must not apply to boiled maple syrup; a coconut/maple-sugar preference does not ban the separate molasses choice. |
| Cocoa powder versus dark chocolate | F44 shares occasional use and formula inspection. It makes no shared cocoa-percentage or organic/contaminant promise. The source's metals heuristic requires validation outside this structural analysis. |
| Existing produce, dairy, bread, ferment, condiment, snack, deli, frozen and seafood hubs | Canonical assignment is L4; L1 can summarize their navigation. They are not additional product-family members. |
| Other source assertions needing review before publication | Blanket re-washing of pre-washed produce, a universal blanching time, “never chill whole tomatoes,” raw-dairy assurances, ingredient-order shortcuts, and species-wide seafood/safety statements remain source claims. This file does not silently promote them into new universal family rules. |

## 5. Script verification

The following Node script is embedded here so no second output file is needed. It checks inventory reconciliation, literal ID occurrence, exclusive classification, family count, member syntax, and the 12-word delta limit. Run from this directory with `node` using this block as stdin. It does not modify files.

```js
const fs = require('fs');
const assert = require('assert/strict');
const groups = JSON.parse(fs.readFileSync('groups.json', 'utf8'));
const kb = JSON.parse(fs.readFileSync('../../../server/kristy_perimeter_kb.json', 'utf8'));
const doc = fs.readFileSync('FAMILIES.md', 'utf8');
const ids = Object.values(groups).flat();
const expected = new Set(ids);
assert.equal(ids.length, 205);
assert.equal(expected.size, ids.length);
assert.equal(kb.entries.length, 243);
assert.equal(new Set(kb.entries.map(e => e.id)).size, kb.entries.length);
assert(ids.every(id => kb.entries.some(e => e.id === id)));
const excluded = kb.entries.filter(e => !expected.has(e.id));
assert.equal(excluded.length, 38);
assert(excluded.every(e => e.id.startsWith('pick_')));
const codeStart = doc.indexOf('```js');
const prose = doc.slice(0, codeStart);
const tokens = [...prose.matchAll(/`([^`\n]+)`/g)].map(m => m[1]);
for (const id of ids) assert.equal(tokens.filter(t => t === id).length, 1, id);
assert(!excluded.some(e => tokens.includes(e.id)));
const assignments = new Map();
const counts = { 'FAMILY-MEMBER': 0, 'STANDALONE-DECISION': 0, 'LABEL-TERM': 0 };
function assign(id, kind) {
  assert(expected.has(id), `Unknown card: ${id}`);
  assert(!assignments.has(id), `Duplicate assignment: ${id}`);
  assignments.set(id, kind);
  counts[kind]++;
}
const familyIds = new Set();
let maxDeltaWords = 0;
for (const line of prose.split('\n')) {
  const family = line.match(/^\| (F\d{2}) · /);
  if (family) {
    assert(!familyIds.has(family[1]));
    familyIds.add(family[1]);
    const cells = line.split('|');
    assert.equal(cells.length, 6);
    for (const entry of cells[4].trim().split('<br>')) {
      const member = entry.match(/^`([^`]+)` — (Yes: (.+)|No\.)$/);
      assert(member, `Malformed member: ${entry}`);
      assign(member[1], 'FAMILY-MEMBER');
      if (member[3]) {
        const n = member[3].trim().split(/\s+/).length;
        maxDeltaWords = Math.max(maxDeltaWords, n);
        assert(n <= 12, `Long delta: ${member[1]} (${n})`);
      }
    }
  }
  const other = line.match(/^\| `([^`]+)` \| (STANDALONE-DECISION|LABEL-TERM) \|/);
  if (other) assign(other[1], other[2]);
}
assert.equal(familyIds.size, 50);
assert.equal(assignments.size, expected.size);
assert(ids.every(id => assignments.has(id)));
console.log(JSON.stringify({
  kbEntries: kb.entries.length, excludedPicks: excluded.length,
  families: familyIds.size, ...counts, maxDeltaWords,
  assigned: assignments.size, missing: 0, duplicates: 0, unknown: 0
}, null, 2));
```

Executed successfully against the source files and this document:

| Check | Actual result |
|---|---:|
| KB entries | 243 |
| Excluded picks | 38 |
| Families | 50 |
| FAMILY-MEMBER cards | 130 |
| STANDALONE-DECISION cards | 55 |
| LABEL-TERM cards | 20 |
| Longest item delta, whitespace-counted words | 10 |
| Missing / duplicate / unknown assignments | 0 / 0 / 0 |

**Verified total: 205 of 205 card IDs assigned exactly once (130 + 55 + 20); 38 picks excluded.**
