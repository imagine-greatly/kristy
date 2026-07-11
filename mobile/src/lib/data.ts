// Unified data layer over Supabase (RLS-protected, per-user). Ported from the
// web client's data.js, minus demo mode. Chat itself goes through ./api.ts.

import { apiBase } from './config';
import { supabase, authToken } from './supabase';
import { dayKey } from './format';
import type { Profile, Goals, Meal, UiMessage, WeightEntry } from './types';

const DEFAULT_GOALS: Goals = { calories: 2500, protein: 180, carbs: 200, fat: 80 };

// Macro goals + onboarding profile columns (mirrors the server's selection).
const PROFILE_COLS =
  'calories, protein, carbs, fat, name, age, sex, height_value, height_unit, ' +
  'weight_value, weight_unit, goal, sport, training_frequency, eating_pattern, ' +
  'eating_window_start, eating_window_end, dietary_preferences, onboarded';

/* ───────────────────────── Onboarding / profile ───────────────────────── */

// Returns the user's full profile row, or null if not onboarded yet.
export async function loadProfile(userId: string): Promise<Profile | null> {
  try {
    const { data } = await supabase
      .from('user_goals')
      .select(PROFILE_COLS)
      .eq('user_id', userId)
      .maybeSingle();
    return (data as Profile) || null;
  } catch {
    // Columns may not exist yet (migration not applied) → treat as unonboarded.
    return null;
  }
}

// Saves the onboarding profile via the server (which computes TDEE goals,
// seeds the first weigh-in, and starts the 7-day trial). Returns { goals, profile }.
export async function saveOnboarding(
  _userId: string,
  payload: Record<string, unknown>
): Promise<{ goals: Goals; profile: Profile }> {
  const res = await fetch(`${apiBase}/api/onboarding/full`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await authToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Could not save your profile.');
  return res.json();
}

/* ───────────────────────── Goals ───────────────────────── */

export async function loadGoals(userId: string): Promise<Goals> {
  const { data } = await supabase
    .from('user_goals')
    .select('calories, protein, carbs, fat')
    .eq('user_id', userId)
    .maybeSingle();

  if (data) return data as Goals;

  const { data: created } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...DEFAULT_GOALS })
    .select('calories, protein, carbs, fat')
    .single();
  return (created as Goals) || { ...DEFAULT_GOALS };
}

export async function saveGoals(userId: string, goals: Goals): Promise<Goals> {
  const { data } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...goals, updated_at: new Date().toISOString() })
    .select('calories, protein, carbs, fat')
    .single();
  return data as Goals;
}

// Profile-preference fields editable from the settings screen.
const PROFILE_FIELD_KEYS = ['goal', 'weight_unit', 'sport', 'training_frequency'] as const;

export async function saveProfileFields(
  userId: string,
  patch: Partial<Profile> = {}
): Promise<Profile> {
  const clean: Record<string, unknown> = {};
  for (const k of PROFILE_FIELD_KEYS) if (k in patch) clean[k] = (patch as any)[k];

  const { data, error } = await supabase
    .from('user_goals')
    .upsert({ user_id: userId, ...clean, updated_at: new Date().toISOString() })
    .select(PROFILE_COLS)
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

/* ───────────────────────── Reads ───────────────────────── */

// Meals over the last `days` days (oldest → newest).
export async function loadRecentMeals(userId: string, days = 7): Promise<Meal[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: true });
  return (data as Meal[]) || [];
}

// Chat messages for a given local date (oldest → newest).
export async function loadDayMessages(
  userId: string,
  key: string = dayKey()
): Promise<UiMessage[]> {
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
  return (data as UiMessage[]) || [];
}

// Weight logs over the last `days` days (oldest → newest).
export async function loadWeightHistory(userId: string, days = 90): Promise<WeightEntry[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  try {
    const { data } = await supabase
      .from('weight_logs')
      .select('logged_at, weight_value, weight_unit')
      .eq('user_id', userId)
      .gte('logged_at', since.toISOString())
      .order('logged_at', { ascending: true });
    return (data as WeightEntry[]) || [];
  } catch {
    return [];
  }
}

export async function loadLatestSummary(
  userId: string
): Promise<{ id: string; summary_text: string } | null> {
  const { data } = await supabase
    .from('weekly_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as any) || null;
}
