// Chat + account + subscription API. Ported from the web client's api.js, minus
// demo mode and Stripe (mobile purchases go through RevenueCat — see purchases.ts).
// Every contract is identical to web: the server neither knows nor cares that the
// caller is a native client.

import { apiBase } from './config';
import { supabase, authToken } from './supabase';
import type { ChatResult, Subscription } from './types';

/**
 * Send a chat turn to Kristy.
 * Returns the normal reply shape, or { error, message } when the server hands
 * back a Kristy-voiced line (upstream failure / rate limit) to render as a bubble.
 */
export async function sendChat({
  message,
  history = [],
}: {
  message: string;
  history?: { role: string; content: string }[];
}): Promise<ChatResult> {
  const res = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await authToken()}`,
    },
    body: JSON.stringify({
      message,
      conversationHistory: history,
      // Local timezone offset (minutes, per Date.getTimezoneOffset) so the server
      // builds TODAY_BLOCK in the user's local day, never UTC/server time.
      tzOffset: new Date().getTimezoneOffset(),
    }),
  });

  if (res.ok) return res.json();
  const body = await res.json().catch(() => null);
  if (body && body.message) return { error: true, message: body.message };
  throw new Error('Kristy had trouble responding.');
}

/**
 * Log a weight directly (the chat endpoint also detects weigh-ins inline, so
 * this is an explicit alternative path). Returns the same shape as sendChat.
 */
export async function sendWeightLog({
  weight_value,
  weight_unit = 'lbs',
}: {
  weight_value: number;
  weight_unit?: string;
}): Promise<ChatResult> {
  const res = await fetch(`${apiBase}/api/weight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await authToken()}`,
    },
    body: JSON.stringify({ weight_value, weight_unit }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (body && body.message) {
      return {
        error: true,
        message: body.message,
        hasFood: false,
        macros: null,
        foods: [],
        insight: '',
        recalculated: null,
      };
    }
    throw new Error('Could not save your weight.');
  }
  const data = await res.json();

  // Free user → the server returns a locked upgrade nudge instead of saving.
  if (data.locked) {
    return {
      message: data.message,
      hasFood: false,
      macros: null,
      foods: [],
      insight: '',
      recalculated: null,
      locked: data.locked,
      upgrade: true,
    };
  }

  const r = data.recalculated;
  let message = `Logged — ${data.saved.value} ${data.saved.unit}.`;
  if (data.trend?.trend && data.trend.trend !== 'insufficient_data') {
    message +=
      data.trend.weeklyRate != null
        ? ` Trend: ${data.trend.trend} at ${data.trend.weeklyRate} lbs/week.`
        : ` Trend: ${data.trend.trend} so far.`;
  }
  if (r?.adjusted) {
    message += ` Based on your trend I've adjusted your daily target to ${r.newCalories} calories.`;
  }

  return {
    message,
    hasFood: false,
    macros: null,
    foods: [],
    insight: '',
    recalculated: r || null,
  };
}

/**
 * Permanently delete the signed-in user's account and all their data, then sign
 * them out (onAuthStateChange returns the app to the auth screen).
 */
export async function deleteAccount(): Promise<{ ok: true }> {
  const res = await fetch(`${apiBase}/api/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${await authToken()}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error((body && body.message) || 'Could not delete your account.');
  }

  await supabase.auth.signOut();
  return { ok: true };
}

/* ───────────────────────── Subscription ───────────────────────── */

// A non-premium snapshot — the safe default when we can't reach the server.
const FREE_SNAPSHOT: Subscription = {
  premium: false,
  status: 'none',
  provider: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
  trialDaysLeft: 0,
  trialExpired: false,
};

/**
 * The signed-in user's billing snapshot (premium flag, status, trial days).
 * Authoritative: even on iOS, premium is read from the server's `subscriptions`
 * row (which the RevenueCat webhook keeps current). Never throws.
 */
export async function getSubscription(): Promise<Subscription> {
  try {
    const res = await fetch(`${apiBase}/api/subscription`, {
      headers: { Authorization: `Bearer ${await authToken()}` },
    });
    if (!res.ok) return FREE_SNAPSHOT;
    return await res.json();
  } catch {
    return FREE_SNAPSHOT;
  }
}
