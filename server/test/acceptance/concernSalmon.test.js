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
  assert.match(text(card(LABEL)), /feed was pigmented\.? .{0,30}\bnot\b[^.]*after harvest/i, 'label card: feed pigmented, not colored after harvest');
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
