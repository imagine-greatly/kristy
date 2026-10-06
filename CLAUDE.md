# CLAUDE.md — Kristy

Branch: `main`. State/rules; accounts in companions. Delete a rule here when it stops being load-bearing.

## WORKING DISCIPLINE

*Detail: `docs/WORKING-DISCIPLINE.md`, “WORKING DISCIPLINE”.*

### Commit before reporting
```
git add -A → commit with a real message → push → four-step verify → THEN report
```
- Commit before approval; mid-unit question → commit `wip:` first.
- **Commit first, plant second, revert third.** Checkout restores COMMIT, loses uncommitted work; `git stash` stashes the test too (a suite running zero tests reports success).
- No untracked at turn end: `git add -A`, never `git commit -a`; run `node server/scripts/commitGuard.js`.
- Four-step: `git rev-parse HEAD` → `git reflog` → `git ls-remote origin main` → read remote file and diff local. Exit/keychain text proves nothing.

### One task per session
- ONE task; committed/verified ends session; ~60k resident context: commit, handoff, compact, keep going.
- No continuation prompts (Devon, 2026-10-05): Devon says when to move to a new session. Keep the handoff current so `/compact` is always safe.

### Pushing
- `main`: production Vercel/Railway, ~minute, no staging. Commit always; **push `main` only when the turn's work is meant to go live**. Report committed/unpushed, never “ahead N”.
- MIGRATE: `node server/scripts/migrateCounterCards.js` from `server/` (cwd `.env`) → live `counter_cards` → iOS, no push/deploy. PUSH: file → web (`routes/perimeter.js`). **State both, every time:** code committed/pushed; corpus migrated/not. Card commits: `Not migrated.`
- Off-main → `origin/held`, backup not deploy (preview CORS-blocked). Behind docs: fetch, never reconstruct: `git fetch origin held && git log --oneline --reverse origin/main..origin/held`.
- SSH `osxkeychain` falsely succeeds; `-25308` on successes too. Use `git -c credential.helper='!gh auth git-credential' push origin main:held`; prove via `ls-remote` + remote file diff.

### Scope
One surface/contained unit per prompt. List expected files first; say if others needed.

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

## Two halves, two rule sets

`client/src` frozen, never edited for any reason; deployed at `kristyapproved.com`, behavioural spec/measured decisions: read/cite only. Historical `tokens.js`, last mirroring closed route; brand `kristy-ios/Brand/tokens.json`. Detail: `docs/WORKING-DISCIPLINE.md`, “Two halves, two rule sets”.

`server/` governed: separately propose/approve routes/KB/prompts/lint/tests. iOS stops/asks (route/shape/need), no server edits/Swift workaround. Findings with evidence: `kristy-ios/docs/API-FINDINGS.md`. Node suite runs; scope/review governs. Exempt: docs/this file/unapplied SQL/scoped server work.

## What Kristy is

A **grocery coach for the whole store**: scans vet packaged food, counter answers unpackaged food (meat/fish/eggs/produce/dairy/bulk), cart is center, haul reads the trip.
**Kristy is not a calorie tracker.** No macro cards, meal logging, “logged it” UI or macro chat asides (`macroGuard`).
Account: `docs/DECISIONS.md`, “What Kristy is”.

## Non-negotiables

1. ⛔ **Brand (iOS only): paper, not dark stock.** Ruled 2026-08-24, amended 2026-10-06 (TF4): ground
   is Oat `#E9E2D0`, card is `#FAF7EF`, green-black ink, green / ochre / orange food
   ladder, `Fraunces` for serif. Ruled 2026-10-02: the olive seal (`KristySealCoin`, no words) is
   the logo and app icon, on Toasted; the forest `#14472F` plate no longer carries it (asset
   install pending A2). Brass appears only as struck metal inside the seal artwork, an image
   asset. One gold (2026-10-05): eyebrows, hairlines, listening ring only; never fills,
   buttons or body. No dark scheme, paper only:
   `kristy-ios/docs/ios-specs/paper.md` (§0 premise). Recorded in three places, all three or
   none: `Brand/tokens.json` `_stance`, `kristy-ios/CLAUDE.md`, here. `palette_mirror.sh` must
   not be loosened. The frozen `client/src` keeps the old brand. "Never invent" still binds
   every colour authored from here on.
2. **The claim lock is law.** Health/ingredient claims trace to matched KB; tone only, no new concern/statistic/claim; whitelist before every Kristy-voice call.
3. **No-treatment rule, symmetric.** Food never treats/manages/cures/prevents/lowers risk/causes anything; processing objections, user-set focuses never inferred, medical → doctor.
4. **The stamp is earned.** Seal still, turns only while listening (not Reduce Motion); scan-corner seal iff `stamp` true, else empty.
5. **Never reshape the engine output.** `server/lib/verdictEngine.js` matched shape consumed directly, additive only.
6. **Voice: zero first person.** `VOICE_SPEC.md`: no I/me/my/em-dash asides, half words; rephrase never delete science/concern/standard ownership, except no scan-card tier.
7. **One verdict per headline; accuracy outranks firmness.** TYPE/USE CASE split stays, budget/stock/time retreats; false mechanism = wrong claim (`counterCardLint.js`).
8. **No price, ever.** Budget = cost-conscious selection, relative terms only.
9. **No negative claims about named brands.** Teach label truth.
Detail: `docs/DECISIONS.md`, “Non-negotiables (2–9)”.

## Architecture

- Server (`server/`, Railway) owns KB/matching/tier scoring/claim-locked calls; clients render.
- Never merge KBs: engine `kristy_ingredient_knowledge_base.json` (74 entries); counter `kristy_perimeter_kb.json`, never scored.
- Trust only `CLIENT_ORIGIN`; `main` auto-deploys even without `.vercel/`; check live effects before push.
Web: `docs/DECISIONS.md`, “Architecture”/“The interface”.

## Load-bearing decisions

*Verbatim: `docs/DECISIONS.md`, “Load-bearing decisions” (dashboard/shop/composed row/web ambient/demo/legal).*

### Scoring/lookups
- `matched` concerns only; `affirmed`/`affirmationLayer` affirmations never reverse-match.
- Never KB-match butter/ghee/tallow (clean whole-food fats, regression); margarine own `seed_oil`, never PHO alias.
- `time_tested` food-worth not health; `sanitizeAffirmed` withholds `history`/`why`/`kristy_note`; gluten-/dairy-free advisory; two collisions exact/longest-first.
- `tokenizeIngredients` restores head nouns onto sub-items only oil/fat heads; partial flags stand/`approved` withheld; low confidence miss.
- Camera: one decode/opening, monotonic ticket drops stale response, checksum pre-lookup, `sameGtin` zero-padding.
- `scanned_products`: products, never `user_id`; `off/full > vision/full > vision/partial`; ingredients not judgments, cached hit re-runs engine.
- Self-heal behaviour via injectable Supabase `lookupProduct`/`retainProduct`/`coverageStats`; count `fromVision`; production capture only `scripts/growthLoops.livetest.js`.
- `genericSwap` off scan card, still sent/decoded, for unbuilt ingredient page; same-category better (bar → bar); catalog before swaps (`docs/CATEGORY-CAPTURE.md`).

### The counter
- Free public `optionalAuth`: deterministic KB, no model/stored data/free-chat spend.
- `sanitizeForModel`: seven fields, excludes `cart_pick`/`decision`/`why`.
- Empty match → honest miss not coach; then only `looksLikeCounterQuestion`: subject AND buying intent, cooking veto.
- Bare either/or (`isBareEitherOr`) in both `looksLikeCounterQuestion`/`inScope`; doubt → admit, downstream refuses.
- `isMeaningQuestion`: mean/means VERB/non-filler subject, not noun; `isBareDefinitional` ≤5 words/≤2 content.
- Retrieval floor one alias hit: gate requires `scoreEntries` `aliasScore > 0`; `counterFloor.test.js` pins curated and generated; `CONFIDENT > 2`, `WEAK_MATCH_CEILING` 3, never shared.
- Measured numbers only; ask-question/list-noun aliases both required.
- 3+ `asked_as`/card from questions not card vocabulary; `counterReach.test.js` asks; not done until findable.
- Hub steal → one longer specific alias, never many dangerous short generics.
- Technique `kind='home'`: mechanical, never bodily; no cart; PURCHASE = `shelf`; record deliberate `IMPERATIVE_VERBS` reasoning.
- Claim beyond evidence → narrow truth, gap `watch_out`; verify study; hub do line all arrivals, count exclusions before ship.
- A generated card that owns a subject goes in version control; one restating a curated verdict gets folded; `decision`/`why` from entry material, depth demoted not deleted, free `tier_note` above tap.
- `shortcuts`: only `q`/browsable `id`, no content; missing coverage `thinNote`.
- `counter_gaps`/`gapFeed`: `/perimeter/ask` always, chat/guest only `looksLikeCounterQuestion`; no PERSONAL data: scrub emails/long digits, 160-char cap before insert.

### Trips and lists
- `trips` (`supabase/trips.sql`): many/shopper/one active partial unique index; `signals`/`next_list` stay, `shopping_lists` profile.
- Three statuses; untouched REUSED not archived, completion explicit tap; adopt only “no trips at all”.
- Seed `POST /api/trips/next` only/no `accept`; import `POST /api/trips/import` adopts inside `importGuestTrips`, once/existing trips 409.
- Import: completed only, server `status`, all rows `sanitizeList`, times `[now − 1y, now]`, `started ≤ completed`, echo not store `clientId`; `haul_scans.trip_id` excluded.
- Seed re-match; strip `carded`/`cardSlug`/`tier`/offer set, keep `why`/`perimeterId`/`alt`, no `missed`; haul reads completed, never writes bought rows, `bought` separate.
- Authored `perimeterId` wins, validated; `listMatchProbe.js`: wrong fails/miss reports.
- `stateContradicts`: explicit frozen/canned/dried/fresh; both name state/card only others → veto not score; process alone no subject; `label_terms` falls through like home.
- Sort displayed section; `CATEGORY_SECTION` counter ids/`TRAILING_LABEL` never `LIST_SECTIONS` titles; category fallback/`cardSection` wins; conflicting pick `why` moves; composed names stay (`listBaseline.kept` NAME).
- Carry anything/judge food only: non-food trailing/no card/do line/score/flag/approval/swap; scan “that isn't something Kristy reads”; no household KB/tidiness/“no guidance” eyebrow.
- Compose never refuses additions or explains a decline; one prompt/3 sites; food/food-adjacent only (future at most cookware/storage/filters/foil/parchment, never cleaners/cosmetics/general grocery).
- `applyCompose`: no `user`/`imported` removal unless shopper names item; `attachOffers.offered` flags once, survives `sanitizeList`; a no is permanent and suppresses the item, not just the note; generic offers never typed brands.
- Goals ≤3 adds/≤4 anchors, rebuild optional; quote `docs/LIST-CREATION-AUDIT.md` §C, never re-derive: card SELECTION missing, never authorship.
- Baseline grocery names only; `kept` occurrences not deduped; private memory leaves with shopper, `USER_TABLES` all `auth.users` tables; `productStore`/`counterGaps` never import per-user readers (no aggregate joins).

### Internal/ambient
- `/api/internal/growth`: token 24+ chars or 404; unauthorized 404 not 401; only `coverageStats`/`gapFeed`/`topScannedProducts`, no Kristy brand; null count unavailable, real select proves reachability, `head:true` cannot distinguish missing/empty.
Phone/email rules: companion “Phone sign-in”.
- Ambient fixed/own per surface, never pooled/rotated; requires action, never empty dashboard/shop/scan sheet/in-store; only iOS empty Haul: “Finish a trip and it lands here. Next week starts from what you actually bought.”

### Money
*`docs/PRICING-MODEL.md`: locked/unbuilt; rules live until lands. Read binding §0–§3a before trial/count/ask/entitlement; verbatim companion “Money”.*

- After trial COUNTER FREE (full cards/ask/scans); Ruling F (2026-10-02): lists free (create/edit/compose/seed), shop mode members only (gate: `POST /trips/new`); retire `DEPTH_FIELDS`/`summarize()`/meter/teaser; haul free.
- No partial list ever; counter no ask anywhere; `evaluatePremium` zero change; ask reconciliation `POST /trips/import`: **max and cap at 2 — `max(server, min(2, max(device, server)))`, never subtract, never re-arm.**
- Nobody buys today: `canPurchase` = `identity == .member`, all guests, no SIWA token exchange; RevenueCat built (2026-08-15), never rebuild.
- Today server: free summary (eyebrow/headline/do line/cart pick/tier sentence), scans/unlimited ask/browse/list; paid `why`/`look_for`/`watch_out`/`detail`/`kristy_take`/`labels_decoded`/`sources`, stripped pre-wire `summarize()`/`forViewer()`.
- List free/no save ask; call free/cost depth; never promote `watch_out`, make essential; `tier_note` sentence not chip, ≥5 words/not tier name.
- Eight essentials full/unmetered, `ESSENTIALS` two/section, mark/keep authored order, never reorder; teaser geometry never words; separate `free_reads_used`, signed-out localStorage meter.
- Guests `purchasable={false}` until sign-in works; ask fourth full-read tap, render ACTION required, `UPGRADE_COPY` one key/no chrome.
- Only `CounterAsk` → `askCounter`, only `cardMeter` → `fetchCounterFull`/`spendRead`/`readsSpent`.
- $5.99/month, $44.99/year; price ids config never client; author only `MONTHLY_CENTS`/`ANNUAL_CENTS` in `client/src/lib/pricing.js`, mirrored `mobile/src/lib/pricing.ts`; monthly/saving derived, saving FLOORED; no hardcoded figures elsewhere.
- Price changes → recreate Stripe Prices/update `STRIPE_PRICE_MONTHLY`/`STRIPE_PRICE_ANNUAL`, stale ids silently charge old amount.
- Trial `POST /api/subscription/trial` only, BY EXISTENCE return `subscriptions` row untouched; goal grants nothing; no schema data writes, backfill `supabase/backfill_trials.sql`.
- Sentence cart: free `LIST_COMPOSE_FREE_LIMIT` 12/day, premium exempt, both doors together; over-budget never upsell; guest bucket by model reach not route per HANDLER; scan 30 SCANS/hour ×2 hits, export/assert multiplication.

## Verifying

*Verbatim: `docs/VERIFYING.md`, “Verifying”.*

### Findings family — six members
1. Empty assertions pass: `lib/testGuards.js` `nonEmpty(coll, name, min?)` at collection/module, never loop.
2. Untested boundary = comment: economics/promises → what would go red?
3. Isolated sites fail summed: visitor end-to-end, constant `false`; lifecycle/profile open (`buildBaseline` input empty).
4. Props harness misses production wiring: real call site, loud absence (`Hero` label AND handler).
5. Omitted file goes green: `git add -A`, `commitGuard.js`; `GUARDED` defines untracked problems, never READ scope.
6. Subject-blind artifact looks finished: content assertions/loud skip (`requireCards`), ask appearance without subject; shoot once/clean bucket.

### Rules with teeth
- `set -o pipefail`: last command sets exit; assert artifact (`.app` newer than run), green proves nothing.
- Fetch sources before shipping; memory citation = defect.
- Examples become output: describe defect, never write forbidden phrase/quote live corpus.
- Load-bearing comment invariants need tests.
- Mobile CDP `Emulation.setDeviceMetricsOverride`, never `--window-size`; `getBoundingClientRect`, not eyeball.
- `vite build` compiles dead references; browser suites after splits.

### Commands
| Command | What it proves |
| --- | --- |
| `cd server && npm test` | **730 pass, 0 fail, on `main`, measured 2026-10-01** (`134fa83`). Record only a number you ran, say which branch, date it. |
| `node server/scripts/commitGuard.js` | No claimed file untracked. |
| `node server/scripts/claudeMdSplitCheck.js <ref>` | Bold directives verbatim in corpus, not placement; refuses empty extraction. |
| `node server/scripts/listMatchProbe.js` | Wrong match fails; run after alias/`perimeterId`/matcher changes. |
`client/test/*.mjs`/build rows: companion “The commands”.

### Corpus and schema
- `routes/counter.js` serves `counter_cards`; migrate for iOS/slug upsert; dry-run no credentials/count, diff KB/table first.
- `counterCardLint.js` shape bar; Pass 3 `lintCard` pre-persist.
- Tier notes: no self-reference/shared sentence (`TIER_NOTE_SELF_REFERENCE`); comment `doLines.json`, not KB `decision` (`TIER_NOTE_ORPHANED`), neither = known gap.
- Fold = removal AND delete: `RETIRED` curated/`RETIRED_GENERATED` generated (wrong list no delete, tested); move aliases/repoint shortcuts/grep wider incl prompts.
- Generated promotion: demand/corpus correction not correctness; rising `use_count` → promote; keep ≥1 real row.
- What the code writes must exist in the migrations (`schemaContract.test.js`); section floor 8, deletion shrink cannot pass unchanged.
- Railway root `server/`; `deployBoundary.test.js`: `lib/`/`routes/`/`index.js`; do lines table `docs/do-lines-review.md` → `scripts/buildDoLines.js`, commit both, always name table.
- Git permission denied: OneDrive locks `.git`; retry, never hand-edit KB.

## Open items

Open/closed rules/history: `docs/OPEN-ITEMS.md`, “Open items”.

- ⏳ `completedTrips` on `GET /api/trips/seedable` (`docs/PRICING-MODEL.md` §3a): client half built (`TripAllowance.reconciled`); downstream of one SIWA token exchange.
- ⛔ Do not widen the product-category vocabulary to fix a filing problem (the aisle is decided in `scanExtract.js`).
- Holding a stack: identify held work by SUBJECT (`git log --oneline --reverse origin/main..HEAD`), never by hash or "ahead N". Urgent work cherry-picks past; the rebase afterwards is not optional. A cleared blocker is not an approval.

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
| `docs/WORKING-DISCIPLINE.md` · `DECISIONS.md` · `VERIFYING.md` · `OPEN-ITEMS.md` | Rules/accounts. |
| `docs/PRICING-MODEL.md` | Locked §0–§3a. |
| `VOICE_SPEC.md` · `VISION.md` · `README.md` | Voice · unbuilt character · running. |
| `docs/ROADMAP.md` | Queue. |
| `docs/PASS3-HANDOFF.md` | §13 findings; §14 superseded. |
| `docs/SCHEMA-AUDIT.md` | Schema vs migrations. |
| `docs/LANDING-PAGE-PROVENANCE.md` · `LEGAL-PAGE-RULINGS.md` | Page accounts. |
| `docs/CATEGORY-CAPTURE.md` · `ATTACH-BUCKET.md` · `LIST-CREATION-AUDIT.md` (§C) | Held proposals. |
| `docs/do-lines-review.md` | → `server/lib/doLines.json`. |
| `docs/APP-STORE-LISTING.md` · `mobile/docs/LAUNCH_CHECKLIST.md` · `BARCODE_COVERAGE.md` | Submission/providers (none integrated). |

## This file's budget

**21,000 characters or fewer**: `wc -m CLAUDE.md`, not bytes (`wc -c`). Growth: session rules here, detail in source-section companion; verify `node server/scripts/claudeMdSplitCheck.js <ref-before-the-split>`.
