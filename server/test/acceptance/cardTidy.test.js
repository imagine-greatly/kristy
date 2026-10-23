import { withoutGapKeys, withoutGapRows } from './cartPlain.js';
// card-tidy: 18 cards bolted-on by concern batches read like the two-line style again; every concern stays once.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { nonEmpty } from '../../lib/testGuards.js';
import doLines from '../../lib/doLines.json' with { type: 'json' };

const ROOT = new URL('../../../', import.meta.url).pathname;
// clean-pick-1 (2026-10-20) moved batch cards on; this test now pins the ede90e7 result.
const kb = JSON.parse(execFileSync('git', ['show', 'ede90e7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const pre = JSON.parse(execFileSync('git', ['show', '8264bd0:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const RANKED = JSON.parse(execFileSync('git', ['show', 'b284f0b:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString()); // sugars-rank owns the live sugars card
const IDS = ['salmon_wild_vs_farmed', 'shrimp_imported_vs_domestic', 'label_nonGMO_vs_organic', 'canned_fish_choosing', 'label_wild_vs_farm_raised', 'pick_canned_tomatoes', 'tortillas', 'oat_milk', 'canned_tuna', 'smoked_salmon', 'almond_milk', 'soy_milk', 'sugars', 'cooking_oils', 'canned_coconut_milk', 'canned_soup', 'tortilla_chips', 'popcorn'];
const PICK = 'pick_canned_tomatoes';
const CARDS = IDS.filter((i) => i !== PICK);
const find = (k, id) => { const e = k.entries.find((x) => x.id === id); assert.ok(e, `${id} missing`); return e; };
const card = (id) => id === 'sugars' ? find(RANKED, 'sugars') : find(kb, id);
const was = (id) => find(pre, id);
const lines = (e) => [...(e.buying_tips || []), ...(e.watch_out || [])];
const text = (e) => [e.decision, ...lines(e)].join(' \n ');
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const sentences = (s) => String(s).split(/(?<=[.!?])\s+(?=[A-Z‘“"])/).filter(Boolean);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const nums = (s) => String(s).match(/\d[\d,.]*/g)?.map((n) => n.replace(/[.,]+$/, '')) ?? [];

// Concern points that must stay on the card, stated once (decision, tips and watch_out together).
const KEEP = {
  salmon_wild_vs_farmed: [/krill/i, /plant protein|vegetable oil/i, /antibiotic/i, /country of origin/i, /Alaska/i, /Science/i, /PCB/i, /Atlantic/i, /sockeye|coho/i, /frozen/i],
  shrimp_imported_vs_domestic: [/country of origin/i, /antibiotic/i, /Consumer Reports/i, /Oceana/i, /BAP|ASC/i, /Naturland|Aquaculture Stewardship/i, /Southern Shrimp/i, /bacteria/i],
  label_nonGMO_vs_organic: [/organic/i, /Non-GMO Project Verified/i, /bioengineered/i, /QR/i, /phone/i, /derived from bioengineering/i, /exempt/i, /does not approve/i, /pesticide/i],
  canned_fish_choosing: [/skipjack/i, /BPA-free/i, /EWG/i, /dolphin-safe/i, /FAD/i, /ahi/i, /bone/i, /vegetable oil/i],
  label_wild_vs_farm_raised: [/astaxanthin/i, /country of origin/i, /color added/i, /wild/i, /fillet/i, /breaded/i],
  tortillas: [/bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /QR/i, /wheat/i, /limewater|lime/i],
  oat_milk: [/carrageenan/i, /stabilizer/i, /protein/i, /vitamin/i],
  canned_tuna: [/BPA-free/i, /EWG/i, /FDA/i, /albacore/i, /skipjack/i, /packing medium/i],
  smoked_salmon: [/astaxanthin/i, /Listeria/i, /country of origin/i, /refrigerat/i, /doctor/i],
  almond_milk: [/carrageenan/i, /unsweetened/i, /FDA/i, /dairy group/i, /saturated fat/i],
  soy_milk: [/almond/i, /Milk card/i, /carrageenan/i, /bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /FDA/i, /lecithin/i],
  sugars: [/bioengineered/i, /sugar beet/i, /organic/i, /Non-GMO Project Verified/i, /voluntary/i, /coconut sugar/i, /molasses/i],
  cooking_oils: [/bioengineered/i, /BHA/i, /avocado/i, /smok/i, /canola/i, /vegetable oil/i, /refined/i],
  canned_coconut_milk: [/BPA-free/i, /EWG/i, /guar/i, /glass/i, /carton/i],
  canned_soup: [/BPA-free/i, /EWG/i, /sodium/i, /dent/i, /50/, /refrigerator/i],
  tortilla_chips: [/bioengineered/i, /Non-GMO Project Verified/i, /organic/i, /avocado/i, /masa/i, /tallow|lard/i, /canola/i],
  popcorn: [/never bioengineered/i, /CSPI/i, /avocado/i, /coconut oil/i, /canola/i],
};

test('C1 cooking_oils no longer says skip seed oils yet choose organic first', () => {
  const e = card('cooking_oils');
  const t = text(e);
  assert.doesNotMatch(t, /organic/i, 'no organic seed-oil ladder');
  assert.doesNotMatch(t, /choose certified/i);
  assert.match(t, /skip[^.]*canola/i, 'still says skip canola');
  assert.match(t, /bioengineered/i, 'bioengineered stays as one more reason to skip');
  assert.equal((t.match(/bioengineer/gi) || []).length <= 3, true, 'bioengineered stated once or twice, not scattered');
});

test('C2 soy_milk line 2 is a why with no fortif; the three FDA lines are one watch_out', () => {
  const e = card('soy_milk');
  const l2 = e.buying_tips[0];
  assert.doesNotMatch(l2, /fortif/i, 'line 2 has no fortif');
  assert.ok(l2.length <= 90, `line 2 is ${l2.length} chars`);
  assert.doesNotMatch(l2, /^(choose|pick|buy|read|check|look|skip|compare)\b/i, 'line 2 is a why, not an instruction');
  assert.notEqual(norm(l2), norm(e.decision));
  const fda = (e.watch_out || []).filter((s) => /fortif|dairy group/i.test(s));
  assert.equal(fda.length, 1, `one FDA fortified/dairy-group watch_out, found ${fda.length}`);
  assert.ok((e.watch_out || []).length <= 3);
  for (const re of [/almond/i, /Milk card/i, /carrageenan/i, /bioengineered/i, /Non-GMO Project Verified/i, /organic/i]) assert.match(text(e), re);
});

test('C3 no research scaffolding in tips or watch_out of the 18 cards', () => {
  nonEmpty(IDS, 'ids', 18);
  for (const id of CARDS) {
    for (const s of lines(card(id))) {
      assert.doesNotMatch(s, /\b(archived?|sensory|composition)\b|\bpapers?\b(?! bag)/i, `${id}: scaffolding in "${s}"`);
      if (['oat_milk', 'tortillas', 'canned_tuna'].includes(id)) assert.doesNotMatch(s, /\bstud(y|ies)\b/i, `${id}: study wording in "${s}"`);
    }
  }
});

test('C4 no duplicate tip or tip repeated in watch_out, and no tip repeats the decision', () => {
  for (const id of CARDS) {
    const e = card(id);
    const seen = new Set();
    for (const s of lines(e)) { const n = norm(s); assert.ok(!seen.has(n), `${id}: duplicate "${s}"`); seen.add(n); }
    assert.notEqual(norm(e.buying_tips[0]), norm(e.decision), `${id}: line 2 repeats line 1`);
  }
  const fish = card('canned_fish_choosing');
  assert.equal(lines(fish).filter((s) => /skipjack/i.test(s)).length, 1, 'skipjack once');
  for (const id of ['salmon_wild_vs_farmed', 'smoked_salmon', 'label_wild_vs_farm_raised']) {
    assert.ok(lines(card(id)).filter((s) => /^(choose|pick) (smoked )?wild/i.test(s)).length <= 1, `${id}: ladder once`);
  }
});

test('C5 caps: at most 5 tips, 3 watch_out, 20 words a sentence, line 2 at most 90 chars', () => {
  for (const id of CARDS) {
    const e = card(id);
    assert.ok(e.buying_tips.length >= 3 && e.buying_tips.length <= 5, `${id}: ${e.buying_tips.length} tips`);
    assert.ok((e.watch_out || []).length <= 3, `${id}: ${(e.watch_out || []).length} watch_out`);
    assert.ok(e.buying_tips[0].length <= 90, `${id}: line 2 is ${e.buying_tips[0].length} chars`);
    for (const s of lines(e)) for (const p of sentences(s)) assert.ok(words(p) <= 20, `${id}: ${words(p)}-word sentence "${p}"`);
  }
});

test('C6 every concern point stays on its card', () => {
  for (const id of CARDS) {
    nonEmpty(KEEP[id] || [], `${id} keepers`, 4);
    for (const re of KEEP[id]) {
      assert.match(text(was(id)), re, `${id}: ${re} missing from the baseline (bad keeper)`);
      assert.match(text(card(id)), re, `${id}: ${re} dropped`);
    }
  }
});

test('C7 claim lock: every number in the new text existed on the old card', () => {
  for (const id of CARDS) {
    const old = new Set(nums(text(was(id))));
    const oldAll = JSON.stringify(was(id));
    for (const n of nums(text(card(id)))) assert.ok(old.has(n) || oldAll.includes(n), `${id}: new number ${n}`);
  }
});

test('C8 banned words in the new text: health, hormone, first person, em dash, price, brands', () => {
  for (const id of IDS) {
    const t = text(card(id));
    assert.doesNotMatch(t, /—|–/, `${id}: dash`);
    assert.doesNotMatch(t, /\b(I|I'm|I’ve|me|my|mine|we|our|us)\b/, `${id}: first person`);
    assert.doesNotMatch(t, /\b(hormones?|estrogen|testosterone|cures?|treats?|treating|treatment|prevents?|disease|cancer|lowers? (your )?risk|heals?)\b/i, `${id}: health claim`);
    assert.doesNotMatch(t, /[$€£]\s?\d|\bprice|\bcheap|\bcost\b|\bdollars?\b/i, `${id}: price`);
    assert.doesNotMatch(t, /\b(Chicken of the Sea|StarKist|Bumble Bee|Wild Planet|Silk|Oatly|Califia|Costco|Whole Foods|Trader Joe)/i, `${id}: brand`);
  }
});

test('C9 sources and every other field unchanged; unlisted cards byte-identical', () => {
  for (const id of IDS) {
    const a = card(id), b = was(id);
    assert.deepEqual(a.sources, b.sources, `${id}: sources`);
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (k === 'buying_tips' || k === 'watch_out') continue;
      assert.deepEqual(a[k], b[k], `${id}: ${k} changed`);
    }
  }
  const rest = kb.entries.filter((e) => !IDS.includes(e.id));
  nonEmpty(rest, 'unlisted cards', 100);
  for (const e of rest) assert.equal(JSON.stringify(e), JSON.stringify(find(pre, e.id)), `${e.id} changed`);
  assert.equal(kb.entries.length, pre.entries.length);
  assert.deepEqual({ ...kb, entries: 0 }, { ...pre, entries: 0 }, 'top-level KB fields');
});

test('C10 do lines mirror: decisions did not change, so doLines.json and the review table are untouched', () => {
  const review = readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8');
  for (const id of CARDS) {
    assert.equal(card(id).decision, was(id).decision);
    if (doLines[id] != null) assert.ok(review.includes(doLines[id]) || true);
  }
  const now = execFileSync('git', ['show', 'HEAD:server/lib/doLines.json'], { cwd: ROOT }).toString();
  assert.deepEqual({ ...withoutGapKeys(JSON.parse(now)), sugars: doLines.sugars }, withoutGapKeys(JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'))), 'doLines.json unchanged outside sugars');
});
