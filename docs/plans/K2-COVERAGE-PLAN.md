# K2 — Counter coverage plan (builds 5–10)

Drafted 2026-10-06 by the planner on branch `corpus` (`dacf56f`). **Plan only. Nothing here is approved, built or migrated.**
This runs past the 80-line plan budget because the dispatch asked for a baseline, a universe map and comparables.

**Problem.** A shopper types an ordinary grocery word ("salsa", "chips", "meat", "sour cream") and gets either nothing or the "Everything else" bucket. Most of the store's center and much of its dairy and frozen case have no card and no pick.
**Ask (Devon).** Cover the ~95% of items people buy daily or weekly, and add broad cards for words like "meat", "fish", "bread" and "snacks".
**Underlying need.** Every list row and every counter question about everyday food should land on something that teaches label truth. Non-food stays silent.

## Measured inputs (what was and was not counted)

- **KB at `dacf56f`: 131 entries = 109 cards + 22 picks** (`kristy_perimeter_kb.json`). The live table had 113 rows after the K1 migration (109 curated + 4 generated); that figure is from the session note, and I did not select it myself.
- **`counter_gaps` export: 3,034 rows.**
  - **Contaminated rows.** The top 7 subjects (2,850 rows) are the known fixtures in `compileGapBacklog.js` FIXTURE_HINTS. All 40 "wild salmon fillets" rows fall between 2026-10-05 21:45 and 22:52 UTC, which looks like a UI-test burst; it is not in FIXTURE_HINTS.
  - **Real shopper demand is about 84 rows**, most of them from one day (2026-08-05). That is too thin to define "95%" alone (see C-4).
  - **Already covered.** Many tail rows are stale and covered today: sourdough, apples, orange juice, sweet potatoes, sparkling water, whole-grain bread, cereal, pasture-raised eggs, limp lettuce, A1/A2.
- **Gap top 20.** Case and plurals are normalised. `*` = fixture or test, `✓` = covered today.

  | rank | subject | rows | tag |
  | --- | --- | --- | --- |
  | 1 | frozen peas | 898 | * ✓ |
  | 2 | baby spinach | 895 | * ✓ |
  | 3 | lemons | 891 | * ✓ |
  | 4 | dish soap | 88 | * non-food |
  | 5 | nutella | 48 | * |
  | 6 | aluminum foil | 43 | * non-food |
  | 7 | paper towels | 43 | * non-food |
  | 8 | wild salmon fillets | 40 | * test burst |
  | 9 | sourdough (bread) | 10 | ✓ |
  | 10 | pick a cantaloupe (ask, weak) | 6 | |
  | 11 | apples/honeycrisp | 6 | ✓ |
  | 12 | orange juice | 5 | ✓ |
  | 13 | doritos | 5 | |
  | 14 | fairlife | 5 | |
  | 15 | pasture-raised eggs | 5 | ✓ |
  | 16 | toilet paper | 5 | non-food |
  | 17 | salsa | 5 | |
  | 18 | oreos | 4 | |
  | 19 | diet soda | 4 | |
  | 20 | kombucha | 3 | |

  Below the top 20: pineapple 3 (ask, weak), meat 2.
  The "wild salmon fillets" burst still exposes a real defect: no salmon alias names the head noun "fillets".

## Baseline and target universe (everyday food, 153 items; planner tally, unweighted)

**Mechanisms:** C = card, P = pick, A = alias on an existing card, B = broad card, O = out of scope.
Today's marks come from my reading of the KB, not from running the matcher. K2-0 re-measures them.

| Section | Covered today | Uncovered today, with target mechanism |
| --- | --- | --- |
| Produce | 34/38 | mushrooms P; green beans P; winter squash P; pineapple (weak) A |
| Meat | 13/19 | ham C; turkey bacon C; lamb+goat C (folds gen_goat); jerky P; meatballs P; pork-chop head noun A; "meat" B |
| Seafood | 5/11 | white fish C; crab C; scallops C; lobster P; smoked salmon C; fish sticks P; "fish/seafood" B |
| Dairy & eggs | 9/16 | ultrafiltered milk C; sour cream C; cream cheese C; cottage cheese C; almond+soy milk C; plant butter C; general kefir A; "dairy" B |
| Bakery | 4/8 | buns & rolls C; english muffins P; pita & naan P; pastries & muffins C; "bread" B |
| Pantry | 14/32 | sugar C; salt C; cooking oils C; vinegar P; broth C; pasta sauce C; jam C; baking soda/powder P; tea C; ketchup+mustard C; mayo C; salsa C; canned soup C; hazelnut spread C; maple syrup C; hot+soy sauce P; snack bars C; condiments B |
| Snacks | 0/8 | potato chips C; tortilla chips A on chips; crackers C; cookies C; popcorn C; snack pretzels C; candy+chocolate C; "snacks" B |
| Drinks | 2/7 | soda C; diet soda C; kombucha C; sports drinks C; energy drinks C; "drinks" B |
| Frozen | 3/9 | frozen pizza C; frozen meals C; ice cream C; nuggets P; waffles P; fries P; "frozen" B |
| Deli & prepared | 1/5 | hummus C; deli salads P; prepared meals C; fresh pasta P; "deli" B |
| **Total** | **85/153 ≈ 56% (count, unmeasured)** | **target ≥146/153 ≈ 95% by count; weighted % to be measured in K2-0** |

**Out of scope (O):**
- Non-food (dish soap, paper towels, foil, toilet paper, bleach, pet food) is carried and never judged; that silence is the feature.
- Alcohol (App Store age rating), infant formula and baby food (medical → doctor) and supplements are out.

**Basis for the 95% claim.** The universe above is my enumeration, marked [PLACEHOLDER]. K2-0 reconciles it against the BLS CPI-U "food at home" item strata and their published relative-importance weights. Only then can a weighted share be quoted; no weight is invented here.

## Design decisions (each with comparables; ★ = Recommended)

**C-1. Broad words** ("meat", "fish", "bread", "snacks", ...):
- (a) *Today:* miss, logged as a gap.
- (b) Short aliases on hub cards ("meat" on `judging_meat_at_the_case`). Rejected: alias containment would let " meat " score on "lunch meat" and "ground meat". That is the hub steal CLAUDE.md forbids.
- ★(c) One broad card per **unowned** section word, owning only the long buying alias `which <noun> should i buy` plus 3+ `asked_as`. The bare-noun fallback in `scorePool` gives aliasScore 4 only when no alias hit exists. A specific row like "ground beef" never reaches the broad card, and the broad card holds no short alias.
- (d) Redirect broad words to the section index. Needs iOS work, so not in K2.

**C-2. What a broad card says.** It is a section-level how-to-read-the-label card:
- the ingredient-list and standard-of-identity questions that decide the section, each traced to a source in the archive;
- a `decision` that names, in words, which specific question to ask next;
- no health outcome, no price, no brand.

Routing in K2 is text only; a tappable route is open question 3. Words already owned by a hub card stay with that card: cheese, beef, chicken, eggs, yogurt, rice, cereal, pasta, produce.

**C-3. Where center-store cards file:**
- ★(a) Under the existing six sections. This mirrors build 4, which filed bread, coffee and cereal in `bulk_pantry`; there is no code or iOS change.
- (b) New Snacks & Drinks, Frozen and Bakery sections. That touches `PERIMETER_SECTIONS`, `counterCards.js`, the iOS index and the section plates.
- (c) One "Center store" section.

**C-4. Universe basis:**
- (a) `counter_gaps` only. That is today's state; about 84 real rows, too thin.
- ★(b) BLS CPI-U food-at-home strata, fetched and archived, plus `counter_gaps` for order.
- (c) A retailer category tree. It is scraped, unstable and brand-heavy.

**C-5. Card or pick** for an uncovered item:
- ★ A card when a shopper asks a question about it, or a regulated label term (standard of identity, claim) decides the buy.
- Otherwise a pick: one claim-locked line, list floor only.

## Folds (generated rows live only in the table; the scout selects them live first)

- **`gen_choosing_a_real_cereal`:** restates `breakfast_cereal`. Fold it in B5:
  - add it to `RETIRED_GENERATED` (not `RETIRED`) and delete the row;
  - move its `asked_as` to `breakfast_cereal`;
  - grep `counterGenerate.js` for a prompt that teaches it (VERIFYING: a fold's anchor may be a prompt).
- **`gen_goat_meat_quality`:** fold into the B9 lamb+goat card. In the same piece, supersede the `lamb` pick and edit the meat thinNote (perimeter.js:332).
- **`gen_guanciale_worth_buying`:** VERIFYING says it stays generated until `use_count` climbs. Fold it into B9's cured-pork card only if that card answers the same question; otherwise leave it.
- **`gen_live_fermented_foods`:**
  - if the live `decision` restates `yogurt_live_cultures`, fold it into B7's fermented-vegetables card;
  - if it holds a distinct claim, keep it;
  - keep at least one real generated row either way.

## Scout first (`dv scout`, admin-run; only VERIFIED lines become ANCHORs)

1. `dv ask --role scout "select slug, headline, decision, use_count from counter_cards where source='generated'" --cd /Users/m1/kristy-corpus`. This is a live select; the network failed once on 2026-10-06.
2. `dv scout "does matchItemToCard reach the scorePool buying-alias fallback for a bare one-word row" --terms scorePool,matchItemToCard,aliasNamesHead`
3. `dv scout "where is RETIRED_GENERATED defined and which test enforces it" --terms RETIRED_GENERATED,RETIRED`
4. `dv scout "can listMatchProbe.js take an external item list, and what does it print for a miss" --terms listMatchProbe`
5. `dv scout "build-4 dv spec, sources agent and critic prompt paths to mirror" --terms build4,sourdough`
6. `dv scout "would a snack 'pretzels' row be vetoed or stolen by typeContradicts pretzel group" --terms TYPES,typeContradicts`
7. `dv ask --role scout "which process wrote 40 'wild salmon fillets' gap rows 2026-10-05 21:45-22:52 UTC" --cd /Users/m1/kristy-ios`
8. `dv scout "does any test bound the KB category enum or ESSENTIALS order per section" --terms ESSENTIALS,SECTION_BY_CATEGORY`

## Intent

A shopper can write any everyday food on a list or ask about it at the counter. The row lands on a card or a pick that teaches what to read on that package; a broad word lands on a section card that says which question to ask next. **The moment that must land:** typing "salsa", "sour cream" or "meat" gives a real answer, not "Everything else".

## Non-goals

- New sections and iOS changes (C-3b).
- Tappable routing.
- Non-food judgment.
- Brand criticism (NN9) and prices (NN8).
- Any change to `verdictEngine` or the engine KB.
- Matcher logic changes, e.g. a row whose last word is "pack" (noted, not fixed).
- Migration: each build ends "Not migrated"; Devon calls it.

## Pieces

**K2-0 Measure.**
- **What:** extend `listMatchProbe.js` with `--universe <file>` printing covered/total per section, and add `docs/coverage/universe.json` (153 items, mechanism mark per item). Add "wild salmon fillets" to FIXTURE_HINTS. Fetch the BLS strata to `docs/sources/k2/bls-cpi-food-at-home.md` (URL + fetch date on line 1). Reuse: it extends the probe, with no new script.
- **Files:** `server/scripts/listMatchProbe.js`, `docs/coverage/universe.json`, `server/scripts/compileGapBacklog.js`, `docs/sources/k2/`.
- **Done means:**
  - Given the universe file, when the probe runs, then it prints one line per section and a total, and exits 0 with 0 wrong.
  - Given the BLS archive, then every universe section maps to ≥1 stratum, and strata with no item are listed.
- **Out of scope:** card edits.
- **OK rough edges:** the weighted % may stay "unavailable" if BLS weights do not map cleanly.
- **Ship bar:** the probe's total differs from the hand tally above with no per-item diff.
- **Route:** split into two pieces.
  - Script: `dv T1` (fallback forge@sonnet [T1]); critic@sonnet.
  - Fetch: researcher@sonnet [T1] with Firecrawl/scrapling (bls.gov may 403; archive whatever loads, and say so).
- **Parallel-safe:** the two halves, yes.
- **Dial:** P2 (external unknown: BLS fetch).
- **Independent check:** `node server/scripts/listMatchProbe.js --universe docs/coverage/universe.json` is a re-runnable count.

**Builds 5–10.** Each build is two pieces, S (sources) then C (cards):

| Build | Subjects (≤17) | Demand basis |
| --- | --- | --- |
| B5 Broad + repairs | broad cards meat, seafood, dairy, bread; picks mushrooms, green beans, winter squash; aliases salmon fillets, pork chops, pineapple, kefir; fold cereal | "meat" ×2, salmon fillets, pineapple/cantaloupe weak |
| B6 Snacks & drinks | chips (+tortilla), salsa, crackers, cookies, popcorn, snack pretzels, candy+chocolate, snack bars, soda, diet soda, kombucha, sports drinks, energy drinks; broad snacks, drinks | doritos 5, salsa 5, oreos 4, diet soda 4, kombucha 3 |
| B7 Dairy & fermented | ultrafiltered milk, sour cream, cream cheese, cottage cheese, almond+soy milk, plant butter, fermented vegetables, ice cream; fold live_fermented | fairlife 5, fermented 1 |
| B8 Pantry staples | sugar, salt, cooking oils, vinegar, broth, pasta sauce, jam, ketchup+mustard, mayo, canned soup, hazelnut spread, maple syrup, baking soda/powder, tea, hot+soy sauce; broad condiments | nutella (fixture-inflated), BLS order |
| B9 Meat & seafood depth | ham, turkey bacon, cured pork, lamb+goat, jerky, meatballs, white fish, crab, scallops, lobster, smoked salmon, fish sticks; thinNotes 332/345 | goat, guanciale asks; thinNotes admit gaps |
| B10 Frozen, bakery, deli | frozen pizza, frozen meals, nuggets, waffles, fries, buns+rolls, english muffins, pita+naan, pastries, hummus, deli salads, prepared meals, fresh pasta; broad frozen, deli | BLS order |

Order is demand first. B9's thinNote edit to `server/lib/perimeter.js` (lines 332 and 345, verbatim below) is its own T1 piece after B9-C.

**S (sources), per build.**
- **What:** archive under `docs/sources/build<n>/`, URL + fetch date on line 1, verbatim quotes.
- **Where to fetch:** Firecrawl/scrapling. `.gov` returns 403 from this box, so federal text comes from govinfo.gov or law.cornell.edu. Standard-of-identity section numbers are fetched, never recalled.
- **Done means:** Given each subject, then ≥2 archived sources, ≥1 regulatory or extension source.
- **Ship bar:** a subject with <2 sources goes to the build's open list, not into C.
- **Route:** researcher@sonnet [T1], mirroring `ec71c7f`. Network-bound; Codex sandbox egress failed on 2026-10-06.
- **Parallel-safe:** yes, with the previous build's C (disjoint dirs).

**C (cards), per build.**
- **Files:** `server/kristy_perimeter_kb.json`, `docs/do-lines-review.md`, `server/lib/doLines.json` (via `scripts/buildDoLines.js`), plus `server/test/acceptance/k2-b<n>.test.js` (not owned).
- **Done means:**
  - Given each subject's bare noun as a list row, when `matchItemToCard` (or `matchItemToPick`) runs, then it returns the build's intended id.
  - Given each of 3+ `asked_as`, when `/perimeter/ask` scoring runs, then the card is top.
  - Given each pre-existing probe row, then its match is unchanged (0 wrong).
  - Given every `sources` URL, then `grep -F` finds it on line 1 of a file in `docs/sources/build<n>/`.
  - Given `counterCardLint`, then 0 errors.
- **Out of scope:** migration, new categories, iOS.
- **OK rough edges:** `tier_note` gaps where `TIER_NOTE_ORPHANED` is a known gap; `watch_out` empty where the archive holds none (listed in the report).
- **Ship bar:** any NN2/3/6/8/9 breach; any steal (a prior probe row moves); any uncited URL; a broad card owning a ≤2-word alias.
- **Route:** `dv T2` → `dv build .pipeline/specs/K2-B<n>.md` (Codex Sol high; fallback forge@opus [T2]); critic@opus with `FIDELITY required`. This is build 4's route; claim-locked prose needs an Opus critic across vendors.
- **Parallel-safe:** no; every C owns the KB, so builds run serially.
- **Dial:** P1. Every claim is checkable against the archive.
- **Independent check:** `grep -F` of each cited URL against the archive (build 4: 37/37), plus the probe's coverage delta per section.

**Verification per C (verbatim):**

```
cd server && npm test                                   → (prior count + new acceptance tests) pass, 0 fail
node server/scripts/listMatchProbe.js                   → 0 wrong
cd server && node scripts/migrateCounterCards.js --dry-run  → cards = prior + this build's cards; every sentence placed
cd server && node --test test/counterReach.test.js test/counterFloor.test.js → 0 fail
node server/scripts/listMatchProbe.js --universe docs/coverage/universe.json → section covered counts rise by this build's subjects
node server/scripts/commitGuard.js                      → clean
```

**Dispatch (C, after approval).** The planner writes `.pipeline/specs/K2-B<n>.md` from `templates/spec.md`, with ANCHORs from scout 5 and the acceptance block verbatim. Then:
1. `dv check .pipeline/specs/K2-B<n>.md` → PASS.
2. `dv route T2 --plan docs/plans/K2-COVERAGE-PLAN.md`.
3. codex → `dv build .pipeline/specs/K2-B<n>.md` in the background, then `dv ask --role critic` naming the runId, the spec and `FIDELITY required`.
4. claude → forge@opus [T2], `SPEC .pipeline/specs/K2-B<n>.md`. Report ≤30 lines.

**Dispatch (B9 thinNote).** forge@sonnet [T1].
ANCHOR server/lib/perimeter.js:330
```
      { q: 'Is this one any good?', id: 'judging_meat_at_the_case' },
    ],
    thinNote: 'Beef, chicken, pork and the deli case. Lamb, goat and game are not covered yet.',
```
ANCHOR server/lib/perimeter.js:343
```
      { q: 'Is it fresh?', id: 'fish_freshness_at_counter' },
    ],
    thinNote: 'Salmon, tuna, shrimp, sardines, the frozen case and the seals. Crab, lobster and the shellfish bar are not covered yet.',
```
Change: rewrite each thinNote to name only what is still uncovered after B9, or set it to `null` if nothing is. Verify: `cd server && npm test` → 0 fail. Report ≤30 lines.

**Final piece.** Re-run the universe probe. **Done means** ≥146/153 and 0 wrong. Below that, the residue becomes the next plan's first pieces. Route: main (T0; it runs a command and reads the count).

## What broken looks like

- "ground beef", "lunch meat" or "fish sauce" lands on a broad card.
- "chocolate chips" lands on chips; "olive oil" moves off `olive_oil_grades`.
- "pretzels" flips between the snack and bread cards.
- A snack, soda or spread card drifts into a bodily effect ("linked to", "spikes", "causes").
- A card names a brand to criticise, or compares cost in money.
- The coverage count rises while real (non-fixture) misses in `counter_gaps` stay flat after migration.
- A dish soap row starts drawing a card or a do line.

## Risks

1. **Short-alias collisions grow with center store** (chips, sauce, oil, milk, bread, fish, tea). *Early check:* each B-C acceptance file carries a collision list of the longer phrases containing each new noun, asserting they keep their current match. This is run in B5 first, on the four broad cards.
2. **Thin sources for snacks and condiments.** The standards of identity in 21 CFR (law.cornell.edu) cover many of them, but not all. *Early check:* S runs before C, and a subject with <2 sources leaves the build rather than shipping on thin ground.

## Open questions (Devon only)

1. **Sections.** Keep six and file snacks, drinks, frozen and bakery under Pantry (★), or add new sections, which costs iOS work and plates?
2. **Brand words as aliases** ("doritos", "oreos", "nutella", "fairlife") mapped to generic cards. Card text never names them. Allowed?
3. **Broad-card routing.** Text-only for K2 (★), or an additive tappable route field plus an iOS piece later?
4. **Test traffic.** Should UI-test and probe traffic stop writing production `counter_gaps` (a server change), or keep filtering in `compileGapBacklog`?
5. **Edges.** Energy drinks and baby food in or out? Recommend energy drinks in, label-only, and baby food out.
