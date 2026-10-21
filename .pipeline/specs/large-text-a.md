PIECE kristy-ios/large-text-a (ui:true, T3: shared type contract, many files; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = 379c59e (build 13)
TIER: T3

## Alignment
Devon, 2026-10-21: "larger text sizes kinda mess up the whole view of the app like the 'whats on the list this week?' stays a certain size but everything else grows, how do we really do it from every visual stance at larger text sizes". Smaller-than-default sizes are out of scope.

The design is decided: /Users/m1/kristy/.pipeline/design/large-text-and-wall.md. Read all of it first. Build PIECE A only:
- §1 caps table
- §2 per-size outline
- §3 global rules
- §4 per-surface changes
- §6 piece A OWNS

Devon's new ask supersedes the D0 caps (display 36). Update the D0 comment in Typography.swift to say so, dated 2026-10-21.

Evidence: today's captures at /private/tmp/claude-501/-Users-m1-kristy/f2fb6f1c-f5ef-4639-8c61-f878c3759570/scratchpad/textsize/<surface>/<L|xL|xxL|xxxL|AX1..AX5>.png.

Binding brand rules:
- Paper only. No new colours, no new art.
- Voice: no "I", no "she/her".
- Do not loosen palette_mirror.sh.

## OWNS
§6 piece A: Typography.swift, LandingMasthead, the home landing view, the carts sheet, ListHomeHeader, the list row and add field, the scan cue and sheet, the counter card, shop mode, onboarding, Controls.swift (primary/hairline actions), and every remaining `.system(size:)` file EXCEPT these piece B files:
- Membership/UpgradeScreen.swift
- Membership/TrialDoor.swift
- Auth/SignInControl.swift
- CardFan.swift

Do not touch those four. Resolve the ⚠ grep anchors yourself. Also own any UI/unit test that asserts changed copy or the old caps; tests must compile.

Nothing in /Users/m1/kristy. No server or networking changes.

## VERIFY (run each, then report it)
- Simulator build: iPhone 17 Pro, 9D1DEA1B-AC4D-430F-92FA-7EAEC9F1888E. Use this simulator ONLY (8 GB box).
- KristyTests unit tests, plus Typography's verifyTypeScale/verifyRegister and the new verifyLongestWord.
- build-for-testing on the UI test target. Do NOT run the UI suite.
- Tools/checks/runners_compile.sh and Tools/checks/palette_mirror.sh.
- `grep -rnE "size: *[0-9]+" Kristy | grep -v relativeTo | grep -E "font|system\("` lists only B files or justified chrome icons. Name each one left.
- Screenshots per design §7, at L, xxxL, AX3 and AX5:
  - surfaces: home-landing, carts-sheet, list-home, scan, counter, counter-card, shop-mode, haul, onboarding
  - set the size with `xcrun simctl ui <id> content_size <size>`
  - reset to `large` at the end and read it back
  - save to /private/tmp/claude-501/-Users-m1-kristy/f2fb6f1c-f5ef-4639-8c61-f878c3759570/scratchpad/textsize-a/<surface>/<label>.png
- Check every §7 row against your own shots and say pass or fail per row.

No git writes.

REPORT in ≤30 lines: files, the caps table as built, test counts, the §7 pass/fail per row, the remaining fixed fonts, deviations, and READY or NOT READY.
