# Codex brief

Role: docs (spec refresh)
TIER: T2
Goal: make `.pipeline/specs/ca-4a.md` build-ready against HEAD `d707172` (CA-3a and CA-3b shipped since the spec was written at base `8b49633`).
Time cap: 30 minutes
Owned files: `.pipeline/specs/ca-4a.md`, anything under `.pipeline/runs/ca-4a/`
Read dependencies and baseline: `.pipeline/specs/ca-4a.md`; `docs/CARD-ALIGNMENT-PLAN.md` (CA-4 section and D1-D8); the shipped pattern in `.pipeline/specs/ca-3b.md` and `.pipeline/runs/ca-3b/` (counts.mjs, before.json); `git log 8b49633..HEAD` and `git diff 8b49633..HEAD -- server/`; `server/lib/counterCardLint.js`; `server/scripts/listMatchProbe.js`.

Do this:
1. Re-anchor every ANCHOR by content. `dv check` currently reports DRIFT at kristy_perimeter_kb.json :565 and :592, docs/do-lines-review.md :53, server/lib/doLines.json :180, and STALE server/lib/perimeter.test.js:210.
2. Re-base the spec on `d707172`: replace `8b49633` as the diff base / BEFORE ref. Update every count pin (curated card count, pick count, test files that pin counts such as counterCardLint.test and ic8a/ic8b) to what HEAD actually holds now; count them from the files, never carry numbers forward.
3. Check that the CA-4a card text still passes the lints CA-3 added or changed (e.g. `lintRepeatedClaim` canonical G1 gloss exemption, tip ownership, repetition budget). Where a CA-4a string would now fail, fix the spec text within the plan's decisions and the claim lock (no new health claim, concern or statistic; zero first person; no brand names; no price). List each change.
4. Materialize what the build needs on disk (ca-3b was BLOCKED because its acceptance test was embedded but absent): write `.pipeline/runs/ca-4a/counts.mjs` exactly as the spec describes, and write the spec's embedded acceptance test content to `.pipeline/runs/ca-4a/acceptance.test.js` (the build installs it at its real path; do not write under `server/`).
5. Run `node .pipeline/runs/ca-4a/counts.mjs > .pipeline/runs/ca-4a/before.json` at the current tree (HEAD) and record the BEFORE values in the spec.
6. Run `dv check .pipeline/specs/ca-4a.md` if `dv` is on PATH; report its output verbatim. If unavailable, say so.

Constraints: write only owned files. Do not edit `server/`, `client/`, `docs/` or any KB. Never migrate. No git writes. No network.
For an answerable question, make the reasonable choice most consistent with the spec's and plan's intent, record it under "Assumptions", and continue. For a moved anchor, locate by content and continue. Environment failures: do everything else, report `blocked` kind ENVIRONMENT.

Acceptance:
- `dv check .pipeline/specs/ca-4a.md` prints PASS with no DRIFT/STALE lines (or report why not).
- `.pipeline/runs/ca-4a/counts.mjs` runs with exit 0 and `before.json` exists.
- No reference to `8b49633` remains as a base/BEFORE ref.

Report (≤30 lines): failures/skips first; changed files; every count pin old→new with its source; every card-text change; assumptions; observed command output; end READY or NOT READY.
