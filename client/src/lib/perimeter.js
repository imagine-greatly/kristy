// The Perimeter client — Kristy's answers for the parts of the store with no barcode.
// Thin wrapper over /api/perimeter/ask. The free universal entry rides back for everyone;
// the personalized answer + the list-refinement are premium (the server decides).

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
        short_answer: "They're genuinely different fish — wild is leaner with a varied diet, farmed is fattier on formulated feed. Both are real food.",
        evidence_tier: 'kristys_standard',
        buying_tips: ['Frozen wild Alaskan is often cheaper and fresher than "fresh" farmed.', 'Sockeye and coho are almost always wild.'],
        sources: ['NOAA Fisheries / Seafood Watch'],
      }],
      answer: "Wild if it's in reach — that's my preference, not a health verdict. Frozen wild Alaskan is usually the smart buy. If it's farmed or nothing, buy the farmed and don't feel bad.",
      refinement: 'Wild-caught salmon',
      gated: false,
    };
  }
  return {
    matched: false, entries: [],
    answer: "I don't have a solid answer on that one yet — and I'd rather say so than guess.",
    refinement: null, gated: false,
  };
}

async function authToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

/**
 * Ask Kristy about a perimeter topic (a fish-counter/butcher/produce/label question).
 * @returns {{ matched, entries, answer, refinement, gated, upsell }}
 * @throws on transport failure so the caller can show a fallback.
 */
export async function askPerimeter({ question, goal = '', focuses = [], hardLines = [], constraints = [] }) {
  if (IS_DEMO) return demoAnswer(question);

  const res = await fetch(`${apiBase}/api/perimeter/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await authToken()}` },
    body: JSON.stringify({ question, goal, focuses, hardLines, constraints }),
  });
  if (!res.ok) {
    const b = await res.json().catch(() => null);
    if (b && b.message) return { matched: false, entries: [], answer: b.message, refinement: null, gated: false, error: true };
    throw new Error("Couldn't reach the aisle just now — try again.");
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
