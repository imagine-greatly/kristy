// Generated cards — unit tests. NO network, NO model, NO database.
//
// Everything here runs on the DETERMINISTIC half of generation: the shaping, the slug, and
// the two gates that decide whether a card the model wrote is ever allowed to reach a
// shopper. The model call itself is not mocked, because a mock of it would only assert
// that a fake returns what the fake was told to return.
//
// The claim lock is the part that matters. Everywhere else in Kristy the lock is on the
// INPUT — entries stripped to a whitelist so the model can only rephrase what it was
// handed. A generated card has no entry behind it, so the whole guarantee moves to the
// output, and it has to hold against text nobody reviewed.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { toCard, slugFor, parseCardJSON } from './counterGenerate.js';
import { claimLockViolations, readableText } from './counterClaimLock.js';
import { lintCard } from './counterCardLint.js';

const base = {
  topic: 'Picking a ripe melon',
  eyebrow: 'Melon selection',
  section: 'produce',
  kind: 'shelf',
  headline: 'Nose and weight decide, not the rind colour.',
  do: 'Smell the stem end and press it lightly for give.',
  why: 'A ripe melon smells sweet where it left the vine.',
  look_for: ['Sweet smell at the stem end', 'Heavy for its size', 'Smooth stem scar'],
  watch_out: [],
  tier: 'time_tested',
  cta_item: null,
  aliases: ['how to pick a melon', 'ripe melon', 'melon ripeness'],
};
const card = (over = {}) => toCard({ ...base, ...over }, { slug: 'gen_test', querySeed: 'test' });
const codes = (v) => v.map((x) => x.code);

/* ═══════════════ Shaping ═══════════════ */

test('a card the model declines to write is not a card', () => {
  assert.equal(toCard({ insufficient: true }, { slug: 'x', querySeed: 'y' }), null);
});

test('an invalid section is dropped rather than invented', () => {
  assert.equal(card({ section: 'the meat aisle' }).section, null);
});

test('an invalid tier falls back to the most conservative one', () => {
  // Claiming "established" for a preference is the worst error available, so an
  // unrecognized tier lands on the standard rather than on settled science.
  assert.equal(card({ tier: 'obviously_true' }).tier, 'kristys_standard');
});

test('a generated card carries the tier rubric, like every curated one', () => {
  // Without it the reader sees a tier CHIP and never learns what that tier is worth — on
  // the one kind of card that has no authored entry standing behind it.
  const c = card();
  assert.ok(c.tier_note && c.tier_note.length > 20, 'tier_note should come from the KB rubric');
  assert.match(c.tier_note, /History is the evidence/);
});

test('a home card can never carry an add-to-cart', () => {
  // Suppressed structurally in the projection AND in the renderer. This is the third lock.
  assert.equal(card({ kind: 'home', cta_item: 'Eggs' }).cta_item, null);
});

test('fields the model invented do not ride along into the table', () => {
  const c = card({ sources: ['made up'], detail: 'invented', evil: true });
  assert.deepEqual(c.sources, []);
  assert.equal(c.detail, '');
  assert.equal(c.evil, undefined);
});

test('the slug is derived from the question, so the same one collapses instead of forking', () => {
  assert.equal(slugFor('how do i pick a good cantaloupe'), 'gen_how_do_i_pick_a_good_cantaloupe');
  assert.equal(slugFor('how do i pick a good cantaloupe'), slugFor('how do i pick a good cantaloupe'));
});

test('parseCardJSON survives a code fence and surrounding prose', () => {
  assert.equal(parseCardJSON('```json\n{"a":1}\n```').a, 1);
  assert.equal(parseCardJSON('Here you go: {"a":2} — hope that helps').a, 2);
  assert.equal(parseCardJSON('not json at all'), null);
});

/* ═══════════════ The claim lock ═══════════════ */

test('a clean card trips nothing', () => {
  assert.deepEqual(claimLockViolations(card()), []);
});

test('CLAIM LOCK: a treatment claim is caught, in either direction', () => {
  assert.ok(codes(claimLockViolations(card({ why: 'Bone broth heals the gut lining.' }))).includes('CLAIM_TREATMENT'));
  // Symmetric — the guardrail once forbade curing but not causing.
  assert.ok(codes(claimLockViolations(card({ why: 'Seed oils cause heart disease.' }))).includes('CLAIM_TREATMENT'));
  assert.ok(codes(claimLockViolations(card({ headline: 'Lowers your risk of diabetes.' }))).includes('CLAIM_TREATMENT'));
});

test('CLAIM LOCK: detox framing is caught', () => {
  assert.ok(codes(claimLockViolations(card({ why: 'It helps flush out toxins.' }))).includes('CLAIM_DETOX'));
});

test('CLAIM LOCK: a dose is caught', () => {
  assert.ok(codes(claimLockViolations(card({ look_for: ['Take 500 mg daily'] }))).includes('CLAIM_DOSING'));
});

test('CLAIM LOCK: restriction and fasting advice is caught', () => {
  assert.ok(codes(claimLockViolations(card({ why: 'Cut out dairy entirely.' }))).includes('CLAIM_RESTRICTION'));
});

test('CLAIM LOCK: safety reassurance about a real risk is caught', () => {
  // The worst thing this endpoint could emit — telling a pregnant shopper a raw food is
  // "perfectly safe". Kristy organizes raw answers around sourcing and never litigates
  // whether a documented risk is real.
  assert.ok(
    codes(claimLockViolations(card({ watch_out: ['Raw milk is perfectly safe from a good farm'] }))).includes(
      'CLAIM_SAFETY_REASSURANCE'
    )
  );
});

test('CLAIM LOCK: a price is caught', () => {
  assert.ok(codes(claimLockViolations(card({ do: 'Buy the one under $4 a pound.' }))).includes('CLAIM_PRICE'));
});

test('CLAIM LOCK: first person is caught', () => {
  assert.ok(codes(claimLockViolations(card({ why: "I'd reach for the ribeye." }))).includes('CLAIM_FIRST_PERSON'));
});

test('the lock reads every visible field, not just the headline', () => {
  const text = readableText(card({ watch_out: ['a trap'], look_for: ['a check'] }));
  assert.match(text, /a trap/);
  assert.match(text, /a check/);
  // Matching machinery is not prose and a shopper never reads it.
  assert.doesNotMatch(readableText(card()), /how to pick a melon/);
});

/* ═══════════════ Aliases ═══════════════ */

test('a generated card with no aliases FAILS lint', () => {
  // Aliases are the only way a generated card is ever retrieved again. Without them the
  // next shopper asking the identical question regenerates it: an unbounded spend loop and
  // a corpus that forks into near-duplicates of one answer.
  assert.ok(codes(lintCard(card({ aliases: [] }))).includes('ALIASES_MISSING'));
  assert.ok(codes(lintCard(card({ aliases: ['only one'] }))).includes('ALIASES_MISSING'));
  assert.ok(!codes(lintCard(card())).includes('ALIASES_MISSING'));
});

test('a CURATED card is not required to carry aliases', () => {
  // Curated cards are matched through the KB's own alias table, not the card row.
  const curated = { ...card(), source: 'curated', aliases: [] };
  assert.ok(!codes(lintCard(curated)).includes('ALIASES_MISSING'));
});

/* ═══════════════ The shape bar applies identically ═══════════════ */

test('a generated card clears the SAME lint the 80 curated cards clear', () => {
  assert.deepEqual(lintCard(card()), []);
});

test('a generated card that describes instead of instructing fails', () => {
  assert.ok(codes(lintCard(card({ do: 'Melons are generally better in summer.' }))).includes('DO_NOT_IMPERATIVE'));
});
