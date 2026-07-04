import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { saveMeal, saveChatMessage } from '../lib/store.js';

const router = Router();
const round = (x) => Math.round(Number(x) || 0);
const NOT_FOUND_MSG = "Couldn't find that one — try typing it out instead.";

// POST /api/barcode  { barcode } → looks up Open Food Facts, logs the meal.
// Returns the same shape as /api/chat so the frontend handles it identically.
router.post('/barcode', requireAuth, userRateLimit, async (req, res) => {
  const userId = req.user.id;
  const { barcode } = req.body || {};

  if (!barcode || !String(barcode).trim()) {
    return res.status(400).json({ error: 'barcode is required' });
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(
      String(barcode).trim()
    )}.json`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Kristy/1.0 (nutrition app)' } });
    const data = await r.json();

    if (data.status !== 1 || !data.product) {
      await saveChatMessage(userId, { role: 'ai', content: NOT_FOUND_MSG });
      return res.json({ found: false, hasFood: false, message: NOT_FOUND_MSG, macros: null, foods: [], insight: '' });
    }

    const p = data.product;
    const nut = p.nutriments || {};

    // Open Food Facts gives per-100g nutriments. Prefer kcal; fall back from kJ.
    let kcal = nut['energy-kcal_100g'];
    if (kcal == null && nut['energy_100g'] != null) kcal = nut['energy_100g'] / 4.184;

    const macros = {
      calories: round(kcal),
      protein: round(nut['proteins_100g']),
      carbs: round(nut['carbohydrates_100g']),
      fat: round(nut['fat_100g']),
    };

    const productName =
      p.product_name || p.product_name_en || p.generic_name || 'this item';
    const servingNote = 'Assuming a 100g serving — adjust if it was more or less.';
    const message = `Got it — ${productName}. Logging that for you. ${servingNote}`;

    await saveMeal(userId, { foods: [productName], macros, rawInput: `barcode:${barcode}` });
    await saveChatMessage(userId, {
      role: 'ai',
      content: message,
      macros: { ...macros, foods: [productName], insight: '' },
    });

    return res.json({
      found: true,
      hasFood: true,
      productName,
      message,
      macros,
      foods: [productName],
      insight: '',
      servingNote,
    });
  } catch (err) {
    // Network/parse error on Open Food Facts → fall through to "couldn't find".
    console.error('[kristy] /api/barcode error:', err.message);
    return res.json({ found: false, hasFood: false, message: NOT_FOUND_MSG, macros: null, foods: [], insight: '' });
  }
});

export default router;
