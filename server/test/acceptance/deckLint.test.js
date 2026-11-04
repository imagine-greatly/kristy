import test from 'node:test';
import assert from 'node:assert/strict';
import { lintDeck, lintAisle, DECK_LABELS, DECK_MARKS } from '../../lib/counterCardLint.js';

const SRC = 'https://extension.example.edu/peppers';
const AISLE_SRC = 'https://extension.example.edu/produce';
const goodDeck = () => ({
  grab: 'Firm, heavy peppers with tight skin and a green stem.',
  blocks: [
    { label: 'Look for', rows: [{ mark: 'yes', lead: 'Firm walls and a fresh green stem.', sub: 'Skip peppers with soft spots or wrinkles.', src: SRC }] },
    { label: 'Watch for', rows: [{ mark: 'no', lead: 'Wrinkled or soft skin.', src: SRC }] },
  ],
});
const card = (deck) => ({ id: 'produce_peppers', title: 'Bell peppers', sources: [{ name: 'Extension', url: SRC }], deck });
const aisle = (deck) => ({
  id: 'aisle_produce', kind: 'aisle', title: 'Produce', category: 'aisle_produce',
  decision: 'Firm, heavy produce with no soft spots.',
  buying_tips: ['Pick firm produce.', 'Check the stem end.', 'Skip bruised fruit.'],
  deck,
});
const codes = (entry) => lintDeck(entry).map((f) => f.code);

test('C1 a well-formed deck lints clean', () => {
  assert.deepEqual(lintDeck(card(goodDeck())), []);
});

test('C2 a deck missing its grab, its blocks or a row lead fails DECK_SHAPE', () => {
  const noGrab = goodDeck(); delete noGrab.grab;
  const noBlocks = { ...goodDeck(), blocks: [] };
  const noLead = goodDeck(); delete noLead.blocks[0].rows[0].lead;
  for (const deck of [noGrab, noBlocks, noLead]) assert.ok(codes(card(deck)).includes('DECK_SHAPE'));
});

test('C3 an unknown block label or row mark fails', () => {
  assert.ok(DECK_LABELS.includes('Look for') && DECK_LABELS.includes('Can’t find it?'));
  assert.deepEqual([...DECK_MARKS].sort(), ['no', 'note', 'yes']);
  const badLabel = goodDeck(); badLabel.blocks[0].label = 'Our picks';
  const badMark = goodDeck(); badMark.blocks[0].rows[0].mark = 'maybe';
  assert.ok(codes(card(badLabel)).includes('DECK_LABEL'));
  assert.ok(codes(card(badMark)).includes('DECK_MARK'));
});

test('C4 first person, em-dash asides and straight quotes fail on any deck line', () => {
  const fp = goodDeck(); fp.blocks[0].rows[0].lead = 'We pick firm peppers.';
  const dash = goodDeck(); dash.blocks[0].rows[0].sub = 'Firm walls — never soft.';
  const quote = goodDeck(); quote.grab = "Peppers that don't bend.";
  assert.ok(codes(card(fp)).includes('DECK_FIRST_PERSON'));
  assert.ok(codes(card(dash)).includes('DECK_EM_DASH'));
  assert.ok(codes(card(quote)).includes('DECK_STRAIGHT_QUOTE'));
});

test('C5 price talk fails DECK_PRICE', () => {
  const price = goodDeck(); price.blocks[0].rows[0].sub = 'Cheaper by the bag.';
  assert.ok(codes(card(price)).includes('DECK_PRICE'));
});

test('C6 a row source must resolve to the entry or deck sources', () => {
  const stray = goodDeck(); stray.blocks[0].rows[0].src = 'https://elsewhere.example.com/x';
  const missing = goodDeck(); delete missing.blocks[0].rows[0].src;
  assert.ok(codes(card(stray)).includes('DECK_SOURCE_UNRESOLVED'));
  assert.ok(codes(card(missing)).includes('DECK_SOURCE_UNRESOLVED'));
  const aisleDeck = goodDeck();
  for (const b of aisleDeck.blocks) for (const r of b.rows) r.src = AISLE_SRC;
  aisleDeck.sources = [{ name: 'Extension', url: AISLE_SRC }];
  assert.deepEqual(lintDeck(aisle(aisleDeck)), []);
  delete aisleDeck.sources;
  assert.ok(codes(aisle(aisleDeck)).includes('DECK_SOURCE_UNRESOLVED'));
});

test('C7 an over-long grab fails DECK_TOO_LONG', () => {
  const long = goodDeck(); long.grab = `${'Firm '.repeat(40).trim()}.`;
  assert.ok(codes(card(long)).includes('DECK_TOO_LONG'));
});

test('C8 lintAisle carries deck findings and an entry with no deck adds none', () => {
  const bad = goodDeck(); bad.blocks[0].label = 'Our picks';
  assert.ok(lintAisle(aisle(bad)).some((f) => f.code === 'DECK_LABEL'));
  assert.ok(!lintAisle(aisle(undefined)).some((f) => f.code.startsWith('DECK_')));
});
