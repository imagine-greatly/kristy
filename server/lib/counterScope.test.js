// The scope gate — unit tests. NO network, NO model.
//
// This gate runs before anything is spent, so it is the cheapest place to be wrong and the
// most expensive place to be wrong in the WRONG DIRECTION. Two failure modes, and they are
// not symmetric: letting a medical question through is a safety failure, and rejecting a
// grocery question is the acquisition surface refusing the thing someone came to try.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inScope, outOfScopeLine, contentWords } from './counterScope.js';

const ok = (q) => assert.equal(inScope(q).ok, true, `should be IN scope: ${q}`);
const no = (q, reason) => {
  const r = inScope(q);
  assert.equal(r.ok, false, `should be OUT of scope: ${q}`);
  if (reason) assert.equal(r.reason, reason, `${q} → expected ${reason}, got ${r.reason}`);
};

/* ═══════════════ In scope ═══════════════ */

test('a food named in the vocabulary is in scope', () => {
  ok('wild or farmed salmon');
  ok('which cut of beef for stew');
  ok('is A2 milk worth it');
});

test('A FOOD THE VOCABULARY HAS NEVER HEARD OF is still in scope', () => {
  // The regression that matters most in this file. The first version required a known food
  // noun and rejected this with "name the food" — while the shopper was naming the food.
  // The list had "melon" and not "cantaloupe", and no list can ever have everything.
  ok('how do I pick a good cantaloupe');
  ok('how do I pick good kohlrabi');
  ok('is guanciale worth buying');
  ok('what should I look for in rambutan');
});

test('storing and preparing count, not just buying', () => {
  ok('how do I store fresh basil');
  ok('should I wash blueberries before storing them');
});

/* ═══════════════ Out of scope — the hard deny ═══════════════ */

test('a named condition is refused even when a food is named', () => {
  // A food word must never rescue a medical question.
  no('will raw milk cure my Crohns', 'medical_condition');
  no('is dairy bad for my arthritis', 'medical_condition');
  no('what should I eat for high cholesterol', 'medical_condition');
});

test('treatment framing is refused', () => {
  no('does celery juice detox the liver', 'treatment');
  // Refused as medical_condition, because "cancer" is caught by the condition rule first.
  // WHICH rule fires does not matter and the test does not pin it — that it is refused does.
  no('what foods prevent cancer');
});

test('dosing and supplements are refused', () => {
  no('how much magnesium should i take', 'dosing');
});

test('diet plans and weight targets are refused', () => {
  no('what is my calorie target', 'diet_plan');
  no('how do I lose 20 pounds', 'weight_target');
});

/* ═══════════════ Out of scope — nothing to answer ═══════════════ */

test('an act with no concrete noun is not a question this endpoint can see', () => {
  no('what should I get', 'no_subject');
  no('which one is better', 'no_subject');
});

test('a question about something other than food is refused', () => {
  no('what is the capital of France', 'off_topic');
  // Refused as no_subject rather than off_topic: "store" IS a grocery act ("how do I store
  // basil"), so what this question lacks is a subject, not a topic. Either way it does not
  // reach a model.
  no('when does the store close');
  no('what time do you open');
});

/* ═══════════════ What she says ═══════════════ */

test('every refusal has a line, and it never explains the rule', () => {
  for (const q of [
    'will raw milk cure my Crohns',
    'how much magnesium should i take',
    'what is my calorie target',
    'what should I get',
    'what is the capital of France',
  ]) {
    const line = outOfScopeLine(inScope(q).reason);
    assert.ok(line && line.length > 10, `no line for ${q}`);
    assert.doesNotMatch(line, /\b(scope|regex|rule|denied|blocked|filter)\b/i, `${q}: the line explains the gate`);
    // VOICE_SPEC: no first person, anywhere.
    assert.doesNotMatch(line, /\b(I|I'?m|my|me)\b/, `${q}: first person in "${line}"`);
  }
});

test('a medical refusal points at a doctor rather than just saying no', () => {
  assert.match(outOfScopeLine('medical_condition'), /doctor/i);
  assert.match(outOfScopeLine('dosing'), /doctor/i);
});

/* ═══════════════ The helper ═══════════════ */

test('contentWords keeps the subject and drops the scaffolding', () => {
  assert.deepEqual(contentWords('how do I pick a good cantaloupe'), ['cantaloupe']);
  assert.deepEqual(contentWords('what should I get'), []);
  assert.deepEqual(contentWords('which one is better'), []);
});
