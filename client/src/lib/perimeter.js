// The Perimeter client — the half of the store with no label.
// Browsing (sections + entries) is a public KB read: no account, no model call, no cost.
// The personalized answer and the list-refinement are premium; the server decides.

import { IS_DEMO, apiBase } from './config.js';
import { supabase } from './supabase.js';

// A demo answer so the surface is explorable with no backend. Mirrors the server shape.
function demoAnswer(question) {
  const q = String(question || '').toLowerCase();
  if (/salmon|fish/.test(q)) {
    return {
      matched: true,
      entries: [{
        id: 'salmon_wild_vs_farmed', title: 'Wild vs. farmed salmon', category: 'seafood',
        short_answer: 'Two different animals sold under one name. Wild eats krill and small fish across open ocean; farmed eats a formulated ration, astaxanthin included.',
        evidence_tier: 'kristys_standard',
        buying_tips: ['Frozen wild Alaskan is often cheaper and fresher than ‘fresh’ farmed.', 'Sockeye and coho are almost always wild.'],
        sources: ['NOAA Fisheries / Seafood Watch'],
      }],
      answer: 'Wild. Farmed salmon is a different fish, fed and penned. Frozen wild is usually the smart buy. If it is farmed or nothing, buy the farmed and cook it well.',
      refinement: 'Wild-caught salmon',
      gated: false,
    };
  }
  return {
    matched: false, entries: [],
    answer: 'No solid answer on that one yet. Better to say so than guess.',
    refinement: null, gated: false,
  };
}

// A stranger has no token, and that is fine — the free layer is public. Sending
// `Bearer undefined` would be a lie the server has to unpick, so the header is
// simply omitted when there is nothing to send.
async function authHeader() {
  try {
    if (!supabase) return {};
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch {
    return {};
  }
}

/**
 * Ask about a perimeter topic (fish counter / butcher / produce / label question).
 * Works with NO account: the matched entries come back for everyone.
 * @returns {{ matched, entries, answer, refinement, gated, upsell }}
 * @throws on transport failure so the caller can show a fallback.
 */
export async function askPerimeter({ question, goal = '', focuses = [], hardLines = [], constraints = [] }) {
  // Demo used to short-circuit straight to a one-fixture stub, so every counter
  // question came back as salmon. The free branch of /ask is a public deterministic
  // KB read with no auth and no model call, so try the real thing first and keep the
  // fixture for the case demo actually exists to cover: no backend at all.
  if (IS_DEMO) {
    try {
      const res = await fetch(`${apiBase}/api/perimeter/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, goal, focuses, hardLines, constraints }),
      });
      if (res.ok) return await res.json();
    } catch {
      /* no backend — fall through to the fixture */
    }
    return demoAnswer(question);
  }

  const res = await fetch(`${apiBase}/api/perimeter/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ question, goal, focuses, hardLines, constraints }),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => null);
    if (b && b.message) return { matched: false, entries: [], answer: b.message, refinement: null, gated: false, error: true };
    throw new Error('The counter did not load. Try again.');
  }
  return res.json();
}

/** A public perimeter entry (free universal read, no auth) — for a topic page. */
export async function fetchPerimeterEntry(id) {
  try {
    const res = await fetch(`${apiBase}/api/perimeter/${encodeURIComponent(id)}`);
    if (res.ok) return await res.json();
  } catch {
    /* fall through */
  }
  // Only reached with no backend. In demo that is the fixture; otherwise nothing.
  return IS_DEMO ? demoAnswer(id).entries[0] || null : null;
}

/* Card summaries for the slugs on a cart, in ONE request.

   A cart with seven matches would otherwise mean seven round trips, or pulling all 82
   cards to render four lines each. Public and free — the summary always has been.

   Cached for the session by slug, because the cart regroups on every render and the
   corpus only changes by migration. A slug already held is never re-requested, so
   checking items off for forty minutes issues no traffic at all. */
const summaryCache = new Map();

export async function fetchCardSummaries(slugs = []) {
  const want = [...new Set(slugs.filter(Boolean))];
  const missing = want.filter((s) => !summaryCache.has(s));
  if (missing.length) {
    try {
      const res = await fetch(
        `${apiBase}/api/counter/summaries?slugs=${encodeURIComponent(missing.join(','))}`,
        { headers: await authHeader() }
      );
      if (res.ok) {
        const { cards } = await res.json();
        for (const slug of missing) {
          // A slug the server did not return is cached as null on purpose: a retired card
          // is a permanent absence, and re-asking for it on every render would be a loop.
          summaryCache.set(slug, cards?.[slug] || null);
        }
      }
    } catch {
      /* A row with no card attached is still a row. Never fail a cart over this. */
    }
  }
  const out = {};
  for (const s of want) {
    const c = summaryCache.get(s);
    if (c) out[s] = c;
  }
  return out;
}

/* ── Browse by store section. Public, cached for the session: the KB is a static
      file server-side, so re-fetching it on every visit to the surface is waste.

   The demo path does NOT get its own hand-maintained copy of the store. It had one,
   and it went stale exactly the way a mirror does: five sections instead of six,
   counts frozen at a fraction of the real ones, and a thinNote naming gaps that had
   since been filled. A demo build that quietly under-reports the product is the same
   failure as a demo build that invents a product (Block X). This endpoint is public
   and needs no account, so demo reads the real index too and keeps a minimal
   offline fallback for its actual purpose: no backend at all. ── */
const OFFLINE_SECTIONS = [
  { id: 'produce', title: 'Produce', blurb: 'Where organic earns it, how to pick ripe, and what is in season now.', count: 0, topics: [], labelTopics: [], thinNote: 'Offline. The counter needs a connection.' },
  { id: 'meat', title: 'Meat', blurb: 'Cuts, grades, ratios, and which labels on the case mean anything.', count: 0, topics: [], labelTopics: [], thinNote: null },
  { id: 'seafood', title: 'Seafood', blurb: 'Wild or farmed, mercury by fish, and how to tell fresh at the counter.', count: 0, topics: [], labelTopics: [], thinNote: null },
  { id: 'eggs_dairy', title: 'Dairy & Eggs', blurb: 'Which carton claims hold up, and real cheese from cheese product.', count: 0, topics: [], labelTopics: [], thinNote: null },
  { id: 'bulk_pantry', title: 'Pantry & Bulk', blurb: 'Rice, oats, flour, nuts, honey, and olive oil that is actually olive oil.', count: 0, topics: [], labelTopics: [], thinNote: null },
  { id: 'label_terms', title: 'Label terms', blurb: 'What the word on the front is allowed to mean.', count: 0, topics: [], labelTopics: [], thinNote: null },
];

let sectionCache = null;

export async function fetchPerimeterSections() {
  if (sectionCache) return sectionCache;
  try {
    const res = await fetch(`${apiBase}/api/perimeter/sections`);
    if (res.ok) {
      const { sections } = await res.json();
      sectionCache = sections || [];
      return sectionCache;
    }
  } catch {
    /* fall through */
  }
  if (IS_DEMO) return OFFLINE_SECTIONS;
  throw new Error('The counter did not load. Try again.');
}

/* ═══════════════ The card corpus ═══════════════
   The counter's answers now live in `counter_cards` — the 80 projected from the authored
   KB, and every one Pass 3 generates for a question the KB could not answer. A generated
   card renders through the identical component, which is the whole reason the corpus is a
   table rather than a projection recomputed per request.

   Browsing is public: no account, no model call, no cost. Same as it ever was. */

let cardSectionCache = null;

export async function fetchCounterSections() {
  if (cardSectionCache) return cardSectionCache;
  const res = await fetch(`${apiBase}/api/counter/sections`);
  if (!res.ok) throw new Error('The counter did not load. Try again.');
  const { sections } = await res.json();
  cardSectionCache = sections || [];
  return cardSectionCache;
}

/* THE METERED READ. A locked card carries only its summary; this is the one request
   that can spend a free read. The signed-out count rides up as `spent` so the server
   can answer honestly without keeping an identifier for a stranger. A 402 comes back
   WITH the summary card, never empty — the gate is a teaser, not a wall. */
export async function fetchCounterFull(slug, spent = 0) {
  const res = await fetch(
    `${apiBase}/api/counter/cards/${encodeURIComponent(slug)}/full?spent=${spent}`,
    { headers: await authHeader() }
  );
  const body = await res.json().catch(() => ({}));
  if (res.status === 402) return { gated: true, card: body.card || null };
  if (!res.ok) throw new Error(body.error || `counter_full_${res.status}`);
  return { gated: false, card: body.card, spent: Boolean(body.spent) };
}

export async function fetchCounterCard(slug) {
  const res = await fetch(`${apiBase}/api/counter/cards/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json();
}

/* ═══════════════ Ask the counter ═══════════════
   ONE route for every ask — the bar, the seed chips, and eventually the docked composer.
   The server decides what comes back: a curated card, a card generated for a question the
   KB never covered, or an out-of-scope line. The client renders all three the same way
   because they ARE the same object; only `source` differs, and the shopper is not the
   audience for that field.

   Public, like the rest of the free layer. No account, no token required. */
export async function askCounter({ query, goal = '', focuses = [], hardLines = [], constraints = [] }) {
  const res = await fetch(`${apiBase}/api/counter/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ query, goal, focuses, hardLines, constraints }),
  });
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    return { rateLimited: true, line: body.message || 'Too many questions at once. Try again shortly.' };
  }
  if (!res.ok) throw new Error('The counter did not answer. Try again.');
  return res.json();
}

/* The essentials shelf — the handful of cards the index renders IN PLACE, before any
   navigation. Public and cached for the session: the list is editorial and changes on a
   deploy, not between two taps. */
let essentialsCache = null;

export async function fetchCounterEssentials() {
  if (essentialsCache) return essentialsCache;
  const res = await fetch(`${apiBase}/api/counter/essentials`);
  if (!res.ok) throw new Error('The counter did not load. Try again.');
  const { cards } = await res.json();
  essentialsCache = cards || [];
  return essentialsCache;
}
