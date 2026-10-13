# chf-5 — RETIRE / FOLD 5 cards; HEALTH_FIRST_PENDING empties (Not migrated)

```json
{
  "id": "chf-5",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "server/lib/counterCardLint.js", "server/lib/counterCardLint.test.js", "server/lib/tryPool.js", "server/lib/tryPool.test.js", "server/lib/listMatch.test.js", "server/lib/counterReach.test.js", "server/test/healthFirst.test.js", "server/test/ktight.test.js", "server/test/counterProbe48.test.js", "server/test/acceptance/k9.test.js", "server/test/acceptance/k10.test.js", "server/test/acceptance/k15.test.js", "server/test/acceptance/k18.test.js", "server/test/acceptance/k21.test.js", "server/test/acceptance/k22.test.js", "server/test/acceptance/k23.test.js", "server/lib/doLines.json", "docs/do-lines-review.md"],
  "read_full": ["docs/plans/card-health-first-plan.md", "server/lib/counterCards.js"],
  "verify": ["cd server && npm test", "node server/scripts/listMatchProbe.js", "cd server && node scripts/migrateCounterCards.js --dry-run"]
}
```

**Problem.** Plan Piece 5 (`docs/plans/card-health-first-plan.md` §"5. RETIRE / FOLD", the RETIRE/FOLD paragraph under "One fact, one owner", and "D9b applied"). Five cards leave the corpus: dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder, duck_meat. None is `essential`. Fold = removal AND delete: each id goes into `RETIRED` in `server/lib/counterCards.js` (with a dated comment in the style of the existing entries) AND its entry is deleted from the KB. Nothing goes into `RETIRED_GENERATED`.

## Change
1. **Absorbers (move only specific aliases, never short generics; hub-steal rule):**
   - duck_meat → `chicken_cuts_basics`. Retitle it "Chicken and duck" (D9). Move duck aliases (`duck breast`, `duck breasts`, `whole duck`, `duck legs`, `duck leg`, `duck meat`) and add ≥1 duck `asked_as`. Do not move duck's culinary line.
   - pretzel_bread → `buns_rolls`. Move `pretzel bread`, `pretzel roll`, `pretzel rolls` (drop `alkaline dipped pretzel bread`). pretzel_bread's 3 `asked_as` questions must resolve to buns_rolls.
   - bean_soak_salt → `beans_dried_vs_canned`, food aliases only (`soak beans`, `soaking beans`, `bean soak`). Cooking-only aliases (tough/hard/salt beans) are dropped: those questions become honest misses.
   - dry_brine, baking_soda_powder: no absorber; aliases dropped (honest misses). Do not add them to any other card.
2. `HEALTH_FIRST_PENDING` in `counterCardLint.js` becomes empty (ratchet 0); remove the 5 ids from the family tables (~:50/:55/:57) and every other reference in that file. Both health-first rules then run corpus-wide and must pass.
3. `tryPool.js`: drop `pretzel_bread`. Do lines: remove the 5 rows from `docs/do-lines-review.md`, then rebuild `server/lib/doLines.json` with `node server/scripts/buildDoLines.js`.
4. Tests: every test that names a retired id is rewritten to assert the id is in `RETIRED` and absent from the KB, or repointed to the absorber. Never delete a test file or an assertion without a replacement. `counterReach.test.js` gains: each pretzel_bread asked_as → buns_rolls; each moved duck asked_as → chicken_cuts_basics; "coconut milk" → canned_coconut_milk. Leave `server/test/acceptance/fixtures/kb-pre-readability.json` alone (historical fixture).
5. If `k14.test.js` C12 fails only because k9/k10 changed since its anchor: do NOT edit k14; report it. The admin re-anchors after commit.

## Done means
- `grep -rnE 'dry_brine|bean_soak_salt|pretzel_bread|baking_soda_powder|duck_meat' server docs/do-lines-review.md --exclude-dir=node_modules` shows hits only in `RETIRED`, tests, and the historical fixture.
- Migration dry-run lists exactly these 5 in RETIRED deletes, none in RETIRED_GENERATED; card count 197.
- `npm test` green (except a C12 anchor failure, reported); listMatchProbe 0 wrong.

## Out of scope / Ship bar
Out: new cards, any card text beyond the alias/asked_as/title moves above. **Ship bar (blocker):** an essential retired; a shortcut or list pick pointing at a deleted id; a retired id's asked_as landing on the wrong card; "coconut milk" no longer reaching canned_coconut_milk.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines, READY or NOT READY. Do not commit or touch git.
