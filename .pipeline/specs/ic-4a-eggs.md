# ic-4a-eggs — Egg folds: shell color, freshness, grades, feed claims and storage into egg_labels

```json
{
  "id": "ic-4a-eggs",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/lib/counterCards.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js",
    "server/lib/perimeter.js",
    "server/lib/perimeter.test.js",
    "server/test/acceptance/k8.test.js",
    "server/test/acceptance/k14.test.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/lib/counterCardLint.test.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/kristy_perimeter_kb.json:515-595",
    "server/kristy_perimeter_kb.json:2468-2814",
    "server/lib/counterCards.js:86-170",
    "server/lib/counterCardLint.js:1536-1575",
    "server/lib/perimeter.js:347-359",
    "server/lib/counterPath.test.js:17-63",
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/k8.test.js",
    "server/test/acceptance/k9.test.js:35-40",
    "server/test/acceptance/k14.test.js:40-57",
    "server/test/ktight.test.js:11-40",
    "server/test/healthFirst.test.js",
    "server/lib/perimeter.test.js:346-370",
    "docs/do-lines-review.md:40-90"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic4aeggs.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run; grep -rn -E 'egg_shell_color|egg_freshness|egg_grades_sizes|egg_feed_claims|egg_storage|hen_raising' /Users/m1/kristy/server /Users/m1/kristy-ios --include=*.js --include=*.json --include=*.swift --include=*.md | grep -v -E 'test|fixtures|counterCards.js'",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-3b is committed. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe (every IC-3..IC-8 piece edits the KB and the count pins; strictly sequential).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-4a (eggs half), D3 (same-subject folds only), claim-lock rules 1-5. Oversize: 12 owned files. It cannot split, because every half edits the same count pins and the suite would be red between halves (same as ic-3a with 14).

## Alignment block (plan verbatim; check 1 amended, chicken half split out to ic-4a-chicken)
- **Done means:** Given the migration dry-run, then the card count drops by exactly 5 (196 → 191 authored cards; the dry-run does not list deletes, so the acceptance test asserts RETIRED membership and KB absence). `grep -rn` over server/, the prompts and kristy-ios source shows 0 hits per folded id outside RETIRED and tests. Every asked_as of every folded id lands on egg_labels (ic4aeggs C3). egg_labels' back carries each unique fact of the folded cards with its source, or the report names the fact as dropped (no trace). REPEATED_CLAIM = 0. Probe 0 wrong.
- **Out of scope:** egg_labels title, decision, tier_note or do line (IC-4b retitles it "Eggs" and fixes the two-sentence tier_note); egg_duck_quail (kept); every chicken card (ic-4a-chicken); `docs/coverage/universe.json` (main, after IC-7a); VOICE_SPEC.md and docs/ktight history (historical records, never edited); client/src (frozen).
- **OK rough edges:** egg_labels' back grows long (it is the one egg card now); the folded cards' `decision`, `why`, `kristy_take`, `tier_note`, `question` and `eyebrow_short` are not moved (their facts arrive through the moved sentences); a dropped fact named in the report; a do-lines-review secondary-table row (:354, :377) left as history.
- **Ship bar:** an untraced claim; an ESSENTIALS id retired or reordered; a shortcut or perimeterId pointing at a deleted id; any claim-lock rule 4 grep hit; an existing safety or freshness sentence deleted.
- **Independent check:** the verify grep at HEAD lists every ref (doLines.json:48-53, perimeter.js:355, counterCardLint.js:1560, plus the tests in owns) = moved + deleted after. Report both lists.

## Change
1. **KB folds → `egg_labels` (515).** Fold `egg_shell_color` (2468), `egg_freshness` (2536), `egg_grades_sizes` (2609), `egg_feed_claims` (2683), `egg_storage` (2752), then delete those five entries. Title, decision, why, short_answer, detail, kristy_take, pick_steps, science, tier_note, cart_pick and eyebrow_short of egg_labels stay byte-identical (pick_steps is already at the 3-step cap, science is near the 70-word cap).
   - **aliases, asked_as, sources:** append every one of the five cards', deduped by JSON value (`soy free eggs` / `corn free eggs` are already on egg_labels). 16 asked_as and 17 sources arrive; nothing is dropped.
   - **labels_decoded:** append every folded item, deduped by `term` (egg_feed_claims' "Soy-free / corn-free" is already on egg_labels and stays as is). Add one new item carrying the Araucana fact: `{ "term": "Blue or green shell", "meaning": "A breed trait too, from a different pigment. Still nothing about the feed." }` (from egg_shell_color watch_out[2]).
   - **buying_tips:** append, in this order, verbatim unless marked:
     - "Shell color is the breed. White and brown are the same egg inside." (rephrases egg_shell_color buying_tips[0] + short_answer)
     - "Speckles and small rough patches are normal shell variation." (shell)
     - "Find the three-digit pack date beside the plant code. Closer to today is fresher." (freshness)
     - "Open the carton and check for cracks and leaks before it goes in the cart." (freshness; verbatim, safety)
     - "Float test at home: flat on the bottom is fresh, standing on end is old, floating goes out." (freshness)
     - "A fresh egg fries with a tall yolk and a tight white. A flat, spreading one is old, not unsafe." (freshness)
     - "AA vs A is firmness of the white. Freshness matters more than either." (grades)
     - "Organic requires organic feed, usually organic soy and corn. Not a different kind of feed." (feed)
     - "Keep them in the carton. It slows moisture loss and keeps odors out." (storage)
     - "Unwashed farm eggs can stay on the counter. Once washed, they need the fridge for good." (storage)
   - **watch_out:** append, in this order, verbatim:
     - "The yolk photo on the carton is artwork, not a sample." (shell)
     - "A paler brown shell is not a fresher or older egg. Pigment goes on in the last hours before laying. A stressed hen, an older hen or a hurried lay leaves less of it." (shell)
     - "The sell-by is not the pack date. Two cartons with the same sell-by can have been packed weeks apart. The three-digit code is the one that tells them apart." (freshness)
     - "Four to five weeks past the pack date, refrigerated, is the extension guidance. Count from the three-digit code, not from the sell-by." (freshness)
     - "Eggs age far faster on the counter than in the fridge. A carton left out at the store or at home has spent its window early." (freshness)
     - "A carton may legally hold the next size up, as long as the two sizes are not mixed. A ‘Large’ dozen can be Extra Large. It cannot be smaller." (grades)
     - "‘Omega-3 enriched’ sets no amount. Two enriched cartons can differ a lot and both wear the same words." (feed)
     - "A feed claim says what is in the ration, not where it came from. Feed grown on the farm can be traced. Feed from several unnamed suppliers often cannot, and the carton does not say which." (feed)
     - "A cold egg left out at room temperature can sweat. Moisture on the shell is where bacteria can take hold. Refrigerated eggs should not sit out more than two hours." (storage; safety)
     - "Keep the carton on a middle or lower shelf, not the door. The door swings warm every time it opens." (storage)
     - "Store-bought eggs do not need washing before use. They were already washed and sanitized at the plant." (storage; safety)
     - "US rules require washing and sanitizing, then holding at 45F or below from the plant onward." (storage detail; safety)
   - **Not moved (name each in the report as dropped-with-reason):** egg_feed_claims watch_out[1] (the watchdog "impenetrable" traceability view; the traced half survives in the feed-claim watch_out above); egg_storage buying_tips[3] (leftover whites and yolks, a home kitchen tip with no buying act); the egg_grades_sizes pointer step "How the hen was raised: see Egg labels, and what the hen ate." (the owner is now the card itself). Any further drop must be named; never invent a replacement sentence.
2. `server/lib/counterCards.js` RETIRED: after the last entry of the IC-3a block (`'strawberries_organic_residue',`), append:
   `// → egg_labels (IC-4a). One card per item: shell color, pack date, grade and size, feed words and storage are all on the egg card now; aliases, asks, sources and labels moved.` then `'egg_shell_color',` `'egg_freshness',` `'egg_grades_sizes',` `'egg_feed_claims',` `'egg_storage',`.
3. `docs/do-lines-review.md`: delete primary-table rows :80-84 (the five egg ids). Leave the secondary-table rows :354 (`egg_feed_claims`) and :377 (`egg_shell_color`) as history. Then `node scripts/buildDoLines.js` from `server/` regenerates `server/lib/doLines.json` (never hand-edit it). If buildDoLines or any test rejects a secondary-table row for a missing id, delete that row and report it.
4. `server/lib/counterCardLint.js:1560`: delete the `hen_raising` row. Its only family member (`egg_grades_sizes`) is gone and `healthFirst.test.js:45` requires every family to be non-empty. OWNED_FACTS goes 15 → 14 (the floor at healthFirst.test.js:21 is 13).
5. `server/lib/perimeter.js:355` `{ q: 'Brown or white eggs?', id: 'egg_shell_color' },` → `{ q: 'Is pre-shredded cheese ok?', id: 'cheese_real_vs_processed' },`. Reason: counterPath.test.js:21 requires 3-4 shortcuts per section, :33 requires the target to be browsable in that section, and a second `egg_labels` chip would duplicate the id of :354 (iOS renders shortcuts by id). The eggs_dairy blurb already promises "real cheese from cheese product", and perimeter.test.js:360 pins that ask on that card. If counterPath fails on it (not in eggs_dairy topics, or < 3 buying_tips), use `{ q: 'Which yogurt?', id: 'yogurt_plain_vs_flavored' }` and report it.
6. `server/lib/perimeter.test.js:355-356` → `'egg_labels'` for both rows (questions unchanged).
7. `server/test/acceptance/k14.test.js:52` `['brown eggs', 'egg_shell_color'], ['white eggs', 'egg_shell_color'],` → `'egg_labels'` for both.
8. `server/test/ktight.test.js:15` remove the five ids from B04; `:32` SIZES `B04: 14` → `B04: 9`; `:37` floor → 191; `:40` floor → 190 (each is the ic-3b value minus 5; relocate by grep, ic-3a/3b moved them).
9. `server/test/acceptance/k8.test.js:17-20` remove the five ids from SLICE, min `10` → `5`; import `RETIRED` from counterCards.js; append a test mirroring `k9.test.js:35-40` named `'K8: IC-4a retired ids are in RETIRED and gone from the KB'` for the five ids.
10. Count pins: `server/test/healthFirst.test.js:19` floor → 191; `server/lib/counterCardLint.test.js` `assert.equal(CARDS.length, 196)` → `191`, plus a history comment directly above it: `// IC-4a-eggs folds 5: egg_shell_color, egg_freshness, egg_grades_sizes, egg_feed_claims, egg_storage (2026-10-14).`

## Criteria
- C1 [test] Given the KB, Then none of the five ids is an entry, all five are in RETIRED, none is a doLines.json key or a primary do-lines-review row (`parseReviewTable`), and no OWNED_FACTS row names one as owner or family.
- C2 [test] Given the pre-fold KB at 663ca3d, Then every alias and asked_as of each folded id is on egg_labels.
- C3 [test] Given each pre-fold asked_as of a folded id, When scored by `scoreEntries(q, 3)` behind `inScope`, Then the top entry is egg_labels and is admitted (score ≥ 2, aliasScore > 0).
- C4 [test] Every pre-fold source of each folded id is on egg_labels (by JSON value).
- C5 [test] egg_labels' spoken fields contain the five safety/freshness sentences verbatim and name breed, pack date, sell-by, AA, omega-3, 001, 365, 45, 24, 27 and 30; its labels_decoded terms include every folded term plus "Blue or green shell"; its JSON no longer contains "see Egg labels".
- C6 [test] ESSENTIALS is unchanged (8 ids, same order) and every id exists; no PERIMETER_SECTIONS shortcut names a folded id; eggs_dairy still has 3 shortcuts with 3 distinct ids, each in the KB.
- C7 [test] egg_labels: `lintCard(projectEntry(e, {doLine: doLines.egg_labels}))` is `[]`, `readability(e)` is `[]`, `lintRepeatedClaim(e)` is `[]`, claim-lock rule 4 finds 0; OWNED_FACTS has 14 rows and no `hen_raising`.
- C8 `npm test` green except k14 C12 (k8 edit; main re-anchors after commit). Probe 0 wrong. Dry-run reports 191 cards.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "docs/do-lines-review.md", "server/lib/doLines.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic4aeggs.test.js", "server/test/acceptance/k8.test.js"], "dependents": ["server/scripts/migrateCounterCards.js", "server/test/ktight.test.js", "server/test/healthFirst.test.js"], "allowed_reads": ["server/lib/counterCards.js:86-170"], "expected": "5 ids retired and absent", "test_name": "C1 folded egg ids retired"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4aeggs.test.js"], "dependents": ["server/test/acceptance/k14.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json:2468-2814"], "expected": "0 aliases or asks lost", "test_name": "C2 egg aliases and asks moved"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4aeggs.test.js", "server/lib/perimeter.test.js"], "dependents": ["server/lib/counterReach.test.js"], "allowed_reads": ["server/lib/perimeter.test.js:346-370"], "expected": "every folded ask lands on egg_labels", "test_name": "C3 folded egg asks land on egg_labels"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4aeggs.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "17 sources moved, 0 dropped", "test_name": "C4 egg sources moved"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4aeggs.test.js"], "dependents": [], "allowed_reads": ["server/kristy_perimeter_kb.json:515-595"], "expected": "unique facts and safety sentences on egg_labels", "test_name": "C5 egg facts on egg_labels"},
    {"id": "C6", "impl": ["server/lib/perimeter.js"], "tests": ["server/test/acceptance/ic4aeggs.test.js", "server/lib/counterPath.test.js"], "dependents": ["server/lib/perimeter.test.js"], "allowed_reads": ["server/lib/perimeter.js:347-359", "server/lib/counterPath.test.js:17-63"], "expected": "essentials intact, no shortcut to a folded id, 3 distinct eggs_dairy shortcuts", "test_name": "C6 essentials and shortcuts intact"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic4aeggs.test.js", "server/test/healthFirst.test.js", "server/test/acceptance/k8.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:1536-1575"], "expected": "egg_labels lint, readability, repeated-claim and rule-4 clean; 14 OWNED_FACTS", "test_name": "C7 egg_labels lint clean"}
  ],
  "dependency_evidence": [
    {"source": "grep egg_shell_color|egg_freshness|egg_grades_sizes|egg_feed_claims|egg_storage over the repo (planner, 2026-10-14)", "hits": ["doLines.json:48,49,50,52,53", "perimeter.js:355", "perimeter.test.js:355,356", "counterCardLint.js:1560", "counterCardLint.test.js:109 (history comment, kept)", "ktight.test.js:15", "passRule.js:12 (HEALTH_FIRST_REWRITE, inert after the fold, kept)", "k14.test.js:52", "k8.test.js:19", "do-lines-review.md:80-84,354,377", "docs/coverage/universe.json:766-784 (out of scope)", "VOICE_SPEC.md:254-262 (history)", "fixtures/kb-pre-readability.json (never edited)"]},
    {"source": "shortcut rules", "hits": ["counterPath.test.js:21-22 (3-4 per section)", "counterPath.test.js:33 (target browsable in section)", "counterPath.test.js:72 (>= 18 shortcut ids total)"]},
    {"source": "OWNED_FACTS rules", "hits": ["healthFirst.test.js:21 (>= 13 rows)", "healthFirst.test.js:45 (family non-empty)"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-4a-eggs", "network": false}
}
```

## Acceptance server/test/acceptance/ic4aeggs.test.js
```js
// IC-4a (eggs): five egg cards fold into egg_labels (docs/ITEM-CARDS-PLAN.md IC-4a). Written by the planner; do not edit.
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
const TO = 'egg_labels';
const FOLDED = ['egg_shell_color', 'egg_freshness', 'egg_grades_sizes', 'egg_feed_claims', 'egg_storage'];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded egg ids retired', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from the pre-fold KB`);
    assert.ok(!now(id), `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still in doLines.json`);
    assert.ok(!review.has(id), `${id} still a do-lines-review row`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${r.fact} still names ${id}`);
  }
});

test('C2 egg aliases and asks moved', () => {
  const s = now(TO);
  for (const id of FOLDED) {
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(s.aliases.includes(a), `${id} alias "${a}" not on ${TO}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(s.asked_as.includes(q), `${id} ask "${q}" not on ${TO}`);
  }
});

test('C3 folded egg asks land on egg_labels', () => {
  for (const id of FOLDED) {
    for (const q of pre(id).asked_as) {
      assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
      const top = scoreEntries(q, 3)[0];
      assert.ok(admits(top), `"${q}" not admitted`);
      assert.equal(top.entry.id, TO, `"${q}" -> ${top.entry.id}`);
    }
  }
});

test('C4 egg sources moved', () => {
  const have = new Set((now(TO).sources || []).map((s) => JSON.stringify(s)));
  for (const id of FOLDED) {
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 3)) assert.ok(have.has(JSON.stringify(s)), `${id} source ${JSON.stringify(s)} not on ${TO}`);
  }
});

test('C5 egg facts on egg_labels', () => {
  const e = now(TO);
  const t = spoken(e);
  for (const s of [
    'Refrigerated eggs should not sit out more than two hours.',
    'Store-bought eggs do not need washing before use.',
    'US rules require washing and sanitizing, then holding at 45F or below from the plant onward.',
    'Open the carton and check for cracks and leaks before it goes in the cart.',
    'Eggs age far faster on the counter than in the fridge.',
  ]) assert.ok(t.includes(s), `safety/freshness sentence lost: ${s}`);
  for (const re of [/breed/i, /pack date/i, /sell-by/i, /\bAA\b/, /omega-3/i, /\b001\b/, /\b365\b/, /\b45\b/, /\b24\b/, /\b27\b/, /\b30\b/]) assert.match(t, re);
  const terms = (e.labels_decoded || []).map((l) => l.term);
  for (const id of FOLDED) for (const l of pre(id).labels_decoded || []) assert.ok(terms.includes(l.term), `label "${l.term}" from ${id} not moved`);
  assert.ok(terms.includes('Blue or green shell'), 'Araucana label missing');
  assert.equal(new Set(terms).size, terms.length, 'duplicate labels_decoded term');
  assert.doesNotMatch(JSON.stringify(e), /see Egg labels/);
});

test('C6 essentials and shortcuts intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `${id} missing`);
  for (const s of nonEmpty(PERIMETER_SECTIONS, 'sections', 6)) for (const sc of s.shortcuts || []) {
    assert.ok(!FOLDED.includes(sc.id), `${s.id} shortcut "${sc.q}" points at folded ${sc.id}`);
    assert.ok(now(sc.id), `${s.id} shortcut "${sc.q}" points at missing ${sc.id}`);
  }
  const ed = PERIMETER_SECTIONS.find((s) => s.id === 'eggs_dairy').shortcuts.map((sc) => sc.id);
  assert.equal(ed.length, 3);
  assert.equal(new Set(ed).size, 3, `eggs_dairy shortcut ids repeat: ${ed.join(', ')}`);
});

test('C7 egg_labels lint clean', () => {
  const e = now(TO);
  assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[TO] })), []);
  assert.deepEqual(readability(e), []);
  assert.deepEqual(lintRepeatedClaim(e), []);
  assert.doesNotMatch(spoken(e), RULE4, 'egg_labels trips claim-lock rule 4');
  assert.equal(OWNED_FACTS.length, 14);
  assert.ok(!OWNED_FACTS.some((r) => r.fact === 'hen_raising'), 'hen_raising row still present');
});
```

## ANCHOR server/kristy_perimeter_kb.json:515
```
    {
      "id": "egg_labels",
      "title": "Egg labels, and what the hen ate",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:2468
```
    {
      "id": "egg_shell_color",
      "title": "Egg color — shell and yolk",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:2536
```
    {
      "id": "egg_freshness",
      "title": "How fresh is that carton",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:2609
```
    {
      "id": "egg_grades_sizes",
      "title": "Egg grades and sizes",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:2683
```
    {
      "id": "egg_feed_claims",
      "title": "Vegetarian-fed, omega-3, soy-free",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:2752
```
    {
      "id": "egg_storage",
      "title": "Why US eggs live in the fridge",
      "aliases": [
```

## ANCHOR server/lib/counterCards.js:144
At 663ca3d; after ic-3a the IC-3a block follows these lines. Append after the last RETIRED entry.
```
  // No absorber. A home technique (salting meat ahead), not a thing to buy; aliases dropped.
  'dry_brine',
  // No absorber. A baking chemistry card with no closest-to-nature pick; aliases dropped.
  'baking_soda_powder',
];
```

## ANCHOR docs/do-lines-review.md:80
```
| `egg_shell_color` | eggs_dairy | Buy the cheaper carton. Neither shell nor yolk color reads anything. | Read the feed words printed on the carton. Skip the yolk photo. | — |
| `egg_freshness` | eggs_dairy | Read the three-digit pack date, not the sell-by. | Find the three-digit number beside the plant code. Higher is fresher. | — |
| `egg_grades_sizes` | eggs_dairy | Compare price per ounce. Grade and size say nothing about the hen. | Read the weight per dozen on the carton end: 24, 27, 30 ounces. | — |
| `egg_feed_claims` | eggs_dairy | ‘Vegetarian-fed’ is the one to walk away from. | Check whether the carton claims outdoor access and no animal protein at once. | — |
| `egg_storage` | eggs_dairy · home | Washed eggs live cold, in the carton, on a middle shelf. | Move the eggs off the fridge door. It swings warm every open. | — |
```

## ANCHOR server/lib/counterCardLint.js:1558
```
  ownedFact('chill_water', 'air_chilled_chicken',
    ['chicken_cuts_basics'], /air[- ]chill|water[- ]chill|retained water/i),
  ownedFact('hen_raising', 'egg_labels', ['egg_grades_sizes'], /pasture[- ]raised|free[- ]range|cage[- ]free/i),
  ownedFact('wild_farmed', 'salmon_wild_vs_farmed',
```

## ANCHOR server/lib/perimeter.js:353
```
    shortcuts: [
      { q: 'Which egg carton?', id: 'egg_labels' },
      { q: 'Brown or white eggs?', id: 'egg_shell_color' },
      { q: 'Whole or reduced-fat milk?', id: 'whole_vs_reduced_fat_milk' },
    ],
```

## ANCHOR server/lib/perimeter.test.js:354
```
    ['how do i tell if fish is fresh', 'fish_freshness_at_counter'],
    ['are brown eggs better than white', 'egg_shell_color'],
    ['what does vegetarian fed mean', 'egg_feed_claims'],
    ['how do i pick a ripe melon', 'produce_ripeness_by_item'],
```

## ANCHOR server/test/acceptance/k14.test.js:51
```
  ['duck', null], ['quail', null],
  ['eggs', 'egg_labels'], ['brown eggs', 'egg_shell_color'], ['white eggs', 'egg_shell_color'],
  ['egg', null], ['egg noodles', null], ['egg salad', 'deli_salads'], ['egg white protein powder', null],
```

## ANCHOR server/test/acceptance/k8.test.js:17
```
const SLICE = nonEmpty([
  'rotisserie_chicken', 'air_chilled_chicken', 'no_antibiotics_poultry', 'chicken_cuts_basics', 'egg_labels',
  'egg_shell_color', 'egg_freshness', 'egg_grades_sizes', 'egg_feed_claims', 'egg_storage',
], 'the K8 slice', 10);
```

## ANCHOR server/test/ktight.test.js:14
```
  B03: ['beef_grassfed_vs_grainfed', 'ground_beef_organ_blend', 'beef_cuts_basics', 'ground_beef_lean_ratio', 'beef_grades_usda', 'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'lamb_goat', 'organ_meats', 'bison', 'venison_game', 'meat_case'],
  B04: ['rotisserie_chicken', 'air_chilled_chicken', 'no_antibiotics_poultry', 'chicken_cuts_basics', 'turkey_whole', 'ground_turkey', 'chicken_breast', 'egg_labels', 'egg_shell_color', 'egg_freshness', 'egg_grades_sizes', 'egg_feed_claims', 'egg_storage', 'egg_duck_quail'],
  B05: ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'],
```

## ANCHOR server/test/ktight.test.js:37
At 663ca3d (ic-3a/3b lowered the floors to 196 and 195).
```
const QUESTIONS = nonEmpty(questionEntries(kb.entries), 'question entries', 197);
const byId = new Map(QUESTIONS.map((e) => [e.id, e]));
const PICKS = nonEmpty(kb.entries.filter((e) => e.kind === 'pick'), 'picks');
const ALL_IDS = nonEmpty(Object.values(BATCHES).flat(), 'batched ids', 197);
```

## ANCHOR server/test/healthFirst.test.js:17
```
const cards = nonEmpty(
  kb.entries.filter((e) => e.kind !== 'pick' || inFamily.has(e.id) || HEALTH_FIRST_PENDING.has(e.id)),
  'health-first corpus', 197
);
```

## ANCHOR server/lib/counterCardLint.test.js:431
At 663ca3d; ic-3a/3b added history lines above the assert and set it to 196.
```
  // chf-5 retires 5: duck_meat, dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder (2026-10-13).
  assert.equal(CARDS.length, 197);
  const failures = [];
```

## Prerequisites
Env: node ≥20, git on PATH (the acceptance test runs `git show 663ca3d:...`), grep, `/Users/m1/kristy-ios` checked out for the verify grep. No network, no Supabase writes (dry-run only; a credentials error on dry-run is reported, not fixed).
ic-1 committed (ITEM_CARD_REWRITE holds egg_labels, so k8's pass rule lets its aliases/asked_as/sources/labels_decoded grow). ic-3a and ic-3b committed (KB line numbers shift; relocate entries first).

## Answers
- First allowed read: `grep -n '"id": "' server/kristy_perimeter_kb.json` to relocate the six entries (line numbers above are at 663ca3d).
- Suite ~1-3 min. Expected: all green except k14 C12 (k8 diff vs e92e7c9). Do not edit C12.
- k8 runs `assertPassRule(fixture, now)` on egg_labels: ITEM_CARD_REWRITE lets aliases/asked_as/sources/labels_decoded/cart_pick grow, never shrink. `evidence_tier` (kristys_standard) and `category` stay byte-identical. watch_out may only grow. Every number in egg_labels' old rewritable text (60, 50, 30) must survive.
- `pick_steps` must stay 1-3 strings (counterCardLint.js:1426); egg_labels already has 3. Never move anything into pick_steps or science.
- `readability()` caps: short_answer ≤ 40 words, a sentence ≤ 20 words. Moved sentences go to buying_tips / watch_out / labels_decoded only.
- k14 keeps `['egg', null]`, `['egg noodles', null]`, `['egg salad', 'deli_salads']`, `['egg white protein powder', null]`. If a moved alias (e.g. "egg carton", "egg quality", "fresh eggs") steals one of them, report the row and the alias; do not drop an alias without Devon.
- If a moved ask lands elsewhere, add ONE longer specific alias to egg_labels (hub-steal rule); never a short generic. Report it.
- egg_labels is the owner of the deleted hen_raising fact; repeating pasture-raised/cage-free on egg_labels is the owner speaking, not a repeat.
- A moved fact with no surviving sentence and no source is dropped and named in the report; never invent a replacement.
- Hard cap 60 min. Stop BLOCKED after 3 identical failures. Do not commit, stash or touch git. Never delete an assertion without a replacement. Leave `fixtures/kb-pre-readability.json` alone. Report ≤30 lines: READY / NOT READY, the new `npm test` count, the dropped-fact list, the claim-trace table (one row per moved or rephrased sentence: sentence → source on the card or archive file:line).
- Card commits end "Not migrated." (main commits).

## Tried and rejected
- Keeping egg_storage as a separate home card: D3 one card per item; storage facts are short and the safety sentences survive verbatim on egg_labels.
- Moving facts into pick_steps or science: pick_steps is capped at 3 and science at 70 words; both are full.
- Re-owning hen_raising with an empty family: healthFirst.test.js:45 requires a non-empty family.
- Pointing the second eggs_dairy shortcut at egg_labels: duplicates :354's id on a surface that renders shortcuts by id.
- Splitting eggs from chicken further (one fold per piece): each piece still edits every count pin and ktight; five extra red-suite windows for no gain.
