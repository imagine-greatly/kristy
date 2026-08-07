# iOS spec — HAUL

How the trip came out. The Haul reads a finished trip back and carries it forward.

Derived from `client/src/components/HaulMoment.jsx`, `HaulShareCard.jsx`,
`client/src/lib/tierBucket.js`, `client/src/lib/data.js`, and the server handler in
`server/routes/haul.js`.

Conventions (base URL, bearer token, error envelope) are as stated in `cart.md` §0.

---

## 1. WHAT THIS SURFACE IS, AND WHAT IT IS NOT

**It is a destination, not a panel.** It answers "how did that go", which is a question you
only have once a trip is behind you. It is reached from the fourth tab, from the bottom of
the home surface ("Read your haul →", shown only when the cart is empty), and
automatically after finishing a trip.

**It is not a post-mortem only.** This trip fills in live: every scan lands in it as it
happens, so the Haul and the cart are two views of one trip in progress.

**The distribution bar does not belong on the home surface.** A haul distribution is what an
app shows when it has nothing useful to say, it would push the one button that matters below
the fold, and it is structurally unsound there: the bar is a distribution of **verdicts**,
and a bought-but-unscanned item honestly has none — so it would be a chart with a known
hole standing where the answer goes.

---

## 2. THE UNIT: a scan, and a verdict

A haul row is a **scan**: Kristy read a label and made a call.

```json
{
  "id": "8f2c…",
  "product_name": "Honey Hazelnut Coffee Creamer",
  "brand": "…",
  "tier": "swap_recommended",
  "barcode": "0049000000443",
  "scanned_at": "2026-08-06T14:22:10.441Z"
}
```

### 2.1 `POST /api/haul/scan` — authed

**Request**
```json
{ "product_name": "Honey Hazelnut Coffee Creamer", "brand": "Sample", "tier": "swap_recommended", "barcode": "0049000000443" }
```
All four are optional except `tier`. `product_name` is truncated to 140, `brand` to 80,
`barcode` to 32 server-side.

**200** `{ "ok": true, "scan": { /* the row */ } }`
**400** `{ "error": "tier is required" }` · **500** `{ "error": "Could not save your scan." }`

Call it after every successful verdict. **Fire-and-forget** — a failed record must never
disturb the verdict the shopper is reading. On success, invalidate any cached Haul so it
reloads on next open.

**A scan with no tier is not a real product. Do not record it.**

---

## 3. `GET /api/haul?tzOffset=<minutes>` — authed

`tzOffset` is the device's UTC offset in minutes, in the same sign convention as
`Date.getTimezoneOffset()` (i.e. **positive west of UTC**: US Eastern in summer is `240`).
It exists so "today" is the shopper's local day, never the server's.

**200**
```json
{
  "trip":  [ /* scans whose local day == today */ ],
  "week":  [ /* the last 7 days of scans, newest first */ ],
  "bought": [ { "name": "Baby spinach", "cardSlug": "produce_storage", "completed_at": "2026-08-05T…" } ],
  "distribution": { "approved": 4, "note": 3, "swap": 2, "total": 9 },
  "read": "Solid start — but this haul is leaning on swaps. …",
  "insightsGated": false
}
```

**500** `{ "error": "Could not load your haul." }`

Field meanings:

- `trip` — a **subset** of `week`, sharing the same row ids.
- `week` — every scan in the last 7 days.
- `bought` — items **ticked off on completed trips** in the last 7 days, deduplicated by
  lowercased name. **These are not scans and carry no tier.**
- `distribution` — **of VERDICTS. Scans only, always.**
- `read` — Kristy's weekly read. **Empty string for a non-premium viewer.**
- `insightsGated` — true when the viewer is not premium **and** there is at least one scan.

### 3.1 TWO DIFFERENT THINGS, AND THE HAUL MUST NOT BLEND THEM

A **scan** is a verdict: Kristy read the label and made a call. A **bought** item is a row
the shopper ticked off — she has an opinion about many of them, but not a verdict, because
nothing was read.

Counting them together produces a number that means neither. The distribution bar in
particular is a distribution of verdicts: an unscanned item honestly has none, and forcing
one on it would color every bought item as a swap, because the bucket function returns
`swap` for anything it does not recognize.

So `bought` rides as its own field with its own count, and the bar stays scans-only.

### 3.2 Failure behavior

On any failure — network, 500, or an unparseable body — render the **empty** haul:
`{ trip: [], week: [], distribution: { approved: 0, note: 0, swap: 0, total: 0 }, read: "" }`.
There is no error screen on this surface. A haul that cannot load looks the same as a haul
with nothing in it, which is honest and non-blocking.

### 3.3 Load policy

Lazily loaded on first open. Cache the result; invalidate it after any new scan is
recorded and after a trip completes. Show the loading state only when there is no cached
haul to show.

---

## 4. TIERS → BUCKETS

Five verdict tiers collapse into three buckets. **One mapping, and the default is
load-bearing.**

```
"approved"                              → approved
"approved_with_note" | "use_with_intention" → note
anything else                           → swap
```

"Anything else" covers `swap_recommended`, `skip`, and **anything unrecognized** — which is
what makes an unknown tier render **red** rather than silently counting as approved. **Do
not make the default lenient.**

Bucket presentation:

| bucket | label | bar color | chip foreground |
| --- | --- | --- | --- |
| `approved` | Approved | mint | seafoam |
| `note` | With a note | gold | gold |
| `swap` | Swap | danger | error |

A row with **no tier at all must never reach this function.** That is why `bought` is its
own field.

The server computes `distribution` with the same mapping; the client needs its own copy
only to color individual rows.

---

## 5. SCREENS

### 5.1 Loading

Centered column: the haul icon in gold, the gold thread motif, **"Reading your haul…"** in
the display italic face at 26pt, and an ambient line.

Shown only when there is no cached haul.

### 5.2 Empty — `week` is empty

An invitation, never a dead end, and it names **both halves of the trip**: what you scan
*and* what you check off in the cart.

Centered column, max 380pt:
- The haul icon in gold, the gold thread.
- Title **"Your haul"**, display italic 26pt.
- One line, and it branches on the live cart's progress:
  - checked > 0 → `"<N> checked off. Scan something and the read on this trip fills in."`
  - otherwise → `"Everything scanned lands here. Scan a product to start it."`
- A filled **"Scan a product"** button (max 260pt wide) — the screen's one filled action.
- A quiet "Back to my cart".
- An ambient line.

### 5.3 The populated haul

A single scrolling column, max 480pt wide, 18pt horizontal padding.

**1. Header**
- Title **"Your haul"**, display italic 26pt.
- `"<T> scanned this trip · <W> scanned this week"` at 13.5pt muted.
- When `bought` is non-empty, a second, quieter line:
  `"<B> bought and checked off — no label read on it"` (`them` when B > 1).

  Two different things, said separately. Blending them into one number would produce a
  count that means neither.

**2. The distribution bar**
- A 14pt-tall rounded track. Three segments, each sized `count / max(1, total)` of the
  width, in bar order approved → note → swap. **A zero-count segment is omitted entirely**
  rather than drawn at zero width.
- Beneath it, a legend: for each of the three buckets, a dot in the bucket color, the
  label, and the count in the monospaced face.
- The legend always shows all three buckets, including zeros.

**3. Kristy's read**, exactly one of:

| condition | renders |
| --- | --- |
| `read` non-empty | a gold thread rule, then the read in her voice at 17pt |
| `read` empty and `insightsGated` true | a gold thread rule, then **"The read on your week is a member insight."** in her voice, then an "Unlock my weekly read" button |
| neither | nothing at all |

**4. "This trip"** — a small uppercase label, then one row per `trip` scan. Omitted when
`trip` is empty.

**5. "Earlier this week"** — the same, over `week` **minus** the ids already in `trip`, so
a scan appears once: under "This trip" while it is live, and only afterwards as part of the
week. Omitted when empty.

If `trip` is empty but earlier scans exist, this section's label reads **"This week"**
instead.

**6. Actions** — two side by side:
- Filled **"Add all swaps to the cart"** — the surface's one filled action. Flashes
  "Added ✓" for ~1.8 seconds after the tap, then reverts.
- Ghost **"Share haul"**.

**7. Footer** — quiet centered links: "Back to my cart", and "Ask Kristy about this haul"
when a chat handler exists.

### 5.4 A scan row

A raised row: the product name on the left (single line, ellipsized), and on the right:

- **"+ Next cart"**, rendered **only** when the scan's tier is `swap_recommended` or `skip`.
  Gold-tinted pill. After tapping it becomes "In next cart ✓" in mint, and is inert.
  The insight and the action in the same place.
- The **bucket chip** — the bucket label, in the bucket's foreground color with the bucket's
  border color.

`product_name` falls back to "Scanned item".

---

## 6. THE LOOP — this trip seeds the next one

A haul that only grades you is a report card. The point of reading a finished trip is that
it makes the **next** one easier.

### 6.1 Adding swaps to the cart

Both the per-row "+ Next cart" and the bulk "Add all swaps to the cart" do the same thing,
over a different set:

1. Filter to scans whose tier is `swap_recommended` or `skip`. (Bulk: over `week`. Per-row:
   that one scan.)
2. Map to `{ product_name, tier }`.
3. If empty, do nothing.
4. `POST /api/list/swaps` with `{ "swaps": [...] }` (see `cart.md` §3.5) — server-side so
   it survives a device change.
5. **And fold them into the live cart immediately**, so the finished trip visibly shapes
   the next one instead of waiting for a round trip.

Local fold rules:
- Skip any product name already present as a `swap` row (compare lowercased `productName`).
- New rows are **prepended**, and take this shape:
  ```json
  { "id": "<new>", "name": "Swap out: Honey Hazelnut Coffee Creamer", "category": "From your haul",
    "checked": false, "source": "swap", "productName": "Honey Hazelnut Coffee Creamer" }
  ```
- They land in the cart's "From your haul" live group and are excluded from trip progress
  (see `cart.md` §1.3, §5.1).

### 6.2 THE HAUL DOES NOT START THE NEXT TRIP

There is **one seeding door**, and it is `POST /api/trips/next`, reached from the home
hero's `completed` state ("Same as last week?").

A second door once existed here: the Haul offered its own pick-list of carry-forwards and a
"start next week's cart" button. **Two doors onto one act is how a record drifts** — they
can disagree about what a new trip starts from, and nothing in the system says which is
right. The carry-forward computation survives inside `/api/trips/next`; the button does not.

**Do not rebuild it.** The read may end in a nudge; the nudge is acted on where the next
trip is actually built.

---

## 7. GUESTS

A guest has no Haul. Scans are kept on the device (last 10) and replayed into the account
on sign-in (see `auth.md` §5), but there is nothing to read back yet.

Render a locked stub:
- The haul icon, the gold thread.
- Title **"Your haul"**.
- Line: **"Scan all you like. Your haul starts saving once you sign in."**
- A filled **"Sign in"** button.
- An ambient line.

**Do not offer a plan, a price, or an upgrade here.** The ask is sign-in, and only because
persistence genuinely requires an account.

---

## 8. THE SHARE CARD

A branded image of the haul, handed to the system share sheet.

### 8.1 Presentation

A centered dialog over a dark scrim, max 400pt: a close control, the rendered card, a
toggle, and two actions.

- **Toggle: "Hide personal data"** — off by default. Re-render the card when it changes.
  Personal data leaves the device only when the shopper shares, and only in the form they
  can see first.
- **"Share"** (filled) → hand the image to the system share sheet. If sharing is
  unavailable, fall back to saving and flash "Saved image".
- **"Save image"** (ghost) → save, flash "Saved image".
- A user-cancelled share is **not** an error and must show nothing. Any other failure
  flashes "Share failed. Try Save." or "Save failed. Try again."
- Status flashes clear after ~1.8 seconds.
- Dismiss on scrim tap and on Escape/back.

### 8.2 Card content

Brand-locked: the forest-green ground, gold accents, the thread/dot motif, the wordmark,
and a call to action. It draws:

- the **distribution** (the three buckets),
- Kristy's **read**, when present,
- the wordmark and CTA.

It draws **no product names and no counts of what was bought**. With "Hide personal data"
on, the read is withheld too.

**Render the actual on-screen card view to an image rather than hand-drawing a second
copy.** The web client hand-draws it in a canvas — ~250 lines — specifically so that what
you see is what exports; rendering the real view removes the drift by construction, and
font loading stops being a problem.

---

## 9. CHAT HANDOFF

"Ask Kristy about this haul" seeds a thread with, verbatim:

> "Your haul this week: *A* approved, *N* with a note, *S* to swap. What do you want to
> work on?"

using `distribution.approved`, `.note`, `.swap`, each defaulting to 0.

---

## 10. THE HAUL READS COMPLETED TRIPS; IT DOES NOT WRITE BOUGHT ROWS

`bought` is derived server-side from completed trips in the window. The client never posts
a bought item, never assigns it a tier, and never merges it into `week`.

If a future surface wants to show bought items as rows, they get their own section and
their own treatment — **not** a chip on the distribution bar, and never a tier.
