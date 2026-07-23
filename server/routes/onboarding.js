import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { computeGoals } from '../lib/tdee.js';
import { saveOnboardingProfile, saveCoachProfile } from '../lib/store.js';
import { saveWeightLog } from '../lib/weightLog.js';

const router = Router();

// POST /api/onboarding/coach — the 60-second grocery-coach onboarding (Step 6).
// Persists a primary goal + non-negotiables and marks the user onboarded. It does
// NOT grant the trial: setting a goal is where the coaching relationship begins,
// not where the user commits to membership. The 7-day trial is a separate, explicit
// choice made at peak intent (POST /api/subscription/trial), after the user has set
// a goal, spent their 3 free personalized "tastes", and hit the gate. Coupling the
// trial to goal-set would (a) skip the free-taste mechanic — a trialing user is
// premium, so free_notes_used never increments — and (b) burn a weekly-cadence trial
// on a casual tap. No TDEE math — macro targets stay on their defaults.
router.post('/onboarding/coach', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const b = req.body || {};
  const coach_goal = typeof b.coach_goal === 'string' && b.coach_goal.trim() ? b.coach_goal.trim() : null;
  const list = (v) => (Array.isArray(v) ? v.map((s) => String(s || '').trim()).filter(Boolean) : []);
  const non_negotiables = list(b.non_negotiables);
  const focuses = list(b.focuses);

  try {
    const profile = await saveCoachProfile(userId, { coach_goal, non_negotiables, focuses });
    return res.json({ ok: true, profile });
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

    // Completing the macro (TDEE) setup does NOT grant the trial either — same
    // rule as the coach path. The trial is one explicit choice at the gate
    // (POST /api/subscription/trial), so a user who opts into calorie tracking
    // still gets their 3 free personalized tastes before membership is decided.
    return res.json({ ok: true, goals, profile: saved });
  } catch (err) {
    console.error('[kristy] /api/onboarding/full error:', err.message);
    return res.status(500).json({ error: 'Could not save your profile.' });
  }
});

export default router;
