import { Router } from 'express';
import { resolveMeal, generateReply } from '../lib/chatEngine.js';
import { detectMemoryAction } from '../lib/guestGate.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';

// POST /api/guest/chat — the "try-first" experience. No auth, no Supabase, no
// persistence of any kind. A brand-new visitor talks to the real Kristy (same
// USDA meal pipeline, same voice via the shared chatEngine) for a few messages,
// then hits a soft sign-in gate. Nothing here can touch the database or another
// user's data.

const router = Router();

/* ───────────────────────── Neutral guest context ─────────────────────────
   Kristy still sounds like herself, but references no stored data — because
   there is none. This replaces the profile/history/goals/today/weight blocks
   the authed route builds from the database. */
const GUEST_CONTEXT = {
  profileBlock: [
    'User profile:',
    'This is a brand-new guest trying Kristy for the first time — not signed in.',
    'There is NO saved profile, NO logged history, NO goals, and NO weight on file.',
    'Do not reference any past meals, previous days, targets, remaining macros, or weight trends — you have none of that for this person.',
    'Break down exactly what they tell you right now, in your normal voice. If they mention food, give the macros. If they ask a general nutrition question, answer it specifically.',
  ].join('\n'),
  historyBlock: 'No meals logged — this is a fresh guest session with no history.',
  goalsBlock: 'No personal targets set yet (guest is not signed in).',
  todayBlock: 'Nothing logged yet.',
  weightBlock: '',
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

    // 3. Real, STATELESS reply — same USDA pipeline + Kristy voice as /api/chat,
    //    but with neutral context and nothing written anywhere.
    const mealResolution = await resolveMeal(message);
    const result = await generateReply({
      message,
      conversationHistory,
      contextBlocks: GUEST_CONTEXT,
      mealResolution,
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
      message: "I'm having trouble connecting right now — try that again in a moment.",
    });
  }
});

export default router;
