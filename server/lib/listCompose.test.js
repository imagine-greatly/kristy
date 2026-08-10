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
/* A PROMPT MAY NOT MODEL THE WORD IT BANS.
   Measured 2026-08-05: every budget-constrained generation put "Cheap protein and carbs"
   in the summary — 4 runs of 4 — against the prompt's own rule forbidding a
   "cheap/expensive" label. The livetest already greps for `\bcheap(er)?\b` AND already
   exercises a `budget` constraint, and it passed 10/10, because its instruction never
   mentions money and the shopper's own words are the trigger.

   The root cause is not the missing case, it is that the prompt used the banned word twice
   as its OWN vocabulary for what to do — "cheaper-per-nutrition SELECTION" and "budget →
   cheaper staples" — while forbidding it in the same breath. A model given the word in a
   prescription will use the word. Naming it inside the prohibition is necessary and stays;
   using it anywhere else is the defect, and that distinction is what this checks.

   This is the half that runs on every commit. The live half is case 4 of
   scripts/listCompose.livetest.js, because only a real call can catch real output. */
test('the compose prompt never uses "cheap" outside the prohibition that names it', () => {
  // Strip the quoted ban, which HAS to say the words in order to forbid them.
  const withoutBan = LIST_COMPOSE_SYSTEM.replace(/never the words "cheap" or "expensive"[^\n]*/gi, '')
    .replace(/"cheap\/expensive"/gi, '')
    .replace(/"cheap"|"expensive"/gi, '');
  const leaks = withoutBan.match(/\bcheap(er|est)?\b/gi) || [];
  assert.deepEqual(
    leaks,
    [],
    'the prompt prescribes the word it forbids — a model handed "cheaper staples" writes "cheap protein"'
  );
});

test('the compose prompt gives budget a vocabulary of its own, not a price label', () => {
  // A ban with no substitute is a gap the model fills from its own habits. These are the
  // words it should reach for instead.
  assert.match(LIST_COMPOSE_SYSTEM, /\bstretch(es)?\b/i, 'budget needs the words to use, not only the ones to avoid');
  assert.match(LIST_COMPOSE_SYSTEM, /dried beans/i, 'and a concrete selection example');
  assert.match(LIST_COMPOSE_SYSTEM, /NO PRICE/);
});

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

/* ───────── THE LIST CARRIES ANYTHING AND JUDGES ONLY FOOD ─────────
   CLAUDE.md, ruled 2026-08-09: "Compose may never refuse to add what a shopper asked for,
   and may never explain why it declined." This was a stated promise with NO test — the
   second member of the findings family — and the prompt broke it two ways: it called its
   own output "grocery ITEMS ONLY", and its not-about-groceries door read as a licence to
   decline a non-food item and narrate the refusal.

   The rest of the machinery was already right, which is why the defect was prompt-only: a
   composed row's `section` becomes its cart `category` (cartEdit.js), 'Pantry' names no
   walk section (listSections.js CATEGORY_SECTION), so a non-food row lands in the trailing
   "Everything else" group with no card and no do line — exactly what the ruling describes.
   Only the model's willingness to emit the row at all was missing. */

test('the compose prompt puts a non-food item ON the list rather than declining it', () => {
  assert.match(LIST_COMPOSE_SYSTEM, /THE LIST CARRIES ANYTHING\. YOU JUDGE ONLY FOOD\./);
  // The instruction must be to ADD it, and to say nothing about it.
  assert.match(LIST_COMPOSE_SYSTEM, /PUT IT ON THE LIST/);
  assert.match(LIST_COMPOSE_SYSTEM, /NEVER decline an item/);
  assert.match(LIST_COMPOSE_SYSTEM, /never say anything ABOUT it/);
  // ⚠️ The silence is the feature: an honest absence, never a weak claim in its place.
  assert.match(LIST_COMPOSE_SYSTEM, /Adding it and saying nothing IS the correct handling/);
  // It must not call its own output food-only — that framing is what made a refusal read
  // as obedience. "SHOPPING ITEMS" is the replacement; "grocery ITEMS ONLY" is the defect.
  assert.ok(
    !/grocery ITEMS ONLY/.test(LIST_COMPOSE_SYSTEM),
    'the prompt still describes its output as grocery-only, which is what declined dish soap'
  );
});

test('the not-about-groceries door cannot be read as a non-food refusal', () => {
  /* The door is legitimate — an instruction naming nothing to buy has nothing to add — so
     it stays. What it may never be is the exit a non-food ITEM takes. A ban with no
     substitute is a gap the model fills from habit, so the door names the rule to use
     instead rather than only forbidding itself. */
  assert.match(LIST_COMPOSE_SYSTEM, /names NOTHING TO BUY/);
  assert.match(LIST_COMPOSE_SYSTEM, /An item being non-food is never a reason to use it/);
  assert.match(LIST_COMPOSE_SYSTEM, /THE LIST CARRIES ANYTHING above/);
  // The superseded wording keyed on the INSTRUCTION's subject, which is the misread.
  assert.ok(
    !/not about groceries at all/.test(LIST_COMPOSE_SYSTEM),
    'the old door survives; it is the sentence that licensed the refusal'
  );
});
