# add_card: adding an item card through apply.mjs

`scripts/lookfor/apply.mjs` is the only writer of `kristy_perimeter_kb.json`. A new card, or a pick promoted to a card, is one row in a `scripts/lookfor/patches/*.json` file. The checks live in `scripts/lookfor/addCard.mjs`; one bad row refuses the whole run and leaves the KB unchanged.

## Row shape

```json
{ "patches": [ {
  "op": "add_card",
  "promotes": "pick_x",
  "entry": { "...": "the card, exactly as it will sit in the KB" },
  "fetched": [ { "url": "https://...", "fetched": true, "archive": "counter/<slug>/<file>.md", "quote": "optional, verbatim in the archive file" } ]
} ] }
```

- `promotes` is optional. When it is set, the card takes the pick's slot in `entries` and the pick is deleted. Without it, the card goes after the last item card.
- The row is idempotent: if the card is already in the KB byte for byte and the pick is gone, it counts as already applied. If the same id is there with different content, the run is refused (`duplicate id`). To change a card that already exists, use the normal edit rows.

## Entry fields

Required, because all 202 current cards carry them: `id` (snake_case, not `pick_*`, unique across every kind), `title`, `aliases`, `category`, `question`, `decision`, `why`, `short_answer`, `detail`, `evidence_tier` (one of `kb.evidence_tiers`), `sources`, `kristy_take`, `buying_tips` (3 or more), `pick_steps` (1 to 3), `science`, `labels_decoded` (may be `[]`), `tier_note`, `asked_as` (3 or more distinct shopper questions).
Optional: `instead`, `cart_pick`, `watch_out` (3 at most), `family` (must be an existing `fam_*` id), `delta`, `eyebrow_short`, `card_why`, `deck`. Any other key is refused, because `schemaContract.test.js` only knows these fields. A card carries no `kind`.

## The refusals

1. **Sources.** Every source must be `{name, url}` with an http(s) URL; a bare string is refused. Every URL needs a `fetched` record with `fetched: true` and one of these:
   - an `archive` path under `/archive/` (the repo root) whose file contains the URL verbatim, and the `quote` too if one is given; or
   - a `quote` of 6 or more words.

   Prefer the archive. A quote on its own cannot be checked. Never cite a URL from memory: forges have got 9 of 10 wrong this way.
2. **Aliases (hub steal).** A new alias is refused if, after normalisation, it equals any item card's alias or sits inside one as a shorter phrase (for example, `tuna` against `canned tuna`). An alias that is longer and more specific is allowed (`canned tuna in oil`). An alias may be 4 words at most. When promoting a pick, move the pick's own aliases onto the card.
3. **Lint.** The projected card, with its reviewed do line, must return `[]` from `lintCard`, `lintPickSteps`, `lintLookforScope` and `lintTierNoteVsLookFor`. It must also meet the two-line rule: `decision` 10 words or fewer; `buying_tips[0]` is `look_for[0]`, 90 characters or fewer; no em dash and no first person in either line.
4. **Do line first.** Add the row to `docs/do-lines-review.md`, then run `node scripts/buildDoLines.js`. Until `lib/doLines.json` has the id, `apply.mjs` refuses the row. Commit both files.

## Example: a pick promoted to a card

```json
{ "op": "add_card", "promotes": "pick_frozen_peas",
  "entry": { "id": "frozen_peas", "title": "Frozen peas", "category": "produce", "family": "<fam_* id>",
    "aliases": ["frozen peas", "frozen pea", "frozen green peas", "frozen sweet peas"],
    "question": "Which frozen peas should I buy?", "decision": "<10 words or fewer>",
    "why": "<one line>", "short_answer": "<from the sources>", "detail": "<from the sources>",
    "evidence_tier": "established", "kristy_take": "<two sentences at most>", "cart_pick": "Frozen peas",
    "buying_tips": ["<line 2, 90 characters or fewer>", "<criterion>", "<criterion>"],
    "pick_steps": ["<noun phrase>"], "science": "<70 words or fewer>", "labels_decoded": [],
    "tier_note": "<why this call carries its tier, without saying 'tier'>",
    "asked_as": ["which frozen peas should i buy", "are frozen peas as good as fresh", "what should frozen peas list"],
    "sources": [{ "name": "Oregon State Extension, Preserving peas", "url": "https://extension.oregonstate.edu/food/preservation/preserving-peas-edible-pea-pods" }] },
  "fetched": [{ "url": "https://extension.oregonstate.edu/food/preservation/preserving-peas-edible-pea-pods", "fetched": true, "archive": "counter/frozen_peas/oregonstate.md" }] }
```

Before promoting, grep for the pick id (`grep -rn pick_frozen_peas server/ ../kristy-ios`). Carts, probes and pins that name it need repointing in the same unit.

## Run after applying

```
cd server
node scripts/lookfor/apply.mjs --dry-run     # read the plan
node scripts/lookfor/apply.mjs
npm test                                      # full suite, must be 0 fail
node scripts/listMatchProbe.js                # 0 wrong
node scripts/twoLineCheck.js                  # 0 with violations
node --test lib/counterReach.test.js lib/counterFloor.test.js lib/pickReach.test.js
```

`counterReach.test.js` reads every card's `asked_as` and asks each question; every one must land on the new card; a card is not done until it can be found. Commit with `Not migrated.` The migration (`node scripts/migrateCounterCards.js`) is a separate, stated step.
