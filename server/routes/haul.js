import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { saveHaulScan, getHaulScans, getFullProfile } from '../lib/store.js';
import { distribution, generateHaulRead } from '../lib/haul.js';

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

    // Kristy's weekly read — one claim-locked Haiku call over the week's scans.
    const profile = await getFullProfile(userId).catch(() => ({}));
    const read = await generateHaulRead({
      scans: week,
      distribution: dist,
      goal: profile.coach_goal || '',
      focuses: profile.focuses || [],
    });

    return res.json({ trip, week, distribution: dist, read });
  } catch (err) {
    console.error('[kristy] GET /api/haul error:', err.message);
    return res.status(500).json({ error: 'Could not load your haul.' });
  }
});

export default router;
