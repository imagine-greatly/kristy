// Counter card lint — the shape bar, enforced. NO network, NO model, NO database.
//
// Every rule here is a defect that was found by hand on 2026-07-31 during the Pass 2
// review sweep. The point of the file is that none of them can come back silently —
// least of all through a card Pass 3 GENERATES, which renders in the same component as a
// curated one and therefore has to clear the same bar. So the rules are tested twice:
// against synthetic generated cards (the unit tests) and against all 80 curated cards
// (the corpus tests).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { projectEntry, parseReviewTable, RETIRED } from './counterCards.js';
import { PERIMETER_SECTIONS } from './perimeter.js';
import {
  lintCard,
  lintCorpus,
  headlineHedge,
  falseMechanisms,
  contradictions,
  sharedObservables,
  closingConstruction,
  words,
  firstToken,
  IMPERATIVE_VERBS,
  MAX_DO_WORDS,
  MAX_HEADLINE_WORDS,
  MAX_EMDASH_SHARE,
} from './counterCardLint.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVIEW_FILE = join(__dirname, '..', '..', 'docs', 'do-lines-review.md');

/* ═══════════════════════════ The curated corpus ═══════════════════════════ */

const reviewed = parseReviewTable(readFileSync(REVIEW_FILE, 'utf8'));
const CARDS = (perimeterKb.entries || []).map((e) =>
  projectEntry(e, { doLine: reviewed.get(e.id)?.do || '' })
);

const codes = (violations) => violations.map((v) => v.code);

// A generated card is a plain object in the same shape — this is what Pass 3 will hand
// the lint before persisting anything.
const generated = (over = {}) => ({
  slug: 'generated_test',
  section: 'produce',
  source: 'generated',
  headline: 'Buy the loose ones and skip the bag.',
  do: 'Squeeze the stem end; it should give slightly.',
  ...over,
});

/* ═══════════════════════════ Length and imperative ═══════════════════════════ */

test('a do line over 14 words fails, on a generated card', () => {
  const card = generated({
    do: 'Read the label on the package and then check the second panel for the added sugars line as well.',
  });
  assert.ok(words(card.do) > MAX_DO_WORDS);
  assert.ok(codes(lintCard(card)).includes('DO_TOO_LONG'));
});

test('a headline over 12 words fails, on a generated card', () => {
  const card = generated({
    headline: 'This is a description of the produce section that runs on well past the limit.',
  });
  assert.ok(words(card.headline) > MAX_HEADLINE_WORDS);
  assert.ok(codes(lintCard(card)).includes('HEADLINE_TOO_LONG'));
});

test('a do line that describes instead of instructing fails', () => {
  // The failure this exists to catch: a generated line that reads like prose.
  const card = generated({ do: 'Organic is generally the better choice in this aisle.' });
  assert.ok(codes(lintCard(card)).includes('DO_NOT_IMPERATIVE'));
});

test('a missing do line fails — a card with no action is not a card', () => {
  assert.ok(codes(lintCard(generated({ do: '' }))).includes('DO_MISSING'));
});

test('hyphenated compounds count as one word', () => {
  // "grass-finished" is one thing a shopper looks for. Splitting it would make the
  // 14-word bar punish precision.
  assert.equal(words('Buy grass-finished, not grass-fed.'), 4);
});

/* ═══════════════════════════ Ruling 4 — the observable ═══════════════════════════ */

test('ruling 4: a quoted observable in BOTH the headline and the do line fails', () => {
  // The real historical defect, verbatim: egg_feed_claims before 2026-07-31.
  const shared = sharedObservables(
    'Feed claims have to be printed. Look for soy-free.',
    'Look for “soy-free” printed explicitly — no other carton word implies it.'
  );
  assert.deepEqual(shared, ['soy-free']);
  assert.ok(codes(lintCard(generated({
    headline: 'Feed claims have to be printed. Look for soy-free.',
    do: 'Look for “soy-free” printed explicitly — no other carton word implies it.',
  }))).includes('OBSERVABLE_IN_BOTH'));
});

test('ruling 4: flour_basics, the same defect without quotes on the headline side', () => {
  assert.deepEqual(
    sharedObservables(
      'Unbleached all-purpose. Keep whole wheat in the freezer.',
      'Read for “unbleached” — “bleached” was chemically whitened.'
    ),
    ['unbleached']
  );
});

test('ruling 4: TWO shared terms fail even when neither is quoted', () => {
  // A line orbiting its own headline rather than adding to it.
  const shared = sharedObservables(
    'Plain oats, any form. Skip the flavored instant packets.',
    'Pass the flavored instant boxes. Plain oats list one ingredient.'
  );
  assert.deepEqual(shared.sort(), ['flavored', 'instant']);
});

test('ONE shared subject noun is fine — the do line still earns its place', () => {
  // A card about grass-fed beef says "grass-fed" twice and is correct: the do line adds
  // the cut. Flagging this would make the check useless.
  assert.deepEqual(
    sharedObservables(
      'Grass-fed and grass-finished. Grass-fed alone is still a feedlot finish.',
      'Buy grass-fed as ground beef or chuck, not as ribeye.'
    ),
    []
  );
});

test('a quoted QUESTION is speech, not a printed observable', () => {
  // "was this previously frozen?" is said out loud at the counter. Counting it as a
  // printed word flagged a card that was correct.
  assert.deepEqual(
    sharedObservables(
      'Buy the frozen. Thaw it overnight in the fridge.',
      'Ask the counter “was this previously frozen?” before paying the fresh premium.'
    ),
    []
  );
});

/* ═══════════════════════════ Corpus shape ═══════════════════════════ */

test('the em-dash-then-justification share stays under the ceiling', () => {
  const { report, violations } = lintCorpus(CARDS);
  assert.ok(
    report.emDashShare <= MAX_EMDASH_SHARE,
    `em-dash share is ${Math.round(report.emDashShare * 100)}%, ceiling is ${Math.round(
      MAX_EMDASH_SHARE * 100
    )}%`
  );
  assert.ok(!codes(violations).includes('EMDASH_SHARE'));
});

test('an em-dash monoculture fails — the pre-sweep corpus would not have passed', () => {
  const monoculture = Array.from({ length: 10 }, (_, i) =>
    generated({ slug: `g${i}`, do: `Read the panel for grams — that number is the sugar.` })
  );
  assert.ok(codes(lintCorpus(monoculture).violations).includes('EMDASH_SHARE'));
});

test('within-section closing duplication fails', () => {
  // The real pair: air_chilled_chicken and pork_cuts_and_enhanced, both `meat`.
  const pair = [
    generated({ slug: 'a', section: 'meat', do: 'Check the package for “retained water up to” — that percentage is water.' }),
    generated({ slug: 'b', section: 'meat', do: 'Read the fine print for “contains up to” — that percentage is brine.' }),
  ];
  assert.ok(codes(lintCorpus(pair).violations).includes('CLOSING_DUPLICATE'));
});

test('THE PROXIMITY RULE: the identical collision across sections does NOT fail', () => {
  // Sections are aisles. Nobody reads a meat card and a label-terms card in the same
  // breath, so a shared construction between them is not repetition anyone perceives.
  // Scoring it globally produces rewrites that make individual lines worse for a variety
  // no shopper experiences.
  const pair = [
    generated({ slug: 'a', section: 'meat', do: 'Check the package for “retained water up to” — that percentage is water.' }),
    generated({ slug: 'b', section: 'label_terms', do: 'Read the fine print for “contains up to” — that percentage is brine.' }),
  ];
  assert.ok(!codes(lintCorpus(pair).violations).includes('CLOSING_DUPLICATE'));
});

test('closingConstruction reads the clause after the last break, frame words and all', () => {
  assert.deepEqual(closingConstruction('Read the panel — that percentage is brine.'), [
    'that',
    'percentage',
    'is',
    'brine',
  ]);
});

test('a line with no clause break has no closing construction', () => {
  // Comparing whole lines instead flagged every pair of cards about the same food: two
  // meat cards share "ground beef" and "chuck" because they are both about beef, which is
  // subject matter, not a repeated construction.
  assert.deepEqual(closingConstruction('Buy grass-fed as ground beef or chuck, not as ribeye.'), []);
});

test('shared subject matter within a section does NOT count as duplication', () => {
  const pair = [
    generated({ slug: 'a', section: 'meat', do: 'Buy grass-fed as ground beef or chuck, not as ribeye.' }),
    generated({ slug: 'b', section: 'meat', do: 'Read the cut name too: “ground chuck” beats plain “ground beef.”' }),
  ];
  assert.ok(!codes(lintCorpus(pair).violations).includes('CLOSING_DUPLICATE'));
});

test('a shared prefix of pure grammar is not a construction', () => {
  const pair = [
    generated({ slug: 'a', section: 'meat', do: 'Press the flesh — it should spring back.' }),
    generated({ slug: 'b', section: 'meat', do: 'Lift the package — it should feel heavy.' }),
  ];
  assert.ok(!codes(lintCorpus(pair).violations).includes('CLOSING_DUPLICATE'));
});

/* ═══════════════════════════ Verb distribution: report only ═══════════════════════════ */

test('verb distribution is REPORTED and never fails', () => {
  // Twenty-one lines open with "Read" because twenty-one cards are about reading a label,
  // and that is the physical act. Substituting synonyms to flatten a histogram makes each
  // line less precise and the corpus no less repetitive. Precision beats variety.
  //
  // Every line below opens with the same verb and closes differently, which is exactly
  // the shape the corpus actually has: concentrated verbs, varied content.
  const tails = [
    'Read the first ingredient; it must say whole wheat.',
    'Read the harvest date stamped near the cap.',
    'Read the country of origin under the barcode.',
    'Read the milkfat percent on the nutrition panel.',
    'Read the species name printed on the case tag.',
    'Read the pack medium before comparing two tins.',
  ];
  const skewed = tails.map((d, i) => generated({ slug: `g${i}`, do: d }));
  const { violations, report } = lintCorpus(skewed);
  assert.equal(violations.length, 0, 'a skewed verb distribution must not fail the suite');
  assert.deepEqual(report.verbs[0], { verb: 'read', n: tails.length });
  assert.ok(
    !violations.some((v) => /VERB/i.test(v.code)),
    'there is no failing verb rule, by design'
  );
});

test('the corpus verb report is populated and every opener is a known verb', () => {
  const { report } = lintCorpus(CARDS);
  assert.equal(report.total, CARDS.length);
  assert.ok(report.verbs.length > 10, 'the corpus should not collapse to a handful of verbs');
  for (const { verb } of report.verbs) {
    assert.ok(IMPERATIVE_VERBS.has(verb), `"${verb}" opens a do line but is not a known verb`);
  }
});

/* ═══════════════════════════ One verdict per headline ═══════════════════════════ */

test('the hedge in the verdict is caught, in all four of its shapes', () => {
  // The nine that shipped, one per shape.
  const hedged = [
    'Wild if it is in reach. Farmed or nothing, buy the farmed.',
    'Grass-fed when the price is fair. Otherwise regular beef.',
    'Worth it if the budget stretches. Otherwise the plain carton.',
    'Air-chilled if the price is close. Regular chicken if it is not.',
    'Plain pasteurized over ultra. Cream-top if the store has it.',
    'Dried when there is time. Canned and rinsed when there is not.',
    'Paying grass-fed prices? Buy grass-FINISHED.',
    // No conditional keyword at all, and the identical retreat: name the pick, then
    // hand the choice straight back.
    'Whole milk. Buy the one the household actually drinks.',
  ];
  for (const h of hedged) assert.ok(headlineHedge(h).length, `not caught: ${h}`);
});

test('a type or use-case split is discrimination, and must survive', () => {
  // THE CHECK EXISTS TO SPARE THESE. A two-clause headline is not the defect; a second
  // clause conditioned on the shopper's WALLET is. Banning two clauses would delete the
  // four headlines where the standard genuinely differs by what is in your hand.
  const splits = [
    'Organic on thin-skinned produce. Conventional on anything peeled.',
    'Meaningful on beef and dairy. A freebie on chicken and pork.',
    'Pay for grade on a quick-cooked steak. Skip it on anything braised.',
    '80/20 for burgers. 90/10 for anything you drain.',
  ];
  for (const h of splits) assert.deepEqual(headlineHedge(h), [], `false positive: ${h}`);
});

test('a temporal "when" and a descriptive "or nothing" are not hedges', () => {
  // Both were false positives on the first draft of this check. "Wash it when you eat
  // it" is a time, not a condition; "clean seawater or nothing" describes a smell.
  assert.deepEqual(headlineHedge('Wash it when you eat it, not when you unpack it.'), []);
  assert.deepEqual(headlineHedge('Smell it first. Clean seawater or nothing means yes.'), []);
});

/* ═══════════════════════════ Accuracy ═══════════════════════════ */

test('the false mechanisms are refused, however true the position they prop up', () => {
  const card = (why) => ({ headline: 'Wild.', do: 'Take the frozen sockeye.', why, tier_note: 'x' });
  // Not used in commercial salmon farming anywhere. The claim is a myth.
  assert.ok(falseMechanisms(card('Farmed salmon is raised on growth hormones.')).length);
  // Farmed salmon is fatter and often carries MORE total omega-3. The claim is the ratio.
  assert.ok(falseMechanisms(card('Farmed fish has less omega-3 than wild.')).length);
  assert.ok(falseMechanisms(card('Farmed shrimp is full of antibiotics.')).length);
  // Naming antibiotics on a farmed card without the country framing is the same claim
  // by omission — this one is a required-context rule, not a banned phrase.
  assert.ok(falseMechanisms(card('Farmed fish is treated with antibiotics.')).length);
  assert.deepEqual(
    falseMechanisms(card('Antibiotic use on farms varies enormously by country of origin.')),
    []
  );
  // The accurate case has to pass, or the rule is just a gag.
  assert.deepEqual(
    falseMechanisms(
      card('Farmed salmon eats a formulated ration, which leaves it with a far worse omega-3 to omega-6 ratio.')
    ),
    []
  );
});

test('an exclusivity claim beside an enumeration is reported, never gated', () => {
  // The defect this was built from: a do line claiming the sole whole-life seal, beside
  // a look_for naming two of them.
  const card = {
    headline: 'Grass-fed and grass-finished.',
    do: 'Look for the American Grassfed seal, the only whole-life claim on the case.',
    look_for: ['The seals that audit the whole life: American Grassfed Association, Certified Grassfed by AGW.'],
    tier_note: 'x',
  };
  assert.ok(contradictions(card).some((c) => c.code === 'CONTRADICTION_EXCLUSIVITY'));
  // Report only. It must never fail a card.
  assert.ok(!lintCard(card).some((v) => v.code.startsWith('CONTRADICTION')));
});

/* ═══════════════════════════ The whole curated corpus ═══════════════════════════ */

test('a retired slug is gone from the KB, and its aliases were rehomed', () => {
  // A fold is two operations that must both happen: the entry leaves the KB and the row
  // leaves counter_cards. Declaring a slug RETIRED while it is still an entry would make
  // the migration upsert and then delete the same row every run — the card would vanish
  // from production while still looking present in the file.
  for (const slug of RETIRED) {
    assert.ok(
      !perimeterKb.entries.some((e) => e.id === slug),
      `${slug} is declared RETIRED but is still an authored entry`
    );
    // A section shortcut must already be browsable in that section. Folding a card
    // without repointing its shortcut leaves a tap that resolves to nothing — the
    // grass-fed shortcut did exactly this and only a test caught it.
    for (const section of PERIMETER_SECTIONS) {
      assert.ok(
        !(section.shortcuts || []).some((sc) => sc.id === slug),
        `${section.id} still has a shortcut pointing at retired ${slug}`
      );
    }
  }
  // The questions a folded card used to answer have to resolve to the card that absorbed
  // it, or the fold is a coverage regression wearing a tidy diff.
  const beef = perimeterKb.entries.find((e) => e.id === 'beef_grassfed_vs_grainfed');
  for (const alias of ['grass finished', 'grass-finished', '100% grass fed']) {
    assert.ok(beef.aliases.includes(alias), `beef card did not absorb the alias "${alias}"`);
  }
});

test('all curated cards clear the per-card bar', () => {
  assert.equal(CARDS.length, 79);
  const failures = [];
  for (const card of CARDS) {
    for (const v of lintCard(card)) failures.push(`${card.slug} — ${v.code}: ${v.detail}`);
  }
  assert.deepEqual(failures, []);
});

test('the curated corpus clears the corpus-level bar', () => {
  const { violations } = lintCorpus(CARDS);
  assert.deepEqual(violations.map((v) => `${v.code}: ${v.detail}`), []);
});

test('every curated card carries a do line and a headline', () => {
  for (const card of CARDS) {
    assert.ok(card.do, `${card.slug} has no do line`);
    assert.ok(card.headline, `${card.slug} has no headline`);
    assert.ok(IMPERATIVE_VERBS.has(firstToken(card.do)), `${card.slug} opens with a non-verb`);
  }
});
