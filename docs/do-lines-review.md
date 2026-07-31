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
label, a colour, a number, a physical location, a specific product — and it must not
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
| `HEADLINE Nw` | the KB `decision` this card uses as its headline is over the 12-word limit and needs trimming in the KB, not here |


| slug | section | current headline | proposed do | flag |
| --- | --- | --- | --- | --- |
| `salmon_wild_vs_farmed` | seafood | Wild if it is in reach. Farmed or nothing, buy the farmed. | Take the frozen sockeye from the freezer case, not the fresh Atlantic. | — |
| `canned_fish_mercury` | seafood | Go small. The short-lived fish are the ones to stock. | Read the can for “light” or “skipjack”; “white” means albacore. | — |
| `shrimp_imported_vs_domestic` | seafood | Wild American shrimp when it is there. Otherwise a certified farm. | Read the country-of-origin line on the bag, then look for BAP or ASC. | — |
| `fresh_vs_previously_frozen_fish` | seafood | Buy the frozen. Thaw it overnight in the fridge. | Ask the counter “was this previously frozen?” before paying the fresh premium. | — |
| `beef_grassfed_vs_grainfed` | meat | Grass-fed when the price is reasonable. Regular beef when it is not. | Buy grass-fed as ground beef or chuck, not as ribeye. | — |
| `grassfed_vs_grassfinished` | meat | Paying grass-fed prices? Buy grass-FINISHED. | Look for the American Grassfed seal — it is the whole-life claim. | — |
| `beef_cuts_basics` | meat | Chuck. Marbled, cheap, and it falls apart slow-cooked. | Look for fine white flecks through the muscle, not a thick fat rim. | — |
| `ground_beef_lean_ratio` | meat | 80/20 for burgers. 90/10 for anything you drain. | Read the cut name too — “ground chuck” beats plain “ground beef.” | — |
| `egg_labels` | eggs_dairy | Pasture-raised if the budget stretches. Plain eggs if it does not. | Find a certifier’s seal beside “pasture-raised” — the words alone are unaudited. | — |
| `egg_yolk_color` | eggs_dairy | Ignore the yolk color. Buy on how the hen was raised. | Read the raising claim on the carton side, not the yolk photo on front. | — |
| `air_chilled_chicken` | meat | Air-chilled if the price is close. Regular chicken if it is not. | Check the package for “retained water up to” — that percentage is water. | — |
| `no_antibiotics_poultry` | meat | A fair choice, not a cleaner bird. Don’t pay the premium. | Look for “USDA Process Verified” beside the claim, or put it back. | — |
| `organic_worth_it_by_type` | produce | Organic on thin-skinned produce you eat whole. Conventional on anything peeled. | Spend the organic money on berries, greens, and apples. | — |
| `frozen_vs_fresh_produce` | produce | Frozen. Cheaper, no waste, and in season all year. | Read the bag’s ingredient list — it should name only the vegetable. | — |
| `produce_seasonality` | produce | Buy what is piled high and cheap this week. | Walk the farmers’-market table first — it reads the local season fastest. | — |
| `washing_produce` | produce · home | Cold running water and your hands. Skip the produce wash. | Wash it the hour you eat it, not when you unpack the bags. | — |
| `precut_produce_tradeoffs` | produce | Buy it if convenience is what gets vegetables eaten. | Check the use-by date — pre-cut spoils days before whole produce does. | — |
| `grassfed_butter` | eggs_dairy | Real butter over any spread. Grass-fed if the budget allows. | Take unsalted if you cook with it — you control the salt yourself. | — |
| `whole_vs_reduced_fat_milk` | eggs_dairy | Whole milk. Buy the one the household actually drinks. | Skip the chocolate and strawberry jugs — that is where the added sugar sits. | — |
| `cheese_real_vs_processed` | eggs_dairy | Buy a block of real cheese and slice it yourself. | Read the list for milk, salt, cultures, rennet — nothing else belongs. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Plain, big tub. Add your own fruit. | Check the list reads milk and cultures, and stops there. | — |
| `raw_milk` | eggs_dairy | Worth the trouble of finding. Everything is in the sourcing. | Buy from a farm you can visit that posts its test results. | — |
| `rice_arsenic` | bulk_pantry | Rinse it, cook it in extra water, drain it. Vary the grains. | Buy basmati or California-grown — the bag prints the origin. | — |
| `oats_steelcut_rolled_instant` | bulk_pantry | Plain oats, any form. Skip the flavored instant packets. | Fill a bag from the bulk bin. Steel-cut if you have twenty minutes. | — |
| `nuts_raw_vs_roasted` | bulk_pantry | Raw or dry-roasted. Check what they were roasted in. | Read the ingredient line for cottonseed or soybean oil before buying roasted. | — |
| `olive_oil_buying` | bulk_pantry | Recent harvest date, dark bottle, one country of origin. | Put back anything unusually cheap for extra-virgin — that price is the tell. | — |
| `honey_adulteration` | bulk_pantry | Raw and local. The list should read honey and nothing else. | Buy honey with a producer and a region named on the jar. | — |
| `beans_dried_vs_canned` | bulk_pantry | Dried when there is time. Canned and rinsed when there is not. | Take the can that says “no salt added” — you salt it yourself. | — |
| `label_natural` | label_terms | Ignore it. Read the ingredient list instead. | Look for a defined word instead: organic, grass-finished, or pasture-raised. | — |
| `label_made_with_real` | label_terms | Flip it over. Find where that ingredient falls in the list. | Count how far down the list that ingredient sits — past third is trace. | — |
| `label_no_added_hormones` | label_terms | Meaningful on beef and dairy. A freebie on chicken and pork. | Look for a third-party verifier on the beef and dairy claim. | — |
| `label_free_range` | label_terms | A low bar. For real outdoor time, look for certified pasture-raised. | Read the carton for a welfare certifier: Certified Humane, AWA, G.A.P. | — |
| `label_nonGMO_vs_organic` | label_terms | One seal, and Organic covers more ground. | Buy the USDA Organic seal alone — paying for both is paying twice. | — |
| `label_cage_free` | label_terms | Better than caged. Still a barn, not a meadow. | Check the carton for outdoor wording — “cage-free” promises none. | — |
| `label_grass_fed_term` | label_terms | Not enough on its own. Don’t pay up for it. | Look for “100%” or “grass-finished” printed on the package. | — |
| `label_pasture_raised_feed` | label_terms | It means space, not feed. The word to find is soy-free. | Read both sides of the carton — space and feed are separate claims. | — |
| `label_organic_scope` | label_terms | A production standard, not a quality rating. Read the panel anyway. | Check the seal says “USDA Organic”, not “made with organic”. | — |
| `produce_picking_ripeness` | produce | Judge the piece, not the sticker. | Pop the avocado’s stem nub — green underneath means today, brown means past. | — |
| `label_multigrain_vs_whole_grain` | label_terms | Whole grain. ‘Multigrain’ is a headcount, not a standard. | Read the first ingredient — it must say “whole wheat flour.” | — |
| `label_lightly_sweetened` | label_terms | Go straight to the added-sugars line. | Scan the ingredient list for syrup, cane juice, and concentrate. | — |
| `label_no_artificial_flavors` | label_terms | It rules out one kind of lab work, not the lab. | Look for “natural flavors” further down the list — the claim leaves it in. | — |
| `egg_shell_color` | eggs_dairy | Buy the cheaper carton. Shell color is the breed. | Open the carton and check every egg for cracks before buying. | — |
| `egg_freshness` | eggs_dairy | Read the three-digit pack date, not the sell-by. | Find the three-digit number beside the plant code — higher is fresher. | — |
| `egg_grades_sizes` | eggs_dairy | Compare price per ounce. Grade and size say nothing about the hen. | Read the weight per dozen on the carton end: 24, 27, 30 ounces. | — |
| `egg_feed_claims` | eggs_dairy | Feed claims have to be printed. Look for soy-free. | Look for “soy-free” printed explicitly — no other carton word implies it. | RESTATES |
| `egg_storage` | eggs_dairy · home | Washed eggs live cold, in the carton, on a middle shelf. | Move the eggs off the fridge door — it swings warm every open. | — |
| `beef_grades_usda` | meat | Pay for grade on a quick-cooked steak. Skip it on anything braised. | Buy Select for the braise and put the money into Choice steaks. | — |
| `judging_meat_at_the_case` | meat | Press it, look at the tray, smell it. Ignore the color. | Take it from the back of the case, where it is coldest. | — |
| `butcher_counter_asking` | meat | Ask what came in today and what is coming down in price. | Ask for the bones and trim behind the counter — usually cheap or free. | — |
| `chicken_cuts_basics` | meat | Bone-in thighs. A whole bird when there is time for stock. | Check the label for “retained water” before comparing the price per pound. | — |
| `pork_cuts_and_enhanced` | meat | Pork shoulder. And read the label for ‘solution added’. | Read the fine print for “contains up to” — that percentage is brine. | — |
| `deli_meat_uncured` | meat | ‘Uncured’ is cured with celery powder. Find the asterisk. | Ask the counter to slice a whole roasted turkey breast instead. | — |
| `mercury_by_fish` | seafood | Small and short-lived. Sardines, salmon, skipjack. | Check the species name on the case tag — size predicts the mercury. | — |
| `fish_freshness_at_counter` | seafood | Smell it first. Clean seawater or nothing means yes. | Check it is bedded in ice, not sitting in its own liquid. | — |
| `canned_fish_choosing` | seafood | Packed in olive oil or water. Bones and skin left in. | Read the pack medium — “vegetable oil” means a seed-oil blend. | — |
| `farmed_fish_by_species` | seafood | Farmed shellfish, trout and char are the good ones. | Buy the farmed mussels, clams and oysters — they are fed nothing. | — |
| `seafood_certifications` | seafood | MSC is wild. ASC and BAP are farms. | Check the badge names a program you can look up. Unnamed is marketing. | — |
| `produce_ripeness_by_item` | produce | Pick up two and take the heavier one. | Turn the berry container over and check for juice stains underneath. | — |
| `produce_storage` | produce · home | Wash it when you eat it, not when you unpack it. | Keep apples and bananas out of the drawer with your greens and berries. | — |
| `milk_processing` | eggs_dairy | Plain pasteurized over ultra. Cream-top if the store has it. | Read the carton for “ultra-pasteurized” — a date months out is the tell. | — |
| `pre_shredded_cheese` | eggs_dairy | Buy the block and grate it. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_live_cultures` | eggs_dairy | Plain, with ‘Live and Active Cultures’ on the tub. | Read the added-sugars line on any flavored tub before it goes in. | — |
| `cream_vs_creamer` | eggs_dairy | Cream or half-and-half. ‘Non-dairy creamer’ is not dairy. | Read the panel for milkfat percent — real cream states 36% or 10.5%. | — |
| `flour_basics` | bulk_pantry | Unbleached all-purpose. Keep whole wheat in the freezer. | Read for “unbleached” — “bleached” was chemically whitened. | — |
| `bulk_bins_buying` | bulk_pantry | Bulk for grains, beans and spices. Careful with nuts and whole-grain flour. | Choose the full, busy bins — a dusty half-empty one has not turned over. | — |
| `rancidity_check` | bulk_pantry | Smell it. Old paint or crayons means it is spent. | Buy oil in a dark bottle small enough to finish in two months. | — |
| `olive_oil_grades` | bulk_pantry | Extra virgin, a harvest date, one country. | Read “product of”, not “packed in” — they name different countries. | — |
| `nut_butter_ingredients` | bulk_pantry | Peanuts, and salt if you want it. Nothing else. | Check the reduced-fat jar’s list — the fat came out and sugar went in. | — |
| `grains_beyond_rice` | bulk_pantry | Rotate them, and cook them like pasta in salted water. | Grab bulgur or quinoa for a weeknight — both cook in fifteen minutes. | — |
| `label_front_vs_back` | label_terms | Turn it over. Decide from the back. | Read three things: ingredient list, added sugars, serving size. | — |
| `label_ingredient_order` | label_terms | Read the first three ingredients, then the added-sugar line. | Stop reading at “contains 2% or less” — the rest is a trace. | — |
| `label_third_party_seals` | label_terms | Ask who wrote the standard, and who audits it. | Read the seal for a program name you could look up later. | — |
| `label_cold_pressed_expeller` | label_terms | Pressed, or solvent-extracted. ‘Refined’ is the word that answers it. | Look for “expeller-pressed” or “cold-pressed”; no process word means solvent-extracted. | RESTATES |
| `label_sugar_free_substitutes` | label_terms | Read what replaced the sugar. ‘Unsweetened’ is the plainer word. | Read the list for erythritol, maltitol, stevia, sucralose — one is there. | — |
| `label_wild_vs_farm_raised` | label_terms | Read all three: species, wild or farmed, and country. | Buy the skin-on fillet — a bare fillet is the easy one to substitute. | — |
| `label_serving_size` | label_terms | Read the top two lines before any of the numbers. | Check both packages list the same serving size before comparing anything. | — |
| `raw_kefir` | eggs_dairy | The best thing a farm does with its milk. Buy it cultured. | Buy it from the refrigerated case — shelf-stable kefir is dead. | — |
| `clabber` | eggs_dairy | The oldest ferment there is. Good milk does it by itself. | Buy an extra bottle of the raw milk and let one sit out. | — |
| `raw_aged_cheese` | eggs_dairy | Start here. The one raw dairy sitting in plain sight. | Read the rind label for “raw milk” and an age in months. | — |
| `sprouts_raw` | produce | Buy them cold and crisp, or grow them on the counter. | Check the roots are still white and the clamshell is not fogged. | — |

**80 cards · 2 flagged.**


---

## Two headlines still hold the observable

Same trap ruling 4 named: the printed word a shopper looks for sits in the headline, so
every honest `do` line restates it. Flagged rather than shipped. Proposed pairs — the
headline is the KB's `decision` field, so applying one means an edit to
`kristy_perimeter_kb.json`:

| slug | proposed headline (verdict only) | proposed do (the physical act) |
| --- | --- | --- |
| `egg_feed_claims` | Space and feed are two different claims. | Look for “soy-free” or “corn-free” printed on the carton. |
| `label_cold_pressed_expeller` | Two ways to get oil out. Only one is mechanical. | Read for a process word. No process word means solvent-extracted. |

