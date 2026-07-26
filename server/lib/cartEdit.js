// Shared cart-edit primitives — the deterministic half of the conversational editor.
//
// The model is only ever allowed to PROPOSE grocery names + sections + a one-line
// summary (see listCompose.js). Everything that actually changes the cart happens
// here, in plain code: we add, we remove, we sanitize. That's what makes the editor
// claim-safe by construction — a shopping list is grocery NAMES ONLY, and no model
// output is ever written to the cart unfiltered.
//
// Lives in lib/ because two callers need it: POST /api/list/compose (the cart's own
// editor) and the chat route (the docked composer, which is the same editor reached
// by talking). One implementation, so the two paths can't drift apart.

import { randomUUID } from 'node:crypto';

const rid = () => randomUUID();

// The verdict tiers a scanned cart row may carry. Display-only on the list — the
// verdict engine remains the only thing that assigns one, and a tier here can never
// restore a seal or move a score.
export const CART_TIERS = [
  'approved',
  'approved_with_note',
  'use_with_intention',
  'swap_recommended',
  'skip',
];

// Sources a cart row may claim. 'scan' is a product the shopper scanned and kept;
// 'swap' is one of Kristy's haul callouts; 'user' is a manual add; 'template' is
// hers from the goal blend.
const SOURCES = ['template', 'swap', 'user', 'scan'];

export function sanitizeList(list) {
  if (!list || !Array.isArray(list.items)) return null;
  const items = list.items
    .slice(0, 200)
    .map((it) => ({
      id: String(it.id || randomUUID()).slice(0, 64),
      name: String(it.name || '').slice(0, 140),
      category: String(it.category || 'Added').slice(0, 60),
      checked: !!it.checked,
      source: SOURCES.includes(it.source) ? it.source : 'user',
      ...(it.productName ? { productName: String(it.productName).slice(0, 140) } : {}),
      // A scanned row carries the verdict it came in with, so the cart keeps showing
      // Kristy's read on it without re-asking. Enum-guarded: a client can't invent one.
      ...(CART_TIERS.includes(it.tier) ? { tier: it.tier } : {}),
      // Set by the Perimeter refinement ("Olive oil" → "Fresh, dark-bottle EVOO").
      ...(it.refined ? { refined: true } : {}),
      // Kristy's one-line reasoning for this pick — rendered inline on the row, so it
      // has to survive the round-trip when the shopper checks something off.
      ...(it.why ? { why: String(it.why).slice(0, 200) } : {}),
      // The perimeter KB entry this pick's judgment came from. Enum-free but id-shaped,
      // and only ever used to READ a KB entry — never to write one.
      ...(it.perimeterId ? { perimeterId: String(it.perimeterId).slice(0, 64) } : {}),
      ...(it.alt ? { alt: String(it.alt).slice(0, 160) } : {}),
    }))
    .filter((it) => it.name);
  return {
    goal: list.goal ? String(list.goal).slice(0, 60) : null,
    intro: list.intro ? String(list.intro).slice(0, 400) : '',
    items,
  };
}

// Apply a claim-safe compose result (add/remove by name) to the current cart,
// deterministically — the model only proposed names + sections; we do the edit.
export function applyCompose(current, { add = [], remove = [] }) {
  const items = Array.isArray(current?.items) ? [...current.items] : [];
  const rm = remove.map((r) => String(r).toLowerCase()).filter(Boolean);
  const dropped = (name) => {
    const n = String(name).toLowerCase();
    return rm.some((r) => n === r || n.includes(r) || r.includes(n));
  };
  // Never remove a haul-swap callout via a text instruction; those are Kristy's notes,
  // not shopping rows. A scanned row is the shopper's own decision — also protected.
  const kept = items.filter((it) => it.source === 'swap' || it.source === 'scan' || !dropped(it.name));
  const present = new Set(kept.map((it) => it.name.toLowerCase()));
  const added = [];
  for (const a of add) {
    const key = String(a.name).toLowerCase();
    if (!key || present.has(key)) continue;
    present.add(key);
    added.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
  }
  return { ...current, items: [...kept, ...added] };
}

// A fresh cart from one sentence ("three high-protein dinners for four"). Her haul
// callouts and anything already scanned into the trip lead; the rest is replaced.
export function buildCart(current, add = [], { goal, summary } = {}) {
  const carried = (current?.items || []).filter((i) => i.source === 'swap' || i.source === 'scan');
  const seen = new Set(carried.map((i) => String(i.name).toLowerCase()));
  const items = [];
  for (const a of add) {
    const key = String(a.name).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
  }
  return {
    goal: goal || null,
    intro: summary || current?.intro || '',
    items: [...carried, ...items],
  };
}

// The withheld conversational-building capability, in Kristy's voice (a named value,
// not "go premium"). Free users still get a real basic cart + manual add/remove.
export const LIST_COMPOSE_UPSELL =
  "Building your cart from a sentence — 'add taco night', 'three high-protein dinners for four' — is part of a membership. Say the word and it's on.";
