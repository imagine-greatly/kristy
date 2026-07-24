// Structural guarantee that Kristy — a grocery coach — never volunteers calorie
// or macro accounting. Macro tracking was removed as a feature; this backstop
// holds even if the model slips, the same way the claim lock does: the guarantee
// is in the code, not the prompt.

// The USER is explicitly asking about calories/macros → a plain, brief answer is
// allowed (she answers, then steers back to shopping). Only VOLUNTEERED macro
// talk is scrubbed.
const MACRO_WORDS =
  /\b(calorie|calories|kcal|macro|macros|protein|carb|carbs|carbohydrate|carbohydrates|fat|fats)\b/i;
const ASKING = /\?|\bhow (many|much)\b|\bcount\b|\btrack\b/i;

export function userAskedAboutMacros(userMsg) {
  const m = String(userMsg || '');
  return MACRO_WORDS.test(m) && ASKING.test(m);
}

// Volunteered macro ACCOUNTING in Kristy's prose — numbers tied to macros, or
// judging a food by its macro math / a running "budget." NOT ordinary food talk
// ("chicken's a great protein") and NOT KB concern framing ("this has added
// sugar, it runs sweet").
const ACCOUNTING = [
  /\b\d+\s*(kcal|calories|calorie)\b/i, // "200 calories"
  /\bcalorie count\b/i,
  /\b\d+\s*g(?:rams)?\s+(?:of\s+)?(protein|carbs?|carbohydrates?|fat)\b/i, // "30g of protein"
  /\b(your|the|those|these)\s+macros?\b/i, // "your macros"
  /\bmacro (breakdown|count|split|math)\b/i,
  /\bkeeps?\s+(your\s+)?(carbs?|calories|protein|fat)\b/i, // "keeps your carbs reasonable"
  /\b(within|under|over|hitting|on track for)\s+(your\s+)?(calorie|calories|carbs?|macros?|protein|fat)\b/i,
  /\bfor the (calories|carbs|macros)\b/i, // "a lot of protein for the calories"
  /\b(that'?s|thats)\s+(a lot of|plenty of|tons of|loads of)\s+(protein|carbs?|calories)\b/i,
  /\byour (daily )?(calorie|carb|protein|macro)\w*\s+(target|intake|budget|goal|limit)\b/i,
];

export function volunteeredMacroAccounting(text) {
  const t = String(text || '');
  return ACCOUNTING.some((re) => re.test(t));
}

// Deterministic last resort: drop any sentence that carries macro accounting,
// keep the rest of the coaching. Returns '' only if every sentence was macro.
export function stripMacroSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim() && !volunteeredMacroAccounting(s))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
