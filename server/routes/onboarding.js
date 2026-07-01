import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { computeGoals } from '../lib/tdee.js';
import { saveOnboardingProfile } from '../lib/store.js';
import { saveWeightLog } from '../lib/weightLog.js';

const router = Router();

// POST /api/onboarding/full
// Receives the collected onboarding profile, computes TDEE-based macro goals,
// and saves both (marking the user onboarded). Returns the goals + saved row.
router.post('/onboarding/full', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const profile = req.body?.profile || req.body || {};

  try {
    const goals = computeGoals(profile);
    const saved = await saveOnboardingProfile(userId, profile, {
      calories: goals.calories,
      protein: goals.protein,
      carbs: goals.carbs,
      fat: goals.fat,
    });

    // Seed the first weight_log from the onboarding weight so day-one users
    // immediately have a starting data point. Also sets starting_weight +
    // current_weight on the goals row. Non-fatal if it fails.
    const w = Number(profile.weight_value);
    if (Number.isFinite(w) && w > 0) {
      try {
        await saveWeightLog(userId, w, profile.weight_unit === 'kg' ? 'kg' : 'lbs');
      } catch (e) {
        console.error('[kristy] onboarding weight seed failed:', e.message);
      }
    }

    return res.json({ ok: true, goals, profile: saved });
  } catch (err) {
    console.error('[kristy] /api/onboarding/full error:', err.message);
    return res.status(500).json({ error: 'Could not save your profile.' });
  }
});

export default router;
