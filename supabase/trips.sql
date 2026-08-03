-- Kristy — trips, as a STANDALONE migration.
--
-- Safe to run against the live project. Every statement is `if not exists` / `or replace`,
-- and this file contains NO data write, so applying it changes nothing anybody has.
-- (`schemaSafety.test.js` enforces that; see supabase/backfill_trials.sql for the one file
-- allowed to write rows and the reasoning behind why it is the only one.)
--
-- ─────────────────────────── WHY THIS TABLE EXISTS ───────────────────────────
--
-- `shopping_lists` has `user_id` as its PRIMARY KEY. One row per shopper, one list, ever —
-- writing a new one overwrites the old one in place. That single fact blocked everything
-- downstream of it: a finished trip could not be archived because there was nowhere to put
-- it, "same as last week" had no last week to read, and `startNewTrip()` wrote `{items: []}`
-- over a completed trip and destroyed the record of it.
--
-- Trips are that record. A shopper has many; exactly one is active.
--
-- ─────────────────────────── WHAT DOES *NOT* MOVE ───────────────────────────
--
-- `shopping_lists.signals` and `shopping_lists.next_list` STAY WHERE THEY ARE, and that is
-- deliberate rather than incremental.
--
--   `signals` is CROSS-trip pattern memory. buildBaseline reads it over time to work out
--   what someone actually buys ("kept" is not deduped on purpose — occurrences are the
--   frequency). Filed per trip it would forget the shopper every week, which is the one
--   thing it exists not to do.
--
--   `next_list` is the Haul → next-trip swap queue. It spans the boundary between trips by
--   definition, so it cannot live inside either one.
--
-- So appendPendingSwaps, clearPendingSwaps and buildBaseline are untouched by this
-- migration, and the carry-forward loop — the one loop-closer that already works — keeps
-- working with no change at all.
--
-- `shopping_lists.list` becomes a FOSSIL after adoption (below) and is never dropped. It is
-- the safety net, and dropping a column to tidy up is not reversible.

create table if not exists trips (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,

  -- THREE STATUSES, NOT TWO, AND THE THIRD IS THE HONEST ONE.
  --
  -- "Start a new trip" fires with 3 of 12 checked. Under active/completed alone that has to
  -- either mark a half-finished trip `completed` — which lies to the Haul and lets it seed
  -- "same as last week" — or delete it, which is the exact bug this table removes. So an
  -- abandoned trip is archived like any other and simply excluded from the seed query.
  status       text not null default 'active'
                 check (status in ('active', 'completed', 'abandoned')),

  goal         text,
  intro        text,

  -- The items, as one jsonb doc, in the shape sanitizeList() already produces and every
  -- caller already consumes. NOT a trip_items table: every mutation in the app writes the
  -- whole list atomically and the client POSTs all of it on every checkbox, so rows would
  -- mean diffing on each toggle for nothing. Card attachments (`cardSlug`, `cardSection`)
  -- ride on the item objects, which makes them per-trip BY CONSTRUCTION — a completed trip's
  -- blob is frozen, so history cannot shift under a corpus edit.
  items        jsonb not null default '[]'::jsonb,

  started_at   timestamptz default now(),
  completed_at timestamptz,
  updated_at   timestamptz default now()
);

-- ONE ACTIVE TRIP PER USER, HELD BY THE DATABASE.
--
-- A partial unique index rather than a check in application code, because the failure mode
-- is concurrency: a double-tapped button or two open tabs both read "no active trip" and
-- both insert one. A code path cannot see the other request; this can.
create unique index if not exists trips_one_active
  on trips (user_id) where status = 'active';

-- "Same as last week" reads exactly this: the most recent COMPLETED trip. Abandoned trips
-- are outside the index as well as outside the query, so a half-built list can never seed
-- the next one.
create index if not exists trips_user_completed
  on trips (user_id, completed_at desc) where status = 'completed';

-- Same posture as every other per-user table: RLS on, own-rows policy, cascade on user
-- delete. NOTE — `trips` must also be listed in USER_TABLES (server/routes/account.js) or
-- privacyLine.test.js fails: the explicit deletion sweep exists so the guarantee does not
-- depend on the cascade, and a table missing from it is silently outside that guarantee.
alter table trips enable row level security;
drop policy if exists "own trips" on trips;
create policy "own trips" on trips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────── THE MIGRATION PATH ───────────────────────────
--
-- THERE IS NO BACKFILL, AND THAT IS THE POINT. A bulk `insert into trips select ... from
-- shopping_lists` would be a data write in a schema apply, which is the exact shape that
-- granted the one live account two trials through two different doors. It is also
-- unnecessary.
--
-- Instead, adoption happens lazily in `getActiveTrip(userId)`, per shopper, the next time
-- they open the app:
--
--   1. an active trip exists                      -> return it
--   2. the user has NO TRIPS AT ALL, and their
--      shopping_lists.list still holds items      -> adopt it as a new active trip
--   3. otherwise                                  -> null (the honest empty; the cart asks
--                                                    what the trip is for)
--
-- STEP 2 GATES ON "NO TRIPS AT ALL", NOT "NO ACTIVE TRIP", and that distinction is the
-- whole safety of it. Gating on the absence of an ACTIVE trip would resurrect the adopted
-- list as a brand-new trip every time the shopper completed one, because
-- shopping_lists.list still holds the items forever. Adoption has to be a once-per-shopper
-- event, and "has this user ever had a trip" is the only condition that expresses that.
--
-- Nobody loses a list if this migration is applied and nothing else happens for a week.
