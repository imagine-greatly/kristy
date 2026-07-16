import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';
import { imageUpload } from '../lib/upload.js';
import { extractFromBarcode, looksNonEnglish } from '../lib/scanExtract.js';
import { readLabelIngredients } from '../lib/labelVision.js';

// Scan extraction — the front door of the grocery coach. Both entry points parse
// to an ingredient list the client then POSTs to /verdict:
//
//   POST /api/scan/barcode        { barcode }            (authed)
//   POST /api/scan/label          multipart: image      (authed, vision)
//   POST /api/guest/scan/barcode  { barcode }            (guest, IP-budgeted)
//   POST /api/guest/scan/label    multipart: image      (guest, IP-budgeted)
//
// This module only extracts { found, source, product, ingredients } — it computes
// no verdict and makes no claim. The verdict (engine + claim-locked note) is owned
// by /verdict; the label vision call only transcribes printed text. Nothing here
// writes a meal_log — a scanned product is not an eaten meal.

// Kristy-voiced line when a barcode/label yields no readable ingredients — points
// the user at the manual fallback instead of dead-ending.
const NO_INGREDIENTS =
  "I can't read the ingredients on that one. Type the product name and I'll take it from there.";
const ERROR_MSG = "That scan didn't go through — give it another try in a sec.";

function readLabel(reqFile) {
  const base64 = reqFile.buffer.toString('base64');
  const mediaType = reqFile.mimetype || 'image/jpeg';
  return readLabelIngredients({ base64, mediaType });
}

// Build the label result. A non-English transcription is treated as UNREADABLE
// (no card, no stamp) — the same liability guard as the barcode path.
function buildLabelResult(ingredients) {
  const joined = ingredients.join(', ');
  if (!ingredients.length || looksNonEnglish(joined)) {
    return { found: false, source: 'vision', product: null, ingredients: '', message: NO_INGREDIENTS };
  }
  return {
    found: true,
    source: 'vision',
    product: { barcode: null, name: null, brand: null, image: null, aisle: '' },
    ingredients: joined,
  };
}

/* ───────────────────────── Authed ───────────────────────── */
export const scanRouter = Router();

scanRouter.post('/scan/barcode', requireAuth, userRateLimit, async (req, res) => {
  const { barcode } = req.body || {};
  if (!barcode || !String(barcode).trim()) {
    return res.status(400).json({ error: 'barcode is required' });
  }
  try {
    return res.json(await extractFromBarcode(barcode));
  } catch (err) {
    console.error('[kristy] /api/scan/barcode error:', err?.message || err);
    return res.status(502).json({ error: true, message: ERROR_MSG });
  }
});

scanRouter.post('/scan/label', requireAuth, userRateLimit, imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });
  try {
    const { ingredients } = await readLabel(req.file);
    return res.json(buildLabelResult(ingredients));
  } catch (err) {
    console.error('[kristy] /api/scan/label error:', err?.message || err);
    return res.status(502).json({ error: true, message: ERROR_MSG });
  }
});

/* ───────────────────────── Guest ─────────────────────────
   Guests scan for free — the generous acquisition hook. Shares the same per-IP
   budget as guest chat/verdict (lib/guestRate). The client sends the extracted
   ingredients to /api/guest/verdict for the universal layer only (no personal note). */
export const guestScanRouter = Router();

guestScanRouter.post('/scan/barcode', async (req, res) => {
  const { barcode } = req.body || {};
  if (!barcode || !String(barcode).trim()) {
    return res.status(400).json({ error: 'barcode is required' });
  }
  if (rateLimited(clientIp(req))) return res.json({ gate: true, reason: 'limit' });
  try {
    return res.json(await extractFromBarcode(barcode));
  } catch (err) {
    console.error('[kristy] /api/guest/scan/barcode error:', err?.message || err);
    return res.status(502).json({ error: true, message: ERROR_MSG });
  }
});

guestScanRouter.post('/scan/label', imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image is required' });
  if (rateLimited(clientIp(req))) return res.json({ gate: true, reason: 'limit' });
  try {
    const { ingredients } = await readLabel(req.file);
    return res.json(buildLabelResult(ingredients));
  } catch (err) {
    console.error('[kristy] /api/guest/scan/label error:', err?.message || err);
    return res.status(502).json({ error: true, message: ERROR_MSG });
  }
});

export default scanRouter;
