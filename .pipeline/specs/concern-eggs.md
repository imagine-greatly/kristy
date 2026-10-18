# concern-eggs — every egg card names feed first and organic second, and "vegetarian fed" is decoded

```json
{
  "id": "concern-eggs",
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
    "docs/sources/concerns/dairy_eggs_packaging/INDEX.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernEggs.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every
card "as complete as possible guiding them to get the healthiest version of any food". Devon ruling on eggs: feed
first, organic second (register row `egg_organic_rung`).

`egg_labels` is already complete; do not edit it. Cards (4): `egg_duck_quail`, `label_cage_free`,
`label_pasture_raised_feed`, pick `pick_egg_whites`. Concern rows (docs/CONCERN-REGISTER.md, "Eggs"): `egg_feed`,
`egg_organic_rung`, `vegetarian_fed`. The egg ladder there: pasture + soy/corn-free feed > pasture + organic > organic > cage-free.

## Change
- `egg_duck_quail`: the `decision` leads with the healthiest version (pasture-raised hens' equivalent: ducks or quail
  on pasture, organic feed), keeping clean/uncracked/cold in the text. Name the feed point (soy-free or corn-free
  feed printed outright, otherwise organic) in the first tip or `short_answer`. Keep the cooking-safety content.
- `label_cage_free`: say plainly that none of cage-free, free-range or pasture-raised says what the hen ate; feed words
  (soy-free, corn-free) must be printed outright, and organic is the next rung. Decision keeps the pasture rung.
- `label_pasture_raised_feed`: decode "vegetarian fed": hens on pasture eat insects and forage, so a vegetarian-fed
  claim means the hen was not foraging on pasture (100daysofrealfood-egg-labels).
- `pick_egg_whites`: `decision` (one sentence; picks hold only id/kind/title/category/aliases/decision/sources)
  names whites from organic or pasture-raised hens and keeps the pasteurized-per-federal-standard fact.
- Each card adds ≥1 source object `{name, url}` whose `url` is copied verbatim from a `url:` frontmatter line under
  `docs/sources/concerns/` (never from memory). Existing sources stay.
- Two-line rule: decision ≤10 words where `scripts/twoLineCheck.js` applies; it must pass.
- Claim lock / no-treatment: label truth only. Never "causes", "prevents", "lowers risk", "healthier for you"
  health outcomes; no statistics not already on the card; zero first person; no em-dash asides; no brand names.
- Pins: every changed card field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (the pin must
  equal the live KB). Add the four ids to the `CONCERN` set there (beforeConcern overlay) so older tests read their
  sources as of 5a53252. Never edit `server/test/acceptance/fixtures/*`, `*.before.json`, or other historical
  fixtures. If an older test still fails, report it (file:line, assertion) rather than editing it.
- Do lines: if a decision change needs a new do line, edit `docs/do-lines-review.md` then run
  `node scripts/buildDoLines.js` from `server/`. Commit both.

## Criteria
- C1 [test] All four cards' text (all fields except sources/aliases/asked_as) names feed (soy, corn or feed) and organic.
- C2 [test] `egg_duck_quail`, `label_cage_free` and `pick_egg_whites` decisions name pasture or organic.
- C3 [test] `label_pasture_raised_feed` names "vegetarian" and (insect or forag).
- C4 [test] Each of the four cites ≥1 URL present verbatim in a docs/sources/concerns `url:` line; every source URL is
  either one the card carried at 215e92d or present in that archive.
- C5 [test] No card text contains causes/prevents/lowers risk/carcinogen/cancer, or I/me/my; `egg_labels` unchanged from 215e92d.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernEggs.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernEggs.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernEggs.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernEggs.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernEggs.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernEggs.test.js
```js
// concern-eggs: egg cards name feed first and organic second; "vegetarian fed" is decoded; new sources come
// from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '215e92d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const text = (e) => JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => !SKIP.has(k))));
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['egg_duck_quail', 'label_cage_free', 'label_pasture_raised_feed', 'pick_egg_whites'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 feed and organic named', () => {
  for (const id of nonEmpty(ALL, 'cards', 4)) {
    const t = text(card(id));
    assert.match(t, /soy|corn|feed/i, `${id} feed`);
    assert.match(t, /organic/i, `${id} organic`);
  }
});

test('C2 decisions lead with pasture or organic', () => {
  for (const id of ['egg_duck_quail', 'label_cage_free', 'pick_egg_whites']) assert.match(card(id).decision, /pasture|organic/i, id);
});

test('C3 vegetarian fed decoded', () => {
  const t = text(card('label_pasture_raised_feed'));
  assert.match(t, /vegetarian/i);
  assert.match(t, /insect|forag/i);
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

test('C5 no treatment claims, no first person, egg_labels untouched', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
  assert.deepEqual(card('egg_labels'), pre.entries.find((x) => x.id === 'egg_labels'));
});
```
