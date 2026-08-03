// The cart's section vocabulary exists in two files. This is what makes that safe.
//
// THE WHOLE POINT OF THE RECONCILIATION WAS KILLING A SECOND INDEX OF THE STORE. The cart
// used to carry ten display sections of its own, mapped from PICK categories by a client
// table plus a regex that sniffed item names — a vocabulary that predated the corpus, merged
// meat and seafood where the counter splits them, and could drift from the filing the
// knowledge actually uses. Replacing it with a mirror only helps if the mirror is enforced;
// otherwise it is the same defect with a nicer comment on it.
//
// So this reads BOTH files and fails on any drift in ids, titles, order, or the frozen rule.
// Same discipline pricing.test.js applies to the mobile pricing module, and for the same
// reason: a comment asserting two things agree is not an invariant, a test is.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { LIST_SECTIONS } from './listMatch.js';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT = join(__dirname, '..', '..', 'client', 'src', 'lib', 'listSections.js');
const src = readFileSync(CLIENT, 'utf8');

/** The client's LIST_SECTIONS, parsed out of the source as {id,title} pairs in order. */
function clientSections(text) {
  const block = text.match(/export const LIST_SECTIONS = \[([\s\S]*?)\];/);
  if (!block) return [];
  return [...block[1].matchAll(/\{\s*id:\s*'([^']+)'\s*,\s*title:\s*'([^']+)'\s*\}/g)].map((m) => ({
    id: m[1],
    title: m[2],
  }));
}

const mirror = nonEmpty(clientSections(src), 'client LIST_SECTIONS');

test('the client mirror parsed — this suite is not vacuously passing', () => {
  // Guarded at the collection above too, but stated here so the failure names the cause:
  // a refactor that renames the export or reformats the literal makes every assertion
  // below compare against an empty array and silently pass.
  assert.ok(mirror.length >= 5, `expected the client sections; parsed ${mirror.length}`);
});

test('ids, titles AND order are identical on both sides', () => {
  assert.deepEqual(
    mirror,
    LIST_SECTIONS.map((s) => ({ id: s.id, title: s.title })),
    'the cart walk order drifted from the server. One vocabulary, two files, no exceptions.'
  );
});

test('label_terms is a cart section on neither side', () => {
  // A reference section on the Counter, not an aisle. Nobody walks to it.
  assert.equal(LIST_SECTIONS.some((s) => s.id === 'label_terms'), false);
  assert.equal(mirror.some((s) => s.id === 'label_terms'), false);
});

test('the frozen location rule is the same regex on both sides', () => {
  const server = readFileSync(join(__dirname, 'listMatch.js'), 'utf8');
  const grab = (text) => text.match(/const FROZEN = (\/.+?\/[a-z]*);/)?.[1];
  const a = grab(server);
  const b = grab(src);
  assert.ok(a, 'the server frozen rule must be findable');
  assert.equal(b, a, 'frozen decides WHERE a row walks; two spellings would split the freezer');
});

test('the client orders and titles sections, and never decides which card a row gets', () => {
  // The line the mirror must not cross. Retrieval happens once, on the server, at attach
  // time — a client that scored anything would be the second matcher the whole design
  // forbids, and it would be invisible because it would usually agree.
  assert.equal(/scoreEntries|aliases|matchItemToCard/.test(src), false, 'no retrieval on the client');
  assert.match(src, /item\.cardSection/, 'it must read the section the server stamped');
});
