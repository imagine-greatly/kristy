// Shared in-memory IP rate limiter for the anonymous "try-first" surface.
// One sliding window, one Map — so guest chat and guest verdict draw from the
// SAME budget per IP (a guest can't get 8 free chats AND 8 free verdicts).
// Good enough for a single instance; swap for a shared store if this ever runs
// multi-process. Only real inference requests should consume a slot.

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

// Exported for the tests: a budget guarantee is worth asserting against the real numbers
// rather than against a copy of them.
export const BUDGETS = {
  guest: { windowMs: WINDOW_MS, max: MAX_PER_WINDOW },
  cartBuild: { windowMs: CART_WINDOW_MS, max: CART_MAX_PER_WINDOW },
  counterAsk: { windowMs: COUNTER_WINDOW_MS, max: COUNTER_MAX_PER_WINDOW },
};
