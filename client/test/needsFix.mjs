// AN UNREADABLE ROW MUST SAY SO, AND BE FIXABLE, AT 390px.
//
//   node test/needsFix.mjs
//
// `listImport` has written `needsFix` + "Couldn't read this one — tap to fix it." since imports
// shipped, and NOTHING rendered either one. So a row the vision layer could not read arrived
// looking like an ordinary row and shopped like one — and a confident misread ("tp" transcribed
// as "butter") was indistinguishable from a real item. Same shape as a false gold seal: a wrong
// read presented as fact.
//
// This drives the REAL CartMoment through the real cart hook with a needsFix row, at a true
// 390px, with real pointer input — the flag renders, the correction submits, and the flag is
// GONE afterwards. That last assertion is the one that matters: a fix that leaves the row still
// flagged is a fix that nags about something already corrected.

import { chromium } from './browser.mjs';
import { createServer } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || join(__dirname, 'shots-needsfix');
const WIDTH = 390;
mkdirSync(OUT, { recursive: true });

/* A harness is a compromise and this one is deliberately thin: it supplies the LIST (which a
   real import would have produced) and nothing else. The fix handler, the flag rendering and the
   clearing all come from the shipping components and the shipping cart hook — the parts a
   harness must never supply, per the dashHarness lesson. */
const HARNESS = join(__dirname, 'needsFixHarness.jsx');
writeFileSync(
  HARNESS,
  `import { useState } from 'react';
import CartMoment from '../src/components/CartMoment.jsx';

// The row shapes listImport emits for an unreadable line: one with partial letters, one with
// nothing legible at all (it falls back to 'Unreadable item').
const SEED = {
  goal: null,
  intro: '',
  items: [
    { id: 'a', name: 'Chicken thighs', category: 'Protein', checked: false, source: 'imported' },
    { id: 'b', name: 'ch??se', category: 'Pantry', checked: false, source: 'imported', needsFix: true, note: "Couldn't read this one — tap to fix it." },
    { id: 'c', name: 'Unreadable item', category: 'Pantry', checked: false, source: 'imported', needsFix: true, note: "Couldn't read this one — tap to fix it." },
  ],
};

export default function Harness() {
  const [list, setList] = useState(SEED);
  // The shipping refine semantics, mirrored here only because the hook needs a store: name in,
  // refined stamped, needsFix and note cleared. cart.refine is what CartMoment actually calls.
  const refine = (id, newName) =>
    setList((cur) => ({
      ...cur,
      items: cur.items.map((i) =>
        i.id === id ? { ...i, name: newName, refined: true, needsFix: false, note: '' } : i
      ),
    }));
  const cart = {
    list, loading: false, busy: '', note: '', premium: true, gated: false,
    progress: { total: list.items.length, checked: 0, remaining: list.items.length, complete: false },
    seedable: { seedable: false, items: 0 },
    toggle: () => {}, remove: (id) => setList((c) => ({ ...c, items: c.items.filter((i) => i.id !== id) })),
    add: () => {}, refine, keepItem: () => {}, takeOffer: () => {}, setNote: () => {}, setGated: () => {},
    rebuild: () => {}, compose: async () => ({ ok: true }), seedFromLast: async () => ({ ok: false }),
  };
  return (
    <div style={{ width: 390 }}>
      <CartMoment cart={cart} goals={[]} premium />
    </div>
  );
}
`,
  'utf8'
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

await page.goto(`${base}/test/needsFix.html`, { waitUntil: 'networkidle' });
await page.waitForSelector('[data-needs-fix]', { timeout: 10000 }).catch(() => {});

console.log('\nTHE FLAG RENDERS');
const flags = await page.locator('[data-needs-fix]').count();
check(flags === 2, `both unreadable rows carry the flag (found ${flags})`);

const noteText = await page.locator('[data-needs-fix]').first().innerText();
check(/could|read/i.test(noteText), `the note is shown to the shopper: ${JSON.stringify(noteText.slice(0, 60))}`);

// Contrast, off RENDERED colour, ancestor opacity folded in — the shop-mode lesson.
const contrast = await page.evaluate(() => {
  const el = document.querySelector('[data-needs-fix] span');
  if (!el) return null;
  const lum = (c) => {
    const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const eff = (node) => {
    let o = 1;
    for (let n = node; n; n = n.parentElement) o *= Number(getComputedStyle(n).opacity || 1);
    return o;
  };
  let bgEl = el;
  let bg = 'rgba(0, 0, 0, 0)';
  while (bgEl && /rgba\(0, 0, 0, 0\)|transparent/.test(bg)) {
    bg = getComputedStyle(bgEl).backgroundColor;
    bgEl = bgEl.parentElement;
  }
  const fgL = lum(getComputedStyle(el).color);
  const bgL = lum(bg);
  const o = eff(el);
  // Composite the text over its ground at the effective opacity.
  const mixed = fgL * o + bgL * (1 - o);
  const [hi, lo] = mixed > bgL ? [mixed, bgL] : [bgL, mixed];
  return { ratio: (hi + 0.05) / (lo + 0.05), opacity: o };
});
check(contrast !== null, 'the note text node was found for a contrast read');
if (contrast) {
  check(contrast.opacity === 1, `no ancestor opacity on the note (effective ${contrast.opacity})`);
  check(contrast.ratio >= 4.5, `WCAG AA off rendered colour: ${contrast.ratio.toFixed(2)}:1 (needs 4.5)`);
}

console.log('\nTHE CORRECTION WORKS, WITH REAL POINTER INPUT');
const input = page.locator('[data-needs-fix] input').first();
check((await input.count()) === 1, 'the row carries an input');
const prefilled = await input.inputValue();
check(prefilled === 'ch??se', `partial letters are pre-filled to edit, not discarded (${JSON.stringify(prefilled)})`);

// The 'Unreadable item' placeholder must NOT be pre-filled — it is our word, not theirs.
const second = await page.locator('[data-needs-fix] input').nth(1).inputValue();
check(second === '', `the "Unreadable item" placeholder is not pre-filled (${JSON.stringify(second)})`);

await input.fill('');
await input.type('cheese');
await page.locator('[data-needs-fix] button[type="submit"]').first().click();
await page.waitForTimeout(300);

console.log('\nAND CLEARING IT STOPS THE FLAG');
const after = await page.locator('[data-needs-fix]').count();
check(after === 1, `one flag left, not two (found ${after})`);
const names = await page.locator('[data-name]').allInnerTexts();
check(names.some((n) => /cheese/i.test(n)), `the corrected name is on the row: ${JSON.stringify(names)}`);
check(!names.some((n) => /ch\?\?se/.test(n)), 'the unreadable text is gone');

await page.screenshot({ path: join(OUT, 'needs-fix.png'), fullPage: true });
await browser.close();
await vite.close();

console.log(`\n${fail.length ? `✗ ${fail.length} failed` : '✓ all passed'} — shot in ${OUT}`);
process.exit(fail.length ? 1 : 0);
