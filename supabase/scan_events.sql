-- Kristy — scan_events, as a STANDALONE migration.
--
-- Safe to run against the live project. Every statement is `if not exists` / `or replace`,
-- and this file contains NO data write, so applying it changes nothing anybody has.
-- (`schemaSafety.test.js` enforces that.)
--
-- ─────────────────────────── WHAT IT IS FOR ───────────────────────────
--
-- One question: does photo-first actually work, and does it work well enough on the web
-- or only in Swift? The scanner is being flipped — a photo of the ingredient panel
-- becomes the primary action because barcode coverage measured 19% on independently
-- sourced products, and when Open Food Facts did hit, the data was wrong badly enough
-- to put a gold seal on a corn-syrup product.
--
-- That flip is a bet. This table is how we find out whether it paid.
--
-- ─────────────────────────── THIS IS THE FUNNEL, NOT THE CATALOG ───────────────────────────
--
-- `scanned_products` is keyed per PRODUCT and only ever holds scans that produced a row.
-- Every interesting failure is therefore invisible to it: the photo that came back
-- unreadable, the shopper who gave up on the third try, the barcode that missed. This
-- table is one row per ATTEMPT, and it is the only place those live.
--
-- THE TWO ARE DELIBERATELY NOT JOINABLE. There is no barcode column here, and that is a
-- decision rather than an oversight: a barcode plus a timestamp plus a tier, in sequence,
-- is a shopping trip. It is the closest thing this schema could contain to a fingerprint.
-- The question it costs us — "which products fail most" — is already answered by
-- `scanned_products.scan_count`, from a table that holds no timeline.
--
-- ─────────────────────────── PRODUCTS AND EVENTS, NEVER PEOPLE ───────────────────────────
--
-- No user_id. No IP. No session id. No barcode. No free text a shopper typed. Every
-- column below is a property of the scan itself, and the aggregate property is structural
-- rather than a filter someone has to remember to apply. `privacyLine.test.js` holds this
-- table in AGGREGATE_TABLES, which is what makes that sentence enforced instead of merely
-- written down — the lesson `ingredient_conflicts` taught by shipping without it.

create table if not exists scan_events (
  id            uuid primary key default gen_random_uuid(),

  -- WHICH DOOR ANSWERED. 'barcode_store' is our own catalog — the moat, answering.
  path          text not null,   -- barcode_store | barcode_off | photo | conflict | miss
  -- 'abandoned' is the most important failure we can measure and nothing sees it today:
  -- the shopper who dismissed the sheet without ever getting a verdict.
  outcome       text not null,   -- verdict | no_ingredients | reshoot | unreadable | abandoned | error

  -- ── PHOTO PATH ONLY ──
  panel         text,            -- full | partial | none, as vision self-reported

  -- ATTEMPT, NOT A BOOLEAN. A flag cannot tell someone who got it on the second try from
  -- someone who gave up on the fourth, and that difference IS the viability question for
  -- web capture. 1 = first shot at this product.
  attempt       integer not null default 1,

  -- Was the one number the seal gate needs legible in a frame composed for ingredients?
  sugar_in_frame    boolean,
  -- Did the capture also decode a GTIN? This decides whether the catalog gets a join key,
  -- which decides whether the database compounds at all.
  barcode_in_frame  boolean,

  -- ── WHAT CAME OUT ──
  tier              text,
  stamp             boolean,
  ingredients_read  integer,     -- the real token count, not an estimate

  -- ── THE MOAT METRIC ──
  -- new_row / (new_row + repeat) climbing means the catalog is compounding. Flat near
  -- zero means the same twenty products being rescanned. coverageStats gives the total;
  -- this gives the RATE, which is the thing that predicts.
  catalog       text,            -- new_row | repeat | not_retained

  -- ── COST ──
  latency_ms    integer,
  vision_ms     integer,

  -- WHICH CLIENT, AND WHICH BUILD OF IT. `client` alone stops being enough the moment
  -- there are two clients that each change over time: it cannot say whether a capture
  -- fix worked, only that iOS and web differ.
  client          text not null,  -- web | ios
  client_version  text,

  created_at    timestamptz not null default now()
);

-- The reads are "how did scans go, by path, recently" and "how did they go, by client".
create index if not exists scan_events_path_idx   on scan_events (created_at desc, path);
create index if not exists scan_events_client_idx on scan_events (created_at desc, client);

-- RLS on, with no policy for anon/authenticated. The server writes with the service role
-- key, which bypasses RLS; no client ever reads this. Same posture as every other table
-- in the aggregate pool.
alter table scan_events enable row level security;
