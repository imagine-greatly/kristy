// Counter cards are free in full. Personalization keeps its separate paid boundary.
// Shipped clients accept full cards without the optional teaser and lock fields.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEPTH_FIELDS, summarize, forViewer, projectEntry, projectAll } from './counterCards.js';
import { nonEmpty } from './testGuards.js';
import { lintCard } from './counterCardLint.js';
import { supabase } from './supabase.js';
import { counterRouter } from '../routes/counter.js';

const CARDS = nonEmpty(projectAll(), 'projected counter cards', 70);
const ESSENTIALS = nonEmpty(CARDS.filter((c) => c.essential), 'essential cards', 8);
const NON_ESSENTIALS = nonEmpty(CARDS.filter((c) => !c.essential), 'non-essential cards', 60);
const CARD_FIELDS = nonEmpty(DEPTH_FIELDS, 'card depth fields', 7);

// Exercise the public GET route and optionalAuth, without a network or database.
function get(url, user) {
  const parsed = new URL(url, 'http://localhost');
  const req = { method: 'GET', url, headers: {}, query: Object.fromEntries(parsed.searchParams), user };
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
      assert.deepEqual(out, card, `${card.slug}: full card must be preserved`);
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
