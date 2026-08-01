import { Router } from 'express';
import { optionalAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { clientIp, counterAskLimited } from '../lib/guestRate.js';
import { premiumForReq } from '../lib/subscription.js';
import {
  perimeterKb,
  scoreEntries,
  publicEntry,
  composeAnswer,
  sectionIndex,
  sectionById,
  NO_ANSWER,
  COUNTER_UPSELL,
} from '../lib/perimeter.js';
import { logCounterGap, WEAK_MATCH_CEILING } from '../lib/counterGaps.js';

// The Perimeter — the half of the store with no label.
//
//   GET  /api/perimeter             public index (id/title/category/question) — SEO/acquisition
//   GET  /api/perimeter/sections    public browse-by-store-section index
//   GET  /api/perimeter/sections/:id one section
//   GET  /api/perimeter/:id         public entry (a full KB read, no model, no cost)
//   POST /api/perimeter/ask         PUBLIC — free entry content + PREMIUM personalized answer
//
// Gating mirrors the rest of the app: the perimeter ENTRIES are FREE (a KB read, same as
// the ingredient pages — the acquisition layer). The PERSONALIZED answer (filtered
// through the shopper's goal/focuses/constraints) and the list-refinement it can return
// are PREMIUM. The one model call is claim-locked in lib/perimeter.js.
//
// /ask takes optionalAuth, NOT requireAuth. The free branch is a deterministic KB read
// with no model call and NO PERSONAL DATA STORED, so requiring an account bought nothing
// and cost a stranger the exact thing they came to try. Anonymous callers can never reach
// the premium branch (premiumForReq is only consulted when req.user exists) and are capped
// on the shared per-IP guest budget instead of the per-user one.
//
// "No personal data stored" is the precise claim, and it used to be "no stored data". A
// question that the KB answers badly is now logged — normalized, with no user id, no IP,
// and no session — because the gap between what shoppers ask and what the KB holds is the
// single most valuable signal this surface produces, and it cannot be collected
// retroactively. What is stored is the TOPIC, never the asker. See lib/counterGaps.js.

const ERROR_MSG = "That read didn’t come together just now. Give it a second and ask again.";


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

/* ── Public browse-by-section — the perimeter as a DESTINATION, not a search box ──
   Registered BEFORE /perimeter/:id, which would otherwise swallow "sections". */
perimeterRouter.get('/perimeter/sections', (_req, res) => {
  return res.json({ sections: sectionIndex() });
});

perimeterRouter.get('/perimeter/sections/:id', (req, res) => {
  const section = sectionById(req.params.id);
  if (!section) return res.status(404).json({ error: 'not_found' });
  return res.json(section);
});

// ── Public entry — a full KB read (free universal layer, verbatim, no model) ──
perimeterRouter.get('/perimeter/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  const entry = (perimeterKb.entries || []).find((e) => e.id === id);
  if (!entry) return res.status(404).json({ error: 'not_found' });
  return res.json(publicEntry(entry));
});

// ── Ask — the interactive path. Free gets the entry content; premium gets the read. ──
perimeterRouter.post('/perimeter/ask', optionalAuth, userRateLimit, async (req, res) => {
  const question = String(req.body?.question || '').trim();
  if (!question) return res.status(400).json({ error: 'question is required' });

  // Anonymous callers get the COUNTER's own ceiling, not the shared guest budget.
  //
  // They used to draw on the shared one, and that was a real cost with no matching
  // spend: matching is deterministic, an anonymous caller can never reach the premium
  // branch that calls the model, and yet eight counter questions left a stranger with no
  // guest chat, verdict or scan for the hour. The shopper who used the counter ended up
  // with less than the one who ignored it, which is the opposite of what the free layer
  // is for. See the bucket's own note in lib/guestRate.js.
  if (!req.user && counterAskLimited(clientIp(req))) {
    return res.status(429).json({ error: true, message: 'Too many questions at once. Try again shortly.' });
  }

  const scored = scoreEntries(question);
  const matched = scored.map((s) => s.entry);

  // No good match → the honest no-answer, never an improvisation. Free.
  //
  // And logged. This endpoint IS the counter, so every question arriving here is a
  // counter question by construction — no intent heuristic needed, unlike the chat
  // path. Fire-and-forget: the shopper's answer never waits on the backlog.
  if (!matched.length) {
    logCounterGap({ question, outcome: 'miss' });
    return res.json({ matched: false, entries: [], answer: NO_ANSWER, refinement: null, gated: false });
  }

  // A weak top score means an entry exists and answers this badly — a different piece
  // of authoring work from a clean miss, so it is logged as its own outcome with the
  // entry it reached attached.
  if (scored[0].score <= WEAK_MATCH_CEILING) {
    logCounterGap({
      question,
      outcome: 'weak',
      topEntryId: scored[0].entry.id,
      topScore: scored[0].score,
    });
  }

  // The matched entries are the FREE universal layer — returned verbatim to everyone.
  const entries = matched.map(publicEntry);

  // No account → the free layer, full stop. premiumForReq reads req.user.id, so it is
  // only ever consulted once we know there IS a user.
  const premium = req.user ? await premiumForReq(req) : false;
  if (!premium) {
    // Free: the entry content stands on its own; the personalized read is withheld.
    return res.json({ matched: true, entries, answer: null, refinement: null, gated: true, upsell: COUNTER_UPSELL });
  }

  // Premium: the claim-locked, personalized answer (+ optional list refinement).
  try {
    const { goal, focuses, hardLines, constraints } = readPrefs(req.body);
    const { answer, refinement } = await composeAnswer({ question, goal, focuses, hardLines, constraints, entries: matched });
    return res.json({ matched: true, entries, answer, refinement, gated: false });
  } catch (err) {
    console.error(`[kristy] /api/perimeter/ask error (user ${req.user?.id || 'anonymous'}):`, err?.message || err);
    // Degrade to the free entry content rather than failing — the KB read still helps.
    return res.json({ matched: true, entries, answer: null, refinement: null, gated: false, error: true, message: ERROR_MSG });
  }
});

export default perimeterRouter;
