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
//   1. Open Food Facts ingredients text (English preferred) — the fast, free path.
//   2. If OFF knows the product but has no ingredient text, fall back to a vision
//      read of the label image OFF stores (a real photographed panel).
//   3. Otherwise: found but no ingredients (the client offers the label photo).
//
// Every layer returns INGREDIENTS ONLY. A cached hit is not a cached verdict — it
// goes through the same engine + KB + claim lock as a fresh lookup, so the judgment
// is always recomputed against the current KB and the shopper's current preferences.

import { readLabelIngredients } from './labelVision.js';
import { lookupProduct, retainProduct } from './productStore.js';
import { evaluateIngredients } from './verdictEngine.js';
import { recordConflict } from './ingredientConflicts.js';

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
  'image_ingredients_url',
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
  if (en) return en;

  const raw = String(p.ingredients_text || '').trim();
  if (!raw) return '';
  const lang = String(p.lang || p.lc || '').toLowerCase();
  if (lang && lang !== 'en') return ''; // OFF says it's another language → don't trust it
  if (looksNonEnglish(raw)) return ''; // unknown language but clearly foreign
  return raw;
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
  if (en) return en;
  const raw = String(p.ingredients_text_imported || '').trim();
  if (!raw) return '';
  const lang = String(p.lang || p.lc || '').toLowerCase();
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
function aisleFromCategories(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  const last = tags[tags.length - 1] || '';
  return last
    .replace(/^[a-z]{2}:/, '')
    .replace(/-/g, ' ')
    .trim();
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
  return { sodium, addedSugar, fiber, caffeine };
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

async function fetchImageBase64(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) return null;
  const type = (r.headers.get('content-type') || 'image/jpeg').split(';')[0];
  const buf = Buffer.from(await r.arrayBuffer());
  return { base64: buf.toString('base64'), mediaType: type };
}

/**
 * Resolve a barcode to a product + ingredient list.
 * @returns {Promise<{ found:boolean, source:'off'|'vision'|'none', product:object|null, ingredients:string }>}
 *   `ingredients` is a comma-joined string the verdict engine tokenizes; '' when none.
 */
export async function extractFromBarcode(barcode) {
  const code = String(barcode || '').trim();
  if (!code) return { found: false, source: 'none', product: null, ingredients: '' };

  // 0. Kristy's own store first. Free, instant, and it holds exactly the products
  //    the public databases don't. Degrades silently to OFF if unavailable.
  const own = await lookupProduct(code);
  if (own && isReadableIngredientList(own.ingredients) && !looksNonEnglish(own.ingredients)) {
    return {
      found: true,
      source: 'store',
      product: own.product,
      ingredients: own.ingredients,
      nutrition: null,
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
  const nutrition = nutritionFromOFF(p); // sodium + added sugar per 100g (for focuses)

  // 1. Open Food Facts ENGLISH ingredient text (foreign text is rejected here so
  //    it can never reach the engine and produce a false "approved").
  const text = pickEnglishText(p);

  // 1a. TWO LISTS, ONE PRODUCT. Before trusting the live field, check it against the
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
    });
    return { found: true, source: 'off', product, ingredients: text, nutrition };
  }

  // 2. Vision fallback on the label image OFF stores. The transcription must ALSO
  //    clear the English guard — a French panel reads as French just as easily.
  if (p.image_ingredients_url) {
    try {
      const img = await fetchImageBase64(p.image_ingredients_url);
      if (img) {
        const { ingredients, panel } = await readLabelIngredients(img);
        const joined = ingredients.join(', ');
        if (ingredients.length && !looksNonEnglish(joined) && isReadableIngredientList(joined)) {
          // A vision read WITH a barcode is the most valuable row in the catalog:
          // it's a product OFF couldn't answer for, now permanently answerable.
          retainProduct({
            barcode: code,
            name: product.name,
            brand: product.brand,
            ingredients: joined,
            source: 'vision',
            panel,
          });
          // A partial read rides along as such — OFF's stored panel photo can be
          // cropped just like a shopper's, and the unread tail is where a concern
          // hides. The verdict route withholds approval on an incomplete read.
          return {
            found: true,
            source: 'vision',
            product,
            ingredients: joined,
            nutrition,
            ...(panel === 'partial' ? { partialRead: true } : {}),
          };
        }
      }
    } catch {
      /* fall through to no-ingredients */
    }
  }

  // 3. Known product, but nothing readable in English → NO ingredients, NO stamp.
  //    The client auto-pivots to the photograph-the-label path.
  return { found: false, source: 'none', product, ingredients: '', nutrition };
}
