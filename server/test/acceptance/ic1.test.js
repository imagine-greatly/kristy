// IC-1: item-card lint rules (docs/ITEM-CARDS-PLAN.md IC-1). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lintCard, headlineHedge, lintRepeatedClaim, tierNoteOrphaned, words,
  MAX_HEADLINE_WORDS, HEADLINE_DO_MAX, REPEATED_CLAIM_FIELDS, TIER_NOTE_ORPHANED_PENDING,
} from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { assertPassRule, ITEM_CARD_REWRITE } from './passRule.js';
import { projectCorpus } from '../../scripts/migrateCounterCards.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const codes = (v) => v.map((x) => x.code);
const H13 = 'Buy the loose ones and skip the bag, then check every single stem.';
const H15 = 'Buy the loose ones and skip the bag, then check every single stem end twice.';
const gen = (headline) => ({ slug: 'generated_test', section: 'produce', source: 'generated', headline, do: 'Squeeze the stem end; it should give slightly.' });

test('C1 headline cap is 14', () => {
  assert.equal(MAX_HEADLINE_WORDS, 14);
  assert.equal(HEADLINE_DO_MAX, 28);
  assert.equal(words(H13), 13);
  assert.equal(words(H15), 15);
  assert.ok(!codes(lintCard(gen(H13))).includes('HEADLINE_TOO_LONG'));
  assert.ok(codes(lintCard(gen(H15))).includes('HEADLINE_TOO_LONG'));
});

test('C2 REPEATED_CLAIM exempts decision', () => {
  const s = '100% grass-fed and grass-finished.';
  assert.ok(!REPEATED_CLAIM_FIELDS.includes('decision'));
  assert.equal(lintRepeatedClaim({ id: 'ground_beef_lean_ratio', decision: s }).filter((h) => h.code === 'REPEATED_CLAIM').length, 0);
  const hits = lintRepeatedClaim({ id: 'ground_beef_lean_ratio', decision: s, tier_note: s }).filter((h) => h.code === 'REPEATED_CLAIM');
  assert.ok(hits.some((h) => h.field === 'tier_note'));
});

test('C3 tier note may comment on the front', () => {
  const decision = 'Pickled turnips keep their crunch only when the brine is unheated.';
  const doLine = 'Shake the jar and choose the one with the cloudiest liquid.';
  assert.equal(tierNoteOrphaned({ decision, tier_note: 'That the crunch survives an unheated brine is documented, not a preference.' }, doLine), false);
  assert.equal(tierNoteOrphaned({ decision, tier_note: 'Lab panels confirm this point for every batch sold.' }, doLine), true);
});

test('C4 HEADLINE_HEDGED unloosened', () => {
  const hedged = 'Raw if you can get it; otherwise pasteurized.';
  assert.ok(headlineHedge(hedged).length > 0);
  assert.ok(codes(lintCard(gen(hedged))).includes('HEADLINE_HEDGED'));
  const milk = 'Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.';
  assert.deepEqual(headlineHedge(milk), []);
  assert.ok(words(milk) <= 14);
});

test('C5 passRule ITEM_CARD_REWRITE', () => {
  const old = (id) => ({ id, decision: 'Old front here.', aliases: ['eggs'], asked_as: ['which eggs should i buy'], sources: ['https://example.org/a'] });
  const neu = (id) => ({ id, decision: 'New front here.', aliases: ['eggs', 'brown eggs'], asked_as: ['which eggs should i buy', 'are brown eggs better'], sources: ['https://example.org/a', 'https://example.org/b'] });
  assert.doesNotThrow(() => assertPassRule(null, old('egg_labels'), neu('egg_labels')));
  assert.throws(() => assertPassRule(null, old('egg_duck_quail'), neu('egg_duck_quail')));
  const o = { id: 'organic_worth_it_by_type', decision: 'Front.', aliases: ['mushrooms', 'zzqx made up alias'] };
  assert.doesNotThrow(() => assertPassRule(null, o, { ...o, aliases: ['zzqx made up alias'] }));
  assert.throws(() => assertPassRule(null, o, { ...o, aliases: ['mushrooms'] }));
});

test('C6 ITEM_CARD_REWRITE is the S7 set', () => {
  const want = ['produce_ripeness_by_item', 'berries_picking', 'egg_labels', 'judging_meat_at_the_case', 'seafood_counter',
    'whole_vs_reduced_fat_milk', 'yogurt_plain_vs_flavored', 'plain_kefir', 'organic_worth_it_by_type', 'beef_grassfed_vs_grainfed',
    'salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'grassfed_butter', 'produce_apples_pears', 'produce_citrus',
    'produce_peppers', 'produce_leafy_greens', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic',
    'produce_green_beans', 'produce_mushrooms', 'produce_stone_fruit'];
  assert.deepEqual([...ITEM_CARD_REWRITE].sort(), [...want].sort());
  for (const id of want) assert.ok(kb.entries.some((e) => e.id === id), `${id} missing from KB`);
});

test('C7 orphan ratchet', () => {
  const cards = kb.entries.filter((e) => e.kind !== 'pick' && doLines[e.id] && e.tier_note);
  assert.ok(cards.length >= 150, `only ${cards.length} curated cards with a do line`);
  for (const e of cards) {
    assert.equal(tierNoteOrphaned(e, doLines[e.id]), TIER_NOTE_ORPHANED_PENDING.has(e.id), `${e.id}: pending set disagrees with the raw rule`);
    assert.ok(!codes(lintCard(projectEntry(e, { doLine: doLines[e.id] }))).includes('TIER_NOTE_ORPHANED'), `${e.id}: lintCard still flags it`);
  }
  for (const id of TIER_NOTE_ORPHANED_PENDING) assert.ok(cards.some((e) => e.id === id), `${id} stale in pending`);
});

test('C8 migration reads the lint cap', () => {
  const base = kb.entries.find((e) => e.id === 'produce_mushrooms');
  const reviewed = new Map([['produce_mushrooms', { do: 'Take dry, firm caps and pass on any with dark spots.', flag: '—' }]]);
  assert.equal(projectCorpus([{ ...base, decision: H13 }], reviewed).problems.longHeadline.length, 0);
  assert.equal(projectCorpus([{ ...base, decision: H15 }], reviewed).problems.longHeadline.length, 1);
});
