// SR: section rules carry one holistic principle per aisle (docs/CLEAN-PICK-PLAN.md, "SR", SR-C1..C7).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { nonEmpty } from '../../lib/testGuards.js';
import { lintSections } from '../../lib/counterCardLint.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const BASE = '951441c';
const show = (path) => execFileSync('git', ['show', `${BASE}:${path}`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const rows = nonEmpty(JSON.parse(readFileSync(join(SERVER, 'lib', 'sectionRules.json'), 'utf8')), 'section rules', 6);
const base = nonEmpty(JSON.parse(show('server/lib/sectionRules.json')), 'base section rules', 6);
const row = (s) => rows.find((r) => r.section === s);
const baseRow = (s) => base.find((r) => r.section === s);

const PRODUCE_RULE = 'Local and in season first; organic is the floor, not the goal.';
// Drafted "the grower's word, not a seal": the straight quote fails the section quote ban and
// "seal" fires SECTION_TIP_HANDLING; "Look for grown without sprays" repeated two produce cards (L1).
const PRODUCE_CHECK = 'Reach for grown without sprays: the word of the grower, not a certification.';
const PRODUCE_SOURCES = ['produce_seasonality', 'organic_worth_it_by_type'];
const EGGS_CHECK = 'Read what the hens ate first: soy-free and corn-free, then pasture.';
const FROZEN_CHECK = 'Organic frozen counts as a close second when the season is over.';
// The only fields SR may move: section -> { field: value } (checks.N is one array slot).
const CHANGED = {
  produce: { rule: PRODUCE_RULE, 'checks.1': PRODUCE_CHECK, sources: PRODUCE_SOURCES },
  eggs_dairy: { 'checks.0': EGGS_CHECK },
  frozen: { 'checks.1': FROZEN_CHECK },
};
const UNCHANGED = ['meat', 'seafood', 'bulk_pantry'];
const textOf = (r) => [r.rule, ...(r.checks ?? []), ...(r.beyond ? [r.beyond] : [])];

// Every string (rule, checks, beyond) that differs from the base ref, with its section.
const changedStrings = nonEmpty(rows.flatMap((r) => {
  const was = new Set(textOf(baseRow(r.section) ?? {}).filter(Boolean));
  return textOf(r).filter((s) => !was.has(s)).map((s) => ({ section: r.section, s }));
}), 'SR changed strings', 4);
const sentences = (s) => s.split(/(?<=[.;:!?])\s+/);

test('SR-C1 produce rule is the drafted string, organic only as the floor', () => {
  const rule = row('produce').rule;
  assert.equal(rule, PRODUCE_RULE);
  assert.doesNotMatch(rule, /^organic/i);
  assert.match(rule, /organic is the floor/);
  assert.doesNotMatch(rule.replace(/organic is the floor/g, ''), /organic/i);
});

test('SR-C2 no row carries handling trivia', () => {
  for (const r of rows) for (const s of nonEmpty(textOf(r), `${r.section} strings`)) {
    assert.doesNotMatch(s, /(turn .* over|bottom tells|frozen solid|clumped)/i, `${r.section}: ${s}`);
  }
});

test('SR-C3 eggs_dairy reads feed first; its rule is the base rule', () => {
  assert.equal(row('eggs_dairy').checks[0], EGGS_CHECK);
  assert.equal(row('eggs_dairy').rule, baseRow('eggs_dairy').rule);
});

test('SR-C4 untouched rows equal the base ref; touched rows move only the drafted fields', () => {
  assert.deepEqual(rows.map((r) => r.section), base.map((r) => r.section));
  for (const s of UNCHANGED) assert.deepEqual(row(s), baseRow(s), s);
  for (const [s, fields] of Object.entries(CHANGED)) {
    const now = row(s);
    const was = baseRow(s);
    assert.deepEqual(Object.keys(now).sort(), Object.keys(was).sort(), `${s} keys`);
    for (const key of Object.keys(now)) {
      if (key === 'checks') {
        assert.equal(now.checks.length, was.checks.length, `${s} checks length`);
        now.checks.forEach((c, i) => {
          const draft = fields[`checks.${i}`];
          if (draft === undefined) assert.equal(c, was.checks[i], `${s} checks[${i}] moved`);
          else { assert.equal(c, draft, `${s} checks[${i}]`); assert.notEqual(c, was.checks[i], `${s} checks[${i}] unchanged`); }
        });
      } else if (key in fields) {
        assert.deepEqual(now[key], fields[key], `${s}.${key}`);
        assert.notDeepEqual(now[key], was[key], `${s}.${key} unchanged`);
      } else assert.deepEqual(now[key], was[key], `${s}.${key} moved`);
    }
  }
});

test('SR-C5 changed strings: ask only at a counter, no banned word, no seed oil, no brand', () => {
  const C4 = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
  const C4B = /\b(poison|chemicals?|spray-free)\b/i;
  const OIL = /\b(avocado|canola|soybean|sunflower|safflower|corn|cottonseed|grapeseed|rice bran|vegetable|seed) oils?\b/i;
  const NEG = /\b(skip|avoid|instead of|never|not|no)\b/i;
  for (const { section, s } of changedStrings) {
    for (const sent of sentences(s)) {
      if (/\bask\b/i.test(sent)) {
        assert.ok(['meat', 'seafood'].includes(section) || /\b(counter|butcher|farm|market)\b/i.test(sent), `${section} ask: ${sent}`);
      }
      if (OIL.test(sent)) assert.match(sent, NEG, `${section} C20: ${sent}`);
    }
    assert.doesNotMatch(s, C4, `${section} C4: ${s}`);
    assert.doesNotMatch(s, C4B, `${section} C4b: ${s}`);
    // A brand is a proper noun; these lines carry a capital only on their first word.
    assert.doesNotMatch(s.slice(1), /[A-Z]/, `${section} capital past the first letter (brand?): ${s}`);
  }
});

test('SR-C6 changed rows cite cards that exist; section lints and flags hold', () => {
  const have = new Set(nonEmpty(kb.entries, 'KB entries').map((e) => e.id));
  for (const s of Object.keys(CHANGED)) {
    for (const id of nonEmpty(row(s).sources, `${s} sources`)) assert.ok(have.has(id), `${s} source ${id} missing`);
    assert.equal(row(s).tip_aligned, baseRow(s).tip_aligned, `${s} tip_aligned`);
    assert.equal(row(s).cards_aligned, baseRow(s).cards_aligned, `${s} cards_aligned`);
  }
  assert.ok(rows.some((r) => r.cards_aligned === true), 'no section has cards_aligned; the lint would be vacuous');
  assert.deepEqual(lintSections(rows, kb.entries), []);
});

test('SR-C7 the old pins read the base ref and kept every assertion', () => {
  const PINS = {
    'server/test/acceptance/w2.test.js': ['Organic on anything you eat the skin of.'],
    'server/test/acceptance/ca-5.test.js': ['Organic on anything you eat the skin of.', 'Turn berry boxes over; the bottom tells the truth.',
      'Read how the hens lived before anything else.', 'Pick bags frozen solid, not clumped.', "produce: ['produce_ripeness_by_item']"],
    'server/test/acceptance/ic3a.test.js': ["sources, ['produce_ripeness_by_item']"],
  };
  const asserts = (src) => (src.match(/\bassert\.\w+\(/g) ?? []).length;
  for (const [file, olds] of Object.entries(PINS)) {
    const now = readFileSync(join(ROOT, file), 'utf8');
    assert.ok(now.includes(`'show', '${BASE}:server/lib/sectionRules.json'`), `${file} does not read the base ref`);
    for (const old of nonEmpty(olds, `${file} pinned strings`)) assert.ok(now.includes(old), `${file} lost the pin ${old}`);
    assert.ok(asserts(now) >= asserts(show(file)), `${file} has fewer assertions than at ${BASE}`);
  }
});
