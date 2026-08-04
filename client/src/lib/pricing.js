// SINGLE SOURCE for launch pricing DISPLAY (web).
//
// This module holds the human-readable price *strings* the UI renders. It does NOT hold
// Stripe price ids — those live only in server env (STRIPE_PRICE_MONTHLY /
// STRIPE_PRICE_ANNUAL) and the client never sees them. The client sends a plan name
// ('monthly' | 'annual'); the server maps it to the real price id.
//
// ═══ TWO NUMBERS ARE AUTHORED. EVERYTHING ELSE IS DERIVED. ═══
//
// The effective monthly and the saving percentage are ARITHMETIC, not copy, and they were
// hand-written twice and wrong twice. At $7.99/$59.99 the note read "About $5/month" —
// correct then. When monthly moved to $5 that line advertised the annual plan as identical
// to the monthly one. It was rewritten to "$3.75/month … Save 25%", which was right for
// $5/$45 and wrong the moment the real prices ($5.99/$44.99) landed: the true saving is
// 37%, not 25%.
//
// A wrong percentage on a pricing page is the one copy error that costs trust immediately,
// so it is no longer possible to write one down. Change MONTHLY_CENTS or ANNUAL_CENTS and
// every string below follows. `server/lib/pricing.test.js` asserts the displayed figures
// against the arithmetic.
//
// Integer cents, because 5.99 * 12 in floating point is 71.88000000000001.
const MONTHLY_CENTS = 599;
const ANNUAL_CENTS = 4499;

const money = (cents) => `$${(cents / 100).toFixed(2)}`;

/** What a year of the monthly plan costs. The honest baseline for any saving claim. */
export const ANNUALIZED_MONTHLY_CENTS = MONTHLY_CENTS * 12; // 7188

/** The annual plan expressed per month. Rounded to the cent: 4499/12 = 374.916… → $3.75. */
export const EFFECTIVE_MONTHLY_CENTS = Math.round(ANNUAL_CENTS / 12);

// FLOORED, never rounded. 37.4% rounds to 37 either way, but a future pair of prices
// landing on 37.6 would ROUND UP to 38 and we would be claiming a saving that does not
// exist. Understating by a fraction of a point costs nothing; overstating is the error.
export const SAVING_PERCENT = Math.floor(
  (1 - ANNUAL_CENTS / ANNUALIZED_MONTHLY_CENTS) * 100
);

export const PRICING = {
  annual: {
    id: 'annual',
    label: 'Annual',
    price: money(ANNUAL_CENTS),
    per: '/year',
    amount: `${money(ANNUAL_CENTS)}/year`, // full inline form, in her voice
    note: `${money(EFFECTIVE_MONTHLY_CENTS)}/month, billed yearly`,
    badge: `Save ${SAVING_PERCENT}%`,
  },
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    price: money(MONTHLY_CENTS),
    per: '/month',
    amount: `${money(MONTHLY_CENTS)}/month`,
    note: 'Cancel anytime',
    badge: null,
  },
};

// Annual first — it's the value plan we lead with.
export const PLAN_ORDER = ['annual', 'monthly'];

/** The inline price phrase for a plan, e.g. "$44.99/year". */
export function planAmount(plan) {
  return (PRICING[plan] || PRICING.monthly).amount;
}

/* ═══════════════════════════ The upgrade copy ═══════════════════════════
   One place, because it appears on two surfaces (the full-read gate and the list-save
   gate) and drifted copy on a paywall is the worst kind.

   No urgency, no countdown, no "limited time". The COUNT is the argument, and the frame
   is a nutritionist rather than another scanner — the Counter's real advantage is the
   questions a shopper did not know to ask. */
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
  // THERE IS NO `list` ENTRY, AND ADDING ONE BACK MEANS SELLING SOMETHING FREE. It read
  // "Next week it is still here" — but the list has been persisted server-side for every
  // signed-in shopper the whole time, so the sentence described no capability the reader
  // did not already have. The list is free: building, saving, keeping, the attached cards.
  // The membership is the full read, and `read` above is the only ask.
};

/** "4 more checks, 2 traps." — built from real counts.
 *
 *  NO LONGER COUNTS THE TIER NOTE. That sentence became free on 2026-08-04 when the tier
 *  chip was removed and the tier had to reach a free reader some other way — so it now sits
 *  on the summary, above this tap. Advertising it as something waiting behind the tap would
 *  be teasing the reader with a line already on their screen. */
export function teaserMore({ look_for = 0, watch_out = 0 } = {}) {
  const bits = [];
  if (look_for > 0) bits.push(`${look_for} more check${look_for === 1 ? '' : 's'}`);
  if (watch_out > 0) bits.push(`${watch_out} trap${watch_out === 1 ? '' : 's'}`);
  if (!bits.length) return '';
  return `${bits.join(', ')}.`;
}
