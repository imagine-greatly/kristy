# ic-4a-chicken — Poultry folds: air_chilled_chicken and no_antibiotics_poultry into chicken_cuts_basics

```json
{
  "id": "ic-4a-chicken",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/lib/counterCards.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js",
    "server/lib/counterCardLint.test.js",
    "server/test/healthFirst.test.js",
    "server/test/ktight.test.js",
    "server/test/acceptance/k8.test.js",
    "server/test/acceptance/k24.test.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js",
    "server/lib/aisle.test.js",
    "server/test/counterProbe48.test.js",
    "server/scripts/listMatchProbe.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/kristy_perimeter_kb.json:771-880",
    "server/kristy_perimeter_kb.json:2774-2842",
    "server/kristy_perimeter_kb.json:7089-7142",
    "server/lib/perimeter.js:103-151",
    "server/lib/counterCards.js:148-159",
    "server/lib/counterCardLint.js:1548-1591",
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/k8.test.js",
    "server/test/healthFirst.test.js",
    "server/test/counterProbe48.test.js:132-172",
    "server/lib/tryPool.test.js"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic4achicken.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run; grep -rn -E 'air_chilled_chicken|no_antibiotics_poultry' /Users/m1/kristy/server /Users/m1/kristy-ios --include=*.js --include=*.json --include=*.swift --include=*.md | grep -v -E 'test|fixtures|counterCards.js'",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, **after ic-4a-eggs is committed** (baseline 191 cards). Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe (KB + count pins; strictly after eggs, before ic-4b).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-4a (chicken half), D3 (same-subject folds only), claim-lock rules 1-5. Oversize: 15 owned files, cannot split (every half edits the same count pins; the suite would be red between halves).

**Scope amendment (planner, needs admin/Devon ack): `chicken_breast` is NOT folded here.** `perimeter.js:130-151` `typeContradicts` vetoes a card for a named cut its cart_pick does not cover, and `counterProbe48.test.js:132-139` pins that "chicken breast" never returns chicken_cuts_basics and that a breast list row with `perimeterId: 'chicken_cuts_basics'` is re-retrieved to `chicken_breast`. Folding the breast card into a thighs-pick card turns "chicken breast" (a top-48 weekly query, `server/lib/list.js:120-122` pick perimeterId, listImport) into a miss or rewrites a pinned matcher rule. Under the matcher, breast is a different cart item, so D3 keeps it. Count goes 191 → **189**, not 188. ic-4b C0 (lists chicken_breast) and its "188" pins must drop chicken_breast / read 189 before ic-4b runs.

## Alignment block
- **Done means:** Given the dry-run, the card count drops by exactly 2 (191 → 189). The verify grep shows 0 hits for either id outside RETIRED, tests and fixtures. Every pre-fold asked_as of both ids lands on chicken_cuts_basics. "whole chicken", "chicken thighs" and bare "chicken" still land on chicken_cuts_basics (counter and list), and "chicken breast" still lands on chicken_breast. chicken_cuts_basics' back carries each unique fact of the two folded cards with its source, or the report names the fact as dropped. No KB string says "see Air-chilled chicken". REPEATED_CLAIM = 0. Probe 0 wrong.
- **Out of scope:** chicken_breast (kept, see amendment); chicken_cuts_basics title, decision, tier_note, do line (ic-4b); rotisserie_chicken, turkey cards; perimeter.js / listMatch.js matcher code; `server/lib/list.js`, `listImport.js` (pick keys for chicken_breast, untouched); `docs/coverage/universe.json`; `kindFilter.test.js:107` and `counterCardLint.test.js:186` history comments; client/src (frozen; `client/src/lib/list.js:551,561` still names `perimeterId: 'air_chilled_chicken'`, flag only, web is a redirect).
- **OK rough edges:** cart_pick reads as two items ("…or bone-in thighs"); chicken_cuts_basics' back grows long; folded `decision`, `why`, `kristy_take`, `tier_note`, `question`, `science`, `short_answer` not moved (facts arrive through moved sentences); a dropped fact named in the report; do-lines-review secondary rows (:256, :259, :306, :313) left as history.
- **Ship bar:** an untraced claim; "chicken breast" or "whole chicken" changing destination; an existing safety sentence deleted; a free-range/pasture sentence on chicken_cuts_basics (REPEATED_CLAIM vs label_pasture_raised_feed); a TRY_POOL id without a do line; any rule-4 hit.
- **Independent check:** the verify grep before the change lists tryPool.js:9, kristy_perimeter_kb.json:772,823, ktight:15, kindFilter.test:107, counterCardLint.test:186, aisle.test:91,93, counterCardLint.js:1568,1569, doLines.json:3,113, counterProbe48:149,163, k24:43, k8:18, listMatchProbe.js:317,354, tryPool.test:38. Report each as moved / deleted / kept-history after.

## Change
1. **KB fold → `chicken_cuts_basics`** (relocate all three by `grep -n '"id": "'`). Then delete `air_chilled_chicken` and `no_antibiotics_poultry`. Title, decision, why, short_answer, detail, kristy_take, science, tier_note, evidence_tier (`kristys_standard`), category stay byte-identical.
   - **aliases, asked_as, sources:** append every one from both cards, deduped by JSON value (the 9 CFR § 441.10 source is already present). 6 asks, 5 sources, 8 aliases arrive.
   - **labels_decoded:** append all three items verbatim ("Contains up to X% retained water", "Raised without antibiotics", "No antibiotic residues").
   - **cart_pick:** `"Bone-in chicken thighs"` → `"Air-chilled whole chicken or bone-in thighs"`. Reason: `typeContradicts` reads cart_pick first. The old union (air_chilled = whole, cuts = thigh) has to survive or "whole chicken" is vetoed off the only card that owns it. Breast stays uncovered on purpose (counterProbe48:132-139).
   - **pick_steps[2]** `"How it was chilled: see Air-chilled chicken."` → `"Look for ‘air-chilled’ printed on the package; it appears when it applies."` (air_chilled pick_steps[0], verbatim). Stays 3 steps.
   - **watch_out:** delete `"How it was chilled: see Air-chilled chicken."`, then append in order:
     - "Water-chilled packages disclose ‘retained water up to’ a percentage. That percentage is the tank." (air)
     - "No ‘retained water’ line on the label means none is allowed inside. The disclosure is required, not optional." (air)
     - "Where air-chilled is not stocked, a regular bird is still a clean cheap protein. Pat it dry before it goes in the pan." (air)
     - "Safe handling matters far more than the chilling method." (air detail; safety)
     - "‘Raised without antibiotics’ rests on the producer’s own affidavit to USDA. The agency does not inspect the farm, so oversight is weak. A third-party seal is what makes it checkable." (abx watch_out[0], subject named)
     - "‘Natural’ says nothing about antibiotics. It means no artificial ingredients were added after processing and the meat is minimally processed. A natural bird can be raised with antibiotics." (abx)
     - "‘No hormones’ on chicken is an empty claim. Hormones and steroids are not allowed in poultry, so every bird already qualifies." (abx)
     - "Organic is the seal that carries the antibiotic rule: organic feed only, no antibiotics." (abx)
   - **buying_tips:** append in order:
     - "‘Air-chilled’ is printed on the package when it applies." (air)
     - "Skin that starts dry is the skin that crisps." (air)
     - "‘USDA Process Verified’ or a third-party seal backs a ‘raised without antibiotics’ claim." (abx, subject named)
     - "All chicken is required to be residue-free at sale, labeled or not." (abx)
     - "‘Raised without antibiotics’ is a management and resistance choice, not a cleaner-meat guarantee." (abx, subject named)
   - **Not moved (name each in the report):** abx watch_out[3] and its science clause, "‘Free range’ requires outdoor access…", because the fact is owned by label_pasture_raised_feed (`bird_pig_raising`) and chicken_cuts_basics is in that family. air buying_tips[1], "A whole bird is the cheapest way…", is a duplicate of the card's own "Whole bird: cheapest per pound". The abx `kristy_take` and pick_steps sentences are covered above. Never invent a replacement sentence.
2. `server/lib/counterCards.js` RETIRED, after `'egg_storage',`, append:
   `// → chicken_cuts_basics (IC-4a). One card per item: chilling and the antibiotics claim are on the chicken card now; aliases, asks, sources and labels moved. chicken_breast stays (type veto).` then `'air_chilled_chicken',` `'no_antibiotics_poultry',`.
3. `docs/do-lines-review.md`: delete primary rows :48-49. Keep secondary rows as history. Run `node scripts/buildDoLines.js` from `server/` (never hand-edit doLines.json).
4. `server/lib/counterCardLint.js:1567-1570`:
   - `bird_pig_raising` family → `['chicken_cuts_basics', 'pork_cuts_and_enhanced']`.
   - `chill_water` owner `'air_chilled_chicken'` → `'chicken_cuts_basics'`; family `['chicken_cuts_basics']` → `['chicken_breast']` (the breast card's chilling words are hyphenated/"retained chilling water" and do not match the pattern). If healthFirst or C7 flags chicken_breast (its do line or prose), use `['turkey_whole']` and report. Never empty (healthFirst.test.js:45). OWNED_FACTS stays 14.
5. `server/lib/tryPool.js:9` and `tryPool.test.js:38`: `'air_chilled_chicken'` → `'chicken_cuts_basics'` (same meat slot, pool stays 19, order otherwise unchanged).
6. `server/test/acceptance/k24.test.js:43` OWNERS `'air_chilled_chicken'` → `'chicken_cuts_basics'`.
7. `server/test/counterProbe48.test.js:149` and `:163`: `entryById('air_chilled_chicken')` → `entryById('chicken_cuts_basics')`. Lines 132-139 unchanged.
8. `server/lib/aisle.test.js:91` delete (line 90 covers chicken_cuts_basics); `:93` `'air_chilled_chicken'` → `'chicken_cuts_basics'`.
9. `server/scripts/listMatchProbe.js:317` and `:354-355` comments: `air_chilled_chicken` → `chicken_cuts_basics` (comment only).
10. `server/test/acceptance/k8.test.js:18`: remove both ids from SLICE, min `5` → `3`. Append test `'K8: IC-4a-chicken retired ids are in RETIRED and gone from the KB'` mirroring :34-39 for the two ids.
11. Count pins (each = post-eggs value − 2; relocate by grep): `ktight.test.js:15` remove both ids from B04; `:32` `B04: 9` → `7`; `:37` 191 → 189; `:40` 190 → 188. `healthFirst.test.js:19` 191 → 189. `counterCardLint.test.js:436` `191` → `189` with history comment above: `// IC-4a-chicken folds 2: air_chilled_chicken, no_antibiotics_poultry (2026-10-14).`

## Criteria
- C1 [test] Given the KB, Then neither id is an entry; both are in RETIRED; neither is a doLines key, a primary review row, a TRY_POOL id, a shortcut id, or an OWNED_FACTS owner/family; chicken_breast is still an entry.
- C2 [test] Given the pre-fold KB at 8a30d3d, Then every alias and asked_as of both ids is on chicken_cuts_basics.
- C3 [test] Each pre-fold ask is in scope, admitted (score ≥ 2, aliasScore > 0), with top = chicken_cuts_basics. "whole chicken", "chicken thighs" and "air chilled chicken" top-score chicken_cuts_basics. On the list, "whole chicken", "chicken thighs" and "chicken" attach chicken_cuts_basics. "chicken breast" tops chicken_breast on both doors. `typeContradicts('chicken breast', cuts)` is true and `typeContradicts('whole chicken', cuts)` is false.
- C4 [test] Every pre-fold source of both ids is on chicken_cuts_basics by JSON value.
- C5 [test] chicken_cuts_basics' spoken fields carry the nine moved sentences. Its labels_decoded carries every folded term once. pick_steps has 1-3 items and includes the air-chilled step. cart_pick is "Air-chilled whole chicken or bone-in thighs". Its JSON has no "see Air-chilled chicken".
- C6 [test] OWNED_FACTS = 14. chill_water owner = chicken_cuts_basics, ownerTitle = its KB title, non-empty family without the owner, every family id in the KB. bird_pig_raising family = [chicken_cuts_basics, pork_cuts_and_enhanced]. TRY_POOL has 19 entries, [4] = chicken_cuts_basics with a do line.
- C7 [test] chicken_cuts_basics and every chill_water family id: lintCard(projectEntry) `[]`, readability `[]`, lintRepeatedClaim `[]`; chicken_cuts_basics rule 4 = 0.
- C8 `npm test` green except k14 C12 (k8 edit; main re-anchors after commit). Probe 0 wrong. Dry-run 189.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "docs/do-lines-review.md", "server/lib/doLines.json", "server/lib/counterCardLint.js", "server/lib/tryPool.js"], "tests": ["server/test/acceptance/ic4achicken.test.js", "server/test/acceptance/k8.test.js"], "dependents": ["server/scripts/migrateCounterCards.js", "server/test/ktight.test.js", "server/test/healthFirst.test.js", "server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCards.js:148-159"], "expected": "2 ids retired and absent; chicken_breast kept", "test_name": "C1 folded chicken ids retired"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4achicken.test.js"], "dependents": ["server/test/acceptance/k24.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json:771-880"], "expected": "0 aliases or asks lost", "test_name": "C2 chicken aliases and asks moved"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4achicken.test.js", "server/test/counterProbe48.test.js"], "dependents": ["server/scripts/listMatchProbe.js", "server/test/acceptance/k24.test.js"], "allowed_reads": ["server/lib/perimeter.js:103-151", "server/test/counterProbe48.test.js:132-172"], "expected": "folded asks and whole/thigh/bare rows on chicken_cuts_basics; breast on chicken_breast", "test_name": "C3 chicken rows land where they did"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4achicken.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "5 sources moved, 0 dropped", "test_name": "C4 chicken sources moved"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4achicken.test.js"], "dependents": ["server/test/acceptance/k8.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json:2774-2842"], "expected": "moved sentences, labels, step and cart_pick on chicken_cuts_basics; no stale pointer", "test_name": "C5 chicken facts on chicken_cuts_basics"},
    {"id": "C6", "impl": ["server/lib/counterCardLint.js", "server/lib/tryPool.js"], "tests": ["server/test/acceptance/ic4achicken.test.js", "server/test/healthFirst.test.js", "server/lib/tryPool.test.js"], "dependents": ["server/routes/counter.js"], "allowed_reads": ["server/lib/counterCardLint.js:1548-1591", "server/lib/tryPool.test.js"], "expected": "chill_water re-owned, 14 rows, try pool 19 with chicken_cuts_basics at [4]", "test_name": "C6 owned facts and try pool"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic4achicken.test.js", "server/test/healthFirst.test.js", "server/test/acceptance/k8.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/test/acceptance/passRule.js"], "expected": "lint, readability, repeated-claim and rule-4 clean", "test_name": "C7 chicken_cuts_basics lint clean"}
  ],
  "dependency_evidence": [
    {"source": "grep air_chilled_chicken|no_antibiotics_poultry over server/ excl fixtures (planner, 2026-10-14, post-eggs working tree)", "hits": ["kristy_perimeter_kb.json:772,823", "tryPool.js:9", "tryPool.test.js:38", "ktight.test.js:15", "kindFilter.test.js:107 (history comment, kept)", "counterCardLint.test.js:186 (history comment, kept)", "aisle.test.js:91,93", "counterCardLint.js:1568,1569", "doLines.json:3,113", "counterProbe48.test.js:149,163", "k24.test.js:43", "k8.test.js:18", "listMatchProbe.js:317,354"]},
    {"source": "grep docs/do-lines-review.md", "hits": [":48,:49 primary rows (delete)", ":259,:306,:313 secondary/history (kept)"]},
    {"source": "type veto", "hits": ["perimeter.js:130-151 typeContradicts reads cart_pick first", "counterProbe48.test.js:132-139 breast never returns chicken_cuts_basics", "counterProbe48.test.js:159-171 whole chicken/thighs fixtures"]},
    {"source": "OWNED_FACTS rules", "hits": ["healthFirst.test.js:21 (>= 13 rows)", "healthFirst.test.js:45 (family non-empty)", "counterCardLint.js:1551 ownerTitle derived from KB"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-4a-chicken", "network": false}
}
```

## Acceptance server/test/acceptance/ic4achicken.test.js
```js
// IC-4a (chicken): air_chilled_chicken and no_antibiotics_poultry fold into chicken_cuts_basics (docs/ITEM-CARDS-PLAN.md IC-4a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries, typeContradicts, PERIMETER_SECTIONS } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { attachCards } from '../../lib/listMatch.js';
import { RETIRED, projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim, OWNED_FACTS } from '../../lib/counterCardLint.js';
import { TRY_POOL } from '../../lib/tryPool.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '8a30d3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const listRow = (name) => attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
const TO = 'chicken_cuts_basics';
const FOLDED = ['air_chilled_chicken', 'no_antibiotics_poultry'];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded chicken ids retired', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from the pre-fold KB`);
    assert.ok(!now(id), `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still in doLines.json`);
    assert.ok(!review.has(id), `${id} still a do-lines-review row`);
    assert.ok(!TRY_POOL.includes(id), `${id} still in TRY_POOL`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${r.fact} still names ${id}`);
    for (const s of nonEmpty(PERIMETER_SECTIONS, 'sections', 6)) for (const sc of s.shortcuts || []) assert.notEqual(sc.id, id, `${s.id} shortcut points at ${id}`);
  }
  assert.ok(now('chicken_breast'), 'chicken_breast must stay its own card (type veto)');
  assert.ok(!RETIRED.includes('chicken_breast'), 'chicken_breast must not be retired');
});

test('C2 chicken aliases and asks moved', () => {
  const s = now(TO);
  for (const id of FOLDED) {
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(s.aliases.includes(a), `${id} alias "${a}" not on ${TO}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(s.asked_as.includes(q), `${id} ask "${q}" not on ${TO}`);
  }
});

test('C3 chicken rows land where they did', () => {
  for (const id of FOLDED) {
    for (const q of pre(id).asked_as) {
      assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
      const top = scoreEntries(q, 3)[0];
      assert.ok(admits(top), `"${q}" not admitted`);
      assert.equal(top.entry.id, TO, `"${q}" -> ${top.entry.id}`);
    }
  }
  for (const q of ['whole chicken', 'chicken thighs', 'air chilled chicken']) {
    assert.equal(scoreEntries(q, 3)[0]?.entry.id, TO, `counter "${q}"`);
  }
  for (const name of ['whole chicken', 'chicken thighs', 'chicken']) {
    assert.equal(listRow(name).cardSlug, TO, `list "${name}"`);
  }
  assert.equal(scoreEntries('chicken breast', 3)[0]?.entry.id, 'chicken_breast', 'counter "chicken breast"');
  assert.equal(listRow('chicken breast').cardSlug, 'chicken_breast', 'list "chicken breast"');
  assert.equal(typeContradicts('chicken breast', now(TO)), true, 'breast must stay vetoed off the thighs card');
  assert.equal(typeContradicts('whole chicken', now(TO)), false, 'whole chicken must be covered by the cart_pick');
});

test('C4 chicken sources moved', () => {
  const have = new Set((now(TO).sources || []).map((s) => JSON.stringify(s)));
  for (const id of FOLDED) {
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 2)) assert.ok(have.has(JSON.stringify(s)), `${id} source ${JSON.stringify(s)} not on ${TO}`);
  }
});

test('C5 chicken facts on chicken_cuts_basics', () => {
  const e = now(TO);
  const t = spoken(e);
  for (const s of [
    '‘Air-chilled’ is printed on the package when it applies.',
    'Water-chilled packages disclose ‘retained water up to’ a percentage.',
    'No ‘retained water’ line on the label means none is allowed inside.',
    'Safe handling matters far more than the chilling method.',
    'The agency does not inspect the farm, so oversight is weak.',
    '‘Natural’ says nothing about antibiotics.',
    '‘No hormones’ on chicken is an empty claim.',
    'Organic is the seal that carries the antibiotic rule: organic feed only, no antibiotics.',
    'All chicken is required to be residue-free at sale, labeled or not.',
  ]) assert.ok(t.includes(s), `moved sentence missing: ${s}`);
  const terms = (e.labels_decoded || []).map((l) => l.term);
  for (const id of FOLDED) for (const l of pre(id).labels_decoded || []) assert.ok(terms.includes(l.term), `label "${l.term}" from ${id} not moved`);
  assert.equal(new Set(terms).size, terms.length, 'duplicate labels_decoded term');
  assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `pick_steps has ${e.pick_steps.length}`);
  assert.ok(e.pick_steps.includes('Look for ‘air-chilled’ printed on the package; it appears when it applies.'), 'air-chilled step missing');
  assert.equal(e.cart_pick, 'Air-chilled whole chicken or bone-in thighs');
  assert.doesNotMatch(JSON.stringify(e), /see Air-chilled chicken/);
});

test('C6 owned facts and try pool', () => {
  assert.equal(OWNED_FACTS.length, 14);
  const chill = OWNED_FACTS.find((r) => r.fact === 'chill_water');
  assert.equal(chill.owner, TO);
  assert.equal(chill.ownerTitle, now(TO).title);
  assert.ok(!chill.family.includes(TO), 'owner listed in its own family');
  for (const id of nonEmpty(chill.family, 'chill_water family', 1)) assert.ok(now(id), `family id missing: ${id}`);
  assert.deepEqual(OWNED_FACTS.find((r) => r.fact === 'bird_pig_raising').family, ['chicken_cuts_basics', 'pork_cuts_and_enhanced']);
  assert.equal(TRY_POOL.length, 19);
  assert.equal(TRY_POOL[4], TO);
  assert.ok(doLines[TO], `${TO} has no do line`);
});

test('C7 chicken_cuts_basics lint clean', () => {
  const chill = OWNED_FACTS.find((r) => r.fact === 'chill_water');
  for (const id of [TO, ...chill.family]) {
    const e = now(id);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(readability(e), [], `${id} readability`);
    assert.deepEqual(lintRepeatedClaim(e), [], `${id} repeated claim`);
  }
  assert.doesNotMatch(spoken(now(TO)), RULE4, `${TO} trips claim-lock rule 4`);
});
```

## ANCHOR server/kristy_perimeter_kb.json:771
```
    {
      "id": "air_chilled_chicken",
      "title": "Air-chilled chicken",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:822
```
    {
      "id": "no_antibiotics_poultry",
      "title": "‘No antibiotics’ claims on chicken",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:2808
```
      "cart_pick": "Bone-in chicken thighs",
      "buying_tips": [
        "Whole bird: cheapest per pound, and the carcass makes stock.",
```

## ANCHOR server/kristy_perimeter_kb.json:2832
```
      "watch_out": [
        "How it was chilled: see Air-chilled chicken.",
        "Boneless skinless is the priciest form of the same bird."
      ],
      "pick_steps": [
        "Bone-in, skin-on thighs are the forgiving pick; boneless skinless costs the most.",
        "A whole bird is cheapest per pound, and the frame makes stock.",
        "How it was chilled: see Air-chilled chicken."
      ],
```

## ANCHOR server/lib/counterCards.js:156
```
  'egg_grades_sizes',
  'egg_feed_claims',
  'egg_storage',
];
```

## ANCHOR docs/do-lines-review.md:47
```
| `egg_labels` | eggs_dairy | Soy-free and corn-free first, then organic, then pasture-raised. | Check the small regional cartons. That is where a feed claim appears. | — |
| `air_chilled_chicken` | meat | Air-chilled. A water-chilled bird absorbs the bath it was cooled in. | Check the package for “retained water up to”. That percentage is water. | — |
| `no_antibiotics_poultry` | meat | A fair choice, not a cleaner bird. Don’t pay the premium. | Look for “USDA Process Verified” beside the claim, or put it back. | — |
```

## ANCHOR server/lib/counterCardLint.js:1567
```
  ownedFact('bird_pig_raising', 'label_pasture_raised_feed',
    ['chicken_cuts_basics', 'air_chilled_chicken', 'pork_cuts_and_enhanced'], /pasture[- ]raised|free[- ]range/i),
  ownedFact('chill_water', 'air_chilled_chicken',
    ['chicken_cuts_basics'], /air[- ]chill|water[- ]chill|retained water/i),
```

## ANCHOR server/lib/counterCardLint.test.js:434
```
  // IC-3b adds 1: produce_bananas (2026-10-14).
  // IC-4a-eggs folds 5: egg_shell_color, egg_freshness, egg_grades_sizes, egg_feed_claims, egg_storage (2026-10-14).
  assert.equal(CARDS.length, 191);
```

## ANCHOR server/test/healthFirst.test.js:17
```
const cards = nonEmpty(
  kb.entries.filter((e) => e.kind !== 'pick' || inFamily.has(e.id) || HEALTH_FIRST_PENDING.has(e.id)),
  'health-first corpus', 191
);
```

## ANCHOR server/test/ktight.test.js:37
```
const QUESTIONS = nonEmpty(questionEntries(kb.entries), 'question entries', 191);
const byId = new Map(QUESTIONS.map((e) => [e.id, e]));
const PICKS = nonEmpty(kb.entries.filter((e) => e.kind === 'pick'), 'picks');
const ALL_IDS = nonEmpty(Object.values(BATCHES).flat(), 'batched ids', 190);
```
Also `:15` B04 (`'rotisserie_chicken', 'air_chilled_chicken', 'no_antibiotics_poultry', 'chicken_cuts_basics', …`) and `:32` `B04: 9`.

## ANCHOR server/test/acceptance/k8.test.js:17
```
const SLICE = nonEmpty([
  'rotisserie_chicken', 'air_chilled_chicken', 'no_antibiotics_poultry', 'chicken_cuts_basics', 'egg_labels',
], 'the K8 slice', 5);
```

## ANCHOR server/test/acceptance/k24.test.js:42
```
const STATE_OK = { frozen_pizza: 'frozen', frozen_meals: 'frozen', frozen_fries: 'frozen', frozen_waffles: 'frozen', frozen_nuggets: 'frozen', frozen: 'frozen' };
const OWNERS = nonEmpty(['ice_cream', 'frozen_vs_fresh_produce', 'fresh_vs_previously_frozen_fish', 'white_fish', 'prepared_meals', 'rotisserie_chicken', 'air_chilled_chicken', 'breakfast_cereal', 'snacks', 'deli'], 'frozen-aisle ask owners', 10);
const FISH_HOMES = ['frozen_nuggets', 'frozen'];
```

## ANCHOR server/lib/tryPool.js:8
```
  'pork_cuts_and_enhanced',
  'air_chilled_chicken',
  'salmon_wild_vs_farmed',
```

## ANCHOR server/lib/tryPool.test.js:37
```
    'ground_beef_organ_blend', 'butcher_counter_asking', 'beef_cuts_basics',
    'pork_cuts_and_enhanced', 'air_chilled_chicken', 'salmon_wild_vs_farmed',
    'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish',
```

## ANCHOR server/lib/aisle.test.js:90
```
  assert.ok(meat.includes('chicken_cuts_basics'));
  assert.ok(meat.includes('air_chilled_chicken'));
  const eggs = sectionById('eggs_dairy').topics.map((t) => t.id);
  assert.ok(!eggs.includes('air_chilled_chicken'), 'chicken must not surface under Dairy & Eggs');
```

## ANCHOR server/test/counterProbe48.test.js:148
```
    ['canned salmon', entryById('salmon_wild_vs_farmed')],
    ['tinned chicken', entryById('air_chilled_chicken')],
    ['chicken breast', { ...entryById('chicken_cuts_basics'), id: 'pick_thighs', kind: 'pick' }],
```

## ANCHOR server/test/counterProbe48.test.js:162
```
    ['thighs or breasts', entryById('chicken_cuts_basics')],
    ['whole chicken', entryById('air_chilled_chicken')],
    ['canned light tuna', entryById('mercury_by_fish')],
```

## ANCHOR server/scripts/listMatchProbe.js:316
```
// A named card the corpus owns must be the one attached; a neighbour stealing the row is WRONG.
// `air_chilled_chicken` carries the bare alias `chicken`, so the rotisserie row is the hub test.
const OWNED_BY = { 'rotisserie chicken': 'rotisserie_chicken' };
```
And `:353-356` ("rotisserie chicken lands air_chilled_chicken through its bare `chicken` alias").

`server/lib/doLines.json` is regenerated by buildDoLines (keys :3 and :113 disappear); no anchor, never hand-edited.

## Prerequisites
Env: node ≥20, git on PATH (the acceptance test runs `git show 8a30d3d:...`), grep, `/Users/m1/kristy-ios` checked out for the verify grep. No network, no Supabase writes (dry-run only; a credentials error is reported, not fixed).
ic-4a-eggs committed (RETIRED ends `'egg_storage',`; pins read 191/190; OWNED_FACTS 14 with no hen_raising). Line numbers above are from the post-eggs working tree; relocate by grep first.

## Answers
- First allowed read: `grep -n '"id": "' server/kristy_perimeter_kb.json`.
- Suite ~1-3 min. Expected all green except k14 C12 (k8 diff); do not edit C12.
- k8 runs `assertPassRule(fixture, now)` on chicken_cuts_basics. HEALTH_FIRST_REWRITE relaxes cart_pick/aliases/asked_as/sources/labels_decoded (grow, never lose). evidence_tier and category stay frozen. watch_out count must stay ≥ the fixture's. Every number in the old rewritable text must survive.
- `readability()`: sentence ≤ 20 words, short_answer ≤ 40. Moved sentences go to buying_tips / watch_out / labels_decoded / the one pick_step only. Never touch science.
- If a moved ask lands elsewhere, add ONE longer specific alias to chicken_cuts_basics (hub-steal rule); never a short generic. Report it.
- If the cart_pick wording fails lintCard, reword it so it still names both a whole bird (`whole (chicken|bird)`) and thighs and not breast. Report the lint code.
- chicken_cuts_basics now owns chill_water: its air-chill/retained-water sentences are the owner speaking. It stays in bird_pig_raising, so no "free range"/"pasture raised" text may land on it.
- Claim trace: every moved sentence traces to its folded card's sources, now on chicken_cuts_basics (FSIS chilling, 9 CFR 441.10, FSIS RWA guidance, FDA residue rules, Consumer Reports, Rebel Pastures).
- Hard cap 60 min. Stop BLOCKED after 3 identical failures. Do not commit, stash or touch git. Never delete an assertion without a replacement. Leave `fixtures/kb-pre-readability.json` alone. Report ≤30 lines: READY / NOT READY, new `npm test` count, dropped-fact list, claim-trace table, the chill_water family used, the verify-grep before/after lists.
- Card commits end "Not migrated."

## Tried and rejected
- Folding chicken_breast too (plan list, ic-4b C0): typeContradicts + counterProbe48:132-139 pin breast off a thighs-pick card. Making it fit means a cart_pick that names all three cuts, which games the veto, or a matcher/test change in governed code. That is Devon's call, not a fold's.
- Keeping cart_pick "Bone-in chicken thighs": "whole chicken" gets vetoed off its only owner after air_chilled_chicken is deleted.
- Moving the free-range sentence: REPEATED_CLAIM against label_pasture_raised_feed.
- Re-owning chill_water with an empty family: healthFirst.test.js:45. Deleting the row: the fact keeps an owner (the chicken card), and OWNED_FACTS stays 14.
- Dropping air_chilled_chicken from TRY_POOL (19 → 18): the meat slot keeps an offer; chicken_cuts_basics has a cart_pick and a do line.
