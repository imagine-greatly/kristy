# concern-additives — six cards name synthetic dyes and the no-added-color rung; six fat-and-grain cards name BHA, BHT and TBHQ and say to read the list

```json
{
  "id": "concern-additives",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json"
  ],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/additives/INDEX.md",
    "docs/sources/concerns/additives/cspi-synthetic-dyes.md",
    "docs/sources/concerns/packaged/cspi-synthetic-food-dyes.md",
    "docs/sources/concerns/additives/cspi-bha.md",
    "docs/sources/concerns/additives/cspi-tbhq.md",
    "docs/sources/concerns/additives/ewg-dirty-dozen-food-chemicals.md",
    "docs/sources/concerns/packaged/ewg-dirty-dozen-bht.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernAdditives.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern rows `synthetic_dyes`,
`bha_bht`, `tbhq_propyl_gallate` (docs/CONCERN-REGISTER.md, "Additives"); docs/CONCERN-COVERAGE.md §D items 13 and 14.
Today only `label_artificial_color` names dyes and no card names BHA, BHT or TBHQ.

Cards, verified present in `server/kristy_perimeter_kb.json` (dairy: `yogurt_plain_vs_flavored`; all others `bulk_pantry`;
`pick_juice` is a `kind: "pick"` with only `decision` and `sources`, every other card is a full card):

Dye group (6): `breakfast_cereal`, `frozen_waffles`, `snack_bars`, `pick_juice`, `snacks`, `yogurt_plain_vs_flavored`.
Antioxidant group (6): `breakfast_cereal` (also in the dye group), `crackers`, `potato_chips`, `frozen_nuggets`,
`frozen_fries`, `cooking_oils`. Eleven distinct cards.

State of the cards before this batch (decision / cart_pick / tier_note shown; they must not change except where noted):
- `breakfast_cereal`: decision "Whole-grain cereal or granola with less added sugar."; tips end with the glyphosate/organic oat tip.
- `frozen_waffles`: decision "Frozen waffles with a whole grain listed first."; 5 tips on first ingredient, graham flour, rising, freezing.
- `snack_bars`: decision "Bars with oats or another whole grain listed first."; tips include the oil read, "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.", the glyphosate/organic oat tip; watch_out "Skip avocado oil too: the label cannot prove the oil is pure."
- `pick_juice` (pick): decision "Most juice is pasteurized; an untreated juice in the cold case carries a warning label."; one FDA source.
- `snacks`: decision "Snacks with a whole grain, vegetable or bean listed first."; tier_note "Vegetable powder colors potato flour, so the chip is mostly potato." (a colour line that is not a dye line; keep).
- `yogurt_plain_vs_flavored`: decision "Plain Greek yogurt made from 100% grass-fed milk."; tips end with the two rBST tips (organic > "not given rBST" > neither).
- `crackers`, `potato_chips`, `frozen_nuggets`, `frozen_fries`: decisions name the fat (olive/coconut/tallow ladder); each has the tip "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed." and watch_out "Skip avocado oil too: the label cannot prove the oil is pure."
- `cooking_oils`: decision "Olive or coconut oil, or tallow for cooking."; tips include the seed-oil and avocado tips; watch_out "Oil that starts smoking in the pan is no longer fit to use."

## Change
- Dye group: each card names synthetic dyes and the ladder **no added color on the list > a numbered dye (Red 40, Yellow 5,
  Yellow 6, Blue 1)**, in a tip, `short_answer`, `look_for` or `watch_out`; the `decision` may stay (`pick_juice` see below).
  Label truth only, from the archive:
  - `additives/cspi-synthetic-dyes.md`: most artificially colored foods are colored with synthetic dyes; "Lake" on a label
    is the water-insoluble form of a dye and counts as a dye; the use of colorings "usually indicates that a natural
    ingredient is not used", so a colored food leans on color where the real ingredient is not doing the work.
  - `packaged/cspi-synthetic-food-dyes.md`: the seven most widely used dyes are Blue 1, Blue 2, Green 3, Red 3, Red 40,
    Yellow 5, Yellow 6.
  - The list names certified dyes by name (existing `label_artificial_color` card, 21 CFR 101.22(k)); "read the list for
    the numbers" is the instruction. Do not claim a plant-colored product ranks above a numbered dye: the archive says
    natural colors are not automatically safer and names only beta-carotene and carmine; a named plant source may be
    described as what the list says, never ranked (open question for Devon).
- Antioxidant group: each card says BHA, BHT and TBHQ are preservatives added to fats and fat-containing foods, that the
  ingredient list names them, and the ladder **list without BHA, BHT or TBHQ > list that names one**. Archive support:
  - `additives/cspi-tbhq.md`: TBHQ is an antioxidant used in vegetable oil, snack foods, cereals and other fat-containing
    foods; it prevents rancidity; it is sometimes used with BHA, BHT and propyl gallate.
  - `additives/cspi-bha.md`: BHA is related to BHT and TBHQ, which are sometimes used with it in food formulations.
  - `additives/ewg-dirty-dozen-food-chemicals.md`: TBHQ is typically added to packaged foods like crackers, potato chips
    and baked goods containing oil; BHT is a preservative found in cereals; propyl gallate is used in vegetable oil.
  - `packaged/ewg-dirty-dozen-bht.md`: BHT is commonly added to breakfast cereal and other processed foods containing fats
    and oils; look for it on the ingredient list as "BHT" or "butylated hydroxytoluene"; BHT is prohibited in certified
    organic foods (may be named on `breakfast_cereal` as the organic rung, label truth only).
  - Where each is named: `breakfast_cereal` BHT and TBHQ; `crackers` and `potato_chips` TBHQ (EWG names both foods) and BHA/BHT
    by name; `cooking_oils` TBHQ and propyl gallate (CSPI and EWG name vegetable oil); `frozen_nuggets` and `frozen_fries`
    name TBHQ only as a preservative of fat-containing foods, never claiming those products carry it (the archive does not
    name nuggets or fries). Phrase as "read the list for BHA, BHT or TBHQ", not as a claim the product contains them.
  - Do not name vitamin E, tocopherols or rosemary extract as the alternative: no archive file supports it as a
    preservative swap (the ratings list rates alpha tocopherol Safe only as a vitamin). The only alternative named is the
    list without them (open question for Devon).
- `pick_juice`: keep both existing facts (pasteurized; untreated juice in the cold case carries a warning label) and add
  the dye read to the decision (e.g. a clause telling the shopper to read the list for Red 40 and other numbered dyes).
  Picks have no tips field: do not add new fields; add the archive source object. Picks cap at 12 words (`w4.test.js:58`)
  only for the w4 PILOT cards, but keep the decision to one sentence of at most 20 words.
- Never say any dye or preservative causes, is linked to, raises the risk of or "can cause or exacerbate" anything: no
  cancer, tumor, carcinogen, hyperactivity, behavior, attention, neurobehavioral, allergic, harm, toxic, unsafe, risk. No
  "avoid" lists of brands, no brand names, no price, no "junk food". The archive's health sentences are not repeated.
  Say it as a label fact and Kristy's standard ("skip it", "take the list without").
- Must keep (item-specific lines from the earlier seed-oil, glyphosate and dairy batches). Every existing string in
  `buying_tips` and `watch_out` on all eleven cards stays verbatim and in order; new tips append after them (so
  `buying_tips[0]`, the two-line rule's line 2, does not change). `decision`, `cart_pick` and `tier_note` on ten cards are
  unchanged (`pick_juice` decision excepted). Explicitly:
  - seed-oil naming: the "Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed." tip on
    `snack_bars`, `crackers`, `potato_chips`, `frozen_nuggets`, `frozen_fries`, `cooking_oils`; the "Skip avocado oil
    too: the label cannot prove the oil is pure." line on the same six (`cooking_oils` carries it as a tip). No avocado
    oil endorsement anywhere; the olive / coconut / tallow ladder in those decisions and `cart_pick`s stays.
  - glyphosate and organic: the oat tip on `breakfast_cereal` and `snack_bars`, and their three glyphosate sources.
  - rBST: both rBST tips on `yogurt_plain_vs_flavored` and its two rBST source objects; `snacks` tier_note about vegetable
    powder; the whole-grain, added-sugar and stamp lines on cereal, waffles, bars and snacks.
- Sources: each of the eleven cards adds ≥1 source object `{name, url}` whose `url` is copied verbatim from a `url:`
  frontmatter line of an archive file named above (exact strings, no trailing slash changes):
  - `https://www.cspi.org/node/7436` (dyes, `additives/cspi-synthetic-dyes.md`)
  - `https://www.cspi.org/page/synthetic-food-dyes-health-risks-history-and-policy` (dyes, `packaged/cspi-synthetic-food-dyes.md`)
  - `https://www.cspi.org/node/7426` (BHA, `additives/cspi-bha.md`)
  - `https://www.cspi.org/node/7416` (TBHQ, `additives/cspi-tbhq.md`)
  - `https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid` (`additives/ewg-dirty-dozen-food-chemicals.md`)
  - `https://www.ewg.org/foodscores/8806-article-dirty-dozen-food-chemicals-bht/` (BHT, `packaged/ewg-dirty-dozen-bht.md`)
  Dye cards cite a dye source; antioxidant cards cite a preservative source. Existing sources stay.
- Claim lock / no-treatment: zero first person; no em-dash asides; no statistics not already on the card; no price.
- Two-line rule: decision ≤10 words where `scripts/twoLineCheck.js` applies (picks are skipped by it); it must pass.
- Pins: every changed card field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (pin equals live KB).
  Add `frozen_waffles`, `pick_juice`, `snacks` to the `CONCERN` set there (the other eight are already in it)
  (beforeConcern overlay). If an older test fails because it reads these cards' sources or text from the live KB against
  an older archive or fixture, the only allowed edit to that test is to read the entry through `beforeConcern` (import from
  `./twoLinePin.js`; `{ copy: true }` for text checks), and add that test file to your report. A dry run (one archived source on each of the eleven, the three new ids in `CONCERN`) failed only the twoLinePin pins: `beforeConcern` throws on an id with no `TWO_LINE` entry, so pin `frozen_waffles`, `pick_juice` and `snacks` (every changed field) before anything reads them; no other owned test needs an edit.
  Never edit `server/test/acceptance/fixtures/*`, `*.before.json`, or other historical fixtures. Any other older-test
  failure: report it (file:line, assertion), do not edit. A `cart_pick` must agree with its decision (L5).
- Do lines: if a decision changes (`pick_juice`), edit `docs/do-lines-review.md` then run `node scripts/buildDoLines.js`
  from `server/`; sync every changed decision there (`ic8a.test.js:68`). Commit both. Not migrated.

## Criteria
- C1 [test] The six dye-group cards' text names dyes (`dye`, or a numbered dye) and the no-added-color rung, and names at
  least Red 40 and Yellow 5 across the group.
- C2 [test] The six antioxidant-group cards' text names TBHQ, BHA or BHT as appropriate (cereal: BHT and TBHQ; crackers and
  chips: TBHQ; cooking_oils: TBHQ) and tells the shopper to read the ingredient list; no card claims nuggets or fries
  contain it (a sentence naming nuggets or fries and TBHQ has no "contain" wording about the product).
- C3 [test] The must-keep lines survive: every pre-batch `buying_tips` and `watch_out` string is still on its card; the
  seed-oil and avocado lines are on the six fat cards; both glyphosate/organic sentences on cereal and bars; both rBST tips
  on yogurt; `snacks` tier_note unchanged; `decision`, `cart_pick`, `tier_note` unchanged on all ten full cards.
- C4 [test] `pick_juice` decision keeps "pasteurized" and "warning label" and now names a dye.
- C5 [test] Each of the eleven cards cites ≥1 URL present in a docs/concerns `url:` line; every URL is one the card carried
  before this batch or is in that archive; dye cards cite a dye source, antioxidant cards a preservative source.
- C6 [test] No card text contains causes/prevents/lowers risk/carcinogen/cancer/tumor/toxic/unsafe/harm/risk/linked to/
  hyperactivity/behavior/attention/neurobehavioral/exacerbate, or I/me/my, or an em dash, on any additive sentence or
  anywhere on the eleven cards; none ranks vitamin E, tocopherols or rosemary as a swap (they are not named); no "avoid" ranking
  of a plant-colored product above a numbered dye is asserted.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernAdditives.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernAdditives.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernAdditives.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json", "docs/do-lines-review.md", "server/lib/doLines.json"], "tests": ["server/test/acceptance/concernAdditives.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernAdditives.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernAdditives.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernAdditives.test.js
```js
// concern-additives: dye cards name synthetic dyes and the no-added-color rung; fat and grain cards name BHA, BHT and
// TBHQ and say to read the list; earlier seed-oil, glyphosate and rBST lines stay; no illness claims; sources from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'bd8a1cc:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);
const sentences = (id) => fields(card(id)).flatMap((s) => s.split(/(?<=[.;!?])\s+/));

const DYES = ['breakfast_cereal', 'frozen_waffles', 'snack_bars', 'pick_juice', 'snacks', 'yogurt_plain_vs_flavored'];
const ANTI = ['breakfast_cereal', 'crackers', 'potato_chips', 'frozen_nuggets', 'frozen_fries', 'cooking_oils'];
const FAT = ['snack_bars', 'crackers', 'potato_chips', 'frozen_nuggets', 'frozen_fries', 'cooking_oils'];
const FULL = [...new Set([...DYES, ...ANTI])].filter((id) => id !== 'pick_juice');
const ALL = [...new Set([...DYES, ...ANTI])];

const DYE_URLS = ['https://www.cspi.org/node/7436', 'https://www.cspi.org/page/synthetic-food-dyes-health-risks-history-and-policy', 'https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid'];
const PRES_URLS = ['https://www.cspi.org/node/7426', 'https://www.cspi.org/node/7416', 'https://www.ewg.org/consumer-guides/ewgs-dirty-dozen-guide-food-chemicals-top-12-avoid', 'https://www.ewg.org/foodscores/8806-article-dirty-dozen-food-chemicals-bht/'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 dye cards name dyes and the no-added-color rung', () => {
  for (const id of nonEmpty(DYES, 'dye cards', 6)) {
    const t = text(card(id));
    assert.match(t, /\bdyes?\b|\bRed 40\b|\bYellow [56]\b|\bBlue 1\b/i, `${id} dye`);
    assert.match(t, /no added colou?r|without (any )?(added )?colou?r|no colou?r added/i, `${id} no-added-color rung`);
  }
  const all = DYES.map((id) => text(card(id))).join(' ');
  assert.match(all, /Red 40/);
  assert.match(all, /Yellow 5/);
});

test('C2 antioxidant cards name the preservative and say to read the list', () => {
  const need = { breakfast_cereal: [/\bBHT\b/, /\bTBHQ\b/], crackers: [/\bTBHQ\b/], potato_chips: [/\bTBHQ\b/], frozen_nuggets: [/\bTBHQ\b/], frozen_fries: [/\bTBHQ\b/], cooking_oils: [/\bTBHQ\b/] };
  for (const id of nonEmpty(ANTI, 'antioxidant cards', 6)) {
    const t = text(card(id));
    for (const re of need[id]) assert.match(t, re, `${id} ${re}`);
    assert.match(t, /(BHA|BHT|TBHQ)[^.]*\b(list|label)\b|\b(list|label)\b[^.]*(BHA|BHT|TBHQ)/i, `${id} says read the list`);
  }
  for (const id of ['frozen_nuggets', 'frozen_fries']) for (const sent of sentences(id)) {
    if (/TBHQ|BHA|BHT/.test(sent)) assert.doesNotMatch(sent, /\b(contains?|carries|has|have|includes?)\b/i, `${id} claims it is in the product: ${sent}`);
  }
});

test('C3 earlier seed-oil, glyphosate and rBST lines stay', () => {
  for (const id of nonEmpty(FULL, 'full cards', 10)) {
    const a = card(id), b = was(id);
    for (const f of ['buying_tips', 'watch_out']) {
      const now = a[f] || [];
      for (const s of b[f] || []) assert.ok(now.includes(s), `${id}.${f} lost: ${s}`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note']) assert.equal(a[f], b[f], `${id}.${f} changed`);
    assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
  }
  for (const id of FAT) {
    assert.match(text(card(id)), /Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed\./, `${id} seed oils`);
    assert.match(text(card(id)), /Skip avocado oil too: the label cannot prove the oil is pure\./, `${id} avocado`);
  }
  for (const id of ['breakfast_cereal', 'snack_bars']) assert.match(text(card(id)), /glyphosate[\s\S]*organic|organic[\s\S]*glyphosate/i, `${id} glyphosate`);
  assert.match(text(card('yogurt_plain_vs_flavored')), /rBST/);
  assert.equal(card('snacks').tier_note, 'Vegetable powder colors potato flour, so the chip is mostly potato.');
  assert.doesNotMatch(ALL.map((id) => text(card(id))).join(' '), /(avocado oil)[^.]*\b(best|choose|take|good)\b/i, 'avocado oil endorsed');
});

test('C4 pick_juice keeps its facts and names a dye', () => {
  const d = card('pick_juice').decision;
  assert.match(d, /pasteurized/i);
  assert.match(d, /warning label/i);
  assert.match(d, /\bdyes?\b|\bRed 40\b|\bYellow [56]\b|\bBlue 1\b/i);
  assert.ok(d.split(/\s+/).length <= 20, `pick_juice decision too long: ${d}`);
  assert.deepEqual(Object.keys(card('pick_juice')).sort(), Object.keys(was('pick_juice')).sort(), 'pick shape changed');
});

test('C5 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const u of [...DYE_URLS, ...PRES_URLS]) assert.ok(archived.has(u), `not an archive url: ${u}`);
  for (const id of ALL) {
    const before = new Set(urlsOf(was(id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    assert.ok(urls.some((u) => archived.has(u) && !before.has(u)), `${id} adds no concern-archive url`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
    if (DYES.includes(id)) assert.ok(urls.some((u) => DYE_URLS.includes(u)), `${id} cites no dye source`);
    if (ANTI.includes(id)) assert.ok(urls.some((u) => PRES_URLS.includes(u)), `${id} cites no preservative source`);
  }
});

test('C6 no illness claims, first person, em dash or unarchived alternatives', () => {
  const BAN = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|tumou?rs?|toxic\w*|unsafe|harm\w*|risks?|linked to|hyperactiv\w*|behaviou?r\w*|attention|neurobehavioral|exacerbate)\b/i;
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, BAN, `${id} treatment wording`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    assert.doesNotMatch(t, /—/, `${id} em dash`);
    assert.doesNotMatch(t, /vitamin e|tocopherol|rosemary/i, `${id} unarchived alternative`);
    assert.doesNotMatch(t, /\$\s?\d|\bprice\b|\bcheap\w*|\bjunk\b/i, `${id} price or junk wording`);
  }
});
```
