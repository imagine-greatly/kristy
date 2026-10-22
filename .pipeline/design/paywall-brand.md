# Paywall brand brief: the wall (2026-10-22)

Author: admin session on Claude (designer@opus gate-blocked by CLAUDE-LOW; Devon: "run it on claude"). No code. Builds on `.pipeline/research/paywall-patterns.md` and `large-text-and-wall.md` (Layout A already shipped as wall-b, kristy-ios c3ea35a). Not read for this brief: `paper.md` (palette values below are from CLAUDE.md non-negotiable 1).

## 0. What changes and what does not
Locked, unchanged: $6.99/month, $44.99/year, annual preselected, figures only from `PlanCopy.store`; saving derived and floored (at these prices 46%, computed, never typed); one wall; one primary action; Restore, Terms, Privacy; paper only; no she/her; zero first person; no health or price claims.
The structure (scroll + pinned paper footer + vertical plan rows) is right. The problem is brand: today the wall is a headline and two rows on a flat ground. It reads as a form, not as Kristy.

## 1. Baseline: today
Close X; CardFan (150pt, hidden at AX); eyebrow (gold); headline (`lead` size); two vertical plan rows; renewal sentence; optional TrialDoor; pinned footer with gold hairline, action, legal row. About 45 visible words signed in. No seal, no benefit lines, headline in UI sans-weight `lead`, not the serif display.

## 2. Options
| | What | Verdict |
|---|---|---|
| Baseline | as above | works, unbranded |
| **R: Seal + serif headline + proof strip (Recommended)** | Olive seal as the one brand object at top, Fraunces display headline, three one-line benefits, plan rows on card stock, trial stated on the CTA caption | keeps Layout A, adds identity, +about 25 words, all droppable at AX3 |
| S: Seal + full card fan + testimonials | richer, longer | no proof exists yet (no reviews, no user counts); invented proof is banned. Rejected |
| T: Multi-step (value → trial → price) | Stompers measured single page beating it (V) | Rejected |

## 3. Recommended: palette
- Ground Oat `#E9E2D0`; plan rows and seal plate `#FAF7EF` card; ink green-black (existing `Palette.ink`); body `Palette.inkBody`; selected row border and CTA fill `Palette.green`; CTA label on paper.
- Gold only on the eyebrow and the footer hairline (existing). Not on the price, badge, CTA or seal ring.
- No ochre/orange on the wall: those are the food ladder and would read as a tier on a price.
- Saving badge: ink text on card stock inside the annual row, outline only. Never a filled red or gold "SALE" chip.

## 4. Type scale (Dynamic Type via existing `KristyType`)
- Headline: Fraunces display (`KristyType.display`), balanced wrap, max 2 lines at default; 1 line is not required.
- Price: largest numeral on the screen, in the annual row (Apple: billed amount is the most prominent price). "$3.75 a month" strictly smaller than it.
- Benefit lines: `body`, ink; row label `lead`; eyebrow `eyebrow` with tracking (existing).
- Nothing under `caption` except the legal row.

## 5. Layout (default size)
```
                                   X
            ( olive seal, 88pt, still )
              SHOP MODE            <- gold eyebrow (entry copy)
      Shop every trip in store order.   <- Fraunces
   Your list, laid out the way the store is.
   Every card read before it hits the cart.
   Nothing to log, nothing to count.
  [ o Yearly      $44.99 / year   Saves 46% ]  <- selected, green border
  [   $3.75 a month, billed yearly          ]
  [ o Monthly     $6.99 / month             ]
 ----- gold hairline ------ pinned footer ----
   [ Start the free week ] | [ Continue with Apple / Google ] (guest)
   Then $44.99 a year. Cancel anytime in Settings.
   Restore . Terms . Privacy
```
Why this converts (evidence grade in brackets): single page beats stepped (V, Stompers); annual preselected with visible hierarchy lifts ARPU (M, Fits +19% toggle/hierarchy); trial terms next to the button reduce day-0 cancels, 55% of 3-day cancels happen on day 0 (M, RevenueCat); outcome headline over "Choose your plan" (C, Adapty). None of these was re-fetched today; they come from the 2026-10-21 research file.

## 6. Seal treatment
`KristySealCoin`, the logo, once, centred, 88pt default, 64pt at AX1+, hidden at AX4+ so the price stays on screen. Still, never spinning (stamp rule 4: it turns only while listening). No ring, no glow, no drop shadow stack; one soft contact shadow only if the gpt-image plate asset carries it. Sits on a `#FAF7EF` disc or the Toasted plate; not the forest plate.

## 7. Copy candidates (voice: no I/me/my, Kristy is a label, no health or price claims)
Headline per entry (keep today's structure, serif only):
- settings: "Shop every trip in store order." (keep; it is outcome-led)
- shopMode: "Shop mode stays with membership." -> "Walk the store in order, card by card."
- tripTwo: "Walk trip three the same way." (keep)
- scan / counter: "Every scan, read against your goal." (keep)
Benefit lines (pick three; each ≤8 words, none states a result for the body):
1. "The list, in the order of the store."
2. "Each card on its row, read for you."
3. "Trips remembered, so next week starts ready."
4. "Counter answers stay free."  <- recommended as the trust line: says what is NOT paywalled (true per Ruling F)
CTA: signed-in with trial available "Start the free week"; no trial path "Subscribe for $44.99" (price on the button, Apple). Guest: Apple/Google buttons unchanged.
Caption under CTA: "Then $44.99 a year. Cancel anytime in Settings." Monthly selected: "Then $6.99 a month. ..."

## 8. ⚠ Open question before any timeline copy
The free week is granted by `POST /api/subscription/trial`, not by a StoreKit introductory offer (research (e)). "Billed after 7 days" is only true if the product carries an intro offer. Unverified here. Until confirmed: do not write "Day 7: billed" or a trial timeline; keep the CTA as two honest paths exactly as today (Subscribe, and the separate free-week door) but move the free-week line above the legal row so it sits near the CTA.

## 9. Anti-slop list
No confetti, no countdown or fake scarcity, no "limited time", no crossed-out price, no star ratings or user counts (none verified), no testimonials, no dark patterns on the X (44pt, visible, labelled "Not now"), no trial toggle (App Review 3.1.2 risk), no gradient hero, no emoji, no stock photo, no SVG-drawn art, no "unlock", no bold-red savings, no second discount screen on dismiss.

## 10. Large text
- Through AX2: everything above, seal 64pt, benefits kept.
- AX3: eyebrow and benefit lines drop (as shipped); seal 56pt.
- AX4-AX5: seal hidden; headline, plan rows stacked leading-aligned, CTA pinned, legal row at the end of the scroll (as shipped). Price never wraps or truncates; row label and price stack vertically.
- Annual badge moves under the price at AX1+.
- Verify at default, xxxL, AX3, AX5, 393x852 and a 320pt width; CTA visible without scrolling in every one.

## 11. Assets (gpt-image via codex, tag each; spend nothing until the seal source is looked at, per the art-look rule)
1. `wall-seal-plate` `gpt-image`: the existing olive seal image, no words, on a warm Toasted paper disc with a single soft contact shadow, transparent background, 1024px square. Prompt: "Edit the supplied olive seal coin artwork onto a round matte warm kraft-paper disc, flat front view, subtle paper fibre, one soft shadow beneath, transparent background, no text, no new marks, no gold fills." Input must be the real seal file, an edit, not a redraw.
2. `wall-ground-grain` `gpt-image`: optional, 1170x600 tileable oat paper grain at very low contrast to sit under the header only. Prompt: "Seamless warm oat paper texture, color #E9E2D0, extremely subtle fibres, no stains, no pattern, no vignette." Skip if it adds any visible banding at AX.
No other new art. The card fan stays (real app cards are the picture, Direction D) at default and xxL only.

## 12. Build notes (for the piece spec)
Owns: `UpgradeScreen.swift`, new asset(s) in `Assets.xcassets`. Tier T2 (ui:true: designer → Astra high → critic@opus with screenshots). Verify: UpgradeScreen UI tests, screenshots at the sizes in §10, no hardcoded figure grep, `onePrimaryActionAtMost` still green. Price work: none.
