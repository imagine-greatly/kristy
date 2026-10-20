// t6-3: T6 avoid sweep, pantry batch. Label terms or a reasoned evidence carry;
// the two purchase lines remain byte-equal to 6d6ca49.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintCard, readability } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { T6_3, T6_3_BASE, preT6_3 } from './twoLinePin.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const kb = JSON.parse(readFileSync(join(ROOT, 'server/kristy_perimeter_kb.json'), 'utf8'));
const IDS = nonEmpty([...T6_3], 'T6_3 ids', 14);
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const TERMS = {
  phytic_acid: ['sprouted', 'sourdough', 'soaked', 'activated'],
  seed_oils: ['canola', 'corn', 'cottonseed', 'soybean', 'sunflower', 'safflower', 'grapeseed', 'rice bran oil', 'vegetable oil'],
  avocado_oil_blends: ['made with avocado oil', 'avocado oil blend'],
  irradiation: ['Radura symbol', 'treated with irradiation'],
  bleached_enriched_flour: ['bleached', 'enriched flour'],
  sodium_benzoate: ['sodium benzoate', 'potassium benzoate', 'benzoic acid'],
  natural_flavors: ['natural flavor', 'natural flavors', 'artificial flavor', 'artificial flavors', 'flavoring'],
  phthalates_bisphenols: ['cheese powder'],
  potassium_bromate: ['potassium bromate', 'bromated flour'],
  caramel_color: ['caramel color'],
  synthetic_dyes: ['Red 40', 'Yellow 5', 'Yellow 6', 'Blue 1', 'Blue 2', 'Green 3', 'Red 3', 'artificial color'],
  health_halo: ['keto', 'plant-based', 'high protein', 'made with real'],
};
const OPEN = {
  nuts_raw_vs_roasted: ['phytic_acid'],
  nut_butter_ingredients: ['seed_oils'],
  cooking_oils: ['avocado_oil_blends'],
  whole_spices: ['irradiation'],
  dried_herbs: ['irradiation'],
  specialty_flours: ['bleached_enriched_flour'],
  fermented_pickles: ['sodium_benzoate'],
  frozen_fries: ['seed_oils', 'acrylamide'],
  bottled_water_buying: ['natural_flavors'],
  deli_salads: ['seed_oils'],
  prepared_meals: ['phthalates_bisphenols', 'pfas_packaging'],
  bread_aisle: ['potassium_bromate'],
  condiments: ['caramel_color', 'sodium_benzoate'],
  snacks: ['synthetic_dyes', 'health_halo'],
};
const CARRIED = {
  'frozen_fries/acrylamide': 'Register column 3 says none on label: no ingredient-label term can truthfully close this gap. Sourced thick-cut bag guidance and cooking-byproduct context are retained and tested below.',
  'prepared_meals/pfas_packaging': 'Register column 3 says none on label: no ingredient-label term or package appearance establishes PFAS content. Sourced packaging context and glass-container guidance are retained and tested below.',
  'snacks/health_halo': 'packaged/cspi-health-buzzwords.md discusses other front-label claims, but does not substantiate the register terms keto, plant-based, high protein or made with real as snack-label claims. Its seed-oil section is COUNTER-VIEW; no such verdict is imported.',
};
// Column 3 explicitly says "none on label" for these two concerns. Do not invent
// ingredient-label terms: assert the sourced bag/packaging guidance separately.
const NO_LABEL_TERM = {
  'frozen_fries/acrylamide': ['thick-cut fries', 'acrylamide', 'cooking byproduct, not an added ingredient'],
  'prepared_meals/pfas_packaging': ['pfas', 'paper food packaging', 'glass container'],
};
const strings = (v) => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const avoidText = (e) => [...strings(e.watch_out), ...strings((e.buying_tips || []).slice(2)), ...strings(e.detail)].join('\n').toLowerCase();
const prose = (e) => {
  // Shopper-query and citation metadata are not authored card prose (as in t6-2).
  const { sources, aliases, asked_as, question, ...copy } = e;
  return nonEmpty(strings(copy), `${e.id} prose`);
};

test('t6-3: each open concern has a register term, sourced label-free guidance, or a reasoned carry', () => {
  assert.deepEqual(Object.keys(OPEN).sort(), [...IDS].sort());
  for (const [key, reason] of Object.entries(CARRIED)) {
    const [id, concern] = key.split('/');
    assert.ok(OPEN[id]?.includes(concern), `${key} is not open`);
    assert.ok(reason.trim().length > 10, `${key} needs a reason`);
  }
  assert.deepEqual(Object.keys(NO_LABEL_TERM).sort(), ['frozen_fries/acrylamide', 'prepared_meals/pfas_packaging']);
  for (const [id, concerns] of Object.entries(OPEN)) {
    for (const concern of nonEmpty(concerns, `${id} concerns`)) {
      const key = `${id}/${concern}`;
      if (key in CARRIED && !(key in NO_LABEL_TERM)) continue;
      const text = avoidText(card(id));
      if (key in NO_LABEL_TERM) {
        for (const term of nonEmpty(NO_LABEL_TERM[key], key)) assert.ok(text.includes(term), `${key}: missing ${term}`);
      } else {
        assert.ok(nonEmpty(TERMS[concern], `${concern} terms`).some((t) => text.includes(t.toLowerCase())), `${key}: missing register term`);
      }
    }
  }
});

test('t6-3: decision and cart_pick byte-equal to 6d6ca49', () => {
  assert.equal(T6_3_BASE, '6d6ca49');
  assert.equal(IDS.length, 14);
  for (const id of IDS) {
    const was = preT6_3(card(id));
    assert.ok(was, `${id} missing at base`);
    for (const field of ['decision', 'cart_pick']) assert.equal(card(id)[field], was[field], `${id}.${field}`);
  }
});

test('t6-3: card prose has no first person, em-dash, price or safety-claim words', () => {
  for (const id of IDS) for (const line of prose(card(id))) {
    assert.doesNotMatch(line, /\b(I|me|my)\b|—|\$|healthier|safer|pesticide-free/, `${id}: ${line}`);
  }
});

test('t6-3: avocado oil is never recommended', () => {
  for (const id of IDS) {
    for (const line of prose(card(id)).filter((s) => /avocado oil/i.test(s))) {
      // Every existing or new mention must explicitly say to skip it. A second
      // affirmative clause must not slip through beside that skip instruction.
      assert.match(line, /\bskip\b[^.!?]*avocado oil/i, `${id}: ${line}`);
      assert.doesNotMatch(line, /\b(?:choose|pick|use|buy|prefer|recommend|look for)\b[^.!?;]*\bavocado oil\b/i, `${id}: ${line}`);
    }
  }
  // The oil shelf card skips plain avocado oil outright, not only blends.
  assert.ok(card('cooking_oils').buying_tips.some((s) => /^Skip avocado oil too\b/.test(s)), 'cooking_oils: plain avocado oil skip');
});

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const ARCHIVE = nonEmpty(walk(join(ROOT, 'docs/sources')), 'source archive', 10).map((p) => readFileSync(p, 'utf8')).join('\n');
const urls = (e) => (e.sources || []).flatMap((s) => (typeof s === 'string' ? s : s?.url || '').match(/https?:\/\/[^\s]+/g) || []);

test('t6-3: every source URL on all 14 cards is archived verbatim', () => {
  const missing = [];
  for (const id of IDS) for (const url of nonEmpty(urls(card(id)), `${id} source URLs`)) {
    if (!ARCHIVE.includes(url)) missing.push(`${id}: ${url}`);
  }
  assert.deepEqual(missing, []);
});

test('t6-3: capped watch-outs and overflow retain existing guidance', () => {
  for (const id of IDS) assert.ok(card(id).watch_out.length <= 3, `${id}: watch-out cap`);
  assert.match(card('frozen_fries').detail, /thick-cut fries.*Acrylamide/);
  assert.match(card('bottled_water_buying').detail, /natural flavors/);
  assert.ok(card('condiments').detail.includes(preT6_3(card('condiments')).watch_out[0]));
  for (const id of IDS) for (const line of preT6_3(card(id)).watch_out) {
    assert.ok(card(id).watch_out.includes(line) || card(id).detail.includes(line), `${id}: lost existing watch-out`);
  }
});

const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
test('t6-3: all 14 live cards remain readable and lint-clean', () => {
  for (const id of IDS) {
    assert.deepEqual(readability(card(id)), [], `${id} readability`);
    assert.deepEqual(lintCard(projectEntry(card(id), { doLine: reviewed.get(id)?.do || '' })), [], `${id} lint`);
  }
});
