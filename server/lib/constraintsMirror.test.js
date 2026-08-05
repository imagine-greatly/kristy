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

import {
  CONSTRAINTS, CONSTRAINT_VALUES, labelForConstraint,
  GOALS, FOCUSES, HARD_LINES, labelForGoal, labelForFocus, labelForHardLine,
} from './taxonomy.js';
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

/* ═══════════ THE OTHER THREE DIMENSIONS, SAME TREATMENT ═══════════
   Constraints were pinned first because they were the ones being widened. Goals, focuses and
   hard lines carry the same "keep them in sync" comment and had the same nothing enforcing it.

   THIS COMES BEFORE THE COPY MOVES, NOT AFTER. `coachGoals.js` is the client's source for the
   onboarding chips and it must render on first paint with no fetch, so the mirror is genuinely
   unavoidable and the copy move (blurbs and payoff lines behind GET /api/preferences/taxonomy)
   is only safe once drift is caught. Test, then move. */

/* THE THREE TABLES DO NOT HAVE THE SAME SHAPE, and pretending they do is how a mirror test
   reports drift that is really a parser artifact. `FOCUSES` and `NON_NEGOTIABLES` are one-line
   `{ value, label }` rows; `COACH_GOALS` is a multi-line object with NO `label` field at all —
   it carries `chipLabel`, `title`, `noteLabel`, `readLabel`, `blurb`, `payoff`, because a goal
   is spoken about in four different registers. So the label field is named per table.
   (Caught by debugging a 0-row parse rather than filing it as drift — twice already this
   session a diff tool's own reading has looked like a defect in the data.) */
const clientList = (name, labelField = 'label') => {
  const block = src.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  if (!block) return [];
  return [...block[1].matchAll(new RegExp(`value:\\s*'([^']+)'[\\s\\S]{0,200}?${labelField}:\\s*'([^']*)'`, 'g'))].map((m) => ({
    value: m[1],
    label: m[2],
  }));
};

/* THE ENUM IS LOAD-BEARING. THE WORDING IS A REGISTER, AND REGISTERS DIFFER ON PURPOSE.
   A first draft of these three compared labels too, and all three "failed" — which on
   inspection is the tier→prose finding again rather than drift:

     goal `family`              chip "Family"              server "Feeding a family"
     focus `additive_sensitive` chip "Additive-sensitive"   server "Additive-sensitive (dyes & preservatives)"
     hard line `no seed oils`   chip "No seed oils"         server "no seed oils"

   The server label is what the MODEL is shown (`buildComposeInput` maps goals through
   `labelForGoal`); the client's is what fits a 44pt chip. The hard-line case is starker still:
   the server's "label" is the matching PHRASE the engine keys on, so it is deliberately
   lowercase and identical to the id. Asserting equality would force one register onto three
   positions — exactly the mistake the duplication survey rejected for tier→prose.

   So these assert IDS AND ORDER, which is the invariant that actually bites: an id the UI
   offers that the engine does not know is a rule a shopper sets and nothing enforces. The
   three wording differences are recorded in DUPLICATION-SURVEY.md as open questions for a
   human, not silently normalised by a test. */

test('client COACH_GOALS mirrors the server GOALS on ids and order', () => {
  const mine = nonEmpty(clientList('COACH_GOALS', 'chipLabel'), 'client COACH_GOALS', 8);
  assert.deepEqual(mine.map((g) => g.value), GOALS.map((g) => g.value), 'goal ids/order drifted');
  for (const g of mine) assert.ok(g.label.trim(), `goal ${g.value} has an empty chipLabel`);
});

test('client FOCUSES mirrors the server FOCUSES on ids and order', () => {
  const mine = nonEmpty(clientList('FOCUSES'), 'client FOCUSES', 6);
  assert.deepEqual(mine.map((f) => f.value), FOCUSES.map((f) => f.value), 'focus ids/order drifted');
  for (const f of mine) assert.ok(labelForFocus(f.value), `focus ${f.value} has no server label at all`);
});

test('client NON_NEGOTIABLES offers no hard line the engine cannot match', () => {
  // The load-bearing direction. A hard-line id is the phrase hardLines.js keys on, so an id
  // the client invents is a rule the shopper sets and the engine silently ignores — which is
  // worse than not offering it, because it reads as enforced.
  const mine = nonEmpty(clientList('NON_NEGOTIABLES'), 'client NON_NEGOTIABLES', 4);
  const serverValues = new Set(HARD_LINES.map((h) => h.value));
  for (const h of mine) {
    assert.ok(serverValues.has(h.value), `client offers hard line "${h.value}" the engine does not know`);
    assert.ok(labelForHardLine(h.value), `hard line ${h.value} resolves to no server rule`);
  }
});

test('every dimension the taxonomy endpoint serves has a client mirror that was parsed', () => {
  // Guards the four parses together: if any regex stops matching, the assertions above go
  // vacuous individually and this one names which.
  const sizes = {
    COACH_GOALS: clientList('COACH_GOALS', 'chipLabel').length,
    FOCUSES: clientList('FOCUSES').length,
    NON_NEGOTIABLES: clientList('NON_NEGOTIABLES').length,
    CONSTRAINTS: mirror.length,
  };
  for (const [name, n] of Object.entries(sizes)) {
    assert.ok(n >= 4, `${name} parsed only ${n} rows — the extractor has drifted, not the data`);
  }
});
