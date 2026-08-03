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

import { scoreEntries, perimeterKb } from './perimeter.js';
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

/* A ROW MUST NOT DISPLAY A SECTION IT IS NOT SORTED INTO, and it used to do exactly that.

   Sorting read `cardSection`, which only exists when a card matched. The LABEL beside an
   unmatched row read the cart CATEGORY, which exists either way. So "Baby spinach" —
   category Produce, no card — sorted into "Everything else" and rendered the word Produce
   next to itself, three times on one twelve-item list. Two vocabularies again, which is
   the thing the counter-section reconciliation was supposed to have ended.

   This is the translation between them, and it is a translation rather than a second index
   because the OUTPUT is always a counter section id — the counter's vocabulary still wins.
   It is deliberately tiny: only the cart categories that name the SAME aisle a walk section
   names. 'Protein' spans meat, seafood and dairy, so it maps to nothing and stays a label;
   'Bakery' and 'Snacks' are not aisles the counter covers, so they stay labels too. That is
   what the mock showed as well — Sourdough sat under "Everything else" wearing "Bakery". */
const CATEGORY_SECTION = new Map([
  ['produce', 'produce'],
  ['dairy & eggs', 'eggs_dairy'],
]);

/** The walk section a cart CATEGORY names, or null if it does not name one. */
export function sectionForCartCategory(category) {
  return CATEGORY_SECTION.get(String(category || '').trim().toLowerCase()) || null;
}

/**
 * Where a row sits on the walk. Null means the trailing group.
 *
 * Prefers the STORED `cardSection` rather than re-deriving it, so a completed trip keeps
 * the order it was shopped in even after the corpus is refiled or a card is retired. The
 * cart category is a FALLBACK for rows no card claimed, never an override.
 */
export function sectionForItem(item) {
  if (!item) return null;
  if (FROZEN.test(item.name || '')) return 'frozen';
  const s = item.cardSection;
  if (SECTION_RANK.has(s)) return s;
  return sectionForCartCategory(item.category);
}

/** Sort key for a section id. Unmatched sorts last, which is what the trailing group is. */
export function sectionRank(id) {
  return SECTION_RANK.has(id) ? SECTION_RANK.get(id) : LIST_SECTIONS.length;
}

/* ═══════════════════════════ Matching one item ═══════════════════════════ */

const BY_ID = new Map((perimeterKb.entries || []).map((e) => [e.id, e]));

/** The KB entry behind a slug, or null. */
export function entryById(slug) {
  return BY_ID.get(String(slug || '')) || null;
}

/* LABEL CARDS ARE NOT AISLE CARDS, and they must not attach to a list row.

   `label_terms` is a REFERENCE section on the Counter — eighteen entries explaining what a
   phrase on a package means. LIST_SECTIONS deliberately omits it, and its own comment says
   why: nobody walks to it. But `matchItemToCard` did not know that, so a label card could
   still win a row, and when one did the row got a `cardSlug` with a section the walk has no
   place for — which resolved to null and dropped the row into "Everything else".

   "Pasture-raised eggs" is the case: `label_pasture_raised_feed` (8) beat `egg_labels` (6),
   so the row carried a card, showed no trailing label because it HAD a card, and sat in the
   trailing group anyway. It is the same category error as a home card — a true card that
   answers a different question than the one a shopper standing in an aisle is asking — so
   it gets the same treatment: fall through to the next candidate, never fail outright. */
const NON_AISLE_SECTIONS = new Set(['label_terms']);

/* ── The state guard ──────────────────────────────────────────────────────────────────

   A WRONG DO LINE IS WORSE THAN NO DO LINE, and the way this matcher produced one was
   always the same: a long item name whose HEAD is a preparation state, matching a card on
   a bare noun buried further along.

     "Canned skipjack tuna"           -> fish_freshness_at_counter, on the alias "tuna"
     "Frozen broccoli or green beans" -> beans_dried_vs_canned,     on the alias "beans"

   Both scored legitimately. `fish_freshness_at_counter` really does carry the bare alias
   "tuna", `beans_dried_vs_canned` really does carry "beans", and both cleared the alias
   floor honestly. The floor was never the problem — the card was about a DIFFERENT STATE
   of the same food, and nothing in the score can express that. Telling someone to check
   their tuna is bedded in ice is wrong in a way that "no card" is not.

   So: if the item names a state and the card is about a state, they have to share one.
   BOTH sides must be non-empty for the guard to fire, which is what stops it over-refusing
   — "Raw or dry-roasted almonds" names a state and `nuts_raw_vs_roasted` names none, so
   the guard stays out of it. This is a deliberate, explicit list in the same spirit as
   IMPERATIVE_VERBS: widening it is an act, not a heuristic. */
const STATES = {
  frozen: /\bfrozen\b/,
  canned: /\bcanned\b|\btinned\b|\bin a can\b/,
  dried: /\bdried\b|\bdry\b/,
  fresh: /\bfresh\b/,
};

function statesIn(text) {
  const t = ` ${String(text || '').toLowerCase()} `;
  const out = new Set();
  for (const [name, re] of Object.entries(STATES)) if (re.test(t)) out.add(name);
  return out;
}

/** The states a CARD is about — read from its own title and aliases, never hand-assigned. */
function cardStates(entry) {
  return statesIn([entry?.title || '', ...(entry?.aliases || [])].join(' '));
}

/**
 * True when the item's preparation state contradicts the card's.
 *
 * Silent when either side names no state at all, which is the common case.
 */
export function stateContradicts(name, entry) {
  const want = statesIn(name);
  if (!want.size) return false;
  const has = cardStates(entry);
  if (!has.size) return false;
  for (const s of want) if (has.has(s)) return false;
  return true;
}

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
    if (NON_AISLE_SECTIONS.has(sectionForCategory(c.entry.category))) continue;
    if (stateContradicts(q, c.entry)) continue;
    return {
      slug: c.entry.id,
      section: sectionForCategory(c.entry.category),
      score: c.score,
    };
  }
  return null;
}

/**
 * The card for a whole ROW, which is not the same question as the card for a NAME.
 *
 * AN AUTHORED `perimeterId` IS GROUND TRUTH AND OUTRANKS RETRIEVAL. A PICK names the entry
 * its judgment came from — that is what the field is for, it is claim-locked, and it was
 * chosen by a person. Retrieval is a guess about a string. Running the guess over a row
 * that already carried the answer is how "Canned skipjack tuna", authored to
 * `mercury_by_fish`, ended up telling a shopper to check the ice at a counter it will never
 * be sold from.
 *
 * Measured over the 51 shipping PICKS: 22 carry an authored id, and retrieval overrode 6 of
 * them and lost a 7th. That is a 27% error rate on the only rows where a ground truth
 * exists to check against — and the Phase 1 probe could not see any of it, because it asked
 * "did something match", never "did the RIGHT thing match".
 *
 * The authored id is still validated: an entry that has been retired, refiled as a home
 * card or filed to a non-aisle section falls through to retrieval rather than attaching
 * something the corpus no longer stands behind.
 */
export function cardForItem(item) {
  const authored = item?.perimeterId ? entryById(item.perimeterId) : null;
  if (
    authored &&
    kindFor(authored.id) !== 'home' &&
    !NON_AISLE_SECTIONS.has(sectionForCategory(authored.category))
  ) {
    return { slug: authored.id, section: sectionForCategory(authored.category), score: null };
  }
  return matchItemToCard(item?.name);
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

    const hit = cardForItem(it);
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
