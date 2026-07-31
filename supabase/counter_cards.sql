-- ─────────────────── The counter's cards (answers, not people) ───────────────────
-- The Counter's renderable corpus. Every card — the 77 projected from the authored
-- perimeter KB and every one generated for a question the KB could not answer — is a
-- row here, in ONE shape, so a generated card renders identically to a curated one.
--
-- THIS TABLE IS A PROJECTION, NOT A REPLACEMENT. kristy_perimeter_kb.json stays the
-- source of record for the 77 curated entries: the migration re-derives every
-- `source = 'curated'` row from it and is safe to re-run. Edit the KB, re-run the
-- migration. Never edit a curated row here by hand — the next run overwrites it.
--
-- SAME DISCIPLINE AS scanned_products AND counter_gaps, AND FOR THE SAME REASON:
-- there is no user_id column and there never should be. A card is an answer to a
-- question about food; who read it is a surveillance log. `use_count` is a counter on
-- the CARD, deliberately not a join to a person — it says an answer earned its place,
-- not who needed it.

create table if not exists counter_cards (
  id uuid primary key default gen_random_uuid(),
  -- The stable identity. For a curated card this is the KB entry id verbatim, which
  -- is what makes the migration an upsert instead of an append.
  slug text not null,
  -- The browse section it lives under: produce | meat | seafood | eggs_dairy |
  -- bulk_pantry | label_terms. Mirrors PERIMETER_SECTIONS in lib/perimeter.js.
  section text,
  topic text not null,
  -- Where the action lives. A 'shelf' card names something observable in the store —
  -- a printed word, a colour, a number, a specific product. A 'home' card is about
  -- washing, storing or keeping, where there is no store action to name and faking one
  -- would be worse than admitting it. Home cards still carry a `do` line and still hold
  -- the ≤14-word imperative bar; the observable is simply in the kitchen. The client
  -- gives them a distinct eyebrow treatment and never an add-to-cart.
  kind text not null default 'shelf' check (kind in ('shelf', 'home')),

  -- ── SUMMARY: everything that renders before a tap ────────────────────────────
  -- Headline + one line + an action. No deck paragraph, no checklist. A shopper
  -- holding a cart has about two seconds, and this is what they get.
  eyebrow text,
  headline text not null,
  -- `do` is a RESERVED keyword in Postgres (the DO statement), so the column cannot
  -- be named `do` without double-quoting it at every single call site. The physical
  -- name is do_line; the card JSON the client renders still calls it `do`, exactly as
  -- specified. lib/counterCards.js is the only place the two names meet.
  do_line text,
  tier text check (tier in ('established', 'credible_concern', 'kristys_standard', 'time_tested')),
  -- A grocery NAME, and nothing else — the one-tap add to cart. Null where the verdict
  -- does not resolve to a single honest product.
  cta_item text,

  -- ── EXPANDED: on tap ─────────────────────────────────────────────────────────
  why text,
  look_for jsonb not null default '[]'::jsonb,
  watch_out jsonb not null default '[]'::jsonb,
  -- Why this card carries the tier it carries — the claim tied to its evidence basis.
  tier_note text,

  -- ── The depth, carried so the migration is LOSSLESS ──────────────────────────
  -- The perimeter KB entry is five fields deep. The summary/expanded split above is a
  -- re-ranking of authored content, never a truncation of it, so the long read, her
  -- standard, the decoded label terms and the sources travel with the card rather than
  -- being dropped on the floor. Demoted, never deleted.
  detail text,
  kristy_take text,
  labels_decoded jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,

  source text not null default 'curated' check (source in ('curated', 'generated')),
  -- The question that caused a generated card to exist. Null for curated cards. This is
  -- the seed, not the asker: it is stored already normalized and scrubbed by the same
  -- path counter_gaps uses, for the same reason.
  query_seed text,
  use_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- The upsert key. One card per slug, which is what makes the migration re-runnable.
create unique index if not exists counter_cards_slug_key on counter_cards (slug);
create index if not exists counter_cards_section_idx on counter_cards (section);
-- The self-healing corpus, read newest-and-most-used first.
create index if not exists counter_cards_generated_idx
  on counter_cards (use_count desc, created_at desc) where source = 'generated';

-- counter_cards holds no user data, and is locked the same way scanned_products and
-- counter_gaps are: RLS on with NO policy means only the service role (the server) can
-- read or write it. Clients reach cards exclusively through the counter endpoints.
alter table counter_cards enable row level security;
