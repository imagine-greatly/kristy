# Planned cart — plan (awaiting Devon's approval)

Written 2026-10-20 against `main` at `2b23393`. Plan only; nothing built. Devon 2026-10-20, verbatim:
"i think we are too passive now in our guidance there shouldmalso be an option for us to plan the
groceries for you, and give them a well thought healthy cart they can then expand on".

**Problem.** A shopper who opens a blank list gets no starting point. Kristy waits for them to type
or say a list, then reacts row by row. Shoppers who don't yet know what a clean week of groceries
looks like (exactly who the stance is for) get nothing until they've already decided. **Need:** one
tap gets a whole store's worth of clean picks, sectioned and carded, that the shopper then trims and
adds to with the tools that exist today.

## Scout first

Run these before any spec is written. Only VERIFIED lines become ANCHORs.

1. `dv scout "every perimeter KB entry with a cart_pick: id, kind, category, the cart_pick verbatim, and the LIST_SECTION attachCards files it under" --terms cart_pick,attachCards,LIST_SECTIONS`. This feeds the curation in P0.
2. `dv scout "does attachCards honour an authored perimeterId on a row with source 'template', and is 'template' in sanitizeList's source enum" --terms attachCards,sanitizeList,perimeterId`
3. `dv ask --role scout "On iOS, after the cart has rows, which compose mode does HomeHoldInput/LiveListDraft send to /api/guest/list/compose: 'build' or 'edit'? Quote the line." --cd /Users/m1/kristy-ios`. If it sends `build`, buildCart replaces every template row (cartEdit.js:310). That is Risk 1.
4. `dv ask --role scout "Where does a guest compose response land in the iOS cart (Cart.swift / HomeHoldInput onCompose), and which file is the best example to mirror for replacing an empty local cart with a server list?" --cd /Users/m1/kristy-ios`
5. `dv scout "does Try this week skip a TRY_POOL card already present on the list" --terms buildTryPool,TRY_POOL`
6. `dv scout "which test file covers POST /api/guest/list, and is docs/api-shapes.generated.md produced by a script" --terms cartBuildLimited,guestListBuild`
7. Asked on every plan: does anything already do part of this? Known so far: `POST /api/guest/list` plus `generateList` (below). Is there anything else?

## Baseline: today, and what comes close

| Existing piece | What it does | Verdict |
| --- | --- | --- |
| `POST /api/guest/list` → `generateList` (`server/routes/guest.js:211`, `server/lib/list.js:717`) | Deterministic goal template, no model, 20/hour/IP (`cartBuildLimited`). Returns 400 `goals_required` if no goals are set. iOS `guestListBuild` exists (`KristyAPI.swift:218`), but only `Tools/livedrive` calls it. | **Reuse the route and bucket.** Do not reuse the templates: `PICKS`/`GOAL_TEMPLATES` are a second pick table (Block V era, 7–12 rows, `why` lines written apart from the cards). They predate clean-pick, they don't cover every section, and they need goals. |
| `TRY_POOL` + `buildTryPool` (`server/lib/tryPool.js`) | A frozen list of card ids, resolved to `cart_pick` + do line + section from the KB. | **The pattern to mirror exactly.** The planned cart is a bigger, sectioned TRY_POOL. |
| Card `cart_pick` (149 entries) | The cleanest version as a cart-ready name, already aligned by clean-pick B1–B7 ("Wild-caught salmon", "Corn- and soy-free eggs from hens on pasture"). | **The row names.** No new copy gets authored. |
| `attachCards` / `listMatch` | Puts the card on a row, which gives shop mode its two lines (headline + first tip) and sorts the row into a section. | Reused, unchanged. |
| Seed `POST /api/trips/next` | "Same as last week" from the last completed trip. | Untouched. It answers "repeat"; this answers "start". |
| Compose (`applyCompose`/`buildCart`) + goals (≤3 adds/≤4 anchors) | The model edits a list from a sentence. | Reused for **expanding** the cart. Not used for **planning** it (Option D below). |
| `ESSENTIALS` | Eight counter cards that are free to read. They are cards, not cart items. | Not used. |
| `GET /api/list` "we do NOT invent one" (`routes/list.js:156`) | A blank cart stays an honest blank. | **Kept.** The planned cart arrives only when the shopper taps for it, never on its own. P5 records this. |

## Options

| | A. Today (baseline) | B. Turn on goal templates | **C. Card-sourced planned cart (Recommended)** | D. Model-composed cart |
| --- | --- | --- | --- | --- |
| How | The shopper types or says the list | iOS calls the existing `guestListBuild` | A frozen id list across every section, each row the card's `cart_pick` | A canned sentence sent to compose in `build` mode |
| Model spend | per compose | 0 | **0** | 1 call per plan. Guest bucket 8/hour/IP (`MAX_PER_WINDOW`); signed-in 12/day (`LIST_COMPOSE_FREE_LIMIT`) |
| Follows the stance | yes (cards) | no: pre-clean-pick picks, a second source of truth | **yes: every name is already a clean pick** | no guarantee: the model picks the names, so a test can't pin them |
| Every section | n/a | no | **yes, tested** | no |
| Needs | nothing | goals set first | nothing (hard lines only filter) | a model key (the local key is a placeholder, so it can't be verified locally) |
| Build cost | 0 | iOS only | 1 server lib + route branch + 2 iOS | iOS only, plus prompt work |

**Shaping (C).** Only facts the shopper set count, and none are ever inferred. Hard lines filter the
rows through the existing `foodTags`/`EXCLUDE_TAGS`, so a vegan never gets a meat row. If every row
in a section is excluded, that section is left out, not filled with a substitute. **Household size
is out.** §C, quoted: "a headcount is useless until the list can express amount. … Quantity is a
prerequisite, not a follow-up." Goal shaping (≤3 adds/≤4 anchors) is Open question 2.

**Entry (C).** One secondary hairline action on the empty landing. Every blank list gets it: a
first-run shopper, and anyone who taps "Start a new trip". It is not a home or list-header button on
a full list. A planned cart can't land on top of the shopper's own rows, so `buildCart` never has to
choose between them.

## Composition rules (all tested in P1)

1. **Every list section is covered:** `produce`, `meat`, `seafood`, `eggs_dairy`, `bulk_pantry`,
   `frozen` (`listMatch.js:44`). Slots: produce 5, meat 3, seafood 2, eggs_dairy 4, bulk_pantry 5,
   frozen 2, so 21 rows `[PLACEHOLDER]`.
2. **Clean picks, best self.** Each row's name is the card's `cart_pick`, byte-equal. No new names
   get authored. Each row carries `perimeterId: <card id>` (authored perimeterId wins, validated).
3. **Two-line card rule.** Every row matches its own card (`cardSlug === id`, N/N), so shop mode
   shows that card's headline + first tip. A row whose card doesn't match fails the test.
4. **Only food words.** No `label_terms` or `home`-kind ids. No "Whatever fruit is in season"-style
   non-item picks: the curator chooses concrete items.
5. **No price, no brands, no calorie or macro framing.** Every `cart_pick` has already passed
   `counterCardLint`. The single new string, the intro line, goes through the voice/claim lint.
6. **A cart, not meals.** No meal names, no days of the week, no recipes. Meal shopping stays
   post-launch.
7. **Kristy's rows yield.** `source: 'template'`. A shopper's "no seafood" removes them through
   `applyCompose`. Their own adds come in as `user` and stay protected unless named.

## Money (Ruling F)

The planned cart is a list, so it is **free for everyone, guests included**. It spends **zero model
calls**. It uses the existing `cartBuildLimited` bucket (20/hour/IP, `guestRate.js:61`) and has no
cap of its own. Walking it in shop mode stays members-only (`POST /trips/new` gate, the Direction D
wall), and nothing here changes that. Expanding the cart by sentence spends today's compose budgets
(guest 8/hour/IP; signed-in 12/day `LIST_COMPOSE_FREE_LIMIT`). The cart never tells the shopper
about a budget being spent. Verification cost: P4 and P6 each spend one simulator attach.

## How the shopper expands it (no new code)

Type or say more into the list-home composer (compose `edit`, but see Risk 1), remove rows, check
off rows. A new row gets one card attach and one offer (`attachOffers`, stamped `offered`). Try this
week appears once per trip on a list with items, which now includes a planned one. `applyCompose`
rules hold: only `user`/`imported` rows are protected, and a "no" is permanent.

## Pieces

### P0 — Curate the PLANNED_CART id list (scout → main) [T0]
- Scout question 1 lists every cart_pick. The main session (Opus) picks 21 ids into the slot counts
  under rules 1–6, highest on the stance's ladder (grass-fed, wild-caught, pasture, organic produce,
  short-list pantry). The table, with id, section and cart_pick verbatim, goes into this doc's
  Appendix for Devon to approve.
- Owns: `docs/PLANNED-CART-PLAN.md` (Appendix only).
- **Done means:** Given the scout list, when the Appendix is written, then it has 21 rows, every row
  is one of the six sections with its slot count met, and every cart_pick is quoted byte-equal from
  the KB. **Out of scope:** new cards, cart_pick edits. **OK rough edges:** a section that has fewer
  good cards than slots gets fewer rows, with the count noted. **Ship bar:** a label_terms or
  non-item pick.
- Route: `main`. It's judgment and needs no code. Parallel-safe: no. Dial: P1.
- Independent check: `grep -c` each quoted cart_pick in `server/kristy_perimeter_kb.json` = 1.

## Planned cart: server [governed, needs Devon's approval]

### P1 — `buildPlannedCart` lib (mirrors tryPool.js) [T2]
- A frozen `PLANNED_CART` (the P0 ids) plus `buildPlannedCart({ nonNegotiables })` →
  `{ goal: null, intro, items }`, run through `sanitizeList` and `attachCards`.
- Owns: `server/lib/plannedCart.js` [new], `server/lib/plannedCart.test.js` [new]. It may export
  `EXCLUDE_TAGS` from `server/lib/list.js:472` (one additive `export`, no behaviour change). That is
  the only touch to list.js.
- **Done means:**
  - Given no hard lines, when the cart is built, then each of the 6 sections holds its slot count,
    using `nonEmpty(items,'planned cart',21)`.
  - Given any row, then `name` === KB `cart_pick` byte-equal and `cardSlug` === its id (21/21).
  - Given hard line `vegan` `[PLACEHOLDER: real taxonomy id]`, then the cart has no row tagged
    meat, fish, dairy or egg, and no section appears with zero rows.
  - Given two builds, then they are deep-equal once `id` is ignored.
  - Given the intro, then it has no I/me/my and no em-dash.
- **Out of scope:** goals, focuses, baseline suppression, quantities. **OK rough edges:** the intro
  is one fixed line. **Ship bar:** any row without its own card; any section missing with no hard
  line set.
- Route: `dv T2 (fallback forge@opus)`, spec `.pipeline/specs/planned-cart-1.md`, written after
  approval. Parallel-safe: no. Dial: P1.
- Independent check: `node server/scripts/listMatchProbe.js` shows 0 wrong; `cd server && npm test`
  passes, count recorded.
- Dispatch (Codex): `dv check .pipeline/specs/planned-cart-1.md` → PASS; `dv route T2 --plan
  docs/PLANNED-CART-PLAN.md`; `dv build .pipeline/specs/planned-cart-1.md` (background); then a
  critic@opus block with the runId, the spec, `FIDELITY required`. ANCHOR seed:
  `server/lib/tryPool.js:28`
  ```
  export function buildTryPool() {
    // Reuse the counter's do-line join and section projection from the authored KB.
    const cardsById = new Map(
  ```

## Planned cart: route [T1, governed]

### P2 — `POST /api/guest/list` serves the plan on `plan: 'kristy'` [T1]
- Extend the existing route rather than add one. A `plan === 'kristy'` branch runs before the
  `goals_required` check and returns `{ list: buildPlannedCart(prefs), planned: true, prefs }`. The
  goal-template path stays byte-identical. Same `cartBuildLimited` bucket.
- Owns: `server/routes/guest.js`, plus the route test file scout Q6 names.
- **Done means:** Given `{plan:'kristy'}` with no goals, then 200 with 21 items. Given `{}`, then
  400 `goals_required` (unchanged). Given 21 calls from one IP in an hour, then the 21st returns 429.
- **Out of scope:** authed `/api/list/*` (iOS keeps the cart locally on the guest routes), the
  frozen web client. **Ship bar:** the old path changes.
- Route: `dv T1 (fallback forge@sonnet)`, critic@sonnet. Parallel-safe: no (it shares the npm test
  run with P1). Dial: P1. Deploy: `main` push (Railway). Not migrated, since no KB change.
- Independent check: `curl -s -XPOST localhost:$PORT/api/guest/list -d '{"plan":"kristy"}'
  -H 'content-type: application/json' | jq '.list.items|length'` → `21`.
- ANCHOR `server/routes/guest.js:220`
  ```
      const prefs = sanitizeGuestPrefs(req.body || {});
      if (!prefs.goals.length) return res.status(400).json({ error: 'goals_required' });

      const list = attachCards(generateList({ ...prefs, premium: true }));
  ```

## Planned cart: iOS [ui:true → designer first]

### P3 — Designer brief: the landing action and the arrival [designer@opus]
- Brief at `.pipeline/design/planned-cart.md`. It covers the action's label, where it sits under
  the notepad, and how 21 rows arrive (the same `change.arrived` motion compose uses).
- **Design direction:** Palette is ground Oat `#E9E2D0`, card `#FAF7EF`, green-black ink. Gold only
  on the hairline (one-gold rule). Type is the existing `HairlineAction` face; no new type.
  Layout: a secondary hairline link below the notepad. `onePrimaryActionAtMost("HomeSurface")` holds,
  so the notepad stays primary. Reference: "Start a new trip" `HairlineAction`
  (`HomeSurface.swift:125`). Copy: "Or let Kristy plan the cart" `[PLACEHOLDER]`, third person and
  calm. **Anti-slop:** no sparkle or AI glyph, no "magic", no filled green button, no modal, no
  confetti, no checklist-of-days.
- Image source: **none.** It adds no asset or screen, so the art law isn't triggered.
- Route: `forge@opus [T2]` designer. Parallel-safe: yes (with P1). Dial: P1.

### P4 — Fetch + land the plan; the landing action [T2, ui]
- `planCart()` posts `plan: 'kristy'` with the shopper's hard lines (`preferences.wire`) and replaces
  the **empty** local cart with the response. It is a no-op if the cart has rows. The action renders
  in `emptyLanding`.
- Owns: `Kristy/Networking/KristyAPI.swift` (one field on `GuestListBuildRequest`, plus `planned` on
  the response), `Kristy/Core/Cart.swift` (or the file scout Q4 names), `Kristy/Surfaces/Home/HomeSurface.swift`.
- **Done means:**
  - Given an empty cart, when the action is tapped, then the list shows 21 rows under 6 section
    headings, each row with its card.
  - Given a non-empty cart, then the action isn't rendered.
  - Given a 429, then the existing rate-limit line shows and the cart stays empty.
  - Given the planned cart, when the shopper composes "add salsa", then the 21 rows remain (Risk 1).
- **OK rough edges:** no undo beyond "Start a new trip". **Ship bar:** a planned cart overwriting
  any shopper row; a second primary action.
- Route: `dv T2 (fallback forge@opus high)`, critic@opus with a rendered screenshot. Parallel-safe:
  no. Dial: P1.
- Verify: `bash Tools/checks/runners_compile.sh`; one `HomeSurfaceShots` run (one attach) with the
  screenshot read back; `palette_mirror.sh` unchanged. Shut down other simulators first (8 GB box).
- ANCHORs (scout re-copies with exact indentation before dispatch):
  `Kristy/Networking/KristyAPI.swift:218`
  ```
      func guestListBuild(prefs: GuestPrefs) async throws -> GuestListBuildResponse {
          try await client.post(
              "/api/guest/list",
  ```
  `Kristy/Surfaces/Home/HomeSurface.swift:124`
  ```
                                  }
                                  HairlineAction("Start a new trip") { cart.startNewTrip() }
                              }
  ```

## Record + QA

### P5 — Record the ruling [T0, main]
- `docs/DECISIONS.md` Trips and lists: "Kristy plans a cart only on the shopper's tap. A blank list
  stays blank. PLANNED_CART is card-sourced, every section, cart_pick verbatim, template rows."
  Owns: `docs/DECISIONS.md` only. CLAUDE.md is at 20,994 of 21,000 characters, so it gets no new
  line unless one is compressed (`claudeMdSplitCheck`). Route: `main`.

### P6 — QA [qa@sonnet]
- iOS is the product and the web is a redirect, so this runs on the simulator via XcodeBuildMCP UI
  automation, not Playwright. It covers first run → plan → remove a row → compose an add → shop-mode
  wall shown to a guest. At most 8 findings; blockers become the next plan's first pieces. Costs one
  attach. TestFlight build follows (`Tools/testflight.sh`).

## What broken looks like
- The plan wipes rows the shopper typed, or a later compose wipes the plan (Risk 1).
- A row with no card, or a row in shop mode showing a generic line instead of its card's two lines.
- A meat row in a vegan's cart; a section with a heading but no rows.
- The blank list fills itself without a tap.
- Any day or meal name, price, brand, or calorie word on a planned row.

## Risks
1. **Compose `build` mode replaces template rows** (`buildCart` keeps only `swap`/`scan`). If iOS
   sends `build` on a non-empty cart, the shopper's first "add salsa" erases the plan. **Early
   check:** scout Q3 before P4's spec. If it's `build`, P4 sends `edit` whenever rows exist (iOS-only).
2. **cart_pick names don't match back to their own card** (alias drift). **Early check:** P1's
   `cardSlug === id` 21/21 test, plus `listMatchProbe.js` 0 wrong, before any iOS work.

## Open questions (Devon's)
1. Approve the 21-row Appendix (P0) as the "well thought" cart, or set the slot counts differently.
2. Should the shopper's goals add up to 3 picks to the planned cart in v1 (the existing ≤3 adds
   rule), or should v1 be one cart for everyone, filtered by hard lines only? Recommended: one cart.
3. Should the action also appear on a non-empty list as "fill the empty sections"? Recommended: not
   in v1.

## Appendix — PLANNED_CART (filled by P0, awaiting scout)
`[PLACEHOLDER]` Unverified seed candidates (TRY_POOL ids): `salmon_wild_vs_farmed`, `ground_beef_lean_ratio`,
`chicken_cuts_basics`, `yogurt_plain_vs_flavored`, `oats_steelcut_rolled_instant`, `beans_dried_vs_canned`.
