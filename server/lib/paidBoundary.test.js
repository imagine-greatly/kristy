// Counter cards are free in full. Personalization keeps its separate paid boundary.
// Shipped clients accept full cards without the optional teaser and lock fields.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEPTH_FIELDS, summarize, forViewer, projectEntry, projectAll } from './counterCards.js';
import { nonEmpty } from './testGuards.js';
import { lintCard } from './counterCardLint.js';
import { supabase } from './supabase.js';
import { familyForViewer, publicAisle, FAMILY_DEPTH_FIELDS } from './perimeter.js';
import { perimeterKb, publicEntry, questionEntries } from './perimeter.js';
import { loadCounterSectionRules } from './sectionRules.js';
import { anthropic } from './anthropic.js';
import { counterRouter } from '../routes/counter.js';

const CARDS = nonEmpty(projectAll(), 'projected counter cards', 70);
const ESSENTIALS = nonEmpty(CARDS.filter((c) => c.essential), 'essential cards', 8);
const NON_ESSENTIALS = nonEmpty(CARDS.filter((c) => !c.essential), 'non-essential cards', 60);
const CARD_FIELDS = nonEmpty(DEPTH_FIELDS, 'card depth fields', 7);

// Exercise the public GET route and optionalAuth, without a network or database.
function get(url, user) { return request(url, { user }); }

function request(url, { user, method = 'GET', body } = {}) {
  const parsed = new URL(url, 'http://localhost');
  const req = { method, url, headers: {}, query: Object.fromEntries(parsed.searchParams), user, body, ip: 'family-test' };
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(body) { resolve({ status: this.statusCode, body }); },
    };
    counterRouter.handle(req, res, (err) => reject(err || new Error(`No GET route for ${url}`)));
  });
}

test('all seven depth fields and tier_note are free on every card', () => {
  for (const card of CARDS) {
    const out = summarize(card);
    for (const field of CARD_FIELDS) assert.deepEqual(out[field], card[field], `${card.slug}: ${field}`);
    assert.equal(out.tier_note, card.tier_note);
  }
});

test('a guest receives the full depth of every non-essential card', () => {
  for (const card of NON_ESSENTIALS) {
    const out = forViewer(card, { premium: false, unlocked: false });
    for (const field of CARD_FIELDS) assert.deepEqual(out[field], card[field], `${card.slug}: ${field}`);
    assert.ok(out.locked === undefined || out.locked === false);
  }
});

test('every card tells a free reader what kind of claim it is', () => {
  for (const card of CARDS) {
    const out = forViewer(card);
    assert.ok(typeof out.tier_note === 'string' && out.tier_note.trim(), `${card.slug}: no tier sentence`);
  }
});

test('the tier sentence is at least five words, not the tier name', () => {
  const chipWords = /^(settled|credible concern|whole-food standard|time-tested)\.?$/i;
  for (const card of CARDS) {
    const note = String(card.tier_note || '').trim();
    assert.doesNotMatch(note, chipWords, `${card.slug}: tier sentence is a chip`);
    assert.notEqual(note.toLowerCase(), String(card.tier).toLowerCase());
    assert.ok(note.split(/\s+/).length >= 5, `${card.slug}: tier sentence is too short`);
  }
});

test('no two cards share a tier sentence, and none points at the tier', () => {
  const seen = new Set();
  for (const card of CARDS) {
    const note = String(card.tier_note || '').trim();
    assert.doesNotMatch(note, /\b(this|the)\s+tier\b/i, `${card.slug}: dangling tier reference`);
    assert.ok(!seen.has(note), `${card.slug}: duplicate tier sentence`);
    seen.add(note);
  }
});

test('the redirect stays free verbatim alongside the full depth', () => {
  for (const card of NON_ESSENTIALS) {
    const out = summarize(card);
    assert.ok('instead' in out, `${card.slug}: redirect missing`);
    assert.equal(out.instead, card.instead);
    assert.equal(out.why, card.why);
  }
});

test('a card that carries a redirect names a different thing, never a lesser version', () => {
  const withRedirect = nonEmpty(CARDS.filter((c) => String(c.instead || '').trim()), 'cards with redirects');
  for (const card of withRedirect) {
    const found = lintCard(card).filter((v) => v.code.startsWith('INSTEAD_'));
    assert.deepEqual(found, [], `${card.slug}: redirect fails lint`);
  }
});

test('essentials stay full for everyone', () => {
  for (const card of ESSENTIALS) {
    const out = forViewer(card);
    assert.ok(out.why, `${card.slug}: essential has no why`);
    assert.ok(out.locked === undefined || out.locked === false);
    assert.equal(out.essential_rank, card.essential_rank);
  }
});

test('a premium viewer receives the same full card as a guest', () => {
  for (const card of CARDS) {
    assert.deepEqual(forViewer(card, { premium: true }), forViewer(card));
    assert.ok(forViewer(card, { premium: true }).why, `${card.slug}: member has no why`);
  }
});

test('full and summary shapes omit teasers and retain full depth on every card', () => {
  for (const card of CARDS) {
    const stale = { ...card, locked: true, teaser: { look_for_first: null, faded_lengths: [] } };
    const shapes = nonEmpty(
      [forViewer(card), summarize(card), forViewer(stale), summarize(stale)],
      `${card.slug} wire shapes`, 4
    );
    for (const out of shapes) {
      assert.ok(!('teaser' in out), `${card.slug}: teaser must be absent`);
      assert.ok(out.locked === undefined || out.locked === false, `${card.slug}: card must be unlocked`);
      assert.ok('why' in out, `${card.slug}: missing why`);
      assert.ok('sources' in out, `${card.slug}: missing sources`);
      const { delta, ...freeCard } = card;
      assert.deepEqual(out, freeCard, `${card.slug}: existing full depth must be preserved`);
    }
  }
});

test('any card teaser satisfies the shipped Swift decoding contract', () => {
  // kristy-ios/Kristy/Networking/CounterModels.swift:177-193 requires String and [Int].
  for (const card of CARDS) {
    const shapes = nonEmpty([card, forViewer(card), summarize(card)], `${card.slug} contract shapes`, 3);
    for (const out of shapes) {
      if (!('teaser' in out)) continue;
      assert.equal(typeof out.teaser?.look_for_first, 'string', `${card.slug}: look_for_first must decode as String`);
      assert.ok(Array.isArray(out.teaser?.faded_lengths), `${card.slug}: faded_lengths must decode as [Int]`);
      assert.ok(out.teaser.faded_lengths.every(Number.isInteger), `${card.slug}: faded_lengths must contain integers`);
    }
  }
});

test('projectEntry carries the tier sentence onto every card it builds', () => {
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

test('a guest GETs a non-essential full card five times, including spent=3 and spent=4', async (t) => {
  t.mock.method(supabase, 'from', () => { throw new Error('Use the authored corpus fallback'); });
  const card = NON_ESSENTIALS[0];
  const reads = [];
  for (const spent of nonEmpty([0, 1, 2, 3, 4], 'five guest reads', 5)) {
    reads.push(await get(`/counter/cards/${card.slug}/full?spent=${spent}`));
  }
  for (const [index, { status, body }] of nonEmpty(reads, 'guest responses', 5).entries()) {
    assert.equal(status, 200, `guest read ${index + 1}`);
    assert.ok(body.card.why, `guest read ${index + 1}: missing why`);
    assert.ok(Array.isArray(body.card.sources), `guest read ${index + 1}: missing sources`);
    assert.deepEqual(body.card.sources, card.sources);
  }
  for (const { body } of nonEmpty(reads, 'unmetered responses', 5)) {
    assert.equal(body.spent, undefined);
    assert.equal(body.remaining, undefined);
  }
});

test('GET full and summary routes omit teasers and retain full depth on every card', async (t) => {
  t.mock.method(supabase, 'from', () => { throw new Error('Use the authored corpus fallback'); });
  // The route caps one request at 200 slugs; batch so every card is still asked for.
  const summary = { body: { cards: {} } };
  for (let i = 0; i < CARDS.length; i += 200) {
    const page = await get(`/counter/summaries?slugs=${CARDS.slice(i, i + 200).map((card) => card.slug).join(',')}`);
    assert.equal(page.status, 200);
    Object.assign(summary.body.cards, page.body.cards);
  }
  const summaries = nonEmpty(Object.values(summary.body.cards), 'summary route cards', CARDS.length);
  assert.equal(summaries.length, CARDS.length);
  for (const card of CARDS) {
    const full = await get(`/counter/cards/${card.slug}/full`);
    assert.equal(full.status, 200, `${card.slug}: full route status`);
    const shapes = nonEmpty([full.body.card, summary.body.cards[card.slug]], `${card.slug} route wire shapes`, 2);
    for (const out of shapes) {
      assert.ok(!('teaser' in out), `${card.slug}: teaser must be absent`);
      assert.ok(out.locked === undefined || out.locked === false, `${card.slug}: card must be unlocked`);
      assert.ok('why' in out, `${card.slug}: missing why`);
      assert.ok('sources' in out, `${card.slug}: missing sources`);
      assert.equal(out.why, card.why);
      assert.deepEqual(out.sources, card.sources);
    }
  }
});

const FAMILY = {
  id: 'fam_boundary', kind: 'family', title: 'Fruit', category: 'aisle_produce', decision: 'Choose intact fruit.',
  why: 'Paid explanation.', buying_tips: ['Paid tip.'], watch_out: ['Paid warning.'],
  shopper_questions: ['Paid question?'], season_storage: 'Paid storage.',
  sources: [{ name: 'Paid source', url: 'https://example.invalid/source' }], science: 'Paid science.', pick_steps: ['Paid step.'],
  extra: 'Never serialized', delta: 'Never serialized on a family',
};
const AISLE = {
  id: 'aisle_produce', kind: 'aisle', title: 'Produce', category: 'aisle_produce', decision: 'Inspect whole produce.',
  buying_tips: ['Check skin.', 'Check stems.', 'Skip leaks.'], why: 'Not an aisle response field.', delta: 'Not free.',
};
const FREE_FAMILY_KEYS = ['id', 'kind', 'title', 'section', 'rule'].sort();

test('viewer serializers omit paid keys for guests/free users and allow only authored paid family depth', () => {
  const card = { slug: 'fixture', family: FAMILY.id, delta: 'Item exception.', why: 'Old free depth.' };
  for (const options of [undefined, { premium: false }, { premium: true }]) {
    const out = forViewer(card, options);
    assert.equal(out.family, FAMILY.id);
    assert.equal(out.why, card.why);
    assert.equal(Object.hasOwn(out, 'delta'), options?.premium === true);
    const family = familyForViewer(FAMILY, options);
    for (const field of FAMILY_DEPTH_FIELDS) assert.equal(Object.hasOwn(family, field), options?.premium === true, field);
    assert.ok(!('extra' in family));
    assert.ok(!('delta' in family));
    if (!options?.premium) assert.deepEqual(Object.keys(family).sort(), FREE_FAMILY_KEYS);
  }
  assert.ok(!('delta' in summarize(card)));
  assert.equal(card.delta, 'Item exception.', 'serialization must not mutate shared cards');
  assert.deepEqual(Object.keys(publicEntry(FAMILY)).sort(), FREE_FAMILY_KEYS);
  assert.ok(!('delta' in publicEntry({ id: 'item', family: FAMILY.id, delta: 'Secret.' })));
  assert.deepEqual(publicEntry(AISLE), publicAisle(AISLE));
  assert.ok(!('why' in publicAisle(AISLE)));
});

test('family and aisle routes enforce guest/free/paid boundaries and canonical briefings', async (t) => {
  perimeterKb.entries.push(FAMILY, AISLE);
  t.after(() => perimeterKb.entries.splice(perimeterKb.entries.indexOf(FAMILY), 2));
  let subscriptionReads = 0;
  t.mock.method(supabase, 'from', (table) => {
    assert.equal(table, 'subscriptions');
    subscriptionReads++;
    return { select: () => ({ eq: (_, id) => ({ maybeSingle: async () => ({ data: id === 'paid'
      ? { status: 'active', current_period_end: '2999-01-01' } : null, error: null }) }) }) };
  });
  for (const id of [null, 'free', 'paid']) {
    const user = id ? { id } : undefined;
    const before = subscriptionReads;
    const response = await get(`/counter/families/${FAMILY.id}?premium=true`, user);
    assert.equal(response.status, 200);
    assert.equal(subscriptionReads - before, user ? 1 : 0);
    const family = response.body.family;
    if (id !== 'paid') assert.deepEqual(Object.keys(family).sort(), FREE_FAMILY_KEYS);
    for (const field of FAMILY_DEPTH_FIELDS) {
      assert.equal(Object.hasOwn(family, field), id === 'paid', `${id}: ${field}`);
    }
    const aisles = await get('/counter/aisles', user);
    assert.deepEqual(aisles.body.aisles.find((e) => e.id === AISLE.id), publicAisle(AISLE));
    assert.equal((await get('/counter/families/aisle_produce', user)).status, 404);
  }
  const rules = loadCounterSectionRules([AISLE], [{ section: 'produce', rule: 'Old rule', checks: [] }]);
  assert.deepEqual(rules, [{ section: 'produce', rule: AISLE.decision, checks: AISLE.buying_tips }]);
  const routeRules = await get('/counter/section-rules');
  assert.equal(routeRules.body.rules.find((rule) => rule.section === 'produce').rule, AISLE.decision);
});

test('all item routes filter delta with one server entitlement lookup, including ask', async (t) => {
  const fixture = {
    slug: 'boundary_item', kind: 'shelf', section: 'produce', headline: 'Choose intact fruit.',
    family: FAMILY.id, delta: 'Choose softer fruit.', why: 'Existing free item depth.',
    sources: [], essential: true, essential_rank: 1, use_count: 0,
  };
  let subscriptionReads = 0;
  t.mock.method(supabase, 'from', (table) => {
    if (table === 'subscriptions') {
      subscriptionReads++;
      return { select: () => ({ eq: (_, id) => ({ maybeSingle: async () => ({ data: id === 'paid'
        ? { status: 'active', current_period_end: '2999-01-01' } : null, error: null }) }) }) };
    }
    const query = {
      select: () => query, eq: () => query, limit: () => query, order: () => query, update: () => query,
      single: async () => ({ data: { use_count: 0 }, error: null }),
      then: (resolve) => Promise.resolve({ data: [{ ...fixture, do_line: 'Check the skin.' }], error: null }).then(resolve),
    };
    return query;
  });
  // Ask uses the curated in-memory object; annotate it only for this test and restore it.
  const asked = questionEntries().find((entry) => entry.id === 'egg_labels');
  assert.ok(asked);
  const original = { ...asked };
  Object.assign(asked, { family: FAMILY.id, delta: fixture.delta });
  t.after(() => { for (const key of Object.keys(asked)) delete asked[key]; Object.assign(asked, original); });
  t.mock.method(anthropic.messages, 'create', async () => ({ content: [{ text: '{"answer":"Fixture answer.","refinement":null}' }] }));
  const routes = [
    ['/counter/cards', (b) => b.cards[0]],
    ['/counter/essentials', (b) => b.cards[0]],
    ['/counter/sections/produce', (b) => b.cards[0]],
    ['/counter/cards/boundary_item', (b) => b],
    ['/counter/cards/boundary_item/full', (b) => b.card],
    ['/counter/summaries?slugs=boundary_item', (b) => b.cards.boundary_item],
    ['/counter/ask', (b) => b.card],
  ];
  for (const id of [null, 'free', 'paid']) {
    for (const [url, extract] of routes) {
      const before = subscriptionReads;
      const response = await request(url, {
        user: id ? { id } : undefined,
        method: url.endsWith('/ask') ? 'POST' : 'GET',
        body: { query: 'eggs', premium: true },
      });
      assert.equal(response.status, 200, `${id}: ${url}`);
      assert.equal(subscriptionReads - before, id ? 1 : 0, `${id}: ${url} entitlement lookup count`);
      const card = extract(response.body);
      assert.ok(card, `${id}: ${url}`);
      assert.equal(card.family, FAMILY.id, url);
      assert.ok(card.why, url);
      assert.equal(Object.hasOwn(card, 'delta'), id === 'paid', `${id}: ${url}`);
      if (id === 'paid') assert.equal(card.delta, fixture.delta);
      assert.ok(!('entries' in response.body), 'raw ask entries never reach the client');
    }
  }
});
