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
  pickImportedText,
  sameVerdict,
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

/* ───────────── Two lists, one product — the live/imported cross-check ─────────────

   The incident: a US Heinz ketchup barcode returned the UK recipe (tomatoes, vinegar,
   sugar, salt) and earned `approved` plus the gold seal, on a product whose real US
   label leads with high fructose corn syrup.

   IT WAS NOT A MARKET MISMATCH, and that matters because it is the fix that suggests
   itself first. The record was tagged `en:united-states`, in English, at the US pack
   size — measured across 20 sampled products, market mismatches numbered ZERO. A
   country or GS1-prefix guard would have caught nothing, including this.

   What happened is that OFF keeps a live, contributor-editable `ingredients_text_en`
   AND the raw `ingredients_text_en_imported` from the source database, and a
   contributor edit had shadowed a correct USDA import. The right answer was in the
   same API response the whole time, in a field we never asked for.                  */

test('pickImportedText holds the raw import to the same English standard', () => {
  assert.equal(
    pickImportedText({ ingredients_text_en_imported: 'Oats, honey, salt' }),
    'Oats, honey, salt'
  );
  // A foreign import is no more usable than a foreign live field.
  assert.equal(pickImportedText({ ingredients_text_imported: 'sucre, huile, sel' }), '');
  assert.equal(
    pickImportedText({ ingredients_text_imported: 'Wheat flour, sugar', lang: 'fr' }),
    ''
  );
  assert.equal(pickImportedText({}), '', 'absent is not a conflict');
});

test('DISAGREEMENT IS MEASURED IN VERDICTS, NOT IN CHARACTERS', () => {
  // The real Heinz pair, verbatim from the live record. Live scores clean; the import
  // carries HFCS. Different tiers ⇒ two answers ⇒ Kristy gives neither.
  const live =
    'Tomatoes (148g per 100g ketchup), Natural Vinegar, Sugar, Salt, Spice and Herb Extracts (contains Celery), Spices.';
  const imported =
    'Tomato concentrate from red ripe tomatoes, distilled vinegar, high fructose corn syrup, corn syrup, salt, spice, onion powder, natural flavoring';
  const heinz = sameVerdict(live, imported);
  assert.equal(heinz.agree, false, 'the ketchup disagrees with itself');
  assert.deepEqual(heinz.tiers, ['approved', 'skip']);

  /* THE BENIGN CASE MUST STAY SILENT, and this is why the signal is the tier rather
     than the text. The real Trader Joe's soy beverage pair differs by a whole phrase —
     word-overlap scored it 60%, under any threshold worth setting — but both lists say
     "water and soybeans" and both score `approved`. Firing here would cost a shopper a
     photo to be told the same thing twice. Measured over the sample, text similarity
     fired on 2 of 18 and verdict equivalence on 1 of 18; the one was Heinz. */
  const quiet = sameVerdict('WATER, ORGANIC SOYBEANS CONTAINS SOY', 'Water, organic soybeans');
  assert.equal(quiet.agree, true, 'a difference that changes no verdict is not a conflict');
});
