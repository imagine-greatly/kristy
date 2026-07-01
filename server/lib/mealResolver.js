// Typed meal resolution — the orchestration that makes typed logging accurate.
//
//   1. Claude (Haiku) parses the sentence into foods + gram weights.
//   2. Each food is looked up in USDA for real per-100g macros and scaled.
//   3. Anything USDA can't find falls back to a Claude per-item estimate.
//   4. Items are summed into authoritative totals + a per-item breakdown.
//
// The conversational reply is generated separately (in chat.js) AROUND these
// totals, so Kristy's wording and the macro card always agree.

import { anthropic, MODEL } from './anthropic.js';
import { MEAL_PARSE_PROMPT, ITEM_ESTIMATE_PROMPT } from './prompts.js';
import { resolveFood } from './usda.js';

const round = (x) => Math.round(Number(x) || 0);
const round1 = (x) => Math.round((Number(x) || 0) * 10) / 10;

// Pull the first {...} object out of a model response, fence-tolerant.
function extractJSON(text) {
  let raw = String(text || '').trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a !== -1 && b !== -1) raw = raw.slice(a, b + 1);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Step 1 — parse a message into { isMeal, items:[{food, grams}] }.
 * Returns { isMeal: false, items: [] } on anything that isn't a food log.
 */
export async function parseMeal(message) {
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: MEAL_PARSE_PROMPT,
    messages: [{ role: 'user', content: String(message || '') }],
  });

  const obj = extractJSON(completion.content?.[0]?.text || '');
  if (!obj || !obj.isMeal || !Array.isArray(obj.items)) {
    return { isMeal: false, items: [] };
  }

  const items = obj.items
    .map((it) => ({
      food: String(it?.food || '').trim(),
      grams: Number(it?.grams),
    }))
    .filter((it) => it.food && Number.isFinite(it.grams) && it.grams > 0)
    .map((it) => ({ food: it.food, grams: round(it.grams) }));

  return { isMeal: items.length > 0, items };
}

/**
 * Fallback — estimate one food's macros for a gram amount when USDA misses.
 * @returns {{calories,protein,carbs,fat}}
 */
export async function estimateItem(food, grams) {
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: ITEM_ESTIMATE_PROMPT,
    messages: [{ role: 'user', content: `${grams}g ${food}` }],
  });

  const obj = extractJSON(completion.content?.[0]?.text || '') || {};
  return {
    calories: round(obj.calories),
    protein: round(obj.protein),
    carbs: round(obj.carbs),
    fat: round(obj.fat),
  };
}

// Scale per-100g USDA macros to a gram amount.
function scale(per100, grams) {
  const f = grams / 100;
  return {
    calories: round((per100.kcal || 0) * f),
    protein: round1((per100.protein || 0) * f),
    carbs: round1((per100.carbs || 0) * f),
    fat: round1((per100.fat || 0) * f),
  };
}

/**
 * Full typed-meal resolution. Returns null when the message isn't a food log
 * (caller then proceeds with the normal conversational path).
 *
 * @returns {{
 *   macros: {calories,protein,carbs,fat},   // integer totals for the card
 *   foods: string[],
 *   breakdown: Array<object>,                // per-item, with source + match info
 *   source: 'usda' | 'estimate'              // 'estimate' if ANY item fell back
 * } | null}
 */
export async function resolveTypedMeal(message) {
  const parsed = await parseMeal(message);
  if (!parsed.isMeal || !parsed.items.length) return null;

  const breakdown = [];
  let anyEstimate = false;

  // Resolve items in parallel — independent USDA lookups / estimates.
  await Promise.all(
    parsed.items.map(async (item, idx) => {
      const grams = item.grams > 0 ? item.grams : 100;
      let entry;
      try {
        const match = await resolveFood(item.food);
        if (match && match.per100) {
          const m = scale(match.per100, grams);
          entry = {
            food: item.food,
            grams,
            source: 'usda',
            fdcId: match.fdcId,
            matchedDescription: match.description,
            dataType: match.dataType,
            ...m,
          };
        } else {
          anyEstimate = true;
          const est = await estimateItem(item.food, grams).catch(() => ({
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
          }));
          entry = { food: item.food, grams, source: 'estimate', ...est };
        }
      } catch {
        anyEstimate = true;
        entry = {
          food: item.food,
          grams,
          source: 'estimate',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        };
      }
      breakdown[idx] = entry;
    })
  );

  const totals = breakdown.reduce(
    (t, b) => ({
      calories: t.calories + (b.calories || 0),
      protein: t.protein + (b.protein || 0),
      carbs: t.carbs + (b.carbs || 0),
      fat: t.fat + (b.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    macros: {
      calories: round(totals.calories),
      protein: round(totals.protein),
      carbs: round(totals.carbs),
      fat: round(totals.fat),
    },
    foods: parsed.items.map((i) => i.food),
    breakdown,
    source: anyEstimate ? 'estimate' : 'usda',
  };
}
