import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { PERIMETER_SECTIONS } from '../lib/perimeter.js';
import { getCard, getSectionCards, getAllCards } from '../lib/counterCards.js';

// The Counter's card corpus, as the client reads it.
//
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
    return res.json(card);
  } catch (err) {
    console.error('[kristy] /api/counter/cards/:slug error:', err?.message || err);
    return res.status(500).json({ error: 'counter_unavailable' });
  }
});

export default counterRouter;
