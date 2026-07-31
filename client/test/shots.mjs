// Six representative counter cards, shot at a true 390px over CDP.
//
//   node test/shots.mjs [outDir]        (the API server must be running on :3001)
//
// One card per store section, each captured in BOTH states — summary as a shopper first
// meets it, and expanded after the tap — so the split can be judged rather than described.
//
// Viewport via Playwright (Emulation.setDeviceMetricsOverride), never --window-size:
// Chrome enforces a ~500px minimum window on Windows, so a 390px request renders at 504
// and crops, which looks exactly like horizontal overflow.

import { chromium, build } from './browser.mjs';
import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API = process.env.SKIM_API || 'http://localhost:3001';
const OUT = process.argv[2] || join(__dirname, 'shots');
const WIDTH = 390;

// One per section. Chosen to cover both edge renders: a `home` card (distinct eyebrow,
// no add-to-cart) and cards with an EMPTY watch_out, where the expanded read has to end
// cleanly on look_for rather than leave a labelled empty block.
const PICKS = [
  { slug: 'washing_produce', section: 'Produce', note: 'kind=home · no CTA' },
  { slug: 'beef_grassfed_vs_grainfed', section: 'Meat', note: 'watch_out EMPTY' },
  { slug: 'salmon_wild_vs_farmed', section: 'Seafood', note: 'watch_out ×1' },
  { slug: 'grassfed_butter', section: 'Dairy & Eggs', note: 'watch_out EMPTY' },
  { slug: 'beans_dried_vs_canned', section: 'Pantry & Bulk', note: 'watch_out EMPTY' },
  { slug: 'label_free_range', section: 'Label terms', note: 'watch_out ×2 · no CTA' },
];

const res = await fetch(`${API}/api/counter/cards`).catch(() => null);
if (!res?.ok) {
  console.error(`✗ could not read ${API}/api/counter/cards — is the server running?`);
  process.exit(2);
}
const { cards } = await res.json();
const bySlug = new Map(cards.map((c) => [c.slug, c]));

const bundle = await build({
  entryPoints: [join(__dirname, 'shot-harness.jsx')],
  bundle: true,
  format: 'iife',
  write: false,
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  define: { 'process.env.NODE_ENV': '"production"' },
  absWorkingDir: join(__dirname, '..'),
});
const js = bundle.outputFiles[0].text;

const page = (card, label) => `<!doctype html><html><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" />
<style>*{box-sizing:border-box}body{margin:0;background:#050D08;font-family:Inter,system-ui,sans-serif}</style>
</head><body><div id="root"></div>
<script>window.__CARD__=${JSON.stringify(card).replace(/</g, '\\u003c')};window.__LABEL__=${JSON.stringify(label).replace(/</g, '\\u003c')}</script>
<script>${js}</script></body></html>`;

let current = '';
const server = createServer((_req, res2) => {
  res2.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res2.end(current);
});
await new Promise((r) => server.listen(0, r));
const url = `http://localhost:${server.address().port}/`;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const tab = await browser.newPage({ viewport: { width: WIDTH, height: 900 }, deviceScaleFactor: 2 });

try {
  for (const [i, pick] of PICKS.entries()) {
    const card = bySlug.get(pick.slug);
    if (!card) {
      console.error(`✗ ${pick.slug} is not in the corpus`);
      continue;
    }
    current = page(card, `${pick.section} — ${pick.note}`);
    await tab.goto(url, { waitUntil: 'load' });
    await tab.waitForFunction('window.__SHOT_READY__ === true', null, { timeout: 30000 });

    const w = await tab.evaluate('document.documentElement.clientWidth');
    if (w !== WIDTH) throw new Error(`rendered at ${w}px, not ${WIDTH}px`);

    const file = join(OUT, `${i + 1}-${pick.slug}.png`);
    await tab.screenshot({ path: file, fullPage: true });
    console.log(`  ${i + 1}. ${pick.section.padEnd(14)} ${pick.slug.padEnd(28)} ${pick.note}`);
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`\n✓ six cards captured at ${WIDTH}px → ${OUT}\n`);
