import { Router } from 'express';
import { requireAuth, supabase } from '../lib/supabase.js';
import { getHaulScans } from '../lib/store.js';
import {
  activeTrip,
  lastCompletedTrip,
  completeTrip,
  startNewTrip,
  insertTrip,
  buildNextTripList,
  tripToList,
} from '../lib/trips.js';

/* The trip lifecycle.
 *
 *   POST /api/trips/complete   finish the active trip; it is archived, never erased
 *   POST /api/trips/new        start a fresh one (reuses an untouched trip)
 *   POST /api/trips/next       "Same as last week"
 *
 * THERE IS ONE SEEDING DOOR AND THIS IS IT. `/api/haul/next` used to be a second one: the
 * Haul offered a pick-list of carry-forwards and a button, while the cart would have
 * offered "same as last week". Two doors onto one act is how a record drifts — they can
 * disagree about what a new trip starts from, and nothing in the system says which is
 * right. The carry-forward COMPUTATION survives inside /trips/next; the button does not.
 */

const router = Router();

router.post('/trips/complete', requireAuth, async (req, res) => {
  try {
    const out = await completeTrip(req.user.id, supabase);
    if (!out.ok) {
      return res.status(out.reason === 'no_active_trip' ? 409 : 500).json({ error: out.reason });
    }
    return res.json({ trip: out.trip, list: tripToList(out.trip) });
  } catch (err) {
    console.error('[kristy] POST /api/trips/complete error:', err?.message || err);
    return res.status(500).json({ error: 'Could not finish that trip.' });
  }
});

router.post('/trips/new', requireAuth, async (req, res) => {
  try {
    const out = await startNewTrip(req.user.id, supabase);
    if (!out.ok) return res.status(500).json({ error: out.reason });
    return res.json({ trip: out.trip, list: tripToList(out.trip), reused: out.reused });
  } catch (err) {
    console.error('[kristy] POST /api/trips/new error:', err?.message || err);
    return res.status(500).json({ error: 'Could not start a new trip.' });
  }
});

/* POST /api/trips/next — "Same as last week."
 *
 * NO `accept` PARAMETER. `/api/haul/next` took one because carry-forwards were a pick-list;
 * everything is preselected now, and the cart the seed lands in IS the editing surface. A
 * selection UI in front of a list you are about to edit is the same choice made twice. */
router.post('/trips/next', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    // The partial unique index would reject a second active trip anyway. This is the
    // legible form of that guard, so the client can say something useful instead of
    // surfacing a constraint violation.
    if (await activeTrip(userId, supabase)) {
      return res.status(409).json({ error: 'trip_in_progress' });
    }

    const completed = await lastCompletedTrip(userId, supabase);
    if (!completed) return res.status(409).json({ error: 'no_completed_trip' });

    const scans = await getHaulScans(userId, 7).catch(() => []);
    const list = buildNextTripList({ completed, scans });

    const trip = await insertTrip(userId, list, supabase);
    if (!trip) return res.status(500).json({ error: 'Could not start the next trip.' });

    return res.json({ trip, list: tripToList(trip), from: completed.id });
  } catch (err) {
    console.error('[kristy] POST /api/trips/next error:', err?.message || err);
    return res.status(500).json({ error: 'Could not start the next trip.' });
  }
});

/** Is there a week worth repeating? The client hides the control when there is not,
 *  rather than offering a button that answers 409. */
router.get('/trips/seedable', requireAuth, async (req, res) => {
  try {
    const completed = await lastCompletedTrip(req.user.id, supabase);
    return res.json({
      seedable: Boolean(completed),
      items: completed?.items?.filter((i) => i.source !== 'swap').length || 0,
      completedAt: completed?.completed_at || null,
    });
  } catch {
    // Degrade to "no", never to an error: a missing button is a smaller failure than a
    // cart that will not render.
    return res.json({ seedable: false, items: 0, completedAt: null });
  }
});

export default router;
