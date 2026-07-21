// The verdict ramp — severity → color/label, evidence-tier labels, and the flag
// sort. Single-sourced here so the scan card and the ingredient page never drift.
// Colors come straight from the locked token palette (green → gold → red).

import { colors } from './tokens.js';

export const SEV_RANK = { critical: 4, high: 3, moderate: 2, flag: 1 };

// Severity dot color, on the existing verdict ramp: calm green → gold → alarm red.
// Four severities need four steps — moderate takes the muted gold so it reads as a
// dimmer version of high rather than an identical dot. The card is meant to scan
// like a receipt of concerns, which only works if the dots are actually separable.
export function severityColor(sev) {
  switch (sev) {
    case 'critical':
      return colors.error;
    case 'high':
      return colors.accentGold;
    case 'moderate':
      return colors.accentGoldMuted;
    case 'flag':
    default:
      return colors.accentSeafoam;
  }
}

export const SEVERITY_LABEL = {
  critical: 'Skip always',
  high: 'Strong case to avoid',
  moderate: 'Worth knowing',
  flag: 'On the radar',
};

// evidence_tier → the small tag shown on rows + the detail page.
export const EVIDENCE_LABEL = {
  established: 'Established',
  credible_concern: 'Credible concern',
  kristys_standard: "Kristy's standard",
  time_tested: 'Time-tested',
};

// The Time-tested tier is the one POSITIVE register: it affirms a whole food on
// its history rather than grading a concern. It never renders in a warning color
// — a mint dot on the approved side of the palette, never gold or red.
export const AFFIRMING_TIER = 'time_tested';
export const affirmationColor = () => colors.accentSeafoam;

// What the tier means, in plain words, wherever it's shown. The honesty IS the
// feature: history is the evidence, and we say so rather than implying a study.
export const AFFIRMATION_MEANING = 'Backed by history, not a lab — and I’ll say so.';

// Her register line for an affirmed whole food. A food-worth affirmation only —
// never a health outcome, no matter how old the food is.
export const AFFIRMATION_CALL = 'People have eaten this for a very long time.';

// Her verdict register line keyed to severity — editorial, in her voice, NOT a
// health claim (used as a fallback when the KB entry carries no verdict framing).
export const SEVERITY_CALL = {
  critical: 'I skip this one, every time.',
  high: "I'd put this back.",
  moderate: "Know it's here — it comes down to how often.",
  flag: 'Not an alarm — just worth seeing.',
};

// Sort a universal layer for display: focus-relevant first (when a focus fired,
// derived from the engine's signal names), then worst severity first, stable.
export function sortFlags(layer = [], signals = null) {
  const rel = new Set();
  if (signals) {
    for (const arr of [signals.glycemicHigh, signals.cardiovascular, signals.sugarAliases]) {
      (Array.isArray(arr) ? arr : []).forEach((n) => rel.add(String(n)));
    }
  }
  return layer
    .map((it, i) => ({ it, i, r: rel.has(it.name) ? 1 : 0, s: SEV_RANK[it.severity] || 0 }))
    .sort((a, b) => b.r - a.r || b.s - a.s || a.i - b.i)
    .map((x) => x.it);
}
