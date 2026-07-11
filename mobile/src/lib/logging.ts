// Barcode + photo logging. Talks to the existing Express routes; identical
// contracts to web. The only native difference is the photo upload: React
// Native FormData takes a { uri, name, type } file object instead of a browser
// File/Blob.

import { apiBase } from './config';
import { authToken } from './supabase';
import type { ChatResult } from './types';

async function authHeader(): Promise<Record<string, string>> {
  const token = await authToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ───────── Barcode ───────── */

export async function sendBarcode({ barcode }: { barcode: string }): Promise<ChatResult> {
  const res = await fetch(`${apiBase}/api/barcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ barcode }),
  });
  if (res.ok) return res.json();
  // On a non-2xx (notably the shared 429 rate limit) surface the server's
  // Kristy-voiced line as a normal bubble — same as sendChat.
  const body = await res.json().catch(() => null);
  if (body && body.message) {
    return { error: true, message: body.message, hasFood: false, macros: null, foods: [], insight: '' };
  }
  throw new Error("Couldn't reach the barcode service — try again.");
}

/* ───────── Photo ───────── */

export async function sendPhoto({
  uri,
  message,
}: {
  uri: string;
  message?: string;
}): Promise<ChatResult> {
  const form = new FormData();
  // RN multipart file part — the server's multer reads this as req.file.
  const name = uri.split('/').pop() || 'meal.jpg';
  const match = /\.(\w+)$/.exec(name);
  const ext = (match ? match[1] : 'jpg').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
  // @ts-expect-error — RN's FormData accepts this file descriptor object.
  form.append('image', { uri, name, type });
  if (message) form.append('message', message);

  const res = await fetch(`${apiBase}/api/photo`, {
    method: 'POST',
    headers: { ...(await authHeader()) }, // let RN set the multipart boundary
    body: form,
  });
  if (res.ok) return res.json();
  const body = await res.json().catch(() => null);
  if (body && body.message) {
    return { error: true, message: body.message, hasFood: false, macros: null, foods: [], insight: '' };
  }
  throw new Error("Couldn't read that photo clearly — try again or type it out");
}
