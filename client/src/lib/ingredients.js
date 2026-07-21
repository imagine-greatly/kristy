// Ingredient detail data + tiny route helpers for the /app/ingredient/:id page.
// A pure KB read from the public /api/ingredient/:id endpoint — no auth, no model
// call, so it's on the free universal layer and safe to cache aggressively.

import { apiBase } from './config.js';

const cache = new Map();

/** Fetch a KB ingredient entry by id (cached). Throws with `.notFound` on 404. */
export async function fetchIngredient(id) {
  const key = String(id || '').trim();
  if (!key) throw new Error('missing ingredient id');
  if (cache.has(key)) return cache.get(key);

  const res = await fetch(`${apiBase}/api/ingredient/${encodeURIComponent(key)}`);
  if (res.status === 404) {
    const err = new Error('not_found');
    err.notFound = true;
    throw err;
  }
  if (!res.ok) throw new Error('Could not load that ingredient.');
  const data = await res.json();
  cache.set(key, data);
  return data;
}

/** The ingredient id in an /app/ingredient/:id path, or null. */
export function ingredientIdFromPath(pathname) {
  const p = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');
  const m = String(p).match(/\/ingredient\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/** The canonical path for an ingredient page (under the /app scope). */
export const ingredientPath = (id) => `/app/ingredient/${encodeURIComponent(id)}`;
