import { Router } from 'express';
import { requireAuth, supabase } from '../lib/supabase.js';
import {
  saveHaulScan,
  getHaulScans,
  getFullProfile,
  getShoppingList,
  saveShoppingList,
} from '../lib/store.js';
import { distribution, generateHaulRead, buildCarryForward } from '../lib/haul.js';
import { activeTrip, completedTripsSince } from '../lib/trips.js';
import { premiumForReq } from '../lib/subscription.js';
import { migrateGoalSet } from '../lib/taxonomy.js';
import { sanitizeList } from '../lib/cartEdit.js';
import { listSignature, EMPTY_SIGNALS } from '../lib/list.js';

// The Haul — every scan is recorded here, and the surface aggregates the trip +
// week into a distribution, an item list, and Kristy's weekly read.
//
//   POST /api/haul/scan   { product_name, brand?, tier, barcode? }   record a scan
//   GET  /api/haul?tzOffset=NNN                                       trip + week + read
//
// A scan is not a meal — this never touches meal_logs.

const router = Router();

// user-local YYYY-MM-DD for a timestamp, given the client's getTimezoneOffset().
const localDay = (iso, offsetMin) =>
  new Date(new Date(iso).getTime() - offsetMin * 60000).toISOString().slice(0, 10);

router.post('/haul/scan', requireAuth, async (req, res) => {
  const b = req.body || {};
  const tier = typeof b.tier === 'string' ? b.tier.trim() : '';
  if (!tier) return res.status(400).json({ error: 'tier is required' });
  try {
    const scan = await saveHaulScan(req.user.id, {
      product_name: b.product_name ? String(b.product_name).slice(0, 140) : null,
      brand: b.brand ? String(b.brand).slice(0, 80) : null,
      tier,
      barcode: b.barcode ? String(b.barcode).slice(0, 32) : null,
    });
    return res.json({ ok: true, scan });
  } catch (err) {
    console.error('[kristy] POST /api/haul/scan error:', err.message);
    return res.status(500).json({ error: 'Could not save your scan.' });
  }
});

router.get('/haul', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const tzOffset = Number(req.query.tzOffset) || 0;
  try {
    const week = await getHaulScans(userId, 7);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const todayKey = localDay(new Date().toISOString(), tzOffset);
    const trip = week.filter((s) => localDay(s.scanned_at, tzOffset) === todayKey);
    const dist = distribution(week);

    // Distribution + item list are free (your record of what you scanned). Kristy's
    // weekly READ is a member insight (Step 11) — provider-agnostic isPremium gate.
    const premium = await premiumForReq(req);
    const profile = await getFullProfile(userId).catch(() => ({}));

    /* TWO DIFFERENT THINGS, AND THE HAUL MUST NOT BLEND THEM.
       A SCAN is a verdict: Kristy read the label and made a call. A BOUGHT item is a row
       the shopper ticked off — she has an opinion about many of them, but not a verdict,
       because nothing was read. Counting them together would produce a number that means
       neither, and the distribution bar in particular is a distribution OF VERDICTS: an
       unscanned item honestly has none, and forcing one on it would colour every bought
       item as a swap (tierBucket returns 'swap' for anything it does not recognise).

       So `bought` rides alongside `week` and the bar stays scans-only. */
    const live = await activeTrip(userId, supabase).catch(() => null);
    const cartItems = Array.isArray(live?.items) ? live.items : [];

    const finished = await completedTripsSince(userId, since, supabase).catch(() => []);
    const bought = [];
    const seenBought = new Set();
    for (const t of finished) {
      for (const it of t.items || []) {
        if (!it.checked || it.source === 'swap') continue;
        const key = String(it.name).toLowerCase();
        if (seenBought.has(key)) continue;
        seenBought.add(key);
        bought.push({ name: it.name, cardSlug: it.cardSlug || null, completed_at: t.completed_at });
      }
    }

    // Still computed, but no longer SERVED as a pick-list: `missed` is what makes the
    // weekly read's "the fish never made it in again" nudge honest. The seeding act it
    // used to feed lives at POST /api/trips/next now.
    const carryForward = buildCarryForward({ scans: week, cartItems });

    const { goals, constraints } = migrateGoalSet({
      goals: Array.isArray(profile.coach_goals) ? profile.coach_goals : [],
      goal: profile.coach_goal || null,
      constraints: Array.isArray(profile.constraints) ? profile.constraints : [],
    });

    const read = premium
      ? await generateHaulRead({
          scans: week,
          distribution: dist,
          goals,
          goal: goals[0] || '',
          focuses: profile.focuses || [],
          hardLines: profile.non_negotiables || [],
          constraints,
          missed: carryForward.missed,
        })
      : '';

    return res.json({
      trip,
      week,
      // What was BOUGHT, kept separate from what was SCANNED. Different meanings, so
      // different fields and a different count on the surface.
      bought,
      distribution: dist, // OF VERDICTS. Scans only, always.
      read,
      insightsGated: !premium && week.length > 0,
    });
  } catch (err) {
    console.error('[kristy] GET /api/haul error:', err.message);
    return res.status(500).json({ error: 'Could not load your haul.' });
  }
});

/* POST /api/haul/next IS GONE. It seeded a new cart from accepted carry-forwards, and it
   was a SECOND door onto an act the cart also offers ("same as last week"). Two doors onto
   one act is how a record drifts: they can disagree about what a new trip starts from and
   nothing says which is right. Its carry-forward computation survives inside
   POST /api/trips/next, which is now the only way a trip is seeded. */

export default router;
