// The five-tier → three-bucket mapping exists on the server AND on the client. This enforces it.
//
// The 2026-08-05 duplication survey found it written THREE times: `server/lib/haul.js`
// (authoritative — the server buckets the distribution it sends down), plus `HaulMoment.jsx`
// as `bucketOf` and `data.js` as `haulBucket`, byte-identical and kept in step by memory.
// The two client copies are now one (`client/src/lib/tierBucket.js`); the client-vs-server
// mirror remains, because demo has no backend by design and the Haul renders segment colours
// locally.
//
// Where a mirror is genuinely unavoidable it gets the listSectionsMirror.test.js treatment
// before it ships. That is the only pattern in this repo that has held.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { tierBucket } from './haul.js';
import { CART_TIERS } from './cartEdit.js';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT = join(__dirname, '..', '..', 'client', 'src', 'lib', 'tierBucket.js');
const src = readFileSync(CLIENT, 'utf8');

/* Evaluate the client's function for real rather than pattern-matching its source. A regex
   over an if-chain would pass on a body that had been rewritten to mean something else. */
function clientTierBucket() {
  const body = src.match(/export function tierBucket\(tier\) \{([\s\S]*?)\n\}/);
  if (!body) return null;
  // eslint-disable-next-line no-new-func
  return new Function('tier', body[1]);
}
const mirror = clientTierBucket();

test('the client function was parsed — this suite is not vacuously passing', () => {
  assert.ok(typeof mirror === 'function', 'could not extract tierBucket from the client module');
  assert.equal(mirror('approved'), 'approved', 'the extracted function does not behave like one');
});

test('every tier the engine can assign buckets identically on both sides', () => {
  for (const tier of nonEmpty(CART_TIERS, 'CART_TIERS', 5)) {
    assert.equal(mirror(tier), tierBucket(tier), `bucket drift on "${tier}"`);
  }
});

test('the unrecognised-tier default is swap, on both sides', () => {
  // LOAD-BEARING. An unknown tier must render RED, not silently count as approved. It is also
  // why a bought row with no tier never reaches this function — `bought` rides as its own
  // field and the bar stays a distribution of VERDICTS.
  for (const bogus of nonEmpty([undefined, null, '', 'kristy_approved_platinum', 'pending'], 'bogus tiers', 4)) {
    assert.equal(tierBucket(bogus), 'swap', `server default changed for ${JSON.stringify(bogus)}`);
    assert.equal(mirror(bogus), 'swap', `client default changed for ${JSON.stringify(bogus)}`);
  }
});

test('the three buckets are exactly approved / note / swap', () => {
  const seen = new Set(nonEmpty(CART_TIERS, 'CART_TIERS', 5).map(tierBucket));
  assert.deepEqual([...seen].sort(), ['approved', 'note', 'swap']);
});
