# Shop-mode dial: plan (for Devon's approval, 2026-10-25)
Source: `SHOP-DIAL-BRIEF.md` (Devon 2026-10-25). Binding: CLAUDE.md non-negotiables, `FAMILY-CASCADE-PROPOSAL.md` (split B stands), `FAMILIES.md`, `BUILD-SPEC.md`. Nothing is built until this is approved.

**Problem:** at the shelf a shopper gets long, hedged family cards and the same "local, in season, no sprays" line on every produce card. No store prints "not sprayed", so the step can't be acted on. **Need:** one short family card that says what to look for, read or ask; one line per item for what makes that item different; then pick and move on.

## Scout first (admin-run; ANCHORs come only from VERIFIED lines)
1. `dv ask --role scout "Did the run-ios-cascade build land? Which files render the family sheet and the member delta? Does the sheet draw why/watch_out/shopper_questions/season_storage rows when those keys are absent?" --cd ~/kristy-ios`
2. `dv scout "Is supabase/counter_cards_family_delta.sql applied (real select)? Is 7f09ea2 on origin/main, origin/held, or local only?" --terms family delta`
3. `dv scout "mergeFamilyBuild.js: which glob does it read, does it have --check, and which fields does applyCardPatches FIELDS allow on existing cards (decision, short_answer, pick_steps, buying_tips)?" --terms FIELDS mergeFamilyBuild`
4. `dv scout "Where do RETIRED/RETIRED_GENERATED live, which test pins a fold, and what does cardForItem return for a retired perimeterId?" --terms RETIRED cardForItem`
5. `dv scout "List every KB card id by category that is not in docs/research/deepen/groups.json (e.g. cucumbers, herbs, chard, celery, microgreens, sausage)." --terms entries`
6. "Which test file is the best example for a pure lib + node:test? Is there already a shared-sentence check (lintCorpus do-line repetition) that dialRules can reuse?" --terms lintCorpus

## 1. Measured state (grep counts on `server/kristy_perimeter_kb.json` at 5036e1a; lengths are read estimates, not run)
| Fact | Value |
| --- | --- |
| Family / aisle entries | 55 `fam_` + 12 `aisle_` = 67 |
| Member cards with `family` / with `delta` | 130 / 111 |
| Card `decision` (free headline) saying "grown without sprays" | 19 (every produce item, herbs, chard, celery, microgreens, roots, plus 3 hub cards) |
| KB lines with no-pesticide / no-sprays / unsprayed / "pesticide sprays" | 27 (15 in `build/produce.json`: every produce family's `why` and first `buying_tips`) |
| KB lines with hedges ("does not establish", "not a health ranking", "editorial preference") | 129 |
| `fam_finish_at_home`, read estimate | ~1,750 chars over 6 fields: 6 tips, 4 watch-outs, 3 questions, 7 sources |
| Banana member, read estimate | `delta` 190 chars; produce deltas run 190-330 chars (lint cap 400, `counterCardLint.js:1021`); FAMILIES.md proposed ≤12 words |
Re-run before P1 (admin): `node -e 'const k=require("./server/kristy_perimeter_kb.json").entries,L=e=>JSON.stringify([e.decision,e.why,e.buying_tips,e.watch_out,e.shopper_questions,e.season_storage]).length,f=k.filter(e=>e.kind==="family"),d=k.filter(e=>e.delta);console.log({famAvg:Math.round(f.reduce((s,e)=>s+L(e),0)/f.length),deltaAvg:Math.round(d.reduce((s,e)=>s+e.delta.length,0)/d.length),spray:k.filter(e=>/without sprays|no sprays|unsprayed|no[- ]pesticide/i.test(JSON.stringify(e))).length})'`

## 2. The new model
- **Aisle (12, free):** stays as it is; at most 3 lines.
- **Family card, slim, stated once:** `decision` ≤90 chars [PLACEHOLDER], free. `buying_tips` holds the shelf steps: 3-4 of them, each ≤90 chars [PLACEHOLDER], each starting with Look for / Read / Check / Pick / Skip / Ask (Ask only on staffed meat and fish counters), and each naming something printed or visible: a seal, sticker, PLU, origin label, ingredient line, or a trait you can see or feel. `why` is optional, one sentence. `watch_out`, `shopper_questions` and `season_storage` are dropped (absent keys). Sources ≤3. Split B paywall unchanged; shop mode is members-only anyway.
- **Item delta:** only what sets the item apart (season months, wax, ripeness cue, cut, species). ≤120 chars [PLACEHOLDER], ≤2 clauses. Never a family step or a sentence shared with another item. Devon's bar: apples = "No wax; in season Aug-Nov."
- **Item headline (`decision`):** the item's top rung as the shelf shows it. No "grown without sprays".
- **Shelf language replaces "no sprays".** Seals a shopper can actually see: USDA Organic, Certified Naturally Grown, Real Organic, Regenerative Organic Certified, Demeter, AGA/PCO grassfed, pasture-raised seals, the origin sticker. Research confirms each one, including whether PLU codes are reliable.
- **GROUP card.** Comparables:
  - A, today: combined cards already exist (`produce_apples_pears`, `produce_stone_fruit`).
  - **B (Recommended):** a group is an ordinary card. Its id is ordinary (not `grp_`, because `kindFor` reads ids); its aliases and asked_as are the union of the members'; it carries a `family` and a `delta`. Member cards are folded into it with the existing fold path (RETIRED + move aliases + delete row). No new field, no SQL, no iOS change; `verdictEngine.js` untouched (NN5). Membership rule: identical shelf steps; at most one member line inside the group delta.
  - C: add a `group_items` text[] column plus iOS chips. Deferred until B shows the need.
- **What iOS must change:** depends on scout Q1. If the family sheet draws only the keys present, nothing. Otherwise P5: render `buying_tips` as "At the shelf" steps, hide absent depth rows, keep the delta to one line under the headline.
- **Raw milk / raw cheese / organ blend:** written as what to look for or ask for where it is legally sold (named farm, test date, raw-milk wording, aged ≥60 days on the label; "100% grass-fed and grass-finished", organ blend with liver and heart). No outcome claims. Brands avoided by trait, never named.

## 3. Pieces
**P1 Dial rules (server)**: one check used three times: by the research batches as a self-check, by the merge, and by the corpus test.
- Owns: `server/lib/dialRules.js` [new-file], `server/lib/dialRules.test.js` [new-file]. Reuses the norm/repetition helpers in `counterCardLint.js:1036-1039` by import (no edit).
- Done means:
  - Given an entry whose decision, delta, buying_tips, pick_steps or short_answer contains "grown without sprays" or a pattern from the ban list, when `dialFindings([e])` runs, then it returns `DIAL_UNLEGIBLE` [test].
  - Given a family with 5 tips, a tip over 90 chars, or a tip not starting with an allowed verb, then `DIAL_FAMILY_SHAPE` [test].
  - Given a delta over 120 chars, a delta containing a family tip, or one sentence in two deltas, then `DIAL_DELTA` / `DIAL_REPEAT` [test].
  - Given a hedge phrase in decision, a tip or a delta, then `DIAL_HEDGE` [test]. Hedges stay allowed in detail, science and watch_out.
  - `node server/lib/dialRules.js <file.json>` prints its findings and exits 1 when there are any.
- Out of scope: wiring into the corpus test (P4). OK rough edges: the verb list is plain prefix matching. Ship bar: the current KB yields ≥19 `DIAL_UNLEGIBLE` (proves it bites); the suite is otherwise unchanged.
- Route: dv T2 (fallback forge@opus). Branchy text rules. Critic: critic@opus. Parallel-safe: yes. Dial P1. Independent check: the count on the current KB matches the spray grep above.

**P2 Research + authoring, 9 batches**: each batch answers "What does the healthiest <item> in a grocery store look like?" and writes `docs/research/deepen/dial/<batch>.json` in the build shape (`{families, aisles, patches:{id:{decision,delta,family}}, groups:[{id,title,members,why_same}]}`) plus `dial/<batch>-sources.tsv`.
| Batch | Items (prior run sizes, ~20-25) | Batch | Items |
| --- | --- | --- | --- |
| produce-a | fruit, ~17 | grains | oats, grains, rice, flour, bread ×9, pasta, tortillas, cereal, cornmeal |
| produce-b | veg, herbs, roots, mushrooms, ~20 | bulk | nuts, seeds, trail mix, beans, peas, dried fruit, spices, herbs, tea, coffee, cocoa, salt, sweeteners |
| meat | beef, poultry, eggs, counter, organs, pork, deli, 27 | pantry-a | oils, fats, condiments, sauces, ferments, vinegar |
| seafood | 17 | pantry-b | snacks, frozen, deli prepared, broth, soup, drinks |
| dairy | 21 (raw milk, raw cheese at full strength, legally framed) | | |
- Per item: top rung as seen on the shelf; close second; the trait to skip; season months (produce, seafood); same-steps-as, for groups. ≥2 holistic sources (WAPF, Real Milk, Eatwild, AGA/PCO and Real Organic standards pages, Cornucopia criteria, small farms). Government sources are raw fact only, via law.cornell.edu and govinfo (.gov returns 403). Fetch with scrapling/Firecrawl.
- Displaces: the 19 label-term cards and about 15 hub/navigation cards get no research, only a ban-list sweep in the batch that owns their aisle.
- Done means: Given a batch file, when `node server/lib/dialRules.js` and `bash docs/research/deepen/urlcheck.sh` run, then 0 findings, every URL returns 200, and each cited fact string is found verbatim in the fetched page.
- Out of scope: KB edits. OK rough edges: some items keep the old `short_answer`/`detail` until card review. Ship bar: any claim-lock, price, first-person or named-brand hit, or any invented URL.
- Route: codex exec, Sol high, prompt `dial/run-<batch>.md` [T2]. Review: critic@opus per batch. Fallback: docs@sonnet. Parallel-safe: yes, 2 at a time (disjoint files). Dial P1. Independent check: urlcheck.tsv rows = cited URLs.
- Cost: 9 Codex research runs against the ChatGPT $100 limits plus 9 Opus reviews on Max 5x. That is about the size of the last deepen pass.

**P3 Merge**: point `mergeFamilyBuild.js` at `dial/*.json` (old `build/*.json` move to `build/_v1/`), apply it to the KB, and drop the family fields left over from the old shape.
- Owns: `server/scripts/mergeFamilyBuild.js`, `server/kristy_perimeter_kb.json`.
- Done means: Given the 9 batch files, when the merge runs twice, then the second run is byte-identical (idempotent) [test], `dialFindings(KB)` = 0, and `cd server && npm test` passes.
- Route: dv T2 (fallback forge@opus). Parallel-safe: no. Dial P1. Independent check: the spray grep returns 0 and `"family": "fam_"` count ≥130.

**P4 Group folds + corpus wire**: fold the members approved in P2's `groups` into their group cards and add `dialFindings` to `counterCardLint.test.js`.
- Owns: the RETIRED file (scout Q4), `server/lib/counterCardLint.test.js`, KB group entries.
- Done means:
  - Given a member alias (e.g. "pears"), when `node server/scripts/listMatchProbe.js` runs, then it resolves to the group card [test].
  - `counterReach.test.js` and `counterFloor.test.js` pass.
  - Retired slugs are deleted on migration.
- Ship bar: a member alias resolves to nothing, or a counter reach regresses. Route: dv T2 (fallback forge@opus). Parallel-safe: no. Dial P1.

**P5 iOS slim render** (only if scout Q1 says it is needed). Owns the sheet and card files scout names. ui: true. No new screen and no new colour; paper tokens.
- Done means: Given `fam_finish_at_home` slim, when the sheet opens, then it shows the rule + ≤4 steps and no empty headers. Screenshot at 390pt.
- Route: dv T2 ui (Astra high; fallback forge@opus high). Critic: critic@opus with a screenshot. Parallel-safe: yes (other repo). Dial P1.

**P6 Tutorial (after the cards ship): recommended, minimal.** Three skippable cards on first launch: Scan, Counter + list, Shop mode (aisle → family steps → item). Each card renders a live `CounterCardView` with a fixture (Direction D: real app cards are the picture). No generated art. Shown once (flag), Skip on every card, no first person.
- Route: designer@opus brief at `.pipeline/design/tutorial.md` first, then dv T2 ui (fallback forge@opus high).
- Not a launch blocker: if it slips, TestFlight ships without it.

**P7 Review on Devon's phone**: TestFlight build. qa@sonnet does not apply (web only redirects). Findings become the next plan's first pieces.

## 4. Sequence
Code:
1. Scout Q1-Q6 + P1.
2. P2 in pairs, each reviewed as it lands.
3. P3, then P4, then P5 if needed.
4. TestFlight, then P7, then P6.

Ops, each on Devon's word:
- (a) apply `supabase/counter_cards_family_delta.sql`, if scout Q2 says it is unapplied, and read it back;
- (b) `node server/scripts/migrateCounterCards.js` from `server/`: dry-run diff first, then the real run; read back the post-upsert count (205 − folded + groups);
- (c) push `main` (Railway; family/aisle routes go live), then curl `GET /api/counter/aisles` and one `/families/:id`;
- (d) `bash ~/kristy-ios/Tools/testflight.sh`, then commit and push kristy-ios.
Every report states both: code committed/pushed, and corpus migrated or not.

**What broken looks like:**
- A produce card still says "no sprays".
- A family sheet longer than one phone screen.
- Two items with the same delta sentence.
- "pears" finds nothing.
- Raw milk worded as a health outcome.
- iOS showing empty "Questions" headers.

**Risks:**
1. Invented sources (9/10 wrong before). Early check: urlcheck + verbatim-quote grep on the first batch, before the second pair starts.
2. Slimming strips accuracy (NN7) or tips into claims. Early check: critic@opus on produce-a and dairy first, against the claim lock, before the other 7 batches run.
