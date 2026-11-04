// Shop deck S2: seven entries carry an authored `deck` built from the S0 trace (docs/research/shop-deck-trace.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintDeck, lintCard } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

const IDS = ['aisle_produce', 'produce_brassicas', 'produce_peppers', 'aisle_meat_eggs', 'chicken', 'aisle_frozen', 'fam_frozen_produce'];
// Rows the trace excluded outright; none may reach any deck line.
const EXCLUDED = [/Product of/i, /Chicken, pork and eggs: organic/i, /glossy/i, /108 sq/i, /108 square/i];
const entry = (id) => kb.entries.find((e) => e.id === id);
const rows = (deck) => deck.blocks.flatMap((b) => b.rows);

test('exactly the seven named entries carry a deck', () => {
  assert.deepEqual(nonEmpty(kb.entries.filter((e) => e.deck), 'decked entries', 7).map((e) => e.id).sort(), [...IDS].sort());
});

test('every deck passes lintDeck, and card entries pass lintCard with no deck finding', () => {
  for (const id of IDS) {
    assert.deepEqual(lintDeck(entry(id)), [], `${id} deck lint`);
    if (!entry(id).kind) assert.deepEqual(lintCard(entry(id)).filter((f) => f.code.startsWith('DECK_')), [], `${id} lintCard deck`);
  }
});

test('no deck carries an excluded phrase, and the grab has no semicolon, em-dash or first person', () => {
  for (const id of IDS) {
    const text = JSON.stringify(entry(id).deck);
    for (const bad of EXCLUDED) assert.doesNotMatch(text, bad, `${id} deck matches ${bad}`);
    assert.doesNotMatch(entry(id).deck.grab, /;|—|\bI\b/, `${id} grab`);
  }
});

test('every deck row has a nonempty src', () => {
  for (const id of IDS) {
    for (const row of nonEmpty(rows(entry(id).deck), `${id} rows`, 4)) assert.ok(String(row.src || '').trim(), `${id}: ${row.lead} has no src`);
  }
});
