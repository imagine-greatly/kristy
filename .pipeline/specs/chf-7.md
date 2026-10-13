# chf-7 — CardFan front card matches the live ground-beef card (iOS, ui)

Repo: /Users/m1/kristy-ios. Owns: `Kristy/Surfaces/Auth/CardFan.swift` only.

**Problem.** Plan Piece 7 (`/Users/m1/kristy/docs/plans/card-health-first-plan.md` §7). The sign-in/upgrade wall's card fan front card still teaches the retired lean-ratio advice ("80/20 for burgers. 90/10 for anything you drain."). Live `counter_cards` ground beef now says buy beef with seasoning at most, grass-fed and grass-finished.

## Change
Front card (last `Card` in the array): headline "Ground beef"; decision "Beef with seasoning at most, and nothing else in the ingredients."; pick "Grass-fed and grass-finished" (shortened from "Ground beef, grass-fed and grass-finished", which truncated at render; eyebrow and headline already name beef). Eyebrow "beef", styling, the other two cards untouched.

## Done means
- No lean-ratio copy in CardFan; rendered wall shows the new front card with no truncation (render: /Users/m1/kristy/.pipeline/runs/chf-7-cardfan.jpg; pre-fix truncated render chf-7-cardfan-r0-truncated.jpg).
- `Tools/checks/runners_compile.sh` passes; app builds.

## Out of scope / OK rough edges
Egg/milk cards in the fan (egg decision differs from live egg_feed_claims; ship note). DebugTripFixtures "Ground beef, 80/20" (debug only). App Store shots.

**Ship bar (blocker):** old lean-ratio copy visible on the wall; front-card text truncated/overlapping; any file other than CardFan.swift changed.
