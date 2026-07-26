// Lightweight in-browser stand-in for the backend, used in demo mode so the full
// UI is explorable with no keys. Grocery-coach replies only — no macro estimation.

import { dayKey } from './format.js';

// NOTE: the macro estimator that used to live here is GONE, not just unrouted.
// It matched food words in ANY message, so a cart request naming "raw milk" and
// "pasture raised eggs" was read as a logged meal and answered with a canned
// "Got it — that's going to land you in a good spot for the day." Kristy is a
// grocery coach; the demo does not get to be a calorie tracker underneath (Block O).

const ADVICE = {
  default:
    'Tell me what the trip is for — a few weeknight dinners, a clean week, restocking the pantry.',
  seedOil:
    "Refined seed oils are the ones I'd rather you skipped — solvent-extracted and heat-damaged. Butter, ghee, or a real cold-pressed olive oil do the same job without that.",
  fish:
    "Wild-caught is the one I'd reach for, and frozen counts — it's often frozen at sea, so it can be fresher than the counter and cheaper besides.",
  holistic:
    "That's a lens I can hold. Say the word and the cart follows it — pasture-raised eggs, grass-fed meat, the least-processed version of each thing.",
  dinner:
    "One sentence about the week — how many dinners, who's eating — and the groceries follow.",
};

/* Demo-only mirror of the server's cart-command routing (server/lib/chatRouting.js).
   Kept deliberately small: demo is a sandbox, but it must not LIE about what the
   product does. Before this, the demo chat ran a macro estimator — so "build a
   holistic cart, raw milk, grass fed meat" matched the words "milk" and "egg",
   returned a canned "Got it — that's going to land you in a good spot," and built
   nothing. An acknowledgment with no artifact is the one reply she never gives. */
const DEMO_EDIT_LEAD = /^\s*(add|put(?! together)|remove|delete|drop|swap|replace|cross|toss)\b/i;
const DEMO_BUILD_VERB =
  /\b(build|make|create|put together|plan|generate|assemble|come up with|set me up with|give me|i want|i need)\b/i;
const DEMO_CART_OBJECT =
  /\b(cart|list|basket|trip|haul|groceries|grocery|shopping|dinners?|meals?|lunch(es)?|breakfasts?|snacks?)\b/i;
const DEMO_EXPLICIT_CART = /\b(cart|list|basket|groceries|grocery|shopping|haul)\b/i;
const DEMO_INTERROGATIVE = /^\s*(what|which|why|how|when|where|who|is|are|do|does|should)\b/i;

/** @returns {{ isCart:boolean, mode:'build'|'edit' }} */
export function demoCartIntent(text) {
  const m = String(text || '').trim();
  if (!m) return { isCart: false, mode: 'edit' };
  if (DEMO_EDIT_LEAD.test(m)) return { isCart: true, mode: 'edit' };
  if (!DEMO_BUILD_VERB.test(m) || !DEMO_CART_OBJECT.test(m)) return { isCart: false, mode: 'edit' };
  if (DEMO_INTERROGATIVE.test(m) && !DEMO_EXPLICIT_CART.test(m)) return { isCart: false, mode: 'edit' };
  return { isCart: true, mode: 'build' };
}

// Grocery-coach replies. No calories, no macros, no "logged it" — the demo speaks
// as the same coach the real backend does (Block O: no macro accounting anywhere).
export function mockReply(text) {
  const lower = String(text || '').toLowerCase();
  let message = ADVICE.default;
  if (/seed oil|canola|vegetable oil|margarine/.test(lower)) message = ADVICE.seedOil;
  else if (/salmon|fish|wild|farmed/.test(lower)) message = ADVICE.fish;
  else if (/raw milk|grass.?fed|pasture|holistic/.test(lower)) message = ADVICE.holistic;
  else if (/dinner|what should i (eat|cook|buy)/.test(lower)) message = ADVICE.dinner;
  else if (/^(hi|hey|hello|yo|sup)\b/.test(lower))
    message = 'Hey. Tell me what this trip is for.';

  return { message, hasFood: false, macros: null, foods: [], insight: '' };
}

// Seed a few days of history so the sidebar + history tab feel alive in demo.
export function seedDemoMeals() {
  const days = [
    { back: 1, calories: 2340, protein: 156, carbs: 210, fat: 74 },
    { back: 2, calories: 1980, protein: 142, carbs: 180, fat: 68 },
    { back: 3, calories: 2510, protein: 188, carbs: 220, fat: 80 },
    { back: 4, calories: 2120, protein: 134, carbs: 195, fat: 71 },
  ];
  return days.map((d) => {
    const date = new Date();
    date.setDate(date.getDate() - d.back);
    return {
      id: `seed-${d.back}`,
      logged_at: date.toISOString(),
      day: dayKey(date),
      foods: ['mixed meals'],
      calories: d.calories,
      protein: d.protein,
      carbs: d.carbs,
      fat: d.fat,
    };
  });
}
