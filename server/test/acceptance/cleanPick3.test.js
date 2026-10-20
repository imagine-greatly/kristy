// clean-pick-3 (Devon 2026-10-20): B3 dairy and plant milks, B4 meat, seafood and frozen name each item’s own cleanest version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { CLEAN_PICK_4, CLEAN_PICK_5, CLEAN_PICK_6, CLEAN_PICK_7, CLEAN_PICK_9, CLEAN_PICK_10, preCleanPick11, preCleanPick12, preCleanPick8, CLEAN_PICK_8 } from './twoLinePin.js';

// clean-pick-10 owns its ids now; this batch skips them like the clean-pick-9 ids.
const CP9or10 = (id) => CLEAN_PICK_9.has(id) || CLEAN_PICK_10.has(id);

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_1 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git('2ab7f2f:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => preCleanPick11(find(kb, id));
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;
const SCI_OLD = 'A gum on the list is a texture choice by the maker, never a ranking.';
const SCI_NEW = 'A gum on the list is a texture choice by the maker.';

const BECAME = {
  almond_milk: { decision: 'Unsweetened, unfortified almond milk, a short list, never seed oil.', cart_pick: 'Unsweetened, unfortified almond milk', tip1: 'Look for unsweetened on the carton and no added vitamins or minerals on the list.', watch_add: 'Fortified almond milk comes second, since each added vitamin or mineral joins the list.', std: /no added vitamins or minerals/, carry: /unfortified/i },
  soy_milk: { decision: 'Unsweetened, unfortified soy milk: soybeans and water, little else.', cart_pick: 'Unsweetened, unfortified soy milk', tip1: 'Look for unsweetened soy milk with no vitamins or minerals in the ingredient list.', watch_add: 'Fortified soy milk is the second pick, behind a carton of soybeans and water.', std: /no vitamins or minerals/, carry: /unfortified/i },
  oat_milk: { decision: 'Unsweetened, unfortified oat milk with nothing added, never seed oil.', cart_pick: 'Unsweetened, unfortified oat milk', tip1: 'Look for oats and water alone, with no vitamins, minerals or oil added.', watch_add: 'A fortified oat milk ranks second; its added vitamins and minerals lengthen the list.', std: /oats and water alone/, carry: /unfortified/i },
  coconut_milk_beverage: { decision: 'Unsweetened, unfortified carton coconut milk, fewest added gums.', cart_pick: 'Unsweetened, unfortified coconut milk beverage', tip1: 'Look for coconut and water at the top, with no vitamins added below.', watch_add: 'A fortified carton comes second; the vitamins in it are added ingredients.', std: /no vitamins added/, carry: /unfortified/i },
  plant_butter: { tip1: 'Look for oils, water and salt, with no lecithin or natural flavors listed.', std: /no lecithin or natural flavors/, carry: /no lecithin/ },
  cottage_cheese: { decision: 'Grass-fed cottage cheese, curd set by a culture, no carrageenan.', cart_pick: 'Grass-fed culture-set cottage cheese', tip1: 'Look for milk, cream, salt and cultures alone, with no carrageenan or gum.', std: /cultures alone/, carry: /grass-fed/i },
  ghee: { decision: 'Grass-fed ghee or clarified butter, butter the only ingredient.', cart_pick: 'Grass-fed ghee', tip1: 'Look for butter as the single ingredient on the jar, with nothing added.', std: /single ingredient/, carry: /grass-fed/i },
  goat_sheep_dairy: { decision: 'Grass-fed goat or sheep milk, yogurt and cheese, nothing added.', cart_pick: 'Grass-fed goat or sheep milk', tip1: 'Look for goat or sheep milk, cultures and salt alone on a cheese or yogurt list.', std: /cultures and salt alone/, carry: /grass-fed/i },
  ice_cream: { decision: 'Grass-fed ice cream of cream, milk and sugar, no gums.', cart_pick: 'Grass-fed gum-free ice cream', tip1: 'Look for cream, milk and sugar first, with no carrageenan or guar gum.', std: /no carrageenan or guar gum/, carry: /grass-fed/i },
  butcher_counter_asking: { decision: '100% grass-fed soup bones and a whole chuck, freshly ground.', cart_pick: 'Grass-fed soup bones from the butcher counter', tip1: 'Ask which farm the bones came from and what the cattle were fed.', std: /which farm/, carry: /grass-fed/i },
  organ_meats: { decision: '100% grass-fed or pasture-raised organ meats, cooked within two days.', cart_pick: 'Pasture-raised beef liver or organ meat', tip1: 'Ask the counter which farm the liver or heart came from.', tier_note: 'Pasture-raised organ meats: time outdoors on pasture, audited only with a certifier’s seal.', glossed: true, std: /which farm/, carry: /grass-fed|pasture-raised/i },
  lard_tallow: { decision: 'Pasture-raised leaf lard or grass-fed tallow, nothing added to harden.', cart_pick: 'Pasture-raised lard or grass-fed tallow', tip1: 'Look for pasture-raised on the lard tub, and one fat in the list.', std: /pasture-raised[\s\S]*one fat/, carry: /pasture-raised/i },
  smoked_salmon: { decision: 'Wild-caught smoked salmon, nova or lox, kept cold.', cart_pick: 'Wild-caught smoked salmon', tip1: 'Look for wild-caught on the pack, and no ‘color added’ line.', std: /color added/, carry: /wild-caught/i },
  frozen_nuggets: { decision: 'Organic or pasture-raised white meat nuggets, one solid piece.', cart_pick: 'Organic chicken nuggets', tip1: 'Look for certified organic on the box and a plain “Chicken Nugget” name.', std: /Chicken Nugget/, carry: /organic|pasture-raised/i },
  hot_dogs: { decision: 'Organic beef hot dogs with no phosphates or binders.', tip1: 'Look for a list with no sodium phosphate, carrageenan or modified food starch.', std: /phosphate/, carry: /no phosphates/ },
  turkey_bacon: { decision: 'Organic or pasture-raised turkey bacon with no added sugar.', tip1: 'Look for a curing list that names no sugar after the turkey.', std: /no sugar/, carry: /no added sugar/i },
  frozen_pizza: { decision: 'Whole wheat frozen pizza, crust of flour, water, salt, yeast.', cart_pick: 'Whole wheat frozen pizza', tip1: 'Look for real cheese on the list; “imitation cheese” marks a substitute.', std: /imitation cheese/, carry: /whole wheat/i },
  frozen_waffles: { decision: 'Whole grain frozen waffles with no dyes or enriched flour.', cart_pick: 'Whole grain frozen waffles', tip1: 'Look for whole wheat flour first and no enriched flour or dye anywhere on the list.', std: /enriched flour/, carry: /whole grain/i },
  frozen_meals: { decision: 'Frozen meals named for their meat, no binders or extenders.', cart_pick: 'Binder-free frozen meals', tip1: 'Look for a meat named in the title and no binders or extenders in the list.', std: /binders or extenders/, carry: /no binders/i },
  canned_coconut_milk: { decision: 'Canned coconut milk listing coconut alone, no gum added.', cart_pick: 'Gum-free canned coconut milk', tip1: 'Look for coconut alone on the list, with no guar gum or other gum.', tier_note: 'Coconut alone is the short list; any gum is the maker’s addition.', science: true, std: /no guar gum/, carry: /coconut alone/i },
  coconut_water: { decision: 'Pure coconut water, high-pressure processed, with nothing added.', cart_pick: 'High-pressure processed pure coconut water', tip1: 'Look for HPP or high-pressure processed on the carton, and coconut water alone.', std: /high-pressure processed/, carry: /high-pressure/i },
};
const IDS = Object.keys(BECAME);
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const ORGANIC = new Set(['frozen_nuggets', 'hot_dogs', 'turkey_bacon']);
const PLANT = ['almond_milk', 'soy_milk', 'oat_milk', 'coconut_milk_beverage'];
const T0_AS_BASE = ['turkey_bacon'];
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const idOf = (r) => r?.slug;

// Expected entry: the 2ab7f2f entry plus the BECAME fields, computed the way the Change section states.
function expected(id) {
  const w = structuredClone(was(id));
  const b = BECAME[id];
  const e = { ...w, buying_tips: [w.buying_tips[0], b.tip1, ...w.buying_tips.slice(1)] };
  for (const f of ['decision', 'cart_pick', 'tier_note']) if (b[f]) e[f] = b[f];
  if (b.watch_add) e.watch_out = [...(w.watch_out ?? []), b.watch_add];
  if (b.glossed) e.detail = `${w.detail} ${w.tier_note}`;
  if (b.science) {
    const s = JSON.stringify(w.science);
    assert.ok(s.includes(SCI_OLD), `${id} base science lacks the gum sentence`);
    e.science = JSON.parse(s.replace(SCI_OLD, SCI_NEW));
  }
  return e;
}

// Every new string the batch writes into a field shoppers see.
const fresh = () => IDS.flatMap((id) => {
  const b = BECAME[id];
  return [b.decision, b.cart_pick, b.tip1, b.watch_add, b.tier_note].filter(Boolean);
});

nonEmpty(IDS, 'IDS', 21);

test('C1 the 21 ids equal their expected entries and carry their phrase', () => {
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), expected(id), id);
    const l = live(id);
    assert.match(`${l.decision} ${l.cart_pick || ''} ${l.buying_tips[1]}`, BECAME[id].carry, `${id} carry phrase`);
  }
});

test('C2 decisions are at most 10 words, carts at most 46 characters, changed tier notes one sentence of 5 to 20 words', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.ok(words(l.decision) <= 10, `${id} decision ${words(l.decision)} words`);
    if (l.cart_pick) assert.ok(l.cart_pick.length <= 46, `${id} cart ${l.cart_pick.length} chars`);
    if (BECAME[id].tier_note) {
      const n = words(l.tier_note);
      assert.ok(n >= 5 && n <= 20, `${id} tier_note ${n} words`);
      assert.equal(l.tier_note.split(/(?<=[.!?])\s+/).length, 1, `${id} tier_note sentences`);
    }
  }
});

test('C3 tips[0] stays the base why; tips[1] is the new standard line', () => {
  for (const id of IDS) {
    const t = live(id).buying_tips;
    assert.equal(t[0], was(id).buying_tips[0], `${id} tip 0`);
    if (!T0_AS_BASE.includes(id)) {
      assert.doesNotMatch(t[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i, `${id} tip 0 imperative`);
      assert.notEqual(t[0], live(id).decision, id);
    }
    assert.equal(t[1], BECAME[id].tip1, `${id} tip 1`);
    assert.match(t[1], BECAME[id].std, `${id} tip 1 standard`);
  }
});

test('C4 no new text carries a banned word, a dash, a straight apostrophe or first person', () => {
  const all = [...fresh(), SCI_NEW];
  nonEmpty(all, 'written', 60);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
  }
});

test('C5 organic is named exactly on nuggets, hot dogs and turkey bacon', () => {
  for (const id of IDS) {
    if (id === 'plant_butter') continue;
    const l = live(id);
    assert.equal(/\borganic\b/i.test(`${l.decision} ${l.cart_pick || ''}`), ORGANIC.has(id), id);
  }
});

test('C6 entries outside the batch deepEqual 2ab7f2f; count and top-level keys unchanged', () => {
  const others = kb.entries.map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_4.has(e.id) && !CLEAN_PICK_5.has(e.id) && !CLEAN_PICK_6.has(e.id) && !CLEAN_PICK_7.has(e.id) && !CP9or10(e.id));
  nonEmpty(others, 'others', 124);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json unchanged; review headlines move only on decision-changed ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('2ab7f2f:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]).reverse()); // first row per id wins: the main table, not the historical notes
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('2ab7f2f:docs/do-lines-review.md'));
  nonEmpty([...baseRows.keys()], 'review rows', 150);
  assert.equal(liveRows.size, baseRows.size);
  let seen = 0;
  for (const [id, row] of baseRows) {
    if (CLEAN_PICK_4.has(id) || CLEAN_PICK_5.has(id)) continue;
    if (CP9or10(id)) continue; // clean-pick-9 moves these headlines; cleanPick9.test.js pins them
    if (CLEAN_PICK_8.has(id)) continue; // clean-pick-8 moves these headlines; cleanPick8.test.js pins them
    const lr = liveRows.get(id);
    assert.ok(lr, id);
    if (DECISION_CHANGED.includes(id)) {
      const lc = lr.split('|').map((c) => c.trim());
      const bc = row.split('|').map((c) => c.trim());
      assert.equal(lc[3], live(id).decision, id);
      assert.equal(lc[4], bc[4], `${id} do cell`);
      seen += 1;
    } else {
      assert.equal(lr, row, id);
    }
  }
  assert.equal(seen, DECISION_CHANGED.length);
});

test('C8 every base tip is kept', () => {
  for (const id of IDS) {
    const l = live(id);
    nonEmpty(was(id).buying_tips, `${id} base tips`, 1);
    was(id).buying_tips.forEach((t, i) => assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`));
  }
});

test('C9 each cart pick matches its own card', async () => {
  const carts = IDS.filter((id) => live(id).cart_pick);
  nonEmpty(carts, 'carts', 21);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = fresh();
  nonEmpty(all, 'fresh', 60);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 plant milks: unfortified is the pick and fortified ranks second', () => {
  for (const id of PLANT) {
    const l = live(id);
    assert.match(l.decision, /unfortified/i, `${id} decision`);
    assert.match(l.cart_pick, /unfortified/i, `${id} cart`);
    const last = l.watch_out.at(-1);
    assert.match(last, /fortified/i, `${id} watch_out`);
    assert.match(last, /second/i, `${id} watch_out rank`);
  }
});
