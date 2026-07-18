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
];

// Legacy coach_goal values from before the reposition. Existing rows may still hold
// these; map them onto the closest new goal so no fitness word ever leaks into the
// UI (the resolvers below go through this). New picks always write a new value.
const LEGACY_ALIASES = {
  cut: 'eating_cleaner',
  recomp: 'high_protein',
  performance: 'high_protein',
  energy: 'low_sugar',
  'steady energy': 'low_sugar',
};

// The existing non-negotiables (kept). Preference framing only.
export const NON_NEGOTIABLES = [
  { value: 'no seed oils', label: 'No seed oils' },
  { value: 'no artificial sweeteners', label: 'No artificial sweeteners' },
  { value: 'dairy-free', label: 'Dairy-free' },
];

// Dietary focuses (extension Part B). Self-selected preferences the user turns on
// about themselves — never pre-checked, never inferred. Labels are EXACT and
// preference-framed (no condition names). Values are the engine's focus keys.
export const FOCUSES = [
  { value: 'lower_sugar', label: 'Lower sugar' },
  { value: 'blood_sugar', label: 'Blood-sugar-conscious' },
  { value: 'lower_sodium', label: 'Lower sodium' },
  { value: 'heart', label: 'Heart-conscious' },
];

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
