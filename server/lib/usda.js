// USDA FoodData Central — authoritative macros for typed meal logging.
//
// The pipeline is: Claude parses the sentence into foods + gram quantities
// (keeping its natural-language portion judgment, e.g. "handful of spinach"
// → ~30g), then each food is resolved here to REAL per-100g macros from the
// USDA database and scaled. We never let Claude invent the numbers.
//
// Endpoint (free; key from https://fdc.nal.usda.gov/api-key-signup.html):
//   https://api.nal.usda.gov/fdc/v1/foods/search
//
// Foundation and SR Legacy foods report nutrients per 100g. The search
// endpoint also normalizes Branded foods' foodNutrients to per-100g, but
// Branded items additionally expose a label servingSize — handled below.

const API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';
const DATA_TYPES = 'Foundation,SR Legacy,Branded';
const PAGE_SIZE = 5;

// FDC internal nutrient ids.
const ID = { PROTEIN: '1003', FAT: '1004', CARBS: '1005', ENERGY_KCAL: '1008' };
// Energy can also appear as Atwater factors (Foundation foods) or kJ.
const ENERGY_ATWATER = new Set(['2047', '2048']);
const ENERGY_KJ = '1062';

// Prefer generic, lab-measured foods over brand SKUs for a generic query.
const TYPE_RANK = { Foundation: 0, 'SR Legacy': 1, 'Survey (FNDDS)': 2, Branded: 3 };

// In-memory cache, keyed by the lowercased query string, to cut repeat calls
// within a process. Stores the slimmed result array (possibly empty).
const cache = new Map();

const round = (x) => Math.round(Number(x) || 0);
const round1 = (x) => Math.round((Number(x) || 0) * 10) / 10;

function apiKey() {
  return process.env.USDA_API_KEY || '';
}

/**
 * Search USDA for a food. Returns up to 5 slimmed results
 * ({ fdcId, description, dataType, servingSize, servingSizeUnit, foodNutrients }),
 * or [] on no-match / error / missing key / rate-limit, so the caller can
 * fall back to a Claude estimate.
 */
export async function searchFood(query) {
  const q = String(query || '').trim();
  if (!q) return [];

  const key = q.toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const apiKeyVal = apiKey();
  if (!apiKeyVal) return []; // not configured → behave like a miss (graceful fallback)

  const url =
    `${API_URL}?query=${encodeURIComponent(q)}` +
    `&api_key=${encodeURIComponent(apiKeyVal)}` +
    `&dataType=${encodeURIComponent(DATA_TYPES)}` +
    `&pageSize=${PAGE_SIZE}`;

  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });

    if (r.status === 429) {
      // Rate limited — don't cache; let a later call retry.
      console.warn('[kristy] USDA rate limited');
      return [];
    }
    if (!r.ok) {
      console.warn('[kristy] USDA search failed:', r.status);
      cache.set(key, []); // cache the miss so a bad query isn't retried in a loop
      return [];
    }

    const data = await r.json();
    const foods = Array.isArray(data.foods) ? data.foods : [];
    const slim = foods.slice(0, PAGE_SIZE).map((f) => ({
      fdcId: f.fdcId,
      description: f.description || '',
      dataType: f.dataType || '',
      brand: f.brandName || f.brandOwner || null,
      servingSize: f.servingSize ?? null,
      servingSizeUnit: f.servingSizeUnit ?? null,
      foodNutrients: Array.isArray(f.foodNutrients) ? f.foodNutrients : [],
    }));
    cache.set(key, slim);
    return slim;
  } catch (err) {
    console.error('[kristy] USDA search error:', err.message);
    return [];
  }
}

// Read a nutrient amount by FDC id from a search result's foodNutrients.
// Defensive across both the search shape (nutrientId + value) and the detail
// shape (nutrient.id + amount).
function nutrientById(list, id) {
  for (const n of list) {
    const nid = String(n.nutrientId ?? n.nutrient?.id ?? n.nutrientNumber ?? '');
    if (nid === id) {
      const v = Number(n.value ?? n.amount);
      if (Number.isFinite(v)) return v;
    }
  }
  return null;
}

// Energy in kcal, preferring nutrient 1008, then Atwater factors, then kJ→kcal.
function energyKcal(list) {
  let v = nutrientById(list, ID.ENERGY_KCAL);
  if (v != null) return v;
  for (const n of list) {
    const nid = String(n.nutrientId ?? n.nutrient?.id ?? '');
    const unit = String(n.unitName || n.nutrient?.unitName || '').toUpperCase();
    if (ENERGY_ATWATER.has(nid) && unit === 'KCAL') {
      const val = Number(n.value ?? n.amount);
      if (Number.isFinite(val)) return val;
    }
  }
  const kj = nutrientById(list, ENERGY_KJ);
  if (kj != null) return kj / 4.184;
  return null;
}

/**
 * Extract per-100g macros from a search result.
 * @returns {{kcal,protein,carbs,fat}} per 100g, or null when energy is missing
 *          (treated as "no usable match" so the caller tries the next result).
 */
export function extractMacros(foodItem) {
  if (!foodItem) return null;
  const list = foodItem.foodNutrients || [];

  let kcal = energyKcal(list);
  let protein = nutrientById(list, ID.PROTEIN);
  let carbs = nutrientById(list, ID.CARBS);
  let fat = nutrientById(list, ID.FAT);

  // The search endpoint reports foodNutrients per 100g for every dataType.
  // For Branded items whose values are instead keyed to the label serving,
  // normalize using servingSize when it's a gram/ml amount.
  if (foodItem.dataType === 'Branded' && Number(foodItem.servingSize) > 0) {
    const unit = String(foodItem.servingSizeUnit || '').toLowerCase();
    const grams =
      unit === 'g' || unit === 'ml' ? Number(foodItem.servingSize) : null;
    // Heuristic: a sub-100g serving with implausibly high per-"100g" energy
    // (>900 kcal) is almost certainly per-serving label data — rescale to 100g.
    if (grams && grams !== 100 && kcal != null && kcal > 900) {
      const factor = 100 / grams;
      kcal = kcal * factor;
      if (protein != null) protein *= factor;
      if (carbs != null) carbs *= factor;
      if (fat != null) fat *= factor;
    }
  }

  if (kcal == null) return null; // no energy → unusable

  return {
    kcal: round(kcal),
    protein: round1(protein),
    carbs: round1(carbs),
    fat: round1(fat),
  };
}

// Order results so generic, lab-measured foods win over brand SKUs, while
// preserving USDA's relevance order within a tier (stable sort by index).
function orderByPreference(results) {
  return results
    .map((r, i) => ({ r, i, tier: TYPE_RANK[r.dataType] ?? 5 }))
    .sort((a, b) => a.tier - b.tier || a.i - b.i)
    .map((x) => x.r);
}

/**
 * Resolve a food name to authoritative per-100g macros.
 * Searches USDA, prefers Foundation/SR Legacy over Branded, and returns the
 * first candidate that yields usable macros.
 * @returns {{fdcId,description,dataType,per100:{kcal,protein,carbs,fat}} | null}
 */
export async function resolveFood(query) {
  const results = await searchFood(query);
  if (!results.length) return null;

  for (const f of orderByPreference(results)) {
    const per100 = extractMacros(f);
    if (per100) {
      return {
        fdcId: f.fdcId,
        description: f.description,
        dataType: f.dataType,
        per100,
      };
    }
  }
  return null;
}

// Exposed for tests.
export const _internal = { orderByPreference, energyKcal, nutrientById };
