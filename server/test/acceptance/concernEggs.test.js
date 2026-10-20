// concern-eggs: egg cards name feed first and organic second; "vegetarian fed" is decoded; new sources come
// from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import { preCleanPick8 } from './twoLinePin.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_2 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '215e92d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const text = (e) => JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => !SKIP.has(k))));
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['egg_duck_quail', 'label_cage_free', 'label_pasture_raised_feed'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}

test('C1 feed and organic named', () => {
  for (const id of nonEmpty(ALL, 'cards', 3)) {
    const t = text(card(id));
    assert.match(t, /soy|corn|feed/i, `${id} feed`);
    assert.match(t, /organic/i, `${id} organic`);
  }
});

test('C2 decisions lead with pasture or organic', () => {
  for (const id of ['egg_duck_quail', 'label_cage_free']) assert.match(card(id).decision, /pasture|organic/i, id);
});

test('C3 vegetarian fed decoded', () => {
  const t = text(card('label_pasture_raised_feed'));
  assert.match(t, /vegetarian/i);
  assert.match(t, /insect|forag/i);
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

test('C5 no treatment claims, no first person, egg_labels untouched', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
  for (const id of ['egg_labels', 'pick_egg_whites']) assert.deepEqual(preCleanPick8(card(id)), pre.entries.find((x) => x.id === id));
});
