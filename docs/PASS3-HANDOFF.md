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
| Web | `kristyapproved.com` — Vercel, GitHub-connected, a push to `main` deploys in about a minute |
| API | `kristy-server-production.up.railway.app` — Railway project **`happy-enchantment`**, service `kristy-server`, Root Directory `server/` |
| Corpus | `counter_cards`, 81 rows: 79 curated + 2 generated |
| Tests | `cd server && npm test` → **420** |

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
