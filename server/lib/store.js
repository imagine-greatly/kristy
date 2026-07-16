// Thin data-access helpers over the trusted Supabase client.
import { supabase } from './supabase.js';

const DEFAULT_GOALS = { calories: 2500, protein: 180, carbs: 200, fat: 80 };

// Macro goals + the onboarding profile columns.
const BASE_PROFILE_COLUMNS =
  'calories, protein, carbs, fat, name, age, sex, height_value, height_unit, ' +
  'weight_value, weight_unit, goal, sport, training_frequency, eating_pattern, ' +
  'eating_window_start, eating_window_end, dietary_preferences, onboarded';
// Weight/TDEE-optimization columns (added by the weight-logging migration).
const WEIGHT_PROFILE_COLUMNS =
  'starting_weight, starting_weight_unit, current_weight, current_weight_unit, ' +
  'tdee_last_recalculated, tdee_adjustment';
const PROFILE_COLUMNS = `${BASE_PROFILE_COLUMNS}, ${WEIGHT_PROFILE_COLUMNS}`;
// Grocery-coach columns (Step 6). Tried as the widest tier; getFullProfile falls
// back if the migration hasn't been applied so an existing profile is never lost.
const COACH_PROFILE_COLUMNS = 'coach_goal, non_negotiables, focuses';
const FULL_PROFILE_COLUMNS = `${PROFILE_COLUMNS}, ${COACH_PROFILE_COLUMNS}`;

/** Fetch a user's goals, creating defaults on first use. */
export async function getGoals(userId) {
  const { data } = await supabase
    .from('user_goals')
    .select('calories, protein, carbs, fat')
    .eq('user_id', userId)
    .maybeSingle();

  if (data) return data;

  const { data: created } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...DEFAULT_GOALS })
    .select('calories, protein, carbs, fat')
    .single();

  return created || DEFAULT_GOALS;
}

/**
 * Full user row — macro goals + onboarding profile (sport, goal, eating
 * pattern, etc.). Creates a default goals row on first use. The returned
 * object is safe to read both as `goals` (calories/protein/…) and `profile`.
 */
export async function getFullProfile(userId) {
  // Try the widest row (weight + coach columns). If a migration hasn't been
  // applied yet, that select errors — fall back tier by tier so an existing
  // user's profile is never lost (and never reset to defaults).
  let { data, error } = await supabase
    .from('user_goals')
    .select(FULL_PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    ({ data, error } = await supabase
      .from('user_goals')
      .select(PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle());
  }
  if (error) {
    ({ data } = await supabase
      .from('user_goals')
      .select(BASE_PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle());
  }

  if (data) return data;

  const { data: created } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...DEFAULT_GOALS })
    .select(BASE_PROFILE_COLUMNS)
    .single();

  return created || { ...DEFAULT_GOALS, onboarded: false };
}

/**
 * Persist an onboarding profile plus the macro goals computed from it.
 * Marks the user as onboarded. Returns the saved row.
 */
export async function saveOnboardingProfile(userId, profile = {}, goals = {}) {
  const row = {
    user_id: userId,
    name: profile.name ?? null,
    age: profile.age ?? null,
    sex: profile.sex ?? null,
    height_value: profile.height_value ?? null,
    height_unit: profile.height_unit ?? null,
    weight_value: profile.weight_value ?? null,
    weight_unit: profile.weight_unit ?? null,
    goal: profile.goal ?? null,
    sport: profile.sport ?? null,
    training_frequency: profile.training_frequency ?? null,
    eating_pattern: profile.eating_pattern ?? null,
    eating_window_start: profile.eating_window_start ?? null,
    eating_window_end: profile.eating_window_end ?? null,
    dietary_preferences: profile.dietary_preferences ?? [],
    calories: goals.calories,
    protein: goals.protein,
    carbs: goals.carbs,
    fat: goals.fat,
    onboarded: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_goals')
    .upsert(row)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Persist the grocery-coach onboarding (Step 6): a primary goal + non-negotiables.
 * Marks the user onboarded. Upsert touches only these columns, so an existing
 * profile's macros/weight fields are preserved. Returns the saved row.
 */
export async function saveCoachProfile(userId, { coach_goal = null, non_negotiables = [], focuses = [] } = {}) {
  const row = {
    user_id: userId,
    coach_goal: coach_goal || null,
    non_negotiables: Array.isArray(non_negotiables) ? non_negotiables : [],
    focuses: Array.isArray(focuses) ? focuses : [],
    onboarded: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_goals')
    .upsert(row)
    .select(`${BASE_PROFILE_COLUMNS}, ${COACH_PROFILE_COLUMNS}`)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Meal logs within the last `days` days, oldest → newest. */
export async function getRecentMeals(userId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: true });
  return data || [];
}

/** Meal logs for a fixed [start, end) window. */
export async function getMealsBetween(userId, startISO, endISO) {
  const { data } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', startISO)
    .lt('logged_at', endISO)
    .order('logged_at', { ascending: true });
  return data || [];
}

export async function saveMeal(userId, { foods, macros, rawInput, source = null, breakdown = null }) {
  const row = {
    user_id: userId,
    foods: foods || [],
    calories: macros?.calories ?? 0,
    protein: macros?.protein ?? 0,
    carbs: macros?.carbs ?? 0,
    fat: macros?.fat ?? 0,
    raw_input: rawInput || '',
  };

  // The macro-provenance columns (source + per-item breakdown) ship with the
  // USDA migration. Try inserting them; if the migration hasn't been applied
  // yet Postgres rejects the unknown columns — fall back to the base row so
  // logging never breaks. Mirrors getFullProfile's column-fallback pattern.
  if (source != null || breakdown != null) {
    const withProvenance = { ...row };
    if (source != null) withProvenance.source = source;
    if (breakdown != null) withProvenance.breakdown = breakdown;
    const { data, error } = await supabase
      .from('meal_logs')
      .insert(withProvenance)
      .select()
      .single();
    if (!error) return data;
  }

  const { data } = await supabase.from('meal_logs').insert(row).select().single();
  return data;
}

/**
 * Persist one authed verdict (service-role write). Best-effort: a verdict is a
 * share-card, not a meal — if the verdicts table hasn't been migrated yet the
 * insert errors and we swallow it (logged) rather than failing the request.
 * Mirrors the un-migrated-table tolerance used elsewhere. Guests never call this.
 * IMPORTANT: this does NOT touch meal_logs — a scanned haul is not an eaten meal.
 */
export async function saveVerdict(userId, { kind, verdict_line, payload }) {
  const { data, error } = await supabase
    .from('verdicts')
    .insert({ user_id: userId, kind, verdict_line, payload })
    .select('id')
    .single();
  if (error) {
    console.warn('[kristy] saveVerdict skipped:', error.message);
    return null;
  }
  return data;
}

export async function saveChatMessage(userId, { role, content, macros = null }) {
  const { data } = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, role, content, macros })
    .select()
    .single();
  return data;
}

/* ───────────────────────── Weight logs ───────────────────────── */

/** Insert a single weight_log row. Returns the saved row. */
export async function insertWeightLog(userId, { weight_value, weight_unit = 'lbs', note = null }) {
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({ user_id: userId, weight_value, weight_unit, note })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/** Weight logs within the last `days` days, oldest → newest. */
export async function getWeightHistory(userId, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: true });
  return data || [];
}

/** The user's most recent weight_log entry, or null. */
export async function getLatestWeight(userId) {
  const { data } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

/** Update just the current-weight fields on the goals row. */
export async function updateCurrentWeight(userId, value, unit = 'lbs') {
  const { data } = await supabase
    .from('user_goals')
    .update({
      current_weight: value,
      current_weight_unit: unit,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('current_weight, current_weight_unit')
    .single();
  return data;
}

/** Patch arbitrary fields on the goals row (weight/TDEE optimization writes). */
export async function updateUserGoals(userId, patch = {}) {
  const { data, error } = await supabase
    .from('user_goals')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select(PROFILE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllUserIds() {
  const ids = new Set();
  // Pull from goals (every signed-up user has a goals row via the auth trigger).
  const { data } = await supabase.from('user_goals').select('user_id');
  (data || []).forEach((r) => ids.add(r.user_id));
  return [...ids];
}

export async function saveWeeklySummary(userId, summary) {
  const { data } = await supabase
    .from('weekly_summaries')
    .insert({ user_id: userId, ...summary })
    .select()
    .single();
  return data;
}

/* ───────────────────────── Subscriptions ─────────────────────────
   Provider-agnostic billing state — one row per user, upserted by every
   provider (Stripe now, Apple later) and by the onboarding trial. All reads
   are defensive: if the migration hasn't been applied yet the query errors, and
   we return null (→ the user is treated as non-premium, a safe default) rather
   than breaking the request. */

const SUBSCRIPTION_COLUMNS =
  'id, user_id, status, provider, provider_subscription_id, provider_customer_id, ' +
  'trial_ends_at, current_period_end, created_at, updated_at';

/** The user's subscription row, or null (no row / table not migrated yet). */
export async function getSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(SUBSCRIPTION_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[kristy] getSubscription failed:', error.message);
    return null;
  }
  return data || null;
}

/** Look a subscription up by the provider's customer id (Stripe webhook path). */
export async function getSubscriptionByCustomer(customerId) {
  if (!customerId) return null;
  const { data, error } = await supabase
    .from('subscriptions')
    .select(SUBSCRIPTION_COLUMNS)
    .eq('provider_customer_id', customerId)
    .maybeSingle();
  if (error) {
    console.error('[kristy] getSubscriptionByCustomer failed:', error.message);
    return null;
  }
  return data || null;
}

/**
 * Upsert the user's single subscription row (keyed by user_id). Used by the
 * onboarding trial and every provider webhook. Only the fields passed in are
 * written (plus updated_at). Throws on error so callers can log with context.
 */
export async function upsertSubscription(userId, patch = {}) {
  const row = { user_id: userId, ...patch, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(row, { onConflict: 'user_id' })
    .select(SUBSCRIPTION_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
