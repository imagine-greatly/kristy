# Plan: counter cards, health-first (2026-10-12), for approval, not built

**Problem.** Devon: the cards coach *cooking* ("80/20 for burgers", "center-cut piece", "decide the cook first"). Kristy exists to help a shopper find the least-processed, closest-to-nature version of each food. The audit (Codex, read-only, 2026-10-12) flagged 72 of 233 entries (71/202 cards, 1/31 picks). Nine cards and two picks give no health or sourcing direction at all.
**Underlying need.** Every card should answer "which version of this food is closest to nature", and never "which cooks best". Salmon note: `salmon_wild_vs_farmed` already points at wild. The "center-cut" line is on `white_fish` (P3/T4).

## Scout first (admin-run; ANCHORs come only from VERIFIED lines)
- S1 `dv scout "Where are RETIRED and RETIRED_GENERATED declared, which test checks them, and which commit is the best example of a past fold?" --terms RETIRED,RETIRED_GENERATED`
- S2 `dv scout "Every reference outside kristy_perimeter_kb.json to these ids: dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder, plus the 27 REWRITE ids below (list.js perimeterId, CATEGORY_SECTION, shortcuts, ESSENTIALS, doLines.json, docs/do-lines-review.md, prompts, tests)" --terms perimeterId,ESSENTIALS,shortcuts,CATEGORY_SECTION`
- S3 `dv scout "Which counterCardLint.js rule plus allowlist (e.g. the cure-sentence allowlist) should a new rule mirror? What is its test file path? Does a server test/acceptance dir exist?" --terms lintCard`
- S4 `dv ask --role scout "List the source archives (docs/research/*-sources.md, .firecrawl/, docs/sources/) covering beef, poultry, pork, eggs, pantry and ferments. Does the engine KB carry potassium bromate, aluminum, phosphate, carrageenan or seed_oil entries?" --cd /Users/m1/kristy`
- S5 `dv scout "kristy-ios: path of CardFan. Is the front-card text hardcoded or fetched? What does iOS render when a list row's perimeterId has no counter_cards row?" --terms CardFan,perimeterId`
- S6 `dv ask --role scout "Which App Store shots show any card in the REWRITE/RETIRE tables? Which of origin/main..origin/held and the corpus branch (~/kristy-corpus) touch kristy_perimeter_kb.json?" --cd /Users/m1/kristy`
- Does anything already do part of this? Yes. `label_grass_fed_term`, `air_chilled_chicken`, `egg_labels`, `label_cold_pressed_expeller`, `sauerkraut` and others already hold the health-first material. Rewrites **reuse their sentences and sources**. Nothing new gets invented where a sibling already says it.

## Intent
A shopper opens Ground beef and reads: beef and nothing else, grass-finished when the case has it. The 80/20 number stays only as a label decode. Every meat, fish, dairy, pantry and bakery card leads with the least-processed version: the raising claim, the ingredient list, what was added. None of them leads with the cook, the cut, the grade or the taste. **The moment that must land: the beef card reads like a sourcing guide, not a recipe.**

## Non-goals
- No new cards. No scoring or engine change (#5). No price figures (#8).
- No copy that says "healthier", "healthiest" or "better for you". Health stays the product aim and is never the claim (#2, #3).
- The scan card, the frozen `client/src`, and the 131 unflagged cards and 30 unflagged picks (minus pick_tofu/pick_soup_bones) are untouched, apart from alias moves.
- **Displaces:** pricing build I1 / launch queue for about a day. 7 Codex builds + 7 critic@opus + 1 researcher + 1 iOS forge.

## New ruling (recorded in Piece 1, in DECISIONS.md "The counter" and one CLAUDE.md line)
- Cards aim at the closest-to-nature, least-processed version: raising, ingredient list, additions, freshness, safety.
- Cut, grade, cook method, texture and taste are out of card scope.
- A cooking-phrased question stays findable when the card owns the food ("which ground beef for burgers"). The answer is the health-first pick.

## Dispositions (72 flagged + 2 unflagged picks)
**TRIM (43): drop the culinary clauses only.** A dropped pick_step is replaced only by a sentence already on the same card.
- **Batch 3a:** shrimp_imported_vs_domestic, beef_grassfed_vs_grainfed (W3), ground_beef_organ_blend (W2), air_chilled_chicken (P3, T3, W2, K: skin), frozen_vs_fresh_produce, grassfed_butter, cheese_real_vs_processed, raw_milk (T6), oats_steelcut_rolled_instant, nuts_raw_vs_roasted, beans_dried_vs_canned, judging_meat_at_the_case (marbling), canned_fish_choosing, milk_processing, bulk_bins_buying, whole_spices, label_cold_pressed_expeller, raw_aged_cheese, organ_meats (method matching), bison, venison_game (gamey), white_fish (center-cut).
- **Batch 3b:** scallops (keep phosphate soak, drop sear), plain_kefir, cream_cheese, ghee, fermented_pickles, produce_leafy_greens, produce_mushrooms, pick_kohlrabi, seeds, nutritional_yeast, pasta_sauce, jam, ketchup_mustard, olives (keep brine-cured), seaweed, coconut_water (reframe heat as processing), popcorn, hummus, frozen_fries, frozen_waffles, frozen_nuggets.

**REWRITE (27): re-aim decision, cart_pick, pick_steps and tips. Keep id, food aliases and the cooking-phrased asked_as.**

| Batch | Card | New aim (source: sib = sibling card already in KB; pack = Piece 2 archive) |
|---|---|---|
| 4a | ground_beef_lean_ratio | Title "Ground beef". "Beef and nothing else; grass-finished when it is there." Ratio moves to labels_decoded only (sib: 9 CFR 319.15 already cited, beef_grassfed) **D1** |
| 4a | beef_cuts_basics | "A whole cut with nothing added": no "solution", "mechanically tenderized" or "flavored"; grass-finished. Drop cook-verb aliases (pack: 9 CFR 317.2(e)(3), law.cornell.edu) **D2** |
| 4a | beef_grades_usda | "A grade scores marbling, not how the animal lived"; then points to the finish claim (sib) **D2** |
| 4a | meat_case (hub) | "Read how it was raised, then what was added, then the date" (sib). Do line covers every arrival **D2** |
| 4a | butcher_counter_asking | Ask what it was finished on, where it was raised, whether anything was added; a fresh grind from a whole cut (sib) |
| 4a | chicken_cuts_basics | Pasture-raised, air-chilled, no "retained water"; whole bird as the least-processed form (sib: air_chilled_chicken, label_pasture_raised_feed) |
| 4a | pork_cuts_and_enhanced | "Pork with no solution added; pasture-raised when it is there" (sib + pack) |
| 4a | lamb_goat · duck_meat | Raising claim plus nothing added; drop grade, class and tenderness (pack; no source means TRIM to safety only) |
| 4a | egg_grades_sizes · pick_soup_bones | Grade and size say nothing about the hen (sib: egg_labels). Bones from a grass-finished or pasture animal (pack) |
| 4b | cooking_oils | Cold-pressed or expeller, unrefined, oil named; drop heat use (sib: label_cold_pressed_expeller, olive_oil_grades, lard_tallow; any seed-oil line must trace to the engine `seed_oil` entry) |
| 4b | salt | **D5** |
| 4b | sugars · maple_syrup | Label truth: brown = white + molasses, no ranking. "100% maple syrup, any grade" versus table syrup by ingredient list |
| 4b | cocoa | Ingredient list "cocoa" only; "processed with alkali" names the Dutch process. Flavanol line only if pack fetches it **D4** |
| 4b | tea · broth | The list names only the leaf. Broth names its bones and vegetables, short list (sib: label_no_artificial_flavors; pack) |
| 4b | flour_basics · grains_beyond_rice | Whole-grain, unbleached, unbromated (engine KB first, else pack). Hulled or whole over pearled; drop cook times (pack) |
| 4c | goat_sheep_dairy · coconut_milk_beverage | Pasture-raised and plain (sib: raw_aged_cheese). Unsweetened, short list (sib: almond_milk, oat_milk) |
| 4c | kimchi · miso | Refrigerated, unpasteurized, short list; miso "red is saltier" kept as composition fact (archive docs/sources/k20) |
| 4c | bagels · pretzels · pick_tofu | Flour, water, yeast, salt (malt); whole grain; no dough conditioners (sib: sandwich_bread, buns_rolls). Tofu: soybeans, water, coagulant, organic (pack) **D4** |

**RETIRE / FOLD (3 + 1 judgment):**
- **dry_brine:** retire, no absorber. Its "solution added" check already lives on pork_cuts_and_enhanced and 4a.
- **bean_soak_salt:** retire. Food aliases move to beans_dried_vs_canned.
- **pretzel_bread:** fold into buns_rolls (aliases plus asked_as).
- **baking_soda_powder:** **D4**.
- Rule for all four: RETIRED list plus KB delete, aliases moved, shortcuts and `list.js` repointed, counterReach updated. Cooking-only questions become honest misses.

## Decisions for Devon (Recommended marked; option a is today's state)
- **D1 ground beef.** a) 80/20 card as is. **b) Rewrite in place (Rec):** keeps the id, the "ground beef"/"hamburger" aliases, list matches and the CardFan slot. c) Fold into beef_grassfed_vs_grainfed: one beef card, but it moves the highest-traffic alias and every list perimeterId.
- **D2 cuts, grades, meat case.** a) As is. **b) Re-aim all three in place (Rec).** c) Fold cuts and grades into beef_grassfed: that piles short generics ("steak", "round", "prime", "choice", "select") onto one card, which the hub-steal rule forbids.
- **D3 value lines** ("bulk oats are pennies", "shoulder is the value cut"). a) Keep all. **b) Keep a value line only when it is the cheapest route to the health pick (Rec).** c) Drop all value lines.
- **D4 bakery and baking.** a) As is. **b) Rewrite bagels, pretzels and cocoa to ingredient-list truth; fold pretzel_bread; retire baking_soda_powder (Rec).** c) Retire all five as non-food-quality cards.
- **D5 salt.** a) Pick by grain. b) "Just salt, nothing added" (closest to nature, silent on iodine). **c) Label truth (Rec):** iodized carries added iodine, most sea and kosher salt carry none, the rest is anti-caking. No benefit stated.
- **D6 push.** **a) held only, per the ask (Rec, if S5 shows a missing perimeterId row degrades to "no card")**: counter_cards goes live to iOS on migrate. The Railway listMatch keeps the old KB, so the pick edits (tofu, soup bones, kohlrabi) wait for the next main push. b) Push main too: ships the whole held stack (S6).
- **D7 wall CardFan front card.** a) "BEEF / Ground beef lean ratios". **b) The renamed "Ground beef" card (Rec).** c) beef_grassfed_vs_grainfed "Grass-fed beef".

## Claim-lock path (binds Pieces 3-5)
1. A new sentence may only restate (i) a sentence on this card or a sibling card, carrying that card's source string verbatim; (ii) an engine KB entry, for any additive concern; or (iii) a quote in the Piece 2 archive.
2. Builders never fetch and never cite a URL from memory. Forges invented 9 of 10 URLs before.
3. Every changed `sources` URL is grepped verbatim against `docs/research/health-first-sources.md` plus the existing archives. Zero misses, or the piece fails.
4. `evidence_tier` stays honest. A raising preference is `kristys_standard`, never `established`.
5. Wording is observable: "grass-finished", "nothing added", "ingredients: beef". It is never "healthier", "nutritious", "lowers", "supports".

## Pieces
**Pieces 3-5 all edit `server/kristy_perimeter_kb.json`, `server/lib/doLines.json` and `docs/do-lines-review.md`.** Each owns disjoint card ids. They run in strict sequence; none is parallel-safe. Pieces 1-2 are parallel-safe with each other.

### 1. Ruling + CULINARY_AIM lint  [T2]
Add a `CULINARY_AIM` rule to `server/lib/counterCardLint.js`, mirroring the S3 allowlist rule.
- It fails on cook-method, cut-for-dish or taste words in decision, cart_pick and pick_steps.
- Lexicon `[PLACEHOLDER]`: for burgers|braise|sear|grill|bake|recipe|crisp|chew|tender|flavor|taste|melt.
- Freshness and safety allowlist `[PLACEHOLDER]`.
- Enforced for every id outside `CULINARY_AIM_PENDING` (starts as the 74 ids in the tables above). Each batch empties its ids from the list.
- Main session (T0) adds the ruling to DECISIONS.md and CLAUDE.md. Check `wc -m CLAUDE.md` ≤ 21000.

Files: counterCardLint.js, its test (S3 path), DECISIONS.md, CLAUDE.md.
- **Done means:** Given the KB at HEAD, when `cd server && npm test` runs, then it passes, and a test prints the pre-change hit count N (re-runnable). Given a fixture card with decision "80/20 for burgers.", when lintCard runs, then it reports CULINARY_AIM. Given a fixture with "Firm, no slime", then it reports no CULINARY_AIM.
- **Out of scope:** card edits. **OK rough edges:** lexicon misses synonyms; the critic catches those. **Ship bar:** any id outside PENDING fails the lint; or PENDING holds an id not in the tables.
- **Route:** dv T2 (fallback forge@opus); critic@opus. **Dial:** P1. **Independent check:** every id with a hit at HEAD is one of the audit's 74. A hit outside them is listed by name, then allowlisted or added to TRIM, before Piece 3.

### 2. Source pack  [researcher]
Firecrawl (`firecrawl-scrape`/`search`) fetches for every "pack" row plus D4/D5. Federal text comes via law.cornell.edu or govinfo.gov, since .gov returns 403 on this box. Holistic sources (extension, ranchers, AGA, Cornucopia) sit alongside regulation. Output: `docs/research/health-first-sources.md`, one block per card id with the URL verbatim, a fetched quote, and SATISFIABLE / NOT.
- **Done means:** every pack row has a block. Each URL appears in a `.firecrawl/*.md` scrape file. **Ship bar:** a URL with no scrape file.
- **Route:** researcher@sonnet with Firecrawl [T1] (the prior batches' pattern). **Dial:** P2 (external unknown). **Check:** `grep -c` of URLs versus scrape files.

### 3. TRIM, batches 3a and 3b (one dv build each)  [T2]
- **Done means:** Given the batch ids, when lint runs, then CULINARY_AIM = 0 on them and they are removed from PENDING. No new `sources` entry. Every pick_steps still passes the K-AUDIT actionable bar. `node server/scripts/listMatchProbe.js` shows 0 wrong. counterReach and counterFloor pass.
- **Out of scope:** decisions on REWRITE ids. **OK rough edges:** a card left with 2 tips. **Ship bar:** any new claim; any deleted safety or freshness sentence.
- **Route:** dv T2 (fallback forge@opus); critic@opus with `FIDELITY required`. **Dial:** P1. **Check:** a diff-only grep shows no added sentence absent from that card at HEAD.

### 4. REWRITE, batches 4a, 4b and 4c (one dv build each)  [T2]
Each batch also updates its do-line rows (do-lines-review.md, then `node server/scripts/buildDoLines.js`) and its tier_notes. Tier notes must be unique: no TIER_NOTE_ORPHANED, no self-reference.
- **Done means:** Given the batch ids, CULINARY_AIM = 0. Each card has ≥3 asked_as, and each one reaches it via counterReach, including the kept cooking-phrased question. Every URL greps into an archive. `grep -ciE "healthier|healthiest|better for you"` over changed fields = 0. Probe 0 wrong. `npm test` is green.
- **Out of scope:** alias moves between cards. **OK rough edges:** a "pack" card falls back to TRIM when Piece 2 marked it NOT, and that card is listed in the report. **Ship bar:** a claim with no sibling, engine or archive trace; or an ESSENTIALS order change.
- **Route:** dv T2 (fallback forge@opus); critic@opus, given the URL grep and claim-trace table as item 1. **Dial:** P1. **Check:** a claim-trace table in the report, one row per new sentence, giving source card/entry/archive line.

### 5. RETIRE / FOLD  [T2]
Files: the KB, the S1 RETIRED file, list.js and shortcuts (S2), counterReach and list tests.
- **Done means:** Given the migration dry-run, when it runs, then it reports exactly the D4-chosen retired slugs (3 or 4) in RETIRED (curated list) and none in RETIRED_GENERATED. Then `grep -rn` over server/ and the prompts for each slug shows 0 hits outside RETIRED and tests. pretzel_bread's asked_as reach buns_rolls. CULINARY_AIM_PENDING is empty, so the lint runs corpus-wide.
- **Out of scope:** new cards. **Ship bar:** an essential retired; a shortcut pointing at a deleted id.
- **Route:** dv T2 (fallback forge@opus); critic@opus. **Dial:** P1. **Check:** the S2 reference count before = moved + deleted after.

### 6. Release, then live read-back  [main + qa]
After the last critic:
1. `cd server && npm test` and `node scripts/commitGuard.js` from the repo root.
2. `node scripts/migrateCounterCards.js --dry-run`, diffing KB versus table first.
3. `node scripts/migrateCounterCards.js`.
4. Commit "… Migrated.", then `git -c credential.helper='!gh auth git-credential' push origin main:held`.
5. Four-step verify.
6. Update the CLAUDE.md corpus count, re-counted, never carried forward.

QA: qa@sonnet reads `counter_cards` back.
- **Done means:** the row count equals the KB card count. The retired slugs return 0 rows. 10 sampled rewrite decisions are byte-equal to the KB. Findings ≤8.
- **Route:** main, then qa@sonnet. **Check:** the post-upsert count line.

### 7. iOS wall CardFan + App Store shots  [ui]
Change the CardFan front card (S5 path) per D7. Copy only, so no image source and art law is not engaged. Design direction: unchanged CardFan styling, Oat `#E9E2D0` ground, `#FAF7EF` card, Fraunces eyebrow. **Anti-slop:** no new chrome, no gold fill.
- **Done means:** a rendered simulator screenshot shows the D7 eyebrow and title, and `runners_compile.sh` passes. Do not run the full UI suite (attach budget).
- **Ship bar:** the old title still visible anywhere.
- **Shots:** re-shoot only the S6-named shots, after the migration and before the next submission. They are Devon's to approve.
- **Route:** forge@opus [T2, ui]; critic@opus with the screenshot. **Dial:** P1.

### Dispatch prompts
Specs `.pipeline/specs/chf-{1,3a,3b,4a,4b,4c,5}.md` are written after S1-S6 return. The `## Contract` dependents come only from S2.
- **Each Codex piece:** `dv check <spec>` → PASS; `dv route T2 --plan docs/plans/card-health-first-plan.md`; `dv build <spec>` in the background; then critic@opus: "[T2] runId <id>, SPEC <spec>, FIDELITY required. Item 1: grep every changed sources URL against the archives; claim-trace table. Report ≤30 lines."
- **Fallback:** forge@opus [T2], `SPEC <spec>`.
- Known anchor: `ANCHOR server/kristy_perimeter_kb.json:476` `"decision": "80/20 for burgers. 90/10 for anything you drain.",` (the others come from S2).
- **Verify (every piece):** `cd server && npm test` (last 2440/0, admin run, 88d030f); `node server/scripts/listMatchProbe.js` → 0 wrong; `node server/scripts/commitGuard.js` → clean; `cd server && node scripts/migrateCounterCards.js --dry-run` → the batch ids are placed.

## What broken looks like
- Ground beef still says burgers. Or "ground beef" asked on the counter lands on a miss or on beef_grassfed.
- A card says "healthier", or cites a URL with no scrape file.
- A retired slug still answers on iOS. The CardFan still reads "lean ratios".
- A cooking question that used to find a food card now misses.

## Risks
- **Sourcing stalls the pack rows.** Early check: the Piece 2 SATISFIABLE count before 4a is specced. NOT rows fall back to TRIM, never to an invented source.
- **KB conflict with the corpus branch, or the held stack.** Early check: S6 before Piece 3. If the corpus branch touches the KB, rebase onto it first.
