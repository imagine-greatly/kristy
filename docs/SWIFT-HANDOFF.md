# SWIFT HANDOFF — state of the product, 2026-08-05

**Read this first, then `SWIFT-SPEC.md`.** This document is the state; that one is the spec.

`main` is at **`5ba19fb`** and pushed. `cd server && npm test` → **572 pass, 0 fail**.
`cd client && npx vite build` → clean.

Two facts that change how you read everything else:

1. **`GuestApp.jsx` is production.** Phone sign-in is blocked on 10DLC, so `session` is null for
   every visitor and `App.jsx` returns `GuestApp` hundreds of lines before its own surface stack.
   **`App.jsx`'s dashboard/scan/aisle/haul branches have never rendered for a real shopper.**
   Anything verified below was verified through the guest path, because that is the only path.
2. **A push to `main` deploys both halves with no staging gate** — Vercel for the client,
   Railway for the server (Root Directory `server/`, so nothing outside it exists in production).

---

## 1. DONE AND VERIFIED IN PRODUCTION

Verified means: real HTTP against `kristy-server-production.up.railway.app`, through the
endpoint the deployed client actually calls, with the response quoted. Not "tests pass".

### List refinement — the compose engine edits instead of rebuilding

| case | result |
| --- | --- |
| `"no seafood"`, `mode:"build"` over 9 rows | **9 → 7**, salmon + shrimp removed. Pre-fix: **0 rows.** |
| `"no seafood"` over the shopper's own typed rows | **9 → 7** via the category bridge. Pre-fix: 9, unchanged. |
| `"make this healthier"` over their own junk | *"Nothing came off. Diet soda, doritos and oreos stayed. Rows you added come off with a tap."* |
| `"no money"` build | no price label; one-pan items |

Three defects fixed: `cartCommandMode` routed every refinement to the destructive mode;
`applyCompose` could not match `"Wild-caught salmon fillets"` from `"no seafood"`; the summary
claimed removals that were refused. `listRefine.test.js` (18 tests), each verified to fail on
the pre-fix tree — 9 assertions went red.

### Photo import — the path that was unreachable three ways

| case | result |
| --- | --- |
| iOS Notes screenshot (PNG) | **12/12 items.** Struck row dropped, heading dropped, quantities stripped, 2 rows sharpened. |
| Printed handwriting, photographed (JPEG) | **12/12**, identical. |
| Scribbled-over item + struck row | Struck row dropped; scribbled row omitted (defensible — a scribble *is* how people delete). |
| Photo posted with an existing cart | **14 rows: 2 pre-existing + 12 imported**, checked state preserved. |

Four things had to land together: `req.user.id` (not `req.userId`, which nothing in the server
sets, so the route 503'd for every caller **after paying for the vision call**); a guest endpoint
(`importList` was posting a bearer token to a `requireAuth` route); `onImport` in `GuestApp`; and
a multipart fix — `list` arrives as a *string*, so `sanitizeList` returned null and the import
**replaced** the cart it promised to append to. **That last one was found only by driving real
images at production**; the JSON path arrives parsed and was always fine.

**Crossed-out items: dropped 9/9**, was kept 6/9 including the clean line-through of a Notes
screenshot — so never a legibility problem.

### The "cheap" leak

Every budget-constrained list said *"Cheap protein and carbs"*, against the prompt's own ban.
The prompt contained the literal phrase **"Cheap protein asked for"** as a worked example. Fixed;
the model adopted the substitute vocabulary verbatim (*"Stretches a tight budget"*), 3/3 clean.

### Equipment fact

`one_pan` / `no_oven` in the existing chip row — no new surface, no new question flow.
**Measured on trip two** (`"food for the week"`, equipment not in the sentence): without the fact
both runs put *"Chicken thighs or whole chicken"* on the list; with it, both returned zero
oven-implying items and *"Everything cooks in one pan."*

---

## 2. BUILT BUT NOT VERIFIED IN PRODUCTION

**Everything here has tests and a clean build. None of it has been exercised by a real shopper
or by real HTTP.** Treat it as unproven.

- **The `needsFix` inline correction.** Verified in a browser at 390px with real pointer input
  (`client/test/needsFix.mjs`): both flags render, partial letters pre-fill while the
  "Unreadable item" placeholder does not, the correction submits through the shipping
  `cart.refine`, the flag clears, contrast 8.59:1 off rendered colour.
  ⚠️ **But see §3 item 1 — the vision layer rarely produces the flag that triggers it, so this
  UI is currently near-unreachable in practice.**
- **`onImport` in `GuestApp`** — the control now renders, but no one has tapped it on production.
  The endpoint behind it *is* verified.
- **Guest import via the TEXT path.** Only the multipart path was driven at production.
- **`severity_label` on the ingredient payload.** Server-side move done, client reads it,
  no production read.
- **`tierBucket` single-sourcing** — pinned against the server by `tierBucketMirror.test.js`;
  the Haul bar has not been re-checked on production.
- **The counter-generator example replacement.** No card has been generated since. The next
  generated card is the first real exercise of the new prompt.
- **`buildApiShapes.js` output** — derived and drift-tested, but **31 of 60 handlers carry a
  response the generator could not expand** and none of those has been hand-confirmed.

---

## 3. THE OPEN QUEUE, CURRENT

`PASS3-HANDOFF.md` §14 as it now stands, corrected — several items in it were completed this
session and it had not been updated.

### Live defects

1. ⚠️ **An unreadable list row is SILENTLY OMITTED, not flagged.** Measured on production and
   locally: a blurred-illegible row simply vanished (6 rows where 7 were written), 2/2 runs,
   **after** the prompt was strengthened to forbid exactly that. The row is plainly perceptible
   as writing, so this is the model preferring omission over flagging, not failing to see it.
   The scribbled case improved 0/2 → 1/2. Consequence: the shopper loses an item with no trace
   and finds out in the store, and `needsFix` — plus the whole correction UI — rarely fires.
   **This is the strongest argument in the spec for `VNRecognizeTextRequest`: it returns
   per-word confidence, a mechanical signal, instead of asking a model to volunteer one.**
2. **A refund that arrives as an unmapped RevenueCat event leaves the shopper premium until
   expiry.** `mapRevenueCatStatus` returns `null` for anything it does not recognise and the
   route replies `{ received: true, ignored }` rather than guessing. Deliberate, and worth
   revisiting when Apple is the live provider (§A2).
3. **`/api/guest/chat` has no cart-command branch**, so a guest talking to the composer cannot
   edit their cart — and on web that is every visitor.

### Not started

4. **List creation design review** — real component renders at 390px, no hand-built HTML.
   Then build, in order: iterative compose, the room with typing, photo, voice. *The audit
   feeding this is done: `LIST-CREATION-AUDIT.md`.*
5. **Scan card redesign — bottom sheet, not the 3,000px takeover.** Summary + full read on tap,
   camera stays live, approved state the SMALLEST state in the app. **In SwiftUI this is
   `presentationDetents` over a live camera — doing it in Swift first is defensible.**
6. **Scan card thumbnail from the shopper's photo.** On a photo read the image slot is empty.
   Client-side crop, in memory for the session, nothing persisted.
7. **List attachment eyebrow — REPORT ONLY.** Does "PICKING PRODUCE" above an instruction earn
   its line?
8. **GuestApp / App divergence audit.** **Three divergences found so far, all by accident or
   incidentally** — hero handlers, `onImport`, and the fact that `App.jsx` calls
   `setMoment("list")` for a moment that does not exist. Nothing says those are the last.
   **In Swift the answer is one stack, so this becomes "what capabilities differ".**
9. **Harness sweep for the props-supplied pattern.** `cartHarness`, `shopHarness`, `loopHarness`,
   `composedHarness`, `skim-harness` all construct props. A harness proves the component; only
   the real call site proves the wiring.
10. **The `coachGoals` copy move** behind `GET /api/preferences/taxonomy`. The prerequisite is
    done — `constraintsMirror.test.js` covers all four dimensions on ids and order.

### Deferred with reasoning recorded — do not relitigate from intuition

11. **Quantity and headcount.** `QUANTITY-PROPOSAL.md` carries the decision and four settled
    conclusions. The deciding measurement: handed the household explicitly, **5 of 6 overlapping
    items were identical** — a household of six and one of one both told to buy 1 dozen eggs.
12. **Voice on web.** Measured as not clearing the bar on iOS: partial support since 14.5, audio
    to Apple's servers, silent death in continuous mode, **reported broken in installed
    standalone PWAs** — which Kristy is. `SFSpeechRecognizer` is a legitimate Swift feature.

### Open questions needing a human, not a decision I can make

13. **Two label mismatches** — goal `family` ("Family" vs "Feeding a family") and focus
    `additive_sensitive` (dropped parenthetical). Chip register or un-synced edit? Nothing in the
    code distinguishes them. **Neither can produce a wrong claim** — `labelForGoal` is what
    reaches the model. `DUPLICATION-SURVEY.md`.

### Blocking revenue, unchanged

14. **Phone sign-in.** 10DLC brand + campaign submitted, in verification at Twilio. Remaining
    work is Supabase dashboard only — Auth → Providers → Phone → enable, select Twilio, fill
    Account SID / Auth Token / Message Service SID. **No server work, no env vars, no redeploy.**
    Until it lands every visitor is a guest and **no purchase is possible.**
15. **`push_tokens` migration** outstanding, deferred with Expo push. Swift would use APNs
    directly; the table is still needed. Code degrades gracefully without it.

---

## 4. STILL THIN IN `SWIFT-SPEC.md`

Two items that were thin are now closed: §A response shapes (generated, drift-tested) and
StoreKit ↔ `subscriptions` (§A2). What remains, in the spec's own words:

- **REQUEST bodies are specified nowhere.** The generator derives responses only. **This is now
  the biggest §A gap.** Start with `/list/compose`, `/list/import`, `/counter/ask`, `/verdict`.
- **§D is rules and no layout.** Deliberate, but a Swift dev has no visual target and will need
  the running web app or screenshots.
- **§E option 1 (contrast off rendered colour in Swift) is an unproven spike.** The *web*
  technique is proven and shipping; only the Swift analogue is unverified. Ship the cheap floor
  — forbid `.opacity()` on text, precompute the token matrix — and treat pixel sampling as a
  spike.
- **Offline beyond `rowMatch`.** Nothing says what the app does with no network mid-aisle, which
  is a real store condition and a place native could beat web badly.
- **App Store review** — demo/screenshot story, privacy manifest, usage-description copy. Note
  account deletion is already implemented server-side (`DELETE /api/account`, with a
  `USER_TABLES` sweep that `privacyLine.test.js` keeps honest).
- **Accessibility beyond contrast** — VoiceOver order, Reduce Motion. Dynamic Type is
  *resolved* in the spec: the rule is "the do line leads", not "17.5pt".

---

## 5. THE DISCIPLINE THAT FOUND MOST OF THIS

Not process for its own sake — every one of these was learned from a defect that shipped, and
the Swift client will reproduce them if it does not inherit the lessons. `PASS3-HANDOFF.md` §13
has the full family; the short version:

- **A harness proves the component; only the real call site proves the wiring.** A dead hero
  shipped under a green suite because the harness supplied the props the call site forgot.
- **An assertion over an empty collection passes.** `nonEmpty()` binds at the collection.
- **A comment asserting an invariant is not an invariant.** The retrieval floor was wrong three
  times in three different ways, each time written by someone who had just read the code.
- **A prompt's worked example becomes its output.** Twice. Now mechanically tested.
- **"Pushed" and "believed pushed" are indistinguishable from inside the editor — in both
  directions.** §13.10. Verify with `rev-parse` → `reflog` → `ls-remote` → read the file back off
  the remote. `git status` showing `## main...origin/main` is **not** sufficient.
- **A push is not a deploy.** Behaviour on the live box is the only evidence a fix shipped.
- **Measure, don't eyeball.** Geometry claims come off `getBoundingClientRect`; contrast comes
  off rendered colour with ancestor opacity folded in.
- **When a check and the code disagree, suspect the check.** Three times this session a "defect"
  was my own parser: PICK-key ordering, single-line table rows, and an assertion matching the
  comment that described the bug it was testing for.
