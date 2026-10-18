# concern-seedoils-a — oil and spread cards name the seed oils to skip and ladder to a natural fat

```json
{
  "id": "concern-seedoils-a",
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
    "docs/sources/concerns/pantry/INDEX.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "docs/CARD-ALIGNMENT-PLAN.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernSeedOilsA.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern row `seed_oils` and
`traditional_fats` (docs/CONCERN-REGISTER.md, "Oils & fats").

**The ladder is Kristy's standard, not the register's:** docs/CARD-ALIGNMENT-PLAN.md D7, G6 and G7 (Devon ruling
2026-10-14) override the register row. Natural fat = tallow, olive oil, coconut oil (butter and ghee are fine where the
card already names them). Seed oils to skip = sunflower, safflower, canola, soybean, corn and cottonseed (G7 wording).
**Avocado oil is a skip alongside the seed oils** (the label cannot prove it pure); no card may recommend it.

Cards (8): `cooking_oils`, `nut_butter_ingredients`, `plant_butter`, `label_cold_pressed_expeller`, `mayo`, `deli_salads`, `hummus`, `rotisserie_chicken`.

## Change
- Every card: name, where the shopper reads it, which seed oils to skip and the natural-fat version to take instead
  (or, for foods with no fat choice on the shelf, that seed oil in the list is the thing to skip). Use the G7 list
  wording where the full list is named. Keep each card's existing item-specific content.
- `label_cold_pressed_expeller`: the decision and every field stop recommending avocado oil; olive or coconut first,
  and say a cold-pressed seed oil is still a seed oil.
- `mayo`: the healthiest version is a jar made on olive oil (or another natural fat) with egg yolk and an acid; keep the
  standard-of-identity facts. "Sold on avocado or olive oil can carry other oils" stays as label truth; never recommend
  avocado oil.
- `plant_butter`: coconut or olive oil first, seed oils and avocado oil skipped.
- `hummus`, `deli_salads`, `rotisserie_chicken`: the oil they are made with is the read (olive oil vs a seed oil), in a
  tip or `short_answer`; the decision may stay if it already fits.
- Sources: each card adds ≥1 source object `{name, url}` whose `url` is copied verbatim from a `url:` frontmatter
  line under `docs/sources/concerns/` (pantry/shanahan-hateful-eight.md, pantry/kresser-industrial-seed-oils.md,
  pantry/wapf-faq-fats-and-oils.md, packaged/seedoilfree-potato-chips.md are the seed-oil archive). Existing sources stay.
- Claim lock / no-treatment: label truth and Kristy's standard only. Never say a seed oil causes, harms, inflames or is
  toxic; no oxidation or omega-6 mechanism claims; no statistics not already on the card; zero first person; no
  em-dash asides; no brand names.
- Two-line rule: decision ≤10 words where `scripts/twoLineCheck.js` applies; it must pass.
- Pins: every changed card field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (pin equals live
  KB). Add the eight ids to the `CONCERN` set there (beforeConcern overlay). If an older test fails because it reads
  these cards' sources or text from the live KB against an older archive or fixture, the only allowed edit to that
  test is to read the entry through `beforeConcern` (import from `./twoLinePin.js`), and add that test file to your
  report. Never edit `server/test/acceptance/fixtures/*`, `*.before.json`, or other historical fixtures. Any other
  older-test failure: report it (file:line, assertion), do not edit.
- Do lines: if a decision change needs a new do line, edit `docs/do-lines-review.md` then run
  `node scripts/buildDoLines.js` from `server/`. Commit both.

## Criteria
- C1 [test] All eight cards' text names a seed oil (seed oil, canola, sunflower, soybean, safflower, cottonseed, corn
  oil) and a natural fat (tallow, olive, coconut, butter, ghee, lard).
- C2 [test] No card text recommends avocado oil: every sentence that mentions avocado also says skip/never/not/can carry.
- C3 [test] `cooking_oils`, `plant_butter`, `label_cold_pressed_expeller`, `mayo` decisions name olive, coconut, tallow or butter.
- C4 [test] Each card cites ≥1 URL present in a docs/sources/concerns `url:` line; every URL is one the card carried at
  2467f1f or is in that archive.
- C5 [test] No card text contains causes/prevents/lowers risk/carcinogen/cancer/inflam/toxic, or I/me/my.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSeedOilsA.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSeedOilsA.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSeedOilsA.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSeedOilsA.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSeedOilsA.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernSeedOilsA.test.js
```js
// concern-seedoils-a: oil and spread cards name the seed oils to skip and a natural fat to take; avocado oil is never
// recommended; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '2467f1f:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['cooking_oils', 'nut_butter_ingredients', 'plant_butter', 'label_cold_pressed_expeller', 'mayo', 'deli_salads', 'hummus', 'rotisserie_chicken'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 seed oil and natural fat named', () => {
  for (const id of nonEmpty(ALL, 'cards', 8)) {
    const t = text(card(id));
    assert.match(t, /seed oil|canola|sunflower|soybean|safflower|cottonseed|corn oil/i, `${id} seed oil`);
    assert.match(t, /tallow|olive|coconut|butter|ghee|lard/i, `${id} natural fat`);
  }
});

test('C2 avocado oil never recommended', () => {
  const hits = [];
  for (const id of ALL) for (const s of fields(card(id))) for (const sent of s.split(/(?<=[.;!?])\s+/)) if (/avocado/i.test(sent)) hits.push([id, sent]);
  for (const [id, sent] of hits) assert.match(sent, /skip|never|not|can carry|avoid/i, `${id}: ${sent}`);
});

test('C3 oil decisions name a natural fat', () => {
  for (const id of ['cooking_oils', 'plant_butter', 'label_cold_pressed_expeller', 'mayo']) assert.match(card(id).decision, /olive|coconut|tallow|butter/i, id);
});

test('C4 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const id of ALL) {
    const before = new Set(urlsOf(pre.entries.find((x) => x.id === id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    assert.ok(urls.some((u) => archived.has(u)), `${id} cites no concern-archive url`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C5 no treatment or mechanism claims, no first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|inflam\w*|toxic\w*)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
});
```
