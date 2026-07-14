import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { imageUpload } from '../lib/upload.js';
import { getFullProfile, getGoals, saveVerdict } from '../lib/store.js';
import { runVerdict } from '../lib/verdict.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';

// Kristy's Verdict — scan a meal or grocery haul, get a goal-relative verdict
// with teeth, rendered as a shareable card client-side. Two surfaces:
//   POST /api/verdict         (authed → fit against the user's real targets, persisted)
//   POST /api/guest/verdict   (no auth → general read + sign-in hook, nothing written)
// Both reuse the shared image-upload middleware and the shared verdict pipeline.
// Neither writes a meal_log — a scanned haul is not an eaten meal.

// A Kristy-voiced line for when the vision call or JSON parsing fails outright,
// matching the graceful error posture of /api/photo.
const ERROR_MSG = "Couldn't read that one clearly — try another shot, better lit if you can.";

/* ───────────────────────── Authed ───────────────────────── */
export const verdictRouter = Router();

// userRateLimit runs before multer so a limited caller never uploads the file.
verdictRouter.post('/verdict', requireAuth, userRateLimit, imageUpload.single('image'), async (req, res) => {
  const userId = req.user.id;
  if (!req.file) return res.status(400).json({ error: 'image is required' });

  try {
    const base64 = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype || 'image/jpeg';

    // Read the user's real stored profile + macro targets so the fit is against
    // their actual numbers, not invented ones.
    const [profile, goals] = await Promise.all([
      getFullProfile(userId).catch(() => null),
      getGoals(userId).catch(() => null),
    ]);

    const verdict = await runVerdict({ base64, mediaType, isGuest: false, profile, goals });

    // Persist (best-effort — never blocks the response, never creates a meal).
    await saveVerdict(userId, {
      kind: verdict.kind,
      verdict_line: verdict.verdict_line,
      payload: verdict,
    });

    return res.json(verdict);
  } catch (err) {
    console.error(
      `[kristy] /api/verdict error (user ${userId}) @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(500).json({ error: 'verdict failed', message: ERROR_MSG });
  }
});

/* ───────────────────────── Guest ─────────────────────────
   Shares the SAME in-memory IP budget as guest chat (lib/guestRate). Nothing is
   written anywhere. The pipeline appends the sign-in hook to fit.summary. */
export const guestVerdictRouter = Router();

guestVerdictRouter.post('/verdict', imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });

  // Abuse / cost protection — over the shared guest cap → soft gate, same shape
  // as guest chat so the client shows the sign-in overlay.
  if (rateLimited(clientIp(req))) {
    return res.json({ gate: true, reason: 'limit' });
  }

  try {
    const base64 = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype || 'image/jpeg';
    const verdict = await runVerdict({ base64, mediaType, isGuest: true });
    return res.json(verdict);
  } catch (err) {
    console.error(
      `[kristy] /api/guest/verdict error @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(503).json({ error: true, message: ERROR_MSG });
  }
});

export default verdictRouter;
