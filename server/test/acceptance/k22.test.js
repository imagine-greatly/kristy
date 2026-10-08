// K22: pantry II build, sauces and cans (13 cards, no picks, no fold).
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

const CARDS = nonEmpty(['vinegar', 'pasta_sauce', 'jam', 'ketchup_mustard', 'mayo', 'hot_soy_sauce', 'canned_soup', 'olives', 'seaweed', 'baking_soda_powder', 'salsa', 'coconut_water', 'condiments'], 'K22 cards', 13);
const NEW = CARDS;
const BARE = nonEmpty(Object.entries({
  'white vinegar': 'vinegar', 'distilled vinegar': 'vinegar', 'red wine vinegar': 'vinegar', 'white wine vinegar': 'vinegar', 'balsamic vinegar': 'vinegar', 'rice vinegar': 'vinegar', 'malt vinegar': 'vinegar',
  'pasta sauce': 'pasta_sauce', 'marinara': 'pasta_sauce', 'marinara sauce': 'pasta_sauce', 'spaghetti sauce': 'pasta_sauce', 'jarred pasta sauce': 'pasta_sauce',
  'jam': 'jam', 'strawberry jam': 'jam', 'raspberry jam': 'jam', 'fruit preserves': 'jam', 'strawberry preserves': 'jam', 'grape jelly': 'jam',
  'ketchup': 'ketchup_mustard', 'catsup': 'ketchup_mustard', 'tomato ketchup': 'ketchup_mustard', 'mustard': 'ketchup_mustard', 'yellow mustard': 'ketchup_mustard', 'dijon mustard': 'ketchup_mustard', 'stone ground mustard': 'ketchup_mustard', 'spicy brown mustard': 'ketchup_mustard', 'whole grain mustard': 'ketchup_mustard',
  'mayo': 'mayo', 'mayonnaise': 'mayo', 'real mayonnaise': 'mayo', 'avocado oil mayo': 'mayo', 'olive oil mayo': 'mayo',
  'soy sauce': 'hot_soy_sauce', 'tamari': 'hot_soy_sauce', 'shoyu': 'hot_soy_sauce', 'low sodium soy sauce': 'hot_soy_sauce', 'naturally brewed soy sauce': 'hot_soy_sauce', 'hot sauce': 'hot_soy_sauce', 'fermented hot sauce': 'hot_soy_sauce',
  'canned soup': 'canned_soup', 'soup can': 'canned_soup', 'can of soup': 'canned_soup', 'low sodium soup': 'canned_soup', 'condensed soup': 'canned_soup',
  'olives': 'olives', 'green olives': 'olives', 'black olives': 'olives', 'kalamata olives': 'olives', 'castelvetrano olives': 'olives', 'olives in brine': 'olives', 'brine cured olives': 'olives', 'oil cured olives': 'olives',
  'seaweed': 'seaweed', 'nori': 'seaweed', 'nori sheets': 'seaweed', 'kombu': 'seaweed', 'kelp': 'seaweed', 'wakame': 'seaweed', 'dried seaweed': 'seaweed', 'seaweed snacks': 'seaweed', 'sea vegetables': 'seaweed',
  'baking powder': 'baking_soda_powder', 'double acting baking powder': 'baking_soda_powder', 'aluminum free baking powder': 'baking_soda_powder', 'bicarbonate of soda': 'baking_soda_powder', 'sodium bicarbonate': 'baking_soda_powder',
  'salsa': 'salsa', 'jarred salsa': 'salsa', 'chunky salsa': 'salsa', 'salsa jar': 'salsa', 'mild salsa': 'salsa', 'pico de gallo': 'salsa',
  'coconut water': 'coconut_water', 'pure coconut water': 'coconut_water', 'young coconut water': 'coconut_water',
  'condiments': 'condiments', 'condiment': 'condiments',
}), 'K22 bare rows', 77);
const KEEPS = nonEmpty([
  ['olive oil', 'olive_oil_grades'], ['extra virgin olive oil', 'olive_oil_grades'], ['apple cider vinegar', null],
  ['carton coconut milk', 'coconut_milk_beverage'], ['coconut milk beverage', 'coconut_milk_beverage'], ['canned coconut milk', 'canned_coconut_milk'],
  ['pickles', null], ['kimchi', 'kimchi'], ['miso', 'miso'], ['sauerkraut', 'sauerkraut'], ['kombucha tea', 'kombucha'],
  ['broth', 'broth'], ['bone broth', 'broth'], ['sea salt', 'salt'], ['white sugar', 'sugars'], ['cooking oil', 'cooking_oils'],
  ['maple syrup', 'maple_syrup'], ['nutritional yeast', 'nutritional_yeast'], ['dried herbs', 'dried_herbs'],
  ['soup bones', 'pick_soup_bones'], ['honey', 'honey_adulteration'], ['spices', 'whole_spices'], ['ghee', 'ghee'],
], 'K22 keep rows', 23);
const NOT_NEW = nonEmpty([
  'salad dressing', 'mustard greens', 'coconut milk', 'fish sauce', 'peanut butter', 'canned tomatoes', 'tomato paste', 'tomatoes', 'epsom salt', 'bottled water',
  'sparkling water', 'club soda', 'salt and vinegar chips', 'jelly beans', 'baking chocolate', 'coconut oil', 'olive oil spray', 'miso soup', 'worcestershire sauce', 'stock prices',
], 'K22 not-new rows', 20);
const FORBIDDEN = ['sauce', 'sauces', 'soup', 'soups', 'oil', 'oils', 'olive oil', 'soda', 'powder', 'water', 'coconut', 'spread', 'dressing', 'salad dressing', 'seasoning', 'hot', 'canned', 'broth', 'stock', 'sugar', 'salt', 'tomato', 'tomatoes', 'pepper', 'peppers', 'jelly', 'preserves', 'pickles', 'chips', 'snacks', 'apple cider vinegar', 'cider vinegar', 'fish sauce', 'miso', 'organic'];
const STATE_OK = { canned_soup: 'canned', seaweed: 'dried' };
const OWNERS = nonEmpty(['raw_cider_vinegar', 'fermented_pickles', 'fermented', 'olive_oil_grades', 'coconut_milk_beverage', 'canned_coconut_milk', 'miso', 'kimchi', 'cooking_oils', 'broth', 'salt', 'sugars', 'honey_adulteration'], 'sauce-and-can ask owners', 13);
const BANNED = ['cfr/text/21/155.170', 'events.uconn.edu', 'fao.org/4/x4285e', 'armandhammer'];
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];
const prose = (e) => JSON.stringify(PROSE.map((k) => e[k] ?? ''));

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K22 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K22 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k22 file, none banned', () => {
  const dir = join(ROOT, 'docs/sources/k22');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k22 archive', 49);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K22 URLs', 26);
  for (const u of urls) {
    assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k22 source`);
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

test('C9 one entry per id, no forbidden, cider, seed-oil, hydrogenated or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(cider|canola|soybean|seed oils?|vegetable oil|hydrogenated)\b/.test(a), `${id} barred alias ${a}`);
      for (const w of (a.match(/\b(fresh|frozen|canned|dried)\b/g) ?? [])) assert.equal(STATE_OK[id], w, `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = prose(e).replace(/hydrolyzed (soy |vegetable |plant )?protein/gi, '');
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(healthy|healthier|heart|brain|joints?|skin|safer|safest|cures?|prevents?|glycemic|blood sugar|blood pressure|hypertension|digest\w*|nutritious|nutrients?|inflammat\w*|probiotic\w*|gut|immun\w*|allerg\w*|asthma|sensitiv\w*|hypoallergenic|absorb\w*|cholesterol|intoleran\w*|celiac|therapeutic|weight|detox\w*|metabol\w*|insulin|enzymes?|beneficial|wellness|boost\w*|microbiome|omega\w*|b-?12|folic|minerals?|antioxidants?|catechins?|fiber|protein|stimulant\w*|collagen|trans fats?|superfood\w*|diet|thyroid\w*|goit\w*|deficien\w*|electrolytes?|hydrat\w*|potassium|botulism|toxins?|toxic\w*|poison\w*|bpa|calories?|pregnan\w*|kidneys?|cancer\w*|carcinogen\w*|msg|remed\w*)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost)\b/i);
  assert.doesNotMatch(text, /\b(heinz|hunt'?s|french'?s|grey poupon|maille|gulden'?s|hellmann'?s|best foods|duke'?s|miracle whip|kraft|sir kensington'?s|primal kitchen|chosen foods|kikkoman|la choy|san-j|yamasa|tabasco|frank'?s|cholula|huy fong|valentina|prego|rao'?s|ragu|ragú|bertolli|classico|newman'?s own|smucker'?s|bonne maman|welch'?s|polaner|dalfour|campbell'?s|progresso|amy'?s|pacific foods|lindsay|mezzetta|early california|seasnax|annie chun'?s|emerald cove|arm (&|and) hammer|clabber girl|rumford|tostitos|herdez|frontera|vita coco|zico|harmless harvest|bragg|pompeian|colavita|mccormick|costco|kirkland|trader joe'?s|whole foods market)\b/i);
});

test('C12 no doctor line in K22', () => {
  for (const id of NEW) assert.ok(!/\bdoctor\b/i.test(prose(byId(id))), `${id} has a doctor line`);
});

test('C16 food only: no household use on vinegar or baking_soda_powder, no seed oil named on mayo', () => {
  for (const id of ['vinegar', 'baking_soda_powder']) {
    assert.ok(byId(id), `${id} missing`);
    assert.doesNotMatch(prose(byId(id)), /\b(clean\w*|deodor\w*|odou?rs?|laundry|scrub\w*|unclog\w*|household|weeds?|disinfect\w*)\b/i, id);
  }
  assert.ok(byId('mayo'), 'mayo missing');
  assert.doesNotMatch(prose(byId('mayo')), /\b(canola|soybean|sunflower|safflower|corn|grapeseed|cottonseed|rice bran|vegetable|seed oils?)\b/i);
});
