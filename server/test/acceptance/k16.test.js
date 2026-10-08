// K16: seafood build (7 cards, 2 picks, no folds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { scoreEntries } from '../../lib/perimeter.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
const byId = (id) => kb.entries.find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const rowMatch = (row) => idOf(matchItemToCard(row)) ?? idOf(matchItemToPick(row));
const top = (q) => { const r = scoreEntries(q, 3)[0]; return { id: r?.entry?.id ?? r?.id, score: r?.score ?? 0, aliasScore: r?.aliasScore ?? 0 }; };

const CARDS = nonEmpty(['white_fish', 'crab', 'lobster', 'scallops', 'clams_mussels_oysters', 'smoked_salmon', 'seafood_counter'], 'K16 cards', 7);
const PICKS = nonEmpty(['pick_fish_sticks', 'pick_anchovies'], 'K16 picks', 2);
const NEW = [...CARDS, ...PICKS];
const BARE = nonEmpty(Object.entries({
  'white fish': 'white_fish', 'whitefish': 'white_fish', 'fish fillets': 'white_fish', 'cod fillets': 'white_fish', 'atlantic cod': 'white_fish',
  'pollock': 'white_fish', 'haddock': 'white_fish', 'halibut': 'white_fish', 'tilapia': 'white_fish', 'flounder': 'white_fish',
  'crab': 'crab', 'crab legs': 'crab', 'king crab': 'crab', 'snow crab': 'crab', 'dungeness crab': 'crab', 'blue crabs': 'crab', 'crab meat': 'crab', 'imitation crab': 'crab',
  'lobster': 'lobster', 'lobster tails': 'lobster', 'live lobster': 'lobster', 'lobster meat': 'lobster',
  'scallops': 'scallops', 'sea scallops': 'scallops', 'bay scallops': 'scallops', 'dry scallops': 'scallops',
  'live mussels': 'clams_mussels_oysters', 'live clams': 'clams_mussels_oysters', 'shucked oysters': 'clams_mussels_oysters', 'littleneck clams': 'clams_mussels_oysters', 'steamer clams': 'clams_mussels_oysters',
  'smoked salmon': 'smoked_salmon', 'lox': 'smoked_salmon', 'nova lox': 'smoked_salmon', 'smoked trout': 'smoked_salmon', 'smoked fish': 'smoked_salmon', 'kippered salmon': 'smoked_salmon',
  'seafood counter': 'seafood_counter',
  'fish sticks': 'pick_fish_sticks', 'fish stick': 'pick_fish_sticks', 'fish fingers': 'pick_fish_sticks',
  'anchovies': 'pick_anchovies', 'anchovy': 'pick_anchovies', 'anchovy fillets': 'pick_anchovies',
}), 'K16 bare rows', 40);
const KEEPS = nonEmpty([
  ['salmon', 'salmon_wild_vs_farmed'], ['atlantic salmon', 'salmon_wild_vs_farmed'], ['shrimp', 'shrimp_imported_vs_domestic'],
  ['fresh fish', 'fresh_vs_previously_frozen_fish'], ['frozen fish', 'fresh_vs_previously_frozen_fish'], ['frozen fish fillets', 'white_fish'],
  ['fish counter', 'fresh_vs_previously_frozen_fish'], ['farmed tilapia', 'farmed_fish_by_species'],
  // K3-1 (Devon-approved list-word plan) moves the bare shellfish rows to their own card.
  ['mussels', 'clams_mussels_oysters'], ['oysters', 'clams_mussels_oysters'], ['clams', 'clams_mussels_oysters'],
  ['canned anchovies', 'canned_fish_choosing'], ['sardines', 'canned_fish_choosing'], ['canned tuna', 'canned_tuna'],
  ['smoked ham', 'ham'], ['meat sticks', 'pick_jerky'], ['meat case', 'meat_case'], ['oyster sauce', null], ['seafood', 'seafood_counter'],
  ['crab apples', 'produce_apples_pears'], ['lobster mushrooms', 'produce_mushrooms'],
], 'K16 keep rows', 20);
const NOT_NEW = nonEmpty([
  'cod liver oil', 'fish oil', 'fish sauce', 'oyster sauce', 'oyster mushrooms', 'oyster crackers', 'clam juice', 'clamshell strawberries',
  'scallions', 'scalloped potatoes', 'smoked paprika', 'smoked sausage', 'smoked turkey', 'goldfish crackers', 'swedish fish',
  'white bread', 'white rice', 'white vinegar', 'carrot sticks', 'celery sticks', 'seafood seasoning', 'fish food',
  // K3-1 retired 'fish', 'shellfish' (-> seafood_counter) and 'cod' (-> white_fish) from this list.
  'snow peas', 'king cake', 'tartar sauce', 'cocktail sauce', 'salmon', 'shrimp',
], 'K16 not-new rows', 27);
const FORBIDDEN = ['seafood', 'fish', 'shellfish', 'shell', 'live', 'smoked', 'stick', 'sticks', 'white', 'fillet', 'fillets', 'cod', 'oyster', 'oysters', 'clam', 'clams', 'mussel', 'mussels', 'salmon', 'shrimp', 'tuna', 'king', 'sea', 'tail', 'tails', 'legs'];
// K3-1 adds these bare words on purpose (list-word plan); the K16 guards below exempt only them.
const K3_1_ALIASES = { clams_mussels_oysters: ['clams', 'mussels', 'oysters', 'fresh clams', 'fresh mussels', 'fresh oysters'] };
const k31 = (id, a) => (K3_1_ALIASES[id] ?? []).includes(a);
const K3_1_ASKS = ['which seafood should i buy', 'which fish should i buy', 'which shellfish should i buy'];
const OWNERS = nonEmpty(['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'fresh_vs_previously_frozen_fish', 'mercury_by_fish', 'fish_freshness_at_counter', 'canned_fish_choosing', 'farmed_fish_by_species', 'seafood_certifications', 'label_wild_vs_farm_raised', 'canned_tuna'], 'seafood ask owners', 10);
const PROSE = ['question', 'decision', 'why', 'short_answer', 'detail', 'kristy_take', 'cart_pick', 'buying_tips', 'watch_out', 'labels_decoded', 'tier_note'];

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => assert.equal(rowMatch(row), want));

for (const row of NOT_NEW) test(`C3b "${row}" lands on no K16 id`, () => {
  const got = rowMatch(row);
  assert.ok(!NEW.includes(got), `${row} -> ${got}`);
});

test('C4 broad card: seafood_counter owns exactly one short alias, "seafood counter"', () => {
  const al = nonEmpty(byId('seafood_counter')?.aliases ?? [], 'seafood_counter aliases', 4);
  assert.deepEqual(al.filter((a) => a.trim().split(/\s+/).length <= 2), ['seafood counter']);
});

test('C4 steal sweep: no pre-existing alias, run as a list row, lands on a K16 id', () => {
  const olds = nonEmpty(kb.entries.filter((e) => !NEW.includes(e.id)), 'pre-existing entries', 100);
  const hits = [];
  for (const e of olds) for (const a of e.aliases ?? []) { const got = rowMatch(a); if (NEW.includes(got) && !(got === 'clams_mussels_oysters' && e.id === 'farmed_fish_by_species' && ['clams', 'mussels', 'oysters'].includes(a))) hits.push(`${e.id}:"${a}" -> ${got}`); }
  assert.deepEqual(hits, []);
});

for (const id of OWNERS) test(`C4 ${id}: its asks still top it`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 1)) assert.equal(top(q).id, id, q);
});

test('C5 every cited URL hits line 1 of a docs/sources/k16 file', () => {
  const dir = join(ROOT, 'docs/sources/k16');
  const lines = nonEmpty(readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(join(dir, f), 'utf8').split('\n')[0]), 'k16 archive', 30);
  for (const id of CARDS) assert.ok((byId(id)?.sources ?? []).length >= 2, `${id} has <2 sources`);
  const urls = nonEmpty(NEW.flatMap((id) => (byId(id)?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url))), 'K16 URLs', 16);
  for (const u of urls) assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k16 source`);
});

for (const id of CARDS) test(`C6 ${id}: readable and lint-clean`, () => {
  const card = byId(id);
  assert.ok(card, `${id} missing`);
  const doLine = reviewed.get(id)?.do || '';
  assert.ok(doLine, `${id} has no reviewed do line`);
  assert.deepEqual(readability(card), []);
  assert.deepEqual(lintCard(projectEntry(card, { doLine })), []);
});

for (const id of PICKS) test(`C7 ${id}: pick lint-clean`, () => {
  const p = byId(id);
  assert.ok(p && p.kind === 'pick', `${id} missing or not a pick`);
  assert.equal(p.category, 'seafood');
  assert.deepEqual(lintPick(p), []);
});

test('C9 one entry per id, no forbidden or state alias, no forbidden bare-noun ask', () => {
  for (const id of NEW) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a) || k31(id, a), `${id} alias ${a}`);
      assert.ok(!/\b(fresh|frozen|canned|dried)\b/.test(a) || k31(id, a), `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) {
      if (id === 'seafood_counter' && K3_1_ASKS.includes(q)) continue;
      assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
    }
  }
});

for (const id of NEW) test(`C10 ${id}: no mercury, health or price wording`, () => {
  const e = byId(id);
  assert.ok(e, `${id} missing`);
  const text = JSON.stringify(PROSE.map((k) => e[k] ?? ''));
  assert.ok(text.length > 40, `${id} prose is empty`);
  assert.doesNotMatch(text, /\b(mercury|omega|healthy|healthier|heart|brain|safer|safest|cures?|prevents?)\b/i);
  assert.doesNotMatch(text, /\$|\b(price|prices|pricier|cheap|cheaper|expensive|cost)\b/i);
});
