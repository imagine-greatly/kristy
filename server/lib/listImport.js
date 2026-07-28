// Import a shopper's OWN list and hand it back specified.
//
// Someone arrives with a list they already wrote — on paper, in their notes app —
// and the value we add is turning "milk, eggs, butter, bread" into the specific
// things to actually lift off the shelf, read through their goal and their lines.
//
// THE AUTONOMY RULE, which everything here is shaped by: this is THEIR list. We
// enhance, we never police.
//   • Nothing they wrote is ever deleted. Not a flagged item, not one that clashes
//     with a line they declared. The most we do is attach a swap OFFER.
//   • A GENERIC gets upgraded ("milk" → "Whole milk"), because that's helping them
//     get what they already meant.
//   • A SPECIFIC choice is left exactly alone. If they wrote "Fairlife 2%", they
//     decided that; replacing it would be overriding a person, not coaching them.
//   • An item we can't read stays as written and is marked for them to fix. Guessing
//     a word on someone's grocery list is how you go home with the wrong thing.
//
// CLAIM LOCK: specification here is DETERMINISTIC — a raw word maps to an existing
// PICK, and the PICK's `why` was authored under the same claim lock as every other
// row. No model writes a reason on this path, so no new claim can enter through it.
// Vision only ever transcribes (see listVision.js); it never judges.

import { PICKS, foodTags } from './list.js';
import { resolveHardLines } from './hardLines.js';
import { matchIngredients } from './verdictEngine.js';

/* ── 1. Raw text → item strings ────────────────────────────────────────────────
   People write lists every which way: one per line, comma-separated, bulleted,
   numbered, with quantities. Parsing is deliberately dumb and deterministic. */

const BULLET = /^[\s]*(?:[-*•·–—]|\d+[.)])\s*/;
// Leading quantity + unit: "2 lbs chicken", "1 dozen eggs", "3x milk".
const QUANTITY = /^\s*\d+(?:[.,]\d+)?\s*(?:x\b|lbs?\b|pounds?\b|oz\b|ounces?\b|kg\b|g\b|gal(?:lons?)?\b|qt\b|pt\b|l\b|ml\b|dozen\b|doz\b|pack(?:s|ets)?\b|bunch(?:es)?\b|cans?\b|jars?\b|boxes?\b|bags?\b|bottles?\b)?\s*/i;

const MAX_ITEMS = 60;

export function parseListText(text) {
  const raw = String(text ?? '');
  if (!raw.trim()) return [];

  // Newlines first; only fall back to commas when the input is clearly one line —
  // splitting "chicken, bone-in" on the comma would shred a specific choice.
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const pieces = lines.length > 1 ? lines : lines.flatMap((l) => l.split(/[,;]/));

  const seen = new Set();
  const out = [];
  for (const piece of pieces) {
    const cleaned = piece.replace(BULLET, '').replace(QUANTITY, '').trim().replace(/\s+/g, ' ');
    if (!cleaned) continue;
    if (cleaned.length > 80) continue; // a sentence, not a grocery item
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

/* ── 2. Generic → the PICK that specifies it ───────────────────────────────────
   Only BARE generics map. "milk" upgrades; "Fairlife 2% milk" does not, because the
   shopper already made that call. isGeneric() is what enforces the difference. */

const GENERIC_TO_PICK = {
  milk: 'milk', 'whole milk': 'milk',
  eggs: 'eggs', egg: 'eggs',
  butter: 'grass_fed_butter',
  ghee: 'ghee',
  yogurt: 'greek_yogurt', 'greek yogurt': 'greek_yogurt',
  kefir: 'kefir',
  'cottage cheese': 'cottage_cheese',
  sauerkraut: 'sauerkraut', kraut: 'sauerkraut',
  kimchi: 'kimchi',
  miso: 'miso',
  kombucha: 'kombucha',
  pickles: 'brined_pickles',
  chicken: 'chicken', 'chicken breast': 'chicken_breast', 'chicken thighs': 'chicken',
  beef: 'grass_fed_beef', 'ground beef': 'grass_fed_beef', mince: 'grass_fed_beef',
  liver: 'liver',
  salmon: 'salmon',
  tuna: 'canned_fish',
  sardines: 'sardines',
  broth: 'bone_broth', stock: 'bone_broth', 'chicken broth': 'bone_broth',
  bread: 'sprouted_grain',
  oats: 'steel_cut_oats', oatmeal: 'steel_cut_oats',
  rice: 'rice',
  beans: 'beans',
  lentils: 'lentils',
  // "oil" alone is generic. "vegetable oil" and "canola" are NOT — that's a choice,
  // and swapping it silently would be overriding the shopper. Those fall through to
  // the verbatim path, where a line they declared turns it into an OFFER instead.
  'olive oil': 'evoo', oil: 'evoo',
  almonds: 'almonds', nuts: 'almonds',
  'peanut butter': 'nut_butter', 'nut butter': 'nut_butter',
  popcorn: 'popcorn',
  spinach: 'spinach', greens: 'spinach', lettuce: 'spinach',
  berries: 'berries',
  avocado: 'avocado', avocados: 'avocado',
  potatoes: 'potatoes', potato: 'potatoes',
  'sweet potatoes': 'sweet_potatoes', 'sweet potato': 'sweet_potatoes',
  bananas: 'bananas', banana: 'bananas',
  apples: 'bananas_apples',
  fruit: 'whole_fruit',
  vegetables: 'seasonal_veg', veg: 'seasonal_veg', veggies: 'seasonal_veg',
  'frozen vegetables': 'frozen_veg',
  garlic: 'garlic_onions', onions: 'garlic_onions',
  cheese: 'cheese_sticks',
  flax: 'chia_flax', chia: 'chia_flax',
};

const normalize = (s) =>
  String(s).toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

// A bare generic is the mapped word and nothing else. Any extra word is the shopper
// being specific ("almond milk", "oat milk", "Fairlife milk") and is left alone.
function genericPickKey(rawName) {
  const n = normalize(rawName);
  if (!n) return null;
  if (GENERIC_TO_PICK[n]) return GENERIC_TO_PICK[n];
  const singular = n.replace(/s$/, '');
  if (GENERIC_TO_PICK[singular]) return GENERIC_TO_PICK[singular];
  return null;
}

/* ── 3. Hard lines: offer, never delete ───────────────────────────────────────
   Everywhere else a hard line REMOVES an item, because Kristy chose that item. Here
   the shopper chose it, so the line becomes an offer instead. */

// The champion to suggest when a line rules out the obvious specification.
const LINE_SAFE_ALTERNATIVE = {
  'gluten-free': { bread: 'Gluten-free bread', pasta: 'Gluten-free pasta' },
  'dairy-free': { milk: 'Unsweetened almond or oat milk', yogurt: 'Coconut yogurt', butter: 'Olive oil' },
  vegan: { milk: 'Unsweetened almond or oat milk', yogurt: 'Coconut yogurt', butter: 'Olive oil' },
  vegetarian: {},
};

function violatesLines(name, excludedTags, pickTags) {
  const tags = new Set([...(pickTags || []), ...foodTags(name)]);
  return [...tags].some((t) => excludedTags.has(t));
}

const EXCLUDE_TAGS = {
  'dairy-free': ['dairy'],
  vegetarian: ['meat', 'fish'],
  vegan: ['meat', 'fish', 'egg', 'dairy'],
  'gluten-free': ['gluten'],
};

/* ── 4. Specify the whole list ────────────────────────────────────────────────── */

/**
 * Turn raw item strings into cart items, specified through the shopper's lens.
 * Returns { items, specified, kept, offers } — counts drive Kristy's summary line.
 */
export function specifyImportedItems(rawItems, prefs = {}) {
  const { nonNegotiables = [], constraints = [], premium = false } = prefs;

  const declared = (nonNegotiables || []).map((v) => String(v).toLowerCase());
  const excludedTags = new Set();
  for (const line of declared) for (const t of EXCLUDE_TAGS[line] || []) excludedTags.add(t);

  const resolved = resolveHardLines(nonNegotiables);
  const lineIds = new Set();
  for (const r of resolved) for (const id of r.ids) lineIds.add(id);

  const activeConstraints = premium ? (constraints || []).map((c) => String(c).toLowerCase()) : [];

  const items = [];
  let specified = 0;
  const offers = [];

  for (const raw of rawItems) {
    // An item vision couldn't read: keep the shopper's own text, flag for a fix,
    // and never guess at it.
    if (typeof raw === 'object' && raw?.unreadable) {
      items.push({
        name: raw.text || 'Unreadable item',
        category: 'Pantry',
        source: 'imported',
        needsFix: true,
        note: "Couldn't read this one — tap to fix it.",
      });
      continue;
    }

    const name = typeof raw === 'object' ? String(raw.text || '') : String(raw || '');
    if (!name.trim()) continue;

    const key = genericPickKey(name);
    const pick = key ? PICKS[key] : null;

    // Not a bare generic (or nothing to map it to) → their words, verbatim.
    if (!pick) {
      const item = { name: name.trim(), category: 'Pantry', source: 'imported' };
      attachOfferIfClashes(item, name, lineIds, resolved, offers);
      items.push(item);
      continue;
    }

    // A constraint can pick a different specific — same rule the built cart uses.
    let chosen = { name: pick.name, why: pick.why, alt: pick.alt, category: pick.category, perimeterId: pick.perimeterId };
    for (const c of activeConstraints) {
      if (pick.variants?.[c]) {
        chosen = { ...chosen, ...pick.variants[c], alt: pick.variants[c].alt };
        break;
      }
    }

    // Their line rules out the specification we'd have chosen. We do NOT drop the
    // item — we look for a version that satisfies the line, and failing that we keep
    // what they wrote and say why.
    if (violatesLines(chosen.name, excludedTags, pick.tags)) {
      const alternative = findLineSafeAlternative(name, declared);
      if (alternative) {
        items.push({
          name: alternative,
          category: chosen.category || 'Pantry',
          source: 'imported',
          specifiedFrom: name.trim(),
        });
        specified += 1;
      } else {
        const item = { name: name.trim(), category: 'Pantry', source: 'imported' };
        item.swapOffer = `Your line is ${declared[0]}. This one is yours to call.`;
        offers.push(name.trim());
        items.push(item);
      }
      continue;
    }

    items.push({
      name: chosen.name,
      category: chosen.category || 'Pantry',
      source: 'imported',
      ...(chosen.why ? { why: chosen.why } : {}),
      ...(chosen.alt ? { alt: chosen.alt } : {}),
      ...(chosen.perimeterId ? { perimeterId: chosen.perimeterId } : {}),
      // What they wrote, kept on the row — so an upgrade is legible as an upgrade
      // and they can always see their own word.
      specifiedFrom: name.trim(),
    });
    specified += 1;
  }

  return { items, specified, kept: items.length - specified, offers };
}

function findLineSafeAlternative(rawName, declared) {
  const n = normalize(rawName);
  for (const line of declared) {
    const table = LINE_SAFE_ALTERNATIVE[line];
    if (!table) continue;
    for (const [generic, replacement] of Object.entries(table)) {
      if (n === generic || n === `${generic}s` || n.endsWith(` ${generic}`)) return replacement;
    }
  }
  return null;
}

// An item they wrote that matches a KB entry one of their OWN declared lines covers.
// Grounded in what they told us, never in an opinion about their food — which is what
// keeps this an offer rather than a lecture.
function attachOfferIfClashes(item, name, lineIds, resolved, offers) {
  if (!lineIds.size) return;
  let matched;
  try {
    ({ matched } = matchIngredients(name));
  } catch {
    return;
  }
  const hit = (matched || []).find((e) => lineIds.has(e.id));
  if (!hit) return;
  const rule = resolved.find((r) => r.ids.has(hit.id));
  item.swapOffer = `That's ${hit.name.toLowerCase()}. Your line: ${rule?.label || 'keep that out'}.`;
  offers.push(item.name);
}

/* ── 5. Kristy's line about what she did ──────────────────────────────────────
   "Kept your list, made it sharper" — never "fixed your choices". Egoless: it states
   what happened to the list, it doesn't narrate a service being performed. */
export function importSummary({ items, specified, offers }) {
  if (!items.length) return 'Nothing readable on that one. Try typing it out.';
  const parts = [`Kept all ${items.length} of your items`];
  if (specified) parts.push(`sharpened ${specified} of them into what to actually reach for`);
  const line = `${parts.join(', ')}.`;
  if (offers.length) {
    return `${line} A couple cross lines you set — they're still on there, swap only if you want to.`;
  }
  return line;
}
