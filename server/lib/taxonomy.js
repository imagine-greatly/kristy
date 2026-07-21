// The canonical preference taxonomy, server-side.
//
// This is the ENUMERABLE set the free-text interpreter is allowed to produce. It
// mirrors the labels in client/src/lib/coachGoals.js — that file owns the UI copy
// (blurbs, payoffs, chip text), this one owns the ids the engine and the mapper
// agree on. Keep the id lists in sync; the client file carries the same warning.
//
// Why an enum at all: natural language goes IN, but nothing free-form comes OUT.
// The model may only select from these values, so a user can never talk Kristy
// into a health rule that isn't already a preference the engine knows how to act
// on. That is what keeps the free-text path claim-lock-safe.

import { HARD_LINE_RULES } from './hardLines.js';

export const GOALS = [
  { value: 'eating_cleaner', label: 'Eating cleaner' },
  { value: 'high_protein', label: 'High-protein' },
  { value: 'low_sugar', label: 'Low-sugar' },
  { value: 'family', label: 'Feeding a family' },
  { value: 'gut_health', label: 'Gut health' },
  { value: 'avoiding_junk', label: 'Avoiding the junk' },
  { value: 'weight_loss', label: 'Weight loss' },
  { value: 'muscle_strength', label: 'Muscle & strength' },
  { value: 'pregnancy_postpartum', label: 'Pregnancy & postpartum' },
  { value: 'athlete_performance', label: 'Athlete / performance' },
  { value: 'budget_clean', label: 'Budget-conscious clean eating' },
  { value: 'kids_snacks', label: "Kids' snacks & lunches" },
];

export const FOCUSES = [
  { value: 'lower_sugar', label: 'Watching added sugar' },
  { value: 'blood_sugar', label: 'Blood-sugar-conscious' },
  { value: 'lower_sodium', label: 'Watching sodium' },
  { value: 'heart', label: 'Heart-conscious' },
  { value: 'caffeine', label: 'Watching caffeine' },
  { value: 'higher_fiber', label: 'Higher fiber' },
  { value: 'processed_fats', label: 'Watching processed fats' },
  { value: 'additive_sensitive', label: 'Additive-sensitive (dyes & preservatives)' },
];

// Preset hard lines are exactly the keys hardLines.js knows how to match, so the
// two can never drift into a line the UI offers but the engine ignores.
export const HARD_LINES = Object.entries(HARD_LINE_RULES).map(([value, rule]) => ({
  value,
  label: rule.label,
  advisory: !!rule.advisory,
}));

export const GOAL_VALUES = GOALS.map((g) => g.value);
export const FOCUS_VALUES = FOCUSES.map((f) => f.value);
export const HARD_LINE_VALUES = HARD_LINES.map((h) => h.value);

export const labelForGoal = (v) => GOALS.find((g) => g.value === v)?.label || '';
export const labelForFocus = (v) => FOCUSES.find((f) => f.value === v)?.label || '';
export const labelForHardLine = (v) => HARD_LINES.find((h) => h.value === v)?.label || '';
