// Chicken fold 2026-11-01: one cut-neutral `chicken` card replaces chicken_cuts_basics,
// chicken_breast and poultry_chicken_wings. Cut words live only in aliases: the card says
// how to choose the bird, never which part to buy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { nonEmpty } from '../lib/testGuards.js';
import { RETIRED } from '../lib/counterCards.js';
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };

const ARCHIVE = new URL('../../archive/', import.meta.url).pathname;
// Broad livestock cards: no cut-led line on the surface a shopper reads. Add a card here once it is unified.
const BROAD = ['chicken'];
const CUTS = /\b(breasts?|thighs?|wings?|drumsticks?|whole chicken|bone-in|boneless|skinless)\b/i;
const card = (id) => kb.entries.find((e) => e.id === id);

test('broad livestock cards name no cut in the shopper-facing lines', () => {
  for (const id of nonEmpty(BROAD, 'broad livestock cards', 1)) {
    const e = card(id);
    assert.ok(e, `${id} missing`);
    const lines = { decision: e.decision, cart_pick: e.cart_pick, kristy_take: e.kristy_take, tip0: e.buying_tips?.[0], tip1: e.buying_tips?.[1] };
    for (const [f, v] of Object.entries(lines)) {
      assert.ok(v, `${id}.${f} empty`);
      assert.doesNotMatch(v, CUTS, `${id}.${f} names a cut: ${v}`);
    }
  }
});

test('the three cut-led chicken cards are folded; cuts still reach the card by alias', () => {
  for (const id of ['chicken_cuts_basics', 'chicken_breast', 'poultry_chicken_wings']) {
    assert.ok(RETIRED.includes(id), `${id} not RETIRED`);
    assert.ok(!card(id), `${id} still in the KB`);
  }
  for (const id of ['rotisserie_chicken', 'turkey_whole', 'ground_turkey']) assert.ok(card(id), `${id} must stay its own card`);
  const aliases = nonEmpty(card('chicken').aliases, 'chicken aliases', 6);
  for (const a of ['chicken breast', 'chicken thighs', 'chicken wings', 'whole chicken']) assert.ok(aliases.includes(a), `alias "${a}" missing`);
});

test('chicken copy: no forbidden phrasing anywhere on the card', () => {
  const text = JSON.stringify(card('chicken'));
  for (const bad of [/soy[- ]free/i, /108 square feet/i, /step up/i, /\boptional\b/i, /organic is/i, /either is fine/i, /\$\d/, /\b(treats|prevents|cures)\b/i]) {
    assert.doesNotMatch(text, bad, `chicken card matches ${bad}`);
  }
  const shopper = JSON.stringify({ ...card('chicken'), sources: undefined, aliases: undefined, asked_as: undefined });
  assert.doesNotMatch(shopper, /\bCFR\b|\bFSIS\b/, 'regulation strings in shopper fields');
  // `question` is the shopper's own words ("Which chicken should I buy?"); the voice rule binds the answer.
  assert.doesNotMatch(JSON.stringify({ ...JSON.parse(shopper), question: undefined }), /\b(I|me|my)\b|—/, 'first person or em dash in the answer');
});

test('every chicken source URL appears verbatim in archive/', () => {
  const files = readdirSync(ARCHIVE, { recursive: true }).filter((f) => /\.(md|txt|json|html)$/.test(f));
  const corpus = nonEmpty(files, 'archive files', 10).map((f) => readFileSync(join(ARCHIVE, f), 'utf8')).join('\n');
  const urls = nonEmpty(card('chicken').sources.filter((s) => s?.url).map((s) => s.url), 'chicken source urls', 3);
  for (const u of urls) assert.ok(corpus.includes(u), `source URL not in archive: ${u}`);
});
