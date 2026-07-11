-- Kristy — push_tokens (mobile). Run this in the Supabase SQL editor alongside
-- the existing schema.sql. Stores Expo push tokens per user so the server can
-- send a notification when a proactive insight fires or the Sunday weekly
-- summary generates. One row per (user, token); a user can have several devices.

create table if not exists push_tokens (
  user_id uuid not null references auth.users on delete cascade,
  token text not null,
  platform text,                       -- 'ios' | 'android'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, token)
);

create index if not exists push_tokens_user_idx on push_tokens (user_id);

-- Keep updated_at fresh on re-register.
create or replace function public.touch_push_tokens_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists push_tokens_touch_updated_at on push_tokens;
create trigger push_tokens_touch_updated_at
  before update on push_tokens
  for each row execute function public.touch_push_tokens_updated_at();

-- RLS: a user may only ever touch their own tokens. The server registers tokens
-- with the service-role key (which bypasses RLS), but the policy keeps things
-- locked down if the client ever writes directly, and matches every other table.
alter table push_tokens enable row level security;

drop policy if exists "own push tokens" on push_tokens;
create policy "own push tokens" on push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
