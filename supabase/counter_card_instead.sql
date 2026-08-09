-- `instead` ON counter_cards — the free redirect, and why it is a COLUMN rather than a
-- rewording of one that already exists.
--
-- THE DEFECT IT CLOSES. Kristy holds a standard and names what to do when the standard is
-- not on the shelf (VOICE_SPEC, "the best available"). That redirect was living in
-- `watch_out`, which is PAID — so the shopper who could not afford the standard, i.e.
-- exactly the person the redirect exists for, was the one who could not read it. The wrong
-- half was behind the wall.
--
-- ⚠️ NOTHING MOVES FROM PAID TO FREE. `DEPTH_FIELDS` in lib/counterCards.js is untouched and
-- still seven — why, look_for, watch_out, detail, kristy_take, labels_decoded, sources. This
-- is a NEW authored sentence, so a member loses nothing they used to have. That is what makes
-- it a different act from the `tier_note` promotion of 2026-08-04, which was a swap of one
-- free signal for a better one. Recorded here because "a field became free" reads identically
-- in a schema diff whichever of the two it was, and only one of them is safe.
--
-- WHAT GOES IN IT, from the authored rule (VOICE_SPEC + lintCard):
--   * a DIFFERENT thing, never a lesser version of the same thing. "Buy the farmed" is not
--     an instead; sardines are.
--   * it must clear the floor on its own terms. Where nothing does, the card has NO instead
--     and the column stays null — null is an honest answer here, not a gap to backfill.
--   * it never reads as co-equal with the standard. The headline is the answer.
--   * where the redirect is cheaper, it says so. That is what makes Kristy usable on a
--     budget, and it is the strongest thing about the field.
--
-- Enforced, not merely written down: `lintCard` fails INSTEAD_ECHOES_REFUSED,
-- INSTEAD_HEDGED, INSTEAD_CO_EQUAL and INSTEAD_TOO_LONG, each verified to fire on the defect
-- it names before being trusted. `paidBoundary.test.js` pins the column free in both
-- directions — a free viewer receives it, and it never enters DEPTH_FIELDS.
--
-- ⚠️ ORDER: APPLY THIS BEFORE THE CODE DEPLOYS, like every other column this repo has added.
-- `CARD_COLUMNS` in lib/counterCards.js now names `instead`, and PostgREST fails the WHOLE
-- select on an undeclared column — so with the code live and the column missing, every card
-- read returns nothing and the Counter serves an empty store rather than a degraded one.
-- That is the `scanned_products.nutrition_panel` lesson: the read side fails wider than the
-- write side, and it fails today rather than tomorrow.
--
-- Idempotent, and it contains NO DATA WRITE — schemaSafety.test.js fails if any supabase/*.sql
-- file carries an insert/update/delete outside a function body. Applying this must never
-- change what any user has. The SENTENCES themselves arrive through
-- `node server/scripts/migrateCounterCards.js`, which upserts on slug and is the same
-- two-step act every curated card edit already requires.

alter table counter_cards add column if not exists instead text;

comment on column counter_cards.instead is
  'FREE. What to buy when the standard is not on the shelf — a DIFFERENT thing, never a '
  'lesser version of the same one. Null where the card has no honest redirect. Served to '
  'every viewer: it is deliberately NOT part of DEPTH_FIELDS.';
