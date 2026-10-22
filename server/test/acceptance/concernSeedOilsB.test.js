// concern-seedoils-b: snack and frozen cards name the seed oils to skip and a natural fat to take; avocado oil is never
// recommended; new sources come from the concern archive.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'ba48212:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
const text = (e) => fields(e).join(' \n ');
const urlsOf = (e) => (e.sources || []).map((s) => (typeof s === 'string' ? (s.match(/https?:\S+/) || [])[0] : s.url)).filter(Boolean);

const ALL = ['potato_chips', 'tortilla_chips', 'crackers', 'frozen_fries', 'frozen_nuggets', 'snack_bars', 'popcorn'];

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

test('C1 seed oil and natural fat named', () => {
  for (const id of nonEmpty(ALL, 'cards', 7)) {
    const t = text(card(id));
    assert.match(t, /seed oil|canola|sunflower|soybean|safflower|cottonseed|corn oil/i, `${id} seed oil`);
    assert.match(t, /tallow|olive|coconut|butter|ghee|lard/i, `${id} natural fat`);
  }
});

// Stance 2026-10-22 (DECISIONS-2026-10-22.md): avocado oil is acceptable only when the maker shows it is pure and
// cold-pressed; it is never the lead pick (decision or cart_pick).
test('C2 avocado oil is never the lead pick, and only pure and cold-pressed', () => {
  const hits = [];
  for (const id of ALL) for (const s of fields(card(id))) for (const sent of s.split(/(?<=[.;!?])\s+/)) if (/avocado/i.test(sent)) hits.push([id, sent]);
  for (const [id, sent] of hits) assert.ok(/skip|never|not|can carry|avoid/i.test(sent) || (/pure/i.test(sent) && /cold.pressed/i.test(sent)), `${id}: ${sent}`);
  for (const id of ALL) for (const k of ['decision', 'cart_pick']) assert.doesNotMatch(String(card(id)[k] ?? ''), /avocado/i, `${id}.${k} leads with avocado oil`);
});

test('C3 oil decisions name a natural fat', () => {
  for (const id of ['potato_chips', 'tortilla_chips', 'frozen_fries', 'popcorn']) assert.match(card(id).decision, /olive|coconut|tallow|lard|butter/i, id);
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
