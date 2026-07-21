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

/* ───────── Kristy's Verdict ─────────
   Scan a meal/haul photo → a goal-relative verdict rendered as a shareable card.
   Authed hits /api/verdict (fit against real targets, persisted); guests hit
   /api/guest/verdict (general read + sign-in hook, nothing written). Neither
   creates a meal_log. */

// A believable demo verdict so the card is fully explorable with no backend.
function demoVerdict(isGuest) {
  return {
    kind: 'haul',
    verdict_line: 'Strong haul — but this feeds your training for three days, not seven.',
    breakdown: [
      "Chicken, eggs, and yogurt are carrying the protein — good.",
      "Four bags of chips are ~1,800 calories doing nothing for your target.",
      "Swap two chip bags for another protein and the week actually holds.",
    ],
    fit: {
      summary: isGuest
        ? "Protein-forward up front, but the back half is calorie-dense filler. That's my read cold. Sign in and I'll read it against your actual targets."
        : "Covers about 3 of your 7 protein days. The calories are there for the week — the protein isn't.",
      stats: isGuest
        ? ['~148g protein', 'protein-forward', 'high calorie-density']
        : ['148g total protein', '~3 of your 7 protein days', 'covers ~1.5 days of calories'],
    },
    items: [
      { name: 'chicken breast', est_calories: 660, est_protein_g: 124 },
      { name: 'greek yogurt', est_calories: 260, est_protein_g: 24 },
      { name: 'potato chips (x4)', est_calories: 1800, est_protein_g: 12 },
    ],
  };
}

export async function sendVerdict({ file }) {
  if (IS_DEMO) {
    await delay(1100);
    return demoVerdict(false);
  }
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${apiBase}/api/verdict`, {
    method: 'POST',
    headers: { ...(await authHeader()) }, // browser sets the multipart boundary
    body: form,
  });
  if (res.ok) return res.json();
  const body = await res.json().catch(() => null);
  if (body && body.message) return { error: true, message: body.message };
  throw new Error("Couldn't read that one clearly — try another shot.");
}

export async function sendGuestVerdict({ file }) {
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${apiBase}/api/guest/verdict`, {
    method: 'POST',
    body: form, // no auth header — this is the open funnel
  });
  if (res.ok) return res.json(); // verdict JSON, or { gate:true, reason:'limit' }
  const body = await res.json().catch(() => null);
  if (body && body.message) return { error: true, message: body.message };
  throw new Error("Couldn't read that one clearly — try another shot.");
}

/* ───────── Scan → verdict (the repointed scan front door — Step 4) ─────────
   The grocery-coach front door. Both scan entry points parse to an ingredient
   list, then POST it to /verdict. Extraction (Open Food Facts barcode / label
   vision) runs server-side; runProductScan orchestrates extract → verdict and
   hands the caller a ready-to-render Step-3 card:

     { found:true, source, product, verdict }   → render ScanVerdictCard
     { found:false, source, product, message }  → "type the product" fallback
     { gate:true, reason }                       → soft sign-in gate (guest)
     { error:true, message }                     → Kristy-voiced error

   Authed hits /api/verdict (personal note); guests hit /api/guest/verdict (the
   universal layer only). Macro logging (sendBarcode / sendPhoto) stays reachable
   but is no longer what a scan produces by default. */

// A believable demo card so the whole scan flow is explorable with no backend.
// `personalize:false` mirrors the goal-less path: the universal layer + generic KB
// swap, no note, needsGoal:true so the in-card goal ask renders.
function demoScanCard({ personalize = true } = {}) {
  const universalLayer = [
    { id: 'canola_oil', name: 'Canola Oil', one_liner: 'Solvent-extracted and heat-damaged — it oxidizes easily, and oxidized fats are the real problem.', severity: 'high', evidence_tier: 'kristys_standard' },
    { id: 'agave_syrup', name: 'Agave Syrup', one_liner: "Marketed as 'natural,' but it's 70–90% fructose — even more than corn syrup. The liver pays for that.", severity: 'high', evidence_tier: 'credible_concern' },
    { id: 'carrageenan', name: 'Carrageenan', one_liner: 'A seaweed thickener that inflamed the gut in animal studies — which is why it stays debated.', severity: 'high', evidence_tier: 'credible_concern' },
  ];
  const swap = 'Butter, ghee, or a splash of whole milk in your coffee';
  const signals = { highSodium: false, highAddedSugar: true, sodium_100g: null, added_sugar_100g: 22, glycemicHigh: [], sugarAliases: ['Agave Syrup'], cardiovascular: ['Canola Oil'] };
  const verdict = personalize
    ? { tier: 'swap_recommended', stamp: false, universalLayer, note: "That creamer is mostly oil and sugar doing very little for you — here's where it works better.", swap, gated: false, signals, ingredientsRead: 14 }
    : { tier: 'swap_recommended', stamp: false, universalLayer, note: null, swap, needsGoal: true, signals, ingredientsRead: 14 };
  return {
    found: true,
    source: 'off',
    product: { barcode: 'demo', name: 'Hazelnut Coffee Creamer', brand: 'Demo Co.', image: null, aisle: 'coffee & tea' },
    verdict,
    ingredients: 'canola oil, agave syrup, carrageenan',
    nutrition: null,
  };
}

async function isGuestSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !session?.access_token;
}

// Server-side extraction: barcode (Open Food Facts, with a vision fallback) or a
// label photo (vision). Returns { found, source, product, ingredients } | { gate }.
async function scanExtract({ mode, barcode, file, isGuest }) {
  const base = isGuest ? '/api/guest' : '/api';
  const fail = { found: false, source: 'none', ingredients: '' };

  if (mode === 'barcode') {
    const res = await fetch(`${apiBase}${base}/scan/barcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(isGuest ? {} : await authHeader()) },
      body: JSON.stringify({ barcode }),
    });
    return res.ok ? res.json() : (await res.json().catch(() => null)) || fail;
  }

  const form = new FormData();
  form.append('image', file);
  const res = await fetch(`${apiBase}${base}/scan/label`, {
    method: 'POST',
    headers: { ...(isGuest ? {} : await authHeader()) }, // browser sets the multipart boundary
    body: form,
  });
  return res.ok ? res.json() : (await res.json().catch(() => null)) || fail;
}

// POST the extracted ingredients to /verdict. Authed → personal note + focus
// escalation; guest → universal layer only (or a { gate } soft-gate).
// `personalize:false` (authed, no stored goal) → universal layer + the in-card
// goal ask, no note composed and no free taste consumed.
async function fetchVerdict({ ingredients, goal, nonNegotiables, focuses, nutrition, personalize = true, isGuest }) {
  const path = isGuest ? '/api/guest/verdict' : '/api/verdict';
  const body = isGuest
    ? { ingredients }
    : { ingredients, goal, nonNegotiables, focuses, nutrition, personalize };
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(isGuest ? {} : await authHeader()) },
    body: JSON.stringify(body),
  });
  if (res.ok) return res.json();
  const b = await res.json().catch(() => null);
  if (b && b.message) return { error: true, message: b.message };
  throw new Error("Couldn't reach the verdict service — try again.");
}

export async function runProductScan({ mode, barcode, file, goal = '', nonNegotiables = [], focuses = [], personalize = true }) {
  if (IS_DEMO) {
    await delay(mode === 'label' ? 1100 : 600);
    return demoScanCard({ personalize });
  }

  const isGuest = await isGuestSession();

  const ex = await scanExtract({ mode, barcode, file, isGuest });
  if (ex?.gate) return { gate: true, reason: ex.reason };
  if (ex?.error) return { error: true, message: ex.message };

  const ingredients = String(ex?.ingredients || '').trim();
  if (!ingredients) {
    // Product not found, or found but no readable ingredients → the type-it path.
    return { found: false, source: ex?.source || 'none', product: ex?.product || null, message: ex?.message };
  }

  const nutrition = ex?.nutrition || null;
  const verdict = await fetchVerdict({ ingredients, goal, nonNegotiables, focuses, nutrition, personalize, isGuest });
  if (verdict?.gate) return { gate: true, reason: verdict.reason };
  if (verdict?.error) return { error: true, message: verdict.message, product: ex.product, source: ex.source };

  // Keep ingredients + nutrition on the result so the caller can recompose the
  // personalized note in place after a goal tap — no second extraction, no re-scan.
  return { found: true, source: ex.source, product: ex.product, verdict, ingredients, nutrition };
}

// Recompose the personalized (goal-aware) verdict for a product already scanned —
// the in-card "tap a goal → reveal my read in place" path. Reuses the extracted
// ingredients + nutrition, so there's no second extraction. Authed only.
export async function requestGoalNote({ ingredients, nutrition = null, goal = '', nonNegotiables = [], focuses = [] }) {
  if (IS_DEMO) {
    await delay(700);
    return demoScanCard({ personalize: true }).verdict;
  }
  return fetchVerdict({ ingredients, goal, nonNegotiables, focuses, nutrition, personalize: true, isGuest: false });
}
