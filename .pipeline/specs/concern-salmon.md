# concern-salmon — the salmon card, the smoked salmon card and the seafood-label card name the farmed-salmon concerns and the wild-first ladder

```json
{
  "id": "concern-salmon",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "server/test/acceptance/k16.test.js", "docs/do-lines-review.md", "server/lib/doLines.json"],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/produce_seafood/INDEX.md",
    "docs/sources/concerns/produce_seafood/nbc-farmed-salmon-contaminated.md",
    "docs/sources/concerns/produce_seafood/qz-farmed-salmon-color-added.md",
    "docs/sources/concerns/produce_seafood/seafoodwatch-chile-farmed-salmon.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "server/lib/counterCardLint.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernSalmon.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern rows `farmed_salmon_contaminants`
(MISSING today, docs/CONCERN-COVERAGE.md line 103: home `salmon_wild_vs_farmed`), `salmon_color_added` (PARTIAL, line 104; missing on
`smoked_salmon` and `label_wild_vs_farm_raised`, §D item 17 line 335) and `seafood_antibiotics` (PARTIAL, line 105; the Chile
finding is named on no card). Register rows: docs/CONCERN-REGISTER.md lines 138-140.

Cards, verified present in `server/kristy_perimeter_kb.json` `entries`: `salmon_wild_vs_farmed` (`seafood`, the home card),
`smoked_salmon` (`seafood`), `label_wild_vs_farm_raised` (`label_terms`). All full cards, all three already have a `TWO_LINE` entry
in `twoLinePin.js` (decision + buying_tips). `farmed_fish_by_species` is NOT touched and stays deep-equal.

State before this batch (HEAD `262bc45`; these must not change):
- `salmon_wild_vs_farmed`: decision "Wild salmon, frozen wild Alaskan before fresh farmed."; cart_pick "Wild-caught salmon"; 4 tips (first: "Wild salmon eats krill and small fish; farmed eats plant protein and vegetable oil."); 4 watch_out; 3 string sources (one with an inline Alaska Sea Grant URL). `detail` already says astaxanthin and that antibiotic use varies by country; `kristy_take` and `instead` stay.
- `smoked_salmon`: decision "Nova or lox smoked salmon, bought cold and kept cold."; cart_pick "Refrigerated smoked salmon from a cold case"; 5 tips (first: "Shelf-stable smoked fish is heat-treated and sealed; nova and lox rely on the cold."); 2 watch_out; 3 string sources (CDC, FDA, UMaine).
- `label_wild_vs_farm_raised`: decision "Whole or skin-on fish labeled with species, method and country."; 6 tips; 3 watch_out; 3 string sources.

## Change
- Archive sources (concern archive, `docs/sources/concerns/produce_seafood/`); each URL below is the `url:` on line 1 of its file, verbatim:
  - `nbc-farmed-salmon-contaminated.md`, `https://www.nbcnews.com/id/wbna3980525` (STRONG in the register; a 2004 WebMD article on a Science study). Supports (file lines 151-155): the study tested 14 contaminants including PCBs and other dioxins and pesticide residues; concentrations in farmed salmon were significantly higher than in wild for all 14; the most contaminated farmed salmon came from Europe; the levels were "well under" the FDA tolerance levels for bought fish (line 155); the FDA's then advice was not to change salmon eating (line 149). It is a 2004 article: always say "a 2004 Science study".
  - `qz-farmed-salmon-color-added.md`, `https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it` (line 9 body, line 43). Supports: farmed salmon flesh is naturally gray; farmers add astaxanthin ("pink-ifying pellets") to the feed; wild salmon get their color from krill and shrimp; after a 2003 lawsuit sellers must tell customers the color is "added".
  - `seafoodwatch-chile-farmed-salmon.md`, `https://www.montereybayaquarium.org/change-impact/our-conservation-work/global-ocean-conservation-programs/global-seafood-projects/farmed-salmon-in-chile` (line 551, 555). Supports: two-thirds of Chilean farmed salmon is rated red by Seafood Watch for high antibiotic use; Chile uses more antibiotics than any other salmon-farming country.
- NOT used (do not cite): `wapf-redefining-farm-raised-fish.md` (WEAK, podcast); no archive file supports an omega-3 claim, a "nutrition" claim, a mercury number for salmon, or a price comparison.
- What is said, as label truth (rephrase freely, keep each fact, zero first person, no em dash):
  - Contaminants: a 2004 Science study tested 14 contaminants, PCBs and dioxins among them, and all 14 were higher in farmed salmon than in wild. Said as a comparison, with the FDA-tolerance sentence beside it so the card is not one-sided. Never say farmed salmon is unsafe, causes anything, or that the levels are a danger; do not repeat the article's health sentences, the cancer arithmetic, the EPA "safe levels" line or any person quoted.
  - Color: wild salmon get their color from krill and shrimp; farmed salmon flesh is gray until astaxanthin in the feed sets the pink; a label line reading "color added" means the feed was pigmented. Say "feed was pigmented", never "dyed", never "artificial" (the page says some astaxanthin is made from algae or crustaceans).
  - Ladder (closest to nature; best + close second): wild Alaskan salmon, fresh or frozen > canned wild salmon (already named in `instead`) > farmed salmon with its country of origin read. For `smoked_salmon`: smoked wild salmon > farmed smoked salmon with its country read. For the label card: wild-caught first, then farm-raised with its country read.
  - Chile: Seafood Watch rates two-thirds of Chilean farmed salmon red for antibiotic use. Attribute to Seafood Watch; no other figure; do not name any producer.
- Readability lint binds new `buying_tips`/`watch_out` strings (`counterCardLint.js` READ_*): every sentence at most 20 words, and no sentence with more than one semicolon (the dry run failed on a 24-word, a 22-word two-semicolon and a 21-word sentence). Write short sentences; use full stops, not semicolon chains.
- `salmon_wild_vs_farmed`: APPEND to `buying_tips` two tips (contaminants; ladder) and to `watch_out` two lines (the comparison/FDA-tolerance line; the Chile line). Add source objects `{"name": "WebMD via NBC News: Do risks of farmed salmon outweigh benefits?", "url": "https://www.nbcnews.com/id/wbna3980525"}` and `{"name": "Monterey Bay Aquarium: Farmed salmon in Chile", "url": "<the Seafood Watch URL above>"}` after the existing sources.
- `smoked_salmon`: APPEND to `buying_tips` two tips (wild color from krill and shrimp, farmed gray until astaxanthin sets the pink; ladder) and to `watch_out` one line (a "color added" line means the feed was pigmented). Add the Quartz source object `{"name": "Quartz: Here is why your farmed salmon has color added to it", "url": "https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it"}`.
- `label_wild_vs_farm_raised`: APPEND to `buying_tips` two tips (color-added line on farm-raised salmon; salmon ladder) and to `watch_out` one line (color added means the feed was pigmented, not that the fish was dyed after harvest). Add the same Quartz source object.
- Must keep: every existing `buying_tips` and `watch_out` string on all three cards verbatim and in order (tip 0 unchanged); `decision`, `cart_pick`, `tier_note`, `why`, `short_answer`, `detail`, `science`, `labels_decoded`, `pick_steps`, `kristy_take`, `instead`, `aliases`, `asked_as` unchanged; `farmed_fish_by_species` deep-equal. Existing sources stay.
- Claim lock / no-treatment: food never causes, prevents or treats anything; no disease language; zero first person; no em-dash asides; no price; no named brand or producer; no calorie talk.
- Two-line rule: `scripts/twoLineCheck.js` must pass (the dry run: no change to `decision`/tip 0 keeps it at 181 checked, 0 violations).
- Pins: add `watch_out` and `sources` and the extended `buying_tips` to `TWO_LINE[id]` for all three ids in `server/test/acceptance/twoLinePin.js` (edit the existing entries inline, pin equals live KB), then add `salmon_wild_vs_farmed`, `smoked_salmon`, `label_wild_vs_farm_raised` to the `CONCERN` set (line ~3119). The `CONCERN` addition is required: it is what makes the k16 fix below work.
- Older tests, from a DRY RUN with plausible text on all three cards (readability-clean wording, ids in `CONCERN`, pins added): `npm test` failed exactly one older test, each to be fixed only this way:
  - `server/test/acceptance/k16.test.js:97-103` (C5 "every cited URL hits line 1 of a docs/sources/k16 file"): `smoked_salmon` is one of its `NEW` cards and the Quartz URL is not a k16 source. Fix: `import { beforeConcern } from './twoLinePin.js';` and read the sources at line 101 through it, `(beforeConcern(byId(id))?.sources ?? [])` (default read, sources only, scoped by `CONCERN` to the three ids; no other k16 assertion changes). Never edit `docs/sources/k16`.
  - Everything else passed: k6, k14 C12 (byte pins), k22 C10 (ban regex), ic6b (source pins), k3-1, ic8a/ic8b, counterCardLint, twoLine all stay green with readable wording. If a different older test fails on the builder's wording, report it (file:line, assertion); do not edit it beyond the `beforeConcern` read pattern, and never edit `fixtures/*` or `*.before.json`.
- Do lines: none of the three cards' `decision` changes, so `docs/do-lines-review.md` and `server/lib/doLines.json` need no edit; run `node scripts/buildDoLines.js` from `server/` and commit only if it writes a diff. Not migrated.

## Criteria
- C1 [test] `salmon_wild_vs_farmed` names the contaminants finding (PCBs, dioxins, all 14 higher in farmed than wild, "2004"), the FDA-tolerance counterweight, the Chile antibiotic rating (Seafood Watch, red) and the ladder (wild Alaskan, canned wild, farmed with country of origin).
- C2 [test] `smoked_salmon` and `label_wild_vs_farm_raised` name color added (astaxanthin / feed pigmented, krill and shrimp for wild) and the wild-first ladder with the country of origin; the label card says the fish is not dyed after harvest.
- C3 [test] The must-keep lines survive: every pre-batch `buying_tips` and `watch_out` string is on its card in order; frozen fields unchanged on all three; `farmed_fish_by_species` deep-equal.
- C4 [test] The batch's new tips and watch_outs satisfy readability: each sentence at most 20 words, at most one semicolon.
- C5 [test] Sources: the three cards between them cite the NBC, Seafood Watch and Quartz URLs, each is a line-1 `url:` of a concern archive file, no existing source is dropped, every URL on a card is one it carried before or is in the archive.
- C6 [test] No text this batch adds contains causes/prevents/cancer/toxic/unsafe/safe/harm/risk/linked to/hormone/health/neurological/immune, "dyed", "artificial", first person, an em dash, a price or calorie word, or a producer/brand name.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSalmon.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSalmon.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSalmon.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSalmon.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSalmon.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernSalmon.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernSalmon.test.js
```js
// concern-salmon: salmon cards name the farmed-salmon concerns and the wild-first ladder; earlier lines stay; no illness claims; sources from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '262bc45:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
// Text this batch adds; lines already on the card before the batch are not this batch's claims.
const addedList = (id) => { const old = new Set(fields(was(id))); return fields(card(id)).filter((s) => !old.has(s)); };
const added = (id) => addedList(id).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const HOME = 'salmon_wild_vs_farmed';
const SMOKED = 'smoked_salmon';
const LABEL = 'label_wild_vs_farm_raised';
const ALL = [HOME, SMOKED, LABEL];
const NBC = 'https://www.nbcnews.com/id/wbna3980525';
const QZ = 'https://qz.com/358811/heres-why-your-farmed-salmon-has-color-added-to-it';
const SW = 'https://www.montereybayaquarium.org/change-impact/our-conservation-work/global-ocean-conservation-programs/global-seafood-projects/farmed-salmon-in-chile';
const WANT = { [HOME]: [NBC, SW], [SMOKED]: [QZ], [LABEL]: [QZ] };

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 the salmon card names the contaminants finding, its counterweight, Chile and the ladder', () => {
  const c = card(HOME);
  const tips = (c.buying_tips || []).join(' \n ');
  const outs = (c.watch_out || []).join(' \n ');
  assert.match(tips, /2004/, 'dated study');
  assert.match(tips, /PCBs/);
  assert.match(tips, /dioxins/i);
  assert.match(tips, /all 14[^.]*(higher|more)[^.]*farmed[^.]*wild/i, 'all 14 higher in farmed');
  assert.match(tips, /wild Alaskan[\s\S]*canned wild[\s\S]*farmed[\s\S]*country of origin/i, 'ladder wild Alaskan > canned wild > farmed with country');
  assert.match(outs, /FDA[^.]*tolerance/i, 'FDA tolerance counterweight');
  assert.match(outs, /Seafood Watch[^.]*Chile[^.]*red[^.]*antibiotic|Seafood Watch[^.]*red[^.]*Chilean[^.]*antibiotic/i, 'Chile red for antibiotic use');
});

test('C2 smoked salmon and the label card name color added and the wild-first ladder', () => {
  for (const id of [SMOKED, LABEL]) {
    const t = text(card(id));
    assert.match(t, /astaxanthin|color added/i, `${id} color added`);
    assert.match(t, /krill and shrimp/i, `${id} wild color source`);
    assert.match(t, /feed was pigmented|feed sets the pink/i, `${id} feed pigment`);
    assert.match(t, /wild[^.]*(first|salmon)\.[^.]*farm[^.]*country of origin/i, `${id} ladder`);
  }
  assert.match(text(card(LABEL)), /not that the fish was dyed after harvest/i, 'label card: not dyed after harvest');
  assert.ok((card(SMOKED).watch_out || []).some((s) => /color added/i.test(s)), 'smoked watch_out names the label line');
});

test('C3 earlier lines stay and farmed_fish_by_species is untouched', () => {
  for (const id of ALL) {
    const a = card(id), b = was(id);
    for (const f of ['buying_tips', 'watch_out']) {
      const old = b[f] || [];
      assert.deepEqual((a[f] || []).slice(0, old.length), old, `${id}.${f} lost or reordered a line`);
      assert.ok((a[f] || []).length > old.length, `${id}.${f} gained nothing`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note', 'why', 'short_answer', 'detail', 'science', 'labels_decoded', 'pick_steps', 'kristy_take', 'instead', 'aliases', 'asked_as']) assert.deepEqual(a[f], b[f], `${id}.${f} changed`);
    assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
  }
  assert.deepEqual(card('farmed_fish_by_species'), was('farmed_fish_by_species'), 'farmed_fish_by_species changed');
});

test('C4 new lines are readable: at most 20 words a sentence, at most one semicolon', () => {
  const lines = nonEmpty(ALL.flatMap(addedList), 'added lines', 9);
  for (const l of lines) {
    for (const s of l.split(/(?<=[.!?])\s+/)) {
      assert.ok(s.split(/\s+/).length <= 20, `sentence over 20 words: ${s}`);
      assert.ok((s.match(/;/g) || []).length <= 1, `stacked semicolons: ${s}`);
    }
  }
});

test('C5 sources come from the concern archive and nothing is dropped', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const u of [NBC, QZ, SW]) assert.ok(archived.has(u), `${u} not a url: line in the concern archive`);
  for (const id of ALL) {
    const before = new Set(urlsOf(was(id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    for (const u of WANT[id]) assert.ok(urls.includes(u), `${id} does not cite ${u}`);
    for (const u of before) assert.ok(urls.includes(u), `${id} dropped source ${u}`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C6 no illness claims, first person, em dash, price, calorie talk or producer name in what the batch adds', () => {
  const BAN = /\b(causes?|prevents?|lowers? (the )?risk|cancer|tumou?rs?|toxic\w*|unsafe|safe|safer|harm\w*|risks?|linked to|hormon\w*|health\w*|neurolog\w*|immun\w*|dyed|artificial|exposure)\b/i;
  const BRANDS = /\b(Salmon of the Americas|DSM|SalmoFan|Hoffman|Crayola|Foran|Troxell|Santerre|Bolger|Whole Foods|Trader Joe|Costco|Mowi|Verlasso|Kroger|Sprouts)\b/i;
  nonEmpty(ALL.filter((id) => added(id)), 'cards with added text', ALL.length);
  for (const id of ALL) {
    const t = added(id);
    assert.doesNotMatch(t, BAN, `${id} treatment wording`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    assert.doesNotMatch(t, /—/, `${id} em dash`);
    assert.doesNotMatch(t, /\$\s?\d|\bprice\w*|\bcheap\w*|\bcalor\w*|\blogged\b/i, `${id} price or calorie wording`);
    assert.doesNotMatch(t, BRANDS, `${id} brand or person name`);
  }
});
```
