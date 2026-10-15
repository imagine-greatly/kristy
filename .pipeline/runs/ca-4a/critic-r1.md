RUN /Users/m1/kristy/.pipeline/specs/ca-4a.md
PIECE kristy:ca-4a
EXECUTION ca-4a-20261015221426-SJNj0J
ROUND 1/2

Blockers-only ship review of CA-4a (Eggs and Milk fronts, dairy ladder, pick_milk retired) in /Users/m1/kristy. Diff: git diff 6299434 d3cf2cf -- . ':!.pipeline'. The spec is the alignment block; plan context docs/CARD-ALIGNMENT-PLAN.md (CA-4, D1-D8). Rules: CLAUDE.md non-negotiables 2,3,6,7,8,9 (claim lock, no-treatment, zero first person, one verdict, no price, no brand negatives) and VOICE_SPEC.md.

Admin changed two strings after the build (spec, KB, acceptance test together): milk why shortened to 114 chars and milk cart_pick "Low-temp pasteurized grass-fed whole milk" (dropped "100%" because counterPath's no-price check reads % as price). Check these keep the plan's meaning and add no claim.

Admin-observed: acceptance 16/16, cd server && npm test 2581/2581, listMatchProbe 0 wrong, commitGuard clean, migrate --dry-run nothing written. Known, out of scope: eggs_dairy mixed L2 phrase group (ghee + three CA-4b cards) left for CA-4b; yogurt cart_pick "Plain Greek yogurt, 100% grass-fed" still carries % (tests pass).

Block only on real ship blockers: a claim beyond KB evidence, a deleted safety or watch_out line, a cart_pick that mis-matches, a changed test that weakens a guard rather than re-pinning a count or string, first person, price, brand negatives. Everything else is a NOTE. Do not edit files. Report at most 25 lines ending SHIP, FIX (with exact changes), or ESCALATE.
