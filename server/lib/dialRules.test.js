import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dialFindings } from './dialRules.js';

const codes = (entries) => dialFindings(entries).map((f) => f.code);
const family = (tips, extra = {}) => ({ id: 'fam_x', kind: 'family', decision: 'Pick organic.', buying_tips: tips, ...extra });
const GOOD_TIPS = ['Look for the USDA Organic seal.', 'Check the origin sticker.', 'Skip waxed skins.'];

test('clean family and member yield nothing', () => {
  assert.deepEqual(dialFindings([family(GOOD_TIPS), { id: 'a', family: 'fam_x', delta: 'No wax; in season Aug-Nov.' }]), []);
});

test('DIAL_UNLEGIBLE across every shelf-facing field and ban pattern', () => {
  const cases = [
    ['decision', 'Organic, grown without sprays.'],
    ['delta', 'Unsprayed if you can.'],
    ['buying_tips', ['Pick no-pesticide fruit.']],
    ['pick_steps', ['Pick pesticide-free greens.']],
    ['short_answer', 'Choose ones not sprayed.'],
    ['decision', 'No sprays.'],
  ];
  for (const [field, v] of cases) {
    const f = dialFindings([{ id: 'x', [field]: v }]);
    assert.ok(f.some((x) => x.code === 'DIAL_UNLEGIBLE' && x.field === field), `${field}: ${v}`);
  }
  assert.deepEqual(codes([{ id: 'x', why: 'grown without sprays' }]), [], 'why is not a shelf field');
});

test('DIAL_FAMILY_SHAPE: 5 tips, long tip, bad verb', () => {
  assert.ok(codes([family([...GOOD_TIPS, 'Read the label.', 'Ask the butcher.'])]).includes('DIAL_FAMILY_SHAPE'));
  assert.ok(codes([family(['Look for ' + 'x'.repeat(90)])]).includes('DIAL_FAMILY_SHAPE'));
  assert.ok(codes([family(['Best: organic.'])]).includes('DIAL_FAMILY_SHAPE'));
  assert.deepEqual(codes([{ id: 'c', buying_tips: ['Best: organic.', 'a', 'b', 'c', 'd'] }]), [], 'non-family unchecked');
});

test('DIAL_DELTA: long, clause-heavy, or repeats a family tip', () => {
  assert.ok(codes([{ id: 'a', delta: 'x'.repeat(121) }]).includes('DIAL_DELTA'));
  assert.ok(codes([{ id: 'a', delta: 'No wax, firm, in season Aug-Nov.' }]).includes('DIAL_DELTA'));
  assert.ok(codes([family(GOOD_TIPS), { id: 'a', family: 'fam_x', delta: 'Check the origin sticker.' }]).includes('DIAL_DELTA'));
});

test('DIAL_REPEAT: one sentence in two deltas', () => {
  const f = dialFindings([{ id: 'a', delta: 'In season Aug-Nov. No wax.' }, { id: 'b', delta: 'Thin skin. In season Aug-Nov.' }]);
  assert.deepEqual(f.filter((x) => x.code === 'DIAL_REPEAT').map((x) => x.id), ['b']);
});

test('DIAL_HEDGE in decision/tips/delta, allowed in detail/science/watch_out', () => {
  for (const [field, v] of [['decision', 'This is not a health ranking.'], ['buying_tips', ['Pick this; editorial preference.']], ['delta', 'Data does not establish it.']]) {
    assert.ok(dialFindings([{ id: 'h', [field]: v }]).some((x) => x.code === 'DIAL_HEDGE' && x.field === field), field);
  }
  assert.deepEqual(codes([{ id: 'h', detail: 'does not establish', science: 'not a health ranking', watch_out: ['editorial preference'] }]), []);
});

test('CLI: exit 1 with findings, 0 when clean; accepts array or {entries}', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dial-'));
  const cli = fileURLToPath(new URL('./dialRules.js', import.meta.url));
  const bad = join(dir, 'bad.json'), good = join(dir, 'good.json');
  writeFileSync(bad, JSON.stringify({ entries: [{ id: 'x', decision: 'grown without sprays' }] }));
  writeFileSync(good, JSON.stringify([family(GOOD_TIPS)]));
  const r1 = spawnSync(process.execPath, [cli, bad], { encoding: 'utf8' });
  assert.equal(r1.status, 1);
  assert.match(r1.stdout, /DIAL_UNLEGIBLE\tx\tdecision/);
  assert.equal(spawnSync(process.execPath, [cli, good], { encoding: 'utf8' }).status, 0);
});

