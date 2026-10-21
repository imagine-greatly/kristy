// stance sweep P1 (.pipeline/plans/clean-pick-final-sweep.md): SW-C1..SW-C4 for server/scripts/stanceSweep.js. Report-only script.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { sweep, run } from '../../scripts/stanceSweep.js';

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
  f_m10: 'M10', f_m11: 'M11', egg_labels: 'M12', f_m13a: 'M13', f_m13b: 'M13', f_m13c: 'M13', f_clean: null };

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
  assert.deepEqual(r.frozen.sort(), ['f_clean', 'f_m8']);
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
