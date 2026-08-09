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

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from './doLines.json' with { type: 'json' };
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
const HOME_CARDS = new Set([
  'washing_produce', 'egg_storage', 'produce_storage',
  // The kitchen-technique class, 2026-08-02. These are not "no store action to name" the
  // way the three above are — they are cards whose whole subject IS the action, and it
  // happens at home. `whole_spices` is the awkward one: its verdict ("buy whole") is a
  // shelf decision and only its do line is a kitchen one, so it is the member of this set
  // most likely to want moving back. See the note in the handoff.
  // `whole_spices` was here and is NOT: its verdict ("buy whole") is a purchase decision,
  // and `home` suppresses the add-to-cart in both the projection and the client. A card
  // that tells you what to buy has to be able to put it in the cart.
  'baking_soda_soak', 'bean_soak_salt', 'dry_brine', 'revive_greens', 'freezing_produce',
]);

export function kindFor(slug) {
  return HOME_CARDS.has(slug) ? 'home' : 'shelf';
}

/* ═══════════════════════════ Retired cards ═══════════════════════════ */

// A FOLD IS NOT A DELETION FROM THE KB. The migration UPSERTS on slug and never removes,
// so an entry deleted from kristy_perimeter_kb.json leaves its row alive in counter_cards
// — still retrievable, still matching on its own aliases, still answering shoppers with
// copy that no longer exists in version control. That is the worst possible half-state:
// the card cannot be edited, because the file it came from no longer has it.
//
// So retirement is DECLARED here and the migration deletes these rows as a step of the
// same run that upserts the rest. Fold and delete are one operation or the fold is a bug.
//
// A retired slug's aliases must be moved onto the card that absorbs it, or the questions
// it used to answer stop resolving to anything.
export const RETIRED = [
  // Folded into `beef_grassfed_vs_grainfed` on 2026-08-01. The essentials beef card now
  // states grass-fed AND grass-finished as one standard, which is all this card said, and
  // `label_grass_fed_term` already carried the same content for the Label terms section.
  // Three cards on one label was two too many. Its aliases moved onto the beef card.
  'grassfed_vs_grassfinished',

  /* ── The 2026-08-02 overlap sweep. ──
     The test applied throughout: two things learned, or one thing twice? Overlapping
     SUBJECT is fine and the corpus is full of legitimate hub-and-reference pairs. These
     six were one VERDICT stated twice, so a shopper who read both learned nothing the
     second time. Every alias below moved onto its absorber before the delete. */

  // → cheese_real_vs_processed. One decision (buy the block) wearing two applications,
  // slice it and grate it. The shred card's additive list is the sharper observable and
  // became the survivor's do line.
  'pre_shredded_cheese',
  // → egg_shell_color. One lesson (a visible egg attribute is not a signal) applied to two
  // attributes. The shell card carried the buying action, so it absorbed the yolk card.
  'egg_yolk_color',
  // → olive_oil_grades. "Extra virgin, a harvest date, one country" and "Recent harvest
  // date, dark bottle, one country of origin" are the same verdict twice. The grades card
  // held the ‘pure’/‘light’/pomace decode, so it survived and took the bare `olive oil`
  // alias — which had been sitting on the card that died, making this fold coverage-
  // critical rather than cosmetic.
  'olive_oil_buying',
  // → mercury_by_fish. Identical `why` on both: mercury tracks size and lifespan. The
  // by-fish card holds the full three-tier species list. The can-specific content
  // (‘light’ vs ‘white’) went to canned_fish_choosing, which is already the can card.
  'canned_fish_mercury',
  // → label_cage_free. Both said "this barn label undersells, look for certified
  // pasture-raised". Now one card covering both rungs of the same ladder.
  'label_free_range',
  // → raw_milk, as a look_for. Not a merge: the subject was too narrow to be a card at
  // all. Its do line was "buy an extra bottle of the raw milk and let one sit out", which
  // is an instruction about another card's product.
  'clabber',

];

/* ═══════════════════════════ Retired GENERATED cards ═══════════════════════════ */

// A SECOND LIST, BECAUSE THE DELETE IS SOURCE-SCOPED AND MUST STAY THAT WAY.
//
// The migration deletes RETIRED rows with `.eq('source', 'curated')`, so that a slug
// retired from the KB can never sweep away a generated card that happens to collide with
// it. That protection is correct and worth keeping — which means RETIRED is structurally
// incapable of removing a generated row. Putting a `gen_` slug in it looks like it works,
// reports "retired 11 slugs", deletes nothing, and leaves the card live and answering.
// That is exactly what happened on the first run of the 2026-08-02 sweep.
//
// So generated retirement gets its own list and its own delete, scoped to
// `source = 'generated'`. Each list can only ever remove its own kind.
//
// Three of the four cards the generator has written were duplicates of curated content the
// retrieval gate failed to find — see CONFIDENT in counterAskPipeline.js. That gate is now
// `> 2`, which is the fix; these are the debt it already ran up.
export const RETIRED_GENERATED = [
  // Contradicted the curated `a2_vs_a1_milk` outright ("A2 is a protein-type label, not a
  // whole-food upgrade for yogurt"). It was echoing counterGenerate's own worked FAIL/PASS
  // example, which is why that example was rewritten onto `label_natural` in the same
  // commit — deleting the row alone would have left the anchor that regenerates it.
  'gen_a1_vs_a2_yogurt',
  // → produce_picking_ripeness. "Judge the fruit itself, not the origin sticker" against
  // the curated "Judge the piece, not the sticker". Near-verbatim.
  'gen_picking_good_produce',
  // → produce_ripeness_by_item, which already carried both of these as authored tips and
  // now has the aliases to match them. The cantaloupe card had been served three times.
  'gen_picking_a_ripe_cantaloupe',
  'gen_picking_a_ripe_pineapple',

  // PROMOTED, not folded — the only one of these that was right. It was generated when
  // `produce_ripeness_by_item`'s do line was rewritten to generalize ("smell the stem end
  // on anything that ripens after picking"), which excludes berries by construction:
  // berries are non-climacteric and do not ripen after picking at all. The hub stopped
  // holding a berry verdict, so a card that does is coverage rather than duplication. Its
  // content is now authored in the KB as `berries_picking` and the row is retired like any
  // other. A generated card that owns a subject belongs in version control where it can be
  // edited, not left as a row that survived review.
  'gen_picking_fresh_berries',

  // PURE DUPLICATION of `berries_picking` — same verdict (the underside decides), same
  // action (turn the container over), look_for near-verbatim. It exists only because the
  // curated gate rejected `berries_picking` at score 2 while the generated gate admitted
  // at 2: "are these strawberries fresh" hits one bare alias, gets no title-word overlap,
  // and scored exactly on the line the two operators disagreed about. Fixing the operator
  // is what stops this recurring; folding the row is the cleanup. Its strawberry-specific
  // aliases moved onto `berries_picking`.
  'gen_strawberry_freshness_check',

  // → revive_greens, authored the same day and near-verbatim: "Ice water fixes limp
  // lettuce, never spoiled lettuce" against the curated "Limp is water loss, not
  // spoilage. It comes back." The curated card existed, was correct, and could not be
  // retrieved — it carried "limp lettuce" and "wilted lettuce" but not bare `lettuce`,
  // `limp` or `wilted`, so "my lettuce went limp" scored zero against it. THIRD time a
  // new card has been regenerated through an alias gap. A new card needs the bare nouns
  // and the phrasings people type, not only the ones its title uses.
  'gen_limp_lettuce_revival',
];

/* ═══════════════════════════ The essentials shelf ═══════════════════════════ */

// The eight cards that sit on the counter index itself, readable and expandable without
// any navigation at all. Three taps to an answer — tab, section, card — is a couch
// interaction, and it was occupying the position the store interaction should hold.
//
// AUTHORED HERE, exactly like HOME_CARDS, and projected onto the row by the migration.
// Membership is an editorial decision and belongs in version control where it can be
// reviewed, not in a dashboard UPDATE nobody can diff. It is deliberately NOT derived from
// use_count either: a popularity sort would fill the most valuable space on the surface
// with whatever happened to be asked most last week.
//
// ORDER IS THE LIST ORDER. Two per section by construction, so the shelf stays balanced
// and a cut to six does not need rebalancing.
export const ESSENTIALS = [
  'organic_worth_it_by_type', // Produce
  'egg_labels', // Dairy & Eggs
  'salmon_wild_vs_farmed', // Seafood
  'label_front_vs_back', // Label terms
  'produce_ripeness_by_item', // Produce
  'beef_grassfed_vs_grainfed', // Meat
  'judging_meat_at_the_case', // Meat
  'whole_vs_reduced_fat_milk', // Dairy & Eggs
];

const ESSENTIAL_RANK = new Map(ESSENTIALS.map((slug, i) => [slug, i + 1]));

export function essentialRankFor(slug) {
  return ESSENTIAL_RANK.get(slug) ?? null;
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
    // The shelf renders eight eyebrows stacked, and the KB title is written to name a
    // topic in a list, not to sit beside a tier badge in a 184px slot. Four of the eight
    // clipped. `eyebrow_short` overrides where an entry authors one; the other 74 keep
    // their title, which is why this is a fallback rather than a second field everywhere.
    eyebrow: entry.eyebrow_short || entry.title,
    headline: entry.decision || '',
    do: String(doLine || '').trim(),
    tier: entry.evidence_tier || null,
    // A home card is about washing, storing or keeping. There is nothing to add to a
    // cart from one, so the CTA is suppressed structurally rather than left to the
    // renderer to remember.
    cta_item: kind === 'home' ? null : entry.cart_pick || null,

    // WHAT TO BUY WHEN THE STANDARD IS NOT ON THE SHELF, AND IT IS FREE ON PURPOSE.
    //
    // The redirect was living in `watch_out`, which is PAID — so a shopper who could not
    // afford the standard, i.e. exactly the person the redirect is for, was the one who
    // could not read it. That is the wrong half behind the wall. See VOICE_SPEC, "the best
    // available".
    //
    // ⚠️ NOTHING MOVED FROM PAID TO FREE TO MAKE ROOM FOR THIS. `DEPTH_FIELDS` is untouched
    // and still seven; this is a NEW authored sentence, so the membership loses nothing it
    // used to have. That is what makes it a different act from the `tier_note` promotion,
    // which was a swap.
    //
    // Null where the card has no honest redirect, and null is a real answer rather than a
    // gap to fill: if nothing in or beside the category clears the floor, saying so is the
    // point. `lintCard` enforces the rest — it must name a DIFFERENT thing, never a lesser
    // version of the same one, and it may never read as co-equal with the headline.
    instead: String(entry.instead || '').trim() || null,

    // ── expanded ──
    why,
    look_for,
    watch_out,
    tier_note: tierNote(entry),

    // The KB's own alias table, carried onto the row. Curated cards are matched from the
    // in-memory KB rather than from here, so this is not load-bearing today — but a row
    // that describes how to find itself is the shape a generated card already has, and
    // leaving curated rows blank would make the corpus two different things.
    aliases: Array.isArray(entry.aliases) ? entry.aliases : [],

    // Always emitted, both fields, on every card — not only on the eight. A card dropped
    // from the shelf has to be written back to false, or the migration would leave a
    // stale `true` behind and the shelf would grow by subtraction.
    essential: ESSENTIAL_RANK.has(entry.id),
    essential_rank: essentialRankFor(entry.id),

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

/* ═══════════════════════════ The paid boundary ═══════════════════════════ */

// WHAT IS FREE IS THE SUMMARY, AND IT IS FREE ON EVERY SURFACE, FOREVER: eyebrow, headline,
// do line, cart pick, and THE TIER SENTENCE. A shopper standing in an aisle never hits a
// wall — that is the acquisition engine and the reputation, and it is not negotiable.
//
// `tier_note` MOVED OUT OF THE DEPTH ON 2026-08-04, and it is a SWAP rather than a giveaway.
// The free surface used to carry the tier as a CHIP — "Credible concern" sitting above a
// card about buying organic, a label with no referent, naming a claim it did not make. The
// chip is gone from every surface. But non-negotiable #6 says a reader must ALWAYS know
// whether a claim is settled science, a credible concern or a standard, and the sentence can
// only carry that if the reader receives it: `summarize()` stripped `tier_note`, and only
// the eight essentials are ever full, so 73 of 81 cards would have reached a free shopper
// with NO tier signal at all. Since the chip was already free, promoting the sentence trades
// one free signal for a better one. It buys no depth — `why`, `look_for` and `watch_out` are
// untouched, and they are what the membership is actually for.
//
// WHAT IS PAID IS THE DEPTH. These seven fields and nothing else.
export const DEPTH_FIELDS = [
  'why', 'look_for', 'watch_out', 'detail', 'kristy_take', 'labels_decoded', 'sources',
];

// THE WITHHOLDING HAPPENS HERE, ON THE SERVER, NOT IN THE CLIENT. Before this the whole
// corpus was one unauthenticated GET away — `/api/counter/cards` returned all 82 cards
// with every field to anyone with curl, so the moat was already downloadable. A client
// that merely HIDES depth still received it.
//
// THE TEASER SHIPS GEOMETRY, NEVER WORDS. The first check goes down in full, because a
// shopper has to see that the depth is real. The next few go down as LENGTHS — the true
// character count of each line — so the client can render blocks that wrap exactly where
// the real lines wrap. The counts are true counts. That shows how much is there without
// handing a third of every card to an unpaid caller, which is a strange thing to do in
// the same change that stops handing over all of it.
export function summarize(card) {
  if (!card) return card;
  const rest = { ...card };
  for (const f of DEPTH_FIELDS) delete rest[f];
  const lookFor = Array.isArray(card.look_for) ? card.look_for : [];
  const watchOut = Array.isArray(card.watch_out) ? card.watch_out : [];
  return {
    ...rest,
    locked: true,
    teaser: {
      // Fully legible. The hook is that this is the card's real first check.
      look_for_first: lookFor[0] || null,
      // True per-line lengths for the fade. Three is what fits above a phone fold.
      faded_lengths: lookFor.slice(1, 4).map((t) => String(t).length),
      // "4 more checks, 2 traps." Everything past the one legible line counts as more — a
      // faded line is teased, not read. NO `tier_note` HERE ANY MORE: it is free, it is
      // already on the summary above this tap, and teasing something the reader can see is
      // how a gate starts lying about where it sits.
      remaining: {
        look_for: Math.max(0, lookFor.length - 1),
        watch_out: watchOut.length,
      },
    },
  };
}

/**
 * Apply the boundary to one card.
 *
 * ESSENTIALS ARE ALWAYS FULL, for everyone, and never touch the meter. The eight sit on
 * the index before any navigation: a shopper who spends all three free reads on the shelf
 * never reaches the counter and never learns the other seventy-four exist. Free depth on
 * the shelf proves the reads are worth having; the meter then proves the BREADTH is what
 * the membership buys. Those are different jobs and they need different surfaces.
 */
export function forViewer(card, { premium = false, unlocked = false } = {}) {
  if (!card) return card;
  if (premium || unlocked || card.essential) return card;
  return summarize(card);
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

// The reviewed do lines, read from lib/doLines.json — INSIDE the deploy boundary.
//
// This used to read docs/do-lines-review.md through a try/catch, annotated "a thinner
// fallback rather than a broken one". That judgment was wrong and it is what stopped
// anyone checking: Railway's Root Directory is `server/`, so docs/ never ships, the catch
// fired on every production boot, and the degraded state was not thinner — it was a card
// with no action on it, which is the one field the card exists to carry.
//
// doLines.json is generated from the markdown by scripts/buildDoLines.js and the two are
// held together by doLines.test.js. The import has NO fallback: a missing file fails at
// boot, loudly, which is the correct behaviour for something every card depends on.
const fallbackDoLines = new Map(Object.entries(doLines).map(([slug, line]) => [slug, { do: line }]));

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
  // `instead` is FREE and sits with the summary fields, not the depth. A column missing
  // from this list is served as undefined, which for a free field means the redirect
  // silently stops rendering — the same shape as `essential` gating the eight essentials.
  'slug, section, topic, kind, eyebrow, headline, do_line, tier, cta_item, instead, why, ' +
  'look_for, watch_out, tier_note, detail, kristy_take, labels_decoded, sources, aliases, source, use_count, ' +
  // ESSENTIAL IS LOAD-BEARING NOW. It was cosmetic when every card returned everything;
  // with the paid boundary it decides whether a card is served in full, so a column
  // missing from this list silently gates the eight cards that must never gate.
  'essential, essential_rank';

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

/**
 * The essentials shelf, in authored order.
 *
 * Reads the table when it can, and falls back to projecting the authored list from the KB
 * when it cannot — which covers both "the columns are not applied yet" and "they are, but
 * the migration has not run". The list lives in code either way, so the fallback is not a
 * degraded answer, it is the same answer computed a different way. The columns make it
 * queryable; they are not what makes it true.
 */
export async function getEssentialCards(client) {
  const rows = await selectCards(client, (q) =>
    q.eq('essential', true).order('essential_rank', { ascending: true })
  );
  if (rows && rows.length) return rows;
  const byId = new Map(projectAll().map((c) => [c.slug, c]));
  return ESSENTIALS.map((slug) => byId.get(slug)).filter(Boolean);
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
      .select(CARD_COLUMNS)
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

/**
 * Bump the use counter on a hit. Fire-and-forget; a shopper never waits on it.
 *
 * `current` IS OPTIONAL, AND OMITTING IT IS THE CORRECT CALL FROM THE CURATED PATH. Two of
 * the three call sites already hold a row and know the count. The third — a curated
 * retrieval hit — projects its card from the in-memory KB with no I/O at all, so it has no
 * count to pass; handing it `card.use_count` yields `undefined` and `Number(undefined) + 1`
 * is NaN, which would silently null the column on every ask. When the count is absent it is
 * read here instead.
 *
 * READ-MODIFY-WRITE IS A LOST UPDATE and this has always been one: two concurrent hits both
 * read N and both write N+1, so the second is swallowed. It undercounts, never overcounts,
 * which is the harmless direction for a popularity signal — but the real fix is an atomic
 * `update ... set use_count = use_count + 1` behind an RPC, and it is proposed with the
 * trips migration rather than bolted on here.
 */
export async function bumpUseCount(slug, client, current) {
  if (!client || !slug) return;
  try {
    let base = Number(current);
    if (!Number.isFinite(base)) {
      const { data, error } = await client
        .from(TABLE)
        .select('use_count')
        .eq('slug', slug)
        .maybeSingle();
      // No row, or the table is unreachable. There is nothing to increment and inventing a
      // starting value would write a count for a card that may not exist.
      if (error || !data) return;
      base = Number(data.use_count) || 0;
    }
    await client
      .from(TABLE)
      .update({ use_count: base + 1 })
      .eq('slug', slug);
  } catch (err) {
    console.warn('[kristy] use_count not bumped:', err?.message || err);
  }
}
