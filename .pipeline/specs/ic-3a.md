# ic-3a — Produce folds: origin card into the ripeness hub, strawberry residue card into "Berries"

```json
{
  "id": "ic-3a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/lib/counterCards.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/sectionRules.json",
    "server/test/acceptance/k5.test.js",
    "server/test/acceptance/k14.test.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/lib/counterCardLint.test.js",
    "server/lib/counterReach.test.js",
    "server/lib/counterAsk.test.js",
    "server/lib/perimeter.test.js",
    "server/lib/listAliasReach.test.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/kristy_perimeter_kb.json:2217-2281",
    "server/kristy_perimeter_kb.json:3560-3662",
    "server/kristy_perimeter_kb.json:3662-3720",
    "server/kristy_perimeter_kb.json:5337-5413",
    "server/lib/counterCards.js:86-150",
    "server/test/acceptance/passRule.js",
    "server/test/acceptance/k5.test.js",
    "server/test/acceptance/k9.test.js:35-40",
    "server/test/acceptance/k14.test.js:118-127",
    "server/test/ktight.test.js:11-55",
    "server/lib/counterReach.test.js:120-177",
    "server/lib/perimeter.test.js:282-326",
    "server/lib/perimeter.test.js:415-426"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic3a.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run; grep -rn -E 'produce_picking_ripeness|strawberries_organic_residue' /Users/m1/kristy/server /Users/m1/kristy-ios --include=*.js --include=*.json --include=*.swift --include=*.md | grep -v -E 'test|fixtures|counterCards.js'",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-1 is committed. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe (every IC-3..IC-8 piece edits the KB and the count pins; strictly sequential).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-3a, D3 (same-subject folds only), claim-lock rules 1-5.

## Alignment block (plan verbatim, check 1 amended)
- **Done means:** Given the migration dry-run, then the card count drops by exactly 2 (197 → 195 authored cards; the dry-run does not list deletes, so the acceptance test asserts RETIRED membership and KB absence instead). `grep -rn` over server/, the prompts and kristy-ios source shows 0 hits per folded id outside RETIRED and tests. Every asked_as of every folded id appears in counterReach (via ic3a C3) and lands on its survivor. The survivor's back carries each unique fact of the folded card with its source, or the report names the fact as dropped (no trace). REPEATED_CLAIM = 0. Probe 0 wrong.
- **Out of scope:** any decision/front rewrite (IC-3b); produce_bananas (IC-3b); the organic hub's banana aliases (IC-3b); docs/coverage/universe.json (main, after IC-7a); client/src (frozen).
- **OK rough edges:** an audited card left unchanged because it passes; a dropped fact named in the report.
- **Ship bar:** an untraced claim; an ESSENTIALS id retired or reordered; a shortcut or perimeterId pointing at a deleted id; any claim-lock rule 4 grep hit; an existing safety or freshness sentence deleted.
- **Independent check:** S6 ref count before (the verify grep at HEAD: sectionRules.json:2, doLines.json:147/182, docs/do-lines-review.md:76/98, plus the tests listed in owns) = moved + deleted after. Report both lists.

## Change
1. **KB fold `produce_picking_ripeness` (2218-2279) → `produce_ripeness_by_item` (3561).** Append to the survivor, deduped by JSON value: every alias, every asked_as, every source (as-is, same shape), every labels_decoded item (it carries "Product of ___" and "Hass"). Its unique facts (origin tells season, not grade; Hass is a variety grown in several countries; PLU 4 digits starting 3 or 4 = conventional, 5 digits starting 9 = organic; a "pesticide-free" sign has no standard behind it) land on the survivor's labels_decoded (one item per sticker/sign term: e.g. `{ "term": "PLU sticker code", "meaning": ... }`, `{ "term": "Pesticide-free (store sign)", ... }`) using the folded card's own sentences, rephrased only (claim-lock rule 1). Then delete the folded entry. Survivor title stays "How to pick it, item by item".
2. **KB fold `strawberries_organic_residue` (5338-5411) → `berries_picking` (3663), retitled `"Berries"`.** Move all 18 aliases (driscoll variants included) and the 4 asked_as. Move sources: the Mamavation screen string, the Mamavation URL string, "USDA National Organic Program, 7 CFR Part 205". Move pick_steps (the 3 seal steps) and labels_decoded ("USDA Organic", "Non-detect"). Move watch_out[0] (the one-screen caveat), watch_out[2] ("Certified organic restricts synthetic pesticides. It is not a promise of a blank screen on every box.") and the 500-pesticide line, appended after the survivor's existing watch_out items. `instead` is FROZEN on berries_picking: carry "frozen organic strawberries, same seal and same rules" as one buying_tips line instead. **Drop (non-negotiable 9, name each in the report):** sources "Proposed consumer class actions, U.S. District Court for the Northern District of California, filed June and July 2026" and "Harada v. Driscoll’s, Ventura County Superior Court, filed June 2026"; watch_out[1] (the lawsuits); every lawsuit sentence of `detail`. Any moved sentence that names Driscoll's is rephrased to "one screen of store strawberries" (the brand stays only in aliases, asked_as and the source URL). Delete the folded entry.
3. `server/lib/counterCards.js` RETIRED: after `'baking_soda_powder',` (:147) append a block in the chf-5 style:
   `/* ── The 2026-10-14 item-card folds (IC-3a). docs/ITEM-CARDS-PLAN.md D3: one card per item. ── */` then `// → produce_ripeness_by_item. Origin and sticker decoding are how-to-pick facts; aliases, asks, sources and labels moved.` `'produce_picking_ripeness',` and `// → berries_picking, retitled "Berries". Residue screen, seal steps and labels moved; lawsuit material dropped (non-negotiable 9).` `'strawberries_organic_residue',`.
4. `docs/do-lines-review.md`: delete row :76 (`produce_picking_ripeness`) and row :98 (`strawberries_organic_residue`). Then `node scripts/buildDoLines.js` from `server/` regenerates `server/lib/doLines.json` (never hand-edit it).
5. `server/lib/sectionRules.json:2` `"sources": ["produce_picking_ripeness"]` → `"sources": ["produce_ripeness_by_item"]` (rule and checks text unchanged; the survivor now carries both checks).
6. Count pins 197 → 195: `server/test/ktight.test.js:37` and `:40` floors; `server/test/healthFirst.test.js:19` floor; `server/lib/counterCardLint.test.js:432` `assert.equal(CARDS.length, 195)` plus a history comment line `// IC-3a folds 2: produce_picking_ripeness, strawberries_organic_residue (2026-10-14).` after :431.
7. `server/test/ktight.test.js:17` remove the two ids from B06; `:32` SIZES `B06: 12` → `B06: 10`.
8. `server/test/acceptance/k5.test.js:19-22` remove the two ids from SLICE, min `17` → `15`; import `RETIRED` from counterCards.js; append a test mirroring `k9.test.js:35-40` named `'K5: IC-3a retired ids are in RETIRED and gone from the KB'` for the two ids.
9. `server/test/acceptance/k14.test.js:118-127` C10: for `produce_ripeness_by_item`, `deepEqual` → keepsAll (every fixture alias and asked_as is still on the KB entry: `for (const a of was.aliases) assert.ok(byId(id).aliases.includes(a), ...)`, same for asked_as). `produce_seasonality` keeps the deepEqual. Test name unchanged apart from appending `(ripeness hub may gain, IC-3a)`. C11 untouched; the fixture file is never edited.
10. `server/lib/counterReach.test.js`: :150 and :153 `'strawberries_organic_residue'` → `'berries_picking'`, messages "should reach the berries card"; rewrite the block comment :120-144 to record that the 2026-10-14 fold (IC-3a) put residue and freshness on one card, so the boundary is now one card and the "fresh strawberries" tie is gone. The other two tests in the block are unchanged.
11. `server/lib/counterAsk.test.js:33` `'produce_picking_ripeness'` → `'produce_ripeness_by_item'`; :28-31 comment → origin folded into the by-item hub (IC-3a).
12. `server/lib/perimeter.test.js:283` find `'produce_ripeness_by_item'` (message "the produce-picking hub must exist"); every assertion of the test stays (variety, season, no origin ranking, a physical check, the stem tip, the four aliases); update the comments to record the fold. `:418` `'produce_picking_ripeness'` → `'produce_ripeness_by_item'`.
13. `server/lib/listAliasReach.test.js:56-57` → `'berries_picking'`; comment :18-21 → the fold put the bare noun and freshness on one card.

## Criteria
- C1 [test] Given the KB, Then neither folded id is an entry, both are in RETIRED, neither is a doLines.json key nor a do-lines-review.md row.
- C2 [test] Given the pre-fold KB at 663ca3d, Then every alias and asked_as of each folded id is on its survivor.
- C3 [test] Given each pre-fold asked_as of a folded id, When scored by `scoreEntries(q, 3)` behind `inScope`, Then the top entry is its survivor and is admitted (score ≥ 2, aliasScore > 0).
- C4 [test] Every pre-fold source of each folded id is on its survivor (by JSON value), except the two lawsuit sources.
- C5 [test] produce_ripeness_by_item's spoken fields name variety, season and the 9-prefix sticker code; its labels_decoded terms include every folded labels_decoded term. berries_picking's labels_decoded terms include "USDA Organic" and "Non-detect"; its title is "Berries"; its JSON has no class action / Harada / lawsuit text; its spoken fields do not name Driscoll.
- C6 [test] ESSENTIALS is unchanged (8 ids, same order) and every id exists; every sectionRules source id exists in the KB.
- C7 [test] Both survivors: `lintCard(projectEntry(e, {doLine: doLines[id]}))` is `[]`, `readability(e)` is `[]`, `lintRepeatedClaim(e)` is `[]`, and claim-lock rule 4 over their prose fields finds 0.
- C8 `npm test` green except k14 C12 (k5 edit; main re-anchors after commit). Probe 0 wrong. Dry-run reports 195 cards.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCards.js", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic3a.test.js", "server/test/acceptance/k5.test.js"], "dependents": ["server/scripts/migrateCounterCards.js", "server/test/ktight.test.js"], "allowed_reads": ["server/lib/counterCards.js:86-150"], "expected": "2 ids retired and absent", "test_name": "C1 folded ids retired"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3a.test.js"], "dependents": ["server/lib/listAliasReach.test.js", "server/lib/counterReach.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json:2217-2281", "server/kristy_perimeter_kb.json:5337-5413"], "expected": "0 aliases or asks lost", "test_name": "C2 aliases and asks moved"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3a.test.js", "server/lib/counterReach.test.js"], "dependents": ["server/lib/counterAsk.test.js"], "allowed_reads": ["server/lib/counterReach.test.js:40-46"], "expected": "every folded ask lands on its survivor", "test_name": "C3 folded asks land on the survivor"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3a.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "sources moved, 2 lawsuit sources dropped", "test_name": "C4 sources moved"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3a.test.js", "server/lib/perimeter.test.js"], "dependents": ["server/lib/sectionRules.json"], "allowed_reads": ["server/lib/perimeter.test.js:282-326"], "expected": "unique facts on survivors, no brand-negative text", "test_name": "C5 unique facts on the survivors"},
    {"id": "C6", "impl": ["server/lib/sectionRules.json"], "tests": ["server/test/acceptance/ic3a.test.js", "server/lib/sectionRulesContent.test.js"], "dependents": [], "allowed_reads": ["server/lib/sectionRules.json"], "expected": "essentials intact, rule sources resolve", "test_name": "C6 essentials and section rules intact"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3a.test.js", "server/test/acceptance/k5.test.js", "server/test/acceptance/k14.test.js"], "dependents": ["server/test/healthFirst.test.js"], "allowed_reads": ["server/lib/counterCardLint.js"], "expected": "survivors lint, readability, repeated-claim and rule-4 clean", "test_name": "C7 survivors lint clean"}
  ],
  "dependency_evidence": [
    {"source": "grep produce_picking_ripeness|strawberries_organic_residue over server/ (planner, 2026-10-14)", "hits": ["ktight.test.js:17", "counterReach.test.js:125,150,153", "sectionRules.json:2", "counterAsk.test.js:33", "k5.test.js:19-20", "perimeter.test.js:283,418", "counterCardLint.test.js:411 (history comment, kept)", "listAliasReach.test.js:19,56,57", "doLines.json:147,182", "listMatch.test.js:208 (history comment, kept)", "fixtures/kb-pre-readability.json (never edited)"]},
    {"source": "count pins grep \\b197\\b", "hits": ["ktight.test.js:37,40", "healthFirst.test.js:19", "counterCardLint.test.js:432"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-3a", "network": false}
}
```

## Acceptance server/test/acceptance/ic3a.test.js
```js
// IC-3a: produce folds (docs/ITEM-CARDS-PLAN.md IC-3a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { RETIRED, ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };
import sectionRules from '../../lib/sectionRules.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const FOLDS = { produce_picking_ripeness: 'produce_ripeness_by_item', strawberries_organic_residue: 'berries_picking' };
const DROPPED_SOURCE = (s) => /class action|Harada/i.test(JSON.stringify(s));
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');

test('C1 folded ids retired', () => {
  for (const id of Object.keys(FOLDS)) {
    assert.ok(pre(id), `${id} missing from the pre-fold KB`);
    assert.ok(!now(id), `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still in doLines.json`);
    assert.ok(!review.includes(`\`${id}\``), `${id} still a do-lines-review row`);
  }
});

test('C2 aliases and asks moved', () => {
  for (const [id, to] of Object.entries(FOLDS)) {
    const s = now(to);
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(s.aliases.includes(a), `${id} alias "${a}" not on ${to}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(s.asked_as.includes(q), `${id} ask "${q}" not on ${to}`);
  }
});

test('C3 folded asks land on the survivor', () => {
  for (const [id, to] of Object.entries(FOLDS)) {
    for (const q of pre(id).asked_as) {
      assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
      const top = scoreEntries(q, 3)[0];
      assert.ok(admits(top), `"${q}" not admitted`);
      assert.equal(top.entry.id, to, `"${q}" -> ${top.entry.id}`);
    }
  }
});

test('C4 sources moved', () => {
  for (const [id, to] of Object.entries(FOLDS)) {
    const have = new Set((now(to).sources || []).map((s) => JSON.stringify(s)));
    for (const s of pre(id).sources || []) {
      if (DROPPED_SOURCE(s)) assert.ok(!have.has(JSON.stringify(s)), `dropped source kept on ${to}`);
      else assert.ok(have.has(JSON.stringify(s)), `${id} source ${JSON.stringify(s)} not on ${to}`);
    }
  }
});

test('C5 unique facts on the survivors', () => {
  const r = now('produce_ripeness_by_item');
  const rt = spoken(r);
  assert.match(rt, /variety/i);
  assert.match(rt, /season/i);
  assert.match(rt, /\b9\b/);
  const rTerms = (r.labels_decoded || []).map((l) => l.term);
  for (const l of pre('produce_picking_ripeness').labels_decoded || []) assert.ok(rTerms.includes(l.term), `label "${l.term}" not moved`);
  const b = now('berries_picking');
  assert.equal(b.title, 'Berries');
  const bTerms = (b.labels_decoded || []).map((l) => l.term);
  for (const t of ['USDA Organic', 'Non-detect']) assert.ok(bTerms.includes(t), `label "${t}" not moved`);
  assert.doesNotMatch(JSON.stringify(b), /class action|Harada|lawsuit/i);
  assert.doesNotMatch(spoken(b), /driscoll/i);
});

test('C6 essentials and section rules intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `${id} missing`);
  for (const rule of nonEmpty(sectionRules, 'section rules', 6)) for (const id of rule.sources) assert.ok(now(id), `section rule source ${id} missing`);
  assert.deepEqual(sectionRules.find((r) => r.section === 'produce').sources, ['produce_ripeness_by_item']);
});

test('C7 survivors lint clean', () => {
  for (const id of Object.values(FOLDS)) {
    const e = now(id);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], id);
    assert.deepEqual(readability(e), [], id);
    assert.deepEqual(lintRepeatedClaim(e), [], id);
    assert.doesNotMatch(spoken(e), RULE4, `${id} trips claim-lock rule 4`);
  }
});
```

## ANCHOR server/kristy_perimeter_kb.json:2217
```
    {
      "id": "produce_picking_ripeness",
      "title": "Does the origin sticker matter?",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:3662
```
    {
      "id": "berries_picking",
      "title": "Picking berries",
      "aliases": [
```

## ANCHOR server/kristy_perimeter_kb.json:5337
```
    {
      "id": "strawberries_organic_residue",
      "title": "Strawberries and pesticide residue",
      "aliases": [
```

## ANCHOR server/lib/counterCards.js:144
```
  // No absorber. A home technique (salting meat ahead), not a thing to buy; aliases dropped.
  'dry_brine',
  // No absorber. A baking chemistry card with no closest-to-nature pick; aliases dropped.
  'baking_soda_powder',
];
```

## ANCHOR docs/do-lines-review.md:96
```
| `produce_ripeness_by_item` | produce | Pick up two and take the heavier one. | Smell the stem end on anything that ripens after picking. | — |
| `berries_picking` | produce | The carton’s underside decides, not the berries on top. | Flip the container and check for juice stains or fuzz. | — |
| `strawberries_organic_residue` | produce | Buy strawberries organic. The skin is the food here. | Check the clamshell for the USDA Organic seal before it goes in. | — |
```

## ANCHOR server/lib/sectionRules.json:1
```
[
  {"section": "produce", "rule": "Judge the piece itself, not the sticker.", "checks": ["Country on the sticker tells season, not grade.", "Sticker code: five digits starting 9 is organic."], "sources": ["produce_picking_ripeness"]},
  {"section": "meat", "rule": "Judge by seal and smell, not color alone.", "checks": ["Take a sealed package that is not leaking.", "Pass on any pack with an off smell."], "sources": ["judging_meat_at_the_case"]},
```

## ANCHOR server/test/ktight.test.js:37
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
```
  // chf-5 retires 5: duck_meat, dry_brine, bean_soak_salt, pretzel_bread, baking_soda_powder (2026-10-13).
  assert.equal(CARDS.length, 197);
  const failures = [];
```

## ANCHOR server/test/acceptance/k5.test.js:17
```
const SLICE = nonEmpty([
  'organic_worth_it_by_type', 'frozen_vs_fresh_produce', 'freezing_produce', 'produce_seasonality', 'washing_produce',
  'baking_soda_soak', 'precut_produce_tradeoffs', 'produce_picking_ripeness', 'produce_ripeness_by_item', 'berries_picking',
  'produce_storage', 'revive_greens', 'sprouts_raw', 'strawberries_organic_residue', 'produce_root_vegetables',
  'produce_brassicas', 'produce_onions_garlic',
], 'the K5 slice', 17);
```

## ANCHOR server/test/acceptance/k14.test.js:118
```
test('C10 passRule fixture carries the coverage alias moves for exactly the two edited ids', () => {
  for (const id of ['produce_seasonality', 'produce_ripeness_by_item']) {
    const was = preById(id);
    assert.ok(was, `${id} missing from fixture`);
    assert.deepEqual(was.aliases, byId(id).aliases, `${id} aliases`);
    assert.deepEqual(was.asked_as, byId(id).asked_as, `${id} asked_as`);
```

## ANCHOR server/lib/counterReach.test.js:148
```
test('a bare strawberry row asks which box to buy, not whether it is fresh', () => {
  for (const q of ['strawberries', 'strawberry', '1 lb strawberries', 'organic strawberries']) {
    assert.equal(boundary(q), 'strawberries_organic_residue', `"${q}" should reach the residue card`);
  }
```

## ANCHOR server/lib/counterAsk.test.js:31
```
    // card, which answers a question nobody asked here.
    ['how do I pick a ripe avocado', 'produce_ripeness_by_item'],
    ['where was this grown', 'produce_picking_ripeness'],
  ];
```

## ANCHOR server/lib/perimeter.test.js:282
```
test('produce guidance teaches picking SKILL, never an origin ranking', () => {
  const p = perimeterKb.entries.find((e) => e.id === 'produce_picking_ripeness');
  assert.ok(p, 'the produce-picking entry must exist');
```

## ANCHOR server/lib/perimeter.test.js:417
```
  const ids = [
    'label_pasture_raised_feed', 'label_organic_scope', 'produce_picking_ripeness',
    'label_multigrain_vs_whole_grain', 'label_lightly_sweetened', 'label_no_artificial_flavors',
  ];
```

## ANCHOR server/lib/listAliasReach.test.js:55
```
    ['citrus', 'produce_citrus'],
    ['strawberries', 'strawberries_organic_residue'],
    ['strawberry', 'strawberries_organic_residue'],
  ],
```

## Prerequisites
Env: node ≥20, git on PATH (the acceptance test runs `git show 663ca3d:...`), grep, `/Users/m1/kristy-ios` checked out for the verify grep. No network, no Supabase writes (dry-run only, reads `server/.env` if present; a credentials error on dry-run is reported, not fixed).
ic-1 committed first (ITEM_CARD_REWRITE relaxes passRule for both survivors; without it k5 fails on gained aliases).

## Answers
- Suite ~1-3 min. Expected: all green except k14 C12 (k5 diff vs e92e7c9). Do not edit C12.
- k5 runs `assertPassRule(fixture, now)` on both survivors: ITEM_CARD_REWRITE lets aliases/asked_as/sources/labels_decoded/cart_pick grow, never shrink. `instead`, `evidence_tier`, `category`, `id` stay byte-identical. watch_out may only grow. Every number in the survivor's old rewritable text must survive.
- `readability()` caps: short_answer ≤ 40 words, any sentence ≤ 20 words. Put moved facts in labels_decoded / watch_out / buying_tips, not short_answer.
- produce_ripeness_by_item must keep "avocado", "how to pick an avocado", "cantaloupe", "pineapple" aliases and a stem buying_tip (perimeter.test.js:309-323).
- perimeter.test.js:416 FORBIDDEN words (cure, heal, treat, prevent, reverse, detox, immunity, disease, diagnos, remedy) must not appear anywhere in produce_ripeness_by_item after the merge.
- If a moved ask lands elsewhere, add ONE longer specific alias to the survivor (hub-steal rule); never a short generic. Report it.
- A moved fact with no surviving sentence and no source is dropped and named in the report; never invent a replacement.
- Hard cap 60 min. Stop BLOCKED after 3 identical failures. Do not commit, stash or touch git. Never delete an assertion without a replacement. Leave `fixtures/kb-pre-readability.json` alone. Report ≤30 lines: READY / NOT READY, the new `npm test` count, the dropped-fact list, the claim-trace table (one row per moved or rephrased sentence: sentence → source on the card or archive file:line).
- Card commits end "Not migrated." (main commits).

## Tried and rejected
- Moving the lawsuit material: names a brand negatively (non-negotiable 9) and is not a buying fact.
- Keeping strawberries as a separate residue card: D3 one card per item; berries_picking already owns freshness for the same carton.
- Editing kb-pre-readability.json so k14 C10 stays deepEqual: C11 forbids fixture edits; a subset check states the real invariant (nothing lost).
- Splitting 3a by fold: each half still edits every count pin and ktight; the suite would be red between halves.
