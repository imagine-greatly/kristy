// Per-user rate limiting for authenticated, cost-bearing endpoints.
//
// Guest chat already caps anonymous traffic by IP. Authenticated endpoints had
// no ceiling — a single account hammering /api/chat (or photo/barcode/weight)
// is unbounded spend on Claude + USDA + Open Food Facts + Supabase. This applies
// the SAME in-memory sliding-window approach the guest IP limiter uses (see
// routes/guest.js) — no new infra, good enough for a single instance. Swap the
// Map for a shared store (e.g. Redis) if this ever runs multi-process.

/* ───────────────────────── Tunables ─────────────────────────
   Override via env without touching code. Defaults: 60 requests / hour / user. */
export const AUTH_RATE_LIMIT = Number(process.env.AUTH_RATE_LIMIT) || 60;
export const AUTH_RATE_WINDOW_MS =
  Number(process.env.AUTH_RATE_WINDOW_MS) || 60 * 60 * 1000; // 1 hour

// Kristy-voiced line shown when a user trips the limit — never a bare 429.
export const RATE_LIMIT_MESSAGE =
  "You're moving fast — give me a minute and try again.";

/**
 * Create a sliding-window limiter. The returned `limited(key)` returns true when
 * the caller is at/over the cap; it only records a hit when they're under, so a
 * blocked request never counts against the next allowed one.
 *
 * @param {{windowMs:number, max:number}} opts
 */
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map(); // key -> number[] (timestamps within the window)
  return function limited(key) {
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    return false;
  };
}

// One shared instance → the cap is a COMBINED per-user budget across every authed
// cost-bearing endpoint that mounts the middleware below.
const userLimiter = createRateLimiter({
  windowMs: AUTH_RATE_WINDOW_MS,
  max: AUTH_RATE_LIMIT,
});

/**
 * Express middleware — MUST run after requireAuth (it reads req.user.id). On
 * limit it responds with the graceful {error, message} shape the client renders
 * as a normal Kristy bubble.
 */
export function userRateLimit(req, res, next) {
  const userId = req.user?.id;
  if (!userId) return next(); // requireAuth should have set this; fail open rather than block

  if (userLimiter(String(userId))) {
    console.error(
      `[kristy] rate limit: user ${userId} exceeded ${AUTH_RATE_LIMIT}/${
        AUTH_RATE_WINDOW_MS / 60000
      }min on ${req.method} ${req.originalUrl} @ ${new Date().toISOString()}`
    );
    return res.status(429).json({ error: true, message: RATE_LIMIT_MESSAGE });
  }
  next();
}
