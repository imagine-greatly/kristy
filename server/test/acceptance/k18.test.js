// K18: bread & grains build (8 cards, 2 picks, one generated-row fold).
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

const CARDS = nonEmpty(['sprouted_grain_bread', 'sprouted_grains', 'specialty_flours', 'gluten_free_bread', 'buns_rolls', 'pastries_muffins', 'muesli', 'bread_aisle'], 'K18 cards', 8);
const PICKS = nonEmpty(['pick_english_muffins', 'pick_pita_naan'], 'K18 picks', 2);
const NEW = [...CARDS, ...PICKS];
const BARE = nonEmpty(Object.entries({
  'sprouted grain bread': 'sprouted_grain_bread', 'sprouted bread': 'sprouted_grain_bread', 'sprouted wheat bread': 'sprouted_grain_bread',
  'sprouted grains': 'sprouted_grains', 'sprouted flour': 'sprouted_grains', 'sprouted whole grains': 'sprouted_grains',
  'spelt flour': 'specialty_flours', 'einkorn flour': 'specialty_flours', 'almond flour': 'specialty_flours', 'almond meal': 'specialty_flours', 'stone ground flour': 'specialty_flours',
  'gluten free bread': 'gluten_free_bread', 'gluten-free bread': 'gluten_free_bread', 'gf bread': 'gluten_free_bread',
  'hamburger buns': 'buns_rolls', 'hot dog buns': 'buns_rolls', 'burger buns': 'buns_rolls', 'dinner rolls': 'buns_rolls', 'sandwich rolls': 'buns_rolls', 'whole wheat buns': 'buns_rolls',
  'croissants': 'pastries_muffins', 'croissant': 'pastries_muffins', 'danish pastry': 'pastries_muffins', 'pastries': 'pastries_muffins', 'blueberry muffins': 'pastries_muffins', 'bakery muffins': 'pastries_muffins',
  'muesli': 'muesli', 'bircher muesli': 'muesli', 'toasted muesli': 'muesli',
  'bread aisle': 'bread_aisle',
  'english muffins': 'pick_english_muffins', 'english muffin': 'pick_english_muffins',
  'pita': 'pick_pita_naan', 'pita bread': 'pick_pita_naan', 'pitas': 'pick_pita_naan', 'naan': 'pick_pita_naan', 'naan bread': 'pick_pita_naan',
}), 'K18 bare rows', 35);
const KEEPS = nonEmpty([
  ['flour', 'flour_basics'], ['whole wheat flour', 'flour_basics'], ['bread flour', 'flour_basics'], ['pastry flour', 'flour_basics'], ['enriched flour', 'flour_basics'],
  ['sandwich bread', 'sandwich_bread'], ['whole wheat bread', 'sandwich_bread'],
  ['cereal', 'breakfast_cereal'], ['granola', 'breakfast_cereal'], ['whole grain cereal', 'breakfast_cereal'],
  ['sourdough', 'sourdough'], ['bagels', 'bagels'], ['tortillas', 'tortillas'], ['pretzel bread', 'pretzel_bread'], ['oats', 'oats_steelcut_rolled_instant'],
  ['meat case', 'meat_case'], ['seafood counter', 'seafood_counter'], ['seafood', 'seafood_counter'],
], 'K18 keep rows', 18);
const NOT_NEW = nonEmpty([
  'hot dogs', 'hot dog', 'hamburger', 'hamburger patties', 'egg rolls', 'spring rolls', 'cinnamon rolls', 'bread crumbs',
  'almond milk', 'almonds', 'almond butter', 'granola bars', 'muffin tin', 'muffin liners', 'puff pastry', 'pie crust',
  'malted milk', 'wheat germ', 'gluten free pasta', 'stone ground mustard', 'danish butter cookies', 'cake flour', 'rice',
], 'K18 not-new rows', 23);
const FORBIDDEN = ['bread', 'breads', 'flour', 'flours', 'grain', 'grains', 'cereal', 'oats', 'rolls', 'roll', 'muffin', 'muffins', 'buns', 'bun', 'pastry', 'gluten', 'gluten free', 'gluten-free', 'wheat', 'white', 'whole', 'whole grain', 'whole wheat', 'granola', 'sprouted', 'stoneground', 'stone ground', 'enriched', 'multigrain', 'danish', 'almond', 'spelt'];
const OWNERS = nonEmpty(['sandwich_bread', 'sourdough', 'pretzel_bread', 'bagels', 'tortillas', 'breakfast_cereal', 'pasta_dry', 'oats_steelcut_rolled_instant', 'rice_arsenic', 'grains_beyond_rice', 'flour_basics'], 'K9 grain ask owners', 11);
const FOLD = { slug: 'gen_choosing_a_real_cereal', card: 'breakfast_cereal', keep: 'gen_live_fermented_foods' };
const FOLD_ASKS = nonEmpty(['what cereal'], 'fold asks', 1);
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K18 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 broad card: bread_aisle owns exactly one short alias, "bread aisle"', () => {
  const al = nonEmpty(byId('bread_aisle')?.aliases ?? [], 'bread_aisle aliases', 4);
  assert.deepEqual(al.filter((a) => a.trim().split(/\s+/).length <= 2), ['bread aisle']);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K18 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k18 file', () => {
  const dir = join(ROOT, 'docs/sources/k18');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k18 archive', 40);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K18 URLs', 20);
  for (const u of urls) assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k18 source`);
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
  assert.equal(p.category, 'bulk_pantry');
  assert.deepEqual(lintPick(p), []);
});

test('C9 one entry per id, no forbidden or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(fresh|frozen|canned|dried)\b/.test(a), `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = JSON.stringify(PROSE.map((k) => e[k] ?? ''));
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(mercury|omega|healthy|healthier|heart|brain|safer|safest|cures?|prevents?|glycemic|blood sugar|digest\w*|nutritious|antinutrients?|phytic|inflammat\w*)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost)\b/i);
  assert.doesNotMatch(text, /\b(ezekiel|silver hills|kirkland|costco|stater|king arthur|wildgrain|food for life)\b/i);
});

test('C12 fold: gen_choosing_a_real_cereal is retired, gen_live_fermented_foods is kept', () => {
  assert.ok(RETIRED_GENERATED.includes(FOLD.slug), FOLD.slug);
  assert.ok(!RETIRED_GENERATED.includes(FOLD.keep), `${FOLD.keep} must stay live`);
});

for (const q of FOLD_ASKS) test(`C12 fold ask "${q}" is served by ${FOLD.card}`, () => {
  const t = top(q);
  assert.equal(t.id, FOLD.card);
  assert.ok(t.aliasScore > 0, `aliasScore ${t.aliasScore}`);
});
