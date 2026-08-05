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
  // A bare either/or is a question with no question mark, and it is how people
  // actually type at a counter: "wild or farmed", "grass-fed or grain-fed", "brown
  // or white eggs". None of those start with a question word or carry punctuation,
  // so all of them used to route nowhere and get an improvised reply. Capped at a
  // short phrase so a sentence that merely contains "or" is not swept in.
  if (/\bor\b/.test(lower) && lower.split(/\s+/).length <= 6) return true;
  return /\b(worth it|better|vs\.?|versus|difference between|what to look for|which one|which cut|what cut|how to (pick|choose|buy|tell|spot))\b/.test(
    lower
  );
}

/* ───────────────────── The counter question, strictly ─────────────────────
   looksLikePerimeterQuestion is loose on purpose: it costs nothing to check the KB
   for any question, and a miss falls through to the coach. That fall-through is the
   hole this closes. A shopper standing at the case asking "which cut of lamb for
   stew" gets an IMPROVISED answer about the counter, from a model that was handed no
   entry — the exact thing the claim lock exists to prevent, arriving on the one
   surface the whole moat rests on. Lamb is a named gap in the KB, so the honest reply
   is that it is a gap.

   So this is the narrow test: is the shopper unmistakably asking a COUNTER question?
   It takes a SUBJECT from the unlabeled half AND a BUYING intent, together. Both are
   required, because either alone is somebody else's question — "how much protein is
   in chicken" is a nutrition question the coach should answer normally, and "which one
   is better" with no subject is about whatever came before it.

   Used ONLY to choose between the honest miss and the coach reply on a no-match. A
   false negative changes nothing (the coach answers, as it does today); a false
   positive costs a general food question its conversational answer, so the bar is
   the conjunction. */

// The half of the store with no barcode: the counters themselves, the animals, the
// catch, the case, the bins, and the label words that get read at them.
export const COUNTER_SUBJECT = new RegExp(
  [
    '\\b(counter|butcher|fishmonger|deli|meat case|dairy case|bulk bin|bulk aisle|farm stand)\\b',
    '\\b(beef|steak|brisket|chuck|ribeye|rib eye|sirloin|tenderloin|roast|mince|ground (beef|turkey|chicken|pork|lamb))\\b',
    '\\b(chicken|poultry|turkey|duck|pork|bacon|ham|sausage|lamb|mutton|goat|bison|buffalo|venison|elk|veal|rabbit|quail|liver|offal)\\b',
    '\\b(fish|seafood|shellfish|salmon|tuna|cod|halibut|tilapia|snapper|trout|sardines?|anchov\\w*|mackerel|herring|shrimp|prawns?|crab|lobster|scallops?|oysters?|clams?|mussels?|squid|calamari|octopus|roe|caviar)\\b',
    '\\b(eggs?|milk|cheese|yogurt|yoghurt|butter|ghee|cream|kefir|dairy)\\b',
    '\\b(produce|fruit|vegetables?|veggies?|greens|herbs?|avocado\\w*|melon|berries|berry|strawberr\\w*|blueberr\\w*|apples?|bananas?|tomato\\w*|lettuce|spinach|kale|onions?|potato\\w*|garlic|mushrooms?|mangoe?s?|peach\\w*|pears?|grapes?|citrus|oranges?|lemons?|limes?|pineapple|cucumbers?|peppers?|broccoli|cauliflower|carrots?|squash|zucchini|asparagus|celery)\\b',
    '\\b(bulk|oats|oatmeal|rice|flour|nuts|almonds?|walnuts?|cashews?|peanuts?|honey|olive oil|beans|lentils|quinoa|spices?)\\b',
    '\\b(grass[- ]?fed|grass[- ]?finished|pasture[- ]?raised|pastured|cage[- ]?free|free[- ]?range|wild[- ]?caught|farm[- ]?raised|organic|non[- ]?gmo|label)\\b',
  ].join('|'),
  'i'
);

// The shopper is CHOOSING, not conversing: which one, is it worth it, how to tell a
// good one, what the word on the case means.
const COUNTER_INTENT = new RegExp(
  [
    '\\b(which|what) (cut|kind|type|sort|grade|one|part|piece)\\b',
    '\\bwhich\\b.*\\b(buy|get|pick|choose|for)\\b',
    '\\bhow (do|can|should) (i|you)\\b.*\\b(pick|choose|buy|tell|spot|know|select|find|read)\\b',
    '\\bhow to (pick|choose|buy|tell|spot|select|find|read)\\b',
    '\\b(wild or farmed|wild vs\\.? farmed|worth it|worth (buying|getting|paying)|any good|what to look for|which one|better|best)\\b',
    '\\b(vs\\.?|versus|difference between)\\b',
    '\\b(ripe|ripeness|fresh|freshness|quality|marbling|marbled|grade[ds]?|graded)\\b',
    '\\bwhat does\\b.*\\b(mean|actually mean)\\b',
    '\\b(at the|from the) (counter|butcher|case|deli|store)\\b',
  ].join('|'),
  'i'
);

// Cooking is not buying. "What's the best way to cook chicken thighs" carries a
// counter subject and the word "best", and it is still a kitchen question the coach
// should answer normally. Only unambiguous cooking VERBS veto — "roast" and "smoke"
// are cuts and processes as often as they are actions, so they are left out.
const COOKING_ACT = /\b(cook|cooking|bake|baking|grill|grilled|fry|frying|sear|braise|marinate|reheat|recipes?|how long)\b/i;

/**
 * Is this unmistakably a question about the unlabeled half of the store?
 *
 * Only consulted when the KB matched NOTHING, to decide between the honest miss and
 * the ordinary coach reply. A counter question with no entry behind it must be
 * answered "no solid read on that yet" — never improvised.
 */
export function looksLikeCounterQuestion(msg) {
  const m = String(msg || '').trim();
  if (!looksLikePerimeterQuestion(m)) return false;
  if (COOKING_ACT.test(m)) return false;
  return COUNTER_SUBJECT.test(m) && COUNTER_INTENT.test(m);
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

// A message that asks, in so many words, for the cart to START AGAIN. This is the only
// shape besides a build verb on an explicit cart that earns the destructive mode once
// there is a list to lose.
const NEW_CART = /\b(start (over|again|fresh)|from scratch|scrap (it|this|the (cart|list))|new (cart|list|trip))\b/i;

/**
 * Which compose mode a cart command implies: a whole new cart, or an edit to this one.
 *
 * `build` REPLACES — buildCart carries forward only the swap callouts and the scans, and
 * drops everything else. So it is the right answer when there is nothing to lose, and a
 * data loss when there is.
 *
 * IT USED TO DEFAULT TO 'build', AND THAT IS BACKWARDS. Measured 2026-08-05 over five real
 * refinement phrasings — "no seafood", "the kids will not eat fish", "take the salmon off",
 * "make it cheaper", "nothing that needs an oven" — ALL FIVE returned 'build', because none
 * carries a leading edit verb and the default caught everything else. "no seafood" then
 * correctly proposed nothing to add, and the build replaced a nine-row list with zero rows.
 * The destructive mode was the fallthrough for every sentence the anchored verb list did
 * not recognise, which is the widest possible gate on the narrowest possible evidence.
 *
 * So `hasItems` is now part of the decision. It defaults false, which is the trip-question
 * case (`TripQuestion` asks on an empty cart and hardcodes 'build') — every existing caller
 * and every existing test keeps its answer.
 *
 * This is a ROUTING fix and it is one gate. `buildCart` refuses to empty a populated list
 * on its own account, because this repo has twice found two gates that were each supposed
 * to hold the same rule and disagreed.
 */
export function cartCommandMode(msg, { hasItems = false } = {}) {
  const m = String(msg || '').trim();
  // A leading edit verb is always an edit, even alongside a build word
  // ("add a cheaper cut and build out the week" → edit the cart in place).
  if (EDIT_LEAD.test(m)) return 'edit';
  // NOTHING TO LOSE. A build is what fills an empty cart; this is the ordinary path.
  if (!hasItems) return 'build';
  // SOMETHING TO LOSE, so replacing it has to be ASKED FOR rather than defaulted into.
  if (NEW_CART.test(m)) return 'build';
  return BUILD_VERB.test(m) && EXPLICIT_CART.test(m) ? 'build' : 'edit';
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
