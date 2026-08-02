// SINGLE SOURCE for launch pricing DISPLAY (mobile) — the fallback strings shown
// until RevenueCat offerings load. Once offerings load, the store's priceString
// is the source of truth (Apple prices are tier-based and region-localized), so
// these are only the pre-load / IAP-unavailable fallback.
//
// Keep the numbers in sync with client/src/lib/pricing.js. Nothing else in the
// mobile app should hardcode a price literal — import from here.
//
// Launch math: $45/yr ÷ 12 = $3.75/mo exactly; vs $5 × 12 = $60 that is $15, or 25%
// off. Recompute BOTH lines whenever either price moves — the previous note read
// "About $5/month, billed yearly", which became a lie the moment monthly hit $5.

export type PlanId = 'annual' | 'monthly';

export const PRICING: Record<PlanId, {
  label: string;
  price: string;
  per: string;
  note: string;
  badge: string | null;
}> = {
  annual: {
    label: 'Annual',
    price: '$45',
    per: '/year',
    note: '$3.75/month, billed yearly',
    badge: 'Save 25%',
  },
  monthly: {
    label: 'Monthly',
    price: '$5',
    per: '/month',
    note: 'Billed monthly, cancel anytime',
    badge: null,
  },
};

// Annual first — the value plan we lead with.
export const PLAN_ORDER: PlanId[] = ['annual', 'monthly'];
