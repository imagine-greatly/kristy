import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { clientIp, rateLimited } from '../lib/guestRate.js';
import { imageUpload } from '../lib/upload.js';
import { extractFromBarcode, looksNonEnglish, isReadableIngredientList } from '../lib/scanExtract.js';
import { readLabelIngredients } from '../lib/labelVision.js';
import { retainProduct } from '../lib/productStore.js';

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

// Kristy-voiced lines for the two ways a label read can come up short. Neither
// dead-ends, and neither narrates service (VOICE_SPEC): the first asks for the shot
// that would work, the second points at the path that always does.
const PANEL_UNREADABLE =
  "That panel didn't come through. One more shot of the ingredients list — straight on, close enough to fill the frame.";
const NO_INGREDIENTS =
  "No ingredient list readable on that one. Type the product name instead.";
const ERROR_MSG = "That scan didn't go through — give it another try in a sec.";

function readLabel(reqFile) {
  const base64 = reqFile.buffer.toString('base64');
  const mediaType = reqFile.mimetype || 'image/jpeg';
  return readLabelIngredients({ base64, mediaType });
}

/* Build the label result — the FIRST-CLASS fallback, not a consolation prize. A
   photographed panel works on any product in the store, including the long tail no
   barcode database reaches, so this path carries the same weight as an OFF hit:
   product identity for the card header, and an ingredient string that goes through
   the SAME engine + KB + claim lock. Vision transcribes; the engine judges.

   Two guards, both about never producing a stamp Kristy didn't earn:
     - a non-English transcription is UNREADABLE (the KB is English, so a foreign
       string matches nothing and scores as zero concerns — a silent approval);
     - `panel: 'none'` means no list was legible, which is a re-shot, not a verdict. */
function buildLabelResult({ ingredients, productName, brand, panel }, barcode = null) {
  const joined = ingredients.join(', ');

  if (panel === 'none' || !ingredients.length) {
    return {
      found: false,
      source: 'vision',
      product: null,
      ingredients: '',
      panel: 'none',
      // A re-shot is the useful next move, so it gets its own state rather than
      // being lumped in with "type it instead".
      retryPhoto: true,
      message: PANEL_UNREADABLE,
    };
  }

  if (looksNonEnglish(joined) || !isReadableIngredientList(joined)) {
    return { found: false, source: 'vision', product: null, ingredients: '', message: NO_INGREDIENTS };
  }

  /* THE SELF-HEALING MOMENT. When this photo followed a barcode MISS, the client
     sends that barcode along — so the read is retained under it and the gap closes
     permanently: the next shopper to scan that code resolves from Kristy's own store
     instead of missing again. This is the whole moat, and it costs one field.

     The barcode is client-supplied, so it is treated as an association claim, not as
     truth: productStore ranks a vision read BELOW an Open Food Facts record, which
     means a photo filed under an existing product's code can never overwrite it.
     Fire-and-forget — retention is a background asset and must never delay a verdict. */
  const code = String(barcode || '').trim() || null;
  retainProduct({
    barcode: code,
    name: productName || null,
    brand: brand || null,
    ingredients: joined,
    source: 'vision',
    panel,
  });

  return {
    found: true,
    source: 'vision',
    // Identity comes straight off the package when it was legible, else stays null.
    // Never inferred — a wrong name on a right verdict is still a wrong product.
    product: { barcode: code, name: productName || null, brand: brand || null, image: null, aisle: '' },
    ingredients: joined,
    // Carried so /verdict can withhold approval on a half-read list.
    ...(panel === 'partial' ? { partialRead: true } : {}),
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
    return res.json(buildLabelResult(await readLabel(req.file), req.body?.barcode));
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
    return res.json(buildLabelResult(await readLabel(req.file), req.body?.barcode));
  } catch (err) {
    console.error('[kristy] /api/guest/scan/label error:', err?.message || err);
    return res.status(502).json({ error: true, message: ERROR_MSG });
  }
});

export default scanRouter;
