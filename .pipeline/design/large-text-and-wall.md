# Large text + the wall — design brief (2026-10-21)

Pieces: A `large-text` (every surface, L→AX5), B `wall` (UpgradeScreen redo, Layout A refined).
Brand: paper only (Oat/Toasted ground, card #FAF7EF), one gold (eyebrows, hairlines, listening ring), Fraunces + Inter, no new colours, no new art, no "I"/"she", prices only from the store via `PlanCopy`/`Pricing.swift`. Assets: none. Every visual is an existing asset or an SF Symbol. Image credits: 0.

Evidence used: the contact sheets for home-landing, carts-sheet, list-home, scan, counter, counter-card, shop-mode, wall, settings and onboarding (read 2026-10-21); `Typography.swift`; `UpgradeScreen.swift`; `TrialDoor.swift`; `SignInControl.swift`; `.pipeline/research/paywall-patterns.md`. Not read: home-landing-bottom, list-home-bottom, counter-card-scrolled, wall-bottom, the haul sheet (the caller reports haul as clean), and any surface source other than the four files above. Some file paths in §6 are therefore grep anchors and are not confirmed paths.

---

## 0. The design bet

**Today one headline is frozen and the body runs away. After this change the type is a strict ladder that keeps growing through AX3, then holds at AX4.** Every role gets a ceiling, and the ceilings themselves form a ladder (52 > 44 > 40 > 38 > 30 > 24). So at every size the headline is bigger than the lead, the lead is bigger than the body, and so on. No single word can ever be wider than a phone column. **As a result AX5 renders the same as AX4.** If Devon wants AX5 to keep growing, the knob is `Cap.body` 38→42. The cost is that "Mediterranean" and "unpasteurized" start breaking mid-word at 330pt.

⚠ For Devon: capping lead and body supersedes D0 (2026-10-07), which left them uncapped. The reason is the no-mid-word-break rule.

## 1. Point sizes per role (computed from Apple's metrics tables; the cap is applied where marked c)

| role (face, base/style) | L | xL | xxL | xxxL | AX1 | AX2 | AX3 | AX4 | AX5 |
|---|---|---|---|---|---|---|---|---|---|
| masthead NEW (Fraunces 500 opsz72, 36/.largeTitle) | 36 | 38 | 40 | 42 | 47 | 51 | 52c | 52 | 52 |
| display: surfaceTitle, pullQuote, verdictHeadline (28/.title) | 28 | 30 | 32 | 34 | 38 | 43 | 44c | 44 | 44 |
| lead/doLine (Fraunces, 20/.title3) | 20 | 22 | 24 | 26 | 31 | 37 | 40c | 40 | 40 |
| UI.lead, UI.sectionTitle (Inter 600, 20/.title3) | 20 | 22 | 24 | 26 | 31 | 37 | 40c | 40 | 40 |
| body: UI.body/deck/bodyEmphasis, voiceLine (15/.subheadline) | 15 | 17 | 19 | 21 | 25 | 30 | 36 | 38c | 38 |
| label: UI.label/button/caption (15/.subheadline) | 15 | 17 | 19 | 21 | 25 | 30c | 30 | 30 | 30 |
| eyebrow (Inter 600, 12/.caption) | 12 | 14 | 16 | 18 | 22 | 24c | 24 | 24 | 24 |
| wordmark (on the seal only) | uncapped, unchanged |

## 2. Per-size outline

**L (baseline, unchanged look).** Every surface looks the way it does today, with three exceptions. The list add placeholder stops truncating (it becomes "Add or speak"; see rule 6). The wall is the new Layout A (§5). The scan "Read it" button and the wall CTA move into bottom insets. Home seal 172. Home is a top-anchored scroll that only scrolls on overflow. No layout switches.

**xL.** Everything grows by about 2pt. The masthead now grows (38; today it is frozen at 36). Apple and Google sign-in buttons are 56 tall. No layout switches.

**xxL.** Masthead 40, display 32. Sign-in buttons are 62 tall. The list add placeholder now fits only as "Add or speak". The carts legend picks its 2×2 grid (ViewThatFits). The wall drops nothing yet; the CardFan still shows.

**xxxL.** Masthead 42. The ListHomeHeader clamp is gone, so "20 things. Five stops." keeps growing (34). The wall's CardFan drops. Sign-in buttons reach their 64 cap. On the counter card, "Go deeper ›" moves up to sit directly under the subline. Home seal stays 172.

**AX1 (the big switch).** Every threshold below reads `KristyType.tier >= .accessibility1`.
- Rows stack: on a list row "Counter ›", on a cart row "Build ›", and on onboarding "Set it up" each move under their text, aligned leading.
- Home seal 172→120. The home scan door pins to the bottom as a single line, "Scan any food", with no subline. The home placeholder becomes "or write it".
- Shop-mode header count wraps under "Your list".
- Multi-line centred blocks (home, wall, scan sheet) go leading-aligned.
- Wall footer keeps SignInControl whole (Apple, Google, the email door) or Subscribe. The legal row (Restore · Terms · Privacy) moves to the end of the scroll.
- Scan "Read it" becomes a full-width filled button in the sheet's bottom inset.

**AX2.** Labels hit 30 (cap) and eyebrows hit 24 (cap). Masthead 51. Display 43. Primary buttons may wrap to 2 lines, centred, and never truncate. No new switches.

**AX3 (second switch).** Masthead clamps at 52, display at 44, lead at 40.
- Home seal 120→96. The home masthead subline ("Say it or write it…") drops, and the carts row subline drops.
- The scan cue sub ("Shoot the ingredients on the back.") drops, and the scan sheet rows drop their sublines.
- "Start the trip · 20 items" becomes "Start the trip".
- The shop-mode "THE RULE HERE" card is collapsed by default (eyebrow + "More ⌄").
- The wall eyebrow drops.

**AX4.** Body clamps at 38, so every role is now at its cap. Nothing new switches. Check: no word breaks mid-word anywhere.

**AX5.** Same as AX4, by design (see §0). The CTA, scan door, "Read it" and the wall's sign-in buttons are all on the first screen because they are pinned.

## 3. Global rules (each one is a code rule)

1. **Caps table** lives in `KristyType.Cap` only:
   ```
   masthead 52 · display 44 · lead 40 · sectionTitle 40 · uiLead 40 · body 38 · label 30 · eyebrow 24
   ```
   - `UI.lead/.sectionTitle/.deck/.body/.bodyEmphasis` gain caps, so they go through `scaledUI`, not `.custom(relativeTo:)`.
   - `voiceLine` and `doLine` pass `cap:`.
   - New `KristyType.masthead` (36/.largeTitle, opsz 72, cap 52).
   - `verifyTypeScale()` keeps every existing relation, and they all still hold. It adds `masthead > display > lead > body ≥ label > eyebrow` at all 12 categories. body equals label up to AX2, which is why that one link is ≥.
2. **One size source for layout.** Add `static var tier: DynamicTypeSize { DynamicTypeSize(TypeScaleClock.shared.category) ?? .large }`. Every switch reads it, not `@Environment(\.dynamicTypeSize)`, so fonts and layout never disagree. Delete every `.dynamicTypeSize(...)` clamp (`grep -rn "dynamicTypeSize(" Kristy`). It does not reach KristyType anyway, and ListHomeHeader.swift:99 is one of these clamps.
3. **`.system(size: N)` fonts:**
   - Text → a KristyType role by size: 11–13 → `.caption` (or `.eyebrow` if uppercase+tracked); 14–17 → `.label`/`.body`; 18–22 → `.lead`/`.sectionTitle`; ≥24 → `display`.
   - SF Symbols next to text → `@ScaledMetric(relativeTo: <that text's style>) var s = N`, used as `min(s, N*2)`.
   - Chrome icons in fixed 44pt targets (toolbar icons, camera ✕, shop-header icons) stay fixed and add `.accessibilityShowsLargeContentViewer()`.
   - The tab bar is system and untouched.
   - Done when this grep returns only chrome icons: `grep -rnE "size: *[0-9]+" Kristy | grep -v relativeTo`.
4. **HStack→VStack switching.**
   - Rows whose text wraps (list rows, cart rows, onboarding field+button) switch by threshold: `AnyLayout(tier >= .accessibility1 ? VStackLayout(alignment: .leading) : HStackLayout())`. ViewThatFits must NOT be used here, because a wrapping Text's ideal width is its single-line width, so it would pick the VStack at L.
   - ViewThatFits is only for short, single-line content: the carts legend (1×4 → 2×2 → 4×1), header counts, and placeholders.
5. **No mid-word breaks.**
   - The caps in rule 1 are what make long words fit. Add `verifyLongestWord()` (DEBUG, next to `verifyTypeScale`). At AX5, for every capped role, it measures `["Mediterranean","unpasteurized","sauerkraut"]` with the built UIFont and fails if any is wider than 313pt.
   - Calibration knob: if a role fails, drop its cap 2pt at a time.
   - `minimumScaleFactor` is allowed in exactly two places: a price token (`$44.99`, `.lineLimit(1).minimumScaleFactor(0.7)`) and the Google button label (0.8, so it matches Apple's single-line control).
   - No `lineLimit` on any body, voice or headline Text.
6. **Placeholders shorten; they never truncate.** When the field is empty, render the placeholder as an overlay of `ViewThatFits(in: .horizontal)` over variants, longest first:
   - home: "or write it: eggs, salmon…" / "or write it"
   - list add: "Add or speak to the list" / "Add or speak" / "Add"
   - onboarding: "High protein, clean eating…" / "In your words"

   Typed text uses `TextField(axis: .vertical)` so it wraps.
7. **Sticky primary actions.** Use `.safeAreaInset(edge: .bottom)` on a paper background with a top gold hairline:
   - wall: CTA (at every size)
   - scan sheet: "Read it" (at every size)
   - home: scan door (AX1+)
   - onboarding: "Continue" (already sticky)

   A primary action is never only reachable by scrolling. The close/"Not now" control is pinned top-trailing, outside the scroll.
8. **Buttons wrap, never truncate.** `FilledPrimaryAction` and `HairlineAction` use `.lineLimit(2)`, `.multilineTextAlignment(.center)` and `minHeight` from `@ScaledMetric(relativeTo: .body) 50` clamped to 64.
9. **Home scan door at AX.** From AX1 the door becomes a bottom-inset single row: scanner symbol + "Scan any food" (label role), full width, 44+ tall. "Labels, cartons, fresh food." drops.
10. **Scan cue at AX.**
    - The cue ("Turn it over.") and "This device cannot scan barcodes." sit in one VStack inside the camera area. They are never overlaid at fixed offsets.
    - The frame corners hug that VStack, with a minimum of 180pt tall.
    - The cue sub drops from AX3.
    - The fallback line always sits below the frame.
11. **Counter card "Go deeper".** From xxxL it renders directly under the subline, above the first divider, as a label-role link with a chevron. The subline loses its `lineLimit` at every size.
12. **Shop-mode header.**
    - "Your list" becomes a label role (it is fixed today) and grows to 30.
    - The count goes on a second line from AX1.
    - Icons stay fixed (rule 3).
    - Row checkboxes stay inline at every size (they stack above the name today at AX1+). Use `HStack(alignment: .firstTextBaseline)` with checkbox `@ScaledMetric` 22 clamped to 34.
    - "THE RULE HERE" body moves from a fixed font to voiceLine, and is collapsed by default from AX3.

## 4. Per-surface change list

Many file names are unconfirmed: §6 gives grep anchors where the file was not read.

| surface | file | change | from |
|---|---|---|---|
| all | `DesignSystem/Typography.swift` | rules 1, 2 and 5: caps table, `masthead`, `tier`, `verifyLongestWord` | L |
| home | `LandingMasthead.swift:26` | use `KristyType.masthead` (base 36, cap 52), not cap `Cap.display` | xL |
| home | home landing view | top-anchored scroll (`.defaultScrollAnchor(.top)`, `.scrollBounceBehavior(.basedOnSize)`) | L |
| home | home landing view | seal 172 → 120 | AX1 |
| home | home landing view | seal 120 → 96 | AX3 |
| home | home landing view | placeholder shortens (rule 6) | AX1 |
| home | home landing view | scan door pinned (rule 9) | AX1 |
| home | home landing view | masthead subline and carts-row subline drop | AX3 |
| home | carts row | title uses the lead role (cap 40, ≤3 lines at AX5) | L |
| carts sheet | carts sheet view | legend: ViewThatFits 1×4 / 2×2 / 4×1 | L |
| carts sheet | carts sheet view | "Build ›" stacks under the items line | AX1 |
| list | `ListHomeHeader.swift:99` | delete the xxxL clamp | xxxL |
| list | list home | date line moves from a fixed font to `.caption` | L |
| list | list home | "Start the trip · 20 items" → "Start the trip" | AX3 |
| list | list row | "Counter ›" stacks under the text | AX1 |
| list | list row | the name gets the full row width | AX1 |
| list | add field | placeholder (rule 6) | L |
| scan | camera cue view | rule 10 | AX1 / AX3 |
| scan | scan sheet | "Read it" in the bottom inset at every size | L |
| scan | scan sheet | "Read it" becomes a full-width filled button | AX1 |
| scan | scan sheet | row sublines drop | AX3 |
| counter card | card view | the subline's `lineLimit` is removed | L |
| counter card | card view | "Go deeper" moves under the subline (rule 11) | xxxL |
| shop mode | header | rule 12 | L / AX1 |
| shop mode | rows | inline checkbox | AX1 |
| shop mode | rule card | voiceLine, collapsed by default | L / AX3 |
| onboarding | goal step | "Set it up" stacks under the field, full width | AX1 |
| onboarding | goal step | placeholder (rule 6) | AX1 |
| controls | `FilledPrimaryAction`, `HairlineAction` | rule 8 | L |
| all | every `.system(size:)` file not owned by B | rule 3 | L |
| counter list, settings, haul | none | verify only | — |

## 5. The new wall (piece B): Layout A refined

**Today (baseline).** About 70 visible words for a signed-in free user (count from the research file, taken from source strings). The guest view at L shows about 60, read off the L capture: the fold cuts off the terms line.
- From the top: the fan, an eyebrow, the headline, a 15-word sub, and side-by-side tiles (the price breaks as "$44.9/9" at AX4/5).
- Then the action and a 2-line fine print, with the trial block last.
- The guest view renders LegalLinks twice: once inside SignInControl and once in `finePrint`.
- At AX5 the Apple and Google buttons are offscreen.

**Changes.**
- The sub is cut (`Entry.sub` deleted).
- "Then the App Store confirms…" is cut.
- The plans become vertical rows with radio symbols at every size.
- The CTA and legal links move into a sticky footer.
- "Not now" becomes an SF Symbol `xmark` in a 44pt circle on the #FAF7EF card. It is pinned top-trailing, keeps a11y label "Not now" and id `upgrade.done`.
- SignInControl gets a `showsTerms: Bool = true` parameter. The wall passes `false` and shows its own single legal row. The email door stays inside SignInControl; that file's header lesson stands. When the email door is opened, the footer grows and the keyboard lifts it: accepted.
- Shop-mode entry headline tightened to "Shop mode stays with membership."
- No billed-on-day-7 or timeline copy: the free week is the server grant, not a StoreKit intro offer.

### L (guest; signed-in swaps marked)
```
                                         ( x )
        [ CardFan: real counter cards, h150 ]
                    MEMBERSHIP
          Shop every trip in store order.
  ┌─────────────────────────────────────────┐
  │ (●) Yearly                    Save 46%  │  selected: green 2pt stroke
  │     $44.99                              │  UI.lead, largest price
  │     $3.74 a month                       │  caption, smaller (Apple)
  └─────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │ ( ) Monthly                             │
  │     $6.99                               │
  └─────────────────────────────────────────┘
   Renews at $44.99 a year.                    tracks selection
   [COMES WITH YOU · Your list, 20 items.]     only if carry notice
   signed-in + eligible:  Once per account; starts on tap.
                          [ Start the free week ]   (hairline)
 ───────────── sticky footer, gold hairline ─────────────
  [  Continue with Apple   ]   signed-in: [ Subscribe for $44.99 ]
  [ G Continue with Google ]
          Use email instead
           Terms · Privacy            signed-in: Restore · Terms · Privacy
```
Copy, exactly:
- Eyebrow/headline: from `Entry` (settings shown).
- Plan rows: "Yearly", "Save 46%" (store-derived), "$44.99", "$3.74 a month"; "Monthly", "$6.99".
- Renewal line: "Renews at {price} a year." / "Renews at {price} a month."
- Trial: "Once per account; starts on tap." and "Start the free week".
- Footer: "Subscribe for {price}", "Restore · Terms · Privacy".

Word count: guest 32; signed-in and trial-eligible 37; signed-in, not eligible 27. The carry notice adds 6 when it is present.

### xxxL
```
                                         ( x )
                    MEMBERSHIP
          Shop every trip in store
                   order.
  ┌──────────────────────────────────┐
  │ (●) Yearly             Save 46%  │
  │     $44.99                       │
  │     $3.74 a month                │
  └──────────────────────────────────┘
  ┌──────────────────────────────────┐
  │ ( ) Monthly                      │
  │     $6.99                        │
  └──────────────────────────────────┘
   Renews at $44.99 a year.
 ─────────── sticky footer ───────────
  [   Continue with Apple   ]  64pt
  [ G Continue with Google  ]  64pt
        Use email instead
         Terms · Privacy
```
Drops: the CardFan. The copy is otherwise unchanged.

### AX5
```
                              ( x )
 Shop every trip
 in store order.                display 44, leading
 ┌────────────────────────┐
 │ (●) Yearly             │
 │     Save 46%           │    badge on its own line (AX1+)
 │     $44.99             │    40pt, one line, never breaks
 │     $3.74 a month      │
 └────────────────────────┘
 ┌────────────────────────┐
 │ ( ) Monthly            │
 │     $6.99              │
 └────────────────────────┘
 Renews at $44.99 a year.
 Terms · Privacy                 (scroll end, AX1+)
 ──────── sticky footer ────────
 [  Continue with Apple  ]  64
 [G Continue with Google ]  64   label 1 line, minScale 0.8
 Use email instead
```
- Drops by AX5: the fan (xxxL), the eyebrow (AX3), and the carry callout (AX1). The legal row (Restore, Terms, Privacy) moves from the footer to the scroll end at AX1.
- Kept: the full renewal price, Restore (signed-in), Terms and Privacy, which together are the Apple 3.1.2 set.
- The trial block (signed-in) sits after the renewal line in the scroll. The Subscribe label may wrap to 2 lines.
- Apple button height is `@ScaledMetric(relativeTo: .body) 50`, clamped to 64. Apple's control draws its label in proportion to its height, so the label grows with it.
- `onePrimaryActionAtMost` still sees 1: either Apple's preference or Subscribe.

## 6. OWNS (paths under /Users/m1/kristy-ios; ⚠ = located by grep anchor, not read)

**Piece A: large text** (lands first; B relies on rule 8):
- `Kristy/DesignSystem/Typography.swift`
- ⚠ `LandingMasthead.swift`, plus the home landing view (`grep -rln "Scan any food\|or write it" Kristy`)
- ⚠ the carts sheet (`"About twenty items each"`)
- ⚠ `ListHomeHeader.swift`, the list row (`"Counter"` with chevron), and the add field (`"Add or speak"`)
- ⚠ the scan cue and sheet (`"Turn it over"`, `"cannot scan barcodes"`, `"One camera, the whole store"`, `"Read it"`)
- ⚠ the counter card (`"Go deeper"`)
- ⚠ shop mode: header, rows and the rule card (`"THE RULE HERE"`, `"Your list"`)
- ⚠ onboarding (`"Set it up"`)
- ⚠ the file holding `FilledPrimaryAction`/`HairlineAction` (likely `Controls.swift`)
- every remaining `.system(size:)` file outside B

**Piece B: the wall:**
- `Kristy/Surfaces/Membership/UpgradeScreen.swift`
- `Kristy/Surfaces/Membership/TrialDoor.swift` (copy and placement only; no lifecycle hook, per `purchase_rules.sh` rule 1)
- `Kristy/Surfaces/Auth/SignInControl.swift` (scaled heights, `showsTerms`, Google label)
- ⚠ UI tests referencing `upgrade.title`/`upgrade.confirms` (`grep -rln "upgrade.title\|upgrade.confirms" KristyUITests`)

Read-only for B: `Auth/CardFan.swift`, `Core/Pricing.swift`, LegalLinks.

No file is in both A and B. B changes no type roles.

## 7. VERIFY: screenshots at L, xxxL, AX3, AX5, 393×852; one per surface per size

| surface | the critic checks on the shot |
|---|---|
| home-landing | masthead top edge visible below the status bar at all four sizes; masthead taller at AX3 than at xxxL; seal ≈172 / 172 / 96 / 96; "Scan any food" visible on screen at AX3 and AX5; no "…" in the placeholder |
| carts-sheet | legend swatches don't overlap at AX3/AX5; no clipped legend label; "Build ›" under the text at AX3/AX5 |
| list-home | "20 things. Five stops." larger at AX3 than at xxxL; no word split mid-word ("sauerkraut" whole); no "…" in the add field; "Counter ›" under the text at AX3/AX5 |
| scan | cue and "This device cannot scan barcodes." don't overlap; "Read it" fully visible at all four sizes |
| counter | headline and "Ask" visible; no truncation |
| counter-card | no "…" in the subline; "Go deeper" visible on the first screen at xxxL/AX3/AX5 |
| shop-mode | "Your list" larger at AX3 than at L; ≥2 item names visible at AX5; checkbox beside the name |
| haul, settings | unchanged from today's captures (regression only) |
| onboarding | "Set it up" not wrapped inside a pill; "Continue" visible |
| wall (guest) | no price broken across lines; plans stacked; Apple, Google and "Use email instead" fully visible at AX5 without scrolling; "Renews at $… a year." and "Terms · Privacy" reachable; Terms appears once; ≤35 visible words at L |
| wall (signed-in free) | same as guest, plus "Subscribe for $…", "Restore", and the trial line. ⚠ The simulator cannot complete SIWA; this needs a DEBUG identity override, or it is reported NOT VERIFIED |
