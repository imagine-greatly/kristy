PIECE kristy-ios/planned-cart-ios-1 (P4, ui:true, T2; critic afterwards, not yours)
REPO /Users/m1/kristy-ios  BASE = current HEAD

Read first (that is the spec):
- /Users/m1/kristy/docs/PLANNED-CART-UI-BRIEF.md (layout, titles, captions, states, a11y ids `home.plan.<key>`). Follow it exactly.
- /Users/m1/kristy/docs/PLANNED-CART-PLAN.md "Devon's ruling (2026-10-20)": rows behave exactly as user-added, same shop mode.
- Server contract (live after the server piece pushes; read the route to be exact): POST /api/guest/list with body `{ plan: 'kristy', cart: '<everyday|nose_to_tail|garden_and_sea>', non_negotiables: [...] }` → `{ list: { goal: null, intro: '', items: [rows], cart }, planned: true, prefs }`. Rows are the same shape compose returns, `source: 'user'`. Read /Users/m1/kristy/server/routes/guest.js and /Users/m1/kristy/server/lib/plannedCart.js.
- Pick avoid (server half built alongside): rows matched to a pick may carry `pickAvoid: String` (absent when none). Read /Users/m1/kristy/server/lib/listMatch.js attachCards for the field.

Build:
1. KristyAPI.swift ~L218 `guestListBuild` (currently unused): make it send `plan`/`cart` (or add a sibling `plannedCart(key:nonNegotiables:)`), decoding the existing list response type. Reuse, do not duplicate the request plumbing.
2. Cart.swift: `loadPlannedCart(_ key:)` mirroring `seedFromLastWeek()` (~L521-527): same loading/commit path so rows land as if composed, staleness guard (drop the response if the cart gained a row while in flight), 429 → existing rate-limit line, other error → "That cart did not load. Try again." per brief. Hard lines come from the same prefs the compose path sends.
3. HomeSurface.swift emptyLanding (~L206-245): the brief's block under "Same as last trip". Shown only per brief conditions. Captions hidden when any hard line is set.
4. pickAvoid iOS half: ListRow (ListModels.swift ~L105-107, CodingKeys ~L207) optional `pickAvoid: String?`; carry it through the Cart.swift ~L792-795 merge; ShopFocus pick branch (~L45-46) and ShopRow (~L104-105) show it as the pick's second line where the card path shows its avoid/watch line (read how a card row renders its watch_out/avoid line and mirror its style; no new style).
5. Unit tests in the existing test target: decode a planned response fixture (20 rows, one with pickAvoid, one without); loadPlannedCart drops a stale response; ListRow round-trips pickAvoid absent/present.

Brand: paper only, tokens.json colours only, gold only eyebrows/hairlines; no new art; no first person; no em-dash; no price.

OWNS: Kristy/**/KristyAPI.swift, Cart.swift, HomeSurface.swift, ListModels.swift, ShopFocus.swift, ShopRow.swift, their unit tests, fixtures. Also the already-modified .claude/skills/design-system/SKILL.md (leave as is). Nothing in /Users/m1/kristy.

VERIFY (run, report): build for simulator; unit tests (not the UI suite: rate bucket); `Tools/checks/runners_compile.sh`; `Tools/checks/palette_mirror.sh` if present. One simulator only (8 GB box). Launch the app on the simulator, signed out guest, empty list: screenshot the empty landing, then tap Everyday and screenshot the filled list (server must be live; if the route 404s because the server piece is not pushed yet, say so and screenshot the landing only). Save PNGs under /private/tmp/claude-501/-Users-m1-kristy/cfa4bf7b-6ab4-4f2c-824c-1fffb1524a6e/scratchpad/ios-pc/. No git writes.

REPORT ≤30 lines: files, test counts, screenshot paths, deviations from brief, READY or NOT READY.
