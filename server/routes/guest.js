import { Router } from 'express';
import { resolveMeal, generateReply } from '../lib/chatEngine.js';
import { detectMemoryAction } from '../lib/guestGate.js';

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
   In-memory sliding window — caps Claude + USDA spend from anonymous/bot
   traffic. Good enough for a single instance; swap for a shared store if this
   ever runs multi-process. Only real inference requests consume a slot (cheap
   regex-gated responses do not). */
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 8;
const hits = new Map(); // ip -> number[] (timestamps)

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Returns true when the caller is over the limit. Only records a hit when it
// isn't — so a gated request never counts against a future real message.
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

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
