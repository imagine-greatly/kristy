// The path to an answer — unit tests. NO network, NO model.
//
// The Counter's third problem was reachability: the knowledge was good, the hierarchy
// was fixed, and getting to a specific answer was still a hunt. These pin the short
// path — the shortcuts that put the frequent questions one tap from the surface, the
// browse row that answers without a tap at all, and the cart tap that keeps the
// counter from being a dead-end reference book.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { perimeterKb, sectionIndex, sectionById, PERIMETER_SECTIONS, publicEntry } from './perimeter.js';

const entryById = (id) => (perimeterKb.entries || []).find((e) => e.id === id);

/* ── The shortcuts ─────────────────────────────────────────────────────────────── */

test('every counter surfaces the questions people actually ask at it', () => {
  for (const s of sectionIndex()) {
    assert.ok(s.shortcuts.length >= 3, `${s.id} surfaces only ${s.shortcuts.length} shortcuts`);
    assert.ok(s.shortcuts.length <= 4, `${s.id} surfaces ${s.shortcuts.length} — that is a list, not a shortcut row`);
  }
});

test('a shortcut points at a real entry that is browsable in that section', () => {
  // A shortcut carries no content of its own. If it could point anywhere, it would be
  // a second, unsourced index of the counter that drifts from the first.
  for (const s of sectionIndex()) {
    const reachable = new Set([...s.topics, ...s.labelTopics].map((t) => t.id));
    for (const sc of s.shortcuts) {
      assert.ok(entryById(sc.id), `${s.id}: shortcut "${sc.q}" points at a missing entry (${sc.id})`);
      assert.ok(reachable.has(sc.id), `${s.id}: shortcut "${sc.q}" leaves its own section`);
    }
  }
});

test('a shortcut is a question in the shopper\'s words, and carries the call with it', () => {
  for (const s of sectionIndex()) {
    for (const sc of s.shortcuts) {
      assert.ok(sc.q.length <= 42, `${s.id}: "${sc.q}" is too long for a chip`);
      // It is the shopper asking, so it is phrased as a question.
      assert.match(sc.q, /\?$/, `${s.id}: "${sc.q}" is not phrased as a question`);
      // And it arrives with the decision already attached, so the surface can show
      // the answer beside the question without a second fetch.
      assert.equal(sc.decision, entryById(sc.id).decision);
      assert.ok(sc.evidence_tier, `${sc.id} shortcut drops its tier`);
    }
  }
});

test('the shortcuts cover the questions the spec named, at the counter they belong to', () => {
  const has = (sectionId, entryId) =>
    sectionById(sectionId).shortcuts.some((sc) => sc.id === entryId);
  assert.ok(has('meat', 'beef_cuts_basics'), 'meat: which cut for X');
  assert.ok(has('meat', 'grassfed_vs_grassfinished'), 'meat: grass-fed vs finished');
  assert.ok(has('seafood', 'salmon_wild_vs_farmed'), 'fish: wild or farmed');
  assert.ok(has('seafood', 'mercury_by_fish'), 'fish: low-mercury');
  assert.ok(has('produce', 'organic_worth_it_by_type'), 'produce: organic worth it');
  assert.ok(has('produce', 'produce_ripeness_by_item'), 'produce: ripeness');
});

/* ── Taps to an answer ─────────────────────────────────────────────────────────── */

test('the fewest taps to a counter answer is one', () => {
  // Two paths, both one step from the Counter surface: type the question (the ask
  // path resolves it), or tap a shortcut, which opens its entry directly. Neither
  // passes through a section screen.
  const shortcutIds = sectionIndex().flatMap((s) => s.shortcuts.map((sc) => sc.id));
  assert.ok(shortcutIds.length >= 18, `only ${shortcutIds.length} one-tap answers on the surface`);
  for (const id of shortcutIds) {
    const e = publicEntry(entryById(id));
    // One tap has to land on a complete answer, not a stub.
    assert.ok(e.decision, `${id} opens without a decision`);
    assert.ok(e.why, `${id} opens without a why`);
    assert.ok(e.buying_tips.length >= 3, `${id} opens without a checklist`);
  }
});

test('a browse row answers without a tap at all', () => {
  // Section, then read. The row carries the call, so opening the topic is for the
  // depth rather than for the answer.
  for (const s of sectionIndex()) {
    for (const t of s.topics) {
      assert.ok(t.decision && t.decision.trim(), `${t.id} browses without its call`);
    }
  }
});

/* ── The counter fills the cart ────────────────────────────────────────────────── */

test('a shortcut answer can become a cart item in the same tap-and-tap', () => {
  // Tap the shortcut, tap the pick. Where an entry resolves to one honest grocery,
  // that pick is on the decision card itself — not under the depth.
  const withPicks = sectionIndex()
    .flatMap((s) => s.shortcuts)
    .map((sc) => publicEntry(entryById(sc.id)))
    .filter((e) => e.cart_pick);
  assert.ok(withPicks.length >= 6, `only ${withPicks.length} surfaced questions resolve to a grocery`);
  for (const e of withPicks) {
    assert.equal(typeof e.cart_pick, 'string');
    assert.doesNotMatch(e.cart_pick, /[$£€%]/, `${e.id} pick carries a price`);
  }
});

test('every counter still offers something to add, and the label section still does not', () => {
  for (const id of ['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry']) {
    assert.ok(sectionById(id).topics.some((t) => t.cart_pick), `${id} offers nothing to add`);
  }
  // A label term is not a grocery, so it never mints one.
  assert.ok(!sectionById('label_terms').topics.some((t) => t.cart_pick));
});

/* ── Shape ─────────────────────────────────────────────────────────────────────── */

test('shortcuts are additive: they never change a section\'s count or its topics', () => {
  for (const s of sectionIndex()) {
    const src = PERIMETER_SECTIONS.find((x) => x.id === s.id);
    assert.equal(s.count, s.topics.length, `${s.id} count drifted from its topics`);
    assert.equal(s.shortcuts.length, (src.shortcuts || []).length);
  }
});
