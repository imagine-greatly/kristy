# CLAUDE.md — Kristy

Branch: `main`. This file is the **current state** of the product and the rules that
bind every change to it. It must survive a `/clear`. It is not a task log: when a
decision stops being load-bearing, delete it from here.

---

## What Kristy is

A **grocery coach for the whole store**, not a scanner with a list.

The store has two halves and Kristy covers both. The **labeled** half you scan
(boxes, bags, cans). The **unlabeled** half no scanner can read: meat, fish, eggs,
produce, dairy, bulk. The unlabeled half is the moat — a barcode reader is a weekend
build; a deep, sourced, honestly-tiered knowledge base for the counter is not.

The **cart is the center**. Scanning vets packaged things *for* the cart, the counter
answers the unpackaged things going *in* the cart, and the haul reads how it came out.
Everything orbits the cart; nothing outranks it.

**Kristy is not a calorie tracker.** Macro tracking was removed as a feature (not
hidden, not opt-in). No macro cards, no meal logging, no "logged it" UI, and no
qualitative macro asides in chat. This is enforced structurally by `macroGuard`, not
only by prompt.

---

## Non-negotiables

1. **Reuse the locked brand. Never invent.** Near-black forest green, gold accents,
   Playfair Display + Inter, thin gold thread/dot motif. Import from `lib/tokens.js`.
   Kristy's spoken text = `kristyVoice` (Playfair italic); all factual/UI/ingredient
   text = Inter. Never substitute a color or a face.

2. **The claim lock is law.** Every health/ingredient claim traces to a matched entry
   in a knowledge base. The model may rephrase tone but may NEVER introduce a concern,
   a statistic, or a claim it was not given. Enforced **structurally** — entries are
   stripped to an allowed-field whitelist before the model call — not just in the
   prompt. It holds on every surface that speaks in Kristy's voice: verdict note, haul
   read, cart reasoning, perimeter answer, chat.

3. **No-treatment rule, and it is symmetric.** Kristy is a coach, not a doctor. No food
   treats, manages, cures, prevents, or lowers the risk of anything — and none *causes*
   a disease either. The guardrail once forbade curing but not causing, which let "seed
   oils cause heart disease" through. Objections are rooted in processing, which is
   checkable. Focuses are preferences the user turns on about themselves, never
   inferences. Anything medical defers to a doctor.

4. **The stamp is earned.** The gold "Kristy Approved" seal renders only when
   `tier === 'approved'`. Every tier below gets a plain verdict bar.

5. **Never reshape the engine output.** The matched-entry shape from
   `server/lib/verdictEngine.js` is consumed directly by the note composer and the card.
   Extend additively; never restructure. The tests and the claim lock depend on it.

6. **Voice: zero first person.** See `VOICE_SPEC.md`. No "I/me/my", no em-dash asides,
   half the words. The tier ownership is *rephrased, not deleted*: "flagged on the
   whole-food standard, not settled science". A reader must always know whether a claim
   is settled science, a credible concern, or a standard.

7. **One verdict per headline, and accuracy outranks firmness.** The headline states the
   standard undiluted; the fallback moves to `look_for`/`watch_out`. A two-clause headline
   split by TYPE or USE CASE is discrimination and stays; one conditioned on the shopper's
   budget, the store's stock or their spare time is a retreat and does not. Firmer is
   never looser with facts — **if a claim needs a false mechanism to sound convincing, the
   claim is wrong.** Both enforced by `counterCardLint.js` over all 74 cards, curated and
   generated.

8. **No price, ever.** Kristy does not know what anything costs. Budget means
   cost-conscious food *selection*. Relative terms only, never a number.

9. **No negative claims about named brands.** Teach the label truth instead ("pasture-
   raised means space, not feed — the word to find is soy-free"). It is defensible,
   never goes stale, and makes the shopper competent at every product.

---

## Architecture

- **Server is authoritative** (`server/`, Railway). KB + matching + tier scoring + the
  claim-locked model calls. Clients are thin renderers.
- **Two knowledge bases, never merged.**
  `kristy_ingredient_knowledge_base.json` (74 entries) scores products — it is the only
  thing the verdict engine sees. `kristy_perimeter_kb.json` (74 entries) answers
  *questions* about the counter and is **never** fed to the engine.
- **Web SPA is the reference client**; `mobile/` (Expo/RN) is the App Store port.
- **`main` is production. Pushing publishes, in about a minute.** The web client is live
  at `kristyapproved.vercel.app` on a **GitHub-connected Vercel project**, so a push to
  `main` auto-deploys with no staging gate and no manual step. There is no `.vercel/`
  locally and the project is not visible to the MCP integration's account — neither
  absence means what it looks like, and this file previously drew exactly that wrong
  conclusion ("nothing is deployed, pushing publishes nothing"). Verified 2026-07-30 by
  pushing and watching `/privacy` go from 404 to 200. **Check what a change does to a
  live surface before pushing it**, especially anything a shopper or a reviewer reads.

---

## The interface

**Nav: Cart · Scan · Counter · Haul** — four equal tabs, no throne. Scan and Counter are
identical in size and treatment because they are the two ways to fill the cart, and that
equality *is* the positioning.

- **Cart** is home, unconditionally. Empty, it asks what the trip is for rather than
  dumping a template; the answer builds it. Chat-editable from the docked composer.
- **Scan** = the packaged half: barcode, or a label photo that reads anything.
- **Counter** = the unlabeled half, and **asking leads**. A question in plain words —
  from the ask card at the top of the surface or the docked composer anywhere — returns
  the same sourced answer browsing does. Browsing is still there, by section (Produce ·
  Meat · Seafood · Dairy & Eggs · Pantry & Bulk · Label terms), each carrying the
  handful of questions people actually ask at it as one-tap shortcuts.
- **Every counter answer is decision-first**: the call in one line, the why in one
  line, the checklist, then the full sourced read on tap. Its picks add to the cart in
  one tap.
- **Haul** reads the trip back and carries items forward.

---

## Load-bearing decisions (do not regress these)

**Scoring and the KB**
- `matched` is **concerns-only**. Every `severity_level` is a *concern* level, so a
  positive entry landing in `matched` would strip the seal from any product containing
  garlic. Affirmations ride in `affirmed` / `affirmationLayer` instead.
- **Whole-food fats are clean because the KB holds no entry for them.** A regression
  test is the tripwire: no future entry, positive OR negative, may match
  butter/ghee/tallow and cost a clean product its stamp.
- **Affirming entries are excluded from REVERSE matching.** Reverse resolves a token
  *up* to a longer alias, so bare "olive oil" would silently become "extra virgin olive
  oil" and earn a badge the label never gave.
- **Margarine is deliberately NOT aliased to `partially_hydrogenated_oil`.** US
  margarine was reformulated PHO-free, so a trans-fat claim would be false. It has its
  own `seed_oil` entry on its real modern composition.
- **Tradition (`time_tested`) justifies food-worth ONLY, never a health outcome.**
  `sanitizeAffirmed` withholds `history` as well as `why`/`kristy_note` — history is the
  richest source of a tempting "used as a remedy for…" claim.
- `gluten-free` / `dairy-free` stay **advisory**. The KB has no such data and claiming
  to check it would be fabrication.
- Two harmless alias collisions exist (`partially hydrogenated soybean oil`,
  `bleached flour`); exact/longest-first priority resolves them.

**Reading a label**
- `tokenizeIngredients` restores the head noun onto sub-items: `"Vegetable oil (canola,
  soybean)"` used to flag canola and **silently miss soybean**, the commonest way a US
  label prints a seed-oil blend. Scoped to an oil/fat head, because flagging tofu for
  seed oil would be a false claim — worse than a missed one.
- **A partial read may not produce a clean approval.** A half-read list can never falsely
  *flag* (everything matched was really printed) but it can falsely *approve*, because
  the unread tail is where the canola hides. Flags stand; only `approved` is withheld.
- Low confidence is a miss. Placeholder text ("n/a", "-") matches nothing in the KB and
  would score zero concerns — a silent stamp on a product never read.

**Lookups**
- One decode per camera opening; every scan takes a monotonic ticket and a stale
  response is dropped entirely. A barcode is checksum-validated before any lookup.
- `sameGtin` tolerates zero-padding on purpose (a 12-digit UPC-A is commonly stored as a
  13-digit EAN; a strict compare would turn correct US scans into misses).
- `scanned_products` holds **products, not people** — no `user_id` column, ever (a test
  greps for it). Precedence `off/full > vision/full > vision/partial` so a legible photo
  can't overwrite an OFF record, which also closes the tampering path. The store holds
  ingredients, **never judgments**: a cached hit re-runs the full engine.
- **The self-heal loop is proven by behaviour, not by reading the source.** The Supabase
  client is injectable on `lookupProduct` / `retainProduct` / `coverageStats` for exactly
  that reason, and `productStoreLoop.test.js` runs the real sequence: a vision read of a
  product OFF can't answer for, then a second scan of the same barcode resolving from our
  own store. The claim is a sequence, so only a sequence demonstrates it.
- **`coverageStats.fromVision` is the moat, counted.** `fromOff` is coverage we borrow;
  `fromVision` is coverage we own. That number climbing over time is the only evidence the
  loop is running in production rather than merely wired correctly.
- **Wiring is not running.** `scripts/growthLoops.livetest.js` is the only thing that can
  confirm production capture — it writes a probe row to the live DB, resolves it back,
  checks the row carries no identity, and cleans up. Unit tests cannot do this.

**The counter**
- The free layer is **public** (`optionalAuth`): a deterministic KB read with no model
  call and no stored data. Requiring an account bought nothing and cost a stranger the
  exact thing they came to try. Only the *personalized* read is premium. A guest's
  counter answer also does **not** spend their free chat run — the model was never called.
- `cart_pick` is a grocery **NAME** and is deliberately not one of the seven fields
  `sanitizeForModel` passes, so the model can never mint one. **`decision` and `why`
  are excluded for the same reason**: the call a shopper acts on can never be generated.
  The whitelist stayed at seven when they were added — they are compressions of fields
  the model already has, so widening it would buy nothing.
- **A counter question with no KB match gets the honest miss, never the coach.**
  `looksLikeCounterQuestion` (a counter SUBJECT *and* a buying intent, cooking verbs
  vetoed) is consulted only after the matcher returns empty. Both signals are required:
  either alone is somebody else's question, and answering "how much protein is in
  chicken" with "no solid read" is a worse regression than the improvisation it closes.
- **A bare either/or is a question**, and it took two fixes in two places. "wild or
  farmed", "brown or white eggs" carry no question word and no punctuation, and used to
  route past the KB entirely. `looksLikeCounterQuestion` was fixed first; **`inScope` was
  not**, so `/counter/ask` still answered "that one is outside the store" while the
  Counter's own placeholder read "Wild or farmed salmon?". `isBareEitherOr` closes it —
  both sides must survive `contentWords`, which is what keeps "when does the store close
  or open" out. Only the plain "or" was ever broken; `GROCERY_ACT` already listed "vs".
- **A definitional question is a counter question, and the length bound is what makes it
  safe.** "what is skyr" was answered "that one is outside the store". Probed over twelve
  `what is X` queries where X is a word the KB *itself teaches*, **seven were rejected** —
  skyr, clabber, natamycin, bulgur, astaxanthin, skipjack, BCM-7. A shopper reading an
  unfamiliar word off a package has no grocery verb in the sentence and often no word the
  vocabulary knows, so neither the subject check nor the act check can see it.
  `isBareDefinitional` admits it, bounded to **≤5 words and ≤2 content words** — a package
  word is short, a question with structure ("what is the capital of France") is not. The
  first version had no bound and the existing off-topic test caught it in one run; the fix
  was the bound, never a weaker guard. Both directions are pinned by tests.
- **Retrieval confidence and the gap log's weak ceiling are DIFFERENT NUMBERS.** They were
  one constant under "one number, one meaning", and they are two meanings: one is a
  retrieval judgment with a generation bill attached, the other an editorial judgment about
  the authoring backlog. Sharing it pinned the curated gate at `> 3`, which is
  **structurally unreachable for the commonest question shape** — a single-word alias
  scores 2, a title overlap on that same noun adds 1, and nothing else lands, so a query
  whose only content word is a bare noun tops out at exactly 3 forever. "best yogurt to
  buy" hit the correct card, with no runner-up, and paid for a 20-second generation every
  time. `CONFIDENT` is now its own constant at `> 2`; `WEAK_MATCH_CEILING` stays at 3.
  Measured 2026-08-02: 10 curated hits of 20 became 15, every rescued query scored 3 with
  no runner-up, and the 17-query miss rate went 35% → 6%.
- **The premise that held the gate up was never measured.** The comment justifying the
  higher curated bar claimed curated entries carry "a dozen aliases" against a generated
  card's six. Actual curated counts: **min 3, median 7, mean 7.11, max 19** — generated
  cards are authored with 6 to 8. There was no alias advantage and never had been. Record
  measured numbers, not characterizations; this is the second time a written-down
  conclusion stopped anyone checking.
- **Decision-first is content, not styling.** `decision`/`why` are authored per entry in
  the KB, re-ranked from its own short_answer/kristy_take/tips — never new research.
  The depth is demoted, never deleted. The **tier chip stays above the tap** even though
  the rest of the tier framing moved behind it: the decision is a claim, and settled
  science must never render identically to a whole-food standard.
- Section `shortcuts` carry no content — a `q` in the shopper's words and an `id` that
  must already be browsable in that section. A second, drifting index of the counter is
  the thing they must not become.
- A section that doesn't cover something says so (`thinNote`). Naming the gap is what
  makes the covered part trustworthy.
- **The misses are logged, and they are the authoring backlog.** Every counter question
  the KB answers badly (`miss` = nothing matched, `weak` = an entry exists and answers
  it poorly) lands in `counter_gaps`, frequency-ranked by `gapFeed`. You cannot
  retroactively collect week-one questions, so this captures from day one. `/perimeter/ask`
  logs unconditionally — the endpoint *is* the counter. **Chat and guest chat log only
  behind `looksLikeCounterQuestion`**, the strict test: the loose `looksLikePerimeterQuestion`
  exists to make a cheap KB check worthwhile, and logging on it would sweep ordinary
  conversation into a shared dataset.
- **The free counter layer stores no PERSONAL data — that is the precise claim.** It used
  to be "no stored data". `counter_gaps` carries a normalized topic, an outcome and a
  timestamp; no user key, no IP, no session. The question text is scrubbed of emails and
  long digit runs and capped at 160 chars *before* the insert, because free text typed by
  a stranger is the one place identity arrives by accident.

**The list is the shopper's**
- **The item always stays.** A row the shopper added is never removed, renamed or
  struck. Kristy attaches a note *beside* it. `applyCompose` protects `user` and
  `imported` rows from a model-proposed removal unless the shopper's own words name the
  item — so "take the soda off" works and "make this healthier" cannot empty the cart.
- **Flag once.** `attachOffers` stamps `offered` on every row it inspects, including the
  ones that earned no comment, and the flag survives `sanitizeList`. It is idempotent by
  construction. The same gentle note repeated on every load is nagging however kindly
  it is worded, and it is the thing that gets an app deleted.
- **A no is permanent**, and it suppresses the *item*, not just the note. A declined
  swap that reappears as a "nudge" is the same suggestion by a side door.
- **The offer table matches generic food words only.** `cola` matched Coca-Cola,
  `wonder bread` matched Wonder, `frosted \w+` matched Frosted Flakes — each would have
  had Kristy judging a named product from its name alone. A typed brand stays unremarked;
  a barcode is how she reads a box.
- **Goals weight the margins.** A profile change *leans* the stored cart (≤3 additions),
  it does not regenerate it; focus/constraint anchors are capped at 4. Rebuild is still
  a choice, never a side effect of tapping a goal.
- The baseline holds grocery **names** only — what they keep buying, what they removed,
  what they declined. `kept` is deliberately not deduped: occurrences are the frequency.
- **The pattern memory is private, and it leaves with the shopper.** `shopping_lists`
  holds the most personal thing Kristy stores and was **missing from the account-deletion
  sweep**, along with `haul_scans` and `push_tokens` — all three added to the schema after
  `USER_TABLES` was written. The cascade collected them, so nothing survived a deletion,
  but the explicit sweep exists so the guarantee does not *depend* on the cascade.
  `privacyLine.test.js` now parses the migrations and fails if any table referencing
  `auth.users` is absent from `USER_TABLES`, so it cannot drift again.
- **Individual behaviour never joins the aggregate pool, by construction.** The two
  shared-pool writers (`productStore`, `counterGaps`) may not import the per-user readers
  at all — a test forbids the import, because that import is what a join would have to
  look like and it is far easier to forbid than to detect afterwards.

**Seeing the loops run**
- **The internal growth view is OFF unless deliberately turned on.** `/api/internal/growth`
  (+ `.html`) 404s entirely unless `INTERNAL_DASHBOARD_TOKEN` is set to **24+ chars**; a
  shorter one degrades to unset rather than to a weak gate. Unauthorized gets **404, never
  401** — a 401 confirms the endpoint exists and invites another try.
- It reads **only** `coverageStats` / `gapFeed` / `topScannedProducts`. Aggregate is a
  property of what it reads, not a filter it applies: both tables hold no identity, so
  there is no individual data to redact. A test forbids it importing any per-user reader.
- It is **not a Kristy surface** and deliberately uses none of her brand — inventing a
  treatment for an ops page is the drift the brand lock exists to prevent.
- **A `head:true` count cannot tell a missing table from an empty one.** PostgREST answers
  204 / null count / no error for a table that does not exist, which reads as "available,
  zero products" — i.e. "waiting for shoppers" when the truth is "capturing nothing,
  forever". `coverageStats` treats a null count as unavailable, and reachability checks use
  a real `select`, never a head.

**Demo and failure**
- **Demo must never fabricate, and never under-report.** It once silently engaged on a
  misconfigured production build and served a fixture for every scan; separately, hand-
  maintained demo mirrors of the counter and of chat went stale and made the product look
  thinner than it is. Demo now reads the real public endpoints and keeps a fallback only
  for its actual purpose: no backend at all. Fake data is never the safer failure.
- A missing env var **names itself**; three layers catch a bad deploy (null client, React
  error boundary, an inline boot guard in `app.html` — the only one that can catch a
  module-evaluation crash). `VITE_API_URL` is required in a production build.

**Phone sign-in**
- **Supabase's built-in MessageBird provider is dead — never re-enable it.** It calls
  Bird's retired originator+body API and gets a 422, which reaches the shopper as "the
  code didn't send" for a number that was always correct. Delivery is ours, via the
  **Send SMS Hook** (`POST /api/auth/hooks/send-sms`). Supabase still mints and verifies
  the OTP; we only carry the digits.
- **Bird's current API is a TEMPLATE model, not a text model.** `bird.sms.send({ to,
  template: { name, parameters: { code } } })`. `from` and `category` are derived from the
  template and are *rejected* if passed. Carriers vet the template, which is the point.
- **`toE164` is not tidying — without it every send fails.** Supabase stores
  `auth.users.phone` with no leading `+`, and Bird 422s on bare digits.
- **The hook's signature is the only gate.** The URL is public and the body is a phone
  number plus a live code, so an unsigned call is a stranger, not a degraded call: 401,
  nothing else. Raw body before `express.json()`, exactly like the Stripe webhook.
- Bird's SDK timeout is cut to 3.5s with **no** SDK-level retry, because a Supabase auth
  hook has a 5s budget for the whole round trip. Supabase owns the retry.

**Legal pages and 10DLC**
- `/privacy` and `/terms` are **static pages in `client/public/`**, rewritten to clean
  URLs in both `vercel.json` and the vite middleware so dev, preview and production agree
  about a URL that is printed on an external carrier form. The `.html` paths still resolve,
  so older links do not break.
- **The carrier sentence sits on ONE unbroken source line with no tags inside it.** A2P
  10DLC review is often automated against raw HTML, and a line wrap a human would never
  notice fails the match — rejection code **805**. Do not re-wrap it to fit the column.
  Verified in source, in `dist/`, and over HTTP.
- The pages must also carry: OTP purpose, that entering a number *constitutes consent*,
  one message per sign-in request, STOP/HELP, "message and data rates may apply", and the
  processor list. These are checked, not decorative.
- **The SMS consent line lives in `SignInForm`, not on the surrounding screen.** Both
  sign-in surfaces render that form and only `GuestGate` used to carry any legal text —
  the full-page `Auth` had none. Carriers look for the opt-in wording beside the phone field.

**Money**
- Price *ids* are configuration, never hardcoded, and the client never sees them.
  Displayed prices have exactly one source per client (`lib/pricing`).
- The trial has **one explicit door** (`POST /api/subscription/trial`), idempotent.
  Setting a goal grants nothing — coupling them silently spent a 7-day trial on a casual
  goal-tap and killed the 3-free-notes taste mechanic.
- **`ensureTrial` is idempotent BY EXISTENCE**: any `subscriptions` row at all, in any
  status, is returned untouched. So a row the shopper did not ask for permanently spends
  the only trial they had. That makes a stray write expensive, not merely untidy.
- **Applying the schema must never change what a user has, and a test enforces it.** The
  trial backfill used to sit at the bottom of `schema.sql` and fired on **every re-run** —
  it granted the one live account a trial twice, through two different doors, each time as
  a side effect of applying the schema to pick up a missing table. `on conflict do nothing`
  reads as idempotent and is, per user at one moment; across time it is not, because anyone
  who signed up since the last apply has no row to conflict with. It now lives in
  **`supabase/backfill_trials.sql`**, run deliberately and never as part of a schema apply,
  and `schemaSafety.test.js` fails if any other `supabase/*.sql` file contains an
  `insert`/`update`/`delete`/`truncate` outside a function body. **Never put a data write
  in a schema file.**
- Free = scan + the universal layer + the counter's free layer, always. Paid =
  personalized note, focus/constraint-aware cart, haul read, conversational cart edits.

---

## Verifying

- **Verify mobile over CDP, not `--window-size`.** Chrome enforces a ~500px minimum
  window on Windows: `--window-size=390` renders at 504 and crops, which looks exactly
  like horizontal overflow. Use `Emulation.setDeviceMetricsOverride`.
- Measure, don't eyeball: geometry claims ("equal weight") should be read off
  `getBoundingClientRect`, not judged from a screenshot.
- `cd server && npm test` (423 tests). Client: `cd client && npx vite build`.
- **What the code writes must exist in the migrations, and a test checks it.**
  `schemaContract.test.js` compares every key `cardToRow` emits against the columns
  declared in `supabase/*.sql`, plus a sweep over inline insert/update literals. The
  live audit in `docs/SCHEMA-AUDIT.md` compares live against the file and is therefore
  blind to a column missing from BOTH — which is exactly how `counter_cards.aliases`
  shipped, silently stopping the generated corpus from growing.
- **The section depth floor is 8, and the count is a proxy worth watching.** `aisle.test.js`
  requires 8 topics per shopper-facing section as a stand-in for "answers as much as a scan
  does" — a claim about CONTENT. Removing a duplicate lowers the count without lowering the
  content, which is why the mercury fold could take seafood 9 → 8 legitimately; a section
  that shrank by DELETION must not get the same pass. Seafood is now the thinnest section
  and holds the next authoring slot.
- **The counter card's shape bar is executable, and it runs against generated cards too.**
  `server/lib/counterCardLint.js` holds the rules (the observable may not sit in both the
  headline and the `do` line; one verdict per headline; no false mechanism; the em-dash-
  then-justification share has a ceiling; within-section closing duplication fails; verb
  distribution and intra-card contradiction are reported and never fail). Pass 3 must call
  `lintCard` before persisting a generated card.
- **A fold is a removal AND a delete, in one operation.** The migration upserts on slug and
  never removes, so an entry deleted from the KB leaves its row alive in `counter_cards` —
  still retrievable, still matching on its own aliases, and no longer editable because the
  file it came from is gone. Retirement is declared in `RETIRED` (`counterCards.js`) and the
  migration deletes those rows in the same run. Move the folded card's aliases onto its
  absorber and repoint any section `shortcut`, or the fold is a coverage regression wearing
  a tidy diff. **Grep wider than the shortcuts** — the 2026-08-02 sweep left three live
  `perimeterId` references in `list.js` that only `list.test.js` caught.
- **TWO retirement lists, and a slug in the wrong one deletes NOTHING.** The migration
  removes `RETIRED` with `.eq('source','curated')` so a retired KB slug can never sweep a
  generated card that collides with it. That scoping is correct and it means `RETIRED` is
  *structurally incapable* of retiring a generated row: put a `gen_` slug there and the run
  reports "retired 11 slugs", deletes nothing, and the card stays live and answering. Four
  did, for one migration run, including one whose verdict contradicted a curated card
  outright. Generated retirement is `RETIRED_GENERATED` with its own `source = 'generated'`
  delete, and a test fails if either list holds the other's kind.
- **A fold's real anchor may be a PROMPT, not a row.** `gen_a1_vs_a2_yogurt` contradicted
  the curated A2 card because `counterGenerate.js` carried that exact headline as its
  worked FAIL/PASS example for "the do line must serve the headline". Deleting the row
  alone would have left the thing that regenerates it. When a generated card is wrong,
  check whether the generator was *taught* it.
- **The deploy boundary is `server/`, and a test is the fence.** Railway's Root Directory
  is `server/`, so anything the runtime reads from outside it exists on a laptop and is
  missing on the box, silently and forever. `deployBoundary.test.js` resolves the path
  literals in `lib/`, `routes/` and `index.js` and fails on any that escape; `scripts/` is
  exempt by name because those are dev tools run from a full checkout. This is how the
  reviewed `do` lines were absent from **every** curated card on `/api/counter/ask` in
  production — `docs/do-lines-review.md` never shipped. The lines now live in
  `server/lib/doLines.json`, generated by `scripts/buildDoLines.js`, with the markdown
  still the authored source and `doLines.test.js` failing if the two disagree. **Edit the
  table, re-run the build script, commit both.**
- **Rendered-line claims need a browser.** `cd client && node test/skim.mjs` renders all 80
  cards at a true 390px over CDP and measures line boxes; `node test/shots.mjs` captures
  the six representative cards. Both need the API server running on :3001.
- If a git write fails with "permission denied", it's OneDrive locking `.git` — retry.
  Never hand-edit the KB or committed files to recover.

---

## Open items

- ⚠️ **One migration outstanding.** Verified against the live Supabase in `server/.env`
  on 2026-07-30: `scanned_products`, `shopping_lists`, `haul_scans`, `verdicts`,
  `subscriptions`, `meal_logs`, `weight_logs`, `chat_messages`, `weekly_summaries` and
  every `user_goals` column (`coach_goals`, `constraints`, `macro_tracking`, `focuses`,
  `free_notes_used`, `non_negotiables`) are all **applied**. Re-verified column-by-column
  on 2026-07-31, when **`counter_cards`** (74 rows as of the 2026-08-02 sweep), **`counter_gaps`** and the
  `counter_gap_feed` view also landed — full audit in `docs/SCHEMA-AUDIT.md`. Still
  missing: **`push_tokens`** (`supabase/push_tokens.sql`), deferred with Expo push. Code
  degrades gracefully without it.
- ⚠️ **Phone OTP** is built end to end but not switched on. Remaining, all outside the
  code: register the Send SMS hook in the Supabase dashboard, put `BIRD_API_KEY` +
  `SEND_SMS_HOOK_SECRETS` in the server env, and clear **10DLC brand + campaign
  registration** at Bird — US carriers block unregistered A2P traffic, so nothing sends
  until that lands, and it is a multi-day queue, not a toggle.
- **Known-dead, left in place**: `/api/photo`, `/api/weight`, the weekly-summary
  pipeline, `mealResolver`, `store.js setMacroTracking`; client `lib/logging.js
  sendPhoto`, `api.js sendWeightLog`, several `data.js` readers, `lib/dayBoundary.js`.
  Unrouted since macro tracking was removed; DB tables untouched. Delete in a dedicated
  pass.
- `mobile/docs/LAUNCH_CHECKLIST.md` still lists the pre-launch prices ($8.99/$49.99);
  shipped pricing is $7.99/mo and $59.99/yr.

---

## Companion docs

| File | What it is |
| --- | --- |
| `VOICE_SPEC.md` | The voice rule, in full. Still enforced in all six model prompts. |
| `VISION.md` | Character direction. Deliberately post-mechanics, largely unbuilt. |
| `README.md` | How the thing runs: setup, endpoints, data flow. |
| `BARCODE_COVERAGE.md` | Provider options assessed, none integrated. A decision doc. |
| `mobile/docs/LAUNCH_CHECKLIST.md` | Unfinished App Store submission work. |

One-shot task specs are deleted once shipped; the reasoning worth keeping lives above.
