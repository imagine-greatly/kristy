import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPatches } from './applyCardPatches.js';
import { mergeFamilyBuild, sortBuildFiles } from './mergeFamilyBuild.js';

const family = {
  id: 'fam_fruit', kind: 'family', title: 'Fruit', category: 'aisle_produce', decision: 'Choose firm fruit.',
  why: 'Firm flesh holds its shape.', sources: [{ name: 'Fixture', url: 'https://example.invalid/fruit' }],
};
const aisle = {
  id: 'aisle_produce', kind: 'aisle', title: 'Produce', category: 'aisle_produce', decision: 'Choose whole produce.',
  buying_tips: ['Check the skin.', 'Check the stem.', 'Skip leaking fruit.'],
};
const entry = {
  id: 'fixture_fruit', title: 'Fruit', category: 'produce', aliases: ['fruit'], decision: 'Buy firm fruit.',
  evidence_tier: 'established', tier_note: 'Firm fruit holds its shape when sliced.',
  short_answer: 'Choose firm fruit.', buying_tips: [], sources: [],
};
const kb = { schema_version: 1, entries: [entry] };
const build = { families: [family], aisles: [aisle], patches: { fixture_fruit: { family: 'fam_fruit', delta: 'Choose the softer ones for sauce.' } } };
const reviewed = { fixture_fruit: 'Check the skin for soft spots.' };

test('merge replaces by ID, patches after all groups, lints, and is idempotent without mutating input', () => {
  const before = structuredClone(kb);
  const merged = mergeFamilyBuild(kb, [build], { reviewed });
  assert.equal(merged.entries.length, 3);
  assert.equal(merged.entries[0].family, family.id);
  assert.equal(merged.entries[0].delta, build.patches.fixture_fruit.delta);
  assert.deepEqual(mergeFamilyBuild(merged, [build], { reviewed }), merged);
  assert.deepEqual(kb, before);
  const changed = { ...build, families: [{ ...family, why: 'Replacement depth.' }] };
  assert.equal(mergeFamilyBuild(merged, [changed], { reviewed }).entries.find((e) => e.id === family.id).why, 'Replacement depth.');
  const split = [
    { families: [], aisles: [], patches: build.patches },
    { families: [family], aisles: [aisle], patches: {} },
  ];
  assert.deepEqual(mergeFamilyBuild(kb, split, { reviewed }), merged);
});

test('merge rejects malformed entries, missing targets, invalid references, and bad cards before writing', () => {
  for (const bad of [
    { ...build, families: [{ ...family, decision: '' }] },
    { ...build, families: [{ ...family, aliases: ['fruit'] }] },
    { ...build, aisles: [{ ...aisle, category: 'produce' }] },
    { ...build, patches: { missing: { family: family.id } } },
    { ...build, patches: { fixture_fruit: { family: 'fam_missing' } } },
    { ...build, patches: { fixture_fruit: { family: family.id, delta: 'x'.repeat(401) } } },
    { ...build, patches: { fixture_fruit: { decision: '' } } },
    { ...build, families: [{ ...family, id: entry.id }] },
  ]) assert.throws(() => mergeFamilyBuild(kb, [bad], { reviewed }));
  assert.throws(() => mergeFamilyBuild(kb, [{ families: [], aisles: [] }], { reviewed }));
});

test('patch whitelist admits metadata/navigation fields, rejects IDs and kind conversion, and keeps picks immutable', () => {
  const base = { entries: [entry, family] };
  const patched = applyPatches(base, [{ fixture_fruit: { family: family.id, delta: 'An exception.' } }]);
  assert.equal(patched.updated, 1);
  assert.equal(patched.kb.entries[0].delta, 'An exception.');
  for (const patch of [{ id: 'other' }, { kind: 'family' }, { kind: 'shelf' }, { kind: null }, { typo: 1 }]) {
    assert.throws(() => applyPatches(base, [{ fixture_fruit: patch }]));
  }
  const { id, ...fields } = family;
  assert.equal(applyPatches(kb, [{ [id]: fields }]).added, 1, 'navigation does not need aliases');
  assert.throws(() => applyPatches(kb, [{ added: { title: 'New', category: 'produce', decision: 'Buy it.' } }]));
  assert.throws(() => applyPatches({ entries: [{ id: 'pick_fixture', kind: 'pick' }] }, [{ pick_fixture: { delta: 'No.' } }]));
  assert.throws(() => applyPatches(base, [{ fixture_fruit: { delta: 'No family.' } }]));
});

const pick = {
  id: 'pick_x', kind: 'pick', title: 'Pears', category: 'produce', aliases: ['pear', 'pears'],
  decision: 'Firm pears with intact stems, else the USDA Organic seal.',
  sources: [{ name: 'Fixture', url: 'https://example.invalid/pears' }],
};

test('picks[] creates or field-merges a pick, and lint runs on it', () => {
  const merged = mergeFamilyBuild(kb, [{ ...build, picks: [pick] }], { reviewed });
  assert.deepEqual(merged.entries.find((e) => e.id === 'pick_x'), pick);
  const patched = mergeFamilyBuild(merged, [{ families: [], aisles: [], patches: {}, picks: [{ id: 'pick_x', kind: 'pick', avoid: 'Pass on bruised pears.' }] }], { reviewed });
  assert.equal(patched.entries.find((e) => e.id === 'pick_x').avoid, 'Pass on bruised pears.');
  assert.equal(patched.entries.find((e) => e.id === 'pick_x').decision, pick.decision);
  assert.throws(() => mergeFamilyBuild(kb, [{ ...build, picks: [{ ...pick, decision: '' }] }], { reviewed }), /pick_x/);
});

test('a picks[] entry whose kind is not pick throws', () => {
  assert.throws(() => mergeFamilyBuild(kb, [{ ...build, picks: [{ ...pick, kind: 'card' }] }], { reviewed }));
  assert.throws(() => mergeFamilyBuild(kb, [{ ...build, picks: [{ ...pick, id: 'fam_fruit' }] }], { reviewed }));
});

test('pilot-* files rank above shelf-*, so a pilot patch wins', () => {
  const files = sortBuildFiles(['pilot-a.json', 'shelf-a.json', 'reconcile.json', 'b.json']);
  assert.deepEqual(files, ['b.json', 'reconcile.json', 'shelf-a.json', 'pilot-a.json']);
  const byFile = {
    'shelf-a.json': { families: [], aisles: [], patches: { fixture_fruit: { decision: 'Buy shelf fruit.' } } },
    'pilot-a.json': { families: [], aisles: [], patches: { fixture_fruit: { decision: 'Buy pilot fruit.' } } },
  };
  const merged = mergeFamilyBuild(kb, sortBuildFiles(Object.keys(byFile)).map((f) => byFile[f]), { reviewed });
  assert.equal(merged.entries.find((e) => e.id === 'fixture_fruit').decision, 'Buy pilot fruit.');
});

test('merging twice is byte-identical', () => {
  const builds = [{ ...build, picks: [pick] }];
  const once = JSON.stringify(mergeFamilyBuild(kb, builds, { reviewed }), null, 2);
  const twice = JSON.stringify(mergeFamilyBuild(JSON.parse(once), builds, { reviewed }), null, 2);
  assert.equal(twice, once);
});

test('a top-level do_lines key is ignored and never written to the KB', () => {
  const merged = mergeFamilyBuild(kb, [{ ...build, do_lines: { fixture_fruit: 'Check the skin.' } }], { reviewed });
  assert.equal('do_lines' in merged, false);
  assert.equal(JSON.stringify(merged).includes('do_lines'), false);
});
