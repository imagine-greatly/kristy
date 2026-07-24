import { Router } from 'express';
import { generateReply } from '../lib/chatEngine.js';
import { detectMemoryAction } from '../lib/guestGate.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';

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

    // 3. Real, STATELESS reply — same grocery-coach voice as /api/chat, but with
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
      message: "I'm having trouble connecting right now — try that again in a moment.",
    });
  }
});

export default router;
