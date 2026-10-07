// K3-1: seafood L1 + L2 list words (aliases/asked_as only, no new cards, no new prose).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { execSync } from 'node:child_process';
import pre from './fixtures/kb-pre-readability.json' with { type: 'json' };
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
const byId = (id) => kb.entries.find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const rowMatch = (row) => idOf(matchItemToCard(row)) ?? idOf(matchItemToPick(row));
const top = (q) => { const r = scoreEntries(q, 3)[0]; return r?.entry?.id ?? r?.id ?? null; };

const WORDS = nonEmpty(Object.entries({
  seafood_counter: ['fish', 'shellfish'],
  white_fish: ['cod', 'grouper', 'snapper', 'red snapper', 'mahi mahi', 'mahi', 'sole', 'whiting', 'rockfish', 'sea bass', 'branzino', 'perch', 'walleye', 'swai', 'basa', 'monkfish', 'halibut', 'haddock', 'pollock', 'tilapia', 'flounder', 'halibut steak', 'halibut steaks'],
  salmon_wild_vs_farmed: ['salmon', 'salmon fillet', 'salmon fillets', 'wild salmon', 'salmon steak', 'salmon steaks'],
  clams_mussels_oysters: ['clams', 'mussels', 'oysters'],
}).flatMap(([id, ws]) => ws.map((w) => [w, id])), 'K3-1 list words', 30);

// Measured BEFORE the K3-1 edit (2026-10-07, same harness); must not move.
const COLLISIONS = nonEmpty([
  ['fish sauce', null], ['fish sticks', 'pick_fish_sticks'], ['fish oil', null],
  ['fresh fish', 'fresh_vs_previously_frozen_fish'], ['canned fish', 'canned_fish_choosing'], ['smoked fish', 'smoked_salmon'],
], 'K3-1 collision rows', 6);
const EDITED = nonEmpty(['seafood_counter', 'white_fish', 'salmon_wild_vs_farmed', 'clams_mussels_oysters', 'smoked_salmon', 'farmed_fish_by_species'], 'K3-1 edited cards', 6);

for (const [w, id] of WORDS) test(`L "${w}" lands on ${id}`, () => assert.equal(rowMatch(w), id));
for (const [w, want] of COLLISIONS) test(`collision "${w}" unchanged (${want})`, () => assert.equal(rowMatch(w), want));
test('ask "what should fish smell like" unchanged', () => assert.equal(top('what should fish smell like'), 'fish_freshness_at_counter'));

test('M3: the fish/shellfish buying asks live on seafood_counter only, in aliases and asked_as', () => {
  for (const q of ['which fish should i buy', 'which shellfish should i buy']) {
    const owners = kb.entries.filter((e) => (e.aliases ?? []).includes(q)).map((e) => e.id);
    assert.deepEqual(owners, ['seafood_counter'], q);
    assert.ok(byId('seafood_counter').asked_as.includes(q), q);
    assert.equal(top(q), 'seafood_counter', q);
  }
});

test('white_fish: 3+ asked_as name grouper or snapper, each tops the ask door', () => {
  const asks = nonEmpty(byId('white_fish').asked_as.filter((q) => /grouper|snapper/.test(q)), 'grouper/snapper asks', 3);
  for (const q of asks) assert.equal(top(q), 'white_fish', q);
});

for (const id of EDITED) test(`${id}: readable, lint-clean, no redirect`, () => {
  const card = byId(id);
  const doLine = reviewed.get(id)?.do || '';
  assert.ok(doLine, `${id} has no reviewed do line`);
  assert.deepEqual(readability(card), []);
  assert.deepEqual(lintCard(projectEntry(card, { doLine })), []);
  const text = [card.decision, card.cart_pick, ...(card.buying_tips ?? []), doLine].join(' ');
  assert.doesNotMatch(text, /instead|swap|rather than|switch to/i);
});

// Critic r1 rows. Before = pre-K3-1 KB (334ad72), measured 2026-10-08. [row, list match, ask top]
// Two deliberate moves: smoked salmon cuts went from no card to their owner smoked_salmon,
// and fresh shellfish went from farmed_fish_by_species to the live-shellfish card.
const PINS = nonEmpty([
  ['cod liver oil', null, null], ['red snapper soup', null, null], ['bird perch', null, null], ['shoe sole', null, null],
  ['smoked mussels', 'farmed_fish_by_species', 'farmed_fish_by_species'], ['smoked oysters', 'farmed_fish_by_species', 'farmed_fish_by_species'],
  ['smoked clams', 'farmed_fish_by_species', 'farmed_fish_by_species'], ['frozen mussels', 'farmed_fish_by_species', 'farmed_fish_by_species'],
  ['frozen oysters', 'farmed_fish_by_species', 'farmed_fish_by_species'], ['frozen clams', 'farmed_fish_by_species', 'farmed_fish_by_species'],
  ['canned oysters', null, null], ['oyster sauce', null, null], ['clam juice', null, null], ['oyster mushrooms', 'produce_mushrooms', 'produce_mushrooms'],
  ['smoked salmon fillet', 'smoked_salmon', 'smoked_salmon'], ['smoked salmon fillets', 'smoked_salmon', 'smoked_salmon'],
  ['smoked salmon steak', 'smoked_salmon', 'smoked_salmon'], ['smoked salmon steaks', 'smoked_salmon', 'smoked_salmon'],
  ['fresh mussels', 'clams_mussels_oysters', 'clams_mussels_oysters'], ['fresh oysters', 'clams_mussels_oysters', 'clams_mussels_oysters'],
  ['fresh clams', 'clams_mussels_oysters', 'clams_mussels_oysters'], ['farmed mussels', 'farmed_fish_by_species', 'farmed_fish_by_species'],
], 'critic r1 pins', 20);
for (const [q, row, ask] of PINS) test(`pin "${q}": row ${row}, ask ${ask}`, () => {
  assert.equal(rowMatch(q), row, 'row');
  assert.equal(top(q), ask, 'ask');
});

test('white_fish species reach list rows only through M3, never a bare alias', () => {
  const al = byId('white_fish').aliases;
  for (const s of ['cod', 'grouper', 'snapper', 'perch', 'sole', 'mahi']) {
    assert.ok(!al.includes(s), s);
    assert.ok(al.includes(`which ${s} should i buy`), s);
  }
});

test('steal killed: "<x> steak(s)" rows no longer land on beef_cuts_basics', () => {
  for (const w of nonEmpty(['salmon steak', 'salmon steaks', 'halibut steak', 'halibut steaks'], 'steak rows', 4)) assert.notEqual(rowMatch(w), 'beef_cuts_basics', w);
});

// K14 C10 precedent: the passRule fixture mirrors the K3-1 alias additions, and nothing else on the card moved.
test('fixture mirrors salmon_wild_vs_farmed and farmed_fish_by_species aliases; no other fixture field on them moved', () => {
  for (const id of ['salmon_wild_vs_farmed', 'farmed_fish_by_species']) {
  const now = (pre.entries ?? pre).find((e) => e.id === id);
  assert.deepEqual(now.aliases, byId(id).aliases);
  const head = JSON.parse(execSync('git show 334ad72:server/test/acceptance/fixtures/kb-pre-readability.json', { cwd: join(ROOT, 'server'), maxBuffer: 64 << 20 }).toString());
  const was = (head.entries ?? head).find((e) => e.id === id);
  const moved = [...new Set([...Object.keys(was), ...Object.keys(now)])].filter((k) => JSON.stringify(was[k]) !== JSON.stringify(now[k]));
  assert.ok(moved.every((k) => k === 'aliases'), `${id}: ${moved.join(',')}`);
  }
});
