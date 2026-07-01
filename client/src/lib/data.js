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
  'eating_window_start, eating_window_end, dietary_preferences, onboarded';

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

// Returns the user's full profile row, or null if not onboarded yet.
export async function loadProfile(userId) {
  if (IS_DEMO) return demoRead().profile || null;

  try {
    const { data } = await supabase
      .from('user_goals')
      .select(PROFILE_COLS)
      .eq('user_id', userId)
      .maybeSingle();
    return data || null;
  } catch {
    // Columns may not exist yet (migration not applied) → treat as unonboarded.
    return null;
  }
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
