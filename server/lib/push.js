// Expo push sender. Reads a user's registered device tokens from push_tokens and
// delivers a notification via the Expo Push API. Best-effort and non-throwing —
// a push failure must never break the request/cron that triggered it.
//
// Added for the mobile client: called from the chat pipeline when a proactive
// insight fires, and from the weekly-summary generator on Sunday.

import { supabase } from './supabase.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/** All registered Expo push tokens for a user. */
export async function getUserPushTokens(userId) {
  const { data, error } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('user_id', userId);
  if (error) {
    // Table may not be migrated yet — treat as "no devices", never throw.
    console.error('[kristy] getUserPushTokens failed:', error.message);
    return [];
  }
  return (data || []).map((r) => r.token).filter(Boolean);
}

// Drop tokens Expo reports as no-longer-valid so we stop pushing to dead devices.
async function pruneInvalidTokens(responseJson, chunk) {
  const tickets = responseJson?.data;
  if (!Array.isArray(tickets)) return;
  const dead = [];
  tickets.forEach((t, i) => {
    if (t?.status === 'error' && t?.details?.error === 'DeviceNotRegistered') {
      dead.push(chunk[i].to);
    }
  });
  if (dead.length) {
    await supabase.from('push_tokens').delete().in('token', dead);
  }
}

/** Send one message to a list of Expo tokens (chunked at the API's 100 limit). */
export async function sendExpoPush(tokens, { title, body, data }) {
  if (!tokens || !tokens.length) return;
  const messages = tokens.map((to) => ({
    to,
    title,
    body,
    sound: 'default',
    ...(data ? { data } : {}),
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
      const json = await res.json().catch(() => null);
      await pruneInvalidTokens(json, chunk);
    } catch (err) {
      console.error('[kristy] expo push send failed:', err.message);
    }
  }
}

/**
 * Push a notification to every device a user has registered. Fire-and-forget:
 * callers do not need to await it, and it never throws.
 */
export async function pushToUser(userId, { title, body, data } = {}) {
  try {
    const tokens = await getUserPushTokens(userId);
    if (!tokens.length) return;
    await sendExpoPush(tokens, { title, body, data });
  } catch (err) {
    console.error('[kristy] pushToUser failed:', err.message);
  }
}
