# V1 — GET /api/counter/try (Try this week pool) · T2 · server

Approved: Devon 2026-10-06 (TRY-THIS-WEEK-PLAN.md, G-V1 yes). Account: docs/DECISIONS.md "Try this week" bullet (commit 9871271).

## What
A public, deterministic GET that returns the Try-this-week pool: the 20 curated cards named in DECISIONS.md, each as `{ id, cart_pick, do, section }`. Free fields only. No model call, no Supabase read, no auth required, no per-user data.

Lives on the counter router (`server/routes/counter.js`), path `/try` → `GET /api/counter/try`. iOS talks to counter routes only (kristy-ios Kristy/Networking/KristyAPI.swift:11), so not on /perimeter.

The device picks one card per trip and holds declines locally (D3); the server returns the whole pool so no query params and no stored state exist.

## Pool
`TRY_POOL` — a frozen array of exactly these 20 ids, in this order, exported from one new module `server/lib/tryPool.js`:
ground_beef_organ_blend, butcher_counter_asking, beef_cuts_basics, pork_cuts_and_enhanced, air_chilled_chicken, salmon_wild_vs_farmed, shrimp_imported_vs_domestic, fresh_vs_previously_frozen_fish, canned_fish_choosing, farmed_fish_by_species, yogurt_live_cultures, grains_beyond_rice, beans_dried_vs_canned, bulk_bins_buying, oats_steelcut_rolled_instant, honey_adulteration, nuts_raw_vs_roasted, sourdough, pretzel_bread, tortillas

## Sources (read, never reshape)
- Card: `server/kristy_perimeter_kb.json` entry by id → `cart_pick` (string) and its section (use the same section field/derivation the counter already exposes; reuse, don't re-derive).
- Do line: `server/lib/doLines.json` entry for that id, byte-equal, the same join `projectEntry` uses (server/lib/counterCards.js:336-375 — reuse the existing loader/Map, do not re-import or re-parse differently).
- Response builds each item by WHITELIST (`{ id, cart_pick, do, section }`), never by spreading a card and deleting keys.

## Files
- NEW `server/lib/tryPool.js` (TRY_POOL + `buildTryPool()` pure function)
- EDIT `server/routes/counter.js` (one GET handler)
- NEW `server/lib/tryPool.test.js`
- REGENERATED `docs/api-shapes.generated.md` — only by running `node server/scripts/buildApiShapes.js` (never hand-edit); `apiShapes.test.js` checks it.
Nothing else. If another file is needed, stop and report.

## Tests (tryPool.test.js; mirror the handler-call pattern in server/lib/paidBoundary.test.js:18-29; `nonEmpty` from ./testGuards.js)
1. `TRY_POOL` has exactly 20 unique ids; every id exists in the KB with a non-empty `cart_pick` and has a doLines.json entry (nonEmpty on the pool).
2. Handler response, guest (no req.user) and signed-in: 200, `items` length 20, each item has exactly the keys id, cart_pick, do, section — no paid key (`why`, `look_for`, `watch_out`, `detail`, `kristy_take`, `labels_decoded`, `sources`, `decision`) anywhere in the serialized body.
3. Each item's `do` is byte-equal to doLines.json for that id; `cart_pick` byte-equal to the KB.
4. Determinism: two calls return deep-equal bodies.
5. Pool excludes: no id starting `label_`, no `a2_vs_a1_milk`, `raw_milk`, `raw_kefir`, `raw_aged_cheese`, `sprouts_raw`, no `produce_*`.

## Alignment
- Done means: `cd server && npm test` green with the new file counted (report pass count before/after); the five tests above exist and pass; commitGuard run by the admin after staging.
- Out of scope: iOS, client/src (never edit), Supabase, migrations, prompts, KB or doLines edits, picking logic, decline storage.
- OK rough edges: response has no cache headers.
- Ship bar: no paid field can leave the route; no authored sentence anywhere (claim lock NN#2); engine output untouched (NN#5).

Hard cap 60 minutes. If the same test fails 3 runs in a row, stop and report BLOCKED. No git WRITE commands (add/commit/stash/checkout); read-only git invoked by `npm test` is fine. Skip commitGuard (the admin runs it after staging). No process spawn/kill.
