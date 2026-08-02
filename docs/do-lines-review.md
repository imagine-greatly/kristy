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
| `salmon_wild_vs_farmed` | seafood | Wild. Farmed is a different fish, fed and penned. | Take the frozen sockeye from the freezer case, not the fresh Atlantic. | — |
| `shrimp_imported_vs_domestic` | seafood | Wild American. Most shrimp is imported, farmed, and anonymous. | Read the country-of-origin line on the bag, then look for BAP or ASC. | — |
| `fresh_vs_previously_frozen_fish` | seafood | Buy the frozen. Thaw it overnight in the fridge. | Ask the counter “was this previously frozen?” before paying the fresh premium. | — |
| `beef_grassfed_vs_grainfed` | meat | Grass-fed and grass-finished. Grass-fed alone is still a feedlot finish. | Look for a whole-life seal: American Grassfed, or Certified Grassfed by AGW. | — |
| `beef_cuts_basics` | meat | Chuck. Marbled, cheap, and it falls apart slow-cooked. | Look for fine white flecks through the muscle, not a thick fat rim. | — |
| `ground_beef_lean_ratio` | meat | 80/20 for burgers. 90/10 for anything you drain. | Read the cut name too: “ground chuck” beats plain “ground beef.” | — |
| `egg_labels` | eggs_dairy | Soy-free and corn-free first, then organic, then pasture-raised. | Check the small regional cartons. That is where a feed claim appears. | — |
| `air_chilled_chicken` | meat | Air-chilled. A water-chilled bird absorbs the bath it was cooled in. | Check the package for “retained water up to”. That percentage is water. | — |
| `no_antibiotics_poultry` | meat | A fair choice, not a cleaner bird. Don’t pay the premium. | Look for “USDA Process Verified” beside the claim, or put it back. | — |
| `organic_worth_it_by_type` | produce | Organic on thin-skinned produce. Conventional on anything peeled. | Spend the organic money on berries, greens, and apples. | — |
| `frozen_vs_fresh_produce` | produce | Frozen. Cheaper, no waste, and in season all year. | Read the bag’s ingredient list for one word: the vegetable. | — |
| `produce_seasonality` | produce | Buy what is piled high and cheap this week. | Walk the farmers’-market table before the produce aisle. | — |
| `washing_produce` | produce · home | Cold running water and your hands. Skip the produce wash. | Scrub the firm ones with a brush. Rinse and spin the greens. | — |
| `precut_produce_tradeoffs` | produce | Whole produce. Pre-cut costs more and keeps less. | Check the use-by date — pre-cut spoils days before whole produce does. | — |
| `grassfed_butter` | eggs_dairy | Grass-fed butter, and the difference is visible before you taste it. | Pick the deepest yellow block through the wrapper window. Grass-fed runs near orange. | — |
| `whole_vs_reduced_fat_milk` | eggs_dairy | Whole milk. Everything else has been through another step. | Read the milkfat percentage on the panel, not the cap color. | — |
| `a2_vs_a1_milk` | eggs_dairy | A2 milk, and the difference is the breed, not the brand. | Read the carton for a Jersey or Guernsey herd, or the A2 seal. | — |
| `cheese_real_vs_processed` | eggs_dairy | Buy the block. Slice it or grate it yourself. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Plain, big tub. Add your own fruit. | Take the big plain tub, not the single-serve fruit cups. | — |
| `raw_milk` | eggs_dairy | Worth the trouble of finding. Everything is in the sourcing. | Buy from a farm you can visit that posts its test results. | — |
| `rice_arsenic` | bulk_pantry | Rinse it, cook it in extra water, drain it. Vary the grains. | Buy basmati or California-grown — the bag prints the origin. | — |
| `oats_steelcut_rolled_instant` | bulk_pantry | Plain oats, any form. Skip the flavored instant packets. | Turn the canister over. One ingredient, and it is oats. | — |
| `nuts_raw_vs_roasted` | bulk_pantry | Raw or dry-roasted. Oil-roasted means a seed oil was added. | Read the ingredient line for cottonseed or soybean oil before buying roasted. | — |
| `honey_adulteration` | bulk_pantry | Raw and local. The list should read honey and nothing else. | Buy honey with a producer and a region named on the jar. | — |
| `beans_dried_vs_canned` | bulk_pantry | Dried. Same bean, a fraction of the price, and your own salt. | Fill a bag from the bulk bin. Whole beans, no split skins. | — |
| `label_natural` | label_terms | Ignore it. Read the ingredient list instead. | Look for a defined word instead: organic, grass-finished, or pasture-raised. | — |
| `label_made_with_real` | label_terms | Flip it over. Find where that ingredient falls in the list. | Count how far down the list that ingredient sits — past third is trace. | — |
| `label_no_added_hormones` | label_terms | Meaningful on beef and dairy. A freebie on chicken and pork. | Look for a third-party verifier on the beef and dairy claim. | — |
| `label_nonGMO_vs_organic` | label_terms | One seal, and Organic covers more ground. | Buy the USDA Organic seal alone — paying for both is paying twice. | — |
| `label_cage_free` | label_terms | Neither means pasture. Certified pasture-raised is the one that does. | Read the carton for a welfare certifier: Certified Humane, AWA, G.A.P. | — |
| `label_grass_fed_term` | label_terms | Not enough on its own. Don’t pay up for it. | Look for “100%” or “grass-finished” printed on the package. | — |
| `label_pasture_raised_feed` | label_terms | It means space, not feed. The word to find is soy-free. | Read both sides of the carton — space and feed are separate claims. | — |
| `label_organic_scope` | label_terms | A production standard, not a quality rating. Read the panel anyway. | Flip the organic box over. The seal says nothing about the ingredients. | — |
| `produce_picking_ripeness` | produce | Judge the piece, not the sticker. | Ignore the country line and check the item for give and weight. | — |
| `label_multigrain_vs_whole_grain` | label_terms | Whole grain. ‘Multigrain’ is a headcount, not a standard. | Read the first ingredient — it must say “whole wheat flour.” | — |
| `label_lightly_sweetened` | label_terms | Go straight to the added-sugars line. | Scan the ingredient list for syrup, cane juice, and concentrate. | — |
| `label_no_artificial_flavors` | label_terms | It rules out one kind of lab work, not the lab. | Look for “natural flavors” further down the list — the claim leaves it in. | — |
| `egg_shell_color` | eggs_dairy | Buy the cheaper carton. Neither shell nor yolk color reads anything. | Open the carton and check every egg for cracks before buying. | — |
| `egg_freshness` | eggs_dairy | Read the three-digit pack date, not the sell-by. | Find the three-digit number beside the plant code. Higher is fresher. | — |
| `egg_grades_sizes` | eggs_dairy | Compare price per ounce. Grade and size say nothing about the hen. | Read the weight per dozen on the carton end: 24, 27, 30 ounces. | — |
| `egg_feed_claims` | eggs_dairy | ‘Vegetarian-fed’ is the one to walk away from. | Check whether the carton claims outdoor access and no animal protein at once. | — |
| `egg_storage` | eggs_dairy · home | Washed eggs live cold, in the carton, on a middle shelf. | Move the eggs off the fridge door — it swings warm every open. | — |
| `beef_grades_usda` | meat | Pay for grade on a quick-cooked steak. Skip it on anything braised. | Buy Select for the braise and put the money into Choice steaks. | — |
| `judging_meat_at_the_case` | meat | Press it, look at the tray, smell it. Ignore the color. | Press with a fingertip. It should spring back, not stay dented. | — |
| `butcher_counter_asking` | meat | Ask what came in today and what is coming down in price. | Ask for the bones and trim behind the counter, usually free. | — |
| `chicken_cuts_basics` | meat | Bone-in thighs. Boneless skinless is the priciest form of the same bird. | Take the pack with the skin still on. It bastes itself. | — |
| `pork_cuts_and_enhanced` | meat | Pork shoulder. And read the label for ‘solution added’. | Read the fine print for “contains up to”. Brine is sold by weight. | — |
| `deli_meat_uncured` | meat | ‘Uncured’ is cured with celery powder. Find the asterisk. | Ask the counter to slice a whole roasted turkey breast instead. | — |
| `mercury_by_fish` | seafood | Small and short-lived. Sardines, salmon, skipjack. | Check the species name on the case tag. Size predicts the mercury. | — |
| `fish_freshness_at_counter` | seafood | Smell it first. Clean seawater or nothing means yes. | Check it is bedded in ice, not sitting in its own liquid. | — |
| `canned_fish_choosing` | seafood | Packed in olive oil or water. Bones and skin left in. | Read the pack medium: “vegetable oil” means a seed-oil blend. | — |
| `farmed_fish_by_species` | seafood | Farmed shellfish, trout and char are the good ones. | Buy the farmed mussels, clams and oysters — they are fed nothing. | — |
| `seafood_certifications` | seafood | MSC on wild. A farm seal is a floor, not a recommendation. | Check the badge names a program you can look up. Unnamed is marketing. | — |
| `produce_ripeness_by_item` | produce | Pick up two and take the heavier one. | Smell the stem end on anything that ripens after picking. | — |
| `produce_storage` | produce · home | Wash it when you eat it, not when you unpack it. | Keep apples and bananas out of the drawer with your greens and berries. | — |
| `milk_processing` | eggs_dairy | Plain pasteurized. Ultra is a shelf-life technology, not better milk. | Read the carton for “ultra-pasteurized”. A date months out gives it away. | — |
| `yogurt_live_cultures` | eggs_dairy | Buy it alive. Heat-treated after culturing is a dead ferment. | Find “live and active cultures” on the tub. Shelf-stable never carries it. | — |
| `cream_vs_creamer` | eggs_dairy | Cream or half-and-half. ‘Non-dairy creamer’ is not dairy. | Read the panel for milkfat percent — real cream states 36% or 10.5%. | — |
| `flour_basics` | bulk_pantry | Unbleached all-purpose. Keep whole wheat in the freezer. | Take the smallest whole-wheat bag on the shelf. The germ oil turns. | — |
| `bulk_bins_buying` | bulk_pantry | Bulk for dry staples. Careful with anything oily. | Choose the full, busy bins over a dusty half-empty one. | — |
| `rancidity_check` | bulk_pantry | Smell it. Old paint or crayons means it is spent. | Buy oil in a dark bottle small enough to finish in two months. | — |
| `olive_oil_grades` | bulk_pantry | Extra virgin, a recent harvest date, one country. | Read “product of”, not “packed in” — they name different countries. | — |
| `nut_butter_ingredients` | bulk_pantry | Peanuts and salt. No-stir means an oil was added. | Check the reduced-fat jar’s list — the fat came out and sugar went in. | — |
| `grains_beyond_rice` | bulk_pantry | Rotate them, and cook them like pasta in salted water. | Grab bulgur or quinoa for a weeknight — both cook in fifteen minutes. | — |
| `label_front_vs_back` | label_terms | Turn it over. Decide from the back. | Read three things: ingredient list, added sugars, serving size. | — |
| `label_ingredient_order` | label_terms | Read the first three ingredients, then the added-sugar line. | Stop reading at “contains 2% or less” — the rest is a trace. | — |
| `label_third_party_seals` | label_terms | A published standard and an outside auditor, or it is a sticker. | Trace the seal to an organization, not the brand’s own logo. | — |
| `label_cold_pressed_expeller` | label_terms | Pressed, not extracted. ‘Refined’ is the word that gives it away. | Read for a process word. No process word means solvent-extracted. | — |
| `label_sugar_free_substitutes` | label_terms | Read what replaced the sugar. ‘Unsweetened’ is the plainer word. | Read the list for erythritol, maltitol, stevia, sucralose — one is there. | — |
| `label_wild_vs_farm_raised` | label_terms | Species, method, country. All three required, and none stops substitution. | Buy the skin-on fillet. A bare one is the easy one to substitute. | — |
| `label_serving_size` | label_terms | Read the top two lines before any of the numbers. | Check both packages list the same serving size before comparing anything. | — |
| `raw_kefir` | eggs_dairy | The best thing a farm does with its milk. Buy it cultured. | Buy it from the refrigerated case, never the shelf-stable carton. | — |
| `raw_aged_cheese` | eggs_dairy | Start here. The one raw dairy sitting in plain sight. | Read the rind label for “raw milk” and an age in months. | — |
| `sprouts_raw` | produce | Buy them cold and crisp, or grow them on the counter. | Check the roots are still white and the clamshell is not fogged. | — |

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

