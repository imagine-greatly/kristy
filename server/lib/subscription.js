// Subscription state — the ONE place feature access is decided.
//
// Provider-agnostic by design: features are gated on the internal `status` +
// expiry below, never on "has a Stripe record". Stripe (web) is the first
// provider to write this state; Apple IAP (mobile) will write the same shape
// later. Both flow through upsertSubscription() and are read the same way here.
//
// The premium rule (mirrors public.is_premium() in schema.sql):
//   premium  ⇔  status ∈ {trialing, active}  AND  effective expiry > now
// where the effective expiry is current_period_end for a paid sub, or
// trial_ends_at for the promo trial. Expiry is evaluated AT READ TIME, so a
// promo trial that has lapsed reads as expired with no cron needed.

import { getSubscription, upsertSubscription } from './store.js';

const TRIAL_DAYS = 7;
const DAY_MS = 86400000;

/**
 * Pure premium check over a subscription row. No I/O — unit-testable.
 * @param {object|null} row  a subscriptions row (or null when there is none)
 * @param {Date} now
 * @returns {boolean}
 */
export function evaluatePremium(row, now = new Date()) {
  if (!row) return false;
  if (row.status !== 'trialing' && row.status !== 'active') return false;
  // Paid subs carry current_period_end; the promo trial carries trial_ends_at.
  const end = row.current_period_end || row.trial_ends_at;
  if (!end) return false;
  return new Date(end).getTime() > now.getTime();
}

/**
 * Days left in the trial (0 if expired / not trialing / no trial date).
 * Rounded up so "6.2 days left" reads as "7 days left" on the first day.
 */
export function trialDaysLeft(row, now = new Date()) {
  if (!row || row.status !== 'trialing' || !row.trial_ends_at) return 0;
  const ms = new Date(row.trial_ends_at).getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / DAY_MS);
}

/**
 * The subscription snapshot the client needs to render trial/upgrade UI.
 * Safe to call for any user; returns a non-premium snapshot when there's no row.
 */
export function subscriptionSummary(row, now = new Date()) {
  const premium = evaluatePremium(row, now);
  return {
    premium,
    status: row?.status || 'none',
    provider: row?.provider || null,
    trialEndsAt: row?.trial_ends_at || null,
    currentPeriodEnd: row?.current_period_end || null,
    trialDaysLeft: trialDaysLeft(row, now),
    // A promo trial that has lapsed and never converted: the client uses this to
    // show "trial ended — upgrade" rather than a live countdown.
    trialExpired:
      !premium && row?.provider === 'promo' && row?.status === 'trialing',
  };
}

/** Fetch + evaluate premium for a user id. Non-throwing. */
export async function isPremium(userId) {
  const row = await getSubscription(userId);
  return evaluatePremium(row);
}

/**
 * Per-request premium check. Caches on the request object so the chat pipeline,
 * insight logic, and weight/weekly gates all share ONE database read per request.
 */
export async function premiumForReq(req) {
  if (req._premiumChecked) return req._premium;
  req._premium = await isPremium(req.user.id);
  req._premiumChecked = true;
  return req._premium;
}

/**
 * Ensure a brand-new user has a trial. Idempotent — if a subscription row
 * already exists (trial, active, or expired) it is left untouched, so a
 * re-onboard or a returning paid user never resets their state.
 * @returns {Promise<object|null>} the trial row, the existing row, or null on failure.
 */
export async function ensureTrial(userId) {
  try {
    const existing = await getSubscription(userId);
    if (existing) return existing;
    const trialEnds = new Date(Date.now() + TRIAL_DAYS * DAY_MS).toISOString();
    return await upsertSubscription(userId, {
      status: 'trialing',
      provider: 'promo',
      trial_ends_at: trialEnds,
    });
  } catch (err) {
    // Table not migrated yet, or a transient write failure — never break
    // onboarding over this. The user is simply non-premium until it succeeds.
    console.error('[kristy] ensureTrial failed:', err.message);
    return null;
  }
}

/* ───────────────────────── Provider status mapping ─────────────────────────
   Translate a Stripe subscription status into our internal vocabulary. Apple
   will get its own mapper when that provider lands; the internal values are the
   contract everything else depends on. */
export function mapStripeStatus(stripeStatus) {
  switch (stripeStatus) {
    case 'trialing':
      return 'trialing';
    case 'active':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete_expired':
      return 'expired';
    case 'incomplete':
      // Payment not yet completed — not premium, treat as past_due until it
      // resolves to active (or expires).
      return 'past_due';
    default:
      return 'expired';
  }
}
