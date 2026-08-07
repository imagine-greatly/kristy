# iOS spec — COUNTER

The half of the store with no barcode: meat, seafood, produce, dairy & eggs, bulk, and
what the words on a package are allowed to mean. This is the moat — a barcode reader is a
weekend build; a deep, sourced, honestly-tiered knowledge base for the counter is not.

Derived from `client/src/components/AisleMoment.jsx`, `CounterCard.jsx`, `CounterAsk.jsx`,
`CounterAnswer.jsx`, `CardTeaser.jsx`, `PerimeterAnswer.jsx`, `client/src/lib/perimeter.js`,
`cardMeter.js`, `readMeter.js`, and the server handlers in `server/routes/counter.js`,
`perimeter.js`, plus `server/lib/counterCards.js` and `counterAskPipeline.js`.

Conventions (base URL, bearer token, error envelope) are as stated in `cart.md` §0.

---

## 1. THE SHAPE OF THE SURFACE

Two ways in, and **asking leads**. A coach for the unlabeled store is one you can talk to;
browsing is how you explore it. So the ask sits at the top in a raised card of its own,
above the section list, and the same question typed anywhere else in the app reaches the
same sourced answer.

Three screens, each replacing the previous in a simple push/pop stack:

```
INDEX  ── open a section ──▶  SECTION  ── open a card ──▶  CARD
  │                                                          ▲
  └──────────── open a card via a shortcut ──────────────────┘
```

Plus one non-navigating surface: an **answer**, which renders inline under the ask on
whichever screen the ask is on.

**Everything on this surface is free.** No account, no model call for a browse, no cost.
Only the *personalized* read (this topic against this shopper's goal) is premium, and only
the *depth* of a card is metered — see §6.

---

## 2. INDEX SCREEN

Vertical order:

1. **The ask card** — a raised surface containing:
   - Title: **"Where the guidance comes from"** (19pt semibold, UI face — not the display
     face; it is a card heading, not a page title).
   - Sub: "Every note on your list came from here. Ask for whatever it did not cover."
   - The ask control (§5).

   The page title moved *into* this card. A separate "The counter" heading above the input
   pushed the input down to repeat the name of the tab the shopper just pressed.

   The card is a plain raised surface with the standard inset top edge — **not** a
   gold-tinted panel. As the first and largest thing on the surface a tint becomes the
   biggest gold area on the screen, which is the one thing gold is not for.

2. **"Start here"** section label, then the **eight essentials** as full cards (§4), each
   expandable in place. **Hidden entirely once an answer is on screen** — the shopper asked
   something specific, and eight other answers under it is noise at the moment they are
   reading.

3. **"Browse the counter"** section label, then one card per store section:
   - Section title (15.5pt bold)
   - Blurb (13pt muted)
   - "*N* topics" in the monospaced face
   - Below the header, the section's **shortcuts** as pill buttons — the questions people
     actually ask standing at that counter, each one tap from its answer.

4. **"Got a barcode? Scan it →"** — a quiet link out to the scan surface, when a handler
   exists.

### 2.1 The sections

Fixed, in walk order. Titles, blurbs and shortcuts come from `GET /api/counter/sections`;
they are listed here so a spec reader knows what to expect.

| id | title | blurb | thin note |
| --- | --- | --- | --- |
| `produce` | Produce | Where organic earns it, how to pick ripe, and what is in season now. | — |
| `meat` | Meat | Cuts, grades, ratios, and which labels on the case mean anything. | "Beef, chicken, pork and the deli case. Lamb, goat and game are not covered yet." |
| `seafood` | Seafood | Wild or farmed, mercury by fish, and how to tell fresh at the counter. | "Salmon, tuna, shrimp, sardines, the frozen case and the seals. Crab, lobster and the shellfish bar are not covered yet." |
| `eggs_dairy` | Dairy & Eggs | Which carton claims hold up, and real cheese from cheese product. | — |
| `bulk_pantry` | Pantry & Bulk | Rice, oats, flour, nuts, honey, and olive oil that is actually olive oil. | — |
| `label_terms` | Label terms | What the word on the front is allowed to mean. | — |

**A section that does not cover something says so.** Naming the gap is what makes the
covered part trustworthy.

### 2.2 Index loading and error states

The two loads are independent and fire together — the essentials shelf sits higher on the
page, so waiting on the browse index would leave the most-read part blank longest.

| slot | loading | error |
| --- | --- | --- |
| essentials | "Loading…" (13.5pt muted) | "The essentials did not load." |
| sections | "Loading…" | "The sections did not load. Try again." |

Neither failure blocks the other, and neither blocks the ask.

---

## 3. SECTION SCREEN

1. "‹ All sections" back control
2. Section title in the display italic face, 26pt
3. Blurb
4. Shortcut pills, when present — pinned above the list, not buried in it
5. The section's cards as **browse rows**
6. If the section cross-lists label cards: a "Label terms read here" group label, then
   those rows
7. The thin note, when present, in Kristy's voice with a gold left rule

### 3.1 A browse row

**Eyebrow + headline, and nothing else.**

- Eyebrow: the card's `eyebrow`, uppercase 11pt muted. If `kind == "home"`, prefix
  `"At home · "`.
- Headline: the card's `headline` in Kristy's voice at 15pt, primary color.

The row's job is to let a shopper choose which card to open; the do line belongs on the
card they chose, not on forty rows they skimmed past. The server sends only these fields
for browse rows, for the same reason.

---

## 4. THE CARD — the unit of the whole surface

One renderable shape for every answer, whether it was curated, retrieved or generated.

### 4.1 The card object

```json
{
  "slug": "egg_labels",
  "section": "eggs_dairy",
  "topic": "Egg labels: cage-free, free-range, pasture-raised, organic",
  "kind": "shelf",
  "eyebrow": "Egg labels",
  "headline": "Pasture-raised is the only carton claim with land behind it.",
  "do": "Read the carton for 'pasture-raised' and a certifier seal.",
  "tier": "established",
  "cta_item": "Pasture-raised eggs",
  "tier_note": "Established: this is settled science…",
  "essential": true,
  "essential_rank": 2,
  "aliases": ["egg labels", "cage free", "…"],
  "source": "curated",
  "use_count": 41,

  "why": "…",
  "look_for": ["…", "…"],
  "watch_out": ["…"],
  "detail": "…",
  "kristy_take": "…",
  "labels_decoded": [ { "term": "Cage-free", "meaning": "…" } ],
  "sources": ["…"]
}
```

**FREE, always, on every surface**: `slug`, `section`, `topic`, `kind`, `eyebrow`,
`headline`, `do`, `tier`, `cta_item`, **`tier_note`**, `essential`, `aliases`, `source`,
`use_count`.

**PAID — the seven depth fields**: `why`, `look_for`, `watch_out`, `detail`, `kristy_take`,
`labels_decoded`, `sources`.

**The withholding happens on the server.** A locked card arrives with those seven fields
**absent**, plus:

```json
{
  "locked": true,
  "teaser": {
    "look_for_first": "Check the carton for a certifier seal, not just the words.",
    "faded_lengths": [64, 71, 58],
    "remaining": { "look_for": 4, "watch_out": 2 }
  }
}
```

So there is nothing for the client to hide. A client that merely hides depth has already
received it.

### 4.2 Rendering a card — every branch

Summary, top to bottom. Nothing here is ever gated.

1. **Eyebrow.** Uppercase, muted, **clamped to one line with an ellipsis**, with the full
   text as the accessibility/hover label. Some titles are long ("Egg labels: cage-free,
   free-range, pasture-raised, organic") and wrapping them to three lines pushes the do
   line off a phone screen to say nothing new. A label that costs a third of the summary is
   not a label.
   - If `kind == "home"`: the text becomes `"At home · <eyebrow>"` and the style shifts
     (secondary color, italic, slightly wider tracking).
2. **NO TIER CHIP.** Do not render one. "Credible concern" once sat here, above a card
   about buying organic, naming a claim the card had not made — a classification rendered
   as furniture with nothing for the reader to attach it to. See §7.
3. **Headline** — Kristy's call, stated as fact, in her voice. 20pt (16.5pt in compact).
4. **Do line** — when `do` is non-empty. UI face, semibold, secondary color. The one thing
   a shopper can act on without reading anything else.
5. **Tier note** — when `tier_note` is present. UI face (this is a factual statement about
   evidence, not something she says), 12pt, solid muted. **Below the do line**, because
   decision-first is content and the order is the claim: the call, then how to act on it,
   then what kind of claim it was. A qualification reads as a qualification when it follows
   the thing it qualifies. Demoted by size, never opacity.
6. **Add to cart** — rendered only when **all** of: `kind != "home"` AND `cta_item` is set
   AND an add handler was supplied. Label `"Add to cart — <cta_item>"`; after tapping,
   `"In the cart — <cta_item>"` and disabled.
   - A `home` card **never** gets an add-to-cart. There is nothing at a shelf to add. The
     server also suppresses `cta_item` on home cards, so this is the second of two locks.
   - On the **list attachment** the handler is deliberately not supplied: the card is open
     because the item is already on the list.
7. **"The full read ↓"** — rendered only when the card **has depth to show**:
   `locked == true` OR any of `why`, `look_for`, `watch_out` is non-empty.
   - **`tier_note` does not count.** It is free and already on screen above; counting it
     would offer "The full read" on a card whose only remaining content the reader is
     already looking at.
   - Tapping toggles the expansion. **On the first open of a locked card, spend a read**
     (§6) before expanding.
   - Label flips to "Less ↑" when open.

**Expanded**, indented behind a thin gold left rule:

- If `locked` → the **teaser** (§4.3), and nothing else.
- Else, in order:
  - `why` as a paragraph, when present.
  - **"What to look for"** group label, then `look_for` as a list. Each item gets a small
    gold-tinted checkmark mark.
  - **"Watch out"** group label, then `watch_out` as a list. Each item gets a distinct
    neutral `!` mark. **A "watch out" filed under "look for" inverts the advice**, which is
    worse than an empty block — keep them visually separate.
  - **`tier_note` is NOT repeated here.** It moved to the summary; printing it twice would
    make the depth look padded with something the reader already had.

### 4.3 The teaser — GEOMETRY, NEVER WORDS

Tapping "The full read" past the meter must never show a blank or a padlock.

1. **"What to look for"** group label.
2. `teaser.look_for_first` rendered **in full and fully legible**. The hook is that this is
   the card's real first check.
3. Then one faded row per entry in `teaser.faded_lengths`. Each is drawn as a run of
   word-shaped blocks totalling that **true character length**, so the block wraps exactly
   where the real line wraps.
   - Segment the length into word-ish runs deterministically from the length itself, so the
     same card always fades the same way.
   - **The fade is applied to the GROUP, not per line.** Masking each line individually
     makes every row dissolve identically, which reads as a loading skeleton — the one
     thing this must not look like. A downward gradient over the whole block reads as text
     running past the edge of what you are allowed to see.
4. **The counts**, built from `teaser.remaining`: `"4 more checks, 2 traps."` — singular
   "check"/"trap" at 1, each clause omitted at 0, and the whole line omitted when both are
   0. Prefixed with a gold arrow.
5. **The offer**, and this branches on whether buying is possible:
   - **purchasable** → a gold-tinted tappable block: the upgrade headline in Kristy's
     voice, then the price line `"Kristy's full read — $44.99/year"`.
   - **not purchasable** (a signed-out shopper) → the same headline as **plain text**, no
     button, no price.

**Why the faded lines carry lengths and not text**: sending the actual withheld text would
leak a third of every card to an unpaid caller in the same change that stops leaking all
of it. A padlock says no; this says *look how much of this there is*.

### 4.4 The eight essentials

`organic_worth_it_by_type` · `egg_labels` · `salmon_wild_vs_farmed` ·
`label_front_vs_back` · `produce_ripeness_by_item` · `beef_grassfed_vs_grainfed` ·
`judging_meat_at_the_case` · `whole_vs_reduced_fat_milk`

**Always full, for everyone, and they never touch the meter.** They arrive with all seven
depth fields and no `locked` flag; the server decides that, and a client-side "is this
essential" check would be a second opinion about a server boundary.

They sit on the index before any navigation because a shopper who spends three free reads
on the shelf never reaches the counter and never learns the other seventy-three exist.
Free depth on the shelf proves the reads are worth having; the meter then proves BREADTH is
what the membership buys.

---

## 5. THE ASK

**One implementation, three placements**: the counter index, the home surface, and the
shop-mode overlay. **This is not about markup — it is about the meter.** Every full read
costs one of three, and a card opened from the aisle must cost exactly what the same card
costs from the couch. Two ask implementations that merely look alike are two meters, and
the day they diverge the gate copy becomes false on one of them, silently, because the
surface that drifted still looks right.

The only things that vary by placement are the **placeholder**, the **seeds**, and whether
the submit is filled or quiet. If a fourth placement needs more than that, the placements
are diverging.

### 5.1 Composition

- A single-line text field with a gold hairline border, plus a submit button.
  - Placeholder: `"Wild or farmed salmon?"` (index), `"Ask about anything in the store…"`
    (home), `"Ask about <section title, lowercased>…"` (shop mode).
  - Submit reads "Ask", or "…" while loading. Disabled when the field is empty or a request
    is in flight. The field itself is disabled while loading.
  - **Submit tone**: filled (bone) on the counter index and inside the shop overlay, where
    this *is* the screen's one filled action. **Quiet** (transparent, gold hairline) on
    home, where the hero already carries one.
- **Seeds** — pill buttons, shown only while no answer is on screen.
  - **A seed ASKS.** It fills the field *and* submits. Filling only made the shortcut two
    taps: the tap, then the same button they could have reached by typing.
  - Default set: "Wild or farmed salmon" · "Which cut for stew" · "What pasture-raised
    leaves out" · "Is organic worth it for berries".
  - Shop mode substitutes the per-section set (see `cart.md` §8.8).
  - Home passes **no seeds at all** — the hero owns the screen and three suggestion chips
    would compete with the walk shape directly above.
- The answer renders below (§5.3).

### 5.2 States

| state | renders |
| --- | --- |
| idle | field + seeds |
| loading | field (disabled) + a **skeleton in the card's shape** |
| done | field + the answer |
| error | field + "That did not go through. Try again." in Kristy's voice, muted |

**The loading state is a skeleton, not a spinner.** Generation can take seconds; a shopper
who can see the answer's outline forming is waiting for *something*, while a spinner is
waiting for nothing. Draw bars mirroring eyebrow / headline / headline-second-line / do /
do-second-line, inside a card-shaped raised surface, pulsing gently. Announce it politely
to assistive tech ("Reading the counter…"), and mark the region busy.

### 5.3 What an answer renders — four outcomes, one component

The shopper is **never told which machinery produced their answer.**

| outcome | detection | renders |
| --- | --- | --- |
| **out of scope / rate limited** | `out_of_scope == true` or a 429 was mapped | one line in Kristy's voice (`line`). Not an error state, not form validation, and never an explanation of the rule that produced it. |
| **miss** | no `card` | `line`, or `"No solid read on that one yet."` |
| **nearest** | `card` present AND `nearest == true` | the caveat line **first** (`line`, default "No solid read on that exact question yet. The closest one:"), then the card. Said **before** the card: a shopper who reads the card first and the caveat second has already taken it as the answer. |
| **card** | `card` present | the card |

Then, below the card:
- If `personal.answer` is present → a gold thread rule, then that paragraph in her voice
  at 17pt. This is the premium personalized read.
- If `gated == true` → a gold thread rule, then `upsell` in her voice, then an
  "Unlock the personalized read" button (only when purchasing is possible).

**A GENERATED CARD CARRIES NO AI STYLING** — no "generated by" badge, no disclaimer chrome,
no different border. Either a generated card clears the same bar a curated one does (the
same lint, the same claim lock, the same tier system) or it does not ship. A badge saying
"this one is machine-written" would be an admission that the bar is lower, and it would
teach shoppers to discount exactly the answers the corpus is growing from.

---

## 6. THE READ METER AND THE PAID BOUNDARY

### 6.1 The mechanic

**Three free full reads, then the ask.** One counter, one spend point.

- **Signed in** → metered server-side on the account. The client sends nothing and reads
  `spent` off the response.
- **Signed out** → metered locally, and the count **rides up on the request** so the server
  can answer honestly without keeping an identifier for a stranger.

**This is deliberate, not an oversight.** Metering a stranger server-side needs an
identifier, and the counter's privacy claim is that its free layer stores no personal data
— no user key, no IP, no session. An IP-keyed meter would break that to enforce a limit
that clearing storage defeats anyway, and behind a shared office or carrier address it
would spend one stranger's reads on another. The scrape surface that mattered was the bulk
card endpoint, and that is closed server-side.

The local counter must fail **open**: if storage is unavailable, read zero. Never wall
someone by accident.

**This is its own counter.** It is not the same pool as the free personalized verdict notes
on the scan path (see `scan.md` §6). Same number, same mechanic, same words, different
counter. Sharing one integer would spend the counter's depth on three scans and make the
gate copy false.

### 6.2 The one ask moment

**The upgrade ask appears at exactly one moment in the entire app: the fourth full-read
tap.** Not on open, not on a scan, not on an ask, not on a save, never a banner.

The checkable shape of the defect is *an upgrade affordance whose render condition contains
no action*. Tier alone is not a moment, because every non-member satisfies it on every
render — which is exactly what makes it a banner.

Chrome is excluded from this rule: a settings row, a sidebar entry, a header mark. Those
are destinations a shopper navigated to, not an interruption of a surface with a pitch
about the content on it.

### 6.3 The free surface states the call; the cost of the call lives in the depth

A card with a real tradeoff puts the verdict in the headline and what the verdict costs in
`watch_out`, which is paid. **That is the gate working, not a defect.** It looks like a
card hiding its own cost and it is not: the tier **sentence** is free and it is the honest
signal, saying whether the line above it is settled science, a credible concern or a
standard. A shopper who never pays still learns that a standard verdict is a preference.

**Do not "fix" this by promoting `watch_out` into the free layer.** That is the depth; it
is what the membership buys, and the eight essentials already exist to prove the depth is
worth having. If a specific card's cost is load-bearing enough to be free, the lever is
making that card an essential, not widening the boundary for all eighty-one.

### 6.4 Spending a read

On the first "The full read" tap of a **locked** card:

1. Call `GET /api/counter/cards/<slug>/full?spent=<local count>` (§7.5).
2. **402** → the meter is spent. **Fire the one upgrade moment** and leave the card locked.
   The teaser still reads, and the summary card is included in the 402 body.
3. **200 with `spent: true`** → increment the local counter (signed-out only) and swap the
   summary for the full card for the rest of the session.
4. **200 with `spent: false`** → an essential or a premium viewer. Swap in the full card,
   change no counter.
5. Any failure → leave it locked; the teaser still reads. Never surface an error here.

A card unlocked this session stays unlocked and must not be re-requested.

---

## 7. API

### 7.1 `GET /api/counter/sections` — public

**200**
```json
{
  "sections": [
    {
      "id": "produce",
      "title": "Produce",
      "blurb": "Where organic earns it, how to pick ripe, and what is in season now.",
      "thinNote": null,
      "shortcuts": [ { "q": "Is organic worth it?", "id": "organic_worth_it_by_type" } ],
      "cards": [ { "slug": "…", "eyebrow": "…", "headline": "…", "kind": "shelf", "tier": "established" } ],
      "labelCards": [ /* same browse-row shape */ ],
      "count": 14
    }
  ]
}
```
**500** `{ "error": "counter_unavailable" }`

`count` is the count of `cards` only, not including `labelCards`. Cache for the session:
the corpus changes on a deploy, not between two taps.

**Label cards cross-list.** A label card lives in `label_terms` and is *also* surfaced in
the section where it is actually read (a "no hormones" sticker is a meat-case question).
That is a browse-time lens, not a second home — it is what stops the corpus growing a
second, drifting index of itself.

### 7.2 `GET /api/counter/sections/:id` — optional auth

**200** `{ "id", "title", "thinNote", "shortcuts", "cards": [ /* FULL card objects, viewer-projected */ ] }`
**404** `{ "error": "not_found" }` · **500** `{ "error": "counter_unavailable" }`

Note the cards here are full card objects passed through the paid boundary, not browse
rows. The client renders them as browse rows anyway (§3.1).

### 7.3 `GET /api/counter/essentials` — optional auth

**200** `{ "cards": [ /* eight full cards, in authored order */ ], "count": 8 }`
**500** `{ "error": "counter_unavailable" }`

Always full for everyone. Cache for the session.

### 7.4 `GET /api/counter/cards/:slug` — optional auth

**200** — the card object, viewer-projected (locked + teaser for a free viewer).
**404** `{ "error": "not_found" }` · **500** `{ "error": "counter_unavailable" }`

Side effect: a browse open increments that card's use count. A card someone navigated three
taps to reach earned its place at least as much as one a matcher surfaced.

### 7.5 `GET /api/counter/cards/:slug/full?spent=N` — optional auth · **THE METERED ROUTE**

`spent` is the signed-out local count; ignored when a bearer token is present.

| response | body |
| --- | --- |
| **200** premium or essential | `{ "card": { /* full */ }, "spent": false, "premium": true }` |
| **200** a read was spent | `{ "card": { /* full */ }, "spent": true, "remaining": 1 }` |
| **402** the meter is spent | `{ "gated": true, "card": { /* the SUMMARY, locked + teaser */ }, "limit": 3 }` |
| **404** | `{ "error": "not_found" }` |
| **500** | `{ "error": "counter_unavailable" }` |

**A 402 comes back WITH the summary card, never empty — the gate is a teaser, not a wall.**

### 7.6 `GET /api/counter/summaries?slugs=a,b,c` — optional auth

**200** `{ "cards": { "<slug>": { /* viewer-projected card */ } } }` — keyed by slug; a slug
the server omits is a permanent absence. Cap 200 slugs. See `cart.md` §3.11 for the
fetch-and-cache policy.

**No use-count bump.** A card that rode along with a list render was not opened, and
counting it would make the number mean "appeared on screen".

### 7.7 `GET /api/counter/cards` — optional auth

**200** `{ "cards": [ /* the whole corpus, viewer-projected */ ], "count": 82 }`

This is the scrape surface, which is why it goes through the paid boundary. Not needed by
the app in normal operation.

### 7.8 `POST /api/counter/ask` — optional auth · **the single ask route**

**Request**
```json
{
  "query": "wild or farmed salmon",
  "goal": "high-protein shopping",
  "focuses": ["lower_sodium"],
  "hardLines": ["no seed oils"],
  "constraints": ["budget"]
}
```
`question` is accepted as an alias for `query`. `nonNegotiables` is accepted as an alias
for `hardLines`. The preference fields are optional and only affect the premium
personalization branch.

**200 — out of scope**
```json
{ "out_of_scope": true, "reason": "<machine code>", "line": "<one line in her voice>" }
```

**200 — a card**
```json
{
  "card": { /* card object, viewer-projected */ },
  "source": "curated",
  "matched": true,
  "score": 7
}
```
`source` is `"curated"` or `"generated"`; a generated hit may also carry `retrieved: true`
or `generated: true` and `attempts`. **The shopper is not the audience for any of those
fields** — do not render them or style on them.

**200 — nearest**
```json
{ "card": {…}, "source": "curated", "matched": false, "nearest": true, "line": "No solid read on that one yet.", "reason": "<code>" }
```

**200 — miss**
```json
{ "card": null, "matched": false, "line": "No solid read on that one yet.", "reason": "<code>" }
```

**200 — gated personalization** (the card matched curated entries, viewer is not premium)
```json
{ "card": {…}, "source": "curated", "matched": true, "score": 7, "gated": true,
  "upsell": "The read for your cart is the member part: this counter against your goal, your week, with the better pick landing on the list." }
```

**200 — personalized** (premium)
```json
{ "card": {…}, "source": "curated", "matched": true, "score": 7,
  "personal": { "answer": "…", "refinement": "Wild-caught salmon" } }
```

**400** `{ "error": "query is required" }`
**429** `{ "error": true, "message": "Too many questions at once. Try again shortly." }` —
map this to the out-of-scope render path: one line, in voice, no error chrome.
**500** `{ "error": "counter_unavailable" }`

Notes:
- **Asking is free and unlimited, generation included.** A generated card persists and
  answers every future asker for free, so it is corpus investment rather than a per-user
  benefit.
- **A generated card is never personalized.** It has no matched KB entries behind it, so
  there is nothing for the claim lock to hold. Expect no `gated`/`personal` on those.
- Anonymous callers are capped at 40 asks/hour per IP — the counter's own bucket, not the
  shared guest budget.

### 7.9 The older `/perimeter` family

A parallel API over the same knowledge, used by the chat reference card and the
"read this against your cart" affordance. Keep it available; do not build new surfaces on
it.

| route | auth | notes |
| --- | --- | --- |
| `GET /api/perimeter` | public | `{ "topics": [ { id, title, category, question } ] }` |
| `GET /api/perimeter/sections` | public | `{ "sections": [ { id, title, blurb, topics, labelTopics, shortcuts, count, thinNote } ] }` |
| `GET /api/perimeter/sections/:id` | public | one section, or **404** `{ "error": "not_found" }` |
| `GET /api/perimeter/:id` | public | one public entry (below), or **404** |
| `POST /api/perimeter/ask` | optional auth | see below |

**A public entry**
```json
{
  "id": "salmon_wild_vs_farmed",
  "title": "Wild vs. farmed salmon",
  "category": "seafood",
  "question": "Wild or farmed?",
  "decision": "Buy wild when the budget allows.",
  "why": "…",
  "short_answer": "…",
  "detail": "…",
  "evidence_tier": "kristys_standard",
  "evidence_framing": "<the KB's own sentence for that tier>",
  "kristy_take": "…",
  "buying_tips": ["…"],
  "labels_decoded": [ { "term": "…", "meaning": "…" } ],
  "sources": ["…"],
  "cart_pick": "Wild-caught salmon"
}
```

**`POST /api/perimeter/ask`** request:
```json
{ "question": "wild or farmed", "goal": "", "focuses": [], "hardLines": [], "constraints": [] }
```
Responses:
```json
{ "matched": false, "entries": [], "answer": "No solid answer on that one yet. Better said than guessed.", "refinement": null, "gated": false }
{ "matched": true, "entries": [ /* public entries */ ], "answer": null, "refinement": null, "gated": true, "upsell": "…" }
{ "matched": true, "entries": [ … ], "answer": "<personalized>", "refinement": "Wild-caught salmon", "gated": false }
{ "matched": true, "entries": [ … ], "answer": null, "refinement": null, "gated": false, "error": true, "message": "That read didn't come together just now. Give it a second and ask again." }
```
**400** `{ "error": "question is required" }` · **429** `{ "error": true, "message": "Too many questions at once. Try again shortly." }`

### 7.10 Rendering a perimeter entry (the reference card)

Used inline in a chat bubble and under "Read this against your cart". Order:

1. Topic title as a small uppercase muted **overline** — it labels what is being answered;
   the decision under it is the answer.
2. **`decision`** in Kristy's voice, 20pt (16.5pt compact). If an entry predates the
   inversion and has no `decision`, fall back to `short_answer` as plain body text rather
   than rendering an empty card.
3. **`why`** — one line, UI face, secondary. This is the whole teaching mechanism of the
   surface.
4. **`evidence_framing`** — the tier, as a sentence, 12pt muted. **No chip, no bold tier
   word prefix.** The sentence already says which kind of claim it is; a bold label is the
   chip growing back inside a paragraph.
5. **Add to cart — `cart_pick`**, when set and a handler exists. Gold-outlined, not
   gold-filled: it is the entry's action, not the loudest thing on a screen that is mostly
   guidance.
6. **"What to look for"** — the first **3** `buying_tips`, as a checklist.
7. **"The full read ↓"** — rendered when any of `short_answer`, `detail`, the remaining
   tips, or `labels_decoded` exists. Expanding shows: `short_answer`, `detail`, the
   remaining tips, the decoded labels (term + meaning pairs), `kristy_take` in her voice,
   and `"Sources: a · b · c"`.
   - **`evidence_framing` is not repeated** in the expansion.
   - Expansion state is **per entry**, so opening one does not unfold the rest.

---

## 8. THE PERSONALIZED READ

Offered only when there is a profile to read against — i.e. the shopper has at least one
of: a goal, a focus, a hard line, a constraint. **No profile → no offer**, rather than a
button that promises a tailored read and returns the universal one.

On a card screen, below the card: a quiet outlined button **"Read this against your cart"**.
Tapping calls `POST /api/perimeter/ask` with the topic as the question plus the shopper's
preferences, and renders the result **with the entries suppressed** (the card is already on
screen above it) — so only her read, or the gate, appears.

States: "Reading…" while in flight; "That read did not come together. Try again." on
failure.

---

## 9. VOICE AND CLAIM RULES ON THIS SURFACE

These are enforced server-side and in the corpus, but the client must not undo them.

- **The claim lock.** Every health or ingredient claim traces to a matched knowledge-base
  entry. Render what the server sends. **Never compose a claim from parts** — no
  client-side string that says something about a food the server did not say.
- **Zero first person.** No "I/me/my". Kristy's spoken text is the voice face; all
  factual/UI/ingredient text is the UI face. Never substitute one for the other.
- **The tier is a sentence, not a chip.** A reader must always know whether a claim is
  settled science, a credible concern, or a standard. Corpus distribution as measured:
  established 49 · kristys_standard 24 · time_tested 5 · credible_concern 3 — the
  objected-to label was on three cards. **Do not restore a tier badge to "make the tier
  scannable"**: a bare tier word is precisely what has no referent.
- **No price, ever**, and no price *label* — never the words "cheap" or "expensive".
  Budget means cost-conscious *selection*. Relative terms only.
- **No negative claims about named brands.** Teach the label truth instead.
- **Nothing food-related is treated as medical.** No food treats, manages, cures, prevents,
  lowers the risk of — or *causes* — a disease. Anything medical defers to a doctor.

Tier ids and their labels, where a label is ever needed:
`established` → "Established" · `credible_concern` → "Credible concern" ·
`kristys_standard` → "Kristy's standard" · `time_tested` → "Time-tested".

---

## 10. SCOPE — the one direction it has ever been wrong

Scope is decided server-side. The client sends the question exactly as typed and renders
whatever comes back. It is documented here because it shapes what the surface must
tolerate.

**Scope has been too tight, never too loose — four corrections, all the same direction:**
requiring a known food noun and rejecting "how do I pick a good cantaloupe"; landing "is
bagged salad safe" as off-topic; rejecting a bare either/or ("wild or farmed") while the
Counter's own placeholder read "Wild or farmed salmon?"; and rejecting seven of twelve
"what is X" queries over words the knowledge base itself teaches.

**A wrongly-admitted question costs one discarded model call. A wrongly-refused one tells a
shopper their question does not belong, on the surface built to win them.**

Client consequences:
- Do **not** pre-validate a question. Do not require a question mark, a food noun, or a
  verb. Send it.
- Do **not** render an out-of-scope response as an error, a form validation, or a
  retry prompt. It is one line in her voice and nothing else.
