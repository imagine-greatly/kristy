-- Kristy — counter_gaps, as a STANDALONE migration.
--
-- This DDL also lives inside schema.sql, which is the full-project bootstrap. It is
-- extracted here because schema.sql cannot safely be re-run against a live project: its
-- final statement backfills a 7-day trialing subscription for every existing auth user,
-- so running it to pick up one missing table would silently grant a trial that the
-- explicit trial door (POST /api/subscription/trial) is supposed to be the only source of.
--
-- Every statement is `if not exists` / `or replace`, so this file is idempotent and is
-- compatible with a project that already ran schema.sql.

-- ─────────────────── The counter's gap log (questions, not people) ───────────────────
-- Every counter question the KB answered badly or not at all. The Counter reads from
-- authored entries; this is how the next one gets chosen by real shoppers instead of by
-- guesswork. 'miss' = nothing matched, write a new entry. 'weak' = something matched
-- poorly, so an entry exists and is either not findable or not answering.
--
-- SAME DISCIPLINE AS scanned_products, AND FOR THE SAME REASON: there is no user_id
-- column and there never should be. A question is a product signal; who asked it is a
-- surveillance log. The per-user record of a conversation already lives in chat_messages,
-- where it belongs and where account deletion reaches it.
--
-- `question` is stored ALREADY NORMALIZED by lib/counterGaps.js — lowercased, stripped of
-- punctuation, scrubbed of emails and long digit runs, capped at 160 chars. The raw string
-- a stranger typed never reaches this table.
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
-- (lib/counterGaps.gapFeed) aggregates in JS over the same rows so the feed is readable
-- whether or not this migration has landed — the loop has to work from day one, and a
-- view that isn't deployed yet is not day one.
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

-- counter_gaps holds no user data, and is locked the same way scanned_products is: RLS on
-- with NO policy means only the service role (the server) can read or write it. Shoppers
-- write to it only as a side effect of asking, and nobody can read the log back out.
alter table counter_gaps enable row level security;
