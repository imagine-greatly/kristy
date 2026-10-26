// K14: produce & eggs build (cards and picks).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { readability, lintCard, lintPick } from '../../lib/counterCardLint.js';
import { projectEntry, parseReviewTable } from '../../lib/counterCards.js';
import { matchItemToCard, matchItemToPick } from '../../lib/listMatch.js';
import { scoreEntries } from '../../lib/perimeter.js';
import { WEAK_MATCH_CEILING } from '../../lib/counterGaps.js';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import pre from './fixtures/kb-pre-readability.json' with { type: 'json' };
import { beforeConcern, preCleanPick9, preCleanPick10 } from './twoLinePin.js';
import { preCleanJ1, preCleanJ3 } from './cartPlain.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const reviewed = parseReviewTable(readFileSync(join(ROOT, 'docs/do-lines-review.md'), 'utf8'));
const byId = (id) => kb.entries.find((e) => e.id === id);
const preById = (id) => (pre.entries ?? pre).find((e) => e.id === id);
const idOf = (m) => (m ? m.slug ?? m.id ?? m.entry?.id ?? null : null);
const rowMatch = (row) => idOf(matchItemToCard(row)) ?? idOf(matchItemToPick(row));
const top = (q) => { const r = scoreEntries(q, 3)[0]; return { id: r?.entry?.id ?? r?.id, score: r?.score ?? 0 }; };

const CARDS = nonEmpty(['produce_mushrooms', 'produce_green_beans', 'egg_duck_quail'], 'K14 cards', 3);
const PICKS = nonEmpty(['pick_winter_squash', 'pick_ginger_turmeric', 'pick_microgreens', 'pick_egg_whites'], 'K14 picks', 4);
const BARE = nonEmpty(Object.entries({
  'mushrooms': 'produce_mushrooms', 'shiitake': 'produce_mushrooms', 'cremini': 'produce_mushrooms',
  'green beans': 'produce_green_beans', 'string beans': 'produce_green_beans',
  'duck eggs': 'egg_duck_quail', 'quail eggs': 'egg_duck_quail',
  'winter squash': 'pick_winter_squash', 'butternut squash': 'pick_winter_squash',
  'acorn squash': 'pick_winter_squash', 'spaghetti squash': 'pick_winter_squash',
  // Compound rows ('Butternut or acorn squash', 'ginger and turmeric root') stay misses:
  // aliasCoversRow needs one alias to cover every word, and lintPick caps pick aliases at 3.
  'ginger': 'pick_ginger_turmeric', 'turmeric': 'pick_ginger_turmeric',
  'ginger root': 'pick_ginger_turmeric',
  'microgreens': 'pick_microgreens',
  'egg whites': 'pick_egg_whites', 'carton egg whites': 'pick_egg_whites',
}), 'K14 bare rows', 17);
const KEEPS = nonEmpty([
  ['beans', 'beans_dried_vs_canned'], ['black beans', 'beans_dried_vs_canned'],
  ['canned green beans', ['beans_dried_vs_canned', null]], ['coffee beans', 'coffee_beans'],
  ['green bean casserole', null], ['frozen green beans', 'pick_frozen_green_beans'], ['Frozen broccoli or green beans', null],
  ['zucchini', 'pick_zucchini'], ['summer squash', 'pick_zucchini'], ['yellow squash', 'pick_zucchini'],
  ['squash', null], ['butternut squash soup', null],
  ['ginger ale', null], ['ginger snaps', null], ['ginger beer', null], ['gingerbread', null],
  ['ground ginger', null], ['pickled ginger', null], ['crystallized ginger', null],
  ['ground turmeric', null], ['turmeric powder', null],
  ['mushroom soup', null], ['cream of mushroom soup', null], ['dried mushrooms', null],
  ['canned mushrooms', null], ['mushroom coffee', null], ['oyster sauce', null],
  ['duck', null], ['quail', null],
  ['eggs', 'egg_labels'], ['brown eggs', 'egg_labels'], ['white eggs', 'egg_labels'],
  ['egg', null], ['egg noodles', null], ['egg salad', 'deli_salads'], ['egg white protein powder', null],
  ['pineapple', 'produce_tropical_fruit'], ['cantaloupe', 'produce_ripeness_by_item'],
  ['pineapple juice', null], ['canned pineapple', null], ['dried pineapple', null],
  ['sprouts', 'sprouts_raw'], ['broccoli sprouts', 'sprouts_raw'], ['alfalfa sprouts', 'sprouts_raw'],
], 'K14 collision rows', 40);
const FORBIDDEN = ['squash', 'duck', 'quail', 'egg', 'eggs', 'bean', 'beans', 'white', 'whites', 'oyster', 'root'];

for (const [row, id] of BARE) test(`C1 "${row}" matches ${id}`, () => assert.equal(rowMatch(row), id));

for (const id of CARDS) test(`C2 ${id}: every asked_as tops the ask door`, () => {
  for (const q of nonEmpty(byId(id)?.asked_as ?? [], `${id} asked_as`, 3)) assert.equal(top(q).id, id, q);
});

for (const [row, want] of KEEPS) test(`C3 "${row}" keeps its prior match`, () => {
  const got = rowMatch(row);
  assert.ok((Array.isArray(want) ? want : [want]).includes(got), `${row} -> ${got}`);
});

for (const q of ['how do i pick a good cantaloupe', 'how do i pick a good pineapple']) test(`C4 "${q}" is a strong match`, () => {
  const t = top(q);
  assert.equal(t.id, 'produce_ripeness_by_item');
  assert.ok(t.score > WEAK_MATCH_CEILING, `score ${t.score}`);
});

test('C5 every cited URL hits line 1 of a docs/sources/k14 or item-cards file', () => {
  // item-cards (IC-3b) re-sourced k14 produce fronts; its archive counts too.
  const lines = nonEmpty(['k14', 'item-cards'].flatMap((d) => { const dir = join(ROOT, 'docs/sources', d); return readdirSync(dir, { withFileTypes: true }).filter((f) => f.isFile()).map((f) => readFileSync(join(dir, f.name), 'utf8').split('\n')[0]); }), 'k14 archive', 1);
  // Completeness pass 2026-10-22 (DECISIONS-2026-10-22.md): government/extension sources were swapped for holistic
  // ones archived under archive/completeness/<section>/ (URL verbatim on line 1); some are cited by name only. A card keeps
  // >=1 source, every cited URL still sits on a line 1, and no name-only source is government.
  const CA = join(ROOT, 'archive/completeness');
  for (const d of readdirSync(CA)) for (const x of readdirSync(join(CA, d)).filter((y) => y.endsWith('.md'))) lines.push(readFileSync(join(CA, d, x), 'utf8').split('\n')[0]);
  for (const id of CARDS) assert.ok((beforeConcern(byId(id))?.sources ?? []).length >= 1, `${id} has no source`);
  // clean-pick-9 and clean-sweep-J1 archived their new URLs under docs/sources/concerns; read their ids as of 96d61e2 / 52b0a8c.
  const cited = [...CARDS, ...PICKS].flatMap((id) => (beforeConcern(preCleanPick9(preCleanPick10(preCleanJ1(preCleanJ3(byId(id))))))?.sources ?? []).map((s) => (typeof s === 'string' ? s : s.url)));
  const legacy = new Set(JSON.parse(execSync('git show 9845b9e:server/kristy_perimeter_kb.json', { cwd: ROOT, maxBuffer: 64 << 20 }).toString()).entries.flatMap((e) => e.sources ?? []).filter((s) => typeof s === 'string')); // pre-pass KB, 9845b9e
  for (const s of cited) if (s && !/^https?:/.test(s) && !legacy.has(s)) assert.doesNotMatch(s, /\.gov\b|\bextension\b|\b(USDA|FDA|FSIS|CDC|NIH|EPA)\b/i, `name-only source is government: ${s}`);
  const urls = nonEmpty(cited, 'K14 URLs', 10).filter((u) => /^https?:/.test(u ?? ''));
  for (const u of urls) assert.ok(lines.some((l) => l.includes(u)), `${u} not on line 1 of any k14 source`);
});

for (const id of [...CARDS, 'produce_ripeness_by_item', 'produce_seasonality']) test(`C6 ${id}: readable and lint-clean`, () => {
  const card = byId(id);
  assert.ok(card, `${id} missing`);
  const doLine = reviewed.get(id)?.do || '';
  if (CARDS.includes(id)) assert.ok(doLine, `${id} has no reviewed do line`);
  assert.deepEqual(readability(card), []);
  assert.deepEqual(lintCard(projectEntry(card, { doLine })), []);
});

for (const id of PICKS) test(`C7 ${id}: pick lint-clean`, () => {
  const p = byId(id);
  assert.ok(p && p.kind === 'pick', `${id} missing or not a pick`);
  assert.deepEqual(lintPick(p), []);
});

test('C8 squash aliases left produce_seasonality; the season ask still lands there', () => {
  const al = byId('produce_seasonality').aliases;
  for (const a of ['butternut squash', 'acorn squash', 'winter squash']) assert.ok(!al.includes(a), a);
  assert.equal(top('is butternut squash in season').id, 'produce_seasonality');
});

test('C9 one entry per id, no forbidden or state alias, no forbidden bare-noun ask', () => {
  for (const id of [...CARDS, ...PICKS]) {
    assert.equal(kb.entries.filter((e) => e.id === id).length, 1, `${id} count`);
    const e = byId(id);
    for (const a of e.aliases) {
      assert.ok(!FORBIDDEN.includes(a), `${id} alias ${a}`);
      assert.ok(!/\b(fresh|frozen|canned|dried)\b/.test(a), `${id} state alias ${a}`);
    }
    for (const q of e.asked_as ?? []) assert.ok(!FORBIDDEN.some((w) => q === `which ${w} should i buy`), `${id} ask ${q}`);
  }
});

test('C10 passRule fixture carries the coverage alias moves for exactly the two edited ids (ripeness hub may gain, IC-3a)', () => {
  for (const id of ['produce_seasonality', 'produce_ripeness_by_item']) {
    const was = preById(id);
    assert.ok(was, `${id} missing from fixture`);
    if (id === 'produce_ripeness_by_item') {
      // IC-3a folded the origin card in: the hub may gain, never lose.
      // Gap pass (2026-10-23) moved five bare nouns to their own cards: each left the hub and landed on its owner.
      const moved = { tomatoes: 'produce_tomatoes', tomato: 'produce_tomatoes', avocado: 'produce_avocados', avocados: 'produce_avocados', melon: 'produce_melons', watermelon: 'produce_melons', pineapple: 'produce_tropical_fruit' };
      for (const a of was.aliases) {
        if (moved[a]) assert.ok(!byId(id).aliases.includes(a) && byId(moved[a]).aliases.includes(a), `${a} did not move to ${moved[a]}`);
        else assert.ok(byId(id).aliases.includes(a), `${id} lost alias "${a}"`);
      }
      const movedAsk = { 'how do i pick a good avocado': 'produce_avocados' };
      for (const q of was.asked_as) {
        if (movedAsk[q]) assert.ok(!byId(id).asked_as.includes(q) && byId(movedAsk[q]).asked_as.includes(q), `ask "${q}" did not move`);
        else assert.ok(byId(id).asked_as.includes(q), `${id} lost ask "${q}"`);
      }
    } else {
      assert.deepEqual(was.aliases, byId(id).aliases, `${id} aliases`);
      assert.deepEqual(was.asked_as, byId(id).asked_as, `${id} asked_as`);
    }
  }
  for (const a of ['butternut squash', 'acorn squash', 'winter squash']) assert.ok(!preById('produce_seasonality').aliases.includes(a), a);
  for (const a of ['good cantaloupe', 'good pineapple']) assert.ok(preById('produce_ripeness_by_item').aliases.includes(a), a);
});

test('C11 the fixture differs from 3f34250 in exactly the three coverage fields', () => {
  const f = 'test/acceptance/fixtures/kb-pre-readability.json';
  const cwd = join(ROOT, 'server');
  const a = JSON.parse(execSync(`git show 3f34250:server/${f}`, { cwd, maxBuffer: 64 << 20 }).toString());
  const A = nonEmpty(a.entries ?? a, 'fixture at 3f34250', 1);
  const B = pre.entries ?? pre;
  const d = [];
  if (A.length !== B.length) d.push('length');
  for (const o of A) {
    const n = B.find((e) => e.id === o.id) ?? {};
    for (const k of new Set([...Object.keys(o), ...Object.keys(n)])) if (JSON.stringify(o[k]) !== JSON.stringify(n[k])) d.push(`${o.id}.${k}`);
  }
  // K3-1: salmon_wild_vs_farmed.aliases (salmon cuts) and farmed_fish_by_species.aliases (smoked shellfish) mirror the KB.
  assert.deepEqual([...d].sort(), ['produce_seasonality.aliases', 'produce_ripeness_by_item.aliases', 'produce_ripeness_by_item.asked_as', 'salmon_wild_vs_farmed.aliases', 'farmed_fish_by_species.aliases'].sort());
});

test('C12 passRule.js and k5–k11 stay at 719f9fe except the exact W2 and concern overlays', () => {
  const out = execSync(
    "git diff 719f9fe --stat -- server/test/acceptance/passRule.js",
    { cwd: ROOT },
  ).toString();
  assert.equal(out, '');
  // Completeness pass 2026-10-22: k9 swaps "sources never shrink" for >=1 source and no new government source, exactly.
  const oldK9 = execSync('git show 719f9fe:server/test/acceptance/k9.test.js', { cwd: ROOT }).toString();
  assert.equal(readFileSync(join(ROOT, 'server/test/acceptance/k9.test.js'), 'utf8'), oldK9
    .replace("import { assertPassRule } from './passRule.js';\n", "import { assertPassRule } from './passRule.js';\nimport { execFileSync } from 'node:child_process';\n")
    .replace('const oldEntries = pre.entries ?? pre;\n', [
      'const oldEntries = pre.entries ?? pre;',
      '// Completeness pass 2026-10-22 (DECISIONS-2026-10-22.md) swapped government/extension sources for holistic ones, so the',
      '// pass rule\'s "sources never shrink" yields to: at least one source, and nothing the pass added is government.',
      "const cp = JSON.parse(execFileSync('git', ['show', '9845b9e:server/kristy_perimeter_kb.json'], { cwd: join(HERE, '../../..'), maxBuffer: 64 << 20 }).toString());",
      "const srcKey = (s) => (typeof s === 'string' ? s : `${s.name ?? ''} ${s.url ?? ''}`);",
      'const GOV = /\\.gov\\b|\\bextension\\b|\\b(USDA|FDA|FSIS|CDC|NIH|EPA)\\b/i;',
      '',
    ].join('\n'))
    .replace('    assertPassRule(t, old, now);', [
      "    const before = new Set((cp.entries.find((e) => e.id === id)?.sources || []).map(srcKey));",
      "    for (const s of nonEmpty(now.sources || [], `${id} sources`, 1).map(srcKey)) if (!before.has(s)) assert.doesNotMatch(s, GOV, `${id} new source is government: ${s}`);",
      '    assertPassRule(t, { ...old, sources: now.sources }, now);',
    ].join('\n')));
  // Completeness pass (9845b9e): frozen-field pins read the pre-completeness copy via preCompleteness; rule checks stay live.
  const PA = "import { assertPassRule } from './passRule.js';\n";
  const COMPLETENESS_STEP = {
    k5: [[PA, PA + "import { preCompleteness } from './cartPlain.js';\n"], ['preCleanPick2(preT6_4(now)));', 'preCleanPick2(preT6_4(preCompleteness(now))));']],
    k6: [["import { beforeConcern, preTidy, preT6_1 } from './twoLinePin.js';\n", "import { beforeConcern, preTidy, preT6_1 } from './twoLinePin.js';\nimport { preCompleteness } from './cartPlain.js';\nconst pinned = kb.entries.map(preCompleteness).map(preTidy);\n// Completeness pass rewrote these cards at 9845b9e; the pass rule reads the pre-completeness copy, rule checks stay on kb.entries.\n"],
      ['beforeConcern(preT6_1(now))', 'beforeConcern(preT6_1(pinned.find((e) => e.id === id)))']],
    k7: [["import { preT6_2 } from './twoLinePin.js';\n", "import { preT6_2 } from './twoLinePin.js';\nimport { preCompleteness } from './cartPlain.js';\nconst live = kb.entries;\n"],
      ['kb.entries = kb.entries.map(preTidy);\n', 'kb.entries = kb.entries.map(preTidy);\n// Completeness pass rewrote these cards at 9845b9e; the pass rule reads the pre-completeness copy, rule checks stay on kb.entries.\nconst pinned = live.map(preCompleteness).map(preT6_2).map(preTidy);\n'],
      ['assertPassRule(t, old, beforeConcern(now));', 'assertPassRule(t, old, beforeConcern(pinned.find((e) => e.id === id)));']],
    k8: [[PA, PA + "import { preCompleteness } from './cartPlain.js';\n"], ['assertPassRule(t, old, beforeConcern(now));', 'assertPassRule(t, old, beforeConcern(preCompleteness(now)));']],
    k10: [[PA, PA + "import { preCompleteness } from './cartPlain.js';\n"], ['beforeConcern(preCleanPick8(preT6_3(now)))', 'beforeConcern(preCleanPick8(preT6_3(preCompleteness(now))))']],
    k11: [["import { preCleanJ9 } from './cartPlain.js';\n", "import { preCleanJ9, preCompleteness } from './cartPlain.js';\nconst live = kb.entries;\n"],
      ['kb.entries = kb.entries.map(preTidy);\n', 'kb.entries = kb.entries.map(preTidy);\n// Completeness pass rewrote these cards at 9845b9e; the pass rule reads the pre-completeness copy, rule checks stay on kb.entries.\nconst pinned = live.map(preCompleteness).map(preCleanJ9).map(preT6_4).map(preTidy);\n'],
      ['beforeConcern(preCleanPick9(now))', 'beforeConcern(preCleanPick9(pinned.find((e) => e.id === id)))']],
  };
  const cpStep = (file, t) => COMPLETENESS_STEP[file].reduce((acc, [a, b]) => { assert.ok(acc.includes(a), `${file}: completeness step anchor missing: ${a}`); return acc.replace(a, b); }, t);
  // Concern batches may only read the frozen-field check through beforeConcern;
  // k5 reads it through preCleanPick2 (clean-pick-2 organic produce carts, 2026-10-20).
  for (const file of ['k6', 'k7', 'k8', 'k10', 'k11']) {
    const old = execSync(`git show 719f9fe:server/test/acceptance/${file}.test.js`, { cwd: ROOT }).toString();
    const concern = old
      .replace("import { assertPassRule } from './passRule.js';",
        ['k6', 'k7', 'k11'].includes(file)
          ? "import { assertPassRule } from './passRule.js';\nimport { beforeConcern, preTidy } from './twoLinePin.js';\nkb.entries = kb.entries.map(preTidy);"
          : "import { assertPassRule } from './passRule.js';\nimport { beforeConcern } from './twoLinePin.js';")
      .replace('    assertPassRule(t, old, now);', '    assertPassRule(t, old, beforeConcern(now));');
    // clean-pick-9 (2026-10-20): k11 reads label_organic_scope's frozen fields as of 96d61e2.
    // clean-pick-8 (2026-10-20): k10 reads oats' cart_pick and coffee's sources as of 125244d.
    const cp8 = (t) => t
      .replace("import { beforeConcern } from './twoLinePin.js';", "import { beforeConcern, preCleanPick8 } from './twoLinePin.js';")
      .replace('    assertPassRule(t, old, beforeConcern(now));',
        "    // clean-pick-8 moved oats' cart_pick and coffee's sources; the pass rule reads them as of 125244d.\n    assertPassRule(t, old, beforeConcern(preCleanPick8(now)));");
    // t6-1 (2026-10-20): k6 reads the 15 meat/seafood cards' frozen fields as of 85c399e.
    const t61 = (t) => t
      .replace("import { beforeConcern, preTidy } from './twoLinePin.js';", "import { beforeConcern, preTidy, preT6_1 } from './twoLinePin.js';")
      .replace('    assertPassRule(t, old, beforeConcern(now));',
        "    // t6-1 appended evidence sources to farmed_fish_by_species and seafood_certifications; the pass rule reads them as of 85c399e.\n    assertPassRule(t, old, beforeConcern(preT6_1(now)));");
    // t6-2: k7 keeps its dairy source pins at ca32bef through the exact overlay.
    const t62 = (t) => t.replace(
      "import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };",
      "import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };\nimport { preT6_2 } from './twoLinePin.js';\nkb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.");
    // t6-3: k10 reads the pantry source pins at 6d6ca49; its live lint checks stay.
    const t63 = (t) => t
      .replace('import { beforeConcern, preCleanPick8 }', 'import { beforeConcern, preCleanPick8, preT6_3 }')
      .replace('beforeConcern(preCleanPick8(now))', 'beforeConcern(preCleanPick8(preT6_3(now)))');
    const expected = file === 'k6' ? t61(concern) : file === 'k7' ? t62(concern) : file === 'k10' ? t63(cp8(concern)) : file !== 'k11' ? concern : concern
      .replace("import { beforeConcern, preTidy } from './twoLinePin.js';", "import { beforeConcern, preTidy, preCleanPick9 } from './twoLinePin.js';")
      .replace('    assertPassRule(t, old, beforeConcern(now));',
        "    // clean-pick-9 moved label_organic_scope's frozen fields; the pass rule reads it as of 96d61e2.\n    assertPassRule(t, old, beforeConcern(preCleanPick9(now)));");
    // t6-4: k11 must restore its six cards before preTidy, preserving overlay order.
    const t64 = (t) => t.replace(
      "import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };",
      "import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };\nimport { preT6_4 } from './twoLinePin.js';\nkb.entries = kb.entries.map(preT6_4); // t6-4: restore produce/label pins before the older tidy overlay.");
    // J9 pins the rBST label's added source at 53c6f90, before K11's older T6 overlay.
    const j9 = (t) => t.replace(
      "import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };",
      "import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };\nimport { preCleanJ9 } from './cartPlain.js';\nkb.entries = kb.entries.map(preCleanJ9); // J9 label pins read 53c6f90 before the older T6 overlay.");
    assert.equal(readFileSync(join(ROOT, `server/test/acceptance/${file}.test.js`), 'utf8'), cpStep(file, file === 'k11' ? j9(t64(expected)) : expected));
  }
  const oldK5 = execSync('git show 719f9fe:server/test/acceptance/k5.test.js', { cwd: ROOT }).toString();
  const w2 = [
    '    // W2 retires uncovered grocery nouns from the organic hub and moves bare lettuce',
    '    // from home technique to its buying family. w2.test.js pins both outcomes.',
    "    const retiredAliases = id === 'organic_worth_it_by_type' ? ['grapes', 'kiwi', 'kiwis']",
    "      : id === 'revive_greens' ? ['lettuce'] : [];",
    '    assertPassRule(t, { ...old, aliases: old.aliases.filter((a) => !retiredAliases.includes(a)) }, preCleanPick2(now));',
  ].join('\n');
  assert.equal(readFileSync(join(ROOT, 'server/test/acceptance/k5.test.js'), 'utf8'),
    cpStep('k5', oldK5
      .replace("import { assertPassRule } from './passRule.js';", "import { assertPassRule } from './passRule.js';\nimport { preCleanPick2 } from './twoLinePin.js';")
      .replace('    assertPassRule(t, old, now);', w2)
      // t6-4: washing_produce source pins; the live readability/lint checks stay.
      .replace('{ preCleanPick2 }', '{ preCleanPick2, preT6_4 }')
      .replace('preCleanPick2(now));', 'preCleanPick2(preT6_4(now)));')));
});
