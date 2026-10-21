PIECE kristy-ios/home-scan-1 (ui:true, T2; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = current HEAD

## Alignment
Devon locked these on 2026-10-21 (canvas F1 home, R3 carts sheet, SA scan). Most shoppers write their own list; the carts are secondary and chosen by hand. Paper brand only: use the existing Palette/KristyType tokens. Exact hexes, for matching only: Oat #E9E2D0 ground, card #FAF7EF, ink #17231C, forest #14472F, secondary text #38443C, hairline #D3C9B2, gold eyebrow #6E5520 (eyebrow text and hairlines only, never fills). Add no new colour unless it is one of these hexes and already exists in Palette. The one exception is the R3 legend greens #4F7A5F and #9DB3A2: if Palette lacks them, add them to Palette AND Brand/tokens.json so that palette_mirror.sh passes. Never loosen palette_mirror.sh. Copy rules: no first person, no em-dash, no price, never "healthy" or "proven".

### Home F1 (empty landing, `emptyLanding` in HomeSurface.swift)
Top to bottom:
1. Headline "What's on the list this week?": Fraunces 600, 36pt.
2. Sub "Say it or write it. It comes back in store order.": ui body, #38443C.
3. Seal, 168pt, with "HOLD TO TALK" under it (13pt, tracking .14em, gold eyebrow colour). Keep the `home.seal` id and the existing hold-to-talk behaviour and HoldingLayout. Change only the copy and size in LandingMasthead.
4. Write line `home.notepad`:
   - Fraunces 21pt text.
   - Placeholder "or write it: eggs, salmon…".
   - 1.5pt #14472F underline.
   - Only the send button `home.notepad-submit` trails it.
   - REMOVE NotepadPhotoButton (`home.notepad-photo`) and its code. Photos now go through Scan.
5. One hairline-separated row, a button with id `home.carts`:
   - Title "Or Kristy builds it for you" (Fraunces 600, 18pt).
   - Caption "Seven set carts, chosen by hand. About twenty items each." (14pt, #38443C).
   - Trailing › chevron.
   - Tapping it opens the R3 sheet.
   - This row REPLACES the `plannedCarts` block: the eyebrow, PlannedCartCard on home, "More carts", and the old plannedCartsSheet.
   - Keep the `home.plan.failure` copy and behaviour, shown under the row.
6. "Same as last trip" HairlineAction: keep it exactly as today (conditional), placed after the carts row.
7. Scan door, pinned near the bottom just above the tab bar. It REPLACES DoorDock on the empty landing:
   - Full-width button, 58pt tall, 1pt #14472F border, radius 12.
   - Barcode SF Symbol `barcode.viewfinder`.
   - Title "Scan any food" (ui semibold), sub "Labels, cartons, fresh food." (#38443C).
   - id `door.scan`. Tap switches to the Scan tab, as `onScan` does today.
   - The counter door leaves home; Counter is a tab.
   - If DoorDock has no other users, delete it. The list-on-screen state (`home.start`, DoorLine) is unchanged.

### R3 carts sheet
Sheet layout:
- Oat ground, top corner radius 28, grabber 40x5.
- Presentation: a large detent starting about 64pt from the top. A `.presentationDetents` fraction is fine.
- Title "Kristy's carts" (Fraunces 600) and sub "About twenty items each, in store order."
- Legend row of four swatches with labels: Meat & fish #14472F, Eggs & dairy #4F7A5F, Produce #9DB3A2, Pantry #D3C9B2.

Three groups. Each group has an eyebrow in gold eyebrow style, then its rows separated by hairlines:
- MEAT FIRST:
  - animal_based "Animal-based" "Chuck, liver, salmon, fruit, honey."
  - nose_to_tail "Nose-to-tail" "Liver, lamb, shellfish, sardines, soup bones."
  - farmhouse "Farmhouse" "Eggs, pork shoulder, bacon, whole milk, sourdough."
- BALANCED:
  - everyday "Everyday" "Eggs, salmon, grass-fed beef, whole milk, greens."
  - mediterranean "Mediterranean" "White fish, beans, olives, greens, sourdough."
- PLANTS:
  - vegetarian "Vegetarian" "Eggs, beans, tempeh, greens, aged cheese."
  - vegan "Vegan" "Beans, tempeh, natto, greens, seaweed."

Each row:
- Name in Fraunces 19pt, with trailing "Build ›" (forest, ui semibold).
- The caption.
- A 6pt-tall, full-width, rounded bar split into the four legend colours by slot count. The counts are [meat&fish, eggs&dairy, produce, pantry], measured from server PLANNED_CARTS at kristy 0531868:
  - everyday 4,5,7,4
  - mediterranean 2,3,6,9
  - farmhouse 4,4,6,6
  - nose_to_tail 6,3,5,6
  - animal_based 5,5,6,5
  - vegetarian 0,4,9,8
  - vegan 0,0,9,12

  A zero segment draws nothing. Store the counts beside the captions in `plannedCartRows`. Add a `// ponytail:` comment saying the counts are a static copy of server slot sections, and need re-measuring when plannedCart.js slots change.

Row behaviour:
- Row id `home.plan.<key>`. Tap dismisses the sheet and calls the existing `loadPlannedCart` path unchanged.
- Captions hide when a hard line is set, as today. The mix bar stays.

### Scan SA (camera first)
The Scan tab no longer shows ScanHome. Delete ScanHome.swift and remove its references.

The tab opens straight onto the camera (reuse ScanCameraScreen's capture, barcode and photo pipeline and ScanBranch/ScanSheet routing unchanged; embed it in the tab rather than a fullScreenCover, or present it immediately on appear, whichever is the smaller diff that still feels camera-first).

Overlay:
- Torch toggle at top right (`scan.torch`, hidden when there is no torch).
- Pill near the top: "Point it at anything you'd buy."
- Four corner brackets framing the centre.
- Paper tray at the bottom, about 350pt tall:
  - Card fill, top radius 28.
  - Title "One camera, the whole store." (Fraunces 24).
  - Three hairline rows, informational and not buttons. Each has an SF Symbol, a title (ui semibold) and a sub (#38443C):
    - Packaged food: "Every ingredient, flagged or cleared."
    - Fresh food: "The counter pick and what to look for."
    - Barcodes: "Read the moment one is in frame."
  - Centred under the rows, a 72pt forest circle shutter with id `scan.shutter`, labelled "Read it" (label under or inside it, accessible label "Read it"). It takes the photo through the existing photo path.

Barcodes keep reading live while the camera is up.

The simulator has no camera: keep whatever fallback ScanCameraScreen already has, and make sure the tray and shutter still render, so screenshots show the layout.

Keep the existing ids that ScanSheet and the tests use (`scan.readAs`, `scan.onLabel`, `scan.counterCard`, `scan.pickLine`, `scan.notFood`, `scan.act`, `scan.reshoot`, `scan.loading`, `scan.unreadable`, `scan.close`). `scan.photo`, `scan.barcode` and `scan.packaged` lived on ScanHome: in the tests, re-point them to the new entry (the shutter, or the tab itself) or delete the tests that only proved ScanHome.

## Read first
- HomeSurface.swift: `showsLanding` :138, `emptyLanding` :212, HairlineAction :244, `plannedCartRows` :270, `homePlannedCartRows` :280, `plannedCarts` :284, `plannedCartsSheet` :311, PlannedCartCard :349, notepad ~:465-500, NotepadPhotoButton :521.
- Home/LandingMasthead.swift.
- Home/DoorDock.swift.
- App/RootView.swift: tabs :22, onScan :268, the Scan tab :281.
- Surfaces/ScanSurface.swift, ScanHome.swift, ScanCameraScreen, ScanBranch.swift and ScanSheet.swift.
- DesignSystem: Palette.swift, Typography.swift (KristyType.Face.serif "Fraunces", Face.uiSemibold), Radius.swift.
- Brand/tokens.json.
- KristyUITests: HomeSurfaceShots.swift (testDoorsEqualSize :284, testListHomeStartAndAddLead :308, testLandingAtAX5 :345), HomeKeyboardUITests.swift :87, ScanSurfaceShots.swift, ScanSheetShots.swift.
- KristyTests/PlannedCartTests.swift.

## Build
1. Implement the three surfaces above. Use the fewest new files: at most one new Home/CartsSheet.swift and one new Scan/ScanTray.swift, and add them to the Xcode project if it is not folder-synced. Add no new art: the seal image already exists, and every icon is an SF Symbol.
2. Tests:
   - Update the UI tests that referenced removed ids. testDoorsEqualSize goes, because there is now one door. Re-point the rest to the new ids. They must COMPILE; do not run the UI suite.
   - Extend PlannedCartTests:
     - The seven keys, in group order.
     - Each caption is one sentence ending in a period, with no I/me/my and no em-dash.
     - Each cart's counts sum to between 18 and 22, and every count is ≥0.
3. Run `grep -rn "home.notepad-photo\|ScanHome\|home.plan.more\|homePlannedCartRows" Kristy KristyUITests KristyTests`. It must return nothing.

OWNS:
- Kristy/Surfaces/Home/*
- Kristy/Surfaces/ScanSurface.swift, ScanHome.swift (delete), the ScanCameraScreen file, and Kristy/Surfaces/Scan/* if present
- Kristy/App/RootView.swift
- Kristy/DesignSystem/Palette.swift and Brand/tokens.json (legend greens only)
- KristyUITests/HomeSurfaceShots.swift, HomeKeyboardUITests.swift, ScanSurfaceShots.swift, ScanSheetShots.swift
- KristyTests/PlannedCartTests.swift
- Kristy.xcodeproj/project.pbxproj (only if needed)

Nothing in /Users/m1/kristy. Do not change the server or the networking types.

VERIFY (run each, then report it):
- Simulator build.
- Unit tests (KristyTests only; NOT the UI suite, because of the rate bucket).
- Build the UI test target for testing (build-for-testing) so it compiles.
- Tools/checks/runners_compile.sh.
- Tools/checks/palette_mirror.sh.
- The grep in Build step 3.

Use one simulator only (8 GB box).

Screenshots: launch as a signed-out guest with an empty list.
1. The Home landing.
2. After tapping `home.carts`: the sheet. If the sheet scrolls, take a second shot scrolled to PLANTS.
3. After tapping Vegan: the filled list.
4. The Scan tab.

Save the PNGs to /private/tmp/claude-501/-Users-m1-kristy/f2fb6f1c-f5ef-4639-8c61-f878c3759570/scratchpad/ios-hs1/. No git writes.

REPORT in ≤30 lines: files, test counts, screenshot paths, deviations, and READY or NOT READY.
