// Shop deck pages, read straight from the authored KB for GET /api/counter/deck.
// Free counter content, deterministic, no model and no stored data. The wire carries only
// what the iOS DeckEntry decodes; entry depth (why, buying_tips, sources) and the deck's
// own `sources` list never ride along. Row `src` is a public URL kept for traceability.
import { perimeterKb } from './perimeter.js';

const kindOf = (e) => e.kind || 'card';

function aisleOf(e, byId) {
  if (e.kind === 'aisle') return e.id;
  if (e.kind === 'family') return e.category || null;
  return byId.get(e.family)?.category || null;
}

// iOS maps a list block to a page by slug: a card deck covers itself, a family deck its members.
function cardsOf(e, entries) {
  if (e.kind === 'aisle') return undefined;
  if (e.kind === 'family') return entries.filter((x) => x.family === e.id && x.kind == null).map((x) => x.id);
  return [e.id];
}

const publicRow = ({ mark, lead, sub, src }) => ({ mark, lead, ...(sub != null && { sub }), ...(src != null && { src }) });

export function publicDeck(entry, entries = perimeterKb.entries || []) {
  if (!entry?.deck) return null;
  const byId = new Map(entries.map((e) => [e.id, e]));
  const cards = cardsOf(entry, entries);
  return {
    id: entry.id,
    kind: kindOf(entry),
    title: entry.title,
    aisle: aisleOf(entry, byId),
    ...(cards && { cards }),
    grab: entry.deck.grab,
    blocks: (entry.deck.blocks || []).map((b) => ({ label: b.label, rows: (b.rows || []).map(publicRow) })),
  };
}

/** `{ [entry id]: deck }` for every KB entry that carries a deck, in KB order. */
export function deckFeed(entries = perimeterKb.entries || []) {
  return Object.fromEntries(entries.filter((e) => e?.deck).map((e) => [e.id, publicDeck(e, entries)]));
}
