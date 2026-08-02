// The scope gate — the first thing a counter question meets, and the cheapest.
//
// DETERMINISTIC ON PURPOSE, for two reasons that both matter more than accuracy.
//
//   1. A refusal must never depend on a model call succeeding. "Is this a medical
//      question?" answered by a model that times out is a medical question answered.
//   2. An out-of-scope query must cost NOTHING. If rejecting a question required
//      inference, the cheapest way to burn the generation budget would be to ask
//      something off-topic a thousand times.
//
// So this is regex over a word list, and it runs before retrieval, before generation,
// before anything is spent.
//
// IN SCOPE: buying, choosing, storing or preparing food from a grocery store.
// OUT: anything medical, and that boundary is drawn hard rather than judged.

import { COUNTER_SUBJECT } from './chatRouting.js';

const str = (s) => String(s ?? '').trim();

/* ═══════════════════════════ The hard deny ═══════════════════════════ */

// These win over every in-scope signal. "Is raw milk good for my Crohn's" names a food
// and is still a medical question, and the honest answer is that Kristy is not a doctor.
// Ordered by what they catch, not by likelihood — each one is its own refusal.
const DENY = [
  {
    id: 'medical_condition',
    // A named condition or a symptom, in any framing.
    re: /\b(cancer|diabet\w*|crohn'?s|colitis|ibs|ibd|celiac|coeliac|thyroid|hashimoto\w*|pcos|endometriosis|arthritis|gout|hypertension|high blood pressure|cholesterol|heart disease|fatty liver|kidney (disease|stones)|gallstones?|ulcers?|reflux|gerd|migraines?|adhd|autism|depression|anxiety|dementia|alzheimer\w*|osteoporosis|anemia|anaemia|allergy|allergic|intolerance|autoimmune|inflammation|infection)\b/i,
  },
  {
    id: 'symptom',
    re: /\b(symptoms?|diagnos\w*|my doctor|prescri\w+|medication|meds\b|side effects?|flare[- ]?ups?|bloating|constipation|diarrh\w+|nausea|rash|hives|cramps)\b/i,
  },
  {
    id: 'treatment',
    re: /\b(cure|cures|heal|heals|healing|treat|treats|treating|reverse|reverses|reversing|prevent|prevents|preventing|remedy|remedies|detox\w*|cleanse|flush out|boost (my |your )?immun\w*)\b/i,
  },
  {
    id: 'dosing',
    re: /\b(\d+\s*(mg|mcg|iu|grams? per day)|dosage|dose|how much .{0,20}should i take|supplements?|vitamins?\s+[a-z]?\d|creatine|collagen|protein powder)\b/i,
  },
  {
    id: 'diet_plan',
    re: /\b(meal plan|diet plan|eating plan|macros?|calorie (target|goal|deficit|intake)|how many calories|intermittent fasting|fasting (window|protocol)|cut(ting)? calories|restrict\w*|elimination diet|cheat day)\b/i,
  },
  {
    id: 'weight_target',
    re: /\b(lose \d+|drop \d+|gain \d+|goal weight|target weight|bmi|body fat|how much should i weigh)\b/i,
  },
];

/* ═══════════════════════════ The in-scope signal ═══════════════════════════ */

// A grocery ACT. The counter is about buying, and the home cards are about keeping and
// washing, so all of it counts.
// The keeping/spoiling/safety verbs are in here deliberately. "Is bagged salad safe" was
// landing as off-topic, and it is a shopping question. Kristy does not ask whether a food
// is safe, she asks who made it — so these route to a SOURCING answer, and the claim lock
// is what stops that answer becoming reassurance. Anything genuinely medical is already
// gone by this point: the deny list runs first.
const GROCERY_ACT =
  /\b(buy|buying|bought|choose|choosing|pick|picking|get|getting|shop|shopping|worth it|which|what kind|what type|look for|tell if|spot|store|storing|keep|keeping|freeze|freezing|thaw|wash|washing|rinse|prep|prepare|cook|cooking|ripe|fresh|freshness|quality|label|brand|aisle|price|cheaper|better|best|vs\.?|versus|difference|safe|safety|risky|spoil\w*|rot|rotten|go bad|last|lasts|expire\w*|shelf life)\b/i;

// A grocery SUBJECT beyond the counter's own vocabulary — the packaged half, the store
// itself, and the general food nouns a shopper uses.
// NOT "store" / "market" / "supermarket". Those name a PLACE, not a thing to buy, and as
// sufficient subjects they let "when does the store close" straight through the gate.
const GROCERY_SUBJECT =
  /\b(food|pantry|fridge|freezer|shelf|package|packaged|canned|frozen|bread|pasta|cereal|snacks?|crackers?|chips|soda|juice|coffee|tea|chocolate|sugar|salt|oil|vinegar|sauce|condiments?|ingredients?|nutrition label|expiration|expiry|use[- ]?by|sell[- ]?by|best[- ]?before)\b/i;

/**
 * Decide whether a query belongs to the counter at all.
 *
 * @param {string} query
 * @returns {{ ok: boolean, reason?: string }}
 *   ok:false with a reason the caller turns into ONE in-voice line — never an error
 *   state, and never an explanation of the rule that rejected it.
 */
export function inScope(query) {
  const q = str(query);
  if (q.length < 3) return { ok: false, reason: 'empty' };

  // Deny wins over everything. A food word does not rescue a medical question.
  for (const rule of DENY) {
    if (rule.re.test(q)) return { ok: false, reason: rule.id };
  }

  const hasSubject = COUNTER_SUBJECT.test(q) || GROCERY_SUBJECT.test(q);
  if (hasSubject) return { ok: true };

  // A KNOWN FOOD NOUN CANNOT BE REQUIRED, and this is the correction that matters most in
  // this file. The first version demanded one, and rejected "how do I pick a good
  // cantaloupe" with "name the food" — while the shopper was naming the food. The word
  // list had "melon" and not "cantaloupe", and it never could have had everything:
  // kohlrabi, guanciale, rambutan, sumac. An endpoint whose entire purpose is answering
  // what the KB does not cover cannot gate on a fixed vocabulary of what it does.
  //
  // So the vocabulary is a fast ACCEPT, never a requirement. Past it, a grocery act plus
  // any concrete noun is enough, and the real filters are the ones that can afford to be
  // strict: the deny list above, the generator's own "insufficient" escape, and the claim
  // lock and lint on the way out.
  // A BARE EITHER/OR IS A QUESTION, and this gate used to be the last place that was not
  // true. "wild or farmed" carries no question word, no question mark and no grocery verb —
  // the shopper is standing in front of two things and naming them, which is the most
  // compressed way anyone asks this. It fell all the way through to `off_topic` and got
  // "That one is outside the store", while the Counter's own ask placeholder reads "Wild or
  // farmed salmon?". Trimming one word off the app's own suggestion told the shopper their
  // question did not belong.
  //
  // COUNTER_INTENT has carried this shape since the chat-routing fix, but that is a
  // different function on a different path and it never reached here. Note the "vs" form
  // already worked — GROCERY_ACT lists `vs` and `versus` — so the defect was only ever the
  // plain "or", which is the form a person actually types.
  const hasAct = GROCERY_ACT.test(q) || isBareEitherOr(q);
  if (hasAct && contentWords(q).length > 0) return { ok: true };

  // An act with nothing concrete in it — "what should I get", "which one is better" — is
  // about whatever came before, which this endpoint cannot see.
  if (hasAct) return { ok: false, reason: 'no_subject' };
  return { ok: false, reason: 'off_topic' };
}

// Words that carry no subject: question words, pronouns, auxiliaries, bare quality
// adjectives, and the grocery verbs themselves. What survives is the thing being asked
// about, whether or not any list has heard of it.
const EMPTY = new Set(
  // Store-logistics words live here too: "store" is a real grocery ACT ("how do I store
  // basil") but never the concrete noun that rescues an act-only query, or "when does the
  // store close" would read as a question about food.
  ('aisle close closes closing grocery hours market open opens shop shopping store supermarket '
    + 'a about all am an and any anything are as at be been best better but buy buying can '
    + 'choose choosing could did do does doing done for from get getting good got great has '
    + 'have how i if in is it its just kind know like look looking make me my need not of '
    + 'off on one only or other our out pick picking please really right said say see should '
    + 'so some sort take tell that the their them then there these they thing things this '
    + 'those to try type up use want was way we what when where which who why will with '
    + 'worth would you your').split(' ')
);

/**
 * Is the whole query a comparison between two named things?
 *
 * The discipline is that BOTH sides must survive contentWords. That is what separates
 * "wild or farmed" from "when does the store close or open" — the second one's clauses are
 * store-logistics words that contentWords already strips to nothing, so it is not rescued.
 * Exactly one split point is required too: a list ("milk or eggs or bread") is a shopping
 * list, not a question about which to buy.
 */
export function isBareEitherOr(query) {
  const parts = String(query || '').split(/\b(?:or|vs\.?|versus)\b/i);
  if (parts.length !== 2) return false;
  return parts.every((p) => contentWords(p).length > 0);
}

export function contentWords(query) {
  return String(query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !EMPTY.has(w));
}

/* ═══════════════════════════ What she says instead ═══════════════════════════ */

// One line, in voice, no first person, no explanation of the gate. A shopper who asks
// something medical gets a boundary and a door, not a lecture and not an error.
const LINES = {
  medical_condition: 'That one belongs with a doctor.',
  symptom: 'That one belongs with a doctor.',
  treatment: 'The counter answers what to buy and how to tell good from bad.',
  dosing:
    'Doses and supplements are a doctor’s call. The counter is for food you can put in a cart.',
  diet_plan: 'Ask about what to buy and how to choose it.',
  weight_target: 'Ask about what to buy and how to choose it.',
  no_subject: 'Name the food and the counter can answer it.',
  off_topic: 'That one is outside the store. Ask about something in a cart.',
  empty: 'Ask about something in the store.',
};

export function outOfScopeLine(reason) {
  return LINES[reason] || LINES.off_topic;
}
