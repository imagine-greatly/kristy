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

const str = (x) => String(x ?? '').trim();

// Transcribe-only. Explicitly forbids translation/interpretation so the model
// returns the label verbatim for the engine to tokenize.
export const LABEL_VISION_SYSTEM = `You are an OCR transcriber for food packaging. You are shown a photo of a packaged food's INGREDIENTS panel — it may be curved, low-light, or partially cropped. Transcribe the ingredient list EXACTLY as printed: every ingredient in order, including sub-ingredients in parentheses and any percentages. Do not translate, interpret, add, remove, correct, rank, or comment on anything. Ignore nutrition-facts numbers, marketing text, and allergen "contains" lines. If no ingredient list is legible, return an empty array.

Return ONLY this JSON: {"ingredients": ["first ingredient", "second ingredient"]}`;

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
  return { ingredients };
}

/**
 * Read a label photo → an ingredient list.
 * @param {{ base64:string, mediaType?:string }} args
 * @returns {Promise<{ ingredients: string[] }>}  Empty array when nothing legible.
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
          { type: 'text', text: 'Transcribe the ingredient list printed on this label.' },
        ],
      },
    ],
  });
  const text = completion.content?.[0]?.text || '';
  return parseIngredientsJSON(text) || { ingredients: [] };
}
