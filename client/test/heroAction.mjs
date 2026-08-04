// THE HERO ACTIONS, CLICKED FOR REAL, ON THE SURFACE PRODUCTION ACTUALLY SERVES.
//
//   node test/heroAction.mjs [outDir]        (no API server needed — summaries are routed)
//
// WHAT THIS EXISTS TO CATCH. "Start shopping" painted, accepted taps and did nothing on
// kristyapproved.com for every real visitor. An inert button DOES NOT FAIL — nothing throws,
// so there is no console error, no error boundary, no failed build. It is invisible to every
// check that looks for a failure, because it succeeds at doing nothing.
//
// WHY dash.mjs COULD NOT SEE IT. That suite mounts Dashboard through dashHarness.jsx, which
// constructs the hero handlers itself. A harness that supplies the props is structurally
// incapable of noticing a call site that forgets them. GuestApp — the only home surface
// anyone reaches, because phone sign-in is blocked on 10DLC and `session` is null for
// everyone — rendered <Dashboard> with no hero handlers at all, and no test rendered
// GuestApp. So this drives the REAL component and supplies nothing but what App supplies.
//
// The click is a real pointer click through Playwright, not a dispatched synthetic event or
// a direct handler call: the claim is that a shopper's tap moves the app, and only a tap
// proves it. Same rule as cart.mjs.
//
// heroWiring.test.js holds the same invariant without a browser, on every commit. This one
// proves the behaviour end to end.

import { chromium } from './browser.mjs';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFixture } from './buildTripFixture.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots-hero');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

const { cards } = writeFixture(join(__dirname, 'tripFixture.json'));

const vite = await createServer({ root: join(__dirname, '..'), server: { port: 0 }, logLevel: 'error' });
await vite.listen();
const base = `http://localhost:${vite.config.server.port || vite.httpServer.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 844 }, deviceScaleFactor: 2 });
const fail = [];
const check = (ok, msg) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) fail.push(msg);
};

/* THE ONE THING THIS DOES NOT PROVE ON ITS OWN, so it is captured rather than assumed. An
   inert button produces no console output — that is the defect. A button wired to a handler
   that THROWS produces plenty. Both look identical to a shopper ("I tapped it, nothing
   happened"), so the test has to distinguish them or it only half-covers the report. */
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

// Same transport substitution dash.mjs makes: the real card projection, served locally so
// the run needs no API server. Content is unchanged — only where it arrives from.
await page.route('**/api/counter/summaries*', (route) => {
  const want = new URL(route.request().url()).searchParams.get('slugs')?.split(',') || [];
  const out = {};
  for (const s of want) if (cards[s]) out[s] = cards[s];
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cards: out }) });
});

const open = async (view) => {
  errors.length = 0;
  await page.goto(`${base}/test/heroAction.html?view=${view}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-dashboard]', { timeout: 15000 });
  await page.waitForTimeout(300);
};

/* ═══════════════ THE TWO ACTIONS THAT ENTER SHOP MODE ═══════════════
   Shop mode is a MODE and the hero is its ONLY entry point anywhere in the product. An
   unwired button here does not degrade a surface, it removes the walking half of the app. */
for (const [view, label] of [['ready', 'Start shopping'], ['midtrip', 'Resume shopping']]) {
  console.log(`\n${view.toUpperCase()} — "${label}"`);
  await open(view);

  const btn = page.locator('[data-hero-action]');
  const count = await btn.count();
  check(count === 1, `${view}: hero renders exactly one action (found ${count})`);
  if (count !== 1) continue;

  const text = (await btn.textContent()).trim();
  check(text === label, `${view}: the action reads "${label}" (got "${text}")`);

  // Nothing may already be up — otherwise "shop mode is open" proves nothing about the tap.
  check(
    await page.locator('[data-shop-mode]').count() === 0,
    `${view}: shop mode is not already open before the click`
  );

  await page.screenshot({ path: join(OUT, `${view}-before.png`) });

  // A REAL POINTER CLICK. Playwright moves the mouse and presses — this is the tap.
  await btn.click();
  await page.waitForTimeout(400);

  const opened = await page.locator('[data-shop-mode]').count();
  check(
    opened === 1,
    `${view}: the tap opens shop mode — THE REGRESSION. A hero button that paints, ` +
      `accepts the click and changes nothing is exactly what shipped.`
  );

  // The tab bar is suppressed in shop mode. Proves the app really changed state rather than
  // rendering shop mode into a surface that still thinks it is the dashboard.
  if (opened === 1) {
    const nav = await page.locator('nav, [class*="bottomnav"], [class*="tabbar"]').count();
    check(nav === 0, `${view}: the tab bar is absent in shop mode (found ${nav})`);
    await page.screenshot({ path: join(OUT, `${view}-after.png`) });
  }

  check(errors.length === 0, `${view}: the tap threw nothing${errors.length ? ` — ${errors[0]}` : ''}`);
}

/* ═══════════════ THE OTHER HALF OF THE FIX ═══════════════
   A guest has no account, so there is no `trips` row to file and no completion door to
   offer. The hero must render that state with NO button rather than one that cannot do what
   it says — an upgrade ask on a completion tap would be a second ask moment, and the ask
   appears at exactly one. The state still has to SAY something, so the line is asserted too:
   dropping the whole hero would pass a naive "no inert button" check while removing the
   answer to what-next, which the dashboard exists to give. */
console.log('\nFINISHED — a guest has no trip to file');
await open('finished');
check(
  await page.locator('[data-hero-action]').count() === 0,
  'finished: no completion door for a guest — the button is absent, not inert'
);
const line = await page.locator('[data-hero-line]').textContent().catch(() => '');
check(!!line?.trim(), `finished: the hero still answers what-next ("${line?.trim()}")`);
check(errors.length === 0, `finished: renders clean${errors.length ? ` — ${errors[0]}` : ''}`);

await browser.close();
await vite.close();

console.log(`\nshots -> ${OUT}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILED:\n  - ${fail.join('\n  - ')}`);
  process.exit(1);
}
console.log('all checks passed');
