// t6-2: T6 avoid sweep, batch 2 of 4 (dairy + eggs). Register label terms or an
// explicit evidence carry; decisions and carts remain byte-equal to ca32bef.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { execFileSync } from 'node:child_process';
import { T6_2, T6_2_BASE, preT6_2 } from './twoLinePin.js';
import { preCleanJ5 } from './cartPlain.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
// Completeness pass 2026-10-22 (DECISIONS-2026-10-22.md) swapped government/extension sources for holistic ones. A base
// source may be missing only if that pass dropped it (it sat on the card at 9845b9e); the card keeps >=1 source and
// nothing the pass added is government.
const CP = JSON.parse(execFileSync('git', ['show', '9845b9e:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const cpSources = (id) => (CP.entries.find((x) => x.id === id)?.sources || []).map((s) => JSON.stringify(s));
const GOV = /\.gov\b|\bextension\b|\b(USDA|FDA|FSIS|CDC|NIH|EPA)\b/i;
const passDropped = (id, s) => cpSources(id).includes(JSON.stringify(s));
const assertSwap = (id, e) => { const before = cpSources(id); for (const s of nonEmpty(e.sources || [], `${id} sources`, 1)) if (!before.includes(JSON.stringify(s))) assert.doesNotMatch(JSON.stringify(s), GOV, `${id} new source is government: ${JSON.stringify(s)}`); };
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

test('t6-2: decision and cart_pick match the current pilot', () => {
  // retired: pilot merge replaced this batch's text (P4)
  const expected = {
  "egg_labels": {
    "decision": "Organic, pasture-raised eggs from hens on soy-free, corn-free feed.",
    "cart_pick": "Organic Certified Humane pasture-raised eggs"
  },
  "whole_vs_reduced_fat_milk": {
    "decision": "Trusted raw milk from a farm, or low-temp pasteurized 100% grass-fed.",
    "cart_pick": "100% grass-fed low-temp pasteurized whole milk"
  },
  "yogurt_plain_vs_flavored": {
    "decision": "Plain Greek yogurt made from 100% grass-fed milk.",
    "cart_pick": "Plain Greek yogurt, 100% grass-fed"
  },
  "plain_kefir": {
    "decision": "Plain organic whole-milk kefir, 100% grass-fed: milk and cultures only.",
    "cart_pick": "100% grass-fed organic plain whole kefir"
  },
  "raw_aged_cheese": {
    "decision": "Grass-fed organic raw-milk cheese, aged 60 days or more.",
    "cart_pick": "Aged organic raw-milk cheddar"
  },
  "dairy_case": {
    "decision": "Choose the dairy type first, then read the carton.",
    "cart_pick": "Dairy picked by type, label read"
  }
};
  assert.equal(IDS.length, 6);
  assert.deepEqual(Object.keys(expected).sort(), [...IDS].sort());
  for (const id of IDS) {
    assert.equal(card(id).decision, expected[id].decision, `${id}.decision`);
    assert.equal(card(id).cart_pick, expected[id].cart_pick, `${id}.cart_pick`);
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
    assertSwap(id, card(id));
    for (const source of nonEmpty(preT6_2(card(id)).sources, `${id} base sources`)) {
      assert.ok(card(id).sources.some((s) => JSON.stringify(s) === JSON.stringify(source)) || passDropped(id, source), `${id} lost source ${JSON.stringify(source)}`);
    }
  }
});
