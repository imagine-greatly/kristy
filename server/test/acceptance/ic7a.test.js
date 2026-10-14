// IC-7a: dairy folds, a2_vs_a1_milk and milk_processing → "Milk"; yogurt_live_cultures → yogurt_plain_vs_flavored (docs/ITEM-CARDS-PLAN.md IC-7a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries, PERIMETER_SECTIONS } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { RETIRED, ESSENTIALS, projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim, OWNED_FACTS } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const MILK = 'whole_vs_reduced_fat_milk';
const YOG = 'yogurt_plain_vs_flavored';
const FOLD = { a2_vs_a1_milk: MILK, milk_processing: MILK, yogurt_live_cultures: YOG };
const FOLDED = Object.keys(FOLD);
const SURVIVORS = [MILK, YOG];
const KEEP_OFF = new Set(['kefir', 'alive', 'still alive']);
const DROPPED = ['People who struggle with regular milk often do better on A2.', 'Worth trying for a week.'];
const EXTRA_ASKS = [['what is ultra pasteurized milk', MILK], ['cultured dairy', YOG], ['a2 milk', MILK]];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const strings = (e) => SPOKEN.flatMap((f) => [].concat(e?.[f] ?? [])).flatMap((x) => (typeof x === 'string' ? [x] : Object.values(x ?? {}).filter((v) => typeof v === 'string')));
const norm = (s) => String(s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
const sentences = (s) => norm(s).split(/(?<=[.!?])\s+/).filter(Boolean);
const POINTER = /^[A-Z][^:]{0,40}: see (.+)\.$/;
const ownedElsewhere = (s, to) => OWNED_FACTS.some((r) => r.owner !== to && r.family.includes(to) && r.pattern.test(s));
const term = (l) => norm(typeof l === 'string' ? l : (l.term ?? Object.values(l)[0]));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded ids are retired everywhere', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from 663ca3d`);
    assert.equal(now(id), undefined, `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still has a do line`);
    assert.ok(!review.has(id), `${id} still in do-lines-review`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${id} still in OWNED_FACTS ${r.fact}`);
  }
});

test('C2 aliases and asked_as moved and Milk is titled', () => {
  for (const id of FOLDED) {
    const to = now(FOLD[id]);
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 5)) {
      if (KEEP_OFF.has(a) && id === 'yogurt_live_cultures') continue;
      assert.ok(to.aliases.includes(a), `${id} alias "${a}" not on ${to.id}`);
    }
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(to.asked_as.includes(q), `${id} ask "${q}" not on ${to.id}`);
  }
  for (const a of KEEP_OFF) assert.ok(!now(YOG).aliases.includes(a) || pre(YOG).aliases.includes(a), `${YOG} took withheld alias "${a}"`);
  assert.equal(now(MILK).title, 'Milk');
  assert.equal(kb.entries.filter((e) => e.kind !== 'pick' && e.title === 'Milk').length, 1, 'non-pick "Milk" count');
});

test('C3 folded questions reach the survivor', () => {
  const asks = [...FOLDED.flatMap((id) => pre(id).asked_as.map((q) => [q, FOLD[id]])), ...EXTRA_ASKS];
  for (const [q, want] of nonEmpty(asks, 'asks', 12)) {
    assert.ok(inScope(q).ok, `"${q}" out of scope`);
    const top = scoreEntries(q, 3)[0];
    assert.ok(admits(top), `"${q}" not admitted`);
    assert.equal(top.entry.id, want, `"${q}" → ${top.entry.id}`);
  }
});

test('C4 sources moved', () => {
  for (const id of FOLDED) {
    const have = new Set(now(FOLD[id]).sources.map((s) => JSON.stringify(s)));
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 1)) assert.ok(have.has(JSON.stringify(s)), `${id} source lost: ${JSON.stringify(s)}`);
  }
  const milk = JSON.stringify(now(MILK).sources);
  assert.ok(milk.includes('https://extension.umn.edu/agriculture/animals-and-livestock/dairy/a2-milk-and-a2-genetics'), 'umn A2 source lost');
  assert.ok(milk.includes('https://www.canr.msu.edu/news/they_did_what_to_your_milk'), 'msu processing source lost');
});

test('C5 tips, watch-outs and labels moved; digestion tip dropped', () => {
  const drop = new Set(DROPPED.map(norm));
  for (const id of FOLDED) {
    const to = FOLD[id];
    const body = norm(strings(now(to)).join('\n'));
    for (const f of ['buying_tips', 'watch_out']) {
      for (const s of nonEmpty([].concat(pre(id)[f] ?? []).flatMap(sentences), `${id} ${f}`, 2)) {
        if (drop.has(s) || POINTER.test(s) || ownedElsewhere(s, to)) continue;
        assert.ok(body.includes(s), `${id} ${f} sentence not on ${to}: ${s}`);
      }
    }
    const terms = (now(to).labels_decoded ?? []).map(term);
    assert.equal(new Set(terms).size, terms.length, `${to} label terms repeat`);
    for (const l of pre(id).labels_decoded ?? []) {
      if (ownedElsewhere(JSON.stringify(l), to)) continue;
      assert.ok(terms.includes(term(l)), `${id} label "${term(l)}" not on ${to}`);
    }
  }
  const all = norm(JSON.stringify(kb));
  for (const s of DROPPED) assert.ok(!all.includes(norm(s)), `dropped sentence still in KB: ${s}`);
  const milk = norm(strings(now(MILK)).join('\n'));
  for (const re of [/ultra[- ]pasteuri[sz]ed/i, /homogeni[sz]ed/i, /\bA2\b/]) assert.match(milk, re);
  assert.match(norm(strings(now(YOG)).join('\n')), /live and active cultures/i);
});

test('C6 processing owner, pointer, essentials and pool', () => {
  const row = OWNED_FACTS.find((r) => r.fact === 'milk_processing');
  assert.ok(row, 'milk_processing OWNED_FACTS row missing');
  assert.equal(row.owner, MILK);
  const all = JSON.stringify(kb);
  assert.ok(!all.includes('see Pasteurized, ultra-pasteurized, homogenized'), 'stale processing pointer');
  assert.ok(!all.includes('see A2 vs. A1 milk') && !all.includes('see Live cultures, kefir and skyr'), 'stale folded pointer');
  assert.ok(all.includes('Homogenized or ultra-pasteurized: see Milk.'), 'goat_sheep_dairy pointer not repointed');
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `essential ${id} missing`);
  const sections = nonEmpty(PERIMETER_SECTIONS, 'sections', 6);
  for (const { id } of nonEmpty(sections.flatMap((s) => s.shortcuts ?? []), 'shortcuts', 12)) {
    assert.ok(!FOLDED.includes(id), `shortcut names folded ${id}`);
    assert.ok(now(id), `shortcut names missing ${id}`);
  }
  const pool = execFileSync('git', ['ls-files'], { cwd: ROOT }).toString().split('\n').filter((f) => /server\/.*tryPool\.js$/.test(f));
  for (const f of nonEmpty(pool, 'tryPool.js', 1)) for (const id of FOLDED) assert.ok(!readFileSync(join(ROOT, f), 'utf8').includes(`'${id}'`), `${f} still names ${id}`);
});

test('C7 survivors lint clean', () => {
  for (const to of SURVIVORS) {
    const e = now(to);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[to] })), [], `${to} lint`);
    assert.deepEqual(readability(e), [], `${to} readability`);
    assert.deepEqual(lintRepeatedClaim(e), [], `${to} repeated claim`);
    const was = new Set(strings(pre(to)).flatMap(sentences));
    for (const s of strings(e).flatMap(sentences)) if (!was.has(s)) assert.doesNotMatch(s, RULE4, `${to}: ${s}`);
  }
  assert.equal(OWNED_FACTS.length, 14);
});
