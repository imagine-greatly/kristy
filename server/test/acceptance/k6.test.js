// K6: readability pass, produce slice 2 plus seafood.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import pre from './fixtures/kb-pre-readability.json' with { type: 'json' };
import { assertPassRule } from './passRule.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const reviewed = parseReviewTable(readFileSync(join(HERE, '../../../docs/do-lines-review.md'), 'utf8'));

const SLICE = nonEmpty([
  'produce_leafy_greens', 'produce_peppers', 'produce_apples_pears', 'produce_citrus', 'produce_stone_fruit',
  'salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish', 'mercury_by_fish',
  'fish_freshness_at_counter', 'canned_fish_choosing', 'farmed_fish_by_species', 'seafood_certifications', 'canned_tuna',
], 'the K6 slice', 14);

const oldEntries = pre.entries ?? pre;

for (const id of SLICE) {
  test(`K6 ${id}: readable, lint-clean, pass rule held`, (t) => {
    const now = kb.entries.find((e) => e.id === id);
    const old = oldEntries.find((e) => e.id === id);
    assert.ok(now && old, `${id} missing from the KB or the fixture`);
    assert.deepEqual(readability(now), []);
    assert.deepEqual(lintCard(projectEntry(now, { doLine: reviewed.get(id)?.do || '' })), []);
    assertPassRule(t, old, now);
  });
}
