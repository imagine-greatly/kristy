# ic-1 — Item-card lint rules: 14-word front, decision exempt from REPEATED_CLAIM, tier note may comment on the front, ITEM_CARD_REWRITE

```json
{
  "id": "ic-1",
  "tier": "T2",
  "ui": false,
  "owns": [
    "server/lib/counterCardLint.js",
    "server/lib/counterCardLint.test.js",
    "server/test/acceptance/passRule.js",
    "server/scripts/migrateCounterCards.js"
  ],
  "read_full": [
    "server/lib/counterCardLint.js:60-105",
    "server/lib/counterCardLint.js:985-1012",
    "server/lib/counterCardLint.js:1100-1135",
    "server/lib/counterCardLint.js:1344-1380",
    "server/lib/counterCardLint.js:1500-1612",
    "server/lib/counterCardLint.test.js:1-90",
    "server/lib/counterCardLint.test.js:650-693",
    "server/test/acceptance/passRule.js",
    "server/scripts/migrateCounterCards.js:28-82",
    "server/scripts/migrateCounterCards.js:220-250",
    "server/test/acceptance/k14.test.js:145-151",
    "docs/ITEM-CARDS-PLAN.md"
  ],
  "verify": "cd /Users/m1/kristy/server && node --test test/acceptance/ic1.test.js && npm test; node /Users/m1/kristy/server/scripts/listMatchProbe.js; node /Users/m1/kristy/server/scripts/commitGuard.js; cd /Users/m1/kristy/server && node scripts/migrateCounterCards.js --dry-run",
  "token_ceiling": 100000
}
```

Repo `/Users/m1/kristy`, branch `main` (HEAD `663ca3d`). Route: dv T2 (fallback forge@opus [T2]), critic@opus. P1. Parallel-safe with IC-2 (already shipped as the source pack); NOT parallel with any IC-3..IC-8 piece (they all run after this one).
Plan: `docs/ITEM-CARDS-PLAN.md` IC-1, decisions D1/D2/D5. Main (T0, not this piece) adds the ruling to `docs/DECISIONS.md` "The counter" plus one CLAUDE.md line after this ships.

## Alignment block (verbatim from the plan, amended where scout disproved an assumption)
- **Done means:** Given the KB at HEAD, when `cd server && npm test` runs, then it passes with 0 new lint hits. Given a decision of 13 words, then no HEADLINE_TOO_LONG; given 15 words, then HEADLINE_TOO_LONG. Given ground_beef_lean_ratio with decision "100% grass-fed and grass-finished.", then no REPEATED_CLAIM; given the same sentence in its tier_note, then REPEATED_CLAIM. Given a tier_note sharing a content word with decision but none with the do line, then no TIER_NOTE_ORPHANED; given one sharing a content word with neither, then TIER_NOTE_ORPHANED. Given decision "Raw if you can get it; otherwise pasteurized.", then HEADLINE_HEDGED (pinned so the rule cannot loosen). Given an ITEM_CARD_REWRITE id with a fold-shaped change (decision changed AND aliases/asked_as/sources gained), then passRule passes; given the same change on an id outside the set, then it fails.
- **Out of scope:** card edits (no KB, doLines.json or do-lines-review.md change). HEADLINE_HEDGED, headlineHedge(), FALLBACK_OUTRIGHT, CONDITIONAL, CIRCUMSTANCE, DEFERENCE untouched.
- **OK rough edges:** the ORPHANED content-word check is lexical. Cards that newly fail ORPHANED at HEAD sit in a ratchet set (below) instead of being rewritten here.
- **Ship bar:** HEADLINE_HEDGED loosened in any way; an ITEM_CARD_REWRITE id outside the S7 section lists; a lint hit count per rule at HEAD that differs before vs after (TIER_NOTE_ORPHANED included: pending ids are skipped, so it stays 0).
- **Independent check:** run `node -e` over `questionEntries()` → `lintCard(projectEntry(e,{doLine}))` and tally codes, before the change (git stash is FORBIDDEN, use `git show HEAD:server/lib/counterCardLint.js` into the scratchpad only if needed; simplest: run the tally first, save the output to `/Users/m1/kristy/.pipeline/runs/ic-1/lint-before.txt`, then after). Both tallies identical. Report both.

## Change
1. `server/lib/counterCardLint.js:102` `export const MAX_HEADLINE_WORDS = 12;` → `export const MAX_HEADLINE_WORDS = 14; // [PLACEHOLDER] item-card fronts (ITEM-CARDS-PLAN IC-1)`.
2. `server/lib/counterCardLint.js:1349` `export const HEADLINE_DO_MAX = 26;` → `export const HEADLINE_DO_MAX = 28; // [PLACEHOLDER] IC-1`. Leave the measured-thresholds comment above it; append one line "IC-1 (2026-10-14): raised to 28 with the 14-word front."
3. `server/lib/counterCardLint.js:1576-1579` `REPEATED_CLAIM_FIELDS` drops `'decision'` (first element). Add a one-line comment above: the front states the card's own buying ladder; a family card's front may name the owned standard (e.g. "100% grass-fed and grass-finished."), the depth may not.
4. `server/lib/counterCardLint.js:89-95` `tierNoteOrphaned`: `return !overlaps(note, doLine) && overlaps(note, decision);` → `return !overlaps(note, doLine) && !overlaps(note, decision);`. Docblock → "True when the note shares no content word with the do line it renders under NOR with the front (decision) it explains." Update the block comment at :67-72 to say the tier note now sits under the front (ITEM-CARDS-PLAN D1) and may comment on either.
5. New export in `counterCardLint.js`, directly after `tierNoteOrphaned`: `export const TIER_NOTE_ORPHANED_PENDING = new Set([...]);` holding EXACTLY the curated ids that fail the new `tierNoteOrphaned(entry, doLines[entry.id])` at HEAD (measure: `kb.entries.filter(e => e.kind !== 'pick' && doLines[e.id] && e.tier_note && tierNoteOrphaned(e, doLines[e.id]))`). Comment: "Ratchet. Each IC-3b..IC-8b piece rewrites the tier_note of its batch ids found here and removes them; empty after IC-8b. Never add an id." In `lintCard` at :1125 the condition becomes `if (tierNote && shownDo && !TIER_NOTE_ORPHANED_PENDING.has(card?.id ?? card?.slug) && tierNoteOrphaned(card, shownDo))`. Note `lintCard` reads `card.headline` for a projected card; `tierNoteOrphaned` already falls back `decision ?? headline`.
6. `server/test/acceptance/passRule.js`: add, after `HEALTH_FIRST_REWRITE` (:10-17):
   `export const ITEM_CARD_REWRITE = new Set([` the 23 ids: `'produce_ripeness_by_item', 'berries_picking', 'egg_labels', 'judging_meat_at_the_case', 'seafood_counter', 'whole_vs_reduced_fat_milk', 'yogurt_plain_vs_flavored', 'plain_kefir', 'organic_worth_it_by_type', 'beef_grassfed_vs_grainfed', 'salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'grassfed_butter', 'produce_apples_pears', 'produce_citrus', 'produce_peppers', 'produce_leafy_greens', 'produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_green_beans', 'produce_mushrooms', 'produce_stone_fruit'` `]);` with a comment: "Item-card fold survivors and ladder fronts (docs/ITEM-CARDS-PLAN.md IC-3..IC-7): they gain aliases/asked_as/sources/labels_decoded from folded cards. chicken_cuts_basics and beef_cuts_basics are already in HEALTH_FIRST_REWRITE."
   `:30` `const rewrite = HEALTH_FIRST_REWRITE.has(id);` → `const rewrite = HEALTH_FIRST_REWRITE.has(id) || ITEM_CARD_REWRITE.has(id);`.
   `:38-40` alias-drop rule: an ITEM_CARD_REWRITE id may also drop an alias that is present on ANOTHER entry of the current KB (the alias moved to a named survivor, e.g. "bananas" → produce_bananas in IC-3b). Implement: import `kb from '../../kristy_perimeter_kb.json' with { type: 'json' }`; build once `const ALIAS_OWNERS = new Map()` alias → Set(ids); condition `CULINARY_LEXICON.test(a) || (ITEM_CARD_REWRITE.has(id) && [...(ALIAS_OWNERS.get(a) ?? [])].some((o) => o !== id))`. Message unchanged except "is not a cook-verb alias and no other card carries it".
   Nothing else in passRule.js changes (FROZEN, REWRITABLE, RELAXED, keepsAll, number rule untouched).
7. `server/scripts/migrateCounterCards.js`: add `import { MAX_HEADLINE_WORDS } from '../lib/counterCardLint.js';` after the counterCards import (:33-41). `:74` `> 12` → `> MAX_HEADLINE_WORDS`; `:239` `'HEADLINE OVER 12 WORDS'` → `` `HEADLINE OVER ${MAX_HEADLINE_WORDS} WORDS` ``. The local `words()` (:46) stays.
8. `server/lib/counterCardLint.test.js`:
   - `:82` test name `'a headline over 12 words fails, on a generated card'` → `'a headline over 14 words fails, on a generated card'` (the 15-word fixture still fails; body unchanged).
   - `:654-661` (old semantics positive) → flip to a NEGATIVE named `'a tier note that comments on the front (decision) but not the do line is not orphaned (IC-1)'` with `assert.equal(tierNoteOrphaned(card, 'Shake the jar and choose the one with the cloudiest liquid.'), false);` and ADD a positive test `'a tier note sharing nothing with the front or the do line is orphaned'`: same decision, `tier_note: 'Lab panels confirm this point for every batch sold.'`, `assert.ok(tierNoteOrphaned(card, 'Shake the jar and choose the one with the cloudiest liquid.'))`. (Assertion replaced, not deleted.)
   - ADD after the corpus test at :675-679: `'TIER_NOTE_ORPHANED_PENDING only shrinks and holds no stale id'`: `assert.ok(TIER_NOTE_ORPHANED_PENDING.size <= N)` where N is the size you measured in step 5 (write the literal number), and every pending id is a KB question entry with a doLines entry whose raw `tierNoteOrphaned(entry, doLines[id])` is true.

## Criteria
- C1 [test] Given `MAX_HEADLINE_WORDS`, When a generated card's headline has 13 words, Then `lintCard` has no HEADLINE_TOO_LONG; at 15 words it has HEADLINE_TOO_LONG; `MAX_HEADLINE_WORDS === 14`, `HEADLINE_DO_MAX === 28`.
- C2 [test] Given `{id:'ground_beef_lean_ratio', decision:'100% grass-fed and grass-finished.'}`, When `lintRepeatedClaim` runs, Then 0 REPEATED_CLAIM; with the same sentence as `tier_note`, Then ≥1 REPEATED_CLAIM with field `tier_note`.
- C3 [test] Given decision D, do line O and a tier_note sharing a content word with D only, When `tierNoteOrphaned` runs, Then false; a tier_note sharing with neither, Then true.
- C4 [test] Given headline "Raw if you can get it; otherwise pasteurized.", Then `headlineHedge` non-empty and `lintCard` includes HEADLINE_HEDGED; Given Devon's milk front "Raw from a trusted local farmer first, then low-temp organic, 100% grass-fed.", Then `headlineHedge` is `[]` and it is ≤14 words.
- C5 [test] Given a fold-shaped change (decision changed; one alias, one asked_as, one source gained), When `assertPassRule` runs on `egg_labels`, Then no throw; on `egg_duck_quail`, Then it throws. Given `organic_worth_it_by_type` dropping alias "mushrooms" (carried by `produce_mushrooms`), Then no throw; dropping a made-up alias no entry carries, Then it throws.
- C6 [test] `ITEM_CARD_REWRITE` equals exactly the 23 ids in Change 6 and every id exists in the KB.
- C7 [test] Every curated KB card with a doLines entry and a tier_note: `tierNoteOrphaned` is true iff its id is in `TIER_NOTE_ORPHANED_PENDING`; and `lintCard(projectEntry(e,{doLine}))` emits no TIER_NOTE_ORPHANED for any of them.
- C8 [test] Given a copy of `produce_mushrooms` with a 13-word decision, When `projectCorpus` runs, Then `problems.longHeadline` is empty; with 15 words, Then it has one entry.
- C9 Given the change, When `npm test` runs, Then every test passes EXCEPT `k14.test.js` C12 (it diffs passRule.js against e92e7c9 and is re-anchored by main after commit). Report the pass/fail counts verbatim.

## Contract
```json
{
  "criteria": [
    {"id": "C1", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic1.test.js", "server/lib/counterCardLint.test.js"], "dependents": ["server/scripts/migrateCounterCards.js", "server/lib/counterCardLint.test.js:82-88", "server/lib/counterCardLint.test.js:689-692"], "allowed_reads": ["server/lib/counterCardLint.js"], "expected": "13 words clean, 15 words HEADLINE_TOO_LONG", "test_name": "C1 headline cap is 14"},
    {"id": "C2", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic1.test.js"], "dependents": ["server/test/healthFirst.test.js"], "allowed_reads": ["server/lib/counterCardLint.js:1543-1612"], "expected": "decision exempt, tier_note still caught", "test_name": "C2 REPEATED_CLAIM exempts decision"},
    {"id": "C3", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic1.test.js", "server/lib/counterCardLint.test.js"], "dependents": ["server/lib/counterCardLint.test.js:654-679"], "allowed_reads": ["server/lib/counterCardLint.js:67-95"], "expected": "orphaned only when the note shares nothing with front or do line", "test_name": "C3 tier note may comment on the front"},
    {"id": "C4", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic1.test.js"], "dependents": [], "allowed_reads": ["server/lib/counterCardLint.js:465-537"], "expected": "hedge pinned; milk front passes", "test_name": "C4 HEADLINE_HEDGED unloosened"},
    {"id": "C5", "impl": ["server/test/acceptance/passRule.js"], "tests": ["server/test/acceptance/ic1.test.js"], "dependents": ["server/test/acceptance/k5.test.js", "server/test/acceptance/k6.test.js", "server/test/acceptance/k7.test.js", "server/test/acceptance/k8.test.js", "server/test/acceptance/k9.test.js", "server/test/acceptance/k10.test.js", "server/test/acceptance/k11.test.js", "server/test/acceptance/k14.test.js"], "allowed_reads": ["server/test/acceptance/passRule.js"], "expected": "set ids relaxed; others frozen; alias may move to another card", "test_name": "C5 passRule ITEM_CARD_REWRITE"},
    {"id": "C6", "impl": ["server/test/acceptance/passRule.js"], "tests": ["server/test/acceptance/ic1.test.js"], "dependents": [], "allowed_reads": ["docs/ITEM-CARDS-PLAN.md"], "expected": "exactly 23 ids, all in KB", "test_name": "C6 ITEM_CARD_REWRITE is the S7 set"},
    {"id": "C7", "impl": ["server/lib/counterCardLint.js"], "tests": ["server/test/acceptance/ic1.test.js", "server/lib/counterCardLint.test.js"], "dependents": ["server/test/acceptance/k5.test.js", "server/test/acceptance/k14.test.js"], "allowed_reads": ["server/lib/doLines.json", "server/kristy_perimeter_kb.json"], "expected": "pending set == raw failures; lintCard emits 0 TIER_NOTE_ORPHANED", "test_name": "C7 orphan ratchet"},
    {"id": "C8", "impl": ["server/scripts/migrateCounterCards.js"], "tests": ["server/test/acceptance/ic1.test.js"], "dependents": ["server/lib/kindFilter.test.js"], "allowed_reads": ["server/scripts/migrateCounterCards.js"], "expected": "migration blocks at 15 words, not 13", "test_name": "C8 migration reads the lint cap"}
  ],
  "dependency_evidence": [
    {"owned": "server/scripts/migrateCounterCards.js", "imports": ["server/lib/counterCards.js", "server/lib/perimeter.js"], "tests": ["server/lib/kindFilter.test.js:40"], "source": "grep projectCorpus, planner 2026-10-14"},
    {"owned": "server/test/acceptance/passRule.js", "imports": ["server/lib/counterCardLint.js"], "tests": ["k5..k11 acceptance SLICE tests", "server/test/acceptance/k14.test.js:145-151"], "source": "S5 survey + k14.test.js read in full"},
    {"owned": "server/lib/counterCardLint.js", "imports": ["server/lib/doLines.json", "server/kristy_perimeter_kb.json"], "tests": ["server/lib/counterCardLint.test.js", "k5..k24 acceptance"], "source": "grep MAX_HEADLINE_WORDS|HEADLINE_DO_MAX|tierNoteOrphaned"}
  ],
  "env": {"executables": ["node", "git"], "browsers": [], "temp": "/Users/m1/kristy/.pipeline/runs/ic-1", "network": false}
}
```

## Acceptance server/test/acceptance/ic1.test.js
```js
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
```

## ANCHOR server/lib/counterCardLint.js:89
```
/** True when the note echoes the decision and shares nothing with the do line it renders under. */
export function tierNoteOrphaned(card, doLine) {
  const note = card?.tier_note;
  const decision = card?.decision ?? card?.headline;
  if (!note || !doLine || !decision) return false;
  return !overlaps(note, doLine) && overlaps(note, decision);
}
```

## ANCHOR server/lib/counterCardLint.js:97
```
export const MAX_DO_WORDS = 12 + 2;

// An alias is matched as a phrase inside a question, so it has to be a subject phrase
// rather than a sentence. Past four words it stops appearing verbatim in real questions.
export const MAX_ALIAS_WORDS = 4;
export const MAX_HEADLINE_WORDS = 12;
```

## ANCHOR server/lib/counterCardLint.js:1122
```
  // The do line a shopper reads is doLines.json's, not the card's own; a card with no entry
  // there (a generated one) renders its own and is skipped.
  const shownDo = doLines[card?.id ?? card?.slug];
  if (tierNote && shownDo && tierNoteOrphaned(card, shownDo)) {
```

## ANCHOR server/lib/counterCardLint.js:1347
```
   Thresholds measured 2026-10-06 over the 109 curated cards: headline+do p95 25 / max 25;
   short_answer p50 62 / max 112; sentence p90 23 / p95 27 / max 43. */
export const HEADLINE_DO_MAX = 26;
```

## ANCHOR server/lib/counterCardLint.js:1576
```
export const REPEATED_CLAIM_FIELDS = [
  'decision', 'why', 'short_answer', 'detail', 'science', 'kristy_take', 'tier_note',
  'pick_steps', 'buying_tips', 'look_for', 'watch_out', 'labels_decoded',
];
```

## ANCHOR server/lib/counterCardLint.test.js:82
```
test('a headline over 12 words fails, on a generated card', () => {
  const card = generated({
    headline: 'This is a description of the produce section that runs on well past the limit.',
  });
```

## ANCHOR server/lib/counterCardLint.test.js:654
```
// Invented card: the note echoes the decision's vocabulary and none of the do line's.
test('a tier note written against the old decision, sharing nothing with the do line, is orphaned', () => {
  const card = {
    decision: 'Pickled turnips keep their crunch only when the brine is unheated.',
    tier_note: 'That the crunch survives an unheated brine is documented, not a preference.',
  };
  assert.ok(tierNoteOrphaned(card, 'Shake the jar and choose the one with the cloudiest liquid.'));
});
```

## ANCHOR server/test/acceptance/passRule.js:28
```
export function assertPassRule(t, oldEntry, newEntry) {
  const id = oldEntry.id;
  const rewrite = HEALTH_FIRST_REWRITE.has(id);
  for (const f of FROZEN) {
```

## ANCHOR server/test/acceptance/passRule.js:38
```
    for (const a of oldEntry.aliases || []) {
      if (!(newEntry.aliases || []).includes(a)) assert.ok(CULINARY_LEXICON.test(a), `${id}: alias "${a}" dropped but is not a cook-verb alias`);
    }
```

## ANCHOR server/scripts/migrateCounterCards.js:74
```
    if (words(card.headline) > 12) problems.longHeadline.push(`${entry.id} (${words(card.headline)}w)`);
    if (card.do && words(card.do) > 14) problems.longDo.push(`${entry.id} (${words(card.do)}w)`);

    const cov = coverage(entry, card);
```

## ANCHOR server/scripts/migrateCounterCards.js:238
```
  if (problems.missingDo.length) line('MISSING do LINE', problems.missingDo);
  if (problems.longHeadline.length) line('HEADLINE OVER 12 WORDS', problems.longHeadline);
  if (problems.longDo.length) line('do LINE OVER 14 WORDS', problems.longDo);
```

## Prerequisites
Env: node ≥20 (`node --test`, JSON import attributes), git on PATH, writable `/Users/m1/kristy/.pipeline/runs/ic-1/`. No network, no Supabase, no model key.
The acceptance file is created by the admin/dv from the block above before the build; it must fail at HEAD (it imports `ITEM_CARD_REWRITE` and `TIER_NOTE_ORPHANED_PENDING`, which do not exist yet).

## Answers
- Suite runtime: `npm test` ~1-3 min; last measured 2449 pass / 0 fail at `25e0905`. Record the new count.
- Expected npm result: all pass except k14 C12 (passRule.js diff vs e92e7c9). Do NOT edit k14.test.js; main re-anchors C12 after the commit.
- Do not commit, stash, checkout or touch git state. Hard cap 60 min. Stop BLOCKED after 3 identical failures. Report ≤30 lines, READY / NOT READY.
- Never delete an assertion without a replacement. Leave `server/test/acceptance/fixtures/kb-pre-readability.json` alone.
- Why the passRule set matters only for frozen fields: `decision` and `tier_note` are already REWRITABLE and `do` is not a KB field. ITEM_CARD_REWRITE exists for the fold survivors' gained aliases/asked_as/sources/labels_decoded/cart_pick.
- `evidence_tier` stays FROZEN for every id, ITEM_CARD_REWRITE included. Do not add it to RELAXED.
- The pending set may be large; that is expected (CLAUDE.md recorded "neither" as a known gap). Do not rewrite any tier_note here.
- If C7 shows a card whose tier_note is empty, it is outside the set (filter `e.tier_note`).
- Allowed reads: the read_full ranges, `server/lib/counterCards.js` (projectEntry), `server/lib/perimeter.js` (questionEntries), `server/lib/doLines.json`, the KB.

## Tried and rejected
- Loosening HEADLINE_HEDGED to admit "if you can get it": Devon ruled the milk front as a rank form instead; the hedge stays pinned.
- Rewriting the newly orphaned tier notes in IC-1: that is card content; each IC-*b piece owns its batch's notes. A ratchet set keeps k5–k24 `lintCard == []` green meanwhile.
- Adding `evidence_tier` to RELAXED: claim-lock rule 3 forbids silent tier moves; organic_worth_it_by_type stays `credible_concern`.
- Leaving migrateCounterCards.js at its hardcoded 12: a 13-14-word front would pass lint and then block the migration.
