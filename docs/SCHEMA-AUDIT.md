# Schema audit — repo migrations vs. live Supabase

> ## ⚠️ RE-RUN 2026-08-10 — READ THIS BLOCK, NOT THE 2026-07-31 TABLE BELOW
>
> **The table further down is the 2026-07-31 run and it is stale in six places.** It is kept
> because the *method* is still right and the trial-row incident still needs recording — but
> every presence and every row count in it has moved. The current table is in
> **"The table, as of 2026-08-10"** immediately below.
>
> **`supabase/product_category.sql` IS APPLIED. That question is settled.** It was applied via
> the dashboard on 2026-08-10 and verified here the same day: `category`, `category_raw` and
> `nutrition_panel` are all three live on `scanned_products` (15 columns, up from 12), **and
> rows are being retained through them** — the two most recent rows carry
> `category='other'`, a populated `category_raw` and `nutrition_panel='absent'`.
>
> ⚠️ **This document not mentioning the migration was not a cosmetic gap.** `CLAUDE.md`'s
> category-capture entry carried an **ordering rule** — apply the SQL *before* the code
> deploys, or every retain logs `column does not exist` and **silently stops retaining** — and
> the one document whose job is to compare live schema against the migration files was silent
> on the newest migration. The code deployed first. It is settled now, and settled the safe
> way, but the ordering was checked *after* the fact rather than before it.

> **Updated 2026-07-31, later the same day.** `counter_cards` and `counter_gaps` (plus the
> `counter_gap_feed` view) were applied via the dashboard and verified present with columns
> matching their files; `counter_cards` now holds 80 rows. `push_tokens` remains absent,
> deliberately — Expo push is still deferred.
>
> **`schema.sql` was also re-run, and it fired its closing backfill.** The one live auth
> user gained a `subscriptions` row (`trialing`, `promo`, created 16:41Z, trial ends
> 2026-08-07). That is the entire blast radius — every other table's row count is unchanged.
> See "The trial row" below. `supabase/counter_gaps.sql` exists precisely so this does not
> have to happen again.

Run **2026-07-31**, read-only, against the project in `server/.env`
(`ugybalmsmkvoemxnhpwn.supabase.co`). Nothing was written and no rows were modified.

Prompted by a divergence between recorded and actual state: `push_tokens` was recorded
somewhere as applied and is not. So this audits **every** table in `supabase/`, not the
three that a spot check had already flagged.

## Method

Column-level truth comes from PostgREST's OpenAPI document (`GET /rest/v1/` with
`Accept: application/openapi+json`), which lists every table in the exposed schema with
each column's name and Postgres type. That is compared against the columns parsed out of
`supabase/*.sql` — both the `create table` bodies and the additive
`alter table … add column if not exists` lines, which is where most of `user_goals` lives.

Presence is confirmed a second, independent way: a real `select … limit 1`, never a
`head:true` count. PostgREST answers 204 / null count / no error for a table that does not
exist, which reads as "present, empty" — the exact failure mode `coverageStats` was
hardened against. A missing table here returns **404 `PGRST205`**, unambiguously.

## The table, as of 2026-08-10

Read-only, same method as below (PostgREST OpenAPI for columns, a real `select` with
`count=exact` for presence and rows). **Every table the repo declares is applied except
`push_tokens`.**

| table | file | live | cols | rows | notes |
| --- | --- | --- | --- | --- | --- |
| `scanned_products` | `schema.sql` + **`product_category.sql`** | ✅ | 15 | 15 | **The three new columns are present and being written.** 12 → 15: `category`, `category_raw`, `nutrition_panel`. |
| `counter_cards` | `counter_cards.sql` | ✅ | 27 | **85** | 82 curated + 3 generated, matching `CLAUDE.md`. Was ABSENT at the last audit. |
| `counter_gaps` | `counter_gaps.sql` | ✅ | 7 | **694** | Was ABSENT at the last audit. The authoring backlog is real and large. |
| `counter_gap_feed` | `schema.sql` (view) | ✅ | 6 | 35 | Lands with `counter_gaps`. |
| `trips` | `trips.sql` | ✅ | 9 | 0 | Applied since the last audit. 0 rows — the import route is held and sign-in is blocked, so nothing can write one. |
| `scan_events` | `scan_events.sql` | ✅ | 16 | 0 | Applied since the last audit. |
| `ingredient_conflicts` | `ingredient_conflicts.sql` | ✅ | 11 | 0 | Applied since the last audit. |
| `user_goals` | `schema.sql` | ✅ | **35** | 2 | 34 → 35 columns and 1 → 2 rows since the last audit. |
| `push_tokens` | `push_tokens.sql` | ❌ **ABSENT** | n/a | n/a | **The one outstanding migration**, deferred with Expo push. Code degrades gracefully. Unchanged. |
| `shopping_lists` | `schema.sql` | ✅ | 5 | 0 | Survives as the shopping *profile*. |
| `subscriptions` | `schema.sql` | ✅ | 10 | **0** | **Measured 0 — the trial row recorded below is no longer there.** The recommendation below was to delete it; this run can only say the row is gone, not by what act. |
| `verdicts` | `verdicts.sql` | ✅ | 6 | 0 | |
| `haul_scans` | `schema.sql` | ✅ | 7 | 0 | |
| `chat_messages` | `schema.sql` | ✅ | 6 | 0 | |
| `meal_logs` · `weight_logs` · `weekly_summaries` | `schema.sql` | ✅ | 11 · 6 · 9 | 0 | Known-dead pipelines, deliberately untouched. |

**What moved since 2026-07-31:** `counter_cards`, `counter_gaps`, `counter_gap_feed`, `trips`,
`scan_events` and `ingredient_conflicts` all went from absent to live; `scanned_products` gained
three columns and its first 15 rows; `user_goals` gained a column and a row. **`push_tokens` is
the only thing still outstanding, and that is deliberate.**

⚠️ **STILL NOT COVERED, AND IT MATTERS MORE NOW THAN IT DID:** this method reads columns, not
**indexes**. `product_category.sql` creates a partial index (`scanned_products_category_idx`) and
`trips.sql` holds the **partial unique index that enforces one active trip per shopper** — the
decision `CLAUDE.md` records as being an index "rather than a code path" precisely because the
failure mode is concurrency. Neither is verified here. Confirming them needs SQL against the
database, not the REST surface. See the closing section.

---

## The table — 2026-07-31 run, SUPERSEDED, kept for the method and the trial-row record

| table | in repo | in live | columns match | notes |
| --- | --- | --- | --- | --- |
| `scanned_products` | `schema.sql` | ✅ | ✅ 12/12 | 0 rows. No production capture yet, so `coverageStats.fromVision` is 0. |
| `user_goals` | `schema.sql` | ✅ | ✅ 34/34 | Every later column applied — see the column note below. 1 row. |
| `coach_goals` | `schema.sql` | ✅ | ✅ | **Not a table** — a `text[]` column on `user_goals`. Present. |
| `constraints` | `schema.sql` | ✅ | ✅ | **Not a table** — a `text[]` column on `user_goals`. Present. |
| `shopping_lists` | `schema.sql` | ✅ | ✅ 5/5 | 0 rows. |
| `subscriptions` | `schema.sql` | ✅ | ✅ 10/10 | 0 rows, and the one live auth user has no row — see "Not drift, but worth knowing". |
| `meal_logs` | `schema.sql` | ✅ | ✅ 11/11 | 0 rows. Known-dead pipeline; table deliberately untouched. |
| `push_tokens` | `push_tokens.sql` | ❌ **ABSENT** | n/a | **The divergence.** Never applied. `CLAUDE.md` had it right; the recollection that it was applied was wrong. |
| `verdicts` | `verdicts.sql` | ✅ | ✅ 6/6 | 0 rows. |
| `counter_gaps` | `schema.sql` | ❌ **ABSENT** | n/a | The counter gap log captures nothing until this lands. Code degrades gracefully. |
| `counter_cards` | `counter_cards.sql` | ❌ **ABSENT** | n/a | **Blocks the Pass 2 write-mode migration.** Apply before `migrateCounterCards.js` runs for real. |
| `haul_scans` | `schema.sql` | ✅ | ✅ 7/7 | 0 rows. |
| `weight_logs` | `schema.sql` | ✅ | ✅ 6/6 | 0 rows. Known-dead pipeline. |
| `chat_messages` | `schema.sql` | ✅ | ✅ 6/6 | 0 rows. |
| `weekly_summaries` | `schema.sql` | ✅ | ✅ 9/9 | 0 rows. Known-dead pipeline. |

**Non-table objects**

| object | kind | in live | notes |
| --- | --- | --- | --- |
| `counter_gap_feed` | view | ❌ **ABSENT** | Defined in `schema.sql`; depends on `counter_gaps`, so it lands with it. `gapFeed` aggregates in JS over the same rows, so nothing is blocked on the view. |
| `is_premium(uuid)` | function | ✅ | RPC probe returns 200. |
| `handle_new_user()` + `on_auth_user_created` | trigger | ✅ (inferred) | The one auth user has a matching `user_goals` row it never wrote itself. Not directly readable over REST. |

## Drift found — 2026-07-31 run, SUPERSEDED

> **2026-08-10: two of the three absences below have been applied** (`counter_cards`,
> `counter_gaps`). `push_tokens` is the only one left. Still **no column-level drift on any
> table that exists** — every live table matches its migration file, including
> `scanned_products` against `product_category.sql`.

**None on any table that exists.** Every live table matches its migration file
column-for-column, on both name and type. No extra columns, no missing columns, no type
mismatches, and no live table that the repo does not declare.

The only divergence is **absence**, in three tables:

- `counter_cards` — new with Pass 2, never applied.
- `counter_gaps` — outstanding since before Pass 2.
- `push_tokens` — outstanding since before Pass 2, **and misrecorded as applied.**

`user_goals` deserves an explicit line because it is the table most likely to have
drifted and did not: all 34 columns are present, including every one added by a later
`alter` — `coach_goal`, `coach_goals`, `non_negotiables`, `focuses`, `constraints`,
`free_notes_used`, `macro_tracking`, and the six weight/TDEE columns.

## The trial row

`schema.sql` ends with a backfill that inserts a 7-day trialing subscription for every
user in `auth.users` at the moment it runs. Re-running the file to pick up a missing table
fired it, and the one live account now holds a trial it never opened.

**This matters more than one row suggests, because `ensureTrial` is idempotent by
existence** (`server/lib/subscription.js`): if a subscription row exists in any state, it
is returned untouched. So the account has now permanently consumed its single trial without
ever tapping `POST /api/subscription/trial`. It reads premium until 2026-08-07 and
"trial ended — upgrade" forever after, and the product can never grant it another.

That is the exact failure `CLAUDE.md` already records once — "coupling them silently spent
a 7-day trial on a casual goal-tap and killed the 3-free-notes taste mechanic" — arriving
through a different side door.

**Recommendation: delete the row.** Deleting is clean and reversible. `getSubscription`
returns null, `evaluatePremium(null)` is false, and `subscriptionSummary(null)` reports
`status: 'none'` with `trialExpired: false` — the normal pre-trial state, not a lapsed one.
Nothing references `subscriptions.id`, and the row carries `provider: 'promo'` with both
Stripe ids null, so there is no billing object to orphan. Tapping the real trial door
afterwards grants a genuine 7 days.

Keep it only if the intent is a premium account for testing — in which case it is worth
setting deliberately rather than inheriting it from a migration.

> **2026-08-10: `subscriptions` measures 0 rows, so the row is gone.** The incident above stays
> on the record — the backfill that produced it is still at the bottom of `schema.sql`, so
> re-running that file would produce it again.

## Not drift, but worth knowing

> ⚠️ **2026-08-10: BOTH PARAGRAPHS BELOW ARE OUT OF DATE.** `scanned_products` holds 15 rows,
> `counter_gaps` holds 694 and `counter_cards` holds 85 — production has captured a great deal
> since. In particular *"`fromVision` is 0 because nothing has been scanned"* no longer holds:
> the 15 rows split **6 `vision` / 9 `off` / 0 `store`**, so the moat has six rows in it and
> `coverageStats.fromVision` is 6. The paragraphs are kept because the *reasoning* about
> what an empty table does and does not prove is still the right reasoning.

**The one live auth user has no `subscriptions` row.** `auth.users` holds a single
phone-registered account created 2026-07-27; `subscriptions` is empty. The backfill at the
bottom of `schema.sql` inserts a trialing row for every auth user *existing at the time it
runs*, so a user created afterwards gets nothing, and the trial has one explicit door
(`POST /api/subscription/trial`) which this account never opened. Consistent with the
design; flagged only because an empty `subscriptions` next to a live user looks like drift
and is not.

**Every table except `user_goals` holds zero rows.** Production has captured nothing yet.
That is the expected reading for an app with one registered account, but it also means the
growth loops have no live evidence behind them — `fromVision` is 0 because nothing has been
scanned, not because the loop is broken.

## What this audit does not cover

PostgREST's OpenAPI document exposes columns and types. It does **not** expose RLS policies,
indexes, check constraints, or triggers, so none of those were verified here — a table can
match this audit column-for-column and still be missing its unique index or its RLS policy.
Confirming those needs SQL against the database directly, not the REST surface.

---

## 2026-08-16 — the first CHECK constraint ever read live, and it had drifted

⚠️ **`subscriptions.provider` LIVE-REJECTS `'apple'`, WHICH IS THE VALUE EVERY REVENUECAT
WEBHOOK WRITES.** Measured, not inferred:

```
cd server && node --use-system-ca scripts/subscriptionConstraints.livetest.js
```

| column | live accepts | `schema.sql` declares | verdict |
| --- | --- | --- | --- |
| `status` | `trialing, active, past_due, canceled, expired` | identical | ✅ matches |
| `provider` | `stripe, promo, **revenuecat**` | `stripe, **apple**, promo` | ❌ **drifted both ways** |

**The section above says this audit cannot see constraints. That is still true of its
method** — the OpenAPI document exposes no CHECK. What settled it was a *behavioural* probe:
offer each candidate value to the real column under an ephemeral user and record what the
table takes. It is the same move as the self-heal loop being proven by behaviour rather than
by reading the source.

⚠️ **THE CONTROL IS WHY THE READING IS TRUSTWORTHY.** An accept-only probe cannot distinguish
"the constraint is wide" from "there is no constraint" — it reports the widest possible good
news in exactly the case where the guard is gone. Both columns were therefore also offered a
junk value that **must** be rejected, and both rejected it, so a CHECK is live and enforcing
on each. Without that control this table would have been an assertion over a collection the
probe could not see.

### What it costs, and the direction

`routes/revenuecat.js:98` writes `provider: 'apple'` on **every** webhook it handles — not
just expirations. So today, with the live constraint as measured, **every RevenueCat webhook
write fails on a CHECK violation**, the handler returns 500, and RevenueCat retries with
backoff until it gives up.

⚠️ **THE CONSEQUENCE IS THE OPPOSITE OF THE ONE THAT WAS FEARED, AND IT IS WORSE.** The
concern on the record was that an `EXPIRATION` event would fail to write and a lapsed
subscriber would keep access. `'expired'` is accepted and always was — that half does not
reproduce. What actually breaks is `INITIAL_PURCHASE`: it cannot write either, so a shopper
who has **just paid** gets no `subscriptions` row, `evaluatePremium(null)` is false, and they
have a free account. Not "someone keeps access they stopped paying for" but "someone pays and
receives nothing", which is the failure that generates refunds and App Review complaints.

**It is not costing money today** — `Purchasing.isAvailable` gates every purchase affordance,
no rail has ever produced an account, and nothing has ever been bought. It is a landmine
armed for the first real transaction, which makes the first sandbox purchase the moment it
fires.

### The fix is the file that says not to run it

`supabase/subscription_status_check.sql` audits the code, concludes the migration is probably
a no-op, and says **run the query first**. The query has now been run and it shows the gap the
file anticipated, so **the file's own contingency is active**: its statements restore `'apple'`
and drop `'revenuecat'`, which is exactly the reconciliation the measurement calls for.

⚠️ **DO NOT READ THAT AS APPROVAL TO RUN IT.** Applying DDL to the live table is separately
proposed and separately approved server work. What changed is only that its premise is settled:
the "probably a no-op" reading is now known to be wrong, and its header should stop saying so.

⚠️ **AND DO NOT `FIX` THIS BY WRITING `'revenuecat'` FROM THE ROUTE INSTEAD.** That is the
cheaper-looking direction and the file already argues it down: `SubscriptionSnapshot.Provider`
decodes an unrecognised value to `.unrecognized`, `hasManagedBilling` is then false, and
`MembershipRow` offers a paying member **"See plans"** instead of **"Manage"** — the door to
their own billing page, missing, for the only shoppers who have paid.

---

## THE SWEEP — EVERY OTHER CHECK CONSTRAINT, AGAINST WHAT THE CODE ACTUALLY EMITS (2026-08-16)

The provider drift was found by reading a live constraint. The obvious next question is whether
the *same class of error* — a vocabulary verified against what an integration is **called**
rather than against what a writer **emits** — sits anywhere else. Swept by enumerating every
`check (… in (…))` in `supabase/*.sql` and then reading every writer that can reach the column.

### ⚠️ THE STRUCTURAL FINDING FIRST: NOTHING IN THE SUITE CHECKS A VALUE LIST AT ALL

`schemaContract.test.js` is the test that would be assumed to cover this, and it does not.
It compares **column names** and explicitly skips constraint bodies — its parser drops any
token matching `^(primary|unique|foreign|check|constraint|exclude)\b`. So a column can be
declared, written, and carry a CHECK whose list disagrees with every value the code produces,
and the suite is green. **Confirmed by grep: no test file in `server/` mentions `'apple'`,
`'stripe'`, `'promo'` or `'revenuecat'` at all.**

`constraintsMirror.test.js` is the right *shape* applied to a different subject — it pins the
onboarding taxonomy across the client/server boundary. Nothing does that for a DB constraint.

**So the provider drift was not missed by an unlucky gap. There is no check of this kind, and
644 passing tests say nothing about any CHECK's value list.**

### The columns, and they are otherwise clean

| column | CHECK declares | what the code emits | verdict |
| --- | --- | --- | --- |
| `subscriptions.status` | trialing, active, past_due, canceled, expired | `ensureTrial`→trialing; `mapStripeStatus`→all five; `mapRevenueCatStatus`→trialing/active/past_due/expired | ✅ live re-measured, matches |
| `subscriptions.provider` | schema.sql: stripe, apple, promo — **LIVE: stripe, promo, revenuecat** | `promo` (ensureTrial), `stripe` (×3 in routes/stripe.js), `apple` (routes/revenuecat.js:98) | 🐞 **the defect** |
| `counter_gaps.outcome` | miss, weak | `logCounterGap` rejects anything else before insert | ✅ |
| `counter_gaps.source` | ask, list | `SOURCES` set in the writer, unknown → `{logged:false}` | ✅ |
| `counter_cards.kind` / `.tier` / `.source` | shelf/home · 4 tiers · curated/generated | `cardToRow` is a pass-through of the corpus | ✅ and **fails loudly** — see below |
| `trips.status` | active, completed, abandoned | all three written as literals in `lib/trips.js` | ✅ |
| `chat_messages.role` | user, ai | every one of the 14 call sites passes `'user'` or `'ai'` | ✅ |

**`'revenuecat'` is written by nothing.** Enumerated across every `upsertSubscription` call site
(4) and every `provider:` literal in `lib/`, `routes/`, `index.js`. It appears only in scripts.

### ⚠️ THE FAILURE MODE IS WHAT SEPARATES THESE, NOT THE VOCABULARY

Two of these tables swallow a CHECK violation and two do not, and that is the property worth
carrying forward — it decides how long a future drift lives before anyone sees it.

- **Loud:** `counter_cards` is written only by `migrateCounterCards.js`, run by hand. A CHECK
  violation is an error in front of the operator, immediately.
- **Loud:** `trips`, `chat_messages` — the error reaches a request.
- ⚠️ **Silent:** `counter_gaps` is fire-and-forget by design (`console.warn`, never thrown, so a
  shopper's answer never waits on the backlog). **A live CHECK drift on that table would stop
  gap logging entirely and nothing would report it** — the authoring backlog would simply go
  quiet, which reads exactly like nobody asking.
- ⚠️ **Silent:** `subscriptions`, via the webhook — the handler 500s and RevenueCat retries into
  a backoff nobody is watching. This is the one that drifted.

### 🐞 THE FALSE WITNESS, AND IT IS IN THIS REPO TODAY

`server/scripts/premium.livetest.js:25`:

```js
ck('RevenueCat/Apple active → premium (same shape, any provider)',
   evaluatePremium({ provider: 'revenuecat', status: 'active', current_period_end: future }));
```

It passes. **It proves nothing, and it is the exact artifact that makes `'revenuecat'` feel
verified.** `evaluatePremium` (lib/subscription.js:42–49) reads `status` and the two date fields
and **never reads `provider`** — so the assertion holds for any string whatsoever, including one
no writer emits and the live table would reject. A check named for the integration, asserting a
value from the integration's name, against a function structurally incapable of disagreeing.

**Change the literal to `'apple'`** — the value the webhook actually writes — and the line stops
being a witness for a vocabulary it cannot see. (Its parenthetical *"any provider"* is true and
is the point: it is a *deliberate* statement that provider is not read, which is fine — what is
not fine is choosing `'revenuecat'` as the sample value.)

### What this sweep did NOT do

⚠️ **Only `subscriptions` has had a live constraint read. Every other row in the table above is
`supabase/*.sql` compared against code** — which is precisely the method that reported
"probably a no-op" and was wrong. `scripts/subscriptionConstraints.livetest.js` is extendable to
the other columns, but it writes probe rows, and for `counter_gaps` / `counter_cards` those are
**shared-pool tables** rather than an ephemeral user's own row. That is a different safety
argument and it is not made here. **Unmeasured, and stated as unmeasured.**
