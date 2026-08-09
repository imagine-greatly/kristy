-- WHAT A PRODUCT IS — three columns on scanned_products, and the reason they land before the
-- features that need them.
--
-- ⚠️ TWO CAPTURES, ONE MIGRATION, ON PURPOSE — see the second section below. `category` serves
-- the same-category swap; `nutrition_panel` closes the cache half of the non-food seal gate.
-- They are unrelated features and they are the SAME SHAPE: a fact that is on a response we are
-- already receiving, thrown away for want of a column, and unrecoverable afterwards. Splitting
-- them into two files would mean two dashboard runs against one table for one reason, and the
-- second one would be the one that gets forgotten — leaving a deployed gate that cannot fire.
--
-- A product-level swap ("same category, better version" — a bad bar swaps for a good bar)
-- has to know what a thing IS to know what it can be swapped for. Nothing in this schema
-- carries that: scanned_products has barcode, hash, name, brand, ingredients, source,
-- confidence, tier and counters, and no category of any kind.
--
-- ⚠️ THIS CANNOT BE BACKFILLED, WHICH IS WHY IT IS NOT WAITING FOR THE FEATURE.
-- A vision row's category was knowable only while a model was looking at the package, and
-- the photo is never stored (scan.md §8). An OFF row's category was on a response we did
-- not keep. So every row retained before these columns exist is permanently uncategorised,
-- and the catalog is the thing the whole swap feature is waiting to fill. Cost today: one
-- migration and one enum value on a model call already being made. Cost later: re-fetching
-- or re-reading the entire catalog, for the rows where that is even possible.
--
-- TWO COLUMNS, DELIBERATELY. `category` is a closed vocabulary (lib/productCategory.js) so
-- rows GROUP — four spellings of "protein bar" are one category to a shopper and four to a
-- `group by`, and a swap engine that cannot group suggests nothing. `category_raw` keeps
-- whatever the source actually said, so everything that lands in `other` stays visible and
-- frequency-rankable instead of being a silent loss. That is the same argument counter_gaps
-- makes for the counter's authoring backlog: the misses ARE the backlog.
--
-- Idempotent, and it contains NO DATA WRITE — see schemaSafety.test.js, which fails if any
-- supabase/*.sql file carries an insert/update/delete outside a function body. Applying this
-- must never change what any user has.

alter table scanned_products add column if not exists category text;
alter table scanned_products add column if not exists category_raw text;

-- The read this exists to serve, eventually: "given this product's category, what else is
-- in it that Kristy approved". Partial, because a row with no category answers nothing and
-- there is no reason to carry it in the index.
create index if not exists scanned_products_category_idx
  on scanned_products (category)
  where category is not null;

-- ─────────────────────────────────────────────────────────────────────────────────────────
-- WHETHER A FOOD LABEL WAS BEHIND IT — the cache half of the non-food seal gate.
--
-- The gate itself is LIVE (verdictEngine.js: `unverifiedAsFood`, shipped 2026-08-09). It
-- withholds the seal from an `approved` product whose source published no energy figure, which
-- is what stops a bottle of dish soap earning the gold stamp — `approved` means "zero KB
-- entries matched", and a detergent matches nothing by construction.
--
-- ⚠️ IT ONLY FIRES WHERE THE NUTRITION CAME FROM OFF, AND `scanned_products` STORES NO
-- NUTRITION. So the moment a product is retained, the barcode door answers from our own store,
-- resolves the panel to `unknown`, and `unknown` withholds nothing. That is the correct default
-- and it means THE SELF-HEAL LOOP REOPENS THE HOLE FOR EVERY PRODUCT IT CACHES — which, over
-- time, is most of them. Verified on production: 0030772117484 (Dawn Platinum Plus Powerwash)
-- answers `source:"store"`, `nutrition:null`, and comes back `tier:"approved"`, `stamp:true`.
--
-- ⚠️ NOT BACKFILLABLE, for exactly the reason `category` is not: the figure was on an OFF
-- response nobody kept. Same clock, same shape, same migration.
--
-- TRI-STATE, AND NULL IS THE THIRD STATE RATHER THAN A FOURTH. 'present' / 'absent' are the
-- only values ever written; NULL means "no source that publishes energy has been asked about
-- this row" and reads back as `unknown`, which withholds NOTHING. That mapping is what makes
-- the column safe to add before it is populated: every existing row is NULL, so applying this
-- changes no verdict. It is also why the label-photo path must never write here — it discards
-- calories by design, so a two-state flag would strip the seal off every clean food a shopper
-- photographs. See the tri-state note in scanExtract.js `nutritionFromOFF`.

alter table scanned_products add column if not exists nutrition_panel text;

-- ⚠️ NO CHECK CONSTRAINT ON `category` OR `nutrition_panel`, AND THAT IS A DECISION RATHER
-- THAN AN OMISSION.
-- The vocabulary is enforced in one place — `normalizeCategory` — which collapses anything
-- unrecognised to 'other' before the insert, so the database can never see a bad value from
-- this app. A CHECK would put a SECOND copy of the list in a second language, and the two
-- would drift the moment the list is widened: the migration would have to be re-run in
-- lockstep with a code deploy, and the failure mode is an insert rejected in production for
-- a category that legitimately is part of the vocabulary. That is exactly the shape of the
-- frozen-tokens.js problem — a check whose only escape hatch is editing something you are
-- not deploying. One list, in the code, beside the thing that validates against it.
