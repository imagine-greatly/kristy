// Generating a counter card for a question the KB cannot answer.
//
// THIS MODULE WRITES TO THE SHARED POOL, so like counterGaps and productStore it may
// never read per-user state — privacyLine.test.js forbids the import. A generated card is
// an answer about food; who asked for it is a surveillance log, and `query_seed` is stored
// already scrubbed by the same path counter_gaps uses.
//
// WHAT MAKES THIS DIFFERENT FROM EVERY OTHER MODEL CALL IN KRISTY. The rest of them
// rephrase content they were handed, structurally locked to a whitelist of KB fields. This
// one MINTS: a headline, a do line, look_for, watch_out, and the aliases that make the card
// findable — persisted, and served to every future asker. So the input-side claim lock does
// not apply and three output-side gates carry the weight instead:
//
//   1. lintCard      — the shape bar. Identical to the one the 80 curated cards clear.
//   2. claimLock     — the content bar. Wider than the KB's own, because a curated entry
//                      was written by someone who knew the rules and this was not.
//   3. one retry     — the violations are fed back verbatim. A second failure is not
//                      softened, it is DISCARDED.
//
// A discarded generation still costs a model call, still consumes the caller's budget, and
// still lands in counter_gaps. It just never reaches a shopper.

import { anthropic, COUNTER_GEN_MODEL } from './anthropic.js';
import { sanitizeForModel, perimeterKb } from './perimeter.js';
import { lintCard } from './counterCardLint.js';
import { claimLockViolations } from './counterClaimLock.js';
import { TABLE, cardToRow, sectionForCategory } from './counterCards.js';

const str = (s) => String(s ?? '').trim();

export const GENERATED_SOURCE = 'generated';

/* ═══════════════════════════ The prompt ═══════════════════════════ */

// Do NOT paraphrase. Same doctrine as PERIMETER_ANSWER_SYSTEM and the verdict note.
export const COUNTER_GEN_SYSTEM = `You are Kristy, a grocery coach. You are writing ONE CARD that answers a shopper's
question about the half of the store with no barcode — the butcher, the fish counter,
produce, dairy, the bulk bins — or about what a word on a label is allowed to mean.

This card will be SAVED and shown to every future shopper who asks the same thing. Write
it as a permanent answer, not as a reply to one person.

You may be given NEAR-MISS ENTRIES from the knowledge base. They are the house style and
the factual floor: prefer what they contain, and never contradict them. Where they do not
cover the question, answer from ordinary, uncontested grocery knowledge — the kind a good
butcher or produce manager would tell you. If you cannot answer without inventing a
statistic, a study, or a health claim, say so by returning "insufficient": true.

THE CARD SHAPE — every field is required unless marked optional:

  topic       2-5 words naming the subject. Title case off; sentence case.
  eyebrow     The same thing as topic. Short label, not a sentence.
  section     EXACTLY one of: produce | meat | seafood | eggs_dairy | bulk_pantry | label_terms
  kind        "shelf" (something to do in the store) or "home" (washing, storing, keeping)
  headline    THE VERDICT. A call, not a description. Maximum 12 words. This is what the
              shopper reads first and it must decide something for them.
  do          THE PHYSICAL ACTION, maximum 14 words, starting with an imperative verb.
              It must name something OBSERVABLE in the store: a word printed on a label, a
              colour, a number, a physical location, a specific product. It must NOT
              restate the headline — if the headline already names the printed word, the
              do line has nothing left to say, so put the verdict in the headline and the
              observable here.
              Good: "Read the first ingredient — it must say whole wheat flour."
              Good: "Press with a fingertip. It should spring back, not stay dented."
              Bad:  "Choose high-quality options when possible."  (names nothing)
              Bad:  "Organic is generally the better choice."     (restates, not an action)
  why         2-3 sentences. The reasoning behind the verdict.
  look_for    3-5 short items. What to check, each one concrete.
  watch_out   0-3 short items. Traps and things that look good and are not. Empty array is
              fine and better than filler.
  tier        EXACTLY one of: established | credible_concern | kristys_standard | time_tested
  cta_item    OPTIONAL. A grocery NAME and nothing else, if the answer resolves to one
              honest product ("Bone-in chicken thighs"). null otherwise. NEVER on a home card.
  aliases     4-8 short phrases a shopper might type to reach this card. Lowercase. These
              are how the card is found again — without them it is written once and lost.

HARD RULES — a card that breaks any of these is thrown away, not fixed:

- NO MEDICAL CLAIMS, IN EITHER DIRECTION. No food cures, treats, manages, prevents,
  reverses or lowers the risk of anything, and no food CAUSES a disease. Never name a
  condition. Never give a medical directive. You are a coach, not a doctor.
- NO DETOX, CLEANSE, TOXIN OR IMMUNITY FRAMING. Not once.
- NO DOSES, no milligrams, no "servings per day".
- NO RESTRICTION OR FASTING ADVICE. No meal plans, no calorie targets, no "cut out".
- NO SAFETY REASSURANCE about a real foodborne risk. Never write that something is
  "perfectly safe" or that a documented risk is a myth.
- NO PRICE. You do not know what anything costs. Relative words only ("cheaper per pound"),
  never a number and never a dollar sign.
- NO NEGATIVE CLAIMS ABOUT A NAMED BRAND. Teach the label truth instead.

TIER — this describes WHAT KIND OF CLAIM the card makes, and a reader must always be able
to tell them apart:
  established       Strong consensus or regulatory fact. Settled enough to act on.
  credible_concern  Real peer-reviewed signal of harm, debate ongoing.
  kristys_standard  The whole-food standard leads here even where regulators have not
                    acted. A standard, not settled science.
  time_tested       History is the evidence. Food-worth only, never a health outcome.
When in doubt choose kristys_standard. Claiming "established" for a preference is the
worst error available here.

RAW AND SOURCING — Kristy believes in raw dairy, raw honey, live ferments, raw cheese, raw
nuts, cold-pressed and unfiltered everything. She does not ask "is raw safe", she asks WHO
MADE IT. On any raw food the card is organized around sourcing as the answer itself, never
as a caveat bolted on the end, and the do line names the sourcing signal. Never hedge a
raw card's own recommendation. Where a specific outcome is concentrated in a specific group
— pregnancy, under five, immunocompromised for raw dairy; infants for raw honey — name that
group ONCE in watch_out, concretely, as the same practical insider detail as everything
else. Where no such group exists, name nobody.

VOICE — NO FIRST PERSON, ANYWHERE. Kristy is a standard, not a person narrating.
- Never "I", "me", "my", "I'd", "let me". Not once. There is no assistant here.
- State the judgment as fact: "The cheapest real protein in the building." "Put it back."
- A contested call names a STANDARD, not a person: "flagged on the whole-food standard,
  not settled science" — never "my standard", never "what I'd reach for".
- NO EM-DASH ASIDES. Short plain sentences with periods.
- HALF THE WORDS. Confidence reads as brevity.

Return ONLY this JSON, no prose and no code fence:
{"insufficient": false, "topic": "...", "eyebrow": "...", "section": "...", "kind": "shelf",
 "headline": "...", "do": "...", "why": "...", "look_for": ["..."], "watch_out": ["..."],
 "tier": "...", "cta_item": null, "aliases": ["..."]}`;

const SECTIONS = new Set(['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry', 'label_terms']);
const TIERS = new Set(['established', 'credible_concern', 'kristys_standard', 'time_tested']);

/* ═══════════════════════════ Parse ═══════════════════════════ */

export function parseCardJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a !== -1 && b !== -1) raw = raw.slice(a, b + 1);
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const list = (v, cap) =>
  (Array.isArray(v) ? v : []).map((x) => str(x)).filter(Boolean).slice(0, cap);

/**
 * Coerce the model's object into the card shape the client renders, dropping anything it
 * was not asked for. A field the model invented cannot ride along into the table.
 */
export function toCard(obj, { slug, querySeed }) {
  if (!obj || obj.insufficient === true) return null;
  const kind = obj.kind === 'home' ? 'home' : 'shelf';
  const section = SECTIONS.has(obj.section) ? obj.section : null;
  const tier = TIERS.has(obj.tier) ? obj.tier : 'kristys_standard';
  return {
    slug,
    section,
    topic: str(obj.topic),
    kind,
    eyebrow: str(obj.eyebrow) || str(obj.topic),
    headline: str(obj.headline),
    do: str(obj.do),
    tier,
    // Structurally suppressed on a home card, exactly as the curated projection does it —
    // there is nothing at a shelf to add from a card about the fridge.
    cta_item: kind === 'home' ? null : str(obj.cta_item) || null,
    why: str(obj.why),
    look_for: list(obj.look_for, 5),
    watch_out: list(obj.watch_out, 3),
    // The tier's own rubric, from the KB, exactly as the curated projection supplies it.
    // Left null, a generated card would render a tier CHIP with no framing behind it —
    // the reader sees "Time-tested" and never learns what that is worth, on the one kind
    // of card where the claim has no authored entry standing behind it.
    tier_note: (perimeterKb.evidence_tiers || {})[tier] || null,
    detail: '',
    kristy_take: '',
    labels_decoded: [],
    sources: [],
    aliases: list(obj.aliases, 8).map((a) => a.toLowerCase()),
    source: GENERATED_SOURCE,
    query_seed: querySeed,
  };
}

/* ═══════════════════════════ The slug ═══════════════════════════ */

// Derived from the normalized query, so the same question maps to the same slug and the
// upsert on `slug` collapses a race rather than forking the corpus.
export function slugFor(normalizedQuery) {
  const base = str(normalizedQuery)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
  return `gen_${base || 'question'}`;
}

/* ═══════════════════════════ The call ═══════════════════════════ */

async function callModel({ query, entries, corrective }) {
  const payload = {
    question: query,
    near_miss_entries: (entries || []).map(sanitizeForModel),
  };
  const data = `DATA:\n${JSON.stringify(payload)}`;
  const userText = corrective
    ? `Your previous card was REJECTED for these reasons:\n${corrective}\n\nWrite the card again, fixing every one. Return ONLY the JSON object.\n\n${data}`
    : data;

  const completion = await anthropic.messages.create({
    model: COUNTER_GEN_MODEL,
    max_tokens: 8000,
    // ADAPTIVE THINKING, and NO temperature. Sonnet 5 removed the sampling parameters
    // (`temperature`, `top_p`, `top_k`) — passing one is a 400, not a warning. Thinking is
    // worth its tokens here for the same reason this call gets its own model: it is the
    // only call in Kristy that mints knowledge rather than rephrasing it.
    thinking: { type: 'adaptive' },
    system: COUNTER_GEN_SYSTEM,
    messages: [{ role: 'user', content: userText }],
  });
  return textOf(completion);
}

// With thinking on, content[0] is a THINKING block, not the answer. Reading content[0].text
// would silently return an empty string and look exactly like an unparseable reply.
function textOf(completion) {
  const blocks = completion?.content || [];
  for (let i = blocks.length - 1; i >= 0; i--) {
    if (blocks[i]?.type === 'text' && blocks[i].text) return blocks[i].text;
  }
  return '';
}

/**
 * Generate, check, and retry once. Does NOT persist — the caller decides that, so this
 * stays testable without a database.
 *
 * @returns {Promise<{ card:object|null, attempts:Array<{violations:Array, raw:object|null}>, reason?:string }>}
 */
export async function generateCard({ query, normalizedQuery, entries = [] }) {
  const slug = slugFor(normalizedQuery || query);
  const attempts = [];
  let corrective = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = parseCardJSON(await callModel({ query, entries, corrective }));

    if (!raw) {
      attempts.push({ violations: [{ code: 'UNPARSEABLE', detail: 'not valid JSON' }], raw: null });
      corrective = '- The reply was not valid JSON.';
      continue;
    }
    if (raw.insufficient === true) {
      // The model declining is a SUCCESS of the design, not a failure of the call. It is
      // the honest miss, and it must not be retried into an answer.
      attempts.push({ violations: [{ code: 'INSUFFICIENT', detail: 'model declined to answer' }], raw });
      return { card: null, attempts, reason: 'insufficient' };
    }

    const card = toCard(raw, { slug, querySeed: normalizedQuery || null });
    const violations = [...lintCard(card), ...claimLockViolations(card)];
    if (!card.section) violations.push({ code: 'SECTION_INVALID', detail: `section "${raw.section}" is not a store section` });

    attempts.push({ violations, raw, card });
    if (!violations.length) return { card, attempts };

    corrective = violations.map((v) => `- ${v.code}: ${v.detail}`).join('\n');
  }

  // Two failures. The card is DISCARDED, never softened — softening a claim keeps its
  // shape and only removes the words that made it auditable.
  return { card: null, attempts, reason: 'failed_checks' };
}

/**
 * Persist a generated card. Upsert on slug, so a race between two shoppers asking the
 * same question collapses to one row instead of forking the corpus.
 */
export async function persistCard(card, client) {
  if (!card || !client) return { persisted: false, reason: 'no client' };
  try {
    const { error } = await client.from(TABLE).upsert(cardToRow(card), { onConflict: 'slug' });
    if (error) throw new Error(error.message);
    return { persisted: true };
  } catch (err) {
    // A shopper's answer never depends on our write succeeding. They get the card; the
    // corpus misses one row and the gap log still recorded the question.
    console.warn('[kristy] generated card not persisted:', err?.message || err);
    return { persisted: false, reason: err?.message || 'error' };
  }
}

export { sectionForCategory };
