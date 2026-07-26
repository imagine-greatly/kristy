# Barcode data coverage — options, tradeoffs, and what it'd take

Written after the "scanned chips → got coffee creamer" incident. **That bug was not a
coverage problem** (see the diagnosis below), but it surfaced the real question: Open
Food Facts has genuine US gaps, and we should know what better looks like before we
need it. Nothing here is integrated — this is a decision document.

## First: what actually caused chips → creamer

Not a stale cache, not a fuzzy match, not a bad OFF record. The barcode was never
looked up at all.

`client/src/lib/config.js` had:

```js
export const IS_DEMO =
  import.meta.env.VITE_DEMO === 'true' || !SUPABASE_URL || !SUPABASE_ANON_KEY;
```

A deployed build missing `VITE_SUPABASE_*` **silently became a demo**, and
`runProductScan()` short-circuits on `IS_DEMO` to a hardcoded fixture — the same
"Honey Hazelnut Coffee Creamer" for every barcode. The same root cause also produced
the "chat acknowledges without acting" bug: demo chat ran a *macro estimator* that
matched the words "milk"/"eggs" in a cart request and answered with a canned
`FOOD_REPLIES` string.

Fixed by: demo no longer auto-engages in a production build (a misconfigured deploy
now says so loudly); the demo fixture carries `demo: true` and renders a visible
"Sample product" banner; the demo macro estimator is deleted.

**Defense in depth added at the same time** (`client/src/lib/barcode.js`): a decoded
symbol is checksum-validated and UPC-E is expanded to UPC-A *before* any lookup. An
invalid or partial decode now fails honestly to the label-photo path instead of being
sent to a product database, where it could land on an unrelated product. Unknown
barcode → *"I don't have this one yet — snap the label and I'll read it directly."*
No path shows a different product as the scanned one.

## Current stack

| Layer | What it does | Coverage |
|---|---|---|
| Open Food Facts | barcode → ingredients + nutriments | Strong EU, **patchy US** (~40% hit rate in our own stress test) |
| OFF label image + Claude vision | when OFF knows the product but has no ingredient text | Depends on OFF having photographed the panel |
| **Label photo + Claude vision** | shopper photographs the panel | **~100% — always available, no database needed** |

The third row is the important one: the backstop does not depend on anyone's database
being complete. It's transcribe-only (`server/lib/labelVision.js`), returns an empty
array when nothing is legible, and produces `product: null` — so it can never assert a
wrong product identity. Coverage work below is about *reducing friction*, not about
making scanning possible.

## Options for better US coverage

### 1. Nutritionix
- **Coverage:** strong US packaged + restaurant items; one of the better US barcode sets.
- **Cost:** free tier is small; commercial plans run roughly low-hundreds $/mo at our scale.
- **Licensing:** commercial use permitted under their terms; attribution requirements.
- **Fit:** good. Their data is macro-first, and **we don't do macros** (Block O) — we
  need the *ingredient statement*, which is present but less consistently their focus.
- **Effort:** ~1 day. Slots in as a second resolver behind OFF in `extractFromBarcode`.

### 2. Barcode Lookup / UPCitemdb (aggregators)
- **Coverage:** very broad UPC → product *name*; ingredient data is thin and inconsistent.
- **Cost:** cheap (tens of $/mo).
- **Licensing:** permissive.
- **Fit:** poor on its own. Gives us a *name* but not an ingredient list, and a name
  without ingredients can't produce a verdict — the claim lock needs the ingredient
  statement. Useful only as a *display-name* enricher.
- **Effort:** ~half a day, low value alone.

### 3. Syndigo / Label Insight (GS1-grade)
- **Coverage:** the real answer. Manufacturer-supplied, near-complete US packaged
  goods, structured ingredient statements, kept current.
- **Cost:** enterprise. Expect four to five figures per year, annual contract, sales cycle.
- **Licensing:** restrictive — per-seat/per-call terms, redistribution limits that would
  need review against our public ingredient pages.
- **Fit:** excellent data, wrong stage. Revisit when scan volume justifies it.
- **Effort:** weeks, mostly procurement.

### 4. USDA FoodData Central (branded foods)
- **Coverage:** ~400k branded US items with **ingredient statements**, UPC-indexed.
- **Cost:** **free**, public domain.
- **Licensing:** none — US government work.
- **Fit:** **best next step.** We already call USDA elsewhere, the data is public
  domain (no attribution/redistribution risk on our ingredient pages), and it carries
  exactly the field we need. Its weakness is freshness — reformulations lag.
- **Effort:** ~1 day. Add a `resolveFromUSDA(barcode)` step between OFF and the vision
  fallback.

### 5. Own the gap (crowd-sourced back-contribution)
- When a shopper photographs a label for a barcode OFF doesn't have, we hold the
  ingredient text *and* the barcode. Contributing back to OFF improves the commons and
  our own future hit rate.
- **Cost:** free. **Licensing:** OFF is ODbL — contributing is aligned.
- **Caveat:** needs explicit user consent and a moderation path; don't auto-publish.
- **Effort:** ~2 days including consent UX.

## Recommendation

1. **USDA FoodData Central branded foods** as resolver #2 — free, public domain, has
   ingredient statements, closes much of the US gap.
2. **OFF backoff + cache** (already flagged in `CLAUDE.md` as an open ops idea) so
   throttling never reads as "not found."
3. Revisit **Syndigo** only when scan volume justifies an enterprise contract.
4. Treat **Nutritionix** as a fallback if USDA's freshness proves insufficient.

Do **not** add an aggregator that returns names without ingredients — a name we can't
read the ingredients for cannot produce a verdict, and showing one invites exactly the
wrong-product failure we just fixed.
