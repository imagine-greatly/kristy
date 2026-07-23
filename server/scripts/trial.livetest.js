// Acceptance — the trial is decoupled from goal-set and granted ONLY by an explicit,
// idempotent, at-the-gate action. Reverses the "any goal-set grants the trial" change,
// which had (a) skipped the 3-free-notes mechanic (a trialing user is premium, so
// free_notes_used never increments) and (b) burned a weekly-cadence trial on a casual tap.
//
// Two halves: pure logic (goal ≠ premium ⇒ the counter decrements; a granted trial lifts
// the gate; the grant is idempotent in shape), and wiring (goal-set routes no longer grant;
// the explicit POST /api/subscription/trial exists and calls ensureTrial; the client offers
// it from the withheld read AND the Upgrade screen).
//   node scripts/trial.livetest.js

import { readFileSync } from 'node:fs';
import {
  decidePersonalization,
  evaluatePremium,
  subscriptionSummary,
  trialDaysLeft,
  FREE_NOTE_LIMIT,
} from '../lib/subscription.js';
import subscriptionRouter from '../routes/subscription.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };
const src = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

/* ───────── A. Goal ≠ premium ≠ trial → the counter decrements ───────── */
console.log('\n═══ A · A signed-in FREE user WITH A GOAL still spends the 3 tastes ═══');
// Setting a goal grants no subscription row, so the user is not premium…
ck('no subscription row (goal-only user) → NOT premium', !evaluatePremium(null));
// …therefore decidePersonalization consumes a free taste each scan until the gate.
const free = (used) => decidePersonalization({ premium: false, freeNotesUsed: used });
const counter = []; // simulate the server incrementing free_notes_used on each consumed taste
let used = 0;
for (let i = 0; i < 5; i++) {
  const d = free(used);
  counter.push({ used, personalized: d.personalized, consumesFree: d.consumesFree });
  if (d.consumesFree) used += 1; // incrementFreeNotesUsed
}
ck('taste 1 (used 0) → personalized + increments the counter', counter[0].personalized && counter[0].consumesFree);
ck('taste 2 (used 1) → personalized + increments', counter[1].personalized && counter[1].consumesFree);
ck('taste 3 (used 2) → personalized + increments', counter[2].personalized && counter[2].consumesFree);
ck('counter reached the limit after 3 tastes', used === FREE_NOTE_LIMIT);
ck('scan 4 (used 3) → GATED, no further increment', !counter[3].personalized && !counter[3].consumesFree);
ck('scan 5 (used 3) → still gated (counter frozen at the limit)', !counter[4].personalized && used === FREE_NOTE_LIMIT);

/* ───────── B. The explicit trial, once started, lifts the gate ───────── */
console.log('\n═══ B · The EXPLICIT trial (started at the gate) makes the user premium ═══');
const future = new Date(Date.now() + 7 * 86400000).toISOString();
const granted = { provider: 'promo', status: 'trialing', trial_ends_at: future };
ck('granted promo trial → premium', evaluatePremium(granted));
ck('granted trial → 7 days left', trialDaysLeft(granted) === 7);
ck('a member/trial never spends a taste', decidePersonalization({ premium: true, freeNotesUsed: 0 }).personalized && !decidePersonalization({ premium: true, freeNotesUsed: 0 }).consumesFree);
const sum = subscriptionSummary(granted);
ck('summary reports premium + trialing', sum.premium && sum.status === 'trialing' && sum.trialDaysLeft === 7);

/* ───────── C. ensureTrial is idempotent by shape (never restarts / disturbs) ───────── */
console.log('\n═══ C · ensureTrial idempotency — an existing row is left untouched ═══');
// ensureTrial returns the EXISTING row when there is one (see the guard in subscription.js),
// so these pre-existing states are what a repeat "start trial" tap resolves to — unchanged.
const past = new Date(Date.now() - 86400000).toISOString();
ck('a consumed/expired trial stays NOT premium (no restart)', !evaluatePremium({ provider: 'promo', status: 'trialing', trial_ends_at: past }));
ck('a paying member stays premium (grant never disturbs them)', evaluatePremium({ provider: 'stripe', status: 'active', current_period_end: future }));
const ensureSrc = src('../lib/subscription.js');
ck('ensureTrial keeps the "if (existing) return existing" idempotency guard', /if\s*\(existing\)\s*return existing;/.test(ensureSrc));

/* ───────── D. Wiring — goal-set no longer grants; the trial has ONE explicit door ───────── */
console.log('\n═══ D · Wiring: goal-set decoupled, one explicit trial endpoint, two surfaces ═══');
const onboardingSrc = src('../routes/onboarding.js');
ck('server: /onboarding routes NO LONGER call ensureTrial (goal-set ≠ trial)', !/ensureTrial/.test(onboardingSrc));
const subRouteSrc = src('../routes/subscription.js');
ck('server: subscription route grants via ensureTrial on POST /subscription/trial', /ensureTrial/.test(subRouteSrc) && /\/subscription\/trial/.test(subRouteSrc));
const trialLayer = subscriptionRouter.stack.find((l) => l.route?.path === '/subscription/trial');
ck('server: POST /subscription/trial is actually registered on the router', !!trialLayer && !!trialLayer.route.methods.post);

const apiSrc = src('../../client/src/lib/api.js');
ck('client: startTrial() POSTs to /api/subscription/trial', /startTrial/.test(apiSrc) && /\/api\/subscription\/trial/.test(apiSrc));
const appSrc = src('../../client/src/App.jsx');
ck('client: goal-set (persistGoal/onboarding) no longer force-refreshes a "just granted" sub', !/trial just granted/.test(appSrc));
ck('client: handleStartTrial is the single grant path, wired to trackEvent', /handleStartTrial/.test(appSrc) && /trial_started/.test(appSrc));
ck('client: withheld read (ScanSheet) is handed onStartTrial + trialEligible', /onStartTrial=\{handleStartTrial\}/.test(appSrc) && /trialEligible=\{trialEligible\}/.test(appSrc));
ck('client: the Upgrade screen is handed onStartTrial + trialEligible', (appSrc.match(/onStartTrial=\{handleStartTrial\}/g) || []).length >= 2);
const sheetSrc = src('../../client/src/components/ScanSheet.jsx');
ck('client: ScanSheet offers "Start my free week" to an eligible authed user', /canStartTrial/.test(sheetSrc) && /Start my free week/.test(sheetSrc));
const upgradeSrc = src('../../client/src/components/Upgrade.jsx');
ck('client: Upgrade offers the trial as its primary CTA when eligible', /offerTrial/.test(upgradeSrc) && /beginTrial/.test(upgradeSrc) && /Start my free week/.test(upgradeSrc));

console.log('\n═══ THE LINE ═══');
console.log('  set a goal:        no trial, no premium  →  the 3 free tastes still count down');
console.log('  spend 3 tastes:    gated                 →  the withheld read + Upgrade offer the trial');
console.log('  start trial (once):premium for 7 days    →  idempotent; never restarts, never on a goal tap');

console.log(`\n${fails === 0 ? 'ALL TRIAL CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
process.exit(fails === 0 ? 0 : 1);
