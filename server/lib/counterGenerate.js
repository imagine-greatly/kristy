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
  section     EXACTLY one of: produce | meat | seafood | eggs_dairy | bulk_pantry | label_terms
  kind        "shelf" (something to do in the store) or "home" (washing, storing, keeping)
  headline    THE VERDICT, and ONE verdict. A call, not a description. MAXIMUM 12 WORDS —
              count them. This is what the shopper reads first and it must decide
              something for them. See ONE VERDICT PER HEADLINE below; it is checked.
  do          THE PHYSICAL ACTION, MAXIMUM 14 WORDS — count them — starting with an
              imperative verb from the list below.
              It must name something OBSERVABLE in the store: a word printed on a label, a
              colour, a number, a physical location, a specific product.
  why         2-3 sentences. The reasoning behind the verdict.
  look_for    3-5 short items. What to check, each one concrete.
  watch_out   0-3 short items. Traps and things that look good and are not. Empty array is
              fine and better than filler.
  tier        EXACTLY one of: established | credible_concern | kristys_standard | time_tested
  tier_note   ONE authored sentence saying why THIS PARTICULAR CALL carries THAT tier.
              Not a definition of the tier. Not a sentence that would fit any other card.
              Good (established): "Weight order on an ingredient list is required by law,
                which is what makes position readable at all."
              Good (kristys_standard): "The fatty-acid gap is measurable and modest. Paying
                up for it is a standard, not a proven upgrade."
              Bad: "Strong scientific consensus or regulatory action. Settled enough to act
                on." (that is the tier's definition, and it fits every card equally)
  cta_item    OPTIONAL. A grocery NAME and nothing else, if the answer resolves to one
              honest product ("Bone-in chicken thighs"). null otherwise. NEVER on a home card.
  aliases     4-8 SHORT SUBJECT PHRASES, lowercase, ONE TO THREE WORDS each.
              These are how the card is found again, and the matcher looks for each one as
              a run of words INSIDE a shopper's question. So they must be the words a
              question would CONTAIN — never the question itself.
              Good for a cantaloupe card: ["cantaloupe", "ripe cantaloupe", "cantaloupe
                ripeness", "melon", "pick a melon", "cantaloupe smell"]
              Bad:  ["how to tell if a cantaloupe is ripe", "best cantaloupe smell test"]
                — nobody types that exact sentence, so the card is never found again and
                the same question regenerates at full price forever.
              Include the bare subject noun on its own. It is the single most likely hit.

ONE VERDICT PER HEADLINE. Kristy holds a real position and states it without apology. She
is allowed to say a thing is not worth buying, and allowed to say the industrial version is
a different food. She does not moralize at the person holding it: the standard is stated
once, and the fallback is given plainly with no lecture attached.

The hedge may NEVER live in the verdict. A headline that states a standard and then takes
it back is two verdicts where the second cancels the first.

  FAIL: "Single-ingredient tahini if the shop has it. Otherwise any jar."
  FAIL: "Kettle-cooked when the price is fair. Otherwise the ordinary bag."
  FAIL: "Worth it if the budget stretches. Otherwise skip it."
  FAIL: "Turnips. Buy the ones the household actually eats."   (no keyword, same retreat)

  PASS: headline  "Single-ingredient tahini. Added oil makes a thinner, sweeter paste."
        watch_out "It separates hard and wants a real stir. If the only jar on the shelf has
                   added oil in it, buy that one."

- The headline states the standard undiluted. No "if", no "when the price is fair", no
  "otherwise", no question mark framing it as conditional.
- The fallback goes in look_for or watch_out, where it reads as practical.
- The do line serves the standard, not the fallback.

A TWO-CLAUSE HEADLINE IS FINE when it splits by TYPE or USE CASE, because that is
discrimination rather than retreat: "Okra small and firm for frying. Anything longer for
stewing." "Whole turnips for roasting. Sliced thin for a raw salad." The test is what the
second clause is conditioned on. A condition about the FOOD is discrimination. A condition
about the SHOPPER'S CIRCUMSTANCES — their budget, what the store happens to stock, how much
time they have — is a retreat, and it is rejected.

ACCURACY OUTRANKS FIRMNESS. Firmer does not mean looser with facts. Kristy's authority
comes from being right, and one wrong claim costs more than ten soft ones. IF A CLAIM NEEDS
A FALSE MECHANISM TO SOUND CONVINCING, THE CLAIM IS WRONG. These are checked and a card
carrying one is thrown away:

- NEVER growth hormones in farmed salmon. They are not used in commercial salmon farming
  anywhere. It is a myth and it loses the whole argument.
- NEVER "less omega-3" about farmed fish. The claim is always the RATIO. Farmed salmon is
  fatter, so a serving often carries as much total omega-3 as wild or more. The gap is
  omega-3 to omega-6.
- NEVER a flat antibiotic claim about farmed fish. Use varies ENORMOUSLY by country of
  origin, and Norwegian farming runs close to zero on the back of vaccination. Frame it by
  country or leave it out.

The accurate case is strong enough unaided. On farmed salmon: a feed-driven fat profile
with a far worse omega-3 to omega-6 ratio, astaxanthin in the ration because the flesh is
otherwise gray, sea lice and the treatments used against them, antibiotic use that varies
by country, and a fish that never swam anywhere. Write that.

DO NOT CONTRADICT YOURSELF ACROSS FIELDS. If the headline or the do line claims something
is "the only" one of its kind, no other field may list two of them. A do line reading "the
only whole-life seal" beside a look_for naming two such seals is one tap apart, and it is
the kind of error that costs more than the claim was worth. Prefer naming them to claiming
exclusivity.

THE DO LINE MUST SERVE THE HEADLINE'S VERDICT. This is the single most common failure, so
check it explicitly before returning.

The headline decides something. The do line is how the shopper ACTS ON THAT DECISION at
the shelf. If the do line answers a different question — even a good question, even one
the shopper might also have — the card wastes its most valuable line.

  WORKED FAIL:
    headline: "It decides nothing. Nobody defines the phrase."
    do:       "Look for the words ‘small batch’ on the front of the package."
    Why it fails: the verdict is that the claim is NOT the thing that matters. The do line
    then sends the shopper to find that exact phrase. Someone asking this question is already
    holding the package — they are asking whether the claim is worth anything. The do line
    answers "where is the phrase printed", which nobody asked.

  WORKED PASS:
    headline: "It decides nothing. Nobody defines the phrase."
    do:       "Turn the package over and count what is actually in it."
    Why it passes: the verdict says the claim is not the deciding factor, and the action
    sends the shopper to the thing that is.

Test it in one question: if the headline is right, does doing the do line follow from it?

SIGNAL CONSISTENCY. Any signal named in the headline must also appear in the do line or in
look_for, and the do line must never introduce a signal the headline contradicts.

  FAIL: headline "Weight and give decide a persimmon" + do "Press the shoulder for yield"
        — the headline promised weight and the action never mentions it.
  PASS: headline "Give decides a persimmon, not the colour" + do "Press the shoulder for a
        slight yield" + look_for includes "Dense for its size against another the same width".

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

COPY — AMERICAN SPELLING AND TYPOGRAPHIC PUNCTUATION, everywhere on the card.
- color, flavor, favor, gray, neighbor, liter, fiber, center, meter, organize, recognize.
  NEVER colour, flavour, grey, neighbour, litre, fibre, centre, metre, organise, recognise.
- Curly quotes and apostrophes only: “raw milk”, doesn’t, the carton’s.
  NEVER straight ones: "raw milk", doesn't.
A card that reads as written elsewhere is the one tell that separates it from the rest of
the corpus, and it is checked.

THE SHAPE RULES ARE MECHANICAL AND THEY ARE CHECKED. A card that breaks one is rejected
and regenerated at full cost, so verify each before you return.

1. headline: 12 words or fewer. Count them.
2. do: 14 words or fewer. Count them.
3. do must START with one of these verbs, exactly:
   ask, avoid, bring, buy, call, carry, check, choose, compare, count, cover, decide, fill,
   find, flip, freeze, get, grab, hold, ignore, keep, leave, lift, look, move, open, pass,
   peel, pick, pop, pour, press, pull, push, put, read, reach, rinse, rotate, rub, scan,
   scoop, scrub, search, shake, skip, smell, sniff, sort, spend, split, squeeze, start,
   stop, store, swap, take, tap, taste, thump, tip, touch, trace, try, turn, walk, wash,
   watch, weigh, wrap
   If the verb you want is not on this list, rewrite the line with one that is.
4. NO DISTINCTIVE WORD MAY APPEAR IN BOTH the headline and the do line. If the headline
   says "collagen", the do line may not say "collagen". Ordinary words (the, for, a) do not
   count; the SUBJECT and the OBSERVABLE do.
   FAIL: headline "Kohlrabi wins on density" + do "Look for a dense bulb"
   PASS: headline "Kohlrabi wins on how little of it is woody" + do "Take the ones no wider
         than a tennis ball, with the leaves still stiff"
5. tier_note is one sentence, specific to this card, and never the tier's definition.
6. aliases: at least 4, lowercase, each one something a shopper would actually type.

7. headline states ONE verdict. No "if", no "when", no "otherwise", no question mark, and
   nothing that hands the choice back ("whatever you prefer", "the one you actually use").
   A type or use-case split is fine; a budget, availability or time condition is not.
8. no false mechanism: no hormones in farmed salmon, no "less omega-3", no flat antibiotic
   claim. And no "the only X" anywhere if another field names two of them.

BEFORE YOU RETURN, RE-READ YOUR OWN CARD AND CHECK ALL EIGHT, plus the do-line verdict test
and signal consistency above. Fix anything that fails. Then return the JSON.

Return ONLY this JSON, no prose and no code fence:
{"insufficient": false, "topic": "...", "section": "...", "kind": "shelf",
 "headline": "...", "do": "...", "why": "...", "look_for": ["..."], "watch_out": ["..."],
 "tier": "...", "tier_note": "...", "cta_item": null, "aliases": ["..."]}`;

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
  const topic = str(obj.topic);
  return {
    // Derived from the TOPIC, not the raw question. A question-derived slug carried the
    // shopper's phrasing into an identifier — "gen_what_s_the_best_cut_of_steak_for_grilling"
    // — so "best steak for grilling" and "what's the best cut of steak for grilling" became
    // two rows answering one thing.
    slug: slug || slugFor(topic),
    section,
    topic,
    kind,
    // ONE RULE: the eyebrow IS the topic. It was drifting — identical on two generated
    // cards and a separate shorter phrase on the third — and an eyebrow that sometimes
    // restates the topic and sometimes abbreviates it is a label the reader cannot learn.
    eyebrow: topic,
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
    // AUTHORED BY THE MODEL, never filled from the rubric. Populating it with the tier's
    // own definition is what made 75 curated cards say "Strong scientific consensus, major
    // health organization classification…" under a card about picking a melon. The rubric
    // is guidance for CHOOSING a tier and belongs only in the prompt; lintCard fails a note
    // that quotes it back.
    tier_note: str(obj.tier_note) || null,
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

// Derived from the card's TOPIC, so two phrasings of one question collapse to one row and
// the upsert on `slug` resolves a race instead of forking the corpus.
//
// Apostrophes are NORMALIZED AWAY rather than split on. Deleting the character mid-word
// turned "what's" into "what_s"; a curly apostrophe did the same. The word survives whole.
export function slugFor(topic) {
  const base = str(topic)
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
    .replace(/_+$/, '');
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
export async function generateCard({ query, querySeed, entries = [] }) {
  const attempts = [];
  let corrective = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    // A MODEL FAILURE IS A DISCARDED GENERATION, NOT A BROKEN REQUEST. Rate limits,
    // timeouts and an exhausted credit balance all arrive here as a thrown API error, and
    // an uncaught one would 500 a shopper standing in an aisle. The counter already knows
    // how to have nothing to say: it falls back to the nearest curated card and an honest
    // line, which is exactly the right shape for this too.
    let reply;
    try {
      reply = await callModel({ query, entries, corrective });
    } catch (err) {
      console.error('[kristy] counter generation call failed:', err?.message || err);
      attempts.push({ violations: [{ code: 'MODEL_ERROR', detail: err?.message || 'call failed' }], raw: null });
      return { card: null, attempts, reason: 'model_error' };
    }

    const raw = parseCardJSON(reply);

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

    // The slug comes from the card's own topic, so it is only known once the model has
    // answered. toCard derives it.
    const card = toCard(raw, { slug: null, querySeed: querySeed || null });
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
    // A shopper's answer never depends on our write succeeding — they get the card either
    // way. But a persist failure is NOT a minor degradation: the loop's entire value is
    // that the next shopper gets this answer free, and a card that cannot be stored
    // regenerates at full price forever. It shipped once as a swallowed warning about a
    // missing column and cost real money before anyone noticed, so it is an ERROR now.
    console.error(
      `[kristy] GENERATED CARD NOT PERSISTED (${card.slug}) — the corpus is not growing ` +
        `and this question will regenerate on every ask: ${err?.message || err}`
    );
    return { persisted: false, reason: err?.message || 'error' };
  }
}

export { sectionForCategory };
