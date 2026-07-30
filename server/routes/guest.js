import { Router } from 'express';
import { generateReply } from '../lib/chatEngine.js';
import { detectMemoryAction } from '../lib/guestGate.js';
import { clientIp, rateLimited, cartBuildLimited } from '../lib/guestRate.js';
import { generateList } from '../lib/list.js';
import { composeListEdit } from '../lib/listCompose.js';
import { sanitizeList, applyCompose, buildCart } from '../lib/cartEdit.js';
import { looksLikePerimeterQuestion, looksLikeCounterQuestion } from '../lib/chatRouting.js';
import { matchEntries, publicEntry, NO_ANSWER } from '../lib/perimeter.js';
import {
  GOAL_VALUES,
  FOCUS_VALUES,
  HARD_LINE_VALUES,
  CONSTRAINT_VALUES,
  migrateGoalSet,
} from '../lib/taxonomy.js';

// POST /api/guest/chat — the "try-first" experience. No auth, no Supabase, no
// persistence of any kind. A brand-new visitor talks to the real Kristy (same
// grocery-coach voice via the shared chatEngine) for a few messages, then hits a
// soft sign-in gate. Nothing here can touch the database or another user's data.
//
// Kristy is a grocery coach — no calories, no macros, no logging, ever.

const router = Router();

/* ───────────────────────── Neutral guest context ─────────────────────────
   Kristy still sounds like herself, but references no stored data — because
   there is none, and no preferences are set yet. This replaces the profile/
   preferences blocks the authed route builds from the database. */
const GUEST_CONTEXT = {
  profileBlock: [
    'This is a brand-new guest trying Kristy for the first time — not signed in.',
    'There is NO saved profile, NO history, and NO goal or preferences on file.',
    'Do not reference any past scans, meals, previous days, or preferences — you have none for this person.',
    'Coach them on exactly what they bring up right now: judge a product, suggest a swap, answer a shopping question, or help them think about what to buy. If it comes up, you can invite them to sign in to set a goal so you can shop with them — but do not force it.',
  ].join('\n'),
  preferencesBlock: 'This guest has not set a goal or preferences yet.',
};

/* ───────────────────────── IP rate limiter ─────────────────────────
   The sliding-window limiter now lives in lib/guestRate.js so guest chat and
   guest verdict (routes/verdict.js) draw from the SAME per-IP budget — a guest
   can't get a fresh pool of free verdicts on top of their free chats. */

router.post('/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // 1. Memory-requiring action? Trip the soft gate instead of answering —
    //    no inference, no cost, doesn't consume the rate limit.
    const memory = detectMemoryAction(message);
    if (memory.gate) {
      return res.json({ gate: true, reason: 'memory', kristyLine: memory.kristyLine });
    }

    // 2. Abuse / cost protection. Over the IP cap → gate with 'limit' so the
    //    client shows the sign-in overlay.
    if (rateLimited(clientIp(req))) {
      return res.json({ gate: true, reason: 'limit' });
    }

    // 3. A COUNTER question is answered from the perimeter KB, not improvised.
    //    /api/chat has done this since Block K; guest chat never did, so a stranger
    //    typing "wild or farmed salmon?" into the composer got the model's own words
    //    where a signed-in user got the sourced entry. The free layer is a
    //    deterministic KB read with no account and no model call, so there is nothing
    //    to gate and nothing to pay for. The entry rides back so the bubble renders
    //    the same reference card as the Counter tab.
    if (looksLikePerimeterQuestion(message)) {
      const matched = matchEntries(message);
      if (matched.length) {
        const top = publicEntry(matched[0]);
        return res.json({
          message: top.short_answer || top.detail || NO_ANSWER,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          perimeter: true,
          perimeterEntry: top,
        });
      }

      // Nothing matched, and the question was unmistakably about the counter →
      // the honest miss, not an improvisation. A stranger is exactly who cannot
      // afford a made-up counter answer: it is the first thing they ever see.
      if (looksLikeCounterQuestion(message)) {
        return res.json({
          message: NO_ANSWER,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          perimeter: true,
          perimeterMiss: true,
          perimeterEntry: null,
        });
      }
    }

    // 4. Real, STATELESS reply — same grocery-coach voice as /api/chat, but with
    //    neutral context and nothing written anywhere.
    const result = await generateReply({
      message,
      conversationHistory,
      contextBlocks: GUEST_CONTEXT,
    });

    return res.json(result);
  } catch (err) {
    // Anthropic / USDA failed. Return a line Kristy could plausibly say so the
    // guest sees a normal chat bubble, not a broken UI. Nothing raw leaks out.
    console.error(
      `[kristy] /api/guest/chat error @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(503).json({
      error: true,
      message: 'That did not connect. Try it again in a moment.',
    });
  }
});

/* ═══════════════ POST /api/guest/list — the onboarding payoff cart ═══════════════
   A stranger finishes onboarding and gets a real, tailored, reasoned cart before
   being asked for anything. No auth, no account, nothing written anywhere — the
   cart goes back in the response and the client keeps it in local state.

   This generates at `premium: true` ON PURPOSE — it is the one-time TASTE. Without
   it the focuses/constraints steps of onboarding would shape nothing and the payoff
   would be a bare goal template. What a stranger tastes here is the paid capability:
   focus-aware picks, constraint-tuned specifics (budget buys the whole chicken,
   short-on-time buys the rotisserie). Everything after this first cart runs on the
   normal free line until they start the trial or subscribe.

   ⚠️ Known and accepted: this endpoint hands full-tailoring generation to any
   unauthenticated caller, so a signed-in FREE user could in principle call it
   directly instead of using their own gated /api/list. It is bounded by a per-IP
   ceiling, costs no model call, and writes nothing. Closing it properly would need
   a device/session identity we deliberately don't collect from strangers.

   The request body is the ONLY input here — there is no account to read prefs from
   — so every value is filtered against the taxonomy before it reaches the
   generator. A client cannot invent a goal, a focus, or a constraint. */
const CUSTOM_LINE = /^kb:[a-z0-9_]{1,64}$/;

function sanitizeGuestPrefs(body) {
  const arr = (v) => (Array.isArray(v) ? v.map((x) => String(x || '').trim()).filter(Boolean) : []);
  const uniq = (a) => [...new Set(a)];

  // Goals are a SET (Block S). Retired goals resolve to goal + constraint at read
  // time, exactly as they do for an account.
  const rawGoals = uniq(arr(body?.coach_goals ?? body?.goals));
  const rawConstraints = uniq(arr(body?.constraints));
  const { goals, constraints } = migrateGoalSet({ goals: rawGoals, constraints: rawConstraints });

  return {
    goals: goals.filter((g) => GOAL_VALUES.includes(g)),
    focuses: uniq(arr(body?.focuses)).filter((f) => FOCUS_VALUES.includes(f)),
    // Presets, plus a custom "kb:<ingredient_id>" line from the KB picker.
    nonNegotiables: uniq(arr(body?.non_negotiables ?? body?.nonNegotiables)).filter(
      (h) => HARD_LINE_VALUES.includes(h) || CUSTOM_LINE.test(h)
    ),
    constraints: constraints.filter((c) => CONSTRAINT_VALUES.includes(c)),
  };
}

router.post('/list', (req, res) => {
  try {
    if (cartBuildLimited(clientIp(req))) {
      return res.status(429).json({
        error: 'rate_limited',
        message: "That's a lot of carts in one hour — give it a minute and try again.",
      });
    }

    const prefs = sanitizeGuestPrefs(req.body || {});
    if (!prefs.goals.length) return res.status(400).json({ error: 'goals_required' });

    const list = generateList({ ...prefs, premium: true });
    return res.json({ list, taste: true, prefs });
  } catch (err) {
    console.error(`[kristy] /api/guest/list error @ ${new Date().toISOString()}:`, err?.message || err);
    return res.status(503).json({
      error: true,
      message: 'That cart did not come together. Try again in a moment.',
    });
  }
});

/* ═══════════ POST /api/guest/list/compose — a stranger builds a cart by talking ═══════════
   The cart starts empty and a sentence fills it. That is the whole flow now, which means
   it cannot require an account: gating it would put a sign-in wall in front of the first
   real thing the product does, and a stranger who cannot answer the opening question has
   no product at all.

   Same claim lock as the authed editor, because it is literally the same code: the model
   may only propose grocery NAMES + sections + a one-line summary, and the add/remove is
   applied deterministically here. Nothing is written anywhere; the cart rides back in the
   response and the client keeps it in guest state until they sign in.

   This one DOES make a model call, so it draws on the shared per-IP inference budget
   (the same pool as guest chat) rather than the free deterministic cart-build bucket. */
router.post('/list/compose', async (req, res) => {
  const instruction = String(req.body?.instruction || '').trim();
  const mode = req.body?.mode === 'edit' ? 'edit' : 'build';
  if (!instruction) return res.status(400).json({ error: 'instruction is required' });

  if (rateLimited(clientIp(req))) {
    return res.status(429).json({
      error: true,
      message: 'That is a lot at once. Give it a minute, or sign in to keep going.',
      gate: true,
      reason: 'limit',
    });
  }

  try {
    // No account to read from, so the prefs ride in the body — and are filtered against
    // the taxonomy before they reach the composer, exactly as /api/guest/list does.
    const prefs = sanitizeGuestPrefs(req.body?.prefs || req.body || {});
    const current = sanitizeList(req.body?.list) || { goal: null, intro: '', items: [] };

    const { add, remove, summary } = await composeListEdit({
      instruction,
      mode,
      currentItems: current.items.map((i) => i.name),
      goal: prefs.goals[0] || null,
      goals: prefs.goals,
      focuses: prefs.focuses,
      hardLines: prefs.nonNegotiables,
      constraints: prefs.constraints,
    });

    const next =
      mode === 'build'
        ? buildCart(current, add, { goal: prefs.goals[0] || null, summary })
        : applyCompose(current, { add, remove });

    return res.json({ list: sanitizeList(next) || next, summary, premium: false, guest: true });
  } catch (err) {
    console.error(`[kristy] /api/guest/list/compose error @ ${new Date().toISOString()}:`, err?.message || err);
    return res.status(503).json({
      error: true,
      message: 'That cart did not come together. Try again in a moment.',
    });
  }
});

export default router;
