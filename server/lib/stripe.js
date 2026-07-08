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

/** First allowed client origin — where Checkout/portal redirect back to. */
export function clientOrigin() {
  return (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')[0]
    .trim();
}
