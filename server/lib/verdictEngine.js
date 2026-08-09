// Kristy's Verdict — the KB-driven scoring engine. Pure, deterministic logic:
// no model, no network, no UI, no I/O beyond loading the knowledge base once at
// import. Given a parsed ingredient list it (1) matches each token against
// kristy_ingredient_knowledge_base.json, (2) scores a five-tier verdict, and
// (3) builds the factual "universal layer" straight from the KB.
//
// This is the foundation of the claim-sourcing lock: every health / ingredient
// claim the app can ever surface originates HERE, from a matched KB entry —
// never invented. Step 2's note composition may only rephrase what these
// functions return; it may not introduce a concern that isn't already in a
// matched entry.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { matchHardLines, hardLineIds } from './hardLines.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
// The KB lives at the SERVER root (deployed with the service, Root Directory =
// server) so it loads at runtime and never reaches the client bundle.
const KB_PATH = join(__dirname, '..', 'kristy_ingredient_knowledge_base.json');

/** The full knowledge base, loaded once. Exported so callers can read the
 *  rubric text, evidence-tier / severity descriptions, and approved_alternatives
 *  straight from the file rather than reimplementing them. */
export const kb = JSON.parse(readFileSync(KB_PATH, 'utf8'));

// ── Load-time integrity guards ───────────────────────────────────────────────
// Fail loudly if the KB drifts out from under the engine, rather than silently
// mis-scoring in production.
if (!Array.isArray(kb.ingredients) || kb.ingredients.length === 0) {
  throw new Error('verdictEngine: KB has no `ingredients` array');
}
// The scoring ladder's five tiers must exist as keys in the file's rubric.
export const TIERS = ['approved', 'approved_with_note', 'use_with_intention', 'swap_recommended', 'skip'];
for (const tier of TIERS) {
  if (!kb.kristy_scoring_rubric || !(tier in kb.kristy_scoring_rubric)) {
    throw new Error(`verdictEngine: rubric missing tier "${tier}"`);
  }
}

// Severity → concern rank. Higher wins. The mapping to tiers is the algorithm
// specified for this step; the tier NAMES and their prose come from the file.
const SEVERITY_RANK = { flag: 1, moderate: 2, high: 3, critical: 4 };

// ── Polarity ─────────────────────────────────────────────────────────────────
// The KB was flag-only: every entry was a concern, so `matched` WAS the flag
// list. `polarity: "affirming"` adds the other side — whole foods Kristy stands
// behind (the `time_tested` tier). Absent means "concern", so every pre-existing
// entry is untouched.
//
// Affirmations are held STRICTLY out of scoring. They never enter `matched`,
// never reach scoreVerdict/buildUniversalLayer/sanitizeFlagged, never satisfy or
// violate a hard line, and never lift a tier or restore a withheld seal. They
// are a separate, additive read. This is deliberate: an affirming entry has no
// severity, and every severity level in the KB is a CONCERN level — so letting
// one into `matched` would score it as a concern and cost a clean product its
// stamp. (Empirically: the mildest possible severity still yields
// approved_with_note, i.e. stamp: false.)
const isAffirming = (entry) => entry?.polarity === 'affirming';

// Affirmation is scoped to when the whole food IS the product, not when a
// processed product merely contains it. Ingredient lists run in descending order
// by weight, so "dominant" = first token, or a list short enough that the product
// essentially is that food. A granola bar listing honey fourth gets no badge.
const AFFIRM_MAX_LIST = 3;

// Don't affirm a flavoring that merely NAMES the whole food. "natural garlic
// flavor" is not garlic; "ginger extract" is not ginger. These would otherwise
// forward-match the bare alias and earn a badge for an industrial ingredient.
const AFFIRM_TOKEN_BLOCK = /\b(flavor|flavour|flavoring|flavouring|flavored|flavoured|extract|artificial|imitation)\b/;

// ── Normalization ────────────────────────────────────────────────────────────

const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[‘’]/g, "'") // curly → straight apostrophes
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

// Strip E-number / INS additive codes so "carrageenan (e407)" reads as
// "carrageenan" and a bare "e407" token doesn't masquerade as unmatched noise.
const stripCodes = (s) =>
  s
    .replace(/\be-?\s?\d{3,4}[a-z]?\b/gi, ' ') // E407, e-407, e 451i
    .replace(/\bins\s?\d{3,4}[a-z]?\b/gi, ' ') // INS 407
    .replace(/\s+/g, ' ')
    .trim();

// ── Oil-blend parentheticals ─────────────────────────────────────────────────
// A US label almost never writes "soybean oil" inside a blend. It writes a HEAD
// plus a parenthetical of bare sources:
//
//   "Vegetable oil (canola, soybean)"      "Shortening (palm, cottonseed)"
//
// Splitting on parentheses throws the head away, so "soybean" arrives as a bare
// token — and the KB keys that entry on "soybean oil". The result was that the most
// common way an American label declares a seed-oil blend matched NOTHING, which for
// a coach whose single loudest position is seed oils is the worst possible miss.
//
// Fixed by putting the head's noun back onto its own sub-items before tokenizing.
// This authors no claim and adds no KB entry: it makes an EXISTING entry reachable
// from the form the label actually prints.
//
// Scoped deliberately to a parenthetical whose HEAD is an oil/shortening/fat, so a
// bare "soybeans" in a tofu product is never read as soybean oil. That scoping is
// the whole reason this lives in the tokenizer instead of becoming a bare "soybean"
// alias — an alias has no way to know it was inside an oil blend.
const OIL_SOURCE =
  'canola|rapeseed|soybean|cottonseed|sunflower|safflower|corn|palm kernel|palm|peanut|grapeseed|rice bran|sesame|coconut|olive|avocado';
const OIL_BLEND = /\b(oils?|shortening|fats?)\s*\(([^)]*)\)/gi;

/** "vegetable oil (canola, soybean)" → "vegetable oil (canola oil, soybean oil)" */
export function expandOilBlends(text) {
  const source = new RegExp(`\\b(${OIL_SOURCE})\\b(?!\\s*(?:oil|kernel))`, 'gi');
  return String(text || '').replace(OIL_BLEND, (_whole, head, inner) => {
    return `${head} (${inner.replace(source, '$1 oil')})`;
  });
}

/** Split a raw ingredient string (or array) into normalized tokens. Per spec:
 *  lowercase, strip E-number formatting, split on commas and parentheses (plus
 *  the harmless siblings ; [ ]). Compound names like "canola oil" stay intact —
 *  we deliberately do NOT split on "and".
 *
 *  "and/or" IS a delimiter, though: it is a label-specific construction that only
 *  ever separates alternatives ("soybean and/or canola oil"), so splitting it can't
 *  break a compound name the way splitting bare "and" would ("salt and vinegar
 *  seasoning"). Without it the alternatives arrive fused into one token and only the
 *  first of the two oils could ever match. */
export function tokenizeIngredients(raw) {
  const text = Array.isArray(raw) ? raw.join(', ') : String(raw || '');
  return expandOilBlends(text)
    .split(/[,;()[\]]+|\band\s*\/\s*or\b/gi)
    .map((t) => stripCodes(norm(t)))
    .filter(Boolean);
}

// ── Match index ──────────────────────────────────────────────────────────────
// Flatten every entry's name + aliases into normalized match-strings, longest
// first so a specific multi-word name ("cane sugar") beats a bare word ("sugar")
// when both could match the same token.
const INDEX = [];
for (const entry of kb.ingredients) {
  const keys = [entry.name, ...(entry.aliases || [])].map(norm).filter(Boolean);
  for (const key of new Set(keys)) INDEX.push({ key, entry });
}
INDEX.sort((a, b) => b.key.length - a.key.length);

// ── Compound spelling ────────────────────────────────────────────────────────
// A label writes "modified cornstarch"; the KB writes "modified corn starch". One
// space, and the flag is missed — Great Value's oat cereal carries modified starch
// and earned a clean gold seal because of it, in the same run where Cheerios was
// FLAGGED for plain "Corn Starch" it does not contain.
//
// EXACT-ONLY, NEVER SUBSTRING. Comparing despaced strings throws word boundaries
// away, so `containsPhrase` cannot be run against them — "corn starch" would sit
// inside "popcornstarch". Equality is safe because it compares whole tokens to whole
// keys, which is what makes this an alternate spelling of stage 1 rather than a new,
// looser stage.
//
// Only multi-word keys are indexed: a single-word key already matches its own
// spelling exactly, and adding it here would just duplicate stage 1.
//
// Measured across all 343 keys: 2 collisions, and both are the alias collisions
// CLAUDE.md already documents as harmless (`partially hydrogenated soybean oil`,
// `bleached flour`). First-wins mirrors stage 1's behaviour on duplicate keys, so
// this introduces no new ambiguity.
const despace = (s) => s.replace(/[\s-]+/g, '');
const DESPACED = new Map();
for (const { key, entry } of INDEX) {
  if (!/[\s-]/.test(key)) continue;
  const d = despace(key);
  if (!DESPACED.has(d)) DESPACED.set(d, entry);
}

const isBoundary = (ch) => ch === undefined || !/[a-z0-9]/.test(ch);

// Does `needle` appear in `haystack` as a whole word/phrase? "sugar" matches
// "cane sugar" but not "sugarcane"; "soy" does not match "soybean".
function containsPhrase(haystack, needle) {
  let idx = haystack.indexOf(needle);
  while (idx !== -1) {
    if (isBoundary(haystack[idx - 1]) && isBoundary(haystack[idx + needle.length])) return true;
    idx = haystack.indexOf(needle, idx + 1);
  }
  return false;
}

// Resolve a normalized `token` to its best KB entry, by strict priority so that
// specificity — not string length — wins:
//   1. EXACT — token equals a name/alias. Always preferred (e.g. "vegetable oil"
//      is the Vegetable Oil entry, never the longer "partially hydrogenated
//      vegetable oil" alias of a critical entry).
//   1b. DESPACED EXACT — the same match under an alternate compound spelling
//      ("modified cornstarch" = "modified corn starch"). Still equality, so it is
//      a spelling of stage 1 and not a looser stage of its own.
//   2. FORWARD — the token CONTAINS a key as a whole phrase, i.e. the token
//      names this (sub)ingredient. Take the longest contained key (most
//      specific). INDEX is longest-first, so the first hit is the longest.
//
// ── REVERSE MATCHING IS GONE, AND ITS ABSENCE IS THE FIX ────────────────────
//
// There used to be a stage 3: a multi-word token sitting INSIDE a more specific
// alias resolved UP to it ("cane sugar" ⊂ "whole cane sugar"). Affirming entries
// were already excluded from it, on the grounds that bare "olive oil" must not
// become "extra virgin olive oil" and earn a badge the label never gave.
//
// THE CONCERN SIDE HAD NO SUCH GUARD, AND THERE IT INVENTS A CONCERN. Cheerios
// prints "Corn Starch"; the token resolved up to the alias "modified corn starch"
// and the card told a shopper the label "won't tell you the source grain or how it
// was modified". The label names the grain. That is a false claim about a real
// product, produced by the matcher rather than by the model — downstream of every
// guard the claim lock owns.
//
// The argument is exactly symmetric to the affirming one and the measurement backs
// it: over the 18 real products probed, stage attribution was EXACT 30, FORWARD 9,
// REVERSE 2 — and both reverse hits were the two false positives, with zero true
// positives anywhere in the sample. Reverse can only ever fire on a token that is
// NOT itself a KB key, which is precisely the case where there is no evidence for
// the escalation. The genuinely dangerous pairs ("corn syrup" ⊂ "high fructose corn
// syrup", "vegetable oil" ⊂ "partially hydrogenated vegetable oil") were never at
// risk because each is its own exact key and stage 1 already won.
//
// Excluding concerns as well as affirmations leaves the stage empty, so it is
// deleted rather than emptied. Don't flag what the label didn't say.
function bestMatch(token) {
  for (const { key, entry } of INDEX) if (token === key) return entry; // 1
  const compound = DESPACED.get(despace(token)); // 1b
  if (compound) return compound;
  for (const { key, entry } of INDEX) if (containsPhrase(token, key)) return entry; // 2
  return null;
}

/** matchIngredients — normalize + match a raw ingredient list against the KB.
 *  Returns the matched CONCERN entries (deduped, first-seen order), the affirmed
 *  whole-food entries, and the tokens that matched nothing.
 *
 *  `matched` remains concerns-only, exactly as before polarity existed — it IS
 *  the flag list downstream, and nothing that consumes it had to change.
 *  `affirmed` is additive and separate; see the polarity block above. */
export function matchIngredients(rawIngredientList) {
  const tokens = tokenizeIngredients(rawIngredientList);
  const matchedById = new Map();
  const affirmedById = new Map();
  const unmatched = [];

  tokens.forEach((token, index) => {
    const hit = bestMatch(token);
    if (!hit) {
      unmatched.push(token);
      return;
    }
    if (isAffirming(hit)) {
      // Dominant ingredient, or a list short enough that the product IS this
      // food. Anything else recognizes the token but withholds the badge.
      const dominant = index === 0 || tokens.length <= AFFIRM_MAX_LIST;
      if (dominant && !AFFIRM_TOKEN_BLOCK.test(token) && !affirmedById.has(hit.id)) {
        affirmedById.set(hit.id, hit);
      }
      return;
    }
    if (!matchedById.has(hit.id)) matchedById.set(hit.id, hit);
  });

  return {
    matched: [...matchedById.values()],
    affirmed: [...affirmedById.values()],
    unmatched,
  };
}

/** scoreVerdict — map matched (flagged) entries to one of the five KB tiers.
 *  Ladder (severity-max): a single `critical` → skip; one or more `high` →
 *  swap_recommended; one or more `moderate` → use_with_intention; only
 *  low-concern `flag` entries → approved_with_note; zero flags → approved. */
export function scoreVerdict(matchedEntries) {
  const flags = matchedEntries || [];
  if (flags.length === 0) return 'approved';
  const maxRank = Math.max(0, ...flags.map((e) => SEVERITY_RANK[e.severity] || 0));
  if (maxRank >= SEVERITY_RANK.critical) return 'skip';
  if (maxRank >= SEVERITY_RANK.high) return 'swap_recommended';
  if (maxRank >= SEVERITY_RANK.moderate) return 'use_with_intention';
  return 'approved_with_note';
}

// ── The approved read ────────────────────────────────────────────────────────
// `approved` means ZERO KB ENTRIES MATCHED. The seal says "Kristy Approved". Those
// are different claims, and the prose under the seal was asserting the second:
// "This one is clean. No industrial additives, no processing tricks — just real
// food." Eight of ten approved products got that sentence near-verbatim, varying
// only the closer, and one of them was a strawberry jam whose second ingredient is
// sugar. With 74 entries the KB's silence is not evidence of a clean product.
//
// So the approved state stops claiming and starts REPORTING: what was checked, and
// what is actually in it. The second line is read off the label, which is why it can
// never become a template and why it puts the jam's sugar in front of the shopper
// without Kristy having to hold a position on sugar at all.
//
// Deterministic and free — no model call, so the commonest tier costs nothing and
// cannot drift.
const APPROVED_NAMES_SHOWN = 5;

/**
 * The factual read for an approved product: what was checked, and what is in it.
 * @returns {{ checked:string, names:string }}
 */
export function buildApprovedRead(rawIngredientList) {
  const tokens = tokenizeIngredients(rawIngredientList);
  // Ingredient lists are weight-ordered, so the first few ARE the product. Naming all
  // 29 of a cereal's tokens would be the six-essays problem in a new place.
  const shown = tokens.slice(0, APPROVED_NAMES_SHOWN);
  const label = (t) => t.replace(/[.;:]+$/, '');
  const names = shown.map(label).join(', ');

  if (tokens.length === 1) {
    // The counting line reads absurd at n=1.
    return { checked: `One ingredient: ${label(tokens[0])}.`, names: '' };
  }
  return {
    checked: `Read all ${tokens.length}. None of them are on the list.`,
    names: tokens.length > shown.length ? `${names}…` : `${names}.`,
  };
}

/**
 * The read for a product that matched nothing and declared no nutrition panel.
 *
 * ⚠️ **THE COPY MAY NOT OUTRUN THE SIGNAL.** The non-food ruling's answer for a scan is
 * *"that isn't something Kristy reads"* — **that sentence is not available here.** It asserts
 * the product is not food, and the evidence is that a database had no calorie figure. A real
 * food with a thin OFF record would be told it is not food, which is a fabricated claim and
 * non-negotiable #2. Saying the strong sentence on weak evidence is the same error as the
 * seal, pointing the other way.
 *
 * So it states what is missing, states the rule, and claims nothing about the product. It is
 * exactly right about a bottle of Dawn without ever asserting Dawn is not food.
 *
 * ⚠️ **LEAD WITH THE STANDARD, NOT WITH THE ABSENCE — reworded 2026-08-09.** The first version
 * opened *"No nutrition panel on this one"*, which puts a **shortfall in this product** in the
 * first clause and reaches the rule second. Read on a bottle of Dawn that is exactly backwards:
 * the product has not fallen short of anything, the seal simply has a bar and this is not the
 * kind of thing that can clear it. Leading with the rule is also the sentence that stays true
 * on the real food with a thin OFF record — the case the paragraph above exists to protect.
 *
 * **`panel` is the product's own word**, off the box the shopper is holding, so the sentence
 * names the missing thing concretely without naming a category for the product.
 *
 * ⚠️ **THE REJECTED ALTERNATIVE, RECORDED BECAUSE IT IS THE TEMPTING ONE.**
 * *"Kristy stamps food, and food comes with a panel"* is firmer and reads better, and it is the
 * forbidden claim arriving as an INFERENCE instead of an assertion: the shopper completes the
 * syllogism themselves and lands on *this is not food* — the exact sentence the paragraph above
 * rules out — with nothing on screen to point at as the claim. **That is harder to see than
 * saying it outright and it is no more defensible.** A claim the copy sets up is a claim the
 * copy made.
 * ⚠️ **`checked` STATES THE WORK AND NEVER THE FINDING — narrowed 2026-08-09, WITH THE RENDER
 * IN HAND.** It used to read *"Read all 13. None of them are on the list."* Shot on the real
 * card, that sentence sits directly above the refusal in the same face and the same weight, so
 * the shopper reads a clean bill and then a withdrawal of it, in two lines that look identical.
 *
 * **It is the same act this function already refuses one notch quieter.** `names` was dropped
 * because naming the surfactants back was what presented them as clean food — and *"none of
 * them are on the list"* presents a STRUCTURAL FACT as a finding: a detergent matches nothing
 * because the knowledge base is a food knowledge base, so the absence of matches is a property
 * of the KB rather than a property of the product. Stating it as an outcome is the endorsement
 * surviving the withholding.
 *
 * So `checked` is now the work only: **how much was read, never what it came to.**
 *
 * ⚠️ **THE ONE-INGREDIENT SHAPE NAMED THE INGREDIENT AND IS FIXED WITH IT.** *"One ingredient:
 * water."* is `names` exactly, at n=1, arriving through the other branch — the rule cannot hold
 * on twelve ingredients and break on one.
 *
 * **THE COST IS REAL AND IT IS ACCEPTED.** On a genuine food with a thin Open Food Facts record
 * — the case this whole gate has to stay honest about — "none flagged" was true and useful, and
 * this drops it. The card cannot tell that product from a detergent; that is the entire reason
 * the gate exists. Fail closed, the same asymmetry the seal itself runs on.
 * @returns {{ checked:string, why:string }}
 */
export function buildUnverifiedRead(rawIngredientList) {
  const tokens = tokenizeIngredients(rawIngredientList);
  return {
    checked: tokens.length === 1 ? 'One ingredient.' : `Read all ${tokens.length}.`,
    why: 'The seal is earned on a food label, and this one has no panel to read.',
  };
}

// ── Added sugar, by QUANTITY ─────────────────────────────────────────────────
// The widest hole under the seal: ingredients real, complete, and simply outside the
// KB. Kirkland Strawberry Spread — "Strawberries, sugar, fruit pectin citric acid" —
// took the gold seal because the KB holds no bare-sugar concern.
//
// POSITION IS A BAD PROXY AND WAS REJECTED. A "sugar in the first three ingredients"
// rule withholds 2 of 10 seals across the sample, and one of them is Cheerios, where
// sugar is third by weight at 3.6 g/100g because there is so little of anything else.
// That trades one false claim for another. The QUANTITY is already fetched on every
// scan and thrown away unless a focus is set: the jam is 44.4 g/100g, three times the
// threshold that already exists in this file.
//
// TWO CONDITIONS, AND BOTH ARE REQUIRED. An added-sugar ingredient has to be NAMED on
// the label, and the quantity has to clear the bar. The naming condition is what stops
// this flagging whole fruit: a bag of strawberries is sugar-heavy by the numbers and
// has no added sugar in it, so the gate never fires. It also licenses the fallback —
// `added-sugars_100g` is null on most OFF records, and falling back to TOTAL sugars is
// only defensible once the label has told us added sugar is present.
//
// Explicit list, widened deliberately — same discipline as IMPERATIVE_VERBS. The nine
// KB `sugar_alias` entries come from the KB itself so the two cannot drift; the plain
// terms below are the ones the KB has no concern entry for and never will, because
// "sugar" is not an objection, it is an amount.
//
// RAW HONEY AND MAPLE SYRUP ARE DELIBERATELY ABSENT. For those the sugar IS the food,
// they are single-ingredient products the KB affirms as time-tested, and including
// them would pull the seal off a jar of honey to tell a shopper honey is sugary.
const PLAIN_ADDED_SUGARS = [
  'sugar', 'brown sugar', 'raw sugar', 'turbinado sugar', 'powdered sugar',
  'confectioners sugar', 'coconut sugar', 'palm sugar', 'beet sugar', 'molasses',
  'malt syrup', 'barley malt', 'barley malt syrup', 'tapioca syrup', 'fructose',
  'sucrose', 'caramel', 'honey powder', 'date sugar',
];

const ADDED_SUGAR_KEYS = (() => {
  const keys = new Set(PLAIN_ADDED_SUGARS.map(norm));
  for (const entry of kb.ingredients) {
    if (entry.category !== 'sugar_alias') continue;
    for (const k of [entry.name, ...(entry.aliases || [])]) {
      const n = norm(k);
      // The KB's display names carry punctuation ("Agave Nectar / Agave Syrup") that
      // never appears as a token; the aliases are the label forms.
      if (n && !n.includes('/')) keys.add(n);
    }
  }
  return keys;
})();

/** Does the label NAME an added sugar? (Not "is this sweet" — that is the number's job.) */
export function namesAddedSugar(tokens = []) {
  return tokens.some((t) => {
    const clean = norm(t).replace(/[.;:]+$/, '');
    if (ADDED_SUGAR_KEYS.has(clean)) return true;
    // "organic cane sugar", "sugar (beet)" — the token names one, with a qualifier.
    for (const key of ADDED_SUGAR_KEYS) if (containsPhrase(clean, key)) return true;
    return false;
  });
}

/**
 * May this product keep the seal on its sugar? Requires BOTH an added sugar named on
 * the label AND a quantity at or over the threshold.
 * @returns {boolean} true when the seal must be withheld
 */
export function sugarWithholdsSeal(tokens, nutrition) {
  if (!namesAddedSugar(tokens)) return false;
  // `addedSugar` ALREADY carries the documented fallback to total sugars, because OFF
  // populates `added-sugars_100g` on almost nothing. That fallback was safe for focus
  // emphasis and would NOT be safe for the seal on its own — it cannot tell jam from
  // fruit. The naming condition above is what licenses it here: by this line the label
  // has said an added sugar is in the product, so the total is a floor on it.
  const { addedSugar } = normalizeNutrition(nutrition);
  return addedSugar != null && addedSugar >= ADDED_SUGAR_HIGH;
}

/** buildUniversalLayer — the factual layer, verbatim from the KB. For each
 *  flagged ingredient: name, one_liner, severity, and evidence_tier. No model,
 *  no invented text. (id is included for stable keying; it's factual.) */
export function buildUniversalLayer(matchedEntries) {
  return (matchedEntries || []).map((e) => ({
    id: e.id,
    name: e.name,
    one_liner: e.one_liner,
    severity: e.severity,
    evidence_tier: e.evidence_tier,
  }));
}

/** buildAffirmationLayer — the positive counterpart to buildUniversalLayer,
 *  verbatim from the KB. No `severity` and no `verdict`: an affirmation has
 *  neither, and giving it one would let it into concern scoring. A card renders
 *  this in the approved register, never as a warning. Free (a pure KB read). */
export function buildAffirmationLayer(affirmedEntries) {
  return (affirmedEntries || []).map((e) => ({
    id: e.id,
    name: e.name,
    one_liner: e.one_liner,
    evidence_tier: e.evidence_tier,
  }));
}

/** rubricText — the human-readable tier description, read from the file (not
 *  hardcoded) so wording stays owned by the KB. */
export function rubricText(tier) {
  return kb.kristy_scoring_rubric?.[tier] || '';
}

/** genericSwap — the KB's own category-level swap for a swap/skip verdict, taken
 *  from the highest-severity matched entry that carries one. This is a pure FIELD
 *  READ (zero inference, no model call), so it's safe to surface on the FREE path:
 *  the goal-AWARE swap the note composer writes stays a member benefit; this is the
 *  generic "here's a better shelf" pick everyone gets. Returns null for approved
 *  tiers (nothing to move away from) or when no matched entry names a swap. */
export function genericSwap(matchedEntries, tier) {
  if (tier !== 'swap_recommended' && tier !== 'skip') return null;
  const ranked = [...(matchedEntries || [])].sort(
    (a, b) => (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0)
  );
  const hit = ranked.find((e) => e.swap && String(e.swap).trim());
  return hit ? String(hit.swap).trim() : null;
}

// ── Dietary focus escalation (extension) ─────────────────────────────────────
// Focuses are PREFERENCES the user turns on about themselves — never inferences,
// never diagnoses. When one is active it escalates emphasis on the relevant, REAL
// signal, bounded and honest:
//   • the tier rises one step per triggered focus, capped at swap_recommended.
//     Only a CRITICAL KB ingredient can ever produce skip.
//   • nothing is fabricated: with no ingredient/nutrition match, the verdict is
//     unchanged — a clean product keeps its stamp.
// Sodium and added sugar are QUANTITY concerns read from the product's Open Food
// Facts nutrition data (per 100g), never invented from the ingredient list.

// Configurable thresholds (env-overridable).
export const SODIUM_HIGH = Number(process.env.SODIUM_HIGH) || 0.6; // g sodium / 100g
export const ADDED_SUGAR_HIGH = Number(process.env.ADDED_SUGAR_HIGH) || 15; // g / 100g
// Read but deliberately NOT acted on: Kristy's philosophy does not demonize
// natural saturated fat (butter, tallow). Only trans fats + industrial seed oils
// drive the heart-conscious escalation.
export const SAT_FAT_CONTEXT =
  process.env.SAT_FAT_CONTEXT ||
  'natural saturated fat is not penalized; only trans fats and industrial seed oils escalate for heart-conscious';

// Canonical focus keys (mirror the onboarding labels).
export const FOCUS = {
  LOWER_SUGAR: 'lower_sugar',
  BLOOD_SUGAR: 'blood_sugar',
  LOWER_SODIUM: 'lower_sodium',
  HEART: 'heart',
  // Added with the deeper preference set. Every one of these is backed by a real
  // KB category or a real nutrition field — a focus the engine can't actually act
  // on would be a chip that quietly does nothing, which is its own kind of lie.
  ADDITIVE_SENSITIVE: 'additive_sensitive', // dyes + preservatives, from the KB
  PROCESSED_FATS: 'processed_fats', // trans fats + industrial seed oils, from the KB
  HIGHER_FIBER: 'higher_fiber', // stripped/refined grain, from the KB
  CAFFEINE: 'caffeine', // measured caffeine, from OFF nutrition
};

// Categories behind the KB-backed focuses above.
const ADDITIVE_CATEGORIES = new Set(['artificial_dye', 'preservative', 'preservative_curing']);
// Kristy's philosophy does NOT demonize natural saturated fat — this is the
// processed-fat line only (hydrogenated + industrial seed oils), never butter.
const PROCESSED_FAT_CATEGORIES = new Set(['trans_fat', 'seed_oil']);
// Refined grain: the fiber-bearing bran and germ stripped out.
const REFINED_GRAIN_IDS = new Set(['enriched_bleached_flour', 'bleached_flour', 'modified_food_starch']);

export const CAFFEINE_HIGH = Number(process.env.CAFFEINE_HIGH) || 0.02; // g / 100g

const SWAP_INDEX = TIERS.indexOf('swap_recommended');
const numOrNull = (x) => (Number.isFinite(Number(x)) ? Number(x) : null);

/** Normalize product nutrition to { sodium, addedSugar } in g/100g (or nulls). */
export function normalizeNutrition(n) {
  if (!n || typeof n !== 'object') return { sodium: null, addedSugar: null, fiber: null, caffeine: null };
  return {
    sodium: numOrNull(n.sodium),
    addedSugar: numOrNull(n.addedSugar),
    fiber: numOrNull(n.fiber),
    caffeine: numOrNull(n.caffeine),
  };
}

// Compute which active focuses are TRIGGERED by real matches, which matched
// entries are focus-relevant (for surfacing first), and the note lead + signals.
function computeFocus(matched, nutrition, focuses) {
  const active = (Array.isArray(focuses) ? focuses : []).map((f) => String(f).trim()).filter(Boolean);
  const nut = normalizeNutrition(nutrition);
  const highSodium = nut.sodium != null && nut.sodium >= SODIUM_HIGH;
  const highAddedSugar = nut.addedSugar != null && nut.addedSugar >= ADDED_SUGAR_HIGH;

  const highCaffeine = nut.caffeine != null && nut.caffeine >= CAFFEINE_HIGH;

  const glycemicHigh = matched.filter((e) => e.glycemic_impact === 'high');
  const sugarAliases = matched.filter((e) => e.category === 'sugar_alias');
  const cardio = matched.filter((e) => e.cardiovascular_relevance); // trans fats + seed oils
  const additives = matched.filter((e) => ADDITIVE_CATEGORIES.has(e.category));
  const processedFats = matched.filter((e) => PROCESSED_FAT_CATEGORIES.has(e.category));
  const refinedGrain = matched.filter((e) => REFINED_GRAIN_IDS.has(e.id));

  const triggered = [];
  const relevantIds = new Set();
  const mark = (arr) => arr.forEach((e) => relevantIds.add(e.id));

  if (active.includes(FOCUS.BLOOD_SUGAR) && (glycemicHigh.length || highAddedSugar)) {
    triggered.push(FOCUS.BLOOD_SUGAR);
    mark(glycemicHigh);
  }
  if (active.includes(FOCUS.LOWER_SUGAR) && (sugarAliases.length || highAddedSugar)) {
    triggered.push(FOCUS.LOWER_SUGAR);
    mark(sugarAliases);
  }
  if (active.includes(FOCUS.LOWER_SODIUM) && highSodium) {
    triggered.push(FOCUS.LOWER_SODIUM);
  }
  if (active.includes(FOCUS.HEART) && cardio.length) {
    triggered.push(FOCUS.HEART);
    mark(cardio);
  }
  if (active.includes(FOCUS.ADDITIVE_SENSITIVE) && additives.length) {
    triggered.push(FOCUS.ADDITIVE_SENSITIVE);
    mark(additives);
  }
  if (active.includes(FOCUS.PROCESSED_FATS) && processedFats.length) {
    triggered.push(FOCUS.PROCESSED_FATS);
    mark(processedFats);
  }
  // "Higher fiber" reads as: this is the refined version, with the fiber stripped.
  // Measured fiber only counts when OFF actually has the figure.
  if (active.includes(FOCUS.HIGHER_FIBER) && refinedGrain.length) {
    triggered.push(FOCUS.HIGHER_FIBER);
    mark(refinedGrain);
  }
  if (active.includes(FOCUS.CAFFEINE) && highCaffeine) {
    triggered.push(FOCUS.CAFFEINE);
  }

  const leadsWith =
    (triggered.includes(FOCUS.LOWER_SODIUM) && FOCUS.LOWER_SODIUM) ||
    (triggered.includes(FOCUS.BLOOD_SUGAR) && FOCUS.BLOOD_SUGAR) ||
    (triggered.includes(FOCUS.LOWER_SUGAR) && FOCUS.LOWER_SUGAR) ||
    (triggered.includes(FOCUS.CAFFEINE) && FOCUS.CAFFEINE) ||
    (triggered.includes(FOCUS.PROCESSED_FATS) && FOCUS.PROCESSED_FATS) ||
    (triggered.includes(FOCUS.ADDITIVE_SENSITIVE) && FOCUS.ADDITIVE_SENSITIVE) ||
    (triggered.includes(FOCUS.HIGHER_FIBER) && FOCUS.HIGHER_FIBER) ||
    (triggered.includes(FOCUS.HEART) && FOCUS.HEART) ||
    null;

  return {
    active,
    triggered,
    relevantIds,
    leadsWith,
    signals: {
      highSodium,
      highAddedSugar,
      sodium_100g: nut.sodium,
      added_sugar_100g: nut.addedSugar,
      highCaffeine,
      caffeine_100g: nut.caffeine,
      fiber_100g: nut.fiber,
      glycemicHigh: glycemicHigh.map((e) => e.name),
      sugarAliases: sugarAliases.map((e) => e.name),
      cardiovascular: cardio.map((e) => e.name),
      additives: additives.map((e) => e.name),
      processedFats: processedFats.map((e) => e.name),
      refinedGrain: refinedGrain.map((e) => e.name),
    },
  };
}

// Raise the tier one step per triggered focus, capped at swap_recommended, and
// never below the base (focuses only escalate, never soften).
function escalateTier(baseTier, triggeredCount) {
  const base = TIERS.indexOf(baseTier);
  if (base < 0 || triggeredCount <= 0) return baseTier;
  const raised = Math.min(SWAP_INDEX, base + triggeredCount);
  return TIERS[Math.max(base, raised)];
}

// Surface focus-relevant entries first in the universal layer (stable order).
function orderLayer(layer, relevantIds) {
  if (!relevantIds || relevantIds.size === 0) return layer;
  return [...layer.filter((i) => relevantIds.has(i.id)), ...layer.filter((i) => !relevantIds.has(i.id))];
}

/** evaluateIngredients — pure convenience composing the pipeline. Returns
 *  everything Step 2 needs to compose a note WITHOUT re-running the match: the
 *  tier, the factual universal layer, the full matched entries (which carry the
 *  per-entry `swap`), and the unmatched tokens. Still no model, no I/O.
 *
 *  Optional `{ focuses, nutrition }` apply the bounded dietary-focus escalation
 *  (extension). Omitting them yields the exact base behavior — additive only.
 *  @param {string|string[]} rawIngredientList
 *  @param {{ focuses?: string[], nutrition?: { sodium?, addedSugar? } }} [options]
 */
export function evaluateIngredients(rawIngredientList, options = {}) {
  const { focuses = [], nutrition = null, hardLines = [] } = options;
  const { matched, affirmed, unmatched } = matchIngredients(rawIngredientList);
  // `affirmed` is deliberately absent from every line below this one: it does not
  // reach scoreVerdict, computeFocus, matchHardLines, the stamp, or the layer.
  const baseTier = scoreVerdict(matched);

  const focus = computeFocus(matched, nutrition, focuses);
  // A violated hard line escalates like a triggered focus — same bounded ladder,
  // so a user preference can never manufacture a `skip` that the KB didn't earn.
  const violated = matchHardLines(matched, hardLines);
  const tier = escalateTier(baseTier, focus.triggered.length + violated.length);

  // A NUMBER MAY WITHHOLD A SEAL THE INGREDIENT ENGINE GRANTED. The seal claims what
  // was checked, and the quantity of added sugar is something we checked — it arrives
  // on every scan and was previously read only for shoppers who had opted into the
  // sugar focus. Withholding only; it can never grant a seal, exactly like a hard line.
  const sugarHeavy = tier === 'approved' && sugarWithholdsSeal(tokenizeIngredients(rawIngredientList), nutrition);

  // ⚠️ **NOTHING SAYS THIS IS FOOD, SO THE SEAL DOES NOT GO ON IT.**
  //
  // `approved` means ZERO KB ENTRIES MATCHED (`scoreVerdict`, and the comment above
  // `buildApprovedRead`). A detergent matches nothing, so it earned the gold seal —
  // measured live on Dawn Platinum Plus Powerwash, with the `clean_label` ism printed under
  // it about dipropylene glycol butyl ether.
  //
  // ⚠️ **THE COLLISION IS DESIGNED, WHICH IS WHY NO SCORING FIX REACHES IT.** `CLAUDE.md`
  // records as load-bearing that whole-food fats are clean BECAUSE the KB holds no entry for
  // them, with a regression test guarding it. Matching nothing is the signature of the
  // cleanest possible food AND of something that is not food. The ingredient list cannot
  // separate them and no new KB entry ever will.
  //
  // So the evidence comes from outside the list: **a thing sold to be eaten declares
  // calories.** `'absent'` means a source that publishes energy for food was consulted and
  // had none. `'unknown'` — the photo path, and any caller that sent no nutrition — withholds
  // NOTHING, which is why this tests `!== 'absent'` and never `=== 'present'`.
  //
  // ⚠️ **FAIL CLOSED, and do not carry the counter's asymmetry across.** There, scope has been
  // wrong in one direction every time and the rule is "when in doubt, admit", because a
  // wrongly-refused question tells a shopper they do not belong. **Here a wrong approval is a
  // gold seal on a cleaning product and a wrong refusal is a missing endorsement.** The
  // analogy is the most likely way to get this wrong.
  const unverifiedAsFood = tier === 'approved' && nutrition?.nutritionPanel === 'absent';

  // The user drew this line themselves, so a product that crosses it is not
  // "approved" for them no matter how clean the rest of the label is. The seal
  // stays earned — these only ever take it away, never grant it.
  const stamp = tier === 'approved' && violated.length === 0 && !sugarHeavy && !unverifiedAsFood;

  // Hard lines are the loudest thing on the card: surface what crossed them
  // first, then focus-relevant, then the rest.
  const layer = orderLayer(
    orderLayer(buildUniversalLayer(matched), focus.relevantIds),
    hardLineIds(hardLines),
  );

  return {
    tier,
    baseTier, // the pre-focus tier (for transparency / tests)
    stamp, // the gold seal is earned only at `approved`, and never over a hard line
    universalLayer: layer,
    matched, // full entries incl. `swap` — surfaced cleanly for Step 2
    affirmed, // whole foods Kristy stands behind — additive, never scored
    affirmationLayer: buildAffirmationLayer(affirmed),
    unmatched,
    focus: { active: focus.active, triggered: focus.triggered, leadsWith: focus.leadsWith, signals: focus.signals },
    hardLines: { violated }, // [{ value, label, names[] }] — additive, never reshapes the above
    // Additive, both of them (non-negotiable #5). `approvedRead` is the factual copy
    // the approved card renders instead of the old template; `sugarHeavy` says why a
    // product that matched nothing still did not earn the seal.
    // ⚠️ **`approvedRead` GOES NULL WHEN THE SEAL IS WITHHELD THIS WAY, AND THE NULL IS THE
    // LOAD-BEARING HALF.** It is the endorsement: "Read all 13. None of them are on the
    // list", followed by the surfactants named back as the evidence of cleanliness. Adding a
    // sibling flag and leaving this populated would mean **every already-shipped client keeps
    // rendering it unchanged**, because a client cannot fail closed on a field it has never
    // heard of. Nulling the old field degrades correctly on every build ever shipped.
    approvedRead: tier === 'approved' && !unverifiedAsFood ? buildApprovedRead(rawIngredientList) : null,
    // The withheld read takes its place. `checked` carries over because it was true of the
    // detergent and stays true; the ingredient NAMES do not, because naming them was the act
    // that presented them as clean food.
    unverifiedRead: unverifiedAsFood ? buildUnverifiedRead(rawIngredientList) : null,
    unverifiedAsFood,
    sugarHeavy,
  };
}
