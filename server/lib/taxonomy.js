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
];

// CONSTRAINTS — the fourth preference dimension: the real-life realities of the
// person shopping. Orthogonal to goals (what you're shopping TOWARD) and focuses
// (health things to WATCH); they compose freely with both. A shopper can be
// high-protein AND on a budget AND short on time AND feeding picky kids at once —
// nothing here forces a choice between those. Constraints introduce NO health claim,
// so the claim lock is unaffected; they shape the LIST heavily and the note lightly,
// and NEVER move a verdict tier. Multi-select, optional, never pre-checked.
// TIME AND EQUIPMENT ARE DIFFERENT CONSTRAINTS, and collapsing them cost a real list.
// Measured 2026-08-05: the student persona's list was good only because they typed the
// words "one pan" into the trip question — nothing stored it, so trip two lost it. The
// nearest stored fact was `no_kitchen`, which means no kitchen AT ALL and is the wrong
// answer for someone with a hob and one pan; and `short_on_time` carried the equipment
// meaning too ("little or no cooking"), so one bit was doing two jobs.
//
// `one_pan` and `no_oven` are the equipment facts. There is deliberately NO "full kitchen"
// value: a constraints row holds things that CONSTRAIN, so a full kitchen is the absence of
// one — the same way "has a kitchen" was never a value beside `no_kitchen`. A chip meaning
// "nothing applies" is furniture, and the shopper still reaches all three states (one pan /
// no oven / neither).
export const CONSTRAINTS = [
  { value: 'budget', label: 'Shopping on a budget' },
  { value: 'short_on_time', label: 'Short on time' },
  { value: 'picky_kids', label: 'Picky kids' },
  { value: 'no_kitchen', label: 'No real kitchen' },
  { value: 'one_pan', label: 'One pan, one burner' },
  { value: 'no_oven', label: 'No oven' },
  { value: 'cooking_for_one', label: 'Cooking for one' },
];

// Two entries used to live as GOALS but were really constraints — a circumstance,
// not a shopping direction. They're resolved at READ TIME so existing rows need no
// data migration and no retired goal ever reaches the engine or UI: the goal maps to
// "Eating cleaner" and the matching constraint is switched on. ("Feeding a family"
// stays a goal — whose cart this is — while "picky kids" is a constraint on it.)
export const RETIRED_GOAL_CONSTRAINT = {
  budget_clean: 'budget',
  kids_snacks: 'picky_kids',
};

/** Resolve a stored (goal, constraints) pair, migrating the two retired goals. */
export function migratePreferences({ goal = null, constraints = [] } = {}) {
  const list = Array.isArray(constraints) ? [...constraints] : [];
  const inject = RETIRED_GOAL_CONSTRAINT[goal];
  if (inject && !list.includes(inject)) list.push(inject);
  return { goal: inject ? 'eating_cleaner' : goal || null, constraints: list };
}

/**
 * Resolve a stored GOAL SET (multi-select), migrating the two retired goals per
 * entry: each retired goal becomes eating_cleaner + its constraint. Deduped. Falls
 * back to [goal] when only the single coach_goal is present (pre-migration row).
 */
export function migrateGoalSet({ goals = [], goal = null, constraints = [] } = {}) {
  const src = Array.isArray(goals) && goals.length ? goals : goal ? [goal] : [];
  const outGoals = [];
  const cons = Array.isArray(constraints) ? [...constraints] : [];
  for (const g of src) {
    const inject = RETIRED_GOAL_CONSTRAINT[g];
    const mapped = inject ? 'eating_cleaner' : g;
    if (mapped && !outGoals.includes(mapped)) outGoals.push(mapped);
    if (inject && !cons.includes(inject)) cons.push(inject);
  }
  return { goals: outGoals, constraints: cons };
}

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
export const CONSTRAINT_VALUES = CONSTRAINTS.map((c) => c.value);

export const labelForGoal = (v) => GOALS.find((g) => g.value === v)?.label || '';
export const labelForFocus = (v) => FOCUSES.find((f) => f.value === v)?.label || '';
export const labelForHardLine = (v) => HARD_LINES.find((h) => h.value === v)?.label || '';
export const labelForConstraint = (v) => CONSTRAINTS.find((c) => c.value === v)?.label || '';
