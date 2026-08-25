// Scan → ingredient list. The extraction half of the repointed scan path: given a
// barcode (or a label photo, handled in routes/scan.js), produce the product's
// ingredient string + display meta. The verdict itself is NOT computed here — the
// caller POSTs the ingredients to /verdict, which owns the engine + claim-locked
// note. This module only ANSWERS "what's in it and what is it?".
//
// Order of resolution for a barcode:
//   0. KRISTY'S OWN STORE — a product some shopper already resolved, most valuably
//      one photographed off a label because OFF didn't have it. This layer is what
//      makes the coverage gap close itself: every miss that gets photographed fills
//      its own hole for the next person.
//   1. Open Food Facts ingredients text (English preferred) — the fast, free path,
//      cross-checked against OFF's own raw import before it is trusted.
//   2. Otherwise: found but no ingredients (the client offers the label photo).
//
// THERE IS NO SERVER-SIDE VISION STEP ANY MORE. There was one, reading the panel photo
// OFF stores; it is deleted and the reasoning is recorded at the point it used to sit.
// Vision still runs on the SHOPPER'S photo, in routes/scan.js, which is a different and
// much better piece of evidence: their package, their market, in their hand.
//
// Every layer returns INGREDIENTS ONLY. A cached hit is not a cached verdict — it
// goes through the same engine + KB + claim lock as a fresh lookup, so the judgment
// is always recomputed against the current KB and the shopper's current preferences.

import { lookupProduct, retainProduct } from './productStore.js';
import { evaluateIngredients } from './verdictEngine.js';
import { recordConflict } from './ingredientConflicts.js';
import { categoryFromAisle, UNCATEGORIZED } from './productCategory.js';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_FIELDS = [
  'product_name',
  'product_name_en',
  'generic_name',
  'brands',
  'lang',
  'lc',
  'categories_tags',
  'ingredients_text_en',
  'ingredients_text',
  // The RAW IMPORT, kept by Open Food Facts alongside the live editable field.
  // `ingredients_text_en` is contributor-editable; `_imported` is what the source
  // database supplied. When they disagree the product has two ingredient lists and
  // we have no way to tell which is on the shelf — see `sameVerdict` below.
  'ingredients_text_en_imported',
  'ingredients_text_imported',
  'nutriments',
  'image_front_url',
  'image_url',
].join(',');

const UA = { 'User-Agent': 'Kristy/1.0 (grocery coach; nutrition app)' };

// ── Language guard (hardening) ───────────────────────────────────────────────
// The knowledge base is English. Feeding a non-English ingredient string to the
// engine matches nothing and returns a silent "approved" — a false stamp on a
// product Kristy can't actually read. That's a liability, so every ingredient
// string (from Open Food Facts text OR vision) must clear an English check before
// it can produce a verdict. Unreadable ⇒ no ingredients ⇒ no card ⇒ no stamp.

// Unambiguously non-English food words (curated to avoid English-ambiguous ones).
const NON_EN_HINTS =
  /\b(sucre|huile|farine|lait|amidon|ar[oô]me|bl[eé]|beurre|oeufs?|az[uú]car|aceite|harina|leche|agua|zucker|weizen|milch|zutaten|salz|wasser|acqua|zucchero|olio|conservateur|colorant|edulcorante|s[oó]dio|arachide)\b/i;

/** True when a string is clearly NOT English (foreign food words or heavy accents). */
export function looksNonEnglish(text) {
  const t = String(text || '');
  if (!t.trim()) return false;
  if (NON_EN_HINTS.test(t)) return true;
  const letters = (t.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const accented = (t.match(/[À-ÿ]/g) || []).length;
  return letters > 0 && accented / letters > 0.06;
}

/**
 * Choose an ENGLISH ingredient string from an Open Food Facts product, or '' if
 * none can be trusted. Prefers the explicit English field; otherwise accepts the
 * default-language text only when OFF says the product is English (or the language
 * is unknown and the text doesn't look foreign). Never returns a foreign string.
 */
export function pickEnglishText(p = {}) {
  const en = String(p.ingredients_text_en || '').trim();
  // ⚠️ THE EXPLICIT ENGLISH FIELD IS NOT SELF-CERTIFYING, AND IT USED TO BE RETURNED
  // UNCHECKED. `looksNonEnglish` was applied to the FALLBACK text and skipped on the field
  // whose whole claim is that it is English — so the one document nobody verified was the one
  // trusted most. Measured on `06175700`: `ingredients_text_en` holds FRENCH
  // ("Farine de maïs*, farine de riz*, sel marin"), and it is a different recipe from the
  // buckwheat the parsed field carries. The field name is a contributor's assertion, not OFF's.
  if (en) return looksNonEnglish(en) ? '' : en;

  const raw = String(p.ingredients_text || '').trim();
  if (!raw) return '';
  const lang = parsedLanguage(p);
  if (lang && lang !== 'en') return ''; // OFF says it's another language → don't trust it
  if (looksNonEnglish(raw)) return ''; // unknown language but clearly foreign
  return raw;
}

// ── The language guard: the parse and the text can be DIFFERENT DOCUMENTS ────────────
// `ingredients_lc` names the language Open Food Facts actually PARSED, and it is not the
// same question as what language the product is in. When it is not `en`, OFF parsed some
// other field, and `ingredients_text_en` is a sibling nobody validated against it.
//
// ⚠️ THE ENGLISH FIELD IS NOT A TRANSLATION, IT IS A SECOND DOCUMENT — so a language check
// passes it and the whole language layer above is asking the wrong question. This is the
// two-lists disagreement on a new axis, and `sameVerdict` is the precedent for the SHAPE:
// two answers on file, no way to tell which is on the shelf, so Kristy does not guess and
// does not stamp. ⚠️ IT IS NOT THE PRECEDENT FOR THE TEST. `sameVerdict` compares TIERS,
// and a tier comparison is structurally blind across languages: the KB is English, so a
// French list matches nothing and scores `approved`, and a junk English list that also
// matches nothing scores `approved` too. The two agree, and the guard that fired on Heinz
// cannot fire here — measured, not assumed.
//
// ⚠️ AND IT IS NOT THE PANEL-GATE TRIGGER. It does not catch Sidi Ali, where the parse and
// the text agree and are wrong together. Two products, one symptom, two unrelated causes.

/** The language OFF actually parsed, which `lang`/`lc` only approximate. */
function parsedLanguage(p = {}) {
  return String(p.ingredients_lc || p.lang || p.lc || '').toLowerCase();
}

/* THE CONSTANT IS MEASURED, AND THE SAMPLE IS RECORDED BECAUSE A BARE NUMBER HERE WOULD BE
   A GUESS WEARING A CONSTANT'S CLOTHES. Sampled 2026-08-25 over the French market — every
   OFF product in the first 60 hits whose `ingredients_lc` was not `en` AND which carried a
   non-empty `ingredients_text_en`, 9 of 60 in range, each classified by READING it rather
   than by the rule under test:

     7 genuine translations   len(en)/len(parsed) = 0.29 0.33 0.44 0.86 0.88 0.97 0.98
     2 different documents    len(en)/len(parsed) = 8.32  20.23

   A translation restates a document; it does not multiply it. French→English usually
   SHRINKS, which is why every genuine case lands at or below 1.0. The gap between the widest
   translation (0.98) and the nearest junk (8.32) is more than 8×, so this is a canyon rather
   than a knife edge — but it is still a threshold, so it is set at 2.0: double the observed
   ceiling, to leave room for a terse source expanding into English, and still 4× below
   anything measured to be junk. ⚠️ RAISE IT ONLY ON MEASURED TRANSLATIONS THAT FAIL IT, and
   record them here. Lowering it toward 1.0 would start refusing honest reads. */
const TRANSLATION_EXPANSION_CEILING = 2;

/**
 * Is the English field too large to be a translation of the document OFF parsed?
 *
 * A guard, never a score — it answers one question and the answer is a veto. An empty
 * parsed document cannot be compared against, so it is NOT a mismatch: silence is not
 * evidence, and refusing on it would fail closed on every record OFF has yet to parse.
 */
export function translationMismatch(parsed, en) {
  const a = String(parsed || '').trim();
  const b = String(en || '').trim();
  if (!a || !b) return false;
  return b.length > a.length * TRANSLATION_EXPANSION_CEILING;
}

/**
 * Does this record hold two documents where it should hold one translation?
 *
 * Scoped to `ingredients_lc !== 'en'`, which is the exact range: when OFF parsed English,
 * the English field IS the parsed document and there is no second document to disagree with.
 */
export function languageConflict(p = {}) {
  const lang = parsedLanguage(p);
  if (!lang || lang === 'en') return false;
  return translationMismatch(p.ingredients_text, p.ingredients_text_en);
}

// ── The two-lists guard ──────────────────────────────────────────────────────
// A US Heinz ketchup barcode returned the UK recipe — tomatoes, vinegar, sugar,
// salt — and scored a clean `approved` with the gold seal, on a product whose real
// US label leads with high fructose corn syrup. The record was NOT wrong about the
// market: it was tagged `en:united-states`, in English, at the US pack size. A
// CONTRIBUTOR EDIT had overwritten `ingredients_text_en`, and the correct text was
// still sitting in the same API response under `ingredients_text_en_imported`.
//
// So the failure is not a market mismatch (measured: 0 of 20 sampled products had
// one). It is that OFF keeps a live, editable field and a raw imported field, and
// nothing here ever compared them.
//
// WHAT COUNTS AS DISAGREEMENT IS THE VERDICT, NOT THE TEXT. Comparing strings needs
// a similarity threshold, and every threshold is arbitrary: measured over the sample,
// a 70% word-overlap cutoff fired on two products, and one of them ("water, organic
// soybeans" vs "water, organic soybeans, contains soy") was a difference that changes
// nothing a shopper would ever act on. Scoring BOTH texts and comparing the resulting
// tier has no threshold in it and fires only when the two lists would tell the shopper
// different things — 1 of 18 on the same sample, and it was Heinz.
//
// The engine is used here as an EQUIVALENCE TEST, never to produce a verdict. The
// verdict is still computed once, by /verdict, from whichever list survives.

/** The raw imported ingredient text, held to the same English standard as the live one. */
export function pickImportedText(p = {}) {
  const en = String(p.ingredients_text_en_imported || '').trim();
  // Held to the same standard as the live field one function up, and for the same reason:
  // the two-lists guard compares TIERS, so handing it a foreign document asks a question it
  // is blind to — a French list matches no English KB entry and scores `approved`, agreeing
  // with anything else that also matches nothing.
  if (en) return looksNonEnglish(en) ? '' : en;
  const raw = String(p.ingredients_text_imported || '').trim();
  if (!raw) return '';
  const lang = parsedLanguage(p);
  if (lang && lang !== 'en') return '';
  if (looksNonEnglish(raw)) return '';
  return raw;
}

/**
 * Would these two ingredient lists produce the same verdict? Anything else is a
 * disagreement the shopper would notice.
 * @returns {{ agree:boolean, tiers:[string,string] }}
 */
export function sameVerdict(a, b) {
  const tierA = evaluateIngredients(a, {}).tier;
  const tierB = evaluateIngredients(b, {}).tier;
  return { agree: tierA === tierB, tiers: [tierA, tierB] };
}

// ── Identity guard ───────────────────────────────────────────────────────────
// A lookup must only ever answer about the barcode that was actually scanned.
// Returning someone else's product is the single worst failure this path has —
// a confident verdict on a product the shopper isn't holding.
//
// Zero-padding is tolerated deliberately: a 12-digit UPC-A off a US shelf is
// commonly stored as the same GTIN zero-padded to 13 digits (EAN-13), so a strict
// string compare would reject a correct match and turn every US scan into a miss.

/** GTIN equality, ignoring leading-zero padding (UPC-A 12 ⇄ EAN-13). */
export function sameGtin(a, b) {
  const strip = (x) => String(x || '').trim().replace(/^0+/, '');
  const A = strip(a);
  const B = strip(b);
  return !!A && A === B;
}

// An "ingredient list" that carries no actual ingredients. OFF is crowd-sourced and
// these placeholders do appear — and they are worse than an empty field, because a
// string that matches nothing in the KB scores as zero concerns, i.e. a SILENT
// APPROVED STAMP on a product Kristy never read. Same liability as the language
// guard, so it gets the same treatment: unreadable ⇒ no ingredients ⇒ no stamp.
const USELESS_TEXT = /^(n\/?a|none|nil|null|undefined|unknown|tbd|[-–—.,;:?*_\s]+)$/i;

// Kristy-voiced, and it names the real situation rather than blaming the shopper or
// the database. No first person, no service narration (VOICE_SPEC).
const CONFLICTING_DATA =
  "Two different ingredient lists on file for this one. A photo of the panel settles it.";

/** Is this string substantive enough to be a real ingredient statement? */
export function isReadableIngredientList(text) {
  const t = String(text || '').trim();
  // A single-ingredient product ("Peanuts.") is legitimate and must still pass —
  // the floor is only high enough to reject placeholders, not short honest lists.
  if (t.length < 3) return false;
  return !USELESS_TEXT.test(t);
}

// OFF categories_tags → a short human aisle/type ("en:breakfast-cereals" → "breakfast cereals").
function tagToAisle(tag) {
  return String(tag || '')
    .replace(/^[a-z]{2}:/, '')
    .replace(/-/g, ' ')
    .trim();
}

/**
 * Pick the aisle from OFF's category tags.
 *
 * ⚠️ **THIS USED TO TAKE THE LAST TAG AS "THE MOST SPECIFIC" AND THAT PREMISE IS FALSE.**
 * `categories_tags` is an order, not a specificity hierarchy, so any product whose last tag
 * happens to be a DIETARY one loses its aisle entirely. Cristaline `3274080005003` runs
 * `beverages-and-beverages-preparations → beverages → waters → spring-waters →
 * unsweetened-beverages`: it landed in `other` while carrying two tags that map to `water`.
 * The answer was in the list and the code was reading past it.
 *
 * ⚠️ **THE FIX IS THE MOST SPECIFIC *MAPPED* HIT, NOT A WIDER WATER PATTERN.** Widening
 * `water` to swallow `beverages` would file every soda and juice as water to rescue one
 * bottle — the defect is which tag is consulted, and it is fixed there.
 *
 * Walks from the specific end back, because OFF orders general → specific often enough for
 * that to be the right preference, and takes the first tag the closed vocabulary actually
 * recognises. **A tag nothing maps is not an answer**, so it is skipped rather than
 * returned. When NOTHING maps, the last tag is still returned verbatim — that is the old
 * behaviour, and it is what keeps `category_raw` diagnosable: `other` plus the string that
 * failed is strictly more informative than an empty aisle.
 */
export function aisleFromCategories(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  for (let i = tags.length - 1; i >= 0; i -= 1) {
    const aisle = tagToAisle(tags[i]);
    if (aisle && categoryFromAisle(aisle) !== UNCATEGORIZED) return aisle;
  }
  return tagToAisle(tags[tags.length - 1]);
}

// Per-100g nutrition the focus escalation needs: sodium + added sugar (g/100g).
// Sodium falls back from salt (salt = sodium × 2.5); added sugar falls back to
// total sugars when OFF has no added-sugars figure (a documented over-estimate,
// but it only ever raises emphasis for a user who asked to watch sugar).
export function nutritionFromOFF(p = {}) {
  const n = p.nutriments || {};
  const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : null);
  let sodium = num(n['sodium_100g']);
  if (sodium == null && num(n['salt_100g']) != null) sodium = num(n['salt_100g']) / 2.5;
  const addedSugar =
    num(n['added-sugars_100g']) ?? num(n['added_sugars_100g']) ?? num(n['sugars_100g']);
  // Fiber + caffeine feed the higher-fiber and caffeine focuses. Both are sparse
  // in OFF; null simply means that focus can't fire on this product, the same way
  // a missing sodium figure leaves the sodium focus quiet.
  const fiber = num(n['fiber_100g']) ?? num(n['fibre_100g']);
  const caffeine = num(n['caffeine_100g']);

  // ⚠️ **DOES THIS SOURCE DECLARE CALORIES? A thing sold to be eaten does.**
  //
  // Not a focus signal — it is the seal gate for a NON-FOOD product, and it is read here
  // rather than in the engine because only the caller knows whether a source that publishes
  // energy was consulted at all. `approved` means "zero KB entries matched", so a detergent
  // matches nothing and earns the seal: Dawn Platinum Plus Powerwash (0030772117484) came
  // back `stamp: true` on production, with "A few ingredients, all real. This is what food
  // used to look like" printed under it. docs/NON-FOOD-SEAL.md.
  //
  // ⚠️ **TRI-STATE, AND THE THIRD STATE IS THE WHOLE SAFETY OF IT.** `absent` means THIS
  // source was asked and had none. It must never be confused with "nobody asked" — the label
  // photo path deliberately discards calories ("calories, protein, fat and sodium are not
  // wanted"), so a two-state flag would withhold the seal from every product a shopper
  // photographs. That fix for a false seal on detergent would have stripped the seal off
  // every clean food read from a panel.
  //
  // Measured: both Dawns carry only OFF's COMPUTED keys (nova-group, the
  // fruits-vegetables estimates, a derived added-sugars) and no `energy-kcal` at all;
  // Nutella carries 52 keys including real energy. `energy_100g` is kJ and is accepted as
  // the same evidence — the question is whether a figure was declared, not its unit.
  const energyKcal = num(n['energy-kcal_100g'])
    ?? (num(n['energy_100g']) != null ? num(n['energy_100g']) / 4.184 : null);

  return {
    sodium,
    addedSugar,
    fiber,
    caffeine,
    nutritionPanel: energyKcal == null ? 'absent' : 'present',
  };
}

/** Display meta for the scan verdict card header. Factual, straight from OFF. */
export function productMeta(p = {}, barcode = null) {
  return {
    barcode: barcode || null,
    name: p.product_name_en || p.product_name || p.generic_name || null,
    brand: p.brands || null,
    image: p.image_front_url || p.image_url || null,
    aisle: aisleFromCategories(p.categories_tags),
  };
}

/**
 * Resolve a barcode to a product + ingredient list.
 * @returns {Promise<{ found:boolean, source:'off'|'vision'|'none', product:object|null, ingredients:string }>}
 *   `ingredients` is a comma-joined string the verdict engine tokenizes; '' when none.
 */
export async function extractFromBarcode(barcode, { client } = {}) {
  const code = String(barcode || '').trim();
  if (!code) return { found: false, source: 'none', product: null, ingredients: '' };

  // 0. Kristy's own store first. Free, instant, and it holds exactly the products
  //    the public databases don't. Degrades silently to OFF if unavailable.
  //
  // ⚠️ `client` IS INJECTABLE FOR THE SAME REASON `lookupProduct`'S IS: the claim about the
  // cache path is a SEQUENCE, and a test that rebuilt this function's mapping itself would be
  // verifying a composition the product never performs — the props-supplied harness defect
  // (CLAUDE.md, Verifying). A store hit returns before any fetch, so driving THIS function
  // with a fake store exercises the real call site and needs no network. Defaults to the real
  // client, so every caller in the app is untouched.
  const own = await lookupProduct(code, client ? { client } : undefined);
  if (own && isReadableIngredientList(own.ingredients) && !looksNonEnglish(own.ingredients)) {
    return {
      found: true,
      source: 'store',
      product: own.product,
      ingredients: own.ingredients,
      // ⚠️ SHAPED LIKE THE OFF PATH'S NUTRITION SO THE ENGINE CANNOT TELL WHICH DOOR THE PANEL
      // CAME IN THROUGH — the same rule the vision path already follows. The focus numbers are
      // genuinely absent from the store (this table holds identity and an ingredient list, not
      // a panel), and they stay null rather than being invented: `normalizeNutrition` maps a
      // null field and a missing object to the same thing, so this is behaviour-identical to
      // the `nutrition: null` it replaces for sodium, added sugar, fiber, caffeine and
      // `sugarHeavy`. The ONLY signal it adds is the seal gate.
      //
      // And it stays null when the row has no panel, rather than becoming an object full of
      // nulls: `unknown` is what a caller that sent no nutrition gets, and a cached row from
      // before this column is exactly that caller. Withholds nothing, which is correct.
      // The category joins the panel here on the same terms: present when the row has one,
      // absent entirely when it does not, so a pre-migration row is byte-identical to the
      // `nutrition: null` this replaced. A cached water keeps its exemption; a cached row
      // from before the column simply is not exempt.
      nutrition: own.nutritionPanel || own.category
        ? {
            sodium: null, addedSugar: null, fiber: null, caffeine: null,
            nutritionPanel: own.nutritionPanel ?? null,
            category: own.category ?? null,
          }
        : null,
      // A row built from a partial panel stays honest about it, so the verdict route
      // still withholds a clean approval it can't support.
      ...(own.confidence === 'low' ? { partialRead: true } : {}),
    };
  }

  let data;
  try {
    const r = await fetch(`${OFF_BASE}/${encodeURIComponent(code)}.json?fields=${OFF_FIELDS}`, {
      headers: UA,
    });
    data = await r.json();
  } catch {
    // Network/parse failure against OFF — treat as "not found" so the client can
    // offer the type-it fallback rather than erroring out the whole scan.
    return { found: false, source: 'none', product: { barcode: code, name: null }, ingredients: '' };
  }

  if (data.status !== 1 || !data.product) {
    return { found: false, source: 'none', product: { barcode: code, name: null }, ingredients: '' };
  }

  // IDENTITY GUARD — the response must be about the code we asked for. OFF echoes
  // the barcode it resolved; a mismatch means we are holding a record for a
  // DIFFERENT product, and rendering it is precisely the chips→creamer failure.
  // An honest miss costs a photo; a confident wrong verdict costs the relationship.
  if (data.code && !sameGtin(data.code, code)) {
    console.warn(`[kristy] OFF answered ${data.code} for ${code} — treating as a miss`);
    return { found: false, source: 'none', product: { barcode: code, name: null }, ingredients: '' };
  }

  const p = data.product;
  const product = productMeta(p, code);
  // ⚠️ **THE CATEGORY RIDES ON `nutrition` BECAUSE THAT IS THE CHANNEL THAT DEMONSTRABLY
  // REACHES THE ENGINE.** `nutritionPanel` gets from here to `evaluateIngredients` by the
  // client echoing this object back to /verdict, and it is proven to work end to end — it is
  // why production reports `nutritionPanel: "absent"` on Sidi Ali today. A second channel
  // would have to be built and proven; this one already carries an input to the same gate.
  //
  // ⚠️ **AND SHIPPING IT ANYWHERE ELSE WOULD REPEAT THE DEFECT THIS FIX EXISTS FOR.**
  // `category` was already being collected correctly, by `categoryFields()` on the retain
  // path, and read by NOTHING — write-only, with the gate it was for unable to see it. Putting
  // it on a field the engine never receives would be the same mistake one layer over.
  //
  // A client that drops the field, or an old build that never knew it, sends no category —
  // which is not exempt, which is today's behaviour. Fails closed by construction.
  const nutrition = { ...nutritionFromOFF(p), category: categoryFromAisle(product.aisle) };

  // 1. Open Food Facts ENGLISH ingredient text (foreign text is rejected here so
  //    it can never reach the engine and produce a false "approved").
  const text = pickEnglishText(p);

  // 1a. TWO LANGUAGES, ONE RECORD. Before the two-lists guard can ask whether the live and
  //     imported fields agree, there is a prior question it cannot ask: is the English field
  //     a translation of what OFF parsed, or a different document filed under an English
  //     name? `ingredients_lc` is what makes that checkable, and nothing here had ever read
  //     it. Same outcome as 1b below, because it is the same situation — two answers on file
  //     — and the shopper is holding the package, so their photo settles it.
  if (languageConflict(p)) {
    recordConflict({
      barcode: code,
      name: product.name,
      brand: product.brand,
      live: String(p.ingredients_text_en || ''),
      imported: String(p.ingredients_text || ''),
      // ⚠️ NO TIERS, AND THE EMPTY ARRAY IS THE HONEST VALUE RATHER THAN A MISSING ONE.
      // `live_tier`/`imported_tier` record what the two lists SCORED, and nothing was scored
      // here — this conflict is decided before any evaluation, and a cross-language tier
      // comparison is the blind test documented on `languageConflict`. Writing a marker like
      // `'language'` into a tier column would put two kinds of thing in one field and break
      // every query that reads the table for a tier distribution. Two null tiers alongside
      // two texts is also what DISTINGUISHES this row from a Heinz-shaped one, which always
      // carries both.
      tiers: [],
    });
    return {
      found: false,
      source: 'conflict',
      product,
      ingredients: '',
      nutrition,
      conflict: true,
      message: CONFLICTING_DATA,
    };
  }

  // 1b. TWO LISTS, ONE PRODUCT. Before trusting the live field, check it against the
  //     raw import. If they would score differently, this record contains two answers
  //     and we cannot tell which one is on the shelf — so Kristy does not guess and
  //     does not stamp. The shopper is holding the package; their photo settles it,
  //     and OFF'S OWN PANEL PHOTO DOES NOT — it is the same disputed record in image
  //     form (verified: the stored Heinz panel is the UK label, and vision read the
  //     wrong recipe straight back out of it).
  const imported = pickImportedText(p);
  if (text && isReadableIngredientList(text) && imported && isReadableIngredientList(imported)) {
    const { agree, tiers } = sameVerdict(text, imported);
    if (!agree) {
      // Logged, never surfaced, and holding no identity — the sample has to grow on
      // real scans before the rule ("prefer the import") can be judged on more than
      // twenty products.
      recordConflict({ barcode: code, name: product.name, brand: product.brand, live: text, imported, tiers });
      return {
        found: false,
        source: 'conflict',
        product,
        ingredients: '',
        nutrition,
        // Its own state: this is not "we don't have it" (we have two of it) and not
        // "your photo was bad" (there was no photo, so `retryPhoto` would put the
        // wrong words on the button). The client asks for a first photo.
        conflict: true,
        message: CONFLICTING_DATA,
      };
    }
  }

  if (text && isReadableIngredientList(text)) {
    // Retain the OFF hit too, not just the vision reads. It costs nothing, and it
    // means the catalog keeps working when OFF is throttling or down — the failure
    // mode that used to read as "not found".
    retainProduct({
      barcode: code,
      name: product.name,
      brand: product.brand,
      ingredients: text,
      source: 'off',
      panel: 'full',
      // ⚠️ THE SAME OMISSION AS `aisle`, ONE FIELD OVER, AND WITH A LIVE FALSE SEAL BEHIND IT.
      // `nutritionFromOFF` has already decided whether this record declares energy, the answer
      // goes out on the response, and it stopped here for want of a column — so the moment a
      // product is cached the barcode door answers `unknown` and the gate that exists to keep
      // the stamp off a bottle of dish soap cannot fire. Retaining it is what makes the gate
      // survive its own self-heal loop. No extra request, no extra field, no model call.
      nutritionPanel: nutrition?.nutritionPanel ?? null,
      // ⚠️ WE HAVE ALWAYS RECEIVED THIS AND ALWAYS THROWN IT AWAY. `aisleFromCategories`
      // turns OFF's `categories_tags` into a human aisle a few lines up, it goes out on the
      // response as `product.aisle`, and it stopped here because there was no column to put
      // it in. It costs nothing — no extra request, no extra field on the fetch, no model
      // call — and it categorises every OFF hit the catalog will ever retain.
      aisle: product.aisle,
    });
    return { found: true, source: 'off', product, ingredients: text, nutrition };
  }

  /* 2. THE OFF PANEL-PHOTO FALLBACK IS DELETED, AND IT WAS NOT A FALLBACK.
        It used to fire here: when OFF had the product but no usable ingredient text,
        it fetched `image_ingredients_url` and ran a vision transcription over it.
        Measured, it earned none of its cost:

          REACH        gated on OFF holding a panel photo — 7 of 17 records that had
                       no ingredient text carried one, so it could not even fire on
                       ~6 in 10 of the exact cases it existed for.
          PRICE        ~3,400ms for the model call plus 440–2,584ms to fetch the image,
                       against a 215ms scan. A 16× step, speculatively.
          FAILURE      the Kirkland panel OFF stores is IN FRENCH. Vision transcribed
                       French, the English guard correctly threw it away, and the 3.4s
                       and the Haiku spend bought nothing.
          AND WORSE    it is not independent evidence. The Heinz panel OFF stores is
                       the UK label. Vision read the wrong recipe straight back out of
                       it — the same bad record laundered through a second modality,
                       arriving at the same false gold seal.

        A photo of the product in the SHOPPER'S hand has none of those properties: right
        market, right pack, right now. Every no-ingredients case falls through to it, as
        it already did whenever this branch failed to fire. */

  // 3. Known product, but nothing readable in English → NO ingredients, NO stamp.
  //    The client auto-pivots to the photograph-the-label path.
  return { found: false, source: 'none', product, ingredients: '', nutrition };
}
