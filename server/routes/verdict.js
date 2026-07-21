import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';
import { evaluateIngredients, tokenizeIngredients, genericSwap } from '../lib/verdictEngine.js';
import { composeNote } from '../lib/verdictNote.js';
import { selectCardIsm, ismContext } from '../lib/education.js';
import { premiumForReq, decidePersonalization, FREE_NOTE_LIMIT } from '../lib/subscription.js';
import { getFreeNotesUsed, incrementFreeNotesUsed } from '../lib/store.js';

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
    // Dietary focuses (preferences the user set) + the product's nutrition data
    // (per 100g), both feeding the bounded focus escalation in the engine.
    focuses: Array.isArray(body.focuses)
      ? body.focuses.map((s) => String(s || '').trim()).filter(Boolean)
      : [],
    nutrition: body.nutrition && typeof body.nutrition === 'object' ? body.nutrition : null,
    // The grocery-coach entry restructure: a user without a stored goal scans and
    // gets the universal layer only, with the in-card goal ask where the note would
    // be. The client signals that with personalize:false — no note is composed and
    // NO free "taste" is consumed (the ask is not a personalized read yet).
    personalize: body.personalize !== false,
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

// The withheld read (Task B #3): Kristy holding back her last sentence, not an ad.
// ONE line where the personalized note would be, paired in-card with the upgrade /
// sign-in affordance. Same line for authed-gated and guests — only the CTA differs.
const UPSELL =
  "That's what's in it. Whether it belongs in your cart — that's my read.";
const GUEST_UPSELL = UPSELL;

/* ───────────────────────── Authed ───────────────────────── */
export const verdictRouter = Router();

// userRateLimit runs after requireAuth (it reads req.user.id) and caps the
// combined per-user model spend across the authed cost-bearing endpoints.
verdictRouter.post('/verdict', requireAuth, userRateLimit, async (req, res) => {
  const { ingredients, goal, nonNegotiables, focuses, nutrition, personalize } = readBody(req.body);
  if (!hasIngredients(ingredients)) {
    return res.status(400).json({ error: 'ingredients is required' });
  }

  try {
    const count = tokenizeIngredients(ingredients).length;

    // NO GOAL YET — the grocery-coach entry restructure. The user hasn't told us
    // what they're shopping for, so there's nothing to read a product AGAINST.
    // Return the universal layer + the deterministic nutrition signals (which drive
    // the client's contextual focus offers) and flag needsGoal so the card renders
    // the in-voice goal ask where the note would be. No model call, no note, and —
    // critically — no free "taste" consumed: setting a goal is not itself a read.
    if (!personalize) {
      const { tier, stamp, universalLayer, matched, focus } = evaluateIngredients(ingredients, { nutrition });
      const education = selectCardIsm(ismContext({ matched, tier, ingredientCount: count, focuses: [] }));
      // The generic KB swap (a field read, no model call) is FREE — everyone gets
      // "here's a better shelf." The goal-aware swap stays a member benefit.
      return res.json({
        tier, stamp, universalLayer, note: null, swap: genericSwap(matched, tier), education,
        needsGoal: true, signals: focus.signals, ingredientsRead: count,
      });
    }

    // The repositioned value line (Step 11): the universal layer is ALWAYS free;
    // personalization (goal note + focus escalation) is a member benefit, with the
    // first FREE_NOTE_LIMIT tastes free regardless of trial state. isPremium is
    // provider-agnostic (RevenueCat + Stripe both write the same subscriptions row).
    const premium = await premiumForReq(req);
    const freeNotesUsed = premium ? 0 : await getFreeNotesUsed(req.user.id);
    const { personalized, consumesFree } = decidePersonalization({ premium, freeNotesUsed });

    if (!personalized) {
      // GATED — base engine only (no focus escalation, no note). Universal layer +
      // the education ism stay free; the client shows the upsell in Kristy's voice.
      // Nutrition signals ride along (deterministic, no cost) so the contextual
      // focus offer still works for a goal-set user who's out of free tastes.
      const { tier, stamp, universalLayer, matched, focus } = evaluateIngredients(ingredients, { nutrition });
      const education = selectCardIsm(ismContext({ matched, tier, ingredientCount: count, focuses: [] }));
      return res.json({ tier, stamp, universalLayer, note: null, swap: genericSwap(matched, tier), education, gated: true, upsell: UPSELL, signals: focus.signals, ingredientsRead: count });
    }

    // PERSONALIZED — a member, or one of the free tastes: full focus escalation +
    // the claim-locked Haiku note.
    const { tier, stamp, universalLayer, matched, focus } = evaluateIngredients(ingredients, { focuses, nutrition });
    const { note, swap } = await composeNote({ tier, goal, nonNegotiables, matched, focus });
    const education = selectCardIsm(ismContext({ matched, tier, ingredientCount: count, focuses }));
    if (consumesFree) await incrementFreeNotesUsed(req.user.id);
    const freeTastesLeft = premium ? null : Math.max(0, FREE_NOTE_LIMIT - (freeNotesUsed + (consumesFree ? 1 : 0)));

    return res.json({ tier, stamp, universalLayer, note, swap: swapForTier(tier, swap), focus, signals: focus.signals, education, gated: false, freeTastesLeft, ingredientsRead: count });
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

  const count = tokenizeIngredients(ingredients).length;
  const { tier, stamp, universalLayer, matched } = evaluateIngredients(ingredients);
  const education = selectCardIsm(
    ismContext({ matched, tier, ingredientCount: count, focuses: [] })
  );
  // Same gated shape as the free-authed path so the card surfaces the sign-in nudge
  // where the personalized read would be (the guest scan funnel, M-2). The generic
  // KB swap is free for guests too (field read, no model call).
  return res.json({ tier, stamp, universalLayer, note: null, swap: genericSwap(matched, tier), education, gated: true, upsell: GUEST_UPSELL, ingredientsRead: count });
});

export default verdictRouter;
