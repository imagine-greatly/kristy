import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';
import { evaluateIngredients } from '../lib/verdictEngine.js';
import { composeNote } from '../lib/verdictNote.js';

// Kristy's Verdict — POST an ingredient list + the user's goal, get a claim-locked
// verdict. The deterministic Step 1 engine scores the tier and builds the factual
// "universal layer" straight from the KB; then ONE Haiku call (Step 2) composes
// Kristy's goal-aware note + swap. The model may only rephrase KB-sourced concerns —
// the structural claim lock lives in lib/verdictNote.js.
//
//   POST /api/verdict         (authed → personalized note, per-user rate limited)
//   POST /api/guest/verdict   (no auth → universal layer only, no personal note)
//
// Neither writes a meal_log — a scanned product is not an eaten meal. The scan
// entry points (barcode / photo-of-label) parse to an ingredient list and POST here;
// that repointing is Step 4.

// Graceful, Kristy-voiced error for when the note call can't return valid JSON twice.
// (The engine's tier + universal layer are deterministic and never hit this path.)
const ERROR_MSG = "I couldn't pull my read together on that one — give me a second and try again.";

// Coerce the request body into { ingredients, goal, nonNegotiables }. `ingredients`
// may arrive as a string or a string[]; the engine tokenizes either.
function readBody(body = {}) {
  return {
    ingredients: body.ingredients,
    goal: typeof body.goal === 'string' ? body.goal : '',
    nonNegotiables: Array.isArray(body.nonNegotiables)
      ? body.nonNegotiables.map((s) => String(s || '').trim()).filter(Boolean)
      : [],
  };
}

function hasIngredients(ingredients) {
  if (Array.isArray(ingredients)) return ingredients.some((s) => String(s || '').trim());
  return String(ingredients || '').trim().length > 0;
}

// The gold seal is earned only at `approved`; swap is meaningful only when there's
// something to move away from. Both mirror the prompt's own rules, enforced here so
// the response shape is guaranteed regardless of what the model returns.
const swapForTier = (tier, swap) =>
  tier === 'approved' || tier === 'approved_with_note' ? null : swap;

/* ───────────────────────── Authed ───────────────────────── */
export const verdictRouter = Router();

// userRateLimit runs after requireAuth (it reads req.user.id) and caps the
// combined per-user model spend across the authed cost-bearing endpoints.
verdictRouter.post('/verdict', requireAuth, userRateLimit, async (req, res) => {
  const { ingredients, goal, nonNegotiables } = readBody(req.body);
  if (!hasIngredients(ingredients)) {
    return res.status(400).json({ error: 'ingredients is required' });
  }

  try {
    // Step 1 engine — unchanged. Its matched entries feed the model directly; do
    // NOT reshape them here (the claim lock consumes the entries as-is).
    const { tier, stamp, universalLayer, matched } = evaluateIngredients(ingredients);

    // Step 2 — the ONE Haiku call for the personal note + swap.
    const { note, swap } = await composeNote({ tier, goal, nonNegotiables, matched });

    return res.json({ tier, stamp, universalLayer, note, swap: swapForTier(tier, swap) });
  } catch (err) {
    console.error(
      `[kristy] /api/verdict error (user ${req.user.id}) @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(502).json({ error: true, message: ERROR_MSG });
  }
});

/* ───────────────────────── Guest ─────────────────────────
   Guests get the deterministic universal layer for FREE — no model call, no cost —
   which is the generous acquisition hook. The goal-personalized note stays behind
   the sign-in gate (wired in Step 5); here it's simply null. Shares the same
   in-memory IP budget as guest chat (lib/guestRate). */
export const guestVerdictRouter = Router();

guestVerdictRouter.post('/verdict', (req, res) => {
  const { ingredients } = readBody(req.body);
  if (!hasIngredients(ingredients)) {
    return res.status(400).json({ error: 'ingredients is required' });
  }

  // Abuse protection, same soft-gate shape as guest chat so the client can show the
  // sign-in overlay.
  if (rateLimited(clientIp(req))) {
    return res.json({ gate: true, reason: 'limit' });
  }

  const { tier, stamp, universalLayer } = evaluateIngredients(ingredients);
  return res.json({ tier, stamp, universalLayer, note: null, swap: null });
});

export default verdictRouter;
