// K2-0: the probe's --universe mode counts covered vs uncovered, and CARRIED_HINTS carries brand rows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

test('universe mode: known-covered row covered, garbage row uncovered, carried apart', () => {
  const f = join(mkdtempSync(join(tmpdir(), 'uni-')), 'u.json');
  writeFileSync(f, JSON.stringify([
    { item: 'chicken thighs', section: 'Meat', mechanism: 'card' },
    { item: 'zzqx flurb', section: 'Meat', mechanism: 'card' },
    { item: 'oreos', section: 'Carried', mechanism: 'carried' },
  ]));
  const out = execFileSync('node', [join(HERE, '..', 'scripts', 'listMatchProbe.js'), '--universe', f], { encoding: 'utf8' });
  assert.match(out, /Meat\s+1\/2/);
  assert.match(out, /UNCOVERED \(1\)[\s\S]*zzqx flurb/);
  assert.match(out, /carried \(not gaps\): 1/);
});

test('CARRIED_HINTS lists brand rows and is wired into suspect()', () => {
  const src = readFileSync(join(HERE, '..', 'scripts', 'compileGapBacklog.js'), 'utf8');
  const list = src.match(/CARRIED_HINTS = \[([\s\S]*?)\]/)[1];
  assert.match(list, /'oreos'/);
  assert.match(src, /\.\.\.CARRIED_HINTS/);
});
