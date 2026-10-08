// K24: frozen build (6 cards, no picks, no fold).
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

const CARDS = nonEmpty(['frozen_pizza', 'frozen_meals', 'frozen_fries', 'frozen_waffles', 'frozen_nuggets', 'frozen'], 'K24 cards', 6);
const NEW = CARDS;
const BARE = nonEmpty(Object.entries({
  'frozen pizza': 'frozen_pizza', 'frozen pizzas': 'frozen_pizza',
  'frozen meals': 'frozen_meals', 'frozen dinners': 'frozen_meals', 'frozen entrees': 'frozen_meals', 'tv dinners': 'frozen_meals',
  'frozen fries': 'frozen_fries', 'frozen french fries': 'frozen_fries', 'frozen hash browns': 'frozen_fries',
  'frozen waffles': 'frozen_waffles', 'toaster waffles': 'frozen_waffles',
  'frozen chicken nuggets': 'frozen_nuggets', 'chicken nuggets': 'frozen_nuggets', 'frozen chicken tenders': 'frozen_nuggets',
  'frozen aisle': 'frozen', 'frozen foods': 'frozen', 'frozen food aisle': 'frozen', 'freezer case': 'frozen',
}), 'K24 bare rows', 18);
const KEEPS = nonEmpty([
  ['ice cream', 'ice_cream'], ['fish sticks', 'pick_fish_sticks'], ['frozen peas', 'pick_frozen_peas'], ['frozen broccoli', 'pick_frozen_broccoli'],
  ['prepared meals', 'prepared_meals'], ['prepared foods', 'prepared_meals'], ['ready meals', 'prepared_meals'], ['hot bar', 'prepared_meals'],
  ['rotisserie chicken', 'rotisserie_chicken'], ['granola', 'breakfast_cereal'], ['snack aisle', 'snacks'], ['deli section', 'deli'],
], 'K24 keep rows', 12);
const NOT_NEW = nonEmpty([
  'baby food', 'frozen yogurt', 'chicken breast', 'chicken breasts', 'chicken thighs', 'whole chicken', 'pizza sauce', 'pizza dough', 'potatoes', 'russet potatoes',
  'frozen vegetables', 'frozen fruit', 'frozen fish', 'frozen fish fillets', 'frozen shrimp', 'fish fillets', 'stock prices', 'bread', 'pancake mix', 'breakfast cereal',
], 'K24 not-new rows', 20);
const FORBIDDEN = ['pizza', 'fries', 'waffles', 'waffle', 'nuggets', 'nugget', 'meals', 'meal', 'dinner', 'dinners', 'frozen', 'chicken', 'potato', 'potatoes', 'breaded', 'tenders', 'entrees', 'foods', 'aisle', 'freezer', 'french fries', 'hash browns', 'organic'];
const STATE_OK = { frozen_pizza: 'frozen', frozen_meals: 'frozen', frozen_fries: 'frozen', frozen_waffles: 'frozen', frozen_nuggets: 'frozen', frozen: 'frozen' };
const OWNERS = nonEmpty(['ice_cream', 'frozen_vs_fresh_produce', 'fresh_vs_previously_frozen_fish', 'white_fish', 'prepared_meals', 'rotisserie_chicken', 'air_chilled_chicken', 'breakfast_cereal', 'snacks', 'deli'], 'frozen-aisle ask owners', 10);
const FISH_HOMES = ['frozen_nuggets', 'frozen'];
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];
const prose = (e) => JSON.stringify(PROSE.map((k) => e[k] ?? ''));

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K24 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K24 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k24 file', () => {
  const dir = join(ROOT, 'docs/sources/k24');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k24 archive', 36);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K24 URLs', 12);
  for (const u of urls) assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k24 source`);
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

test('C9 one entry per id, no forbidden, barred or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(cider|canola|soybean|seed oils?|vegetable oil|hydrogenated|ice cream|fish|vegetables?|peas|broccoli|shrimp|fruit|yogurt|breasts?|stock|mechanically)\b/.test(a), `${id} barred alias ${a}`);
      for (const w of (a.match(/\b(fresh|frozen|canned|dried)\b/g) ?? [])) assert.equal(STATE_OK[id], w, `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, safety, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = prose(e);
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(healthy|healthier|heart|brain|joints?|skin|skins|safe|safer|safest|unsafe|safety|cures?|prevents?|glycemic|blood sugar|blood pressure|hypertension|digest\w*|nutritious|nutrients?|vitamins?|inflammat\w*|probiotic\w*|gut|immun\w*|allerg\w*|sensitiv\w*|absorb\w*|cholesterol|intoleran\w*|celiac|therapeutic|weight|detox\w*|metabol\w*|insulin|beneficial|wellness|boost\w*|microbiome|omega\w*|minerals?|antioxidants?|fiber|protein|collagen|trans fats?|superfood\w*|diet|deficien\w*|electrolytes?|toxins?|toxic\w*|poison\w*|caustic|drain|calories?|macros?|carbs?|carbohydrates?|guilt\w*|junk|treats?|pregnan\w*|cancer\w*|carcinogen\w*|acrylamide|niacin|msg|remed\w*|illness\w*|sick\w*|food ?borne|food poisoning|listeria|pathogens?|salmonella|bacteria\w*|germs?|danger zone)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost|costs|premium|bargain|save money|economical)\b/i);
  assert.doesNotMatch(text, /\b(mcdonald[’']?s|eggo|kellogg[’']?s?|costco|kirkland|nestl[eé]|nestec|carnation|king arthur|amazon|digiorno|red baron|totino[’']?s|tombstone|stouffer[’']?s|lean cuisine|marie callender[’']?s|banquet|hungry-man|healthy choice|ore-ida|mccain|lamb weston|simplot|tyson|perdue|dino buddies|van[’']?s|kodiak|birds eye|trader joe[’']?s|whole foods)\b/i);
});

test('C12 no doctor line in K24', () => {
  for (const id of NEW) assert.ok(!/\bdoctor\b/i.test(prose(byId(id))), `${id} has a doctor line`);
});

test('C16 frozen boundaries: no pathogen, sodium or seed-oil wording; fish, produce and ice cream stay home', () => {
  for (const id of NEW) {
    assert.ok(byId(id), `${id} missing`);
    const t = prose(byId(id));
    assert.doesNotMatch(t, /\b(listeria|pathogens?|salmonella|bacteria\w*|danger zone|germs?)\b/i, id);
    assert.doesNotMatch(t, /\bsodium\b/i, id);
    assert.doesNotMatch(t, /\b(canola|soybean|sunflower|safflower|cottonseed|grapeseed|rice bran|corn oil|vegetable oils?|seed oils?)\b/i, id);
  }
  for (const row of ['fish sticks', 'frozen fish', 'frozen fish fillets']) assert.ok(!FISH_HOMES.includes(rowMatch(row)), `${row} -> ${rowMatch(row)}`);
  assert.ok(!FISH_HOMES.includes(top('is frozen fish worth buying').id), `frozen fish ask -> ${top('is frozen fish worth buying').id}`);
  for (const row of ['frozen vegetables', 'frozen fruit', 'frozen peas', 'frozen broccoli']) assert.notEqual(rowMatch(row), 'frozen', row);
  assert.notEqual(top('are frozen vegetables worth buying').id, 'frozen', 'frozen vegetables ask');
  for (const row of ['ice cream', 'frozen yogurt']) assert.ok(!NEW.includes(rowMatch(row)), `${row} -> ${rowMatch(row)}`);
  assert.ok(!NEW.includes(top('which ice cream should i buy').id), `ice cream ask -> ${top('which ice cream should i buy').id}`);
});
