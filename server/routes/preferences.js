// Preference intake — the KB search behind custom hard lines, the taxonomy the
// pickers render from, and the free-text interpreter.
//
// Search and taxonomy are public KB reads (no model, no auth) for the same reason
// the ingredient pages are: they're facts already in the KB. Only the free-text
// interpreter costs a model call.

import express from 'express';
import { searchIngredients } from '../lib/hardLines.js';
import { GOALS, FOCUSES, HARD_LINES } from '../lib/taxonomy.js';
import { interpretPreferences } from '../lib/preferenceMap.js';

const router = express.Router();

/** GET /api/preferences/taxonomy — the enumerable preference set. */
router.get('/preferences/taxonomy', (_req, res) => {
  res.json({ goals: GOALS, focuses: FOCUSES, hardLines: HARD_LINES });
});

/** GET /api/ingredients/search?q= — names + aliases, for the custom hard-line picker. */
router.get('/ingredients/search', (req, res) => {
  res.json({ results: searchIngredients(req.query.q, 8) });
});

/** POST /api/preferences/interpret — free text -> enumerated preferences. */
router.post('/preferences/interpret', async (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) return res.status(400).json({ error: 'text_required' });
  if (text.length > 600) return res.status(400).json({ error: 'text_too_long' });

  try {
    res.json(await interpretPreferences(text));
  } catch (err) {
    console.error(`[kristy] /api/preferences/interpret error @ ${new Date().toISOString()}:`, err?.message || err);
    res.status(502).json({ error: 'interpret_failed' });
  }
});

export default router;
