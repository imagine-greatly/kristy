RUN /Users/m1/kristy/.pipeline/specs/ca-5.md
PIECE kristy:ca-5
EXECUTION ca-5-20261016022727-COh4J8
ROUND 1/2

Blockers-only ship review of CA-5 (six section tips rewritten verbatim from docs/CARD-ALIGNMENT-PLAN.md "Section tip" sections; section lints on) in /Users/m1/kristy. Diff: git diff HEAD~1 HEAD -- server. The spec is the alignment block. Rules: CLAUDE.md non-negotiables 2,3,6,7,8,9 and VOICE_SPEC.md; "Cards talk, rules guide": a section rule is holistic and never links to or names an item card.

Admin-observed: acceptance 5/5, cd server && npm test 2638/2638, listMatchProbe 0 wrong, commitGuard clean, migrate --dry-run nothing written; loadSectionRules() rows have keys exactly section,rule,checks; no sources/tip_aligned/cards_aligned in the payload; every rule/check string appears verbatim in the plan; rules <=18 words, checks <=15.

Block only on: a served string differing from the plan, a card link or slug in the payload, a treatment/health claim, first person, price, brand negatives, a test change that weakens a guard rather than re-pinning strings/order. Everything else is a NOTE. Do not edit files. Report at most 20 lines ending SHIP, FIX (exact changes), or ESCALATE.
