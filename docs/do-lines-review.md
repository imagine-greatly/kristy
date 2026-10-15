# The `do` lines — review sheet

The `do` line is the whole point of the counter-card redesign, and the one field on a
card that cannot be derived: it names a physical action at the shelf, which no
re-ranking of the authored KB prose produces. So every line here was written by hand
against the entry, not lifted from `buying_tips[0]`.

**This file is the migration's source.** `scripts/migrateCounterCards.js` parses the
table below and refuses to write a card whose `do` line is missing. Edit the `proposed
do` column in place; leave the other columns alone (they are re-derived from
`kristy_perimeter_kb.json`, which stays the source of record for everything else).

## The bar a line has to clear

Could someone holding a cart act on this line **alone**, without reading anything else
on the card? It must name something observable in the store — a word printed on a
label, a color, a number, a physical location, a specific product — and it must not
restate the headline. The headline is the verdict; the `do` is the physical action. If
they say the same thing, the card wastes its most valuable line.

Also: imperative, starts with a verb, ≤14 words.

## Flag legend

| flag | what it means |
| --- | --- |
| `GENERIC` | my draft fails the bar — it names nothing you could act on at the shelf |
| `RESTATES` | the draft repeats the headline instead of adding the physical action |
| `HOME` | the only real action is in the kitchen, not the store — the bar may not apply to this card |
| `NARROW` | the action is real but only applies in a sub-case (e.g. only when baking) |
| `DUPLICATE` | this card overlaps another closely enough that the two `do` lines will read alike |
| `DRIFTED` | the line is observable and actionable, but it serves a NeighborING card's verdict rather than this one's |
| `RULING4` | the observable sits in the headline, so no honest `do` line can avoid restating it — the fix is a headline edit in the KB, not a redraft here |
| `HEADLINE Nw` | the KB `decision` this card uses as its headline is over the 12-word limit and needs trimming in the KB, not here |


| slug | section | current headline | proposed do | flag |
| --- | --- | --- | --- | --- |
| `salmon_wild_vs_farmed` | seafood | Wild salmon, and frozen wild before fresh farmed. | Take the frozen sockeye from the freezer case, not the fresh Atlantic. | — |
| `shrimp_imported_vs_domestic` | seafood | Wild American shrimp, read by the country of origin printed by law. | Read the country-of-origin line on the bag, then look for BAP or ASC. | — |
| `rotisserie_chicken` | meat | Chicken and salt on the label: buy. Phosphate and starch: pass. | Read the ingredient list: two words is plain; water second means a solution. | — |
| `beef_grassfed_vs_grainfed` | meat | 100% grass-fed or grass-finished, no added hormones, with a certifier’s seal. | Look for a whole-life seal: American Grassfed, or Certified Grassfed by AGW. | — |
| `beef_cuts_basics` | meat | Chuck or round, whole, with no needles or blades pushed through. | Read the name for “mechanically tenderized” before the cut name. | — |
| `ground_beef_lean_ratio` | meat | Organ blend with each organ’s percentage first, then ground beef with nothing added. | Read the label for organ names, each with a percentage beside it. | — |
| `egg_labels` | eggs_dairy | Pasture-raised, organic, and corn- and soy-free, all three together. | Find all three words on one carton, plus a certifier’s pasture seal. | — |
| `organic_worth_it_by_type` | produce | Organic on anything you eat the skin of, conventional on what you peel. | Spend the organic money on berries, greens, and apples. | — |
| `frozen_vs_fresh_produce` | produce | Frozen vegetables are picked ripe and frozen within hours. | Read the bag’s ingredient list for one word: the vegetable. | — |
| `freezing_produce` | produce · home | Enzymes keep working in the freezer until heat switches them off. | Blanch vegetables sixty seconds, chill them, then freeze flat. | — |
| `produce_seasonality` | produce | Produce in season is picked closer to ripe and travels less. | Read the farmers’ market as the signal for what is in season locally. | — |
| `washing_produce` | produce · home | Plain cold water removes as much residue as a produce wash does. | Scrub the firm ones with a brush. Rinse and spin the greens. | — |
| `baking_soda_soak` | produce · home | Baking soda in the water lifts residue a plain rinse leaves. | Soak the fruit twelve minutes, then rinse it clean. | — |
| `precut_produce_tradeoffs` | produce | Cutting produce starts the clock on vitamin loss and browning. | Check the use-by date, since pre-cut spoils days before whole produce does. | — |
| `grassfed_butter` | eggs_dairy | Deepest yellow butter: cream, and salt if salted. | Look through the wrapper window before choosing a block. | — |
| `whole_vs_reduced_fat_milk` | eggs_dairy | Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed. | Check the side panel for the pasteurization words and a grass-fed seal. | — |
| `cheese_real_vs_processed` | eggs_dairy | Block cheese is milk, cultures, salt and enzymes, and nothing else. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Plain Greek yogurt made from 100% grass-fed milk. | Check the ingredients for milk and cultures, with nothing after them. | — |
| `raw_milk` | eggs_dairy | Raw milk is worth seeking out from a farm you can name. | Buy from a farm you can visit that posts its test results. | — |
| `rice_arsenic` | bulk_pantry | Arsenic collects in the bran, which is why white rice carries less. | Read the origin on the bag: India, Pakistan or California. | — |
| `oats_steelcut_rolled_instant` | bulk_pantry | Plain oats are the same grain in every form; packets add sugar. | Turn the canister over. One ingredient, and it is oats. | — |
| `nuts_raw_vs_roasted` | bulk_pantry | Raw and dry-roasted nuts have nothing added but sometimes salt. | Read the ingredient line for cottonseed or soybean oil before buying roasted. | — |
| `honey_adulteration` | bulk_pantry | Supermarket honey is often blended and filtered; raw honey is neither. | Buy honey with a producer and a region named on the jar. | — |
| `beans_dried_vs_canned` | bulk_pantry | Dried beans are the same bean, and you control the salt. | Fill a bag from the bulk bin. Whole beans, no split skins. | — |
| `label_natural` | label_terms | ‘Natural’ has no legal definition on most foods, so it promises nothing. | Look for a defined word instead: organic, grass-finished, or pasture-raised. | — |
| `label_made_with_real` | label_terms | ‘Made with real’ sets no minimum, so the amount can be tiny. | Count how far down it sits. Past third is a trace. | — |
| `label_no_added_hormones` | label_terms | Poultry and pork cannot be given hormones, so the claim is free. | Look for a third-party verifier on the beef and dairy claim. | — |
| `label_nonGMO_vs_organic` | label_terms | Organic already forbids GMOs, so the second sticker adds nothing. | Buy the USDA Organic seal alone — paying for both is paying twice. | — |
| `label_cage_free` | label_terms | Cage-free and free-range both describe a barn, not a field. | Read the carton for a welfare certifier: Certified Humane, AWA, G.A.P. | — |
| `label_grass_fed_term` | label_terms | ‘Grass-fed’ alone still allows a grain finish at the feedlot. | Look for “100%” or “grass-finished” printed on the package. | — |
| `label_pasture_raised_feed` | label_terms | It means space, not feed. The word to find is soy-free. | Read both sides of the carton — space and feed are separate claims. | — |
| `label_organic_scope` | label_terms | Organic certifies how food was grown, not how processed it is. | Flip the organic box over. The seal says nothing about the ingredients. | — |
| `label_multigrain_vs_whole_grain` | label_terms | ‘Multigrain’ counts grains; ‘whole grain’ says the bran stayed in. | Read the first ingredient — it must say “whole wheat flour.” | — |
| `label_lightly_sweetened` | label_terms | ‘Lightly sweetened’ is not defined, so the number is the only answer. | Scan the ingredient list for syrup, cane juice, and concentrate. | — |
| `label_no_artificial_flavors` | label_terms | The claim bans synthetic flavoring but leaves everything else untouched. | Look for “natural flavors” further down the list — the claim leaves it in. | — |
| `judging_meat_at_the_case` | meat | The pack with the newest ‘packaged on’ date in the case. | Check the package is sealed and not leaking juices, then smell it. | — |
| `butcher_counter_asking` | meat | Ask for beef soup bones, and a whole chuck ground fresh. | Ask what came in today and when it was cut. | — |
| `chicken_cuts_basics` | meat | Air-chilled whole chicken first, then bone-in, skin-on thighs. | Take the pack with the skin still on. It bastes itself. | — |
| `pork_cuts_and_enhanced` | meat | Pork whose label carries no added-solution percentage, only pork. | Read the fine print for “contains up to”. Brine is sold by weight. | — |
| `deli_meat_uncured` | meat | ‘Uncured’ meat is cured, using celery powder instead of added nitrite. | Ask the counter to slice whole roasted meat thin instead. | — |
| `mercury_by_fish` | seafood | Sardines, salmon and skipjack are small fish that live short lives. | Check the species name on the case tag. Size predicts the mercury. | — |
| `canned_fish_choosing` | seafood | Tinned fish in olive oil or water, bones and skin left in. | Read the pack medium: “vegetable oil” means a seed-oil blend. | — |
| `farmed_fish_by_species` | seafood | Farmed trout, char and shellfish are worth buying without hesitation. | Buy the farmed mussels, clams and oysters. They are fed nothing. | — |
| `seafood_certifications` | seafood | MSC is the wild-catch seal worth trusting; farm seals set a minimum. | Check the badge names a program you can look up. Unnamed is marketing. | — |
| `produce_ripeness_by_item` | produce | The heavier piece of two the same size holds more juice. | Smell the stem end on anything that ripens after picking. | — |
| `berries_picking` | produce | Organic berries, and the carton’s underside decides, not the top. | Flip the container and check for juice stains or fuzz. | — |
| `produce_storage` | produce · home | Washing produce before storing it traps moisture and speeds rot. | Keep apples and bananas out of the drawer with your greens and berries. | — |
| `revive_greens` | produce · home | Limp greens have lost water, not gone bad, and they come back. | Trim the stem ends and stand them in ice water thirty minutes. | — |
| `cream_vs_creamer` | eggs_dairy | Non-dairy creamer is oil, sugar and thickeners, with no milk. | Read the panel for milkfat percent — real cream states 36% or 10.5%. | — |
| `flour_basics` | bulk_pantry | Whole wheat flour first; on white flour, unbleached and unbromated. | Read the list for potassium bromate, and take the smallest whole-wheat bag. | — |
| `bulk_bins_buying` | bulk_pantry | Dry staples keep well in bulk; anything oily turns rancid first. | Choose the full, busy bins over a dusty half-empty one. | — |
| `whole_spices` | bulk_pantry | Ground spice loses its oils within months; whole spice keeps them. | Toast them in a dry pan until they smell, then grind. | — |
| `rancidity_check` | bulk_pantry | Oils and nuts go rancid quietly, with no mold to warn you. | Smell for old paint or crayons. That one is finished. | — |
| `olive_oil_grades` | bulk_pantry | Extra virgin means cold-pressed, and a harvest date tells you how fresh. | Read “product of”, not “packed in” — they name different countries. | — |
| `nut_butter_ingredients` | bulk_pantry | Nut butter that separates is just nuts; no-stir has added oil. | Check the reduced-fat jar’s list — the fat came out and sugar went in. | — |
| `grains_beyond_rice` | bulk_pantry | Grains with the bran still on, not polished off. | Read the bag for “hulled” or “whole”, and pass on “pearled”. | — |
| `bottled_water_buying` | bulk_pantry | Spring water comes from one named place; purified is treated tap. | Turn the bottle over and find the town and state it came from. | — |
| `label_front_vs_back` | label_terms | The front of a package is advertising; the back is regulated. | Read three things: ingredient list, added sugars, serving size. | — |
| `label_ingredient_order` | label_terms | Ingredients run heaviest first, so the first three are most of it. | Stop reading at “contains 2% or less” — the rest is a trace. | — |
| `label_third_party_seals` | label_terms | A real seal names an outside auditor you can look up. | Trace the seal to an organization, not the brand’s own logo. | — |
| `label_cold_pressed_expeller` | label_terms | Cold-pressed oil is squeezed; refined oil is pulled out with solvent. | Read the oil name first, then look for a process word. | — |
| `label_sugar_free_substitutes` | label_terms | ‘Sugar-free’ means something replaced the sugar rather than nothing. | Read the list for erythritol, maltitol, stevia, sucralose — one is there. | — |
| `label_wild_vs_farm_raised` | label_terms | Seafood labels must name species, method and country, and still get swapped. | Buy the skin-on fillet. A bare one is the easy one to substitute. | — |
| `label_serving_size` | label_terms | The panel’s numbers are scaled to a serving the maker chose. | Check both packages list the same serving size before comparing anything. | — |
| `label_artificial_color` | label_terms | “Artificial color” is a category, not a color. Titanium dioxide qualifies. | Check candy, frosting and white dressings for “color added” near the list’s end. | — |
| `raw_kefir` | eggs_dairy | Kefir is milk fermented with live grains, and worth buying plain. | Buy it from the refrigerated case, never the shelf-stable carton. | — |
| `raw_aged_cheese` | eggs_dairy | Raw-milk cheese aged past sixty days is legal and already stocked. | Read the rind label for an age in months. | — |
| `sprouts_raw` | produce | Sprouts grow in the warm damp that bacteria also like. | Check the roots are still white and the clamshell is not fogged. | — |
| `produce_root_vegetables` | produce | Organic potatoes, conventional carrots. Firm roots, nothing soft or sprouting. | Press each root for firmness, and twist the tops off carrots before storing. | — |
| `produce_brassicas` | produce | Conventional is fine on cabbage and cauliflower. Tight heads, no soft spots. | Check for closed, dark green florets, then press the head for soft spots. | — |
| `produce_onions_garlic` | produce | Conventional is fine. Firm and dry, papery skins, nothing sprouting or moldy. | Squeeze the bulb, smell it, and keep it out of the plastic bag. | — |
| `produce_leafy_greens` | produce | Organic greens, crisp and evenly colored, with no wilt or yellowing. | Check the leaves stand crisp and fully green, then keep them cold at home. | — |
| `produce_peppers` | produce | Organic peppers, firm and evenly colored, with no cracks or soft spots. | Pick a firm, unbruised pepper and pass on any that has shriveled or softened. | — |
| `produce_apples_pears` | produce | Organic apples and pears, unbruised. One spoiled fruit rots its neighbors faster. | Turn each apple or pear over and leave any bruised or damaged one behind. | — |
| `produce_citrus` | produce | Conventional citrus, organic for zest. Firm, smooth, no drying or shriveling. | Choose citrus that feels firm with unblemished rind, and leave the soft ones. | — |
| `produce_stone_fruit` | produce | Organic stone fruit, unbruised, with the skin color fully turned. | Look the fruit over for bruises or damage and skip any that shows one. | — |
| `produce_mushrooms` | produce | Conventional is fine. Dry, firm mushrooms with no dark spots. | Check each cap and leave any that feels damp or soft. | — |
| `produce_green_beans` | produce | Organic beans with smooth, crisp, slender pods and no bulging seeds. | Check the pods and leave any that are flabby, rust-spotted or sticky. | — |
| `produce_bananas` | produce | Buy them green and let them ripen on your counter. | Take a bunch that is still green and keep it out of the fridge. | — |
| `egg_duck_quail` | eggs_dairy | Cook duck and quail eggs until white and yolk are solid. | Check that each shell is clean and uncracked before the carton goes in. | — |

| `sandwich_bread` | bulk_pantry | Whole wheat sandwich bread keeps the grain’s bran and germ. | Read the flour names; “wheat” and “enriched” alone do not establish whole grain. | — |
| `sourdough` | bulk_pantry | Sourdough fermented with a starter of wild yeast and bacteria. | Ask the baker what leavens the dough; check for culture or starter. | — |
| `bagels` | bulk_pantry | Bagels with their ingredients named, boiled before the oven. | Ask the baker about a water bath before the dough reaches the oven. | — |
| `tortillas` | bulk_pantry | Corn tortillas made from lime-treated corn, water, and salt. | Check for masa or masa harina, then read for added wheat and fat. | — |
| `turkey_whole` | meat | Whole turkey without an injected basting solution. | Check the product name for “basted”, “self-basted”, or an added-solution statement. | — |
| `ground_turkey` | meat | Plain ground turkey with its ingredients and fat content stated. | Read the ingredient list and the fat statement beside any percent-lean claim. | — |
| `breakfast_cereal` | bulk_pantry | Whole-grain cereal or granola with less added sugar. | Compare the added-sugars line and check which Whole Grain Stamp is shown. | — |
| `pasta_dry` | bulk_pantry | Dry pasta made from durum semolina and water. | Turn the box over and read the flour and any added ingredients. | — |
| `oat_milk` | eggs_dairy | Oat milk with its protein and fortification checked on the carton. | Compare the protein line and read the ingredients for added vitamins and minerals. | — |
| `coffee_beans` | bulk_pantry | Coffee beans in a sealed bag that limits air. | Check the bag’s seal and keep the coffee closed between uses. | — |
| `bacon` | meat | Bacon with the shortest label list: pork, salt and its named curing agents. | Find the asterisk beside “no nitrates added” and read the curing ingredients. | — |
| `hot_dogs` | meat | Hot dogs with named meat and no mechanically separated poultry. | Read the meat ingredients and check for “with byproducts” beside the product name. | — |
| `canned_tuna` | seafood | Canned light tuna, including skipjack, has less mercury than albacore. | Find “light” or a skipjack species name, then read the packing ingredients. | — |
| `chicken_breast` | meat | Plain breast, no added solution; bone-in and skin-on before boneless skinless. | Read the front for any added liquid percentage, then check the ingredients. | — |
| `ham` | meat | Ham named just “Ham” first, then “Ham With Natural Juices.” | Read the product name for “Water Added” or “Ham and Water Product”. | — |
| `turkey_bacon` | meat | Turkey bacon with the fewest ingredients after the turkey. | Read the small print under the name for the meat cuts used. | — |
| `cured_pork` | meat | Cured pork, guanciale included, with its cut named and a short curing list. | Find the asterisk beside “uncured” and read what it points to. | — |
| `lamb_goat` | meat | 100% grass-fed or grass-finished lamb or goat. | Press goat for firm, fine-grained flesh and white fat. | — |
| `organ_meats` | meat | Organ meats bought for a cook within one to two days. | Check the use-by date against the night it will be cooked. | — |
| `bison` | meat | 100% grass-fed or grass-finished bison, with an inspection mark. | Find the triangle inspection seal or a state mark on the package. | — |
| `venison_game` | meat | Venison from a fully refrigerated processor, trimmed of its fat. | Ask whether each animal was handled separately and kept cold throughout. | — |
| `white_fish` | seafood | White fish chosen by its named species, firm and mild-smelling. | Ask which species it is, then press the flesh for spring-back. | — |
| `crab` | seafood | Live crab that moves, or cooked crab with bright orange-red shells. | Check that live crabs move their legs before one is bagged. | — |
| `lobster` | seafood | A live lobster that moves, or frozen tails that are hard-frozen. | Ask the counter to lift the lobster and check the tail curls under. | — |
| `scallops` | seafood | Dry scallops, with no added solution listed in the ingredients. | Read the ingredients for a phosphate and water, or ask if they are dry. | — |
| `clams_mussels_oysters` | seafood | Live shellfish with a tag, closed shells and none cracked. | Ask to see the shellfish tag, then tap any open shell. | — |
| `smoked_salmon` | seafood | Smoked salmon kept cold, read by its label word. | Read the label for nova, lox or kippered, then keep it refrigerated. | — |
| `seafood_counter` | seafood | Clean, briny smell and springy flesh; ask whether it was previously frozen. | Ask the counter for the species name, then check the fish sits on ice. | — |
| `sprouted_grain_bread` | bulk_pantry | Sprouted grain bread with sprouted whole grains first, no added flour. | Read the first few ingredients, then check the rest for added flour. | — |
| `sprouted_grains` | bulk_pantry | Sprouted grain labeled sprouted whole grain; no regulated definition exists. | Check the label names the grain as whole, not only its process. | — |
| `specialty_flours` | bulk_pantry | Specialty flour labeled whole grain; stoneground alone does not promise it. | Read the flour name for “whole”, then check the fat line. | — |
| `gluten_free_bread` | bulk_pantry | Gluten-free bread carrying the label claim, with its flours and binder read. | Find the claim on the bag, then read the ingredient list and the gum. | — |
| `buns_rolls` | bulk_pantry | Buns and rolls named whole wheat, which rules out white flour. | Read the name on the bag for “whole wheat”, not “wheat” or “enriched”. | — |
| `pastries_muffins` | bulk_pantry | Pastry made with butter, named on the label or by the baker. | Read the fat in the ingredients, or ask the baker if it is butter. | — |
| `muesli` | bulk_pantry | Muesli with no added sugar listed; granola is the baked, sweetened version. | Read the ingredients for sugar, honey or syrup beyond the dried fruit. | — |
| `bread_aisle` | bulk_pantry | Pick the bread type first, then read the first flour for “whole”. | Read the first ingredient for “whole”, then check which stamp is shown. | — |
| `plain_kefir` | eggs_dairy | Plain kefir: milk and cultures alone. | Read the ingredient list for milk and kefir cultures only. | — |
| `sour_cream` | eggs_dairy | Sour cream soured by bacteria, not by an added acid. | Read the name on the tub for “cultured” or “acidified”. | — |
| `cream_cheese` | eggs_dairy | Cream cheese by its standard name, at least 33% milkfat. | Read the ingredients for a culture, then count the stabilizers after it. | — |
| `cottage_cheese` | eggs_dairy | Cottage cheese with its curd set by a culture. | Check beside the name for “directly set”. That wording means acid set the curd. | — |
| `ice_cream` | eggs_dairy | Ice cream that meets the standard, not a lookalike. | Read the small print under the flavor for “frozen dairy dessert”. | — |
| `ghee` | eggs_dairy | Ghee or clarified butter: one dairy fat, simmered down. | Read the ingredient list for butter or cream as the only entry. | — |
| `goat_sheep_dairy` | eggs_dairy | Goat or sheep dairy with the animal’s milk named on the list. | Read the ingredients for which animal’s milk went in. | — |
| `almond_milk` | eggs_dairy | Unsweetened almond milk, read as a drink rather than a milk swap. | Read the Nutrition Facts for added sugars, then the protein. | — |
| `soy_milk` | eggs_dairy | Fortified, unsweetened soy milk, the one plant drink in the dairy group. | Find calcium and vitamin D on the panel, and check for added sugars. | — |
| `coconut_milk_beverage` | eggs_dairy | Carton coconut milk is a drink: coconut milk thinned with water. | Read the carton for “beverage” in the name, then the thickeners. | — |
| `plant_butter` | eggs_dairy | Plant butter, read for which oils it is made from. | Read the ingredient list and find which oil comes first. | — |
| `dairy_case` | eggs_dairy | Pick the dairy type first, then read what the carton promises. | Read the side panel for added vitamins, then any grazing or filtering claim. | — |
| `kombucha` | bulk_pantry | Kombucha bought cold, from the refrigerated case. | Read the Nutrition Facts for added sugars, then any alcohol statement. | — |
| `sauerkraut` | bulk_pantry | Raw sauerkraut from the cold case, never heated. | Read the ingredients for cabbage and salt only, with no vinegar listed. | — |
| `kimchi` | bulk_pantry | Kimchi of cabbage, red pepper, garlic, ginger and salt, recently packed. | Check the packed date, then read the list for fish sauce or shrimp. | — |
| `fermented_pickles` | bulk_pantry | Pickles fermented in salt brine, sold refrigerated. | Read the ingredients for vinegar; none listed means a fermented pickle. | — |
| `raw_cider_vinegar` | bulk_pantry | Raw, unfiltered cider vinegar, with the mother left in. | Read the label for “diluted” or a second vinegar named in a blend. | — |
| `miso` | bulk_pantry | Miso of soybeans, salt and koji, with any grain named. | Read the ingredients for which grain went in with the soybeans. | — |
| `tempeh` | bulk_pantry | Tempeh that is a firm cake, bound white all through. | Read the ingredients for soybeans alone or added grains, and check for mold. | — |
| `natto` | bulk_pantry | Natto in sealed trays from the cold case or freezer. | Check the date on the pack, since chilled natto keeps only days. | — |
| `fermented` | bulk_pantry | Pick the food first, then read whether it was heated or vinegar-made. | Check the label for “raw” or “unpasteurized”, then the list for vinegar. | — |
| `broth` | bulk_pantry | Broth whose list names the bones, meat or vegetables in it. | Read the list for named bones and vegetables, then sodium on the panel. | — |
| `salt` | bulk_pantry | Iodized salt lists added iodine; check the list for anti-caking agents. | Read the ingredient list for an added anti-caking agent. | — |
| `sugars` | bulk_pantry | Sugar alone on the list; brown sugar is sugar plus molasses. | Read the ingredients for cane or beet; both make the same sugar. | — |
| `maple_syrup` | bulk_pantry | Pure maple syrup in any grade, never table or pancake syrup. | Read the front for “pure maple syrup”, not table or pancake syrup. | — |
| `cooking_oils` | bulk_pantry | An oil the label names by its source; “vegetable oil” names none. | Turn the bottle and read which oil it names, then refined or unrefined. | — |
| `lard_tallow` | bulk_pantry | Plain lard or tallow, with nothing added to harden it. | Read the label for “hydrogenated lard” or “lard stearin”. | — |
| `cocoa` | bulk_pantry | Cocoa with one ingredient on the list: cocoa. | Read the label for “processed with alkali” after the name. | — |
| `seeds` | bulk_pantry | Whole chia, hulled hemp, and flax bought ground or ground at home. | Check the bag date, and keep opened flax cold once home. | — |
| `dried_fruit` | bulk_pantry | Dried fruit with the fruit alone on the ingredient list. | Read the ingredients for sulfites or sugar added to the fruit. | — |
| `nutritional_yeast` | bulk_pantry | Fortified or unfortified flakes are both inactive dried yeast. | Read the ingredients for added vitamins, which mark a fortified yeast. | — |
| `canned_coconut_milk` | bulk_pantry | Canned coconut milk, read for what is added beyond coconut. | Read the ingredients for gums such as guar gum. | — |
| `dried_herbs` | bulk_pantry | One herb by name, or a blend whose list may say “spice”. | Check the label for the irradiation logo and “treated with radiation”. | — |
| `tea` | bulk_pantry | True tea is the leaf alone: black, green, white or oolong. | Read the ingredient list for tea leaves and nothing else. | — |
| `vinegar` | bulk_pantry | Vinegar by its printed acidity; 5 percent for pickling. | Read the label for “unpasteurized”; most vinegar is pasteurized otherwise. | — |
| `pasta_sauce` | bulk_pantry | Pasta sauce with tomatoes first and a short list. | Read the ingredients for anything listed ahead of the tomatoes. | — |
| `jam` | bulk_pantry | Jam or preserves by name, made from fruit rather than juice. | Read the label for “reduced sugar”, then keep the opened jar cold. | — |
| `ketchup_mustard` | bulk_pantry | Ketchup led by tomato; mustard made of seed, vinegar and spice. | Check the jar for an open date, or write one on it at home. | — |
| `mayo` | bulk_pantry | Mayonnaise by name: oil, egg yolk and an acid. | Read the ingredients for which oil comes first, whatever the front says. | — |
| `hot_soy_sauce` | bulk_pantry | Soy sauce brewed for months, not made fast with acid. | Read the ingredients for wheat, and the front for “gluten-free”. | — |
| `canned_soup` | bulk_pantry | Canned soup with a short list, in a can without dents. | Read the front for “low sodium” versus “reduced sodium”; they differ. | — |
| `olives` | bulk_pantry | Olives cured in brine, which ferments them slowly. | Check the jar date, and finish an opened jar within 2 weeks. | — |
| `seaweed` | bulk_pantry | Dried sea vegetables labeled with their kind: nori, kombu or kelp. | Read the package for the seaweed’s kind by name, not just “seaweed”. | — |
| `salsa` | bulk_pantry | Salsa led by vegetables; a fresh tub stays cold. | Read the ingredients for the acid: vinegar, lime or lemon juice. | — |
| `coconut_water` | bulk_pantry | Coconut water alone on the list, with nothing added. | Check the carton for a “Contains __ percent juice” line. | — |
| `condiments` | bulk_pantry | Read the first ingredient; then ask about ketchup, mustard or mayo. | Check the serving size, a spoonful, before comparing two jars. | — |
| `crackers` | bulk_pantry | Crackers with a whole grain listed first on the ingredients. | Read the front for “multigrain”; it does not mean whole grain. | — |
| `tortilla_chips` | bulk_pantry | Tortilla chips from corn cooked the traditional way, in limewater. | Read the ingredients for masa; plain cornmeal makes a corn chip instead. | — |
| `potato_chips` | bulk_pantry | Potato chips cut as thin slices, the way chips began. | Read the label for “made from dried potatoes”, the mark of a pressed chip. | — |
| `popcorn` | bulk_pantry | Plain popcorn kernels, popped with only what gets added. | Read the ingredients for anything listed besides popcorn. | — |
| `pretzels` | bulk_pantry | Pretzels with a short list: flour, malt, oil, salt, yeast and soda. | Check for a deep brown, glossy crust; the alkaline bath gives it. | — |
| `snack_bars` | bulk_pantry | Bars with oats or a whole grain first on the list. | Read the ingredients for high fructose corn syrup and hydrogenated oils. | — |
| `trail_mix` | bulk_pantry | Trail mix of nuts and dried fruit, with little else listed. | Read the ingredients for anything added beyond the nuts and fruit. | — |
| `snacks` | bulk_pantry | Read the first ingredient; then ask about chips, crackers or popcorn. | Check veggie chips for potato flour colored with vegetable powder. | — |
| `hummus` | bulk_pantry | Hummus of chickpeas and tahini, the traditional pairing. | Read the ingredients for guar gum, which keeps the dip from weeping. | — |
| `deli_salads` | bulk_pantry | Deli salads bought from the cold case, finished within days. | Check the date; keep it at the back of the fridge, not the door. | — |
| `prepared_meals` | bulk_pantry | Hot food held hot and cold food held cold. | Check the case thermometer, and pans filled no higher than the rim. | — |
| `fresh_pasta` | bulk_pantry | Fresh pasta of flour and egg, with little else listed. | Check the date, and use an opened pack within 2 to 3 days. | — |
| `deli` | bulk_pantry | Ask about deli salads, prepared meals or lunch meat by name. | Check the cold case first; meats, cheeses and salads all need it. | — |
| `frozen_pizza` | bulk_pantry | Frozen pizza with a short crust list: flour, water, salt, yeast. | Check a crust sold as whole wheat for whole wheat flour throughout. | — |
| `frozen_meals` | bulk_pantry | The name on a frozen meal sets its meat minimum. | Check the inspection mark, then follow the package directions to heat it. | — |
| `frozen_fries` | bulk_pantry | Frozen fries of potatoes, oil and salt, with little else listed. | Read the ingredients for anything home cooks would not use. | — |
| `frozen_waffles` | bulk_pantry | Frozen waffles with a whole grain listed first. | Read the list for “wheat flour”, which is not a whole grain flour. | — |
| `frozen_nuggets` | bulk_pantry | Chicken nuggets that say white meat on the label. | Check for “natural proportions”, which means 50 to 65 percent light meat. | — |
| `frozen` | bulk_pantry | Keep frozen at 0°F; then ask about pizza, meals or fries. | Check for grayish-brown or white dried patches; that is freezer burn. | — |

**80 cards · 0 flagged · 33 redrafted in the 2026-07-31 sweep.**


---

## The 2026-07-31 sweep

Three passes over the table: the two open redrafts, a drift re-audit by reading, and a
phrasing-duplication sweep across all 80 lines.

### Drift — does the line serve THIS card's verdict?

Read one at a time against the entry, not by mechanical overlap. The eight the handoff
named, plus four more the same question surfaced.

| slug | verdict | reasoning |
| --- | --- | --- |
| `flour_basics` | **DRIFTED (redrafted)** | Served the verdict but restated it — the headline already says "Unbleached", so "Read for 'unbleached'" spent the line on a word the shopper had. Now serves the verdict's second half, which nothing else said. |
| `oats_steelcut_rolled_instant` | **DRIFTED (redrafted)** | Worse than drift: the headline says "any form" and the line said "steel-cut if you have twenty minutes", arguing against its own verdict. The sharp half — skip the flavored packets — went unserved. |
| `judging_meat_at_the_case` | **DRIFTED (redrafted)** | The headline consumed all three sensory acts, so the line moved to "take it from the back of the case" — a temperature act, not a judging act, and the entry's least central tip. Now gives the press test its actual criterion. |
| `yogurt_plain_vs_flavored` | SERVES (rephrased) | Verifying the list is milk and cultures is exactly how you confirm "plain". Kept; only the construction changed, because it collided with `cheese_real_vs_processed`. |
| `sprouts_raw` | SERVES | "Cold and crisp" made observable as white roots and an unfogged clamshell. Straight from tips 2 and 3. |
| `label_no_added_hormones` | SERVES | Operationalizes the meaningful half of the verdict. Left alone, though it is the seventh "find the seal" line in the corpus — see below. |
| `label_organic_scope` | **DRIFTED (redrafted)** | The line was about seal tiers — the 70% rule, which is `label_nonGMO_vs_organic`'s subject. The verdict's actionable half is "read the panel anyway", which nothing served. |
| `chicken_cuts_basics` | **DRIFTED (redrafted)** | Not in the named eight. Its line was about retained water, which is `air_chilled_chicken`'s whole subject, and near-duplicated that card's line. Its own verdict — bone-in thighs — went unserved. |
| `yogurt_live_cultures` | **RESOLVED 2026-08-02** | Was: "its line is about added sugars, which is `yogurt_plain_vs_flavored`'s verdict, and its own observable sits in its headline — a `RULING4` case; the fix is a headline edit, not a redraft." That was the right diagnosis and it is now done. The headline leads with the TRAP as verdict ("Buy it alive. Heat-treated after culturing is a dead ferment"), the observable moved down to the do line, and the added-sugar content went back to the card that owns it. The two cards were the overlap audit's one genuine SPLIT DIFFERENTLY: same tub, two checks, and one of them was being made twice. |
| `washing_produce` | **DRIFTED (redrafted)** | Not in the named eight. Its `do` line was almost word-for-word `produce_storage`'s headline — one card's action was the neighbor's verdict. Redrafted onto its own (water-and-hands) verdict. |
| `pork_cuts_and_enhanced` | SERVES (rephrased) | On-verdict, but shares the headline-holds-the-observable shape and duplicated `air_chilled_chicken`'s closing clause. Construction changed only. |

The pattern the handoff predicted holds and is sharper than expected: **every drifted line
is a card whose headline already carried the observable.** With nothing left to say, the
line reaches for the nearest adjacent question. Drift and `RULING4` are the same defect
seen from two ends.

### Phrasing duplication

Opening-verb distribution across all 80 lines, before and after this sweep:

| verb | before | after |
| --- | --- | --- |
| Read | **23** | **21** |
| Buy | **11** | **11** |
| Check | **12** | **9** |
| Look | **9** | **8** |
| Take / Ask / Find | 4 / 3 / 2 | 3 / 3 / 3 |
| Count, Fill, Pick, Pass, Press, Flip, Reach, Trace, Scrub, and 13 others | 1 each | 1 each |

Four verbs opened 55 of 80 lines. They still open 49. **This was not fixed, deliberately.**
Twenty-one lines open with "Read" because twenty-one cards are about reading a label, and
that is the physical act. Substituting synonyms to flatten a histogram makes each line
slightly less precise and the corpus no less repetitive. Verbs were changed only where the
new verb was *more* accurate than the old one.

The repetition a reader actually notices is the **construction**, and it is worse than the
verb count:

| shape | before | after |
| --- | --- | --- |
| em-dash then justification | **39 (49%)** | **16 (20%)** |
| two sentences | 2 | 15 |
| a quoted printed word | 22 | 18 |
| colon | 3 | 8 |
| semicolon | 2 | 2 |

The em-dash pass replaced 21 lines. It deliberately did **not** convert all 39: an em-dash
share of zero is as artificial as one of half, and on the 16 that kept it the clause earns
its place. The replacements were spread across five shapes rather than one — appositive,
colon, contrast, two-sentence, and simply dropping the clause where it restated the line it
hung off (`olive_oil_buying`'s "— that price is the tell" said nothing the line had not).

Duplicate closings and constructions found, and what was done:

- `— you salt it yourself` / `— you control the salt yourself` — both resolved by the two
  open redrafts.
- `— that percentage is water` / `— that percentage is brine` (`air_chilled_chicken`,
  `pork_cuts_and_enhanced`) — varied the pork line.
- `— that price is the tell` / `— a date months out is the tell` (`olive_oil_buying`,
  `milk_processing`) — varied the milk line.
- `nothing else belongs` / `and stops there` (`cheese_real_vs_processed`,
  `yogurt_plain_vs_flavored`) — varied the yogurt line.
- **"find the third-party seal" appears on seven cards** — `egg_labels`,
  `grassfed_vs_grassfinished` (folded 2026-08-01), `no_antibiotics_poultry`, `label_free_range`,
  `label_no_added_hormones`, `label_third_party_seals`, `seafood_certifications`. Five name
  a specific seal and earn their place; `label_third_party_seals` was redrafted onto a
  different act. **`label_no_added_hormones` and `seafood_certifications` are left alone —
  see the proximity rule below.**

### The proximity rule — flag within-section repetition, ignore cross-section

**Two `do` lines only collide if a shopper can see them together.** Sections are aisles:
nobody reads `label_no_added_hormones` and `seafood_certifications` in the same trip, or in
the same browse list, so their shared "find the verifier" shape is not repetition a reader
can perceive. Cross-section similarity is a search-result artifact, not a defect.

So: **duplication is scored within a section, never across.** A sweep that flags on global
similarity will keep proposing rewrites that make individual lines worse in exchange for a
variety no shopper experiences. This is the standing rule for every future duplication
sweep, and `counterCardLint.test.js` enforces exactly this scope — the closing-construction
check groups by section before it compares.

The one collision the rule *did* catch was real and within-section: `yogurt_live_cultures`
and `yogurt_plain_vs_flavored` are both `eggs_dairy` and both landed on the ingredient list.
Fixed by giving the cultures to one card and the plain-vs-flavored verdict to the other.

---

## Ruling 4 — APPLIED, 2026-07-31

The trap: the printed word a shopper looks for sat in the headline, so every honest `do`
line had to restate it. The fix is always the same — **the headline keeps the verdict, the
observable moves down into the `do` line.** All three pairs are applied; the headline half
is an edit to `decision` in `server/kristy_perimeter_kb.json`, and the sheet's headline
column is re-synced from it.

| slug | headline (verdict only) | do (the physical act) |
| --- | --- | --- |
| `egg_feed_claims` | Space and feed are two different claims. | Look for “soy-free” or “corn-free” printed on the carton. |
| `label_cold_pressed_expeller` | Two ways to get oil out. Only one is mechanical. | Read for a process word. No process word means solvent-extracted. |
| `yogurt_live_cultures` | Plain, and the cultures should still be alive. | Find “live and active cultures” printed on the tub. |

`yogurt_live_cultures` was the one the drift audit surfaced rather than the original
ruling: its headline held the printed phrase, so its `do` line had drifted onto added
sugars — `yogurt_plain_vs_flavored`'s verdict. Moving the observable down gave each card
its own subject back.

**The zero-flag state is not the end of the check.** Ruling 4 is now enforced by
`counterCardLint.test.js` (the observable may not appear in both headline and `do_line`),
so a future card cannot reintroduce it silently — including a card Pass 3 generates.

---

## 2026-09-16 — three lines narrowed to what their cards support

Critic finding, 2026-09-16: the do line instructed a physical act no field of the entry
supported (claim lock). Three narrowed:

| slug | verdict | reasoning |
| --- | --- | --- |
| `produce_seasonality` | **NARROWED** | "Walk the farmers’-market table before the produce aisle" instructed a shopping trip the entry does not support. Narrowed to what the entry does support: reading the market as a season signal. |
| `egg_shell_color` | **NARROWED** | "Open the carton and check every egg for cracks" is a physical act the entry never claims is diagnostic — the entry's subject is feed, not damage. Narrowed to the feed words the entry supports, with the yolk-photo miscue named directly. |
| `deli_meat_uncured` | **NARROWED** | "a whole roasted turkey breast" named a species the entry never restricts to. Narrowed to "whole roasted meat", which the entry supports. |

`washing_produce` finding **WITHDRAWN**: every clause in its do line traces to the entry —
"scrub" and "spin" to `short_answer` ("scrub brush ... rinse and a spin") and "the firm ones"
to `buying_tips` ("rub firm produce or use a brush"). No change made.
