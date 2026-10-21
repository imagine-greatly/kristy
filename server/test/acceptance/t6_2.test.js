// t6-2: T6 avoid sweep, batch 2 of 4 (dairy + eggs). Register label terms or an
// explicit evidence carry; decisions and carts remain byte-equal to ca32bef.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { T6_2, T6_2_BASE, preT6_2 } from './twoLinePin.js';
import { preCleanJ5 } from './cartPlain.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const kb = JSON.parse(readFileSync(join(ROOT, 'server/kristy_perimeter_kb.json'), 'utf8'));
kb.entries = kb.entries.map(preCleanJ5); // clean-sweep-J5: dairy pins read 5706fee; cleanPickJ5.test.js owns live copy.
const IDS = nonEmpty([...T6_2], 'T6_2 ids', 6);
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };

const TERMS = {
  egg_carton_terms: ['cage free', 'free range', 'pasture raised'],
  vegetarian_fed: ['vegetarian fed', 'all-vegetarian diet'],
  a1_a2: ['A2 milk', 'A2/A2'],
  synthetic_dyes: ['Red 40', 'Yellow 5', 'Yellow 6', 'Blue 1', 'Blue 2', 'Green 3', 'Red 3', 'artificial color'],
  rbst: ['rBST free', 'from cows not treated with rBST'],
  milk_protein_concentrate: ['milk protein concentrate', 'MPC'],
  flavored_yogurt_sugar: ['fruit on the bottom', 'vanilla', 'added sugars'],
  dairy_ladder: ['grass-fed', 'pasture raised', 'organic', '100% grass-fed'],
  ultra_pasteurized: ['ultra-pasteurized', 'UHT', 'vat pasteurized'],
  homogenization: ['non-homogenized', 'cream top', 'cream line'],
  shredded_cellulose: ['cellulose', 'powdered cellulose', 'potato starch'],
};
const OPEN = {
  egg_labels: ['egg_carton_terms', 'vegetarian_fed'],
  whole_vs_reduced_fat_milk: ['a1_a2'],
  yogurt_plain_vs_flavored: ['synthetic_dyes', 'rbst', 'milk_protein_concentrate'],
  plain_kefir: ['flavored_yogurt_sugar'],
  raw_aged_cheese: ['dairy_ladder'],
  dairy_case: ['ultra_pasteurized', 'homogenization', 'shredded_cellulose'],
};
const CARRIED = {
  'dairy_case/shredded_cellulose': 'healthyuwellness-shredded-cheese.md is COUNTER-VIEW; dairy_case has no existing cellulose material to retain.',
};

const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
};
const avoidText = (e) => [...strings(e.watch_out), ...strings((e.buying_tips || []).slice(2)), ...strings(e.detail)].join('\n').toLowerCase();

test('t6-2: every open concern names a register label term, or is CARRIED with a reason', () => {
  assert.deepEqual(Object.keys(OPEN).sort(), [...IDS].sort());
  for (const [key, reason] of Object.entries(CARRIED)) {
    const [id, concern] = key.split('/');
    assert.ok(OPEN[id]?.includes(concern), `${key} is not an open concern`);
    assert.ok(reason.trim().length > 10, `${key} carried without a reason`);
  }
  for (const [id, concerns] of Object.entries(OPEN)) {
    const text = avoidText(card(id));
    for (const c of nonEmpty(concerns, `${id} open concerns`)) {
      const key = `${id}/${c}`;
      if (key in CARRIED) continue;
      const terms = nonEmpty(TERMS[c], `${c} terms`);
      assert.ok(terms.some((t) => text.includes(t.toLowerCase())), `${key}: no label term in watch_out/buying_tips[2..]/detail`);
    }
  }
});

test('t6-2: decision and cart_pick byte-equal to ca32bef', () => {
  assert.equal(T6_2_BASE, 'ca32bef');
  assert.equal(IDS.length, 6);
  for (const id of IDS) {
    const was = preT6_2(card(id));
    assert.ok(was, `${id} missing at base`);
    assert.equal(card(id).decision, was.decision, `${id}.decision`);
    assert.equal(card(id).cart_pick, was.cart_pick, `${id}.cart_pick`);
  }
});

test('t6-2: no card prose has first person, em-dash, price or safety-claim words', () => {
  const bad = /\b(I|me|my)\b|—|\$|healthier|safer|pesticide-free/;
  for (const id of IDS) {
    // As in t6-1, query metadata is the shopper's wording; citations are source metadata.
    const { sources, aliases, asked_as, question, ...prose } = card(id);
    for (const s of nonEmpty(strings(prose), `${id} prose`)) assert.doesNotMatch(s, bad, `${id}: ${s}`);
  }
});

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const ARCHIVE = nonEmpty(walk(join(ROOT, 'docs/sources')), 'docs/sources files', 10).map((p) => readFileSync(p, 'utf8')).join('\n');
const urls = (e) => (e.sources || []).flatMap((s) => (typeof s === 'string' ? s : s?.url || '').match(/https?:\/\/[^\s]+/g) || []);

test('t6-2: every source URL on the six cards is archived verbatim under docs/sources/', () => {
  const missing = [];
  for (const id of IDS) {
    for (const u of nonEmpty(urls(card(id)), `${id} source URLs`)) if (!ARCHIVE.includes(u)) missing.push(`${id}: ${u}`);
  }
  assert.deepEqual(missing, [], 'unarchived source URLs');
});

test('t6-2: milk protein concentrate overflow stays in detail and every base source survives', () => {
  const yogurt = card('yogurt_plain_vs_flavored');
  assert.match(yogurt.detail, /Milk protein concentrate/);
  assert.doesNotMatch([...strings(yogurt.watch_out), ...strings(yogurt.buying_tips.slice(2))].join('\n'), /milk protein concentrate|\bMPC\b/i);
  for (const id of IDS) {
    for (const source of nonEmpty(preT6_2(card(id)).sources, `${id} base sources`)) {
      assert.ok(card(id).sources.some((s) => JSON.stringify(s) === JSON.stringify(source)), `${id} lost source ${JSON.stringify(source)}`);
    }
  }
});
