// The COMPOSED list, measured at a true 390px.
//
//   node test/composed.mjs [outDir]        (the API server must be running on :3001)
//
// WHY THIS EXISTS ALONGSIDE cart.mjs. Both now render composed PICKS through the shared
// generator, so neither is measuring an input the product cannot emit. They ask different
// questions of it: cart.mjs asks whether the surface WORKS — tap targets, collapse, real
// pointer clicks, first-paint state — and this asks what it COSTS, in rendered line boxes
// and page height, plus the two honesty rules that have no other home (a matched row may
// not carry both a `why` and a do line; a row may not display a section it is not sorted
// into).
//
// Until 2026-08-03 cart.mjs measured twelve BARE NOUNS carrying no `why`, transcribed from
// the Phase 2 mock — which was hand-authored HTML, not a render of the component — whose
// names came from the Phase 1 probe, which invented them. The double-prose row was
// invisible to all four artifacts because none of them ever held a `why`.
//
// THE FIXTURE IS REGENERATED ON EVERY RUN by the shipping attachCards over the shipping
// PICKS, so it cannot drift from the matcher the way a hand-written fixture does.
// listMatch reaches the KB through node:fs and cannot be bundled for a browser, which is
// the same split test/loop.mjs uses: semantics in node, geometry here.
//
// VIEWPORT OVER CDP, NEVER --window-size. Chrome enforces a ~500px minimum window on
// Windows, so a 390px request renders at 504 and crops.

import { chromium } from './browser.mjs';
import { createServer } from 'vite';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFixture } from './buildFixture.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots-composed');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

/* ── The twelve. A composed cart, in the order compose returns it. ── */
const KEYS = [
  'eggs', 'greek_yogurt', 'canned_fish', 'spinach', 'seasonal_veg', 'berries',
  'almonds', 'avocado', 'frozen_veg', 'sweet_potatoes', 'steel_cut_oats', 'evoo',
];

// One generator for every browser fixture — see buildFixture.mjs for why a fixture is
// built from the shipping PICKS rather than written down beside the test.
const items = writeFixture(join(__dirname, 'composedFixture.json'), KEYS);

console.log('\nATTACHMENT, as the server stamps it');
for (const it of items) {
  const authored = it.perimeterId || '—';
  const got = it.cardSlug || '(none)';
  const mark = it.perimeterId ? (it.cardSlug === it.perimeterId ? ' ' : '✗') : ' ';
  console.log(
    `  ${mark} ${String(it.name).padEnd(38)} authored ${String(authored).padEnd(28)} -> ${String(got).padEnd(30)} [${it.cardSection || '—'}]`
  );
}
const authoredRows = items.filter((i) => i.perimeterId);
const wrong = authoredRows.filter((i) => i.cardSlug && i.cardSlug !== i.perimeterId);
const dropped = authoredRows.filter((i) => !i.cardSlug);
console.log(
  `  authored ${authoredRows.length} · agreed ${authoredRows.length - wrong.length - dropped.length} · ` +
  `WRONG ${wrong.length} · dropped ${dropped.length}`
);

const vite = await createServer({ root: join(__dirname, '..'), server: { port: 0 }, logLevel: 'error' });
await vite.listen();
const base = `http://localhost:${vite.config.server.port || vite.httpServer.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 2 });
const fail = [];
const check = (ok, msg) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) fail.push(msg);
};

await page.goto(`${base}/test/composed.html`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-cart-block]', { timeout: 15000 });
await page.waitForSelector('[data-attach]', { timeout: 15000 });
await page.waitForTimeout(400);

const w = await page.evaluate('document.documentElement.clientWidth');
if (w !== WIDTH) throw new Error(`viewport rendered at ${w}px, not ${WIDTH}px — measurements would be wrong`);

/* ── Line boxes, the only honest way to count a wrap. Same helper as skim.mjs. ── */
const LINES_FN = `
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
  };`;

const m = await page.evaluate(`(() => {
  ${LINES_FN}
  const blocks = [...document.querySelectorAll('[data-cart-block]')].map((b) => {
    const rows = [...b.querySelectorAll('[data-cart-row]')].map((r) => ({
      name: r.querySelector('[data-name]')?.textContent || '',
      nameLines: lines(r.querySelector('[data-name]')),
      whyLines: lines(r.querySelector('[data-why]')),
      label: r.querySelector('[data-cat-label]')?.textContent || null,
      height: Math.round(r.getBoundingClientRect().height),
    }));
    const attach = b.querySelector('[data-attach]');
    return {
      slug: b.getAttribute('data-cart-block'),
      rows,
      hasAttach: !!attach,
      eyebrow: attach?.querySelector('[data-attach-eyebrow]')?.textContent || null,
      eyebrowLines: lines(attach?.querySelector('[data-attach-eyebrow]')),
      // The do TEXT, not the wrapper — the wrapper also holds the chevron, which sits on
      // its own line box and would inflate every do line by one. Both are reported: the
      // wrapper number is what the first measurement of this surface used, so keeping it
      // is what makes a before/after comparison apples-to-apples.
      doText: attach?.querySelector('[data-do-text]')?.textContent || null,
      doLines: lines(attach?.querySelector('[data-do-text]')),
      doWrapperLines: lines(attach?.querySelector('[data-attach-do]')),
      height: Math.round(b.getBoundingClientRect().height),
    };
  });
  return {
    blocks,
    sections: [...document.querySelectorAll('[data-walk-section]')].map((s) => ({
      id: s.dataset.walkSection,
      title: s.querySelector('[data-group-label]')?.textContent || '',
      rows: s.querySelectorAll('[data-cart-row]').length,
    })),
    rows: document.querySelectorAll('[data-cart-row]').length,
    attachments: document.querySelectorAll('[data-attach]').length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    docHeight: Math.round(document.documentElement.scrollHeight),
    saveControls: document.querySelectorAll('[data-save-list]').length,
  };
})()`);

console.log('\nSECTIONS, in walk order');
for (const s of m.sections) console.log(`  ${String(s.id || 'trailing').padEnd(12)} "${s.title}"  ${s.rows} rows`);

console.log('\nPER-BLOCK LINE COST');
let matchedRowLines = 0, matchedRowN = 0, plainRowLines = 0, plainRowN = 0;
for (const b of m.blocks) {
  const rowLines = b.rows.reduce((n, r) => n + r.nameLines + r.whyLines, 0);
  const attachLines = b.eyebrowLines + b.doWrapperLines;
  const total = rowLines + attachLines;
  if (b.hasAttach) { matchedRowLines += total; matchedRowN += b.rows.length; }
  else { plainRowLines += rowLines; plainRowN += b.rows.length; }
  console.log(
    `  ${String(b.slug).padEnd(30)} rows ${b.rows.length}  ` +
    `name+why ${rowLines}  eyebrow ${b.eyebrowLines}  do ${b.doWrapperLines} (text ${b.doLines})  = ${total} lines, ${b.height}px`
  );
  for (const r of b.rows) {
    console.log(`      "${r.name}" name ${r.nameLines} + why ${r.whyLines}${r.label ? `  label="${r.label}"` : ''}`);
  }
}

const perMatched = matchedRowN ? matchedRowLines / matchedRowN : 0;
const perPlain = plainRowN ? plainRowLines / plainRowN : 0;
console.log('\nLINES PER ROW');
console.log(`  matched rows   ${matchedRowN} rows, ${matchedRowLines} lines  = ${perMatched.toFixed(2)} lines/row`);
console.log(`  unmatched rows ${plainRowN} rows, ${plainRowLines} lines  = ${perPlain.toFixed(2)} lines/row`);
console.log(`  a match costs  +${(perMatched - perPlain).toFixed(2)} lines over an unmatched row  (the mock budgeted +2)`);

console.log('\nTOTALS');
console.log(`  rows ${m.rows} · attachments ${m.attachments} · page height ${m.docHeight}px · overflow ${m.overflow}px`);

check(m.overflow === 0, `no horizontal overflow at ${WIDTH}px (${m.overflow}px)`);
check(m.rows === 12, `12 rows rendered (${m.rows})`);
check(m.saveControls === 0, `no save control on the cart (${m.saveControls})`);

/* ── A row must never display a section it is not sorted into. ── */
const SECTION_TITLES = new Set(['Produce', 'Meat', 'Seafood', 'Dairy & Eggs', 'Pantry & Bulk', 'Frozen']);
const liars = [];
for (const s of m.sections) {
  for (const b of m.blocks) {
    for (const r of b.rows) {
      if (r.label && SECTION_TITLES.has(r.label)) liars.push(`${r.name} shows "${r.label}"`);
    }
  }
}
check(liars.length === 0, `no row displays a walk-section name as a trailing label${liars.length ? ` — ${[...new Set(liars)].join('; ')}` : ''}`);

/* ── The double-prose rule: a matched row is name + eyebrow + do. ── */
const doubled = m.blocks.filter((b) => b.hasAttach && b.rows.some((r) => r.whyLines > 0));
check(
  doubled.length === 0,
  `no matched row renders a why beside its do line${doubled.length ? ` — ${doubled.map((b) => b.slug).join(', ')}` : ''}`
);

/* ── The attachment opens on a REAL pointer click. ── */
const firstSlug = m.blocks.find((b) => b.hasAttach)?.slug;
if (firstSlug) {
  await page.click(`[data-attach="${firstSlug}"]`);
  await page.waitForTimeout(350);
  const opened = await page.evaluate(`document.querySelectorAll('[data-counter-card]').length`);
  check(opened === 1, `tapping an attachment opens exactly one card (${opened})`);
  await page.click(`[data-cart-block="${firstSlug}"] button:has-text("Close")`).catch(() => {});
  await page.waitForTimeout(250);
}

await page.screenshot({ path: join(OUT, 'composed-390.png'), fullPage: true });
console.log(`\nshot -> ${join(OUT, 'composed-390.png')}`);

await browser.close();
await vite.close();

if (fail.length) {
  console.log(`\n${fail.length} FAILED`);
  for (const f of fail) console.log(`  ✗ ${f}`);
  process.exit(1);
}
console.log('\nall checks passed');
