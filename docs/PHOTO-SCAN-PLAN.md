# Photo-anything scanner — plan (2026-10-21, NOT approved, nothing built; plan-review r1 REVISE folded in)
Problem: Devon wants the camera to handle unpackaged food too. Today a photo with no ingredient list is a dead end ("No ingredient list readable"), so the scanner covers only half of what shop mode covers. Need: one shutter, any food, a verdict or a counter card.
Intent: a shopper photographs the ground-beef label at the case and gets the same `ground_beef` counter card shop mode would attach to "ground beef", in the scan sheet. Barcode and panel stay exactly as they are.

## What exists (reuse, do not rebuild)
- Barcode fast path: `ScanModel.sawPayload`/`lookUp` (kristy-ios Kristy/Surfaces/Scan/ScanBranch.swift:274,298) → `POST /api/guest/scan/barcode` (server/routes/scan.js:164) → `extractFromBarcode` (lib/scanExtract.js:357). Monotonic `ticket` drops stale replies (ScanBranch.swift:290,318,399).
- Photo path: `ScanModel.shoot` (ScanBranch.swift:369) → `guestScanLabel` (Networking/KristyAPI.swift:161-187) → `POST /api/guest/scan/label` (scan.js:180) → `readLabelIngredients` (lib/labelVision.js:139, one Haiku call, max_tokens 700, prompt `LABEL_VISION_SYSTEM` :53) → `buildLabelResult` (scan.js:48) → client then calls `/guest/verdict`. Miss states `.retryPhoto`/`.unreadablePanel` (ScanBranch.swift:123).
- scanned_products: `retainProduct` (scan.js:79), `vision/full > vision/partial` by `trustRank` (lib/productStore.js:452).
- Counter matcher: `matchItemToCard(name)` (lib/listMatch.js:202: CONFIDENT, aliasScore>0, skips home + non-aisle, `aliasNamesHead`), `matchItemToPick` (:229), `stateContradicts` veto (lib/perimeter.js:97).
- Card display: `CounterCardView` (Surfaces/Counter/CounterCardView.swift:27), `api.counterCard(slug:)` (KristyAPI.swift:80) → `GET /api/counter/cards/:slug` (routes/counter.js:187, optionalAuth, free).
- Non-food sentence ruled but held back on weak evidence: lib/verdictEngine.js:332.
Missing: (a) vision never says WHAT the thing is when there is no list; (b) no route from a photo to `matchItemToCard`; (c) no positive non-food answer; (d) scan sheet cannot show a counter card.

## Scout first (admin runs `dv scout`, answers become ANCHORs)
1. Which test is the example for a route-level test of scan.js, and how is `readLabelIngredients` stubbed (injectable or module mock)? None found by name (only scanExtract/scanEvents tests).
2. `CounterCardView` init signature: does it take `CounterCard` from `counterCard(slug:)` or `FullCardResponse`? Does it carry its own add-to-list control?
3. Line in ScanSheet.swift where `ScanModel.State` cases render, and the ScanModels.swift line of the label-extraction struct.
4. Does anything already handle photos of unpackaged food? (No hit found; confirm.)

## Pieces (server first; iOS needs S2 deployed)
S1 photo-kind — T2, ui false. Add two fields to the vision JSON: `kind` "panel"|"counter"|"not_food" and `item` (generic food noun, printed name first, sight only when no label; never brand, never price). `parseIngredientsJSON` (labelVision.js:81): unknown/missing kind → "panel" (today's behaviour, byte-identical); `item` trimmed, ≤60 chars, null if empty. Owns server/lib/labelVision.js, server/lib/labelVision.test.js [new]. Verify `cd server && npm test`. Depends: none.
  Done means: Given model text with kind "counter", item "Ground Beef 85/15" → parse returns kind counter, item set; Given garbage kind → "panel"; Given a list present and kind counter → "panel"; Given kind not_food → not_food even with ingredients (review r1: soap ingredients probed `stamp:true` in the engine). `item` passes `cleanItem`: drop marketing/treatment/medical terms, brands (a capitalised token outside the KB alias vocabulary), price and $/lb, numbers except lean ratios; null if nothing generic survives. Regressions: "heart healthy ground beef" → "ground beef"; "$5.99/lb" never survives; a brand never survives.
S2 counter-door — T2, ui false. In `buildLabelResult` (scan.js:48), before the panel branch: kind counter → `matchItemToCard(item)`, then `matchItemToPick(item)`; hit → `{found:false, counter:{slug,section,item}}` or `{found:false, pick:{id,line,avoid?}}`; miss → honest-miss message, no coach. kind not_food (with or without ingredients; short-circuits before retainProduct and the engine) → `{found:false, notFood:true, message:"That isn't something Kristy reads."}`. Neither branch calls `retainProduct`. Panel path and the engine output untouched (non-negotiable 5). `found:false` keeps old builds on their miss sheet; every new branch also carries `source:"vision", ingredients:""` (required by ScanModels.swift:39) and a test decodes each new body with the legacy shape. Owns server/routes/scan.js, server/routes/scanLabel.test.js [new; scout Q1 may rename]. Verify `cd server && npm test` + `node server/scripts/listMatchProbe.js` (0 wrong). Depends: S1.
  Done means: Given stub read {kind:counter,item:"ground beef"} → body.counter.slug is the slug `matchItemToCard("ground beef")` returns; Given {kind:counter,item:"lettuce"} → no home card (`revive_greens` never); Given {kind:not_food, ingredients:[]} → notFood true; Given {kind:not_food} with ingredients → notFood, no verdict; every new body has source+ingredients; retainProduct call count 0 on counter/not_food.
S3 live smoke — main (admin), after S2 is pushed to main (Railway). Five real photos via curl to `/api/guest/scan/label`: meat case label, egg carton, produce sticker, a cereal panel, a dish-soap back. Expect counter, counter, counter|pick, panel verdict, notFood. Five vision calls. The only check that exercises the real model (local key is a placeholder).
I1 scan-sheet-card — T2, ui true (fallback forge@opus). Decode `counter`/`pick`/`notFood` (optional, additive) in Networking/ScanModels.swift; in `ScanModel.shoot` check them before the miss guard: counter → `api.counterCard(slug:)` under the same ticket → new `State.card(CounterCard, item)`; pick → line-only state; notFood → `Miss.notFood(message)`. Render `.card` with `CounterCardView` in Surfaces/Scan/ScanSheet.swift with its own add control suppressed (CounterCardView.swift:54); the scan action (today verdict-only, ScanSheet.swift:72) is wired to card results, `act = resolveAct(for: item)`, so shop mode ticks/adds exactly as for products. The sheet shows "Read as <item>". No seal on a card result (non-negotiable 4). DEBUG seam `kristy.debug.scan=counter:<slug>` next to `kristy.debug.verdict` (ScanBranch.swift:301). Owns ScanModels.swift, ScanBranch.swift, ScanSheet.swift, CounterCardView.swift (add-control flag only), the ScanSurfaceShots UI test. Verify `Tools/checks/runners_compile.sh`, one ScanSurfaceShots run with the seam (≈1-3 attaches of the 20/hour bucket), screenshot for critic@opus. Depends: S2 live, Scout 2-3.
I2 camera-hint copy — T1. Panel-door hint on Surfaces/Scan/ScanCameraScreen.swift names the new reach: "Shoot the back, or the counter label." [PLACEHOLDER, Devon's words]. Owns ScanCameraScreen.swift. Verify runners_compile.sh. Depends: I1.
QA — qa@sonnet on TestFlight build after I1+I2 (the product is iOS; web is a redirect).

## Cost / limits
- Model calls per photo: 1 Haiku vision call, same as today; prompt grows ~150 tokens [PLACEHOLDER estimate], output +~15. Card fetch and matching: 0 model calls.
- Barcode bucket: 30 scans/hour/IP (`scanLookupLimited`, lib/guestRate.js:132), unchanged; the photo door is not on it.
- Photo door draws the shared guest inference bucket: 8/hour/IP with chat/compose/import (guestRate.js:30, `rateLimited`); a guest shooting a meat case uses it up fast.
- Local: `ANTHROPIC_API_KEY` is a placeholder (401), so vision behaviour is unverifiable locally; S3 against Railway is the proof.
- New spend: Anthropic API only, roughly +0-10% per photo; no new vendor, no Higgsfield/gpt-image (no new art: CounterCardView already exists).

## Open decisions (Devon)
1. Unlabelled loose food (bare apple, unwrapped fish): identify by sight? Recommended: yes, and the sheet shows "Read as <item>" so a misread is visible and tappable away.
2. Guest photo budget: keep the shared 8/hour? Recommended: keep for launch, measure via scanEvents, revisit with numbers.
3. Counter-photo misses feed `counter_gaps`? Recommended: not in v1 (adds a gap source under the PERSONAL-data rules); next plan.

## Claim-lock / no-treatment risks (counter label from a photo)
- Printed label claims ("heart healthy", "no antibiotics ever", "natural", "lowers cholesterol") must never reach the sheet in Kristy's voice: vision returns only `item`, and the matched KB card (linted) is the only content shown.
- Misread = wrong claim (rule 7): the `matchItemToCard` gate and `stateContradicts` stay the only path; frozen vs fresh, canned vs fresh, and cut (ground vs steak) come from printed text first.
- Brand: `item` is a generic noun; a brand never goes into matching or sits next to a `watch_out` (rule 9).
- Price on case labels ($/lb): the prompt ignores it, the parse has no field for it (rule 8).
- Non-food sentence only on a positive not_food read with no ingredient list (verdictEngine.js:332); any doubt goes to the panel miss.
- No seal on counter results (counter KB never scored, KBs never merged); home technique cards excluded (`kind=home` skip at listMatch.js:208); medical label text ("for diabetics") ignored, never routed to a card.
- No counter photo lands in scanned_products (products only, no user_id).

## What broken looks like
Cereal panel returns a counter card; "lettuce" photo returns `revive_greens`; dish soap gets a verdict; a meat label echoes "heart healthy"; build 8 crashes on the new fields.
