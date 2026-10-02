# List first + the seal is the logo + everyday coverage — PLAN
**APPROVED 2026-10-02 by Devon: D1–D10 at the recommended defaults, plus four amendments (folded in below). Nothing dispatched.**
**Positioning (Devon, binding on every brief):** Kristy is a **GUIDED GROCERY SHOPPING** app. It walks the shopper through the store item by item and says how to shop each one for the best and healthiest of it ("100% grass-fed or grass-finished"). The list is the plan; shop mode is the guided walk; the walk is what the membership buys.
**Problem.** Home buries the list. The field is small; mic and photo are unwired (`onMic`/`onPhoto` are nil on Home, AUDIT-2026-08-18:107). After trip 2 a free shopper loses the list entirely (I1–I4, live). The Counter is slow and misses everyday items (bacon, Cheerios, pretzel bread). The APPROVED seal appears only on the empty landing.
**Starting state** (handoff 2026-10-02): pricing S1/S2 and I1–I4 are DONE. kristy `main` 5cf8330 is LIVE (tripGate). kristy-ios is past c489638 (Light pin; build 2 not uploaded). **Markers:** [SERVER] governed, own approval line · [MIGRATE] `migrateCounterCards.js` · [PUSH] deploys `main` · [RULES] amends a non-negotiable.

## The rulings, and the rule text they override (quoted)
**Ruling F (Devon):** "free users can edit and create their lists but they can only put them to use in shopmode which is paid, the creation of their list encourages buying shop mode". Trips 1–2 stay the full trial, shop mode included, and the ask still lands on trip-2 Finish. Changed lines:
- **PRICING-MODEL.md:**
  - :33-34 and :894-895, "**Making a list and walking a trip are members only.**" → "**Walking a trip (shop mode) is members only; creating and editing a list stays free.**"
  - :38-39, :577-582 and :899-901, "**What stays locked is SEEDING**" → reuse is creation, so it is free (D1). Only the walk is locked.
  - :58-64, "### ⚠️ NO PARTIAL LIST, EVER … a lapsed shopper reads a dead copy of their last one", and :936-939, "greyed and **non-interactive**" → "NO PARTIAL WALK, EVER: shop mode is binary. A free list is created and edited, never put to use outside shop mode (no check-off, D2)."
  - :16-17 and §4 :545-555 (the read-only list; the ask "on the disabled compose field") → the ask appears on **Start shopping** only.
  - :675 trip-2 copy → D4.
  - **Unchanged:** §4 :557-564 "Shop mode — MEMBERS ONLY, GATED AT THE DOOR AND NOWHERE ELSE" and the hard constraint :52-56.
- **kristy/CLAUDE.md** Money, "lists/walking members only; … haul free, seeding locked." and "No partial list ever;". **docs/DECISIONS.md** "Money" mirrors it verbatim.
- **kristy-ios/CLAUDE.md:897** "**The list is free**, and it is the retention engine." Keep it and re-date it. Delete :900 (the fourth-full-read ask was retired by I3).

**Ruling S (Devon):** "the olive seal is the logo, there were never any words on it". The seal is the logo and the app icon on solar kraft, with a bigger Kristy logo inside it, and it sits at 50% size on Home. Changed lines, **all three or none** (NN1):
- **kristy/CLAUDE.md:**
  - NN1, "Forest green and brass live only on the logo's plate (icon, scan corner mark); brass off it is forbidden (2.08:1 on paper, 1.24:1 on kraft)".
  - NN4, "Empty-landing seal only; static forest-plate scan-corner logo iff server `stamp` true, else empty".
- **kristy-ios/CLAUDE.md:** NN1, and :869-870 "survives as the empty landing's mark, nowhere else".
- **Brand/tokens.json `_stance`:17** "THE FOURTH REVERSAL … The icon and the scan card corner stay the logo on its plate." → add a new FIFTH REVERSAL key; never edit the fourth.
- **paper.md** §0 and :495. **seal.md** :7-8 and :11-13. **Memory** `kristy-seal-dropped.md` (the admin edits it).
- **Brass rule text:** "Brass appears only as struck metal inside the seal artwork, an image asset; never a UI colour, text, rule or fill." `palette_mirror.sh` stays untouched.

## Scout first (`dv scout`, admin-run; only VERIFIED lines become ANCHORs)
1. Where `LandingMasthead(markHeight:…spins: true)` is called, and with what height. Asset paths and sizes for `AppIcon.appiconset`, `KristySealCoin.imageset` and the scan-corner mark.
2. Which server calls shop entry, check-off and Finish make on iOS today. Every `canRunATrip` site in `routes/list.js` and `trips.js`. The expected set in `tripGateRoutes.test.js`.
3. Everything on iOS that enforces the lapsed lock: `LapsedList.swift`, the R123 counter-add guard, `LapsedFlowUITests` test 2, `purchase_rules.sh`, the seed guard (`HomeSurface.swift:489`).
4. Home hero states and the ComposeField call sites. The row view Home and ShopMode share. ShopMode's sections, rail, add field and ask.
5. The Counter keystroke-to-render path. Does `/api/counter/ask` ever call a model or write? Where are the counter routes defined?
6. **Corpus inventory:** every KB entry with id, `kind` (card, pick, home) and section. Which entries are CATEGORY cards, meaning one card answers a whole aisle class (cereal, bread, juice)? Where do picks live? Input shapes for `counterReach` and `listMatchProbe`. Do-line source per card. Note: `docs/CATEGORY-CAPTURE.md` is the SCAN catalog's aisle vocabulary, not counter cards; "catalog before swaps" binds scan swaps only. Do not widen that vocabulary (Open items ⛔).
7. The example to mirror per category. Does anything already do part of this (speech code; callers of `KristyAPI.swift:279`)?

## Intent
Open Kristy: the olive APPROVED seal, which is also the home-screen icon on kraft, turns flat and small above a big paper composer. Type, speak or photograph a list; review it; Send. It comes back as calm rows, and every everyday item carries a one-line "how to shop this". Once a list exists, Home's one primary is **Start shopping**: the guided walk. For a free shopper, that door is the ask. **The moment that must land:** a free shopper with a finished list taps Start shopping and meets the ask, never a dead list.

## Non-goals
`client/src` (frozen). The engine shape. Chat. Prices. The trial length. The Haul. New compose, import or seed endpoints (they exist). **Exotic and niche foods off launch.** **Displaced:** the `.lapsed` read-only home from I1/I2; the UI-suite re-baseline.

## Design direction (a designer@opus brief precedes every ui piece; H1 and S1 briefs open with the Positioning line)
- **Palette:** kraft `#CFBA8E` ground; card `#F5F1E6` with a `#B09B68` hairline; `inkMuted #414F45`, ochre `#5D450E`, orange `#7E2E0D`. The green fill goes on the one primary only (paper.md:253).
- **Type:** Fraunces 30pt prompt [PLACEHOLDER]; Inter 19pt field, ≥3 lines at rest. A row is a 12pt caps eyebrow plus a 16pt do line.
- **Layout, Home state A (no list):** the seal at 60pt [PLACEHOLDER, 50%] over a composer filling ≥55% of 844pt. Mic, camera and Send sit inside the box. Counter and Scan are tier-3 doors.
- **Layout, Home state B (list exists):** a filled Start shopping at the top, the editable list beneath it, and the composer collapsed to one line.
- **Layout, Shop:** one section per page under the existing rail, with that section's guidance line leading the page.
- **Reference:** the iOS Messages composer; Apple Reminders row rhythm; paper.md §0.
- **Anti-slop:** no segmented Type/Speak/Photo, chat bubbles, gradient hero, page dots, opacity demotion (§5.11), lock glyphs, second primary, or 3D.

## M1: build 2 (ships first)
**P1 Seal: flat, in-plane, half size.**
- **Owns:** `Kristy/Surfaces/Home/LandingMasthead.swift`, the scout-1 call site, `docs/ios-specs/seal.md`.
- **Criteria:** G the empty landing. W two screenshots 3s apart. T the same flat face, rotated in-plane, at 50% height. `grep -c rotation3DEffect` → 0. With Reduce Motion, the mark is static.
- **Route:** forge@opus [T1] ui; critic@sonnet on the frame pair.
```
forge model: opus [T1] ui
ANCHOR /Users/m1/kristy-ios/Kristy/Surfaces/Home/LandingMasthead.swift:69
    let angle = (t.truncatingRemainder(dividingBy: 14)) / 14 * 360
    markImage(imageName)
        .scaleEffect(x: cos(angle * .pi / 180) < 0 ? -1 : 1, y: 1)
        .rotation3DEffect(.degrees(angle), axis: (x: 0, y: 1, z: 0), perspective: 0.4)
ANCHOR <scout-1 call site of LandingMasthead(… spins: true)>   (filled from scout; not dispatchable before)
Change: 14 → 30 in both places; delete the .scaleEffect line; .rotation3DEffect(...) → .rotationEffect(.degrees(angle));
  comments :17 and :57 "about the vertical axis" → "in-plane, flat"; at the call site markHeight → half of it;
  seal.md:11-13 → "turns slowly in-plane (2D, never 3D), 30 s per turn, half its 2026-09-25 size; ruled 2026-10-02".
Verify: cd /Users/m1/kristy-ios && Tools/checks/run_all.sh > /tmp/p1.log 2>&1; echo $?  → 0 (never piped);
  grep -c rotation3DEffect Kristy/Surfaces/Home/LandingMasthead.swift → 0; attach a simulator screenshot pair.
Report ≤30 lines.
```
Then Devon runs `Tools/testflight.sh`. Build 2 still carries the I1 lapsed home; only Devon tests it.

## M2: rules, seal art, free list
- **R1 [RULES] Ruling S, in one commit:** both CLAUDE.md files, tokens.json, paper.md, seal.md. forge@opus [T2] docs.
  - Verify: `node server/scripts/claudeMdSplitCheck.js HEAD` reports 0 missing; `wc -m CLAUDE.md` ≤ 21000; `palette_mirror.sh` passes.
  - Check: grep each quoted old line → 0 hits.
- **R2 [RULES] Ruling F, after R1:** every PRICING/CLAUDE/DECISIONS line quoted above. forge@opus [T2]; critic@opus.
  - Verify: the split check; `grep -n "Making a list" docs/PRICING-MODEL.md` → 0.
- **A1 Seal and icon art:** designer@opus brief at `kristy-ios/.pipeline/design/seal-icon.md`. Look at the live seal and logo first.
  - Source: a **gpt-image edit** (Codex image_gen) of the existing `KristySealCoin` master (olive seal, no words). Explore at medium quality; finalize at high. Higgsfield only with CREDITS APPROVED.
  - (a) The seal with the Kristy logo ~30% larger [PLACEHOLDER], nothing else changed.
  - (b) The icon: 1024² opaque, `#CFBA8E` full bleed, the seal centred at ~80% [PLACEHOLDER].
  - (c) The scan-corner seal (D3), static.
  - Proof sheet at 1024/180/60/29px. Devon sees it before A2.
  - Anti-slop: no bevel, halo or added words; the logo is pixels from the asset, never redrawn.
- **A2 Install:** `AppIcon.appiconset/*`, `KristySealCoin.imageset/*`, the scan-corner imageset (scout-1). forge@opus [T1] ui.
  - T: the springboard icon is the seal on kraft. A scan card with `stamp: true` shows the seal.
  - Verify: `run_all.sh`, `scan_rules.sh`.
- **G1 [SERVER][PUSH] The gate follows Ruling F.** Owns `server/lib/tripGate.js`, `server/routes/list.js`, `server/test/acceptance/tripGateRoutes.test.js`.
  - **Ungate:** `/list` (GET/POST), `/list/rebuild`, `/list/compose`, `/list/swaps`, `/list/import`, `/trips/next` (D1).
  - **Keep gated:** `/trips/new`, plus the shop-entry call scout-2 finds.
  - The cap stays `LIST_COMPOSE_FREE_LIMIT` 12/day.
  - Criteria: G a spent non-member. W `POST /api/list/compose`. T 200. W `POST /api/trips/new`. T 402 `trip_allowance`.
  - Route: dv T2 (fallback forge@opus); critic@opus.
  - Verify: `cd server && npm test` = 748 + new, 0 fail.
  - **Approval line:** "Devon approves G1 (server, production push)."
- **G2 iOS: retire the lapsed lock.** Delete `LapsedList.swift`; remove the R123 guard; invert `LapsedFlowUITests` test 2; re-anchor `purchase_rules.sh` (scout-3).
  - `enterShopMode` with `isSpent` still presents the ask. Check-off stays inside shop mode only (D2).
  - forge@opus [T2]; critic@opus. Lands in the same build as H1.

## M3: Home (build 3)
- **H2 Inputs:** `Kristy/Core/SpeechInput.swift` [new] (`SFSpeechRecognizer`, on-device), `Kristy/Core/ListPhotoReader.swift` [new] (Vision OCR, one item per line, D8), and `Config/Info.plist` usage strings (zero first person). Both write to the field and never compose. dv T2 (fallback forge@opus).
- **H1 Home, two states:** `HomeSurface.swift`, `Hero.swift`, `ComposeField.swift`.
  - **A (no list):** the seal plus the composer, and "Same as last trip" → `cart.seedFromLastWeek()` (free, D1).
  - **B (list exists):** Start shopping as the one primary; the list editable inline. For a spent shopper, Start shopping opens the ask.
  - Criteria: G a list → exactly one filled control. G spent → a tap opens the ask, not ShopMode. G mic → text lands in the field with no network call before Send.
  - forge@opus [T2] ui; critic@opus with 390pt shots of A, B and B-spent.
  - Verify: `run_all.sh`, `Tools/triploop`.
- **L1 Calm rows:** the shared row view (scout-4). An eyebrow plus a do line at rest; one row open at a time; ≥20pt gaps. forge@opus [T2] ui.

## M4: counter speed
- **M1 Measure (diagnosis only):**
  - curl `-w` timings, 5× each, for `/api/health` and `/summaries`.
  - `/ask` for bacon, cheerios and pretzel bread, cold and warm (≤6 asks; the limit is 8/hr).
  - Output: a per-stage ms table.
- **F1 Fix, shaped by M1:** (a) [SERVER] take any model call off the request path; (b) client debounce and serial awaits; (c) an on-device index only if the network dominates (D6). Target ≤500ms warm [PLACEHOLDER].

## M5: everyday coverage, "absolutely nailed" (server and corpus; runs alongside M2–M3 as a different repo)
- **CV1 Matrix.** `server/scripts/everydayAudit.js` + `server/scripts/everydayTerms.json` [new]. ~300 everyday list items [PLACEHOLDER] across: meat, poultry, eggs, fish, grains, breads (pretzel bread), fruit, vegetables, dairy, drinks (kombucha, orange juice, coffee, milk alternatives, sodas, waters), snacks and cereal.
  - Term source: a real everyday-groceries list that Devon reviews, not invented.
  - Each item passes through the `counterReach` retrieval and `listMatch`, then prints `term · section · card|pick|category|GAP`.
  - An empty terms file exits 1 (`nonEmpty`). The GAP count per section is the backlog.
  - dv T2; critic@opus. Verify: `node scripts/everydayAudit.js`; `npm test`.
- **CV2… Gap closure: one batch per section, ≤8 new cards or picks per batch [PLACEHOLDER].** One KB file per batch stays under 100k tokens.
  - **Order:** meat & poultry (incl. bacon and cured meats) → eggs & dairy → fish → produce → grains & breads → drinks → snacks & cereal.
  - **Aliases first:** a GAP an existing card answers gets an alias, not a card (Cheerios → the cereal category card). One long specific alias per hub steal. No brand named in card text (D7).
  - **Category cards** answer the whole class (bread: what to read on the ingredient list). Pretzel bread is an alias on the bread card unless its own entry material supports a separate line. Which category cards exist versus are new comes from scout-6, printed by CV1, never assumed.
  - **Every batch:** claim lock (matched KB only), NN3 symmetric (label truth, never "causes"), `lintCard`, 3+ `asked_as` from questions, fold rules (`RETIRED` lists), `listMatchProbe` 0 wrong, then MIGRATE and PUSH.
  - forge@opus [T2]; critic via `dv ask --role critic`.
- **CV-O Organic by item** (the produce batch). Per-item guidance (buy organic vs conventional is fine) comes from **FETCHED** residue data.
  - Fetch with Firecrawl into the research archive. ams/usda/fsis .gov URLs return 403 from the Mac, so use govinfo.gov and law.cornell.edu mirrors or Firecrawl.
  - Every cited URL is `grep -F` checked in the archive; forges invent URLs.
  - Framed as residue and label truth, never a health outcome. Dial P2.
- **B1 Lead lines ≤14 words** via `do-lines-review.md` → `buildDoLines.js` [MIGRATE][PUSH], batched with CV.
  - Grass: *Look for grass-finished or 100% grass-fed. Both mean grass, whole life.* The KB supports it.

## M6: shop mode (build 4)
- **S1** One section per page (`ShopMode.swift`, `ShopSectionPage.swift` [new]): horizontal paging between sections, vertical scrolling within one. The page opens on the section's how-to-shop line, which is the guided walk. Explicit Finish stays.
- **S2** A bigger add field and a centred Ask sheet.
- Both forge@opus [T2] ui. Verify: `run_all.sh`, `trip_finish_order.sh`, `triploop`.
- **Q:** qa@sonnet on the simulator after builds 3 and 4, ≤8 findings.

## Decisions (resolved 2026-10-02, recommended defaults)
- **D1** Reuse last trip: free.
- **D2** No check-off outside shop mode.
- **D3** The scan-corner mark becomes the seal.
- **D4** Trip-2 ask copy: "That was the free run. Lists stay free; walking the store with Kristy is the membership from here."
- **D5** Withdrawn (the seal has no words).
- **D6** An on-device index only if M1 shows the network dominates; it then needs a §0 ruling.
- **D7** Brand aliases yes; no brand in card text.
- **D8** On-device OCR.
- **D9** Lead lines capped at 14 words; the grass line as written above.
- **D10** Spin period 30s.

## What broken looks like
- A spent shopper enters ShopMode or checks off a row; a free shopper meets a greyed list.
- `/trips/new` returns 200 for a spent non-member.
- Two filled controls appear on Home.
- Dictation composes without Send.
- Brass appears as a UI colour.
- An everyday item from CV1 still prints GAP at launch.
- An organic line cites a URL that is not in the archive.
- The counter takes >1s warm.

## Risks
- **The server and device gates disagree.** Early check: scout-2 runs before G1, and G2 ships in the same build as H1.
- **Coverage sprawls.** Early check: CV1's GAP count per section is fixed before any batch, and exotic items are cut at matrix review.
