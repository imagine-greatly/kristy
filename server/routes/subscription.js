import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { getSubscription } from '../lib/store.js';
import { subscriptionSummary } from '../lib/subscription.js';

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

export default router;
