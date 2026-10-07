// K21: pantry I build (13 cards, no picks, no fold).
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

const CARDS = nonEmpty(['broth', 'salt', 'sugars', 'maple_syrup', 'cooking_oils', 'lard_tallow', 'cocoa', 'seeds', 'dried_fruit', 'nutritional_yeast', 'canned_coconut_milk', 'dried_herbs', 'tea'], 'K21 cards', 13);
const NEW = CARDS;
const BARE = nonEmpty(Object.entries({
  'broth': 'broth', 'bone broth': 'broth', 'chicken broth': 'broth', 'beef broth': 'broth', 'vegetable broth': 'broth', 'chicken stock': 'broth', 'beef stock': 'broth',
  'salt': 'salt', 'table salt': 'salt', 'iodized salt': 'salt', 'kosher salt': 'salt', 'sea salt': 'salt', 'flaky salt': 'salt', 'pickling salt': 'salt', 'canning salt': 'salt', 'pink himalayan salt': 'salt',
  'sugar': 'sugars', 'white sugar': 'sugars', 'cane sugar': 'sugars', 'brown sugar': 'sugars', 'raw sugar': 'sugars', 'turbinado sugar': 'sugars', 'coconut sugar': 'sugars', 'granulated sugar': 'sugars',
  'maple syrup': 'maple_syrup', 'pure maple syrup': 'maple_syrup', 'real maple syrup': 'maple_syrup', 'grade a maple syrup': 'maple_syrup', 'dark maple syrup': 'maple_syrup',
  'cooking oil': 'cooking_oils', 'vegetable oil': 'cooking_oils', 'canola oil': 'cooking_oils', 'peanut oil': 'cooking_oils', 'sunflower oil': 'cooking_oils', 'safflower oil': 'cooking_oils', 'sesame oil': 'cooking_oils',
  'lard': 'lard_tallow', 'leaf lard': 'lard_tallow', 'tallow': 'lard_tallow', 'beef tallow': 'lard_tallow',
  'cocoa': 'cocoa', 'cocoa powder': 'cocoa', 'unsweetened cocoa': 'cocoa', 'dutch process cocoa': 'cocoa', 'natural cocoa': 'cocoa', 'cacao nibs': 'cocoa', 'cocoa nibs': 'cocoa',
  'chia seeds': 'seeds', 'flax seeds': 'seeds', 'flaxseed': 'seeds', 'ground flaxseed': 'seeds', 'hemp seeds': 'seeds', 'hemp hearts': 'seeds', 'sunflower seeds': 'seeds', 'pumpkin seeds': 'seeds',
  'dried fruit': 'dried_fruit', 'raisins': 'dried_fruit', 'dried apricots': 'dried_fruit', 'dried cranberries': 'dried_fruit', 'prunes': 'dried_fruit', 'dried mango': 'dried_fruit',
  'nutritional yeast': 'nutritional_yeast', 'nooch': 'nutritional_yeast', 'yeast flakes': 'nutritional_yeast',
  'canned coconut milk': 'canned_coconut_milk', 'coconut milk can': 'canned_coconut_milk', 'can of coconut milk': 'canned_coconut_milk',
  'dried herbs': 'dried_herbs', 'dried oregano': 'dried_herbs', 'dried basil': 'dried_herbs', 'dried thyme': 'dried_herbs', 'dried parsley': 'dried_herbs', 'dried rosemary': 'dried_herbs',
  'tea': 'tea', 'black tea': 'tea', 'green tea': 'tea', 'oolong tea': 'tea', 'white tea': 'tea', 'loose leaf tea': 'tea', 'tea bags': 'tea', 'decaf tea': 'tea',
}), 'K21 bare rows', 81);
const KEEPS = nonEmpty([
  ['olive oil', 'olive_oil_grades'], ['extra virgin olive oil', 'olive_oil_grades'], ['evoo', 'olive_oil_grades'],
  ['refined oil', null], ['unrefined oil', null], ['hexane', null], ['virgin coconut oil', null],
  ['rancid oil', 'rancidity_check'], ['sweetener', null], ['stevia', null], ['sugar free', null],
  ['honey', 'honey_adulteration'], ['spices', 'whole_spices'], ['ground spices', 'whole_spices'],
  ['carton coconut milk', 'coconut_milk_beverage'], ['coconut milk beverage', 'coconut_milk_beverage'], ['soup bones', 'pick_soup_bones'],
  ['kombucha tea', 'kombucha'], ['coffee', 'coffee_beans'], ['dried beans', 'beans_dried_vs_canned'],
  ['butter', 'grassfed_butter'], ['ghee', 'ghee'], ['plant butter', 'plant_butter'],
], 'K21 keep rows', 23);
const NOT_NEW = nonEmpty([
  'fish sauce', 'chocolate chips', 'ground beef', 'lunch meat', 'peanut butter', 'soy sauce', 'vinegar', 'salad dressing', 'salsa', 'stock prices',
  'fresh herbs', 'fresh basil', 'sugar snap peas', 'coconut water', 'margarine', 'shortening', 'chocolate', 'epsom salt', 'chicken',
], 'K21 not-new rows', 19);
const FORBIDDEN = ['oil', 'seeds', 'herbs', 'fat', 'sweetener', 'sweeteners', 'coconut', 'yeast', 'chocolate', 'stock', 'hydrogenated', 'shortening', 'syrup', 'spices', 'spice', 'seasoning', 'organic', 'olive oil', 'coconut milk', 'coconut oil', 'hydrogenated lard'];
const STATE_OK = { dried_fruit: 'dried', dried_herbs: 'dried', canned_coconut_milk: 'canned' };
const OWNERS = nonEmpty(['olive_oil_grades', 'label_cold_pressed_expeller', 'rancidity_check', 'label_sugar_free_substitutes', 'honey_adulteration', 'whole_spices', 'coconut_milk_beverage', 'bean_soak_salt', 'dry_brine', 'kombucha', 'coffee_beans'], 'pantry ask owners', 11);
const BANNED = ['wholefoodearth', 'cfr/text/21/173.255'];
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];
const prose = (e) => JSON.stringify(PROSE.map((k) => e[k] ?? ''));

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K21 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K21 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k21 file, none banned', () => {
  const dir = join(ROOT, 'docs/sources/k21');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k21 archive', 50);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K21 URLs', 26);
  for (const u of urls) {
    assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k21 source`);
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

test('C9 one entry per id, no forbidden, hydrogenated or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/hydrogenated/.test(a), `${id} hydrogenated alias ${a}`);
      for (const w of (a.match(/\b(fresh|frozen|canned|dried)\b/g) ?? [])) assert.equal(STATE_OK[id], w, `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = prose(e);
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(healthy|healthier|heart|brain|joints?|skin|safer|safest|cures?|prevents?|glycemic|blood sugar|digest\w*|nutritious|nutrients?|inflammat\w*|probiotic\w*|gut|immun\w*|allerg\w*|asthma|sensitiv\w*|hypoallergenic|absorb\w*|cholesterol|intoleran\w*|therapeutic|weight|detox\w*|metabol\w*|insulin|enzymes?|beneficial|wellness|boost\w*|microbiome|omega\w*|b-?12|folic|minerals?|antioxidants?|catechins?|fiber|protein|stimulant\w*|collagen|trans fats?|superfood\w*|diet)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost)\b/i);
  assert.doesNotMatch(text, /\b(morton|diamond crystal|maldon|redmond|domino|c&h|sugar in the raw|aunt jemima|pearl milling|butterworth|log cabin|crisco|mazola|wesson|hershey'?s|ghirardelli|droste|valrhona|navitas|bob'?s red mill|sun-maid|ocean spray|craisins|mariani|bragg|red star|thai kitchen|aroy-d|chaokoh|native forest|mccormick|simply organic|spice islands|lipton|twinings|bigelow|tetley|yogi|swanson|kettle & fire|college inn|better than bouillon|fatworks|costco|trader joe'?s|whole foods market)\b/i);
});

test('C12 no doctor line in K21', () => {
  for (const id of NEW) assert.ok(!/\bdoctor\b/i.test(prose(byId(id))), `${id} has a doctor line`);
});
