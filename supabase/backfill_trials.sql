-- Kristy — the trial backfill. A ONE-OFF, and deliberately not part of any schema apply.
--
-- ⚠ READ THIS BEFORE RUNNING IT. This grants a 7-day trial to every existing auth user
-- who does not already have a subscription row. It is the ONLY thing in supabase/ that
-- writes rows a shopper can feel.
--
-- WHY IT IS ITS OWN FILE. It used to live at the bottom of schema.sql, where it fired on
-- every re-run. It granted the one live account a trial twice, through two different
-- doors, both times as a side effect of somebody applying the schema to pick up a missing
-- table. `on conflict do nothing` reads as idempotent and is — per user, at one moment.
-- Across time it is not: anyone who signed up since the last apply has no row to conflict
-- with, so they get a fresh trial every time.
--
-- WHY THAT IS EXPENSIVE. ensureTrial() in server/lib/subscription.js is idempotent BY
-- EXISTENCE: if a subscription row exists in any state it is returned untouched. So a
-- backfilled row permanently consumes the user's single trial without them ever tapping
-- POST /api/subscription/trial — the one explicit door — and the product can never grant
-- them another. The same failure is already on record in CLAUDE.md from when setting a
-- goal granted a trial: it killed the 3-free-notes taste mechanic.
--
-- SO: run this only when you actually intend to hand out trials, to a known set of
-- accounts, and check who is about to receive one first:
--
--   select u.id, u.phone, u.email, u.created_at
--   from auth.users u
--   left join public.subscriptions s on s.user_id = u.id
--   where s.user_id is null;
--
-- The trial's normal path is the explicit door, not this file.

insert into public.subscriptions (user_id, status, provider, trial_ends_at)
select u.id, 'trialing', 'promo', now() + interval '7 days'
from auth.users u
on conflict (user_id) do nothing;
