-- Kristy — Supabase schema
-- Auth is handled by Supabase Auth (phone + SMS one-time code). No custom users
-- table needed — the trigger below seeds a goals row keyed by the auth UUID.

-- ───────────────────────────── Tables ─────────────────────────────

create table if not exists meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  logged_at timestamptz default now(),
  foods text[],
  calories int,
  protein int,
  carbs int,
  fat int,
  raw_input text,
  -- Macro provenance for typed meals: 'usda' when every food matched USDA
  -- FoodData Central, 'estimate' when any item fell back to a Claude estimate.
  source text,
  -- Per-item breakdown ({food, grams, source, fdcId, calories, protein, ...}).
  breakdown jsonb
);

-- Migration for existing projects: add the macro-provenance columns.
alter table meal_logs add column if not exists source text;
alter table meal_logs add column if not exists breakdown jsonb;

create table if not exists user_goals (
  user_id uuid primary key references auth.users on delete cascade,
  calories int default 2500,
  protein int default 180,
  carbs int default 200,
  fat int default 80,
  -- Onboarding profile (drives TDEE + performance-aware coaching).
  name text,
  age int,
  sex text,
  height_value numeric,
  height_unit text,
  weight_value numeric,
  weight_unit text,
  goal text,
  sport text,
  training_frequency text,
  eating_pattern text,
  eating_window_start text,
  eating_window_end text,
  dietary_preferences text[] default '{}',
  onboarded boolean default false,
  updated_at timestamptz default now()
);

-- Migration for existing projects: add the onboarding profile columns.
alter table user_goals add column if not exists name text;
alter table user_goals add column if not exists age int;
alter table user_goals add column if not exists sex text;
alter table user_goals add column if not exists height_value numeric;
alter table user_goals add column if not exists height_unit text;
alter table user_goals add column if not exists weight_value numeric;
alter table user_goals add column if not exists weight_unit text;
alter table user_goals add column if not exists goal text;
alter table user_goals add column if not exists sport text;
alter table user_goals add column if not exists training_frequency text;
alter table user_goals add column if not exists eating_pattern text;
alter table user_goals add column if not exists eating_window_start text;
alter table user_goals add column if not exists eating_window_end text;
alter table user_goals add column if not exists dietary_preferences text[] default '{}';
alter table user_goals add column if not exists onboarded boolean default false;

-- Grocery-coach overhaul (Step 6): the 60-second onboarding sets a primary
-- coaching goal + non-negotiables, fed into every /verdict call. Additive and
-- optional; entries without them simply get universal (goal-agnostic) verdicts.
-- (The dietary "focuses" multi-select appends to the same row in a later step.)
alter table user_goals add column if not exists coach_goal text;
-- coach_goals: the multi-select goal SET. coach_goal is kept in sync as the primary
-- (first) goal so single-goal readers keep working. Absent column → app reads [coach_goal].
alter table user_goals add column if not exists coach_goals text[] default '{}';
alter table user_goals add column if not exists non_negotiables text[] default '{}';
-- Dietary focuses (extension): self-selected preferences fed into every /verdict.
alter table user_goals add column if not exists focuses text[] default '{}';
-- Constraints (fourth preference dimension): the shopper's real-life circumstances
-- (budget / short on time / picky kids / no kitchen / cooking for one). Shape the List
-- and the note's emphasis; never a health claim, never a verdict tier.
alter table user_goals add column if not exists constraints text[] default '{}';
-- Free personalized-note allowance (Step 11): the first N tastes are free.
alter table user_goals add column if not exists free_notes_used int default 0;
-- Macro tracking (repositioning): calories/macros/meal-logging are now OPT-IN and
-- OFF by default. Kristy is a grocery coach unless the user turns this on in
-- Settings, at which point the meal-logging + weight-optimization pipeline returns.
alter table user_goals add column if not exists macro_tracking boolean not null default false;

-- The Haul (Step 7): every scanned product is recorded here so the Haul surface
-- can aggregate the trip + week (distribution, item list, weekly read). A scan is
-- NOT a meal — this is separate from meal_logs.
create table if not exists haul_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  product_name text,
  brand text,
  tier text,
  barcode text,
  scanned_at timestamptz default now()
);
create index if not exists haul_scans_user_time on haul_scans (user_id, scanned_at desc);

-- The List (Step 8 → durable). Server-persisted so the list survives a device
-- change, and its premium capabilities (focus-aware items, haul-swap integration)
-- are enforced SERVER-SIDE rather than by a client prop. One row per user: the
-- current list doc, the learning signals, and the pending "add to next list" swap
-- queue fed by the Haul (merged into the list on the next load).
create table if not exists shopping_lists (
  user_id uuid primary key references auth.users on delete cascade,
  list jsonb not null default '{}'::jsonb,
  signals jsonb not null default '{"removed":[],"kept":[],"acceptedSwaps":[]}'::jsonb,
  next_list jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Conversational weight logging — the first optimization feature. Kristy tracks
-- the trend over time and uses it to recalculate calorie targets.
create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  weight_value numeric not null,
  weight_unit text default 'lbs',
  logged_at timestamptz default now(),
  note text
);

create index if not exists weight_logs_user_date on weight_logs (user_id, logged_at desc);

-- Weight + TDEE-optimization columns on the goals row.
alter table user_goals add column if not exists starting_weight numeric;
alter table user_goals add column if not exists starting_weight_unit text default 'lbs';
alter table user_goals add column if not exists current_weight numeric;
alter table user_goals add column if not exists current_weight_unit text default 'lbs';
alter table user_goals add column if not exists tdee_last_recalculated timestamptz;
alter table user_goals add column if not exists tdee_adjustment int default 0;

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  role text check (role in ('user', 'ai')),
  content text,
  macros jsonb,
  created_at timestamptz default now()
);

create table if not exists weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  week_start date,
  summary_text text,
  avg_calories int,
  avg_protein int,
  avg_carbs int,
  avg_fat int,
  created_at timestamptz default now()
);

-- Subscriptions — PROVIDER-AGNOSTIC billing state. Stripe (web) is the first
-- provider; Apple IAP (mobile) will later write to this same table. Features are
-- NEVER gated on "has a Stripe record" — only on the internal status below. One
-- row per user (upsert by user_id): whichever provider last wrote wins.
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  provider text not null default 'promo'
    check (provider in ('stripe', 'apple', 'promo')),
  provider_subscription_id text,
  provider_customer_id text,   -- Stripe customer id (needed to open the billing portal)
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- One subscription row per user — the upsert target for every provider webhook.
create unique index if not exists subscriptions_user_id_key on subscriptions (user_id);

-- ─────────────────── Kristy's own product dataset ───────────────────
-- Every RESOLVED scan accrues here — barcode-matched or read off a photographed
-- label. The point is compounding coverage: a product Open Food Facts doesn't have
-- gets photographed once by one shopper, and from then on that barcode resolves
-- from Kristy's own store instead of missing again for everyone else. Lookup order
-- is own-store → OFF → vision, so the database self-heals from real usage.
--
-- DELIBERATELY NOT USER DATA. There is no user_id column and there never should
-- be: this is a catalog of PRODUCTS, and tying "who scanned what" into it would
-- turn a shared asset into a surveillance log. The per-user record of a scan
-- already lives in haul_scans, where it belongs.
--
-- Identity: `barcode` when the scan had one, else `product_hash` (name +
-- ingredients) so a label-only read still de-dupes against itself. Partial unique
-- indexes below, because Postgres allows many NULLs in a unique column.
create table if not exists scanned_products (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  product_hash text,
  name text,
  brand text,
  ingredients text not null,
  source text not null,                          -- 'off' | 'vision'
  -- 'high' = an OFF record or a fully-legible panel. 'low' = a partial vision read,
  -- which may be missing the tail of the list. A low-confidence read may never
  -- overwrite a high-confidence one (enforced in lib/productStore.js), so one bad
  -- photo can't poison a known-good product.
  confidence text not null default 'high',
  -- The verdict tier this product produced, for later curation. Display/analytics
  -- only: the tier is always RECOMPUTED from the ingredients on every scan, so a
  -- stale or wrong value here can never become a wrong verdict.
  tier text,
  scan_count integer not null default 1,
  first_seen timestamptz default now(),
  last_seen timestamptz default now()
);

create unique index if not exists scanned_products_barcode_key
  on scanned_products (barcode) where barcode is not null;
create unique index if not exists scanned_products_hash_key
  on scanned_products (product_hash) where barcode is null and product_hash is not null;

-- ─────────────────── The counter's gap log (questions, not people) ───────────────────
-- Every counter question the KB answered badly or not at all. The Counter reads from
-- 77 authored entries; this is how the 78th gets chosen by real shoppers instead of by
-- guesswork. 'miss' = nothing matched, write a new entry. 'weak' = something matched
-- poorly, so an entry exists and is either not findable or not answering.
--
-- SAME DISCIPLINE AS scanned_products, AND FOR THE SAME REASON: there is no user_id
-- column and there never should be. A question is a product signal; who asked it is a
-- surveillance log. The per-user record of a conversation already lives in
-- chat_messages, where it belongs and where account deletion reaches it.
--
-- `question` is stored ALREADY NORMALIZED by lib/counterGaps.js — lowercased, stripped
-- of punctuation, scrubbed of emails and long digit runs, capped at 160 chars. The raw
-- string a stranger typed never reaches this table.
create table if not exists counter_gaps (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  outcome text not null check (outcome in ('miss', 'weak')),
  -- For 'weak': the entry it did reach, so the fix is actionable rather than a hunt.
  top_entry_id text,
  top_score int,
  asked_at timestamptz default now()
);

create index if not exists counter_gaps_question_idx on counter_gaps (question, outcome);
create index if not exists counter_gaps_asked_idx on counter_gaps (asked_at desc);

-- The frequency-ranked authoring backlog, as a view for ad-hoc SQL. The API
-- (lib/counterGaps.gapFeed) aggregates in JS over the same rows so the feed is
-- readable whether or not this migration has landed — the loop has to work from day
-- one, and a view that isn't deployed yet is not day one.
create or replace view counter_gap_feed as
  select
    question,
    outcome,
    count(*)      as times_asked,
    max(asked_at) as last_asked,
    min(asked_at) as first_asked,
    -- The most recent entry it reached, for weak matches.
    (array_agg(top_entry_id order by asked_at desc) filter (where top_entry_id is not null))[1]
                  as top_entry_id
  from counter_gaps
  group by question, outcome
  order by times_asked desc, last_asked desc;

-- Helpful indexes for the per-user, time-ranged reads Kristy makes constantly.
create index if not exists meal_logs_user_logged_idx on meal_logs (user_id, logged_at desc);
create index if not exists chat_messages_user_created_idx on chat_messages (user_id, created_at);
create index if not exists weekly_summaries_user_week_idx on weekly_summaries (user_id, week_start desc);

-- ───────────────────────────── RLS ─────────────────────────────
-- Every table is locked down: a user can only ever touch their own rows.

alter table meal_logs        enable row level security;
alter table user_goals       enable row level security;
alter table chat_messages    enable row level security;
alter table weekly_summaries enable row level security;
alter table weight_logs      enable row level security;
alter table haul_scans       enable row level security;
alter table shopping_lists   enable row level security;
alter table subscriptions    enable row level security;
-- scanned_products holds no user data, but it is still locked: RLS on with NO
-- policy means only the service role (the server) can read or write it. Clients
-- reach it exclusively through the scan endpoints, so nobody can enumerate or
-- tamper with the catalog directly.
alter table scanned_products enable row level security;
-- counter_gaps holds no user data either, and is locked the same way: RLS on with NO
-- policy means only the service role (the server) can read or write it. Shoppers write
-- to it only as a side effect of asking, and nobody can read the log back out.
alter table counter_gaps      enable row level security;

-- meal_logs
drop policy if exists "own meals" on meal_logs;
create policy "own meals" on meal_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_goals
drop policy if exists "own goals" on user_goals;
create policy "own goals" on user_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- chat_messages
drop policy if exists "own messages" on chat_messages;
create policy "own messages" on chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- weekly_summaries
drop policy if exists "own summaries" on weekly_summaries;
create policy "own summaries" on weekly_summaries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- weight_logs
drop policy if exists "Users can only access their own weight logs" on weight_logs;
create policy "Users can only access their own weight logs" on weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- haul_scans
drop policy if exists "own haul scans" on haul_scans;
create policy "own haul scans" on haul_scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- shopping_lists
drop policy if exists "own list" on shopping_lists;
create policy "own list" on shopping_lists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- subscriptions — a user may READ their own row (so the client can show trial
-- days / status). All WRITES are service-role only (Stripe/Apple webhooks +
-- onboarding trial): there is intentionally NO insert/update/delete policy, so
-- RLS blocks every non-service write while the service role bypasses RLS.
drop policy if exists "own subscription read" on subscriptions;
create policy "own subscription read" on subscriptions
  for select using (auth.uid() = user_id);

-- Auto-create a default goals row the first time a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_goals (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Subscriptions: premium helper + backfill ─────────────────────────

-- Plan-enforcement concept, expressed once in SQL so the rule is auditable:
-- a user is "premium" when their subscription is trialing/active AND the
-- relevant expiry (current_period_end for paid, trial_ends_at for the trial)
-- is still in the future. The server's isPremium() helper mirrors this exactly
-- and is the authoritative gate; this function is for ad-hoc checks / dashboards.
create or replace function public.is_premium(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid
      and s.status in ('trialing', 'active')
      and coalesce(s.current_period_end, s.trial_ends_at) > now()
  );
$$;

-- Keep updated_at fresh on every write.
create or replace function public.touch_subscription_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_touch_updated_at on subscriptions;
create trigger subscriptions_touch_updated_at
  before update on subscriptions
  for each row execute function public.touch_subscription_updated_at();

-- THE TRIAL BACKFILL LIVES IN supabase/backfill_trials.sql AND IS NOT PART OF THIS FILE.
--
-- It used to sit here, and it fired on every re-run of this file. It granted a 7-day
-- trial to the one live account twice, through two different doors, simply because
-- somebody applied the schema to pick up a missing table. `on conflict do nothing` made
-- it look idempotent, and it is — per user, at a point in time. It is NOT idempotent
-- across time: anyone who signed up since the last run has no row to conflict with, so
-- they get a fresh trial every apply.
--
-- That matters more than one row suggests, because ensureTrial() is idempotent BY
-- EXISTENCE — any subscription row at all means the user can never be granted a trial
-- again. A backfill they never asked for silently spends the only one they had.
--
-- THIS FILE IS SCHEMA. It creates tables, columns, indexes, policies, functions and
-- triggers, and it writes no rows — so applying it can never change what a user has.
-- schemaSafety.test.js enforces that, because the guarantee should not depend on anyone
-- remembering it.
