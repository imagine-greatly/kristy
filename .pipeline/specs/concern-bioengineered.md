# concern-bioengineered — the GMO-crop cards name what a bioengineered label means and omits, and the organic > Non-GMO Project Verified ladder

```json
{
  "id": "concern-bioengineered",
  "tier": "T2",
  "ui": false,
  "owns": ["server/kristy_perimeter_kb.json", "server/test/acceptance/twoLinePin.js", "docs/do-lines-review.md", "server/lib/doLines.json"],
  "read_full": [
    "docs/CONCERN-REGISTER.md",
    "docs/CONCERN-COVERAGE.md",
    "docs/sources/concerns/pantry/INDEX.md",
    "docs/sources/concerns/pantry/cspi-gmo-disclosures.md",
    "docs/sources/concerns/pantry/nongmoproject-gmo-faq.md",
    "server/test/acceptance/twoLinePin.js",
    "server/scripts/twoLineCheck.js",
    "server/lib/counterCardLint.js",
    "VOICE_SPEC.md",
    "server/lib/testGuards.js"
  ],
  "verify": "cd /Users/m1/kristy && node --test server/test/acceptance/concernBioengineered.test.js && cd server && node scripts/buildDoLines.js && node scripts/twoLineCheck.js && npm test"
}
```

Repo `/Users/m1/kristy`, branch `main`. Ask (Devon 2026-10-18): every niche concern tracked and spoken of, every card
"as complete as possible guiding them to get the healthiest version of any food". Concern row `bioengineered` (PARTIAL,
docs/CONCERN-COVERAGE.md line 81; §D item 19, line 337: named only on `label_nonGMO_vs_organic`, missing on the GMO-crop foods).
Register row: docs/CONCERN-REGISTER.md line 101 (ladder organic > Non-GMO Project Verified > unlabeled).

Cards, verified present in `server/kristy_perimeter_kb.json` `entries` (full cards with `buying_tips` and `watch_out`):
`label_nonGMO_vs_organic` (label_terms; the home card), `cooking_oils`, `sugars`, `soy_milk`, `tortilla_chips`, `tortillas`, `popcorn`.
NOT in this batch: `pick_corn` and `pick_tofu` (picks; `PICK_FORBIDDEN_FIELDS` bars `buying_tips`, `watch_out` and `sources` depth, and a pick is one surface sentence);
`breakfast_cereal` (already the heaviest append-only card of the pantry batches; deferred to a later cereal pass). Say nothing about them.

State before this batch (HEAD `c24aea0`; these must not change): the home card has 4 tips (tip 0 "Organic also restricts synthetic pesticides and fertilizers; non-GMO covers one issue."), 3 watch_out and 2 plain-string sources;
`cooking_oils` 9 tips, 1 watch_out; `sugars` 4 tips, 1 watch_out; `soy_milk` 5 tips, 1 watch_out; `tortilla_chips` 6 tips, 2 watch_out; `tortillas` 4 tips, 2 watch_out; `popcorn` 6 tips, 2 watch_out.

## Change
- Archive sources (concern archive, `docs/sources/concerns/pantry/`); each URL below is the `url:` on line 1 of its file, verbatim:
  - `cspi-gmo-disclosures.md`, `https://www.cspi.org/article/what-know-about-new-gmo-disclosures` (STRONG; Nutrition Action, Center for Science in the Public Interest). Supports: lines 233-237, the label word is "Bioengineered" or "Contains Bioengineered Food Ingredients", not "GMO", and means a new gene was inserted; lines 245-249, a "derived from bioengineering" line is voluntary and covers oils, sugars and syrups so processed that no modified DNA remains; line 276, most U.S. soybeans, corn, sugar beets, cotton and canola are bioengineered and "Organic" foods must come from non-GMO plants; lines 278-282, canola oil, soybean oil/lecithin/soy protein, corn syrup/oil/starch, more than half of granulated sugar from sugar beets, popcorn never, most fresh sweet corn is not; line 296, the disclosure can be a phone number to call or text or a QR code instead of words on the package; lines 336-338, the Non-GMO Project does not allow GMO or derived ingredients but labels foods with no GMO version, and the government does not approve non-GMO claims; line 346, the disclosure does not say which ingredient; line 348, restaurants, "very small" companies, most alcohol and foods with meat, poultry or eggs as a major ingredient need not disclose.
  - `nongmoproject-gmo-faq.md`, `https://www.nongmoproject.org/gmo-faq/` (WEAK in the register: a certifier describing its own mark, so attribute it). Supports (line 218): Non-GMO means produced without genetic engineering with ingredients not derived from GMOs; Non-GMO Project Verified means compliance with the Project's Standard, including testing, traceability and segregation.
- NOT used (do not cite or state): any claim that GMO foods do or do not affect health, in either direction (the CSPI "safe" line 217 and 344 and the Non-GMO Project "adverse health effects", herbicide, superweed and cost lines 160-200 are all left out); `nongmoproject-high-risk-inputs.md`; `ewg-dirty-dozen-2026.md`; `kresser-industrial-seed-oils.md`; the CSPI Lean Cuisine and Nature Valley examples (named brands); papaya, potato and apple paragraphs (no card here sells them); the phrase "high-risk".
- What is said, as label truth (rephrase freely, keep each fact, zero first person, no em dash):
  - Home card `label_nonGMO_vs_organic`: the package word is "bioengineered", not "GMO"; the statement is required only where modified DNA remains, so a "derived from bioengineering" line on oils, sugars and syrups is voluntary; the disclosure may be a phone number or QR code and does not name the ingredient; restaurants, very small companies, most alcohol and foods with meat, poultry or eggs as a major ingredient are exempt; the government does not approve non-GMO claims, so Non-GMO Project Verified rests on the Project's own standard; most U.S. soybeans, corn, sugar beets, cotton and canola are bioengineered. Ladder (closest to nature; best + close second): certified organic first, Non-GMO Project Verified a close second, then an unlabeled package with the bioengineered line read.
  - `cooking_oils`: canola, soy, corn and cottonseed oils come from mostly bioengineered crops and are typically "derived from bioengineering", a voluntary line; for those oils, organic first, Non-GMO Project Verified second. Do not say anything about olive or coconut oil's crop.
  - `sugars`: more than half of granulated sugar sold is from bioengineered sugar beets; plain "sugar" names no crop; organic must come from non-GMO plants; the "derived from" line is voluntary because no modified DNA remains in sugar.
  - `soy_milk`: most U.S. soybeans are bioengineered; ladder organic first, Non-GMO Project Verified second; soy lecithin and soy protein come from the same soybeans; the disclosure may sit behind a QR code or phone number.
  - `tortilla_chips` and `tortillas`: most U.S. corn is bioengineered (corn becomes grain, syrup, oil, starch); ladder organic first, Non-GMO Project Verified second; for chips, frying oil from canola, soy or corn is typically derived from bioengineering.
  - `popcorn`: CSPI says popcorn is never bioengineered, so a non-GMO seal on plain kernels adds nothing; oil in ready-popped bags from canola, soy or corn is typically derived from bioengineering. No ladder on this card.
- Owned-fact wording (health-first lint, `counterCardLint.js` `OWNED_FACTS`): `cooking_oils` is in the families of `label_cold_pressed_expeller` (cold-pressed, expeller, hexane, solvent), `olive_oil_grades` (extra-virgin) and `lard_tallow` (lard, tallow). `REPEATED_CLAIM` fails any new string on that card containing those words. Nothing in this batch needs them.
- Readability lint binds new `buying_tips`/`watch_out` strings (`counterCardLint.js` READ_*): every sentence at most 20 words, and no sentence with more than one semicolon. Use full stops, not semicolon chains.
- APPEND (never reorder, never edit) to each card:
  - `label_nonGMO_vs_organic`: 3 tips (the package word and where it hides; what bioengineered means; the ladder) and 5 watch_out (derived line voluntary; phone or QR; exemptions; non-GMO claims not government-approved; crops).
  - `cooking_oils`: 2 tips (which oils are derived from bioengineered crops; the ladder for those) and 1 watch_out (the derived line is voluntary).
  - `sugars`: 2 tips (sugar beets; the ladder) and 1 watch_out (no modified DNA remains, so the line is voluntary).
  - `soy_milk`: 2 tips (soybeans; the ladder) and 1 watch_out (lecithin and soy protein; QR code).
  - `tortilla_chips`: 2 tips (corn; the ladder) and 1 watch_out (frying oil derived).
  - `tortillas`: 2 tips (corn; the ladder) and 1 watch_out (QR or phone).
  - `popcorn`: 1 tip (never bioengineered) and 1 watch_out (bag oil derived).
  - Sources: after each card's existing sources add `{"name": "CSPI: New GMO disclosures", "url": "https://www.cspi.org/article/what-know-about-new-gmo-disclosures"}`, and on every card except `popcorn` also `{"name": "Non-GMO Project: GMO FAQ", "url": "https://www.nongmoproject.org/gmo-faq/"}`.
- Must keep: every existing `buying_tips` and `watch_out` string verbatim and in order (tip 0 unchanged); `decision`, `cart_pick`, `tier_note`, `why`, `short_answer`, `detail`, `science`, `labels_decoded`, `pick_steps`, `kristy_take`, `instead`, `aliases`, `asked_as`, `question`, `title` unchanged. Existing sources stay.
- Claim lock / no-treatment: no health effect claim for or against GMO foods; food never causes, prevents or treats anything; zero first person; no em-dash asides; no price; no named brand or producer (CSPI and the Non-GMO Project are named only as attributed sources; no negative claim about the Project: say only that the government does not approve non-GMO claims); no calorie talk.
- Two-line rule: `scripts/twoLineCheck.js` must pass (`decision` and tip 0 unchanged keeps it at 181 checked, 0 violations).
- Pins: in `server/test/acceptance/twoLinePin.js`, extend the existing `TWO_LINE` entries for `label_nonGMO_vs_organic`, `cooking_oils`, `soy_milk`, `tortilla_chips` and `popcorn` so each pins `decision`, the extended `buying_tips`, `watch_out` and `sources` (pin equals live KB); add new entries for `sugars` and `tortillas` (same four fields). Then add `label_nonGMO_vs_organic`, `sugars` and `tortillas` to the `CONCERN` set (line ~3206, after `shrimp_imported_vs_domestic`; the other four are already members). Pins are required: `beforeConcern` throws on a `CONCERN` id without a pin.
- Older tests: from a DRY RUN with plausible text on all seven cards (readability-clean, owned-fact-clean, pins added for all seven and `label_nonGMO_vs_organic`, `sugars`, `tortillas` added to `CONCERN`): the full `npm test` passed (2776 pass, 0 fail), `twoLineCheck` read 181 checked, 0 with violations, and the Acceptance block below passed 6 of 6. No older test needs an edit: k6, k14 C12 (byte pins), k16 C5, k22 C10, ic6b, ic8b, k3-1, healthFirst, counterCardLint and twoLine all stay green. If a different older test fails on the builder's wording, report it (file:line, assertion); do not edit it beyond the `beforeConcern(e, { copy: true })` read pattern scoped to the affected id, and never edit `fixtures/*` or `*.before.json`.
- Do lines: `decision` does not change, so `docs/do-lines-review.md` and `server/lib/doLines.json` need no edit; run `node scripts/buildDoLines.js` from `server/` and commit only if it writes a diff. Not migrated.

## Criteria
- C1 [test] `label_nonGMO_vs_organic` names the package word "bioengineered", the voluntary derived-from line, the phone or QR disclosure, the exemptions (restaurants, very small companies), that non-GMO claims are not government-approved, and the ladder organic > Non-GMO Project Verified.
- C2 [test] Every other target card names the bioengineered concern with its crop (cooking_oils canola, sugars sugar beets, soy_milk soybeans, tortilla_chips and tortillas corn); the ladder organic > Non-GMO Project Verified appears on each except popcorn; popcorn says it is never bioengineered.
- C3 [test] The must-keep lines survive on all seven cards: every pre-batch `buying_tips` and `watch_out` string is on the card in order; frozen fields unchanged.
- C4 [test] The batch's new tips and watch_outs satisfy readability: each sentence at most 20 words, at most one semicolon.
- C5 [test] Sources: each card cites the CSPI URL (and the Non-GMO Project URL on all but popcorn), each is a line-1 `url:` of a concern archive file, no existing source is dropped, every URL on a card is one it carried before or is in the archive.
- C6 [test] No text this batch adds contains causes/prevents/cancer/toxic/unsafe/safe/harm/risk/linked to/hormone/health/neurological/immune/exposure, "dose", the owned-fact words, first person, an em dash, a price or calorie word, or a brand name.
Also (verify, not a criterion): whole suite stays green and twoLineCheck passes.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBioengineered.test.js"], "dependents": []},
    {"id": "C2", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBioengineered.test.js"], "dependents": []},
    {"id": "C3", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBioengineered.test.js"], "dependents": []},
    {"id": "C4", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBioengineered.test.js"], "dependents": []},
    {"id": "C5", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBioengineered.test.js"], "dependents": []},
    {"id": "C6", "impl": ["server/kristy_perimeter_kb.json"], "tests": ["server/test/acceptance/concernBioengineered.test.js"], "dependents": []}
  ],
  "env": {"executables": ["node", "npm", "git"], "browsers": [], "temp": "none", "network": false}
}
```

## Acceptance server/test/acceptance/concernBioengineered.test.js
```js
// concern-bioengineered: the GMO-crop cards name what a bioengineered label means and omits, and the organic > Non-GMO Project Verified ladder; earlier lines stay; no health claims; sources from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'c24aea0:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
// Text this batch adds; lines already on the card before the batch are not this batch's claims.
const addedList = (id) => { const old = new Set(fields(was(id))); return fields(card(id)).filter((s) => !old.has(s)); };
const added = (id) => addedList(id).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);
const tipsOf = (id) => (card(id).buying_tips || []).join(' \n ');
const outsOf = (id) => (card(id).watch_out || []).join(' \n ');

const HOME = 'label_nonGMO_vs_organic';
const CROP = { cooking_oils: /canola/i, sugars: /sugar beets?/i, soy_milk: /soybeans?/i, tortilla_chips: /\bcorn\b/i, tortillas: /\bcorn\b/i };
const LADDER = /organic[\s\S]*Non-GMO Project Verified/;
const TARGETS = [HOME, 'cooking_oils', 'sugars', 'soy_milk', 'tortilla_chips', 'tortillas', 'popcorn'];
const CSPI = 'https://www.cspi.org/article/what-know-about-new-gmo-disclosures';
const NGP = 'https://www.nongmoproject.org/gmo-faq/';

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 the home card names the package word, the voluntary derived line, the QR or phone route, the exemptions, the unapproved claims and the ladder', () => {
  const tips = tipsOf(HOME), outs = outsOf(HOME);
  assert.match(tips, /bioengineered/i, 'the package word');
  assert.match(tips + outs, /QR code|phone number/i, 'disclosure by QR code or phone');
  assert.match(outs, /derived from bioengineering/i, 'the derived-from line');
  assert.match(outs, /voluntary/i, 'derived line is voluntary');
  assert.match(outs, /restaurants?/i);
  assert.match(outs, /very small/i);
  assert.match(outs, /government[^.]*(not|n't)[^.]*approve|not (government[- ])?approved/i, 'non-GMO claims not government-approved');
  assert.match(outs, /soybeans[\s\S]*corn[\s\S]*sugar beets[\s\S]*canola|canola[\s\S]*sugar beets/i, 'which crops');
  assert.match(tips, LADDER, 'ladder organic > Non-GMO Project Verified');
});

test('C2 each other target card names its crop and the ladder; popcorn says never', () => {
  for (const [id, re] of Object.entries(CROP)) {
    const t = addedList(id).join(' \n ');
    assert.match(t, /bioengineer/i, `${id} names bioengineered`);
    assert.match(t, re, `${id} names its crop`);
    assert.match(tipsOf(id), LADDER, `${id} ladder organic > Non-GMO Project Verified`);
  }
  const p = added('popcorn');
  assert.match(p, /bioengineer/i, 'popcorn names bioengineered');
  assert.match(p, /never/i, 'popcorn is never bioengineered');
  assert.match(p, /CSPI/, 'popcorn attributes CSPI');
  assert.match(outsOf('popcorn'), /derived from bioengineering/i, 'bag oil is derived');
});

test('C3 earlier lines stay and frozen fields are untouched on every target', () => {
  for (const id of nonEmpty(TARGETS, 'targets', 7)) {
    const a = card(id), b = was(id);
    for (const f of ['buying_tips', 'watch_out']) {
      const old = b[f] || [];
      assert.deepEqual((a[f] || []).slice(0, old.length), old, `${id} ${f} lost or reordered a line`);
      assert.ok((a[f] || []).length > old.length, `${id} ${f} gained nothing`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note', 'why', 'short_answer', 'detail', 'science', 'labels_decoded', 'pick_steps', 'kristy_take', 'instead', 'aliases', 'asked_as', 'question', 'title']) assert.deepEqual(a[f], b[f], `${id} ${f} changed`);
    assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
  }
});

test('C4 new lines are readable: at most 20 words a sentence, at most one semicolon', () => {
  for (const id of TARGETS) {
    const lines = nonEmpty(addedList(id), `${id} added lines`, 2);
    for (const l of lines) {
      for (const s of l.split(/(?<=[.!?])\s+/)) {
        assert.ok(s.split(/\s+/).length <= 20, `${id} sentence over 20 words: ${s}`);
        assert.ok((s.match(/;/g) || []).length <= 1, `${id} stacked semicolons: ${s}`);
      }
    }
  }
});

test('C5 sources come from the concern archive and nothing is dropped', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const u of [CSPI, NGP]) assert.ok(archived.has(u), `${u} not a url: line in the concern archive`);
  for (const id of TARGETS) {
    const before = new Set(urlsOf(was(id)));
    const urls = nonEmpty(urlsOf(card(id)), `${id} sources`, 1);
    assert.ok(urls.includes(CSPI), `${id} does not cite CSPI`);
    if (id !== 'popcorn') assert.ok(urls.includes(NGP), `${id} does not cite the Non-GMO Project FAQ`);
    for (const u of before) assert.ok(urls.includes(u), `${id} dropped source ${u}`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
    assert.ok((card(id).sources || []).length > (was(id).sources || []).length, `${id} no source added`);
  }
});

test('C6 no health claims, first person, em dash, price, calorie talk, brand or owned-fact wording in what the batch adds', () => {
  const BAN = /\b(causes?|prevents?|lowers? (the )?risk|cancer|tumou?rs?|toxic\w*|unsafe|safe|safer|harm\w*|risks?|linked to|hormon\w*|health\w*|neurolog\w*|immun\w*|exposure|doses?|allerg\w*|herbicides?|glyphosate|pesticides?)\b/i;
  // Owned facts (counterCardLint OWNED_FACTS) for cooking_oils: oil extraction, olive grade, animal fat.
  const OWNED = /\b(cold[- ]pressed|expeller|hexane|solvents?|extra[- ]virgin|lard|tallow)\b/i;
  const BRANDS = /\b(Whole Foods|Costco|Kroger|Sprouts|Walmart|Trader Joe|Lean Cuisine|Nature Valley|Monsanto|Bayer|Hawaii|Arctic|Pinkglow)\b/i;
  for (const id of TARGETS) {
    const t = nonEmpty([added(id)], `${id} added text`, 1)[0];
    assert.doesNotMatch(t, BAN, `${id} health or treatment wording`);
    assert.doesNotMatch(t, OWNED, `${id} owned-fact wording (REPEATED_CLAIM)`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    assert.doesNotMatch(t, /—/, `${id} em dash`);
    assert.doesNotMatch(t, /\$\s?\d|\bprice\w*|\bcheap\w*|\bcalor\w*|\blogged\b/i, `${id} price or calorie wording`);
    assert.doesNotMatch(t, BRANDS, `${id} brand name`);
  }
});
```
