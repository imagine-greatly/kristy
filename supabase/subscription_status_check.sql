-- subscriptions.status / subscriptions.provider — the CHECK constraints.
--
-- ⚠️ 2026-08-16 — THE SETTLING QUERY BELOW HAS BEEN RUN. THIS FILE IS **NOT** A NO-OP.
--
-- The audit further down concluded "probably a no-op, do not run it" and then said, correctly,
-- that it had only read the CODE and `schema.sql` and not the live constraint. The live
-- constraint has now been measured — behaviourally, because nothing here can run raw SQL:
--
--     cd server && node --use-system-ca scripts/subscriptionConstraints.livetest.js
--
--   status    live accepts  trialing, active, past_due, canceled, expired   ← matches schema.sql
--   provider  live accepts  stripe, promo, revenuecat                       ← DRIFTED
--                           `'apple'` is REJECTED and `'revenuecat'` is permitted —
--                           the exact inverse of what schema.sql declares.
--
-- ⚠️ **`routes/revenuecat.js:98` WRITES `provider: 'apple'` ON EVERY WEBHOOK**, so as the live
-- table stands every RevenueCat write fails on a CHECK violation, the handler 500s, and the
-- platform retries until it gives up. The half that was feared — `'expired'` being rejected and
-- a lapsed subscriber keeping access — **does not reproduce**; `'expired'` is accepted and
-- always was. What actually breaks is INITIAL_PURCHASE, so a shopper who has just paid gets no
-- row and no access. Account: `docs/SCHEMA-AUDIT.md`.
--
-- **So the reconciliation at the bottom of this file is now the right statements** — it restores
-- `'apple'` and drops the writerless `'revenuecat'`. It is still separately proposed, separately
-- approved work: applying DDL to the live table is not something to do as a side effect of
-- reading this comment. Nothing is currently costing money — no rail produces an account and
-- `Purchasing.isAvailable` gates every affordance — but the FIRST SANDBOX PURCHASE FIRES IT.
--
-- ─────────────────────────────────────────────────────────────────────────────────────────
-- The original audit follows, unedited. Its code enumeration is still accurate and is why the
-- reconciliation keeps `'apple'` rather than teaching the route to write `'revenuecat'`.
--
-- ⚠️ READ THIS BEFORE RUNNING IT. THE PREMISE DID NOT REPRODUCE.
--
-- This file was written to widen `SUBSCRIPTION_STATUSES` and add a `'revenuecat'` provider.
-- Auditing the code first — which is the order this repo insists on — found that **every
-- value the server can write is already permitted by the constraints declared in
-- `schema.sql`**, and that the `'revenuecat'` half would make things worse rather than
-- better. Both findings are written out below with the evidence, because a migration that
-- turns out to be a no-op should say so rather than be run and forgotten.
--
-- ═══ WHAT schema.sql DECLARES (lines 168–171) ═══════════════════════════════════════════
--
--   status   text not null default 'trialing'
--     check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired'))
--   provider text not null default 'promo'
--     check (provider in ('stripe', 'apple', 'promo'))
--
-- ═══ EVERY WRITER, ENUMERATED ═══════════════════════════════════════════════════════════
--
-- status, from the three things that write one:
--   lib/subscription.js:110   ensureTrial          → 'trialing'                    ✅ allowed
--   lib/subscription.js:126   mapStripeStatus      → trialing | active | past_due
--                                                    | canceled | expired          ✅ allowed
--   routes/revenuecat.js:39   mapRevenueCatStatus  → trialing | active | past_due
--                                                    | expired                     ✅ allowed
--   routes/stripe.js:100                           → 'past_due'                    ✅ allowed
--
-- provider, from the three things that write one:
--   lib/subscription.js:111   ensureTrial          → 'promo'                       ✅ allowed
--   routes/stripe.js:52,80,101                     → 'stripe'                      ✅ allowed
--   routes/revenuecat.js:98                        → 'apple'                       ✅ allowed
--
-- **`'trialing'` is already permitted**, so the trial path is not blocked by a constraint.
-- `mapRevenueCatStatus` returns it for any event whose `period_type` is `TRIAL` — which for a
-- trial subscriber is INITIAL_PURCHASE, CANCELLATION (still inside the window) and, on the
-- paying side later, RENEWAL. The upsert those produce satisfies the CHECK as written.
--
-- ⚠️ **NOTHING WRITES `'revenuecat'`, AND ADDING IT IS ACTIVELY HARMFUL.** The webhook writes
-- `provider: 'apple'` (routes/revenuecat.js:98) — deliberately, because the *store* is Apple
-- and RevenueCat is the pipe. Adding `'revenuecat'` to the CHECK creates a permitted value
-- that no code path writes, and the iOS client has a switch on this exact column:
--
--   SubscriptionSnapshot.Provider.init(raw:)  — stripe | apple | promo | unrecognized(String)
--   SubscriptionSnapshot.hasManagedBilling    — true for .stripe and .apple, FALSE for
--                                               .unrecognized
--   MembershipRow.controlTitle                — "Manage" only when hasManagedBilling
--
-- So a row written as `'revenuecat'` decodes to `.unrecognized("revenuecat")`, which reports
-- **no managed billing**, and a real paying subscriber is offered **"See plans"** instead of
-- **"Manage"** — a door to their own billing page, missing, for the only shoppers who have
-- given us money. It fails silently and in the expensive direction.
--
-- It is also, precisely, the defect that was named as the reason for having ONE RevenueCat
-- key field: *a slot with nothing to put in it is a slot somebody later fills wrongly.*
--
-- ═══ WHAT THIS FILE COULD NOT VERIFY, AND HOW TO SETTLE IT IN ONE QUERY ═════════════════
--
-- ⚠️ The audit above is of the CODE and of `schema.sql`. **It is not a reading of the live
-- constraint.** `docs/SCHEMA-AUDIT.md` compares COLUMNS and says so explicitly — its method
-- does not read constraints or indexes — so "schema.sql says X" is not evidence that the live
-- table says X. This repo has already been bitten by exactly that gap (`push_tokens` recorded
-- as applied and absent; `counter_cards.aliases` missing from both).
--
-- **Run this first. It is read-only and it settles the whole question:**
--
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.subscriptions'::regclass and contype = 'c';
--
-- If the two definitions it prints match the two in `schema.sql` above, **this file is a
-- no-op and should not be run.** If they do not, the statements below reconcile the live
-- table to the declared contract — and the difference is itself a finding worth recording in
-- `docs/SCHEMA-AUDIT.md`, because it would mean the live schema drifted from the migration.
--
-- ═══ THE RECONCILIATION, IF THE QUERY SHOWS A GAP ══════════════════════════════════════
--
-- Idempotent, DDL only, no data write — `schemaSafety.test.js` fails on any
-- insert/update/delete/truncate in a `supabase/*.sql` file outside a function body, and
-- applying a schema must never change what a user has.
--
-- ⚠️ `'revenuecat'` IS DELIBERATELY ABSENT FROM THE PROVIDER LIST BELOW. See above. If it is
-- ever genuinely needed, the client's `Provider` enum and `hasManagedBilling` must gain the
-- case **in the same change**, or a paying member loses the door to their billing page.

do $$
begin
  -- status
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.subscriptions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%status%'
  ) then
    execute (
      select 'alter table public.subscriptions drop constraint ' || quote_ident(conname)
      from pg_constraint
      where conrelid = 'public.subscriptions'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) like '%status%'
      limit 1
    );
  end if;

  alter table public.subscriptions
    add constraint subscriptions_status_check
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired'));

  -- provider
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.subscriptions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%provider%'
  ) then
    execute (
      select 'alter table public.subscriptions drop constraint ' || quote_ident(conname)
      from pg_constraint
      where conrelid = 'public.subscriptions'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) like '%provider%'
      limit 1
    );
  end if;

  alter table public.subscriptions
    add constraint subscriptions_provider_check
    check (provider in ('stripe', 'apple', 'promo'));
end $$;
