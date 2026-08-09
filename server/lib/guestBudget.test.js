// The free-tier budgets, and which door spends which one.
//
// WHY THIS FILE EXISTS. A budget has now been silently spent through a side door twice.
// First a goal-tap granted a 7-day trial, which killed the 3-free-notes taste mechanic.
// Then the counter's free layer — a deterministic KB read that makes NO model call —
// drew on the shared guest inference budget, so a stranger who asked eight questions at
// the fish counter had no guest chat, verdict or scan left for the hour. Both were
// documented as not happening while they happened.
//
// The rule these pin, from guestRate.js's own header: ONLY REAL INFERENCE REQUESTS
// CONSUME A SLOT. Everything else that needs a ceiling gets its own bucket.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { rateLimited, cartBuildLimited, counterAskLimited, scanLookupLimited, BUDGETS } from './guestRate.js';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Each test uses its own IP so the module-level Maps cannot leak between them.
let n = 0;
const ip = () => `198.51.100.${++n}`;

/* ═══════════════ The buckets are actually separate ═══════════════ */

test('a counter question does NOT spend a guest inference slot', () => {
  // The regression, stated as the guarantee. Exhaust the counter budget entirely, then
  // assert the shared inference budget is untouched — every one of its slots still there.
  const addr = ip();
  for (let i = 0; i < BUDGETS.counterAsk.max; i++) {
    assert.equal(counterAskLimited(addr), false, `counter question ${i + 1} should be allowed`);
  }
  assert.equal(counterAskLimited(addr), true, 'the counter bucket should now be exhausted');

  for (let i = 0; i < BUDGETS.guest.max; i++) {
    assert.equal(
      rateLimited(addr),
      false,
      `guest inference slot ${i + 1} must still be available after ${BUDGETS.counterAsk.max} counter questions`
    );
  }
});

test('a cart build does NOT spend a guest inference slot either', () => {
  // The same rule, already established for cart builds. Pinned so the precedent cannot
  // quietly regress alongside the new one.
  const addr = ip();
  for (let i = 0; i < BUDGETS.cartBuild.max; i++) assert.equal(cartBuildLimited(addr), false);
  for (let i = 0; i < BUDGETS.guest.max; i++) assert.equal(rateLimited(addr), false);
});

test('the counter bucket still HAS a ceiling — the endpoint is public', () => {
  // Not spending inference is not the same as being unbounded. It writes to the gap log.
  const addr = ip();
  for (let i = 0; i < BUDGETS.counterAsk.max; i++) counterAskLimited(addr);
  assert.equal(counterAskLimited(addr), true);
});

test('a blocked request does not count against the next allowed one', () => {
  const addr = ip();
  for (let i = 0; i < BUDGETS.counterAsk.max; i++) counterAskLimited(addr);
  // Hammering while blocked must not extend the block past the window.
  for (let i = 0; i < 5; i++) assert.equal(counterAskLimited(addr), true);
  const other = ip();
  assert.equal(counterAskLimited(other), false, 'a different caller is unaffected');
});

test('a guest SCAN does not spend a guest inference slot', () => {
  // 0c/0d, stated as the guarantee. A barcode scan is a Supabase read plus an Open Food
  // Facts fetch, and the verdict that must follow it is a synchronous KB read — no model
  // on either hop. Exhaust the scan budget entirely and the inference budget must be
  // untouched, or a shopper who scans arrives at guest chat with less than one who did not.
  const addr = ip();
  for (let i = 0; i < BUDGETS.scanLookup.max; i++) {
    assert.equal(scanLookupLimited(addr), false, `scan hit ${i + 1} should be allowed`);
  }
  assert.equal(scanLookupLimited(addr), true, 'the scan bucket should now be exhausted');

  for (let i = 0; i < BUDGETS.guest.max; i++) {
    assert.equal(
      rateLimited(addr),
      false,
      `guest inference slot ${i + 1} must still be available after ${BUDGETS.scanLookup.max} scan hits`
    );
  }
});

test('the scan bucket still HAS a ceiling — both doors are public', () => {
  // One of them makes an outbound request to a third party on a stranger's behalf and the
  // other tokenizes a stranger's string. Not spending inference is not the same as free.
  const addr = ip();
  for (let i = 0; i < BUDGETS.scanLookup.max; i++) scanLookupLimited(addr);
  assert.equal(scanLookupLimited(addr), true);
});

test('the scan ceiling is stated in SCANS, and the arithmetic is not a comment', () => {
  /* The defect this whole change is about was a number that stopped meaning what it was
     chosen to mean, because a scan quietly became two requests and the budget counted
     requests. Pinning the multiplication is what stops a third hop halving it again in
     silence: add one and this fails by name instead of the ceiling drifting. */
  assert.equal(
    BUDGETS.scanLookup.max,
    BUDGETS.scanLookup.scans * BUDGETS.scanLookup.hitsPerScan,
    'the enforced ceiling must equal scans × hits-per-scan, or one of the two is a lie'
  );
  assert.ok(
    BUDGETS.scanLookup.scans >= 20,
    `${BUDGETS.scanLookup.scans} scans an hour is not a grocery trip — that is the number `
    + 'this budget exists to be big enough for'
  );
});

test('the counter ceiling is generous enough for a real trip', () => {
  // Sized for a shopper working a store, not for the cost of inference — there is none
  // on this path. If someone tightens it toward the inference budget, that is the bug
  // coming back.
  assert.ok(
    BUDGETS.counterAsk.max >= 4 * BUDGETS.guest.max,
    `counter budget ${BUDGETS.counterAsk.max} is too close to the inference budget ${BUDGETS.guest.max}`
  );
});

/* ═══════════════ The route uses the right door ═══════════════ */

test('the counter ask route draws on the counter bucket, never the inference one', () => {
  // The behavioural tests above prove the buckets are separate; this proves the route is
  // wired to the correct one. Both matter — separate buckets wired to the wrong door is
  // exactly the state this file was written to end.
  const src = readFileSync(join(__dirname, '..', 'routes', 'perimeter.js'), 'utf8');
  assert.match(src, /counterAskLimited\(/, 'the ask route must use the counter bucket');
  assert.doesNotMatch(
    src,
    /\brateLimited\(/,
    'the counter must never call the shared guest inference limiter — it makes no model call'
  );
});

test('the guest verdict route draws on the scan bucket, never the inference one', () => {
  // It is "deterministic, no model call, no cost" by its own header and drew the inference
  // budget for three weeks anyway. Unlike the counter this door is not optional: every
  // guest scan ends here, so it doubled the price of the front door.
  const src = readFileSync(join(__dirname, '..', 'routes', 'verdict.js'), 'utf8');
  assert.match(src, /scanLookupLimited\(/, 'the guest verdict must use the scan bucket');
  assert.doesNotMatch(
    src,
    /\brateLimited\(/,
    'the guest verdict makes no model call and must never draw the inference budget'
  );
});

test('the two guest scan doors draw DIFFERENT buckets, and the split is the model call', () => {
  /* A file-wide grep cannot check this one: scan.js legitimately contains both limiters,
     so the assertion has to be made per handler. Which is the whole finding — "scan" is
     the name of a surface, and the budget follows the model call rather than the name. */
  const src = readFileSync(join(__dirname, '..', 'routes', 'scan.js'), 'utf8');
  const guestSrc = src.slice(src.indexOf('export const guestScanRouter'));
  assert.ok(guestSrc, 'guest scan router not found — this test is measuring nothing');

  const handlers = nonEmpty(guestSrc.split('guestScanRouter.post(').slice(1), 'guest scan handlers', 2);
  const barcode = handlers.find((h) => h.startsWith("'/scan/barcode'"));
  const label = handlers.find((h) => h.startsWith("'/scan/label'"));
  assert.ok(barcode && label, 'both guest scan handlers must be found by name');

  assert.match(barcode, /scanLookupLimited\(/, 'the barcode door reaches no model — scan bucket');
  assert.doesNotMatch(barcode, /\brateLimited\(/, 'a Supabase read and an OFF fetch are not inference');

  assert.match(label, /\brateLimited\(/, 'the label door IS a vision call — inference bucket');
  assert.doesNotMatch(label, /scanLookupLimited\(/, 'a real model call must be billed as one');
});
