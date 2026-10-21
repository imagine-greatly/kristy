import { restoreOrganicCarts } from './cartPlain.js';
// t6-4: produce and label-term avoids. Purchase lines stay at 2f67540.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintCard, readability } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { T6_4, T6_4_BASE, preT6_4 } from './twoLinePin.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const kb = restoreOrganicCarts(JSON.parse(readFileSync(join(ROOT, 'server/kristy_perimeter_kb.json'), 'utf8')));
import { preSwapPicks1 } from './twoLinePin.js';
kb.entries = preSwapPicks1(kb.entries); // swap-picks-1: 8 swap picks + 2 aliases after 58d6160; swap_picks_1.test.js owns them.
const base = JSON.parse(execFileSync('git', ['show', `${T6_4_BASE}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const IDS = nonEmpty([...T6_4], 'T6_4 ids', 6);
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const TERMS = {
  produce_coatings: ['coated with food-grade wax', 'shellac', 'carnauba', 'Apeel'],
  egg_carton_terms: ['cage free', 'free range', 'pasture raised'],
  hidden_sugars: ['dextrose', 'corn syrup', 'maltodextrin', 'evaporated cane juice', 'fruit juice concentrate'],
  seed_oils: ['canola', 'corn', 'cottonseed', 'soybean', 'sunflower', 'safflower', 'grapeseed', 'rice bran oil', 'vegetable oil'],
  farmed_salmon_contaminants: ['farm raised', 'Atlantic salmon'],
};
const OPEN = {
  washing_produce: ['produce_coatings'],
  label_cage_free: ['egg_carton_terms'],
  label_pasture_raised_feed: ['egg_carton_terms'],
  label_lightly_sweetened: ['hidden_sugars'],
  label_cold_pressed_expeller: ['seed_oils'],
  label_wild_vs_farm_raised: ['farmed_salmon_contaminants'],
};
// No open concern needs carrying: seed oils use label truth only; the salmon
// card explains the farming label without importing contaminant or health claims.
// The register's seed-oil COUNTER-VIEW is not used as a shopper-facing verdict.
const CARRIED = {};
const EVIDENCE = {
  washing_produce: 'produce_seafood/nwhort-fruit-coatings.md',
  label_cage_free: 'dairy_eggs_packaging/cr-egg-carton-labels.md',
  label_pasture_raised_feed: 'dairy_eggs_packaging/cr-egg-carton-labels.md',
  label_lightly_sweetened: 'pantry/ucsf-sugarscience-hidden-names.md',
  label_cold_pressed_expeller: 'pantry/shanahan-hateful-eight.md',
  label_wild_vs_farm_raised: 'produce_seafood/nbc-farmed-salmon-contaminated.md',
};
const strings = (v) => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const avoidLines = (e) => [...strings(e.watch_out), ...strings((e.buying_tips || []).slice(2))];
const prose = (e) => {
  // As in t6-3, shopper queries and citation metadata are not authored card prose.
  const { sources, aliases, asked_as, question, ...copy } = e;
  return nonEmpty(strings(copy), `${e.id} prose`);
};
const urls = (e) => (e.sources || []).flatMap((s) => (typeof s === 'string' ? s : s?.url || '').match(/https?:\/\/[^\s]+/g) || []);
const fresh = (id) => prose(card(id)).filter((s) => !prose(preT6_4(card(id))).includes(s));

test('t6-4: all six open concerns have a register label term or a reasoned carry', () => {
  assert.deepEqual(Object.keys(OPEN).sort(), [...IDS].sort());
  for (const [key, reason] of Object.entries(CARRIED)) {
    const [id, concern] = key.split('/');
    assert.ok(OPEN[id]?.includes(concern), `${key} is not open`);
    assert.ok(reason.trim().length > 10, `${key} needs a reason`);
  }
  for (const [id, concerns] of Object.entries(OPEN)) {
    const text = [...avoidLines(card(id)), ...strings(card(id).detail)].join('\n').toLowerCase();
    for (const concern of nonEmpty(concerns, `${id} concerns`)) {
      if (`${id}/${concern}` in CARRIED) continue;
      assert.ok(nonEmpty(TERMS[concern], `${concern} terms`).some((t) => text.includes(t.toLowerCase())), `${id}/${concern}: missing register term`);
      // This batch has room for its new concern before the detail overflow.
      assert.ok(TERMS[concern].some((t) => avoidLines(card(id)).join('\n').toLowerCase().includes(t.toLowerCase())), `${id}: label term only in detail`);
    }
  }
});

test('t6-4: decision and cart_pick byte-equal to 2f67540, including absent properties', () => {
  assert.equal(T6_4_BASE, '2f67540');
  assert.equal(IDS.length, 6);
  for (const id of IDS) for (const field of ['decision', 'cart_pick']) {
    const was = preT6_4(card(id));
    assert.ok(was, `${id} absent at base`);
    assert.equal(Object.hasOwn(card(id), field), Object.hasOwn(was, field), `${id}.${field} presence`);
    assert.equal(card(id)[field], was[field], `${id}.${field}`);
  }
});

test('t6-4: only the six owned entries and allowed copy fields changed', () => {
  assert.deepEqual({ ...kb, entries: [] }, { ...base, entries: [] });
  assert.deepEqual(kb.entries.map((e) => e.id), base.entries.map((e) => e.id));
  const owned = new Set(['watch_out', 'buying_tips', 'detail', 'labels_decoded', 'sources']);
  for (const was of nonEmpty(base.entries, 'base entries', 181)) {
    const now = card(was.id);
    if (!T6_4.has(was.id)) assert.deepEqual(now, was, was.id);
    else {
      assert.deepEqual(Object.keys(now), Object.keys(was), `${was.id} keys`);
      for (const key of Object.keys(was)) if (!owned.has(key)) assert.deepEqual(now[key], was[key], `${was.id}.${key}`);
    }
  }
});

test('t6-4: card prose has no first person, em-dash, price or safety-claim words', () => {
  for (const id of IDS) for (const line of prose(card(id))) {
    assert.doesNotMatch(line, /\b(I|me|my)\b|—|\$|healthier|safer|pesticide-free/, `${id}: ${line}`);
  }
});

test('t6-4: every avocado-oil mention explicitly says skip, with no recommendation', () => {
  for (const id of IDS) for (const line of prose(card(id)).filter((s) => /avocado oil/i.test(s))) {
    assert.match(line, /\bskip\b[^.!?]*avocado oil/i, `${id}: ${line}`);
    assert.doesNotMatch(line, /\b(?:choose|pick|use|buy|prefer|recommend|look for)\b[^.!?;]*\bavocado oil\b/i, `${id}: ${line}`);
  }
  assert.ok(card('label_cold_pressed_expeller').buying_tips.includes('Skip avocado oil regardless of the pressing words; its label cannot prove purity.'));
});

test('t6-4: every base skip/pass line survives, and overflow preserves every base tip and watch-out', () => {
  let skips = 0;
  for (const id of IDS) {
    const was = preT6_4(card(id));
    const text = prose(card(id)).join('\n');
    for (const line of nonEmpty([...strings(was.buying_tips), ...strings(was.watch_out)], `${id} base guidance`)) {
      if (/^(Skip|Pass on)\b/i.test(line)) { skips++; assert.ok(text.includes(line), `${id}: lost avoid ${line}`); }
      assert.ok([...avoidLines(card(id)), ...strings(card(id).buying_tips), ...strings(card(id).detail)].join('\n').includes(line), `${id}: lost guidance ${line}`);
    }
    assert.ok(card(id).watch_out.length <= 3, `${id}: watch-out cap`);
  }
  assert.ok(skips > 0, 'must exercise a base skip line');
});

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const ARCHIVES = nonEmpty(walk(join(ROOT, 'docs/sources')), 'source archive', 10).map((p) => readFileSync(p, 'utf8'));
test('t6-4: every source URL occurs verbatim in an archive; evidence header URLs are on the cards', () => {
  for (const id of IDS) {
    for (const url of nonEmpty(urls(card(id)), `${id} source URLs`)) assert.ok(ARCHIVES.some((s) => s.includes(url)), `${id}: ${url}`);
    const evidence = readFileSync(join(ROOT, 'docs/sources/concerns', EVIDENCE[id]), 'utf8');
    const url = evidence.match(/^url: (.+)$/m)?.[1];
    assert.ok(url, `${id}: evidence header URL missing`);
    assert.ok(urls(card(id)).includes(url), `${id}: missing evidence URL ${url}`);
    for (const source of preT6_4(card(id)).sources) assert.ok(card(id).sources.some((s) => JSON.stringify(s) === JSON.stringify(source)), `${id}: dropped source`);
  }
});

test('t6-4: new copy is label truth, with no health claims or repeated sentence on over two cards', () => {
  const seen = new Map();
  for (const id of IDS) for (const line of nonEmpty(fresh(id), `${id} new copy`)) {
    assert.doesNotMatch(line, /\b(?:healthier|safer|risk|treat\w*|prevent\w*|cure\w*|caus\w*|cancer|disease|toxic\w*|price|cheap\w*|pricier)\b/i, `${id}: ${line}`);
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      if (!seen.has(sentence)) seen.set(sentence, new Set());
      seen.get(sentence).add(id);
    }
  }
  for (const [sentence, ids] of seen) assert.ok(ids.size <= 2, `${[...ids]} repeat: ${sentence}`);
  for (const line of fresh('label_wild_vs_farm_raised')) assert.doesNotMatch(line, /PCB|dioxin|contamina|\bhealth\b|\d/i, line);
  for (const line of fresh('label_cold_pressed_expeller')) assert.doesNotMatch(line, /oxidation|inflamm|\bhealth\b/i, line);
});

const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
test('t6-4: all six live cards remain readable and lint-clean', () => {
  for (const id of IDS) {
    assert.deepEqual(readability(card(id)), [], `${id} readability`);
    assert.deepEqual(lintCard(projectEntry(card(id), { doLine: reviewed.get(id)?.do || '' })), [], `${id} lint`);
  }
});
