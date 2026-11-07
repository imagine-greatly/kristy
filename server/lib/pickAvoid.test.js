// pick-avoid-1: an optional `avoid` sentence on a pick rides to the row as `pickAvoid`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from './testGuards.js';
import { perimeterKb } from './perimeter.js';
import { attachCards } from './listMatch.js';
import { sanitizeList } from './cartEdit.js';
import { lintPick } from './counterCardLint.js';

const AVOIDS = {
  pick_juice: ['orange juice', 'Skip juice drinks listing benzoates, benzoic acid, BVO or artificial color.'],
  // clean-sweep-J1 (2026-10-22): register BPA line; juice line widened.
  pick_canned_tomatoes: ['canned tomatoes', 'Skip cans with no BPA-free lining stated on the label.'],
  // clean-sweep-J3 (2026-10-22): register mechanically-separated line.
  pick_sausage: ['sausage', 'Skip sausage that lists mechanically separated (machine-stripped) chicken, turkey or pork.'],
};
// v3-newcards (ef4f2f8, 2026-11-07): pick_corn, pick_tofu, pick_cucumbers, pick_jerky and pick_fish_sticks became
// cards, and a card has no `avoid`. The card that took each slot carries the avoid subject in its own copy instead;
// fish_sticks carries no swai/basa/MSC line, a gap reported for review, not invented here.
const CARRIED = {
  corn: ['watch_out', 'Skip corn labeled bioengineered, the US label word for genetically engineered.'],
  tofu: ['watch_out', 'Skip tofu labeled bioengineered, the US label word for genetically engineered.'],
  cucumbers: ['watch_out', 'A shiny, slick skin usually means a wax coating.'],
  jerky: ['buying_tips', 'Naturally smoked, with no liquid smoke or smoke flavoring.'],
};
const entries = perimeterKb.entries || [];
const byId = (id) => entries.find((e) => e.id === id);

test('exactly the three picks carry avoid, each lint-clean', () => {
  const withAvoid = entries.filter((e) => 'avoid' in e).map((e) => e.id).sort();
  assert.deepEqual(withAvoid, Object.keys(AVOIDS).sort());
  for (const [id, [, line]] of Object.entries(AVOIDS)) {
    assert.equal(byId(id).avoid, line, id);
    assert.deepEqual(lintPick(byId(id)), [], id);
  }
});

test('the three picks resolve with pickAvoid through attachCards', () => {
  const rows = Object.values(AVOIDS).map(([name], i) => ({ id: `r${i}`, name, source: 'user' }));
  nonEmpty(rows, 'rows', 3);
  const out = attachCards({ items: rows }, { log: false }).items;
  Object.entries(AVOIDS).forEach(([id, [name, line]], i) => {
    assert.equal(out[i].pickId, id, name);
    assert.equal(out[i].pickAvoid, line, name);
  });
});

test('the cards that took four avoid picks\u2019 slots carry the avoid subject', () => {
  nonEmpty(Object.keys(CARRIED), 'carried', 4);
  for (const [id, [field, line]] of Object.entries(CARRIED)) {
    assert.ok(!byId(`pick_${id}`), `pick_${id} is retired`);
    assert.ok((byId(id)[field] || []).includes(line), `${id}.${field}`);
  }
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
