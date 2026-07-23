// Stripe client + price config. Web billing is the FIRST payment provider;
// everything it does writes the provider-agnostic subscriptions state (see
// lib/subscription.js), never a Stripe-specific feature gate.
//
// The whole module degrades to "not configured" when STRIPE_SECRET_KEY is unset,
// so the app boots and runs (free + trial features intact) with no Stripe keys —
// only the billing endpoints return a clean 503.

import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = secretKey ? new Stripe(secretKey) : null;

export const PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || '';
export const PRICE_ANNUAL = process.env.STRIPE_PRICE_ANNUAL || '';

/** True when the secret key AND both price ids are present. */
export function stripeReady() {
  return !!stripe && !!PRICE_MONTHLY && !!PRICE_ANNUAL;
}

/**
 * Resolve the configured Stripe price id for a plan. Returns '' when that plan's
 * price id is unset in env — the caller MUST treat '' as "not configured" and
 * fail loudly rather than call Stripe with an empty price (which would 400).
 */
export function priceIdForPlan(plan) {
  return plan === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY;
}

/**
 * Which required Stripe env vars are missing, by name — for a loud, specific log
 * when checkout can't run. Empty array ⇒ fully configured.
 */
export function missingStripeConfig() {
  const missing = [];
  if (!stripe) missing.push('STRIPE_SECRET_KEY');
  if (!PRICE_MONTHLY) missing.push('STRIPE_PRICE_MONTHLY');
  if (!PRICE_ANNUAL) missing.push('STRIPE_PRICE_ANNUAL');
  return missing;
}

/** First allowed client origin — where Checkout/portal redirect back to. */
export function clientOrigin() {
  return (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')[0]
    .trim();
}
