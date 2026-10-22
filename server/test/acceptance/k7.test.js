// K7: readability pass, dairy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable, RETIRED } from '../../lib/counterCards.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import { preT6_2 } from './twoLinePin.js';
import { preCompleteness } from './cartPlain.js';
const live = kb.entries;
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
import pre from './fixtures/kb-pre-readability.json' with { type: 'json' };
import { assertPassRule } from './passRule.js';
import { beforeConcern, preTidy } from './twoLinePin.js';
kb.entries = kb.entries.map(preTidy);
// Completeness pass rewrote these cards at 9845b9e; the pass rule reads the pre-completeness copy, rule checks stay on kb.entries.
const pinned = live.map(preCompleteness).map(preT6_2).map(preTidy);

const HERE = dirname(fileURLToPath(import.meta.url));
const reviewed = parseReviewTable(readFileSync(join(HERE, '../../../docs/do-lines-review.md'), 'utf8'));

const SLICE = nonEmpty([
  'grassfed_butter', 'whole_vs_reduced_fat_milk', 'cheese_real_vs_processed', 'yogurt_plain_vs_flavored', 'raw_milk',
  'cream_vs_creamer', 'raw_kefir', 'raw_aged_cheese', 'oat_milk',
], 'the K7 slice', 9);

const oldEntries = pre.entries ?? pre;

for (const id of SLICE) {
  test(`K7 ${id}: readable, lint-clean, pass rule held`, (t) => {
    const now = kb.entries.find((e) => e.id === id);
    const old = oldEntries.find((e) => e.id === id);
    assert.ok(now && old, `${id} missing from the KB or the fixture`);
    assert.deepEqual(readability(now), []);
    assert.deepEqual(lintCard(projectEntry(now, { doLine: reviewed.get(id)?.do || '' })), []);
    assertPassRule(t, old, beforeConcern(pinned.find((e) => e.id === id)));
  });
}

test('K7: IC-7a retired ids are in RETIRED and gone from the KB', () => {
  for (const id of nonEmpty(['a2_vs_a1_milk', 'milk_processing', 'yogurt_live_cultures'], 'IC-7a retired ids', 3)) {
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(kb.entries.find((e) => e.id === id), undefined, `${id} still in the KB`);
  }
});
