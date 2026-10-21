PIECE kristy-ios/planned-cart-ios-2 (ui:true, T2; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = current HEAD

## Alignment
Devon approved 2026-10-20 seven Kristy-built carts; home shows 3 carts plus "More carts". Design B: the planned-cart block under the notepad becomes ONE paper card (Palette.card fill, Palette.rule 1pt hairline border, the card corner radius the app already uses) holding four rows separated by Palette.rule hairlines: Everyday, Mediterranean, Nose-to-tail, then "More carts". Each cart row: title in the serif at the size the app already uses for a row title, caption under it in the ui caption style Palette.inkMuted, trailing chevron in inkMuted. Tapping a cart row loads it exactly as today (`loadPlannedCart`); while loading a ProgressView replaces that row's chevron and every row is disabled. "More carts" row: label plus trailing "4 more" and chevron; tap opens a sheet: serif title "Kristy-built carts", sub line "Each fills the list in store order. Edit anything after.", then the same card-of-rows listing all seven with captions. Tapping a cart in the sheet dismisses it and loads that cart. Captions hide when any hard line is set (as today), in both places. Eyebrow "Or start from a planned cart" stays. Failure copy and 429 copy unchanged.

## Read first
Kristy/Surfaces/Home/HomeSurface.swift L230-340 (plannedCarts L273, plannedCartRows L267, loadPlannedCart L321, a11y ids L308/L315); Kristy/App/RootView.swift L319-360 and Kristy/Surfaces/Settings/SettingsSurface.swift ~L104 (existing sheet + card-row styling: reuse, no new tokens); Kristy/DesignSystem/Palette.swift, Typography.swift, Radius.swift; grep the cart keys (garden_and_sea) across Kristy/ and KristyTests/.

## Build
1. Replace `plannedCartRows` with seven carts in this order (key, title, caption), captions verified against the server's built carts at ca32bef:
   everyday "Everyday" "Greens, eggs, salmon, grass-fed beef, oats."
   mediterranean "Mediterranean" "White fish, beans, olives, greens, sourdough."
   farmhouse "Farmhouse" "Eggs, pork shoulder, bacon, whole milk, sourdough."
   nose_to_tail "Nose-to-tail" "Liver, lamb, shellfish, sardines, soup bones."
   animal_based "Animal-based" "Chuck, liver, salmon, fruit, honey."
   vegetarian "Vegetarian" "Eggs, beans, tempeh, greens, aged cheese."
   vegan "Vegan" "Beans, tempeh, natto, greens, seaweed."
   Home subset = everyday, mediterranean, nose_to_tail. garden_and_sea leaves the UI (server still serves it). Any Swift enum/list of cart keys extends to the seven; keep garden_and_sea decodable if it is a closed enum.
2. ONE private card-of-rows view used by home and the sheet. No new colours, fonts, art; no first person, em-dash, or price.
3. a11y: cart rows keep `home.plan.<key>`; More row `home.plan.more`; sheet rows `home.plan.sheet.<key>`; failure keeps `home.plan.failure`. Rows are buttons labelled "<title> cart" with caption as hint.
4. Unit test (existing test target, extend PlannedCartTests.swift): seven keys in order; home subset; each caption one sentence ending in a period, no I/me/my, no em-dash. Existing tests stay green (update any pinning garden_and_sea on home).

OWNS: Kristy/Surfaces/Home/HomeSurface.swift (+ at most one new Kristy/Surfaces/Home/PlannedCartCard.swift; add it to the Xcode project if the project is not folder-synced), files holding cart-key lists, KristyTests/PlannedCartTests.swift. Nothing in /Users/m1/kristy.

VERIFY (run, report): simulator build; unit tests (NOT the UI suite: rate bucket); Tools/checks/runners_compile.sh; Tools/checks/palette_mirror.sh. One simulator only (8 GB box). Launch signed-out guest, empty list: screenshot the landing; tap More carts, screenshot the sheet; tap Vegan, screenshot the filled list (live server serves all seven). PNGs to /private/tmp/claude-501/-Users-m1-kristy/cfa4bf7b-6ab4-4f2c-824c-1fffb1524a6e/scratchpad/ios-pc2/. No git writes.

REPORT ≤30 lines: files, test counts, screenshot paths, deviations, READY or NOT READY.
