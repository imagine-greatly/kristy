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
| `salmon_wild_vs_farmed` | seafood | Wild salmon, frozen wild Alaskan before fresh farmed. | Take the frozen sockeye from the freezer case, not the fresh Atlantic. | — |
| `shrimp_imported_vs_domestic` | seafood | Wild American or Gulf shrimp; read the country of origin. | Read the country-of-origin line on the bag, then look for BAP or ASC. | — |
| `rotisserie_chicken` | meat | Rotisserie chicken with salt and spices, without phosphate or starch. | Read the ingredient list: two words is plain; water second means a solution. | — |
| `beef_grassfed_vs_grainfed` | meat | 100% grass-fed or grass-finished beef. | Look for a whole-life seal: American Grassfed, or Certified Grassfed by AGW. | — |
| `beef_cuts_basics` | meat | 100% grass-fed or grass-finished steak, not mechanically tenderized. | Read the grade and the sourcing as two separate answers. | — |
| `ground_beef_lean_ratio` | meat | An organ blend, or 100% grass-fed ground beef. | Read the label for liver or heart in the ingredients. | — |
| `egg_labels` | eggs_dairy | Soy-free, corn-free eggs from hens on pasture. | Find all three words on one carton, plus a certifier’s pasture seal. | — |
| `organic_worth_it_by_type` | produce | Organic for produce eaten whole; conventional for what you peel. | Spend the organic money on berries, greens, and apples. | — |
| `frozen_vs_fresh_produce` | produce | Plain frozen produce, picked ripe and frozen within hours. | Read the bag’s ingredient list for one word: the vegetable. | — |
| `freezing_produce` | produce · home | Briefly scalded vegetables for the freezer; fruit goes in raw. | Blanch vegetables sixty seconds, chill them, then freeze flat. | — |
| `produce_seasonality` | produce | In-season produce, or frozen when it is out of season. | Read the farmers’ market as the signal for what is in season locally. | — |
| `washing_produce` | produce · home | Plain cold water for produce; no soap or produce wash. | Scrub the firm ones with a brush. Rinse and spin the greens. | — |
| `baking_soda_soak` | produce · home | Baking soda water for residue that a plain rinse leaves. | Soak the fruit twelve minutes, then rinse it clean. | — |
| `precut_produce_tradeoffs` | produce | Whole produce before pre-cut: cutting starts vitamin loss and browning. | Check the use-by date, since pre-cut spoils days before whole produce does. | — |
| `grassfed_butter` | eggs_dairy | Deep yellow grass-fed butter: cream, and salt if salted. | Look through the wrapper window before choosing a block. | — |
| `whole_vs_reduced_fat_milk` | eggs_dairy | Trusted raw milk from a farm, or low-temp pasteurized 100% grass-fed. | Check the side panel for the pasteurization words and a grass-fed seal. | — |
| `cheese_real_vs_processed` | eggs_dairy | Block cheese with a short list: milk, cultures, salt, enzymes. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Plain Greek yogurt made from 100% grass-fed milk. | Check the ingredients for milk and cultures, with nothing after them. | — |
| `raw_milk` | eggs_dairy | Raw grass-fed milk from a farm you can name. | Buy from a farm you can visit that posts its test results. | — |
| `rice_arsenic` | bulk_pantry | White basmati or sushi rice. | Read the origin on the bag: India, Pakistan or California. | — |
| `oats_steelcut_rolled_instant` | bulk_pantry | Plain oats, steel-cut or rolled. | Turn the canister over. One ingredient, and it is oats. | — |
| `nuts_raw_vs_roasted` | bulk_pantry | Raw or dry-roasted nuts, with no added oil. | Read the ingredient line for cottonseed or soybean oil before buying roasted. | — |
| `honey_adulteration` | bulk_pantry | Raw honey from a named, local or single-source producer. | Buy honey with a producer and a region named on the jar. | — |
| `beans_dried_vs_canned` | bulk_pantry | Dried beans, whole with unbroken skins. | Fill a bag from the bulk bin. Whole beans, no split skins. | — |
| `label_natural` | label_terms | A defined label claim and the ingredient list over ‘natural’. | Look for a defined word instead: organic, grass-finished, or pasture-raised. | — |
| `label_made_with_real` | label_terms | The ‘real’ ingredient listed before added sugar and refined flour. | Count how far down it sits. Past third is a trace. | — |
| `label_no_added_hormones` | label_terms | On beef and dairy, a third-party verified ‘no added hormones’. | Look for a third-party verifier on the beef and dairy claim. | — |
| `label_nonGMO_vs_organic` | label_terms | USDA Organic, which already includes non-GMO. | Buy the USDA Organic seal alone — paying for both is paying twice. | — |
| `label_cage_free` | label_terms | Pasture-raised eggs with a certifier seal over cage-free or free-range. | Read the carton for a welfare certifier: Certified Humane, AWA, G.A.P. | — |
| `label_grass_fed_term` | label_terms | ‘100% grass-fed’ beef, ideally third-party certified. | Look for “100%” or “grass-finished” printed on the package. | — |
| `label_pasture_raised_feed` | label_terms | Eggs printed ‘soy-free’ or ‘corn-free’ on the carton. | Read both sides of the carton — space and feed are separate claims. | — |
| `label_organic_scope` | label_terms | Organic thin-skinned produce eaten whole; still read the ingredient panel. | Flip the organic box over. The seal says nothing about the ingredients. | — |
| `label_multigrain_vs_whole_grain` | label_terms | ‘100% whole grain’, a whole grain listed first. | Read the first ingredient — it must say “whole wheat flour.” | — |
| `label_lightly_sweetened` | label_terms | ‘Unsweetened’, or read the ‘Added Sugars’ line on the panel. | Scan the ingredient list for syrup, cane juice, and concentrate. | — |
| `label_no_artificial_flavors` | label_terms | Short ingredient lists of recognisable foods over flavor claims. | Look for “natural flavors” further down the list — the claim leaves it in. | — |
| `judging_meat_at_the_case` | meat | Sealed, leak-free meat with the newest ‘packaged on’ date. | Check the package is sealed and not leaking juices, then smell it. | — |
| `butcher_counter_asking` | meat | Beef soup bones and a whole chuck, freshly ground. | Ask what came in today and when it was cut. | — |
| `chicken_cuts_basics` | meat | Air-chilled whole chicken first, then bone-in, skin-on thighs. | Take the pack with the skin still on. It bastes itself. | — |
| `pork_cuts_and_enhanced` | meat | Plain pork, with no added-solution percentage on its label. | Read the fine print for “contains up to”. Brine is sold by weight. | — |
| `deli_meat_uncured` | meat | Whole roasted meat sliced thin, then counter-sliced deli meat. | Ask the counter to slice whole roasted meat thin instead. | — |
| `mercury_by_fish` | seafood | Sardines, anchovies, salmon and canned light tuna, small and short-lived. | Check the species name on the case tag. Size predicts the mercury. | — |
| `canned_fish_choosing` | seafood | Fish in olive oil or water, bone-in and skin-on. | Read the pack medium: “vegetable oil” means a seed-oil blend. | — |
| `farmed_fish_by_species` | seafood | Trout, arctic char, barramundi and shellfish needing no feed. | Buy the farmed mussels, clams and oysters. They are fed nothing. | — |
| `seafood_certifications` | seafood | Blue MSC on wild fish; ASC or BAP on farmed. | Check the badge names a program you can look up. Unnamed is marketing. | — |
| `produce_ripeness_by_item` | produce | The heavier of two same-size pieces, for more juice. | Smell the stem end on anything that ripens after picking. | — |
| `berries_picking` | produce | Cold organic berries with a dry, clean carton bottom. | Flip the container and check for juice stains or fuzz. | — |
| `produce_storage` | produce · home | Unwashed produce for storing; wash it when you use it. | Keep apples and bananas out of the drawer with your greens and berries. | — |
| `revive_greens` | produce · home | Limp greens without decay, ready for a cold-water soak. | Trim the stem ends and stand them in ice water thirty minutes. | — |
| `cream_vs_creamer` | eggs_dairy | Half-and-half or heavy cream, with a short ingredient list. | Read the panel for milkfat percent — real cream states 36% or 10.5%. | — |
| `flour_basics` | bulk_pantry | Whole wheat flour; on white flour, unbleached and unbromated. | Read the list for potassium bromate, and take the smallest whole-wheat bag. | — |
| `bulk_bins_buying` | bulk_pantry | Rice, oats, beans, lentils and spices from a busy bin. | Choose the full, busy bins over a dusty half-empty one. | — |
| `whole_spices` | bulk_pantry | Whole spices, bought small and ground as you go. | Toast them in a dry pan until they smell, then grind. | — |
| `rancidity_check` | bulk_pantry | Oil in a dark bottle, finished within two months. | Smell for old paint or crayons. That one is finished. | — |
| `olive_oil_grades` | bulk_pantry | Extra virgin olive oil with a recent harvest date. | Read “product of”, not “packed in” — they name different countries. | — |
| `nut_butter_ingredients` | bulk_pantry | Nut butter with just nuts and salt, oil on top. | Check the reduced-fat jar’s list — the fat came out and sugar went in. | — |
| `grains_beyond_rice` | bulk_pantry | Grains with the bran still on, not polished off. | Read the bag for “hulled” or “whole”, and pass on “pearled”. | — |
| `bottled_water_buying` | bulk_pantry | Spring water from a named spring, in glass. | Turn the bottle over and find the town and state it came from. | — |
| `label_front_vs_back` | label_terms | A short list of recognizable foods, read on the back. | Read three things: ingredient list, added sugars, serving size. | — |
| `label_ingredient_order` | label_terms | Ingredients led by foods, ahead of split sugars or flour. | Stop reading at “contains 2% or less” — the rest is a trace. | — |
| `label_third_party_seals` | label_terms | A seal naming a program with an outside auditor. | Trace the seal to an organization, not the brand’s own logo. | — |
| `label_cold_pressed_expeller` | label_terms | Cold-pressed or expeller-pressed olive, avocado or coconut oil. | Read the oil name first, then look for a process word. | — |
| `label_sugar_free_substitutes` | label_terms | ‘Unsweetened’; on ‘sugar-free’, read which substitute is listed. | Read the list for erythritol, maltitol, stevia, sucralose — one is there. | — |
| `label_wild_vs_farm_raised` | label_terms | Whole or skin-on fish labeled with species, method and country. | Buy the skin-on fillet. A bare one is the easy one to substitute. | — |
| `label_serving_size` | label_terms | Packs compared at matching serving sizes, times servings per container. | Check both packages list the same serving size before comparing anything. | — |
| `label_artificial_color` | label_terms | Colors named on the list, like Red 40. | Check candy, frosting and white dressings for “color added” near the list’s end. | — |
| `raw_kefir` | eggs_dairy | Plain raw kefir from a named farm, sold cold. | Buy it from the refrigerated case, never the shelf-stable carton. | — |
| `raw_aged_cheese` | eggs_dairy | Aged raw milk or lait cru cheese, 60 days minimum. | Read the rind label for an age in months. | — |
| `sprouts_raw` | produce | Cold-case sprouts with white roots and crisp stems. | Check the roots are still white and the clamshell is not fogged. | — |
| `produce_root_vegetables` | produce | Firm organic potatoes, conventional carrots, with nothing soft or sprouting. | Press each root for firmness, and twist the tops off carrots before storing. | — |
| `produce_brassicas` | produce | Conventional cabbage and cauliflower, tight heads, no soft spots. | Check for closed, dark green florets, then press the head for soft spots. | — |
| `produce_onions_garlic` | produce | Conventional onions and garlic, firm with a dry neck. | Squeeze the bulb, smell it, and keep it out of the plastic bag. | — |
| `produce_leafy_greens` | produce | Crisp organic greens, evenly colored, without wilt or yellowing. | Check the leaves stand crisp and fully green, then keep them cold at home. | — |
| `produce_peppers` | produce | Firm organic peppers, evenly colored, without cracks or soft spots. | Pick a firm, unbruised pepper and pass on any that has shriveled or softened. | — |
| `produce_apples_pears` | produce | Unbruised organic apples and pears, with no spoiled fruit alongside. | Turn each apple or pear over and leave any bruised or damaged one behind. | — |
| `produce_citrus` | produce | Firm, smooth citrus: conventional to eat, organic for zest. | Choose citrus that feels firm with unblemished rind, and leave the soft ones. | — |
| `produce_stone_fruit` | produce | Unbruised organic peaches, nectarines, plums and cherries, color fully turned. | Look the fruit over for bruises or damage and skip any that shows one. | — |
| `produce_mushrooms` | produce | Dry, firm conventional mushrooms with no dark spots. | Check each cap and leave any that feels damp or soft. | — |
| `produce_green_beans` | produce | Smooth, crisp, slender organic beans, without bulging seeds. | Check the pods and leave any that are flabby, rust-spotted or sticky. | — |
| `produce_bananas` | produce | Green bananas to finish ripening on your counter. | Take a bunch that is still green and keep it out of the fridge. | — |
| `egg_duck_quail` | eggs_dairy | Clean, uncracked duck or quail eggs from a refrigerated case. | Check that each shell is clean and uncracked before the carton goes in. | — |

| `sandwich_bread` | bulk_pantry | Whole wheat sandwich bread, made with whole wheat flour. | Read the flour names; “wheat” and “enriched” alone do not establish whole grain. | — |
| `sourdough` | bulk_pantry | Sourdough of flour, water, salt and a starter. | Ask the baker what leavens the dough; check for culture or starter. | — |
| `bagels` | bulk_pantry | Bagels boiled before the oven, with their ingredients named. | Ask the baker about a water bath before the dough reaches the oven. | — |
| `tortillas` | bulk_pantry | Corn tortillas of masa, water and salt. | Check for masa or masa harina, then read for added wheat and fat. | — |
| `turkey_whole` | meat | Plain whole turkey, without an injected basting solution. | Check the product name for “basted”, “self-basted”, or an added-solution statement. | — |
| `ground_turkey` | meat | Plain ground turkey with its fat content printed. | Read the ingredient list and the fat statement beside any percent-lean claim. | — |
| `breakfast_cereal` | bulk_pantry | Whole-grain cereal or granola with less added sugar. | Compare the added-sugars line and check which Whole Grain Stamp is shown. | — |
| `pasta_dry` | bulk_pantry | Dry pasta of durum semolina and water. | Turn the box over and read the flour and any added ingredients. | — |
| `oat_milk` | eggs_dairy | Oat milk with few stabilizers, never seed oil. | Read the ingredients for added vitamins and minerals, then the stabilizers. | — |
| `coffee_beans` | bulk_pantry | Beans in a sealed bag that limits air. | Check the bag’s seal and keep the coffee closed between uses. | — |
| `bacon` | meat | Bacon with a short list: pork, salt, named curing agents. | Find the asterisk beside “no nitrates added” and read the curing ingredients. | — |
| `hot_dogs` | meat | Hot dogs with named meat and no mechanically separated poultry. | Read the meat ingredients and check for “with byproducts” beside the product name. | — |
| `canned_tuna` | seafood | Canned light tuna, or a can naming skipjack. | Find “light” or a skipjack species name, then read the packing ingredients. | — |
| `chicken_breast` | meat | Plain bone-in, skin-on breast before boneless skinless; no added solution. | Read the front for any added liquid percentage, then check the ingredients. | — |
| `ham` | meat | Ham named just “Ham” first, then “Ham With Natural Juices.” | Read the product name for “Water Added” or “Ham and Water Product”. | — |
| `turkey_bacon` | meat | Turkey bacon with the fewest ingredients after the turkey. | Read the small print under the name for the meat cuts used. | — |
| `cured_pork` | meat | Cured pork naming its cut, with a short curing list. | Find the asterisk beside “uncured” and read what it points to. | — |
| `lamb_goat` | meat | Lamb or goat labeled 100% grass-fed or grass-finished. | Press goat for firm, fine-grained flesh and white fat. | — |
| `organ_meats` | meat | Organ meats you will cook within one to two days. | Check the use-by date against the night it will be cooked. | — |
| `bison` | meat | Bison labeled 100% grass-fed or grass-finished, with an inspection mark. | Find the triangle inspection seal or a state mark on the package. | — |
| `venison_game` | meat | Fat-trimmed venison from a fully refrigerated processor. | Ask whether each animal was handled separately and kept cold throughout. | — |
| `white_fish` | seafood | White fish sold by its named species, firm and mild-smelling. | Ask which species it is, then press the flesh for spring-back. | — |
| `crab` | seafood | Live crab that moves, or cooked with bright orange-red shells. | Check that live crabs move their legs before one is bagged. | — |
| `lobster` | seafood | A live lobster that moves, or hard-frozen tails. | Ask the counter to lift the lobster and check the tail curls under. | — |
| `scallops` | seafood | Dry or dry-packed scallops, with no phosphate or water listed. | Read the ingredients for a phosphate and water, or ask if they are dry. | — |
| `clams_mussels_oysters` | seafood | Live shellfish with a tag, closed shells and none cracked. | Ask to see the shellfish tag, then tap any open shell. | — |
| `smoked_salmon` | seafood | Nova or lox smoked salmon, bought cold and kept cold. | Read the label for nova, lox or kippered, then keep it refrigerated. | — |
| `seafood_counter` | seafood | Named species on ice, clean briny smell, springy flesh. | Ask the counter for the species name, then check the fish sits on ice. | — |
| `sprouted_grain_bread` | bulk_pantry | Bread with sprouted whole grains first and no added flour. | Read the first few ingredients, then check the rest for added flour. | — |
| `sprouted_grains` | bulk_pantry | Grain labeled sprouted whole grain. | Check the label names the grain as whole, not only its process. | — |
| `specialty_flours` | bulk_pantry | Specialty flour with “whole” in its name or first ingredient. | Read the flour name for “whole”, then check the fat line. | — |
| `gluten_free_bread` | bulk_pantry | Bread labeled gluten-free, with its flours and gum binder named. | Find the claim on the bag, then read the ingredient list and the gum. | — |
| `buns_rolls` | bulk_pantry | Buns and rolls named whole wheat. | Read the name on the bag for “whole wheat”, not “wheat” or “enriched”. | — |
| `pastries_muffins` | bulk_pantry | Pastry made with butter, named on the label. | Read the fat in the ingredients, or ask the baker if it is butter. | — |
| `muesli` | bulk_pantry | Muesli of just oats, fruit, nuts and seeds. | Read the ingredients for sugar, honey or syrup beyond the dried fruit. | — |
| `bread_aisle` | bulk_pantry | Your chosen bread, with “whole” in the first flour. | Read the first ingredient for “whole”, then check which stamp is shown. | — |
| `plain_kefir` | eggs_dairy | Plain kefir from 100% grass-fed whole milk. | Read the ingredient list for milk and kefir cultures only. | — |
| `sour_cream` | eggs_dairy | Sour cream soured by bacteria, with nothing else added. | Read the name on the tub for “cultured” or “acidified”. | — |
| `cream_cheese` | eggs_dairy | Cream cheese by its standard name, at least 33% milkfat. | Read the ingredients for a culture, then count the stabilizers after it. | — |
| `cottage_cheese` | eggs_dairy | Cottage cheese with its curd set by a culture. | Check beside the name for “directly set”. That wording means acid set the curd. | — |
| `ice_cream` | eggs_dairy | A carton named “ice cream”, with no added oils listed. | Read the small print under the flavor for “frozen dairy dessert”. | — |
| `ghee` | eggs_dairy | Ghee or clarified butter with butter as the only ingredient. | Read the ingredient list for butter or cream as the only entry. | — |
| `goat_sheep_dairy` | eggs_dairy | Goat or sheep dairy with goat or sheep milk listed. | Read the ingredients for which animal’s milk went in. | — |
| `almond_milk` | eggs_dairy | Unsweetened almond milk, a short list, never seed oil. | Read the Nutrition Facts for added sugars, then calcium and vitamin D. | — |
| `soy_milk` | eggs_dairy | Fortified, unsweetened soy milk. | Find calcium and vitamin D on the panel, and check for added sugars. | — |
| `coconut_milk_beverage` | eggs_dairy | Unsweetened carton coconut milk with the fewest added gums. | Read the carton for “beverage” in the name, then the thickeners. | — |
| `plant_butter` | eggs_dairy | Coconut or olive oil plant butter, never seed oil. | Read the ingredient list and find which oil comes first. | — |
| `dairy_case` | eggs_dairy | Choose the dairy type first, then read the carton. | Read the side panel for added vitamins, then any grazing or filtering claim. | — |
| `kombucha` | bulk_pantry | Kombucha from the refrigerated case, kept cold. | Read the Nutrition Facts for added sugars, then any alcohol statement. | — |
| `sauerkraut` | bulk_pantry | Raw sauerkraut from the refrigerated case. | Read the ingredients for cabbage and salt only, with no vinegar listed. | — |
| `kimchi` | bulk_pantry | Kimchi of cabbage, red pepper, garlic, ginger and salt. | Check the packed date, then read the list for fish sauce or shrimp. | — |
| `fermented_pickles` | bulk_pantry | Pickles fermented in salt brine, sold refrigerated. | Read the ingredients for vinegar; none listed means a fermented pickle. | — |
| `raw_cider_vinegar` | bulk_pantry | Raw, unfiltered cider vinegar, with the mother. | Read the label for “diluted” or a second vinegar named in a blend. | — |
| `miso` | bulk_pantry | Miso of soybeans, salt and koji, with any grain named. | Read the ingredients for which grain went in with the soybeans. | — |
| `tempeh` | bulk_pantry | Tempeh in a firm cake, bound white all through. | Read the ingredients for soybeans alone or added grains, and check for mold. | — |
| `natto` | bulk_pantry | Natto in sealed trays from the cold case or freezer. | Check the date on the pack, since chilled natto keeps only days. | — |
| `fermented` | bulk_pantry | Pick the food first, then read whether it was heated. | Check the label for “raw” or “unpasteurized”, then the list for vinegar. | — |
| `broth` | bulk_pantry | Broth whose list names the bones, meat or vegetables. | Read the list for named bones and vegetables, then sodium on the panel. | — |
| `salt` | bulk_pantry | Iodized salt, with any anti-caking agent named on the list. | Read the ingredient list for an added anti-caking agent. | — |
| `sugars` | bulk_pantry | Sugar alone on the list; brown sugar adds molasses. | Read the ingredients for cane or beet; both make the same sugar. | — |
| `maple_syrup` | bulk_pantry | Maple syrup by name, any Grade A color. | Read the front for “pure maple syrup”, not table or pancake syrup. | — |
| `cooking_oils` | bulk_pantry | An oil the label names by its source. | Turn the bottle and read which oil it names, then refined or unrefined. | — |
| `lard_tallow` | bulk_pantry | Leaf lard or tallow, with nothing added to harden it. | Read the label for “hydrogenated lard” or “lard stearin”. | — |
| `cocoa` | bulk_pantry | Cocoa with one ingredient on the list: cocoa. | Read the label for “processed with alkali” after the name. | — |
| `seeds` | bulk_pantry | Whole chia, hulled hemp, and ground flaxseed or whole flax. | Check the bag date, and keep opened flax cold once home. | — |
| `dried_fruit` | bulk_pantry | Dried fruit with only the fruit on the ingredient list. | Read the ingredients for sulfites or sugar added to the fruit. | — |
| `nutritional_yeast` | bulk_pantry | Fortified or unfortified nutritional yeast flakes, granules or powder. | Read the ingredients for added vitamins, which mark a fortified yeast. | — |
| `canned_coconut_milk` | bulk_pantry | Canned coconut milk, read for anything added beyond coconut. | Read the ingredients for gums such as guar gum. | — |
| `dried_herbs` | bulk_pantry | A single herb, named on the jar. | Check the label for the irradiation logo and “treated with radiation”. | — |
| `tea` | bulk_pantry | The tea leaf alone: black, green, white or oolong. | Read the ingredient list for tea leaves and nothing else. | — |
| `vinegar` | bulk_pantry | Vinegar by its printed acidity; 5 percent for pickling. | Read the label for “unpasteurized”; most vinegar is pasteurized otherwise. | — |
| `pasta_sauce` | bulk_pantry | Pasta sauce with tomatoes first and a short list. | Read the ingredients for anything listed ahead of the tomatoes. | — |
| `jam` | bulk_pantry | Jam or preserves by name, made from fruit, not juice. | Read the label for “reduced sugar”, then keep the opened jar cold. | — |
| `ketchup_mustard` | bulk_pantry | Ketchup led by tomato; mustard of seed, vinegar and spice. | Check the jar for an open date, or write one on it at home. | — |
| `mayo` | bulk_pantry | Mayonnaise by name: oil, egg yolk and an acid. | Read the ingredients for which oil comes first, whatever the front says. | — |
| `hot_soy_sauce` | bulk_pantry | Traditionally brewed soy sauce, not made fast with acid. | Read the ingredients for wheat, and the front for “gluten-free”. | — |
| `canned_soup` | bulk_pantry | Low-sodium canned soup with a short list, can undented. | Read the front for “low sodium” versus “reduced sodium”; they differ. | — |
| `olives` | bulk_pantry | Brine-cured olives, fermented slowly in water and salt. | Check the jar date, and finish an opened jar within 2 weeks. | — |
| `seaweed` | bulk_pantry | Sea vegetables labeled by kind: nori, kombu or kelp. | Read the package for the seaweed’s kind by name, not just “seaweed”. | — |
| `salsa` | bulk_pantry | Salsa with onions, peppers and tomatoes plus an acid. | Read the ingredients for the acid: vinegar, lime or lemon juice. | — |
| `coconut_water` | bulk_pantry | Coconut water alone on the list, with nothing added. | Check the carton for a “Contains __ percent juice” line. | — |
| `condiments` | bulk_pantry | Condiments read by their first ingredient, spoon to spoon. | Check the serving size, a spoonful, before comparing two jars. | — |
| `crackers` | bulk_pantry | Crackers with a whole grain listed first on the ingredients. | Read the front for “multigrain”; it does not mean whole grain. | — |
| `tortilla_chips` | bulk_pantry | Corn masa tortilla chips, the corn cooked in limewater. | Read the ingredients for masa; plain cornmeal makes a corn chip instead. | — |
| `potato_chips` | bulk_pantry | Thin-sliced potato chips, the way chips began. | Read the label for “made from dried potatoes”, the mark of a pressed chip. | — |
| `popcorn` | bulk_pantry | Plain popcorn kernels, popped at home. | Read the ingredients for anything listed besides popcorn. | — |
| `pretzels` | bulk_pantry | Pretzels listing flour, malt, oil, salt, yeast and soda. | Check for a deep brown, glossy crust; the alkaline bath gives it. | — |
| `snack_bars` | bulk_pantry | Bars with oats or another whole grain listed first. | Read the ingredients for high fructose corn syrup and hydrogenated oils. | — |
| `trail_mix` | bulk_pantry | Trail mix of nuts and dried fruit, little else listed. | Read the ingredients for anything added beyond the nuts and fruit. | — |
| `snacks` | bulk_pantry | Snacks with a whole grain, vegetable or bean listed first. | Check veggie chips for potato flour colored with vegetable powder. | — |
| `hummus` | bulk_pantry | Hummus of chickpeas and tahini, the traditional pairing. | Read the ingredients for guar gum, which keeps the dip from weeping. | — |
| `deli_salads` | bulk_pantry | Deli salads from the cold case, eaten within days. | Check the date; keep it at the back of the fridge, not the door. | — |
| `prepared_meals` | bulk_pantry | Hot food held hot and cold food held cold. | Check the case thermometer, and pans filled no higher than the rim. | — |
| `fresh_pasta` | bulk_pantry | Fresh pasta of flour and egg, with little else listed. | Check the date, and use an opened pack within 2 to 3 days. | — |
| `deli` | bulk_pantry | Deli food from a cold case, or a hot one. | Check the cold case first; meats, cheeses and salads all need it. | — |
| `frozen_pizza` | bulk_pantry | Frozen pizza whose crust lists flour, water, salt, yeast. | Check a crust sold as whole wheat for whole wheat flour throughout. | — |
| `frozen_meals` | bulk_pantry | Frozen meals named for their meat, inspection mark shown. | Check the inspection mark, then follow the package directions to heat it. | — |
| `frozen_fries` | bulk_pantry | Frozen fries of potatoes, oil and salt, little else. | Read the ingredients for anything home cooks would not use. | — |
| `frozen_waffles` | bulk_pantry | Frozen waffles with a whole grain listed first. | Read the list for “wheat flour”, which is not a whole grain flour. | — |
| `frozen_nuggets` | bulk_pantry | Chicken nuggets that say white meat on the label. | Check for “natural proportions”, which means 50 to 65 percent light meat. | — |
| `frozen` | bulk_pantry | Frozen food that is frozen solid, picked up last. | Check for grayish-brown or white dried patches; that is freezer burn. | — |

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
