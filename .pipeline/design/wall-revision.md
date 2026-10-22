# Design brief: kristy-ios/wall-revision (2026-10-22)

Supersedes `.pipeline/design/paywall-brand.md` and Devon's earlier "no seal change on wall". Devon, 2026-10-22: the wall "has no seal and no nothing". He wants the seal, more Kristy branding, more of the brand greens, and higher conversion based on the research.
Inputs read: kristy/CLAUDE.md, `.pipeline/research/paywall-patterns.md` (cited below as R§), `large-text-and-wall.md`, `paywall-brand.md`, PRICING-MODEL §0-§5, paper.md, tokens.json, `UpgradeScreen.swift`, and `Tools/checks/purchase_rules.sh`.
NOT VIEWED: the screenshots in `.../scratchpad/shots/`. I cannot list a directory and four guessed filenames did not exist, so the baseline below is taken from the source code, not from pixels. The `KristySealCoin` file was not opened either.
This brief is longer than the 60-line cap because the dispatch asked for three full directions.
Price tokens: `{annual}` `{monthly}` `{perMonth}` `{saving}` always come from `PlanCopy.store`. No figure is ever typed. At today's prices they render as $44.99 / $6.99 / $3.74 / 46%.

## Palette (tokens.json only, nothing new)
- Oat `#E9E2D0`: ground, the whole screen, plus the footer.
- Card `#FAF7EF`: plan rows and the close circle.
- Ink `#17231C` for headline and prices; inkBody `#38443C` for benefit text, per-month and renewal.
- Forest `#14472F`: the CTA fill, the selected stroke and radio, the saving badge's text and stroke, and the icon ink inside the art.
- onForest `#F8F2E5`: the CTA label only.
- Gold: goldText `#6E5520` for the eyebrow, gold `#A88A4A` for the seal hairline and the footer hairline. Nothing else.
- Toasted `#E6D2AE` is not a UI token. It appears only inside the seal artwork, the same way brass does.
- Never on the wall: ochre, orange or danger. They are the food ladder and would read as a tier on a price.

## Type
- Everything is Inter (`KristyType.ui(...)`). purchase_rules.sh rule 11 is directory-wide and positive: every face in `Surfaces/Membership/` must be Inter, and Fraunces, DisplayText, `.pullQuote` and `.voice` all fail it.
- The rule does not allow a serif headline. Rasterising a serif headline into an image to get around it is banned too (see Anti-slop).
- Proposal, one new role in Typography.swift: `UI.title`, Inter 700, base 28 on `.title`, cap 44 (it sits on the display rung of the large-text ladder). `verifyTypeScale` gains `uiTitle > uiLead`.
  - Today's headline is `ui(.lead)` at 20pt. That is the "thin branding" problem.
- Scale:
  - headline: title 28/700
  - annual price: lead 20/700
  - row label: lead 20/600
  - benefits: body 15/400
  - per-month, renewal and legal: caption
  - eyebrow: 12/600, tracking 0.8

## Layout stance
A printed label, not a form: the seal leads, the type is plain, the price is honest. Spacing unit is `Space.s` (8). The column is 20pt from the edges, max 520 wide. The footer stays pinned (large-text brief rule 7).

### Baseline: today (from code)
Top to bottom:
- X in a 44pt card circle
- CardFan at 150pt (gone from xxxL)
- gold eyebrow
- Inter 20 headline
- 3 body lines
- Yearly row and Monthly row, card fill, the selected one with a forest 2pt stroke
- "Renews at..." line
- optional carry callout
- footer: gold hairline, then Apple/Google or Subscribe, then TrialDoor, then Restore · Terms · Privacy

No seal. Green appears only on the CTA and the stroke. It reads as a form.

### A: Seal masthead (RECOMMENDED)
```
                                    ( x )
 ──────────────── ( SEAL 96 ) ────────────────   gold 1pt hairline, edge to edge, seal interrupts it
                  MEMBERSHIP                     goldText eyebrow (Entry)
          Shop every trip in store order.        UI.title 28 ink, 2 lines max
   [ic] The list, in the order of the store.     3 rows: forest engraved spot icon 32 + body
   [ic] Each card on its row, read for you.
   [ic] Counter and scans stay free.
 ┌ (●) Yearly                    ( Save {saving}% ) ┐  forest 2pt stroke; forest tint 6% over card
 │     {annual}                                     │  largest price on screen
 └     {perMonth} a month                           ┘
 ┌ ( ) Monthly   {monthly}                          ┐  1pt ink 25% stroke
   Renews at {annual} a year. Cancel anytime in Settings.
 ══ footer, gold hairline ══
   guest:     [ Continue with Apple ] [ Continue with Google ]  Use email instead
   signed-in: [ Subscribe for {annual} ]   forest block, Radius.control 12
              A free week, once per account. Nothing is charged.  [ Start the free week ] (hairline capsule)
   Restore · Terms · Privacy
```
- Seal: `KristySealCoin`, still, upright. It uses the home landing grammar from paper.md §7, a hairline interrupted by the seal.
- The fan is cut because the seal is the one picture. The calm-screen rule allows one picture, not two.
- Word count: guest about 50, signed-in about 55. That is inside the 40-60 inference in R§a12.
- The "Nothing is charged" line needs a build check: it is true only because the free week is the server grant (R§e). It is not a StoreKit intro offer, so the line never says "billed on day 7".
- Conversion drivers:
  - outcome headline (R§a1)
  - three action benefits with icons (R§a2)
  - annual preselected, bigger, tinted, with a saving badge; visual hierarchy drove Fits +19% (R§a3, M)
  - one page (R§a5, Stompers +16%, V)
  - trial terms beside the button, because day-0 cancels are 55% (R§a6, R§b)
  - quiet X (R§a8) and legal last (R§a9)
  - billed amount is the most prominent price (R§c)
  - "Counter and scans stay free" turns the free half into the pitch (PRICING §0, "that gap is the pitch")
- Large text:
  - seal: 96 at L-xxxL, 72 at AX1, 56 at AX2-3, hidden at AX4+
  - the hairline drops along with the seal
  - AX1: everything goes leading-aligned and the badge moves under the price
  - AX3: the eyebrow and the benefit rows drop
  - the price stays on one line (`minimumScaleFactor` 0.7) and the footer stays pinned (R§d, large-text §5)

### B: Seal over the cards
- Top to bottom:
  - X
  - CardFan at 150, real counter cards (Direction D's "real app cards are the picture")
  - `KristySealCoin` at 64, upright and centred, its lower third overlapping the fan's top edge. Never rotated and never on a card face: a stamp on a card means approved (NN 4)
  - eyebrow, then the headline in UI.title
  - 2 benefits (cards line + free line)
  - plans and footer as in A
- Strongest product proof: the shopper sees the real cards (R§a2). Weakest calm: two pictures. At 393x852 the Monthly row drops under the footer.
- Large text: the fan drops at xxxL (as today) and the seal moves up to 72 alone. From there it follows A.

### C: Forest label
- Top to bottom:
  - X
  - seal at 80 on Oat with the gold hairline
  - a forest `#14472F` label block, card-width with 4pt corners, holding the headline (onForest, UI.title), the eyebrow (`goldOnForest` text, which is allowed for eyebrows) and the 3 benefits (onForest)
  - plans on card, on Oat, then the footer
- The seal never sits on the forest block: per CLAUDE.md NN1 the forest plate no longer carries the logo. Prices stay on paper.
- The most green and the most "label". paper.md §0 says the forest "become[s] the label". But this is the largest forest area anywhere in the app, so it **needs Devon's ruling** on "fill scales inversely with area" (§8).
- The icons would need an onForest variant (assets 2b).
- Large text: from AX1 the block turns into an Oat section with ink text and a forest 4pt left rule, because a long forest slab at AX5 reads as a dark screen.

## Reference
Home landing, empty state: `KristySealCoin` centred and interrupting a margin-to-margin hairline (paper.md §7). Take the exact placement grammar, so the wall reads as the same printed sheet as the first screen.

## What makes it read as Kristy, not a generic paywall
- **The seal:** the olive coin, still, on its hairline. It is the same object as Home and the app icon.
- **Paper and green:** Oat stock, card-stock rows with 12/4 corners, and the forest used as ink and as the one filled control. No gradient and no dark hero.
- **Plain claims:**
  - the benefits are about how a trip works, never a result for the body
  - the free half is stated as a decision, not as leftovers
  - one honest renewal line
- **Engraved spot art:** the line art is cut from the seal's own engraving, not SF checkmarks.
- **Restraint:** no proof that does not exist (R§a7: no stars or counts exist yet), nothing urgent, no voice line asking for money (rule 11).

## Anti-slop
- Patterns to avoid:
  - green check circles before the benefits
  - numbered 01/02/03 benefits
  - monospace or tracked-caps labels other than the one eyebrow
  - a pill CTA (the primary is a block, paper.md §6)
  - an italic or serif accent word in the headline
  - a serif headline baked into an image to dodge rule 11
  - gold anywhere except the eyebrow and the hairlines: no gold badge, ring, price or fill
  - a "BEST VALUE" filled chip in red or gold, or a crossed-out price
  - a countdown, "limited time", "Unlock", "Go Pro", a crown or sparkles
  - stars, user counts or testimonials (none are verified)
  - confetti, glow, a gradient or a drop-shadow stack on the seal
  - a spinning seal, the seal on forest, the seal rotated like a stamp
  - a trial toggle (R§a11)
  - a second discount screen on dismiss
  - "we", "our", "I", "she" or "her" in copy
- Extending from the first render, today's wall: avoid a headline plus two rows on a flat ground with no mark. That is the "form" Devon rejected.

## Assets
1. **Seal: `KristySealCoin` (EXISTS).** Reuse it as Home renders it. No generation unless the Oat render shows the coin without its Toasted ground. In that case run 1b.
   - 1b `wall-seal-plate`, `gpt-image`:
     - Mode: an edit of the real seal PNG, never a redraw.
     - Prompt: "Place the supplied olive seal coin, unchanged, on a round matte warm kraft paper disc colour #E6D2AE, flat front view, faint paper fibre, one soft contact shadow straight below, transparent background, no text, no new marks, no gold fill."
     - Spec: 1:1, 1024, transparent.
     - Target: `kristy-ios/Kristy/Assets.xcassets/WallSealPlate.imageset/wall-seal-plate.png`
2. **Benefit spot icons ×3 (NEW), `gpt-image`.**
   - Purpose: the three benefit rows.
   - Spec: 1:1, 1024 generated, shown at 32pt, transparent.
   - Style anchors: pass the seal PNG as the reference; engraved line art in its line weight; one ink, forest #14472F; bold enough to read at 32 points; no text, letters or numbers.
   - Shared prompt stem: "Small spot illustration, fine engraved line art like a vintage seed-packet or coin engraving, single ink colour deep forest green #14472F, hatching only, no fill, transparent background, centered with generous padding, no text, match the line weight of the supplied seal image:"
   - a. `wall-icon-list`: "...a folded paper grocery list with three ruled lines and one tick." Target: `.../WallIconList.imageset/wall-icon-list.png`
   - b. `wall-icon-card`: "...a single index card resting on a shelf edge, a small leaf sprig at one corner." Target: `.../WallIconCard.imageset/wall-icon-card.png`
   - c. `wall-icon-counter`: "...a market counter with a striped awning and a hanging scale." Target: `.../WallIconCounter.imageset/wall-icon-counter.png`
   - 2b, only if C is picked: the same three as edits recoloured to #F8F2E5 line on transparent, with the suffix `-onforest`.
- Not checked: the `Assets.xcassets` path. The admin should confirm it before writing.
- Run order: look at the seal and the live Home render first (art-look rule). Explore at low or medium quality and generate only the picked final at high.
- Cost: no credits. About 9 explore runs plus 3 high finals go against the ChatGPT image allowance. The cap number is unknown here.

## Visual acceptance (Direction A, one screenshot each at L 393x852 and AX5)
1. `KristySealCoin` sits centred above the eyebrow, 88-104pt wide at L, upright. A gold #A88A4A 1pt hairline runs edge to edge and stops at the seal. No forest field touches the seal.
2. The headline is a sans face (Inter) and its cap height is visibly larger than the "Yearly" label. No serif or italic text appears anywhere on screen.
3. There are three benefit rows. Each has a forest engraved icon to the left of its text, with no check circles and no numerals. The third row reads "Counter and scans stay free."
4. Yearly is selected on load, with a 2pt #14472F stroke and the green-tinted card. Its billed price is the largest price on screen. The per-month figure is smaller. The "Save N%" badge has forest text and an outline only, no fill.
5. There is exactly one filled control: the #14472F block CTA with a #F8F2E5 label, square-ish corners, not a capsule.
6. No ochre, orange or red pixels, no stars, no strikethrough price, no user count, no gold fill.
7. At L, both plan rows, the primary action and "Terms · Privacy" are visible without scrolling. The footer has a gold top hairline.
8. At AX5, the seal is hidden, no price breaks across lines, and the primary action (Apple button or Subscribe) is on screen without scrolling.
