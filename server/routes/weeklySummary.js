import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import {
  generateWeeklySummaryForUser,
  generateAllWeeklySummaries,
} from '../lib/weekly.js';

const router = Router();

// POST /api/weekly-summary
// - Authenticated user → generates just their own summary (handy for testing).
// - With header `x-cron-secret` matching CRON_SECRET → runs for all users.
router.post('/weekly-summary', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const provided = req.headers['x-cron-secret'];

  if (cronSecret && provided === cronSecret) {
    const made = await generateAllWeeklySummaries();
    return res.json({ ok: true, generated: made });
  }

  // Otherwise require a logged-in user and only do theirs.
  return requireAuth(req, res, async () => {
    try {
      const row = await generateWeeklySummaryForUser(req.user.id);
      return res.json({ ok: true, summary: row });
    } catch (err) {
      console.error('[kristy] /api/weekly-summary error:', err.message);
      return res.status(500).json({ error: 'Could not generate summary.' });
    }
  });
});

export default router;
