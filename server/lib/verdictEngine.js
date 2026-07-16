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

/** Split a raw ingredient string (or array) into normalized tokens. Per spec:
 *  lowercase, strip E-number formatting, split on commas and parentheses (plus
 *  the harmless siblings ; [ ]). Compound names like "canola oil" stay intact —
 *  we deliberately do NOT split on "and". */
export function tokenizeIngredients(raw) {
  const text = Array.isArray(raw) ? raw.join(', ') : String(raw || '');
  return text
    .split(/[,;()[\]]+/)
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
//   2. FORWARD — the token CONTAINS a key as a whole phrase, i.e. the token
//      names this (sub)ingredient. Take the longest contained key (most
//      specific). INDEX is longest-first, so the first hit is the longest.
//   3. REVERSE — a MULTI-WORD token sits inside a more specific alias
//      ("cane sugar" ⊂ "whole cane sugar"). Take the SHORTEST containing key
//      (least escalation). The multi-word gate stops bare generics ("salt",
//      "milk", "oil") from reverse-matching a longer, unrelated alias.
// Reverse is last and least-escalating on purpose: it never overrides an exact
// or forward reading, so a common token can't be misattributed to a longer,
// more-severe alias.
function bestMatch(token) {
  for (const { key, entry } of INDEX) if (token === key) return entry; // 1
  for (const { key, entry } of INDEX) if (containsPhrase(token, key)) return entry; // 2
  if (token.includes(' ')) {
    let best = null; // 3
    for (const { key, entry } of INDEX) {
      if (containsPhrase(key, token) && (!best || key.length < best.key.length)) best = { key, entry };
    }
    if (best) return best.entry;
  }
  return null;
}

/** matchIngredients — normalize + match a raw ingredient list against the KB.
 *  Returns the matched KB entries (deduped, first-seen order) and the tokens
 *  that matched nothing. Every KB entry is a flagged concern, so "matched" IS
 *  the flag list downstream. */
export function matchIngredients(rawIngredientList) {
  const tokens = tokenizeIngredients(rawIngredientList);
  const matchedById = new Map();
  const unmatched = [];

  for (const token of tokens) {
    const hit = bestMatch(token);
    if (hit) {
      if (!matchedById.has(hit.id)) matchedById.set(hit.id, hit);
    } else {
      unmatched.push(token);
    }
  }

  return { matched: [...matchedById.values()], unmatched };
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

/** rubricText — the human-readable tier description, read from the file (not
 *  hardcoded) so wording stays owned by the KB. */
export function rubricText(tier) {
  return kb.kristy_scoring_rubric?.[tier] || '';
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
};

const SWAP_INDEX = TIERS.indexOf('swap_recommended');
const numOrNull = (x) => (Number.isFinite(Number(x)) ? Number(x) : null);

/** Normalize product nutrition to { sodium, addedSugar } in g/100g (or nulls). */
export function normalizeNutrition(n) {
  if (!n || typeof n !== 'object') return { sodium: null, addedSugar: null };
  return { sodium: numOrNull(n.sodium), addedSugar: numOrNull(n.addedSugar) };
}

// Compute which active focuses are TRIGGERED by real matches, which matched
// entries are focus-relevant (for surfacing first), and the note lead + signals.
function computeFocus(matched, nutrition, focuses) {
  const active = (Array.isArray(focuses) ? focuses : []).map((f) => String(f).trim()).filter(Boolean);
  const nut = normalizeNutrition(nutrition);
  const highSodium = nut.sodium != null && nut.sodium >= SODIUM_HIGH;
  const highAddedSugar = nut.addedSugar != null && nut.addedSugar >= ADDED_SUGAR_HIGH;

  const glycemicHigh = matched.filter((e) => e.glycemic_impact === 'high');
  const sugarAliases = matched.filter((e) => e.category === 'sugar_alias');
  const cardio = matched.filter((e) => e.cardiovascular_relevance); // trans fats + seed oils

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

  const leadsWith =
    (triggered.includes(FOCUS.LOWER_SODIUM) && FOCUS.LOWER_SODIUM) ||
    (triggered.includes(FOCUS.BLOOD_SUGAR) && FOCUS.BLOOD_SUGAR) ||
    (triggered.includes(FOCUS.LOWER_SUGAR) && FOCUS.LOWER_SUGAR) ||
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
      glycemicHigh: glycemicHigh.map((e) => e.name),
      sugarAliases: sugarAliases.map((e) => e.name),
      cardiovascular: cardio.map((e) => e.name),
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
  const { focuses = [], nutrition = null } = options;
  const { matched, unmatched } = matchIngredients(rawIngredientList);
  const baseTier = scoreVerdict(matched);

  const focus = computeFocus(matched, nutrition, focuses);
  const tier = escalateTier(baseTier, focus.triggered.length);

  return {
    tier,
    baseTier, // the pre-focus tier (for transparency / tests)
    stamp: tier === 'approved', // the gold seal is earned only at `approved`
    universalLayer: orderLayer(buildUniversalLayer(matched), focus.relevantIds),
    matched, // full entries incl. `swap` — surfaced cleanly for Step 2
    unmatched,
    focus: { active: focus.active, triggered: focus.triggered, leadsWith: focus.leadsWith, signals: focus.signals },
  };
}
