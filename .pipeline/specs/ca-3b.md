# ca-3b — Meat batch B: pork, poultry, cured meats (14 cards, no fold)

```json
{
  "id": "ca-3b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/test/acceptance/ca-3b.test.js"
  ],
  "read_full": [
    "server/test/acceptance/passRule.js",
    "docs/CARD-ALIGNMENT-PLAN.md",
    "docs/research/card-align-sources.md",
    "docs/research/meat-sources.md"
  ],
  "verify": "node --test server/test/acceptance/ca-3b.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T2 (fallback forge@opus [T2]); critic@opus, FIDELITY required.
- P1. Parallel-safe: no. It builds on the ca-3a commit: same KB, same do-line files, and the full-meat-section lint assertion needs ca-3a's cards.
- Plan: `docs/CARD-ALIGNMENT-PLAN.md`, "CA-3 Meat batch", Inventory "Milestone 1, meat" (CA-3b rows), D1-D8, the meat tip. Scouts: `.pipeline/specs/ca-scouts.md` S2, S4, S5, S11.
- **Before dispatch:** the admin captures BEFORE with the independent check script below, at the ca-3a commit (`<CA3A_SHA>`, filled by the admin when ca-3a lands).
- **SPEC STATUS: SKELETON.**
  - The plumbing, criteria, acceptance test, D8 decision and constraints are written.
  - The 14 card texts are `TODO: <id>`. Their KB entries were not read in this planning pass.
  - Do not dispatch until every TODO is replaced by full old → new text and claim-trace rows. Also replace `<CA3A_SHA>` in the acceptance test.

**D8 decision: `chicken_breast` is REWRITTEN, not folded.** S5 evidence:
- `server/lib/counterCards.js:159` records the IC-4a reason for keeping it ("chicken_breast stays (type veto)").
- The live readers in S5:
  - `server/lib/list.js:120-122, 344, 366, 370, 378`;
  - `server/lib/listImport.js:78`;
  - `server/lib/counterCardLint.js:1564`;
  - `server/lib/doLines.json:23`.
- The tests in S5:
  - `server/test/ktight.test.js:15`;
  - `counterProbe48.test.js:20, 137-138`;
  - `ic4achicken.test.js:42-43, 69-72, 101`;
  - `ic4b.test.js:97-103`.

The plan's condition for a fold ("only if S5 shows no recorded reason") is not met. No RETIRED change, and the dry-run deletes nothing.

## Alignment block

- **Done means:**
  - **D1.** Given the KB after the build, when each CA-3b id is read, then: decision ≤14 words with no hedge; tier_note is one sentence of 5-20 words; instead is non-empty and ≤24 words; pick_steps has 1-3 items of ≤14 words; watch_out never shrinks.
  - **Grass terms.** Given every CA-3b id, then `decision` and `cart_pick` do not match `/grass-(fed|finished)/i`. A card that speaks to raising carries the POINTER "How it was raised: see Beef." or the poultry/pork equivalent the planner writes into Step 1 (TODO).
  - **Whole-meat-section lints.** Given the CA-5 meat tip with both flags on, then `lintSections` returns zero L1, L2, L4 and L5 hits for the whole meat section (ca-3a + ca-3b ids). L3 handling hits are out of scope (tip side, CA-5).
  - **Greps.** Given the changed copy fields, then the brand, claim-lock (`healthier|healthiest|better for you|lowers|exposure|protein|calorie`) and price (`\bcheapest\b|\bprice\b|\$[0-9]`) greps are 0, with no em-dash and no first-person word.
  - **Cures.** Given a cure sentence on bacon, ham, hot_dogs, turkey_bacon, cured_pork or deli_meat_uncured, then it is one of `PRESERVATION_CURE_SENTENCES` (counterCardLint.js) verbatim.
  - **chicken_breast.** Given `chicken_breast`, then it stays in the KB, is not in RETIRED, and its `cart_pick` still names "breast", so `typeContradicts` (perimeter.js:130-151) keeps its type veto.
- **Out of scope:**
  - Section tips (CA-5).
  - CA-3a ids.
  - Eggs and dairy (CA-4).
  - Seafood.
  - Migration.
  - Any fold.
- **OK rough edges:**
  - An id already within D1 with no grass term and no L1/L2 hit is reported KEPT.
  - `detail` grows where rephrased depth moves down.
- **Ship bar:**
  - An untraced claim, or a numbered fact missing (passRule).
  - A safety line deleted: rotisserie FSIS reheating, ham cook-before-eating, cured_pork "Not Preserved, Keep Refrigerated".
  - A cart_pick that changes type (breast/thigh/whole/ground/deli) or prints a shared term.
  - An ESSENTIALS id reordered.
  - An em-dash or straight quote.
  - A first-person word.
  - A protein or price figure in a changed copy field.
- **Independent check:** `counts.mjs` below, BEFORE at `<CA3A_SHA>` and AFTER the build:
  - the per-id word counts;
  - the full meat-section L1/L2/L4/L5 hit list going to 0;
  - each changed cart_pick through `matchItemToCard` reporting its own slug.

## Steps (the change, old → new)

### 1. `server/kristy_perimeter_kb.json`

Fields not named stay byte-identical. Curly quotes only. No em-dash in a changed string. Cure sentences only from `PRESERVATION_CURE_SENTENCES`.

| id | KB lines (pre-ca-3a, re-locate by id) | status | constraints the planner must satisfy when filling |
| --- | --- | --- | --- |
| pork_cuts_and_enhanced | 2767-2826 | TODO: pork_cuts_and_enhanced | Enhanced/solution sentence keeps its numbers; 9 CFR 317.2 descriptive name (meat:338-362); in TRY_POOL, keep id |
| pick_sausage | 6030-6063 | TODO: pick_sausage | pick: decision + pick_steps only; sausage quotes meat:70-133 |
| pick_jerky | unread | TODO: pick_jerky | pick; no protein figure |
| chicken_cuts_basics | 2655-2765 | TODO: chicken_cuts_basics | "cheapest"/"priciest" → relative words; "protein" sentence rephrased (claim grep); em-dashes in labels → colon/semicolon; air-chilled 9 CFR 441.10 (meat:168-190) |
| chicken_breast | 6800-6852 | TODO: chicken_breast | R per D8; cart_pick keeps "breast"; ic4achicken :42-43, :69-72, :101 and ic4b :97-103 pins unread, re-pin only if a decision change breaks them (then add the file to owns) |
| rotisserie_chicken | 272-346 | TODO: rotisserie_chicken | detail brand "Whole Foods Market’s" → label words (D6); FSIS safety lines kept |
| turkey_whole | 6332-6384 | TODO: turkey_whole | L2 "is the whole-food standard" shared with 5 others: reword so no 6-gram repeats |
| ground_turkey | 6386-6430 | TODO: ground_turkey | same L2 group |
| bacon | 6637-6689 | TODO: bacon | same L2 group; uncured wording from NMPAN (meat:285-302) and PRESERVATION_CURE_SENTENCES |
| ham | 7172-7233 | TODO: ham | same L2 group; protein figures out of changed copy (move or keep byte-identical); cook-before-eating line kept |
| hot_dogs | 6691-6743 | TODO: hot_dogs | same L2 group; in K9 slice |
| turkey_bacon | 7235-7287 | TODO: turkey_bacon | same L2 group |
| cured_pork | 7289-7353 | TODO: cured_pork | "Not Preserved, Keep Refrigerated" kept verbatim |
| deli_meat_uncured | 2828-2894 | TODO: deli_meat_uncured | tip check 3 ("ingredient list of meat, salt, and spices") must not be echoed as a 5-gram (L1) |

### 2. `docs/do-lines-review.md` → `server/lib/doLines.json`

- For each id whose decision changes, the review-table headline cell becomes the new decision; the do cell changes only where Step 1 gives a new do line.
- Regenerate with `node server/scripts/buildDoLines.js`; commit both.
- doLines lines:
  - :3 bacon;
  - :23 chicken_breast;
  - :24 chicken_cuts_basics;
  - :37 cured_pork;
  - :40 deli_meat_uncured;
  - :66 ground_turkey;
  - :67 ham;
  - :69 hot_dogs;
  - :121 pork_cuts_and_enhanced;
  - :147 rotisserie_chicken;
  - :175 turkey_bacon;
  - :176 turkey_whole.

  These line numbers are as of `8b49633`; they shift by -1 after ca-3a removes :65.

## Criteria

- C1 [test] D1 limits hold on every CA-3b card.
- C2 [test] No CA-3b decision or cart_pick prints a grass term.
- C3 [test] chicken_breast survives (D8 rewrite): present, not RETIRED, cart_pick names breast.
- C4 [test] The pass rule holds for every CA-3b id vs `<CA3A_SHA>`.
- C5 [test] Brand, claim-lock and price greps are 0 over changed copy fields; ≥14 fields changed.
- C6 [test] The full meat section is lint-clean (L1, L2, L4, L5) under the CA-5 meat tip with flags on.
- C7 [test] Every cure sentence in a changed field is a `PRESERVATION_CURE_SENTENCES` member.
- C8 [test] Per-card lintCard, readability and lintPickSteps are clean for every changed non-pick card, and reviewHeadline equals decision.
- C9 Server `npm test` green (count reported), listMatchProbe 0 wrong, commitGuard clean, migrate dry-run deletes nothing and upserts only CA-3b ids.

## Contract

```json
{"criteria":[
 {"id":"C1","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/ktight.test.js"],"allowed_reads":["docs/CARD-ALIGNMENT-PLAN.md"],"expected":"every CA-3b card within D1","test_name":"C1 D1 limits hold on every CA-3b card"},
 {"id":"C2","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/counterCardLint.js"],"allowed_reads":[],"expected":"0 grass matches","test_name":"C2 no CA-3b decision or cart_pick prints a grass term"},
 {"id":"C3","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/list.js","server/lib/listImport.js","server/lib/counterCardLint.js","server/test/acceptance/ic4achicken.test.js","server/test/acceptance/ic4b.test.js","server/test/counterProbe48.test.js"],"allowed_reads":["server/lib/counterCards.js"],"expected":"chicken_breast present, not RETIRED, cart_pick /breast/i","test_name":"C3 chicken_breast survives as a rewrite"},
 {"id":"C4","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/test/acceptance/passRule.js"],"allowed_reads":["server/test/acceptance/passRule.js"],"expected":"assertPassRule ok for 14 ids","test_name":"C4 the pass rule holds for every CA-3b id"},
 {"id":"C5","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":[],"allowed_reads":[],"expected":"0 brand/claim/price hits; >=14 changed fields","test_name":"C5 brand claim and price greps are zero over changed copy fields"},
 {"id":"C6","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/counterCardLint.test.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"0 L1/L2/L4/L5 hits in section meat","test_name":"C6 the full meat section is lint-clean under the meat tip"},
 {"id":"C7","impl":["server/kristy_perimeter_kb.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/lib/counterCardLint.js"],"allowed_reads":["server/lib/counterCardLint.js"],"expected":"every cure sentence is a PRESERVATION_CURE_SENTENCES member","test_name":"C7 cure sentences come only from the shared set"},
 {"id":"C8","impl":["server/kristy_perimeter_kb.json","docs/do-lines-review.md","server/lib/doLines.json"],"tests":["server/test/acceptance/ca-3b.test.js"],"dependents":["server/test/acceptance/ic5b.test.js","server/test/acceptance/k9.test.js"],"allowed_reads":[],"expected":"per-card lints []","test_name":"C8 per-card lints are clean and headlines match"},
 {"id":"C9","impl":["server/kristy_perimeter_kb.json"],"tests":[],"dependents":["server/test/acceptance/k14.test.js"],"allowed_reads":[],"expected":"npm test green except the k14 C12 anchor tripwire main re-anchors; probe 0 wrong; commitGuard clean; dry-run deletes 0"}
],
"dependency_evidence":[
 {"owned":"server/kristy_perimeter_kb.json","imports":["server/routes/perimeter.js:145","server/routes/perimeter.js:274","server/routes/perimeter.js:410","server/lib/listMatch.js:202","server/lib/listMatch.js:229","Tools/listvocab/build.js:43"],"tests":["server/lib/counterReach.test.js","server/test/acceptance/passRule.js"],"source":".pipeline/specs/ca-scouts.md S11, S4"},
 {"owned":"chicken_breast references","imports":["server/lib/list.js:120","server/lib/list.js:344","server/lib/list.js:366","server/lib/list.js:370","server/lib/list.js:378","server/lib/listImport.js:78","server/lib/counterCardLint.js:1564","server/lib/doLines.json:23"],"tests":["server/test/ktight.test.js:15","server/test/counterProbe48.test.js:20","server/test/acceptance/ic4achicken.test.js:42","server/test/acceptance/ic4b.test.js:97"],"source":".pipeline/specs/ca-scouts.md S5"},
 {"owned":"section map","imports":["server/lib/counterCardLint.js sectionForCategory"],"tests":["server/lib/counterCardLint.test.js"],"source":".pipeline/specs/ca-scouts.md S2"}
],
"env":{"executables":["node","git","grep"],"browsers":[],"temp":"/Users/m1/kristy/.pipeline/runs/ca-3b","network":false}}
```

## Acceptance server/test/acceptance/ca-3b.test.js

```js
// Written by the planner; do not edit.
// ca-3b: docs/CARD-ALIGNMENT-PLAN.md "CA-3 Meat batch", CA-3b rows. D8: chicken_breast is rewritten, not folded.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED, projectEntry } from '../../lib/counterCards.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const BASE = '<CA3A_SHA>';
const PRE = JSON.parse(execFileSync('git', ['show', `${BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const flat = (r) => (Array.isArray(r) ? r : (r && r.violations) || []);
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));

const BATCH = ['pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast', 'rotisserie_chicken',
  'turkey_whole', 'ground_turkey', 'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const CURED = ['bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const MEAT_TIP = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] };
const COPY_SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'category', 'evidence_tier']);
const BRAND = /whole foods|tyson|perdue|hormel|oscar mayer|applegate|boar.s head|smithfield|jimmy dean|hillshire|butterball|jennie-o|foster farms/i;
const CLAIM = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const CURE_WORD = /\b(cured|uncured|nitrite|nitrate|celery powder|celery juice)\b/i;

test('C1 D1 limits hold on every CA-3b card', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    if (Array.isArray(e.pick_steps)) {
      assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `${id} pick_steps ${e.pick_steps.length}`);
      for (const s of e.pick_steps) assert.ok(words(s) <= 14, `${id} pick_step "${s}"`);
    }
    if (e.kind === 'pick') continue;
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5 && words(n) <= 20, `${id} tier_note ${words(n)} words`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.ok(String(e.instead || '').trim().length > 0 && words(e.instead) <= 24, `${id} instead`);
  }
});

test('C2 no CA-3b decision or cart_pick prints a grass term', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.doesNotMatch(String(e.decision || ''), /grass-(fed|finished)/i, `${id} decision`);
    assert.doesNotMatch(String(e.cart_pick || ''), /grass-(fed|finished)/i, `${id} cart_pick`);
  }
});

test('C3 chicken_breast survives as a rewrite', () => {
  const e = now('chicken_breast');
  assert.ok(e, 'chicken_breast was removed');
  assert.ok(!RETIRED_IDS.has('chicken_breast'), 'chicken_breast is RETIRED');
  assert.match(String(e.cart_pick || ''), /breast/i);
  assert.notEqual(JSON.stringify(e), JSON.stringify(pre('chicken_breast')), 'chicken_breast unchanged');
});

test('C4 the pass rule holds for every CA-3b id', (t) => {
  for (const id of BATCH) pass.assertPassRule(t, pre(id), now(id));
});

test('C5 brand claim and price greps are zero over changed copy fields', () => {
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
  assert.ok(changed >= 14, `only ${changed} changed copy fields`);
});

test('C6 the full meat section is lint-clean under the meat tip', () => {
  const hits = lint.lintSections([{ ...MEAT_TIP, tip_aligned: true, cards_aligned: true }], kb.entries);
  const bad = hits.filter((h) => h.section === 'meat' && ['SECTION_TIP_REPEATS_CARD', 'SECTION_PHRASE_REPEATED', 'TERM_UNGLOSSED', 'CART_PICK_DISAGREES'].includes(h.code));
  assert.deepEqual(bad, []);
});

test('C7 cure sentences come only from the shared set', () => {
  const allowed = new Set(lint.PRESERVATION_CURE_SENTENCES);
  assert.ok(allowed.size > 0, 'PRESERVATION_CURE_SENTENCES empty');
  for (const id of CURED) {
    const e = now(id);
    const p = pre(id);
    for (const f of ['decision', 'tier_note', 'why', 'short_answer', 'kristy_take']) {
      if (JSON.stringify(e[f]) === JSON.stringify(p[f])) continue;
      for (const s of String(e[f] || '').split(/(?<=[.!?])\s+/)) {
        if (CURE_WORD.test(s) && !/^Cured\b|^Uncured\b/.test(s.trim())) assert.ok(allowed.has(s.trim()), `${id}.${f} authored a cure sentence: ${s}`);
      }
    }
  }
});

test('C8 per-card lints are clean and headlines match', () => {
  for (const id of BATCH) {
    const e = now(id);
    if (e.kind === 'pick' || JSON.stringify(e) === JSON.stringify(pre(id))) continue;
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(flat(lint.readability(e)), [], `${id} readability`);
    assert.deepEqual(flat(lint.lintPickSteps(e)), [], `${id} lintPickSteps`);
  }
});
```

## ANCHOR server/test/ktight.test.js:15
```
  B04: ['rotisserie_chicken', 'chicken_cuts_basics', 'turkey_whole', 'ground_turkey', 'chicken_breast', 'egg_labels', 'egg_duck_quail'],
  B05: ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'],
```
Read only: no CA-3b id leaves a batch, so ktight needs no edit.

## ANCHOR server/lib/doLines.json:64
```
  "ground_beef_lean_ratio": "Read the name: “ground beef” allows no added fat, water or binders.",
  "ground_beef_organ_blend": "Read the ingredient list for liver and heart, each with a percentage.",
```
Context for the -1 line shift after ca-3a; the CA-3b do lines are listed in Step 2.

## Claim-trace table (one row per new sentence)

TODO: rows are written with each card's Step 1 text. Allowed traces:
- the card's own fields;
- `PRESERVATION_CURE_SENTENCES`;
- `docs/research/meat-sources.md`:
  - :32-69 Illinois Extension;
  - :70-133 sausage;
  - :168-190 air chilled 9 CFR 441.10;
  - :285-302 NMPAN uncured bacon (https://www.nichemeatprocessing.org/uncured-bacon/);
  - :338-362 9 CFR 317.2;
  - :611-692 MSU myoglobin, FSIS dating;
- `docs/research/card-align-sources.md` blocks.

Never a URL from memory.

## Independent check script (admin-run; not part of the build)

Save as `/Users/m1/kristy/.pipeline/runs/ca-3b/counts.mjs`. It is the ca-3a script with these changes:
- `BATCH` = the 14 ids above;
- the section tally keeps every `section === 'meat'` hit (not only batch ids).

- BEFORE: `mkdir -p /Users/m1/kristy/.pipeline/runs/ca-3b && cd /Users/m1/kristy/server && node ../.pipeline/runs/ca-3b/counts.mjs > ../.pipeline/runs/ca-3b/before.json`
- AFTER: the same command into `after.json`, then `diff`.
- Expected AFTER:
  - 0 meat L1/L2/L4/L5 keys;
  - every changed cart_pick matches its own slug (chicken_breast → chicken_breast, not chicken_cuts_basics).

## Prerequisites

- Env: node ≥20, git, grep. No network. No Supabase writes (`--dry-run` only). No browser.
- ca-3a is built, critic SHIP, committed; `<CA3A_SHA>` is filled.
- k14 C12 is re-anchored by main.
- Step 1 has no TODO.

## Answers

- **Reads and runtime:** `npm test` takes 1-3 minutes. Read only `owns`, `read_full`, and the 14 KB entries by id.
- **Do not edit:**
  - Any non-batch entry.
  - RETIRED, ESSENTIALS, TRY_POOL.
  - `sectionRules.json`.
  - `client/src`.
  - Any test not in `owns`.
- **Every string in Step 1 is final; copy it byte for byte.** A needed sentence that is not in this spec is a STOP.
- **STOP BLOCKED (quote the evidence) if:**
  - A pinned test outside `owns` fails (ic4achicken, ic4b, counterProbe48, counterDecision, ic5b, k9). The planner re-pins or rewrites; the builder never does.
  - listMatchProbe reports a wrong match.
  - A TODO remains.
- **Limits:** no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- **Commit (admin):** `ca-3b: meat batch B, pork/poultry/cured fronts to D1, chicken_breast rewritten (D8, counterCards.js:159). Do lines table docs/do-lines-review.md → server/lib/doLines.json. Not migrated.`
- **Report, ≤30 lines:** READY or NOT READY; acceptance and npm counts; probe wrong count; dry-run deletes (expect 0); KEPT ids; any STOP.

## Open questions

1. All 14 card texts are TODO. The KB entries were not read in this pass.
2. The ic4achicken/ic4b/counterProbe48 pin contents were not read. If a chicken decision change breaks them, they join `owns` with exact re-pins.
3. pick_jerky's KB location was not recorded in the scouts.
4. The C7 cure check assumes `PRESERVATION_CURE_SENTENCES` is exported from counterCardLint.js. Verify the export name before dispatch.
5. The BRAND regex list was written by the planner, not from a corpus scan. The critic's Item 5 grep is the real gate.

## Tried and rejected

- **Folding chicken_breast into chicken_cuts_basics.** D8's condition fails: counterCards.js:159 records the IC-4a type-veto reason, and S5 shows 8 live code readers.
- **Splitting the L2 "is the whole-food standard" fix across batches.** All six cards that hold it are in CA-3b, so one batch clears the group.
