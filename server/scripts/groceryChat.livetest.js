// Acceptance — Kristy's chat is the GROCERY COACH, with macros opt-in/off-by-default.
// Structural checks always run; the LIVE checks run only with an API key.
//   node scripts/groceryChat.livetest.js                       (structural only)
//   node --use-system-ca scripts/groceryChat.livetest.js       (adds the live checks)
//
// Verify criteria (from the task):
//   • "I had chicken and rice for lunch" (tracking OFF) → coaching, NO macros, NO log.
//   • The same message (tracking ON) logs as today (real macros on the card).
//   • "is wild or farmed salmon better" → a perimeter answer (claim-locked, no price).
//   • "what should I buy this week" → a coach reply (no macros), moving toward shopping.

import 'dotenv/config';
import { generateReply } from '../lib/chatEngine.js';
import { buildPreferencesBlock } from '../lib/prompts.js';
import { looksLikePerimeterQuestion } from '../lib/chatRouting.js';
import { matchEntries, composeAnswer } from '../lib/perimeter.js';

let pass = 0;
let fail = 0;
const ck = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  ok ? pass++ : fail++;
};

const prefs = { goal: 'eating_cleaner', focuses: ['lower_sugar'], hardLines: [], constraints: ['budget'] };
const preferencesBlock = buildPreferencesBlock(prefs);

// ── Structural (no key needed) ──
ck('routing: meal statement is NOT a perimeter question', looksLikePerimeterQuestion('I had chicken and rice for lunch') === false);
ck('routing: "is wild or farmed salmon better" IS a perimeter question', looksLikePerimeterQuestion('is wild or farmed salmon better') === true);
ck('routing: the salmon question matches the perimeter KB', matchEntries('is wild or farmed salmon better').length > 0);

const hasKey = !!process.env.ANTHROPIC_API_KEY;
if (!hasKey) {
  console.log('\n(no ANTHROPIC_API_KEY — skipping live checks)');
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

const MACRO_RE = /\b\d+\s*(calories|cals?|kcal|g\s*(protein|carbs?|fat)|grams)\b/i;
const PRICE_RE = /\$\s*\d|\d+\s*(dollars|cents|bucks)\b/i;
const HEALTH_CLAIM_RE = /\b(cures?|treats?|reverses?|prevents?|lowers your (blood pressure|cholesterol|blood sugar)|heals?)\b/i;

try {
  // A) Tracking OFF — a reported meal returns COACHING, no macros, no log.
  const off = await generateReply({
    message: 'I had chicken and rice for lunch',
    contextBlocks: { preferencesBlock, profileBlock: '' },
    macroTracking: false,
  });
  ck('OFF: no meal logged (hasFood false)', off.hasFood === false, JSON.stringify(off.macros));
  ck('OFF: no macros returned', off.macros === null && off.foods.length === 0);
  ck('OFF: reply is a coach line, not a macro breakdown', !!off.message && !MACRO_RE.test(off.message), off.message);

  // B) Tracking ON — the same message logs as today (USDA totals are authoritative).
  const stub = {
    macros: { calories: 520, protein: 52, carbs: 60, fat: 8 },
    foods: ['chicken breast', 'white rice'],
    breakdown: [
      { source: 'usda', grams: 175, food: 'chicken breast', calories: 289, protein: 54 },
      { source: 'usda', grams: 150, food: 'white rice', calories: 231, protein: 4 },
    ],
    source: 'usda',
  };
  const on = await generateReply({
    message: 'I had chicken and rice for lunch',
    contextBlocks: {
      preferencesBlock,
      profileBlock: 'Shopper: Alex.',
      historyBlock: 'No meals yet today.',
      goalsBlock: '2200 cal, 180g protein',
      todayBlock: 'Nothing logged yet.',
      weightBlock: '',
    },
    mealResolution: stub,
    macroTracking: true,
  });
  ck('ON: meal logged (hasFood true)', on.hasFood === true);
  ck('ON: card carries the authoritative USDA totals', on.macros?.calories === 520 && on.macros?.protein === 52);

  // C) Perimeter question → claim-locked answer, no price.
  const q = 'is wild or farmed salmon better';
  const matched = matchEntries(q);
  const { answer } = await composeAnswer({ question: q, ...prefs, entries: matched });
  ck('perimeter: an answer came back', !!answer && answer.length > 20);
  ck('perimeter: no price quoted', !PRICE_RE.test(answer), answer);
  ck('perimeter: no treatment/cure claim', !HEALTH_CLAIM_RE.test(answer), answer);

  // D) "what should I buy this week" (tracking OFF) → a coach reply, no macros.
  const buy = await generateReply({
    message: 'what should I buy this week',
    contextBlocks: { preferencesBlock, profileBlock: '' },
    macroTracking: false,
  });
  ck('buy-week: coach reply, no macros', buy.hasFood === false && buy.macros === null && !!buy.message && !MACRO_RE.test(buy.message), buy.message);
} catch (err) {
  ck('live run completed without error', false, err?.message || String(err));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
