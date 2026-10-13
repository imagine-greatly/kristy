# ic-3b — Produce fronts (skin rule on every item) and the new Bananas card

```json
{
  "id": "ic-3b",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "docs/do-lines-review.md",
    "server/lib/doLines.json",
    "server/lib/counterCardLint.js",
    "server/test/counterProbe48.test.js",
    "server/test/ktight.test.js",
    "server/test/healthFirst.test.js",
    "server/lib/counterCardLint.test.js"
  ],
  "read_full": [
    "docs/ITEM-CARDS-PLAN.md:57-73",
    "server/kristy_perimeter_kb.json:705-788",
    "server/kristy_perimeter_kb.json:3662-3730",
    "server/kristy_perimeter_kb.json:5412-6200",
    "server/kristy_perimeter_kb.json:7375-7486",
    "server/test/acceptance/passRule.js",
    "server/lib/counterCardLint.js:444-540",
    "docs/sources/item-cards/ucdavis-banana.md:90-175",
    "docs/sources/item-cards/produce-business-retailers-have-a-gas.md:105-140",
    "docs/sources/item-cards/ewg-clean-fifteen-2026.md:70-145",
    "docs/sources/item-cards/ewg-dirty-dozen-2026.md:70-140",
    "docs/sources/item-cards/ewg-methodology.md:100-110"
  ],
  "verify": "cd /Users/m1/kristy/server && node scripts/buildDoLines.js && node --test test/acceptance/ic3b.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main`, after ic-3a is committed and main has re-anchored k14 C12. Route: dv T2 (fallback forge@opus [T2]), critic@opus FIDELITY. P1. Not parallel-safe.
Plan: `docs/ITEM-CARDS-PLAN.md` IC-3b, D1 (front = `decision`, why line = `tier_note`), claim-lock rules 1-5, accuracy concern 1 (bananas).

## Alignment block (plan verbatim plus the IC-3b extras)
- **Done means:** Given each batch id, decision is a cart rule ≤14 words and tier_note passes claim-lock rule 5. The do-lines row and doLines.json agree. Lint clean, `npm test` green, `listMatchProbe.js` 0 wrong, counterReach and counterFloor pass. A claim-trace table has one row per new sentence. Extra: every produce item id below has decision or tier_note matching `/\b(organic|conventional)\b/i`, and the stated kind agrees with the residue row (table below). "bananas", "green bananas", "how do i ripen bananas" and "are bananas worth buying organic" land on produce_bananas (≥3 asked_as, ≥1 alias hit). organic_worth_it_by_type decision is "Organic on anything you eat the skin of, conventional on what you peel." verbatim.
- **Out of scope:** folds (done in ic-3a); kind='home' cards (washing_produce, baking_soda_soak, revive_greens, freezing_produce, produce_storage); list.js picks (the `bananas` pick stays a pick); any `evidence_tier` change on an existing card.
- **OK rough edges:** an audited card left unchanged because it already passes; a dropped fact named in the report; broccoli and beets carry no residue call (neither residue list names them; the skin rule covers them on the Produce card).
- **Ship bar:** an untraced claim; an ESSENTIALS id retired or reordered; any rule-4 hit; an existing safety or freshness sentence deleted; a banana sentence saying or implying that yellow bananas are ripened differently from green ones; any "resistant starch" line.
- **Independent check:** S7 word count: decision ≤14 on every batch id (ic3b C5). Rule-4 grep over changed fields = 0 (ic3b C6). Every new URL is in `docs/sources/item-cards` (ic3b C7).

Batch ids: organic_worth_it_by_type, berries_picking, produce_ripeness_by_item (audit), produce_apples_pears, produce_citrus, produce_peppers, produce_leafy_greens, produce_root_vegetables, produce_brassicas, produce_onions_garlic, produce_green_beans, produce_mushrooms, produce_stone_fruit, produce_bananas (new), and audit-only sprouts_raw, precut_produce_tradeoffs, produce_seasonality, frozen_vs_fresh_produce.

## Residue rows (the only allowed residue calls)
| id | kind | archive line |
| --- | --- | --- |
| produce_apples_pears | organic | ewg-dirty-dozen-2026.md:80 (apples, pears on the Dirty Dozen) |
| produce_leafy_greens | organic | ewg-dirty-dozen-2026.md:80 (spinach; kale, collard and mustard greens) |
| produce_stone_fruit | organic | ewg-dirty-dozen-2026.md:80 (nectarines, peaches, cherries) |
| berries_picking | organic | ewg-dirty-dozen-2026.md:80 (strawberries, blackberries, blueberries) |
| produce_root_vegetables | both: organic potatoes, conventional carrots | dirty-dozen:80 (potatoes); ewg-clean-fifteen-2026.md:83-142 (carrots) |
| produce_brassicas | conventional (cabbage, cauliflower) | clean-fifteen:83-142 |
| produce_onions_garlic | conventional | clean-fifteen:83-142 (onion) |
| produce_mushrooms | conventional | clean-fifteen:83-142 (mushrooms) |
| produce_bananas | conventional | clean-fifteen:83-142 (bananas, #12); ewg-methodology.md:107 (peeled) |
| produce_citrus | conventional, organic for zest | skin rule (on neither list); usda-pdp-annual-summary-2024.md:927 (oranges peeled) |
| produce_peppers | organic | skin rule only (on neither list): no residue sentence |
| produce_green_beans | organic | skin rule only: no residue sentence |

The allowed form is "USDA testing finds more residue on X" or "X sits on the low-residue list from USDA testing". Never exposure, risk, body effects or "contaminated". `evidence_tier` stays as it is on every existing card (passRule FROZEN); the tier_note carries the residue reason.

## Change
1. **organic_worth_it_by_type** (KB 706): `"title": "When organic produce is worth it"` → `"Produce"`. `"decision": "Organic where the skin gets eaten. Conventional on anything peeled."` → `"Organic on anything you eat the skin of, conventional on what you peel."`. Remove aliases `"bananas"` and `"banana"` (:721-722; produce_bananas carries them after this change, which ic-1's ITEM_CARD_REWRITE allows). Keep the tier_note unless lint flags it. In `detail` (:742) `the peel carries the exposure` → `the peel carries the residue` (rule 4; same claim). do-lines-review row :50: headline column → the new decision; do column unchanged.
2. **Fronts.** For each id: decision → the draft (≤14 words, no hedge per `headlineHedge`), tier_note → the draft, add the listed source URLs (bare URL strings, the style of produce_mushrooms :7395). Update the do-lines-review headline column to the new decision; leave the do column unless HEADLINE_DO_MAX (28) or OBSERVABLE_IN_BOTH fires. Drafts may be reworded only within the same facts.

| id | old decision | new decision | new tier_note | add sources |
| --- | --- | --- | --- | --- |
| produce_apples_pears | Unbruised and undamaged. One spoiled fruit rots its neighbors faster. | Organic apples and pears, unbruised. One spoiled fruit rots its neighbors faster. | USDA testing finds more residue on apples and pears, and their skin gets eaten. | https://www.ewg.org/foodnews/dirty-dozen.php |
| produce_leafy_greens | Crisp, even color, no wilt, yellowing, or decay. | Organic greens, crisp and evenly colored, with no wilt or yellowing. | Spinach and kale top the high-residue list from USDA testing, and every leaf gets eaten. | dirty-dozen URL |
| produce_stone_fruit | Unbruised and undamaged, with the skin color fully turned. | Organic stone fruit, unbruised, with the skin color fully turned. | USDA testing finds more residue on peaches, nectarines and cherries, all eaten skin-on. | dirty-dozen URL |
| berries_picking | The carton’s underside decides, not the berries on top. | Organic berries, and the carton’s underside decides, not the top. | Strawberries, blackberries and blueberries all sit high on the residue list from USDA testing. | dirty-dozen URL |
| produce_root_vegetables | Buy firm roots. Skip anything soft, shriveled, or sprouting. | Organic potatoes, conventional carrots. Firm roots, nothing soft or sprouting. | Potatoes rank high for residue in USDA testing and carrots rank low, so the bag decides. | dirty-dozen URL, https://www.ewg.org/foodnews/clean-fifteen.php |
| produce_brassicas | Dark green, tight, and unbruised. Soft or slippery is spoilage. | Conventional is fine on cabbage and cauliflower. Tight heads, no soft spots. | Cabbage and cauliflower both sit on the low-residue list from USDA testing. | clean-fifteen URL |
| produce_onions_garlic | Firm and dry with papery skins, and nothing sprouting or moldy. | Conventional is fine. Firm and dry, papery skins, nothing sprouting or moldy. | Onions sit on the low-residue list from USDA testing, and the papery skin comes off. | clean-fifteen URL |
| produce_mushrooms | Dry, firm mushrooms with no dark spots. | Conventional is fine. Dry, firm mushrooms with no dark spots. | Mushrooms sit on the low-residue list from USDA testing, so plain ones earn the cart. | clean-fifteen URL |
| produce_citrus | Firm and smooth, free of decay, drying, or shriveling. | Conventional citrus, organic for zest. Firm, smooth, no drying or shriveling. | USDA tests oranges with the peel off, so organic only earns its place when the zest goes in. | https://www.ams.usda.gov/sites/default/files/media/PDPAnnualSummary.pdf |
| produce_peppers | Firm and evenly colored, free of cracks, decay, or sunburn. | Organic peppers, firm and evenly colored, with no cracks or soft spots. | The skin of a pepper gets eaten, so the skin rule puts peppers in organic. | none |
| produce_green_beans | Smooth, crisp, slender pods with no bulging seeds. | Organic beans with smooth, crisp, slender pods and no bulging seeds. | The whole pod gets eaten, so green beans follow the skin rule to organic. | none |

   The replaced tier_notes are evidence commentary, not safety or freshness instructions; every freshness check they named stays on decision, the do line or buying_tips. If lint rejects a draft (REPEATED_CLAIM against `why`, ORPHANED, HEADLINE_DO_MAX), reword inside the same facts and log it in the claim-trace table.
3. **Audit only:** produce_ripeness_by_item, sprouts_raw, precut_produce_tradeoffs, produce_seasonality, frozen_vs_fresh_produce. Rewrite decision or tier_note only if it fails Done means (>14 words, hedge, rule 5). Report each id KEPT or REWRITTEN.
4. **NEW produce_bananas**, inserted right after produce_mushrooms (KB :7430), with exactly the produce_mushrooms field set plus asked_as. `evidence_tier: "established"`. Drafts (every sentence ≤20 words; short_answer ≤40 words):
   - title `Bananas`; category `produce`; question `How do you buy and ripen bananas?`
   - aliases `["bananas", "banana", "green bananas", "ripe bananas", "organic bananas", "ripen bananas", "ripening bananas"]`
   - decision `Buy them green and let them ripen on your counter.` (Devon, plan :59)
   - why `Fruit ripened on the plant often splits and has poor texture, so bananas are cut green.` (ucdavis-banana:97)
   - short_answer `Buy bananas green or just turning and let them ripen on the counter. They get sweeter as the green fades. Conventional is fine: bananas sit on the low-residue list, and the peel comes off.` (ucdavis:97, :104; clean-fifteen #12; methodology:107)
   - detail, one sentence each: `Bananas are harvested mature-green and ripened at the market end, since fruit ripened on the plant often splits.` (ucdavis:97) `Nearly every supermarket banana, green or yellow, goes through a ripening room.` (produce-business:136) `The ripening runs on the fruit's own ethylene.` (produce-business:111) `UC Davis ripens them at 59 to 68°F, and cold below 56°F can stop a green banana ripening at all.` (ucdavis:121, :168) `EWG's Clean Fifteen ranks bananas 12th for low pesticide residue, from USDA data.` (clean-fifteen:76 and list) `That testing is done on the peeled fruit, the part that gets eaten.` (methodology:107)
   - sources `["https://postharvest.ucdavis.edu/produce-facts-sheets/banana", "https://producebusiness.com/retailers-have-a-gas/", "https://www.ewg.org/foodnews/clean-fifteen.php", "https://www.ewg.org/foodnews/methodology.php"]`
   - kristy_take `Let the counter finish the ripening. Conventional is fine here, since the peel comes off.`
   - cart_pick `Green or just-turning bananas`
   - buying_tips `["Take the greenest bunch for the week; it keeps ripening at home.", "Keep green bananas out of the fridge. Cold below 56°F can stop them ripening.", "Pass on fruit with skin splits or dark streaks."]` (ucdavis:168, :213)
   - watch_out `["Green and yellow bananas go through the same ripening rooms. The color only shows how far along they are.", "A banana dropped hard can brown inside with no mark on the skin."]` (produce-business:136; ucdavis:172)
   - pick_steps `["Take a bunch that is still green or just turning.", "Pass on any with skin splits or dark streaks.", "Keep them on the counter, out of the fridge."]`
   - science `Bananas are cut mature-green because fruit ripened on the plant splits and loses texture. Ripening runs on the fruit's own ethylene, and the fruit gets sweeter as it goes. Cold below 56°F can stop a green banana ripening at all.`
   - labels_decoded `[{"term": "Ripening room", "meaning": "Where nearly every supermarket banana is ripened after shipping, green ones included."}]`
   - tier_note `Conventional is fine on green bananas: they rank low for residue, tested with the peel off.`
   - asked_as `["how do i ripen bananas", "are bananas worth buying organic", "should i buy green bananas", "how do i pick bananas"]`
   - do-lines-review row after the produce_green_beans row (:132): `` | `produce_bananas` | produce | Buy them green and let them ripen on your counter. | Take a bunch that is still green and keep it out of the fridge. | — | ``
   Never use the words "starch", "sugar", "gassed", "chemically" or "resistant" on this card (macroGuard, accuracy concern 1).
5. `server/lib/counterCardLint.js`: remove every batch id from `TIER_NOTE_ORPHANED_PENDING` (ic-1). If one still fails the raw rule, rewrite its tier_note instead of keeping it pending.
6. `server/test/counterProbe48.test.js:41` `['bananas', 'organic_worth_it_by_type'],` → `['bananas', 'produce_bananas'],`. If the list door returns the `bananas` pick instead, use the 3-tuple form `['bananas', 'produce_bananas', '<observed>']` and report it.
7. Count pins: the ic-3a values `195` → `196` at `server/test/ktight.test.js:37` (question entries) only; `:40` (batched ids) stays 195 because produce_bananas carries pick_steps and science (ktight T1 at :52) and is not batched. `server/test/healthFirst.test.js:19` → 196. `server/lib/counterCardLint.test.js` `assert.equal(CARDS.length, 195)` → `196`, history line `// IC-3b adds 1: produce_bananas (2026-10-14).`
8. `node scripts/buildDoLines.js` from `server/`.

## Criteria
- C1 [test] The Produce hub: title "Produce", decision verbatim, no "banana"/"bananas" alias; produce_bananas carries both.
- C2 [test] produce_bananas has the produce_mushrooms field set, ≥3 asked_as, non-empty pick_steps and science, evidence_tier "established", and a doLines entry.
- C3 [test] "bananas", "green bananas", "how do i ripen bananas", "are bananas worth buying organic" pass `inScope`, are admitted, and score produce_bananas first.
- C4 [test] Each residue-row id: decision + tier_note match the row's kind; conventional ids do not open with "Organic"; organic ids do not say "conventional".
- C5 [test] Every batch id: decision ≤14 words, no `headlineHedge` hit, tier_note is one sentence of ≥5 words with no first person, not equal to the tier name, unique in the corpus, not in TIER_NOTE_ORPHANED_PENDING; `lintCard(projectEntry(e,{doLine}))` and `readability(e)` are `[]`; the do-lines-review headline column equals the KB decision.
- C6 [test] Rule 4 = 0 over decision and tier_note of every batch id and over every spoken field of produce_bananas; produce_bananas has no /starch|sugar|gassed|chemically|resistant/i.
- C7 [test] Every URL in sources of a batch id that was not on that card at 663ca3d appears verbatim in a `docs/sources/item-cards/*.md` file.
- C8 ESSENTIALS unchanged; `npm test` green except k14 C12; probe 0 wrong; dry-run 196 cards.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3b.test.js"], "dependents": ["server/test/acceptance/k5.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json:705-788"], "expected": "hub retitled, front verbatim, banana aliases moved", "test_name": "C1 the Produce hub"},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/ic3b.test.js", "server/test/ktight.test.js"], "dependents": ["server/test/healthFirst.test.js", "server/lib/counterCardLint.test.js"], "allowed_reads": ["server/kristy_perimeter_kb.json:7375-7430"], "expected": "card born compliant", "test_name": "C2 produce_bananas is a full card"},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3b.test.js", "server/test/counterProbe48.test.js"], "dependents": ["server/scripts/listMatchProbe.js", "server/lib/pickReach.test.js"], "allowed_reads": ["server/test/counterProbe48.test.js:13-62"], "expected": "4 asks land on produce_bananas", "test_name": "C3 banana asks land on produce_bananas"},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3b.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "each front agrees with its residue row", "test_name": "C4 fronts agree with the residue rows"},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json", "server/lib/counterCardLint.js", "docs/do-lines-review.md"], "tests": ["server/test/acceptance/ic3b.test.js"], "dependents": ["server/lib/counterCardLint.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:444-540"], "expected": "fronts are cart rules, why lines pass rule 5", "test_name": "C5 fronts and why lines pass"},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3b.test.js"], "dependents": [], "allowed_reads": [], "expected": "0 rule-4 hits", "test_name": "C6 claim-lock rule 4"},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/ic3b.test.js"], "dependents": [], "allowed_reads": ["docs/sources/item-cards"], "expected": "0 URL misses", "test_name": "C7 new URLs are archived"}
  ],
  "dependency_evidence": [
    {"source": "grep banana over server/ excluding the KB (planner, 2026-10-14)", "hits": ["counterProbe48.test.js:41 (repoint)", "listImport.js:102 and list.js:332 (bananas pick, unchanged)", "listMatchProbe.js:280 and pickReach.test.js:30 (word lists, run only)", "macroGuard.test.js:28 (calorie ask, unaffected)", "doLines.json:152 produce_storage (prose)"]},
    {"source": "grep for pointers to the old titles", "hits": ["none outside fixtures/kb-pre-readability.json"]}
  ],
  "env": {"executables": ["node", "git"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-3b", "network": false}
}
```

## Acceptance server/test/acceptance/ic3b.test.js
```js
// IC-3b: produce fronts and produce_bananas (docs/ITEM-CARDS-PLAN.md IC-3b). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'labels_decoded', 'cart_pick', 'question'];
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const ROWS = {
  produce_apples_pears: 'organic', produce_leafy_greens: 'organic', produce_stone_fruit: 'organic', berries_picking: 'organic',
  produce_peppers: 'organic', produce_green_beans: 'organic', produce_root_vegetables: 'both',
  produce_brassicas: 'conventional', produce_onions_garlic: 'conventional', produce_mushrooms: 'conventional',
  produce_bananas: 'conventional', produce_citrus: 'conventional',
};
const BATCH = [...Object.keys(ROWS), 'organic_worth_it_by_type', 'produce_ripeness_by_item', 'sprouts_raw',
  'precut_produce_tradeoffs', 'produce_seasonality', 'frozen_vs_fresh_produce'];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};

test('C1 the Produce hub', () => {
  const h = now('organic_worth_it_by_type');
  assert.equal(h.title, 'Produce');
  assert.equal(h.decision, 'Organic on anything you eat the skin of, conventional on what you peel.');
  for (const a of ['banana', 'bananas']) {
    assert.ok(!h.aliases.includes(a), `hub still carries "${a}"`);
    assert.ok(now('produce_bananas').aliases.includes(a), `produce_bananas lacks "${a}"`);
  }
});

test('C2 produce_bananas is a full card', () => {
  const b = now('produce_bananas');
  assert.ok(b, 'produce_bananas missing');
  assert.equal(b.title, 'Bananas');
  assert.equal(b.decision, 'Buy them green and let them ripen on your counter.');
  assert.equal(b.evidence_tier, 'established');
  for (const f of Object.keys(now('produce_mushrooms'))) assert.ok(b[f] !== undefined && b[f] !== '', `field ${f} missing`);
  nonEmpty(b.asked_as, 'banana asks', 3);
  nonEmpty(b.pick_steps, 'banana pick_steps', 2);
  assert.ok(String(b.science).length > 40, 'science present');
  assert.equal(typeof doLines.produce_bananas, 'string');
  assert.equal(pre('produce_bananas'), undefined, 'the card is new');
});

test('C3 banana asks land on produce_bananas', () => {
  for (const q of ['bananas', 'green bananas', 'how do i ripen bananas', 'are bananas worth buying organic']) {
    assert.equal(inScope(q).ok, true, `"${q}" refused`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, 'produce_bananas', `"${q}" -> ${top?.entry.id}`);
  }
});

test('C4 fronts agree with the residue rows', () => {
  for (const [id, kind] of Object.entries(ROWS)) {
    const e = now(id);
    const text = `${e.decision} ${e.tier_note}`;
    assert.match(text, /\b(organic|conventional)\b/i, `${id} names neither`);
    if (kind === 'organic') {
      assert.match(text, /\borganic\b/i, id);
      assert.doesNotMatch(text, /\bconventional\b/i, id);
    }
    if (kind === 'conventional') {
      assert.match(text, /\bconventional\b/i, id);
      assert.doesNotMatch(e.decision, /^organic\b/i, id);
    }
    if (kind === 'both') assert.match(text, /organic[\s\S]*conventional|conventional[\s\S]*organic/i, id);
  }
});

test('C5 fronts and why lines pass', () => {
  const notes = kb.entries.map((e) => e.tier_note).filter(Boolean);
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
    assert.equal(notes.filter((x) => x.trim() === n).length, 1, `${id} tier_note not unique`);
    assert.ok(!TIER_NOTE_ORPHANED_PENDING.has(id), `${id} still pending`);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lint`);
    assert.deepEqual(readability(e), [], `${id} readability`);
    assert.equal(reviewHeadline(id), e.decision, `${id} do-lines-review headline differs from the KB decision`);
  }
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C6 claim-lock rule 4', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.doesNotMatch(`${e.decision} ${e.tier_note}`, RULE4, `${id} front or why line`);
  }
  const b = JSON.stringify(SPOKEN.map((f) => now('produce_bananas')[f] ?? ''));
  assert.doesNotMatch(b, RULE4);
  assert.doesNotMatch(b, /starch|sugar|gassed|chemically|resistant/i);
});

test('C7 new URLs are archived', () => {
  const dir = join(ROOT, 'docs/sources/item-cards');
  const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
  let checked = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) {
      if (was.has(u)) continue;
      checked++;
      assert.ok(archive.includes(u), `${id}: ${u} is not in docs/sources/item-cards`);
    }
  }
  assert.ok(checked >= 4, `only ${checked} new URLs checked`);
});
```

## ANCHOR server/kristy_perimeter_kb.json:737
```
      "category": "produce",
      "question": "Is organic produce worth the extra money?",
      "decision": "Organic where the skin gets eaten. Conventional on anything peeled.",
      "why": "Residue sits on the surface, so whatever gets thrown away takes it along.",
```

## ANCHOR server/kristy_perimeter_kb.json:720
```
        "produce should be organic",
        "bananas",
        "banana",
        "onions",
```

## ANCHOR server/kristy_perimeter_kb.json:7424
```
      "tier_note": "Extension guides check firmness, a dry cap and the gills, and all three show at the shelf.",
      "asked_as": [
        "how do i pick good mushrooms",
        "how should i store mushrooms",
        "what do dark spots on mushrooms mean"
      ]
    },
```

## ANCHOR docs/do-lines-review.md:128
```
| `produce_apples_pears` | produce | Unbruised and undamaged. One spoiled fruit rots its neighbors faster. | Turn each apple or pear over and leave any bruised or damaged one behind. | — |
| `produce_citrus` | produce | Firm and smooth, free of decay, drying, or shriveling. | Choose citrus that feels firm with unblemished rind, and leave the soft ones. | — |
| `produce_stone_fruit` | produce | Unbruised and undamaged, with the skin color fully turned. | Look the fruit over for bruises or damage and skip any that shows one. | — |
| `produce_mushrooms` | produce | Dry, firm mushrooms with no dark spots. | Check each cap and leave any that feels damp or soft. | — |
| `produce_green_beans` | produce | Smooth, crisp, slender pods with no bulging seeds. | Check the pods and leave any that are flabby, rust-spotted or sticky. | — |
```

## ANCHOR docs/do-lines-review.md:50
```
| `organic_worth_it_by_type` | produce | Organic on thin-skinned produce. Conventional on anything peeled. | Spend the organic money on berries, greens, and apples. | — |
```
(single row; the two rows around it are unrelated and unchanged)

## ANCHOR server/test/counterProbe48.test.js:40
```
  ['apples', 'produce_apples_pears'],
  ['bananas', 'organic_worth_it_by_type'],
  ['spinach', 'organic_worth_it_by_type'],
```

## ANCHOR server/lib/counterCardLint.js:1008
```
    fail('HEADLINE_HEDGED', `${h.detail}. State the standard undiluted; move the fallback to watch_out`);
```
(the hedge rule this piece must pass, never edit; `TIER_NOTE_ORPHANED_PENDING` is the set ic-1 added in this file)

## ANCHOR server/test/healthFirst.test.js:17
```
const cards = nonEmpty(
  kb.entries.filter((e) => e.kind !== 'pick' || inFamily.has(e.id) || HEALTH_FIRST_PENDING.has(e.id)),
  'health-first corpus', 195
);
```
(the literal reads 195 after ic-3a; it reads 197 at 663ca3d)

## Prerequisites
Env: node ≥20, git on PATH (`git show 663ca3d:...`). No network. The dry-run reads `server/.env` if present; a credentials error is reported, not fixed.
ic-1 (ITEM_CARD_REWRITE, PENDING set, alias-move widening) and ic-3a committed first.

## Answers
- Suite ~1-3 min. Expected: green except k14 C12, which main re-anchors after commit.
- passRule (k5 runs it on organic_worth_it_by_type, produce_root_vegetables, produce_brassicas, produce_onions_garlic and others): decision/tier_note/detail are REWRITABLE, so numbers already in the old rewritable text must survive. Sources may only grow on ITEM_CARD_REWRITE ids; sprouts_raw and the other audit ids are not in that set, so do not touch their sources.
- If "are bananas worth buying organic" lands on the hub, add ONE longer alias such as "bananas organic" to produce_bananas (hub-steal rule), never a short generic, and report it. Never remove a hub alias other than banana/bananas.
- A residue sentence with no archive line is dropped, never invented. Brand names never appear in new sentences (non-negotiable 9).
- tier_note uniqueness is by exact string across the whole KB.
- Hard cap 60 min. Stop BLOCKED after 3 identical failures. Do not commit, stash or touch git. Never delete an assertion without a replacement. Leave `fixtures/kb-pre-readability.json` alone. Report ≤30 lines: READY / NOT READY, the npm count, KEPT/REWRITTEN per audit id, and the claim-trace table (one row per new sentence: sentence → archive file:line, or "skin rule, Produce hub decision").

## Tried and rejected
- Changing `evidence_tier` to kristys_standard on fronts that now name organic: passRule freezes it and the plan limits tier changes to the new card; the tier_note states where the organic call comes from instead.
- Keeping the banana aliases on the hub: "bananas" would keep landing on the hub, and the plan's banana asks would fail.
- A resistant-starch or starch-to-sugar line on bananas: macroGuard and accuracy concern 1.
- Calling broccoli or beets organic or conventional by residue: neither list names them.
