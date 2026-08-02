// Decision-first — unit tests. NO network, NO model.
//
// Every topic opens with the DECISION and a one-line WHY, and the sourced depth sits
// one tap behind it. These pin the inversion so it cannot decay back into an essay:
// the budget that keeps the default view readable in about five seconds, the voice
// rules that apply to every line Kristy speaks, and the claim lock, which did NOT
// widen to accommodate two new fields.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { perimeterKb, publicEntry, sanitizeForModel, buildAnswerInput, sectionIndex } from './perimeter.js';

const entries = perimeterKb.entries || [];

/* ── Every topic leads with a call ─────────────────────────────────────────────── */

test('every entry carries a decision and a one-line why', () => {
  for (const e of entries) {
    assert.ok(typeof e.decision === 'string' && e.decision.trim(), `${e.id} has no decision`);
    assert.ok(typeof e.why === 'string' && e.why.trim(), `${e.id} has no why`);
  }
});

test('the decision is glanceable and the why is one line', () => {
  // The word budget IS the feature. A default view longer than this is the essay
  // coming back in, and in a store nobody reads the essay.
  for (const e of entries) {
    assert.ok(e.decision.length <= 90, `${e.id}: decision is ${e.decision.length} chars — too long to glance`);
    assert.ok(e.why.length <= 120, `${e.id}: why is ${e.why.length} chars — that is a paragraph`);
    // A call, not a discussion. Two sentences at most.
    const sentences = e.decision.split(/[.!?]+\s/).filter(Boolean).length;
    assert.ok(sentences <= 3, `${e.id}: decision runs ${sentences} sentences`);
  }
});

test('the default view stays inside the five-second budget', () => {
  // What renders before any tap: decision + why + the first three buying tips.
  const WORDS = (s) => String(s).trim().split(/\s+/).length;
  for (const e of entries) {
    const above = WORDS(e.decision) + WORDS(e.why) + (e.buying_tips || []).slice(0, 3).reduce((n, t) => n + WORDS(t), 0);
    assert.ok(above <= 90, `${e.id}: ${above} words above the fold`);
  }
});

/* ── The voice, on the two new lines ───────────────────────────────────────────── */

test('no first person anywhere in a decision or a why (VOICE_SPEC)', () => {
  // Kristy is a standard, not a person narrating. The decision is the flattest,
  // most quotable copy in the product, so it is the easiest place for an "I'd" to
  // creep back in.
  const FIRST_PERSON = /\b(i|i'?m|i'?ll|i'?d|i'?ve|me|my|mine|myself|let me)\b/i;
  for (const e of entries) {
    assert.doesNotMatch(e.decision, FIRST_PERSON, `${e.id} decision speaks in first person`);
    assert.doesNotMatch(e.why, FIRST_PERSON, `${e.id} why speaks in first person`);
  }
});

test('no em-dash asides, and no price, in a decision or a why', () => {
  for (const e of entries) {
    for (const [field, text] of [['decision', e.decision], ['why', e.why]]) {
      assert.doesNotMatch(text, /—/, `${e.id} ${field} uses an em-dash aside`);
      assert.doesNotMatch(text, /[$£€]|\bdollars?\b|\bcents?\b/i, `${e.id} ${field} quotes a price`);
    }
  }
});

test('no decision or why claims a health outcome, in either direction', () => {
  // The no-treatment rule is absolute and symmetric across the whole perimeter. It
  // applies with the most force here, because this is the line a shopper actually
  // reads and repeats.
  const OUTCOME =
    /\b(cures?|heals?|treats?|prevents?|reverses?|detox\w*|remed(y|ies)|immunity|diagnos\w*|causes? (cancer|disease|diabetes))\b/i;
  for (const e of entries) {
    assert.doesNotMatch(e.decision, OUTCOME, `${e.id} decision makes a health-outcome claim`);
    assert.doesNotMatch(e.why, OUTCOME, `${e.id} why makes a health-outcome claim`);
  }
});

test('a contested call still names the standard rather than asserting science', () => {
  // The tier chip renders beside the decision, so a reader always sees WHICH kind of
  // claim it is. On the entries where the distinction does the most work, the words
  // carry it too.
  for (const id of ['salmon_wild_vs_farmed', 'beef_grassfed_vs_grainfed', 'milk_processing']) {
    const e = entries.find((x) => x.id === id);
    assert.equal(e.evidence_tier, 'kristys_standard', `${id} should be a standard, not settled`);
    const text = `${e.decision} ${e.why}`.toLowerCase();
    assert.match(text, /whole-food standard|not settled science|preference|not a health verdict|not a claim/, `${id} states a contested call as fact`);
  }
});

/* ── The depth is demoted, not deleted ─────────────────────────────────────────── */

test('nothing was removed to make room for the decision', () => {
  // Re-ranking, not rewriting. Every field the card used to open with is still on
  // the entry, and still reaches the client — it just renders behind a tap.
  for (const e of entries) {
    for (const f of ['short_answer', 'detail', 'kristy_take', 'evidence_tier', 'sources', 'buying_tips']) {
      assert.ok(e[f] && e[f].length, `${e.id} lost ${f}`);
    }
  }
  const pub = publicEntry(entries.find((e) => e.id === 'salmon_wild_vs_farmed'));
  for (const f of ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'evidence_tier', 'evidence_framing', 'sources', 'buying_tips', 'labels_decoded', 'cart_pick']) {
    assert.ok(pub[f], `the full read is missing ${f}`);
  }
});

test('a browse row carries the decision, so the list itself answers', () => {
  // The section index used to show the short answer, which meant three lines of
  // background per row and a tap needed on every one to find the call.
  const topics = sectionIndex().flatMap((s) => [...s.topics, ...s.labelTopics]);
  assert.ok(topics.length > 0);
  for (const t of topics) {
    assert.ok(t.decision && t.decision.trim(), `${t.id} browses without its decision`);
    assert.ok(t.why && t.why.trim(), `${t.id} browses without its why`);
  }
});

/* ── The claim lock did not widen ──────────────────────────────────────────────── */

test('the model still sees exactly the seven allowed fields', () => {
  // decision and why are compressions of short_answer and kristy_take, which the
  // model already has. Passing them would buy nothing and widen the whitelist, so
  // they are deliberately absent.
  const ALLOWED = ['title', 'short_answer', 'detail', 'evidence_tier', 'buying_tips', 'labels_decoded', 'kristy_take'];
  const e = entries.find((x) => x.id === 'salmon_wild_vs_farmed');
  assert.deepEqual(Object.keys(sanitizeForModel(e)).sort(), [...ALLOWED].sort());
  assert.ok(!('decision' in sanitizeForModel(e)));
  assert.ok(!('why' in sanitizeForModel(e)));
});

test('a decision can never be minted by the model', () => {
  // Same guarantee cart_pick has: authored in the KB, never in the payload, so there
  // is no path by which a generated answer invents the call a shopper acts on.
  const e = entries.find((x) => x.id === 'beef_cuts_basics');
  const blob = JSON.stringify(
    buildAnswerInput({ question: 'which cut for stew', focuses: [], hardLines: [], constraints: [], entries: [e] })
  );
  assert.ok(!blob.includes(e.decision), 'the decision reached the model payload');
  assert.ok(!blob.includes(e.why), 'the why reached the model payload');
});

/* ── The decisions the spec called for, by name ────────────────────────────────── */

test('the three worked examples read as calls, not background', () => {
  const byId = (id) => entries.find((e) => e.id === id);
  // "Which cut for stew" → the cut, first word.
  assert.match(byId('beef_cuts_basics').decision, /^Chuck\./);
  // "Wild vs farmed salmon" → the call and nothing else. This used to read "Wild if it
  // is in reach. Farmed or nothing, buy the farmed", which is two verdicts where the
  // second cancels the first. Under the one-verdict rule the fallback lives in
  // watch_out, and it may never climb back into the headline.
  assert.match(byId('salmon_wild_vs_farmed').decision, /^Wild\./);
  // "Is organic worth it" → where it earns it and where it does not.
  assert.match(byId('organic_worth_it_by_type').decision, /^Organic on thin-skinned/);
});
