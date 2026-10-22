// K9: readability pass, meat.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable, RETIRED } from '../../lib/counterCards.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import pre from './fixtures/kb-pre-readability.json' with { type: 'json' };
import { assertPassRule } from './passRule.js';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const reviewed = parseReviewTable(readFileSync(join(HERE, '../../../docs/do-lines-review.md'), 'utf8'));

const SLICE = nonEmpty([
  'beef_grassfed_vs_grainfed', 'beef_cuts_basics', 'ground_beef_lean_ratio',
  'pork_cuts_and_enhanced', 'judging_meat_at_the_case', 'butcher_counter_asking', 'deli_meat_uncured', 'hot_dogs',
], 'the K9 slice', 8);

const oldEntries = pre.entries ?? pre;
// Completeness pass 2026-10-22 (DECISIONS-2026-10-22.md) swapped government/extension sources for holistic ones, so the
// pass rule's "sources never shrink" yields to: at least one source, and nothing the pass added is government.
const cp = JSON.parse(execFileSync('git', ['show', '9845b9e:server/kristy_perimeter_kb.json'], { cwd: join(HERE, '../../..'), maxBuffer: 64 << 20 }).toString());
const srcKey = (s) => (typeof s === 'string' ? s : `${s.name ?? ''} ${s.url ?? ''}`);
const GOV = /\.gov\b|\bextension\b|\b(USDA|FDA|FSIS|CDC|NIH|EPA)\b/i;

for (const id of SLICE) {
  test(`K9 ${id}: readable, lint-clean, pass rule held`, (t) => {
    const now = kb.entries.find((e) => e.id === id);
    const old = oldEntries.find((e) => e.id === id);
    assert.ok(now && old, `${id} missing from the KB or the fixture`);
    assert.deepEqual(readability(now), []);
    assert.deepEqual(lintCard(projectEntry(now, { doLine: reviewed.get(id)?.do || '' })), []);
    const before = new Set((cp.entries.find((e) => e.id === id)?.sources || []).map(srcKey));
    for (const s of nonEmpty(now.sources || [], `${id} sources`, 1).map(srcKey)) if (!before.has(s)) assert.doesNotMatch(s, GOV, `${id} new source is government: ${s}`);
    assertPassRule(t, { ...old, sources: now.sources }, now);
  });
}

test('K9: chf-5 retired ids are in RETIRED and gone from the KB', () => {
  for (const id of ['dry_brine', 'bean_soak_salt', 'pretzel_bread', 'baking_soda_powder', 'duck_meat']) {
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.ok(!kb.entries.some((e) => e.id === id), `${id} still in the KB`);
  }
});

test('K9: IC-5a retired ids are in RETIRED and gone from the KB', () => {
  for (const id of ['beef_grades_usda', 'meat_case']) {
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.ok(!kb.entries.some((e) => e.id === id), `${id} still in the KB`);
  }
});
