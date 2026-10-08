import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadSectionRules } from '../lib/sectionRules.js';
import { nonEmpty } from '../lib/testGuards.js';

const dir = mkdtempSync(join(tmpdir(), 'sectionrules-'));
let n = 0;
const load = (data) => {
  const p = join(dir, `r${n++}.json`);
  writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data));
  return loadSectionRules(p);
};
const ok = { section: 'produce', rule: 'Smell the stem.', checks: ['No soft spots'], sources: ['x'] };

test('missing file and parse error give []', () => {
  assert.deepEqual(loadSectionRules(join(dir, 'nope.json')), []);
  assert.deepEqual(load('{not json'), []);
  assert.deepEqual(load({ section: 'produce' }), []);
});

test('valid entry passes through without sources', () => {
  const out = nonEmpty(load([ok]), 'valid rules');
  assert.deepEqual(out, [{ section: 'produce', rule: 'Smell the stem.', checks: ['No soft spots'] }]);
});

test('malformed entries are dropped', () => {
  const bad = [
    { ...ok, section: 'candy' },
    { ...ok, rule: '' },
    { ...ok, rule: 5 },
    { ...ok, checks: 'x' },
    { ...ok, checks: [''] },
    { ...ok, checks: [1] },
    { ...ok, checks: ['a', 'b', 'c', 'd'] },
    null,
  ];
  for (const b of bad) assert.deepEqual(load([b]), [], JSON.stringify(b));
});

test('duplicate section keeps first; route payload is {rules: []} when absent', () => {
  const out = load([ok, { ...ok, rule: 'Second.' }, { ...ok, section: 'meat', checks: [] }]);
  assert.deepEqual(out.map((r) => [r.section, r.rule]), [['produce', 'Smell the stem.'], ['meat', 'Smell the stem.']]);
  assert.deepEqual({ rules: loadSectionRules(join(dir, 'absent.json')) }, { rules: [] });
});
