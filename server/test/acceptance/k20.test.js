// K20: fermented build (9 cards, no picks; fold tests appended only if 0b is ELIGIBLE).
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

const CARDS = nonEmpty(['kombucha', 'sauerkraut', 'kimchi', 'fermented_pickles', 'raw_cider_vinegar', 'miso', 'tempeh', 'natto', 'fermented'], 'K20 cards', 9);
const NEW = CARDS;
const BARE = nonEmpty(Object.entries({
  'kombucha': 'kombucha', 'kombucha tea': 'kombucha', 'bottled kombucha': 'kombucha', 'flavored kombucha': 'kombucha',
  'sauerkraut': 'sauerkraut', 'kraut': 'sauerkraut', 'raw sauerkraut': 'sauerkraut', 'unpasteurized sauerkraut': 'sauerkraut',
  'kimchi': 'kimchi', 'kimchee': 'kimchi', 'radish kimchi': 'kimchi', 'jarred kimchi': 'kimchi',
  'fermented pickles': 'fermented_pickles', 'brined pickles': 'fermented_pickles', 'half sour pickles': 'fermented_pickles', 'full sour pickles': 'fermented_pickles', 'lacto fermented pickles': 'fermented_pickles', 'naturally fermented pickles': 'fermented_pickles',
  'raw apple cider vinegar': 'raw_cider_vinegar', 'unfiltered apple cider vinegar': 'raw_cider_vinegar', 'apple cider vinegar with the mother': 'raw_cider_vinegar', 'apple cider vinegar with mother': 'raw_cider_vinegar', 'raw cider vinegar': 'raw_cider_vinegar',
  'miso': 'miso', 'miso paste': 'miso', 'white miso': 'miso', 'yellow miso': 'miso', 'red miso': 'miso', 'shiro miso': 'miso',
  'tempeh': 'tempeh', 'tempeh block': 'tempeh', 'tempeh cake': 'tempeh', 'multigrain tempeh': 'tempeh',
  'natto': 'natto', 'natto beans': 'natto', 'natto pack': 'natto',
  'fermented foods': 'fermented',
}), 'K20 bare rows', 37);
const KEEPS = nonEmpty([
  ['plain kefir', 'plain_kefir'], ['kefir drink', 'plain_kefir'], ['raw kefir', 'raw_kefir'], ['milk kefir', 'raw_kefir'], ['kefir grains', 'raw_kefir'],
  ['cultured dairy', 'yogurt_live_cultures'], ['pickled ginger', null], ['soy milk', 'soy_milk'], ['soymilk', 'soy_milk'],
  ['sour cream', 'sour_cream'], ['cultured sour cream', 'sour_cream'], ['sourdough', 'sourdough'], ['dairy case', 'dairy_case'], ['bread aisle', 'bread_aisle'],
], 'K20 keep rows', 14);
const NOT_NEW = nonEmpty([
  'vinegar', 'white vinegar', 'balsamic vinegar', 'rice vinegar', 'red wine vinegar', 'apple cider', 'apple juice',
  'soy sauce', 'tofu', 'edamame', 'soybeans', 'kefir', 'yogurt', 'greek yogurt', 'cabbage', 'red cabbage', 'cucumbers',
  'tea', 'green tea', 'beer', 'fish sauce', 'pickle relish', 'cottage cheese',
], 'K20 not-new rows', 23);
const FORBIDDEN = ['fermented', 'ferment', 'pickles', 'pickle', 'vinegar', 'apple cider vinegar', 'cider vinegar', 'acv', 'cider', 'cabbage', 'soy', 'soybeans', 'beans', 'tofu', 'paste', 'tea', 'raw', 'live', 'cultured', 'probiotic', 'probiotics', 'organic', 'unpasteurized', 'refrigerated', 'kefir', 'yogurt', 'sourdough'];
const OWNERS = nonEmpty(['yogurt_live_cultures', 'raw_kefir', 'plain_kefir', 'raw_aged_cheese', 'sourdough', 'soy_milk', 'sour_cream', 'dairy_case'], 'fermented ask owners', 8);
const BANNED = ['makesauerkraut', 'innerbuddies', 'japanesetaste', 'fda.gov/media/71937', 'thedailymeal', 'vinetur', 'farmdidi'];
const DOCTOR = 'Pregnant, nursing or on medication? Ask a doctor about the alcohol in kombucha.';
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];
const prose = (e) => JSON.stringify(PROSE.map((k) => e[k] ?? ''));

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K20 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 broad card: fermented owns exactly one short alias', () => {
  const al = nonEmpty(byId('fermented')?.aliases ?? [], 'fermented aliases', 3);
  assert.deepEqual(al.filter((a) => a.trim().split(/\s+/).length <= 2), ['fermented foods']);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K20 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got)) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k20 file, none banned', () => {
  const dir = join(ROOT, 'docs/sources/k20');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k20 archive', 40);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K20 URLs', 18);
  for (const u of urls) {
    assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k20 source`);
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
      if (id !== 'fermented') assert.ok(!/\bfermented foods?\b/.test(a), `${id} broad alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

for (const id of NEW) test(`C10 ${id}: no health, price or brand wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = prose(e).split(DOCTOR).join('');
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(healthy|healthier|heart|brain|bones?|safer|safest|cures?|prevents?|glycemic|blood sugar|digest\w*|nutritious|inflammat\w*|probiotic\w*|gut|immun\w*|allerg\w*|hypoallergenic|absorb\w*|cholesterol|intoleran\w*|therapeutic|weight|detox\w*|metabol\w*|insulin|enzymes?|beneficial|wellness|boost\w*|microbiome)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost)\b/i);
  assert.doesNotMatch(text, /\b(gt'?s|synergy|health-ade|humm|brew dr|kevita|bubbies|claussen|vlasic|grillo'?s|wildbrine|farmhouse culture|cleveland kraut|mother in law'?s|jongga|chung jung one|bibigo|lightlife|tofurky|franklin farms|bragg|heinz|marukome|hikari|miso master|nasoya|kikkoman|mizkan|h mart|costco)\b/i);
});

test('C12 exactly one doctor-routed line, on kombucha', () => {
  const carriers = NEW.filter((id) => (byId(id)?.watch_out ?? []).includes(DOCTOR));
  assert.deepEqual(carriers, ['kombucha']);
  for (const id of NEW) assert.ok(!/\bdoctor\b/i.test(prose(byId(id)).split(DOCTOR).join('')), `${id} has a second doctor line`);
});
