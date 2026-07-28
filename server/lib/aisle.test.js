import test from 'node:test';
import assert from 'node:assert/strict';

import { sectionIndex, sectionById, PERIMETER_SECTIONS, perimeterKb } from './perimeter.js';
import { pickForName, annotateFromPicks, PICKS } from './list.js';

/* ═══════════ The perimeter as a DESTINATION, not a search box ═══════════
   Scanning reads the labeled half of the store. These pin the other half: browsable
   by section, free, and honest about where it thins out. */

test('every store section resolves to real topics', () => {
  const sections = sectionIndex();
  assert.equal(sections.length, PERIMETER_SECTIONS.length);
  for (const s of sections) {
    assert.ok(s.topics.length > 0, `${s.id} has no topics`);
    assert.equal(s.count, s.topics.length);
    assert.ok(s.title && s.blurb, `${s.id} missing title/blurb`);
    for (const t of s.topics) {
      assert.ok(t.id && t.title, `${s.id} has a malformed topic`);
      assert.ok(t.evidence_tier, `${t.id} must carry its evidence tier into the index`);
    }
  }
});

test('the five shopper-facing sections exist and cover the KB', () => {
  const ids = sectionIndex().map((s) => s.id);
  for (const want of ['meat', 'seafood', 'produce', 'eggs_dairy', 'bulk_pantry']) {
    assert.ok(ids.includes(want), `missing section ${want}`);
  }
  // Nothing in the KB may be unreachable by browsing — an entry no section lists is
  // content that exists and can never be found.
  const reachable = new Set(sectionIndex().flatMap((s) => [...s.topics, ...s.labelTopics]).map((t) => t.id));
  const orphans = (perimeterKb.entries || []).map((e) => e.id).filter((id) => !reachable.has(id));
  assert.deepEqual(orphans, [], `unreachable perimeter entries: ${orphans.join(', ')}`);
});

test('a thin section says so rather than padding itself', () => {
  const seafood = sectionById('seafood');
  assert.ok(seafood.thinNote, 'seafood must name what it does not cover');
  assert.match(seafood.thinNote, /not covered yet/i);
  // The honesty is a NOTE, never fake topics: the count is the real entry count.
  assert.equal(seafood.count, seafood.topics.length);
  assert.equal(sectionById('produce').thinNote, null, 'a covered section claims no gap');
});

test('label terms cross-list into the section where they are actually read', () => {
  const meat = sectionById('meat');
  const ids = meat.labelTopics.map((t) => t.id);
  assert.ok(ids.includes('label_no_added_hormones'), 'the hormone sticker is a meat-case question');
  assert.ok(ids.includes('label_grass_fed_term'));
  // Cross-listing is additive — it never inflates the section's own count.
  assert.equal(meat.count, meat.topics.length);
});

test('sectionById is honest about a miss', () => {
  assert.equal(sectionById('frozen_pizza'), null);
  assert.equal(sectionById(''), null);
});

/* ═══════════ Authored reasoning for a conversationally-built cart ═══════════
   The composer may emit NAMES ONLY. Reasons are LOOKED UP from copy that already
   passed the claim-safety tripwire, never generated. */

test('a composed item inherits the authored reason for the pick it resolves to', () => {
  const out = annotateFromPicks([
    { name: 'Sweet potatoes', category: 'Produce' },
    { name: 'Bone-in chicken thighs', category: 'Meat & Seafood' },
  ]);
  assert.match(out[0].why, /nutrient-dense/i, 'exact-name match inherits its reason');
  assert.ok(out[1].why, 'a MORE specific name still resolves to its pick');
  assert.equal(out[1].perimeterId, PICKS.chicken.perimeterId, 'and carries the sourced entry');
});

test('an unknown item gets NO reason — a blank beats a borrowed one', () => {
  const out = annotateFromPicks([{ name: 'Paper towels', category: 'Pantry' }]);
  assert.equal(out[0].why, undefined);
});

test('a vaguer name never inherits a more specific pick\'s claim', () => {
  // "beef" must not pick up the grass-fed row's reasoning: the shopper's own words
  // never made that claim, and a borrowed reason is a fabricated one.
  assert.equal(pickForName('beef'), null);
  assert.equal(pickForName('oil'), null);
  assert.equal(pickForName('rice'), null);
});

test('an existing reason is never overwritten', () => {
  const out = annotateFromPicks([{ name: 'Sweet potatoes', why: 'Because you asked for them.' }]);
  assert.equal(out[0].why, 'Because you asked for them.');
});
