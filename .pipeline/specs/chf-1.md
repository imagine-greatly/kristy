# chf-1 — Health-first lint: CULINARY_AIM + REPEATED_CLAIM + HEALTH_FIRST_PENDING (no card edits, Not migrated)

```json
{
  "id": "chf-1",
  "tier": "T2",
  "ui": false,
  "owns": ["server/lib/counterCardLint.js", "server/test/healthFirst.test.js"],
  "read_full": ["docs/plans/card-health-first-plan.md"],
  "verify": ["cd server && node --test test/healthFirst.test.js", "cd server && npm test"]
}
```

**Problem.** Counter cards aim at the cook ("80/20 for burgers") and repeat one health fact across a whole family (every beef card says grass-fed). Ruling (Devon 2026-10-12): every card aims at the closest-to-nature version, and a shared health fact lives on exactly one owner card; siblings carry a pointer pick_step `<Read>: see <Owner title>.` Plan: `docs/plans/card-health-first-plan.md` ("One fact, one owner", Piece 1). This piece only adds the lint and its corpus test; 74 cards that fail today sit in a pending list that later pieces empty.

**Repo facts (admin-verified).** KB `server/kristy_perimeter_kb.json`. Lint file `server/lib/counterCardLint.js`; the closest existing pattern is `TIER_NOTE_IS_RUBRIC` (`SHARED_RUN` at :50, comparison :61, emitted :1099): mirror its style (exported constants, code strings, small pure functions). `questionEntries()` in `server/lib/counterCards.js` gives the 202 question cards (skip the 31 `kind: 'pick'` entries unless their id is in a family below). Tests use `node:test`; `server/lib/testGuards.js` `nonEmpty(coll, name, min?)` guards every collection the test loops over.

## Change (counterCardLint.js, additive exports only)
1. `export const HEALTH_FIRST_PENDING = new Set([...])`, exactly these 74 ids:
   beef_grassfed_vs_grainfed, ground_beef_lean_ratio, ground_beef_organ_blend, beef_cuts_basics, beef_grades_usda, meat_case, butcher_counter_asking, judging_meat_at_the_case, organ_meats, pick_soup_bones, air_chilled_chicken, chicken_cuts_basics, duck_meat, egg_grades_sizes, pork_cuts_and_enhanced, lamb_goat, bison, venison_game, scallops, shrimp_imported_vs_domestic, white_fish, canned_fish_choosing, milk_processing, raw_milk, raw_aged_cheese, cheese_real_vs_processed, grassfed_butter, plain_kefir, cream_cheese, ghee, goat_sheep_dairy, coconut_milk_beverage, label_cold_pressed_expeller, cooking_oils, flour_basics, bagels, pretzels, kimchi, miso, fermented_pickles, olives, salt, sugars, maple_syrup, cocoa, tea, broth, grains_beyond_rice, pick_tofu, oats_steelcut_rolled_instant, nuts_raw_vs_roasted, beans_dried_vs_canned, bulk_bins_buying, whole_spices, frozen_vs_fresh_produce, produce_leafy_greens, produce_mushrooms, pick_kohlrabi, seeds, nutritional_yeast, pasta_sauce, jam, ketchup_mustard, seaweed, coconut_water, popcorn, hummus, frozen_fries, frozen_waffles, frozen_nuggets, dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder.
   If the KB at HEAD has a hit on an id NOT in this list, add that id with a trailing comment `// chf-1: hit at HEAD outside the plan` and name it in the report. Never edit the KB.
2. `export const CULINARY_LEXICON` (regex, case-insensitive, word-bounded): `for burgers?`, `braise|braising`, `sear|searing`, `grill|grilling`, `bake|baking`, `roast|roasting`, `stew|stewing`, `recipe`, `crisp|crispy`, `chew|chewy`, `tender|tenderness` (never matching `tenderized`), `flavou?r`, `taste`, `melt|melts|melting`, `juicy`.
   `export const CULINARY_SAFETY_ALLOW` (regex): a sentence containing `°F`, `internal temperature`, `spoil`, `slime`, `off smell`, `sour smell`, `use-by|sell-by|use by|sell by` is exempt.
   `export function lintCulinaryAim(entry)` → `[{code:'CULINARY_AIM', field, text}]` for each sentence of `decision`, `cart_pick` and each `pick_steps` item that matches the lexicon and not the allow regex.
3. `export const OWNED_FACTS`, one row `{fact, owner, ownerTitle, family, pattern}` each; `ownerTitle` is the owner's KB `title` read at module load from the KB (not hand-copied), so a later retitle cannot drift:
   | fact | owner | family | pattern (i) |
   |---|---|---|---|
   | beef_raising | beef_grassfed_vs_grainfed | ground_beef_lean_ratio, ground_beef_organ_blend, beef_cuts_basics, beef_grades_usda, meat_case, butcher_counter_asking, judging_meat_at_the_case, organ_meats, pick_soup_bones | `grass[- ]?(fed\|finished)\|grain[- ]?(fed\|finished)` |
   | ruminant_grass_term | label_grass_fed_term | lamb_goat, bison, venison_game, goat_sheep_dairy | `grass[- ]?(fed\|finished)` |
   | solution_added | pork_cuts_and_enhanced | ground_beef_lean_ratio, beef_cuts_basics, beef_grades_usda, meat_case, butcher_counter_asking, judging_meat_at_the_case, lamb_goat, bison, venison_game, dry_brine | `solution\|enhanced` |
   | mech_tenderized | beef_cuts_basics | ground_beef_lean_ratio, beef_grades_usda, meat_case, butcher_counter_asking, judging_meat_at_the_case | `mechanically tenderi[sz]ed\|blade[- ]tenderi[sz]ed` |
   | bird_pig_raising | label_pasture_raised_feed | chicken_cuts_basics, air_chilled_chicken, duck_meat, pork_cuts_and_enhanced | `pasture[- ]raised\|free[- ]range` |
   | chill_water | air_chilled_chicken | chicken_cuts_basics, duck_meat | `air[- ]chill\|water[- ]chill\|retained water` |
   | hen_raising | egg_labels | egg_grades_sizes | `pasture[- ]raised\|free[- ]range\|cage[- ]free` |
   | wild_farmed | salmon_wild_vs_farmed | shrimp_imported_vs_domestic, white_fish, canned_fish_choosing | `wild[- ]caught\|farm[- ]raised\|\bfarmed\b` |
   | phosphate_soak | scallops | shrimp_imported_vs_domestic, white_fish | `phosphate\|STPP\|soaked` |
   | milk_processing | milk_processing | plain_kefir, cream_cheese, goat_sheep_dairy, grassfed_butter, ghee | `ultra[- ]pasteuri[sz]ed\|homogeni[sz]ed` |
   | oil_extraction | label_cold_pressed_expeller | cooking_oils | `cold[- ]pressed\|expeller\|hexane\|solvent` |
   | dough_conditioners | sandwich_bread | bagels, pretzels, flour_basics, buns_rolls | `dough conditioner` |
   | live_ferment | sauerkraut | kimchi, miso, fermented_pickles, olives | `unpasteuri[sz]ed\|live (and active )?cultures` |
4. `export const POINTER = /^[A-Z][^:]{0,40}: see (.+)\.$/`.
   `export function lintRepeatedClaim(entry)` → for every row whose `family` includes `entry.id`, scan the prose fields `decision, why, short_answer, detail, science, kristy_take, tier_note, pick_steps, buying_tips, look_for, watch_out, labels_decoded` (recurse into arrays/objects, strings only; skip any field absent on the entry). A string matching `POINTER` is never a hit for the pattern. Hit → `{code:'REPEATED_CLAIM', fact, field, text}`. Separately, any `pick_steps` item matching `POINTER` whose captured title is not some row's `ownerTitle` → `{code:'POINTER_UNKNOWN_OWNER', field:'pick_steps', text}`. Not scanned: title, aliases, asked_as, question, sources, cart_pick.
   Do not wire either function into `lintCard` (generated cards: out of scope).

## Test (server/test/healthFirst.test.js, new)
- For every KB card id **not** in `HEALTH_FIRST_PENDING`: `lintCulinaryAim` and `lintRepeatedClaim` both return `[]`.
- Every `HEALTH_FIRST_PENDING` id and every `owner`/`family` id exists in the KB (catches a typo or a retired id left behind). Every row's `ownerTitle` equals that owner's KB title and is non-empty.
- `t.diagnostic` (or console.log) prints per-rule hit counts and the hitting ids at HEAD, plus `OWNER_GAP: <fact> <owner>` for each row whose owner's own prose does not match its own pattern (report only, never an assertion).
- `server/lib/doLines.json`: every family member's do line is scanned with its rows' patterns; hits outside PENDING fail.
- Fixtures (each its own test, on synthetic entries):
  - decision "80/20 for burgers." → CULINARY_AIM. pick_step "Firm, no slime." → none.
  - id ground_beef_lean_ratio, pick_step "Grass-finished when the case has it." → REPEATED_CLAIM (beef_raising).
  - same step on id beef_grassfed_vs_grainfed → none.
  - id ground_beef_lean_ratio, pick_step `How it was raised: see ${ownerTitle of beef_raising}.` → none.
  - id ground_beef_lean_ratio, pick_step "How it was raised: see Beef grades." → POINTER_UNKNOWN_OWNER.
  - "Mechanically tenderized steaks need full cooking." on beef_cuts_basics → no CULINARY_AIM from "tender".

## Done means
Given the KB at HEAD, when both verify commands run, then both exit 0, the new test prints hit counts and ids, and every fixture above passes. `npm test` count = previous 2440 + the new tests, 0 fail.

## Out of scope
Any KB, doLines.json, docs, iOS or route edit. `lintCard` wiring. Plain/unsweetened, olive, lard and freshness owners (unresolved; no rows).

## OK rough edges
Lexicons miss synonyms; a fact repeated outside its family is not caught; HEAD hit counts are high (they are the work list).

## Ship bar
An id outside PENDING fails a rule; PENDING or a table holds an id missing from the KB; any pre-existing test changes or goes red; a KB byte changes.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines: files, verify tails, hit counts per rule, OWNER_GAP lines, any id added to PENDING, READY or NOT READY. Do not commit or touch git.
