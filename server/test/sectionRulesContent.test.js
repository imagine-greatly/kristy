// Shop-mode section rules: one card per section, true for every item in it, traced to the KB.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nonEmpty } from '../lib/testGuards.js';
import rules from '../lib/sectionRules.json' with { type: 'json' };
import kb from '../kristy_perimeter_kb.json' with { type: 'json' };

const ALLOWED = ['produce', 'meat', 'seafood', 'eggs_dairy', 'bulk_pantry', 'frozen'];
const KB_IDS = new Set(kb.entries.map((e) => e.id));
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const FIRST_PERSON = /\b(i|me|my|we|our|us)\b/i;
const PRICE = /\$|\b(price|prices|priced|cost|costs|cheap|cheaper|cheapest|expensive|spend|spending|budget|dollars?|save|savings|deal)\b/i;
const BANNED = /\b(treat\w*|prevent\w*|risk\w*|cure\w*|heal\w*|detox\w*)\b/i;

test('section rules: shape', () => {
  nonEmpty(rules, 'sectionRules');
  assert.ok(rules.length >= 5, `want at least 5 sections, got ${rules.length}`);
  const keys = rules.map((r) => r.section);
  assert.equal(new Set(keys).size, keys.length, 'duplicate section key');
  keys.forEach((k) => assert.ok(ALLOWED.includes(k), `unknown section ${k}`));
  assert.deepEqual(keys, ALLOWED.filter((k) => keys.includes(k)), 'sections out of order');
});

test('section rules: lengths', () => {
  for (const r of rules) {
    const n = words(r.rule);
    assert.ok(n >= 1 && n <= 8, `${r.section} rule is ${n} words`);
    assert.ok(Array.isArray(r.checks) && r.checks.length <= 3, `${r.section} checks 0-3`);
    for (const c of r.checks) assert.ok(words(c) >= 1 && words(c) <= 8, `${r.section} check too long: ${c}`);
  }
});

test('section rules: sources exist in the KB', () => {
  for (const r of rules) {
    nonEmpty(r.sources, `${r.section}.sources`);
    for (const id of r.sources) assert.ok(KB_IDS.has(id), `${r.section} cites missing KB id ${id}`);
  }
});

test('section rules: voice and claim bans', () => {
  for (const r of rules) {
    for (const s of [r.rule, ...r.checks]) {
      assert.ok(!FIRST_PERSON.test(s), `${r.section} first person: ${s}`);
      assert.ok(!s.includes('—'), `${r.section} em dash: ${s}`);
      assert.ok(!PRICE.test(s), `${r.section} price word: ${s}`);
      assert.ok(!BANNED.test(s), `${r.section} banned word: ${s}`);
      assert.ok(!/["']/.test(s), `${r.section} straight quote: ${s}`);
    }
  }
});
