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
// THE ANNUAL PER-MONTH FIGURE IS THE ONE THAT GOES WRONG. $45/yr ÷ 12 = $3.75/mo
// exactly, and against $5 × 12 = $60 that is $15, or 25% off. The previous copy
// read "About $5/month, billed yearly" — correct against $59.99, and it would have
// become a lie the moment monthly moved to $5, advertising the annual plan as
// identical to the monthly one. Recompute both lines whenever either price moves.

export const PRICING = {
  annual: {
    id: 'annual',
    label: 'Annual',
    price: '$45',
    per: '/year',
    amount: '$45/year', // full inline form, in her voice
    note: '$3.75/month, billed yearly',
    badge: 'Save 25%',
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: '$5',
    per: '/month',
    amount: '$5/month',
    note: 'Cancel anytime',
    badge: null,
  },
};

// Annual first — it's the value plan we lead with.
export const PLAN_ORDER = ['annual', 'monthly'];

/** The inline price phrase for a plan, e.g. "$45/year". */
export function planAmount(plan) {
  return (PRICING[plan] || PRICING.monthly).amount;
}

/* ═══════════════════════════ The upgrade copy ═══════════════════════════
   One place, because it appears on two surfaces (the full-read gate and the
   list-save gate) and drifted copy on a paywall is the worst kind.

   No urgency, no countdown, no "limited time". The COUNT is the argument, and
   the frame is a nutritionist rather than another scanner — the Counter's real
   advantage is the questions a shopper did not know to ask. */
export const UPGRADE_COPY = {
  read: {
    headline: '82 cards. Every counter in the store.',
    body:
      'The summary stays free, always. The full read is what to look for, the traps '
      + 'that catch people, and why the call carries the tier it does.',
    frame:
      'A nutritionist answers the questions you bring. This one answers the questions '
      + 'you didn’t know to ask, in the aisle, while it still matters.',
  },
  list: {
    // The concrete line LEADS. An earlier draft opened "The cart is yours. Keeping it
    // is the membership" — two clauses where the second inverts the first for cadence
    // and says nothing you can act on. `copulaAbstraction` in counterCardLint now
    // reports that shape; it did not exist when the line was written.
    headline: (n) => `${n === 1 ? 'One item' : `${n} items`}, and the read behind each one.`,
    body:
      'Next week it is still here, and so is what you decided. The swaps you took and '
      + 'the ones you turned down come with it.',
  },
};

/** "4 more checks, 2 traps, and why this carries the tier." — built from real counts. */
export function teaserMore({ look_for = 0, watch_out = 0, tier_note = false } = {}) {
  const bits = [];
  if (look_for > 0) bits.push(`${look_for} more check${look_for === 1 ? '' : 's'}`);
  if (watch_out > 0) bits.push(`${watch_out} trap${watch_out === 1 ? '' : 's'}`);
  if (!bits.length) return tier_note ? 'Why this carries the tier.' : '';
  const tail = tier_note ? ', and why this carries the tier' : '';
  return `${bits.join(', ')}${tail}.`;
}
