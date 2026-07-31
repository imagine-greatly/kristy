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

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
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
  tier_note: 'Melons have been judged by nose and weight for as long as they have been sold.',
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

test('the tier note is AUTHORED, never filled from the rubric', () => {
  // The corpus-wide defect: 75 of 80 curated cards fell back to the tier's definition, so
  // a card about picking a melon rendered "Strong scientific consensus, major health
  // organization classification…". The rubric guides the CHOICE of tier and belongs only
  // in the prompt.
  const c = card();
  assert.equal(c.tier_note, base.tier_note, 'the model’s own sentence must survive');
  assert.equal(card({ tier_note: '' }).tier_note, null, 'no silent fallback to the rubric');
});

test('a tier note that quotes the rubric FAILS lint', () => {
  const rubric = perimeterKb.evidence_tiers.established;
  assert.ok(codes(lintCard(card({ tier: 'established', tier_note: rubric }))).includes('TIER_NOTE_IS_RUBRIC'));
  // And a paraphrase that keeps the rubric's spine is caught by the shared-run check.
  assert.ok(
    codes(lintCard(card({ tier: 'established', tier_note: 'Settled enough to act on without debate here.' })))
      .includes('TIER_NOTE_IS_RUBRIC')
  );
});

test('a missing tier note FAILS lint — the chip would have nothing behind it', () => {
  assert.ok(codes(lintCard(card({ tier_note: '' }))).includes('TIER_NOTE_MISSING'));
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

test('the slug comes from the TOPIC, not the shopper’s phrasing', () => {
  // A question-derived slug carried the wording into an identifier —
  // "gen_what_s_the_best_cut_of_steak_for_grilling" — so two phrasings of one question
  // became two rows answering the same thing.
  assert.equal(slugFor('Best steak cut for grilling'), 'gen_best_steak_cut_for_grilling');
  const derived = toCard({ ...base, topic: 'Best steak cut for grilling' }, { slug: null, querySeed: 'x' });
  assert.equal(derived.slug, 'gen_best_steak_cut_for_grilling');
});

test('an apostrophe is normalized away, not split on', () => {
  // Deleting the character mid-word turned "what's" into "what_s". Curly and straight both.
  assert.equal(slugFor("What's in season"), 'gen_whats_in_season');
  assert.equal(slugFor('What’s in season'), 'gen_whats_in_season');
});

test('the eyebrow IS the topic — one rule, enforced', () => {
  // It was drifting: identical to topic on two generated cards, a separate shorter phrase
  // on the third. A label that sometimes restates and sometimes abbreviates cannot be learned.
  const c = card({ topic: 'A2 milk claims' });
  assert.equal(c.eyebrow, 'A2 milk claims');
  assert.equal(toCard({ ...base, topic: 'A2 milk claims', eyebrow: 'Something else' }, { slug: null, querySeed: 'x' }).eyebrow, 'A2 milk claims');
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

/* ═══════════════ The model failing is not the request failing ═══════════════ */

test('an API error degrades to a discarded generation, never a 500', async () => {
  // Rate limits, timeouts and an exhausted credit balance all arrive as a thrown API
  // error. An uncaught one would 500 a shopper standing in an aisle; the counter already
  // knows how to have nothing to say, and this routes into that path.
  const { generateCard } = await import('./counterGenerate.js');
  const original = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'sk-ant-invalid-key-for-this-test';
  try {
    const out = await generateCard({ query: 'how do I pick a good cantaloupe', querySeed: 'x', entries: [] });
    assert.equal(out.card, null);
    assert.equal(out.reason, 'model_error');
    assert.equal(out.attempts[0].violations[0].code, 'MODEL_ERROR');
  } finally {
    if (original === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = original;
  }
});

/* ═══════════════ Fail closed when the corpus cannot be read ═══════════════ */

test('an unreadable generated corpus stops generation instead of spending on it', async () => {
  // counter_cards shipped without the `aliases` column. Every generated card failed to
  // persist and every read of them failed too, so the same question regenerated on every
  // ask — and the global ceiling counts PERSISTED rows, so it never engaged to stop it.
  // If the corpus cannot be read, this question cannot be deduped and a card written now
  // probably cannot be stored: degrade to curated-only rather than pay for nothing.
  const { answerCounterQuestion } = await import('./counterAskPipeline.js');
  const brokenClient = {
    from: () => ({
      select: () => ({
        eq: () => ({ order: () => ({ limit: async () => ({ data: null, error: { message: 'no aliases column' } }) }) }),
      }),
    }),
  };
  const out = await answerCounterQuestion({
    query: 'how do I pick a good cantaloupe',
    ip: '203.0.113.9',
    client: brokenClient,
  });
  assert.equal(out.reason, 'corpus_unavailable');
  assert.equal(out.matched, false, 'no generated card should be produced');
});
