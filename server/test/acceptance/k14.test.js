// K14: produce & eggs build (cards and picks).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { WEAK_MATCH_CEILING } from '../../lib/counterGaps.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import pre from './fixtures/kb-pre-readability.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
const byId = (id) => kb.entries.find((e) => e.id === id);
const preById = (id) => (pre.entries ?? pre).find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const rowMatch = (row) => idOf(matchItemToCard(row)) ?? idOf(matchItemToPick(row));
const top = (q) => { const r = scoreEntries(q, 3)[0]; return { id: r?.entry?.id ?? r?.id, score: r?.score ?? 0 }; };

const CARDS = nonEmpty(['produce_mushrooms', 'produce_green_beans', 'egg_duck_quail'], 'K14 cards', 3);
const PICKS = nonEmpty(['pick_winter_squash', 'pick_ginger_turmeric', 'pick_microgreens', 'pick_egg_whites'], 'K14 picks', 4);
const BARE = nonEmpty(Object.entries({
  'mushrooms': 'produce_mushrooms', 'shiitake': 'produce_mushrooms', 'cremini': 'produce_mushrooms',
  'green beans': 'produce_green_beans', 'string beans': 'produce_green_beans',
  'duck eggs': 'egg_duck_quail', 'quail eggs': 'egg_duck_quail',
  'winter squash': 'pick_winter_squash', 'butternut squash': 'pick_winter_squash',
  'acorn squash': 'pick_winter_squash', 'spaghetti squash': 'pick_winter_squash',
  // Compound rows ('Butternut or acorn squash', 'ginger and turmeric root') stay misses:
  // aliasCoversRow needs one alias to cover every word, and lintPick caps pick aliases at 3.
  'ginger': 'pick_ginger_turmeric', 'turmeric': 'pick_ginger_turmeric',
  'ginger root': 'pick_ginger_turmeric',
  'microgreens': 'pick_microgreens',
  'egg whites': 'pick_egg_whites', 'carton egg whites': 'pick_egg_whites',
}), 'K14 bare rows', 17);
const KEEPS = nonEmpty([
  ['beans', 'beans_dried_vs_canned'], ['black beans', 'beans_dried_vs_canned'],
  ['canned green beans', ['beans_dried_vs_canned', null]], ['coffee beans', 'coffee_beans'],
  ['green bean casserole', null], ['frozen green beans', null], ['Frozen broccoli or green beans', null],
  ['zucchini', 'pick_zucchini'], ['summer squash', 'pick_zucchini'], ['yellow squash', 'pick_zucchini'],
  ['squash', null], ['butternut squash soup', null],
  ['ginger ale', null], ['ginger snaps', null], ['ginger beer', null], ['gingerbread', null],
  ['ground ginger', null], ['pickled ginger', null], ['crystallized ginger', null],
  ['ground turmeric', null], ['turmeric powder', null],
  ['mushroom soup', null], ['cream of mushroom soup', null], ['dried mushrooms', null],
  ['canned mushrooms', null], ['mushroom coffee', null], ['oyster sauce', null],
  ['duck', null], ['quail', null],
  ['eggs', 'egg_labels'], ['brown eggs', 'egg_shell_color'], ['white eggs', 'egg_shell_color'],
  ['egg', null], ['egg noodles', null], ['egg salad', null], ['egg white protein powder', null],
  ['pineapple', 'produce_ripeness_by_item'], ['cantaloupe', 'produce_ripeness_by_item'],
  ['pineapple juice', null], ['canned pineapple', null], ['dried pineapple', null],
  ['sprouts', 'sprouts_raw'], ['broccoli sprouts', 'sprouts_raw'], ['alfalfa sprouts', 'sprouts_raw'],
], 'K14 collision rows', 40);
const FORBIDDEN = ['squash', 'duck', 'quail', 'egg', 'eggs', 'bean', 'beans', 'white', 'whites', 'oyster', 'root'];

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => {
  const got = rowMatch(row);
  assert.ok((Array.isArray(want) ? want : [want]).includes(got), `${row} -> ${got}`);
});

for (const q of ['how do i pick a good cantaloupe', 'how do i pick a good pineapple']) test(`C4 "${q}" is a strong match`, () => {
  const t = top(q);
  assert.equal(t.id, 'produce_ripeness_by_item');
  assert.ok(t.score > WEAK_MATCH_CEILING, `score ${t.score}`);
});

test('C5 every cited URL hits line 1 of a docs/sources/k14 file', () => {
  const dir = join(ROOT, 'docs/sources/k14');
  const lines = nonEmpty(readdirSync(dir).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k14 archive', 1);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty([...CARDS, ...PICKS].flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K14 URLs', 10);
  for (const u of urls) assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k14 source`);
});

for (const id of [...CARDS, 'produce_ripeness_by_item', 'produce_seasonality']) test(`C6 ${id}: readable and lint-clean`, () => {
  const card = byId(id);
  assert.ok(card, `${id} missing`);
  const doLine = reviewed.get(id)?.do || '';
  if (CARDS.includes(id)) assert.ok(doLine, `${id} has no reviewed do line`);
  assert.deepEqual(readability(card), []);
  assert.deepEqual(lintCard(projectEntry(card, { doLine })), []);
});

for (const id of PICKS) test(`C7 ${id}: pick lint-clean`, () => {
  const p = byId(id);
  assert.ok(p && p.kind === 'pick', `${id} missing or not a pick`);
  assert.deepEqual(lintPick(p), []);
});

test('C8 squash aliases left produce_seasonality; the season ask still lands there', () => {
  const al = byId('produce_seasonality').aliases;
  for (const a of ['butternut squash', 'acorn squash', 'winter squash']) assert.ok(!al.includes(a), a);
  assert.equal(top('is butternut squash in season').id, 'produce_seasonality');
});

test('C9 one entry per id, no forbidden or state alias, no forbidden bare-noun ask', () => {
  for (const id of [...CARDS, ...PICKS]) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(fresh|frozen|canned|dried)\b/.test(a), `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

test('C10 passRule fixture carries the coverage alias moves for exactly the two edited ids', () => {
  for (const id of ['produce_seasonality', 'produce_ripeness_by_item']) {
    const was = preById(id);
    assert.ok(was, `${id} missing from fixture`);
    assert.deepEqual(was.aliases, byId(id).aliases, `${id} aliases`);
    assert.deepEqual(was.asked_as, byId(id).asked_as, `${id} asked_as`);
  }
  for (const a of ['butternut squash', 'acorn squash', 'winter squash']) assert.ok(!preById('produce_seasonality').aliases.includes(a), a);
  for (const a of ['good cantaloupe', 'good pineapple']) assert.ok(preById('produce_ripeness_by_item').aliases.includes(a), a);
});

test('C11 the fixture differs from 3f34250 in exactly the three coverage fields', () => {
  const f = 'test/acceptance/fixtures/kb-pre-readability.json';
  const cwd = join(ROOT, 'server');
  const a = JSON.parse(execSync(`git show 3f34250:server/${f}`, { cwd, maxBuffer: 64 << 20 }).toString());
  const A = nonEmpty(a.entries ?? a, 'fixture at 3f34250', 1);
  const B = pre.entries ?? pre;
  const d = [];
  if (A.length !== B.length) d.push('length');
  for (const o of A) {
    const n = B.find((e) => e.id === o.id) ?? {};
    for (const k of new Set([...Object.keys(o), ...Object.keys(n)])) if (JSON.stringify(o[k]) !== JSON.stringify(n[k])) d.push(`${o.id}.${k}`);
  }
  assert.deepEqual(d, ['produce_seasonality.aliases', 'produce_ripeness_by_item.aliases', 'produce_ripeness_by_item.asked_as']);
});

test('C12 passRule.js and k5–k11 are unedited since 3f34250', () => {
  const out = execSync(
    "git diff 3f34250 --stat -- server/test/acceptance/passRule.js 'server/test/acceptance/k[5-9].test.js' 'server/test/acceptance/k1[01].test.js'",
    { cwd: ROOT },
  ).toString();
  assert.equal(out, '');
});
