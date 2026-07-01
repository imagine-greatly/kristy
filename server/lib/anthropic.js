import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[kristy] ANTHROPIC_API_KEY is not set — AI calls will fail.');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Kristy runs all inference on Haiku.
export const MODEL = 'claude-haiku-4-5-20251001';
