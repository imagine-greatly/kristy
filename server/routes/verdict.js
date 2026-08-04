import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';
import { evaluateIngredients, tokenizeIngredients, genericSwap } from '../lib/verdictEngine.js';
import { looksNonEnglish, isReadableIngredientList } from '../lib/scanExtract.js';
import { composeNote } from '../lib/verdictNote.js';
import { selectCardIsm, ismContext } from '../lib/education.js';
import { premiumForReq, decidePersonalization, FREE_NOTE_LIMIT } from '../lib/subscription.js';
import { getFreeNotesUsed, incrementFreeNotesUsed } from '../lib/store.js';
import { stampTier } from '../lib/productStore.js';

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
const ERROR_MSG = "I couldn’t pull my read together on that one — give me a second and try again.";

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
    // The shopper's circumstances (Constraints). They inform the note's emphasis + swap
    // only; they are deliberately NOT passed to the engine, so a constraint can never
    // move a tier or restore the seal.
    constraints: Array.isArray(body.constraints)
      ? body.constraints.map((s) => String(s || '').trim()).filter(Boolean)
      : [],
    nutrition: body.nutrition && typeof body.nutrition === 'object' ? body.nutrition : null,
    // The grocery-coach entry restructure: a user without a stored goal scans and
    // gets the universal layer only, with the in-card goal ask where the note would
    // be. The client signals that with personalize:false — no note is composed and
    // NO free "taste" is consumed (the ask is not a personalized read yet).
    personalize: body.personalize !== false,
    // Did we read the WHOLE ingredient list? The label-photo path sends false when
    // vision reported a cut-off / partly-obscured panel. Defaults true so every
    // existing caller (and the barcode path) is unaffected.
    readComplete: body.readComplete !== false,
    // RETENTION ONLY. The barcode is echoed back so the tier this scan produced can
    // be stamped onto Kristy's own product row for later curation. It is deliberately
    // NOT read by anything that judges: the verdict comes from `ingredients` alone,
    // so a wrong or forged barcode here cannot change a single word of the read.
    barcode: typeof body.barcode === 'string' ? body.barcode.trim() : '',
  };
}

/* An incomplete label read may not produce a CLEAN APPROVAL.
   The asymmetry is the entire point, and it's why a partial read is still worth
   showing: a half-read ingredient list can never falsely FLAG anything — every
   entry in `matched` was really printed on that panel — but it can absolutely
   falsely APPROVE, because the tail she couldn't read is exactly where the canola
   oil hides. So concerns found on a partial read STAND, and only `approved` — the
   one tier that asserts "there is nothing in here to flag" — is withheld.
   The card then asks for a cleaner shot instead of showing an unearned seal.

   Additive decoration at the route: the engine's output shape is untouched
   (non-negotiable #5), and the stamp still only ever renders on a real `approved`
   (non-negotiable #4). */
export function guardIncompleteRead(payload, readComplete) {
  if (readComplete || payload.tier !== 'approved') return payload;
  return { ...payload, stamp: false, incompleteRead: true };
}

/* Send the verdict — and, fire-and-forget, stamp the tier onto Kristy's own product
   row so the catalog carries the provenance of what each product scored. Never
   awaited: retention is a background asset and must not delay the read the shopper
   is waiting on. The tier written is the one the ENGINE just computed, not anything
   the client sent. */
function send(res, payload, { readComplete, barcode }) {
  const out = guardIncompleteRead(payload, readComplete);
  if (barcode) stampTier(barcode, out.tier);
  return res.json(out);
}

function hasIngredients(ingredients) {
  if (Array.isArray(ingredients)) return ingredients.some((s) => String(s || '').trim());
  return String(ingredients || '').trim().length > 0;
}

/* THE GUARDS BELONG TO THE ENDPOINT, NOT TO ONE CALLER.
   `looksNonEnglish` and `isReadableIngredientList` existed only inside scanExtract, so
   they protected the barcode path and nothing else. But the tier is computed from
   `ingredients` alone and ZERO MATCHES SCORES AS `approved` — so any string the KB
   cannot read is a gold seal. A French panel matches nothing. "n/a" matches nothing.
   Neither is a clean product; both were a stamp.

   /api/guest/verdict is public and unauthenticated, which made that a reachable path
   rather than a theoretical one. The guards move here so every caller clears them,
   including a client we did not write — the Swift one included. */
export function unreadable(ingredients) {
  const joined = Array.isArray(ingredients) ? ingredients.join(', ') : String(ingredients || '');
  if (!isReadableIngredientList(joined)) return 'placeholder';
  if (looksNonEnglish(joined)) return 'language';
  return null;
}

// Kristy-voiced, and it does not pretend to a verdict it cannot reach.
const UNREADABLE_MSG = "Nothing readable in that ingredient list. Photograph the panel instead.";

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
  const { ingredients, goal, nonNegotiables, focuses, constraints, nutrition, personalize, readComplete, barcode } = readBody(req.body);
  if (!hasIngredients(ingredients)) {
    return res.status(400).json({ error: 'ingredients is required' });
  }
  if (unreadable(ingredients)) {
    return res.status(422).json({ error: true, unreadable: true, message: UNREADABLE_MSG });
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
      const { tier, stamp, universalLayer, affirmationLayer, affirmed, matched, focus, hardLines, approvedRead, sugarHeavy } = evaluateIngredients(ingredients, { nutrition, hardLines: nonNegotiables });
      const education = selectCardIsm(ismContext({ matched, tier, ingredientCount: count, focuses: [] }));
      // The generic KB swap (a field read, no model call) is FREE — everyone gets
      // "here's a better shelf." The goal-aware swap stays a member benefit.
      return send(res, {
        tier, stamp, universalLayer, affirmationLayer, note: null, swap: genericSwap(matched, tier), education,
        needsGoal: true, signals: focus.signals, ingredientsRead: count, hardLines, approvedRead, sugarHeavy,
      }, { readComplete, barcode });
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
      // Hard lines still apply: they're a deterministic KB match with no model
      // call, and a line the user drew is a promise, not a member benefit.
      const { tier, stamp, universalLayer, affirmationLayer, affirmed, matched, focus, hardLines, approvedRead, sugarHeavy } = evaluateIngredients(ingredients, { nutrition, hardLines: nonNegotiables });
      const education = selectCardIsm(ismContext({ matched, tier, ingredientCount: count, focuses: [] }));
      return send(res, { tier, stamp, universalLayer, affirmationLayer, note: null, swap: genericSwap(matched, tier), education, gated: true, upsell: UPSELL, signals: focus.signals, ingredientsRead: count, hardLines, approvedRead, sugarHeavy }, { readComplete, barcode });
    }

    // PERSONALIZED — a member, or one of the free tastes: full focus escalation +
    // the claim-locked Haiku note.
    const { tier, stamp, universalLayer, affirmationLayer, affirmed, matched, focus, hardLines, approvedRead, sugarHeavy } = evaluateIngredients(ingredients, { focuses, nutrition, hardLines: nonNegotiables });
    /* APPROVED COMPOSES NOTHING, AND THAT IS THE FIX.
       With zero matched entries the model had nothing to rephrase, so it wrote the same
       sentence every time: eight of ten approved products came back with "This one is
       clean. No industrial additives, no processing tricks — just real food," varying
       only the closer. That is a claim the engine cannot support (approved means nothing
       MATCHED, and the KB is 74 entries) dressed as a personalized read.

       `approvedRead` replaces it with what was actually checked and what is actually in
       the product, straight off the label. So this branch skips the model call entirely:
       the commonest tier gets faster, costs nothing, and CANNOT SPEND A FREE TASTE —
       charging one of three tastes for a template was the part that made it indefensible. */
    const skipNote = tier === 'approved';
    const { note, swap } = skipNote
      ? { note: null, swap: null }
      : await composeNote({ tier, goal, nonNegotiables, constraints, matched, affirmed, focus, hardLines });
    const education = selectCardIsm(ismContext({ matched, tier, ingredientCount: count, focuses }));
    if (consumesFree && !skipNote) await incrementFreeNotesUsed(req.user.id);
    const freeTastesLeft = premium
      ? null
      : Math.max(0, FREE_NOTE_LIMIT - (freeNotesUsed + (consumesFree && !skipNote ? 1 : 0)));

    return send(res, { tier, stamp, universalLayer, affirmationLayer, note, swap: swapForTier(tier, swap), focus, signals: focus.signals, education, gated: false, freeTastesLeft, ingredientsRead: count, hardLines, approvedRead, sugarHeavy }, { readComplete, barcode });
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
  const { ingredients, readComplete, barcode, nonNegotiables, nutrition } = readBody(req.body);
  if (!hasIngredients(ingredients)) {
    return res.status(400).json({ error: 'ingredients is required' });
  }
  // The public one. This is the path that made the guards' absence reachable.
  if (unreadable(ingredients)) {
    return res.status(422).json({ error: true, unreadable: true, message: UNREADABLE_MSG });
  }

  // Abuse protection, same soft-gate shape as guest chat so the client can show the
  // sign-in overlay.
  if (rateLimited(clientIp(req))) {
    return res.json({ gate: true, reason: 'limit' });
  }

  const count = tokenizeIngredients(ingredients).length;
  // A stranger HAS declared lines now (onboarding runs before any account exists), so
  // ignoring them here would let a product they refuse come back with the seal on.
  // A hard line is a refusal, not a personalization luxury — it applies on every tier,
  // and it costs nothing: resolving one is a KB read, no model call. The values are
  // filtered against the taxonomy inside resolveHardLines, and an unknown string is
  // dropped, so a guest body can only ever name a line that already exists.
  // Nutrition rides the guest path too. The added-sugar seal gate is deterministic and
  // costs nothing, and without it the SAME PRODUCT would carry the seal for a guest and
  // not for a member — the one thing a seal can never do is mean two things.
  const { tier, stamp, universalLayer, affirmationLayer, affirmed, matched, hardLines, approvedRead, sugarHeavy } =
    evaluateIngredients(ingredients, { nutrition, hardLines: nonNegotiables });
  const education = selectCardIsm(
    ismContext({ matched, tier, ingredientCount: count, focuses: [] })
  );
  // Same gated shape as the free-authed path so the card surfaces the sign-in nudge
  // where the personalized read would be (the guest scan funnel, M-2). The generic
  // KB swap is free for guests too (field read, no model call).
  return send(res, { tier, stamp, universalLayer, affirmationLayer, hardLines, note: null, swap: genericSwap(matched, tier), education, gated: true, upsell: GUEST_UPSELL, ingredientsRead: count, approvedRead, sugarHeavy }, { readComplete, barcode });
});

export default verdictRouter;
