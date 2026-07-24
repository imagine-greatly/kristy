// The List client (Step 8 → durable). The SERVER is now the source of truth: it
// persists the list (survives a device change) and enforces the premium capabilities
// (focus-aware items, haul-swap integration) so they can't be tampered on. This
// module is a thin client over /api/list with localStorage as a read-through CACHE
// for instant render, plus a demo (no-backend) fallback that generates locally.
//
// The demo GOAL_TEMPLATES/FOCUS_ITEMS mirror server/lib/list.js — keep them in sync.

import { IS_DEMO, apiBase } from './config.js';
import { supabase } from './supabase.js';

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

/* ───────── Public API — server-backed, cache-first ───────── */

// The persisted list + the server's premium verdict (drives the capability nudge).
export async function fetchList({ goal, nonNegotiables = [], focuses = [], constraints = [] } = {}) {
  if (IS_DEMO) return { list: loadOrGenerateDemo({ goal, nonNegotiables, focuses, constraints }), premium: true };
  try {
    const { list, premium } = await authFetch('/api/list', { method: 'GET' });
    const ok = list && Array.isArray(list.items);
    if (ok) saveCache(list);
    return { list: ok ? list : loadCachedList(), premium: !!premium };
  } catch {
    // Offline / pre-migration → render the cache so the surface still works.
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
export async function rebuildList({ goal, nonNegotiables = [], focuses = [], constraints = [] } = {}) {
  if (IS_DEMO) {
    const list = generateLocal({ goal, nonNegotiables, focuses, constraints, nextList: takeDemoNext(), signals: loadSignals(), premium: true });
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
    const cur = loadCachedList() || generateLocal({ ...prefs, premium: true });
    const { add, remove, summary } = demoCompose(text, mode);
    let list;
    if (mode === 'build') {
      const items = add.map((a) => ({ id: rid(), name: a.name, category: a.section, checked: false, source: 'template' }));
      list = { goal: cur.goal || null, intro: summary, items };
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
  if (/taco/.test(t)) return { add: items(['Ground beef', 'Tortillas', 'Bell peppers', 'Onion', 'Shredded cheese', 'Salsa']), remove: [], summary: 'Added taco night — beef, tortillas, peppers, onion, cheese, and salsa.' };
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

/* ═══════════ Demo generation (no backend) — mirrors server/lib/list.js ═══════════ */

const GOAL_TEMPLATES = {
  eating_cleaner: {
    intro: "Built for eating cleaner — whole foods first, and I kept the ultra-processed stuff off the list.",
    items: [
      { name: 'Chicken or fish', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Plain Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Seasonal vegetables', category: 'Produce' },
      { name: 'Berries', category: 'Produce' },
      { name: 'Beans or lentils', category: 'Staples' },
      { name: 'Oats or rice', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
      { name: 'Unsalted nuts', category: 'Snacks' },
    ],
  },
  high_protein: {
    intro: 'Set up high-protein — the anchors up front so every meal has something real behind it.',
    items: [
      { name: 'Chicken breast', category: 'Protein' },
      { name: 'Lean ground beef or turkey', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Cottage cheese', category: 'Protein', tags: ['dairy'] },
      { name: 'Canned tuna or salmon', category: 'Protein' },
      { name: 'Beans or lentils', category: 'Staples' },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Rice or potatoes', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  low_sugar: {
    intro: 'Built to keep added sugar down — whole foods that satisfy without the spike.',
    items: [
      { name: 'Eggs', category: 'Protein' },
      { name: 'Chicken or fish', category: 'Protein' },
      { name: 'Plain Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Non-starchy vegetables', category: 'Produce' },
      { name: 'Berries', category: 'Produce' },
      { name: 'Unsalted nuts', category: 'Snacks' },
      { name: 'Avocado', category: 'Produce' },
      { name: 'Steel-cut oats', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  family: {
    intro: 'Built for the whole house — staples everyone eats, and cleaner versions of the usual snacks.',
    items: [
      { name: 'Chicken or fish', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Milk', category: 'Protein', tags: ['dairy'] },
      { name: 'Plain yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Fruit the kids will eat', category: 'Produce' },
      { name: 'Easy vegetables', category: 'Produce' },
      { name: 'Rice, pasta, or potatoes', category: 'Staples' },
      { name: 'Oats', category: 'Staples' },
      { name: 'Nut butter (just nuts)', category: 'Snacks' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  gut_health: {
    intro: 'Built to feed your gut — fermented foods, fiber, and fewer additives.',
    items: [
      { name: 'Plain kefir', category: 'Fermented', tags: ['dairy'] },
      { name: 'Sauerkraut', category: 'Fermented' },
      { name: 'Kimchi', category: 'Fermented' },
      { name: 'Lentils or beans', category: 'Fiber' },
      { name: 'Oats', category: 'Fiber' },
      { name: 'Berries', category: 'Produce' },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Garlic and onions', category: 'Produce' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  avoiding_junk: {
    intro: 'Built to sidestep the junk — whole-food swaps for the stuff that usually sneaks into the cart.',
    items: [
      { name: 'Chicken or fish', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Plain Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Whole fruit', category: 'Produce' },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Vegetables for snacking', category: 'Produce' },
      { name: 'Unsalted nuts', category: 'Snacks' },
      { name: 'Popcorn kernels', category: 'Snacks' },
      { name: 'Oats or rice', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  weight_loss: {
    intro: 'Built for weight loss — protein and fiber up front so you stay full on less, and the sugary stuff left off.',
    items: [
      { name: 'Chicken breast', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Plain Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Canned tuna or salmon', category: 'Protein' },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Non-starchy vegetables', category: 'Produce' },
      { name: 'Berries', category: 'Produce' },
      { name: 'Beans or lentils', category: 'Staples' },
      { name: 'Oats', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  muscle_strength: {
    intro: 'Set up for muscle and strength — protein at every meal and real carbs to train on.',
    items: [
      { name: 'Chicken breast', category: 'Protein' },
      { name: 'Lean ground beef or turkey', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Cottage cheese', category: 'Protein', tags: ['dairy'] },
      { name: 'Canned tuna or salmon', category: 'Protein' },
      { name: 'Rice or potatoes', category: 'Staples' },
      { name: 'Oats', category: 'Staples' },
      { name: 'Beans or lentils', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  pregnancy_postpartum: {
    intro: 'Built for this season — nutrient-dense whole foods that are easy to keep on hand.',
    items: [
      { name: 'Eggs', category: 'Protein' },
      { name: 'Chicken or fish', category: 'Protein' },
      { name: 'Fatty fish (salmon or sardines)', category: 'Protein' },
      { name: 'Plain Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Beans or lentils', category: 'Staples' },
      { name: 'Berries', category: 'Produce' },
      { name: 'Sweet potatoes', category: 'Produce' },
      { name: 'Oats', category: 'Staples' },
      { name: 'Nuts and seeds', category: 'Snacks' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  athlete_performance: {
    intro: 'Built for performance — enough real carbs to fuel the work, protein to recover.',
    items: [
      { name: 'Chicken breast', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Greek yogurt', category: 'Protein', tags: ['dairy'] },
      { name: 'Canned tuna or salmon', category: 'Protein' },
      { name: 'Rice or potatoes', category: 'Staples' },
      { name: 'Oats', category: 'Staples' },
      { name: 'Bananas', category: 'Produce' },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Beans or lentils', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
  _default: {
    intro: "Here's a clean starting list. Tell me what you're shopping for and I'll tailor it to you.",
    items: [
      { name: 'Chicken or fish', category: 'Protein' },
      { name: 'Eggs', category: 'Protein' },
      { name: 'Leafy greens', category: 'Produce' },
      { name: 'Berries', category: 'Produce' },
      { name: 'Oats or rice', category: 'Staples' },
      { name: 'Olive oil', category: 'Staples' },
    ],
  },
};

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
  { line: 'no seed oils', match: /^olive oil$/i, to: 'Olive oil — cold-pressed, not a blend' },
  { line: 'no seed oils', match: /\b(vegetable|canola|cooking) oil\b/i, to: 'Olive oil (not a seed-oil blend)' },
  { line: 'gluten-free', match: /pasta/i, to: 'Rice or potatoes' },
];
function applyConditionalRenamesLocal(items, nonNegotiables) {
  const active = new Set((nonNegotiables || []).map((v) => String(v).toLowerCase()));
  const rules = CONDITIONAL_RENAMES.filter((r) => active.has(r.line));
  if (!rules.length) return items;
  return items.map((it) => {
    const hit = rules.find((r) => r.match.test(it.name));
    return hit ? { ...it, name: hit.to } : it;
  });
}
const FOCUS_ITEMS = {
  higher_fiber: [
    { name: 'Beans or lentils', category: 'Fiber' },
    { name: 'Oats', category: 'Fiber' },
    { name: 'Chia or ground flax', category: 'Fiber' },
  ],
  lower_sodium: [
    { name: 'Unsalted nuts', category: 'Snacks' },
    { name: 'Fresh or frozen vegetables (not canned)', category: 'Produce' },
  ],
  lower_sugar: [
    { name: 'Berries', category: 'Produce' },
    { name: 'Plain Greek yogurt', category: 'Protein', tags: ['dairy'] },
  ],
  blood_sugar: [
    { name: 'Non-starchy vegetables', category: 'Produce' },
    { name: 'Eggs', category: 'Protein' },
  ],
  heart: [
    { name: 'Fatty fish (salmon or sardines)', category: 'Protein' },
    { name: 'Olive oil', category: 'Staples' },
  ],
  processed_fats: [
    { name: 'Olive oil', category: 'Staples' },
    { name: 'Butter or ghee', category: 'Staples', tags: ['dairy'] },
  ],
  additive_sensitive: [{ name: 'Single-ingredient staples', category: 'Staples' }],
  caffeine: [],
};

// Constraint anchors + intro clause — mirror server/lib/list.js. No prices, ever.
const CONSTRAINT_ITEMS = {
  budget: [
    { name: 'Eggs', category: 'Protein' },
    { name: 'Dried or canned beans', category: 'Staples' },
    { name: 'Oats', category: 'Staples' },
    { name: 'Brown rice', category: 'Staples' },
    { name: 'Frozen vegetables', category: 'Produce' },
    { name: 'Canned sardines or salmon', category: 'Protein' },
    { name: 'Whole chicken', category: 'Protein' },
    { name: 'Potatoes', category: 'Produce' },
  ],
  short_on_time: [
    { name: 'Pre-washed salad greens', category: 'Produce' },
    { name: 'Rotisserie chicken', category: 'Protein' },
    { name: 'Canned tuna or salmon', category: 'Protein' },
    { name: 'Frozen vegetables', category: 'Produce' },
    { name: 'Eggs', category: 'Protein' },
  ],
  picky_kids: [
    { name: 'Whole-milk yogurt (plain)', category: 'Protein', tags: ['dairy'] },
    { name: 'Real cheese sticks', category: 'Protein', tags: ['dairy'] },
    { name: 'Bananas and apples', category: 'Produce' },
    { name: 'Oats', category: 'Staples' },
  ],
  no_kitchen: [
    { name: 'Canned fish', category: 'Protein' },
    { name: 'Nut butter (just nuts)', category: 'Snacks' },
    { name: 'Microwave brown rice', category: 'Staples' },
    { name: 'Whole fruit', category: 'Produce' },
  ],
  cooking_for_one: [
    { name: 'Eggs', category: 'Protein' },
    { name: 'Frozen vegetables', category: 'Produce' },
    { name: 'Canned fish', category: 'Protein' },
    { name: 'Oats', category: 'Staples' },
  ],
};
const CONSTRAINT_INTRO = {
  budget: 'easy on the receipt',
  short_on_time: 'fast — little to no cooking',
  picky_kids: 'kid-friendly',
  no_kitchen: 'no-cook where I could',
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
    .map((s) => ({ id: rid(), name: `Swap out: ${s.product_name}`, category: 'From your haul', checked: false, source: 'swap', productName: s.product_name }));
}

function generateLocal({ goal, nonNegotiables = [], focuses = [], constraints = [], nextList = [], signals = {}, premium = true }) {
  const tpl = GOAL_TEMPLATES[goal] || GOAL_TEMPLATES[LEGACY_TEMPLATE_ALIASES[goal]] || GOAL_TEMPLATES._default;
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
  const items = applyConditionalRenamesLocal([...base, ...extra], nonNegotiables).map((it) => ({ id: rid(), name: it.name, category: it.category, checked: false, source: 'template' }));
  const swaps = premium ? swapItemsLocal(nextList) : [];
  const intro = tpl.intro + (premium ? constraintClauseLocal(constraints) : '');
  return { goal: goal || null, intro, items: [...swaps, ...items] };
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

function loadOrGenerateDemo({ goal, nonNegotiables, focuses, constraints }) {
  const stored = loadCachedList();
  const pending = read(NEXT_KEY, []);
  if (stored && Array.isArray(stored.items)) {
    if (pending.length) {
      const merged = mergeSwapsLocal(stored, pending);
      write(NEXT_KEY, []);
      saveCache(merged);
      return merged;
    }
    return stored;
  }
  const list = generateLocal({ goal, nonNegotiables, focuses, constraints, nextList: pending, signals: loadSignals(), premium: true });
  write(NEXT_KEY, []);
  saveCache(list);
  return list;
}
