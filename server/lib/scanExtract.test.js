// Scan extraction guards — the honesty layer on the scan front door.
//
// These tests exist because of a real incident: a bag of chips returned a coffee
// creamer. The root cause was a demo-mode mask (fixed separately), but it exposed
// the class of bug — a lookup answering about a product that is NOT the one scanned.
// Everything here is a tripwire on that class.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sameGtin,
  isReadableIngredientList,
  pickEnglishText,
  looksNonEnglish,
} from './scanExtract.js';

/* ───────────────────────── Identity: sameGtin ───────────────────────── */

test('sameGtin tolerates zero-padding (UPC-A 12 ⇄ EAN-13)', () => {
  // The same GTIN, stored either way. Rejecting this would turn correct US
  // lookups into misses — the guard must not create the problem it prevents.
  assert.ok(sameGtin('0012000001086', '012000001086'));
  assert.ok(sameGtin('012000001086', '12000001086'));
  assert.ok(sameGtin('12000001086', '0000012000001086'));
});

test('sameGtin rejects a different product', () => {
  assert.equal(sameGtin('012000001086', '028400090728'), false);
  // A near-miss on the last digits is still a different product.
  assert.equal(sameGtin('012000001086', '012000001087'), false);
});

test('sameGtin treats empty/absent as NOT a match', () => {
  // Never let a blank echo count as agreement — that would re-open the hole.
  assert.equal(sameGtin('', '012000001086'), false);
  assert.equal(sameGtin('012000001086', ''), false);
  assert.equal(sameGtin(null, undefined), false);
  assert.equal(sameGtin('0', '00'), false);
});

/* ─────────────────── Confidence: isReadableIngredientList ─────────────────── */

test('placeholder ingredient text is NOT a readable list', () => {
  // OFF is crowd-sourced; these appear. A string that matches nothing in the KB
  // scores zero concerns — i.e. a SILENT APPROVED STAMP on an unread product.
  for (const junk of ['n/a', 'N/A', 'none', 'unknown', 'null', '-', '...', '?', '   ', ',']) {
    assert.equal(isReadableIngredientList(junk), false, `should reject: "${junk}"`);
  }
});

test('a single-ingredient whole food IS readable', () => {
  // The floor must not reject honest short lists — a one-ingredient product is
  // exactly the case Kristy should be able to approve.
  assert.ok(isReadableIngredientList('Peanuts.'));
  assert.ok(isReadableIngredientList('Organic rolled oats'));
  assert.ok(isReadableIngredientList('Whole milk'));
});

test('a real ingredient statement is readable', () => {
  assert.ok(
    isReadableIngredientList(
      'Enriched flour, sugar, canola oil, salt, TBHQ (preservative), Red 40'
    )
  );
});

/* ───────────── The pre-existing language guard still holds ───────────── */

test('a foreign ingredient string never becomes a verdict', () => {
  // Unreadable ⇒ no ingredients ⇒ no card ⇒ no stamp. Same doctrine as above.
  assert.equal(pickEnglishText({ ingredients_text: 'sucre, huile de tournesol, sel' }), '');
  assert.equal(pickEnglishText({ ingredients_text: 'Wheat flour, sugar', lang: 'fr' }), '');
  assert.ok(looksNonEnglish('azúcar, aceite de girasol'));
});

test('an English list still resolves', () => {
  assert.equal(
    pickEnglishText({ ingredients_text_en: 'Oats, honey, salt' }),
    'Oats, honey, salt'
  );
  assert.equal(
    pickEnglishText({ ingredients_text: 'Oats, honey, salt', lang: 'en' }),
    'Oats, honey, salt'
  );
});
