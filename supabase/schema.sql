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
alter table user_goals add column if not exists non_negotiables text[] default '{}';
-- Dietary focuses (extension): self-selected preferences fed into every /verdict.
alter table user_goals add column if not exists focuses text[] default '{}';
-- Free personalized-note allowance (Step 11): the first N tastes are free.
alter table user_goals add column if not exists free_notes_used int default 0;

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
alter table subscriptions    enable row level security;

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

-- BACKFILL — give every EXISTING user (me + test accounts) a 7-day trial
-- starting now, matching the automatic trial new users get at onboarding.
-- Idempotent: users who already have a subscription row are left untouched.
insert into public.subscriptions (user_id, status, provider, trial_ends_at)
select u.id, 'trialing', 'promo', now() + interval '7 days'
from auth.users u
on conflict (user_id) do nothing;
