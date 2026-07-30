import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeQuestion, WEAK_MATCH_CEILING } from './counterGaps.js';
import { scoreEntries, matchEntries } from './perimeter.js';

/* ───────────────────────── The privacy line, structurally ─────────────────────────
   The gap log pools QUESTIONS so the KB can grow toward what shoppers actually ask.
   It must never pool PEOPLE. These are the tripwires for that, written the same way
   productStore's are: against the source, so the guarantee cannot be quietly undone
   by a later "just add the user id, it'd be useful". */

const SRC = readFileSync(new URL('./counterGaps.js', import.meta.url), 'utf8');

test('the gap log never references user identity', () => {
  assert.equal(/user_id/.test(SRC), false, 'counterGaps must never reference user_id');
  assert.equal(/\buserId\b/.test(SRC), false, 'counterGaps must never reference userId');
});

test('the gap log stores no request identity either', () => {
  // An IP or a session id is a person by another name. The insert below is the only
  // write path, and these are the fields that would betray the line.
  for (const forbidden of ['ip', 'session', 'device', 'fingerprint']) {
    assert.equal(
      new RegExp(`${forbidden}\\s*:`, 'i').test(SRC),
      false,
      `counterGaps must not store ${forbidden}`
    );
  }
});

/* ───────────────────────── Normalization is the scrub ───────────────────────── */

test('an email address never reaches the table', () => {
  const topic = normalizeQuestion('is wild salmon better email me at devon@example.com');
  assert.equal(topic.includes('@'), false);
  assert.equal(topic.includes('example'), false, 'the whole address is dropped, not just the @');
  assert.ok(topic.includes('wild salmon'), 'the actual question survives');
});

test('a long digit run never reaches the table', () => {
  const topic = normalizeQuestion('which cut for stew call me 5551234567');
  assert.equal(/\d{5,}/.test(topic), false);
  assert.ok(topic.includes('which cut for stew'));
});

test('short digit runs survive — they are the subject matter', () => {
  // "omega 3", "2 percent milk", "top 10 cuts" are topics, not identifiers.
  assert.ok(normalizeQuestion('is omega 3 worth it').includes('omega 3'));
  assert.ok(normalizeQuestion('whole or 2 percent milk').includes('2 percent'));
});

test('the topic is normalized so the same question groups with itself', () => {
  const a = normalizeQuestion('Which cut of LAMB for stew?');
  const b = normalizeQuestion('  which cut of lamb for stew  ');
  assert.equal(a, b, 'casing and punctuation must not fragment the ranking');
});

test('a pasted paragraph cannot ride in whole', () => {
  const topic = normalizeQuestion('lamb '.repeat(200));
  assert.ok(topic.length <= 160);
});

test('a fragment too short to be a gap is dropped', () => {
  assert.equal(normalizeQuestion('a'), '');
  assert.equal(normalizeQuestion('  ?  '), '');
  assert.equal(normalizeQuestion(''), '');
  assert.equal(normalizeQuestion(null), '');
});

/* ───────────────────────── The weak-match threshold is calibrated ───────────────────────── */

test('a genuinely strong match scores above the weak ceiling', () => {
  // The canonical counter question in the KB. If this ever logs as "weak", the
  // backlog fills with entries that are working fine.
  const scored = scoreEntries('is wild or farmed salmon better');
  assert.ok(scored.length > 0, 'the salmon question must match');
  assert.ok(
    scored[0].score > WEAK_MATCH_CEILING,
    `a strong match scored ${scored[0].score}, at or below the weak ceiling ${WEAK_MATCH_CEILING}`
  );
});

test('scoreEntries and matchEntries agree — the shape callers get is unchanged', () => {
  const q = 'is wild or farmed salmon better';
  const viaScore = scoreEntries(q).map((s) => s.entry.id);
  const viaMatch = matchEntries(q).map((e) => e.id);
  assert.deepEqual(viaMatch, viaScore, 'matchEntries must stay a pure projection of scoreEntries');
});

test('scores are ordered best-first', () => {
  const scored = scoreEntries('what does pasture raised mean on eggs');
  for (let i = 1; i < scored.length; i++) {
    assert.ok(scored[i - 1].score >= scored[i].score, 'scores must descend');
  }
});
