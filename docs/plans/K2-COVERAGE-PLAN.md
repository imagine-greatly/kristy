# K2 — Whole-store counter coverage + in-aisle readability (Track K)

Drafted 2026-10-06 by the planner on branch `corpus` (`dacf56f`).
Amended 2026-10-06 after Devon approved the plan with all recommendations plus six changes. **Nothing here is built or migrated.**

Over the 80-line budget because the dispatch asks for a baseline, a universe and a standard.

**Problem.** A shopper types an everyday food word ("sauerkraut", "sour cream", "bone broth", "meat") and gets nothing. Where a card does exist, it is not always readable in the five seconds a shopper spends at a case.

**Need.** Every food in the store lands on something that says which one to reach for, in words a shopper takes in at a glance. Junk, branded and non-food rows are carried with no coaching.

## Measured inputs

- **KB at `dacf56f`:** 131 entries, 109 cards and 22 picks (`kristy_perimeter_kb.json`). The live table is 113 rows after K1: 109 curated and 4 generated. That figure is from the session note; I did not select it.
- **`counter_gaps` export:** 3,034 rows.
  - About 2,890 are fixtures (the 7 FIXTURE_HINTS) or a UI-test burst: 40 rows of "wild salmon fillets", 2026-10-05 21:45–22:52 UTC.
  - About 84 rows are real demand, mostly from 2026-08-05. Demand breaks ties only.
  - Real food asks still uncovered: cantaloupe and pineapple (weak matches), "meat" ×2, the head nouns "fillets" and "pork chops … pack", kombucha 3, fermented food, goat, guanciale.
  - Brand and junk rows (doritos, oreos, nutella, fairlife, diet soda) stay carried by ruling 2.
- **Rules that shape the plan.**
  - `counterCardLint.js` already caps the headline at 12 words, the do line at 14 and `instead` at one sentence.
  - It fails a hedged headline, antithesis tics, false mechanisms and pick lines over the cap.
  - It requires one alias of ≤2 words on every card. That forces the broad-card alias shape described under the universe.

## Dairy and fermented today (Devon: "we already have dairy, don't we?") — yes

- **Dairy cards (12).** These already exist:
  - grass-fed butter
  - whole vs reduced-fat milk
  - A2 vs A1 milk
  - real vs processed cheese
  - plain vs flavoured yogurt
  - live cultures in yogurt
  - raw milk
  - milk processing
  - cream vs creamer
  - raw kefir
  - raw aged cheese
  - oat milk
- **Dairy picks:** the `milk` pick.
- **Eggs (6 cards):** labels, shell colour, freshness, grades and sizes, feed claims, storage.
- **Fermented today:** only yogurt live cultures, raw kefir, raw aged cheese and sourdough are cards. `gen_live_fermented_foods` is a generated table row; the list matcher reads the KB file and never sees it.
- **Not covered yet:** kombucha, sauerkraut, kimchi, miso, tempeh, natto, fermented pickles, raw cider vinegar.
- **What K19 (dairy) adds:** only the dairy case's uncovered items.
  - New cards: plain pasteurised kefir, sour cream, cream cheese, cottage cheese, ice cream, ghee, goat and sheep dairy, almond milk, soy milk, coconut milk (carton), plant butter.
  - New alias: "ultrafiltered milk" on milk processing. No brand alias.
- **What K20 (fermented) adds:** the eight fermented subjects listed above, plus the fermented broad card.

## Universe: the whole store's food (195 items; planner tally, unweighted)

**Mechanisms:** C = card, P = pick, A = alias on an existing card. Every section build also carries its broad card (see below).
The covered counts are my reading of the KB. K2-0 re-measures them with the matcher.

| Section (stance order) | Covered | Uncovered → mechanism |
| --- | --- | --- |
| Produce | 37/42 | mushrooms C, green beans P, winter squash P, ginger+turmeric root P, microgreens P; also a pineapple weak alias A and the cantaloupe ask A |
| Meat | 16/26 | ham C, turkey bacon C, cured pork C, lamb+goat C (folds gen_goat, supersedes the lamb pick), organ meats C, bison C, venison+game C, duck C, jerky P, soup bones P; also the head noun "pork chops" A |
| Seafood | 6/14 | white fish C, crab C, scallops C, mussels+clams+oysters C, lobster P, smoked salmon C, fish sticks P, anchovies A; also "fillets" A |
| Eggs | 1/4 | duck eggs C, quail eggs P, carton egg whites P |
| Bread & grains | 12/21 | sprouted-grain bread C, sprouted grains C, specialty flours C, gluten-free bread C, buns+rolls C, english muffins P, pita+naan P, pastries+muffins C, granola+muesli C |
| Dairy | 12/24 | the 12 listed above |
| Fermented | 0/8 | kombucha C, sauerkraut C, kimchi C, miso C, tempeh C, natto P, fermented pickles C, raw cider vinegar C |
| Pantry | 12/37 | bone broth+stock C, salt C, sugars+sweeteners C, maple syrup C, cooking oils C, lard+tallow C, seeds C, dried fruit C, cocoa+cacao C, nutritional yeast P, canned coconut milk C, dried herbs A, tea C, vinegar P, pasta sauce C, jam C, ketchup+mustard C, mayo C, hot+soy sauce P, canned soup C, olives C, seaweed P, baking soda+powder P, salsa C, coconut water P |
| Snacks | 0/7 | crackers C, tortilla chips C, potato chips C, popcorn C, snack pretzels C, snack bars C, trail mix A |
| Frozen | 3/8 | frozen pizza C, frozen meals C, fries P, waffles P, nuggets P |
| Deli & prepared | 0/4 | hummus C, deli salads P, prepared meals C, fresh pasta P |
| **Total** | **99/195 ≈ 51% (unmeasured)** | **target 195/195 coached; 96 subjects across 11 builds** |

**Carried, never coached** (outside the denominator; logged as carried, not as gaps):
- every brand row (oreos, doritos, nutella, fairlife, …)
- soda, diet soda, energy drinks, sports drinks, candy, cookies, chocolate-hazelnut spread
- alcohol, infant formula, baby food, supplements
- non-food

**Completeness check.** K2-0 maps the BLS CPI-U food-at-home strata onto this table. Any stratum with no item and no carried class becomes a new row; nothing is weighted from memory.

**Broad cards (9): meat, seafood, bread, dairy, fermented, condiments, snacks, frozen, deli.** Each one is filed in its section's build.
- **Matching.** A broad card owns `which <noun> should i buy` (the bare-noun fallback in `scorePool`) plus 3+ `asked_as`. Lint requires one alias of ≤2 words, so that alias is a section phrase ("meat case", "fish counter", "bread aisle", "dairy case", "fermented foods", "condiments", "snack aisle", "frozen aisle", "deli counter"). It is never a bare noun that sits inside another card's alias.
- **Content.** It teaches how to read that section's labels, traced to the archive, and its decision names the next specific question in words. Routing is text only (ruled).
- **Filing.** Everything files in the existing six sections (ruled). Fermented, snacks, condiments and deli go to `bulk_pantry`; dairy-based items go to `dairy`.

**Folds.** The generated rows live only in the table; scout 1 selects them live before K15, K18 and K20.
- `gen_choosing_a_real_cereal` → K18. Put it in `RETIRED_GENERATED`, delete the row, move its `asked_as` to `breakfast_cereal`, and grep `counterGenerate.js` for a prompt that teaches it.
- `gen_goat_meat_quality` → K15, lamb+goat card.
- `gen_guanciale_worth_buying` → folds into K15's cured-pork card only if that card answers the same question; otherwise it stays (VERIFYING).
- `gen_live_fermented_foods` → K20, only if its live `decision` restates a K20 card.
- At least one real generated row is always kept.

## The in-aisle readability standard (K3 writes it into VOICE_SPEC.md; K4 lints it)

All numeric thresholds are [PLACEHOLDER] until K4 prints the 109-card distribution.

| # | Bar | Check |
| --- | --- | --- |
| R1 | **Lead first.** Headline ≤12 words. Read alone, it tells which one to reach for (VOICE_SPEC cover test). | Lint (existing cap); critic (cover test) |
| R2 | **Five seconds.** Headline + do line ≤26 words together; `short_answer` ≤40 words [PLACEHOLDER]. | Lint |
| R3 | **Short sentences.** Every sentence in `decision`, `short_answer`, `why`, `look_for` and `watch_out` is ≤20 words [PLACEHOLDER]. | Lint: `READ_SENTENCE_LONG` |
| R4 | **One idea per sentence.** At most one `;` or parenthetical per sentence; no em-dash asides (NN6). | Lint: `READ_STACKED` |
| R5 | **Plain words.** A technical term appears only in `detail` and is explained where it appears (VOICE_SPEC). | Critic |
| R6 | **Warmth is specificity.** It names the actual contents, feed or process. No significance claims, no persona, no padding. | Critic (existing `voiceTics` catches part) |
| R7 | **Unchanged law.** Zero first person, the claim lock, no-treatment, no price, no brand criticism. | Existing lints + critic |

**Readability-pass rule (NN6).** Rephrase only; never delete science, a concern or standard ownership.
- `sources`, aliases, `asked_as`, category and `evidence_tier` stay byte-identical.
- No field is emptied, and `watch_out` never gets shorter in items.
- Every number and every named concern in the old text survives in the new text. The acceptance test asserts this, and the critic diffs field by field.

Skipped: a reading-grade formula. Add it if critics keep flagging plain-word misses that R3 and R4 let through.

## Scout first (admin-run; only VERIFIED lines become ANCHORs)

1. Live select of the generated rows: `dv ask --role scout "select slug, headline, decision, use_count from counter_cards where source='generated'" --cd /Users/m1/kristy-corpus`.
2. `dv scout "does matchItemToCard reach the scorePool buying-alias fallback for a bare one-word row" --terms scorePool,matchItemToCard,aliasNamesHead`
3. `dv scout "where is RETIRED_GENERATED defined and which test enforces it" --terms RETIRED_GENERATED,RETIRED`
4. `dv scout "can listMatchProbe.js take an external item list; what does it print for a miss" --terms listMatchProbe`
5. `dv scout "build-4 dv spec, sources agent and critic prompt paths to mirror" --terms build4,sourdough`
6. `dv scout "would a snack 'pretzels' row be vetoed or stolen by the TYPES pretzel group" --terms TYPES,typeContradicts`
7. `dv scout "how lintCard is called pre-persist and whether any lint level other than fail exists" --terms lintCard,voiceTics`
8. `dv scout "does any test bound KB categories or ESSENTIALS order per section" --terms ESSENTIALS,SECTION_BY_CATEGORY`

## Shared blocks (referenced by the steps below)

**PASS (readability pass slice).**
- **Files:** `server/kristy_perimeter_kb.json`, `docs/do-lines-review.md`, `server/lib/doLines.json` (via `scripts/buildDoLines.js`). The acceptance test is `server/test/acceptance/k<n>.test.js`.
- **Done means:**
  - Given each slug in the slice, when `readability(card)` and `lintCard(card)` run, then both return [].
  - Given the old and new card, then the NN6 pass rule above holds (asserted).
  - Given the probe, then 0 wrong and every match is unchanged.
- **Out of scope:** new facts, aliases, cards outside the slice.
- **OK rough edges:** a do line left as-is when it already passes.
- **Ship bar:** any deleted concern or number, any changed source, any NN2/3/6/8/9 breach, any R5/R6 failure the critic names with the field quoted.
- **Route:** `dv T2` → `dv build .pipeline/specs/K<n>.md` (Codex Sol high; fallback forge@opus [T2]); critic@opus with `FIDELITY required` + R1–R7.
- **Dial:** P1.
- **Independent check:** the `readability()` finding count for the slice drops to 0, with the before count recorded in the spec.

**BUILD (section build).** Each build has two pieces: **a** = sources, **b** = cards.
- **a (sources).**
  - **Files:** `docs/sources/k<n>/`.
  - **Done means:** ≥2 archived sources per subject, ≥1 regulatory or extension source, URL + fetch date on line 1, verbatim quotes.
  - **Fetching:** Firecrawl/scrapling. `.gov` returns 403, so federal text comes from govinfo.gov or law.cornell.edu. CFR section numbers are fetched, never recalled.
  - A subject with <2 sources leaves the build.
  - **Route:** researcher@sonnet [T1], mirroring `ec71c7f`.
  - **Parallel-safe:** yes, with the previous step (disjoint directory; max 2 at once).
- **b (cards).**
  - **Files:** same three as PASS.
  - **Done means:**
    - Given each subject's bare noun as a list row, then it matches the intended id.
    - Given each of 3+ `asked_as`, then the card is top.
    - Given a collision list of longer phrases that contain each new noun (e.g. "fish sauce", "chocolate chips", "olive oil", "bread crumbs"), then each keeps its prior match.
    - Given every cited URL, then `grep -F` hits line 1 in `docs/sources/k<n>/`.
    - Given `lintCard` + `readability`, then 0 findings.
    - Given the broad card, then its only ≤2-word alias is its section phrase.
  - **Out of scope:** migration (every commit ends with "Not migrated"), new categories, iOS, brand aliases.
  - **OK rough edges:** an empty `watch_out` where the archive holds none (listed); `TIER_NOTE_ORPHANED` known gaps.
  - **Ship bar:** any steal, uncited URL, NN2/3/6/8/9 breach, R1–R7 failure, or brand word anywhere in the card.
  - **Route:** `dv T2` → `dv build .pipeline/specs/K<n>.md` (Codex Sol high; fallback forge@opus [T2]); critic@opus `FIDELITY required` + R1–R7.
  - **Parallel-safe:** no; the KB is serial.
  - **Dial:** P1.
  - **Independent check:** the cited-URL grep count (build 4: 37/37) and the universe probe's per-section rise.
- **Verification (every PASS and BUILD b, verbatim):**
  ```
  cd server && npm test                                          → prior + new pass, 0 fail
  node server/scripts/listMatchProbe.js                          → 0 wrong
  cd server && node scripts/migrateCounterCards.js --dry-run     → card count = prior (+ new); every sentence placed
  cd server && node --test test/counterReach.test.js test/counterFloor.test.js → 0 fail
  node server/scripts/listMatchProbe.js --universe docs/coverage/universe.json → per-section covered counts
  node server/scripts/commitGuard.js                             → clean
  ```
- **Dispatch (PASS and BUILD b).** After approval the planner writes `.pipeline/specs/K<n>.md` from `templates/spec.md`, with ANCHORs from scout 5 and the acceptance block verbatim. Then:
  1. `dv check .pipeline/specs/K<n>.md` → PASS.
  2. `dv route T2 --plan docs/plans/K2-COVERAGE-PLAN.md`.
  3. codex → `dv build` in the background, then `dv ask --role critic` with the runId, the spec and `FIDELITY required`.
  4. claude → forge@opus [T2] `SPEC .pipeline/specs/K<n>.md`, Report ≤30 lines.

## Track K, in run order

- **K2-0 Measure.**
  - **What:** extend `listMatchProbe.js` with `--universe` (covered/total per section), add `docs/coverage/universe.json` (195 rows with mechanism marks), and add "wild salmon fillets" to FIXTURE_HINTS plus a CARRIED_HINTS list to `server/scripts/compileGapBacklog.js`. Then fetch the BLS strata to `docs/sources/k2/`.
  - **Done means:**
    - Given the universe, then the probe prints 11 section lines + a total and exits 0 with 0 wrong.
    - Given the BLS archive, then every stratum maps to a row or a carried class.
  - **Ship bar:** the total differs from 99 with no per-item diff printed.
  - **Route:** script `dv T1` (fallback forge@sonnet [T1]), critic@sonnet. Fetch: researcher@sonnet [T1].
  - **Parallel-safe:** yes, the two halves.
  - **Dial:** P2 (the BLS fetch is an external unknown).
- **K3 Standard.** Add R1–R7 and the pass rule as a "Readable in the aisle" section of `VOICE_SPEC.md`, verbatim from this plan.
  - **Done means:** Given VOICE_SPEC, then the section exists and every lint code named in it exists in K4.
  - **Route:** main [T0] (one prose file).
- **K4 Readability lint.**
  - **What:** add `readability(card)` (R2–R4 codes) and its tests to `server/lib/counterCardLint.js` and `server/lib/counterCardLint.test.js`. It is not wired into `lintCard` yet.
  - **Done means:**
    - Given fixtures, then each code fires and clears.
    - Given the 109 cards, then a printed per-code count is recorded in the step report and the thresholds are set from it.
  - **Ship bar:** a code fires on a sentence under its threshold.
  - **Route:** `dv T2` (fallback forge@opus [T2]); critic@opus.
  - **Dial:** P1.
- **K5–K12 Readability pass (PASS block), in stance order.** 109 cards, each slice ≤17:

  | Step | Slice | Cards |
  | --- | --- | --- |
  | K5 | produce, KB order 1–17 | 17 |
  | K6 | produce 18–22 + seafood | 14 |
  | K7 | beef, pork, deli, meat_counter | 12 |
  | K8 | poultry + eggs | 13 |
  | K9 | bread & grains (sandwich_bread, sourdough, pretzel_bread, bagels, tortillas, breakfast_cereal, pasta_dry, oats, rice_arsenic, grains_beyond_rice, flour_basics) | 11 |
  | K10 | dairy | 12 |
  | K11 | the other 11 bulk_pantry + label_terms 1–6 | 17 |
  | K12 | label_terms 7–19 | 13 |

  The pass runs before the builds so builders copy readable exemplars, and so K13 can make the bar fail-level for every new card.
- **K13 Gate.** Wire `readability()` into `lintCard`.
  - **Done means:** `npm test` passes with 0 fail across all 109 cards.
  - **Route:** main [T0] (one call site).
- **K14 Produce & eggs (BUILD, 10).** mushrooms, green beans, winter squash, ginger+turmeric, microgreens, duck eggs, quail eggs, egg whites; plus the pineapple alias and the cantaloupe ask.
- **K15 Meat (BUILD, 12).** The 10 meat subjects, plus the "pork chops" head noun and the broad **meat** card. Folds goat; folds guanciale per scout 1.
- **K16 Seafood (BUILD, 10).** The 8 seafood subjects, plus "fillets" and the broad **seafood** card.
- **K17 thinNotes.** Rewrite the meat (`server/lib/perimeter.js:332`) and seafood (`:345`) thinNotes to name only what is still uncovered, or `null`.
  - **Route:** forge@sonnet [T1]; critic@sonnet.
  - **Verify:** `cd server && npm test` → 0 fail.
  - **ANCHOR server/lib/perimeter.js:330**
    ```
          { q: 'Is this one any good?', id: 'judging_meat_at_the_case' },
        ],
        thinNote: 'Beef, chicken, pork and the deli case. Lamb, goat and game are not covered yet.',
    ```
  - **ANCHOR server/lib/perimeter.js:343**
    ```
          { q: 'Is it fresh?', id: 'fish_freshness_at_counter' },
        ],
        thinNote: 'Salmon, tuna, shrimp, sardines, the frozen case and the seals. Crab, lobster and the shellfish bar are not covered yet.',
    ```
- **K18 Bread & grains (BUILD, 11).** The 9 subjects, plus the broad **bread** card and the cereal fold.
- **K19 Dairy (BUILD, 12).** As stated in the dairy section above. Ghee follows the whole-food-fat rule. Plant butter carries no hydrogenated-oil alias and no claim beyond the archive.
- **K20 Fermented (BUILD, 9).** The 8 subjects + the broad **fermented** card; live_fermented fold per scout 1.
- **K21 Pantry I: fats, sweeteners, staples (BUILD, 13).** broth, salt, sugars, maple, cooking oils, lard+tallow, seeds, dried fruit, cocoa, nutritional yeast, canned coconut milk, dried herbs, tea.
- **K22 Pantry II: sauces & cans (BUILD, 13).** vinegar, pasta sauce, jam, ketchup+mustard, mayo, hot+soy sauce, canned soup, olives, seaweed, baking soda+powder, salsa, coconut water, plus the broad **condiments** card.
- **K23 Snacks & deli (BUILD, 13).** The 7 snack items + the broad **snacks** card, the 4 deli items + the broad **deli** card.
- **K24 Frozen (BUILD, 6).** pizza, meals, fries, waffles, nuggets + the broad **frozen** card.
- **K25 Close.** Run the universe probe.
  - **Done means:** 195/195 and 0 wrong; any residue becomes the next plan's first pieces.
  - **Route:** main [T0].

## What broken looks like

- "ground beef", "lunch meat", "fish sauce" or "chocolate chips" lands on a broad or new card.
- "olive oil" leaves `olive_oil_grades`.
- A readability edit drops a concern, a number or a source.
- A headline reads well but no longer says which one to reach for.
- Any brand word appears in a card or alias.
- A carried row (soda, dish soap) draws a card or a do line.
- A cooking-oil, sweetener or plant-butter card states a bodily effect.

## Risks

1. **Short-alias collisions** grow through the center store (oil, sauce, chips, milk, fish, bread). *Early check:* every b-piece's collision list; K15 is the first to run one, on a broad card.
2. **The readability pass sheds substance** while the copy reads better. *Early check:* K5's acceptance test fails on any lost number or concern, and the critic diffs K5 field by field before K6 is dispatched.

## Open question (Devon only, new)

1. **The junk line.** The plan carries soda, diet soda, energy drinks, sports drinks, candy, cookies and chocolate-hazelnut spread with no coaching. It still coaches chips, crackers, popcorn, frozen pizza, frozen meals and ice cream, because the label separates a whole-food version there. Is that the right line?
