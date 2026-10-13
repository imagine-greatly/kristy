// IC-3a: produce folds (docs/ITEM-CARDS-PLAN.md IC-3a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { RETIRED, ESSENTIALS, projectEntry } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };
import sectionRules from '../../lib/sectionRules.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const FOLDS = { produce_picking_ripeness: 'produce_ripeness_by_item', strawberries_organic_residue: 'berries_picking' };
const DROPPED_SOURCE = (s) => /class action|Harada/i.test(JSON.stringify(s));
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8');

test('C1 folded ids retired', () => {
  for (const id of Object.keys(FOLDS)) {
    assert.ok(pre(id), `${id} missing from the pre-fold KB`);
    assert.ok(!now(id), `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still in doLines.json`);
    assert.ok(!review.includes(`\`${id}\``), `${id} still a do-lines-review row`);
  }
});

test('C2 aliases and asks moved', () => {
  for (const [id, to] of Object.entries(FOLDS)) {
    const s = now(to);
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(s.aliases.includes(a), `${id} alias "${a}" not on ${to}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(s.asked_as.includes(q), `${id} ask "${q}" not on ${to}`);
  }
});

test('C3 folded asks land on the survivor', () => {
  for (const [id, to] of Object.entries(FOLDS)) {
    for (const q of pre(id).asked_as) {
      assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
      const top = scoreEntries(q, 3)[0];
      assert.ok(admits(top), `"${q}" not admitted`);
      assert.equal(top.entry.id, to, `"${q}" -> ${top.entry.id}`);
    }
  }
});

test('C4 sources moved', () => {
  for (const [id, to] of Object.entries(FOLDS)) {
    const have = new Set((now(to).sources || []).map((s) => JSON.stringify(s)));
    for (const s of pre(id).sources || []) {
      if (DROPPED_SOURCE(s)) assert.ok(!have.has(JSON.stringify(s)), `dropped source kept on ${to}`);
      else assert.ok(have.has(JSON.stringify(s)), `${id} source ${JSON.stringify(s)} not on ${to}`);
    }
  }
});

test('C5 unique facts on the survivors', () => {
  const r = now('produce_ripeness_by_item');
  const rt = spoken(r);
  assert.match(rt, /variety/i);
  assert.match(rt, /season/i);
  assert.match(rt, /\b9\b/);
  const rTerms = (r.labels_decoded || []).map((l) => l.term);
  for (const l of pre('produce_picking_ripeness').labels_decoded || []) assert.ok(rTerms.includes(l.term), `label "${l.term}" not moved`);
  const b = now('berries_picking');
  assert.equal(b.title, 'Berries');
  const bTerms = (b.labels_decoded || []).map((l) => l.term);
  for (const t of ['USDA Organic', 'Non-detect']) assert.ok(bTerms.includes(t), `label "${t}" not moved`);
  assert.doesNotMatch(JSON.stringify(b), /class action|Harada|lawsuit/i);
  assert.doesNotMatch(spoken(b), /driscoll/i);
});

test('C6 essentials and section rules intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `${id} missing`);
  for (const rule of nonEmpty(sectionRules, 'section rules', 6)) for (const id of rule.sources) assert.ok(now(id), `section rule source ${id} missing`);
  assert.deepEqual(sectionRules.find((r) => r.section === 'produce').sources, ['produce_ripeness_by_item']);
});

test('C7 survivors lint clean', () => {
  for (const id of Object.values(FOLDS)) {
    const e = now(id);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], id);
    assert.deepEqual(readability(e), [], id);
    assert.deepEqual(lintRepeatedClaim(e), [], id);
    assert.doesNotMatch(spoken(e), RULE4, `${id} trips claim-lock rule 4`);
  }
});
