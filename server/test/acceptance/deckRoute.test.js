// S3: GET /api/counter/deck serves every KB deck, free, in the shape iOS DeckEntry decodes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { counterRouter } from '../../routes/counter.js';
import { perimeterKb, aisleEntries, publicAisle } from '../../lib/perimeter.js';
import { nonEmpty } from '../../lib/testGuards.js';

const DECK_IDS = ['chicken', 'produce_brassicas', 'produce_peppers', 'aisle_meat_eggs', 'aisle_frozen', 'aisle_produce', 'fam_frozen_produce'];
const KB_DECKS = nonEmpty(perimeterKb.entries.filter((e) => e.deck), 'KB entries with a deck', 7);
const LEAKS = ['why', 'buying_tips', 'sources', 'detail', 'kristy_take', 'watch_out', 'science', 'decision'];

function get(url, headers = {}) {
  const req = { method: 'GET', url, headers, query: {}, ip: 'deck-test' };
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(body) { resolve({ status: this.statusCode, body }); },
    };
    counterRouter.handle(req, res, (err) => reject(err || new Error(`No GET route for ${url}`)));
  });
}

test('the deck route returns the seven KB decks, keyed by entry id, with no auth', async () => {
  const { status, body } = await get('/counter/deck');
  assert.equal(status, 200);
  const ids = Object.keys(body.decks);
  assert.deepEqual([...ids].sort(), [...DECK_IDS].sort());
  assert.deepEqual(ids, KB_DECKS.map((e) => e.id), 'KB order');
});

test('each deck carries every key iOS DeckEntry requires and round-trips the KB deck', async () => {
  const { body } = await get('/counter/deck');
  const decks = nonEmpty(Object.entries(body.decks), 'served decks', 7);
  for (const [id, deck] of JSON.parse(JSON.stringify(decks))) {
    const kb = KB_DECKS.find((e) => e.id === id).deck;
    assert.equal(deck.id, id, `${id}: id inside the deck`);
    assert.equal(typeof deck.grab, 'string');
    assert.equal(deck.grab, kb.grab);
    nonEmpty(deck.blocks, `${id} blocks`);
    assert.equal(deck.blocks.length, kb.blocks.length);
    deck.blocks.forEach((block, i) => {
      assert.equal(typeof block.label, 'string', `${id}: block label`);
      nonEmpty(block.rows, `${id} block ${i} rows`);
      block.rows.forEach((row, j) => {
        assert.equal(typeof row.lead, 'string', `${id}: row lead`);
        assert.ok(['yes', 'no', 'note'].includes(row.mark), `${id}: row mark ${row.mark}`);
        assert.deepEqual(row, kb.blocks[i].rows[j], `${id}: row ${i}.${j}`);
      });
    });
    for (const key of LEAKS) assert.ok(!Object.hasOwn(deck, key), `${id}: leaks ${key}`);
  }
});

test('decks name their aisle and the cards they cover', async () => {
  const { body } = await get('/counter/deck');
  assert.equal(body.decks.chicken.aisle, 'aisle_meat_eggs');
  assert.equal(body.decks.chicken.kind, 'card');
  assert.deepEqual(body.decks.chicken.cards, ['chicken']);
  assert.equal(body.decks.aisle_produce.aisle, 'aisle_produce');
  assert.equal(body.decks.aisle_produce.kind, 'aisle');
  const fam = body.decks.fam_frozen_produce;
  assert.equal(fam.kind, 'family');
  assert.equal(fam.aisle, 'aisle_frozen');
  nonEmpty(fam.cards, 'fam_frozen_produce member cards');
  for (const deck of Object.values(body.decks)) assert.equal(typeof deck.title, 'string');
});

test('the aisles route output is unchanged', async () => {
  const { body } = await get('/counter/aisles');
  const aisles = nonEmpty(body.aisles, 'aisles', 12);
  assert.deepEqual(aisles, aisleEntries().map((e) => publicAisle(e)));
  for (const a of aisles) assert.deepEqual(Object.keys(a).sort(), ['checks', 'id', 'kind', 'rule', 'section', 'title']);
});
