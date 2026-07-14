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
