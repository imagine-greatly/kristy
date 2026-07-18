// The List builder (Step 8 — hybrid line). MINIMAL surface: a goal-based template,
// filtered by non-negotiables, plus the swap-tier items pushed from the Haul.
// HYBRID hook: keep/remove/accepted-swap signals are persisted from day one, so a
// later scoring pass over hauls + memory + training can upgrade generation without
// a rebuild. Client-only for now (localStorage); a Supabase-backed list can slot
// in behind these same helpers later.

const LIST_KEY = 'kristy:list';
const SIGNALS_KEY = 'kristy:listSignals';
const NEXT_KEY = 'kristy:nextList'; // fed by the Haul's "Add to next list"

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

// Per-goal starter templates, keyed to the shopping goals. Whole-food and
// preference-framed — what to buy, not macros to hit. Items carry tags only for
// the non-negotiable filter (e.g. 'dairy').
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

// Legacy coach_goal values → the nearest new template (mirrors coachGoals.js), so an
// existing row never falls through to the generic default.
const LEGACY_TEMPLATE_ALIASES = {
  cut: 'eating_cleaner',
  recomp: 'high_protein',
  performance: 'high_protein',
  energy: 'low_sugar',
};

// Non-negotiable → the item tags it excludes.
const EXCLUDE_TAGS = { 'dairy-free': ['dairy'] };

/**
 * Generate the list from the goal template, filtered by non-negotiables and the
 * learning signals (never re-suggest an item the user keeps deleting), with the
 * Haul's flagged items prepended as swap reminders.
 */
export function generateList({ goal, nonNegotiables = [], nextList = [], signals = {} }) {
  const tpl = GOAL_TEMPLATES[goal] || GOAL_TEMPLATES[LEGACY_TEMPLATE_ALIASES[goal]] || GOAL_TEMPLATES._default;

  const excluded = new Set();
  for (const nn of nonNegotiables) (EXCLUDE_TAGS[nn] || []).forEach((t) => excluded.add(t));
  const removed = new Set((signals.removed || []).map((s) => String(s).toLowerCase()));

  const items = tpl.items
    .filter((it) => !(it.tags || []).some((t) => excluded.has(t)))
    .filter((it) => !removed.has(it.name.toLowerCase()))
    .map((it) => ({ id: rid(), name: it.name, category: it.category, checked: false, source: 'template' }));

  const swaps = (nextList || [])
    .filter((s) => s && s.product_name)
    .map((s) => ({ id: rid(), name: `Swap out: ${s.product_name}`, category: 'From your haul', checked: false, source: 'swap', productName: s.product_name }));

  return { goal: goal || null, intro: tpl.intro, items: [...swaps, ...items] };
}

/* ───────── Persistence + learning signals ───────── */

export const loadSignals = () => read(SIGNALS_KEY, { removed: [], kept: [], acceptedSwaps: [] });
export const saveSignals = (s) => write(SIGNALS_KEY, s);
export const loadStoredList = () => read(LIST_KEY, null);
export const saveList = (list) => write(LIST_KEY, list);

// Drain the Haul's pending "add to next list" queue (and clear it).
export function takeNextList() {
  const next = read(NEXT_KEY, []);
  write(NEXT_KEY, []);
  return next;
}

// Record that an item was removed — so future generations stop suggesting it.
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

// Get (or first-time generate) the persisted list.
export function loadList({ goal, nonNegotiables }) {
  const stored = loadStoredList();
  if (stored && Array.isArray(stored.items)) return stored;
  const fresh = generateList({ goal, nonNegotiables, nextList: takeNextList(), signals: loadSignals() });
  saveList(fresh);
  return fresh;
}

// Rebuild from the goal (honoring learning signals), merging any pending Haul items.
export function rebuildList({ goal, nonNegotiables }) {
  const fresh = generateList({ goal, nonNegotiables, nextList: takeNextList(), signals: loadSignals() });
  saveList(fresh);
  return fresh;
}
