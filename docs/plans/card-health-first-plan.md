# Plan: counter cards, health-first (2026-10-12), D1-D9 approved at Rec (Devon 2026-10-12), not built

**Problem.** Devon: the cards coach *cooking* ("80/20 for burgers", "center-cut piece", "decide the cook first"). Kristy exists to help a shopper find the least-processed, closest-to-nature version of each food. The audit (Codex, read-only, 2026-10-12) flagged 72 of 233 entries (71/202 cards, 1/31 picks). Nine cards and two picks give no health or sourcing direction at all.
**Second problem (Devon, 2026-10-12).** The first draft fixed the aim by repeating it: ten meat rows each re-said "grass-finished / pasture-raised when it is there". Oils, dairy and bakery had the same drift. Each health fact must be said once, on one card.
**Underlying need.** Every card answers "which version of this food is closest to nature", in words only it can say. A shared fact lives on its owner card; every sibling points there.

## Scout first (admin-run; ANCHORs come only from VERIFIED lines)
- S1 `dv scout "Where are RETIRED and RETIRED_GENERATED declared, which test checks them, and which commit is the best example of a past fold?" --terms RETIRED,RETIRED_GENERATED`
- S2 `dv scout "Every reference outside kristy_perimeter_kb.json to these ids: dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder, duck_meat, goat_sheep_dairy, coconut_milk_beverage, plus the REWRITE ids below (list.js perimeterId, CATEGORY_SECTION, shortcuts, ESSENTIALS, doLines.json, docs/do-lines-review.md, prompts, tests)" --terms perimeterId,ESSENTIALS,shortcuts,CATEGORY_SECTION`
- S3 `dv scout "Where in counterCardLint.js is the TIER_NOTE shared-sentence rule (and TIER_NOTE_SELF_REFERENCE)? Which rule plus allowlist should two new rules mirror? Test file path? Does server test/acceptance exist?" --terms lintCard,TIER_NOTE_SELF_REFERENCE`
- S4 `dv ask --role scout "List the source archives (docs/research/*-sources.md, .firecrawl/, docs/sources/) covering beef, poultry, pork, eggs, pantry and ferments. Does the engine KB carry potassium bromate, aluminum, phosphate, carrageenan or seed_oil entries?" --cd /Users/m1/kristy`
- S5 `dv scout "kristy-ios: path of CardFan. Is the front-card text hardcoded or fetched? What does iOS render when a list row's perimeterId has no counter_cards row?" --terms CardFan,perimeterId`
- S6 `dv ask --role scout "Which App Store shots show any card in the family tables? Does the corpus branch (~/kristy-corpus) touch kristy_perimeter_kb.json?" --cd /Users/m1/kristy`
- S7 `dv ask --role scout "For each owner id in the family tables, print title, decision, pick_steps and every sentence matching grass|pasture|finish|chill|retained water|solution|enhanced|cold-pressed|expeller|unpasteurized|conditioner|unsweetened. Which card owns 'plain' for yogurt, and which of almond_milk/oat_milk carries a sourced 'unsweetened' line? In kristy-ios, which card fields render (pick_steps, buying_tips), and can a card open another card by id? Is counter_cards stored as columns or jsonb?" --cd /Users/m1/kristy`
- Measured this session: `kristy_perimeter_kb.json` has no cross-card link field (no related/see/links key on any card); `shortcuts` are q/browsable-id only. No pointer mechanism exists today (D8).
- Reuse: every owner below already exists. **The structure needs no new card.**

## Intent
A shopper opens Ground beef and reads what only ground beef can say: the name "ground beef" allows no added fat, water or binders; the ratio is lean to fat by weight. One line reads "How it was raised: see Grass-fed beef." Grass-finished is explained on that one card and nowhere else in the beef family. **The moment that must land: every beef card reads like a sourcing guide, and no two say the same thing.**

## Non-goals
- No new cards. No scoring or engine change (#5). No price figures (#8).
- No copy that says "healthier", "healthiest" or "better for you". Health stays the product aim and is never the claim (#2, #3).
- The scan card and the frozen `client/src` are untouched. Unflagged cards change only for alias moves or a REPEATED_CLAIM hit that Piece 1 lists by name.
- **Displaces:** pricing build I1 / launch queue for about a day and a half. 7 Codex builds + 7 critic@opus + 1 researcher + 1 iOS forge. Piece 1 gains one rule; Piece 5 gains 0-3 folds (D9).

## Decisions
**Approved 2026-10-12 (Devon: "recs", plus "health first, no repeats"):** D1b ground beef rewritten in place. D2b cuts, grades and meat case re-aimed in place. D3b a value line stays only when it is the cheapest route to the health pick. D4b bagels, pretzels, cocoa to ingredient-list truth; pretzel_bread folds; baking_soda_powder retires. D5c salt as label truth. D7b CardFan front card = renamed "Ground beef". **D6 moot:** origin/main = origin/held = 494d243, no held stack. Card text reaches iOS on migrate; pick edits (tofu, soup bones, kohlrabi) go live on the next main push.

**Open for Devon (option a is today's state):**
- **D8 pointer to the owner (APPROVED b).** a) None: siblings restate the fact (the flaw). **b) Pointer sentence (Rec):** one pick_step, fixed form `<Read>: see <Owner title>.`, e.g. "How it was raised: see Grass-fed beef." No schema, route or iOS change. Lint checks the title is a real owner. Not tappable; the shopper asks the counter or browses. c) Additive `see_also: ["<owner id>"]` field, tappable on iOS: needs a counter_cards column and SQL, schemaContract, route pass-through and an iOS ui piece (about +2 pieces). Worth it only if S7 shows iOS can already open a card by id.
- **D9 thin cards (APPROVED b).** After the owner takes the shared fact, four cards have no line of their own: duck_meat, lamb_goat, goat_sheep_dairy, coconut_milk_beverage. a) Rewrite restating shared facts (first draft). **b) Keep only if Piece 2 fetches one sourced line unique to that food; else fold (Rec):** duck_meat → chicken_cuts_basics (title "Chicken and duck"); goat_sheep_dairy → milk_processing; coconut_milk_beverage → the plant-milk owner, moving "coconut milk beverage" only, never bare "coconut milk" (canned_coconut_milk owns it). lamb_goat has no absorber, so it stays as a thin entry card: reading order plus pointers. c) Fold or retire all four now.

**Piece 2 outcomes (admin, 2026-10-12, from `docs/research/health-first-sources.md`, cb3745c).**
- D9b applied: **duck_meat folds** into chicken_cuts_basics (its only line is culinary, "beef of the poultry world"). **lamb_goat stays thin** (goat leanness/cholesterol is a nutrition claim, macroGuard). **goat_sheep_dairy stays** on the composition line (less lactose, different proteins, MSU); never "easier to digest". **coconut_milk_beverage stays** on the naming decode ("a coconut beverage"). Piece 5 retires 5: dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder, duck_meat.
- chicken_cuts_basics is NOT satisfiable → TRIM, not REWRITE.
- Narrowings: salt says "iodized lists added iodine; check the list for anti-caking", never "most sea/kosher carry none". Cocoa drops the flavanol line; "processed with alkali" stays (21 CFR 163.112). Ground beef omits store-ground vs pre-packed. Tofu cites coagulants, not "organic". "Solution added" cites 9 CFR 317.2 for red meat only, not poultry. Bagels carry only their own list; the pretzel list is Snyder's.
- Owner gaps (S7): an owner must carry its owned sentence before siblings point at it. sandwich_bread has no dough-conditioner sentence; sauerkraut has "unpasteurized" only as an alias; flour_basics leads with chew. The owner's batch adds that sentence from an archive or the engine KB; with no trace, the OWNED_FACTS row is dropped and siblings keep no sentence on it.
- Scout facts: there is no shared-sentence tier-note rule; REPEATED_CLAIM mirrors `TIER_NOTE_IS_RUBRIC` (`counterCardLint.js:50` `SHARED_RUN`, `:1099`). RETIRED/RETIRED_GENERATED live in `server/lib/counterCards.js:92/:149`, tested at `counterCardLint.test.js:351`; past fold `f5c9ae5`. The CardFan front card is hardcoded (`kristy-ios/Kristy/Surfaces/Auth/CardFan.swift:21`, old ground_beef_lean_ratio copy).

## One fact, one owner
**Rule.** A shared health fact (raising, chill, added solution, extraction, live culture, dough conditioners) is stated on exactly one owner card. A sibling in that family carries one pointer per owned fact and spends every other sentence on what only it can say. A card's own ingredient list is always its own fact. The general idea "read the list" is never a sentence; each card names its own list.

**Card skeleton (every card, this order).**
1. `title`: the food, plain ("Ground beef").
2. `decision`: the closest-to-nature version, in this card's own terms.
3. `why`: the one fact only this card owns.
4. `cart_pick`: the pick as a list row. It may carry the owner's term ("Ground beef, grass-finished"); it is the list item, not an explanation.
5. `pick_steps`, fixed order: (1) this food's list and what was added; (2) how it was raised or made: the owner states it, a sibling points; (3) freshness, date, safety. D3b value line last, if any.
6. `labels_decoded`, `watch_out`: terms and additions unique to this card.
7. `short_answer`, `detail`, `science`, `kristy_take`, `tier_note`, do line: same order; no owned fact on a non-owner.

**Family tables.** Batch: 3a/3b TRIM (drop culinary clauses), 4a/4b/4c REWRITE (re-aim decision, cart_pick, pick_steps, tips; keep id, food aliases, the cooking-phrased asked_as). "own" = already on the card; "sib" = a sibling's sentence and source; "pack" = Piece 2 archive. A pointer is never a claim.

**Beef.** Raising: `beef_grassfed_vs_grainfed`. Term "grass-fed": `label_grass_fed_term`. Added solution (all meat): `pork_cuts_and_enhanced`. Mechanically tenderized: `beef_cuts_basics`. Freshness at the case: `judging_meat_at_the_case`. Reading order: `meat_case`.
| Card | Batch | Only it says | → Owner |
|---|---|---|---|
| beef_grassfed_vs_grainfed | 3a (W3) | OWNER: grass-finished over grain-finished | term → label_grass_fed_term |
| ground_beef_lean_ratio | 4a D1 | Title "Ground beef". The name allows no added fat, water, phosphates or binders; "hamburger" may add fat; ratio = lean:fat by weight, in labels_decoded only (own: 9 CFR 319.15). Store-ground vs pre-packed only if pack has it | raising, solution |
| ground_beef_organ_blend | 3a (W2) | The label names which organs and the share (own) | raising |
| beef_cuts_basics | 4a D2 | OWNER: "mechanically tenderized" on the label (pack: 9 CFR 317.2(e)(3)). Drop cook-verb aliases | raising, solution |
| beef_grades_usda | 4a D2 | A grade scores marbling, not how the animal lived or what it ate (own/sib) | raising |
| meat_case (hub) | 4a D2 | OWNER of the order: raised, then added, then date. Each step is a pointer. Do line covers every arrival | all beef owners |
| butcher_counter_asking | 4a | The questions to ask; a grind from a whole cut on request (own) | each answer → its owner |
| judging_meat_at_the_case | 3a | OWNER: color, smell, date. Drop marbling | raising |
| organ_meats | 3a | Which organ, its freshness and safety (own). Drop method matching | raising |
| pick_soup_bones | 4a (pick) | Nothing of its own. Picks feed list matching, so it stays: cart_pick + pointer | raising |

**Poultry and eggs.** Raising (birds, pigs): `label_pasture_raised_feed`. Chill and retained water: `air_chilled_chicken`. Hen raising: `egg_labels`.
| air_chilled_chicken | 3a (P3,T3,W2,K skin) | OWNER: air-chilled, no retained water | raising |
| chicken_cuts_basics | 4a | The whole bird is the least-processed form (sib/pack) | raising, chill |
| duck_meat | 4a D9 | Unique line from pack, else fold into chicken_cuts_basics | raising |
| egg_grades_sizes | 4a | Grade and size describe the egg, not the hen (sib) | egg_labels |

**Pork, lamb, game.** Pig raising → `label_pasture_raised_feed`; ruminant raising → `label_grass_fed_term`; added solution → `pork_cuts_and_enhanced`.
| pork_cuts_and_enhanced | 4a | OWNER: "enhanced" / solution added, for all meat (own + pack) | raising |
| lamb_goat | 4a D9 | Unique line from pack, else thin entry card. Drop grade, class, tenderness | raising, solution |
| bison · venison_game | 3a | Keep only the species line already on the card. Drop "gamey" | raising |

**Seafood.** Wild vs farmed: `salmon_wild_vs_farmed`. Phosphate soak: `scallops`.
| scallops | 3b | OWNER: dry vs soaked. Drop the sear | — |
| shrimp_imported_vs_domestic · white_fish · canned_fish_choosing | 3a | Origin label; form (drop center-cut); can and list (own) | phosphate → scallops |

**Dairy.** Processing: `milk_processing`. Raw: `raw_milk`. Raw aged cheese: `raw_aged_cheese`. Processed cheese: `cheese_real_vs_processed`. Grass-fed term: `label_grass_fed_term`. Plain cultured: the yogurt card S7 names, else `plain_kefir`. Plant milk unsweetened: `almond_milk` or `oat_milk`, whichever S7 shows sourced.
| milk_processing · raw_milk (T6) · raw_aged_cheese · cheese_real_vs_processed | 3a | OWNERS, trim only | — |
| grassfed_butter | 3a | List: cream, salt (own) | grass-fed term |
| plain_kefir · cream_cheese · ghee | 3b | Cultures; its list and gums; "butter" as the list (own) | plain → owner |
| goat_sheep_dairy · coconut_milk_beverage | 4c D9 | Unique line from pack, else fold (D9) | raising / unsweetened |

**Oils.** Extraction: `label_cold_pressed_expeller`. Olive: `olive_oil_grades`. Animal fat: `lard_tallow`. Seed-oil concern: engine `seed_oil` only.
| label_cold_pressed_expeller | 3a | OWNER, trim only | — |
| cooking_oils (hub) | 4b | The label names the oil; "vegetable oil" names none. Drop heat use | all three |

**Bakery.** Bread list and dough conditioners: `sandwich_bread`. Flour: `flour_basics`.
| flour_basics | 4b | OWNER: whole-grain, unbleached, unbromated (engine KB first, else pack) | — |
| bagels · pretzels | 4c D4 | Bagel list adds malt (sib); snack pretzel list (pack) | conditioners → sandwich_bread |

**Ferments.** Refrigerated, unpasteurized, live: `sauerkraut`.
| kimchi · miso | 4c | Its list; miso "red is saltier" as composition (k20) | sauerkraut |
| fermented_pickles · olives | 3b | Salt brine, not vinegar; brine-cured (own) | sauerkraut |

**Pantry, produce, frozen: own-list cards.** No shared fact, so no pointer. Each keeps only its own list or form.
- 4b: salt (D5c: iodized carries added iodine, most sea and kosher carry none, the rest is anti-caking; pack), sugars (brown = white + molasses, no ranking), maple_syrup ("100% maple syrup", any grade, vs table syrup by list), cocoa (list "cocoa"; "processed with alkali" = Dutch process; flavanol line only if pack), tea (only the leaf; flavors → label_no_artificial_flavors), broth (bones and vegetables named; pack), grains_beyond_rice (hulled or whole over pearled; pack). 4c: pick_tofu (soybeans, water, coagulant; organic; pack).
- 3a: oats_steelcut_rolled_instant, nuts_raw_vs_roasted, beans_dried_vs_canned, bulk_bins_buying, whole_spices, frozen_vs_fresh_produce. 3b: produce_leafy_greens, produce_mushrooms, pick_kohlrabi, seeds, nutritional_yeast, pasta_sauce, jam, ketchup_mustard, seaweed, coconut_water (heat as processing), popcorn, hummus, frozen_fries, frozen_waffles, frozen_nuggets.

**RETIRE / FOLD.** dry_brine retires (its "solution added" lives on the owner). bean_soak_salt retires; food aliases → beans_dried_vs_canned. pretzel_bread folds into buns_rolls. baking_soda_powder retires (D4b). D9 adds 0-3 folds after Piece 2. Rule for all: RETIRED list plus KB delete, aliases moved, shortcuts and `list.js` repointed, counterReach updated. Cooking-only questions become honest misses. Hub-steal: a fold moves only specific aliases ("duck breast", "goat milk"), never short generics.

## Claim-lock path (binds Pieces 3-5)
1. A new sentence may only restate (i) a sentence on this card, carrying its source verbatim; (ii) an engine KB entry, for any additive concern; or (iii) a quote in the Piece 2 archive. A sibling's sentence is reused only on its owner; elsewhere it becomes a pointer.
2. Builders never fetch and never cite a URL from memory. Forges invented 9 of 10 URLs before.
3. Every changed `sources` URL is grepped verbatim against `docs/research/health-first-sources.md` plus the existing archives. Zero misses, or the piece fails.
4. `evidence_tier` stays honest. A raising preference is `kristys_standard`, never `established`.
5. Wording is observable: "grass-finished", "nothing added", "ingredients: beef". Never "healthier", "nutritious", "lowers", "supports".

## Pieces
**Pieces 3-5 all edit `server/kristy_perimeter_kb.json`, `server/lib/doLines.json` and `docs/do-lines-review.md`.** Each owns disjoint card ids. They run in strict sequence; none is parallel-safe. Pieces 1-2 are parallel-safe with each other.

### 1. Ruling + CULINARY_AIM and REPEATED_CLAIM lint  [T2]
Two rules in `server/lib/counterCardLint.js`. REPEATED_CLAIM mirrors `TIER_NOTE_IS_RUBRIC` (S3: no shared-sentence rule exists).
- **Built: chf-1 `09c9f45`** (critic SHIP r1). Lexicon drops bare `crisp` (produce freshness sign; keep `crispy`) and allows `baking soda|powder`, `natural/artificial flavors`, `flavor claim`: never re-add. PENDING = 75 (plan 74 + buns_rolls, a real dough_conditioners repeat). At HEAD: CULINARY_AIM 29, REPEATED_CLAIM 10, POINTER_UNKNOWN_OWNER 0. Ship notes: ~38 PENDING ids are clean but exempt, so each batch removes its ids from PENDING as it lands (that is the ratchet); an allow phrase exempts its whole sentence.
- CULINARY_AIM fails on cook-method, cut-for-dish or taste words in decision, cart_pick and pick_steps. Lexicon `[PLACEHOLDER]`: for burgers|braise|sear|grill|bake|recipe|crisp|chew|tender|flavor|taste|melt. Freshness and safety allowlist `[PLACEHOLDER]`.
- REPEATED_CLAIM reads an `OWNED_FACTS` table: `{fact, owner, ownerTitle, family: [ids], pattern}`, one row per owner above; patterns `[PLACEHOLDER]` (e.g. `grass[- ]?(fed|finished)`, `pasture[- ]raised`, `air[- ]chill|retained water`, `solution|enhanced`, `cold[- ]pressed|expeller`, `unpasteurized|live cultures`, `dough conditioner`). It fails when a pattern matches a family member other than the owner, in any prose field. Exempt: aliases, asked_as, question, sources, cart_pick, and a pick_step matching `^[A-Z][^:]{0,40}: see (.+)\.$`. A pointer whose title is not an `ownerTitle` fails.
- A corpus test asserts every `ownerTitle` equals that owner's KB title, and scans `doLines.json` for family members too.
- Both rules enforce every id outside `HEALTH_FIRST_PENDING` (starts as the 74 ids above). Each batch empties its ids.
- Main session (T0) adds the ruling and "one fact, one owner" to DECISIONS.md "The counter" and one CLAUDE.md line. Check `wc -m CLAUDE.md` ≤ 21000.
Files: counterCardLint.js, its test (S3 path), DECISIONS.md, CLAUDE.md.
- **Done means:** Given the KB at HEAD, when `cd server && npm test` runs, then it passes and a test prints per-rule hit counts and ids. Given decision "80/20 for burgers.", then CULINARY_AIM. Given "Firm, no slime", then none. Given ground_beef_lean_ratio with pick_step "Grass-finished when the case has it.", then REPEATED_CLAIM. Given the same step on beef_grassfed_vs_grainfed, then none. Given "How it was raised: see Grass-fed beef.", then none. Given "How it was raised: see Beef grades.", then REPEATED_CLAIM.
- **Out of scope:** card edits. **OK rough edges:** lexicons miss synonyms; a fact repeated outside its family is not caught; the critic catches both. **Ship bar:** an id outside PENDING fails a rule; or PENDING holds an id not in the tables.
- **Route:** dv T2 (fallback forge@opus); critic@opus. **Dial:** P1. **Independent check:** every HEAD hit is one of the 74. A hit outside them (an unflagged card repeating an owner) is listed by name and added to 3a or 3b before Piece 3.

### 2. Source pack  [researcher]
Firecrawl (`firecrawl-scrape`/`search`) for every "pack" row, D5 and the D9 unique-line search. Federal text via law.cornell.edu or govinfo.gov (.gov 403s on this box). Holistic sources sit alongside regulation. Output: `docs/research/health-first-sources.md`, one block per card id: URL verbatim, fetched quote, SATISFIABLE / NOT. Raising sources are no longer needed for siblings; they point.
- **Done means:** every pack row has a block. Each URL appears in a `.firecrawl/*.md` scrape file. **Ship bar:** a URL with no scrape file.
- **Route:** researcher@sonnet with Firecrawl [T1]. **Dial:** P2 (external unknown). **Check:** `grep -c` of URLs versus scrape files.

### 3. TRIM, batches 3a and 3b (one dv build each)  [T2]
Drop culinary clauses; replace any owned fact on a non-owner with its pointer. 3a runs first because it holds most owners.
- **Done means:** Given the batch ids, CULINARY_AIM = 0 and REPEATED_CLAIM = 0, and they leave PENDING. No new `sources` entry. No new sentence except pointers. Every pick_steps passes the K-AUDIT actionable bar and the skeleton order. Probe 0 wrong. counterReach and counterFloor pass.
- **Out of scope:** REWRITE ids. **OK rough edges:** a card left with 2 tips. **Ship bar:** any new claim; any deleted safety or freshness sentence; an owner losing its owned sentence.
- **Route:** dv T2 (fallback forge@opus); critic@opus, `FIDELITY required`. **Dial:** P1. **Check:** a diff-only grep shows no added sentence absent at HEAD, other than pointers.

### 4. REWRITE, batches 4a, 4b and 4c (one dv build each)  [T2]
Each batch also updates its do-line rows (do-lines-review.md, then `node server/scripts/buildDoLines.js`) and its tier_notes, unique, no TIER_NOTE_ORPHANED, no self-reference.
- **Done means:** Given the batch ids, CULINARY_AIM = 0 and REPEATED_CLAIM = 0. Each card follows the skeleton and carries at most one pointer per owned fact. Each has ≥3 asked_as reaching it via counterReach, including the kept cooking-phrased question. Every URL greps into an archive. `grep -ciE "healthier|healthiest|better for you"` over changed fields = 0. Probe 0 wrong. `npm test` green.
- **Out of scope:** alias moves. **OK rough edges:** a pack card falls back to TRIM when Piece 2 marked it NOT, listed in the report. **Ship bar:** a claim with no own, engine or archive trace; an ESSENTIALS order change.
- **Route:** dv T2 (fallback forge@opus); critic@opus, URL grep and claim-trace table as item 1. **Dial:** P1. **Check:** claim-trace table, one row per new non-pointer sentence.

- **Built: chf-4a `13a122d`** (critic SHIP r2; wip `64a9774` recovered after a dropped session). Admin ruling: HEALTH_FIRST_REWRITE ids may change cart_pick; asked_as/sources supersets; aliases drop only CULINARY_LEXICON cook verbs; labels_decoded keeps every term; id/category/evidence_tier/instead frozen. C12 in k14.test.js re-anchored 3f34250 → 64a9774. Ship notes: (1) passRule.js:15 `keepsAll` compares object sources by reference, so pick_soup_bones fails falsely; 4b/4c will hit it, and fixing it means editing passRule and re-anchoring C12 again. (2) C12 anchors a `wip:` hash; a squash/amend fails loudly. (3) Spec named server/test/counterReach.test.js; the real file is server/lib/counterReach.test.js (passes). (4) "stew" and "pot roast" now match no card (honest miss). lamb_goat's second watch_out was rephrased from card science: "Goat meat has no quality grade, and older goat is darker, so ask the age at the counter."
- **Built: chf-4b `3da15fe`** (critic r1 FIX, r2 SHIP). Ship notes N1 and N3 from chf-4a fixed first: `keepsAll` compares by value and the 4b/4c ids were pre-staged in HEALTH_FIRST_REWRITE (`5cc9758`; C12 re-anchored `5ad9663`); the spec paths were corrected (`2b7fe5e`). PENDING 21 → 12. OWNED_FACTS adds olive_grade (olive_oil_grades) and animal_fat (lard_tallow). r1 blockers fixed: cooking_oils no longer claims "the bottle never says what is inside" (it now says the ingredient list names the oils), and broth's untraced soup-base step was deleted (2 steps remain). Ship notes: (1) salt cart_pick is now "Pickling or canning salt" over iodized; it makes no claim but steers away from iodine, so it is Devon's call. (2) tea has no flavors pointer: the label_no_artificial_flavors title has an em dash that READ_STACKED rejects, so a title change is needed to add it. (3) No new asked_as for tea or cocoa (scope gate).

### 5. RETIRE / FOLD  [T2]
Files: the KB, the S1 RETIRED file, list.js and shortcuts (S2), counterReach and list tests.
- **Done means:** Given the migration dry-run, then it reports exactly the D4- and D9-chosen slugs (3-7) in RETIRED and none in RETIRED_GENERATED. `grep -rn` over server/ and the prompts shows 0 hits per slug outside RETIRED and tests. pretzel_bread's asked_as reach buns_rolls; each D9 fold's asked_as reach its absorber; "coconut milk" still reaches canned_coconut_milk. HEALTH_FIRST_PENDING is empty, so both rules run corpus-wide.
- **Out of scope:** new cards. **Ship bar:** an essential retired; a shortcut pointing at a deleted id.
- **Route:** dv T2 (fallback forge@opus); critic@opus. **Dial:** P1. **Check:** S2 reference count before = moved + deleted after.

### 6. Release, then live read-back  [main + qa]
1. `cd server && npm test`; `node scripts/commitGuard.js` from the repo root. 2. `node scripts/migrateCounterCards.js --dry-run`, KB versus table diffed first. 3. `node scripts/migrateCounterCards.js`. 4. Commit "… Migrated.", then `git -c credential.helper='!gh auth git-credential' push origin main:held`. Pick edits go live on the next main push (D6). 5. Four-step verify. 6. Re-count the CLAUDE.md corpus count.
QA: qa@sonnet reads `counter_cards` back. **Done means:** row count = KB card count; retired slugs return 0 rows; 10 sampled decisions byte-equal the KB; findings ≤8. **Route:** main, then qa@sonnet. **Check:** the post-upsert count line.

### 7. iOS wall CardFan + App Store shots  [ui]
Change the CardFan front card (S5 path) to "Ground beef" (D7b). Copy only: no image source, art law not engaged. Design direction: unchanged CardFan styling, Oat `#E9E2D0` ground, `#FAF7EF` card, Fraunces eyebrow. **Anti-slop:** no new chrome, no gold fill.
- **Done means:** a rendered simulator screenshot shows the new eyebrow and title; `runners_compile.sh` passes. No full UI suite (attach budget). **Ship bar:** the old title visible anywhere. **Shots:** re-shoot only S6-named shots, after the migration; Devon approves.
- **Route:** forge@opus [T2, ui]; critic@opus with the screenshot. **Dial:** P1.

### Dispatch prompts
Specs `.pipeline/specs/chf-{1,3a,3b,4a,4b,4c,5}.md` are written after S1-S7 return and D8-D9 are ruled. `## Contract` dependents come only from S2.
- **Each Codex piece:** `dv check <spec>` → PASS; `dv route T2 --plan docs/plans/card-health-first-plan.md`; `dv build <spec>` in the background; then critic@opus: "[T2] runId <id>, SPEC <spec>, FIDELITY required. Item 1: grep every changed sources URL against the archives; claim-trace table; REPEATED_CLAIM = 0 on the batch. Report ≤30 lines."
- **Fallback:** forge@opus [T2], `SPEC <spec>`.
- Known anchor: `ANCHOR server/kristy_perimeter_kb.json:476` `"decision": "80/20 for burgers. 90/10 for anything you drain.",` (the others from S2/S7).
- **Verify (every piece):** `cd server && npm test` (last 2440/0, admin run, 494d243); `node server/scripts/listMatchProbe.js` → 0 wrong; `node server/scripts/commitGuard.js` → clean; `cd server && node scripts/migrateCounterCards.js --dry-run` → the batch ids are placed.

## What broken looks like
- Ground beef still says burgers. Or "ground beef" asked on the counter lands on a miss or on beef_grassfed.
- Two beef cards both explain grass-finished. A pointer names a card that does not exist.
- A card says "healthier", or cites a URL with no scrape file.
- A retired slug still answers on iOS. The CardFan still reads "lean ratios". "coconut milk" lands on the carton card.
- A cooking question that used to find a food card now misses.

## Risks
- **The owners already repeat each other** (label_grass_fed_term vs beef_grassfed_vs_grainfed; almond_milk vs oat_milk). Early check: S7 prints their sentences; Piece 1's HEAD hit list. The non-owner copy becomes a 3a TRIM row.
- **Sourcing stalls the pack rows.** Early check: Piece 2 SATISFIABLE count before 4a is specced. NOT rows fall back to TRIM or D9 fold, never to an invented source.
- **KB conflict with the corpus branch.** Early check: S6 before Piece 3; rebase onto it first if it touches the KB.
