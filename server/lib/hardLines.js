// Hard lines — the user's declared absolutes ("no carrageenan"), matched
// LITERALLY against the label.
//
// Until now non-negotiables were only ever handed to the model in the note
// prompt, so nothing deterministic enforced them: a product could carry seed oils
// and still come back approved for someone who had declared "no seed oils". This
// module makes them structural. A hard line is a string match against KB entries
// the user already selected, so it introduces ZERO new health claims — it can only
// name an ingredient the KB already carries and a rule the user already set. That
// is what makes it claim-lock-safe by construction.
//
// Honesty boundary: only lines we can actually verify from the KB get matched.
// The KB is an additive database — it holds no gluten or dairy data — so
// `gluten-free` and `dairy-free` stay ADVISORY (passed to the note as context,
// never "enforced"). Claiming to check something we cannot check would be the
// same failure as fabricating a concern.

import { readFileSync } from 'node:fs';

const kb = JSON.parse(readFileSync(new URL('../kristy_ingredient_knowledge_base.json', import.meta.url)));

const CUSTOM_PREFIX = 'kb:'; // a user-picked KB ingredient, e.g. "kb:carrageenan"

// Preset hard line -> the KB entries that violate it. `categories` selects every
// entry in that category so the rule keeps working as the KB grows.
export const HARD_LINE_RULES = {
  'no seed oils': { label: 'no seed oils', categories: ['seed_oil'] },
  'no artificial sweeteners': { label: 'no artificial sweeteners', categories: ['artificial_sweetener'] },
  'no artificial dyes': { label: 'no artificial dyes', categories: ['artificial_dye'] },
  'no hfcs': { label: 'no HFCS', ids: ['high_fructose_corn_syrup'] },
  'no carrageenan': { label: 'no carrageenan', ids: ['carrageenan'] },
  'no added nitrites': {
    label: 'no added nitrites',
    ids: ['sodium_nitrite', 'sodium_nitrate', 'potassium_nitrite'],
  },
  'no palm oil': { label: 'no palm oil', ids: ['refined_palm_oil'] },
  // Insect-derived carmine is the only animal-sourced entry the KB carries, so
  // that is the extent of what these two can honestly check.
  vegetarian: { label: 'vegetarian', ids: ['carmine'] },
  vegan: { label: 'vegan', ids: ['carmine'] },
  // Advisory only — no KB coverage, so no matcher. Still reaches the note.
  'dairy-free': { label: 'dairy-free', advisory: true },
  'gluten-free': { label: 'gluten-free', advisory: true },
};

const byId = new Map(kb.ingredients.map((e) => [e.id, e]));

/** Resolve a declared hard line to the set of KB ids that violate it. */
function idsFor(rule) {
  const ids = new Set(rule.ids || []);
  for (const cat of rule.categories || []) {
    for (const e of kb.ingredients) if (e.category === cat) ids.add(e.id);
  }
  return ids;
}

/**
 * Normalize the user's declared hard lines into matchable rules.
 * Accepts preset values and custom `kb:<ingredient_id>` values alike; unknown
 * strings are kept as advisory so they still reach the note as context.
 */
export function resolveHardLines(values = []) {
  const out = [];
  for (const raw of Array.isArray(values) ? values : []) {
    const value = String(raw ?? '').trim();
    if (!value) continue;

    if (value.toLowerCase().startsWith(CUSTOM_PREFIX)) {
      const id = value.slice(CUSTOM_PREFIX.length);
      const entry = byId.get(id);
      if (!entry) continue; // a custom line can only ever name a real KB entry
      out.push({ value, label: `no ${entry.name.toLowerCase()}`, ids: new Set([id]), custom: true });
      continue;
    }

    const rule = HARD_LINE_RULES[value.toLowerCase()];
    if (!rule) {
      out.push({ value, label: value, ids: new Set(), advisory: true });
      continue;
    }
    out.push({
      value,
      label: rule.label,
      ids: rule.advisory ? new Set() : idsFor(rule),
      advisory: !!rule.advisory,
    });
  }
  return out;
}

/**
 * Which declared hard lines does this label actually violate?
 * `matched` is the engine's matched KB entries, so every name we surface is one
 * the KB already produced for this product.
 * @returns {{ value, label, names: string[] }[]}
 */
export function matchHardLines(matched = [], declared = []) {
  const rules = resolveHardLines(declared);
  const hits = [];
  for (const rule of rules) {
    if (rule.ids.size === 0) continue; // advisory lines never claim a match
    const names = matched.filter((e) => rule.ids.has(e.id)).map((e) => e.name);
    if (names.length) hits.push({ value: rule.value, label: rule.label, names });
  }
  return hits;
}

/** The KB ids a set of declared hard lines covers — used to surface them first. */
export function hardLineIds(declared = []) {
  const ids = new Set();
  for (const rule of resolveHardLines(declared)) for (const id of rule.ids) ids.add(id);
  return ids;
}

/** Public search over KB names + aliases, for the custom-hard-line picker. */
export function searchIngredients(query, limit = 8) {
  const q = String(query ?? '').trim().toLowerCase();
  if (q.length < 2) return [];
  const scored = [];
  for (const e of kb.ingredients) {
    // Affirming entries are not selectable as a hard line. Hard lines are matched
    // against the engine's CONCERN list, which an affirmation never enters — so
    // "no raw honey" would sit in the user's settings and silently never fire.
    // Better to not offer it than to offer a line that can't hold.
    if (e.polarity === 'affirming') continue;
    const hay = [e.name, ...(e.aliases || [])];
    let best = -1;
    for (const h of hay) {
      const i = h.toLowerCase().indexOf(q);
      if (i < 0) continue;
      // prefer a name hit over an alias hit, and a prefix over a mid-string hit
      const score = (h === e.name ? 0 : 10) + (i === 0 ? 0 : 5) + i;
      if (best < 0 || score < best) best = score;
    }
    if (best >= 0) scored.push({ e, best });
  }
  return scored
    .sort((a, b) => a.best - b.best || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map(({ e }) => ({
      id: e.id,
      value: `${CUSTOM_PREFIX}${e.id}`,
      name: e.name,
      aliases: e.aliases || [],
      severity: e.severity,
    }));
}
