// The list item → counter card matcher.
//
// A shopper writes "blueberries" and gets the produce card attached to it. This is the
// second, more prominent path into the corpus; the Counter is untouched and remains the
// place you go when you deliberately want to look something up.
//
// THERE IS NO SECOND MATCHER HERE. Retrieval is `scoreEntries` from perimeter.js — the
// same function, the same floor, the same alias unit the ask path uses. What this module
// adds is the three things a LIST needs and a QUESTION does not: it skips the scope gate,
// it refuses kitchen-technique cards, and it collapses many items onto one card.
//
// WHY THE SCOPE GATE IS SKIPPED, DELIBERATELY. `inScope` exists to decide whether a
// SENTENCE is a grocery question, and every correction it has ever needed went the same
// direction — too tight, never too loose. A list item is not a sentence. "blueberries" has
// no grocery verb, no question word and no punctuation, which is the exact shape the gate
// has historically refused. There is also nothing for it to protect: a list item that
// matches nothing simply gets no card, which costs one KB scan of an in-memory array and
// zero model calls. The gate is a cost control on a path that has no cost.

import { scoreEntries } from './perimeter.js';
import { kindFor, sectionForCategory } from './counterCards.js';
import { logCounterGap } from './counterGaps.js';

// The retrieval floor, stated in the unit both scorers share. See counterFloor.test.js —
// this is the same statement of the same rule, not a second one. `score >= CONFIDENT` is
// vacuous on the curated side (scoreEntries floors its own results at 2), so the alias
// check does the work; it is kept because it names the intent.
const CONFIDENT = 2;

// How many candidates to consider before giving up. Only matters when the leaders are home
// cards and we fall through past them.
const CANDIDATES = 3;

/* ═══════════════════════════ The five sections, plus frozen ═══════════════════════════

   THE COUNTER'S VOCABULARY WINS. The cart used to carry ten sections of its own — Produce,
   Meat & Seafood, Dairy & Eggs, Bakery, Pantry, Snacks, Frozen, Added, and two for live
   rows — mapped from PICK categories by a client-side table plus a regex that sniffed item
   names for dairy and frozen. That predates the corpus. It merged meat and seafood, which
   the counter splits, and it was a second index of the store that could drift from the one
   the knowledge is filed under.

   `label_terms` is NOT here. It is a reference section, not an aisle — nobody walks to it. */
export const LIST_SECTIONS = [
  { id: 'produce', title: 'Produce' },
  { id: 'meat', title: 'Meat' },
  { id: 'seafood', title: 'Seafood' },
  { id: 'eggs_dairy', title: 'Dairy & Eggs' },
  { id: 'bulk_pantry', title: 'Pantry & Bulk' },
  { id: 'frozen', title: 'Frozen' },
];

const SECTION_RANK = new Map(LIST_SECTIONS.map((s, i) => [s.id, i]));

/* FROZEN IS A LOCATION RULE ON TOP OF A KNOWLEDGE MATCH, and it is not a second matcher.

   The counter's sections file KNOWLEDGE: `frozen_vs_fresh_produce` is a produce card because
   it is about produce. But a cart section answers a different question — where in the
   building do I walk — and nobody walks to produce for frozen peas. Left alone, "frozen
   broccoli" sorted into Produce while "frozen pizza" (no card) fell to the trailing group,
   splitting one freezer across two places on the same list.

   So the card decides WHAT this item is about and this decides WHERE it is. One regex, on
   the name, applied after matching and never instead of it. */
const FROZEN = /\bfrozen\b/i;

/**
 * Where a row sits on the walk. Null means the trailing group.
 *
 * Reads the STORED `cardSection` rather than re-deriving it, so a completed trip keeps the
 * order it was shopped in even after the corpus is refiled or a card is retired.
 */
export function sectionForItem(item) {
  if (!item) return null;
  if (FROZEN.test(item.name || '')) return 'frozen';
  const s = item.cardSection;
  return SECTION_RANK.has(s) ? s : null;
}

/** Sort key for a section id. Unmatched sorts last, which is what the trailing group is. */
export function sectionRank(id) {
  return SECTION_RANK.has(id) ? SECTION_RANK.get(id) : LIST_SECTIONS.length;
}

/* ═══════════════════════════ Matching one item ═══════════════════════════ */

/**
 * The card a written grocery item resolves to, or null.
 *
 * A HOME CARD NEVER ATTACHES TO A LIST ITEM, and it falls through rather than failing.
 * `kind === 'home'` is kitchen technique: what to do with food you already own. Writing
 * "lettuce" on a list matches `revive_greens` outright — "limp is water loss, not spoilage,
 * it comes back" — which is a true and useful card and the wrong answer to a shopper
 * standing in produce deciding what to buy. It is the same category error the projection
 * already prevents one step later by suppressing add-to-cart on home cards; this is that
 * rule applied one step earlier, where the item is created.
 *
 * @returns {{ slug:string, section:string|null, score:number }|null}
 */
export function matchItemToCard(name) {
  const q = String(name || '').trim();
  if (!q) return null;

  for (const c of scoreEntries(q, CANDIDATES)) {
    if (c.score < CONFIDENT || c.aliasScore <= 0) continue;
    if (kindFor(c.entry.id) === 'home') continue;
    return {
      slug: c.entry.id,
      section: sectionForCategory(c.entry.category),
      score: c.score,
    };
  }
  return null;
}

/* ═══════════════════════════ Attaching to a whole list ═══════════════════════════ */

// Rows worth matching. A SCANNED row already carries a verdict from the engine — the whole
// point of scanning it — and a SWAP row is one of Kristy's haul notes rather than a grocery.
// Attaching a counter card to either would be a second opinion nobody asked for.
const MATCHABLE = new Set(['user', 'imported', 'template']);

// Rows the SHOPPER named. Only these produce a gap when they match nothing: a template row
// is Kristy's own pick from her own vocabulary, so logging its misses would fill the
// authoring backlog with our words instead of theirs — which is the one thing that backlog
// exists to avoid.
const SHOPPER_AUTHORED = new Set(['user', 'imported']);

/**
 * Attach cards to every matchable row that has not been looked at yet.
 *
 * IDEMPOTENT BY CONSTRUCTION, exactly like attachOffers. `carded` is stamped on every row
 * this inspects — including the ones that matched nothing — so a reload, a save or a
 * check-off can never re-run the matcher over a row, and can never log its miss twice. A
 * gap counted once per save instead of once per item would make the authoring backlog a
 * measure of how often someone opened the app.
 *
 * @param {object} list  a sanitized list doc
 * @param {object} [opts]
 * @param {boolean} [opts.log=true]  write unmatched shopper-authored rows to counter_gaps
 */
export function attachCards(list, { log = true } = {}) {
  if (!list || !Array.isArray(list.items)) return list;

  let changed = false;
  const items = list.items.map((it) => {
    if (it.carded || !MATCHABLE.has(it.source)) return it;
    changed = true;

    const hit = matchItemToCard(it.name);
    if (!hit) {
      // The miss IS the product signal. Someone writing "kombucha" every week with nothing
      // behind it is the authoring queue writing itself out of real intent, which is the
      // one thing you cannot collect retroactively.
      if (log && SHOPPER_AUTHORED.has(it.source)) {
        logCounterGap({ question: it.name, outcome: 'miss', source: 'list' });
      }
      return { ...it, carded: true };
    }

    return {
      ...it,
      carded: true,
      cardSlug: hit.slug,
      // Denormalized on purpose: a completed trip has to keep its walking order even if the
      // card is later refiled or retired. Recomputing at render would let history shift.
      ...(hit.section ? { cardSection: hit.section } : {}),
    };
  });

  return changed ? { ...list, items } : list;
}

/* ═══════════════════════════ Collapse ═══════════════════════════ */

/**
 * Group matched rows by the card they share.
 *
 * MANY ITEMS ROUTINELY MAP TO ONE CARD — blueberries and strawberries both land on
 * `berries_picking`, pineapple and avocados both on `produce_ripeness_by_item`. Rendering
 * that card twice reads as a bug, so the card appears once with the items that summoned it
 * named against it.
 *
 * Returns rows in list order, each either a single uncarded item or a card with its items.
 * Order is taken from the FIRST item that claimed each card, so a collapse never moves a
 * row further than to the position of its earliest sibling.
 */
export function collapseByCard(items = []) {
  const out = [];
  const bySlug = new Map();
  for (const it of items) {
    if (!it?.cardSlug) {
      out.push({ slug: null, section: sectionForItem(it), items: [it] });
      continue;
    }
    const hit = bySlug.get(it.cardSlug);
    if (hit) {
      hit.items.push(it);
      continue;
    }
    const group = { slug: it.cardSlug, section: sectionForItem(it), items: [it] };
    bySlug.set(it.cardSlug, group);
    out.push(group);
  }
  return out;
}

/**
 * The whole list, grouped into walking order: the five counter sections, then frozen, then
 * everything with no card at all.
 *
 * AN UNMATCHED ITEM KEEPS ITS CART CATEGORY AS A LABEL rather than earning a section of its
 * own. "Bakery" and "Snacks" were cart sections and are not counter sections; a shopper who
 * wrote "sourdough" should still see the word Bakery next to it, but inventing an aisle for
 * two picks would rebuild the drifting second index this reconciliation just removed.
 */
export function groupForWalk(items = []) {
  const groups = collapseByCard(items);
  const bySection = new Map();
  for (const g of groups) {
    const key = g.section || null;
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(g);
  }

  const out = [];
  for (const s of LIST_SECTIONS) {
    const rows = bySection.get(s.id);
    if (rows?.length) out.push({ id: s.id, title: s.title, rows });
  }
  const rest = bySection.get(null);
  if (rest?.length) out.push({ id: null, title: 'Everything else', rows: rest });
  return out;
}
