# The calm pass — design brief (2026-10-21)

Extends `large-text-and-wall.md` §2 (per-size outline). Does not touch its caps (§1), its code rules (§3), or the wall (§5).
Brand is unchanged: paper only, the existing `Palette`, Fraunces + Inter through `KristyType`, one gold. No new colour, art or copy. Assets: none. Image credits: 0.
Evidence: contact sheets L→AX5 for home-landing, carts-sheet, list-home, scan, counter, counter-card, counter-card-scrolled (L missing), shop-mode, haul, onboarding and settings. Note that the list-home sheet predates the name-only row change.
Source read: `Home/CartList.swift`, `Counter/CounterCardView.swift`, `Counter/CounterSurface.swift`, `Counter/CounterSectionScreen.swift`, `Counter/CounterAsk.swift` (head only), `Shop/ShopMode.swift`, `Shop/ShopRow.swift` (rows 1–200).
Not read: the home landing view, the carts sheet, the scan sheet, `CounterCardScreen`, onboarding. Those are named here by on-screen string (⚠ grep anchor).

**The bet:** the screen shows the item and its name. A sentence of guidance appears only where the shopper is acting on it: the counter card's do line, or shop mode's focused row. Everything else is a labelled row with a count, one tap away.

## 1. Principles (each one can be checked on a screenshot)

1. **One headline, one primary action per screen, and the primary action is on the first screen at every size.** Doors and links are tier 3/4 and are never filled.
2. **At rest, a row is one thing: its name.** List, browse, carts and shop rows show the name only. At most one row per screen is open (the list row the shopper tapped, or shop mode's focused row).
3. **One block of guidance at rest.** A screen shows at most one block of Kristy prose without a tap: the card's do line, the focused row's S1/S2, or the shop rule sentence. Two blocks on the same screen is over budget.
4. **Defer, never delete.** Corpus text (pick steps, why, look for, watch out, science, instead, blurbs) folds behind a labelled row ("How to spot it · 3 ›"). It never disappears. The VoiceOver label or the open state still carries it. Never deferred: the card headline, `tier_note`, and the add for a cart pick.
5. **No ellipsis on content.** Text is either whole or folded behind a labelled row. A content `Text` never takes a `lineLimit` plus tail truncation. Only placeholders shorten, using §3 rule 6 of the large-text brief.
6. **First-screen line budget at L** (counted on the 393×852 shot, headline lines included, tab bar excluded): home ≤9, list header ≤6, counter index ≤12, counter card ≤12, shop first screen ≤16, scan sheet ≤6. The table in §2 gives each surface's number.
7. **Size only removes things.** Every element visible at a larger size is also visible at every smaller size. Growing the text only stacks, folds or drops elements; it never adds one. The proof is the strip of shots for a surface, compared left to right.
8. **Chrome has to carry something new.** Cut any chrome that repeats what is already on screen or decorates it: the `01`/`02` section numerals, a "23 topics" count once space is short, door sublines that restate the door, legends for bars that have themselves dropped. Each cut is chrome only. Corpus text is never cut.

## 2. Per surface at L: what the shot shows today → what stays, what is deferred, what is cut

**Counter card** (`CounterCardView.stack`, all hosts: `CounterCardScreen`, `CardSheet`). Every host renders this one card, so a change here changes all of them.
- Today at L (counter-card sheet, col 1): about 20 text lines in 7 blocks.
  - eyebrow (1 line)
  - headline (3)
  - `tierSentence` (3)
  - gold hairline + "HOW TO SPOT IT" (1)
  - `doLine` (2)
  - `pickSteps` (3 steps, about 9 lines)
  - "Go deeper ›" (1)
- The do line and step 2 restate the same berries/greens/apples. The steps take half the card.
- First-screen budget at L is 12 lines. Order (IC-10 kept; only the depth folds):
  1. `eyebrow`. It wraps; delete the `.lineLimit(1)` (principle 5). Topics are short.
  2. `headline` (verdictHeadline), always whole.
  3. `tierSentence`, always whole and never deferred (CLAUDE.md: free `tier_note` sits above the tap).
  4. `insteadGroup`, when present.
  5. `cartPick` (".add" / ".done"), unchanged.
  6. Gold hairline, then `doLine` (lead). The "HOW TO SPOT IT" eyebrow leaves the resting state, because its words become the label of the first row.
  7. The depth rows, one ruled group, all **collapsed by default**:
     - **"How to spot it · N"**: a new `DepthRow.spot`; the group is `pickSteps`. It shows only when steps exist.
     - then today's rows: "Go deeper" (science, plus why/look for/watch out when steps exist), or "Why", "What to look for · n", "Watch out · n" (when there are no steps).
     - then "The full read" while depth is not on hand.
- Paid fields keep their current gate. `why`, `look_for`, `watch_out` and `detail` stay reachable exactly as today: same rows, same fetch, same `toggle()`.
- Cut (chrome only): the resting "HOW TO SPOT IT" eyebrow (`card.spot` id moves onto the new row), plus the `deeperDisclosure` call at `stack` line 140. The latter is superseded (see §3, card AX1).
- ⚠ The counter-card shot shows the tier sentence ending "a credi…" from xxxL. `tierSentence` has no lineLimit in `CounterCardView`, so the clamp is in the host (`CounterCardScreen`, not read) or in a stale build. Find it and remove it.

**Counter index** (`CounterSurface.index`, `SectionCard`).
- Today at L: about 15 lines.
  - masthead "Where the guidance comes from" (2)
  - ask field + "Ask" (1)
  - gold hairline
  - "BROWSE THE COUNTER" (1)
  - Produce: title, "23 topics" and 3 shortcut questions (5)
  - Meat: the same, cut by the tab bar
- On the first screen you see 1.5 sections and 6 questions, so the index reads as a FAQ, not a map.
- Stays: the masthead (the one headline), `CounterAskView` (the primary action), the gold hairline, the eyebrow, and one ruled row per section with its title (pullQuote) and "N topics" (caption) on one line.
- Deferred: `SectionCard`'s `shortcuts` block leaves the index. The same shortcuts already sit pinned at the top of `CounterSectionScreen` (line 42), one tap in. The TF7 P3 comment ("no blurb on the index") extends to shortcuts.
- Result at L: masthead, field, eyebrow and about 7 section rows, so the whole store fits on one screen (≤12 lines).
- Cut: nothing else.

**Counter section** (`CounterSectionScreen`, `BrowseRow`). Not in the sheets; changed from source.
- `BrowseRow` today: the title, then the headline at `.lineLimit(1)` (2 from xxL) with tail truncation. That truncation breaks principle 5.
- Change: the row is the title only at every size (the list-row decision applied to browse). The headline is read in the card. The VO label stays title + headline.
- The `blurb` loses `.lineLimit(isAX ? nil : 2)` and is always whole.
- `thinNote` keeps its tap-to-expand (it is labelled by its own hint).
- Both views switch `@Environment(\.dynamicTypeSize)` to `KristyType.tier` (large-text §3 rule 2).

**List home** (`CartList`, `CartRowView`, ⚠ `ListHomeHeader`).
- Today at L, after the name-only change:
  - seal, date, "20 things. Five stops." (1)
  - "Start the trip · 20 items"
  - the add field
  - "01 PRODUCE"
  - rows of name (1–2 lines) + a green "Counter ›" on every carded row. That is 20 green links down the right edge.
- Stays: the header, the primary action and the add field.
- Deferred: the `doorTag` door ("Counter ›" / "Scan ›") moves into the open state. It renders in the `if isOpen` block, under the guidance line and above "Add a note". A row at rest is the name alone, full width.
- Cut: the `String(format: "%02d")` numeral in `CartList.groups` (line 46). The header becomes the section title only. "Five stops" and the walk order already carry the sequence.
- The large-text AX1 rule "Counter › stacks under the text" now applies inside the open row only.

**Shop mode** (`ShopMode`, `ShopRowView`, `ShopRuleCard`). Devon's reference look; change the least here.
- Today at L, about 20 lines:
  - top line
  - "01 PRODUCE"
  - rule card (eyebrow + More + 2 lines)
  - focused row: name + S1 (lead, 3) + S2 (body, 2)
  - 6 name-only rows
- Stays: all of the above, minus the cut below.
- Cut: the `%02d` numeral in `sectionHeader` (line 161), to match the list.
- With the rule sentence and the focused S1/S2, this is two guidance blocks. Accepted at L only: the rule card is one sentence in a 1pt outline. It folds earlier as size grows (§3).

**Home landing** (⚠ `"Scan any food"`, `"Or choose one of Kristy's carts"`).
- Today at L, about 10 lines:
  - headline (2)
  - sub (1)
  - seal + "HOLD TO TALK"
  - field (1)
  - carts door: title + "Seven carts, chosen by hand. About twenty items each." (3)
  - scan door: title + "Labels, cartons, fresh food." (2)
- Stays: the headline, the sub, the seal and its label, the field, and both door titles.
- Cut at every size: both door sublines (chrome restating the door). Each door becomes one line.
- Result at L: 7 lines.

**Carts sheet** (⚠ `"About twenty items each"`).
- Today at L, about 16 lines:
  - title, sub, legend (4 swatches)
  - eyebrows MEAT FIRST / BALANCED
  - 5 visible carts, each with name, items line, "Build ›" and a mix bar
- Stays: the title, the group eyebrows, each cart's name, items line and "Build ›".
- Cut: the sub "About twenty items each, in store order." (the home door already said it). The legend and bars stay at L (the bar is the only proportion signal) and drop from AX1 (§3).

**Scan** (⚠ `"One camera, the whole store"`, `"Read it"`).
- Today at L, about 11 lines:
  - cue (2)
  - fallback (1)
  - sheet title (1)
  - 3 rows of icon + title + subline (6)
  - "Read it"
- Stays: the cue, the fallback, the title, the 3 row titles with their icons, and "Read it" (pinned per large-text rule 7).
- Cut at every size: the three row sublines. Result: 6 lines in the sheet.

**Onboarding** (⚠ `"Set it up"`).
- Today at L, about 20 lines: brand, dots, question, sub, a 3-line quote paragraph, field + "Set it up", 5 goal cards of title + subline, Continue, Skip.
- Stays at L: everything. First run is the one place teaching earns its space. It sheds as size grows (§3).

**Haul, settings:** already minimal (4 and 3 lines). The haul line is fixed by CLAUDE.md. Verify only.

## 3. Collapse ladder (each cell lists what changes on top of the cell to its left and on top of large-text §2; nothing comes back)

| surface | L–xxxL | AX1–AX2 | AX3–AX5 |
|---|---|---|---|
| counter card | §2 order; depth rows collapsed; do line visible | do line and `instead` fold into "How to spot it" as its first items (the row now shows whenever a do line or steps exist). The depth group sits directly under `tierSentence`/`cartPick` (large-text rule 11's position, from AX1). `cartPick` stacks (as today) | the eyebrow drops; its text joins the headline's VO label |
| counter index | one row per section, title + "N topics" | "N topics" drops (VO keeps it) | the gold hairline + eyebrow pair drops; the masthead and field stay |
| counter section | title-only rows, whole blurb | shortcuts fold behind "Common questions · N ›" | the blurb folds into that same row's group |
| list home | header, CTA, field, name-only rows, no numerals | (large-text: rows stack inside the open row) | (large-text: "Start the trip") |
| shop mode | rule card open, focused row S1+S2 | rule card **collapsed by default** (moved from large-text's AX3 to AX1: eyebrow + "More ⌄"); S2 omitted (as today) | the focused row keeps S1 only; nothing else changes |
| home | 1-line doors; sub visible | the masthead sub drops (large-text had AX3); scan door pinned (large-text) | (large-text: seal 96, carts subline already gone) |
| carts sheet | legend + bars, items lines | legend and mix bars drop | items lines drop; each row is name + "Build ›" |
| scan | cue + sub, titles-only rows | (large-text: "Read it" full width) | (large-text: cue sub drops) |
| onboarding | as today | the quote paragraph and the goal-card sublines drop | the sub "Pick all that fit…" drops |
| haul, settings | unchanged | unchanged | unchanged |

How this fits with large-text §2:
- Two thresholds move earlier: the shop rule card fold (AX3→AX1) and the home masthead sub (AX3→AX1).
- Rule 11's xxxL "Go deeper under the subline" is no longer needed at xxxL. Once the steps fold, the depth group already sits on the first screen at xxxL. From AX1 the whole group takes rule 11's position.
- Every other §2 switch stands as written.

## 4. Acceptance (critic, on 393×852 shots at L, xxxL, AX1, AX3, AX5; one per surface per size)

1. **No "…" in any content text** on any shot. The only allowed exceptions are field placeholders, and only at their shortest variant.
2. **First-screen line counts at L stay within budget:**

   | surface | max lines |
   |---|---|
   | home | 9 |
   | list header | 6 (above the first row) |
   | counter index | 12, with ≥6 section titles visible |
   | counter card | 12 |
   | scan sheet | 6 |
   | shop | 16 |

3. **Counter card at L, top to bottom:** headline, tier sentence, (pick), do line, then "How to spot it · 3 ›" and "Go deeper ›". No numbered step is visible until "How to spot it" is tapped. After the tap, all 3 steps show.
4. **Counter card at AX1 and AX5:**
   - the "How to spot it" row is on the first screen at AX1;
   - at AX5 it is reachable in one scroll (use the counter-card-scrolled shot);
   - no eyebrow is visible at AX3 or AX5;
   - the tier sentence is whole at every size.
5. **List rows:** no "Counter ›" or "Scan ›" on any closed row. On one opened row, the guidance line and the "Counter ›" door are both visible. No `01`/`02` numerals appear on the list or in shop mode.
6. **Monotone:** for each surface, every element in the AX3 shot is also in the xxxL shot, and every element in the AX5 shot is also in the AX3 shot. Count the elements and list any that appear only at a larger size.
7. **Primary action on the first screen:**

   | surface | primary action |
   |---|---|
   | home | scan door or field |
   | list | "Start the trip" |
   | counter | the ask field |
   | scan | "Read it" |
   | onboarding | "Continue" |
   | shop | the finish door (at the scroll end, exempt) |

8. **Reachability:** with VoiceOver on, every deferred block (pick steps, do line at AX, shortcuts, blurb, door tags) is announced from its row. A UI test opens each of the following once: `card.row.spot`, a list row, and a carts row.

## 5. Build pieces (they land after large-text piece A, which owns the same files; each piece rebases on A's `KristyType.tier` switches; no two pieces run at once)

Paths are under `/Users/m1/kristy-ios/Kristy/Surfaces/`.

1. **calm-list** (`Home/CartList.swift`): the door tag moves into the open row, and the `%02d` numeral is cut in `groups`. UI tests that tap `cart.card` on a closed row now open the row first: ⚠ `grep -rln "cart.card" KristyUITests`.
2. **calm-card** (`Counter/CounterCardView.swift`; host clamp in ⚠ `CounterCardScreen` (grep `"struct CounterCardScreen"`)):
   - `DepthRow.spot`
   - the eyebrow wraps, then drops at AX3
   - the do line and `instead` fold at AX1
   - the depth group moves at AX1
   - the `stack` line 140 xxxL branch is removed
   - the `card.spot` id is moved
   - tests that read `card.pickSteps` without tapping are updated (⚠ grep `card.pickSteps`)
3. **calm-counter** (`Counter/CounterSurface.swift` for `SectionCard`, `Counter/CounterSectionScreen.swift` for `BrowseRow`, blurb, shortcuts row and the `tier` switch): rows become title only, the index shows no shortcuts, the AX ladder is applied.
4. **calm-shop** (`Shop/ShopMode.swift` for `sectionHeader` numerals and the `ShopRuleCard.canExpand`/default-collapsed threshold at AX1; `Shop/ShopRow.swift` is verify-only unless the AX3 S1-only state needs it).
5. **calm-home** (the ⚠ home landing view, the ⚠ carts sheet, the ⚠ scan sheet): door sublines are cut, the carts sub, legend, bars and items lines follow the ladder, and the scan row sublines are cut.
6. **calm-onboarding** (the ⚠ goal step): the AX ladder only.

Verify-only: haul and settings. No server, corpus or copy change in any piece. Every string kept is an existing string; the one new label, "How to spot it", is the existing eyebrow's words. Not migrated (no corpus change).

## 6. Anti-slop for this pass

- No "Read more" or "Show more" ellipsis links. Folds are labelled with what they hold plus a count ("Watch out · 2").
- No accordion that auto-opens the first item, and no auto-expanding the focused card's steps.
- Don't swap the `01`/`02` numerals for bullets, dots or icons. Cut means gone.
- No tooltip, info-ⓘ or "?" glyph standing in for a deferred line.
- No pill or chip for door tags inside the open row. Keep the quiet `ListDoorTagLabel` text link.
- No fade or opacity to demote text. Demote by size or by fold (the existing shop rule).

## 7. Lines for the kristy-ios design-system skill (for the admin to add under "Controls"; this pass did not edit SKILL.md)

- Calm: one headline, one primary action, one guidance block at rest per screen. Rows are names. Depth is a labelled row with a count, never an ellipsis.
- As text grows, things only fold or drop, never appear. Thresholds read `KristyType.tier` (L–xxxL / AX1–AX2 / AX3–AX5; see `calm-pass.md` §3).
- Defer, never delete: headline, `tier_note` and the cart pick never fold. Everything else may fold behind a row.
