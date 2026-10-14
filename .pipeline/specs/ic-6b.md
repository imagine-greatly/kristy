# ic-6b — Seafood fronts: "Salmon" and "Shrimp" item cards, seafood batch fronts, crab why line

```json
{
  "id": "ic-6b",
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
    "server/lib/counterCardLint.js:95-110",
    "server/lib/counterDecision.test.js:80-95"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic6b.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-6a is committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe.
Plan: `docs/ITEM-CARDS-PLAN.md` IC-6b, D1 (front = `decision`, why line = `tier_note`), claim-lock rules 1-5.
**Source gap:** `docs/sources/item-cards/` has no seafood archive, so every front and why line is drawn from sentences already on the card (claim-lock rule 1). No new URL may be added; C7 asserts that none was.

## Alignment block
- **Done means:**
  - **Titles.** salmon_wild_vs_farmed is titled "Salmon" and shrimp_imported_vs_domestic is titled "Shrimp". Exactly one non-pick entry carries each.
  - **Pointers.** No KB string contains "see Wild vs. farmed salmon" or "see Imported vs. domestic shrimp". The wild/farmed pointer reads "Wild or farmed: see Salmon.".
  - **Batch fronts and tier_notes.** For every batch id:
    - the decision is ≤14 words, with no hedge;
    - the tier_note is one sentence of ≥5 words, not the tier name, has no first person, and is unique;
    - lintCard and readability return `[]`;
    - the review headline equals the decision.
  - **Pending list.** crab has left TIER_NOTE_ORPHANED_PENDING.
  - **No new sources.** No batch id gains a URL.
  - **Regressions.** counterDecision.test.js:85 passes unedited, and the suite and probe are green.
- **Out of scope:**
  - folds;
  - aliases and asked_as;
  - count pins (184);
  - label_wild_vs_farm_raised (ic-8b);
  - kristy-ios titles (flagged only);
  - any lint loosening.
- **OK rough edges:**
  - audit ids that already pass stay KEPT;
  - a front reworded within the same facts to clear lint is logged.
- **Ship bar:**
  - an untraced claim;
  - any new URL;
  - a stale salmon or shrimp pointer;
  - the Salmon front without the word wild;
  - an ESSENTIALS change;
  - a rule-4 hit;
  - a brand name;
  - a mercury sentence that claims a health effect (no-treatment rule).
- **Independent check:**
  - C3 runs a string search over the whole KB;
  - C7 recomputes the URL diff against 663ca3d;
  - counterDecision.test.js:85 still pins salmon's whole-food-standard phrasing.

**Batch ids:**
- **Rewritten:** salmon_wild_vs_farmed, shrimp_imported_vs_domestic, seafood_counter, smoked_salmon, white_fish, scallops, crab, lobster, clams_mussels_oysters, canned_tuna, canned_fish_choosing.
- **Audit (rewrite on failure only, report KEPT/REWRITTEN):** mercury_by_fish, farmed_fish_by_species, seafood_certifications.

## Change
| id | change |
| --- | --- |
| salmon_wild_vs_farmed | title `Wild vs. farmed salmon` → `Salmon`; decision from on-card sentences and must match `/wild/i` [PLACEHOLDER draft: `Wild-caught first; farmed only with the farm standard named.`]; keep `why` unedited (counterDecision.test.js:85) |
| shrimp_imported_vs_domestic | title `Imported vs. domestic shrimp` → `Shrimp`; decision from on-card sentences [PLACEHOLDER draft: `Wild U.S. shrimp first, then imported with a farm standard named.`] |
| seafood_counter | decision from its folded freshness and thaw sentences [PLACEHOLDER draft: `Clean briny smell, firm flesh, and ask whether it was frozen.`] |
| crab | tier_note → one sentence from its existing `Leg movement and shell color are extension and FDA buying checks.` facts, commenting on the front or do line (so TIER_NOTE_ORPHANED clears) |
| canned_fish_choosing | tier_note is two sentences today; make it one, keeping its facts |
| smoked_salmon, white_fish, scallops, lobster, clams_mussels_oysters, canned_tuna | decision ≤14 words from on-card sentences; tier_note per rule 5 |

1. **Pointers.**
   - Replace every `Wild or farmed: see Wild vs. farmed salmon.` with `Wild or farmed: see Salmon.`. At 8a30d3d one sat at KB 128 (shrimp); ic-6a may have moved more. Find them by grep.
   - Replace every `see Imported vs. domestic shrimp.` with `see Shrimp.`, keeping the text before the colon.
   - OWNED_FACTS ownerTitle comes from the KB title, so the pointer lint follows the retitle.
2. **Pending list.** In `server/lib/counterCardLint.js` TIER_NOTE_ORPHANED_PENDING, remove `crab`. Keep the export and the other members.
3. **Audit ids.** Print the C5 failures for the whole batch first. Rewrite only the failing fields, from the card's own sentences. Report KEPT/REWRITTEN for each id.
4. **Review table.** In `docs/do-lines-review.md`, set each batch id's headline → the KB decision. Touch the do column only on HEADLINE_DO_MAX (28) / OBSERVABLE_IN_BOTH. Then run `node scripts/buildDoLines.js`.
5. **mercury_by_fish.**
   - The front names the fish to choose. It never says what eating it does to a body (non-negotiable 3).
   - If the current decision says "lower risk" or any rule-4 word, rewrite it to a shopping instruction.
6. **Brands.** Brand and certifier names stay out of decision and tier_note.

## Criteria
- C1 [test] salmon_wild_vs_farmed:
  - title "Salmon";
  - decision matches /wild/i;
  - exactly one non-pick "Salmon".
  - Its id is still in ESSENTIALS.
- C2 [test] shrimp_imported_vs_domestic: title "Shrimp"; exactly one non-pick "Shrimp".
- C3 [test] Pointers:
  - no KB string contains "see Wild vs. farmed salmon" or "see Imported vs. domestic shrimp";
  - ≥1 KB string contains "Wild or farmed: see Salmon.".
- C5 [test] For every batch id:
  - the front is ≤14 words, with no hedge;
  - the tier_note passes rule 5 and is not pending;
  - lintCard and readability are `[]`;
  - the review headline equals the decision.
  - ESSENTIALS is unchanged.
- C6 [test] Rule 4 = 0 over the batch decision + tier_note.
- C7 [test] No batch id has a URL that it lacked at 663ca3d, and the batch had ≥1 URL in total.
- C8 `npm test` is green (including counterDecision.test.js:85, unedited); probe 0 wrong; dry-run 184.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6b.test.js", "server/lib/counterDecision.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": [], "expected": "Salmon title, wild front", "test_name": "C1 the Salmon card"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6b.test.js"], "dependents": [], "allowed_reads": [], "expected": "Shrimp title", "test_name": "C2 the Shrimp card"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6b.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": [], "expected": "0 stale pointers", "test_name": "C3 seafood pointers follow the retitles"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic6b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:95-110"], "expected": "batch fronts and why lines pass", "test_name": "C5 seafood fronts and why lines pass"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 rule-4 hits", "test_name": "C6 claim-lock rule 4"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic6b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 new URLs", "test_name": "C7 no new seafood URLs"}
  ],
  "dependency_evidence": [
    {"source": "planner grep 'see Wild vs. farmed salmon' in KB, 8a30d3d", "hits": ["KB 128 shrimp_imported_vs_domestic: 'Wild or farmed: see Wild vs. farmed salmon.'"]},
    {"source": "server/lib/counterDecision.test.js:85", "hits": ["for salmon_wild_vs_farmed it asserts evidence_tier kristys_standard and that decision+why matches /whole-food standard|not settled science|preference|not a health verdict|not a claim/"]},
    {"source": "planner listing of docs/sources/item-cards", "hits": ["no seafood file"]}
  ],
  "env": {"executables": ["node", "git"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-6b", "network": false}
}
```

## Acceptance server/test/acceptance/ic6b.test.js
```js
// IC-6b: seafood fronts, "Salmon" and "Shrimp" (docs/ITEM-CARDS-PLAN.md IC-6b). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const BATCH = ['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'seafood_counter', 'smoked_salmon', 'white_fish', 'scallops', 'crab',
  'lobster', 'clams_mussels_oysters', 'canned_tuna', 'canned_fish_choosing', 'mercury_by_fish', 'farmed_fish_by_species', 'seafood_certifications'];
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);

test('C1 the Salmon card', () => {
  const s = now('salmon_wild_vs_farmed');
  assert.equal(s.title, 'Salmon');
  assert.match(s.decision, /wild/i);
  assert.equal(nonPicksTitled('Salmon').length, 1, 'non-pick "Salmon" count');
  assert.ok(ESSENTIALS.includes('salmon_wild_vs_farmed'));
});

test('C2 the Shrimp card', () => {
  assert.equal(now('shrimp_imported_vs_domestic').title, 'Shrimp');
  assert.equal(nonPicksTitled('Shrimp').length, 1, 'non-pick "Shrimp" count');
});

test('C3 seafood pointers follow the retitles', () => {
  const all = JSON.stringify(kb);
  assert.ok(!all.includes('see Wild vs. farmed salmon'), 'stale salmon pointer');
  assert.ok(!all.includes('see Imported vs. domestic shrimp'), 'stale shrimp pointer');
  assert.ok(all.includes('Wild or farmed: see Salmon.'), 'no repointed salmon pointer');
});

test('C5 seafood fronts and why lines pass', () => {
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

test('C7 no new seafood URLs', () => {
  let total = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    if (id === 'seafood_counter') for (const f of ['fresh_vs_previously_frozen_fish', 'fish_freshness_at_counter']) for (const u of urls(pre(f))) was.add(u);
    for (const u of urls(now(id))) { total++; assert.ok(was.has(u), `${id}: new URL ${u} (no seafood archive exists)`); }
  }
  assert.ok(total >= 1, 'batch carries no URLs at all');
});
```

## ANCHOR server/kristy_perimeter_kb.json:14
At 8a30d3d; relocate by `grep -n '"id": "salmon_wild_vs_farmed"\|"id": "shrimp_imported_vs_domestic"'`.
```
    {
      "id": "salmon_wild_vs_farmed",
      "title": "Wild vs. farmed salmon",
```

## ANCHOR server/kristy_perimeter_kb.json:82
```
    {
      "id": "shrimp_imported_vs_domestic",
      "title": "Imported vs. domestic shrimp",
```

## ANCHOR server/kristy_perimeter_kb.json:128
The pointer sentence, verbatim. Find every site by `grep -n 'see Wild vs. farmed salmon' server/kristy_perimeter_kb.json`.
```
Wild or farmed: see Wild vs. farmed salmon.
```

## ANCHOR server/lib/counterCardLint.js:99
TIER_NOTE_ORPHANED_PENDING. Relocate by `grep -n 'TIER_NOTE_ORPHANED_PENDING' server/lib/counterCardLint.js`. Members after ic-5b:
- grassfed_butter, whole_vs_reduced_fat_milk;
- label_made_with_real, label_organic_scope, label_lightly_sweetened;
- revive_greens, olive_oil_grades, bottled_water_buying;
- label_ingredient_order, label_third_party_seals, label_artificial_color;
- crab, tea.

Remove only `crab`.

## Prerequisites
- **Env:** node ≥20, git on PATH. No network, no Supabase writes.
- ic-6a is committed: both folded fish ids are absent and seafood_counter carries their sentences.

## Answers
- **First read:** `grep -n '"id": "' server/kristy_perimeter_kb.json`. Suite ~1-3 min. Do not edit k14 C12.
- **passRule.**
  - salmon, shrimp and seafood_counter are ITEM_CARD_REWRITE.
  - The other batch ids are whatever passRule says. For non-ITEM ids, change only decision/tier_note, and only as passRule allows. If passRule rejects a needed edit, STOP BLOCKED with the rule.
  - Numbers in old rewritable text survive. evidence_tier stays byte-identical.
- **counterDecision.test.js:85.** salmon's decision+why must still match `/whole-food standard|not settled science|preference|not a health verdict|not a claim/`. Leave `why` untouched. If it fails, STOP BLOCKED; do not edit the test.
- **Uniqueness.** tier_note uniqueness is exact-string.
- **iOS.** Run `grep -rn -E 'Wild vs. farmed salmon|Imported vs. domestic shrimp' /Users/m1/kristy-ios --include=*.swift`. Report the hits; do not edit them.
- **Run limits.**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not touch git.
  - Never delete an assertion without a replacement.
- **Report.** ≤30 lines:
  - READY/NOT READY;
  - npm count;
  - KEPT/REWRITTEN per id;
  - pointer sites changed (count);
  - a claim-trace table (front → the on-card sentence it came from).
- Card commits end "Not migrated."

## Tried and rejected
- **Adding NOAA/FDA seafood URLs:** none are archived, and citing from memory is a defect (memory: forges invent URLs). The gap is reported instead.
- **Title "Wild salmon":** it puts the ladder's answer in the title. The farmed rung belongs on the same card.
