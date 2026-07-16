import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { computeGoals } from '../lib/tdee.js';
import { saveOnboardingProfile, saveCoachProfile } from '../lib/store.js';
import { saveWeightLog } from '../lib/weightLog.js';
import { ensureTrial } from '../lib/subscription.js';

const router = Router();

// POST /api/onboarding/coach — the 60-second grocery-coach onboarding (Step 6).
// Persists a primary goal + non-negotiables, marks the user onboarded, and starts
// the 7-day trial (same as the full flow). No TDEE math — macro targets stay on
// their defaults until/unless the user does the full profile setup separately.
router.post('/onboarding/coach', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const b = req.body || {};
  const coach_goal = typeof b.coach_goal === 'string' && b.coach_goal.trim() ? b.coach_goal.trim() : null;
  const non_negotiables = Array.isArray(b.non_negotiables)
    ? b.non_negotiables.map((s) => String(s || '').trim()).filter(Boolean)
    : [];

  try {
    const profile = await saveCoachProfile(userId, { coach_goal, non_negotiables });
    // 7-day full-access trial, idempotent + non-fatal (same posture as /full).
    const subscription = await ensureTrial(userId);
    return res.json({ ok: true, profile, subscription });
  } catch (err) {
    console.error('[kristy] /api/onboarding/coach error:', err.message);
    return res.status(500).json({ error: 'Could not save your goal.' });
  }
});

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

    // Every new user who completes onboarding gets a 7-day full-access trial.
    // Idempotent + non-fatal: a re-onboard won't reset an existing sub, and a
    // failure here (e.g. pre-migration) never blocks onboarding.
    const subscription = await ensureTrial(userId);

    return res.json({ ok: true, goals, profile: saved, subscription });
  } catch (err) {
    console.error('[kristy] /api/onboarding/full error:', err.message);
    return res.status(500).json({ error: 'Could not save your profile.' });
  }
});

export default router;
