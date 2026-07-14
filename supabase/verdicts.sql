-- Kristy — verdicts. Run this in the Supabase SQL editor alongside schema.sql.
-- Stores each authed "Kristy's Verdict" scan (a meal/haul read rendered as a
-- shareable card). Optional-lightweight: the server tolerates this table not
-- existing yet (the insert is best-effort). Guests write NOTHING here.
--
-- A verdict is NOT a meal — nothing here ever touches meal_logs.

create table if not exists verdicts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  kind text,
  verdict_line text,
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists verdicts_user_idx on verdicts (user_id, created_at desc);

alter table verdicts enable row level security;

-- A user may only read their own verdicts. The server writes with the
-- service-role key (which bypasses RLS); this policy keeps direct client reads
-- locked to the owner, matching every other table.
drop policy if exists "own verdicts" on verdicts;
create policy "own verdicts" on verdicts for select using (auth.uid() = user_id);
