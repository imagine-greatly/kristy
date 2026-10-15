// IC-8a: rest of store part 1, grains/bread/fermented/pantry fronts (docs/ITEM-CARDS-PLAN.md IC-8). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const PENDING_OUT = ['olive_oil_grades', 'bottled_water_buying', 'tea'];
const TWO_SENTENCE = ['nuts_raw_vs_roasted', 'honey_adulteration', 'bulk_bins_buying', 'olive_oil_grades', 'nut_butter_ingredients', 'bottled_water_buying'];
const ids = kb.entries.map((e) => e.id);
const start = ids.indexOf('sandwich_bread');
const end = ids.findIndex((id, i) => i > start && /^frozen/.test(id));
const BATCH = kb.entries.slice(start, end).filter((e) => e.kind !== 'pick' && e.kind !== 'home').map((e) => e.id);
console.log(`ic-8a BATCH (${BATCH.length}): ${BATCH.join(', ')}`);
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
const PRE_URLS = new Set(PRE.entries.flatMap(urls));
const dir = join(ROOT, 'docs/sources/item-cards');
const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');

test('C1 derived batch is well-formed', () => {
  assert.ok(start >= 0, 'sandwich_bread not found');
  assert.ok(end > start, 'no /^frozen/ id after sandwich_bread');
  assert.ok(BATCH.length >= 20 && BATCH.length <= 110, `batch size ${BATCH.length}`);
  for (const id of [...PENDING_OUT, ...TWO_SENTENCE]) assert.ok(kb.entries.some((e) => e.id === id), `${id} missing from the KB`); // named ids sit before sandwich_bread; they are scoped by name, not by range
});

test('C2 pantry ids leave pending', () => {
  for (const id of PENDING_OUT) assert.ok(!PENDING.includes(id), `${id} still pending`);
});

test('C3 two-sentence tier notes merged', () => {
  for (const id of TWO_SENTENCE) assert.doesNotMatch(String(now(id).tier_note || '').trim(), /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
});

test('C4 pantry fronts and why lines pass', () => {
  const notes = kb.entries.map((e) => String(e.tier_note || '').trim()).filter(Boolean);
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(words(e.decision) <= 14, `${id} front is ${words(e.decision)} words`);
    assert.deepEqual(headlineHedge(e.decision), [], `${id} front hedges`);
    const n = String(e.tier_note || '').trim();
    assert.ok(words(n) >= 5, `${id} tier_note too short`);
    assert.doesNotMatch(n, /[.!?]\s+\S/, `${id} tier_note is more than one sentence`);
    assert.doesNotMatch(n, /\b(I|me|my|mine|we|us|our)\b/, `${id} tier_note first person`);
    assert.notEqual(n.toLowerCase().replace(/[^a-z]/g, ''), String(e.evidence_tier).toLowerCase().replace(/[^a-z]/g, ''), `${id} tier_note is the tier name`);
    assert.equal(notes.filter((x) => x === n).length, 1, `${id} tier_note not unique`);
    assert.ok(!PENDING.includes(id), `${id} still pending`);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lint`);
    assert.deepEqual(readability(e), [], `${id} readability`);
    assert.equal(reviewHeadline(id), e.decision, `${id} review headline differs from KB decision`);
  }
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C5 claim-lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
});

test('C6 sources never shrink and new URLs are archived', () => {
  for (const id of BATCH) {
    const have = new Set(urls(now(id)));
    for (const u of urls(pre(id))) assert.ok(have.has(u), `${id} dropped ${u}`);
    for (const u of have) if (!PRE_URLS.has(u)) assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`);
  }
});

test('C7 card count stays 181 (ca-3a folds ground_beef_organ_blend)', () => {
  assert.equal(kb.entries.filter((e) => e.kind !== 'pick').length, 181);
});
