PIECE kristy-ios/wall-b (ui:true, T2: the one wall, three files; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = HEAD at launch (piece A cf3596a + calm-pass wip)
TIER: T2

## Alignment
Devon, 2026-10-21: "we need to redo the paywall its too text heavy and such especailly at larger viewports, i want you to think of how the biggest and best apps do it, we shouldnt be reionventing the wheel with this". Devon approved Layout A and "no trial timeline" ("this all looks good ship all of ur recs").

The design is decided: /Users/m1/kristy/.pipeline/design/large-text-and-wall.md. Read §0-§3 (type roles and rule 8 already built in HEAD by piece A; use `KristyType` roles and `KristyType.tier`, never `.system(size:)`), then build §5 exactly (L, xxxL and AX5 layouts). Research behind it: /Users/m1/kristy/.pipeline/research/paywall-patterns.md (read-only context).

Also apply the calm rule (Devon, same day): the layout gets more minimal as text grows, never adds elements; ≤35 visible words at L.

Binding:
- Prices only through `Core/Pricing.swift` (read-only); no hardcoded figures; saving derived and floored.
- No billed-on-day-7 / trial timeline copy.
- Purchase lifecycle untouched (`Tools/checks/purchase_rules.sh` must still pass; TrialDoor copy and placement only).
- One wall stays the only auth + paywall surface. Paper only, no new colours or art. Voice: no "I", no "she/her".
- Keep accessibility ids the UI tests use (`upgrade.done` etc.); the xmark keeps label "Not now".

## OWNS
- Kristy/Surfaces/Membership/UpgradeScreen.swift
- Kristy/Surfaces/Membership/TrialDoor.swift
- Kristy/Surfaces/Auth/SignInControl.swift (`showsTerms: Bool = true`, scaled heights, Google label)
- UI tests referencing changed ids/copy (`grep -rln "upgrade.title\|upgrade.confirms" KristyUITests`); they must compile.

Read-only: Auth/CardFan.swift, Core/Pricing.swift, LegalLinks. Do not touch anything under Kristy/Surfaces/{Home,Counter,Shop,Scan,Onboarding} or DesignSystem/Typography.swift (another build owns them). Nothing in /Users/m1/kristy.

## VERIFY (run what your sandbox allows; the admin re-runs everything unsandboxed)
- Simulator build on iPhone 17 Pro 9D1DEA1B-AC4D-430F-92FA-7EAEC9F1888E only. Do NOT run the UI suite.
- KristyTests; build-for-testing on the UI target; Tools/checks/runners_compile.sh, palette_mirror.sh, purchase_rules.sh.
- Report against each wall row of design §7, and the visible word count at L from source strings.
No git writes. Report ≤25 lines ending READY or NOT READY.
