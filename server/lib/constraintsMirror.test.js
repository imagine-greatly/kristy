// The constraint vocabulary exists in two files, and until now only a comment said so.
//
// `client/src/lib/coachGoals.js` carried "Values mirror server/lib/taxonomy.js CONSTRAINTS;
// keep them in sync" — which is a comment asserting an invariant, the shape this repo keeps
// finding to be false. It was true when written. It stopped being enforceable the moment
// anyone widened the enum, which is exactly what adding `one_pan` / `no_oven` does.
//
// Same treatment as listSectionsMirror.test.js and pricing.test.js, for the same reason:
// two files that must agree either have a test or they have a hope.
//
// It also pins the SPLIT those two values exist to make. Time and equipment were one bit —
// `short_on_time`'s blurb read "Little or no cooking", an equipment statement standing in
// for a time one — and the compose prompt answered both with "no-prep". A shopper with a hob
// and one pan was told to buy rotisserie chicken. If a future edit collapses them again the
// enum will still look right, so the collapse is what gets asserted, not just the ids.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { CONSTRAINTS, CONSTRAINT_VALUES, labelForConstraint } from './taxonomy.js';
import { LIST_COMPOSE_SYSTEM } from './listCompose.js';
import { PREFERENCE_MAP_SYSTEM } from './preferenceMap.js';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLIENT = join(__dirname, '..', '..', 'client', 'src', 'lib', 'coachGoals.js');
const src = readFileSync(CLIENT, 'utf8');

/** The client's CONSTRAINTS, parsed out of the source as {value,label} in order. */
function clientConstraints(text) {
  const block = text.match(/export const CONSTRAINTS = \[([\s\S]*?)\n\];/);
  if (!block) return [];
  return [...block[1].matchAll(/\{\s*value:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'/g)].map((m) => ({
    value: m[1],
    label: m[2],
  }));
}

// Bound at the collection: a parse that silently returns nothing would make every
// assertion below vacuous, which is the defect this whole family is about.
const mirror = nonEmpty(clientConstraints(src), 'client CONSTRAINTS', 5);

test('the client mirror parsed — this suite is not vacuously passing', () => {
  assert.ok(mirror.length >= 5, `parsed only ${mirror.length} client constraints; the regex has drifted`);
});

test('ids, labels and ORDER match the server taxonomy exactly', () => {
  // Order matters: it is the order the chips render in, and the equipment values sit
  // together between no_kitchen and cooking_for_one on purpose.
  assert.deepEqual(
    mirror.map((c) => c.value),
    CONSTRAINTS.map((c) => c.value),
    'client constraint ids/order drifted from server/lib/taxonomy.js'
  );
  for (const c of nonEmpty(mirror, 'mirror rows', 5)) {
    assert.equal(c.label, labelForConstraint(c.value), `label drift on ${c.value}`);
  }
});

test('every client chip carries a blurb, or the picker renders a bare id', () => {
  const block = src.match(/export const CONSTRAINTS = \[([\s\S]*?)\n\];/)[1];
  for (const c of nonEmpty(mirror, 'mirror rows', 5)) {
    const row = block.split('\n').find((l) => l.includes(`'${c.value}'`));
    assert.match(row || '', /blurb:/, `${c.value} has no blurb`);
  }
});

/* ═══════════ TIME AND EQUIPMENT MUST STAY DIFFERENT CONSTRAINTS ═══════════ */

test('the equipment facts exist, and there is no "full kitchen" value', () => {
  for (const v of ['one_pan', 'no_oven', 'no_kitchen']) {
    assert.ok(CONSTRAINT_VALUES.includes(v), `${v} missing from the taxonomy`);
  }
  // A constraints row holds things that CONSTRAIN. A full kitchen is the absence of one,
  // and a chip meaning "nothing applies" is furniture — same argument as the tier chip.
  assert.ok(
    !CONSTRAINT_VALUES.some((v) => /full_kitchen|has_kitchen/.test(v)),
    'a "full kitchen" value would be a chip that says nothing applies'
  );
});

test('the compose prompt answers time and equipment SEPARATELY', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /TIME AND EQUIPMENT ARE DIFFERENT/i);
  // The collapse that shipped: "short on time or no kitchen → no-prep", one instruction for
  // two unrelated facts.
  assert.ok(
    !/short on time or no kitchen/i.test(LIST_COMPOSE_SYSTEM),
    'time and equipment are collapsed into one instruction again'
  );
  assert.match(LIST_COMPOSE_SYSTEM, /one pan/i, 'the prompt must say what one pan means for a list');
  assert.match(LIST_COMPOSE_SYSTEM, /no oven/i);
});

test('every constraint the taxonomy offers is named in the compose prompt', () => {
  // A value the prompt never mentions is a fact captured and ignored — the failure mode
  // headcount was deferred to avoid.
  const prompt = LIST_COMPOSE_SYSTEM.toLowerCase();
  for (const c of nonEmpty(CONSTRAINTS, 'CONSTRAINTS', 5)) {
    const spoken = c.label.toLowerCase().replace(/^shopping on a /, '').replace(/^no real /, 'no real ');
    const key = c.value.replace(/_/g, ' ');
    assert.ok(
      prompt.includes(key) || prompt.includes(spoken),
      `the compose prompt never mentions ${c.value} — it would be captured and ignored`
    );
  }
});

test('the free-text mapper can reach the equipment values, and never via time', () => {
  assert.match(PREFERENCE_MAP_SYSTEM, /one pan/i);
  assert.match(PREFERENCE_MAP_SYSTEM, /no oven/i);
  assert.match(PREFERENCE_MAP_SYSTEM, /never map an equipment phrase to short_on_time/i);
});
