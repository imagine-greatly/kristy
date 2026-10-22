// stance sweep P1 (.pipeline/plans/clean-pick-final-sweep.md): SW-C1..SW-C4 for server/scripts/stanceSweep.js. Report-only script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { sweep, run } from '../../scripts/stanceSweep.js';
import { CLEAN_J8_BASE } from './cartPlain.js';

const BASE = 'aba615b'; // the sweep's base; SW-C4 reads it so S4 rewriting the potato headline keeps this green.
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const gitKb = (ref) => JSON.parse(execFileSync('git', ['show', `${ref}:server/kristy_perimeter_kb.json`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());

const card = (id, over = {}) => ({ id, title: 'Thing', category: 'pantry', decision: `Plain ${id} pick here.`, cart_pick: `Plain ${id}`, why: 'A plain line.', buying_tips: [`Tip for ${id}.`], ...over });
const FIXTURES = [
  card('f_m1', { detail: 'Residue stays within legal limits.' }),
  card('f_m2', { why: 'Cook it in canola oil.' }),
  card('f_m3', { watch_out: ['Ask about it.'] }),
  card('f_m4', { decision: 'A cheap pick here.' }),
  card('f_m5', { decision: 'Organic pick, then local.' }),
  card('f_m6', { cart_pick: 'Organic thing' }),
  card('f_m7'),
  card('f_m8', { sources: [{ name: 'x', url: 'https://unarchived.test/a' }] }),
  card('f_m9'),
  card('f_m10', { decision: 'Plain pick from Acme here.' }),
  card('f_m11', { decision: 'Firm pick here.' }),
  card('egg_labels', { decision: 'Pasture eggs here.' }),
  card('f_m13a', { buying_tips: ['Shared tip line.'] }),
  card('f_m13b', { buying_tips: ['Shared tip line.'] }),
  card('f_m13c', { buying_tips: ['Shared tip line.'] }),
  card('f_clean', { sources: [{ name: 'y', url: 'https://archived.test/b/' }] }),
];
const EXPECT = { f_m1: 'M1', f_m2: 'M2', f_m3: 'M3', f_m4: 'M4', f_m5: 'M5', f_m6: 'M6', f_m7: 'M7', f_m8: 'M8', f_m9: 'M9',
  f_m10: null, f_m11: 'M11', egg_labels: 'M12', f_m13a: 'M13', f_m13b: 'M13', f_m13c: 'M13', f_clean: null };

test('SW-C1: each fixture trips exactly its own code', () => {
  const r = sweep(FIXTURES, {
    register: [{ concern: 'zz_concern', terms: ['zzterm'], home: ['f_m7'] }],
    archive: new Set(['https://archived.test/b']),
    // M9 wiring is the stub; the real lintCard/lintCorpus run in SW-C2 over the corpus.
    lint: () => new Map([['f_m9', ['SOME_LINT_CODE']]]),
  });
  nonEmpty(Object.keys(EXPECT), 'fixtures', 16);
  for (const [id, code] of Object.entries(EXPECT)) {
    assert.deepEqual([...new Set(r.flags[id].map((f) => f.code))], code ? [code] : [], id);
  }
  assert.deepEqual(r.frozen.sort(), ['f_clean', 'f_m10', 'f_m8']);
  assert.equal(r.report.f_m10[0].code, 'M10'); // X4: report-only, never a flag
});

test('SW-C2: HEAD run accounts for every entry', () => {
  const out = run('HEAD');
  const kb = gitKb('HEAD');
  assert.equal(out.entries, out.cards + out.picks);
  assert.equal(out.entries, kb.entries.length);
  nonEmpty(Object.values(out.flags).flat(), 'flags');
  nonEmpty(out.frozen, 'frozen');
  const all = kb.entries.map((e) => e.id).sort();
  assert.deepEqual([...out.frozen, ...out.flagged].sort(), all);
  assert.equal(out.frozen.filter((id) => out.flagged.includes(id)).length, 0);
});

test('SW-C3: --ref reads git show, not the working file', () => {
  const ref = 'e70efd9'; // before aba615b stripped "organic" from 29 cart_picks
  const out = JSON.parse(execFileSync('node', ['scripts/stanceSweep.js', '--ref', ref, '--json'], { cwd: new URL('../../', import.meta.url), maxBuffer: 64 << 20 }).toString());
  const kb = gitKb(ref);
  assert.equal(out.ref, ref);
  assert.deepEqual(Object.keys(out.flags).sort(), kb.entries.map((e) => e.id).sort());
  const organicCarts = nonEmpty(kb.entries.filter((e) => /\borganic\b/i.test(e.cart_pick || '')), 'organic carts at ref');
  assert.deepEqual(out.byCode.M6.sort(), organicCarts.map((e) => e.id).sort());
});

test('SW-C4: produce_root_vegetables is M11 at the base', () => {
  assert.ok(run(BASE).byCode.M11.includes('produce_root_vegetables'));
});

// XC1: one fixture per confirmed class X1-X10 is unflagged; a near-miss for each stays flagged.
const CLEAN = [
  card('x1', { watch_out: ['Ask a doctor about it.'] }),
  card('x2', { buying_tips: ['Tip.', 'Ask whether the processor handles each animal individually.'] }),
  card('x3', { short_answer: 'Ask three questions of any seal.' }),
  card('x5', { buying_tips: ['Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.'] }),
  card('x5b', { buying_tips: ['Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.'] }),
  card('x5c', { buying_tips: ['Seed oils to skip: sunflower, safflower, canola, soybean, corn, and cottonseed.'] }),
  card('x6', { decision: 'Local thing labeled grown without sprays, else organic, and bright.' }),
  card('label_x6', { decision: 'Organic labels first.' }),
  card('x8', { detail: 'Lactose intolerance is common.' }),
  card('x9', { title: 'Fresh pasta', decision: 'Fresh pasta from a small maker.' }),
  card('x10', { short_answer: 'Many roasted nuts are cooked in cottonseed, soybean or other seed oils.' }),
];
const STAY = [
  card('s_sourdough', { buying_tips: ['Tip.', 'Tip.', 'Tip.', 'Ask about the starter when the label does not list it.'] }),
  card('s_bha', { buying_tips: ['BHA, BHT and TBHQ are preservatives.'] }),
  card('s_bha2', { buying_tips: ['BHA, BHT and TBHQ are preservatives.'] }),
  card('s_bha3', { buying_tips: ['BHA, BHT and TBHQ are preservatives.'] }),
  card('s_oil', { why: 'Cook it in canola oil.' }),
  card('s_organic', { decision: 'Organic pick, then local.' }),
  card('s_tol', { detail: 'Residue is within tolerance.' }),
];
test('XC1: confirmed classes X1-X10 are unflagged, near misses stay flagged', () => {
  const r = sweep([...CLEAN, ...STAY], { lint: () => new Map(), register: [{ concern: 'clean_fifteen', terms: ['zzterm'], home: ['x1'] }] });
  nonEmpty(CLEAN, 'clean fixtures', 11);
  for (const e of CLEAN) assert.deepEqual(r.flags[e.id], [], e.id);
  for (const e of STAY) assert.ok(r.flagged.includes(e.id), e.id);
});

// X11/X12: M7 register-term exemptions.
test('XC4: M7 skips "none" terms (X11) and veto-word terms on picks only (X12)', () => {
  const reg = (concern, terms, home) => ({ concern, terms, home });
  const r = sweep([card('m_none'), card('pick_p', { kind: 'pick' }), card('m_prot'), card('m_stay')], {
    lint: () => new Map(),
    register: [reg('c1', ['none'], ['m_none']), reg('c2', ['none on label'], ['m_none']), reg('c3', ['protein'], ['pick_p', 'm_prot']), reg('c4', ['zzterm'], ['m_stay'])],
  });
  assert.deepEqual(r.flags.m_none, []);
  assert.deepEqual(r.flags.pick_p, []);
  assert.deepEqual(r.flags.m_prot.map((f) => f.code), ['M7']);
  assert.deepEqual(r.flags.m_stay.map((f) => f.code), ['M7']);
});

test('XC3: the 39 projected ids leave the flag list; sourdough, sandwich_bread, potato_chips stay', () => {
  const out = run(CLEAN_J8_BASE); // J8 and J9 cleaned sourdough, sandwich_bread and potato_chips; XC3 reads the sweep before them.
  const GONE = `beef_cuts_basics label_lightly_sweetened pork_cuts_and_enhanced seafood_certifications label_third_party_seals label_artificial_color produce_brassicas produce_onions_garlic produce_apples_pears pick_frozen_peas pick_asparagus pick_corn pick_cilantro pick_parsley pick_basil pick_swiss_chard pick_mangoes pick_celery tortillas canned_tuna produce_mushrooms produce_bananas pick_microgreens bison venison_game clams_mussels_oysters bread_aisle kombucha maple_syrup jam coconut_water condiments tortilla_chips hummus fresh_pasta deli frozen pick_artificial_sweetener raw_aged_cheese`.split(' ');
  nonEmpty(GONE, 'gone ids', 39);
  for (const id of GONE) assert.ok(!out.flagged.includes(id), id);
  for (const id of ['sourdough', 'sandwich_bread', 'potato_chips']) assert.ok(out.flagged.includes(id), id);
  assert.ok(!out.byCode.M2.includes('nuts_raw_vs_roasted') || !out.flags.nuts_raw_vs_roasted.some((f) => f.code === 'M2' && f.detail.startsWith('short_answer')));
});
