# The four content duplications — survey before moving anything

Measured 2026-08-05. **Report only; nothing was changed.** Prerequisite for
`SWIFT-SPEC.md` (§G14 points here), because each of these becomes copy #3 when a Swift
client exists.

**The headline: three of the four are not what `PASS3-HANDOFF.md` §10 describes.** Only one
needs an endpoint. One is demo-only and an endpoint would defeat its purpose, one is a single
duplicated *function* plus three deliberately different registers, and one splits cleanly into
a claim register that should move and a token map that must not.

Two of my own intermediate results were wrong and were caught by re-checking rather than by
trusting the first output — both are noted inline, because the method matters more than the
numbers.

---

## 1. `GOAL_TEMPLATES` / `FOCUS_ITEMS` — does NOT need an endpoint

`client/src/lib/list.js` is 1095 lines against the server's 884, carrying a parallel `PICKS`
table, `GOAL_TEMPLATES`, `FOCUS_ITEMS`, `blendTemplates`, `generateLocal` — under the comment
*"The demo GOAL_TEMPLATES/FOCUS_ITEMS mirror server/lib/list.js — keep them in sync."*

**Every caller is behind `IS_DEMO`.** Traced: `client/src/lib/list.js:134`, `:203`, `:240`,
`:1066` — `loadOrGenerateDemo` and `generateLocal` are reached from nowhere else in
`client/src`, and nothing outside that file imports `GOAL_TEMPLATES`, `FOCUS_ITEMS`,
`generateLocal` or `loadOrGenerateDemo` at all. The real client calls `GET /api/list` and
`POST /api/list/rebuild`.

So this is **demo fixture data**, not a duplicated capability. And demo's stated purpose is
*"no backend at all"* — serving it from an endpoint would defeat the one thing it exists for.

**Drift, measured across all 51 picks: exactly one.**

| pick | field | server | client |
| --- | --- | --- | --- |
| `canned_fish` | `why` | "Packed in olive oil or water, never "vegetable oil" — and skipjack is the lighter tin on mercury." | "Skipjack (the "light" tin) sits lower in mercury than albacore." |

That is the server-side rewrite CLAUDE.md records under **"WHEN A PICK'S CARD AND ITS `why`
DISAGREE, THE `why` MOVES"** — `canned_fish` was retargeted from `mercury_by_fish` to
`canned_fish_choosing` and its `why` rewritten to lead with the pack medium. **The client never
received it**, so demo still shows the old mercury-led line.

> **Two corrections to my own first pass, both from re-checking.** An initial
> `grep -o "^  [a-z_]*: {"` comparison reported "PICK keys DIFFER" — that was **ordering**,
> not drift; the sorted key sets are identical, 51 and 51. And a line-by-line parser reported
> five `NAME DRIFT` entries with `client: undefined` — those five picks are written on a
> **single line** in the client file, so the parser missed a `name:` that was present.
> Neither was real. **A diff tool that has not been checked against a known-identical case
> reports drift that is an artifact of its own reading.**

**Verdict: leave it.** Fix the one drifted `why` if demo fidelity matters. It becomes copy #3
only if Swift ships a demo mode, which is a decision to make, not an inheritance. If it does,
the answer is a bundled JSON fixture, not an endpoint.

---

## 2. `coachGoals.js` — this is the one that genuinely moves

317 lines: `COACH_GOALS`, `FOCUSES`, `NON_NEGOTIABLES`, `CONSTRAINTS`, their section copy, and
Kristy-voiced blurbs and payoff lines that exist **only** in the client.

`GET /api/preferences/taxonomy` already serves ids and labels from `server/lib/taxonomy.js`.
What is client-only is the **copy** — the blurbs, the section titles, the payoff framing. That
is Kristy's voice, it is the kind of content the brand lock governs, and it has no server home.

**Half of it is already enforced.** `constraintsMirror.test.js` (shipped 2026-08-05, commit
`103bb25`) pins the client `CONSTRAINTS` against the server taxonomy on ids, labels and order,
plus the presence of a blurb on every chip. That is the `listSectionsMirror.test.js` treatment
and it is the pattern that has held.

**Verdict: move the copy behind the existing endpoint, and extend the mirror test to
`COACH_GOALS`, `FOCUSES` and `NON_NEGOTIABLES` first.** The test comes before the move, not
after — the mirror is what makes the intermediate state safe.

### Done: the mirror test now covers all four dimensions

Extended 2026-08-05. It asserts **ids and order** per dimension, plus that no client hard line
is one the engine cannot match — the load-bearing direction, since a hard-line id the client
invents is a rule the shopper sets and nothing enforces.

**It deliberately does NOT compare wording, and that is a finding rather than a gap.** A first
draft did, and all three new dimensions "failed" on differences that are registers, not drift:

| id | client (chip) | server (shown to the model) |
| --- | --- | --- |
| goal `family` | "Family" | "Feeding a family" |
| focus `additive_sensitive` | "Additive-sensitive" | "Additive-sensitive (dyes & preservatives)" |
| hard line `no seed oils` | "No seed oils" | "no seed oils" |

The server label is what `buildComposeInput` shows the model; the client's is what fits a 44pt
chip. The hard-line case is starker: the server's "label" **is the matching phrase the engine
keys on**, so it is lowercase and identical to the id by design. Asserting equality would force
one register onto three positions — the same mistake §3 rejects for tier→prose.

⚠️ **OPEN, for a human: are the first two deliberate?** "Family" vs "Feeding a family" and the
dropped "(dyes & preservatives)" are each plausibly a chip-width decision AND plausibly an
un-synced edit. I could not resolve intent from the code, and guessing either way is worse than
asking. **If they are deliberate, the client file should say so per row; if not, they are two
one-word fixes.** Note the goal chip register also feeds nothing but the UI — `labelForGoal` is
what reaches the model — so neither difference can currently produce a wrong claim.

---

## 3. tier→prose is ONE duplicated function plus THREE deliberate registers

§10 says "written five times". Measured, it is three different jobs:

**(a) A true duplicate — the bucketing function.** `HaulMoment.jsx:24` and `data.js:258` are
byte-identical logic:

```
approved → 'approved' · approved_with_note | use_with_intention → 'note' · else → 'swap'
```

One correct answer, two copies. And the `else` is **load-bearing**: CLAUDE.md records that
`tierBucket` returning `'swap'` for anything unrecognised is why a tier-less bought item would
render RED on the distribution bar — which is why `bought` rides as its own field and the bar
stays scans-only. **This one should be single-sourced.**

**(b) Three registers that are different ON PURPOSE.** Same tier, three renderings, because
they appear in three grammatical positions:

| file | `approved_with_note` renders as | position |
| --- | --- | --- |
| `ScanVerdictCard.jsx:34` | `'Approved with note'` | a card badge |
| `CartMoment.jsx:50` | `'With a note'` | a cart-row chip, beside the item |
| `App.jsx:886` | `'approved, with a note'` | a sentence fragment |

`CartMoment` also has `"She'd swap this"` where `ScanVerdictCard` has `'Swap recommended'`.
**Collapsing these into one endpoint would be a regression** — it would force one register on
three positions, and the cart chip is deliberately short because it sits inline next to a
grocery name.

**(c) A colour map.** `CartMoment`'s `fg`/`bd`/`bg` per tier is tokens, not content, and must
stay client-side (in Swift: an asset catalog).

**Verdict: single-source (a). Leave (b) and (c) alone**, and correct §10's framing — "five
times" counts three intentional registers as duplication.

---

## 4. `verdictRamp.js` splits cleanly down the middle

78 lines, already single-sourced *within* the client (`ScanVerdictCard` and `IngredientPage`
both import it), so there is no drift today. But two different kinds of thing live in it:

**Moves — a claim register.** `SEVERITY_LABEL`: `'Skip always'`, `'Strong case to avoid'`,
`'Worth knowing'`. These are verdicts about severity, authored in Kristy's register, and they
are exactly the "claim-adjacent strings" §10 names. A second client would restate them, and a
restatement that drifts is a claim that drifts.

**Does not move — presentation.** `SEV_RANK` (ordering) and `severityColor` (severity →
`colors.error` / `accentGold` / `accentGoldMuted` / `accentSeafoam`). The colour mapping is a
token binding; putting it behind an endpoint would send hex over HTTP and defeat the asset
catalog in Swift. CLAUDE.md's reasoning for the four steps — moderate takes muted gold so it
reads as a dimmer high rather than an identical dot — is a rendering decision.

**Verdict: `SEVERITY_LABEL` moves. `SEV_RANK` and `severityColor` stay.** Splitting the file
is the change.

---

## Recommended order, when approved

1. **Single-source the tier bucketing function** (§3a). Smallest, no endpoint, no copy moves.
2. **Move `SEVERITY_LABEL` server-side** (§4). Small, and it is a claim register.
3. **Extend `constraintsMirror.test.js` to goals / focuses / hard lines** (§2). Test first.
4. **Then move the `coachGoals` copy behind `GET /api/preferences/taxonomy`.**
5. **Leave the demo templates and the three tier registers alone** (§1, §3b) — and record why,
   or someone will "fix" them later.

**Only step 4 is a content move to an endpoint.** The §10 framing implies four; the measured
answer is one, plus one small claim register, plus one deduplication.
