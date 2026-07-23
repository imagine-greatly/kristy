// The grocery-coach goal + non-negotiables config (Step 6). Deliberately
// config-driven so the onboarding renders from these arrays — the optional
// "dietary focuses" multi-select is appended by a later step as another array +
// step descriptor, with NO change to the onboarding component itself.

// Primary goals — the SHOPPING register (grocery-coach reposition). These are what
// the user is shopping FOR, tapped contextually (in the verdict card or the chip
// switcher), never a fitness intake at the door.
//   noteLabel  — the natural phrase fed to /verdict, referenced in Kristy's note.
//   readLabel  — the phrase shown on the card as "for your <readLabel>".
//   chipLabel  — the compact header-chip text.
//   title      — the one-tap picker label.
//   payoff     — Kristy's goal-voiced reaction (preference framing, never a
//                health/ingredient claim — that stays with the KB + claim lock).
export const COACH_GOALS = [
  {
    value: 'eating_cleaner',
    chipLabel: 'Eating cleaner',
    title: 'Eating cleaner',
    noteLabel: 'eating cleaner',
    readLabel: 'clean eating',
    blurb: 'Fewer additives, more real food.',
    payoff: "Eating cleaner means fewer mystery ingredients. Hand me a label and I'll tell you what's real and what's filler.",
  },
  {
    value: 'high_protein',
    chipLabel: 'High-protein',
    title: 'High-protein',
    noteLabel: 'high-protein shopping',
    readLabel: 'high-protein shopping',
    blurb: "Protein that pulls its weight, every trip.",
    payoff: "Shopping high-protein? I'll tell you fast whether a product's pulling its weight or just taking up cart space.",
  },
  {
    value: 'low_sugar',
    chipLabel: 'Low-sugar',
    title: 'Low-sugar',
    noteLabel: 'keeping added sugar down',
    readLabel: 'low-sugar shopping',
    blurb: 'Keep the added sugar out of the cart.',
    payoff: "Keeping sugar down — I'll catch the added sugar hiding under ten different names so you don't have to.",
  },
  {
    value: 'family',
    chipLabel: 'Family',
    title: 'Feeding a family',
    noteLabel: 'feeding your family',
    readLabel: 'family',
    blurb: "What ends up in everyone's pantry.",
    payoff: "Feeding a family means what ends up in everyone's pantry. I'll help you fill the cart with stuff the whole house is better off with.",
  },
  {
    value: 'gut_health',
    chipLabel: 'Gut health',
    title: 'Gut health',
    noteLabel: 'gut health',
    readLabel: 'gut health',
    blurb: 'Feed the gut — fewer additives, more whole food.',
    payoff: "For your gut I get picky about additives and emulsifiers. I'll point you at the cleaner shelf.",
  },
  {
    value: 'avoiding_junk',
    chipLabel: 'Avoiding junk',
    title: 'Avoiding the junk',
    noteLabel: 'avoiding the junk',
    readLabel: 'junk-free cart',
    blurb: 'Skip the ultra-processed stuff.',
    payoff: "Avoiding the junk — I'll flag the ultra-processed stuff on sight and point you to a better pick.",
  },
  {
    value: 'weight_loss',
    chipLabel: 'Weight loss',
    title: 'Weight loss',
    noteLabel: 'losing weight',
    readLabel: 'weight loss',
    blurb: 'Food that fills you up, not out.',
    payoff: "Losing weight starts in the cart. I'll steer you toward the stuff that actually keeps you full.",
  },
  {
    value: 'muscle_strength',
    chipLabel: 'Muscle',
    title: 'Muscle & strength',
    noteLabel: 'building muscle',
    readLabel: 'muscle & strength',
    blurb: 'Protein first, quality close behind.',
    payoff: "Building strength — I'll check the protein's real and the rest of the label isn't undoing it.",
  },
  {
    value: 'pregnancy_postpartum',
    chipLabel: 'This season',
    title: 'Pregnancy & postpartum',
    noteLabel: 'being extra careful this season',
    readLabel: 'this season',
    blurb: "Extra careful, for a season.",
    // Preference framing ONLY. Never implies a medical state, never advises.
    payoff: "You want to be extra careful right now — I'll hold a tighter line on additives. For anything medical, your doctor and a dietitian, not me.",
  },
  {
    value: 'athlete_performance',
    chipLabel: 'Performance',
    title: 'Athlete / performance',
    noteLabel: 'eating for performance',
    readLabel: 'performance',
    blurb: 'Fuel that earns its place.',
    payoff: "Eating for performance — I'll tell you fast whether something's real fuel or just marketed that way.",
  },
];

// Legacy coach_goal values. Existing rows may still hold these; map them onto the
// closest current goal so no retired/fitness word ever leaks into the UI (the
// resolvers below go through this). New picks always write a current value.
//   budget_clean / kids_snacks were RETIRED as goals — they're circumstances, not
//   directions — and are now goal=eating_cleaner + a constraint (see resolveConstraints
//   + CONSTRAINTS below). The goal half maps here; the constraint half is injected there.
const LEGACY_ALIASES = {
  cut: 'eating_cleaner',
  recomp: 'high_protein',
  performance: 'high_protein',
  energy: 'low_sugar',
  'steady energy': 'low_sugar',
  budget_clean: 'eating_cleaner',
  kids_snacks: 'eating_cleaner',
};

// Hard lines — the user's declared absolutes. `value` is the string the server's
// hardLines.js matches on, so these ids must stay in sync with HARD_LINE_RULES
// there (that module owns the KB selectors; this one owns the labels).
//
// `advisory: true` means the KB carries no data to check it — gluten and dairy are
// not in an additive database. Those still reach the note as context, but nothing
// claims to enforce them, because pretending to check something we can't check is
// the same failure as inventing a concern.
export const NON_NEGOTIABLES = [
  { value: 'no seed oils', label: 'No seed oils' },
  { value: 'no artificial sweeteners', label: 'No artificial sweeteners' },
  { value: 'no artificial dyes', label: 'No artificial dyes' },
  { value: 'no hfcs', label: 'No HFCS' },
  { value: 'no carrageenan', label: 'No carrageenan' },
  { value: 'no added nitrites', label: 'No added nitrites' },
  { value: 'no palm oil', label: 'No palm oil' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'dairy-free', label: 'Dairy-free', advisory: true },
  { value: 'gluten-free', label: 'Gluten-free', advisory: true },
];

// Dietary focuses (extension Part B). Self-selected preferences the user turns on
// about themselves — never pre-checked, never inferred. Labels are EXACT and
// preference-framed (no condition names). Values are the engine's focus keys, and
// every one of them is backed by a real KB category or a real nutrition field —
// see FOCUS in server/lib/verdictEngine.js. A chip that escalated nothing would
// be a preference the app pretends to hold.
export const FOCUSES = [
  { value: 'lower_sugar', label: 'Watching added sugar' },
  { value: 'blood_sugar', label: 'Blood-sugar-conscious' },
  { value: 'lower_sodium', label: 'Watching sodium' },
  { value: 'heart', label: 'Heart-conscious' },
  { value: 'caffeine', label: 'Watching caffeine' },
  { value: 'higher_fiber', label: 'Higher fiber' },
  { value: 'processed_fats', label: 'Watching processed fats' },
  { value: 'additive_sensitive', label: 'Additive-sensitive' },
];

// Constraints (fourth preference dimension) — the real-life circumstances of the
// person shopping: budget, time, kids, kitchen, portions. Orthogonal to goals and
// focuses; they compose freely with both (high-protein AND on a budget AND short on
// time at once). Multi-select, optional, never pre-checked. They shape the List and
// the note's emphasis, and NEVER move a verdict — so they carry no health claim.
// Values mirror server/lib/taxonomy.js CONSTRAINTS; keep them in sync.
export const CONSTRAINTS = [
  { value: 'budget', label: 'Shopping on a budget', blurb: 'Stretch the cart without eating garbage.' },
  { value: 'short_on_time', label: 'Short on time', blurb: 'Little or no cooking. Fast wins.' },
  { value: 'picky_kids', label: 'Picky kids', blurb: 'It has to actually get eaten.' },
  { value: 'no_kitchen', label: 'No real kitchen', blurb: 'Minimal equipment — dorm, office, small space.' },
  { value: 'cooking_for_one', label: 'Cooking for one', blurb: "Small portions, nothing that spoils before you finish it." },
];

// Section copy for the constraints picker (onboarding + switcher).
export const CONSTRAINTS_SECTION = {
  title: 'What are you working with?',
  sub: "Tell me your situation and I'll shop around it. Optional.",
};

// The two retired goals map to a constraint. When a stored profile still holds one of
// them, surface the matching constraint at read time so the List/note act on it without
// a data migration. Combines with any constraints the user set explicitly.
const RETIRED_GOAL_CONSTRAINT = { budget_clean: 'budget', kids_snacks: 'picky_kids' };

/** The user's active constraints, with the retired-goal constraint folded in. */
export function resolveConstraints(profile) {
  const cur = Array.isArray(profile?.constraints) ? profile.constraints : [];
  const inject = RETIRED_GOAL_CONSTRAINT[profile?.coach_goal];
  return inject && !cur.includes(inject) ? [...cur, inject] : cur;
}

/** A constraint's display label. '' for an unknown value. */
export const constraintLabel = (v) => CONSTRAINTS.find((c) => c.value === v)?.label || '';

// The one-time, in-voice disclaimer shown the first time ANY focus is turned on.
export const FOCUS_DISCLAIMER =
  "Quick honesty: I'm a coach, not your doctor. If you're managing something a doctor's already told you about, keep them and a dietitian in the loop — I'm here to help you shop smarter, not to treat anything.";

// Acknowledgement is stored per-device so the disclaimer shows once, then never again.
const ACK_KEY = 'kristy:focusDisclaimerAck';
export function focusDisclaimerAcked() {
  try {
    return localStorage.getItem(ACK_KEY) === '1';
  } catch {
    return false;
  }
}
export function ackFocusDisclaimer() {
  try {
    localStorage.setItem(ACK_KEY, '1');
  } catch {
    /* ignore */
  }
}

// First-run coach onboarding is shown to any signed-in user with no coach_goal.
// "Skip for now" is remembered per-user (per-device) so we don't re-prompt on every
// reload — the header goal chip remains the way to set a goal (and start the trial)
// later. Keyed by user id: a fresh device re-offers onboarding to a still-goal-less
// user, which is the behavior we want.
const COACH_ONB_SKIP_KEY = 'kristy:coachOnbSkipped';
export function coachOnboardingSkipped(userId) {
  try {
    return localStorage.getItem(`${COACH_ONB_SKIP_KEY}:${userId}`) === '1';
  } catch {
    return false;
  }
}
export function skipCoachOnboarding(userId) {
  try {
    localStorage.setItem(`${COACH_ONB_SKIP_KEY}:${userId}`, '1');
  } catch {
    /* ignore */
  }
}

const byValue = (value) =>
  COACH_GOALS.find((g) => g.value === value) ||
  COACH_GOALS.find((g) => g.value === LEGACY_ALIASES[value]) ||
  null;

/** The natural phrase fed to /verdict (the note's goal). Falls back to the raw value. */
export function goalNoteLabel(value) {
  return byValue(value)?.noteLabel || (value ? String(value) : '');
}

/** The phrase shown on the card as "for your <…>". Falls back to the note label. */
export function goalReadLabel(value) {
  const g = byValue(value);
  return g?.readLabel || g?.noteLabel || (value ? String(value) : '');
}

/** The compact header-chip label. '' when no goal is set. */
export function goalChipLabel(value) {
  return byValue(value)?.chipLabel || '';
}

/** Kristy's goal-voiced first-scan payoff line. */
export function goalPayoff(value) {
  return byValue(value)?.payoff || '';
}

/** One-tap picker options — the six goals as { value, label } (label = title).
 *  Shared by the in-card goal ask and the header chip's mode switcher. */
export function goalPickerOptions() {
  return COACH_GOALS.map((g) => ({ value: g.value, label: g.title }));
}
