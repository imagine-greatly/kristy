// K23: snacks and deli build (13 cards, no picks, no fold).
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

const CARDS = nonEmpty(['crackers', 'tortilla_chips', 'potato_chips', 'popcorn', 'pretzels', 'snack_bars', 'trail_mix', 'snacks', 'hummus', 'deli_salads', 'prepared_meals', 'fresh_pasta', 'deli'], 'K23 cards', 13);
const NEW = CARDS;
const BARE = nonEmpty(Object.entries({
  'crackers': 'crackers', 'saltines': 'crackers', 'soda crackers': 'crackers', 'water crackers': 'crackers', 'sourdough crackers': 'crackers',
  'tortilla chips': 'tortilla_chips', 'corn tortilla chips': 'tortilla_chips', 'restaurant style tortilla chips': 'tortilla_chips',
  'potato chips': 'potato_chips', 'kettle chips': 'potato_chips', 'kettle cooked chips': 'potato_chips', 'potato crisps': 'potato_chips',
  'popcorn': 'popcorn', 'microwave popcorn': 'popcorn', 'popcorn kernels': 'popcorn',
  'pretzels': 'pretzels', 'hard pretzels': 'pretzels', 'pretzel twists': 'pretzels', 'pretzel sticks': 'pretzels',
  'granola bar': 'snack_bars', 'granola bars': 'snack_bars', 'snack bar': 'snack_bars', 'snack bars': 'snack_bars', 'cereal bar': 'snack_bars',
  'trail mix': 'trail_mix', 'gorp': 'trail_mix', 'student mix': 'trail_mix',
  'snack aisle': 'snacks', 'snack food aisle': 'snacks', 'packaged snack foods': 'snacks',
  'hummus': 'hummus', 'hommus': 'hummus', 'hummus dip': 'hummus',
  'deli salads': 'deli_salads', 'potato salad': 'deli_salads', 'chicken salad': 'deli_salads', 'egg salad': 'deli_salads', 'macaroni salad': 'deli_salads', 'coleslaw': 'deli_salads',
  'prepared meals': 'prepared_meals', 'prepared foods': 'prepared_meals', 'hot bar': 'prepared_meals', 'ready meals': 'prepared_meals',
  'fresh pasta': 'fresh_pasta', 'refrigerated pasta': 'fresh_pasta', 'fresh egg pasta': 'fresh_pasta', 'ravioli': 'fresh_pasta', 'tortellini': 'fresh_pasta',
  'deli section': 'deli', 'deli section foods': 'deli', 'store deli case': 'deli',
}), 'K23 bare rows', 51);
const KEEPS = nonEmpty([
  ['lunch meat', 'deli_meat_uncured'], ['deli meat', 'deli_meat_uncured'], ['cold cuts', 'deli_meat_uncured'], ['deli counter', 'deli_meat_uncured'], ['deli turkey', 'deli_meat_uncured'],
  ['rotisserie chicken', 'rotisserie_chicken'], ['deli chicken', 'rotisserie_chicken'], ['bagged salad', 'precut_produce_tradeoffs'], ['salad greens', 'produce_leafy_greens'], ['deli ham', 'ham'],
  ['granola', 'breakfast_cereal'], ['pasta', 'pasta_dry'], ['pasta sauce', 'pasta_sauce'], ['tortillas', 'tortillas'], ['pretzel bread', 'pretzel_bread'],
  ['nuts', 'nuts_raw_vs_roasted'], ['mixed nuts', 'nuts_raw_vs_roasted'], ['seaweed snacks', 'seaweed'], ['dried fruit', 'dried_fruit'], ['mayo', 'mayo'], ['condiments', 'condiments'], ['salsa', 'salsa'],
], 'K23 keep rows', 22);
const NOT_NEW = nonEmpty([
  'chocolate chips', 'fish sauce', 'ground beef', 'candy', 'cookies', 'soda', 'chocolate bar', 'candy bar', 'protein bar', 'chips', 'stock prices', 'bottled water', 'sourdough bread',
  'eggs', 'potatoes', 'corn tortillas', 'chickpeas', 'tahini', 'canned tuna', 'peanuts', 'raisins', 'sweet corn', 'sliced cheese', 'ice cream', 'soft drinks',
], 'K23 not-new rows', 25);
const FORBIDDEN = ['chips', 'chip', 'snacks', 'snack', 'bar', 'bars', 'salad', 'salads', 'deli', 'pasta', 'meals', 'meal', 'mix', 'dip', 'crisps', 'corn', 'nuts', 'granola', 'pretzel', 'cracker', 'soda', 'water', 'chicken', 'potato', 'potatoes', 'egg', 'eggs', 'macaroni', 'lunch meat', 'deli meat', 'cold cuts', 'rotisserie chicken', 'cookies', 'candy', 'protein bar', 'prepared', 'kettle', 'kernels', 'organic'];
const STATE_OK = { fresh_pasta: 'fresh' };
const OWNERS = nonEmpty(['deli_meat_uncured', 'rotisserie_chicken', 'nuts_raw_vs_roasted', 'breakfast_cereal', 'pasta_dry', 'pasta_sauce', 'tortillas', 'pretzel_bread', 'seaweed', 'precut_produce_tradeoffs', 'mayo', 'condiments'], 'snack-and-deli ask owners', 12);
const BANNED = ['openknowledge.fao.org', '146540839/recall-reveals', 'cidrap.umn.edu', '995610/why-you-should-start-buying-deli-meat', '1875323/costco', '1576719/why-costco', 'howstuffworks.com', 'cspi.org/news/litigation', 'foodprocessing.com'];
const LUNCH_HOMES = ['deli', 'snacks', 'deli_salads', 'prepared_meals'];
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];
const prose = (e) => JSON.stringify(PROSE.map((k) => e[k] ?? ''));

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K23 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K23 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k23 file, none banned', () => {
  const dir = join(ROOT, 'docs/sources/k23');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k23 archive', 69);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K23 URLs', 26);
  for (const u of urls) {
    assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k23 source`);
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

test('C9 one entry per id, no forbidden, barred or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(cider|canola|soybean|seed oils?|vegetable oil|hydrogenated|lunch|cold cuts|deli meat|deli counter|rotisserie|candy|cookies?|protein)\b/.test(a), `${id} barred alias ${a}`);
      for (const w of (a.match(/\b(fresh|frozen|canned|dried)\b/g) ?? [])) assert.equal(STATE_OK[id], w, `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, safety, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = prose(e).replace(/oxygen[- ]absorb\w*/gi, '');
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(healthy|healthier|heart|brain|joints?|skin|skins|safe|safer|safest|unsafe|safety|cures?|prevents?|glycemic|blood sugar|blood pressure|hypertension|digest\w*|nutritious|nutrients?|inflammat\w*|probiotic\w*|gut|immun\w*|allerg\w*|sensitiv\w*|absorb\w*|cholesterol|intoleran\w*|celiac|therapeutic|weight|detox\w*|metabol\w*|insulin|beneficial|wellness|boost\w*|microbiome|omega\w*|minerals?|antioxidants?|fiber|protein|collagen|trans fats?|superfood\w*|diet|deficien\w*|electrolytes?|toxins?|toxic\w*|poison\w*|caustic|drain|calories?|macros?|carbs?|carbohydrates?|guilt\w*|junk|treats?|pregnan\w*|cancer\w*|carcinogen\w*|acrylamide|niacin|msg|remed\w*|illness\w*|sick\w*|food ?borne|food poisoning|listeria|pathogens?|salmonella|bacteria\w*|germs?|danger zone)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost|premium|bargain)\b/i);
  assert.doesNotMatch(text, /\b(ritz|mondel[eē]z|nabisco|triscuits?|wheat thins|goldfish|cheez-?its?|kellogg[’']?s?|fritos|tostitos|lay[’']s|pringles|procter (&|and) gamble|kettle brand|cape cod|utz|snyder[’']?s|rold gold|orville redenbacher|smartfood|nature valley|clif|quaker|harmony foods|m&m[’']?s?|sabra|soom|cedar[’']?s|athenos|boar[’']?s head|buitoni|barilla|giovanni rana|mi ni[ñn]a|heat and control|costco|kirkland|trader joe[’']?s|whole foods)\b/i);
});

test('C12 no doctor line in K23', () => {
  for (const id of NEW) assert.ok(!/\bdoctor\b/i.test(prose(byId(id))), `${id} has a doctor line`);
});

test('C16 deli and snack boundaries: no pathogen, sodium or seed-oil wording, no nitrite on deli, lunch meat never on a K23 home', () => {
  for (const id of NEW) {
    assert.ok(byId(id), `${id} missing`);
    const t = prose(byId(id));
    assert.doesNotMatch(t, /\b(listeria|pathogens?|salmonella|bacteria\w*|danger zone|germs?)\b/i, id);
    assert.doesNotMatch(t.replace(/sodium (hydroxide|bicarbonate)/gi, ''), /\bsodium\b/i, id);
    assert.doesNotMatch(t, /\b(canola|soybean|sunflower|safflower|cottonseed|grapeseed|rice bran|corn oil|vegetable oils?|seed oils?)\b/i, id);
  }
  assert.doesNotMatch(prose(byId('deli')), /\b(nitrites?|nitrates?|cured|curing|uncured)\b/i);
  for (const row of ['lunch meat', 'deli meat', 'cold cuts', 'deli turkey', 'deli ham']) assert.ok(!LUNCH_HOMES.includes(rowMatch(row)), `${row} -> ${rowMatch(row)}`);
  for (const q of ['which lunch meat should i buy', 'is lunch meat worth buying']) assert.ok(!LUNCH_HOMES.includes(top(q).id), `${q} -> ${top(q).id}`);
});
