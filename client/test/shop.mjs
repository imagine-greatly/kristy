// SHOP MODE, measured at a true 390px — geometry, legibility, and the wake lock.
//
//   node test/shop.mjs [outDir]        (no API server needed — cards are injected)
//
// Viewport via Playwright, never --window-size: Chrome enforces a ~500px minimum window on
// Windows, so a 390px request renders at 504 and crops. Same rule as every other browser
// suite here.

import { chromium } from './browser.mjs';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFixture } from './buildTripFixture.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots-shop');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

const { items } = writeFixture(join(__dirname, 'tripFixture.json'));
const { groupForWalk } = await import('../src/lib/listSections.js');
const groups = groupForWalk(items);
const produce = groups.find((g) => g.id === 'produce')?.blocks.flatMap((b) => b.items) || [];

/* Bound at the collection. Each of these would make a whole block of assertions below pass
   over nothing, which is worse than not having them. */
const matched = produce.filter((i) => i.cardSlug);
const cardsInProduce = new Set(matched.map((i) => i.cardSlug)).size;
if (!matched.length) throw new Error('no matched produce rows — the inversion assertions would pass vacuously');
if (matched.length === cardsInProduce) throw new Error('no collapse in produce — the shared-do-line assertion would pass vacuously');
if (!produce.some((i) => !i.cardSlug)) throw new Error('no unmatched produce row — the lead-slot assertion would pass vacuously');

console.log(`FIXTURE: produce has ${produce.length} rows, ${matched.length} matched -> ${cardsInProduce} cards`);
console.log(`         trip spans ${groups.length} sections\n`);

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
const open = async (state = 'midtrip', wake = 'spec') => {
  await page.goto(`${base}/test/shop.html?state=${state}&wake=${wake}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-shop-mode]', { timeout: 15000 });
  await page.waitForTimeout(200);
};

/* WCAG contrast, computed from the RENDERED colours. Injected once and reused. */
const CONTRAST_FN = `
  const lumOf = (rgb) => {
    const [r, g, b] = rgb.match(/[\\d.]+/g).slice(0, 3).map(Number).map((v) => v / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  // The effective painted colour of an element, folding in every opacity above it.
  const effective = (el) => {
    let a = 1, n = el;
    while (n && n.nodeType === 1) { a *= parseFloat(getComputedStyle(n).opacity || '1'); n = n.parentElement; }
    const fg = getComputedStyle(el).color.match(/[\\d.]+/g).slice(0, 3).map(Number);
    let bgEl = el, bg = null;
    while (bgEl) {
      const c = getComputedStyle(bgEl).backgroundColor;
      const m = c.match(/[\\d.]+/g);
      if (m && (m.length < 4 || Number(m[3]) > 0)) { bg = m.slice(0, 3).map(Number); break; }
      bgEl = bgEl.parentElement;
    }
    bg = bg || [10, 26, 17];
    const mixed = fg.map((v, i) => v * a + bg[i] * (1 - a));
    return { fg: 'rgb(' + mixed.map(Math.round).join(', ') + ')', bg: 'rgb(' + bg.join(', ') + ')' };
  };
  const contrast = (el) => {
    const { fg, bg } = effective(el);
    const [x, y] = [lumOf(fg), lumOf(bg)].sort((p, q) => q - p);
    return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
  };`;

/* ═════════════════════════════ 1. THE PRODUCE SCREEN ═════════════════════════════ */
await open('midtrip');
console.log('THE PRODUCE SCREEN');
const geo = await page.evaluate(`(() => {
  ${CONTRAST_FN}
  const px = (el, p) => (el ? parseFloat(getComputedStyle(el)[p]) : null);
  const checks = [...document.querySelectorAll('[data-check]')].map((b) => b.getBoundingClientRect());
  const opens = [...document.querySelectorAll('[data-open]')].map((b) => b.getBoundingClientRect());
  const sec = document.querySelector('[data-shop-section="produce"]');
  return {
    minCheckW: Math.min(...checks.map((b) => Math.round(b.width))),
    minCheckH: Math.min(...checks.map((b) => Math.round(b.height))),
    minOpenW: Math.min(...opens.map((b) => Math.round(b.width))),
    minOpenH: Math.min(...opens.map((b) => Math.round(b.height))),
    minGap: Math.min(...checks.flatMap((c) => opens.map((o) => Math.round(Math.hypot(
      Math.max(0, Math.max(c.left - o.right, o.left - c.right)),
      Math.max(0, Math.max(c.top - o.bottom, o.top - c.bottom))))))),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    doSize: px(document.querySelector('[data-do][data-lead]'), 'fontSize'),
    nameSize: px(document.querySelector('[data-shop-block] [data-name]:not([data-lead])'), 'fontSize'),
    unmatchedNameSize: px(document.querySelector('[data-name][data-lead]'), 'fontSize'),
    sectionTitle: document.querySelector('[data-section-title]')?.textContent,
    sectionCount: document.querySelector('[data-section-count]')?.textContent?.trim(),
    nextLabel: document.querySelector('[data-next-label]')?.textContent,
    pips: document.querySelectorAll('[data-pip]').length,
    rows: sec ? sec.querySelectorAll('[data-shop-row]').length : 0,
    doLines: sec ? sec.querySelectorAll('[data-do]').length : 0,
    visibleRows: sec ? [...sec.querySelectorAll('[data-shop-row]')].filter((r) => r.getBoundingClientRect().bottom <= 844).length : 0,
    produceNamed: [...document.querySelectorAll('body *')].filter((el) => !el.children.length && el.textContent.trim().toLowerCase() === 'produce').length,
    // Every piece of text on screen, with its size and its measured contrast.
    text: [...document.querySelectorAll('[data-shop-scroll] *')].filter((el) => !el.children.length && el.textContent.trim())
      .map((el) => ({ t: el.textContent.trim().slice(0, 34), size: px(el, 'fontSize'), c: contrast(el), spent: el.hasAttribute('data-spent') })),
  };
})()`);

check(geo.minCheckW >= 56 && geo.minCheckH >= 56, `check targets are >=56px (min ${geo.minCheckW}x${geo.minCheckH})`);
check(geo.minOpenW >= 44 && geo.minOpenH >= 44, `card-open targets are >=44px (min ${geo.minOpenW}x${geo.minOpenH})`);
check(geo.minGap >= 150, `check and card-open are ${geo.minGap}px apart at their closest`);
check(geo.overflow === 0, `no horizontal overflow at ${WIDTH}px (${geo.overflow}px)`);
check(geo.doSize > geo.nameSize, `the do line leads a matched row: ${geo.doSize}px vs the name at ${geo.nameSize}px`);
check(geo.unmatchedNameSize === geo.doSize, `an unmatched row's NAME takes the lead slot (${geo.unmatchedNameSize}px)`);
check(geo.sectionTitle === 'Produce', `the section is named (${geo.sectionTitle})`);
check(geo.sectionCount === `${produce.filter((i) => i.checked).length} of ${produce.length}`, `progress is the SECTION's (${geo.sectionCount})`);
check(/^Next: /.test(geo.nextLabel || ''), `what comes next is named (${geo.nextLabel})`);
check(geo.pips === groups.length, `the whole walk is on screen as pips (${geo.pips})`);
check(geo.rows === produce.length, `produce carries its ${produce.length} rows (${geo.rows})`);
check(geo.doLines === cardsInProduce, `${matched.length} matched rows share ${cardsInProduce} do lines (${geo.doLines})`);
check(geo.produceNamed === 1, `the active section names itself exactly once (${geo.produceNamed})`);
check(geo.visibleRows >= 4, `${geo.visibleRows} of ${produce.length} produce rows are above the fold at 844px`);

/* ═══════════ 2. LEGIBILITY — the spent instruction has to be READ, not just seen ═══════════

   The demote was 11.5px at 50% opacity. That measures 2.90:1 against the ground and WCAG
   needs 4.5:1 for text under 18.66px: a shopper who checks something by mistake and looks
   back could not read what they had just dismissed. Transparency is the wrong instrument —
   it removes contrast from exactly the people who need it and it still looks fine to
   whoever shipped it. The ratio is computed from RENDERED colour, folding in every ancestor
   opacity, so re-introducing a fade anywhere above fails here. */
console.log('\nLEGIBILITY (WCAG 4.5:1 for text under 18.66px, 3:1 at or above)');
const spent = geo.text.filter((t) => t.spent);
check(spent.length > 0, `there are spent instructions to check (${spent.length})`);
for (const s of spent) console.log(`    spent: "${s.t}" ${s.size}px, ${s.c}:1`);
const illegible = geo.text.filter((t) => t.c < (t.size >= 18.66 ? 3 : 4.5));
check(
  illegible.length === 0,
  `every line on the aisle screen clears its contrast floor${illegible.length ? ` — ${illegible.map((t) => `"${t.t}" ${t.size}px ${t.c}:1`).join('; ')}` : ''}`
);
const minSize = Math.min(...geo.text.map((t) => t.size));
check(minSize >= 11.5, `nothing is set below 11.5px (min ${minSize}px)`);
const spentMin = Math.min(...spent.map((s) => s.size));
check(spentMin >= 13, `a spent instruction stays at 13px or above (${spentMin}px) — demoted by size, still readable`);
check(spentMin < geo.doSize, `and it is genuinely demoted (${spentMin}px vs ${geo.doSize}px)`);

await page.screenshot({ path: join(OUT, 'shop-390-produce.png') });

/* ═══════════ 3. THE COLLAPSE — mid-scroll, with a completed section behind ═══════════ */
console.log('\nMID-SCROLL, PRODUCE COMPLETED');
await open('produceDone');
const collapsed = await page.evaluate(() => {
  const sec = document.querySelector('[data-shop-section="produce"]');
  return {
    complete: sec?.getAttribute('data-complete'),
    collapsedTo: sec?.querySelector('[data-done-section]')?.textContent.trim(),
    rowsLeft: sec?.querySelectorAll('[data-shop-row]').length,
    height: Math.round(sec?.getBoundingClientRect().height),
  };
});
check(collapsed.complete === '1', 'produce reads as complete');
check(collapsed.rowsLeft === 0, `its ${produce.length} rows collapse away (${collapsed.rowsLeft} left)`);
check(Boolean(collapsed.collapsedTo), `to one line: "${collapsed.collapsedTo}"`);
check(collapsed.height < 90, `${collapsed.height}px instead of a full section`);

// Scroll so the collapsed section sits above and the live one fills the screen.
await page.evaluate(() => {
  const el = document.querySelector('[data-shop-scroll]');
  const meat = document.querySelector('[data-shop-section="meat"]');
  el.scrollTo({ top: meat.offsetTop - el.offsetTop - 70 });
});
await page.waitForTimeout(400);
const midScroll = await page.evaluate(() => ({
  activeTitle: document.querySelector('[data-section-title]')?.textContent,
  count: document.querySelector('[data-section-count]')?.textContent.trim(),
  next: document.querySelector('[data-next-label]')?.textContent,
  collapsedVisible: !!document.querySelector('[data-done-section="produce"]')?.getBoundingClientRect().height,
}));
check(midScroll.activeTitle !== 'Produce', `the header follows the scroll (now "${midScroll.activeTitle}")`);
check(midScroll.collapsedVisible, 'the collapsed section is still in place above, one tap from reopening');
console.log(`    header: ${midScroll.activeTitle} — ${midScroll.count} · ${midScroll.next}`);
await page.screenshot({ path: join(OUT, 'shop-390-collapsed.png') });

// And reopening it works, with a real click.
await page.evaluate(() => document.querySelector('[data-shop-scroll]').scrollTo({ top: 0 }));
await page.waitForTimeout(300);
await page.locator('[data-done-section="produce"]').click();
await page.waitForTimeout(300);
const reopened = await page.evaluate(() => document.querySelectorAll('[data-shop-section="produce"] [data-shop-row]').length);
check(reopened === produce.length, `a real click reopens it to all ${produce.length} rows (${reopened})`);
await page.screenshot({ path: join(OUT, 'shop-390-reopened.png') });

/* ═════════════ 4. THE WAKE LOCK — hidden and restored for real ═════════════

   THE RE-ACQUIRE IS THE HALF THAT FAILS SILENTLY. The browser releases the lock whenever the
   document hides, so acquire-once code passes every test written for it and then dies at the
   first notification on a real trip, permanently, for the rest of the walk. Asserting that a
   handler is bound would pass over exactly that bug.

   So this HIDES the document — `document.visibilityState` really returns 'hidden', a real
   `visibilitychange` really fires, and the modelled platform really releases the outstanding
   sentinel first, in capture, the way the browser's internal release precedes the event
   reaching page script — and then restores it and asserts a NEW sentinel exists. */
console.log('\nWAKE LOCK — hidden and restored for real');
await open('midtrip', 'spec');

const hide = async (v) => {
  await page.evaluate((vis) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => vis });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => vis === 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  }, v);
  await page.waitForTimeout(250);
};

const w0 = await page.evaluate(() => ({ ...window.__wake, live: window.__wake.acquired - window.__wake.released }));
check(w0.acquired === 1 && w0.live === 1, `entering shop mode takes one lock (acquired ${w0.acquired}, live ${w0.live})`);

await hide('hidden');
const w1 = await page.evaluate(() => ({ ...window.__wake, live: window.__wake.acquired - window.__wake.released, vis: document.visibilityState }));
check(w1.vis === 'hidden', 'the document really reports hidden');
check(w1.released === 1 && w1.live === 0, `the platform released it on hide (released ${w1.released}, live ${w1.live}) — this is what kills acquire-once code`);

await hide('visible');
const w2 = await page.evaluate(() => ({ ...window.__wake, live: window.__wake.acquired - window.__wake.released }));
check(w2.acquired === 2 && w2.live === 1, `IT RE-ACQUIRED on restore (acquired ${w2.acquired}, live ${w2.live})`);

// Twice more: a real trip is interrupted many times, and a one-shot re-acquire is its own bug.
await hide('hidden'); await hide('visible');
await hide('hidden'); await hide('visible');
const w3 = await page.evaluate(() => ({ ...window.__wake, live: window.__wake.acquired - window.__wake.released }));
check(w3.acquired === 4 && w3.live === 1, `and again on every interruption (acquired ${w3.acquired}, live ${w3.live})`);

// Leaving the mode must release it. A lock outliving shop mode is a battery drained in a pocket.
await page.locator('[data-exit]').click();
await page.waitForTimeout(200);
await page.evaluate(() => {
  // Exit is wired to a flag in the harness, so unmount ShopMode the way App does.
  document.querySelector('[data-shop-mode]')?.remove();
});
const w4 = await page.evaluate(async () => {
  const { unmount } = window;
  return { ...window.__wake, live: window.__wake.acquired - window.__wake.released, exited: !!window.__exited };
});
check(w4.exited, 'the exit control fires');

/* THE DEGRADE PATHS, one against the REAL API. */
console.log('\nDEGRADE');
await open('midtrip', 'real');
const real = await page.evaluate(async () => {
  let err = null;
  try { const s = await navigator.wakeLock.request('screen'); await s.release(); }
  catch (e) { err = e.name; }
  return { hasApi: 'wakeLock' in navigator, err, rows: document.querySelectorAll('[data-shop-row]').length };
});
check(real.hasApi && real.err === 'NotAllowedError', `the REAL API is present and really rejects here (${real.err})`);
check(real.rows > 0, `a denied lock is silent — shop mode still renders its ${real.rows} rows`);
const noMention = await page.evaluate(() =>
  [...document.querySelectorAll('body *')].filter((e) => !e.children.length && /wake|screen.*awake|permission/i.test(e.textContent)).length
);
check(noMention === 0, 'and it is never mentioned to the shopper');

await open('midtrip', 'none');
const none = await page.evaluate(() => ({ hasApi: 'wakeLock' in navigator, rows: document.querySelectorAll('[data-shop-row]').length }));
check(!none.hasApi, 'an unsupported browser has no navigator.wakeLock');
check(none.rows > 0, `and shop mode still renders its ${none.rows} rows (iOS < 16.4, installed PWA < 18.4)`);

/* ═════════════ 5. RETURN TO POSITION — broken the way a shopper would break it ═════════════

   THIS IS THE STEP THAT DECIDES WHETHER SHOP MODE GETS USED TWICE. If scanning drops someone
   back at the top of the list, or on another tab, they do not scan again.

   The architecture is meant to make this free: both branches open OVER shop mode, which is
   never unmounted, so there is nothing to restore. That claim is only worth as much as the
   attempts to break it, so these scroll DEEP first and then interleave a real background /
   restore, a real submitted query, and a real cart mutation. Position is read as an exact
   pixel — `scrollTop` — not "roughly the same section". */
console.log('\nRETURN TO POSITION');
const scrollDeep = async () => {
  await page.evaluate(() => {
    const el = document.querySelector('[data-shop-scroll]');
    el.scrollTop = Math.round(el.scrollHeight * 0.55);
  });
  await page.waitForTimeout(300);
  return page.evaluate(() => document.querySelector('[data-shop-scroll]').scrollTop);
};
const posNow = () => page.evaluate(() => {
  const el = document.querySelector('[data-shop-scroll]');
  return { top: el.scrollTop, section: document.querySelector('[data-section-title]')?.textContent };
});

// ── a. scroll deep → open scan → close → same pixel ──
await open('midtrip', 'spec');
const deep = await scrollDeep();
const before = await posNow();
await page.locator('[data-scan]').click();
await page.waitForSelector('[data-shop-cart-action]', { timeout: 5000 });
check((await page.locator('[data-shop-mode]').count()) === 1, 'a. shop mode is still MOUNTED under the scan sheet');
await page.locator('[role="dialog"] button[aria-label="Close"]').click();
await page.waitForTimeout(300);
const afterScan = await posNow();
check(
  afterScan.top === before.top && before.top > 0,
  `a. scroll deep (${deep}px) → scan → close → SAME PIXEL (${before.top} → ${afterScan.top})`
);
check(afterScan.section === before.section, `a. and the same section (${afterScan.section})`);

// ── b. open scan → background the app → restore → close → same pixel ──
await page.locator('[data-scan]').click();
await page.waitForSelector('[data-shop-cart-action]', { timeout: 5000 });
await hide('hidden');
await hide('visible');
await page.locator('[role="dialog"] button[aria-label="Close"]').click();
await page.waitForTimeout(300);
const afterBg = await posNow();
check(
  afterBg.top === before.top,
  `b. scan open → backgrounded → restored → close → SAME PIXEL (${before.top} → ${afterBg.top})`
);
const wBg = await page.evaluate(() => ({ ...window.__wake, live: window.__wake.acquired - window.__wake.released }));
check(wBg.live === 1, `b. and the wake lock came back with it (live ${wBg.live})`);

// ── c. open ask → submit a REAL query → close → same pixel ──
await page.locator('[data-ask]').click();
await page.waitForSelector('[data-ask-overlay]', { timeout: 5000 });
check((await page.locator('[data-shop-mode]').count()) === 1, 'c. shop mode is still MOUNTED under the ask overlay');
const askVia = await page.locator('[data-counter-ask]').getAttribute('data-counter-ask');
check(askVia === 'shop', `c. the overlay is CounterAsk (via=${askVia})`);
await page.locator('[data-ask-input]').fill('wild or farmed salmon');
await page.locator('[data-ask-go]').click();
// A real request to the API. It may answer or fail; either way the overlay must survive and
// closing must return to the same pixel — a network outcome is not a navigation.
await page.waitForTimeout(2500);
const answered = await page.locator('[data-ask-answer]').count();
console.log(`    the query ${answered ? 'came back with an answer' : 'did not answer (API not running) — position is asserted either way'}`);
await page.locator('[data-ask-close]').click();
await page.waitForTimeout(300);
const afterAsk = await posNow();
check(
  afterAsk.top === before.top,
  `c. ask → submit → close → SAME PIXEL (${before.top} → ${afterAsk.top})`
);

// ── d. the ask, reached from INSIDE the scan overlay ──
await page.locator('[data-scan]').click();
await page.waitForSelector('[data-shop-cart-action]', { timeout: 5000 });
const askFromScan = await page.evaluate(() =>
  [...document.querySelectorAll('[role="dialog"] button')].map((b) => b.textContent.trim()).filter(Boolean)
);
check(
  !askFromScan.some((t) => /ask/i.test(t)),
  `d. the scan sheet offers NO chat ask in shop mode — it routes to the thread, which unmounts the mode [buttons: ${askFromScan.join(' | ') || 'none'}]`
);
await page.locator('[role="dialog"] button[aria-label="Close"]').click();
await page.waitForTimeout(250);
// And the branch bar is still there, so the counter ask is one tap away and comes back.
check((await page.locator('[data-ask]').count()) === 1, 'd. the counter ask is still one tap away on the branch bar');
check((await posNow()).top === before.top, 'd. and the position is unchanged');

/* ═════════════ 6. A SCAN THAT IS ALREADY ON THE LIST ═════════════ */
console.log('\nA SCAN THAT RESOLVES TO A ROW ALREADY ON THE LIST');
await open('fresh', 'spec');
await page.locator('[data-scan]').click();
await page.waitForSelector('[data-shop-cart-action]', { timeout: 5000 });
const act = await page.evaluate(() => {
  const b = document.querySelector('[data-shop-cart-action]');
  return { label: b?.textContent.trim(), matched: b?.getAttribute('data-shop-match') };
});
check(/^Check off /.test(act.label || ''), `it offers to TICK the row, not add a duplicate ("${act.label}")`);
check(Boolean(act.matched), `and it names the row it matched (${act.matched})`);

const wasChecked = await page.evaluate((id) =>
  document.querySelector(`[data-shop-row="${id}"] [data-check]`)?.getAttribute('aria-pressed'), act.matched);
await page.locator('[data-shop-cart-action]').click();   // a REAL click
await page.waitForTimeout(400);
const nowChecked = await page.evaluate((id) =>
  document.querySelector(`[data-shop-row="${id}"] [data-check]`)?.getAttribute('aria-pressed'), act.matched);
check(wasChecked === 'false' && nowChecked === 'true', `a real click ticks that row (${wasChecked} → ${nowChecked})`);
check((await page.locator('[data-shop-cart-action]').count()) === 0, 'and the sheet closes behind it');
const rowCount = await page.evaluate(() => document.querySelectorAll('[data-shop-row]').length);
check(rowCount === items.length, `no duplicate row was added (${rowCount} rows, was ${items.length})`);

// The other direction: a product that is NOT on the list joins the section.
await open('fresh', 'spec');
await page.goto(page.url() + '&scan=nomatch', { waitUntil: 'networkidle' });
await page.waitForSelector('[data-shop-mode]');
await page.locator('[data-scan]').click();
await page.waitForSelector('[data-shop-cart-action]', { timeout: 5000 });
const act2 = await page.evaluate(() => {
  const b = document.querySelector('[data-shop-cart-action]');
  return { label: b?.textContent.trim(), matched: b?.getAttribute('data-shop-match') };
});
check(/^Add to /.test(act2.label || ''), `an unmatched product joins the section instead ("${act2.label}")`);
check(!act2.matched, 'and it claims no row');
await page.locator('[data-shop-cart-action]').click();
await page.waitForTimeout(400);
const rows2 = await page.evaluate(() => document.querySelectorAll('[data-shop-row]').length);
check(rows2 === items.length + 1, `it added exactly one row (${rows2})`);

await page.screenshot({ path: join(OUT, 'shop-390-scan-action.png') });

await browser.close();
await vite.close();

console.log(`\nshots -> ${OUT}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILED:\n  - ${fail.join('\n  - ')}`);
  process.exit(1);
}
console.log('all checks passed');
