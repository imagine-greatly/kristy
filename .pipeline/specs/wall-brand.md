PIECE kristy-ios/wall-brand (ui:true, T2: brand pass on the one wall; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = HEAD at launch
TIER: T2

## Alignment
Devon, 2026-10-22: continue the last visual stylings for the paywall; "change nothing about the seal in the paywall". So NO seal is added, moved, resized or restyled, and NO new image assets are made.

Design: /Users/m1/kristy/.pipeline/design/paywall-brand.md. Build §3 palette, §4 type, §7 copy, §8 handling, §10 large text. SKIP §6 (seal) and §11 (assets) entirely. Whatever the wall shows today for CardFan/seal stays exactly as is.

What to build: Fraunces display headline (KristyType.display, balanced wrap); three benefit lines under the headline (body, ink, each <=8 words, from §7 candidates 1, 2, 4; drop at AX3+ per §10); plan rows on card stock #FAF7EF with green selected border; annual price the largest numeral, "$3.75 a month" smaller (figures only from Pricing.swift / PlanCopy.store); saving badge outline only inside annual row, moves under price at AX1+; free-week door line sits above the legal row near the CTA (§8: no trial timeline, no "billed after 7 days"); shopMode headline "Walk the store in order, card by card."; other headlines unchanged.

Binding: prices only via Core/Pricing.swift (read-only); saving derived and floored; purchase lifecycle untouched (Tools/checks/purchase_rules.sh passes); paper only, no new colours; gold stays eyebrow + footer hairline only; zero first person, no she/her; no health or price claims; keep accessibility ids (upgrade.done, upgrade.headline, upgrade.eyebrow...) and the xmark label "Not now"; UI-visible words stay calm (<=45 at L signed in).

## OWNS
- Kristy/Surfaces/Membership/UpgradeScreen.swift
- Kristy/Surfaces/Membership/TrialDoor.swift (placement only)
- UI tests referencing changed ids/copy (grep -rln "upgrade\." KristyUITests); must compile.
Read-only: Auth/CardFan.swift, Core/Pricing.swift, LegalLinks, Typography.swift. Nothing outside kristy-ios.

## VERIFY
Simulator build iPhone 17 Pro 9D1DEA1B-AC4D-430F-92FA-7EAEC9F1888E only; do NOT run the UI suite. KristyTests; build-for-testing UI target; Tools/checks/runners_compile.sh, palette_mirror.sh, purchase_rules.sh; grep: no hardcoded $ figures in UpgradeScreen.swift.
No git writes. Report <=25 lines ending READY or NOT READY.
