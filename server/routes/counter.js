import { Router } from 'express';
import { supabase, optionalAuth } from '../lib/supabase.js';
import { clientIp, counterAskLimited } from '../lib/guestRate.js';
import { PERIMETER_SECTIONS } from '../lib/perimeter.js';
import { getCard, getSectionCards, getAllCards, getEssentialCards, bumpUseCount } from '../lib/counterCards.js';
import { answerCounterQuestion } from '../lib/counterAskPipeline.js';
import { premiumForReq } from '../lib/subscription.js';
import { composeAnswer, COUNTER_UPSELL } from '../lib/perimeter.js';

// The Counter's card corpus, as the client reads it.
//
//   GET /api/counter/essentials     the shelf the index renders in place, in authored order
//   GET /api/counter/sections       the browse index — sections, each with its cards
//   GET /api/counter/sections/:id   one section's cards
//   GET /api/counter/cards/:slug    one card
//   GET /api/counter/cards          the whole corpus (the skim tests render all of it)
//
// PUBLIC, deliberately, and with no model call: a card is a deterministic read of an
// authored answer, exactly like the free counter layer it replaces. Requiring an account
// here would cost a stranger the thing they came to try and buy nothing.
//
// The BROWSE LIST stays at eyebrow + headline. That density was already right, and the
// summary/expanded split is about the CARD, not about the list that leads to it — sending
// the whole card down for a list of forty topics would be slower and no more useful.

export const counterRouter = Router();

// A browse row is the least a shopper needs to choose: what it is, and the call.
const browseRow = (c) => ({
  slug: c.slug,
  eyebrow: c.eyebrow,
  headline: c.headline,
  kind: c.kind,
  tier: c.tier,
});

counterRouter.get('/counter/sections', async (_req, res) => {
  try {
    const cards = await getAllCards(supabase);
    const bySection = new Map();
    for (const c of cards) {
      if (!c.section) continue;
      if (!bySection.has(c.section)) bySection.set(c.section, []);
      bySection.get(c.section).push(browseRow(c));
    }
    // The label-terms cross-listing is a BROWSE-TIME LENS, not a second home: a label
    // card lives in label_terms and is also surfaced in the section where it is actually
    // read. Keeping that here rather than giving cards two sections is what stops the
    // corpus growing a second, drifting index of itself.
    const bySlug = new Map(cards.map((c) => [c.slug, c]));

    // Ordered by PERIMETER_SECTIONS so the store reads in the order it is walked, not in
    // whatever order the table returned.
    const sections = PERIMETER_SECTIONS.map((s) => {
      const own = bySection.get(s.id) || [];
      const labelCards = (s.labels || [])
        .map((slug) => bySlug.get(slug))
        .filter(Boolean)
        .map(browseRow);
      return {
        id: s.id,
        title: s.title,
        blurb: s.blurb || '',
        thinNote: s.thinNote || null,
        shortcuts: s.shortcuts || [],
        cards: own,
        labelCards,
        count: own.length,
      };
    });
    return res.json({ sections });
  } catch (err) {
    console.error('[kristy] /api/counter/sections error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});

counterRouter.get('/counter/sections/:id', async (req, res) => {
  const meta = PERIMETER_SECTIONS.find((s) => s.id === req.params.id);
  if (!meta) return res.status(404).json({ error: 'not_found' });
  try {
    const cards = await getSectionCards(meta.id, supabase);
    return res.json({
      id: meta.id,
      title: meta.title,
      thinNote: meta.thinNote || null,
      shortcuts: meta.shortcuts || [],
      cards,
    });
  } catch (err) {
    console.error('[kristy] /api/counter/sections/:id error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});

// The essentials shelf — the cards the index renders in place, before any navigation.
// Registered BEFORE /cards/:slug, which would otherwise swallow "essentials".
counterRouter.get('/counter/essentials', async (_req, res) => {
  try {
    const cards = await getEssentialCards(supabase);
    return res.json({ cards, count: cards.length });
  } catch (err) {
    console.error('[kristy] /api/counter/essentials error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});

// The whole corpus. Registered BEFORE /cards/:slug, which would otherwise swallow it.
counterRouter.get('/counter/cards', async (_req, res) => {
  try {
    const cards = await getAllCards(supabase);
    return res.json({ cards, count: cards.length });
  } catch (err) {
    console.error('[kristy] /api/counter/cards error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});

counterRouter.get('/counter/cards/:slug', async (req, res) => {
  try {
    const card = await getCard(req.params.slug, supabase);
    if (!card) return res.status(404).json({ error: 'not_found' });
    // A BROWSE OPEN COUNTS, not just an ask that retrieved. use_count is a counter on the
    // CARD — "this answer earned its place" — and a card someone navigated three taps to
    // reach earned it at least as much as one a matcher surfaced. Fire-and-forget: nobody
    // waits on our bookkeeping.
    bumpUseCount(card.slug, supabase, card.use_count);
    return res.json(card);
  } catch (err) {
    console.error('[kristy] /api/counter/cards/:slug error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});

/* ═══════════════════════════ Ask ═══════════════════════════
   POST /api/counter/ask — the single ask route.

   PUBLIC (optionalAuth), because the counter's free layer always has been: a stranger
   asking what to buy is the acquisition moment, and a sign-in wall costs them the exact
   thing they came to try. Generation is free too — a generated card persists and answers
   every FUTURE asker for free, so it is corpus investment rather than a per-user benefit,
   and the coverage gaps that matter surface on the free surface by definition.

   The PERSONALIZED read stays premium and keeps its own claim lock: composeAnswer only
   ever sees the seven whitelisted fields of a matched entry. */
counterRouter.post('/counter/ask', optionalAuth, async (req, res) => {
  const query = String(req.body?.query ?? req.body?.question ?? '').trim();
  if (!query) return res.status(400).json({ error: 'query is required' });

  // The read ceiling — the counter's own bucket, never the shared inference one. Scope
  // rejections and retrieval hits make no model call, so this is about the endpoint being
  // public, not about cost.
  if (!req.user && counterAskLimited(clientIp(req))) {
    return res.status(429).json({ error: true, message: 'Too many questions at once. Try again shortly.' });
  }

  try {
    const result = await answerCounterQuestion({
      query,
      userId: req.user?.id || null,
      ip: clientIp(req),
      client: supabase,
    });

    if (result.out_of_scope || !result.card) return res.json(result);

    // A GENERATED card is never personalized. composeAnswer is claim-locked to matched KB
    // entries, and a generated card has none — personalizing it would mean a model call
    // with nothing locked behind it, which is the failure the lock exists to prevent.
    const personalizable = Array.isArray(result.entries) && result.entries.length > 0;
    const { entries: _entries, ...body } = result;
    if (!personalizable) return res.json(body);

    // Personalization: premium, and only when there is something to read against.
    const premium = req.user ? await premiumForReq(req) : false;
    if (!premium) {
      return res.json({ ...body, gated: true, upsell: COUNTER_UPSELL });
    }

    try {
      const { goal, focuses, hardLines, constraints } = readPrefs(req.body);
      const { answer, refinement } = await composeAnswer({
        question: query,
        goal,
        focuses,
        hardLines,
        constraints,
        entries: result.entries,
      });
      return res.json({ ...body, personal: { answer, refinement } });
    } catch (err) {
      console.error('[kristy] counter personalization failed:', err?.message || err);
      // The card still stands on its own. Degrade to it rather than failing the request.
      return res.json(body);
    }
  } catch (err) {
    console.error('[kristy] /api/counter/ask error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});


function readPrefs(body = {}) {
  const list = (v) => (Array.isArray(v) ? v.map((s) => String(s || '').trim()).filter(Boolean) : []);
  return {
    goal: typeof body.goal === 'string' ? body.goal : '',
    focuses: list(body.focuses),
    hardLines: list(body.hardLines ?? body.nonNegotiables),
    constraints: list(body.constraints),
  };
}

export default counterRouter;
