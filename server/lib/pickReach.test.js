// EVERY FOOD ROW ON THE 26 GETS GUIDANCE — A CARD OR A PICK — AND NOTHING ELSE DOES.
//
// The plan's D4 list (PLAN-step3-picklines.md) is the population a shopper actually writes,
// and it was measured at 19/26 carded with seven bare rows: carrots, broccoli, bell peppers,
// garlic, milk, canned tomatoes, frozen peas. The pick floor (Piece 2) exists to put one
// sentence on those rows; this test is the floor's reach, stated against the list rather than
// against a fixture. It was RED at Piece 2's tip (seven misses) and goes green when the corpus
// carries the picks — that is the prove-fail, recorded in the Piece 3 commit.
//
// Three properties, all through the REAL attach order (`attachCards`), never a re-implementation:
//   1. every food row → a card or a pick (no bare food row)
//   2. every non-food row → neither (Kristy carries anything and judges only food; her
//      silence there is the feature, and a pick on a non-food row is a false claim)
//   3. no pick steals a row a card owns — a pick alias landing on a carded row is the floor
//      running before the ceiling, and where the card's do line already works for that food
//      the pick is dead weight that will shadow it the day the card's alias slips

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from './testGuards.js';

import { attachCards, matchItemToCard } from './listMatch.js';
import { pickEntries } from './perimeter.js';
import { lintCard } from './counterCardLint.js';

// Verbatim from the plan (D4) and from `scripts/listMatchProbe.js` REALISTIC_26. The script
// runs at import, so it cannot export the list; a drift between the two is a test failure
// waiting to be noticed, and 26 is asserted below so a truncated copy cannot pass.
const REALISTIC_26 = nonEmpty([
  'apples', 'bananas', 'strawberries', 'carrots', 'broccoli', 'bell peppers', 'leafy greens',
  'spinach', 'lemons', 'garlic', 'onions', 'sweet potatoes', 'avocados', 'eggs', 'milk',
  'greek yogurt', 'butter', 'cheddar cheese', 'chicken thighs', 'ground beef', 'salmon',
  'brown rice', 'oats', 'olive oil', 'canned tomatoes', 'frozen peas',
], 'REALISTIC_26', 26);

// The household rows a real list carries (COUNTER-BACKLOG.md, the list table). None is food.
const NON_FOOD = nonEmpty([
  'dish soap', 'aluminum foil', 'paper towels', 'toilet paper', 'bleach', 'dog food',
  'trash bags', 'sponges',
], 'NON_FOOD', 5);

// Compound rows that CARRY a pick's bare noun and are a different food. Containment alone
// attached every one of these ("oat milk" got the milk pick, whose line is about a carton
// that may hold raw milk); the floor now requires the row's words — head noun included — to
// all sit in one alias of the pick. Expected bare: no card, no pick. A card landing here
// would be its own defect (the card's alias, not the floor's), and the row must stay bare
// for this list to keep meaning what it says.
const COMPOUND_ROWS = nonEmpty([
  'oat milk', 'coconut milk', 'milk chocolate', 'corn tortillas', 'corn chips', 'corn flakes',
  'garlic powder', 'garlic bread', 'lemon juice', 'juice boxes', 'carrot cake', 'basil pesto',
  'eggplant parm', 'broccoli slaw',
], 'COMPOUND_ROWS', 14);

const attach = (name) => attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];

test('REALISTIC_26 is the list, 26 rows, no duplicates', () => {
  assert.equal(REALISTIC_26.length, 26);
  assert.equal(new Set(REALISTIC_26).size, 26);
});

test('every food row on the 26 attaches a card or a pick', () => {
  const bare = REALISTIC_26.filter((name) => {
    const row = attach(name);
    return !row.cardSlug && !row.pickId;
  });
  assert.deepEqual(bare, [], `food rows with neither a card nor a pick: ${bare.join(', ')}`);
});

test('a row that got a pick got a pick LINE, and the line is the entry’s own', () => {
  const picks = REALISTIC_26.map(attach).filter((r) => r.pickId);
  nonEmpty(picks, 'rows attached by a pick');
  const byId = new Map(pickEntries().map((e) => [e.id, e]));
  for (const r of picks) {
    assert.ok(byId.has(r.pickId), `${r.name}: pickId ${r.pickId} is not a pick in the KB`);
    assert.equal(r.pickLine, byId.get(r.pickId).decision, `${r.name}: the line on the row is not the entry’s decision`);
    assert.equal(r.cardSlug, undefined, `${r.name}: a pick beside a card — the floor ran before the ceiling`);
  }
});

test('every non-food row attaches neither a card nor a pick', () => {
  const judged = NON_FOOD.filter((name) => {
    const row = attach(name);
    return row.cardSlug || row.pickId;
  });
  assert.deepEqual(judged, [], `non-food rows Kristy spoke on: ${judged.join(', ')}`);
});

test('no pick alias lands on a row a card already owns', () => {
  // A pick's aliases are what a shopper types. Typed on a list, each must resolve to the
  // pick, never to a card: a card winning is fine for the ROW (cards first), but it means
  // the pick was authored for a food the corpus already guides, and its alias will shadow
  // the card the day the card's own alias slips.
  const picks = nonEmpty(pickEntries(), 'perimeterKb picks');
  const stolen = [];
  for (const e of picks) {
    for (const a of e.aliases || []) {
      const card = matchItemToCard(a);
      if (card) stolen.push(`${e.id}: "${a}" → ${card.slug}`);
    }
  }
  assert.deepEqual(stolen, [], `pick aliases a card already owns:\n  ${stolen.join('\n  ')}`);
});

test('a compound row carrying a pick’s bare noun attaches nothing', () => {
  const attached = COMPOUND_ROWS.filter((name) => {
    const row = attach(name);
    return row.cardSlug || row.pickId;
  }).map((name) => { const r = attach(name); return `${name} → ${r.cardSlug || r.pickId}`; });
  assert.deepEqual(attached, [], `compound rows Kristy spoke on: ${attached.join(', ')}`);
});

test('a state or a count in front of a pick’s own noun still lands', () => {
  // The coverage rule must not eat the rows the picks were authored for.
  for (const [name, id] of [['2 carrots', 'pick_carrots'], ['baby carrots', 'pick_carrots'], ['frozen peas', 'pick_frozen_peas']]) {
    assert.equal(attach(name).pickId, id, name);
  }
});

test('every pick in the corpus passes the lint', () => {
  for (const p of nonEmpty(pickEntries(), 'picks')) assert.deepEqual(lintCard(p), [], p.id);
});
