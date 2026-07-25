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
const CART_COMMAND = /^\s*(add|put|remove|delete|drop|swap|replace|build|make|cross)\b/i;
const CART_NOUN = /\b(cart|list|basket|trip|shop|groceries|grocery|dinners?|meals?|lunch|breakfast|week)\b/i;

export function looksLikeCartCommand(msg) {
  const m = String(msg || '').trim();
  if (!m || !CART_COMMAND.test(m)) return false;
  // "make"/"build" alone are too loose ("make sense of this label") — they need a
  // cart-shaped object. The unambiguous verbs (add/remove/swap/…) stand on their own.
  if (/^\s*(build|make)\b/i.test(m)) return CART_NOUN.test(m);
  return true;
}

/** Which compose mode a cart command implies: a whole new cart, or an edit to this one. */
export function cartCommandMode(msg) {
  return /^\s*(build|make)\b/i.test(String(msg || '').trim()) ? 'build' : 'edit';
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
  if (!m || LIST_COMMAND.test(m)) return false;
  return PREF_SIGNALS.some((re) => re.test(m));
}
