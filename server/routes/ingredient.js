import { Router } from 'express';
import { kb } from '../lib/verdictEngine.js';
import { selectCardIsm, ismContext } from '../lib/education.js';

// The ingredient detail surface — a pure KB READ. Given an ingredient id it returns
// that entry rendered for the /app/ingredient/:id page: name + aliases, her verdict
// register line, the why-first one-liner + the longer `why`, the (optional) history,
// the honestly-tiered evidence + sources, and the swap. Plus the one education ism
// its category triggers.
//
//   GET /api/ingredient/:id   (public — no auth, no model call, no cost)
//
// This is the free "universal layer" made permanent + shareable + indexable. There is
// no model call here, so nothing to claim-lock: every field is read verbatim from the
// knowledge base. It's mounted publicly so guests and search engines can read it too.

const byId = new Map(kb.ingredients.map((e) => [e.id, e]));

// The public shape: everything on the KB entry that's a factual read. `kristy_note`,
// `cardiovascular_relevance`, `glycemic_impact` stay internal (engine/composer use).
function publicEntry(e) {
  return {
    id: e.id,
    name: e.name,
    aliases: Array.isArray(e.aliases) ? e.aliases : [],
    category: e.category || null,
    // "affirming" = a whole food Kristy stands behind, not a concern. The page
    // branches on this: no severity chip, no "why it's bad" section, history first.
    polarity: e.polarity === 'affirming' ? 'affirming' : 'concern',
    severity: e.severity,
    evidence_tier: e.evidence_tier,
    verdict: e.verdict || null,
    one_liner: e.one_liner,
    why: e.why || '',
    history: e.history || null,
    sources: Array.isArray(e.sources) ? e.sources : [],
    swap: e.swap || null,
    // The KB's own framing text, read straight from the file (never hardcoded):
    //   verdict  — her call in the KB's verdict register ("Don't buy it. Put it back.")
    //   severity — what this severity level means
    //   evidence — the honest evidence-tier framing (settled / credible / her standard)
    framing: {
      verdict: (e.verdict && kb.verdict_options?.[e.verdict]) || null,
      severity: kb.severity_levels?.[e.severity] || null,
      evidence: kb.evidence_tiers?.[e.evidence_tier] || null,
    },
  };
}

export const ingredientRouter = Router();

ingredientRouter.get('/ingredient/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  const entry = byId.get(id);
  if (!entry) return res.status(404).json({ error: 'not_found' });

  // The one contextual ism this ingredient's category triggers (fixed editorial copy
  // in kristy_education.json — no claim-lock risk). Tier is a per-product concept, so
  // it's null here; category/ingredient triggers still match.
  const education = selectCardIsm(
    ismContext({ matched: [entry], tier: null, ingredientCount: 1, focuses: [] })
  );

  return res.json({ ...publicEntry(entry), education });
});

export default ingredientRouter;
