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

  if (!res.ok) throw new Error('Kristy had trouble responding.');
  return res.json();
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

  if (!res.ok) throw new Error('Kristy had trouble responding.');
  return res.json();
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

  if (!res.ok) throw new Error('Could not save your weight.');
  const data = await res.json();

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
