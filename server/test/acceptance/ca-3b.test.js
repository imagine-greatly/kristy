import { restoreOrganicCarts } from './cartPlain.js';
// Written by the planner; do not edit.
// ca-3b: docs/CARD-ALIGNMENT-PLAN.md "CA-3 Meat batch", CA-3b rows. D8: chicken_breast is rewritten, not folded.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import * as pass from './passRule.js';
import { RETIRED, projectEntry } from '../../lib/counterCards.js';
import { beforeConcern, preCleanPick10, preCleanPick8 } from './twoLinePin.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = restoreOrganicCarts(JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8')));
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const BASE = 'aa12a3d';
const PRE = JSON.parse(execFileSync('git', ['show', `${BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
// clean-pick-10 moved chicken_cuts_basics and ground_turkey; this batch reads them as of 117ab78.
const now = (id) => beforeConcern(preCleanPick10(preCleanPick8(kb.entries.find((e) => e.id === id))));
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const flat = (r) => (Array.isArray(r) ? r : (r && r.violations) || []);
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));

const BATCH = ['pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast', 'rotisserie_chicken',
  'turkey_whole', 'ground_turkey', 'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const CURED = ['bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured'];
const MEAT_TIP = { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] };
const COPY_SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'category', 'evidence_tier']);
const BRAND = /whole foods|tyson|perdue|hormel|oscar mayer|applegate|boar.s head|smithfield|jimmy dean|hillshire|butterball|jennie-o|foster farms/i;
const CLAIM = /healthier|healthiest|better for you|lowers|exposure|protein|calorie/i;
const PRICE = /\bcheapest\b|\bprice\b|\$[0-9]/i;
const CURE_WORD = /\b(cured|uncured|nitrite|nitrate|celery powder|celery juice)\b/i;

test('C1 D1 limits hold on every CA-3b card', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    if (Array.isArray(e.pick_steps)) {
      assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `${id} pick_steps ${e.pick_steps.length}`);
      for (const s of e.pick_steps) assert.ok(words(s) <= 14, `${id} pick_step "${s}"`);
    }
    if (e.kind === 'pick') continue;
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5 && words(n) <= 20, `${id} tier_note ${words(n)} words`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.ok(String(e.instead || '').trim().length > 0 && words(e.instead) <= 24, `${id} instead`);
  }
});

test('C2 no CA-3b decision or cart_pick prints a grass term', () => {
  for (const id of BATCH) {
    const e = now(id);
    assert.doesNotMatch(String(e.decision || ''), /grass-(fed|finished)/i, `${id} decision`);
    assert.doesNotMatch(String(e.cart_pick || ''), /grass-(fed|finished)/i, `${id} cart_pick`);
  }
});

test('C3 chicken_breast survives as a rewrite', () => {
  const e = now('chicken_breast');
  assert.ok(e, 'chicken_breast was removed');
  assert.ok(!RETIRED_IDS.has('chicken_breast'), 'chicken_breast is RETIRED');
  assert.match(String(e.cart_pick || ''), /breast/i);
  assert.notEqual(JSON.stringify(e), JSON.stringify(pre('chicken_breast')), 'chicken_breast unchanged');
});

test('C4 the pass rule holds for every CA-3b id', (t) => {
  for (const id of BATCH) pass.assertPassRule(t, pre(id), now(id));
});

test('C5 brand claim and price greps are zero over changed copy fields', () => {
  let changed = 0;
  for (const id of BATCH) {
    const e = now(id);
    const p = pre(id);
    for (const [f, v] of Object.entries(e)) {
      if (COPY_SKIP.has(f) || JSON.stringify(v) === JSON.stringify(p[f])) continue;
      changed++;
      const s = JSON.stringify(v);
      assert.doesNotMatch(s, BRAND, `${id}.${f} brand`);
      assert.doesNotMatch(s, CLAIM, `${id}.${f} claim-lock word`);
      assert.doesNotMatch(s, PRICE, `${id}.${f} price`);
      assert.doesNotMatch(s, /—/, `${id}.${f} em-dash`);
      assert.doesNotMatch(s, /\b(I|me|my|mine)\b/, `${id}.${f} first person`);
    }
  }
  assert.ok(changed >= 14, `only ${changed} changed copy fields`);
});

test('C6 the full meat section is lint-clean under the meat tip', () => {
  const hits = lint.lintSections([{ ...MEAT_TIP, tip_aligned: true, cards_aligned: true }], kb.entries);
  const bad = hits.filter((h) => h.section === 'meat' && ['SECTION_TIP_REPEATS_CARD', 'SECTION_PHRASE_REPEATED', 'TERM_UNGLOSSED', 'CART_PICK_DISAGREES'].includes(h.code));
  assert.deepEqual(bad, []);
});

test('C7 cure sentences come only from the shared set', () => {
  const allowed = new Set(lint.PRESERVATION_CURE_SENTENCES);
  assert.ok(allowed.size > 0, 'PRESERVATION_CURE_SENTENCES empty');
  for (const id of CURED) {
    const e = now(id);
    const p = pre(id);
    for (const f of ['decision', 'tier_note', 'why', 'short_answer', 'kristy_take']) {
      if (JSON.stringify(e[f]) === JSON.stringify(p[f])) continue;
      for (const s of String(e[f] || '').split(/(?<=[.!?])\s+/)) {
        if (CURE_WORD.test(s) && !/^Cured\b|^Uncured\b/.test(s.trim())) assert.ok(allowed.has(s.trim()), `${id}.${f} authored a cure sentence: ${s}`);
      }
    }
  }
});

test('C8 per-card lints are clean and headlines match', () => {
  for (const id of BATCH) {
    const e = now(id);
    if (e.kind === 'pick' || JSON.stringify(e) === JSON.stringify(pre(id))) continue;
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(flat(lint.readability(e)), [], `${id} readability`);
    assert.deepEqual(flat(lint.lintPickSteps(e)), [], `${id} lintPickSteps`);
  }
});
