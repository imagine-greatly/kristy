// K19: dairy build (12 cards, no picks, no fold).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
const byId = (id) => kb.entries.find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const rowMatch = (row) => idOf(matchItemToCard(row)) ?? idOf(matchItemToPick(row));
const top = (q) => { const r = scoreEntries(q, 3)[0]; return { id: r?.entry?.id ?? r?.id, score: r?.score ?? 0, aliasScore: r?.aliasScore ?? 0 }; };

const CARDS = nonEmpty(['plain_kefir', 'sour_cream', 'cream_cheese', 'cottage_cheese', 'ice_cream', 'ghee', 'goat_sheep_dairy', 'almond_milk', 'soy_milk', 'coconut_milk_beverage', 'plant_butter', 'dairy_case'], 'K19 cards', 12);
const NEW = CARDS;
const BARE = nonEmpty(Object.entries({
  'plain kefir': 'plain_kefir', 'pasteurized kefir': 'plain_kefir', 'flavored kefir': 'plain_kefir', 'kefir drink': 'plain_kefir',
  'sour cream': 'sour_cream', 'cultured sour cream': 'sour_cream', 'acidified sour cream': 'sour_cream',
  'cream cheese': 'cream_cheese', 'neufchatel': 'cream_cheese', 'neufchatel cheese': 'cream_cheese', 'cream cheese spread': 'cream_cheese',
  'cottage cheese': 'cottage_cheese', 'small curd cottage cheese': 'cottage_cheese', 'large curd cottage cheese': 'cottage_cheese', 'dry curd cottage cheese': 'cottage_cheese',
  'ice cream': 'ice_cream', 'vanilla ice cream': 'ice_cream', 'chocolate ice cream': 'ice_cream', 'ice cream pint': 'ice_cream',
  'ghee': 'ghee', 'clarified butter': 'ghee', 'ghee butter': 'ghee',
  'goat milk': 'goat_sheep_dairy', 'goats milk': 'goat_sheep_dairy', 'goat cheese': 'goat_sheep_dairy', 'chevre': 'goat_sheep_dairy', 'goat yogurt': 'goat_sheep_dairy', 'goat butter': 'goat_sheep_dairy', 'sheep milk': 'goat_sheep_dairy', 'sheep cheese': 'goat_sheep_dairy', 'sheep milk cheese': 'goat_sheep_dairy',
  'almond milk': 'almond_milk', 'almondmilk': 'almond_milk', 'unsweetened almond milk': 'almond_milk',
  'soy milk': 'soy_milk', 'soymilk': 'soy_milk', 'soya milk': 'soy_milk', 'unsweetened soy milk': 'soy_milk',
  'coconut milk beverage': 'coconut_milk_beverage', 'carton coconut milk': 'coconut_milk_beverage', 'coconut milk carton': 'coconut_milk_beverage', 'boxed coconut milk': 'coconut_milk_beverage',
  'plant butter': 'plant_butter', 'plant based butter': 'plant_butter', 'plant-based butter': 'plant_butter', 'vegan butter': 'plant_butter',
  'dairy case': 'dairy_case', 'dairy': 'dairy_case', 'ultrafiltered milk': 'dairy_case', 'ultra filtered milk': 'dairy_case',
}), 'K19 bare rows', 49);
const KEEPS = nonEmpty([
  ['butter', 'grassfed_butter'], ['cheese', 'cheese_real_vs_processed'], ['raw dairy', 'raw_milk'], ['cultured dairy', 'yogurt_live_cultures'], ['non dairy creamer', 'cream_vs_creamer'],
  ['raw kefir', 'raw_kefir'], ['milk kefir', 'raw_kefir'], ['kefir grains', 'raw_kefir'], ['oat milk', 'oat_milk'],
  ['almond', 'nuts_raw_vs_roasted'], ['almonds', 'nuts_raw_vs_roasted'], ['almond butter', 'nut_butter_ingredients'], ['peanut butter', 'nut_butter_ingredients'],
  ['almond flour', 'specialty_flours'], ['almond meal', 'specialty_flours'], ['butter croissants', 'pastries_muffins'],
  ['goat meat', 'lamb_goat'], ['ground goat', 'lamb_goat'], ['virgin coconut oil', null],
  ['bread aisle', 'bread_aisle'], ['meat case', 'meat_case'], ['seafood counter', 'seafood_counter'],
], 'K19 keep rows', 22);
const NOT_NEW = nonEmpty([
  'kefir', 'milk', 'whole milk', 'skim milk', 'chocolate milk', 'heavy cream', 'half and half', 'whipped cream', 'buttermilk', 'yogurt', 'greek yogurt',
  'margarine', 'coconut water', 'coconut oil', 'shredded coconut', 'cream of coconut', 'soy sauce', 'tofu', 'edamame',
  'frozen yogurt', 'frozen pizza', 'sherbet', 'sorbet', 'eggs', 'butter lettuce', 'string cheese', 'parmesan', 'cheddar',
], 'K19 not-new rows', 28);
const FORBIDDEN = ['dairy', 'milk', 'milks', 'cheese', 'cheeses', 'butter', 'cream', 'yogurt', 'kefir', 'coconut', 'coconut milk', 'almond', 'almonds', 'soy', 'goat', 'sheep', 'plant', 'vegan', 'cultured', 'organic', 'plain', 'unsweetened', 'creamer', 'margarine', 'oil', 'spread', 'non dairy', 'dairy free', 'lactose free'];
const OWNERS = nonEmpty(['grassfed_butter', 'whole_vs_reduced_fat_milk', 'a2_vs_a1_milk', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'raw_milk', 'milk_processing', 'yogurt_live_cultures', 'cream_vs_creamer', 'raw_kefir', 'raw_aged_cheese', 'oat_milk', 'label_no_added_hormones', 'label_organic_scope', 'nuts_raw_vs_roasted', 'nut_butter_ingredients', 'lamb_goat'], 'dairy ask owners', 17);
const BANNED = ['wikipedia.org/wiki/Vegan_butter', 'silk.com', 'fairlife.com', 'perrysicecream.com', 'milkio.co.nz', 'FR-1994-02-10'];
const DOCTOR = 'Lactose intolerance or a milk allergy? Ask a doctor which milks fit.';
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];
const prose = (e) => JSON.stringify(PROSE.map((k) => e[k] ?? ''));

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K19 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 broad card: dairy_case owns exactly two short aliases', () => {
  const al = nonEmpty(byId('dairy_case')?.aliases ?? [], 'dairy_case aliases', 5);
  assert.deepEqual(al.filter((a) => a.trim().split(/\s+/).length <= 2), ['dairy case', 'ultrafiltered milk']);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K19 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k19 file, none banned', () => {
  const dir = join(ROOT, 'docs/sources/k19');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k19 archive', 40);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K19 URLs', 24);
  for (const u of urls) {
    assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k19 source`);
    assert.ok(!BANNED.some((b) => u.includes(b)), `${u} is banned`);
  }
});

for (const id of CARDS) test(`C6 ${id}: readable and lint-clean`, () => {
  const card = byId(id);
  assert.ok(card, `${id} missing`);
  const doLine = reviewed.get(id)?.do || '';
  assert.ok(doLine, `${id} has no reviewed do line`);
  assert.deepEqual(readability(card), []);
  assert.deepEqual(lintCard(projectEntry(card, { doLine })), []);
});

for (const id of CARDS) test(`C8 ${id}: every asked_as passes the scope gate`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(inScope(q).ok, true, q);
});

test('C9 one entry per id, no forbidden or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(fresh|frozen|canned|dried)\b/.test(a), `${id} state alias ${a}`);
      if (id !== 'dairy_case') assert.ok(!/\bdairy\b/.test(a), `${id} dairy alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = prose(e).split(DOCTOR).join('');
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(healthy|healthier|heart|brain|bones?|safer|safest|cures?|prevents?|glycemic|blood sugar|digest\w*|nutritious|inflammat\w*|probiotic\w*|gut|immun\w*|allerg\w*|hypoallergenic|absorb\w*|cholesterol|intoleran\w*|therapeutic|weight)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost)\b/i);
  assert.doesNotMatch(text, /\b(silk|fairlife|wegmans|milkio|perry'?s|kerrygold|nestl[eé]|breyers|drumstick|organic valley|danone|horizon|chobani|lifeway|califia|oatly|earth balance|miyoko'?s|country crock)\b/i);
});

test('C12 exactly one doctor-routed line, on goat_sheep_dairy', () => {
  const carriers = NEW.filter((id) => (byId(id)?.watch_out ?? []).includes(DOCTOR));
  assert.deepEqual(carriers, ['goat_sheep_dairy']);
  for (const id of NEW) assert.ok(!/\bdoctor\b/i.test(prose(byId(id)).split(DOCTOR).join('')), `${id} has a second doctor line`);
});
