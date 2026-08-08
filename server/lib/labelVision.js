// Label → ingredients, by vision. The photo-of-label fallback for the scan path:
// one Haiku vision call that TRANSCRIBES the printed ingredient panel and nothing
// more. It reuses the same vision plumbing as lib/verdict.js (anthropic + a strict
// JSON contract + a defensive parse) but produces an ingredient LIST, not a verdict.
//
// Claim-lock note: this call only reads text off a package. It makes no health
// claim and no inference — the claim lock still lives entirely downstream (the
// deterministic engine matches these ingredients to the KB, and the Step 2 note
// may only rephrase what the KB returned). So the fallback cannot smuggle in a
// concern: the worst a misread does is match the wrong KB entry or nothing.

import { anthropic, MODEL } from './anthropic.js';
import { normalizeCategory, UNCATEGORIZED } from './productCategory.js';

const str = (x) => String(x ?? '').trim();
// A number or null. Deliberately not `Number(x) || null` — that maps a legitimate 0
// to null, and deliberately not bare `Number(x)`, which maps '' and null to 0. A
// zero-sugar reading is a real reading; an absent one must never become zero.
const num = (x) => (x === null || x === undefined || x === '' || Number.isNaN(Number(x)) ? null : Number(x));

// INGREDIENTS ONLY, PLUS ONE NUMBER. Kristy's job is what is IN it, not the macros — a
// shopper can read "12g protein" for themselves, and nobody can read "tripotassium
// phosphate". So the nutrition panel is ignored entirely except for total sugars.
//
// THAT ONE EXCEPTION IS THE SEAL GATE. `sugarWithholdsSeal` needs grams to withhold the
// seal from a jam whose second ingredient is sugar, and ingredients alone cannot supply
// it: the label says "sugar" but not how much, and position is the proxy we rejected
// (Cheerios carries sugar third at 3.6 g/100g). Measured over four real panels, asking
// for the number costs +15-20 output tokens and no latency separable from noise — so it
// rides along when legible and is null when not. A missing number degrades honestly:
// no withholding, and no false seal either, because the ingredient engine still runs.
//
// Transcribe-only. Explicitly forbids translation/interpretation so the model
// returns the label verbatim for the engine to tokenize.
//
// IT ALSO NAMES THE PRODUCT'S CATEGORY, and that is a description rather than a judgement.
// "bar", "cereal", "yogurt" is what the package IS — the same class of fact as the brand
// printed on it, and it makes no claim about the food. It is here rather than derived later
// because the photo is not stored (scan.md §8) and the OFF response is not kept, so a row
// retained without one can never be given one: the only moment this is knowable for free is
// while a model is already looking at the package. Cost is the same argument the sugars
// field won on — one short enum value, well under the +15-20 output tokens measured there.
// The value is validated against the closed list in lib/productCategory.js and an
// unrecognized answer collapses to "other"; it is never read as a confident one.
//
// It now also reads the product's IDENTITY (name/brand as printed) and self-reports
// how much of the ingredient panel it could actually read. Both are still pure
// transcription — no judgment, no inference. The identity exists so a vision-read
// product isn't nameless on the card and can be retained by barcode later; the
// legibility report exists because a HALF-READ PANEL IS THE ONE WAY THIS PATH CAN
// LIE — the unread tail is exactly where the seed oil hides, and a missing
// ingredient reads to the engine as an absent concern.
export const LABEL_VISION_SYSTEM = `You are an OCR transcriber for food packaging. You are shown a photo of a packaged food's label — it may be curved, low-light, or partially cropped. Transcribe only what is PRINTED. You do not interpret, judge, rank, or comment on anything, and you never assess whether a food is healthy.

Return five things:

1. "ingredients" — the ingredient list EXACTLY as printed: every ingredient in order, including sub-ingredients in parentheses and any percentages. Do not translate, add, remove, correct, or reorder. Ignore marketing text and allergen "contains" lines. If no ingredient list is legible, return an empty array.

2. "product_name" and "brand" — ONLY if printed and legible in the photo. Transcribe them as printed. If either is not visible or you are unsure, return null for it. Never guess a product or brand from packaging colors, style, or the ingredients themselves.

3. "panel" — how completely you could read the INGREDIENT LIST specifically:
   - "full": the list is legible start to finish, and you can see where it ends (a period, the allergen line, or the next panel).
   - "partial": the list is legible but cut off, obscured, blurred mid-list, or wraps out of frame — you cannot see the end of it.
   - "none": no ingredient list is legible at all.
   Judge this honestly and conservatively. If you are unsure whether you saw the whole list, say "partial". An honest "partial" is always better than a confident guess.

4. "sugars_g" and "serving_g" — from the Nutrition Facts panel, and ONLY if that panel is legible in this same photo: total sugars in grams per serving, and the serving size in grams. Return null for either one you cannot read directly off the label. NEVER estimate, infer, or calculate these from the ingredients — a null is correct and useful, a guess is not. Ignore every other nutrition number; calories, protein, fat and sodium are not wanted.

5. "category" — what KIND of product this is, chosen from this list and nothing else:
bar, cereal, cracker, chip_snack, cookie_sweet_snack, bread, pasta_grain, sauce_condiment, dressing, nut_butter, spread_jam, yogurt, cheese, milk_plant_milk, juice, soda_drink, sports_energy_drink, frozen_meal, canned_protein, canned_vegetable, soup_broth, baking_ingredient, oil_fat, seasoning, supplement, other.
   Judge it from the package in front of you — the product name, the form, the packaging. If none of them fits, return "other"; do not stretch one to fit. This is a description of the product, never a judgement about it.

Return ONLY this JSON: {"product_name": "string or null", "brand": "string or null", "ingredients": ["first ingredient", "second ingredient"], "panel": "full" | "partial" | "none", "sugars_g": number or null, "serving_g": number or null, "category": "one of the listed values"}`;

// Only these three are meaningful; anything else the model invents collapses to the
// safe end. 'partial' is the fallback for an unrecognized value ON PURPOSE — an
// unparseable completeness claim must never be read as "I saw the whole list."
const PANELS = new Set(['full', 'partial', 'none']);

/** Defensive parse of the vision reply — same posture as parseVerdictJSON. */
export function parseIngredientsJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first !== -1 && last !== -1) raw = raw.slice(first, last + 1);
  }
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  const ingredients = Array.isArray(obj.ingredients) ? obj.ingredients.map(str).filter(Boolean) : [];
  const panelRaw = str(obj.panel).toLowerCase();
  const panel = ingredients.length === 0 ? 'none' : PANELS.has(panelRaw) ? panelRaw : 'partial';
  return {
    ingredients,
    // Closed vocabulary, and an unrecognized value becomes `other` rather than null — the
    // same posture as `panel` above. `other` plus the raw string says "we looked and it did
    // not fit"; a null says "nobody looked", and those are different facts.
    category: normalizeCategory(obj.category),
    categoryRaw: str(obj.category) || null,
    // Identity is transcription, not identification: an empty/absent value stays
    // null rather than becoming a guess.
    productName: str(obj.product_name) || null,
    brand: str(obj.brand) || null,
    panel,
    // A number read off the panel, or null. NEVER coerced: `Number('')` is 0 and a
    // zero-sugar claim is a claim, so anything unparseable stays null and the seal
    // gate simply does not fire.
    sugarsG: num(obj.sugars_g),
    servingG: num(obj.serving_g),
  };
}

/**
 * Grams of sugar per 100g, from a per-serving reading — the unit the engine's
 * ADDED_SUGAR_HIGH threshold is expressed in.
 *
 * Both numbers are required and a zero serving size is refused: without the serving
 * weight, "12g of sugar" could be a teaspoon or a tub. Returns null rather than
 * guessing, and null means the gate does not fire — which is the honest degradation,
 * not a silent pass, because the ingredient engine still scores the list.
 */
export function sugarsPer100g({ sugarsG, servingG }) {
  if (!Number.isFinite(sugarsG) || !Number.isFinite(servingG) || servingG <= 0) return null;
  return (sugarsG / servingG) * 100;
}

/**
 * Read a label photo → the printed ingredient list + product identity.
 * @param {{ base64:string, mediaType?:string }} args
 * @returns {Promise<{ ingredients:string[], productName:string|null, brand:string|null,
 *                     panel:'full'|'partial'|'none' }>}
 */
export async function readLabelIngredients({ base64, mediaType = 'image/jpeg' }) {
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: LABEL_VISION_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          {
            type: 'text',
            text: 'Transcribe the ingredient list printed on this label, plus the product name and brand if they are legible, name what kind of product it is from the list, and report how completely you could read the ingredient list.',
          },
        ],
      },
    ],
  });
  const text = completion.content?.[0]?.text || '';
  return (
    parseIngredientsJSON(text) || {
      ingredients: [], productName: null, brand: null, panel: 'none',
      category: UNCATEGORIZED, categoryRaw: null,
    }
  );
}
