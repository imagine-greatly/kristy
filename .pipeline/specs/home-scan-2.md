PIECE kristy-ios/home-scan-2 (ui:true, T2; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = current HEAD (a05f1ca, build 12)

## Alignment
Devon locked these on 2026-10-21 (round 10-12 boards, https://claude.ai/artifact/2J1i3GF8R1Yff2AYba9npq): S4 spacing on the home landing, a new carts-row line, and the Q1 back-of-pack cue on the scan camera. This piece is a delta on home-scan-1: copy, spacing and one overlay. No new colours, no new art, no new files.

Voice: never "I", never "she" or "her". The name appears only as a brand label ("Kristy's carts").

## 1. Home landing: S4 spacing (HomeSurface.swift `emptyLanding`, Home/LandingMasthead.swift)
These are deltas from build 12 as it is now. Keep the existing structure.
- The headline sits 20pt lower: add 20pt above it.
- The headline-to-sub gap goes from 10 to 12.
- The headline block to the seal goes from 32 to 42. The A4 comment's "≥32" still holds.
- The seal goes from 168 to 172 (both frames and the scaleEffect), with the same 168→172 in any HoldingLayout that hard-codes 168.
- The seal to "HOLD TO TALK" goes from 12 to 14.
- "HOLD TO TALK" to the write line gains 10pt.
- The write line to the carts row gains 4pt.
- The scan door stays pinned at the bottom as today.

## 2. Home scroll
The home ScrollView (HomeSurface.swift:45) gets `.scrollBounceBehavior(.basedOnSize)`. The page then stays still when it fits and scrolls when it overflows (small phones, AX sizes). If the deployment target is below iOS 16.4, gate it with `if #available`.

## 3. Carts row copy (HomeSurface.swift:281/284)
- Title: "Or choose one of Kristy's carts"
- Caption: "Seven carts, chosen by hand. About twenty items each."
- The sheet title "Kristy's carts" (CartsSheet.swift:21) is unchanged.

## 4. Scan camera (Scan/ScanCameraScreen.swift)
- REMOVE the top pill "Point it at anything you'd buy." (:84).
- ADD the Q1 cue, centred inside the four corner brackets (the open camera area above the tray):
  - Line 1: "Turn it over." Fraunces 600, 26pt.
  - Line 2: "Shoot the ingredients on the back." ui medium, 16pt, 8pt below line 1.
  - Text colour is card #FAF7EF (Palette's card token) with a soft dark shadow so it reads on any camera image. Centred, about 60pt side insets.
  - accessibilityIdentifier `scan.cue`, combined into one accessibility element.
  - It fades out (Motion token; none under Reduce Motion) while a read is in progress (barcode detected, or shutter pressed / loading). It comes back when the camera is idle again.
  - It stays visible in the simulator's no-camera fallback.
- The tray is unchanged: "One camera, the whole store." and its three rows, plus the shutter.

## Tests
- ScanSurfaceShots.swift:44 and :138: replace the pill assertions with `scan.cue` existing, plus the static text "Turn it over.".
- Re-point any test asserting "Or Kristy builds it for you" or "Seven set carts" to the new copy.
- They must COMPILE. Do not run the UI suite.

OWNS:
- Kristy/Surfaces/Home/HomeSurface.swift
- Kristy/Surfaces/Home/LandingMasthead.swift (and HoldingLayout, only if it hard-codes 168)
- Kristy/Surfaces/Scan/ScanCameraScreen.swift
- KristyUITests/ScanSurfaceShots.swift, HomeSurfaceShots.swift (only if they assert the changed copy)

Nothing in /Users/m1/kristy. No server or networking changes.

VERIFY (run each, then report it):
- Simulator build.
- Unit tests: KristyTests only.
- build-for-testing on the UI test target.
- Tools/checks/runners_compile.sh.
- Tools/checks/palette_mirror.sh.
- `grep -rn "Point it at anything\|Or Kristy builds\|Seven set carts" Kristy KristyUITests KristyTests` returns nothing.

Use one simulator only (8 GB box).

Screenshots, signed-out guest with an empty list:
1. The Home landing.
2. The Home landing at AX5 Dynamic Type, scrolled to the bottom.
3. The Scan tab.

Save them to /private/tmp/claude-501/-Users-m1-kristy/f2fb6f1c-f5ef-4639-8c61-f878c3759570/scratchpad/ios-hs2/. No git writes.

REPORT in ≤30 lines: files, test counts, screenshot paths, deviations, and READY or NOT READY.
