// IC-3b: produce fronts (skin rule) and the new Bananas card (.pipeline/specs/ic-3b.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, sentences, words, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
// C7 baseline: 8d12647 (ic-3a HEAD), so sources ic-3a moved in by fold do not read as new here.
const PRE = JSON.parse(execFileSync('git', ['show', '8d12647:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded', 'cart_pick'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const ARCHIVE = readdirSync(join(ROOT, 'docs/sources/item-cards')).filter((f) => f.endsWith('.md'))
  .map((f) => readFileSync(join(ROOT, 'docs/sources/item-cards', f), 'utf8')).join('\n');
const BATCH = ['organic_worth_it_by_type', 'berries_picking', 'produce_ripeness_by_item', 'produce_apples_pears', 'produce_citrus',
  'produce_peppers', 'produce_leafy_greens', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic',
  'produce_green_beans', 'produce_mushrooms', 'produce_stone_fruit', 'produce_bananas', 'sprouts_raw',
  'precut_produce_tradeoffs', 'produce_seasonality', 'frozen_vs_fresh_produce'];
const KIND = {
  produce_apples_pears: 'organic', produce_leafy_greens: 'organic', produce_stone_fruit: 'organic', berries_picking: 'organic',
  produce_peppers: 'organic', produce_green_beans: 'organic', produce_root_vegetables: 'both', produce_brassicas: 'conventional',
  produce_onions_garlic: 'conventional', produce_mushrooms: 'conventional', produce_bananas: 'conventional', produce_citrus: 'conventional',
};
const headCol = (id) => (review.match(new RegExp('^\\| `' + id + '` \\| [^|]+\\| ([^|]+) \\|', 'm')) || [])[1]?.trim();

test('C1 Produce hub', () => {
  const o = now('organic_worth_it_by_type');
  assert.equal(o.title, 'Produce');
  // W2 leaves the section's skin wording in the section and preserves this answer.
  assert.equal(o.decision, 'Organic produce eaten whole; conventional fruit and vegetables you peel.');
  for (const a of ['banana', 'bananas']) {
    assert.ok(!o.aliases.includes(a), `hub still carries ${a}`);
    assert.ok(now('produce_bananas').aliases.includes(a), `produce_bananas lacks ${a}`);
  }
});

test('C2 produce_bananas shape', () => {
  const b = now('produce_bananas');
  assert.ok(b, 'produce_bananas missing');
  assert.equal(b.title, 'Bananas');
  assert.equal(b.decision, 'Green bananas to finish ripening on your counter.');
  assert.equal(pre('produce_bananas'), undefined, 'the card is new');
  assert.deepEqual(Object.keys(b).sort(), [...new Set([...Object.keys(now('produce_mushrooms')), 'asked_as'])].sort());
  nonEmpty(b.asked_as, 'banana asked_as', 3);
  nonEmpty(b.pick_steps, 'banana pick_steps', 2);
  assert.ok(String(b.science).length > 40, 'science present');
  assert.ok(b.science && b.science.trim(), 'science empty');
  assert.equal(b.evidence_tier, 'established');
  assert.ok(doLines.produce_bananas, 'no doLines entry');
});

test('C3 banana asks land', () => {
  for (const q of ['bananas', 'green bananas', 'how do i ripen bananas', 'are bananas worth buying organic']) {
    assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, 'produce_bananas', `"${q}" -> ${top.entry.id}`);
  }
});

test('C4 residue kind agrees', () => {
  for (const [id, kind] of Object.entries(KIND)) {
    const e = now(id);
    const t = `${e.decision} ${e.tier_note}`;
    assert.match(t, /\b(organic|conventional)\b/i, id);
    if (kind === 'organic') { assert.match(t, /\borganic\b/i, id); assert.doesNotMatch(t, /\bconventional\b/i, id); }
    if (kind === 'conventional') { assert.match(t, /\bconventional\b/i, id); assert.doesNotMatch(e.decision, /^organic\b/i, id); }
    if (kind === 'both') { assert.match(t, /\borganic\b/i, id); assert.match(t, /\bconventional\b/i, id); }
  }
});

test('C5 fronts', () => {
  const notes = kb.entries.map((e) => e.tier_note).filter(Boolean);
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
    assert.ok(words(e.decision) <= 14, `${id} decision ${words(e.decision)} words`);
    assert.deepEqual(headlineHedge(e.decision), [], `${id} hedge`);
    assert.equal(sentences(e.tier_note).length, 1, `${id} tier_note not one sentence`);
    assert.ok(words(e.tier_note) >= 5, `${id} tier_note short`);
    assert.doesNotMatch(e.tier_note, /\b(I|me|my|mine|we|us|our)\b/, `${id} first person`);
    assert.notEqual(e.tier_note.toLowerCase().replace(/[.\s]+$/, ''), e.evidence_tier.replace(/_/g, ' '), id);
    assert.equal(notes.filter((n) => n === e.tier_note).length, 1, `${id} tier_note not unique`);
    assert.ok(!TIER_NOTE_ORPHANED_PENDING.has(id), `${id} still pending`);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], id);
    assert.deepEqual(readability(e), [], id);
    assert.equal(headCol(id), e.decision, `${id} review headline differs`);
  }
});

test('C6 claim lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
  const b = spoken(now('produce_bananas'));
  assert.doesNotMatch(b, RULE4);
  assert.doesNotMatch(b, /starch|sugar|gassed|chemically|resistant/i);
});

test('C7 new URLs archived', () => {
  let checked = 0;
  for (const id of BATCH) {
    const old = new Set((pre(id)?.sources || []).map((s) => JSON.stringify(s)));
    for (const s of now(id).sources || []) {
      if (old.has(JSON.stringify(s))) continue;
      for (const u of String(typeof s === 'string' ? s : s.url).match(/https?:\/\/\S+/g) || []) {
        checked++;
        assert.ok(ARCHIVE.includes(u), `${id}: ${u} not archived`);
      }
    }
  }
  assert.ok(checked >= 4, `only ${checked} new URLs checked`);
});

test('C8 essentials unchanged', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});
