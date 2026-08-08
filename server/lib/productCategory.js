// WHAT A PRODUCT *IS* — the field the catalog has never carried, and the one a
// product-level swap cannot be built without.
//
// ⚠️ NOTHING IN THIS REPO KNOWS WHAT KIND OF THING A SCANNED PRODUCT IS. `scanned_products`
// holds barcode, hash, name, brand, ingredients, source, confidence, tier and counters —
// no category column of any kind. `ismContext`'s `categories` look like the answer and are
// not: they are INGREDIENT categories (`seed_oil`, `sugar_alias`, `emulsifier`), which say
// what kind of PROBLEM was found, never what kind of product it was found in.
//
// So "same category, better version" — a bad bar swaps for a good bar, never for steak —
// has no field to stand on. That ruling is in CLAUDE.md; this is the field it needs.
//
// ⚠️ THE URGENCY IS ONE-DIRECTIONAL AND IT IS THE WHOLE REASON THIS LANDS BEFORE THE
// FEATURE. Adding the column costs one migration today. **A row retained without a
// category cannot be given one later**: the panel photo is gone (nothing is stored, by
// rule), the OFF response is not kept, and re-deriving it would mean re-fetching or
// re-reading every product in the catalog. Every scan between now and the column existing
// is a row that can never answer "what else is this".
//
// ── THE VOCABULARY IS CLOSED **AND** THE RAW STRING IS KEPT. Both, deliberately. ────────
//
// A free string fragments: `protein bar`, `energy bar`, `snack bar` and `nutrition bar` are
// four categories to a `group by` and one category to a shopper, and a swap engine that
// cannot group them suggests nothing. A closed list alone is worse in the other direction:
// it will miss things, and the model has no way to say so — it picks the least-wrong option
// and the loss is silent, which is this repo's most expensive failure shape.
//
// Keeping both makes the list CORRECTABLE. Everything that lands in `other` keeps what the
// source actually said in `category_raw`, so the misses are visible and frequency-rankable
// — the same argument `counter_gaps` makes for the counter's authoring backlog, and the
// same reason `coverageStats.fromVision` is counted rather than assumed. Without the raw
// column, discovering in a year that a third of the catalog is `other` tells you nothing
// about what it should have been.

/* The closed vocabulary. Sized to the aisles a SCAN actually reaches — the labeled half of
   the store. The counter's unlabeled half is `kristy_perimeter_kb.json`'s job and has its
   own sections; a barcode never points at a fish counter.

   ⚠️ WIDENED DELIBERATELY, LIKE `IMPERATIVE_VERBS` AND THE STATE-WORD LIST. Adding a value
   is an act with a reason attached, not a heuristic that grows on its own. The evidence for
   widening is `category_raw` on rows that landed in `other`, which is exactly what that
   column is for. Do not add a value because it sounds missing; add it because rows are
   sitting in `other` asking for it. */
export const PRODUCT_CATEGORIES = [
  'bar',
  'cereal',
  'cracker',
  'chip_snack',
  'cookie_sweet_snack',
  'bread',
  'pasta_grain',
  'sauce_condiment',
  'dressing',
  'nut_butter',
  'spread_jam',
  'yogurt',
  'cheese',
  'milk_plant_milk',
  'juice',
  'soda_drink',
  'sports_energy_drink',
  'frozen_meal',
  'canned_protein',
  'canned_vegetable',
  'soup_broth',
  'baking_ingredient',
  'oil_fat',
  'seasoning',
  'supplement',
  // The escape, and it is a real answer rather than a failure. A product that does not fit
  // is recorded as not fitting, with `category_raw` saying what it actually was.
  'other',
];

const CATEGORY_SET = new Set(PRODUCT_CATEGORIES);

/** The value a caller may not accidentally skip past. */
export const UNCATEGORIZED = 'other';

/**
 * Validate a category against the closed list.
 *
 * ⚠️ **AN UNRECOGNIZED VALUE COLLAPSES TO `other`, NEVER TO NULL AND NEVER TO A GUESS.**
 * Same posture as `PANELS` in `labelVision.js`: an unparseable answer must never be read as
 * a confident one. `other` plus the raw string is strictly more informative than a null,
 * because it says "we looked and it did not fit" rather than "nobody looked".
 */
export function normalizeCategory(value) {
  const raw = String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return CATEGORY_SET.has(raw) ? raw : UNCATEGORIZED;
}

/* ── OPEN FOOD FACTS ALREADY TELLS US, AND WE HAVE BEEN THROWING IT AWAY ────────────────
   `scanExtract.js:177` turns `categories_tags` into a human aisle — `en:breakfast-cereals`
   becomes `breakfast cereals` — puts it on the response as `product.aisle`, and then
   `retainProduct` drops it on the floor because there was no column. It is derived, it is
   free, it costs one more field on a call already being made, and it applies to every OFF
   hit the catalog has ever retained.

   Matched by SUBSTRING against the aisle string, longest pattern first, because OFF's tags
   are compound ("plant-based-foods-and-beverages, cereals-and-potatoes, breakfast-cereals")
   and the last tag is the most specific — which is the one `aisleFromCategories` already
   picks. A miss is `other` with the raw aisle kept, exactly like the vision path. */
const OFF_AISLE_PATTERNS = [
  ['sports_energy_drink', ['energy drink', 'sports drink', 'isotonic']],
  ['soda_drink', ['soda', 'sodas', 'carbonated drink', 'cola', 'soft drink']],
  ['juice', ['juice', 'nectar']],
  ['milk_plant_milk', ['milk', 'plant-based milk', 'plant milk', 'creamer']],
  ['yogurt', ['yogurt', 'yoghurt', 'kefir', 'skyr']],
  ['cheese', ['cheese']],
  ['nut_butter', ['nut butter', 'peanut butter', 'almond butter', 'tahini']],
  ['spread_jam', ['jam', 'jelly', 'marmalade', 'spread', 'honey']],
  ['cereal', ['breakfast cereal', 'cereal', 'granola', 'muesli', 'oatmeal', 'porridge']],
  ['bar', ['bar', 'bars']],
  ['cracker', ['cracker', 'crispbread']],
  ['chip_snack', ['chip', 'crisps', 'popcorn', 'pretzel', 'tortilla chip', 'puff']],
  ['cookie_sweet_snack', ['cookie', 'biscuit', 'candy', 'chocolate', 'confection', 'sweet snack']],
  ['bread', ['bread', 'loaf', 'tortilla', 'bagel', 'bun', 'pita']],
  ['pasta_grain', ['pasta', 'rice', 'noodle', 'grain', 'couscous', 'quinoa']],
  ['dressing', ['dressing', 'vinaigrette']],
  ['sauce_condiment', ['sauce', 'ketchup', 'mustard', 'mayonnaise', 'salsa', 'condiment']],
  ['soup_broth', ['soup', 'broth', 'stock', 'bouillon']],
  ['canned_protein', ['canned fish', 'tuna', 'sardine', 'canned meat', 'canned bean', 'legume']],
  ['canned_vegetable', ['canned vegetable', 'canned tomato', 'tinned vegetable']],
  ['frozen_meal', ['frozen meal', 'ready meal', 'pizza', 'frozen dinner']],
  ['oil_fat', ['oil', 'butter', 'margarine', 'ghee', 'fat']],
  ['baking_ingredient', ['flour', 'sugar', 'baking', 'yeast', 'cocoa powder']],
  ['seasoning', ['spice', 'seasoning', 'herb', 'salt']],
  ['supplement', ['supplement', 'vitamin', 'protein powder']],
];

/**
 * Map an OFF aisle string onto the closed vocabulary.
 *
 * ⚠️ **ORDER IS SIGNIFICANT AND IS NOT ALPHABETICAL.** The list is read top to bottom and
 * the first hit wins, so the specific sits above the generic it would otherwise be eaten
 * by: `energy drink` before `soda`, `nut butter` before `butter` in `oil_fat`, `breakfast
 * cereal` before `bar`. Re-sorting this list changes what it returns — the same trap as
 * the KB's exact/longest-first alias priority, and it is written down here because a tidy
 * alphabetical sort is exactly the well-meaning edit that would break it silently.
 */
export function categoryFromAisle(aisle) {
  const text = String(aisle ?? '').trim().toLowerCase();
  if (!text) return UNCATEGORIZED;
  for (const [category, patterns] of OFF_AISLE_PATTERNS) {
    if (patterns.some((p) => text.includes(p))) return category;
  }
  return UNCATEGORIZED;
}

/**
 * What gets written, from whichever door answered.
 *
 * Returns both halves together so no call site can store one without the other — the raw
 * string is what makes `other` diagnosable, and a row with `category: 'other'` and no raw
 * is the silent loss this whole file exists to prevent.
 */
export function categoryFields({ category = null, aisle = null } = {}) {
  const rawSource = String(category ?? aisle ?? '').trim();
  return {
    category: category ? normalizeCategory(category) : categoryFromAisle(aisle),
    // Capped: this is free text from a model or a third-party database and it is going in a
    // column, so it gets the same treatment `counter_gaps` gives a stranger's question.
    category_raw: rawSource ? rawSource.slice(0, 120) : null,
  };
}
