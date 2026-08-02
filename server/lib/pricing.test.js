// THE DISPLAYED PRICE MUST MATCH THE ARITHMETIC.
//
// A wrong percentage on a pricing page is the one copy error that costs trust
// immediately, and this one has been wrong twice by hand:
//
//   $7.99 / $59.99  →  note "About $5/month"           correct at the time
//   $5    / $45     →  the same note became a LIE, advertising annual as identical
//                      to monthly. Rewritten to "$3.75/month … Save 25%".
//   $5.99 / $44.99  →  "Save 25%" wrong again. The real saving is 37%.
//
// So the strings are derived from two authored numbers and this asserts the derivation.
// It imports the CLIENT module deliberately: that is where the displayed copy lives, and
// a test that re-implemented the maths would agree with itself while the page was wrong.
// `deployBoundary.test.js` excludes *.test.js by name — a test is not shipped and
// legitimately reads the repo it is testing.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  PRICING, PLAN_ORDER, SAVING_PERCENT, EFFECTIVE_MONTHLY_CENTS, ANNUALIZED_MONTHLY_CENTS,
} from '../../client/src/lib/pricing.js';

// Parse the money back OUT of the rendered string, so this checks what a shopper reads
// rather than the constants behind it.
const cents = (s) => Math.round(parseFloat(String(s).replace(/[^0-9.]/g, '')) * 100);

test('the two prices render as authored', () => {
  assert.equal(PRICING.monthly.price, '$5.99');
  assert.equal(PRICING.annual.price, '$44.99');
  assert.equal(PRICING.monthly.amount, '$5.99/month');
  assert.equal(PRICING.annual.amount, '$44.99/year');
});

test('the annualized monthly baseline is twelve months of the monthly plan', () => {
  assert.equal(ANNUALIZED_MONTHLY_CENTS, cents(PRICING.monthly.price) * 12);
  assert.equal(ANNUALIZED_MONTHLY_CENTS, 7188); // $71.88
});

test('the effective monthly on the annual plan is the annual price over twelve', () => {
  const annual = cents(PRICING.annual.price);
  assert.equal(EFFECTIVE_MONTHLY_CENTS, Math.round(annual / 12));
  // And the NOTE the shopper reads carries that same figure.
  assert.equal(cents(PRICING.annual.note), EFFECTIVE_MONTHLY_CENTS);
  assert.match(PRICING.annual.note, /billed yearly/);
});

test('THE SAVING BADGE MATCHES THE ARITHMETIC, and never overstates it', () => {
  const annual = cents(PRICING.annual.price);
  const exact = (1 - annual / ANNUALIZED_MONTHLY_CENTS) * 100; // 37.409…
  assert.equal(SAVING_PERCENT, Math.floor(exact), 'the saving must be FLOORED, not rounded');
  assert.ok(SAVING_PERCENT <= exact, `claims ${SAVING_PERCENT}% but the real saving is ${exact.toFixed(2)}%`);

  const shown = Number(String(PRICING.annual.badge).replace(/[^0-9]/g, ''));
  assert.equal(shown, SAVING_PERCENT, `the badge reads "${PRICING.annual.badge}" against a real saving of ${exact.toFixed(2)}%`);
});

test('annual actually costs less per month than monthly — or it is not a value plan', () => {
  assert.ok(
    EFFECTIVE_MONTHLY_CENTS < cents(PRICING.monthly.price),
    'the annual plan must beat the monthly plan per month, or the hero framing is a lie'
  );
  assert.equal(PLAN_ORDER[0], 'annual', 'annual leads — it is the plan we recommend');
});

test('no price, percentage or per-month figure is written down anywhere but here', async () => {
  // The whole point of deriving is that there is ONE place to change. A literal that
  // drifted would render a stale price beside a correct one.
  const { readFileSync, readdirSync, statSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

  const SKIP = new Set(['node_modules', '.git', 'dist', '.ds-sync', '.design-sync', 'test']);
  const ALLOW = new Set([
    join(ROOT, 'client', 'src', 'lib', 'pricing.js'),   // the source of truth
    join(ROOT, 'server', 'lib', 'pricing.test.js'),     // this file
  ]);
  const MONEY = /\$(?:5\.99|44\.99|3\.75|71\.88)\b|Save\s+\d+%/;

  const offenders = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (SKIP.has(name)) continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!/\.(js|jsx|ts|tsx)$/.test(name)) continue;
      if (ALLOW.has(full)) continue;
      const src = readFileSync(full, 'utf8');
      for (const line of src.split(/\r?\n/)) {
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue; // prose
        if (MONEY.test(line)) offenders.push(`${full.slice(ROOT.length + 1)}: ${line.trim().slice(0, 76)}`);
      }
    }
  };
  walk(join(ROOT, 'client', 'src'));
  walk(join(ROOT, 'mobile', 'src'));
  walk(join(ROOT, 'server', 'lib'));
  walk(join(ROOT, 'server', 'routes'));

  assert.deepEqual(offenders, [], 'a price or saving is hardcoded outside client/src/lib/pricing.js');
});
