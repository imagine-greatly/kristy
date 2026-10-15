# Codex brief

Role: docs (spec splice + refresh)
TIER: T2
Goal: make `.pipeline/specs/ca-4b.md` build-ready against HEAD `a392e36` (CA-4a shipped there). Today it is a skeleton: 16 `TODO: <id>` lines, and the card text lives in four fragment files.
Time cap: 30 minutes
Owned files: `.pipeline/specs/ca-4b.md`, anything under `.pipeline/runs/ca-4b/`
Read dependencies: `.pipeline/specs/ca-4b.md`; fragments `.pipeline/specs/ca-4b-cards-F.md`, `-G.md`, `-H.md`, `-I.md`; the shipped pattern `.pipeline/specs/ca-4a.md` and `.pipeline/runs/ca-4a/` (counts.mjs, before.json, acceptance.test.js); `docs/CARD-ALIGNMENT-PLAN.md` (CA-4 section, D1-D8); `git diff 8e6133b..HEAD -- server/ docs/do-lines-review.md`; `server/lib/counterCardLint.js`; `server/scripts/listMatchProbe.js`.

Do this:
1. Replace each `TODO: <id>` with that id's card text from its fragment, verbatim. Apply each fragment's "Findings that change ca-4b.md" section to the spec; merge each fragment's acceptance SPEC entries, do-lines rows and claim-trace rows into the matching spec sections. Where two fragments conflict, or a fragment conflicts with a decision in the skeleton or the plan, the skeleton/plan wins; list each conflict.
2. Re-base on `a392e36`: replace the old diff base/BEFORE ref; re-anchor every ANCHOR by content; update every count pin (curated cards, picks, test files that pin counts) to what HEAD holds, counted from the files.
3. Check every CA-4b string against the current lints (counterCardLint incl. lintRepeatedClaim, tip ownership, repetition budget, counterDecision 120-char cap, the counterPath no-price check that reads `%` as price, HEADLINE_HEDGED). CA-4a needed two such fixes (a 159-char why, a "100%" in cart_pick). Where a string would fail, fix it within the plan and the claim lock (no new health claim, concern or statistic; zero first person; no brand names; no price); list each change.
4. Materialize `.pipeline/runs/ca-4b/counts.mjs` and `.pipeline/runs/ca-4b/acceptance.test.js` (the spec's embedded test; do not write under `server/`). Run `node .pipeline/runs/ca-4b/counts.mjs > .pipeline/runs/ca-4b/before.json`. Record BEFORE in the spec.
5. Project the acceptance test against the fragments' intended KB state if practical (as ca-4a's projected-acceptance.mjs did) and report fail count.
6. Remove the "NOT READY TO DISPATCH" banner only if steps 1-4 are complete. Run `dv check .pipeline/specs/ca-4b.md` if `dv` is on PATH (else `node ~/.claude/pipeline/dv.mjs check ...`); report output verbatim.

Constraints: write only owned files. Do not edit `server/`, `client/`, `docs/` or any KB. Never migrate. No git writes. No network.
For an answerable question, make the reasonable choice most consistent with the spec's and plan's intent, record it under "Assumptions", and continue. Environment failures: do everything else, report `blocked` kind ENVIRONMENT.

Acceptance:
- No `TODO:` remains in `.pipeline/specs/ca-4b.md`; `dv check` PASS with no DRIFT/STALE.
- counts.mjs exits 0; before.json and acceptance.test.js exist.

Report (≤30 lines): failures/skips first; changed files; count pins old→new with source; each card-text change and conflict; assumptions; observed command output; end READY or NOT READY.
