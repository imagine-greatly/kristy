# Kristy

A holistic grocery coach. You tell her what you're shopping for, she builds the cart, and
she reads the labels with you in the aisle.

Scan is a tool, not the identity — the unit of the product is **the trip**. A cart, the
scans that happen against it, and the read afterwards are all views of one object.

> This README is the human-facing overview of the system as built. The working status log
> — what shipped in which block, and why — lives in [`CLAUDE.md`](CLAUDE.md). Where the two
> overlap, `CLAUDE.md` is the changelog and this file is the map.

---

## What it is now

Kristy judges packaged food against a curated ingredient knowledge base, answers questions
about the unlabeled perimeter of the store (fish counter, butcher, produce, bulk bins), and
turns a sentence like *"three high-protein dinners for four, no seed oils"* into an actual
shopping cart.

Two rules constrain everything the model is allowed to say:

- **The claim lock.** Every health or ingredient claim traces to a matched entry in a
  knowledge base. Entries are structurally stripped to an allowlist of fields *before* the
  model call, so the model can rephrase tone but cannot introduce a concern, a mechanism,
  or a claim that wasn't in the data it was handed.
- **No treatment.** Kristy is a coach, not a clinician. Dietary focuses are preferences the
  user turns on about themselves, never inferences. No claim of treating, managing,
  lowering, reversing, or curing anything — and symmetrically, no claim that an ingredient
  *causes* a disease.

There is **no calorie or macro tracking**. It was removed as a feature (not hidden behind a
flag), and the no-macro rule is enforced structurally in `server/lib/macroGuard.js` — a
reply that volunteers macro accounting triggers one corrective regeneration, then a
deterministic sentence-strip.

---

## Repo layout

```
client/     React + Vite SPA — the reference implementation (Vercel)
server/     Express API + the verdict engine + both knowledge bases (Railway)
supabase/   Plain .sql schema files (applied by hand — see Migrations)
mobile/     Expo / React Native port — PRE-repositioning, see "Mobile" below
```

`client` and `server` are npm workspaces off the root `package.json`. `mobile` is a separate
project with its own lockfile and is **not** part of the workspace.

---

## Architecture

### Client — React 18 + Vite 5, deployed on Vercel

A thin client. It renders verdict objects; it does not compute them.

Vite serves two entries (see `client/vite.config.js` + `client/vercel.json`):

| Route | Serves |
| --- | --- |
| `/` | `public/landing.html` — the static public landing page |
| `/app`, `/app/*` | `app.html` — the React app (auth lives behind here) |

There is deliberately no root `index.html` in the build output, because on Vercel the
filesystem is checked before rewrites and a real `index.html` would shadow the `/` → landing
rewrite. The same rewrite runs in `vite dev` and `vite preview`, so routing is identical in
all three environments.

Notable client modules:

- `src/lib/cart.js` — `useCart`, the lifted trip state owned by `App`. A scan can land in
  the trip before the cart screen has ever mounted.
- `src/lib/barcode.js` — checksum validation + UPC-E → UPC-A expansion **before** any
  lookup, so a partial decode fails to the label-photo path rather than resolving against
  someone else's product.
- `src/lib/tokens.js` — the centralized design tokens. Colors and faces are imported from
  here, never inlined.
- `src/lib/config.js` — `IS_DEMO` / `IS_MISCONFIGURED`. Demo mode does **not** auto-engage
  in a production build; a deploy missing `VITE_SUPABASE_*` renders a named error screen
  instead of quietly serving fixture data.

### Server — Express 4 on Node 22, deployed on Railway

Authoritative for everything that constitutes a judgment. NIXPACKS builder, `npm start`,
health check at `/api/health` (see `server/railway.json`).

The server holds the knowledge bases, the matching, the tier scoring, and every claim-locked
model call. Clients never see a KB entry the model wasn't allowed to see.

### Data & auth — Supabase

Postgres + Supabase Auth, phone/SMS one-time code (`signInWithOtp` / `verifyOtp`). RLS is on
for every user-facing table with own-row-only policies. The server uses the **service role**
key and bypasses RLS; the browser only ever gets the anon key.

Tables (`supabase/schema.sql`): `user_goals`, `haul_scans`, `shopping_lists`,
`subscriptions`, `scanned_products`, `chat_messages`, plus the legacy tracker tables
(`meal_logs`, `weight_logs`, `weekly_summaries`) that are retained but no longer written by
any live UI path. `verdicts` (`verdicts.sql`) and `push_tokens` (`push_tokens.sql`) are
separate files.

### AI — Anthropic Claude Haiku 4.5

One model id, in one place: `server/lib/anthropic.js` (`claude-haiku-4-5-20251001`). Every
prompt lives in `server/lib/prompts.js` or beside its composer, and each of the five
user-facing prompts (chat, verdict note, perimeter answer, haul read, list compose) carries
the voice spec and the hard rules verbatim — asserted by tests, not by convention.

---

## The verdict engine

`server/lib/verdictEngine.js` is the authority. It is deterministic: matching and tier
scoring involve no model call at all. The model is only ever invoked afterward, to phrase a
note about entries the engine already selected.

**Five tiers**, ladder by max severity:

```
approved → approved_with_note → use_with_intention → swap_recommended → skip
```

The gold "Kristy Approved" seal renders **only** on `approved`. Every tier below it gets a
plain verdict bar.

Notable properties, each pinned by a test:

- `matched` stays **concerns-only**. Positive entries ride in a separate `affirmed` /
  `affirmationLayer`, because every `severity_level` is a *concern* level — a positive entry
  inside `matched` would score as a concern and strip the seal from any product containing
  garlic.
- **Focus escalation is bounded.** A dietary focus can raise the tier at most to
  `swap_recommended`; only a `critical` KB ingredient can ever produce `skip`. A focus can
  never fabricate a flag.
- **Hard lines are deterministic** (`server/lib/hardLines.js`), not prompt-only. A declared
  line resolves to KB ids, escalates on the same bounded ladder, and withholds the seal.
  `gluten-free` / `dairy-free` stay **advisory** — the KB has no such data, and claiming to
  check it would be fabrication.
- **An incomplete label read may not produce a clean approval.** A partial panel can't
  falsely *flag* (every matched entry was genuinely printed) but it can falsely *approve*,
  because the unread tail is where the canola oil hides. So flags on a partial read stand
  and are shown; only `approved` is withheld (`guardIncompleteRead`).

### Knowledge bases

Two, never merged.

| | File | Size | What it holds |
| --- | --- | --- | --- |
| **Ingredient KB** | `server/kristy_ingredient_knowledge_base.json` | 74 entries | Flags and affirmations, matched against an ingredient list. Fed to the engine. |
| **Perimeter KB** | `server/kristy_perimeter_kb.json` | 35 entries, 7 categories | Topics that answer a question about the unlabeled store — seafood, beef, poultry/eggs, produce, dairy, bulk pantry, label terms. **Never** fed to the engine. |
| **Education** | `server/kristy_education.json` | 15 "isms" | Ambient one-per-card teaching content. |

Both KBs share four **evidence tiers**, and Kristy names which one she's speaking from:

- `established` — mainstream scientific consensus
- `credible_concern` — real evidence, live debate
- `kristys_standard` — her own position, labeled as such
- `time_tested` — traditional use; may justify food-worth **only**, never a health outcome

That last tier is enforced structurally, not just in the prompt: `sanitizeAffirmed` withholds
`why`, `kristy_note`, **and** `history` from the model, because history is the richest source
of a tempting "used as a remedy for…" claim.

---

## The food-data stack

Three layers, in lookup order (`server/lib/productStore.js`, `server/routes/scan.js`):

```
1. Kristy's own store   scanned_products, keyed by barcode (else a name+ingredients hash)
2. Open Food Facts      the public base layer
3. Claude vision        a photo of the ingredient panel — the coverage edge
```

Vision **only ever extracts ingredients** (plus product name/brand if legibly printed, and a
self-reported `panel: full | partial | none`). It never produces a judgment — the extracted
list flows through the same engine, the same KB, the same claim lock as a barcode scan.

The moat mechanism: when a label photo answers a barcode *miss*, the client sends the
barcode along, the read is filed under it, and **that barcode resolves from Kristy's own
store next time, for everyone**. The database self-heals from real usage.

Three disciplines hold it together:

- **Products, not people.** `scanned_products` has no `user_id` column and never should —
  the per-user record of a scan is `haul_scans`. A test greps for it.
- **A bad read may not poison a good product.** Confidence ordering is
  `off/full` > `vision/full` > `vision/partial`, so a legible photo can't overwrite an OFF
  record. This also closes the tampering path, since the label endpoint accepts a
  client-supplied barcode.
- **The store holds ingredients, never judgments.** A cached hit re-runs the full engine.
  The stored `tier` is provenance only, and `stampTier` is update-only, so a forged barcode
  can never introduce a product.

Coverage options that were assessed but **not** integrated (USDA FoodData Central, Nutritionix,
Syndigo) are written up in [`BARCODE_COVERAGE.md`](BARCODE_COVERAGE.md).

---

## The three surfaces

Nav is three moments plus a raised gold scan button. The app opens on the **cart**, not the
scanner — the one exception being a just-finished trip, which opens the Haul because its read
is what's useful then (`initialMoment()` in `client/src/lib/cart.js`, cache-only and
synchronous so there's no boot delay).

### Cart — *before the trip*
`CartMoment.jsx` · nav label **Cart** · internal moment id `list` · `server/routes/list.js`

An empty cart opens with **a question** — *"What are we shopping for today?"* — not a
template. `GET /api/list` deliberately does not generate into an empty cart; four quick-taps
*seed the input field* (editable, never auto-submitted) and the answer runs the build path.

- Cart generation is server-side and authoritative. Goal set, focuses, hard lines, and
  constraints are read from the **DB, never the request body**, so a tampering client can't
  obtain premium capabilities.
- Goals are a **set**, not one value (`coach_goals text[]`, with `coach_goal` kept in sync as
  a primary shim for single-goal readers). The list blends every active goal, ranked by
  overlap so shared anchors lead and no goal is treated as primary.
- Four orthogonal preference dimensions: **Goals** (shopping toward) · **Focuses** (watching)
  · **Hard lines** (refusing) · **Constraints** (what you're working with — budget, short on
  time, picky kids, no kitchen, cooking for one).
- The conversational editor (`server/lib/listCompose.js`) is claim-safe *by construction*: a
  shopping list is grocery names only, so the model emits `{add, remove, summary}` and the
  route applies the edit deterministically.
- Items group by store section in walking order. Every item has an **Ask** affordance that
  runs the perimeter loop and can refine the item in place ("Olive oil" → "Fresh, dark-bottle
  EVOO").

### Scan — *in the aisle*
`ScanHome.jsx`, `CameraModal.jsx`, `ScanSheet.jsx` · `server/routes/scan.js` → `/api/verdict`

Barcode (ZXing, in-browser) and label photo, in that order — a barcode miss auto-pivots to
the label path, which is a first-class flow rather than an error recovery. The camera
viewfinder is deliberately text-free: the feed, four gold corner brackets, and a close
button. All instructional copy lives on `ScanHome`, before the camera opens.

A lookup only ever answers about the barcode in your hand: one decode per camera opening,
a monotonic ticket per scan so a stale response is dropped entirely, and the OFF response is
verified against the request (tolerating zero-padding on purpose — a 12-digit UPC-A is
commonly stored as a 13-digit EAN).

### Haul — *after the trip*
`HaulMoment.jsx` · `server/routes/haul.js`

The trip filling in, not only a post-mortem: `This trip` / `Earlier this week`, a
distribution bar, and Kristy's weekly read (claim-locked, in her voice).

`buildCarryForward` closes the loop deterministically — no model call, since every name
already exists. It splits the week into **keep** (scanned, no objection), **missed** (on the
cart, never checked off) and **replace** (she'd pick differently). Keep and missed are
pre-selected; **replace never is** — carrying a product she flagged into next week unasked
would be putting words in the shopper's mouth. `POST /api/haul/next` writes the accepted set
as the next cart.

`haulCanvas.js` renders a branded 1080×1350 PNG scorecard for sharing, with a "hide personal
data" toggle.

---

## Free, trial, and paid

Gating is provider-agnostic — features are never gated on "has a Stripe record", only on the
internal `subscriptions.status` (`server/lib/subscription.js` `isPremium()`, mirrored by the
`public.is_premium(uid)` SQL function).

| | Free | Premium |
| --- | --- | --- |
| Scanning + verdict tier + universal layer | ✅ always | ✅ |
| Personalized note | first 3 free, lifetime | ✅ |
| Focus escalation | — | ✅ |
| Cart | basic goal template, minus hard lines | focus- and constraint-aware, haul swaps, conversational editor |
| Perimeter answers | the free entry read | personalized + item refinement |
| Haul weekly read | — | ✅ |

Hard lines and goal-template exclusions apply on **every** tier — a declared line is a
refusal, not an upsell.

The 7-day trial is granted through exactly one explicit door, `POST /api/subscription/trial`
(idempotent — an existing trial/paid/expired row is returned untouched, so a consumed trial
can't restart). Setting a goal grants nothing; coupling the two silently killed the 3-free-notes
mechanic and spent a weekly-cadence trial on a casual goal-tap.

### Billing

**Stripe (web)**: **$5.99/month · $44.99/year** (annual is the hero: $3.75/month, 37% off).
Prices are authored once in `client/src/lib/pricing.js`; the effective monthly and the
saving percentage are derived, and `server/lib/pricing.test.js` enforces both.

- Price **ids** are configuration and never reach the client. The server reads
  `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` from env; the client posts a plan *name*
  (`monthly` | `annual`).
- Displayed price **strings** have a single source per client: `client/src/lib/pricing.js`
  and `mobile/src/lib/pricing.ts`. No price literal exists anywhere else. Keep these in sync
  with the Stripe dashboard.
- Checkout fails **loud**: an unset var is named in the logs and returns a Kristy-voiced 503,
  never a dead button.

**RevenueCat / Apple IAP (native) is deferred** — the webhook (`/api/revenuecat/webhook`),
the `subscriptions.provider = 'apple'` path, and the mobile config all exist and write to the
same table, but no native app has shipped.

---

## Setup

### Prerequisites

- Node **22.x** (`engines` on both root and server)
- A Supabase project
- An Anthropic API key

### Install

```bash
npm install                 # installs the client + server workspaces
```

### Environment

Copy the examples and fill them in — `server/.env.example`, `client/.env.example`.

**`server/.env`**

| Var | Required | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | ✅ | Every model call. |
| `SUPABASE_URL` | ✅ | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Trusted, bypasses RLS. **Never** expose to a browser. |
| `CLIENT_ORIGIN` | ✅ | Comma-separated CORS allowlist. Defaults to `http://localhost:5173`. |
| `PORT` | | Defaults to `3001`. |
| `STRIPE_SECRET_KEY` | | Leave all four Stripe vars blank to run without billing — trial + free features still work and the billing endpoints return a clean 503. |
| `STRIPE_WEBHOOK_SECRET` | | From the endpoint you create for `/api/stripe/webhook`. |
| `STRIPE_PRICE_MONTHLY` | | A `price_xxx` id. |
| `STRIPE_PRICE_ANNUAL` | | A `price_xxx` id. |
| `CRON_SECRET` | | Guards the all-users cron trigger. Blank disables it. |
| `BIRD_API_KEY` | ✅ for phone sign-in | Bird SMS access key (`bk_<region>_…`). The region is read off the prefix. |
| `SEND_SMS_HOOK_SECRETS` | ✅ for phone sign-in | `v1,whsec_<base64>` from the Supabase hook. Separate rotated secrets with `\|`, never a comma. |
| `BIRD_TEMPLATE_NAME` | | Defaults to `bird_otp_verification`. |
| `BIRD_TEMPLATE_LANGUAGE` | | BCP-47 tag for a localized template body. Blank ⇒ English. |
| `BIRD_REGION` | | Only to override the region the key prefix already implies. |
| `SODIUM_HIGH` / `ADDED_SUGAR_HIGH` / `CAFFEINE_HIGH` | | Engine thresholds. Sensible defaults in `verdictEngine.js`. |

**`client/.env`** — only `VITE_*` vars reach the browser.

| Var | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Anon/public key only — RLS protects the data. |
| `VITE_API_URL` | ✅ in prod | Blank in dev to use the Vite proxy. **Required in a production build** — blank there makes every fetch hit the Vercel origin, which has no `/api` rewrite, so the app would load and then 404 on everything. A prod build without it renders the misconfiguration screen rather than guessing a URL. |
| `VITE_DEMO` | | `true` to explore the UI with mock responses and no backend. |

### Migrations

The `supabase/` directory holds **plain `.sql` files** — there is no Supabase CLI project
config in the repo, so apply them by hand in the Supabase SQL editor (or via `psql`):

```
supabase/schema.sql        tables, RLS policies, triggers, the is_premium() helper
supabase/verdicts.sql      the verdicts table
supabase/push_tokens.sql   Expo push tokens (mobile)
```

`schema.sql` is written to be **idempotent and re-runnable** — every table is
`create table if not exists` and every later column is `alter table … add column if not
exists`, so re-applying it is how you pick up new columns. Run it again after pulling.

Server reads are defensively tiered: if a column hasn't been migrated yet the read falls back
rather than failing, so a stale DB degrades quietly instead of breaking the app.

> ⚠️ **Not yet applied in the current dev environment** (per `CLAUDE.md`): the
> `scanned_products` table and the `coach_goals` / `constraints` / `macro_tracking` columns.
> Until `scanned_products` exists, `lookupProduct` returns `null` and `retainProduct` logs
> and no-ops — the scan path degrades silently to Open Food Facts and still works.

### Run locally

```bash
npm run dev            # client (5173) + server (3001) together
npm run dev:client
npm run dev:server
```

In dev the Vite server proxies `/api` → `http://localhost:3001`, so leave `VITE_API_URL`
blank. The landing page is at `http://localhost:5173/` and the app at
`http://localhost:5173/app`.

Zero-setup option: with no Supabase vars set, a **dev** build auto-enters demo mode (mock
data, no backend). A production build never does.

### Test

```bash
npm test --workspace server     # node --test — 147 tests
npm run build --workspace client
```

The server suite is where the invariants live: claim-lock tests plant a fabricated cure
string and prove it never reaches the model payload; a regression test asserts no KB entry
(positive *or* negative) matches butter/ghee/tallow; another asserts every goal in the
taxonomy has a cart template.

> Note: a cold `vite build` can be slow on a OneDrive-synced working copy.

### Deploy

- **Client → Vercel.** Build `npm run build --workspace client`, output `client/dist`.
  `client/vercel.json` carries the landing/app rewrites. Set the `VITE_*` vars in the Vercel
  project — a production build with them missing renders a named misconfiguration screen.
- **Server → Railway.** `server/railway.json` (NIXPACKS, `npm start`, health check
  `/api/health`). Set the server env vars there. Point `CLIENT_ORIGIN` at the Vercel domain
  and `VITE_API_URL` at the Railway domain.
- **Stripe webhook** → `POST https://<server>/api/stripe/webhook`. It is mounted *before*
  `express.json()` with a raw body parser, because signature verification needs the exact
  bytes Stripe signed.
- **Supabase Send SMS hook** → `POST https://<server>/api/auth/hooks/send-sms`. Same
  raw-body rule, same reason (Standard Webhooks signs the exact bytes). Register it under
  Authentication → Hooks → Send SMS. Supabase mints and verifies the OTP; this endpoint only
  delivers it, through Bird's template API. Supabase's built-in MessageBird provider is
  **not** usable — it calls Bird's retired originator+body API and 422s.

---

## Mobile

`mobile/` is an Expo / React Native port sharing the same Supabase project and the same
Railway API.

> ⚠️ **It has not been updated for the grocery repositioning.** Its surfaces are still the
> pre-overhaul tracker — `MacroCard`, `MacroRing`, `WeightTrendChart`, chat-first navigation —
> and it has no cart, haul, or perimeter surface. It calls server endpoints (`/api/photo`,
> `/api/weight`, `/api/barcode`) that the web client no longer routes to. Treat it as a
> port awaiting rework, not as a second live client. See `mobile/README.md` for its own
> build instructions.

---

## Known dead code

Retained deliberately (DB tables untouched), flagged so nobody mistakes it for live surface
area:

- **Endpoints with no live web caller:** `/api/photo`, `/api/weight`, `/api/history`,
  `/api/barcode`, `/api/weekly-summary`. The client-side helper functions still exist in
  `client/src/lib/{logging,api,data}.js` but nothing in the UI calls them.
- **The macro pipeline:** `server/lib/mealResolver.js`, `server/lib/usda.js`, and the
  `USDA_API_KEY` env var have no live caller — USDA macro resolution went away with macro
  tracking. The var is still documented in `server/.env.example`; that comment is stale.
- **Legacy tables:** `meal_logs`, `weight_logs`, `weekly_summaries` and the TDEE columns on
  `user_goals` are no longer written by any live UI path.

---

## Further reading

| File | What it is |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | Current state of the product plus the rules that bind every change. Authoritative. |
| [`VOICE_SPEC.md`](VOICE_SPEC.md) | The voice: zero first person. The tier ownership is rephrased, never dropped. |
| [`VISION.md`](VISION.md) | Character direction — deliberately post-mechanics, largely unbuilt. |
| [`BARCODE_COVERAGE.md`](BARCODE_COVERAGE.md) | Assessed barcode-coverage providers. Reported, not integrated. |
