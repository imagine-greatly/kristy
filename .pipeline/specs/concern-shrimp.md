# concern-shrimp — the shrimp card names the antibiotic, bacteria, wet-shrimp and mislabel concerns and the wild-first ladder

```json
{
  "id": "concern-shrimp",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "docs/do-lines-review.md", "server/lib/doLines.json"],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/produce_seafood/INDEX.md",
    "docs/sources/concerns/produce_seafood/cr-shrimp-safety.md",
    "docs/sources/concerns/produce_seafood/shrimpalliance-fda-refusal-report.md",
    "docs/sources/concerns/produce_seafood/thefishsite-stpp-in-fish.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "server/lib/counterCardLint.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernShrimp.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern rows `seafood_antibiotics`
(PARTIAL, docs/CONCERN-COVERAGE.md line 105; shrimp card listed as non-home but names nothing), `shrimp_bacteria` (PARTIAL, non-home
only, line 106), `seafood_stpp` (PARTIAL, line 107); §D item 18 (line 336: `shrimp_imported_vs_domestic` misses STPP, antibiotics, bacteria).
Register rows: docs/CONCERN-REGISTER.md lines 140-142. The `sulfites` row (line 129) is NOT in this batch: `asthma-nz-sulphites.md`
never mentions shrimp, so no archive line supports a shrimp sulfite claim. Say nothing about sulfites.

Card, verified present in `server/kristy_perimeter_kb.json` `entries`: `shrimp_imported_vs_domestic` (`seafood`; aliases shrimp, prawns, imported shrimp, domestic
shrimp, farmed shrimp; the only card covering shrimp). It already has a `TWO_LINE` entry in `twoLinePin.js` (decision + buying_tips).

State before this batch (HEAD `d802324`; these must not change):
- decision "Wild American or Gulf shrimp; read the country of origin."; cart_pick "Wild American shrimp"; 3 tips (first: "Country of origin is printed by law, and wild American traces to a managed fishery."); 3 watch_out (first: "Where wild American is not stocked, check for a BAP or ASC certification. It stands in for knowing the farm."); 3 sources (two plain strings, one with an inline NC Sea Grant URL). `pick_steps` already points "Wild or farmed: see Salmon."

## Change
- Archive sources (concern archive, `docs/sources/concerns/produce_seafood/`); each URL below is the `url:` on line 1 of its file, verbatim:
  - `cr-shrimp-safety.md`, `https://www.consumerreports.org/cro/magazine/2015/06/shrimp-safety/index.htm` (STRONG; a 2015 Consumer Reports article, samples bought March 2014). Supports: line 752, of 205 raw farmed imported samples 11 from Vietnam, Thailand and Bangladesh tested positive for antibiotics; line 760, CR recommends farmed shrimp labeled Naturland or Aquaculture Stewardship Council, and found antibiotics on four samples carrying another common certification label; lines 771 and 775, U.S. wild shrimp were among the least likely to carry bacteria or chemicals and responsibly caught U.S. wild shrimp is CR's top choice; lines 719-737, 60 percent of raw samples had bacteria, by origin 20 percent of U.S. wild (55 samples) up to 83 percent of Bangladesh farmed, imported farmed range 42 to 83 percent; line 717, 16 percent of cooked ready-to-eat samples had bacteria; line 721 and 815, cooking kills most of the bacteria and cooked is not a guarantee; line 797, a 2014 Oceana DNA test of 143 samples found 30 percent of labels misleading, farmed white-leg sold as wild.
  - `shrimpalliance-fda-refusal-report.md`, `https://shrimpalliance.com/august-2026-fda-antibiotic-contaminated-shrimp-import-refusal-report/` (WEAK in the register: a domestic industry group, so always attribute it). Supports (line 297): through the first eight months of 2026 the most FDA shrimp refusals for veterinary drug residues came from India (16), Indonesia (10) and Vietnam (10).
  - `thefishsite-stpp-in-fish.md`, `https://thefishsite.com/articles/warnings-of-sodium-tripolyphosphate-in-fish` (lines 98-106). Supports: shrimp is among the seafood commonly soaked; wet product holds extra water; ask the case whether the shrimp is "dry".
- NOT used (do not cite or state): sulfites on shrimp (no archive line); MRSA; Gentian violet or organophosphate claims; the "toxic", "may cause cancer", "suspected neurotoxin" sentences; `seafoodsource-msc-criticism.md`; any retailer named in the CR test; any price comparison; the CR calorie and nutrient line; the BAP-share statistic from the Alliance page.
- What is said, as label truth (rephrase freely, keep each fact, zero first person, no em dash):
  - Antibiotics: a 2015 Consumer Reports test found antibiotics in 11 of 205 raw imported pond-raised shrimp samples; the 11 came from Vietnam, Thailand and Bangladesh. A certification label alone is not proof: antibiotics showed on four samples carrying one common label (do NOT name that label). The Southern Shrimp Alliance, a domestic industry group, counts 2026 FDA drug-residue refusals led by India, Indonesia and Vietnam.
  - Bacteria: that test found bacteria on 20 percent of raw U.S. wild samples and 42 to 83 percent of imported ones. Cooking through kills most of the bacteria; cooked shrimp is no guarantee, since 16 percent of cooked samples carried bacteria.
  - Mislabel: a 2014 Oceana DNA test found 30 percent of shrimp labels misleading, some pond-raised shrimp sold as wild.
  - Wet shrimp: ask the case if the shrimp is dry; wet shrimp holds extra water (the scallops card's own wording).
  - Ladder (closest to nature; best + close second): best is wild American shrimp; a close second is pond-raised shrimp labeled Naturland or Aquaculture Stewardship Council; last, imported shrimp with the country of origin read.
- Owned-fact wording (health-first lint, `counterCardLint.js` `OWNED_FACTS`): the salmon card owns wild/farmed wording and the scallops card owns the phosphate soak, and both list this card in their family. `REPEATED_CLAIM` therefore fails any new string on this card containing "farmed", "farm-raised", "wild-caught", "phosphate", "STPP" or "soaked" (the dry run failed `healthFirst.test.js` on "farmed"). Write "pond-raised" and "imported" for farmed shrimp; say "wet shrimp holds extra water", never name the additive.
- Readability lint binds new `buying_tips`/`watch_out` strings (`counterCardLint.js` READ_*): every sentence at most 20 words, and no sentence with more than one semicolon (the dry run failed on two 21-word sentences). Use full stops, not semicolon chains.
- `shrimp_imported_vs_domestic`: APPEND to `buying_tips` four tips (the antibiotic finding; the best and close-second ladder; the last rung with country read; ask if dry) and to `watch_out` five lines (the 11 countries plus the certification caution; the bacteria range; cooking and cooked samples; the Alliance refusals; the Oceana mislabel). Add source objects `{"name": "Consumer Reports: Shrimp safety", "url": "<CR URL above>"}`, `{"name": "Southern Shrimp Alliance: FDA refusal report", "url": "<Alliance URL above>"}` and `{"name": "The Fish Site: STPP in fish", "url": "<Fish Site URL above>"}` after the existing sources.
- Must keep: every existing `buying_tips` and `watch_out` string verbatim and in order (tip 0 unchanged); `decision`, `cart_pick`, `tier_note`, `why`, `short_answer`, `detail`, `science`, `labels_decoded`, `pick_steps`, `kristy_take`, `aliases`, `asked_as`, `question`, `title` unchanged. Existing sources stay. The existing BAP/ASC watch_out stays verbatim (append-only); the new certification caution corrects it by addition.
- Claim lock / no-treatment: food never causes, prevents or treats anything; no disease language (no vibrio, MRSA or food-poisoning claims); zero first person; no em-dash asides; no price; no named brand, retailer or producer (Naturland and Aquaculture Stewardship Council are certifications, named only as the positive rung; no negative claim about a certification by name); no calorie talk.
- Two-line rule: `scripts/twoLineCheck.js` must pass (no change to `decision`/tip 0 keeps it at 181 checked, 0 violations).
- Pins: edit the existing `TWO_LINE.shrimp_imported_vs_domestic` entry in `server/test/acceptance/twoLinePin.js` (line ~46) so it pins `decision`, the extended `buying_tips`, and adds `watch_out` and `sources` (pin equals live KB), then add `shrimp_imported_vs_domestic` to the `CONCERN` set (line ~3175, after `label_wild_vs_farm_raised`). Pins are required: `beforeConcern` throws on a `CONCERN` id without a pin.
- Older tests, from a DRY RUN with plausible text on the card (readability-clean, owned-fact-clean wording, pin and `CONCERN` id added): the full `npm test` passed (2770 pass, 0 fail) and `twoLineCheck` read 181 checked, 0 with violations. No older test needs an edit: k6, k14 C12 (byte pins), k16 C5, k22 C10, ic6b, ic8b, k3-1, healthFirst, counterCardLint and twoLine all stay green. (Failures seen in the first dry runs were all the builder-text traps above: a 21-word sentence, and "farmed" tripping `REPEATED_CLAIM`.) If a different older test fails on the builder's wording, report it (file:line, assertion); do not edit it beyond the `beforeConcern(e, { copy: true })` read pattern scoped to this id, and never edit `fixtures/*` or `*.before.json`.
- Do lines: `decision` does not change, so `docs/do-lines-review.md` and `server/lib/doLines.json` need no edit; run `node scripts/buildDoLines.js` from `server/` and commit only if it writes a diff. Not migrated.

## Criteria
- C1 [test] `shrimp_imported_vs_domestic` names the antibiotic finding (Consumer Reports, 2015, 11 of 205, Vietnam, Thailand, Bangladesh), the certification caution, the Southern Shrimp Alliance refusals (India, Indonesia) and the ladder (wild American, Naturland or Aquaculture Stewardship Council, country of origin).
- C2 [test] The card names the bacteria finding (20 percent of U.S. wild up to 83 percent, 16 percent of cooked), cooking through, the Oceana mislabel (30 percent, sold as wild) and the dry-shrimp ask with the extra-water reason.
- C3 [test] The must-keep lines survive: every pre-batch `buying_tips` and `watch_out` string is on the card in order; frozen fields unchanged.
- C4 [test] The batch's new tips and watch_outs satisfy readability: each sentence at most 20 words, at most one semicolon.
- C5 [test] Sources: the card cites the CR, Alliance and Fish Site URLs, each is a line-1 `url:` of a concern archive file, no existing source is dropped, every URL on the card is one it carried before or is in the archive.
- C6 [test] No text this batch adds contains causes/prevents/cancer/toxic/unsafe/safe/harm/risk/linked to/hormone/health/neurological/immune/exposure, "artificial", "dyed", the owned-fact words (farmed, farm-raised, wild-caught, phosphate, STPP, soaked), first person, an em dash, a price or calorie word, or a brand, retailer, certification-by-name caution or person name.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernShrimp.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernShrimp.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernShrimp.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernShrimp.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernShrimp.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernShrimp.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernShrimp.test.js
```js
// concern-shrimp: the shrimp card names the antibiotic, bacteria, wet-shrimp and mislabel concerns and the wild-first ladder; earlier lines stay; no illness claims; sources from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'd802324:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
// Text this batch adds; lines already on the card before the batch are not this batch's claims.
const addedList = (id) => { const old = new Set(fields(was(id))); return fields(card(id)).filter((s) => !old.has(s)); };
const added = (id) => addedList(id).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ID = 'shrimp_imported_vs_domestic';
const CR = 'https://www.consumerreports.org/cro/magazine/2015/06/shrimp-safety/index.htm';
const SSA = 'https://shrimpalliance.com/august-2026-fda-antibiotic-contaminated-shrimp-import-refusal-report/';
const FISH = 'https://thefishsite.com/articles/warnings-of-sodium-tripolyphosphate-in-fish';

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 the shrimp card names the antibiotic finding, the refusals, the certification caution and the ladder', () => {
  const c = card(ID);
  const tips = (c.buying_tips || []).join(' \n ');
  const outs = (c.watch_out || []).join(' \n ');
  assert.match(tips, /Consumer Reports/);
  assert.match(tips, /2015/, 'dated test');
  assert.match(tips, /antibiotics[^.]*11 of 205|11 of 205[^.]*antibiotics/i, 'antibiotics in 11 of 205 samples');
  assert.match(tips, /wild American[\s\S]*Naturland[\s\S]*Aquaculture Stewardship Council[\s\S]*country of origin/i, 'ladder wild American > Naturland/ASC > country read');
  assert.match(outs, /Vietnam[\s\S]*Thailand[\s\S]*Bangladesh|Thailand[\s\S]*Vietnam[\s\S]*Bangladesh/i, 'countries of the 11');
  assert.match(outs, /certification[^.]*(not|no)[^.]*proof|label[^.]*not proof/i, 'a certification alone is not proof');
  assert.match(outs, /Southern Shrimp Alliance/);
  assert.match(outs, /India/);
  assert.match(outs, /Indonesia/);
  assert.match(outs, /refusals?/i);
});

test('C2 the shrimp card names the bacteria finding, cooking, wet shrimp and mislabeling', () => {
  const c = card(ID);
  const tips = (c.buying_tips || []).join(' \n ');
  const outs = (c.watch_out || []).join(' \n ');
  assert.match(outs, /bacteria/i, 'bacteria');
  assert.match(outs, /20 percent/, 'bacteria on 20 percent of U.S. wild');
  assert.match(outs, /83 percent/, 'top of the imported range');
  assert.match(outs, /16 percent/, 'cooked samples');
  assert.match(outs, /cook\w*[^.]*(kill|most)/i, 'cooking through');
  assert.match(outs, /Oceana/);
  assert.match(outs, /30 percent[^.]*label/i, 'mislabeled share');
  assert.match(outs, /sold as wild/i);
  assert.match(tips, /\bdry\b/i, 'ask if dry');
  assert.match(tips, /water/i, 'wet shrimp holds water');
});

test('C3 earlier lines stay and frozen fields are untouched', () => {
  const a = card(ID), b = was(ID);
  for (const f of ['buying_tips', 'watch_out']) {
    const old = b[f] || [];
    assert.deepEqual((a[f] || []).slice(0, old.length), old, `${f} lost or reordered a line`);
    assert.ok((a[f] || []).length > old.length, `${f} gained nothing`);
  }
  for (const f of ['decision', 'cart_pick', 'tier_note', 'why', 'short_answer', 'detail', 'science', 'labels_decoded', 'pick_steps', 'kristy_take', 'instead', 'aliases', 'asked_as', 'question', 'title']) assert.deepEqual(a[f], b[f], `${f} changed`);
  assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], 'tip0 changed');
});

test('C4 new lines are readable: at most 20 words a sentence, at most one semicolon', () => {
  const lines = nonEmpty(addedList(ID), 'added lines', 6);
  for (const l of lines) {
    for (const s of l.split(/(?<=[.!?])\s+/)) {
      assert.ok(s.split(/\s+/).length <= 20, `sentence over 20 words: ${s}`);
      assert.ok((s.match(/;/g) || []).length <= 1, `stacked semicolons: ${s}`);
    }
  }
});

test('C5 sources come from the concern archive and nothing is dropped', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const u of [CR, SSA, FISH]) assert.ok(archived.has(u), `${u} not a url: line in the concern archive`);
  const before = new Set(urlsOf(was(ID)));
  const urls = nonEmpty(urlsOf(card(ID)), 'shrimp sources', 1);
  for (const u of [CR, SSA, FISH]) assert.ok(urls.includes(u), `shrimp does not cite ${u}`);
  for (const u of before) assert.ok(urls.includes(u), `dropped source ${u}`);
  for (const u of urls) assert.ok(before.has(u) || archived.has(u), `url not archived: ${u}`);
  assert.ok((card(ID).sources || []).length > (was(ID).sources || []).length, 'no source added');
});

test('C6 no illness claims, first person, em dash, price, calorie talk, brand or owned-fact wording in what the batch adds', () => {
  const BAN = /\b(causes?|prevents?|lowers? (the )?risk|cancer|tumou?rs?|toxic\w*|unsafe|safe|safer|harm\w*|risks?|linked to|hormon\w*|health\w*|neurolog\w*|immun\w*|exposure|artificial|dyed)\b/i;
  // Owned facts (counterCardLint OWNED_FACTS): the salmon card owns wild/farmed wording, the scallops card owns the phosphate soak.
  const OWNED = /\b(farmed|farm[- ]raised|wild[- ]caught|phosphates?|STPP|soaked)\b/i;
  const BRANDS = /\b(Whole Foods|Costco|Kroger|Sprouts|Walmart|Albertsons|Hy-Vee|Fry's|Best Aquaculture|BAP|Marine Stewardship|MSC|Trader Joe|Rangan|Crupain|Cufone|Keledjian|Warner)\b/i;
  const t = nonEmpty([added(ID)], 'added text', 1)[0];
  assert.ok(t.length > 0, 'nothing added');
  assert.doesNotMatch(t, BAN, 'treatment wording');
  assert.doesNotMatch(t, OWNED, 'owned-fact wording (REPEATED_CLAIM)');
  assert.doesNotMatch(t, /\b(I|me|my)\b/, 'first person');
  assert.doesNotMatch(t, /—/, 'em dash');
  assert.doesNotMatch(t, /\$\s?\d|\bprice\w*|\bcheap\w*|\bcalor\w*|\blogged\b/i, 'price or calorie wording');
  assert.doesNotMatch(t, BRANDS, 'brand or person name');
});
```
