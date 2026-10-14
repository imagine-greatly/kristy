# ic-7a — Dairy folds: a2_vs_a1_milk and milk_processing → "Milk"; yogurt_live_cultures → yogurt_plain_vs_flavored

```json
{
  "id": "ic-7a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/lib/counterCards.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js",
    "server/lib/counterCardLint.test.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/lib/perimeter.test.js",
    "server/lib/counterDecision.test.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js",
    "server/test/acceptance/k7.test.js",
    "server/test/acceptance/k19.test.js",
    "server/test/acceptance/k20.test.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCards.js:100-175",
    "server/lib/counterCardLint.js:1540-1600",
    "server/lib/counterDecision.test.js:80-95",
    "server/test/acceptance/k7.test.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic7a.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run; grep -rn -E 'a2_vs_a1_milk|milk_processing|yogurt_live_cultures' /Users/m1/kristy/server /Users/m1/kristy-ios --include=*.js --include=*.json --include=*.swift --include=*.md | grep -v -E 'test|fixtures|counterCards.js'",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-6b is committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe.
Plan: `docs/ITEM-CARDS-PLAN.md` IC-7a, D3 (same-subject folds only), claim-lock rules 1-5. Oversize: 15 owned files. It cannot split, because both folds edit the same count pins (ic-3a precedent).
**Directory caveat:** the planner verified these file names by grep but not the directories of `perimeter.test.js`, `counterDecision.test.js`, `tryPool.js` and `tryPool.test.js`. The first command is `cd /Users/m1/kristy && git ls-files | grep -E '(perimeter|counterDecision|tryPool)(\.test)?\.js$'`. If a path differs, use the real one and report it.
**Retitle here, fronts in 7b.** whole_vs_reduced_fat_milk is retitled "Milk" in this piece. The milk_processing OWNED_FACTS owner moves to it, and the pointer lint derives ownerTitle from the KB title, so the retitle and the pointer change must land together. The decision and tier_note wait for ic-7b.

## Alignment block
- **Done means:**
  - **Retirement.** a2_vs_a1_milk, milk_processing and yogurt_live_cultures are gone from the KB. Each is in RETIRED, has no doLines key and no primary review row, and is named by no shortcut, tryPool entry, OWNED_FACTS row or test expectation.
  - **Milk card.** whole_vs_reduced_fat_milk:
    - is titled "Milk";
    - is the only non-pick so titled (pick_milk is `kind: pick`);
    - carries every alias, asked_as, source, tip/watch_out sentence and label of the two milk folds;
    - owns the `milk_processing` OWNED_FACTS row.
  - **Pointer.** The goat_sheep_dairy pointer reads "Homogenized or ultra-pasteurized: see Milk.".
  - **Yogurt card.** yogurt_plain_vs_flavored carries every alias of yogurt_live_cultures except `kefir`, `alive` and `still alive`. It also carries every asked_as, source, tip/watch_out sentence and label.
  - **Named drops.** The A2 digestion tip and the 161°F/280°F detail numbers are dropped and named.
  - **Count.** The count goes 184 → 181.
  - **Suite.** The suite and probe are green.
- **Out of scope:**
  - Milk/Yogurt fronts, the Yogurt and Butter retitles, the raw-milk watch_out (ic-7b);
  - kristy-ios a2 refs (flagged; IC-12 or an iOS piece repoints them);
  - OWNED_FACTS count (stays 14).
- **OK rough edges:**
  - the Milk back runs long until 7b;
  - the moved A2 ladder tip ("The ladder runs four steps...") reads differently from Devon's milk ruling until 7b reconciles the front;
  - the try-pool may shrink by one (reported);
  - counterDecision.test.js:85 may lose milk_processing without gaining whole_vs (reported).
- **Ship bar:**
  - a lost alias, ask, source or safety/standard sentence;
  - the A2 digestion tip anywhere in the KB (non-negotiable 3);
  - a stale "see Pasteurized, ultra-pasteurized, homogenized" pointer;
  - two non-pick "Milk" cards;
  - a folded id reachable at runtime;
  - an ESSENTIALS change;
  - a k19/k20 steal.
- **Independent check:**
  - the dry-run prints 181;
  - the verify grep's server hits are 0 (kristy-ios hits are listed, expected);
  - ic7a C3 asks every folded question;
  - perimeter.test.js:360 asks 'what is ultra pasteurized milk'.

## Change
1. **KB folds.**
   - Fold a2_vs_a1_milk and milk_processing into whole_vs_reduced_fat_milk.
   - Fold yogurt_live_cultures into yogurt_plain_vs_flavored. Do NOT move its aliases `kefir`, `alive` or `still alive`.
   - Append every other alias, asked_as and source, every buying_tips/watch_out sentence and every labels_decoded entry not already there. Keep the whole_vs label "Reduced-fat (2%) / low-fat (1%) / skim" and its numbers.
   - Delete the three entries.
2. **Named drops.** Do not move these. Name them in the report:
   - a2 tip `People who struggle with regular milk often do better on A2. Worth trying for a week.` (a digestion claim, non-negotiable 3);
   - milk_processing's 161°F / 280°F figures, which live in `detail` only (detail is not moved).
   - Any other unmoved sentence is a STOP BLOCKED, not a drop.
3. **Retitle.** whole_vs_reduced_fat_milk title `Whole vs. reduced-fat milk` → `Milk`.
4. **Pointers.**
   - Replace every `Homogenized or ultra-pasteurized: see Pasteurized, ultra-pasteurized, homogenized.` with `Homogenized or ultra-pasteurized: see Milk.`. At 8a30d3d one sat at KB 9578 (goat_sheep_dairy); grep for more.
   - Repoint any `see A2 vs. A1 milk.` to `see Milk.`.
   - Repoint any `see Live cultures, kefir and skyr.` to `see Plain vs. flavored yogurt.`.
5. **`server/lib/counterCardLint.js`.**
   - **Owner change:** in `ownedFact('milk_processing', 'milk_processing', [...]` change the second argument (owner) to `'whole_vs_reduced_fat_milk'`. Keep the fact name, family and pattern. Relocate it by `grep -n "ownedFact('milk_processing'" server/lib/counterCardLint.js`.
   - **Families:** remove a2_vs_a1_milk or yogurt_live_cultures from any OWNED_FACTS family that lists them.
   - OWNED_FACTS stays at 14.
6. **RETIRED.** Append to `server/lib/counterCards.js` after the last entry:
   ```
   // IC-6a … (existing entries above)
   // IC-7a (2026-10-14): folded by D3. → whole_vs_reduced_fat_milk, retitled "Milk": breed and processing are milk questions.
   // A2 digestion tip and the 161°F/280°F detail figures dropped (non-negotiable 3; detail not moved).
   'a2_vs_a1_milk',
   'milk_processing',
   // → yogurt_plain_vs_flavored: live cultures is how to pick plain yogurt. Aliases kefir/alive/still alive not moved.
   'yogurt_live_cultures',
   ```
   Omit the first comment line; it shows the position only.
7. **`docs/do-lines-review.md`.**
   - Delete the primary rows :59 (a2), :99 (milk_processing) and :100 (yogurt_live_cultures). Keep :58 and :61.
   - Keep the historical audit row at :355.
   - If ic7a C1 fails only because parseReviewTable reads :355, change that cell from `` `yogurt_live_cultures` `` to `yogurt_live_cultures (retired, IC-7a)` and report it.
   - Then run `node scripts/buildDoLines.js`.
8. **Count pins, 184 → 181.**
   - counterCardLint.test.js: `CARDS.length` → 181, with the comment `// IC-7a folds 3: a2_vs_a1_milk, milk_processing, yogurt_live_cultures (2026-10-14).`.
   - healthFirst.test.js:19 floor → 181.
   - ktight.test.js:
     - :19 B08: drop the 3 ids (12 → 9);
     - :32 SIZES B08 → 9;
     - :37 → 181;
     - :40 → 180.
9. **Repoints.**
   - **perimeter.test.js:360:** `['what is ultra pasteurized milk', 'milk_processing']` → `'whole_vs_reduced_fat_milk'`.
   - **counterDecision.test.js:85:** the loop over `['salmon_wild_vs_farmed', 'beef_grassfed_vs_grainfed', 'milk_processing']`:
     - replace `milk_processing` with `whole_vs_reduced_fat_milk` if that passes;
     - else remove it from the array (two ids remain) and report.
   - **k19:**
     - :39 `['cultured dairy', 'yogurt_live_cultures']` → `yogurt_plain_vs_flavored`;
     - :52 OWNERS: remove the 3 ids, min 17 → 14.
   - **k20:**
     - :37 `['cultured dairy', 'yogurt_live_cultures']` → `yogurt_plain_vs_flavored`;
     - :46 OWNERS: replace `'yogurt_live_cultures'` with `'yogurt_plain_vs_flavored'`, min stays 8.
   - **tryPool.js:15 `'yogurt_live_cultures'`:**
     - replace it with `'yogurt_plain_vs_flavored'` only if that card has a string cart_pick, has a do line and is not already in the pool;
     - else delete the line and decrement tryPool.test.js's pool-size pins (:64-65, :83) by one.
     - Either way, fix tryPool.test.js:40's list.
   - **tryPool.test.js:101:** drop `'a2_vs_a1_milk'` from the excluded set.
10. **k7.test.js.**
    - :18-19: remove the 3 ids. SLICE min 12 → 9.
    - Add `RETIRED` to the counterCards import.
    - Append `test('K7: IC-7a retired ids are in RETIRED and gone from the KB', ...)`.
11. **Steals.** A k19/k20 C3b NOT_NEW steal → STOP BLOCKED and name the alias.

## Criteria
- C1 [test] The three folded ids:
  - are absent and in RETIRED;
  - have no do line and no review row;
  - are in no OWNED_FACTS row.
- C2 [test] Every 663ca3d alias moved to its survivor, except kefir/alive/still alive. Every asked_as (≥3 each) moved. The Milk card is titled "Milk"; exactly one non-pick has that title.
- C3 [test] Every folded asked_as, plus 'what is ultra pasteurized milk', 'cultured dairy' and 'a2 milk', routes to its survivor.
- C4 [test] Every 663ca3d source moved, including the umn and msu URLs.
- C5 [test] Sentences and labels:
  - folded tip/watch_out sentences and labels are on the survivor;
  - the A2 digestion tip is absent from the whole KB;
  - Milk matches /ultra[- ]pasteuri[sz]ed/i, /homogeni[sz]ed/i and /\bA2\b/;
  - Yogurt matches /live and active cultures/i.
- C6 [test] Ownership and references:
  - the `milk_processing` OWNED_FACTS row is owned by whole_vs_reduced_fat_milk;
  - no KB string says "see Pasteurized, ultra-pasteurized, homogenized";
  - ESSENTIALS is unchanged;
  - no shortcut or tryPool.js line names a folded id.
- C7 [test] Both survivors are lint/readability/repeated-claim clean; rule 4 = 0 on new sentences; OWNED_FACTS = 14.
- C8 `npm test` green; probe 0 wrong; dry-run 181.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "docs/do-lines-review.md", "server/lib/doLines.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic7a.test.js", "server/test/acceptance/k7.test.js"], "dependents": ["server/lib/counterCardLint.test.js", "server/test/healthFirst.test.js", "server/test/ktight.test.js"], "allowed_reads": ["server/lib/counterCards.js:100-175"], "expected": "3 ids retired", "test_name": "C1 folded ids are retired everywhere"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7a.test.js", "server/test/acceptance/k19.test.js", "server/test/acceptance/k20.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost aliases except kefir/alive/still alive", "test_name": "C2 aliases and asked_as moved and Milk is titled"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7a.test.js", "server/lib/perimeter.test.js"], "dependents": ["server/scripts/listMatchProbe.js"], "allowed_reads": [], "expected": "every dairy fold question admits its survivor", "test_name": "C3 folded questions reach the survivor"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7a.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost sources", "test_name": "C4 sources moved"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7a.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 lost sentences; digestion tip absent", "test_name": "C5 tips, watch-outs and labels moved; digestion tip dropped"},
    {"id": "C6", "impl": ["server/lib/counterCardLint.js", "server/kristy_perimeter_kb.json", "server/lib/tryPool.js"], "tests": ["server/test/acceptance/ic7a.test.js", "server/lib/counterDecision.test.js", "server/lib/tryPool.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:1540-1600"], "expected": "owner moved, pointer repointed", "test_name": "C6 processing owner, pointer, essentials and pool"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7a.test.js"], "dependents": [], "allowed_reads": [], "expected": "survivors lint clean", "test_name": "C7 survivors lint clean"}
  ],
  "dependency_evidence": [
    {"source": "planner grep a2_vs_a1_milk|milk_processing|yogurt_live_cultures over server/, 8a30d3d, 2026-10-14", "hits": ["counterCardLint.js:1575-1576 ownedFact('milk_processing', 'milk_processing', ...)", "ktight.test.js:19", "k7.test.js:18-19", "k19.test.js:39,52", "k20.test.js:37,46", "perimeter.test.js:360", "counterDecision.test.js:85", "tryPool.js:15", "tryPool.test.js:40,101", "do-lines-review.md:59,99,100 (primary), 355 (historical)"]},
    {"source": "planner grep over /Users/m1/kristy-ios", "hits": ["LiveCopy.swift:35,39", "CounterUITests.swift:183", "Tools/livedrive/main.swift:194,206,211,217,243", "CounterModels.swift:317 (all a2_vs_a1_milk; not edited here)"]},
    {"source": "KB 9578 goat_sheep_dairy", "hits": ["Homogenized or ultra-pasteurized: see Pasteurized, ultra-pasteurized, homogenized."]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-7a", "network": false}
}
```

## Acceptance server/test/acceptance/ic7a.test.js
```js
// IC-7a: dairy folds, a2_vs_a1_milk and milk_processing → "Milk"; yogurt_live_cultures → yogurt_plain_vs_flavored (docs/ITEM-CARDS-PLAN.md IC-7a). Written by the planner; do not edit.
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
const MILK = 'whole_vs_reduced_fat_milk';
const YOG = 'yogurt_plain_vs_flavored';
const FOLD = { a2_vs_a1_milk: MILK, milk_processing: MILK, yogurt_live_cultures: YOG };
const FOLDED = Object.keys(FOLD);
const SURVIVORS = [MILK, YOG];
const KEEP_OFF = new Set(['kefir', 'alive', 'still alive']);
const DROPPED = ['People who struggle with regular milk often do better on A2.', 'Worth trying for a week.'];
const EXTRA_ASKS = [['what is ultra pasteurized milk', MILK], ['cultured dairy', YOG], ['a2 milk', MILK]];
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

test('C2 aliases and asked_as moved and Milk is titled', () => {
  for (const id of FOLDED) {
    const to = now(FOLD[id]);
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 5)) {
      if (KEEP_OFF.has(a) && id === 'yogurt_live_cultures') continue;
      assert.ok(to.aliases.includes(a), `${id} alias "${a}" not on ${to.id}`);
    }
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(to.asked_as.includes(q), `${id} ask "${q}" not on ${to.id}`);
  }
  for (const a of KEEP_OFF) assert.ok(!now(YOG).aliases.includes(a) || pre(YOG).aliases.includes(a), `${YOG} took withheld alias "${a}"`);
  assert.equal(now(MILK).title, 'Milk');
  assert.equal(kb.entries.filter((e) => e.kind !== 'pick' && e.title === 'Milk').length, 1, 'non-pick "Milk" count');
});

test('C3 folded questions reach the survivor', () => {
  const asks = [...FOLDED.flatMap((id) => pre(id).asked_as.map((q) => [q, FOLD[id]])), ...EXTRA_ASKS];
  for (const [q, want] of nonEmpty(asks, 'asks', 12)) {
    assert.ok(inScope(q).ok, `"${q}" out of scope`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, want, `"${q}" → ${top.entry.id}`);
  }
});

test('C4 sources moved', () => {
  for (const id of FOLDED) {
    const have = new Set(now(FOLD[id]).sources.map((s) => JSON.stringify(s)));
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 1)) assert.ok(have.has(JSON.stringify(s)), `${id} source lost: ${JSON.stringify(s)}`);
  }
  const milk = JSON.stringify(now(MILK).sources);
  assert.ok(milk.includes('https://extension.umn.edu/agriculture/animals-and-livestock/dairy/a2-milk-and-a2-genetics'), 'umn A2 source lost');
  assert.ok(milk.includes('https://www.canr.msu.edu/news/they_did_what_to_your_milk'), 'msu processing source lost');
});

test('C5 tips, watch-outs and labels moved; digestion tip dropped', () => {
  const drop = new Set(DROPPED.map(norm));
  for (const id of FOLDED) {
    const to = FOLD[id];
    const body = norm(strings(now(to)).join('\n'));
    for (const f of ['buying_tips', 'watch_out']) {
      for (const s of nonEmpty([].concat(pre(id)[f] ?? []).flatMap(sentences), `${id} ${f}`, 2)) {
        if (drop.has(s) || POINTER.test(s) || ownedElsewhere(s, to)) continue;
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
  const all = norm(JSON.stringify(kb));
  for (const s of DROPPED) assert.ok(!all.includes(norm(s)), `dropped sentence still in KB: ${s}`);
  const milk = norm(strings(now(MILK)).join('\n'));
  for (const re of [/ultra[- ]pasteuri[sz]ed/i, /homogeni[sz]ed/i, /\bA2\b/]) assert.match(milk, re);
  assert.match(norm(strings(now(YOG)).join('\n')), /live and active cultures/i);
});

test('C6 processing owner, pointer, essentials and pool', () => {
  const row = OWNED_FACTS.find((r) => r.fact === 'milk_processing');
  assert.ok(row, 'milk_processing OWNED_FACTS row missing');
  assert.equal(row.owner, MILK);
  const all = JSON.stringify(kb);
  assert.ok(!all.includes('see Pasteurized, ultra-pasteurized, homogenized'), 'stale processing pointer');
  assert.ok(!all.includes('see A2 vs. A1 milk') && !all.includes('see Live cultures, kefir and skyr'), 'stale folded pointer');
  assert.ok(all.includes('Homogenized or ultra-pasteurized: see Milk.'), 'goat_sheep_dairy pointer not repointed');
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `essential ${id} missing`);
  const sections = nonEmpty(PERIMETER_SECTIONS, 'sections', 6);
  for (const { id } of nonEmpty(sections.flatMap((s) => s.shortcuts ?? []), 'shortcuts', 12)) {
    assert.ok(!FOLDED.includes(id), `shortcut names folded ${id}`);
    assert.ok(now(id), `shortcut names missing ${id}`);
  }
  const pool = execFileSync('git', ['ls-files'], { cwd: ROOT }).toString().split('\n').filter((f) => /server\/.*tryPool\.js$/.test(f));
  for (const f of nonEmpty(pool, 'tryPool.js', 1)) for (const id of FOLDED) assert.ok(!readFileSync(join(ROOT, f), 'utf8').includes(`'${id}'`), `${f} still names ${id}`);
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

## ANCHOR server/kristy_perimeter_kb.json:1156
At 8a30d3d; relocate by `grep -n '"id": "whole_vs_reduced_fat_milk"\|"id": "a2_vs_a1_milk"\|"id": "milk_processing"\|"id": "yogurt_plain_vs_flavored"\|"id": "yogurt_live_cultures"'`.
```
    {
      "id": "whole_vs_reduced_fat_milk",
      "title": "Whole vs. reduced-fat milk",
```

## ANCHOR server/kristy_perimeter_kb.json:1214
```
    {
      "id": "a2_vs_a1_milk",
      "title": "A2 vs. A1 milk",
```

## ANCHOR server/kristy_perimeter_kb.json:3862
```
    {
      "id": "milk_processing",
      "title": "Pasteurized, ultra-pasteurized, homogenized",
```

## ANCHOR server/kristy_perimeter_kb.json:3931
```
    {
      "id": "yogurt_live_cultures",
      "title": "Live cultures, kefir and skyr",
```

## ANCHOR server/kristy_perimeter_kb.json:9578
```
Homogenized or ultra-pasteurized: see Pasteurized, ultra-pasteurized, homogenized.
```

## ANCHOR server/lib/counterCardLint.js:1575
Lines shift after ic-4a/5a; relocate by `grep -n "ownedFact('milk_processing'"`.
```
  ownedFact('milk_processing', 'milk_processing', ['plain_kefir', 'cream_cheese', 'goat_sheep_dairy', 'grassfed_butter', 'ghee'], /ultra[- ]pasteuri[sz]ed|homogeni[sz]ed/i),
```

## ANCHOR server/test/ktight.test.js:19
```
  B08: ['grassfed_butter', 'whole_vs_reduced_fat_milk', 'a2_vs_a1_milk', 'milk_processing', 'raw_milk', 'raw_kefir', 'raw_aged_cheese', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'yogurt_live_cultures', 'plain_kefir', 'cream_vs_creamer'],
```

## ANCHOR server/test/acceptance/k7.test.js:18
```
  'grassfed_butter', 'whole_vs_reduced_fat_milk', 'a2_vs_a1_milk', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'raw_milk',
  'milk_processing', 'yogurt_live_cultures', 'cream_vs_creamer', 'raw_kefir', 'raw_aged_cheese', 'oat_milk',
```

## ANCHOR server/test/acceptance/k19.test.js:39
```
  ['butter', 'grassfed_butter'], ['cheese', 'cheese_real_vs_processed'], ['raw dairy', 'raw_milk'], ['cultured dairy', 'yogurt_live_cultures'], ['non dairy creamer', 'cream_vs_creamer'],
```
k19 :52 OWNERS: 17 ids, including the three folded ones. Read it whole.

## ANCHOR server/test/acceptance/k20.test.js:46
```
const OWNERS = nonEmpty(['yogurt_live_cultures', 'raw_kefir', 'plain_kefir', 'raw_aged_cheese', 'sourdough', 'soy_milk', 'sour_cream', 'dairy_case'], 'fermented ask owners', 8);
```
k20 :37 `  ['cultured dairy', 'yogurt_live_cultures'], ['pickled ginger', null], ['soy milk', 'soy_milk'], ['soymilk', 'soy_milk'],`.

## ANCHOR server/lib/perimeter.test.js:360
```
    ['what is ultra pasteurized milk', 'milk_processing'],
```

## ANCHOR server/lib/counterDecision.test.js:85
```
  for (const id of ['salmon_wild_vs_farmed', 'beef_grassfed_vs_grainfed', 'milk_processing']) {
```

## ANCHOR server/lib/tryPool.js:15
```
  'yogurt_live_cultures',
```
tryPool.test.js :40 `    'canned_fish_choosing', 'farmed_fish_by_species', 'yogurt_live_cultures',`, :101 `  const excluded = new Set(['a2_vs_a1_milk', 'raw_milk', 'raw_kefir', 'raw_aged_cheese', 'sprouts_raw']);`.

## ANCHOR docs/do-lines-review.md:59
```
| `a2_vs_a1_milk` | eggs_dairy | A2 milk, and the difference is the breed, not the brand. | Read the carton for a Jersey or Guernsey herd, or the A2 seal. | — |
```
:99 `` | `milk_processing` | eggs_dairy | Plain pasteurized. ... `` and :100 `` | `yogurt_live_cultures` | eggs_dairy | Buy it alive. ... ``.

## Prerequisites
- **Env:** node ≥20, git, grep, and /Users/m1/kristy-ios for the verify grep. No network, no Supabase writes.
- ic-6b is committed.

## Answers
- **First commands:** the `git ls-files` path check, then `grep -n '"id": "' server/kristy_perimeter_kb.json`. Suite ~1-3 min. Do not edit k14 C12.
- **passRule.**
  - Both survivors are ITEM_CARD_REWRITE, so aliases/asked_as/sources/labels may grow and watch_out only grows.
  - The whole_vs label numbers (2, 1) survive. evidence_tier is byte-identical.
- **Brands.** The A2 seal is a label, not a brand. No brand names go into moved text.
- **The A2 ladder tip.** It moves verbatim. It is not the front; 7b sets the front per Devon's ruling.
- **Withheld aliases.** `kefir`/`alive`/`still alive` stay off yogurt_plain. If removing them strands a k20 ask, STOP BLOCKED and name it.
- **iOS.** The verify grep lists the kristy-ios a2 hits; report them, do not edit them.
- **Run limits.**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not touch git.
  - Never delete an assertion without a replacement (the counterDecision fallback is the one sanctioned removal).
- **Report.** ≤30 lines:
  - READY/NOT READY;
  - npm count;
  - the counterDecision and tryPool outcomes;
  - the dropped list;
  - pointer sites (count);
  - a claim-trace table.
- Card commits end "Not migrated."

## Tried and rejected
- **Keeping a2_vs_a1_milk as its own card:** A2 is a breed rung on the milk ladder, and one card per item rules. The cost is the iOS refs, flagged for Devon.
- **Moving the A2 digestion tip:** it is a bodily-effect claim (non-negotiable 3).
- **Folding yogurt into plain_kefir:** kefir is its own item.
