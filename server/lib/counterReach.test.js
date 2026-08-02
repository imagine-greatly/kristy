// EVERY CARD MUST BE REACHABLE BY THE QUESTIONS IT EXISTS TO ANSWER.
//
// This is the check that was missing, and its absence cost four duplicate cards. A curated
// card that exists, is correct, and cannot be retrieved is worse than no card: the shopper
// gets a generated near-copy, the corpus forks, and the bill arrives every time it is asked.
//
//   gen_picking_a_ripe_cantaloupe   `produce_ripeness_by_item` scored 3 against a `> 3` gate
//   gen_strawberry_freshness_check  `berries_picking` had no bare `strawberries`
//   gen_limp_lettuce_revival        `revive_greens` had no bare `lettuce`, `limp`, `wilted`
//   gen_picking_good_produce        the origin card and the hub both matched, neither won
//
// THE PHRASINGS LIVE ON THE CARD, in `asked_as`, not in a fixture here. A fixture is a
// second list that drifts from the first; on the entry, the phrasings are edited by whoever
// edits the card and reviewed in the same diff.
//
// AUTHOR THEM FROM THE QUESTION, NOT THE CARD'S OWN VOCABULARY. That is the entire defect
// this catches. `revive_greens` carried "limp lettuce" and "wilted lettuce" and a shopper
// typed "my lettuce went limp" — same words, different order, zero score. Write what someone
// would type before they have read anything: "my lettuce went limp", never "wilted greens
// revival".
//
// Run over the whole corpus on 2026-08-02 for the first time, this failed 75 of 243
// phrasings across 42 of 81 cards — so it was never a new-card problem. The largest block
// was the scope gate refusing label questions ("does no antibiotics mean anything"), which
// is why `isMeaningQuestion` exists.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from './testGuards.js';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { scoreEntries } from './perimeter.js';
import { inScope } from './counterScope.js';
import { projectEntry } from './counterCards.js';

const MIN_PHRASINGS = 3;
const entries = nonEmpty(perimeterKb.entries || [], 'perimeterKb.entries');

// The real gate, restated: `counterAskPipeline` admits on a score at or above the floor
// AND at least one alias hit. A phrasing that only clears one of those does not reach a
// shopper, so it does not count as reachable here either.
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);

test('every card carries at least three authored question phrasings', () => {
  const missing = entries.filter((e) => !Array.isArray(e.asked_as) || e.asked_as.length < MIN_PHRASINGS);
  assert.deepEqual(
    missing.map((e) => `${e.id} (${e.asked_as?.length ?? 0})`),
    [],
    `every entry needs ${MIN_PHRASINGS}+ realistic phrasings in asked_as — a new card is not done until it can be found`
  );
});

test('a phrasing is a question someone would TYPE, not the card restating itself', () => {
  for (const e of entries) {
    for (const q of e.asked_as || []) {
      assert.equal(q, q.toLowerCase(), `${e.id}: "${q}" — phrasings are typed, so lowercase`);
      assert.ok(q.trim().split(/\s+/).length >= 2, `${e.id}: "${q}" is one word, which tests the alias and not the question`);
      // The title is the card's own vocabulary. A phrasing copied from it proves nothing:
      // the alias was almost certainly written from the same words.
      assert.notEqual(
        q.replace(/[^a-z0-9]/g, ''),
        String(e.title || '').toLowerCase().replace(/[^a-z0-9]/g, ''),
        `${e.id}: "${q}" is just the title — author from the QUESTION a shopper asks`
      );
    }
  }
});

test('EVERY authored phrasing is in scope', () => {
  const refused = [];
  for (const e of entries) {
    for (const q of e.asked_as || []) {
      const s = inScope(q);
      if (!s.ok) refused.push(`${e.id}: "${q}" → ${s.reason}`);
    }
  }
  assert.deepEqual(refused, [], 'the scope gate is refusing questions the corpus answers');
});

test('EVERY authored phrasing retrieves ITS OWN card, through the real gate', () => {
  const failures = [];
  for (const e of entries) {
    for (const q of e.asked_as || []) {
      if (!inScope(q).ok) continue; // reported by the test above
      const scored = scoreEntries(q, 3);
      const top = scored[0];
      if (!admits(top)) {
        failures.push(
          `${e.id}: "${q}" → ${top ? `${top.entry.id} scored ${top.score} on title words alone` : 'nothing matched'}`
        );
        continue;
      }
      if (top.entry.id !== e.id) {
        const self = scored.find((s) => s.entry.id === e.id)?.score ?? 0;
        failures.push(`${e.id}: "${q}" → ${top.entry.id} @${top.score}, self @${self}`);
      }
    }
  }
  assert.deepEqual(
    failures,
    [],
    'a card that cannot be retrieved by its own question regenerates as a duplicate. '
      + 'Add the phrase to the card\'s aliases — longer phrases outrank a hub, so be specific rather than numerous'
  );
});

test('asked_as never reaches the model or the row', () => {
  // It is authoring metadata. The claim lock passes seven whitelisted fields and this is
  // not one of them; `projectEntry` does not carry it, so no column is needed either.
  // Both are true by omission today, which is exactly the kind of thing that stops being
  // true silently.
  const card = projectEntry(entries[0], { doLine: 'Read the panel.' });
  assert.equal(card.asked_as, undefined, 'asked_as must not be projected onto the card');
  assert.equal('asked_as' in card, false, 'asked_as must not appear as a key at all');
});
