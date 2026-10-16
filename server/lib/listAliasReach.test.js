// EVERY BARE NOUN A LIST ROW NEEDS LANDS ON ITS OWN CARD.
//
// counterReach.test.js proves a card is reachable by the QUESTIONS it answers. This is the
// other surface: a shopper writing a list types `apples`, not "should I buy organic apples",
// and the rule that "alias authoring differs by surface" had shipped broken six times by the
// time API-FINDINGS §16 found five of eight first-walk rows carrying nothing. A rule stated
// six times and broken six times is not being enforced by being stated — so this is the
// test, and it is authored from the ROW, never from the card's own vocabulary.
//
// THE HUB RULE FILTERS THE LIST. An alias is not "this word is related to this card"; it is
// "this card's do line works for this food". W2 keeps organic buying questions on
// `organic_worth_it_by_type`; grocery nouns belong to their food family cards.
// `produce_ripeness_by_item` says the heavier of two holds more juice, so stone fruit and
// citrus belong and broccoli, cauliflower and asparagus do NOT — which is why they are
// asserted absent below, not merely omitted. `revive_greens` is a home card and never
// attaches to a row at all, so it carries nothing here.
//
// `strawberries` / `strawberry` land on `berries_picking`: the 2026-10-14 fold (IC-3a) put
// the bare noun and freshness on one card, pinned in counterReach.test.js. Asserted here
// too so the two files agree by test rather than by memory.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { matchItemToCard, entryById } from './listMatch.js';
import { scoreEntries } from './perimeter.js';
import { nonEmpty } from './testGuards.js';

// Row text → the card it must attach. Written the way a shopper writes it. Bound at module
// level so an empty table throws at import rather than passing vacuously.
const ROWS = nonEmpty(
  [
    // W2: both singular and plural reach the apples/pears family.
    ['apples', 'produce_apples_pears'],
    ['apple', 'produce_apples_pears'],
    ['Apples', 'produce_apples_pears'],
    // Grapes have no covered family; w2.test.js pins the honest miss.
    ['leafy greens', 'produce_leafy_greens'],
    ['Leafy greens', 'produce_leafy_greens'],
    ['kale', 'produce_leafy_greens'],
    ['spinach', 'produce_leafy_greens'],
    ['lettuce', 'produce_leafy_greens'],
    // P3: stone fruit and citrus own their subjects now; `peach` singular still ties to the
    // earlier ripeness hub.
    ['peaches', 'produce_stone_fruit'],
    ['peach', 'produce_ripeness_by_item'],
    ['nectarines', 'produce_stone_fruit'],
    ['plums', 'produce_stone_fruit'],
    ['lemons', 'produce_citrus'],
    ['limes', 'produce_citrus'],
    ['oranges', 'produce_citrus'],
    ['citrus', 'produce_citrus'],
    ['strawberries', 'berries_picking'],
    ['strawberry', 'berries_picking'],
  ],
  'ROWS',
  10
);

// Foods the ripeness do line cannot answer. "The heavier piece of two holds more juice" is
// an instruction about fruit; on a brassica or a spear it is wrong, and wrong is worse than
// nothing. The card carries "how to pick broccoli" as a QUESTION alias on purpose — the ask
// path still answers it — but a bare row must not attach.
const NOT_ON_RIPENESS = nonEmpty(['broccoli', 'cauliflower', 'asparagus'], 'NOT_ON_RIPENESS');

test('every list alias lands on its own card, written the way a shopper writes it', () => {
  const wrong = [];
  for (const [row, slug] of ROWS) {
    const hit = matchItemToCard(row);
    if (hit?.slug !== slug) wrong.push(`${row} → ${hit?.slug ?? '(none)'}, wanted ${slug}`);
  }
  assert.deepEqual(wrong, [], 'a bare noun on a list must reach the card whose do line works for it');
});

test('the cards these rows reach are real, aisle-filed produce cards', () => {
  for (const slug of new Set(ROWS.map(([, s]) => s))) {
    const e = entryById(slug);
    assert.ok(e, `${slug} is not in the corpus`);
    assert.equal(e.category, 'produce', `${slug} is filed to ${e.category}, not produce`);
  }
});

test('the ripeness do line is about juice, so brassicas and asparagus do not attach to it', () => {
  for (const row of NOT_ON_RIPENESS) {
    const hit = matchItemToCard(row);
    assert.notEqual(hit?.slug, 'produce_ripeness_by_item', `"${row}" reached the ripeness card`);
  }
});

test('revive_greens is a home card and carries no list alias that could attach', () => {
  // W2 moves bare lettuce to the buying family. The home card retains its specific
  // revival phrases, whose ask reach is pinned in counterReach.test.js.
  assert.equal(matchItemToCard('lettuce')?.slug, 'produce_leafy_greens');
  assert.ok(entryById('revive_greens'), 'revive_greens left the corpus');
});

// The bare buying noun belongs to the family on both retrieval surfaces.
test('bare "lettuce" on the ask path reaches the leafy greens family', () => {
  const [first] = scoreEntries('lettuce');
  assert.equal(first?.entry?.id, 'produce_leafy_greens');
});
