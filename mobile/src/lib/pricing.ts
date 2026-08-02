// SINGLE SOURCE for launch pricing DISPLAY (mobile) — the fallback strings shown until
// RevenueCat offerings load. Once offerings load, the store's priceString is the source of
// truth (Apple prices are tier-based and region-localized), so these are only the pre-load
// / IAP-unavailable fallback.
//
// ═══ TWO NUMBERS ARE AUTHORED. EVERYTHING ELSE IS DERIVED. ═══
//
// Same rule as client/src/lib/pricing.js, and keep the two numbers in sync with it. The
// effective monthly and the saving percentage are ARITHMETIC, not copy, and they were
// hand-written twice and wrong twice — most recently "Save 25%" against $5.99/$44.99,
// where the real saving is 37%. A wrong percentage on a pricing screen is the one copy
// error that costs trust immediately, so it is no longer possible to write one down.
//
// `server/lib/pricing.test.js` fails if any price, saving or per-month figure is hardcoded
// outside the two pricing modules — that test is what caught this file.
//
// Integer cents, because 5.99 * 12 in floating point is 71.88000000000001.
const MONTHLY_CENTS = 599;
const ANNUAL_CENTS = 4499;

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export const ANNUALIZED_MONTHLY_CENTS = MONTHLY_CENTS * 12;
export const EFFECTIVE_MONTHLY_CENTS = Math.round(ANNUAL_CENTS / 12);

// FLOORED, never rounded — understating by a fraction of a point costs nothing, and
// overstating a saving is the error that matters.
export const SAVING_PERCENT = Math.floor(
  (1 - ANNUAL_CENTS / ANNUALIZED_MONTHLY_CENTS) * 100
);

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
    price: money(ANNUAL_CENTS),
    per: '/year',
    note: `${money(EFFECTIVE_MONTHLY_CENTS)}/month, billed yearly`,
    badge: `Save ${SAVING_PERCENT}%`,
  },
  monthly: {
    label: 'Monthly',
    price: money(MONTHLY_CENTS),
    per: '/month',
    note: 'Cancel anytime',
    badge: null,
  },
};

// Annual first — the value plan we lead with.
export const PLAN_ORDER: PlanId[] = ['annual', 'monthly'];
