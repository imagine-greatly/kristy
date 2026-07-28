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
        short_answer: 'Genuinely different fish. Wild is leaner on a varied diet, farmed is fattier on formulated feed. Both are real food.',
        evidence_tier: 'kristys_standard',
        buying_tips: ['Frozen wild Alaskan is often cheaper and fresher than "fresh" farmed.', 'Sockeye and coho are almost always wild.'],
        sources: ['NOAA Fisheries / Seafood Watch'],
      }],
      answer: 'Wild if it is in reach. That is a whole-food-standard call, not settled science. Frozen wild Alaskan is usually the smart buy. Farmed or nothing? Buy the farmed.',
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
  if (IS_DEMO) return demoAnswer(question);

  const res = await fetch(`${apiBase}/api/perimeter/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ question, goal, focuses, hardLines, constraints }),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => null);
    if (b && b.message) return { matched: false, entries: [], answer: b.message, refinement: null, gated: false, error: true };
    throw new Error('The aisle did not load. Try again.');
  }
  return res.json();
}

/** A public perimeter entry (free universal read, no auth) — for a topic page. */
export async function fetchPerimeterEntry(id) {
  if (IS_DEMO) return demoAnswer(id).entries[0] || null;
  try {
    const res = await fetch(`${apiBase}/api/perimeter/${encodeURIComponent(id)}`);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

/* ── Browse by store section. Public, cached for the session: the KB is a static
      file server-side, so re-fetching it on every visit to the surface is waste. ── */
const DEMO_SECTIONS = [
  { id: 'meat', title: 'Meat', blurb: 'Cuts, ratios, and which labels on the case mean anything.', count: 4, topics: [], labelTopics: [], thinNote: 'Beef only so far. Pork and lamb are not covered yet.' },
  { id: 'seafood', title: 'Seafood', blurb: 'Wild or farmed, mercury, and what the freezer case is really for.', count: 4, topics: [], labelTopics: [], thinNote: null },
  { id: 'produce', title: 'Produce', blurb: 'Where organic earns it, how to pick ripe, and what the season is doing.', count: 6, topics: [], labelTopics: [], thinNote: null },
  { id: 'eggs_dairy', title: 'Eggs & Dairy', blurb: 'Which egg carton claims hold up, and real cheese from cheese product.', count: 9, topics: [], labelTopics: [], thinNote: null },
  { id: 'bulk_pantry', title: 'Bulk & Pantry', blurb: 'Rice, oats, nuts, honey, and olive oil that is actually olive oil.', count: 6, topics: [], labelTopics: [], thinNote: null },
];

let sectionCache = null;

export async function fetchPerimeterSections() {
  if (IS_DEMO) return DEMO_SECTIONS;
  if (sectionCache) return sectionCache;
  const res = await fetch(`${apiBase}/api/perimeter/sections`);
  if (!res.ok) throw new Error('The aisle did not load. Try again.');
  const { sections } = await res.json();
  sectionCache = sections || [];
  return sectionCache;
}
