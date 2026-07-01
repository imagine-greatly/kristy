// TDEE + macro-target engine. Pure functions: given a user's onboarding
// profile, compute their daily calorie and macro goals the way a performance
// nutritionist would — protein first, calories tuned to the goal, carbs
// auto-filling the rest. Used by the onboarding route to seed user_goals.

const LB_PER_KG = 2.2046226218;
const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

/** Weight → pounds from a {value, unit} pair (unit: 'lbs' | 'kg'). */
export function toLbs(value, unit) {
  const v = Number(value) || 0;
  return unit === 'kg' ? v * LB_PER_KG : v;
}

/** Weight → kilograms. */
export function toKg(value, unit) {
  const v = Number(value) || 0;
  return unit === 'kg' ? v : v * KG_PER_LB;
}

/** Height → centimeters from a {value, unit} pair (unit: 'cm' | 'in'). */
export function toCm(value, unit) {
  const v = Number(value) || 0;
  return unit === 'in' ? v * CM_PER_IN : v;
}

// Training days/week → Mifflin-St Jeor activity factor.
const ACTIVITY = {
  '0-1': 1.3,
  '2-3': 1.45,
  '4-5': 1.6,
  '6-7': 1.75,
};
const DEFAULT_ACTIVITY = 1.45;

// Extra fuel for sports with high energy turnover, applied on top of the
// goal's calorie target. Everything not listed gets no adjustment
// (team_sports, strength, calisthenics, martial_arts, general, mixed).
const SPORT_KCAL = {
  endurance: 150,
  crossfit: 100,
};

// Per-goal calorie offset vs maintenance (kcal) + protein/fat multipliers
// (grams per lb of bodyweight). Protein leads every goal.
const GOAL_PLAN = {
  recomp: { kcal: 0, protein: 1.1, fat: 0.35 },
  performance: { kcal: 100, protein: 1.1, fat: 0.35 },
  lose_fat: { kcal: -300, protein: 1.1, fat: 0.35 },
  build_muscle: { kcal: 250, protein: 1.1, fat: 0.35 },
  just_track: { kcal: 0, protein: 0.8, fat: 0.3 },
};
const DEFAULT_GOAL = 'just_track';

/**
 * Mifflin-St Jeor basal metabolic rate.
 * sex: 'male' | 'female' (anything else → sex-neutral midpoint).
 */
export function bmr({ kg, cm, age, sex }) {
  const base = 10 * kg + 6.25 * cm - 5 * (Number(age) || 0);
  if (sex === 'male') return base + 5;
  if (sex === 'female') return base - 161;
  return base - 78; // neutral midpoint between the male/female constants
}

/** Total daily energy expenditure — maintenance calories. */
export function computeTDEE(profile = {}) {
  const kg = toKg(profile.weight_value, profile.weight_unit);
  const cm = toCm(profile.height_value, profile.height_unit);
  const factor = ACTIVITY[profile.training_frequency] ?? DEFAULT_ACTIVITY;
  return Math.round(bmr({ kg, cm, age: profile.age, sex: profile.sex }) * factor);
}

/**
 * Turn a full profile into daily macro targets.
 * @returns {{calories:number,protein:number,carbs:number,fat:number,tdee:number}}
 */
export function computeGoals(profile = {}) {
  const tdee = computeTDEE(profile);
  const plan = GOAL_PLAN[profile.goal] || GOAL_PLAN[DEFAULT_GOAL];
  const lbs = toLbs(profile.weight_value, profile.weight_unit);
  const sportKcal = SPORT_KCAL[profile.sport] || 0;

  // Calorie target = maintenance + goal offset + sport adjustment.
  // Floor at 1200 so bad/sparse inputs never produce an extreme target.
  const calories = Math.max(1200, Math.round(tdee + plan.kcal + sportKcal));

  const protein = Math.round(lbs * plan.protein);
  const fat = Math.round(lbs * plan.fat);

  // Carbs auto-fill whatever calories remain after protein + fat.
  const remaining = calories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(remaining / 4));

  return { calories, protein, carbs, fat, tdee };
}
