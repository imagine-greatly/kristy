# CLAUDE.md — Kristy

Branch: `main`. This file is the **current state** of the product and the rules that
bind every change to it. It must survive a `/clear`. It is not a task log: when a
decision stops being load-bearing, delete it from here.

---

## WORKING DISCIPLINE — read before touching anything

**Claude Code runs here over SSH, from Windows into a rented Scaleway Mac mini, and sessions
drop mid-task with no warning.** When one does, the conversation is gone and **every file
already written to disk survives**. Report → approve → commit is backwards for that reality: it
puts the one durable act last. Twice now hours of work sat untracked when a session died, and
once it survived only because it happened to be in a directory nobody had cleaned out.

### The rule: COMMIT BEFORE REPORTING

When a unit of work is done — in this order, and before the summary is written:

```
git add -A  →  commit with a real message  →  push  →  four-step verify  →  THEN report
```

**Approval is not a precondition for committing.** Approval applies to what is already on disk.
A bad approval costs a revert; a dropped session with uncommitted work costs the hours.

- **Stopping mid-unit to ask a question? Commit what exists first**, message prefixed `wip:`,
  then ask.
- ⚠️ **COMMIT FIRST, PLANT SECOND, REVERT THIRD. PROVING A CHECK CAN FAIL IS ROUTINE HERE
  AND IT IS INHERENTLY DESTRUCTIVE.** Nearly every guard in both repos was "verified to fail
  on the defect it names" before being trusted, and the only way to do that is to break the
  source on purpose and put it back. **`git checkout -- <file>` puts it back to the last
  COMMIT, not to what you had.** So planting a defect in a file carrying uncommitted work
  and reverting deletes that work, silently, with a command whose whole job is to be safe.
  **This happened 2026-08-08** and cost the approved-state collapse in `ScanSheet.swift` and
  the detent set in `ScanBranch.swift` — both rewritten from scratch. The order that was
  followed was verify-then-commit; the order is **commit, then plant, then revert.**
  It is the same lesson as the rule above with the threat inverted: there, the danger is a
  dropped session taking uncommitted work; here it is *you* taking it, with a routine
  command, in the middle of doing something careful. `git stash` is not the fix either — it
  takes the test you are trying to run along with the source you are trying to break, and a
  suite that then runs zero tests reports **success**, which is the empty-collection defect
  wearing a green tick.
- **Never end a turn with anything untracked. Ever.** `git add -A`, never `git commit -a` —
  `-a` does not add untracked files, and that is precisely how `3267c95` shipped a commit
  titled for the trips feature while `server/lib/trips.js` and `server/routes/trips.js` stayed
  untracked for a day (see **Verifying**, and run `node server/scripts/commitGuard.js`).
- **The four-step verify is not a formality.** A push has reported success in this project while
  the remote had not moved, and the keychain error that accompanied it appears on successful
  pushes too — so the error text cannot distinguish them and neither can the exit code. Only
  reading content back off the remote can: `git rev-parse HEAD` → `git reflog` →
  `git ls-remote origin main` → **read a file back from the remote and diff it against local.**

### ⚠️ THE PUSH STEP IS THE ONE STEP THIS REPO CANNOT TAKE ON REFLEX

**`main` here is production and pushing publishes, in about a minute** — Vercel for the client,
Railway for the server, no staging gate. And `main` currently carries **deliberately unpushed
commits** (`POST /api/trips/import`, see **Open items**). So in this repo `git push` is a
*publish*, and pushing "to be safe" ships a feature that is being held on purpose, along with
whatever else is ahead.

**Commit always — that is what a dropped session threatens. Push to `main` only when the turn's
work is meant to go live**, and never merely to satisfy the rule above. When work is committed
and deliberately unpushed, **say so in the report** rather than leaving "ahead N" for the next
session to discover and helpfully resolve.

⚠️ **BUT `git push` IS NOT THE ONLY PUBLISH CHANNEL, AND THE HOLD ONLY COVERS ONE OF THEM.**
`node server/scripts/migrateCounterCards.js` writes the corpus straight to the live
`counter_cards` table. It needs no push, no deploy and no approval from Railway — just the
credentials in `server/.env`. **So for anything whose only artifact is card content, "unpushed"
does not imply "not live".**

Observed 2026-08-10: `0a84782` (the `mercury_by_fish` sardines fix) sits on `origin/held` and
**not** on `origin/main` — undeployed by every measure git can report — while its text is
serving to anonymous callers in production, because the migration ran. That is the two-step act
working exactly as designed (**the KB is the source of record, the table is what ships**), and
it is *why* a KB edit is safe to commit onto a held stack. It is recorded here because the
inference it breaks is the natural one: reading `origin/main..HEAD` tells you what code is
held, and tells you **nothing** about what a shopper is reading.

**The practical rule:** a commit that touches only `kristy_perimeter_kb.json` publishes when
the migration runs, so **say in the report whether it has**, the same way an unpushed commit is
reported. The two states are independent and both need stating: *committed / pushed* is the
code, *migrated / not* is the corpus. The card commits already say `Not migrated.` in their
messages — that line is the other half of this and should not be dropped.

### ⚠️ THE HELD STACK LIVES ON `origin/held`. `main` BEING BEHIND IS NOT LOST WORK.

**If you find `main` behind what the docs describe, fetch `held` — do not reconstruct anything.**

```
git fetch origin held && git log --oneline --reverse origin/main..origin/held
```

`held` is a **backup branch, not a deploy target.** Railway builds from `main` and Vercel's
production deployment tracks `main`, so pushing here publishes nothing; a Vercel *preview* build
for the branch is expected and harmless — its origin is not in `CLIENT_ORIGIN`, so every API
call from it is CORS-blocked, which is the correct outcome for a URL nobody should be using.

**Why it exists:** committing protects work from a dropped session, which is the threat the rule
above is written for. It does nothing about **losing the machine** — and this runs on a rented
Mac mini reached over SSH. Nine commits, including a feature that cannot be pushed to `main`,
sat on one disk. That is the same risk one layer up, and the answer is a branch that backs them
up without deploying them.

**Keep it current: after any commit that stays off `main`, push it here too.**

```
git push origin main:held
```

⚠️ **`osxkeychain` CANNOT AUTHENTICATE OVER SSH ON THIS BOX AND FAILS IN A WAY THAT READS AS
SUCCESS.** It errors `-25308` (`errSecInteractionNotAllowed` — no UI session to unlock the
keychain) and the push dies with `could not read Username for 'https://github.com'`. Piping that
through `tail` shows exit 0, because the exit status belongs to `tail`. Use `gh`, which is
authenticated:

```
git -c credential.helper='!gh auth git-credential' push origin main:held
```

Note `-25308` *also* appears on pushes that fully succeed, so **the error text distinguishes
nothing** — only `ls-remote` plus reading a file back off the branch does. This is the four-step
above, and it is why the four-step is not a formality.

### Scope: one surface per prompt

Each prompt is scoped to one surface or one contained unit, with the expected output files
stated up front. **Your half: before starting, list the files you expect to create or modify.**
That list is the checklist a resumed session judges itself against. If the work turns out to
need files outside the list, **say so rather than silently widening.**

### RESUMING AFTER A DROPPED SESSION

```
Treat every existing file as COMPLETE unless visibly truncated.
Never recreate a type or a file that already exists. Never run an
audit pass over finished work. Do only what is missing, judged
against the expected-files list in the prompt that was
interrupted.
A rewrite of finished work still compiles. That is what makes it
dangerous: a fresh session cannot distinguish "I did not write
this" from "this is wrong."
```

**This block is in the file rather than in a prompt on purpose.** After a drop, nobody
remembers to paste it — a session that reads it automatically is the entire point.

### EVERY SESSION STARTS COLD

**SSH drops end the conversation and keep the disk. Assume you are resuming.** Before any
work, without being asked:

```
- git status --porcelain on BOTH repos; commit and push anything
  outstanding
- confirm kristy-ios HEAD against its remote by READING A FILE BACK,
  not by comparing hashes
- report kristy main vs origin/main and origin/held
- report the server suite count and the iOS UI suite count
- report anything left in flight: a background run, a half-finished
  fix, an unmigrated corpus change
```

**Then state what you understand the current task to be, and STOP if it is not obvious from
the repo.**

⚠️ **The last line is the load-bearing one.** The check is cheap and a session will run it
willingly; the failure mode is running it, finding a `wip:` commit and four unpushed ones, and
*inferring* a task from them. **A dropped session leaves work in a state, not an instruction** —
what was half-built says nothing about whether it should be finished, and this repo's history
is full of the resumed session confidently rewriting something that was already done.

⚠️ **"Push anything outstanding" MEANS `kristy-ios` AND `main:held` — NOT `kristy` `main`.**
Pushing this repo's `main` publishes to production in about a minute and the stack carries
deliberately held commits. The reflex this block installs is the exact reflex the next section
forbids. Commit everything, always; push `kristy-ios`, push `main:held`, and leave `main` alone
unless the turn's work is meant to go live.

📎 **A twin of this block lives in `kristy-ios/CLAUDE.md`** — a session starting in either repo
has to find it. **Two copies is the shape that produced the category-capture error** (one entry
stated in two documents, both wrong, for two days), so if you change one, change both, and
prefer deleting a copy over letting them disagree.

---

## THIS REPO HAS TWO HALVES AND THEY HAVE DIFFERENT RULES

Ruled 2026-08-08, when the native client became the thing being built and this repo stopped
being the thing being built. **The product is now one iOS client (`kristy-ios`) talking to the
server in this repo.** What lives here splits cleanly in two, and conflating them is how a
frozen file gets edited and a live route gets changed by accident.

### `client/src` — DEAD. FROZEN. INSPIRATION ONLY.

The React SPA is **finished and is never edited again, for any reason.** Not a typo, not a
token, not a dead import, not a "while I was in there". It is deployed and it still serves
`kristyapproved.com`, but no further work goes into it.

What it *is*, and why it is kept rather than deleted: the **behavioural specification** for the
iOS client, and the record of decisions that were arrived at by **measurement** rather than
design — the contrast floor, the hero rule, the active-section rule, the type inversion, the
one-filled-action count. Those are rules the Swift client must satisfy, and this is the evidence
they were ever true. Read it, cite it, copy the reasoning out of it. Do not write to it.

⚠️ **`client/src/lib/tokens.js` IS NO LONGER THE BRAND. IT IS A FROZEN HISTORICAL COPY.**
The brand moved to **`Brand/tokens.json` in `kristy-ios`** on 2026-08-08, and that file is now
the source of truth for every colour in the product. Nothing writes to `tokens.js` again.

**It moved because freezing it had built a guaranteed failure into a check.** `kristy-ios`
validates its whole asset catalog against the brand (`Tools/checks/palette_mirror.sh`), so with
the brand in a frozen file, the next colour authored on iOS could not be recorded — and the
check would then fail on a colour that legitimately *is* part of the brand. A check whose only
escape hatch is editing a frozen file is a check that gets disabled. The brand belongs where
the app is.

- `tokens.js` still ships to `kristyapproved.com` and the values are unchanged, so **nothing
  breaks**.
- **The three iOS-authored colours in it are a SNAPSHOT, not a live mirror.** `brassFill`,
  `brassFillInk` and `surfaceLifted` were written back by `7b421e3` on 2026-08-07 so one
  palette in two repos would not drift. **That was the last mirroring; the route is closed.**
  The web client consumes none of the three.
- If you are reading `tokens.js` to learn the brand, it is currently accurate and it will not
  stay that way. **Read `kristy-ios/Brand/tokens.json`.**

### `server/` — LIVE INFRASTRUCTURE, AND GOVERNED RATHER THAN FROZEN

Every surface of the iOS app is a thin renderer over these routes. The server may change. **It
may not change as a side effect of iOS work.**

- **A server change is separately proposed and separately approved work**, with its own prompt
  and its own scope. Routes, KB entries, model prompts, the lint, the tests — all of it.
- **An iOS prompt may not produce a server change.** iOS work that turns out to need one
  **stops and asks**: name the route, the shape, and what the client cannot do without it. It
  does not implement it, and it does not route around it in Swift — a Swift workaround is a
  second source of truth arriving by the back door, which the no-vendoring rule already forbids.
- **A finding is not a fix.** "The server does X wrong" belongs in `kristy-ios/docs/API-FINDINGS.md`
  with its evidence, and waits.

**Why a rule and not a preference:** `main` here **auto-deploys to production** with no staging
gate, and it carries **deliberately unpushed commits** (see **Open items**) — so a server change
made during iOS work publishes unreviewed, on push, because it looked small.

⚠️ **THE THIRD REASON USED TO BE "NODE IS NOT INSTALLED ON THIS MACHINE" AND IT IS NO LONGER
TRUE** (`brew install node`, 2026-08-09; measured here 2026-08-10 as **v26.7.0**, running the
full server suite at **644 pass / 0 fail**). **The rule is unchanged and the reason was never
only that tests could not run** — it is that a route change riding in on an iOS prompt gets no
scope and no review before it deploys. Server changes are *testable* now; they are still
separately proposed and separately approved.
📎 **`kristy-ios/CLAUDE.md` had already corrected this and this copy had not** — the two-copies
divergence that produced the category-capture error, caught here by running the thing the
sentence said was impossible. If you change one, change both.

**What is NOT covered by this and stays ordinary work:** `docs/`, this file, `supabase/*.sql`
migrations that have not been applied, and anything explicitly scoped as server work in its own
prompt.

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
   claim is wrong.** Both enforced by `counterCardLint.js` over all 82 cards, curated and
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
  thing the verdict engine sees. `kristy_perimeter_kb.json` (82 entries) answers
  *questions* about the counter and is **never** fed to the engine.
- **Web SPA is the reference client**; `mobile/` (Expo/RN) is the App Store port.
- ⚠️ **`GuestApp` IS PRODUCTION. `App`'s own surface stack has never rendered for a real
  visitor.** Phone sign-in is blocked on 10DLC, so `session` is null for everybody, so
  `App.jsx` returns `GuestApp` at the `!IS_DEMO && !session` guard — hundreds of lines before
  its dashboard/scan/aisle/haul branches. Consequences, and none of them are subtle: a bug in
  `GuestApp` is a bug **every** shopper has; a fix in `App`'s branch reaches **nobody** until
  sign-in lands; and reading `App.jsx` to learn "what a shopper sees" is reading the wrong
  file — it is the natural one to open, it has the fuller wiring, and it is inert.
  **Diagnose from `GuestApp.jsx` first.** This is how "Start shopping" was dead on production
  while the correct handler sat in `App.jsx` being reviewed and re-reviewed. A full audit of
  where the two surfaces disagree is queued and NOT done: the hero was found by accident and
  nothing says it was the only divergence.
- **`main` is production. Pushing publishes, in about a minute.** The web client is live
  at **`kristyapproved.com`** — that is the canonical front door and the one thing to verify
  against. `kristyapproved.vercel.app` is a secondary alias that serves the same build; this
  file named it as production for months and it is not. **The distinction is load-bearing
  because the SERVER only trusts origins in `CLIENT_ORIGIN`**, so the alias served the app
  while every API call from it was blocked by CORS — which reads exactly like a broken
  deploy when it is a doc error. Both are allowlisted now (2026-08-03). It runs on a
  **GitHub-connected Vercel project**, so a push to `main` auto-deploys with no staging gate
  and no manual step. There is no `.vercel/`
  locally and the project is not visible to the MCP integration's account — neither
  absence means what it looks like, and this file previously drew exactly that wrong
  conclusion ("nothing is deployed, pushing publishes nothing"). Verified 2026-07-30 by
  pushing and watching `/privacy` go from 404 to 200. **Check what a change does to a
  live surface before pushing it**, especially anything a shopper or a reviewer reads.

---

## The interface

**TWO STATES AND ONE LOOP.** *Before the store* you plan, on the dashboard — unhurried, two
hands, at home. *In the store* you walk, in **shop mode** — one thing on screen, full
viewport. Everything else is a tool you branch to from one of those two and come back to.

**Nav: Home · Scan · Counter · Haul** — four equal tabs, no throne. Scan and Counter are
identical in size and treatment because they are the two ways to fill the cart, and that
equality *is* the positioning.

- **THE CART TAB IS GONE AND THE BAR SURVIVED.** The cart stopped being a destination beside
  the others — it is the centre of the dashboard now, so tab one is **Home**. What did *not*
  happen is deleting the bar: the Counter is the moat and has no other permanent entry point,
  and demoting it from a fixed bar to a card on a scrolling surface is a real discoverability
  loss for the one thing a scanner app cannot copy. The equality argument survives the move
  because `FillRow` asserts it on the home surface in byte-identical treatment — which is
  why it lives in its own module and is imported twice rather than copied.
- **Home** is the dashboard, unconditionally (`initialMoment` returns `'home'`, still with no
  condition in it). It answers ONE question immediately — *what happens next* — in five
  states, and that answer is the first child and the largest type on the surface in every one.
  Empty, it asks what the trip is for rather than dumping a template; the answer builds it.
- **Scan** = the packaged half: barcode, or a label photo that reads anything.
- **Counter** = the unlabeled half, and **asking leads**. A question in plain words —
  from the ask card at the top of the surface or the docked composer anywhere — returns
  the same sourced answer browsing does. Browsing is still there, by section (Produce ·
  Meat · Seafood · Dairy & Eggs · Pantry & Bulk · Label terms), each carrying the
  handful of questions people actually ask at it as one-tap shortcuts.
- **Every counter answer is decision-first**: the call in one line, the why in one
  line, the checklist, then the full sourced read on tap. Its picks add to the cart in
  one tap.
- **Haul** reads the trip back and carries items forward. It is a destination reached from
  the bottom of the dashboard, not a panel on it — it answers "how did that go", which is a
  question you only have once a trip is behind you.
- **Shop mode is a MODE, not a tab.** Entered from the dashboard hero (START / RESUME),
  exited deliberately. It owns the viewport at `zIndex: 45` — above the tab bar, *below*
  every sheet — and App suppresses the tab bar and the docked composer while it is up.

---

## Load-bearing decisions (do not regress these)

**Every entry below is a RULE. The incident that produced it, the measurement behind it and
the version it superseded are in `docs/DECISIONS.md`, section by section, in the same order.
Read the account before you change a rule; the rule alone is enough to obey one.**

**Scoring and the KB**
- `matched` is **concerns-only** — every `severity_level` is a concern level. Affirmations ride
  in `affirmed` / `affirmationLayer`, never in `matched`.
- **Whole-food fats are clean because the KB holds no entry for them.** No future entry,
  positive or negative, may match butter/ghee/tallow. A regression test is the tripwire.
- **Affirming entries are excluded from REVERSE matching**, or bare "olive oil" silently
  becomes "extra virgin olive oil" and earns a badge the label never gave.
- **Margarine is deliberately NOT aliased to `partially_hydrogenated_oil`** — US margarine was
  reformulated PHO-free. It has its own `seed_oil` entry on its real modern composition.
- **Tradition (`time_tested`) justifies food-worth ONLY, never a health outcome.**
  `sanitizeAffirmed` withholds `history` as well as `why` / `kristy_note`.
- `gluten-free` / `dairy-free` stay **advisory** — the KB has no such data.
- Two harmless alias collisions exist; exact/longest-first priority resolves them.

**Reading a label**
- `tokenizeIngredients` restores the head noun onto sub-items, **scoped to an oil/fat head** —
  flagging tofu for seed oil would be a false claim, worse than a missed one.
- **A partial read may not produce a clean approval.** Flags stand; only `approved` is withheld.
- **Low confidence is a miss.** Placeholder text matches nothing and would score zero concerns.

**Lookups**
- One decode per camera opening; every scan takes a monotonic ticket and a stale response is
  dropped entirely. A barcode is checksum-validated before any lookup.
- `sameGtin` tolerates zero-padding on purpose.
- **`scanned_products` holds products, not people — no `user_id` column, ever** (a test greps
  for it). Precedence `off/full > vision/full > vision/partial`. The store holds ingredients,
  **never judgments**: a cached hit re-runs the full engine.
- **The self-heal loop is proven by behaviour, not by reading the source.** The Supabase client
  is injectable on `lookupProduct` / `retainProduct` / `coverageStats` for exactly that reason.
- **`coverageStats.fromVision` is the moat, counted.** `fromOff` is coverage we borrow.
- **Wiring is not running.** Only `scripts/growthLoops.livetest.js` confirms production capture.

**Swaps** (ruled 2026-08-08)
- ⚠️ **THE INGREDIENT-LEVEL SWAP IS NOT A PRODUCT RECOMMENDATION. It is cut from the scan
  card.** `genericSwap` answers *"what do I use instead of this ingredient"* — a kitchen
  question, asked by someone cooking, rendered to someone holding a sealed package in an aisle.
  **The field is still sent and still decoded** — deleting it client-side would be a decoder
  that cannot see its subject. Its one legitimate home is the unbuilt ingredient page.
- **THE REPLACEMENT IS SAME CATEGORY, BETTER VERSION. A bad bar swaps for a good bar** — not
  for steak, not for "eat a whole food instead". **The standard lives in the pick, not in
  refusing to answer.**
- ⏳ **THE CATALOG IS THE PREREQUISITE. Do not build the swap engine before the rows exist.**
  Nothing in this repo carries a product category; the field lands first (it cannot be
  backfilled) and the feature waits. Proposal: `docs/CATEGORY-CAPTURE.md`.

**The counter**
- The free layer is **public** (`optionalAuth`): a deterministic KB read, no model call, no
  stored data. Only the *personalized* read is premium, and a guest's counter answer does
  **not** spend their free chat run.
- **`cart_pick`, `decision` and `why` are deliberately NOT among the seven fields
  `sanitizeForModel` passes** — the call a shopper acts on can never be generated. The
  whitelist stays at seven.
- **A counter question with no KB match gets the honest miss, never the coach.**
  `looksLikeCounterQuestion` needs a counter SUBJECT *and* a buying intent, cooking verbs
  vetoed, and is consulted only after the matcher returns empty.
- **A bare either/or is a question** — `isBareEitherOr`, and it must hold in
  `looksLikeCounterQuestion` **and** `inScope`. Both sides must survive `contentWords`.
- ⚠️ **SCOPE HAS BEEN WRONG IN ONE DIRECTION EVERY TIME — too tight, never too loose.** Four
  corrections, zero the other way. **When in doubt here, admit and let the downstream filters
  refuse**: a wrongly-admitted question costs one discarded model call; a wrongly-refused one
  tells a shopper their question does not belong, on the surface built to win them.
- **A LABEL QUESTION IS THE LABEL SECTION'S WHOLE JOB.** `isMeaningQuestion` admits mean/means
  as a **VERB** plus a subject that is not itself filler. The noun form is excluded on purpose.
- **A definitional question is a counter question, and the length bound is what makes it safe.**
  `isBareDefinitional`, bounded to **≤5 words and ≤2 content words**.
- **THE RETRIEVAL FLOOR IS ONE ALIAS HIT, asserted in alias hits — not in a threshold.**
  Curated and generated must admit on the same evidence. `scoreEntries` reports `aliasScore`
  separately and the gate requires `aliasScore > 0`. `counterFloor.test.js` pins both paths.
- **Retrieval confidence and the gap log's weak ceiling are DIFFERENT NUMBERS.** `CONFIDENT`
  is `> 2`; `WEAK_MATCH_CEILING` stays 3. Sharing one constant made the curated gate
  structurally unreachable for the commonest question shape.
- **Record measured numbers, not characterizations.** The premise that held the gate up — that
  curated entries carry "a dozen aliases" — was never measured and was false.
- **ALIAS AUTHORING DIFFERS BY SURFACE: QUESTIONS FOR ASK, BARE NOUNS FOR LIST.** An alias is
  matched by whole-phrase containment, and a shopper writing a list types `tomatoes`. Every
  card needs both. This defect has shipped five consecutive times.
- **EVERY CARD CARRIES ITS OWN QUESTIONS, IN `asked_as`, AND A TEST ASKS THEM.** Three or more
  realistic phrasings, authored **from the question, never from the card's own vocabulary**,
  on the entry rather than in a fixture. `counterReach.test.js` fails if any lands on another
  card, on title words alone, or on nothing. **A new card is not done until it can be found.**
- **Be SPECIFIC, not numerous, when a hub steals a question.** The matcher scores by phrase
  length, so a reference out-ranks its hub with one longer alias — and a short generic alias is
  actively dangerous.
- **KITCHEN TECHNIQUE IS A CARD CLASS, and `kind='home'` carries it.** Same bar as a shelf
  card plus one rule of its own: **mechanical only — what happens to the food and why, never a
  bodily outcome.** `home` suppresses add-to-cart, so a card whose verdict is a PURCHASE
  decision must be `shelf` however kitchen-shaped its do line is.
- **Adding to `IMPERATIVE_VERBS` stays a deliberate act** — that is the point of the list being
  explicit rather than a heuristic. Widen it with the reasoning recorded in the list.
- **Where the popular claim outruns the evidence, the card states the narrower true thing and
  the gap goes in `watch_out`. Verify the study, not the retelling.**
- **A HUB CARD'S DO LINE MUST WORK FOR WHATEVER BROUGHT THE SHOPPER THERE.** A question about
  melon may not return an instruction about berries.
- **GENERALIZING A HUB'S DO LINE ORPHANS WHATEVER THE GENERALIZATION EXCLUDES. Check the
  boundary before shipping a qualifier, and count what falls outside it.** Silence is not
  coverage — it is only better than a wrong instruction.
- **A generated card that OWNS a subject belongs in version control; one restating a curated
  verdict gets folded.** The difference is whether the hub still holds that verdict.
- **Decision-first is content, not styling.** `decision` / `why` are re-ranked from the entry's
  own material, never new research. The depth is demoted, never deleted, and **the tier stays
  above the tap** as `tier_note`, a sentence below the do line, free.
- Section `shortcuts` carry no content — a `q` in the shopper's words and an `id` already
  browsable in that section. A second, drifting index of the counter is what they must not become.
- A section that doesn't cover something says so (`thinNote`).
- **The misses are logged, and they are the authoring backlog.** `counter_gaps`, frequency-ranked
  by `gapFeed`. `/perimeter/ask` logs unconditionally — the endpoint *is* the counter. **Chat and
  guest chat log only behind `looksLikeCounterQuestion`**, the strict test.
- **The free counter layer stores no PERSONAL data — that is the precise claim.** Question text
  is scrubbed of emails and long digit runs and capped at 160 chars *before* the insert.

**The dashboard and shop mode**
- **THE HERO IS THE ANSWER TO "WHAT NEXT", AND IT IS MEASURED, NOT ASSERTED.** Five states —
  `empty` / `completed` / `ready` / `midtrip` / `finished` — resolved from `cart.progress` and
  `cart.seedable`, storing no new concept. `dash.mjs` fails if anything renders above the hero,
  anything is set larger than it, or the hero copy repeats below it.
- **THERE ARE FIVE STATES, NOT FOUR.** A trip with every box ticked is FINISH, not RESUME.
- **EXACTLY ONE BONE-FILLED ACTION PER SCREEN, AND IT IS THE HERO'S.** Counted per state in
  `dash.mjs`. Resolve a collision by stepping the FIELD down, never the hero.
- **THE TYPE INVERTS IN SHOP MODE.** The do line leads at 17.5px, the item name demotes to an
  11.5px eyebrow; the cart has those at 15px/13.5px the other way round. An UNMATCHED row keeps
  its name in the lead slot. One prose line per row is inherited, not relaxed.
- **A SPENT INSTRUCTION IS DEMOTED BY SIZE, NEVER BY OPACITY.** 13px at full `textMuted` is
  7.84:1; the 50%-opacity version was 2.90:1. `shop.mjs` computes contrast from RENDERED colour,
  folding in every ancestor opacity, so a fade reintroduced anywhere above fails.
- **ADVANCING IS FREE SCROLL, AND THE ACTIVE SECTION IS THE ONE FILLING THE MOST SCREEN** — not
  the last section whose top crossed the viewport top, which a collapsed section breaks.
- **EVERY BRANCH OUT OF SHOP MODE IS AN OVERLAY, NEVER A NAVIGATION.** It is never unmounted, so
  there is nothing to restore. A test forbids `setMoment` inside `ShopMode.jsx`. The chat ask is
  additionally withheld in shop mode on its own merits.
- **A SCAN IN SHOP MODE ACTS ON THE LIST IN FRONT OF THE SHOPPER.** `rowMatch.js` is deliberately
  conservative: a missed match costs one extra row, a WRONG match ticks something never bought,
  and the list is a record that seeds next week.
  ⚠️ **The one-word over-match is FIXED IN SWIFT ONLY and `rowMatch.js` keeps it, deliberately.**
  The fix is the PRODUCT'S HEAD NOUN, not a length floor — "Yogurt" is six letters and "bananas" is
  seven, so no floor separates them. **Do not "finish the job" by editing `rowMatch.js`: it is in
  the frozen `client/src`, and the divergence is the recorded decision.**
- **THE SCREEN WAKE LOCK IS SHOP MODE ONLY, AND THE RE-ACQUIRE IS THE FEATURE.** The browser
  releases it whenever the document hides, so acquire-once code passes every test ever written
  for it and dies at the first notification. `shop.mjs` hides and restores the document for real.
  **Every rejection is silent.**

**Trips — the list is a record, not a scratchpad**
- `trips` (`supabase/trips.sql`) is the record: many per shopper, **exactly one active, held by a
  partial unique index rather than a code path** — the failure mode is concurrency.
- **`signals` and `next_list` DO NOT MOVE.** `shopping_lists` survives as the shopping *profile*.
- **Three statuses, and the third is the honest one. An untouched trip is REUSED rather than
  archived** — filing a no-op as history fills the archive with evidence of nothing.
- **Completing is an explicit tap, never the last checkbox.**
- **ADOPTION IS GATED ON "NO TRIPS AT ALL", NOT "NO ACTIVE TRIP".** Gating on the absence of an
  *active* trip resurrects the legacy list as a new trip on every completion, forever.
- **ONE SEEDING DOOR: `POST /api/trips/next`.** No `accept` parameter — everything is preselected
  and the cart is itself the editing surface.
- **THE CONVERSION DOOR IS `POST /api/trips/import`, AND ADOPTION HAPPENS INSIDE IT.** ⚠️ **THE
  ORDER IS THE WHOLE FEATURE AND IT IS SILENTLY DESTRUCTIVE BACKWARDS** — so both halves live
  inside `importGuestTrips` and **a caller cannot sequence them wrongly because a caller cannot
  perform either half.** One-shot on that same gate; an account with trips is declined (409),
  never merged into. Completed trips only. `status` is server-written, every row goes through
  `sanitizeList`, **timestamps are clamped to `[now − 1y, now]` with `started ≤ completed`**,
  `clientId` is echoed and never stored, and nothing derived crosses. **`trip_id` on `haul_scans`
  is NOT part of this.**
- **A SEEDED ROW IS RE-MATCHED, not copied with its card.** `carded` / `cardSlug` / `tier` and the
  whole offer set are stripped; `why`, `perimeterId`, `alt` are kept. Re-logging the misses is
  correct rather than noisy.
- **`missed` is gone as a concept.** The whole trip seeds unchecked.
- **THE HAUL READS COMPLETED TRIPS; IT DOES NOT WRITE BOUGHT ROWS.** The bar is a distribution of
  VERDICTS and an unscanned item honestly has none, so `bought` rides as its own field.

**The composed row**
- **A MOCK IS NOT A RENDER, AND A FIXTURE COPIED FROM A MOCK INHERITS ITS BLIND SPOT.** A
  for-approval mock renders the real component or it is not evidence; hand-built HTML shows
  intent, must be labelled as intent, and **may never become the basis of a fixture.**
- **A BROWSER FIXTURE IS BUILT, NEVER WRITTEN.** `client/test/buildFixture.mjs` is the one place
  they come from, and **expectations are DERIVED from the fixture**, not written beside it.
- **ONE PROSE LINE PER ROW, AND WHEN THERE IS A CARD IT IS THE CARD'S.** Suppression keys on the
  block's `hasCard`, **not** on `item.cardSlug` — the attachment renders only once its summary
  arrives. An unmatched row keeps its `why`; it is the only prose it has.
- **AN AUTHORED `perimeterId` IS GROUND TRUTH AND OUTRANKS RETRIEVAL.** Still validated, so it
  cannot attach something the corpus no longer stands behind.
- **A PROBE'S INPUT SHAPE AND ITS FAILURE DEFINITION ARE BOTH PART OF THE CLAIM — state them.**
  `server/scripts/listMatchProbe.js` **exits non-zero on a wrong match**; a miss only reports.
- **A STATE WORD IS A SUBJECT.** `stateContradicts` vetoes a candidate when the item names a state
  (frozen/canned/dried/fresh) and the card names only others. **Both sides must name one.** It is
  a veto, never a score. Explicit list, widened deliberately.
- **A BARE PROCESS WORD IS NOT A SUBJECT EITHER** — `unpasteurized` alone matched miso.
- **A LABEL CARD IS NOT AN AISLE CARD.** `label_terms` is a reference section; it falls through
  like a home card.
- **A ROW SORTS BY THE SECTION IT DISPLAYS, AND NEVER DISPLAYS ONE IT IS NOT SORTED INTO.**
  `CATEGORY_SECTION` is deliberately tiny and always outputs a counter section id; `TRAILING_LABEL`
  refuses to emit any `LIST_SECTIONS` title, so a label is structurally incapable of naming a
  section again.
- **THE CART CATEGORY IS A FALLBACK, NEVER AN OVERRIDE.** A stored `cardSection` still wins.
- **WHEN A PICK'S CARD AND ITS `why` DISAGREE, THE `why` MOVES.**
- **COMPOSED PICK NAMES STAY COMPOSED.** Renaming resets every stored shopping profile
  (`listBaseline` keys `kept` frequency on the NAME) and breaks `applyCompose`'s row protection.

**The list is the shopper's**
- ⚠️ **KRISTY CARRIES ANYTHING AND JUDGES ONLY FOOD** (ruled 2026-08-09).
  - **A non-food row goes on the list.** Trailing group, no card, no do line, no attachment.
    **Her silence is honest** — it is what makes the rows she *does* speak on visibly the food ones.
  - **She never scores, flags, approves or swaps a non-food item.** Scanned, the answer is
    *"that isn't something Kristy reads."*
  - **Compose may never refuse to add what a shopper asked for, and may never explain why it
    declined.** ⚠️ **THIS WAS A PROMISE WITH NO TEST AND PRODUCTION WAS BREAKING BOTH HALVES OF
    IT** (measured 2026-08-10, `POST /api/guest/list/compose`, "add dish soap" over a three-row
    cart): the row **was not added**, and the summary read *"Dish soap is not a grocery item…"* —
    a refusal, narrated, with an em-dash aside the voice rule also forbids. **Prompt-only defect
    and prompt-only fix**, because everything downstream was already right: a composed row's
    `section` becomes its cart `category`, `Pantry` names no walk section, so the row lands in the
    trailing group with no card and no do line — exactly what this rule describes. Only the
    model's willingness to emit the row was missing. Fixed by `THE LIST CARRIES ANYTHING` in
    `LIST_COMPOSE_SYSTEM`, and the not-about-groceries door now names the rule to use instead of
    itself. **One prompt, three call sites** (list, chat, guest), so it cannot be half-fixed.
    Pinned in `listCompose.test.js` — the old wording is asserted **absent**, not just the new
    wording present.
  - ⚠️ **The silence is the feature, so do not "improve" it later** with a household KB, a generic
    tidiness note, or an eyebrow reading "no guidance". Each turns an honest absence into a weak claim.
- ⚠️ **THE SCOPE BOUNDARY (ruled 2026-08-09): food and food-adjacent only.** Future scope, if any:
  cookware, storage, water filters, foil, parchment — the things food *touches*. **NOT household
  cleaners. NOT cosmetics. NOT general grocery.** A boundary on the product, not a backlog.
- **The item always stays.** Never removed, renamed or struck. `applyCompose` protects `user` and
  `imported` rows from a model-proposed removal unless the shopper's own words name the item.
- **Flag once.** `attachOffers` stamps `offered` on every row it inspects, including the ones that
  earned no comment, and the flag survives `sanitizeList`. Idempotent by construction.
- **A no is permanent**, and it suppresses the *item*, not just the note.
- **The offer table matches generic food words only.** A typed brand stays unremarked; a barcode is
  how she reads a box.
- **Goals weight the margins.** ≤3 additions, anchors capped at 4. Rebuild is a choice, never a
  side effect of tapping a goal.
- ⚠️ **THE STANDING ARGUMENT AGAINST PERSONALIZATION-BY-GENERATION — quote it, do not re-derive it.**
  A stored preference only ever buys the thing a shopper would not bother saying again, and that was
  measured at nearly zero: the input already carries the context. **The corpus is trustworthy
  *because* it is pre-decided**, and the generated cards are where the worst defects have lived.
  **What IS missing is the app knowing anything about a shopper — and the answer to that is
  SELECTION, never authorship.** Same cards, different ones surfaced, by a selector that is itself
  authored and reviewable.
- The baseline holds grocery **names** only. `kept` is deliberately not deduped: occurrences are the
  frequency.
- **The pattern memory is private, and it leaves with the shopper.** The explicit `USER_TABLES` sweep
  exists so the guarantee does not *depend* on the cascade; `privacyLine.test.js` parses the
  migrations and fails if any table referencing `auth.users` is absent from it.
- **Individual behaviour never joins the aggregate pool, by construction.** The two shared-pool
  writers (`productStore`, `counterGaps`) may not import the per-user readers at all — a test
  forbids the import, because that import is what a join would have to look like.

**Seeing the loops run**
- **The internal growth view is OFF unless deliberately turned on.** `/api/internal/growth` 404s
  entirely unless `INTERNAL_DASHBOARD_TOKEN` is **24+ chars**; a shorter one degrades to unset.
  Unauthorized gets **404, never 401**.
- It reads **only** `coverageStats` / `gapFeed` / `topScannedProducts`; a test forbids it importing
  any per-user reader.
- It is **not a Kristy surface** and deliberately uses none of her brand.
- **A `head:true` count cannot tell a missing table from an empty one.** `coverageStats` treats a
  null count as unavailable, and reachability checks use a real `select`, never a head.

**The ambient line — fixed per surface, never rotated** (ruled 2026-08-09)
- **A LINE THAT CHANGES EVERY LOAD IS DECORATION. A FIXED LINE BECOMES WHAT THAT SURFACE SAYS.**
- **NO SHARED POOL.** Each surface that earns one gets its OWN line, about what THAT surface is for.
- ⚠️ **THE TEST IS "IS THERE AN ACTION HERE", NOT "IS THE SURFACE QUIET."** **The empty dashboard is
  the quietest screen in the app and must NEVER carry one** — the single thing a shopper came to do
  is sitting on it.
- **Approved, and the only qualifying surface in the iOS client — the empty Haul:** *"Finish a trip
  and it lands here. Next week starts from what you actually bought."*
- ⚠️ **NEVER in shop mode, on the scan sheet, or on any surface a shopper reads while standing in a
  store.**
- **The three existing lines are WEB-ONLY**; the server's `AMBIENT` export was dead and is deleted.
  iOS renders none — only the *contextual* isms on the scan card, which are a different thing.

**Demo and failure**
- **Demo must never fabricate, and never under-report.** It reads the real public endpoints and keeps
  a fallback only for its actual purpose: no backend at all. **Fake data is never the safer failure.**
- A missing env var **names itself**; three layers catch a bad deploy (null client, React error
  boundary, and the inline boot guard in `app.html` — the only one that can catch a
  module-evaluation crash). `VITE_API_URL` is required in a production build.

**Phone sign-in — ⚠️ DORMANT, NOT PENDING (ruled 2026-08-11)**
- ⚠️ **THE iOS RAIL IS SIGN IN WITH APPLE. PHONE OTP IS RETAINED DELIBERATELY, UNUSED, AND
  CANNOT CARRY TRAFFIC WITHOUT 10DLC RE-REGISTRATION.** It is **a fallback that was kept on
  purpose, not a path in progress** — the distinction is the whole entry. Read as "in
  progress" it sends someone to finish a registration nothing is waiting on; read as deleted
  it gets rebuilt later for real money. **Keep the code, keep the honest label.**
- **This is the Bird shape with the threat inverted, which is why it is written down.** Bird
  was dead code describing an abandoned decision and a session read it as the plan. Phone OTP
  is *live* code describing a **deferred** decision, and the same misreading is available: the
  rule below says dead code that lies is worse than no code, and **an unlabelled dormant rail
  lies in exactly the same way.**
- **Measured on the live project 2026-08-11, and it corrects this file:** the Supabase phone
  provider is **already ENABLED** (`external_phone_enabled: true`) — this file said enabling it
  was outstanding. So a send is **attempted** today and fails at Twilio for want of an approved
  campaign; `friendlySendError` maps that to *"The text couldn't be sent from our end."*
  ⚠️ **If phone is confirmed dead product-wide, TURN THE PROVIDER OFF** — `friendlySendError`
  already has the accurate branch (*"Text sign-in is switched off for this app right now"*), so
  the honest message is a dashboard toggle away and needs **no edit to the frozen client.**
- **Nobody has ever signed in, on any rail.** Two `auth.users` rows exist (2026-07-27,
  2026-08-03), **both unconfirmed, both `last_sign_in_at` null**, one of them a 555 test
  number. There is no user to migrate, no session to preserve, and no revenue depending on it.
- **Twilio, via Supabase's BUILT-IN phone provider. Nothing server-side.** `SignInForm` calls
  `supabase.auth.signInWithOtp({ phone })`, which needs no change if the rail is ever revived.
- **BIRD IS DELETED, and do not bring it back.** **Dead code that describes an abandoned decision is
  worse than no code: it is documentation that lies.**
- **Do not add a delivery hook back without a reason the dashboard cannot meet.**
- **No second auth rail.** Supabase has `email: false` and it stays that way.

**Legal pages and 10DLC**
- `/privacy` and `/terms` are **static pages in `client/public/`**, rewritten to clean URLs in both
  `vercel.json` and the vite middleware so dev, preview and production agree about a URL printed on
  an external carrier form.
- ⚠️ **The carrier sentence sits on ONE unbroken source line with no tags inside it.** A2P 10DLC
  review is often automated against raw HTML, and a line wrap fails the match — rejection code **805**.
  **Do not re-wrap it to fit the column.**
- ⚠️ **A CONSTRAINT RECORDED ABOVE ONE SENTENCE DOES NOT TRAVEL TO ITS NEIGHBOUR — WRITE IT ABOVE
  EVERY SENTENCE IT BINDS.** Both required SMS sentences sit in the same paragraph, and each file
  kept the rule for one of them and broke it for the other: `terms.html` wrapped *"Message and data
  rates may apply."* while `privacy.html` wrapped *"Carriers are not liable…"*, each with an unbroken
  sibling directly beside it and one note, attached to a **third** sentence, stating the rule. Fixed
  in two commits, 2026-08-11. **An editor re-flowing a paragraph reads what is above the line they
  are standing on**, so a rule that binds four sentences is written above four sentences — the
  duplication is the mechanism, not clutter.
  ✅ **THE CONSENT-BY-ENTRY SENTENCE IS FIXED TOO (2026-08-11), and it was the instructive one.**
  It was wrapped in **both** files — the only one of the four where **neither** page kept the
  rule, so unlike the others there was no unbroken sibling anywhere to notice it against. **That
  is the version of this defect that survives indefinitely: nothing on the page disagrees with
  it.** All four required sentences are now unbroken in both files, each with the rule recorded
  directly above it.
  ⚠️ **The two files word that sentence DIFFERENTLY** (`constitutes your consent … at that
  number` vs `is your consent`) **and both were left exactly as they were.** Reconciling them is
  a copy decision, not a wrap fix, and making it inside a 10DLC-shaped edit is how a required
  element gets reworded by accident.
- The pages must also carry: OTP purpose, that entering a number *constitutes consent*, one message
  per sign-in request, STOP/HELP, "message and data rates may apply", and the processor list.
  ⚠️ **Every one of those is a match target, so the unbroken-line rule is a property of the LIST,
  not of the two sentences that happen to have notes above them.**
- **The SMS consent line lives in `SignInForm`, not on the surrounding screen.**

**Money**
- **THE PAID BOUNDARY IS A SERVER BOUNDARY.** Free forever, on every surface: the card SUMMARY
  (eyebrow, headline, do line, cart pick, **and the tier sentence**), all scanning, unlimited asking
  including generation, all browsing, and **the entire list**. Paid: the depth (`why`, `look_for`,
  `watch_out`, `detail`, `kristy_take`, `labels_decoded`, `sources`). `summarize()` / `forViewer()`
  strip the depth **before it leaves the server** — a client that merely hides it has already
  received it.
- **THE LIST IS FREE, AND METERING IT WORKS AGAINST WHAT IT IS FOR.** No save-list ask, on any tier,
  in any wording. **A SELECTOR IS NOT A RULE** — it came back twice past a `[data-save-list]` grep, so
  `cartFree.test.js` greps **what a SHOPPER READS** across all of `client/src`.
- **THE FREE SURFACE STATES THE CALL; THE COST OF THE CALL LIVES IN THE DEPTH. That is the gate
  working, not a defect.** **Do not "fix" it by promoting `watch_out` into the free layer** — that is
  the depth, and it is what the membership buys. If a card's cost is load-bearing enough to be free,
  the lever is **making that card an essential**, not widening the boundary for all eighty-two.
- **THE TIER IS A SENTENCE, NOT A CHIP.** `tier_note` is free and renders below the do line; the bare
  classification chip is gone. **Do not restore the chip to "make the tier scannable"** — a bare tier
  word is precisely what has no referent.
- **THE PAID BOUNDARY HAD NO TEST AT ALL, which is how a field moved out of it silently.**
  `paidBoundary.test.js` pins both halves over the real corpus, and pins that the replacement stays a
  SENTENCE — a `tier_note` under five words, or equal to the tier's own name, is the chip growing back
  inside a `<p>`.
- **THE EIGHT ESSENTIALS ARE ALWAYS FULL and never touch the meter.** Free depth on the shelf proves
  the reads are worth having; the meter proves BREADTH is what the membership buys.
- ⚠️ **THE ESSENTIALS NEVER REORDER. MARK THE ONES ON THIS SHOPPER'S LIST; KEEP AUTHORED ORDER**
  (ruled 2026-08-10). `ESSENTIALS` is authored **two per section** so the shelf stays balanced, and a
  sort destroys that silently — **nothing could fail, because the property belongs to the authored
  list.** And position is what a shelf is for. **Membership and order are the same editorial decision
  and both stay in version control.** Marking needs no new stored state.
- **THE TEASER SHIPS GEOMETRY, NEVER WORDS.** The real first check in full, then true CHARACTER
  LENGTHS faded out, then true counts. Sending the withheld text would leak a third of every card in
  the same change that stops leaking all of it.
- **`free_reads_used` is its own counter, NOT the `free_notes_used` pool.** Signed-out shoppers are
  metered client-side in localStorage — an IP-keyed meter would break the counter's no-personal-data
  claim to enforce a limit a cleared storage defeats anyway.
- **GUESTS ARE OFFERED NO PLAN BUTTONS** (`purchasable={false}`) — buying needs an account, and phone
  codes are blocked on 10DLC. **Restore the buttons the day sign-in works.**
- **The ask appears at ONE moment and nowhere else: the fourth full-read tap.** Not on open, not on a
  scan, not on an ask, not on a save, **never a banner**. ⚠️ **The checkable shape is an upgrade
  affordance whose render condition contains NO ACTION** — tier alone is not a moment, because every
  non-member satisfies it on every render. `UPGRADE_COPY` has exactly one key and every
  `askToUpgrade` call site passes it. **Chrome is deliberately excluded**: a destination a shopper
  navigated to is not an interruption.
- **ONE ASK COMPONENT, ONE READ METER, AND BOTH ARE ENFORCED.** A card opened in an aisle must cost
  exactly what the same card costs from the couch. `cartFree.test.js` fails if any file outside
  `CounterAsk` calls `askCounter`, or any file outside `cardMeter` calls `fetchCounterFull` /
  `spendRead` / `readsSpent`.
- **Price *ids* are configuration, never hardcoded, and the client never sees them.** Displayed prices
  have exactly one source per client (`lib/pricing`).
- **TWO PRICE NUMBERS ARE AUTHORED. THE EFFECTIVE MONTHLY AND THE SAVING ARE DERIVED.**
  `MONTHLY_CENTS` and `ANNUAL_CENTS` in `client/src/lib/pricing.js` (mirrored in
  `mobile/src/lib/pricing.ts`) are the only places a price is written down; `$3.75/month` and
  `Save 37%` are arithmetic. **This was hand-written twice and wrong twice.** The saving is
  **FLOORED, never rounded** — overstating a saving is the error that matters.
  `server/lib/pricing.test.js` fails if any price, saving or per-month figure is hardcoded elsewhere.
- ⚠️ **A STALE Stripe price id is the one billing failure nothing can detect.** Absent is safe and
  loud; stale resolves to a real live price with the OLD amount and charges it against a page showing
  the new one. **Recreate the Stripe Price objects and update `STRIPE_PRICE_MONTHLY` /
  `STRIPE_PRICE_ANNUAL` whenever the displayed price changes** — they are not in this repo and no test
  can reach them.
- **The trial has one explicit door** (`POST /api/subscription/trial`), idempotent. **Setting a goal
  grants nothing.**
- **`ensureTrial` is idempotent BY EXISTENCE**: any `subscriptions` row at all, in any status, is
  returned untouched. **A stray write permanently spends the only trial they had.**
- ⚠️ **Applying the schema must never change what a user has. Never put a data write in a schema
  file.** The trial backfill lives in `supabase/backfill_trials.sql`, run deliberately;
  `schemaSafety.test.js` fails if any other `supabase/*.sql` file contains an
  `insert`/`update`/`delete`/`truncate` outside a function body.
- **BUILDING A CART FROM A SENTENCE IS FREE, BEHIND A BUDGET — NOT A GATE.**
  `LIST_COMPOSE_FREE_LIMIT` is **12 per day** for free callers, premium exempt. **Both doors move
  together or the gate just relocates.** The over-budget line is not an upsell.
- **WHICH BUCKET A GUEST DOOR DRAWS IS DERIVED FROM "DOES THIS REACH A MODEL", NEVER DECIDED PER
  ROUTE.** By eye that question was answered wrongly on four routes in three directions.
  `guestBudget.test.js` asserts the split per **HANDLER** — a file-wide grep cannot, because `scan.js`
  legitimately contains both.
- ⚠️ **A BUDGET SPENT IN HOPS CANNOT BE READ AS A BUDGET FOR ANYTHING A SHOPPER DOES.** The scan
  bucket is sized in **SCANS** — 30 an hour, 2 hits each — **with the multiplication exported and
  asserted**, so a third hop fails a test instead of silently halving the ceiling.

---

## Verifying

**The commands are here. The incident behind each rule is in `docs/VERIFYING.md`.**

### The findings family — five members, one shape

**A check reports success because it cannot see the thing it is checking.** Recognise the shape;
`docs/VERIFYING.md` has all five in full.

1. **AN ASSERTION OVER AN EMPTY COLLECTION PASSES. Guard every one of them.** `[].every(fn)` is
   `true`. **`nonEmpty(coll, name, min?)` in `lib/testGuards.js` is the fix, and bind it at the
   COLLECTION rather than at the loop** — a module-level `const entries = nonEmpty(...)` throws at
   import, so every test in that file is honest by construction instead of by discipline.
2. **A BOUNDARY WITH NO TEST IS A COMMENT, AND IT STAYS GREEN WHILE A FIELD WALKS ACROSS IT.**
   **When a rule is the product's economics or its promises, the absence of a failing test is not
   evidence — ask what would have gone red.**
3. ⚠️ **EACH SITE REASONS CORRECTLY IN ISOLATION; THE DEFECT APPEARS ONLY WHEN YOU ADD THEM UP.**
   No file owns a composition, so there is nowhere to put the failing test and a diff review
   structurally cannot see it. **The check is to walk the path end to end as a real visitor with no
   diff in hand**, and **the tell is a `false` that is CONSTANT rather than conditional** — a flag
   whose true branch has never been taken in production is not a flag, and everything downstream of
   it is **unbuilt rather than untested**. Two found this way, both open: the **trip lifecycle** and
   the **shopping profile** (`buildBaseline`'s input has always been empty).
4. **A HARNESS THAT SUPPLIES THE PROPS VERIFIES A WIRING PRODUCTION NEVER RUNS.** **A harness proves
   the component; only the real call site proves the wiring.** An inert control is invisible to every
   check that looks for failure, *because it does not fail* — so make the absence loud instead
   (`Hero` requires a label AND a handler).
5. **A COMMIT THAT OMITS THE FILE IS GREEN FOR THE SAME REASON AN EMPTY COLLECTION IS.** Every test
   runs against the WORKING TREE. **`git add -A`, never `git commit -a`.** Run
   **`node server/scripts/commitGuard.js`** before any commit that claims a feature.
   ⚠️ **`GUARDED` says where an untracked file is a problem; it must never also decide what gets
   READ** — conflating the two exempted `server/index.js`, the file that mounts every route.

### Rules with teeth

- **EVERY SOURCE GETS FETCHED BEFORE IT SHIPS. A citation written from memory is the same defect
  class as a comment asserting an invariant.** The real finding beats the retold one often enough
  that fetching is worth it on the merits, not only as hygiene.
- ⚠️ **A PROMPT'S WORKED EXAMPLE BECOMES ITS OUTPUT. Never write the forbidden thing down.** When
  output is wrong, check whether the generator was *taught* it before assuming it improvised.
  **Distinguish two forms:** a forbidden WORD must be named to be banned and sits inside a
  prohibition frame (low risk); **a forbidden PHRASE demonstrated as example output is high risk and
  always avoidable — describe the defect instead of writing the bad line.** A ban with no substitute
  is a gap the model fills from habit, so **name the words it SHOULD use.** **A worked example must
  also never quote the live corpus** — illustrations are invented, or clearly marked as belonging to
  a card that already exists.
- **A COMMENT ASSERTING AN INVARIANT IS NOT AN INVARIANT. If it is load-bearing, test it.** Prose
  records intent while code executes mechanism, and the two drift silently. **Where a comment
  explains WHY, keep it. Where it asserts THAT something holds, write the test and let the comment
  point at it.**
- **Verify mobile over CDP, not `--window-size`.** Chrome enforces a ~500px minimum window on
  Windows. Use `Emulation.setDeviceMetricsOverride`.
- **Measure, don't eyeball.** Geometry claims come off `getBoundingClientRect`.
- **`vite build` COMPILES A DEAD REFERENCE HAPPILY.** A green build is not a rendered surface; run
  the browser suites after any component split.

### The commands

| Command | What it proves |
| --- | --- |
| `cd server && npm test` | **644 pass on `main` (the held stack) and 633 on `origin/main`**, both measured 2026-08-10. ⚠️ **TWO NUMBERS, AND THE SMALLER ONE IS NOT A REGRESSION** — the 11-test delta is the held import route's own tests (`trips.test.js`), which by definition are not on the deployed branch. A bare count here has been stale five times — **record only a number you actually ran, and say which branch ran it.** |
| `cd client && npx vite build` | Compiles. Not that anything renders. |
| `node server/scripts/commitGuard.js` | No file this commit claims is untracked. |
| `node server/scripts/listMatchProbe.js` | The corpus still answers the list correctly. **Exits non-zero on a wrong match**; a miss only reports. Run after any alias edit, `perimeterId` change or matcher change. |
| `node client/test/dash.mjs` | Five dashboard states at a true 390px **in the real app frame**; the hero rule and the one-filled-action rule. |
| `node client/test/shop.mjs` | Shop-mode geometry, the type inversion, WCAG contrast off **rendered** colour, the collapse mid-scroll, **the wake lock hidden and restored for real**, return-to-position broken four ways. |
| `node client/test/cart.mjs` | The real CartMoment at 390px with **real pointer clicks** — 44px targets, zero horizontal overflow, the collapse. |
| `node client/test/composed.mjs` | What the list **costs** — lines per row, page height — plus the two honesty rules with no other home. |
| `node client/test/loop.mjs` | The whole trip loop: build, check, complete, seed. Fails if a seeded row arrives checked or loses its card. |
| `node client/test/gate.mjs` | Drives the real surface. The only thing that caught a dead reference through a clean build. |
| `cd client && node test/skim.mjs` / `test/shots.mjs` | Rendered line boxes for all 80 cards at 390px. **Both need the API server on :3001.** |

### Corpus and schema

- ⚠️ **EDITING A CURATED CARD IS A TWO-STEP ACT, AND NOTHING REMINDS YOU OF THE SECOND.**
  `routes/counter.js` serves from the **`counter_cards` table**, not from
  `kristy_perimeter_kb.json`. A KB edit changes the tests, the probes and every local fixture and
  changes **nothing a shopper sees** until `node server/scripts/migrateCounterCards.js` runs. The KB
  stays the source of record; the migration is idempotent (upsert on slug) and `--dry-run` needs no
  credentials.
- **The counter card's shape bar is executable.** `server/lib/counterCardLint.js` holds the rules,
  and **Pass 3 must call `lintCard` before persisting a generated card.**
- **A TIER NOTE MAY NOT POINT AT THE TIER.** `lintCard` fires `TIER_NOTE_SELF_REFERENCE` on
  `this tier` / `the tier`, and `paidBoundary.test.js` fails if **any two cards share a tier
  sentence** — a sentence on four cards is the rubric wearing a costume.
- **A fold is a removal AND a delete, in one operation.** The migration upserts and never removes, so
  retirement must be declared in `RETIRED`. **Move the folded card's aliases onto its absorber and
  repoint any section `shortcut`, or the fold is a coverage regression wearing a tidy diff.**
  **Grep wider than the shortcuts.**
- ⚠️ **TWO retirement lists, and a slug in the wrong one deletes NOTHING.** `RETIRED` is scoped to
  `source='curated'` and is *structurally incapable* of retiring a generated row; that is
  `RETIRED_GENERATED`. A test fails if either list holds the other's kind.
- **PROMOTE A GENERATED CARD ON DEMAND OR ON CORPUS-CORRECTION, NEVER ON CORRECTNESS.** Correctness
  is already the floor for a generated card existing at all. **When `use_count` climbs, promote.**
- **Keeping at least one real generated row is not untidiness** — at zero, stage 2b has nothing to
  retrieve and is untestable in production.
- **A fold's real anchor may be a PROMPT, not a row.** Deleting the row alone leaves the thing that
  regenerates it.
- **What the code writes must exist in the migrations.** `schemaContract.test.js` compares every key
  `cardToRow` emits against the declared columns. The live audit in `docs/SCHEMA-AUDIT.md` is blind
  to a column missing from BOTH — which is how `counter_cards.aliases` shipped.
- **The section depth floor is 8**, a proxy for "answers as much as a scan does". Removing a
  duplicate may lower the count legitimately; **a section that shrank by DELETION must not get the
  same pass.**
- ⚠️ **The deploy boundary is `server/`, and a test is the fence.** Railway's Root Directory is
  `server/`, so anything the runtime reads from outside it exists on a laptop and is missing on the
  box, silently and forever. `deployBoundary.test.js` resolves the path literals in `lib/`, `routes/`
  **and `index.js`**; `scripts/` is exempt by name. `doLines.json` is the fix for the one that
  shipped: **edit the table, re-run `scripts/buildDoLines.js`, commit both.**
- If a git write fails with "permission denied", it's OneDrive locking `.git` — retry. **Never
  hand-edit the KB or committed files to recover.**

---

## Open items

**This is the live board. Closed items, full evidence and the reasoning behind each are in
`docs/OPEN-ITEMS.md`.**

### Live defects

- 🐞 ⚠️ **`hello@kristyapproved.com` DOES NOT EXIST, AND FOUR LIVE PAGES PRINT IT** (2026-08-11).
  `/support` (twice — it is the entire "getting help" section), `/privacy` and `/terms`. **This
  is a LIVE GAP, not a pending task:** a shopper or a reviewer emailing that address today gets
  a bounce, and the support page additionally promises **a reply within two business days**.
  ⚠️ **A BOUNCING SUPPORT ADDRESS IS WORSE THAN NO ADDRESS** — App Review checks the support
  URL, and "we answer email" plus a hard bounce reads as abandonware rather than as an
  oversight. **The pages are correct and stay as they are; the mailbox is what is missing.**
  Being set up (owner's own item). **Nothing here should be edited to work around it** — a
  second address, a contact form or a softened reply promise would each be a worse answer than
  the mailbox existing. **Re-check before any App Store submission**; it gates nothing else.

- ✅ **SHIPPED AND VERIFIED LIVE (2026-08-10): ONE PREDICATE — `nothingConfirmsFood`.** Three gates
  that happened to agree became one question asked of whatever evidence exists. On `origin/main`
  as `22b35a8`, with the water category beneath it as `f6c895f`. **The dyed-Dawn decoupling landed
  inside it** — `tier === 'approved'` is gone from the gate, so a product is no longer protected
  from the food treatment by containing a flagged food ingredient. Driven on production through
  the guest path after the deploy, all five cases:
  - `0030772006023` **dyed Dawn → FIRES** on `swap_recommended`: `education: null`, `swap: null`,
    `unverifiedRead` present — and ⚠️ **`universalLayer` INTACT, both `yellow_5` and `blue_1` still
    printed.** That is the half that mattered: **flags stand.** Withholding refuses to ENDORSE; it
    never silences a warning.
  - `6111035002175` **Sidi Ali → FIRES.** `3274080005003` **Cristaline → FIRES.**
  - `3017620422003` **Nutella → SILENT**: `unverifiedRead: null`, `education` present, flags intact.
  - `0030000010402` Quaker Old Fashioned Oats — `whole grain rolled oats`, panel present —
    **SILENT, `tier: approved`, `stamp: true`. The seal still lands.**
- ❓ ⚠️ **THE UPSTREAM QUESTION IS STILL OPEN, AND THE PREDICATE CONTAINS IT RATHER THAN ANSWERING
  IT.** Sidi Ali still returns **`tier: "approved"`** on production today: the engine still reads a
  seven-token mineral analysis as a clean ingredient list, still matches no KB concern, still
  scores it zero. What changed is that the seal is withheld and the withheld read prints.
  **The misread is contained at the seal, not fixed at the read.** ⏳ Still open as a QUESTION,
  not a fix: what should a thin or non-ingredient list produce? Nothing is proposed, deliberately.
  ✅ **Re-driven on production 2026-08-11 and unchanged** — `tier:"approved"`, `stamp:false`,
  `unverifiedRead` present, `education`/`swap` null. Account: `docs/OPEN-ITEMS.md`.
- 🐞 ⚠️ **THE CATEGORY UPGRADE CANNOT REACH A ROW ALREADY IN `scanned_products`** (measured
  2026-08-10, the day the water patterns shipped). A cache hit returns early in `scanExtract.js`
  with the row's **stored** category (`productStore.js:142`) and never re-fetches Open Food Facts,
  so `categoryFromAisle` never runs again. The upgrade branch written for exactly this
  (`productStore.js:265` — patch when a fresh category is better than `other`) lives on the
  **retain** path, which the cache hit bypasses. **Evidence, both halves measured the same hour:**
  Sidi Ali's live OFF record resolves `natural mineral waters` → **`water`** through the shipped
  patterns, while production returns **`category: "other"`** — the row was retained before the
  patterns existed and cannot be told about them.
  ⚠️ **THE ORDERING CONSTRAINT, AND IT IS THE WHOLE FIX: THE RE-READ MUST ROUTE THROUGH
  `retainProduct`, NOT MERELY RE-FETCH.** The upgrade branch is `productStore.js:262`, inside
  `if (incomingBeats)`, inside `retainProduct` — and on this path `retainProduct` has exactly one
  call site, `scanExtract.js:380`, which sits **past the cache-hit `return` at
  `scanExtract.js:266`**. So a version stamp that decides "re-fetch this row" and uses the answer
  in memory fixes one response and never the row: the next scan re-fetches, and the one after
  that. ⚠️ **IT WOULD SHIP AS DECORATION AND EVERY CHECK ON IT WOULD PASS**, because the response
  carries the right category and that is the only thing an end-to-end assertion looks at — the
  row is the subject and nothing reads it back. **The cache-hit branch has to fall through to
  the fetch-and-retain path.**
  ⚠️ **THE STALE STATE FAILS SAFE; THE FIX DOES NOT, AND THIS ENTRY READ THE OPPOSITE UNTIL
  2026-08-12.** `other` is non-exempt, so a stale category can only withhold a seal — true, and
  it is a claim about the **defect**. **The fix's entire job is to turn `other` into `water`, and
  `water` GRANTS**: `FOOD_CATEGORIES` is live (part 3 below shipped). This fix is what makes the
  exemption reachable for the first time, so it inherits the exemption's prerequisites instead of
  merely unblocking it.
  ✅ **BUT IT IS STILL SAFE TO LAND FIRST, MEASURED — DO NOT READ THE ABOVE AS A BLOCK.** Sidi
  Ali `6111035002175` becomes exempt under this fix and the **document** half still catches it
  (`readsAsNutrientPanel` is `true` on its seven tokens, pinned in `foodPredicate.test.js`).
  Cristaline `3274080005003` is the one that breaks — and it cannot reach `water` without the
  **aisle** fix, which is where that constraint is recorded.
  ✅ **THE FIX IS APPROVED AS DESIGNED (2026-08-11) AND ITS PREREQUISITE IS NOW CLEAR** — the
  migration is applied and being written to (see the category-capture entry below). **Still not
  written: it touches the store's READ path, which is separately scoped server work and needs
  its own prompt.** The approved shape, recorded so it is not re-derived:
  - **A VERSION STAMP, NOT A TTL AND NOT "IS THE CATEGORY `other`".** A TTL re-fetches rows that
    were already right; keying on `other` cannot tell "we looked and it is genuinely other" from
    "we looked before the patterns existed".
  - ⚠️ **THE BUMP RULE IS AN ASYMMETRY AND IT IS THE PART THAT IS EASY TO GET BACKWARDS. Bump on
    `other`. Bump on not-found. DO NOT bump on a network failure.** A network failure is not
    evidence about the product, and stamping one records "we checked" for a check that never
    happened — which retires the row from re-checking forever on the strength of a timeout.
  - ⚠️ **THE FAILURE DIRECTION IS SAFE ONLY WHILE THE ROW STAYS STALE.** `other` is non-exempt,
    so an un-upgraded row can only withhold a seal — but a row this fix upgrades to `water` is
    exempt on the product half from that moment. **The safe direction belongs to the bug, not to
    the fix**; see the ordering constraint above.
- ✅ ⚠️ **PART 3 — THE CATEGORY EXEMPTION — SHIPPED, AND THIS ENTRY SAID "STILL HELD" UNTIL
  2026-08-12.** `FOOD_CATEGORIES = new Set(['water'])` at `verdictEngine.js:462`, read by
  `nothingConfirmsFood` at `:481`. It is on **`origin/main`**, i.e. deployed, and it landed
  **inside `22b35a8`** — the predicate commit this file already records two entries above as
  shipped and verified live. **The exemption rode in with the predicate and the held-work entry
  never caught up**, so one document described the same change as both live and held.
  ⚠️ **COMPUTE IT, DO NOT READ IT** — the same lesson as the category-capture entry below, which
  was wrong for two days in exactly this direction:
  ```
  git show origin/main:server/lib/verdictEngine.js | grep -n 'FOOD_CATEGORIES = '
  ```
  **All three properties this entry listed as future requirements are already built and pinned**
  in `foodPredicate.test.js`: exact-match never substring (`watermelon` must not exempt), `other`
  and `NULL` non-exempt permanently, and an explicit allowlist rather than "trust the panel if we
  know the category". Context for why water was the cluster worth it: **2.7% of the most-scanned
  OFF products carry no `energy` key at all, rising to 8.8% at the thin end**, and the largest
  single cluster is water. The live table was the argument: of its four `nutrition_panel:
  'absent'` rows, two are the waters and two are **dish soap**.
  ⚠️ **WHAT IS STILL HELD IS ONLY ITS REACH, AND THAT IS NOT THE SAME THING.** No production row
  is exempt today, because the waters still read `category: other` — the cache finding above. So
  the exemption is **live and unreachable**, which is the state that reads as "held" from the
  outside and is not: nothing has to be decided to turn it on, and the cache fix turns it on.
  ⚠️ **THE PATTERN IS THE PLURAL `waters`, NOT THE BARE WORD THE PROPOSAL NAMED.** Matching is
  `includes`, so bare `water` also eats `watermelons`, `water chestnuts` and `water biscuits` —
  produce, a canned vegetable and a cracker, all silently becoming a drink. **Part 3 lets a
  category past a fail-closed gate, so a watermelon in `water` is a wrong approval.** Asserted in
  `productCategory.test.js`, and the assertion was proven to fail on `watermelons` before being
  trusted.
- ⚠️ **`unverifiedAsFood` IS STILL NOT ON THE WIRE, AND THAT IS DELIBERATE.** The engine returns
  it; `routes/verdict.js` does not forward it. A client keys off `unverifiedRead` / `stamp`
  instead — **a client cannot fail closed on a field it has never heard of. Do not add it to a
  decoder expecting it to arrive.** What the routes now carry is `readSwap`, **one helper across
  all four send sites**, because this file has already lost a field across those four: three
  forwarded `unverifiedRead` and the fourth did not. A rule that must be retyped four times is a
  rule that will be applied three times.

### Held deliberately — do not "discover" these and land them

- ⏸ **THE UNPUSHED COMMITS ON `main` ARE DELIBERATE. What is held is the IMPORT ROUTE.** Nothing
  can reach `POST /api/trips/import` (`requireAuth`, sign-in blocked on 10DLC),
  and pushing this repo deploys. **Full reasoning is in the iOS repo's `docs/SWIFT-HANDOFF.md` §3
  item 0 — one queue, not two. Do not push it to be helpful.**
  ⚠️ **Its test condition cleared and it is still held.** A cleared blocker is not an approval; it
  gets reviewed against what the iOS client actually needs before it ships.
  ⚠️ **DO NOT IDENTIFY HELD WORK BY HASH OR BY "AHEAD N" — neither survives a split, a rebase or a
  partial push, and this entry has been wrong with both. Only the SUBJECT is stable.** Compute it:

  ```
  git log --oneline --reverse origin/main..HEAD
  ```

  **When something above the hold is urgent, CHERRY-PICK IT PAST — that is the move, and it is why
  stack timestamps interleave with `origin/main`'s.** ⚠️ **A reader reconstructing this history from
  commit dates alone will get the order wrong.** A bare `git push` sends everything ahead; pushing a
  specific commit by hash is the only way to ship the bottom of a stack without the top.

  ✅ **DONE ONCE, ON 2026-08-10, AND THE CLEANUP TURNED OUT TO BE PART OF THE MOVE.** The water
  category and the food predicate were shipped past the hold on a two-commit branch cut from
  `origin/main` (`ship-verify`), pushed as `ship-verify:main`. **The import route never left the
  machine** — verified by grepping `importGuestTrips` and `/trips/import` out of `origin/main`
  *after* the push, never by reading the push output.
  ⚠️ **THEN `main` WAS REBASED ONTO THE NEW `origin/main`, AND THAT SECOND STEP IS NOT OPTIONAL.**
  A cherry-pick leaves the ORIGINAL commits sitting on the stack under different hashes, so the
  command above — the one this entry prescribes as ground truth — went on naming two subjects that
  were already live. **That is this entry's own recorded failure, reproduced by the fix for it,
  within the hour.** The rebase dropped both as already-applied (`skipped previously applied
  commit`), and the result was proven **content-identical** to the pre-rebase tip
  (`git diff ef598a8 main` empty, suite still 644) *before* `main:held` was force-updated.
  **A cherry-pick past the hold is not finished until the stack stops claiming what it shipped.**

  🐞 ⚠️ **CATEGORY CAPTURE IS NOT HELD. IT IS ON `origin/main`, AND THIS ENTRY SAID THE OPPOSITE
  FOR TWO DAYS — AS DID THE iOS REPO'S COPY OF IT.** Corrected 2026-08-10 by computing it rather
  than reading it. `server/lib/productCategory.js`, `productCategory.test.js` and
  `supabase/product_category.sql` all resolve on `origin/main`, and all three commits are
  ancestors of it:

  ```
  git merge-base --is-ancestor 2ce5f9f origin/main   # Category capture: the field a swap needs
  git merge-base --is-ancestor 860f573 origin/main   # nutrition_panel on scanned_products
  git merge-base --is-ancestor 3f0ada4 origin/main   # what the migration does not fix
  ```

  ⚠️ **THE ERROR IS NOT COSMETIC, BECAUSE THIS ENTRY'S OWN WARNING WAS AN ORDERING RULE.** It said
  *"apply `supabase/product_category.sql` BEFORE the code deploys — without the columns every
  retain logs `column does not exist` and **silently stops retaining**."* **The code is pushed, and
  `main` auto-deploys.** So the ordering this warned about has either already been satisfied or
  already been violated, and the document that was supposed to make somebody check said the code
  had not gone anywhere.

  ✅ **ANSWERED 2026-08-11: THE MIGRATION IS APPLIED, AND IT IS BEING WRITTEN TO.** Measured
  against the live table with the credentials in `server/.env`: `category`, `category_raw` and
  `nutrition_panel` all resolve on `scanned_products` (`select` returns 200, not a 42703), and
  of **18 rows, 5 carry a category and 7 carry a `nutrition_panel`** — so the write path is not
  throwing and has not been. Sidi Ali and Cristaline both read `category: other`,
  `nutrition_panel: absent`, which is the stale-category finding above, not a schema failure.
  ⚠️ **THIS ENTRY'S OWN PREMISE WAS STALE, AND IT IS THE SAME DEFECT IT WAS WRITTEN ABOUT.** It
  said the question "cannot be answered from this machine — no `server/.env`" while
  **Infrastructure state, in this same file, recorded the Supabase credentials as live.** Two
  statements, one document, contradicting each other for a day, and the pessimistic one was the
  one a reader would act on. **The check was one query.**
  📌 **The log grep this was going to be settled by is not runnable here** — no `railway` CLI, no
  `RAILWAY_TOKEN` in `server/.env` — and it is now moot: the read-side degrade line
  (*"scanned_products.nutrition_panel is missing"*) only ever logs when the column is absent,
  and it is present. **Query the table, do not hunt the log.** That is the cheaper answer to
  every question of this shape.
  What was known about the failure shape, read from the source, and kept because it is the
  reason the answer mattered:
  - **The READ side degrades and says so.** `productStore.js` retries the lookup without
    `nutrition_panel` and logs a named line: *"scanned_products.nutrition_panel is missing — apply
    supabase/product_category.sql."* **Check the Railway logs for that string first; it is the
    cheapest possible answer to the question.**
  - **The WRITE side has no retry.** The insert spells `category`, `category_raw` and
    `nutrition_panel` literally and does `if (error) throw`. If the columns are absent, retaining a
    **new** product throws every time.
  - `docs/SCHEMA-AUDIT.md` **does not mention `product_category` at all**, so the one document whose
    job is to compare live schema against the migrations is silent on the newest one.

  ⚠️ **THE CLOCK IS UNCHANGED AND IT IS WHY THIS MATTERS EITHER WAY.** A category cannot be
  backfilled from a **vision** row (the photo is never stored), so every scan retained without the
  columns is a row that can never answer "what else is this". An OFF row *is* re-derivable at one
  free request per barcode.

  📋 **The lesson, which is this repo's own:** the entry identified held work correctly by SUBJECT
  and then **listed a subject that was not on the stack** — so the rule against hashes and "ahead N"
  held, and nobody ran the command it prescribes. **Computing it is only a fix if someone computes
  it.** Two documents stated it, which is precisely why a reader had no way to notice.

### Standing risks, not urgent

- ⏳ **THE GUEST BUDGET IS A PROPERTY OF UPTIME, NOT OF THE SHOPPER.** All four buckets in
  `guestRate.js` are module-level `Map`s in one process, so **every deploy hands every IP a full
  budget back** and Railway redeploys on every push to `main`. **It cannot be measured** —
  `rateLimited` records a hit when it is NOT limited, so asking whether budget remains spends the
  slot that answers. **It becomes real the moment a second instance exists.**

### Queued

- 🐞 ⏳ **`/guest/list/attach` IS METERED BY A BUDGET SIZED FOR A DIFFERENT ACT** (measured
  2026-08-11, from the iOS side). It draws `cartBuildLimited` — **20/hour, sized for the one
  cart build a shopper does per trip** — while an attach is made by the CLIENT on every cold
  launch carrying uncarded rows and once per added item. **This is the fourth instance of one
  correction**, and the first where the door was already out of the inference pool: the rule
  the other three established is a bucketed ceiling **sized for the act it protects**, and
  attach was put in the nearest existing bucket instead of given one. Attach names no model
  call — `sanitizeList`, then a synchronous scan of an in-memory KB — so `guestRate.js`'s own
  header settles which side it is on.
  ⚠️ **A REFUSED ATTACH PRODUCES MORE ATTACHES, NOT FEWER.** `Cart.merge` persists `carded`,
  so a success stops the next launch calling and a refusal leaves every row uncarded for the
  rest of the window. The bucket has positive feedback, and "re-run on a fresh hour" is a
  weaker remedy than it reads.
  **Evidence:** the iOS UI suite's attach-triggering launches total **20 deterministically —
  exactly the ceiling — before two test classes that inherit a sticky fixture contribute
  anything**; ~23 measured. ⚠️ **The suite is the DETECTOR, not the subject** — a twelve-item
  list plus eight aisle additions plus three cold launches is 23 for a real shopper, so sizing
  this for CI would be the same mistake one layer along. Proposal, with the counts per test
  class and the rejected one-liner: `docs/ATTACH-BUCKET.md`. Separately proposed server work.
- 🐞 ⏳ **THE AISLE IS DERIVED FROM THE LAST OFF TAG ON A FALSE PREMISE, AND IT THROWS AWAY THE
  ANSWER** (measured 2026-08-10). `aisleFromCategories` takes the last `categories_tags` entry as
  "most specific". It is not a specificity hierarchy: for `3274080005003` the tags run
  `… waters → spring waters → unsweetened beverages`, so the row lands in **`other`** while
  carrying two tags that map to `water`. `en:unsweetened-beverages` is an orthogonal **dietary**
  axis, and any product whose last tag is a dietary one (unsweetened, no-added-sugar, organic)
  loses its aisle the same way. **This is a category-capture defect, not a water one.** The shape
  is to map from the TAG LIST, most specific *mapped* hit — **not** to widen the water patterns to
  swallow `beverages`, which is what `docs/CATEGORY-CAPTURE.md` first floated and would be untrue
  (an unsweetened tea is not water) in a vocabulary that gates a fail-closed exemption. Separately
  proposed: it changes what `category` is written for products well beyond water, and that field is
  what part 3 reads. Account and the measured tag list are in that file.
  ⚠️ **THE PREREQUISITE, AND IT IS NOT VISIBLE FROM THE DEFECT: LANDING THIS FIX REMOVES A CATCH
  THAT IS FIRING IN PRODUCTION RIGHT NOW.** Cristaline is `approved` today on an ingredient text
  that is a **nine-line mineral table**, and the only reason the gate holds it is that its category
  resolves to `other`. This fix resolves it to `water` — which **is exempt** (part 3 shipped; see
  above) — and the document half does **not** pick it up: its tokens are a mangled dump with units
  and a brand name (`"eau de source noemie calcium ca2+ 113 mg/l…"`), not the bare nutrient names
  `readsAsNutrientPanel` tests for. **Measured 2026-08-10: `FIRES = false`.** An approved gold-seal
  candidate, un-caught by a fix that is right about aisles.
  **So: land the `ingredients_lc` guard first, or at minimum drive `3274080005003` through the gate
  as part of this fix and assert the outcome.** That guard is what actually catches this product.
  📎 **The same warning sits at the point of the change**, in `productCategory.js` above the `water`
  patterns — deliberately duplicated, because each site reasons correctly alone and no file owns
  the composition. **If you change one, change both.**
- 🐞 ⏳ **OFF PARSES ONE LANGUAGE AND KRISTY READS ANOTHER, SO THE PARSE AND THE TEXT CAN BE
  DIFFERENT DOCUMENTS** (found 2026-08-10, **re-measured against OFF 2026-08-11, unchanged**).
  `ingredients_lc` names the language OFF actually parsed. Cristaline `3274080005003`:
  `ingredients_lc = "fr"`, parse is **one** ingredient (`en:spring-water`), `ingredients_text_fr`
  is the correct `"Eau de source"` — and `pickEnglishText` returns `ingredients_text_en`, a
  contributor-filled **nine-line mineral table**. The record holds a right answer and a wrong one
  in different language fields, and the code reads the wrong one **by preferring English**, which
  is the correct preference for every other product.
  ⚠️ **THE ENGLISH FIELD IS NOT A TRANSLATION, IT IS A DIFFERENT DOCUMENT** — so a language check
  passes it (the mineral table *is* English) and the whole language layer is asking the wrong
  question.
  **THIS IS THE TWO-LISTS DISAGREEMENT ON A NEW AXIS, AND `sameVerdict` IS THE PRECEDENT** — same
  shape as the Heinz live-vs-imported defect, same fix available (score both, compare the tier,
  refuse to guess when they differ). `pickImportedText` returns `''` here, so the existing guard
  **cannot** engage: the second document is a LANGUAGE field, which it has never looked at.
  ⚠️ **IT IS NOT THE PANEL-GATE TRIGGER AND MUST NOT BE FOLDED INTO IT.** It does not catch
  Sidi Ali `6111035002175`, where `ingredients_text_fr` is the mineral list too — parse and text
  agree there and are wrong together. **Two products, one symptom, two unrelated causes.**
  Separately proposed; in range is every product whose `ingredients_lc` is not `en`, i.e. most of
  the non-US catalog. Account: `docs/OPEN-ITEMS.md`.
  ⬆️ **THIS IS NOW A PREREQUISITE, NOT ONLY A DEFECT: THE AISLE FIX IS UNSAFE WITHOUT IT.** That
  fix resolves Cristaline to `water`, `water` is exempt (part 3 shipped), and the document half
  measures `FIRES = false` on this product's mangled tokens — so the mineral table takes the gold
  seal. **Landing this guard first is what makes the aisle fix safe.** Recorded at both ends on
  purpose; the constraint is stated in full in the aisle entry above.

- 🐞 ⏳ **`/privacy` AND `/terms` DESCRIBE AN SMS PRACTICE THE iOS CLIENT DOES NOT HAVE, AND THE
  APP STORE IS ABOUT TO POINT AT THEM** (queued 2026-08-11 from the iOS side). Both pages were
  written for A2P 10DLC review — OTP purpose, consent-by-entry, STOP/HELP, the carrier sentence
  — and **Sign in with Apple replaced the phone rail on iOS**, which has no phone field at all.
  Measured: 16 SMS-shaped matches in `privacy.html`, 6 in `terms.html`.
  ⚠️ **THE OBVIOUS FIX IS THE DESTRUCTIVE ONE.** Deleting the SMS language breaks two live
  things: `client/src/components/Auth.jsx:117` still calls `signInWithOtp({ phone })` and
  **`client/src` is frozen**, so the web rail is permanent; and **10DLC is still in verification
  at Twilio**, where the carrier sentence's one-unbroken-line shape is what passes an automated
  review (rejection code **805**). **The first step is a product ruling, not an edit: is phone
  sign-in dead product-wide, or superseded only on iOS?** The second is likelier and is the safe
  default — it makes the work an ADDITION (an Apple section, the deletion disclosure) with
  nothing removed. `client/public/` only; separately proposed. Account: `docs/OPEN-ITEMS.md`.
- ⏳ **DERIVE A BASELINE FROM THE DEVICE TRIP ARCHIVE** (ruled 2026-08-10). `buildBaseline` is
  written, tested and correct with a permanently empty input; `GuestTripBook.archive` holds exactly
  the input shape it wants. Run that computation **in the client** for a guest with no account, no
  server change and no new stored data. **Nothing is proposed to consume it yet, and that is
  deliberate.**
  ⚠️ **PRICE THE `canonicalItem` DUPLICATION BEFORE STARTING** — a third implementation in Swift of a
  canonicalizer whose disagreements would be silent. **Consider the alternatives before any Swift is
  written**, including narrowing to exact-name matching and **stating that narrower claim.**
  ⚠️ **DO NOT LET THIS BECOME A CAPTURE PROJECT.** The record already exists; the whole finding is
  that it is collected and unread.
- ⚠️ **The scan card is still the full-height takeover, and the replacement is specced but unbuilt** —
  a **bottom sheet**: summary, full read on tap, camera live behind it, and the approved state as the
  SMALLEST state in the app. Related and queued: on a **photo** read the card's image slot is empty;
  the fix is a client-side crop of the shopper's own photo held in memory for the session, **nothing
  persisted or uploaded beyond the vision call that already happens.**
- 📋 **THE FULL QUEUE, IN ORDER, LIVES IN `docs/PASS3-HANDOFF.md` §14**, with §13 holding that
  session's findings in full.

### Infrastructure state

- ⚠️ **`server/.env` ON THIS BOX HAS REAL SUPABASE CREDENTIALS AND A PLACEHOLDER MODEL KEY. THE
  TWO ARE NOT THE SAME "WALL".** Measured 2026-08-10: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  are live (the evidence query runs), while `ANTHROPIC_API_KEY` is **byte-identical to
  `.env.example`'s `sk-ant-xxxxx`** and returns `401 invalid x-api-key`. `USDA_API_KEY` and both
  Stripe keys are **empty strings**. **So anything whose behaviour depends on a model call cannot
  be verified locally** — prompt changes are testable only by asserting on the prompt text, plus
  the real endpoint on production. `docs/CATEGORY-CAPTURE.md` says "the wall is down", which is
  true of the DB and **only** the DB; read as "this box can do live things now" it is wrong in
  the expensive direction.

- ⚠️ **One migration outstanding: `push_tokens`** (`supabase/push_tokens.sql`), deferred with Expo
  push. Code degrades gracefully without it. Everything else is applied — full audit in
  `docs/SCHEMA-AUDIT.md`.
  **`counter_cards` is at 85 rows as of 2026-08-10: 82 curated + 3 generated**
  (`gen_guanciale_worth_buying`, `gen_goat_meat_quality`, `gen_live_fermented_foods`). ⚠️ **A
  generated row is written by the pipeline and never appears in a diff — re-count it here, do not
  carry it forward.** This line said "81 + 1" for eight days while two more were live.
- ⚠️ **ACCOUNTS GATE REVENUE, AND THE RAIL THAT WILL CARRY THEM IS SIGN IN WITH APPLE — NOT
  PHONE.** Corrected 2026-08-11; this entry previously read as a phone-provider checklist and
  sent readers to finish a 10DLC registration nothing is waiting on. See **Phone sign-in**,
  which is **DORMANT, not pending**.
  **Measured live, same day:** `external_phone_enabled: true` (this file said it was
  outstanding), `external_email_enabled: false` (correct, and it stays), **`apple: false`** —
  so the Apple provider is **not enabled yet** and no iOS shopper can authenticate today
  either. That is `kristy-ios/docs/ios-specs/siwa-config-runbook.md` **Track B**, in progress.
  ⚠️ **UNTIL TRACK B LANDS THERE ARE NO ACCOUNTS ON ANY RAIL, so anything gated on an account
  — every purchase — is unreachable regardless of how much of it is built.** Two `auth.users`
  rows exist, both unconfirmed, neither ever signed in.

---

## Companion docs

| File | What it is |
| --- | --- |
| `docs/DECISIONS.md` | **The account behind every rule in Load-bearing decisions** — the incident, the measurement, the superseded version. |
| `docs/VERIFYING.md` | **The account behind every rule in Verifying** — all five members of the findings family in full. |
| `docs/OPEN-ITEMS.md` | **Open items in full**, including everything closed, with the driven-live evidence. |
| `VOICE_SPEC.md` | The voice rule, in full. Still enforced in all six model prompts. |
| `VISION.md` | Character direction. Deliberately post-mechanics, largely unbuilt. |
| `README.md` | How the thing runs: setup, endpoints, data flow. |
| `BARCODE_COVERAGE.md` | Provider options assessed, none integrated. A decision doc. |
| `docs/PASS3-HANDOFF.md` | §14 is the full queue in order; §13 is that session's findings. |
| `docs/SCHEMA-AUDIT.md` | Live schema compared against the migration files. |
| `docs/CATEGORY-CAPTURE.md` | The category-capture proposal, held. |
| `docs/ATTACH-BUCKET.md` | The attach-bucket proposal, with the measured counts. Not written. |
| `mobile/docs/LAUNCH_CHECKLIST.md` | Unfinished App Store submission work. |

⚠️ **THIS FILE HAS A CONTEXT BUDGET AND IT IS LOAD-BEARING.** On 2026-08-10 it reached 156,456
characters against a **150,000-character limit** and its tail — the last 85 lines, ending inside
Open items — **stopped loading.** That is this file's own findings-family defect turned on the file:
a rule that is not in context does not apply, and **its absence is invisible from the inside**, so
nothing reports it and every session after it is quietly working from a shorter file than it thinks.

**Keep it under 100,000 characters.** When a section grows past its share, the split is always the
same one: **the RULE stays here, the ACCOUNT moves to `docs/`.** Check with `wc -c CLAUDE.md`.

One-shot task specs are deleted once shipped; the reasoning worth keeping lives above.
