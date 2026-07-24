// Shared chat engine — the reply-generation core that BOTH the authed chat
// (/api/chat) and the guest chat (/api/guest/chat) run through.
//
// Kristy is a grocery coach: she never counts or volunteers calories/macros.
// This module runs one inference and then enforces that no-macro rule
// STRUCTURALLY (macroGuard) — the guarantee lives in the code, not the prompt,
// so it holds even if the model slips. There is no macro/meal/weight pipeline
// here anymore; the coach never produces a macro card.

import { anthropic, MODEL } from './anthropic.js';
import { CHAT_SYSTEM_PROMPT } from './prompts.js';
import { parseChatJSON } from './parse.js';
import {
  userAskedAboutMacros,
  volunteeredMacroAccounting,
  stripMacroSentences,
} from './macroGuard.js';

// Coaching JSON is always this shape now — no logging, ever.
const NO_MACROS = { hasFood: false, macros: null, foods: [], insight: '' };

// Sent back to the model when its reply volunteered macro accounting.
const MACRO_CORRECTION =
  "Your previous reply volunteered calorie or macro accounting — Kristy never does that. Rewrite the SAME answer about the food and the shopping (what it is, whether it's worth buying, what to grab instead) with zero calorie, macro, or nutrient math. Keep it specific and in her voice. Same JSON shape.";

// Last-resort line if even a corrected + stripped reply has nothing left.
const SAFE_FALLBACK =
  "Let's keep it on the food — tell me what you're deciding between and I'll give you my straight read.";

async function runOnce(system, messages) {
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 700,
    system,
    messages,
  });
  return parseChatJSON(completion.content?.[0]?.text || '');
}

/**
 * Generate Kristy's coaching reply. The macro guarantee is enforced here, not
 * trusted to the prompt.
 *
 * @param {object} args
 * @param {string} args.message             the current user message
 * @param {Array}  args.conversationHistory prior turns [{role, content}]
 * @param {object} args.contextBlocks       { preferencesBlock, profileBlock }
 * @returns {Promise<{message, hasFood, macros, foods, insight}>}
 */
export async function generateReply({ message, conversationHistory = [], contextBlocks = {} }) {
  const system = CHAT_SYSTEM_PROMPT({ ...contextBlocks });

  const messages = conversationHistory
    .filter((m) => m && m.content)
    .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: String(m.content) }));
  messages.push({ role: 'user', content: message });

  let result = await runOnce(system, messages);

  // Structural no-macro backstop. Kristy never VOLUNTEERS calorie/macro
  // accounting; if the user explicitly asked, a plain answer is allowed and we
  // leave it. Otherwise: regenerate once with a corrective, then — if it still
  // slips — strip the offending sentences deterministically. The guarantee does
  // not depend on the model complying (same doctrine as the claim lock).
  if (!userAskedAboutMacros(message) && volunteeredMacroAccounting(result.message)) {
    let cleaned = result.message;
    try {
      const corrected = await runOnce(system, [
        ...messages,
        { role: 'assistant', content: result.message },
        { role: 'user', content: MACRO_CORRECTION },
      ]);
      cleaned = corrected.message;
    } catch (err) {
      console.error('[kristy] macro-guard retry failed:', err?.message || err);
    }
    if (volunteeredMacroAccounting(cleaned)) cleaned = stripMacroSentences(cleaned);
    result = { ...result, message: cleaned.trim() || SAFE_FALLBACK };
  }

  // The grocery coach never produces a macro card. Unconditional.
  return { message: result.message, ...NO_MACROS };
}
