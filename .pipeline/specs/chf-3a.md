# chf-3a — TRIM batch 3a: drop culinary clauses, point owned facts to their owner (Not migrated)

```json
{
  "id": "chf-3a",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js", "server/lib/doLines.json", "docs/do-lines-review.md"],
  "read_full": ["docs/plans/card-health-first-plan.md"],
  "verify": ["cd server && node --test test/healthFirst.test.js", "cd server && npm test", "node server/scripts/listMatchProbe.js"]
}
```

**Problem.** Plan `docs/plans/card-health-first-plan.md`: read "One fact, one owner" (card skeleton + family tables), "Claim-lock path", Piece 3. chf-1 (`09c9f45`) added `lintCulinaryAim` / `lintRepeatedClaim` and `HEALTH_FIRST_PENDING` in `server/lib/counterCardLint.js`; `server/test/healthFirst.test.js` enforces both rules on every id outside PENDING. This batch trims the 3a cards so both rules pass, then removes them from PENDING.

## Batch ids (24)
beef_grassfed_vs_grainfed, ground_beef_organ_blend, judging_meat_at_the_case, organ_meats, air_chilled_chicken, chicken_cuts_basics (TRIM fallback: Piece 2 marked its unique line NOT satisfiable), bison, venison_game, shrimp_imported_vs_domestic, white_fish, canned_fish_choosing, milk_processing, raw_milk, raw_aged_cheese, cheese_real_vs_processed, grassfed_butter, label_cold_pressed_expeller, oats_steelcut_rolled_instant, nuts_raw_vs_roasted, beans_dried_vs_canned, bulk_bins_buying, whole_spices, frozen_vs_fresh_produce, buns_rolls (dough_conditioners repeat found by chf-1).

## Change
1. KB (`server/kristy_perimeter_kb.json`), only the 24 ids above:
   - Delete each culinary clause (cook method, cut-for-dish, taste/texture aim) that `lintCulinaryAim` flags, and any the plan's family-table row says to drop (judging_meat_at_the_case: marbling; organ_meats: method matching; bison/venison_game: "gamey"; white_fish: center-cut). Delete the clause, not the sentence, when the rest of the sentence stands.
   - On a non-owner, every sentence that `lintRepeatedClaim` flags is removed; if the card lost a pick_step that way, replace it with exactly one pointer per owned fact, form `<Read>: see <ownerTitle>.` where ownerTitle comes from `OWNED_FACTS` (e.g. `How it was raised: see ${ownerTitle}.`). Place pointers per the skeleton's pick_steps order (own list, then raising/making, then freshness/safety).
   - Owners in this batch (beef_grassfed_vs_grainfed, air_chilled_chicken, milk_processing, label_cold_pressed_expeller) keep their owned sentence; trim only.
   - Never add a new claim sentence, a new `sources` entry or a new URL. Never delete a safety, temperature, date or freshness sentence. Leave `id`, `title`, `aliases`, `asked_as`, `question`, `sources`, `evidence_tier`, ESSENTIALS order untouched.
   - Keep pick_steps ≥ 2; if trimming leaves fewer, keep the trimmed step's non-culinary remainder.
2. `server/lib/doLines.json` + `docs/do-lines-review.md`: only if a batch id's do line hits either rule's lexicon/pattern. Edit the review table row, then `node server/scripts/buildDoLines.js`; commit-ready both.
3. `server/lib/counterCardLint.js`: remove exactly the 24 ids from `HEALTH_FIRST_PENDING`. Nothing else in that file.

## Done means
Given the KB after the change, when `healthFirst.test.js` runs, then it passes with the 24 ids no longer in PENDING (both rules enforced on them) and the printed HEAD hit list contains none of them. `npm test` 0 fail (baseline 2450). `listMatchProbe.js` prints no wrong matches. Report a before/after table per id: fields changed, sentences removed, pointers added.

## Out of scope
REWRITE ids (4a/4b/4c), retire/fold ids, iOS, routes, retitling owners, any test file.

## OK rough edges
A card left with 2 pick_steps. A pointer read label that is plain ("How it was raised").

## Ship bar
Any added sentence other than a pointer; any new/changed `sources` URL; a deleted safety/freshness/date sentence; an owner losing its owned sentence; an id outside the 24 edited; a pre-existing test changed or red.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines: files, verify tails, the per-id table (compact), READY or NOT READY. Do not commit or touch git.

## Admin amendment (round 2)
- The healthFirst guard `nonEmpty(HEALTH_FIRST_PENDING, ..., 74)` contradicts the ratchet (PENDING must shrink to empty). Replace that one line with a ratchet assertion that is no weaker: `assert.ok(HEALTH_FIRST_PENDING.size <= 51, ...)` (a later batch lowers the ceiling as it removes ids). healthFirst.test.js is now in `owns` for that line only.
- shrimp_imported_vs_domestic: its `decision` must stay its own closest-to-nature line (skeleton step 2), never a pointer. Re-aim it at what only shrimp owns: the origin label (country of origin), using only words already on the card at HEAD. The wild/farmed fact becomes one pointer pick_step.
- chicken_cuts_basics `watch_out` "Read the tray for that line." points at nothing: delete it or use the pointer.
- Delete the orphan `// chf-1: hit at HEAD outside the plan` comment line.
- K6 (shrimp) and K8 (chicken) in the existing KTIGHT tests now fail. Read their assertions and fix the CARD to satisfy them; never edit those tests.
- beans_dried_vs_canned at 1 pick_step at HEAD: leave as is (pre-existing), note it.

## Admin amendment (round 3, rulings on the two conflicts)
- Shrimp/K6: `lintRepeatedClaim` skips the `term` key inside `labels_decoded` items (a term is the label's own printed word, like an alias; chf-1 already allows label names). The item's `meaning`/other strings stay scanned. Add one fixture test in healthFirst.test.js: a `labels_decoded` `{term:'Farm-raised', meaning:<no pattern hit>}` on shrimp → none; the same with meaning "Farmed shrimp ..." → REPEATED_CLAIM. Never edit k6.
- Chicken/K8: fill `watch_out` back to its HEAD item count with the pointer plus sentences that already exist elsewhere on chicken_cuts_basics at HEAD (moved verbatim, any field), each passing both rules. No new sentence, no duplicate pointer, never edit k8. If chicken at HEAD has too few such sentences, put chicken_cuts_basics back in HEALTH_FIRST_PENDING (ceiling becomes 52), restore it to HEAD byte-for-byte, and say so.
