// Pure routing heuristics for the chat pipeline. Kept dependency-free so it's
// unit-testable without booting the express router or the DB client.

// A message that starts with one of these is a command acting ON the list/log,
// not a question to route to the perimeter KB ("add chicken to my list" must not
// get answered as "wild vs farmed").
const LIST_COMMAND = /^\s*(add|put|remove|delete|drop|swap|build|make|take|cross|log)\b/i;

/**
 * Is this message a no-barcode QUESTION worth answering from the perimeter KB?
 * Deliberately conservative — a food STATEMENT ("I had chicken and rice") and a
 * list COMMAND ("add chicken") both return false, so neither is hijacked. The
 * caller still requires an actual KB match before routing, so a false positive
 * here just falls through to the normal coach reply.
 */
export function looksLikePerimeterQuestion(msg) {
  const m = String(msg || '').trim();
  if (!m || LIST_COMMAND.test(m)) return false;
  if (m.includes('?')) return true;
  const lower = m.toLowerCase();
  if (/^(what|which|is|are|do|does|should|how|why|when|where|can|could|would|who)\b/.test(lower)) {
    return true;
  }
  return /\b(worth it|better|vs\.?|versus|difference between|what to look for|which one)\b/.test(lower);
}

// The shopper telling Kristy how they want to eat / shop — a STANDING preference
// to hold, not a one-off question, a meal report, or a list command.
const PREF_SIGNALS = [
  /\btake (that|this|it|these|them) into account\b/i,
  /\bfor all (of )?(my|our|your|ur) (recs|recommendations|picks|scans)\b/i,
  /\bfrom now on\b/i,
  /\bgoing forward\b/i,
  /\bkeep (that|this|it) in mind\b/i,
  /\bi (only |really |generally |usually |mostly |strictly )?(want to|wanna|try to|like to|prefer to|aim to|need to) (eat|buy|shop|get|stick|avoid|stay)\b/i,
  /\bi (eat|buy|shop|avoid|skip)\b.*\b(only|no|never|always|clean|whole|organic|grass[- ]?fed|raw|holistic)\b/i,
  /\bi (don'?t|do not|never|won'?t) (eat|buy|do|touch|want)\b/i,
  /\bi'?m (shopping|cooking|eating|buying|feeding|looking) (for|to)\b/i,
  /\bi'?m (vegetarian|vegan|pescatarian|paleo|keto|carnivore|dairy-free|gluten-free)\b/i,
  /\b(no|zero) [a-z][a-z '-]{1,30} (ever|please|for me|from now on)\b/i,
  /\beat(ing)? (cleaner|healthier|whole ?foods?|holistic(ally)?|clean)\b/i,
  /\bmy (diet|preference|thing|rule|lines?) (is|are)\b/i,
  /\bwatch (my|the) \w+ for me\b/i,
  // A named food philosophy, stated as a description rather than "I eat…". The
  // shopper who types "build a holistically focused cart, raw milk, pasture raised
  // eggs, grass fed meat" is declaring a standing lens, not naming three groceries.
  /\bholistic(ally)?\b/i,
  /\b(grass[- ]?fed|pasture[- ]?raised|pastured|raw milk|raw dairy|raw butter)\b/i,
  /\b(low[- ]?carb|high[- ]?fat|keto|paleo|carnivore|whole[- ]?foods?)\b/i,
];

/**
 * Is this an instruction to CHANGE THE CART? The docked composer is the same editor
 * the cart's own input was, reached by talking — so "add taco night", "swap the rice
 * for something faster" and "build me three dinners for four" have to reach the
 * compose engine rather than get a conversational reply about groceries.
 *
 * Purpose-built rather than reusing LIST_COMMAND: that one exists to EXCLUDE commands
 * from the question/preference routes and is deliberately broad (it matches a leading
 * "take", which belongs to "take that into account"). This one has to be right about
 * what it claims, so it takes only verbs that act on a cart.
 *
 * The compose engine is claim-safe by construction (grocery names only, applied
 * deterministically), so a false positive costs a list edit, never a health claim.
 */
// An EDIT acts on the cart you already have. These verbs are unambiguous, but only
// in the lead position — "add taco night" is a command, "I add salt to everything"
// is not.
// "put together" is a BUILD phrase, so the bare edit verb "put" must not claim it.
const EDIT_LEAD = /^\s*(add|put(?! together)|remove|delete|drop|swap|replace|cross|toss|take off)\b/i;

// A BUILD asks for a cart to exist. Deliberately NOT anchored to the start of the
// message: real people ask sideways — "can you build me a cart", "I need groceries
// for the week", "give me a holistic cart". The old anchored pattern caught only
// the imperative opener and silently dropped every one of those on the floor.
const BUILD_VERB =
  /\b(build|make|create|put together|plan|generate|assemble|throw together|come up with|set me up with|whip up|give me|i want|i need|i'?m after|help me with)\b/i;

// The object that makes a build verb a CART build. Without one, "make sense of this
// label" would qualify.
const CART_OBJECT =
  /\b(cart|list|basket|trip|haul|groceries|grocery|shopping|dinners?|meals?|lunch(es)?|breakfasts?|suppers?|snacks?|food for)\b/i;

// The subset that names a cart OUTRIGHT. A question is only a cart command when it
// names one of these — see below.
const EXPLICIT_CART = /\b(cart|list|basket|groceries|grocery|shopping|haul)\b/i;

// A genuine question opener. "What should I make for dinner?" is a conversation, not
// an instruction to rewrite the cart — unless it explicitly names the cart.
// ("can/could/would you build me…" is a polite imperative, so it's absent here.)
const INTERROGATIVE_LEAD = /^\s*(what|which|why|how|when|where|who|is|are|do|does|should)\b/i;

/**
 * Is this an instruction to CHANGE THE CART — either editing the one they have or
 * asking for one to be built?
 *
 * The compose engine is claim-safe by construction (grocery names only, applied
 * deterministically), so a false positive costs a list edit, never a health claim.
 * A false NEGATIVE, though, costs the whole interaction: the shopper asks for a cart
 * and gets a sentence of agreement instead of groceries. Biased accordingly.
 */
export function looksLikeCartCommand(msg) {
  const m = String(msg || '').trim();
  if (!m) return false;
  if (EDIT_LEAD.test(m)) return true;
  if (!BUILD_VERB.test(m) || !CART_OBJECT.test(m)) return false;
  // A question about food is a question; a question about the CART is a command.
  if (INTERROGATIVE_LEAD.test(m) && !EXPLICIT_CART.test(m)) return false;
  return true;
}

/** Which compose mode a cart command implies: a whole new cart, or an edit to this one. */
export function cartCommandMode(msg) {
  const m = String(msg || '').trim();
  // A leading edit verb is always an edit, even alongside a build word
  // ("add a cheaper cut and build out the week" → edit the cart in place).
  if (EDIT_LEAD.test(m)) return 'edit';
  return 'build';
}

/**
 * Is this a standing PREFERENCE declaration? Conservative on exclusions (a list
 * command is never a preference), liberal on signals — the caller still runs the
 * taxonomy mapper and only acts when something actually maps, so a false positive
 * just falls through to the normal coach reply. A meal report ("I had chicken and
 * rice") and a question both fail these signals, so neither is hijacked.
 */
export function looksLikePreferenceDeclaration(msg) {
  const m = String(msg || '').trim();
  if (!m) return false;
  // A single-item EDIT is never a standing preference — "add grass-fed beef" puts one
  // thing in the cart, it doesn't declare a rule. A whole-cart BUILD is different:
  // "build me a holistic cart, raw milk, grass fed meat" describes how they eat, and
  // that lens should outlive the one cart. So builds are allowed through to be both.
  if (EDIT_LEAD.test(m)) return false;
  return PREF_SIGNALS.some((re) => re.test(m));
}
