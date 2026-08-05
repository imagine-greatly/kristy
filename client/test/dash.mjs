// THE DASHBOARD, measured at a true 390px IN THE REAL APP FRAME.
//
//   node test/dash.mjs [outDir]        (no API server needed — see buildTripFixture.mjs)
//
// Viewport via Playwright, never --window-size: Chrome enforces a ~500px minimum window on
// Windows, so a 390px request renders at 504 and crops, which looks exactly like horizontal
// overflow. Same rule as cart.mjs, composed.mjs, skim.mjs and shots.mjs.
//
// THE HERO RULE IS THE CLAIM AND IT IS MEASURED, NOT ASSERTED IN A COMMENT. "The answer to
// what-next is the largest, highest thing on screen in every state" is precisely the kind of
// prose invariant this codebase keeps finding to be false — so it is read off
// getBoundingClientRect and getComputedStyle, in all five states, with the real TopBar above.

import { chromium } from './browser.mjs';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFixture } from './buildTripFixture.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots-dash');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

const { items, cards } = writeFixture(join(__dirname, 'tripFixture.json'));
const { groupForWalk } = await import('../src/lib/listSections.js');
const SECTIONS = groupForWalk(items).length;

const VIEWS = ['empty', 'completed', 'ready', 'midtrip', 'finished'];

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

/* The dashboard mounts the real CartMoment, which really fetches its attachments. Answered
   from the same summaries the fixture built — same KB, same projectEntry, same summarize the
   route's own `forViewer(c, anonViewer())` applies. This substitutes the TRANSPORT, never the
   content: unanswered, every screenshot would show bare rows with no do lines on them. */
await page.route('**/api/counter/summaries*', (route) => {
  const want = new URL(route.request().url()).searchParams.get('slugs')?.split(',') || [];
  const out = {};
  for (const s of want) if (cards[s]) out[s] = cards[s];
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ cards: out }) });
});

const open = async (view) => {
  await page.goto(`${base}/test/dash.html?view=${view}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-dashboard]', { timeout: 15000 });
  await page.waitForTimeout(300);
};

console.log(`FIXTURE: ${items.length} rows across ${SECTIONS} sections, ${Object.keys(cards).length} cards\n`);

/* ═════════ THE APP FRAME. Measured once — TopBar is identical in every state. ═════════

   THE QUESTION THIS ANSWERS: the hero rule says "largest and highest", and TopBar sits above
   the hero in the real app carrying a goal chip and a premium mark. Rendering the Dashboard
   alone made `hero top = 0px` a fact about a harness. This is the app frame, so it is a fact
   about the app. */
await open('midtrip');
const frame = await page.evaluate(() => {
  const px = (el, p) => (el ? parseFloat(getComputedStyle(el)[p]) : null);
  const bar = document.querySelector('.topbar');
  const hero = document.querySelector('[data-hero]');
  const chip = [...document.querySelectorAll('.topbar button, .topbar *')].find((el) =>
    el.textContent.trim() === 'Eating cleaner'
  );
  const line = hero?.querySelector('[data-hero-line]');
  const action = hero?.querySelector('[data-hero-action]');
  const r = (el) => (el ? el.getBoundingClientRect() : null);
  return {
    barH: Math.round(r(bar)?.height || 0),
    barBottom: Math.round(r(bar)?.bottom || 0),
    heroTop: Math.round(r(hero)?.top || 0),
    chipText: chip?.textContent.trim() || null,
    chipSize: px(chip, 'fontSize'),
    chipW: Math.round(r(chip)?.width || 0),
    chipArea: Math.round((r(chip)?.width || 0) * (r(chip)?.height || 0)),
    chipColor: chip ? getComputedStyle(chip).color : null,
    // Read off RENDERED style, so a fill introduced by any ancestor rule is caught.
    chipBg: chip ? getComputedStyle(chip).backgroundColor : null,
    actionBg: action ? getComputedStyle(action).backgroundColor : null,
    lineSize: px(line, 'fontSize'),
    lineW: Math.round(r(line)?.width || 0),
    lineColor: line ? getComputedStyle(line).color : null,
    actionSize: px(action, 'fontSize'),
    actionH: Math.round(r(action)?.height || 0),
    actionArea: Math.round((r(action)?.width || 0) * (r(action)?.height || 0)),
    kickerColor: (() => {
      const k = document.querySelector('[data-hero-kicker]');
      return k ? getComputedStyle(k).color : null;
    })(),
    // Every piece of chrome text in the bar, with its size.
    barText: [...(bar?.querySelectorAll('*') || [])]
      .filter((el) => el.children.length === 0 && el.textContent.trim())
      .map((el) => `${el.textContent.trim()} (${parseFloat(getComputedStyle(el).fontSize)}px)`),
  };
});

console.log('THE APP FRAME — does the goal chip compete with the hero?');
console.log(`    TopBar ${frame.barH}px tall, ends at ${frame.barBottom}px; hero starts at ${frame.heroTop}px`);
console.log(`    chrome text: ${frame.barText.join(', ') || '(none)'}`);
console.log(`    goal chip "${frame.chipText}" ${frame.chipSize}px, ${frame.chipW}px wide, ${frame.chipColor}`);
console.log(`    hero line ${frame.lineSize}px / action ${frame.actionSize}px, ${frame.actionH}px tall`);
check(frame.barH > 0 && frame.chipText === 'Eating cleaner', 'the REAL TopBar rendered with a real goal chip');
check(
  frame.chipSize < frame.lineSize,
  `the goal chip is smaller than the hero line (${frame.chipSize}px vs ${frame.lineSize}px)`
);
check(
  frame.chipSize < frame.actionSize,
  `and smaller than the hero action (${frame.chipSize}px vs ${frame.actionSize}px)`
);
/* AREA AGAINST THE ACTION, NOT WIDTH AGAINST A TEXT RUN. The first version of this check
   compared the chip's box width to the hero LINE's rendered width and failed at 127 vs
   203px — but that ratio is mostly a fact about how short "Produce — 4 of 7" happens to be,
   not about anything competing. A metric whose result swings on the length of a string is
   measuring the string. What "competes" actually means here is claiming comparable weight
   as a target, so it is compared to the hero's ACTION.

   THE THRESHOLD WAS ONE QUARTER, AND IT WAS A FACT ABOUT A SLAB. The hero action used to be
   `alignSelf: stretch` at 56px — roughly 350×56 — so a quarter of it was a generous ceiling
   that nothing was near. When the action was deliberately reduced to an action-sized control
   (2026-08-04: a full-width field of warm bone on near-black green reads as harsh, and the
   harshness is AREA, not hue), the same ratio started demanding a ~308px-wide button to stay
   satisfied. It would have mandated the banner as the price of passing.

   So the number went and the INTENT stayed, tested directly. Dominance on this surface comes
   from FILL, not from square pixels: the hero action is the screen's only bone-filled
   control and the chip is a hairline outline. That is the property worth pinning, and it
   cannot be satisfied by making a button bigger. The area check survives as a strict
   inequality so the chip still cannot grow into a comparable target. */
/* DOMINANCE BY LUMINANCE, which is what "filled" actually meant. The first draft of this
   asserted the chip had NO background and failed: the chip is `rgb(22,48,31)`, a dark green
   tint. It is filled — it just recedes into the near-black ground instead of advancing off
   it. Transparency was never the property; being the one thing on screen made of warm bone
   is. So this reads relative luminance off the RENDERED colour: the hero action is light on
   a dark surface, the chip sits down in the ground with everything else. A shrunken button
   cannot fail this, and a chip cannot pass it by growing. */
const lum = (c) => {
  const [r, g, b] = (String(c).match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
  const f = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const chipLum = lum(frame.chipBg);
const actionLum = lum(frame.actionBg);
check(
  actionLum > 0.5 && chipLum < 0.1,
  `the hero action is the one thing made of bone; the chip recedes into the ground ` +
    `(action luminance ${actionLum.toFixed(3)}, chip ${chipLum.toFixed(3)})`
);
check(
  frame.chipArea < frame.actionArea,
  `the chip is a smaller target than the hero action (${frame.chipArea}px² vs ${frame.actionArea}px²)`
);
/* And it is not drawn at headline contrast. `--ink-muted` against the hero line's `--ink`
   is the difference between chrome you can find and content you read. */
check(
  frame.chipColor === 'rgb(157, 176, 162)' && frame.lineColor === 'rgb(244, 241, 232)',
  `the chip is ink-muted and the hero line is ink (${frame.chipColor} vs ${frame.lineColor})`
);
/* GOLD IS IDENTITY, NEVER ORIENTATION. The first draft set the kicker in accentGold, which
   put four gold elements in the top third once the real TopBar was above it. Every other
   eyebrow in the app is textMuted; this pins that. */
check(
  frame.kickerColor === 'rgb(157, 176, 162)',
  `the hero kicker is an eyebrow, not an identity mark (${frame.kickerColor})`
);
check(frame.heroTop >= frame.barBottom, 'the hero begins below the frame, not under it');

/* ═════════════════════════ THE HERO RULE, IN ALL FIVE STATES ═════════════════════════ */
console.log('\nTHE HERO RULE');
for (const v of VIEWS) {
  await open(v);
  const d = await page.evaluate(() => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return { missing: true };
    const hb = hero.getBoundingClientRect();
    const leaves = [...document.querySelectorAll('body *')].filter(
      (el) => el.children.length === 0 && el.textContent.trim().length > 2
    );
    const sizes = leaves.map((el) => ({
      t: el.textContent.trim().slice(0, 46),
      size: parseFloat(getComputedStyle(el).fontSize),
      top: Math.round(el.getBoundingClientRect().top),
      chrome: !!el.closest('.topbar'),
    }));
    const heroMax = Math.max(
      ...[...hero.querySelectorAll('*')].filter((el) => !el.children.length)
        .map((el) => parseFloat(getComputedStyle(el).fontSize))
    );
    return {
      state: document.querySelector('[data-dashboard]')?.getAttribute('data-dashboard'),
      kicker: hero.querySelector('[data-hero-kicker]')?.textContent.trim() || null,
      line: hero.querySelector('[data-hero-line]')?.textContent.trim(),
      action: hero.querySelector('[data-hero-action]')?.textContent.trim() || null,
      sub: hero.querySelector('[data-hero-sub]')?.textContent.trim() || null,
      heroMax,
      // CONTENT above the hero. Chrome is excluded by name and on purpose: TopBar is the app
      // frame, not an answer to what-next, and the rule is about the content surface.
      above: sizes.filter((s) => !s.chrome && s.top < Math.round(hb.top)).map((s) => s.t),
      bigger: sizes.filter((s) => !s.chrome && s.size > heroMax).map((s) => `${s.t} (${s.size}px)`),
      // Verbatim echoes of hero copy anywhere below it — the duplication the split removed.
      echoes: (() => {
        const heroText = [...hero.querySelectorAll('*')].filter((e) => !e.children.length)
          .map((e) => e.textContent.trim()).filter((t) => t.length > 3);
        const bodyText = sizes.filter((s) => s.top >= Math.round(hb.bottom)).map((s) => s.t);
        return heroText.filter((t) => bodyText.includes(t.slice(0, 46)));
      })(),
      // `colors.action` — warm bone, the one filled action per screen.
      bone: [...document.querySelectorAll('button')]
        .filter((b) => getComputedStyle(b).backgroundColor === 'rgb(239, 233, 216)')
        .map((b) => b.textContent.trim()),
      heroAction: hero.querySelector('[data-hero-action]')?.textContent.trim() || null,
      seedControls: document.querySelectorAll('[data-seed-last]').length,
      completeControls: document.querySelectorAll('[data-complete-trip]').length,
      walkSegs: [...document.querySelectorAll('[data-walk-seg]')].map((s) => s.textContent.trim()),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      docHeight: Math.round(document.documentElement.scrollHeight),
      // The old cart header must not be back.
      cartH1: [...document.querySelectorAll('[data-dashboard] h1')].map((h) => h.textContent.trim()),
      progressLabels: [...document.querySelectorAll('[data-progress-label]')].length,
    };
  });

  console.log(`\n  ${v.toUpperCase()}${d.kicker ? ` — ${d.kicker}` : ''}`);
  console.log(`    "${d.line}"${d.action ? `  [${d.action}]` : '  (no action)'}`);
  if (d.sub) console.log(`    ${d.sub}`);
  check(!d.missing && d.state === v, `${v}: the state resolves from cart.progress alone`);
  check(d.above.length === 0, `${v}: no content above the hero${d.above.length ? ` — ${d.above.join(', ')}` : ''}`);
  check(d.bigger.length === 0, `${v}: nothing set larger than the hero${d.bigger.length ? ` — ${d.bigger.join(', ')}` : ''}`);
  check(d.echoes.length === 0, `${v}: the hero is not repeated below it${d.echoes.length ? ` — ${d.echoes.join(' / ')}` : ''}`);
  check(d.cartH1.length === 0, `${v}: no second page title under the hero${d.cartH1.length ? ` — ${d.cartH1.join(', ')}` : ''}`);
  check(d.progressLabels === 0, `${v}: the superseded progress readout is gone (${d.progressLabels})`);
  check(d.seedControls <= 1, `${v}: at most one seeding control (${d.seedControls})`);
  check(d.completeControls <= 1, `${v}: at most one completion control (${d.completeControls})`);
  check(d.overflow === 0, `${v}: no horizontal overflow (${d.overflow}px)`);
  /* EXACTLY ONE FILLED ACTION PER SCREEN, AND IT IS THE HERO'S. Both halves of this were
     wrong until they were counted: `finished` had zero (a gold-bordered "Finish the trip",
     the quietest answer of the five, in the state where a shopper most wants to be done)
     and `completed` had two (the hero plus TripQuestion's "Go"). Neither is visible in a
     stylesheet — one is an absence and the other is two components each correct alone. */
  check(
    d.bone.length === 1,
    `${v}: exactly one bone-filled action (${d.bone.length}${d.bone.length ? ` — ${d.bone.join(', ')}` : ''})`
  );
  check(
    d.heroAction ? d.bone[0] === d.heroAction : true,
    `${v}: and it is the hero's (${d.bone[0] || 'none'})`
  );
  if (d.walkSegs.length) console.log(`    walk: ${d.walkSegs.join(' · ')}`);
  console.log(`    largest type ${d.heroMax}px · page ${d.docHeight}px`);

  await page.screenshot({ path: join(OUT, `dash-390-${v}.png`) });
  await page.screenshot({ path: join(OUT, `dash-390-${v}-full.png`), fullPage: true });
}

/* ═════════ THE STATE-SPECIFIC CLAIMS. Each state promises something different. ═════════ */
console.log('\nWHAT EACH STATE PROMISES');

await open('ready');
const ready = await page.evaluate(() => ({
  kicker: document.querySelector('[data-hero-kicker]')?.textContent.trim(),
  segs: document.querySelectorAll('[data-walk-seg]').length,
  action: document.querySelector('[data-hero-action]')?.textContent.trim(),
}));
check(ready.action === 'Start shopping', `ready: the loudest thing is START (${ready.action})`);
check(ready.segs === SECTIONS, `ready: the walk shape names all ${SECTIONS} sections (${ready.segs})`);
check(/^\d+ items · \d+ sections$/.test(ready.kicker), `ready: the kicker is the shape of the walk ("${ready.kicker}")`);

await open('midtrip');
const mid = await page.evaluate(() => ({
  line: document.querySelector('[data-hero-line]')?.textContent.trim(),
  action: document.querySelector('[data-hero-action]')?.textContent.trim(),
  here: document.querySelector('[data-walk-seg][style*="rgba(196, 166, 90"]')?.textContent.trim()
     || [...document.querySelectorAll('[data-walk-seg]')].map((s) => s.textContent.trim())[0],
}));
check(mid.action === 'Resume shopping', `midtrip: RESUME is the action (${mid.action})`);
check(/ — \d+ of \d+$/.test(mid.line), `midtrip: it names the aisle and the count ("${mid.line}")`);

await open('finished');
const fin = await page.evaluate(() => ({
  action: document.querySelector('[data-hero-action]')?.textContent.trim(),
  attr: document.querySelectorAll('[data-hero-action][data-complete-trip]').length,
}));
check(fin.action === 'Finish the trip', `finished: FINISH is the action, not RESUME (${fin.action})`);
check(fin.attr === 1, 'finished: the completion door is the hero itself');

await open('completed');
const comp = await page.evaluate(() => ({
  action: document.querySelector('[data-hero-action]')?.textContent.trim(),
  attr: document.querySelectorAll('[data-hero-action][data-seed-last]').length,
  total: document.querySelectorAll('[data-seed-last]').length,
}));
check(/^Start from those \d+ items$/.test(comp.action), `completed: one tap from last week ("${comp.action}")`);
check(comp.attr === 1 && comp.total === 1, 'completed: exactly one seeding control, and it is the hero');

/* THE ASK IS NOT ON THIS SURFACE. `premium: false` in the harness is the tier that used to
   raise "Basic cart / Unlock the full cart" as a banner over the shopper's own rows. */
console.log('\nNO ASK ON OPEN');
for (const v of VIEWS) {
  await open(v);
  const asks = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .map((b) => b.textContent.trim())
      .filter((t) => /unlock|upgrade|membership|basic cart|go premium/i.test(t))
  );
  check(asks.length === 0, `${v}: no upgrade ask renders on open${asks.length ? ` — ${asks.join(', ')}` : ''}`);
}

await browser.close();
await vite.close();

console.log(`\nshots -> ${OUT}`);
if (fail.length) {
  console.error(`\n${fail.length} FAILED:\n  - ${fail.join('\n  - ')}`);
  process.exit(1);
}
console.log('all checks passed');
