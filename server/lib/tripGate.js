import { premiumForReq } from './subscription.js';
import { supabase } from './supabase.js';

/* Admin resolution, approved by Devon 2026-10-01 (PRICING-BUILD-PLAN S1).
 * PRICING-MODEL §2's "all four /trips/*" predates the five-route file: gate all
 * six list routes and only /trips/new and /trips/next, after authentication.
 * /trips/complete stays open so Finish on trip 2 lands and opens the ask.
 * /trips/import stays open for max-and-cap-at-2 reconciliation before purchase.
 * /trips/seedable stays open because it reports the completed count.
 * /haul stays free: CLAUDE.md Money and plan I2 supersede §2 ("haul free, seeding locked").
 * Guest doors cannot be gated server-side; their allowance is on the device (§2).
 * Subscription evaluation, list personalization, and compose budgets are unchanged.
 */

/** Count only this user's completed trips. Unknown is an error, never a free run. */
export async function completedTrips(userId, client = supabase) {
  const { data, count, error } = await client
    .from('trips')
    .select('id', { count: 'exact', head: false })
    .eq('user_id', userId)
    .eq('status', 'completed');
  if (error || !Array.isArray(data) || !Number.isSafeInteger(count) || count < 0) {
    throw new Error('Completed trip count unavailable');
  }
  return count;
}

/** The two-trip allowance for a non-member; members do not spend this allowance. */
export async function allowanceRemaining(req, client = supabase) {
  return Math.max(0, 2 - await completedTrips(req.user.id, client));
}

/** Subscription access and the trip allowance meet in this one decision. */
export async function canRunATrip(req, client = supabase) {
  return await premiumForReq(req) || await allowanceRemaining(req, client) > 0;
}

/** Express middleware; the optional client lets behavior tests use the real decision. */
export async function requireTripAllowance(req, res, next, client = supabase) {
  let allowed;
  try {
    allowed = await canRunATrip(req, client);
  } catch (err) {
    console.error('[kristy] trip gate:', err?.message || err);
    return res.status(503).json({ error: 'trip_allowance_unavailable' });
  }
  if (!allowed) {
    return res.status(402).json({ error: 'trip_allowance', allowanceRemaining: 0 });
  }
  return next();
}
