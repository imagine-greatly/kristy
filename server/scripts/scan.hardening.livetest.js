// Hardening acceptance — the language guard that stops a product Kristy can't
// actually read from ever getting the stamp (the false-"approved" liability).
//
//   node --use-system-ca scripts/scan.hardening.livetest.js
// Unit checks need nothing; the live invariant check needs network to Open Food
// Facts (and the vision key only if a foreign product has no English text).
//
// The invariant: extractFromBarcode NEVER returns a foreign ingredient string.
// Foreign/unreadable ⇒ ingredients '' ⇒ no /verdict ⇒ no engine ⇒ no stamp.

import 'dotenv/config';
import { looksNonEnglish, pickEnglishText, extractFromBarcode } from '../lib/scanExtract.js';

let fails = 0;
const check = (name, cond) => {
  console.log(`  ${cond ? '✓' : '✗ FAIL'} ${name}`);
  if (!cond) fails += 1;
};

/* ── Unit: looksNonEnglish ── */
console.log('\n── looksNonEnglish ──');
check('French rejected', looksNonEnglish('Sucre, huile de palme, NOISETTES, lait écrémé'));
check('Spanish rejected', looksNonEnglish('Azúcar, aceite de girasol, harina de trigo'));
check('German rejected', looksNonEnglish('Zucker, Weizenmehl, Speisesalz, Wasser'));
check('English (Doritos) accepted', !looksNonEnglish('corn, vegetable oil (corn, canola, sunflower oil), salt, sugar, monosodium glutamate, cheddar cheese'));
check('short clean English accepted', !looksNonEnglish('Organic blueberries, sea salt'));
check('empty is not "non-English"', !looksNonEnglish(''));

/* ── Unit: pickEnglishText (the false-approve guard) ── */
console.log('\n── pickEnglishText ──');
check('explicit English field used', pickEnglishText({ ingredients_text_en: 'sugar, palm oil' }) === 'sugar, palm oil');
check('French text (lang fr) → rejected → ""', pickEnglishText({ ingredients_text: 'sucre, huile de palme', lang: 'fr' }) === '');
check('English text (lang en) → used', pickEnglishText({ ingredients_text: 'sugar, salt', lang: 'en' }) === 'sugar, salt');
check('French text, no lang → still rejected → ""', pickEnglishText({ ingredients_text: 'sucre, huile de palme' }) === '');
check('English text, no lang → used', pickEnglishText({ ingredients_text: 'water, sugar, salt' }) === 'water, sugar, salt');
check('nothing → ""', pickEnglishText({}) === '');

/* ── Live invariant: extraction never returns a foreign string ── */
console.log('\n── extractFromBarcode invariant (live) ──');
const CASES = [
  ['028400642255', 'Doritos (US, English)', true],
  ['7622210449283', 'Prince biscuits (FR)', false],
  ['3017620422003', 'Nutella (FR)', false],
];
try {
  for (const [code, label, expectEnglishOff] of CASES) {
    const ex = await extractFromBarcode(code);
    const foreign = ex.ingredients && looksNonEnglish(ex.ingredients);
    console.log(`    ${label}: found=${ex.found} source=${ex.source} ingLen=${ex.ingredients.length} foreign=${!!foreign}`);
    check(`${label}: NEVER returns a foreign ingredient string`, !foreign);
    check(`${label}: a foreign/unreadable product yields no card (found:false or empty)`,
      !foreign && (ex.ingredients.trim() === '' ? ex.found === false : true));
    if (expectEnglishOff) {
      check(`${label}: English product still resolves (regression)`, ex.found && ex.source === 'off' && ex.ingredients.length > 0);
    }
  }
  console.log(`\n${fails === 0 ? 'ALL CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
  process.exit(fails === 0 ? 0 : 1);
} catch (err) {
  console.error('\nLive test error:', err?.message || err);
  process.exit(1);
}
