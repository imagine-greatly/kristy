import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import {
  saveHaulScan,
  getHaulScans,
  getFullProfile,
  getShoppingList,
  saveShoppingList,
} from '../lib/store.js';
import { distribution, generateHaulRead, buildCarryForward, seedNextCart } from '../lib/haul.js';
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
    const todayKey = localDay(new Date().toISOString(), tzOffset);
    const trip = week.filter((s) => localDay(s.scanned_at, tzOffset) === todayKey);
    const dist = distribution(week);

    // Distribution + item list are free (your record of what you scanned). Kristy's
    // weekly READ is a member insight (Step 11) — provider-agnostic isPremium gate.
    const premium = await premiumForReq(req);
    const profile = await getFullProfile(userId).catch(() => ({}));

    // The loop into next week. Deterministic and free — this is the shopper's own
    // record, not an insight, and it's the whole point of reading a finished trip.
    const row = await getShoppingList(userId).catch(() => null);
    const cartItems = Array.isArray(row?.list?.items) ? row.list.items : [];
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
      distribution: dist,
      read,
      carryForward,
      insightsGated: !premium && week.length > 0,
    });
  } catch (err) {
    console.error('[kristy] GET /api/haul error:', err.message);
    return res.status(500).json({ error: 'Could not load your haul.' });
  }
});

/* POST /api/haul/next   { accept?: string[] }
   Start next week's cart from this trip. The trip that just ended is the best
   information we have about the next one, and it was previously thrown away — the
   Haul read ended in a nudge that the shopper then had to act on by hand.

   `accept` is the shopper's chosen carry-forwards; omitted, it defaults to the safe
   set (what they kept + what they skipped), never the products she flagged. Every
   name is validated against the ACTUAL carry-forward set computed server-side, so a
   tampering client can't inject arbitrary rows, and no model is involved at all. */
router.post('/haul/next', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    const week = await getHaulScans(userId, 7);
    const row = await getShoppingList(userId).catch(() => null);
    const cartItems = Array.isArray(row?.list?.items) ? row.list.items : [];
    const cf = buildCarryForward({ scans: week, cartItems });

    // The shopper's selection, filtered to what we actually offered.
    const offered = new Map(
      [...cf.keep, ...cf.replace, ...cf.missed].map((x) => [x.name.toLowerCase(), x.name])
    );
    const requested = Array.isArray(req.body?.accept) ? req.body.accept : null;
    const names = requested
      ? requested.map((n) => offered.get(String(n).trim().toLowerCase())).filter(Boolean)
      : [...cf.keep, ...cf.missed].map((x) => x.name);

    if (!names.length) {
      return res.status(400).json({ error: 'Nothing to carry forward yet.' });
    }

    const profile = await getFullProfile(userId).catch(() => ({}));
    const { goals, constraints } = migrateGoalSet({
      goals: Array.isArray(profile.coach_goals) ? profile.coach_goals : [],
      goal: profile.coach_goal || null,
      constraints: Array.isArray(profile.constraints) ? profile.constraints : [],
    });

    const list =
      sanitizeList({
        goal: goals[0] || null,
        intro: "Starting from last week — what you kept, and what never made it in.",
        items: seedNextCart(names),
      }) || null;
    if (!list) return res.status(500).json({ error: 'Could not start the next cart.' });

    const signals = { ...(row?.signals || EMPTY_SIGNALS) };
    signals.sig = listSignature({
      goals,
      nonNegotiables: profile.non_negotiables || [],
      focuses: profile.focuses || [],
      constraints,
    });
    try {
      await saveShoppingList(userId, { list, signals });
    } catch (err) {
      console.warn('[kristy] haul→next persist skipped:', err.message);
    }
    return res.json({ list });
  } catch (err) {
    console.error('[kristy] POST /api/haul/next error:', err.message);
    return res.status(500).json({ error: 'Could not start the next cart.' });
  }
});

export default router;
