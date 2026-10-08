// K5: readability pass, produce slice 1.
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
  'organic_worth_it_by_type', 'frozen_vs_fresh_produce', 'freezing_produce', 'produce_seasonality', 'washing_produce',
  'baking_soda_soak', 'precut_produce_tradeoffs', 'produce_picking_ripeness', 'produce_ripeness_by_item', 'berries_picking',
  'produce_storage', 'revive_greens', 'sprouts_raw', 'strawberries_organic_residue', 'produce_root_vegetables',
  'produce_brassicas', 'produce_onions_garlic',
], 'the K5 slice', 17);

const oldEntries = pre.entries ?? pre;

for (const id of SLICE) {
  test(`K5 ${id}: readable, lint-clean, pass rule held`, (t) => {
    const now = kb.entries.find((e) => e.id === id);
    const old = oldEntries.find((e) => e.id === id);
    assert.ok(now && old, `${id} missing from the KB or the fixture`);
    assert.deepEqual(readability(now), []);
    assert.deepEqual(lintCard(projectEntry(now, { doLine: reviewed.get(id)?.do || '' })), []);
    assertPassRule(t, old, now);
  });
}
