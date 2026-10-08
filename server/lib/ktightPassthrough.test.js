// KTIGHT passthrough (TestFlight 9 piece K-b): `pick_steps` and `science` are FREE fields.
// They must survive every hop from KB entry to wire: projectEntry -> cardToRow (migration
// write) -> CARD_COLUMNS (the select) -> rowToCard -> forViewer for a free viewer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectEntry, cardToRow, rowToCard, forViewer, DEPTH_FIELDS } from './counterCards.js';

const PICK_STEPS = ['Look for a firm one.', 'Skip any with soft spots.'];
const SCIENCE = 'Firmness tracks how recently it was picked.';
const entry = {
  id: 'ktight_probe',
  title: 'Probe',
  category: 'produce',
  decision: 'A headline.',
  pick_steps: PICK_STEPS,
  science: SCIENCE,
};

test('projectEntry carries pick_steps and science from an entry that has them', () => {
  const card = projectEntry(entry);
  assert.deepEqual(card.pick_steps, PICK_STEPS);
  assert.equal(card.science, SCIENCE);
});

test('projectEntry emits null for both when the entry has not authored them', () => {
  const { pick_steps, science, ...rest } = entry;
  const card = projectEntry(rest);
  assert.equal(card.pick_steps, null);
  assert.equal(card.science, null);
});

test('both fields survive cardToRow and rowToCard', () => {
  const row = cardToRow(projectEntry(entry));
  assert.deepEqual(row.pick_steps, PICK_STEPS);
  assert.equal(row.science, SCIENCE);
  const back = rowToCard(row);
  assert.deepEqual(back.pick_steps, PICK_STEPS);
  assert.equal(back.science, SCIENCE);
});

test('CARD_COLUMNS selects both columns', () => {
  const src = readFileSync(new URL('./counterCards.js', import.meta.url), 'utf8');
  const m = src.match(/const CARD_COLUMNS =([\s\S]*?);/);
  assert.ok(m, 'CARD_COLUMNS must be found in counterCards.js');
  const cols = m[1].match(/'([^']*)'/g).join('').replace(/'/g, '').split(',').map((c) => c.trim());
  assert.ok(cols.includes('pick_steps'), 'CARD_COLUMNS must select pick_steps');
  assert.ok(cols.includes('science'), 'CARD_COLUMNS must select science');
});

test('both are free: not depth fields, and a free viewer receives them', () => {
  assert.ok(!DEPTH_FIELDS.includes('pick_steps') && !DEPTH_FIELDS.includes('science'));
  const free = forViewer(projectEntry(entry), { premium: false });
  assert.deepEqual(free.pick_steps, PICK_STEPS);
  assert.equal(free.science, SCIENCE);
});
