# concern-bpa — four canned-food cards and the canned-tomato pick name the can lining and the BPA-free rung

```json
{
  "id": "concern-bpa",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "server/test/acceptance/ic6b.test.js", "server/test/acceptance/k6.test.js", "server/test/acceptance/k14.test.js", "server/test/acceptance/k22.test.js", "docs/do-lines-review.md", "server/lib/doLines.json"],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/dairy_eggs_packaging/INDEX.md",
    "docs/sources/concerns/dairy_eggs_packaging/ewg-bpa-canned-food.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernBpa.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern row `bpa_cans`
(docs/CONCERN-REGISTER.md, "Packaging"); docs/CONCERN-COVERAGE.md §D item 16 (line 114 row: PARTIAL, home card
`beans_dried_vs_canned`). Today only `beans_dried_vs_canned` names BPA (its `detail`, `labels_decoded` "BPA-free" and `science`);
the five canned-food cards below say nothing about the can lining.

Cards, verified present in `server/kristy_perimeter_kb.json` `entries`:
- `canned_soup` (`bulk_pantry`), `canned_coconut_milk` (`bulk_pantry`), `canned_fish_choosing` (`seafood`), `canned_tuna`
  (`seafood`): full cards.
- `pick_canned_tomatoes` (`bulk_pantry`): `kind: "pick"`, keys exactly `id, kind, title, category, decision, sources`.
  Not in the w4 PILOT set (`server/test/acceptance/w4.test.js:15-16`: categories beef, poultry, poultry_eggs, meat_counter, pork,
  produce, plus seven bread ids), so the 12-word cap does not apply; keep the decision one sentence of at most 20 words.
- `beans_dried_vs_canned` is the home card and stays byte-identical (it already names BPA-free and carries the glyphosate
  batch). It is in the `CONCERN` set already.

State before this batch (these must not change):
- `canned_soup`: decision "Low-sodium canned soup with a short list, can undented."; cart_pick "Low sodium canned soup, undented can"; 8 tips (first: "Low sodium is a fixed ceiling; reduced sodium only means less than a named soup."); 2 watch_out; no tier_note change.
- `canned_fish_choosing`: decision "Fish in olive oil or water, bone-in and skin-on."; cart_pick "Sardines packed in olive oil"; 7 tips (first: "‘Vegetable oil’ on a tin is nearly always a seed oil blend it will not name.").
- `canned_tuna`: decision "Canned light tuna, or a can naming skipjack."; cart_pick "Canned light tuna"; 4 tips; 2 watch_out.
- `canned_coconut_milk`: decision "Canned coconut milk, read for anything added beyond coconut."; cart_pick "Canned coconut milk with a short list"; 3 tips; 1 watch_out.
- `pick_canned_tomatoes`: decision "Skip any can that is dented, rusted, or swollen; the date is a quality mark."; one source (Nebraska Extension).

## Change
- A dry run (one archived source on each of the five, ids added to `CONCERN`) failed exactly these owned tests, each to be fixed only this way: twoLinePin pins (`beforeConcern` throws on an id with no `TWO_LINE` entry: pin every changed field on all five), ic6b (canned_tuna new URL, "no seafood archive exists") and k6 (canned_fish_choosing and canned_tuna frozen field `sources`): read those entries through `beforeConcern` (import from `./twoLinePin.js`), never edit their fixtures. Because k6 gains that overlay, k14 C12 moves `k6` from the byte-identical `git diff 719f9fe --stat` list into its overlay list (`['k6', 'k7', 'k8', 'k10', 'k11']`, the dairy batch's k7 pattern); k22 C10 reads canned_soup's prose (only canned_soup) as `prose(id === 'canned_soup' ? beforeConcern(e, { copy: true }) : e)` (its ban list includes `bpa`, as line 139 does for mayo). Any other older-test failure: report it (file:line, assertion), do not edit.
- The one archive file that supports BPA is `dairy_eggs_packaging/ewg-bpa-canned-food.md` (EWG, `url: https://www.ewg.org/research/bpa-canned-food`).
  Everything said on the cards is limited to what it supports, as label truth:
  - Food cans are commonly lined with an epoxy made with BPA (the page: epoxy resin from polymers containing BPA, favored for
    can coatings; a trade group puts the share of US canned foods so lined at 75 percent). Say "many food cans", never a figure.
  - Ladder, from EWG's consumer steps: **fresh, frozen or dried in place of canned; alternative packaging such as glass >
    a can that says BPA-free on the label > a can that says nothing.** Each full card states the rung that fits its food:
    soup, fish and tuna "fresh or frozen"; coconut milk "glass"; all four then "a can that says BPA-free beats a can that says nothing".
  - BPA-free is the maker's word: the page says that with no clear national standard companies can define BPA-free as they
    wish, and that companies that dropped BPA did not disclose the substitute lining. May be said, attributed to EWG's survey, in
    a `watch_out`. Do not say a BPA-free lining is or is not made of any named chemical (the page names other bisphenols found in
    canned food, but a card must not claim what any lining contains).
  - The page lists tomatoes, fish and coconut milk among the foods surveyed. It does not say tomato cans leach more; do NOT
    say acidic food leaches more. The page says makers cite high-acid foods such as tomatoes as hard to line without BPA; that
    is not repeated on a card.
  - Do not repeat the page's health sentences (estrogen, illness, exposure, pregnancy, children, "rinsing may lower"), any
    count or percentage, any brand name (the page names many; none appear), or the FDA position. Do not add a "rinse" tip.
- Full cards (`canned_soup`, `canned_fish_choosing`, `canned_tuna`, `canned_coconut_milk`): APPEND to `buying_tips` (so
  `buying_tips[0]` is unchanged) two tips and to `watch_out` one line, in this shape (rephrase freely, keep each fact; zero
  first person; no em dash):
  - tip 1: "Many food cans are lined with an epoxy made with BPA. Fresh or frozen <soup|fish|tuna> has no can lining." (coconut
    milk: "... Where the same food is sold in glass, the jar has no can lining.")
  - tip 2: "In a can, pick one that says BPA-free on the label over one that says nothing."
  - watch_out: "BPA-free is the maker's word: EWG found makers define it as they wish, and makers that dropped BPA did not disclose the lining that replaced it."
  Vary the wording across the four cards so no sentence repeats verbatim across them. Add the source object
  `{"name": "EWG: BPA in Canned Food", "url": "https://www.ewg.org/research/bpa-canned-food"}` to `sources`; existing sources stay.
  Never write that a product "contains", "carries" or "has" BPA.
- `pick_canned_tomatoes`: change only `decision` and `sources`. Decision (one sentence, at most 20 words) keeps the dent/rust/swell
  skip and the "quality mark" fact and adds the BPA-free read, e.g. "Skip dented, rusted or swollen cans; read the can for BPA-free; the date is a quality mark." (17 words). Add the same
  EWG source object after the existing Nebraska one. Add no fields.
- Must keep: every existing `buying_tips` and `watch_out` string on the four full cards verbatim and in order; `decision`,
  `cart_pick`, `tier_note`, `why`, `short_answer`, `science`, `labels_decoded`, `pick_steps` unchanged on them;
  `beans_dried_vs_canned` deep-equal to before. No avocado, seed-oil or sodium line moves.
- Claim lock / no-treatment: food and packaging never cause, prevent or treat anything; no disease language; zero first person;
  no em-dash asides; no price; no named brand; no statistics.
- Two-line rule: `scripts/twoLineCheck.js` must pass (picks skipped by it); no full-card decision changes.
- Pins: every changed field goes into `TWO_LINE[id]` in `server/test/acceptance/twoLinePin.js` (pin equals live KB): `buying_tips`,
  `watch_out`, `sources` on the four full cards; `decision`, `sources` on `pick_canned_tomatoes`. None of the five has a
  `TWO_LINE` entry today, and `beforeConcern` throws on a `CONCERN` id with no entry, so add the entries and then add
  `canned_soup`, `canned_fish_choosing`, `canned_tuna`, `pick_canned_tomatoes`, `canned_coconut_milk` to the `CONCERN` set
  (`beans_dried_vs_canned` is already in it). If an older test fails because it reads these cards' sources or text from the live KB against an older archive or fixture, the only allowed edit is to
  read the entry through `beforeConcern` (import from `./twoLinePin.js`; `{ copy: true }` for text checks) and name that test file in
  your report. Never edit `server/test/acceptance/fixtures/*`, `*.before.json` or other historical fixtures. Any other
  older-test failure: report it (file:line, assertion), do not edit. A `cart_pick` must agree with its decision (L5).
- Do lines: `pick_canned_tomatoes` has no row in `docs/do-lines-review.md` or `server/lib/doLines.json` (0 matches); if a row for it exists
  after all, sync the changed decision there and run `node scripts/buildDoLines.js` from `server/`. Full-card decisions do not change. Not migrated.

## Criteria
- C1 [test] The four full cards name BPA and the BPA-free rung (a can that says BPA-free over one that says nothing) and
  the non-can rung that fits the food (soup, fish, tuna: fresh or frozen; coconut milk: glass).
- C2 [test] Each full card says the BPA-free claim is the maker's word (EWG, "as they wish"); no sentence says a product
  "contains", "carries" or "has" BPA; no card says acidic food leaches more.
- C3 [test] The must-keep lines survive: every pre-batch `buying_tips` and `watch_out` string is on its card in order, tip 0
  unchanged; `decision`, `cart_pick`, `tier_note`, `why`, `short_answer`, `science`, `labels_decoded` unchanged on the four
  full cards; `beans_dried_vs_canned` deep-equal to before.
- C4 [test] `pick_canned_tomatoes` decision keeps "dented", "rusted", "swollen" and "quality mark", names BPA-free, is one sentence of at most 20 words,
  and the pick keeps its exact key set.
- C5 [test] Each of the five cards cites `https://www.ewg.org/research/bpa-canned-food`, which is a `url:` line in the concern
  archive; every URL on a card is one it carried before or is in the archive.
- C6 [test] No card text contains causes/prevents/lowers risk/cancer/toxic/unsafe/safe/harm/risk/linked to/estrogen/hormone/
  health/exposure/leach (the existing 'dolphin-safe' label term on canned_fish_choosing is exempt), I/me/my, an em dash, a price word, or a brand name from the EWG page.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBpa.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBpa.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBpa.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBpa.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBpa.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBpa.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernBpa.test.js
```js
// concern-bpa: canned-food cards name the can lining and the BPA-free rung; earlier lines stay; no illness claims; source from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '8d6bcf2:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
// Text this batch adds; lines already on the card before the batch are not this batch's claims.
const added = (id) => { const old = new Set(fields(was(id))); return fields(card(id)).filter((s) => !old.has(s)).join(' \n '); };
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);
const sentences = (id) => fields(card(id)).flatMap((s) => s.split(/(?<=[.;!?])\s+/));

const FULL = ['canned_soup', 'canned_fish_choosing', 'canned_tuna', 'canned_coconut_milk'];
const PICK = 'pick_canned_tomatoes';
const ALL = [...FULL, PICK];
const HOME = 'beans_dried_vs_canned';
const RUNG = { canned_soup: /fresh or frozen/i, canned_fish_choosing: /fresh or frozen/i, canned_tuna: /fresh or frozen/i, canned_coconut_milk: /\bglass\b/i };
const EWG = 'https://www.ewg.org/research/bpa-canned-food';

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 full cards name BPA, the non-can rung and the BPA-free rung', () => {
  for (const id of nonEmpty(FULL, 'full cards', 4)) {
    const t = text(card(id));
    assert.match(t, /\bBPA\b/, `${id} BPA`);
    assert.match(t, RUNG[id], `${id} non-can rung`);
    assert.match(t, /says BPA-free[^.]*over[^.]*says nothing/i, `${id} BPA-free over unlabeled`);
    assert.ok((card(id).buying_tips || []).some((s) => /\bBPA\b/.test(s)), `${id} BPA in a tip`);
  }
});

test('C2 BPA-free is the maker word, no product claim, no acidity claim', () => {
  for (const id of FULL) {
    assert.ok((card(id).watch_out || []).some((s) => /BPA-free/.test(s) && /EWG/.test(s) && /as they wish/i.test(s)), `${id} maker-word watch_out`);
    for (const sent of sentences(id)) {
      if (/\bBPA\b/.test(sent)) assert.doesNotMatch(sent, /\b(contains?|carries|has|have|includes?)\s+(BPA|bisphenol)/i, `${id} claims the product has BPA: ${sent}`);
    }
  }
  assert.doesNotMatch(ALL.map(added).join(' '), /acid(ic)?\b|high-acid|tomato\w*[^.]*(leach|migrat)/i, 'acidity claim');
});

test('C3 earlier lines stay and the home card is untouched', () => {
  for (const id of FULL) {
    const a = card(id), b = was(id);
    for (const f of ['buying_tips', 'watch_out']) {
      const now = a[f] || [];
      const old = b[f] || [];
      assert.deepEqual(now.slice(0, old.length), old, `${id}.${f} lost or reordered a line`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note', 'why', 'short_answer', 'science', 'labels_decoded', 'pick_steps', 'kristy_take']) assert.deepEqual(a[f], b[f], `${id}.${f} changed`);
    assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
  }
  assert.deepEqual(card(HOME), was(HOME), `${HOME} changed`);
});

test('C4 pick_canned_tomatoes keeps its facts and names BPA-free', () => {
  const d = card(PICK).decision;
  for (const re of [/dented/i, /rusted/i, /swollen/i, /quality mark/i, /BPA-free/]) assert.match(d, re);
  assert.ok(d.split(/\s+/).length <= 20, `decision too long: ${d}`);
  assert.equal(d.split(/(?<=[.!?])\s+/).length, 1, 'decision is more than one sentence');
  assert.deepEqual(Object.keys(card(PICK)).sort(), Object.keys(was(PICK)).sort(), 'pick shape changed');
});

test('C5 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  assert.ok(archived.has(EWG), 'EWG BPA url not in archive');
  for (const id of ALL) {
    const before = new Set(urlsOf(was(id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    assert.ok(urls.includes(EWG), `${id} does not cite the EWG BPA page`);
    for (const u of before) assert.ok(urls.includes(u), `${id} dropped source ${u}`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C6 no illness claims, first person, em dash, price or brand', () => {
  const BAN = /\b(causes?|prevents?|lowers? (the )?risk|cancer|tumou?rs?|toxic\w*|unsafe|safe|safer|harm\w*|risks?|linked to|estrogen\w*|hormon\w*|health\w*|exposure|leach\w*|pregnan\w*|infants?|children)\b/i;
  const BRANDS = /\b(Amy'?s|Hormel|Target|Eden|Trader Joe|Whole Foods|Hain|ConAgra|Muir Glen|Annie|Tyson|Sprouts)\b/i;
  nonEmpty(ALL.filter((id) => added(id)), 'cards with added text', ALL.length);
  for (const id of ALL) {
    const t = added(id).replace(/dolphin-safe/gi, '');
    assert.doesNotMatch(t, BAN, `${id} treatment wording`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    assert.doesNotMatch(t, /—/, `${id} em dash`);
    assert.doesNotMatch(t, /\$\s?\d|\bprice\b|\bcheap\w*/i, `${id} price wording`);
    assert.doesNotMatch(t, BRANDS, `${id} brand name`);
  }
});
```
