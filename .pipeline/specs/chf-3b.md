# chf-3b — TRIM batch 3b: drop culinary clauses, point owned facts to their owner (Not migrated)

```json
{
  "id": "chf-3b",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js", "server/test/healthFirst.test.js", "server/lib/doLines.json", "docs/do-lines-review.md"],
  "read_full": ["docs/plans/card-health-first-plan.md", ".pipeline/specs/chf-3a.md"],
  "verify": ["cd server && node --test test/healthFirst.test.js", "cd server && npm test", "node server/scripts/listMatchProbe.js"]
}
```

**Problem.** Same as chf-3a (read it, including both Admin amendments: they are standing rulings for this batch too). chf-3a committed the first 24 ids; this batch trims the 3b ids so `lintCulinaryAim` / `lintRepeatedClaim` pass, then removes them from `HEALTH_FIRST_PENDING`.

## Batch ids (21)
scallops (OWNER: dry vs soaked; drop the sear), plain_kefir, cream_cheese, ghee, fermented_pickles, olives, produce_leafy_greens, produce_mushrooms, pick_kohlrabi, seeds, nutritional_yeast, pasta_sauce, jam, ketchup_mustard, seaweed, coconut_water (heat as processing, not taste), popcorn, hummus, frozen_fries, frozen_waffles, frozen_nuggets.
If any id is not in PENDING at HEAD, leave that card untouched and list it in the report.

## Change
1. KB, only these ids: identical rules to chf-3a Change §1 (delete culinary clauses, not whole sentences when the rest stands; a non-owner's owned-fact sentence becomes one pointer `<Read>: see <ownerTitle>.` with ownerTitle from `OWNED_FACTS`; scallops keeps its owned sentence; no new claim, no new `sources`/URL, never delete safety/temperature/date/freshness; `id`, `title`, `aliases`, `asked_as`, `question`, `sources`, `evidence_tier`, ESSENTIALS order untouched; pick_steps ≥ 2 where HEAD had ≥ 2).
   - Health-first aim: where a `decision` or `cart_pick` reads as a taste/texture pick, re-aim it at the closest-to-nature version using only words already on the card at HEAD (shortest list, nothing added, unsweetened, organic where the card already says so). No new words of claim.
   - Existing KTIGHT / acceptance tests that go red: fix the CARD, never the test (chf-3a round-3 rule).
2. doLines: only if a batch id's do line hits either rule; edit the review row, then `node server/scripts/buildDoLines.js`.
3. `counterCardLint.js`: remove exactly the batch ids from `HEALTH_FIRST_PENDING`. `healthFirst.test.js`: lower the ratchet ceiling to the new PENDING size (that one line only).

## Done means
`healthFirst.test.js` passes with the batch ids out of PENDING; `npm test` 0 fail (baseline 2451); probe no wrong matches. Report a compact per-id table: fields changed, clauses removed, pointers added.

## Out of scope
REWRITE ids (4a/4b/4c), retire/fold ids, iOS, routes, any other test.

## OK rough edges
A card left with 2 pick_steps. A plain pointer read label.

## Ship bar
Any added sentence other than a pointer or a decision/cart_pick re-aim built only from HEAD words on that card; any new/changed `sources` URL; a deleted safety/freshness/date sentence; scallops losing its owned sentence; an id outside the batch edited; a pre-existing test edited or red.

Hard cap 60 min. If the same test fails 3 runs in a row, stop and report BLOCKED. Report ≤30 lines: files, verify tails, per-id table, READY or NOT READY. Do not commit or touch git.
