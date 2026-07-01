// Shared chat engine — the meal-resolution + reply-generation core that BOTH
// the authed chat (/api/chat) and the guest chat (/api/guest/chat) run through.
//
// Everything stateless lives here: resolve a typed meal against USDA, inject the
// real totals into Kristy's system prompt, run inference, and override the macro
// card with the authoritative database numbers. The authed route wraps this with
// context-gathering + persistence; the guest route wraps it with neutral context
// and no persistence. Neither duplicates the pipeline.

import { anthropic, MODEL } from './anthropic.js';
import { CHAT_SYSTEM_PROMPT } from './prompts.js';
import { parseChatJSON } from './parse.js';
import { resolveTypedMeal } from './mealResolver.js';

/**
 * The resolved-meal block injected into the system prompt: real USDA totals +
 * per-item breakdown, so Kristy's reply is built around true numbers.
 */
export function buildMealEvent(resolution) {
  const m = resolution.macros;
  const lines = [
    `Total: ${m.calories} cal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fat}g fat.`,
    'Items:',
    ...resolution.breakdown.map((b) => {
      const tag = b.source === 'estimate' ? ' (estimated — USDA had no match)' : '';
      return `- ${b.grams}g ${b.food}: ${b.calories} cal, ${b.protein}g protein${tag}`;
    }),
  ];
  if (resolution.source === 'estimate') {
    lines.push('Some items were estimated — it is fine to say "roughly" about the total.');
  }
  lines.push(
    'Respond with hasFood: true and put these EXACT totals in your macros field. Protein first, in your voice.'
  );
  return lines.join('\n');
}

/**
 * Run the typed-meal resolver, degrading gracefully to null (the old
 * single-call behavior where Haiku estimates macros itself) on any failure.
 */
export async function resolveMeal(message) {
  try {
    return await resolveTypedMeal(message);
  } catch (err) {
    console.error('[kristy] meal resolution error:', err.message);
    return null;
  }
}

/**
 * Generate Kristy's reply around real (or, on fallback, estimated) macros.
 *
 * @param {object}   args
 * @param {string}   args.message              the current user message
 * @param {Array}    args.conversationHistory   prior turns [{role, content}]
 * @param {object}   args.contextBlocks         { profileBlock, historyBlock, goalsBlock, todayBlock, weightBlock }
 * @param {object|null} args.mealResolution     result of resolveMeal(), or null
 * @param {string}   args.weightEvent           optional weight-log event block (authed only)
 * @returns {Promise<{message, hasFood, macros, foods, insight}>}
 */
export async function generateReply({
  message,
  conversationHistory = [],
  contextBlocks,
  mealResolution = null,
  weightEvent = '',
}) {
  const system = CHAT_SYSTEM_PROMPT({
    ...contextBlocks,
    weightEvent,
    mealEvent: mealResolution ? buildMealEvent(mealResolution) : '',
  });

  // Build the message thread for Haiku.
  const messages = conversationHistory
    .filter((m) => m && m.content)
    .map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: String(m.content),
    }));
  messages.push({ role: 'user', content: message });

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system,
    messages,
  });

  const text = completion.content?.[0]?.text || '';
  const result = parseChatJSON(text);

  // When USDA resolved the meal, its totals are authoritative — override
  // whatever Haiku echoed so the macro card always shows real database numbers
  // (and the message, built around the same numbers, matches).
  if (mealResolution) {
    result.hasFood = true;
    result.macros = mealResolution.macros;
    result.foods = mealResolution.foods;
  }

  return result;
}
