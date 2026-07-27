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
