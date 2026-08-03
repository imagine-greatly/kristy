/* THE ONE PLACE A BROWSER FIXTURE COMES FROM, and it is the shipping product.
 *
 * Every browser test used to render twelve BARE NOUNS carrying no `why` — "Blueberries",
 * "Eggs", "Olive oil". The product never produces that. Those names came from the Phase 2
 * mock, which was hand-authored HTML; the mock's names came from the Phase 1 probe, which
 * invented them. So the mock, the probe, the harness and the test that measured the build
 * all agreed with each other and none of them agreed with the compose flow, where every
 * one of the 51 PICKS carries a `why` and 22 carry an authored `perimeterId`.
 *
 * A row that renders both a `why` and a card's do line therefore could not be seen by any
 * of them. It is not that the checks were weak — they were run on an input the product
 * cannot emit.
 *
 * So a fixture is now BUILT, never written: real PICK names, real `why` values, real
 * authored ids, run through the real `attachCards`. The runners regenerate before every
 * run, so a fixture cannot drift from the matcher the way a hand-maintained one does —
 * the same failure mode as the stale demo mirrors.
 *
 * listMatch reaches the KB through node:fs and cannot be bundled for a browser, which is
 * why this is a node-side generator that writes JSON rather than an import in the harness.
 * Same split test/loop.mjs uses: semantics proven in node, geometry proven in the browser.
 */

import { writeFileSync } from 'node:fs';
import { PICKS } from '../../server/lib/list.js';
import { attachCards } from '../../server/lib/listMatch.js';

/**
 * Build a cart fixture from PICK keys, in the exact shape the server returns.
 *
 * @param {Array<string|[string, {checked?: boolean}]>} keys  pick keys, optionally with row state
 * @returns {Array<object>} items, carded
 */
export function composeFixture(keys) {
  const seeded = keys.map((entry, i) => {
    const [key, over = {}] = Array.isArray(entry) ? entry : [entry, {}];
    const p = PICKS[key];
    if (!p) throw new Error(`buildFixture: unknown pick "${key}" — a typo must fail, not drop a row`);
    return {
      id: `i${i}`,
      name: p.name,
      category: p.category,
      checked: false,
      source: 'template',
      why: p.why,
      ...(p.perimeterId ? { perimeterId: p.perimeterId } : {}),
      ...over,
    };
  });
  // The REAL matcher, not a transcription of what it did once.
  return attachCards({ items: seeded }, { log: false }).items;
}

/** Build and write, returning the items. */
export function writeFixture(path, keys) {
  const items = composeFixture(keys);
  writeFileSync(path, JSON.stringify(items, null, 2) + '\n');
  return items;
}

/* ── The twelve for cart.mjs ──────────────────────────────────────────────────────────
   Chosen so the surface's own properties still have something to measure:
     • beans + lentils genuinely collapse onto `beans_dried_vs_canned` (two authored ids
       pointing at one card), which is what the collapse assertions need
     • spinach and sweet_potatoes match nothing and carry a `why`, so the unmatched-row
       rule has a case
     • six sections are spanned, including frozen via the location rule
     • three rows arrive checked, so first-paint state has something to prove          */
export const CART_TWELVE = [
  ['berries', { checked: true }],
  'avocado',
  'spinach',
  ['sweet_potatoes', { checked: true }],
  'chicken',
  'salmon',
  ['eggs', { checked: true }],
  'greek_yogurt',
  'beans',
  'lentils',
  'evoo',
  'frozen_veg',
];
