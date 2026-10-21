PIECE kristy/pick-avoid-1 (server half, T2, Claude-built; critic via dv ask afterwards, not yours)
REPO /Users/m1/kristy  BASE = current HEAD

Why: picks (`pick_*` KB entries) carry only decision + sources, so a shopper's shop row for corn, tofu, juice or cucumbers never says what to steer clear of. Devon approved a pick-only `avoid` field (2026-10-20).

Chain (scout facts, verify each line before editing):
1. server/lib/counterCardLint.js lintPick (~L829-900): allow an optional `avoid` string on picks. watch_out stays in PICK_FORBIDDEN_FIELDS. Lint `avoid`: one sentence, ≤12 words, ends with a period, no first person, no em-dash, no price words, no brand, no treatment verbs; reuse the existing string checks lintPick applies to `decision`, do not invent a new rule set.
2. server/lib/listMatch.js ~L236 (pick resolution returns `{id, line}`): also return `avoid` when present. ~L411 (attachCards): attach as `pickAvoid` next to the existing pick line field, only when present (absent field, never empty string).
3. server/lib/cartEdit.js ~L91-92 (sanitizeList keeps pick fields): keep `pickAvoid` as a string, trimmed, capped the same way the sibling pick line is.
4. KB server/kristy_perimeter_kb.json: add `avoid` to exactly pick_corn, pick_tofu, pick_juice, pick_cucumbers. Every claim must already exist in this repo: the parent card's watch_out/buying_tips/detail or a concern register evidence file under docs/sources/concerns/ (grep it, cite file in the report). Concerns: corn and tofu bioengineered (label "bioengineered"); juice synthetic dyes, sodium benzoate, BVO only if the evidence says so; cucumbers waxed skin. Neutral "Skip ..." or "Pass on ..." phrasing naming the label term. A line the evidence does not support is carried (listed), not written. Do not touch any other KB field or entry.
5. Tests freezing pick shape: server/test/acceptance/ktight.test.js and server/test/acceptance/cleanPick8.test.js (~L377) and any other grep hit asserting the exact pick key set. Extend the allowed key set by `avoid`; never delete an assertion.
6. NEW server/lib/pickAvoid.test.js: the 4 picks resolve with `pickAvoid` through attachCards on a row named by each pick's matching name; a pick without avoid has no `pickAvoid` key; sanitizeList round-trips it; lint rejects a first-person / em-dash / 13-word avoid.

OWNS: counterCardLint.js, listMatch.js, cartEdit.js, kristy_perimeter_kb.json (4 entries, `avoid` only), ktight.test.js, cleanPick8.test.js (pick-shape assertion only), other pick-shape pins found by grep (list them), pickAvoid.test.js [new]. Do NOT touch server/lib/plannedCart*.js, server/routes/guest.js, server/lib/list.js, docs/ (another piece is staged there). No iOS.

VERIFY (run, report numbers): `cd server && npm test` (baseline first; 0 fail), `node scripts/twoLineCheck.js | tail -1`, `node scripts/listMatchProbe.js` (0 wrong), `node scripts/commitGuard.js`. No git writes (new test file will trip commitScope until staged; say so).

REPORT ≤30 lines: the 4 avoid strings + evidence file each, carried lines, pin files touched, test counts, READY or NOT READY.
