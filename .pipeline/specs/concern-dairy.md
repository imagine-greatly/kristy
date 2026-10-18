# concern-dairy — dairy cards name rBST and the organic rung; carrageenan cards say to read the list for it

```json
{
  "id": "concern-dairy",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/ca-4a.test.js",
    "server/test/acceptance/ca-4b.test.js",
    "server/test/acceptance/k7.test.js",
    "server/test/acceptance/k14.test.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json"
  ],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/dairy_eggs_packaging/INDEX.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "docs/sources/concerns/dairy_eggs_packaging/bcpp-rbgh-rbst.md",
    "docs/sources/concerns/dairy_eggs_packaging/cornucopia-carrageenan.md",
    "docs/sources/concerns/dairy_eggs_packaging/cornell-7cfr205-238-organic-livestock.md",
    "docs/sources/concerns/additives/cspi-carrageenan.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernDairy.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food".

Concern rows `rbst` and `carrageenan` (docs/CONCERN-REGISTER.md, "Dairy").

Cards (13). rBST (milk-based, 9): `whole_vs_reduced_fat_milk`, `dairy_case`, `cheese_real_vs_processed`,
`yogurt_plain_vs_flavored`, `ice_cream`, `cream_vs_creamer`, `cottage_cheese`, `sour_cream`, `cream_cheese`.
Carrageenan (9): `cream_vs_creamer`, `ice_cream`, `cottage_cheese`, `sour_cream`, `cream_cheese`, `almond_milk`,
`oat_milk`, `soy_milk`, `coconut_milk_beverage` (the last four are plant milks: carrageenan only, no rBST).

## Change
- rBST cards: name rBST (the synthetic growth hormone given to dairy cows) and the ladder **certified organic >
  "from cows not treated with rBST" printed on the carton > neither**. Sources for the facts, label truth only:
  - `dairy_eggs_packaging/cornell-7cfr205-238-organic-livestock.md`: organic rules bar administering hormones for
    growth promotion or production (§205.238(c)(3)), so certified organic dairy is rBST-free.
  - `dairy_eggs_packaging/bcpp-rbgh-rbst.md`: the US does not require labeling rBST use; many companies print an
    rBST-free claim voluntarily.
  Never say grass-fed alone rules out rBST (no archived source). No IGF-1, hormone-level or health-outcome statements.
- Carrageenan cards: carrageenan is a seaweed-derived thickener; it shows up even in some certified organic foods,
  so read the list for it; the version to take lists none (`dairy_eggs_packaging/cornucopia-carrageenan.md`,
  `additives/cspi-carrageenan.md`). No gut, inflammation, cancer or disease statements.
- Put the ladder in a tip, `short_answer`, `look_for` or `watch_out`; the `decision` may stay as it is. If a decision
  changes and says "organic", the eggs_dairy G4 gloss (below) applies. Keep each card's existing item-specific content.
- Sources: each card adds ≥1 source object `{name, url}` whose `url` is copied verbatim from a `url:` frontmatter
  line of the files named above. Existing sources stay.
- Claim lock / no-treatment: zero first person; no em-dash asides; no brand names; no statistics not already on the card.
- Two-line rule: decision ≤10 words where `scripts/twoLineCheck.js` applies; it must pass.
- Pins: every changed card field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (pin equals live
  KB). Add the thirteen ids to the `CONCERN` set there (beforeConcern overlay). If an older test fails because it reads
  these cards' sources or text from the live KB against an older archive or fixture, the only allowed edit to that
  test is to read the entry through `beforeConcern` (import from `./twoLinePin.js`; `{ copy: true }` for text checks),
  and add that test file to your report. A dry run (one archived source on each of the thirteen, ids in `CONCERN`) failed exactly these owned tests, each to be fixed only this way: ca-4a C2/C3 (the Milk and Yogurt worked examples), ca-4b C1/C3 (eleven dairy cards), k7 K7 (cheese_real_vs_processed, cream_vs_creamer, oat_milk). k14 C12 pins older tests by exact match: widen it only by
  that same pattern. Picks cap at 12 words (`w4.test.js:58`). A decision saying "organic" in eggs_dairy needs the
  G4 gloss "certified organic feed and outdoor access" in `tier_note`, `pick_steps` or `instead` (`lintSections` L4);
  a `cart_pick` must agree with its decision (L5). Never edit `server/test/acceptance/fixtures/*`, `*.before.json`, or
  other historical fixtures. Any other older-test failure: report it (file:line, assertion), do not edit.
- Do lines: if a decision changes, edit `docs/do-lines-review.md` then run `node scripts/buildDoLines.js` from
  `server/`; sync every changed decision there (`ic8a.test.js:68`). Commit both.

## Criteria
- C1 [test] The nine rBST cards' text names rBST and organic.
- C2 [test] The nine carrageenan cards' text names carrageenan and says to read the list (list, ingredient or label).
- C3 [test] No card text says grass-fed rules out rBST: every sentence naming rBST and grass-fed also names organic.
- C4 [test] Each card cites ≥1 URL present in a docs/sources/concerns `url:` line; every URL is one the card carried at
  72def1c or is in that archive.
- C5 [test] No card text contains causes/prevents/lowers risk/carcinogen/cancer/inflam/toxic/IGF, or I/me/my.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDairy.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDairy.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDairy.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDairy.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDairy.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernDairy.test.js
```js
// concern-dairy: dairy cards name rBST and the organic rung; carrageenan cards say to read the list; sources from the
// concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '72def1c:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const RBST = ['whole_vs_reduced_fat_milk', 'dairy_case', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'ice_cream', 'cream_vs_creamer', 'cottage_cheese', 'sour_cream', 'cream_cheese'];
const CARR = ['cream_vs_creamer', 'ice_cream', 'cottage_cheese', 'sour_cream', 'cream_cheese', 'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage'];
const ALL = [...new Set([...RBST, ...CARR])];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 rBST and organic named', () => {
  for (const id of nonEmpty(RBST, 'rbst cards', 9)) {
    const t = text(card(id));
    assert.match(t, /rBST/i, `${id} rBST`);
    assert.match(t, /organic/i, `${id} organic`);
  }
});

test('C2 carrageenan named with the list to read', () => {
  for (const id of nonEmpty(CARR, 'carrageenan cards', 9)) {
    const t = text(card(id));
    assert.match(t, /carrageenan/i, `${id} carrageenan`);
    assert.match(t, /\b(list|ingredient|label)/i, `${id} read the list`);
  }
});

test('C3 grass-fed never stands in for the rBST rung', () => {
  for (const id of ALL) for (const s of fields(card(id))) for (const sent of s.split(/(?<=[.;!?])\s+/)) {
    if (/rBST/i.test(sent) && /grass[- ]fed/i.test(sent)) assert.match(sent, /organic/i, `${id}: ${sent}`);
  }
});

test('C4 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const id of nonEmpty(ALL, 'cards', 13)) {
    const before = new Set(urlsOf(pre.entries.find((x) => x.id === id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    assert.ok(urls.some((u) => archived.has(u)), `${id} cites no concern-archive url`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C5 no treatment or mechanism claims, no first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|inflam\w*|toxic\w*|IGF\S*)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
});
```
