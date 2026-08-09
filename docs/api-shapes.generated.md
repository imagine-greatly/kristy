# API response shapes — GENERATED, DO NOT EDIT

`node server/scripts/buildApiShapes.js` writes this file; `apiShapes.test.js` fails if it is
stale. Edit the handler, re-run, commit both. Consumed by `SWIFT-SPEC.md` §A.

**Read the caveat before trusting a shape.** This is derived from `res.json(...)` object
literals. A response built by a helper (`res.json(summary(row))`) or carrying a spread
(`{ ...publicEntry(e) }`) cannot be expanded statically and is listed under **NEEDS
HAND-CHECK** with the expression that defeated it. `???` means the key exists and its type
came from an identifier, not a literal. Request bodies are NOT derived at all.

## account.js

Mounted at: `/api`

### DELETE /account  ·  requireAuth

- `200` → { ok: Bool }
- `500` → { error: Bool, message: String }

## barcode.js

Mounted at: `/api`

### POST /barcode  ·  requireAuth

- `400` → { error: String }
- `200` → { found: Bool, hasFood: Bool, message: ???, macros: String?, foods: […], insight: String }
- `200` → { found: Bool, hasFood: Bool, productName: ???, message: ???, macros: ???, foods: […], insight: String, servingNote: ??? }
- `200` → { found: Bool, hasFood: Bool, message: ???, macros: String?, foods: […], insight: String }

## billing.js

Mounted at: `/api/billing`

### POST /checkout  ·  requireAuth

- `503` → `NOT_CONFIGURED` — **NEEDS HAND-CHECK** (built elsewhere)
- `200` → { url: ??? }
- `500` → { error: Bool, message: String }

### POST /portal  ·  requireAuth

- `503` → `NOT_CONFIGURED` — **NEEDS HAND-CHECK** (built elsewhere)
- `400` → { error: Bool, message: String }
- `200` → { url: ??? }
- `500` → { error: Bool, message: String }

## chat.js

Mounted at: `/api`

### POST /chat  ·  requireAuth

- `400` → { error: String }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, listUpdate: … }
  - plus a spread of `…` — **NEEDS HAND-CHECK**
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, perimeter: Bool }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, perimeter: Bool, perimeterMiss: Bool, perimeterEntry: String? }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, preferenceUpdate: … }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, upgrade: Bool, preferenceLocked: Bool }
- `200` → { — }
  - plus a spread of `result` — **NEEDS HAND-CHECK**
- `503` → { error: Bool, message: String }

## counter.js

Mounted at: `/api`

### GET /counter/sections  ·  public

- `200` → { sections: ??? }
- `500` → { error: String }

### GET /counter/sections/:id  ·  optionalAuth

- `404` → { error: String }
- `200` → { id: ???, title: ???, thinNote: ???, shortcuts: ???, cards: ??? }
- `500` → { error: String }

### GET /counter/essentials  ·  optionalAuth

- `200` → { cards: ???, count: ??? }
- `500` → { error: String }

### GET /counter/cards  ·  optionalAuth

- `200` → { cards: ???, count: ??? }
- `500` → { error: String }

### GET /counter/summaries  ·  optionalAuth

- `200` → { cards: … }
- `200` → { cards: ??? }
- `500` → { error: String }

### GET /counter/cards/:slug/full  ·  optionalAuth

- `404` → { error: String }
- `200` → { card: ???, spent: Bool, premium: ??? }
- `402` → { gated: Bool, card: ???, limit: ??? }
- `200` → { card: ???, spent: Bool, remaining: ??? }
- `200` → { card: ???, spent: Bool, remaining: ??? }
- `500` → { error: String }

### GET /counter/cards/:slug  ·  optionalAuth

- `404` → { error: String }
- `200` → `forViewer(card, await viewerFor(req))` — **NEEDS HAND-CHECK** (built elsewhere)
- `500` → { error: String }

### POST /counter/ask  ·  optionalAuth

- `400` → { error: String }
- `429` → { error: Bool, message: String }
- `200` → `result` — **NEEDS HAND-CHECK** (built elsewhere)
- `200` → `body` — **NEEDS HAND-CHECK** (built elsewhere)
- `200` → { gated: Bool, upsell: ??? }
  - plus a spread of `body` — **NEEDS HAND-CHECK**
- `200` → { personal: … }
  - plus a spread of `body` — **NEEDS HAND-CHECK**
- `200` → `body` — **NEEDS HAND-CHECK** (built elsewhere)
- `500` → { error: String }

## guest.js

Mounted at: `/api/guest`

### POST /chat  ·  public

- `400` → { error: String }
- `200` → { gate: Bool, reason: String, kristyLine: ??? }
- `200` → { gate: Bool, reason: String }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, perimeter: Bool, perimeterEntry: ??? }
- `200` → { message: ???, hasFood: Bool, macros: String?, foods: […], insight: String, perimeter: Bool, perimeterMiss: Bool, perimeterEntry: String? }
- `200` → `result` — **NEEDS HAND-CHECK** (built elsewhere)
- `503` → { error: Bool, message: String }

### POST /list  ·  public

- `429` → { error: String, message: String }
- `400` → { error: String }
- `200` → { list: ???, taste: Bool, prefs: ??? }
- `503` → { error: Bool, message: String }

### POST /list/attach  ·  public

- `429` → { error: String, message: String }
- `400` → { error: String }
- `200` → { list: ???, guest: Bool }
- `503` → { error: Bool }

### POST /list/import  ·  public

- `429` → { error: Bool, message: String, gate: Bool, reason: String }
- `200` → { list: String?, summary: String, imported: Double, guest: Bool }
- `200` → { list: ???, summary: ???, imported: ???, specified: ???, guest: Bool }
- `503` → { error: Bool, message: String }

### POST /list/compose  ·  public

- `400` → { error: String }
- `429` → { error: Bool, message: String, gate: Bool, reason: String }
- `200` → { list: ???, summary: ???, premium: Bool, guest: Bool }
- `503` → { error: Bool, message: String }

## haul.js

Mounted at: `/api`

### POST /haul/scan  ·  requireAuth

- `400` → { error: String }
- `200` → { ok: Bool, scan: ??? }
- `500` → { error: String }

### GET /haul  ·  requireAuth

- `200` → { trip: ???, week: ???, distribution: ???, insightsGated: Bool }
- `500` → { error: String }

## history.js

Mounted at: `/api`

### GET /history/:date  ·  requireAuth

- `400` → { error: String }
- `200` → { date: ???, messages: ??? }
- `500` → { error: String }

## ingredient.js

Mounted at: `/api`

### GET /ingredient/:id  ·  public

- `404` → { error: String }
- `200` → { education: ??? }
  - plus a spread of `publicEntry(entry)` — **NEEDS HAND-CHECK**

## internal.js

Mounted at: `/api/internal`

### GET /growth  ·  public

- `200` → `await growthSnapshot()` — **NEEDS HAND-CHECK** (built elsewhere)
- `500` → { error: Bool, message: String }

### GET /growth.html  ·  public

- no `res.json` found (streams, redirects, or `res.send`) — **NEEDS HAND-CHECK**

## list.js

Mounted at: `/api`

### GET /list  ·  requireAuth

- `200` → { list: String?, premium: ???, pendingSwaps: ??? }
- `200` → { list: ???, premium: ??? }
- `500` → { error: String }

### POST /list  ·  requireAuth

- `400` → { error: String }
- `200` → { ok: Bool, list: ??? }
- `500` → { error: String }

### POST /list/rebuild  ·  requireAuth

- `200` → { list: ???, premium: ??? }
- `500` → { error: String }

### POST /list/compose  ·  requireAuth

- `400` → { error: String }
- `429` → { error: Bool, message: ??? }
- `200` → { list: ???, summary: ???, premium: Bool }
- `503` → { error: Bool, message: String }

### POST /list/swaps  ·  requireAuth

- `200` → { ok: Bool, pending: Double }
- `200` → { ok: Bool, pending: ??? }
- `200` → { ok: Bool, pending: Double }

### POST /list/import  ·  requireAuth

- `200` → { list: String?, summary: String, imported: Double }
- `200` → { list: ???, summary: ???, imported: ???, specified: ??? }
- `503` → { error: Bool, message: String }

## onboarding.js

Mounted at: `/api`

### POST /onboarding/coach  ·  requireAuth

- `200` → { ok: Bool, profile: ??? }
- `500` → { error: String }

### POST /onboarding/full  ·  requireAuth

- `200` → { ok: Bool, goals: ???, profile: ??? }
- `500` → { error: String }

## perimeter.js

Mounted at: `/api`

### GET /perimeter  ·  public

- `200` → { topics: ??? }

### GET /perimeter/sections  ·  public

- `200` → { sections: ??? }

### GET /perimeter/sections/:id  ·  public

- `404` → { error: String }
- `200` → `section` — **NEEDS HAND-CHECK** (built elsewhere)

### GET /perimeter/:id  ·  public

- `404` → { error: String }
- `200` → `publicEntry(entry)` — **NEEDS HAND-CHECK** (built elsewhere)

### POST /perimeter/ask  ·  optionalAuth

- `400` → { error: String }
- `429` → { error: Bool, message: String }
- `200` → { matched: Bool, entries: […], answer: ???, refinement: String?, gated: Bool }
- `200` → { matched: Bool, entries: ???, answer: String?, refinement: String?, gated: Bool, upsell: ??? }
- `200` → { matched: Bool, entries: ???, answer: ???, refinement: ???, gated: Bool }
- `200` → { matched: Bool, entries: ???, answer: String?, refinement: String?, gated: Bool, error: Bool, message: ??? }

## photo.js

Mounted at: `/api`

### POST /photo  ·  requireAuth

- `400` → { error: String }
- `200` → { isEstimate: ???, estimateNote: ??? }
  - plus a spread of `base` — **NEEDS HAND-CHECK**
- `500` → { error: String, message: ???, hasFood: Bool, macros: String?, foods: […], insight: String }

## preferences.js

Mounted at: `/api`

### GET /preferences/taxonomy  ·  public

- `200` → { goals: ???, focuses: ???, hardLines: ???, constraints: ??? }

### GET /ingredients/search  ·  public

- `200` → { results: ??? }

### POST /preferences/interpret  ·  public

- `400` → { error: String }
- `400` → { error: String }
- `200` → `await interpretPreferences(text)` — **NEEDS HAND-CHECK** (built elsewhere)
- `502` → { error: String }

## push.js

Mounted at: `/api/push`

### POST /register  ·  requireAuth

- `400` → { error: String }
- `200` → { ok: Bool }
- `500` → { error: String }

### POST /unregister  ·  requireAuth

- `400` → { error: String }
- `200` → { ok: Bool }
- `500` → { error: String }

## revenuecat.js

Mounted at: `/api/revenuecat`

### POST /webhook  ·  public

- `401` → { error: String }
- `400` → { error: String }
- `200` → { received: Bool, skipped: String }
- `200` → { received: Bool, ignored: ??? }
- `200` → { received: Bool }
- `500` → { error: String }

## scan.js

Mounted at: `(unmounted)`

### POST /scan/barcode  ·  requireAuth

- `400` → { error: String }
- `200` → `await extractFromBarcode(barcode)` — **NEEDS HAND-CHECK** (built elsewhere)
- `502` → { error: Bool, message: ??? }

### POST /scan/label  ·  requireAuth

- `400` → { error: String }
- `200` → `buildLabelResult(await readLabel(req.file), req.body?.barcode)` — **NEEDS HAND-CHECK** (built elsewhere)
- `502` → { error: Bool, message: ??? }

### POST /scan/barcode  ·  public

- `400` → { error: String }
- `200` → { gate: Bool, reason: String }
- `200` → `await extractFromBarcode(barcode)` — **NEEDS HAND-CHECK** (built elsewhere)
- `502` → { error: Bool, message: ??? }

### POST /scan/label  ·  public

- `400` → { error: String }
- `200` → { gate: Bool, reason: String }
- `200` → `buildLabelResult(await readLabel(req.file), req.body?.barcode)` — **NEEDS HAND-CHECK** (built elsewhere)
- `502` → { error: Bool, message: ??? }

## stripe.js

Mounted at: `/api/stripe/webhook`

### POST /  ·  public

- `200` → { received: Bool }

## subscription.js

Mounted at: `/api`

### GET /subscription  ·  requireAuth

- `200` → `subscriptionSummary(row)` — **NEEDS HAND-CHECK** (built elsewhere)
- `200` → `subscriptionSummary(null)` — **NEEDS HAND-CHECK** (built elsewhere)

### POST /subscription/trial  ·  requireAuth

- `200` → `subscriptionSummary(row)` — **NEEDS HAND-CHECK** (built elsewhere)
- `200` → `subscriptionSummary(null)` — **NEEDS HAND-CHECK** (built elsewhere)

## trips.js

Mounted at: `/api`

### POST /trips/complete  ·  requireAuth

- `200` → { trip: ???, list: ??? }
- `500` → { error: String }

### POST /trips/new  ·  requireAuth

- `500` → { error: ??? }
- `200` → { trip: ???, list: ???, reused: ??? }
- `500` → { error: String }

### POST /trips/next  ·  requireAuth

- `409` → { error: String }
- `409` → { error: String }
- `500` → { error: String }
- `200` → { trip: ???, list: ???, from: ??? }
- `500` → { error: String }

### GET /trips/seedable  ·  requireAuth

- `200` → { seedable: ???, items: ???, completedAt: ??? }
- `200` → { seedable: Bool, items: Double, completedAt: String? }

## verdict.js

Mounted at: `(unmounted)`

### POST /verdict  ·  requireAuth

- `400` → { error: String }
- `422` → { error: Bool, unreadable: Bool, message: ??? }
- `502` → { error: Bool, message: ??? }

### POST /verdict  ·  public

- `400` → { error: String }
- `422` → { error: Bool, unreadable: Bool, message: ??? }
- `200` → { gate: Bool, reason: String }

## weeklySummary.js

Mounted at: `/api`

### POST /weekly-summary  ·  public

- `200` → { ok: Bool, generated: ??? }
- `500` → { error: String }
- `200` → { ok: Bool, summary: ??? }
- `500` → { error: String }

## weight.js

Mounted at: `/api`

### POST /weight  ·  requireAuth

- `400` → { error: String }
- `200` → { locked: String, upgrade: Bool, message: String, saved: String?, trend: String?, recalculated: String? }
- `200` → { saved: …, trend: …, recalculated: ??? }
- `500` → { error: String }

### GET /weight/history  ·  requireAuth

- `200` → `rows.map((r) => ({
        logged_at: r.logged_at,
        weight_value: r.weigh` — **NEEDS HAND-CHECK** (built elsewhere)
- `500` → { error: String }

---

## NEEDS HAND-CHECK

27 of 60 handlers have at least one response this script cannot
expand. Confirm these by hand before writing a Codable for them.

- `POST /checkout` (billing.js) — opaque: NOT_CONFIGURED
- `POST /portal` (billing.js) — opaque: NOT_CONFIGURED
- `POST /chat` (chat.js) — spread: …
- `POST /chat` (chat.js) — spread: result
- `GET /counter/cards/:slug` (counter.js) — opaque: forViewer(card, await viewerFor(req))
- `POST /counter/ask` (counter.js) — opaque: result
- `POST /counter/ask` (counter.js) — opaque: body
- `POST /counter/ask` (counter.js) — spread: body
- `POST /counter/ask` (counter.js) — spread: body
- `POST /counter/ask` (counter.js) — opaque: body
- `POST /chat` (guest.js) — opaque: result
- `GET /ingredient/:id` (ingredient.js) — spread: publicEntry(entry)
- `GET /growth` (internal.js) — opaque: await growthSnapshot()
- `GET /growth.html` (internal.js) — no res.json
- `GET /perimeter/sections/:id` (perimeter.js) — opaque: section
- `GET /perimeter/:id` (perimeter.js) — opaque: publicEntry(entry)
- `POST /photo` (photo.js) — spread: base
- `POST /preferences/interpret` (preferences.js) — opaque: await interpretPreferences(text)
- `POST /scan/barcode` (scan.js) — opaque: await extractFromBarcode(barcode)
- `POST /scan/label` (scan.js) — opaque: buildLabelResult(await readLabel(req.file), req.body?.barcode)
- `POST /scan/barcode` (scan.js) — opaque: await extractFromBarcode(barcode)
- `POST /scan/label` (scan.js) — opaque: buildLabelResult(await readLabel(req.file), req.body?.barcode)
- `GET /subscription` (subscription.js) — opaque: subscriptionSummary(row)
- `GET /subscription` (subscription.js) — opaque: subscriptionSummary(null)
- `POST /subscription/trial` (subscription.js) — opaque: subscriptionSummary(row)
- `POST /subscription/trial` (subscription.js) — opaque: subscriptionSummary(null)
- `GET /weight/history` (weight.js) — opaque: rows.map((r) => ({
        logged_at: r.logged_at,
        weight_value: r.weigh

_60 handlers, 168 literal responses derived._
