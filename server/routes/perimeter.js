import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { premiumForReq } from '../lib/subscription.js';
import {
  perimeterKb,
  matchEntries,
  publicEntry,
  composeAnswer,
  NO_ANSWER,
} from '../lib/perimeter.js';

// The Perimeter — Kristy's answers for the parts of the store with no barcode.
//
//   GET  /api/perimeter            public index (id/title/category/question) — SEO/acquisition
//   GET  /api/perimeter/:id        public entry (a full KB read, no model, no cost)
//   POST /api/perimeter/ask        authed — free entry content + PREMIUM personalized answer
//
// Gating mirrors the rest of the app: the perimeter ENTRIES are FREE (a KB read, same as
// the ingredient pages — the acquisition layer). The PERSONALIZED answer (filtered
// through the shopper's goal/focuses/constraints) and the list-refinement it can return
// are PREMIUM. The one model call is claim-locked in lib/perimeter.js.

const ERROR_MSG =
  "I couldn't pull that read together just now — give me a second and ask again.";

// The withheld personalized read, in Kristy's voice (named value, not "go premium").
const PERIMETER_UPSELL =
  "That's the honest rundown. Want my read for YOUR cart — wild vs farmed against your goal, your budget, your week — and a swap I'll drop on your list? That part's for members.";

function readPrefs(body = {}) {
  const list = (v) => (Array.isArray(v) ? v.map((s) => String(s || '').trim()).filter(Boolean) : []);
  return {
    goal: typeof body.goal === 'string' ? body.goal : '',
    focuses: list(body.focuses),
    hardLines: list(body.hardLines ?? body.nonNegotiables),
    constraints: list(body.constraints),
  };
}

export const perimeterRouter = Router();

// ── Public index — the perimeter topics, for a browsable/indexable directory ──
perimeterRouter.get('/perimeter', (_req, res) => {
  const topics = (perimeterKb.entries || []).map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category || null,
    question: e.question || null,
  }));
  return res.json({ topics });
});

// ── Public entry — a full KB read (free universal layer, verbatim, no model) ──
perimeterRouter.get('/perimeter/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  const entry = (perimeterKb.entries || []).find((e) => e.id === id);
  if (!entry) return res.status(404).json({ error: 'not_found' });
  return res.json(publicEntry(entry));
});

// ── Ask — the interactive path. Free gets the entry content; premium gets the read. ──
perimeterRouter.post('/perimeter/ask', requireAuth, userRateLimit, async (req, res) => {
  const question = String(req.body?.question || '').trim();
  if (!question) return res.status(400).json({ error: 'question is required' });

  const matched = matchEntries(question);

  // No good match → the honest no-answer, never an improvisation. Free.
  if (!matched.length) {
    return res.json({ matched: false, entries: [], answer: NO_ANSWER, refinement: null, gated: false });
  }

  // The matched entries are the FREE universal layer — returned verbatim to everyone.
  const entries = matched.map(publicEntry);

  const premium = await premiumForReq(req);
  if (!premium) {
    // Free: the entry content stands on its own; the personalized read is withheld.
    return res.json({ matched: true, entries, answer: null, refinement: null, gated: true, upsell: PERIMETER_UPSELL });
  }

  // Premium: the claim-locked, personalized answer (+ optional list refinement).
  try {
    const { goal, focuses, hardLines, constraints } = readPrefs(req.body);
    const { answer, refinement } = await composeAnswer({ question, goal, focuses, hardLines, constraints, entries: matched });
    return res.json({ matched: true, entries, answer, refinement, gated: false });
  } catch (err) {
    console.error(`[kristy] /api/perimeter/ask error (user ${req.user.id}):`, err?.message || err);
    // Degrade to the free entry content rather than failing — the KB read still helps.
    return res.json({ matched: true, entries, answer: null, refinement: null, gated: false, error: true, message: ERROR_MSG });
  }
});

export default perimeterRouter;
