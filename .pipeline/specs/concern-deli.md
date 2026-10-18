# concern-deli — deli and cured-meat cards name every hidden concern and push organic / pasture-raised

```json
{
  "id": "concern-deli",
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
    "docs/sources/concerns/meat/INDEX.md",
    "server/test/acceptance/twoLinePin.test.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernDeli.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): deli cards miss celery powder and should push
organic and grass-fed; "i want to have all of the niche helath stuff all tracked and spoken of in kristy approved,
seed oils, celery powder, all of these things which the average person wouldnt know are bad". Every card "as
complete as possible guiding them to get the healthiest version of any food".

Cards (9): `deli_meat_uncured`, `bacon`, `hot_dogs`, `ham`, `turkey_bacon`, `cured_pork`, `pork_cuts_and_enhanced`,
picks `pick_sausage`, `pick_jerky`. Concern rows to cover (docs/CONCERN-REGISTER.md): `added_nitrite`,
`celery_powder_uncured`, `phosphate_additives`, `deli_binders`, `carrageenan`, `liquid_smoke`, `animal_feed_organic`.

## Change
- Each cured card (the first six) names nitrite AND celery powder: "uncured / no nitrates added" meat is cured
  with celery powder or juice, a plant source of nitrite (label-truth, per npr-no-nitrates-added and
  cr-decoding-meat-labels in docs/sources/concerns/meat/). Put it where it is read: `buying_tips` or `watch_out`.
- Each of the seven cards' `decision` carries the healthiest-version ladder: organic or pasture-raised
  (grass-fed for beef in hot dogs / jerky) first, then the current label rule. Keep the two-line rule:
  decision ≤10 words (`scripts/twoLineCheck.js` must pass), first tip carries the second rung.
- `deli_meat_uncured`, `ham`, `hot_dogs` name phosphates and binders/carrageenan to skip (CSPI chemical cuisine,
  theconversation-deli-meat, cspi-carrageenan). `bacon`, `ham`, `hot_dogs` name smoke flavoring / liquid smoke
  (iastate-liquid-smoke). `pork_cuts_and_enhanced` keeps its solution rule and names phosphates in the solution.
- Picks: `pick_sausage` and `pick_jerky` `decision` names celery powder (one sentence, picks hold only
  id/kind/title/category/aliases/decision/sources).
- Each card adds ≥1 source object `{name, url}` whose `url` is copied verbatim from a `url:` frontmatter line under
  `docs/sources/concerns/` (never from memory). Existing sources stay.
- Claim lock / no-treatment: label truth only. Never "causes", "prevents", "lowers risk", "carcinogen", "cancer";
  no statistics; zero first person; no em-dash asides; no brand names.
- Pins: every changed card field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (the pin
  must equal the live KB). Never edit `server/test/acceptance/fixtures/*`, `*.before.json`, or other historical
  fixtures; older tests restore old values through `beforeTwoLine`. If an older test still fails, report it
  (file:line, assertion) rather than editing it.
- Do lines: if a decision change needs a new do line, edit `docs/do-lines-review.md` then run
  `node scripts/buildDoLines.js` from `server/`. Commit both.

## Criteria
- C1 [test] The six cured cards' text (all fields except sources/aliases/asked_as) names celery and nitrite.
- C2 [test] The seven non-pick cards' `decision` names organic, pasture or grass-fed.
- C3 [test] deli_meat_uncured, ham, hot_dogs name phosphate and (binder or carrageenan); pork_cuts names phosphate.
- C4 [test] bacon, ham, hot_dogs name smoke flavoring or liquid smoke.
- C5 [test] pick_sausage and pick_jerky decisions name celery.
- C6 [test] Each of the nine cites ≥1 URL present verbatim in a docs/sources/concerns `url:` line; every source URL
  is either one the cards carried before (frozen list) or present in that archive.
- C7 [test] No card text contains causes/prevents/lowers risk/carcinogen/cancer, or I/me/my.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []},
    {"id": "C7", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernDeli.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernDeli.test.js
```js
// concern-deli: deli and cured-meat cards name the hidden concerns (nitrite, celery powder, phosphates,
// binders, smoke flavoring) and lead with organic / pasture-raised; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const text = (e) => JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => !SKIP.has(k))));

const CURED = ['deli_meat_uncured', 'bacon', 'hot_dogs', 'ham', 'turkey_bacon', 'cured_pork'];
const CARDS = [...CURED, 'pork_cuts_and_enhanced'];
const PICKS = ['pick_sausage', 'pick_jerky'];
const ALL = [...CARDS, ...PICKS];

const root = new URL('../../../docs/sources/concerns/', import.meta.url).pathname;
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}
// The URLs these nine cards carried before concern-deli (2026-10-18); they may stay.
const BEFORE = new Set(["https://extension.oregonstate.edu/catalog/pnw-784-making-cured-bacon-home","https://health.clevelandclinic.org/turkey-bacon-how-healthy-is-it-really","https://www.canr.msu.edu/news/ham_for_the_holidays_and_all_year_long","https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/bacon-and-food-safety","https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat-catfish/hams-and-food-safety","https://www.law.cornell.edu/cfr/text/9/317.17","https://www.law.cornell.edu/cfr/text/9/317.2","https://www.law.cornell.edu/cfr/text/9/319.140","https://www.law.cornell.edu/cfr/text/9/319.141","https://www.law.cornell.edu/cfr/text/9/319.180","https://www.law.cornell.edu/cfr/text/9/381.173","https://www.ndsu.edu/agriculture/extension/publications/jerky-native-american-inspired-snack-we-all-can-enjoy-today","https://www.nichemeatprocessing.org/uncured-bacon/","https://www.npr.org/sections/thesalt/2019/08/29/755115208/duped-in-the-deli-aisle-no-nitrates-added-labels-are-often-misleading"]);

test('C1 cured cards name celery and nitrite', () => {
  for (const id of nonEmpty(CURED, 'cured', 6)) {
    const t = text(card(id));
    assert.match(t, /celery/i, `${id} celery`);
    assert.match(t, /nitrite/i, `${id} nitrite`);
  }
});

test('C2 decisions lead with organic / pasture / grass-fed', () => {
  for (const id of nonEmpty(CARDS, 'cards', 7)) assert.match(card(id).decision, /organic|pasture|grass-fed/i, `${id} decision`);
});

test('C3 phosphates and binders named', () => {
  for (const id of ['deli_meat_uncured', 'ham', 'hot_dogs']) {
    const t = text(card(id));
    assert.match(t, /phosphate/i, `${id} phosphate`);
    assert.match(t, /binder|carrageenan/i, `${id} binder`);
  }
  assert.match(text(card('pork_cuts_and_enhanced')), /phosphate/i);
});

test('C4 smoke flavoring named', () => {
  for (const id of ['bacon', 'ham', 'hot_dogs']) assert.match(text(card(id)), /smoke flavou?ring|liquid smoke/i, id);
});

test('C5 pick decisions name celery', () => {
  for (const id of nonEmpty(PICKS, 'picks', 2)) assert.match(card(id).decision, /celery/i, id);
});

// k9 (frozen at 719f9fe) runs passRule on deli_meat_uncured, and card-align cards freeze
// `sources`, so that card keeps its 5a53252 sources and cannot cite the concern archive.
const SOURCES_FROZEN = new Set(['deli_meat_uncured']);

test('C6 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const id of ALL.filter((i) => !SOURCES_FROZEN.has(i))) {
    const urls = nonEmpty((card(id).sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean), `${id} sources`, 1);
    assert.ok(urls.some((u) => archived.has(u)), `${id} cites no concern-archive url`);
    for (const u of urls) assert.ok(BEFORE.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C7 no treatment claims, no first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
});
```

## ANCHOR server/test/acceptance/twoLinePin.test.js:12
```
test('every card carries the pinned two-line decision and buying_tips', () => {
```
