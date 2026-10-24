// Owns the live family cascade; historical snapshots use preFamilyCascade in cartPlain.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nonEmpty } from '../../lib/testGuards.js';
import { preFamilyCascade } from './cartPlain.js';

const { entries } = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const families = nonEmpty(entries.filter((e) => e.kind === 'family'), 'live families');
const aisles = nonEmpty(entries.filter((e) => e.kind === 'aisle'), 'live aisles');
const cards = nonEmpty(entries.filter((e) => e.kind !== 'family' && e.kind !== 'aisle'), 'live member cards');

test('family cascade: live family and aisle entries have their own ids and 12 aisles', () => {
  assert.equal(aisles.length, 12);
  for (const e of families) assert.match(e.id, /^fam_/, e.id);
  for (const e of aisles) assert.match(e.id, /^aisle_/, e.id);
});

test('family cascade: every member family reference resolves to a live family', () => {
  const ids = new Set(families.map((e) => e.id));
  const members = nonEmpty(cards.filter((e) => Object.hasOwn(e, 'family')), 'members with family references');
  for (const e of members) assert.ok(ids.has(e.family), `${e.id}: missing family ${e.family}`);
});

test('family cascade: optional member deltas are strings of at most 400 characters', () => {
  const members = nonEmpty(cards.filter((e) => Object.hasOwn(e, 'delta')), 'members with deltas');
  for (const e of members) {
    assert.equal(typeof e.delta, 'string', `${e.id}.delta`);
    assert.ok(e.delta.length <= 400, `${e.id}.delta: ${e.delta.length} characters`);
  }
});

test('family cascade: family and aisle entries have no aliases', () => {
  for (const e of [...families, ...aisles]) assert.ok(!Object.hasOwn(e, 'aliases'), `${e.id} has aliases`);
});

test('family cascade: flour decision pins the live sourcing order', () => {
  const flour = entries.find((e) => e.id === 'flour_basics');
  assert.ok(flour, 'flour_basics exists');
  assert.equal(flour.decision, 'sprouted or freshly ground first, soaked at home next');
});

test('family cascade: historical overlay changes only cascade fields and preserves its input', () => {
  const input = [
    { id: 'fam_fixture', kind: 'family' },
    { id: 'aisle_fixture', kind: 'aisle' },
    { id: 'flour_basics', decision: 'Live flour decision', family: 'fam_fixture', delta: 'Flour delta', sources: ['Flour source'] },
    { id: 'member', decision: 'Live member decision', family: 'fam_fixture', delta: 'Member delta', aliases: ['Member alias'] },
    { id: 'plain', decision: 'Unchanged', buying_tips: ['Keep this tip'] },
    { id: 'pick_fixture', kind: 'pick', family: 'fam_fixture', delta: 'Pick delta', decision: 'Keep this pick' },
  ];
  const original = structuredClone(input);
  const expected = [
    { id: 'flour_basics', decision: 'Organic sprouted flour, or fresh-ground whole grain, soaked.', sources: ['Flour source'] },
    { id: 'member', decision: 'Live member decision', aliases: ['Member alias'] },
    { id: 'plain', decision: 'Unchanged', buying_tips: ['Keep this tip'] },
    { id: 'pick_fixture', kind: 'pick', decision: 'Keep this pick' },
  ];
  assert.deepEqual(preFamilyCascade(input), expected);
  assert.deepEqual(input, original);
  assert.deepEqual(preFamilyCascade(expected), expected);
});
