// concern-glyphosate: grain, bean and bread cards name pre-harvest glyphosate and the organic rung; no illness
// claims; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'e8b7669:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['oats_steelcut_rolled_instant', 'breakfast_cereal', 'muesli', 'snack_bars', 'flour_basics', 'sandwich_bread', 'hummus', 'beans_dried_vs_canned', 'pasta_dry'];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}
const sentences = (id) => fields(card(id)).flatMap((s) => s.split(/(?<=[.;!?])\s+/));

test('C1 glyphosate and organic named', () => {
  for (const id of nonEmpty(ALL, 'cards', 9)) {
    const t = text(card(id));
    assert.match(t, /glyphosate/i, `${id} glyphosate`);
    assert.match(t, /organic/i, `${id} organic`);
  }
});

test('C2 residue-free seal never outranks organic', () => {
  for (const id of ALL) for (const sent of sentences(id)) {
    if (/residue[- ]free/i.test(sent)) assert.match(sent, /organic/i, `${id}: ${sent}`);
  }
});

test('C3 item lines kept', () => {
  assert.match(text(card('snack_bars')), /whole grain/i);
  assert.match(text(card('flour_basics')), /unbromated/i);
  assert.match(text(card('sandwich_bread')), /whole wheat/i);
  assert.match(text(card('hummus')), /tahini/i);
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

test('C5 no illness claims, figures or first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|IARC|toxic\w*|linked to)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
    for (const sent of sentences(id)) if (/glyphosate/i.test(sent)) assert.doesNotMatch(sent, /\d+\s*(ppb|percent|%)/i, `${id}: ${sent}`);
  }
});
