// concern-dairy: dairy cards name rBST and the organic rung; carrageenan cards say to read the list; sources from the
// concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', '72def1c:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);
const srcKey = (s) => (typeof s === 'string' ? s : `${s.name ?? ''} ${s.url ?? ''}`);
const GOV = /\.gov\b|\bextension\b|\b(USDA|FDA|FSIS|CDC|NIH|EPA)\b/i;
const PEER = /https?:\/\/(pmc\.|www\.)?ncbi\.nlm\.nih\.gov\S*/gi; // peer-reviewed literature host, not a government source
// Pre-completeness KB (9845b9e): the government check applies only to sources the 2026-10-22 pass added.
const cp = JSON.parse(execFileSync('git', ['show', '9845b9e:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const cpSrc = (id) => new Set((cp.entries.find((x) => x.id === id)?.sources || []).map(srcKey));

const RBST = ['whole_vs_reduced_fat_milk', 'dairy_case', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'ice_cream', 'cream_vs_creamer', 'cottage_cheese', 'sour_cream', 'cream_cheese'];
const CARR = ['cream_vs_creamer', 'ice_cream', 'cottage_cheese', 'sour_cream', 'cream_cheese', 'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage'];
const ALL = [...new Set([...RBST, ...CARR])];

const root = join(ROOT, 'docs/sources/concerns');
const archived = new Set();
for (const d of readdirSync(root, { withFileTypes: true }).filter((x) => x.isDirectory())) {
  for (const f of readdirSync(join(root, d.name)).filter((x) => x.endsWith('.md'))) {
    const m = readFileSync(join(root, d.name, f), 'utf8').match(/^url:\s*(\S+)/m);
    if (m) archived.add(m[1]);
  }
}
// Completeness pass 2026-10-22 (DECISIONS-2026-10-22.md): holistic sources replace government ones and are archived under
// archive/completeness/<section>/, each file's URL verbatim on line 1.
const CA = join(ROOT, 'archive/completeness');
for (const d of readdirSync(CA)) for (const f of readdirSync(join(CA, d)).filter((x) => x.endsWith('.md'))) archived.add(readFileSync(join(CA, d, f), 'utf8').split('\n')[0].trim());

test('C1 rBST and organic named', () => {
  for (const id of nonEmpty(RBST, 'rbst cards', 9)) {
    const t = text(card(id));
    assert.match(t, /rBST/i, `${id} rBST`);
    assert.match(t, /organic/i, `${id} organic`);
  }
});

test('C2 carrageenan named with the list to read', () => {
  for (const id of nonEmpty(CARR, 'carrageenan cards', 9)) {
    const t = text(card(id));
    assert.match(t, /carrageenan/i, `${id} carrageenan`);
    assert.match(t, /\b(list|ingredient|label)/i, `${id} read the list`);
  }
});

test('C3 grass-fed never stands in for the rBST rung', () => {
  for (const id of ALL) for (const s of fields(card(id))) for (const sent of s.split(/(?<=[.;!?])\s+/)) {
    if (/rBST/i.test(sent) && /grass[- ]fed/i.test(sent)) assert.match(sent, /organic/i, `${id}: ${sent}`);
  }
});

test('C4 sources come from the concern archive', () => {
  nonEmpty([...archived], 'archived urls', 100);
  for (const id of nonEmpty(ALL, 'cards', 13)) {
    const before = new Set(urlsOf(pre.entries.find((x) => x.id === id)));
    // Completeness pass 2026-10-22: holistic sources (some cited by name) may replace concern-archive ones; a card keeps
    // at least one source, and no source added since the baseline is government.
    const beforeSrc = new Set((pre.entries.find((x) => x.id === id).sources || []).map(srcKey));
    const added = nonEmpty(card(id).sources || [], `${id} sources`, 1).map(srcKey).filter((s) => !beforeSrc.has(s));
    for (const s of added) if (!cpSrc(id).has(s)) assert.doesNotMatch(s.replace(PEER, ''), GOV, `${id} new source is government: ${s}`);
    const urls = urlsOf(card(id));
    assert.ok(urls.some((u) => archived.has(u)) || added.length > 0, `${id} cites no concern-archive url and no new holistic source`);
    for (const u of urls) assert.ok(before.has(u) || archived.has(u), `${id} url not archived: ${u}`);
  }
});

test('C5 no treatment or mechanism claims, no first person', () => {
  for (const id of ALL) {
    const t = text(card(id));
    assert.doesNotMatch(t, /\b(causes?|prevents?|lowers? (the )?risk|carcinogen\w*|cancer|inflam\w*|toxic\w*|IGF\S*)\b/i, `${id} treatment`);
    assert.doesNotMatch(t, /\b(I|me|my)\b/, `${id} first person`);
  }
});
