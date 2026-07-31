// The counter's card corpus — one renderable shape for every answer.
//
// A shopper standing at a counter has about two seconds and one hand. The old card
// opened with a topic name, a decision, a why-line and a three-item checklist, which
// is more than anyone reads in an aisle. The card is now split: a SUMMARY that answers
// "what do I do right now", and an EXPANDED read behind one tap.
//
//   SUMMARY   eyebrow · tier badge · headline (the verdict) · do (the physical action)
//             · an optional add-to-cart. Three lines and an action. Nothing else.
//   EXPANDED  why · look_for[] · watch_out[] · tier_note, and the full authored depth.
//
// TWO RULES THIS FILE EXISTS TO HOLD:
//
//   THE KB REMAINS THE SOURCE OF RECORD. counter_cards is a PROJECTION of
//   kristy_perimeter_kb.json, never a replacement for it. Every curated row is
//   re-derived from the KB on every migration run, so the migration is idempotent and
//   the KB stays the thing you edit.
//
//   THE SPLIT IS A RE-RANKING, NEVER A TRUNCATION. Every sentence the KB holds lands
//   somewhere in the new shape. `coverage()` proves it per entry rather than trusting
//   it, and the migration refuses to report success while anything is unplaced. This
//   is the same discipline the decision-first inversion already followed: the depth is
//   demoted, never deleted.
//
// No claim is invented here. `do` lines are authored by hand and reviewed in
// docs/do-lines-review.md; everything else is authored KB content re-ordered. This
// file writes to the shared pool and therefore may never read per-user state.

import { readFileSync } from 'node:fs';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { PERIMETER_SECTIONS } from './perimeter.js';

export const TABLE = 'counter_cards';

/* ═══════════════════════════ Section ═══════════════════════════ */

// The KB files entries by animal and aisle (`beef`, `poultry`, `bulk_pantry`); the
// shopper walks sections (`meat`, `Pantry & Bulk`). One card gets ONE home section —
// the cross-listing of label terms into the sections where they are actually read is
// a browse-time lens and stays in perimeter.js, where it already lives.
const SECTION_BY_CATEGORY = (() => {
  const map = new Map();
  for (const s of PERIMETER_SECTIONS) for (const c of s.categories) map.set(c, s.id);
  return map;
})();

export function sectionForCategory(category) {
  return SECTION_BY_CATEGORY.get(String(category || '')) || null;
}

/* ═══════════════════════════ Shelf card or home card ═══════════════════════════ */

// Three cards are about washing, storing and keeping. There is no store action to
// name on them, and inventing one to satisfy the shape would be worse than saying so:
// a `do` line that fakes an aisle action is exactly the generic filler the redesign
// exists to kill. They keep a `do` line and the same ≤14-word imperative bar — the
// observable is in the kitchen instead of the aisle — and the client renders them with
// a distinct eyebrow and no add-to-cart.
//
// Authored, not detected. A heuristic over "does this sound like a kitchen?" would be
// wrong on the interesting cases and there are only ever a handful.
const HOME_CARDS = new Set(['washing_produce', 'egg_storage', 'produce_storage']);

export function kindFor(slug) {
  return HOME_CARDS.has(slug) ? 'home' : 'shelf';
}

/* ═══════════════════════════ Sentences ═══════════════════════════ */

/**
 * Split prose into sentences. Deliberately simple: the KB is hand-authored plain
 * prose with no abbreviations that end in a period, so a smarter splitter would only
 * add ways to be wrong. Keeps the terminator so a rejoin is lossless.
 */
export function sentences(text) {
  const s = String(text || '').trim();
  if (!s) return [];
  return s.match(/[^.!?]+[.!?]*\s*/g)?.map((x) => x.trim()).filter(Boolean) || [s];
}

/* ═══════════════════════════ look_for vs watch_out ═══════════════════════════ */

// A buying tip is either something to DO at the shelf or a trap to avoid. The KB
// wrote both into one `buying_tips` list; the new card separates them, because "the
// common mistake" is a different kind of help from "the thing to check".
//
// Detection is on the AUTHORED WORDING, not on a judgment about the content — a tip
// that opens with a negation or names a marketing trap is a watch-out. Nothing is
// rewritten and nothing is invented; a tip that matches nothing stays a look-for,
// which is the safe default.
const CAUTIONARY = [
  /^(don['’]t|do not|never|avoid|ignore|skip|beware|watch out|resist)\b/i,
  /^(not?\b|neither\b)/i,
  /\b(means? nothing|says? nothing|is not a|are not a|isn['’]t a|aren['’]t a|no guarantee|not a guarantee)\b/i,
  /\b(marketing|marketing term|unregulated|meaningless|misleading|a trap)\b/i,
  /\bdon['’]t pay\b/i,
  // The commonest shape of a trap in this KB: a front-of-pack word that is really a
  // disclosure about what was added or swapped in. "No-stir means palm oil was
  // added." "Reduced-fat usually replaces the fat with sugar."
  /\b(usually |often |generally )?(replaces?|replaced) the \w+ with\b/i,
  /\bmeans? (that )?\w[\w\s-]{0,30}\b(was|were|is|are) added\b/i,
];

export function isCautionary(tip) {
  const t = String(tip || '').trim();
  return CAUTIONARY.some((re) => re.test(t));
}

// A decoded label is a watch-out when its own authored meaning says the word on the
// front does not mean what a shopper would assume. These are the richest, least
// ambiguous source of "the marketing term" on the card — the KB already wrote the
// debunk, so nothing is invented by promoting it.
const LABEL_DEBUNK =
  /\b(means? (essentially )?nothing|says? nothing|no (quality|nutrition|meaningful|real) difference|not a (standard|guarantee|grading|quality|claim)|unregulated|not regulated|no legal|does not mean|doesn['’]t mean|effectively off the market|is a freebie|nothing about)\b/i;

export function isLabelDebunk(label) {
  return LABEL_DEBUNK.test(String(label?.meaning || ''));
}

const MAX_WATCH_OUT = 3;

/**
 * Split the authored content into the two expanded lists.
 *
 * A promoted label is REMOVED from labels_decoded rather than copied, so it renders
 * once. Watch-outs are capped at 3 per the card shape; anything past the cap falls
 * back to its original list rather than off the card, so the cap can never lose a
 * sentence — which is what makes the projection provably lossless.
 */
export function splitTips(tips = [], labels = []) {
  const look = [];
  const watch = [];
  for (const t of tips) {
    if (isCautionary(t) && watch.length < MAX_WATCH_OUT) watch.push(t);
    else look.push(t);
  }
  const keptLabels = [];
  for (const l of labels) {
    if (isLabelDebunk(l) && watch.length < MAX_WATCH_OUT) watch.push(`${l.term} — ${l.meaning}`);
    else keptLabels.push(l);
  }
  return { look_for: look, watch_out: watch, labels_decoded: keptLabels };
}

/* ═══════════════════════════ The tier note ═══════════════════════════ */

// What the tier this card carries is actually worth. Read from the KB's own authored
// `evidence_tiers` rubric — the tier is a claim about evidence, so its explanation has
// to come from the same authored source everything else does, never from a paraphrase
// written at migration time.
// An entry may override the rubric with its own authored note. Raw milk is why this
// exists: the tier describes what KIND of claim the card makes — a traditional
// practice and a sourcing preference — and the generic rubric line would read as a
// safety rating on the one card where that is least acceptable. Where an entry writes
// its own `tier_note`, it wins.
export function tierNote(entryOrTier) {
  if (entryOrTier && typeof entryOrTier === 'object') {
    if (entryOrTier.tier_note) return entryOrTier.tier_note;
    return (perimeterKb.evidence_tiers || {})[entryOrTier.evidence_tier] || null;
  }
  return (perimeterKb.evidence_tiers || {})[entryOrTier] || null;
}

/* ═══════════════════════════ The projection ═══════════════════════════ */

// The expanded `why` is the reasoning, in 2–3 sentences. It opens with the KB's own
// one-line `why` (which the old summary carried as a deck and the new summary drops)
// and continues into `short_answer`. Whatever does not fit is not cut — it heads the
// `detail` read, so the join of card.why + card.detail contains every sentence the
// entry held.
const WHY_SENTENCES = 3;

/**
 * Project one authored KB entry into a card.
 *
 * @param {object} entry  a kristy_perimeter_kb.json entry
 * @param {object} [opts]
 * @param {string} [opts.doLine]  the reviewed `do` line for this slug
 * @returns {object} the card, in the shape the client renders
 */
export function projectEntry(entry, { doLine = '' } = {}) {
  const short = sentences(entry.short_answer);
  const lead = [entry.why, ...short].filter(Boolean);

  // An entry may author its expanded read outright as `card_why`. Where it does, the
  // deck and the short answer are not displaced — they head the long read, so the
  // projection stays lossless either way.
  const authoredWhy = String(entry.card_why || '').trim();
  const why = authoredWhy || lead.slice(0, WHY_SENTENCES).join(' ');
  const spill = authoredWhy ? lead : lead.slice(WHY_SENTENCES).filter((s) => s !== entry.why);

  const split = splitTips(entry.buying_tips || [], entry.labels_decoded || []);
  // An AUTHORED watch_out always wins over the derived one. Some traps cannot be
  // detected from wording — the group a raw-dairy card names once, the whole Label
  // terms section — and a heuristic that guessed at them would be worse than useless.
  // When it wins, the cautionary tips it displaces stay in look_for rather than
  // vanishing, which is what keeps the projection lossless.
  const authoredWatch = Array.isArray(entry.watch_out) && entry.watch_out.length;
  const watch_out = authoredWatch ? entry.watch_out : split.watch_out;
  const look_for = authoredWatch
    ? [...split.look_for, ...split.watch_out]
    : split.look_for;
  const labels_decoded = authoredWatch ? entry.labels_decoded || [] : split.labels_decoded;

  const kind = kindFor(entry.id);

  return {
    slug: entry.id,
    section: sectionForCategory(entry.category),
    topic: entry.title,
    kind,

    // ── summary ──
    eyebrow: entry.title,
    headline: entry.decision || '',
    do: String(doLine || '').trim(),
    tier: entry.evidence_tier || null,
    // A home card is about washing, storing or keeping. There is nothing to add to a
    // cart from one, so the CTA is suppressed structurally rather than left to the
    // renderer to remember.
    cta_item: kind === 'home' ? null : entry.cart_pick || null,

    // ── expanded ──
    why,
    look_for,
    watch_out,
    tier_note: tierNote(entry),

    // ── the depth, so nothing is dropped ──
    detail: [...spill, entry.detail].filter(Boolean).join(' '),
    kristy_take: entry.kristy_take || '',
    labels_decoded,
    sources: entry.sources || [],

    source: 'curated',
    query_seed: null,
  };
}

/* ═══════════════════════════ Losslessness, proven ═══════════════════════════ */

// Normalized for comparison only — the stored text keeps its authored punctuation.
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Every unit of authored content on an entry, as { field, text }. The migration
 * checks each one landed somewhere on the card. A unit is a sentence for prose and a
 * whole item for a list, because a list item is the authored unit.
 */
export function contentUnits(entry) {
  const out = [];
  const push = (field, text) => {
    const t = String(text || '').trim();
    if (t) out.push({ field, text: t });
  };
  push('decision', entry.decision);
  push('why', entry.why);
  push('card_why', entry.card_why);
  push('tier_note', entry.tier_note);
  for (const s of sentences(entry.short_answer)) push('short_answer', s);
  for (const s of sentences(entry.detail)) push('detail', s);
  push('kristy_take', entry.kristy_take);
  for (const t of entry.buying_tips || []) push('buying_tips', t);
  for (const w of entry.watch_out || []) push('watch_out', w);
  for (const l of entry.labels_decoded || []) push('labels_decoded', `${l.term} ${l.meaning}`);
  for (const s of entry.sources || []) push('sources', s);
  if (entry.cart_pick) push('cart_pick', entry.cart_pick);
  return out;
}

/**
 * Which authored units did NOT survive the projection.
 *
 * @returns {{ total:number, unmapped:Array<{field,text}> }}
 */
export function coverage(entry, card) {
  const haystack = norm(
    [
      card.headline,
      card.why,
      card.detail,
      card.kristy_take,
      card.cta_item,
      card.eyebrow,
      card.tier_note,
      ...(card.look_for || []),
      ...(card.watch_out || []),
      ...(card.labels_decoded || []).map((l) => `${l.term} ${l.meaning}`),
      ...(card.sources || []),
    ].join('   ')
  );
  const units = contentUnits(entry);
  const unmapped = units.filter((u) => !haystack.includes(norm(u.text)));
  return { total: units.length, unmapped };
}

/* ═══════════════════════════ The reviewed do lines ═══════════════════════════ */

// The `do` line is the whole point of the card and the one field that cannot be
// derived — it names a physical action at the shelf, which no re-ranking of authored
// prose produces. So it is drafted, REVIEWED BY HAND in docs/do-lines-review.md, and
// read back from that file here. The markdown table is the source; this parser is the
// contract between it and the migration, which is why it lives beside the projection
// and is tested rather than buried in a script.
//
// Row shape: | slug | section | current headline | proposed do | flag |
const REVIEW_COLUMNS = 5;

/**
 * Parse docs/do-lines-review.md into { slug -> { do, flag } }.
 * Tolerant of the separator row, of surrounding prose, and of a table that has been
 * hand-edited with different column padding — all three are what a reviewed file
 * actually looks like.
 */
export function parseReviewTable(markdown) {
  const out = new Map();
  for (const raw of String(markdown || '').split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== REVIEW_COLUMNS) continue;
    // The separator row (|---|---|) and the header row are not data.
    if (/^:?-{3,}:?$/.test(cells[1])) continue;
    const slug = cells[0].replace(/^`|`$/g, '').trim();
    if (!slug || slug.toLowerCase() === 'slug') continue;
    out.set(slug, { do: cells[3], flag: cells[4] });
  }
  return out;
}

/* ═══════════════════════════ Row mapping ═══════════════════════════ */

// `do` is a reserved keyword in Postgres, so the column is `do_line`. These two
// functions are the ONLY place the two names meet — everything upstream and the whole
// client render path call it `do`, exactly as the card shape specifies.

export function cardToRow(card) {
  const { do: doLine, ...rest } = card;
  return { ...rest, do_line: doLine || null };
}

export function rowToCard(row) {
  if (!row) return null;
  const { do_line: doLine, ...rest } = row;
  return { ...rest, do: doLine || '' };
}

/* ═══════════════════════════ Reading the corpus ═══════════════════════════ */

// The client renders CARDS, and counter_cards is where they live — including the ones
// Pass 3 generates, which is the whole reason the table exists rather than the projection
// being computed per request.
//
// THIS MODULE MAY NEVER READ PER-USER STATE. It writes to the shared pool, and
// privacyLine.test.js forbids it importing the per-user readers, because that import is
// what a join would have to look like. The read path lives here for the same reason the
// write path does: one module, one rule, one test covering both.

// The reviewed do lines, for the degraded path only. Read once at load, and optional —
// on a server whose deploy does not carry docs/ this simply stays empty, which is a
// thinner fallback rather than a broken one.
const fallbackDoLines = (() => {
  try {
    const url = new URL('../../docs/do-lines-review.md', import.meta.url);
    return parseReviewTable(readFileSync(url, 'utf8'));
  } catch {
    return new Map();
  }
})();

/**
 * Project the whole authored KB, for when the table cannot be reached.
 *
 * Degrading to the KB is honest: every curated card in the table was derived from it, so
 * the shopper gets the same answer. What is lost is the generated cards, which is the
 * correct thing to lose — a generated card is the one thing that exists nowhere else.
 */
export function projectAll() {
  return (perimeterKb.entries || []).map((e) =>
    projectEntry(e, { doLine: fallbackDoLines.get(e.id)?.do || '' })
  );
}

const CARD_COLUMNS =
  'slug, section, topic, kind, eyebrow, headline, do_line, tier, cta_item, why, ' +
  'look_for, watch_out, tier_note, detail, kristy_take, labels_decoded, sources, source, use_count';

// A real select, never a head:true count — PostgREST answers 204 / null / no error for a
// table that does not exist, which reads as "present, empty" and would render the counter
// as an empty store rather than as a degraded one.
async function selectCards(client, apply) {
  if (!client) return null;
  try {
    const { data, error } = await apply(client.from(TABLE).select(CARD_COLUMNS));
    if (error) return null;
    return (data || []).map(rowToCard);
  } catch {
    return null;
  }
}

/**
 * One card by slug. Falls back to the KB projection when the table is unreachable.
 * @param {string} slug
 * @param {object} [client]  injectable Supabase client — the store is testable without a database
 */
export async function getCard(slug, client) {
  const id = String(slug || '').trim();
  if (!id) return null;
  const rows = await selectCards(client, (q) => q.eq('slug', id).limit(1));
  if (rows && rows.length) return rows[0];
  if (rows) return null; // the table answered, and it has no such card
  return projectAll().find((c) => c.slug === id) || null;
}

/**
 * Every card in a browse section, curated and generated alike.
 */
export async function getSectionCards(section, client) {
  const id = String(section || '').trim();
  if (!id) return [];
  const rows = await selectCards(client, (q) => q.eq('section', id).order('slug'));
  if (rows) return rows;
  return projectAll().filter((c) => c.section === id);
}

/**
 * The whole corpus. Used by the browse index and by the skim tests, which have to render
 * every card rather than a sample — a bar that holds for six cards is not a bar.
 */
export async function getAllCards(client) {
  const rows = await selectCards(client, (q) => q.order('slug'));
  return rows || projectAll();
}

/* ═══════════════════════════ Retrieving a generated card ═══════════════════════════ */

// STAGE TWO of retrieval, and it only ever runs when the curated matcher missed.
//
// The alternative designs all lose. Query-per-request puts a network round trip on the
// free layer's hot path, which today has none. Reload-on-persist keeps an in-memory index
// that a SECOND INSTANCE never learns about, so it regenerates a card that already exists
// — the one failure "never generate what already exists" is meant to prevent, and the one
// that costs money rather than accuracy. A TTL just shortens that window.
//
// So: nothing is cached. Curated cards score from memory (they only change by migration).
// Generated cards are queried only on a curated miss — the path that was about to spend a
// model call anyway, where one round trip is free by comparison.
const GENERATED_FETCH_CAP = 500;

/**
 * Every generated card, most-used first, for scoring against a question the curated KB
 * could not answer.
 *
 * @returns {Promise<{cards:Array, truncated:boolean, unavailable:boolean}>}
 */
export async function getGeneratedCards(client) {
  if (!client) return { cards: [], truncated: false, unavailable: true };
  try {
    const { data, error } = await client
      .from(TABLE)
      .select(CARD_COLUMNS + ', aliases')
      .eq('source', 'generated')
      .order('use_count', { ascending: false })
      .limit(GENERATED_FETCH_CAP);
    if (error) throw new Error(error.message);
    const cards = (data || []).map(rowToCard);
    return {
      cards,
      // A silent cap reads as "scored everything" when it did not. gapFeed already
      // reports truncation the same way, for the same reason.
      truncated: cards.length >= GENERATED_FETCH_CAP,
      unavailable: false,
    };
  } catch (err) {
    // The corpus is unreachable. That is a reason to generate, not to fail — but the
    // caller needs to know it could not check, so it is reported rather than swallowed.
    console.warn('[kristy] generated cards unavailable:', err?.message || err);
    return { cards: [], truncated: false, unavailable: true };
  }
}

/**
 * Score a question against generated cards using their authored aliases — the same
 * deterministic shape the curated matcher uses, which is exactly why the generator is
 * required to emit aliases and the lint fails a card without them.
 */
export function scoreGenerated(question, cards) {
  const q = ` ${String(question || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  if (q.trim().length < 2) return [];
  const scored = [];
  for (const c of cards || []) {
    let score = 0;
    for (const alias of c.aliases || []) {
      const a = String(alias || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      if (a && q.includes(` ${a} `)) score += Math.min(3, a.split(' ').length) + 1;
    }
    if (score > 0) scored.push({ card: c, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/** Bump the use counter on a retrieval hit. Fire-and-forget; a shopper never waits on it. */
export async function bumpUseCount(slug, client, current = 0) {
  if (!client || !slug) return;
  try {
    await client
      .from(TABLE)
      .update({ use_count: Number(current) + 1 })
      .eq('slug', slug);
  } catch (err) {
    console.warn('[kristy] use_count not bumped:', err?.message || err);
  }
}
