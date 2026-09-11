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
// "this card's do line works for this food". `organic_worth_it_by_type` says organic where
// the skin gets eaten, so apples and greens belong and a peeled thing does not.
// `produce_ripeness_by_item` says the heavier of two holds more juice, so stone fruit and
// citrus belong and broccoli, cauliflower and asparagus do NOT — which is why they are
// asserted absent below, not merely omitted. `revive_greens` is a home card and never
// attaches to a row at all, so it carries nothing here.
//
// `strawberries` / `strawberry` are deliberately NOT on `berries_picking`: the 2026-08-18
// ruling pinned in counterReach.test.js sends the bare noun to `strawberries_organic_residue`
// and that is the card a row reaches. Asserted here too so the two files agree by test
// rather than by memory.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { matchItemToCard, entryById } from './listMatch.js';
import { scoreEntries } from './perimeter.js';
import { nonEmpty } from './testGuards.js';

// Row text → the card it must attach. Written the way a shopper writes it. Bound at module
// level so an empty table throws at import rather than passing vacuously.
const ROWS = nonEmpty(
  [
    ['apples', 'organic_worth_it_by_type'],
    ['apple', 'organic_worth_it_by_type'],
    ['Apples', 'organic_worth_it_by_type'],
    ['grapes', 'organic_worth_it_by_type'],
    ['leafy greens', 'organic_worth_it_by_type'],
    ['Leafy greens', 'organic_worth_it_by_type'],
    ['kale', 'organic_worth_it_by_type'],
    ['spinach', 'organic_worth_it_by_type'],
    ['lettuce', 'organic_worth_it_by_type'],
    ['peaches', 'produce_ripeness_by_item'],
    ['peach', 'produce_ripeness_by_item'],
    ['nectarines', 'produce_ripeness_by_item'],
    ['plums', 'produce_ripeness_by_item'],
    ['lemons', 'produce_ripeness_by_item'],
    ['limes', 'produce_ripeness_by_item'],
    ['oranges', 'produce_ripeness_by_item'],
    ['citrus', 'produce_ripeness_by_item'],
    ['strawberries', 'strawberries_organic_residue'],
    ['strawberry', 'strawberries_organic_residue'],
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
  // `lettuce` is on both cards. The home card is skipped by the matcher, so the row lands
  // on the organic card; the ask path still reaches revive_greens on its question aliases
  // (counterReach.test.js). Pinned so the two surfaces stay split deliberately.
  assert.equal(matchItemToCard('lettuce')?.slug, 'organic_worth_it_by_type');
  assert.ok(entryById('revive_greens'), 'revive_greens left the corpus');
});

// THE ASK PATH TIES ON `lettuce`, AND THE TIE IS DECIDED BY CORPUS ORDER. Both
// `organic_worth_it_by_type` and `revive_greens` carry the exact alias, both score 2, and
// `scoreEntries` sorts by score alone — stable — so the organic card wins because it sits
// earlier in the KB. That is the right answer (a counter question is a buying question, and
// revive is a home card) but nothing else records it: counterReach only asks revive's longer
// phrasings. A KB reorder would flip it silently, so it is pinned here, the way
// counterReach.test.js pins the "fresh strawberries" tie by name.
test('bare "lettuce" on the ask path reaches the organic card, not the home card', () => {
  const [first] = scoreEntries('lettuce');
  assert.equal(first?.entry?.id, 'organic_worth_it_by_type');
});
