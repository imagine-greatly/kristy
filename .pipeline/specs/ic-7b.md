# ic-7b — Dairy fronts: the Milk ladder (Devon's ruling), "Butter" and "Yogurt" item cards, dairy batch fronts

```json
{
  "id": "ic-7b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCardLint.js:95-110",
    "server/lib/counterDecision.test.js:80-95",
    "server/lib/tryPool.js",
    "server/lib/tryPool.test.js:95-110",
    "docs/sources/item-cards/cdc-raw-milk.md"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic7b.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-7a is committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe.
Plan: `docs/ITEM-CARDS-PLAN.md` IC-7b and D1, claim-lock rules 1-5.

**Devon's milk ruling (2026-10-14).** It supersedes the plan's D4 placeholder and its concern-4 legality note:
- The milk front is verbatim `Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.`
- No legality content; the ToS disclaimer covers it.
- The rank form keeps HEADLINE_HEDGED unloosened.
- `https://agrisk.umd.edu/post/the-raw-facts-let-s-talk-about-state-laws-regulating-raw-milk` is EXCLUDED from the KB, even though it sits in the archive.

## Alignment block
- **Done means:**
  - **Milk card.** whole_vs_reduced_fat_milk (titled "Milk" since 7a):
    - its decision equals Devon's ruling verbatim, with headlineHedge `[]`;
    - its tier_note is one sentence about handling order;
    - it carries a raw-milk germ watch_out citing an archived CDC/FDA URL;
    - no milk spoken field matches `/\b(il)?legal\b|\blaws?\b/i`.
  - **Excluded sources.** The umd URL and `law.cornell.edu/cfr/text/21/1240.61` appear nowhere in the KB.
  - **Retitles.** grassfed_butter is titled "Butter" and yogurt_plain_vs_flavored "Yogurt". Exactly one non-pick carries each of Milk, Butter and Yogurt. No stale pointer to either old title remains.
  - **Batch fronts and tier_notes.** For every batch id:
    - the decision is ≤14 words, with no hedge;
    - the tier_note passes rule 5;
    - lintCard and readability return `[]`;
    - the review headline equals the decision.
  - **Pending list.** grassfed_butter and whole_vs_reduced_fat_milk have left TIER_NOTE_ORPHANED_PENDING.
  - **Try pool.** whole_vs_reduced_fat_milk is in the tryPool.test.js excluded set and not in the pool.
  - **Suite.** The suite and probe are green.
- **Out of scope:**
  - folds (done in 7a) and count pins (181);
  - aliases/asked_as;
  - item names and cart_picks "Grass-fed butter" (list.js:94, listVoice.js:47, KB cart_pick), which stay;
  - legality in raw_aged_cheese/raw_kefir/raw_milk (flagged to Devon, not enforced);
  - kristy-ios.
- **OK rough edges:**
  - audit ids that already pass stay KEPT;
  - the moved A2 ladder tip may still read "four steps" on the back. It is reworded only if it contradicts the front's order (report it).
- **Ship bar:**
  - the milk decision differs from Devon's text by one character;
  - a hedge or "if you can get it" form;
  - any legality wording on Milk;
  - the umd URL in the KB;
  - a raw-milk germ fact without an archived source;
  - an untraced claim;
  - a URL not in `docs/sources/item-cards/*.md`;
  - a stale pointer;
  - a rule-4 hit;
  - a brand name;
  - an ESSENTIALS change.
- **Independent check:**
  - `grep -c 'agrisk.umd.edu' server/kristy_perimeter_kb.json` → 0;
  - `grep -n 'Campylobacter' docs/sources/item-cards/cdc-raw-milk.md` finds the archived sentence (:139/:157/:159);
  - C7 recomputes the URL diff against 663ca3d.

**Batch ids:**
- **Rewritten:** whole_vs_reduced_fat_milk, grassfed_butter, yogurt_plain_vs_flavored.
- **Audit (rewrite on failure only; report KEPT/REWRITTEN):** raw_milk, ghee, plant_butter, plain_kefir, raw_kefir, sour_cream, cottage_cheese, cream_cheese, cheese_real_vs_processed, raw_aged_cheese, goat_sheep_dairy, cream_vs_creamer, ice_cream, almond_milk, oat_milk, soy_milk, coconut_milk_beverage, dairy_case.

## Change
| id | change |
| --- | --- |
| whole_vs_reduced_fat_milk | decision → `Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.`; tier_note → `Least handling ranks first, so raw from a trusted farmer leads and low-temp organic follows.` [PLACEHOLDER wording; the order fact is fixed]; append watch_out `Raw milk can carry germs such as Campylobacter, E. coli, Listeria and Salmonella, which pasteurization kills.`; append source `https://www.cdc.gov/food-safety/foods/raw-milk.html` in the card's source shape |
| grassfed_butter | title `Grass-fed butter` → `Butter`; decision from on-card sentences [PLACEHOLDER draft: `100% grass-fed butter first, then plain butter: cream and salt only.`]; tier_note one sentence on the front |
| yogurt_plain_vs_flavored | title `Plain vs. flavored yogurt` → `Yogurt`; keep the decision unless C5 fails; tier_note is two sentences today, make it one; reword the `detail` clause "a separate question and a separate card" (live cultures now live on this card) |
| cream_vs_creamer, raw_kefir | tier_note is two sentences today; make it one, keeping its facts |
| audit ids | print C5 failures first; rewrite only failing fields from on-card sentences |

1. **Hedge check.** If headlineHedge or lintCard rejects Devon's milk decision verbatim, STOP BLOCKED and give the lint code. Never reword it, and never loosen HEADLINE_HEDGED.
2. **Milk do line.** The `docs/do-lines-review.md` :58 row's headline becomes the new decision. Its do line (`Read the milkfat percentage on the panel, not the cap color.`) no longer serves the front:
   - replace it with an observable instruction in both columns [PLACEHOLDER: `Ask the farmer how it was handled, or read the carton for low-temp.`];
   - keep it ≤28 words (HEADLINE_DO_MAX) and observable in both (OBSERVABLE_IN_BOTH);
   - the tier_note must comment on the front or this do line (TIER_NOTE_ORPHANED).
3. **Milk sources.** Optional extra sources, all archived (grep each first):
   - `https://www.fda.gov/food/buy-store-serve-safe-food/dangers-raw-milk-unpasteurized-milk-can-pose-serious-health-risk`
   - `https://www.fda.gov/food/buy-store-serve-safe-food/raw-milk-questions-answers`
   - `https://www.fda.gov/food/buy-store-serve-safe-food/raw-milk-misconceptions-and-danger-raw-milk-consumption`
   - `https://www.law.cornell.edu/cfr/text/21/131.3` (the milk definition)

   Never cite `https://www.law.cornell.edu/cfr/text/21/1240.61` (the interstate raw-milk rule, which is legality) or the umd URL.
4. **Legality on Milk.** If a Milk spoken field carries legality wording (`legal`, `illegal`, `law`, `laws`), including text moved in by 7a:
   - **rewritable fields:** remove the wording;
   - **watch_out:** may only grow under passRule, so if the hit is there, STOP BLOCKED and name the sentence.
5. **Pointers.**
   - Replace every `see Grass-fed butter.` with `see Butter.`, and every `see Plain vs. flavored yogurt.` with `see Yogurt.` (7a may have created the latter). Keep the text before the colon.
   - Edit only pointer sentences, never cart_pick or item names.
6. **Pending list.** In TIER_NOTE_ORPHANED_PENDING (`server/lib/counterCardLint.js`), remove `grassfed_butter` and `whole_vs_reduced_fat_milk`. Keep the export and the other members.
7. **Try pool.**
   - Add `'whole_vs_reduced_fat_milk'` to tryPool.test.js's `excluded` set (:101): it now ranks raw milk first, like raw_milk.
   - If tryPool.js lists it, delete that line and decrement the pool-size pins (:64-65, :83) by one. Report which.
8. **Review and rebuild.** Set the review headline of every batch id → its KB decision, then run `node scripts/buildDoLines.js`.

## Criteria
- C1 [test] The Milk card:
  - decision equals Devon's text, and headlineHedge is `[]`;
  - tier_note matches /raw|farmer/i and /low-temp|organic/i;
  - exactly one non-pick "Milk".
- C2 [test] The raw-milk germ fact:
  - a Milk watch_out matches /raw/i and /germ|Campylobacter|Listeria|Salmonella|E\. coli/i;
  - Milk sources include a cdc.gov or fda.gov URL that is in the archive.
- C3 [test] Excluded content:
  - no Milk spoken field matches the legality regex;
  - the umd URL and cornell 1240.61 are absent from `JSON.stringify(kb)`.
- C4 [test] Titles and pointers:
  - "Butter" and "Yogurt" each title exactly one non-pick;
  - no KB string contains "see Grass-fed butter", "see Plain vs. flavored yogurt" or "see Whole vs. reduced-fat milk".
- C5 [test] For every batch id:
  - the front is ≤14 words, with no hedge;
  - the tier_note passes rule 5 and is not pending;
  - lintCard and readability are `[]`;
  - the review headline equals the decision.
  - ESSENTIALS is unchanged.
- C6 [test] Rule 4 = 0 over the batch decision + tier_note.
- C7 [test] Every new URL on a batch id is archived, and ≥1 was checked.
- C8 `npm test` green (counterDecision.test.js:85 unedited); probe 0 wrong; dry-run 181.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic7b.test.js", "server/lib/counterDecision.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": [], "expected": "Devon's milk front verbatim", "test_name": "C1 the Milk front is Devon's ruling"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7b.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards/cdc-raw-milk.md"], "expected": "germ watch_out with archived CDC/FDA source", "test_name": "C2 raw milk germ fact is sourced"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 legality words, umd and 1240.61 absent", "test_name": "C3 no legality content and excluded sources absent"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7b.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": [], "expected": "Butter and Yogurt titled, 0 stale pointers", "test_name": "C4 Butter and Yogurt titles and pointers"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic7b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:95-110"], "expected": "batch fronts and why lines pass", "test_name": "C5 dairy fronts and why lines pass"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 rule-4 hits", "test_name": "C6 claim-lock rule 4"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic7b.test.js"], "dependents": ["server/lib/tryPool.test.js"], "allowed_reads": ["docs/sources/item-cards"], "expected": "≥1 new URL, 0 misses", "test_name": "C7 new URLs are archived"}
  ],
  "dependency_evidence": [
    {"source": "docs/sources/item-cards/cdc-raw-milk.md :139, :157, :159", "hits": ["CDC raw-milk germ list (Campylobacter, E. coli, Listeria, Salmonella)"]},
    {"source": "ic-1 C4 (a88ada6)", "hits": ["pins the whole_vs_reduced_fat_milk decision text and its word count"]},
    {"source": "server/lib/tryPool.test.js:101", "hits": ["excluded = new Set(['raw_milk', 'raw_kefir', 'raw_aged_cheese', 'sprouts_raw']) after 7a"]},
    {"source": "planner grep 'Grass-fed butter' in server/", "hits": ["list.js:94, listVoice.js:47 and KB 1124 are item names / cart_pick, not titles; untouched"]}
  ],
  "env": {"executables": ["node", "git", "grep"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-7b", "network": false}
}
```

## Acceptance server/test/acceptance/ic7b.test.js
```js
// IC-7b: dairy fronts, Devon's Milk ladder, "Butter" and "Yogurt" (docs/ITEM-CARDS-PLAN.md IC-7b). Written by the planner; do not edit.
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
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const LEGAL = /\b(il)?legal\b|\blaws?\b/i;
const MILK_FRONT = 'Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.';
const UMD = 'https://agrisk.umd.edu/post/the-raw-facts-let-s-talk-about-state-laws-regulating-raw-milk';
const BATCH = ['whole_vs_reduced_fat_milk', 'grassfed_butter', 'yogurt_plain_vs_flavored', 'raw_milk', 'ghee', 'plant_butter', 'plain_kefir', 'raw_kefir',
  'sour_cream', 'cottage_cheese', 'cream_cheese', 'cheese_real_vs_processed', 'raw_aged_cheese', 'goat_sheep_dairy', 'cream_vs_creamer', 'ice_cream',
  'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'dairy_case'];
const SPOKEN = ['title', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const strings = (e) => SPOKEN.flatMap((f) => [].concat(e?.[f] ?? [])).flatMap((x) => (typeof x === 'string' ? [x] : Object.values(x ?? {}).filter((v) => typeof v === 'string')));
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
const dir = join(ROOT, 'docs/sources/item-cards');
const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');

test('C1 the Milk front is Devon\'s ruling', () => {
  const m = now('whole_vs_reduced_fat_milk');
  assert.equal(m.decision, MILK_FRONT);
  assert.deepEqual(headlineHedge(m.decision), []);
  assert.match(m.tier_note, /raw|farmer/i);
  assert.match(m.tier_note, /low-temp|organic/i);
  assert.equal(nonPicksTitled('Milk').length, 1, 'non-pick "Milk" count');
});

test('C2 raw milk germ fact is sourced', () => {
  const m = now('whole_vs_reduced_fat_milk');
  assert.ok([].concat(m.watch_out ?? []).some((w) => /raw/i.test(w) && /germ|Campylobacter|Listeria|Salmonella|E\. coli/i.test(w)), 'no raw-milk germ watch_out');
  const gov = urls(m).filter((u) => /^https:\/\/www\.(cdc|fda)\.gov\//.test(u));
  assert.ok(gov.length >= 1, 'no CDC/FDA source on Milk');
  for (const u of gov) assert.ok(archive.includes(u), `${u} not archived`);
});

test('C3 no legality content and excluded sources absent', () => {
  for (const s of strings(now('whole_vs_reduced_fat_milk'))) assert.doesNotMatch(s, LEGAL, `Milk: ${s}`);
  const all = JSON.stringify(kb);
  assert.ok(!all.includes(UMD), 'umd raw-milk-law URL is in the KB');
  assert.ok(!all.includes('law.cornell.edu/cfr/text/21/1240.61'), '21 CFR 1240.61 is in the KB');
});

test('C4 Butter and Yogurt titles and pointers', () => {
  assert.equal(now('grassfed_butter').title, 'Butter');
  assert.equal(now('yogurt_plain_vs_flavored').title, 'Yogurt');
  assert.equal(nonPicksTitled('Butter').length, 1, 'non-pick "Butter" count');
  assert.equal(nonPicksTitled('Yogurt').length, 1, 'non-pick "Yogurt" count');
  const all = JSON.stringify(kb);
  for (const old of ['see Grass-fed butter', 'see Plain vs. flavored yogurt', 'see Whole vs. reduced-fat milk']) assert.ok(!all.includes(old), `stale pointer: ${old}`);
});

test('C5 dairy fronts and why lines pass', () => {
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
  let checked = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    if (id === 'whole_vs_reduced_fat_milk') for (const f of ['a2_vs_a1_milk', 'milk_processing']) for (const u of urls(pre(f))) was.add(u);
    for (const u of urls(now(id))) if (!was.has(u)) { checked++; assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`); }
  }
  assert.ok(checked >= 1, `only ${checked} new URLs checked`);
});
```

## ANCHOR server/kristy_perimeter_kb.json:1156
At 8a30d3d; 7a retitled it. Relocate by `grep -n '"id": "whole_vs_reduced_fat_milk"\|"id": "grassfed_butter"\|"id": "yogurt_plain_vs_flavored"'`.
```
    {
      "id": "whole_vs_reduced_fat_milk",
      "title": "Milk",
```

## ANCHOR server/kristy_perimeter_kb.json:1102
```
    {
      "id": "grassfed_butter",
      "title": "Grass-fed butter",
```

## ANCHOR server/kristy_perimeter_kb.json:1349
```
    {
      "id": "yogurt_plain_vs_flavored",
      "title": "Plain vs. flavored yogurt",
```

## ANCHOR docs/do-lines-review.md:58
```
| `whole_vs_reduced_fat_milk` | eggs_dairy | Whole milk. Everything else has been through another step. | Read the milkfat percentage on the panel, not the cap color. | — |
```
And `:61` `` | `yogurt_plain_vs_flavored` | eggs_dairy | Plain, big tub. Add your own fruit. | Take the big plain tub, not the single-serve fruit cups. | — | ``.

## ANCHOR docs/sources/item-cards/cdc-raw-milk.md:139
Read :135-:160 and quote the line that names the four germs in the claim-trace table. The planner cites the line numbers but did not copy their text; the builder reads them.

## ANCHOR server/lib/counterCardLint.js:99
TIER_NOTE_ORPHANED_PENDING. Relocate by grep. Remove `grassfed_butter` and `whole_vs_reduced_fat_milk` only.

## ANCHOR server/lib/tryPool.test.js:101
After 7a:
```
  const excluded = new Set(['raw_milk', 'raw_kefir', 'raw_aged_cheese', 'sprouts_raw']);
```

## Prerequisites
- **Env:** node ≥20, git, grep. No network, no Supabase writes.
- ic-7a is committed (Milk titled; three dairy ids folded).

## Answers
- **First read:** `grep -n '"id": "' server/kristy_perimeter_kb.json`. Suite ~1-3 min. Do not edit k14 C12.
- **ic-1 C4** already pins the milk decision text. If it and C1 disagree, STOP BLOCKED: both quote Devon.
- **passRule.**
  - Milk, Butter and Yogurt are ITEM_CARD_REWRITE: sources/watch_out may grow.
  - Audit ids that are not ITEM change only decision/tier_note, and only as passRule allows; otherwise STOP BLOCKED with the rule.
  - Numbers survive (the "2%/1%" label stays). evidence_tier is byte-identical.
- **counterDecision.test.js:85** (whole_vs or not, per 7a). The Milk why is untouched, so the regex should hold. If it fails, STOP BLOCKED; do not edit the test.
- **No-treatment.** The germ watch_out states what raw milk can carry and what pasteurization does. It says nothing about what milk does to a body.
- **Brands.** None in spoken text.
- **Run limits.**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not touch git.
  - Never delete an assertion without a replacement.
- **Report.** ≤30 lines:
  - READY/NOT READY;
  - npm count;
  - KEPT/REWRITTEN per id;
  - pointer sites (count);
  - the tryPool outcome;
  - whether raw_aged_cheese, raw_kefir or raw_milk carry legality wording (report it, do not change it);
  - a claim-trace table.
- Card commits end "Not migrated."

## Tried and rejected
- **A "where legal" qualifier on the front:** Devon ruled it out (the ToS covers it), and it would trip HEADLINE_HEDGED.
- **Citing the umd state-law page:** it is excluded by ruling.
- **Retitling "Grass-fed butter" in list.js/listVoice.js:** those are item names, not card titles.
