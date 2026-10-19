// concern-shrimp: the shrimp card names the antibiotic, bacteria, wet-shrimp and mislabel concerns and the wild-first ladder; earlier lines stay; no illness claims; sources from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import { preTidy } from './twoLinePin.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
kb.entries = kb.entries.map(preTidy);
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
