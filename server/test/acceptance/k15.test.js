// K15: meat build (9 cards, 2 picks, pick_lamb folded into lamb_goat, 2 generated rows retired).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable, RETIRED_GENERATED } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { scoreEntries } from '../../lib/perimeter.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
const byId = (id) => kb.entries.find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const rowMatch = (row) => idOf(matchItemToCard(row)) ?? idOf(matchItemToPick(row));
const top = (q) => { const r = scoreEntries(q, 3)[0]; return { id: r?.entry?.id ?? r?.id, score: r?.score ?? 0, aliasScore: r?.aliasScore ?? 0 }; };

const CARDS = nonEmpty(['ham', 'turkey_bacon', 'cured_pork', 'lamb_goat', 'organ_meats', 'bison', 'venison_game', 'duck_meat', 'meat_case'], 'K15 cards', 9);
const PICKS = nonEmpty(['pick_jerky', 'pick_soup_bones'], 'K15 picks', 2);
const NEW = [...CARDS, ...PICKS];
const LAMB = nonEmpty(['lamb', 'lamb chop', 'lamb chops', 'leg of lamb', 'legs of lamb', 'ground lamb', 'lamb shoulder', 'lamb shoulders', 'rack of lamb', 'racks of lamb'], 'pick_lamb aliases', 10);
const BARE = nonEmpty(Object.entries({
  'ham': 'ham', 'sliced ham': 'ham', 'spiral ham': 'ham', 'ham steak': 'ham',
  'turkey bacon': 'turkey_bacon',
  'prosciutto': 'cured_pork', 'salami': 'cured_pork', 'pancetta': 'cured_pork', 'guanciale': 'cured_pork',
  'lamb': 'lamb_goat', 'lamb chops': 'lamb_goat', 'ground lamb': 'lamb_goat', 'goat meat': 'lamb_goat', 'ground goat': 'lamb_goat',
  'beef liver': 'organ_meats', 'chicken livers': 'organ_meats', 'beef heart': 'organ_meats', 'sweetbreads': 'organ_meats', 'organ meat': 'organ_meats',
  'bison': 'bison', 'ground bison': 'bison',
  'venison': 'venison_game', 'ground venison': 'venison_game', 'elk': 'venison_game',
  'duck breast': 'duck_meat', 'whole duck': 'duck_meat', 'duck legs': 'duck_meat',
  'jerky': 'pick_jerky', 'beef jerky': 'pick_jerky', 'turkey jerky': 'pick_jerky',
  'soup bones': 'pick_soup_bones', 'marrow bones': 'pick_soup_bones', 'beef bones': 'pick_soup_bones',
}), 'K15 bare rows', 30);
const KEEPS = nonEmpty([
  ['bacon', 'bacon'], ['sliced bacon', 'bacon'],
  ['pork', 'pork_cuts_and_enhanced'], ['pork chops', 'pork_cuts_and_enhanced'], ['pork shoulder', 'pork_cuts_and_enhanced'],
  ['deli meat', 'deli_meat_uncured'], ['lunch meat', 'deli_meat_uncured'], ['deli turkey', 'deli_meat_uncured'], ['sliced turkey', 'deli_meat_uncured'],
  ['stew meat', 'beef_cuts_basics'], ['steak', 'beef_cuts_basics'],
  ['organ blend ground beef', 'ground_beef_organ_blend'], ['beef with liver', 'ground_beef_organ_blend'], ['organ meat blend', 'ground_beef_organ_blend'],
  ['whole turkey', 'turkey_whole'], ['ground turkey', 'ground_turkey'],
  ['duck eggs', 'egg_duck_quail'], ['eggs', 'egg_labels'], ['meat counter', 'butcher_counter_asking'],
  ['sausage', 'pick_sausage'], ['italian sausage', 'pick_sausage'],
  ['duck', null], ['quail', null], ['egg', null],
], 'K15 keep rows', 20);
const NOT_NEW = nonEmpty([
  'ground beef', 'hamburger', 'hamburger buns', 'graham crackers', 'champagne', 'shampoo', 'striped bass',
  'duck sauce', 'duck fat', 'goat', 'goat cheese', 'goat milk', 'buffalo sauce', 'buffalo wings', 'buffalo mozzarella',
  'liver', 'cod liver oil', 'liverwurst', 'kidney beans', 'hearts of palm', 'artichoke hearts', 'celery hearts',
  'pepperoni pizza', 'bone broth', 'chicken broth', 'beef broth', 'beef stock', 'pork rinds', 'honey', 'honey mustard',
  'chorizo', 'turkey', 'chicken thighs', 'ground meat', 'meat sauce', 'meat thermometer', 'meatballs', 'meat loaf',
  'soup', 'chicken soup', 'fish sauce', 'chocolate chips', "lamb's lettuce",
], 'K15 not-new rows', 40);
const FORBIDDEN = ['meat', 'duck', 'goat', 'liver', 'livers', 'heart', 'hearts', 'kidney', 'tongue', 'buffalo', 'game', 'bone', 'bones', 'beef', 'pork', 'chicken', 'turkey', 'bacon', 'sausage', 'deli'];
const OWNERS = nonEmpty(['judging_meat_at_the_case', 'butcher_counter_asking', 'pork_cuts_and_enhanced', 'dry_brine', 'beef_cuts_basics', 'deli_meat_uncured', 'bacon'], 'meat ask owners', 7);

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K15 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 broad card: meat_case owns exactly one short alias, "meat case"', () => {
  const al = nonEmpty(byId('meat_case')?.aliases ?? [], 'meat_case aliases', 4);
  assert.deepEqual(al.filter((a) => a.trim().split(/\s+/).length <= 2), ['meat case']);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K15 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k15 file', () => {
  const dir = join(ROOT, 'docs/sources/k15');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k15 archive', 20);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K15 URLs', 20);
  for (const u of urls) assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k15 source`);
});

for (const id of CARDS) test(`C6 ${id}: readable and lint-clean`, () => {
  const card = byId(id);
  assert.ok(card, `${id} missing`);
  const doLine = reviewed.get(id)?.do || '';
  assert.ok(doLine, `${id} has no reviewed do line`);
  assert.deepEqual(readability(card), []);
  assert.deepEqual(lintCard(projectEntry(card, { doLine })), []);
});

for (const id of PICKS) test(`C7 ${id}: pick lint-clean`, () => {
  const p = byId(id);
  assert.ok(p && p.kind === 'pick', `${id} missing or not a pick`);
  assert.deepEqual(lintPick(p), []);
});

test('C8 pick_lamb folded: absent, its aliases on lamb_goat', () => {
  assert.equal(byId('pick_lamb'), undefined);
  const al = byId('lamb_goat')?.aliases ?? [];
  for (const a of LAMB) assert.ok(al.includes(a), a);
});

test('C9 one entry per id, no forbidden or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(fresh|frozen|canned|dried)\b/.test(a), `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) {
      if (id === 'meat_case' && q === 'which meat should i buy') continue;
      assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
    }
  }
});

for (const [q, id] of [['is guanciale worth buying', 'cured_pork'], ['how do i judge goat meat quality', 'lamb_goat']]) test(`C10 fold ask "${q}" is served by ${id}`, () => {
  assert.ok((byId(id)?.asked_as ?? []).includes(q), `${id} asked_as lacks "${q}"`);
  const t = top(q);
  assert.equal(t.id, id);
  assert.ok(t.aliasScore > 0, `aliasScore ${t.aliasScore}`);
});

test('C10 both meat generated rows are retired', () => {
  for (const s of ['gen_goat_meat_quality', 'gen_guanciale_worth_buying']) assert.ok(RETIRED_GENERATED.includes(s), s);
});
