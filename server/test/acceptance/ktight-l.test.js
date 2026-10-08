// KTIGHT L1: lintPickSteps, one red case per code, the berries worked example green.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintPickSteps, lintPick, readability, MAX_STEP_WORDS, MAX_SCIENCE_WORDS } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

const berries = kb.entries.find((e) => e.id === 'berries_picking');
assert.ok(berries, 'berries_picking exists');

// The spec's worked example, verbatim.
const STEPS = [
  'Take a cold carton with no fog inside the plastic.',
  'Flip it: dry, unstained bottom, no fuzzy spot on any berry.',
  'Buy them ready: deep, even color and no sweet, fermented smell.',
];
const SCIENCE = 'Berries do not ripen after picking, so what is in the carton is what you are buying. The bottom layer carries the weight, condensation keeps it damp, and mold spreads berry to berry by contact. Re-stacked clamshells can hide older fruit under a fresh top layer, so the underside is the check.';
const card = (over = {}) => ({ ...structuredClone(berries), pick_steps: [...STEPS], science: SCIENCE, ...over });
const codes = (e) => lintPickSteps(e).map((f) => f.code);
const step = (s) => card({ pick_steps: [s, ...STEPS.slice(1)] });
const sci = (s) => card({ science: s });

test('caps', () => {
  assert.equal(MAX_STEP_WORDS, 14);
  assert.equal(MAX_SCIENCE_WORDS, 70);
});

const RED = {
  STEPS_SHAPE: card({ pick_steps: [] }),
  STEPS_EMPTY: step('   '),
  STEPS_TOO_LONG: step('Take a cold carton with no fog anywhere inside the clear plastic lid or sides.'),
  STEPS_NOT_CLOSED: step('Is the carton cold?'),
  STEPS_COPIES_DO: step('Flip the container and check for juice stains or fuzz.'),
  SCIENCE_SHAPE: sci(''),
  SCIENCE_NOT_PARAGRAPH: sci('- Berries do not ripen after picking.'),
  SCIENCE_TOO_LONG: sci(Array(8).fill('Berries do not ripen after picking, so the carton is the berry.').join(' ')),
  KT_FIRST_PERSON: step('Ask us for a cold carton.'),
  KT_EM_DASH: step('Take a cold carton — no fog inside.'),
  KT_NEW_NUMBER: step('Pick from 7777 cold cartons.'),
  KT_REDIRECT: sci('Berries do not ripen after picking, so save the money for better fruit.'),
  KT_CLAIM_DETOX: sci('Berries do not ripen after picking, and they flush out toxins.'),
  COPY_BRITISH: step('Buy deep, even colour.'),
  COPY_STRAIGHT_QUOTE: step('Pick the "dry" carton.'),
};
nonEmpty(Object.keys(RED), 'KTIGHT red fixtures', 15);
for (const [code, fixture] of Object.entries(RED)) {
  test(`${code} fires, alone`, () => assert.deepEqual(codes(fixture), [code]));
}

test('C15: the berries worked example passes lint and readability', () => {
  assert.deepEqual(lintPickSteps(card()), []);
  const read = readability(card()).filter((f) => f.field === 'pick_steps' || f.field === 'science');
  assert.deepEqual(read, []);
});

test('readability reads the new fields (a long science sentence is found)', () => {
  const long = sci('Berries do not ripen after picking so what sits in the carton on the shelf today is exactly the berry that goes home with you.');
  assert.ok(readability(long).some((f) => f.field === 'science' && f.code === 'READ_SENTENCE_LONG'));
});

test('C16: a pick carrying pick_steps or science fails lintPick', () => {
  const pick = kb.entries.find((e) => e.kind === 'pick');
  assert.ok(pick, 'a pick exists');
  assert.ok(!lintPick(pick).some((f) => f.code === 'PICK_FIELD_FORBIDDEN'));
  for (const f of ['pick_steps', 'science']) {
    const bad = { ...structuredClone(pick), [f]: f === 'science' ? SCIENCE : STEPS };
    assert.ok(lintPick(bad).some((x) => x.code === 'PICK_FIELD_FORBIDDEN' && x.detail.includes(f)), f);
  }
});

test('C17: neither field present → []', () => {
  const bare = structuredClone(berries);
  delete bare.pick_steps;
  delete bare.science;
  assert.deepEqual(lintPickSteps(bare), []);
});
