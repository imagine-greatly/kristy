// SINGLE SOURCE for launch pricing DISPLAY (web).
//
// This module holds the human-readable price *strings* the UI renders. It does
// NOT hold Stripe price ids — those live only in server env (STRIPE_PRICE_MONTHLY
// / STRIPE_PRICE_ANNUAL) and the client never sees them. The client sends a plan
// name ('monthly' | 'annual'); the server maps it to the real price id.
//
// Keep these numbers in sync with mobile/src/lib/pricing.ts and with the actual
// Stripe prices. Nothing else in the web client should hardcode a price literal —
// import from here.
//
// Launch math (documented, not urgency): $59.99/yr ÷ 12 ≈ $5.00/mo, and vs
// $7.99 × 12 = $95.88 that's ~37% off. "no fake urgency" — factual savings only.

export const PRICING = {
  annual: {
    id: 'annual',
    label: 'Annual',
    price: '$59.99',
    per: '/year',
    amount: '$59.99/year', // full inline form, in her voice
    note: 'About $5/month, billed yearly',
    badge: 'Save 37%',
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: '$7.99',
    per: '/month',
    amount: '$7.99/month',
    note: 'Billed monthly, cancel anytime',
    badge: null,
  },
};

// Annual first — it's the value plan we lead with.
export const PLAN_ORDER = ['annual', 'monthly'];

/** The inline price phrase for a plan, e.g. "$59.99/year". */
export function planAmount(plan) {
  return (PRICING[plan] || PRICING.monthly).amount;
}
