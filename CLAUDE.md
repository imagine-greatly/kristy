# CLAUDE.md — Kristy

Branch: `main`. This file is the **current state** of the product and the rules that bind every
change to it. Rules only; the account behind each section is in the companion doc named at its
head. Delete a rule here when it stops being load-bearing.

---

## WORKING DISCIPLINE

*Account: `docs/WORKING-DISCIPLINE.md`.*

Claude Code runs here over SSH into a rented Scaleway Mac mini; sessions drop mid-task with no
warning. The conversation is lost; every file on disk survives.

### Commit before reporting

```
git add -A  →  commit with a real message  →  push  →  four-step verify  →  THEN report
```

- Approval is not a precondition for committing; it applies to what is already on disk.
- Stopping mid-unit to ask a question: commit first, message prefixed `wip:`, then ask.
- ⚠️ **Commit first, plant second, revert third.** Proving a check can fail means breaking the
  source on purpose; `git checkout -- <file>` restores the last COMMIT, so planting into
  uncommitted work deletes it. `git stash` stashes the test too (a suite running zero tests
  reports success).
- Never end a turn with anything untracked. `git add -A`, never `git commit -a`. Run
  `node server/scripts/commitGuard.js`.
- Four-step verify: `git rev-parse HEAD` → `git reflog` → `git ls-remote origin main` → read a
  file back from the remote and diff it against local. A push has reported success while the
  remote had not moved; exit codes and keychain text cannot tell the cases apart.

### One task per session

- A session is ONE task. When its work is committed and verified, the session is over.
- Every final report, full or partial, ends with a **continuation prompt**: a fenced block Devon
  pastes verbatim into the next session. It names the task, the exact next step, the files, the
  verification commands, and what NOT to retry. Write the handoff (`handoff` skill) first; the
  prompt points at it. Then say `/clear` is safe.
- ~60k resident context is the boundary, not a warning: commit, handoff, continuation prompt, stop.

### Pushing

- `main` is production (Vercel client, Railway server, live in about a minute, no staging gate).
  Commit always; **push `main` only when the turn's work is meant to go live**.
  Committed-and-unpushed work is stated in the report, never left as "ahead N".
- A KB edit has two publish channels. MIGRATE (`node server/scripts/migrateCounterCards.js`, run
  from `server/`, it loads `.env` from cwd) writes the KB to the live `counter_cards` table with
  no push or deploy → iOS. PUSH publishes the file → web (`routes/perimeter.js`).
  **State both, every time:** committed / pushed is the code; migrated / not is the corpus.
  Card commits say `Not migrated.`
- Commits that stay off `main` also go to `origin/held` (backup branch, not a deploy target). If
  `main` is behind what the docs describe, fetch `held`, never reconstruct:
  `git fetch origin held && git log --oneline --reverse origin/main..origin/held`. A Vercel
  preview build for the branch is harmless (CORS-blocked). `osxkeychain` fails over SSH in a way
  that reads as success (`-25308` appears on successes too); push with
  `git -c credential.helper='!gh auth git-credential' push origin main:held` and prove it with
  `ls-remote` plus a file read back.

### Scope

One surface or one contained unit per prompt. List the files you expect to create or modify
before starting; needing others is said, not silently done.

### Resuming after a dropped session

```
Treat every existing file as COMPLETE unless visibly truncated.
Never recreate a type or a file that already exists. Never run an
audit pass over finished work. Do only what is missing, judged
against the expected-files list in the prompt that was interrupted.
A rewrite of finished work still compiles: a fresh session cannot
distinguish "I did not write this" from "this is wrong."
```

### Every session starts cold

Assume you are resuming. Before any work, unasked:

```
- git status --porcelain on BOTH repos; commit and push anything
  outstanding (push = kristy-ios and main:held, NOT kristy main)
- confirm kristy-ios HEAD against its remote by READING A FILE BACK,
  not by comparing hashes
- report kristy main vs origin/main and origin/held
- report the server suite count; report the iOS UI count from the
  LAST RECORDED RUN and say so. Never re-run it unasked: one run is
  ~23 attaches against a 20/hour bucket with a 63-minute recovery.
- run kristy-ios Tools/checks/runners_compile.sh (drivers decay silently)
- report anything in flight: a background run, a half-finished fix,
  an unmigrated corpus change
```

Then state what you understand the current task to be, and STOP if it is not obvious from the
repo. A dropped session leaves work in a state, not an instruction; never infer a task from a
`wip:` commit. This is the only copy of the list; `kristy-ios/CLAUDE.md` points here.

---

## Two halves, two rule sets

### `client/src` — DEAD. FROZEN. INSPIRATION ONLY.

The React SPA still serves `kristyapproved.com` and is never edited again, for any reason. It is
the behavioural specification for the iOS client and the record of measured decisions (contrast
floor, hero rule, active-section rule, type inversion, one-filled-action count). Read and cite;
never write.

- `client/src/lib/tokens.js` is a frozen historical copy, not the brand. The brand is
  `kristy-ios/Brand/tokens.json`. The last mirroring (`brassFill`, `brassFillInk`,
  `surfaceLifted`) closed the route.

### `server/` — live infrastructure, governed rather than frozen

- A server change is separately proposed and approved work: routes, KB entries, prompts, lint, tests.
- An iOS prompt may not produce a server change. iOS work that needs one stops and asks (route,
  shape, what the client cannot do without it); it never routes around it in Swift.
- A finding is not a fix: `kristy-ios/docs/API-FINDINGS.md`, with evidence.
- Node runs the full suite here; the rule is about scope and review, not testability.
- Not covered: `docs/`, this file, unapplied `supabase/*.sql`, anything scoped as server work.

---

## What Kristy is

A **grocery coach for the whole store**, not a scanner with a list. The labeled half you scan;
the unlabeled half (meat, fish, eggs, produce, dairy, bulk) is the moat. The cart is the center:
scanning vets packaged things for it, the counter answers the unpackaged things going in, the
haul reads how it came out.

**Kristy is not a calorie tracker.** Macro tracking was removed: no macro cards, meal logging,
"logged it" UI, or macro asides in chat. Enforced structurally by `macroGuard`.

---

## Non-negotiables

1. ⛔ **Brand (iOS only): paper, not dark stock.** Ruled 2026-08-24, amended 2026-09-07: ground
   is solar kraft `#CFBA8E`, card is `#F5F1E6`, green-black ink, green / ochre / orange food
   ladder, `Fraunces` for serif. Forest green and brass live only on the logo's plate (icon,
   scan corner mark); brass off it is forbidden (2.08:1 on paper, 1.24:1 on kraft):
   `kristy-ios/docs/ios-specs/paper.md` (§0 premise). Recorded in three places, all three or
   none: `Brand/tokens.json` `_stance`, `kristy-ios/CLAUDE.md`, here. `palette_mirror.sh` must
   not be loosened. The frozen `client/src` keeps the old brand. "Never invent" still binds
   every colour authored from here on.
2. **The claim lock is law.** Every health/ingredient claim traces to a matched KB entry; the
   model may rephrase tone, never introduce a concern, statistic or claim. Enforced structurally
   (entries stripped to an allowed-field whitelist before the call) on every surface in Kristy's
   voice.
3. **No-treatment rule, symmetric.** No food treats, manages, cures, prevents, lowers risk of,
   or causes anything. Objections are rooted in processing. Focuses are preferences the user
   turns on, never inferences. Medical defers to a doctor.
4. **The stamp is earned.** No seal anywhere (ruled 2026-09-24). The logo on its forest plate
   renders in the scan card's corner only when the server's `stamp` is true; the corner is empty
   otherwise. Static. `surfaces.md` "Scan card".
5. **Never reshape the engine output.** `server/lib/verdictEngine.js`'s matched-entry shape is
   consumed directly; extend additively, never restructure.
6. **Voice: zero first person.** `VOICE_SPEC.md`. No "I/me/my", no em-dash asides, half the
   words. Tier ownership is rephrased, not deleted: a reader always knows settled science vs
   credible concern vs standard, except on the scan card (no tier, ruled 2026-09-24).
7. **One verdict per headline; accuracy outranks firmness.** A two-clause headline split by TYPE
   or USE CASE stays; one conditioned on budget, stock or time is a retreat. If a claim needs a
   false mechanism to sound convincing, the claim is wrong. Enforced by `counterCardLint.js`.
8. **No price, ever.** Budget means cost-conscious selection; relative terms only.
9. **No negative claims about named brands.** Teach the label truth instead.

---

## Architecture

- Server is authoritative (`server/`, Railway): KB + matching + tier scoring + claim-locked model
  calls. Clients are thin renderers.
- Two knowledge bases, never merged. `kristy_ingredient_knowledge_base.json` (74 entries) is the
  only thing the engine sees. `kristy_perimeter_kb.json` answers counter questions, never scored.
- Web SPA is the reference client; `mobile/` (Expo/RN) is the App Store port.
- ⚠️ **`GuestApp` is production; `App`'s own surface stack has never rendered for a real
  visitor.** `session` is null for everybody. Diagnose from `GuestApp.jsx` first.
- `kristyapproved.com` is the canonical front door; `kristyapproved.vercel.app` a secondary
  alias. The server trusts only origins in `CLIENT_ORIGIN`. Push to `main` auto-deploys; no
  `.vercel/` locally does not mean undeployed. Check what a change does live before pushing it.

---

## The interface

Two states and one loop: *before the store* you plan on the dashboard; *in the store* you walk in
shop mode, one thing on screen. Everything else is a tool you branch to and come back from.

Nav: **Home · Scan · Counter · Haul**, four equal tabs. Scan and Counter are identical in
treatment because they are the two ways to fill the cart; that equality is the positioning.

- The cart tab is gone; the bar survived. The Counter has no other permanent entry point.
  `FillRow` asserts the equality on the home surface, imported twice rather than copied.
- Home is the dashboard unconditionally (`initialMoment` returns `'home'`). It answers *what
  happens next* in five states; the answer is the first child and largest type. Empty, it asks
  what the trip is for.
- Scan = the packaged half: barcode or label photo.
- Counter = the unlabeled half; asking leads. Browsing by section (Produce · Meat · Seafood ·
  Dairy & Eggs · Pantry & Bulk · Label terms), each with one-tap shortcut questions.
- Every counter answer is decision-first: call, why, checklist, then the full sourced read on
  tap. Picks add to the cart in one tap.
- Haul reads the trip back and carries items forward; reached from the bottom of the dashboard.
- Shop mode is a MODE, not a tab: entered from the hero (START / RESUME), exited deliberately,
  `zIndex: 45` above the tab bar and below every sheet; tab bar and composer suppressed.

---

## Load-bearing decisions

*Account for every rule, same order: `docs/DECISIONS.md`.*

**Scoring and the KB**
- `matched` is concerns-only; affirmations ride in `affirmed` / `affirmationLayer`.
- Whole-food fats are clean because the KB holds no entry for them; no future entry may match
  butter/ghee/tallow. A regression test is the tripwire.
- Affirming entries are excluded from reverse matching.
- Margarine is NOT aliased to `partially_hydrogenated_oil`; it has its own `seed_oil` entry.
- `time_tested` justifies food-worth only, never a health outcome; `sanitizeAffirmed` withholds
  `history`, `why`, `kristy_note`.
- `gluten-free` / `dairy-free` stay advisory.
- Two harmless alias collisions exist; exact/longest-first priority resolves them.

**Reading a label**
- `tokenizeIngredients` restores the head noun onto sub-items, scoped to an oil/fat head.
- A partial read may not produce a clean approval; flags stand, only `approved` is withheld.
- Low confidence is a miss.

**Lookups**
- One decode per camera opening; monotonic ticket, stale response dropped. Barcode
  checksum-validated before lookup. `sameGtin` tolerates zero-padding.
- `scanned_products` holds products, not people: no `user_id` column, ever (a test greps).
  Precedence `off/full > vision/full > vision/partial`. The store holds ingredients, never
  judgments; a cached hit re-runs the engine.
- The self-heal loop is proven by behaviour; the Supabase client is injectable on
  `lookupProduct` / `retainProduct` / `coverageStats` for that reason.
- `coverageStats.fromVision` is the moat, counted. Only `scripts/growthLoops.livetest.js`
  confirms production capture.

**Swaps**
- The ingredient-level swap (`genericSwap`) is cut from the scan card; the field is still sent
  and decoded. Its home is the unbuilt ingredient page.
- The replacement is same category, better version. A bad bar swaps for a good bar.
- ⏳ The catalog is the prerequisite; do not build the swap engine before the rows exist.
  `docs/CATEGORY-CAPTURE.md`.

**The counter**
- The free layer is public (`optionalAuth`): deterministic KB read, no model, no stored data. A
  guest's counter answer does not spend their free chat run.
- `cart_pick`, `decision`, `why` are NOT among the seven fields `sanitizeForModel` passes. The
  whitelist stays at seven.
- No KB match gets the honest miss, never the coach. `looksLikeCounterQuestion` needs a counter
  subject AND buying intent, cooking verbs vetoed, consulted only after the matcher returns empty.
- A bare either/or is a question (`isBareEitherOr`) in `looksLikeCounterQuestion` AND `inScope`.
- Scope has been wrong in one direction every time: too tight. When in doubt, admit and let the
  downstream filters refuse.
- `isMeaningQuestion` admits mean/means as a VERB plus a non-filler subject; noun form excluded.
- `isBareDefinitional` is a counter question, bounded to ≤5 words and ≤2 content words.
- The retrieval floor is one alias hit: `scoreEntries` reports `aliasScore`, the gate requires
  `aliasScore > 0`. `counterFloor.test.js` pins curated and generated.
- `CONFIDENT` is `> 2`; `WEAK_MATCH_CEILING` stays 3. Different numbers, never one constant.
- Record measured numbers, not characterizations.
- Alias authoring differs by surface: questions for ask, bare nouns for list. Every card needs both.
- Every card carries its own questions in `asked_as` (3+, authored from the question, never
  from the card's vocabulary); `counterReach.test.js` asks them. A new card is not done until it
  can be found.
- When a hub steals a question, be specific, not numerous: one longer alias out-ranks a hub; a
  short generic alias is actively dangerous.
- Kitchen technique is a card class, `kind='home'`: mechanical only, never a bodily outcome.
  `home` suppresses add-to-cart, so a PURCHASE decision must be `shelf`.
- Adding to `IMPERATIVE_VERBS` is deliberate; record the reasoning in the list.
- Where the popular claim outruns the evidence, state the narrower true thing; the gap goes in
  `watch_out`. Verify the study, not the retelling.
- A hub card's do line must work for whatever brought the shopper there; count what falls
  outside a qualifier before shipping it.
- A generated card that owns a subject belongs in version control; one restating a curated
  verdict gets folded.
- Decision-first is content: `decision` / `why` re-ranked from the entry's own material. Depth is
  demoted, never deleted; the tier stays above the tap as `tier_note`, free.
- Section `shortcuts` carry no content: a `q` and an `id` already browsable there. `thinNote`
  where a section does not cover something.
- Misses are logged to `counter_gaps` (`gapFeed`). `/perimeter/ask` logs unconditionally; chat
  and guest chat log only behind `looksLikeCounterQuestion`.
- The free counter layer stores no PERSONAL data: question text scrubbed of emails and long digit
  runs, capped at 160 chars before insert.

**The dashboard and shop mode**
- The hero answers "what next", measured not asserted: five states (`empty` / `completed` /
  `ready` / `midtrip` / `finished`) from `cart.progress` and `cart.seedable`. `dash.mjs` fails
  if anything renders above it, larger than it, or repeats its copy. Every box ticked is FINISH.
- Exactly one bone-filled action per screen, the hero's; resolve a collision by stepping the
  FIELD down.
- The type inverts in shop mode: do line 17.5px, item name 11.5px eyebrow (cart: 15/13.5 the
  other way). An unmatched row keeps its name in the lead slot. One prose line per row.
- A spent instruction is demoted by size, never opacity; `shop.mjs` computes contrast from
  rendered colour, folding in ancestor opacity.
- Advancing is free scroll; the active section is the one filling the most screen.
- Every branch out of shop mode is an overlay, never a navigation; a test forbids `setMoment`
  inside `ShopMode.jsx`. The chat ask is withheld in shop mode.
- A scan in shop mode acts on the list in front of the shopper; `rowMatch.js` is conservative.
  ⚠️ The one-word over-match is fixed in Swift only (head noun, not a length floor); do not edit
  `rowMatch.js`, the divergence is the recorded decision.
- The screen wake lock is shop mode only, and the re-acquire on visibility is the feature.
  Every rejection is silent.

**Trips — the list is a record, not a scratchpad**
- `trips` (`supabase/trips.sql`): many per shopper, exactly one active, held by a partial unique
  index. `signals` and `next_list` do not move; `shopping_lists` survives as the profile.
- Three statuses; an untouched trip is REUSED, not archived. Completing is an explicit tap.
- Adoption is gated on "no trips at all", not "no active trip".
- One seeding door: `POST /api/trips/next`, no `accept` parameter.
- The conversion door is `POST /api/trips/import`; adoption happens inside `importGuestTrips`
  so a caller cannot sequence the halves wrongly. One-shot; an account with trips is declined
  (409). Completed trips only; `status` server-written; every row through `sanitizeList`;
  timestamps clamped to `[now − 1y, now]` with `started ≤ completed`; `clientId` echoed, never
  stored. `trip_id` on `haul_scans` is not part of this.
- A seeded row is re-matched, not copied with its card: `carded` / `cardSlug` / `tier` and the
  offer set are stripped; `why`, `perimeterId`, `alt` kept. `missed` is gone as a concept.
- The haul reads completed trips and does not write bought rows; `bought` rides as its own field.

**The composed row**
- A mock is not a render. A for-approval mock renders the real component or is labelled intent,
  and may never become the basis of a fixture.
- A browser fixture is built by `client/test/buildFixture.mjs`, never written; expectations are
  derived from it.
- One prose line per row; with a card it is the card's. Suppression keys on the block's
  `hasCard`, not `item.cardSlug`. An unmatched row keeps its `why`.
- An authored `perimeterId` outranks retrieval, still validated.
- `server/scripts/listMatchProbe.js` exits non-zero on a wrong match; a miss only reports.
- `stateContradicts` vetoes when the item names a state (frozen/canned/dried/fresh) and the card
  names only others; both sides must name one. A veto, never a score. Explicit list.
- A bare process word is not a subject (`unpasteurized` alone matched miso).
- `label_terms` is a reference section; it falls through like a home card.
- A row sorts by the section it displays. `CATEGORY_SECTION` is tiny and always outputs a counter
  section id; `TRAILING_LABEL` refuses to emit any `LIST_SECTIONS` title.
- The cart category is a fallback, never an override; a stored `cardSection` wins.
- When a pick's card and its `why` disagree, the `why` moves.
- Composed pick names stay composed (`listBaseline` keys `kept` on the NAME).

**The list is the shopper's**
- ⚠️ Kristy carries anything and judges only food. A non-food row goes on the list: trailing
  group, no card, no do line. She never scores, flags, approves or swaps it; scanned, the answer
  is "that isn't something Kristy reads." The silence is the feature: no household KB, no
  tidiness note, no "no guidance" eyebrow.
- Compose may never refuse to add what a shopper asked for, and never explains a decline. One
  prompt, three call sites; `listCompose.test.js` asserts the old wording ABSENT.
- Scope boundary: food and food-adjacent only (future at most: cookware, storage, filters, foil,
  parchment). Not cleaners, cosmetics, general grocery.
- The item always stays. `applyCompose` protects `user` and `imported` rows from a model-proposed
  removal unless the shopper's words name the item.
- Flag once: `attachOffers` stamps `offered` on every inspected row; survives `sanitizeList`.
- A no is permanent and suppresses the item, not just the note.
- The offer table matches generic food words only; a typed brand stays unremarked.
- Goals weight the margins: ≤3 additions, anchors capped at 4. Rebuild is a choice.
- ⚠️ The standing argument against personalization-by-generation: quote
  `docs/LIST-CREATION-AUDIT.md` §C, do not re-derive it. The corpus is trustworthy because it is
  pre-decided; what is missing is SELECTION of cards, never authorship.
- The baseline holds grocery names only; `kept` is not deduped (occurrences are the frequency).
- The pattern memory is private and leaves with the shopper: explicit `USER_TABLES` sweep;
  `privacyLine.test.js` fails if any table referencing `auth.users` is absent from it.
- Individual behaviour never joins the aggregate pool: `productStore` and `counterGaps` may not
  import the per-user readers (a test forbids the import).

**Seeing the loops run**
- `/api/internal/growth` 404s unless `INTERNAL_DASHBOARD_TOKEN` is 24+ chars; unauthorized gets
  404, never 401. Reads only `coverageStats` / `gapFeed` / `topScannedProducts`; not a Kristy
  surface, none of her brand.
- A `head:true` count cannot tell a missing table from an empty one; null count is unavailable,
  reachability uses a real `select`.

**The ambient line — fixed per surface, never rotated**
- A fixed line becomes what the surface says; no shared pool; each surface earns its own.
- The test is "is there an action here", not "is the surface quiet". The empty dashboard never
  carries one. Never in shop mode, the scan sheet, or any in-store surface.
- The only qualifying iOS surface is the empty Haul: *"Finish a trip and it lands here. Next
  week starts from what you actually bought."* The three existing lines are web-only.

**Demo and failure**
- Demo never fabricates and never under-reports; fallback only for no backend at all.
- A missing env var names itself; three layers catch a bad deploy (null client, error boundary,
  inline boot guard in `app.html`). `VITE_API_URL` is required in a production build.

**Phone sign-in — ⛔ DEAD PRODUCT-WIDE, ruled 2026-08-19**
- Provider is OFF (`phone: false`), nobody has ever signed in on any rail, `client/src` is frozen.
  `Auth.jsx`'s `signInWithOtp({ phone })` stays frozen, not endorsed; do not open the frozen
  client to finish this. Bird is deleted; do not bring it back.
- `/privacy` and `/terms` no longer describe an SMS practice; do not re-add the sentences to pass
  a review. The 10DLC registration is moot. Recovery, if ever, is from git history per file.
- The second rail is EMAIL and it is ON (`email: true`, `apple: true`, `mailer_autoconfirm: true`,
  measured 2026-08-18): blocker H in `kristy-ios/docs/PURCHASING.md` §7.0. Apple is primary.
  `mailer_autoconfirm` means OTP is fine and a `signUp` path is not; nothing ships one.

**Legal pages** — *account: `docs/LEGAL-PAGE-RULINGS.md`*
- `/privacy` and `/terms` are static pages in `client/public/`, rewritten to clean URLs in
  `vercel.json` and the vite middleware.
- ⛔ A served page is not a source file: no reasoning, measurement, provider state or "why we
  removed X" goes back into `/privacy`, `/terms` or `client/public/landing.html`. Each keeps a
  one-line pointer to the doc. `landing.html`'s positioning comments stay; no repo path,
  component filename or token identifier goes back into it.
- ⛔ `/privacy` claims no delete door on the website; the iPhone app is the only route
  (`DELETE /api/account`). Wrong again the day the web client gets a working sign-in.
- All three published and fetch-verified byte-identical 2026-09-16. A comment-strip diff must
  cover HTML and CSS comments.

**Money** — *the locked model, none of it built: `docs/PRICING-MODEL.md`. Every rule below is
live until the model's work lands.*

*The trial and the count (`docs/PRICING-MODEL.md` §0–§3a is binding; read it before touching the
trial, trip count, ask or entitlement):*
- After the trial the COUNTER STAYS FREE (full cards, ask, scanning); making a list and walking
  a trip are members only. The paid boundary inverts, retiring `DEPTH_FIELDS`, `summarize()`,
  the read meter, the teaser. The haul is free; seeding stays locked.
- ⚠️ No partial list, ever. The counter carries no ask, anywhere.
- ⚠️ `evaluatePremium` takes zero change. Reconciliation at the ask is `POST /trips/import`, rule
  **max and cap at 2 — `max(server, min(2, max(device, server)))`, never subtract, never re-arm.**
- ⚠️ Nobody can buy anything today: `canPurchase` is `identity == .member`, every visitor is a
  guest, Sign in with Apple has never completed a token exchange. The RevenueCat adapter is built
  (2026-08-15); do not rebuild it.

*The paid boundary as it ships today*
- It is a server boundary. Free: card summary (eyebrow, headline, do line, cart pick, tier
  sentence), all scanning, unlimited asking, all browsing, the entire list. Paid: the depth
  (`why`, `look_for`, `watch_out`, `detail`, `kristy_take`, `labels_decoded`, `sources`),
  stripped by `summarize()` / `forViewer()` before it leaves the server.
- The list is free; no save-list ask on any tier. `cartFree.test.js` greps what a shopper reads.
- The free surface states the call; the cost lives in the depth. Do not promote `watch_out`; make
  the card an essential instead.
- The tier is a sentence (`tier_note`), not a chip. `paidBoundary.test.js` pins both halves and
  that `tier_note` is ≥5 words and not the tier's name.
- The eight essentials are always full and never touch the meter. `ESSENTIALS` is authored two
  per section and never reorders: mark, keep authored order.
- The teaser ships geometry, never words.
- `free_reads_used` is its own counter; signed-out shoppers are metered in localStorage.
- Guests get no plan buttons (`purchasable={false}`); restore them the day sign-in works.
- The ask appears at one moment: the fourth full-read tap. An upgrade affordance's render
  condition must contain an ACTION. `UPGRADE_COPY` has one key. Chrome is excluded.
- One ask component, one read meter: `cartFree.test.js` fails if any file outside `CounterAsk`
  calls `askCounter`, or outside `cardMeter` calls `fetchCounterFull` / `spendRead` / `readsSpent`.

*Prices, the trial door and the budgets*
- $5.99/month, $44.99/year. Price ids are configuration, never seen by the client. Two numbers
  authored (`MONTHLY_CENTS`, `ANNUAL_CENTS` in `client/src/lib/pricing.js`, mirrored in
  `mobile/src/lib/pricing.ts`); effective monthly and saving are derived, saving FLOORED.
  `server/lib/pricing.test.js` fails on any hardcoded figure elsewhere.
- ⚠️ Recreate the Stripe Price objects and update `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`
  whenever the displayed price changes; a stale id charges the old amount undetectably.
- The trial has one door (`POST /api/subscription/trial`), idempotent BY EXISTENCE: any
  `subscriptions` row is returned untouched. Setting a goal grants nothing.
- Never put a data write in a schema file; the backfill is `supabase/backfill_trials.sql`.
  `schemaSafety.test.js` enforces it.
- Building a cart from a sentence is free behind a budget: `LIST_COMPOSE_FREE_LIMIT` 12/day,
  premium exempt, both doors move together. The over-budget line is not an upsell.
- Which bucket a guest door draws is derived from "does this reach a model", never per route;
  `guestBudget.test.js` asserts per HANDLER.
- The scan bucket is sized in SCANS (30/hour, 2 hits each), multiplication exported and asserted.

---

## Verifying

*Account: `docs/VERIFYING.md`.*

### The findings family — six members, one shape

A check reports success because it cannot see the thing it is checking.

1. An assertion over an empty collection passes. `nonEmpty(coll, name, min?)` in
   `lib/testGuards.js`, bound at the collection (module-level), not at the loop.
2. A boundary with no test is a comment. When a rule is the economics or the promises, ask what
   would have gone red.
3. Each site reasons correctly in isolation; the defect appears only when you add them up. Walk
   the path end to end as a real visitor; the tell is a `false` that is constant. Two open: the
   trip lifecycle and the shopping profile (`buildBaseline`'s input has always been empty).
4. A harness that supplies the props verifies a wiring production never runs; only the real call
   site proves the wiring. Make the absence loud (`Hero` requires a label AND a handler).
5. A commit that omits the file is green for the same reason. `git add -A`; run
   `node server/scripts/commitGuard.js`. `GUARDED` says where an untracked file is a problem and
   must never also decide what gets READ.
6. A deliverable blind to its subject looks finished. A shot whose argument is content must
   assert the content and skip loudly (`requireCards`). Ask what the artifact would look like if
   the thing it argues were absent. Shoot once, on a clean bucket.

### Rules with teeth

- A pipeline's exit code belongs to its last command: `set -o pipefail`. A green status is not
  evidence the work happened; assert on the artifact (the built `.app` is newer than the run).
- Every source gets fetched before it ships; a citation from memory is a defect.
- A prompt's worked example becomes its output. Never write the forbidden phrase down; describe
  the defect. A worked example never quotes the live corpus.
- A comment asserting an invariant is not an invariant; if it is load-bearing, test it.
- Verify mobile over CDP (`Emulation.setDeviceMetricsOverride`), not `--window-size`; geometry
  off `getBoundingClientRect`, never eyeballed.
- `vite build` compiles a dead reference happily; run the browser suites after any split.

### The commands

| Command | What it proves |
| --- | --- |
| `cd server && npm test` | **730 pass, 0 fail, on `main`, measured 2026-09-16** (`3e3cdc6`); 730 again 2026-09-21 on `main`. Record only a number you ran, say which branch, date it. |
| `cd client && npx vite build` | Compiles. Not that anything renders. |
| `node server/scripts/commitGuard.js` | No file this commit claims is untracked. |
| `node server/scripts/claudeMdSplitCheck.js <ref>` | A `CLAUDE.md` split removed nothing: every **bold** directive at `<ref>` still appears verbatim in `CLAUDE.md` ∪ `docs/`. Proves nothing left the CORPUS, not that a rule stayed in this FILE. Refuses to report success on an empty extraction. |
| `node server/scripts/listMatchProbe.js` | The corpus still answers the list correctly. Exits non-zero on a wrong match. Run after any alias, `perimeterId` or matcher change. |
| `node client/test/dash.mjs` | Five dashboard states at 390px in the real app frame; hero rule and one-filled-action rule. |
| `node client/test/shop.mjs` | Shop-mode geometry, type inversion, contrast off rendered colour, collapse mid-scroll, wake lock, return-to-position. |
| `node client/test/cart.mjs` | Real CartMoment at 390px with real pointer clicks: 44px targets, no horizontal overflow, the collapse. |
| `node client/test/composed.mjs` | What the list costs: lines per row, page height, the two honesty rules. |
| `node client/test/loop.mjs` | The whole trip loop; fails if a seeded row arrives checked or loses its card. |
| `node client/test/gate.mjs` | Drives the real surface; the only thing that caught a dead reference through a clean build. |
| `cd client && node test/skim.mjs` / `test/shots.mjs` | Rendered line boxes for all cards at 390px. Both need the API server on :3001. |

### Corpus and schema

- `routes/counter.js` serves from the `counter_cards` table, so a curated card reaches iOS only
  when the migration runs (see Pushing). Idempotent upsert on slug; `--dry-run` needs no
  credentials and reports no insert count, so diff KB against table before running it.
- `server/lib/counterCardLint.js` is the executable shape bar; Pass 3 must call `lintCard` before
  persisting a generated card.
- A tier note may not point at the tier (`TIER_NOTE_SELF_REFERENCE`); no two cards share a tier
  sentence (`paidBoundary.test.js`). A tier note comments on the `doLines.json` line, not the KB
  `decision` (`TIER_NOTE_ORPHANED`); a note matching neither is a known gap.
- A fold is a removal AND a delete: declare retirement in `RETIRED` (curated) or
  `RETIRED_GENERATED` (generated; a slug in the wrong list deletes nothing, a test checks). Move
  the folded card's aliases onto its absorber and repoint any shortcut. Grep wider than the
  shortcuts. A fold's real anchor may be a prompt, not a row.
- Promote a generated card on demand or on corpus-correction, never on correctness; when
  `use_count` climbs, promote. Keep at least one real generated row.
- What the code writes must exist in the migrations: `schemaContract.test.js`.
- The section depth floor is 8; a section that shrank by deletion does not get the same pass.
- The deploy boundary is `server/` (Railway Root Directory); `deployBoundary.test.js` fences
  `lib/`, `routes/`, `index.js`. Do lines: edit the table in `docs/do-lines-review.md`, re-run
  `scripts/buildDoLines.js`, commit both. Name the table, always.
- A git "permission denied" is OneDrive locking `.git`; retry. Never hand-edit the KB to recover.

---

## Open items

*Full text, closed items and evidence: `docs/OPEN-ITEMS.md`.*

### Open
- ❓ ⏳ The engine still reads a seven-token mineral analysis as a clean list and scores it zero;
  the misread is contained at the seal, not fixed at the read. Nothing proposed.
- ⚠️ `unverifiedAsFood` is not on the wire, deliberately; clients key off `unverifiedRead` /
  `stamp`. Do not add it to a decoder expecting it to arrive. Routes carry `readSwap`, one
  helper across all four send sites.
- ⏳ The guest budget is a property of uptime: `guestRate.js` buckets are in-process `Map`s, every
  deploy resets them, and `rateLimited` cannot be measured without spending a slot. Real the
  moment a second instance exists.
- ⏳ `completedTrips` on `GET /api/trips/seedable` (`count(*) where status='completed'`), spec
  `docs/PRICING-MODEL.md` §3a. The post-sign-in reinstall reset is NOT the accepted loophole (that
  is pre-account only). Client half built (`TripAllowance.reconciled`). Downstream of one SIWA
  token exchange.
- 🐞 ⏳ `/guest/list/attach` draws `cartBuildLimited` (20/hour, sized for one cart build) while
  the client attaches on every cold launch and added item; a refused attach produces more
  attaches. Do not size it for CI. `docs/ATTACH-BUCKET.md`.
- ⏳ Derive a baseline from the device trip archive, in the client, no server change. Price the
  `canonicalItem` duplication first; consider exact-name matching and state the narrower claim.
  Not a capture project. Nothing consumes it yet.
- ⏳ The scan card is still the full-height takeover; the bottom sheet is specced, unbuilt. Photo
  read: client-side crop held in memory for the session, nothing persisted.
- 📋 The path to production, in order: `docs/ROADMAP.md` (§14 of PASS3-HANDOFF is superseded).

### Rules left by closed items
- Re-check `hello@kristyapproved.com` receives before any App Store submission; an MX record does
  not prove it (2026-08-20).
- `nothingConfirmsFood` (`22b35a8`): withholding refuses to endorse; it never silences a warning.
- Category cache-hit (`95dbe78`..`3e3cdc6`): stamp on an OK OFF answer (including `other` and
  not-found), never on a network failure; re-reads route through `retainProduct`.
- `FOOD_CATEGORIES = new Set(['water'])`: the pattern is the plural `waters`, not the bare word
  (`watermelons`); `productCategory.test.js`. Reach is held until the migration lands.
- The do line is claim-locked to the entry's own fields (`f81a872`).
- Scan path (`aa97026`, `f82cf9e`): ⛔ do not widen the product-category vocabulary to fix a
  filing problem (the aisle is decided in `scanExtract.js`); guard `ingredients_text_en`;
  `languageConflict` stays separate from `sameVerdict`; `TRANSLATION_EXPANSION_CEILING` is 2.0
  with its sample recorded beside it.
- Holding a stack: identify held work by SUBJECT (`git log --oneline --reverse
  origin/main..HEAD`), never by hash or "ahead N". Urgent work cherry-picks past; the rebase
  afterwards is not optional. A cleared blocker is not an approval.

### Infrastructure state
- ⚠️ `server/.env`: real Supabase credentials; placeholder `ANTHROPIC_API_KEY` (401); `USDA_API_KEY`
  and Stripe keys empty. Model-dependent behaviour cannot be verified locally.
- ✅ `product_category_version.sql` applied (measured 2026-09-21, real select).
- ⛔ `push_tokens.sql` NOT applied — table missing from schema cache (measured 2026-09-21).
  Apply before push-token code deploys. Everything else: `docs/SCHEMA-AUDIT.md`.
- ⚠️ The corpus count lives here and nowhere else; re-count it, never carry it forward.
  - LIVE `counter_cards`: **97 rows — 94 `curated` + 3 `generated`**, migration's post-upsert
    count 2026-09-22 (0 inserted, 94 updated; `bb6987a` watch_out on 3 cards).
  - `kristy_perimeter_kb.json`: **116 entries — 94 cards + 22 picks** at `bb6987a`, 2026-09-22.
    Picks never migrate; `listMatch.js` reads the KB file, push publishes.
  - KB and table agree at 94 curated. A migration publishes everything the KB is ahead by.
- ⚠️ Accounts gate revenue; the rail is Sign in with Apple. `GET /auth/v1/settings` cannot prove
  the client id; only a completed token exchange can, and none has. No accounts exist on any rail.
- 🐞 The simulator cannot prove the token exchange: the simulator device has no Apple account
  (`defaults read MobileMeAccounts` is the wrong check; read the account store). Runbook:
  `kristy-ios/docs/ios-specs/siwa-config-runbook.md`.

## Companion docs

| File | What it is |
| --- | --- |
| `docs/WORKING-DISCIPLINE.md` · `DECISIONS.md` · `VERIFYING.md` · `OPEN-ITEMS.md` | Accounts behind the sections above, same order. |
| `docs/PRICING-MODEL.md` | Locked pricing model (none built); §0–§3a the trial and the count. |
| `VOICE_SPEC.md` · `VISION.md` · `README.md` | Voice in full · character direction (unbuilt) · how it runs. |
| `docs/ROADMAP.md` | Path to production; the queue. |
| `docs/PASS3-HANDOFF.md` | §13 findings; §14 superseded. |
| `docs/SCHEMA-AUDIT.md` | Live schema vs migration files. |
| `docs/LANDING-PAGE-PROVENANCE.md` · `LEGAL-PAGE-RULINGS.md` | Behind `landing.html`, `/privacy`, `/terms`. |
| `docs/CATEGORY-CAPTURE.md` · `ATTACH-BUCKET.md` · `LIST-CREATION-AUDIT.md` (§C) | Held proposals; anti-personalization measurement. |
| `docs/do-lines-review.md` | Authored do-line table; `server/lib/doLines.json` is generated from it. |
| `docs/APP-STORE-LISTING.md` · `mobile/docs/LAUNCH_CHECKLIST.md` · `BARCODE_COVERAGE.md` | App Store fields; submission work; barcode providers (none integrated). |

## This file's budget

Keep it under **40,000 characters**: `wc -m CLAUDE.md` (`-m` counts characters; `-c` counts bytes
and over-reports). When a section grows, the rule stays here and the account moves to `docs/`.
Verify a split with `node server/scripts/claudeMdSplitCheck.js <ref-before-the-split>`.
