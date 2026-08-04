-- Kristy — ingredient_conflicts, as a STANDALONE migration.
--
-- Safe to run against the live project. Every statement is `if not exists` / `or replace`,
-- and this file contains NO data write, so applying it changes nothing anybody has.
-- (`schemaSafety.test.js` enforces that.)
--
-- ─────────────────────────── WHY THIS TABLE EXISTS ───────────────────────────
--
-- A US Heinz ketchup barcode returned the UK recipe and earned the gold seal. The record
-- was not wrong about the market — it was tagged `en:united-states`, in English, at the US
-- pack size. A CONTRIBUTOR EDIT had overwritten `ingredients_text_en`, and the correct US
-- text was sitting in the same API response under `ingredients_text_en_imported`.
--
-- So Open Food Facts can hold two ingredient lists for one product: the live editable field
-- and the raw import. `sameVerdict` (server/lib/scanExtract.js) scores both and, when they
-- would land on different tiers, refuses to answer from either — the shopper is asked for a
-- photo instead, because they are holding the package and OFF's own stored panel photo is
-- the same disputed record in image form.
--
-- That refusal costs a shopper a photo, so it has to stay rare. This table is how we find
-- out whether it does, and whether the imported field is reliably the correct one.
--
-- ─────────────────────────── TWENTY PRODUCTS IS NOT A RULE ───────────────────────────
--
-- On the first sample the imported field was right 2 times out of 2, and tier-disagreement
-- fired on 1 of 18 products. Two out of two is exactly the sample size that talks people
-- into shipping a preference they cannot defend, so the rule stayed at "withhold" rather
-- than "prefer the import". This table is the sample growing on real scans instead of on
-- twenty barcodes chosen by hand.
--
-- ─────────────────────────── PRODUCTS, NOT PEOPLE ───────────────────────────
--
-- Same discipline as `scanned_products` and `counter_gaps`. A row holds a barcode, the two
-- ingredient strings, and the tiers they scored. There is NO user_id, no IP and no session,
-- so there is nothing here that could be narrowed to one shopper — the aggregate property
-- is structural, not a filter anybody has to remember to apply. The strings are label text
-- off a package; nothing a person typed reaches this table.

create table if not exists ingredient_conflicts (
  id            uuid primary key default gen_random_uuid(),

  -- One row per product. A product that disagrees disagrees on every scan, so repeat
  -- sightings bump `seen_count` rather than writing another row — 500 rows for one
  -- ketchup teaches nothing that one row plus a counter does not.
  barcode       text not null unique,
  name          text,
  brand         text,

  -- The two candidate lists, capped in the writer. Kept in full because the point of the
  -- table is being able to read what actually differed.
  live_text     text not null,
  imported_text text not null,

  -- What each list scored. The disagreement IS the tier difference — that is the whole
  -- signal, and storing it means the feed can be read without re-running the engine.
  live_tier     text,
  imported_tier text,

  seen_count    integer     not null default 1,
  first_seen    timestamptz not null default now(),
  last_seen     timestamptz not null default now()
);

-- The backlog is read most-repeated-first: the products shoppers actually hit.
create index if not exists ingredient_conflicts_seen_idx
  on ingredient_conflicts (seen_count desc, last_seen desc);

-- RLS on, with no policy for anon/authenticated. The server writes with the service role
-- key, which bypasses RLS; no client ever reads this directly. Same posture as the other
-- shared-pool tables.
alter table ingredient_conflicts enable row level security;
