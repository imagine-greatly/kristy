# Verifying — the full account

> Extracted verbatim from `CLAUDE.md` on 2026-08-10, when that file passed the 150,000-character
> context limit and its tail stopped loading. **`CLAUDE.md` holds the RULE; this file holds the
> ACCOUNT** — the incident, the measurement, the superseded version, the reasoning that was paid
> for once and must not be re-derived. Nothing was deleted in the move.
>
> **If you are changing a rule, change it in `CLAUDE.md` and add the account here.** A rule that
> lives only in this file is a rule that stops applying.

## Verifying

- **AN ASSERTION OVER AN EMPTY COLLECTION PASSES. Guard every one of them.** `[].every(fn)`
  is `true` and `for (const x of []) assert(...)` runs nothing, so a check whose collection
  is empty BY ACCIDENT reports success — worse than no check, because the suite now carries
  a green tick where the coverage used to be. This shipped: the paid-boundary verification
  read `cards.filter(c => c.essential).every(c => c.why)` and printed "essentials full ✓"
  while **all eight were being gated**, because `essential` was missing from `CARD_COLUMNS`
  and the filter returned nothing. The bug walked past its own verification.
  **`nonEmpty(coll, name, min?)` in `lib/testGuards.js` is the fix, and bind it at the
  COLLECTION rather than at the loop** — a module-level `const entries = nonEmpty(...)`
  throws at import, so every test in that file is honest by construction instead of by
  discipline. Swept 2026-08-02: 73 at-risk sites → 49, and the remainder iterate array
  literals, which cannot be empty by accident.
- **THE SAME FAMILY: A BOUNDARY WITH NO TEST IS A COMMENT, AND IT STAYS GREEN WHILE A FIELD
  WALKS ACROSS IT.** `summarize()` / `forViewer()` in `counterCards.js` are the money
  boundary — the only thing between a card's depth and an unauthenticated caller — and they
  had **zero** coverage. `tier_note` was moved out of `DEPTH_FIELDS` and **515 tests passed**.
  Nothing was broken by that move, but nothing *could have* reported it either: the suite was
  silent about the paid boundary in both directions, so it would equally have passed if `why`
  had been moved. A field crossing the paid boundary is the single most consequential edit in
  this repo and it was unobserved. `paidBoundary.test.js` is the correction. **When a rule is
  the product's economics or its promises, the absence of a failing test is not evidence —
  ask what would have gone red.**
- **THE SAME FAMILY, AND THE HARDEST ONE: EACH SITE REASONS CORRECTLY IN ISOLATION; THE DEFECT
  APPEARS ONLY WHEN YOU ADD THEM UP.** Every other member has a wrong artifact somewhere — an
  empty filter, an over-supplying harness, a missing test, a drifted comment, an untracked file.
  This one has none, which is why nothing found it for months. **The entire trip lifecycle has
  never executed for a real shopper** (found 2026-08-07): all four `/api/trips/*` routes are
  `requireAuth`, which is correct because they write to `trips`; sign-in is blocked on 10DLC,
  which is a carrier fact; so `seedable` is permanently false, which is the honest answer when
  the endpoint needs an account; so the dashboard's `finished` state renders **doorless**, which
  is right because a button that cannot do what it says is worse than no button. Four correct
  decisions whose sum is a shopper whose completed list stays a live cart forever, with no tap
  that files it and no last week. The statuses, the partial unique index, the reuse rule and the
  re-matching seed are built, tested and correct, and none has ever run. `trips.test.js` is
  honest about what it measures; what it measures is a path production cannot enter.
  **The subject is the composition, and no file owns a composition** — so there is nowhere to put
  the failing test, and a diff review structurally cannot see it either. The check is to walk the
  path end to end as a real visitor with no diff in hand: state the capability ("can a shopper
  finish a trip and start the next one from it?") and evaluate the conjunction of every gate
  between. **The tell is a `false` that is CONSTANT rather than conditional** — a flag whose true
  branch has never been taken in production is not a flag, and everything downstream of it is
  unbuilt rather than untested. Distinct from the harness entry below: there the call site was
  *wrong* and a real-call-site test found it; here every call site is right, so no test of any
  call site can find it.
- ⚠️ **THE SECOND CONSTANT-FALSE COMPOSITION, FOUND 2026-08-10 BY THE SAME WALK: THE SHOPPING
  PROFILE HAS NEVER ACCUMULATED FOR ANYBODY.** `buildBaseline` (`lib/listBaseline.js`) reads
  `shopping_lists.signals` and computes `staples` (occurrences of `kept` above a threshold —
  frequency deliberately undeduped), `avoided` and `declined`. It is written, tested and
  correct. **Its input is empty and always has been.** Every `/api/list*` route is
  `requireAuth`; sign-in is blocked on 10DLC; and `Kristy/Core/Cart.swift:11` says so in a
  comment header — *"Why there is no `GET /api/list` in here: every visitor is a guest."*
  Nothing writes `signals`, so `staples` is permanently `[]`.

  **Identical shape to the trips entry above, and it was found the same way and not by any
  test.** Each decision is right alone — the routes must be `requireAuth` because they write
  per-user rows; the client is right not to call an endpoint no visitor can reach; 10DLC is a
  carrier fact — and the sum is a personalization mechanism that has never executed. **The
  tell is the same: a value that is CONSTANT rather than conditional.** `staples` is not
  untested, it is unreached, and everything downstream of it is unbuilt rather than unverified.

  ⚠️ **AND THE SIGNAL IT WANTS IS ALREADY BEING COLLECTED SOMEWHERE ELSE AND THROWN AWAY.**
  `GuestTripBook.archive` in `kristy-ios` holds every completed trip with every `ListRow` and
  its checked state, on device, already persisted and already capped with `dropped` counted
  honestly. The only thing that reads it is `CarryOver.of(book)`, which **counts trips** for
  the sign-in disclosure. So the computation exists on one side of the wire with no input and
  the input exists on the other with no computation. That is the queue item under **Open
  items**; the reason it is recorded *here* is that neither half is a defect and no diff
  contains it.
- **THE SAME FAMILY: A HARNESS THAT SUPPLIES THE PROPS VERIFIES A WIRING PRODUCTION NEVER
  RUNS.** `dash.mjs` mounts Dashboard through `dashHarness.jsx`, which constructs the hero's
  handlers itself. So it is *structurally incapable* of noticing a call site that forgets
  them — and `GuestApp`, the only home surface any real visitor reaches, rendered
  `<Dashboard>` with no hero handlers at all. "Start shopping" painted, took the tap and did
  nothing on production while that suite was green, because the suite was measuring a
  composition the product does not perform. **A harness proves the component; only the real
  call site proves the wiring.** `heroAction.mjs` mounts the real `GuestApp` and passes only
  what `App` passes. Related: an inert control is invisible to every check that looks for
  failure, *because it does not fail* — no throw, no console error, no failed build. `Hero`
  now requires a label AND a handler so an unwired action vanishes instead, which the
  existing per-state action count already catches.
- **THE SAME FAMILY, ONE LEVEL UP: A COMMIT THAT OMITS THE FILE IS GREEN FOR THE SAME
  REASON AN EMPTY COLLECTION IS.** Every test runs against the WORKING TREE, and the
  working tree has the file whether or not git does — so a module written, imported, tested
  and committed-around passes everything locally and is simply absent from `main`. `git
  commit -a` does not add untracked files. **This has happened twice**, the clearest being
  `3267c95 The list becomes the trip, and the whole list is free`, which landed the list
  matcher and NOT the trips feature: `server/lib/trips.js`, `server/routes/trips.js`,
  `trips.test.js` and the loop harness stayed untracked for a day under a commit title
  asserting they had shipped, while `server/index.js` imported one of them. Both defects are
  *the check passed because it could not see the thing*; `nonEmpty` binds at the collection,
  and this binds at the commit.
  **`node server/scripts/commitGuard.js` before any commit that claims a feature.** It
  resolves import specifiers and path literals for real — so `trips.js` the module is caught
  and the word "trips" in a comment is not — and exits 1 naming the exact `git add`.
  `commitScope.test.js` runs the same logic over the tracked tree in `npm test`, because a
  guard nobody remembers to invoke is a guard that catches the case nobody remembered.
  **`GUARDED` says where an untracked file is a problem; it must never also decide what gets
  READ.** Conflating the two exempted `server/index.js` — outside every guarded prefix, and
  the file that mounts every route — from the first draft of this guard, which therefore
  missed the exact import that caused the incident. Sources are every tracked code file.
  Same distinction `deployBoundary.test.js` makes when it scans `lib/`, `routes/` AND
  `index.js`.
- **EVERY SOURCE GETS FETCHED BEFORE IT SHIPS. A citation written from memory is the
  same defect class as a comment asserting an invariant** — it reads as verified
  precisely because it is written down, and the next reader has no way to tell the
  difference. This nearly shipped on `carrageenan`, the one entry whose entire fix is
  the distinction between a real finding and a retold one. Fetching it made the entry
  STRONGER rather than merely safer: the EFSA 2018 re-evaluation found no carcinogenicity
  or genotoxicity concern for the food-grade additive and that it is not absorbed intact,
  while making the ADI temporary — a better sentence than the sourced version of the old
  claim would have been. The real finding beats the retold one often enough that fetching
  is worth it on the merits, not only as hygiene.
- **A PROMPT'S WORKED EXAMPLE BECOMES ITS OUTPUT. Never write the forbidden thing down.**
  Twice now, the exact text a prompt carried as an illustration came back as the product's
  own words. `gen_a1_vs_a2_yogurt` contradicted the curated A2 card because
  `counterGenerate.js` held that headline as its worked FAIL/PASS example. And every
  budget-constrained list put **"Cheap protein and carbs"** in the summary — because
  `LIST_COMPOSE_SYSTEM` contained the literal phrase *"Cheap protein asked for"* as its
  example for when liver belongs on a list, while banning a "cheap/expensive" label two lines
  later. The model was not inventing either one; it was **echoing the prompt**. When output is
  wrong, check whether the generator was *taught* it before assuming it improvised.
  **Distinguish two forms, because only one is avoidable.** A forbidden WORD has to be named
  to be banned ("never the words 'cheap' or 'expensive'") — that sits inside a prohibition
  frame and is low risk. A forbidden PHRASE demonstrated as example output is high risk and
  always avoidable: **describe the defect instead of writing the bad line.** And a ban with no
  substitute is a gap the model fills from habit, so name the words it SHOULD use — budget got
  "stretches / goes further / more per pound", and the model adopted them verbatim.
  **A worked example must also never quote the live corpus.** Swept 2026-08-05:
  `COUNTER_GEN_SYSTEM`'s examples are **verbatim `decision` fields of three shipping cards** —
  `salmon_wild_vs_farmed`, `label_natural`, `organic_worth_it_by_type`, plus that first card's
  `watch_out`. The generator is shown real curated output as the thing to imitate, which is
  the mechanism behind the four generated duplicates already paid for. Illustrations must be
  invented, or clearly marked as belonging to a card that already exists.
- **A COMMENT ASSERTING AN INVARIANT IS NOT AN INVARIANT. If it is load-bearing, test it.**
  The retrieval-floor comment claimed curated and generated admit on the same evidence, and
  was wrong three consecutive times in three different ways — different constants, then
  matching constants with mismatched operators, then matching constants AND operators over
  two scorers that measure different things. Each version was written by someone who had
  just looked at the code, and each read as settled fact to the next person. The same shape
  produced the "curated entries carry a dozen aliases" premise that held the gate too high
  for months, and the "nothing is deployed" conclusion in this file's own history. **The
  pattern is not carelessness, it is that prose records intent while code executes
  mechanism, and the two drift silently.** `counterFloor.test.js` is the correction: it
  states the floor once, in the unit both paths share, and reads the pipeline source so an
  edit that quietly drops the check fails. Where a comment explains WHY, keep it. Where it
  asserts THAT something holds, write the test and let the comment point at it.
- **Verify mobile over CDP, not `--window-size`.** Chrome enforces a ~500px minimum
  window on Windows: `--window-size=390` renders at 504 and crops, which looks exactly
  like horizontal overflow. Use `Emulation.setDeviceMetricsOverride`.
- Measure, don't eyeball: geometry claims ("equal weight") should be read off
  `getBoundingClientRect`, not judged from a screenshot.
- `cd server && npm test` — **644 on `main` + the held stack**, measured 2026-08-10. `origin/main`
  runs that minus `trips.test.js`'s import half, which is held; **that second number is
  deliberately not written down any more.** A bare count here has been stale five times (it read
  483 while the suite ran 613, then 618/607 while it ran 623), and half of every stale pair was
  a number nobody had run — recording only the one that was actually printed is what stops the
  next drift. Client: `cd client && npx vite build`.
- **`vite build` COMPILES A DEAD REFERENCE HAPPILY.** Moving the ask out of `AisleMoment` left
  a `{!ask && …}` behind — a live `ReferenceError` that took the whole Counter surface down,
  through a clean build. Only `gate.mjs`, which drives the real surface, caught it. A green
  build is not a rendered surface; run the browser suites after any component split.
- **`node client/test/dash.mjs`** renders all five dashboard states at a true 390px **in the
  real app frame** (the real `TopBar` above it) and asserts the hero rule and the one-filled-
  action rule. Rendering the Dashboard alone made "hero top = 0px" a fact about a harness.
- **`node client/test/shop.mjs`** measures shop mode: geometry, the type inversion, WCAG
  contrast off rendered colour, the collapse mid-scroll, **the wake lock hidden and restored
  for real**, and return-to-position broken four ways (deep scroll → scan → close; scan open →
  backgrounded → restored → close; ask → real submitted query → close; and the ask reached
  from inside the scan overlay). Position is asserted as an exact `scrollTop`, not "roughly
  the same section".
- **`node server/scripts/listMatchProbe.js` is the match probe, and it FAILS on a wrong
  match** rather than counting it. Run it after any KB alias edit, any `perimeterId` change
  and any matcher change — it is the cheapest check that the corpus still answers the list
  correctly, and it needs no browser and no server.
- **`node client/test/composed.mjs` measures what the list COSTS** — lines per row, page
  height — and holds the two honesty rules with no other home: a matched row may not carry
  both a `why` and a do line, and a row may not display a section it is not sorted into.
  `cart.mjs` asks whether the surface WORKS; this asks what it costs. Both render composed
  PICKS through `buildFixture.mjs`.
- **The list surface is measured in a browser, not eyeballed.** `node client/test/cart.mjs`
  renders the real CartMoment at a true 390px over CDP and asserts the geometry (44px check
  targets, zero horizontal overflow, the collapse) with **real pointer clicks**;
  `node client/test/loop.mjs` runs the whole trip loop — build, check, complete, seed — and
  fails if a seeded row arrives checked or loses its card. The seed in that test is computed
  by the shipping `buildNextTripList` in node and injected, because trips.js reaches the KB
  through `node:fs` and cannot be bundled for a browser; the SEMANTICS are proven separately
  in `trips.test.js` against the real functions.
- **What the code writes must exist in the migrations, and a test checks it.**
  `schemaContract.test.js` compares every key `cardToRow` emits against the columns
  declared in `supabase/*.sql`, plus a sweep over inline insert/update literals. The
  live audit in `docs/SCHEMA-AUDIT.md` compares live against the file and is therefore
  blind to a column missing from BOTH — which is exactly how `counter_cards.aliases`
  shipped, silently stopping the generated corpus from growing.
- **The section depth floor is 8, and the count is a proxy worth watching.** `aisle.test.js`
  requires 8 topics per shopper-facing section as a stand-in for "answers as much as a scan
  does" — a claim about CONTENT. Removing a duplicate lowers the count without lowering the
  content, which is why the mercury fold could take seafood 9 → 8 legitimately; a section
  that shrank by DELETION must not get the same pass. Seafood is now the thinnest section
  and holds the next authoring slot.
- **The counter card's shape bar is executable, and it runs against generated cards too.**
  `server/lib/counterCardLint.js` holds the rules (the observable may not sit in both the
  headline and the `do` line; one verdict per headline; no false mechanism; the em-dash-
  then-justification share has a ceiling; within-section closing duplication fails; verb
  distribution and intra-card contradiction are reported and never fail). Pass 3 must call
  `lintCard` before persisting a generated card.
- ⚠️ **EDITING A CURATED CARD IS A TWO-STEP ACT, AND NOTHING REMINDS YOU OF THE SECOND.**
  `routes/counter.js` reads `getAllCards(supabase)` — cards are served from the
  **`counter_cards` table**, not from `kristy_perimeter_kb.json`. So a KB edit changes the
  tests, the probes and every local fixture, and changes **nothing a shopper sees**, silently,
  until `node server/scripts/migrateCounterCards.js` runs against the live database. Green
  suite, correct file, unchanged product. The KB stays the source of record and the migration
  is idempotent (upsert on slug), so re-running is always safe; `--dry-run` needs no
  credentials and reports what would move.
- **A TIER NOTE MAY NOT POINT AT THE TIER, and four cards did.** `raw_milk`, `raw_kefir`,
  `raw_aged_cheese` and `sprouts_raw` shared ONE authored sentence saying "**This tier** is
  Kristy's sourcing standard" — written when a chip named the tier beside it. The chip was
  removed, and the phrase became a definite reference to something no longer on screen: the
  referent-less problem the chip had, inverted. They slipped `TIER_NOTE_IS_RUBRIC` because
  that check only catches the literal rubric text and these were near-paraphrases. Two guards
  now, because neither defect is visible from one card: `lintCard` fires
  **`TIER_NOTE_SELF_REFERENCE`** on `this tier`/`the tier`, and `paidBoundary.test.js` fails
  if **any two cards share a tier sentence** — a sentence on four cards is the rubric wearing
  a costume. `raw_milk` keeps "not a health claim" verbatim; `perimeter.test.js` requires it,
  and it caught a rewrite that had drifted to "never about health."
- **A fold is a removal AND a delete, in one operation.** The migration upserts on slug and
  never removes, so an entry deleted from the KB leaves its row alive in `counter_cards` —
  still retrievable, still matching on its own aliases, and no longer editable because the
  file it came from is gone. Retirement is declared in `RETIRED` (`counterCards.js`) and the
  migration deletes those rows in the same run. Move the folded card's aliases onto its
  absorber and repoint any section `shortcut`, or the fold is a coverage regression wearing
  a tidy diff. **Grep wider than the shortcuts** — the 2026-08-02 sweep left three live
  `perimeterId` references in `list.js` that only `list.test.js` caught.
- **TWO retirement lists, and a slug in the wrong one deletes NOTHING.** The migration
  removes `RETIRED` with `.eq('source','curated')` so a retired KB slug can never sweep a
  generated card that collides with it. That scoping is correct and it means `RETIRED` is
  *structurally incapable* of retiring a generated row: put a `gen_` slug there and the run
  reports "retired 11 slugs", deletes nothing, and the card stays live and answering. Four
  did, for one migration run, including one whose verdict contradicted a curated card
  outright. Generated retirement is `RETIRED_GENERATED` with its own `source = 'generated'`
  delete, and a test fails if either list holds the other's kind.
- **PROMOTE A GENERATED CARD ON DEMAND OR ON CORPUS-CORRECTION, NEVER ON CORRECTNESS.**
  Correctness is already the floor for a generated card existing at all — lint, the claim
  lock and the tier system enforce it before anything persists. If correctness were also
  the promotion bar, every generated card would be promoted and the generated corpus would
  never exist: Pass 3 becomes a curation pipeline with extra steps. `berries_picking` was
  promoted because it corrected a regression the curated corpus had just created (the hub's
  new do line excluded berries by construction) and it owned a subject with real demand.
  `gen_guanciale_worth_buying` is correct, fills a genuine gap, and stays generated —
  `use_count` is 0 and the only thing that ever asked was a verification probe. **When
  `use_count` climbs, promote.** That is the signal the counter exists to give.
- **Keeping at least one real generated row is not untidiness.** At zero, stage 2b of the
  ask pipeline has nothing to retrieve and is untestable in production — the same argument
  as `coverageStats.fromVision`: a number climbing over time is the only evidence the loop
  is running rather than merely wired correctly.
- **A fold's real anchor may be a PROMPT, not a row.** `gen_a1_vs_a2_yogurt` contradicted
  the curated A2 card because `counterGenerate.js` carried that exact headline as its
  worked FAIL/PASS example for "the do line must serve the headline". Deleting the row
  alone would have left the thing that regenerates it. When a generated card is wrong,
  check whether the generator was *taught* it.
- **The deploy boundary is `server/`, and a test is the fence.** Railway's Root Directory
  is `server/`, so anything the runtime reads from outside it exists on a laptop and is
  missing on the box, silently and forever. `deployBoundary.test.js` resolves the path
  literals in `lib/`, `routes/` and `index.js` and fails on any that escape; `scripts/` is
  exempt by name because those are dev tools run from a full checkout. This is how the
  reviewed `do` lines were absent from **every** curated card on `/api/counter/ask` in
  production — `docs/do-lines-review.md` never shipped. The lines now live in
  `server/lib/doLines.json`, generated by `scripts/buildDoLines.js`, with the markdown
  still the authored source and `doLines.test.js` failing if the two disagree. **Edit the
  table, re-run the build script, commit both.**
- **Rendered-line claims need a browser.** `cd client && node test/skim.mjs` renders all 80
  cards at a true 390px over CDP and measures line boxes; `node test/shots.mjs` captures
  the six representative cards. Both need the API server running on :3001.
- If a git write fails with "permission denied", it's OneDrive locking `.git` — retry.
  Never hand-edit the KB or committed files to recover.
