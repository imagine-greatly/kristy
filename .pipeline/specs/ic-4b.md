# ic-4b — Poultry fronts: "Eggs" and "Chicken" item cards, plus the poultry audit

```json
{
  "id": "ic-4b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCardLint.js:444-540",
    "server/lib/counterCardLint.js:1550-1590",
    "server/test/acceptance/k8.test.js",
    "server/test/acceptance/k15.test.js"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic4b.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-4a-eggs AND ic-4a-chicken are committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe (every IC-3..IC-8 piece edits the KB; strictly sequential).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-4b, D1 (front = `decision`, why line = `tier_note`), claim-lock rules 1-5. Item-card shape approved 2026-10-13: one card per item; the front is the buying ladder plus a why line; the back is how to spot it.

**Missing prerequisite:** no `ic-4a-chicken` spec exists at the time of writing. This piece assumes ic-4a-chicken did all of the following:
- retired `air_chilled_chicken` and `no_antibiotics_poultry`;
- repointed every "see Air-chilled chicken." pointer;
- moved the `chill_water` OWNED_FACTS owner;
- removed `air_chilled_chicken` from tryPool.js, tryPool.test.js, k8 and k24.

C0 fails loudly if it did not run.

## Alignment block
- **Done means:**
  - **Fronts and why lines.** Given each batch id, the decision is a cart rule of ≤14 words with no `headlineHedge` hit. The tier_note passes claim-lock rule 5: one sentence, ≥5 words, not the tier name, no first person, unique.
  - **Eggs.** egg_labels is titled "Eggs", with the decision verbatim "Corn- and soy-free first, then organic, then pasture-raised."
  - **Chicken.** chicken_cuts_basics is titled "Chicken".
  - **Titles and pointers.** Exactly one non-pick entry carries each new title. No KB string says "see Egg labels", "see Chicken and duck" or "see Air-chilled chicken".
  - **Do lines.** The do-lines-review headline equals the KB decision for every batch id, and doLines.json is regenerated.
  - **Checks.** Lint is clean, `npm test` is green, `listMatchProbe.js` reports 0 wrong, and there is one claim-trace row per new or rewritten sentence.
- **Out of scope:**
  - folds (ic-4a-eggs / ic-4a-chicken);
  - aliases, asked_as and labels_decoded;
  - OWNED_FACTS rows;
  - count pins (unchanged at 189);
  - kristy-ios title strings (flagged, not edited);
  - client/src.
- **OK rough edges:**
  - an audit id left unchanged because it already passes (reported KEPT);
  - the chicken front loses its air-chilled clause if the card's back cannot support it (reported);
  - duck aliases stay on a card titled "Chicken".
- **Ship bar:** any of these blocks shipping:
  - an untraced claim;
  - a second non-pick "Eggs" or "Chicken";
  - a stale pointer;
  - a rule-4 hit;
  - an ESSENTIALS change;
  - a deleted safety or freshness sentence;
  - a brand name in a new sentence.
- **Independent check:** in ic4b,
  - C5 checks word count and hedges over the batch;
  - C6 checks rule 4 = 0;
  - C3 searches JSON.stringify(kb) for stale-pointer strings = 0.

**Batch ids:** egg_labels, chicken_cuts_basics, rotisserie_chicken, ground_turkey, turkey_whole, turkey_bacon, frozen_nuggets, egg_duck_quail. The last six are audit ids: rewrite only on failure, and report KEPT/REWRITTEN.

## Change
1. **egg_labels** (relocate by grep):
   - `"title": "Egg labels, and what the hen ate"` → `"Eggs"`.
   - `"decision": "Soy-free and corn-free first, then organic, then pasture-raised."` → `"Corn- and soy-free first, then organic, then pasture-raised."` (plan wording, Devon).
   - tier_note → `What the hen ate ranks above how she was housed, so the feed words lead the carton.`
   - Keep the both-printed soy-free/corn-free fact on the back.
2. **chicken_cuts_basics:**
   - `"title": "Chicken and duck"` → `"Chicken"`.
   - Decision:
     - If the card's back (why, short_answer, detail, buying_tips, watch_out, labels_decoded, pick_steps, science) matches `/air[- ]chill/i` after ic-4a-chicken → `Air-chilled first, then bone-in, skin-on thighs over breast.`
     - Otherwise → `Bone-in, skin-on thighs over breast.`, and report the dropped clause.
   - tier_note: one sentence built only from the card's own retained-water and thigh fat/collagen sentences, e.g. `Water-chilled birds can hold retained water, and thighs carry more fat and collagen than breast.` [PLACEHOLDER wording; reword within the on-card facts and trace each clause].
   - No new sources: the card is HEALTH_FIRST_REWRITE, not ITEM_CARD_REWRITE.
3. **Audit ids:**
   - Print the C5 failures for the six audit ids before editing.
   - Rewrite only the failing decision and/or tier_note, from that card's own sentences.
   - Report KEPT/REWRITTEN per id.
4. **`docs/do-lines-review.md`:**
   - Set each batch id's primary-row headline to its KB decision.
   - Leave the do column alone unless HEADLINE_DO_MAX (28) or OBSERVABLE_IN_BOTH fires. If one does, reword within the same act and log it.
   - Then run `node scripts/buildDoLines.js` from `server/`.
5. **Lint rejections:**
   - A rejected draft is reworded within the same facts and logged.
   - If lint rejects Devon's egg decision verbatim → STOP BLOCKED with the lint code. Never loosen lint.

## Criteria
- C0 [test] Prerequisite folds ran: air_chilled_chicken, no_antibiotics_poultry and egg_grades_sizes are absent from the KB and present in RETIRED.
- C1 [test] egg_labels:
  - title is "Eggs";
  - decision is verbatim;
  - tier_note names the feed;
  - the spoken text keeps the both-printed fact;
  - exactly one non-pick entry is titled "Eggs".
- C2 [test] chicken_cuts_basics:
  - title is "Chicken";
  - decision names thighs;
  - an air-chilled front is backed by the back;
  - exactly one non-pick entry is titled "Chicken";
  - every 663ca3d alias is kept.
- C3 [test] No KB string contains "see Egg labels", "see Chicken and duck" or "see Air-chilled chicken".
- C5 [test] For every batch id:
  - the front is ≤14 words with no hedge;
  - the tier_note passes rule 5 and is not pending;
  - lintCard and readability return `[]`;
  - the review headline equals the decision.
  - ESSENTIALS is unchanged.
- C6 [test] Rule 4 = 0 over the batch decision + tier_note.
- C7 [test] Every source URL new on a batch id since 663ca3d is in `docs/sources/item-cards/*.md`.
- C8 `npm test` green; probe 0 wrong; dry-run count 189.

## Contract
```json
{
  "criteria": [
    {"id": "C0", "impl": [], "tests": ["server/test/acceptance/ic4b.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCards.js"], "expected": "4 prerequisite ids retired", "test_name": "C0 prerequisite folds ran"},
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4b.test.js", "server/test/acceptance/k8.test.js"], "dependents": ["server/lib/counterCards.js"], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "Eggs front verbatim", "test_name": "C1 the Eggs card"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4b.test.js", "server/test/acceptance/k8.test.js"], "dependents": [], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "Chicken front backed by its back", "test_name": "C2 the Chicken card"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4b.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": [], "expected": "0 stale pointers", "test_name": "C3 no stale poultry pointers"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic4b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:444-540"], "expected": "fronts are cart rules, why lines pass rule 5", "test_name": "C5 poultry fronts and why lines pass"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 rule-4 hits", "test_name": "C6 claim-lock rule 4"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic4b.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "0 URL misses", "test_name": "C7 new URLs are archived"}
  ],
  "dependency_evidence": [
    {"source": "planner grep of old titles over server/ excluding fixtures, 8a30d3d, 2026-10-14", "hits": ["kristy_perimeter_kb.json:517 egg_labels title", "kristy_perimeter_kb.json:2948 chicken_cuts_basics title", "kristy_perimeter_kb.json:2588 egg_grades_sizes pointer (retired by ic-4a-eggs)", "no server test pins either title"]},
    {"source": "server/test/acceptance/passRule.js", "hits": ["egg_labels in ITEM_CARD_REWRITE", "chicken_cuts_basics in HEALTH_FIRST_REWRITE"]}
  ],
  "env": {"executables": ["node", "git"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-4b", "network": false}
}
```

## Acceptance server/test/acceptance/ic4b.test.js
```js
// IC-4b: poultry fronts, "Eggs" and "Chicken" (docs/ITEM-CARDS-PLAN.md IC-4b). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RETIRED, ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'labels_decoded', 'cart_pick', 'question'];
const BACK = ['why', 'short_answer', 'detail', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'labels_decoded'];
const text = (e, fields) => JSON.stringify(fields.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const BATCH = ['egg_labels', 'chicken_cuts_basics', 'rotisserie_chicken', 'ground_turkey', 'turkey_whole', 'turkey_bacon', 'frozen_nuggets', 'egg_duck_quail'];
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};

test('C0 prerequisite folds ran', () => {
  for (const id of ['air_chilled_chicken', 'no_antibiotics_poultry', 'egg_grades_sizes']) {
    assert.equal(now(id), undefined, `${id} still in the KB: ic-4a-eggs / ic-4a-chicken must land first`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
  }
});

test('C1 the Eggs card', () => {
  const e = now('egg_labels');
  assert.equal(e.title, 'Eggs');
  assert.equal(e.decision, 'Corn- and soy-free first, then organic, then pasture-raised.');
  assert.match(e.tier_note, /feed|ate/i);
  assert.match(text(e, SPOKEN), /\bboth\b[^.]*soy[- ]free[^.]*corn[- ]free|\bboth\b[^.]*corn[- ]free[^.]*soy[- ]free/i, 'both-printed fact lost');
  assert.equal(nonPicksTitled('Eggs').length, 1, 'non-pick "Eggs" count');
});

test('C2 the Chicken card', () => {
  const c = now('chicken_cuts_basics');
  assert.equal(c.title, 'Chicken');
  assert.match(c.decision, /thigh/i);
  if (/air[- ]chill/i.test(c.decision)) assert.match(text(c, BACK), /air[- ]chill/i, 'front says air-chilled, back does not');
  assert.equal(nonPicksTitled('Chicken').length, 1, 'non-pick "Chicken" count');
  for (const a of pre('chicken_cuts_basics').aliases) assert.ok(c.aliases.includes(a), `alias "${a}" lost`);
});

test('C3 no stale poultry pointers', () => {
  const all = JSON.stringify(kb);
  for (const s of ['see Egg labels', 'see Chicken and duck', 'see Air-chilled chicken']) assert.ok(!all.includes(s), `KB still says "${s}"`);
});

test('C5 poultry fronts and why lines pass', () => {
  const notes = kb.entries.map((e) => String(e.tier_note || '').trim()).filter(Boolean);
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
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

test('C6 claim-lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
});

test('C7 new URLs are archived', () => {
  const dir = join(ROOT, 'docs/sources/item-cards');
  const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) if (!was.has(u)) assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`);
  }
});
```

## ANCHOR server/kristy_perimeter_kb.json:515
At 8a30d3d; ic-4a shifts it. Relocate it with `grep -n '"id": "egg_labels"' server/kristy_perimeter_kb.json`.
```
    {
      "id": "egg_labels",
      "title": "Egg labels, and what the hen ate",
```

## ANCHOR server/kristy_perimeter_kb.json:2946
At 8a30d3d. Relocate it with `grep -n '"id": "chicken_cuts_basics"'`.
```
    {
      "id": "chicken_cuts_basics",
      "title": "Chicken and duck",
```

## Prerequisites
- **Env:** node ≥20, with git on PATH (`git show 663ca3d:...`).
- No network and no Supabase writes. A dry-run credentials error is reported, not fixed.
- ic-4a-eggs and ic-4a-chicken must be committed first (C0).

## Answers
- **First read:** `grep -n '"id": "' server/kristy_perimeter_kb.json`.
- **Suite:** takes about 1-3 min. If k14 C12 is red, report it and do not edit C12.
- **passRule:**
  - The k8 slice holds egg_labels and chicken_cuts_basics; k15 holds turkey_bacon.
  - decision, tier_note, why, detail and watch_out are REWRITABLE.
  - Numbers in old rewritable text must survive.
  - watch_out only grows.
  - evidence_tier, category, aliases and asked_as stay byte-identical.
  - Sources may grow only on egg_labels.
- **Text rules:**
  - tier_note uniqueness is by exact string across the KB.
  - No brand names (NN9) and no price words (NN8).
  - Never move text into pick_steps (cap 3) or science.
- **iOS:** run `grep -rn -E 'Egg labels|Chicken and duck' /Users/m1/kristy-ios --include=*.swift`. List the hits; do not edit kristy-ios.
- **Limits:**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not commit, stash or touch git.
  - Never delete an assertion without a replacement.
  - Leave `fixtures/kb-pre-readability.json` alone.
- **Report (≤30 lines):**
  - READY/NOT READY;
  - the npm count;
  - KEPT/REWRITTEN per audit id;
  - a claim-trace table (sentence → on-card field or archive file:line).
- Card commits end "Not migrated."

## Tried and rejected
- **Keeping "Soy-free and corn-free first, ...":** the plan records Devon's "Corn- and soy-free first" wording; flagged for his confirmation.
- **An air-chilled front with no air-chill sentence on the back:** the front would claim what the card does not show.
- **Adding sources to chicken_cuts_basics:** passRule freezes them outside ITEM_CARD_REWRITE.
