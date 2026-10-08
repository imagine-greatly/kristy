**202 cards audited; 103 flagged under the aisle test: 95 shelf cards and eight intentional home cards. 99 pass.** The [server KB](/Users/m1/kristy/server/kristy_perimeter_kb.json) contains another 31 lightweight `pick` entries, which are excluded from the card count. No files changed.

I flagged cards containing an unspecified selection rule, research dependency, inaccessible check, or home-only step. Specific label matches and usable physical checks pass; the eight home cards are scope mismatches, not evidence of bad writing.

**Eggs — current `pick_steps`, verbatim:**

> “Look for ‘soy-free’ and ‘corn-free’, mostly on regional cartons and farm stands.”  
> “In the supermarket, organic is the rung you can reliably buy.”  
> “For space, pasture-raised with Certified Humane or Animal Welfare Approved is strongest.”

**Current and pre-K-TIGHT `decision`, verbatim:** “Soy-free and corn-free first, then organic, then pasture-raised.”

**Current and pre-K-TIGHT `look_for`, verbatim first three of five items:** “ ‘Soy-free’ and ‘corn-free’ are the only words on the carton about the ration.” / “Organic reaches the feed from another direction: organic feed, no GMOs, no routine antibiotics.” / “ ‘Pasture-raised’ plus Certified Humane or Animal Welfare Approved is the strongest space claim.”  
The leading spaces above are quotation formatting; the field text begins with the inner quotation marks. `look_for` is [projected from `buying_tips`](/Users/m1/kristy/server/lib/counterCards.js:361), not stored under that key in the KB. All five eggs tips are unchanged.

**History:** Before K-TIGHT, at `9c8d49c`, eggs had no `pick_steps`. `git log -p` identifies **`0bbde9d` — “K-TIGHT B04 poultry+eggs”** as the commit adding today’s steps. P4 (`9c7a52a`) kept them; the [polish ledger records “egg_labels | kept”](/Users/m1/kristy/docs/ktight/POLISH.md:76). Merge: `73a1854`. The decision ladder was introduced earlier, in `e9a7538`.

**All three rungs are supported:** the first quoted tip supports explicit soy/corn-free feed words; the second supports organic feed; the third supports certified pasture-raised space. The decision supplies their order. Its `tier_note` explicitly says: “Ranking feed above room is the standard.” This supports a shopping standard, not a health-benefit claim.

**Eggs passes the named-label test.** Its buy order would read more clearly as: **“Pick soy-free and corn-free; if unavailable, organic; if unavailable, pasture-raised with Certified Humane or Animal Welfare Approved.”**

Pre-K-TIGHT decisions were better **relative to the added steps**, by pattern:

- **Yes:** explicit ingredient winners, exclusions, and preferred methods became “read/compare” instructions without the winning choice.
- **No:** entries already offering descriptions, unspecified comparisons, or verification requests had the same source gaps.
- **No:** intentional home cards need home instructions, not invented shopping ladders.

**All 202 decisions are unchanged across K-TIGHT.** The concern is added-step quality, not wholesale replacement of the decision lines. Below, **D** means `decision`; **B#** means the numbered `buying_tips` item retained in projected `look_for`. **Gap** means those fields cannot support a ranked replacement. Step quotations are shortened excerpts.

| id | Current step text (short) | Why it fails | Suggested ranked replacement from own D / look_for |
|---|---|---|---|
| `salmon_wild_vs_farmed` | S3: “On farmed fish, read the country first…” | No preferred country is supplied. | Pick wild; frozen wild Alaskan before fresh farmed. **D/B1** |
| `fresh_vs_previously_frozen_fish` | S3: “Cook a fillet sold thawed; do not refreeze it.” | Cooking instruction, not an aisle selection. | Pick frozen fish to thaw at home; keep the thawed-fish instruction outside picking steps. **B2–3** |
| `ground_beef_organ_blend` | S3: “…keep servings ordinary.” | “Ordinary” is undefined and cannot select a pack. | Pick liver and heart named with individual percentages; pass on an unquantified “organ blend.” **D/B1** |
| `frozen_vs_fresh_produce` | S3: “…fresh that traveled far or sat in storage.” | Travel and storage history are not visible. | Pick frozen fruit or vegetables listing only the fruit or vegetable, without sauce or added sugar. **B1** |
| `freezing_produce` | S1: “Scald vegetables sixty seconds…” | Intentional home card; impossible aisle action. | No supported aisle ranking; retain blanching/freezing instructions as home content. **D/B1–5** |
| `produce_seasonality` | S3: “Check a farmers market or LocalHarvest…” | Requires leaving the aisle or doing research. | Pick the listed seasonal produce; off-season, frozen before sad fresh. **B2/B4–7** |
| `washing_produce` | S1: “Rinse under cold running water…” | Intentional home card. | Skip produce wash; use plain cold water at home. **D/B3** |
| `baking_soda_soak` | S2: “Soak twelve to fifteen minutes…” | Intentional home card; lengthy kitchen procedure. | No supported aisle buy order; retain the soak as home instructions. **D/B1–4** |
| `a2_vs_a1_milk` | S3: “Small dairies name the breed…” | Dairy size is a generalization, not a matching instruction. | Match printed “Jersey,” “Guernsey,” or “A2”; omit the dairy-size generalization. **B2** |
| `raw_milk` | S2: “…publishes its herd test results.” | Requires prior sourcing research. | After farm verification, pick a readable bottling date and cream line; verification belongs before shopping. **B1/B3–4** |
| `rice_arsenic` | S3: “At home, boil it in plenty of water…” | Kitchen procedure. | Pick basmati or sushi rice; prefer the listed California, India or Pakistan origins. **B2–3** |
| `honey_adulteration` | S2: “…a producer you can trace.” | Traceability requires undefined research. | Pick single-source or raw honey whose ingredient list contains only honey. **B1–2** |
| `beans_dried_vs_canned` | S2: “Canned: rinse them…” | Home preparation, not a selection check. | Pick dried beans with whole, unbroken skins over split beans. **D/B3** |
| `bean_soak_salt` | S1: “Soak overnight…”; S2: “…a bin that turns over…” | Home card; turnover is also unobservable without history. | No supported five-second aisle ranking; retain the brining instructions at home. **D/B1–3** |
| `label_natural` | S3: “Read the ingredient list…” | No ingredient target or winner. | Match a defined claim appropriate to the food—organic, grass-finished or pasture-raised—over “natural.” **B2** |
| `label_made_with_real` | S3: “Trust the ingredient panel…” | General principle, not a selection rule. | Pick the pack where the named “real” ingredient appears earlier, ahead of added sugar or refined flour. **B1–2** |
| `label_no_added_hormones` | S2: “…find a third-party verifier.” | No verifier is named. | Chicken/pork: ignore this claim; beef/dairy: **Gap—no named verification target.** **D/B1–2** |
| `label_nonGMO_vs_organic` | S2: “…a food that has no GMO version.” | Requires knowledge of the GMO crop universe. | On an organic pack, accept the organic seal without requiring a second non-GMO seal. **D/B1** |
| `label_cage_free` | S3: “…a certifier’s seal.” | Unnamed seal cannot be matched reliably. | Certified pasture-raised before cage-free/free-range; **Gap—the entry names no certifier.** **D/B1–3** |
| `label_grass_fed_term` | S3: “Ask the butcher…” | Does not state the question or acceptable answer. | Pick “100% grass-fed” or “grass-finished” over bare “grass-fed.” **B1** |
| `label_pasture_raised_feed` | S2: “Read the carton for space and feed…” | Broad instruction without the space-label target. | For feed, match printed “soy-free” or “corn-free”; pasture wording does not substitute for either. **D/B1–2** |
| `label_organic_scope` | S1: “Read the ingredient panel…” | No processing criterion or preferred ingredients. | For thin-skinned produce eaten whole, prioritize organic; **Gap—no processed-food ingredient ranking.** **B1/B3** |
| `produce_picking_ripeness` | S1: “Read the origin as the month…” | Abstract interpretation; no month-to-origin map. | Press with your palm and take the heavier of two. **B2** |
| `label_no_artificial_flavors` | S3: “…recognizable food names…” | “Recognizable” depends on the shopper’s knowledge. | Between packs, choose the shorter food-ingredient list over the front flavor claim. **B4** |
| `egg_shell_color` | S3: “Read the printed feed words…” | No feed words are named in this entry’s D/look_for. | Treat shell colors as tied; **Gap—no supported feed-label ladder in these fields.** **D/B1–5** |
| `egg_grades_sizes` | S1: “Compare … per ounce, not per dozen…” | Requires arithmetic; does not give a quick carton choice. | Fresher carton before higher grade; for baking, Large. **B1/B3** |
| `egg_storage` | S1: “…middle or lower shelf, not the door.” | Intentional home card. | No aisle ranking needed; retain carton/refrigerator storage instructions at home. **D/B1–4** |
| `beef_grades_usda` | S1: “…grade on a quick-cooked steak…” | Does not name the grade order. | For quick-cooked steak: Prime, then Choice, then Select; do not select braising cuts by grade. **B1/B3** |
| `dry_brine` | S1: “Salt one percent by weight…” | Intentional home card; weighing and advance preparation. | No supported aisle ranking; retain dry-brining as home instructions. **D/B1–5** |
| `butcher_counter_asking` | S2: “Ask the sourcing…”; S3: “Name section, thickness and size…” | Multiple questions and requests exceed one quick selection. | For ground beef, ask for a fresh chuck grind before choosing the prepacked tray. **B2** |
| `pork_cuts_and_enhanced` | S3: “…skip your own brine…” | Home cooking consequence. | For braising, shoulder/Boston butt/picnic; for fast cooking, loin or tenderloin. **D/B1–2** |
| `deli_meat_uncured` | S2: “…every curing substance…” | No curing ingredient is named in the step. | Whole roasted meat first; otherwise counter-sliced before the prepacked tub. **B3–4** |
| `farmed_fish_by_species` | S3: “…a credible certification.” | No certification name or preferred country. | Pick mussels/oysters/clams, trout, arctic char or barramundi; **Gap—salmon/shrimp verification targets.** **D/B1–3** |
| `seafood_certifications` | S3: “…judge that by nose, eyes and ice.” | No smell, eye or ice pass/fail criteria. | Wild: blue MSC; farmed: ASC or BAP. Keep freshness checks separate until their criteria are supplied. **D/B1–3** |
| `produce_storage` | S1: “Keep apples, bananas, avocados…” | All current steps concern home storage. | Buy at staggered ripeness instead of one ripeness level; retain storage instructions at home. **B6** |
| `revive_greens` | S2: “Soak thirty minutes…” | Intentional home card. | No supported aisle ranking; retain revival instructions as home content. **D/B1–3** |
| `whole_spices` | S2: “…a bin that turns over…”; S3: “Toast in a dry pan…” | Unobservable turnover plus kitchen procedure. | Whole spices before ground; buy the smallest amount you will finish. **D/B1/B3** |
| `rancidity_check` | S3: “Freeze whole-grain flour and shelled nuts…” | Home storage instruction. | Pick oil in a dark bottle sized for use within two months; smell bulk goods before bagging. **B1/B3** |
| `bottled_water_buying` | S2: “A label naming a process…” | Does not name the process words. | Named spring and town first; recognize “purified,” “distilled,” “deionized” and “reverse osmosis” as process words. **D/B1/B5** |
| `label_front_vs_back` | S3: “…a short, recognizable list…” | “Recognizable” is subjective; no concrete food targets. | Between packs, choose the shorter food list on the back panel over front claims. **B1/B5** |
| `label_ingredient_order` | S1: “Read the first three ingredients…” | Explains quantity without supplying a winning ingredient. | Use the Added Sugars total instead of tallying separate sweeteners; **Gap—no ingredient buy order.** **B3–4** |
| `label_third_party_seals` | S1: “…third-party audited program…”; S3: “Read the ingredient panel…” | Requires audit research; ingredient criterion is absent. | **Gap:** D/B1–5 name neither an accepted program nor a winning ingredient; no supported ranked rewrite. |
| `label_cold_pressed_expeller` | S1: “Which oil it is comes first…” | Names canola but omits the preferred oils. | Olive, avocado or coconut first; then match “cold-pressed” or “expeller-pressed.” **B1–4** |
| `label_sugar_free_substitutes` | S2: “…a sugar alcohol or a high-intensity sweetener.” | Requires classifying unfamiliar ingredient names. | “Unsweetened” before “sugar-free”; if examining substitutes, name erythritol, maltitol, xylitol, stevia, monk fruit, sucralose or aspartame. **B2–3** |
| `label_wild_vs_farm_raised` | S2: “…a staffed counter can usually answer.” | Promise about staff, not a question or winner. | Whole or skin-on before a bare fillet; match species, method and country. **B1/B4** |
| `label_artificial_color` | S3: “Expect color low on the list…” | Placement fact supplies no buy choice. | **Gap:** D/B1–4 decode color wording but establish no preferred color or color-free choice. |
| `raw_kefir` | S3: “…a pour thick enough to cling.” | Requires opening and pouring the product. | Plain before sweetened; choose a bottle showing a culture or bottling date. **D/B2/B4** |
| `strawberries_organic_residue` | S3: “The brand name says nothing…” | General warning repeats the lesson without a check. | USDA Organic seal first; no seal means conventional regardless of the box name. **B1–2** |
| `produce_root_vegetables` | S3: “Remove carrot tops before refrigerating…” | Home preparation/storage. | Pick firm roots; skip soft, shriveled or sprouting ones. **D/B1–4** |
| `produce_leafy_greens` | S3: “Store lettuce and spinach near 32°F…” | Home storage. | Pick crisp, evenly green leaves; for kale, smaller leaves on moist stems. **D/B1–4** |
| `pretzel_bread` | S1–2: “Ask which bath…” / “Ask whether…” | Bakery interview; no packaged-loaf check. | At a bakery: lye-dipped first, baking-soda bath if unavailable; **Gap—packaged shelf verification.** **B1–3** |
| `bagels` | S2: “Ask what goes in the bath…” | Process question does not select a bagel. | Pick boiled-before-baked bagels; ask the baker when no process label exists. **D/B1–2** |
| `tortillas` | S3: “…read the flour and the named fat…” | No preferred flour or fat is supplied. | For corn tortillas, pick masa/masa harina, water and salt; check for added wheat flour. **D/B1/B3** |
| `turkey_whole` | S3: “…read retained water apart…” | Distinguishes disclosures without stating the winning bird. | Pick turkey without an injected basting solution; inspect the solution statement beside the name. **D/B1–2** |
| `ground_turkey` | S2–3: “compare packs…” / “Read each pack’s fat content…” | No preferred fat level or intended-use mapping. | Pick turkey without seasonings or flavoring solution; **Gap—no fat-level buy order.** **D/B1–3** |
| `oat_milk` | S2: “Compare the labels…” | No preferred protein, fortification or stabilizer criteria. | **Gap:** D/B1–3 provide comparison fields but no winning values or formulation order. |
| `coffee_beans` | S2: “Judge the whole packaging…”; S3: “…away from heat.” | Undefined judgment plus home storage. | Pick an intact sealed bag; do not require a valve. **D/B1–2** |
| `bacon` | S3: “Compare the disclosed curing ingredients…” | No curing-ingredient preference is established. | **Gap:** D/B1–3 supply no curing-ingredient buy order; a ranked rewrite needs additional KB material. |
| `hot_dogs` | S1: “…read every other ingredient…” | Broad scan instead of a focused exclusion. | Pick named meat; pass on mechanically separated chicken or turkey. **D/B3** |
| `chicken_breast` | S3: “Read retained chilling water apart…” | Disclosure distinction does not identify the chosen pack. | Pick plain breast without an added flavoring solution; inspect the full product-name disclosure. **D/B1–2** |
| `produce_green_beans` | S3: “…cook them within five days.” | Home storage/cooking instruction. | Pick smooth, slender pods without bulging seeds; reject brown/rust spots. **D/B1–2** |
| `egg_duck_quail` | S3: “Plan a longer cooking time…” | Kitchen planning. | Pick refrigerated cartons with clean, uncracked shells. **B1–2** |
| `ham` | S2: “Find where water sits…” | No preferred water position or label-class order. | **Gap:** D/B1–3 do not rank water-added classes; they only request reading them. |
| `turkey_bacon` | S2: “Read each curing ingredient…” | No named target or preferred curing formulation. | **Gap:** D/B1–3 provide no curing-ingredient ranking; retain exact descriptive-name checks only. |
| `cured_pork` | S2: “Read each curing ingredient…” | No preferred curing ingredients. | **Gap:** D/B1–3 do not support a curing buy order; select the required cut and cooking-status label explicitly. |
| `lamb_goat` | S3: “Read the primal cut… and stew adult goat.” | Unspecified cut check plus cooking instruction. | Lamb: Choice, firm flesh and white marbling; goat: firm, fine-grained flesh and distributed white fat. **D/B1–3** |
| `organ_meats` | S2: “…which organs they offer.” | Availability question gives no choice criterion. | For braising, choose heart or tongue; buy only for cooking within one to two days. **B1/B3** |
| `bison` | S3: “Cook or freeze ground bison within 2 days…” | Home handling. | Pick a pack bearing the “U.S. Inspected and Passed” triangle or a state mark. **D/B1** |
| `venison_game` | S1: “…handles each animal on its own.” | Processor practice requires prior verification. | **Gap:** D/B1–2 require processor research and supply no aisle-visible replacement check. |
| `duck_meat` | S2: “Check the freezer case… and bag it separately.” | Location and handling do not choose a pack. | Pick duckling or roaster duck; when graded, match the USDA Grade A shield. **D/B1–2** |
| `seafood_counter` | S1: “Ask the species, then where… whether it was farmed.” | Multi-question exchange; no preferred answers. | Pick fish displayed on ice/refrigerated; cooked seafood must be kept apart from raw. **B3–4** |
| `gluten_free_bread` | S2: “Read which flours and starches…”; S3: “…ask a doctor…” | No formulation winner; consultation is outside aisle selection. | Pick a loaf bearing one of the four explicit gluten-free claim wordings; **Gap—no flour/binder ranking.** **D/B1–3** |
| `plain_kefir` | S3: “Use it in place of buttermilk…” | Recipe use. | Pick an unflavored bottle from the refrigerated case. **D/B1–2** |
| `sour_cream` | S3: “Read the optional ingredients…” | Does not name a preferred addition or exclusion. | “Sour cream” or “cultured sour cream” before acidified sour cream. **D/B1** |
| `ghee` | S3: “Choose ghee for its nutty taste and aroma.” | Reason to like ghee, not a check on a sealed jar. | For plain ghee, pick butter alone; a spices-listed jar is flavored. **D/B1–2** |
| `almond_milk` | S2–3: “Compare protein, vitamin D…” / “Check saturated fat…” | Multiple metrics without preferred values. | Unsweetened before sweetened, vanilla or chocolate; **Gap—no nutrient-ranking criteria.** **D/B1–3** |
| `soy_milk` | S3: “Compare protein and potassium…” | No preferred quantities. | Pick fortified and unsweetened before flavored; **Gap—no further nutrient ranking.** **D/B1–3** |
| `coconut_milk_beverage` | S3: “Find it in the nondairy milk section…” | Navigation, not selection between cartons. | For cooking, pick the can over the carton; for a drink, the carton. **D/B3** |
| `plant_butter` | S3: “Compare the fat line…” | No preferred oil or fat level. | **Gap:** D/B1–3 name neither a preferred oil nor a winning fat value. |
| `dairy_case` | S1: “Choose the type first…”; S3: “…protein and sugar lines.” | Topic routing and unspecified metrics. | **Gap:** D/B1–3 do not rank dairy types or supply vitamin/protein/sugar targets. |
| `kimchi` | S1: “…see how long it has fermented.” | Date has no target age or use-specific cutoff. | For eating as is, crisp/plump/bright; for cooking now, lighter/softer. **D/B2–3** |
| `fermented_pickles` | S2: “…no vinegar; some makers add it…” | Conflicting instruction leaves the shopper to resolve an exception. | Pick refrigerated salt-brine fermented pickles; half-sour for crisp/green, full-sour for fully fermented. **D/B1–4** |
| `natto` | S2: “Check the date… so freeze extra.” | No date acceptance rule; remainder is home storage. | Pick sealed trays kept cold or frozen. **D/B2** |
| `sugars` | S3: “Keep brown sugar closed…” | Home storage. | Dark brown for more molasses; light brown for less. **D/B1** |
| `seeds` | S3: “Keep opened flax in the refrigerator…” | Home storage. | Ground flax unless grinding at home; hulled hemp when no grinding is wanted. **D/B1–2** |
| `nutritional_yeast` | S3: “…by how it will be used.” | No form-to-use mapping. | **Gap:** D/B1–2 provide no flakes/granules/powder ranking or use mapping. |
| `canned_coconut_milk` | S1–2: “…beyond coconut” / “Compare two cans…” | No preferred additions or winning amount. | **Gap:** D/B1–3 describe gums and comparisons without establishing a preferred formulation. |
| `vinegar` | S3: “…the full protected name and its aging words.” | Neither the name nor the accepted aging words is given. | For pickling/canning, pick printed 5% acidity; **Gap—balsamic name/aging targets.** **D/B2/B4** |
| `jam` | S3: “…refrigerate every opened jar.” | Home storage. | Pick named-fruit “Jam” or “Preserves”; preserves when whole fruit/pieces are wanted. **D/B1–2** |
| `mayo` | S3: “Compare jars by what they add…” | No preferred additions or oil order. | Pick a jar named “Mayonnaise”; **Gap—no preferred-oil or additive ranking.** **D/B1–3** |
| `hot_soy_sauce` | S1–3: wheat/gluten/vinegar reads | Steps omit the decision’s brewed-versus-acid-made winner. | Brewed soy sauce before acid-made; **Gap—these fields give no verification cue.** **D** |
| `baking_soda_powder` | S2: “Keep both dry…”; S3: “To test soda…” | Home storage and kitchen experiment. | Pick “double acting” baking powder and check its expiration date. **B1–2** |
| `salsa` | S2: “…goes straight back in the refrigerator.” | Home storage. | Pick onions, peppers and tomatoes alongside an acid; buy fresh tubs from the cold case. **D/B1–2** |
| `condiments` | S1: “Read the first ingredient…”; S3: “Write the open date…” | No winning ingredient; home labeling instruction. | **Gap:** D/B1–2 tell where to read but not which ingredient or formulation to choose. |
| `tortilla_chips` | S2: “Some corn chips use corn…”; S3: “…wedges and fried.” | Manufacturing facts without a selection check. | Pick masa/corn masa with a trace of lime on the list. **D/B1–2** |
| `popcorn` | S3: “…a plain brown paper bag in the microwave.” | Kitchen method. | Plain kernels before coated/prepopped products; add desired toppings at home. **D/B1** |
| `pretzels` | S3: “…just a tanned twist of dough.” | Opinion about an unseen process. | Pick the polished-mahogany glossy crust; paler can indicate the baking-soda bath. **D/B2–3** |
| `snacks` | S1: “Trust the ingredient list…” | Generic instruction with no target. | Pick whole grain, vegetable or bean listed first, regardless of the front claim. **B2** |
| `deli_salads` | S3: “Get it home cold…” | Journey/home handling, not a tub choice. | Pick refrigerated salads with a Sell-By date not passed. **D/B1–2** |
| `deli` | S3: “Ask about one food by name…” | Routes a question instead of choosing food. | Pick refrigerated meats/cheeses/salads; for hot food, match a case at 140°F or above. **B1–2** |
| `frozen_pizza` | S3: “A meat named on the box sets no minimum…” | Supplies no visible meat-quantity choice. | Pick the short flour/water/salt/yeast crust list; for whole wheat, whole wheat flour first. **D/B1–2** |
| `frozen_meals` | S1: “…sets the floor for the meat inside.” | No name-to-minimum mapping, so the rule cannot be applied. | Match an inspection mark; **Gap—D/B1–2 provide no meat-content buy order.** |
| `frozen` | S3: “Get it into the home freezer soon…” | Home handling. | Pick only frozen-solid food; ice cream should be brick-hard; collect it just before checkout. **B1/B4** |

