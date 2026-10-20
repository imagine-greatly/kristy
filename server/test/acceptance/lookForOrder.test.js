// Devon 2026-10-20: an authored watch_out must not reorder look_for. The KB ranks
// buying_tips best-first; projectEntry once appended the cautionary ones to the end.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import { projectEntry } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';

const entries = Array.isArray(kb) ? kb : kb.entries;

test('look_for keeps the authored buying_tips order on authored-watch_out cards', () => {
  const authored = entries.filter(
    (e) => e.kind !== 'pick' && Array.isArray(e.watch_out) && e.watch_out.length && e.buying_tips?.length,
  );
  nonEmpty(authored, 'authored watch_out cards', 2);
  for (const e of authored) {
    const card = projectEntry(e);
    assert.deepEqual(card.look_for.slice(0, e.buying_tips.length), e.buying_tips, e.id);
  }
});

test('cooking_oils and label_nonGMO_vs_organic lead with their first authored tip', () => {
  for (const id of ['cooking_oils', 'label_nonGMO_vs_organic']) {
    const e = entries.find((x) => x.id === id);
    assert.ok(e, id);
    assert.equal(projectEntry(e).look_for[0], e.buying_tips[0], id);
  }
});
