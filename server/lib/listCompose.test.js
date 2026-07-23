// Conversational list composer — deterministic checks (no model calls).
//   node --test lib/listCompose.test.js

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseComposeJSON, buildComposeInput, SECTIONS, LIST_COMPOSE_SYSTEM } from './listCompose.js';

test('parseComposeJSON reads a bare object', () => {
  const r = parseComposeJSON('{"add":[{"name":"ground beef","section":"Meat & Seafood"}],"remove":["white rice"],"summary":"Added taco night."}');
  assert.equal(r.add.length, 1);
  assert.equal(r.add[0].name, 'ground beef');
  assert.equal(r.add[0].section, 'Meat & Seafood');
  assert.deepEqual(r.remove, ['white rice']);
  assert.match(r.summary, /taco/i);
});

test('parseComposeJSON strips a ```json fence', () => {
  const r = parseComposeJSON('```json\n{"add":[{"name":"tortillas","section":"Bakery"}],"remove":[],"summary":"ok"}\n```');
  assert.equal(r.add[0].name, 'tortillas');
});

test('parseComposeJSON coerces an unknown section to Pantry', () => {
  const r = parseComposeJSON('{"add":[{"name":"quinoa","section":"Grains"}],"remove":[],"summary":"added"}');
  assert.equal(r.add[0].section, 'Pantry');
});

test('parseComposeJSON returns null on garbage', () => {
  assert.equal(parseComposeJSON('not json'), null);
  assert.equal(parseComposeJSON('{"add":[],"remove":[],"summary":""}'), null); // nothing happened
});

test('buildComposeInput carries the instruction, current names, and pref labels', () => {
  const input = buildComposeInput({
    instruction: 'add taco night',
    mode: 'edit',
    currentItems: ['Rice or potatoes', 'Eggs'],
    goal: 'high_protein',
    focuses: ['lower_sugar'],
    hardLines: ['no_seed_oils'],
    constraints: ['budget'],
  });
  assert.equal(input.instruction, 'add taco night');
  assert.deepEqual(input.currentList, ['Rice or potatoes', 'Eggs']);
  assert.equal(input.shopper.goal, 'High-protein');
  assert.ok(input.shopper.hardLines.length === 1);
  assert.ok(input.shopper.constraints.includes('Shopping on a budget'));
});

test('the compose system prompt forbids price + health claims and lists the sections', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /NO PRICE/);
  assert.match(LIST_COMPOSE_SYSTEM, /no health\/medical language/i);
  assert.match(LIST_COMPOSE_SYSTEM, /HARD LINES/);
  for (const s of SECTIONS) assert.ok(LIST_COMPOSE_SYSTEM.includes(s), `${s} missing from prompt`);
});
