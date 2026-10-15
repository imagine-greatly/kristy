// CA-1: section lints L1-L5, CANONICAL_GLOSSES, CARD_ALIGN_REWRITE (docs/CARD-ALIGNMENT-PLAN.md CA-1). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from 'file:///Users/m1/kristy/server/lib/counterCardLint.js';
import * as pass from 'file:///Users/m1/kristy/server/test/acceptance/passRule.js';
import { RETIRED } from 'file:///Users/m1/kristy/server/lib/counterCards.js';

const SERVER = join(dirname(fileURLToPath("file:///Users/m1/kristy/server/test/acceptance/ca-1.test.js")), '..', '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const rules = JSON.parse(readFileSync(join(SERVER, 'lib', 'sectionRules.json'), 'utf8'));
const CODES = ['SECTION_TIP_REPEATS_CARD', 'SECTION_PHRASE_REPEATED', 'SECTION_TIP_HANDLING', 'TERM_UNGLOSSED', 'CART_PICK_DISAGREES'];
const run = (tips, entries) => lint.lintSections(tips, entries);
const tip = (section, over = {}) => ({ section, rule: 'Fixture rule.', checks: [], ...over });
const card = (id, category, over = {}) => ({ id, category, title: id, decision: 'Fixture', ...over });
const byCode = (hits, code) => hits.filter((h) => h.code === code);
const ALL = ['meat', 'eggs_dairy', 'produce', 'bulk_pantry', 'seafood'].map((s) => tip(s, { cards_aligned: true }));
const G = Object.fromEntries((lint.CANONICAL_GLOSSES || []).map((r) => [r.id, r]));
const RETIRED_IDS = new Set([...(RETIRED || [])].map((r) => (typeof r === 'string' ? r : r.id)));
const unglossed = (c) => byCode(run(ALL, [c]), 'TERM_UNGLOSSED').map((h) => h.row);
const pickForms = (c) => byCode(run(ALL, [c]), 'CART_PICK_DISAGREES').map((h) => h.form);
const repeated = (cards) => byCode(run(ALL, cards), 'SECTION_PHRASE_REPEATED').map((h) => [h.form, h.ids]);

const OVERLAP = 'Ask what the animal ate and how it lived; a butcher counter can answer.';
const SEALED = 'Take a sealed package that is not leaking.';
const GRASS = [
  'Beef is best when the animal ate grass its whole life.',
  'Lamb counts only when the animal ate grass its whole life.',
  'Bison is a fit when the animal ate grass its whole life.',
];
const trio = (overs) => [card('ca1_a', 'beef', overs[0]), card('ca1_b', 'meat_counter', overs[1]), card('ca1_c', 'pork', overs[2])];
const BLEND = 'Organ blend with each organ’s percentage first, then ground beef with nothing added.';
const CA5_TIPS = [
  { section: 'meat', rule: 'A local butcher comes first; at the case, choose meat from animals raised on grass and open pasture.', checks: ['Ask what the animal ate and how it lived; a butcher counter can answer.', 'Organs come from the same animal; liver and heart belong in the cart too.', 'On packaged meat, look for an ingredient list of meat, salt, and spices.'] },
  { section: 'eggs_dairy', rule: 'Eggs and dairy start with how the animal ate and lived: cows on grass, hens on pasture.', checks: ['Read how the animal lived and what it ate before anything else on the label.', 'Dairy needs few ingredients: milk or cream, cultures, salt, and enzymes for cheese.'] },
  { section: 'produce', rule: 'Choose produce grown organic or unsprayed, and pick it whole and in season.', checks: ['Local and in season comes first; ask the produce staff what that is this week.', 'Frozen fruit and vegetables with nothing added count as whole food too.'] },
  { section: 'seafood', rule: 'Wild-caught fish ate its natural diet; choose wild first and ask where it was caught.', checks: ['Ask the counter where the fish was caught and how.'] },
  { section: 'bulk_pantry', rule: 'Choose packages with a short list of real ingredients and only natural fats: tallow, olive oil, coconut oil.', checks: ['Skip seed oils and avocado oil, whatever the front of the package says.', 'The ingredient line tells more than the front; read it first.'] },
  { section: 'frozen', rule: 'Frozen food counts as whole when the bag lists the food and nothing else.', checks: ['Frozen meals follow the pantry rule: real ingredients, natural fats only.'] },
];
const CA_IDS = [
  'beef_grassfed_vs_grainfed', 'ground_beef_lean_ratio', 'beef_cuts_basics', 'organ_meats', 'butcher_counter_asking',
  'judging_meat_at_the_case', 'bison', 'venison_game', 'lamb_goat', 'pick_soup_bones',
  'pork_cuts_and_enhanced', 'pick_sausage', 'pick_jerky', 'chicken_cuts_basics', 'chicken_breast',
  'rotisserie_chicken', 'turkey_whole', 'ground_turkey',
  'bacon', 'ham', 'hot_dogs', 'turkey_bacon', 'cured_pork', 'deli_meat_uncured',
  'egg_labels', 'egg_duck_quail', 'pick_egg_whites',
  'whole_vs_reduced_fat_milk', 'raw_milk', 'yogurt_plain_vs_flavored', 'grassfed_butter', 'ghee', 'plain_kefir',
  'raw_kefir', 'sour_cream', 'cream_cheese', 'cottage_cheese', 'cheese_real_vs_processed', 'raw_aged_cheese',
  'goat_sheep_dairy', 'cream_vs_creamer', 'ice_cream', 'dairy_case',
  'almond_milk', 'oat_milk', 'soy_milk', 'coconut_milk_beverage', 'plant_butter',
];

test('C1 lintSections is clean at HEAD with flags stripped and prints the forced-flag baseline', () => {
  assert.equal(typeof lint.lintSections, 'function', 'lintSections is not exported');
  assert.ok(rules.length >= 6, `sectionRules rows ${rules.length}`);
  assert.ok(kb.entries.length >= 180, `KB entries ${kb.entries.length}`);
  const stripped = rules.map(({ tip_aligned, cards_aligned, ...r }) => r);
  assert.deepEqual(run(stripped, kb.entries), []);
  const forced = run(stripped.map((r) => ({ ...r, tip_aligned: true, cards_aligned: true })), kb.entries);
  assert.ok(Array.isArray(forced));
  const counts = {};
  for (const h of forced) {
    assert.ok(CODES.includes(h.code), `unknown code ${h.code}`);
    assert.equal(typeof h.section, 'string');
    counts[`${h.section} ${h.code}`] = (counts[`${h.section} ${h.code}`] || 0) + 1;
  }
  console.log(`ca-1 forced-flag baseline: ${JSON.stringify(counts)}`);
  const corpusTest = readFileSync(join(SERVER, 'lib', 'counterCardLint.test.js'), 'utf8');
  assert.match(corpusTest, /lintSections\(sectionRules, perimeterKb\.entries\)/);
});

test('C2 L1 fires on a shared 5-word phrase and not on a 4-word one', () => {
  const t = [tip('meat', { tip_aligned: true, checks: [OVERLAP] })];
  const hits = byCode(run(t, [card('ca1_beef', 'beef', { why: 'Before buying, ask what the animal ate at the farm.' })]), 'SECTION_TIP_REPEATS_CARD');
  assert.deepEqual(hits.map((h) => [h.section, h.id]), [['meat', 'ca1_beef']]);
  assert.match(hits[0].phrase, /animal ate/);
  const near = run(t, [card('ca1_beef', 'beef', { why: 'Before buying, ask what the animal eats at the farm.' })]);
  assert.deepEqual(byCode(near, 'SECTION_TIP_REPEATS_CARD'), []);
});

test('C3 L2 fires on 3 cards and exempts 2 cards, POINTER lines, glosses and canonical terms', () => {
  const fronts = ['Chuck roast', 'Lamb shoulder', 'Bison steak'];
  const three = trio(GRASS.map((why, i) => ({ decision: fronts[i], why })));
  assert.deepEqual(repeated(three), [['fields', ['ca1_a', 'ca1_b', 'ca1_c']]]);
  assert.deepEqual(repeated(three.slice(0, 2)), []);
  const pointer = { pick_steps: ['How it was raised: see Beef.'] };
  assert.deepEqual(repeated(trio([pointer, pointer, pointer])), []);
  const fat = { why: 'Fry only in tallow, olive oil, or coconut oil for this.' };
  assert.deepEqual(repeated([card('ca1_p1', 'bulk_pantry', fat), card('ca1_p2', 'bulk_pantry', fat), card('ca1_p3', 'bulk_pantry', fat)]), []);
  const plain = ['Steak with nothing added at all', 'Roast with nothing added at all', 'Ribs with nothing added at all'];
  assert.deepEqual(repeated(trio(plain.map((decision) => ({ decision })))), [['front', ['ca1_a', 'ca1_b', 'ca1_c']]]);
  const term = ['Steak cut 100% grass-fed or grass-finished', 'Roast labeled 100% grass-fed or grass-finished', 'Short ribs sold 100% grass-fed or grass-finished'];
  assert.deepEqual(repeated(trio(term.map((decision) => ({ decision })))), []);
});

test('C4 L3 fires on a handling check only under tip_aligned and passes the CA-5 tips', () => {
  const texts = byCode(run([tip('meat', { tip_aligned: true, checks: [SEALED] })], []), 'SECTION_TIP_HANDLING').map((h) => h.text);
  assert.deepEqual(texts, [SEALED]);
  assert.deepEqual(run([tip('meat', { checks: [SEALED] })], []), []);
  assert.deepEqual(run(CA5_TIPS.map((t) => ({ ...t, tip_aligned: true })), []), []);
});

test('C5 L4 needs each scoped row gloss on the card', () => {
  const g1 = '100% grass-fed or grass-finished beef';
  assert.deepEqual(unglossed(card('ca1_g1', 'beef', { decision: g1 })), ['G1']);
  assert.deepEqual(unglossed(card('ca1_g1', 'beef', { decision: g1, tier_note: `On beef, ${G.G1.gloss}.` })), []);
  const yog = 'Plain yogurt from 100% grass-fed milk';
  assert.deepEqual(unglossed(card('ca1_g2', 'dairy', { decision: yog })), ['G2']);
  assert.deepEqual(unglossed(card('ca1_g2', 'dairy', { decision: yog, pick_steps: [`100% grass-fed on the tub means ${G.G2.gloss}.`] })), []);
  assert.deepEqual(unglossed(card('ca1_g2', 'poultry_eggs', { decision: yog })), []);
  const g3 = 'Pasture-raised eggs with a seal';
  assert.deepEqual(unglossed(card('ca1_g3', 'poultry_eggs', { decision: g3 })), ['G3']);
  assert.deepEqual(unglossed(card('ca1_g3', 'poultry_eggs', { decision: g3, tier_note: `Pasture-raised means ${G.G3.gloss}.` })), []);
  const g4 = 'Organic eggs from the farm';
  assert.deepEqual(unglossed(card('ca1_g4', 'poultry_eggs', { decision: g4 })), ['G4']);
  assert.deepEqual(unglossed(card('ca1_g4', 'poultry_eggs', { decision: g4, pick_steps: [`Organic means ${G.G4.gloss}.`] })), []);
  const g5 = 'Organic berries with nothing added';
  assert.deepEqual(unglossed(card('ca1_g5', 'produce', { decision: g5 })), ['G5']);
  assert.deepEqual(unglossed(card('ca1_g5', 'produce', { decision: g5, tier_note: `Organic means ${G.G4.gloss}.` })), ['G5']);
  assert.deepEqual(unglossed(card('ca1_g5', 'produce', { decision: g5, tier_note: `Organic means ${G.G5.gloss}.` })), []);
  const g6 = 'Chips fried in a natural fat';
  assert.deepEqual(unglossed(card('ca1_g6', 'bulk_pantry', { decision: g6 })), ['G6']);
  assert.deepEqual(unglossed(card('ca1_g6', 'bulk_pantry', { decision: g6, tier_note: `A natural fat is ${G.G6.gloss}.` })), []);
  const g7 = 'Crackers made with no seed oil';
  assert.deepEqual(unglossed(card('ca1_g7', 'bulk_pantry', { decision: g7 })), ['G7']);
  assert.deepEqual(unglossed(card('ca1_g7', 'bulk_pantry', { decision: g7, instead: `Skip ${G.G7.gloss} oils.` })), []);
  assert.deepEqual(unglossed(card('ca1_sea', 'seafood', { decision: 'Organic salmon fillet' })), []);
});

test('C6 CANONICAL_GLOSSES is the plan table with G1 on the A1 fallback', () => {
  const rows = lint.CANONICAL_GLOSSES;
  assert.ok(Array.isArray(rows), 'CANONICAL_GLOSSES is not an exported array');
  assert.deepEqual(rows.map((r) => r.id), ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']);
  const plain = ['100% grass-fed or grass-finished', '100% grass-fed', 'pasture-raised', 'organic', 'organic', 'natural fat', 'seed oil'];
  rows.forEach((r, i) => {
    assert.ok(r.term instanceof RegExp, `${r.id} term`);
    assert.equal(r.term.global, false, `${r.id} term is global`);
    assert.ok(r.term.test(plain[i]), `${r.id} term misses ${plain[i]}`);
    assert.equal(typeof r.trace, 'string', `${r.id} trace`);
    assert.ok(r.trace.trim().length > 0, `${r.id} trace empty`);
  });
  assert.deepEqual(rows.map((r) => r.sections), [['meat'], ['eggs_dairy'], ['meat', 'eggs_dairy'], ['meat', 'eggs_dairy'], ['produce'], ['bulk_pantry', 'frozen', 'eggs_dairy'], ['bulk_pantry', 'frozen', 'eggs_dairy']]);
  assert.deepEqual(rows.map((r) => r.categories), [null, ['dairy'], null, null, null, null, null]);
  const seen = new Set();
  for (const r of rows) {
    for (const s of r.sections) {
      const key = `${r.term.source.toLowerCase()} @ ${s}`;
      assert.ok(!seen.has(key), `two rows share ${key}`);
      seen.add(key);
    }
  }
  assert.deepEqual(rows.map((r) => r.gloss), [
    '“grass-fed” is the producer’s own word unless a certifier’s seal audits it',
    'the cows ate grass and hay, never grain',
    'time outdoors on pasture, audited only with a certifier’s seal',
    'certified organic feed and outdoor access',
    'grown without synthetic pesticides beyond a short approved list',
    'tallow, olive oil, or coconut oil',
    'sunflower, safflower, canola, soybean, corn, and cottonseed',
  ]);
});

test('C7 L5 fires on a family the front lacks or a dropped first-rung term', () => {
  assert.deepEqual(pickForms(card('ca1_gb', 'beef', { decision: BLEND, cart_pick: 'Ground beef, grass-fed and grass-finished' })), ['a']);
  assert.deepEqual(pickForms(card('ca1_gb', 'beef', { decision: BLEND, cart_pick: 'Liver and heart beef blend, shares stated' })), []);
  const eggs = 'Pasture-raised, organic, and corn- and soy-free, all three together.';
  assert.deepEqual(pickForms(card('ca1_eg', 'poultry_eggs', { decision: eggs, cart_pick: 'Soy-free pasture-raised eggs' })), ['b']);
  assert.deepEqual(pickForms(card('ca1_eg', 'poultry_eggs', { decision: eggs, cart_pick: 'Pasture-raised organic corn- and soy-free eggs' })), []);
  const milk = 'Raw from a trusted local farmer first, then low-temp pasteurized, 100% grass-fed.';
  assert.deepEqual(pickForms(card('ca1_mk', 'dairy', { decision: milk, cart_pick: 'Low-temp pasteurized 100% grass-fed whole milk' })), []);
  const chips = 'Sliced potatoes, salt, and a natural fat, never seed oil or avocado oil.';
  assert.deepEqual(pickForms(card('ca1_ch', 'bulk_pantry', { decision: chips, cart_pick: 'Potato chips cooked in tallow, olive oil, or coconut oil' })), []);
  assert.deepEqual(pickForms(card('ca1_ch', 'bulk_pantry', { decision: chips, cart_pick: 'Kettle potato chips' })), ['b']);
});

test('C8 each lint runs only under its own true flag on its own row', () => {
  const LOUD = [
    card('ca1_l1', 'beef', { why: 'Before buying, ask what the animal ate at the farm.' }),
    ...trio(GRASS.map((why) => ({ why }))),
    card('ca1_g1', 'beef', { decision: '100% grass-fed or grass-finished beef' }),
    card('ca1_gb', 'beef', { decision: BLEND, cart_pick: 'Ground beef, grass-fed and grass-finished' }),
  ];
  const meat = (over) => [tip('meat', { checks: [SEALED, OVERLAP], ...over })];
  assert.deepEqual(run([tip('meat', { tip_aligned: true })], LOUD), []);
  assert.deepEqual(run(meat({ cards_aligned: true }), [LOUD[0]]), []);
  const other = [tip('meat', { tip_aligned: true, cards_aligned: true }), tip('produce', { checks: [SEALED] })];
  assert.deepEqual(run(other, [card('ca1_pr', 'produce', { decision: 'Organic berries with nothing added' })]), []);
  assert.deepEqual(run(meat({ tip_aligned: 'true', cards_aligned: 1 }), LOUD), []);
  const codes = [...new Set(run(meat({ tip_aligned: true, cards_aligned: true }), LOUD).map((h) => h.code))];
  assert.deepEqual(codes, CODES);
});

test('C9 passRule CARD_ALIGN_REWRITE relaxes copy and growth and keeps sources category evidence_tier frozen', () => {
  const { assertPassRule, CARD_ALIGN_REWRITE } = pass;
  assert.ok(CARD_ALIGN_REWRITE instanceof Set, 'CARD_ALIGN_REWRITE is not an exported Set');
  assert.deepEqual([...CARD_ALIGN_REWRITE].sort(), [...CA_IDS].sort());
  const known = new Set(kb.entries.map((e) => e.id));
  for (const id of CARD_ALIGN_REWRITE) assert.ok(known.has(id) || RETIRED_IDS.has(id), `${id} is neither a KB id nor RETIRED`);
  const organOld = {
    id: 'organ_meats', title: 'Organ meats', category: 'meat_counter', evidence_tier: 'fixture',
    decision: 'Old front', tier_note: 'Old why line here.', instead: 'Old second', cart_pick: 'Old pick',
    pick_steps: ['Old step.'], why: 'Old why.', short_answer: 'Old short.', watch_out: ['Old skip.'],
    labels_decoded: [{ term: 'Liver', meaning: 'Old meaning.' }], sources: ['https://example.org/organ'],
    aliases: ['beef liver'], asked_as: ['which liver should i buy'],
  };
  const organNew = {
    ...organOld,
    decision: 'New front', tier_note: 'New why line here.', instead: 'New second', cart_pick: 'New pick',
    pick_steps: ['New step.'], why: 'New why.', short_answer: 'New short.', watch_out: ['Old skip.', 'New skip.'],
    labels_decoded: [{ term: 'Liver', meaning: 'Old meaning.' }, { term: 'Heart', meaning: 'New meaning.' }],
    aliases: ['beef liver', 'organ meat'], asked_as: ['which liver should i buy', 'is liver worth buying'],
  };
  assert.doesNotThrow(() => assertPassRule(null, organOld, organNew));
  const outside = (o) => ({ ...o, id: 'ca1_outside_fixture' });
  assert.throws(() => assertPassRule(null, outside(organOld), outside(organNew)));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, sources: [...organOld.sources, 'https://example.org/new'] }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, sources: ['https://example.org/organ-edited'] }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, sources: [] }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, category: 'beef' }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, evidence_tier: 'other' }));
  assert.throws(() => assertPassRule(null, organOld, { ...organNew, aliases: ['organ meat'] }));
  const gbOld = { id: 'ground_beef_lean_ratio', category: 'beef', evidence_tier: 'fixture', decision: 'Old front', instead: 'Old second', sources: ['https://example.org/gb'] };
  const gbNew = { ...gbOld, decision: 'New front', instead: 'New second', sources: ['https://example.org/gb', 'https://example.org/fold'] };
  assert.doesNotThrow(() => assertPassRule(null, gbOld, gbNew));
  const egg = { id: 'egg_duck_quail', decision: 'Old front', sources: ['https://example.org/egg'] };
  assert.throws(() => assertPassRule(null, egg, { ...egg, sources: ['https://example.org/egg', 'https://example.org/b'] }));
});
