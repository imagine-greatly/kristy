// The Haul — aggregation over a user's scans, plus Kristy's weekly read. The read
// reuses the weekly-summary pattern (one claim-locked Haiku call, in Kristy's
// voice) repointed at HAUL data instead of meals, and mirrors the proactive-
// insight idea (a forward-looking nudge for next week's list).
//
// Claim lock / no-treatment: the read comments only on the SHOPPING PATTERN and
// the scanned items it is given — it never invents an ingredient health claim,
// never states the user has a condition, never claims to treat one. Focuses are
// referenced only as the user's stated preference.

import { anthropic, MODEL } from './anthropic.js';

const str = (x) => String(x ?? '').trim();

// Five verdict tiers collapse into the three haul buckets shown on the bar.
export function tierBucket(tier) {
  if (tier === 'approved') return 'approved';
  if (tier === 'approved_with_note' || tier === 'use_with_intention') return 'note';
  return 'swap'; // swap_recommended | skip
}

/** Distribution counts over a list of scans. Deterministic; drives the bar. */
export function distribution(scans = []) {
  const d = { approved: 0, note: 0, swap: 0, total: 0 };
  for (const s of scans) {
    d[tierBucket(s.tier)] += 1;
    d.total += 1;
  }
  return d;
}

// A coarse deterministic pattern hint so the read is grounded, not vague.
function dominantPattern(d) {
  if (d.total === 0) return 'empty';
  const r = (n) => n / d.total;
  if (r(d.swap) >= 0.5) return 'mostly_swaps';
  if (r(d.approved) >= 0.6) return 'mostly_clean';
  return 'mixed';
}

/* ───────── The loop back into the next trip ─────────
   A haul is only worth reading if it changes the next cart. This computes that
   hand-off DETERMINISTICALLY, from data that already exists — the scans they kept
   and the cart rows they never checked off. No model call, and every name is one
   the shopper or the engine already produced, so nothing here can author a claim.

     keep     — scanned, and she had no objection → worth repeating
     replace  — scanned, but she'd have picked differently → offered, never assumed
     missed   — on the cart and never checked off → "you skipped fish again"

   `replace` is deliberately NOT selected by default: carrying a product she flagged
   into next week without being asked would be putting words in the shopper's mouth. */
const KEEP_TIERS = new Set(['approved', 'approved_with_note', 'use_with_intention']);

export function buildCarryForward({ scans = [], cartItems = [] } = {}) {
  const seen = new Set();
  const once = (name) => {
    const k = str(name).toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  };

  const keep = [];
  const replace = [];
  for (const s of scans) {
    const name = str(s.product_name);
    if (!name || !once(name)) continue;
    (KEEP_TIERS.has(s.tier) ? keep : replace).push({ name, tier: s.tier });
  }

  // Cart rows they walked past. Kristy's own swap callouts aren't groceries, and a
  // scanned row is by definition something they picked up — neither is a "miss".
  const missed = [];
  for (const it of cartItems) {
    if (it?.checked || it?.source === 'swap' || it?.source === 'scan') continue;
    const name = str(it?.name);
    if (name && once(name)) missed.push({ name });
  }

  return { keep, replace, missed };
}

/** The carry-forwards the shopper accepted → cart rows for the next trip. */
export function seedNextCart(accepted = []) {
  const seen = new Set();
  const items = [];
  for (const name of accepted) {
    const clean = str(name).slice(0, 140);
    const k = clean.toLowerCase();
    if (!clean || seen.has(k)) continue;
    seen.add(k);
    items.push({ name: clean, category: 'From your haul', checked: false, source: 'user' });
  }
  return items;
}

const HAUL_READ_SYSTEM = `You are Kristy, a grocery coach giving a short WEEKLY READ on someone's shopping — the products they scanned this week and how they landed. Warm, direct, specific, a little dry. Never preachy.

You are given: the user's goals, any dietary focuses (preferences they set), their hard lines, their constraints, the tier distribution (approved / worth a note / swap-it), a coarse pattern hint, and the scanned items with their tiers.

Write 2-3 SHORT sentences in your voice:
- Name the real pattern in the cart (e.g. "half of this is swaps", "cleanest week yet", "solid, but there's no protein anchor in here").
- End with ONE forward-looking, actionable nudge for next week's list, phrased as a suggestion or question (e.g. "want a couple of real protein sources on next week's list?"). If "skipped" is non-empty, that is the honest nudge — name the thing they keep walking past and offer a concrete version of it next week ("the fish never made it in again — want wild sardines on next week's list?").

HARD RULES — absolute:
- Comment ONLY on the shopping pattern and the items provided. Do NOT invent a health claim about any ingredient.
- NO CALORIE OR MACRO ACCOUNTING, ever — not numbers, not qualitative asides ("good protein hit", "keeps the carbs reasonable"). This is a read on WHAT THEY BOUGHT, not a nutrition tally.
- READ AGAINST THEIR OWN STANDARD, not a generic one. Judge the haul by the goals, focuses, hard lines and constraints you were given. If their lens is whole-food / holistic (grass-fed, pasture-raised, raw dairy, minimally processed), read the week in those terms — how close the real thing came to the industrial version — never in generic macro terms. If they shop on a budget, read it in cheaper-per-nutrition terms. Their standard is the measuring stick.
- NO PRICE, and never invent a brand.
- You are a coach, not a doctor. Never say or imply the user HAS a condition; never claim a food treats, manages, lowers, reverses, or cures anything; never give a medical directive. Reference any focus only as the user's preference.
- VOICE — EGOLESS AUTHORITY, NOT SERVICE. State the read; never narrate helping. NEVER write "I'll keep an eye on that for you", "let me help you fix it", "I've got you", "happy to", or any line announcing that you are performing a service. Name the pattern flat — "Half of this is swaps." / "Cleanest week yet." / "There's no protein anchor in here." KEEP first person where you're STAKING A POSITION ("here's my read", "I'd swap those two"); cut it where it's doing a job for them.
- No preamble, no sign-off, no markdown. Return ONLY the read text.`;

/**
 * Generate Kristy's weekly haul read. One Haiku call; returns a string (never
 * throws to the caller — returns '' on failure so the surface still renders).
 * @param {{ scans:Array, distribution:object, goal?:string, focuses?:string[] }} args
 */
export async function generateHaulRead({
  scans = [],
  distribution: d,
  goal = '',
  goals = [],
  focuses = [],
  hardLines = [],
  constraints = [],
  missed = [],
}) {
  if (!scans.length) return '';
  const dist = d || distribution(scans);

  const items = scans
    .slice(0, 40)
    .map((s) => `${str(s.product_name) || 'item'} [${tierBucket(s.tier)}]`)
    .join(', ');

  const arr = (v) => (Array.isArray(v) ? v : []);
  const goalSet = arr(goals).length ? arr(goals) : goal ? [str(goal)] : [];
  const data = {
    goals: goalSet.length ? goalSet : ['general'],
    focuses: arr(focuses),
    hardLines: arr(hardLines),
    constraints: arr(constraints),
    distribution: { approved: dist.approved, worth_a_note: dist.note, swap_it: dist.swap, total: dist.total },
    pattern: dominantPattern(dist),
    items,
    // What was on the cart and never picked up — the source of the honest
    // "you skipped fish again" nudge, rather than a generic one.
    skipped: arr(missed).slice(0, 12).map((m) => str(m?.name || m)).filter(Boolean),
  };

  try {
    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 220,
      temperature: 0.5,
      system: HAUL_READ_SYSTEM,
      messages: [{ role: 'user', content: `DATA:\n${JSON.stringify(data)}` }],
    });
    return str(completion.content?.[0]?.text || '');
  } catch (err) {
    console.error('[kristy] generateHaulRead error:', err?.message || err);
    return '';
  }
}
