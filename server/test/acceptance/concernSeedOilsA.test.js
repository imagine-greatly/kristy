// concern-seedoils-a: oil and spread cards name the seed oils to skip and a natural fat to take; avocado oil is never
// recommended; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_3 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_3); // t6-3: pantry pins read 6d6ca49; t6_3.test.js owns live copy.
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '2467f1f:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['cooking_oils', 'nut_butter_ingredients', 'plant_butter', 'label_cold_pressed_expeller', 'mayo', 'deli_salads', 'hummus', 'rotisserie_chicken'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 seed oil and natural fat named', () => {
  for (const id of nonEmpty(ALL, 'cards', 8)) {
    const t = text(card(id));
    assert.match(t, /seed oil|canola|sunflower|soybean|safflower|cottonseed|corn oil/i, `${id} seed oil`);
    assert.match(t, /tallow|olive|coconut|butter|ghee|lard/i, `${id} natural fat`);
  }
});

test('C2 avocado oil never recommended', () => {
  const hits = [];
  for (const id of ALL) for (const s of fields(card(id))) for (const sent of s.split(/(?<=[.;!?])\s+/)) if (/avocado/i.test(sent)) hits.push([id, sent]);
  for (const [id, sent] of hits) assert.match(sent, /skip|never|not|can carry|avoid/i, `${id}: ${sent}`);
});

test('C3 oil decisions name a natural fat', () => {
  for (const id of ['cooking_oils', 'plant_butter', 'label_cold_pressed_expeller', 'mayo']) assert.match(card(id).decision, /olive|coconut|tallow|butter/i, id);
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

test('C5 no treatment or mechanism claims, no first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|inflam\w*|toxic\w*)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
});
