// Importing a shopper's OWN list. The tests that matter here are the AUTONOMY ones:
// this is their list, and the feature is only trustworthy if nothing they wrote can
// disappear into it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseListText, specifyImportedItems, importSummary } from './listImport.js';
import { parseListJSON } from './listVision.js';

const names = (r) => r.items.map((i) => i.name);

test('parses the ways people actually write a list', () => {
  assert.deepEqual(
    parseListText('- 2 lbs chicken\n1 dozen eggs\n* milk\n3) bread'),
    ['chicken', 'eggs', 'milk', 'bread'],
    'bullets, numbers and quantities come off'
  );
  assert.deepEqual(parseListText('milk, eggs, bread'), ['milk', 'eggs', 'bread'], 'single line splits on commas');
  // A multi-line list must NOT also split on commas — that would shred a specific choice.
  assert.deepEqual(
    parseListText('chicken thighs, bone-in\nmilk'),
    ['chicken thighs, bone-in', 'milk'],
    'a comma inside a line is part of the item'
  );
  assert.deepEqual(parseListText('milk\nMILK\nmilk '), ['milk'], 'deduped');
  assert.deepEqual(parseListText('   '), []);
});

test('a GENERIC is specified — that is the whole value', () => {
  const r = specifyImportedItems(parseListText('milk\neggs\nbutter\noats'), {});
  assert.deepEqual(names(r), ['Whole milk', 'Pasture-raised eggs', 'Grass-fed butter', 'Steel-cut oats']);
  // Their own word is kept on the row, so an upgrade is legible as one.
  assert.equal(r.items[0].specifiedFrom, 'milk');
  assert.ok(r.items[0].why, 'a specified row carries its reason');
});

test('a SPECIFIC choice is left exactly alone', () => {
  // They already decided. Replacing this would be overriding a person.
  const r = specifyImportedItems(parseListText('Fairlife 2% milk\nalmond milk\nsourdough from the bakery'), {});
  assert.deepEqual(names(r), ['Fairlife 2% milk', 'almond milk', 'sourdough from the bakery']);
  assert.ok(r.items.every((i) => !i.specifiedFrom), 'nothing was rewritten');
});

test('NOTHING they wrote is ever deleted — a hard line only OFFERS', () => {
  // The vegan case is the sharpest: eggs and chicken clash outright, and both must
  // still be on the list afterwards.
  const r = specifyImportedItems(parseListText('milk\nbutter\neggs\nchicken\nspinach'), {
    nonNegotiables: ['vegan'],
  });
  assert.equal(r.items.length, 5, 'every item survives');
  const eggs = r.items.find((i) => /egg/i.test(i.name));
  const chicken = r.items.find((i) => /chicken/i.test(i.name));
  assert.ok(eggs && chicken, 'the clashing items are still there');
  assert.ok(eggs.swapOffer && chicken.swapOffer, 'they carry an OFFER, not a deletion');
  // Where a line-safe version exists, that IS the specification.
  assert.match(r.items.find((i) => i.specifiedFrom === 'milk').name, /almond or oat/i);
});

test('a line-clashing item they wrote is named from THEIR line, never from an opinion', () => {
  const r = specifyImportedItems(parseListText('margarine\nvegetable oil'), {
    nonNegotiables: ['no seed oils'],
  });
  assert.deepEqual(names(r), ['margarine', 'vegetable oil'], 'kept verbatim');
  assert.ok(r.items.every((i) => i.swapOffer), 'both offered a swap');
  // Grounded in THEIR declared line, and stated without a first-person pronoun —
  // "Your line: no seed oils", never "I'd swap that" and never "you told me".
  assert.match(r.items[0].swapOffer, /your line/i, 'grounded in what they declared');
  assert.doesNotMatch(r.items[0].swapOffer, /\b(I|I'd|I'll|me|my)\b/, 'no first person');

  // With NO line declared, the same items get no commentary at all — the offer comes
  // from their rule, not from Kristy having a view about their food.
  const quiet = specifyImportedItems(parseListText('margarine\nvegetable oil'), { nonNegotiables: [] });
  assert.ok(quiet.items.every((i) => !i.swapOffer), 'no line, no lecture');
});

test('an unreadable item is kept for the shopper to fix, never guessed', () => {
  const r = specifyImportedItems([{ text: 'ch??se', unreadable: true }, { text: 'milk' }], {});
  const bad = r.items[0];
  assert.equal(bad.name, 'ch??se', "the shopper's own marks are kept");
  assert.ok(bad.needsFix, 'flagged for a fix');
  assert.ok(!bad.why, 'nothing was invented about it');
});

test('a constraint tunes the specific pick, and only for premium', () => {
  const paid = specifyImportedItems(parseListText('chicken\nbeans'), { constraints: ['budget'], premium: true });
  assert.match(paid.items[0].name, /whole chicken/i, 'budget buys the whole bird');
  const free = specifyImportedItems(parseListText('chicken\nbeans'), { constraints: ['budget'], premium: false });
  assert.match(free.items[0].name, /thighs/i, 'free gets the base pick');
});

test('no imported row carries a health-outcome claim', () => {
  const FORBIDDEN = /\b(cure|heal|treat|prevent|reverse|boost|detox|immunity|inflammation|disease|remedy)\b/i;
  const r = specifyImportedItems(parseListText('milk\neggs\nbutter\nbread\nchicken\noats\nbeans\nspinach'), {
    nonNegotiables: ['no seed oils'],
    constraints: ['budget'],
    premium: true,
  });
  for (const i of r.items) {
    assert.doesNotMatch(`${i.name} ${i.why || ''} ${i.alt || ''} ${i.swapOffer || ''}`, FORBIDDEN, i.name);
  }
  assert.doesNotMatch(importSummary(r), FORBIDDEN);
});

test("Kristy's summary is 'kept it, sharpened it' — never 'fixed your choices'", () => {
  const r = specifyImportedItems(parseListText('milk\nDoritos'), {});
  const line = importSummary(r);
  assert.match(line, /kept all 2/i);
  assert.doesNotMatch(line, /\b(fixed|removed|deleted|replaced|bad|unhealthy|junk)\b/i);
});

test('vision transcription parses defensively and never invents an item', () => {
  assert.deepEqual(parseListJSON('{"items":[{"text":"milk","unreadable":false}]}').items, [
    { text: 'milk', unreadable: false },
  ]);
  // A bare-string reply still yields the shopper's list rather than nothing.
  assert.deepEqual(parseListJSON('{"items":["milk","eggs"]}').items, [
    { text: 'milk', unreadable: false },
    { text: 'eggs', unreadable: false },
  ]);
  // An unreadable entry survives even with no legible text — it becomes a row to fix.
  assert.deepEqual(parseListJSON('{"items":[{"text":"","unreadable":true}]}').items, [
    { text: '', unreadable: true },
  ]);
  assert.equal(parseListJSON('not json'), null);
  assert.deepEqual(parseListJSON('{"items":[]}').items, []);
});
