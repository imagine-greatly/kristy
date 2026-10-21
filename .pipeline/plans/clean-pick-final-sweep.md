# PLAN: clean-pick final sweep (B13 close-out + full stance sweep + potato), rev 2

**Basis:** Devon 2026-10-21, "go, do a full sweep on the cards while we're at it". Parent `docs/CLEAN-PICK-PLAN.md`: its Criteria (C1–C10, C4b, C5b, C14–C20) and its Common route/owns/verify all bind here; the stance in `docs/DECISIONS.md` wins any conflict.
**State:**
- The KB holds 219 entries: 181 cards + 38 picks.
- **P1 shipped at de82e05.** Its flags (`.pipeline/plans/clean-pick-sweep-flags.md`) freeze 95 entries and flag 124 on a code other than M8. M8 (sources not archived) flags 145 and stays report-only.
- Re-measure the suite count at each base. **Corpus NOT migrated** (classifier-blocked); migration is a separate step at the end.

**Caps:** each batch costs 1 dv build (ChatGPT plan) + 1 critic@opus (Claude Max). P2 spends Firecrawl quota.
**Order:** strictly serial, because everything shares one KB file (`server/kristy_perimeter_kb.json`): Step 0 → P1b → G0 → J1…J9 → QA → migration. P2 writes only `docs/sources/`, so it runs alongside Step 0 and P1b.

## R7 answer and B13
- A pick renders `decision` (≤16 words, counterCardLint.js:813) plus an optional `avoid` line (≤12 words, :815). All card fields are forbidden on a pick (:830).
- The server serves `avoid` as `pickAvoid` on list rows (listMatch.js:411) and as `pick.avoid` on scan (routes/scan.js:82).
- **B13 is built server-side.** `pick_corn`, `pick_tofu`, `pick_juice` and `pick_cucumbers` carry `avoid`, pinned by `server/lib/pickAvoid.test.js`.
- **Open:** does iOS render `pickAvoid` (Q2)? If not, that is an iOS piece and goes to Devon.

## Scout (admin-run)
- **Q2:** `dv ask --role scout "In kristy-ios, does any view render pickAvoid on a list row or pick.avoid on scan? Quote file:line." --cd /Users/m1/kristy-ios`
- **Q3:** `dv ask --role scout "List carried lines (waiting on a source) from the B8–B12/SR specs: id, line, S row." --cd /Users/m1/kristy`
- **Q4 (per batch):** `dv scout "Which test files pin decision/cart_pick/buying_tips/watch_out/avoid for <batch ids>?" --terms TWO_LINE,BECAME,RANKED,AVOIDS,doLines`
- **Q5:** `dv ask --role scout "Which local route returns one perimeter entry by id, and where is attachCards called for a list?" --cd /Users/m1/kristy`
- **Mirror:** `server/test/acceptance/cleanPick12.test.js` (avoid and reassurance rows) and `cleanPick8.test.js` (rung and pick rows).

## Step 0. Manual read of flags before any spend (route: main, ~12 KB reads)
**Population:** each `;`-separated non-M8 flag under "Per-id flags" in the flags file, numbered 0…N−1 in file order. The admin counts N.
**Random 5:** for k = 1…5, `index = parseInt(sha256("de82e05:"+k).slice(0,8),16) % N`; on a collision use k+5. Read each against its KB line and mark it TRUE (a real breach) or FALSE.
**Classes:** the planner read all 124 flagged ids and proposes 9 false-positive classes. Step 0 checks each on its example and marks it CONFIRMED or REFUTED. Verdicts go in a `## Step 0` appendix to the flags file.

| X | False-positive rule | Example |
|---|---|---|
| X1 | M3 on "Ask a doctor…" (no-treatment rule 3 requires it) | `kombucha` watch_out[1] |
| X2 | M3 where the ask goes to a baker, monger or processor, or sits on a counter card | `sourdough` buying_tips[3] |
| X3 | M3 on a non-staff "ask" ("ask for planning", "ask three questions of any seal", hub "ask about X") | `label_third_party_seals` |
| X4 | M10 on a label, grade or place term. The planner found no brand among the 32; M10 becomes report-only | `yogurt_plain_vs_flavored` "Greek" |
| X5 | M13 on a string that equals a `CANONICAL_GLOSSES` gloss (the G7 seed-oil list) | `hummus` |
| X6 | M5 when organic is the fallback ("…, else organic"), or on a `label_*` card | `pick_cilantro` |
| X7 | M7 `clean_fifteen`: adding it would be a low-residue reassurance (C19, T7) | `produce_mushrooms` |
| X8 | M1 `tolerance` inside "intolerance" | `goat_sheep_dairy` |
| X9 | M11 when the word is part of the product name | `fresh_pasta` |

**Ship bar:** if 2 or more of the random 5 are FALSE outside X1–X9, the work returns to the planner and no batch is built.

## P1b. Exemptions for the confirmed classes
- **Change:** each CONFIRMED class becomes one exemption in `server/scripts/stanceSweep.js`, then the flags file is re-run at HEAD.
- **Owns:** that script and `.pipeline/plans/clean-pick-sweep-flags.md`. **Verify:** `server/test/acceptance/stanceSweep.test.js`.
- **Done means:**
  - XC1 [test]: a fixture for each confirmed class is unflagged.
  - XC2 [test]: SW-C1–C4 stay green.
  - XC3: every † id below is unflagged and frozen.
- **Route:** `dv T1` (fallback forge@sonnet [T1]), critic@sonnet. P1.

## G0. The natural-fats gloss names butter and ghee (Devon default 1)
- **Change:** `'tallow, olive oil, or coconut oil'` → `'butter, ghee, tallow, olive oil, or coconut oil'`.
- **Where:** counterCardLint.js:1715 (1), the KB (6), `server/test/acceptance/ca-1.test.js` (3) and `server/test/acceptance/twoLinePin.js` (6), per the Grep at aba615b.
- **Four files, past the ≤3 limit:** it is one string; splitting it turns lint red between commits.
- **Done means:** the old string appears 0 times and the new one 16; `lintCorpus` returns []; npm 0 fail.
- **Route:** `dv T1` (fallback forge@sonnet [T1]), critic@sonnet. P1.

## P2. Fetch (admin, no build)
- **Archive with a `url:` line:**
  - the 145 M8 urls and the Q3 carried lines;
  - 7 CFR 205.105 irradiation for `whole_spices`;
  - rBST (S18) for `label_no_added_hormones`;
  - produce coatings for `washing_produce`.
- **Rule:** no line ships before its file exists; it is carried, never cut.

## Judgment batches J1–J9
**Route for every batch:** `dv T2` (fallback forge@opus [T2]); critic@opus, FIDELITY required. Not parallel-safe, P1; each batch builds on the previous ship commit.
**Owns:**
- the batch ids' KB entries;
- their rows in `server/lib/doLines.json` and `docs/do-lines-review.md`;
- the pin overlays from Q4 (more than 3 pin files → split);
- for J2 only, `server/lib/pickAvoid.test.js` (`AVOIDS`).

**Verify:**
- `cd server && npm test`: base + new, 0 fail
- `node scripts/twoLineCheck.js`: 0/181
- `node scripts/listMatchProbe.js`
- `node scripts/commitGuard.js`
- `node scripts/stanceSweep.js --ref HEAD`: 0 non-M8 flags on the batch ids

**Acceptance:** `server/test/acceptance/cleanPickJ<n>.test.js`. Done means C1–C10, C4b, C5b, C14–C20, plus:
- **JC1 [test]:** every frozen id deepEquals base.
- **JC2 [test]:** rows that only add an avoid line or remove reassurance keep `decision` and `cart_pick` byte-equal. Only rows the spec names as rung rows may change them.

**Pinned rows:** the spec names the field, the [DRAFT] line, the concern and the archived url. With no url after P2, the row is carried and the id leaves the batch.
**† marks** ids projected to leave once P1b confirms their class. A batch under 5 ids merges into the next batch in order (max 15).

| Batch | Ids | Pinned and known rows |
|---|---|---|
| J1 Produce (15) | `produce_root_vegetables`, `organic_worth_it_by_type`, `frozen_vs_fresh_produce`, `produce_seasonality`, `berries_picking`, `produce_peppers`, `produce_citrus`, `produce_stone_fruit`, `produce_green_beans`, `washing_produce`, `produce_brassicas`†, `produce_onions_garlic`†, `produce_apples_pears`†, `produce_mushrooms`†, `produce_bananas`† | potato rung row (below); `washing_produce` coatings pinned |
| J2 Picks (15) | `pick_cucumbers`, `pick_canned_tomatoes`, `pick_juice`, `pick_egg_whites`, `pick_asparagus`†, `pick_corn`†, `pick_cilantro`†, `pick_parsley`†, `pick_basil`†, `pick_swiss_chard`†, `pick_mangoes`†, `pick_celery`†, `pick_microgreens`†, `pick_frozen_peas`†, `pick_artificial_sweetener`† | projected at 4, so it merges into J1; `pick_juice` avoid adds BVO (≤12 words); cucumber headline led by "Firm" |
| J3 Meat, poultry (15) | `beef_grassfed_vs_grainfed`, `butcher_counter_asking`, `bacon`, `ham`, `pick_sausage`, `pick_jerky`, `rotisserie_chicken`, `chicken_cuts_basics`, `chicken_breast`, `turkey_whole`, `ground_turkey`, `beef_cuts_basics`†, `pork_cuts_and_enhanced`†, `bison`†, `venison_game`† | pinned: beef "lowest-cost" line (KB:201, :218) becomes a relative, no-cost floor rung (Devon default 2) |
| J4 Seafood (12) | `salmon_wild_vs_farmed`, `shrimp_imported_vs_domestic`, `canned_fish_choosing`, `farmed_fish_by_species`, `white_fish`, `smoked_salmon`, `seafood_counter`, `pick_fish_sticks`, `pick_anchovies`, `seafood_certifications`†, `canned_tuna`†, `clams_mussels_oysters`† | shrimp sulfites; vegetable-oil sentences need a skip word (C20) |
| J5 Dairy, plant milks (14) | `grassfed_butter`, `whole_vs_reduced_fat_milk`, `cheese_real_vs_processed`, `yogurt_plain_vs_flavored`, `cream_vs_creamer`, `ice_cream`, `goat_sheep_dairy`, `plant_butter`, `dairy_case`, `almond_milk`, `soy_milk`, `coconut_milk_beverage`, `oat_milk`, `raw_aged_cheese`† | "saturated fat", "debated" and "contested" lines go (T7) |
| J6 Deli, eggs, frozen (13) | `egg_labels`, `deli_meat_uncured`, `deli_salads`, `prepared_meals`, `frozen_pizza`, `frozen_meals`, `frozen_fries`, `frozen_nuggets`, `frozen_waffles`, `deli`†, `hummus`†, `fresh_pasta`†, `frozen`† | pinned: `egg_labels` "lowest-cost" line (KB:662, :699) becomes a feed-first floor rung (default 2) |
| J7 Pantry, fats (13) | `nuts_raw_vs_roasted`, `honey_adulteration`, `beans_dried_vs_canned`, `bulk_bins_buying`, `cooking_oils`, `lard_tallow`, `cocoa`, `canned_coconut_milk`, `canned_soup`, `raw_cider_vinegar`, `whole_spices`, `maple_syrup`†, `jam`† | `whole_spices` irradiation pinned; "cheap" and "price" go (C4) |
| J8 Bread, grains, drinks (15) | `sandwich_bread`, `bagels`, `gluten_free_bread`, `buns_rolls`, `pastries_muffins`, `breakfast_cereal`, `oats_steelcut_rolled_instant`, `grains_beyond_rice`, `coffee_beans`, `tea`, `sourdough`†, `tortillas`†, `bread_aisle`†, `coconut_water`†, `kombucha`† | oats: organic-first rung |
| J9 Snacks, condiments, labels (15) | `mayo`, `crackers`, `potato_chips`, `popcorn`, `snack_bars`, `snacks`, `label_nonGMO_vs_organic`, `label_organic_scope`, `label_cold_pressed_expeller`, `label_no_added_hormones`, `condiments`†, `tortilla_chips`†, `label_lightly_sweetened`†, `label_third_party_seals`†, `label_artificial_color`† | `label_no_added_hormones` rBST pinned; "pesticide-free" goes (C4) |

**Total:** 124 flagged + 3 pinned = 127 ids in 9 batches. Projected after P1b: 86 ids in 8 batches (J1+J2 = 14).
**Potato (J1, Devon's doubt).** The current headline, "Firm local potatoes and carrots…", leads with a freshness test.
- `decision` [DRAFT]: "Local potatoes labeled grown without sprays, fresh-dug, then organic."
- `why`: the existing tip-0 residue string.
- The firm test stays in `buying_tips[3..]`; `cart_pick` is unchanged.
- **SW-C6 [test]:** `decision` has no "firm" and no "carrots", has "grown without sprays" and "then organic", and equals doLines `headline`.

## QA (last)
- **Route:** qa@sonnet, ≤8 findings, on the local server (`cd server && npm start`, routes from Q5); no iOS UI run.
- **Done means:**
  - A list of potatoes, eggs, shrimp, spices, frozen fries, soda, margarine and corn: every row names a rung, and every `pickAvoid` is ≤12 words.
  - The potato headline matches SW-C6.
  - The final sweep shows 0 non-M8 flags, or each one is a listed carried line.
- Blockers and majors lead the next plan.

## Migration (admin, separate, NOT done)
After QA, `node server/scripts/migrateCounterCards.js` dry-run from `server/` (count + diff), then Devon decides. Picks and section rules never migrate. Every commit says `Not migrated.`

## Rules binding all copy
- Claim lock and no-treatment.
- Zero first person; no em-dash asides; no price or cost wording.
- No brand named; no "organic" in `cart_pick`.
- "Ask" only at a counter or market; government sources are raw fact only.
- Fetch before shipping (C15).
- The sweep is stance-only (Devon default 3); the usefulness review stays a separate pre-launch piece.

## What broken looks like
- A frozen or † id changes, or `decision`/`cart_pick` moves on an avoid or reassurance row.
- One avoid sentence appears on 3 or more cards, or a pick `avoid` has no archived url.
- M8 shrinks by cutting lines instead of fetching sources.
- The potato card calls carrots "fine", a label card gains a rung, or Clean Fifteen reassurance appears.

## Risks
1. **Step 0 refutes a class**, so the † projections fail and the plan grows back toward 9×15. *Check:* the Step 0 appendix comes before P1b; the planner re-cuts on any REFUTED.
2. **Pin cascade across 8–9 serial batches.** *Check:* Q4 per batch; each spec records its base `npm test` count.
