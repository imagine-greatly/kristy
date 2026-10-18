// IC-4b: poultry fronts, "Eggs" and "Chicken" (docs/ITEM-CARDS-PLAN.md IC-4b). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RETIRED, ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import { beforeConcern } from './twoLinePin.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => beforeConcern(kb.entries.find((e) => e.id === id));
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'labels_decoded', 'cart_pick', 'question'];
const BACK = ['why', 'short_answer', 'detail', 'buying_tips', 'watch_out', 'pick_steps', 'science', 'labels_decoded'];
const text = (e, fields) => JSON.stringify(fields.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const BATCH = ['egg_labels', 'chicken_cuts_basics', 'rotisserie_chicken', 'ground_turkey', 'turkey_whole', 'turkey_bacon', 'frozen_nuggets', 'egg_duck_quail'];
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};

test('C0 prerequisite folds ran', () => {
  for (const id of ['air_chilled_chicken', 'no_antibiotics_poultry', 'egg_grades_sizes']) {
    assert.equal(now(id), undefined, `${id} still in the KB: ic-4a-eggs / ic-4a-chicken must land first`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
  }
});

test('C1 the Eggs card', () => {
  const e = now('egg_labels');
  assert.equal(e.title, 'Eggs');
  // Two-line rewrite (2026-10-17): Devon's approved sample egg card, verbatim.
  assert.equal(e.decision, 'Soy-free, corn-free eggs from hens on pasture.');
  assert.match(e.tier_note, /feed|ate/i);
  assert.match(text(e, SPOKEN), /\bboth\b[^.]*soy[- ]free[^.]*corn[- ]free|\bboth\b[^.]*corn[- ]free[^.]*soy[- ]free/i, 'both-printed fact lost');
  assert.equal(nonPicksTitled('Eggs').length, 1, 'non-pick "Eggs" count');
});

test('C2 the Chicken card', () => {
  const c = now('chicken_cuts_basics');
  assert.equal(c.title, 'Chicken');
  assert.match(c.decision, /thigh/i);
  if (/air[- ]chill/i.test(c.decision)) assert.match(text(c, BACK), /air[- ]chill/i, 'front says air-chilled, back does not');
  assert.equal(nonPicksTitled('Chicken').length, 1, 'non-pick "Chicken" count');
  for (const a of pre('chicken_cuts_basics').aliases) assert.ok(c.aliases.includes(a), `alias "${a}" lost`);
});

test('C3 no stale poultry pointers', () => {
  const all = JSON.stringify(kb);
  for (const s of ['see Egg labels', 'see Chicken and duck', 'see Air-chilled chicken']) assert.ok(!all.includes(s), `KB still says "${s}"`);
});

test('C5 poultry fronts and why lines pass', () => {
  const notes = kb.entries.map((e) => String(e.tier_note || '').trim()).filter(Boolean);
  for (const id of BATCH) {
    const e = now(id);
    assert.ok(e, `${id} missing`);
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

test('C6 claim-lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
});

test('C7 new URLs are archived', () => {
  const dir = join(ROOT, 'docs/sources/item-cards');
  const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) if (!was.has(u)) assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`);
  }
});

// Admin amendment (ic-4b): chicken_breast stays its own card and gets a front in the same shape.
test('C2b the chicken breast front', () => {
  const b = now('chicken_breast');
  assert.notEqual(b.decision, JSON.parse(execFileSync('git', ['show', 'a6a8cc7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString()).entries.find((e) => e.id === 'chicken_breast').decision);
  assert.ok(words(b.tier_note) >= 5, 'chicken_breast tier_note too short');
  assert.equal(reviewHeadline('chicken_breast'), b.decision);
  assert.deepEqual(lintCard(projectEntry(b, { doLine: doLines.chicken_breast })), []);
  assert.deepEqual(readability(b), []);
});
