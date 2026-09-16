-- A VERSION STAMP ON scanned_products, NOT A TTL AND NOT "IS THE CATEGORY `other`".
--
-- `category_version` records which pass of the aisle patterns (lib/productCategory.js
-- CATEGORY_VERSION) last decided this row's category. `null` means "never checked against
-- the current patterns" — every existing row starts here, and a row stays here forever if
-- nothing ever re-reads it.
--
-- ⚠️ THE BUMP RULE IS AN ASYMMETRY, AND IT IS THE PART EASY TO GET BACKWARDS. The code stamps
-- on an OFF hit — even when the category resolves to `other` — and on an OFF not-found. It
-- NEVER stamps on a network failure: stamping a timeout would record "we checked" for a check
-- that never happened, retiring the row from re-checking forever. The failure direction is
-- safe only while the row stays stale, so an unstamped row is the safe default, not a bug.
--
-- Idempotent, and it contains NO DATA WRITE — see schemaSafety.test.js, which fails if any
-- supabase/*.sql file carries an insert/update/delete outside a function body. Applying this
-- must never change what any user has.
--
-- Applied by the owner in the Supabase SQL editor BEFORE the code that reads it deploys.

alter table public.scanned_products add column if not exists category_version integer;
