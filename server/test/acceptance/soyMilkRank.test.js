// soy-milk-rank: soy milk ranks below short-list plant milks; fortified is no longer the pick; FDA facts and earlier lines stay; no health claims.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };
import { preTidy, preCleanPick3 } from './twoLinePin.js';

const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
kb.entries = kb.entries.map((e) => preTidy(preCleanPick3(e)));
const ROOT = new URL('../../../', import.meta.url).pathname;
const pre = JSON.parse(execFileSync('git', ['show', 'f3ab9b4:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const card = (id) => { const e = kb.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const was = (id) => { const e = pre.entries.find((x) => x.id === id); assert.ok(e, `${id} missing before`); return e; };
const SKIP = new Set(['sources', 'aliases', 'asked_as', 'id', 'kind', 'category']);
const strings = (v) => (typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
const fields = (e) => Object.entries(e).filter(([k]) => !SKIP.has(k)).flatMap(([, v]) => strings(v));
// Text this batch adds or changes; lines already on the card before the batch are not this batch's claims.
const addedList = (id) => { const old = new Set(fields(was(id))); return fields(card(id)).filter((s) => !old.has(s)); };
const added = (id) => addedList(id).join(' \n ');
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const ID = 'soy_milk';
const soy = () => card(ID);
const tips = () => (soy().buying_tips || []);

test('C1 the decision and cart pick point to a short list, not fortified', () => {
  const { decision, cart_pick } = soy();
  assert.match(decision, /short list/i, 'names a short list');
  assert.match(decision, /soybeans and water/i, 'beyond soybeans and water');
  assert.match(decision, /unsweetened/i);
  assert.doesNotMatch(decision, /fortif/i, 'fortified is no longer the pick');
  assert.ok(words(decision) <= 10, `decision runs ${words(decision)} words`);
  assert.match(cart_pick, /unsweetened soy milk/i);
  assert.doesNotMatch(cart_pick, /fortif/i);
  assert.ok(cart_pick.length <= 46, `cart_pick is ${cart_pick.length} characters`);
  const m = matchItemToCard(cart_pick);
  assert.equal(m ? m.slug ?? m.id ?? m.entry?.id : null, ID, 'cart_pick resolves to the soy_milk card');
});

test('C2 a short-list almond milk ranks above soy milk, and dairy shoppers see the Milk card', () => {
  const t = tips().join(' \n ');
  assert.match(t, /almond[\s\S]*(ranks )?above[\s\S]*soy milk/i, 'almond milk ranks above soy milk');
  assert.match(t, /short[- ]list/i);
  assert.match(t, /dairy[\s\S]*\bMilk\b|\bMilk card\b/, 'dairy shoppers are pointed to the Milk card');
  assert.equal(kb.entries.find((e) => e.id === 'whole_vs_reduced_fat_milk').title, 'Milk', 'the pointed-to card is titled Milk');
});

test('C3 fortified is not the pick, fortification adds ingredients, and the FDA facts stay', () => {
  const t0 = tips()[0];
  assert.match(t0, /soybeans and water/i, 'tip 0 is the short-list tip');
  assert.doesNotMatch(t0, /fortif/i, 'tip 0 no longer leads with fortified');
  assert.ok(t0.length <= 90, `tip 0 is ${t0.length} characters`);
  assert.match(added(ID), /fortif[\s\S]*(ingredient|list)/i, 'a new line says fortifying adds ingredients');
  for (const f of ['why', 'short_answer', 'detail', 'science']) assert.equal(soy()[f], was(ID)[f], `${f} (the FDA dairy-group facts) changed`);
  assert.match(soy().why + soy().detail, /dairy group/i);
  for (const s of was(ID).buying_tips) assert.ok(tips().includes(s), `old tip lost: ${s}`);
});

test('C4 earlier batches stay; frozen fields and the sibling plant milks are untouched', () => {
  const a = soy(), b = was(ID);
  assert.deepEqual((a.watch_out || []).slice(0, b.watch_out.length), b.watch_out, 'watch_out lost or reordered a line');
  assert.ok(a.watch_out.length > b.watch_out.length, 'watch_out gained nothing');
  for (const re of [/carrageenan/i, /bioengineered/i, /Non-GMO Project Verified/]) assert.match([...a.buying_tips, ...a.watch_out].join(' '), re);
  assert.deepEqual(a.sources, b.sources, 'sources changed');
  for (const f of ['tier_note', 'why', 'short_answer', 'detail', 'science', 'labels_decoded', 'instead', 'aliases', 'asked_as', 'question', 'title', 'evidence_tier', 'category']) assert.deepEqual(a[f], b[f], `${f} changed`);
  assert.equal(a.pick_steps[1], b.pick_steps[1], 'pick_steps[1] changed');
  assert.deepEqual(card('coconut_milk_beverage'), was('coconut_milk_beverage'), 'coconut_milk_beverage changed');
  for (const id of nonEmpty(['almond_milk', 'oat_milk'], 'sibling plant milks', 2)) assert.deepEqual({ ...card(id), instead: 0 }, { ...was(id), instead: 0 }, `${id} changed beyond instead`);
});

test('C7 sibling instead lines point to another short-list plant milk', () => {
  const want = { almond_milk: /oat milk/i, oat_milk: /almond milk/i };
  for (const [id, re] of Object.entries(want)) {
    const { instead, cart_pick } = card(id);
    assert.match(instead, /short[- ]list/i, `${id} instead names a short list`);
    assert.match(instead, re, `${id} instead names the other plant milk`);
    assert.doesNotMatch(instead, /soy|fortif/i, `${id} instead no longer names fortified soy`);
    assert.ok(words(instead) <= 24 && instead !== cart_pick, `${id} instead length or equals cart_pick`);
    assert.doesNotMatch(added(id), /testosterone|estrogen|hormon|—|\b(I|me|my)\b/i);
  }
  for (const e of nonEmpty(kb.entries, 'kb entries', 100)) assert.doesNotMatch(String(e.instead ?? ''), /fortified unsweetened soy milk is the next/i, `${e.id} still names fortified soy as the next plant drink`);
});

test('C5 new lines are readable: at most 20 words a sentence, at most one semicolon', () => {
  const lines = nonEmpty(addedList(ID), 'soy_milk added lines', 4);
  for (const l of lines) {
    for (const s of l.split(/(?<=[.!?])\s+/)) {
      assert.ok(s.split(/\s+/).length <= 20, `sentence over 20 words: ${s}`);
      assert.ok((s.match(/;/g) || []).length <= 1, `stacked semicolons: ${s}`);
    }
  }
});

test('C6 no hormone, health, first person, em dash, price, calorie or brand wording; the do line mirrors the headline', () => {
  const t = nonEmpty([added(ID), String(doLines[ID] ?? '')], 'added text', 2).join(' \n ');
  assert.doesNotMatch(t, /testosterone|estrogen|hormon|phyto|male|men's/i, 'hormone or bodily-effect wording');
  assert.doesNotMatch(t, /\b(causes?|prevents?|treats?|cures?|lowers? (the )?risk|cancer|toxic\w*|unsafe|safe|safer|harm\w*|risks?|linked to|health\w*|neurolog\w*|immun\w*|exposure|doses?|allerg\w*|estro\w*)\b/i, 'health or treatment wording');
  assert.doesNotMatch(t, /\b(I|me|my)\b/, 'first person');
  assert.doesNotMatch(t, /—/, 'em dash');
  assert.doesNotMatch(t, /\$\s?\d|\bprice\w*|\bcheap\w*|\bcalor\w*|\blogged\b/i, 'price or calorie wording');
  assert.doesNotMatch(t, /\b(Silk|Oatly|Califia|Pacific|Westsoy|Edensoy|Whole Foods|Costco|Kroger|Trader Joe)\b/i, 'brand name');
  assert.match(doLines[ID], /soybeans and water/i, 'the do line mirrors the new headline');
  assert.doesNotMatch(String(doLines[ID]), /fortif/i);
  assert.match(execFileSync('git', ['show', '2ab7f2f:docs/do-lines-review.md'], { cwd: ROOT }).toString(), /\| `soy_milk` \| eggs_dairy \| Unsweetened soy milk, a short list beyond soybeans and water\. \|/, 'review table row carries the new headline');
});
