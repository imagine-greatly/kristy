// clean-pick-5 (Devon 2026-10-20): B6 corn, soy, ferments, condiments and snacks name each item’s own cleanest version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { CLEAN_PICK_6, CLEAN_PICK_7, CLEAN_PICK_9, CLEAN_PICK_10, preCleanPick11, preCleanPick12, preCleanPick8, CLEAN_PICK_8 } from './twoLinePin.js';

// clean-pick-10 owns its ids now; this batch skips them like the clean-pick-9 ids.
const CP9or10 = (id) => CLEAN_PICK_9.has(id) || CLEAN_PICK_10.has(id);

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git('6db979f:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => preCleanPick12(preCleanPick8(find(kb, id)));
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;

const BECAME = {
  tortilla_chips: { decision: 'Organic masa tortilla chips in olive oil or tallow.', cart_pick: 'Organic masa tortilla chips: olive oil', tip1: 'Look for the USDA Organic seal, then masa, one named fat and salt.', std: /USDA Organic seal/, carry: /organic/i },
  popcorn: { tip1: 'Look for a bag of kernels with popcorn as the only ingredient.', std: /popcorn as the only ingredient/, carry: /popcorn as the only ingredient/ },
  miso: { decision: 'Organic miso of soybeans, salt and koji, any grain named.', cart_pick: 'Organic miso paste', tip1: 'Look for organic soybeans, koji and salt on the list, with any grain named.', std: /organic soybeans, koji and salt/, carry: /organic/i },
  tempeh: { decision: 'Organic tempeh in a firm cake, bound white all through.', cart_pick: 'Firm organic tempeh cake', tip1: 'Look for a tempeh list of organic soybeans alone or with one named grain.', std: /organic soybeans alone/, carry: /organic/i },
  natto: { decision: 'Organic natto in sealed trays, chilled or frozen.', cart_pick: 'Organic natto beans', tip1: 'Look for USDA Organic on the pack, with whole soybeans listed first.', std: /USDA Organic on the pack/, carry: /organic/i },
  hot_soy_sauce: { decision: 'Organic soy sauce, traditionally brewed, not made fast with acid.', cart_pick: 'Organic naturally brewed soy sauce', tip1: 'Look for the words naturally brewed, with organic soybeans named first.', std: /naturally brewed, with organic soybeans/, carry: /organic/i },
  kombucha: { decision: 'Plain kombucha from the refrigerated case, kept cold.', cart_pick: 'Plain refrigerated kombucha', tip1: 'Look for tea and sugar first on the list, with no fruit juice added.', std: /no fruit juice added/, carry: /plain|no fruit juice/i },
  jam: { decision: 'Jam or preserves of fruit, sugar and pectin, nothing else.', cart_pick: 'Jam or preserves: fruit, sugar, pectin', tip1: 'Look for fruit first, then sugar and pectin, and nothing more on the jar.', std: /fruit first, then sugar and pectin/, carry: /pectin/i },
  ketchup_mustard: { decision: 'Unsweetened ketchup from tomato; mustard of seed, vinegar, spice.', cart_pick: 'Unsweetened tomato ketchup and mustard', tip1: 'Look for a ketchup list of tomato, vinegar and spices, with no sweetener.', std: /no sweetener/, carry: /unsweetened|no sweetener/i },
  canned_soup: { decision: 'Low-sodium canned soup, short list, no added flavors, can undented.', tip1: 'Look for a short list with no added flavors, starches or sugar.', std: /no added flavors/, carry: /no added flavors/i },
  olives: { decision: 'Brine-cured olives, fermented in water and salt, nothing else.', tip1: 'Look for a jar of olives, water and salt, with no ferrous gluconate.', std: /no ferrous gluconate/, carry: /nothing else|no ferrous gluconate/i },
  salt: { decision: 'Iodized salt with no anti-caking agent on the list.', cart_pick: 'Iodized salt: no anti-caking agent', tip1: 'Look for iodide named on the list, with no anti-caking agent beside it.', std: /iodide named on the list/, carry: /no anti-caking/i },
  nutritional_yeast: { decision: 'Unfortified nutritional yeast flakes, granules or powder.', cart_pick: 'Unfortified nutritional yeast flakes', tip1: 'Look for inactive dried yeast and nothing more, with no vitamins listed.', watch_add: 'Fortified nutritional yeast comes second, behind one with no vitamins added.', tier_note: 'Added vitamins are read from the ingredients, and unfortified ranks first.', std: /no vitamins listed/, carry: /unfortified/i },
  snack_bars: { decision: 'Organic bars with oats or another whole grain listed first.', cart_pick: 'Organic oat snack bars', tip1: 'Look for organic oats first and fruit or honey as the only sweetener.', std: /organic oats first/, carry: /organic/i },
  trail_mix: { decision: 'Trail mix of nuts and dried fruit alone, nothing added.', cart_pick: 'Trail mix: nuts and dried fruit only', tip1: 'Look for a bag of only nuts and dried fruit, with no candy, oil or salt.', std: /only nuts and dried fruit/, carry: /nuts and dried fruit/i },
  hummus: { decision: 'Organic hummus of chickpeas and tahini, with no gums.', cart_pick: 'Organic hummus: chickpeas and tahini', tip1: 'Look for certified organic chickpeas and tahini, with no gum on the list.', std: /certified organic chickpeas/, carry: /organic/i },
};
const IDS = Object.keys(BECAME);
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const ORGANIC = new Set(['tortilla_chips', 'miso', 'tempeh', 'natto', 'hot_soy_sauce', 'snack_bars', 'hummus']);
const SNACKS = ['tortilla_chips', 'popcorn', 'snack_bars', 'trail_mix', 'hummus'];
const OILY = /\b(sodium|canola|soybean|sunflower|safflower|cottonseed|grapeseed|rice bran|corn oil|vegetable oils?|seed oils?)\b/i;
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const REACH = [
  ['tortilla chips', 'tortilla_chips'], ['popcorn kernels', 'popcorn'], ['snack bars', 'snack_bars'], ['granola bar', 'snack_bars'], ['granola', 'breakfast_cereal'],
  ['trail mix', 'trail_mix'], ['nuts', 'nuts_raw_vs_roasted'], ['dried fruit', 'dried_fruit'], ['hummus', 'hummus'], ['miso paste', 'miso'],
  ['tempeh', 'tempeh'], ['natto', 'natto'], ['soy sauce', 'hot_soy_sauce'], ['tamari', 'hot_soy_sauce'], ['nutritional yeast', 'nutritional_yeast'],
  ['sea salt', 'salt'], ['kombucha', 'kombucha'], ['ketchup', 'ketchup_mustard'], ['jam', 'jam'],
];
const idOf = (r) => r?.slug;

// Expected entry: the 6db979f entry plus the BECAME fields, computed the way the Change section states.
function expected(id) {
  const w = structuredClone(was(id));
  const b = BECAME[id];
  const e = { ...w, buying_tips: [w.buying_tips[0], b.tip1, ...w.buying_tips.slice(1)] };
  for (const f of ['decision', 'cart_pick', 'tier_note']) if (b[f]) e[f] = b[f];
  if (b.watch_add) e.watch_out = [...(w.watch_out ?? []), b.watch_add];
  return e;
}

// Every new string the batch writes into a field shoppers see.
const fresh = (ids = IDS) => ids.flatMap((id) => {
  const b = BECAME[id];
  return [b.decision, b.cart_pick, b.tip1, b.watch_add, b.tier_note].filter(Boolean);
});

nonEmpty(IDS, 'IDS', 16);

test('C1 the 16 ids equal their expected entries and carry their phrase', () => {
  for (const id of IDS) {
    assert.ok(live(id) && was(id), `${id} missing`);
    assert.deepEqual(live(id), expected(id), id);
    const l = live(id);
    assert.match(`${l.decision} ${l.cart_pick || ''} ${l.buying_tips[1]}`, BECAME[id].carry, `${id} carry phrase`);
  }
});

test('C2 decisions are at most 10 words and carts at most 46 characters', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.ok(words(l.decision) <= 10, `${id} decision ${words(l.decision)} words`);
    if (l.cart_pick) assert.ok(l.cart_pick.length <= 46, `${id} cart ${l.cart_pick.length} chars`);
  }
});

test('C3 tips[0] stays the base why; tips[1] is the new standard line', () => {
  for (const id of IDS) {
    const t = live(id).buying_tips;
    assert.equal(t[0], was(id).buying_tips[0], `${id} tip 0`);
    assert.doesNotMatch(t[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i, `${id} tip 0 imperative`);
    assert.notEqual(t[0], live(id).decision, id);
    assert.equal(t[1], BECAME[id].tip1, `${id} tip 1`);
    assert.match(t[1], BECAME[id].std, `${id} tip 1 standard`);
  }
});

test('C4 no new text carries a banned or treatment word, a dash, a straight apostrophe or first person; snack text names no sodium or seed oil', () => {
  const all = fresh();
  nonEmpty(all, 'written', 40);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
  }
  const snack = fresh(SNACKS);
  nonEmpty(snack, 'snack strings', 12);
  for (const s of snack) assert.doesNotMatch(s, OILY, s);
});

test('C5 organic sits on the decision and cart of exactly the seven crop ids', () => {
  nonEmpty([...ORGANIC], 'organic ids', 7);
  for (const id of IDS) {
    const l = live(id);
    const w = was(id);
    assert.doesNotMatch(`${w.decision} ${w.cart_pick || ''}`, /\borganic\b/i, `${id} base front`);
    assert.equal(/\borganic\b/i.test(`${l.decision} ${l.cart_pick || ''}`), ORGANIC.has(id), id);
    if (ORGANIC.has(id)) {
      assert.match(l.decision, /\borganic\b/i, `${id} decision`);
      assert.match(l.cart_pick, /\borganic\b/i, `${id} cart`);
    }
  }
});

test('C6 entries outside the batch deepEqual 6db979f; count and top-level keys unchanged', () => {
  const others = kb.entries.map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_6.has(e.id) && !CLEAN_PICK_7.has(e.id) && !CP9or10(e.id));
  nonEmpty(others, 'others', 154);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json unchanged; review headlines move only on the batch ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('6db979f:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]).reverse()); // first row per id wins: the main table, not the historical notes
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('6db979f:docs/do-lines-review.md'));
  nonEmpty([...baseRows.keys()], 'review rows', 150);
  assert.equal(liveRows.size, baseRows.size);
  let seen = 0;
  for (const [id, row] of baseRows) {
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

test('C8 every base tip and watch_out line is kept', () => {
  for (const id of IDS) {
    const l = live(id);
    nonEmpty(was(id).buying_tips, `${id} base tips`, 1);
    was(id).buying_tips.forEach((t, i) => assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`));
    (was(id).watch_out ?? []).forEach((t, i) => assert.ok((l.watch_out ?? []).includes(t), `${id} lost watch_out ${i}`));
  }
});

test('C9 each cart pick matches its own card', async () => {
  const carts = IDS.filter((id) => live(id).cart_pick);
  nonEmpty(carts, 'carts', 16);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = fresh();
  nonEmpty(all, 'fresh', 40);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 salt is iodized with no anti-caking agent; nutritional yeast ranks unfortified first; reach queries still land', async () => {
  const s = live('salt');
  for (const f of ['decision', 'cart_pick']) {
    assert.match(s[f], /iodized/i, `salt ${f} iodized`);
    assert.match(s[f], /no anti-caking/i, `salt ${f} anti-caking`);
  }
  const n = live('nutritional_yeast');
  assert.match(n.decision, /unfortified/i, 'yeast decision');
  assert.match(n.cart_pick, /unfortified/i, 'yeast cart');
  const last = n.watch_out.at(-1);
  assert.match(last, /fortified/i, 'yeast watch_out');
  assert.match(last, /second/i, 'yeast watch_out rank');
  assert.match(n.tier_note, /unfortified ranks first/, 'yeast tier_note');
  assert.doesNotMatch(n.tier_note, /never a ranking/, 'yeast tier_note old');
  nonEmpty(REACH, 'reach', 19);
  for (const [q, id] of REACH) {
    const got = idOf(await matchItemToCard(q));
    assert.equal(got, id, `${q} -> ${got}`);
  }
});
