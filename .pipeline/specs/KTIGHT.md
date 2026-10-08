# KTIGHT — Concise cards: `pick_steps` + `science` on all 202 cards (additive, Not migrated)

```json
{
  "id": "KTIGHT",
  "tier": "T2",
  "ui": false,
  "owns": ["server/lib/counterCardLint.js", "server/test/acceptance/ktight-l.test.js", "server/test/ktight.test.js",
           "server/kristy_perimeter_kb.json", "docs/ktight/B01.md … docs/ktight/B18.md"],
  "read_full": ["server/lib/counterClaimLock.js", "server/lib/counterCards.js", "VOICE_SPEC.md"],
  "verify": ["cd server && node --test test/acceptance/ktight-l.test.js", "cd server && node --test test/ktight.test.js",
             "cd server && npm test", "cd server && node scripts/listMatchProbe.js", "cd server && node scripts/migrateCounterCards.js --dry-run"]
}
```

**Problem.** Devon, TestFlight 8: `berries_picking` (the blueberry card) shows 5 look_for + 5 watch_out. Nobody reads ten bullets mid-aisle. **Need:** the whole point, every item covered, in a few shelf-readable steps plus one paragraph of why. **Intent:** the shopper opens a card and reads ≤3 short steps that are the complete pick; "Go deeper" gives one paragraph of science. Nothing is deleted. Source: `~/.claude/handoffs/kristy-corpus.md:200-220`.

**Non-goals.** No server route/projection/SQL/iOS change (plan session). No edit to `buying_tips`/`watch_out`/`detail`/any existing field. Picks (31, `kind: 'pick'`) get nothing. Main-repo cards, the banana redirect sweep, migration: out. Not wired into `lintCard` (generated cards would fail presence).

**Scout first** (admin-run, before L1):
- `dv scout "Which tests deepEqual, hash or freeze whole KB entries or their key sets (K6 fixture mirror, k14 C11, any Object.keys(entry) allowlist)? file:line" --terms Object.keys,deepEqual,fixture` — any hit is added to L2's owns; L2 excludes `pick_steps`/`science` from that comparison, once, so no batch touches it.
- `dv scout "Does counterClaimLock.js import counterCardLint.js or counterCards.js (cycle risk)?" --terms import`

## Field contract
- `pick_steps: string[]`, 1–3 items. Each one line, ends in `.`, target ≤12 words, **hard cap 14** (= `MAX_DO_WORDS`, the existing bar for a line read at the shelf; 2 words of headroom so a 13-word line is not churned).
- `science: string`, one paragraph, no newline, no list marker, target ≤60 words, **hard cap 70**; every sentence ≤ `SENTENCE_MAX` (20) via `readability()`.
- Placement in the entry: directly after `watch_out`; if none, after `buying_tips`; if neither, after `detail`.
- Scope: the 202 question entries (`questionEntries()`); 233 KB entries − 31 picks.
- **Coverage rule.** A card's points = `projectEntry(entry).look_for ∪ watch_out` (what the shopper sees today). Each point lands in a step, in `science`, or is logged depth-only in the batch ledger with one reason from {variant-specific, duplicate of another point, after-purchase/kitchen, label nuance}. ≤2 depth-only per card.
- **Trace rule.** Every clause traces to that card's own fields (cited as `bt<n>`, `w<n>`, `D`, `SA`, `WHY`, `TN`, `LD:<term>`). An archived `docs/sources/**` line may sharpen wording of an existing point, never add one. Every digit in the new text already appears in the entry's other prose (lint-enforced).
- Steps may extend the do line (`server/lib/doLines.json`), never copy it.
- **Free (Ruling F), confirmed:** corpus side strips nothing. `summarize()`/`forViewer()` (`counterCards.js:530-539`) remove only `teaser`/`locked`; `DEPTH_FIELDS` is lint metadata, not a filter. Do NOT add the fields to `DEPTH_FIELDS`.
- **For the plan session:** the fields will not reach the wire as built. `projectEntry` (`counterCards.js:342-423`) returns an explicit object without them; `CARD_COLUMNS` (:601-608) does not select them; `counter_cards` has no columns. Their work, in order: (1) SQL `pick_steps jsonb not null default '[]'`, `science text`, applied live (`schemaContract.test.js`); (2) passthrough in `projectEntry` + `CARD_COLUMNS`; (3) iOS decode/render; (4) then migrate. (2) before (1) makes the upsert fail. Until then, corpus dry-run shows no card diff from KTIGHT. That is expected.

## Worked example: `berries_picking` (KB :3439; owns the `blueberries` alias, :3445; no separate blueberry card)
Do line: "Flip the container and check for juice stains or fuzz." Insert after `watch_out` (:3496):
```json
"pick_steps": [
  "Take a cold carton with no fog inside the plastic.",
  "Flip it: dry, unstained bottom, no fuzzy spot on any berry.",
  "Buy them ready: deep, even color and no sweet, fermented smell."
],
"science": "Berries do not ripen after picking, so what is in the carton is what you are buying. The bottom layer carries the weight, condensation keeps it damp, and mold spreads berry to berry by contact. Re-stacked clamshells can hide older fruit under a fresh top layer, so the underside is the check."
```
| Line | Words | Traces to |
| --- | --- | --- |
| S1 | 10 | bt5 "Buy them cold, from the refrigerated display"; w2 "Condensation fogging the plastic" |
| S2 | 11 | bt1 "A dry, unstained bottom"; w5 "Juice stains on the bottom"; bt2 "No fuzzy white or gray spot on any berry"; w3 (why flipping: Sc3) |
| S3 | 11 | w1 "do not ripen after picking"; D "no reason to buy firm and wait"; bt4 "Deep, even color"; w4 "smells sweet or fermented" |
| Sc1 | 17 | w1; D "what is in the carton is exactly what you are buying" |
| Sc2 | 18 | WHY "under their own weight"; D "the bottom layer carries the load, condensation … keeps that layer damp, and mold spreads berry to berry by contact" |
| Sc3 | 17 | D "Clamshells also get re-stacked … fresh-looking top layer"; w3; TN "why the underside is the check" |
Depth-only (2): bt3 green caps (variant-specific: strawberries); bt4 "uniform size" (duplicate of the color check). Science 52 words.

## Pieces (sequential; one KB file; nothing parallel-safe)
**L1 — lint.** Owns `server/lib/counterCardLint.js`, `server/test/acceptance/ktight-l.test.js` [new-file]. Route: forge@opus [T2]; critic `dv ask --role critic --tier T2`. Dial P1. Parallel-safe: no.
Change: add `export const MAX_STEP_WORDS = 14`, `MAX_SCIENCE_WORDS = 70`, `export function lintPickSteps(entry)`. It returns `[]` when neither field is present (the ledger handles presence). Codes: `STEPS_SHAPE` (not string[] or length ∉1..3), `STEPS_EMPTY`, `STEPS_TOO_LONG` (`words()`>14), `STEPS_NOT_CLOSED` (no final `.` or any `?`), `STEPS_COPIES_DO` (`norm(step)===norm(doLines[id])`), `SCIENCE_SHAPE` (not a non-empty string), `SCIENCE_NOT_PARAGRAPH` (`\n` or `^\s*([-•*]|\d+[.)])\s`), `SCIENCE_TOO_LONG` (>70), `KT_FIRST_PERSON` (the `lintPick` regex at :947, extracted to one shared helper, `lintPick` keeps its code), `KT_EM_DASH` (`—`), `KT_NEW_NUMBER` (a `\d+` run absent from JSON of the entry minus the two fields), `KT_REDIRECT` (`/\b(spend|save|put)\b[^.]{0,40}\b(money|budget)\b/i` or `/\b(money|budget)\b[^.]{0,30}\b(elsewhere|instead|toward|towards)\b/i`), `KT_CLAIM_<ID>` (`claimLockViolations({look_for: steps, detail: science})`: treatment/detox/dosing/restriction/safety/medical/price/first person), `COPY_BRITISH`, `COPY_STRAIGHT_QUOTE` (reuse existing). Also add `'pick_steps','science'` to `READ_FIELDS` (:1348) and to `PICK_FORBIDDEN_FIELDS` (:822).
- Done means: Given a fixture with each defect, When `lintPickSteps` runs, Then exactly that code fires (C1–C14, one test per code). Given the berries example above, Then `[]` and readability has no pick_steps/science finding (C15). Given a pick carrying `pick_steps`, Then `lintPick` fires its forbidden-field code (C16). Given no new fields, Then `[]` (C17). `npm test` = 2393 + new, 0 fail.
- Out of scope: KB edits, `lintCard` wiring, `counterCards.js`. OK rough edges: the redirect regex catches money redirects only, not "buy X instead". Ship bar: any C fails, or any pre-existing test changes outcome.
- Independent check: C15 is the spec's own example. If it fails, the caps or the regexes are wrong, not the card.

**L2 — ledger ratchet.** Owns `server/test/ktight.test.js` [new-file] + any freeze test scout names. Route: forge@sonnet [T1] (exact spec); critic@opus. Dial P1. Parallel-safe: no.
Change: `BATCHES` = the table below verbatim (id → ids); `const DONE = [];`. Tests: (T1) every id in BATCHES is a question entry; every question entry is in BATCHES **or** carries both fields (new cards born compliant). (T2) every id in a DONE batch has both fields, `lintPickSteps`=[], and readability has 0 findings on those two fields. (T3) every id in a not-DONE batch has neither field (content lands only with its ledger + critic). (T4) any entry with either field passes `lintPickSteps`. (T5) no pick carries either. Guard every collection with `nonEmpty`.
- Done means: green at DONE=[] and red if one card gains `pick_steps` outside DONE (prove with a temporary fixture assertion in the report, not committed). Ship bar: T1 fails (batch table ≠ corpus).
- **Presence-gate choice: ratchet ledger, suite never red.** 18 batches of a red suite would mask every other regression. Presence is total once DONE holds all 18.

**B01–B18 — rewrite batches.** Each owns `server/kristy_perimeter_kb.json` (its cards' two new keys only), the `DONE` line of `server/test/ktight.test.js`, `docs/ktight/Bnn.md` [new-file]. Route: forge@opus [T2]; critic per batch `dv ask --role critic --tier T2`; one fix pass. Dial P1. Run **B06 first** (pilot, holds the worked example verbatim); the rest in order.
- Done means: Given batch Bnn, When `DONE` gains `'Bnn'`, Then T2/T3 pass for its cards. `docs/ktight/Bnn.md` has, per card, the Line | Words | Traces-to table and the depth-only list in the berries format. Every projected look_for/watch_out point is mapped. KB `git diff` shows only `+` lines inside its cards.
- Out of scope: any existing field, aliases, other cards, sources. OK rough edges: steps at 13–14 words; science over 60 but at or under 70; a step that restates part of the do line.
- Ship bar (critic blocks only on): a clause with no trace; a lost point (unmapped and not logged); >2 depth-only on a card; a new concern/claim/number; first person; treatment wording; a price; a brand named negatively; a cross-item redirect; npm/probe/dry-run regression.
- Independent check: `listMatchProbe` output byte-identical to pre-batch (matching untouched); dry-run `unmapped 0` and card count 202.

| Batch | Cards (KB `category`) | n |
| --- | --- | --- |
| B01 | seafood: salmon_wild_vs_farmed, shrimp_imported_vs_domestic, fresh_vs_previously_frozen_fish, mercury_by_fish, fish_freshness_at_counter, canned_fish_choosing, farmed_fish_by_species, seafood_certifications | 8 |
| B02 | seafood: canned_tuna, white_fish, crab, lobster, scallops, clams_mussels_oysters, smoked_salmon, seafood_counter | 8 |
| B03 | beef/pork/meat_counter: beef_grassfed_vs_grainfed, ground_beef_organ_blend, beef_cuts_basics, ground_beef_lean_ratio, beef_grades_usda, dry_brine, pork_cuts_and_enhanced, judging_meat_at_the_case, butcher_counter_asking, lamb_goat, organ_meats, bison, venison_game, meat_case | 14 |
| B04 | poultry/poultry_eggs: rotisserie_chicken, air_chilled_chicken, no_antibiotics_poultry, chicken_cuts_basics, turkey_whole, ground_turkey, chicken_breast, duck_meat, egg_labels, egg_shell_color, egg_freshness, egg_grades_sizes, egg_feed_claims, egg_storage, egg_duck_quail | 15 |
| B05 | deli + deli-case bulk_pantry: deli_meat_uncured, bacon, hot_dogs, ham, turkey_bacon, cured_pork, hummus, deli_salads, prepared_meals, fresh_pasta, deli | 11 |
| B06 | produce (pilot): organic_worth_it_by_type, frozen_vs_fresh_produce, produce_seasonality, precut_produce_tradeoffs, produce_picking_ripeness, produce_ripeness_by_item, berries_picking, strawberries_organic_residue, sprouts_raw, produce_mushrooms, produce_green_beans, produce_stone_fruit | 12 |
| B07 | produce (5 home cards: kitchen steps): freezing_produce, washing_produce, baking_soda_soak, produce_storage, revive_greens, produce_root_vegetables, produce_brassicas, produce_onions_garlic, produce_leafy_greens, produce_peppers, produce_apples_pears, produce_citrus | 12 |
| B08 | dairy: grassfed_butter, whole_vs_reduced_fat_milk, a2_vs_a1_milk, milk_processing, raw_milk, raw_kefir, raw_aged_cheese, cheese_real_vs_processed, yogurt_plain_vs_flavored, yogurt_live_cultures, plain_kefir, cream_vs_creamer | 12 |
| B09 | dairy: sour_cream, cream_cheese, cottage_cheese, ice_cream, ghee, goat_sheep_dairy, oat_milk, almond_milk, soy_milk, coconut_milk_beverage, plant_butter, dairy_case | 12 |
| B10 | label_terms: label_natural, label_made_with_real, label_no_added_hormones, label_nonGMO_vs_organic, label_cage_free, label_grass_fed_term, label_pasture_raised_feed, label_organic_scope, label_wild_vs_farm_raised, label_third_party_seals | 10 |
| B11 | label_terms: label_multigrain_vs_whole_grain, label_lightly_sweetened, label_no_artificial_flavors, label_front_vs_back, label_ingredient_order, label_cold_pressed_expeller, label_sugar_free_substitutes, label_serving_size, label_artificial_color | 9 |
| B12 | bulk_pantry staples: rice_arsenic, oats_steelcut_rolled_instant, grains_beyond_rice, flour_basics, specialty_flours, sprouted_grains, beans_dried_vs_canned, bean_soak_salt, bulk_bins_buying, nuts_raw_vs_roasted, seeds, rancidity_check, whole_spices, dried_herbs | 14 |
| B13 | bulk_pantry bread/breakfast: sandwich_bread, sourdough, pretzel_bread, bagels, tortillas, sprouted_grain_bread, gluten_free_bread, buns_rolls, pastries_muffins, bread_aisle, breakfast_cereal, muesli, pasta_dry | 13 |
| B14 | bulk_pantry ferments: kombucha, sauerkraut, kimchi, fermented_pickles, raw_cider_vinegar, miso, tempeh, natto, fermented | 9 |
| B15 | bulk_pantry oils/sweet/baking: olive_oil_grades, cooking_oils, lard_tallow, nut_butter_ingredients, honey_adulteration, maple_syrup, sugars, salt, cocoa, baking_soda_powder, nutritional_yeast, dried_fruit, vinegar | 13 |
| B16 | bulk_pantry jars/cans/brews: broth, canned_soup, canned_coconut_milk, pasta_sauce, jam, ketchup_mustard, mayo, hot_soy_sauce, condiments, salsa, olives, seaweed, coffee_beans, tea | 14 |
| B17 | bulk_pantry snacks/drinks: bottled_water_buying, coconut_water, crackers, tortilla_chips, potato_chips, popcorn, pretzels, snack_bars, trail_mix, snacks | 10 |
| B18 | bulk_pantry frozen (K24): frozen_pizza, frozen_meals, frozen_fries, frozen_waffles, frozen_nuggets, frozen | 6 |
Total 202 = 18 batches. K3 seafood (B01/B02) and K5–K24 cards are in their category rows.

## Dispatch prompts
**L1** — forge, model: opus [T2]. ANCHOR server/lib/counterCardLint.js:822
```
export const PICK_FORBIDDEN_FIELDS = new Set([
  'asked_as', 'headline', 'why', 'tier_note', 'look_for', 'watch_out', 'detail',
  'kristy_take', 'labels_decoded', 'cart_pick', 'short_answer', 'buying_tips', 'question',
```
ANCHOR server/lib/counterCardLint.js:1348
```
const READ_FIELDS = ['decision', 'short_answer', 'why', 'look_for', 'watch_out'];
// ponytail: short abbreviation list; extend when a real card splits wrong.
const ABBREV = /\b(e\.g|i\.e|vs|oz|lb|lbs|etc|approx|U\.S)\./gi;
```
ANCHOR server/lib/counterCardLint.js:945
```
    // Zero first person (VOICE_SPEC). `I` is case-sensitive so "i" inside nothing trips;
    // `us` is lowercase-only so a country of origin ("US grown") does not read as a pronoun.
    if (/\bI\b/.test(line) || /\b(me|my|mine|we|our|ours)\b/i.test(line) || /\bus\b/.test(line)) {
```
ANCHOR [new-file] server/test/acceptance/ktight-l.test.js. Change: the L1 block of .pipeline/specs/KTIGHT.md, old (no lintPickSteps) → new (codes as listed). Verify: `cd server && node --test test/acceptance/ktight-l.test.js` → all pass; `cd server && npm test` → 2393+N pass, 0 fail. Commit `wip:`, "Not migrated." Report ≤30 lines.

**L2** — forge, model: sonnet [T1]. ANCHOR [new-file] server/test/ktight.test.js. Change: the L2 block and batch table of KTIGHT.md, verbatim. Verify: `cd server && node --test test/ktight.test.js` → pass at DONE=[]; `cd server && npm test` → 0 fail. Report ≤30 lines.

**Bnn** — forge, model: opus [T2]. Admin first runs `grep -n '^      "id": "' server/kristy_perimeter_kb.json` and pastes the batch's lines as ANCHORs, each with its next 3 KB lines verbatim. Template ANCHOR (B06) server/kristy_perimeter_kb.json:3494
```
        "A carton that already smells sweet or fermented is past it.",
        "Juice stains on the bottom of the container mean crushed or moldy berries inside."
      ],
```
Change: for each card in the Bnn row, insert `pick_steps` and `science` per the Field contract (B06: the berries block verbatim); write docs/ktight/Bnn.md; `DONE` += 'Bnn'. Reads: this spec, VOICE_SPEC.md, its cards' KB ranges, doLines.json, docs/sources/** only to sharpen wording. Pre: `cd server && node scripts/listMatchProbe.js > "$TMPDIR/probe-pre.txt"`. Verify: `cd server && node --test test/ktight.test.js && npm test` → 0 fail; `node scripts/listMatchProbe.js | diff - "$TMPDIR/probe-pre.txt"` → empty; `node scripts/migrateCounterCards.js --dry-run` → unmapped 0, 202 curated, nothing written. Commit `wip: KTIGHT Bnn`, "Not migrated." Report ≤30 lines.

**Critic (each Bnn)** — `dv ask --role critic --tier T2`: judge docs/ktight/Bnn.md + KB diff against the Bnn Ship bar only. Nits → ship notes.

## What broken looks like
Steps that read as a shortened copy of look_for while watch_out points silently drop out. A science paragraph with a number or concern the card never held. `DONE` gaining a batch while ledger rows are missing. Suite count falling (a test skipped, not passed).

## Risks
1. A freeze test (K6 mirror) goes red on the first batch → Scout first q1; L2 excludes the two keys once.
2. Forge "improves" claims while compressing → the trace table plus `KT_NEW_NUMBER`. The critic's first check is any clause with no cited field.

## Defaults taken (no blocking question for Devon)
Caps 14/70 hard, 12/60 target. Picks excluded. Home cards get kitchen steps. Up to 2 depth-only points per card. Ratchet, not a red suite. Do-line overlap allowed, verbatim copy not. Blueberries = `berries_picking`.
