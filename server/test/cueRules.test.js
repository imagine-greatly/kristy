import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { cueFindings, readCueTsv, GENERIC_PHRASES } from '../lib/cueRules.js';
import { nonEmpty } from '../lib/testGuards.js';

nonEmpty(GENERIC_PHRASES, 'GENERIC_PHRASES');
const ok = { id: 'a', verdict: 'Organic', cue: 'Sticker starts with 9; skin dull not waxy.' };
const codes = (rows) => cueFindings(rows).map((f) => f.code);
const bad = {
  CUE_LONG: { ...ok, cue: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen' },
  CUE_GENERIC: { ...ok, cue: 'Good color on the label.' },
  CUE_CHAIN: { ...ok, cue: 'Bag says wild; one ingredient; loose pieces.' },
  CUE_BANNED: { ...ok, cue: 'Bought from a local grower.' },
  CUE_VERDICT: { ...ok, verdict: 'Maybe' },
};

test('clean row has no findings', () => assert.deepEqual(cueFindings([ok]), []));
for (const [code, row] of Object.entries(bad)) {
  test(`${code} fails and clean passes`, () => {
    assert.ok(codes([row]).includes(code));
    assert.ok(!codes([ok]).includes(code));
  });
}
test('CUE_DUPLICATE on shared first five words and on identical cue', () => {
  assert.ok(codes([ok, { ...ok, id: 'b', cue: 'Sticker starts with 9 skin shiny' }]).includes('CUE_DUPLICATE'));
  assert.ok(codes([ok, { ...ok, id: 'b' }]).includes('CUE_DUPLICATE'));
  assert.ok(!codes([ok, { ...ok, id: 'b', cue: 'Read the bag for one ingredient.' }]).includes('CUE_DUPLICATE'));
});

test('real pilot files run', () => {
  for (const f of ['produce-fresh-v2.tsv', 'frozen-table.tsv']) {
    const rows = readCueTsv(fileURLToPath(new URL(`../../docs/research/deepen/pilot/${f}`, import.meta.url)));
    nonEmpty(rows, f);
    const counts = {};
    for (const x of cueFindings(rows)) counts[x.code] = (counts[x.code] || 0) + 1;
    console.log(f, rows.length, 'rows', JSON.stringify(counts));
  }
});
