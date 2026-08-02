// The monetization gate, photographed at a true 390px with REAL pointer clicks, SIGNED OUT.
//
// VIEWPORT OVER CDP, NEVER --window-size. Chrome enforces a ~500px minimum window on
// Windows, so a 390 window renders at 504 and crops in a way that looks exactly like
// horizontal overflow. Playwright's `viewport` sets device metrics, the same mechanism
// skim.mjs uses and the reason both are trustworthy.
//
// BROWSE, NOT ASK. A signed-out ask raises the guest SIGN-IN gate, which is a separate
// pre-existing wall that sits on top of everything and re-raises when dismissed — see the
// report. Browsing into a section reaches a non-essential card with no such interruption,
// and it is the path a stranger looking around actually takes.
//
// The only injected state is the meter count: sitting through three real reads to
// photograph the fourth proves nothing the count does not.
//
// Needs the API on :3001 and the client dev server on :5174.
import { chromium } from './browser.mjs';
import { existsSync, mkdirSync } from 'node:fs';

const OUT = 'test/shots-gate';
const APP = process.env.GATE_APP || 'http://localhost:5174/app';

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });

// THE GUEST SIGN-IN GATE IS A SEPARATE, PRE-EXISTING WALL and it re-raises after being
// dismissed — on a signed-out session it appears on card opens as well as asks. It has
// nothing to do with the read meter; it just sits on top of it. Clear it before anything
// that needs to be seen or clicked, and say so in the report rather than pretending the
// two do not collide.
const clearGate = async () => {
  for (let i = 0; i < 3; i++) {
    const d = page.locator('.gate__dismiss').first();
    if (!(await d.count()) || !(await d.isVisible().catch(() => false))) return;
    await d.click().catch(() => {});
    await page.waitForTimeout(450);
  }
};

const shot = async (name) => {
  await page.waitForTimeout(600);
  await clearGate();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('  ok', name);
};

const clickText = async (label) => {
  const b = page.locator('button').filter({ hasText: label }).first();
  if (!(await b.count())) { console.log(`  - no "${label}"`); return false; }
  await b.scrollIntoViewIfNeeded();
  await b.click();
  console.log(`  -> clicked "${label}"`);
  await page.waitForTimeout(1000);
  return true;
};

const click = async (sel, note) => {
  await clearGate();
  const el = page.locator(sel).first();
  if (!(await el.count())) { console.log(`  - no ${note}`); return false; }
  await el.scrollIntoViewIfNeeded();
  await el.click();
  console.log(`  -> clicked ${note}`);
  await page.waitForTimeout(900);
  return true;
};

const tab = async (label) => {
  const t = page.locator('nav[aria-label="Primary"] button').filter({ hasText: label }).first();
  if (!(await t.count())) { console.log(`  - no ${label} tab`); return false; }
  await t.click();
  await page.waitForTimeout(1600);
  return true;
};

await page.goto(APP, { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('kristy:reads', '3'); } catch {} });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

await clickText('Skip for now');
await tab('Counter');

// Into a section, to reach a card that is NOT one of the eight essentials. Essentials are
// always full for everyone, so they cannot show the gate.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await clickText('Which are low in mercury?');
await page.waitForTimeout(1500);

/* ── 1. A card summary, exactly as a signed-out shopper sees it ── */
await page.waitForSelector('[data-counter-card]', { timeout: 15000 });
const card = page.locator('[data-counter-card]').filter({ has: page.locator('[data-full-read]') }).first();
await card.scrollIntoViewIfNeeded();
console.log('  card:', await card.getAttribute('data-counter-card'));
await shot('1-summary-free');

/* ── The meter is spent. The tap opens the teaser and, for a shopper who CAN buy, the
      ask. A guest gets the teaser only — no plan buttons, because buying needs an account,
      an account needs a phone code, and phone codes are blocked on 10DLC. ── */
await click('[data-full-read]', 'The full read');
await page.waitForTimeout(1400);

const sheets = await page.locator('[data-upgrade-sheet]').count();
const priced = await page.locator('[data-teaser-cta]').count();
console.log(`  guest sees: upgrade sheets=${sheets}, priced CTAs=${priced} (both must be 0)`);
if (sheets || priced) throw new Error('a guest was offered a purchase they cannot complete');

if (await page.locator('[data-card-teaser]').count()) {
  await page.locator('[data-card-teaser]').first().scrollIntoViewIfNeeded();
} else {
  throw new Error('no teaser rendered — the gate must never show a blank');
}
await shot('2-teaser');

/* ── The cart. Building it is free; SAVING is where a guest meets sign-in, which is the
      honest order — an account first, a membership after. ── */
await click('[data-cta]', 'Add to cart');
await tab('Cart');
await page.waitForTimeout(1000);
const guestSave = await page.locator('[data-save-list]').count();
console.log(`  guest save control: ${guestSave} (0 — saving routes through the sign-in gate)`);
await shot('3-cart-free');

await browser.close();
console.log('done ->', OUT);
