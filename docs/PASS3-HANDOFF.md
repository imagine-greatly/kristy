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
