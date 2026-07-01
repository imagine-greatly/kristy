import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { getFullProfile, getWeightHistory } from '../lib/store.js';
import {
  saveWeightLog,
  getWeightTrend,
  shouldRecalculateTDEE,
  recalculateTDEEFromTrend,
} from '../lib/weightLog.js';

const router = Router();

// POST /api/weight  { weight_value, weight_unit }
// Saves the weigh-in, recomputes the trend, and retunes the calorie target
// when enough data has accrued. Mirrors the work the chat pipeline does when
// it detects a weight log inline.
router.post('/weight', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { weight_value, weight_unit = 'lbs' } = req.body || {};

  const value = Number(weight_value);
  if (!Number.isFinite(value) || value <= 0) {
    return res.status(400).json({ error: 'weight_value is required' });
  }
  const unit = weight_unit === 'kg' ? 'kg' : 'lbs';

  try {
    const saved = await saveWeightLog(userId, value, unit);
    const trend = await getWeightTrend(userId, 30);

    let recalculated = null;
    if (await shouldRecalculateTDEE(userId)) {
      const profile = await getFullProfile(userId);
      recalculated = await recalculateTDEEFromTrend(userId, trend, {
        calories: profile.calories,
      });
    }

    return res.json({
      saved: { value, unit, logged_at: saved.logged_at },
      trend: {
        trend: trend.trend,
        totalChange: trend.totalChange ?? null,
        weeklyRate: trend.weeklyRate ?? null,
        daysElapsed: trend.daysElapsed ?? null,
      },
      recalculated,
    });
  } catch (err) {
    console.error('[kristy] /api/weight error:', err.message);
    return res.status(500).json({ error: 'Could not save your weight.' });
  }
});

// GET /api/weight/history — last 90 days of weigh-ins, oldest → newest.
router.get('/weight/history', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await getWeightHistory(userId, 90);
    return res.json(
      rows.map((r) => ({
        logged_at: r.logged_at,
        weight_value: r.weight_value,
        weight_unit: r.weight_unit,
      }))
    );
  } catch (err) {
    console.error('[kristy] /api/weight/history error:', err.message);
    return res.status(500).json({ error: 'Could not load weight history.' });
  }
});

export default router;
