// Barcode + photo logging. Talks to the new Express routes in real mode,
// and returns believable mock results in demo mode so the UI is fully usable
// without a backend. Kept separate from api.js so existing chat logic is untouched.

import { IS_DEMO, apiBase } from './config.js';
import { supabase } from './supabase.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

/* ───────── Barcode ───────── */

// Tiny demo catalog so scanning feels real with no backend.
const DEMO_PRODUCTS = {
  '5449000000996': { name: 'Coca-Cola', macros: { calories: 42, protein: 0, carbs: 11, fat: 0 } },
  '7622210449283': { name: 'Oreo Original', macros: { calories: 480, protein: 5, carbs: 70, fat: 20 } },
};

export async function sendBarcode({ barcode }) {
  if (IS_DEMO) {
    await delay(500);
    const hit =
      DEMO_PRODUCTS[barcode] || {
        name: 'Protein Bar (demo)',
        macros: { calories: 360, protein: 30, carbs: 38, fat: 11 },
      };
    const servingNote = 'Assuming a 100g serving — adjust if it was more or less.';
    return {
      found: true,
      hasFood: true,
      productName: hit.name,
      message: `Got it — ${hit.name}. Logging that for you. ${servingNote}`,
      macros: hit.macros,
      foods: [hit.name],
      insight: '',
      servingNote,
    };
  }

  const res = await fetch(`${apiBase}/api/barcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ barcode }),
  });
  if (res.ok) return res.json();
  // On a non-2xx (notably the shared 429 rate limit), surface the server's
  // Kristy-voiced line as a normal bubble — same as sendChat — so the rate-limit
  // voice is identical across endpoints instead of a generic per-route message.
  const body = await res.json().catch(() => null);
  if (body && body.message) {
    return { error: true, message: body.message, hasFood: false, macros: null, foods: [], insight: '' };
  }
  throw new Error("Couldn't reach the barcode service — try again.");
}

/* ───────── Photo ───────── */

export async function sendPhoto({ file, message }) {
  if (IS_DEMO) {
    await delay(900);
    return {
      message:
        "Looks like grilled chicken with rice and some veggies — a solid, balanced plate.",
      hasFood: true,
      macros: { calories: 520, protein: 42, carbs: 48, fat: 16 },
      foods: ['grilled chicken', 'rice', 'mixed vegetables'],
      insight: '',
      isEstimate: true,
      estimateNote: 'Portion sizes are estimated from the photo — adjust if needed.',
    };
  }

  const form = new FormData();
  form.append('image', file);
  if (message) form.append('message', message);

  const res = await fetch(`${apiBase}/api/photo`, {
    method: 'POST',
    headers: { ...(await authHeader()) }, // let the browser set multipart boundary
    body: form,
  });
  if (res.ok) return res.json();
  // Same as sendChat/sendBarcode: surface the server's line (e.g. the shared
  // rate-limit message) as a bubble rather than a generic per-route fallback.
  const body = await res.json().catch(() => null);
  if (body && body.message) {
    return { error: true, message: body.message, hasFood: false, macros: null, foods: [], insight: '' };
  }
  throw new Error("Couldn't read that photo clearly — try again or type it out");
}
