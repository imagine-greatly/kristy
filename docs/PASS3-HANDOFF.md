# Counter overhaul — Pass 3 handoff

Written 2026-07-31, updated 2026-08-01 after the voice recalibration. Assumes zero
conversation history: everything needed to resume cold is in this file or named by it.
Supersedes `PASS2-HANDOFF.md`, which is kept only for the Pass 2 rulings it records.

**Passes 1, 2 and 3 are SHIPPED and live on `main`, and so is the voice recalibration.**
The next thing that happens is Devon using the Counter in a store. Nothing below is
blocked on code.

---

## 1. What is live

| | |
| --- | --- |
| Web | `kristyapproved.com` — Vercel, GitHub-connected, a push to `main` deploys in about a minute. `kristyapproved.vercel.app` is a secondary alias serving the same build; **CLAUDE.md called it production for months and it is not** |
| API | `kristy-server-production.up.railway.app` — Railway project **`happy-enchantment`**, service `kristy-server`, Root Directory `server/` |
| Corpus | `counter_cards`, 82 rows: 81 curated + 1 generated |
| Tests | `cd server && npm test` → **483**, plus six browser suites (§8.7) |

> The `kristy-api.up.railway.app` URL in older docs is **dead**. Do not trust it.

### The Counter, end to end

**The index** is ask-first: the ask bar is the hero and the first thing on the surface,
eight **essentials** render beneath it as cards in summary state that expand in place, and
the section browse sits below the fold. The old order — title, thesis, six section cards —
put every answer three taps away through an undifferentiated list at each level, which is a
couch interaction occupying the position the store interaction should hold.

**`POST /api/counter/ask`** is the single ask route. The bar and the seed chips both land
there. Pipeline, in cost order so nothing is spent before the free checks run:

```
scope (regex, free) → retrieve curated (memory, free) → retrieve generated (DB, on miss)
  → generate (Sonnet) → lint + claim lock → persist → log to counter_gaps
```

**Generation is free for everyone, including strangers.** A generated card persists and
answers every future asker for free, so it is corpus investment rather than a per-user
benefit — and the coverage gaps that matter surface on the free acquisition surface by
definition. **Personalization stays premium** and shares the existing `free_notes_used`
pool; no second mechanic was invented.

Budget: **5 generations/hour per IP**, **10/hour per authed user**, **50/day globally**.
A slot is spent when the model is CALLED, not when a card persists — otherwise a query that
reliably trips lint is an unbounded spend loop. The global ceiling is **derived from
`counter_cards`** (`source='generated' and created_at >= today`) rather than held in memory,
because an in-memory daily counter resets on every deploy. It fails closed to curated-only.

---

## 2. Decisions that are load-bearing

Do not reopen these without reading the reasoning.

- **Generation uses its own model.** `COUNTER_GEN_MODEL`, defaulting to Sonnet, separate
  from the app-wide `MODEL` (Haiku). Every other call in Kristy rephrases content it was
  handed under a claim lock; this one MINTS a headline, a do line, look_for, watch_out and
  the aliases that make the card findable — then persists it for everyone. The cost of a
  weak generation is not one bad reply, it compounds.
- **The input-side claim lock cannot apply to a generated card**, because generation is
  what happens when the KB has nothing. Three output-side gates carry it instead: the same
  `lintCard` the 79 curated cards clear, a wider `claimLockViolations` (no treatment claims
  in either direction, no detox, no dosing, no restriction, no safety reassurance about a
  real foodborne risk, no price, no first person), and **one retry with the violations fed
  back**. A second failure is DISCARDED, never softened — softening a claim keeps its shape
  and only removes the words that made it auditable.
- **Retrieval is two-stage and caches nothing.** Curated cards score from memory; generated
  cards are queried only on a curated miss. Reload-on-persist was the tempting alternative
  and the trap: a second instance never learns about the new card and regenerates it.
- **Generated retrieval fires on ONE alias hit** (score ≥ 2), a lower bar than the curated
  ceiling (> 3). A generated card carries six aliases authored for one subject, so exactly
  one lands and it scores 2 — held to the curated bar, the card written for that question
  could never answer it. The costs are not symmetric: a loose retrieval shows a related
  card, a strict one bills for a duplicate.
- **Aliases must be one-to-three-word subject phrases**, and lint fails a card without them
  or with one over four words. The matcher looks for each alias as a run of words INSIDE a
  question; a sentence-shaped alias ("how to tell if a cantaloupe is ripe") never matches
  anything, which is how the first generated card regenerated on every ask.
- **`essential` is membership, `essential_rank` is order**, and the order is its own
  editorial decision. Membership is authored in `counterCards.js` beside `HOME_CARDS` and
  projected onto the row, so it lives in version control where it can be diffed rather than
  in a dashboard UPDATE. **Neither derives from `use_count`** — a popularity sort would fill
  the most valuable space on the surface with whatever happened to be asked most last week.
- **`use_count` counts browse opens as well as ask retrievals**, but NOT an essentials
  render. Bumping eight cards on every index load would make the number meaningless.
- **The Counter is fully usable signed out**, verified with real pointer clicks. The gate
  mounts only in `GuestApp` and only when an action calls `invite()` or `save()`; browsing,
  opening a card, expanding it and asking never raise it. This matters because SMS is still
  down pending 10DLC verification at Twilio, so a signed-out visitor could not clear a gate
  even if one appeared. Provider is Twilio via Supabase's built-in phone integration; the
  old Bird hook was deleted 2026-08-02.
- **`query_seed` keeps the shopper's wording**, scrubbed of identity but not normalized.
  It is the Pass 5 authoring signal; `normalizeQuestion` would flatten the part worth
  reading. Preserving a sentence is not the same as preserving a person.
- **A fold is a removal AND a delete, in one operation.** `migrateCounterCards.js` upserts
  on slug and never removes, so an entry deleted from the KB leaves its row alive in
  `counter_cards` — still retrievable, still matching on its own aliases, and no longer
  editable, because the file it was projected from is gone. Retirement is declared in
  `RETIRED` (`counterCards.js`) and the migration deletes those rows in the same run,
  scoped to `source = 'curated'`. The folded card's aliases must move onto its absorber and
  any section `shortcut` must be repointed — folding `grassfed_vs_grassfinished` broke the
  meat section's "Grass-fed or grass-finished?" shortcut, and only a test caught it, which
  is why the retirement test now checks shortcuts too.
- **A card must answer the question it is named for.** `grassfed_butter` briefly shipped a
  headline about butter versus spreads while hedging grass-fed in `watch_out`. If the
  strongest thing a card has to say is not its subject, that is a signal the subject needs
  its own verdict — not that the headline should drift to the easier question.

---

## 3. The copy pass

Kristy states things. She does not build to a rhythm. Four tics were named and swept out of
every non-card string and out of card fields:

1. **The antithesis snapclip** — a phrase, then the same phrase inverted for weight. The
   test is INFORMATION, not shape: "Whole grain. 'Multigrain' is a headcount, not a
   standard" keeps its second half because it says something. "The half of the store with no
   label. The half that matters most" does not.
2. **"Not X, but Y"** where X is a strawman nobody proposed.
3. **Abstract nouns as subjects** — food does not live anywhere.
4. **Manufactured profundity** — if deleting it loses no information, delete it.

The upsell was duplicated across **three** route files in two different wordings; it is one
imported `COUNTER_UPSELL` now.

**Copy hygiene is enforced by lint:** American spellings and typographic punctuation across
every readable field. A generated card shipped saying "rind colour", and the scan that
followed found 27 more fields across 20 CURATED entries — five of them in tier notes
written the same week. The raw batch was authored after the Pass 1 sweep and missed it.

### Two lint checks were built and deleted

Both are recorded because the reasoning matters more than the code:

- **"X, not Y" where X appears nowhere else** flagged **45% of the corpus**. "X, not Y" is
  the load-bearing shape of a corpus whose job is correcting beliefs — "flagged as a
  standard, not as settled science", "'Multigrain' is a headcount, not a standard".
  Separating a strawman from a contrast the reader needs requires knowing whether anyone
  holds the belief, and that is not in the text.
- **Abstract subject + animate verb** — a noun list narrow enough to be quiet catches
  nothing real, and one wide enough to catch something is noisier than the tic.

The surviving check (`antithesisChime`) is **report-only** and flags 1 card in 82.

### A field that inherits escapes an audit scoped to fields

The copy pass audited card *fields* and missed `label_front_vs_back`'s title — "The front
sells, the back tells" — because the card's eyebrow **inherits** from the KB `title`. KB
titles render as copy in four places: the card eyebrow, the browse rows,
`PerimeterAnswer`'s topic overline, and the public `/api/perimeter` index.

Auditing all 80 titles afterwards found **that one tic and nothing else**. The lesson is
the mechanism, not a backlog: when auditing copy, follow what each field FEEDS, not just
what it is.

`eyebrow_short` overrides the eyebrow where an entry authors one — set on the eight
essentials, where the KB title is written to name a topic in a list rather than to sit
beside a tier badge in a 184px slot. Four of the eight clipped before it.

---

## 3b. The voice recalibration (2026-08-01)

Kristy was not firm enough, and the defect was structural rather than tonal: **the hedge
was living in the headline.**

```
"Wild if it is in reach. Farmed or nothing, buy the farmed."
"Grass-fed when the price is fair. Otherwise regular beef."
"Worth it if the budget stretches. Otherwise the plain carton."
```

Each is two verdicts where the second cancels the first, so Kristy negotiates with herself
before the shopper has asked. **Four of the eight essentials had it.**

**THE RULE — one verdict per headline.** The headline states the standard undiluted. The
fallback moves to `look_for` or `watch_out`, where it reads as practical rather than as a
retreat. The `do` line serves the standard, not the fallback. **19 headlines were
rewritten**, along with the bodies written neutrally underneath them.

Firmness is a position, not aggression: Kristy may say a thing is not worth buying and
that the industrial version is a different food. She does not moralize at the person
holding it. The fallback is given plainly, with no lecture attached.

### A two-clause headline is not the defect

This is the whole difficulty of the check. Four headlines split by TYPE or USE CASE and are
correct — "Organic on thin-skinned produce. Conventional on anything peeled", "80/20 for
burgers. 90/10 for anything you drain". Those are **discrimination**: the standard genuinely
differs by what is in your hand. Banning two clauses would delete them along with the
hedges.

So the test is **what the second clause is conditioned on**. A condition about the FOOD is
discrimination. A condition about the SHOPPER'S CIRCUMSTANCES — their budget, what the store
happens to stock, how much time they have — is the retreat.

### Accuracy outranks firmness

Firmer must never mean looser with facts. **If a claim needs a false mechanism to sound
convincing, the claim is wrong.** Two standing rules, both of them true things that a
firmer voice reaches for and gets wrong:

- **Farmed salmon omega-3 is always a RATIO claim, never an amount.** Farmed salmon is
  fatter, so a serving often carries as much total omega-3 as wild **or more**. The gap is
  omega-3 to omega-6, driven by a ration built largely on plant protein and vegetable oil.
  "Less omega-3" is false.
- **Antibiotics in aquaculture are always framed by country of origin.** Norwegian farming
  runs close to zero on the back of vaccination; other producing countries run far higher.
  A flat "full of antibiotics" is false for the best producers and unfalsifiable for the
  rest.

**Growth hormones in farmed salmon are banned outright** — they are not used in commercial
salmon farming anywhere. The corpus never carried the claim; the rule exists so a rewrite
or a generated card cannot introduce it.

The accurate case against farmed salmon is strong unaided and is now written on the card:
a feed-driven fat profile with a far worse ratio, astaxanthin in the ration because the
flesh is otherwise gray, sea lice and the treatments used against them, antibiotic use that
varies by country, and a fish that never swam anywhere.

### The first card where Kristy's standard points AWAY from the less-processed option

`rice_arsenic` carries `kristys_standard` and its verdict is "White over brown. White
basmati over plain white." Every other card wearing that tier points at the whole food.
This one is correct anyway, and the reason is the basis: **the tier is carrying a
contaminant-load judgment, not a processing judgment.** Arsenic concentrates in the bran,
the bran is what brown rice keeps, and two testing programs measure the gap at about half
again (Consumer Reports 113 ppb against 72, HBBF 129 against 86). Where the objection is
contaminant rather than refinement, the whole-food heuristic has nothing to say and the
measurement leads.

That makes the tier's own rubric — "the whole-food standard leads here" — read against the
card, which is why `tier_note` is authored to carry the weight instead: "Buying white
anyway is a standard, not a finding, and nothing here says brown rice harms anyone." Do not
"fix" the tier by moving it to `established`. The arsenic differential is established; the
instruction *therefore buy white* is a call, and the chip has to say which one it is.

The trade is stated rather than hidden, in `watch_out`, with the numbers at one serving
size: brown at 42 mg magnesium a half-cup, white at 10, cooked spinach at 78. A first draft
compared a **cup** of brown rice (84 mg) against an ounce of almonds (80) and read as
parity — the comparison argued against the position it was there to support. Compare at
equal servings, and compare the GAP the switch actually costs, not the food's total.

### When the headline and the do line collide, move the DO LINE

`OBSERVABLE_IN_BOTH` fires when both carry the same distinctive term, and the reflex is to
reword the headline — which is backwards. A verdict rewritten to satisfy a lint rule
reliably comes out weaker. `chicken_cuts_basics` lost "Boneless skinless is the priciest
form of the same bird" — the actual buying insight — for "Dark meat is the hardest thing to
overcook", a superlative reached for to clear the check and a *cooking* claim on a
*shopping* card. The collision was real; the fix was to move the action to a different
observable and keep the verdict.

### Three lint rules, and the one that was deleted

All in `counterCardLint.js`, so they run over curated and generated cards alike — the
corpus test sweeps all 79 curated cards through `lintCard`.

- **`headlineHedge` — GATING.** Catches four shapes: the outright fallback
  (`otherwise`/`unless`/"or nothing, buy"), the conditional on circumstances, the question
  frame ("Paying grass-fed prices?"), and the retreat with no keyword at all ("Buy the one
  the household actually drinks"). Measured across all 82 at the time: **9 hits, all true,
  zero false positives.** It spares the four type/use-case splits, and it spares the two
  original false positives — `produce_storage`'s temporal "when" and
  `fish_freshness_at_counter`'s descriptive "or nothing".
- **`falseMechanisms` — GATING.** The three accuracy rules above. The antibiotics one is a
  **required-context** check rather than a banned phrase: naming antibiotics on a
  farmed-fish card without country framing fails, because the defect is what the sentence
  omits.
- **`contradictions` — REPORT ONLY.** Built after a do line claimed "the only whole-life
  claim on the case" while `look_for` on the same card named two such seals. The card
  contradicted itself one tap apart, every existing check passed, and nothing would have
  caught it. Measured: **5 cards flagged, 2 real** — a second live instance of the same
  false exclusivity, plus `label_cold_pressed_expeller`, whose headline said "Only one is
  mechanical" while its own body explains that expeller-pressed AND cold-pressed both are.
  Three false positives, all "nothing else" meaning *no other ingredients*.
  **Narrowing to proper nouns only was tried and rejected** — zero hits, both real finds
  lost, because a card enumerates its instances as quoted label terms as often as it names
  certifiers.

**A count check was built and DELETED.** "A number in the verdict contradicted by a list
elsewhere" produced **13 hits and not one was real**: "30 ounces", "two months", "three
things", "both sides of the carton". Every one compares a count of something in the WORLD
against the length of a list on the CARD, which is a category error the shape cannot escape.
Same failure as the two checks dropped earlier in Pass 3, dropped on the same standard.

### The fold

`grassfed_vs_grassfinished` was folded into `beef_grassfed_vs_grainfed`, which now states
grass-fed AND grass-finished as one standard with the organic grain-finished floor as the
exception in `watch_out`. Three cards covered one label; `label_grass_fed_term` survives for
the Label terms section. See the fold rule in §2 — the delete is a migration step.

---

## 4. How things get verified now

**Real pointer clicks, never dispatched.** If an overlay intercepts a click, that is a
finding to report, not something to work around. Earlier runs dispatched clicks straight to
the element, which bypasses overlay interception entirely — so they proved a code path ran
and proved nothing about whether a person could tap it. Any claim about what a shopper can
tap must be established the way a shopper would tap it.

**Measure, do not judge.** The gold audit was run against computed styles and contradicted
the brief on three of four points: the Ask button is `--action` bone and always was, the
chips and counts are `--ink-muted`, and the only gold on the Counter is the wordmark, the
active tab and a 25px² thread dot. Bone reading as pale gold against near-black green is
the token working.

**Schema: what the code writes must exist in the migrations.** `schemaContract.test.js`
checks every key `cardToRow` emits against the columns declared in `supabase/*.sql`, plus a
sweep over inline insert/update literals. `docs/SCHEMA-AUDIT.md` compares LIVE against the
FILE and is therefore blind to a column missing from both — which is exactly how
`counter_cards.aliases` shipped, silently stopping the corpus from growing while the global
ceiling (which counts persisted rows) never engaged. Three schema misses have now shipped
and all three were found by breakage; this is the check that would have caught the third at
commit time.

**Never put a data write in a schema file.** `schemaSafety.test.js` fails any
`supabase/*.sql` outside `backfill_trials.sql` that contains an insert/update/delete outside
a function body. The trial backfill used to sit in `schema.sql` and fired on every re-run.

**THE DEPLOY BOUNDARY IS `server/`, AND IT IS NOW A TEST.** Railway's Root Directory is
`server/`, so anything the runtime reads from outside it exists on a laptop and is missing
on the box — silently, forever, with no error.

It shipped exactly that way. Both `counterCards.js` and `counterAskPipeline.js` loaded the
reviewed `do` lines from `docs/do-lines-review.md` through a try/catch that fell back to an
empty Map, so **every curated card served by `/api/counter/ask` carried an empty do line in
production**, for as long as those lines have existed. The do line is the field the card
exists to carry and asking is the lead interaction on the Counter. Browse was unaffected
because it reads the persisted row.

The enabling condition is worth more than the bug: the catch block was annotated *"a
thinner fallback rather than a broken one."* Someone had considered the failure and written
down a conclusion, the conclusion was wrong, and because it was written down it read as
settled. **Pre-labeling a degraded state acceptable is what stops anyone checking it.**

- The lines now live in **`server/lib/doLines.json`**, generated by
  `scripts/buildDoLines.js`. The markdown stays the authored source; the JSON is a build
  product inside the boundary. Neither import has a fallback — a missing file fails at boot.
- **`doLines.test.js`** fails if the JSON and the markdown disagree, if an authored entry
  has no line, if a retired slug still has one, or if either consumer goes back to reading
  `docs/`. **Edit the table, re-run the build script, commit both.**
- **`deployBoundary.test.js`** resolves the path literals in `lib/`, `routes/` and
  `index.js` — import specifiers, `new URL(rel, import.meta.url)`, `join(__dirname, …)` —
  and fails on any that escape `server/`. `scripts/` is exempt by name because the migration
  and the livetests are dev tools run from a full checkout; a second assertion pins the
  directory layout so a new runtime directory cannot slip past the walk. Verified by
  planting an escape and watching it fail with the offending file named.

An audit of the other five load-time file reads found no second instance. The four healthy
ones (`verdictEngine`, `hardLines`, `perimeter`, `education`) share a shape worth copying:
**no try/catch at all.** They throw at import, which for a file the engine cannot work
without is the only honest behaviour.

Useful commands:

```bash
cd server && npm test                                  # 420
cd server && node scripts/buildDoLines.js              # after editing docs/do-lines-review.md
cd server && node scripts/migrateCounterCards.js       # re-project the 79 curated cards
cd client && npx vite build
cd client && node test/skim.mjs                        # 390px, needs the API on :3001
cd client && node test/shots.mjs                       # six representative cards
```

---

## 5. What is left

Nothing blocks the store test. In rough order of value:

- **The batched Pass 1 cleanup, still outstanding.**
  - `client/public/landing.html` onto the token system. It is a standalone static page with
    its own inline palette, so `/` and `/app` currently diverge.
  - **`CLAUDE.md`'s brand section still describes the OLD palette** as locked. It is wrong
    today and it is the file that survives a `/clear`, so it is the highest-leverage fix
    here.
  - **Collapse the token aliases so names match values.** `textSecondary` resolves to
    `--ink-muted`, `accentGold` to `--brass`. A name that lies is worse than a long name.
  - **Delete the `pass2-counter-overhaul` branch.** It is fully merged into `main`.
- **24 cards still render an empty `watch_out`.** Pass 5 authoring, not a bug — a misfiring
  heuristic that files "do this" under "watch out" inverts the advice. Down from ~41 → 32 →
  24: the voice recalibration authored one on every card whose headline gave up a fallback
  (`watch_out` is where a relocated fallback lands), and the 2026-08-02 overlap sweep
  authored more while merging.
- **AUTHORING GAP: there is no general cooking-oil card.** `"which oil for cooking"` is the
  one query in the 17-query recall set that still returns nothing, and lowering the
  retrieval gate cannot fix it — the corpus genuinely has no entry. What exists is
  `olive_oil_grades` (buying real EVOO), `rancidity_check` (has it turned) and
  `label_cold_pressed_expeller` (the process words). None of them answers "what do I cook
  with", which is a question every shopper has and the seed-oil objection makes load-bearing.
  A card here needs the heat/smoke-point discrimination without a health claim in either
  direction, and it is a whole-food-standard call, not a finding.
- **AUTHORING QUEUE FROM THE LIST SURFACE (2026-08-02).** The Phase 1 match probe ran a
  realistic 30-item list through `scoreEntries` and named four gaps. Three of the seven
  misses were alias gaps and were fixed in the same pass (`tomatoes`/`tomato` onto
  `produce_ripeness_by_item`, tree-nut species onto `nuts_raw_vs_roasted`,
  `cheddar`/`mozzarella` onto `cheese_real_vs_processed`), taking the measured rate 71% →
  83% with zero false positives. These four are real authoring and are queued, not forced:
  - **`bacon`** — deliberately NOT aliased onto `deli_meat_uncured`. That card answers the
    *uncured* question (the celery-powder asterisk) and that is half an answer for someone
    who wrote "bacon" on a list. **A half-right card is worse than an honest miss**, because
    the miss is logged and the half-right one is not.
  - **`bananas`** — `produce_ripeness_by_item` lists eleven items and bananas is not one.
  - **`spinach`** and **`romaine`** — the hub covers "Leafy greens: perky rather than limp"
    in `look_for`, but its do line is "smell the stem end on anything that ripens after
    picking" and greens never ripen. Aliasing them to the hub would hand a shopper buying
    spinach an instruction about smelling stem ends. **Same orphan boundary as the
    cantaloupe fix** — a qualifier is a boundary, and this is what falls outside it.
- **`counter_gaps` is the authoring backlog** and it is capturing now. `gapFeed` ranks it by
  frequency. That data, plus `use_count`, is the evidence for what to author next — and the
  reason "recently viewed" was skipped rather than built: it competes for the space the
  essentials just claimed, its value is highest across sessions (the weakest case in a
  store), and the honest version needs either localStorage or per-user storage that collides
  with the Counter's no-person claim. Revisit when the data says people re-open cards.
- **`push_tokens` is the one unapplied migration**, deferred with Expo push.
- **Pass 3's `/counter/ask` has no client entry point outside the Counter.** The docked
  composer on other surfaces still routes through chat.

---

## 6. Traps

- **Do not re-run `supabase/schema.sql` against the live project.** Its closing backfill
  grants a 7-day trial to every existing auth user, and `ensureTrial` is idempotent BY
  EXISTENCE — any subscription row at all means the user can never be granted a trial
  again. `counter_gaps.sql` and `backfill_trials.sql` were extracted for this reason.
- **The Vercel MCP integration cannot see this project** (`list_projects` returns empty)
  even though `get_deployment` works with an explicit id. Get deploy status from
  `gh api repos/imagine-greatly/kristy/commits/<sha>/status` — it carries both checks.
- **Anything the server reads from outside `server/` is missing in production**, and it
  fails silently rather than loudly. `deployBoundary.test.js` is the fence; see §4. This is
  also why a green local test run proves nothing about a path — the laptop has the whole
  repo and the box does not.
- **Verify a live surface the way a bug would be found: hit production.** The empty do
  lines passed every local test, two reviews and a full lint suite, and were found by
  curling `/api/counter/ask` after a deploy. A card claim is not verified until the
  endpoint returns it.
- **PowerShell hangs in this environment.** Use Bash.
- **Verify mobile over CDP**, never `--window-size`: Chrome enforces a ~500px minimum window
  on Windows, so a 390px request renders at 504 and crops.

---

## 7. The list surface — 2026-08-03

Four defects reported off a live 390px render of a **composed** cart. Three were symptoms
of one root cause, and the root cause was in the VERIFICATION rather than in the code.

### 7.1 A mock is not a render, and everything downstream inherited its blind spot

`phase2-density.html` — the Phase 2 "for approval" mock — was **hand-authored HTML**. 526
lines with the brand tokens pasted in as CSS variables. It never mounted `CartMoment`.

What it was built FROM is what mattered: twelve **bare nouns** (Blueberries, Pineapple,
Ground beef, Olive oil), taken from the Phase 1 probe, which invented them. The mock
contains **zero occurrences of the string "why"**. `cartHarness.jsx` was then written from
the mock with the same twelve nouns and no `why`, and `cart.mjs` measured the harness.

Four artifacts agreeing with each other and none agreeing with the product, where **all 51
PICKS carry a `why`** and 22 carry an authored `perimeterId`. Every matched row shipped
rendering the PICK's `why` AND the card's do line — two prose lines where the mock showed
one — and nothing in the chain could see it, because nothing in the chain ever held a `why`.

> **A FOR-APPROVAL MOCK RENDERS THE REAL COMPONENT OR IT IS NOT EVIDENCE.** Hand-built HTML
> shows what someone intends, which is worth having — but it must be labelled as intent and
> may never become the basis of a fixture. Same failure as the stale demo mirrors: a
> hand-maintained copy of a surface drifts from the surface, and the copy is what gets
> checked.

### 7.2 One prose line per row

A matched row is **name + eyebrow + do line**; the PICK's `why` is suppressed. The `why`
sells the item to someone who already wrote it down; the do line tells them how to buy it
at the shelf, and only the second does work in a store. An **unmatched** row keeps its
`why` — it is the only prose it has.

Suppression keys on the block's `hasCard`, **not** on `item.cardSlug`: the attachment
renders only once its summary arrives, so keying on the slug would blank the prose for the
length of that fetch and leave the row empty if it failed.

### 7.3 The matcher

- **AN AUTHORED `perimeterId` OUTRANKS RETRIEVAL** (`cardForItem`). A PICK names its entry
  deliberately and claim-locked; retrieval guesses at a string. Retrieval had overridden
  **6 of 22** authored ids and lost a 7th — **27% wrong** on the only rows where a ground
  truth exists. The authored id is still validated: retired, `home` or non-aisle falls
  through to retrieval rather than attaching something the corpus no longer stands behind.
- **A STATE WORD IS A SUBJECT** (`stateContradicts`). `fish_freshness_at_counter` genuinely
  carries the bare alias `tuna`; `beans_dried_vs_canned` genuinely carries `beans`. Both
  cleared the alias floor honestly — the card was about a different STATE of the same food,
  which no score can express. Fires only when **both** the item and the card name a state,
  which is what stops it refusing "Raw or dry-roasted almonds" (`nuts_raw_vs_roasted` names
  none). It is a **veto, never a score**: it cannot make the list and the ask disagree about
  which card is best, only make the list decline one the ask would serve. Explicit list,
  widened deliberately, in the spirit of `IMPERATIVE_VERBS`.
- **A LABEL CARD IS NOT AN AISLE CARD.** `label_terms` is a reference section — 18 entries —
  and `LIST_SECTIONS` omits it on purpose ("nobody walks to it"). But the matcher did not
  know that, so `label_pasture_raised_feed` (8) beat `egg_labels` (6) on "Pasture-raised
  eggs": the row carried a card, showed no trailing label *because* it had one, and sat in
  "Everything else" anyway. Falls through like a home card — same category error, same
  treatment.
- **A BARE PROCESS WORD IS NOT A SUBJECT EITHER.** `raw_milk` carried the alias
  `unpasteurized`, which matched "Unpasteurized miso" and would equally match unpasteurized
  juice, cheese or sauerkraut. Removed; `unpasteurized milk` and `raw milk` remain and all
  three of the card's `asked_as` phrasings say "raw milk". Same defect as `meat any good` on
  `judging_meat_at_the_case`. `label_natural` and `label_organic_scope` still carry bare
  `natural` / `organic`, which is correct on the ASK path and now unreachable from a list.
- **A ROW SORTS BY THE SECTION IT DISPLAYS.** Sorting read `cardSection` (only set on a
  match); the label read the cart `category` (always set). "Baby spinach" sorted to the
  trailing group wearing the word Produce, three times on one twelve-item list.
  `CATEGORY_SECTION` translates only the cart categories naming the SAME aisle a walk
  section names, and always outputs a counter section id, so the counter's vocabulary still
  wins. `TRAILING_LABEL` additionally refuses to emit any `LIST_SECTIONS` title, so a label
  is structurally incapable of naming a section again. A stored `cardSection` still beats
  the fallback, or a refiled corpus would stop moving rows where it files them.

### 7.4 When a pick's card and its `why` disagree, the `why` moves

`canned_fish` pointed at `mercury_by_fish`, whose do line is *"Check the species name on the
case tag"* — a fish-**counter** instruction on a can, the same location error as the ice
line, one notch quieter. Retargeted to `canned_fish_choosing`, and the `why` rewritten to
match the card rather than the card kept to match the `why`:

> *Packed in olive oil or water, never "vegetable oil" — and skipjack is the lighter tin on
> mercury.*

It leads with the pack medium, that card's actual verdict, and keeps the skipjack tell that
justifies naming the pick skipjack. The claim still traces — `canned_fish_choosing`'s own
buying tips carry the skipjack/albacore line.

**`sardines` deliberately stays on `mercury_by_fish`.** `list.test.js` pins it with a stated
reason (small fish sit lower on the chain), which is a claim about the FISH rather than
about the tin.

### 7.5 Two save controls came back, because a selector is not a rule

`gate.mjs` greps `[data-save-list]` on the authenticated cart. It saw neither of the two
shipped afterwards: **"Save this cart"** in the guest header, and **"Keep it"** under "Save
your cart" — a permanent BANNER above the guest list whenever a cart existed, which is the
shape the money rule names outright (*"not on a save, never a banner"*). `cartFree.test.js`
now greps what a **shopper reads** across all of `client/src`, because a button can drop an
attribute, change class or move component and still say the same wrong thing to the same
person. The guest sign-in path stays — a guest genuinely has no account — but loses the word
"Save", which promises persistence while phone sign-in is blocked on 10DLC.

### 7.6 The chain itself, rebuilt

- **`client/test/buildFixture.mjs` is the one place a browser fixture comes from** — the
  shipping `attachCards` over the shipping `PICKS`. Both `cart.mjs` and `composed.mjs`
  regenerate before every run, so a fixture cannot drift from the matcher.
- **`cart.mjs` derives its expectations from its fixture** — row count, attachment count,
  collapse slug, tap target — instead of writing them down beside it. Hardcoding is how a
  fixture and its assertions drift *together* into agreeing about a shape the product cannot
  emit. It throws rather than passing vacuously if the fixture loses its collapse or matches
  nothing. The tap target must also be an *unchecked* matched row, or the false-to-true
  toggle assertion is untestable.
- **`cart.mjs` asks whether the surface WORKS** (tap targets, collapse, real pointer clicks,
  first-paint state); **`composed.mjs` asks what it COSTS** (line boxes, page height) and
  holds the two honesty rules with no other home.
- **`server/scripts/listMatchProbe.js` replaces the Phase 1 probe.** That one reported
  71%-to-83% with zero false positives, and both numbers were true of what it asked — it
  asked the wrong thing twice: its only failure class was "matched something that should
  have matched nothing" (an item landing on the WRONG card counted as a **success**), and
  its input was bare nouns it invented. The replacement measures correctness against the
  authored id and against food-word overlap, and **exits non-zero on a wrong match**. A miss
  reports and does not fail: coverage is the `counter_gaps` backlog's job, a wrong do line is
  nobody's. **Verified it can fail** by simulating the pre-fix matcher — it names all six
  defects and exits 1.

### 7.7 Measured, 390px, the same twelve before and after

| | before | after |
|---|---|---|
| lines per matched row | 8.22 | **6.10** |
| cost of a match vs unmatched | +4.56 | **+2.60** |
| page height | 2290px | **2002px** |
| sections | 6, incl. "Everything else" x4 | **5, no trailing group** |
| wrong attachments over 51 PICKS | 6 of 32 | **0 of 31** |
| against authored ground truth | 16/22 | **22/22** |

Verified on production after deploy: `canned skipjack tuna` reaches `canned_fish_choosing`
with the pack-medium do line; `unpasteurized miso` no longer reaches `raw_milk`; `is raw
milk safe` and `unpasteurized milk` still do, so the alias removal cost no coverage.

### 7.8 Left alone, deliberately

**Composed PICK names stay composed.** 12 of 51 carry an " or " / " and " / em-dash shape.
Measured at 390px, **none of them wraps** — what wrapped was the `why` beneath, now
suppressed on matched rows. `canonicalItem` splits on the em-dash and strips a qualifier
list to drive blend dedup; `listBaseline` keys `kept` frequency on the NAME, so renaming
resets every stored shopping profile; `applyCompose` protects rows by name-in-instruction
matching. Resetting all of that to fix wrapping that does not happen is a bad trade. The
matching harm is handled by the guards in 7.3.

### 7.9 Commit scope — the trips feature shipped a day late, under a title saying it had

`3267c95 The list becomes the trip, and the whole list is free` landed the list matcher and
**not** the trips feature. `server/lib/trips.js`, `server/routes/trips.js`, `trips.test.js`
and the loop harness stayed **untracked**, while `server/index.js`, `routes/list.js` and
`routes/haul.js` imported them. `main` was not broken — HEAD carried no trips references at
all — but the feature was absent from it for a day, and every local check was green because
every local check runs against the working tree, which had the files.

They landed with the list-surface fixes in `a3a9d24`, which is not where they belonged.

**`node server/scripts/commitGuard.js` before any commit that claims a feature.** It resolves
import specifiers and path literals for real — so `trips.js` the module is caught and the
word "trips" in a comment is not — and exits 1 naming the exact `git add`.
`commitScope.test.js` runs the same logic over the tracked tree in `npm test`, because a
guard nobody remembers to invoke is a guard that catches the case nobody remembered.

This is the **same family as the vacuous-assertion rule**: both are *the check passed because
it could not see the thing*. `nonEmpty` binds at the collection; this binds at the commit.

> `GUARDED` says where an untracked file is a problem. **It must never also decide what gets
> READ.** Conflating the two exempted `server/index.js` — outside every guarded prefix, and
> the file that mounts every route — from the first draft of this guard, which therefore
> missed the exact import that caused the incident. Sources are every tracked code file, the
> same distinction `deployBoundary.test.js` makes when it scans `lib/`, `routes/` AND
> `index.js`.

---

## 8. Two states and one loop — 2026-08-03

Shipped in `b8dff0a`. The cart stopped being a tab and became the centre of a **planning
surface**; a new full-screen **mode** carries the list through the store.

### 8.1 The model

**BEFORE THE STORE — the dashboard.** Plan: build the list, seed from last week, ask, look
things up. Unhurried, two hands, at home.

**IN THE STORE — shop mode.** One thing on screen, walking with you. Full viewport, entered
deliberately from the dashboard hero, exited deliberately.

Everything else is a tool you branch to from one of those two and come back from.

### 8.2 The navigation, and what did NOT change

Tab one is **Home**, not Cart. The cart is not a destination beside the others — it is what
the dashboard is built around.

**The bar survived, deliberately.** The Counter is the moat and has no other permanent entry
point; demoting it from a fixed bar to a card on a scrolling surface is a real
discoverability loss for the one thing a scanner app cannot copy. The Scan/Counter equality
argument survives the move because `FillRow` asserts it on the home surface in
byte-identical treatment — which is why it is its own module, imported twice, never copied.

`initialMoment` still returns one value with no condition in it (`home`). Shop mode never
hijacks boot: the mid-trip hero **is** the resume, one deliberate tap, and it names the aisle
it returns to.

### 8.3 The dashboard's five states

Resolved from `cart.progress` and `cart.seedable`; no new stored concept.

| state | hero says | action |
| --- | --- | --- |
| `empty` | What are you getting this week? | *(the field is the action)* |
| `completed` | Same as last week? | Start from those N items |
| `ready` | The list is ready. | **Start shopping** |
| `midtrip` | Produce — 4 of 7 | **Resume shopping** |
| `finished` | Trip done. | Finish the trip |

**THERE ARE FIVE, NOT FOUR, AND THE FIFTH NEARLY SHIPPED AS A BUG.** A trip with every box
ticked is not "mid-trip" and its answer is not RESUME, it is FINISH. Folded in, a shopper who
had just walked their whole list would have been told to resume it.

`CartHeader` was extracted from `CartMoment` and then **deleted**. That sequence is correct
rather than churn: splitting it is what made the seam measurable, and rendering the
composition showed the hero does not *relocate* it but *supersedes* it — title, standing and
completion door all move up. `[data-complete-trip]` and `[data-seed-last]` now live on hero
actions, which is why `loop.mjs` drives the Dashboard.

### 8.4 Shop mode

- **The type inverts.** The DO LINE leads at 17.5px; the item name demotes to an 11.5px
  eyebrow. The cart has those at 15px/13.5px the other way round. An **unmatched** row keeps
  its name in the lead slot — the inversion is a claim that the do line is more useful, not a
  house style. One prose line per row is inherited from the cart, not relaxed.
- **A spent instruction is demoted by SIZE, never opacity.** First draft: 11.5px at 50%,
  which measures **2.90:1** where WCAG needs 4.5:1 — a shopper who checked something by
  mistake could not read back what they had dismissed. 13px at full `textMuted` is 7.84:1.
  Transparency removes contrast from exactly the people who need it and still looks fine to
  whoever shipped it.
- **Advancing is free scroll**, and the active section is **the one filling the most screen**
  — not "the last section whose top crossed the viewport top", which a *collapsed* section
  breaks: once produce is done it is 66px tall, so a shopper well into meat had the header
  naming a section entirely off screen. The collapse and the header rule were each right
  alone and wrong together.
- **Two tap targets at opposite edges.** Check is 56px hard left (the 44px floor is a seated
  minimum; this is pressed while pushing a trolley), card-open is 44px hard right, 256px
  apart, and the large text between them is **inert**.
- A finished section collapses to one line, still in place, one tap from reopening.

### 8.5 THE OVERLAY PATTERN — the thing that decides whether it gets used twice

**Every branch out of shop mode is an overlay. It is never unmounted, so "return to the same
section and scroll position" needs no restoration code — there is nothing to restore.**

This leaked **twice**:

1. the Ask branch button wired to `setMoment('aisle')`;
2. one layer down, `ScanSheet`'s own Ask → `askAboutScan` → `setMoment('chat')`, invisible
   because the sheet looks identical on every surface.

The chat ask is withheld in shop mode on its own merits too: chat is the deep-input surface
for "the messy input taps cannot express", and a shopper holding a product with a verdict on
screen does not want a thread. The counter ask is one tap away on the branch bar.

`cartFree.test.js` forbids `setMoment` anywhere inside `ShopMode.jsx`, so this class cannot
return a third time. Shop mode also moved to `zIndex: 45` — it was **60, tied** with
`ScanSheet`, `UpgradeSheet`, `GoalSwitcher` and `CoachOnboarding`, staying underneath only by
JSX source order.

**A scan in shop mode acts on the list in front of the shopper**: resolving to a row already
there offers "Check off [row]", anything else joins the current section. `rowMatch.js` is
deliberately conservative — every content word of the row must appear in the product, a
disagreeing state word (frozen/canned/dried/fresh) on both sides vetoes, and an ambiguous tie
is **no match**. A miss costs one extra row; a wrong tick marks something never bought, and
the list is a record that seeds next week and feeds the shopping profile.

### 8.6 ONE ASK, ONE METER — and it had already drifted

`CounterAsk` renders on the Counter index, the dashboard, and the shop-mode overlay.
`useCardMeter` is the only thing that spends a read.

**The meter was already two copies.** `AisleMoment` and `CartMoment` each carried their own
`unlocked` map and `requestFull` — same call, same counter — agreeing only because somebody
kept them agreeing, *under a comment in `CartMoment` warning about exactly that risk*. The
overlay would have been the third. A card opened in an aisle must cost exactly what the same
card costs from the couch, or the gate copy is false on one surface and nobody finds out.

`cartFree.test.js` fails if any file outside `CounterAsk` calls `askCounter`, or any file
outside `cardMeter` calls `fetchCounterFull` / `spendRead` / `readsSpent`, or if any of the
three surfaces stops rendering `CounterAsk`.

**The premium `Nudge` is removed** — the third upgrade ask on the cart, after the list-save
button and the guest banner. It rendered whenever `premium === false` and the cart had rows:
on open, as a banner, above the shopper's own list, every load. It carried no
`[data-save-list]`, said nothing about saving, and was not in `GuestApp`, so every existing
check missed it. **The checkable shape is an upgrade affordance whose render condition
contains no ACTION** — tier alone is not a moment, because every non-member satisfies it on
every render.

### 8.7 The wake lock

Shop mode only. Held while mounted, released on exit and on unmount.

**THE RE-ACQUIRE IS THE FEATURE.** The browser releases the lock whenever the document hides,
so acquire-once code passes every test written for it and then dies at the first
notification — permanently, for the rest of the walk. `shop.mjs` **hides and restores the
document for real** and asserts a NEW sentinel; it was verified to fail on acquire-once code
before being trusted.

Headless Chromium has the real API and rejects every request (no screen), which splits the
verification honestly: the real API tests the degrade path, and a spec-faithful stub — one
that **models the platform's release-on-hide**, since a stub without it would pass the very
bug this catches — tests re-acquisition.

Support, verified 2026-08-03: iOS/iPadOS Safari **16.4+**, Chrome 85+, Firefox 126+, Samsung
14+, ~93% global. **Installed iOS PWAs were broken below 18.4** and `client/public/manifest.json`
exists, so that is a live case: it degrades to a no-op, and no NoSleep.js video hack. Every
rejection is silent — a shopper who cannot get a wake lock is not helped by being told about
a browser API mid-aisle.

### 8.8 The browser suites

Six now. All must pass; `cart`/`composed`/`gate` need the API on `:3001`, `gate` also the
client dev server on `:5174`.

| | asks |
| --- | --- |
| `cart.mjs` | does the list surface WORK — targets, collapse, real pointer clicks |
| `composed.mjs` | what it COSTS — line boxes, page height, the two honesty rules |
| `loop.mjs` | build → check → complete → seed, through the Dashboard |
| `gate.mjs` | the monetization gate, signed out |
| `dash.mjs` | five dashboard states **in the real app frame**, hero rule, one-bone-action |
| `shop.mjs` | shop-mode geometry, WCAG contrast off rendered colour, the collapse mid-scroll, the wake lock, return-to-position broken four ways |

> **`vite build` COMPILES A DEAD REFERENCE HAPPILY.** Moving the ask out of `AisleMoment`
> left a dangling `ask` reference behind — a live `ReferenceError` that took the **whole
> Counter surface** down, through a clean build. Only `gate.mjs`, which drives the real
> surface, caught it. A green build is not a rendered surface.

### 8.9 Found by rendering, not by reasoning

Every one of these passed review, passed the build, and was invisible until a browser drew it:

- the spent-instruction demote measured 2.90:1 (§8.4)
- `finished` had **zero** bone-filled actions and `completed` had **two** — one is an
  absence, the other is two components each correct alone
- the hero copy repeated **verbatim** below itself in the `empty` state, which is what turned
  "wrap CartMoment in a dashboard" into "split it"
- a collapsed section broke the sticky header (§8.4)
- the dangling `ask` reference (§8.8)
- shop mode tied at `zIndex: 60` (§8.5)

---

## 9. Still open

### 9.1 `antithesisChime` does not catch its own docstring example

The rule's own worked example — **"The half of the store with no label. The half that matters
most."** — passes the check written to catch it. No test pins it.

```
"…no label. The half that matters most."         -> []      (clean)
"…no label. The half that matters."              -> CHIME
"…no label. The half that matters most of all."  -> []      (clean)
```

The cause is the `fresh.length <= 1` threshold in `counterCardLint.js`: the canonical
instance has exactly **two** fresh words, and padding to three evades it again.

**The fix, and the order it must be done in:** raise the threshold (`<= 2`), pin BOTH the
canonical sentence and the "most of all" variant as tests, then **re-run the lint over all 82
cards and report the new hits before acting on them**. It is a rhetorical-shape rule, which
is weaker footing than anything else in that file — the same reason `copulaAbstraction` is
report-only. **If the fix is noisy, say so and leave it**; a noisy failure blocks authoring,
and this rule has never blocked a real defect.

Note the deck copy it was written about is gone anyway: the Counter now opens with
*"Where the guidance comes from / Every note on your list came from here. Ask for whatever it
did not cover."*

### 9.2 THE CORS GAP IN THE DISCIPLINE — nothing catches this class

`deployBoundary.test.js` catches a path that exists on a laptop and not on the box.
**Nothing catches an env var that makes the deployed client unable to reach the deployed
server.** Every suite passes because they run against `localhost:3001`, where `CLIENT_ORIGIN`
defaults to the right value.

It surfaced by accident: driving the live surface after a push showed every API call from
`kristyapproved.vercel.app` blocked by CORS. The product was fine — `kristyapproved.com` is
the canonical domain and was correctly allowlisted — but **CLAUDE.md named the alias as
production**, so the documented URL to verify against was the one that could not work. A doc
error that reads exactly like a broken deploy, and the conclusion drawn from it ("production
CORS is broken") was wrong.

Both origins are allowlisted now (2026-08-03), on Railway `happy-enchantment` / `kristy-server`:

```
CLIENT_ORIGIN=https://kristyapproved.com,https://kristyapproved.vercel.app
```

Verified after the redeploy: both return their own `access-control-allow-origin`, an unknown
origin still gets none (it is an allowlist, not a wildcard), and both domains render the
dashboard at 390px with zero CORS errors.

**What is still missing is the CHECK.** A post-deploy smoke test would have to hit the live
API with the live web origin and assert the header comes back — which needs both deployed, so
it cannot be a unit test. It is the only defect class here with no tripwire at all.

### 9.3 A STALE Stripe price id is the one billing failure nothing can detect

Unchanged and still true. Absent is safe and loud (`missingStripeConfig()` names the vars,
billing 503s, no fallback anywhere in `lib/stripe.js`). **Stale is silent**: the id resolves
to a real live price with the OLD amount and checkout charges it against a page showing the
new one.

The displayed prices are `$5.99` / `$44.99`, authored in `client/src/lib/pricing.js` — the
effective monthly and the 37% saving are derived from those two numbers, never written down.
**Recreate the Stripe Price objects and update `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`
whenever the displayed price changes.** They are not in this repo and no test can reach them.

### 9.4 Phone sign-in — 10DLC / Twilio, and it gates revenue

No account, no purchase. **10DLC brand + campaign were SUBMITTED and in verification at
Twilio** as of 2026-08-02; nothing else is expected to block it.

Remaining, all in the **Supabase dashboard** — Auth → Providers → Phone:

1. enable the provider
2. select **Twilio**
3. fill **Account SID**, **Auth Token**, **Message Service SID** from the Twilio console

**No server work, no env vars, no redeploy.** `SignInForm` already calls
`supabase.auth.signInWithOtp({ phone })`, which is provider-agnostic. Do **not** add a Send
SMS Hook back — Bird was deleted 2026-08-02 and the hook existed only to work around it.

Until this lands, guests are offered **no plan buttons** (`purchasable={false}`): buying needs
an account, an account needs a phone code, and a guest who tapped a plan would wait for a
message that cannot arrive. **Restore the buttons the day sign-in works.**

---

## 10 — Must move server-side BEFORE the Swift client

The rule, agreed 2026-08-04: **a claim, a content choice, or anything that changes what a
shopper is told → server. A gesture, a layout, or something that must work offline mid-aisle
→ client. Anything genuinely in between → server**, because there will be three clients and
each duplication below becomes copy #3 the day Swift starts.

Nothing here is moved yet. This is the list, with why each one is content rather than
presentation.

1. **`client/src/lib/list.js:776` `GOAL_TEMPLATES` / `:845` `FOCUS_ITEMS`** — ~300 lines of
   list-generation content duplicating `server/lib/list.js`, under a comment that says "keep
   them in sync." Nothing enforces it. Demo already reads the real public endpoints for the
   counter and for chat; the list is the surface that was left behind.
2. **`client/src/lib/coachGoals.js`** — 311 lines of goals, non-negotiables, focuses and
   constraints, including Kristy-voiced `payoff` copy. Voice is content.
3. **Tier → prose, written five times** — `ScanVerdictCard.jsx:34-46`, `CartMoment.jsx:50-52`,
   `HaulMoment.jsx:24`, `App.jsx:886-888`, `data.js:258`. The server already knows the tier;
   it should send the label with it.
4. **`client/src/lib/verdictRamp.js`** — the colours are presentation and stay. The strings
   are not: `AFFIRMATION_MEANING` ("Backed by history, not a lab"), `SEVERITY_CALL`,
   `EVIDENCE_LABEL` are claims about evidence quality and belong with the KB.

The pattern that works is already in the repo: `client/src/lib/listSections.js` declares
itself a mirror of `server/lib/listMatch.js` and `listSectionsMirror.test.js` fails if the
ids, titles, order or frozen rule drift. **Where a mirror is genuinely unavoidable, it needs
that treatment before it ships, not after.**


---

## 11 — Photo-first makes the Swift port matter MORE, not less

The scanner is being flipped: a photo of the ingredient panel becomes the primary
action and the barcode becomes a fast path. The audit forced it — **19% barcode
coverage** on independently-sourced products, and when Open Food Facts did hit, the
data was wrong badly enough to put a gold seal on a corn-syrup product. The shopper's
photo has none of those failure modes: right product, right market, right now.

**THE READABILITY CHECK IS THE WHOLE ARGUMENT, AND IT IS FREE ON NATIVE AND EXPENSIVE ON
WEB.** A photo that cannot be read is the false-seal problem in a new costume, so the
flow has to know whether the panel was legible BEFORE it produces a verdict.

- **Web has nothing.** There is no on-device text detection in a browser. The only way
  to discover the shot was unusable is to upload it, spend ~1.5–3.4s and a model call,
  and then ask the shopper to try again — after they have already waited.
- **Native gets it for nothing.** `VNRecognizeTextRequest` runs on the live preview in
  milliseconds, on device. A Swift client can refuse to fire the model call until the
  panel actually resolves. No round trip, no spend, no shopper told to re-shoot after
  waiting.

**This belongs near the top of the Swift spec.** It is the single biggest quality
difference between the two clients, and it is not a polish item — it is the difference
between a scanner that asks for a second photo and one that never needed to.

The rest of the capture gap points the same way, and every item is a capture-quality
property a browser does not expose:

| | Web today | Native iOS |
| --- | --- | --- |
| Focus / exposure on a small panel | `getUserMedia` defaults; no tap-to-focus, no exposure lock | AVFoundation tap-to-focus, exposure + white-balance lock |
| Capture resolution | browser default, commonly 640×480 — **marginal for 6pt ingredient type** | full sensor stills |
| Text detection before spending a call | none | `VNRecognizeTextRequest`, milliseconds, on device |
| Barcode + text from one frame | ZXing decodes the barcode only | VisionKit does both |
| Torch / stabilization | neither | both |

**So: photo-first is built MINIMALLY in React and PROPERLY in Swift.** Minimal on web
means photo as the primary action, ingredients-only prompt, barcode captured silently as
the join key, `partialRead` honored, and an honest re-shoot ask. That is real and
shippable and it will carry a re-shoot rate nobody enjoys. Do not invest past that on
web — the 640×480 default alone likely explains a meaningful share of it, and building
around an API that cannot be fixed is money spent on the wrong client.

---

## 12 — The landing page is a POSITIONING rewrite, not a copy fix

Deferred deliberately. Do not touch `client/public/landing.html` until the capture flow
has proven out on real photos.

**The problem is that the page's argument is built on a distinction photo-first erases.**
Its spine is the barcode boundary:

- *"Yuka stops where the barcode stops. The counter still has a right answer."*
- the **"Has a barcode / Has no barcode"** split panel — the page's central visual
- *"Reads what has a barcode."* (the competitor column)
- *"No barcode. Still a right answer."*
- *"Name the trip. Scan the box. Ask the counter."*

Every one of those is true today and stops being the story once Kristy reads labels
first. "Yuka stops where the barcode stops" is an argument about coverage; photo-first
means **Kristy doesn't stop there either**, which is a stronger claim and a different one.

**FLAGGED: the half-and-half framing may not survive at all.** The labeled/unlabeled split
was the organizing idea for the whole product, and it earned its place — but it is a
statement about *what a scanner can read*, and photo-first is precisely the claim that
the scanner boundary was never the real one. The counter is still the moat; the reason it
is the moat may no longer be "no barcode."

The replacement argument, if it holds after the photos: **a scanner looks up a number,
Kristy reads the label.** That covers both halves of the store without needing the
barcode boundary to carry it, and it is what the product actually does.

**Sequence:** capture flow → measure the re-shoot rate → then rewrite the page, because
if web capture turns out to be marginal the honest positioning is different again.


---

## 13 — The session of 2026-08-04: four checks that could not see their own subject

Everything below shipped. The through-line is one defect class in four costumes: **the check
passed because it could not see the thing.** That is the same family as an assertion over an
empty collection and a commit that omits its file, and it now has four more members.

### 13.1 GuestApp is production. App has never rendered for a real visitor.

**`App.jsx`'s dashboard branch is unreachable in production and has been the whole time.**
Phone sign-in is blocked on 10DLC carrier registration, so `supabase.auth` never mints a
session, so `session` is null for **every** visitor, so `App.jsx:975` (`!IS_DEMO && !session`)
returns `GuestApp` — hundreds of lines before its own surface stack is reached.

This is not a subtle inference. It means:

- Any bug in `GuestApp` is a bug **every** shopper has.
- Any fix in `App`'s branch reaches **nobody** until sign-in works.
- Reading `App.jsx` to understand "what a shopper sees" is reading the wrong file. It is the
  natural file to open, it is the one with the full wiring, and it is inert.

**Read `GuestApp.jsx` first when diagnosing anything a shopper reports.** An audit of where
the two surfaces disagree is queued below and has not been done — the hero was found by
accident, and nothing says it is the only divergence.

### 13.2 The dead hero, and why nothing anywhere caught it

"Start shopping" on the dashboard painted, accepted taps, and did nothing on
kristyapproved.com. `Resume shopping` too. So did `Finish the trip`, unreported only because
reaching it needs every box ticked.

**Cause.** `GuestApp.jsx` rendered `<Dashboard>` and passed no hero handlers at all —
`onStartShopping`, `onResume`, `onComplete` were simply absent. `Dashboard`'s `Hero` gated
its button on `action &&`, a string literal that is always true, then bound
`onClick={onAction}` to whatever it was handed. React renders `onClick={undefined}` as a
button with no listener.

**AN INERT CONTROL IS INVISIBLE TO EVERY CHECK THAT LOOKS FOR FAILURE, BECAUSE IT DOES NOT
FAIL.** Nothing throws. No console error, nothing for the error boundary, nothing for the
build. `vite build` was clean. The suite was green. The button was on screen, correctly
labelled, correctly styled, doing nothing. **There is no artifact of this defect except a
shopper tapping it.**

**Fix.** `Hero` now requires `action && onAction &&`. An unwired action **vanishes** rather
than going inert — which is loud, because `dash.mjs` already counts exactly one bone-filled
action per state, so the defect converts into a failure of a test that already existed. That
also gives the guest `finished` state its correct shape for free: no account, no `trips` row,
so no completion door rather than one that cannot file anything. `ShopMode.jsx:344` already
guarded its finish button this way, so the conjunction is the house pattern, not an invention.

Found alongside: `App.jsx` called `setMoment("list")` and there is no `'list'` moment. Import
navigated to a surface with no branch and painted nothing. A dead state name is an inert
button that has already been pressed.

### 13.3 dashHarness supplied the props a real call site owns

**`dash.mjs` mounts `Dashboard` through `dashHarness.jsx`, which constructs the hero handlers
itself.** So it is *structurally incapable* of noticing a call site that forgets them. It was
green throughout, measuring a composition the product does not perform.

This is worse than a coverage gap. A gap is an area nobody tested; this is a test that
**appears** to cover the thing and cannot, because the harness supplies exactly the part
that was broken. No amount of adding views to that harness would have found it.

> **A harness proves the COMPONENT. Only the real call site proves the WIRING.**

`client/test/heroAction.mjs` mounts the real `GuestApp` and passes only the two props `App`
passes it. Every hero handler under test comes from `GuestApp`'s own source or not at all. It
was verified to fail on the pre-fix code, reproducing the production symptom exactly: button
renders, reads correctly, **throws nothing**, shop mode never opens.

`server/lib/heroWiring.test.js` holds the same invariant with no browser, on every commit:
every `<Dashboard>` call site wires the two actions that enter shop mode, `Hero` keeps the
conjunction, `GuestApp` mounts `ShopMode`, and no surface sets a moment nothing renders. Four
of its five assertions fail on the old code.

**A sweep for this pattern across every other harness is queued and NOT done.** `cartHarness`,
`shopHarness`, `loopHarness`, `composedHarness` and `skim-harness` all construct props. Each
one is a candidate for the same blindness.

### 13.4 The paid boundary had no test at all

`summarize()` / `forViewer()` in `counterCards.js` are the money boundary — the only thing
between a card's depth and an unauthenticated caller. **They had zero coverage.**

`tier_note` was moved out of `DEPTH_FIELDS` and **515 tests passed.** Nothing broke, but
nothing *could have reported it* either: the suite was silent about that boundary in both
directions, so it would equally have passed if `why` had been moved. A field crossing the
paid boundary is the most consequential edit in this repo and it was unobserved.

`server/lib/paidBoundary.test.js` is the correction, over the real corpus: the seven depth
fields never reach a free viewer, essentials stay full, the teaser ships geometry and counts
rather than withheld words, and **every card tells a free reader what kind of claim it is.**

> **When a rule is the product's economics or its promises, the absence of a failing test is
> not evidence. Ask what would have gone red.**

### 13.5 Tier chips became tier sentences, and the swap was bigger than the complaint

The chip read "Credible concern" above a card about buying organic — a classification
rendered as furniture, naming a claim the card never made, with nothing to attach to.
Removed from `CounterCard`, `ShopMode`'s sheet and `PerimeterAnswer`. **The list attachment
never had one**: `CartMoment.jsx:211` had already reasoned it out ("a list is things to buy;
a tier is a claim about evidence, and on a row it is furniture raising a question nobody is
asking mid-task").

**The chip could not simply go.** Non-negotiable #6 requires a reader to ALWAYS know whether
a claim is settled science, a credible concern or a standard — and `tier_note` was PAID.
Only the eight essentials are ever full, so removing the chip alone would have left **73 of
81 cards** stating a verdict to a free shopper with no tier signal whatsoever. So `tier_note`
left `DEPTH_FIELDS` in the same change and renders below the do line. A **swap of one free
signal for a better one**, not a widening: the chip was already free, and `why` / `look_for`
/ `watch_out` are untouched.

**THE DISTRIBUTION IS WHY THIS WAS BIGGER THAN THE OBJECTION**, and it was measured, not
assumed:

| tier | cards |
| --- | --- |
| `established` | 49 |
| `kristys_standard` | 24 |
| `time_tested` | 5 |
| `credible_concern` | **3** |

The label being objected to was on **three** cards. The other 78 read "Settled" /
"Whole-food standard" / "Time-tested" — and had the same referent problem, less visibly. A
complaint about one label was really a complaint about the form.

### 13.6 Four tier_notes pointed at the chip that had just been deleted

`raw_milk`, `raw_kefir`, `raw_aged_cheese` and `sprouts_raw` — 4 of the 5 `time_tested`
cards — shared **one identical authored sentence**:

> "Traditional food with centuries behind it and thin modern study. **This tier** is Kristy's
> sourcing standard, not a health claim."

The moment the chip went, "This tier" became a definite reference to something no longer on
screen: **the referent-less problem the chip had, inverted**, and shipped to production for
one commit. They also slipped `TIER_NOTE_IS_RUBRIC`, which only catches the literal rubric
text — these were near-paraphrases.

Each now carries a distinct sentence naming what the tradition claim actually is for that
food. `raw_milk` keeps "not a health claim" **verbatim** because `perimeter.test.js` requires
it: that is the one card where a tier note reading as a safety rating is least acceptable,
and the guard caught a first draft that had drifted to "never about health."

Two new guards, because neither defect is visible from a single card:

- `lintCard` → **`TIER_NOTE_SELF_REFERENCE`**, structural, fires on `this tier` / `the tier`.
- `paidBoundary.test.js` → **no two cards may share a tier sentence.** A sentence on four
  cards is the rubric wearing a costume.

### 13.7 A KB edit does NOT reach production on its own

**`routes/counter.js` reads `getAllCards(supabase)` — cards are served from the
`counter_cards` TABLE, not from `kristy_perimeter_kb.json`.** Editing the KB changes the
tests, the probes and the local fixtures, and changes **nothing a shopper sees**, silently,
until `node server/scripts/migrateCounterCards.js` runs against the live database.

The KB remains the source of record and the migration is idempotent (upsert on slug), so
re-running is safe. `--dry-run` needs no credentials. After the fix above: `81 curated cards
— 0 inserted, 81 updated`, verified by fetching the four slugs from the live API and
asserting four distinct sentences and no "this tier".

**Editing a curated card is a two-step act. The second step is not optional and nothing
reminds you.**

### 13.8 A threshold that would have mandated the defect

The bone buttons were reduced (a full-width slab of warm bone on near-black green reads as
harsh, and the harshness is **area**, not hue — gold at that size would be worse, because
gold is identity and a control is not where identity gets spent).

`dash.mjs` then failed: it held the TopBar goal chip to **a quarter of the hero action's
area** — a ceiling calibrated when the action was a 350x56 slab and nothing was near it.
Sized as an action, satisfying that ratio would have required a ~308px-wide button. **The
test would have mandated the banner as the price of passing.**

The number went; the intent was tested directly. Dominance on that surface comes from FILL,
not square pixels. A first rewrite asserted the chip had *no* background and failed — the
chip **is** filled (`rgb(22,48,31)`), it just recedes into the ground. Transparency was never
the property. It now reads relative luminance off rendered colour: **action 0.816, chip
0.024**, a 34x separation that no resize can fake, plus a strict area inequality so a chip
still cannot grow into a comparable target.

> When a measured rule blocks a deliberate change, check whether the rule is measuring its
> own intent or a number that was true of the old design.

---

## 14 — The open queue, in order

Written 2026-08-04 so tomorrow starts cold. Nothing below is started unless stated.

**Done this session (shipped, on `main`, verified on production):** the dead hero + its two
tests · tier chips → sentences + `paidBoundary.test.js` · bone button sizing · scan tab copy ·
the four self-referencing tier_notes + two new guards.

1. **List creation audit, A–E. Report only, stop after.** — *next, not started.*
   - **A. Compose as it stands.** Is `/api/list/compose` one-shot, or can it take a follow-up
     against an existing list? What does `applyCompose` do — can it handle "no seafood" as an
     *instruction* rather than a new list? **If refining rebuilds from scratch, that is the
     core work and everything else is layout.**
   - **B. The two lists.** Run compose as it exists today, verbatim output for: a parent
     feeding four kids, no time, wants them to eat it; a college student, no money, one pan.
   - **C. Household context.** What does `user_goals` capture about household size, who is
     fed, cooking time, budget? Does compose use any of it? Propose the smallest set of facts
     that would make the two lists in B actually differ, and where they get asked. **From
     goals ONCE, never per trip.**
   - **D. The four inputs.** `listVision.js` — what it does, where it is called, whether
     anything in the UI reaches it; accuracy on a Notes screenshot, printed handwriting,
     rushed cursive, with the failure mode for each; items-with-quantities or a sentence?
     Voice — what web speech recognition actually does **on iOS Safari, verified not assumed**;
     good enough to feed compose directly, or must it land in the field for review? Type and
     same-as-last-week exist.
   - **E. One camera, three targets.** Written list, ingredient panel, barcode are one capture
     flow. Share a component? What does that do to the queued capture work?
2. **List creation design review.** Real component renders at 390px, no hand-built HTML — a
   for-approval mock renders the real component or it is not evidence (§7). Empty state and
   list state; ranked inputs **recommended from the audit's findings, not assumed**; how a
   refinement renders its change; small work vs new structure. **Stop after the review.**
3. **Build list creation. BLOCKED ON EXPLICIT APPROVAL of #2.** Order: iterative compose
   first, then the room with typing, then photo sharing the capture component, then voice.
   **Stop after iterative compose** and demo a refinement end to end — build a list, say "no
   seafood", show what changed. Real pointer clicks. **Nothing pushed until seen.**
4. **Scan card redesign — bottom sheet, not the 3,000px takeover.** Summary + full read on
   tap, camera stays live, approved state is the SMALLEST state in the app. Yuka's shape:
   photo, name, verdict, detail on tap. *(Was queued in conversation and recorded nowhere
   until 2026-08-04 — see CLAUDE.md open items.)*
5. **Scan card thumbnail from the shopper's photo.** On a photo read the image slot is empty;
   OFF has no stored image for a product read off a panel. Client-side crop and downscale,
   **in memory for the session only, nothing persisted, nothing uploaded beyond the vision
   call that already happens** — the no-images-stored rule is unchanged and must be
   *confirmed, not assumed*. First deliverable is a report: where the slot is fed today and
   what it costs.
6. **List attachment eyebrow — REPORT ONLY, DO NOT CHANGE.** Eyebrow + do line + chevron is
   three lines. Does the eyebrow earn its place? "PICKING PRODUCE" above "Smell the stem end
   on anything that ripens after picking" is a label on an instruction that may not need one.
   Show the list at 390px **with and without**, real component via `buildFixture.mjs`.
7. **GuestApp / App divergence audit.** §13.1. The hero was found by accident. Enumerate
   every place the two surfaces disagree and decide which is right — `GuestApp` is what
   ships, so any divergence is a production defect until proven deliberate.
8. **Harness sweep for the props-supplied pattern.** §13.3. `cartHarness`, `shopHarness`,
   `loopHarness`, `composedHarness`, `skim-harness` all construct props. For each: does it
   supply something a real call site owns? Where it does, the fix is a test against the real
   surface, not another view in the harness.
9. **Swift prerequisites.** Move the four content duplications in §10 server-side
   (`GOAL_TEMPLATES`/`FOCUS_ITEMS`, `coachGoals.js`, tier→prose written five times,
   `verdictRamp.js` strings), each with the `listSectionsMirror.test.js` treatment where a
   mirror is unavoidable. **Then** write `docs/SWIFT-SPEC.md`.

**Still blocking revenue, unchanged:** phone sign-in. 10DLC brand + campaign submitted and in
verification at Twilio. Remaining work is Supabase dashboard only — Auth → Providers → Phone
→ enable, select Twilio, fill Account SID / Auth Token / Message Service SID. No server work,
no env vars, no redeploy. **Until it lands, §13.1 holds: every visitor is a guest.**
