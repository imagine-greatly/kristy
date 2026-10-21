PIECE kristy/planned-cart-1 (P1+P2, T2, Claude-built; critic via dv ask afterwards, not yours)
REPO /Users/m1/kristy  BASE = current HEAD

Read first (that is the spec):
- docs/PLANNED-CART-PLAN.md: "Composition rules", "Money", P1, P2, "What broken looks like", "Devon's ruling (2026-10-20)", "Appendix: PLANNED_CARTS". The ruling supersedes P1/P2 where they differ.
- Pattern: server/lib/tryPool.js (frozen id list resolved from the KB). Route: server/routes/guest.js:190-232 (sanitizeGuestPrefs, POST /api/guest/list). Hard lines: server/lib/list.js:457-477 (foodTags, EXCLUDE_TAGS), :721-735 (how generateList filters). Rows: server/lib/cartEdit.js:32-70 (sanitizeList, SOURCES), server/lib/listMatch.js:355-427 (cardForItem honours authored perimeterId; attachCards).

Build:
1. NEW server/lib/plannedCart.js
   - `PLANNED_CARTS`: frozen object, keys `everyday`, `nose_to_tail`, `garden_and_sea`; each a frozen array of `{ id, section, tags }` in the Appendix order. `tags` are explicit per row (meat/fish/egg/dairy/gluten), hand-set from what the food is, never from foodTags.
   - `buildPlannedCart({ cart, nonNegotiables })` → `{ goal: null, cart, items }`. Unknown/missing `cart` → `everyday`. Each row: `{ name: entry.cart_pick (byte-equal), perimeterId: id, source: 'user', why: '' or omitted per sanitizeList }`, rows whose tags hit `EXCLUDE_TAGS[line]` for any hard line are dropped. Run through `sanitizeList` then `attachCards` exactly as the route's other paths do. No intro string (no new copy).
   - `export` EXCLUDE_TAGS from list.js (one additive keyword, nothing else in list.js).
2. server/routes/guest.js: in POST /api/guest/list, after `cartBuildLimited` and `sanitizeGuestPrefs`, a `req.body?.plan === 'kristy'` branch BEFORE the goals_required check returns `{ list: buildPlannedCart({ cart: req.body.cart, nonNegotiables: prefs.nonNegotiables }), planned: true, prefs }`. The goal path stays byte-identical. Validate `cart` is a string in PLANNED_CARTS keys, else everyday.
3. If docs/api-shapes.generated.md covers this route's response, regenerate with `node scripts/buildApiShapes.js` (lib/apiShapes.test.js must stay green).
4. NEW server/lib/plannedCart.test.js (node:test, nonEmpty from lib/testGuards.js on collections):
   - each of the 3 carts, no hard lines: 20 rows; sections produce 5, meat 3, seafood 2, eggs_dairy 4, bulk_pantry 5, frozen 1 measured on the attached row's displayed section (whatever field attachCards/listMatch uses to place a row; read listMatch.js:44-110 and assert on that, e.g. cardSection or the frozen-name rule).
   - every row: name === KB cart_pick byte-equal; cardSlug === perimeterId === id (20/20 per cart); source 'user'.
   - no id is kind 'home' or label_terms, no pick ids.
   - vegan: no row tagged meat/fish/egg/dairy; vegetarian: no meat/fish; dairy-free; gluten-free (use the real HARD_LINE_VALUES ids from guest.js). Assert tags cover reality: every meat/seafood-section row carries meat or fish; every egg row egg; every dairy row dairy (a missed tag would leak past a hard line).
   - two builds deep-equal ignoring row ids; unknown cart key → everyday.
   - route: call the real handler (supertest or the pattern any routes test in server/ already uses; find it) with {plan:'kristy', cart:'nose_to_tail'} and no goals → 200, planned true, 20 items; {} → 400 goals_required unchanged.
   - none of the 3 carts uses a row name containing a price word, a day/meal name, or a brand (grep the names).

OWNS: server/lib/plannedCart.js [new], server/lib/plannedCart.test.js [new], server/routes/guest.js, server/lib/list.js (export keyword only), docs/api-shapes.generated.md (only via its script). Nothing else. Do NOT touch server/kristy_perimeter_kb.json or any test/acceptance file (another piece has them uncommitted).

Rules: no I/me/my, no em-dash, no price, no brands, no new user-facing copy.

VERIFY (run, report numbers): `cd server && npm test` (record baseline first; expect baseline + new, 0 fail), `node scripts/listMatchProbe.js` (0 wrong), `node scripts/commitGuard.js`. No git writes.

REPORT ≤30 lines: files, per-cart section counts, tag table summary, test counts, READY or NOT READY.
