# ic-8b — Rest of store, part 2: condiments, snacks, deli, frozen, label and home fronts; corpus-wide front closer

```json
{
  "id": "ic-8b",
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
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic8b.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`. Run this after ic-8a is committed and main has re-anchored k14 C12.
- Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY.
- P1. Not parallel-safe.
- Plan: `docs/ITEM-CARDS-PLAN.md` IC-8, claim-lock rules 1-5.

**Batch size.** About 50 own ids exceeds the ≤30 batch size [PLACEHOLDER]; see the ic-8a flag.

This piece closes the front contract for the whole corpus. Its C4 runs over every non-pick entry, so any card an earlier piece missed shows up here.

## Alignment block
- **Done means:**
  - **OWN batch.** OWN is derived from the KB as every non-pick entry that is:
    - from the first `/^frozen/` id after `sandwich_bread` to the end of the KB, plus
    - every `kind: 'home'` entry, plus
    - every id starting `label_`.

    Every OWN id has passed the projection, and failing fields were rewritten.
  - **Pending list.** These ids have left TIER_NOTE_ORPHANED_PENDING: label_made_with_real, label_organic_scope, label_lightly_sweetened, label_ingredient_order, label_third_party_seals, label_artificial_color, revive_greens. The set is now empty and still exported.
  - **Every non-pick card** in the corpus passes:
    - front ≤14 words, with no hedge;
    - tier_note per rule 5;
    - lintCard and readability `[]`;
    - review headline = decision.
  - **Corpus-wide sources and rule 4.** Rule 4 = 0 over all decision + tier_note. No new URL anywhere is unarchived.
  - **Count** stays 181.
- **Out of scope:**
  - folds, titles, aliases and asked_as;
  - sources on non-ITEM ids;
  - deleting the TIER_NOTE_ORPHANED_PENDING export or its lint path;
  - kristy-ios.
- **OK rough edges:**
  - OWN ids that already pass stay KEPT.
  - home cards keep their mechanical voice: there is no ladder on technique cards, but they still need a ≤14-word front.
- **Ship bar:**
  - an untraced claim;
  - an unarchived new URL;
  - a rule-4 hit;
  - a brand name or a negative claim about a named brand;
  - a price word;
  - a bodily claim on a home card (no-treatment rule);
  - an ESSENTIALS change;
  - a count change;
  - a dropped number or watch_out;
  - an evidence_tier change.
- **Independent check:**
  - `grep -c` on the PENDING array body → 0 ids;
  - the acceptance prints OWN, and the critic diffs KEPT/REWRITTEN per id with `git diff`;
  - the corpus-wide C4 fails loudly on any card any earlier IC piece missed.

## Steps
1. **Projection first.** Run the C4 checks over every non-pick without editing, and print the failures as id → check.
   - **Failures inside OWN:** this piece rewrites them.
   - **Failures outside OWN:**
     - If ≤5, fix the tier_note or front under the same rules and list them as SWEPT.
     - If >5, STOP BLOCKED with the list: an earlier piece did not land.
2. **Rewrites.** Build them from the card's own sentences only (rule 1).
   - label_* fronts teach label truth (NN9): a front reads the label, never a named brand.
   - home cards stay mechanical. They never touch the body, and they carry no cart.
3. **Pending list.** In `server/lib/counterCardLint.js`, delete the 7 named ids from TIER_NOTE_ORPHANED_PENDING. If any other member remains, its card must pass C4 and is then removed too (report it).
   - Leave the export as an empty set/array of the same type, so counterCardLint.test.js and any importer keep working.
   - If a counterCardLint.test.js assertion pins a nonzero size, STOP BLOCKED and quote it. Do not edit tests you do not own.
4. **Do lines.** For changed decisions:
   - update the `docs/do-lines-review.md` headlines;
   - replace do lines that no longer serve the front (≤28 words, observable in both);
   - run `node scripts/buildDoLines.js`.
5. **Non-ITEM ids.** Edits go only as far as passRule allows; otherwise STOP BLOCKED with the id and the rule.

## Criteria
- C1 [test] OWN is well-formed:
  - the range anchors exist;
  - it has ≥20 ids;
  - it contains label_wild_vs_farm_raised, revive_greens and every named label_ id.
- C2 [test] TIER_NOTE_ORPHANED_PENDING is exported and has size 0.
- C3 [test] Every OWN id passes:
  - front ≤14 words, with no hedge;
  - tier_note per rule 5;
  - lintCard and readability `[]`;
  - review headline = decision.
- C4 [test] The C3 checks pass for every non-pick entry in the KB, and ESSENTIALS is unchanged.
- C5 [test] Rule 4 = 0 over the decision + tier_note of every non-pick.
- C6 [test] Sources:
  - no OWN id lost a PRE URL;
  - no URL anywhere in the KB is new, unless it is archived;
  - the umd raw-milk-law URL is absent.
- C7 [test] The non-pick count is 181.
- C8 `npm test` green; probe 0 wrong; dry-run 181.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": [], "allowed_reads": [], "expected": "≥20 ids incl. named label_ ids and revive_greens", "test_name": "C1 own batch is well-formed"},
    {"id": "C2", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:95-110"], "expected": "exported, size 0", "test_name": "C2 pending ratchet is empty"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": [], "expected": "every OWN id passes", "test_name": "C3 store fronts and why lines pass"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": [], "allowed_reads": [], "expected": "every non-pick passes", "test_name": "C4 every card front passes corpus-wide"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 hits", "test_name": "C5 claim-lock rule 4 corpus-wide"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "0 dropped, 0 unarchived, umd absent", "test_name": "C6 sources never shrink and new URLs are archived"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic8b.test.js"], "dependents": ["server/scripts/migrateCounterCards.js"], "allowed_reads": [], "expected": "181", "test_name": "C7 card count stays 181"}
  ],
  "dependency_evidence": [
    {"source": "planner read of TIER_NOTE_ORPHANED_PENDING at a88ada6", "hits": ["label_made_with_real", "label_organic_scope", "label_lightly_sweetened", "label_ingredient_order", "label_third_party_seals", "label_artificial_color", "revive_greens"]},
    {"source": "ic-7b Devon milk ruling", "hits": ["agrisk.umd.edu raw-milk-law URL excluded from the KB"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-8b", "network": false}
}
```

## Acceptance server/test/acceptance/ic8b.test.js
```js
// IC-8b: rest of store part 2, plus the corpus-wide front closer (docs/ITEM-CARDS-PLAN.md IC-8). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import * as lint from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } = lint;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const UMD = 'https://agrisk.umd.edu/post/the-raw-facts-let-s-talk-about-state-laws-regulating-raw-milk';
const PENDING_OUT = ['label_made_with_real', 'label_organic_scope', 'label_lightly_sweetened', 'label_ingredient_order', 'label_third_party_seals', 'label_artificial_color', 'revive_greens'];
const ids = kb.entries.map((e) => e.id);
const start = ids.indexOf('sandwich_bread');
const end = ids.findIndex((id, i) => i > start && /^frozen/.test(id));
const CARDS = kb.entries.filter((e) => e.kind !== 'pick');
const OWN = kb.entries.filter((e, i) => e.kind !== 'pick' && ((end >= 0 && i >= end) || e.kind === 'home' || e.id.startsWith('label_'))).map((e) => e.id);
console.log(`ic-8b OWN (${OWN.length}): ${OWN.join(', ')}`);
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
const notes = kb.entries.map((e) => String(e.tier_note || '').trim()).filter(Boolean);
const frontFailures = (e) => {
  const out = [];
  const n = String(e.tier_note || '').trim();
  if (words(e.decision) > 14) out.push(`front ${words(e.decision)} words`);
  if (headlineHedge(e.decision).length) out.push('front hedges');
  if (words(n) < 5) out.push('tier_note too short');
  if (/[.!?]\s+\S/.test(n)) out.push('tier_note two sentences');
  if (/\b(I|me|my|mine|we|us|our)\b/.test(n)) out.push('tier_note first person');
  if (n.toLowerCase().replace(/[^a-z]/g, '') === String(e.evidence_tier).toLowerCase().replace(/[^a-z]/g, '')) out.push('tier_note is the tier name');
  if (notes.filter((x) => x === n).length !== 1) out.push('tier_note not unique');
  if ([...TIER_NOTE_ORPHANED_PENDING].includes(e.id)) out.push('pending');
  if (lintCard(projectEntry(e, { doLine: doLines[e.id] })).length) out.push('lint');
  if (readability(e).length) out.push('readability');
  if (reviewHeadline(e.id) !== e.decision) out.push('review headline differs');
  return out;
};

test('C1 own batch is well-formed', () => {
  assert.ok(start >= 0, 'sandwich_bread not found');
  assert.ok(end > start, 'no /^frozen/ id after sandwich_bread');
  assert.ok(OWN.length >= 20, `OWN size ${OWN.length}`);
  for (const id of [...PENDING_OUT, 'label_wild_vs_farm_raised']) assert.ok(OWN.includes(id), `${id} outside OWN`);
});

test('C2 pending ratchet is empty', () => {
  assert.ok('TIER_NOTE_ORPHANED_PENDING' in lint, 'export removed');
  assert.equal([...TIER_NOTE_ORPHANED_PENDING].length, 0, `still pending: ${[...TIER_NOTE_ORPHANED_PENDING].join(', ')}`);
});

test('C3 store fronts and why lines pass', () => {
  for (const id of OWN) assert.deepEqual(frontFailures(now(id)), [], id);
});

test('C4 every card front passes corpus-wide', () => {
  const bad = CARDS.map((e) => [e.id, frontFailures(e)]).filter(([, f]) => f.length);
  assert.deepEqual(bad, [], bad.map(([id, f]) => `${id}: ${f.join(', ')}`).join('\n'));
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C5 claim-lock rule 4 corpus-wide', () => {
  for (const e of CARDS) assert.doesNotMatch(`${e.decision} ${e.tier_note}`, RULE4, e.id);
});

test('C6 sources never shrink and new URLs are archived', () => {
  for (const id of OWN) {
    const have = new Set(urls(now(id)));
    for (const u of urls(pre(id))) assert.ok(have.has(u), `${id} dropped ${u}`);
  }
  for (const e of CARDS) for (const u of urls(e)) if (!PRE_URLS.has(u)) assert.ok(archive.includes(u), `${e.id}: ${u} not in docs/sources/item-cards`);
  assert.ok(!JSON.stringify(kb).includes(UMD), 'umd raw-milk-law URL is in the KB');
});

test('C7 card count stays 181', () => {
  assert.equal(CARDS.length, 181);
});
```

## ANCHOR server/kristy_perimeter_kb.json
These are the same range anchors as ic-8a. Check them before dispatch with `grep -n '"id": "sandwich_bread"\|"id": "frozen\|"id": "label_\|"kind": "home"' server/kristy_perimeter_kb.json`.

## ANCHOR server/lib/counterCardLint.js:99
TIER_NOTE_ORPHANED_PENDING. Relocate by grep. Empty it; keep the export and its type.

## Prerequisites
- Env: node ≥20, git, grep. No network, no Supabase writes.
- ic-8a must be committed. Every earlier IC piece (3b, 4a, 4b, 5b, 6b, 7b) must be committed, or C4 sweeps their misses here (>5 is BLOCKED).

## Answers
- **Start and limits:**
  - First read: `grep -n '"id": "' server/kristy_perimeter_kb.json`.
  - Suite ~1-3 min. Do not edit k14 C12.
  - 60 min cap; BLOCKED after 3 identical failures. Do not touch git. Never delete an assertion without a replacement.
- **passRule:**
  - ITEM_CARD_REWRITE fields grow only and never shrink; evidence_tier stays byte-identical; watch_out only grows; numbers survive.
  - Non-ITEM ids change decision/tier_note only as passRule allows, else STOP BLOCKED.
- **Home cards:** the `kind: 'home'` front is a mechanical instruction. It uses the existing IMPERATIVE_VERBS reasoning and is never bodily, with no cart.
- **Label cards:** a label_* front names what to read on the label. It never names a brand (NN9) and never claims a health effect (NN3).
- **Sources and pricing:**
  - Sources: none added. The rest of the store has no archive, so rewrites restate on-card sentences only.
  - No price (NN8).
- **Report, ≤30 lines:**
  - READY/NOT READY and the npm count;
  - the printed OWN;
  - KEPT/REWRITTEN per OWN id (REWRITTEN: old → new front);
  - SWEPT ids outside OWN;
  - the final PENDING contents (empty);
  - a claim-trace table for each rewritten sentence.
- **Commits:** card commits end "Not migrated."

## Tried and rejected
- **Deleting TIER_NOTE_ORPHANED_PENDING and its lint path once empty:** it is shape churn that importers and counterCardLint.test.js may reference. An empty ratchet is free, so keep it.
- **Scoping C4 to OWN only:** it lets an earlier piece's miss ship. The corpus-wide check is the closer the plan needs.
