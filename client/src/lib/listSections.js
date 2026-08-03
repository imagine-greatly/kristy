/* The cart's walking order — A MIRROR OF server/lib/listMatch.js, NOT A SECOND OPINION.
 *
 * The section a row belongs to is decided by the card it matched, which the server stamps
 * onto the row as `cardSection`. This file only ORDERS and TITLES those sections, plus the
 * one location rule that is not a knowledge question (frozen). It must never decide which
 * card a row gets — that is retrieval, it happens once, on the server.
 *
 * WHY A MIRROR AND NOT A FETCH: the guest cart lives entirely in localStorage and is
 * regrouped on every render, including offline. A round trip to order a list the client
 * already holds would be the wrong trade, and the ordering is four constants.
 *
 * `listSectionsMirror.test.js` on the server reads BOTH files and fails if the ids, the
 * titles, the order or the frozen rule drift apart. That test is the only thing making
 * "mirror" true rather than aspirational — the same discipline pricing.test.js applies to
 * the mobile pricing module.
 */

// Order is the walk: the perimeter as it is actually walked, then the freezer, then
// whatever has no card. `label_terms` is deliberately absent — it is a reference section
// on the Counter, not an aisle anybody walks to.
export const LIST_SECTIONS = [
  { id: 'produce', title: 'Produce' },
  { id: 'meat', title: 'Meat' },
  { id: 'seafood', title: 'Seafood' },
  { id: 'eggs_dairy', title: 'Dairy & Eggs' },
  { id: 'bulk_pantry', title: 'Pantry & Bulk' },
  { id: 'frozen', title: 'Frozen' },
];

export const TRAILING_TITLE = 'Everything else';

const SECTION_IDS = new Set(LIST_SECTIONS.map((s) => s.id));

/* FROZEN IS A LOCATION RULE SITTING ON TOP OF A KNOWLEDGE MATCH.
   `frozen_vs_fresh_produce` is a produce card because it is about produce, and that filing
   is correct. But a cart section answers "where do I walk", and nobody walks to produce for
   frozen peas — left alone it split one freezer across two places on the same list. */
const FROZEN = /\bfrozen\b/i;

/** Where a row sits on the walk. Null means the trailing group. */
export function sectionForItem(item) {
  if (!item) return null;
  if (FROZEN.test(item.name || '')) return 'frozen';
  return SECTION_IDS.has(item.cardSection) ? item.cardSection : null;
}

/* Rows that are not part of the walk at all.

   A SWAP is one of Kristy's haul callouts — a note to read before starting, not an aisle.
   A SCAN is already in the shopper's hands (it is added `checked`), so it is a record of
   the trip rather than a place to go. Neither belongs in the walking order, and burying
   either inside Produce would be worse than giving each its own group. */
export const LIVE_GROUPS = [
  { id: 'swap', title: 'From your haul', match: (i) => i.source === 'swap' },
  { id: 'scan', title: 'Scanned this trip', match: (i) => i.source === 'scan' },
];

/**
 * Group matched rows by the card they share, in list order.
 *
 * Many items routinely map to one card — blueberries and strawberries both land on
 * `berries_picking`. Rendering it twice reads as a bug, so the card appears once and the
 * rows that claimed it sit together above it. The group takes the position of the FIRST
 * row that claimed the card, so a collapse never moves a row further than to its earliest
 * sibling.
 */
export function collapseByCard(items = []) {
  const out = [];
  const bySlug = new Map();
  for (const it of items) {
    if (!it?.cardSlug) {
      out.push({ key: it.id, slug: null, items: [it] });
      continue;
    }
    const hit = bySlug.get(it.cardSlug);
    if (hit) {
      hit.items.push(it);
      continue;
    }
    const group = { key: it.cardSlug, slug: it.cardSlug, items: [it] };
    bySlug.set(it.cardSlug, group);
    out.push(group);
  }
  return out;
}

/**
 * The whole cart as the shopper walks it: live groups first, then the five counter
 * sections and the freezer, then everything with no card.
 *
 * @returns {Array<{id:string|null, title:string, blocks:Array<{key,slug,items}>}>}
 */
export function groupForWalk(items = []) {
  const rows = Array.isArray(items) ? items : [];
  const used = new Set();
  const out = [];

  for (const g of LIVE_GROUPS) {
    const mine = rows.filter((i) => g.match(i));
    mine.forEach((i) => used.add(i.id));
    if (mine.length) out.push({ id: g.id, title: g.title, blocks: collapseByCard(mine) });
  }

  const walkable = rows.filter((i) => !used.has(i.id));
  const bySection = new Map();
  for (const it of walkable) {
    const key = sectionForItem(it);
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(it);
  }

  for (const s of LIST_SECTIONS) {
    const mine = bySection.get(s.id);
    if (mine?.length) out.push({ id: s.id, title: s.title, blocks: collapseByCard(mine) });
  }
  const rest = bySection.get(null);
  if (rest?.length) out.push({ id: null, title: TRAILING_TITLE, blocks: collapseByCard(rest) });

  return out;
}
