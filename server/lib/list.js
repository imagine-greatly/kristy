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
import { labelForGoal } from './taxonomy.js';
// listVoice holds the offer table and imports nothing, so this stays a one-way edge.
import { declinedItemNames } from './listVoice.js';

const rid = () => randomUUID();

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

  /* ── The champions ────────────────────────────────────────────────────────────
     Kristy has two voices, and the advocate is supposed to be as strong as the
     critic. Flagging seed oils on a scan is only half a philosophy; the other half
     is what she actively puts IN the cart. These are the traditional, nutrient-dense
     foods she argues for, expressed as real list items rather than a badge on
     something the shopper already picked up.

     Every `why` here is food-worth or tradition — what the food IS, how it was made,
     what to look for. Never an outcome in a body. "Live cultures, and more of them
     than yogurt" is a fact about the food; "heals your gut" would be a treatment
     claim, and nothing in this table is allowed to make one.

     `tags` matter as much as the copy: a champion that ignores a hard line is worse
     than no champion at all. Anything animal, dairy, or gluten-bearing is tagged so
     EXCLUDE_TAGS removes it before the shopper ever sees it. */
  live_yogurt: {
    name: 'Live-culture yogurt, plain', category: 'Dairy & Eggs', tags: ['dairy'],
    perimeterId: 'yogurt_plain_vs_flavored',
    why: 'Check the label actually lists live active cultures — plain, because the flavored tubs are dessert.',
  },
  miso: {
    name: 'Unpasteurized miso', category: 'Pantry',
    why: 'Refrigerated, not the shelf-stable kind. Stir it in off the heat so it stays alive.',
  },
  kombucha: {
    name: 'Kombucha, low-sugar', category: 'Pantry',
    why: 'Fermented tea — check the panel, some brands carry as much sugar as soda.',
  },
  brined_pickles: {
    name: 'Brined pickles, refrigerated', category: 'Pantry',
    why: 'Salt and water on the label, not vinegar — vinegar pickles never fermented.',
  },
  natto: {
    name: 'Natto', category: 'Pantry',
    why: 'The most acquired taste on this list, and a breakfast staple in Japan for centuries.',
  },
  liver: {
    name: 'Beef or chicken liver', category: 'Protein', tags: ['meat'],
    why: 'The most nutrient-dense thing in the case, and usually the cheapest per pound. Start with chicken liver if beef is too strong.',
    alt: 'Or a pâté, if cooking it yourself is a bridge too far.',
  },
  bone_broth: {
    name: 'Bone broth', category: 'Pantry', tags: ['meat'],
    why: 'Whole-animal cooking — the part most kitchens throw out. Look for one that gels in the fridge.',
    alt: 'Or save your own carcasses and make it for free.',
  },
  grass_fed_butter: {
    name: 'Grass-fed butter', category: 'Dairy & Eggs', tags: ['dairy'],
    why: 'The animal ate grass, and the fat shows it — deeper yellow than the commodity block.',
  },
  ghee: {
    name: 'Ghee', category: 'Pantry', tags: ['dairy'],
    why: 'Butter with the milk solids cooked off — keeps on the counter and takes real heat.',
  },
  sprouted_grain: {
    name: 'Sprouted whole-grain bread', category: 'Bakery', tags: ['gluten'],
    why: 'Sprouted before milling, the way grain was prepared for most of history. Buy it from the freezer.',
  },
  grass_fed_beef: {
    name: 'Grass-fed ground beef', category: 'Protein', tags: ['meat'],
    why: 'Grass-finished, not just grass-started — the label has to say finished to mean it.',
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
    name: 'Canned wild sardines', category: 'Protein', perimeterId: 'mercury_by_fish',
    why: 'Small fish, low on the chain, and you eat the whole thing — real omega-3s.',
    alt: 'Or canned salmon with the bones in.',
  },
  canned_fish: {
    name: 'Canned skipjack tuna', category: 'Protein', perimeterId: 'mercury_by_fish',
    why: 'Skipjack (the “light” tin) sits lower in mercury than albacore.',
    alt: 'Or canned salmon — bones in, more calcium.',
  },
  salmon: {
    name: 'Wild-caught salmon', category: 'Protein', perimeterId: 'salmon_wild_vs_farmed',
    why: 'Wild when the budget allows. A whole-food-standard call, not a verdict on farmed.',
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
  bananas_apples: { name: 'Bananas and apples', category: 'Produce', why: 'The two most kids will actually eat, and no packaging.' },
  garlic_onions: { name: 'Garlic and onions', category: 'Produce', why: 'The base of nearly everything cooked this week.' },

  /* ── Fruit: RANGE, not two hardcoded berries ──────────────────────────────────
     "Blueberries or strawberries" on every list is a smaller store than the one the
     shopper is standing in. The default pick names the season and hands back a real
     choice; the berry-specific pick stays for the lower-sugar focus, where the
     distinction actually does work. */
  seasonal_fruit: {
    name: 'Whatever fruit is in season', category: 'Produce', perimeterId: 'produce_seasonality',
    why: 'Apples, citrus, stone fruit, melon, grapes, pears. In season is cheaper and tastes like something.',
    alt: 'Frozen works year-round and was picked ripe.',
  },
  whole_fruit: {
    name: 'Whole fruit, any two kinds', category: 'Produce',
    why: 'Whole over juice: the fiber comes with it.',
  },

  /* ── The whole-food carbs ─────────────────────────────────────────────────────
     Carbs are not the enemy here; REFINED and industrial is the objection. Real meals
     are built on a starch, and a coach who quietly leaves it off the list is coaching
     a diet, not a week of eating. These are championed the same way the ferments and
     the nutrient-dense cuts are: named specifically, with the reason on the row.

     Every `why` is food-worth — what it is, how it is made, how it cooks. Nutrient
     density is a fact about the food and is allowed; an outcome in a body is not. */
  sweet_potatoes: {
    name: 'Sweet potatoes', category: 'Produce',
    why: 'More nutrient-dense than a white potato, and sweet enough to need nothing on it. Bake a tray, eat off it all week.',
    alt: 'Or regular potatoes — still a real food, and cheaper.',
  },
  potatoes: {
    name: 'Potatoes', category: 'Produce',
    why: 'One of the cheapest real foods in the store, and one of the most filling.',
  },
  winter_squash: {
    name: 'Butternut or acorn squash', category: 'Produce',
    why: 'Keeps on the counter for weeks. Halve it, roast it, done.',
  },
  sourdough: {
    name: 'Real sourdough', category: 'Bakery', tags: ['gluten'],
    why: 'Flour, water, salt, starter. Nothing else on the label, and it was fermented, not just flavored.',
    alt: 'Or sprouted whole-grain, from the freezer case.',
  },
  brown_rice: {
    name: 'Brown or jasmine rice', category: 'Staples', perimeterId: 'rice_arsenic',
    why: 'Brown keeps the bran, jasmine cooks softer. Rinse either one and cook it in extra water.',
  },
  quinoa: {
    name: 'Quinoa', category: 'Staples',
    why: 'Cooks in fifteen minutes and holds up cold in a bowl the next day. Rinse it first.',
  },

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
    name: 'Extra-virgin olive oil — dark bottle', category: 'Staples', perimeterId: 'olive_oil_grades',
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
  // Tagged fish because traditional kimchi is fermented with jeotgal — fish sauce or
  // shrimp paste. Vegan kimchi exists, but most jars on the shelf are not, and putting
  // seafood in a vegan's cart is a worse error than leaving one ferment out; sauerkraut,
  // miso and brined pickles keep a plant-only gut-health cart well supplied.
  kimchi: { name: 'Kimchi', category: 'Fermented', tags: ['fish'], why: 'Live and fermented, and it makes plain rice or eggs interesting.' },
  chia_flax: { name: 'Ground flax or chia', category: 'Fiber', why: 'A spoon into yogurt or oats — buy flax ground or it passes straight through.' },
  bananas: { name: 'Bananas', category: 'Produce', why: 'Portable fuel with its own wrapper.' },
};

// Per-goal templates. Each references PICKS by key — so a pick's specific name and
// reason are authored ONCE and stay consistent everywhere it appears.
const TEMPLATE_PICKS = {
  eating_cleaner: {
    intro: 'Built for eating cleaner. Whole foods first, ultra-processed left off.',
    picks: ['eggs', 'grass_fed_butter', 'chicken', 'greek_yogurt', 'sauerkraut', 'spinach', 'seasonal_veg', 'seasonal_fruit', 'sweet_potatoes', 'beans', 'evoo'],
  },
  high_protein: {
    intro: 'Set up high-protein. An anchor behind every meal.',
    picks: ['chicken_breast', 'ground_beef', 'eggs', 'greek_yogurt', 'cottage_cheese', 'canned_fish', 'beans', 'spinach', 'rice', 'sweet_potatoes', 'evoo'],
  },
  low_sugar: {
    intro: 'Built to keep added sugar down. Whole foods that satisfy without the spike.',
    picks: ['eggs', 'chicken', 'greek_yogurt', 'spinach', 'seasonal_veg', 'berries', 'almonds', 'avocado', 'steel_cut_oats', 'sweet_potatoes', 'evoo'],
  },
  family: {
    intro: 'Built for the whole house. Staples everyone eats, cleaner versions of the usual.',
    picks: ['chicken', 'eggs', 'milk', 'greek_yogurt', 'bananas_apples', 'seasonal_veg', 'rice', 'potatoes', 'steel_cut_oats', 'nut_butter', 'evoo'],
  },
  gut_health: {
    intro: 'Ferments first, then the fiber that feeds them.',
    picks: ['kefir', 'live_yogurt', 'sauerkraut', 'kimchi', 'miso', 'brined_pickles', 'lentils', 'steel_cut_oats', 'seasonal_fruit', 'spinach', 'garlic_onions', 'evoo'],
  },
  avoiding_junk: {
    intro: 'Built to sidestep the junk, stocked with the real version of what it replaces.',
    picks: ['chicken', 'eggs', 'grass_fed_butter', 'greek_yogurt', 'whole_fruit', 'spinach', 'seasonal_veg', 'potatoes', 'almonds', 'popcorn', 'steel_cut_oats', 'evoo'],
  },
  weight_loss: {
    // Carbs are not the enemy on a weight-loss list either — this is the template most
    // likely to quietly drop the starch, so it names one on purpose.
    intro: 'Protein and fiber up front. Real starches stay.',
    picks: ['chicken_breast', 'eggs', 'greek_yogurt', 'canned_fish', 'spinach', 'seasonal_veg', 'seasonal_fruit', 'beans', 'sweet_potatoes', 'steel_cut_oats', 'evoo'],
  },
  muscle_strength: {
    intro: 'Protein at every meal, real carbs to train on.',
    picks: ['chicken_breast', 'grass_fed_beef', 'eggs', 'greek_yogurt', 'cottage_cheese', 'canned_fish', 'rice', 'potatoes', 'steel_cut_oats', 'beans', 'evoo'],
  },
  pregnancy_postpartum: {
    intro: 'Nutrient-dense whole foods that keep well on hand.',
    picks: ['eggs', 'chicken', 'sardines', 'greek_yogurt', 'spinach', 'beans', 'seasonal_fruit', 'sweet_potatoes', 'steel_cut_oats', 'almonds', 'evoo'],
  },
  athlete_performance: {
    intro: 'Enough real carbs to fuel the work, protein to recover.',
    picks: ['chicken_breast', 'eggs', 'greek_yogurt', 'canned_fish', 'rice', 'potatoes', 'steel_cut_oats', 'bananas', 'spinach', 'beans', 'evoo'],
  },
  _default: {
    intro: 'A clean starting list. Say what the trip is for and it sharpens.',
    picks: ['chicken', 'eggs', 'spinach', 'seasonal_fruit', 'sweet_potatoes', 'steel_cut_oats', 'evoo'],
  },
};

/** Resolve a pick key → the full item object. Throws on an unknown key so a typo
 *  fails the test suite rather than silently dropping a row from someone's cart. */
function pick(key) {
  const p = PICKS[key];
  if (!p) throw new Error(`list.js: unknown pick "${key}"`);
  return { key, ...p };
}

// Templates, resolved to concrete items at module load. Shape is unchanged from the
// pre-Block-V structure ({ intro, items:[{name, category, tags}] }) plus the new
// why / perimeterId / alt / variants fields, so blendTemplates and every existing
// consumer keep working untouched.
const GOAL_TEMPLATES = Object.fromEntries(
  Object.entries(TEMPLATE_PICKS).map(([goal, t]) => [goal, { intro: t.intro, items: t.picks.map(pick) }])
);

export { PICKS, GOAL_TEMPLATES };


// Constraints that swap in a DIFFERENT specific pick, in priority order — the first
// active one wins, so "budget + short on time" resolves deterministically rather than
// flickering between two variants.
const VARIANT_PRIORITY = ['no_kitchen', 'short_on_time', 'budget', 'picky_kids', 'cooking_for_one'];

/** PREMIUM: let an active constraint choose the specific pick. Free lists keep the
 *  base pick — still specific, still reasoned, just not circumstance-tuned. */
function applyVariants(items, constraints, premium) {
  if (!premium || !constraints?.length) return items;
  const active = new Set(constraints.map((c) => String(c).toLowerCase()));
  const order = VARIANT_PRIORITY.filter((c) => active.has(c));
  if (!order.length) return items;
  const tuned = items.map((it) => {
    if (!it.variants) return it;
    const hit = order.find((c) => it.variants[c]);
    if (!hit) return it;
    // Drop the base `alt` unless the variant brings its own — the base alternative was
    // written against the base pick and contradicts the substitute ("Dried beans …
    // Or dried, if you're planning ahead"). A stale alt reads as Kristy arguing with
    // her own decision.
    const { alt: _baseAlt, ...rest } = it;
    return { ...rest, ...it.variants[hit], constraintTuned: hit };
  });

  // Substitution is many-to-one, so it can COLLAPSE two distinct picks onto the same
  // product — chicken breast and bone-in thighs both become "Rotisserie chicken" under
  // short_on_time, and the cart shows it twice. The blend deduped the base items, but
  // that ran before these substitutions existed, so the only place to catch it is here.
  const seen = new Set();
  return tuned.filter((it) => {
    const key = canonicalItem(it.name);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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

// Apply every conditional rename whose hard line is active, in place. A rename that
// changes WHAT to buy also replaces the reason — a stale why under a new name would
// read as Kristy explaining a decision she didn't make.
function applyConditionalRenames(items, nonNegotiables) {
  const active = new Set((nonNegotiables || []).map((v) => String(v).toLowerCase()));
  const rules = CONDITIONAL_RENAMES.filter((r) => active.has(r.line));
  if (!rules.length) return items;
  return items.map((it) => {
    const hit = rules.find((r) => r.match.test(it.name));
    return hit ? { ...it, name: hit.to, ...(hit.why ? { why: hit.why } : {}) } : it;
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

// The clause Kristy adds to the list intro when a constraint is active, in her voice
// (reads after "Kept it "). Names the constraint plainly — never a price.
const CONSTRAINT_INTRO = {
  budget: 'easy on the receipt',
  short_on_time: 'fast — little to no cooking',
  picky_kids: 'kid-friendly',
  no_kitchen: 'no-cook wherever possible',
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
      why: 'Scanned last trip, and there’s a better pick. Open it for one.',
      productName: s.product_name,
    }));
}

function resolveTemplate(goal) {
  return GOAL_TEMPLATES[goal] || GOAL_TEMPLATES[LEGACY_TEMPLATE_ALIASES[goal]] || null;
}

// Normalize an item name so NEAR-identical items collapse to one — qualifier-only
// differences ("Plain Greek yogurt" ≈ "Greek yogurt") and clarifying clauses.
// LONGEST FIRST. Alternation is first-match-wins, so a bare `whole` listed ahead of
// `whole-milk` consumed the first half and left "-milk" behind — "Plain whole-milk
// Greek yogurt" canonicalized to "milk greek yogurt" and stopped matching "Greek
// yogurt". Dedup silently let the near-duplicate through. Same ordering rule the
// ingredient KB's alias collisions already follow.
const ITEM_QUALIFIERS =
  /\b(plain|lean|whole-milk|whole|fresh|frozen|canned|dried|raw|steel-cut|non-starchy|unsalted|real|pre-washed|rotisserie|low-fat|nonfat|organic|skinless|boneless)\b/g;
export function canonicalItem(name) {
  return String(name)
    .toLowerCase()
    .split('—')[0]
    .replace(/\([^)]*\)/g, ' ')
    .replace(ITEM_QUALIFIERS, ' ')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Kristy's blended-list intro — names the goals in her voice and calls out that the
// list leans on the overlap, so the merge reads as coaching, not a silent union.
function blendIntro(goals) {
  const labels = goals.map((g) => labelForGoal(g) || g).filter(Boolean).map((s) => s.toLowerCase());
  const joined = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}` : labels[0];
  const lean = labels.length === 2 ? 'what does both' : 'what does the most at once';
  return `Built for ${joined} — leaning on ${lean}.`;
}

// Blend goal templates into ONE list. Goals are a set with NO primary — items are
// ranked by OVERLAP (how many active goals want them) so shared anchors lead, then
// each goal's unique items round-robin in (no goal dominates the tail). Near-
// identical items collapse to one. Capped so five goals don't wall off 40 items.
function blendTemplates(goals) {
  const resolved = (goals || []).map(resolveTemplate).filter(Boolean);
  if (resolved.length === 0) return { items: [...GOAL_TEMPLATES._default.items], intro: GOAL_TEMPLATES._default.intro };
  if (resolved.length === 1) return { items: [...resolved[0].items], intro: resolved[0].intro };

  const CAP = 18;
  // Count overlap by canonical key; keep the cleanest representative item per key.
  const byKey = new Map();
  const perGoalKeys = resolved.map((t) => {
    const keys = [];
    const local = new Set();
    for (const it of t.items) {
      const key = canonicalItem(it.name);
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
    const key = canonicalItem(it.name);
    if (placed.has(key) || items.length >= CAP) return;
    placed.add(key);
    items.push(it);
  };

  // 1) Overlap first — items wanted by >=2 goals, most-shared leading. No primary.
  [...byKey.values()]
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count)
    .forEach((g) => push(g.item));

  // 2) Then each goal's unique items, round-robin so none dominates the tail.
  const perGoalUnique = perGoalKeys.map((keys) =>
    keys.filter((k) => byKey.get(k).count === 1).map((k) => byKey.get(k).item)
  );
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

  return { items, intro: blendIntro(goals) };
}

/**
 * Generate the list. FREE (premium=false): the goal template minus hard-line tags,
 * with removed items suppressed. PREMIUM: additionally folds in focus-relevant items
 * and prepends the Haul's swap reminders. `premium` is decided by the route from the
 * DB — the gated branches never run for a non-premium caller, so the capability can't
 * be tampered into existence.
 */
export function generateList({ goal, goals, nonNegotiables = [], focuses = [], constraints = [], nextList = [], signals = {}, premium = false }) {
  const goalList = (Array.isArray(goals) && goals.length ? goals : goal ? [goal] : []).filter(Boolean);
  const tpl = blendTemplates(goalList);

  const excluded = new Set();
  for (const nn of nonNegotiables || [])
    (EXCLUDE_TAGS[String(nn).toLowerCase()] || []).forEach((t) => excluded.add(t));
  const removed = new Set((signals.removed || []).map((s) => String(s).toLowerCase()));
  // A swap they turned down is a preference learned. Suppressing the OFFER but still
  // generating the item is the same suggestion arriving by a side door, and it reads
  // as an app that did not listen.
  const declined = new Set(declinedItemNames(signals.declinedSwaps).map((n) => canonicalItem(n)));
  const itemTags = (it) => [...(it.tags || []), ...foodTags(it.name)];
  const blocked = (it) =>
    itemTags(it).some((t) => excluded.has(t)) ||
    removed.has(it.name.toLowerCase()) ||
    declined.has(canonicalItem(it.name));

  const base = tpl.items.filter((it) => !blocked(it));

  // PREMIUM — focuses AND constraints shape the list. Append their anchor items where
  // they clear the same filters and aren't already present (dedup by name). Free lists
  // ignore both entirely. Constraints come after focuses so a health watch leads.
  //
  // CAPPED, because a nudge that arrives twelve items at a time is an overhaul. Four
  // focuses used to pull in everything each one anchors on, and the cart that came
  // back was Kristy's ideal rather than a list leaning her way. Nobody hits their
  // goals in one haul; a list that quietly gets a little better each week is the
  // point, and a list that reads as imposed is the thing that gets deleted.
  const MARGINAL_CAP = 4;
  const present = new Set(base.map((it) => it.name.toLowerCase()));
  const extra = [];
  if (premium) {
    const pull = (table, keys) => {
      for (const k of keys || []) {
        for (const it of table[k] || []) {
          if (extra.length >= MARGINAL_CAP) return;
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

  // PREMIUM: a constraint chooses the SPECIFIC pick (budget buys the whole chicken,
  // short-on-time buys the rotisserie). Runs before the renames so a hard line still
  // gets the last word on what lands in the cart.
  const tuned = applyVariants([...base, ...extra], constraints, premium);

  const items = applyConditionalRenames(tuned, nonNegotiables).map((it) => ({
    id: rid(),
    name: it.name,
    category: it.category,
    checked: false,
    source: 'template',
    // The coaching, carried on the row itself — always visible, never behind a tap.
    ...(it.why ? { why: it.why } : {}),
    // Where her judgment on this pick comes from. The client reads the entry from the
    // FREE perimeter endpoint on expand — KB text, no model call, works untiered.
    ...(it.perimeterId ? { perimeterId: it.perimeterId } : {}),
    ...(it.alt ? { alt: it.alt } : {}),
  }));

  // PREMIUM — the Haul's flagged items ride in front as swap reminders.
  const swaps = premium ? swapItems(nextList) : [];

  // The intro names active constraints in Kristy's voice (premium only — free lists
  // don't act on constraints, so they don't claim to).
  const intro = tpl.intro + (premium ? constraintClause(constraints) : '');

  return { goal: goalList[0] || null, goals: goalList, intro, items: [...swaps, ...items] };
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

/* ═══════════ Authored reasoning for a conversationally-built cart ═══════════
   The cart is chat-first now: the shopper names what they're getting and the model
   proposes the grocery names. That model is allowed to emit NAMES ONLY — a free-form
   reason from it would be exactly the unbounded claim the whole engine exists to
   prevent.

   But a row without a reason is a checkbox, and the reason IS the coaching. So the
   reasons are looked up, not generated: a composed item that resolves to a known pick
   inherits that pick's AUTHORED `why` (and its perimeter entry), which is copy that
   already passed the claim-safety tripwire in list.test.js. Anything with no matching
   pick simply carries no reason — an honest blank beats an invented line. */
const PICK_BY_CANONICAL = (() => {
  const map = new Map();
  for (const [key, p] of Object.entries(PICKS)) {
    const c = canonicalItem(p.name);
    // First pick wins, so the earliest-declared (most general) entry is the one a
    // loosely-matching name resolves to.
    if (c && !map.has(c)) map.set(c, { key, ...p });
  }
  return map;
})();

/** The authored pick a composed item name resolves to, or null. */
export function pickForName(name) {
  const c = canonicalItem(name);
  if (!c) return null;
  if (PICK_BY_CANONICAL.has(c)) return PICK_BY_CANONICAL.get(c);

  // One direction only: the composed name may be MORE specific than the pick, never
  // less. "Bone-in chicken thighs" resolves to "Chicken thighs, bone-in"; a bare "beef"
  // must NOT inherit the grass-fed row's reasoning, because the shopper's own words
  // never made that claim. A missing reason is honest; a borrowed one is not.
  //
  // Matched on the TOKEN SET rather than substring, because the same item is written in
  // either order ("bone-in chicken thighs" / "chicken thighs, bone-in") and a substring
  // test silently misses one of them. Two-token minimum, so no single common word can
  // pull in a pick on its own.
  const tokens = new Set(c.split(' ').filter(Boolean));
  for (const [key, p] of PICK_BY_CANONICAL) {
    const kt = key.split(' ').filter(Boolean);
    if (kt.length >= 2 && kt.every((w) => tokens.has(w))) return p;
  }
  return null;
}

/** Attach authored why / perimeterId / alt to composed rows that resolve to a pick. */
export function annotateFromPicks(items) {
  return (Array.isArray(items) ? items : []).map((it) => {
    if (it.why) return it; // already reasoned (a template row) — leave it alone
    const p = pickForName(it.name);
    if (!p) return it;
    return {
      ...it,
      ...(p.why ? { why: p.why } : {}),
      ...(p.perimeterId ? { perimeterId: p.perimeterId } : {}),
      ...(p.alt ? { alt: p.alt } : {}),
    };
  });
}

/**
 * A stable signature of the generation inputs. The route regenerates a stored list
 * when this changes (goal / hard lines / focuses / constraints edited), so a goal
 * switch refreshes the list without a manual "Rebuild".
 */
export function listSignature({ goal = null, goals = null, nonNegotiables = [], focuses = [], constraints = [] } = {}) {
  const goalList = (Array.isArray(goals) && goals.length ? goals : goal ? [goal] : []).filter(Boolean);
  const norm = (a) => [...(a || [])].map((x) => String(x).toLowerCase()).sort();
  return JSON.stringify({
    goals: norm(goalList),
    hl: norm(nonNegotiables),
    f: norm(focuses),
    c: norm(constraints),
  });
}
