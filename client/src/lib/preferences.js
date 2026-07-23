// Preference intake helpers — KB search behind custom hard lines, and the
// free-text interpreter.
//
// Search is a public KB read (no auth, no model), same as the ingredient pages.
// The interpreter costs one call and returns values already filtered against the
// server's taxonomy, so anything that arrives here is guaranteed to be a
// preference the engine can actually act on.

import { apiBase } from './config.js';

const searchCache = new Map();

/** Search KB names + aliases for the custom hard-line picker. Returns []. */
export async function searchIngredients(query) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];
  if (searchCache.has(q)) return searchCache.get(q);

  try {
    const res = await fetch(`${apiBase}/api/ingredients/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    const { results = [] } = await res.json();
    searchCache.set(q, results);
    return results;
  } catch {
    return []; // search is an affordance, never a blocker
  }
}

/**
 * Map free text onto the preference taxonomy.
 * @returns {{ goal, focuses, hardLines, constraints, unmapped, reply }}
 * @throws on network/model failure so the caller can show Kristy's fallback.
 */
export async function interpretPreferences(text) {
  const res = await fetch(`${apiBase}/api/preferences/interpret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: String(text || '').trim() }),
  });
  if (!res.ok) throw new Error('interpret_failed');
  return res.json();
}

/** A custom hard line's display label, derived from its "kb:<id>" value. */
export function customLineLabel(value, fallbackName) {
  if (fallbackName) return `No ${fallbackName.toLowerCase()}`;
  const id = String(value || '').replace(/^kb:/, '');
  return `No ${id.replace(/_/g, ' ')}`;
}

/** True for a user-picked KB ingredient line (vs. one of the presets). */
export const isCustomLine = (value) => String(value || '').startsWith('kb:');
