// Unified data layer. In real mode it reads/writes Supabase (RLS-protected,
// per-user). In demo mode it uses localStorage so the UI is fully usable
// with no backend. AI chat itself goes through ./api.js.

import { IS_DEMO, apiBase } from './config.js';
import { supabase } from './supabase.js';
import { dayKey } from './format.js';
import { seedDemoMeals } from './mock.js';

const DEFAULT_GOALS = { calories: 2500, protein: 180, carbs: 200, fat: 80 };
const LS_KEY = 'kristy:v1';

// Macro goals + onboarding profile columns (mirrors the server's selection).
const PROFILE_COLS =
  'calories, protein, carbs, fat, name, age, sex, height_value, height_unit, ' +
  'weight_value, weight_unit, goal, sport, training_frequency, eating_pattern, ' +
  'eating_window_start, eating_window_end, dietary_preferences, onboarded, ' +
  'coach_goal, non_negotiables, focuses, constraints';

/* ───────────────────────── Demo store (localStorage) ───────────────────────── */

function demoRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const seeded = {
    goals: { ...DEFAULT_GOALS },
    meals: seedDemoMeals(),
    messages: [],
    summary: null,
  };
  localStorage.setItem(LS_KEY, JSON.stringify(seeded));
  return seeded;
}

function demoWrite(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

/* ───────────────────────── Onboarding / profile ───────────────────────── */

// Demo-only TDEE mirror of server/lib/tdee.js, so onboarding produces sane
// goals with no backend. Keep in sync with the server if the math changes.
function computeGoalsDemo(p = {}) {
  const kg =
    p.weight_unit === 'kg' ? Number(p.weight_value) || 0 : (Number(p.weight_value) || 0) * 0.45359237;
  const lbs =
    p.weight_unit === 'kg' ? (Number(p.weight_value) || 0) * 2.2046226218 : Number(p.weight_value) || 0;
  const cm =
    p.height_unit === 'cm' ? Number(p.height_value) || 0 : (Number(p.height_value) || 0) * 2.54;

  const base = 10 * kg + 6.25 * cm - 5 * (Number(p.age) || 0);
  const bmr = p.sex === 'male' ? base + 5 : p.sex === 'female' ? base - 161 : base - 78;
  const activity = { '0-1': 1.3, '2-3': 1.45, '4-5': 1.6, '6-7': 1.75 }[p.training_frequency] || 1.45;
  const tdee = Math.round(bmr * activity);

  const plan =
    {
      recomp: { kcal: 0, protein: 1.1, fat: 0.35 },
      performance: { kcal: 100, protein: 1.1, fat: 0.35 },
      lose_fat: { kcal: -300, protein: 1.1, fat: 0.35 },
      build_muscle: { kcal: 250, protein: 1.1, fat: 0.35 },
      just_track: { kcal: 0, protein: 0.8, fat: 0.3 },
    }[p.goal] || { kcal: 0, protein: 0.8, fat: 0.3 };

  const sportKcal = { endurance: 150, crossfit: 100 }[p.sport] || 0;
  const calories = Math.max(1200, Math.round(tdee + plan.kcal + sportKcal));
  const protein = Math.round(lbs * plan.protein);
  const fat = Math.round(lbs * plan.fat);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

// Returns the user's full profile row, or null if not onboarded yet. Reads
// macro_tracking (opt-in, default OFF) as the widest tier and falls back if that
// column hasn't been migrated yet — so a pre-migration DB still loads the profile
// (and simply reads macro tracking as OFF), mirroring the server's getFullProfile.
export async function loadProfile(userId) {
  if (IS_DEMO) return demoRead().profile || null;

  try {
    let { data, error } = await supabase
      .from('user_goals')
      .select(`${PROFILE_COLS}, macro_tracking`)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      ({ data } = await supabase
        .from('user_goals')
        .select(PROFILE_COLS)
        .eq('user_id', userId)
        .maybeSingle());
    }
    return data || null;
  } catch {
    // Columns may not exist yet (migration not applied) → treat as unonboarded.
    return null;
  }
}

// True once the user has explicitly opted into macro/calorie tracking. The TDEE
// macro setup is the ONLY path that writes these body-metric fields onto the
// profile row, so their presence is a clean signal that the calorie/macro/weight
// dashboard should be shown. Grocery-only users never have them — so that whole
// panel stays out of the default grocery-coach chrome until it's turned on.
export function hasMacroTracking(profile) {
  if (!profile) return false;
  return (
    profile.height_value != null ||
    profile.weight_value != null ||
    profile.age != null ||
    profile.sex != null
  );
}

// Saves the onboarding profile and returns { goals, profile }.
export async function saveOnboarding(userId, payload) {
  if (IS_DEMO) {
    const goals = computeGoalsDemo(payload);
    const profile = { ...payload, ...goals, onboarded: true };
    const s = demoRead();
    s.profile = profile;
    s.goals = goals;
    demoWrite(s);
    return { goals, profile };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${apiBase}/api/onboarding/full`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Could not save your profile.');
  return res.json();
}

/* ───────────────────────── Public API ───────────────────────── */

export async function loadGoals(userId) {
  if (IS_DEMO) return demoRead().goals;

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
  return created || { ...DEFAULT_GOALS };
}

export async function saveGoals(userId, goals) {
  if (IS_DEMO) {
    const s = demoRead();
    s.goals = { ...s.goals, ...goals };
    demoWrite(s);
    return s.goals;
  }
  const { data } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...goals, updated_at: new Date().toISOString() })
    .select('calories, protein, carbs, fat')
    .single();
  return data;
}

// Profile-preference fields editable from the settings screen. Only these
// whitelisted keys are ever written; macro goals go through saveGoals above.
// macro_tracking is the opt-in switch that turns the calorie/macro/weight UI on.
const PROFILE_FIELD_KEYS = ['goal', 'weight_unit', 'sport', 'training_frequency', 'coach_goal', 'non_negotiables', 'focuses', 'constraints', 'macro_tracking'];

// Patch one or more profile fields on the user_goals row. Demo-aware, mirroring
// saveGoals. Returns the updated profile row (or the demo profile object).
export async function saveProfileFields(userId, patch = {}) {
  const clean = {};
  for (const k of PROFILE_FIELD_KEYS) if (k in patch) clean[k] = patch[k];

  if (IS_DEMO) {
    const s = demoRead();
    s.profile = { ...(s.profile || {}), ...clean };
    demoWrite(s);
    return s.profile;
  }

  const { data, error } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...clean, updated_at: new Date().toISOString() })
    .select(PROFILE_COLS)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Persist the 60-second grocery-coach onboarding (Step 6): a primary goal +
// non-negotiables + focuses + constraints. Marks the user onboarded (no trial —
// that's an explicit choice at the gate). Demo-aware. Returns the updated profile.
export async function saveCoachProfile(userId, { coach_goal = null, non_negotiables = [], focuses = [], constraints = [] } = {}) {
  if (IS_DEMO) {
    const s = demoRead();
    s.profile = { ...(s.profile || {}), coach_goal: coach_goal || null, non_negotiables, focuses, constraints, onboarded: true };
    demoWrite(s);
    return s.profile;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${apiBase}/api/onboarding/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify({ coach_goal, non_negotiables, focuses, constraints }),
  });
  if (!res.ok) throw new Error('Could not save your goal.');
  const json = await res.json();
  return json.profile;
}

/* ───────────────────────── The Haul (Step 7) ───────────────────────── */

const rid = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const haulBucket = (t) =>
  t === 'approved' ? 'approved' : t === 'approved_with_note' || t === 'use_with_intention' ? 'note' : 'swap';

function haulDistribution(scans) {
  const d = { approved: 0, note: 0, swap: 0, total: 0 };
  for (const s of scans) {
    d[haulBucket(s.tier)] += 1;
    d.total += 1;
  }
  return d;
}

// Record a scanned product in the haul. Non-fatal: a failed record never breaks
// the scan itself. Guests don't reach this (their Haul is gated).
export async function saveHaulScan({ product_name = null, brand = null, tier = null, barcode = null } = {}) {
  if (!tier) return null;
  if (IS_DEMO) {
    const s = demoRead();
    s.haul = s.haul || [];
    const row = { id: rid(), product_name, brand, tier, barcode, scanned_at: new Date().toISOString() };
    s.haul.unshift(row);
    demoWrite(s);
    return row;
  }
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(`${apiBase}/api/haul/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ product_name, brand, tier, barcode }),
    });
    if (!res.ok) return null;
    return (await res.json()).scan;
  } catch {
    return null;
  }
}

// The Haul aggregate: trip (today) + week + distribution + Kristy's weekly read.
export async function loadHaul() {
  if (IS_DEMO) {
    const week = (demoRead().haul || []).slice(0, 200);
    const distribution = haulDistribution(week);
    const todayKey = dayKey();
    const trip = week.filter((x) => dayKey(x.scanned_at) === todayKey);
    const read = week.length
      ? "Solid start — but this haul is leaning on swaps. Want a couple of clean protein anchors on next week's list?"
      : '';
    return { trip, week, distribution, read };
  }
  const empty = { trip: [], week: [], distribution: { approved: 0, note: 0, swap: 0, total: 0 }, read: '' };
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(`${apiBase}/api/haul?tzOffset=${new Date().getTimezoneOffset()}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (!res.ok) return empty;
    return await res.json();
  } catch {
    return empty;
  }
}

// Meals over the last `days` days (oldest → newest).
export async function loadRecentMeals(userId, days = 7) {
  if (IS_DEMO) {
    const since = Date.now() - days * 86400000;
    return demoRead()
      .meals.filter((m) => new Date(m.logged_at).getTime() >= since)
      .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
  }
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

// Chat messages for a given local date (oldest → newest).
export async function loadDayMessages(userId, key = dayKey()) {
  if (IS_DEMO) {
    return demoRead()
      .messages.filter((m) => dayKey(m.created_at) === key)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }
  const start = new Date(`${key}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const { data } = await supabase
    .from('chat_messages')
    .select('id, role, content, macros, created_at')
    .eq('user_id', userId)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())
    .order('created_at', { ascending: true });
  return data || [];
}

// Weight logs over the last `days` days (oldest → newest). Powers the sidebar
// weight section. RLS keeps this scoped to the signed-in user.
export async function loadWeightHistory(userId, days = 90) {
  if (IS_DEMO) {
    const weights = demoRead().weights || [];
    const since = Date.now() - days * 86400000;
    return weights
      .filter((w) => new Date(w.logged_at).getTime() >= since)
      .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at));
  }
  const since = new Date();
  since.setDate(since.getDate() - days);
  try {
    const { data } = await supabase
      .from('weight_logs')
      .select('logged_at, weight_value, weight_unit')
      .eq('user_id', userId)
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: true });
    return data || [];
  } catch {
    // weight_logs table may not exist yet (migration not applied) → no data.
    return [];
  }
}

export async function loadLatestSummary(userId) {
  if (IS_DEMO) return demoRead().summary;
  const { data } = await supabase
    .from('weekly_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

/* Demo-only writers (real mode persists via the /api/chat backend). */

export function demoPersistTurn({ userMsg, aiMsg, meal }) {
  if (!IS_DEMO) return;
  const s = demoRead();
  s.messages.push(userMsg, aiMsg);
  if (meal) s.meals.push(meal);
  demoWrite(s);
}
