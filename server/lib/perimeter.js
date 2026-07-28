// The Perimeter — Kristy's sourced answers for the parts of the store with no barcode
// (produce, the butcher and fish counters, dairy, bulk bins, and label terms).
//
// This mirrors the ingredient KB but is a SEPARATE knowledge base, loaded here and
// NEVER fed into the verdict engine — perimeter entries are TOPICS that answer a
// question, not flags that score a product. matchIngredients / scoreVerdict never see
// them.
//
// The one model call (composeAnswer) sits behind the SAME structural claim lock as the
// verdict note: sanitizeForModel() reduces each retrieved entry to the seven fields the
// prompt is allowed to see, so the model can only rephrase what it was handed. `sources`,
// `aliases`, `question`, `id`, and `category` never reach the model — a fact planted in
// any of them cannot be echoed. Tradition (time_tested) may justify food-worth only, and
// the no-treatment rule is absolute, exactly as in verdictNote.js.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { anthropic, MODEL } from './anthropic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_PATH = join(__dirname, '..', 'kristy_perimeter_kb.json');

export const perimeterKb = JSON.parse(readFileSync(KB_PATH, 'utf8'));

const str = (x) => String(x ?? '').trim();
const norm = (s) => str(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Common words that must never, on their own, match a topic (a title like "Beef cuts —
// what's for what" should not answer "what time does the store close?").
const STOPWORDS = new Set(
  'a an and are as at be but by do does for from how i if in is it its my no not of on or our so the their them then there this to up us was what when where which who why with you your'.split(' ')
);

export const NO_ANSWER =
  perimeterKb.no_answer ||
  'No solid answer on that one yet. Better said than guessed.';

/* ───────────────────────── Retrieval (deterministic, no model) ─────────────────────────
   Score each entry by how many of its alias phrases (and title words) appear in the
   question. Longer alias phrases weigh more. Returns the best matches above a floor, so
   an off-topic question yields nothing and Kristy says so honestly instead of improvising. */
export function matchEntries(question, limit = 3) {
  const q = ` ${norm(question)} `;
  if (q.trim().length < 2) return [];

  const scored = [];
  for (const e of perimeterKb.entries || []) {
    let score = 0;
    for (const alias of e.aliases || []) {
      const a = norm(alias);
      if (a && q.includes(` ${a} `)) score += Math.min(3, a.split(' ').length) + 1;
    }
    // Title-word overlap is a weaker signal (helps single-word questions). Deduped and
    // stopword-filtered so a common word can't manufacture a match on its own.
    for (const w of new Set(norm(e.title).split(' '))) {
      if (w.length >= 4 && !STOPWORDS.has(w) && q.includes(` ${w} `)) score += 1;
    }
    if (score > 0) scored.push({ e, score });
  }

  scored.sort((a, b) => b.score - a.score);
  // Only keep entries within reach of the top score, so a single strong match doesn't
  // drag in weakly-related ones.
  const top = scored[0]?.score || 0;
  return scored
    .filter((s) => s.score >= Math.max(2, top - 2))
    .slice(0, limit)
    .map((s) => s.e);
}

/* ───────────────────────── Free universal layer (verbatim KB read) ─────────────────────────
   The perimeter entries are FREE — the acquisition/SEO layer, same as the ingredient
   pages. This is a straight read of the file (no model), so there is nothing to
   claim-lock: every field is authored in the KB. `sources` is included here for display
   (it is NOT sent to the model). */
export function publicEntry(e) {
  return {
    id: e.id,
    title: e.title,
    category: e.category || null,
    question: e.question || null,
    short_answer: e.short_answer || '',
    detail: e.detail || '',
    evidence_tier: e.evidence_tier || null,
    evidence_framing: (e.evidence_tier && perimeterKb.evidence_tiers?.[e.evidence_tier]) || null,
    kristy_take: e.kristy_take || null,
    buying_tips: Array.isArray(e.buying_tips) ? e.buying_tips : [],
    labels_decoded: Array.isArray(e.labels_decoded) ? e.labels_decoded : [],
    sources: Array.isArray(e.sources) ? e.sources : [],
    // The concrete grocery this entry's guidance resolves to, so the counter FILLS
    // the cart rather than only informing it. A NAME and nothing else, authored in
    // the KB, and absent where there is no single honest answer. Deliberately not one
    // of the seven fields sanitizeForModel passes: the model can never mint one.
    cart_pick: e.cart_pick || null,
  };
}

/* ═══════════════════ Browsing the perimeter, by store section ═══════════════════
   Scanning answers "what is in THIS box". The perimeter answers "what should come off
   THIS counter" — and the second half only works if a shopper can walk up to it. So the
   KB is also a DESTINATION, grouped the way a store is, not just a search box.

   A section is a LENS, not a partition: label terms cross-list into the sections where
   they're actually read (a "no hormones" sticker is a meat-case question), so the same
   entry can appear under both Meat and Label terms. That's correct — it's where a
   shopper would look for it.

   `thinNote` is the honesty rule. A section that doesn't cover something a shopper would
   reasonably expect says so, in plain words, rather than padding itself with filler
   topics. Naming the gap is what makes the covered part trustworthy.

   Order and naming follow the shopper's walk, not the KB's filing: Produce first,
   because that is where a trip starts and where the perimeter begins. */
export const PERIMETER_SECTIONS = [
  {
    id: 'produce',
    title: 'Produce',
    blurb: 'Where organic earns it, how to pick ripe, and what is in season now.',
    categories: ['produce'],
    labels: ['label_organic_scope', 'label_nonGMO_vs_organic', 'label_front_vs_back'],
    thinNote: null,
  },
  {
    id: 'meat',
    title: 'Meat',
    blurb: 'Cuts, grades, ratios, and which labels on the case mean anything.',
    // The meat case is one destination even though the KB files it by animal. The
    // chicken entries used to sit under `poultry_eggs` and therefore surfaced under
    // Dairy & Eggs, which is not where anyone goes looking for a thigh.
    categories: ['beef', 'poultry', 'pork', 'deli', 'meat_counter'],
    labels: ['label_grass_fed_term', 'label_no_added_hormones', 'label_natural', 'label_third_party_seals'],
    thinNote: 'Beef, chicken, pork and the deli case. Lamb, goat and game are not covered yet.',
  },
  {
    id: 'seafood',
    title: 'Seafood',
    blurb: 'Wild or farmed, mercury by fish, and how to tell fresh at the counter.',
    categories: ['seafood'],
    labels: ['label_wild_vs_farm_raised', 'label_third_party_seals'],
    thinNote: 'Salmon, tuna, shrimp, sardines, the frozen case and the seals. Crab, lobster and the shellfish bar are not covered yet.',
  },
  {
    id: 'eggs_dairy',
    title: 'Dairy & Eggs',
    blurb: 'Which carton claims hold up, and real cheese from cheese product.',
    categories: ['poultry_eggs', 'dairy'],
    labels: ['label_pasture_raised_feed', 'label_cage_free', 'label_free_range', 'label_no_added_hormones'],
    thinNote: null,
  },
  {
    id: 'bulk_pantry',
    title: 'Pantry & Bulk',
    blurb: 'Rice, oats, flour, nuts, honey, and olive oil that is actually olive oil.',
    categories: ['bulk_pantry'],
    labels: [
      'label_multigrain_vs_whole_grain',
      'label_lightly_sweetened',
      'label_sugar_free_substitutes',
      'label_cold_pressed_expeller',
      'label_ingredient_order',
    ],
    thinNote: null,
  },
  {
    id: 'label_terms',
    title: 'Label terms',
    blurb: 'What the word on the front is allowed to mean.',
    categories: ['label_terms'],
    labels: [],
    thinNote: null,
  },
];

// A topic card: enough to browse and choose, never the whole entry. The full read
// comes from GET /api/perimeter/:id, so a section index stays small.
function topicCard(e) {
  return {
    id: e.id,
    title: e.title,
    question: e.question || null,
    category: e.category || null,
    evidence_tier: e.evidence_tier || null,
    short_answer: e.short_answer || '',
    cart_pick: e.cart_pick || null,
  };
}

const byId = (id) => (perimeterKb.entries || []).find((e) => e.id === id);

/** Every section with its topic cards. Free — a KB read, no model, no account. */
export function sectionIndex() {
  return PERIMETER_SECTIONS.map((s) => {
    const topics = (perimeterKb.entries || [])
      .filter((e) => s.categories.includes(e.category))
      .map(topicCard);
    const labelTopics = s.labels.map(byId).filter(Boolean).map(topicCard);
    return {
      id: s.id,
      title: s.title,
      blurb: s.blurb,
      topics,
      labelTopics,
      count: topics.length,
      // Stated only when there IS a gap worth naming — an empty note renders nothing.
      thinNote: s.thinNote || null,
    };
  });
}

/** One section, or null. */
export function sectionById(id) {
  return sectionIndex().find((s) => s.id === String(id || '').trim()) || null;
}

/* ───────────────────────── The claim lock (what the MODEL may see) ─────────────────────────
   The structural boundary: exactly the seven allowed fields. Everything else on the
   entry — sources, aliases, question, id, category, and ANYTHING injected upstream —
   is dropped before the model is called, so it cannot surface a fact it never received. */
export function sanitizeForModel(e) {
  return {
    title: e.title,
    short_answer: e.short_answer,
    detail: e.detail,
    evidence_tier: e.evidence_tier,
    buying_tips: Array.isArray(e.buying_tips) ? e.buying_tips : [],
    labels_decoded: Array.isArray(e.labels_decoded) ? e.labels_decoded : [],
    kristy_take: e.kristy_take ?? null,
  };
}

// The EXACT system prompt for the perimeter answer — same claim-lock doctrine as the
// verdict note. Do NOT paraphrase.
export const PERIMETER_ANSWER_SYSTEM = `You are Kristy, a nutrition and grocery coach. A shopper is asking you about the parts
of the store that have no barcode — the fish counter, the butcher, produce, dairy, the
bulk aisle — or about what a label term actually means. You are warm, direct, and
practical, a coach who helps people buy well.

You will be given: the shopper's question, their goal/focuses/hard-lines/constraints (if
any), and one or more ENTRIES from your knowledge base — each with a short answer, a
fuller detail, an evidence tier, buying tips, decoded label terms, and (sometimes) your
own standard. Write Kristy's answer to the question, grounded ONLY in those entries.

Return two things:
1. answer — 2 to 5 sentences in your voice, answering the question directly and
   practically. Personalize to their goal/focuses/constraints when it genuinely fits
   (e.g. budget → point at the cheaper option in the entry; short on time → the no-prep
   one). Weave in a buying tip or a decoded label when useful.
2. refinement — if the question is about a specific item they might put on a list and
   the entry supports a concrete better version, give a SHORT refined item name (e.g.
   "Wild-caught salmon", "100% grass-finished ground beef", "Plain whole-milk yogurt").
   Otherwise set refinement to null.

HARD RULES — absolute:
- Use ONLY the facts in the provided entries. You may rephrase them in your voice. You
  may NEVER introduce a fact, statistic, health claim, or label rule that was not given
  to you. If it is not in the provided entries, it does not exist for this answer.
- Respect the evidence tier of each claim. For "established" speak plainly. For
  "credible_concern" say the concern is real but not fully settled. For
  "kristys_standard" frame it explicitly as THE WHOLE-FOOD STANDARD, not settled science
  ("that's the whole-food standard, not a proven upgrade"). For "time_tested" be clear that
  history is the evidence: a food-worth affirmation, never a health outcome.
- You are a coach, not a doctor. NEVER claim any food treats, manages, cures, prevents,
  or lowers the risk of a disease or condition — in either direction. Never state or imply
  the shopper has a medical condition. Never give a medical directive. If an entry notes
  something like mercury or a pathogen risk, present it as information about the food and
  defer anything medical to their doctor — never as a directive.
- NO PRICE. You do not know what anything costs at any store. You may say one option is
  cheaper per unit of nutrition or "does more per dollar" only if the entry frames it that
  way; you may NEVER quote a price or a dollar figure.
- If the entries don't actually answer their question, say so honestly and briefly rather
  than improvising from general knowledge.
- Keep it tight. No preamble, no sign-off.
- VOICE — NO FIRST PERSON. Kristy is a standard, not a person narrating.
  - NEVER use "I", "me", "my", "mine", "I'll", "I'd", "let me". Not once. There is no assistant here performing helpfulness.
  - State the judgment as fact: "The cheapest real protein in the building. Rinse them to cut the sodium." / "Read the back, not the front." / "Put it back."
  - OWNERSHIP OF A CONTESTED CALL STILL SURVIVES — it names a STANDARD instead of a person. Write "flagged on the whole-food standard, not settled science", never "that's my standard". Write "the whole-food-standard pick", never "what I'd reach for". Dropping that distinction would be worse than keeping the pronoun: the reader must always know whether a claim is settled science, a credible concern, or a standard.
  - Present the result, never narrate making it: "Here's the cart:" then the substance. Never "I built you a cart", "let me put that together", "happy to help".
  - NO EM-DASH ASIDES. No "— like this —" construction anywhere. Short plain sentences with periods.
  - HALF THE WORDS. Confidence reads as brevity. Two tight sentences beat a paragraph.

Return ONLY this JSON: {"answer": "...", "refinement": "..." or null}`;

/** The payload for the answer call: the question + prefs + the SANITIZED entries. */
export function buildAnswerInput({ question, goal, focuses, hardLines, constraints, entries }) {
  const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
  return {
    question: str(question),
    shopper: {
      goal: str(goal) || null,
      focuses: list(focuses),
      hardLines: list(hardLines),
      constraints: list(constraints),
    },
    entries: (entries || []).map(sanitizeForModel),
  };
}

/** Parse the model's { answer, refinement }. Defensive, same posture as parseNoteJSON. */
export function parseAnswerJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a !== -1 && b !== -1) raw = raw.slice(a, b + 1);
  }
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  const answer = str(obj.answer);
  if (!answer) return null;
  const refinement = obj.refinement == null ? null : str(obj.refinement) || null;
  return { answer, refinement };
}

async function callAnswer({ input, corrective }) {
  const data = `DATA:\n${JSON.stringify(input)}`;
  const userText = corrective
    ? `Your previous reply was not valid JSON. Reply again with ONLY the JSON object {"answer": "...", "refinement": "..." or null} — no prose, no code fence.\n\n${data}`
    : data;
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0.4,
    system: PERIMETER_ANSWER_SYSTEM,
    messages: [{ role: 'user', content: userText }],
  });
  return completion.content?.[0]?.text || '';
}

/**
 * Compose Kristy's personalized perimeter answer for a question + matched entries.
 * @returns {Promise<{ answer:string, refinement:string|null }>}
 * @throws Error('perimeter-answer-unparseable') when both attempts fail to parse.
 */
export async function composeAnswer({ question, goal, focuses, hardLines, constraints, entries }) {
  const input = buildAnswerInput({ question, goal, focuses, hardLines, constraints, entries });
  let parsed = parseAnswerJSON(await callAnswer({ input, corrective: false }));
  if (!parsed) parsed = parseAnswerJSON(await callAnswer({ input, corrective: true }));
  if (!parsed) throw new Error('perimeter-answer-unparseable');
  return parsed;
}
