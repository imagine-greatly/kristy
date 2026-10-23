-- Family and aisle definitions stay in the authored KB, outside counter_cards.
-- Apply before deploying code that selects or upserts these columns.
alter table counter_cards add column if not exists family text;
alter table counter_cards add column if not exists delta text;
