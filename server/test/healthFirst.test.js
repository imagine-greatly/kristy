// Health-first lint (chf-1): CULINARY_AIM and REPEATED_CLAIM over the curated corpus. Cards
// that fail today sit in HEALTH_FIRST_PENDING; anything outside it must be clean.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../lib/doLines.json' with { type: 'json' };
import { nonEmpty } from '../lib/testGuards.js';
import {
  HEALTH_FIRST_PENDING, OWNED_FACTS, REPEATED_CLAIM_FIELDS, lintCulinaryAim, lintRepeatedClaim, stringsIn, POINTER,
} from '../lib/counterCardLint.js';
import { assertPassRule, HEALTH_FIRST_REWRITE } from './acceptance/passRule.js';

const byId = new Map(kb.entries.map((e) => [e.id, e]));
const inFamily = new Set(OWNED_FACTS.flatMap((r) => r.family));
// Question cards, plus the picks a family or the pending list names.
const cards = nonEmpty(
  kb.entries.filter((e) => e.kind !== 'pick' || inFamily.has(e.id) || HEALTH_FIRST_PENDING.has(e.id)),
  'health-first corpus', 200
);
nonEmpty(OWNED_FACTS, 'OWNED_FACTS', 13);
// Ratchet: PENDING only shrinks; each batch lowers the ceiling as it removes ids.
assert.ok(HEALTH_FIRST_PENDING.size <= 21, `HEALTH_FIRST_PENDING grew: ${HEALTH_FIRST_PENDING.size} > 21`);

test('every card outside HEALTH_FIRST_PENDING is clean on both rules; HEAD hits printed', (t) => {
  const hits = { CULINARY_AIM: new Set(), REPEATED_CLAIM: new Set(), POINTER_UNKNOWN_OWNER: new Set() };
  const outside = [];
  for (const card of cards) {
    const found = [...lintCulinaryAim(card), ...lintRepeatedClaim(card)];
    for (const f of found) hits[f.code].add(card.id);
    if (found.length && !HEALTH_FIRST_PENDING.has(card.id)) outside.push(`${card.id}: ${found[0].code} ${found[0].text}`);
  }
  for (const [code, ids] of Object.entries(hits)) t.diagnostic(`${code} ${ids.size}: ${[...ids].join(', ')}`);
  for (const row of OWNED_FACTS) {
    const prose = REPEATED_CLAIM_FIELDS.flatMap((f) => stringsIn(byId.get(row.owner)?.[f]));
    if (!prose.some((s) => row.pattern.test(s))) t.diagnostic(`OWNER_GAP: ${row.fact} ${row.owner}`);
  }
  assert.deepEqual(outside, []);
});

test('every pending, owner and family id exists; ownerTitle is the KB title', () => {
  for (const id of HEALTH_FIRST_PENDING) assert.ok(byId.has(id), `pending id missing from KB: ${id}`);
  for (const row of OWNED_FACTS) {
    assert.ok(byId.has(row.owner), `owner missing: ${row.owner}`);
    for (const id of nonEmpty(row.family, `${row.fact} family`)) assert.ok(byId.has(id), `family id missing: ${id}`);
    assert.ok(row.ownerTitle, `${row.fact} ownerTitle empty`);
    assert.equal(row.ownerTitle, byId.get(row.owner).title);
  }
});

test('doLines: family do lines repeat no owned fact outside PENDING', () => {
  const outside = [];
  for (const row of OWNED_FACTS) {
    for (const id of row.family) {
      const line = doLines[id];
      if (typeof line === 'string' && !POINTER.test(line) && row.pattern.test(line) && !HEALTH_FIRST_PENDING.has(id)) {
        outside.push(`${id}: ${row.fact}`);
      }
    }
  }
  assert.deepEqual(outside, []);
});

const beefTitle = OWNED_FACTS.find((r) => r.fact === 'beef_raising').ownerTitle;
const codes = (r) => r.map((x) => x.code);

test('fixture: "80/20 for burgers." is CULINARY_AIM', () => {
  assert.deepEqual(codes(lintCulinaryAim({ id: 'x', decision: '80/20 for burgers.' })), ['CULINARY_AIM']);
});
test('fixture: "Firm, no slime." is not CULINARY_AIM', () => {
  assert.deepEqual(lintCulinaryAim({ id: 'x', pick_steps: ['Firm, no slime.'] }), []);
});
test('fixture: grass-finished step on a beef sibling is REPEATED_CLAIM', () => {
  const r = lintRepeatedClaim({ id: 'ground_beef_lean_ratio', pick_steps: ['Grass-finished when the case has it.'] });
  assert.deepEqual(r.map((x) => [x.code, x.fact]), [['REPEATED_CLAIM', 'beef_raising']]);
});
test('fixture: the same step on the owner is clean', () => {
  assert.deepEqual(lintRepeatedClaim({ id: 'beef_grassfed_vs_grainfed', pick_steps: ['Grass-finished when the case has it.'] }), []);
});
test('fixture: a pointer to the owner title is clean', () => {
  assert.ok(beefTitle);
  assert.deepEqual(lintRepeatedClaim({ id: 'ground_beef_lean_ratio', pick_steps: [`How it was raised: see ${beefTitle}.`] }), []);
});
test('fixture: a pointer to a non-owner title is POINTER_UNKNOWN_OWNER', () => {
  const r = lintRepeatedClaim({ id: 'ground_beef_lean_ratio', pick_steps: ['How it was raised: see Beef grades.'] });
  assert.deepEqual(codes(r), ['POINTER_UNKNOWN_OWNER']);
});
test('fixture: a labels_decoded term is skipped, its meaning is scanned', () => {
  const item = (meaning) => ({ id: 'shrimp_imported_vs_domestic', labels_decoded: [{ term: 'Farm-raised', meaning }] });
  assert.deepEqual(lintRepeatedClaim(item('Pond or tank raised; quality depends entirely on the operation.')), []);
  assert.deepEqual(codes(lintRepeatedClaim(item('Farmed shrimp from a pond.'))), ['REPEATED_CLAIM']);
});
test('fixture: "tenderized" is not the culinary "tender"', () => {
  assert.deepEqual(lintCulinaryAim({ id: 'beef_cuts_basics', pick_steps: ['Mechanically tenderized steaks need full cooking.'] }), []);
});

test('fixture: a changed cart_pick fails the pass rule outside HEALTH_FIRST_REWRITE, passes inside it', () => {
  const old = { id: 'not_a_rewrite_id', cart_pick: 'Chuck roast', decision: 'x' };
  assert.ok(!HEALTH_FIRST_REWRITE.has(old.id));
  assert.throws(() => assertPassRule(null, old, { ...old, cart_pick: 'Whole chuck' }), /frozen field cart_pick/);
  const inSet = { ...old, id: 'beef_cuts_basics' };
  assert.doesNotThrow(() => assertPassRule(null, inSet, { ...inSet, cart_pick: 'Whole chuck' }));
});
