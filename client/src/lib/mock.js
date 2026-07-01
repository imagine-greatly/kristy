// Lightweight in-browser stand-in for the Haiku backend, used in demo mode so
// the full UI is explorable with no keys. Rough USDA-ish estimates only.

import { dayKey } from './format.js';

// per-100g unless `unit` says otherwise
const FOODS = [
  { re: /chicken breast|chicken/, per: 100, cal: 165, p: 31, c: 0, f: 3.6, name: 'chicken breast' },
  { re: /\brice\b/, per: 100, cal: 130, p: 2.7, c: 28, f: 0.3, name: 'rice' },
  { re: /egg/, unit: 'egg', cal: 78, p: 6, c: 0.6, f: 5, name: 'egg' },
  { re: /avocado/, unit: 'avocado', cal: 240, p: 3, c: 12, f: 22, name: 'avocado' },
  { re: /whole milk|milk/, per: 100, ml: true, cal: 61, p: 3.2, c: 4.8, f: 3.3, name: 'milk' },
  { re: /protein (shake|powder)|whey/, unit: 'scoop', cal: 120, p: 24, c: 3, f: 1.5, name: 'protein shake' },
  { re: /big mac/, unit: 'item', cal: 563, p: 26, c: 45, f: 33, name: 'Big Mac' },
  { re: /(medium )?fries|fries/, unit: 'item', cal: 340, p: 4, c: 44, f: 16, name: 'medium fries' },
  { re: /banana/, unit: 'banana', cal: 105, p: 1.3, c: 27, f: 0.4, name: 'banana' },
  { re: /oats|oatmeal/, per: 100, cal: 389, p: 17, c: 66, f: 7, name: 'oats' },
  { re: /salmon/, per: 100, cal: 208, p: 20, c: 0, f: 13, name: 'salmon' },
  { re: /greek yogurt|yogurt/, per: 100, cal: 59, p: 10, c: 3.6, f: 0.4, name: 'greek yogurt' },
];

const round = (x) => Math.round(x);

// Look at the words immediately *before* a food mention for its quantity, so
// "3 eggs and half an avocado" assigns 3 to eggs and 0.5 to the avocado.
function qtyBefore(text, idx, food) {
  const pre = text.slice(Math.max(0, idx - 24), idx);
  const g = pre.match(/(\d+)\s?(g|grams|ml)\s*$/);
  if (g && (food.per || food.ml)) return Number(g[1]) / food.per;
  if (/\b(half|1\/2)\s+(an?\s+)?$/.test(pre)) return 0.5;
  const cnt = pre.match(/(\d+)\s+(?:\w+\s+){0,2}$/);
  if (cnt && food.unit) return Number(cnt[1]);
  return 1;
}

export function mockEstimate(text) {
  const lower = text.toLowerCase();
  const found = [];
  const macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  for (const food of FOODS) {
    const m = food.re.exec(lower);
    if (m) {
      const q = qtyBefore(lower, m.index, food);
      macros.calories += food.cal * q;
      macros.protein += food.p * q;
      macros.carbs += food.c * q;
      macros.fat += food.f * q;
      found.push(food.name);
    }
  }

  return found.length
    ? {
        hasFood: true,
        foods: found,
        macros: {
          calories: round(macros.calories),
          protein: round(macros.protein),
          carbs: round(macros.carbs),
          fat: round(macros.fat),
        },
      }
    : null;
}

const FOOD_REPLIES = [
  'Logged it. Solid protein hit there.',
  "Got it — that's going to land you in a good spot for the day.",
  'Nice. That keeps your carbs reasonable too.',
  "Logged. You've got room left for a good dinner.",
];

const ADVICE = {
  default:
    "Based on what you've logged, you're tracking well. Aim for a protein-forward next meal and you'll be right on target.",
  protein:
    "You're a bit short on protein for where you'd want to be — a chicken breast, some greek yogurt, or a shake would close most of that gap.",
  dinner:
    "With the calories you have left, something like salmon with rice and veg would round out the day nicely without going over.",
};

export function mockReply(text, ctx) {
  const food = mockEstimate(text);
  if (food) {
    const msg = FOOD_REPLIES[Math.floor(Math.random() * FOOD_REPLIES.length)];
    let insight = '';
    const after = (ctx?.today?.protein || 0) + food.macros.protein;
    if (ctx?.goals && after >= ctx.goals.protein)
      insight = 'Protein target hit. Everything else today is a bonus.';
    return { message: msg, ...food, insight };
  }

  const lower = text.toLowerCase();
  let message = ADVICE.default;
  if (/protein/.test(lower)) message = ADVICE.protein;
  else if (/dinner|eat|should i|what.*eat/.test(lower)) message = ADVICE.dinner;
  else if (/^(hi|hey|hello|yo|sup)/.test(lower))
    message = "Hey! What did you eat? Tell me and I'll keep your day on track.";

  return { message, hasFood: false, macros: null, foods: [], insight: '' };
}

// Seed a few days of history so the sidebar + history tab feel alive in demo.
export function seedDemoMeals() {
  const days = [
    { back: 1, calories: 2340, protein: 156, carbs: 210, fat: 74 },
    { back: 2, calories: 1980, protein: 142, carbs: 180, fat: 68 },
    { back: 3, calories: 2510, protein: 188, carbs: 220, fat: 80 },
    { back: 4, calories: 2120, protein: 134, carbs: 195, fat: 71 },
  ];
  return days.map((d) => {
    const date = new Date();
    date.setDate(date.getDate() - d.back);
    return {
      id: `seed-${d.back}`,
      logged_at: date.toISOString(),
      day: dayKey(date),
      foods: ['mixed meals'],
      calories: d.calories,
      protein: d.protein,
      carbs: d.carbs,
      fat: d.fat,
    };
  });
}
