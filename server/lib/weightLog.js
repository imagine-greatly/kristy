// Weight logging — Kristy's first optimization feature. Detects a weight log
// from a chat message, tracks the trend over time, and recalculates the
// calorie target when the trend drifts from the user's goal.

import {
  getFullProfile,
  insertWeightLog,
  getWeightHistory,
  updateUserGoals,
} from './store.js';

const round1 = (x) => Math.round(Number(x) * 10) / 10;

// Every spelling we accept, mapped to the canonical unit.
const WEIGHT_UNITS = {
  lb: 'lbs', lbs: 'lbs', pound: 'lbs', pounds: 'lbs',
  kg: 'kg', kgs: 'kg', kilo: 'kg', kilos: 'kg', kilogram: 'kg', kilograms: 'kg',
};
const UNIT_RE = '(lbs?|pounds?|kgs?|kilograms?|kilograms|kilos?|kilo)';

// Words that mean the number is about food or a goal, not a weigh-in.
// Guards the unit-less / bare-unit paths against false positives like
// "ate 200g chicken", "1 lb of beef", or "want to lose 20 lbs".
const NOT_A_WEIGHIN =
  /\b(ate|eat|eaten|eating|had|have|grams?|cals?|calories?|protein|carbs?|fat|of|lose|losing|lost|gain|gaining|gained|drop|dropped|goal|want|target|need|burn)\b|\bg\b/i;

/**
 * Turn a raw number + (optional) unit token into a validated weight log.
 * Infers the unit by magnitude when none is given (>100 → lbs, else kg) and
 * rejects values outside a plausible human bodyweight range.
 */
function build(rawValue, rawUnit) {
  const value = round1(rawValue);
  if (!value || value <= 0) return { isWeightLog: false };

  const unit = rawUnit
    ? WEIGHT_UNITS[String(rawUnit).toLowerCase()] || 'lbs'
    : value > 100
    ? 'lbs'
    : 'kg';

  // Sanity bounds — keeps stray numbers from being read as a weigh-in.
  if (unit === 'lbs' && (value < 50 || value > 700)) return { isWeightLog: false };
  if (unit === 'kg' && (value < 25 || value > 350)) return { isWeightLog: false };

  return { isWeightLog: true, value, unit };
}

/**
 * Detect a weight log in a chat message.
 * @returns {{isWeightLog:true, value:number, unit:'lbs'|'kg'} | {isWeightLog:false}}
 */
export function detectWeightLog(message) {
  const text = String(message || '').trim().toLowerCase();
  if (!text) return { isWeightLog: false };

  // 1. Explicit weigh-in intent: "weigh in: 183", "i weigh 183", "weight 183",
  //    "weighed in at 183 lbs", "current weight 83 kg".
  const intent = text.match(
    new RegExp(
      `(?:weigh(?:ed)?\\s*in(?:\\s*at)?|i\\s+weigh(?:ed)?|current\\s+weight|body\\s*weight|bodyweight|weight)\\s*(?:is|are)?\\s*[:\\-]?\\s*(\\d+(?:\\.\\d+)?)\\s*${UNIT_RE}?`,
      'i'
    )
  );
  if (intent) return build(intent[1], intent[2]);

  // The remaining (looser) paths only fire when nothing reads like food/a goal.
  if (NOT_A_WEIGHIN.test(text)) return { isWeightLog: false };

  // 2. A number paired with a weight unit anywhere: "183 lbs", "down to 82kg".
  const withUnit = text.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${UNIT_RE}`, 'i'));
  if (withUnit) return build(withUnit[1], withUnit[2]);

  // 3. The whole message is just a number → infer the unit by magnitude.
  const bare = text.match(/^\s*(\d+(?:\.\d+)?)\s*$/);
  if (bare) return build(bare[1], null);

  return { isWeightLog: false };
}

/* ───────────────────────── Unit conversion ───────────────────────── */

export function normalizeToKg(value, unit) {
  const v = Number(value) || 0;
  const kg = unit === 'lbs' ? v * 0.453592 : v;
  return round1(kg);
}

export function normalizeToLbs(value, unit) {
  const v = Number(value) || 0;
  const lbs = unit === 'kg' ? v * 2.20462 : v;
  return round1(lbs);
}

/* ───────────────────────── Trend analysis ───────────────────────── */

const DAY_MS = 86400000;

/**
 * Pure trend math over weight_logs rows (oldest → newest). Reported in lbs.
 * Split out from getWeightTrend so it can be unit-tested with no network.
 */
export function computeTrend(rows = []) {
  if (!rows || rows.length < 2) {
    return { trend: 'insufficient_data', entries: rows || [] };
  }

  const entries = rows.map((r) => ({
    logged_at: r.logged_at,
    weight: normalizeToLbs(r.weight_value, r.weight_unit || 'lbs'),
  }));

  const first = entries[0];
  const last = entries[entries.length - 1];
  const firstWeight = first.weight;
  const lastWeight = last.weight;
  const totalChange = round1(lastWeight - firstWeight);

  const daysElapsed = Math.max(
    0,
    Math.round((new Date(last.logged_at) - new Date(first.logged_at)) / DAY_MS)
  );

  // A per-week rate needs at least a full day of elapsed time. Multiple weigh-ins
  // on the same day are noise (water weight, time of day) — we can still report
  // the absolute change and a direction, but extrapolating a 3lb morning/evening
  // swing to "-21 lbs/week" is nonsense, so weeklyRate stays null until we have
  // real elapsed time. Downstream display omits the rate when it's null.
  const weeklyRate =
    daysElapsed >= 1 ? Math.round((totalChange / daysElapsed) * 7 * 100) / 100 : null;

  // Direction comes from the weekly rate once we have one; before that, from the
  // raw change so the trend still "calculates" on a fresh same-day pair.
  const basis = weeklyRate ?? totalChange;
  let trend = 'maintaining';
  if (basis < -0.2) trend = 'losing';
  else if (basis > 0.2) trend = 'gaining';

  return {
    trend,
    totalChange,
    weeklyRate,
    daysElapsed,
    entries,
    firstWeight,
    lastWeight,
    unit: 'lbs',
  };
}

/**
 * Analyze the weight trend over the last `days` days.
 * Everything is reported in lbs so the math stays consistent.
 */
export async function getWeightTrend(userId, days = 30) {
  const rows = await getWeightHistory(userId, days);
  return computeTrend(rows);
}

/* ───────────────────────── TDEE recalculation ───────────────────────── */

/**
 * Has it been long enough (or never) since we last tuned this user's target?
 */
export async function shouldRecalculateTDEE(userId) {
  const profile = await getFullProfile(userId);
  const last = profile?.tdee_last_recalculated;
  if (!last) return true;
  const daysSince = (Date.now() - new Date(last).getTime()) / DAY_MS;
  return daysSince > 14;
}

/**
 * Pure adjustment rule: how many calories to nudge, given goal + weekly rate.
 * Conservative by design — never more than ±150 at a time.
 */
export function computeTDEEAdjustment(goal, weeklyRate) {
  if (goal === 'lose_fat') {
    if (weeklyRate > -0.3) return -100; // losing too slowly (or not at all)
    if (weeklyRate < -1.2) return 150; // losing too fast — muscle-loss risk
    return 0;
  }
  if (goal === 'build_muscle') {
    if (weeklyRate < 0.1) return 100; // not gaining
    if (weeklyRate > 0.6) return -100; // gaining too fast — excess fat
    return 0;
  }
  // recomp, performance, just_track → no calorie change.
  return 0;
}

/**
 * Recalculate the calorie target from the trend and persist the change.
 * Only acts on a real trend (≥14 days, ≥4 entries). Always stamps
 * tdee_last_recalculated when it runs so we don't recompute every message.
 * @returns {{adjusted:boolean, newCalories:number, adjustment:number, reason:string}}
 */
export async function recalculateTDEEFromTrend(userId, trend, goals = {}) {
  const profile = await getFullProfile(userId);
  const goal = profile?.goal;
  const baseCalories = Number(goals.calories ?? profile?.calories) || 0;

  // Not enough signal yet — leave everything untouched.
  if (
    !trend ||
    trend.trend === 'insufficient_data' ||
    trend.daysElapsed < 14 ||
    (trend.entries?.length || 0) < 4
  ) {
    return {
      adjusted: false,
      newCalories: baseCalories,
      adjustment: 0,
      reason: 'Not enough weight history yet to retune the target.',
    };
  }

  const adjustment = computeTDEEAdjustment(goal, trend.weeklyRate);
  const newCalories = baseCalories + adjustment;

  // Reason text, in Kristy's framing.
  let reason;
  if (goal === 'recomp') {
    reason = "Recomp holds at maintenance — no calorie change. Protein consistency is what drives it.";
  } else if (adjustment < 0 && goal === 'lose_fat') {
    reason = `Fat loss has stalled — trimming ${Math.abs(adjustment)} calories to get it moving.`;
  } else if (adjustment > 0 && goal === 'lose_fat') {
    reason = `Dropping faster than ideal — adding ${adjustment} calories to protect muscle.`;
  } else if (adjustment > 0 && goal === 'build_muscle') {
    reason = `Weight isn't moving up — adding ${adjustment} calories to drive the gain.`;
  } else if (adjustment < 0 && goal === 'build_muscle') {
    reason = `Gaining a bit fast — pulling back ${Math.abs(adjustment)} calories to keep it lean.`;
  } else {
    reason = 'Trend is on track — target unchanged.';
  }

  // Persist. Always stamp the recalc time + refresh current weight; only move
  // calories when there's an actual adjustment.
  const patch = {
    tdee_last_recalculated: new Date().toISOString(),
    current_weight: trend.lastWeight,
    current_weight_unit: 'lbs',
  };
  if (adjustment !== 0) {
    patch.calories = newCalories;
    patch.tdee_adjustment = (Number(profile?.tdee_adjustment) || 0) + adjustment;
  }
  await updateUserGoals(userId, patch);

  return { adjusted: adjustment !== 0, newCalories, adjustment, reason };
}

/* ───────────────────────── Save ───────────────────────── */

/**
 * Save a weight log and keep the goals row's weight fields in sync.
 * Sets starting_weight the first time the user ever logs.
 * @returns the saved weight_logs row.
 */
export async function saveWeightLog(userId, value, unit = 'lbs') {
  const saved = await insertWeightLog(userId, {
    weight_value: value,
    weight_unit: unit,
  });

  const profile = await getFullProfile(userId);
  const patch = { current_weight: value, current_weight_unit: unit };
  if (profile?.starting_weight == null) {
    patch.starting_weight = value;
    patch.starting_weight_unit = unit;
  }
  await updateUserGoals(userId, patch);

  return saved;
}
