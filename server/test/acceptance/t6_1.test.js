import { restoreOrganicCarts } from './cartPlain.js';
// t6-1 (2026-10-20): T6 avoid sweep, batch 1 of 4 (meat + seafood). Each open register
// concern on these 15 cards names a label term (docs/CONCERN-REGISTER.md col 3) where the
// shopper reads it, or is CARRIED with a reason. decision/cart_pick stay as of 85c399e.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { T6_1, T6_1_BASE, preT6_1 } from './twoLinePin.js';

const ROOT = new URL('../../../', import.meta.url).pathname;
const kb = restoreOrganicCarts(JSON.parse(readFileSync(join(ROOT, 'server/kristy_perimeter_kb.json'), 'utf8')));
const IDS = nonEmpty([...T6_1], 'T6_1 ids', 15);
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };

const TERMS = {
  routine_antibiotics: ['no antibiotics ever', 'raised without antibiotics'],
  ractopamine: ['raised without ractopamine', 'no beta-agonists'],
  grassfed_claim: ['grass fed', 'grass finished', '100% grass fed', 'American Grassfed'],
  welfare_claims: ['humanely raised', 'pasture raised', 'free range', 'Animal Welfare Approved', 'Certified Humane'],
  mechanically_tenderized: ['mechanically tenderized', 'blade tenderized'],
  phosphate_additives: ['sodium phosphate', 'sodium tripolyphosphate', 'phosphoric acid'],
  sulfites: ['sulfur dioxide', 'sodium metabisulfite', 'unsulfured'],
  seafood_antibiotics: ['country of origin', 'farm raised'],
  shrimp_bacteria: [],
  bpa_cans: ['BPA-free lining', 'non-BPA'],
  msc_low_bar: ['MSC certified'],
  seafood_mislabeling: ['species name', 'country of origin'],
  seafood_stpp: ['dry packed', 'sodium tripolyphosphate', 'wet'],
  co_treated_fish: ['tasteless smoke', 'filtered smoke', 'treated with carbon monoxide'],
  mercury: ['albacore', 'light', 'skipjack'],
};

const OPEN = {
  beef_grassfed_vs_grainfed: ['routine_antibiotics', 'ractopamine'],
  beef_cuts_basics: ['grassfed_claim'],
  ground_beef_lean_ratio: ['grassfed_claim', 'ractopamine'],
  lamb_goat: ['grassfed_claim'],
  bison: ['grassfed_claim'],
  judging_meat_at_the_case: ['welfare_claims', 'mechanically_tenderized'],
  pork_cuts_and_enhanced: ['phosphate_additives', 'welfare_claims', 'routine_antibiotics', 'ractopamine'],
  shrimp_imported_vs_domestic: ['sulfites', 'seafood_antibiotics', 'shrimp_bacteria'],
  canned_fish_choosing: ['bpa_cans'],
  farmed_fish_by_species: ['seafood_antibiotics'],
  canned_tuna: ['msc_low_bar', 'bpa_cans'],
  crab: ['seafood_mislabeling'],
  seafood_certifications: ['msc_low_bar'],
  seafood_counter: ['seafood_stpp', 'co_treated_fish', 'mercury'],
};

const CARRIED = {
  'shrimp_imported_vs_domestic/sulfites': 'asthma-nz-sulphites.md never names shrimp or seafood; no evidence for this card.',
  'shrimp_imported_vs_domestic/shrimp_bacteria': 'register lists no label term; the CR bacteria finding already stands in watch_out.',
  'seafood_counter/mercury': 'cr-mercury-in-fish-report.md names no species tier; the tiers live on mercury_by_fish.',
};

const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
};
const avoidText = (e) => [...strings(e.watch_out), ...strings((e.buying_tips || []).slice(2)), ...strings(e.detail)].join('\n').toLowerCase();

test('t6-1: every open concern names a register label term, or is CARRIED with a reason', () => {
  nonEmpty(Object.keys(OPEN), 'open-concern cards', 14);
  for (const [id, concerns] of Object.entries(OPEN)) {
    assert.ok(T6_1.has(id), `${id} not in T6_1`);
    const text = avoidText(card(id));
    for (const c of concerns) {
      const key = `${id}/${c}`;
      if (key in CARRIED) { assert.ok(CARRIED[key].length > 10, `${key} carried without a reason`); continue; }
      const terms = nonEmpty(TERMS[c], `${c} terms`);
      assert.ok(terms.some((t) => text.includes(t.toLowerCase())), `${key}: no label term in watch_out/buying_tips[2..]/detail`);
    }
  }
});

test('t6-1: decision and cart_pick byte-equal to 85c399e', () => {
  assert.equal(T6_1_BASE, '85c399e');
  for (const id of IDS) {
    const was = preT6_1(card(id));
    assert.ok(was, `${id} missing at base`);
    assert.equal(card(id).decision, was.decision, `${id}.decision`);
    assert.equal(card(id).cart_pick, was.cart_pick, `${id}.cart_pick`);
  }
});

test('t6-1: mercury_by_fish drops the "well below" reassurance', () => {
  assert.ok(!/well below/i.test(JSON.stringify(card('mercury_by_fish'))));
  assert.match(JSON.stringify(preT6_1(card('mercury_by_fish'))), /well below/i); // the base had it
});

test('t6-1: no line on the 15 has first person, em-dash, price or safety-claim words', () => {
  const bad = /\b(I|me|my)\b|—|\$|healthier|safer|pesticide-free/;
  for (const id of IDS) {
    const { sources, aliases, asked_as, question, ...prose } = card(id); // question and asked_as are the shopper's own words
    for (const s of nonEmpty(strings(prose), `${id} prose`)) assert.ok(!bad.test(s), `${id}: ${s}`);
  }
});

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const ARCHIVE = nonEmpty(walk(join(ROOT, 'docs/sources')), 'docs/sources files', 10).map((p) => readFileSync(p, 'utf8')).join('\n');
const urlOf = (s) => (typeof s === 'string' ? s : s?.url || '').match(/https?:\/\/\S+/)?.[0];

// Scope: URLs this batch added. Older citations on these cards (fsis, iastate, ecfr...) predate
// the archive and are outside t6-1.
test('t6-1: every source URL added since 85c399e is archived verbatim under docs/sources/', () => {
  const added = [];
  for (const id of IDS) {
    const before = new Set((preT6_1(card(id)).sources || []).map(urlOf));
    for (const u of (card(id).sources || []).map(urlOf)) if (u && !before.has(u)) added.push(u);
  }
  for (const u of nonEmpty(added, 'added URLs', 5)) assert.ok(ARCHIVE.includes(u), `${u} not archived`);
});
