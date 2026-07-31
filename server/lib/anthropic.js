import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[kristy] ANTHROPIC_API_KEY is not set — AI calls will fail.');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Kristy runs all inference on Haiku.
export const MODEL = 'claude-haiku-4-5-20251001';

// EXCEPT counter card generation, which gets its own model and its own env var.
//
// Every other call in this app REPHRASES content it was handed — a verdict note, a
// perimeter answer, a cart edit — all of them claim-locked to entries the model was
// given. Card generation is the only one that MINTS knowledge: a headline, a do line,
// look_for, watch_out and the aliases that make the card findable, persisted to
// counter_cards and served to every future asker. The cost of a weak generation is not
// one bad reply, it is a bad answer that compounds.
//
// So it is a deliberate, separately tunable choice rather than an inheritance from the
// app-wide constant.
export const COUNTER_GEN_MODEL = process.env.COUNTER_GEN_MODEL || 'claude-sonnet-5';
