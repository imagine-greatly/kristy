// Kristy's education layer — the contextual "Kristy-isms". A small library loaded
// once; a product surfaces AT MOST ONE ism, matched to the highest-priority trigger
// present on it (empty/loading/haul rotate the ambient ones). Fixed editorial copy,
// so no claim-lock risk: nothing here is model-generated or a per-product claim.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDU = JSON.parse(readFileSync(join(__dirname, '..', 'kristy_education.json'), 'utf8'));

export const ISMS = EDU.isms;
export const AMBIENT = EDU.isms.filter((i) => i.trigger.type === 'ambient');
// Contextual (non-ambient) isms, highest priority first — first match wins.
const CARD = EDU.isms.filter((i) => i.trigger.type !== 'ambient').sort((a, b) => b.priority - a.priority);

function matches(trigger, ctx) {
  switch (trigger.type) {
    case 'category':
      return ctx.categories.has(trigger.value);
    case 'ingredient':
      return ctx.matchedIds.has(trigger.value);
    case 'any_of':
      return trigger.value.some((id) => ctx.matchedIds.has(id));
    case 'verdict':
      return ctx.tier === trigger.value;
    case 'ingredient_count_over':
      return ctx.ingredientCount > trigger.value;
    case 'focus_active':
      return ctx.focuses.has(trigger.value);
    case 'long_additive':
      return !!ctx.longAdditive;
    default:
      return false;
  }
}

/**
 * The single contextual ism for a verdict card — highest-priority matching
 * trigger, or null if none apply.
 * @param {{ categories:Set, matchedIds:Set, tier:string, ingredientCount:number, focuses:Set, longAdditive:boolean }} ctx
 * @returns {{ id:string, text:string } | null}
 */
export function selectCardIsm(ctx) {
  for (const ism of CARD) {
    if (matches(ism.trigger, ctx)) return { id: ism.id, text: ism.text };
  }
  return null;
}

// Build the selection context from a verdict evaluation. `matched` are the FULL KB
// entries (with category); `ingredients` is the raw string for the count.
export function ismContext({ matched = [], tier, ingredientCount = 0, focuses = [] }) {
  return {
    categories: new Set(matched.map((e) => e.category).filter(Boolean)),
    matchedIds: new Set(matched.map((e) => e.id)),
    tier,
    ingredientCount,
    focuses: new Set(focuses),
    // "Unpronounceable" = a genuinely long additive word (keeps maltodextrin, ~12
    // chars, on the sugar-names ism rather than stealing it for pronounce).
    longAdditive: matched.some((e) => String(e.name || '').split(/\s+/).some((w) => w.length >= 15)),
  };
}
