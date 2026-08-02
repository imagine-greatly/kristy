// The counter, ASKED — unit tests. NO network, NO model.
//
// The Counter is the moat, and a moat you can only browse is a reference book. These
// pin the ask path: a plain-words counter question reaches the sourced entry, and a
// counter question the KB cannot answer gets the HONEST MISS rather than an
// improvisation. The second half is the one that matters — an unsourced answer about
// the unlabeled half of the store is exactly the failure the claim lock exists to
// prevent, and until now it was the default whenever the matcher came up empty.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { looksLikePerimeterQuestion, looksLikeCounterQuestion } from './chatRouting.js';
import { matchEntries, publicEntry, NO_ANSWER } from './perimeter.js';

/* ── What the composer answers from the counter ────────────────────────────────── */

test('a plain-words counter question reaches its sourced entry', () => {
  // The four the surface itself seeds with, typed as a person would type them.
  const wants = [
    ['wild or farmed salmon', 'salmon_wild_vs_farmed'],
    ['which cut for stew', 'beef_cuts_basics'],
    ['what does pasture-raised leave out', 'label_pasture_raised_feed'],
    ['is organic worth it for berries', 'label_organic_scope'],
    // Ripeness goes to the by-item hub, and ORIGIN goes to the origin card. These were one
    // card until the 2026-08-02 refocus and both held `avocado` aliases afterward, which
    // left a bare "avocado" tied at 2 and decided by KB order — it landed on the origin
    // card, which answers a question nobody asked here.
    ['how do I pick a ripe avocado', 'produce_ripeness_by_item'],
    ['where was this grown', 'produce_picking_ripeness'],
  ];
  for (const [q, id] of wants) {
    assert.ok(looksLikePerimeterQuestion(q), `"${q}" must route to the counter`);
    const ids = matchEntries(q).map((e) => e.id);
    assert.ok(ids.includes(id), `"${q}" should reach ${id}, got ${ids.join(', ') || '(nothing)'}`);
  }
});

test('a bare either/or is a question, even with no question mark', () => {
  // How people actually type at a counter. None of these start with a question word
  // or carry punctuation, so every one of them used to route past the KB entirely
  // and come back as improvised prose.
  for (const q of ['wild or farmed', 'wild or farmed salmon', 'brown or white eggs', 'grass-fed or grain-fed']) {
    assert.equal(looksLikePerimeterQuestion(q), true, `"${q}" must route to the counter`);
    assert.ok(matchEntries(q).length > 0, `"${q}" must reach an entry`);
  }
  // A sentence that merely contains "or" is not a counter question.
  assert.equal(looksLikePerimeterQuestion('I usually grab chicken or rice on the way home'), false);
});

test('the asked answer is the same object as the browsed one', () => {
  // Ask and browse both resolve through publicEntry, so the card a question returns
  // is the card a tapped topic returns. One content path, no second rendering.
  const asked = publicEntry(matchEntries('wild or farmed salmon')[0]);
  const browsed = publicEntry(matchEntries('salmon')[0]);
  assert.deepEqual(asked, browsed);
  assert.equal(asked.id, 'salmon_wild_vs_farmed');
});

/* ── The honest miss ───────────────────────────────────────────────────────────── */

test('an uncovered counter question is a MISS, and the miss is detectable', () => {
  // The gaps the sections already name out loud: lamb, goat and game at the butcher,
  // crab and lobster at the fish counter. The KB holds nothing, so the reply must be
  // "no solid read", never a paragraph the model invented about buying lobster.
  for (const q of [
    'how do I pick a good lobster',
    'how do I pick a good crab',
    'is goat meat any good',
  ]) {
    assert.equal(matchEntries(q).length, 0, `"${q}" unexpectedly matched the KB`);
    assert.equal(looksLikeCounterQuestion(q), true, `"${q}" must take the honest miss`);
  }
});

test('the honest miss names what IS covered', () => {
  // A named gap is what makes the covered part trustworthy — the same rule the
  // section thinNotes follow.
  assert.match(NO_ANSWER, /no solid answer/i);
  for (const counter of [/fish counter/i, /butcher/i, /produce/i, /dairy/i, /bulk/i, /label/i]) {
    assert.match(NO_ANSWER, counter);
  }
});

test('the miss NEVER preempts an answer the counter actually has', () => {
  // The honest miss is only ever consulted after the matcher comes up empty. If one
  // of these stopped matching, the shopper would be told there is no read on a
  // question the KB answers in full.
  for (const q of [
    'wild or farmed salmon',
    'which cut for stew',
    'how do I pick a ripe avocado',
    'which fish are low in mercury',
    'is organic worth it',
    'how do I buy real olive oil',
  ]) {
    assert.ok(matchEntries(q).length > 0, `"${q}" must still resolve to an entry`);
  }
});

/* ── What must NOT become a counter question ───────────────────────────────────── */

test('a general food question still gets the coach, not a counter miss', () => {
  // The detector takes a counter SUBJECT and a BUYING intent together. Either alone
  // is somebody else's question, and answering it with "no solid read on that" would
  // be a worse regression than the improvisation this closes.
  for (const q of [
    'how much protein is in chicken',
    'what should I make for dinner',
    'what is the best way to cook chicken thighs',
    'how long do I grill salmon',
    'is my headache from gluten',
    'what time does the store close?',
  ]) {
    assert.equal(looksLikeCounterQuestion(q), false, `"${q}" must fall through to the coach`);
  }
});

test('statements and list commands are never counter questions', () => {
  for (const q of [
    'I had chicken and rice for lunch',
    'add chicken to my list',
    'add wild salmon',
    'swap the beef for something cheaper',
  ]) {
    assert.equal(looksLikeCounterQuestion(q), false, `"${q}" must not be read as a question`);
  }
});

test('a counter question is recognized across every counter, not just the fish case', () => {
  for (const q of [
    'which cut of lamb for stew',
    'how do I tell if the fish is fresh',
    'are brown eggs better',
    'is grass-fed worth it',
    'how do I pick a ripe melon',
    'what does cage-free actually mean',
  ]) {
    assert.equal(looksLikeCounterQuestion(q), true, `"${q}" is a counter question`);
  }
});

/* ── Guest-reachable ───────────────────────────────────────────────────────────── */

test('a counter answer needs no account: no model call, no stored data', () => {
  // matchEntries + publicEntry are a pure file read. Nothing in the free layer takes
  // a user, so the whole ask path is reachable by a stranger — the acquisition layer
  // is the point, and a sign-in wall on it costs the first thing they came to try.
  const entry = publicEntry(matchEntries('wild or farmed salmon')[0]);
  assert.ok(entry.short_answer);
  assert.ok(entry.buying_tips.length >= 3);
  assert.ok(entry.sources.length >= 1);
  assert.equal(entry.cart_pick, 'Wild-caught salmon');
});
