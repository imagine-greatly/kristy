// Deterministic tests for the verdict note composer — the parts that need NO
// network and NO model. The claim lock is enforced structurally by buildNoteInput /
// sanitizeFlagged, so we can PROVE it here without calling Haiku: an off-KB concern
// injected onto a matched entry never survives into the payload the model sees.
// (The real-model note quality is checked by scripts/verdict.livetest.js.)

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeFlagged,
  sanitizeAffirmed,
  buildNoteInput,
  parseNoteJSON,
  VERDICT_NOTE_SYSTEM,
} from './verdictNote.js';

// A matched KB entry, plus fields the model must NEVER see: `why`, `sources`, and a
// deliberately planted off-KB concern.
const POISONED_ENTRY = {
  id: 'carrageenan',
  name: 'Carrageenan',
  one_liner: 'A seaweed-derived thickener.',
  severity: 'high',
  evidence_tier: 'credible_concern',
  swap: 'Plant milks without carrageenan',
  why: 'long mechanistic detail that should not reach the model',
  sources: ['some citation'],
  kristy_note: 'internal note',
  INJECTED_OFF_KB_CONCERN: 'CAUSES_INSTANT_CANCER_9000', // planted attack string
};

test('sanitizeFlagged keeps ONLY the five allowed fields', () => {
  const [out] = sanitizeFlagged([POISONED_ENTRY]);
  assert.deepEqual(Object.keys(out).sort(), ['evidence_tier', 'name', 'one_liner', 'severity', 'swap']);
  assert.equal(out.name, 'Carrageenan');
  assert.equal(out.swap, 'Plant milks without carrageenan');
});

test('claim lock: an injected off-KB concern never reaches the payload', () => {
  const input = buildNoteInput({
    tier: 'swap_recommended',
    goal: 'cutting',
    nonNegotiables: ['no seed oils'],
    matched: [POISONED_ENTRY],
  });
  const serialized = JSON.stringify(input);
  // The exact planted string, plus the KB-only fields, are all absent.
  assert.ok(!serialized.includes('CAUSES_INSTANT_CANCER_9000'), 'off-KB concern stripped');
  assert.ok(!serialized.includes('should not reach the model'), '`why` stripped');
  assert.ok(!serialized.includes('some citation'), '`sources` stripped');
  assert.ok(!serialized.includes('internal note'), '`kristy_note` stripped');
  // …while the legitimate KB data survives.
  assert.ok(serialized.includes('Carrageenan'));
  assert.ok(serialized.includes('credible_concern'));
});

test('buildNoteInput carries goal, filtered non-negotiables, tier, flagged', () => {
  const input = buildNoteInput({
    tier: 'skip',
    goal: 'gut health',
    nonNegotiables: ['no artificial sweeteners', '', '  '],
    matched: [POISONED_ENTRY],
  });
  assert.equal(input.goal, 'gut health');
  assert.deepEqual(input.nonNegotiables, ['no artificial sweeteners']); // blanks dropped
  assert.equal(input.tier, 'skip');
  assert.equal(input.flagged.length, 1);
});

test('buildNoteInput carries filtered constraints (circumstances, not health)', () => {
  const input = buildNoteInput({
    tier: 'swap_recommended',
    goal: 'high-protein shopping',
    nonNegotiables: [],
    constraints: ['budget', '', '  ', 'short_on_time'],
    matched: [POISONED_ENTRY],
  });
  assert.deepEqual(input.constraints, ['budget', 'short_on_time']); // blanks dropped
});

test('buildNoteInput on an approved product has an empty flagged list', () => {
  const input = buildNoteInput({ tier: 'approved', goal: 'recomp', nonNegotiables: [], matched: [] });
  assert.deepEqual(input.flagged, []);
  assert.equal(input.goal, 'recomp');
});

test('empty goal falls back to a neutral label', () => {
  const input = buildNoteInput({ tier: 'approved', goal: '', nonNegotiables: [], matched: [] });
  assert.equal(input.goal, 'general');
});

// ── parseNoteJSON — tolerant of fences / prose, strict about the note ────────────
test('parseNoteJSON reads a bare object', () => {
  assert.deepEqual(parseNoteJSON('{"note":"Skip it.","swap":"Greek yogurt"}'), {
    note: 'Skip it.',
    swap: 'Greek yogurt',
  });
});

test('parseNoteJSON strips a ```json fence', () => {
  const out = parseNoteJSON('```json\n{"note":"Approved.","swap":null}\n```');
  assert.deepEqual(out, { note: 'Approved.', swap: null });
});

test('parseNoteJSON digs the object out of surrounding prose', () => {
  const out = parseNoteJSON('Sure! {"note":"Use with intention.","swap":null} hope that helps');
  assert.deepEqual(out, { note: 'Use with intention.', swap: null });
});

test('parseNoteJSON normalizes an empty-string swap to null', () => {
  assert.deepEqual(parseNoteJSON('{"note":"Fine.","swap":""}'), { note: 'Fine.', swap: null });
});

test('parseNoteJSON returns null on malformed JSON', () => {
  assert.equal(parseNoteJSON('not json at all'), null);
  assert.equal(parseNoteJSON('{"note":'), null);
});

test('parseNoteJSON returns null when the note is missing/empty (triggers retry)', () => {
  assert.equal(parseNoteJSON('{"swap":"something"}'), null);
  assert.equal(parseNoteJSON('{"note":"   ","swap":null}'), null);
});

// ── The system prompt is the claim-lock law — verbatim, never paraphrased ────────
test('the note system prompt carries the hard rules verbatim', () => {
  assert.ok(VERDICT_NOTE_SYSTEM.startsWith('You are Kristy, a nutrition and grocery coach.'));
  assert.ok(VERDICT_NOTE_SYSTEM.includes('You may NEVER introduce a health concern, cancer link'));
  assert.ok(VERDICT_NOTE_SYSTEM.includes('If it is not in the provided data, it does not'));
  assert.ok(VERDICT_NOTE_SYSTEM.includes('You are a coach, not a doctor.'));
  assert.ok(VERDICT_NOTE_SYSTEM.trim().endsWith('Return ONLY this JSON: {"note": "...", "swap": "..." or null}'));
});

test('the note prompt carries the constraints rule: shapes emphasis, never the tier, no price', () => {
  assert.ok(VERDICT_NOTE_SYSTEM.includes('CONSTRAINTS'));
  assert.ok(VERDICT_NOTE_SYSTEM.includes('shapes EMPHASIS and which swap you name — NEVER the verdict'));
  assert.ok(VERDICT_NOTE_SYSTEM.includes('BUDGET IS FOOD SELECTION, NOT PRICE'));
  assert.ok(VERDICT_NOTE_SYSTEM.includes('never claim to check what you'));
});

// ── The claim lock on the POSITIVE side ──────────────────────────────────────
// Affirmations get the same structural treatment as flags. A traditional food is
// exactly where an outcome claim is most tempting ("used as a remedy for…"), so
// the affirming entry's `why`, `kristy_note`, and `history` are all stripped
// before the model sees anything.
const POISONED_AFFIRMATION = {
  id: 'raw_honey',
  name: 'Raw Honey',
  one_liner: 'A whole food humans have eaten for as long as recorded history.',
  evidence_tier: 'time_tested',
  polarity: 'affirming',
  history: 'kept as a traditional remedy across ancient cultures',
  why: 'long detail that should not reach the model',
  kristy_note: 'internal honey note',
  INJECTED_OFF_KB_CLAIM: 'CURES_SEASONAL_ALLERGIES_9000', // planted attack string
};

test('sanitizeAffirmed keeps ONLY the three allowed fields', () => {
  const [out] = sanitizeAffirmed([POISONED_AFFIRMATION]);
  assert.deepEqual(Object.keys(out).sort(), ['evidence_tier', 'name', 'one_liner']);
  // No severity and no swap leak in — an affirmation has neither, and a severity
  // would be the thing that lets it into concern scoring.
  assert.equal(out.severity, undefined);
  assert.equal(out.swap, undefined);
});

test('claim lock: an injected cure claim never reaches the payload', () => {
  const input = buildNoteInput({
    tier: 'approved',
    goal: 'eat cleaner',
    nonNegotiables: [],
    matched: [],
    affirmed: [POISONED_AFFIRMATION],
  });
  const serialized = JSON.stringify(input);
  assert.ok(!serialized.includes('CURES_SEASONAL_ALLERGIES_9000'), 'off-KB cure claim stripped');
  assert.ok(!serialized.includes('should not reach the model'), '`why` stripped');
  assert.ok(!serialized.includes('internal honey note'), '`kristy_note` stripped');
  assert.ok(!serialized.includes('traditional remedy'), '`history` withheld — the outcome-claim tripwire');
  // …while the legitimate affirmation survives.
  assert.ok(serialized.includes('Raw Honey'));
  assert.ok(serialized.includes('time_tested'));
});

test('the note prompt carries the tradition rule and the no-outcome-either-direction rule', () => {
  // Tradition justifies food-worth only.
  assert.match(VERDICT_NOTE_SYSTEM, /TRADITION MAY NEVER JUSTIFY/);
  assert.match(VERDICT_NOTE_SYSTEM, /NO HEALTH-OUTCOME CLAIM IN EITHER DIRECTION/);
  // No conspiracy framing, ever.
  assert.match(VERDICT_NOTE_SYSTEM, /NEVER invoke conspiracy/);
  // The saturated-fat line is present AND tier-marked as her read, not a finding.
  assert.match(VERDICT_NOTE_SYSTEM, /saturated-fat panic hasn't held up the way it was sold/);
  assert.match(VERDICT_NOTE_SYSTEM, /contested literature, not settled fact/);
});
