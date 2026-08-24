# CLAUDE.md — Kristy

Branch: `main`. This file is the **current state** of the product and the rules that
bind every change to it. It must survive a `/clear`. It is not a task log: when a
decision stops being load-bearing, delete it from here.

---

## WORKING DISCIPLINE — read before touching anything

**Every rule here was paid for. The incidents, the measurements and the superseded versions are
in `docs/WORKING-DISCIPLINE.md`. Read the account before you change a rule; the rule alone is
enough to obey one.**

**Claude Code runs here over SSH, from Windows into a rented Scaleway Mac mini, and sessions
drop mid-task with no warning.** When one does, the conversation is gone and **every file
already written to disk survives**. Report → approve → commit is backwards for that reality: it
puts the one durable act last.

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
  It has cost two files, rewritten from scratch. **The order is commit, then plant, then
  revert.** `git stash` is not the fix either — it takes the test you are trying to run along
  with the source you are trying to break, and a suite that then runs zero tests reports
  **success**, which is the empty-collection defect wearing a green tick.
- **Never end a turn with anything untracked. Ever.** `git add -A`, never `git commit -a` —
  `-a` does not add untracked files, and that is precisely how a commit titled for the trips
  feature shipped while its two source files stayed untracked for a day. Run
  `node server/scripts/commitGuard.js`.
- **The four-step verify is not a formality.** A push has reported success in this project while
  the remote had not moved, and the keychain error that accompanies it appears on successful
  pushes too — so the error text cannot distinguish them and neither can the exit code. Only
  reading content back off the remote can: `git rev-parse HEAD` → `git reflog` →
  `git ls-remote origin main` → **read a file back from the remote and diff it against local.**

### ⚠️ THE PUSH STEP IS THE ONE STEP THIS REPO CANNOT TAKE ON REFLEX

**`main` here is production and pushing publishes, in about a minute** — Vercel for the client,
Railway for the server, no staging gate. And `main` currently carries **deliberately unpushed
commits** (see **Open items**). So in this repo `git push` is a *publish*, and pushing "to be
safe" ships a feature that is being held on purpose, along with whatever else is ahead.

**Commit always — that is what a dropped session threatens. Push to `main` only when the turn's
work is meant to go live**, and never merely to satisfy the rule above. When work is committed
and deliberately unpushed, **say so in the report** rather than leaving "ahead N" for the next
session to discover and helpfully resolve.

⚠️ **BUT `git push` IS NOT THE ONLY PUBLISH CHANNEL, AND THE HOLD ONLY COVERS ONE OF THEM.**
`node server/scripts/migrateCounterCards.js` writes the corpus straight to the live
`counter_cards` table. It needs no push, no deploy and no approval from Railway — just the
credentials in `server/.env`. **So for anything whose only artifact is card content, "unpushed"
does not imply "not live".** A KB edit has served text to production shoppers while its commit
sat on `origin/held` and not on `origin/main` — undeployed by every measure git can report.
That is the two-step act working as designed (**the KB is the source of record, the table is
what ships**), and it is *why* a KB edit is safe to commit onto a held stack. **The inference it
breaks is the natural one:** `origin/main..HEAD` tells you what code is held and **nothing**
about what a shopper is reading.

**The practical rule:** a commit that touches only `kristy_perimeter_kb.json` publishes when the
migration runs, so **say in the report whether it has**, the same way an unpushed commit is
reported. **The two states are independent and both need stating: *committed / pushed* is the
code, *migrated / not* is the corpus.** The card commits already say `Not migrated.` in their
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

**Why it exists:** committing protects work from a dropped session. It does nothing about
**losing the machine** — and this runs on a rented Mac mini reached over SSH.

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
  -- BUT IF A SHOOT IS OUTSTANDING, REPORT THE UI COUNT FROM THE
    LAST RECORDED RUN AND SAY SO. DO NOT RE-RUN IT. One suite run
    makes ~23 attaches against a 20/hour bucket with a 63-minute
    recovery, so this line and "shoot once, on a clean bucket" are
    the same act against the same budget -- and obeying this one
    first has already broken that one. The count is a number in a
    document; the bucket is the scarce thing. (2026-08-20: it cost
    the 18:55 re-shoot.)
- run kristy-ios Tools/checks/runners_compile.sh -- the swiftc drivers
  decay silently and three of three had (kristy-ios CLAUDE.md 1.8i)
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
deliberately held commits. The reflex this block installs is the exact reflex the section above
forbids. Commit everything, always; push `kristy-ios`, push `main:held`, and leave `main` alone
unless the turn's work is meant to go live.

📎 **A twin of this block lives in `kristy-ios/CLAUDE.md`** — a session starting in either repo
has to find it. **Two copies is the shape that produced the category-capture error** (one entry
stated in two documents, both wrong, for two days), so if you change one, change both, and
prefer deleting a copy over letting them disagree.

---

## THIS REPO HAS TWO HALVES AND THEY HAVE DIFFERENT RULES

**The product is now one iOS client (`kristy-ios`) talking to the server in this repo.** What
lives here splits cleanly in two, and conflating them is how a frozen file gets edited and a
live route gets changed by accident.

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
The brand is **`Brand/tokens.json` in `kristy-ios`**, and that file is now the source of truth
for every colour in the product. Nothing writes to `tokens.js` again. **It moved because
freezing it had built a guaranteed failure into a check** — `kristy-ios` validates its whole
asset catalog against the brand (`Tools/checks/palette_mirror.sh`), so with the brand in a
frozen file the next colour authored on iOS could not be recorded, and the check would then fail
on a colour that legitimately *is* part of the brand. **A check whose only escape hatch is
editing a frozen file is a check that gets disabled.**

- `tokens.js` still ships to `kristyapproved.com` and the values are unchanged, so **nothing
  breaks**.
- **The three iOS-authored colours in it are a SNAPSHOT, not a live mirror** — `brassFill`,
  `brassFillInk` and `surfaceLifted`. **That was the last mirroring; the route is closed.**
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
gate, and it carries **deliberately unpushed commits** — so a server change made during iOS work
publishes unreviewed, on push, because it looked small.

⚠️ **THE THIRD REASON USED TO BE "NODE IS NOT INSTALLED ON THIS MACHINE" AND IT IS NO LONGER
TRUE.** Node is installed and the full server suite runs here. **The rule is unchanged and the
reason was never only that tests could not run** — it is that a route change riding in on an iOS
prompt gets no scope and no review before it deploys. Server changes are *testable* now; they
are still separately proposed and separately approved.

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

1. ⛔ **OVERTURNED BY THE OWNER, 2026-08-24 — ON iOS ONLY. THE APP COMES OFF DARK STOCK
   AND GOES ONTO PAPER.** This rule read *"Reuse the locked brand. Never invent."* and it
   **no longer binds `kristy-ios`**. Warm paper ground `#F5F1E6`, green-black ink, and
   **green / ochre / orange as the food ladder every shopper already reads off packaging**;
   **`Fraunces` replaces Playfair Display Italic and Newsreader**; and ⚠️ **the near-black
   forest green and the brass are NOT deleted — they CONCENTRATE into the seal's plate and
   appear nowhere else.** Brass is **forbidden off the plate**: it measures 2.08:1 on paper,
   which is not a low-contrast accent but an invisible one.
   **The ruling, every value, the build order: `kristy-ios/docs/ios-specs/paper.md`, whose
   §0 is the premise every other section derives from.**
   ⚠️ **RECORDED IN THREE PLACES, ALL THREE OR NONE** (§9): `kristy-ios/Brand/tokens.json`
   `_stance`, `kristy-ios/CLAUDE.md`, and here. ⚠️ **`palette_mirror.sh` NEEDS NO CHANGE AND
   MUST NOT BE LOOSENED** — it checks the catalog against the brand file and both moved together.
   **STILL BINDING:** the frozen `client/src` keeps the old brand and `lib/tokens.js` its
   values — **this reversal changes no byte there.** **The VOICE rule is untouched**; what
   changed is *which serif* and *where the boundary sits* (the do line crosses to it).
   ⛔ **And "never invent" still binds every colour authored from here on** — the reversal
   licensed **one ruled palette, not open season.**

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
   claim is wrong.** Both enforced by `counterCardLint.js` over the **whole** corpus, curated and
   generated. **The count is stated once, in Infrastructure state** — it drifted here for days
   because three places held it.

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
  `kristy_ingredient_knowledge_base.json` (74 entries, measured 2026-08-19, same on both
  branches) scores products — it is the only thing the verdict engine sees.
  `kristy_perimeter_kb.json` answers *questions* about the counter and is **never** fed to the
  engine; **its count is stated once, in Infrastructure state.**
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

**Swaps**
- ⚠️ **THE INGREDIENT-LEVEL SWAP IS NOT A PRODUCT RECOMMENDATION. It is cut from the scan
  card.** `genericSwap` answers *"what do I use instead of this ingredient"* — a kitchen
  question, rendered to someone holding a sealed package in an aisle. **The field is still sent
  and still decoded** — deleting it client-side would be a decoder that cannot see its subject.
  Its one legitimate home is the unbuilt ingredient page.
- **THE REPLACEMENT IS SAME CATEGORY, BETTER VERSION. A bad bar swaps for a good bar** — not
  for steak, not for "eat a whole food instead". **The standard lives in the pick, not in
  refusing to answer.**
- ⏳ **THE CATALOG IS THE PREREQUISITE. Do not build the swap engine before the rows exist.**
  The category field lands first (it cannot be backfilled) and the feature waits.
  Proposal: `docs/CATEGORY-CAPTURE.md`.

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
- ⚠️ **SCOPE HAS BEEN WRONG IN ONE DIRECTION EVERY TIME — too tight, never too loose.**
  **When in doubt here, admit and let the downstream filters refuse**: a wrongly-admitted
  question costs one discarded model call; a wrongly-refused one tells a shopper their question
  does not belong, on the surface built to win them.
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
- **Record measured numbers, not characterizations.**
- **ALIAS AUTHORING DIFFERS BY SURFACE: QUESTIONS FOR ASK, BARE NOUNS FOR LIST.** An alias is
  matched by whole-phrase containment, and a shopper writing a list types `tomatoes`. Every
  card needs both. **This defect has shipped five consecutive times.**
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
- **A SPENT INSTRUCTION IS DEMOTED BY SIZE, NEVER BY OPACITY.** `shop.mjs` computes contrast from
  RENDERED colour, folding in every ancestor opacity, so a fade reintroduced anywhere above fails.
- **ADVANCING IS FREE SCROLL, AND THE ACTIVE SECTION IS THE ONE FILLING THE MOST SCREEN** — not
  the last section whose top crossed the viewport top, which a collapsed section breaks.
- **EVERY BRANCH OUT OF SHOP MODE IS AN OVERLAY, NEVER A NAVIGATION.** It is never unmounted, so
  there is nothing to restore. A test forbids `setMoment` inside `ShopMode.jsx`. The chat ask is
  additionally withheld in shop mode on its own merits.
- **A SCAN IN SHOP MODE ACTS ON THE LIST IN FRONT OF THE SHOPPER.** `rowMatch.js` is deliberately
  conservative: a missed match costs one extra row, a WRONG match ticks something never bought.
  ⚠️ **The one-word over-match is FIXED IN SWIFT ONLY and `rowMatch.js` keeps it, deliberately.**
  The fix is the PRODUCT'S HEAD NOUN, not a length floor. **Do not "finish the job" by editing
  `rowMatch.js`: it is in the frozen `client/src`, and the divergence is the recorded decision.**
- **THE SCREEN WAKE LOCK IS SHOP MODE ONLY, AND THE RE-ACQUIRE IS THE FEATURE.** The browser
  releases it whenever the document hides, so acquire-once code passes every test ever written
  for it and dies at the first notification. **Every rejection is silent.**

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
- ⚠️ **KRISTY CARRIES ANYTHING AND JUDGES ONLY FOOD.**
  - **A non-food row goes on the list.** Trailing group, no card, no do line, no attachment.
    **Her silence is honest** — it is what makes the rows she *does* speak on visibly the food ones.
  - **She never scores, flags, approves or swaps a non-food item.** Scanned, the answer is
    *"that isn't something Kristy reads."*
  - **Compose may never refuse to add what a shopper asked for, and may never explain why it
    declined.** Both halves were breaking in production on a prompt-only defect with a prompt-only
    fix. **One prompt, three call sites** (list, chat, guest), so it cannot be half-fixed. Pinned in
    `listCompose.test.js` — the old wording is asserted **absent**, not just the new wording present.
  - ⚠️ **The silence is the feature, so do not "improve" it later** with a household KB, a generic
    tidiness note, or an eyebrow reading "no guidance". Each turns an honest absence into a weak claim.
- ⚠️ **THE SCOPE BOUNDARY: food and food-adjacent only.** Future scope, if any: cookware, storage,
  water filters, foil, parchment — the things food *touches*. **NOT household cleaners. NOT
  cosmetics. NOT general grocery.** A boundary on the product, not a backlog.
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
  measured at nearly zero: the input already carries the context. **The measurement is
  `docs/LIST-CREATION-AUDIT.md` §C** — the same sentence composed twice, bare and with the full
  profile, produced lists that barely differed. **A rule that says *quote it* has to say where.**
  **The corpus is trustworthy
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

**The ambient line — fixed per surface, never rotated**
- **A LINE THAT CHANGES EVERY LOAD IS DECORATION. A FIXED LINE BECOMES WHAT THAT SURFACE SAYS.**
- **NO SHARED POOL.** Each surface that earns one gets its OWN line, about what THAT surface is for.
- ⚠️ **THE TEST IS "IS THERE AN ACTION HERE", NOT "IS THE SURFACE QUIET."** **The empty dashboard is
  the quietest screen in the app and must NEVER carry one** — the single thing a shopper came to do
  is sitting on it.
- **Approved, and the only qualifying surface in the iOS client — the empty Haul:** *"Finish a trip
  and it lands here. Next week starts from what you actually bought."*
- ⚠️ **NEVER in shop mode, on the scan sheet, or on any surface a shopper reads while standing in a
  store.**
- **The three existing lines are WEB-ONLY.** iOS renders none — only the *contextual* isms on the
  scan card, which are a different thing.

**Demo and failure**
- **Demo must never fabricate, and never under-report.** It reads the real public endpoints and keeps
  a fallback only for its actual purpose: no backend at all. **Fake data is never the safer failure.**
- A missing env var **names itself**; three layers catch a bad deploy (null client, React error
  boundary, and the inline boot guard in `app.html` — the only one that can catch a
  module-evaluation crash). `VITE_API_URL` is required in a production build.

**Phone sign-in — ⛔ DEAD PRODUCT-WIDE, RULED 2026-08-19**

*Account — the measured provider states, the Bird parallel, the reversal it overturns, and the
objection it answers rather than overrules: `docs/DECISIONS.md`.*

- ⛔ **RULED: PHONE SIGN-IN IS DEAD PRODUCT-WIDE — NOT "superseded on iOS", NOT "dormant".**
  This **reverses the dormant-not-deleted ruling that stood here**, and the reversal is the
  load-bearing part: a session working from the overturned version defends the SMS text on the
  legal pages as a live disclosure. **It is not.** Settled by three measurements, not by
  argument: **the provider is OFF** (`phone: false`, cache-busted 2026-08-18), **nobody has ever
  signed in on any rail**, and **`client/src` is frozen and the web client becomes a landing page**.
- ⚠️ **THE CODE IS NOT DELETED AND THAT IS NOT A CONTRADICTION.** `Auth.jsx`'s
  `signInWithOtp({ phone })` stays where it is — **frozen, not endorsed.** The ruling is about
  what the PRODUCT does and what its pages may claim. **Do not open the frozen client to finish
  this ruling**; there is nothing there to finish.
- ⚠️ **WHAT THE REVERSAL LICENSED IS ALREADY DONE: `/privacy` AND `/terms` NO LONGER DESCRIBE AN
  SMS PRACTICE.** With the provider off, a policy asserting a collection that cannot occur is
  worse than silence. Both pages now say Kristy collects no phone numbers and sends no SMS.
  **The "DO NOT DELETE THE SMS SECTIONS" notes in both files are superseded and must not be
  restored**; each file carries the ruling in their place.
- ⛔ **Do not re-add those sentences to pass a review while the provider is off** — that puts a false
  collection statement back on a live page to satisfy a review of a rail nothing uses. The deleted
  sentences were the required A2P 10DLC elements and **the cost is accepted, not overlooked**: a
  dead rail needs no registration, so it is **moot and should be withdrawn.** ✅ **The owner took
  the withdrawal as their own item, 2026-08-19** — not a repo task, nothing here is blocked on it.
  Recovery, if the rail ever revives, is from git history **per file**, **and the two files worded
  the consent sentence differently on purpose**, so a revival copies from history rather than from
  one file.
- **BIRD IS DELETED, and do not bring it back.** **Dead code that describes an abandoned decision is
  worse than no code: it is documentation that lies.**
- ⚠️ **THE SECOND RAIL IS EMAIL, IT IS ON, AND THAT REVERSES THE RULE THAT USED TO SIT HERE.**
  Measured live 2026-08-18, cache-busted: **`email: true`**, `apple: true`, `phone: false`,
  `mailer_autoconfirm: true`. The old rule read *"No second auth rail — Supabase has
  `email: false` and it stays that way"*, so a session finding the provider on would read it as
  drift and turn it off. **It is deliberate: the email rail is blocker H in
  `kristy-ios/docs/PURCHASING.md` §7.0 and it is the only prerequisite of the restore-transfer
  proof (§7.3.8).** Apple stays the primary rail; email exists to prove the transfer.
- ⚠️ **`mailer_autoconfirm: true` IS A SEPARATE SWITCH AND IT IS STILL ON** — so any
  password/`signUp` path would confirm an address nobody proved they own. **OTP is fine
  (possession of the code is the proof); a `signUp` path is not.** Nothing ships one today,
  which is why this is a note and not a defect.

**Legal pages — SERVED TO THE PUBLIC, AND THE ACCOUNT NO LONGER LIVES IN THEM**

*Every ruling behind these pages — phone sign-in, the retired 10DLC rules and their recovery
procedure, the delete door, the publication evidence: `docs/LEGAL-PAGE-RULINGS.md`.*

- `/privacy` and `/terms` are **static pages in `client/public/`**, rewritten to clean URLs in both
  `vercel.json` and the vite middleware so dev, preview and production agree about the URL.
- ⚠️ **A SERVED PAGE IS NOT A SOURCE FILE, AND "EACH FILE CARRIES ITS RULING" DOES NOT APPLY TO
  ONE.** That rule is good and unchanged **for files nobody outside the project reads**. These are
  read by App Review and by anyone who opens source, and they carried the provider measurements and
  the state of a Twilio registration. **Nothing in them was false; the audience was wrong, and
  false is not the test for a served page.** Moved to `docs/LEGAL-PAGE-RULINGS.md` 2026-08-19,
  verbatim in its appendix. **Each page keeps a ONE-LINE POINTER and nothing else.**
- ⚠️ **THE SAME RULE NOW BINDS `client/public/landing.html`, 2026-08-19.** It printed the app's
  internal component map in comments on the public front door. **Nothing was false; the audience
  was wrong.** Moved to `docs/LANDING-PAGE-PROVENANCE.md`, pointers left in place, **comment-only
  so the rendered page is byte-identical.** ⛔ **No repo path, component filename or token
  identifier goes back into that file.** ✅ **RULED 2026-08-19: ITS POSITIONING COMMENTS STAY, AND
  THAT IS NOW SETTLED RATHER THAN DEFERRED.** The doc had left it open as a proposal; **the owner
  closed it — anyone who cares reads the positioning off the RENDERED page in ten seconds, so
  removing the comments buys nothing.** ⛔ **Do not re-propose it, and do not strip them as a side
  effect of some later edit.**
- ⛔ **DO NOT WRITE REASONING BACK INTO THESE PAGES.** Not a measurement, not a provider state, not
  a business fact, not a "why we removed X". **If a session editing the page needs to know it, the
  pointer is what it needs to find.** ✅ Side effect worth keeping: the two comments each said
  *"if you change one, change both"* — the twin-copy shape this repo has been burned by. **One doc
  and two identical pointers cannot disagree.**
- ⛔ **THE SMS SECTIONS ARE GONE, 2026-08-19. DO NOT RE-ADD THEM TO PASS A REVIEW WHILE THE
  PROVIDER IS OFF** — a false collection statement on a live page, for a registration for a rail
  nothing uses. Both pages state Kristy collects no phone numbers and sends no SMS. **The
  unbroken-line/805 rules are RETIRED, not deleted** — recovery procedure in the doc, and it is
  recovery **from `9355a39`**, per file, because the two wordings differed on purpose.
- **The SMS consent line in `SignInForm` is in the frozen `client/src` and stays there** — frozen,
  not endorsed. **Do not open the frozen client to finish this ruling.**
- ⛔ **`/privacy` CLAIMS NO DELETE DOOR ON THE WEBSITE, AND DO NOT RESTORE ONE.** The iPhone app is
  the only route (`DeleteAccountSection.swift` → `DELETE /api/account`); the web door is
  unreachable twice over, measured. Deletion is carved out of the scope paragraph **by name**.
  ⚠️ **This becomes wrong again the day the web client gets a working sign-in.**
- ✅ **PUBLISHED AND VERIFIED SERVED, 2026-08-19**, cherry-picked past the hold (`9355a39` +
  `293a63f`), verified **by FETCHING** on both `kristyapproved.com` and the `.vercel.app` alias.
  ⚠️ **THAT VERIFICATION IS NOW ONE COMMIT STALE, DELIBERATELY, AND HERE IS THE PRECISE STATE:
  the comment move is COMMITTED AND UNPUSHED, so the served bytes still carry the old comments.**
  **The pages a shopper or a reviewer READS are byte-identical to what is committed** — proven by
  stripping comments from both files and diffing against `HEAD`, identical — so the divergence is
  invisible content only. **Re-verified 2026-08-19 on all three files, and the strip must cover
  HTML *and* CSS comments** — `landing.html`'s pointer lives in a `/* */` block inside `<style>`,
  so an HTML-only strip reports a false difference. **It publishes on the next push of these
  files, and the fetch-verify must be re-run then.**
  ⏸ ✅ **ITS GATE CLEARED 2026-08-20 — THE `hello@` MAILBOX RECEIVES — AND IT IS STILL NOT
  PUSHED.** The comment move's own gate is open; **the stack it sits on is not.** The import route
  above it is still held, **a stack is pushed as a stack**, and ⚠️ **a cleared gate is not an
  approval.** **Do not push these files to "finish the fetch-verify"** — the verify is the
  *consequence* of the push, never a reason for one, and the pages a reviewer reads are already
  correct. **If this move is wanted live before the import route is, cherry-pick it past the
  hold** — and the rebase afterwards is not optional.

**Money**

⚠️ **THE PRICING MODEL IS LOCKED AND NOTHING BELOW IT IS BUILT. THE RULES IN THIS SECTION
DESCRIBE WHAT SHIPS; THE MODEL DESCRIBES WHAT WAS RULED, AND THE TWO DISAGREE ON NEARLY EVERY
POINT.** Account, the five answers and the five open decisions: `docs/PRICING-MODEL.md`.
**Do not read a rule below as superseded until the work lands — every one of them is live.**

*The trial and the count — ⚠️ THE FULL RULE SET LIVES IN `docs/PRICING-MODEL.md` §0–§3a*

⛔ **READ IT BEFORE TOUCHING THE TRIAL, THE TRIP COUNT, THE ASK OR THE ENTITLEMENT.** It moved out
of this file 2026-08-19 because **it governs work that is entirely unbuilt and mostly client-side**,
so it was costing every session context for a change almost none of them make. **Moving it did not
soften it** — the rules are unchanged and still binding, and the digest below is a summary, **never
the authority**. The five that bind a change to *this repo* are kept here in full:

- **After the trial the COUNTER STAYS FREE**: full cards, the ask, scanning. **Making a list
  and walking a trip are members only.** ⚠️ **THE PAID BOUNDARY INVERTS** — the depth becomes
  free and the list becomes paid, which retires `DEPTH_FIELDS`, `summarize()`, the read meter,
  the teaser and the essentials' *reason*. ⚠️ **THE HAUL IS FREE TOO**, and **what stays locked
  is SEEDING** — *free* means READABLE, not that its doors open.
- ⚠️ **NO PARTIAL LIST, EVER.** Not one free item, not the list without cards, not a limited
  trip. **The moment the list works at all for free the trial stops meaning anything and the
  model collapses back into freemium.**
- **THE COUNTER CARRIES NO ASK, ANYWHERE.** It is free as a conversion argument, not as
  generosity: a locked app gets deleted and a deleted app never converts.
- ⚠️ **`evaluatePremium` TAKES ZERO CHANGE** — a trip count is not a subscription, and putting one
  in it breaks the `is_premium()` SQL mirror that nothing enforces. Reconciliation at the ask is
  `POST /trips/import` and the rule is **MAX AND CAP AT 2 —
  `max(server, min(2, max(device, server)))`, never subtract, never re-arm.**
  **The asymmetry decides it: a dodge costs $5.99, a false denial costs a paying customer.**
- ⚠️ **NOBODY CAN BUY ANYTHING TODAY, UNDER ANY MODEL, AND THIS OUTRANKS THE MODEL.**
  ⛔ **WHAT ACTUALLY BLOCKS IT IS THE ACCOUNT, AND ONLY THE ACCOUNT** — `canPurchase` is
  `identity == .member`, every real visitor is a guest, and **Sign in with Apple has never
  completed one token exchange.** So **one real sign-in is upstream of all of it.** ✅ The
  RevenueCat adapter **landed 2026-08-15**; **do not read this bullet as "build the adapter" — it
  is built, and rebuilding it is the cost of leaving the line wrong.**

*The paid boundary as it ships today*
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
- ⚠️ **THE ESSENTIALS NEVER REORDER. MARK THE ONES ON THIS SHOPPER'S LIST; KEEP AUTHORED ORDER.**
  `ESSENTIALS` is authored **two per section** so the shelf stays balanced, and a sort destroys that
  silently — **nothing could fail, because the property belongs to the authored list.** And position
  is what a shelf is for. **Membership and order are the same editorial decision and both stay in
  version control.** Marking needs no new stored state.
- **THE TEASER SHIPS GEOMETRY, NEVER WORDS.** The real first check in full, then true CHARACTER
  LENGTHS faded out, then true counts. Sending the withheld text would leak a third of every card in
  the same change that stops leaking all of it.
- **`free_reads_used` is its own counter, NOT the `free_notes_used` pool.** Signed-out shoppers are
  metered client-side in localStorage — an IP-keyed meter would break the counter's no-personal-data
  claim to enforce a limit a cleared storage defeats anyway.
- **GUESTS ARE OFFERED NO PLAN BUTTONS** (`purchasable={false}`) — buying needs an account.
  **Restore the buttons the day sign-in works.**
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

*Prices, the trial door and the budgets*
- **$5.99/month, $44.99/year.** ✅ Already the shipped constants in all three clients.
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

### The findings family — six members, one shape

**A check reports success because it cannot see the thing it is checking.** Recognise the shape;
`docs/VERIFYING.md` has all six in full.

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
6. ⚠️ **THE FIRST ONE POINTED AT A DELIVERABLE RATHER THAN A TEST, AND IT WOULD HAVE SHIPPED TO
   THE APP STORE.** The slot-1 store screenshot came back with **every row uncarded** — four runs
   inside forty-five minutes had spent the `/guest/list/attach` bucket. **Nothing failed.** The
   capture succeeded, the geometry was clean, the status bar read 9:41, and the artifact argued
   that Kristy is a to-do app. **A test blind to its subject goes green; a DELIVERABLE blind to
   its subject looks FINISHED**, and a finished-looking artifact is reviewed for polish, not for
   whether its subject is present. **So a shot whose whole argument is content must ASSERT the
   content and skip loudly when it is missing** — `requireCards`, and **the eyebrow is the tell**,
   because it renders only where a card attached.
   ⚠️ **The generalisation, and it is the reason this is its own member: ASK WHAT THE ARTIFACT
   WOULD LOOK LIKE IF THE THING IT ARGUES WERE ABSENT. When the answer is "fine", the emptiness IS
   the defect and nothing downstream can see it** — no exit code, no assertion and no reviewer's
   eye is looking for a thing that was never there. **Absence is what an artifact is worst at
   reporting**, which is exactly the family's shape aimed one step further downstream than the
   other five reach.
   ⚠️ **AND ITS TRAP IS OPERATIONAL: iterating on the runner and shooting the deliverable are the
   SAME ACT here**, so every debugging run spends the budget the real run needs. **Shoot once, on
   a clean bucket.**

### Rules with teeth

- ⚠️ **A PIPELINE'S EXIT CODE BELONGS TO ITS LAST COMMAND. THE DURABLE FIX IS `set -o pipefail`,
  AND IT IS NOT `$PIPESTATUS`.** This is the `osxkeychain`/`tail` trap in a second costume:
  `xcodebuild ... | tail` reported **exit 0 having built nothing**.
  **Measured on this box, and the bash reflex fails silently here:** in zsh `$PIPESTATUS` is
  **empty** (it is bash-only), so a `${PIPESTATUS[0]}` guard copied from bash
  **guards nothing while looking like a guard**; zsh spells it `$pipestatus`, lowercase, and
  **clobbers it on the very next command**. `set -o pipefail` works in **both** shells and needs
  no variable to survive. Use it, or drop the pipe and read the log from a file.
  ⚠️ **AND THE EXIT CODE IS ONLY HALF. A GREEN STATUS IS NOT EVIDENCE THE WORK HAPPENED — ASSERT
  ON THE ARTIFACT.** `pipefail` would have caught this one; it would **not** catch a build that
  exits 0 having compiled nothing. **Name the destination from `xcodebuild -showdestinations` and
  check the built `.app` is newer than the run.** This is the findings family at the command line:
  the check reported success because it could not see its subject.
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
| `cd server && npm test` | **647 pass, 0 fail, on `main` (the held stack), re-measured 2026-08-18; 633 on `origin/main`, measured 2026-08-10 and not re-run since.** ⚠️ **TWO NUMBERS, AND THE SMALLER ONE IS NOT A REGRESSION** — the 11-test delta is the held import route's own tests (`trips.test.js`), which by definition are not on the deployed branch. A bare count here has been stale five times — **record only a number you actually ran, say which branch ran it, and date each number separately.** |
| `cd client && npx vite build` | Compiles. Not that anything renders. |
| `node server/scripts/commitGuard.js` | No file this commit claims is untracked. |
| `node server/scripts/claudeMdSplitCheck.js <ref>` | A `CLAUDE.md` split removed nothing: every **bold** directive at `<ref>` still appears verbatim in `CLAUDE.md` ∪ `docs/`. ⚠️ **It proves nothing left the CORPUS and CANNOT tell you a rule left the always-loaded FILE.** Exits non-zero on a gap, and **refuses to report success on an empty extraction.** |
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
  shipped: **edit the table in `docs/do-lines-review.md`, re-run `scripts/buildDoLines.js`, commit
  both.** ⚠️ **NAME THE TABLE, ALWAYS** — the markdown is the authored source and the JSON is
  generated from it, so "edit the table" without the path sends an editor to the generated file,
  where `doLines.test.js` will fail them for a disagreement they were told to create.
- If a git write fails with "permission denied", it's OneDrive locking `.git` — retry. **Never
  hand-edit the KB or committed files to recover.**

---

## Open items

**This is the live board — status and the rule each item imposes. Closed items, the driven-live
evidence and the reasoning behind each are in `docs/OPEN-ITEMS.md`.**
⚠️ **A ✅ ENTRY HERE IS A ONE-LINE TOMBSTONE PLUS ANY RULE IT LEFT BEHIND, NOT AN ACCOUNT.** Its
whole job is to stop a session re-deriving something already settled; **the evidence is in the
doc, and a tombstone that grows an account back is this file's budget defect returning.**

### Live defects

- ✅ **CLOSED 2026-08-20 — `hello@kristyapproved.com` RECEIVES AND THE OWNER READS IT.** Owner's
  confirmation is the whole evidence and that is the standard this item always set: ⛔ **the only
  check that settles it is sending mail to it, which is an outward-facing act and is the owner's.**
  The pages were correct throughout and **no page was edited to work around it.**
  ⚠️ **THE RULE IT LEAVES: A BOUNCING SUPPORT ADDRESS IS WORSE THAN NO ADDRESS** — `/support`
  promises a reply within two business days and App Review checks the support URL. **Re-check the
  mailbox still receives before any App Store submission**; an MX record does not prove it, and
  this item spent a day narrowed on exactly that distinction.
  ⚠️ **THIS CLEARS GATE (b) ONLY — IT RELEASES NOTHING BY ITSELF.** See **Held deliberately**: the
  stack carries two holds with different gates and **a stack is pushed as a stack.**

- ✅ **SHIPPED AND VERIFIED LIVE: ONE PREDICATE — `nothingConfirmsFood`**, on `origin/main` as
  `22b35a8`; driven on production through the guest path, all five cases. The rule it leaves:
  **withholding refuses to ENDORSE; it never silences a warning** — `universalLayer` stays intact
  and flags stand.
- ❓ ⚠️ **THE UPSTREAM QUESTION IS STILL OPEN, AND THE PREDICATE CONTAINS IT RATHER THAN ANSWERING
  IT.** The engine still reads a seven-token mineral analysis as a clean ingredient list and scores
  it zero; what changed is that the seal is withheld and the withheld read prints. **The misread is
  contained at the seal, not fixed at the read.** ⏳ Open as a QUESTION: what should a thin or
  non-ingredient list produce? **Nothing is proposed, deliberately.**
- 🐞 ⚠️ **THE CATEGORY UPGRADE CANNOT REACH A ROW ALREADY IN `scanned_products`.** A cache hit
  returns early in `scanExtract.js` with the row's **stored** category and never re-fetches OFF, so
  `categoryFromAisle` never runs again; the upgrade branch written for exactly this lives on the
  **retain** path, which the cache hit bypasses.
  ⚠️ **THE ORDERING CONSTRAINT, AND IT IS THE WHOLE FIX: THE RE-READ MUST ROUTE THROUGH
  `retainProduct`, NOT MERELY RE-FETCH.** A version stamp that decides "re-fetch this row" and uses
  the answer in memory fixes one response and never the row. ⚠️ **IT WOULD SHIP AS DECORATION AND
  EVERY CHECK ON IT WOULD PASS**, because the response carries the right category and that is all an
  end-to-end assertion looks at — the row is the subject and nothing reads it back. **The cache-hit
  branch has to fall through to the fetch-and-retain path.**
  ✅ **APPROVED AS DESIGNED; its prerequisite (the migration) is applied. Still not written: it
  touches the store's READ path, which is separately scoped server work and needs its own prompt.**
  The approved shape, recorded so it is not re-derived — full reasoning in `docs/OPEN-ITEMS.md`:
  - **A VERSION STAMP, NOT A TTL AND NOT "IS THE CATEGORY `other`".**
  - ⚠️ **THE BUMP RULE IS AN ASYMMETRY AND IT IS THE PART THAT IS EASY TO GET BACKWARDS. Bump on
    `other`. Bump on not-found. DO NOT bump on a network failure.** Stamping a timeout records
    "we checked" for a check that never happened, retiring the row from re-checking forever.
  - ⚠️ **THE FAILURE DIRECTION IS SAFE ONLY WHILE THE ROW STAYS STALE.** **The safe direction
    belongs to the bug, not to the fix.**
  - ✅ **It is still safe to land first, measured** — the document half catches Sidi Ali.
- ✅ **PART 3 — THE CATEGORY EXEMPTION — SHIPPED.** `FOOD_CATEGORIES = new Set(['water'])`, read by
  `nothingConfirmsFood`, on `origin/main` inside `22b35a8`; pinned in `foodPredicate.test.js`.
  ⚠️ **COMPUTE IT, DO NOT READ IT:**
  `git show origin/main:server/lib/verdictEngine.js | grep -n 'FOOD_CATEGORIES = '`.
  Two rules it leaves live:
  ⚠️ **WHAT IS STILL HELD IS ONLY ITS REACH** — no production row is exempt today, because the
  waters still read `category: other` (the cache finding above). The exemption is **live and
  unreachable**; the cache fix turns it on and nothing has to be decided first.
  ⚠️ **THE PATTERN IS THE PLURAL `waters`, NOT THE BARE WORD.** Matching is `includes`, so bare
  `water` also eats `watermelons`, `water chestnuts` and `water biscuits`. **Part 3 lets a category
  past a fail-closed gate, so a watermelon in `water` is a wrong approval.** Asserted in
  `productCategory.test.js`, proven to fail on `watermelons` before being trusted.
- ⚠️ **`unverifiedAsFood` IS STILL NOT ON THE WIRE, AND THAT IS DELIBERATE.** The engine returns it;
  `routes/verdict.js` does not forward it. A client keys off `unverifiedRead` / `stamp` instead — **a
  client cannot fail closed on a field it has never heard of. Do not add it to a decoder expecting it
  to arrive.** What the routes carry is `readSwap`, **one helper across all four send sites**,
  because this file has already lost a field across those four. **A rule that must be retyped four
  times is a rule that will be applied three times.**

### Held deliberately — do not "discover" these and land them

- ⏸ **THE UNPUSHED COMMITS ON `main` ARE DELIBERATE, AND THERE ARE NOW TWO HOLDS ON ONE STACK WITH
  DIFFERENT GATES — DO NOT COLLAPSE THEM INTO ONE.** What is held is **(a) the IMPORT ROUTE** and
  **(b) the legal/landing COMMENT MOVE**. Nothing can
  reach `POST /api/trips/import` (`requireAuth`, and no rail has ever produced an account), and
  pushing this repo deploys. **Full reasoning: `kristy-ios/docs/SWIFT-HANDOFF.md` §3 item 0 — one
  queue, not two. Do not push it to be helpful.**
  ✅ **(b)'s GATE CLEARED 2026-08-20 — the `hello@` mailbox receives** (rule and reasoning under
  **Legal pages**). ⚠️ **AND `main` HAS NOT MOVED, WHICH IS THIS ENTRY'S OWN RULE ARRIVING ON
  SCHEDULE.** ⚠️ **A stack is pushed as a stack, so clearing ONE gate releases NOTHING.** (a) —
  the import route — is still held on its own terms, so **both gates are not open and `main`
  stays where it is**; **an urgent item above them cherry-picks past, per the rule below.**
  ⚠️ **Its test condition cleared and it is still held.** A cleared blocker is not an approval; it
  gets reviewed against what the iOS client actually needs before it ships.
  ⚠️ **DO NOT IDENTIFY HELD WORK BY HASH OR BY "AHEAD N" — neither survives a split, a rebase or a
  partial push, and this entry has been wrong with both. Only the SUBJECT is stable.** Compute it:

  ```
  git log --oneline --reverse origin/main..HEAD
  ```

  **When something above the hold is urgent, CHERRY-PICK IT PAST — that is the move, and it is why
  stack timestamps interleave with `origin/main`'s.** ⚠️ **A reader reconstructing this history from
  commit dates alone will get the order wrong.**
  ⚠️ **AND THE REBASE AFTERWARDS IS NOT OPTIONAL.** A cherry-pick leaves the ORIGINAL commits on the
  stack under different hashes, so the command above goes on naming subjects that are already live —
  **this entry's own failure, reproduced by the fix for it, within the hour.** Prove the rebased tip
  is content-identical to the pre-rebase tip before force-updating `main:held`. **A cherry-pick past
  the hold is not finished until the stack stops claiming what it shipped.**
  📋 **The lesson, which is this repo's own:** **two documents stated it, which is
  precisely why a reader had no way to notice.** **Computing it is only a fix if someone computes it.**

### Standing risks, not urgent

- ⏳ **THE GUEST BUDGET IS A PROPERTY OF UPTIME, NOT OF THE SHOPPER.** All four buckets in
  `guestRate.js` are module-level `Map`s in one process, so **every deploy hands every IP a full
  budget back** and Railway redeploys on every push to `main`. **It cannot be measured** —
  `rateLimited` records a hit when it is NOT limited, so asking whether budget remains spends the
  slot that answers. **It becomes real the moment a second instance exists.**

### Queued

**Each item below is a POINTER PLUS ITS ONE TRAP. The reasoning is in the named doc — read it
before starting, not after.**

- ⏳ ⚠️ **NOTHING REPORTS A COMPLETED-TRIP COUNT, SO A SIGNED-IN SHOPPER'S METER IS THE DEVICE'S —
  AND A DEVICE METER IS RESETTABLE BY REINSTALL.** The fix is **`completedTrips` on the response of
  `GET /api/trips/seedable`** — `select count(*) where status='completed'`, not stored, one field on
  a door the client already calls. Spec: `docs/PRICING-MODEL.md` §3a.
  ⚠️ **THAT RESET IS NOT THE ACCEPTED LOOPHOLE AND MUST NOT BE FILED UNDER IT.** The accepted one is
  scoped to **PRE-ACCOUNT** trips; past sign-in there is an account, a row, and a server that could
  answer, so the same reset **was not ruled** and is a defect this route closes. The other half is
  measured, not predicted: with a server trip counted, **the ask fires one trip late** — it fails
  toward the shopper. **Both halves close together when this route lands.**
  ✅ **`max(server, …)` is already written for it**, and the client half is built and pinned
  (`TripAllowance.reconciled`, `GuestTripBook.tripsCompleted`, `Tools/triploop`). **Separately
  proposed server work**, downstream of one completed Sign in with Apple token exchange.
- 🐞 ⏳ **`/guest/list/attach` IS METERED BY A BUDGET SIZED FOR A DIFFERENT ACT.** It draws
  `cartBuildLimited` — **20/hour, sized for the one cart build a shopper does per trip** — while the
  client attaches on every cold launch carrying uncarded rows and once per added item.
  ⚠️ **A REFUSED ATTACH PRODUCES MORE ATTACHES, NOT FEWER**: `Cart.merge` persists `carded`, so a
  success stops the next launch calling and a refusal leaves every row uncarded for the window.
  **The bucket has positive feedback**, and "re-run on a fresh hour" is weaker than it reads.
  ⚠️ **The iOS suite is the DETECTOR, not the subject** — sizing this for CI would be the same
  mistake one layer along. Counts and the rejected one-liner: `docs/ATTACH-BUCKET.md`. Separately
  proposed server work.
- 🐞 ⏳ **THE AISLE IS DERIVED FROM THE LAST OFF TAG ON A FALSE PREMISE, AND IT THROWS AWAY THE
  ANSWER.** `aisleFromCategories` takes the last `categories_tags` entry as "most specific"; it is
  not a specificity hierarchy, so any product whose last tag is a **dietary** one loses its aisle.
  **This is a category-capture defect, not a water one.** Map from the TAG LIST, most specific
  *mapped* hit — **not** by widening the water patterns to swallow `beverages`.
  Account: `docs/CATEGORY-CAPTURE.md`.
  ⚠️ **THE PREREQUISITE, AND IT IS NOT VISIBLE FROM THE DEFECT: LANDING THIS FIX REMOVES A CATCH THAT
  IS FIRING IN PRODUCTION RIGHT NOW.** Cristaline is `approved` today on a nine-line mineral table
  and the only reason the gate holds it is that its category resolves to `other`. This fix resolves
  it to `water`, which **is exempt**, and the document half does **not** pick it up — measured
  `FIRES = false`. **So: land the `ingredients_lc` guard first, or at minimum drive `3274080005003`
  through the gate as part of this fix and assert the outcome.**
  📎 **The same warning sits at the point of the change**, in `productCategory.js` above the `water`
  patterns — deliberately duplicated. **If you change one, change both.**
- 🐞 ⏳ **OFF PARSES ONE LANGUAGE AND KRISTY READS ANOTHER, SO THE PARSE AND THE TEXT CAN BE DIFFERENT
  DOCUMENTS.** `ingredients_lc` names the language OFF actually parsed; `pickEnglishText` prefers
  English. ⚠️ **THE ENGLISH FIELD IS NOT A TRANSLATION, IT IS A DIFFERENT DOCUMENT** — so a language
  check passes it and the whole language layer is asking the wrong question. **THIS IS THE TWO-LISTS
  DISAGREEMENT ON A NEW AXIS, AND `sameVerdict` IS THE PRECEDENT**; the existing guard **cannot**
  engage, because the second document is a LANGUAGE field it has never looked at.
  ⚠️ **IT IS NOT THE PANEL-GATE TRIGGER AND MUST NOT BE FOLDED INTO IT** — it does not catch Sidi
  Ali, where parse and text agree and are wrong together. **Two products, one symptom, two unrelated
  causes.** In range: every product whose `ingredients_lc` is not `en`.
  ⬆️ **THIS IS A PREREQUISITE, NOT ONLY A DEFECT: THE AISLE FIX IS UNSAFE WITHOUT IT.**
- ✅ **CLOSED 2026-08-19 — the SMS text on `/privacy` and `/terms`.** The ruling came first and went
  the other way: **DEAD PRODUCT-WIDE**, so the work was a deletion rather than the addition this
  entry predicted. Live rules are under **Phone sign-in** and **Legal pages** above; the objection it
  answered rather than overruled is in `docs/OPEN-ITEMS.md`.
  ⚠️ **STILL TRUE AND UNTOUCHED: the support-address gap above.**
- ⏳ **DERIVE A BASELINE FROM THE DEVICE TRIP ARCHIVE.** `buildBaseline` is written, tested and
  correct with a permanently empty input; `GuestTripBook.archive` holds exactly the input shape it
  wants. Run it **in the client** — no server change, no new stored data. **Nothing is proposed to
  consume it yet, and that is deliberate.**
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

**Measured state and its evidence: `docs/OPEN-ITEMS.md`. The rules it imposes:**

- ⚠️ **`server/.env` ON THIS BOX HAS REAL SUPABASE CREDENTIALS AND A PLACEHOLDER MODEL KEY. THE TWO
  ARE NOT THE SAME "WALL".** `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are live; `ANTHROPIC_API_KEY`
  is byte-identical to `.env.example`'s placeholder and returns `401`; `USDA_API_KEY` and both Stripe
  keys are **empty strings**. **So anything whose behaviour depends on a model call cannot be verified
  locally** — prompt changes are testable only by asserting on the prompt text, plus the real endpoint
  on production. **"The wall is down" is true of the DB and only the DB.**
- ⚠️ **One migration outstanding: `push_tokens`** (`supabase/push_tokens.sql`), deferred with Expo
  push. Code degrades gracefully without it. Everything else is applied — `docs/SCHEMA-AUDIT.md`.
- ⚠️ **THE CORPUS COUNT LIVES HERE AND NOWHERE ELSE, AND A GENERATED ROW IS WRITTEN BY THE PIPELINE
  AND NEVER APPEARS IN A DIFF — RE-COUNT IT, DO NOT CARRY THE NUMBER FORWARD.** This line said
  "81 + 1" for eight days while two more were live. **Measured 2026-08-19, all three by query or
  by parse:**
  - **LIVE `counter_cards`: 85 rows — 82 `curated` + 3 `generated`.**
  - **`kristy_perimeter_kb.json`: 83 entries on `main` (the held stack), 82 on `origin/main`.**
  - ⚠️ **THOSE TWO ARE NOT IN CONFLICT AND THE GAP IS THE POINT: THE 83RD CARD IS COMMITTED AND
    NOT MIGRATED** (`8ca62ab`, the first brand-naming card), so the KB — the source of record —
    is one ahead of the table, which is what ships. **This is the committed/migrated pair doing
    exactly what it is for.** A session finding 83 ≠ 82 has found the migration queue, not a bug.
- ⚠️ **ACCOUNTS GATE REVENUE, AND THE RAIL THAT WILL CARRY THEM IS SIGN IN WITH APPLE — NOT PHONE.**
  See **Phone sign-in**, which is **DEAD PRODUCT-WIDE, not pending**.
  ⚠️ **`GET /auth/v1/settings` IS STRUCTURALLY BLIND TO THE CLIENT-ID QUESTION** — a boolean per
  provider and **no client id at all**, so it can prove the provider is on and can never prove the
  bundle id under Client IDs is right. **The first thing that tests that is a completed token
  exchange**, and that has never happened.
  ⚠️ **THERE ARE STILL NO ACCOUNTS ON ANY RAIL**, so anything gated on an account — every purchase —
  is unreachable regardless of how much of it is built. **The blocker is no longer a dashboard.**
- 🐞 ⚠️ **THE SIMULATOR CANNOT PROVE THE TOKEN EXCHANGE: THE SIMULATOR DEVICE HAS NO APPLE ACCOUNT,
  AND IT DOES NOT INHERIT THE MAC'S.** The tap reaches `ASAuthorizationController` and the system
  answers with a SpringBoard alert. **NO TOKEN IS MINTED, SO NOTHING DOWNSTREAM IS TESTED.**
  ⚠️ **`defaults read MobileMeAccounts` IS THE WRONG CHECK AND IT LIES IN THE EXPENSIVE DIRECTION** —
  it returns "domain does not exist", which is **iCloud** unconfigured, not the Apple Account missing.
  **Read the account store.** Fix: `kristy-ios/docs/ios-specs/siwa-config-runbook.md`.
  ✅ **The "second blocker" — the SIWA entitlement missing — is WITHDRAWN, measured. It is present**;
  it was filed on device-signing artifacts a simulator build never produces.
  ⚠️ **IT IS THE FINDINGS FAMILY COMMITTED WHILE DOCUMENTING THE FINDINGS FAMILY** — a check that
  could not see its subject, filed as an instance of checks that cannot see their subject, and
  believable precisely *because* the repo already had two real ones. **Confirm the artifact is the
  right one before filing a third.** So the account alert is the only known simulator blocker.

## Companion docs

| File | What it is |
| --- | --- |
| `docs/WORKING-DISCIPLINE.md` | **The account behind every rule in Working discipline** — the incidents, the measurements, the superseded versions. |
| `docs/DECISIONS.md` | **The account behind every rule in Load-bearing decisions** — the incident, the measurement, the superseded version, in the same order. |
| `docs/VERIFYING.md` | **The account behind every rule in Verifying** — all five members of the findings family in full. |
| `docs/OPEN-ITEMS.md` | **Open items in full**, including everything closed, with the driven-live evidence. |
| `docs/PRICING-MODEL.md` | **The locked pricing model, and NOTHING in it is built.** Includes *The trial and the count*, §0–§3a, which moved out of `CLAUDE.md` 2026-08-19. |
| `VOICE_SPEC.md` | The voice rule, in full. Enforced in all six model prompts. |
| `VISION.md` | Character direction. Deliberately post-mechanics, largely unbuilt. |
| `README.md` | How the thing runs: setup, endpoints, data flow. |
| `BARCODE_COVERAGE.md` | Provider options assessed, none integrated. A decision doc. |
| `docs/PASS3-HANDOFF.md` | §14 is the full queue in order; §13 is that session's findings. |
| `docs/SCHEMA-AUDIT.md` | Live schema compared against the migration files. |
| `docs/LANDING-PAGE-PROVENANCE.md` | The account behind `client/public/landing.html` — the removed comments verbatim, and the positioning comments left in on purpose. |
| `docs/LEGAL-PAGE-RULINGS.md` | The account behind `/privacy` and `/terms` — the phone ruling, the retired 10DLC rules and how to recover them, the delete door. |
| `docs/CATEGORY-CAPTURE.md` | The category-capture proposal, held. |
| `docs/ATTACH-BUCKET.md` | The attach-bucket proposal, with the measured counts. Not written. |
| `docs/LIST-CREATION-AUDIT.md` | §C is the measurement the anti-personalization rule tells you to quote. |
| `docs/do-lines-review.md` | The **authored** do-line table. `server/lib/doLines.json` is generated from it. |
| `docs/APP-STORE-LISTING.md` | **Every App Store Connect field for 1.0**, counts measured. Names the six screenshots, the retakes, and the one app change the privacy answers still need. |
| `mobile/docs/LAUNCH_CHECKLIST.md` | Unfinished App Store submission work. |

⚠️ **THIS FILE HAS A CONTEXT BUDGET AND IT IS LOAD-BEARING.** On 2026-08-10 it reached 156,456
characters against a **150,000-character limit** and its tail — the last 85 lines, ending inside
Open items — **stopped loading.** That is this file's own findings-family defect turned on the file:
a rule that is not in context does not apply, and **its absence is invisible from the inside**, so
nothing reports it and every session after it is quietly working from a shorter file than it thinks.

**Keep it under 100,000 characters.** When a section grows past its share, the split is always the
same one: **the RULE stays here, the ACCOUNT moves to `docs/`.** Check with `wc -c CLAUDE.md`.

⚠️ **THAT SPLIT IS AT ITS FLOOR AND THE NUMBER IS MEASURED.** The third split (2026-08-19,
99,590 → 94,049) rewrote the four largest blocks and found **every account it could move had
already been moved by the second one**: Working discipline yielded **4%**, Legal pages **5%**.
**Only 26,736 characters sit in blocks longer than 600, and those are the densest blocks in the
file.** ⛔ **So do not open this file to "condense it again" — that lever is spent, and a session
that pulls it anyway starts deleting rules to hit a number.**

⚠️ **THE ONLY LEVER LEFT IS MOVING A WHOLE RULE-BLOCK OUT OF ALWAYS-LOADED CONTEXT, WHICH IS A
PRODUCT DECISION, NOT AN EDITORIAL ONE.** The test that licensed the one such move: **the block
governs work that is entirely unbuilt, and whoever builds it opens the doc anyway.** That is why
*The trial and the count* now lives in `docs/PRICING-MODEL.md` §0–§3a behind a pointer. **A block
governing shipped code fails that test however large it is** — the frozen `client/src` rules are
not candidates either, because `client/test/` still runs them. **Ask before moving a second one.**

📎 **VERIFY A SPLIT, DO NOT ASSERT IT — and it is a script, because computing it is only a fix if
someone computes it:** `node server/scripts/claudeMdSplitCheck.js <ref-before-the-split>`. It ran
564/564 here and **caught four real gaps**, all a rewritten table row where a bold boundary moved.
⚠️ **It proves nothing left the CORPUS; it cannot tell you a rule left this FILE.**

One-shot task specs are deleted once shipped; the reasoning worth keeping lives above.
