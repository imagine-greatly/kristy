// IC-4a (chicken): air_chilled_chicken and no_antibiotics_poultry fold into chicken_cuts_basics (docs/ITEM-CARDS-PLAN.md IC-4a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries, typeContradicts, PERIMETER_SECTIONS } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { attachCards } from '../../lib/listMatch.js';
import { RETIRED, projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim, OWNED_FACTS } from '../../lib/counterCardLint.js';
import { TRY_POOL } from '../../lib/tryPool.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '8a30d3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const listRow = (name) => attachCards({ items: [{ name, source: 'user' }] }, { log: false }).items[0];
const TO = 'chicken_cuts_basics';
// clean-pick-1 (2026-10-20) moved this card on; the fold's checks read it as of ede90e7.
const CP1 = JSON.parse(execFileSync('git', ['show', 'ede90e7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
kb.entries = kb.entries.map((e) => (e.id === TO ? CP1.entries.find((x) => x.id === TO) : e));
const FOLDED = ['air_chilled_chicken', 'no_antibiotics_poultry'];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded chicken ids retired', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from the pre-fold KB`);
    assert.ok(!now(id), `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still in doLines.json`);
    assert.ok(!review.has(id), `${id} still a do-lines-review row`);
    assert.ok(!TRY_POOL.includes(id), `${id} still in TRY_POOL`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${r.fact} still names ${id}`);
    for (const s of nonEmpty(PERIMETER_SECTIONS, 'sections', 6)) for (const sc of s.shortcuts || []) assert.notEqual(sc.id, id, `${s.id} shortcut points at ${id}`);
  }
  assert.ok(now('chicken_breast'), 'chicken_breast must stay its own card (type veto)');
  assert.ok(!RETIRED.includes('chicken_breast'), 'chicken_breast must not be retired');
});

test('C2 chicken aliases and asks moved', () => {
  const s = now(TO);
  for (const id of FOLDED) {
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(s.aliases.includes(a), `${id} alias "${a}" not on ${TO}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(s.asked_as.includes(q), `${id} ask "${q}" not on ${TO}`);
  }
});

test('C3 chicken rows land where they did', () => {
  for (const id of FOLDED) {
    for (const q of pre(id).asked_as) {
      assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
      const top = scoreEntries(q, 3)[0];
      assert.ok(admits(top), `"${q}" not admitted`);
      assert.equal(top.entry.id, TO, `"${q}" -> ${top.entry.id}`);
    }
  }
  for (const q of ['whole chicken', 'chicken thighs', 'air chilled chicken']) {
    assert.equal(scoreEntries(q, 3)[0]?.entry.id, TO, `counter "${q}"`);
  }
  for (const name of ['whole chicken', 'chicken thighs', 'chicken']) {
    assert.equal(listRow(name).cardSlug, TO, `list "${name}"`);
  }
  assert.equal(scoreEntries('chicken breast', 3)[0]?.entry.id, 'chicken_breast', 'counter "chicken breast"');
  assert.equal(listRow('chicken breast').cardSlug, 'chicken_breast', 'list "chicken breast"');
  assert.equal(typeContradicts('chicken breast', now(TO)), true, 'breast must stay vetoed off the thighs card');
  assert.equal(typeContradicts('whole chicken', now(TO)), false, 'whole chicken must be covered by the cart_pick');
});

test('C4 chicken sources moved', () => {
  const have = new Set((now(TO).sources || []).map((s) => JSON.stringify(s)));
  for (const id of FOLDED) {
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 2)) assert.ok(have.has(JSON.stringify(s)), `${id} source ${JSON.stringify(s)} not on ${TO}`);
  }
});

test('C5 chicken facts on chicken_cuts_basics', () => {
  const e = now(TO);
  const t = spoken(e);
  for (const s of [
    '‘Air-chilled’ is printed on the package when it applies.',
    'Water-chilled packages disclose ‘retained water up to’ a percentage.',
    'No ‘retained water’ line on the label means none is allowed inside.',
    'Safe handling matters far more than the chilling method.',
    'The agency does not inspect the farm, so oversight is weak.',
    '‘Natural’ says nothing about antibiotics.',
    '‘No hormones’ on chicken is an empty claim.',
    'Organic is the seal that carries the antibiotic rule: organic feed only, no antibiotics.',
    'All chicken is required to be residue-free at sale, labeled or not.',
  ]) assert.ok(t.includes(s), `moved sentence missing: ${s}`);
  const terms = (e.labels_decoded || []).map((l) => l.term);
  for (const id of FOLDED) for (const l of pre(id).labels_decoded || []) assert.ok(terms.includes(l.term), `label "${l.term}" from ${id} not moved`);
  assert.equal(new Set(terms).size, terms.length, 'duplicate labels_decoded term');
  assert.ok(e.pick_steps.length >= 1 && e.pick_steps.length <= 3, `pick_steps has ${e.pick_steps.length}`);
  assert.ok(e.pick_steps.includes('Look for ‘air-chilled’ printed on the package; it appears when it applies.'), 'air-chilled step missing');
  assert.equal(e.cart_pick, 'Air-chilled whole chicken or bone-in thighs');
  assert.doesNotMatch(JSON.stringify(e), /see Air-chilled chicken/);
});

test('C6 owned facts and try pool', () => {
  assert.equal(OWNED_FACTS.length, 14);
  const chill = OWNED_FACTS.find((r) => r.fact === 'chill_water');
  assert.equal(chill.owner, TO);
  assert.equal(chill.ownerTitle, now(TO).title);
  assert.ok(!chill.family.includes(TO), 'owner listed in its own family');
  for (const id of nonEmpty(chill.family, 'chill_water family', 1)) assert.ok(now(id), `family id missing: ${id}`);
  assert.deepEqual(OWNED_FACTS.find((r) => r.fact === 'bird_pig_raising').family, ['chicken_cuts_basics', 'pork_cuts_and_enhanced']);
  assert.equal(TRY_POOL.length, 19);
  assert.equal(TRY_POOL[4], TO);
  assert.ok(doLines[TO], `${TO} has no do line`);
});

test('C7 chicken_cuts_basics lint clean', () => {
  const chill = OWNED_FACTS.find((r) => r.fact === 'chill_water');
  for (const id of [TO, ...chill.family]) {
    const e = now(id);
    assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[id] })), [], `${id} lintCard`);
    assert.deepEqual(readability(e), [], `${id} readability`);
    assert.deepEqual(lintRepeatedClaim(e), [], `${id} repeated claim`);
  }
  assert.doesNotMatch(spoken(now(TO)), RULE4, `${TO} trips claim-lock rule 4`);
});
