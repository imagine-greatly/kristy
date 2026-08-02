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

/* ═══════════════ Raw is a sourcing question (VOICE_SPEC.md) ═══════════════
   The raw cards are organized around WHO MADE IT, not around whether raw is safe.
   That is an editorial stance, and it is only defensible because three things hold at
   once, which is what these tests pin:

     • the card is about sourcing, and it does not hedge its own recommendation;
     • it never claims a food cures, treats or reverses anything;
     • it never argues that a documented risk is invented — and where an outcome is
       concentrated in a specific group, it names that group ONCE, concretely.

   The middle and last of those are the safety line. Losing either would turn an
   opinionated card into an irresponsible one, so they are asserted, not trusted. */

// Never, in any framing, on any raw card.
const CURE_CLAIM = /\b(cures?|treats?|heals?|reverses?|remed(y|ies)|detox\w*)\b/i;
// The other direction: arguing the documented risk away.
const RISK_DENIAL = /\b(overblown|overstated|invented|fear-?monger\w*|regulatory theater|myth|hysteria|not a real risk)\b/i;
// Hedging its own recommendation, which the principle forbids outright.
const HEDGE = /\b(consider the risks?|talk to your doctor|ask your doctor|some people choose|weigh the risks?)\b/i;

test('raw milk is a sourcing card: enthusiastic, unhedged, and it names the group once', () => {
  const raw = perimeterKb.entries.find((e) => e.id === 'raw_milk');
  assert.ok(raw, 'raw_milk entry exists');
  const all = JSON.stringify(raw);
  const text = all.toLowerCase();

  // Sourcing IS the answer, not a caveat attached to one.
  assert.match(text, /farm/, 'the card is organized around the producer');
  assert.match(text, /test results|tests/, 'a farm that publishes its testing is the signal');
  assert.match(text, /herd/, 'the herd is named as part of the answer');

  // It does not hedge, and it does not argue with the epidemiology either.
  assert.doesNotMatch(all, HEDGE, 'a raw card never hedges its own recommendation');
  assert.doesNotMatch(all, RISK_DENIAL, 'Kristy does not litigate epidemiology');
  assert.doesNotMatch(all, CURE_CLAIM, 'no raw food cures, treats or reverses anything');

  // THE ONE THING THAT GETS NAMED. Concrete, in watch_out, and not a vague disclaimer.
  const watch = (raw.watch_out || []).join(' ').toLowerCase();
  assert.ok(raw.watch_out?.length, 'raw milk carries an authored watch_out');
  assert.match(watch, /pregnan/, 'pregnancy is named');
  assert.match(watch, /\bfive\b|\bchildren\b|\bkids\b/, 'young children are named');
  assert.match(watch, /immunocompromised|immune/, 'immunocompromised households are named');

  // The tier describes the KIND of claim, and says so rather than reading as a safety rating.
  assert.equal(raw.evidence_tier, 'time_tested');
  assert.match(raw.tier_note || '', /not a health claim/i, 'the tier note disclaims itself');
});

test('the named group appears ONCE across raw dairy, not repeated on every card', () => {
  // Repeating it on every raw card turns a practical insider detail into boilerplate,
  // which is how a reader learns to skip it. The sibling cards link instead.
  // `clabber` was demoted to a look_for on raw_milk on 2026-08-02 — its subject was
  // too narrow to carry a card, and its own do line was an instruction about the raw
  // milk card's product. The rule it was covered by is unchanged for the rest.
  const siblings = ['raw_kefir', 'raw_aged_cheese'];
  for (const id of siblings) {
    const e = perimeterKb.entries.find((x) => x.id === id);
    assert.ok(e, `${id} exists`);
    const watch = (e.watch_out || []).join(' ');
    assert.doesNotMatch(watch, /pregnan/i, `${id} must not repeat the named group`);
    assert.match(watch, /raw milk card/i, `${id} points at the card that carries it`);
    assert.doesNotMatch(JSON.stringify(e), CURE_CLAIM);
    assert.doesNotMatch(JSON.stringify(e), RISK_DENIAL);
    assert.doesNotMatch(JSON.stringify(e), HEDGE);
  }
});

test('a named group is added only where one exists, never for symmetry', () => {
  // An unnecessary caution is the same failure as a missing one: it tells the reader
  // Kristy is not discriminating. Raw honey names infants; raw nuts name nobody.
  const honey = perimeterKb.entries.find((e) => e.id === 'honey_adulteration');
  assert.match((honey.watch_out || []).join(' '), /infant/i, 'raw honey names infants');

  const nuts = perimeterKb.entries.find((e) => e.id === 'nuts_raw_vs_roasted');
  const nutWatch = (nuts.watch_out || []).join(' ');
  assert.ok(nutWatch, 'raw nuts still carry the label-term reality');
  assert.doesNotMatch(nutWatch, /pregnan|immunocompromised|infant/i, 'raw nuts name no group, because there is none');
  // …and it carries the part that IS true: the word is theater on US almonds.
  assert.match(nutWatch, /pasteurized by law|steam/i, '"raw" almonds are pasteurized by law');
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

/* ── The counter FILLS the cart ──────────────────────────────────────────────────
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

/* ── Label truth ─────────────────────────────────────────────────────────────────
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
  // The hard rule: a claim about a company is checkable, goes
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
  // Hass is a VARIETY grown in several countries, so ranking origins mixes up variety
  // with origin and is probably just wrong. Teach the picking skill instead.
  assert.match(text, /variety/, 'must distinguish variety from origin');
  assert.match(text, /season/, 'must explain origin as a season signal');
  assert.doesNotMatch(
    text,
    /\b(mexican|californian|peruvian)\s+\w*\s*(are|is)?\s*(better|worse|superior|inferior)\b/,
    'must never rank one origin above another'
  );
  // The card must still put a HAND on the fruit. The 2026-08-02 refocus narrowed it to
  // the origin question and moved the per-item ripeness checks onto
  // `produce_ripeness_by_item`, which is the hub a shopper looking for them actually
  // lands on — but a card that only argues about stickers is a lecture. It keeps the
  // "judge the piece" half of its own verdict as a physical action.
  assert.ok(
    p.buying_tips.some((t) => /\b(press|palm|heavier|weigh)\b/i.test(t)),
    'teaches an actual physical check'
  );

  // ...and the checks it handed over must have landed, or the refocus was a deletion.
  const byItem = perimeterKb.entries.find((e) => e.id === 'produce_ripeness_by_item');
  assert.ok(byItem, 'the by-item ripeness hub must exist');
  assert.ok(
    byItem.buying_tips.some((t) => /stem/i.test(t)),
    'the stem check moved to the by-item hub, it did not evaporate'
  );
  for (const alias of ['avocado', 'how to pick an avocado', 'cantaloupe', 'pineapple']) {
    assert.ok(byItem.aliases.includes(alias), `by-item hub did not absorb the alias "${alias}"`);
  }
});

/* ── The depth bar ───────────────────────────────────────────────────────────────
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
    ['is pre shredded cheese ok', 'cheese_real_vs_processed'],
    ['should i worry about arsenic in rice', 'rice_arsenic'],
    ['how do i buy real extra virgin olive oil', 'olive_oil_grades'],
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
