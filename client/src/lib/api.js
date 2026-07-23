import { IS_DEMO, apiBase } from './config.js';
import { supabase } from './supabase.js';
import { mockReply } from './mock.js';
import { demoPersistTurn } from './data.js';

const rid = () =>
  (crypto.randomUUID && crypto.randomUUID()) ||
  `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Send a chat turn to Kristy.
 * @returns {{message, hasFood, macros, foods, insight}}
 */
export async function sendChat({ message, history = [], ctx }) {
  if (IS_DEMO) {
    await delay(550 + Math.random() * 500); // feel the typing indicator
    const result = mockReply(message, ctx);
    const now = new Date().toISOString();

    const userMsg = { id: rid(), role: 'user', content: message, macros: null, created_at: now };
    const aiMsg = {
      id: rid(),
      role: 'ai',
      content: result.message,
      macros: result.hasFood
        ? { ...result.macros, foods: result.foods, insight: result.insight }
        : null,
      created_at: now,
    };
    const meal = result.hasFood
      ? { id: rid(), logged_at: now, foods: result.foods, ...result.macros }
      : null;

    demoPersistTurn({ userMsg, aiMsg, meal });
    return result;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${apiBase}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      conversationHistory: history,
      // Local timezone offset (minutes, per Date.getTimezoneOffset) so the
      // server builds TODAY_BLOCK in the user's local day, never UTC/server time.
      tzOffset: new Date().getTimezoneOffset(),
    }),
  });

  if (res.ok) return res.json();
  // Non-2xx (upstream failure or rate limit): surface the server's Kristy-voiced
  // line so the caller renders it as a normal bubble; else throw and let the
  // caller show its own retry message. Never leaks a raw error to the UI.
  const body = await res.json().catch(() => null);
  if (body && body.message) return { error: true, message: body.message };
  throw new Error('Kristy had trouble responding.');
}

/**
 * Send a guest (not-signed-in) chat turn to Kristy. Hits the stateless
 * /api/guest/chat endpoint — no token, nothing persisted. The server may return
 * a soft gate ({ gate: true, reason: 'memory' | 'limit', kristyLine }) instead
 * of a normal reply; the caller renders the sign-in overlay in that case.
 * @returns {{message, hasFood, macros, foods, insight} | {gate:true, reason, kristyLine}}
 */
export async function sendGuestChat({ message, history = [] }) {
  const res = await fetch(`${apiBase}/api/guest/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory: history }),
  });

  if (res.ok) return res.json();
  // Non-2xx: surface the server's Kristy-voiced line as a { error, message }
  // object so the guest sees a normal bubble; else throw for the caller's fallback.
  const body = await res.json().catch(() => null);
  if (body && body.message) return { error: true, message: body.message };
  throw new Error('Kristy had trouble responding.');
}

/**
 * Log a weight directly (the chat endpoint also detects weigh-ins inline, so
 * this is an explicit alternative path). Returns the same shape as sendChat so
 * the UI can render the reply identically.
 * @returns {{message, hasFood, macros, foods, insight, recalculated}}
 */
export async function sendWeightLog({ weight_value, weight_unit = 'lbs' }) {
  if (IS_DEMO) {
    await delay(450 + Math.random() * 400);
    return {
      message: `Logged — ${weight_value} ${weight_unit}. I'll track the trend from here and keep your targets accurate.`,
      hasFood: false,
      macros: null,
      foods: [],
      insight: '',
      recalculated: null,
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${apiBase}/api/weight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ weight_value, weight_unit }),
  });

  if (!res.ok) {
    // Surface the server's Kristy-voiced line (e.g. the shared rate-limit
    // message) as a normal reply, the same way sendChat does, instead of a
    // generic throw — keeps the rate-limit voice consistent across endpoints.
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

  // Map the /api/weight response onto the chat reply shape.
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
 * Permanently delete the signed-in user's account and all their data, then
 * sign them out. Real mode hits DELETE /api/account (which clears every
 * user_id-scoped row and the auth user), then drops the local session so
 * onAuthStateChange returns the app to the guest experience. Demo mode just
 * clears the local store. Throws with a friendly message on failure.
 */
export async function deleteAccount() {
  if (IS_DEMO) {
    try {
      localStorage.removeItem('kristy:v1');
    } catch {
      /* ignore */
    }
    return { ok: true };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${apiBase}/api/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error((body && body.message) || 'Could not delete your account.');
  }

  // Clear the local session → onAuthStateChange fires with null → guest view.
  await supabase.auth.signOut();
  return { ok: true };
}

/* ───────────────────────── Subscription / billing ───────────────────────── */

// A non-premium snapshot — the safe default when we can't reach the server.
const FREE_SNAPSHOT = {
  premium: false,
  status: 'none',
  provider: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
  trialDaysLeft: 0,
  trialExpired: false,
};

async function authToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

/**
 * The signed-in user's billing snapshot (premium flag, status, trial days).
 * Demo mode has no server → return a live trial so the full UI is explorable.
 * Never throws: on any failure it returns the safe non-premium snapshot.
 */
export async function getSubscription() {
  if (IS_DEMO) {
    return {
      premium: true,
      status: 'trialing',
      provider: 'promo',
      trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      currentPeriodEnd: null,
      trialDaysLeft: 7,
      trialExpired: false,
    };
  }
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

/**
 * Start the 7-day promo trial — the explicit, at-the-gate action (from the withheld
 * read or the Upgrade screen). Grants the trial server-side (idempotently: a user
 * who already has any subscription row keeps it) and returns the fresh billing
 * snapshot so the caller can flip to the premium UI. Never throws: on any failure it
 * returns the safe non-premium snapshot, so the caller can fall back to the paid path.
 */
export async function startTrial() {
  if (IS_DEMO) return getSubscription(); // demo is already a live trial
  try {
    const res = await fetch(`${apiBase}/api/subscription/trial`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${await authToken()}` },
    });
    if (!res.ok) return FREE_SNAPSHOT;
    return await res.json();
  } catch {
    return FREE_SNAPSHOT;
  }
}

/**
 * Start Stripe Checkout for a plan ('monthly' | 'annual'). Redirects the browser
 * to the returned Checkout URL. Throws a friendly message on failure so the
 * upgrade view can show it.
 */
export async function startCheckout(plan = 'monthly') {
  if (IS_DEMO) {
    throw new Error('Billing runs in the live app — this is a demo.');
  }
  const res = await fetch(`${apiBase}/api/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await authToken()}`,
    },
    body: JSON.stringify({ plan }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.url) {
    throw new Error((body && body.message) || 'Could not start checkout.');
  }
  window.location.href = body.url;
}

/**
 * Open the Stripe customer portal (manage / cancel). Redirects to the portal URL.
 * Throws a friendly message on failure (e.g. no subscription to manage yet).
 */
export async function openBillingPortal() {
  if (IS_DEMO) {
    throw new Error('Billing runs in the live app — this is a demo.');
  }
  const res = await fetch(`${apiBase}/api/billing/portal`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await authToken()}` },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.url) {
    throw new Error((body && body.message) || 'Could not open the billing portal.');
  }
  window.location.href = body.url;
}
