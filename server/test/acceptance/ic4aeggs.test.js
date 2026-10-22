// IC-4a (eggs): five egg cards fold into egg_labels (docs/ITEM-CARDS-PLAN.md IC-4a). Written by the planner; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { scoreEntries, PERIMETER_SECTIONS } from '../../lib/perimeter.js';
import { inScope } from '../../lib/counterScope.js';
import { RETIRED, ESSENTIALS, projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { lintCard, readability, lintRepeatedClaim, OWNED_FACTS } from '../../lib/counterCardLint.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const PRE = JSON.parse(execFileSync('git', ['show', '663ca3d:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
// Completeness pass 2026-10-22 (DECISIONS-2026-10-22.md) swapped government/extension sources for holistic ones. A base
// source may be missing only if that pass dropped it (it sat on the card at 9845b9e); the card keeps >=1 source and
// nothing the pass added is government.
const CP = JSON.parse(execFileSync('git', ['show', '9845b9e:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const cpSources = (id) => (CP.entries.find((x) => x.id === id)?.sources || []).map((s) => JSON.stringify(s));
const GOV = /\.gov\b|\bextension\b|\b(USDA|FDA|FSIS|CDC|NIH|EPA)\b/i;
const passDropped = (id, s) => cpSources(id).includes(JSON.stringify(s));
const assertSwap = (id, e) => { const before = cpSources(id); for (const s of nonEmpty(e.sources || [], `${id} sources`, 1)) if (!before.includes(JSON.stringify(s))) assert.doesNotMatch(JSON.stringify(s), GOV, `${id} new source is government: ${JSON.stringify(s)}`); };
const pre = (id) => PRE.entries.find((e) => e.id === id);
const now = (id) => kb.entries.find((e) => e.id === id);
const admits = (top) => !!(top && top.score >= 2 && top.aliasScore > 0);
const TO = 'egg_labels';
const FOLDED = ['egg_shell_color', 'egg_freshness', 'egg_grades_sizes', 'egg_feed_claims', 'egg_storage'];
const SPOKEN = ['decision', 'why', 'short_answer', 'detail', 'kristy_take', 'tier_note', 'buying_tips', 'watch_out', 'look_for', 'pick_steps', 'science', 'labels_decoded'];
const spoken = (e) => JSON.stringify(SPOKEN.map((f) => e[f] ?? ''));
const RULE4 = /healthier|healthiest|better for you|chemically ripened|lowers|exposure/i;
const review = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));

test('C1 folded egg ids retired', () => {
  for (const id of FOLDED) {
    assert.ok(pre(id), `${id} missing from the pre-fold KB`);
    assert.ok(!now(id), `${id} still in the KB`);
    assert.ok(RETIRED.includes(id), `${id} not in RETIRED`);
    assert.equal(doLines[id], undefined, `${id} still in doLines.json`);
    assert.ok(!review.has(id), `${id} still a do-lines-review row`);
    for (const r of OWNED_FACTS) assert.ok(r.owner !== id && !r.family.includes(id), `${r.fact} still names ${id}`);
  }
});

test('C2 egg aliases and asks moved', () => {
  const s = now(TO);
  for (const id of FOLDED) {
    for (const a of nonEmpty(pre(id).aliases, `${id} aliases`, 1)) assert.ok(s.aliases.includes(a), `${id} alias "${a}" not on ${TO}`);
    for (const q of nonEmpty(pre(id).asked_as, `${id} asked_as`, 3)) assert.ok(s.asked_as.includes(q), `${id} ask "${q}" not on ${TO}`);
  }
});

test('C3 folded egg asks land on egg_labels', () => {
  for (const id of FOLDED) {
    for (const q of pre(id).asked_as) {
      assert.equal(inScope(q).ok, true, `"${q}" refused by the scope gate`);
      const top = scoreEntries(q, 3)[0];
      assert.ok(admits(top), `"${q}" not admitted`);
      assert.equal(top.entry.id, TO, `"${q}" -> ${top.entry.id}`);
    }
  }
});

test('C4 egg sources moved', () => {
  assertSwap(TO, now(TO));
  const have = new Set((now(TO).sources || []).map((s) => JSON.stringify(s)));
  for (const id of FOLDED) {
    for (const s of nonEmpty(pre(id).sources, `${id} sources`, 3)) assert.ok(have.has(JSON.stringify(s)) || passDropped(TO, s), `${id} source ${JSON.stringify(s)} not on ${TO}`);
  }
});

test('C5 egg facts on egg_labels', () => {
  const e = now(TO);
  const t = spoken(e);
  for (const s of [
    'Refrigerated eggs should not sit out more than two hours.',
    'Store-bought eggs do not need washing before use.',
    'US rules require washing and sanitizing, then holding at 45F or below from the plant onward.',
    'Open the carton and check for cracks and leaks before it goes in the cart.',
    'Eggs age far faster on the counter than in the fridge.',
  ]) assert.ok(t.includes(s), `safety/freshness sentence lost: ${s}`);
  for (const re of [/breed/i, /pack date/i, /sell-by/i, /\bAA\b/, /omega-3/i, /\b001\b/, /\b365\b/, /\b45\b/, /\b24\b/, /\b27\b/, /\b30\b/]) assert.match(t, re);
  const terms = (e.labels_decoded || []).map((l) => l.term);
  for (const id of FOLDED) for (const l of pre(id).labels_decoded || []) assert.ok(terms.includes(l.term), `label "${l.term}" from ${id} not moved`);
  assert.ok(terms.includes('Blue or green shell'), 'Araucana label missing');
  assert.equal(new Set(terms).size, terms.length, 'duplicate labels_decoded term');
  assert.doesNotMatch(JSON.stringify(e), /see Egg labels/);
});

test('C6 essentials and shortcuts intact', () => {
  assert.deepEqual([...ESSENTIALS], ['organic_worth_it_by_type', 'egg_labels', 'salmon_wild_vs_farmed', 'label_front_vs_back',
    'produce_ripeness_by_item', 'beef_grassfed_vs_grainfed', 'judging_meat_at_the_case', 'whole_vs_reduced_fat_milk']);
  for (const id of ESSENTIALS) assert.ok(now(id), `${id} missing`);
  for (const s of nonEmpty(PERIMETER_SECTIONS, 'sections', 6)) for (const sc of s.shortcuts || []) {
    assert.ok(!FOLDED.includes(sc.id), `${s.id} shortcut "${sc.q}" points at folded ${sc.id}`);
    assert.ok(now(sc.id), `${s.id} shortcut "${sc.q}" points at missing ${sc.id}`);
  }
  const ed = PERIMETER_SECTIONS.find((s) => s.id === 'eggs_dairy').shortcuts.map((sc) => sc.id);
  assert.equal(ed.length, 3);
  assert.equal(new Set(ed).size, 3, `eggs_dairy shortcut ids repeat: ${ed.join(', ')}`);
});

test('C7 egg_labels lint clean', () => {
  const e = now(TO);
  assert.deepEqual(lintCard(projectEntry(e, { doLine: doLines[TO] })), []);
  assert.deepEqual(readability(e), []);
  assert.deepEqual(lintRepeatedClaim(e), []);
  assert.doesNotMatch(spoken(e), RULE4, 'egg_labels trips claim-lock rule 4');
  assert.equal(OWNED_FACTS.length, 14);
  assert.ok(!OWNED_FACTS.some((r) => r.fact === 'hen_raising'), 'hen_raising row still present');
});
