# concern-glyphosate — grain, bean and bread cards name pre-harvest glyphosate and the organic rung

```json
{
  "id": "concern-glyphosate",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/kristy_perimeter_kb.json",
    "server/test/acceptance/twoLinePin.js",
    "server/test/acceptance/k18.test.js",
    "server/test/acceptance/w4.test.js",
    "docs/do-lines-review.md",
    "server/lib/doLines.json"
  ],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/pantry/INDEX.md",
    "docs/sources/concerns/pantry/cornucopia-glyphosate-harvest.md",
    "docs/sources/concerns/pantry/foodprint-glyphosate-residue.md",
    "docs/sources/concerns/pantry/ewg-glyphosate-oats-2023.md",
    "docs/sources/concerns/pantry/saskpulse-harvest-aid-pulses.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernGlyphosate.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern row `glyphosate_desiccation`
(docs/CONCERN-REGISTER.md, "Grains & pantry").

Cards (9, all `bulk_pantry`): `oats_steelcut_rolled_instant`, `breakfast_cereal`, `muesli`, `snack_bars`,
`flour_basics`, `sandwich_bread`, `hummus`, `beans_dried_vs_canned`, `pasta_dry`.

## Change
- Every card: name glyphosate and the ladder **certified organic > conventional**, in a tip, `short_answer`, `look_for`
  or `watch_out`; the `decision` may stay. Facts, label truth only, from the archive:
  - `pantry/cornucopia-glyphosate-harvest.md`: glyphosate is not allowed in organic agriculture; conventional wheat, oats,
    edible beans and other crops can be sprayed with it shortly before harvest to dry the crop down.
  - `pantry/foodprint-glyphosate-residue.md`: residue can still reach organic products through drift, so organic is the
    rung that keeps the spray off the field, not a residue-free promise.
  - Oats (`oats_steelcut_rolled_instant`, `breakfast_cereal`, `muesli`, `snack_bars`): oats are among the crops named
    (`pantry/ewg-glyphosate-oats-2023.md`). Beans and chickpeas (`hummus`, `beans_dried_vs_canned`): pulses
    (`pantry/saskpulse-harvest-aid-pulses.md`). Wheat (`flour_basics`, `sandwich_bread`, `pasta_dry`): wheat.
- A "glyphosate residue free" seal may be named as label truth; never rank it above organic.
- Never say glyphosate causes or is linked to any illness; no IARC or "probable carcinogen" wording (Devon-only ruling
  pending); no residue amounts, ppb figures or percentages; no brand names.
- `snack_bars`, `flour_basics`, `sandwich_bread`, `hummus`: keep every existing item-specific line (whole grain first,
  unbleached/unbromated, oil read); add the glyphosate line only.
- Sources: each card adds ≥1 source object `{name, url}` whose `url` is copied verbatim from a `url:` frontmatter
  line of the files named above. Existing sources stay.
- Two `question` fields carry first person today (`oats_steelcut_rolled_instant` "What kind of oats should I buy?", `flour_basics` "Which flour should I buy, …"): reword to second person ("should you"), meaning unchanged, and pin them; `question` is display only.
- Claim lock / no-treatment: zero first person; no em-dash asides; no statistics not already on the card.
- Two-line rule: decision ≤10 words where `scripts/twoLineCheck.js` applies; it must pass.
- Pins: every changed card field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (pin equals live
  KB). Add any of the nine ids not already in the `CONCERN` set there (beforeConcern overlay). If an older test fails
  because it reads these cards' sources or text from the live KB against an older archive or fixture, the only allowed
  edit to that test is to read the entry through `beforeConcern` (import from `./twoLinePin.js`; `{ copy: true }` for
  text checks), and add that test file to your report. A dry run (one archived source on each of the nine, ids in `CONCERN`) failed exactly these owned tests, each to be fixed only this way: twoLinePin pins (pin the changed fields), k18 C5 (muesli new URL not in the k18 archive), w4 (c/e) PILOT locked fields (sandwich_bread sources). Picks cap at 12 words (`w4.test.js:58`);
  a `cart_pick` must agree with its decision (L5). Never edit `server/test/acceptance/fixtures/*`, `*.before.json`, or
  other historical fixtures. Any other older-test failure: report it (file:line, assertion), do not edit.
- Do lines: if a decision changes, edit `docs/do-lines-review.md` then run `node scripts/buildDoLines.js` from
  `server/`; sync every changed decision there (`ic8a.test.js:68`). Commit both.

## Criteria
- C1 [test] All nine cards' text names glyphosate and organic.
- C2 [test] Every sentence naming glyphosate on these cards avoids illness words (see C5) and no sentence ranks a
  residue-free seal above organic: a sentence naming "residue free" also names organic.
- C3 [test] The four kept item lines survive: `snack_bars` names whole grain, `flour_basics` names unbromated,
  `sandwich_bread` names whole wheat, `hummus` names tahini.
- C4 [test] Each card cites ≥1 URL present in a docs/sources/concerns `url:` line; every URL is one the card carried at
  e8b7669 or is in that archive.
- C5 [test] No card text contains causes/prevents/lowers risk/carcinogen/cancer/IARC/toxic/linked to, or I/me/my, or a
  number followed by ppb or percent within a glyphosate sentence.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernGlyphosate.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernGlyphosate.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernGlyphosate.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernGlyphosate.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernGlyphosate.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernGlyphosate.test.js
```js
// concern-glyphosate: grain, bean and bread cards name pre-harvest glyphosate and the organic rung; no illness
// claims; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'e8b7669:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['oats_steelcut_rolled_instant', 'breakfast_cereal', 'muesli', 'snack_bars', 'flour_basics', 'sandwich_bread', 'hummus', 'beans_dried_vs_canned', 'pasta_dry'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}
const sentences = (id) => fields(card(id)).flatMap((s) => s.split(/(?<=[.;!?])\s+/));

test('C1 glyphosate and organic named', () => {
  for (const id of nonEmpty(ALL, 'cards', 9)) {
    const t = text(card(id));
    assert.match(t, /glyphosate/i, `${id} glyphosate`);
    assert.match(t, /organic/i, `${id} organic`);
  }
});

test('C2 residue-free seal never outranks organic', () => {
  for (const id of ALL) for (const sent of sentences(id)) {
    if (/residue[- ]free/i.test(sent)) assert.match(sent, /organic/i, `${id}: ${sent}`);
  }
});

test('C3 item lines kept', () => {
  assert.match(text(card('snack_bars')), /whole grain/i);
  assert.match(text(card('flour_basics')), /unbromated/i);
  assert.match(text(card('sandwich_bread')), /whole wheat/i);
  assert.match(text(card('hummus')), /tahini/i);
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

test('C5 no illness claims, figures or first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|IARC|toxic\w*|linked to)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    for (const sent of sentences(id)) if (/glyphosate/i.test(sent)) assert.doesNotMatch(sent, /\d+\s*(ppb|percent|%)/i, `${id}: ${sent}`);
  }
});
```
