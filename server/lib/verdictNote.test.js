// Deterministic tests for the verdict note composer — the parts that need NO
// network and NO model. The claim lock is enforced structurally by buildNoteInput /
// sanitizeFlagged, so we can PROVE it here without calling Haiku: an off-KB concern
// injected onto a matched entry never survives into the payload the model sees.
// (The real-model note quality is checked by scripts/verdict.livetest.js.)

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sanitizeFlagged,
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
