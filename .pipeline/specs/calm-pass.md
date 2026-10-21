PIECE kristy-ios/calm-pass (ui:true, T3: six surfaces, one design; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = large-text piece A as committed (HEAD at launch)
TIER: T3

## Alignment
Devon, 2026-10-21: "on the list built screen on smaller text sizes it looks way too cluttered having the card info on the item ... definetly get rid of that ... as the text size increases our layout should get more minimal ... i want to make sure that we remain relatively minimal throughout the entire app, even in the standard text sizes, this is a very info heavy app especially in places like the counter so i just weant to make sure everything is smooth and legible and digestible".

The design is decided: /Users/m1/kristy/.pipeline/design/calm-pass.md. Read all of it first. Build every piece in its §5 (calm-list, calm-card, calm-counter, calm-shop, calm-home, calm-onboarding) in one pass, to §1 principles, §2 per-surface changes, §3 collapse ladder and §6 anti-slop. Large-text piece A (already in HEAD) owns the type caps and `KristyType.tier`; build on its switches, never re-cap fonts.

Already done in HEAD: list rows show the name only; guidance appears only when a row is open (CartList.swift). Keep it.

Defer, never delete: no corpus text, KB field or server-served string is removed from reach; it moves behind a labelled row ("How to spot it · 3"). Every kept string is an existing string except "How to spot it". No server, corpus or copy change.

Binding brand rules: paper only, no new colours or art; voice has no "I", no "she/her"; do not loosen palette_mirror.sh.

## OWNS
Under /Users/m1/kristy-ios/Kristy/Surfaces/: Home/CartList.swift, Counter/CounterCardView.swift, the CounterCardScreen host (grep "struct CounterCardScreen"), Counter/CounterSurface.swift, Counter/CounterSectionScreen.swift, Shop/ShopMode.swift, Shop/ShopRow.swift (only if needed), the home landing view, the carts sheet, the scan sheet, the onboarding goal step (resolve each ⚠ anchor by grep). Plus any UI/unit test that taps or reads a moved element (`cart.card`, `card.pickSteps`, numerals); tests must compile.

Do not touch: Membership/UpgradeScreen.swift, Membership/TrialDoor.swift, Auth/SignInControl.swift, CardFan.swift, DesignSystem/Typography.swift caps. Nothing in /Users/m1/kristy.

## VERIFY (run what your sandbox allows; the admin re-runs everything unsandboxed)
- Simulator build on iPhone 17 Pro 9D1DEA1B-AC4D-430F-92FA-7EAEC9F1888E only (8 GB box). Do NOT run the UI suite.
- KristyTests unit tests; build-for-testing on the UI target.
- Tools/checks/runners_compile.sh and Tools/checks/palette_mirror.sh.
- Report, per brief §4 acceptance item, what you changed to satisfy it.
No git writes. Report ≤25 lines ending READY or NOT READY.
