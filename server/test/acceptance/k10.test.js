// K10: readability pass, bulk_pantry.
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
import { beforeConcern, preCleanPick8 } from './twoLinePin.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const reviewed = parseReviewTable(readFileSync(join(HERE, '../../../docs/do-lines-review.md'), 'utf8'));

const SLICE = nonEmpty([
  'rice_arsenic', 'oats_steelcut_rolled_instant', 'nuts_raw_vs_roasted', 'honey_adulteration', 'beans_dried_vs_canned',
  'flour_basics', 'bulk_bins_buying', 'whole_spices', 'rancidity_check', 'olive_oil_grades',
  'nut_butter_ingredients', 'grains_beyond_rice', 'bottled_water_buying', 'coffee_beans',
], 'the K10 slice', 14);

const oldEntries = pre.entries ?? pre;

for (const id of SLICE) {
  test(`K10 ${id}: readable, lint-clean, pass rule held`, (t) => {
    const now = kb.entries.find((e) => e.id === id);
    const old = oldEntries.find((e) => e.id === id);
    assert.ok(now && old, `${id} missing from the KB or the fixture`);
    assert.deepEqual(readability(now), []);
    assert.deepEqual(lintCard(projectEntry(now, { doLine: reviewed.get(id)?.do || '' })), []);
    // clean-pick-8 moved oats' cart_pick and coffee's sources; the pass rule reads them as of 125244d.
    assertPassRule(t, old, beforeConcern(preCleanPick8(now)));
  });
}

test('K10: chf-5 retired ids are in RETIRED and gone from the KB', () => {
  for (const id of ['dry_brine', 'bean_soak_salt', 'pretzel_bread', 'baking_soda_powder', 'duck_meat']) {
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.ok(!kb.entries.some((e) => e.id === id), `${id} still in the KB`);
  }
});
