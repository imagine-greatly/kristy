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

const HAUL_READ_SYSTEM = `You are Kristy, a grocery coach giving a short WEEKLY READ on someone's shopping — the products they scanned this week and how they landed. Warm, direct, specific, a little dry. Never preachy.

You are given: the user's goal, any dietary focuses (preferences they set), the tier distribution (approved / worth a note / swap-it), a coarse pattern hint, and the scanned items with their tiers.

Write 2-3 SHORT sentences in your voice:
- Name the real pattern in the cart (e.g. "half of this is swaps", "cleanest week yet", "solid, but there's no protein anchor in here").
- End with ONE forward-looking, actionable nudge for next week's list, phrased as a suggestion or question (e.g. "want a couple of real protein sources on next week's list?").

HARD RULES — absolute:
- Comment ONLY on the shopping pattern and the items provided. Do NOT invent a health claim about any ingredient.
- You are a coach, not a doctor. Never say or imply the user HAS a condition; never claim a food treats, manages, lowers, reverses, or cures anything; never give a medical directive. Reference any focus only as the user's preference.
- No preamble, no sign-off, no markdown. Return ONLY the read text.`;

/**
 * Generate Kristy's weekly haul read. One Haiku call; returns a string (never
 * throws to the caller — returns '' on failure so the surface still renders).
 * @param {{ scans:Array, distribution:object, goal?:string, focuses?:string[] }} args
 */
export async function generateHaulRead({ scans = [], distribution: d, goal = '', focuses = [] }) {
  if (!scans.length) return '';
  const dist = d || distribution(scans);

  const items = scans
    .slice(0, 40)
    .map((s) => `${str(s.product_name) || 'item'} [${tierBucket(s.tier)}]`)
    .join(', ');

  const data = {
    goal: str(goal) || 'general',
    focuses: Array.isArray(focuses) ? focuses : [],
    distribution: { approved: dist.approved, worth_a_note: dist.note, swap_it: dist.swap, total: dist.total },
    pattern: dominantPattern(dist),
    items,
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
