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
/* `AMBIENT` was exported here and imported by NOTHING. It filtered the three ambient
   pull-quotes out of kristy_education.json for a server surface that was never built:
   the lines that shipped came from the frozen `client/src/lib/education.js`, and iOS
   renders none of them. An export with no consumer is the shape `labelVerdict.test.js`
   warns about — it reads as a wired feature to anyone who greps for it, which is how the
   three ambient entries in the JSON came to be treated as the source of record for
   something no route serves.
   ⚠️ THE THREE JSON ENTRIES STAY. Two of them are shipped lint failures (CLAUDE.md, Open
   items) and the record of that is worth more than the tidiness of deleting them; nothing
   reads them now, so they cost nothing. */
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
  // ⚠️ **NOTHING SAYS THIS IS FOOD, SO SHE SAYS NOTHING ABOUT IT.**
  //
  // Every ism in the file is a claim about FOOD — "That color isn't food", "If you can't
  // pronounce it, your body probably can't either", "A few ingredients, all real. This is
  // what food used to look like." Applied to a bottle of detergent, each of them is the same
  // error the seal was, in prose. `clean_label` is the one that shipped: it rendered live
  // under an approved Dawn Powerwash, about dipropylene glycol butyl ether.
  //
  // **Suppressed HERE rather than at the four call sites**, which is the whole reason this
  // is one function: routes/verdict.js selects an ism in four places (authed no-goal, authed
  // gated, authed full, guest), and a rule enforced at call sites is a rule that holds until
  // somebody adds a fifth. Same argument as the one read meter.
  //
  // It returns null rather than a substitute ism. The withheld read (`unverifiedRead`)
  // already says the one honest thing there is to say, and a second sentence beside it
  // would be filling the silence that IS the answer.
  if (ctx?.unverifiedAsFood) return null;

  for (const ism of CARD) {
    if (matches(ism.trigger, ctx)) return { id: ism.id, text: ism.text };
  }
  return null;
}

// Build the selection context from a verdict evaluation. `matched` are the FULL KB
// entries (with category); `ingredients` is the raw string for the count.
export function ismContext({ matched = [], tier, ingredientCount = 0, focuses = [], unverifiedAsFood = false }) {
  return {
    categories: new Set(matched.map((e) => e.category).filter(Boolean)),
    matchedIds: new Set(matched.map((e) => e.id)),
    tier,
    // Carried straight through from the engine rather than recomputed. Two places deciding
    // what counts as unverified is two answers, and the one that renders copy would be the
    // one nobody tested.
    unverifiedAsFood,
    ingredientCount,
    focuses: new Set(focuses),
    // "Unpronounceable" = a genuinely long additive word (keeps maltodextrin, ~12
    // chars, on the sugar-names ism rather than stealing it for pronounce).
    longAdditive: matched.some((e) => String(e.name || '').split(/\s+/).some((w) => w.length >= 15)),
  };
}
