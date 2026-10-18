// IC-7b: dairy fronts, Devon's Milk ladder, "Butter" and "Yogurt" (docs/ITEM-CARDS-PLAN.md IC-7b). Written by the planner; do not edit.
import { beforeCa7 } from './ca7Superseded.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, headlineHedge, TIER_NOTE_ORPHANED_PENDING } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import { beforeConcern } from './twoLinePin.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const now = (id) => beforeCa7(kb.entries.find((e) => e.id === id));
const pre = (id) => PRE.entries.find((e) => e.id === id);
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const LEGAL = /\b(il)?legal\b|\blaws?\b/i;
const MILK_FRONT = 'Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed.';
const UMD = 'https://agrisk.umd.edu/post/the-raw-facts-let-s-talk-about-state-laws-regulating-raw-milk';
const BATCH = ['whole_vs_reduced_fat_milk', 'grassfed_butter', 'yogurt_plain_vs_flavored', 'raw_milk', 'ghee', 'plant_butter', 'plain_kefir', 'raw_kefir',
  'sour_cream', 'cottage_cheese', 'cream_cheese', 'cheese_real_vs_processed', 'raw_aged_cheese', 'goat_sheep_dairy', 'cream_vs_creamer', 'ice_cream',
  'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'dairy_case'];
const SPOKEN = ['title', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const strings = (e) => SPOKEN.flatMap((f) => [].concat(e?.[f] ?? [])).flatMap((x) => (typeof x === 'string' ? [x] : Object.values(x ?? {}).filter((v) => typeof v === 'string')));
const nonPicksTitled = (t) => kb.entries.filter((e) => e.kind !== 'pick' && e.title === t);
const PENDING = [...TIER_NOTE_ORPHANED_PENDING];
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');
const reviewHeadline = (id) => {
  const line = review.split('\n').find((l) => l.startsWith(`| \`${id}\` |`));
  return line ? line.split('|')[3].trim() : null;
};
const urls = (e) => (e?.sources || []).flatMap((s) => JSON.stringify(s).match(/https?:\/\/[^\s"”]+/g) || []);
const dir = join(ROOT, 'docs/sources/item-cards');
const archive = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');

test('C1 the Milk front is Devon\'s ruling', () => {
  const m = now('whole_vs_reduced_fat_milk');
  assert.equal(m.decision, MILK_FRONT);
  assert.deepEqual(headlineHedge(m.decision), []);
  assert.match(m.tier_note, /145°F/);
  assert.match(m.tier_note, /low-temp|organic/i);
  assert.equal(nonPicksTitled('Milk').length, 1, 'non-pick "Milk" count');
});

test('C2 raw milk germ fact is sourced', () => {
  const m = now('whole_vs_reduced_fat_milk');
  assert.ok([].concat(m.watch_out ?? []).some((w) => /raw/i.test(w) && /germ|Campylobacter|Listeria|Salmonella|E\. coli/i.test(w)), 'no raw-milk germ watch_out');
  const gov = urls(m).filter((u) => /^https:\/\/www\.(cdc|fda)\.gov\//.test(u));
  assert.ok(gov.length >= 1, 'no CDC/FDA source on Milk');
  for (const u of gov) assert.ok(archive.includes(u), `${u} not archived`);
});

test('C3 no legality content and excluded sources absent', () => {
  for (const s of strings(now('whole_vs_reduced_fat_milk'))) assert.doesNotMatch(s, LEGAL, `Milk: ${s}`);
  const all = JSON.stringify(kb);
  assert.ok(!all.includes(UMD), 'umd raw-milk-law URL is in the KB');
  assert.ok(!all.includes('law.cornell.edu/cfr/text/21/1240.61'), '21 CFR 1240.61 is in the KB');
});

test('C4 Butter and Yogurt titles and pointers', () => {
  assert.equal(now('grassfed_butter').title, 'Butter');
  assert.equal(now('yogurt_plain_vs_flavored').title, 'Yogurt');
  assert.equal(nonPicksTitled('Butter').length, 1, 'non-pick "Butter" count');
  assert.equal(nonPicksTitled('Yogurt').length, 1, 'non-pick "Yogurt" count');
  const all = JSON.stringify(kb);
  for (const old of ['see Grass-fed butter', 'see Plain vs. flavored yogurt', 'see Whole vs. reduced-fat milk']) assert.ok(!all.includes(old), `stale pointer: ${old}`);
});

test('C5 dairy fronts and why lines pass', () => {
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
    assert.equal(reviewHeadline(id), kb.entries.find((x) => x.id === id).decision, `${id} review headline differs from KB decision`);
  }
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
});

test('C6 claim-lock rule 4', () => {
  for (const id of BATCH) assert.doesNotMatch(`${now(id).decision} ${now(id).tier_note}`, RULE4, id);
});

test('C7 new URLs are archived', () => {
  let checked = 0;
  for (const id of BATCH) {
    const was = new Set(urls(pre(id)));
    if (id === 'whole_vs_reduced_fat_milk') for (const f of ['a2_vs_a1_milk', 'milk_processing']) for (const u of urls(pre(f))) was.add(u);
    for (const u of urls(beforeConcern(now(id)))) if (!was.has(u)) { checked++; assert.ok(archive.includes(u), `${id}: ${u} not in docs/sources/item-cards`); }
  }
  assert.ok(checked >= 1, `only ${checked} new URLs checked`);
});
