# Pilot → product: build plan (for Devon's approval, 2026-10-26)
Binding: CLAUDE.md non-negotiables, `pilot/RULINGS.md` (0 supersedes 1-2), `SHELF-BRIEF.md`, `SHOP-DIAL-PLAN.md`, `FAMILY-CASCADE-PROPOSAL.md` (split B). Nothing is built, migrated or pushed until approved.

**Problem:** the four pilot tables (224 rows: produce 61, frozen 28, meat/seafood/eggs 49, dairy/pantry 86) hold the per-item verdict + one shelf cue Devon asked for, but no shopper sees them: the KB, `counter_cards` and the app still show the older headlines and do lines. **Need:** each item's verdict and cue on the card or list row a shopper opens, with nothing unsourced shipped.
**Intent:** a shopper at the bin opens "pears" and reads *Organic* plus the one thing to check on a pear ("Press the narrow neck by the stem, which should give slightly."), not a line shared with apples.
**Non-goals:** retiring the family text layer (memory note); new `counter_cards` columns; any `verdictEngine.js` edit (NN5); `client/src`; the 143 KB ids the tables skip (REVIEW §3); the tutorial; `frozen_angle` as a rendered field.

## Scout first (admin-run; ANCHORs only from VERIFIED lines; nothing dispatches before these return)
1. `dv scout "Has mergeFamilyBuild.js run on dial/shelf-*.json? Does 'node server/scripts/mergeFamilyBuild.js --check' pass on main today, and is the KB byte-identical to its output?" --terms mergeFamilyBuild rank`
2. `dv scout "In shop mode and on a list row, which entry's text renders for an item: the pick decision/avoid, or the card headline+do+delta? When a pick and a card share an alias, which does listMatch.js resolve first? Does counter retrieval ever match picks?" --terms cardForItem listMatch isPick`
3. `dv scout "PICK_FORBIDDEN_FIELDS and the pick word cap: may a pick carry why, watch_out or sources? Which fields does applyCardPatches FIELDS allow on existing cards (decision, why, watch_out, sources)? What field holds the aisle rule sentence?" --terms PICK_FORBIDDEN_FIELDS FIELDS aisleEntries`
4. `dv scout "Does cardToRow emit family/delta columns, and is supabase/counter_cards_family_delta.sql applied (real select, not head:true)?" --terms cardToRow family delta`
5. `dv scout "Which lint/test enforces, on decision, why, do line and pick decision: claim lock, CLAIM_TREATMENT, _PRICE, _FIRST_PERSON? Is there any named-brand check anywhere in server/lib? Does urlcheck.sh verify quote text or only HTTP status?" --terms claimLockViolations CLAIM_TREATMENT hasFirstPerson`
6. "Best example to mirror: a dial batch with `patches` (shelf-produce.json), a pick entry (pick_cucumbers), a merge test (mergeFamilyBuild.test.js). Does anything already convert pilot TSVs to build JSON?" (expected: no; if yes, P2 extends it).
Admin also runs, unasked: `for f in docs/research/deepen/pilot/*-v[0-9].tsv docs/research/deepen/pilot/frozen-table-v2.tsv; do node server/lib/cueRules.js "$f" | tail -1; done` and `cd server && npm test` (record the count, branch, date).

## 1. Field mapping (no new schema, no SQL, NN5 untouched)
| Pilot column | Card (row id is a KB question card, 1:1) | Pick (per-item row; existing or new `kind:'pick'`) | Aisle |
| --- | --- | --- | --- |
| verdict | `decision` (headline, ≤14 words) leads with the verdict's shelf form: Organic → "Organic …"; Either → top rung, no organic word; Skip → names what to buy, `instead` set | `decision` one sentence opens with the verdict form | — |
| cue | the do line: `docs/do-lines-review.md` → `scripts/buildDoLines.js` → `server/lib/doLines.json` (imperative, ≤14 words; migrate blocks >14). Old do line, if still a distinct visible check, moves to `pick_steps` (demoted, not deleted) | same `decision` sentence, after the verdict; a Skip-shaped cue goes to `avoid`. No digits (pick lint) | — |
| why_tap | `why` (free since 2026-10-24) | `why` only if scout 3 allows; else stays in the TSV, not shipped | — |
| home_step (4 rows) | `watch_out[0]` | dropped unless allowed | — |
| frozen_angle / recommend | headline wording only (`preferred_over_fresh` → "Frozen … over fresh") | same | — |
| source_id | `sources` `{name,url}` appended, deduped by url | `sources` | — |
| `# premise` line | — | — | the aisle rule field (scout 3); two pilot premises on one KB aisle (meat+eggs; oils/sweeteners/nuts/canned → `aisle_pantry_bulk`) become one sentence; `checks` unchanged |
Routing of ids: meat/seafood/eggs/dairy/pantry ids are KB ids (1:1 cards or picks). Remap, never duplicate: `p_bottled_water→bottled_water_buying`, `p_kombucha→kombucha`, `p_coconut_water→coconut_water`, `p_juice→pick_juice`, `p_soda→pick_soda`, `soy_sauce→hot_soy_sauce`, `bagels_buns→bagels` (author confirms each against the KB). Produce `f_*` and frozen slugs: a row whose nearest KB entry is a single-item card/pick patches it; a row sharing a multi-item card (apples+pears, roots ×5, brassicas ×4, berries ×4, melons ×3, frozen_vs_fresh_produce ×~25) or with no KB entry (leeks, rhubarb, kiwi, pomegranate) becomes a new pick (Q1). Cards keep their aliases; a pick gets one longer specific alias where a short one would steal (hub-steal rule).
**iOS:** `CounterCardView.swift` already renders headline → tier → instead → do → delta → pick_steps → why; `CounterModels.swift` already decodes every field above. **No iOS change** unless scout 2 shows picks do not reach a shop/list row; then a P5 code piece is added and re-planned.

## 2. UNSOURCED and HIGHLIGHT-only rows
- Counts: REVIEW.md says 9 UNSOURCED / 36 HIGHLIGHT, but a2282dc added 4 unsourced plant milks (`goat_sheep_dairy`, `oat_milk`, `almond_milk`, `soy_milk`, `coconut_milk_beverage` all `?`): **13 UNSOURCED** today. Frozen's 28 are UNFLAGGED (depth never checked).
- Rule: **fix or hold.** One research pass per row (scrapling `fetch`/`stealthy_fetch`; Firecrawl 429s; .gov via law.cornell.edu/govinfo only as raw fact). Holistic sources judge (WAPF, Real Milk, Cornucopia, Real Organic, AGA, Certified Humane, AWA, Seafood Watch, extension ripeness guides). Each quote must appear verbatim in the fetched page. Row FETCHED → ships; still UNSOURCED/HIGHLIGHT → **held**: it is left out of the pilot build JSON and today's KB text stands. Never cited from memory.
- Same pass rewords any `why_tap` that gives a government source as the reason (e.g. MedlinePlus "worth buying organic" on grapes/peaches; RULINGS 4).

## 3. Pieces
**P1a Research: meat/seafood/eggs** (5 UNSOURCED + 14 HIGHLIGHT). Owns `pilot/meat-seafood-eggs-v1.tsv`, `pilot/meat-seafood-eggs-v1-sources.tsv`.
- Done means: Given the 19 rows, when the pass ends, then each row is FETCHED with a verbatim quote or marked `HOLD` in a `status` column [check]; `node server/lib/cueRules.js pilot/meat-seafood-eggs-v1.tsv` → `0 findings`; `bash docs/research/deepen/urlcheck.sh` → every cited URL 200.
- Out of scope: KB edits. OK rough: some rows held. Ship bar: an invented URL, a quote not on its page, a gov source used as the reason.
- Route: codex exec Sol high [T2] (prompt mirrors `dial/run-common.md`), critic@opus; fallback docs@sonnet. ui: no. Parallel-safe: yes, with P1b. Dial P1. Independent check: grep each quote against the scrapling-saved page; count of `?` in `source_id` = 0 or `HOLD`.
**P1b Research: dairy/pantry** (8 UNSOURCED + 22 HIGHLIGHT). Owns `pilot/dairy-pantry-v1.tsv`, `pilot/dairy-pantry-v1-sources.tsv`. Same alignment block and route as P1a. Parallel-safe: yes, with P1a.
**P1c Frozen depth + produce gov rewording.** Owns `pilot/frozen-sources-v2.tsv`, `pilot/produce-fresh-v3.tsv`. Done means: every frozen source id carries a FETCHED/HIGHLIGHT flag line; `grep -c MedlinePlus pilot/produce-fresh-v3.tsv` in `why_tap` reasons → 0; cueRules → `0 findings` on both tables. Route: codex exec Sol high [T2], critic@opus. ui: no. Parallel-safe: no (runs after P1a/P1b; max 2 at once). Dial P1.
**P2 Merge accepts picks** (code). Owns `server/scripts/mergeFamilyBuild.js`, `server/scripts/mergeFamilyBuild.test.js`.
- Change: the `[['families','family'],['aisles','aisle']]` loop gains `['picks','pick']` (create or field-merge, kind fixed); file rank `pilot-*` = 3, above `shelf-*`; top-level `do_lines` key ignored by the merge.
- Done means: Given a build with `picks:[{id:'pick_x',kind:'pick',…}]`, when merged, then the KB holds that pick and lint ran on it [test]; Given a `pilot-a.json` and `shelf-a.json` patching the same field, then pilot wins [test]; Given a pick whose `kind` is `card`, then it throws [test]; second merge run byte-identical [test].
- Out of scope: running the merge on the real KB. Ship bar: suite count drops or an existing merge test changes. Route: dv T2 (fallback forge@opus); critic@opus. ui: no. Parallel-safe: yes (runs beside P1a). Dial P1. Independent check: `cd server && node --test scripts/mergeFamilyBuild.test.js` fails on main before the change.
**P3a Author pilot build: produce + frozen.** Owns `docs/research/deepen/dial/pilot-produce.json` [new-file]: `{families:[], aisles:[premise patches], picks:[…], patches:{…}, do_lines:{id:cue}}`, FETCHED rows only, mapped per §1.
- Done means: `node server/lib/dialRules.js dial/pilot-produce.json` → `0 findings`; `node server/scripts/mergeFamilyBuild.js --check` → `… merged and linted`; every shipped row id appears once; every held row absent [check].
- Ship bar: two items sharing a decision/do sentence; a cue lost in mapping; a claim, price, first person or brand. Route: codex exec Sol high [T2], critic@opus. ui: no. Parallel-safe: yes, with P3b. Dial P1. Depends: P1c, P2.
**P3b Author pilot build: meat/seafood/eggs/dairy/pantry.** Owns `dial/pilot-packaged.json` [new-file]. Same block; adds the id remaps in §1. Depends: P1a, P1b, P2. Parallel-safe: yes, with P3a.
**P4 Apply.** Owns `server/kristy_perimeter_kb.json`, `docs/do-lines-review.md`, `server/lib/doLines.json`.
- Change: run the merge; copy `do_lines` into the review table rows; `node server/scripts/buildDoLines.js`.
- Done means: merge run twice → second `git diff --stat` empty; `cd server && npm test` = baseline + P2 tests, 0 fail; `node server/scripts/listMatchProbe.js` 0 wrong; `cd server && node scripts/migrateCounterCards.js --dry-run` → `every authored sentence is placed. ✓`, 205 cards (picks never migrate); question-card count unchanged; pick count = 38 + new picks in P3 [check]; `node server/scripts/commitGuard.js` clean.
- Ship bar: any red test, an unplaced sentence, a probe miss on a pilot alias. Route: dv T1 (fallback forge@sonnet), critic@sonnet. ui: no. Parallel-safe: no. Dial P1. Lint red → back to P3 author, never hand-edit the KB.
**P5 Render proof** (ui: true, no code, no new asset). Simulator against local server: screenshots of `f_pears` row, `whole_vs_reduced_fat_milk`, `pick_margarine`, one frozen pick, at 390pt. Route: forge@sonnet [T1], critic@opus with screenshots. One simulator only (8 GB box); no UI-suite run.
Dispatch prompts and `.pipeline/specs/*.md` are written after Scout first returns (this turn's only Write is this file).

## 4. Hard checks: what enforces each
| Rule | Enforced by | Gap |
| --- | --- | --- |
| Claim lock (NN2) | `claimLockViolations` (`counterClaimLock.js`) via `lintCard`/`lintCorpus` inside `mergeFamilyBuild` and `counterCardLint.test.js`; `CLAIM_FALSE_MECHANISM` | scout 5 confirms coverage of `why` |
| No-treatment (NN3) | `CLAIM_TREATMENT` (`counterCardLint.js:1618`) | field coverage unknown (scout 5); critic@opus reads every `why` |
| No price (NN8) | `cueRules` `BANNED_EXTRA` on cues; `_PRICE` (`counterCardLint.js:1082`) on copy | card `decision` coverage per scout 5 |
| No first person (NN6) | `cueRules` (I/my); pick `_FIRST_PERSON` (`:888`); `KT_FIRST_PERSON` | "we/our" on cards per scout 5 |
| Brand neutrality (NN9) | none located | critic@opus line read; certifier seals (AGA, MSC, ASC, AWA, Certified Humane) are not brands |
| Shelf-legible wording | `dialRules` `DIAL_VAGUE`/`DIAL_UNLEGIBLE`/`DIAL_HEDGE`; `cueRules` length/generic/duplicate | — |

## 5. Ops (each on Devon's word; every report states code committed/pushed AND corpus migrated/not)
1. Commit on `main`; push `main:held` as backup (`git -c credential.helper='!gh auth git-credential' push origin main:held`, prove via `ls-remote` + remote file diff). **On Devon's word.**
2. SQL: apply `supabase/counter_cards_family_delta.sql` only if scout 4 says unapplied AND `cardToRow` emits those columns; read back with a real select. **On Devon's word.**
3. `cd server && node scripts/migrateCounterCards.js --dry-run` (no credentials): 0 blocking. Runs without asking.
4. Real migrate `cd server && set -a; . ./.env; node scripts/migrateCounterCards.js`; read back 206 rows (205 curated + 1 generated). **On Devon's word.**
5. Push `main` (Railway; picks and aisle rules are served from the KB, so they go live only here); curl `GET /api/counter/aisles` and one list match. **On Devon's word.**
6. TestFlight: not needed with no iOS change; a server push reaches the current build. If P5 code is added: `bash ~/kristy-ios/Tools/testflight.sh`. **On Devon's word.**

## 6. Alignment
| Devon gets | Broken looks like |
| --- | --- |
| Pears and apples each show their own verdict + cue | "pears" finds nothing, or shows the apple cue |
| Every shipped line traces to a fetched holistic source | a held row's text appears live; a quote not on its page |
| Do line = the item cue, free | two cards share a do line; a card loses its old visible check entirely |
| Aisle premise as one sentence | aisle shows two stacked premises, or 0/6 checks |
| Corpus count unchanged (206) | migration count moves without a fold |
Risks: (1) picks not rendering in shop mode (scout 2 catches it before P3); (2) authors invent sources (verbatim-quote grep on P1a before P1b's review).

## Open questions (default applies if Devon says nothing)
1. Multi-item produce/frozen rows: **new picks (Recommended; no corpus growth, no do-line review, ships via push)** vs split into ~50 new cards (counter-findable per item; needs asked_as ×3, do lines, folds).
2. Cue → **do line (Recommended; free, one action)** vs `pick_steps[0]` (free, second action on the card) vs `delta` (paid on the counter since 2026-10-24).
3. REVIEW §5 contradictions (margarine Skip vs today's plant butter; veal; dairy standard grass-fed → organic): **adopt the pilot verdict; grass-fed stays named as the next rung in `why`.**
4. Coffee/tea vs WAPF D036 avoid: **hold both rows; today's Organic text stands until Devon rules.**
5. HIGHLIGHT rows that stay HIGHLIGHT after one fetch: **hold (Recommended)** vs ship on excerpt.
