# ca-1 — Card-align lint: section tips, repetition budget, term bridge, pick agreement (L1-L5), CANONICAL_GLOSSES, CARD_ALIGN_REWRITE

```json
{
  "id": "ca-1",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/lib/counterCardLint.js",
    "server/lib/counterCardLint.test.js",
    "server/test/acceptance/passRule.js"
  ],
  "read_full": [
    "server/lib/counterCards.js",
    "server/lib/sectionRules.json",
    "server/test/acceptance/ic1.test.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/ca-1.test.js && cd server && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).
- Route: dv T2 (fallback forge@opus [T2]); critic@opus, FIDELITY required.
- P1. Parallel-safe: yes, with CA-2 (DONE, f661fee). Nothing else runs alongside it.
- Plan: `docs/CARD-ALIGNMENT-PLAN.md` CA-1 and D3. Scouts: `.pipeline/specs/ca-scouts.md` S1, S2, S4. S2 correction: the walk-section map is `sectionForCategory` / `SECTION_BY_CATEGORY` in `server/lib/counterCards.js:41-49`. `listMatch.js` `CATEGORY_SECTION` is a different, list-only map; do not import it.
- **Before dispatch:** the admin captures BEFORE with the independent check script below, at HEAD.

This piece adds checks only. No card, tip, or flag changes. At HEAD no `sectionRules.json` row carries `tip_aligned` or `cards_aligned`, so every new lint is silent until CA-5 sets the flags.

## Alignment block
- **Done means:**
  - **HEAD stays green and unchanged.**
    - Given the KB and `sectionRules.json` at HEAD (no flags), when `cd server && npm test` runs, then it is green.
    - The independent check's per-rule tally after the change is byte-identical to the BEFORE tally captured at HEAD.
  - **L1 `SECTION_TIP_REPEATS_CARD`.**
    - Given a `tip_aligned: true` tip whose check shares a 5-word phrase with a card in its walk section, then L1 fires once for that card.
    - Given a 4-word overlap, then it does not fire.
  - **L2 `SECTION_PHRASE_REPEATED`.**
    - Given 3 cards in one section sharing a 6-word phrase in `why`, then L2 (form `fields`) fires once, naming the 3 ids.
    - Given only 2 cards, or a POINTER line, or the G6 gloss phrase, then it does not fire.
    - Given 3 fronts sharing a 4-word phrase, then L2 (form `front`) fires.
    - Given 3 fronts sharing "100% grass-fed or grass-finished", then L2 does not fire (canonical term exempt).
  - **L3 `SECTION_TIP_HANDLING`.**
    - Given a `tip_aligned: true` check "Take a sealed package that is not leaking.", then L3 fires.
    - Given the six CA-5 tip rewrites from the plan, then L3 does not fire.
  - **L4 `TERM_UNGLOSSED`.** Each of G1-G7 has one red fixture and one green fixture inside the row's scope.
    - G5 still fires when a produce card carries only the G4 gloss.
    - G2 does not test a `poultry_eggs` card.
    - A seafood card is not checked (no scoped row).
    - Within one decision, the longest match consumes its span.
  - **L5 `CART_PICK_DISAGREES`.** The plan's beef, egg, milk, and chip fixtures give exactly the forms listed in C7.
  - **Gating.**
    - L1 and L3 run only on a row with `tip_aligned === true`.
    - L2, L4, and L5 run only on a row with `cards_aligned === true`.
    - A flag on one row never turns lints on for another section. `'true'` and `1` are not true.
  - **passRule.** For any `CARD_ALIGN_REWRITE` id, changes to the following pass:
    - `decision`, `tier_note`, `instead`, `cart_pick`, `pick_steps`, or any depth or glossary field;
    - added `aliases` or `asked_as`.

    These fail:
    - the same change on an id outside every set;
    - added, edited, or removed `sources` on a CA-only id;
    - a changed `category` or `evidence_tier`.

    `ground_beef_lean_ratio` (the fold survivor, already in HEALTH_FIRST_REWRITE) may add `sources` and change `instead`.
  - **New tests.** `lintSections` is called from `counterCardLint.test.js` and `ca-1.test.js`. It is never called from `lintCard` or `lintCorpus`.
- **Out of scope:**
  - card or tip edits (CA-3, CA-4, CA-5);
  - `sectionRules.json`, `sectionRules.js`, `sectionRules.test.js`, `sectionRulesContent.test.js`;
  - any existing rule, threshold, export, or set member;
  - iOS; the migration.
- **OK rough edges:**
  - The n-grams are lexical: a paraphrase passes, and the critic owns the spirit.
  - L5 is lexical: a cart_pick that names a different rung in other words passes.
  - Thresholds marked [PLACEHOLDER] get revisited after the forced-flag baseline (Risk 2).
  - **Deviation from the plan, recorded.** HEALTH_FIRST_REWRITE and ITEM_CARD_REWRITE ids keep their existing "sources may grow" allowance. Some of them are CA ids that are not fold survivors, for example `beef_grassfed_vs_grainfed` and `egg_labels`. Tightening that allowance turns the PRE-snapshot tests red. The CA-3 and CA-4 critics' Item 1 greps every changed source URL.
- **Ship bar:**
  - The independent-check diff is non-empty: an existing rule is loosened or tightened.
  - L1 or L3 runs on a row without `tip_aligned === true`.
  - L2, L4, or L5 runs on a row without `cards_aligned === true`.
  - HEAD is red.
  - `git diff --numstat` shows a deleted line in `counterCardLint.js` or `counterCardLint.test.js`.
  - A CA-only id can add, edit, or remove `sources`.
  - A file outside owns is edited.
- **Independent check:** run the `counts.mjs` tally at HEAD (BEFORE) and after the build (AFTER); `diff` must be empty. Its stderr prints the forced-flag `lintSections` baseline per section and code. If meat plus eggs_dairy exceed 40 hits [PLACEHOLDER], the thresholds are revisited before CA-3 is specced.

## Steps (the change, old → new)

### 1. `server/test/acceptance/passRule.js` (additive)
- After `ITEM_CARD_REWRITE` (ends :28), add `export const CARD_ALIGN_REWRITE = new Set([...])` holding exactly these 48 ids, with a one-line comment naming `docs/CARD-ALIGNMENT-PLAN.md` milestone 1:
  - beef_grassfed_vs_grainfed, ground_beef_lean_ratio, beef_cuts_basics, organ_meats, butcher_counter_asking, judging_meat_at_the_case, bison, venison_game, lamb_goat, pick_soup_bones;
  - pork_cuts_and_enhanced, pick_sausage, pick_jerky, chicken_cuts_basics, chicken_breast, rotisserie_chicken, turkey_whole, ground_turkey;
  - bacon, ham, hot_dogs, turkey_bacon, cured_pork, deli_meat_uncured;
  - egg_labels, egg_duck_quail, pick_egg_whites;
  - whole_vs_reduced_fat_milk, raw_milk, yogurt_plain_vs_flavored, grassfed_butter, ghee, plain_kefir, raw_kefir, sour_cream, cream_cheese, cottage_cheese, cheese_real_vs_processed, raw_aged_cheese, goat_sheep_dairy, cream_vs_creamer, ice_cream, dairy_case;
  - almond_milk, oat_milk, soy_milk, coconut_milk_beverage, plant_butter.
- After `RELAXED` (:37), add `const CA_RELAXED = ['cart_pick', 'instead', 'asked_as', 'aliases', 'labels_decoded'];`. `sources` is deliberately absent.
- `assertPassRule`, :49-51.
  - Old:
    `const rewrite = HEALTH_FIRST_REWRITE.has(id) || ITEM_CARD_REWRITE.has(id);` / `if (rewrite && RELAXED.includes(f)) continue;`
  - New:
    `const hf = HEALTH_FIRST_REWRITE.has(id) || ITEM_CARD_REWRITE.has(id);` `const ca = CARD_ALIGN_REWRITE.has(id);` `const rewrite = hf || ca;` / `if ((hf && RELAXED.includes(f)) || (ca && CA_RELAXED.includes(f))) continue;`
- Everything else in the file is byte-identical, including line 60 (the alias drop allowance stays ITEM_CARD_REWRITE-only) and the `if (rewrite)` block. For a CA-only id that block's `keepsAll(sources)` is harmless, because `sources` is still deepEqual-frozen.

### 2. `server/lib/counterCardLint.js` (append after :1616; no new imports)
`sectionForCategory`, `POINTER`, `REPEATED_CLAIM_FIELDS`, and `stringsIn` are already in scope (:35, :1578, :1582, :1588).

**`export const CANONICAL_GLOSSES`.** An array of exactly these 7 rows, in this order. Each row is `{ id, term, sections, categories, gloss, trace }`. `term` is a RegExp with flag `i` and never `g`. `categories` is `null` or an array. `trace` is a non-empty string.

| id | term | sections | categories | gloss (verbatim, curly quotes as shown) | trace |
| --- | --- | --- | --- | --- | --- |
| G1 | `/100% grass[- ]fed or grass[- ]finished/i` | `['meat']` | `null` | `“grass-fed” is the producer’s own word unless a certifier’s seal audits it` | beef_grassfed_vs_grainfed; FSIS 2019 animal-raising-claims guideline, docs/research/card-align-sources.md block 1 (gate A1 fallback) |
| G2 | `/100% grass[- ]fed/i` | `['eggs_dairy']` | `['dairy']` | `the cows ate grass and hay, never grain` | AGW Certified Grassfed G17.0.1, card-align-sources.md block 2 (gate A2) |
| G3 | `/\bpasture[- ]raised\b/i` | `['meat', 'eggs_dairy']` | `null` | `time outdoors on pasture, audited only with a certifier’s seal` | label_pasture_raised_feed |
| G4 | `/\borganic\b/i` | `['meat', 'eggs_dairy']` | `null` | `certified organic feed and outdoor access` | 7 CFR 205.237 / 205.239, card-align-sources.md blocks 3a/3b |
| G5 | `/\borganic\b/i` | `['produce']` | `null` | `grown without synthetic pesticides beyond a short approved list` | 7 CFR 205.105 / 205.601 (archive row due in M3) |
| G6 | `/\bnatural fats?\b/i` | `['bulk_pantry', 'frozen', 'eggs_dairy']` | `null` | `tallow, olive oil, or coconut oil` | Devon ruling, kristys_standard |
| G7 | `/\bseed oils?\b/i` | `['bulk_pantry', 'frozen', 'eggs_dairy']` | `null` | `sunflower, safflower, canola, soybean, corn, and cottonseed` | engine KB seed_oil entry names (S9) |

G1 deliberately differs from the plan table's draft gloss. Gate A1 tripped: the FSIS 2019 guideline says an unqualified "grass fed" claim already means forage only after weaning. So the plan's pre-written A1 fallback ships.

**Constants.** Exported or not, at the builder's choice.
- `STOPWORDS` [PLACEHOLDER]: a an the and or of to in on for with from at by is are was were be it its this that these those as not no nor but if so than then there their they them what how when where which who your you any each all more most some such into out up over only also can will has have had do does.
- `HANDLING` [PLACEHOLDER]: `/\b(?:seal(?:ed)?\b|leak|smell|odou?r|colou?r|cold\b|temperature|sell-by|use-by|expir|dent(?:ed|s)?\b|bulg|bruis|wash|stor(?:e|ed|age)\b|fridge)/i`
- `FAMILIES` [PLACEHOLDER]: `[/grass[- ]?(?:fed|finished)/i, /pasture[- ]raised/i, /\borganic\b/i, /wild[- ]caught/i]`
- `FIRST_RUNG_SPLIT` [PLACEHOLDER]: `/\s+first\b|,\s*then\b|;\s*then\b|\bnever\b/i`
- n for L1 = 5, n for L2 `fields` = 6, n for L2 `front` = 4, cards for L2 = 3 [PLACEHOLDER all four].

**`export function lintSections(tips, entries)`.** It is pure: no I/O, no mutation of its arguments. It returns an array of hits.
1. **Rows.** Walk `tips` in array order.
   - `tipOn = row.tip_aligned === true`, `cardsOn = row.cards_aligned === true`.
   - A row's cards are the `entries`, in array order and picks included, with `sectionForCategory(e.category) === row.section`.
   - A card whose category maps to `null` belongs to no row.
2. **Normalize.** `norm(s)` = `String(s)` lowercased, with ‘ and ’ → `'` and “ and ” → `"`.
3. **Card strings.**
   - Front strings: `[decision]` (L1) or `[decision, tier_note]` (L2 `front`).
   - Field strings: `stringsIn(entry[f])` for each `f` of `REPEATED_CLAIM_FIELDS`.
   - Drop any raw string for which `POINTER.test(s)` is true. Skip null or empty values.
4. **Segments.**
   - In `norm(s)`, mark every match of every `CANONICAL_GLOSSES` term. Use a global copy, all 7 rows, scope ignored.
   - Also mark every occurrence of every `norm(row.gloss)`.
   - Cut the marked spans out. The pieces left are segments.
5. **N-grams.** Tokens of a segment are `seg.match(/[a-z0-9%']+/g)`. An n-gram is n consecutive tokens inside one segment, with at least 2 tokens not in STOPWORDS. Its key is the tokens joined by single spaces.
6. **L1** (tipOn).
   - For each card, take the set of 5-gram keys over its decision plus its field strings.
   - Walk the tip strings `[row.rule, ...row.checks]` in order, and their 5-grams in position order. The first key in the card's set gives one hit `{ code: 'SECTION_TIP_REPEATS_CARD', section, id, phrase }`.
   - At most one hit per card.
7. **L2** (cardsOn). Two forms, `fields` (n=6 over field strings) then `front` (n=4 over decision + tier_note).
   - A key counts once per card.
   - Keep keys held by ≥3 cards. Group the kept keys by their sorted id list.
   - Each group gives one hit `{ code: 'SECTION_PHRASE_REPEATED', section, form, ids, phrase }`. `ids` is sorted; `phrase` is the group's first-seen key.
   - Groups are emitted in first-seen order (cards in entries order, strings in order, positions in order).
8. **L3** (tipOn). Each string of `[row.rule, ...row.checks]` that `HANDLING.test` matches gives `{ code: 'SECTION_TIP_HANDLING', section, text }`, where `text` is the raw string.
9. **L4** (cardsOn). Define `resolve(text, section, category)`:
   - Candidates are the rows where `sections.includes(section)` and (`categories === null` or `categories.includes(category)`).
   - Collect every match of every candidate term on `norm(text)`, using global copies.
   - Sort by length descending, then start ascending, then table index ascending. Accept greedily; skip any match that overlaps an accepted one.
   - Return the accepted rows, deduped, in table order.

   For each row `resolve(decision)` returns, the card needs `norm(row.gloss)` as a substring of `norm` of some string in `stringsIn(tier_note)`, `stringsIn(pick_steps)`, or `stringsIn(instead)`. If none holds it, emit `{ code: 'TERM_UNGLOSSED', section, id, row: row.id }`.
10. **L5** (cardsOn). Runs only if `cart_pick` is a non-empty string after trim.
    - **Form `a`:** some FAMILIES regex tests `cart_pick` and does not test `decision`.
    - **Form `b`:** let `rung = decision.split(FIRST_RUNG_SPLIT)[0]`. Some row of `resolve(rung)` passes neither `row.term.test(cart_pick)` nor `norm(cart_pick).includes(norm(row.gloss))`.
    - Each form gives at most one hit `{ code: 'CART_PICK_DISAGREES', section, id, form }`, with `a` before `b`.
11. **Output order.** Rows in `tips` order. Within a row: L1, L2, L3, L4, L5. Within a code, entries order (L2: as in step 7).

`lintSections` is not called from `lintCard`, `lintCorpus`, or any existing function.

### 3. `server/lib/counterCardLint.test.js` (insertions only)
- In the import block, insert `  lintSections,` after `  TIER_NOTE_ORPHANED_PENDING,` (:43).
- After `import doLines from './doLines.json' with { type: 'json' };` (:45), insert `import sectionRules from './sectionRules.json' with { type: 'json' };`.
- Append at the end of the file a test named `sectionRules corpus: lintSections is clean (CA-5 flags turn the section lints on)` with this body:
  - `nonEmpty(sectionRules, 'sectionRules', 6);`
  - `nonEmpty(perimeterKb.entries, 'perimeterKb.entries', 180);`
  - `assert.deepEqual(lintSections(sectionRules, perimeterKb.entries), []);`
- Do not edit any existing line.

## Criteria
- C1 [test] `lintSections` is exported. The real `sectionRules.json` rows with their flags stripped, plus the full KB, give `[]`. The forced-flag run returns only the 5 codes, each hit with a string `section`, and prints the per-section baseline. `counterCardLint.test.js` calls `lintSections(sectionRules, perimeterKb.entries)`.
- C2 [test] L1 fires once, with a phrase containing "animal ate", on a shared 5-word phrase. A 4-word overlap does not fire.
- C3 [test] L2 `fields` fires on 3 cards and not on 2, a POINTER line, or the G6 gloss. L2 `front` fires on a shared 4-word front. The G1 term on 3 fronts does not fire L2.
- C4 [test] L3 fires on "Take a sealed package that is not leaking." under `tip_aligned: true`, and not without the flag. The six CA-5 tips give `[]`.
- C5 [test] L4 fires each of G1-G7 without its own gloss and passes with it. G5 still fires with only the G4 gloss. G2 skips `poultry_eggs`. Seafood is unchecked.
- C6 [test] `CANONICAL_GLOSSES` holds the 7 rows above. Its ids, sections, categories, and glosses are verbatim, and its terms are non-global RegExps. No term-and-section pair repeats.
- C7 [test] L5 forms: beef `['a']` then `[]`; eggs `['b']` then `[]`; milk `[]`; chips `[]` then `['b']`.
- C8 [test] Flag gating: tip_aligned only, cards_aligned only, a flag on another row, and `'true'`/`1` each give `[]`. The positive control gives the 5 codes in order.
- C9 [test] `CARD_ALIGN_REWRITE` is exactly the 48 ids, each a KB or RETIRED id. The relaxations and the freezes hold as in the Done means.
- C10 `npm test` is green, with the count recorded. `listMatchProbe.js` reports 0 wrong. `commitGuard.js` is clean. The dry-run shows no card change. `git diff --numstat` shows 0 deleted lines in `counterCardLint.js` and `counterCardLint.test.js`. The independent-check AFTER is byte-identical to BEFORE.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/lib/counterCardLint.js", "server/lib/counterCardLint.test.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/sectionRules.json"], "expected": "[] with flags stripped; forced run prints per-section counts; corpus test present", "test_name": "C1 lintSections is clean at HEAD with flags stripped and prints the forced-flag baseline"},
    {"id": "C2", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "one L1 hit on 5 words, none on 4", "test_name": "C2 L1 fires on a shared 5-word phrase and not on a 4-word one"},
    {"id": "C3", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "fields hit on 3 ids; none on 2, POINTER, G6; front hit on 4 words; none on G1 term", "test_name": "C3 L2 fires on 3 cards and exempts 2 cards, POINTER lines, glosses and canonical terms"},
    {"id": "C4", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "sealed check hit only under tip_aligned; CA-5 tips 0 hits", "test_name": "C4 L3 fires on a handling check only under tip_aligned and passes the CA-5 tips"},
    {"id": "C5", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "each of G1-G7 red without its gloss, green with it; seafood unchecked", "test_name": "C5 L4 needs each scoped row gloss on the card"},
    {"id": "C6", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": [], "expected": "7 rows equal to the spec table", "test_name": "C6 CANONICAL_GLOSSES is the plan table with G1 on the A1 fallback"},
    {"id": "C7", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "a / none / b / none / none / none / b", "test_name": "C7 L5 fires on a family the front lacks or a dropped first-rung term"},
    {"id": "C8", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "four [] cases; positive control yields the 5 codes in order", "test_name": "C8 each lint runs only under its own true flag on its own row"},
    {"id": "C9", "impl": ["server/test/acceptance/passRule.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": ["server/test/acceptance/ic1.test.js", "server/test/healthFirst.test.js", "server/test/acceptance/k5.test.js", "server/test/acceptance/k6.test.js", "server/test/acceptance/k7.test.js", "server/test/acceptance/k8.test.js", "server/test/acceptance/k9.test.js", "server/test/acceptance/k10.test.js", "server/test/acceptance/k11.test.js"], "allowed_reads": ["server/test/acceptance/ic1.test.js"], "expected": "48 ids; CA copy changes pass; sources/category/evidence_tier changes on CA-only ids throw", "test_name": "C9 passRule CARD_ALIGN_REWRITE relaxes copy and growth and keeps sources category evidence_tier frozen"},
    {"id": "C10", "impl": ["server/lib/counterCardLint.js", "server/lib/counterCardLint.test.js", "server/test/acceptance/passRule.js"], "tests": ["server/test/acceptance/ca-1.test.js"], "dependents": ["server/lib/counterCardLint.test.js", "server/test/acceptance/ic1.test.js", "server/test/healthFirst.test.js", "server/test/acceptance/k5.test.js", "server/test/acceptance/k6.test.js", "server/test/acceptance/k7.test.js", "server/test/acceptance/k8.test.js", "server/test/acceptance/k9.test.js", "server/test/acceptance/k10.test.js", "server/test/acceptance/k11.test.js"], "allowed_reads": ["server/lib/counterCards.js", "server/lib/sectionRules.json", "server/test/acceptance/ic1.test.js"], "expected": "npm test green; probe 0 wrong; commitGuard clean; dry-run no card change; 0 deleted lines in the two lint files; tally diff empty"}
  ],
  "dependency_evidence": [
    {"owned": "server/lib/counterCardLint.js", "imports": ["server/test/ktight.test.js", "server/test/healthFirst.test.js", "server/scripts/migrateCounterCards.js", "server/test/acceptance/passRule.js", "server/test/acceptance/ktight-l.test.js", "server/test/acceptance/k15.test.js", "server/test/acceptance/k23.test.js", "server/test/acceptance/ic7a.test.js", "server/test/acceptance/ic6a.test.js", "server/test/acceptance/k6.test.js", "server/lib/counterCardLint.test.js", "server/test/acceptance/ic4achicken.test.js", "server/test/acceptance/ic1.test.js", "server/test/acceptance/k22.test.js", "server/test/acceptance/k7.test.js", "server/lib/counterGenerate.js", "server/test/acceptance/k14.test.js", "server/lib/pickReach.test.js", "server/lib/counterGenerate.test.js", "server/test/acceptance/k18.test.js", "server/test/acceptance/k9.test.js", "server/test/acceptance/k10.test.js", "server/test/acceptance/k3-1.test.js", "server/test/acceptance/k21.test.js", "server/test/acceptance/k19.test.js", "server/test/acceptance/ic4aeggs.test.js", "server/test/acceptance/ic4b.test.js", "server/test/acceptance/ic8b.test.js", "server/test/acceptance/k8.test.js", "server/test/acceptance/k11.test.js", "server/test/acceptance/ic8a.test.js", "server/test/acceptance/ic3a.test.js", "server/test/acceptance/k24.test.js", "server/test/acceptance/ic5b.test.js", "server/test/acceptance/k20.test.js", "server/test/acceptance/k16.test.js", "server/test/acceptance/ic5a.test.js", "server/test/acceptance/k5.test.js", "server/test/acceptance/ic3b.test.js", "server/test/acceptance/ic7b.test.js", "server/test/acceptance/ic6b.test.js", "server/lib/kindFilter.test.js", "server/lib/paidBoundary.test.js"], "tests": ["server/lib/counterCardLint.test.js", "server/test/acceptance/ca-1.test.js"], "source": "planner Grep of server/ for imports of counterCardLint.js, 2026-10-14: 43 importers; the change is append-only, so importers see no changed export"},
    {"owned": "server/test/acceptance/passRule.js", "imports": ["server/test/healthFirst.test.js", "server/test/acceptance/k5.test.js", "server/test/acceptance/k6.test.js", "server/test/acceptance/k7.test.js", "server/test/acceptance/k8.test.js", "server/test/acceptance/k9.test.js", "server/test/acceptance/k10.test.js", "server/test/acceptance/k11.test.js", "server/test/acceptance/ic1.test.js"], "tests": ["server/test/acceptance/ca-1.test.js", "server/test/acceptance/ic1.test.js"], "source": "planner Grep of server/ for imports of passRule.js, 2026-10-14: 9 importers; ic1.test.js:56 pins egg_duck_quail sources growth as a throw"},
    {"owned": "server/lib/counterCardLint.test.js", "imports": ["node --test via npm test (no module importers)"], "tests": ["server/test/acceptance/ca-1.test.js"], "source": "test file; runs under npm test"}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ca-1", "network": false}
}
```

## Acceptance server/test/acceptance/ca-1.test.js
```js
// CA-1: section lints L1-L5, CANONICAL_GLOSSES, CARD_ALIGN_REWRITE (docs/CARD-ALIGNMENT-PLAN.md CA-1). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED } from '../../lib/counterCards.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const rules = JSON.parse(readFileSync(join(SERVER, 'lib', 'sectionRules.json'), 'utf8'));
const CODES = ['SECTION_TIP_REPEATS_CARD', 'SECTION_PHRASE_REPEATED', 'SECTION_TIP_HANDLING', 'TERM_UNGLOSSED', 'CART_PICK_DISAGREES'];
const run = (tips, entries) => lint.lintSections(tips, entries);
const tip = (section, over = {}) => ({ section, rule: 'Fixture rule.', checks: [], ...over });
const card = (id, category, over = {}) => ({ id, category, title: id, decision: 'Fixture', ...over });
const byCode = (hits, code) => hits.filter((h) => h.code === code);
const ALL = ['meat', 'eggs_dairy', 'produce', 'bulk_pantry', 'seafood'].map((s) => tip(s, { cards_aligned: true }));
const G = Object.fromEntries((lint.CANONICAL_GLOSSES || []).map((r) => [r.id, r]));
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));
const unglossed = (c) => byCode(run(ALL, [c]), 'TERM_UNGLOSSED').map((h) => h.row);
const pickForms = (c) => byCode(run(ALL, [c]), 'CART_PICK_DISAGREES').map((h) => h.form);
const repeated = (cards) => byCode(run(ALL, cards), 'SECTION_PHRASE_REPEATED').map((h) => [h.form, h.ids]);

const OVERLAP = 'Ask what the animal ate and how it lived; a butcher counter can answer.';
const SEALED = 'Take a sealed package that is not leaking.';
const GRASS = [
  'Beef is best when the animal ate grass its whole life.',
  'Lamb counts only when the animal ate grass its whole life.',
  'Bison is a fit when the animal ate grass its whole life.',
];
const trio = (overs) => [card('ca1_a', 'beef', overs[0]), card('ca1_b', 'meat_counter', overs[1]), card('ca1_c', 'pork', overs[2])];
const BLEND = 'Organ blend with each organ’s percentage first, then ground beef with nothing added.';
const CA5_TIPS = [
  { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] },
  { section: 'eggs_dairy', rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.', checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'] },
  { section: 'produce', rule: 'Choose produce grown organic or unsprayed, and pick it whole and in season.', checks: ['Local and in season comes first; ask the produce staff what that is this week.', 'Frozen fruit and vegetables with nothing added count as whole food too.'] },
  { section: 'seafood', rule: 'Wild-caught fish ate its natural diet; choose wild first and ask where it was caught.', checks: ['Ask the counter where the fish was caught and how.'] },
  { section: 'bulk_pantry', rule: 'Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil.', checks: ['Skip seed oils and avocado oil, whatever the front of the package says.', 'The ingredient line tells more than the front; read it first.'] },
  { section: 'frozen', rule: 'Frozen food counts as whole when the bag lists the food and nothing else.', checks: ['Frozen meals follow the pantry rule: real ingredients, natural fats only.'] },
];
const CA_IDS = [
  'beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking',
  'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones',
  'pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast',
  'rotisserie_chicken', 'turkey_whole', 'ground_turkey',
  'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured',
  'egg_labels', 'egg_duck_quail', 'pick_egg_whites',
  'whole_vs_reduced_fat_milk', 'raw_milk', 'yogurt_plain_vs_flavored', 'grassfed_butter', 'ghee', 'plain_kefir',
  'raw_kefir', 'sour_cream', 'cream_cheese', 'cottage_cheese', 'cheese_real_vs_processed', 'raw_aged_cheese',
  'goat_sheep_dairy', 'cream_vs_creamer', 'ice_cream', 'dairy_case',
  'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'plant_butter',
];

test('C1 lintSections is clean at HEAD with flags stripped and prints the forced-flag baseline', () => {
  assert.equal(typeof lint.lintSections, 'function', 'lintSections is not exported');
  assert.ok(rules.length >= 6, `sectionRules rows ${rules.length}`);
  assert.ok(kb.entries.length >= 180, `KB entries ${kb.entries.length}`);
  const stripped = rules.map(({ tip_aligned, cards_aligned, ...r }) => r);
  assert.deepEqual(run(stripped, kb.entries), []);
  const forced = run(stripped.map((r) => ({ ...r, tip_aligned: true, cards_aligned: true })), kb.entries);
  assert.ok(Array.isArray(forced));
  const counts = {};
  for (const h of forced) {
    assert.ok(CODES.includes(h.code), `unknown code ${h.code}`);
    assert.equal(typeof h.section, 'string');
    counts[`${h.section} ${h.code}`] = (counts[`${h.section} ${h.code}`] || 0) + 1;
  }
  console.log(`ca-1 forced-flag baseline: ${JSON.stringify(counts)}`);
  const corpusTest = readFileSync(join(SERVER, 'lib', 'counterCardLint.test.js'), 'utf8');
  assert.match(corpusTest, /lintSections\(sectionRules, perimeterKb\.entries\)/);
});

test('C2 L1 fires on a shared 5-word phrase and not on a 4-word one', () => {
  const t = [tip('meat', { tip_aligned: true, checks: [OVERLAP] })];
  const hits = byCode(run(t, [card('ca1_beef', 'beef', { why: 'Before buying, ask what the animal ate at the farm.' })]), 'SECTION_TIP_REPEATS_CARD');
  assert.deepEqual(hits.map((h) => [h.section, h.id]), [['meat', 'ca1_beef']]);
  assert.match(hits[0].phrase, /animal ate/);
  const near = run(t, [card('ca1_beef', 'beef', { why: 'Before buying, ask what the animal eats at the farm.' })]);
  assert.deepEqual(byCode(near, 'SECTION_TIP_REPEATS_CARD'), []);
});

test('C3 L2 fires on 3 cards and exempts 2 cards, POINTER lines, glosses and canonical terms', () => {
  const fronts = ['Chuck roast', 'Lamb shoulder', 'Bison steak'];
  const three = trio(GRASS.map((why, i) => ({ decision: fronts[i], why })));
  assert.deepEqual(repeated(three), [['fields', ['ca1_a', 'ca1_b', 'ca1_c']]]);
  assert.deepEqual(repeated(three.slice(0, 2)), []);
  const pointer = { pick_steps: ['How it was raised: see Beef.'] };
  assert.deepEqual(repeated(trio([pointer, pointer, pointer])), []);
  const fat = { why: 'Fry only in tallow, olive oil, or coconut oil for this.' };
  assert.deepEqual(repeated([card('ca1_p1', 'bulk_pantry', fat), card('ca1_p2', 'bulk_pantry', fat), card('ca1_p3', 'bulk_pantry', fat)]), []);
  const plain = ['Steak with nothing added at all', 'Roast with nothing added at all', 'Ribs with nothing added at all'];
  assert.deepEqual(repeated(trio(plain.map((decision) => ({ decision })))), [['front', ['ca1_a', 'ca1_b', 'ca1_c']]]);
  const term = ['Steak cut 100% grass-fed or grass-finished', 'Roast labeled 100% grass-fed or grass-finished', 'Short ribs sold 100% grass-fed or grass-finished'];
  assert.deepEqual(repeated(trio(term.map((decision) => ({ decision })))), []);
});

test('C4 L3 fires on a handling check only under tip_aligned and passes the CA-5 tips', () => {
  const texts = byCode(run([tip('meat', { tip_aligned: true, checks: [SEALED] })], []), 'SECTION_TIP_HANDLING').map((h) => h.text);
  assert.deepEqual(texts, [SEALED]);
  assert.deepEqual(run([tip('meat', { checks: [SEALED] })], []), []);
  assert.deepEqual(run(CA5_TIPS.map((t) => ({ ...t, tip_aligned: true })), []), []);
});

test('C5 L4 needs each scoped row gloss on the card', () => {
  const g1 = '100% grass-fed or grass-finished beef';
  assert.deepEqual(unglossed(card('ca1_g1', 'beef', { decision: g1 })), ['G1']);
  assert.deepEqual(unglossed(card('ca1_g1', 'beef', { decision: g1, tier_note: `On beef, ${G.G1.gloss}.` })), []);
  const yog = 'Plain yogurt from 100% grass-fed milk';
  assert.deepEqual(unglossed(card('ca1_g2', 'dairy', { decision: yog })), ['G2']);
  assert.deepEqual(unglossed(card('ca1_g2', 'dairy', { decision: yog, pick_steps: [`100% grass-fed on the tub means ${G.G2.gloss}.`] })), []);
  assert.deepEqual(unglossed(card('ca1_g2', 'poultry_eggs', { decision: yog })), []);
  const g3 = 'Pasture-raised eggs with a seal';
  assert.deepEqual(unglossed(card('ca1_g3', 'poultry_eggs', { decision: g3 })), ['G3']);
  assert.deepEqual(unglossed(card('ca1_g3', 'poultry_eggs', { decision: g3, tier_note: `Pasture-raised means ${G.G3.gloss}.` })), []);
  const g4 = 'Organic eggs from the farm';
  assert.deepEqual(unglossed(card('ca1_g4', 'poultry_eggs', { decision: g4 })), ['G4']);
  assert.deepEqual(unglossed(card('ca1_g4', 'poultry_eggs', { decision: g4, pick_steps: [`Organic means ${G.G4.gloss}.`] })), []);
  const g5 = 'Organic berries with nothing added';
  assert.deepEqual(unglossed(card('ca1_g5', 'produce', { decision: g5 })), ['G5']);
  assert.deepEqual(unglossed(card('ca1_g5', 'produce', { decision: g5, tier_note: `Organic means ${G.G4.gloss}.` })), ['G5']);
  assert.deepEqual(unglossed(card('ca1_g5', 'produce', { decision: g5, tier_note: `Organic means ${G.G5.gloss}.` })), []);
  const g6 = 'Chips fried in a natural fat';
  assert.deepEqual(unglossed(card('ca1_g6', 'bulk_pantry', { decision: g6 })), ['G6']);
  assert.deepEqual(unglossed(card('ca1_g6', 'bulk_pantry', { decision: g6, tier_note: `A natural fat is ${G.G6.gloss}.` })), []);
  const g7 = 'Crackers made with no seed oil';
  assert.deepEqual(unglossed(card('ca1_g7', 'bulk_pantry', { decision: g7 })), ['G7']);
  assert.deepEqual(unglossed(card('ca1_g7', 'bulk_pantry', { decision: g7, instead: `Skip ${G.G7.gloss} oils.` })), []);
  assert.deepEqual(unglossed(card('ca1_sea', 'seafood', { decision: 'Organic salmon fillet' })), []);
});

test('C6 CANONICAL_GLOSSES is the plan table with G1 on the A1 fallback', () => {
  const rows = lint.CANONICAL_GLOSSES;
  assert.ok(Array.isArray(rows), 'CANONICAL_GLOSSES is not an exported array');
  assert.deepEqual(rows.map((r) => r.id), ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']);
  const plain = ['100% grass-fed or grass-finished', '100% grass-fed', 'pasture-raised', 'organic', 'organic', 'natural fat', 'seed oil'];
  rows.forEach((r, i) => {
    assert.ok(r.term instanceof RegExp, `${r.id} term`);
    assert.equal(r.term.global, false, `${r.id} term is global`);
    assert.ok(r.term.test(plain[i]), `${r.id} term misses ${plain[i]}`);
    assert.equal(typeof r.trace, 'string', `${r.id} trace`);
    assert.ok(r.trace.trim().length > 0, `${r.id} trace empty`);
  });
  assert.deepEqual(rows.map((r) => r.sections), [['meat'], ['eggs_dairy'], ['meat', 'eggs_dairy'], ['meat', 'eggs_dairy'], ['produce'], ['bulk_pantry', 'frozen', 'eggs_dairy'], ['bulk_pantry', 'frozen', 'eggs_dairy']]);
  assert.deepEqual(rows.map((r) => r.categories), [null, ['dairy'], null, null, null, null, null]);
  const seen = new Set();
  for (const r of rows) {
    for (const s of r.sections) {
      const key = `${r.term.source.toLowerCase()} @ ${s}`;
      assert.ok(!seen.has(key), `two rows share ${key}`);
      seen.add(key);
    }
  }
  assert.deepEqual(rows.map((r) => r.gloss), [
    '“grass-fed” is the producer’s own word unless a certifier’s seal audits it',
    'the cows ate grass and hay, never grain',
    'time outdoors on pasture, audited only with a certifier’s seal',
    'certified organic feed and outdoor access',
    'grown without synthetic pesticides beyond a short approved list',
    'tallow, olive oil, or coconut oil',
    'sunflower, safflower, canola, soybean, corn, and cottonseed',
  ]);
});

test('C7 L5 fires on a family the front lacks or a dropped first-rung term', () => {
  assert.deepEqual(pickForms(card('ca1_gb', 'beef', { decision: BLEND, cart_pick: 'Ground beef, grass-fed and grass-finished' })), ['a']);
  assert.deepEqual(pickForms(card('ca1_gb', 'beef', { decision: BLEND, cart_pick: 'Liver and heart beef blend, shares stated' })), []);
  const eggs = 'Pasture-raised, organic, and corn- and soy-free, all three together.';
  assert.deepEqual(pickForms(card('ca1_eg', 'poultry_eggs', { decision: eggs, cart_pick: 'Soy-free pasture-raised eggs' })), ['b']);
  assert.deepEqual(pickForms(card('ca1_eg', 'poultry_eggs', { decision: eggs, cart_pick: 'Pasture-raised organic corn- and soy-free eggs' })), []);
  const milk = 'Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed.';
  assert.deepEqual(pickForms(card('ca1_mk', 'dairy', { decision: milk, cart_pick: 'Low-temp pasteurized 100% grass-fed whole milk' })), []);
  const chips = 'Sliced potatoes, salt, and a natural fat, never seed oil or avocado oil.';
  assert.deepEqual(pickForms(card('ca1_ch', 'bulk_pantry', { decision: chips, cart_pick: 'Potato chips cooked in tallow, olive oil, or coconut oil' })), []);
  assert.deepEqual(pickForms(card('ca1_ch', 'bulk_pantry', { decision: chips, cart_pick: 'Kettle potato chips' })), ['b']);
});

test('C8 each lint runs only under its own true flag on its own row', () => {
  const LOUD = [
    card('ca1_l1', 'beef', { why: 'Before buying, ask what the animal ate at the farm.' }),
    ...trio(GRASS.map((why) => ({ why }))),
    card('ca1_g1', 'beef', { decision: '100% grass-fed or grass-finished beef' }),
    card('ca1_gb', 'beef', { decision: BLEND, cart_pick: 'Ground beef, grass-fed and grass-finished' }),
  ];
  const meat = (over) => [tip('meat', { checks: [SEALED, OVERLAP], ...over })];
  assert.deepEqual(run([tip('meat', { tip_aligned: true })], LOUD), []);
  assert.deepEqual(run(meat({ cards_aligned: true }), [LOUD[0]]), []);
  const other = [tip('meat', { tip_aligned: true, cards_aligned: true }), tip('produce', { checks: [SEALED] })];
  assert.deepEqual(run(other, [card('ca1_pr', 'produce', { decision: 'Organic berries with nothing added' })]), []);
  assert.deepEqual(run(meat({ tip_aligned: 'true', cards_aligned: 1 }), LOUD), []);
  const codes = [...new Set(run(meat({ tip_aligned: true, cards_aligned: true }), LOUD).map((h) => h.code))];
  assert.deepEqual(codes, CODES);
});

test('C9 passRule CARD_ALIGN_REWRITE relaxes copy and growth and keeps sources category evidence_tier frozen', () => {
  const { assertPassRule, CARD_ALIGN_REWRITE } = pass;
  assert.ok(CARD_ALIGN_REWRITE instanceof Set, 'CARD_ALIGN_REWRITE is not an exported Set');
  assert.deepEqual([...CARD_ALIGN_REWRITE].sort(), [...CA_IDS].sort());
  const known = new Set(kb.entries.map((e) => e.id));
  for (const id of CARD_ALIGN_REWRITE) assert.ok(known.has(id) || RETIRED_IDS.has(id), `${id} is neither a KB id nor RETIRED`);
  const organOld = {
    id: 'organ_meats', title: 'Organ meats', category: 'meat_counter', evidence_tier: 'fixture',
    decision: 'Old front', tier_note: 'Old why line here.', instead: 'Old second', cart_pick: 'Old pick',
    pick_steps: ['Old step.'], why: 'Old why.', short_answer: 'Old short.', watch_out: ['Old skip.'],
    labels_decoded: [{ term: 'Liver', meaning: 'Old meaning.' }], sources: ['https://example.org/organ'],
    aliases: ['beef liver'], asked_as: ['which liver should i buy'],
  };
  const organNew = {
    ...organOld,
    decision: 'New front', tier_note: 'New why line here.', instead: 'New second', cart_pick: 'New pick',
    pick_steps: ['New step.'], why: 'New why.', short_answer: 'New short.', watch_out: ['Old skip.', 'New skip.'],
    labels_decoded: [{ term: 'Liver', meaning: 'Old meaning.' }, { term: 'Heart', meaning: 'New meaning.' }],
    aliases: ['beef liver', 'organ meat'], asked_as: ['which liver should i buy', 'is liver worth buying'],
  };
  assert.doesNotThrow(() => assertPassRule(null, organOld, organNew));
  const outside = (o) => ({ ...o, id: 'ca1_outside_fixture' });
  assert.throws(() => assertPassRule(null, outside(organOld), outside(organNew)));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, sources: [...organOld.sources, 'https://example.org/new'] }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, sources: ['https://example.org/organ-edited'] }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, sources: [] }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, category: 'beef' }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, evidence_tier: 'other' }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, aliases: ['organ meat'] }));
  const gbOld = { id: 'ground_beef_lean_ratio', category: 'beef', evidence_tier: 'fixture', decision: 'Old front', instead: 'Old second', sources: ['https://example.org/gb'] };
  const gbNew = { ...gbOld, decision: 'New front', instead: 'New second', sources: ['https://example.org/gb', 'https://example.org/fold'] };
  assert.doesNotThrow(() => assertPassRule(null, gbOld, gbNew));
  const egg = { id: 'egg_duck_quail', decision: 'Old front', sources: ['https://example.org/egg'] };
  assert.throws(() => assertPassRule(null, egg, { ...egg, sources: ['https://example.org/egg', 'https://example.org/b'] }));
});
```

## ANCHOR server/lib/counterCardLint.js:33
```js
import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from './doLines.json' with { type: 'json' };
import { sectionForCategory, DEPTH_FIELDS } from './counterCards.js';
import { statesIn } from './listMatch.js';
import { claimLockViolations } from './counterClaimLock.js';
```
`sectionForCategory` is already imported, so no import is added.

## ANCHOR server/lib/counterCardLint.js:1578
```js
export const POINTER = /^[A-Z][^:]{0,40}: see (.+)\.$/;

// The front states the card's own buying ladder; a family card's front may name the owned
// standard (e.g. "100% grass-fed and grass-finished."), the depth may not.
export const REPEATED_CLAIM_FIELDS = [
  'why', 'short_answer', 'detail', 'science', 'kristy_take', 'tier_note',
  'pick_steps', 'buying_tips', 'look_for', 'watch_out', 'labels_decoded',
];
```
Reuse `POINTER` and `REPEATED_CLAIM_FIELDS` by reference. Do not copy them.

## ANCHOR server/lib/counterCardLint.js:1611
```js
  for (const text of stringsIn(entry?.pick_steps)) {
    const m = text.match(POINTER);
    if (m && !titles.has(m[1])) out.push({ code: 'POINTER_UNKNOWN_OWNER', field: 'pick_steps', text });
  }
  return out;
}
```
This is the end of the file today. The append goes after :1616.

## ANCHOR server/lib/counterCardLint.test.js:42
```js
  tierNoteOrphaned,
  TIER_NOTE_ORPHANED_PENDING,
} from './counterCardLint.js';
import doLines from './doLines.json' with { type: 'json' };
```
Insert `  lintSections,` after :43, and the `sectionRules` import after :45.

## ANCHOR server/test/acceptance/passRule.js:37
```js
const RELAXED = ['cart_pick', 'asked_as', 'aliases', 'sources', 'labels_decoded'];
// By value: sources may be {url, ...} objects, which includes() compares by reference.
const keepsAll = (newList, oldList) => {
```
`CA_RELAXED` goes after :37.

## ANCHOR server/test/acceptance/passRule.js:47
```js
export function assertPassRule(t, oldEntry, newEntry) {
  const id = oldEntry.id;
  const rewrite = HEALTH_FIRST_REWRITE.has(id) || ITEM_CARD_REWRITE.has(id);
  for (const f of FROZEN) {
    if (rewrite && RELAXED.includes(f)) continue;
    assert.deepEqual(newEntry[f], oldEntry[f], `${id}: frozen field ${f} changed`);
  }
```
Lines :49 and :51 change as in Step 1. Nothing else in the function changes.

## ANCHOR server/lib/counterCards.js:41
```js
const SECTION_BY_CATEGORY = (() => {
  const map = new Map();
  for (const s of PERIMETER_SECTIONS) for (const c of s.categories) map.set(c, s.id);
  return map;
})();

export function sectionForCategory(category) {
  return SECTION_BY_CATEGORY.get(String(category || '')) || null;
}
```
This is read-only. These are the walk sections (S2): beef, poultry, pork, deli, and meat_counter map to `meat`; poultry_eggs and dairy map to `eggs_dairy`; `produce`, `seafood`, and `bulk_pantry` map to themselves.

## Independent check script (admin-run; not part of the build)
Save as `/Users/m1/kristy/.pipeline/runs/ca-1/counts.mjs`.
- **BEFORE**, at HEAD before dispatch: `mkdir -p /Users/m1/kristy/.pipeline/runs/ca-1 && cd /Users/m1/kristy/server && node ../.pipeline/runs/ca-1/counts.mjs > ../.pipeline/runs/ca-1/before.json`
- **AFTER** the build, the same command, writing to `after.json`.
- **Check:** `diff /Users/m1/kristy/.pipeline/runs/ca-1/before.json /Users/m1/kristy/.pipeline/runs/ca-1/after.json` must print nothing.
- Any `:MISSING`, `:THREW`, or `:NOT_ARRAY` key in BEFORE means that call is wrong in this script. Fix the script before dispatch.
- Stderr carries the forced-flag `lintSections` baseline (AFTER only). That is the CA-3/CA-4 work list.
```js
import { readFileSync } from 'node:fs';
import * as lint from '../../../server/lib/counterCardLint.js';
import { projectEntry } from '../../../server/lib/counterCards.js';

const kb = JSON.parse(readFileSync('/Users/m1/kristy/server/kristy_perimeter_kb.json', 'utf8'));
const doLines = JSON.parse(readFileSync('/Users/m1/kristy/server/lib/doLines.json', 'utf8'));
const rules = JSON.parse(readFileSync('/Users/m1/kristy/server/lib/sectionRules.json', 'utf8'));
const tally = {};
const add = (k) => { tally[k] = (tally[k] || 0) + 1; };
const call = (name, ...args) => {
  if (typeof lint[name] !== 'function') return add(`${name}:MISSING`);
  let hits;
  try { hits = lint[name](...args); } catch { return add(`${name}:THREW`); }
  if (hits && !Array.isArray(hits) && Array.isArray(hits.violations)) hits = hits.violations;
  if (!Array.isArray(hits)) return add(`${name}:NOT_ARRAY`);
  for (const h of hits) add(`${name}:${h?.code ?? 'NO_CODE'}`);
};
const projected = [];
for (const e of kb.entries) {
  for (const name of ['readability', 'lintRepeatedClaim', 'lintCulinaryAim', 'lintPickSteps']) call(name, e);
  add(`entries:${e.kind ?? 'card'}`);
  if (e.kind === 'pick') call('lintPick', e);
  else {
    const p = projectEntry(e, { doLine: doLines[e.id] || '' });
    projected.push(p);
    call('lintCard', p);
  }
}
call('lintCorpus', projected);
console.log(JSON.stringify(Object.fromEntries(Object.entries(tally).sort()), null, 1));
if (typeof lint.lintSections === 'function') {
  const forced = lint.lintSections(rules.map((r) => ({ ...r, tip_aligned: true, cards_aligned: true })), kb.entries);
  const bySection = {};
  for (const h of forced) bySection[`${h.section}:${h.code}`] = (bySection[`${h.section}:${h.code}`] || 0) + 1;
  console.error(`forced-flag lintSections: ${JSON.stringify(bySection)}`);
}
```

## Prerequisites
- Env: node ≥20, git, grep. No network. No Supabase writes (`--dry-run` only). No browser.
- CA-2 is committed (f661fee). The G1/G2 traces cite `docs/research/card-align-sources.md` blocks 1 and 2.
- BEFORE is captured at HEAD before dispatch.

## Answers
- **Reads and runtime:**
  - Read: the three owns, the three `read_full` files, and `grep -n` inside `counterCardLint.js` for symbol lines. Nothing else is needed; this spec is self-contained.
  - `npm test` takes about 1-3 minutes. `node --test server/test/acceptance/ca-1.test.js` takes seconds.
- **Do not edit:**
  - `sectionRules.json`, `sectionRules.js`, `sectionRules.test.js`, `sectionRulesContent.test.js` (CA-5);
  - `ic1.test.js`, `healthFirst.test.js`, the k14 C12 anchor, any KB or doLines file;
  - any existing lint function, constant, or export.
- **`do` lines:** they live in `doLines.json`, not the KB. passRule never sees them, so they need nothing here.
- **STOP BLOCKED (quote the evidence) if:**
  - adding the code changes any existing test's result;
  - the new corpus test is red at HEAD. It cannot be: no row has a flag, so a red here means the gating is wrong. Fix the gating, never the test.
  - an existing assertion would have to change.
- **Limits:** no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- **Commit (admin):** the message ends "Not migrated."
- **Report, ≤30 lines:**
  - READY or NOT READY;
  - the `npm test` count;
  - the C1 forced-flag baseline line, verbatim;
  - `git diff --numstat` for the three owned files;
  - any [PLACEHOLDER] value changed and why (none expected).

## Tried and rejected
- **Relaxing `sources` for every CA id:** `ic1.test.js:56` asserts that adding a source on `egg_duck_quail` throws, so it goes red.
- **Tightening the HEALTH_FIRST/ITEM_CARD sources allowance to fold survivors only:** the existing PRE-snapshot pass-rule tests go red. Recorded as an OK rough edge instead.
- **A separate fold-survivor set:** both survivors (`ground_beef_lean_ratio`, `chicken_cuts_basics`) are already in HEALTH_FIRST_REWRITE.
- **Calling `lintSections` from `lintCorpus`/`lintCard`:** it changes the existing hit counts, and the independent check exists to prove they do not move.
- **Importing `listMatch.js` `CATEGORY_SECTION`:** it is the list-only map (S2). The walk uses `sectionForCategory`.
- **Asserting "no flags at HEAD" in the acceptance:** CA-5 turns it red. C1 strips the flags instead, so the file stays green through CA-5.
- **The live meat tip text as the L3 fixture:** CA-5 replaces it, so the fixture string is pinned here instead.
- **The plan table's draft G1 gloss:** gate A1 tripped on the FSIS 2019 guideline (CA-2 block 1), so the pre-written fallback ships.
