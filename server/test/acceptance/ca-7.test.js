// CA-7: the "If you can't get it" ladder on fifteen eggs_dairy cards. Written by the admin; do not edit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as lint from '../../lib/counterCardLint.js';
import { projectEntry } from '../../lib/counterCards.js';
import { nonEmpty } from '../../lib/testGuards.js';

const SERVER = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ROOT = join(SERVER, '..');
const kb = JSON.parse(readFileSync(join(SERVER, 'kristy_perimeter_kb.json'), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', '9854ae1:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const doLines = JSON.parse(readFileSync(join(SERVER, 'lib', 'doLines.json'), 'utf8'));
const now = (id) => kb.entries.find((e) => e.id === id);
const was = (id) => base.entries.find((e) => e.id === id);

const IDS = ['whole_vs_reduced_fat_milk', 'raw_milk', 'egg_labels', 'grassfed_butter', 'cheese_real_vs_processed',
  'yogurt_plain_vs_flavored', 'raw_kefir', 'plain_kefir', 'raw_aged_cheese', 'sour_cream', 'cream_cheese',
  'cottage_cheese', 'ice_cream', 'ghee', 'goat_sheep_dairy'];
const LADDER = /^If you can['’]t get [^:]{2,40}: [^:]+\.$/;
const FIRST_PERSON = /\b(i|me|my|we|our|us)\b/i;
const PRICE = /\$|\b(price|prices|cost|costs|cheap|cheaper|expensive|budget|dollars?|save|savings|deal)\b/i;
const BANNED = /\b(treat\w*|prevent\w*|risk\w*|cure\w*|heal\w*|detox\w*|avocado oil)\b/i;

test('A1 every batch card exists and carries a ladder instead line', () => {
  nonEmpty(IDS.map(now).filter(Boolean), 'batch cards', IDS.length);
  for (const id of IDS) {
    const { instead } = now(id);
    assert.match(instead ?? '', LADDER, `${id}: instead not in "If you can't get X: Y." form`);
    assert.ok(instead.length <= 110, `${id}: instead over 110 chars`);
    for (const re of [FIRST_PERSON, PRICE, BANNED, /—/]) assert.doesNotMatch(instead, re, `${id}: ${re}`);
  }
});

test('A2 milk names the store shelf as a raw source and the full next rung', () => {
  const milk = now('whole_vs_reduced_fat_milk');
  assert.doesNotMatch(milk.decision, /farmer/i, 'milk decision still assumes a farmer');
  assert.match(milk.decision, /raw/i);
  assert.match(milk.instead, /^If you can['’]t get raw: /);
  for (const w of [/low-temp/i, /organic/i, /100% grass-fed/i]) assert.match(milk.instead, w);
});

test('A3 batch cards stay lint-clean; corpus clean', () => {
  for (const id of IDS) {
    const e = now(id);
    assert.deepEqual(lint.lintCard(projectEntry(e, { doLine: doLines[id] || '' })), [], id);
    assert.deepEqual(lint.headlineHedge(e.decision), [], id);
    assert.ok(e.decision.length <= 90, `${id}: decision over 90 chars`);
    for (const re of [FIRST_PERSON, PRICE, BANNED, /—/]) assert.doesNotMatch(e.decision, re, `${id}: ${re}`);
  }
  assert.deepEqual(lint.lintCorpus(kb.entries.filter((e) => e.kind !== 'pick').map((e) => projectEntry(e, { doLine: doLines[e.id] }))).violations, []);
});

test('A4 only decision and instead moved on batch cards; nothing else in the KB moved', () => {
  assert.equal(kb.entries.length, base.entries.length, 'entry count changed');
  const strip = (e) => { const { decision, instead, ...rest } = e; return rest; };
  for (const e of base.entries) {
    if (IDS.includes(e.id)) assert.deepEqual(strip(now(e.id)), strip(e), `${e.id}: a field beyond decision/instead moved`);
    else assert.deepEqual(now(e.id), e, `${e.id}: outside the batch, changed`);
  }
});

test('A5 the ladder exemption does not hide a hedge inside the opener', () => {
  const milk = now('whole_vs_reduced_fat_milk');
  const codes = (instead) => lint.lintCard({ ...milk, instead }).map((v) => v.code ?? v.rule ?? v);
  assert.ok(!codes(milk.instead).includes('INSTEAD_HEDGED'), 'the real ladder line passes');
  for (const bad of ["If you can't get raw when in a hurry: whole milk.", "If you can't get raw on a budget: whole milk."]) {
    assert.ok(codes(bad).includes('INSTEAD_HEDGED'), bad);
  }
});
