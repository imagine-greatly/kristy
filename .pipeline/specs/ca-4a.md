# ca-4a — Eggs and Milk fronts, the dairy ladder, pick_milk retired

```json
{
  "id": "ca-4a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/ic7b.test.js",
    "server/test/acceptance/ic4b.test.js",
    "server/test/acceptance/ic7a.test.js",
    "server/test/counterProbe48.test.js",
    "server/lib/kindFilter.test.js",
    "server/lib/perimeter.test.js",
    "server/scripts/listMatchProbe.js"
  ],
  "read_full": [
    "docs/CARD-ALIGNMENT-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/ca-1.test.js",
    "server/test/acceptance/ic7b.test.js",
    "server/test/acceptance/ic7a.test.js",
    "server/test/acceptance/ic4b.test.js",
    "VOICE_SPEC.md"
  ],
  "verify": "node --test server/test/acceptance/ca-4a.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T2 (fallback forge@opus [T2]). Critic: critic@opus, `FIDELITY required` (Codex-built T2; the worked examples are Devon-approved text and the critic checks them byte for byte).
- P1. Parallel-safe: no (owns the KB, which CA-3 and CA-4b also own).
- Plan: `docs/CARD-ALIGNMENT-PLAN.md` CA-4 (worked examples Eggs, Milk, Yogurt; D8 pick_milk retires). Scouts: `.pipeline/specs/ca-scouts.md` S1, S2, S4, S5, S11.
- **Before dispatch:** CA-3a and CA-3b committed (see Prerequisites). Admin runs the BEFORE capture in "Independent check script".

Scope: seven eggs_dairy entries are rewritten to the CA-4 text below and `pick_milk` is deleted. Every string the builder writes is given here; the builder authors no claim. The other sixteen eggs_dairy cards are CA-4b.

Card counts: R 7 (`egg_labels`, `whole_vs_reduced_fat_milk`, `yogurt_plain_vs_flavored`, `raw_milk`, `egg_duck_quail`, `ghee`, `grassfed_butter`), RT 1 (`pick_milk`), F 0, K 1 (`pick_egg_whites`, asserted unchanged).

## Alignment block

**Done means:**

*The three worked examples.*
- Given `egg_labels`, `whole_vs_reduced_fat_milk` and `yogurt_plain_vs_flavored`, when the KB is read, then every field named in Step 1, 2 and 3 equals the string given there byte for byte (cart_pick included), and every field not named there deep-equals HEAD `8b49633`.
- Given `egg_labels`, then no copy field contains "cheapest", and the low-cost fact its `buying_tips` and `science` carried is present as "Plain conventional eggs are still one of the lowest-cost animal foods in the store."
- Given the milk decision, then `headlineHedge()` returns `[]`; the `raw_milk` `watch_out` deep-equals HEAD; the milk `watch_out` minus the one inserted UHT line deep-equals HEAD; and no milk field contains "test results".

*The other four cards.*
- Given `raw_milk`, `egg_duck_quail`, `ghee` and `grassfed_butter`, then the fields named in Step 4 equal the strings given there and every other field deep-equals HEAD. Given `pick_egg_whites`, then it deep-equals HEAD.

*pick_milk.*
- Given `pick_milk`, then it is absent from the KB; "milk", "whole milk", "a gallon of milk", "gallon of milk", "milk carton" and "carton of milk" resolve through `matchItemToCard` to `whole_vs_reduced_fat_milk`, and `listMatchProbe.js` reports 0 wrong with the three plan rows in `OWNED_BY`.
- Given each changed `cart_pick` (Eggs, Milk, Yogurt, Butter), when passed to `matchItemToCard`, then it returns its own card's slug.

*Lints.*
- Given each of the seven R ids, then `assertPassRule`, `readability`, `lintCard(projectEntry(card, {doLine}))`, `lintPickSteps`, `lintCulinaryAim` and `lintRepeatedClaim` each return no hit.
- Given `lintSections` run with the CA-5 eggs_dairy tip text and both flags forced, then no L1, L4 or L5 hit names a CA-4a id, no L2 group consists only of CA-4a ids, and L3 returns no hit.
- Given the strings this piece adds, then none matches the claim-lock grep, the price grep, an em-dash or a straight quote; no copy field of a CA-4a id matches the brand grep; no CA-4a `tier_note` other than yogurt's matches the D4 use-bridge pattern `/at home with|stir|top it|mix it/i`.
- `npm test` green with the superseded pins in Step 6; probe 0 wrong; `commitGuard.js` clean; `--dry-run` places every card.

**Out of scope:** the sixteen CA-4b cards; `sectionRules.json` (CA-5); any meat card (CA-3); sources (none added; CA-2 already archived them); iOS; migration.

**OK rough edges:**
- Milk `buying_tips` keeps its old ladder sentence (raw, then low-temp organic); the front and the tier_note carry the new ladder.
- Yogurt `kristy_take` keeps "Big tub of plain" and "Cheaper per ounce" (relative, not a price; the price grep does not match it).
- New label terms sit beside old ones that overlap ("Greek" beside "Greek / skyr", "Ultra-pasteurized" beside "Ultra-pasteurized / UHT"); ic7a C5 only rejects an exact repeated term.
- Existing em-dashes and certifier names (Certified Humane, Animal Welfare Approved) in HEAD strings stay.
- **Deviation from the plan, recorded.** `perimeter.test.js:213-214` cap cart_pick at 44 characters and forbid `%`; the approved Eggs and Milk picks run 46 characters and Milk and Yogurt carry "100%". Step 6 raises the cap to 46 `[PLACEHOLDER]` and exempts the literal "100%" `[PLACEHOLDER]`; Devon confirms (Open question 1). CA-3a beef carries "100%" too; whichever piece lands first makes the edit, the second finds it done.
- Butter front drops "grass-fed" under D2 rule 3 (the section rule carries how the cows ate; the card carries the color). Open question 2.

**Ship bar:** a worked-example string not byte-equal; any raw-milk risk sentence altered (`raw_milk` `watch_out`, the named-group line); a claim, number or ingredient fact with no row in the claim-trace table; a brand, price word, first-person word or em-dash in a new string; `pick_milk` still present or a milk row landing anywhere but the Milk card; an ESSENTIALS card (egg_labels, milk) reordered or retired; `npm test` red.

**Independent check:** `git diff 8b49633 -- server/kristy_perimeter_kb.json` restricted to the milk entry shows one added `watch_out` line and no removed `watch_out` line; the forced-flag eggs_dairy L1/L4/L5 hit list for CA-4a ids goes from BEFORE to 0 (`counts.mjs` below); each changed cart_pick passed to `matchItemToCard` prints its own slug.

## Steps (the change, old → new)

Copy every string from this file, not from memory. Curly quotes and apostrophes are part of the string (’ “ ”). A string given here never changes; if a lint fires on one, STOP BLOCKED and quote the hit.

### 0. Baseline (prints only, writes nothing)
From `server/`, run `node -e` with `lintSections([{section:'eggs_dairy', rule, checks, tip_aligned:true, cards_aligned:true}], kb.entries)` using the CA-5 eggs_dairy tip from `server/test/acceptance/ca-1.test.js:37`. Print the hits. Report them. Hits on CA-4b ids are CA-4b's; do not fix them here.

### 1. `server/kristy_perimeter_kb.json` — `egg_labels` (Eggs)
- `decision`: "Corn- and soy-free first, then organic, then pasture-raised." → "Pasture-raised, organic, and corn- and soy-free, all three together."
- `tier_note` → "Corn- and soy-free means neither is in the hens’ feed; “soy-free” alone can still mean corn."
- `instead` (new or replaced) → "Soy-free, organic, and pasture-raised, then organic and pasture-raised; each keeps pasture and organic feed."
- `cart_pick`: "Soy-free pasture-raised eggs" → "Pasture-raised organic corn- and soy-free eggs"
- `pick_steps` → ["“Pasture-raised” means time outdoors on pasture, audited only with a certifier’s seal.", "“Organic” means certified organic feed and outdoor access.", "Skip “cage-free” and “vegetarian-fed” cartons; neither promises time outdoors."]
- `why` → "Hens eat what they are given; the carton words show that feed and that life."
- `short_answer` → "Look for pasture-raised, organic, and corn- and soy-free together. Next is soy-free organic pasture-raised, then organic pasture-raised. A certifier’s seal backs the pasture claim."
- `kristy_take`: "Feed, then organic, then room. The space words are the ones everybody sells." → "Feed, organic and pasture, all on one carton. The space words alone are the ones everybody sells."
- `watch_out`: reorder only, strings byte-identical. New order by HEAD index: `[0, 12, 1, 11, 3, 4, 2, 5, 6, 10, 7, 8, 9, 13, 14, 15, 16]` (sourcing, then processing, then packaging and handling). HEAD has 17 items; STOP if it does not.
- `buying_tips`: the element "Plain conventional eggs are still one of the cheapest complete proteins in the store." → "Plain conventional eggs are still one of the lowest-cost animal foods in the store." Others unchanged.
- `science`: the same sentence, same replacement, rest of the string unchanged.
- `detail`: last sentence "The order is what she ate, then how it was grown, then how much room she had." → "The standard is all three on one carton: what she ate, how it was grown, and how much room she had." Rest unchanged.
- `labels_decoded`: append `{"term": "Corn- and soy-free", "meaning": "The feed contains neither corn nor soy; both words must be printed."}`.

### 2. `server/kristy_perimeter_kb.json` — `whole_vs_reduced_fat_milk` (Milk)
- `decision`: "Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed." → "Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed."
- `tier_note` → "Vat, or low-temp, pasteurizing holds milk at 145°F for 30 minutes; regular gets 161°F for 15 seconds."
- `instead` (new or replaced) → "Organic, low-temp pasteurized whole milk: organic rules put cows on pasture through grazing season."
- `cart_pick`: "Whole milk" → "Low-temp pasteurized 100% grass-fed whole milk"
- `pick_steps` → ["Raw means unpasteurized: milk that skipped the heat step.", "Next: “vat pasteurized” or “low-temperature” printed with 100% grass-fed.", "100% grass-fed on milk means the cows ate grass and hay, never grain."]
- `why` → "Each step between the cow and the carton changes milk: heat, homogenizing, and skimming. Whole milk keeps its milkfat; reduced-fat milk has some of it removed."
- `short_answer` → "Raw milk from a trusted local farmer comes first. Next is low-temp pasteurized, 100% grass-fed whole milk. Ultra-pasteurized milk is heated to about 280°F."
- `watch_out`: insert at index 2 "“Ultra-pasteurized” or “UHT” on the carton means about 280°F for a few seconds: skip it." Every HEAD item stays, same order.
- `labels_decoded`: append `{"term": "Vat pasteurized", "meaning": "Held at 145°F for 30 minutes; also printed as low-temperature pasteurized."}` then `{"term": "Ultra-pasteurized", "meaning": "Heated to about 280°F for about 2 seconds."}`. STOP if HEAD already has a term exactly "Vat pasteurized" or "Ultra-pasteurized".
- `aliases`: append each `pick_milk` alias ("milk carton", "milk cartons", "gallon of milk", "carton of milk") that the Milk card does not already carry, in that order. Nothing else added.

### 3. `server/kristy_perimeter_kb.json` — `yogurt_plain_vs_flavored` (Yogurt)
- `decision`: "Flavored yogurt carries added sugar; plain is milk and cultures." → "Plain Greek yogurt made from 100% grass-fed milk."
- `tier_note`: "The added-sugar difference is printed on the panel, and buying plain to sweeten at home is the standard." → "Plain means no added sugar, so sweeten it at home with fruit or honey."
- `instead` (new or replaced) → "Plain organic whole-milk yogurt, Greek or regular, is next when no 100% grass-fed tub is there."
- `cart_pick`: "Plain whole-milk Greek yogurt" → "Plain Greek yogurt, 100% grass-fed"
- `pick_steps` → ["Greek means strained, so the yogurt is thicker and holds less whey.", "100% grass-fed on the tub means the cows ate grass and hay, never grain.", "Skip flavored and fruit-on-the-bottom tubs; that is where the added sugar is."]
- `why` → "Flavored yogurt carries added sugar; plain is milk and cultures. Whole-milk yogurt keeps the milkfat the milk came with."
- `short_answer` → "Plain Greek yogurt from 100% grass-fed milk. Plain organic whole-milk yogurt is next. Flavored tubs are where the added sugar is."
- `detail`: first sentence "Plain yogurt, especially Greek or strained, is a clean high-protein whole food." → "Plain yogurt, especially Greek or strained, is a whole food: milk and cultures." Rest unchanged.
- `buying_tips`: "Greek/strained is higher protein; whole-milk versions are more filling." → "Greek or strained yogurt is thicker; whole-milk versions are more filling."; "Greek and skyr are strained: thicker, more protein per spoon." → "Greek and skyr are strained: thicker, with less whey." Others unchanged.
- `labels_decoded`: term "Greek / skyr" meaning "Strained. Thicker, higher protein per serving." → "Strained. Thicker, with less whey."; append `{"term": "Greek", "meaning": "Yogurt strained to remove whey, which leaves it thicker."}` then `{"term": "Plain", "meaning": "No added sugar or flavoring."}`.

### 4. `server/kristy_perimeter_kb.json` — the other four
- `raw_milk`: `tier_note` → "Milk from a known herd is old practice with thin study; the farm is the standard, not a health claim." (HEAD is 26 words; D1 cap 20). `instead`: "Raw aged cheese from a named dairy. Sixty days of aging puts it in every state, already in the case." → "Vat or low-temp pasteurized whole milk: gently heated, and the next rung down from raw." Nothing else; `watch_out` byte-identical.
- `egg_duck_quail`: `instead` (new) → "Pasture-raised organic hen’s eggs from the refrigerated case, with clean, uncracked shells." Nothing else.
- `ghee`: `instead` (new) → "Plain butter, the same dairy fat before the water and milk solids come out." Nothing else.
- `grassfed_butter` (Butter): `decision`: "Grass-fed butter first, then any real butter: cream, and salt if salted." → "Deepest yellow butter: cream, and salt if salted."; `tier_note`: "Grass-fed butter runs deeper yellow and carries more omega-3, and ranking it first is the standard." → "Color is the reading: carotene from grass turns the fat deep yellow."; `why`: "Carotene from the grass goes into the fat. The fatty-acid profile shifts with it." → "Carotene from the grass goes into the fat. The fatty-acid profile shifts with it, omega-3 included." (keeps the "3" the pass rule tracks); `cart_pick`: "Grass-fed butter" → "Deep yellow butter"; `pick_steps` (new or replaced) → ["Skip tubs and spreads; butter comes as a block or a stick.", "How it was raised: see Milk."]. Nothing else.
- `pick_milk`: delete the entry. No `RETIRED` row (picks never migrate).

### 5. `docs/do-lines-review.md` → `server/lib/doLines.json`
- Row `egg_labels` (:46): headline column → the new Eggs decision; do column "Check the small regional cartons. That is where a feed claim appears." → "Find all three words on one carton, plus a certifier’s pasture seal."
- Row `whole_vs_reduced_fat_milk` (:55): headline → the new Milk decision; do "Ask the farm how it handles milk; a carton dated months out is ultra-pasteurized." → "Check the side panel for the pasteurization words and a grass-fed seal."
- Row `yogurt_plain_vs_flavored` (:57): headline → the new Yogurt decision; do "Take the big plain tub, not the single-serve fruit cups." → "Check the ingredients for milk and cultures, with nothing after them."
- Row `grassfed_butter` (:54): headline → the new Butter decision; do column unchanged.
- Then from `server/`: `node scripts/buildDoLines.js`. Commit both files (admin).

### 6. Superseded pins (one-line edits; each keeps its assertion)
- `server/test/acceptance/ic7b.test.js:20` `MILK_FRONT` → `'Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed.'`; `:42` `/raw|farmer/i` → `/145°F/`. `:87` (review headline equals decision) goes green through Step 5; do not edit it.
- `server/test/acceptance/ic4b.test.js:41` → `'Pasture-raised, organic, and corn- and soy-free, all three together.'`. `:43` (the both-printed fact) must stay green unedited; the detail sentence "Both ‘soy-free’ and ‘corn-free’ have to be printed outright…" carries it.
- `server/test/acceptance/ic7a.test.js`: after `:27` add `const REPHRASED = ['Greek and skyr are strained: thicker, more protein per spoon.', 'Greek/strained is higher protein; whole-milk versions are more filling.'];` and `:85` `new Set(DROPPED.map(norm))` → `new Set([...DROPPED, ...REPHRASED].map(norm))`.
- `server/test/counterProbe48.test.js:184-185`: `'pick_milk'` → `undefined` on both lines.
- `server/lib/kindFilter.test.js:114`: the expected pick count N → N − 1, with a comment line above it `// <N-1> after CA-4a: pick_milk retired; the Milk card answers it, 2026-10-15.` (N is 31 at `8b49633`; CA-3 may have moved it; use the value on the line).
- `server/lib/perimeter.test.js:213` `p.length <= 44` → `p.length <= 46` `[PLACEHOLDER]`; `:214` `assert.doesNotMatch(p, /[$£€%]/, …)` → `assert.doesNotMatch(p.replace('100%', ''), /[$£€%]/, …)` `[PLACEHOLDER]`. If CA-3 already made an equivalent edit, leave both lines.
- `server/scripts/listMatchProbe.js:318` `OWNED_BY` → `{ 'rotisserie chicken': 'rotisserie_chicken', 'milk': 'whole_vs_reduced_fat_milk', 'whole milk': 'whole_vs_reduced_fat_milk', 'a gallon of milk': 'whole_vs_reduced_fat_milk' }` (keep any key CA-3 added).

## Criteria
- C1 [test] Given `egg_labels`, when the KB is read, then the Step 1 fields equal the given strings, `watch_out` is HEAD reordered by the given index list, labels are HEAD plus the one term, the "cheapest" sentence is replaced in `buying_tips` and `science`, the `detail` last sentence is replaced, the review do line equals the given line, and every other field deep-equals HEAD.
- C2 [test] Given the Milk card, then the Step 2 fields equal the given strings, `watch_out[2]` is the UHT line and the rest deep-equals HEAD, labels are HEAD plus two terms, aliases are HEAD plus the absent `pick_milk` aliases, `headlineHedge(decision)` is `[]`, no field contains "test results", and `raw_milk.watch_out` deep-equals HEAD.
- C3 [test] Given the Yogurt card, then the Step 3 fields equal the given strings, the two `buying_tips`, the `detail` first sentence and the "Greek / skyr" meaning are replaced, two label terms appended, and every other field deep-equals HEAD.
- C4 [test] Given `raw_milk`, `egg_duck_quail`, `ghee`, `grassfed_butter`, then the Step 4 fields equal the given strings and every other field deep-equals HEAD; `pick_egg_whites` deep-equals HEAD; `raw_milk.tier_note` matches `/not a health claim/i`.
- C5 [test] Given `pick_milk`, then it is absent; the six milk rows resolve to the Milk card through `matchItemToCard` and never to `pick_milk` through `matchItemToPick`; each changed cart_pick resolves to its own slug.
- C6 [test] Given each R id, then the pass rule holds and readability, lintCard (with the reviewed do line), lintPickSteps, lintCulinaryAim and lintRepeatedClaim return `[]`; `pick_egg_whites` returns `[]` from lintPick.
- C7 [test] Given the strings this piece adds, then none matches the claim-lock grep, the price grep, `—` or a straight quote; no CA-4a copy field matches the brand grep; no CA-4a `tier_note` except yogurt's matches the D4 pattern.
- C8 [test] Given `lintSections` with the CA-5 eggs_dairy tip and both flags forced, then no hit names a CA-4a id, no L2 group is made only of CA-4a ids, and L3 is empty.
- C9 [test] Given `server/lib/doLines.json`, then it carries the three new do lines and the Butter do line.
- C10 Given the repo after the change, when `cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run` run, then 0 fail, 0 wrong, guard clean, every card placed.

## Contract

```json
{
  "criteria": [
    {"id": "C1", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/acceptance/ic4b.test.js"], "dependents": ["server/lib/counterCards.js", "server/test/acceptance/passRule.js", "server/lib/counterReach.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md"], "expected": "Eggs fields equal Step 1; other fields equal 8b49633", "test_name": "C1 the Eggs card carries the worked example"},
    {"id": "C2", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/acceptance/ic7b.test.js"], "dependents": ["server/lib/counterCards.js", "server/test/acceptance/passRule.js"], "allowed_reads": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js"], "expected": "Milk fields equal Step 2; watch_out additions only; raw_milk watch_out unchanged", "test_name": "C2 the Milk card carries the worked example; raw-milk risk lines unchanged"},
    {"id": "C3", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/acceptance/ic7a.test.js"], "dependents": ["server/lib/counterCards.js", "server/test/acceptance/passRule.js"], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "Yogurt fields equal Step 3", "test_name": "C3 the Yogurt card carries the worked example"},
    {"id": "C4", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/acceptance/k14.test.js"], "dependents": ["server/lib/counterCards.js", "server/test/acceptance/passRule.js"], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "four cards carry Step 4 text; pick_egg_whites unchanged", "test_name": "C4 raw milk, duck and quail eggs, ghee and butter carry the spec text"},
    {"id": "C5", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/counterProbe48.test.js", "server/lib/kindFilter.test.js", "server/lib/trips.test.js"], "dependents": ["server/lib/listMatch.js", "server/scripts/listMatchProbe.js", "server/lib/perimeter.js"], "allowed_reads": ["server/lib/listMatch.js", "server/scripts/listMatchProbe.js"], "expected": "pick_milk absent; milk rows land on whole_vs_reduced_fat_milk; each cart_pick lands on its own card", "test_name": "C5 pick_milk is retired and the Milk card answers its rows"},
    {"id": "C6", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/lib/counterCardLint.test.js"], "dependents": ["server/lib/counterCardLint.js", "server/lib/counterCards.js", "server/test/acceptance/passRule.js"], "allowed_reads": ["server/lib/counterCardLint.js", "server/test/acceptance/passRule.js"], "expected": "every lint returns []", "test_name": "C6 <id>: pass rule and every card lint are clean"},
    {"id": "C7", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js"], "dependents": ["server/lib/counterCards.js"], "allowed_reads": ["server/kristy_perimeter_kb.json", "VOICE_SPEC.md"], "expected": "0 grep hits", "test_name": "C7 new copy passes the claim-lock, price, punctuation and brand greps"},
    {"id": "C8", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/acceptance/ca-1.test.js"], "dependents": ["server/lib/counterCardLint.js", "server/lib/counterCards.js"], "allowed_reads": ["server/lib/counterCardLint.js"], "expected": "no forced section-lint hit on a CA-4a id", "test_name": "C8 forced section lints: no hit on a CA-4a card"},
    {"id": "C9", "impl": "server/lib/doLines.json", "tests": ["server/test/acceptance/ca-4a.test.js", "server/test/acceptance/ic7b.test.js"], "dependents": ["server/lib/counterCards.js", "server/scripts/buildDoLines.js"], "allowed_reads": ["docs/do-lines-review.md", "server/scripts/buildDoLines.js"], "expected": "doLines.json carries the four do lines", "test_name": "C9 doLines.json carries the new do lines"}
  ],
  "dependency_evidence": [
    {"owned": "server/kristy_perimeter_kb.json", "imports": [], "tests": ["server/test/acceptance/passRule.js", "server/lib/counterReach.test.js"], "source": "ca-scouts.md S4"},
    {"owned": "server/kristy_perimeter_kb.json", "imports": [], "tests": ["server/test/counterProbe48.test.js", "server/lib/trips.test.js"], "source": "ca-scouts.md S5 (pick_milk: counterProbe48.test.js:184-185; trips.test.js:193)"},
    {"owned": "server/kristy_perimeter_kb.json", "imports": [], "tests": ["server/lib/counterCardLint.test.js"], "source": "ca-scouts.md S1, S2 (sectionForCategory counterCards.js:47)"},
    {"owned": "server/kristy_perimeter_kb.json", "imports": [], "tests": ["server/scripts/listMatchProbe.js"], "source": "ca-scouts.md S11 (cart_pick readers; matchItemToCard listMatch.js:202, matchItemToPick :229)"}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ca-4a", "network": false}
}
```

## Acceptance server/test/acceptance/ca-4a.test.js

```js
// CA-4a: Eggs and Milk fronts, the dairy ladder, pick_milk retired (docs/CARD-ALIGNMENT-PLAN.md CA-4). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { assertPassRule } from './passRule.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const BASE_REF = '8b49633';
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', `${BASE_REF}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs', 'do-lines-review.md'), 'utf8'));
const doLines = JSON.stringify(JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8')));
const now = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const without = (e, keys) => Object.fromEntries(Object.entries(e ?? {}).filter(([k]) => !keys.includes(k)));
const COPY = ['decision', 'short_answer', 'why', 'detail', 'kristy_take', 'tier_note', 'question', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'instead', 'cart_pick', 'labels_decoded', 'eyebrow_short'];
const leaves = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : []);
const copy = (e) => COPY.flatMap((f) => leaves(e?.[f]));
const fresh = (id) => { const old = new Set(copy(was(id))); return copy(now(id)).filter((s) => !old.has(s)); };

const MILK_ID = 'whole_vs_reduced_fat_milk';
const YOG_ID = 'yogurt_plain_vs_flavored';
const EGG = {
  decision: 'Pasture-raised, organic, and corn- and soy-free, all three together.',
  tier_note: 'Corn- and soy-free means neither is in the hens’ feed; “soy-free” alone can still mean corn.',
  instead: 'Soy-free, organic, and pasture-raised, then organic and pasture-raised; each keeps pasture and organic feed.',
  cart_pick: 'Pasture-raised organic corn- and soy-free eggs',
  pick_steps: ['“Pasture-raised” means time outdoors on pasture, audited only with a certifier’s seal.', '“Organic” means certified organic feed and outdoor access.', 'Skip “cage-free” and “vegetarian-fed” cartons; neither promises time outdoors.'],
  why: 'Hens eat what they are given; the carton words show that feed and that life.',
  short_answer: 'Look for pasture-raised, organic, and corn- and soy-free together. Next is soy-free organic pasture-raised, then organic pasture-raised. A certifier’s seal backs the pasture claim.',
  kristy_take: 'Feed, organic and pasture, all on one carton. The space words alone are the ones everybody sells.',
};
const EGG_DO = 'Find all three words on one carton, plus a certifier’s pasture seal.';
const EGG_WATCH_ORDER = [0, 12, 1, 11, 3, 4, 2, 5, 6, 10, 7, 8, 9, 13, 14, 15, 16];
const EGG_OLD_CHEAP = 'Plain conventional eggs are still one of the cheapest complete proteins in the store.';
const EGG_CHEAP = 'Plain conventional eggs are still one of the lowest-cost animal foods in the store.';
const EGG_DETAIL_OLD = 'The order is what she ate, then how it was grown, then how much room she had.';
const EGG_DETAIL_NEW = 'The standard is all three on one carton: what she ate, how it was grown, and how much room she had.';
const EGG_LABEL = { term: 'Corn- and soy-free', meaning: 'The feed contains neither corn nor soy; both words must be printed.' };

const MILK = {
  decision: 'Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed.',
  tier_note: 'Vat, or low-temp, pasteurizing holds milk at 145°F for 30 minutes; regular gets 161°F for 15 seconds.',
  instead: 'Organic, low-temp pasteurized whole milk: organic rules put cows on pasture through grazing season.',
  cart_pick: 'Low-temp pasteurized 100% grass-fed whole milk',
  pick_steps: ['Raw means unpasteurized: milk that skipped the heat step.', 'Next: “vat pasteurized” or “low-temperature” printed with 100% grass-fed.', '100% grass-fed on milk means the cows ate grass and hay, never grain.'],
  why: 'Each step between the cow and the carton changes milk: heat, homogenizing, and skimming. Whole milk keeps its milkfat; reduced-fat milk has some of it removed.',
  short_answer: 'Raw milk from a trusted local farmer comes first. Next is low-temp pasteurized, 100% grass-fed whole milk. Ultra-pasteurized milk is heated to about 280°F.',
};
const MILK_DO = 'Check the side panel for the pasteurization words and a grass-fed seal.';
const MILK_UHT = '“Ultra-pasteurized” or “UHT” on the carton means about 280°F for a few seconds: skip it.';
const MILK_LABELS = [
  { term: 'Vat pasteurized', meaning: 'Held at 145°F for 30 minutes; also printed as low-temperature pasteurized.' },
  { term: 'Ultra-pasteurized', meaning: 'Heated to about 280°F for about 2 seconds.' },
];

const YOG = {
  decision: 'Plain Greek yogurt made from 100% grass-fed milk.',
  tier_note: 'Plain means no added sugar, so sweeten it at home with fruit or honey.',
  instead: 'Plain organic whole-milk yogurt, Greek or regular, is next when no 100% grass-fed tub is there.',
  cart_pick: 'Plain Greek yogurt, 100% grass-fed',
  pick_steps: ['Greek means strained, so the yogurt is thicker and holds less whey.', '100% grass-fed on the tub means the cows ate grass and hay, never grain.', 'Skip flavored and fruit-on-the-bottom tubs; that is where the added sugar is.'],
  why: 'Flavored yogurt carries added sugar; plain is milk and cultures. Whole-milk yogurt keeps the milkfat the milk came with.',
  short_answer: 'Plain Greek yogurt from 100% grass-fed milk. Plain organic whole-milk yogurt is next. Flavored tubs are where the added sugar is.',
};
const YOG_DO = 'Check the ingredients for milk and cultures, with nothing after them.';
const YOG_TIPS = {
  'Greek/strained is higher protein; whole-milk versions are more filling.': 'Greek or strained yogurt is thicker; whole-milk versions are more filling.',
  'Greek and skyr are strained: thicker, more protein per spoon.': 'Greek and skyr are strained: thicker, with less whey.',
};
const YOG_DETAIL_OLD = 'Plain yogurt, especially Greek or strained, is a clean high-protein whole food.';
const YOG_DETAIL_NEW = 'Plain yogurt, especially Greek or strained, is a whole food: milk and cultures.';
const YOG_SKYR = 'Strained. Thicker, with less whey.';
const YOG_LABELS = [
  { term: 'Greek', meaning: 'Yogurt strained to remove whey, which leaves it thicker.' },
  { term: 'Plain', meaning: 'No added sugar or flavoring.' },
];

const BUTTER = {
  decision: 'Deepest yellow butter: cream, and salt if salted.',
  tier_note: 'Color is the reading: carotene from grass turns the fat deep yellow.',
  why: 'Carotene from the grass goes into the fat. The fatty-acid profile shifts with it, omega-3 included.',
  cart_pick: 'Deep yellow butter',
  pick_steps: ['Skip tubs and spreads; butter comes as a block or a stick.', 'How it was raised: see Milk.'],
};
const BUTTER_DO = 'Pick the deepest yellow block through the wrapper window. Grass-fed runs near orange.';
const OTHERS = {
  raw_milk: {
    tier_note: 'Milk from a known herd is old practice with thin study; the farm is the standard, not a health claim.',
    instead: 'Vat or low-temp pasteurized whole milk: gently heated, and the next rung down from raw.',
  },
  egg_duck_quail: { instead: 'Pasture-raised organic hen’s eggs from the refrigerated case, with clean, uncracked shells.' },
  ghee: { instead: 'Plain butter, the same dairy fat before the water and milk solids come out.' },
  grassfed_butter: BUTTER,
  pick_egg_whites: {},
};
const CHANGED = ['egg_labels', MILK_ID, YOG_ID, 'raw_milk', 'egg_duck_quail', 'ghee', 'grassfed_butter'];
const MINE = new Set([...CHANGED, 'pick_egg_whites']);
const MILK_ROWS = ['milk', 'whole milk', 'a gallon of milk', 'gallon of milk', 'milk carton', 'carton of milk'];
const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
const CLAIM_LOCK = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const BRAND = /kerrygold|oikos|siggi|chobani|fage|stonyfield|horizon organic|organic valley|vital farms|pete (and|&) gerry|happy egg|tillamook|land o.?lakes|kalona|maple hill|straus|alexandre/i;
const D4 = /at home with|stir|top it|mix it/i;

test('C1 the Eggs card carries the worked example', () => {
  const e = now('egg_labels');
  const b = was('egg_labels');
  for (const [k, v] of Object.entries(EGG)) assert.deepEqual(e[k], v, `egg_labels.${k}`);
  assert.equal(reviewed.get('egg_labels')?.do, EGG_DO);
  assert.equal(b.watch_out.length, EGG_WATCH_ORDER.length, 'HEAD watch_out count moved; spec is stale');
  assert.deepEqual(e.watch_out, EGG_WATCH_ORDER.map((i) => b.watch_out[i]));
  assert.deepEqual(e.labels_decoded, [...b.labels_decoded, EGG_LABEL]);
  assert.ok(b.buying_tips.includes(EGG_OLD_CHEAP) && b.science.includes(EGG_OLD_CHEAP) && b.detail.includes(EGG_DETAIL_OLD), 'HEAD strings moved; spec is stale');
  assert.deepEqual(e.buying_tips, b.buying_tips.map((s) => (s === EGG_OLD_CHEAP ? EGG_CHEAP : s)));
  assert.equal(e.science, b.science.replace(EGG_OLD_CHEAP, EGG_CHEAP));
  assert.equal(e.detail, b.detail.replace(EGG_DETAIL_OLD, EGG_DETAIL_NEW));
  const named = [...Object.keys(EGG), 'watch_out', 'labels_decoded', 'buying_tips', 'science', 'detail'];
  assert.deepEqual(without(e, named), without(b, named), 'egg_labels: a field outside the spec changed');
  assert.doesNotMatch(copy(e).join('\n'), /cheapest/i);
});

test('C2 the Milk card carries the worked example; raw-milk risk lines unchanged', () => {
  const m = now(MILK_ID);
  const b = was(MILK_ID);
  for (const [k, v] of Object.entries(MILK)) assert.deepEqual(m[k], v, `milk.${k}`);
  assert.equal(reviewed.get(MILK_ID)?.do, MILK_DO);
  assert.equal(m.watch_out[2], MILK_UHT);
  assert.deepEqual(m.watch_out.filter((s) => s !== MILK_UHT), b.watch_out, 'milk watch_out: additions only');
  assert.deepEqual(m.labels_decoded, [...b.labels_decoded, ...MILK_LABELS]);
  const moved = nonEmpty(was('pick_milk')?.aliases ?? [], 'pick_milk aliases at HEAD', 1);
  assert.deepEqual(m.aliases, [...b.aliases, ...moved.filter((a) => !b.aliases.includes(a))]);
  const named = [...Object.keys(MILK), 'watch_out', 'labels_decoded', 'aliases'];
  assert.deepEqual(without(m, named), without(b, named), 'milk: a field outside the spec changed');
  assert.deepEqual(lint.headlineHedge(m.decision), []);
  assert.doesNotMatch(JSON.stringify(m), /test results/i);
  assert.deepEqual(now('raw_milk').watch_out, was('raw_milk').watch_out, 'raw-milk risk lines');
});

test('C3 the Yogurt card carries the worked example', () => {
  const y = now(YOG_ID);
  const b = was(YOG_ID);
  for (const [k, v] of Object.entries(YOG)) assert.deepEqual(y[k], v, `yogurt.${k}`);
  assert.equal(reviewed.get(YOG_ID)?.do, YOG_DO);
  for (const old of Object.keys(YOG_TIPS)) assert.ok(b.buying_tips.includes(old), `HEAD tip moved: ${old}`);
  assert.deepEqual(y.buying_tips, b.buying_tips.map((s) => YOG_TIPS[s] ?? s));
  assert.ok(b.detail.startsWith(YOG_DETAIL_OLD), 'HEAD detail moved; spec is stale');
  assert.equal(y.detail, YOG_DETAIL_NEW + b.detail.slice(YOG_DETAIL_OLD.length));
  assert.ok(b.labels_decoded.some((l) => l.term === 'Greek / skyr'), 'HEAD label moved');
  assert.deepEqual(y.labels_decoded, [...b.labels_decoded.map((l) => (l.term === 'Greek / skyr' ? { ...l, meaning: YOG_SKYR } : l)), ...YOG_LABELS]);
  const named = [...Object.keys(YOG), 'buying_tips', 'detail', 'labels_decoded'];
  assert.deepEqual(without(y, named), without(b, named), 'yogurt: a field outside the spec changed');
});

test('C4 raw milk, duck and quail eggs, ghee and butter carry the spec text', () => {
  for (const [id, want] of Object.entries(OTHERS)) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    for (const [k, v] of Object.entries(want)) assert.deepEqual(e[k], v, `${id}.${k}`);
    assert.deepEqual(without(e, Object.keys(want)), without(was(id), Object.keys(want)), `${id}: a field outside the spec changed`);
  }
  assert.equal(reviewed.get('grassfed_butter')?.do, BUTTER_DO);
  assert.match(now('raw_milk').tier_note, /not a health claim/i);
});

test('C5 pick_milk is retired and the Milk card answers its rows', () => {
  assert.ok(was('pick_milk'), 'pick_milk missing at HEAD');
  assert.equal(now('pick_milk'), undefined);
  for (const row of MILK_ROWS) {
    assert.equal(idOf(matchItemToCard(row)), MILK_ID, row);
    assert.notEqual(idOf(matchItemToPick(row)), 'pick_milk', row);
  }
  for (const id of ['egg_labels', MILK_ID, YOG_ID, 'grassfed_butter']) {
    assert.equal(idOf(matchItemToCard(now(id).cart_pick)), id, `${id} cart_pick "${now(id).cart_pick}"`);
  }
});

for (const id of CHANGED) test(`C6 ${id}: pass rule and every card lint are clean`, () => {
  const e = now(id);
  assert.notDeepEqual(e, was(id), `${id} unchanged`);
  assertPassRule(null, was(id), e);
  assert.deepEqual(lint.readability(e), []);
  assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: reviewed.get(id)?.do || '' })), []);
  for (const f of [lint.lintPickSteps, lint.lintCulinaryAim, lint.lintRepeatedClaim]) assert.deepEqual(f(e), [], `${id} ${f.name}`);
});

test('C6 pick_egg_whites: unchanged and pick-lint clean', () => {
  assert.deepEqual(now('pick_egg_whites'), was('pick_egg_whites'));
  assert.deepEqual(lint.lintPick(now('pick_egg_whites')), []);
});

test('C7 new copy passes the claim-lock, price, punctuation and brand greps', () => {
  const added = nonEmpty(CHANGED.flatMap(fresh), 'CA-4a new strings', 20);
  for (const s of added) {
    assert.doesNotMatch(s, CLAIM_LOCK, s);
    assert.doesNotMatch(s, PRICE, s);
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
  }
  for (const id of MINE) assert.doesNotMatch(copy(now(id)).join('\n'), BRAND, id);
  for (const id of [...MINE].filter((i) => i !== YOG_ID)) assert.doesNotMatch(now(id).tier_note ?? '', D4, id);
});

test('C8 forced section lints: no hit on a CA-4a card', () => {
  for (const id of CHANGED) assert.notDeepEqual(now(id), was(id), `${id} unchanged`);
  const hits = lint.lintSections([TIP], kb.entries);
  assert.deepEqual(hits.filter((h) => h.id && MINE.has(h.id)), []);
  assert.deepEqual(hits.filter((h) => h.code === 'SECTION_PHRASE_REPEATED' && h.ids.every((i) => MINE.has(i))), []);
  assert.deepEqual(hits.filter((h) => h.code === 'SECTION_TIP_HANDLING'), []);
});

test('C9 doLines.json carries the new do lines', () => {
  for (const s of [EGG_DO, MILK_DO, YOG_DO, BUTTER_DO]) assert.ok(doLines.includes(JSON.stringify(s).slice(1, -1)), s);
});
```

## ANCHOR server/kristy_perimeter_kb.json:589
```
      "decision": "Corn- and soy-free first, then organic, then pasture-raised.",
      "why": "Space claims say nothing about the ration. A pasture-raised hen fed soy and corn is still a hen fed soy and corn.",
      "short_answer": "Cage-free, free-range and pasture-raised are all space claims. None of them says what the hen ate. Most pasture-raised hens are still on soy and corn. The order that matters: soy-free and corn-free first, then organic, then pasture-raised.",
```

## ANCHOR server/kristy_perimeter_kb.json:616
```
      "kristy_take": "Feed, then organic, then room. The space words are the ones everybody sells.",
      "cart_pick": "Soy-free pasture-raised eggs",
      "buying_tips": [
        "‘Soy-free’ and ‘corn-free’ are the only words on the carton about the ration.",
```

## ANCHOR docs/do-lines-review.md:54
```
| `grassfed_butter` | eggs_dairy | Grass-fed butter first, then any real butter: cream, and salt if salted. | Pick the deepest yellow block through the wrapper window. Grass-fed runs near orange. | — |
| `whole_vs_reduced_fat_milk` | eggs_dairy | Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed. | Ask the farm how it handles milk; a carton dated months out is ultra-pasteurized. | — |
| `cheese_real_vs_processed` | eggs_dairy | Block cheese is milk, cultures, salt and enzymes, and nothing else. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Flavored yogurt carries added sugar; plain is milk and cultures. | Take the big plain tub, not the single-serve fruit cups. | — |
```

## ANCHOR server/lib/doLines.json:181
```
  "whole_spices": "Toast them in a dry pan until they smell, then grind.",
  "whole_vs_reduced_fat_milk": "Ask the farm how it handles milk; a carton dated months out is ultra-pasteurized.",
  "yogurt_plain_vs_flavored": "Take the big plain tub, not the single-serve fruit cups."
```

## ANCHOR server/test/acceptance/ic7b.test.js:18
```
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const LEGAL = /\b(il)?legal\b|\blaws?\b/i;
const MILK_FRONT = 'Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.';
```

## ANCHOR server/test/acceptance/ic7b.test.js:38
```
test('C1 the Milk front is Devon\'s ruling', () => {
  const m = now('whole_vs_reduced_fat_milk');
  assert.equal(m.decision, MILK_FRONT);
  assert.deepEqual(headlineHedge(m.decision), []);
  assert.match(m.tier_note, /raw|farmer/i);
  assert.match(m.tier_note, /low-temp|organic/i);
```

## ANCHOR server/test/acceptance/ic4b.test.js:38
```
test('C1 the Eggs card', () => {
  const e = now('egg_labels');
  assert.equal(e.title, 'Eggs');
  assert.equal(e.decision, 'Corn- and soy-free first, then organic, then pasture-raised.');
  assert.match(e.tier_note, /feed|ate/i);
```

## ANCHOR server/test/acceptance/ic7a.test.js:84
```
test('C5 tips, watch-outs and labels moved; digestion tip dropped', () => {
  const drop = new Set(DROPPED.map(norm));
  for (const id of FOLDED) {
    const to = FOLD[id];
```

## ANCHOR server/test/counterProbe48.test.js:182
```
  assert.deepEqual(scoreEntries('milk', 3, [{ ...owner, asked_as: [] }]), []);
  assert.deepEqual(scoreEntries('milk', 3, [owner, { ...owner, id: 'other_owner' }]), []);
  assert.equal(matchItemToPick('milk carton')?.id, 'pick_milk');
  assert.equal(matchItemToPick('carton of milk')?.id, 'pick_milk');
```

## ANCHOR server/lib/kindFilter.test.js:111
```
  // 27 after K15: pick_lamb folded into the lamb_goat card, plus jerky and soup bones, 2026-10-06.
  // 29 after K16: fish sticks and anchovies, 2026-10-06.
  // 31 after K18: english muffins and pita/naan, 2026-10-06.
  assert.equal(pickEntries(perimeterKb.entries).length, 31, 'K18: 31 picks in the raw corpus');
```

## ANCHOR server/lib/perimeter.test.js:210
```
  for (const e of picks) {
    const p = e.cart_pick;
    assert.equal(typeof p, 'string');
    assert.ok(p.trim().length > 2 && p.length <= 44, `${e.id}: "${p}" is not a cart row`);
    assert.doesNotMatch(p, /[$£€%]/, `${e.id} carries a price or percent`);
```

## ANCHOR server/scripts/listMatchProbe.js:316
```
// A named card the corpus owns must be the one attached; a neighbour stealing the row is WRONG.
// `chicken_cuts_basics` carries the bare alias `chicken`, so the rotisserie row is the hub test.
const OWNED_BY = { 'rotisserie chicken': 'rotisserie_chicken' };
for (const [name, slug] of Object.entries(OWNED_BY)) {
```

Anchors are read at `8b49633`. CA-3 lands first and may shift KB line numbers and the `perimeter.test.js`, `kindFilter.test.js` and `OWNED_BY` lines; locate by the quoted text, not the number.

## Claim trace (one row per new sentence)

| Card.field | Sentence (short) | Trace |
| --- | --- | --- |
| Eggs.decision | all three together | KB egg_labels decision :589 and detail :592 (the three tiers); plan worked example |
| Eggs.tier_note | neither in the hens’ feed | KB egg_labels detail :592 "Both ‘soy-free’ and ‘corn-free’ have to be printed outright"; :619 |
| Eggs.tier_note | “soy-free” alone can still mean corn | KB :592 (each word printed separately) |
| Eggs.instead | soy-free, organic, pasture-raised rungs | KB :589 ladder; card-align-sources.md §3a 7 CFR 205.237 (organic feed) |
| Eggs.pick_steps[0] | pasture-raised, audited only with a seal | KB :621 and :592 "paired with a third-party certification … a real and audited claim"; card-align-sources.md §4/§4b Certified Humane |
| Eggs.pick_steps[1] | organic = organic feed and outdoor access | card-align-sources.md §3a 205.237, §3b 205.239 |
| Eggs.pick_steps[2] | cage-free, vegetarian-fed promise no outdoors | KB :639 "Its cage-free tier requires no outdoor access at all"; KB :659 vegetarian-fed is a ration claim |
| Eggs.why | hens eat what they are given | KB :590 "Space claims say nothing about the ration" |
| Eggs.short_answer | three sentences, ladder and seal | KB :589/:592/:621 |
| Eggs.kristy_take | feed, organic, pasture on one carton | KB :616 rephrased |
| Eggs.buying_tips/science | lowest-cost animal foods | KB :623/:659 ("cheapest complete proteins", narrowed) |
| Eggs.detail | all three on one carton | KB :592 last sentence, rephrased to the new front |
| Eggs.label | neither corn nor soy; both printed | KB :592 |
| Eggs do line | three words plus pasture seal | KB :621 |
| Milk.decision | low-temp pasteurized | ic7b :20 ruling, "organic" → "pasteurized" per plan worked example |
| Milk.tier_note | 145°F 30 min; 161°F 15 s | card-align-sources.md §5 :125/:130 (PMO), §5b :146-147 (21 CFR 131.3) |
| Milk.instead | organic rules, pasture through grazing season | card-align-sources.md §3b :72 7 CFR 205.239(c) |
| Milk.pick_steps[0] | raw = unpasteurized | KB pick_milk decision :5691 |
| Milk.pick_steps[1] | vat or low-temperature printed | card-align-sources.md §5 (vat/LTLT) |
| Milk.pick_steps[2] | grass and hay, never grain | card-align-sources.md §1 :17-23 (FSIS: forage incl. hay, no grain), §2 :42 (AGW) |
| Milk.why | heat, homogenizing, skimming; whole keeps milkfat | dairy-eggs-sources.md §1 msu-milk (:39), floridamilk-fatcontent (:64); section cited, quote line not re-read by planner |
| Milk.short_answer | about 280°F | card-align-sources.md §6 :162 21 CFR 131.3(c) |
| Milk.watch_out (new) | UHT about 280°F, skip | §6 :162 |
| Milk.labels | vat 145°F 30 min; ultra 280°F 2 s | §5b :146, §6 :162 |
| Milk do line | pasteurization words, grass-fed seal | §5, §2 |
| Yogurt.decision/short_answer | plain Greek, 100% grass-fed | plan worked example; KB yogurt :1438; §2 grassfed dairy standard |
| Yogurt.tier_note | plain = no added sugar, sweeten at home | KB yogurt :1439/:1483 |
| Yogurt.instead | organic whole-milk next | KB :1451 cart_pick (whole-milk); §3a |
| Yogurt.pick_steps[0], label Greek, tip, skyr meaning | strained, less whey | KB :1457/:1476 "strained … thicker"; "whey" has no archive quote (Open question 4) |
| Yogurt.pick_steps[1] | grass and hay, never grain | §1, §2 |
| Yogurt.pick_steps[2], why, label Plain | added sugar in flavored | KB :1438/:1439 |
| Yogurt.why[2] | whole-milk keeps milkfat | KB :1455 "whole-milk versions" ; dairy-eggs-sources.md §1 :64 |
| Yogurt.detail | whole food: milk and cultures | KB :1441, :1438 |
| raw_milk.tier_note | old practice, thin study, not a health claim | KB raw_milk :1560 shortened |
| raw_milk.instead | vat/low-temp gently heated, next rung | KB raw_milk label :1557 |
| egg_duck_quail.instead | hen’s eggs, refrigerated, clean shells | KB egg_labels front; egg_duck_quail pick_steps :7056-7057 |
| ghee.instead | butter before water and milk solids come out | KB ghee why/labels "butter with the water and milk solids removed" |
| Butter.decision | deepest yellow; cream, salt if salted | KB :1170, :1172 |
| Butter.tier_note | carotene from grass turns the fat yellow | KB :1171/:1172 |
| Butter.why | omega-3 included | KB :1193 (old tier_note) |
| Butter.pick_steps | tubs and spreads skipped; pointer | KB grassfed_butter watch_out (tub spread); healthFirst.test.js:82 pointer form |

## Independent check script (admin-run; not part of the build)

`/Users/m1/kristy/.pipeline/runs/ca-4a/counts.mjs`: loads the KB and `lintSections`, prints (a) the forced-flag eggs_dairy hits filtered to the CA-4a ids, (b) the pick count, (c) `matchItemToCard` for the six milk rows and the four cart_picks. Run BEFORE (at the CA-3 commit) and AFTER; diff. Expected AFTER: (a) `[]`, (b) BEFORE − 1, (c) every row prints its own slug.

## Prerequisites
- CA-3a and CA-3b committed. STOP BLOCKED if `git diff 8b49633 -- server/kristy_perimeter_kb.json` shows a change inside any CA-4a id, or `pick_milk`.
- Env: node ≥20, git (read-only: `git show` in the acceptance test), grep. No network. No Supabase writes (`--dry-run` only). No browser.

## Answers
- Reads and runtime: `npm test` ~1-3 min. Read only `read_full` plus the owned files.
- Do not edit `passRule.js` or k5-k11 (k14 C12 pins them at `8c7112e`). Do not edit any test outside Step 6.
- `do` lines live in `docs/do-lines-review.md` and are generated into `doLines.json` by `node scripts/buildDoLines.js` (from `server/`). Never hand-edit `doLines.json`.
- STOP BLOCKED (quote the evidence) if: a lint fires on a string given here; `ic4b.test.js:43` goes red; the pass rule reports a lost number or label term; HEAD differs from a "spec is stale" assertion; an eggs_dairy L2 group mixing CA-4a and CA-4b ids can only be cleared by changing a CA-4a string; a test outside Step 6 pins a changed string; a milk row lands on another card after the aliases move.
- A Step 6 line whose quoted old text is already gone (CA-3 changed it): skip that edit if the new behaviour holds, else STOP.
- Limits: no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- Commit (admin): message ends "Not migrated."
- Report ≤30 lines: READY or NOT READY; acceptance count; `npm test` count; probe wrong count; the Step 0 hit list; each STOP or skipped Step 6 edit.

## Tried and rejected
- Rewriting the Milk `buying_tips` old-ladder sentence: depth, not a contradiction of the front strong enough to block; left for a later pass (OK rough edge).
- Keeping `pick_milk` with a new decision: D8 retires it; its "find the word pasteurized" line contradicts raw-first.
- Changing `pick_egg_whites` to dodge a section n-gram: no baseline hit names it; it stays byte-identical.
- Keeping "grass-fed" on the Butter front: D2 rule 3 puts the animal's diet in the section rule; Butter keeps its own observable (color). Devon may reverse in one line (Open question 2).
- Adding sources: CA-2 archived everything this piece cites.
