# ic-5b — Meat fronts: "Beef" and "Steak" item cards, judging front, meat audit, three pending why lines

```json
{
  "id": "ic-5b",
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
    "server/lib/counterCardLint.js:444-540",
    "server/lib/counterDecision.test.js:80-95",
    "docs/sources/item-cards"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic5b.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-5a is committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe.
Plan: `docs/ITEM-CARDS-PLAN.md` IC-5b, D1 (front = `decision`, why line = `tier_note`), claim-lock rules 1-5.

## Alignment block
- **Done means:**
  - **Beef card.** beef_grassfed_vs_grainfed is titled "Beef" with decision "100% grass-fed and grass-finished." and carries the 4 archived grass-fed URLs.
  - **Other titles.** beef_cuts_basics is titled "Steak". Exactly one non-pick entry carries each new title.
  - **Pointers.** No KB string contains "see Grass-fed vs. grain-fed beef"; every such pointer reads "How it was raised: see Beef.".
  - **Batch fronts and tier_notes.** For every batch id:
    - the decision is ≤14 words, with no hedge;
    - the tier_note is one sentence of ≥5 words, not the tier name, has no first person, and is unique;
    - lint and readability return `[]`;
    - the review headline equals the decision.
  - **Pending list.** butcher_counter_asking, organ_meats and venison_game have left TIER_NOTE_ORPHANED_PENDING.
  - **Regressions.** counterDecision.test.js:85 passes unedited, and the suite and probe are green.
- **Out of scope:**
  - folds;
  - aliases and asked_as;
  - count pins (186);
  - kristy-ios titles (flagged only);
  - any lint loosening.
- **OK rough edges:**
  - audit ids that already pass stay KEPT;
  - "Steak" sits over a card that also covers roasts and stew cuts (title is the dominant buy);
  - lint-driven rewording within the same facts is logged.
- **Ship bar:**
  - an untraced claim or a URL not in `docs/sources/item-cards/*.md`;
  - a stale beef pointer;
  - judging's front loses its oxygen/colour fact;
  - an ESSENTIALS change;
  - a rule-4 hit;
  - a brand name.
- **Independent check:**
  - ic5b C7 counts ≥4 newly cited URLs, every one grep-present in the archive;
  - C3 runs a string search over the whole KB.

**Batch ids:**
- **Rewritten:** beef_grassfed_vs_grainfed, beef_cuts_basics, judging_meat_at_the_case, butcher_counter_asking, organ_meats, venison_game.
- **Audit (rewrite on failure only, report KEPT/REWRITTEN):** ground_beef_organ_blend, ground_beef_lean_ratio, bison, lamb_goat, pork_cuts_and_enhanced, bacon, cured_pork, ham, hot_dogs, deli_meat_uncured.

## Change
| id | change |
| --- | --- |
| beef_grassfed_vs_grainfed | title `Grass-fed vs. grain-fed beef` → `Beef`; decision → `100% grass-fed and grass-finished.`; tier_note → `Grass-fed alone does not promise a grass finish, so the whole-life words decide.`; add sources (step 2) |
| beef_cuts_basics | title `Beef cuts` → `Steak`; decision/tier_note only if C5 fails, from on-card sentences (grade/marbling/cut-to-cook facts moved in by ic-5a) |
| judging_meat_at_the_case | decision drafted from on-card sentences, must still match `/oxygen/i` or `/colou?r/i` [PLACEHOLDER draft: `Judge colour by cut and packaging, then check the date.`]; tier_note one sentence from its oxygen/colour fact |
| butcher_counter_asking | tier_note → `Asking how it was raised and when it was cut is a shopping habit, not a meat claim.` |
| organ_meats | tier_note → `The 1 to 2 day cook window and 160°F come from USDA handling guidance for organ meats.` (only if both numbers are on the card; else use the card's own numbers) |
| venison_game | tier_note → `Refrigerated processing and fat trimming are extension steps written for deer and elk venison.` |

1. **Pointers.** Replace every `How it was raised: see Grass-fed vs. grain-fed beef.` in the KB with `How it was raised: see Beef.`. At 8a30d3d they sat at KB 292, 451, 512 and 2935, plus any copy ic-5a moved; find them by grep.
   - OWNED_FACTS ownerTitle comes from the KB title, so the pointer lint follows the retitle automatically.
   - Do not edit the `beef_raising` row.
2. **Sources.** beef_grassfed_vs_grainfed is ITEM_CARD_REWRITE, so its sources may grow. Append these four sources in the card's existing source shape (string or `{url,...}`, whichever its sources use). All four are verbatim in `docs/sources/item-cards/*.md`; grep each before adding:
   - `https://www.ams.usda.gov/rules-regulations/withdrawal-united-states-standards-livestock-and-meat-marketing-claims`
   - `https://www.govinfo.gov/content/pkg/FR-2016-01-12/pdf/2016-00440.pdf`
   - `https://www.americangrassfed.org/about-us/our-standards/` (aga-standards-text.md:50 "Animals are fed only grass and forage from weaning until harvest.")
   - `https://agreenerworld.org/wp-content/uploads/2020/08/Certified-Grassfed-Standards-2020-v1.pdf`
3. **Pending list.** `server/lib/counterCardLint.js` TIER_NOTE_ORPHANED_PENDING (:99-105): remove `butcher_counter_asking`, `organ_meats` and `venison_game`. Keep the export, and keep the other members.
4. **Audit ids.** Print the C5 failures first, then rewrite the failing decision/tier_note from the card's own sentences.
   - ground_beef_organ_blend's tier_note is two sentences; make it one, keeping its facts.
   - Report KEPT/REWRITTEN for each audit id.
5. **Review table.** In `docs/do-lines-review.md`, set the headline of each batch id → the KB decision. Touch the do column only on HEADLINE_DO_MAX (28) / OBSERVABLE_IN_BOTH.
6. **Rebuild.** `node scripts/buildDoLines.js`.
7. **Lint rejections.**
   - If lint rejects Devon's beef front verbatim, STOP BLOCKED with the lint code.
   - Any other rejected draft is reworded within the same facts and logged.

## Criteria
- C1 [test] beef_grassfed_vs_grainfed:
  - title "Beef";
  - decision verbatim;
  - tier_note names the finish;
  - exactly one non-pick "Beef".
- C2 [test] beef_cuts_basics:
  - title "Steak";
  - exactly one non-pick "Steak";
  - judging's front matches /oxygen|colou?r/i.
- C3 [test] No KB string contains "see Grass-fed vs. grain-fed beef"; ≥1 string contains "How it was raised: see Beef.".
- C5 [test] For every batch id:
  - the front is ≤14 words, with no hedge;
  - the tier_note passes rule 5 and is not pending;
  - lintCard and readability are `[]`;
  - the review headline equals the decision.
  - ESSENTIALS is unchanged.
- C6 [test] Rule 4 = 0 over the batch decision + tier_note.
- C7 [test] Every new URL on a batch id is in `docs/sources/item-cards/*.md`; ≥4 new URLs were checked; the 4 grass-fed URLs are on the Beef card.
- C8 `npm test` is green (including counterDecision.test.js:85, unedited); probe 0 wrong; dry-run 186.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5b.test.js", "server/lib/counterDecision.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": ["server/kristy_perimeter_kb.json"], "expected": "Beef front verbatim", "test_name": "C1 the Beef card"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5b.test.js"], "dependents": [], "allowed_reads": [], "expected": "Steak title, judging keeps its colour fact", "test_name": "C2 Steak and judging"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5b.test.js"], "dependents": ["server/lib/counterCardLint.js"], "allowed_reads": [], "expected": "0 stale beef pointers", "test_name": "C3 beef pointers follow the retitle"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json", "server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic5b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:95-110"], "expected": "batch fronts and why lines pass", "test_name": "C5 meat fronts and why lines pass"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 rule-4 hits", "test_name": "C6 claim-lock rule 4"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic5b.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "≥4 new URLs, 0 misses", "test_name": "C7 new URLs are archived"}
  ],
  "dependency_evidence": [
    {"source": "planner grep 'see Grass-fed vs. grain-fed beef' in KB, 8a30d3d", "hits": ["KB 292 ground_beef_organ_blend", "KB 451 beef_cuts_basics", "KB 512 ground_beef_lean_ratio", "KB 2812 beef_grades_usda (retired by ic-5a)", "KB 2935 judging_meat_at_the_case", "KB 8092 meat_case (retired by ic-5a)"]},
    {"source": "planner grep of the 4 grass-fed URLs in docs/sources/item-cards", "hits": ["all 4 present; aga-standards-text.md:50 quote"]},
    {"source": "server/lib/counterDecision.test.js:85", "hits": ["asserts evidence_tier kristys_standard and decision+why matching /whole-food standard|not settled science|preference|not a health verdict|not a claim/ for beef_grassfed_vs_grainfed"]}
  ],
  "env": {"executables": ["node", "git"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-5b", "network": false}
}
```

## Acceptance server/test/acceptance/ic5b.test.js
```js
// IC-5b: meat fronts, "Beef" and "Steak" (docs/ITEM-CARDS-PLAN.md IC-5b). Written by the planner; do not edit.
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
const BATCH = ['beef_grassfed_vs_grainfed', 'beef_cuts_basics', 'judging_meat_at_the_case', 'butcher_counter_asking', 'organ_meats', 'venison_game',
  'ground_beef_organ_blend', 'ground_beef_lean_ratio', 'bison', 'lamb_goat', 'pork_cuts_and_enhanced', 'bacon', 'cured_pork', 'ham', 'hot_dogs', 'deli_meat_uncured'];
const GRASS_URLS = [
  'https://www.ams.usda.gov/rules-regulations/withdrawal-united-states-standards-livestock-and-meat-marketing-claims',
  'https://www.govinfo.gov/content/pkg/FR-2016-01-12/pdf/2016-00440.pdf',
  'https://www.americangrassfed.org/about-us/our-standards/',
  'https://agreenerworld.org/wp-content/uploads/2020/08/Certified-Grassfed-Standards-2020-v1.pdf',
];
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);

test('C1 the Beef card', () => {
  const b = now('beef_grassfed_vs_grainfed');
  assert.equal(b.title, 'Beef');
  assert.equal(b.decision, '100% grass-fed and grass-finished.');
  assert.match(b.tier_note, /finish/i);
  assert.equal(nonPicksTitled('Beef').length, 1, 'non-pick "Beef" count');
});

test('C2 Steak and judging', () => {
  assert.equal(now('beef_cuts_basics').title, 'Steak');
  assert.equal(nonPicksTitled('Steak').length, 1, 'non-pick "Steak" count');
  assert.match(now('judging_meat_at_the_case').decision, /oxygen|colou?r/i, 'judging front lost its colour fact');
});

test('C3 beef pointers follow the retitle', () => {
  const all = JSON.stringify(kb);
  assert.ok(!all.includes('see Grass-fed vs. grain-fed beef'), 'stale beef pointer');
  assert.ok(all.includes('How it was raised: see Beef.'), 'no repointed beef pointer');
});

test('C5 meat fronts and why lines pass', () => {
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
  let checked = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) if (!was.has(u)) { checked++; assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`); }
  }
  assert.ok(checked >= 4, `only ${checked} new URLs checked`);
  const beef = urls(now('beef_grassfed_vs_grainfed'));
  for (const u of GRASS_URLS) assert.ok(beef.includes(u), `Beef card lacks ${u}`);
});
```

## ANCHOR server/kristy_perimeter_kb.json:195
At 8a30d3d; relocate by `grep -n '"id": "beef_grassfed_vs_grainfed"'`.
```
    {
      "id": "beef_grassfed_vs_grainfed",
      "title": "Grass-fed vs. grain-fed beef",
```

## ANCHOR server/kristy_perimeter_kb.json:400
```
    {
      "id": "beef_cuts_basics",
      "title": "Beef cuts",
```

## ANCHOR server/kristy_perimeter_kb.json:292
The pointer sentence, verbatim (one line per site). Find every site by `grep -n 'see Grass-fed vs. grain-fed beef' server/kristy_perimeter_kb.json`.
```
How it was raised: see Grass-fed vs. grain-fed beef.
```

## ANCHOR server/lib/counterCardLint.js:99
TIER_NOTE_ORPHANED_PENDING. Relocate it by `grep -n 'TIER_NOTE_ORPHANED_PENDING' server/lib/counterCardLint.js`. Its members at 8a30d3d are:
- grassfed_butter, whole_vs_reduced_fat_milk;
- label_made_with_real, label_organic_scope, label_lightly_sweetened;
- butcher_counter_asking, revive_greens, olive_oil_grades, bottled_water_buying;
- label_ingredient_order, label_third_party_seals, label_artificial_color;
- organ_meats, venison_game, crab, tea.

Remove only the three meat ids.

## Prerequisites
- **Env:** node ≥20, git on PATH. No network, no Supabase writes.
- ic-5a is committed (both meat folds are absent).

## Answers
- **First read:** `grep -n '"id": "' server/kristy_perimeter_kb.json`. Suite ~1-3 min.
- **passRule.**
  - beef_grassfed_vs_grainfed and judging are ITEM_CARD_REWRITE: sources may grow.
  - beef_cuts_basics is HEALTH_FIRST (or ITEM, if ic-5a added it); sources stay as they are.
  - Numbers in old rewritable text survive.
  - evidence_tier stays byte-identical.
- **counterDecision.test.js:85.** decision+why of the Beef card must still match `/whole-food standard|not settled science|preference|not a health verdict|not a claim/`. The why is untouched, so this should hold. If it fails, STOP BLOCKED; do not edit the test.
- **Brands.** No brand names: American Grassfed and A Greener World are cited as sources only, never named in spoken text.
- **Uniqueness.** tier_note uniqueness is exact-string.
- **iOS.** Run `grep -rn -E 'Grass-fed vs. grain-fed beef|Beef cuts' /Users/m1/kristy-ios --include=*.swift`. Report the hits; do not edit them.
- **Run limits.**
  - Hard cap 60 min. BLOCKED after 3 identical failures.
  - Do not touch git.
  - Never delete an assertion without a replacement.
- **Report.** ≤30 lines:
  - READY/NOT READY;
  - npm count;
  - KEPT/REWRITTEN per audit id;
  - pointer sites changed (count);
  - a claim-trace table.
- Card commits end "Not migrated."

## Tried and rejected
- **Title "Grass-fed beef":** it puts the ladder's answer in the title, and the pointer would re-point twice.
- **Citing the archived law text for the grass-fed definition:** the AMS withdrawal shows there is no federal definition. The tier_note states the finish gap; it claims no legal standard.
