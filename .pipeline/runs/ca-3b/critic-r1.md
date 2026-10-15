RUN .pipeline/specs/ca-3b.md
PIECE ca-3b
EXECUTION ca-3b-20261015202119-ZKdUug
ROUND 1/2

Cross-vendor waived: Codex-built piece reviewed by Codex critic because Claude subagents are paused (CLAUDE-LOW 7d=94%).

Blockers-only ship review of `git diff e2f783c f71f2b1 -- server/kristy_perimeter_kb.json docs/do-lines-review.md server/test/acceptance/ca-3b.test.js` against the spec .pipeline/specs/ca-3b.md (Alignment block, Steps table, Criteria C1-C9) and fragments .pipeline/specs/ca-3b-cards-{C,D,E}.md, plus CLAUDE.md non-negotiables: claim lock, no-treatment rule, zero first person, no em-dash, no price, no negative claims about named brands, safety lines kept (rotisserie FSIS reheating, ham cook-before-eating, cured_pork "Not Preserved, Keep Refrigerated"), fields not named byte-identical, cart_pick type unchanged, ESSENTIALS order.

Admin already measured: acceptance 8/8; server npm test 2565/2565; listMatchProbe 0/7 wrong; migrate --dry-run 181 nothing written; .pipeline/runs/ca-3b/after.json meat lints 0; cartPickMatch own slug or null (null: chicken_breast, turkey_whole, bacon, hot_dogs, turkey_bacon, cured_pork). Compare against .pipeline/runs/ca-3b/before.json: if a cart_pick that matched its own slug BEFORE now returns null, say whether that is a ship blocker under the spec.

Verdict: SHIP, SHIP with NOTEs, or BLOCK with file:line and exact fix. Nits are NOTEs. <=25 lines. Read-only.
