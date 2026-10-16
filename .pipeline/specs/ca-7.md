# CA-7 — "If you can't get it" ladder, batch A1 (eggs_dairy)

TIER: T2 · builder Astra high · Devon's ask 2026-10-16 is the approval (fast path). Base: 9854ae1.

## Alignment block (Devon, 2026-10-16, verbatim)
"the milk card, should say something like 'if you cant get raw, low temp organic 100%' that typa thing, i guess it dont have to be
from a farmer, because there are good farms that have raw milk in grocery stores"

What that means on every card below:
- `decision` names the best choice only, and never assumes a farmer or a farm visit when the best is also sold on store
  shelves. Milk: raw whole milk is the best, sold by some farms direct AND on some store shelves.
- `instead` is the next rung, always in exactly this form: `If you can't get <the best, short>: <the next pick, concrete label words>.`
  e.g. milk → "If you can't get raw: low-temp pasteurized, organic, 100% grass-fed whole milk."
  One sentence, ≤110 characters, label words a shopper can find on the carton. Food-worth, never health.
- Everything else on the card stays as is unless a lint forces a change (then change the least).

## Cards (15)
whole_vs_reduced_fat_milk, raw_milk, egg_labels, grassfed_butter, cheese_real_vs_processed, yogurt_plain_vs_flavored,
raw_kefir, plain_kefir, raw_aged_cheese, sour_cream, cream_cheese, cottage_cheese, ice_cream, ghee, goat_sheep_dairy.
If a card's `decision` changes, update its row in `docs/do-lines-review.md` (headline column) and run
`node server/scripts/buildDoLines.js`; commit-ready both. No other card changes.

## Rules that bind (kristy/CLAUDE.md)
Claim lock (no new concern/statistic/claim beyond the card's own KB material); no treat/prevent/cure/risk words; zero first
person; no em dash; no price words; no negative claims about named brands; no avocado oil as a pick; never digits in a do line.

## Owns
server/kristy_perimeter_kb.json, docs/do-lines-review.md, server/lib/doLines.json. The acceptance test
server/test/acceptance/ca-7.test.js is written by the admin: do not edit it.

## Verify (run, report numbers)
`cd server && node --test test/acceptance/ca-7.test.js`, `npm test`, `node scripts/listMatchProbe.js`,
`node scripts/commitGuard.js`, `node scripts/migrateCounterCards.js --dry-run` (no credentials needed; report the count).
Do not commit, do not migrate. Report READY or NOT READY in ≤30 lines with each card's new decision/instead.
