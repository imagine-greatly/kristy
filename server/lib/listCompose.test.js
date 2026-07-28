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
  assert.match(LIST_COMPOSE_SYSTEM, /no health (or|\/)\s?medical language/i);
  assert.match(LIST_COMPOSE_SYSTEM, /HARD LINES/);
  for (const s of SECTIONS) assert.ok(LIST_COMPOSE_SYSTEM.includes(s), `${s} missing from prompt`);
});

/* ───────── The shopper drives (the "generic imposed cart" fix) ─────────
   The cart is the OUTPUT of what they said, not a template wearing their name. These
   pin the three rules that make that true, so a future prompt edit can't quietly
   restore template-first behaviour. */
test('the compose prompt makes the shopper drive and forbids padding', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /THE SHOPPER DRIVES/);
  assert.match(LIST_COMPOSE_SYSTEM, /DO NOT PAD/);
  // Specify what they named, rather than substituting a template for it.
  assert.match(LIST_COMPOSE_SYSTEM, /SPECIFY what they named/i);
});

test('the compose prompt champions whole-food carbs and keeps champions contextual', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /WHOLE-FOOD CARBS ARE CHAMPIONED/);
  for (const carb of ['sweet potatoes', 'sourdough', 'quinoa', 'brown or jasmine rice']) {
    assert.ok(LIST_COMPOSE_SYSTEM.toLowerCase().includes(carb), `${carb} missing from the carb list`);
  }
  assert.match(LIST_COMPOSE_SYSTEM, /CHAMPIONS ARE CONTEXTUAL, NEVER DEFAULT/);
  // Meal roundout exists, but must not become a recipe app.
  assert.match(LIST_COMPOSE_SYSTEM, /NOT recipe planning/i);
});

test('the compose prompt bans first person and em-dash asides in the summary', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /NO FIRST PERSON/);
  assert.match(LIST_COMPOSE_SYSTEM, /NO EM-DASH ASIDES/);
  // The tier honesty survives as a named standard rather than a person's opinion.
  assert.match(LIST_COMPOSE_SYSTEM, /whole-food-standard/i);
});

/* ───────── "Best brands" is answered honestly, never invented ─────────
   A shopper can ask for "only the best brands." We have no brand data, so naming a
   company would be fabrication the shopper carries into a store. The prompt must
   redirect to the verifiable form on the package instead. */

test('the compose prompt forbids inventing brands and redirects to the label', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /NEVER INVENT A BRAND/);
  assert.match(LIST_COMPOSE_SYSTEM, /do NOT name companies/i);
  // It must offer the honest substitute: what to look for on the package.
  assert.match(LIST_COMPOSE_SYSTEM, /VERIFIABLE FORM/);
  assert.match(LIST_COMPOSE_SYSTEM, /pasture-raised eggs/i);
  // A brand is allowed only when the shopper supplied it.
  assert.match(LIST_COMPOSE_SYSTEM, /ONLY if the shopper named it first/i);
});
