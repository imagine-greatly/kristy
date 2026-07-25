// The List generator — deterministic checks (no model calls).
//   node --test lib/list.test.js
//
// generateList is pure, so its whole contract (per-goal templates, hard-line
// exclusion on every tier, the premium focus/constraint gate, the stale-cache
// signature) is unit-testable without a DB or the model.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateList, listSignature } from './list.js';
import { GOAL_VALUES } from './taxonomy.js';

const DEFAULT_INTRO = "Here's a clean starting list.";

test('every taxonomy goal has its own template — none falls through to _default', () => {
  for (const goal of GOAL_VALUES) {
    const { intro } = generateList({ goal });
    assert.ok(
      !intro.startsWith(DEFAULT_INTRO),
      `goal "${goal}" has no template/alias — it fell through to _default`
    );
  }
});

test('the four previously-uncovered goals each build a distinct list', () => {
  const goals = ['weight_loss', 'muscle_strength', 'pregnancy_postpartum', 'athlete_performance'];
  const intros = new Set();
  for (const goal of goals) {
    const list = generateList({ goal });
    assert.ok(list.items.length >= 8, `${goal} list is too short`);
    intros.add(list.intro);
  }
  assert.equal(intros.size, goals.length, 'each of the four goals should have a distinct intro');
});

test('hard lines shape the list on the FREE tier — vegetarian removes meat & fish', () => {
  const { items } = generateList({ goal: 'high_protein', nonNegotiables: ['vegetarian'], premium: false });
  const names = items.map((i) => i.name.toLowerCase()).join(' | ');
  assert.doesNotMatch(names, /chicken|beef|turkey|fish|tuna|salmon/);
  assert.ok(items.some((i) => /egg|yogurt|bean|lentil|rice|potato/.test(i.name.toLowerCase())));
});

test('dairy-free removes dairy items on the free tier', () => {
  const { items } = generateList({ goal: 'family', nonNegotiables: ['dairy-free'], premium: false });
  assert.ok(!items.some((i) => /milk|yogurt|cheese/.test(i.name.toLowerCase())));
});

test('"no seed oils" clarifies olive oil in place on the FREE tier (a visible change)', () => {
  const plain = generateList({ goal: 'eating_cleaner', premium: false });
  assert.ok(plain.items.some((i) => i.name === 'Olive oil'));

  const line = generateList({ goal: 'eating_cleaner', nonNegotiables: ['no seed oils'], premium: false });
  assert.ok(!line.items.some((i) => i.name === 'Olive oil'), 'bare "Olive oil" should be clarified away');
  assert.ok(
    line.items.some((i) => /cold-pressed, not a blend/.test(i.name)),
    'olive oil should be clarified in place'
  );
});

test('focuses stay PREMIUM — a free list ignores them, a premium list folds them in', () => {
  const free = generateList({ goal: 'high_protein', focuses: ['higher_fiber'], premium: false });
  const prem = generateList({ goal: 'high_protein', focuses: ['higher_fiber'], premium: true });
  assert.ok(!free.items.some((i) => /chia|flax/.test(i.name.toLowerCase())));
  assert.ok(prem.items.some((i) => /chia|flax/.test(i.name.toLowerCase())));
});

test('multiple goals blend into ONE list — overlap-ranked, deduped, capped, named', () => {
  const blended = generateList({ goals: ['high_protein', 'eating_cleaner', 'family'] });
  assert.match(blended.intro, /^built for /i); // named in her voice…
  assert.match(blended.intro, /leaning on/i); // …and calls out the overlap
  const names = blended.items.map((i) => i.name.toLowerCase());
  assert.equal(new Set(names).size, names.length, 'no duplicate items');
  assert.ok(names.length >= 12 && names.length <= 18, `blended length ${names.length} out of range`);
  assert.ok(names.some((n) => n.includes('cottage cheese')), 'high-protein contributed');
  assert.ok(names.some((n) => n === 'milk'), 'family contributed');
});

test('the blend ranks OVERLAP first — a shared item leads a goal-unique one', () => {
  const names = generateList({ goals: ['high_protein', 'eating_cleaner', 'family'] }).items.map((i) => i.name.toLowerCase());
  const eggs = names.indexOf('eggs'); // in all three templates
  const berries = names.findIndex((n) => n.includes('berries')); // eating-cleaner only
  assert.ok(eggs >= 0 && berries >= 0);
  assert.ok(eggs < berries, 'an all-goals overlap item should rank above a single-goal one');
});

test('near-identical items collapse — not "Greek yogurt" AND "Plain Greek yogurt"', () => {
  const items = generateList({ goals: ['high_protein', 'eating_cleaner'] }).items;
  assert.equal(items.filter((i) => /greek yogurt/i.test(i.name)).length, 1);
});

test('near-identical goals share a cart — high_protein + muscle_strength stays tight', () => {
  const items = generateList({ goals: ['high_protein', 'muscle_strength'] }).items;
  assert.ok(items.length <= 14, `two overlapping protein templates should not double the list, got ${items.length}`);
});

test('five goals cap at ~18 items, not a 40-item wall', () => {
  const items = generateList({ goals: ['high_protein', 'eating_cleaner', 'family', 'gut_health', 'weight_loss'] }).items;
  assert.ok(items.length <= 18, `expected <=18, got ${items.length}`);
});

test('a single-goal set behaves exactly like the legacy single-goal template', () => {
  assert.equal(
    generateList({ goals: ['high_protein'] }).intro,
    generateList({ goal: 'high_protein' }).intro
  );
});

test('the generation signature changes with goal / hard lines and is order-independent', () => {
  const a = listSignature({ goal: 'high_protein', nonNegotiables: [] });
  const b = listSignature({ goal: 'weight_loss', nonNegotiables: [] });
  const c = listSignature({ goal: 'high_protein', nonNegotiables: ['no seed oils'] });
  assert.notEqual(a, b);
  assert.notEqual(a, c);
  assert.equal(
    listSignature({ goal: 'x', focuses: ['a', 'b'] }),
    listSignature({ goal: 'x', focuses: ['b', 'a'] })
  );
});
