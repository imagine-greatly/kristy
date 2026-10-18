// Owns the two-line rewrite's text (docs/CARD-STYLE-SAMPLES.md): every card's decision and
// buying_tips (and egg_labels sources) equal the pin in twoLinePin.js, which older batch tests read through.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nonEmpty } from '../../lib/testGuards.js';
import { TWO_LINE } from './twoLinePin.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));

test('every card carries the pinned two-line decision and buying_tips', () => {
  const cards = nonEmpty(kb.entries.filter((e) => e.kind !== 'pick'), 'cards', 180);
  for (const e of cards) {
    assert.ok(TWO_LINE[e.id], `${e.id} has no two-line pin`);
    assert.equal(e.decision, TWO_LINE[e.id].decision, `${e.id}.decision`);
    assert.deepEqual(e.buying_tips, TWO_LINE[e.id].buying_tips, `${e.id}.buying_tips`);
    if (TWO_LINE[e.id].sources) assert.deepEqual(e.sources, TWO_LINE[e.id].sources, `${e.id}.sources`);
  }
  assert.equal(Object.keys(TWO_LINE).length, cards.length, 'a pin for a card that is gone');
});
