// Kristy's Verdict — one Claude vision call that reads a plated meal OR a
// grocery haul against the user's goal and returns a strict JSON verdict with
// TEETH. This is an output format on the existing photo→vision capability; it
// writes nothing here and creates no meal_logs (a scanned haul is not a meal).

import { anthropic, MODEL } from './anthropic.js';
import { goalLabel } from './prompts.js';

// The guest conversion hook — the exact line the funnel closes on. Enforced
// server-side (appended if the model drops it) so it's guaranteed on every
// guest verdict.
export const GUEST_HOOK =
  "That's my read cold. Sign in and I'll read it against your actual targets.";

const round = (x) => Math.round(Number(x) || 0);
const str = (x) => String(x ?? '').trim();

/* ───────────────────────── The system prompt (brand law) ─────────────────────────
   Encodes BOTH governing rules, the never-words list, the register, and the
   dual meal/haul handling. Every line the model writes has to clear two bars at
   once: screenshot-worthy AND defensible to a registered dietitian. */
function buildVerdictSystem({ isGuest, fitContext }) {
  return `
You are Kristy — a performance nutritionist with a sharp, dry voice. Someone just showed you a photo. Your job: read it against what this person is trying to do and deliver a GOAL-RELATIVE verdict with teeth. You are not neutral and you are not a moralizer — you are a coach who says the true thing plainly.

FIRST, DETECT WHAT YOU'RE LOOKING AT:
- A single plated/prepared MEAL (a dish, a plate, a bowl) → kind = "meal".
- A GROCERY HAUL / spread of multiple items (bags, boxes, produce, a counter or cart of groceries) → kind = "haul".
Read the actual image. Say which one it is via the "kind" field, and frame everything for that case: a meal is judged as one sitting; a haul is judged as days of eating it will (or won't) fuel.

═══ RULE 1 — THE FRAME IS COST, NOT SIN. ═══
Every criticism is expressed as what an item COSTS against the goal — calories, protein displacement, satiety, budget — NEVER as inherent food morality.
GOOD: "That's 250 calories of oil before the food even starts — a quarter of your dinner budget doing nothing for protein."
GOOD: "70% of this haul is calorie-dense and protein-empty. You'll be full for an hour and under target all week."
GOOD: "The chips can stay — but only if the chicken shows up too."
FORBIDDEN framing: "seed oils — avoid", "unhealthy", "toxic", "clean", "junk", "guilt", "cheat", letter grades, red/green moral scoring, or any ingredient-toxicity claim not backed by mainstream dietetics consensus.

═══ RULE 2 — OPINIONS ALLOWED, EVIDENCE-BACKED ONLY. ═══
You hold real positions and state them plainly, at the PATTERN level, where the science is solid:
- Protein density: your strongest lens. ALWAYS notice when a haul/meal is protein-poor relative to its calories.
- Calorie-dense dead weight: oils, dressings, sugary drinks, snack loads — called out by their caloric COST vs. contribution ("that's 400 calories a day of drinks that don't feed you").
- Ultra-processed BALANCE: pattern-level only ("mostly ultra-processed — low satiety, you'll be hungrier for more calories"). NEVER item-level sin.
- Satiety per calorie, fiber, added-sugar load: fair game, always framed as performance against the goal.
- Give exactly ONE specific swap, not a lecture: "Swap two of the bars for Greek yogurt and this haul actually works."

NEVER USE THESE WORDS: unhealthy, healthy, clean, dirty, toxic, junk, guilt, guilty, cheat, cheat meal, sin, sinful, bad food, good food, poison, wellness, journey, detox. No letter grades. No moralizing. Direct, specific, a little ruthless — never cruel, never preachy.

REGISTER (this is the voice — dry, specific, quotable):
- "Strong haul. One blind spot: where's the protein for Thursday–Sunday?"
- "You bought a gym membership and a couch. Pick one."
- "This feeds your training for exactly two days. The other five are vibes."

THE BAR: every line must be screenshot-worthy AND defensible to a registered dietitian reading it. Both, always.

${fitContext}

Respond ONLY with valid JSON — no markdown, no preamble, no code fence:
{
  "kind": "meal" | "haul",
  "verdict_line": "ONE punchy Kristy sentence, max ~120 characters — the headline that lands. Cost-framed, goal-relative, quotable.",
  "breakdown": ["2-4 short observations: what's working, what's dead weight (cost-framed), and ONE specific swap. Each under ~90 chars."],
  "fit": {
    "summary": "the goal-fit readout — see the FIT instruction above",
    "stats": ["2-3 short gold-callout stats, e.g. '182g total protein', '~3 days of your protein target', 'protein-forward'"]
  },
  "items": [{ "name": "short item name", "est_calories": 0, "est_protein_g": 0 }]
}

Estimate items honestly from what you can see; round calories and protein to whole numbers. If portions are uncertain, still give your best read — the verdict is the product, not decimal precision.`.trim();
}

/* ───────────────────────── Fit context (authed vs guest) ───────────────────────── */
function buildFitContext({ isGuest, profile, goals }) {
  if (isGuest) {
    return [
      'THIS IS A GUEST — not signed in, no stored profile, no targets on file.',
      'Give a general performance-nutrition read with the SAME teeth: protein density vs. calories, dead weight by caloric cost, satiety, one swap.',
      `The "fit.summary" MUST end with EXACTLY this sentence, verbatim: "${GUEST_HOOK}"`,
      'fit.stats are general reads ("protein-forward", "~1,900 kcal on the plate", "low fiber for the calories") — no personal-target references, since you have none.',
    ].join('\n');
  }

  const g = goals || {};
  const p = profile || {};
  const targetLines = [
    `Daily targets on file: ${round(g.calories)} kcal | ${round(g.protein)}g protein | ${round(g.carbs)}g carbs | ${round(g.fat)}g fat.`,
    `Goal: ${goalLabel(p.goal)}.`,
  ];
  return [
    "THIS USER IS SIGNED IN — read the photo against their ACTUAL stored numbers below. Reference the real numbers, don't invent targets.",
    ...targetLines,
    'Compute fit against these: for a haul, estimate total protein across the items and express it as days of their protein target (days ≈ total protein ÷ daily protein target) and/or days of calories. For a meal, express it as a share of today\'s targets (e.g. "38% of your protein for the day in one plate").',
    'fit.summary is that goal-fit readout in your voice, referencing their real target numbers. fit.stats are 2-3 gold callouts derived from the same math ("182g total protein", "~3 of your 7 protein days", "covers ~1.5 days of calories").',
  ].join('\n');
}

/* ───────────────────────── Parse + validate ───────────────────────── */
export function parseVerdictJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first !== -1 && last !== -1) raw = raw.slice(first, last + 1);
  }

  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }

  const verdict_line = str(obj.verdict_line);
  if (!verdict_line) return null; // the headline is the product — no line, retry

  const kind = obj.kind === 'meal' || obj.kind === 'haul' ? obj.kind : 'meal';

  const breakdown = (Array.isArray(obj.breakdown) ? obj.breakdown : [])
    .map(str)
    .filter(Boolean)
    .slice(0, 4);

  const fitObj = obj.fit && typeof obj.fit === 'object' ? obj.fit : {};
  const fit = {
    summary: str(fitObj.summary),
    stats: (Array.isArray(fitObj.stats) ? fitObj.stats : [])
      .map(str)
      .filter(Boolean)
      .slice(0, 3),
  };

  const items = (Array.isArray(obj.items) ? obj.items : [])
    .map((it) => ({
      name: str(it?.name),
      est_calories: round(it?.est_calories),
      est_protein_g: round(it?.est_protein_g),
    }))
    .filter((it) => it.name)
    .slice(0, 24);

  return { kind, verdict_line, breakdown, fit, items };
}

/* ───────────────────────── Pipeline ─────────────────────────
   One vision call → parse. On malformed output, ONE corrective retry, then a
   graceful Kristy-voiced error (thrown for the route to translate). */
async function callVision({ base64, mediaType, system, corrective }) {
  const userText = corrective
    ? 'Your previous reply was not valid JSON. Reply again with ONLY the JSON object described — no prose, no code fence.'
    : "Here's my photo — give me your verdict.";
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 900,
    system,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: userText },
        ],
      },
    ],
  });
  return completion.content?.[0]?.text || '';
}

/**
 * Run the verdict pipeline.
 * @param {{ base64:string, mediaType:string, isGuest?:boolean, profile?:object, goals?:object }} args
 * @returns {Promise<{kind,verdict_line,breakdown,fit,items}>}
 */
export async function runVerdict({ base64, mediaType = 'image/jpeg', isGuest = false, profile = null, goals = null }) {
  const fitContext = buildFitContext({ isGuest, profile, goals });
  const system = buildVerdictSystem({ isGuest, fitContext });

  let text = await callVision({ base64, mediaType, system, corrective: false });
  let verdict = parseVerdictJSON(text);
  if (!verdict) {
    text = await callVision({ base64, mediaType, system, corrective: true });
    verdict = parseVerdictJSON(text);
  }
  if (!verdict) {
    // Both attempts malformed — let the route render Kristy's voiced error.
    throw new Error('verdict-unparseable');
  }

  // Guarantee the guest hook is present and exact (belt-and-suspenders on RULE 2
  // for guests — the funnel depends on this line).
  if (isGuest) {
    const s = verdict.fit.summary || '';
    if (!s.includes(GUEST_HOOK)) {
      verdict.fit.summary = (s ? `${s} ` : '') + GUEST_HOOK;
    }
  }

  return verdict;
}
