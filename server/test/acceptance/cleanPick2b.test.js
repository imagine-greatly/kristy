// clean-pick-2b (Devon 2026-10-20, Q1 A organic on all produce): the hub and banana depth text
// stops sending peeled produce to conventional; skin-on first only when organic runs short.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { lintPickSteps, lintRepeatedClaim } from '../../lib/counterCardLint.js';
import { CLEAN_PICK_3, CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6, CLEAN_PICK_7 } from './twoLinePin.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(execFileSync('git', ['show', 'a2487a7:server/kristy_perimeter_kb.json'], { cwd: ROOT, maxBuffer: 64 << 20 }).toString());
const find = (k, id) => k.entries.find((e) => e.id === id);
const FINAL = {
  "organic_worth_it_by_type": {
    "short_answer": "Organic across the produce aisle. When the organic shelf runs thin, start with what gets eaten skin-on: berries, leafy greens, apples, grapes, potatoes. Peeled fruit like avocado, kiwi, mango, banana, citrus and onion can wait its turn.",
    "kristy_take": "Reach for organic across the produce aisle. An avocado or kiwi can feel delicate and still have a peel you throw away, so it waits when organic runs short.",
    "pick_steps": [
      "Choose organic across the produce aisle.",
      "When organic runs short, start with skin-on produce: berries, greens, apples, grapes, potatoes.",
      "Trust the USDA Organic seal; Natural means nothing on produce."
    ],
    "watch_out": [
      "When organic runs short, go by the SKIN, not how thick it feels. Avocado and kiwi read as delicate and get peeled, so they can wait. A potato reads as sturdy and gets eaten skin-on, so it cannot.",
      "Sturdy vegetables eaten whole are the gap the skin rule does not cover. Asparagus, cabbage, cauliflower, mushrooms and carrots test low, so they can wait when organic runs short.",
      "Organic is not pesticide-free. It is a different approved list: copper, spinosad and pyrethrins are all permitted organic pesticides. The claim is fewer synthetic residues, never none.",
      "The “Dirty Dozen” ranking is contested on its methodology. The eaten-whole reasoning holds; the list order does not.",
      "If organic means fewer vegetables in the cart, buy conventional and eat more."
    ]
  },
  "produce_bananas": {
    "short_answer": "Buy organic bananas green or just turning and let them ripen on the counter. They get sweeter as the green fades. Bananas sit on the low-residue list because the peel comes off; organic still sets how they are grown.",
    "kristy_take": "Take the greenest organic bunch for the week and let the counter finish it. Keep green bananas out of the fridge.",
    "detail_sentence": "Green bananas rank low for residue, tested with the peel off; organic still sets how they are grown."
  }
};
const OLD_BANANA = 'Conventional is fine on green bananas: they rank low for residue, tested with the peel off.';
const IDS = Object.keys(FINAL);
const OWNED = { organic_worth_it_by_type: ['short_answer', 'kristy_take', 'pick_steps', 'watch_out'], produce_bananas: ['short_answer', 'kristy_take', 'detail'] };

test('C1 the hub and banana depth fields hold their final values', () => {
  for (const id of ['organic_worth_it_by_type']) for (const [f, v] of Object.entries(FINAL[id])) assert.deepEqual(find(kb, id)[f], v, `${id}.${f}`);
  const b = find(kb, 'produce_bananas');
  assert.equal(b.short_answer, FINAL.produce_bananas.short_answer);
  assert.equal(b.kristy_take, FINAL.produce_bananas.kristy_take);
  assert.equal(b.detail, find(base, 'produce_bananas').detail.replace(OLD_BANANA, FINAL.produce_bananas.detail_sentence));
});

test('C2 no owned field sends a shopper to conventional by default', () => {
  const BAD = /Conventional is fine|Choose conventional|goes in conventional|nothing is lost buying those plain/i;
  for (const id of IDS) for (const f of OWNED[id]) assert.ok(!BAD.test(JSON.stringify(find(kb, id)[f])), `${id}.${f}`);
});

test('C3 every other field and entry equals a2487a7', () => {
  for (const e of kb.entries) {
    if (CLEAN_PICK_3.has(e.id) || CLEAN_PICK_4.has(e.id) || CLEAN_PICK_5.has(e.id) || CLEAN_PICK_6.has(e.id) || CLEAN_PICK_7.has(e.id)) continue;
    const old = find(base, e.id);
    const strip = (x) => Object.fromEntries(Object.entries(x).filter(([f]) => !(OWNED[e.id] || []).includes(f)));
    assert.deepEqual(strip(e), strip(old), e.id);
  }
  assert.equal(kb.entries.length, base.entries.length);
});

test('C4 both cards pass the pick-steps and repeated-claim lints', () => {
  for (const id of IDS) {
    assert.deepEqual(lintPickSteps(find(kb, id)), [], id);
    assert.deepEqual(lintRepeatedClaim(find(kb, id)), [], id);
  }
});
