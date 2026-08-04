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
import { writeFixture, CART_TWELVE } from './buildFixture.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

/* THE FIXTURE IS REGENERATED FROM THE SHIPPING PICKS, and the expectations below are
   DERIVED from it rather than written down beside it. Hardcoding "12 rows, 6 attachments"
   is how a fixture and its assertions drift together into agreeing about a shape the
   product does not produce — which is exactly what happened when both were transcribed
   from a hand-built mock. Now a corpus edit that changes what matches changes the expected
   numbers in the same run, and only a claim about the SURFACE can fail. */
const items = writeFixture(join(__dirname, 'cartFixture.json'), CART_TWELVE);
const EXPECT = {
  rows: items.length,
  attachments: new Set(items.filter((i) => i.cardSlug).map((i) => i.cardSlug)).size,
  matched: items.filter((i) => i.cardSlug).length,
  checked: items.filter((i) => i.checked).length,
};
// A collapse needs a card two rows actually share. Derived, so it survives a refile.
const collapseSlug = [...new Set(items.filter((i) => i.cardSlug).map((i) => i.cardSlug))].find(
  (s) => items.filter((i) => i.cardSlug === s).length > 1
);
// The toggle test asserts false → true, so the tap target has to be a row that starts
// UNCHECKED. Deriving it as "first matched row" quietly picked a pre-checked one.
const tapSlug = items.find((i) => i.cardSlug && !i.checked)?.cardSlug;
if (!collapseSlug) throw new Error('the fixture no longer contains a collapse — the collapse assertions would pass vacuously');
if (!tapSlug) throw new Error('no unchecked matched row in the fixture — the toggle assertion would be untestable');

console.log('FIXTURE (built from the shipping PICKS)');
for (const it of items) {
  console.log(
    `  ${it.checked ? '✓' : ' '} ${String(it.name).padEnd(38)} ${String(it.cardSlug || '(no card)').padEnd(30)} ` +
    `[${it.cardSection || '—'}]${it.why ? '' : '  (no why)'}`
  );
}
console.log(
  `  ${EXPECT.rows} rows · ${EXPECT.matched} matched -> ${EXPECT.attachments} attachments · ` +
  `${EXPECT.checked} checked · collapse on ${collapseSlug}`
);

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
check(geo.rows === EXPECT.rows, `${EXPECT.rows} rows rendered (${geo.rows})`);
check(
  geo.attachments === EXPECT.attachments,
  `${EXPECT.matched} matches collapse to ${EXPECT.attachments} attachments (${geo.attachments})`
);
console.log(`    sections in walk order: ${geo.sections.join(' → ')}`);
console.log(`    full list height: ${geo.docHeight}px`);

/* ── COLLAPSE: the shared card renders once, with both rows above it. ── */
const shared = await page.evaluate((slug) => {
  const blk = document.querySelector(`[data-cart-block="${slug}"]`);
  if (!blk) return null;
  return {
    count: document.querySelectorAll(`[data-cart-block="${slug}"]`).length,
    names: [...blk.querySelectorAll('[data-check]')].map((b) => b.getAttribute('aria-label')),
    attachments: blk.querySelectorAll('[data-attach]').length,
  };
}, collapseSlug);
console.log(`\nCOLLAPSE (${collapseSlug})`);
check(shared?.count === 1, 'the shared card renders exactly once');
check(shared?.names.length === 2, `both rows sit in it (${shared?.names.length})`);
check(shared?.attachments === 1, 'they share ONE attachment');

/* ── ONE PROSE LINE PER ROW. The defect four layers of verification could not see: a
      matched row rendering the PICK's `why` AND the card's do line. The `why` sells the
      item to someone who already wrote it down; the do line tells them how to buy it at
      the shelf, and only the second does work in a store.

      This is asserted HERE, on the real component, because it is a rendering rule — the
      row must not carry both elements at once. `nonEmpty` in spirit: it fails if there are
      no matched rows to check, because an assertion over an empty collection passes. ── */
const prose = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-cart-row]')];
  const inBlockWithAttachment = (r) => !!r.closest('[data-cart-block]')?.querySelector('[data-attach]');
  return {
    matched: rows.filter(inBlockWithAttachment).length,
    unmatched: rows.filter((r) => !inBlockWithAttachment(r)).length,
    doubled: rows
      .filter((r) => inBlockWithAttachment(r) && r.querySelector('[data-why]'))
      .map((r) => r.querySelector('[data-name]')?.textContent),
    unmatchedKeepingWhy: rows.filter((r) => !inBlockWithAttachment(r) && r.querySelector('[data-why]')).length,
  };
});
console.log('\nONE PROSE LINE PER ROW');
check(prose.matched > 0, `there are matched rows to check (${prose.matched})`);
check(
  prose.doubled.length === 0,
  `no matched row renders a why beside its do line${prose.doubled.length ? ` — ${prose.doubled.join(', ')}` : ''}`
);
check(
  prose.unmatched === 0 || prose.unmatchedKeepingWhy > 0,
  `an unmatched row keeps its why — it is the only prose it has (${prose.unmatchedKeepingWhy}/${prose.unmatched})`
);

/* ── CHECK OFF: a real pointer click on the box, and the row must not open the card. ── */
console.log('\nCHECK OFF (real pointer clicks)');
const tapRow = `[data-cart-block="${tapSlug}"] [data-check]`;
const before = await page.locator(tapRow).getAttribute('aria-pressed');
await page.locator(tapRow).click();
const after = await page.locator(tapRow).getAttribute('aria-pressed');
check(before === 'false' && after === 'true', `the box toggles on a click (${before} → ${after})`);
const openedByCheck = await page.locator('[data-counter-card]').count();
check(openedByCheck === 0, 'checking a row does NOT open its card');
await page.locator(tapRow).click();
check((await page.locator(tapRow).getAttribute('aria-pressed')) === 'false', 'and it unchecks');

/* ── THE CARD OPENS ON TAP, and it is the real CounterCard. ── */
console.log('\nTHE TAP');
await page.locator(`[data-attach="${tapSlug}"]`).click();
await page.waitForSelector('[data-counter-card]', { timeout: 5000 });
const card = await page.evaluate(() => {
  const c = document.querySelector('[data-counter-card]');
  return {
    slug: c?.getAttribute('data-counter-card'),
    headline: c?.querySelector('[data-headline]')?.textContent?.trim(),
    /* THE TIER IS A SENTENCE NOW, NOT A CHIP. `[data-tier-badge]` is asserted ABSENT rather
       than simply stopped being read: the chip was a classification with no referent
       ("Credible concern" over a card about buying organic) and a test that just drops the
       check would let it grow back silently. What replaces it is `[data-tier-note]`, and
       non-negotiable #6 still binds — a reader must always know whether this is settled
       science, a credible concern or a standard, so SOMETHING here has to say so. */
    badge: c?.querySelector('[data-tier-badge]') ? 'present' : 'absent',
    tierNote: c?.querySelector('[data-tier-note]')?.textContent?.trim() || null,
    cta: c?.querySelector('[data-cta]') ? 'present' : 'absent',
  };
});
check(card.slug === tapSlug, `the right card opened (${card.slug})`);
check(Boolean(card.headline), `it carries its headline ("${card.headline}")`);
check(card.badge === 'absent', 'NO tier chip — it was a label with nothing to label');
check(
  Boolean(card.tierNote) && card.tierNote.split(/\s+/).length >= 5,
  `the tier travels with the tap AS A SENTENCE ("${card.tierNote}")`
);
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
check(
  preChecked === EXPECT.checked,
  `the ${EXPECT.checked} stored-checked rows render checked without interaction (${preChecked})`
);

await page.screenshot({ path: join(OUT, 'cart-390.png'), fullPage: true });

await browser.close();
await vite.close();

console.log(`\nshots -> ${OUT}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILED:\n  - ${fail.join('\n  - ')}`);
  process.exit(1);
}
console.log('all checks passed');
