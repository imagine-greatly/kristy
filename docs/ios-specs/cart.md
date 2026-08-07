# iOS spec — CART

The home surface, the list itself, shop mode, and the trip lifecycle.

Derived from the React client (`client/src/components/Dashboard.jsx`, `CartMoment.jsx`,
`ShopMode.jsx`, `TripQuestion.jsx`, `FillRow.jsx`, `ImportList.jsx`, `client/src/lib/cart.js`,
`list.js`, `listSections.js`, `rowMatch.js`) and the server handlers it calls
(`server/routes/list.js`, `trips.js`, `guest.js`, `counter.js`).

**This describes behavior, not the React implementation.** Where a number appears
(17.5pt, 44pt, 56pt) it is evidence of a rule that was measured; port the rule.

---

## 0. Conventions used by every call in this document

- **Base URL** is a single configured API origin. All paths below are appended to it.
- **Auth**: a Supabase session access token as `Authorization: Bearer <token>`.
  Routes marked *authed* require it. Routes marked *public* must be called with **no**
  `Authorization` header at all — sending `Bearer undefined` is a defect, not a no-op.
- **Content type**: `application/json` unless the call is marked multipart.
- **Error envelope**: failures return either `{ "error": "<machine string>" }` or
  `{ "error": true, "message": "<sentence in Kristy's voice>" }`. When a `message` is
  present it is written to be shown to the shopper verbatim. When only `error` is
  present it is a machine code and must never be displayed.
- **Never invent copy.** Every sentence a shopper reads either comes from this document
  or from a server response field. The client composes no claim about food.

---

## 1. THE OBJECT: one cart, many views

There is exactly one cart in the app at a time. It is loaded once at launch and shared
by every surface: the home surface renders it, a scan adds to it, shop mode walks it,
the tab bar shows its progress, and the Haul reads back from it. **A screen must never
own its own copy.**

### 1.1 The list

```json
{
  "goal": "high_protein",
  "intro": "Set up high-protein. An anchor behind every meal.",
  "items": [ /* row objects, see 1.2 */ ]
}
```

- `goal` — string or null. The primary goal the cart was generated for. Display-irrelevant.
- `intro` — Kristy's one-line read on the whole cart. Rendered at the top of the list body
  in her voice. May be empty.
- `items` — ordered array, max 200 server-side.

`list` itself may be **null**, and null is meaningful: it means the shopper has not said
what this trip is for yet. It is not an error and must not fall back to a cached list
(see 3.1).

### 1.2 A row

Every field except the first five is optional and absent when unset. The server
whitelists exactly these on save; anything else is dropped.

| field | type | meaning |
| --- | --- | --- |
| `id` | string ≤64 | stable row id, client-generated on add |
| `name` | string ≤140 | what the shopper sees. **Never rewritten by the app.** |
| `category` | string ≤60 | cart category, default `"Added"` |
| `checked` | bool | ticked off |
| `source` | enum | `user` · `template` · `scan` · `swap` · `imported` |
| `productName` | string ≤140 | for `swap` rows, the product being swapped away from |
| `tier` | enum | verdict tier carried from a scan: `approved`, `approved_with_note`, `use_with_intention`, `swap_recommended`, `skip` |
| `refined` | bool | the row was renamed by Kristy's pick or by a fix |
| `why` | string ≤200 | Kristy's one line of reasoning for this pick |
| `perimeterId` | string ≤64 | the counter KB entry this pick's judgment was authored from |
| `alt` | string ≤160 | the named equivalent alternative |
| `cardSlug` | string ≤64 | the counter card this row **matched** (retrieval, not citation) |
| `cardSection` | string ≤32 | walk section of that card, denormalized at match time |
| `carded` | bool | the matcher has looked at this row (including a miss) |
| `specifiedFrom` | string ≤140 | what the shopper originally wrote, before specification |
| `swapOffer` | string ≤200 | Kristy's one comment on this row |
| `offered` | bool | this row has already had its one comment |
| `offerId` | string ≤40 | stable id of the offer, for permanent decline |
| `swapTo` | string ≤140 | the name the row becomes if the swap is taken |
| `needsFix` | bool | the row came from a photo import and could not be read |
| `note` | string ≤200 | why it could not be read |

**`cardSlug` and `perimeterId` are different things and must not be merged.**
`perimeterId` means "the authored pick on this row cites this entry"; `cardSlug` means
"what the shopper wrote matched this card". They render differently — an authored `why`
versus the card's do line — and a generated card has a slug with no KB entry behind it.

### 1.3 Derived progress

Computed from the list, stored nowhere:

- `shoppable` = rows where `source != "swap"`. Swap callouts are Kristy's notes, not
  things you put in a cart; counting them skews the trip toward "never finished".
- `total` = count of shoppable
- `checked` = count of shoppable and checked
- `remaining` = total − checked
- `complete` = total > 0 AND checked == total
- `started` = checked > 0
- `hasCart` = items array is non-empty

### 1.4 Other cart-level state

| state | source | changes when |
| --- | --- | --- |
| `premium` | `GET /api/list` response | on every list load |
| `loading` | true until the first `GET /api/list` resolves | set false on resolve *or* failure |
| `busy` | `""` \| `"edit"` \| `"build"` | set while a compose call is in flight |
| `note` | string | set from a compose summary or a budget message; cleared on a new compose and on start-new-trip |
| `seedable` | `{ seedable, items, completedAt }` | loaded at launch and refreshed whenever the list becomes empty |

---

## 2. SCREENS

### 2.1 Home (the dashboard) — the default launch surface

The app opens here **unconditionally**. It does not auto-enter shop mode even if a trip
is underway: a shopper standing at home would be dropped into the store. The mid-trip
hero *is* the resume affordance.

Vertical order, top to bottom:

1. **The hero** — the answer to "what happens next" (2.2)
2. **The walk shape** — section chips, only in `ready` and `midtrip`
3. **`cart.note`** — Kristy's one line back, when set
4. **The trip question** — only in `empty` and `completed`
5. **The counter ask** — only in `ready`, `midtrip`, `finished`
6. **The list body** (2.4)
7. **"Read your haul →"** — only when `progress.total == 0`

#### Layout rules, enforced by measurement

- **The hero is the first element on the surface and carries the largest type on it, in
  every state.** Nothing renders above it. Nothing is set larger. Its copy is never
  repeated anywhere below it.
- **Exactly one filled ("bone") action per screen, and it is the hero's.** Bone is a warm
  near-white fill; every other control on the screen is transparent with a hairline
  border. Both failure directions have shipped: `finished` once had zero filled actions
  (the state where a shopper most wants to be done had the quietest answer of the five),
  and `completed` once had two (the hero plus the trip question's submit). Resolve a
  conflict by stepping the *other* control down, never the hero.
- **An action renders only if it has both a label and a handler.** An unwired control
  that paints and accepts taps is invisible to every check that looks for failure,
  because it does not fail. Make it vanish instead. This is not defensive noise: "Start
  shopping" shipped to production dead for every visitor because the label was a string
  literal and the handler was nil.
- Content column is capped at 520pt wide, centered. Horizontal padding 18pt.

### 2.2 The hero — five states

Resolved purely from `progress` and `seedable`. Stores no new concept.

```
if progress.total == 0 → seedable.seedable ? "completed" : "empty"
if progress.complete    → "finished"
if progress.checked > 0 → "midtrip"
otherwise               → "ready"
```

**There are five states, not four.** A trip with every box ticked is not mid-trip and
its answer is not RESUME, it is FINISH. Folded together, a shopper who just walked their
whole list is told to resume it.

| state | kicker | line (largest type) | action | sub |
| --- | --- | --- | --- | --- |
| `empty` | — | "What are you getting this week?" | **none** | "Name it in your own words. Rough is fine." |
| `completed` | "Last trip is filed" | "Same as last week?" | "Start from those *N* items" | "Unchecked and ready to edit." |
| `ready` | "*N* items · *M* sections" | "The list is ready." | "Start shopping" | — |
| `midtrip` | "You are mid-trip" | "*Section* — *d* of *n*" | "Resume shopping" | "*R* left across the store." |
| `finished` | "Everything checked off" | "Trip done." | "Finish the trip" | "It gets filed, and next week starts from it." |

- *N* in `completed` is `seedable.items`; singular/plural on "item".
- *M* in `ready` is the number of walk sections (5.1); singular/plural on "section".
- `midtrip` names the **first section with anything left**, not the last one touched. A
  shopper who skipped two things in produce and walked to meat is sent back to what is
  unfinished. *d* and *n* are that section's checked and total.
- In `empty` the hero has no button — the question below *is* the answer to what-next, so
  the trip question's submit keeps the screen's one bone fill.
- In `completed` the hero *is* the seeding act, so the trip question suppresses its own
  "Same as last week" control and steps its submit down to quiet.
- **`finished` renders its action only when a completion handler exists.** A guest has no
  account, so there is no trip row to file: the guest sees "Everything checked off / Trip
  done." with no button rather than a door that lies.

Hero actions:

| action | effect |
| --- | --- |
| Start from those N items | `POST /api/trips/next` (3.6) |
| Start shopping | enter shop mode |
| Resume shopping | enter shop mode |
| Finish the trip | `POST /api/trips/complete`, then navigate to Haul on success |

### 2.3 The walk shape

Rendered under the hero in `ready` and `midtrip` only. One chip per walk section, in walk
order, reading `"<Title> <done>/<total>"`.

- A fully-checked section is de-emphasized.
- In `midtrip` the section the resume will land in is marked (gold hairline + gold tint).
- **It is not a statistic.** A distribution says what already happened; this says what is
  about to. Mid-trip it is the only thing on the surface that says which aisles are still
  owed. Do not replace it with a chart.

### 2.4 The list body

Renders nothing at all when the cart is empty (the trip question above covers that
state), except while loading (2.7).

Order:

1. `list.intro` in Kristy's voice, when present.
2. `cart.note`, **only if it differs from `list.intro`** — on a build the compose summary
   becomes the intro, so showing both prints the same sentence twice.
3. "Set how you eat →" link, only when the shopper has no goals set.
4. **The fill row** (2.5).
5. "Import a list →" link, quieter than the fill row.
6. The walk sections (5), each: a small uppercase section label, then its blocks.
7. "+ Add an item", which expands into a text field + Add button.
8. Footer: "Start a new trip" and "Rebuild for my preferences".

**There is no save control on this surface and there must never be one again.** Every
cart mutation already persists. A save button asks for money for a completed action,
which is worse than a wall. Two of them have been removed (a header "Save this cart"
and a permanent "Keep it" banner) and a third upgrade banner on the cart. See §7.

### 2.5 The fill row

Two side-by-side cards, **byte-identical in treatment**: same width, same border, same
gold, same type.

| | label | sub |
| --- | --- | --- |
| left | Scan | "The label, or a barcode" |
| right | Counter | "Meat, fish, produce" |

The equality *is* the product positioning: the labeled half and the unlabeled half matter
the same. Do not make either one primary. If only one handler is available, render
neither… no — render only the one that has a handler, and if neither does, render nothing.

### 2.6 A row, rendered

A row is: a check target, the body, an optional trailing category label, and a remove
button.

- **Check target is 44pt** (the visual square is 24pt; the padding around it is what makes
  it usable one-handed). Accessibility label: "Check off *name*" / "Uncheck *name*".
- **Name** at 15pt semibold. A checked row's name goes muted with a strikethrough. A swap
  callout row renders its name in Kristy's voice instead, and is never struck.
- **One prose line per row, and when there is a card it is the card's.** If the row's
  block has a card attached and that card's summary has arrived, the row's own `why` is
  **suppressed** and the card's do line renders below the block instead. An unmatched row
  keeps its `why` — it is the only prose that row has.
  - **The suppression keys on whether the card summary has arrived, not on whether the row
    has a `cardSlug`.** Keying on the slug blanks the row for the length of the fetch and
    leaves it empty forever if the fetch fails.
- **`needsFix` rows are editable inline.** Show `note` (or "Couldn't read this one.") and a
  text field pre-filled with the row's name — blank if the name is the literal
  `"Unreadable item"` — plus a "Fix it" submit. Submitting renames the row, marks it
  `refined`, and clears `needsFix` and `note`. Demote the note by **size** (13pt at full
  muted), never by opacity.
- **Meta chips**, rendered only when there is something to say:
  - "You added" — only when the cart is *mixed* (i.e. at least one shoppable row has a
    source other than `user`) AND this row is `source == "user"` AND its category is not
    "From your haul". On a hand-typed list every row is the shopper's, so the tag says
    nothing on every one of them and must not render.
  - "Kristy's pick" — when `refined`.
  - A verdict flag, when `tier` is set:

    | tier | label | register |
    | --- | --- | --- |
    | `approved` | Approved | mint |
    | `approved_with_note` | With a note | gold |
    | `use_with_intention` | With intention | gold |
    | `swap_recommended` | She'd swap this | danger |
    | `skip` | She'd skip this | danger |

- **Trailing category label** renders only when the row has **no** `cardSlug` AND its
  category is not one of `Added`, `Pantry`, `From your haul`, `Scanned`, AND the category
  is not the title of any walk section. Inconsistent presence is honest; inventing a
  category so every row has one recreates the drifting second index. The section-title
  exclusion is structural: a label can no longer name a section, which is what fixed
  "Baby spinach" sorting into "Everything else" while displaying the word Produce.
- **Remove button** — 40×44pt, quiet. Removing a `template` row records a learning signal
  (§6).

### 2.7 Empty, loading and error states on home

| condition | what renders |
| --- | --- |
| cart still loading and no cached list | list body shows "Pulling your cart together…" in Kristy's voice; hero still renders (it reads `progress`, which is 0/0 → `empty` or `completed`) |
| `GET /api/list` returns `list: null` | `empty` (or `completed` if seedable). The list body renders nothing. The trip question is the surface. |
| `GET /api/list` fails (network/offline) | fall back to the locally cached list and treat `premium` as false. This is the **only** path that falls back, because it is the only one where we genuinely do not know. |
| server says `list: null` | clear the local cache. Do **not** show a stale cart. |
| compose over budget | `cart.note` carries the server's message; no error state, no upsell |
| compose failed | the trip question shows "That did not go through. Try it once more." |

---

## 3. API — the list and the trip

### 3.1 `GET /api/list` — authed

No parameters.

**200**
```json
{ "list": { "goal": null, "intro": "", "items": [] }, "premium": false }
```
or
```json
{ "list": null, "premium": false, "pendingSwaps": 2 }
```

- `list: null` is the honest empty and means "no trip yet". Render the question.
- `pendingSwaps` is a count only, present on the null-list branch.
- **500** `{ "error": "Could not load your list." }`

Server-side behavior worth knowing, because it explains state changes the client does not
initiate:
- The active trip is the list. A pre-trips legacy list is adopted as the shopper's first
  trip on this read, once, gated on "no trips at all".
- If the shopper's preferences changed since the cart was built, the cart **leans** —
  at most 3 additions folded in — it is not regenerated. Rebuild is a separate explicit act.
- Counter cards are attached on read as well as on write, so a pre-existing cart gets its
  `cardSlug`s without an edit.

### 3.2 `POST /api/list` — authed

Called after **every** local mutation (check, uncheck, add, remove, rename, take-swap,
keep-mine, scan-add).

**Request**
```json
{
  "list": { "goal": null, "intro": "", "items": [ /* rows */ ] },
  "signals": {
    "removed": ["Kombucha, low-sugar"],
    "kept": ["Eggs", "Eggs", "Whole milk"],
    "acceptedSwaps": ["Coca-Cola"],
    "declinedSwaps": ["offer_seed_oil_spread"],
    "sig": "<opaque generation signature, echoed back>"
  }
}
```

**200**
```json
{ "ok": true, "list": { /* the server's copy */ } }
```

**400** `{ "error": "list is required" }` · **500** `{ "error": "Could not save your list." }`

**The response is a merge source, not a replacement.** The server may have stamped
`offered` / `swapOffer` / `offerId` / `swapTo` and `carded` / `cardSlug` / `cardSection`
onto rows. Merge **only those fields, matched by row id**. Replacing the whole list
silently undoes whatever the shopper did while the call was in flight.

Merge rule for offers: for each row in the response that has `offered == true`, if the
local row with that id does **not** already have `offered`, set `offered: true` and, if
present, copy `swapOffer`, `offerId`, `swapTo`. Never overwrite a row the shopper has
since edited, checked or removed.

### 3.3 `POST /api/list/rebuild` — authed

Body `{}`. Regenerates from the stored profile. Response `{ "list": {…}, "premium": bool }`.
Replaces the cart. This is a deliberate choice the shopper makes, never a side effect.

### 3.4 `POST /api/list/compose` — authed

The conversational build/edit. **Free**, behind a daily budget.

**Request**
```json
{ "instruction": "three dinners this week", "mode": "build" }
```
`mode` is `"build"` or `"edit"`; anything else is treated as `"edit"`. A build **replaces**
the cart; an edit applies adds and removes to it.

**200**
```json
{ "list": { /* the new cart */ }, "summary": "Taco night — beef, tortillas, peppers, onion, cheese, salsa.", "premium": true }
```

**429** — over the daily free budget (12 composes/day for non-premium; premium is exempt)
```json
{ "error": true, "message": "<Kristy-voiced ceiling line>" }
```
Show the `message` in `cart.note`. **This is a ceiling, not a wall: do not show an upgrade
offer, and do not tell the shopper to try again** — telling someone to retry against a
ceiling is how you make them retry.

**400** `{ "error": "instruction is required" }`
**503** `{ "error": true, "message": "I couldn't put that together just now — give me a second and try again." }`

Two guarantees the server holds and the client must not undo:
- **The summary is reconciled against the list actually produced.** If a proposed removal
  was declined because the row was the shopper's own, the model's line is discarded and
  replaced. Render `summary` verbatim; never compose your own.
- **A build with nothing to add never empties a populated list.**

### 3.5 `POST /api/list/swaps` — authed

```json
{ "swaps": [ { "product_name": "Coca-Cola", "tier": "swap_recommended" } ] }
```
Max 50. Response `{ "ok": true, "pending": 3 }`. Never fails the caller: a persistence
problem still returns 200 with `pending: 0`.

### 3.6 The trip lifecycle — authed

| call | body | 200 | conflicts |
| --- | --- | --- | --- |
| `POST /api/trips/complete` | none | `{ "trip": {…}, "list": {…} }` | **409** `{ "error": "no_active_trip" }` |
| `POST /api/trips/new` | none | `{ "trip": {…}, "list": {…}, "reused": bool }` | **500** on failure |
| `POST /api/trips/next` | none | `{ "trip": {…}, "list": {…}, "from": "<trip id>" }` | **409** `{ "error": "trip_in_progress" }` or `{ "error": "no_completed_trip" }` |
| `GET /api/trips/seedable` | — | `{ "seedable": bool, "items": 15, "completedAt": "2026-08-01T…" }` | degrades to `{seedable:false, items:0, completedAt:null}`, never errors |

`list` in every response is the same list shape as §1.1.

Rules:
- **Completing is an explicit tap, never the last checkbox.** Auto-completing thrashes on
  an uncheck-and-recheck and takes the decision away while the shopper is still in the
  store.
- **There is exactly one seeding door: `/trips/next`.** Do not build a second one.
- **`seedable` gates whether the control renders at all**, so nobody is offered a button
  that answers 409.
- A seeded row arrives **unchecked**, with `carded`/`cardSlug`/`tier` and the whole offer
  set stripped (a verdict belongs to the scan that produced it; a resolved offer is spent),
  and keeps `why`, `perimeterId`, `alt`. It gets re-matched against the current corpus,
  which is correct: an item bought every trip is the likeliest to have had a card authored
  for it since.
- `POST /api/trips/new` on an **untouched** trip reuses it rather than archiving it —
  filing a no-op as history fills the archive with evidence of nothing. `reused` tells you
  which happened; it needs no UI.

### 3.7 `POST /api/list/import` — authed · `POST /api/guest/list/import` — public

Two ways in, one pipeline.

**Text (JSON)**
```json
{ "text": "milk\neggs\nbread", "list": { /* guest only: the current cart */ } }
```
**Photo (multipart/form-data)**
- `image` — the photo file
- `barcode` — unused here
- `list` — guest only, the current cart **as a JSON string**

> A multipart field arrives as a **string**. The guest route parses it; if your client
> sends an object it will be serialized. This exact transport detail once caused an import
> to *replace* the shopper's cart instead of appending to it, because the string failed
> validation and the "current cart" fell back to empty.

**200 (nothing readable)**
```json
{ "list": null, "summary": "I couldn't make out a list in that — type it in and I'll take it from there.", "imported": 0, "guest": true }
```
**200 (success)**
```json
{ "list": { /* merged cart */ }, "summary": "Kept all 11 of your items.", "imported": 11, "specified": 4, "guest": true }
```
`guest` is present only on the guest route. **503** `{ "error": true, "message": "I couldn't read that list just now — try again, or type it in." }`

Guarantees the copy on this screen makes and the pipeline holds:
- **Imported items are APPENDED, never a replacement.**
- A row that could not be read comes back with `needsFix: true` and a `note` — as the
  shopper's own marks to fix, never a confident guess.
- The summary may claim completeness ("Kept all 11") **only** for typed text. A photo may
  not, because a photo can silently lose a line.

Known inherited defects to fix rather than reproduce (see `SWIFT-SPEC.md` §G): the
photo pipeline reinstates crossed-out items on some inputs, and never flags `unreadable`
even when it misreads confidently. **Photo import output must land editable.**

### 3.8 Guest equivalents

| authed | guest | difference |
| --- | --- | --- |
| `GET`/`POST /api/list` | *(none)* | a guest cart lives entirely on the device |
| `POST /api/list/compose` | `POST /api/guest/list/compose` | prefs and the current cart ride in the body; nothing is stored |
| *(card attach inside POST /api/list)* | `POST /api/guest/list/attach` | explicit; see 3.9 |
| `POST /api/list/rebuild` | `POST /api/guest/list` | see 3.10 |
| trips | *(none)* | trips are rows keyed to an account |

`POST /api/guest/list/compose` request:
```json
{
  "instruction": "three dinners this week",
  "mode": "build",
  "prefs": { "coach_goals": [], "non_negotiables": [], "focuses": [], "constraints": [] },
  "list": { /* the current guest cart, or null */ }
}
```
**200** `{ "list": {…}, "summary": "…", "premium": false, "guest": true }`
**429** `{ "error": true, "message": "That is a lot at once. Give it a minute, or sign in to keep going.", "gate": true, "reason": "limit" }`
→ this is the one honest moment to offer sign-in from the cart, because it is the point
where an account actually buys something.

> A guest's `mode: "build"` against a non-empty cart is re-resolved server-side, so a
> refinement typed against nine rows is not routed into a rebuild that empties them.

### 3.9 `POST /api/guest/list/attach` — public

Attaches counter cards to a device-local cart. Deterministic, free, no model call.

**Request** `{ "list": { /* the cart */ } }` · **200** `{ "list": { /* rows now carrying cardSlug/cardSection/carded */ }, "guest": true }`
**400** `{ "error": "list is required" }` · **429** `{ "error": "rate_limited", "message": "Give it a minute and try again." }` · **503** `{ "error": true }`

**Call it only when there is something new to look at** — i.e. when at least one row with
source `user`, `imported` or `template` has `carded != true`. Adding an item triggers one
call; checking things off for the next forty minutes triggers none. Merge the response by
row id (`carded`, `cardSlug`, `cardSection` only). Any failure returns nothing and the cart
is left exactly as it was: a list with no cards on it is still a list, and this must never
be able to break someone's trip.

### 3.10 `POST /api/guest/list` — public

The one-time full-tailoring "build me a full cart" for a guest.

```json
{ "coach_goals": ["high_protein"], "non_negotiables": ["no seed oils"], "focuses": [], "constraints": ["budget"] }
```
**200** `{ "list": {…}, "taste": true, "prefs": { /* the filtered set */ } }`
**400** `{ "error": "goals_required" }` · **429** `{ "error": "rate_limited", "message": "That's a lot of carts in one hour — give it a minute and try again." }` · **503** `{ "error": true, "message": "That cart did not come together. Try again in a moment." }`

This generates at full tailoring on purpose — it is the one-time taste that makes the
onboarding questions worth answering.

### 3.11 `GET /api/counter/summaries?slugs=a,b,c` — public

The card summaries for every distinct `cardSlug` on the cart, **in one request**.

**200**
```json
{ "cards": { "egg_labels": { /* card summary, see counter.md §3 */ } } }
```
A slug the server does not return is a permanent absence (a retired card): cache it as
"none" and never re-request it. Cap 200 slugs per request.

Fetch policy: key the request on the **sorted set of distinct slugs**. Checking items off
changes the list on every tap and changes nothing about which cards are on it, so it must
issue no traffic at all. Cache by slug for the session.

---

## 4. THE LIST IS THE SHOPPER'S — behavioral guarantees

These are product promises, not implementation details. Each one has been broken at least
once.

1. **The item always stays.** A row the shopper added is never removed, renamed or struck
   by Kristy. She attaches a note *beside* it.
2. **A model-proposed removal cannot touch an owned row** (`user` or `imported`) unless the
   shopper's own words name the item — **including by category**: "no seafood" names the
   salmon. "Make this healthier" names nothing and removes nothing.
3. **Flag once.** Every row the server inspects is stamped `offered`, including the ones
   that earned no comment, and the stamp survives the round trip. The same gentle note on
   every load is nagging however kindly it is worded, and it is what gets an app deleted.
4. **A no is permanent, and it suppresses the ITEM, not just the note.** A declined swap
   that returns as a "nudge" is the same suggestion by a side door.
5. **Goals weight the margins.** A profile change *leans* the stored cart (≤3 additions);
   it does not regenerate it. Rebuild is a choice, never a side effect of tapping a goal.
6. **A row sorts by the section it displays, and never displays one it is not sorted into.**

### 4.1 Kristy's one offer

When a row carries `swapOffer` **and is not checked**, render, beneath the row: her line
in her voice, then two controls.

| control | shown when | effect |
| --- | --- | --- |
| "Swap it" | `swapTo` is set | rename the row to `swapTo`, set `refined`, clear `swapOffer`/`swapTo`, set `offered` |
| "Keep mine" | always | clear `swapOffer`/`swapTo`, set `offered`, and record the decline against `offerId` |

Both answers **end the conversation about that row**. Neither removes anything, and
neither is ever raised again. Style it quiet — no red, no warning color, no icon. A flag
that looks like an alarm is a scolding however it is worded; this is a door held open.

---

## 5. THE WALK — grouping and ordering

Two vocabularies used to disagree about the store. There is now one, and it is the
counter's.

### 5.1 Sections, in walk order

Live groups first (not part of the walk at all):

| id | title | matches |
| --- | --- | --- |
| `swap` | From your haul | `source == "swap"` — notes to read before starting |
| `scan` | Scanned this trip | `source == "scan"` — already in the shopper's hands |

Then the walk, in this exact order:

`produce` Produce · `meat` Meat · `seafood` Seafood · `eggs_dairy` Dairy & Eggs ·
`bulk_pantry` Pantry & Bulk · `frozen` Frozen

Then a trailing group titled **"Everything else"** for anything with no section.

`label_terms` is deliberately absent: it is a reference section on the Counter, not an
aisle anybody walks to.

### 5.2 Which section a row is in

In priority order:
1. If the row's **name** matches the whole word "frozen", case-insensitive → `frozen`.
   This is a *location* rule sitting on top of a knowledge match: a frozen-produce card is
   correctly filed under produce, but nobody walks to produce for frozen peas.
2. Else if `cardSection` is one of the six ids → that section.
3. Else translate the cart `category`, using exactly this table and no more:
   `"produce"` → `produce`, `"dairy & eggs"` → `eggs_dairy` (case-insensitive).
   Deliberately tiny: `Protein` spans meat, seafood and dairy and maps to nothing; Bakery
   and Snacks are not aisles the counter covers.
4. Else → the trailing group.

**A stored `cardSection` always wins over the category fallback**, or a refiled corpus
would stop moving rows where it files them.

### 5.3 Blocks — the card collapse

Within a section, consecutive-or-not rows that share a `cardSlug` are collapsed into one
**block**, and the block takes the position of the **first** row that claimed the card.
Rows with no slug are their own single-row block.

Blueberries and strawberries both resolve to the same berries card; rendering it twice
reads as a bug. One card, both rows above it.

### 5.4 The attachment (the card, on the list)

A block with a card renders, below its rows, a two-line tappable attachment:

- **Eyebrow** — the card's `eyebrow`, uppercase, muted. If the card's `kind` is `"home"`,
  prefix it: `"At home · <eyebrow>"`.
- **Do line** — the card's `do`, plus a chevron.

Tied to the rows above by a brass rule down its left edge — that is how a card shared by
two rows reads as belonging to both without repeating either name.

Tapping it expands the full counter card in place (see `counter.md` §4), with a "Close"
below. **The card's add-to-cart is not offered here**: the card is open *because* the item
is already on the list, so its cart pick would add a second row for the thing the shopper
is holding.

A block with a card sits a step lighter than the ground with a soft shadow. **A block with
no card does not lift** — that contrast is what says Kristy showed up for this one, and it
is what keeps a 30-item list with few matches from reading as thirty stacked cards. A
block whose rows are all checked drops back toward the ground.

---

## 6. LEARNING SIGNALS

Held on the device and sent with every `POST /api/list`. Grocery **names** only — never
quantities, never products by brand.

| signal | recorded when | dedup |
| --- | --- | --- |
| `removed` | a `template` row is removed | deduped, case-insensitive |
| `kept` | a non-swap row is **checked** (transition unchecked → checked) | **not deduped** — occurrences are the frequency; capped at the newest 200 |
| `acceptedSwaps` | a `swap` row is checked | deduped |
| `declinedSwaps` | "Keep mine" is tapped, keyed on `offerId` | deduped |

`kept` is deliberately not deduped: repetition is the only signal of what somebody really
buys. Do not "fix" it.

This is the most personal thing the product stores. It leaves with the shopper on account
deletion (see `auth.md` §6).

---

## 7. MONEY ON THIS SURFACE

**The entire list is free, forever**: building it, saving it, keeping it across trips, and
the counter cards attached to its items. Building from a sentence is free behind a daily
budget, not a gate.

**No upgrade affordance may render on the cart or the home surface.** The checkable shape
of the defect is *an upgrade affordance whose render condition contains no action* — tier
alone is not a moment, because every non-member satisfies it on every render, which is
exactly what makes it a banner. Three separate asks have been removed from this surface
for that reason:

1. "Save this list" — asked for money for a save that had already happened.
2. A guest header "Save this cart" and a permanent "Keep it" banner above the list.
3. A premium nudge reading "Basic cart. Membership shapes it…", on open, every load,
   above the shopper's own rows. "Basic cart" is a judgement on something the shopper
   built themselves.

The one legitimate upgrade moment in the whole app is the fourth full-read tap (see
`counter.md` §6). Nothing on the cart is metered.

---

## 8. SHOP MODE

**A MODE, not a tab.** Entered deliberately from the hero, exited deliberately. It owns
the full viewport, sits **above** the tab bar and **below** every sheet, and while it is
up the tab bar and any docked composer are suppressed — a tab bar under it would offer
four ways to fall out of the thing the shopper just chose to be in.

Layer order, lowest to highest: tab bar → **shop mode** → sheets (scan result, card sheet,
ask overlay) → camera.

### 8.1 Structure

**Header** (fixed):
- Exit control, hard left, 44pt.
- Pips — one per section, in walk order. Filled behind you, elongated gold where you are,
  hollow ahead.
- Section count, hard right, monospaced gold: `"<done> of <total>"`. **This is the
  SECTION's count**, not the trip's — a trip-wide "8 of 15" answers a question nobody
  standing in produce is asking, and the dashboard already carries it.
- Section title, in display italic at 28pt, one per screen.
- `"Next: <Title>"` or `"Last section"`. What comes next is always named: a shopper
  deciding whether to double back needs to know what they are walking away from and what
  they are walking toward.

**Scroll body**: every section, in walk order. Each section renders its blocks, then a
"Next: *Title* →" button that scrolls to that section. **There is no inline section title**
— the header already says it, and printing both put "Produce" on screen twice 12pt apart.

**Branch bar** (fixed, bottom): two equal buttons, Scan and Ask.

**Finish**: when every shoppable row is checked AND a completion handler exists, a full-
width filled "Finish the trip →" renders at the end of the scroll.

### 8.2 THE TYPE INVERTS — and that is the whole idea

On the dashboard the item **name** leads: the shopper is deciding what to buy. Here the
**do line** leads, because they already know they need eggs — what they do not know is to
read the carton.

| | matched row | unmatched row |
| --- | --- | --- |
| lead slot | the card's **do line**, 17.5pt semibold | the **name**, 17.5pt semibold |
| secondary | the **name** as an 11.5pt uppercase muted eyebrow | the row's `why`, if any |

For comparison the cart has name 15pt / prose 13.5pt — the other way round. **The
inversion is a claim that the do line is the more useful line, not a house style**: where
there is no do line the claim does not apply, so an unmatched row keeps its name in the
lead slot at the same size.

One prose line per row, inherited from the cart and not relaxed.

**Under Dynamic Type, port the relationship, not the numbers**: at every type size the do
line's rendered size must be strictly greater than the item name's, and the name must
still read as an eyebrow. Wrapping at accessibility sizes is acceptable; truncation is not.

### 8.3 A SPENT INSTRUCTION IS DEMOTED BY SIZE, NEVER BY OPACITY

When every row in a block is checked, its do line stops leading: it drops from 17.5pt to
13pt at **full** muted color, and the block loses its raised surface. The checkbox and the
strikethrough already say "done".

The first fix was 11.5pt at 50% opacity, which measures **2.90:1** against the ground where
WCAG needs 4.5:1 — a shopper who checked something by mistake could not read back what
they had just dismissed. 13pt at full muted measures 7.84:1.

**Transparency is the wrong instrument for de-emphasis.** It removes contrast from exactly
the people who need it and it fails silently, because it still looks fine to whoever
shipped it. **No text style in shop mode may carry reduced opacity, and demotion must be
expressed as size plus a semantic color token.** Ancestor opacity multiplies invisibly, so
forbid the mechanism rather than only checking the outcome.

### 8.4 Tap targets

- **Check is 56pt, hard left.** Bigger than the 44pt floor, because that floor is a seated
  minimum and this is pressed one-handed while pushing a trolley.
- **Open-the-card is 44pt, hard right, and is the ONLY thing that opens a card.** The
  large text between them is **inert**. In the cart the whole attachment is tappable, which
  is right for a surface read with two hands and wrong for one pressed while walking. The
  two targets measure 256pt apart at their closest.

### 8.5 Advancing is free scroll

Not auto-advance (it moves the screen under a thumb mid-tap), not paging (it turns
doubling back into navigation), not swipe (invisible, and it fights the system back
gesture at the left edge). Scrolling cannot strand a shopper who skipped something and
cannot trap one who doubled back.

**The active section is the one filling the most screen** — the largest visible area — not
"the last section whose top crossed the viewport top". A completed section collapses to
~66pt, so that rule leaves the header naming a section entirely off screen. The collapse
and the header rule were each right alone and wrong together, which is only visible with a
completed section behind you.

### 8.6 The collapse

A fully-checked section collapses to a single row: its title, and "all *N* · reopen".
Tapping reopens it for the rest of the session. This is what lets "produce fills the
screen" survive free scrolling — without it, a fifteen-item trip means scrolling past your
own completed work all morning.

### 8.7 EVERY BRANCH OUT OF SHOP MODE IS AN OVERLAY, NEVER A NAVIGATION

Shop mode is never unmounted while a branch is open, so "return to the same section and
scroll position" needs no restoration code — there is nothing to restore.

This has leaked twice on web, and both leaks were invisible because the sheet looked
identical everywhere: the Ask button once navigated to the Counter tab, and one layer down
the scan sheet's "Ask Kristy about this" opened the chat thread. Both threw away the
section and the scroll position.

- **Ask** presents a bottom sheet over shop mode, containing the section name as an
  eyebrow, a close control, and the counter ask (see `counter.md` §5) seeded for the
  current section.
- **Scan** presents the camera and then the scan sheet over shop mode (see `scan.md`).
- **The scan sheet's chat affordance is suppressed in shop mode**, on its own merits as
  well: chat is the deep-input surface, and a shopper holding a product with a verdict on
  screen does not want a thread. The counter ask is one tap away on the branch bar.

Exiting shop mode returns to home, where the hero reads RESUME. **Leaving shop mode never
completes a trip.**

Scroll restoration must hold exactly through four paths, each asserted as an exact offset,
not "roughly the same section":
1. deep scroll → scan → close
2. scan open → app backgrounded → restored → close
3. ask → a real submitted query → close
4. the ask reached from *inside* the scan overlay

### 8.8 Seed questions by section

The ask overlay's suggestion chips change with the section, because what is in front of you
changes what you think to ask. The answer does not change.

| section | seeds |
| --- | --- |
| `produce` | "Is organic worth it for berries" · "How do I pick a good cantaloupe" · "Are bagged salads safe" |
| `meat` | "Which cut for stew" · "What does grass-fed actually mean" · "Is air-chilled worth it" |
| `seafood` | "Wild or farmed salmon" · "Which are low in mercury" · "Is previously frozen worse" |
| `eggs_dairy` | "What pasture-raised leaves out" · "Brown or white eggs" · "Is A2 milk different" |
| `bulk_pantry` | "Which olive oil grade" · "Dried or canned beans" · "What is bulgur" |
| `frozen` | "Is frozen as good as fresh" · "What is in a frozen veg bag" |
| any other / none | "Wild or farmed salmon" · "Which cut for stew" · "What pasture-raised leaves out" · "Is organic worth it for berries" |

### 8.9 The card sheet

Tapping a block's chevron presents a bottom sheet with, in order: the card's `headline` in
Kristy's voice at 21pt, the `do` line at 15pt, and `tier_note` at 12.5pt muted when
present, then Close.

**The tier is a sentence, not a chip.** Do not add a tier badge. A bare classification word
("Credible concern") floating above a decision it does not name has no referent — that is
precisely why the chip was removed.

### 8.10 The screen stays awake — shop mode only

Hold the screen awake for exactly as long as shop mode is up, and release on exit and on
teardown. A phone that sleeps every thirty seconds in an aisle makes the whole mode
unusable; a lock that survives the mode is what drains a battery in a pocket.

On iOS this is one flag with no lifecycle to defend. **Do not port the web re-acquisition
dance** — the browser releases a screen wake lock whenever the document hides, so
acquire-once code passes every test written for it and then dies at the first
notification, permanently, for the rest of the walk. That entire class of defect
disappears natively.

### 8.11 A SCAN IN SHOP MODE ACTS ON THE LIST IN FRONT OF THE SHOPPER

When a scan resolves while shop mode is up, the scan sheet offers one of two acts:

- The product **matches a row already on the list** → "Check off *row name*". Tapping ticks
  that row and closes the sheet.
- No match → "Add to *current section title*" (or "the cart" if no section is known).

Both replace the sheet's normal "Keep it. Add to cart." action. After acting, the sheet
shows "Checked off ✓" or "On the list ✓".

#### The matcher — port it exactly, and port the asymmetry with it

**A missed match costs one extra row the shopper can uncheck. A WRONG match ticks
something they never bought** — and the list is a record: it seeds next week's trip and
feeds the shopping profile, so a false tick is a lie that propagates. The matcher is
therefore deliberately conservative and refuses far more than it could.

It must work **with no network, mid-aisle, in a basement.**

Content words: lowercase, runs of 3+ letters (hyphens allowed inside), with these dropped
as stop-words:

```
the and or with without a an of in on for no free
style brand organic natural fresh whole original classic value
pack size count oz lb lbs g kg ml l ct
```

State words: `frozen canned dried fresh raw cooked smoked cured`.

Given the scanned product name, the cart rows, and the current section id:

1. Take the product's content words. If empty → **no match**.
2. Consider every row that is not a `swap` row and has a name.
3. Skip a row when **both** sides name a state word and the sets are disjoint. "Frozen
   broccoli" is not "broccoli" for the purpose of ticking a row off. Both sides must name
   one for this veto to fire — that is what stops it over-refusing.
4. Skip a row with no shared content word.
5. **Every content word of the ROW must appear in the product.** The shopper writes "Greek
   yogurt" and scans "Fage Total 5% Greek Yogurt": the row is contained in the product,
   which is the direction that actually happens. The reverse ("yogurt" written, "Greek
   yogurt raisins" scanned) is exactly the over-match this refuses.
6. Require at least one shared word of 4+ letters. A single 3-letter overlap is not
   evidence.
7. Score each survivor: `10 × (shared word count)` `+ 5` if the row's `cardSection` equals
   the current section (they are looking at it) `+ 1` if the row is unchecked.
8. **An ambiguous match is no match.** If the top two scores tie, return nothing. Adding a
   row is the honest fallback.

Nothing here reads a brand or makes a claim about one — it answers "is this the row you
wrote". The verdict comes from the scan pipeline exactly as it always does.

---

## 9. GUEST DIFFERENCES

A guest gets the **same home surface and the same shop mode**. Two different home surfaces
is how the two would drift.

| capability | guest |
| --- | --- |
| build the cart by talking | **yes** — the public composer, shared IP budget |
| build a full cart from prefs | **yes** — `POST /api/guest/list`, one-time full tailoring |
| import a list | **yes** — `POST /api/guest/list/import` |
| counter cards on rows | **yes** — via explicit `POST /api/guest/list/attach` |
| check, add, remove, rename, scan-add | **yes**, device-local |
| complete a trip | **no** — no account, so no trip row. The `finished` hero renders doorless. |
| "same as last week" | **no** — `seedable` is always false. They have no last week for the server to read. |
| rebuild from a stored profile | needs an account: raise the sign-in offer |
| Haul | gated (see `haul.md` §7) |

`premium` is reported **true** for a guest cart on purpose: it was generated at full
tailoring, so its rows already *are* the paid capability, and offering "upgrade for
focus-aware picks" on a cart that visibly has them would be incoherent.

Persistence is device-local, and it must survive sign-in: the cart is replayed into the
account (see `auth.md` §5).

---

## 10. KNOWN DEFECTS IN THE SOURCE — do not reproduce

- **"Start a new trip" throws.** The web handler calls an undefined setter after confirming,
  so the tap raises a ReferenceError. The intended behavior is: if `progress.total > 0`,
  confirm ("Start a new trip? This clears the cart you have."); on confirm, call
  `POST /api/trips/new`, replace the cart, clear `note`, and close any open card.
- **`POST /api/list/import` was 503-ing for every caller** after paying for the vision call,
  because it read a user id that was never set. Fixed server-side; the lesson is that the
  only caller lived on a surface no real visitor reached and there was no route-level test.
- The web client has two parallel app shells (an authed one and a guest one) that have
  drifted at least twice — a dead hero and an unreachable import. **In Swift there is one
  surface stack and signed-out is a capability difference inside it.**
