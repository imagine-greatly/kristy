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
import { annotateFromPicks } from './list.js';

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
const SOURCES = ['template', 'swap', 'user', 'scan', 'imported'];

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

      /* ── The counter card this item matched (listMatch.js) ──
         `cardSlug` IS NOT `perimeterId`, and they are kept apart on purpose even though a
         curated card's slug and a KB entry's id are the same string. `perimeterId` means
         "the authored PICK on this row cites this entry"; `cardSlug` means "what the shopper
         wrote matched this card". One is a citation, the other a retrieval hit, they render
         differently — an authored `why` versus the card's `do` line — and a generated card
         (`gen_*`) has a slug but no KB entry at all, so the namespaces are not even fully
         shared. Collapsing them would make an authored line indistinguishable from a match. */
      ...(it.cardSlug ? { cardSlug: String(it.cardSlug).slice(0, 64) } : {}),
      // Denormalized from the card at match time so a COMPLETED trip keeps the walking order
      // it was actually shopped in, even after the corpus is refiled or the card retired.
      ...(it.cardSection ? { cardSection: String(it.cardSection).slice(0, 32) } : {}),
      // MATCH ONCE. The same discipline as `offered`: stamped on every row the matcher
      // inspects, including the ones that matched nothing, so a reload can never re-run
      // retrieval over a row or log its miss a second time. It has to survive the round trip
      // or the gap log becomes a count of how often the app was opened.
      ...(it.carded ? { carded: true } : {}),
      // ── Imported-list fields (Block 8). These carry the AUTONOMY guarantees, so
      // they have to survive the save or the promise breaks on reload: what the
      // shopper originally wrote, a swap we only OFFERED, and a row we couldn't read
      // and refuse to guess at.
      ...(it.specifiedFrom ? { specifiedFrom: String(it.specifiedFrom).slice(0, 140) } : {}),
      ...(it.swapOffer ? { swapOffer: String(it.swapOffer).slice(0, 200) } : {}),
      // FLAG ONCE. `offered` is the record that this row has already had Kristy's one
      // comment, so a reload, a save or a rebuild can never produce a second. It has
      // to survive the round-trip or the whole no-nagging promise breaks on refresh.
      ...(it.offered ? { offered: true } : {}),
      ...(it.offerId ? { offerId: String(it.offerId).slice(0, 40) } : {}),
      ...(it.swapTo ? { swapTo: String(it.swapTo).slice(0, 140) } : {}),
      ...(it.needsFix ? { needsFix: true } : {}),
      ...(it.note ? { note: String(it.note).slice(0, 200) } : {}),
    }))
    .filter((it) => it.name);
  return {
    goal: list.goal ? String(list.goal).slice(0, 60) : null,
    intro: list.intro ? String(list.intro).slice(0, 400) : '',
    items,
  };
}

/* THE SPINE. A row the SHOPPER put on the list is theirs, and the model does not get
   to take it off because the instruction was vague. "Make this healthier" must never
   quietly delete the thing they are actually buying — that is the failure that turns
   a coach into a parent.

   But "remove the soda" has to work, so the protection is not absolute: their own row
   comes off when their own words name it. Kristy's rows (template) stay removable by
   a loose instruction, because those were her suggestion in the first place. */
const REMOVE_STOPWORDS = new Set(
  'and or the a an of my our some more less any all with for from that this those these plain fresh frozen whole real organic'.split(' ')
);

function namedInInstruction(instruction, name) {
  const text = ` ${String(instruction || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ')} `;
  if (text.trim().length < 2) return false;
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .some((w) => w.length >= 3 && !REMOVE_STOPWORDS.has(w) && text.includes(` ${w}`));
}

// Apply a claim-safe compose result (add/remove by name) to the current cart,
// deterministically — the model only proposed names + sections; we do the edit.
export function applyCompose(current, { add = [], remove = [] }, { instruction = '' } = {}) {
  const items = Array.isArray(current?.items) ? [...current.items] : [];
  const rm = remove.map((r) => String(r).toLowerCase()).filter(Boolean);
  const dropped = (name) => {
    const n = String(name).toLowerCase();
    return rm.some((r) => n === r || n.includes(r) || r.includes(n));
  };
  // Never remove a haul-swap callout via a text instruction; those are Kristy's notes,
  // not shopping rows. A scanned row is the shopper's own decision — also protected.
  // The shopper's own adds and their imported list are protected the same way, unless
  // the instruction names them.
  const OWNED = new Set(['user', 'imported']);
  const kept = items.filter((it) => {
    if (it.source === 'swap' || it.source === 'scan') return true;
    if (!dropped(it.name)) return true;
    return OWNED.has(it.source) && !namedInInstruction(instruction, it.name);
  });
  const present = new Set(kept.map((it) => it.name.toLowerCase()));
  const added = [];
  for (const a of add) {
    const key = String(a.name).toLowerCase();
    if (!key || present.has(key)) continue;
    present.add(key);
    added.push({ id: rid(), name: a.name, category: a.section || 'Pantry', checked: false, source: 'template' });
  }
  // A row with no reason is a checkbox. The reasons are LOOKED UP from the authored
  // picks, never generated — see annotateFromPicks.
  return { ...current, items: [...kept, ...annotateFromPicks(added)] };
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
    items: [...carried, ...annotateFromPicks(items)],
  };
}

// NOTHING IS WITHHELD HERE ANY MORE. `LIST_COMPOSE_UPSELL` lived here — "building a cart
// from one sentence is part of a membership" — and it went when composing became free
// behind a daily budget (LIST_COMPOSE_FREE_LIMIT in lib/rateLimit.js). A guest could
// already do this through the public composer, so selling it to a signed-in shopper meant
// signing up bought them LESS. The list is free, building it included, on both the cart's
// own editor and the docked composer in chat.
