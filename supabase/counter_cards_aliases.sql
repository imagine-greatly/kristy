-- Kristy — counter_cards.aliases. Additive, idempotent, and urgent.
--
-- WHAT WAS BROKEN. A generated card carries `aliases` — the phrases a shopper might type
-- to reach it — and they are the ONLY way a generated card is ever retrieved again. The
-- deterministic matcher scores alias phrases; a card with none scores zero against every
-- future question. counter_cards.sql shipped without the column, so:
--
--   1. Every generated card failed to persist (PGRST204), swallowed as a warning, so the
--      corpus never grew.
--   2. Reading generated cards back failed for the same reason, so nothing deduped.
--   3. The same question regenerated on every ask — the unbounded spend loop the alias
--      requirement exists to prevent.
--   4. The global daily ceiling counts generated rows created today. That count is
--      permanently zero when nothing persists, so the ceiling never engaged either.
--
-- jsonb rather than text[], to match look_for / watch_out / labels_decoded — the row
-- mapper hands the whole card through one shape and a lone Postgres array would be the
-- odd one out.
alter table counter_cards add column if not exists aliases jsonb not null default '[]'::jsonb;

-- Nothing indexes it: alias scoring happens in JS over a bounded fetch (see
-- getGeneratedCards), and a GIN index on a table this size would cost more to maintain
-- than the scan it saves. Revisit if the generated corpus passes a few thousand rows.

-- ─────────────────── The essentials shelf ───────────────────
-- The counter index puts the ask bar first and then a handful of cards a shopper can read
-- and expand IN PLACE, before any navigation. Three taps to an answer — tab, section, card
-- — is a couch interaction, and it was occupying the position the store interaction should
-- hold.
--
-- Two columns rather than one boolean: `essential` is the membership and `essential_rank`
-- is the ORDER, which is a separate editorial decision. A shelf whose order falls out of
-- whatever the query returned is not a shelf, it is a list.
--
-- Both default to off. Membership is chosen deliberately, never derived from use_count —
-- a popularity sort would fill the most valuable space on the surface with whatever
-- happened to be asked most last week.
alter table counter_cards add column if not exists essential boolean not null default false;
alter table counter_cards add column if not exists essential_rank int;

-- The shelf's read: members only, in their authored order.
create index if not exists counter_cards_essential_idx
  on counter_cards (essential_rank) where essential;
