// IC-8b: rest of store part 2, plus the corpus-wide front closer (docs/ITEM-CARDS-PLAN.md IC-8). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from 'file:///Users/m1/kristy/server/lib/counterCards.js';
import * as lint from 'file:///Users/m1/kristy/server/lib/counterCardLint.js';
import kb from 'file:///Users/m1/kristy/server/kristy_perimeter_kb.json' with { type: 'json' };
import doLines from 'file:///Users/m1/kristy/server/lib/doLines.json' with { type: 'json' };

const { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } = lint;
const ROOT = join(dirname(fileURLToPath("file:///Users/m1/kristy/server/test/acceptance/ic8b.test.js")), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const UMD = 'https://agrisk.umd.edu/post/the-raw-facts-let-s-talk-about-state-laws-regulating-raw-milk';
const PENDING_OUT = ['label_made_with_real', 'label_organic_scope', 'label_lightly_sweetened', 'label_ingredient_order', 'label_third_party_seals', 'label_artificial_color', 'revive_greens'];
const ids = kb.entries.map((e) => e.id);
const start = ids.indexOf('sandwich_bread');
const end = ids.findIndex((id, i) => i > start && /^frozen/.test(id));
const CARDS = kb.entries.filter((e) => e.kind !== 'pick');
// Curated home cards carry no kind field (kind 'home' exists only on generated cards), so they are named.
const HOME = ['washing_produce', 'baking_soda_soak', 'revive_greens', 'freezing_produce', 'produce_storage'];
const OWN = kb.entries.filter((e, i) => e.kind !== 'pick' && ((end >= 0 && i >= end) || HOME.includes(e.id) || e.id.startsWith('label_'))).map((e) => e.id);
console.log(`ic-8b OWN (${OWN.length}): ${OWN.join(', ')}`);
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
const notes = kb.entries.map((e) => String(e.tier_note || '').trim()).filter(Boolean);
const frontFailures = (e) => {
  const out = [];
  const n = String(e.tier_note || '').trim();
  if (words(e.decision) > 14) out.push(`front ${words(e.decision)} words`);
  if (headlineHedge(e.decision).length) out.push('front hedges');
  if (words(n) < 5) out.push('tier_note too short');
  if (/[.!?]\s+\S/.test(n)) out.push('tier_note two sentences');
  if (/\b(I|me|my|mine|we|us|our)\b/.test(n)) out.push('tier_note first person');
  if (n.toLowerCase().replace(/[^a-z]/g, '') === String(e.evidence_tier).toLowerCase().replace(/[^a-z]/g, '')) out.push('tier_note is the tier name');
  if (notes.filter((x) => x === n).length !== 1) out.push('tier_note not unique');
  if ([...TIER_NOTE_ORPHANED_PENDING].includes(e.id)) out.push('pending');
  if (lintCard(projectEntry(e, { doLine: doLines[e.id] })).length) out.push('lint');
  if (readability(e).length) out.push('readability');
  if (reviewHeadline(e.id) !== e.decision) out.push('review headline differs');
  return out;
};

test('C1 own batch is well-formed', () => {
  assert.ok(start >= 0, 'sandwich_bread not found');
  assert.ok(end > start, 'no /^frozen/ id after sandwich_bread');
  assert.ok(OWN.length >= 20, `OWN size ${OWN.length}`);
  for (const id of [...PENDING_OUT, 'label_wild_vs_farm_raised']) assert.ok(OWN.includes(id), `${id} outside OWN`);
});

test('C2 pending ratchet is empty', () => {
  assert.ok('TIER_NOTE_ORPHANED_PENDING' in lint, 'export removed');
  assert.equal([...TIER_NOTE_ORPHANED_PENDING].length, 0, `still pending: ${[...TIER_NOTE_ORPHANED_PENDING].join(', ')}`);
});

test('C3 store fronts and why lines pass', () => {
  for (const id of OWN) assert.deepEqual(frontFailures(now(id)), [], id);
});

test('C4 every card front passes corpus-wide', () => {
  const bad = CARDS.map((e) => [e.id, frontFailures(e)]).filter(([, f]) => f.length);
  assert.deepEqual(bad, [], bad.map(([id, f]) => `${id}: ${f.join(', ')}`).join('\n'));
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C5 claim-lock rule 4 corpus-wide', () => {
  for (const e of CARDS) assert.doesNotMatch(`${e.decision} ${e.tier_note}`, RULE4, e.id);
});

test('C6 sources never shrink and new URLs are archived', () => {
  for (const id of OWN) {
    const have = new Set(urls(now(id)));
    for (const u of urls(pre(id))) assert.ok(have.has(u), `${id} dropped ${u}`);
  }
  for (const e of CARDS) for (const u of urls(e)) if (!PRE_URLS.has(u)) assert.ok(archive.includes(u), `${e.id}: ${u} not in docs/sources/item-cards`);
  assert.ok(!JSON.stringify(kb).includes(UMD), 'umd raw-milk-law URL is in the KB');
});

test('C7 card count stays 181 (ca-3a folds ground_beef_organ_blend)', () => {
  assert.equal(CARDS.length, 181);
});
