// K11: readability pass, label_terms.
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
  'label_natural',
  'label_made_with_real',
  'label_no_added_hormones',
  'label_nonGMO_vs_organic',
  'label_cage_free',
  'label_grass_fed_term',
  'label_pasture_raised_feed',
  'label_organic_scope',
  'label_multigrain_vs_whole_grain',
  'label_lightly_sweetened',
  'label_no_artificial_flavors',
  'label_front_vs_back',
  'label_ingredient_order',
  'label_third_party_seals',
  'label_cold_pressed_expeller',
  'label_sugar_free_substitutes',
  'label_wild_vs_farm_raised',
  'label_serving_size',
  'label_artificial_color',
], 'the K11 slice', 19);

const oldEntries = pre.entries ?? pre;

for (const id of SLICE) {
  test(`K11 ${id}: readable, lint-clean, pass rule held`, (t) => {
    const now = kb.entries.find((e) => e.id === id);
    const old = oldEntries.find((e) => e.id === id);
    assert.ok(now && old, `${id} missing from the KB or the fixture`);
    assert.deepEqual(readability(now), []);
    assert.deepEqual(lintCard(projectEntry(now, { doLine: reviewed.get(id)?.do || '' })), []);
    assertPassRule(t, old, now);
  });
}
