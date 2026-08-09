// Shared in-memory IP rate limiter for the anonymous "try-first" surface.
// One sliding window, one Map — so guest chat and guest list compose/import draw
// from the SAME budget per IP (a guest can't get 8 free chats AND 8 free imports).
// Good enough for a single instance; swap for a shared store if this ever runs
// multi-process. Only real inference requests should consume a slot.
//
// ⚠️ THE RULE IS "DOES THIS REACH A MODEL", AND IT IS ANSWERED PER CALL SITE — NEVER
// PER ROUTE BY HAND. Every bucket below exists because that question was answered by
// eye instead, and by eye it has now been wrong in three different directions on four
// routes: the counter spent an inference slot on a KB read, the cart build spent one on
// a template, `/guest/scan/barcode` spent one on a Supabase read followed by an Open
// Food Facts fetch, and `/guest/verdict` spent one on a deterministic KB scoring pass.
// They point different ways precisely because each was decided separately, which is why
// fixing any one of them never surfaced the others. Before adding a limiter to a new
// door, name the model call it protects. If you cannot, it belongs in one of the
// bucketed ceilings below.
//
// ⚠️ THE INFERENCE BUDGET IS SPENT IN HOPS AND THE SHOPPER PERFORMS ACTS, AND THAT GAP
// IS WHAT HALVED IT SILENTLY. `MAX_PER_WINDOW = 8` was authored 2026-07-13, when
// `/api/guest/verdict` WAS the vision call — a guest scan was one hop through one door
// and eight meant eight scans. Three days later (`a672ca8`) the scan doors took over
// extraction and the verdict door became deterministic, so a scan became two hits on
// this bucket and the ceiling became four. Nothing was edited to make that happen and
// nothing reported it: the number stayed 8 and stopped meaning what it was chosen to
// mean. **A budget that meters hops cannot be read as a budget for anything a shopper
// does.** The scan bucket below is therefore sized in SCANS with its arithmetic written
// down, so a third hop cannot halve it again in silence.

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_WINDOW = 8;
const hits = new Map(); // ip -> number[] (timestamps)

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Returns true when the caller is over the limit. Only records a hit when it
// isn't — so a gated request never counts against a future real message.
export function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/* ── Onboarding cart builds — a SEPARATE bucket, deliberately ──────────────────
   Building a cart is a deterministic template operation: no model call, no DB
   write. Per this file's own rule ("only real inference requests should consume a
   slot") it must not spend a stranger's free chats — someone who sets up their
   cart would otherwise arrive at Kristy with a smaller budget than someone who
   skipped. It still needs a ceiling, because the endpoint is public and hands out
   the full-tailoring generation, so it gets its own generous window. */
const CART_WINDOW_MS = 60 * 60 * 1000;
const CART_MAX_PER_WINDOW = 20;
const cartHits = new Map();

export function cartBuildLimited(ip) {
  const now = Date.now();
  const recent = (cartHits.get(ip) || []).filter((t) => now - t < CART_WINDOW_MS);
  if (recent.length >= CART_MAX_PER_WINDOW) {
    cartHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  cartHits.set(ip, recent);
  return false;
}

/* ── Counter questions — a SEPARATE bucket, for the same reason cart builds have one ──
   The counter's free layer is a deterministic KB read: no model call, no inference cost,
   and an anonymous caller can never reach the premium branch that would make one. Per
   this file's own rule at the top — "Only real inference requests should consume a slot"
   — it must not spend a stranger's free chats.

   It did, and that is the bug this bucket exists to close. Asking eight questions at the
   fish counter left a stranger with no guest chat, no guest verdict and no guest scan for
   the hour, so the shopper who used the counter arrived at Kristy with LESS than the one
   who ignored it. CLAUDE.md promised the opposite in as many words: "A guest's counter
   answer also does not spend their free chat run — the model was never called."

   It still needs a ceiling, because the endpoint is public and writes to the gap log. So
   it gets its own generous window, sized for a shopper working through a real trip rather
   than for the cost of inference — there is none. When generation lands in Pass 3 the
   GENERATED path gets its own gate; this one stays the free deterministic read. */
const COUNTER_WINDOW_MS = 60 * 60 * 1000;
const COUNTER_MAX_PER_WINDOW = 40;
const counterHits = new Map();

export function counterAskLimited(ip) {
  const now = Date.now();
  const recent = (counterHits.get(ip) || []).filter((t) => now - t < COUNTER_WINDOW_MS);
  if (recent.length >= COUNTER_MAX_PER_WINDOW) {
    counterHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  counterHits.set(ip, recent);
  return false;
}

/* ── Scanning — a SEPARATE bucket, and the same correction a third time ────────────
   Two of the three hops a guest scan makes reach no model at any point:

     POST /guest/scan/barcode   Supabase read, then an Open Food Facts fetch
     POST /guest/verdict        evaluateIngredients + selectCardIsm + genericSwap,
                                every one of them a synchronous read of an in-memory
                                KB (the handler is not even `async`)

   Only `POST /guest/scan/label` reaches a model, and it keeps the inference bucket.

   ⚠️ THE CEILING IS SIZED IN SCANS, NOT IN REQUESTS, AND THE ARITHMETIC IS THE POINT.
   A barcode scan draws TWICE — the lookup and the verdict that must follow it — so this
   number is twice the scans it permits. Thirty an hour is a real grocery trip's packaged
   half; four (what the shared bucket actually allowed) is not, and "eight" is what
   everyone read because nobody had written the multiplication down. A photo scan draws
   ONCE here, because its extraction hop is a genuine vision call and is billed against
   the inference budget where it belongs.

   It still needs a ceiling: both doors are public, one of them makes an outbound request
   to a third party we do not want to hammer on a stranger's behalf, and the other
   tokenizes an attacker-supplied string. Sized for a shopper working a store, exactly as
   the counter's is. */
const SCAN_WINDOW_MS = 60 * 60 * 1000;
const SCAN_HITS_PER_BARCODE_SCAN = 2; // the lookup, then the verdict
const SCAN_SCANS_PER_WINDOW = 30;
const SCAN_MAX_PER_WINDOW = SCAN_SCANS_PER_WINDOW * SCAN_HITS_PER_BARCODE_SCAN;
const scanHits = new Map();

export function scanLookupLimited(ip) {
  const now = Date.now();
  const recent = (scanHits.get(ip) || []).filter((t) => now - t < SCAN_WINDOW_MS);
  if (recent.length >= SCAN_MAX_PER_WINDOW) {
    scanHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  scanHits.set(ip, recent);
  return false;
}

// Exported for the tests: a budget guarantee is worth asserting against the real numbers
// rather than against a copy of them.
export const BUDGETS = {
  guest: { windowMs: WINDOW_MS, max: MAX_PER_WINDOW },
  cartBuild: { windowMs: CART_WINDOW_MS, max: CART_MAX_PER_WINDOW },
  counterAsk: { windowMs: COUNTER_WINDOW_MS, max: COUNTER_MAX_PER_WINDOW },
  // `scans` is the number a ruling is about; `max` is the number the limiter enforces.
  // Both are exported so a test can assert the relationship rather than restate it.
  scanLookup: {
    windowMs: SCAN_WINDOW_MS,
    max: SCAN_MAX_PER_WINDOW,
    scans: SCAN_SCANS_PER_WINDOW,
    hitsPerScan: SCAN_HITS_PER_BARCODE_SCAN,
  },
};
