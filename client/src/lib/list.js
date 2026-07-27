// The List client (Step 8 → durable). The SERVER is now the source of truth: it
// persists the list (survives a device change) and enforces the premium capabilities
// (focus-aware items, haul-swap integration) so they can't be tampered on. This
// module is a thin client over /api/list with localStorage as a read-through CACHE
// for instant render, plus a demo (no-backend) fallback that generates locally.
//
// The demo GOAL_TEMPLATES/FOCUS_ITEMS mirror server/lib/list.js — keep them in sync.

import { IS_DEMO, apiBase } from './config.js';
import { supabase } from './supabase.js';
import { COACH_GOALS } from './coachGoals.js';

const LIST_KEY = 'kristy:list'; // cache of the server list (demo: the list itself)
const SIGNALS_KEY = 'kristy:listSignals';
const NEXT_KEY = 'kristy:nextList'; // demo-only pending haul-swap queue

const rid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* ignore */
  }
};

/* ───────── Cache + learning signals ───────── */

export const loadCachedList = () => read(LIST_KEY, null);
const saveCache = (list) => write(LIST_KEY, list);

export const loadSignals = () => read(SIGNALS_KEY, { removed: [], kept: [], acceptedSwaps: [] });
const saveSignals = (s) => write(SIGNALS_KEY, s);

// Record that an item was removed — future generations stop suggesting it. Persisted
// locally and sent to the server with the next saveList (so it survives a device change).
export function recordRemoved(name) {
  if (!name) return;
  const s = loadSignals();
  const key = String(name).toLowerCase();
  if (!s.removed.some((r) => String(r).toLowerCase() === key)) s.removed.push(name);
  saveSignals(s);
}

// Record that a swap reminder was accepted (kept/checked) — a positive signal.
export function recordAcceptedSwap(productName) {
  if (!productName) return;
  const s = loadSignals();
  if (!s.acceptedSwaps.includes(productName)) s.acceptedSwaps.push(productName);
  saveSignals(s);
}

/* ───────── Server transport (real mode) ───────── */

async function authFetch(path, opts = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`${apiBase}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`list ${path} ${res.status}`);
  return res.json();
}

/* ───────── The stranger's cart — no account, no auth header ─────────
   The onboarding payoff. Generated server-side by the same generateList the account
   path uses, so a stranger's first cart is the real thing rather than a client-side
   imitation that could drift from it. Nothing is persisted server-side — the cart
   comes back in the response and lives in guest state until there's an account.

   This one generation runs at full tailoring (the TASTE): focuses and constraints
   shape it, which is what makes the onboarding questions worth answering. */
export async function buildGuestList({ coach_goals = [], non_negotiables = [], focuses = [], constraints = [] } = {}) {
  if (IS_DEMO) {
    return {
      list: loadOrGenerateDemo({ goals: coach_goals, nonNegotiables: non_negotiables, focuses, constraints }),
      taste: true,
    };
  }
  const res = await fetch(`${apiBase}/api/guest/list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coach_goals, non_negotiables, focuses, constraints }),
  });
  if (!res.ok) throw new Error(`guest list ${res.status}`);
  const { list, taste } = await res.json();
  if (!list || !Array.isArray(list.items)) throw new Error('guest list empty');
  return { list, taste: !!taste };
}

/* ───────── Public API — server-backed, cache-first ───────── */

// The persisted list + the server's premium verdict (drives the capability nudge).
export async function fetchList({ goal, goals, nonNegotiables = [], focuses = [], constraints = [] } = {}) {
  if (IS_DEMO) return { list: loadOrGenerateDemo({ goal, goals, nonNegotiables, focuses, constraints }), premium: true };
  try {
    const { list, premium } = await authFetch('/api/list', { method: 'GET' });
    const ok = list && Array.isArray(list.items);
    if (ok) {
      saveCache(list);
      return { list, premium: !!premium };
    }
    // The server is authoritative and says there is NO cart — the shopper hasn't told
    // Kristy what this trip is for yet. That must not fall back to a stale cache, or
    // the question never gets asked. Clear it and report the honest empty.
    saveCache(null);
    return { list: null, premium: !!premium };
  } catch {
    // Offline / pre-migration → render the cache so the surface still works. This is
    // the only path that falls back, because here we genuinely don't know.
    return { list: loadCachedList(), premium: false };
  }
}

// Persist the user's edits (checks/adds/removes) + learning signals. Cache-first, and
// best-effort to the server (fire-and-forget from the UI). Signals default to the
// latest local set, so recordRemoved()/recordAcceptedSwap() ride along automatically.
export function saveList(list, signals) {
  saveCache(list);
  const sig = signals || loadSignals();
  if (signals) saveSignals(signals);
  if (IS_DEMO) return Promise.resolve();
  return authFetch('/api/list', { method: 'POST', body: JSON.stringify({ list, signals: sig }) }).catch(() => {});
}

// Regenerate from the profile (server re-reads goal/focuses/hard lines + premium).
export async function rebuildList({ goal, goals, nonNegotiables = [], focuses = [], constraints = [] } = {}) {
  if (IS_DEMO) {
    const list = generateLocal({ goal, goals, nonNegotiables, focuses, constraints, nextList: takeDemoNext(), signals: loadSignals(), premium: true });
    saveCache(list);
    return { list, premium: true };
  }
  try {
    const { list, premium } = await authFetch('/api/list/rebuild', { method: 'POST', body: JSON.stringify({}) });
    if (list && Array.isArray(list.items)) saveCache(list);
    return { list, premium: !!premium };
  } catch {
    return { list: loadCachedList(), premium: false };
  }
}

// The conversational editor: natural language → a list edit. PREMIUM (the server
// gates it; a free real-mode call returns { gated, upsell }). Returns the updated
// list + Kristy's one-line summary. Demo runs a light local heuristic so the loop
// is explorable with no backend.
export async function composeList({ instruction, mode = 'edit', prefs = {} } = {}) {
  const text = String(instruction || '').trim();
  if (!text) return { list: null, summary: '' };

  if (IS_DEMO) {
    // No cached cart → build from EMPTY, not from a generated template (mirrors the
    // server): the shopper's sentence is the whole input.
    const cur = loadCachedList() || { goal: null, intro: '', items: [] };
    const { add, remove, summary } = demoCompose(text, mode);
    let list;
    if (mode === 'build') {
      const items = add.map((a) => ({ id: rid(), name: a.name, category: a.section, checked: false, source: 'template' }));
      // Keep the generation signature so a rebuilt cart isn't seen as stale next load.
      list = { goal: cur.goal || null, sig: cur.sig, intro: summary, items };
    } else {
      const rm = remove.map((r) => r.toLowerCase());
      const kept = cur.items.filter((i) => i.source === 'swap' || !rm.some((r) => i.name.toLowerCase().includes(r)));
      const present = new Set(kept.map((i) => i.name.toLowerCase()));
      const added = add
        .filter((a) => !present.has(a.name.toLowerCase()))
        .map((a) => ({ id: rid(), name: a.name, category: a.section, checked: false, source: 'template' }));
      list = { ...cur, items: [...kept, ...added] };
    }
    saveCache(list);
    return { list, summary, premium: true };
  }

  try {
    const res = await authFetch('/api/list/compose', { method: 'POST', body: JSON.stringify({ instruction: text, mode }) });
    if (res?.gated) return { gated: true, upsell: res.upsell, premium: false };
    if (res?.list && Array.isArray(res.list.items)) saveCache(res.list);
    return { list: res?.list || null, summary: res?.summary || '', premium: !!res?.premium };
  } catch {
    return { error: true };
  }
}

// A tiny local NL heuristic for demo mode only (real mode uses the claim-locked model).
function demoCompose(text, mode) {
  const t = text.toLowerCase();
  const SECTION = (n) =>
    /egg|yogurt|milk|cheese|kefir|butter/.test(n) ? 'Dairy & Eggs'
    : /chicken|beef|turkey|fish|salmon|tuna|pork|sardine|tofu/.test(n) ? 'Meat & Seafood'
    : /frozen/.test(n) ? 'Frozen'
    : /tortilla|bread|bun|bagel/.test(n) ? 'Bakery'
    : /pepper|onion|greens|lettuce|tomato|potato|fruit|banana|apple|avocado|veg/.test(n) ? 'Produce'
    : /chip|cracker|popcorn|nuts|snack/.test(n) ? 'Snacks'
    : 'Pantry';
  const items = (names) => names.map((name) => ({ name, section: SECTION(name.toLowerCase()) }));

  // swap X for Y / replace X with Y
  const swap = t.match(/(?:swap|replace)\s+(?:the\s+)?(.+?)\s+(?:for|with)\s+(.+)/);
  if (swap) {
    const [, from, to] = swap;
    return { add: items([to.trim()]), remove: [from.trim()], summary: `Swapped the ${from.trim()} for ${to.trim()}.` };
  }
  if (/taco/.test(t)) return { add: items(['Ground beef', 'Tortillas', 'Bell peppers', 'Onion', 'Shredded cheese', 'Salsa']), remove: [], summary: 'Taco night — beef, tortillas, peppers, onion, cheese, salsa.' };

  // Trip archetypes — the answers to "what are we shopping for today?". The demo has
  // no model, so these stand in for a real build; without them a whole-trip answer
  // ("a clean week") produced one nonsense row named after the sentence itself.
  // Names only, and named the way a label reads — no brands, no claims (Block N/O).
  const TRIPS = [
    { re: /holistic|grass.?fed|pasture|raw milk|raw dairy/, names: ['Pasture-raised eggs', 'Grass-fed ground beef', 'Whole-milk plain yogurt', 'Butter from grass-fed cream', 'Wild-caught salmon', 'Bone-in chicken thighs', 'Extra-virgin olive oil, dark bottle', 'Leafy greens', 'Winter squash', 'Raw honey'], summary: "Built to the whole-food end of every shelf — pasture eggs, grass-fed beef, real butter. Brands vary by store, so those are the words to look for on the package." },
    { re: /weeknight|quick|fast|no time|30 min/, names: ['Rotisserie chicken', 'Pre-washed salad greens', 'Cherry tomatoes', 'Microwave brown rice pouches', 'Eggs', 'Frozen stir-fry vegetables', 'Canned chickpeas', 'Extra-virgin olive oil'], summary: 'Five dinners that come together fast — rotisserie chicken, rice pouches, frozen veg to fall back on.' },
    { re: /clean week|eat clean|cleaner|whole ?food/, names: ['Eggs', 'Plain Greek yogurt', 'Chicken thighs', 'Wild-caught salmon', 'Leafy greens', 'Sweet potatoes', 'Avocados', 'Extra-virgin olive oil', 'Rolled oats', 'Almonds'], summary: 'A clean week — whole ingredients, nothing with a label you need me to read.' },
    { re: /pantry|stock up|staples|restock/, names: ['Extra-virgin olive oil', 'Canned tomatoes', 'Dried lentils', 'Brown rice', 'Rolled oats', 'Canned tuna', 'Peanut butter, just peanuts', 'Onions', 'Garlic', 'Sea salt'], summary: 'Pantry stocked — the things that make a dinner possible on a night you have nothing.' },
    { re: /few things|just a few|quick trip|couple of things/, names: ['Eggs', 'Milk', 'Bananas', 'Leafy greens', 'Bread'], summary: 'Just the few — in and out.' },
    { re: /protein|muscle|lift/, names: ['Chicken breast', 'Plain Greek yogurt', 'Eggs', 'Ground beef', 'Canned tuna', 'Cottage cheese', 'Lentils'], summary: 'Protein in every meal without thinking about it.' },
  ];
  for (const trip of TRIPS) {
    if (trip.re.test(t)) return { add: items(trip.names), remove: [], summary: trip.summary };
  }
  // "add A, B and C" / "get ..." / "need ..."
  const m = t.match(/(?:add|get|need|grab|put)\s+(.+)/);
  const phrase = (m ? m[1] : text).replace(/\bfor\b.*$/, '').trim();
  const names = phrase.split(/,|\band\b/).map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\b\w/, (c) => c.toUpperCase()));
  if (!names.length) return { add: [], remove: [], summary: "I wasn't sure what to put on the list — try naming the items or the meal." };
  return { add: items(names), remove: [], summary: `Added ${names.join(', ')}.` };
}

// Queue Haul swaps so they appear on the next list load (Haul → List). Server-side
// in real mode (cross-device); demo keeps a local queue.
export async function pushSwaps(swaps) {
  const clean = (swaps || [])
    .filter((s) => s && s.product_name)
    .map((s) => ({ product_name: s.product_name, tier: s.tier || null }));
  if (!clean.length) return;
  if (IS_DEMO) {
    write(NEXT_KEY, [...read(NEXT_KEY, []), ...clean].slice(-50));
    return;
  }
  try {
    await authFetch('/api/list/swaps', { method: 'POST', body: JSON.stringify({ swaps: clean }) });
  } catch {
    /* best-effort */
  }
}

/* ═══════════════════════ PICKS — every row is a DECISION ═══════════════════════
   A category ("chicken or fish", "leafy greens") hands the decision back to the
   shopper, which is the one thing this app exists not to do. So the unit of the list
   is a PICK: a specific thing you can physically lift off a shelf, plus the one line
   of Kristy's reasoning that makes it a decision rather than a chore.

   Each pick carries:
     name        the specific item — never a category
     why         ONE line, her voice, always visible in the row (this IS the coaching)
     perimeterId (optional) the perimeter KB entry this pick's judgment comes from —
                 the row's "what to look for" detail is read from it, free, no model
     alt         (optional) the genuinely-equivalent alternative, named
     variants    (optional) constraint → a DIFFERENT specific pick + reason. Budget
                 buys the whole chicken; short-on-time buys the rotisserie. The
                 specifics change, not just the framing.

   CLAIM LOCK: a `why` is Kristy's FOOD judgment — what a thing is, how it's made,
   how it cooks, what to look for. It may never assert a health outcome in either
   direction, name a condition, or quote a price (budget is SELECTION, not a price
   lookup — Block H). Every line here traces to its perimeter entry's short_answer,
   kristy_take, or buying_tips; `assertClaimSafeReasons` in list.test.js is the
   tripwire and fails the build if one drifts. */
const PICKS = {
  grass_fed_beef: {
    name: 'Grass-fed ground beef', category: 'Protein', tags: ['meat'],
    why: 'Grass-finished, not just grass-started — the label has to say finished to mean it.',
  },
  sprouted_grain: {
    name: 'Sprouted whole-grain bread', category: 'Bakery', tags: ['gluten'],
    why: 'Sprouted before milling, the way grain was prepared for most of history. Buy it from the freezer.',
  },
  ghee: {
    name: 'Ghee', category: 'Pantry', tags: ['dairy'],
    why: 'Butter with the milk solids cooked off — keeps on the counter and takes real heat.',
  },
  grass_fed_butter: {
    name: 'Grass-fed butter', category: 'Dairy & Eggs', tags: ['dairy'],
    why: 'The animal ate grass, and the fat shows it — deeper yellow than the commodity block.',
  },
  bone_broth: {
    name: 'Bone broth', category: 'Pantry', tags: ['meat'],
    why: 'Whole-animal cooking — the part most kitchens throw out. Look for one that gels in the fridge.',
    alt: 'Or save your own carcasses and make it for free.',
  },
  liver: {
    name: 'Beef or chicken liver', category: 'Protein', tags: ['meat'],
    why: 'The most nutrient-dense thing in the case, and usually the cheapest per pound. Start with chicken liver if beef is too strong.',
    alt: 'Or a pâté, if cooking it yourself is a bridge too far.',
  },
  natto: {
    name: 'Natto', category: 'Pantry',
    why: 'The most acquired taste on this list, and a breakfast staple in Japan for centuries.',
  },
  brined_pickles: {
    name: 'Brined pickles, refrigerated', category: 'Pantry',
    why: 'Salt and water on the label, not vinegar — vinegar pickles never fermented.',
  },
  kombucha: {
    name: 'Kombucha, low-sugar', category: 'Pantry',
    why: 'Fermented tea — check the panel, some brands carry as much sugar as soda.',
  },
  miso: {
    name: 'Unpasteurized miso', category: 'Pantry',
    why: 'Refrigerated, not the shelf-stable kind. Stir it in off the heat so it stays alive.',
  },
  live_yogurt: {
    name: 'Live-culture yogurt, plain', category: 'Dairy & Eggs', tags: ['dairy'],
    perimeterId: 'yogurt_plain_vs_flavored',
    why: 'Check the label actually lists live active cultures — plain, because the flavored tubs are dessert.',
  },
  // ── Meat, fish, eggs ──
  chicken: {
    name: 'Chicken thighs, bone-in', category: 'Protein', perimeterId: 'air_chilled_chicken',
    why: 'More forgiving than breasts and cheaper per pound — hard to dry out.',
    alt: 'Or breasts if that’s what the house eats.',
    variants: {
      short_on_time: { name: 'Rotisserie chicken', why: 'Already cooked — dinner becomes assembly, not cooking.' },
      budget: { name: 'Whole chicken', why: 'The cheapest way to buy chicken, and the carcass makes stock.' },
      no_kitchen: { name: 'Rotisserie chicken', why: 'Cooked already — you need a fork, not a stove.' },
    },
  },
  chicken_breast: {
    name: 'Chicken breast', category: 'Protein', perimeterId: 'air_chilled_chicken',
    why: 'The lean anchor — portions clean and cooks fast.',
    variants: {
      short_on_time: { name: 'Rotisserie chicken', why: 'Already cooked — pull it apart and it feeds three meals.' },
      budget: { name: 'Whole chicken', why: 'Same bird, less per pound — break it down yourself.' },
    },
  },
  sardines: {
    name: 'Canned wild sardines', category: 'Protein', perimeterId: 'canned_fish_mercury',
    why: 'Small fish, low on the chain, and you eat the whole thing — real omega-3s.',
    alt: 'Or canned salmon with the bones in.',
  },
  canned_fish: {
    name: 'Canned skipjack tuna', category: 'Protein', perimeterId: 'canned_fish_mercury',
    why: 'Skipjack (the “light” tin) sits lower in mercury than albacore.',
    alt: 'Or canned salmon — bones in, more calcium.',
  },
  salmon: {
    name: 'Wild-caught salmon', category: 'Protein', perimeterId: 'salmon_wild_vs_farmed',
    why: 'I lean wild when the budget allows — that’s my preference, not a verdict on farmed.',
    variants: {
      budget: { name: 'Canned wild salmon', why: 'Same fish, shelf-stable, and the bones come with calcium.' },
      short_on_time: { name: 'Frozen wild salmon fillets', why: 'Frozen at sea, portioned — thaw only what you need.' },
    },
  },
  ground_beef: {
    name: 'Ground beef, 80/20', category: 'Protein', perimeterId: 'ground_beef_lean_ratio',
    why: '80/20 for burgers; drain it for sauces. Leaner costs more and cooks drier.',
    variants: {
      budget: { name: 'Ground beef, 80/20', why: 'Buy the 80/20 and drain it — it beats paying up for lean.' },
    },
  },
  grassfed_beef: {
    name: 'Grass-fed ground beef', category: 'Protein', perimeterId: 'beef_grassfed_vs_grainfed',
    why: 'Chuck and ground get you the sourcing without reaching for the ribeye.',
    alt: 'Or regular ground beef — a cheaper real cut still beats processed protein.',
  },
  eggs: {
    name: 'Pasture-raised eggs', category: 'Protein', perimeterId: 'egg_labels',
    why: 'Pasture-raised is the one egg label with real meaning behind it.',
    alt: 'Or plain eggs — an egg is a complete protein either way.',
    variants: {
      budget: { name: 'Eggs', why: 'One of the cheapest complete proteins in the building — grade doesn’t change that.' },
    },
  },
  greek_yogurt: {
    name: 'Plain whole-milk Greek yogurt', category: 'Protein', tags: ['dairy'], perimeterId: 'yogurt_plain_vs_flavored',
    why: 'Plain, so you’re not buying dessert — add your own fruit.',
  },
  cottage_cheese: {
    name: 'Cottage cheese', category: 'Protein', tags: ['dairy'],
    why: 'Protein you don’t have to cook — eat it with fruit or on toast.',
  },
  kefir: {
    name: 'Plain kefir', category: 'Fermented', tags: ['dairy'],
    why: 'Live cultures, and plain means no dessert-level sugar riding along.',
  },
  milk: {
    name: 'Whole milk', category: 'Protein', tags: ['dairy'], perimeterId: 'whole_vs_reduced_fat_milk',
    why: 'Whole milk is the least-messed-with version — the fat is the point.',
  },
  cheese_sticks: {
    name: 'Real cheese sticks', category: 'Protein', tags: ['dairy'], perimeterId: 'cheese_real_vs_processed',
    why: 'Real cheese, not the processed slices — check it says cheese, not “product”.',
  },

  // ── Produce ──
  spinach: {
    name: 'Baby spinach', category: 'Produce',
    why: 'Goes into eggs, soup, or a salad with no prep at all.',
    alt: 'Or arugula — whichever looks freshest.',
    variants: {
      short_on_time: { name: 'Pre-washed baby spinach', why: 'If pre-washed is what gets a salad on the table, buy it.' },
      no_kitchen: { name: 'Pre-washed baby spinach', why: 'Open the bag, eat the greens. No board, no knife.' },
    },
  },
  frozen_veg: {
    name: 'Frozen broccoli or green beans', category: 'Produce', perimeterId: 'frozen_vs_fresh_produce',
    why: 'Picked ripe and frozen fast — cheaper than fresh and it never spoils.',
  },
  berries: {
    name: 'Blueberries or strawberries', category: 'Produce',
    why: 'The sweet thing that isn’t candy — whichever is in season.',
    variants: {
      budget: { name: 'Frozen berries', why: 'Frozen at peak, no waste, and always in season.' },
    },
  },
  seasonal_veg: {
    name: 'Carrots and bell peppers', category: 'Produce', perimeterId: 'produce_seasonality',
    why: 'Both keep for weeks and get eaten raw when you’re hungry.',
  },
  avocado: { name: 'Avocado', category: 'Produce', why: 'A whole-food fat that needs no cooking.' },
  sweet_potatoes: { name: 'Sweet potatoes', category: 'Produce', why: 'Bake a tray, eat off it all week.' },
  potatoes: { name: 'Potatoes', category: 'Produce', why: 'One of the cheapest real foods in the store, and filling.' },
  bananas_apples: { name: 'Bananas and apples', category: 'Produce', why: 'The two the kids will actually eat, and no packaging.' },
  garlic_onions: { name: 'Garlic and onions', category: 'Produce', why: 'The base of nearly everything you’ll cook this week.' },
  whole_fruit: { name: 'Whole fruit — apples or oranges', category: 'Produce', why: 'Whole fruit over juice: the fiber comes with it.' },

  // ── Pantry ──
  steel_cut_oats: {
    name: 'Steel-cut oats', category: 'Staples', perimeterId: 'oats_steelcut_rolled_instant',
    why: 'The least-processed oat — chewy, slow, and no sugar snuck in.',
    alt: 'Or plain rolled oats if you want it faster.',
    variants: {
      short_on_time: { name: 'Plain rolled oats', why: 'Cooks in minutes. Plain — the flavored packets are candy with an oat garnish.' },
      picky_kids: { name: 'Plain rolled oats', why: 'Sweeten it yourself with fruit and you control what goes in.' },
    },
  },
  rice: {
    name: 'Basmati rice', category: 'Staples', perimeterId: 'rice_arsenic',
    why: 'Basmati tends to test lower in arsenic — rinse it, cook it in extra water, drain.',
    variants: {
      short_on_time: { name: 'Microwave basmati rice pouch', why: 'Ninety seconds, and basmati is the lower-arsenic grain anyway.' },
      no_kitchen: { name: 'Microwave basmati rice pouch', why: 'A pouch and a microwave — that’s the whole recipe.' },
    },
  },
  beans: {
    name: 'Canned black beans', category: 'Staples', perimeterId: 'beans_dried_vs_canned',
    why: 'The cheapest real protein in the building — rinse them to cut the sodium.',
    alt: 'Or dried, if you’re planning ahead.',
    variants: {
      budget: { name: 'Dried beans', why: 'Cheapest protein there is; a slow cooker makes them effortless.' },
    },
  },
  lentils: {
    name: 'Dried lentils', category: 'Fiber', perimeterId: 'beans_dried_vs_canned',
    why: 'No soaking, done in twenty minutes, and they stretch a meal.',
  },
  evoo: {
    name: 'Extra-virgin olive oil — dark bottle', category: 'Staples', perimeterId: 'olive_oil_buying',
    why: 'Look for a HARVEST date, not just “best by” — dark glass keeps it from going rancid.',
  },
  almonds: {
    name: 'Raw or dry-roasted almonds', category: 'Snacks', perimeterId: 'nuts_raw_vs_roasted',
    why: 'Dry-roasted means no seed oil in your nuts — read the ingredient line.',
  },
  nut_butter: {
    name: 'Peanut butter — just peanuts and salt', category: 'Snacks',
    why: 'Two ingredients on the label. Anything more is candy in a jar.',
  },
  popcorn: { name: 'Popcorn kernels', category: 'Snacks', why: 'A whole grain you pop yourself — no bag coating, no seed oil.' },
  sauerkraut: { name: 'Refrigerated sauerkraut', category: 'Fermented', why: 'Buy it from the cold section — shelf-stable jars are pasteurized, so the cultures are gone.' },
  kimchi: { name: 'Kimchi', category: 'Fermented', tags: ['fish'], why: 'Live and fermented, and it makes plain rice or eggs interesting.' },
  chia_flax: { name: 'Ground flax or chia', category: 'Fiber', why: 'A spoon into yogurt or oats — buy flax ground or it passes straight through.' },
  bananas: { name: 'Bananas', category: 'Produce', why: 'Portable fuel with its own wrapper.' },
};

const TEMPLATE_PICKS = {
  eating_cleaner: {
    intro: 'Built for eating cleaner — whole foods first, the traditional ones that earn their place, and the ultra-processed stuff left off.',
    picks: ['eggs', 'grass_fed_butter', 'liver', 'bone_broth', 'sauerkraut', 'chicken', 'greek_yogurt', 'spinach', 'seasonal_veg', 'berries', 'beans', 'evoo'],
  },
  high_protein: {
    intro: 'Set up high-protein — the anchors up front so every meal has something real behind it.',
    picks: ['chicken_breast', 'ground_beef', 'eggs', 'greek_yogurt', 'cottage_cheese', 'canned_fish', 'beans', 'spinach', 'rice', 'evoo'],
  },
  low_sugar: {
    intro: 'Built to keep added sugar down — whole foods that satisfy without the spike.',
    picks: ['eggs', 'chicken', 'greek_yogurt', 'spinach', 'seasonal_veg', 'berries', 'almonds', 'avocado', 'steel_cut_oats', 'evoo'],
  },
  family: {
    intro: 'Built for the whole house — staples everyone eats, and cleaner versions of the usual snacks.',
    picks: ['chicken', 'eggs', 'milk', 'greek_yogurt', 'bananas_apples', 'seasonal_veg', 'rice', 'steel_cut_oats', 'nut_butter', 'evoo'],
  },
  gut_health: {
    intro: 'Built around the ferments first — live cultures, then fiber to feed them, and the additives left out.',
    picks: ['kefir', 'live_yogurt', 'sauerkraut', 'kimchi', 'miso', 'brined_pickles', 'lentils', 'steel_cut_oats', 'berries', 'spinach', 'garlic_onions', 'evoo'],
  },
  avoiding_junk: {
    intro: 'Built to sidestep the junk — and stocked with the real versions of what it replaces.',
    picks: ['chicken', 'eggs', 'grass_fed_butter', 'greek_yogurt', 'brined_pickles', 'whole_fruit', 'spinach', 'seasonal_veg', 'almonds', 'popcorn', 'steel_cut_oats', 'evoo'],
  },
  weight_loss: {
    intro: 'Built for weight loss — protein and fiber up front so you stay full on less, and the sugary stuff left off.',
    picks: ['chicken_breast', 'eggs', 'greek_yogurt', 'canned_fish', 'spinach', 'seasonal_veg', 'berries', 'beans', 'steel_cut_oats', 'evoo'],
  },
  muscle_strength: {
    intro: 'Set up for muscle and strength — protein at every meal, real carbs to train on, and the nutrient-dense cuts most people skip.',
    picks: ['chicken_breast', 'grass_fed_beef', 'eggs', 'liver', 'greek_yogurt', 'cottage_cheese', 'canned_fish', 'rice', 'steel_cut_oats', 'beans', 'evoo'],
  },
  pregnancy_postpartum: {
    intro: 'Built for this season — nutrient-dense whole foods that are easy to keep on hand.',
    picks: ['eggs', 'chicken', 'sardines', 'greek_yogurt', 'spinach', 'beans', 'berries', 'sweet_potatoes', 'steel_cut_oats', 'almonds', 'evoo'],
  },
  athlete_performance: {
    intro: 'Built for performance — enough real carbs to fuel the work, protein to recover.',
    picks: ['chicken_breast', 'eggs', 'greek_yogurt', 'canned_fish', 'rice', 'steel_cut_oats', 'bananas', 'spinach', 'beans', 'evoo'],
  },
  _default: {
    intro: "Here's a clean starting list. Tell me what you're shopping for and it sharpens fast.",
    picks: ['chicken', 'eggs', 'spinach', 'berries', 'steel_cut_oats', 'evoo'],
  },
};

const VARIANT_PRIORITY = ['no_kitchen', 'short_on_time', 'budget', 'picky_kids', 'cooking_for_one'];

/** Resolve a pick key → the full item object. Throws on an unknown key. */
function pick(key) {
  const p = PICKS[key];
  if (!p) throw new Error(`list.js (demo): unknown pick "${key}"`);
  return { key, ...p };
}

// Templates, resolved to concrete items at module load — same shape the server returns.
const GOAL_TEMPLATES = Object.fromEntries(
  Object.entries(TEMPLATE_PICKS).map(([goal, t]) => [goal, { intro: t.intro, items: t.picks.map(pick) }])
);

/** DEMO mirror of the server's applyVariants — a constraint chooses the specific pick. */
function applyVariantsLocal(items, constraints, premium) {
  if (!premium || !constraints?.length) return items;
  const active = new Set(constraints.map((x) => String(x).toLowerCase()));
  const order = VARIANT_PRIORITY.filter((x) => active.has(x));
  if (!order.length) return items;
  return items.map((it) => {
    if (!it.variants) return it;
    const hit = order.find((x) => it.variants[x]);
    if (!hit) return it;
    const { alt: _baseAlt, ...rest } = it;
    return { ...rest, ...it.variants[hit], constraintTuned: hit };
  });
}


const LEGACY_TEMPLATE_ALIASES = { cut: 'eating_cleaner', recomp: 'high_protein', performance: 'high_protein', energy: 'low_sugar', budget_clean: 'eating_cleaner', kids_snacks: 'eating_cleaner' };

// Hard-line exclusion + tag inference + conditional renames — mirror server/lib/list.js.
const EXCLUDE_TAGS = {
  'dairy-free': ['dairy'],
  vegetarian: ['meat', 'fish'],
  vegan: ['meat', 'fish', 'egg', 'dairy'],
  'gluten-free': ['gluten'],
};
function foodTags(name) {
  const n = String(name).toLowerCase();
  const tags = [];
  if (/\b(chicken|beef|turkey|pork|bacon|sausage|steak|lamb|meat)\b/.test(n)) tags.push('meat');
  if (/\b(fish|salmon|tuna|sardine|cod|tilapia|shrimp|seafood|anchov)\b/.test(n)) tags.push('fish');
  if (/\begg/.test(n)) tags.push('egg');
  if (/\b(milk|yogurt|cheese|kefir|butter|ghee|cottage|dairy|cream)\b/.test(n)) tags.push('dairy');
  if (/\b(pasta|bread|wheat|barley|couscous|cracker|bun|bagel|tortilla)\b/.test(n)) tags.push('gluten');
  return tags;
}
const CONDITIONAL_RENAMES = [
  {
    line: 'no seed oils',
    match: /olive oil/i,
    to: 'Extra-virgin olive oil — cold-pressed, single origin',
    why: 'Single origin and a harvest date — that’s how you avoid a cheap-oil blend.',
  },
  {
    line: 'no seed oils',
    match: /\b(vegetable|canola|cooking) oil\b/i,
    to: 'Extra-virgin olive oil (not a seed-oil blend)',
    why: 'Swapped in for the blend — read the back, blends hide behind “vegetable oil”.',
  },
  {
    line: 'no seed oils',
    match: /roasted (almonds|nuts|peanuts)/i,
    to: 'Raw or dry-roasted almonds',
    why: 'Dry-roasted or raw — many roasted nuts are cooked in cottonseed or soybean oil.',
  },
  { line: 'gluten-free', match: /pasta/i, to: 'Basmati rice', why: 'Rice instead of the pasta — same job on the plate.' },
];
function applyConditionalRenamesLocal(items, nonNegotiables) {
  const active = new Set((nonNegotiables || []).map((v) => String(v).toLowerCase()));
  const rules = CONDITIONAL_RENAMES.filter((r) => active.has(r.line));
  if (!rules.length) return items;
  return items.map((it) => {
    const hit = rules.find((r) => r.match.test(it.name));
    return hit ? { ...it, name: hit.to, ...(hit.why ? { why: hit.why } : {}) } : it;
  });
}
const FOCUS_ITEMS = {
  higher_fiber: [pick('lentils'), pick('steel_cut_oats'), pick('chia_flax')],
  lower_sodium: [
    pick('almonds'),
    { name: 'Frozen vegetables (no sauce)', category: 'Produce', perimeterId: 'frozen_vs_fresh_produce', why: 'Frozen plain — the sauced bags are where the salt hides.' },
  ],
  lower_sugar: [pick('berries'), pick('greek_yogurt')],
  blood_sugar: [pick('seasonal_veg'), pick('eggs')],
  heart: [pick('sardines'), pick('evoo')],
  processed_fats: [
    pick('evoo'),
    { name: 'Butter or ghee', category: 'Staples', tags: ['dairy'], perimeterId: 'grassfed_butter', why: 'A real whole-food fat — the thing margarine was built to imitate.' },
  ],
  additive_sensitive: [
    { name: 'Single-ingredient staples', category: 'Staples', why: 'Anything whose label is one line — that’s the whole trick.' },
  ],
  caffeine: [],
};

// Constraint anchors + intro clause — mirror server/lib/list.js. No prices, ever.
const CONSTRAINT_ITEMS = {
  budget: [
    pick('eggs'), pick('beans'), pick('steel_cut_oats'), pick('rice'),
    pick('frozen_veg'), pick('sardines'), pick('chicken'), pick('potatoes'),
  ],
  short_on_time: [
    pick('spinach'), pick('chicken'), pick('canned_fish'), pick('frozen_veg'), pick('eggs'),
  ],
  picky_kids: [
    pick('greek_yogurt'), pick('cheese_sticks'), pick('bananas_apples'), pick('steel_cut_oats'),
  ],
  no_kitchen: [
    pick('canned_fish'), pick('nut_butter'), pick('rice'), pick('whole_fruit'),
  ],
  cooking_for_one: [
    pick('eggs'), pick('frozen_veg'), pick('canned_fish'), pick('steel_cut_oats'),
  ],
};
const CONSTRAINT_INTRO = {
  budget: 'easy on the receipt',
  short_on_time: 'fast — little to no cooking',
  picky_kids: 'kid-friendly',
  no_kitchen: 'no-cook wherever possible',
  cooking_for_one: 'portioned for one',
};
function constraintClauseLocal(constraints) {
  const frags = (constraints || []).map((c) => CONSTRAINT_INTRO[c]).filter(Boolean);
  if (!frags.length) return '';
  const joined = frags.length > 1 ? `${frags.slice(0, -1).join(', ')} and ${frags[frags.length - 1]}` : frags[0];
  return ` Kept it ${joined}.`;
}

function swapItemsLocal(nextList) {
  return (nextList || [])
    .filter((s) => s && s.product_name)
    .map((s) => ({ id: rid(), name: `Swap out: ${s.product_name}`, category: 'From your haul', checked: false, source: 'swap', why: 'You scanned this last trip and I’d pick differently — open it for a better option.', productName: s.product_name }));
}

function resolveTemplateLocal(goal) {
  return GOAL_TEMPLATES[goal] || GOAL_TEMPLATES[LEGACY_TEMPLATE_ALIASES[goal]] || null;
}
// Overlap-ranked blend (mirror of server blendTemplates): rank by how many goals
// want each item, collapse near-identical items, round-robin the rest, cap at 18.
const ITEM_QUALIFIERS_L =
  /\b(plain|lean|whole|whole-milk|fresh|frozen|canned|dried|raw|steel-cut|non-starchy|unsalted|real|pre-washed|rotisserie|low-fat|nonfat|organic|skinless|boneless)\b/g;
function canonicalItemLocal(name) {
  return String(name)
    .toLowerCase()
    .split('—')[0]
    .replace(/\([^)]*\)/g, ' ')
    .replace(ITEM_QUALIFIERS_L, ' ')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function blendIntroLocal(goals) {
  const labels = goals
    .map((g) => COACH_GOALS.find((c) => c.value === g)?.chipLabel || g)
    .filter(Boolean)
    .map((s) => s.toLowerCase());
  const joined = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}` : labels[0];
  const lean = labels.length === 2 ? 'what does both' : 'what does the most at once';
  return `Built for ${joined} — leaning on ${lean}.`;
}
function blendTemplatesLocal(goals) {
  const resolved = (goals || []).map(resolveTemplateLocal).filter(Boolean);
  if (resolved.length === 0) return { items: GOAL_TEMPLATES._default.items, intro: GOAL_TEMPLATES._default.intro };
  if (resolved.length === 1) return { items: resolved[0].items, intro: resolved[0].intro };

  const CAP = 18;
  const byKey = new Map();
  const perGoalKeys = resolved.map((t) => {
    const keys = [];
    const local = new Set();
    for (const it of t.items) {
      const key = canonicalItemLocal(it.name);
      if (!key || local.has(key)) continue;
      local.add(key);
      keys.push(key);
      const g = byKey.get(key);
      if (g) {
        g.count += 1;
        if (it.name.length < g.item.name.length) g.item = it;
      } else {
        byKey.set(key, { item: it, count: 1 });
      }
    }
    return keys;
  });

  const placed = new Set();
  const items = [];
  const push = (it) => {
    const key = canonicalItemLocal(it.name);
    if (placed.has(key) || items.length >= CAP) return;
    placed.add(key);
    items.push(it);
  };

  [...byKey.values()].filter((g) => g.count >= 2).sort((a, b) => b.count - a.count).forEach((g) => push(g.item));

  const perGoalUnique = perGoalKeys.map((keys) => keys.filter((k) => byKey.get(k).count === 1).map((k) => byKey.get(k).item));
  for (let i = 0; items.length < CAP; i++) {
    let any = false;
    for (const list of perGoalUnique) {
      if (list[i]) {
        any = true;
        push(list[i]);
      }
      if (items.length >= CAP) break;
    }
    if (!any) break;
  }

  return { items, intro: blendIntroLocal(goals) };
}

function generateLocal({ goal, goals, nonNegotiables = [], focuses = [], constraints = [], nextList = [], signals = {}, premium = true }) {
  const goalList = (Array.isArray(goals) && goals.length ? goals : goal ? [goal] : []).filter(Boolean);
  const tpl = blendTemplatesLocal(goalList);
  const excluded = new Set();
  for (const nn of nonNegotiables || [])
    (EXCLUDE_TAGS[String(nn).toLowerCase()] || []).forEach((t) => excluded.add(t));
  const removed = new Set((signals.removed || []).map((s) => String(s).toLowerCase()));
  const itemTags = (it) => [...(it.tags || []), ...foodTags(it.name)];
  const blocked = (it) => itemTags(it).some((t) => excluded.has(t)) || removed.has(it.name.toLowerCase());

  const base = tpl.items.filter((it) => !blocked(it));
  const present = new Set(base.map((it) => it.name.toLowerCase()));
  const extra = [];
  if (premium) {
    const pull = (table, keys) => {
      for (const k of keys || []) {
        for (const it of table[k] || []) {
          const key = it.name.toLowerCase();
          if (blocked(it) || present.has(key)) continue;
          present.add(key);
          extra.push(it);
        }
      }
    };
    pull(FOCUS_ITEMS, focuses);
    pull(CONSTRAINT_ITEMS, constraints);
  }
  const tuned = applyVariantsLocal([...base, ...extra], constraints, premium);
  const items = applyConditionalRenamesLocal(tuned, nonNegotiables).map((it) => ({
    id: rid(),
    name: it.name,
    category: it.category,
    checked: false,
    source: 'template',
    ...(it.why ? { why: it.why } : {}),
    ...(it.perimeterId ? { perimeterId: it.perimeterId } : {}),
    ...(it.alt ? { alt: it.alt } : {}),
  }));
  const swaps = premium ? swapItemsLocal(nextList) : [];
  const intro = tpl.intro + (premium ? constraintClauseLocal(constraints) : '');
  return { goal: goalList[0] || null, goals: goalList, intro, items: [...swaps, ...items] };
}

function mergeSwapsLocal(list, nextList) {
  if (!nextList?.length || !list?.items) return list;
  const have = new Set(list.items.filter((i) => i.source === 'swap' && i.productName).map((i) => i.productName.toLowerCase()));
  const fresh = swapItemsLocal(nextList).filter((s) => !have.has(s.productName.toLowerCase()));
  if (!fresh.length) return list;
  return { ...list, items: [...fresh, ...list.items] };
}

function takeDemoNext() {
  const n = read(NEXT_KEY, []);
  write(NEXT_KEY, []);
  return n;
}

// The demo mirror of the server's listSignature staleness check. Without it the
// sandbox hands back whatever it generated first — so a shopper who finishes
// onboarding keeps the goal-less `_default` cart, which is precisely the generic-cart
// bug the real path already guards against. Mirrors server/lib/list.js.
const demoSignature = ({ goals = [], nonNegotiables = [], focuses = [], constraints = [] }) =>
  JSON.stringify([[...goals].sort(), [...nonNegotiables].sort(), [...focuses].sort(), [...constraints].sort()]);

// Carry the shopper's own rows across a regeneration — what they added by hand, what
// they scanned into the trip, and Kristy's haul callouts. Mirrors preserveUserItems.
function preserveOwnLocal(fresh, stored) {
  const keepers = (stored?.items || []).filter(
    (i) => i.source === 'user' || i.source === 'swap' || i.source === 'scan'
  );
  const names = new Set((fresh.items || []).map((i) => i.name.toLowerCase()));
  return { ...fresh, items: [...fresh.items, ...keepers.filter((i) => !names.has(i.name.toLowerCase()))] };
}

function loadOrGenerateDemo({ goal, goals, nonNegotiables, focuses, constraints }) {
  const stored = loadCachedList();
  const pending = read(NEXT_KEY, []);
  const sig = demoSignature({ goals: goals?.length ? goals : goal ? [goal] : [], nonNegotiables, focuses, constraints });

  if (stored && Array.isArray(stored.items)) {
    if (stored.sig !== sig) {
      // Preferences changed since this cart was built → rebuild around them, keeping
      // everything the shopper put in it themselves. An absent sig counts as stale so
      // a cart cached before signatures existed heals itself once instead of pinning
      // the shopper to the goal-less `_default` template forever.
      const fresh = generateLocal({ goal, goals, nonNegotiables, focuses, constraints, nextList: pending, signals: loadSignals(), premium: true });
      const merged = { ...preserveOwnLocal(fresh, stored), sig };
      write(NEXT_KEY, []);
      saveCache(merged);
      return merged;
    }
    if (pending.length) {
      const merged = mergeSwapsLocal(stored, pending);
      write(NEXT_KEY, []);
      saveCache(merged);
      return merged;
    }
    return stored;
  }

  // No cached cart → NO CART. The demo mirrors the server: we don't invent a trip
  // before the shopper says what it's for. The cart surface asks instead.
  return null;
}
