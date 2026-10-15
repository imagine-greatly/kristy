# ca-4b — The other sixteen eggs_dairy cards: cheese, cultured dairy, cream, plant milks

> **NOT READY TO DISPATCH.** Card text for the sixteen ids is marked `TODO: <id>` below. The planner ran out of its time box before reading the sixteen fronts verbatim. The structure, criteria, acceptance skeleton, supersession list and STOP rules are final. The admin returns this file to planner@opus with the fronts pasted (Scout first, below) to fill each TODO; `dv check` will not pass until then.

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
    "VOICE_SPEC.md"
  ],
  "verify": "node --test server/test/acceptance/ca-4b.test.js && cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo kristy, branch `main`. Plan approved 2026-10-14 on defaults Q1-Q3 (admin relay of Devon's go).

- Route: dv T2 (fallback forge@opus [T2]). Critic: critic@opus, `FIDELITY required`.
- P1. Parallel-safe: no (owns the KB).
- Plan: `docs/CARD-ALIGNMENT-PLAN.md` CA-4. Scouts: `.pipeline/specs/ca-scouts.md` S1, S2, S4.
- **Before dispatch:** CA-4a committed; every `TODO: <id>` below replaced with text; `dv check` PASS.

**Scout first** (admin-run, before the planner fills the TODOs):
- `dv scout "decision, tier_note, cart_pick, pick_steps, instead, why, short_answer of each CA-4b id" --terms plain_kefir raw_kefir sour_cream cream_cheese cottage_cheese cheese_real_vs_processed raw_aged_cheese goat_sheep_dairy cream_vs_creamer ice_cream dairy_case almond_milk oat_milk soy_milk coconut_milk_beverage plant_butter`
- `dv scout "tests pinning a CA-4b string or a butter/ghee/yogurt row" --terms k19 k21 k22 k8 counterProbe48` (known: `k19.test.js:22` CARDS, `:131` brand regex, `:39` and `k21.test.js:46` 'butter' → grassfed_butter, `k22.test.js:44` 'ghee' → ghee; `counterProbe48.test.js:31` yogurt, `:36` ['butter','grassfed_butter'], `:140` 'Plain whole-milk yogurt' → yogurt; none verbatim-read).
- Which eggs_dairy L2 phrase groups mix CA-4a and CA-4b ids after CA-4a (the CA-4a Step 0 report)?

Scope: sixteen eggs_dairy cards take the CA-4 standard: the front names the best first rung, each card gets an `instead`, protein words leave the fronts, plant milks and plant butter name seed oil as a skip where they carry it, and the eggs_dairy section reads clean under every CA-1 section lint with the CA-5 tip and both flags forced.

Card counts: R 16, RT 0, F 0, K 0. Of the R, text authored: 0; `TODO`: 16.

## Alignment block

**Done means:**
- Given each of the sixteen ids, when the KB is read, then every field named in Step 1 equals the string given there byte for byte and every other field deep-equals HEAD `8b49633`.
- Given each id, then it has a non-empty `instead` of ≤24 words naming a different product than its own `cart_pick`.
- Given each id, then `assertPassRule`, `readability`, `lintCard(projectEntry(card, {doLine}))`, `lintPickSteps`, `lintCulinaryAim` and `lintRepeatedClaim` return no hit.
- Given `lintSections` with the CA-5 eggs_dairy tip and both flags forced, then it returns `[]` for the eggs_dairy section (all twenty-three cards, CA-4a included).
- Given the strings this piece adds, then none matches the claim-lock grep (`protein` included), the price grep, an em-dash, a straight quote or the brand grep; no `tier_note` matches the D4 use-bridge pattern.
- Given each id whose decision changed, then its `docs/do-lines-review.md` headline column equals the new decision (`ic7b.test.js:87`).
- `npm test` green with no test edited; probe 0 wrong; `commitGuard.js` clean; `--dry-run` places every card.

**Out of scope:** the CA-4a cards; section rules (CA-5); sources; iOS; migration; any test file (this piece owns none: a pinned string is kept, or the builder STOPs).

**OK rough edges:**
- Depth fields (`detail`, `science`, `buying_tips`) keep relative cost words such as "Blocks are cheaper per pound" (`cheese_real_vs_processed`); the price grep runs on new strings only.
- Plant milks keep their fortification and panel guidance in depth; only the fronts lose the protein framing.
- **Deviation from the plan, recorded.** None yet; the TODO fill records any.

**Ship bar:** a raw-dairy risk sentence altered (`raw_kefir`, `raw_aged_cheese` `watch_out`); a claim with no claim-trace row; a brand, price word, first-person word or em-dash in a new string; an eggs_dairy forced section-lint hit; `npm test` red; an ESSENTIALS card reordered or retired.

**Independent check:** the forced-flag eggs_dairy `lintSections` hit count goes from the CA-4a AFTER count to 0; `git diff <CA-4a commit> -- server/kristy_perimeter_kb.json` touches only the sixteen ids.

## Steps (the change, old → new)

Every string from this file, curly quotes included. A string given here never changes; a lint hit on one is STOP BLOCKED.

### 1. `server/kristy_perimeter_kb.json`

Per id: `decision` (≤14 words, first rung named), `tier_note` (one sentence, 5-20 words, unique in the section), `instead` (new, ≤24 words), `cart_pick` (only if the front's first rung changes), `pick_steps` (1-3, ≤14 words, end in ".", no new numbers, not the do line), and any `why` or `short_answer` sentence that would contradict the new front.

- `plain_kefir` — TODO: plain_kefir. Direction: plain, whole-milk, 100% grass-fed kefir first; `instead` plain organic whole-milk kefir. Family `milk_processing` (S1) applies.
- `raw_kefir` — TODO: raw_kefir. HEAD `tier_note` (`:4712`) is 30 words → ≤20. `watch_out` byte-identical.
- `sour_cream` — TODO: sour_cream. Direction: cream and cultures only; `instead` plain whole-milk yogurt [PLACEHOLDER].
- `cream_cheese` — TODO: cream_cheese. Keep "at least 33% milkfat" wherever it stands (pass rule tracks "33%"). Family `milk_processing`.
- `cottage_cheese` — TODO: cottage_cheese.
- `cheese_real_vs_processed` — TODO: cheese_real_vs_processed. ESSENTIAL-adjacent; its decision may already be "Block cheese is milk, cultures, salt and enzymes, and nothing else." (review :56). Do line stays unless it collides with the CA-5 check "Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese." (L1 SECTION_TIP_REPEATS_CARD): reword the card, never the tip.
- `raw_aged_cheese` — TODO: raw_aged_cheese. `watch_out` byte-identical.
- `goat_sheep_dairy` — TODO: goat_sheep_dairy. Families `milk_processing` and `ruminant_grass_term` (S1). HEAD `why`/`short_answer` carry "different forms of proteins" and "about 3.5 percent butterfat": the protein wording leaves the front; "3.5" stays in rewritable text.
- `cream_vs_creamer` — TODO: cream_vs_creamer. `instead` is real cream or half-and-half [PLACEHOLDER].
- `ice_cream` — TODO: ice_cream.
- `dairy_case` — TODO: dairy_case. Hub card: `:9367` "Read a filtered milk panel for its protein and sugar lines." leaves the front if it sits there; `science` keeps "120 days" and "400 IU". It must not restate the CA-5 eggs_dairy rule or checks.
- `almond_milk` — TODO: almond_milk. HEAD `tier_note` (`:9178`) "Added sugars and protein on the panel decide the pick, not the name." → no "protein". Seed oil in the ingredients is a skip (G7) where the card names it.
- `oat_milk` — TODO: oat_milk. HEAD decision (`:6551`) "Oat milk with its protein and fortification checked on the carton." → no "protein". Seed oil skip as above.
- `soy_milk` — TODO: soy_milk.
- `coconut_milk_beverage` — TODO: coconut_milk_beverage. In `HEALTH_FIRST_REWRITE`; pass rule relaxations apply.
- `plant_butter` — TODO: plant_butter. `instead` points sideways to butter: "Butter: cream, and salt if salted." [PLACEHOLDER]. Seed oil named as the skip.

### 2. `docs/do-lines-review.md` → `server/lib/doLines.json`
For each id whose decision changed, the headline column equals the new decision. Do lines change only where a lint or the CA-5 tip collides; each new do line is ≤14 words, imperative, headline + do ≤28 words. TODO: list per id after Step 1 is filled. Then from `server/`: `node scripts/buildDoLines.js`.

## Criteria
- C1 [test] Given each id, then the Step 1 fields equal the given strings and every other field deep-equals HEAD.
- C2 [test] Given each id, then `instead` is non-empty, ≤24 words, and differs from `cart_pick`.
- C3 [test] Given each id, then the pass rule holds and every card lint returns `[]`.
- C4 [test] Given the forced-flag eggs_dairy `lintSections`, then it returns `[]`.
- C5 [test] Given the strings this piece adds, then none trips the claim-lock, price, punctuation, brand or D4 greps.
- C6 [test] Given each changed decision, then its review headline equals it, and `doLines.json` carries each reviewed do line.
- C7 Given the repo after the change, when `cd server && npm test; node scripts/listMatchProbe.js; node scripts/commitGuard.js; node scripts/migrateCounterCards.js --dry-run` run, then 0 fail, 0 wrong, guard clean, every card placed.

## Contract

```json
{
  "criteria": [
    {"id": "C1", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4b.test.js"], "dependents": ["server/lib/counterCards.js", "server/test/acceptance/passRule.js"], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "Step 1 text; other fields equal 8b49633", "test_name": "C1 <id> carries the spec text"},
    {"id": "C2", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4b.test.js"], "dependents": ["server/lib/counterCards.js"], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "instead present on all sixteen", "test_name": "C2 <id> has an instead"},
    {"id": "C3", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4b.test.js", "server/lib/counterCardLint.test.js"], "dependents": ["server/lib/counterCardLint.js", "server/test/acceptance/passRule.js"], "allowed_reads": ["server/lib/counterCardLint.js", "server/test/acceptance/passRule.js"], "expected": "every lint []", "test_name": "C3 <id>: pass rule and every card lint are clean"},
    {"id": "C4", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4b.test.js"], "dependents": ["server/lib/counterCardLint.js", "server/lib/counterCards.js"], "allowed_reads": ["server/lib/counterCardLint.js"], "expected": "[]", "test_name": "C4 the eggs_dairy section is clean under forced section lints"},
    {"id": "C5", "impl": "server/kristy_perimeter_kb.json", "tests": ["server/test/acceptance/ca-4b.test.js"], "dependents": [], "allowed_reads": ["VOICE_SPEC.md"], "expected": "0 grep hits", "test_name": "C5 new copy passes the claim-lock, price, punctuation, brand and D4 greps"},
    {"id": "C6", "impl": "docs/do-lines-review.md", "tests": ["server/test/acceptance/ca-4b.test.js", "server/test/acceptance/ic7b.test.js"], "dependents": ["server/scripts/buildDoLines.js", "server/lib/doLines.json"], "allowed_reads": ["docs/do-lines-review.md", "server/lib/doLines.json"], "expected": "review headline equals decision; doLines carries each do line", "test_name": "C6 review table and doLines.json follow the new fronts"}
  ],
  "dependency_evidence": [
    {"owned": "server/kristy_perimeter_kb.json", "imports": [], "tests": ["server/test/acceptance/passRule.js", "server/lib/counterReach.test.js", "server/lib/counterCardLint.test.js"], "source": "ca-scouts.md S1, S4"},
    {"owned": "server/kristy_perimeter_kb.json", "imports": [], "tests": ["server/lib/perimeter.js"], "source": "ca-scouts.md S2 (dairy → eggs_dairy, perimeter.js:351)"}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ca-4b", "network": false}
}
```

## Acceptance server/test/acceptance/ca-4b.test.js

```js
// CA-4b: the other sixteen eggs_dairy cards (docs/CARD-ALIGNMENT-PLAN.md CA-4). Written by the planner; do not edit.
// TODO: SPEC holds one entry per id once the planner fills Step 1; an empty SPEC entry fails C1 by design.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { assertPassRule } from './passRule.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', '8b49633:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs', 'do-lines-review.md'), 'utf8'));
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
  plain_kefir: {}, raw_kefir: {}, sour_cream: {}, cream_cheese: {}, cottage_cheese: {},
  cheese_real_vs_processed: {}, raw_aged_cheese: {}, goat_sheep_dairy: {}, cream_vs_creamer: {},
  ice_cream: {}, dairy_case: {}, almond_milk: {}, oat_milk: {}, soy_milk: {}, coconut_milk_beverage: {}, plant_butter: {},
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
  assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: reviewed.get(id)?.do || '' })), []);
  for (const f of [lint.lintPickSteps, lint.lintCulinaryAim, lint.lintRepeatedClaim]) assert.deepEqual(f(e), [], `${id} ${f.name}`);
});

test('C4 the eggs_dairy section is clean under forced section lints', () => {
  for (const id of IDS) assert.notDeepEqual(now(id), was(id), `${id} unchanged`);
  assert.deepEqual(lint.lintSections([TIP], kb.entries), []);
});

test('C5 new copy passes the claim-lock, price, punctuation, brand and D4 greps', () => {
  const added = nonEmpty(IDS.flatMap(fresh), 'CA-4b new strings', 32);
  for (const s of added) {
    assert.doesNotMatch(s, CLAIM_LOCK, s);
    assert.doesNotMatch(s, PRICE, s);
    assert.doesNotMatch(s, /—/, s);
    assert.doesNotMatch(s, /["']/, s);
    assert.doesNotMatch(s, BRAND, s);
  }
  for (const id of IDS) assert.doesNotMatch(now(id).tier_note ?? '', D4, id);
});

test('C6 review table and doLines.json follow the new fronts', () => {
  for (const id of IDS) {
    if (now(id).decision !== was(id).decision) assert.equal(reviewed.get(id)?.headline, now(id).decision, id);
    const d = reviewed.get(id)?.do;
    if (d) assert.equal(doLines[id], d, id);
  }
});
```

TODO (planner, on fill): confirm `parseReviewTable` exposes `headline` under that key (ic7b `:87` `reviewHeadline(id)` is the reference); adjust C6 to the same accessor before dispatch.

## ANCHOR server/kristy_perimeter_kb.json:6551
[not read verbatim by the planner beyond the decision text] `"decision": "Oat milk with its protein and fortification checked on the carton.",` — the admin pastes ≥3 verbatim lines per id from the Scout first result; one ANCHOR per id.

## ANCHOR docs/do-lines-review.md:56
```
| `cheese_real_vs_processed` | eggs_dairy | Block cheese is milk, cultures, salt and enzymes, and nothing else. | Read the bag for potato starch, cellulose and natamycin before buying shreds. | — |
| `yogurt_plain_vs_flavored` | eggs_dairy | Flavored yogurt carries added sugar; plain is milk and cultures. | Take the big plain tub, not the single-serve fruit cups. | — |
| `raw_milk` | eggs_dairy | Raw milk is worth seeking out from a farm you can name. | Buy from a farm you can visit that posts its test results. | — |
```
(read at `8b49633`; CA-4a rewrites the yogurt row.)

## Claim trace (one row per new sentence)
TODO: one row per new sentence once Step 1 is filled. Allowed sources: the card's own KB fields at `8b49633`; `docs/research/dairy-eggs-sources.md` §2 Cheese `:106`, §3 Butter `:143`, §4 Yogurt/kefir `:161` (ifas-kefir `:185`), §1 Milk `:18`; `docs/research/card-align-sources.md` §1, §2, §3a, §3b, §5, §5b, §6. No URL from memory.

## Independent check script (admin-run; not part of the build)
`/Users/m1/kristy/.pipeline/runs/ca-4b/counts.mjs`: the forced-flag eggs_dairy `lintSections` hits, grouped by code. BEFORE at the CA-4a commit, AFTER on the build. Expected AFTER `[]`.

## Prerequisites
- CA-4a committed. STOP BLOCKED if `git diff 8b49633 -- server/kristy_perimeter_kb.json` shows a change inside any CA-4b id.
- Env: node ≥20, git (read-only `git show`), grep. No network. No Supabase writes (`--dry-run` only). No browser.

## Answers
- `npm test` ~1-3 min. Read only `read_full` plus the owned files.
- This piece owns no test file. A test that pins a string this piece changes (k19 `:22`/`:131`, k21 `:46`, k22 `:44`, k8, counterProbe48 `:31`/`:36`/`:140`) goes red → STOP BLOCKED, quote the assertion; the planner moves it into owns with an exact supersession.
- `doLines.json` is generated (`node scripts/buildDoLines.js` from `server/`); never hand-edit it.
- STOP BLOCKED (quote the evidence) on: a lint hit on a given string; a forced section hit that can only clear by changing a CA-4a card or the CA-5 tip; a raw-dairy `watch_out` line changing.
- Limits: no git writes. 60-minute cap. BLOCKED after 3 identical failures. Never delete an assertion.
- Commit (admin): message ends "Not migrated."
- Report ≤30 lines: READY or NOT READY; acceptance count; `npm test` count; probe wrong count; each STOP.

## Tried and rejected
- Splitting 4b by sub-family (cheese, cultured, plant) into three pieces: the forced section lint (C4) only passes once all sixteen are aligned, so the pieces could not verify independently.
- Retiring `plant_butter` or the plant milks: shoppers ask for them; the cards point to the first rung through `instead`.
