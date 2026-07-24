// The List generator — SERVER-SIDE and authoritative (Step 8 → durable + gated).
//
// Generation lives here, not on the client, because the premium capabilities have
// to be enforced where a tampering client can't reach: the route reads premium from
// the DB and passes it in, and a non-premium call simply never receives the gated
// items. The client renders whatever the server returns.
//
// The free tier is a real, useful list: the goal template minus the user's hard
// lines, with removed items suppressed. The PREMIUM capabilities are (1) focus-aware
// items — the user's dietary focuses shape what's on the list — and (2) haul-swap
// integration — the flagged items pushed from the Haul ride in front as reminders.
//
// GOAL_TEMPLATES mirrors the client's demo copy in client/src/lib/list.js; keep them
// in sync (same pattern as tdee.js ↔ computeGoalsDemo).

import { randomUUID } from 'node:crypto';

const rid = () => randomUUID();

// Per-goal starter templates — whole-food, preference-framed (what to buy, not
// macros). Items carry tags only for the non-negotiable filter (e.g. 'dairy').
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

const LEGACY_TEMPLATE_ALIASES = {
  cut: 'eating_cleaner',
  recomp: 'high_protein',
  performance: 'high_protein',
  energy: 'low_sugar',
  // The two retired goals resolve to the clean-eating template (they're now goal +
  // constraint — see migratePreferences); kept here so a pre-migration goal id still
  // renders a sensible list.
  budget_clean: 'eating_cleaner',
  kids_snacks: 'eating_cleaner',
};

// Infer dietary tags from an item's plain name, so a hard line can exclude it
// without every template item being hand-tagged. Merged with any explicit tags.
export function foodTags(name) {
  const n = String(name).toLowerCase();
  const tags = [];
  if (/\b(chicken|beef|turkey|pork|bacon|sausage|steak|lamb|meat)\b/.test(n)) tags.push('meat');
  if (/\b(fish|salmon|tuna|sardine|cod|tilapia|shrimp|seafood|anchov)\b/.test(n)) tags.push('fish');
  if (/\begg/.test(n)) tags.push('egg');
  if (/\b(milk|yogurt|cheese|kefir|butter|ghee|cottage|dairy|cream)\b/.test(n)) tags.push('dairy');
  if (/\b(pasta|bread|wheat|barley|couscous|cracker|bun|bagel|tortilla)\b/.test(n)) tags.push('gluten');
  return tags;
}

// Hard line -> the item tags it excludes. Applied on FREE and premium alike — a
// refusal is not a personalization luxury. dairy-free / gluten-free shape the LIST
// (we control its item tags) even though the ingredient KB can't verify them on a
// scanned product (that stays advisory in the verdict engine).
const EXCLUDE_TAGS = {
  'dairy-free': ['dairy'],
  vegetarian: ['meat', 'fish'],
  vegan: ['meat', 'fish', 'egg', 'dairy'],
  'gluten-free': ['gluten'],
};

// A hard line that CLARIFIES an item in place rather than removing it — expresses
// the label to look for in the item name. No health claim, just what to buy.
const CONDITIONAL_RENAMES = [
  { line: 'no seed oils', match: /^olive oil$/i, to: 'Olive oil — cold-pressed, not a blend' },
  { line: 'no seed oils', match: /\b(vegetable|canola|cooking) oil\b/i, to: 'Olive oil (not a seed-oil blend)' },
  { line: 'gluten-free', match: /pasta/i, to: 'Rice or potatoes' },
];

// Apply every conditional rename whose hard line is active, in place.
function applyConditionalRenames(items, nonNegotiables) {
  const active = new Set((nonNegotiables || []).map((v) => String(v).toLowerCase()));
  const rules = CONDITIONAL_RENAMES.filter((r) => active.has(r.line));
  if (!rules.length) return items;
  return items.map((it) => {
    const hit = rules.find((r) => r.match.test(it.name));
    return hit ? { ...it, name: hit.to } : it;
  });
}

// PREMIUM: a CONSTRAINT pulls constraint-appropriate whole-food anchors onto the
// list — cheap-per-nutrition for budget, no-/low-prep for time & no-kitchen, familiar
// staples for picky kids, portionable for cooking-for-one. Every item is a plain
// grocery item (the list is a list, not a note) and carries NO price — budget means
// cost-conscious SELECTION, never a price lookup, which Kristy doesn't have. Deduped
// against the base + focus items by name.
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

// The clause Kristy adds to the list intro when a constraint is active, in her voice
// (reads after "Kept it "). Names the constraint plainly — never a price.
const CONSTRAINT_INTRO = {
  budget: 'easy on the receipt',
  short_on_time: 'fast — little to no cooking',
  picky_kids: 'kid-friendly',
  no_kitchen: 'no-cook where I could',
  cooking_for_one: 'portioned for one',
};

function constraintClause(constraints) {
  const frags = (constraints || []).map((c) => CONSTRAINT_INTRO[c]).filter(Boolean);
  if (!frags.length) return '';
  const joined =
    frags.length > 1 ? `${frags.slice(0, -1).join(', ')} and ${frags[frags.length - 1]}` : frags[0];
  return ` Kept it ${joined}.`;
}

// PREMIUM: a dietary focus pulls its own whole-food anchors onto the list. Every
// item is a plain grocery item — no health claim (the list is a list, not a note).
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

export const EMPTY_SIGNALS = { removed: [], kept: [], acceptedSwaps: [] };

function swapItems(nextList) {
  return (nextList || [])
    .filter((s) => s && s.product_name)
    .map((s) => ({
      id: rid(),
      name: `Swap out: ${s.product_name}`,
      category: 'From your haul',
      checked: false,
      source: 'swap',
      productName: s.product_name,
    }));
}

/**
 * Generate the list. FREE (premium=false): the goal template minus hard-line tags,
 * with removed items suppressed. PREMIUM: additionally folds in focus-relevant items
 * and prepends the Haul's swap reminders. `premium` is decided by the route from the
 * DB — the gated branches never run for a non-premium caller, so the capability can't
 * be tampered into existence.
 */
export function generateList({ goal, nonNegotiables = [], focuses = [], constraints = [], nextList = [], signals = {}, premium = false }) {
  const tpl = GOAL_TEMPLATES[goal] || GOAL_TEMPLATES[LEGACY_TEMPLATE_ALIASES[goal]] || GOAL_TEMPLATES._default;

  const excluded = new Set();
  for (const nn of nonNegotiables || [])
    (EXCLUDE_TAGS[String(nn).toLowerCase()] || []).forEach((t) => excluded.add(t));
  const removed = new Set((signals.removed || []).map((s) => String(s).toLowerCase()));
  const itemTags = (it) => [...(it.tags || []), ...foodTags(it.name)];
  const blocked = (it) => itemTags(it).some((t) => excluded.has(t)) || removed.has(it.name.toLowerCase());

  const base = tpl.items.filter((it) => !blocked(it));

  // PREMIUM — focuses AND constraints shape the list. Append their anchor items where
  // they clear the same filters and aren't already present (dedup by name). Free lists
  // ignore both entirely. Constraints come after focuses so a health watch leads.
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

  const items = applyConditionalRenames([...base, ...extra], nonNegotiables).map((it) => ({
    id: rid(),
    name: it.name,
    category: it.category,
    checked: false,
    source: 'template',
  }));

  // PREMIUM — the Haul's flagged items ride in front as swap reminders.
  const swaps = premium ? swapItems(nextList) : [];

  // The intro names active constraints in Kristy's voice (premium only — free lists
  // don't act on constraints, so they don't claim to).
  const intro = tpl.intro + (premium ? constraintClause(constraints) : '');

  return { goal: goal || null, intro, items: [...swaps, ...items] };
}

/**
 * Merge newly-added Haul swaps into an ALREADY-SAVED list (deduped by product), so
 * they appear without a full rebuild. Premium-only — returns the list unchanged for
 * a non-premium caller or when there's nothing new.
 */
export function mergePendingSwaps(list, nextList, premium) {
  if (!premium || !nextList?.length || !list || !Array.isArray(list.items)) return list;
  const have = new Set(
    list.items
      .filter((i) => i.source === 'swap' && i.productName)
      .map((i) => i.productName.toLowerCase())
  );
  const fresh = swapItems(nextList).filter((s) => !have.has(s.productName.toLowerCase()));
  if (!fresh.length) return list;
  return { ...list, items: [...fresh, ...list.items] };
}

/**
 * A stable signature of the generation inputs. The route regenerates a stored list
 * when this changes (goal / hard lines / focuses / constraints edited), so a goal
 * switch refreshes the list without a manual "Rebuild".
 */
export function listSignature({ goal = null, nonNegotiables = [], focuses = [], constraints = [] } = {}) {
  const norm = (a) => [...(a || [])].map((x) => String(x).toLowerCase()).sort();
  return JSON.stringify({
    goal: goal || null,
    hl: norm(nonNegotiables),
    f: norm(focuses),
    c: norm(constraints),
  });
}
