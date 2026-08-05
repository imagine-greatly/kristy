// THE PAID BOUNDARY, AND THE TIER REACHING A FREE READER. Neither was tested.
//
// `summarize()` and `forViewer()` in counterCards.js are the server-side money boundary —
// the thing standing between a card's depth and an unauthenticated caller — and they had
// ZERO coverage. Moving `tier_note` out of DEPTH_FIELDS broke nothing in a 507-test suite,
// which is not evidence that the move was safe; it is evidence the boundary was held up by
// a comment. This codebase has been burned by exactly that three times over the retrieval
// floor alone: prose records intent, code executes mechanism, and the two drift silently.
//
// WHAT CHANGED ON 2026-08-04. The tier chip is gone from every surface — "Credible concern"
// sitting above a card about buying organic is a classification with no referent, a label
// on nothing. But non-negotiable #6 says a reader must ALWAYS know whether a claim is
// settled science, a credible concern or a standard, and the chip was the free carrier of
// that. So `tier_note` moved out of the depth and onto the free summary: a SWAP of one free
// signal for a better one, not a widening. Both halves are asserted below, because either
// alone is a defect — the chip gone with the sentence still paid strips 73 of 81 cards of
// any tier signal, and the sentence free while `why` follows it would be giving away the
// membership.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEPTH_FIELDS, summarize, forViewer, projectEntry, projectAll } from './counterCards.js';
import { nonEmpty } from './testGuards.js';

/* THE CORPUS, BOUND AT THE COLLECTION. `projectAll()` returning empty would make every
   assertion below vacuously true and print a green tick where the boundary used to be —
   the precise failure that let all eight essentials ship gated under a passing check. */
const CARDS = nonEmpty(projectAll(), 'projected counter cards', 70);
const ESSENTIALS = nonEmpty(CARDS.filter((c) => c.essential), 'essential cards', 8);
const METERED = nonEmpty(CARDS.filter((c) => !c.essential), 'non-essential cards', 60);

test('the depth is seven fields and tier_note is not among them', () => {
  assert.deepEqual(
    [...DEPTH_FIELDS].sort(),
    ['detail', 'kristy_take', 'labels_decoded', 'look_for', 'sources', 'watch_out', 'why'].sort(),
    'DEPTH_FIELDS changed. That list IS the price of membership — widening it sells ' +
      'something that was free, narrowing it gives away something that was sold.'
  );
  assert.ok(
    !DEPTH_FIELDS.includes('tier_note'),
    'tier_note is back in the depth. The tier chip was removed on the strength of the ' +
      'sentence being free; putting it behind the gate leaves 73 of 81 cards with no tier ' +
      'signal at all for a free reader, which breaks non-negotiable #6.'
  );
});

test('a free viewer never receives the depth', () => {
  for (const card of METERED) {
    const out = forViewer(card, { premium: false, unlocked: false });
    for (const f of DEPTH_FIELDS) {
      assert.ok(
        !(f in out),
        `${card.slug} leaked "${f}" to a free viewer. A client that merely hides depth has ` +
          `already received it.`
      );
    }
    assert.equal(out.locked, true, `${card.slug} must be marked locked for a free viewer.`);
  }
});

/* ═══════ NON-NEGOTIABLE #6, OVER THE REAL CORPUS ═══════
   "A reader must always know whether a claim is settled science, a credible concern, or a
   standard." ALWAYS means the free reader on every card, not the paying one on eight. This
   is the assertion the chip used to satisfy and the sentence now has to. */
test('every card tells a FREE reader what kind of claim it is', () => {
  for (const card of CARDS) {
    const out = forViewer(card, { premium: false, unlocked: false });
    assert.ok(
      typeof out.tier_note === 'string' && out.tier_note.trim().length > 0,
      `${card.slug} reaches a free reader with no tier sentence. With the chip gone this ` +
        `card states a verdict and never says whether it is settled science, a credible ` +
        `concern or a standard.`
    );
  }
});

test('the tier sentence is a sentence, not the chip growing back', () => {
  // A one- or two-word tier_note would be a chip wearing a <p>. The whole objection to the
  // chip was that a bare classification has no referent, so the replacement has to say
  // something about THIS card.
  const CHIP_WORDS = /^(settled|credible concern|whole-food standard|time-tested)\.?$/i;
  for (const card of CARDS) {
    const note = String(card.tier_note || '').trim();
    assert.ok(
      !CHIP_WORDS.test(note),
      `${card.slug}'s tier_note is just the tier's name ("${note}") — that is the chip again.`
    );
    assert.ok(
      note.split(/\s+/).length >= 5,
      `${card.slug}'s tier_note is ${note.split(/\s+/).length} words. Too short to carry a ` +
        `referent, which is the entire reason the chip was removed.`
    );
  }
});

test('no two cards share a tier sentence, and none points at the tier', () => {
  /* CORPUS-LEVEL, because neither defect is visible from one card. Four cards shared a
     single sentence — "Traditional food with centuries behind it… This tier is Kristy's
     sourcing standard" — which was invisible to per-card lint by construction, and became
     a dangling reference the moment the chip it named was removed. `lintCard` now catches
     the self-reference; only a sweep catches the duplication. A sentence on four cards is
     the rubric wearing a costume, and the whole point of `tier_note` is that it says why
     THIS call carries THIS tier. */
  const byNote = new Map();
  for (const c of CARDS) {
    const n = String(c.tier_note || '').trim();
    assert.ok(
      !/\b(this|the)\s+tier\b/i.test(n),
      `${c.slug} says "${n.match(/\b(?:this|the)\s+tier\b/i)?.[0]}" — nothing names the tier ` +
        `on the card any more, so it points at nothing.`
    );
    byNote.set(n, [...(byNote.get(n) || []), c.slug]);
  }
  for (const [n, slugs] of byNote) {
    assert.equal(
      slugs.length,
      1,
      `${slugs.length} cards share one tier sentence (${slugs.join(', ')}): "${n.slice(0, 60)}…"`
    );
  }
});

test('essentials stay full for everyone and never touch the meter', () => {
  for (const card of ESSENTIALS) {
    const out = forViewer(card, { premium: false, unlocked: false });
    assert.ok(out.why, `essential ${card.slug} was gated. The eight prove the depth is real.`);
    assert.ok(!out.locked, `essential ${card.slug} must not be marked locked.`);
  }
});

test('a premium viewer receives everything', () => {
  const card = METERED[0];
  const out = forViewer(card, { premium: true });
  assert.equal(out.locked, undefined, 'a paid card is not locked');
  assert.ok(out.why, 'a paid card carries its why');
});

test('the teaser ships geometry and counts, never the withheld words', () => {
  const card = nonEmpty(
    METERED.filter((c) => Array.isArray(c.look_for) && c.look_for.length > 2),
    'cards with a multi-item checklist',
    1
  )[0];
  const t = summarize(card).teaser;

  assert.equal(t.look_for_first, card.look_for[0], 'the first check goes down in full');
  assert.deepEqual(
    t.faded_lengths,
    card.look_for.slice(1, 4).map((s) => String(s).length),
    'the fade is TRUE character lengths'
  );
  // The words themselves must not ride along. Sending them would leak a third of every card
  // in the same change that stopped leaking all of it.
  const blob = JSON.stringify(t);
  for (const line of card.look_for.slice(1)) {
    assert.ok(!blob.includes(line), `the teaser leaked a withheld check verbatim: "${line}"`);
  }
  assert.ok(
    !('tier_note' in t.remaining),
    'the teaser still advertises tier_note as withheld. It is free and already on the ' +
      'summary above the tap — teasing a line the reader can see is a gate lying about ' +
      'where it sits.'
  );
});

test('projectEntry carries the tier sentence onto every card it builds', () => {
  // The generator and the migration both go through here. A card built without a tier_note
  // would satisfy every check above by never reaching the corpus, and then ship.
  const built = projectEntry(
    {
      id: 'probe_card',
      title: 'A probe',
      evidence_tier: 'established',
      tier_note: 'This is a probe sentence long enough to carry a referent.',
      short_answer: 'Buy the thing.',
    },
    { doLine: 'Take the one on the left.' }
  );
  assert.equal(built.tier_note, 'This is a probe sentence long enough to carry a referent.');
});
