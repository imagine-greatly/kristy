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
      if (id === 'soy_milk' && f === 'buying_tips') {
        for (const t of old) assert.ok((a[f] || []).includes(t), `${id} ${f} lost a line: ${t}`);
      } else {
        assert.deepEqual((a[f] || []).slice(0, old.length), old, `${id} ${f} lost or reordered a line`);
      }
      assert.ok((a[f] || []).length > old.length, `${id} ${f} gained nothing`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note', 'why', 'short_answer', 'detail', 'science', 'labels_decoded', 'pick_steps', 'kristy_take', 'instead', 'aliases', 'asked_as', 'question', 'title'].filter((f) => id !== 'soy_milk' || !['decision', 'cart_pick', 'kristy_take', 'pick_steps'].includes(f))) assert.deepEqual(a[f], b[f], `${id} ${f} changed`);
    if (id !== 'soy_milk') assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
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
