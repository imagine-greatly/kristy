# chf-4c — REWRITE batch 4c: bakery, ferments, tofu, D9 keeps; owner gaps (Not migrated)

```json
{
  "id": "chf-4c",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js", "server/test/healthFirst.test.js", "server/test/counterReach.test.js", "server/lib/doLines.json", "docs/do-lines-review.md"],
  "read_full": ["docs/plans/card-health-first-plan.md", ".pipeline/specs/chf-4a.md", "docs/research/health-first-sources.md"],
  "verify": ["cd server && node --test test/healthFirst.test.js", "cd server && npm test", "node server/scripts/listMatchProbe.js"]
}
```

**Problem.** Same rules as chf-4a (read it; all of Change §1-§3 binds). Plan rows: Bakery, Ferments, Dairy D9 row, 4c bullet, Piece 2 outcomes ("D9b applied", "Narrowings", "Owner gaps").

## Batch ids (7) + two owner-gap edits
bagels (its own list adds malt; pointer to the dough-conditioner owner), pretzels (snack pretzel list from the archive, the Snyder's list, never a negative brand claim; pointer), kimchi, miso ("red is saltier" as composition; pointer to the live-ferment owner), pick_tofu (soybeans, water, coagulant; cite coagulants, not "organic"), goat_sheep_dairy (composition line: less lactose, different proteins, MSU source in the archive; never "easier to digest"), coconut_milk_beverage (the naming decode "a coconut beverage"; unsweetened → pointer).

Owner gaps (edit ONLY the owned sentence, nothing else on these cards; they are not in PENDING): sandwich_bread gets one dough-conditioner sentence and sauerkraut one refrigerated/unpasteurized/live sentence, each traced to the engine KB or the archive. If there is no trace, add nothing, drop the matching pointers on siblings (no pointer to an owner that does not carry the fact), and say so in the report.

## Change
As chf-4a Change §1-§3, for these ids. "coconut milk" (bare) must still reach canned_coconut_milk. Remove the 7 from PENDING; lower the ratchet ceiling.

## Done means / Ship bar
As chf-4a, plus: an owner-gap sentence without trace is a blocker. Report claim-trace table and URL grep.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines, READY or NOT READY. Do not commit or touch git.
