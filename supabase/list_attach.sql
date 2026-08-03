-- Kristy — what the LIST surface needs on top of supabase/trips.sql.
--
-- Two unrelated-looking changes that ship together because Phase 1 (matching a list item to
-- a counter card) is what makes both load-bearing. Safe against the live project; no data
-- write; idempotent.
--
-- Apply AFTER trips.sql.

-- ───────────────── 1. counter_gaps learns WHERE a gap came from ─────────────────
--
-- Someone writing "kombucha" on a list with nothing behind it is the authoring queue
-- writing itself from real intent — and it is a DIFFERENT signal from someone typing a
-- question the KB cannot answer. An ask-miss says "a shopper wanted a read and got none". A
-- list-miss says "a shopper is buying this every week and the corpus is silent". The second
-- is stronger evidence of demand and weaker evidence of curiosity, and collapsing them into
-- one number would let a hundred silent list-writes outrank a genuinely-asked question, or
-- the reverse. Neither is the backlog anyone wants.
--
-- ADDITIVE, WITH A DEFAULT. Every existing row was an ask, so 'ask' backfills correctly by
-- definition rather than by a data write. `outcome` is left alone: its check constraint
-- ('miss','weak') describes HOW WELL the corpus answered, which is orthogonal to WHERE the
-- question came from, and overloading it would have meant a four-value enum that means two
-- things at once.
alter table counter_gaps
  add column if not exists source text not null default 'ask'
    check (source in ('ask', 'list'));

-- The feed groups by topic AND outcome; it now also has to be able to split by surface.
create index if not exists counter_gaps_source_idx on counter_gaps (source, question);

-- STILL NO PER-USER KEY, AND THERE NEVER WILL BE. A list-write reaching this table carries
-- the item NAME and nothing else — scrubbed and capped by normalizeQuestion exactly like an
-- asked question, because free text a shopper typed is the one place identity arrives by
-- accident. privacyLine.test.js greps the writer for the column name itself, which is why
-- it is spelled nowhere in counterGaps.js, comments included.

-- ───────────────── 2. use_count increments atomically ─────────────────
--
-- bumpUseCount has always been read-modify-write: two concurrent hits both read N and both
-- write N+1, so one is swallowed. It undercounts and never overcounts, which is the
-- harmless direction for a popularity signal — but use_count is the stated promotion signal
-- for a generated card ("when use_count climbs, promote"), and a promotion decision should
-- not be made on a number that quietly loses its ties.
--
-- The read-modify-write also cost a round trip on the curated retrieval path, which is
-- otherwise zero-I/O. This replaces both problems with one statement.
--
-- `coalesce` because the column is nullable on older rows.
create or replace function bump_card_use_count(card_slug text)
returns void
language sql
as $$
  update counter_cards
     set use_count = coalesce(use_count, 0) + 1
   where slug = card_slug;
$$;
