# ca-4b — The other sixteen eggs_dairy cards: cheese, cultured dairy, cream, plant milks

```json
{
  "id": "ca-4b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json"
  ],
  "read_full": [
    "docs/CARD-ALIGNMENT-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/ca-1.test.js",
    "server/test/acceptance/ca-4a.test.js",
    "server/test/acceptance/ic7b.test.js",
    "VOICE_SPEC.md",
    "server/lib/counterCards.js",
    "server/lib/counterCardLint.js",
    "server/lib/listMatch.js",
    "server/lib/counterReach.test.js",
    "server/lib/counterCardLint.test.js",
    "server/lib/kindFilter.test.js",
    "server/lib/counterDecision.test.js",
    "server/lib/counterPath.test.js",
    "server/lib/perimeter.test.js",
    "server/lib/perimeter.js",
    "server/lib/testGuards.js",
    "server/scripts/listMatchProbe.js",
    "server/scripts/buildDoLines.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/test/acceptance/k8.test.js",
    "server/test/acceptance/k19.test.js",
    "server/test/acceptance/k21.test.js",
    "server/test/acceptance/k22.test.js",
    "server/test/counterProbe48.test.js",
    "server/test/acceptance/ic8a.test.js",
    "server/test/acceptance/ic8b.test.js",
    "docs/research/dairy-eggs-sources.md",
    "docs/research/card-align-sources.md"
  ],
  "verify": "node --test server/test/acceptance/ca-4b.test.js && (cd server && npm test) && node server/scripts/listMatchProbe.js && node server/scripts/commitGuard.js",
  "token_ceiling": 100000
}
```

Repo kristy, branch main. T2 docs refresh, 2026-10-16; plan approved 2026-10-14 on defaults Q1–Q3.
- Route: dv T2; critic FIDELITY required. Not parallel-safe: the build owns the KB.
- Baseline: CA-4a shipped at a392e36. Observed HEAD is 0b23dbc9dfb3249d791283cb2f063be07cd6c9d4; git diff a392e36..HEAD -- server/ docs/do-lines-review.md is empty. All comparisons and BEFORE use a392e36.
- Scope: sixteen rewrites, no retirements or folds. Card counts: R 16, RT 0, F 0, K 0; text authored 16.
- This refresh writes only .pipeline/specs/ca-4b.md and .pipeline/runs/ca-4b/. The header owns describes the later build. The acceptance file is embedded for builder installation; its review copy is under runs, never server/ during this refresh.

## Alignment block

**Done means:** every Step 1 field is exact; every other field and every outside entry equals a392e36. All sixteen cards have an instead, every card lint passes, and forced eggs_dairy section lints return []. Fronts name the first rung without protein framing. Both raw-dairy watch_out arrays are byte-identical. Every new sentence is claim-traced; no new health claim, concern, statistic, first person, brand or price. All criteria below pass.

**Out of scope:** CA-4a cards, section rules/CA-5 flags, sources, aliases, asked_as, matcher/engine, existing tests, client, iOS, migration and git writes.

**OK rough edges:** unchanged paid-depth protein/fortification facts remain, including dairy_case.buying_tips and goat detail/science. Existing em-dashes in unchanged do lines remain. Cheese depth keeps existing relative-cost wording. The dairy hub chooses type first; its type cards own individual rungs. The plant-butter sunflower label example remains descriptive; the front and G7 step explicitly skip that oil.

**Ship bar:** a raw-dairy risk sentence changes, a claim lacks trace, an existing test must be edited, a CA-4a entry changes, a forced section hit remains, a changed cart pick misses or reaches another card, or any new string violates the claim lock.

## Steps (the change, old → new)

Every string below is authoritative, including curly quotes. The refresh corrections are already incorporated; a builder must STOP on a new lint failure, not improvise wording.

### 1. server/kristy_perimeter_kb.json

#### plain_kefir

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Plain kefir: milk and cultures alone." | "Plain kefir from 100% grass-fed whole milk." |
| cart_pick | "Plain kefir from the cold case" | "100% grass-fed whole-milk plain kefir" |
| instead | "(absent)" | "Plain organic whole-milk kefir is the next bottle down." |
| pick_steps | ["Pick the bottle labeled plain, not flavored.","Take it from the refrigerated case and keep it cold."] | ["Pick the bottle labeled plain, not flavored.","100% grass-fed on kefir means the cows ate grass and hay, never grain.","Take it from the refrigerated case and keep it cold."] |

All fields not listed stay byte-identical to a392e36.

#### raw_kefir

| field | a392e36 | build text |
| --- | --- | --- |
| tier_note | "Culturing milk to keep it is among the oldest preservation methods and barely studied as a modern product, so the case for it is the live ferment, not a health outcome." | "Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome." |
| instead | "(absent)" | "Plain kefir from 100% grass-fed whole milk, the next bottle down from raw." |

All fields not listed stay byte-identical to a392e36.

#### sour_cream

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Sour cream soured by bacteria, not by an added acid." | "Sour cream made from cream soured by bacteria, nothing else added." |
| cart_pick | "Cultured sour cream" | "Cream and cultures only sour cream" |
| instead | "(absent)" | "Plain whole-milk yogurt, its only sugar the lactose from the milk." |
| pick_steps | ["Pick sour cream or cultured sour cream before acidified sour cream.","Check the name for “acidified”; added acids did the souring."] | ["Pick sour cream or cultured sour cream before acidified sour cream.","Read the ingredients for cream and cultures, with nothing listed after them.","Check the name for “acidified”; added acids did the souring."] |

All fields not listed stay byte-identical to a392e36.

#### cream_cheese

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Cream cheese by its standard name, at least 33% milkfat." | "Cream cheese by its standard name, at least 33% milkfat, no stabilizers." |
| cart_pick | "Cream cheese with a culture listed" | "Stabilizer-free cream cheese" |
| instead | "(absent)" | "Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most." |
| pick_steps | ["Look for “cream cheese” as the name; that name carries the standard.","Find a culture in the list; stabilizers may follow, up to 0.5 percent."] | ["Look for “cream cheese” as the name; that name carries the standard.","Stabilizers are allowed up to 0.5 percent; choose the package that lists none."] |

All fields not listed stay byte-identical to a392e36.

#### cottage_cheese

| field | a392e36 | build text |
| --- | --- | --- |
| instead | "(absent)" | "Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture." |

All fields not listed stay byte-identical to a392e36.

#### cheese_real_vs_processed

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Block cheese is milk, cultures, salt and enzymes, and nothing else." | "Block cheese with a short list, real cheese by its front name." |
| tier_note | "The starch, cellulose and natamycin on the bag are printed facts; buying the block instead is the whole-food standard." | "The starch and cellulose on shreds are printed facts; the uncoated block is the standard." |
| instead | "(absent)" | "Bagged shreds named cheese: real cheese, coated so the strands stay apart." |
| short_answer | "Real cheese is basically milk, cultures, salt and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block." | "Real cheese is basically milk, salt, cultures and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block." |
| science | "Real cheese is milk, cultures, salt and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind." | "Real cheese is milk, salt, cultures and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind." |

All fields not listed stay byte-identical to a392e36.

#### raw_aged_cheese

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Raw-milk cheese aged past sixty days is legal and already stocked." | "Raw-milk cheese aged past sixty days, its maker and herd named." |
| tier_note | "Aging raw milk into cheese predates refrigeration and the sixty-day rule; the months on the rind are history as the evidence, not a health claim." | "Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence." |
| instead | "(absent)" | "Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either." |

All fields not listed stay byte-identical to a392e36.

#### goat_sheep_dairy

| field | a392e36 | build text |
| --- | --- | --- |
| why | "Goat milk has less lactose than cow’s milk and different forms of proteins." | "Goat milk has less lactose than cow’s milk." |
| short_answer | "Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk, with different forms of proteins. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego." | "Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego." |
| instead | "(absent)" | "Goat yogurt or goat butter, with goat milk named in the ingredients." |

All fields not listed stay byte-identical to a392e36.

#### cream_vs_creamer

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Non-dairy creamer is oil, sugar and thickeners, with no milk." | "Half-and-half is milk and cream; non-dairy creamer is oil and sugar." |
| instead | "(absent)" | "Heavy cream with cream as the only ingredient on the list." |
| pick_steps | ["Read the milkfat: heavy cream is 36% or more, half-and-half 10.5 to 18%.","Read the list too: even real cream can carry carrageenan or gellan gum.","On flavored creamers, read the sugar line first."] | ["Read the milkfat: heavy cream is 36% or more, half-and-half 10.5 to 18%.","Read the list too: even real cream can carry carrageenan or gellan gum.","A creamer list that opens on water, sugar and oil is the skip."] |

All fields not listed stay byte-identical to a392e36.

#### ice_cream

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Ice cream that meets the standard, not a lookalike." | "Ice cream that earns the name, with milkfat and no added oils." |
| instead | "(absent)" | "Frozen custard, which is ice cream made with egg yolk solids." |

All fields not listed stay byte-identical to a392e36.

#### dairy_case

| field | a392e36 | build text |
| --- | --- | --- |
| instead | "(absent)" | "Plain whole milk that has not been ultrafiltered." |

All fields not listed stay byte-identical to a392e36.

#### plant_butter

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Plant butter, read for which oils it is made from." | "Plant butter built on coconut or olive oil, never seed oil or avocado oil." |
| tier_note | "Knowing which oil leads the list is the standard for any spread." | "Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight." |
| instead | "(absent)" | "Butter: cream, and salt if salted." |
| cart_pick | "Plant butter with its oils named" | "Coconut or olive oil plant butter" |
| pick_steps | ["Find each oil named in the list; note which one comes first.","Check whether a nut milk or culture is listed, as in some versions."] | ["Find each oil named in the list; note which one comes first.","Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.","Check whether a nut milk or culture is listed, as in some versions."] |

All fields not listed stay byte-identical to a392e36.

#### almond_milk

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Unsweetened almond milk, read as a drink rather than a milk swap." | "Unsweetened almond milk with a short ingredient list, never seed oil." |
| tier_note | "Added sugars and protein on the panel decide the pick, not the name." | "An unsweetened carton with no seed oil on its list stays closest to the almond itself." |
| instead | "(absent)" | "Fortified unsweetened soy milk is the next plant drink." |
| pick_steps | ["Pick unsweetened over sweetened, vanilla or chocolate."] | ["Pick unsweetened over sweetened, vanilla or chocolate.","Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."] |

All fields not listed stay byte-identical to a392e36.

#### oat_milk

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Oat milk with its protein and fortification checked on the carton." | "Oat milk with few stabilizers in the ingredients, never seed oil." |
| tier_note | "Protein and added vitamins are composition checks; using the carton rather than assuming equivalence is the whole-food standard." | "Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick." |
| instead | "(absent)" | "Fortified unsweetened soy milk is the next plant drink." |
| pick_steps | ["Read the protein line and the added vitamins and minerals on the carton.","Read the ingredient list for stabilizers; formulations can differ in stabilizer use."] | ["Read the ingredient list for stabilizers; formulations can differ in stabilizer use.","Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."] |

All fields not listed stay byte-identical to a392e36.

#### soy_milk

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Fortified, unsweetened soy milk, the one plant drink in the dairy group." | "Fortified, unsweetened soy milk, the one plant drink in the dairy group." |
| tier_note | "Calcium and vitamin D on the panel show the fortification." | "Calcium and vitamin D on the panel show the fortification." |
| instead | "(absent)" | "Unsweetened almond milk." |

All fields not listed stay byte-identical to a392e36.

#### coconut_milk_beverage

| field | a392e36 | build text |
| --- | --- | --- |
| decision | "Carton coconut milk is a drink: coconut milk thinned with water." | "Unsweetened carton coconut milk with the fewest added gums." |
| tier_note | "A carton labeled beverage is a drink, judged by its thickeners and sugar." | "A carton labeled beverage is a drink, judged by its thickeners and sugar." |
| instead | "(absent)" | "Canned coconut milk, shredded coconut steeped and pressed." |

All fields not listed stay byte-identical to a392e36.

### 2. docs/do-lines-review.md → server/lib/doLines.json

Replace these rows exactly. All other rows stay unchanged. Only almond_milk and oat_milk change do text; the rest update the headline only. From server/, run node scripts/buildDoLines.js; never hand-edit doLines.json. Its only value changes must be the two do lines below.

```
| `plain_kefir` | eggs_dairy | Plain kefir from 100% grass-fed whole milk. | Read the ingredient list for milk and kefir cultures only. | — |
| `sour_cream` | eggs_dairy | Sour cream made from cream soured by bacteria, nothing else added. | Read the name on the tub for “cultured” or “acidified”. | — |
| `cream_cheese` | eggs_dairy | Cream cheese by its standard name, at least 33% milkfat, no stabilizers. | Read the ingredients for a culture, then count the stabilizers after it. | — |
| `cheese_real_vs_processed` | eggs_dairy | Block cheese with a short list, real cheese by its front name. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `raw_aged_cheese` | eggs_dairy | Raw-milk cheese aged past sixty days, its maker and herd named. | Read the rind label for an age in months. | — |
| `cream_vs_creamer` | eggs_dairy | Half-and-half is milk and cream; non-dairy creamer is oil and sugar. | Read the panel for milkfat percent — real cream states 36% or 10.5%. | — |
| `ice_cream` | eggs_dairy | Ice cream that earns the name, with milkfat and no added oils. | Read the small print under the flavor for “frozen dairy dessert”. | — |
| `plant_butter` | eggs_dairy | Plant butter built on coconut or olive oil, never seed oil or avocado oil. | Read the ingredient list and find which oil comes first. | — |
| `almond_milk` | eggs_dairy | Unsweetened almond milk with a short ingredient list, never seed oil. | Read the Nutrition Facts for added sugars, then calcium and vitamin D. | — |
| `oat_milk` | eggs_dairy | Oat milk with few stabilizers in the ingredients, never seed oil. | Read the ingredients for added vitamins and minerals, then the stabilizers. | — |
| `coconut_milk_beverage` | eggs_dairy | Unsweetened carton coconut milk with the fewest added gums. | Read the carton for “beverage” in the name, then the thickeners. | — |
```

## Criteria
- C1 [test] Given each id, Step 1 equals SPEC and every other field equals a392e36; every other entry, entry order and the 181/30/23 counts stay unchanged.
- C2 [test] Every id has a non-empty instead of ≤24 words, different from its cart_pick.
- C3 [test] Every id passes the pass rule, all card lints, headline hedge, 90-character decision/120-character why caps, tier-note budget and uniqueness, cart-pick limit and price veto; changed cart picks reach their own slug.
- C4 [test] Forced eggs_dairy section lints and corpus repetition budget return no violations.
- C5 [test] New strings including do lines pass claim-lock, price, punctuation, first-person, brand and D4 checks; every free front is protein-free.
- C6 [test] Changed headlines equal review column 3; both new do lines equal their fixtures and the generated doLines values.
- C7 Given the build, npm test has zero failures, listMatchProbe has zero wrong matches and commitGuard is clean. No migration.

## Contract

```json
{
  "criteria": [
    {
      "id": "C1",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js"
      ],
      "dependents": [
        "server/lib/counterCards.js",
        "server/test/acceptance/passRule.js"
      ],
      "allowed_reads": [
        "server/kristy_perimeter_kb.json"
      ],
      "expected": "Step 1 text; other fields equal a392e36",
      "test_name": "C1 <id> carries the spec text"
    },
    {
      "id": "C2",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js"
      ],
      "dependents": [
        "server/lib/counterCards.js"
      ],
      "allowed_reads": [
        "server/kristy_perimeter_kb.json"
      ],
      "expected": "instead present on all sixteen",
      "test_name": "C2 <id> has an instead"
    },
    {
      "id": "C3",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js",
        "server/lib/counterCardLint.test.js"
      ],
      "dependents": [
        "server/lib/counterCardLint.js",
        "server/test/acceptance/passRule.js",
        "server/lib/counterDecision.test.js",
        "server/lib/counterPath.test.js",
        "server/lib/perimeter.test.js",
        "server/lib/listMatch.js"
      ],
      "allowed_reads": [
        "server/lib/counterCardLint.js",
        "server/test/acceptance/passRule.js"
      ],
      "expected": "every lint []",
      "test_name": "C3 <id>: pass rule and every card lint are clean"
    },
    {
      "id": "C4",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js"
      ],
      "dependents": [
        "server/lib/counterCardLint.js",
        "server/lib/counterCards.js"
      ],
      "allowed_reads": [
        "server/lib/counterCardLint.js"
      ],
      "expected": "[]",
      "test_name": "C4 the eggs_dairy section is clean under forced section lints"
    },
    {
      "id": "C5",
      "impl": [
        "server/kristy_perimeter_kb.json"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js"
      ],
      "dependents": [],
      "allowed_reads": [
        "VOICE_SPEC.md"
      ],
      "expected": "0 grep hits",
      "test_name": "C5 new copy passes the claim-lock, price, punctuation, brand and D4 greps"
    },
    {
      "id": "C6",
      "impl": [
        "docs/do-lines-review.md"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js",
        "server/test/acceptance/ic7b.test.js"
      ],
      "dependents": [
        "server/scripts/buildDoLines.js",
        "server/lib/doLines.json"
      ],
      "allowed_reads": [
        "docs/do-lines-review.md",
        "server/lib/doLines.json"
      ],
      "expected": "review headline equals decision; doLines carries each do line",
      "test_name": "C6 review table and doLines.json follow the new fronts"
    },
    {
      "id": "C7",
      "impl": [
        "server/kristy_perimeter_kb.json",
        "docs/do-lines-review.md",
        "server/lib/doLines.json"
      ],
      "tests": [
        "server/test/acceptance/ca-4b.test.js"
      ],
      "dependents": [
        "server/scripts/listMatchProbe.js",
        "server/scripts/buildDoLines.js"
      ],
      "allowed_reads": [],
      "expected": "npm test green; probe 0 wrong; guard clean; no migration",
      "test_name": "C7 builder verification"
    }
  ],
  "dependency_evidence": [
    {
      "owned": "server/kristy_perimeter_kb.json",
      "imports": [],
      "tests": [
        "server/lib/counterCardLint.test.js",
        "server/lib/counterDecision.test.js",
        "server/lib/counterPath.test.js",
        "server/lib/perimeter.test.js",
        "server/test/acceptance/passRule.js"
      ],
      "source": "Read at a392e36; CA-4a shipped checks and the offline projection in .pipeline/runs/ca-4b/."
    },
    {
      "owned": "docs/do-lines-review.md",
      "imports": [],
      "tests": [
        "server/test/acceptance/ic7b.test.js",
        "server/test/acceptance/ca-4b.test.js"
      ],
      "source": "parseReviewTable returns only do/flag; ic7b reads raw column 3 for headlines."
    },
    {
      "owned": "server/lib/doLines.json",
      "imports": [],
      "tests": [
        "server/test/acceptance/ca-4b.test.js"
      ],
      "source": "Generated by buildDoLines.js from the review table; C6 pins both changed do lines."
    }
  ],
  "env": {
    "executables": [
      "node",
      "git",
      "grep"
    ],
    "browsers": [],
    "temp": "/Users/m1/kristy/.pipeline/runs/ca-4b",
    "network": false
  }
}
```

## Acceptance server/test/acceptance/ca-4b.test.js

```js
// CA-4b: the other sixteen eggs_dairy cards (docs/CARD-ALIGNMENT-PLAN.md CA-4). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable, sectionForCategory } from '../../lib/counterCards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { assertPassRule } from './passRule.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', 'a392e36:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const reviewText = readFileSync(join(ROOT, 'docs', 'do-lines-review.md'), 'utf8');
const reviewed = parseReviewTable(reviewText);
const reviewHeadline = id => reviewText.split('\n').find(line => line.startsWith('| `' + id + '` |'))?.split('|')[3].trim();
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const now = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);
const without = (e, keys) => Object.fromEntries(Object.entries(e ?? {}).filter(([k]) => !keys.includes(k)));
const COPY = ['decision', 'short_answer', 'why', 'detail', 'kristy_take', 'tier_note', 'question', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'instead', 'cart_pick', 'labels_decoded', 'eyebrow_short'];
const leaves = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(leaves) : v && typeof v === 'object' ? Object.values(v).flatMap(leaves) : []);
const copy = (e) => COPY.flatMap((f) => leaves(e?.[f]));
const fresh = (id) => { const old = new Set(copy(was(id))); return copy(now(id)).filter((s) => !old.has(s)); };
const words = (s) => s.trim().split(/\s+/).length;

const SPEC = {
  "plain_kefir": {
    "decision": "Plain kefir from 100% grass-fed whole milk.",
    "cart_pick": "100% grass-fed whole-milk plain kefir",
    "instead": "Plain organic whole-milk kefir is the next bottle down.",
    "pick_steps": [
      "Pick the bottle labeled plain, not flavored.",
      "100% grass-fed on kefir means the cows ate grass and hay, never grain.",
      "Take it from the refrigerated case and keep it cold."
    ]
  },
  "raw_kefir": {
    "tier_note": "Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome.",
    "instead": "Plain kefir from 100% grass-fed whole milk, the next bottle down from raw."
  },
  "sour_cream": {
    "decision": "Sour cream made from cream soured by bacteria, nothing else added.",
    "cart_pick": "Cream and cultures only sour cream",
    "instead": "Plain whole-milk yogurt, its only sugar the lactose from the milk.",
    "pick_steps": [
      "Pick sour cream or cultured sour cream before acidified sour cream.",
      "Read the ingredients for cream and cultures, with nothing listed after them.",
      "Check the name for “acidified”; added acids did the souring."
    ]
  },
  "cream_cheese": {
    "decision": "Cream cheese by its standard name, at least 33% milkfat, no stabilizers.",
    "cart_pick": "Stabilizer-free cream cheese",
    "instead": "Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most.",
    "pick_steps": [
      "Look for “cream cheese” as the name; that name carries the standard.",
      "Stabilizers are allowed up to 0.5 percent; choose the package that lists none."
    ]
  },
  "cottage_cheese": {
    "instead": "Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture."
  },
  "cheese_real_vs_processed": {
    "decision": "Block cheese with a short list, real cheese by its front name.",
    "tier_note": "The starch and cellulose on shreds are printed facts; the uncoated block is the standard.",
    "instead": "Bagged shreds named cheese: real cheese, coated so the strands stay apart.",
    "short_answer": "Real cheese is basically milk, salt, cultures and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block.",
    "science": "Real cheese is milk, salt, cultures and enzymes. ‘Pasteurized process cheese product’ needs only 51% cheese, and the name on the front is the only warning. Shreds carry a coating so the strands do not knit back together, which is why they resist melting. ‘Parmesan’ is a generic word in the US; ‘Parmigiano-Reggiano’ is protected, with a stamped rind."
  },
  "raw_aged_cheese": {
    "decision": "Raw-milk cheese aged past sixty days, its maker and herd named.",
    "tier_note": "Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence.",
    "instead": "Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either."
  },
  "goat_sheep_dairy": {
    "why": "Goat milk has less lactose than cow’s milk.",
    "short_answer": "Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego.",
    "instead": "Goat yogurt or goat butter, with goat milk named in the ingredients."
  },
  "cream_vs_creamer": {
    "decision": "Half-and-half is milk and cream; non-dairy creamer is oil and sugar.",
    "instead": "Heavy cream with cream as the only ingredient on the list.",
    "pick_steps": [
      "Read the milkfat: heavy cream is 36% or more, half-and-half 10.5 to 18%.",
      "Read the list too: even real cream can carry carrageenan or gellan gum.",
      "A creamer list that opens on water, sugar and oil is the skip."
    ]
  },
  "ice_cream": {
    "decision": "Ice cream that earns the name, with milkfat and no added oils.",
    "instead": "Frozen custard, which is ice cream made with egg yolk solids."
  },
  "dairy_case": {
    "instead": "Plain whole milk that has not been ultrafiltered."
  },
  "plant_butter": {
    "decision": "Plant butter built on coconut or olive oil, never seed oil or avocado oil.",
    "tier_note": "Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight.",
    "instead": "Butter: cream, and salt if salted.",
    "cart_pick": "Coconut or olive oil plant butter",
    "pick_steps": [
      "Find each oil named in the list; note which one comes first.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.",
      "Check whether a nut milk or culture is listed, as in some versions."
    ]
  },
  "almond_milk": {
    "decision": "Unsweetened almond milk with a short ingredient list, never seed oil.",
    "tier_note": "An unsweetened carton with no seed oil on its list stays closest to the almond itself.",
    "instead": "Fortified unsweetened soy milk is the next plant drink.",
    "pick_steps": [
      "Pick unsweetened over sweetened, vanilla or chocolate.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."
    ]
  },
  "oat_milk": {
    "decision": "Oat milk with few stabilizers in the ingredients, never seed oil.",
    "tier_note": "Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick.",
    "instead": "Fortified unsweetened soy milk is the next plant drink.",
    "pick_steps": [
      "Read the ingredient list for stabilizers; formulations can differ in stabilizer use.",
      "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed."
    ]
  },
  "soy_milk": {
    "decision": "Fortified, unsweetened soy milk, the one plant drink in the dairy group.",
    "tier_note": "Calcium and vitamin D on the panel show the fortification.",
    "instead": "Unsweetened almond milk."
  },
  "coconut_milk_beverage": {
    "decision": "Unsweetened carton coconut milk with the fewest added gums.",
    "tier_note": "A carton labeled beverage is a drink, judged by its thickeners and sugar.",
    "instead": "Canned coconut milk, shredded coconut steeped and pressed."
  }
};
const DO = {
  "almond_milk": "Read the Nutrition Facts for added sugars, then calcium and vitamin D.",
  "oat_milk": "Read the ingredients for added vitamins and minerals, then the stabilizers."
};
const IDS = nonEmpty(Object.keys(SPEC), 'CA-4b ids', 16);
const TIP = {
  section: 'eggs_dairy',
  rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.',
  checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'],
  tip_aligned: true,
  cards_aligned: true,
};
const CLAIM_LOCK = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const BRAND = /kerrygold|oikos|siggi|chobani|fage|stonyfield|horizon organic|organic valley|tillamook|land o.?lakes|kalona|maple hill|straus|alexandre|lifeway|philadelphia|daisy|good culture|ben (and|&) jerry|haagen|silk|oatly|califia|planet oat|elmhurst|earth balance|country crock|miyoko|coffee mate|international delight/i;
const D4 = /at home with|stir|top it|mix it/i;

for (const id of IDS) test(`C1 ${id} carries the spec text`, () => {
  const want = SPEC[id];
  assert.ok(Object.keys(want).length > 0, `${id}: spec text not filled`);
  for (const [k, v] of Object.entries(want)) assert.deepEqual(now(id)[k], v, `${id}.${k}`);
  assert.deepEqual(without(now(id), Object.keys(want)), without(was(id), Object.keys(want)), `${id}: a field outside the spec changed`);
});

for (const id of IDS) test(`C2 ${id} has an instead`, () => {
  const e = now(id);
  assert.ok(typeof e.instead === 'string' && e.instead.trim(), `${id}: no instead`);
  assert.ok(words(e.instead) <= 24, `${id}: instead runs ${words(e.instead)} words`);
  assert.notEqual(e.instead, e.cart_pick);
});

for (const id of IDS) test(`C3 ${id}: pass rule and every card lint are clean`, () => {
  const e = now(id);
  assertPassRule(null, was(id), e);
  assert.deepEqual(lint.readability(e), []);
  assert.deepEqual(lint.headlineHedge(e.decision), []);
  assert.ok(e.decision.length <= 90, `${id}: decision exceeds 90 characters`);
  assert.ok(e.why.length <= 120, `${id}: why exceeds 120 characters`);
  assert.ok(words(e.tier_note) >= 5 && words(e.tier_note) <= 20, `${id}: tier_note budget`);
  assert.doesNotMatch(e.tier_note, /[.!?]\s+\S/);
  assert.equal(kb.entries.filter(x => x.tier_note === e.tier_note).length, 1, `${id}: tier_note not unique`);
  assert.ok(e.cart_pick.length <= 46, `${id}: cart_pick exceeds 46 characters`);
  assert.doesNotMatch(e.cart_pick.replace(/^100% /, ''), /[$£€%]/, `${id}: counterPath price check`);
  if (SPEC[id].cart_pick) assert.equal(matchItemToCard(e.cart_pick)?.slug, id, `${id}: cart_pick match`);
  assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: reviewed.get(id)?.do || '' })), []);
  for (const f of [lint.lintPickSteps, lint.lintCulinaryAim, lint.lintRepeatedClaim]) assert.deepEqual(f(e), [], `${id} ${f.name}`);
});

test('C4 the eggs_dairy section is clean under forced section lints', () => {
  for (const id of IDS) assert.notDeepEqual(now(id), was(id), `${id} unchanged`);
  assert.deepEqual(lint.lintSections([TIP], kb.entries), []);
  assert.deepEqual(lint.lintCorpus(kb.entries.filter(e => e.kind !== 'pick').map(e => projectEntry(e, {doLine: doLines[e.id]}))).violations, []);
});

test('C5 new copy passes the claim-lock, price, punctuation, brand and D4 greps', () => {
  const added = nonEmpty([...IDS.flatMap(fresh), ...Object.values(DO)], 'CA-4b new strings', 32);
  for (const s of added) {
    assert.doesNotMatch(s, CLAIM_LOCK, s);
    assert.doesNotMatch(s, PRICE, s);
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
    assert.doesNotMatch(s, BRAND, s);
    // US in retained cheese depth is a country abbreviation, not first-person us.
    assert.doesNotMatch(s.replace(/\bUS\b/g, 'United States'), /\b(I|me|my|mine|myself|we|us|our|ours|ourselves)\b/i, s);
  }
  for (const id of IDS) {
    const e = now(id);
    assert.doesNotMatch(e.tier_note ?? '', D4, id);
    assert.doesNotMatch([e.decision, e.tier_note, e.instead, e.cart_pick, ...e.pick_steps, reviewed.get(id)?.do].join(' '), /protein/i, `${id}: protein on free front`);
    assert.doesNotMatch(copy(e).join(' '), BRAND, id);
  }
});

test('C6 review table and doLines.json follow the new fronts', () => {
  for (const id of IDS) {
    if (now(id).decision !== was(id).decision) assert.equal(reviewHeadline(id), now(id).decision, id);
    if (DO[id]) assert.equal(reviewed.get(id)?.do, DO[id], `${id}: exact do line`);
    const d = reviewed.get(id)?.do;
    if (d) assert.equal(doLines[id], d, id);
  }
});

test('C1 corpus counts and every other entry stay at the shipped baseline', () => {
  assert.equal(kb.entries.filter(e => e.kind !== 'pick').length, 181);
  assert.equal(kb.entries.filter(e => e.kind === 'pick').length, 30);
  assert.equal(kb.entries.filter(e => e.kind !== 'pick' && sectionForCategory(e.category) === 'eggs_dairy').length, 23);
  assert.deepEqual(kb.entries.map(e => e.id), base.entries.map(e => e.id));
  for (const e of kb.entries.filter(e => !IDS.includes(e.id))) assert.deepEqual(e, was(e.id), e.id);
  for (const id of ['raw_kefir', 'raw_aged_cheese']) assert.deepEqual(now(id).watch_out, was(id).watch_out, id);
});
```

## ANCHOR server/kristy_perimeter_kb.json:8775

```
      "decision": "Plain kefir: milk and cultures alone.",
      "why": "Kefir is milk fermented by yeasts and bacteria. It is sold ready to drink, plain or flavored.",
      "short_answer": "Kefir is a sour, slightly fizzy milk drink fermented by yeasts and bacteria. Bottles are sold plain and flavored. Plain kefir works in smoothies or in place of buttermilk or yogurt. Keep it refrigerated.",
```

## ANCHOR server/kristy_perimeter_kb.json:4726

```
      "decision": "Kefir is milk fermented with live grains, and worth buying plain.",
      "why": "A live ferment from a named herd. The refrigerated case is the only place it exists.",
      "card_why": "Kefir is what a dairy does with milk it wants to keep, and it has been doing it for centuries. The grains turn it tangy and thick and it holds for weeks where the milk holds for days. The rule is the milk’s rule: the farm is the product. Buy it from the herd you would drink from raw, as close to the culture date as the case allows.",
```

## ANCHOR server/kristy_perimeter_kb.json:8827

```
      "decision": "Sour cream soured by bacteria, not by an added acid.",
      "why": "Cultured sour cream is soured by bacteria. Acidified sour cream is soured with added acids.",
      "short_answer": "The tub names the method. Sour cream, or cultured sour cream, is cream soured by bacteria. Acidified sour cream is soured with added acids. Both hold at least 18 percent milkfat.",
```

## ANCHOR server/kristy_perimeter_kb.json:8879

```
      "decision": "Cream cheese by its standard name, at least 33% milkfat.",
      "why": "The standard sets at least 33 percent milkfat, a bacterial culture, and stabilizers at 0.5 percent at most.",
      "short_answer": "Cream cheese is a soft, fresh cheese that does not mature. Its standard requires at least 33 percent milkfat and a bacterial culture. Stabilizers are capped at 0.5 percent. American Neufchâtel closely resembles it.",
```

## ANCHOR server/kristy_perimeter_kb.json:8931

```
      "decision": "Cottage cheese with its curd set by a culture.",
      "why": "A curd set by acid must be labeled “directly set” beside the name. Without those words, a culture set it.",
      "short_answer": "Cottage cheese is curd mixed with a creaming mixture. The label states its milkfat, at least 4 percent. Acid-set curd must say “directly set” near the name. Dry curd cottage cheese has under 0.5 percent milkfat.",
```

## ANCHOR server/kristy_perimeter_kb.json:1360

```
      "decision": "Block cheese is milk, cultures, salt and enzymes, and nothing else.",
      "why": "Real cheese is milk, cultures, salt, enzymes. Shreds add a coating to keep them apart.",
      "short_answer": "Real cheese is basically milk, cultures, salt and enzymes. ‘Pasteurized process cheese’, ‘cheese product’ or ‘cheese food’ means emulsifiers and added ingredients blended in. Bagged shreds are real cheese with an anti-caking coating. Buy the block.",
```

## ANCHOR server/kristy_perimeter_kb.json:4786

```
      "decision": "Raw-milk cheese aged past sixty days is legal and already stocked.",
      "why": "Sixty days of aging is the federal line. Past it, raw-milk cheese sells anywhere.",
      "card_why": "Aged raw-milk cheese is the raw dairy nobody has to hunt for. US rules allow it at sixty days and up, so a decent cheese counter already keeps a case of it. Sixty days of aging is a technology of its own. It is the reason an aged raw cheddar tastes of the place it came from. A young commodity block tastes of very little. The organizing principle is the milk’s: ask who made it, from which herd, and how long it sat.",
```

## ANCHOR server/kristy_perimeter_kb.json:9103

```
      "decision": "Goat or sheep dairy with the animal’s milk named on the list.",
      "why": "Goat milk has less lactose than cow’s milk and different forms of proteins.",
      "short_answer": "Goat milk averages about 3.5 percent butterfat. It contains lactose, less than cow’s milk, with different forms of proteins. Goat butter is white. Popular sheep cheeses include feta, pecorino romano, Roquefort and Manchego.",
```

## ANCHOR server/kristy_perimeter_kb.json:3579

```
      "decision": "Non-dairy creamer is oil, sugar and thickeners, with no milk.",
      "why": "Cream has a legal fat minimum. Creamer is oil, sweetener and emulsifiers built to imitate it.",
      "short_answer": "Cream is dairy with a legal fat minimum. ‘Non-dairy creamer’ is not dairy at all. It is typically water or corn syrup solids, an oil, and emulsifiers, flavors and thickeners built to imitate cream. Compare the two lists.",
```

## ANCHOR server/kristy_perimeter_kb.json:8988

```
      "decision": "Ice cream that meets the standard, not a lookalike.",
      "why": "The name “ice cream” needs at least 10 percent milkfat. Short of that, the carton says “frozen dairy dessert”.",
      "short_answer": "The name “ice cream” requires at least 10 percent milkfat and 4.5 pounds to the gallon. A product short of that is sold as “frozen dairy dessert”. It has more air and less milk fat.",
```

## ANCHOR server/kristy_perimeter_kb.json:9362

```
      "decision": "Pick the dairy type first, then read what the carton promises.",
      "why": "Each dairy type has its own card. The carton then shows added vitamins, pasture and filtering.",
      "short_answer": "Start with the type: milk, yogurt, cheese, butter, cream or a plant drink. Then read the carton. Vitamins A and D are optional in milk, so the label tells. Organic dairy animals must graze pasture.",
```

## ANCHOR server/kristy_perimeter_kb.json:9312

```
      "decision": "Plant butter, read for which oils it is made from.",
      "why": "The oils differ from one plant butter to the next, and the ingredient list names them.",
      "short_answer": "Plant butter is built on plant oils, and the ingredient list names them. One example lists coconut oil, cultured cashew milk, water, sunflower oil, sunflower lecithin, sea salt and natural flavors.",
```

## ANCHOR server/kristy_perimeter_kb.json:9156

```
      "decision": "Unsweetened almond milk, read as a drink rather than a milk swap.",
      "why": "FDA does not count almond drinks in the dairy group. Their overall nutrition is not similar to milk.",
      "short_answer": "Almond milk is watery, with a nutty flavor and no lactose. It comes sweetened, unsweetened, vanilla and chocolate. FDA suggests comparing the Nutrition Facts, including protein and added sugars.",
```

## ANCHOR server/kristy_perimeter_kb.json:6548

```
      "decision": "Oat milk with its protein and fortification checked on the carton.",
      "why": "Oat drinks vary in composition and fortification. The carton is the basis for choosing.",
      "short_answer": "The archived paper studied six original oat drinks from the UK market. Their nutritional composition and fortification varied. Check the actual carton rather than treating oat milk as one formulation.",
```

## ANCHOR server/kristy_perimeter_kb.json:9209

```
      "decision": "Fortified, unsweetened soy milk, the one plant drink in the dairy group.",
      "why": "FDA notes the Dietary Guidelines count only fortified soy drinks in the dairy group.",
      "short_answer": "Soy milk is made by soaking and grinding soybeans, boiling, then filtering. It may be sweetened, flavored and fortified. FDA places only the fortified kind in the dairy group.",
```

## ANCHOR server/kristy_perimeter_kb.json:9262

```
      "decision": "Carton coconut milk is a drink: coconut milk thinned with water.",
      "why": "Technically a coconut beverage: coconut milk blended with water, about an eighth as fatty as the can.",
      "short_answer": "Canned coconut milk is shredded coconut steeped and pressed. The carton beverage blends coconut milk with water, sugar, flavors, vitamins, preservatives and thickeners. It sits next to the soy milk.",
```

## ANCHOR docs/do-lines-review.md:55

```
| `cheese_real_vs_processed` | eggs_dairy | Block cheese is milk, cultures, salt and enzymes, and nothing else. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Plain Greek yogurt made from 100% grass-fed milk. | Check the ingredients for milk and cultures, with nothing after them. | — |
| `raw_milk` | eggs_dairy | Raw milk is worth seeking out from a farm you can name. | Buy from a farm you can visit that posts its test results. | — |
```

## ANCHOR docs/do-lines-review.md:163

```
| `almond_milk` | eggs_dairy | Unsweetened almond milk, read as a drink rather than a milk swap. | Read the Nutrition Facts for added sugars, then the protein. | — |
| `soy_milk` | eggs_dairy | Fortified, unsweetened soy milk, the one plant drink in the dairy group. | Find calcium and vitamin D on the panel, and check for added sugars. | — |
| `coconut_milk_beverage` | eggs_dairy | Carton coconut milk is a drink: coconut milk thinned with water. | Read the carton for “beverage” in the name, then the thickeners. | — |
```

## ANCHOR server/lib/doLines.json:2

```
  "almond_milk": "Read the Nutrition Facts for added sugars, then the protein.",
  "bacon": "Find the asterisk beside “no nitrates added” and read the curing ingredients.",
  "bagels": "Ask the baker about a water bath before the dough reaches the oven.",
```

## ANCHOR server/lib/counterCards.js:560

```
export function parseReviewTable(markdown) {
  const out = new Map();
  for (const raw of String(markdown || '').split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== REVIEW_COLUMNS) continue;
    // The separator row (|---|---|) and the header row are not data.
    if (/^:?-{3,}:?$/.test(cells[1])) continue;
    const slug = cells[0].replace(/^`|`$/g, '').trim();
    if (!slug || slug.toLowerCase() === 'slug') continue;
    out.set(slug, { do: cells[3], flag: cells[4] });
  }
  return out;
```

## Claim trace (one row per new sentence)

F/G/H/I row ids preserve fragment provenance. KB means server/kristy_perimeter_kb.json at a392e36; card means the named row’s own card. Card-field citations are re-anchored by content. Research references retain their named archive: dairy-eggs/de = docs/research/dairy-eggs-sources.md; card-align = docs/research/card-align-sources.md; plan = docs/CARD-ALIGNMENT-PLAN.md. Allowed fact sources remain the card’s own baseline fields and the skeleton’s research archives; approved plan decisions govern KS rankings. Unchanged sentences inside a changed multi-sentence field retain their original claims. No source URL is added or fetched.

| # | card.field | new sentence | trace |
| --- | --- | --- | --- |
| F1 | plain_kefir.decision | Plain kefir from 100% grass-fed whole milk. | card.decision "Plain kefir: milk and cultures alone."; card-align :16-17 "“100% Grass Fed” claims may only be applied to meat and meat product labels derived from cattle that were only (100%) fed grass (forage)"; card-align :42 "the diet of grassfed animals must solely be derived from grass and forage throughout their lives."; KS (whole milk and grass-fed first, per ca-4b Step 1) |
| F2 | plain_kefir.cart_pick | 100% grass-fed whole-milk plain kefir | row F1 |
| F3 | plain_kefir.instead | Plain organic whole-milk kefir is the next bottle down. | card-align :61 "## 3a. 7 CFR 205.237 Livestock feed"; KS (organic is the second rung, per ca-4b Step 1) |
| F4 | plain_kefir.pick_steps[1] | 100% grass-fed on kefir means the cows ate grass and hay, never grain. | card-align :18-19 "The diet must be derived solely from forage, and animals cannot be fed grain or grain by-products"; card-align :22-23 "Hay, haylage, baleage, silage, crop residue without grain"; G2 canonical gloss (counterCardLint.js CANONICAL_GLOSSES) |
| F5 | raw_kefir.tier_note | Culturing milk is among the oldest preservation methods, barely studied; the case is the ferment, not a health outcome. | card.tier_note (a392e36 KB:4766) "Culturing milk to keep it is among the oldest preservation methods and barely studied as a modern product, so the case for it is the live ferment, not a health outcome." (shortened, nothing added) |
| F6 | raw_kefir.instead | Plain kefir from 100% grass-fed whole milk, the next bottle down from raw. | card.detail "Made from raw milk it is the same sourcing question as the milk"; card.detail "Plain is the only version worth buying."; rows F1 and F4 sources (card-align :16-19, :42); KS (raw first, then the plain_kefir front) |
| F7 | sour_cream.decision | Sour cream made from cream soured by bacteria, nothing else added. | card.science "Sour cream, or cultured sour cream, is pasteurized cream soured by lactic acid bacteria."; card.science "Optional ingredients may improve texture, extend shelf life, or stop liquid separating out."; KS (no optional ingredients) |
| F8 | sour_cream.cart_pick | Cream and cultures only sour cream | row F7; card.labels_decoded "Cream soured by bacteria, the same food as sour cream." |
| F9 | sour_cream.instead | Plain whole-milk yogurt, its only sugar the lactose from the milk. | dairy-eggs :168-169 "Whole-milk yogurt" (in "Whole-milk yogurt\n> contains 3.25% fat"); dairy-eggs :174-175 "In plain yogurt, the sugar content will be\n> from lactose only." (one sentence across two quote lines); selected product choice per ca-4b Step 1 |
| F10 | sour_cream.pick_steps[1] | Read the ingredients for cream and cultures, with nothing listed after them. | card.buying_tips "Read the optional ingredients added for texture or shelf life."; card.detail "Optional ingredients may improve texture, extend shelf life, or stop syneresis"; KS |
| F11 | cream_cheese.decision | Cream cheese by its standard name, at least 33% milkfat, no stabilizers. | card.decision (HEAD) "Cream cheese by its standard name, at least 33% milkfat."; card.why "stabilizers at 0.5 percent at most"; KS (none is closest to milk, cream and culture) |
| F12 | cream_cheese.cart_pick | Stabilizer-free cream cheese | row F11 |
| F13 | cream_cheese.instead | Cream cheese with stabilizers listed, held by the standard to 0.5 percent at most. | card.why "The standard sets at least 33 percent milkfat, a bacterial culture, and stabilizers at 0.5 percent at most." |
| F14 | cream_cheese.pick_steps[1] | Stabilizers are allowed up to 0.5 percent; choose the package that lists none. | card.watch_out "Stabilizers are allowed, up to 0.5 percent of the cheese."; KS (choose none) |
| G1 | cottage_cheese.instead | Cottage cheese marked “directly set”, where a food-grade acid sets the curd instead of a culture. | card.watch_out (KB:8947) "“Directly set” means food-grade acid formed the curd, not a culture."; card.detail (KB:8934) "Direct acidification means an acid, not bacteria, sets the curd."; card.tier_note (KB:8970) "a directly set tub still meets the federal one" |
| G2 | cheese_real_vs_processed.decision | Block cheese with a short list, real cheese by its front name. | card.kristy_take (KB:1370) "Buy the block."; card.pick_steps (KB:1394) "Look for a short list: milk, salt, cultures, enzymes or rennet."; card.pick_steps (KB:1394) "Read the front name: ‘cheese product’"; card.labels_decoded (KB:1378) "Not cheese by the standard of identity" |
| G3 | cheese_real_vs_processed.tier_note | The starch and cellulose on shreds are printed facts; the uncoated block is the standard. | card.tier_note (KB:1388) "The starch, cellulose and natamycin on the bag are printed facts"; card.detail (KB:1363) "The shred coating is usually potato starch or powdered cellulose"; KS (the block as the standard, evidence kristys_standard) |
| G4 | cheese_real_vs_processed.instead | Bagged shreds named cheese: real cheese, coated so the strands stay apart. | card.short_answer (KB:1362) "Bagged shreds are real cheese with an anti-caking coating."; card.detail (KB:1363) "so the strands do not knit back together" |
| G5 | cheese_real_vs_processed.short_answer, sentence 1 | Real cheese is basically milk, salt, cultures and enzymes. | card.short_answer (KB:1362) "Real cheese is basically milk" (same four ingredients, reordered); card.pick_steps (KB:1394) "Look for a short list: milk, salt, cultures, enzymes or rennet." |
| G6 | cheese_real_vs_processed.science, sentence 1 | Real cheese is milk, salt, cultures and enzymes. | card.science (KB:1399) "Real cheese is milk" (same four ingredients, reordered); card.pick_steps (KB:1394) as row G5 |
| G7 | raw_aged_cheese.decision | Raw-milk cheese aged past sixty days, its maker and herd named. | card.decision (KB:4786) "Raw-milk cheese aged past sixty days"; card.buying_tips (KB:4792) "A named maker and a named herd, not just a country of origin."; `docs/research/dairy-eggs-sources.md:125-126` "all raw cheese must be aged at least" / "60 days." (quote wraps across the two lines) |
| G8 | raw_aged_cheese.tier_note | Aging raw milk into cheese predates refrigeration; the months on the rind are history, not health evidence. | card.tier_note (KB:4827) "Aging raw milk into cheese predates refrigeration" and "the months on the rind are history as the evidence" (trimmed; the HEAD sentence's "not a health claim" restated as "not health evidence") |
| G9 | raw_aged_cheese.instead | Thermized cheese, heated below pasteurization: not raw, and not fully pasteurized either. | card.labels_decoded (KB:4811) (Thermized) "Heated below pasteurization. Not raw, and not fully pasteurized either."; KS (thermized as the next rung after raw, the same ladder CA-4a gives raw_milk) |
| G10 | goat_sheep_dairy.why | Goat milk has less lactose than cow’s milk. | card.why (KB:9104) "Goat milk has less lactose than cow’s milk" (the protein clause removed) |
| G11 | goat_sheep_dairy.short_answer, sentence 2 | It contains lactose, less than cow’s milk. | card.short_answer (KB:9105) "It contains lactose, less than cow’s milk, with different forms of proteins." (the protein clause removed). The other three sentences are byte-identical. |
| G12 | goat_sheep_dairy.instead | Goat yogurt or goat butter, with goat milk named in the ingredients. | card.detail (KB:9106) "Goat milk is made into cheese, butter, ice cream and yogurt."; card.pick_steps (KB:9122) "Read the ingredients for goat milk or sheep milk."; card.tier_note (KB:9138) "The animal’s milk named in the ingredients" |
| H1 | cream_vs_creamer.decision | Half-and-half is milk and cream; non-dairy creamer is oil and sugar. | card.labels_decoded (KB:3610) "10.5 to 18% milkfat. Milk and cream."; card.buying_tips (KB:3592) "‘Non-dairy creamer’ is oil, sweetener and emulsifiers. It is not cream."; de:97 "coffee creamers are water, sugar, and vegetable oil." |
| H2 | cream_vs_creamer.instead | Heavy cream with cream as the only ingredient on the list. | de:90 "heavy cream is defined as having no less than 36% milkfat content."; card.buying_tips (KB:3592) "Even real cream can carry carrageenan or gellan gum. A short list is still worth checking."; KS (cream alone on the list is the closest-to-nature carton) |
| H3 | cream_vs_creamer.pick_steps[2] | A creamer list that opens on water, sugar and oil is the skip. | card.watch_out (KB:3599) "Water, sugar and vegetable oil are the usual first three ingredients."; KS (skip) |
| H4 | ice_cream.decision | Ice cream that earns the name, with milkfat and no added oils. | card.tier_note (KB:9027) "FDA defines the ice cream name"; card.why (KB:8989) "The name “ice cream” needs at least 10 percent milkfat."; card.detail (KB:8991) "Ice cream excludes other food fats, except incidental amounts." |
| H5 | ice_cream.instead | Frozen custard, which is ice cream made with egg yolk solids. | card.detail (KB:8991) "Frozen custard is ice cream with 1.4 percent egg yolk solids."; card.labels_decoded (KB:9013) "Ice cream made with 1.4 percent egg yolk solids." |
| H6 | dairy_case.instead | Plain whole milk that has not been ultrafiltered. | card.detail (KB:9365) "Ultrafiltered milk is pushed through a porous membrane under pressure, a process called ultrafiltration."; KS (the unfiltered carton is the closer-to-nature pick) |
| H7 | plant_butter.decision | Plant butter built on coconut or olive oil, never seed oil or avocado oil. | card.short_answer (KB:9314) "Plant butter is built on plant oils, and the ingredient list names them." and "One example lists coconut oil"; plan:62 G6 "tallow, olive oil, or coconut oil" (Devon ruling, `kristys_standard`); plan:80 "Avocado oil is a skip alongside the seed oils."; plan:414 "any seed oil in their ingredient guidance is a skip". The approved plan governs this KS ranking; the olive-oil and both skip clauses rest on it as KS. |
| H8 | plant_butter.tier_note | Each oil in a plant butter is named on its ingredient list, so the skip is in plain sight. | card.why (KB:9313) "The oils differ from one plant butter to the next, and the ingredient list names them."; KS (the skip, per row H7) |
| H9 | plant_butter.instead | Butter: cream, and salt if salted. | Skeleton Step 1 explicitly supplies this wording; approved plan Butter worked example repeats “cream, and salt if salted.” KS redirect, not a new health claim. |
| H10 | plant_butter.cart_pick | Coconut or olive oil plant butter | card (row H7, the decision's first rung) |
| H11 | plant_butter.pick_steps[1] | Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. | plan:63 G7 gloss "sunflower, safflower, canola, soybean, corn, and cottonseed" (the engine KB `seed_oil` entry's own names); card.short_answer (KB:9314) names "sunflower oil"; plan:414 (skip). KS ruling supplied by the approved plan, as in row H7. |
| I1 | almond_milk.decision | Unsweetened almond milk with a short ingredient list, never seed oil. | KB:9158 "It comes sweetened, unsweetened, vanilla and chocolate."; KS (short list); KS D7/G7 (seed oil skip, not a composition claim) |
| I2 | almond_milk.tier_note | An unsweetened carton with no seed oil on its list stays closest to the almond itself. | KS (closest-to-nature); KS D7/G7 |
| I3 | almond_milk.instead | Fortified unsweetened soy milk is the next plant drink. | KS: D1 close-second product choice, no FDA/group assertion; fortified means added vitamins/minerals in this card’s own labels_decoded at a392e36. |
| I4 | almond_milk.pick_steps[1] | Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. | `counterCardLint.js:1660` gloss verbatim; KS D7. The same line was approved on the potato chips card in CARD-ALIGNMENT-PLAN |
| I5 | oat_milk.decision | Oat milk with few stabilizers in the ingredients, never seed oil. | KB:6561 "Read for stabilizers in the ingredient list; the study compared formulations with different stabilizer use."; KS (few); KS D7/G7 |
| I6 | oat_milk.tier_note | Oat drinks differ in stabilizers and fortification, so the carton’s own list decides the pick. | KB:6549 "Oat drinks vary in composition and fortification."; KB:6561 (stabilizer use differs) |
| I7 | oat_milk.instead | Fortified unsweetened soy milk is the next plant drink. | KS: D1 close-second product choice, no FDA/group assertion; fortified means added vitamins/minerals in this card’s own labels_decoded at a392e36. |
| I8 | oat_milk.pick_steps[1] | Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed. | as row I4 |
| I9 | soy_milk.instead | Unsweetened almond milk. | KS: D1 sideways product choice; no assertion about almond nutrition or milk equivalence. |
| I10 | coconut_milk_beverage.decision | Unsweetened carton coconut milk with the fewest added gums. | KB:9265 "thickeners such as gellan gum"; cart_pick "Unsweetened coconut milk beverage"; old decision "Carton coconut milk is a drink" (`docs/do-lines-review.md:165`); KS (fewest) |
| I11 | coconut_milk_beverage.instead | Canned coconut milk, shredded coconut steeped and pressed. | KB:9264 "Canned coconut milk is shredded coconut steeped and pressed."; KB:9277 "Reach for the can, not the carton, for full-fat coconut milk." |
| DO-almond_milk | almond_milk.do | Read the Nutrition Facts for added sugars, then calcium and vitamin D. | Own a392e36 buying_tips/detail: added sugars, vitamin D and calcium on the panel; removes protein from the free front. |
| DO-oat_milk | oat_milk.do | Read the ingredients for added vitamins and minerals, then the stabilizers. | Own a392e36 buying_tips/detail: added vitamins/minerals and differing stabilizer use; removes protein from the free front. |

## Findings, conflicts and resolutions

- F: raw_kefir’s old tier_note has 31 whitespace words, not 30; its decision was mistaken for the tier_note in the skeleton. Step 1 and the content anchors now point to the right fields.
- F versus shipped checks: perimeter permits one literal 100% anywhere, but counterPath permits it only at the start. The fragment’s trailing 100% fails. Move it to the start and put plain kefir at the end; this also repairs a Beef match without adding aliases.
- G: cheese shares only a four-word phrase with the tip, below L1’s five-word threshold. Keep its authored short_answer/science reorder as D2 ownership cleanup, not as a claim that HEAD failed L1. instead is outside L1/L2 and repeated-claim fields; EXCLUSIVITY is report-only. The front repetition is checked over all 23 cards after merging.
- H: dairy_case’s protein panel line is paid buying_tips, not a free front; retain it. science says “400 International Units”, not “400 IU”; keep it and “120 days” byte-identical. The cream do-line em-dash is old, passes the corpus budget and stays.
- H versus source list: the plant-butter redirect is explicitly supplied by the skeleton and the approved plan Butter example; that decision wins over the fragment’s UNTRACED label. D7/G6/G7 plan rulings authorize oil rankings/glosses as KS; they assert no oil-content prevalence or health outcome.
- I versus the skeleton’s protein-free scope: keeping protein in almond/oat do lines contradicts the free-front goal. Use I’s offered alternatives, an explicit narrow exception to the do-line keep rule; both are traced to those cards’ existing panel guidance.
- I versus the skeleton’s fact-source restriction: almond/oat redirects cited a sibling soy card for the FDA dairy-group claim, and soy cited a sibling almond card for milk equivalence. Keep the product choices as KS and omit those extra assertions; do not widen the source whitelist.
- I: no seed oil is named on soy or coconut today; G7 remains conditional there. Almond, oat and plant butter name the skip and carry the exact G7 gloss. “Soybean” in the gloss names an oil, not a ban on soybeans.
- C6 skeleton assumption was false: parseReviewTable returns only do/flag. Read headline from raw column 3, exactly as shipped ic7b and corrected CA-4a do.
- Contract refresh: impl is an array; C7 now has a mapping; duplicate KB evidence is consolidated; all dependent test/read paths are declared.

## Card-text changes from the verbatim fragments

The seven card-field changes below resolve the price/matcher or trace conflicts; the two do-line changes use fragment I’s supplied alternatives. Every other fragment SPEC string is verbatim.
- plain_kefir.cart_pick: "Plain whole-milk kefir, 100% grass-fed" → "100% grass-fed whole-milk plain kefir".
- sour_cream.cart_pick: "Sour cream, cream and cultures only" → "Cream and cultures only sour cream".
- cream_cheese.cart_pick: "Cream cheese with no stabilizers listed" → "Stabilizer-free cream cheese".
- plant_butter.cart_pick: "Plant butter built on coconut or olive oil" → "Coconut or olive oil plant butter".
- almond_milk.instead: "Unsweetened soy milk, fortified, the plant drink FDA places in the dairy group." → "Fortified unsweetened soy milk is the next plant drink.".
- oat_milk.instead: "Fortified unsweetened soy milk, which the Dietary Guidelines count in the dairy group." → "Fortified unsweetened soy milk is the next plant drink.".
- soy_milk.instead: "Unsweetened almond milk, read as a drink rather than a milk swap." → "Unsweetened almond milk.".
- almond_milk.do: "Read the Nutrition Facts for added sugars, then the protein." → "Read the Nutrition Facts for added sugars, then calcium and vitamin D.".
- oat_milk.do: "Compare the protein line and read the ingredients for added vitamins and minerals." → "Read the ingredients for added vitamins and minerals, then the stabilizers.".

## Assumptions

- a392e36 is the intended build baseline even though HEAD is its docs-only child; no server/review difference exists. Keep all CA-4a output exactly as shipped, including its final why and cart-pick fixes.
- The listed close-second products are settled by the skeleton/fragment choices: plain whole-milk yogurt for sour cream, heavy cream for half-and-half, thermized cheese after raw-aged, and butter after plant butter. The cream-cheese next rung is a different shelf product with stabilizers; it is not the stabilizer-free cart pick.
- D1 classifies short_answer/why/buying_tips as paid depth. The goat front-directed removals explicitly requested by the skeleton still apply; other unchanged depth remains. US in cheese science is the country abbreviation, not first-person “us”.
- Preserve fragment G’s defensive ingredient reorder and fragment I’s “gums” wording (the card already names gellan gum); neither adds a claim. Soy/coconut need no speculative oil-content assertion.
- Changed cart-pick wording may be reordered to satisfy existing retrieval and price rules; aliases remain byte-identical under D1. The leading 100% exception passes both current price checks and retains kefir’s G2 first-rung term.
- No existing test owns a superseded string requiring an edit. Existing test files are read dependencies only. Count floors are not silently promoted into corpus totals.
- No migration command is run, including dry-run, per this task’s explicit constraint. This refresh does not run the full application suite or write the build; its projection and dependency rehearsal are offline evidence, with final builder checks still required.

## Count pins at HEAD

Counts are measured from the files, not inherited from prose. No count changes in the intended CA-4b build.

| population / pin | old → HEAD | source |
| --- | --- | --- |
| Curated non-picks | 182 → 181 since 8e6133b; CA-4a BEFORE 181 → 181 | KB entries where kind !== pick; counterCardLint.test.js:443; ic8a:86; ic8b:94; ca-4a acceptance:190 |
| KB picks | 31 → 30 | KB entries where kind === pick; kindFilter.test.js:115; ca-4a acceptance:191; pick_milk retired |
| Total KB entries | 213 → 211 since 8e6133b; CA-4a BEFORE 212 → 211 | entries.length; one CA-3a fold plus one CA-4a pick retirement |
| Curated eggs_dairy | 23 → 23 | sectionForCategory(category), excluding picks |
| CA-4b rewrites | 0 authored → 16 authored; 16 ids → 16 | Step 1/SPEC |
| KTIGHT question floor / batch floor | 182 → 181 / 181 → 180 | server/test/ktight.test.js:37, :40; B03 now 10, not 11 |
| Health-first floor | 182 → 182 (floor, not curated count); measured population 183 → 182 | server/test/healthFirst.test.js:17–20 includes the family pick pick_soup_bones; count-evidence.json |
| Other lower bounds | unchanged; cart-bearing population 150 → 149 | perimeter.test.js:209 cart-bearing entries ≥30; counterCardLint.test.js:757 all entries ≥180; k19 slice 12; count-evidence.json |

## Independent check script and BEFORE

Run node .pipeline/runs/ca-4b/counts.mjs > .pipeline/runs/ca-4b/before.json before the build; retain that snapshot and use after.json for the built state. The script imports current lint code and counts actual entries. BEFORE was captured on the unchanged a392e36 server tree at the observed HEAD:

```json
{
  "baseRef": "a392e36",
  "observedHead": "0b23dbc9dfb3249d791283cb2f063be07cd6c9d4",
  "curatedCardCount": 181,
  "pickCount": 30,
  "totalEntryCount": 211,
  "eggsDairyCardCount": 23,
  "ca4bCardCount": 16,
  "sectionHitCount": 1,
  "sectionHitsByCode": {
    "SECTION_PHRASE_REPEATED": 1
  },
  "sections": [
    {
      "code": "SECTION_PHRASE_REPEATED",
      "section": "eggs_dairy",
      "form": "front",
      "ids": [
        "cheese_real_vs_processed",
        "ghee",
        "oat_milk",
        "plain_kefir"
      ],
      "phrase": "is the whole food"
    }
  ],
  "mixedSections": [
    {
      "code": "SECTION_PHRASE_REPEATED",
      "section": "eggs_dairy",
      "form": "front",
      "ids": [
        "cheese_real_vs_processed",
        "ghee",
        "oat_milk",
        "plain_kefir"
      ],
      "phrase": "is the whole food"
    }
  ]
}
```

Expected AFTER: same 181 curated / 30 picks / 23 eggs_dairy / 16 CA-4b; sectionHitCount 0 and sections []. The only BEFORE group mixes cheese/oat/plain kefir with CA-4a ghee; the CA-4b edits clear it without touching ghee.

## Prerequisites and builder STOP rules

- CA-4a is committed. STOP if git diff a392e36 -- server/kristy_perimeter_kb.json shows any CA-4b entry changed before this build, or if a content anchor no longer matches.
- Node with JSON import attributes (project engine 22.x; refresh observed v26.7.0), read-only git, no network, no browser, no migration, no git writes.
- Read declared dependencies and the supplied runs evidence. Never edit passRule or any existing test to make this batch pass. STOP and quote a pinned assertion if it fails.
- STOP on a given string failing lint, a raw risk line changing, a count mismatch, or a section hit that would require editing CA-4a or the CA-5 tip. Never delete an assertion.
- Builder report: acceptance count, npm test count, probe wrong count, every STOP. Admin commit message ends “Not migrated.”

## Tried and rejected

- Splitting by sub-family: forced-section acceptance needs the combined sixteen-card state.
- Retiring plant drinks/butter: each retains its first rung and a close second.
- Adding aliases to fix cart-pick retrieval: reorder the product wording within the same rung instead, preserving the plan’s field lock.
- Trusting hand-counted fragment lint notes or stale CA-4a runs fixtures: use current executable lints and the shipped a392e36 files.

## Refresh verification (2026-10-16)

- `node .pipeline/runs/ca-4b/counts.mjs > .pipeline/runs/ca-4b/before.json`: exit 0; valid JSON, 181 curated cards, 30 picks, 23 eggs_dairy, 1 forced section hit. The server/review tree equals a392e36.
- `node .pipeline/runs/ca-4b/verify-acceptance.mjs`: exit 0; 52 tests, 52 pass, 0 fail, 0 skipped. It checks the materialized file equals the embedded acceptance before adapting paths and substituting projected input objects. No assertions are removed or changed.
- `node .pipeline/runs/ca-4b/verify-dependencies.mjs`: exit 0; 798 tests, 798 pass, 0 fail, 0 skipped across 18 unchanged existing test files. The same process runs listMatchProbe: `no wrong matches` (all seven wrong counters zero). Only process-local KB/review/do-line data is substituted; no server file is written.
- Forced section lints: BEFORE 1 → projected AFTER 0. Card/repeated-claim/hedge/readability lints and corpus repetition budget: 0 violations. All four changed cart picks match their own ids; 90/120-character and both percent/price rules pass.
- `node server/scripts/commitGuard.js`: exit 0. Output:

```text
commitGuard: tree mode · 0 staged · 0 untracked in guarded dirs

nothing this commit carries references an untracked file, and no suite file is missing
```

- `git diff --check`: exit 0, no output. The only tracked change is this spec; new files are under .pipeline/runs/ca-4b/. No server/client/docs/KB writes, network, migration or git writes.
- Full `npm test` and build installation are deferred to the builder; this is a docs refresh, not a shipped KB change. Missing API/database environment variables emit startup notices but do not block these offline checks. No ENVIRONMENT blocker.
- `dv check .pipeline/specs/ca-4b.md`: exit 0; no DRIFT or STALE. Output verbatim:

```text
PASS
```

READY for build dispatch.
