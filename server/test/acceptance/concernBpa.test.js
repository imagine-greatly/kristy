// concern-bpa: canned-food cards name the can lining and the BPA-free rung; earlier lines stay; no illness claims; source from the archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import { preTidy, preCleanPick8 } from './twoLinePin.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
kb.entries = kb.entries.map(preTidy);
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
    const a = preCleanPick8(card(id)), b = was(id);
    for (const f of ['buying_tips', 'watch_out']) {
      const now = a[f] || [];
      const old = b[f] || [];
      assert.deepEqual(now.slice(0, old.length), old, `${id}.${f} lost or reordered a line`);
    }
    for (const f of ['decision', 'cart_pick', 'tier_note', 'why', 'short_answer', 'science', 'labels_decoded', 'pick_steps', 'kristy_take']) assert.deepEqual(a[f], b[f], `${id}.${f} changed`);
    assert.equal((a.buying_tips || [])[0], (b.buying_tips || [])[0], `${id} tip0 changed`);
  }
  assert.deepEqual(preCleanPick8(card(HOME)), was(HOME), `${HOME} changed`);
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
