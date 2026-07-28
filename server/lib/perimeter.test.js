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

/* ── The counter FILLS the cart (INTERFACE_IDENTITY.md Block 2) ──────────────────
   Scanning puts a product in the trip. The counter has to do the same or it is a
   reference book. `cart_pick` is the concrete grocery an entry's guidance resolves
   to, and it is claim-safe the same way a composed list row is: it is a NAME. */

test('cart_pick is a grocery name, never a claim, a price or a sentence', () => {
  const picks = perimeterKb.entries.filter((e) => e.cart_pick);
  assert.ok(picks.length >= 30, `only ${picks.length} entries resolve to a cart pick`);
  for (const e of picks) {
    const p = e.cart_pick;
    assert.equal(typeof p, 'string');
    assert.ok(p.trim().length > 2 && p.length <= 44, `${e.id}: "${p}" is not a cart row`);
    assert.doesNotMatch(p, /[$£€%]/, `${e.id} carries a price or percent`);
    assert.doesNotMatch(p, /[.!?]$/, `${e.id} is a sentence, not a name`);
    assert.doesNotMatch(
      p,
      /\b(cure|heal|treat|prevent|reverse|detox|boost|healthy|healthier|superfood|toxic)\b/i,
      `${e.id} carries a claim`
    );
  }
});

test('a cart_pick can never be minted by the model', () => {
  // It is authored in the KB and is NOT one of the seven fields the prompt may see,
  // so there is no path by which a generated answer invents a grocery to add.
  const withPick = perimeterKb.entries.find((e) => e.cart_pick);
  assert.ok(withPick, 'at least one entry carries a pick');
  assert.ok(!('cart_pick' in sanitizeForModel(withPick)));
  const blob = JSON.stringify(
    buildAnswerInput({ question: 'q', focuses: [], hardLines: [], constraints: [], entries: [withPick] })
  );
  assert.ok(!blob.includes(withPick.cart_pick), 'the pick reached the model payload');
  // …but the free public read DOES expose it, which is what the tap uses.
  assert.equal(publicEntry(withPick).cart_pick, withPick.cart_pick);
});

test('an entry with no single honest answer carries no pick', () => {
  // A blank beats a forced one: "is organic worth it" has no one grocery, and a
  // label term is not a food at all.
  for (const id of ['organic_worth_it_by_type', 'produce_ripeness_by_item', 'beef_grades_usda']) {
    const e = perimeterKb.entries.find((x) => x.id === id);
    assert.ok(e, `${id} exists`);
    assert.ok(!e.cart_pick, `${id} should not force a pick`);
  }
  for (const e of perimeterKb.entries.filter((x) => x.category === 'label_terms')) {
    assert.ok(!e.cart_pick, `${e.id} is a label term, not a grocery`);
  }
});

/* ── Label truth (LABEL_TRUTH.md) ───────────────────────────────────────────────
   Kristy teaches the gap between what a label IMPLIES and what it GUARANTEES, so a
   shopper can evaluate any product themselves. The rule that makes this safe is that
   it is always about the label CATEGORY, never about a company. */
test('the label-truth entries exist and teach the feed gap', () => {
  const feed = perimeterKb.entries.find((e) => e.id === 'label_pasture_raised_feed');
  assert.ok(feed, 'the pasture-raised feed entry must exist');
  const text = JSON.stringify(feed).toLowerCase();
  // The teaching itself: space, not feed — and the word to look for.
  assert.match(text, /space/, 'must name what the term DOES cover');
  assert.match(text, /soy-free/, 'must name the word to look for');
  assert.match(feed.short_answer.toLowerCase(), /soy and corn/, 'must be honest about the usual ration');
  assert.equal(feed.evidence_tier, 'established', 'regulatory scope is an established fact');
  assert.ok(feed.sources.length >= 2, 'a regulatory claim carries its sources');

  // Surfaced where a shopper meets it — the eggs PICK already points at egg_labels.
  const eggs = perimeterKb.entries.find((e) => e.id === 'egg_labels');
  assert.match(JSON.stringify(eggs).toLowerCase(), /soy-free/, 'the egg entry cross-references the feed gap');
});

test('NO entry makes a negative factual claim about a named brand', () => {
  // The hard rule from LABEL_TRUTH.md. A claim about a company is checkable, goes
  // stale when they reformulate, and is the one kind of statement here with real
  // legal exposure. Teach the category, never "Brand X is bad".
  const BRANDS =
    /\b(vital farms|eggland'?s?|chobani|fage|oikos|kirkland|great value|tyson|perdue|smithfield|kraft|nestl[eé]|general mills|kellogg'?s?|quaker oats|pepsico|coca[- ]cola|danone|unilever|conagra|hormel|applegate|trader joe'?s|walmart|kroger|safeway)\b/i;
  for (const e of perimeterKb.entries) {
    assert.doesNotMatch(JSON.stringify(e), BRANDS, `${e.id} must not name a brand`);
  }
});

test('produce guidance teaches picking SKILL, never an origin ranking', () => {
  const p = perimeterKb.entries.find((e) => e.id === 'produce_picking_ripeness');
  assert.ok(p, 'the produce-picking entry must exist');
  // Only the fields Kristy SPEAKS. Aliases are the user's phrasings — "is mexican
  // produce better" is there so the matcher catches that exact misconception.
  const spoken = JSON.stringify({
    short_answer: p.short_answer,
    detail: p.detail,
    kristy_take: p.kristy_take,
    buying_tips: p.buying_tips,
    labels_decoded: p.labels_decoded,
  }).toLowerCase();
  const text = spoken;
  // Hass is a VARIETY grown in several countries — ranking origins is the exact
  // error LABEL_TRUTH.md calls out as a caution rather than a feature.
  assert.match(text, /variety/, 'must distinguish variety from origin');
  assert.match(text, /season/, 'must explain origin as a season signal');
  assert.doesNotMatch(
    text,
    /\b(mexican|californian|peruvian)\s+\w*\s*(are|is)?\s*(better|worse|superior|inferior)\b/,
    'must never rank one origin above another'
  );
  assert.ok(p.buying_tips.some((t) => /stem/i.test(t)), 'teaches an actual physical check');
});

/* ── The depth bar (COMPLETE_FOOD_COACH.md Block B) ─────────────────────────────
   "As sharp as a barcode scan" is only true if every counter entry answers a real
   at-the-counter question, carries a what-to-look-for checklist, and names its tier
   honestly. These pin the shape so a future entry can't be added half-finished. */

test('every entry is a complete, sourced, tiered answer with a real checklist', () => {
  const tiers = new Set(Object.keys(perimeterKb.evidence_tiers));
  for (const e of perimeterKb.entries) {
    for (const f of ['id', 'title', 'category', 'question', 'short_answer', 'detail', 'kristy_take']) {
      assert.ok(typeof e[f] === 'string' && e[f].trim(), `${e.id} is missing ${f}`);
    }
    assert.ok(tiers.has(e.evidence_tier), `${e.id} has an undeclared tier: ${e.evidence_tier}`);
    assert.ok(e.sources?.length >= 1, `${e.id} makes claims with no source`);
    assert.ok(e.aliases?.length >= 3, `${e.id} is unfindable: needs real aliases`);
    // The buying tips ARE the "what to look for" checklist the surface renders.
    assert.ok(e.buying_tips?.length >= 3, `${e.id} has no usable checklist`);
    assert.ok(Array.isArray(e.labels_decoded), `${e.id} labels_decoded must be an array`);
  }
});

test('every counter answers the questions a shopper actually has standing at it', () => {
  // One real question per counter, routed through the live matcher. If a counter
  // stops covering its own basics, this fails rather than quietly thinning out.
  const wants = [
    ['which cut of beef for stew', 'beef_cuts_basics'],
    ['what does usda prime mean', 'beef_grades_usda'],
    ['which chicken cut should i buy', 'chicken_cuts_basics'],
    ['which fish are low in mercury', 'mercury_by_fish'],
    ['how do i tell if fish is fresh', 'fish_freshness_at_counter'],
    ['are brown eggs better than white', 'egg_shell_color'],
    ['what does vegetarian fed mean', 'egg_feed_claims'],
    ['how do i pick a ripe melon', 'produce_ripeness_by_item'],
    ['is organic produce worth it', 'organic_worth_it_by_type'],
    ['what is ultra pasteurized milk', 'milk_processing'],
    ['is pre shredded cheese ok', 'pre_shredded_cheese'],
    ['should i worry about arsenic in rice', 'rice_arsenic'],
    ['how do i buy real extra virgin olive oil', 'olive_oil_buying'],
    ['how do i know if nuts are rancid', 'rancidity_check'],
  ];
  for (const [q, id] of wants) {
    const ids = matchEntries(q).map((e) => e.id);
    assert.ok(ids.includes(id), `"${q}" should reach ${id}, got ${ids.join(', ') || '(nothing)'}`);
  }
});

test('label truth is threaded through every counter, not parked in one section', () => {
  // A shopper learns to read ANY package by meeting decoded terms where they stand,
  // so each counter must carry decoded label terms of its own.
  const counters = ['seafood', 'beef', 'poultry', 'poultry_eggs', 'dairy', 'bulk_pantry'];
  for (const c of counters) {
    const inCat = perimeterKb.entries.filter((e) => e.category === c);
    assert.ok(inCat.length > 0, `${c} has no entries`);
    assert.ok(
      inCat.some((e) => (e.labels_decoded || []).length > 0),
      `${c} decodes no label terms of its own`
    );
  }
});

test('NO entry anywhere in the KB claims a health outcome, in either direction', () => {
  // Wider than the label-truth check below: the no-treatment rule is absolute across
  // the whole perimeter, and it is symmetric (nothing cures and nothing causes).
  const OUTCOME = /\b(cures?|heals?|prevents?|reverses?|detox|remed(y|ies)|immunity|diagnos\w*)\b/i;
  for (const e of perimeterKb.entries) {
    assert.doesNotMatch(JSON.stringify(e), OUTCOME, `${e.id} makes a health-outcome claim`);
  }
});

test('mercury guidance names species and defers anything medical', () => {
  const m = perimeterKb.entries.find((e) => e.id === 'mercury_by_fish');
  assert.ok(m, 'the mercury-by-fish entry must exist');
  const text = JSON.stringify(m).toLowerCase();
  for (const fish of ['sardines', 'skipjack', 'albacore', 'swordfish', 'king mackerel'])
    assert.match(text, new RegExp(fish), `must name ${fish}`);
  assert.match(text, /doctor/, 'anything medical is deferred, never a directive');
  assert.equal(m.evidence_tier, 'established');
});

test('no label-truth entry claims a health outcome', () => {
  const FORBIDDEN = /\b(cure|heal|treat|prevent|reverse|detox|immunity|disease|diagnos|remedy)\b/i;
  const ids = [
    'label_pasture_raised_feed', 'label_organic_scope', 'produce_picking_ripeness',
    'label_multigrain_vs_whole_grain', 'label_lightly_sweetened', 'label_no_artificial_flavors',
  ];
  for (const id of ids) {
    const e = perimeterKb.entries.find((x) => x.id === id);
    assert.ok(e, `${id} exists`);
    assert.doesNotMatch(JSON.stringify(e), FORBIDDEN, `${id} teaches label literacy, not health outcomes`);
  }
});
