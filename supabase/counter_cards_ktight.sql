-- KTIGHT (TestFlight 9 feedback, piece K-b): free `pick_steps` and `science` on counter cards.
--
-- NOT YET APPLIED. Apply this BEFORE the server code that selects these columns deploys:
-- CARD_COLUMNS in server/lib/counterCards.js names both, and a select naming a missing
-- column fails, which breaks /api/counter.
--
-- pick_steps: jsonb array of 1-3 short strings. science: plain text. Both nullable.
alter table counter_cards
  add column if not exists pick_steps jsonb,
  add column if not exists science text;
