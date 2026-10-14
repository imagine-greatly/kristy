# ic-6a — Seafood folds: fresh_vs_previously_frozen_fish and fish_freshness_at_counter → seafood_counter

```json
{
  "id": "ic-6a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/lib/counterCards.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.test.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/lib/perimeter.js",
    "server/lib/perimeter.test.js",
    "server/lib/sectionRules.json",
    "server/lib/listMatch.js",
    "server/lib/listMatch.test.js",
    "server/test/counterProbe48.test.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js",
    "server/test/acceptance/k3-1.test.js",
    "server/test/acceptance/k6.test.js",
    "server/test/acceptance/k16.test.js",
    "server/test/acceptance/k24.test.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCards.js:100-170",
    "server/test/acceptance/k16.test.js",
    "server/test/acceptance/k6.test.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic6a.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run; grep -rn -E 'fresh_vs_previously_frozen_fish|fish_freshness_at_counter' /Users/m1/kristy/server /Users/m1/kristy-ios --include=*.js --include=*.json --include=*.swift --include=*.md | grep -v -E 'test|fixtures|counterCards.js'",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-5b is committed. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe (every IC-3..IC-8 piece edits the KB and the count pins; strictly sequential).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-6a, D3 (same-subject folds only), claim-lock rules 1-5. Oversize: 19 owned files. It cannot split, because every half edits the same count pins and the suite would be red between halves (ic-3a / chf-5 e92e7c9 precedent). Most files carry a one-line id repoint.
**Directory caveat:** the planner verified these file names by grep but did not verify the directories of `sectionRules.json`, `listMatch.js`, `listMatch.test.js`, `counterProbe48.test.js`, `tryPool.js` or `tryPool.test.js`. The builder's first command is `cd /Users/m1/kristy && git ls-files | grep -E '(sectionRules.json|listMatch(.test)?.js|counterProbe48.test.js|tryPool(.test)?.js)$'`. If a path differs from `owns`, the builder uses the real path and reports it.

## Alignment block
- **Done means:**
  - **Retirement.** Both folded ids are gone from the KB. Each is in RETIRED, has no doLines key and no review row, and is named by no shortcut, tryPool entry, sectionRules source or test expectation.
  - **What moves.** Every 663ca3d alias moves to seafood_counter, except `salmon`, `fresh salmon` and `tuna`. So does every asked_as and every source.
  - **Sentences.** Every buying_tips/watch_out sentence is on seafood_counter (pointer and other-owner exemptions only).
  - **Two safety sentences survive verbatim** (curly quotes normalised):
    - "Don't re-freeze fish that was sold thawed."
    - "Smell it. Clean and briny is right. Sharp, fishy or ammonia is not."
  - **Questions.** Every folded question routes to seafood_counter.
  - **Count.** The count goes 186 → 184.
  - **Suite.** The suite and probe are green.
- **Out of scope:**
  - fronts and retitles (ic-6b);
  - the three withheld aliases (they stay with their current owners or nowhere);
  - kristy-ios refs (reported only);
  - OWNED_FACTS (neither folded id is in a family).
- **OK rough edges:**
  - seafood_counter's back runs long until ic-6b;
  - the try-pool may shrink to 18 if seafood_counter cannot stand in (reported);
  - a listMatch.test.js:316 assertion replaced by its closest true equivalent (reported).
- **Ship bar:**
  - a lost safety sentence, alias, ask or source;
  - a folded id reachable anywhere at runtime (perimeter.js, sectionRules.json, tryPool.js, listMatch.js);
  - a count pin left at 186;
  - a k16 steal (STOP BLOCKED);
  - an ESSENTIALS change.
- **Independent check:**
  - the dry-run prints 184;
  - the verify grep prints no server runtime hit;
  - ic6a C3 asks all six folded questions plus the repointed k-test pairs.

## Change
1. **KB.** Fold fresh_vs_previously_frozen_fish and fish_freshness_at_counter into seafood_counter.
   - Append to seafood_counter every alias (except `salmon`, `fresh salmon`, `tuna`), asked_as, source, buying_tips/watch_out sentence and labels_decoded entry (e.g. Gaping) not already there.
   - seafood_counter's pick_steps are at cap; nothing goes into pick_steps.
   - Delete both entries.
2. **RETIRED.** Append to `server/lib/counterCards.js` RETIRED after the last entry:
   ```
   // IC-6a (2026-10-14): folded by D3 (same subject). Aliases (less salmon, fresh salmon, tuna), asked_as, sources, tips and labels moved.
   // → seafood_counter: fresh-or-frozen and is-it-fresh are the counter's two questions.
   'fresh_vs_previously_frozen_fish',
   'fish_freshness_at_counter',
   ```
3. **`docs/do-lines-review.md`.** Delete the primary rows for fresh_vs_previously_frozen_fish (:43) and fish_freshness_at_counter (:91). Then run `node scripts/buildDoLines.js`.
4. **Count pins, 186 → 184.**
   - counterCardLint.test.js: `CARDS.length` → 184, with the comment `// IC-6a folds 2: fresh_vs_previously_frozen_fish, fish_freshness_at_counter (2026-10-14).`.
   - healthFirst.test.js:19 floor → 184.
   - ktight.test.js:
     - :12 B01: drop both ids (8 → 6);
     - :32 SIZES B01 → 6;
     - :37 → 184;
     - :40 → 183.
5. **Runtime repoints to `seafood_counter`.**
   - **perimeter.js:343:** `{ q: 'Is it fresh?', id: 'fish_freshness_at_counter' }` → `id: 'seafood_counter'`. If that makes the seafood section's shortcut ids repeat, drop this shortcut instead and report it.
   - **sectionRules.json:4:** `"sources": ["label_wild_vs_farm_raised", "fish_freshness_at_counter"]` → `["label_wild_vs_farm_raised", "seafood_counter"]`.
   - **listMatch.js:141,144:** reword the comment about fish_freshness carrying the bare alias "tuna" as history: `(until IC-6a, 2026-10-14, the retired fish_freshness_at_counter carried a bare "tuna" alias; the fold did not move it)`. No code change.
   - **tryPool.js:12, `'fresh_vs_previously_frozen_fish'`:**
     - Replace it with `'seafood_counter'` only if seafood_counter has a string cart_pick, has a do line, is not a label/produce card and is not already in the pool.
     - Else delete the line, and update tryPool.test.js (:39 list, and the pool-size pins at :64-65 and :83: 19 → 18).
     - Report which.
6. **Test repoints to `seafood_counter`.**
   - **perimeter.test.js:355** `['how do i tell if fish is fresh', 'fish_freshness_at_counter']`.
   - **listMatch.test.js:316** `stateContradicts('Canned skipjack tuna', entryById('fish_freshness_at_counter'))`:
     - repoint it to seafood_counter if it still returns true;
     - else replace it with `assert.notEqual(matchItemToCard('Canned skipjack tuna')?.slug, 'seafood_counter');` and report.
   - **counterProbe48.test.js:140, :141, :147:** fish_freshness_at_counter → seafood_counter. If any one fails after the repoint, STOP BLOCKED and report it (that is a real canned-fish steal).
   - **k3-1.test.js:**
     - :33 `['fresh fish', 'fresh_vs_previously_frozen_fish']`;
     - :39 the "what should fish smell like" test (keep its name, change the expected id).
   - **k16.test.js:38-39:** `['fresh fish', ...]`, `['frozen fish', ...]` and `'fish counter'` → seafood_counter. `['frozen fish fillets', 'white_fish']` stays.
   - **k24.test.js:43 OWNERS:** replace `'fresh_vs_previously_frozen_fish'` with `'seafood_counter'` (min stays at the count it holds after ic-4a-chicken).
   - **tryPool.test.js:39:** follow step 5.
7. **k6.test.js.**
   - :19-20: remove both ids. SLICE min 14 → 12.
   - Add `RETIRED` to the counterCards import.
   - Append `test('K6: IC-6a retired ids are in RETIRED and gone from the KB', ...)`, mirroring k9's chf-5 test.
8. **k16.test.js.**
   - **:58 OWNERS:** remove both ids, min 10 → 8.
   - **C4 (:74-77):** the expected seafood_counter short-alias set becomes `[...new Set(['seafood counter', ...FOLD_SHORT])].sort()`. Here FOLD_SHORT is every 663ca3d alias of the two folded ids with ≤2 words, minus `salmon`, `fresh salmon`, `tuna`. Compute it from `PRE` in the test.
   - **C5 (:90-96) URL check:**
     - add `import { execFileSync } from 'node:child_process'`, the PRE const and `const FOLDED_IN = new Set(['fresh_vs_previously_frozen_fish','fish_freshness_at_counter'].flatMap((id) => (PRE.entries.find((e) => e.id === id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))));`;
     - add `if (FOLDED_IN.has(u)) continue;` in the URL loop.
     - Reason: the nofima source predates the k16 archive.
   - If k16 C3b reports a NOT_NEW steal, STOP BLOCKED and report the alias: Devon decides.

## Criteria
- C1 [test] Both folded ids:
  - are absent from the KB and in RETIRED;
  - have no doLines key and no review row;
  - are in no OWNED_FACTS row.
- C2 [test] On seafood_counter:
  - every 663ca3d alias except salmon, fresh salmon and tuna;
  - every asked_as (≥3 each).
  - The three withheld aliases are not on seafood_counter.
- C3 [test] Every folded asked_as, plus 'fresh fish', 'frozen fish', 'fish counter' and 'what should fish smell like', routes to seafood_counter.
- C4 [test] Every 663ca3d source of both folded ids, including the nofima URL, is on seafood_counter.
- C5 [test] Folded buying_tips/watch_out sentences and label terms are on seafood_counter; both safety sentences are verbatim.
- C6 [test] Runtime references:
  - ESSENTIALS unchanged;
  - no shortcut names a folded id;
  - section shortcut ids are distinct;
  - sectionRules.json and tryPool.js name no folded id.
- C7 [test] seafood_counter has lintCard, readability and lintRepeatedClaim `[]`, and no new sentence hits rule 4. OWNED_FACTS = 14.
- C8 `npm test` green; probe 0 wrong; dry-run 184.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic6a.test.js", "server/test/acceptance/k6.test.js"], "dependents": ["server/lib/counterCardLint.test.js", "server/test/healthFirst.test.js", "server/test/ktight.test.js"], "allowed_reads": ["server/lib/counterCards.js:100-170"], "expected": "2 ids retired", "test_name": "C1 folded ids are retired everywhere"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6a.test.js", "server/test/acceptance/k16.test.js"], "dependents": ["server/test/acceptance/k3-1.test.js", "server/test/acceptance/k24.test.js"], "allowed_reads": [], "expected": "0 lost aliases except the 3 withheld", "test_name": "C2 aliases and asked_as moved"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6a.test.js", "server/lib/perimeter.test.js", "server/test/counterProbe48.test.js"], "dependents": ["server/scripts/listMatchProbe.js", "server/lib/listMatch.test.js"], "allowed_reads": [], "expected": "every fish question admits seafood_counter", "test_name": "C3 folded questions reach the survivor"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6a.test.js", "server/test/acceptance/k16.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost sources", "test_name": "C4 sources moved"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6a.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost sentences; 2 safety sentences verbatim", "test_name": "C5 tips, watch-outs, labels and safety sentences moved"},
    {"id": "C6", "impl": ["server/lib/perimeter.js", "server/lib/sectionRules.json", "server/lib/tryPool.js"], "tests": ["server/test/acceptance/ic6a.test.js", "server/lib/tryPool.test.js"], "dependents": ["server/lib/listMatch.js"], "allowed_reads": ["server/lib/perimeter.js:320-350"], "expected": "no runtime reference to a folded id", "test_name": "C6 essentials, shortcuts, section rules and try pool intact"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6a.test.js"], "dependents": [], "allowed_reads": [], "expected": "seafood_counter lint clean", "test_name": "C7 survivor lints clean"}
  ],
  "dependency_evidence": [
    {"source": "planner grep fresh_vs_previously_frozen_fish|fish_freshness_at_counter over server/, 8a30d3d, 2026-10-14", "hits": ["perimeter.js:343", "sectionRules.json:4", "listMatch.js:141,144 (comment)", "tryPool.js:12", "tryPool.test.js:39", "ktight.test.js:12", "k6.test.js:19-20", "k16.test.js:38,39,58", "k24.test.js:43", "k3-1.test.js:33,39", "perimeter.test.js:355", "listMatch.test.js:316", "counterProbe48.test.js:140,141,147", "do-lines-review.md:43,91"]},
    {"source": "planner read of the docs/sources/k16 listing (37 files)", "hits": ["no nofima file; hence the FOLDED_IN exemption in k16 C5"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-6a", "network": false}
}
```

## Acceptance server/test/acceptance/ic6a.test.js
```js
// IC-6a: seafood folds, fresh_vs_previously_frozen_fish and fish_freshness_at_counter → seafood_counter (docs/ITEM-CARDS-PLAN.md IC-6a). Written by the planner; do not edit.
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
const TO = 'seafood_counter';
const FOLDED = ['fresh_vs_previously_frozen_fish', 'fish_freshness_at_counter'];
const WITHHELD = new Set(['salmon', 'fresh salmon', 'tuna']);
const EXTRA_ASKS = ['fresh fish', 'frozen fish', 'fish counter', 'what should fish smell like'];
const SAFETY = ["Don't re-freeze fish that was sold thawed.", 'Smell it. Clean and briny is right. Sharp, fishy or ammonia is not.'];
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
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${id} in OWNED_FACTS ${r.fact}`);
  }
});

test('C2 aliases and asked_as moved', () => {
  const to = now(TO);
  for (const id of FOLDED) {
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 5)) {
      if (WITHHELD.has(a)) continue;
      assert.ok(to.aliases.includes(a), `${id} alias "${a}" not on ${TO}`);
    }
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(to.asked_as.includes(q), `${id} ask "${q}" not on ${TO}`);
  }
  for (const a of WITHHELD) assert.ok(!to.aliases.includes(a), `${TO} took withheld alias "${a}"`);
});

test('C3 folded questions reach the survivor', () => {
  const asks = [...FOLDED.flatMap((id) => pre(id).asked_as), ...EXTRA_ASKS];
  for (const q of nonEmpty(asks, 'asks', 10)) {
    assert.ok(inScope(q).ok, `"${q}" out of scope`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, TO, `"${q}" → ${top.entry.id}`);
  }
});

test('C4 sources moved', () => {
  const have = new Set(now(TO).sources.map((s) => JSON.stringify(s)));
  for (const id of FOLDED) for (const s of nonEmpty(pre(id).sources, `${id} sources`, 3)) assert.ok(have.has(JSON.stringify(s)), `${id} source lost: ${JSON.stringify(s)}`);
  assert.ok(JSON.stringify(now(TO).sources).includes('https://nofima.com/worth-knowing/how-to-check-how-fresh-fish-is/'), 'nofima source lost');
});

test('C5 tips, watch-outs, labels and safety sentences moved', () => {
  const body = norm(strings(now(TO)).join('\n'));
  for (const id of FOLDED) {
    for (const f of ['buying_tips', 'watch_out']) {
      for (const s of nonEmpty([].concat(pre(id)[f] ?? []).flatMap(sentences), `${id} ${f}`, 2)) {
        if (POINTER.test(s) || ownedElsewhere(s, TO)) continue;
        assert.ok(body.includes(s), `${id} ${f} sentence not on ${TO}: ${s}`);
      }
    }
    for (const l of pre(id).labels_decoded ?? []) {
      if (ownedElsewhere(JSON.stringify(l), TO)) continue;
      assert.ok((now(TO).labels_decoded ?? []).map(term).includes(term(l)), `${id} label "${term(l)}" not on ${TO}`);
    }
  }
  const terms = (now(TO).labels_decoded ?? []).map(term);
  assert.equal(new Set(terms).size, terms.length, `${TO} label terms repeat`);
  for (const s of SAFETY) assert.ok(body.includes(norm(s)), `safety sentence lost: ${s}`);
});

test('C6 essentials, shortcuts, section rules and try pool intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `essential ${id} missing`);
  const sections = nonEmpty(PERIMETER_SECTIONS, 'sections', 6);
  for (const { id } of nonEmpty(sections.flatMap((s) => s.shortcuts ?? []), 'shortcuts', 12)) {
    assert.ok(!FOLDED.includes(id), `shortcut names folded ${id}`);
    assert.ok(now(id), `shortcut names missing ${id}`);
  }
  for (const s of sections) {
    const ids = (s.shortcuts ?? []).map((x) => x.id);
    assert.equal(new Set(ids).size, ids.length, `section shortcut ids repeat: ${ids}`);
  }
  const files = execFileSync('git', ['ls-files'], { cwd: ROOT }).toString().split('\n').filter((f) => /server\/.*(sectionRules\.json|tryPool\.js)$/.test(f));
  nonEmpty(files, 'sectionRules/tryPool files', 2);
  for (const f of files) {
    const src = readFileSync(join(ROOT, f), 'utf8');
    for (const id of FOLDED) assert.ok(!src.includes(id), `${f} still names ${id}`);
  }
});

test('C7 survivor lints clean', () => {
  const e = now(TO);
  assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[TO] })), [], `${TO} lint`);
  assert.deepEqual(readability(e), [], `${TO} readability`);
  assert.deepEqual(lintRepeatedClaim(e), [], `${TO} repeated claim`);
  const was = new Set(strings(pre(TO)).flatMap(sentences));
  for (const s of strings(e).flatMap(sentences)) if (!was.has(s)) assert.doesNotMatch(s, RULE4, `${TO}: ${s}`);
  assert.equal(OWNED_FACTS.length, 14);
});
```

## ANCHOR server/kristy_perimeter_kb.json:139
At 8a30d3d; relocate by `grep -n '"id": "fresh_vs_previously_frozen_fish"\|"id": "fish_freshness_at_counter"\|"id": "seafood_counter"'`.
```
    {
      "id": "fresh_vs_previously_frozen_fish",
      "title": "‘Fresh’ vs. previously-frozen fish",
```

## ANCHOR server/kristy_perimeter_kb.json:3217
```
    {
      "id": "fish_freshness_at_counter",
      "title": "Telling fresh at the fish counter",
```

## ANCHOR server/kristy_perimeter_kb.json:8599
```
    {
      "id": "seafood_counter",
      "title": "The seafood counter",
```

## ANCHOR server/lib/sectionRules.json:4
```
{"section": "seafood", "rule": "Read species, wild or farmed, and origin.", "checks": ["Counter fish sits on plenty of ice.", "Counter fish smells clean and briny, never ammonia."], "sources": ["label_wild_vs_farm_raised", "fish_freshness_at_counter"]},
```

## ANCHOR server/lib/perimeter.js:343
```
      { q: 'Is it fresh?', id: 'fish_freshness_at_counter' },
```

## ANCHOR server/lib/tryPool.js:9
```
  'air_chilled_chicken',
```
(ic-4a-chicken removes this line.) Then `:12` `  'fresh_vs_previously_frozen_fish',`. tryPool.test.js:39 `    'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish',`. Relocate both by grep.

## ANCHOR server/test/counterProbe48.test.js:140
```
  assert.ok(!scoreEntries('canned tuna', 100).some(({ entry }) => entry.id === 'fish_freshness_at_counter'));
  assert.notEqual(matchItemToCard('canned tuna')?.slug, 'fish_freshness_at_counter');
```
And `:147` `    ['tinned salmon', entryById('fish_freshness_at_counter')],`.

## ANCHOR server/lib/listMatch.test.js:316
```
  assert.equal(stateContradicts('Canned skipjack tuna', entryById('fish_freshness_at_counter')), true);
```

## ANCHOR server/test/ktight.test.js:12
```
  B01: ['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish', 'mercury_by_fish', 'fish_freshness_at_counter', 'canned_fish_choosing', 'farmed_fish_by_species', 'seafood_certifications'],
```

## ANCHOR server/test/acceptance/k16.test.js:58
```
const OWNERS = nonEmpty(['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish', 'mercury_by_fish', 'fish_freshness_at_counter', 'canned_fish_choosing', 'farmed_fish_by_species', 'seafood_certifications', 'label_wild_vs_farm_raised', 'canned_tuna'], 'seafood ask owners', 10);
```
k16 `:38` `  ['fresh fish', 'fresh_vs_previously_frozen_fish'], ['frozen fish', 'fresh_vs_previously_frozen_fish'], ['frozen fish fillets', 'white_fish'],`. C4 sits at :74-77 and C5 at :90-96; read them in full.

## ANCHOR server/test/acceptance/k6.test.js:19
```
  'salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish', 'mercury_by_fish',
  'fish_freshness_at_counter', 'canned_fish_choosing', 'farmed_fish_by_species', 'seafood_certifications', 'canned_tuna',
```

## ANCHOR server/test/acceptance/k3-1.test.js:33
```
  ['fresh fish', 'fresh_vs_previously_frozen_fish'], ['canned fish', 'canned_fish_choosing'], ['smoked fish', 'smoked_salmon'],
```
`:39` `test('ask "what should fish smell like" unchanged', () => assert.equal(top('what should fish smell like'), 'fish_freshness_at_counter'));`. k24 `:43`: the OWNERS line lists `'fresh_vs_previously_frozen_fish'`. perimeter.test.js `:355` `['how do i tell if fish is fresh', 'fish_freshness_at_counter'],`.

## Prerequisites
- **Env:** node ≥20, git on PATH, grep, and /Users/m1/kristy-ios checked out for the verify grep.
- No network and no Supabase writes. A dry-run credentials error is reported, not fixed.
- ic-5b must be committed first.

## Answers
- **First commands:**
  1. the `git ls-files` path check (directory caveat above);
  2. `grep -n '"id": "' server/kristy_perimeter_kb.json`.
- **Suite:** about 1-3 min. Do not edit k14 C12.
- **passRule:**
  - seafood_counter is ITEM_CARD_REWRITE, so aliases/asked_as/sources/labels may grow.
  - Numbers in old rewritable text survive.
  - evidence_tier stays byte-identical.
- **Hub-steal:** add ONE longer specific alias to the losing card and report it. A k16 C3b NOT_NEW steal → STOP BLOCKED.
- **Quotes:** curly quotes stay as the KB has them; the test normalises.
- **Dropped facts:** a dropped fact is named, never invented. If C5 cannot pass lint-clean, STOP BLOCKED and name the sentence.
- **iOS:** hits are reported, not edited.
- **Limits:**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not touch git state.
  - Never delete an assertion without a replacement.
  - Leave fixtures/kb-pre-readability.json alone.
- **Report (≤30 lines):** READY/NOT READY, npm count, the tryPool outcome, the listMatch.test.js:316 outcome, the perimeter.js:343 outcome, the dropped list and a claim-trace table.
- Card commits end "Not migrated."

## Tried and rejected
- **Folding into salmon_wild_vs_farmed:** freshness and thaw state cover every fish, not one species.
- **Moving `salmon`, `fresh salmon` and `tuna`:** the generic counter card would steal species questions from salmon_wild_vs_farmed and canned_tuna.
- **Dropping k16 C5's URL check:** narrowed instead. Only the folded-in sources are exempt, by value.
