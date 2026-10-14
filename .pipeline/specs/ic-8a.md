# ic-8a — Rest of store, part 1: grains, bread, fermented and pantry fronts (audit, rewrite on failure)

```json
{
  "id": "ic-8a",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCardLint.js:95-110"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic8a.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`. Run it after ic-7b is committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe.
Plan: `docs/ITEM-CARDS-PLAN.md` IC-8 and claim-lock rules 1-5.

**Batch size flag.** The batch is about 50 ids, which exceeds the plan's ≤30 batch size [PLACEHOLDER]. It stays one piece only because most ids are audit-only (KEPT). Devon may split IC-8 into 4 pieces instead of 2. If he does, 8a splits at the midpoint of the derived BATCH.

## Alignment block
- **Done means:**
  - The BATCH is derived from the KB: every non-pick, non-home entry in KB order, from `sandwich_bread` up to but excluding the first id matching `/^frozen/`.
  - Every BATCH id has:
    - a front of ≤14 words with headlineHedge `[]`;
    - a tier_note that is one sentence of ≥5 words, has no first person, is not the tier name, is unique, and is not pending;
    - lintCard and readability both `[]`;
    - a review headline equal to the decision.
  - olive_oil_grades, bottled_water_buying and tea have left TIER_NOTE_ORPHANED_PENDING.
  - The two-sentence tier_notes are one sentence each: nuts_raw_vs_roasted, honey_adulteration, bulk_bins_buying, olive_oil_grades, nut_butter_ingredients, bottled_water_buying.
  - Rule 4 = 0.
  - No source URL is dropped, and no unarchived URL is added.
  - The count stays 181.
- **Out of scope:**
  - folds, titles, aliases/asked_as;
  - any id outside the derived BATCH;
  - home cards (8b);
  - sources on non-ITEM ids;
  - kristy-ios.
- **OK rough edges:** ids that already pass stay KEPT unchanged, even if their front reads plainer than the plan's ideal.
- **Ship bar:**
  - an untraced claim (rule 1);
  - a new URL not in `docs/sources/item-cards/*.md`;
  - a rule-4 hit;
  - a brand name;
  - a price word;
  - a first-person tier_note;
  - an ESSENTIALS change;
  - a count change;
  - a dropped number or watch_out;
  - an evidence_tier change.
- **Independent check:** the acceptance prints the derived BATCH, and the builder's report lists it. The critic re-derives it with `grep -n '"id": "' server/kristy_perimeter_kb.json` and checks KEPT/REWRITTEN against `git diff` per id.

## Steps
1. **Projection first.** Run the C5 checks as a script, without editing, and print the failing ids with their failing check. Rewrite only the failing fields. Report every other id as KEPT.
2. **Rewrites.** Build each rewritten front or tier_note from that card's own sentences (decision, why, short_answer, buying_tips, look_for):
   - no new fact, number, concern or claim (rule 1);
   - a tier_note comments on the front or the do line (TIER_NOTE_ORPHANED).
3. **Two-sentence tier_notes.** Merge each into one sentence, keeping both facts; drop the weaker fact if the merge would pass 20 words.
4. **Pending list.** In TIER_NOTE_ORPHANED_PENDING (`server/lib/counterCardLint.js`), remove `olive_oil_grades`, `bottled_water_buying` and `tea`. Keep the export and the other members.
5. **Review rows.** For every BATCH id whose decision changed, the `docs/do-lines-review.md` row headline becomes the KB decision. If the do line no longer serves the front, replace it with an observable instruction:
   - ≤28 words;
   - observable in both columns.

   Then run `node scripts/buildDoLines.js`.
6. **Non-ITEM ids.** Edit decision/tier_note only as passRule allows. If passRule refuses a needed edit, STOP BLOCKED and name the id and the rule. Never widen passRule.

## Criteria
- C1 [test] The derived BATCH is well-formed:
  - both anchors exist;
  - it has 20 to 70 ids;
  - it contains every named id (the 3 pending and the 6 two-sentence).
- C2 [test] olive_oil_grades, bottled_water_buying and tea are not in TIER_NOTE_ORPHANED_PENDING.
- C3 [test] The six named tier_notes are one sentence each.
- C4 [test] Every BATCH id passes:
  - a front of ≤14 words, with no hedge;
  - a tier_note per rule 5;
  - lintCard and readability `[]`;
  - a review headline equal to the decision.
  - ESSENTIALS is unchanged.
- C5 [test] Rule 4 = 0 over the BATCH decision + tier_note.
- C6 [test] Sources:
  - no BATCH id lost a PRE URL;
  - every URL not in PRE anywhere is archived.
- C7 [test] The non-pick count is 181.
- C8 `npm test` green; probe 0 wrong; dry-run count 181.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": [], "allowed_reads": [], "expected": "20-70 ids incl. 9 named", "test_name": "C1 derived batch is well-formed"},
    {"id": "C2", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:95-110"], "expected": "3 ids out of PENDING", "test_name": "C2 pantry ids leave pending"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": [], "allowed_reads": [], "expected": "6 one-sentence tier_notes", "test_name": "C3 two-sentence tier notes merged"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": [], "expected": "every batch id passes", "test_name": "C4 pantry fronts and why lines pass"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 hits", "test_name": "C5 claim-lock rule 4"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "0 dropped, 0 unarchived", "test_name": "C6 sources never shrink and new URLs are archived"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8a.test.js"], "dependents": ["server/scripts/migrateCounterCards.js"], "allowed_reads": [], "expected": "181", "test_name": "C7 card count stays 181"}
  ],
  "dependency_evidence": [
    {"source": "planner read of TIER_NOTE_ORPHANED_PENDING at a88ada6", "hits": ["olive_oil_grades", "bottled_water_buying", "tea"]},
    {"source": "planner read of KB tier_notes at 8a30d3d", "hits": ["two-sentence: nuts_raw_vs_roasted, honey_adulteration, bulk_bins_buying, olive_oil_grades, nut_butter_ingredients, bottled_water_buying"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-8a", "network": false}
}
```

## Acceptance server/test/acceptance/ic8a.test.js
```js
// IC-8a: rest of store part 1, grains/bread/fermented/pantry fronts (docs/ITEM-CARDS-PLAN.md IC-8). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const PENDING_OUT = ['olive_oil_grades', 'bottled_water_buying', 'tea'];
const TWO_SENTENCE = ['nuts_raw_vs_roasted', 'honey_adulteration', 'bulk_bins_buying', 'olive_oil_grades', 'nut_butter_ingredients', 'bottled_water_buying'];
const ids = kb.entries.map((e) => e.id);
const start = ids.indexOf('sandwich_bread');
const end = ids.findIndex((id, i) => i > start && /^frozen/.test(id));
const BATCH = kb.entries.slice(start, end).filter((e) => e.kind !== 'pick' && e.kind !== 'home').map((e) => e.id);
console.log(`ic-8a BATCH (${BATCH.length}): ${BATCH.join(', ')}`);
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
const PRE_URLS = new Set(PRE.entries.flatMap(urls));
const dir = join(ROOT, 'docs/sources/item-cards');
const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');

test('C1 derived batch is well-formed', () => {
  assert.ok(start >= 0, 'sandwich_bread not found');
  assert.ok(end > start, 'no /^frozen/ id after sandwich_bread');
  assert.ok(BATCH.length >= 20 && BATCH.length <= 110, `batch size ${BATCH.length}`);
  for (const id of [...PENDING_OUT, ...TWO_SENTENCE]) assert.ok(kb.entries.some((e) => e.id === id), `${id} missing from the KB`); // named ids sit before sandwich_bread; they are scoped by name, not by range
});

test('C2 pantry ids leave pending', () => {
  for (const id of PENDING_OUT) assert.ok(!PENDING.includes(id), `${id} still pending`);
});

test('C3 two-sentence tier notes merged', () => {
  for (const id of TWO_SENTENCE) assert.doesNotMatch(String(now(id).tier_note || '').trim(), /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
});

test('C4 pantry fronts and why lines pass', () => {
  const notes = kb.entries.map((e) => String(e.tier_note || '').trim()).filter(Boolean);
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(words(e.decision) <= 14, `${id} front is ${words(e.decision)} words`);
    assert.deepEqual(headlineHedge(e.decision), [], `${id} front hedges`);
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5, `${id} tier_note too short`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.doesNotMatch(n, /\b(I|me|my|mine|we|us|our)\b/, `${id} tier_note first person`);
    assert.notEqual(n.toLowerCase().replace(/[^a-z]/g, ''), String(e.evidence_tier).toLowerCase().replace(/[^a-z]/g, ''), `${id} tier_note is the tier name`);
    assert.equal(notes.filter((x) => x === n).length, 1, `${id} tier_note not unique`);
    assert.ok(!PENDING.includes(id), `${id} still pending`);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lint`);
    assert.deepEqual(readability(e), [], `${id} readability`);
    assert.equal(reviewHeadline(id), e.decision, `${id} review headline differs from KB decision`);
  }
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C5 claim-lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
});

test('C6 sources never shrink and new URLs are archived', () => {
  for (const id of BATCH) {
    const have = new Set(urls(now(id)));
    for (const u of urls(pre(id))) assert.ok(have.has(u), `${id} dropped ${u}`);
    for (const u of have) if (!PRE_URLS.has(u)) assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`);
  }
});

test('C7 card count stays 182', () => {
  assert.equal(kb.entries.filter((e) => e.kind !== 'pick').length, 182);
});
```

## ANCHOR server/kristy_perimeter_kb.json
Locate the range anchors before dispatch with `grep -n '"id": "sandwich_bread"\|"id": "frozen' server/kristy_perimeter_kb.json`. The admin must see `sandwich_bread` first and at least one `frozen…` id after it. Otherwise the planner fixes the range before dispatch; the builder never edits the acceptance.

## ANCHOR server/lib/counterCardLint.js:99
TIER_NOTE_ORPHANED_PENDING. Relocate by grep. Remove the 3 ids only.

## ANCHOR docs/do-lines-review.md
Find each row with `grep -n '^| `<id>` |' docs/do-lines-review.md`. Columns: id | section | headline | do line | note.

## Prerequisites
- **Env:** node ≥20, git, grep. No network, no Supabase writes.
- ic-7b is committed.
- The range grep above has been checked by the admin.

## Answers
- **First read:** `grep -n '"id": "' server/kristy_perimeter_kb.json`. The suite takes about 1-3 min. Do not edit k14 C12.
- **passRule.**
  - ITEM_CARD_REWRITE ids may grow aliases, asked_as, sources, labels_decoded and cart_pick, but never shrink them.
  - evidence_tier stays byte-identical. watch_out only grows. Numbers survive.
  - Non-ITEM ids: decision/tier_note only, and only as passRule allows. Otherwise STOP BLOCKED.
- **Readability:** short_answer ≤40 words, sentences ≤20 words.
- **Sources:** this piece adds none. The source gap is that there is no archive for these items. A rewrite restates the card's own sentences.
- **No price.** "Budget" stays relative terms only (NN8), so "cheaper" may survive only where it already exists on the card. No negative brand claims (NN9).
- **Limits.** 60 min cap; BLOCKED after 3 identical failures. Do not touch git. Never delete an assertion without a replacement.
- **Report, ≤30 lines:**
  - READY/NOT READY;
  - npm count;
  - the printed BATCH;
  - KEPT/REWRITTEN per id (REWRITTEN with old → new front);
  - a claim-trace table for every rewritten sentence.
- Card commits end "Not migrated."

## Tried and rejected
- **Hand-listing ~50 ids in the spec:** the planner has not read the full id range, and a wrong list is worse than a derived one with a loud range check.
- **Rewriting every id to the ladder form:** churn without a failing check, which is outside "rewrite on failure only".
