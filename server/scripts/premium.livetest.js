// Acceptance — the repositioned free/paid gate (Step 11). All pure logic; no
// network, no model. Proves: free gets 3 personalized tastes then the gate holds,
// and the premium check is provider-agnostic (Stripe + RevenueCat/Apple + trial).
//   node scripts/premium.livetest.js

import { decidePersonalization, evaluatePremium, FREE_NOTE_LIMIT } from '../lib/subscription.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };

console.log('\n═══ FREE TASTES → then the gate ═══');
ck('limit is 3', FREE_NOTE_LIMIT === 3);
const d = (premium, used) => decidePersonalization({ premium, freeNotesUsed: used });
ck('free taste #1 (used 0) → personalized, consumes', d(false, 0).personalized && d(false, 0).consumesFree);
ck('free taste #2 (used 1) → personalized, consumes', d(false, 1).personalized && d(false, 1).consumesFree);
ck('free taste #3 (used 2) → personalized, consumes', d(false, 2).personalized && d(false, 2).consumesFree);
ck('after 3 (used 3) → GATED (no note)', !d(false, 3).personalized && !d(false, 3).consumesFree);
ck('after 3 (used 10) → still gated', !d(false, 10).personalized);
ck('member (premium) → always personalized, never spends a taste', d(true, 0).personalized && !d(true, 0).consumesFree && d(true, 99).personalized && !d(true, 99).consumesFree);

console.log('\n═══ PROVIDER-AGNOSTIC premium (Stripe + RevenueCat/Apple + trial) ═══');
const future = new Date(Date.now() + 86400000).toISOString();
const past = new Date(Date.now() - 86400000).toISOString();
ck('Stripe active → premium', evaluatePremium({ provider: 'stripe', status: 'active', current_period_end: future }));
ck('RevenueCat/Apple active → premium (same shape, any provider)', evaluatePremium({ provider: 'revenuecat', status: 'active', current_period_end: future }));
ck('Apple active → premium', evaluatePremium({ provider: 'apple', status: 'active', current_period_end: future }));
ck('promo trial (in window) → premium', evaluatePremium({ provider: 'promo', status: 'trialing', trial_ends_at: future }));
ck('expired trial → NOT premium', !evaluatePremium({ provider: 'promo', status: 'trialing', trial_ends_at: past }));
ck('canceled (even if period not elapsed) → NOT premium', !evaluatePremium({ provider: 'stripe', status: 'canceled', current_period_end: future }));
ck('no subscription row → NOT premium', !evaluatePremium(null));

console.log('\n═══ THE LINE ═══');
console.log('  free (past tastes): universal layer only  →  gated:true, note:null');
console.log('  free (first 3):     full personalization  →  the "it knows me" hook');
console.log('  member/trial:       full personalization  →  always');

console.log(`\n${fails === 0 ? 'ALL PREMIUM CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
process.exit(fails === 0 ? 0 : 1);
