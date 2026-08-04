/* THE FIXTURE FOR THE SHOP-MODE / DASHBOARD REVIEW, built the way buildFixture.mjs builds
 * the cart one: from the SHIPPING PICKS, through the SHIPPING attachCards, and — new here —
 * through the SHIPPING projectEntry + summarize, so the card copy on screen is the same free
 * summary /api/counter/summaries would return.
 *
 * WHY THE CARDS ARE BUILT IN NODE RATHER THAN FETCHED. cart.mjs waits on a live
 * /api/counter/summaries, which needs the API server and its env. That is right for a test of
 * the shipping surface. For a design review it adds a dependency without adding truth: the
 * route's own body is `getAllCards().map(c => forViewer(c, viewer))`, and an anonymous viewer
 * is exactly `summarize`. So this reads the same KB, applies the same projection, and cannot
 * drift from it any more than the route can.
 *
 * The `do` line comes from lib/doLines.json — the generated table, not the markdown, because
 * the markdown does not ship (deployBoundary).
 */

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { PICKS } from '../../server/lib/list.js';
import { attachCards } from '../../server/lib/listMatch.js';
import { projectEntry, summarize } from '../../server/lib/counterCards.js';

const KB = new URL('../../server/kristy_perimeter_kb.json', import.meta.url);
const DO_LINES = new URL('../../server/lib/doLines.json', import.meta.url);

/* THE TRIP. Chosen so the produce screen the brief asks for is real rather than arranged:
   seven produce rows, four of which match, and two of those four share `produce_seasonality`
   so the collapse the cart already performs has to survive the type inversion. The rest of
   the trip exists so "what section comes next" and the section pips have something true to
   read — a progress claim measured against one section is not a progress claim. */
export const TRIP = [
  // Produce — 7 rows, 4 matched, 3 cards (seasonal_veg + seasonal_fruit collapse)
  'berries',
  'avocado',
  'spinach',
  'seasonal_veg',
  'sweet_potatoes',
  'seasonal_fruit',
  'bananas_apples',
  // The rest of the walk
  'chicken',
  'salmon',
  'eggs',
  'greek_yogurt',
  'beans',
  'lentils',
  'evoo',
  'frozen_veg',
];

/** The trip as the server would hand it back: rows with cards attached. */
export function buildItems(keys = TRIP, state = {}) {
  const seeded = keys.map((key, i) => {
    const p = PICKS[key];
    if (!p) throw new Error(`proto/fixture: unknown pick "${key}" — a typo must fail, not drop a row`);
    return {
      id: `i${i}`,
      name: p.name,
      category: p.category,
      checked: !!state[key],
      source: 'template',
      why: p.why,
      ...(p.perimeterId ? { perimeterId: p.perimeterId } : {}),
    };
  });
  return attachCards({ items: seeded }, { log: false }).items;
}

/** The free summary for every slug on the trip, through the real projection. */
export function buildCards(items) {
  const kb = JSON.parse(readFileSync(KB, 'utf8'));
  const entries = Array.isArray(kb) ? kb : kb.entries || Object.values(kb).find(Array.isArray);
  const doLines = JSON.parse(readFileSync(DO_LINES, 'utf8'));
  const slugs = [...new Set(items.map((i) => i.cardSlug).filter(Boolean))];
  const out = {};
  for (const slug of slugs) {
    const entry = entries.find((e) => (e.slug || e.id) === slug);
    if (!entry) throw new Error(`proto/fixture: card "${slug}" matched but is not in the KB`);
    out[slug] = summarize(projectEntry(entry, { doLine: doLines[slug] || '' }));
  }
  return out;
}

export function writeFixture(path) {
  // Mid-trip state: four of the seven produce rows done, nothing after it. That is the
  // shape both surfaces are hardest on — shop mode has to say "Produce — 4 of 7", and the
  // dashboard has to say RESUME rather than START.
  const items = buildItems(TRIP, {
    berries: true,
    avocado: true,
    spinach: true,
    seasonal_veg: true,
  });
  const cards = buildCards(items);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ items, cards }, null, 2) + '\n');
  return { items, cards };
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const { items, cards } = writeFixture(new URL('./tripFixture.json', import.meta.url).pathname.slice(1));
  console.log(`${items.length} rows, ${Object.keys(cards).length} cards`);
}
