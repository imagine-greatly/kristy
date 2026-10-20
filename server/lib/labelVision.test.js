// Photo kind and noun guards. Printed claims are transcription, never a verdict.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanItem, ITEM_STOPLIST, parseIngredientsJSON } from './labelVision.js';
import { nonEmpty } from './testGuards.js';

const parse = (obj) => parseIngredientsJSON(JSON.stringify(obj));

test('counter keeps a generic noun and a lean ratio', () => {
  const out = parse({ kind: 'counter', item: 'Ground Beef 85/15', ingredients: [] });
  assert.equal(out.kind, 'counter');
  assert.equal(out.item, 'ground beef 85/15');
});

test('unknown kind uses the panel door', () => {
  assert.equal(parse({ kind: 'garbage' }).kind, 'panel');
});

test('an ingredient list overrides a counter read', () => {
  assert.equal(parse({ kind: 'counter', ingredients: ['milk'] }).kind, 'panel');
});

test('positive non-food wins even when ingredients were transcribed', () => {
  const out = parse({ kind: 'not_food', item: 'soap', ingredients: ['water', 'fragrance'] });
  assert.equal(out.kind, 'not_food');
  assert.equal(out.item, null);
});

test('an old model reply preserves every old parsed field', () => {
  const out = parse({
    product_name: '  Oat Cereal ', brand: ' Storebrand ', ingredients: [' Oats ', 'sugar', ''],
    panel: 'FULL', category: 'cereal', sugars_g: 0, serving_g: 40,
  });
  const { kind, item, claims, ...oldFields } = out;
  assert.equal(kind, 'panel');
  assert.equal(item, null);
  assert.deepEqual(claims, []);
  nonEmpty(oldFields.ingredients, 'legacy ingredients');
  assert.deepEqual(oldFields, {
    ingredients: ['Oats', 'sugar'], category: 'cereal', categoryRaw: 'cereal',
    productName: 'Oat Cereal', brand: 'Storebrand', panel: 'full', sugarsG: 0, servingG: 40,
  });
});

test('cleanItem removes sales language', () => {
  assert.equal(cleanItem('heart healthy ground beef'), 'ground beef');
  for (const term of nonEmpty(ITEM_STOPLIST, 'item stoplist')) {
    assert.equal(cleanItem(`${term} chicken thighs`), 'chicken thighs', term);
  }
});

test('cleanItem removes prices and ordinary numbers, preserving only lean ratios', () => {
  const cases = nonEmpty([
    ['$7.49/lb chicken thighs', 'chicken thighs'],
    ['99¢ per lb chicken thighs', 'chicken thighs'],
    ['chicken thighs 5.99$ /lb', 'chicken thighs'],
    ['2 premium ground beef 90/10', 'ground beef 90/10'],
    ['95/5 extra lean ground beef', '95/5 ground beef'],
    ['85% lean 15% fat ground beef', 'ground beef'],
  ], 'price and ratio cases');
  for (const [input, expected] of cases) assert.equal(cleanItem(input), expected);
});

test('cleanItem drops each transcribed brand word', () => {
  const item = cleanItem('Vital Farms pasture raised eggs', 'Vital Farms');
  assert.equal(item, 'pasture raised eggs');
  assert.doesNotMatch(item, /vital|farms/);
  assert.equal(cleanItem('Acme+ eggs', 'Acme+'), 'eggs');
});

test('cleanItem bounds the noun and refuses text without letters', () => {
  for (const input of nonEmpty(['', ' ', '85/15', '$7.49/lb', null, 42], 'empty nouns')) {
    assert.equal(cleanItem(input), null);
  }
  assert.equal(cleanItem('a'.repeat(90)).length, 60);
});

test('claims are strings, trimmed, case-deduped and bounded', () => {
  const out = parse({ claims: [' Cage Free ', 'cage free', 1, null, {}, '', 'x'.repeat(50),
    ...Array.from({ length: 15 }, (_, i) => `term ${i}`)] });
  nonEmpty(out.claims, 'parsed claims');
  assert.equal(out.claims.length, 12);
  assert.equal(out.claims[0], 'Cage Free');
  assert.equal(out.claims[1], 'x'.repeat(40));
  assert.ok(out.claims.every((claim) => typeof claim === 'string' && claim.length <= 40));
  assert.deepEqual(parse({ claims: 'organic' }).claims, []);
});
