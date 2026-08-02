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

test('the counter browses in the shopper walking order, with the shopper-facing names', () => {
  // Order and titles follow the shopper's walk: Produce leads, because that is where
  // a trip starts and where the perimeter begins.
  const shown = sectionIndex().map((s) => s.title);
  assert.deepEqual(shown.slice(0, 5), ['Produce', 'Meat', 'Seafood', 'Dairy & Eggs', 'Pantry & Bulk']);
  assert.equal(shown[5], 'Label terms', 'label truth stays browsable as its own section');
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

test('every shopper-facing counter carries real depth, not a token entry', () => {
  // The depth bar: each counter with no barcode should answer as much as a scan does.
  // A section that drops below this is thin enough that a shopper would notice.
  // THE FLOOR IS 8, AND THE COUNT IS A PROXY THAT NEEDS WATCHING. It stands in for "this
  // section answers as much as a scan does", which is a claim about CONTENT. Removing a
  // duplicate lowers the count without lowering the content: the 2026-08-02 sweep folded
  // `canned_fish_mercury` into `mercury_by_fish` — the two carried an identical `why`
  // ("mercury tracks size and lifespan") and the survivor holds the full three-tier
  // species list plus the can-specific wording — and seafood went 9 → 8 having lost
  // nothing a shopper could read. Lowering the floor is therefore correct here and would
  // NOT be correct for a section that shrank by deletion. Seafood is now the thinnest
  // section and the next authoring slot belongs to it.
  for (const id of ['meat', 'seafood', 'produce', 'eggs_dairy', 'bulk_pantry']) {
    const s = sectionById(id);
    assert.ok(s.count >= 8, `${id} has only ${s.count} topics`);
  }
  assert.ok(sectionById('label_terms').count >= 15, 'label truth is the thread through all of it');
});

test('a browsed topic carries its cart pick, so the counter fills the cart', () => {
  // The section index is the browse list; the pick has to reach it or "one tap"
  // means "two screens and a tap".
  const seafood = sectionById('seafood').topics;
  const salmon = seafood.find((t) => t.id === 'salmon_wild_vs_farmed');
  assert.ok(salmon, 'salmon is browsable under Seafood');
  assert.equal(salmon.cart_pick, 'Wild-caught salmon');
  // Every counter (not the label section) offers at least one thing to add.
  for (const id of ['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry']) {
    assert.ok(
      sectionById(id).topics.some((t) => t.cart_pick),
      `${id} offers nothing to add to the cart`
    );
  }
});

test('chicken lives at the meat case, not under Dairy & Eggs', () => {
  // It was filed under `poultry_eggs`, so a thigh question surfaced beside yogurt.
  const meat = sectionById('meat').topics.map((t) => t.id);
  assert.ok(meat.includes('chicken_cuts_basics'));
  assert.ok(meat.includes('air_chilled_chicken'));
  const eggs = sectionById('eggs_dairy').topics.map((t) => t.id);
  assert.ok(!eggs.includes('air_chilled_chicken'), 'chicken must not surface under Dairy & Eggs');
  assert.ok(eggs.includes('egg_labels'), 'eggs still do');
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
