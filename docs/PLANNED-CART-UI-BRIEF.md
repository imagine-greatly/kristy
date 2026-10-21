# Planned cart UI: design brief (kristy/planned-cart-ui, P3)

Written 2026-10-20 by designer@opus. Surface: `HomeSurface.emptyLanding`
(`/Users/m1/kristy-ios/Kristy/Surfaces/Home/HomeSurface.swift` ~L206-255). Contents of the
three carts: `docs/PLANNED-CART-PLAN.md`, "Appendix: PLANNED_CARTS". Column (paper.md §0):
SOMEWHERE ELSE, the dashboard, seated and planning. No new screen, no modal, no new component.

## Palette (tokens.json only, nothing new)
| hex | token | role here |
| --- | --- | --- |
| #E9E2D0 | paper | the landing ground, unchanged |
| #17231C | ink | capsule labels, failure line |
| #535A50 | inkMuted | the one-line contents caption under each capsule |
| #6E5520 | goldText | the eyebrow above the three, only gold text on the block |
| #D3C9B2 | rule | capsule edge, as `HairlineAction` already draws it |
| #14472F | green | untouched: stays on nothing in this block (no filled control) |

## Type
- Eyebrow: `KristyType.ui(.eyebrow)`, uppercase, tracking 1.32, goldText (mirror "Already in the aisle?").
- Capsule label: whatever `HairlineAction` renders today. No override.
- Caption: `KristyType.ui(.caption)`, inkMuted, centred, wraps. No Fraunces in this block:
  these are UI labels, not Kristy speaking.

## Layout stance
A quiet secondary block that reads like three lines on an index card under the notepad;
the notepad stays the page's one input and nothing here publishes a `PrimaryActionCountKey`.
Spacing unit 8 (skill scale 8/12/16/24/32).

Order inside `emptyLanding`'s `VStack(spacing: 24)`, top to bottom:
1. `LandingMasthead` (unchanged)
2. `notepad` + its failure label (unchanged)
3. `HairlineAction("Same as last trip")` when `cart.seedable` (unchanged; repeat comes before start)
4. **NEW: the planned-cart block**
5. "Already in the aisle?" + `doorDock`, still pinned to the page bottom (unchanged)

The block: `VStack(spacing: Space.m)` holding the eyebrow, then three rows in a
`VStack(spacing: 16)`. Each row is a `VStack(spacing: 8)`: `HairlineAction(title)` (hugging,
not `fillsWidth`), then the caption. Centred, like "Same as last trip".

Shown only when ALL hold: `state.isLanding`, the cart has zero rows,
`homeInput.hold.phase == .idle`, `homeInput.pendingRows.isEmpty`. It leaves with the landing
(it lives inside `emptyLanding`, so `showsLanding` already hides it on a full list).
While listening or holding, it is removed (`.transition(.opacity)`), so it never competes with
the seal's listening ring.

## The three (eyebrow + titles + one line each)
Eyebrow: **Or start from a planned cart**

| key | capsule title | caption (≤8 words) |
| --- | --- | --- |
| everyday | Everyday cart | Eggs, salmon, grass-fed beef, whole milk, greens. |
| nose_to_tail | Nose-to-tail cart | Liver, lamb, raw kefir, kraut, soup bones. |
| garden_and_sea | Garden and sea cart | Peppers, stone fruit, white fish, scallops, miso. |

Every caption word names a row in that cart's Appendix table. No first person, no em-dash,
no health claim, no "healthy", no count, no price, no brand. If the shopper has ANY hard line
set (`preferences.preferences.wire`), captions are hidden and titles stand alone, because a
filtered cart may no longer hold the named foods (a vegan's nose-to-tail has no liver).

## After tap
- **Guard first:** if the cart has gained a row by the time the response lands, drop the
  response. A planned cart never lands on the shopper's own rows.
- **Loading:** all three capsules and "Same as last trip" disable (any in-flight fill blocks
  the others). The tapped capsule keeps its title and shows a small system `ProgressView`
  (ink tint) trailing the label. Mirror `seedFromLastWeek`'s loading treatment instead if it
  already has one. The route is deterministic and fast; no skeleton, no shimmer.
- **Success:** the landing hands off to the list exactly as a commit does: `showsLanding` goes
  false, `CartList` gets every landed row id as `change.arrived`, so rows arrive with the same
  motion compose uses. No intro line, no `RefinementSummary`, no "planned" badge on rows, no
  toast. The rows are ordinary rows from here on (Devon 2026-10-20).
- **429:** the existing rate-limit line that guest compose shows, cart stays empty, block
  re-enables.
- **Any other failure:** below the block, the same treatment as the notepad's commit failure
  (`Label`, `exclamationmark.circle`, `KristyType.ui(.label)`, ink):
  **That cart did not load. Try again.** Cart stays empty, capsules re-enable.

## Accessibility
- **VoiceOver:** each row is one element (`.accessibilityElement(children: .combine)` over
  capsule + caption), trait button. Label = title; value = caption when shown; hint
  "Fills the empty list with this cart." Eyebrow carries `.isHeader`. While loading, post
  "Filling the list." as an announcement; on failure, the failure line is announced.
  Identifiers: `home.plan.everyday`, `home.plan.nose_to_tail`, `home.plan.garden_and_sea`.
- **Dynamic Type to AX5:** captions and titles wrap, never truncate; the landing scrolls;
  capsule targets stay ≥44pt. No row collapses to an HStack at large sizes.
- **Reduce Motion:** block appear/disappear uses `Motion.reduced`; arrival uses compose's
  existing reduced path (no stagger). The seal does not turn on tap (it only turns while
  listening).

## Reference
"Already in the aisle?" block in the same file (L242-249): goldText uppercase eyebrow over a
`Space.m` stack of secondary actions. Take its eyebrow treatment and spacing verbatim; the
planned-cart block is its sibling, not a new pattern. Second reference: `HairlineAction("Same
as last trip")` (L238), the exact control and centring to reuse.

## Anti-slop
1. No sparkle, wand, star or AI glyph; no "magic", "curated for you", "smart", "personalized".
2. No filled green button and no `GoldFillAction`: the notepad stays the one primary.
3. No modal, sheet or picker step between tap and list; no confirm dialog.
4. No cards, tiles, thumbnails or food photos per cart; no olive art (skill rule 9).
5. No numbered 01/02/03 labels, no "20 items" counts, no section chips, no days of the week.
6. No italic accent word in the eyebrow or titles; no monospace; no em-dash in any string.
7. No badge, dot or tint marking planned rows in the list or shop mode afterwards.
8. No celebration on arrival (no confetti, no seal stamp, no "Your cart is ready").

## Assets
No assets. The block is type and existing controls; the art law is not triggered.

## Visual acceptance (one screenshot of the empty landing, plus one of the filled list)
1. Eyebrow "OR START FROM A PLANNED CART" renders in #6E5520, below the notepad (and below
   "Same as last trip" when present), above "ALREADY IN THE AISLE?".
2. Exactly three capsules read "Everyday cart", "Nose-to-tail cart", "Garden and sea cart",
   in that order, each with a #D3C9B2 hairline edge and no fill.
3. Each capsule has one caption line beneath it in #535A50 matching the table above verbatim
   (no hard lines set in the shot).
4. No #14472F fill appears anywhere in the planned-cart block.
5. No icon, image, number or glyph appears inside or beside the three capsules.
6. No string in the block contains "I", "me", "my", an em-dash, or an exclamation mark.
7. After tapping "Everyday cart": the list shows 20 rows under produce, meat, seafood,
   eggs/dairy, pantry and frozen headings, and the three capsules are gone.
8. In the filled-list shot, no row carries a badge or label distinguishing it as planned.
