# Pricing build plan: the locked model, built (for Devon's approval)

Binding: `docs/PRICING-MODEL.md` §0–§3a. Nothing here re-derives it. **Stakes: minimum T2, Opus critic on every piece. Nothing is implemented until Devon approves.**
**Problem:** today the app's only commercial surface (`TripAskSheet`) is held shut by `TripAllowance.gateIsBuilt = false` (`kristy-ios/Kristy/Core/TripAllowance.swift:64`), because trip 3 works and the counter's depth is still paid. Nobody can pay for the list, which is the product. **Request as given:** $5.99/mo, 2 free trips, ask at the end of trip 2, scanner and counter always free.
**Already built (do not rebuild):** the ask sheet and its copy rules (`Surfaces/Membership/TripAskSheet.swift:68`, presented once at `App/RootView.swift:337-362`), the count (`Core/GuestTrips.swift:153`), `reconciled` (`TripAllowance.swift:153`), the crossing (`Core/Cart.swift:398`), the import client (`Networking/KristyAPI.swift:361-388`), RevenueCat (`Core/RevenueCatProvider.swift`, `App/KristyApp.swift:59`), `Pricing.monthlyCents = 599` (`Core/Pricing.swift:36`).

## Scout first (`dv scout`, admin-run; only VERIFIED lines become ANCHORs)
1. `dv scout "where DEPTH_FIELDS, the counter summarize() and forViewer() are defined" --terms DEPTH_FIELDS,forViewer,ESSENTIAL_RANK` (not in `server/lib/scanEvents.js`; `routes/counter.js:32,97-284` only calls them).
2. `dv scout "which file renders the Haul seed door and calls Cart.seedFromLastWeek" --terms seedFromLastWeek,HaulSurface` (`Core/Cart.swift:490`).
3. `dv scout "does CounterModels decode faded_lengths as required; what does the full-card decode accept" --terms fadedLengths,CounterTeaser` (`Networking/CounterModels.swift:181` is non-optional; if S2 stops sending it, shipped builds break).
4. `dv scout "rules in Tools/checks/purchase_rules.sh and counter_rules.sh that assert CardMeter, UpgradeMoment or the teaser exist" --terms CardMeter,UpgradeMoment`.
5. `dv scout "is there a RevenueCat webhook route that writes subscriptions provider=apple" --terms provider,revenuecat`.
6. The best example to mirror per category: server route guard test, iOS hero state, iOS gated control. Also: does anything already gate `/list` or `/trips` on an allowance? (`list.js:131,246,415` are personalization; `:283` is a budget; both stay.)
Every forge ANCHOR below is filled from this survey. **A piece whose anchor is not VERIFIED is not dispatched.**

## Intent
Trip 1 and trip 2 work with no account. Finishing trip 2 opens the ask: numbers first, the price from `Pricing`, and sign-in before purchase. A shopper who declines lands on the `.lapsed` home: last week's list greyed, the Counter live with no ask, and the list and the seed door locked behind that same ask. Every counter card is now free in full. **The moment that must land:** the Finish tap on trip 2 shows the ask once, and trip 3 is then not startable, on device or through the server.

## Non-goals
- Web `client/src`: frozen; it keeps the old model by omission.
- The reinstall loophole (accepted; no IDFV or IP table).
- `evaluatePremium` and `is_premium()`: zero change.
- No `.storekit` file, no iOS `claimGuestWork`, `MemberID` stays required. Price changes and the swap engine are out.
- **Displaced:** the 7-day promo and the iOS UI suite re-baseline wait for D1 and P0.

## Design direction (I1–I3)
- **Palette:** kraft ground `#CFBA8E`, card `#F5F1E6`, green-black ink from `Brand/tokens.json`.
- **Greyed list:** a muted ink token, never opacity, and the contrast floor holds.
- **Type:** Fraunces serif hero. The lapsed hero is the first child and the largest type.
- **Reference:** `HaulSurface.swift:162` `FinishedTripCard` for the greyed list. `paper.md` §0.
- **Anti-slop:** no lock glyphs, blur, countdown, modal-on-launch, brass off the plate, or second filled action (`.onePrimaryActionAtMost`, `HomeSurface.swift:232`).
- **No new assets, so no Higgsfield spend.**

## Pieces
**S1 Server: the trip gate (SERVER CHANGE, separately approved).** Own `server/lib/tripGate.js` [new] (`canRunATrip`, `allowanceRemaining`, `completedTrips`), `server/routes/list.js`, `server/routes/trips.js`. Gate the §2 route set; add `completedTrips` to `GET /trips/seedable` (`trips.js:115`, fallback `:126`).
- G a user with 2 completed trips and no subscription, W `POST /api/trips/new` or `POST /api/list/compose`, T 402 and no row written.
- G a member, T 200.
- G any request, W `GET /api/trips/seedable`, T the body carries `completedTrips` equal to `count(status='completed')`.
- [test] `server/test/acceptance/tripGate.test.js` walks the router stack: every handler under `/list` and `/trips` references `canRunATrip`, none calls `premiumForReq` directly. Asserted `nonEmpty`.
- route: forge-deep@opus [T3] → `dv ask --role critic` → one fix pass → T3-LEDGER. Economy gate. Parallel-safe: yes (with S2).
- Verify: `cd server && npm test`, expecting baseline 730 + new, 0 fail.

**S2 Server: invert the boundary (SERVER CHANGE).** Own `server/routes/counter.js`, the scout-1 file, `server/lib/paidBoundary.test.js` (rewritten, not deleted).
- Retire `DEPTH_FIELDS` withholding, `FREE_READ_LIMIT` (`counter.js:32`), the 402 (`:201-207`) and the teaser. `ESSENTIAL_RANK` stays.
- G a guest, W `GET /counter/cards/:slug/full` five times, T five 200s with `why` and `sources` present.
- G any card, T `tier_note` ≥5 words (kept).
- route: dv T2 (fallback forge@opus); critic@opus. Parallel-safe: yes. Verify: `cd server && npm test`.

**I1 iOS: `.lapsed` hero + shop-mode entry gate.** Own `Kristy/Surfaces/Home/Hero.swift` (`:16`, `:24`), `Kristy/Surfaces/Home/HomeSurface.swift` (`:131`, `:450`, `:559` `enterShopMode`), `Kristy/Surfaces/Home/LapsedList.swift` [new].
- G `tripsCompleted == 2` and a guest, T the hero is `.lapsed` (resolved before `.completed`) and START is absent.
- `enterShopMode` with `isSpent` true presents the ask, not shop mode.
- G a member, T the five states are unchanged.
- **T4 tournament, N=2:** forge@fable vs forge-deep@opus in worktrees; critic@opus judges on rendered 390pt screenshots. Criteria: (a) §4 fidelity, (b) one filled action, (c) no state reachable that starts trip 3, (d) diff size. Cost ≈ 2×T3. The forge@opus merge, then one forge@fable notes pass. ROADMAP P3 step 10 names this. ui: true. Parallel-safe: no.
- Verify: `Tools/checks/run_all.sh` and `Tools/triploop` (200 checks).

**I2 iOS: locks + carry notice.** Own `Kristy/Surfaces/Home/ComposeField.swift` (`:35`), the scout-2 seed-door file, `Kristy/Surfaces/Auth/SignInSurface.swift` (`:20`).
- G lapsed, T the compose field is disabled and its tap opens the ask.
- The seed door is locked with the ask; the Haul still reads.
- G a sign-in carrying device trips, T `CarryOverNotice.of(book)` (`Core/CarryOver.swift:62`) renders once.
- route: forge@opus [T2] ui; `dv ask --role critic` with a screenshot. Parallel-safe: no.
- Verify: `Tools/checks/run_all.sh`, `Tools/checks/purchase_rules.sh`.

**I3 iOS: de-meter the counter.** Own `Kristy/Surfaces/Counter/CounterSurface.swift` (`:66`, `:74`), `Kristy/Surfaces/CardSheet.swift` (`:88`), `Kristy/Surfaces/Shop/ShopMode.swift` (`:282`), `Kristy/Surfaces/Counter/CounterCardView.swift` (teaser `:282-310`, `:550-605`, `:680`); delete `Kristy/Surfaces/Membership/UpgradeMoment.swift`. The exception is stated: 4 edits, all deletions, under 150 lines.
- G a card, W 4+ full reads, T no `UpgradeMoment` and no faded block.
- `grep -r UpgradeMoment Kristy` → 0 hits.
- route: forge@opus [T2] ui. Parallel-safe: no. Verify: `Tools/checks/counter_rules.sh`, `Tools/checks/run_all.sh`.

**I4 iOS: wire the count, open the gate (LAST build piece).** Own `Kristy/App/RootView.swift` (`:229-234` `serverTripCount: 0` → seedable's `completedTrips`; `:417` drop `CardMeter`), `Kristy/Networking/KristyAPI.swift` (decode `completedTrips`), `Kristy/Core/TripAllowance.swift` (`:64` → `true`); delete `Kristy/Core/CardMeter.swift`.
- G server 2 and device 0 after a reinstall, T `reconciled` = 2.
- G device 2 and server 0, T 2.
- `purchase_rules.sh` rule 10 (one presenter) holds.
- Re-read the sheet copy against what shipped (doc at `:58-63`).
- route: dv T2 (fallback forge@opus); critic@opus. Parallel-safe: no. Verify: `Tools/checks/runners_compile.sh`, `Tools/checks/trip_finish_order.sh`, `Tools/triploop`.

**Q: QA.** qa@sonnet on the simulator (XcodeBuildMCP; the client is iOS, not web), ≤8 findings. It walks trip 1 → trip 2 → ask → decline → lapsed → Counter full read. Blockers become the next plan's first pieces. The UI suite runs once, only if Devon asks (20/hr bucket).

**Order:** S1 ∥ S2 → I1 → I2 → I3 → I4 → Q.
- Server pieces commit to `held`. **Push `main` only together with an I4 build, and after P0.** S2 live alone is harmless (counter free everywhere). S1 live alone gates nobody: no accounts exist.

## Before a TestFlight purchase works (Devon, manual)
1. App Store Connect:
   - Paid Apps agreement, tax and banking.
   - A subscription group with monthly $5.99 and annual $44.99, both Ready to Submit.
   - A sandbox tester.
2. RevenueCat: both products attached to the entitlement and offering (current), and the App Store Server Notifications URL. Server receipt via scout 5; if absent, that is a new server piece.
3. **P0 (ROADMAP):** SIWA on a real device, completing one token exchange (PURCHASING §6 step 5, §7.3). Then sandbox buy, restore, cancel and lapse. Run `Tools/checks/storekit_local.sh` first.
   - Proof: a `subscriptions` row with `provider='apple'`.

## Decisions only Devon can make (defaults recommended)
- **D1 Two trials:** retire the 7-day promo (`routes/subscription.js:30`, `ensureTrial` `lib/subscription.js:104`, `Surfaces/Membership/TrialDoor.swift:36`). **Default: retire it in a follow-up piece**; the trip allowance supersedes it.
- **D2 Verdict-note personalization** (`free_notes_used`). **Default: stays a member benefit.**
- **D3 `server/lib/cartFree.test.js`** greps the frozen web client. **Default: untouched;** the web keeps the old model by omission.
- **D4 Trip-2 copy** (PRICING-MODEL §5). **Default: ship as built,** after I4's re-read.
- **D5 Sequencing:** ROADMAP §3 recommended (c), ship the baseline first. **Default: build now, hold the `main` push until P0 passes.**

## What broken looks like
- Trip 3 starts on device or via `/api/trips/new`.
- The ask shows on trip 3+, or twice.
- Any counter card returns 402.
- A shipped build fails to decode a counter card.
- A list half-renders (partial list).
- `reconciled` lowers a server count.

## Risks
- **A missed gate site** gives trip 3 free. Caught by S1's router-walk test before any iOS work.
- **Nothing authed is provable until one SIWA exchange:** count, reconcile and purchase run only in tests. Caught by P0 gating the `main` push and I4's flip.
- **The wire decode** (scout 3): if `fadedLengths` is required, S2 must keep the field or ship after the iOS build. Decided before S2 dispatch.


## Approval
APPROVED by Devon 2026-10-01, all decisions at the recommended defaults (D1–D5).
