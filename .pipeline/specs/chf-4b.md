# chf-4b — REWRITE batch 4b: pantry and oils, health-first own-list cards (Not migrated)

```json
{
  "id": "chf-4b",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js", "server/test/healthFirst.test.js", "server/lib/counterReach.test.js", "server/lib/doLines.json", "docs/do-lines-review.md"],
  "read_full": ["docs/plans/card-health-first-plan.md", ".pipeline/specs/chf-4a.md", "docs/research/health-first-sources.md"],
  "verify": ["cd server && node --test test/healthFirst.test.js", "cd server && npm test", "node server/scripts/listMatchProbe.js"]
}
```

**Problem.** Same rules as chf-4a (read it: Change §1 claim lock, wording bans, asked_as, tier_note, do lines, ratchet all bind here). Plan rows: Oils table, Bakery (flour_basics), and "Pantry, produce, frozen: own-list cards" 4b bullet, plus the Piece 2 narrowings in "Decisions".

## Batch ids (9)
flour_basics (OWNER whole-grain, unbleached, unbromated: engine KB first, else archive; lead with that, not chew), cooking_oils (hub: the label names the oil, "vegetable oil" names none; pointers to label_cold_pressed_expeller, olive_oil_grades, lard_tallow; drop heat use), salt (D5c narrowed: "iodized lists added iodine; check the list for anti-caking"; never "most sea/kosher carry none"), sugars (brown = white + molasses, no ranking), maple_syrup ("100% maple syrup", any grade, vs table syrup by list), cocoa (list "cocoa"; "processed with alkali" = Dutch process per 21 CFR 163.112; no flavanol line), tea (only the leaf; flavors → pointer to the label_no_artificial_flavors title), broth (bones and vegetables named; archive), grains_beyond_rice (hulled or whole over pearled; archive).

## Change
As chf-4a Change §1-§3, for these 9 ids only. Seed-oil concern stays engine `seed_oil` only: cooking_oils names oils, never states a seed-oil health claim. Remove the 9 from PENDING; lower the ratchet ceiling.

## Done means / Ship bar
As chf-4a. Report claim-trace table and URL grep.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines, READY or NOT READY. Do not commit or touch git.
