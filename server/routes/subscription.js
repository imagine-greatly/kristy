import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { getSubscription } from '../lib/store.js';
import { subscriptionSummary, ensureTrial } from '../lib/subscription.js';

const router = Router();

// GET /api/subscription — the signed-in user's billing snapshot, used by the
// client to show trial days, gate the trend chart, and route locked features to
// the upgrade view. Reads are defensive: no row (or pre-migration) → a clean
// non-premium snapshot, never an error.
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const row = await getSubscription(req.user.id);
    return res.json(subscriptionSummary(row));
  } catch (err) {
    console.error('[kristy] /api/subscription error:', err.message);
    // Fail closed to non-premium so a read hiccup never unlocks paid features.
    return res.json(subscriptionSummary(null));
  }
});

// POST /api/subscription/trial — the ONE place the 7-day promo trial is granted.
// This is the explicit, at-the-gate choice the client offers from the withheld
// read and the Upgrade screen — never a side effect of setting a goal. ensureTrial
// is idempotent: if a subscription row already exists (a live trial, a paid sub, or
// an expired/consumed trial) it is returned untouched, so a user can't restart a
// trial they've already had, and a paying member's state is never disturbed. Reads
// back the summary so the client can flip straight to the premium UI.
router.post('/subscription/trial', requireAuth, async (req, res) => {
  try {
    const row = await ensureTrial(req.user.id);
    return res.json(subscriptionSummary(row));
  } catch (err) {
    console.error('[kristy] /api/subscription/trial error:', err.message);
    // Non-fatal: a failure here (e.g. pre-migration) leaves the user non-premium.
    return res.json(subscriptionSummary(null));
  }
});

export default router;
