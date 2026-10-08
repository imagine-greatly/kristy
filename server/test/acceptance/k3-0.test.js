// K3-0b: list-word probe (--universe rows with list_words, --strict).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { nonEmpty } from '../../lib/testGuards.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '../..');
const ROWS = nonEmpty(JSON.parse(readFileSync(join(SERVER, '../docs/coverage/list-words.json'), 'utf8')), 'K3-0 list-word rows', 30);
const probe = (rows, ...flags) => {
  const p = join(mkdtempSync(join(tmpdir(), 'k30-')), 'u.json');
  writeFileSync(p, JSON.stringify(rows));
  return spawnSync('node', ['scripts/listMatchProbe.js', '--universe', p, ...flags], { cwd: SERVER, encoding: 'utf8' });
};

test('fixture list_words pita+naan expect pick_pita_naan is covered', () => {
  const r = probe([{ section: 'Bread', item: 'pita and naan', expect: 'pick_pita_naan', list_words: ['pita', 'naan'] }], '--strict');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /TOTAL\s+1\/1/);
  assert.match(r.stdout, /MISSING 0/);
});

test('a word attaching a different id fails --strict', () => {
  const r = probe([{ section: 'Bread', item: 'pita', expect: 'egg_labels', list_words: ['pita'] }], '--strict');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /WRONG/);
  assert.match(r.stdout, /TOTAL\s+0\/1/);
});

test('a word attaching nothing is MISSING and fails --strict only', () => {
  const rows = [{ section: 'X', item: 'zzqx', expect: 'egg_labels', list_words: ['zzqx glorp'] }];
  const r = probe(rows, '--strict');
  assert.equal(r.status, 1);
  assert.match(r.stdout, /MISSING 1/);
  assert.equal(probe(rows).status, 0);
});

test('list-words.json is clean under --strict', () => {
  const r = spawnSync('node', ['scripts/listMatchProbe.js', '--universe', '../docs/coverage/list-words.json', '--strict'], { cwd: SERVER, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /MISSING 0/);
  assert.doesNotMatch(r.stderr, /WRONG/);
  assert.equal(ROWS.length, ROWS.filter((x) => x.expect && x.list_words?.length).length);
});
