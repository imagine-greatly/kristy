// SINGLE SOURCE for launch pricing DISPLAY (mobile) — the fallback strings shown
// until RevenueCat offerings load. Once offerings load, the store's priceString
// is the source of truth (Apple prices are tier-based and region-localized), so
// these are only the pre-load / IAP-unavailable fallback.
//
// Keep the numbers in sync with client/src/lib/pricing.js. Nothing else in the
// mobile app should hardcode a price literal — import from here.
//
// Launch math: $59.99/yr ÷ 12 ≈ $5.00/mo; vs $7.99 × 12 = $95.88 that's ~37% off.

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
    price: '$59.99',
    per: '/year',
    note: 'About $5/month, billed yearly',
    badge: 'Save 37%',
  },
  monthly: {
    label: 'Monthly',
    price: '$7.99',
    per: '/month',
    note: 'Billed monthly, cancel anytime',
    badge: null,
  },
};

// Annual first — the value plan we lead with.
export const PLAN_ORDER: PlanId[] = ['annual', 'monthly'];
