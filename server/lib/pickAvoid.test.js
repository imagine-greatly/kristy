// pick-avoid-1: an optional `avoid` sentence on a pick rides to the row as `pickAvoid`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from './testGuards.js';
import { perimeterKb } from './perimeter.js';
import { attachCards } from './listMatch.js';
import { sanitizeList } from './cartEdit.js';
import { lintPick } from './counterCardLint.js';

const AVOIDS = {
  pick_corn: ['corn', 'Skip corn labeled bioengineered, the US label word for genetically engineered.'],
  pick_tofu: ['tofu', 'Skip tofu labeled bioengineered, the US label word for genetically engineered.'],
  pick_juice: ['orange juice', 'Skip juice drinks listing benzoates, benzoic acid, BVO or artificial color.'],
  pick_cucumbers: ['cucumbers', 'Skip cucumbers coated with wax, shellac or carnauba wax.'],
  // clean-sweep-J1 (2026-10-22): register BPA line; juice and cucumber lines widened.
  pick_canned_tomatoes: ['canned tomatoes', 'Skip cans with no BPA-free lining stated on the label.'],
  // clean-sweep-J3 (2026-10-22): register mechanically-separated and liquid-smoke lines.
  pick_sausage: ['sausage', 'Skip sausage that lists mechanically separated (machine-stripped) chicken, turkey or pork.'],
  pick_jerky: ['jerky', 'Skip jerky that lists liquid smoke or smoke flavoring.'],
  // clean-sweep-J4 (2026-10-22): register pangasius and MSC low-bar lines.
  pick_fish_sticks: ['fish sticks', 'Skip Vietnam swai or basa; critics call ‘MSC certified’ a low bar.'],
};
const entries = perimeterKb.entries || [];
const byId = (id) => entries.find((e) => e.id === id);

test('exactly the eight picks carry avoid, each lint-clean', () => {
  const withAvoid = entries.filter((e) => 'avoid' in e).map((e) => e.id).sort();
  assert.deepEqual(withAvoid, Object.keys(AVOIDS).sort());
  for (const [id, [, line]] of Object.entries(AVOIDS)) {
    assert.equal(byId(id).avoid, line, id);
    assert.deepEqual(lintPick(byId(id)), [], id);
  }
});

test('the eight picks resolve with pickAvoid through attachCards', () => {
  const rows = Object.values(AVOIDS).map(([name], i) => ({ id: `r${i}`, name, source: 'user' }));
  nonEmpty(rows, 'rows', 8);
  const out = attachCards({ items: rows }, { log: false }).items;
  Object.entries(AVOIDS).forEach(([id, [name, line]], i) => {
    assert.equal(out[i].pickId, id, name);
    assert.equal(out[i].pickAvoid, line, name);
  });
});

test('a pick without avoid attaches with no pickAvoid key', () => {
  const plain = entries.find((e) => e.kind === 'pick' && !('avoid' in e) && e.aliases?.length);
  assert.ok(plain, 'a pick without avoid exists');
  const [row] = attachCards({ items: [{ id: 'p', name: plain.aliases[0], source: 'user' }] }, { log: false, pickPool: [plain] }).items;
  assert.equal(row.pickId, plain.id);
  assert.ok(!('pickAvoid' in row), 'absent, never empty');
});

test('sanitizeList round-trips pickAvoid, trimmed and capped; drops empty', () => {
  const base = { title: 'List', items: [
    { id: 'a', name: 'corn', carded: true, pickId: 'pick_corn', pickLine: 'x.', pickAvoid: '  Skip corn labeled bioengineered.  ' },
    { id: 'b', name: 'tofu', carded: true, pickId: 'pick_tofu', pickLine: 'x.', pickAvoid: 'y'.repeat(300) },
    { id: 'c', name: 'kale', carded: true, pickId: 'pick_kale', pickLine: 'x.', pickAvoid: '   ' },
  ] };
  const items = sanitizeList(base).items;
  assert.equal(items[0].pickAvoid, 'Skip corn labeled bioengineered.');
  assert.equal(items[1].pickAvoid.length, 200);
  assert.ok(!('pickAvoid' in items[2]));
  assert.deepEqual(sanitizeList({ title: 'List', items }).items, items);
});

test('lint rejects a first-person, em-dash or 13-word avoid', () => {
  const corn = byId('pick_corn');
  const codes = (avoid) => lintPick({ ...corn, avoid }).map((f) => f.code);
  assert.ok(codes('Skip what we call bioengineered corn.').includes('PICK_AVOID_FIRST_PERSON'));
  assert.ok(codes('Skip corn — labeled bioengineered.').includes('PICK_AVOID_EM_DASH'));
  const thirteen = 'Skip corn ears that are labeled bioengineered on the bag or the tray.';
  assert.equal(thirteen.split(/\s+/).length, 13);
  assert.ok(codes(thirteen).includes('PICK_AVOID_TOO_LONG'));
  assert.ok(codes('').includes('PICK_AVOID_EMPTY'));
});
