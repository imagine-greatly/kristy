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
import { nonEmpty } from './testGuards.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import { projectEntry, parseReviewTable, RETIRED, RETIRED_GENERATED } from './counterCards.js';
import { PERIMETER_SECTIONS, questionEntries } from './perimeter.js';
import { DEPTH_FIELDS } from './counterCards.js';
import {
  lintCard,
  lintPick,
  lintCorpus,
  mechanicalVeto,
  MECHANICAL_VETO,
  MAX_PICK_WORDS,
  PICK_FORBIDDEN_FIELDS,
  headlineHedge,
  falseMechanisms,
  contradictions,
  sharedObservables,
  closingConstruction,
  copulaAbstraction,
  antithesisChime,
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

const reviewed = nonEmpty(parseReviewTable(readFileSync(REVIEW_FILE, 'utf8')), 'the reviewed do-line table');
// QUESTION ENTRIES ONLY: a pick (`kind: 'pick'`) is linted by `lintPick`, never projected
// into a card, and holding it to the card's bar would fail it for lacking a headline.
const CARDS = nonEmpty(
  questionEntries().map((e) => projectEntry(e, { doLine: reviewed.get(e.id)?.do || '' })),
  'the projected card corpus'
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

test('the two retirement lists cannot be confused for each other', () => {
  // The migration deletes RETIRED with `.eq('source','curated')` and RETIRED_GENERATED
  // with `.eq('source','generated')`, so that neither kind can ever sweep the other. The
  // cost of that safety is that a slug in the WRONG list deletes nothing at all: it is
  // reported as retired, the row stays live, and the card keeps answering shoppers. Four
  // generated cards sat in RETIRED for exactly one migration run this way, including one
  // whose verdict contradicted a curated card outright.
  for (const slug of nonEmpty(RETIRED, 'RETIRED')) {
    assert.ok(
      !slug.startsWith('gen_'),
      `${slug} is a generated slug in RETIRED — the curated-scoped delete will silently skip it. Use RETIRED_GENERATED.`
    );
  }
  for (const slug of nonEmpty(RETIRED_GENERATED, 'RETIRED_GENERATED')) {
    assert.ok(
      slug.startsWith('gen_'),
      `${slug} is in RETIRED_GENERATED but is not a generated slug — the generated-scoped delete will silently skip it.`
    );
    // A generated card has no KB entry by definition, so this list may never name one.
    assert.ok(
      !perimeterKb.entries.some((e) => e.id === slug),
      `${slug} is declared RETIRED_GENERATED but is an authored KB entry`
    );
  }
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
    for (const section of nonEmpty(PERIMETER_SECTIONS, 'PERIMETER_SECTIONS', 6)) {
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
  // 74 after the 2026-08-02 overlap sweep folded six duplicate-verdict cards and demoted
  // `clabber`, and the A2 card landed; 75 once `berries_picking` was promoted from a
  // generated row; 81 with the six kitchen-technique `home` cards; 82 with
  // `bottled_water_buying` (2026-08-09); 83 with `strawberries_organic_residue`
  // (2026-08-18), the first card that names a brand; 84 with `label_artificial_color`
  // (2026-08-25), from the EU gap scan. See RETIRED / RETIRED_GENERATED in
  // counterCards.js and HOME_CARDS for the technique class.
  assert.equal(CARDS.length, 84);
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

/* ═══════════════════════════ TIC — the copula abstraction ═══════════════════════════ */

test('the copula-abstraction check catches what the chime does not', () => {
  // The monetization copy pass rejected this line on sight and antithesisChime passed it.
  // The two checks look for different things: the chime is LEXICAL (a clause repeating a
  // word and adding nothing), this one is INFORMATIONAL (a clause whose only payload is an
  // abstract noun). Both are narrow. Neither is review.
  const rejected = 'The cart is yours. Keeping it is the membership.';
  assert.deepEqual(antithesisChime(rejected), [], 'the chime is blind to this shape — that is the point');
  const hits = copulaAbstraction(rejected);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].noun, 'membership');
});

test('the copula check does not fire on a clause that lands somewhere concrete', () => {
  // Parallel construction that carries real information is not this defect.
  assert.deepEqual(
    copulaAbstraction('A nutritionist answers the questions you bring. This one answers the questions you didn’t know to ask, in the aisle, while it still matters.'),
    []
  );
  // A tier note naming a standard is not this defect either — "standard" is deliberately
  // NOT in the abstract list, because the corpus uses it as a real category.
  assert.deepEqual(
    copulaAbstraction('The processing difference is a fact about the carton. Preferring the least-handled one is the standard.'),
    []
  );
});

test('copula abstraction is REPORTED, never failed, and reads zero on the corpus', () => {
  const { violations, report } = lintCorpus(CARDS);
  assert.equal(
    violations.some((v) => v.code === 'COPULA_ABSTRACTION'), false,
    'this check reports — it must never gate authoring on a rhetorical judgment'
  );
  assert.deepEqual(
    report.copulaAbstraction, [],
    'a corpus hit means either the copy drifted or the check is noisy. Read it before promoting it.'
  );
});

/* ═══════════════════════════ The pick ═══════════════════════════ */

// A pick is one sentence about the food's surface, on a list row with no card. It is not
// a card and clears a different bar — stricter, because nothing downstream re-reads it.
// The fixture food is invented for this file and absent from the corpus; every line is a
// clean mechanical one, and the failing variants are built by inserting the defect into
// it rather than by writing a claim out.
const pick = (over = {}) => ({
  id: 'pick_rutabaga',
  kind: 'pick',
  title: 'Rutabaga',
  category: 'produce',
  aliases: ['rutabaga', 'rutabagas'],
  decision: 'Choose a firm root with smooth skin and no soft spots.',
  sources: [{ name: 'Extension produce guide (fixture)', url: 'https://example.invalid/rutabaga' }],
  ...over,
});

test('a clean pick passes, and lintCard routes it to lintPick', () => {
  assert.deepEqual(lintPick(pick()), []);
  assert.deepEqual(lintCard(pick()), [], 'lintCard must reach the pick rules through the one function every door calls');
  assert.deepEqual(lintCard(pick({ decision: 'Is it firm?' })), lintPick(pick({ decision: 'Is it firm?' })));
});

test('a pick needs its five fields and forbids every card field', () => {
  assert.ok(codes(lintPick(pick({ decision: '' }))).includes('PICK_FIELD_MISSING'));
  assert.ok(codes(lintPick(pick({ title: '' }))).includes('PICK_FIELD_MISSING'));
  for (const f of ['headline', 'why', 'tier_note', 'look_for', 'watch_out', 'detail', 'kristy_take', 'labels_decoded', 'cart_pick', 'asked_as']) {
    assert.ok(codes(lintPick(pick({ [f]: 'x' }))).includes('PICK_FIELD_FORBIDDEN'), `${f} must be forbidden on a pick`);
  }
  // An empty value is still the card's shape arriving.
  assert.ok(codes(lintPick(pick({ why: '' }))).includes('PICK_FIELD_FORBIDDEN'));
});

test('the forbidden set tracks the paid boundary, less sources', () => {
  // A field added to DEPTH_FIELDS is forbidden on a pick without a second edit. `sources`
  // is the one exception: paid on a card, REQUIRED on a pick.
  for (const f of DEPTH_FIELDS) {
    if (f === 'sources') assert.ok(!PICK_FORBIDDEN_FIELDS.has(f), 'sources is required on a pick');
    else assert.ok(PICK_FORBIDDEN_FIELDS.has(f), `${f} is in the depth and must be forbidden on a pick`);
  }
});

test('the title is the food, bare', () => {
  assert.ok(codes(lintPick(pick({ title: 'Rutabaga, the root nobody buys.' }))).includes('PICK_TITLE_NOT_BARE'));
  assert.deepEqual(lintPick(pick({ title: 'Yellow rutabaga' })), []);
});

test('a pick files under a counter, never under label terms or nowhere', () => {
  assert.ok(codes(lintPick(pick({ category: 'frozen' }))).includes('PICK_CATEGORY_UNSECTIONED'));
  assert.ok(codes(lintPick(pick({ category: 'label_terms' }))).includes('PICK_CATEGORY_NON_AISLE'));
  for (const c of ['produce', 'beef', 'seafood', 'dairy', 'bulk_pantry', 'poultry_eggs']) {
    assert.deepEqual(lintPick(pick({ category: c })), [], `${c} is a counter category`);
  }
});

test('aliases are bare nouns, at least two, in both numbers', () => {
  assert.ok(codes(lintPick(pick({ aliases: ['rutabaga'] }))).includes('PICK_ALIASES_TOO_FEW'));
  assert.ok(codes(lintPick(pick({ aliases: ['rutabaga', 'how do i pick rutabaga'] }))).includes('PICK_ALIAS_NOT_BARE'));
  assert.ok(codes(lintPick(pick({ aliases: ['Rutabaga', 'Rutabagas'] }))).includes('PICK_ALIAS_NOT_BARE'), 'typed, so lowercase');
  assert.ok(codes(lintPick(pick({ aliases: ['rutabaga', 'swede'] }))).includes('PICK_ALIASES_NO_NUMBER_PAIR'));
  // The three suffix relations, and nothing cleverer.
  assert.deepEqual(lintPick(pick({ aliases: ['rutabaga', 'rutabagas'] })), []);
  assert.deepEqual(lintPick(pick({ aliases: ['radish', 'radishes'] })), []);
  assert.deepEqual(lintPick(pick({ aliases: ['cherry', 'cherries'] })), []);
  assert.ok(codes(lintPick(pick({ aliases: ['leaf', 'leaves'] }))).includes('PICK_ALIASES_NO_NUMBER_PAIR'), 'not a stemmer');
});

test('a state-bearing pick carries the state on every alias, and no alias is only a modifier', () => {
  // `stateContradicts` is silent when the ROW names no state, so a bare `peas` alias on a
  // frozen pick would attach the frozen line to a fresh row. The lint is the structural fix.
  const frozen = (aliases) => pick({ id: 'pick_frozen_peas', title: 'Frozen peas', aliases });
  assert.ok(codes(lintPick(frozen(['frozen peas', 'peas']))).includes('PICK_ALIAS_DROPS_STATE'));
  assert.ok(codes(lintPick(frozen(['peas', 'pea']))).includes('PICK_ALIAS_DROPS_STATE'));
  assert.deepEqual(lintPick(frozen(['frozen peas', 'frozen pea'])), []);
  // An alias made only of modifier words names no food at all.
  assert.ok(codes(lintPick(frozen(['frozen peas', 'frozen pea', 'frozen']))).includes('PICK_ALIAS_NO_SUBJECT'));
  assert.ok(codes(lintPick(pick({ aliases: ['rutabaga', 'rutabagas', 'organic'] }))).includes('PICK_ALIAS_NO_SUBJECT'));
  assert.ok(codes(lintPick(pick({ aliases: ['rutabaga', 'rutabagas', 'fresh-dried'] }))).includes('PICK_ALIAS_NO_SUBJECT'), 'hyphens split');
  // A stateless title is not held to the state rule.
  assert.deepEqual(lintPick(pick({ aliases: ['rutabaga', 'rutabagas', 'fresh rutabaga'] })), []);
});

test('the line is one sentence, a statement, sixteen words or fewer', () => {
  assert.ok(codes(lintPick(pick({ decision: 'Choose a firm root. Skip the soft ones.' }))).includes('PICK_LINE_NOT_ONE_SENTENCE'));
  assert.ok(codes(lintPick(pick({ decision: 'Choose a firm root with smooth skin' }))).includes('PICK_LINE_NOT_ONE_SENTENCE'));
  assert.ok(codes(lintPick(pick({ decision: 'Is the root firm with smooth skin?' }))).includes('PICK_LINE_QUESTION'));
  assert.equal(MAX_PICK_WORDS, 16);
  const seventeen = 'Choose a firm root with smooth skin and no soft spots or cracks anywhere on the surface.';
  assert.equal(words(seventeen), 17);
  assert.ok(codes(lintPick(pick({ decision: seventeen }))).includes('PICK_LINE_TOO_LONG'));
  const sixteen = 'Choose a firm root with smooth skin and no soft spots or cracks on the surface.';
  assert.equal(words(sixteen), 16);
  assert.deepEqual(lintPick(pick({ decision: sixteen })), []);
});

test('the line carries no first person, no em-dash, no digit', () => {
  assert.ok(codes(lintPick(pick({ decision: 'Choose the root my hand finds firm.' }))).includes('PICK_LINE_FIRST_PERSON'));
  assert.ok(codes(lintPick(pick({ decision: 'I choose the firm root.' }))).includes('PICK_LINE_FIRST_PERSON'));
  // A country of origin is not a pronoun.
  assert.deepEqual(lintPick(pick({ decision: 'Choose the US grown root with smooth skin.' })), []);
  assert.ok(codes(lintPick(pick({ decision: 'Choose a firm root — soft means old.' }))).includes('PICK_LINE_EM_DASH'));
  assert.ok(codes(lintPick(pick({ decision: 'Choose a root under 4 inches across.' }))).includes('PICK_LINE_DIGIT'));
});

test('the mechanical veto: every group fires, plurals fire, processing words do not', () => {
  for (const group of Object.values(MECHANICAL_VETO)) {
    for (const w of group) {
      assert.equal(mechanicalVeto(`Choose the root that says ${w} on the sticker.`), w, `"${w}" must be vetoed`);
      const line = `Choose the root that says ${w} on the sticker.`;
      assert.ok(codes(lintPick(pick({ decision: line }))).includes('PICK_LINE_NOT_MECHANICAL'));
    }
  }
  // Plural and third-person forms, and case.
  assert.equal(mechanicalVeto('Choose the root with the most vitamins.'), 'vitamins');
  assert.equal(mechanicalVeto('Choose the root that Boosts the dish.'), 'Boosts');
  // The six the critic measured passing on the first cut, each named for the group and
  // form it now trips on. Test inputs inside a prohibition frame — never example output.
  const measured = [
    ['Choose the bunch for boosting immunity.', 'boosting'],          // treatment, -ing
    ['Pick the carton with the most calories.', 'calories'],           // nutrition, -s
    ['Choose the one with less sodium.', 'sodium'],                    // nutrition
    ['A good source of energy for the walk.', 'energy'],               // nutrition
    ['Choose the low-fat carton for the health benefits.', 'health'],  // body — not `fat`
    ['Pick the one supporting digestion.', 'supporting'],              // treatment, -ing
  ];
  for (const [line, hit] of measured) {
    assert.equal(mechanicalVeto(line), hit, `"${line}" must trip on "${hit}"`);
    assert.ok(codes(lintPick(pick({ decision: line }))).includes('PICK_LINE_NOT_MECHANICAL'));
  }
  // `fat` stays mechanical: marbling and the fat cap are the read at the meat counter.
  assert.equal(mechanicalVeto('Choose the chop with a thick white fat cap.'), null);
  assert.equal(mechanicalVeto('Pick the steak with fine marbling and firm fat.'), null);
  // Processing words on the counters are mechanical and must pass: the veto is base form
  // plus s/es, deliberately, so "cured" and "treated" describe the food.
  assert.equal(mechanicalVeto('Choose the dry-cured one with a treated rind.'), null);
  // The vegetable's heart is still vetoed — the veto is vocabulary, not sense, and the
  // cost is accepted.
  assert.equal(mechanicalVeto('Choose the one whose heart feels firm.'), 'heart');
  // "heal" does not reach into "healthy" by accident; "healthy" is listed on its own.
  assert.equal(mechanicalVeto('Choose the healthiest looking one.'), null);
  assert.equal(mechanicalVeto('Choose the healthy one.'), 'healthy');
  // A clean surface line names none of it.
  assert.equal(mechanicalVeto('Choose a firm root with smooth skin and no soft spots.'), null);
});

test('a pick carries at least one source, and every source carries a URL', () => {
  assert.ok(codes(lintPick(pick({ sources: [] }))).includes('PICK_SOURCES_MISSING'));
  // The card corpus names its sources without URLs. That is not enough for a pick: a URL
  // is what makes "every source gets fetched" checkable.
  assert.ok(codes(lintPick(pick({ sources: ['USDA FoodData Central'] }))).includes('PICK_SOURCE_NO_URL'));
  assert.deepEqual(lintPick(pick({ sources: ['USDA guide https://example.invalid/guide'] })), [], 'a string carrying a URL is fine');
  assert.deepEqual(lintPick(pick({ sources: [{ url: 'http://example.invalid/guide' }] })), []);
});

test('house copy holds on a pick line too', () => {
  assert.ok(codes(lintPick(pick({ decision: 'Choose the root with the deepest colour.' }))).includes('COPY_BRITISH'));
  assert.ok(codes(lintPick(pick({ decision: "Choose the root that doesn't give." }))).includes('COPY_STRAIGHT_QUOTE'));
});
