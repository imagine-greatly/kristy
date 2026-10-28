import { liveDecision } from "./cartPlain.js";
// IC-6b: seafood fronts, "Salmon" and "Shrimp" (docs/ITEM-CARDS-PLAN.md IC-6b). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import { preT6_1 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
import doLines from '../../lib/doLines.json' with { type: 'json' };
import { beforeConcern } from './twoLinePin.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const BATCH = ['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'seafood_counter', 'smoked_salmon', 'white_fish', 'scallops', 'crab',
  'lobster', 'clams_mussels_oysters', 'canned_tuna', 'canned_fish_choosing', 'mercury_by_fish', 'farmed_fish_by_species', 'seafood_certifications'];
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);

test('C1 the Salmon card', () => {
  const s = now('salmon_wild_vs_farmed');
  assert.equal(s.title, 'Salmon');
  assert.match(s.decision, /wild/i);
  assert.equal(nonPicksTitled('Salmon').length, 1, 'non-pick "Salmon" count');
  assert.ok(ESSENTIALS.includes('salmon_wild_vs_farmed'));
});

test('C2 the Shrimp card', () => {
  assert.equal(now('shrimp_imported_vs_domestic').title, 'Shrimp');
  assert.equal(nonPicksTitled('Shrimp').length, 1, 'non-pick "Shrimp" count');
});

test('C3 seafood pointers follow the retitles', () => {
  const all = JSON.stringify(kb);
  assert.ok(!all.includes('see Wild vs. farmed salmon'), 'stale salmon pointer');
  assert.ok(!all.includes('see Imported vs. domestic shrimp'), 'stale shrimp pointer');
  assert.ok(all.includes('Wild or farmed: see Salmon.'), 'no repointed salmon pointer');
});

test('C5 seafood fronts and why lines pass', () => {
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
    // Item-copy flags pass 2026-10-28: the review table may mirror the live decision; pinned overlays keep older facts for the other checks.
    assert.ok([e.decision, liveDecision(id)].includes(reviewHeadline(id)), `${id} review headline differs from KB decision`);
  }
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C6 claim-lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
});

test('C7 no new seafood URLs', () => {
  let total = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    if (id === 'seafood_counter') for (const f of ['fresh_vs_previously_frozen_fish', 'fish_freshness_at_counter']) for (const u of urls(pre(f))) was.add(u);
    for (const u of urls(beforeConcern(now(id)))) { total++; assert.ok(was.has(u), `${id}: new URL ${u} (no seafood archive exists)`); }
  }
  assert.ok(total >= 1, 'batch carries no URLs at all');
});
