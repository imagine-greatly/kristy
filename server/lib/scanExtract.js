// Scan → ingredient list. The extraction half of the repointed scan path: given a
// barcode (or a label photo, handled in routes/scan.js), produce the product's
// ingredient string + display meta. The verdict itself is NOT computed here — the
// caller POSTs the ingredients to /verdict, which owns the engine + claim-locked
// note. This module only ANSWERS "what's in it and what is it?".
//
// Order of resolution for a barcode:
//   1. Open Food Facts ingredients text (English preferred) — the fast, free path.
//   2. If OFF knows the product but has no ingredient text, fall back to a vision
//      read of the label image OFF stores (a real photographed panel).
//   3. Otherwise: found but no ingredients (the client offers "type the product").

import { readLabelIngredients } from './labelVision.js';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_FIELDS = [
  'product_name',
  'product_name_en',
  'generic_name',
  'brands',
  'categories_tags',
  'ingredients_text_en',
  'ingredients_text',
  'image_front_url',
  'image_url',
  'image_ingredients_url',
].join(',');

const UA = { 'User-Agent': 'Kristy/1.0 (grocery coach; nutrition app)' };

// OFF categories_tags → a short human aisle/type ("en:breakfast-cereals" → "breakfast cereals").
function aisleFromCategories(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  const last = tags[tags.length - 1] || '';
  return last
    .replace(/^[a-z]{2}:/, '')
    .replace(/-/g, ' ')
    .trim();
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

  const p = data.product;
  const product = productMeta(p, code);

  // 1. Open Food Facts ingredient text (English preferred).
  const text = String(p.ingredients_text_en || p.ingredients_text || '').trim();
  if (text) return { found: true, source: 'off', product, ingredients: text };

  // 2. Vision fallback on the label image OFF stores.
  if (p.image_ingredients_url) {
    try {
      const img = await fetchImageBase64(p.image_ingredients_url);
      if (img) {
        const { ingredients } = await readLabelIngredients(img);
        if (ingredients.length) {
          return { found: true, source: 'vision', product, ingredients: ingredients.join(', ') };
        }
      }
    } catch {
      /* fall through to no-ingredients */
    }
  }

  // 3. Known product, but we couldn't read ingredients anywhere.
  return { found: true, source: 'none', product, ingredients: '' };
}
