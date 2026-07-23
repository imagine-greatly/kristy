// Perimeter — unit tests. NO network, NO model. Proves the claim lock (the model only
// ever sees the seven allowed fields), the deterministic matcher, the honest no-answer,
// the balanced raw-milk treatment, and that the prompt carries the hard rules verbatim.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  perimeterKb,
  matchEntries,
  sanitizeForModel,
  buildAnswerInput,
  publicEntry,
  parseAnswerJSON,
  PERIMETER_ANSWER_SYSTEM,
  NO_ANSWER,
} from './perimeter.js';

const ALLOWED = ['title', 'short_answer', 'detail', 'evidence_tier', 'buying_tips', 'labels_decoded', 'kristy_take'];

// A KB entry with fields the model must NEVER see — the same shape as an upstream
// injection. sources / aliases / question / id / category and a planted `secret_fact`.
const POISONED = {
  id: 'poison',
  title: 'Test topic',
  aliases: ['UNIQUE_ALIAS_TOKEN'],
  category: 'seafood',
  question: 'INJECTED QUESTION with a fake stat',
  short_answer: 'A clean short answer.',
  detail: 'A clean detail.',
  evidence_tier: 'established',
  sources: ['INJECTED_SOURCE claiming salmon cures cancer'],
  kristy_take: 'A clean take.',
  buying_tips: ['A tip.'],
  labels_decoded: [{ term: 'X', meaning: 'Y' }],
  secret_fact: 'salmon cures cancer',
};

test('sanitizeForModel keeps ONLY the seven allowed fields', () => {
  assert.deepEqual(Object.keys(sanitizeForModel(POISONED)).sort(), [...ALLOWED].sort());
});

test('claim lock: an injected fact in a non-allowed field never reaches the payload', () => {
  const input = buildAnswerInput({
    question: 'is this fish good?',
    goal: 'high-protein shopping',
    focuses: [],
    hardLines: [],
    constraints: ['budget'],
    entries: [POISONED],
  });
  const blob = JSON.stringify(input);
  assert.ok(!blob.includes('secret_fact'));
  assert.ok(!blob.includes('cures cancer')); // planted in sources + secret_fact
  assert.ok(!blob.includes('INJECTED_SOURCE'));
  assert.ok(!blob.includes('INJECTED QUESTION')); // the entry's own question field is dropped
  assert.ok(!blob.includes('UNIQUE_ALIAS_TOKEN')); // aliases are dropped
  // The clean, allowed content DID make it through.
  assert.ok(blob.includes('A clean short answer.'));
});

test('buildAnswerInput carries the question + the shopper prefs (filtered)', () => {
  const input = buildAnswerInput({
    question: '  wild or farmed?  ',
    goal: 'eating cleaner',
    focuses: ['heart', '', '  '],
    hardLines: ['no seed oils'],
    constraints: ['budget', ''],
    entries: [],
  });
  assert.equal(input.question, 'wild or farmed?');
  assert.equal(input.shopper.goal, 'eating cleaner');
  assert.deepEqual(input.shopper.focuses, ['heart']); // blanks dropped
  assert.deepEqual(input.shopper.constraints, ['budget']);
  assert.deepEqual(input.entries, []);
});

test('the matcher finds the right topic for a real question', () => {
  const m = matchEntries('is wild or farmed salmon better?');
  assert.ok(m.length >= 1);
  assert.equal(m[0].id, 'salmon_wild_vs_farmed');
});

test('the matcher returns nothing for an off-topic question (→ honest no-answer)', () => {
  assert.equal(matchEntries('what time does the store close?').length, 0);
  assert.equal(matchEntries('how do I fix my car?').length, 0);
});

test('raw milk is present, balanced (risk AND why people choose it), and makes no cure claim', () => {
  const raw = perimeterKb.entries.find((e) => e.id === 'raw_milk');
  assert.ok(raw, 'raw_milk entry exists');
  const text = `${raw.short_answer} ${raw.detail} ${raw.kristy_take}`.toLowerCase();
  // Respects the choice…
  assert.ok(/tradition|taste|closer to its source|fair reason/.test(text));
  // …states the risk plainly (established), naming vulnerable groups…
  assert.ok(/listeria|salmonella|e\. coli|campylobacter|risk/.test(text));
  assert.ok(/children|pregnan|immune/.test(text));
  // …and makes NO treatment/cure/advocacy claim.
  assert.ok(!/cures?|treats?|heals?|prevents?|reverses?/.test(text));
  assert.equal(raw.evidence_tier, 'established');
});

test('publicEntry exposes sources for display (the free layer is a verbatim KB read)', () => {
  const raw = perimeterKb.entries.find((e) => e.id === 'raw_milk');
  const pub = publicEntry(raw);
  assert.ok(Array.isArray(pub.sources) && pub.sources.length > 0);
  assert.ok(pub.evidence_framing && pub.evidence_framing.length > 0);
});

test('the perimeter prompt carries the claim-lock hard rules verbatim', () => {
  assert.ok(PERIMETER_ANSWER_SYSTEM.includes('You are Kristy, a nutrition and grocery coach.'));
  assert.ok(PERIMETER_ANSWER_SYSTEM.includes('Use ONLY the facts in the provided entries'));
  assert.ok(PERIMETER_ANSWER_SYSTEM.includes('introduce a fact, statistic, health claim'));
  assert.ok(PERIMETER_ANSWER_SYSTEM.includes('You are a coach, not a doctor.'));
  assert.ok(PERIMETER_ANSWER_SYSTEM.includes('NO PRICE.'));
  assert.ok(PERIMETER_ANSWER_SYSTEM.trim().endsWith('Return ONLY this JSON: {"answer": "...", "refinement": "..." or null}'));
});

test('parseAnswerJSON reads { answer, refinement } and normalizes an empty refinement', () => {
  assert.deepEqual(parseAnswerJSON('{"answer":"Wild if you can.","refinement":"Wild-caught salmon"}'), {
    answer: 'Wild if you can.',
    refinement: 'Wild-caught salmon',
  });
  assert.deepEqual(parseAnswerJSON('```json\n{"answer":"Fine.","refinement":""}\n```'), {
    answer: 'Fine.',
    refinement: null,
  });
  assert.equal(parseAnswerJSON('{"refinement":"x"}'), null); // no answer → retry
});

test('the no-answer line is a real, honest sentence', () => {
  assert.ok(typeof NO_ANSWER === 'string' && NO_ANSWER.length > 20);
});
