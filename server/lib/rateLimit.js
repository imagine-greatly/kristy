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
  "You're moving fast. Give it a minute and try again.";

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

/* ── Building a cart from a sentence — A BUDGET, NOT A GATE ────────────────────────
   This was premium-only, and that was incoherent in the one direction nobody wants: a
   GUEST already gets it free (composeGuestList, behind the shared 8/hour IP budget), so
   signing up made a shopper WORSE OFF at the thing the list is for. The list is free —
   building it included — and the honest answer to a per-use cost is a ceiling, not a wall.

   TWELVE PER DAY, and both halves of that are chosen rather than inherited.

   The WINDOW is a day because a build is a per-TRIP act. Nobody composes a cart on the
   hour; they do it once or twice a week and then edit it. An hourly window is the wrong
   unit twice over — it lets someone burn the whole budget in five minutes and hit a wall
   mid-build, and it resets at 4am when nobody is shopping.

   TWELVE because one full build plus ten refinements ("no fish", "snacks for the kids",
   "swap the rice") is already past the top of any real session, and it sits ABOVE the
   guest's shared eight so the incoherence is fixed rather than inverted — a signed-in free
   shopper is now strictly better off than a stranger, which is the only ordering that makes
   sense. It is a ceiling on a script, not a limit a shopper meets.

   Premium skips it. `userRateLimit` (60/hr across all authed cost-bearing endpoints) still
   sits underneath both, so this is the narrower of two ceilings, never the only one. */
export const LIST_COMPOSE_FREE_LIMIT = Number(process.env.LIST_COMPOSE_FREE_LIMIT) || 12;
const LIST_COMPOSE_WINDOW_MS = 24 * 60 * 60 * 1000;

export const listComposeLimited = createRateLimiter({
  windowMs: LIST_COMPOSE_WINDOW_MS,
  max: LIST_COMPOSE_FREE_LIMIT,
});

// Kristy-voiced, and deliberately NOT an upsell. The ask appears at one moment in this
// product — the fourth full-read tap — and a budget message is not that moment. Saying
// "become a member" here would re-sell the thing that was just made free.
export const LIST_COMPOSE_BUDGET_MESSAGE =
  'That is a lot of rebuilding for one day. The cart is still here, and adding by hand always works.';

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
