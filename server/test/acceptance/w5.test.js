// W5: test exactly the two shop lines, including the pick adapter's real source field.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import before from './w5.before.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };
import { projectEntry } from '../../lib/counterCards.js';
import { attachCards, matchItemToPick } from '../../lib/listMatch.js';
import { nonEmpty } from '../../lib/testGuards.js';
import { words, lintCard, lintCorpus } from '../../lib/counterCardLint.js';

// W4's exact scope, with its picks separated from actual cards; bread picks added explicitly.
const categories = new Set(['beef', 'poultry', 'poultry_eggs', 'meat_counter', 'pork', 'produce']);
const breads = new Set(['sandwich_bread', 'sourdough', 'bagels', 'tortillas', 'sprouted_grain_bread', 'gluten_free_bread', 'bread_aisle']);
const breadPicks = new Set(['pick_english_muffins', 'pick_pita_naan']);
const inPilot = e => (categories.has(e.category) && !!e.decision) || breads.has(e.id) || (e.kind === 'pick' && breadPicks.has(e.id));
const pilot = nonEmpty(kb.entries.filter(inPilot), 'W5 PILOT', 73);
const cards = nonEmpty(pilot.filter(e => e.kind !== 'pick'), 'W5 carded PILOT', 40);
const picks = nonEmpty(pilot.filter(e => e.kind === 'pick'), 'W5 picks', 26);
nonEmpty(before.filter(e => e.kind !== 'pick'), 'W5 before cards', 40);
const oldById = new Map(before.map(e => [e.id, e]));
const normalize = s => String(s || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const tokens = s => normalize(s).split(/\s+/).filter(Boolean);
const shop = e => {
  const card = projectEntry(e, { doLine: doLines[e.id] });
  return [card.headline, card.look_for[0] || card.why];
};
const banned = /\b(?:I|me|my|we|our)\b|!|whole[ -]food standard|\b(?:cost\w*|cheap\w*|lowest-cost|budget\w*|money|price\w*|pricier|expensive|dollars?|savings?|bargains?)\b|[$€£]/i;
const medical = /\b(?:treats?|prevents?|cures?|heals?|causes?)\b|\b(?:lowers?|reduces?) (?:the )?risk\b/i;
const numbers = s => String(s).match(/\d+(?:[.,]\d+)*(?:%|°[FC])?/g) || [];
const flatten = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(flatten) : [];
const retainedFields = ['decision', 'why', 'buying_tips', 'pick_steps', 'detail'];
// Terms in the frozen two-line source. Include ingredient/processing concerns as well as label claims.
const labelTerms = [
  '100% grass-fed', 'grass-fed', 'grass-finished', 'no added hormones', 'certifier’s seal',
  'salt', 'spices', 'phosphate', 'starch', 'seasoned', 'original', 'traditional',
  'chuck', 'round', 'ground beef', 'hamburger', 'organ blend',
  'pasture-raised', 'organic', 'conventional', 'corn-free', 'soy-free',
  'frozen', 'raw', 'pre-cut', 'precut', 'packaged on', 'air-chilled', 'bone-in', 'skin-on',
  'plain', 'added solution', 'contains X% added solution', 'solution',
  'whole wheat', 'bran', 'germ', 'starter', 'wild yeast', 'bacteria', 'culture',
  'boiled', 'lime-treated', 'masa', 'masa harina', 'water', 'basting', 'flavoring solution',
  'boneless', 'skinless', 'sprouted whole grains', 'added flour', 'gluten-free', 'binder',
  'U.S. Inspected and Passed', 'state mark', 'inspection',
  'USDA Organic', 'American Grassfed Association', 'Certified Grassfed by AGW',
  'Certified Humane', 'Animal Welfare Approved', 'Whole Grain Stamp',
  'coagulant', 'nigari', 'gypsum',
];
const contains = (text, term) => ` ${normalize(text)} `.includes(` ${normalize(term)} `);

test('W5 (a) every card changes both projected shop lines without a four-word echo', () => {
  for (const e of cards) {
    const old = oldById.get(e.id);
    assert.ok(old, `${e.id}: absent from before snapshot`);
    const lines = shop(e);
    assert.equal(lines[0], e.decision, `${e.id}: headline projection`);
    assert.equal(lines[1], e.buying_tips[0], `${e.id}: first tip projection`);
    assert.notEqual(lines[0], old.decision, `${e.id}: line 1 unchanged`);
    assert.notEqual(lines[1], old.buying_tips[0], `${e.id}: line 2 unchanged`);
    const first = tokens(lines[0]);
    const second = ` ${tokens(lines[1]).join(' ')} `;
    for (let i = 0; i + 4 <= first.length; i++) {
      const run = first.slice(i, i + 4).join(' ');
      assert.ok(!second.includes(` ${run} `), `${e.id}: line 2 repeats “${run}”`);
    }
  }
});

test('W5 (b/e) visible authored lines are nonempty, brief and free of banned voice', () => {
  for (const e of pilot) {
    const lines = e.kind === 'pick' ? [e.decision] : shop(e);
    assert.ok(words(lines[0]) <= 12, `${e.id}: headline exceeds 12 words`);
    for (const [i, line] of lines.entries()) {
      assert.ok(line?.trim(), `${e.id}: empty line ${i + 1}`);
      assert.doesNotMatch(line, banned, `${e.id}: banned line ${i + 1}`);
      assert.doesNotMatch(line, medical, `${e.id}: medical promise`);
    }
    if (e.kind !== 'pick') assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[e.id] })), [], e.id);
  }
  assert.deepEqual(lintCorpus(pilot.map(e => e.kind === 'pick' ? e : projectEntry(e, { doLine: doLines[e.id] }))).violations, []);
});

test('W5 (c) old numbers, seals, label terms and all existing tips survive', () => {
  for (const e of cards) {
    const old = oldById.get(e.id);
    const original = [old.decision, old.buying_tips[0]].join(' ');
    const retained = retainedFields.flatMap(f => flatten(e[f])).join(' ');
    for (const number of numbers(original)) assert.ok(numbers(retained).includes(number), `${e.id}: lost ${number}`);
    for (const term of labelTerms.filter(t => contains(original, t))) assert.ok(contains(retained, term), `${e.id}: lost ${term}`);
    // Even prose quantities and seals outside the dictionary survive verbatim in the moved old tip.
    assert.deepEqual(e.buying_tips.slice(1), [...old.buying_tips.slice(1), old.buying_tips[0]], `${e.id}: original tips changed`);
  }
  // A pick's line is its whole visible text, so its own old terms and numbers survive in it.
  for (const e of picks) {
    const old = oldById.get(e.id);
    const retained = retainedFields.flatMap(f => flatten(e[f])).join(' ');
    for (const number of numbers(old.decision)) assert.ok(numbers(retained).includes(number), `${e.id}: lost ${number}`);
    for (const term of labelTerms.filter(t => contains(old.decision, t))) assert.ok(contains(retained, term), `${e.id}: lost ${term}`);
  }
});

test('W5 (d) no normalized three-word line 2 opener occurs more than three times', () => {
  const holders = new Map();
  for (const e of cards) {
    const opener = tokens(shop(e)[1]).slice(0, 3).join(' ');
    const ids = [...(holders.get(opener) || []), e.id];
    holders.set(opener, ids);
    assert.ok(ids.length <= 3, `${opener}: ${ids.join(', ')}`);
  }
  nonEmpty([...holders], 'W5 actual line 2 openers', 14);
});

test('W5 (f) no normalized two-word headline opener occurs more than twice', () => {
  const holders = new Map();
  for (const e of pilot) {
    const opener = tokens(e.decision).slice(0, 2).join(' ');
    const ids = [...(holders.get(opener) || []), e.id];
    holders.set(opener, ids);
    assert.ok(ids.length <= 2, `${opener}: ${ids.join(', ')}`);
  }
});

test('W5 pick lines use the actual adapter; list-row why stays untouched', () => {
  for (const e of picks) {
    const pick = matchItemToPick(e.aliases[0], [e]);
    assert.equal(pick?.line, e.decision, `${e.id}: stored decision must reach pick line`);
    assert.notEqual(pick.line, oldById.get(e.id).decision, `${e.id}: pick line unchanged`);
  }
  // This alias has no card, so the full attachment path really reaches the pick branch.
  for (const why of ['', 'For tomorrow’s lunch.']) {
    const row = { name: 'kohlrabi', source: 'user', why };
    const attached = attachCards({ items: [row] }, { log: false }).items[0];
    assert.equal(attached.pickId, 'pick_kohlrabi');
    assert.equal(attached.pickLine, picks.find(e => e.id === 'pick_kohlrabi').decision);
    assert.equal(attached.why, why);
  }
});

test('W5 snapshot is pre-edit HEAD; only PILOT shop copy changes', () => {
  const baseline = JSON.parse(execFileSync('git', ['show', '84d6704:server/kristy_perimeter_kb.json'], {
    cwd: fileURLToPath(new URL('../../../', import.meta.url)), maxBuffer: 64 << 20,
  }));
  const snapshot = baseline.entries.filter(inPilot).map(({ id, title, category, kind, decision, buying_tips }) => ({
    id, title, category, ...(kind ? { kind } : {}), decision, ...(buying_tips ? { buying_tips } : {}),
  }));
  assert.deepEqual(before, snapshot, 'before snapshot must not be re-pinned to W5');
  assert.deepEqual(pilot.map(e => e.id), before.map(e => e.id));
  const strip = e => Object.fromEntries(Object.entries(e).filter(([f]) => !inPilot(e) || !['decision', 'buying_tips'].includes(f)));
  assert.deepEqual(kb.entries.map(strip), baseline.entries.map(strip), 'non-PILOT and all other fields are locked');
  assert.deepEqual({ ...kb, entries: [] }, { ...baseline, entries: [] });
});

test('W5 shop-read artifact contains every exact old and new pair', () => {
  const review = readFileSync(new URL('../../../docs/W5-SHOP-READ.md', import.meta.url), 'utf8');
  for (const e of pilot) {
    const old = oldById.get(e.id);
    const [one, two] = e.kind === 'pick' ? [e.decision, ''] : shop(e);
    const block = `### ${e.title}\n\nOLD line 1: ${old.decision}\nOLD line 2: ${old.buying_tips?.[0] || ''}\nNEW line 1: ${one}\nNEW line 2: ${two}`;
    assert.ok(review.includes(block), `${e.id}: review differs from shop projection`);
  }
});
