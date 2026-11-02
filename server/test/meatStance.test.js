// Meat stance 2026-11-02: the cut-led meat cards rewritten to the chicken stance (chickenUnify.test.js).
// A broad meat card says how the animal lived, what it ate and what is not added, in words printed on
// the pack; it never recommends a cut. beef_cuts_basics folded into Beef. Historical batch tests read
// these cards as of cd4c011 (twoLinePin.js unfoldMeat); this file owns the live copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { nonEmpty } from '../lib/testGuards.js';
import { RETIRED, projectEntry } from '../lib/counterCards.js';
import { lintCard, readability, lintPickSteps, lintRepeatedClaim } from '../lib/counterCardLint.js';
import { scoreEntries } from '../lib/perimeter.js';
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../lib/doLines.json' with { type: 'json' };

const ARCHIVE = new URL('../../archive/', import.meta.url).pathname;
const LIVE = ['beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_veal', 'pork_cuts_and_enhanced', 'cured_pork', 'bacon', 'turkey_whole', 'ground_turkey', 'turkey_bacon', 'lamb_goat'];
// Broad items: the whole animal's meat, so no cut on the lines a shopper reads first.
const BROAD = ['beef_grassfed_vs_grainfed', 'beef_veal', 'pork_cuts_and_enhanced', 'lamb_goat'];
const CUTS = /\b(steaks?|chuck|round|loin|tenderloin|sirloin|ribeye|ribs?|brisket|shoulder|belly|chops?|leg|shank|breasts?|thighs?|cutlets?|roasts?)\b/i;
const card = (id) => kb.entries.find((e) => e.id === id);

test('broad meat cards name no cut in decision, cart pick or take', () => {
  for (const id of nonEmpty(BROAD, 'broad meat cards', 4)) {
    const e = card(id);
    assert.ok(e, `${id} missing`);
    for (const f of ['decision', 'cart_pick', 'kristy_take']) {
      assert.ok(e[f], `${id}.${f} empty`);
      assert.doesNotMatch(e[f], CUTS, `${id}.${f} names a cut: ${e[f]}`);
    }
  }
});

test('rewritten meat cards lint clean live, with no "seal" jargon on the front', () => {
  for (const id of nonEmpty(LIVE, 'rewritten meat cards', 10)) {
    const e = card(id);
    assert.ok(e, `${id} missing`);
    assert.ok(doLines[id], `${id} has no do line`);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(readability(e), [], `${id} readability`);
    assert.deepEqual(lintPickSteps(e), [], `${id} lintPickSteps`);
    assert.deepEqual(lintRepeatedClaim(e), [], `${id} lintRepeatedClaim`);
    for (const v of [e.decision, e.cart_pick, e.buying_tips?.[0], doLines[id]].filter(Boolean)) assert.doesNotMatch(v, /\bseals?\b/i, `${id}: ${v}`);
  }
});

test('label terms that decode the healthiest rung stay on the card', () => {
  const terms = (id) => card(id).labels_decoded.map((l) => l.term);
  for (const [id, want] of [
    ['beef_grassfed_vs_grainfed', ['100% grass-fed, grass-finished', 'Grass-fed', 'Grain-fed / grain-finished']],
    ['pork_cuts_and_enhanced', ['Enhanced / contains up to X% solution', 'Natural']],
    ['turkey_whole', ['Basted or self-basted']],
    ['bacon', ['No nitrates added*']],
    ['beef_veal', ['Rose veal', 'Milk-fed or white veal']],
  ]) for (const t of want) assert.ok(terms(id).includes(t), `${id} lost label term "${t}"`);
});

test('beef_cuts_basics is folded into Beef; steak and stew asks land there', () => {
  assert.ok(RETIRED.includes('beef_cuts_basics'));
  assert.ok(!card('beef_cuts_basics'));
  assert.equal(card('pork_cuts_and_enhanced').title, 'Pork');
  for (const q of ['steak', 'stew meat', 'which cut for stew']) assert.equal(scoreEntries(q, 3)[0]?.entry.id, 'beef_grassfed_vs_grainfed', q);
});

test('every rewritten meat card source URL appears verbatim in archive/', () => {
  const files = readdirSync(ARCHIVE, { recursive: true }).filter((f) => /\.(md|txt|json|html)$/.test(f));
  const corpus = nonEmpty(files, 'archive files', 10).map((f) => readFileSync(join(ARCHIVE, f), 'utf8')).join('\n');
  for (const id of LIVE) {
    for (const u of nonEmpty(card(id).sources.filter((s) => s?.url).map((s) => s.url), `${id} source urls`, 1)) assert.ok(corpus.includes(u), `${id}: source URL not in archive: ${u}`);
  }
});
