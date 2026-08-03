// THE LOOP, END TO END, WITH REAL POINTER CLICKS.
//
//   node test/loop.mjs
//
//   build a trip → check items → complete it → start the next from "same as last week"
//   → the items arrive UNCHECKED with cardSlug and cardSection intact.
//
// The claim is a SEQUENCE — the same argument productStoreLoop.test.js makes — so a
// sequence is the only thing that can demonstrate it. trips.test.js runs it against the
// real store functions; this runs it against the real COMPONENT, because "the button
// finishes the trip" and "the seeded rows come back unchecked" are things that can be
// true in a store and false on a screen.
//
// WHAT IS REAL AND WHAT IS NOT, precisely. The seeded list is produced HERE, in node, by
// the shipping `buildNextTripList` and injected into the page — so the payload under test
// is genuinely what a shopper would receive. The trips TABLE is an in-memory array in the
// page, because trips.js reaches the perimeter KB through node:fs and cannot be bundled
// for a browser. That split is the right one: the lifecycle SEMANTICS (archived not
// erased, one active per user, adoption exactly once) are proven against the real
// functions in server/lib/trips.test.js, and this proves the half a node test cannot —
// that the door appears, the click lands, and the seed renders unchecked with its cards.

import { chromium } from './browser.mjs';
// THE SEED IS COMPUTED BY THE SHIPPING FUNCTION, here in node, and injected into the page.
// trips.js reaches the perimeter KB through node:fs so it cannot be bundled for a browser —
// which is fine, because what a browser has to prove is the RENDER, not the semantics.
import { buildNextTripList } from '../../server/lib/trips.js';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'shots');
mkdirSync(OUT, { recursive: true });

const vite = await createServer({ root: join(__dirname, '..'), server: { port: 0 }, logLevel: 'error' });
await vite.listen();
const base = `http://localhost:${vite.httpServer.address().port}`;

/* The trip the shopper is about to shop, and — computed from it by the REAL seeding
   function, as if it had just been completed — the trip "same as last week" produces. */
const START = {
  items: [
    ['Blueberries', 'berries_picking', 'produce'],
    ['Pineapple', 'produce_ripeness_by_item', 'produce'],
    ['Ground beef', 'ground_beef_lean_ratio', 'meat'],
    ['Olive oil', 'olive_oil_grades', 'bulk_pantry'],
    ['Paper towels', null, null],
  ].map(([name, cardSlug, cardSection], i) => ({
    id: `i${i}`, name, category: 'Added', checked: false, source: 'user', carded: true,
    ...(cardSlug ? { cardSlug, cardSection } : {}),
  })),
};
// Completed: every row checked. This is what buildNextTripList reads.
const COMPLETED = { goal: null, items: START.items.map((i) => ({ ...i, checked: true })) };
const SEED = buildNextTripList({ completed: COMPLETED, scans: [] });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
await page.addInitScript(
  ([start, seed]) => { window.__START = start; window.__SEED = seed; },
  [START, SEED]
);
const fail = [];
const check = (ok, msg) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) fail.push(msg);
};

await page.goto(`${base}/test/loop.html`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-cart-block]', { timeout: 20000 });

/* ── 1. A trip, with cards attached. ── */
console.log('\n1. BUILD');
const built = await page.evaluate(() => ({
  rows: document.querySelectorAll('[data-check]').length,
  carded: document.querySelectorAll('[data-attach]').length,
}));
check(built.rows === 5, `5 rows in the trip (${built.rows})`);
check(built.carded >= 3, `cards attached (${built.carded} attachments)`);

/* ── 2. Check every row off, one real click at a time. ── */
console.log('\n2. CHECK');
const boxes = await page.locator('[data-check]').all();
for (const b of boxes) {
  if ((await b.getAttribute('aria-pressed')) === 'false') await b.click();
}
const allChecked = await page.evaluate(
  () => [...document.querySelectorAll('[data-check]')].every((b) => b.getAttribute('aria-pressed') === 'true')
);
check(allChecked, 'every row is checked off');
await page.waitForSelector('[data-complete-trip]', { timeout: 5000 });
check(true, 'the completion door appears once the trip is done');
await page.screenshot({ path: join(OUT, 'loop-1-checked.png'), fullPage: true });

/* ── 3. Finish it. Archived, never erased. ── */
console.log('\n3. COMPLETE');
await page.locator('[data-complete-trip]').click();
await page.waitForFunction(() => window.__loop?.completedCount === 1, null, { timeout: 5000 });
const afterComplete = await page.evaluate(() => ({
  completed: window.__loop.completedCount,
  archived: window.__loop.rows.filter((r) => r.status === 'completed').length,
  destroyed: window.__loop.rows.length,
  active: window.__loop.rows.filter((r) => r.status === 'active').length,
}));
check(afterComplete.completed === 1, 'the trip completed');
check(afterComplete.archived === 1, 'it is ARCHIVED, not erased');
check(afterComplete.destroyed === 1, 'nothing was deleted');
check(afterComplete.active === 0, 'and no trip is active afterwards');

/* ── 4. Same as last week. ── */
console.log('\n4. SAME AS LAST WEEK');
await page.waitForSelector('[data-seed-last]', { timeout: 5000 });
check(true, 'the seeding door is offered once a completed trip exists');
await page.locator('[data-seed-last]').click();
await page.waitForSelector('[data-cart-block]', { timeout: 10000 });

const seeded = await page.evaluate(() => {
  const items = window.__loop.rows.find((r) => r.status === 'active')?.items || [];
  return {
    count: items.filter((i) => i.source !== 'swap').length,
    anyChecked: items.some((i) => i.checked),
    withSlug: items.filter((i) => i.cardSlug).length,
    withSection: items.filter((i) => i.cardSection).length,
    sample: items.filter((i) => i.cardSlug).slice(0, 3).map((i) => `${i.name}→${i.cardSlug}/${i.cardSection}`),
    domChecked: [...document.querySelectorAll('[data-check]')].filter((b) => b.getAttribute('aria-pressed') === 'true').length,
    domAttachments: document.querySelectorAll('[data-attach]').length,
  };
});
check(seeded.count === 5, `all 5 items came back (${seeded.count})`);
check(seeded.anyChecked === false, 'NOTHING arrives checked');
check(seeded.domChecked === 0, 'and the screen agrees — no ticked boxes');
check(seeded.withSlug >= 3, `cardSlug intact on the seeded rows (${seeded.withSlug})`);
check(seeded.withSection >= 3, `cardSection intact (${seeded.withSection})`);
check(seeded.domAttachments >= 3, `attachments render again (${seeded.domAttachments})`);
console.log(`    ${seeded.sample.join('\n    ')}`);

await page.screenshot({ path: join(OUT, 'loop-2-seeded.png'), fullPage: true });

await browser.close();
await vite.close();

console.log(`\nshots -> ${OUT}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILED:\n  - ${fail.join('\n  - ')}`);
  process.exit(1);
}
console.log('the loop closes');
