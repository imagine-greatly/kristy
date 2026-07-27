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
import { perimeterKb } from './perimeter.js';

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
  assert.ok(plain.items.some((i) => /^extra-virgin olive oil/i.test(i.name)));
  assert.ok(!plain.items.some((i) => /cold-pressed/i.test(i.name)), 'no line ⇒ no clarifier');

  const line = generateList({ goal: 'eating_cleaner', nonNegotiables: ['no seed oils'], premium: false });
  assert.ok(
    line.items.some((i) => /cold-pressed, single origin/.test(i.name)),
    'olive oil should be clarified in place'
  );
  // The rename replaces the REASON too — a stale why under a new name would read as
  // Kristy explaining a decision she didn't make.
  const oil = line.items.find((i) => /cold-pressed, single origin/.test(i.name));
  assert.match(oil.why, /single origin|blend/i, 'the clarified pick carries its own reason');
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
  assert.ok(names.some((n) => n.includes('milk')), 'family contributed');
});

test('the blend ranks OVERLAP first — a shared item leads a goal-unique one', () => {
  const names = generateList({ goals: ['high_protein', 'eating_cleaner', 'family'] }).items.map((i) => i.name.toLowerCase());
  const eggs = names.findIndex((n) => n.includes('egg')); // in all three templates
  const berries = names.findIndex((n) => n.includes('berries') || n.includes('blueberries')); // eating-cleaner only
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

/* ═══════════════ Block V — every row is a DECISION, not a category ═══════════════
   The failure this replaces: a list of category headers ("Chicken or fish", "Leafy
   greens", "Oats or rice") hands the decision back to the shopper, which is the one
   job the app exists to do for them. These are the tripwires. */

// The exact category rows this block set out to kill. An either/or of two SPECIFIC
// picks is fine ("Spinach or arugula — whichever's freshest"); an either/or of two
// whole categories is not.
const CATEGORY_ROWS = [
  'chicken or fish', 'leafy greens', 'oats or rice', 'unsalted nuts', 'seasonal vegetables',
  'non-starchy vegetables', 'beans or lentils', 'rice or potatoes', 'easy vegetables',
  'fruit the kids will eat', 'canned fish', 'fatty fish (salmon or sardines)',
  'nuts and seeds', 'lean ground beef or turkey', 'rice, pasta, or potatoes',
  'vegetables for snacking', 'canned tuna or salmon', 'whole fruit', 'milk', 'oats',
  'berries', 'olive oil', 'brown rice',
];
// "Eggs" is deliberately NOT banned: an egg is a specific thing you lift off a shelf,
// and the budget variant ("grade doesn't change that") is a reasoned decision to stop
// paying up for the label — not a category handed back to the shopper.

function everyGeneratedItem() {
  const out = [];
  for (const goal of GOAL_VALUES) {
    for (const premium of [false, true]) {
      for (const constraints of [[], ['budget'], ['short_on_time'], ['picky_kids'], ['no_kitchen'], ['cooking_for_one']]) {
        out.push(...generateList({ goal, premium, constraints }).items);
      }
    }
  }
  return out.filter((i) => i.source === 'template');
}

test('NO row is left at the category level — every item is a thing you can pick up', () => {
  for (const it of everyGeneratedItem()) {
    const n = it.name.toLowerCase().trim();
    assert.ok(
      !CATEGORY_ROWS.includes(n),
      `"${it.name}" is a category, not a decision — that hands the choice back to the shopper`
    );
  }
});

test('EVERY template row carries one line of Kristy’s reasoning', () => {
  for (const it of everyGeneratedItem()) {
    assert.ok(it.why, `"${it.name}" has no reason — that makes it a checklist, not coaching`);
    assert.ok(it.why.length <= 200, `"${it.name}" reason too long for a row: ${it.why.length}`);
  }
});

test('CLAIM LOCK — no reason asserts a health outcome, names a condition, or quotes a price', () => {
  // Symmetric, exactly like the note guardrail: no curing AND no causing.
  const HEALTH_OUTCOME =
    /\b(cure[sd]?|treats?|treating|prevents?|preventing|revers(e|es|ed|ing)|heals?|lowers? (your )?(risk|cholesterol|blood pressure)|reduces? (the )?risk|causes? (cancer|disease|diabetes)|protects? (you )?(from|against))\b/i;
  const CONDITION = /\b(diabetes|diabetic|cancer|heart disease|hypertension|your condition|your diagnosis)\b/i;
  // Budget is SELECTION, never a price lookup (Block H) — no currency, no figure.
  const PRICE = /\$|\b\d+\s*(dollars|bucks|cents)\b|\bbucks\b/i;

  for (const it of everyGeneratedItem()) {
    assert.ok(!HEALTH_OUTCOME.test(it.why), `health-outcome claim in "${it.name}": ${it.why}`);
    assert.ok(!CONDITION.test(it.why), `names a condition in "${it.name}": ${it.why}`);
    assert.ok(!PRICE.test(it.why), `price in "${it.name}": ${it.why}`);
    if (it.alt) {
      assert.ok(!HEALTH_OUTCOME.test(it.alt), `health-outcome claim in alt of "${it.name}"`);
      assert.ok(!PRICE.test(it.alt), `price in alt of "${it.name}"`);
    }
  }
});

test('every perimeterId resolves to a REAL entry in the perimeter KB', () => {
  const ids = new Set(perimeterKb.entries.map((e) => e.id));
  const linked = everyGeneratedItem().filter((i) => i.perimeterId);
  assert.ok(linked.length > 0, 'the list should draw on the perimeter KB at all');
  for (const it of linked) {
    assert.ok(ids.has(it.perimeterId), `"${it.name}" points at missing entry "${it.perimeterId}"`);
  }
});

test('the fish / beef / oil / rice picks reflect what the perimeter KB actually knows', () => {
  const find = (items, re) => items.find((i) => re.test(i.name));

  // Fish: small fish sit lower on the chain (canned_fish_mercury) — not "fatty fish".
  const fish = find(generateList({ goal: 'pregnancy_postpartum', premium: true }).items, /sardine/i);
  assert.ok(fish, 'a specific fish, not a category');
  assert.equal(fish.perimeterId, 'canned_fish_mercury');

  // Oil: real EVOO, reasoned from the harvest-date/dark-bottle tell (olive_oil_buying).
  const oil = find(generateList({ goal: 'eating_cleaner' }).items, /olive oil/i);
  assert.match(oil.name, /extra-virgin/i);
  assert.equal(oil.perimeterId, 'olive_oil_buying');
  assert.match(oil.why, /harvest date/i);

  // Rice: basmati + the rinse habit (rice_arsenic).
  const rice = find(generateList({ goal: 'high_protein' }).items, /rice/i);
  assert.match(rice.name, /basmati/i);
  assert.equal(rice.perimeterId, 'rice_arsenic');

  // Beef: the lean-ratio judgment (ground_beef_lean_ratio), not "lean ground beef or turkey".
  const beef = find(generateList({ goal: 'high_protein' }).items, /beef/i);
  assert.match(beef.name, /80\/20/);
  assert.equal(beef.perimeterId, 'ground_beef_lean_ratio');
});

test('CONSTRAINTS change the SPECIFIC pick, not just the framing (premium)', () => {
  const base = generateList({ goal: 'eating_cleaner', premium: true }).items;
  const time = generateList({ goal: 'eating_cleaner', constraints: ['short_on_time'], premium: true }).items;
  const money = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: true }).items;

  assert.ok(base.some((i) => /chicken thighs/i.test(i.name)), 'base picks the thighs');
  assert.ok(time.some((i) => /rotisserie/i.test(i.name)), 'short on time ⇒ rotisserie');
  assert.ok(money.some((i) => /whole chicken/i.test(i.name)), 'budget ⇒ whole bird');

  // …and the reason names the circumstance.
  assert.match(time.find((i) => /rotisserie/i.test(i.name)).why, /already cooked/i);
});

test('the free tier still gets SPECIFIC picks with reasons — only the tuning is premium', () => {
  const free = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: false });
  assert.ok(free.items.every((i) => i.why), 'reasons are not a premium feature');
  assert.ok(free.items.some((i) => /chicken thighs/i.test(i.name)), 'free keeps the specific base pick');
  assert.ok(!free.items.some((i) => /whole chicken/i.test(i.name)), 'constraint tuning stays premium');
});

test('"eating cleaner + budget" — the spec’s worked example', () => {
  const list = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: true });
  const names = list.items.map((i) => i.name.toLowerCase()).join(' | ');
  for (const expected of ['whole chicken', 'sardines', 'oats', 'frozen', 'beans']) {
    assert.ok(names.includes(expected), `expected a "${expected}" pick, got: ${names}`);
  }
  assert.ok(list.items.every((i) => i.why), 'every row reasoned');
});

test('a constraint variant never keeps an alt that contradicts its own pick', () => {
  const budget = generateList({ goal: 'eating_cleaner', constraints: ['budget'], premium: true }).items;
  const beans = budget.find((i) => /dried beans/i.test(i.name));
  const eggs = budget.find((i) => /^eggs$/i.test(i.name));
  assert.ok(beans && !/or dried/i.test(beans.alt || ''), '"Dried beans" must not offer "or dried"');
  assert.ok(eggs && !/plain eggs/i.test(eggs.alt || ''), '"Eggs" must not offer "or plain eggs"');
});

test('constraint substitution never leaves the same product in the cart twice', () => {
  // Substitution is many-to-one: under short_on_time BOTH "Chicken breast" and
  // "Chicken thighs, bone-in" resolve to "Rotisserie chicken". The blend dedupes the
  // BASE items, but that runs before the variants exist — so without a pass after
  // applyVariants the shopper's very first cart shows rotisserie chicken twice.
  const list = generateList({
    goals: ['high_protein', 'eating_cleaner'],
    constraints: ['budget', 'short_on_time'],
    premium: true,
  });
  const names = list.items.map((i) => i.name.toLowerCase());
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(dupes, [], `no duplicate rows, got: ${dupes.join(', ')}`);
});
