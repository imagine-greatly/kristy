// IC-5b: meat fronts, "Beef" and "Steak" (docs/ITEM-CARDS-PLAN.md IC-5b). Written by the planner; do not edit.
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
const now = (id) => kb.entries.find((e) => e.id === id);
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const BATCH = ['beef_grassfed_vs_grainfed', 'beef_cuts_basics', 'judging_meat_at_the_case', 'butcher_counter_asking', 'organ_meats', 'venison_game',
  'ground_beef_organ_blend', 'ground_beef_lean_ratio', 'bison', 'lamb_goat', 'pork_cuts_and_enhanced', 'bacon', 'cured_pork', 'ham', 'hot_dogs', 'deli_meat_uncured'];
const GRASS_URLS = [
  'https://www.ams.usda.gov/rules-regulations/withdrawal-united-states-standards-livestock-and-meat-marketing-claims',
  'https://www.govinfo.gov/content/pkg/FR-2016-01-12/pdf/2016-00440.pdf',
  'https://www.americangrassfed.org/about-us/our-standards/',
  'https://agreenerworld.org/wp-content/uploads/2020/08/Certified-Grassfed-Standards-2020-v1.pdf',
];
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);

test('C1 the Beef card', () => {
  const b = now('beef_grassfed_vs_grainfed');
  assert.equal(b.title, 'Beef');
  assert.equal(b.decision, '100% grass-fed and grass-finished.');
  assert.match(b.tier_note, /finish/i);
  assert.equal(nonPicksTitled('Beef').length, 1, 'non-pick "Beef" count');
});

test('C2 Steak and judging', () => {
  assert.equal(now('beef_cuts_basics').title, 'Steak');
  assert.equal(nonPicksTitled('Steak').length, 1, 'non-pick "Steak" count');
  assert.match(now('judging_meat_at_the_case').decision, /oxygen|colou?r/i, 'judging front lost its colour fact');
});

test('C3 beef pointers follow the retitle', () => {
  const all = JSON.stringify(kb);
  assert.ok(!all.includes('see Grass-fed vs. grain-fed beef'), 'stale beef pointer');
  assert.ok(all.includes('How it was raised: see Beef.'), 'no repointed beef pointer');
});

test('C5 meat fronts and why lines pass', () => {
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
  let checked = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    for (const u of urls(now(id))) if (!was.has(u)) { checked++; assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`); }
  }
  assert.ok(checked >= 4, `only ${checked} new URLs checked`);
  const beef = urls(now('beef_grassfed_vs_grainfed'));
  for (const u of GRASS_URLS) assert.ok(beef.includes(u), `Beef card lacks ${u}`);
});
