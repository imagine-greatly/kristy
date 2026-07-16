// The grocery-coach goal + non-negotiables config (Step 6). Deliberately
// config-driven so the onboarding renders from these arrays — the optional
// "dietary focuses" multi-select is appended by a later step as another array +
// step descriptor, with NO change to the onboarding component itself.

// Primary goals. `noteLabel` is the human phrase fed to /verdict (and shown as
// "for your <noteLabel>"); `chipLabel` is the compact header-chip text; `payoff`
// is Kristy's goal-voiced first-scan reaction — preference framing, never a
// health/ingredient claim (that stays with the KB + claim lock).
export const COACH_GOALS = [
  {
    value: 'cut',
    chipLabel: 'Cut',
    title: 'Cut',
    noteLabel: 'cut',
    blurb: 'Lean out — protein up, empty calories out.',
    payoff: "On a cut I'm ruthless about liquid calories and hidden sugar. Hand me a label and watch me work.",
  },
  {
    value: 'recomp',
    chipLabel: 'Recomp',
    title: 'Recomp',
    noteLabel: 'recomp',
    blurb: 'Build and trim at once — quality every trip.',
    payoff: "Recomp is a quality game. I'll push protein density and flag the dead weight in your cart.",
  },
  {
    value: 'performance',
    chipLabel: 'Performance',
    title: 'Performance',
    noteLabel: 'performance',
    blurb: 'Fuel the work — real food, real output.',
    payoff: "Performance means clean fuel. I'll tell you what feeds the work and what just fills the cart.",
  },
  {
    value: 'energy',
    chipLabel: 'Energy',
    title: 'Steady energy',
    noteLabel: 'steady energy',
    blurb: 'No 3pm crash — even fuel all day.',
    payoff: "Steady energy is about what spikes you and what doesn't. I'll steer you toward the even burn.",
  },
  {
    value: 'gut_health',
    chipLabel: 'Gut health',
    title: 'Gut health',
    noteLabel: 'gut health',
    blurb: 'Feed the gut — fewer additives, more whole food.',
    payoff: "For your gut I get picky about additives and emulsifiers. I'll point you at the cleaner shelf.",
  },
];

// The existing non-negotiables (kept). Preference framing only.
export const NON_NEGOTIABLES = [
  { value: 'no seed oils', label: 'No seed oils' },
  { value: 'no artificial sweeteners', label: 'No artificial sweeteners' },
  { value: 'dairy-free', label: 'Dairy-free' },
];

const byValue = (value) => COACH_GOALS.find((g) => g.value === value) || null;

/** The phrase fed to /verdict + shown as "for your <…>". Falls back to the raw value. */
export function goalNoteLabel(value) {
  return byValue(value)?.noteLabel || (value ? String(value) : '');
}

/** The compact header-chip label. '' when no goal is set. */
export function goalChipLabel(value) {
  return byValue(value)?.chipLabel || '';
}

/** Kristy's goal-voiced first-scan payoff line. */
export function goalPayoff(value) {
  return byValue(value)?.payoff || '';
}
