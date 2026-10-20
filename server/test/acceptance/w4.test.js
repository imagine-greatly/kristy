// W4: warmth is a tone edit, with a corpus-level repetition ratchet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import before from './w4.before.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };
import tips from '../../lib/sectionRules.json' with { type: 'json' };
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { beforeTwoLine, beforeConcern, preCleanPick, preCleanPick2, preCleanPick3, preCleanPick4, preCleanPick5, preCleanPick6, preCleanPick7, preCleanPick9, preCleanPick8 } from './twoLinePin.js';
kb.entries = kb.entries.map((e) => preCleanPick(preCleanPick2(preCleanPick3(preCleanPick4(preCleanPick5(preCleanPick6(preCleanPick7(preCleanPick9(e)))))))));

// Independent of the production predicate: a narrowed scope cannot hide cards.
const categories = new Set(['beef', 'poultry', 'poultry_eggs', 'meat_counter', 'pork', 'produce']);
const breads = new Set(['sandwich_bread', 'sourdough', 'bagels', 'tortillas', 'sprouted_grain_bread', 'gluten_free_bread', 'bread_aisle']);
const pilot = nonEmpty(kb.entries.filter((e) => (categories.has(e.category) && e.decision) || breads.has(e.id)), 'W4 live PILOT', 60);
nonEmpty(before, 'W4 before PILOT', 60);
const frozen = ['id', 'title', 'aliases', 'asked_as', 'category', 'question', 'cart_pick', 'sources', 'evidence_tier', 'tier_note', 'eyebrow_short', 'labels_decoded', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'detail'];
const changed = ['decision', 'why', 'kristy_take', 'instead', 'short_answer'];
const voice = ['decision', 'why', 'kristy_take'];
const codes = (cards) => lint.lintCorpus(cards).violations.filter((v) => v.code === 'OPENER_REPEATED');

test('W4 (a) four normalized why openers fail; three pass', () => {
  const rows = ['“YOU can check” the label.', 'You, can check another label.', 'you can check the package.', 'YOU CAN CHECK a seal.'].map((why, i) => ({ id: `w4_${i}`, category: 'beef', decision: `Beef cut ${i}.`, why }));
  const hits = codes(rows);
  assert.equal(hits.length, 1);
  assert.equal(hits[0].field, 'why');
  assert.equal(hits[0].opener, 'you can check');
  assert.deepEqual(new Set(hits[0].ids), new Set(rows.map((e) => e.id)));
  assert.deepEqual(codes(rows.slice(0, 3)), []);
});

test('W4 opener rule covers every field, separates fields and respects scope', () => {
  for (const field of voice) {
    const rows = Array.from({ length: 4 }, (_, i) => ({ id: `scope_${i}`, category: 'produce', decision: `Pick ${i} fruit.`, [field]: 'You can check each label.' }));
    assert.equal(codes(rows).filter((v) => v.field === field).length, 1, field);
    assert.deepEqual(codes(rows.map((e) => ({ ...e, category: 'seafood' }))), []);
    assert.deepEqual(codes([...rows.slice(0, 3), rows[0]]), [], 'count distinct cards');
  }
  const mixed = Array.from({ length: 4 }, (_, i) => ({ id: `mixed_${i}`, category: 'beef', decision: `Beef cut ${i}.`, [i < 2 ? 'why' : 'kristy_take']: 'You can check the label.' }));
  assert.deepEqual(codes(mixed), []);
});

test('W4 (b) live PILOT passes opener repetition and all existing card lints', () => {
  assert.equal(typeof lint.lintOpenerRepetition, 'function');
  assert.deepEqual(pilot.filter(lint.isWarmthPilot).map((e) => e.id), pilot.map((e) => e.id));
  assert.deepEqual(lint.lintOpenerRepetition(pilot), []);
  const cards = pilot.map((e) => e.kind === 'pick' ? e : projectEntry(e, { doLine: doLines[e.id] }));
  assert.deepEqual(codes(cards), []);
  for (const [i, e] of pilot.entries()) {
    assert.deepEqual(lint.lintCard(cards[i]), [], e.id);
    assert.deepEqual(lint.readability(e), [], e.id);
    // Audit the authored W4 prose; projection also appends unchanged short_answer sentences.
    assert.deepEqual(lint.voiceTics({ ...cards[i], why: e.why }), [], e.id);
    assert.deepEqual(lint.lintPickSteps(e), [], e.id);
    assert.deepEqual(lint.lintCulinaryAim(e), [], e.id);
    assert.deepEqual(lint.lintRepeatedClaim(e), [], e.id);
    assert.ok(lint.words(e.decision) <= 12, `${e.id}: decision exceeds 12 words`);
  }
  assert.deepEqual(lint.lintSections(tips, pilot), []);
  assert.deepEqual(lint.lintCorpus(cards).violations, []);
});

test('W4 (c/e) PILOT identities, locked fields, numbers and voice survive', () => {
  assert.deepEqual(pilot.map((e) => e.id), before.map((e) => e.id));
  for (const old of before) {
    const live = pilot.find((e) => e.id === old.id);
    // The two-line rewrite (2026-10-17) owns buying_tips (and egg sources) now: twoLinePin.test.js.
    const pre = beforeTwoLine(beforeConcern(preCleanPick8(live), { copy: true }));
    const now = { ...pre, decision: live.decision };
    for (const field of frozen) assert.equal(JSON.stringify(now[field]), JSON.stringify(old[field]), `${old.id}.${field}`);
    const strip = (e) => Object.fromEntries(Object.entries(e).filter(([f]) => !changed.includes(f)));
    assert.deepEqual(strip(now), strip(old), `${old.id}: only authorized fields change`);
    const numbers = (s) => String(s || '').match(/\d+(?:\.\d+)?%?/g) || [];
    const retained = new Set([...voice, 'short_answer', 'detail'].flatMap((f) => numbers(now[f])));
    for (const n of voice.flatMap((f) => numbers(old[f]))) assert.ok(retained.has(n), `${old.id}: lost ${n}`);
    for (const field of changed) {
      if (old[field]) assert.ok(now[field]?.trim(), `${old.id}.${field} emptied`);
      assert.doesNotMatch(now[field] || '', /\b(?:I|me|my|we|our)\b|!/i, `${old.id}.${field}`);
    }
  }
});

test('W4 (d) no sentence repeats within or across PILOT why/kristy_take', () => {
  const holders = new Map();
  for (const e of pilot) for (const field of ['why', 'kristy_take']) for (const sentence of lint.sentences(e[field])) {
    const key = sentence.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    assert.ok(!holders.has(key), `${e.id}.${field} repeats ${holders.get(key)}: ${sentence}`);
    holders.set(key, `${e.id}.${field}`);
  }
  nonEmpty([...holders], 'W4 actual sentences', 60);
});

test('W4 PILOT gives a food reason instead of the whole-food standard label', () => {
  for (const entry of pilot) for (const field of voice) {
    assert.doesNotMatch(entry[field] || '', /whole-food standard/i, `${entry.id}.${field}`);
    assert.doesNotMatch(entry[field] || '', /\bthe standard\b/i, `${entry.id}.${field}: give the actual reason`);
  }
});
