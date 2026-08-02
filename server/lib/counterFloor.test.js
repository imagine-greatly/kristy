// THE RETRIEVAL FLOOR, pinned in the unit both scorers share.
//
// The curated and generated retrieval paths are supposed to admit on the same evidence:
// at least one authored alias matched. That has been claimed three times in comments and
// enforced zero times, and it drifted a different way each time.
//
//   v1  Different constants (curated `> 3`, generated `>= 2`), justified by a premise
//       about alias counts that was never measured and was false.
//   v2  Same constants, different OPERATORS (`>` and `>=`), so curated still needed one
//       more point than generated. The comment said the floors matched. They did not.
//   v3  Same constants and same operators — and still not parity, because the two scorers
//       do not measure the same thing. scoreGenerated reads ONLY aliases. scoreEntries
//       adds title-word overlap, so its 2 can be two generic title words and no food at
//       all: "is guanciale worth buying" hit `farmed_fish_by_species` on the title "Which
//       farmed fish are worth buying" — the words "worth" and "buying" — and would have
//       answered a cured-pork question with a farmed-fish card.
//
// Each drift cost real money: a curated card rejected at the floor regenerates as a
// duplicate, and two of the generator's cards were exactly that. So the floor is asserted
// here in ALIAS HITS rather than in either constant, and both paths are checked against
// the same statement of it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { scoreEntries } from './perimeter.js';
import { scoreGenerated } from './counterCards.js';
import { answerCounterQuestion } from './counterAskPipeline.js';

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/* ═══════════════ The floor, stated once ═══════════════ */

// One single-word alias hit. Both scorers award 2 for it; that is the floor and the whole
// floor. Anything below it is "nothing authored for this question matched".
const FLOOR_ALIAS_SCORE = 2;

test('both scorers award the SAME points for one single-word alias hit', () => {
  // If these ever diverge, every threshold on both paths silently means something new.
  const entry = perimeterKb.entries.find((e) => (e.aliases || []).some((a) => norm(a).split(' ').length === 1));
  assert.ok(entry, 'the KB must have at least one single-word alias to anchor this');
  const bare = entry.aliases.find((a) => norm(a).split(' ').length === 1);

  const curated = scoreEntries(bare, 3).find((s) => s.entry.id === entry.id);
  assert.ok(curated, `"${bare}" did not retrieve its own entry`);
  assert.equal(curated.aliasScore, FLOOR_ALIAS_SCORE, 'curated alias scoring drifted off the floor');

  const generated = scoreGenerated(bare, [{ slug: 'g', aliases: [bare] }]);
  assert.equal(generated[0]?.score, FLOOR_ALIAS_SCORE, 'generated alias scoring drifted off the floor');
});

test('scoreEntries reports aliasScore separately from title overlap', () => {
  // The gate reads aliasScore. If the field vanishes the gate silently passes `undefined
  // > 0` — false — and EVERY curated retrieval stops working, so this is load-bearing.
  const s = scoreEntries('is guanciale worth buying', 3)[0];
  if (s) {
    assert.equal(typeof s.aliasScore, 'number', 'aliasScore must be reported');
    assert.equal(typeof s.titleScore, 'number', 'titleScore must be reported');
    assert.equal(s.score, s.aliasScore + s.titleScore, 'score must be the sum of its parts');
  }
});

/* ═══════════════ Parity, checked behaviourally ═══════════════ */

test('THE CURATED FLOOR IS ONE ALIAS HIT — a bare noun is admitted', async () => {
  // The v2 regression, in the shape a shopper produces it: one bare noun, one alias hit,
  // no title-word overlap because the card's title does not repeat the noun. Score 2.
  // Under `>` this was rejected and regenerated as a duplicate card. Twice.
  for (const q of ['strawberries', 'eggs']) {
    const out = await answerCounterQuestion({ query: q, allowGeneration: false });
    assert.equal(out.source, 'curated', `"${q}" should retrieve a curated card`);
    assert.equal(out.matched, true, `"${q}" should be a confident match, not a nearest-card fallback`);
  }
});

test('TITLE WORDS ALONE ARE NOT A MATCH, however many of them there are', async () => {
  // The v3 regression. Same score of 2, no food overlap whatsoever, wrong card.
  const s = scoreEntries('is guanciale worth buying', 3)[0];
  if (s) {
    assert.equal(s.aliasScore, 0, 'the guanciale case must score zero on aliases');
    assert.ok(s.titleScore >= 2, 'and it must still reach the numeric floor on title words');
  }
  const out = await answerCounterQuestion({ query: 'is guanciale worth buying', allowGeneration: false });
  assert.notEqual(out.matched, true, 'a title-word coincidence must never be served as a confident match');
});

test('the pipeline gates on aliasScore, not on the score alone', () => {
  // Read as source, because the whole failure mode is a gate that LOOKS right. A future
  // edit that drops `aliasScore` from the condition reintroduces the guanciale card.
  const src = readPipeline();
  assert.match(
    src,
    /top\.aliasScore\s*>\s*0/,
    'the curated gate must require an alias hit — a score threshold alone admits title-word coincidences'
  );
  // And the two floors must still be the same number.
  const curated = src.match(/const CONFIDENT = (\d+)/)?.[1];
  const generated = src.match(/const GENERATED_HIT = (\d+)/)?.[1];
  assert.equal(curated, generated, `the two floors drifted apart again: ${curated} vs ${generated}`);
  assert.equal(Number(curated), FLOOR_ALIAS_SCORE, 'the floors moved off one alias hit');
  // Same comparison on both, which is the v2 regression.
  assert.match(src, /top\.score >= CONFIDENT/, 'curated must use >=');
  assert.match(src, /genTop\.score >= GENERATED_HIT/, 'generated must use >=');
});

function readPipeline() {
  return readFileSync(new URL('./counterAskPipeline.js', import.meta.url), 'utf8');
}
