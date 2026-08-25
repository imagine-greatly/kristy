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
  translationMismatch,
  languageConflict,
  aisleFromCategories,
} from './scanExtract.js';

import { categoryFromAisle } from './productCategory.js';

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

/* ─────── The language guard: the parse and the text are different documents ───────

   The incident, measured 2026-08-25 against the live Open Food Facts record for
   Cristaline `3274080005003`: `ingredients_lc` is `fr`, the parsed document is the
   two-word "Eau de source", and `ingredients_text_en` holds a nine-line MINERAL
   ANALYSIS a contributor pasted in. `pickEnglishText` preferred the English field, so
   the engine scored a mineral table as an ingredient list, matched nothing, and
   returned zero concerns — a silent `approved`.

   ⚠️ THE TWO-LISTS GUARD ABOVE CANNOT REACH THIS AND THE REASON IS STRUCTURAL, NOT AN
   OVERSIGHT: it compares TIERS, and the KB is English, so a French list matches nothing
   and scores `approved` while junk English that also matches nothing scores `approved`
   too. They agree. Every cross-language pair agrees. A different test was needed.

   The fixtures below are the REAL fields off the live API, not invented ones — the
   sample is recorded at `TRANSLATION_EXPANSION_CEILING` in `scanExtract.js`. */

// Cristaline 3274080005003, verbatim.
const CRISTALINE_PARSED = 'Eau de source';
const CRISTALINE_EN =
  'Eau de source Noemie\r\n\r\nCalcium Ca2+ 113 mg/l\r\nMagnesium Mg2+ 228 mg/l\r\n' +
  'Sodium Na 7 mg/l\r\nPotassium K 2 mg/l\r\nSilice SiOz 15 mg/l\r\n' +
  'Bicarbonates HCO3 - 447 mg/l\r\nSulfates SO42 - 53 mg/l\r\nChlorure Cl - 8 mg/l\r\n' +
  'Nitrates NO3 - <2 mg/l\r\nFluor F - <1 mg/l\r\npH 7.3';

test('the mineral table filed as English is not a translation of what OFF parsed', () => {
  assert.ok(translationMismatch(CRISTALINE_PARSED, CRISTALINE_EN));
  assert.ok(
    languageConflict({
      ingredients_lc: 'fr',
      ingredients_text: CRISTALINE_PARSED,
      ingredients_text_en: CRISTALINE_EN,
    }),
    'the record holds two documents and the guard must say so'
  );
});

test('the nine measured translations all survive the guard', () => {
  /* Every genuine translation in the sample, as (parsed, en) LENGTHS — the ratio is the
     only thing the guard reads, so the lengths are the whole fixture. Widest was 0.98.
     ⚠️ THIS IS THE ASSERTION THAT FAILS IF THE CEILING IS EVER TIGHTENED TOWARD 1.0,
     which is the edit that would start refusing honest reads. */
  const measured = [
    // ⚠️ THE LAST TWO ARE THE POINT OF THIS LIST. Both are OVER 1.0 — a translation CAN
    // expand — and they were found only by sampling German/Spanish/Italian after the first
    // French-only pass concluded translations always shrink. A rule measured on one language
    // and applied to every non-English parse is an assumption, not a measurement.
    [354, 346], // Prince biscuits          0.98
    [278, 269], // Cruesly nut mix          0.97
    [460, 403], // Pain de mie seigle       0.88
    [192, 165], // Nocciolata bio           0.86
    [57, 25],   // Skyr nature 0%           0.44
    [127, 42],  // Noir Intense             0.33
    [114, 33],  // Pur beurre de cacahuète  0.29
    [100, 103], // EU sweep                 1.03
    [100, 105], // EU sweep                 1.05  ← the widest genuine translation measured
  ];
  assert.equal(measured.length, 9, 'the sample is nine translations; do not shrink it');
  for (const [parsedLen, enLen] of measured) {
    assert.equal(
      translationMismatch('x'.repeat(parsedLen), 'y'.repeat(enLen)),
      false,
      `a translation at ${(enLen / parsedLen).toFixed(2)}× must not be refused`
    );
  }
});

test('an English-parsed record is out of range entirely', () => {
  // When OFF parsed English, the English field IS the parsed document. There is no second
  // document, so there is nothing to disagree with — however long the field happens to be.
  assert.equal(
    languageConflict({
      ingredients_lc: 'en',
      ingredients_text: 'Oats',
      ingredients_text_en: 'Oats, honey, salt, sunflower oil, and a great deal more besides',
    }),
    false
  );
});

test('an unparsed record is not a conflict — silence is not evidence', () => {
  // No parsed document to compare against. Refusing here would fail closed on every
  // record OFF has not got to yet, which is a miss manufactured out of nothing.
  assert.equal(languageConflict({ ingredients_lc: 'fr', ingredients_text_en: 'Spring water' }), false);
  assert.equal(translationMismatch('', 'Spring water'), false);
  assert.equal(translationMismatch('Eau de source', ''), false);
});

test('a French document filed in the English field is refused outright', () => {
  /* `06175700`, verbatim: `ingredients_lc` is `fr` and `ingredients_text_en` is FRENCH —
     and a different recipe from the buckwheat the parsed field carries (corn flour, rice
     flour, sea salt vs "Farine de sarrasin"). Two documents AND a language error.
     ⚠️ THE FIELD NAME IS A CONTRIBUTOR'S ASSERTION. `looksNonEnglish` was applied to the
     FALLBACK text and skipped on the field whose whole claim is that it is English. */
  const en = 'Farine de maïs* (70%), farine de riz*, sel marin. * K issus de l\'agriculture biologique.';
  assert.ok(looksNonEnglish(en), 'the guard that already existed does see this');
  assert.equal(
    pickEnglishText({ ingredients_lc: 'fr', ingredients_text: 'Farine de sarrasin.', ingredients_text_en: en }),
    '',
    'a foreign string must never reach the engine, whichever field it arrived in'
  );
});

test('the imported English field is held to the same standard', () => {
  assert.equal(pickImportedText({ ingredients_text_en_imported: 'sucre, huile de tournesol' }), '');
  assert.equal(
    pickImportedText({ ingredients_text_en_imported: 'Sugar, sunflower oil' }),
    'Sugar, sunflower oil'
  );
});

/* ─────── The aisle is the most specific MAPPED tag, not the last one ───────

   `categories_tags` is an order, not a specificity hierarchy. Taking the last entry as
   "the most specific" means any product whose last tag happens to be a DIETARY one loses
   its aisle — and the answer was sitting in the list the whole time.

   ⚠️ THE FIX IS WHICH TAG IS CONSULTED. It is NOT a wider `water` pattern: widening
   `water` to swallow `beverages` would file every soda and juice as water to rescue one
   bottle of it. */

// Cristaline 3274080005003, verbatim off the live API.
const CRISTALINE_TAGS = [
  'en:beverages-and-beverages-preparations',
  'en:beverages',
  'en:waters',
  'en:spring-waters',
  'en:unsweetened-beverages',
];

test('a dietary last tag no longer costs a product its aisle', () => {
  assert.equal(aisleFromCategories(CRISTALINE_TAGS), 'spring waters');
  assert.equal(categoryFromAisle(aisleFromCategories(CRISTALINE_TAGS)), 'water');
  // The old rule, named so a regression says what it broke rather than just going red.
  assert.equal(
    categoryFromAisle('unsweetened beverages'),
    'other',
    'the last tag maps to nothing — which is why reading it as "most specific" lost the aisle'
  );
});

test('an already-correct last tag is unchanged', () => {
  // The walk must not disturb the products that were never broken: when the last tag maps,
  // it IS the most specific mapped hit and it is returned first.
  assert.equal(
    aisleFromCategories(['en:plant-based-foods', 'en:cereals-and-potatoes', 'en:breakfast-cereals']),
    'breakfast cereals'
  );
  assert.equal(categoryFromAisle(aisleFromCategories(['en:snacks', 'en:crackers'])), 'cracker');
});

test('when nothing maps, the last tag still comes back verbatim', () => {
  /* `other` plus the string that failed is strictly more informative than an empty aisle —
     it is what makes `category_raw` a frequency-rankable backlog rather than a silence.
     Same argument `counter_gaps` makes for the counter's authoring backlog. */
  assert.equal(aisleFromCategories(['en:groceries', 'en:unclassifiable-things']), 'unclassifiable things');
  assert.equal(aisleFromCategories([]), '');
  assert.equal(aisleFromCategories(null), '');
});

test('the walk prefers the specific end when two tags both map', () => {
  // `waters` and `spring-waters` both map; the more specific one is the aisle. A product
  // tagged both `beverages` and `sodas` must not come back as the generic.
  assert.equal(aisleFromCategories(['en:waters', 'en:spring-waters']), 'spring waters');
  assert.equal(aisleFromCategories(['en:beverages', 'en:sodas']), 'sodas');
});

/* ─────── The composition: no file owns it, so the test lives at the seam ───────

   ⚠️ EACH SITE REASONS CORRECTLY ALONE AND THE DEFECT ONLY APPEARS ADDED UP. The aisle
   fix is right about aisles. The `water` exemption is right about water. Composed on the
   Cristaline record they hand a gold seal to a mineral analysis, because resolving the
   category to `water` lets it past a fail-closed panel gate — and the gate's CONTENT half
   is measured not to pick it up (the tokens are a mangled dump with units and a brand
   name, not the bare nutrient names `readsAsNutrientPanel` tests for).

   The ordering constraint recorded in `productCategory.js` is what makes it safe: the
   language guard is upstream of all of it and refuses the record before a category is ever
   consulted. THIS TEST IS THAT CONSTRAINT, EXECUTABLE — driven live against the real API
   2026-08-25, and pinned here on the real payload so it needs no network.

   ⚠️ IF THIS GOES RED, DO NOT LOOSEN IT. It means a bottle of water is one step from the
   seal again. */

test('the aisle fix does NOT hand Cristaline the exemption, because the guard is upstream', () => {
  const record = {
    ingredients_lc: 'fr',
    ingredients_text: CRISTALINE_PARSED,
    ingredients_text_en: CRISTALINE_EN,
    categories_tags: CRISTALINE_TAGS,
  };

  // The aisle fix works, and this is the half that WOULD be dangerous alone.
  assert.equal(categoryFromAisle(aisleFromCategories(record.categories_tags)), 'water');

  // And it never gets consulted, because the record is refused one layer up.
  assert.ok(languageConflict(record), 'the refusal must happen BEFORE the category matters');
});
