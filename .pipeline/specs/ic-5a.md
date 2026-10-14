# ic-5a — Meat folds: beef_grades_usda → beef_cuts_basics, meat_case → judging_meat_at_the_case

```json
{
  "id": "ic-5a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/lib/counterCards.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js",
    "server/lib/counterCardLint.test.js",
    "server/lib/perimeter.test.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/test/acceptance/k9.test.js",
    "server/test/acceptance/k15.test.js",
    "server/test/acceptance/k16.test.js",
    "server/test/acceptance/k18.test.js",
    "server/test/acceptance/k19.test.js",
    "server/test/acceptance/passRule.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCardLint.js:1550-1590",
    "server/lib/counterCards.js:100-160",
    "server/test/acceptance/k9.test.js",
    "server/test/acceptance/k15.test.js",
    "server/test/ktight.test.js:1-45"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic5a.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run; grep -rn -E 'beef_grades_usda|meat_case' /Users/m1/kristy/server /Users/m1/kristy-ios --include=*.js --include=*.json --include=*.swift --include=*.md | grep -v -E 'test|fixtures|counterCards.js'",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-4b is committed. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe (every IC-3..IC-8 piece edits the KB and the count pins; strictly sequential).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-5a, D3 (same-subject folds only), claim-lock rules 1-5.
Oversize: 15 owned files. It cannot split, because every half edits the same count pins and the suite would be red between halves (same as ic-3a with 14; chf-5 e92e7c9 precedent).

## Alignment block
- **Done means:**
  - **The folds.** Given the fold map `{beef_grades_usda: beef_cuts_basics, meat_case: judging_meat_at_the_case}`, both folded ids:
    - are gone from the KB and listed in RETIRED;
    - have no doLines key and no do-lines-review row;
    - appear in no OWNED_FACTS owner or family.
  - **What moves.** Every 663ca3d alias, asked_as and source of a folded id is on its survivor. Every buying_tips/watch_out sentence of a folded id is on its survivor, except a pointer sentence or a sentence owned by another card's OWNED_FACTS row whose family includes the survivor.
  - **Questions.** Every folded asked_as question routes to its survivor (`inScope` ok, admitted top).
  - **Counts.** The count goes 188 → 186 in every count pin. OWNED_FACTS stays 14.
  - **Checks.** The suite is green and the probe reports 0 wrong.
- **Out of scope:**
  - fronts and retitles (ic-5b);
  - the meat shortcuts (perimeter.js:326-331 already name no folded id);
  - kristy-ios refs (reported, not edited);
  - moving meat_case's cart_pick.
- **OK rough edges:**
  - the survivors' backs run long until ic-5b's front pass;
  - a duplicate sentence already on the survivor is not added twice;
  - the neutral Angus watch_out moves verbatim.
- **Ship bar:** any of these blocks shipping:
  - a lost alias, asked_as, source or safety sentence;
  - a folded id still reachable by a shortcut, tryPool, doLines or the review table;
  - a count pin left at 188;
  - a loosened lint;
  - an ESSENTIALS change.
- **Independent check:**
  - `node scripts/migrateCounterCards.js --dry-run` prints 186 cards;
  - the verify grep prints no server hit outside tests;
  - ic5a C3 asks every folded question.

## Change
1. **KB: beef_grades_usda → beef_cuts_basics.**
   - Append to beef_cuts_basics every beef_grades_usda alias, asked_as and source not already there.
   - Append every buying_tips/watch_out sentence not already there. This includes the neutral Angus watch_out, verbatim.
   - Append its labels_decoded entries (Prime/Choice/Select etc.) to beef_cuts_basics labels_decoded, which is [] at HEAD.
   - Skip a sentence matching the beef_raising pattern `/grass[- ]?(fed|finished)|grain[- ]?(fed|finished)/i` (owner beef_grassfed_vs_grainfed), and skip the pointer "How it was raised: see Grass-fed vs. grain-fed beef." Beef_cuts_basics already carries that pointer (KB 451); do not add it twice.
   - beef_cuts_basics pick_steps are full at 3, so nothing goes into pick_steps.
   - Delete the beef_grades_usda entry.
2. **KB: meat_case → judging_meat_at_the_case.**
   - The same moves, including the alias "meat case" and the asked_as "which meat should i buy".
   - Do NOT move meat_case's cart_pick.
   - If judging's spoken text does not match `/use-by|sell-by/i`, append meat_case's use-by pick step as a judging buying_tip, verbatim.
   - The pointer sentence is already on judging (KB 2935); do not duplicate it.
   - Delete the meat_case entry.
3. **`server/lib/counterCards.js` RETIRED:** append after the last entry:
   ```
   // IC-5a (2026-10-14): folded by D3 (same subject). Aliases, asked_as, sources, tips and labels moved.
   // → beef_cuts_basics: grade is a cut-buying question.
   'beef_grades_usda',
   // → judging_meat_at_the_case: the case walk is the judging card.
   'meat_case',
   ```
4. **`server/lib/counterCardLint.js`:**
   - Remove `'beef_grades_usda'` and `'meat_case'` from the families of `beef_raising`, `solution_added` and `mech_tenderized`. The family arrays are verbatim in the ANCHOR below.
   - Leave the owners, patterns and row count alone (14).
5. **`docs/do-lines-review.md`:** delete these two rows (verbatim at 8a30d3d):
   - `` | `beef_grades_usda` | meat | Pay for grade on a quick-cooked steak. Skip it on anything braised. | Read the grade as a marbling score, then ask how it was raised. | — | ``
   - `` | `meat_case` | meat | Decide the cook first, then ask which cut fits it. | Read how it was raised, anything added, then the use-by date. | — | ``

   Then run `node scripts/buildDoLines.js`.
6. **Count pins, 188 → 186:**
   - `server/lib/counterCardLint.test.js`: change `assert.equal(CARDS.length, 188)` to `186`, with the comment `// IC-5a folds 2: beef_grades_usda, meat_case (2026-10-14).` above it.
   - `server/test/healthFirst.test.js:19`: floor → 186.
   - `server/test/ktight.test.js`:
     - :14 B03 drops `'beef_grades_usda'` and `'meat_case'` (13 → 11 ids);
     - :32 SIZES B03 → 11;
     - :37 floor → 186;
     - :40 → 185.
7. **Test repoints:**
   - **k15.test.js:**
     - :21 drop `'meat_case'`, min 8 → 7.
     - :72-75: C4 becomes `test('C4 judging_meat_at_the_case carries the alias "meat case"', () => { const al = nonEmpty(byId('judging_meat_at_the_case')?.aliases ?? [], 'judging aliases', 4); assert.ok(al.includes('meat case')); });`. Keep the original's remaining assertions on that card only if they still hold, and report each one dropped.
     - Delete :126 (the meat_case skip).
   - **k9.test.js:**
     - :17-20 drop `'beef_grades_usda'`, min 10 → 9.
     - Append `test('K9: IC-5a retired ids are in RETIRED and gone from the KB', ...)`, mirroring the chf-5 test at :35-40, for both ids.
   - **k16.test.js:43, k18.test.js:41, k19.test.js:44:** `['meat case', 'meat_case']` → `['meat case', 'judging_meat_at_the_case']`.
   - **perimeter.test.js:**
     - :352 `['what does usda prime mean', 'beef_grades_usda']` → `'beef_cuts_basics'`.
     - :241: replace `'beef_grades_usda'` with `'judging_meat_at_the_case'` only if that loop's assertion holds for judging; else drop the id and report.
8. **passRule.js** (conditional): beef_cuts_basics is HEALTH_FIRST_REWRITE, not ITEM_CARD_REWRITE.
   - If the k9 passRule check fails because beef_cuts_basics aliases/asked_as/sources/labels_decoded grew, add `'beef_cuts_basics'` to ITEM_CARD_REWRITE. That set permits growth, never shrink, and the card becomes the "Steak" item card in ic-5b.
   - Report which way it went. Never loosen any other rule.

## Criteria
- C1 [test] Both folded ids:
  - are absent from the KB and in RETIRED;
  - have no doLines key and no review row;
  - are in no OWNED_FACTS owner or family.
- C2 [test] Every 663ca3d alias and asked_as (≥3) of each folded id is on its survivor.
- C3 [test] Every folded asked_as question routes in scope to its survivor; 'meat case' and 'what does usda prime mean' route there too.
- C4 [test] Every 663ca3d source of each folded id is on its survivor.
- C5 [test] Folded buying_tips/watch_out sentences are on the survivor (pointer and other-owner exemptions only).
  - Folded label terms are on the survivor, and the survivor's terms are unique.
  - /prime/, /choice/ and /select/ appear on beef_cuts_basics.
  - Judging carries a use-by/sell-by check.
- C6 [test] ESSENTIALS is unchanged and every essential exists.
  - No section shortcut names a folded or missing id.
  - Each section's shortcut ids are distinct.
- C7 [test] For each survivor:
  - lintCard, readability and lintRepeatedClaim are `[]`;
  - no new sentence hits rule 4.
  - OWNED_FACTS count is 14.
- C8 `npm test` green; probe 0 wrong; dry-run 186.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "server/lib/counterCardLint.js", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic5a.test.js", "server/test/acceptance/k9.test.js"], "dependents": ["server/lib/counterCardLint.test.js", "server/test/healthFirst.test.js", "server/test/ktight.test.js", "server/test/acceptance/k15.test.js"], "allowed_reads": ["server/lib/counterCards.js:100-160", "server/lib/counterCardLint.js:1550-1590"], "expected": "2 ids retired", "test_name": "C1 folded ids are retired everywhere"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5a.test.js"], "dependents": ["server/test/acceptance/k16.test.js", "server/test/acceptance/k18.test.js", "server/test/acceptance/k19.test.js"], "allowed_reads": [], "expected": "0 lost aliases or asks", "test_name": "C2 aliases and asked_as moved"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5a.test.js", "server/lib/perimeter.test.js"], "dependents": ["server/scripts/listMatchProbe.js"], "allowed_reads": [], "expected": "every folded ask admits its survivor", "test_name": "C3 folded questions reach the survivor"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5a.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost sources", "test_name": "C4 sources moved"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5a.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost sentences or label terms", "test_name": "C5 tips, watch-outs and labels moved"},
    {"id": "C6", "impl": [], "tests": ["server/test/acceptance/ic5a.test.js"], "dependents": ["server/lib/perimeter.js"], "allowed_reads": ["server/lib/perimeter.js:320-350"], "expected": "no shortcut names a folded id", "test_name": "C6 essentials and shortcuts intact"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5a.test.js"], "dependents": [], "allowed_reads": [], "expected": "survivors lint clean", "test_name": "C7 survivors lint clean"}
  ],
  "dependency_evidence": [
    {"source": "planner grep beef_grades_usda|meat_case over server/, 8a30d3d, 2026-10-14", "hits": ["counterCardLint.js:1556,1562,1565 families", "ktight.test.js:14", "k15.test.js:21,72,73,126", "k9.test.js:18", "k16.test.js:43", "k18.test.js:41", "k19.test.js:44", "perimeter.test.js:241,352", "do-lines-review.md:84,155"]},
    {"source": "KB pointer grep 'see Grass-fed vs. grain-fed beef'", "hits": ["KB 2812 beef_grades_usda (deleted with the entry)", "KB 8092 meat_case (deleted with the entry)", "KB 451, 2935 survivors already carry it"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-5a", "network": false}
}
```

## Acceptance server/test/acceptance/ic5a.test.js
```js
// IC-5a: meat folds, beef_grades_usda → beef_cuts_basics, meat_case → judging_meat_at_the_case (docs/ITEM-CARDS-PLAN.md IC-5a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries, PERIMETER_SECTIONS } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { RETIRED, ESSENTIALS, projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim, OWNED_FACTS } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const FOLD = { beef_grades_usda: 'beef_cuts_basics', meat_case: 'judging_meat_at_the_case' };
const FOLDED = Object.keys(FOLD);
const SURVIVORS = [...new Set(Object.values(FOLD))];
const EXTRA_ASKS = [['meat case', 'judging_meat_at_the_case'], ['what does usda prime mean', 'beef_cuts_basics']];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const strings = (e) => SPOKEN.flatMap((f) => [].concat(e?.[f] ?? [])).flatMap((x) => (typeof x === 'string' ? [x] : Object.values(x ?? {}).filter((v) => typeof v === 'string')));
const norm = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const sentences = (s) => norm(s).split(/(?<=[.!?])\s+/).filter(Boolean);
const POINTER = /^[A-Z][^:]{0,40}: see (.+)\.$/;
const ownedElsewhere = (s, to) => OWNED_FACTS.some((r) => r.owner !== to && r.family.includes(to) && r.pattern.test(s));
const term = (l) => norm(typeof l === 'string' ? l : (l.term ?? Object.values(l)[0]));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded ids are retired everywhere', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from 663ca3d`);
    assert.equal(now(id), undefined, `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still has a do line`);
    assert.ok(!review.has(id), `${id} still in do-lines-review`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${id} still in OWNED_FACTS ${r.fact}`);
  }
});

test('C2 aliases and asked_as moved', () => {
  for (const id of FOLDED) {
    const to = now(FOLD[id]);
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(to.aliases.includes(a), `${id} alias "${a}" not on ${to.id}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(to.asked_as.includes(q), `${id} ask "${q}" not on ${to.id}`);
  }
});

test('C3 folded questions reach the survivor', () => {
  const asks = [...FOLDED.flatMap((id) => pre(id).asked_as.map((q) => [q, FOLD[id]])), ...EXTRA_ASKS];
  for (const [q, want] of nonEmpty(asks, 'asks', 8)) {
    assert.ok(inScope(q).ok, `"${q}" out of scope`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, want, `"${q}" → ${top.entry.id}`);
  }
});

test('C4 sources moved', () => {
  for (const id of FOLDED) {
    const have = new Set(now(FOLD[id]).sources.map((s) => JSON.stringify(s)));
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 2)) assert.ok(have.has(JSON.stringify(s)), `${id} source lost: ${JSON.stringify(s)}`);
  }
});

test('C5 tips, watch-outs and labels moved', () => {
  for (const id of FOLDED) {
    const to = FOLD[id];
    const body = norm(strings(now(to)).join('\n'));
    for (const f of ['buying_tips', 'watch_out']) {
      for (const s of nonEmpty([].concat(pre(id)[f] ?? []).flatMap(sentences), `${id} ${f}`, 2)) {
        if (POINTER.test(s) || ownedElsewhere(s, to)) continue;
        assert.ok(body.includes(s), `${id} ${f} sentence not on ${to}: ${s}`);
      }
    }
    const terms = (now(to).labels_decoded ?? []).map(term);
    assert.equal(new Set(terms).size, terms.length, `${to} label terms repeat`);
    for (const l of pre(id).labels_decoded ?? []) {
      if (ownedElsewhere(JSON.stringify(l), to)) continue;
      assert.ok(terms.includes(term(l)), `${id} label "${term(l)}" not on ${to}`);
    }
  }
  const steak = norm(strings(now('beef_cuts_basics')).join('\n'));
  for (const re of [/prime/i, /choice/i, /select/i]) assert.match(steak, re);
  assert.match(norm(strings(now('judging_meat_at_the_case')).join('\n')), /use-by|sell-by/i);
});

test('C6 essentials and shortcuts intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `essential ${id} missing`);
  const sections = nonEmpty(PERIMETER_SECTIONS, 'sections', 6);
  const shortcuts = nonEmpty(sections.flatMap((s) => s.shortcuts ?? []), 'shortcuts', 12);
  for (const { id } of shortcuts) {
    assert.ok(!FOLDED.includes(id), `shortcut names folded ${id}`);
    assert.ok(now(id), `shortcut names missing ${id}`);
  }
  for (const s of sections) {
    const ids = (s.shortcuts ?? []).map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `section shortcut ids repeat: ${ids}`);
  }
});

test('C7 survivors lint clean', () => {
  for (const to of SURVIVORS) {
    const e = now(to);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[to] })), [], `${to} lint`);
    assert.deepEqual(readability(e), [], `${to} readability`);
    assert.deepEqual(lintRepeatedClaim(e), [], `${to} repeated claim`);
    const was = new Set(strings(pre(to)).flatMap(sentences));
    for (const s of strings(e).flatMap(sentences)) if (!was.has(s)) assert.doesNotMatch(s, RULE4, `${to}: ${s}`);
  }
  assert.equal(OWNED_FACTS.length, 14);
});
```

## ANCHOR server/lib/counterCardLint.js:1555
At 8a30d3d; ic-4a removes hen_raising, so the lines shift. Relocate them with `grep -n "ownedFact('" server/lib/counterCardLint.js`.
```
  ownedFact('beef_raising', 'beef_grassfed_vs_grainfed',
    ['ground_beef_lean_ratio', 'ground_beef_organ_blend', 'beef_cuts_basics', 'beef_grades_usda', 'meat_case',
      'butcher_counter_asking', 'judging_meat_at_the_case', 'organ_meats', 'pick_soup_bones'],
```
```
  ownedFact('solution_added', 'pork_cuts_and_enhanced',
    ['ground_beef_lean_ratio', 'beef_cuts_basics', 'beef_grades_usda', 'meat_case', 'butcher_counter_asking',
      'judging_meat_at_the_case', 'lamb_goat', 'bison', 'venison_game'], /solution|enhanced/i),
  ownedFact('mech_tenderized', 'beef_cuts_basics',
    ['ground_beef_lean_ratio', 'beef_grades_usda', 'meat_case', 'butcher_counter_asking', 'judging_meat_at_the_case'],
```

## ANCHOR server/lib/counterCards.js:151
The RETIRED end at 8a30d3d. ic-4a appends egg/chicken blocks after it; append after the last entry.
```
  // → berries_picking, retitled "Berries". Residue screen, seal steps and labels moved; lawsuit material dropped (non-negotiable 9).
  'strawberries_organic_residue',
];
```

## ANCHOR server/kristy_perimeter_kb.json:2751
Relocate it with `grep -n '"id": "beef_grades_usda"\|"id": "meat_case"\|"id": "beef_cuts_basics"\|"id": "judging_meat_at_the_case"'`.
```
    {
      "id": "beef_grades_usda",
      "title": "USDA beef grades: Prime, Choice, Select",
```

## ANCHOR server/kristy_perimeter_kb.json:8061
```
    {
      "id": "meat_case",
      "title": "The meat case",
```

## ANCHOR server/test/acceptance/k15.test.js:72
```
test('C4 broad card: meat_case owns exactly one short alias, "meat case"', () => {
  const al = nonEmpty(byId('meat_case')?.aliases ?? [], 'meat_case aliases', 4);
```
Also `:21` `const CARDS = nonEmpty(['ham', 'turkey_bacon', 'cured_pork', 'lamb_goat', 'organ_meats', 'bison', 'venison_game', 'meat_case'], 'K15 cards', 8);` and `:126` `      if (id === 'meat_case' && q === 'which meat should i buy') continue;`.

## ANCHOR server/test/ktight.test.js:14
```
  B03: ['beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio', 'beef_grades_usda', 'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'lamb_goat', 'organ_meats', 'bison', 'venison_game', 'meat_case'],
```
:32 SIZES, :37 QUESTIONS floor, :40 ALL_IDS floor: relocate by reading `ktight.test.js:28-42`. healthFirst.test.js:19: relocate by `grep -n 'nonEmpty' server/test/healthFirst.test.js`. counterCardLint.test.js: relocate by `grep -n 'CARDS.length' server/lib/counterCardLint.test.js`.

## ANCHOR server/lib/perimeter.test.js:352
```
    ['what does usda prime mean', 'beef_grades_usda'],
```
and `:241` `  for (const id of ['organic_worth_it_by_type', 'produce_ripeness_by_item', 'beef_grades_usda']) {`. Single lines known; relocate by grep.

## ANCHOR server/test/acceptance/k16.test.js:43
```
  ['smoked ham', 'ham'], ['meat sticks', 'pick_jerky'], ['meat case', 'meat_case'], ['oyster sauce', null], ['seafood', 'seafood_counter'],
```
Also k18.test.js:41 `  ['meat case', 'meat_case'], ['seafood counter', 'seafood_counter'], ['seafood', 'seafood_counter'],` and k19.test.js:44 `  ['bread aisle', 'bread_aisle'], ['meat case', 'meat_case'], ['seafood counter', 'seafood_counter'],`. k9.test.js:18 `  'beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio', 'beef_grades_usda',`.

## Prerequisites
- **Env:** node ≥20, git on PATH, grep, and /Users/m1/kristy-ios checked out for the verify grep.
- No network, no Supabase writes. A dry-run credentials error is reported, not fixed.
- ic-4b is committed.

## Answers
- First read: `grep -n '"id": "' server/kristy_perimeter_kb.json`.
- **Suite:** ~1-3 min, green except k14 C12, if main has not re-anchored it. Do not edit C12.
- **passRule rules:**
  - ITEM_CARD_REWRITE lets aliases/asked_as/sources/labels_decoded/cart_pick grow, never shrink.
  - evidence_tier and category stay byte-identical.
  - watch_out only grows.
  - Numbers in old rewritable text survive.
  - See Change step 8 for beef_cuts_basics.
- **Hub-steal:** if a moved alias steals a k-test or probe question from another card, add ONE longer specific alias to the losing card and report it. Never delete a moved alias.
- **Dropped facts:** a dropped fact is named, never invented. If C5 cannot pass without a lint failure (REPEATED_CLAIM or readability), STOP BLOCKED and name the sentence.
- **Size limits:** pick_steps stays 1-3. Readability: short_answer ≤40 words, any sentence ≤20.
- **iOS hits:** an iOS hit in the verify grep is reported, not edited.
- **Run limits:**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not commit, stash or touch git.
  - Never delete an assertion without a replacement.
  - Leave fixtures/kb-pre-readability.json alone.
- **Report ≤30 lines:**
  - READY/NOT READY;
  - the npm count;
  - the passRule step-8 outcome;
  - the perimeter.test.js:241 outcome;
  - the dropped list;
  - a claim-trace table.
- Card commits end "Not migrated."

## Tried and rejected
- **Folding beef_grades_usda into beef_grassfed_vs_grainfed:** grade is marbling at the cut, not raising. D3 allows same-subject folds only.
- **Moving meat_case's cart_pick to judging:** judging is an ESSENTIAL "how to look" card, and perimeter.test.js:241 asserts the no-cart_pick shape for that loop.
- **Rewriting the k15 C4 broad-card test away:** the alias "meat case" still needs one owner, and C4 now pins it on judging.
