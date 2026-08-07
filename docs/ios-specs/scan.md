# iOS spec — SCAN

The labeled half of the store: a barcode, or a photograph of an ingredient panel. This is
one half of the product, not the whole of it — the other half is the counter, at equal
weight (see `counter.md`).

Derived from `client/src/components/ScanHome.jsx`, `ScanSheet.jsx`, `ScanVerdictCard.jsx`,
`CameraModal.jsx`, `IngredientPage.jsx`, `client/src/lib/logging.js`, `barcode.js`,
`verdictRamp.js`, and the server handlers in `server/routes/scan.js`, `verdict.js`,
`ingredient.js` plus `server/lib/verdictEngine.js`.

Conventions (base URL, bearer token, error envelope) are as stated in `cart.md` §0.

---

## 1. THE PIPELINE

A scan is **two network hops**, always, in this order:

```
        ┌─ barcode ─▶ POST /api/scan/barcode  ─┐
capture ┤                                      ├─▶ { ingredients, product, nutrition } ─▶ POST /api/verdict ─▶ the card
        └─ photo ───▶ POST /api/scan/label ───┘
```

**Extraction makes no claim and computes no verdict.** It only answers "what does this
package say". The verdict — the tier, the flags, the seal, the note — comes from
`/api/verdict`, which sees the ingredient string and nothing about where it came from.

The guest path is the same two hops against `/api/guest/scan/*` and `/api/guest/verdict`.

### 1.1 Orchestration rules

**Every scan takes a monotonic ticket, and a stale response is dropped entirely.**
Extraction and verdict are two hops, so two scans can be in flight at once — a re-scan, or
a barcode miss the shopper immediately follows with a label photo. Without a ticket the
**last response to arrive renders**, which may be the older one: a verdict for a product
the shopper has already moved on from.

- Increment the ticket when a scan starts, and when the sheet is dismissed.
- A result whose ticket is not the current one is **dropped silently**: not rendered, not
  recorded in the Haul, not counted in analytics. Dropping it silently is correct — the
  shopper is already watching a newer scan, and the stale one was never about the product
  in their hand.
- Dismissing the sheet invalidates whatever is in flight. Otherwise a slow lookup lands
  after the shopper walked away and pops a card back open for a product they are no longer
  holding.

**One decode per camera opening.** A continuous decoder fires per analyzed frame and
stopping it is not synchronous, so a sweep across a shelf can fire twice — two lookups in
flight, and whichever resolves last renders. That is a wrong-product bug by construction.
Latch the first decode and ignore every subsequent one until the camera is reopened.

---

## 2. SCREENS

### 2.1 Scan home

A centered column, max 420pt wide.

1. Wordmark "Kristy" in the display italic face, brass.
2. The thin gold thread motif.
3. Headline: **"What's in the box?"** — display italic, 26pt.
4. Sub: `"Ingredient by ingredient, against how you eat."` — or, for a signed-out shopper,
   `"Ingredient by ingredient. No account needed."`
5. **Primary action: "Photograph the label"** with a camera icon. Filled (bone). Sized to
   its own content and centered — **not full width**. Area is what made the earlier
   full-width version read as a lit panel rather than a button.
6. **Secondary: "Scan a barcode"** with a barcode icon. Full-width, transparent, hairline
   border, smaller type. Present, not competing.
7. Line: `"A barcode is faster when the database has it. The panel always reads."`
8. **The other half** — a gold-edged card, full width: icon, title **"The counter,
   answered"**, sub "Meat, seafood, produce, dairy, bulk. No barcode needed.", chevron.
   Tapping opens the counter surface.
9. Quiet link: "Something messier to work through? →" → the chat thread.

**The photo is the primary action, and that is a measured decision.** Barcode coverage was
19% on independently sourced products, and when the database did answer it was wrong badly
enough to put a gold seal on a corn-syrup ketchup. The photo has none of those failure
modes — right product, right market, right now. A scanner looks up a number; she reads the
label.

Two pieces of copy that were removed and must not come back:
- **"Half the store, though."** under the headline. It conceded a limit the product does
  not have, at the worst possible moment — before the shopper has done anything, arguing
  against the surface they just opened.
- **"Nothing to scan?"** on the counter card. It framed the moat as what you do when the
  real feature fails. The counter is why anyone is here; it is stated as a capability.

### 2.2 The camera

Full-bleed live preview with **no text on it at all** — four gold corner brackets marking
where to place the barcode or label, a close control, and nothing else. All copy lives on
scan home, before the camera opens. No animation.

Error states, replacing the preview:
- Permission denied → "Camera access needed. Allow it in your Settings."
- Anything else → "Camera didn't start. Try again."

**Where native must be better than the web client** (this is the justification for the
work, and it belongs in the build):

- **Run on-device text recognition on the live preview frames.** Today panel readability is
  only discovered *after* a full round trip: the shopper takes a photo, it uploads, the
  model reads it, and only then does anyone learn it was unusable. On device, readability
  is known **before** the model call — free, instant, and in time to say "move closer"
  while the camera is still up. Every failure mode of the photo path (glare, motion blur,
  6pt type, a cropped panel) becomes a live hint instead of a wasted call and a confusing
  result.
- **Lock focus and exposure on the panel, and take a full-sensor still.** The browser hands
  back whatever the camera API defaults to — commonly 640×480 — for 6pt ingredient type on
  a curved foil bag. This is the difference between a legible ingredient list and a coin
  flip.
- **Read a barcode and text from ONE frame.** The web needs two separate flows. A barcode
  plus a transcribed panel in one capture is exactly the join key that fills the product
  catalog (§4.3).

### 2.3 The scan sheet

Everything a scan produces is presented in a bottom sheet over whatever surface launched
it. It never navigates.

- Presented from the bottom, max 460pt wide, up to 92% of the viewport height, scrollable,
  rounded top corners, over a dark scrim. Tapping the scrim dismisses.
- A close control pinned top-right, above the content. **It is opaque, so any banner at the
  top of the sheet needs clearance for it.**
- One label-photo input is available from **every** state that offers a photo action — the
  honest miss, the re-shoot ask, and the partial-read banner sitting above a real verdict.

Six mutually exclusive contents, checked in this order:

| # | condition | content |
| --- | --- | --- |
| 1 | loading | §2.4 |
| 2 | `gate` | §2.5 |
| 3 | `error` | §2.6 |
| 4 | `found == false` | §2.7 |
| 5 | `verdict` present | §3 (the verdict card) plus the surrounding blocks |
| 6 | anything else | "Nothing to show" / "Try scanning again." |

**The queued replacement for this sheet** (specced, unbuilt on web, and the right thing to
do natively first): the sheet should use detents so the **camera stays live behind it**,
and **the approved state should be the smallest state in the app** — photo, name, verdict,
detail on tap.

### 2.4 Loading

Centered: a circular "K" avatar, the gold thread, then

- Title: **"Reading it…"**
- Sub: `"Pulling the ingredients off that label."` (photo) or `"Looking that one up."`
  (barcode)
- An ambient line beneath.

### 2.5 Guest gate

Only reachable on the guest path, when the shared per-IP budget is exhausted.

- Title: **"Want the rest?"**
- Sub: "You've had your look. Sign in and every scan gets read against your goal."
- A "Sign in" button.

### 2.6 Error

- Title: **"Hm."**
- Sub: the server's `message` if present, else `"That scan didn't go through. Try again in
  a sec."` (barcode) or `"Couldn't read that one. Try another shot, better lit."` (photo).
- A "Close" button.

### 2.7 The honest miss — `found: false`

**She never shows a different product in place of the one being held.** Five distinct
sub-states, checked in this order:

| sub-state | trigger | title | sub | primary action |
| --- | --- | --- | --- | --- |
| unreadable barcode | the decoded digits failed validation locally | "That barcode came through unclear" | "Guessing from a partial read is worse than not knowing. Snap the ingredient label instead." | Photograph the label |
| conflict | server sent `conflict: true` | "The label settles this one" | server `message`, else "Two different ingredient lists on file for this one. A photo of the panel settles it." | Photograph the label |
| retry photo | server sent `retryPhoto: true` | "One more shot" | server `message`, else "That panel didn't come through. One more shot of the ingredients list, straight on and filling the frame." | **Take another shot** |
| barcode miss | mode was barcode | "Not in the data yet" | "Not in the data yet. Snap the ingredient label instead. That works on anything." | Photograph the label |
| panel miss | mode was photo | "Can't read that panel" | server `message`, else "Try the ingredients panel again, better lit. Or type the product name." | Photograph the label |

Plus, in every one of them:
- If `product.name` is known, show it as a quiet pill so the shopper can see what was
  identified even though nothing could be read.
- A secondary "Type it instead" which dismisses the sheet.

**Why `conflict` gets its own state**: the database holds two ingredient lists for that
barcode that would score differently, so there is no honest verdict to give from either.
"Not in the data yet" would be a lie — it is in the data twice — and the shopper is the
only one who can settle it. They are holding the package; the database is not.

**Why `retryPhoto` gets its own state**: vision found no legible list at all. A better shot
genuinely fixes that, so it asks for one more photo rather than sending the shopper off to
type a name they did not need to type.

---

## 3. THE VERDICT CARD — every branch

Rendered top to bottom inside the sheet. Card ground is a vertical gradient from the near-
black void to the forest ground; 20pt corner radius; max 420pt wide.

### 3.0 Blocks that sit ABOVE the card

- **Demo banner** — only in a sample/demo build. "Sample product — demo mode isn't looking
  up real barcodes." **Sample data can never sit on screen unlabeled**: the fixture is the
  same product for every barcode, so without this it reads as a real lookup.
- **Partial-read banner** — when `verdict.incompleteRead` is true. A plain raised card,
  **deliberately not gold** (gold is reserved for identity and the earned seal; this is a
  limitation being named honestly):
  > "Only part of that list came through — what's below is real, but the rest of the panel
  > is where the next thing would be."

  plus a "Shoot the whole panel" button.

Both need top clearance for the sheet's opaque close control.

### 3.1 Product header

Thumbnail (56pt, 12pt radius) + name + aisle.

- With `product.image` → the image.
- Without → a branded fallback tile: the surface color with the product's **first letter,
  uppercased**, in the display italic face in brass. `"·"` when there is no name.
- Name at 17pt semibold; falls back to `"This product"`.
- `aisle` beneath, 12.5pt muted, capitalized, when present.

> **Known gap, queued**: on a *photo* read the image slot is always empty, because the
> product database has no stored image for a product read off a panel. The fix is a
> client-side crop of the shopper's own photo, held in memory for the session — **nothing
> persisted or uploaded beyond the vision call that already happens**, so the
> no-images-stored rule is unchanged.

### 3.2 THE SEAL, OR THE BAR — the single most important branch

```
if verdict.stamp == true  → the gold "Kristy Approved" seal
else                      → the plain verdict bar
```

**The stamp is earned.** The seal renders **only** when `stamp` is true, which the engine
sets only at `tier == "approved"` with no hard line violated and no sugar withholding. There
is no "approved-ish" state and no client-side condition that can produce a seal.

**The seal**: a gold-hairlined block containing a strong gold thread rule, then the
wordmark "Kristy" in display italic brass at 30pt above "APPROVED" in the UI face at 12pt
with wide letter-spacing, then a second strong thread rule. Accessibility label:
"Kristy Approved".

**The bar**: a rounded block with a gold dot and Kristy's **call** in her voice at 18pt.
The call and the palette are keyed to the tier:

| tier | call | tone |
| --- | --- | --- |
| `approved` | "Approved." | mint |
| `approved_with_note` | "Approved, with a note." | gold |
| `use_with_intention` | "Use it with intention." | gold |
| `swap_recommended` | "Swap it. There's a better pick." | strong gold |
| `skip` | "Skip. Put it back." | danger |

An unrecognized tier falls back to the `approved_with_note` call and palette.

Tone palettes (foreground / border / background):
- mint → seafoam / mint / surface-2
- gold → text-secondary / gold border / gold tint
- strong gold → gold / gold border / gold tint
- danger → error / danger border / danger tint

### 3.3 The approved read — when `approvedRead` is present

Two lines of **factual** text in the UI face (she is not speaking here; the label is):

- `approvedRead.checked` — e.g. `"Read all 14. None of them are on the list."` or, at one
  ingredient, `"One ingredient: rolled oats."`
- `approvedRead.names` — the first few ingredient names, with a trailing `…` when there are
  more. Omitted when empty.
- If `sugarHeavy` is true, one more line in the same style:
  **"Added sugar is high for the category."**

**This replaced a sentence the model wrote on every clean product** — eight of ten approved
scans came back with a near-verbatim "This one is clean. No industrial additives, no
processing tricks — just real food." `approved` means nothing *matched*, out of 74 entries,
which is not the same claim as "clean". So the card **reports** instead. The second line is
read off the label, which is why it can never become a template: a strawberry spread whose
second ingredient is sugar shows the shopper that word, with Kristy holding no position on
sugar at all.

`sugarHeavy` exists because a number may withhold a seal the ingredient engine granted. Say
which.

### 3.4 What's inside — the universal layer

Rendered when `universalLayer` is non-empty.

- Section label: **"WHAT'S INSIDE"**
- Read count: `"14 ingredients read · 3 flagged"` when `ingredientsRead` is present,
  otherwise `"3 flagged"`. Singular "ingredient" at 1.
- One row per flag, **sorted** (§3.7):
  - A severity dot, colored on the verdict ramp.
  - The ingredient `name` (semibold 14.5pt, wraps anywhere — a long unbroken name like
    carboxymethylcellulose would otherwise shove the tag off the row at 390pt).
  - An **evidence tag** pill, gold-tinted: `established` → "Established",
    `credible_concern` → "Credible concern", `kristys_standard` → "Kristy's standard",
    `time_tested` → "Time-tested". Unknown tiers render the raw value.
  - `one_liner` beneath, 12.5pt muted.
  - A chevron, and the whole row is tappable → the ingredient page (§5), **only when the
    item has an `id`** and a handler exists.
- Footer, in her voice: **"Every flag is graded: settled science, credible concern, or
  whole-food standard. The tier is always shown."**

  **This is the trust mechanism, and it is free on every card.** The reader has to know
  which kind of claim a flag is, or the confident ones and the contested ones read the same.

Severity → dot color:

| severity | color |
| --- | --- |
| `critical` | error red |
| `high` | gold |
| `moderate` | muted gold |
| `flag` (and default) | seafoam |

Four severities need four steps; `moderate` takes the muted gold so it reads as a dimmer
version of `high` rather than an identical dot. The card is meant to scan like a receipt of
concerns, which only works if the dots are actually separable.

### 3.5 What's good in here — the affirmation layer

Rendered when `affirmationLayer` is non-empty. Same row anatomy so the card reads as one
system, but **in the approved register**:

- The dot is always **seafoam** — never gold, never red.
- The evidence tag is **mint-tinted**, not gold. A viewer should be able to tell an
  affirmation from a concern without reading a word.
- **There is no severity.** An affirmation does not carry one, and giving it one would let
  it into concern scoring.
- Footer, in her voice: **"Backed by history, not a lab. Labeled that way on purpose."**

An affirmation **never** lifts the tier and never restores the seal.

### 3.6 Kristy's note, the swap, and the withheld read

**The note** — rendered when `note` is present:
- A small uppercase label `"for your <goal read label>"`, falling back to `"for your goal"`.
- The note in her voice at 18pt — the largest prose on the card.
- A taste nudge beneath, when `freeTastesLeft` is 0 or 1:
  - 1 → "1 free read left, then it becomes a membership perk."
  - 0 → "Last free read. Membership unlocks the rest."

**The swap** — rendered when `swap` is present, in a gold-hairlined block labeled
"KRISTY'S SWAP". Split the string at the **first comma**: the leading segment is the
headline pick (bold, ink), the remainder (including the comma) is secondary. Never present
for approved tiers — there is nothing to move away from.

**The withheld-read slot** — rendered **only when there is no `note`**. Three mutually
exclusive states, in this order:

| state | trigger | content |
| --- | --- | --- |
| composing | a goal was just tapped and a recompose is in flight | "Reading it…" in her voice |
| needs goal | `verdict.needsGoal` | **"Set how you eat and this gets read against it."** in her voice, then the ten goal chips (see `onboarding.md` §2.1) as one-tap pills |
| upsell | `verdict.upsell` | the upsell line in her voice, then one unlock button (§3.8) |

The tease is **absence**, never a modal and never blocking.

### 3.7 Flag ordering

Sort the universal layer for display:

1. **Focus-relevant first.** Build a set of names from `signals.glycemicHigh`,
   `signals.cardiovascular` and `signals.sugarAliases`; anything whose `name` is in that
   set floats to the top.
2. Then worst severity first: `critical` 4 > `high` 3 > `moderate` 2 > `flag` 1 > unknown 0.
3. Then original order (stable).

### 3.8 The unlock button — which one, and why

Only one control renders, chosen by capability:

| condition | label | action |
| --- | --- | --- |
| signed in, has never had any subscription row, and an upgrade path exists | **"Start the free week"** | grant the trial (see `auth.md` §7.3), then recompose the read in place |
| signed in, trial already used | **"Unlock the full read"** | open the upgrade screen |
| signed out | **"Sign in for the full read"** | open sign-in |

**Never call the trial endpoint speculatively** — not on launch, not on onboarding, not to
warm state. It is idempotent *by existence*: any subscription row at all, in any status, is
returned untouched, so a stray write permanently spends the only trial that shopper will
ever get. This is the peak-intent moment and the upgrade screen; nowhere else.

On a successful trial grant, if the shopper was blocked on a gated scan, **recompose the
read in place** using the cached ingredients — no re-scan, and no free taste spent, because
they are now a member.

### 3.9 The education line

Rendered when `education.text` is present: a gold thread rule, then the line in her voice,
centered, muted, max 320pt.

**At most one per card**, chosen server-side by the highest-priority trigger on that
product. Free for everyone.

### 3.10 The focus offer — after a pattern, once

Rendered **inside the sheet, below the cart action** — never a modal.

The rule: after **2 scans in one session flag the SAME category**, Kristy offers **once** to
watch it. Never for a focus already on, at most one offer per session, and the tally resets
on relaunch.

Derive categories from the verdict's `signals`:

| signal | category | focus turned on |
| --- | --- | --- |
| `highSodium` | sodium | `lower_sodium` |
| `highAddedSugar` | sugar | `lower_sugar` |
| `glycemicHigh` non-empty | blood_sugar | `blood_sugar` |
| `cardiovascular` non-empty | heart | `heart` |

Lines (verbatim):

| category | line |
| --- | --- |
| sodium | "That's two high-sodium picks you've put back. Want sodium flagged from here on?" |
| sugar | "Twice now on the high-sugar stuff. Want added sugar flagged from here on?" |
| blood_sugar | "Couple of blood-sugar spikers back to back. Want those flagged as we shop?" |
| heart | "Two now with the oils on the whole-food standard. Flag that from here on?" |

Render: a gold-tinted, gold-hairlined block with the line in her voice, then
**"Yes, watch it"** and **"Not now"**. Accepting turns the focus on and, if it is the
shopper's first ever focus, fires the one-time coach-not-doctor disclaimer (see
`onboarding.md` §4). Dismissing clears it for the session.

Clear any pending offer when a new scan starts.

### 3.11 The cart action

Below the verdict card. Four shapes:

| context | control |
| --- | --- |
| normal, tier is approved / with-note / with-intention | filled **"Keep it. Add to cart."** |
| normal, tier is `swap_recommended` or `skip` | outlined **"Add it anyway"** |
| after adding | "In your cart ✓" plus a quiet "View cart" |
| **shop mode** | see `cart.md` §8.11 — "Check off *row*" or "Add to *Section*", then "Checked off ✓" / "On the list ✓" |

Adding puts a row on the cart with `source: "scan"`, `checked: true` (it is in your hands —
it is in the cart), the verdict `tier` carried along, and a category of "Scanned". **The
same product scanned twice in one trip keeps one row with the freshest verdict.**

### 3.12 "Ask Kristy about this"

A quiet full-width button below everything, **suppressed entirely in shop mode** (see
`cart.md` §8.7). Tapping seeds a chat thread with:

> "That *<product name>* came back as *<tier phrase>*. Want to dig into it, log it, or find
> a better pick?"

Tier phrases: `approved` → "a clean approve" · `approved_with_note` → "approved, with a
note" · `use_with_intention` → "a use-with-intention" · `swap_recommended` → "a swap" ·
`skip` → "a skip" · unknown → "my read".

---

## 4. API

### 4.1 `POST /api/scan/barcode` — authed · `POST /api/guest/scan/barcode` — public

**Request** `{ "barcode": "0049000000443" }`

**200 — a hit**
```json
{
  "found": true,
  "source": "off",
  "product": { "barcode": "0049000000443", "name": "…", "brand": "…", "image": "https://…", "aisle": "carbonated drinks" },
  "ingredients": "carbonated water, high fructose corn syrup, caramel color, …",
  "nutrition": { "sodium": 0.01, "addedSugar": 10.6, "fiber": 0, "caffeine": null }
}
```
`source` is `"store"` (Kristy's own product catalog), `"off"` (Open Food Facts), or
`"none"`. A `store` hit built from a partial panel also carries `partialRead: true`.

**200 — a miss**
```json
{ "found": false, "source": "none", "product": { "barcode": "0049000000443", "name": null }, "ingredients": "" }
```

**200 — a conflict**
```json
{ "found": false, "source": "conflict", "product": {…}, "ingredients": "", "nutrition": {…},
  "conflict": true, "message": "<Kristy-voiced line>" }
```

**200 — guest over budget** `{ "gate": true, "reason": "limit" }`

**400** `{ "error": "barcode is required" }`
**502** `{ "error": true, "message": "That scan didn't go through — give it another try in a sec." }`

**The identity guard is server-side and must not be second-guessed**: the response must be
about the code that was asked for, tolerating zero-padding (a 12-digit UPC-A is commonly
stored as a 13-digit EAN). A mismatch is returned as a miss, because an honest miss costs a
photo and a confident wrong verdict costs the relationship.

### 4.2 `POST /api/scan/label` — authed · `POST /api/guest/scan/label` — public

**multipart/form-data**
- `image` — the photo (required)
- `barcode` — optional; see §4.3

**200 — a read**
```json
{
  "found": true,
  "source": "vision",
  "product": { "barcode": "0049000000443", "name": "…", "brand": "…", "image": null, "aisle": "" },
  "ingredients": "rolled oats, raw honey, sea salt",
  "nutrition": { "sodium": null, "addedSugar": 12.0, "fiber": null, "caffeine": null },
  "partialRead": true
}
```
`nutrition` is `null` when the panel was not in frame or not legible. `partialRead` is
present only when the transcription was of a partly-obscured panel.

**200 — no legible list**
```json
{ "found": false, "source": "vision", "product": null, "ingredients": "", "panel": "none",
  "retryPhoto": true,
  "message": "That panel didn't come through. One more shot of the ingredients list — straight on, close enough to fill the frame." }
```

**200 — unreadable / not English**
```json
{ "found": false, "source": "vision", "product": null, "ingredients": "",
  "message": "No ingredient list readable on that one. Type the product name instead." }
```

**400** `{ "error": "image is required" }` · **502** as above · guest budget gate as above.

Identity (`name`, `brand`) comes **straight off the package when it was legible, else
null** — never inferred. A wrong name on a right verdict is still a wrong product.

**Only one number is read off the nutrition panel: sugars.** Everything else there is
ignored — a shopper can read "12g protein" themselves and nobody can read "tripotassium
phosphate". Sugars is the exception because the seal gate needs grams.

### 4.3 THE SELF-HEALING HANDOFF — carry the missed barcode

When a label photo is answering a **barcode that just missed**, send that barcode along in
the multipart body. The read is then retained under that code, so **the next shopper to
scan it resolves from Kristy's own store instead of missing again** — for everyone, not
just this one. This is the whole moat and it costs one field.

Client rules:
- Capture the missed code **before** clearing the scan state, since starting the photo scan
  clears the miss you are reading from.
- Validate it locally first (§4.5). An invalid code is dropped rather than sent: filing a
  good read under a garbage key pollutes the catalog for everyone. The photo is still read
  and still retained, just by product hash instead.
- The barcode is treated server-side as an *association claim*, never as truth: a vision
  read ranks below a database record, so a photo filed under an existing product's code can
  never overwrite it. This also closes the tampering path.

Retention is fire-and-forget and must never delay the verdict.

### 4.4 `POST /api/verdict` — authed · `POST /api/guest/verdict` — public

**Authed request**
```json
{
  "ingredients": "rolled oats, raw honey, sea salt",
  "goal": "high-protein shopping",
  "nonNegotiables": ["no seed oils"],
  "focuses": ["lower_sodium"],
  "constraints": ["budget"],
  "nutrition": { "sodium": null, "addedSugar": 12.0, "fiber": null, "caffeine": null },
  "personalize": true,
  "readComplete": true,
  "barcode": "0049000000443"
}
```

**Guest request** — deliberately narrower:
```json
{ "ingredients": "…", "nonNegotiables": ["no seed oils"], "nutrition": {…}, "readComplete": true, "barcode": "…" }
```

Field meanings, all of which are load-bearing:

- `ingredients` — a string or an array of strings; the engine tokenizes either. **The
  verdict is computed from this alone.**
- `personalize` — send `false` when the shopper has **no stored goal**. This returns the
  universal layer plus `needsGoal: true`, composes no note, makes no model call, and
  **consumes no free taste** — setting a goal is not itself a read.
- `readComplete` — send `false` when the panel was cut off or partly obscured.
- `barcode` — **retention only**. It is echoed so the tier can be stamped onto the product
  row. Nothing about the verdict is derived from it, so a wrong or forged barcode cannot
  change a single word of the read.
- **Hard lines ride the guest path too**, because a refusal is not a personalization luxury
  — resolving one is a knowledge-base read with no model call. Goal, focuses and
  constraints stay off the guest path; those drive the personalized note.
- **`nutrition` rides the guest path too, and has to.** The added-sugar seal gate is a
  deterministic read of a number the scan already fetched. Withholding it from guests would
  mean the same product carried the seal for a stranger and not for a member, and **a seal
  that means two things is not a seal.**

**200 — the verdict**
```json
{
  "tier": "swap_recommended",
  "stamp": false,
  "universalLayer": [
    { "id": "canola_oil", "name": "Canola Oil", "one_liner": "…", "severity": "high", "evidence_tier": "kristys_standard" }
  ],
  "affirmationLayer": [
    { "id": "raw_honey", "name": "Raw Honey", "one_liner": "…", "evidence_tier": "time_tested" }
  ],
  "note": "…",
  "swap": "Butter, ghee, or a splash of whole milk in your coffee",
  "education": { "text": "…" },
  "signals": { "highSodium": false, "highAddedSugar": true, "sodium_100g": null, "added_sugar_100g": 22,
               "highCaffeine": false, "caffeine_100g": null, "fiber_100g": null,
               "glycemicHigh": [], "sugarAliases": ["Agave Syrup"], "cardiovascular": ["Canola Oil"],
               "additives": [], "processedFats": [], "refinedGrain": [] },
  "ingredientsRead": 14,
  "hardLines": { "violated": [ { "value": "no seed oils", "label": "No seed oils", "names": ["Canola Oil"] } ] },
  "approvedRead": null,
  "sugarHeavy": false,
  "gated": false,
  "freeTastesLeft": 2,
  "incompleteRead": false
}
```

Branch-specific additions:
- **no goal** (`personalize: false`) → `note: null`, `needsGoal: true`, no `gated`,
  no `freeTastesLeft`.
- **gated** (free, out of tastes) → `note: null`, `gated: true`, `upsell: "That's what's in
  it. Whether it belongs in your cart — that's my read."`
- **guest** → same as gated, same `upsell`.
- **approved** → `note` and `swap` are both `null` and **no model call is made**;
  `approvedRead` carries the copy instead, and **no free taste is spent**.
- **partial read** → whenever `readComplete: false` and the computed tier is `approved`,
  the response is rewritten to `stamp: false, incompleteRead: true`. The tier itself is
  left alone.

**400** `{ "error": "ingredients is required" }`
**422** `{ "error": true, "unreadable": true, "message": "Nothing readable in that ingredient list. Photograph the panel instead." }`
**502** `{ "error": true, "message": "I couldn't pull my read together on that one — give me a second and try again." }`
**200 guest over budget** `{ "gate": true, "reason": "limit" }`

**Never reshape the response.** The matched-entry shape is consumed directly by the card.
Extend additively; never restructure.

### 4.5 Barcode validation — reimplement on device, exactly

A scanner hands back a payload string, not a validated GTIN. **A barcode is
checksum-validated before any lookup.** An invalid or partial decode sent to a product
database is a lottery ticket on someone else's product; the honest answer is "I couldn't
read that", which routes to the label photo.

Normalization:
1. Trim; strip spaces and hyphens.
2. Empty → reject (`empty`). Non-digits → reject (`shape`).
3. **Length 8**: try expanding it as a zero-suppressed UPC-E to its 12-digit UPC-A form —
   valid only for number systems `0` and `1`, expanded per the standard table keyed on the
   last data digit. If the expansion has a valid check digit, use the **expanded** code. Else
   if the 8 digits themselves have a valid check digit, it is a legitimate EAN-8: use it.
   Else reject (`checksum`).
   > US shelves are full of 8-digit UPC-E codes on small packages, and the databases are
   > keyed on the **expanded** form, so the compressed digits either miss or collide with an
   > unrelated code. Expand before lookup rather than guessing at the API.
4. **Length 12, 13 or 14**: valid check digit → accept. Otherwise reject (`checksum`).
5. **Any other length** → reject (`shape`).

Check digit: mod-10 over every digit except the last, weights alternating 3,1,3,1… from the
**right** of the payload; the check digit is `(10 − (sum mod 10)) mod 10`.

`sameGtin(a, b)`: strip leading zeros from both and compare. **The zero-padding tolerance is
deliberate** — a strict compare turns correct US scans into misses.

**A rejection is not an error state.** It is the honest "I couldn't read that" that routes
to the photo, and it must never fall through to a lookup.

---

## 5. THE INGREDIENT PAGE

A full-screen read on one flagged ingredient, reached by tapping any flag or affirmation
row. **A pure knowledge-base read** — no auth, no model call, free, cacheable, and
deep-linkable at `/app/ingredient/:id`.

### 5.1 `GET /api/ingredient/:id` — public

**200**
```json
{
  "id": "canola_oil",
  "name": "Canola Oil",
  "aliases": ["rapeseed oil", "LEAR oil"],
  "category": "processed_fats",
  "polarity": "concern",
  "severity": "high",
  "severity_label": "Strong case to avoid",
  "evidence_tier": "kristys_standard",
  "verdict": "avoid",
  "one_liner": "…",
  "why": "…",
  "history": "…",
  "sources": ["…"],
  "swap": "Butter, ghee, or extra-virgin olive oil",
  "framing": { "verdict": "…", "severity": "…", "evidence": "…" },
  "education": { "text": "…" }
}
```
**404** `{ "error": "not_found" }`

`polarity` is `"affirming"` or `"concern"`. `history`, `swap`, `verdict` and any `framing`
member may be null.

**`severity_label` is served, not restated.** It is a claim register ("Skip always",
"Strong case to avoid") and a client that wrote its own words for it would be a claim that
drifts. Render what arrives.

### 5.2 Layout

A full-screen sheet: a top bar with "‹ Back" and an "INGREDIENT" eyebrow, then a scrolling
column capped at 640pt.

The page **branches on polarity**. `affirming` is true when `polarity == "affirming"` or
`evidence_tier == "time_tested"`.

1. **Name** at 28pt bold, then `"also appears as a · b · c"` when aliases exist.
2. **Chips**:
   - Concern → a severity chip (dot in the ramp color + `severity_label`, falling back to
     the raw `severity`) **and** an evidence chip, gold-tinted.
   - Affirming → **no severity chip at all** (it is not graded on the concern ramp) and the
     evidence chip in **mint**.
3. **Her register line**, in a tinted block — gold for a concern, **mint** for an
   affirmation. Content: `framing.verdict` if present, else for an affirmation
   **"People have eaten this for a very long time."**, else the severity call:

   | severity | call |
   | --- | --- |
   | `critical` | "Put it back. Every time." |
   | `high` | "Put it back." |
   | `moderate` | "It's here. Comes down to how often." |
   | `flag` | "Not an alarm. Worth seeing." |

4. **Then the two orders diverge**:
   - **Affirming** → "The history" first (it *is* the evidence), then "Why Kristy stands
     behind it": `one_liner` as the lead, `why` beneath.
   - **Concern** → "Why it matters" first (`one_liner` lead, `why` beneath), then "The
     history" when seeded.
5. **"The evidence"** — the evidence chip again, `framing.evidence` as a paragraph, then
   `sources` as a plain dashed list.
6. **"Grab instead"** — `swap`, when present, split at the first comma exactly as on the
   verdict card.
7. **The education line**, when present: a gold thread rule, then the line in her voice,
   centered.

**Gold marks a concern across this whole app, so an affirmed whole food must never wear
it** — otherwise the page reads as a warning about garlic.

### 5.3 States

| state | renders |
| --- | --- |
| loading | "Reading the file…" italic muted |
| 404 | "No page on that one yet." in her voice, plus "Back to your scan" |
| other failure | "That didn't load just now." plus "Back to your scan" |

Cache by id for the session.

### 5.4 Deep linking

The page must be reachable from a cold link and must render **above** the launch splash and
any sign-in gate, so a shared link always resolves — for a signed-out reader too. Closing it
returns to wherever the shopper came from, or to the app root on a cold open.

---

## 6. THE FREE-NOTE METER (scan path)

**Three free personalized notes, then the gate.** Metered server-side on the account; the
client only reads `freeTastesLeft` and `gated` off the response.

- A **member** never spends one.
- An **approved** verdict never spends one — no note is composed at all. Charging one of
  three tastes for a template was the part that made it indefensible.
- A **goal-less** scan (`personalize: false`) never spends one.
- **This is not the counter's read meter.** Same number, same mechanic, same words,
  different counter (see `counter.md` §6.1).

Guests never reach it: their verdict is always the universal layer with `gated: true`.

---

## 7. RECORDING A SCAN

After a verdict renders (and only when `found != false` and a `verdict` exists):

- **Signed in** → `POST /api/haul/scan` with `{ product_name, brand, tier, barcode }`.
  Fire-and-forget: a failed record must never disturb the verdict the shopper is reading.
  Invalidate any cached Haul so it reloads.
- **Signed out** → append to a device-local list of the last **10** scans, in the same
  field shape, so they can be replayed into the account on sign-in (see `auth.md` §5).
  **A scan with no tier is not a real product — skip it.**

See `haul.md` §2.

---

## 8. WHAT THE CLIENT MAY NEVER DO ON THIS SURFACE

- **Never render the seal except on `stamp == true`.**
- **Never compose a claim.** Every sentence about a food comes from a server field.
- **Never show a different product than the one scanned.** Every miss state above exists so
  that this never has to happen.
- **Never turn a partial read into a clean approval.** Flags found on a partial read stand
  — everything matched was really printed on that panel — but `approved` is withheld,
  because the tail she could not read is exactly where the canola hides.
- **Never look up an unvalidated barcode.**
- **Never persist or upload an image** beyond the vision call that already happens.
