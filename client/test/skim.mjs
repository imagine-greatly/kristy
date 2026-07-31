// Counter card SKIM TESTS — the summary bar, measured at a true 390px.
//
//   node test/skim.mjs            (the API server must be running on :3001)
//
// WHY A BROWSER. Most of these assertions are properties of the data and could be checked
// in Node. The line counts are not: how many lines the summary occupies on a phone is a
// property of type, wrapping and the viewport, and there is no way to get it except by
// rendering. Those are the whole point — the card exists because the old one was too tall
// to read holding a cart.
//
// VIEWPORT OVER CDP, NEVER --window-size. Chrome enforces a ~500px minimum window on
// Windows, so a 390px request renders at 504 and crops — which looks exactly like
// horizontal overflow. Playwright's viewport goes through Emulation.setDeviceMetricsOverride,
// which is the thing that actually works.

import { chromium, build } from './browser.mjs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.SKIM_API || 'http://localhost:3001';
const WIDTH = 390;

// THE STANDARD IS PER ELEMENT. An earlier draft of the spec asked for ≤3 rendered lines
// in total; that was WITHDRAWN on 2026-07-31 because it cannot coexist with the other two
// limits in the same spec. Measured at 390px: a 14-word do line at 14px Inter wraps to two
// lines on ALL 80 cards, and a 12-word headline at 20px Playfair wraps to two on 72 of
// them. Eyebrow 1 + headline 2 + do 2 = 5, floor 4. Reaching 3 would need a ~6-word
// headline and a ~6-word do line, far under ≤12 and ≤14.
//
// Do not reintroduce a total-line target below 5. The per-element bars are the standard,
// and each one catches a real regression:
//   eyebrow  ≤1 — it is a label; long KB titles were taking three lines before the clamp
//   headline ≤2 — three means the verdict is too long to skim, and is trimmable in the KB
//   do       ≤2 — two is the floor for a 14-word imperative at this width
const MAX_EYEBROW_LINES = 1;
const MAX_HEADLINE_LINES = 2;
const MAX_DO_LINES = 2;
// The sum of the three above. A ceiling, not a target — it exists so a new element cannot
// be added to the summary without someone deciding to.
const MAX_SUMMARY_LINES = Number(process.env.SKIM_MAX_LINES || 5);
const MAX_HEADLINE_WORDS = 12;
const MAX_DO_WORDS = 14;

// Mirrors server/lib/counterCardLint.js — hyphenated compounds are one word.
const words = (s) => (String(s || '').match(/[\w’'-]+/g) || []).length;

/* ── The corpus, read from the live table via the API ─────────────────────── */

const corpusRes = await fetch(`${API}/api/counter/cards`).catch(() => null);
if (!corpusRes?.ok) {
  console.error(`✗ could not read ${API}/api/counter/cards — is the server running?`);
  process.exit(2);
}
const { cards } = await corpusRes.json();

/* ── Bundle the harness ───────────────────────────────────────────────────── */

const bundle = await build({
  entryPoints: [join(__dirname, 'skim-harness.jsx')],
  bundle: true,
  format: 'iife',
  write: false,
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  absWorkingDir: join(__dirname, '..'),
});
const js = bundle.outputFiles[0].text;

const PAGE = `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" />
<style>*{box-sizing:border-box}body{margin:0;background:#050D08;font-family:Inter,system-ui,sans-serif}</style>
</head><body><div id="root"></div>
<script>window.__CARDS__=${JSON.stringify(cards).replace(/</g, '\\u003c')}</script>
<script>${js}</script></body></html>`;

/* ── Serve it (file:// cannot fetch the API) ──────────────────────────────── */

const server = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(PAGE);
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/`;

/* ── Measure ──────────────────────────────────────────────────────────────── */

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 2 });

const failures = [];
try {
  // A harness that fails silently reports "0 cards" and passes vacuously. Surface it.
  page.on('pageerror', (e) => failures.push(`page error: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && failures.push(`console error: ${m.text()}`));

  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__SKIM_READY__ > 0', null, { timeout: 30000 });

  const width = await page.evaluate('document.documentElement.clientWidth');
  if (width !== WIDTH) failures.push(`viewport rendered at ${width}px, not ${WIDTH}px — measurements would be wrong`);

  const measured = await page.evaluate(`(() => {
    // A rendered line is a line BOX, not a height division: Range.getClientRects()
    // returns one rect per line the text actually occupies, which is the only honest
    // way to count a wrap.
    const lines = (el) => {
      if (!el) return 0;
      const r = document.createRange();
      r.selectNodeContents(el);
      const tops = new Set();
      for (const rect of r.getClientRects()) {
        if (rect.width < 0.5 || rect.height < 0.5) continue;
        tops.add(Math.round(rect.top * 2) / 2);
      }
      return tops.size;
    };

    return [...document.querySelectorAll('[data-counter-card]')].map((card) => {
      const q = (sel) => card.querySelector(sel);
      const eyebrow = q('[data-eyebrow]');
      const headline = q('[data-headline]');
      const doLine = q('[data-do-line]');

      return {
        slug: card.getAttribute('data-counter-card'),
        kind: card.getAttribute('data-kind'),
        // The summary's TEXT lines: eyebrow, headline, do. The tier badge sits on the
        // eyebrow's row, the CTA is excluded by the spec, and "The full read" is a
        // control rather than content.
        summaryLines: lines(eyebrow) + lines(headline) + lines(doLine),
        eyebrowLines: lines(eyebrow),
        headlineLines: lines(headline),
        doLines: lines(doLine),
        headlineText: headline ? headline.textContent : '',
        doText: doLine ? doLine.textContent : '',
        tierBadges: card.querySelectorAll('[data-tier-badge]').length,
        ctas: card.querySelectorAll('[data-cta]').length,
        // A checklist in summary state is the regression this card exists to remove.
        listsInSummary: card.querySelectorAll('ul').length,
        expandedMounted: card.querySelectorAll('[data-expanded]').length,
        overflowsRight: Math.round(card.getBoundingClientRect().right) > ${WIDTH},
      };
    });
  })()`);

  if (measured.length !== 80) failures.push(`rendered ${measured.length} cards, expected 80`);

  for (const m of measured) {
    const at = `${m.slug}`;
    if (m.summaryLines > MAX_SUMMARY_LINES) {
      failures.push(
        `${at}: summary is ${m.summaryLines} rendered lines (eyebrow ${m.eyebrowLines} + headline ${m.headlineLines} + do ${m.doLines}), max ${MAX_SUMMARY_LINES}`
      );
    }
    if (m.eyebrowLines > MAX_EYEBROW_LINES) failures.push(`${at}: eyebrow takes ${m.eyebrowLines} lines — the clamp is not holding`);
    if (m.headlineLines > MAX_HEADLINE_LINES) {
      failures.push(`${at}: headline wraps to ${m.headlineLines} lines (${words(m.headlineText)}w) — trim the decision in the KB: "${m.headlineText}"`);
    }
    if (m.doLines > MAX_DO_LINES) failures.push(`${at}: do line wraps to ${m.doLines} lines (${words(m.doText)}w): "${m.doText}"`);
    if (words(m.headlineText) > MAX_HEADLINE_WORDS) {
      failures.push(`${at}: headline is ${words(m.headlineText)} words, max ${MAX_HEADLINE_WORDS}`);
    }
    if (words(m.doText) > MAX_DO_WORDS) {
      failures.push(`${at}: do line is ${words(m.doText)} words, max ${MAX_DO_WORDS}`);
    }
    if (!m.doText.trim()) failures.push(`${at}: no do line rendered`);
    if (m.tierBadges !== 1) failures.push(`${at}: ${m.tierBadges} tier badges, expected exactly 1`);
    if (m.listsInSummary > 0) failures.push(`${at}: renders a checklist in summary state`);
    if (m.expandedMounted > 0) failures.push(`${at}: the expanded block is mounted before the tap`);
    if (m.kind === 'home' && m.ctas > 0) failures.push(`${at}: a home card must never offer an add-to-cart`);
    if (m.overflowsRight) failures.push(`${at}: overflows the ${WIDTH}px viewport`);
  }

  /* ── Report ── */
  const hist = {};
  for (const m of measured) hist[m.summaryLines] = (hist[m.summaryLines] || 0) + 1;
  console.log(`\nSKIM — ${measured.length} cards at ${width}px`);
  console.log(
    `  bars: eyebrow ≤${MAX_EYEBROW_LINES}, headline ≤${MAX_HEADLINE_LINES}, do ≤${MAX_DO_LINES}, summary ≤${MAX_SUMMARY_LINES} lines` +
      `  ·  headline ≤${MAX_HEADLINE_WORDS}w, do ≤${MAX_DO_WORDS}w\n`
  );
  console.log('  summary lines   ' + Object.keys(hist).sort().map((k) => `${k}:${hist[k]}`).join('  '));
  console.log('  headline wraps  ' + measured.filter((m) => m.headlineLines > 1).length + ' cards wrap to 2 lines');
  console.log('  do wraps        ' + measured.filter((m) => m.doLines > 1).length + ' cards wrap to 2 lines');
  console.log('  home cards      ' + measured.filter((m) => m.kind === 'home').map((m) => m.slug).join(', '));
  console.log('  with a CTA      ' + measured.filter((m) => m.ctas > 0).length);
} finally {
  await browser.close();
  server.close();
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} SKIM FAILURE(S)\n`);
  for (const f of failures) console.error('  · ' + f);
  process.exitCode = 1;
} else {
  console.log('\n✓ every card clears the skim bar.\n');
}
