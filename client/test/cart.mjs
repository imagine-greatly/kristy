// The list surface, measured and CLICKED at a true 390px.
//
//   node test/cart.mjs [outDir]        (the API server must be running on :3001)
//
// Viewport via Playwright, never --window-size: Chrome enforces a ~500px minimum window on
// Windows, so a 390px request renders at 504 and crops, which looks exactly like horizontal
// overflow. Same rule as test/skim.mjs and test/shots.mjs.
//
// EVERY INTERACTION CLAIM HERE IS A REAL POINTER CLICK. "The row checks off", "the card
// opens", "the state survives a reload" are all things that can be true in the source and
// false in the browser, and the only way to tell is to press them.

import { chromium } from './browser.mjs';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

const vite = await createServer({
  root: join(__dirname, '..'),
  server: { port: 0 },
  logLevel: 'error',
});
await vite.listen();
const base = `http://localhost:${vite.config.server.port || vite.httpServer.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 2 });
const fail = [];
const check = (ok, msg) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) fail.push(msg);
};

await page.goto(`${base}/test/cart.html`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-cart-block]', { timeout: 15000 });
// The attachments arrive from /api/counter/summaries, which is a real request.
await page.waitForSelector('[data-attach]', { timeout: 15000 });

/* ── Geometry. Read off getBoundingClientRect, never judged from a screenshot. ── */
const geo = await page.evaluate(() => {
  const r = (s) => document.querySelector(s)?.getBoundingClientRect();
  const boxes = [...document.querySelectorAll('[data-check]')].map((b) => b.getBoundingClientRect());
  return {
    minTapW: Math.min(...boxes.map((b) => Math.round(b.width))),
    minTapH: Math.min(...boxes.map((b) => Math.round(b.height))),
    rows: boxes.length,
    attachments: document.querySelectorAll('[data-attach]').length,
    blocks: document.querySelectorAll('[data-cart-block]').length,
    sections: [...document.querySelectorAll('[data-walk-section]')].map((s) => s.dataset.walkSection),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    docHeight: Math.round(document.documentElement.scrollHeight),
  };
});

console.log('\nGEOMETRY');
check(geo.minTapW >= 44 && geo.minTapH >= 44, `every check target is >=44px (min ${geo.minTapW}x${geo.minTapH})`);
check(geo.overflow === 0, `no horizontal overflow at ${WIDTH}px (${geo.overflow}px)`);
check(geo.rows === 12, `12 rows rendered (${geo.rows})`);
check(geo.attachments === 6, `7 matches collapse to 6 attachments (${geo.attachments})`);
console.log(`    sections in walk order: ${geo.sections.join(' → ')}`);
console.log(`    full list height: ${geo.docHeight}px`);

/* ── COLLAPSE: the shared card renders once, with both rows above it. ── */
const berries = await page.evaluate(() => {
  const blk = document.querySelector('[data-cart-block="berries_picking"]');
  if (!blk) return null;
  return {
    count: document.querySelectorAll('[data-cart-block="berries_picking"]').length,
    names: [...blk.querySelectorAll('[data-check]')].map((b) => b.getAttribute('aria-label')),
    attachments: blk.querySelectorAll('[data-attach]').length,
  };
});
console.log('\nCOLLAPSE');
check(berries?.count === 1, 'the shared card renders exactly once');
check(berries?.names.length === 2, `both rows sit in it (${berries?.names.length})`);
check(berries?.attachments === 1, 'they share ONE attachment');

/* ── CHECK OFF: a real pointer click on the box, and the row must not open the card. ── */
console.log('\nCHECK OFF (real pointer clicks)');
const pineapple = '[data-cart-block="produce_ripeness_by_item"] [data-check]';
const before = await page.locator(pineapple).getAttribute('aria-pressed');
await page.locator(pineapple).click();
const after = await page.locator(pineapple).getAttribute('aria-pressed');
check(before === 'false' && after === 'true', `the box toggles on a click (${before} → ${after})`);
const openedByCheck = await page.locator('[data-counter-card]').count();
check(openedByCheck === 0, 'checking a row does NOT open its card');
await page.locator(pineapple).click();
check((await page.locator(pineapple).getAttribute('aria-pressed')) === 'false', 'and it unchecks');

/* ── THE CARD OPENS ON TAP, and it is the real CounterCard. ── */
console.log('\nTHE TAP');
await page.locator('[data-attach="produce_ripeness_by_item"]').click();
await page.waitForSelector('[data-counter-card]', { timeout: 5000 });
const card = await page.evaluate(() => {
  const c = document.querySelector('[data-counter-card]');
  return {
    slug: c?.getAttribute('data-counter-card'),
    headline: c?.querySelector('[data-headline]')?.textContent?.trim(),
    tier: c?.querySelector('[data-tier-badge]')?.textContent?.trim() || null,
    cta: c?.querySelector('[data-cta]') ? 'present' : 'absent',
  };
});
check(card.slug === 'produce_ripeness_by_item', `the right card opened (${card.slug})`);
check(Boolean(card.headline), `it carries its headline ("${card.headline}")`);
check(Boolean(card.tier), `the tier chip travels with the tap (${card.tier})`);
check(card.cta === 'absent', 'NO add-to-cart on a card opened from a row');

await page.screenshot({ path: join(OUT, 'cart-390-open.png') });
await page.locator('[data-attach], [data-cart-block] button').first().waitFor();

/* ── PERSISTENCE. A shopper who backgrounds the app mid-aisle cannot lose their trip.
      The harness holds state in memory, so this asserts the CART HOOK's contract instead:
      a checked row survives a round trip through sanitizeList. Measured server-side in
      listMatch.test.js; here we prove the DOM reflects the stored flag on first paint. ── */
console.log('\nSTATE ON FIRST PAINT');
const preChecked = await page.evaluate(
  () => [...document.querySelectorAll('[data-check]')].filter((b) => b.getAttribute('aria-pressed') === 'true').length
);
check(preChecked === 3, `the 3 stored-checked rows render checked without interaction (${preChecked})`);

await page.screenshot({ path: join(OUT, 'cart-390.png'), fullPage: true });

await browser.close();
await vite.close();

console.log(`\nshots -> ${OUT}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILED:\n  - ${fail.join('\n  - ')}`);
  process.exit(1);
}
console.log('all checks passed');
