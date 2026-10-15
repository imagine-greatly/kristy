# ca-3a — Meat batch A: Beef front, Ground beef worked example + organ-blend fold, beef family fronts

```json
{
  "id": "ca-3a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCards.js",
    "server/lib/counterCardLint.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js",
    "server/test/ktight.test.js",
    "server/test/acceptance/k9.test.js",
    "server/test/acceptance/k15.test.js",
    "server/test/acceptance/ic5b.test.js",
    "server/test/acceptance/ca-3a.test.js"
  ],
  "read_full": [
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/ic5a.test.js",
    "docs/CARD-ALIGNMENT-PLAN.md",
    "docs/research/card-align-sources.md",
    "docs/research/meat-sources.md"
  ],
  "verify": "node --test server/test/acceptance/ca-3a.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T2 (fallback forge@opus [T2]); critic@opus, FIDELITY required.
- P1. Parallel-safe: no (owns the KB, do lines and the meat test pins; ca-3b follows on top of this commit).
- Plan: `docs/CARD-ALIGNMENT-PLAN.md`, "CA-3 Meat batch", Inventory "Milestone 1, meat" (CA-3a rows), D1-D8, Accuracy gates A1/A3, the ground beef worked example, and the fold placement table. Scouts: `.pipeline/specs/ca-scouts.md` S2, S4, S5, S11.
- **Before dispatch:** the admin captures BEFORE with the independent check script below, at HEAD `8b49633`.
- **SPEC STATUS: PARTIAL.** Beef and Ground beef (with the full organ-blend fold) and all plumbing are fully written. Eight cards are marked `TODO: <id>` under Step 1c. The planner fills them before `dv check`. Until then the builder treats every TODO card as KEPT (byte-identical), and C6 is expected red for those ids. Do not dispatch a build while any TODO remains.

The fold exceeds 3 files on purpose (precedent chf-5 `e92e7c9`, plan line 319). After this batch, main re-anchors the k14 C12 passRule tripwire. Card commits say "Not migrated."

## Alignment block

- **Done means:**
  - **Ground beef (worked example).**
    - Given the KB after the build, when `ground_beef_lean_ratio` is read, then `decision`, `tier_note`, `instead`, `cart_pick`, `short_answer`, `why` and `pick_steps` equal the Step 1b strings byte for byte, and its do line equals "Read the label for organ names, each with a percentage beside it."
    - Every fold placement row holds (Step 1b table).
    - Its `labels_decoded` has no em-dash, and the 25 percent cheek-meat sentence is present.
  - **Fold.**
    - Given the KB, then `ground_beef_organ_blend` is absent and is listed in `RETIRED`.
    - Every alias, asked_as and source of the folded id is on `ground_beef_lean_ratio`.
    - TRY_POOL, OWNED_FACTS, ktight, k9, k15 and ic5b no longer name the retired id.
  - **Beef.**
    - Given the KB, then `beef_grassfed_vs_grainfed.decision` = "100% grass-fed or grass-finished, no added hormones, with a certifier’s seal."
    - Its `tier_note` holds the G1 gloss.
    - Its `cart_pick` = "100% grass-fed or grass-finished beef".
    - No beef field says ‘grass-fed’ allows a grain finish (gate A1 fallback).
  - **Family.**
    - Given every batch id other than beef, bison, venison_game and lamb_goat, then `decision` and `cart_pick` do not match `/grass-(fed|finished)/i`.
    - `butcher_counter_asking.cart_pick` = "Beef soup bones from the butcher counter".
  - **D1.** Given every batch card (not pick), then: decision ≤14 words; tier_note is one sentence of 5-20 words; instead is non-empty; pick_steps has 1-3 items.
  - **Section lints.** Given the CA-5 meat tip with both flags on, then for batch ids: L1 = 0, L4 = 0, L5 = 0, and no L2 group made only of batch ids.
  - **Greps.** Given the changed copy fields of batch ids, then the brand, claim-lock and price greps are 0.
- **Out of scope:**
  - Section tips (CA-5).
  - CA-3b ids (pork, chicken, turkey, cured meats).
  - Seafood.
  - The k14 C12 re-anchor (main does it after the critic).
  - Migration.
- **OK rough edges:**
  - An id left unchanged because it already meets D1 is reported KEPT.
  - Ground beef `detail` grows long (fold detail plus the science overflow).
  - Certifier program names (American Grassfed, Certified Grassfed by AGW) stay on Beef's do line and detail; they are seal names, not food brands (Open question 2).
- **Ship bar:**
  - An untraced claim, or a numbered fact missing.
  - An organ_blend field without a destination.
  - A cart_pick that prints a shared term, or reads as before after a rung change.
  - An ESSENTIALS id retired or reordered.
  - A shortcut or perimeterId pointing at a deleted id.
  - A safety line deleted.
  - An em-dash or straight quote in a changed copy field.
  - A first-person word.
- **Independent check:** `counts.mjs` below, BEFORE at `8b49633` and AFTER the build:
  - the word counts per batch id;
  - the meat L1/L2/L4/L5 hit lists going to 0 for batch ids;
  - `grep -c ground_beef_organ_blend` over the S5 reference files going from 9 to 0 (except RETIRED and comments);
  - each changed cart_pick through `matchItemToCard` reporting its own slug.

## Steps (the change, old → new)

### 1. `server/kristy_perimeter_kb.json`

Fields not named stay byte-identical. Curly quotes only (‘ ’ “ ”). No em-dash in any changed string.

#### 1a. `beef_grassfed_vs_grainfed` (R)

| field | old | new |
| --- | --- | --- |
| decision | 100% grass-fed and grass-finished. | 100% grass-fed or grass-finished, no added hormones, with a certifier’s seal. |
| why | ‘Grass-fed’ allows a grain finish at the end. ‘Grass-finished’ is the whole-food standard. | The whole-food standard is grass after weaning, no grain, and no feedlot. |
| short_answer | ‘Grass-fed’ is a floor, not a standard. Cattle can graze most of their lives, eat feedlot grain for the last months, and still be labeled grass-fed. ‘Grass-finished’ or ‘100% grass-fed’ covers the whole life. That one is worth paying for. | On a beef label, ‘grass-fed’ alone rests on the producer. FSIS reads ‘100% grass-fed’ as grass after weaning, no grain, and pasture access. A certifier’s seal is what audits it. That one is worth paying for. |
| tier_note | Grass-fed alone does not promise a grass finish, so the whole-life words decide. | On a beef label, “grass-fed” is the producer’s own word unless a certifier’s seal audits it. |
| cart_pick | Grass-finished ground beef | 100% grass-fed or grass-finished beef |
| buying_tips[1] | Ground and chuck are the cheapest way into a whole-life grass animal. | Ground and chuck are the lowest-cost way into a whole-life grass animal. |
| science | (current) | FSIS reads a ‘grass-fed’ claim as grass after weaning, no grain, and pasture access. USDA withdrew its grass-fed claim standard in 2016, so the bare claim rests on the producer and any seal. The fat profile follows the finish, not the start. A grass finish leaves a leaner animal that dries out at feedlot-beef heat. Ground and chuck are the lowest-cost way into a whole-life grass animal. |
| labels_decoded "Grass-fed".meaning | Ate grass at some point. May still have been grain-finished before slaughter. | The producer’s own word unless a certifier’s seal audits it. FSIS reads it as grass after weaning, no grain. |

The tier_note holds the G1 gloss string `“grass-fed” is the producer’s own word unless a certifier’s seal audits it` byte-equal to `CANONICAL_GLOSSES` G1 (counterCardLint.js:1624). Gate A1 fallback (CA-1), named.

Kept byte-identical, with reasons:
- instead: non-empty, ≤24 words.
- pick_steps (3).
- watch_out (4).
- detail.
- kristy_take.
- labels "Grain-fed / grain-finished".
- The do line `Look for a whole-life seal: American Grassfed, or Certified Grassfed by AGW.`

Word counts: decision 11; tier_note 16; why 12; short_answer 36 (sentences 10/13/7/6); science 68 (≤70).

#### 1b. `ground_beef_lean_ratio` (R, fold survivor) ← `ground_beef_organ_blend` (F)

Front, worked example verbatim (plan "Worked example: ground beef"):

| field | new (byte-exact) | words |
| --- | --- | --- |
| decision | Organ blend with each organ’s percentage first, then ground beef with nothing added. | 13 |
| tier_note | Organ blends grind beef liver or heart into the meat; printed percentages show how much of each. | 17 |
| instead | Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan. | 20 |
| cart_pick | Liver and heart beef blend, shares stated | 7 |
| do (doLines + review table) | Read the label for organ names, each with a percentage beside it. | 12 |
| pick_steps | ["How it was raised: see Beef.", "Organ blend: each organ named, each with its own percentage.", "Next: plain ground beef; skip “hamburger,” which allows added beef fat."] | 6/10/11 |
| why | Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. Organs are part of eating the whole animal, and a blend puts them in a familiar grind. | 14/19/17 |
| short_answer | Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. How the cattle were raised is on the Beef card. | 25 |

Additive fields ("+" = appended after the existing items, existing items stay byte-identical):
- **watch_out:** old 2 items, then the fold's 3 items verbatim, in fold order. The survivor has no handling lines, so the fold items go last. 5 items.
- **buying_tips +:** "The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name."
- **labels_decoded:**
  - The old `80/20, 85/15, 90/10` meaning becomes "Lean % to fat % by weight; higher first number = leaner." (em-dash → semicolon, words kept).
  - + `{"term": "Organ blend", "meaning": "Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’."}`
  - + `{"term": "Hamburger", "meaning": "Chopped beef that may have beef fat added; ‘ground beef’ may not."}`
  - + the fold's `Ground beef` and `Ancestral blend / primal blend` objects, verbatim.
- **kristy_take:** "The name is the check: ‘ground beef’ allows no added fat, water or binders, and ‘hamburger’ may add fat. A blend that prints its numbers is an honest pack. One that will not is a mystery bag."
- **detail:** the old detail, then, in this order:
  - (i) the old `short_answer` verbatim;
  - (ii) the old `why` verbatim;
  - (iii) the fold `detail` verbatim, except its brand sentence, which becomes: "Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart."
  - (iv) the fold science sentences not already present, verbatim: "A blend carries its own descriptive name and a full ingredient list." and "By NIH figures, 3 ounces of pan-fried beef liver holds more than twice the adult daily vitamin A upper intake." and "Producers print shares such as 8 percent organ, or 5 percent liver plus 3 percent heart."
  - **Fallback named:** fold-table science row, "science passes 70 words → detail +". The survivor science is 58 words.
- **science:** kept byte-identical.
- **aliases:** old 6, then the fold's 9 in fold order, deduped.
- **asked_as:** old 5, then the fold's 4.
- **sources:** old 2, then the fold's 5 verbatim (D1 exception; producer pages stay as citations, Q2).
- **title, evidence_tier (`established`), category, eyebrow_short, id:** kept.

Fold placement table (plan, verbatim intent; every row must hold):

| fold field | destination | form |
| --- | --- | --- |
| decision | front rung 1 + watch_out item 3 | both halves already said |
| why (name rule) | why sentence 2 | verbatim |
| short_answer | labels_decoded Ground beef (cheek meat), why sentence 2 (own name), pick_steps 2 (each a share) | placed |
| tier_note | why sentence 2 + pick_steps 2 | placed |
| instead | instead | verbatim |
| cart_pick | cart_pick | verbatim |
| buying_tips 1 / 2 / 3 | pick_steps 2 / buying_tips + / pick_steps 1 (POINTER already there) | placed / verbatim / present |
| watch_out 1–3 | watch_out + | verbatim |
| pick_steps 1 / 2 | pick_steps 2 / watch_out item 3 | rephrased / same sentence |
| science | detail + (fallback: science overflow) | verbatim |
| detail | detail + | verbatim except the D6 sentence above |
| labels_decoded (2) | labels_decoded | verbatim |
| kristy_take | kristy_take + | rephrased |
| sources (5) | sources + | verbatim |
| aliases, asked_as | aliases +, asked_as + | verbatim, deduped |
| id | RETIRED + delete | — |
| title, eyebrow_short, evidence_tier, category | not moved | survivor keeps its own |

The vitamin A number stays in detail (6,582 mcg RAE per 3 ounces vs adult UL 3,000 mcg). The grass-fed standard is not printed on this card. Then delete the `ground_beef_organ_blend` entry.

#### 1c. Remaining CA-3a cards

- **TODO: beef_cuts_basics.** Planned R:
  - Keep the decision (counterDecision.test.js:173 pins "Chuck" in the first 3 words).
  - Add `instead`.
  - Keep "prime/choice/select" in spoken fields (ic5a :88).
  - The "Certified Angus Beef is a brand" watch_out sentence: see Open question 1.
- **TODO: organ_meats.** Planned R:
  - Add `instead`.
  - No echo of tip check 2.
  - Keep the pregnancy → doctor safety line.
  - K15 id: no sources added.
- **TODO: butcher_counter_asking.**
  - `cart_pick` "Grass-finished beef soup bones" → "Beef soup bones from the butcher counter" (plan string; applies now).
  - Add `instead`.
  - No 5-gram echo of tip check 1.
- **TODO: judging_meat_at_the_case.** Planned R:
  - The front names something only the package shows.
  - The color/smell lines move (never reworded, ic5a C5) to the end of watch_out.
  - Re-pin ic5b :47.
  - Keep "Sell-by date" (ic5a :90).
- **TODO: bison, venison_game, lamb_goat.** Planned R: add `instead`, other fields as D1 requires. Safety lines (CWD) kept. K15 ids.
- **TODO: pick_soup_bones.** A pick with no cart_pick. The decision is the only candidate ("Soup bones come from the meat counter; ask for marrow or knuckle bones." [12]), or KEPT.

### 2. `docs/do-lines-review.md` → `server/lib/doLines.json`

- Delete row :41 (`ground_beef_organ_blend`).
- Row :43 (beef): the headline cell becomes the new beef decision; the do cell is unchanged.
- Row :45 (lean_ratio): the headline cell becomes the new decision; the do cell becomes `Read the label for organ names, each with a percentage beside it.`
- Rows for TODO cards change only when their decision changes.
- Leave :242 (historical notes row).
- Regenerate with `node server/scripts/buildDoLines.js`; commit both. ic5b C5 needs `reviewHeadline(id) === e.decision`.

### 3. `server/lib/counterCards.js`

Before `];` at :177, insert:
```
  // CA-3a (2026-10-15): → ground_beef_lean_ratio ("Ground beef"). Fold placement per docs/CARD-ALIGNMENT-PLAN.md; aliases, asked_as, sources, tips and labels moved.
  'ground_beef_organ_blend',
```
ESSENTIALS (:259-267) untouched.

### 4. `server/lib/counterCardLint.js`

:1550 `    ['ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics',` → `    ['ground_beef_lean_ratio', 'beef_cuts_basics',`. No other line changes.

### 5. `server/lib/tryPool.js` and `server/lib/tryPool.test.js`

- tryPool.js :5 `  'ground_beef_organ_blend',` → `  'ground_beef_lean_ratio',`. STOP BLOCKED if lean_ratio is already in the pool.
- tryPool.test.js :37 first id → `'ground_beef_lean_ratio'`; the count stays 19.

### 6. Test pins

- **ktight.test.js:**
  - :14 drop `'ground_beef_organ_blend', ` from B03.
  - :32 `B03: 11` → `B03: 10`.
  - :37 `182` → `181`.
  - :40 `181` → `180`.
- **k9.test.js:**
  - :18 drop `'ground_beef_organ_blend', `.
  - :20 `9` → `8`.
- **k15.test.js:42:** each `'ground_beef_organ_blend'` target → `'ground_beef_lean_ratio'`.
- **ic5b.test.js:**
  - :20 drop `'ground_beef_organ_blend', `.
  - :39 → `assert.equal(b.decision, '100% grass-fed or grass-finished, no added hormones, with a certifier’s seal.');`
  - :40 → `assert.ok(b.tier_note.includes('“grass-fed” is the producer’s own word unless a certifier’s seal audits it'));`
  - :87 → `const was = new Set([...urls(pre(id)), ...(id === 'ground_beef_lean_ratio' ? FOLD_URLS : [])]);`, with `const FOLD_URLS = [...]` (the 5 organ-blend source URLs, verbatim from the pre-build KB) declared after :26. These URLs moved; they are not new.
  - :47 is re-pinned only when judging's decision changes (TODO).

## Criteria

- C1 [test] Ground beef front equals the worked example: decision, tier_note, instead, cart_pick, short_answer, why, pick_steps and the do line, byte-exact.
- C2 [test] Ground beef additive fields:
  - the watch_out order (old 2 + fold 3);
  - buying_tips +;
  - the four new or kept labels, with no em-dash;
  - kristy_take;
  - detail holding the D6 sentence, "25 percent", "9 CFR 317.2", "6,582 mcg RAE", "3,000 mcg", and no producer names.
- C3 [test] The fold is complete: organ_blend absent and in RETIRED; its aliases, asked_as and sources are on lean_ratio; assertPassRule holds for every batch id vs `8b49633`.
- C4 [test] The Beef front: decision, G1 gloss in tier_note, cart_pick; why keeps "whole-food standard"; no "allows a grain finish" in why/short_answer/science/labels.
- C5 [test] Plan cart_picks: butcher equals "Beef soup bones from the butcher counter".
- C6 [test] D1 limits on every batch card. (Red for TODO ids until the planner fills Step 1c.)
- C7 [test] No grass term in decision or cart_pick for non-ruminant-front batch ids; lean_ratio and butcher carry the POINTER.
- C8 [test] Brand, claim-lock and price greps over changed copy fields of batch ids = 0, and ≥10 fields changed.
- C9 [test] lintSections with the CA-5 meat tip, flags on: no L1/L4/L5 hit on a batch id; no L2 group made only of batch ids.
- C10 [test] Plumbing: TRY_POOL[0] is lean_ratio with no organ_blend; OWNED_FACTS does not name organ_blend; lintCard, readability and lintPickSteps are clean for lean_ratio and beef with their do lines.
- C11 Server `npm test` green (count reported), listMatchProbe 0 wrong, commitGuard clean, migrate dry-run shows exactly `ground_beef_organ_blend` deleted plus this batch's upserts.

## Contract

```json
{"criteria":[
 {"id":"C1","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/routes/perimeter.js","server/lib/listMatch.js","server/lib/counterCardLint.js","server/test/acceptance/ic5b.test.js","server/test/acceptance/k9.test.js"],"allowed_reads":["docs/CARD-ALIGNMENT-PLAN.md"],"expected":"7 fields + do line byte-equal to the worked example","test_name":"C1 Ground beef front equals the worked example"},
 {"id":"C2","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/routes/perimeter.js"],"allowed_reads":["docs/CARD-ALIGNMENT-PLAN.md"],"expected":"watch_out 5 in order; labels 5 with no em-dash; detail holds the numbered facts and no producer names","test_name":"C2 Ground beef additive fields hold every fold fact"},
 {"id":"C3","impl":["server/kristy_perimeter_kb.json","server/lib/counterCards.js"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/lib/counterReach.test.js","server/test/acceptance/passRule.js","server/test/acceptance/k15.test.js"],"allowed_reads":["server/test/acceptance/passRule.js"],"expected":"organ_blend absent and RETIRED; aliases/asked_as/sources superset; passRule ok","test_name":"C3 the organ-blend fold is complete and the pass rule holds"},
 {"id":"C4","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/counterDecision.test.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"beef decision/cart_pick equal plan; G1 gloss present; no grain-finish line","test_name":"C4 the Beef front carries G1 and drops the grain-finish line"},
 {"id":"C5","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/routes/perimeter.js","server/lib/listMatch.js"],"allowed_reads":[],"expected":"butcher cart_pick equals the plan string","test_name":"C5 plan cart_picks are byte-equal"},
 {"id":"C6","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/test/acceptance/ic5b.test.js"],"allowed_reads":[],"expected":"every batch card within D1 limits","test_name":"C6 D1 limits hold on every batch card"},
 {"id":"C7","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/lib/counterCardLint.js"],"allowed_reads":[],"expected":"0 grass matches outside beef/bison/venison/lamb fronts; POINTER present","test_name":"C7 only ruminant fronts print a grass term"},
 {"id":"C8","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":[],"allowed_reads":[],"expected":"0 brand/claim/price hits; >=10 changed fields","test_name":"C8 brand claim and price greps are zero over changed copy fields"},
 {"id":"C9","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3a.test.js"],"dependents":["server/lib/counterCardLint.test.js"],"allowed_reads":["server/lib/sectionRules.json"],"expected":"0 L1/L4/L5 hits on batch ids; no all-batch L2 group","test_name":"C9 meat section lints are clean for batch ids"},
 {"id":"C10","impl":["server/lib/tryPool.js","server/lib/counterCardLint.js","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3a.test.js","server/lib/tryPool.test.js"],"dependents":["server/lib/tryPool.test.js","server/test/ktight.test.js","server/test/acceptance/k9.test.js"],"allowed_reads":[],"expected":"pool and owned-facts repointed; per-card lints []","test_name":"C10 plumbing repointed and per-card lints clean"},
 {"id":"C11","impl":["server/test/ktight.test.js","server/test/acceptance/k9.test.js","server/test/acceptance/k15.test.js","server/test/acceptance/ic5b.test.js"],"tests":[],"dependents":["server/test/acceptance/k14.test.js"],"allowed_reads":[],"expected":"npm test green except the k14 C12 anchor tripwire main re-anchors; probe 0 wrong; commitGuard clean; dry-run deletes only ground_beef_organ_blend"}
],
"dependency_evidence":[
 {"owned":"server/kristy_perimeter_kb.json","imports":["server/routes/perimeter.js:145","server/routes/perimeter.js:274","server/routes/perimeter.js:410","server/lib/listMatch.js:202","server/lib/listMatch.js:229","Tools/listvocab/build.js:43"],"tests":["server/lib/counterReach.test.js","server/test/acceptance/passRule.js"],"source":".pipeline/specs/ca-scouts.md S11 (cart_pick readers), S4"},
 {"owned":"server/lib/counterCards.js","imports":["server/scripts/migrateCounterCards.js:213"],"tests":["server/test/acceptance/k14.test.js:151"],"source":".pipeline/specs/ca-scouts.md S4 (RETIRED :92, ESSENTIALS :259-267, --dry-run :213)"},
 {"owned":"ground_beef_organ_blend references","imports":["server/lib/counterCardLint.js:1550","server/lib/doLines.json:65","server/lib/tryPool.js:5"],"tests":["server/lib/tryPool.test.js:37","server/lib/counterCardLint.test.js:419","server/test/ktight.test.js:14","server/test/acceptance/k9.test.js:18","server/test/acceptance/ic5b.test.js:20","server/test/acceptance/k15.test.js:42"],"source":".pipeline/specs/ca-scouts.md S5 (iOS none)"},
 {"owned":"section map","imports":["server/lib/counterCardLint.js sectionForCategory"],"tests":["server/lib/counterCardLint.test.js"],"source":".pipeline/specs/ca-scouts.md S2"}
],
"env":{"executables":["node","git","grep"],"browsers":[],"temp":"/Users/m1/kristy/.pipeline/runs/ca-3a","network":false}}
```

## Acceptance server/test/acceptance/ca-3a.test.js

```js
// Written by the planner; do not edit.
// ca-3a: docs/CARD-ALIGNMENT-PLAN.md "CA-3 Meat batch"; worked example and fold table verbatim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED, projectEntry } from '../../lib/counterCards.js';
import { TRY_POOL } from '../../lib/tryPool.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const PRE = JSON.parse(execFileSync('git', ['show', '8b49633:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const flat = (r) => (Array.isArray(r) ? r : (r && r.violations) || []);
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));
const run = (tips, entries) => lint.lintSections(tips, entries);

const BATCH = ['beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking',
  'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones'];
const RUMINANT_FRONTS = new Set(['beef_grassfed_vs_grainfed', 'bison', 'venison_game', 'lamb_goat']);
const MEAT_TIP = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] };
const G1 = '“grass-fed” is the producer’s own word unless a certifier’s seal audits it';
const POINTER = 'How it was raised: see Beef.';
const COPY_SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'category', 'evidence_tier']);
const BRAND = /force of nature|seven sons|certified angus|whole foods|tyson|perdue|hormel|oscar mayer|applegate/i;
const CLAIM = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;

const LEAN = {
  decision: 'Organ blend with each organ’s percentage first, then ground beef with nothing added.',
  tier_note: 'Organ blends grind beef liver or heart into the meat; printed percentages show how much of each.',
  instead: 'Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan.',
  cart_pick: 'Liver and heart beef blend, shares stated',
  short_answer: 'Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. How the cattle were raised is on the Beef card.',
  why: 'Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. Organs are part of eating the whole animal, and a blend puts them in a familiar grind.',
  pick_steps: ['How it was raised: see Beef.', 'Organ blend: each organ named, each with its own percentage.', 'Next: plain ground beef; skip “hamburger,” which allows added beef fat.'],
};
const LEAN_DO = 'Read the label for organ names, each with a percentage beside it.';
const D6_SENTENCE = 'Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart.';

test('C1 Ground beef front equals the worked example', () => {
  const e = now('ground_beef_lean_ratio');
  for (const [f, v] of Object.entries(LEAN)) assert.deepEqual(e[f], v, `lean_ratio.${f}`);
  assert.equal(doLines.ground_beef_lean_ratio, LEAN_DO);
});

test('C2 Ground beef additive fields hold every fold fact', () => {
  const e = now('ground_beef_lean_ratio');
  const old = pre('ground_beef_lean_ratio');
  const fold = pre('ground_beef_organ_blend');
  assert.deepEqual(e.watch_out, [...old.watch_out, ...fold.watch_out]);
  assert.deepEqual(e.buying_tips, [...old.buying_tips, 'The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name.']);
  const label = (t) => (e.labels_decoded || []).find((l) => l.term === t);
  assert.equal(label('80/20, 85/15, 90/10').meaning, 'Lean % to fat % by weight; higher first number = leaner.');
  assert.equal(label('Organ blend').meaning, 'Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’.');
  assert.equal(label('Hamburger').meaning, 'Chopped beef that may have beef fat added; ‘ground beef’ may not.');
  for (const l of fold.labels_decoded) assert.deepEqual(label(l.term), l);
  assert.doesNotMatch(JSON.stringify(e.labels_decoded), /—/);
  assert.equal(e.kristy_take, `${old.kristy_take} A blend that prints its numbers is an honest pack. One that will not is a mystery bag.`);
  for (const s of [D6_SENTENCE, '25 percent', '9 CFR 317.2', '6,582 mcg RAE', '3,000 mcg', old.detail, old.short_answer, old.why]) assert.ok(e.detail.includes(s), `detail lacks: ${s}`);
  assert.doesNotMatch(e.detail, BRAND);
  assert.equal(e.science, old.science);
});

test('C3 the organ-blend fold is complete and the pass rule holds', (t) => {
  assert.equal(now('ground_beef_organ_blend'), undefined, 'organ_blend still in the KB');
  assert.ok(RETIRED_IDS.has('ground_beef_organ_blend'), 'organ_blend not RETIRED');
  const e = now('ground_beef_lean_ratio');
  const fold = pre('ground_beef_organ_blend');
  for (const f of ['aliases', 'asked_as']) for (const v of fold[f]) assert.ok(e[f].includes(v), `${f} lost ${v}`);
  for (const s of fold.sources) assert.ok(e.sources.some((x) => JSON.stringify(x) === JSON.stringify(s)), `source lost ${JSON.stringify(s)}`);
  for (const id of BATCH) pass.assertPassRule(t, pre(id), now(id));
});

test('C4 the Beef front carries G1 and drops the grain-finish line', () => {
  const b = now('beef_grassfed_vs_grainfed');
  assert.equal(b.decision, '100% grass-fed or grass-finished, no added hormones, with a certifier’s seal.');
  assert.equal(b.cart_pick, '100% grass-fed or grass-finished beef');
  assert.ok(b.tier_note.includes(G1), 'beef tier_note lacks the G1 gloss');
  assert.match(b.why, /whole-food standard/);
  const said = [b.why, b.short_answer, b.science, JSON.stringify(b.labels_decoded)].join(' ');
  assert.doesNotMatch(said, /allows a grain finish|may still have been grain-finished|eat feedlot grain for the last months/i);
});

test('C5 plan cart_picks are byte-equal', () => {
  assert.equal(now('butcher_counter_asking').cart_pick, 'Beef soup bones from the butcher counter');
});

test('C6 D1 limits hold on every batch card', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    if (Array.isArray(e.pick_steps)) assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `${id} pick_steps ${e.pick_steps.length}`);
    if (e.kind === 'pick') continue;
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5 && words(n) <= 20, `${id} tier_note ${words(n)} words`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.ok(String(e.instead || '').trim().length > 0, `${id} instead empty`);
  }
});

test('C7 only ruminant fronts print a grass term', () => {
  for (const id of BATCH) {
    if (RUMINANT_FRONTS.has(id)) continue;
    const e = now(id);
    assert.doesNotMatch(String(e.decision || ''), /grass-(fed|finished)/i, `${id} decision`);
    assert.doesNotMatch(String(e.cart_pick || ''), /grass-(fed|finished)/i, `${id} cart_pick`);
  }
  for (const id of ['ground_beef_lean_ratio', 'butcher_counter_asking']) assert.ok(JSON.stringify(now(id)).includes(POINTER), `${id} lost the POINTER`);
});

test('C8 brand claim and price greps are zero over changed copy fields', () => {
  let changed = 0;
  for (const id of BATCH) {
    const e = now(id);
    const p = pre(id);
    for (const [f, v] of Object.entries(e)) {
      if (COPY_SKIP.has(f) || JSON.stringify(v) === JSON.stringify(p[f])) continue;
      changed++;
      const s = JSON.stringify(v);
      assert.doesNotMatch(s, BRAND, `${id}.${f} brand`);
      assert.doesNotMatch(s, CLAIM, `${id}.${f} claim-lock word`);
      assert.doesNotMatch(s, PRICE, `${id}.${f} price`);
      assert.doesNotMatch(s, /—/, `${id}.${f} em-dash`);
      assert.doesNotMatch(s, /\b(I|me|my|mine)\b/, `${id}.${f} first person`);
    }
  }
  assert.ok(changed >= 10, `only ${changed} changed copy fields`);
});

test('C9 meat section lints are clean for batch ids', () => {
  const hits = run([{ ...MEAT_TIP, tip_aligned: true, cards_aligned: true }], kb.entries);
  assert.ok(Array.isArray(hits));
  const mine = hits.filter((h) => (h.id && BATCH.includes(h.id)) || (Array.isArray(h.ids) && h.ids.every((i) => BATCH.includes(i))));
  assert.deepEqual(mine.filter((h) => h.code !== 'SECTION_TIP_HANDLING'), []);
});

test('C10 plumbing repointed and per-card lints clean', () => {
  assert.equal(TRY_POOL[0], 'ground_beef_lean_ratio');
  assert.ok(!TRY_POOL.includes('ground_beef_organ_blend'));
  assert.ok(!JSON.stringify(lint.OWNED_FACTS).includes('ground_beef_organ_blend'));
  for (const id of ['ground_beef_lean_ratio', 'beef_grassfed_vs_grainfed']) {
    const e = now(id);
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(flat(lint.readability(e)), [], `${id} readability`);
    assert.deepEqual(flat(lint.lintPickSteps(e)), [], `${id} lintPickSteps`);
  }
});
```

## ANCHOR server/lib/counterCards.js:175
```
  // → yogurt_plain_vs_flavored: live cultures is how to pick plain yogurt. Aliases kefir/alive/still alive not moved.
  'yogurt_live_cultures',
];
```
The RETIRED list ends at :177; insert the two CA-3a lines before `];`.

## ANCHOR server/lib/counterCardLint.js:1549
```
  ownedFact('beef_raising', 'beef_grassfed_vs_grainfed',
    ['ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics',
      'butcher_counter_asking', 'judging_meat_at_the_case', 'organ_meats', 'pick_soup_bones'],
```
:1550 only.

## ANCHOR server/lib/counterCardLint.js:1622
```
    id: 'G1', term: /100% grass[- ]fed or grass[- ]finished/i,
    sections: ['meat'], categories: null,
    gloss: '“grass-fed” is the producer’s own word unless a certifier’s seal audits it',
```
Read only; the Beef tier_note carries this gloss byte-equal.

## ANCHOR server/lib/tryPool.js:4
```
export const TRY_POOL = Object.freeze([
  'ground_beef_organ_blend',
  'butcher_counter_asking',
```

## ANCHOR server/lib/tryPool.test.js:36
```
  assert.deepEqual(POOL, [
    'ground_beef_organ_blend', 'butcher_counter_asking', 'beef_cuts_basics',
    'pork_cuts_and_enhanced', 'chicken_cuts_basics', 'salmon_wild_vs_farmed',
```

## ANCHOR server/lib/doLines.json:64
```
  "ground_beef_lean_ratio": "Read the name: “ground beef” allows no added fat, water or binders.",
  "ground_beef_organ_blend": "Read the ingredient list for liver and heart, each with a percentage.",
```
Generated; edit `docs/do-lines-review.md`, then run `node server/scripts/buildDoLines.js`.

## ANCHOR server/test/ktight.test.js:14
```
  B03: ['beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio', 'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'lamb_goat', 'organ_meats', 'bison', 'venison_game'],
  B04: ['rotisserie_chicken', 'chicken_cuts_basics', 'turkey_whole', 'ground_turkey', 'chicken_breast', 'egg_labels', 'egg_duck_quail'],
  B05: ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'],
```
Also :32 `B03: 11`, :37 `'question entries', 182);`, :40 `'batched ids', 181);`.

## ANCHOR server/test/acceptance/k9.test.js:17
```
const SLICE = nonEmpty([
  'beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio',
  'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'deli_meat_uncured', 'hot_dogs',
], 'the K9 slice', 9);
```

## ANCHOR server/test/acceptance/k15.test.js:41
```
  ['stew meat', 'beef_cuts_basics'], ['steak', 'beef_cuts_basics'],
  ['organ blend ground beef', 'ground_beef_organ_blend'], ['beef with liver', 'ground_beef_organ_blend'], ['organ meat blend', 'ground_beef_organ_blend'],
  ['whole turkey', 'turkey_whole'], ['ground turkey', 'ground_turkey'],
```

## ANCHOR server/test/acceptance/ic5b.test.js:19
```
const BATCH = ['beef_grassfed_vs_grainfed', 'beef_cuts_basics', 'judging_meat_at_the_case', 'butcher_counter_asking', 'organ_meats', 'venison_game',
  'ground_beef_organ_blend', 'ground_beef_lean_ratio', 'bison', 'lamb_goat', 'pork_cuts_and_enhanced', 'bacon', 'cured_pork', 'ham', 'hot_dogs', 'deli_meat_uncured'];
const GRASS_URLS = [
```

## ANCHOR server/test/acceptance/ic5b.test.js:38
```
  assert.equal(b.title, 'Beef');
  assert.equal(b.decision, '100% grass-fed and grass-finished.');
  assert.match(b.tier_note, /finish/i);
```

## ANCHOR server/test/acceptance/ic5b.test.js:86
```
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) if (!was.has(u)) { checked++; assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`); }
```

## ANCHOR server/kristy_perimeter_kb.json:154
```
      "decision": "100% grass-fed and grass-finished.",
      "why": "‘Grass-fed’ allows a grain finish at the end. ‘Grass-finished’ is the whole-food standard.",
      "short_answer": "‘Grass-fed’ is a floor, not a standard. Cattle can graze most of their lives, eat feedlot grain for the last months, and still be labeled grass-fed. ‘Grass-finished’ or ‘100% grass-fed’ covers the whole life. That one is worth paying for.",
```

## Claim-trace table (one row per new sentence)

Tags: `card` = already on this card; `fold` = verbatim on `ground_beef_organ_blend`; `KS` = kristys_standard, no new fact; `CA-2:<block>` = quoted in `docs/research/card-align-sources.md`; `meat:<lines>` = quoted in `docs/research/meat-sources.md`.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| 1 | beef.decision | 100% grass-fed or grass-finished, no added hormones, with a certifier’s seal. | card (buying_tips 1, detail: AGA/AGW seals); `label_no_added_hormones` (KB :1963) "Beef and dairy allow hormones, so there it is meaningful and should be third-party verified."; plan inventory front |
| 2 | beef.why | The whole-food standard is grass after weaning, no grain, and no feedlot. | CA-2:1 FSIS RaisingClaims.pdf (https://www.fsis.usda.gov/sites/default/files/media_file/2021-02/RaisingClaims.pdf): grass (forage) after weaning, no grain, "never confined to a feedlot"; card (old why "whole-food standard") |
| 3 | beef.short_answer s1 | On a beef label, ‘grass-fed’ alone rests on the producer. | card detail "the bare claim now rests on the producer"; meat:230-250 FR 2016-00440 |
| 4 | beef.short_answer s2 | FSIS reads ‘100% grass-fed’ as grass after weaning, no grain, and pasture access. | CA-2:1 |
| 5 | beef.short_answer s3 | A certifier’s seal is what audits it. | G1 gloss (CA-1, gate A1 fallback); card detail "both audit the whole life" |
| 6 | beef.tier_note | On a beef label, “grass-fed” is the producer’s own word unless a certifier’s seal audits it. | G1 gloss, CA-2:1 |
| 7 | beef.cart_pick | 100% grass-fed or grass-finished beef | plan string; card decision |
| 8 | beef.buying_tips[1] + science s5 | Ground and chuck are the lowest-cost way into a whole-life grass animal. | card (rephrase of "cheapest", relative term only, non-negotiable 8) |
| 9 | beef.science s1 | FSIS reads a ‘grass-fed’ claim as grass after weaning, no grain, and pasture access. | CA-2:1 |
| 10 | beef.labels Grass-fed s1 | The producer’s own word unless a certifier’s seal audits it. | G1 gloss |
| 11 | beef.labels Grass-fed s2 | FSIS reads it as grass after weaning, no grain. | CA-2:1 |
| 12 | lean.decision | Organ blend with each organ’s percentage first, then ground beef with nothing added. | fold decision + card decision (both halves already said) |
| 13 | lean.tier_note | Organ blends grind beef liver or heart into the meat; printed percentages show how much of each. | card/fold (worked example tag `card`); fold short_answer, buying_tips 1 |
| 14 | lean.instead | Plain ground beef and a small piece of liver from the counter. The share is whatever goes in the pan. | fold instead, verbatim |
| 15 | lean.cart_pick | Liver and heart beef blend, shares stated | fold cart_pick, verbatim |
| 16 | lean.do | Read the label for organ names, each with a percentage beside it. | fold do line ("Read the ingredient list for liver and heart, each with a percentage.") |
| 17 | lean.pick_steps 2 | Organ blend: each organ named, each with its own percentage. | fold pick_steps 1, buying_tips 1 |
| 18 | lean.pick_steps 3 | Next: plain ground beef; skip “hamburger,” which allows added beef fat. | CA-2:7 9 CFR 319.15(b) (https://www.law.cornell.edu/cfr/text/9/319.15); meat:304-322; card buying_tips 1 |
| 19 | lean.why s1 | Federal rules bar added water, binders, and extenders from anything sold as ‘ground beef’. | fold detail; CA-2:7 9 CFR 319.15(a) |
| 20 | lean.why s2 | Regulation keeps organs out of ‘ground beef’, so a blend needs its own name and a full ingredient list. | fold why, verbatim |
| 21 | lean.why s3 | Organs are part of eating the whole animal, and a blend puts them in a familiar grind. | KS (plan tag), no new fact |
| 22 | lean.short_answer s1 | Pick an organ blend that prints each organ’s percentage, or ground beef with nothing added. | fold decision + card decision |
| 23 | lean.short_answer s2 | How the cattle were raised is on the Beef card. | POINTER (card pick_steps) |
| 24 | lean.buying_tips + | The product name will not say ‘ground beef’ alone; a blend has to carry its own descriptive name. | fold buying_tips 2, verbatim |
| 25 | lean.labels Organ blend | Beef with liver, heart, or other organs mixed in, sold under its own descriptive name, not as ‘ground beef’. | fold detail (9 CFR 317.2 descriptive name) |
| 26 | lean.labels Hamburger | Chopped beef that may have beef fat added; ‘ground beef’ may not. | card short_answer/watch_out 1; CA-2:7 9 CFR 319.15(b) |
| 27 | lean.labels 80/20 | Lean % to fat % by weight; higher first number = leaner. | card (em-dash → semicolon, words kept) |
| 28 | lean.kristy_take + s1 | A blend that prints its numbers is an honest pack. | fold kristy_take, rephrased |
| 29 | lean.kristy_take + s2 | One that will not is a mystery bag. | fold kristy_take, verbatim |
| 30 | lean.detail + D6 | Two label examples: one blend states 8 percent organ meats (4 percent liver, 4 percent heart, 92 percent muscle); another states 92 percent ground beef, 5 percent liver, 3 percent heart. | fold detail + fold sources 4/5 (producer pages, citations kept) |
| — | lean.detail + (other) | fold detail, fold science, old short_answer/why: verbatim moves | fold / card |
| — | TODO cards | rows added when Step 1c is filled | — |

## Independent check script (admin-run; not part of the build)

Save as `/Users/m1/kristy/.pipeline/runs/ca-3a/counts.mjs`.

```js
import { readFileSync } from 'node:fs';
import * as lint from '../../../server/lib/counterCardLint.js';
import * as listMatch from '../../../server/lib/listMatch.js';
const kb = JSON.parse(readFileSync('/Users/m1/kristy/server/kristy_perimeter_kb.json', 'utf8'));
const BATCH = ['beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking', 'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones'];
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const out = { cards: {}, sections: {}, cartPickMatch: {} };
for (const id of BATCH) {
  const e = kb.entries.find((x) => x.id === id);
  if (!e) { out.cards[id] = 'ABSENT'; continue; }
  out.cards[id] = { decision: words(e.decision), tier_note: words(e.tier_note), instead: words(e.instead), pick_steps: (e.pick_steps || []).length, cart_pick: e.cart_pick ?? null };
  if (e.cart_pick && typeof listMatch.matchItemToCard === 'function') {
    try { const m = listMatch.matchItemToCard(e.cart_pick); out.cartPickMatch[id] = m?.id ?? m?.slug ?? m?.perimeterId ?? JSON.stringify(m); } catch (err) { out.cartPickMatch[id] = `THREW ${err.message}`; }
  }
}
const tip = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'], tip_aligned: true, cards_aligned: true };
for (const h of lint.lintSections([tip], kb.entries)) {
  const k = `${h.code}:${h.id ?? (h.ids || []).join('+')}`;
  out.sections[k] = (out.sections[k] || 0) + 1;
}
console.log(JSON.stringify(out, null, 2));
```

- BEFORE: `mkdir -p /Users/m1/kristy/.pipeline/runs/ca-3a && cd /Users/m1/kristy/server && node ../.pipeline/runs/ca-3a/counts.mjs > ../.pipeline/runs/ca-3a/before.json`
- AFTER: the same command into `after.json`, then `diff before.json after.json`.
- Expected AFTER:
  - `ground_beef_organ_blend` ABSENT.
  - Every batch decision ≤14 and tier_note 5-20.
  - No `CART_PICK_DISAGREES`/`TERM_UNGLOSSED`/`SECTION_TIP_REPEATS_CARD` key on a batch id.
  - `cartPickMatch` reports, for each changed cart_pick, its own slug (lean_ratio, butcher_counter_asking, beef_grassfed_vs_grainfed). A cart_pick that matches another slug is a finding for the critic (Open question 3), not a silent pass.
- Also run `grep -rn ground_beef_organ_blend server/lib server/test server/routes | grep -v RETIRED`: expected only the counterCards.js RETIRED lines and historical comments.

## Prerequisites

- Env: node ≥20, git, grep. No network. No Supabase writes (`--dry-run` only). No browser.
- CA-1 (`8b49633`) and CA-2 (`f661fee`) are committed.
- BEFORE captured.
- Step 1c filled by the planner (no TODO left).

## Answers

- **Reads and runtime:** `npm test` takes 1-3 minutes; the acceptance test takes seconds. Read only `owns`, `read_full`, and the KB entries of batch ids (beef :139-205, organ_blend :206-270, lean_ratio :454-505; the others by id).
- **Do not edit:**
  - Any KB entry outside the batch.
  - `sources`/`aliases`/`asked_as` of K15 ids (lamb_goat, organ_meats, bison, venison_game).
  - ESSENTIALS.
  - `server/lib/sectionRules.json` (CA-5).
  - `client/src` (frozen).
  - Any test not in `owns`.
- **Every string in Steps is final.** Copy it byte for byte. Do not author a sentence; a needed sentence that is not in this spec is a STOP.
- **STOP BLOCKED (quote the evidence) if:**
  - Any lint in C10 rejects a worked-example string (the plan gate failed; the planner applies the plan's fallback).
  - `counterReach` puts a folded asked_as on any id other than `ground_beef_lean_ratio`.
  - `counterDecision.test.js` fails on beef (:85 needs "whole-food standard" in decision+why) or beef_cuts (:173 "Chuck").
  - ic5a C5 fails (a sentence inherited from `beef_grades_usda`/`meat_case` was reworded).
  - listMatchProbe reports a wrong match.
  - A TODO remains in Step 1c.
- **Limits:** no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- **Commit (admin):** `ca-3a: meat batch A, Beef front + Ground beef worked example, ground_beef_organ_blend folded. Do lines table docs/do-lines-review.md → server/lib/doLines.json. Not migrated.`
- **Report, ≤30 lines:** READY or NOT READY; acceptance pass count; npm test count; probe wrong count; dry-run deletes; any KEPT ids; any STOP.

## Open questions

1. **beef_cuts_basics D6 vs ic5a C5.** The watch_out "‘Angus’ on a package is not a grade. Certified Angus Beef is a brand with its own checklist. ..." names a brand (D6 says rephrase it). If that sentence came from `beef_grades_usda` (folded IC-5a), ic5a C5 requires it verbatim. Pick one: (a) keep it verbatim and note D6's exception; or (b) rephrase it and narrow ic5a C5 for that one sentence. Planner default: (a) until verified.
2. **Certifier names** (American Grassfed, Certified Grassfed by AGW) on the Beef do line and detail: these are seal names, not food brands. They are kept and not in the BRAND regex.
3. **matchItemToCard on new cart_picks** is unverified. "Liver and heart beef blend, shares stated" may hit organ_meats (aliases "beef liver"/"beef heart"). "Beef soup bones from the butcher counter" may hit pick_soup_bones. `typeContradicts` (perimeter.js:130-151) reads cart_pick types. The admin's counts.mjs answers this before dispatch; a wrong match means the plan string needs Devon, not a builder alias.
4. **ic5b C7:** the fold's producer URLs are not in `docs/sources/item-cards`. The spec treats them as moved (FOLD_URLS), not new.

## Tried and rejected

- **Keeping "‘Grass-fed’ allows a grain finish" on Beef.** CA-2 block 1 (FSIS 2019) contradicts it. Gate A1 failed, and its pre-written fallback is the G1 gloss.
- **Fold science sentences into lean_ratio science.** It would pass 70 words; the plan's own fallback sends them to detail.
- **A `why` that keeps "‘Grass-finished’ is the whole-food standard" verbatim.** It would keep the 6-gram shape the 3b cards repeat ("is the whole-food standard", L2). It was reordered so the key phrase leads.
- **Retargeting k15 to a new organ id.** The plan folds into Ground beef; no new card.
