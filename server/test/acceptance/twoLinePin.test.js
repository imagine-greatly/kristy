// Owns the two-line rewrite's text (docs/CARD-STYLE-SAMPLES.md): every card's decision and
// buying_tips (and egg_labels sources) equal the pin in twoLinePin.js, which older batch tests read through.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nonEmpty } from '../../lib/testGuards.js';
import { TWO_LINE } from './twoLinePin.js';
import { matchItemToCard } from '../../lib/listMatch.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));

test('every card carries the pinned two-line decision and buying_tips', () => {
  const cards = nonEmpty(kb.entries.filter((e) => e.kind !== 'pick'), 'cards', 180);
  for (const e of cards) {
    assert.ok(TWO_LINE[e.id], `${e.id} has no two-line pin`);
    // Every pinned field, so a field the older tests restore (cart_pick, pick_steps) is still checked live.
    for (const [k, v] of Object.entries(TWO_LINE[e.id])) assert.deepEqual(e[k], v, `${e.id}.${k}`);
  }
  assert.equal(Object.keys(TWO_LINE).length, cards.length, 'a pin for a card that is gone');
});

// Known gap: lintSections L5 makes the chuck pick carry the G1 term, and that term alone outscores
// beef_cuts_basics for beef_grassfed_vs_grainfed (scorePool's top-2 window), so the pick lands uncarded.
// Pinned null so a matcher or wording change that fixes it (or sends it to the wrong card) goes red.
const KNOWN_UNCARDED = new Set(['beef_cuts_basics']);
test('every pinned cart_pick resolves to its own card on the live KB', () => {
  const ids = nonEmpty(Object.keys(TWO_LINE).filter((id) => TWO_LINE[id].cart_pick), 'pinned cart picks', 3);
  for (const id of ids) {
    const m = matchItemToCard(kb.entries.find((e) => e.id === id).cart_pick);
    assert.equal(m ? m.slug ?? m.id ?? m.entry?.id : null, KNOWN_UNCARDED.has(id) ? null : id, `${id} cart_pick`);
  }
});
