// Offline regression of the real counter and list doors; expectations are authored,
// not inferred from whichever entry happens to win retrieval.
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from '../lib/testGuards.js';
import { inScope } from '../lib/counterScope.js';
import { scoreEntries, scorePool, publicEntry } from '../lib/perimeter.js';
import { answerCounterQuestion, NO_READ } from '../lib/counterAskPipeline.js';
import { attachCards, cardForItem, entryById, matchItemToCard, matchItemToPick } from '../lib/listMatch.js';
import { supabase } from '../lib/supabase.js';
import { anthropic } from '../lib/anthropic.js';

const QUERIES = nonEmpty([
  ['cereal', 'breakfast_cereal'],
  ['granola', 'breakfast_cereal'],
  ['oatmeal', 'oats_steelcut_rolled_instant'],
  ['turkey', 'turkey_whole'],
  ['ground turkey', 'ground_turkey'],
  ['deli turkey', 'deli_meat_uncured'],
  ['chicken breast', 'chicken_breast'],
  ['bacon', 'bacon'],
  ['bread', 'sandwich_bread'],
  ['sourdough', 'sourdough'],
  ['pretzel bread', 'pretzel_bread'],
  ['whole wheat bread', 'sandwich_bread'],
  ['bagels', 'bagels'],
  ['tortillas', 'tortillas'],
  ['pasta', 'pasta_dry'],
  ['rice', 'rice_arsenic'],
  ['peanut butter', 'nut_butter_ingredients'],
  ['yogurt', 'yogurt_plain_vs_flavored'],
  ['milk', 'whole_vs_reduced_fat_milk'],
  ['oat milk', 'oat_milk'],
  ['cheese', 'cheese_real_vs_processed'],
  ['eggs', 'egg_labels'],
  ['butter', 'grassfed_butter'],
  ['olive oil', 'olive_oil_grades'],
  ['salmon', 'salmon_wild_vs_farmed'],
  ['canned tuna', 'canned_tuna'],
  ['apples', 'produce_apples_pears'],
  ['bananas', 'organic_worth_it_by_type'],
  ['spinach', 'organic_worth_it_by_type'],
  ['frozen vegetables', 'frozen_vs_fresh_produce'],
  ['chips', 'miss'],
  ['crackers', 'miss'],
  ['cookies', 'miss'],
  ['ice cream', 'ice_cream'], // K19 covers it (admin ruling 2026-10-06).
  ['juice', 'miss', 'pick_juice'],
  ['soda', 'miss'],
  ['coffee', 'coffee_beans'],
  ['protein bar', 'miss'],
  ['hummus', 'miss'],
  ['salsa', 'miss'],
  ['ketchup', 'miss'],
  ['salad dressing', 'miss'],
  ['honey', 'honey_adulteration'],
  ['maple syrup', 'miss'],
  ['hot dogs', 'hot_dogs'],
  ['frozen pizza', 'miss'],
  ['baby food', 'miss'],
  ['kombucha', 'kombucha'], // K20 admin ruling: pinned gap now covered by the kombucha card.
], '48 weekly grocery queries', 48);
assert.equal(QUERIES.length, 48);

// Reads/counts/gap logging stay in memory, and an accidental model or network call
// fails loudly. The pipeline still runs its real scope/retrieval/projection logic.
const offline = {
  from() {
    let chain;
    chain = new Proxy({}, {
      get: (_, key) => key === 'then'
        ? (resolve) => Promise.resolve({ data: [], error: null }).then(resolve)
        : () => chain,
    });
    return chain;
  },
};
mock.method(supabase, 'from', offline.from);
mock.method(globalThis, 'fetch', () => { throw new Error('Probe must stay offline'); });
const model = mock.method(anthropic.messages, 'create', () => { throw new Error('Probe must not call a model'); });

for (const query of nonEmpty([
  'taylor swift', 'bitcoin', 'hello', 'weather tomorrow', 'stock prices',
  'car insurance', 'iphone charger', 'protein bar', // K20 admin ruling: kombucha now matches; protein bar is a pinned bare miss (:51), bare:true, in no K plan.
], 'bare misses that must never generate', 8)) {
  test(`bare ask miss never generates: ${query}`, async () => {
    const generator = mock.fn(async () => ({ card: null, attempts: [], reason: 'generator_called' }));
    const modelCalls = model.mock.callCount();
    const out = await answerCounterQuestion({
      query, client: offline, ip: `bare-probe-${query}`, allowGeneration: true, generator,
    });
    assert.equal(generator.mock.callCount(), 0, `${query}: no generateCard`);
    assert.equal(model.mock.callCount(), modelCalls, `${query}: no model`);
    assert.deepEqual(inScope(query), { ok: true, bare: true });
    assert.equal(out.card, null);
    assert.equal(out.matched, false);
    assert.equal(out.line, NO_READ);
    assert.equal(out.reason, 'generation_disabled');
  });
}

// K20 admin ruling: kombucha now matches a card.
test('phrased grocery miss reaches the injected generator', async () => {
  const generator = mock.fn(async () => ({ card: null, attempts: [], reason: 'insufficient' }));
  const modelCalls = model.mock.callCount();
  const out = await answerCounterQuestion({
    query: 'how do I choose baby food', client: offline, ip: 'phrased-probe', generator,
  });
  assert.equal(generator.mock.callCount(), 1);
  assert.equal(generator.mock.calls[0].arguments[0].query, 'how do I choose baby food');
  assert.equal(model.mock.callCount(), modelCalls);
  assert.equal(out.card, null);
  assert.equal(out.reason, 'insufficient');
});

for (const [query, counterExpected, listExpected = counterExpected] of QUERIES) {
  test(`weekly probe: ${query}`, async () => {
    assert.equal(inScope(query).ok, true, `${query}: never a scope rejection`);
    const scored = scoreEntries(query, 3);
    // This is also the legacy perimeter route's deterministic response path.
    const entries = scored.map(({ entry }) => publicEntry(entry));
    assert.equal(entries[0]?.id ?? 'miss', counterExpected, `${query}: perimeter`);
    const out = await answerCounterQuestion({ query, client: offline, allowGeneration: false });
    assert.notEqual(out.out_of_scope, true);
    assert.equal(out.card?.slug ?? 'miss', counterExpected, `${query}: counter card`);
    assert.equal(out.matched, counterExpected !== 'miss', `${query}: honest hit/miss`);
    const row = attachCards({ items: [{ name: query, source: 'user' }] }, { log: false }).items[0];
    assert.equal(row.cardSlug ?? row.pickId ?? 'miss', listExpected, `${query}: list`);
  });
}

test('named types cannot return a different cut, form or state, including cart picks', () => {
  const breast = scoreEntries('chicken breast', 100).map(({ entry }) => publicEntry(entry));
  assert.ok(!breast.some((e) => e.id === 'chicken_cuts_basics'));
  assert.ok(!breast.some((e) => /thigh|whole chicken/i.test(e.cart_pick ?? '')));
  assert.notEqual(matchItemToCard('chicken breast')?.slug, 'chicken_cuts_basics');
  assert.equal(cardForItem({ name: 'chicken breast', perimeterId: 'chicken_breast' })?.slug, 'chicken_breast');
  assert.equal(cardForItem({ name: 'chicken breast', perimeterId: 'chicken_cuts_basics' })?.slug, 'chicken_breast', 'veto the thighs id, then retrieve the breast owner');
  assert.equal(matchItemToPick('chicken breast'), null);
  assert.ok(!scoreEntries('canned tuna', 100).some(({ entry }) => entry.id === 'fish_freshness_at_counter'));
  assert.notEqual(matchItemToCard('canned tuna')?.slug, 'fish_freshness_at_counter');

  // Deliberately overbroad aliases prove a veto rather than today's accidental miss.
  const fixtures = nonEmpty([
    ['pretzel bread', { id: 'sourdough', title: 'Sourdough bread', aliases: ['bread'], category: 'bulk_pantry', decision: 'Choose sourdough bread.', cart_pick: 'Sourdough bread' }],
    ['ground turkey', { id: 'whole_turkey', title: 'Whole turkey', aliases: ['turkey'], category: 'poultry', decision: 'Choose a whole turkey.', cart_pick: 'Whole turkey' }],
    ['tinned salmon', entryById('fish_freshness_at_counter')],
    ['canned salmon', entryById('salmon_wild_vs_farmed')],
    ['tinned chicken', entryById('air_chilled_chicken')],
    ['chicken breast', { ...entryById('chicken_cuts_basics'), id: 'pick_thighs', kind: 'pick' }],
  ], 'type veto fixtures');
  for (const [query, entry] of fixtures) {
    assert.deepEqual(scorePool(query, [entry]), [], query);
    assert.equal(matchItemToPick(query, [{ ...entry, kind: 'pick' }]), null, query);
  }
  assert.ok(!scoreEntries('pretzel bread', 100).some(({ entry }) => /sourdough/i.test(entry.id)));
});

test('type veto preserves an exact type and an explicit comparison', () => {
  const fixtures = nonEmpty([
    ['chicken thighs', entryById('chicken_cuts_basics')],
    ['thighs or breasts', entryById('chicken_cuts_basics')],
    ['whole chicken', entryById('air_chilled_chicken')],
    ['canned light tuna', entryById('mercury_by_fish')],
    ['dried beans', entryById('beans_dried_vs_canned')],
    ['pretzel bread', { id: 'pretzel', title: 'Pretzel bread', aliases: ['pretzel bread'], category: 'bulk_pantry', decision: 'Choose pretzel bread.', cart_pick: 'Pretzel bread' }],
    ['ground turkey', { id: 'ground_turkey', title: 'Ground turkey', aliases: ['ground turkey'], category: 'poultry', decision: 'Choose ground turkey.', cart_pick: 'Ground turkey' }],
  ], 'supported types and comparisons');
  for (const [query, entry] of fixtures) {
    assert.equal(scoreEntries(query, 3, [entry])[0]?.entry.id, entry.id, query);
  }
});

test('bare retrieval uses one unambiguous longer buying alias, never a substring or title coincidence', () => {
  const owner = { id: 'milk_owner', title: 'Milk', aliases: [], asked_as: ['which milk should i buy'] };
  const hit = scoreEntries('milk', 3, [owner])[0];
  assert.equal(hit?.entry.id, owner.id);
  assert.ok(hit.aliasScore > 0);
  assert.deepEqual(scoreEntries('oat milk', 3, [owner]), []);
  assert.deepEqual(scoreEntries('milk', 3, [{ ...owner, asked_as: [] }]), []);
  assert.deepEqual(scoreEntries('milk', 3, [owner, { ...owner, id: 'other_owner' }]), []);
  assert.equal(matchItemToPick('milk carton')?.id, 'pick_milk');
  assert.equal(matchItemToPick('carton of milk')?.id, 'pick_milk');
});
