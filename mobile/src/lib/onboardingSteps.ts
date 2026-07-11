// Kristy's onboarding flow — a short, conversational profile setup. Ported
// verbatim from the web client's onboardingSteps.js (typed). The collected
// answers are turned into the payload POSTed to /api/onboarding/full, where the
// server computes TDEE-based macro goals.

export interface StepOption {
  label: string;
  value: string;
}

export interface Step {
  id: string;
  type: 'text' | 'number' | 'measure' | 'chips' | 'multi';
  prompt: string;
  note?: string;
  placeholder?: string;
  error?: string;
  suffix?: string;
  min?: number;
  max?: number;
  options?: StepOption[];
  condition?: (d: Record<string, any>) => boolean;
  // measure
  valueKey?: string;
  unitKey?: string;
  defaultUnit?: string;
  units?: StepOption[];
  unitPrompt?: (value: any) => string;
}

export const STEPS: Step[] = [
  {
    id: 'name',
    type: 'text',
    prompt: "What's your name?",
    placeholder: 'Your name',
    error: 'What should I call you?',
  },
  {
    id: 'sex',
    type: 'chips',
    prompt: 'Biological sex — I need this for accurate targets.',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
    ],
  },
  {
    id: 'age',
    type: 'number',
    prompt: 'How old are you?',
    suffix: 'years',
    min: 13,
    max: 100,
    error: 'Just the number.',
  },
  {
    id: 'height',
    type: 'measure',
    prompt: 'Height?',
    valueKey: 'height_value',
    unitKey: 'height_unit',
    defaultUnit: 'in',
    units: [
      { label: 'in', value: 'in' },
      { label: 'cm', value: 'cm' },
    ],
    error: "Try something like 6'1 or 185cm.",
  },
  {
    id: 'weight',
    type: 'measure',
    prompt: 'Current weight?',
    valueKey: 'weight_value',
    unitKey: 'weight_unit',
    defaultUnit: 'lbs',
    units: [
      { label: 'lbs', value: 'lbs' },
      { label: 'kg', value: 'kg' },
    ],
    error: 'Just the number.',
    // Shown once a number is entered, if/when the unit step is split out.
    unitPrompt: (weight) => `${weight} — pounds or kilograms?`,
  },
  {
    id: 'goal',
    type: 'chips',
    prompt: 'What are you working toward?',
    options: [
      { label: 'Lose fat and build muscle', value: 'recomp' },
      { label: 'Drop body fat', value: 'lose_fat' },
      { label: 'Build muscle', value: 'build_muscle' },
      { label: 'Perform better', value: 'performance' },
      { label: 'Just track what I eat', value: 'just_track' },
    ],
  },
  {
    id: 'sport',
    type: 'chips',
    condition: (d) => d.goal !== 'just_track',
    prompt: 'What does your training look like?',
    options: [
      { label: 'Weightlifting / Strength', value: 'strength' },
      { label: 'Calisthenics / Gymnastics', value: 'calisthenics' },
      { label: 'Running / Endurance', value: 'endurance' },
      { label: 'CrossFit / HIIT', value: 'crossfit' },
      { label: 'Team sports', value: 'team_sports' },
      { label: 'Martial arts / Combat', value: 'martial_arts' },
      { label: 'General fitness', value: 'general' },
      { label: 'Mixed / Multiple', value: 'mixed' },
    ],
  },
  {
    id: 'training_frequency',
    type: 'chips',
    prompt: 'How often?',
    options: [
      { label: '0–1 days', value: '0-1' },
      { label: '2–3 days', value: '2-3' },
      { label: '4–5 days', value: '4-5' },
      { label: '6–7 days', value: '6-7' },
    ],
  },
  {
    id: 'eating_pattern',
    type: 'chips',
    prompt: 'How do you usually eat?',
    options: [
      { label: 'Standard — meals across the day', value: 'standard' },
      { label: 'Intermittent fasting (16:8)', value: 'if_16_8' },
      { label: 'One meal a day (OMAD)', value: 'omad' },
      { label: 'Flexible / it varies', value: 'flexible' },
    ],
  },
  {
    id: 'dietary_preferences',
    type: 'multi',
    prompt: 'Any dietary restrictions?',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Vegetarian', value: 'Vegetarian' },
      { label: 'Vegan', value: 'Vegan' },
      { label: 'Pescatarian', value: 'Pescatarian' },
      { label: 'Dairy-free', value: 'Dairy-free' },
      { label: 'Gluten-free', value: 'Gluten-free' },
      { label: 'Halal', value: 'Halal' },
      { label: 'Keto / low-carb', value: 'Keto / low-carb' },
    ],
  },
];

// Kristy's closing lines once onboarding finishes.
export const COMPLETION_MESSAGES = {
  quick:
    "Got it. Just tell me what you eat — I'll track everything. You can set targets anytime from the sidebar.",
  full:
    'Protein is the priority — hit that consistently and the rest follows. You can adjust these in the sidebar anytime.',
};

// Maps an eating-pattern choice to a human-readable label + (optional) window.
export const EATING_PATTERNS: Record<
  string,
  { label: string; start: string | null; end: string | null }
> = {
  standard: { label: 'Standard (meals across the day)', start: null, end: null },
  if_16_8: { label: 'Intermittent fasting (16:8)', start: '12:00', end: '20:00' },
  omad: { label: 'One meal a day (OMAD)', start: '17:00', end: '19:00' },
  flexible: { label: 'Flexible / varies', start: null, end: null },
};

/** Build the final payload sent to the onboarding API from collected step data. */
export function finalizePayload(d: Record<string, any>) {
  const pattern = EATING_PATTERNS[d.eating_pattern] || EATING_PATTERNS.flexible;
  const prefs = Array.isArray(d.dietary_preferences)
    ? d.dietary_preferences.filter((p: string) => p !== 'none')
    : [];

  return {
    name: (d.name || '').trim(),
    sex: d.sex || null,
    age: d.age != null && d.age !== '' ? Number(d.age) : null,
    height_value:
      d.height_value != null && d.height_value !== '' ? Number(d.height_value) : null,
    height_unit: d.height_unit || 'in',
    weight_value:
      d.weight_value != null && d.weight_value !== '' ? Number(d.weight_value) : null,
    weight_unit: d.weight_unit || 'lbs',
    goal: d.goal || 'just_track',
    sport: d.goal === 'just_track' ? null : d.sport || null,
    training_frequency: d.training_frequency || null,
    eating_pattern: pattern.label,
    eating_window_start: pattern.start,
    eating_window_end: pattern.end,
    dietary_preferences: prefs,
  };
}
