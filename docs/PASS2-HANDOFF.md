> ## ⛔ SUPERSEDED — read `docs/PASS3-HANDOFF.md` first
>
> Passes 1, 2 and 3 all shipped to `main` on 2026-07-31. This file is kept for the Pass 2
> rulings it records (the `do`-line bar, the summary-line standard, the raw/sourcing
> principle, the named-group asymmetry) — those are still in force. Everything about STATE
> in here is stale: the migration has run, the card component is built, the skim tests
> exist, and the screenshots were taken.

# Counter overhaul — Pass 2 handoff

Written 2026-07-31, end of session. Assumes zero conversation history: everything
needed to resume cold is in this file or named by it.

The work is a three-pass counter overhaul. **Pass 1 (visual system) is complete.
Pass 2 (counter card restructure) is stopped at its review gate.** Pass 3 (live answers
for unmatched queries, `POST /counter/ask`) has not been started.

---

## 1. Where we are

### Branch and commit state

All work is on **`pass2-counter-overhaul`**, committed, **not pushed**.

`main` is production and a push to it auto-deploys in about a minute
(GitHub-connected Vercel project, no staging gate). Pass 1 is a complete visual
overhaul of every surface a shopper sees. **Do not merge to `main` until the visual
change is a deliberate release**, not a side effect of syncing a branch.

### What ran, and what it said

| check | command | result |
| --- | --- | --- |
| server tests | `cd server && npm test` | **326 pass, 0 fail** |
| client build | `cd client && npx vite build` | **clean** |
| migration dry run | `cd server && node scripts/migrateCounterCards.js --dry-run` | **80 cards, every authored sentence placed, 0 blocking, 2 flagged** |
| render check | CDP at a true 390px viewport | Pass 1 verified — one `--action` fill per tab, no gold surfaces, no horizontal overflow |

### What did NOT run

- **The migration has never been run in write mode.** Only `--dry-run`.
- **The card component split has not been built.** `PerimeterAnswer.jsx` still renders
  the OLD shape (decision → why → 3-item checklist → tap for depth). Nothing in the
  client reads `counter_cards` yet.
- ~~**The skim tests do not exist**~~ — they exist (`client/test/skim.mjs`), and Amendment 4's
  ≤3-line clause is **WITHDRAWN**. See "The summary-line standard" below. (Original text:
  ≤3 rendered summary lines at 390px,
  headline ≤12 words, do ≤14 words + first token a verb, exactly one tier badge, no
  checklist in summary state).
- **The six representative screenshots have not been taken.**

### Migration status against the live database

Verified read-only against the live Supabase in `server/.env` on **2026-07-31**:

| table | status |
| --- | --- |
| `scanned_products` | **present** |
| `counter_cards` | **ABSENT** — `supabase/counter_cards.sql` has never been applied |
| `counter_gaps` | **ABSENT** — still outstanding from before this work |
| `push_tokens` | **ABSENT** — still outstanding from before this work |

So: apply `supabase/counter_cards.sql` before the first write-mode migration run.
Code degrades gracefully without it; the dry run needs no database at all.

### Files this work touched

**New**
- `supabase/counter_cards.sql` — the table
- `server/lib/counterCards.js` — projection, coverage accounting, row mapping, review parser
- `server/scripts/migrateCounterCards.js` — idempotent upsert, blocks on unplaced content
- `docs/do-lines-review.md` — **the review sheet, and the migration's source for `do` lines**
- `docs/PASS2-HANDOFF.md` — this file

**Modified**
- `server/kristy_perimeter_kb.json` — source of record. Headline trims, the raw rewrite,
  4 new entries, 1 merged away, 26 authored `watch_out` arrays
- `server/lib/perimeter.js` — one shortcut repointed after the merge
- `server/lib/perimeter.test.js` — the raw-milk guardrail replaced by four tests
- `server/lib/privacyLine.test.js` — `counter_cards` added to the aggregate-pool rules
- `VOICE_SPEC.md` — the raw/sourcing global principle, above the per-card rules
- Pass 1: `client/src/lib/tokens.js`, `client/src/index.css`, `client/app.html`, every
  component, both KBs (typographic punctuation), `mobile/src/theme/*`

---

## 2. Open rulings

### CLOSED — do not relitigate

**The lactose clause is dropped permanently.** The sentence "…and people who can't touch
conventional milk often do fine on it" is **not** to be restored to the `raw_milk` card
in any form. It implies raw milk resolves a condition, which collides with the
no-treatment rule and with the `NO entry anywhere in the KB claims a health outcome`
test that runs on every suite.

**Ruling 6 (Label terms `watch_out`) is DONE — status was unreported, and it should
have been.** All **19** `label_terms` entries carry a hand-authored `watch_out` array,
each a compression of that entry's own `labels_decoded` / `buying_tips` — no new
research. Seven more entries were authored beyond the 19 (`raw_milk`,
`nuts_raw_vs_roasted`, `honey_adulteration`, `raw_kefir`, `clabber`, `raw_aged_cheese`,
`sprouts_raw`), for **26 authored total**.

The heuristic derivation was deliberately **not** widened. It stays conservative:
tips whose authored wording states a trap, plus `labels_decoded` entries whose own
meaning is a debunk. A misfiring heuristic that files "do this" under "watch out"
inverts the advice, which is worse than an empty block. **~35 non-label cards still have
an empty `watch_out`. That is Pass 5 work and is not a bug.**

### APPROVED, NOT YET APPLIED

**Ruling-4 treatment for `egg_feed_claims` and `label_cold_pressed_expeller` —
approved, with STANDING AUTHORIZATION for the pattern.** Whenever the printed word a
shopper looks for sits in the headline, it forces every honest `do` line to restate it.
Move the observable down: headline carries the verdict only, `do` carries the physical
act. **No further per-slug approval is needed — apply this wherever the pattern appears.**

Proposed pairs are in the bottom table of `docs/do-lines-review.md`:

| slug | proposed headline (verdict only) | proposed do (the physical act) |
| --- | --- | --- |
| `egg_feed_claims` | Space and feed are two different claims. | Look for "soy-free" or "corn-free" printed on the carton. |
| `label_cold_pressed_expeller` | Two ways to get oil out. Only one is mechanical. | Read for a process word. No process word means solvent-extracted. |

Applying a headline means editing `decision` in `server/kristy_perimeter_kb.json`, then
regenerating the review sheet.

### OPEN — must be done before the migration runs

**`grassfed_butter` — redraft the `do` line on carotene colour.** Current line
("Take unsalted if you cook with it — you control the salt yourself.") is a real shelf
action but it is about salt, not about what makes grass-fed butter grass-fed. The
observable is the colour: spring butter from pastured cows is nearly orange, and that
is carotene from grass. Redraft against that. Stay on the right side of the line —
colour is an observable fact about the butter, not a health claim about it.

**`beans_dried_vs_canned` — the `do` line contradicts its own verdict.** Headline says
"Dried when there is time. Canned and rinsed when there is not." The `do` line
("Take the can that says 'no salt added' — you salt it yourself.") sends the shopper to
the can, which is the verdict's *fallback*, not its call. A `do` line must serve **this
card's verdict**. Redraft toward the dried bag, or restructure the pair.

**Drift re-audit across the other eight redrafts.** Late in the session an overlap audit
caught seven restatements that an eyeball pass had missed, and those were redrafted
quickly. `beans_dried_vs_canned` was caught afterwards by review, not by me. Re-audit
all of them properly against the full bar — especially "serves THIS card's verdict",
which the mechanical overlap check does not test:

`flour_basics`, `oats_steelcut_rolled_instant`, `label_free_range`,
`judging_meat_at_the_case`, `yogurt_plain_vs_flavored`, `sprouts_raw`,
`label_no_added_hormones`, `label_organic_scope`.

**Phrasing duplication sweep across all 80 `do` lines.** Many open with the same few
verbs and the same construction ("Read the X for 'Y' — Z"). Eighty cards that all sound
identical read as generated even when each line is individually correct. Sweep for
repeated openings and repeated sentence shapes, and vary them. This has not been done at
all.

---

## 3. The bars, in full

### A `do` line passes when ALL of these hold

1. **It names something observable in the store** — a word printed on a label, a colour,
   a number, a physical location, or a specific product.
2. **≤14 words.**
3. **Imperative, first token is a verb.**
4. **It does not restate the headline.** The headline is the verdict; the `do` is the
   physical act. If they say the same thing, the card wastes its most valuable line.
5. **It serves THIS card's verdict.** A line that sends the shopper toward the verdict's
   fallback, or toward a neighbouring card's subject, fails even if 1–4 all hold.

The real test behind all five: **could someone holding a cart act on this line alone,
without reading anything else on the card?**

Passes: "Spend the organic money on berries, greens, and apples." · "Read the first
ingredient — it must say 'whole wheat flour.'" · "Buy the frozen wild sockeye, not the
fresh farmed." · "Check for a harvest date on the back. No date, no buy."

Fails: "Choose high-quality options when possible." (unobservable) · "Consider the
tradeoffs between the two." (not a verb-action) · "Look for better ingredients."
(names nothing) · "Organic is generally the better choice here." (restates headline)

**A `home` card holds the same bar.** The observable is in the kitchen rather than the
aisle. It is not a lower standard.

### The summary-line standard — per element, and ≤3 total is WITHDRAWN

Amendment 4 asked for **≤3 rendered summary lines**. It was withdrawn on 2026-07-31: it
cannot coexist with the other two limits in the same spec, and measuring proved it rather
than arguing it. At 390px a 14-word `do` line at 14px Inter wraps to two lines on **all
80** cards, and a 12-word headline at 20px Playfair wraps to two on **72**. Eyebrow 1 +
headline 2 + do 2 = 5, and the floor is 4. Reaching 3 would take roughly a 6-word headline
and a 6-word `do` line — far under ≤12 and ≤14.

**The standard is per element**, enforced in `client/test/skim.mjs`:

| element | lines | why |
| --- | --- | --- |
| eyebrow | **≤1** | it is a label. Long KB titles ("Egg labels: cage-free, free-range, pasture-raised, organic") were taking three lines and pushing the `do` line off the screen. Clamped with an ellipsis in `CounterCard`. |
| headline | **≤2** | three means the verdict is too long to skim, and it is trimmable in the KB. Three cards hit this and were trimmed. |
| `do` | **≤2** | the floor for a 14-word imperative at this width. |
| summary total | **≤5** | the sum. A ceiling, not a target — it exists so a fourth element cannot join the summary without someone deciding to. |

**Do not reintroduce a total-line target below 5.** If a tighter summary is wanted, that is
a change to the word limits, not to the renderer.

### A headline passes when

1. **It states a verdict** — a call, not a description. A trim that leaves it
   descriptive rather than decisive must be flagged, not shipped.
2. **≤12 words.**
3. **It does not carry the observable.** If the printed word lives in the headline, the
   `do` line has nothing left to say. Move it down (standing authorization above).

The headline is the KB's `decision` field. Editing one means editing
`server/kristy_perimeter_kb.json`, not the review sheet.

### The raw / sourcing global principle

Full text is in `VOICE_SPEC.md`, above the per-card rules. It applies to every card and
to every generated `/counter/ask` answer in Pass 3. In short:

Kristy believes in raw food — raw dairy, raw honey, live ferments, raw cheese, raw nuts
and seeds, cold-pressed and unfiltered everything. Pasteurization, irradiation and
ultra-filtration are shelf-life technologies; they flatten the cultures, the enzymes and
the character on the way through.

**She does not ask "is raw safe." She asks who made it.** On any raw or unpasteurized
food the card is organized around sourcing — as the answer itself, not as a caveat
bolted to the end. Good raw is good. Anonymous raw is the only real problem. The `do`
line names the sourcing signal, never the risk.

**Never hedge a raw card's own recommendation.** No "consider the risks", no "some
people choose to", no "talk to your doctor before".

**"Raw" as a label term is often theater**, and knowing where sharpens the principle
rather than weakening it: US almonds sold as "raw" are pasteurized by law; most "raw"
cashews are steamed out of the shell; "raw" honey with no named producer is frequently
blended and filtered; "raw" on cheese means unpasteurized milk and, at US retail, aged
60+ days.

### The named-group asymmetry

Where a specific outcome is concentrated in a specific group, Kristy names that group
**once**, concretely, in `watch_out` — as the same practical insider detail as
everything else on the card, never as a general disclaimer. Good producers say these
themselves.

| subject | the group named |
| --- | --- |
| raw milk / raw dairy | pregnancy, under five, immunocompromised |
| raw honey | infants under twelve months |
| raw sprouts | pregnancy, immunocompromised |
| raw eggs, raw fish | pregnancy, immunocompromised |

Where no such group exists — raw nuts, raw ACV, raw kraut, cold-pressed oils —
**nothing is named. Do not add a line for symmetry.** An unnecessary caution is the same
failure as a missing one: it tells the reader Kristy is not discriminating.

The line appears **once per subject, on the primary card**. `raw_milk` carries it for
raw dairy; `raw_kefir`, `clabber` and `raw_aged_cheese` link to it rather than repeat
it. This is enforced by tests in `server/lib/perimeter.test.js`.

**Still off-limits, at any confidence:** no claim that any raw food cures, reverses or
treats a condition; no positioning raw anything as a substitute for medication or care;
no arguing that a documented risk is invented or regulatory theater. Kristy does not
litigate epidemiology, she buys from people she can name.

---

## 4. Decisions already locked

Do not reopen these.

- **`client/public/privacy.html` and `terms.html` are untouched, permanently.** The
  A2P 10DLC carrier sentence must sit on one unbroken source line and review is often
  automated against raw HTML. Editing them risks rejection code 805 for no benefit.
  They were deliberately excluded from the Pass 1 typographic sweep.
- **Batched to the END of Pass 3**, not before: `landing.html` retokenizing (it is a
  standalone static page with its own inline palette, so `/` and `/app` currently
  diverge); the `CLAUDE.md` rewrite (it still describes the OLD brand as locked); and
  **collapsing the token aliases so names match values** (`textSecondary` currently
  resolves to `--ink-muted`, `accentGold` to `--brass`, etc.).
- **The four extra `counter_cards` columns are approved as-is**: `detail`,
  `kristy_take`, `labels_decoded`, `sources`. They exist because Amendment 3
  (losslessness) and the spec's six expanded fields were in direct conflict — a
  perimeter entry is five fields deep. **Constraint: `detail` and `sources` never render
  in summary state. `sources` does not render anywhere yet — store it, do not surface it.**
- **The column is `do_line`, not `do`.** `DO` is a reserved keyword in Postgres. The card
  JSON the client renders still calls it `do`; `cardToRow` / `rowToCard` in
  `server/lib/counterCards.js` are the only place the two names meet.
- **`produce_in_season` is merged into `produce_seasonality` and deleted.** Aliases and
  five buying tips moved across; its `short_answer` + `detail` + `kristy_take` went into
  the destination's `detail`; one near-duplicate tip was dropped and reported. The
  section shortcut in `server/lib/perimeter.js` was repointed.
- **`sprouts_raw` was added deliberately.** The merge dropped Produce to 8 topics, below
  the `>= 9` depth bar in `server/lib/aisle.test.js`. Rather than weaken a real guardrail
  or invent filler, the card the new principle actually calls for was written — sprouts
  are on the named-group table.
- **`kind` is `'shelf' | 'home'`**, authored in a `HOME_CARDS` set in
  `server/lib/counterCards.js`, never detected. `washing_produce`, `egg_storage`,
  `produce_storage` are `home`. Home cards keep a `do` line and the same bar; the client
  gives them a distinct eyebrow treatment and **never** an add-to-cart. `cta_item` is
  suppressed structurally in the projection, not left to the renderer.
- **The KB remains the source of record.** `counter_cards` is a projection, re-derived on
  every migration run. Never hand-edit a `source = 'curated'` row; the next run
  overwrites it.

---

## 5. Next actions, in order

**1. Clear the review sheet.** Redraft `grassfed_butter` and `beans_dried_vs_canned`,
apply the ruling-4 pairs to `egg_feed_claims` and `label_cold_pressed_expeller`, re-audit
the eight redrafts against the full bar, and run the phrasing duplication sweep across
all 80 lines. Regenerate `docs/do-lines-review.md`.

> ### ⛔ STOP 1 — hand the review sheet back before anything is written.

**2. Apply the schema.** Run `supabase/counter_cards.sql` against the live Supabase.
Confirm with a real `select`, never a `head:true` count — PostgREST answers
204 / null / no-error for a table that does not exist, which reads as "present, empty".

**3. Run the migration.** `cd server && node scripts/migrateCounterCards.js`. It upserts
on `slug` and is safe to re-run. It refuses to write while any authored sentence is
unplaced or any `do` line is missing or over-length.

**4. Split the card component.** `PerimeterAnswer.jsx` → summary + expanded per the
Pass 2 spec. Summary is eyebrow · tier badge · headline · `do` · optional CTA ·
"The full read ↓" — **no deck paragraph, no checklist**. Expanded is `why` ·
`look_for[]` · `watch_out[]` · `tier_note`. The tier chip stays above the tap. Home cards
get the distinct eyebrow and no CTA. **Do not touch the section browse list** — it
already shows eyebrow + headline only, which is the right density.

**5. ✅ DONE — the skim tests.** `client/test/skim.mjs` renders every card at a true 390px
and asserts the standard below, plus: headline ≤12 words; `do` ≤14 words with a verb
first; exactly one tier badge; no checklist in summary state; the expanded block not
mounted before the tap; no home card offering an add-to-cart; nothing overflowing 390px.

**6. ✅ DONE — six representative cards** captured over CDP at 390px, one per section, each
in both states, covering a `home` card and cards with an empty `watch_out`.

**7. Remaining polish**, then Pass 3.

### Useful commands

```bash
cd server && npm test                                    # 326 tests
cd server && node scripts/migrateCounterCards.js --dry-run   # no DB needed
cd client && npx vite build
```

Verify mobile over CDP with `Emulation.setDeviceMetricsOverride`, never
`--window-size`: Chrome enforces a ~500px minimum window on Windows, so a 390px request
renders at 504 and crops, which looks exactly like horizontal overflow.
