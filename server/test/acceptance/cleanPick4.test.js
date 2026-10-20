// clean-pick-4 (Devon 2026-10-20): B5 bread and grains name each item’s own cleanest version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { CLEAN_PICK_5, CLEAN_PICK_6, CLEAN_PICK_7, CLEAN_PICK_9, CLEAN_PICK_10, preCleanPick11, preCleanPick12, preCleanPick8, CLEAN_PICK_8 } from './twoLinePin.js';

// clean-pick-10 owns its ids now; this batch skips them like the clean-pick-9 ids.
const CP9or10 = (id) => CLEAN_PICK_9.has(id) || CLEAN_PICK_10.has(id);

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
import { preT6_3 } from './twoLinePin.js';
kb.entries = kb.entries.map(preT6_3); // t6-3: pantry pins read 6d6ca49; t6_3.test.js owns live copy.
import { preT6_1, preT6_2 } from "./twoLinePin.js";
kb.entries = kb.entries.map(preT6_2); // t6-2: dairy/egg pins read ca32bef; t6_2.test.js owns live copy.
kb.entries = kb.entries.map(preT6_1); // t6-1: the 15 meat/seafood cards read as of 85c399e; t6_1.test.js owns them now
const base = JSON.parse(git('f488733:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => preCleanPick12(find(kb, id));
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;

const BECAME = {
  sourdough: { decision: 'Whole wheat sourdough: flour, water, salt and a starter.', cart_pick: 'Whole wheat sourdough bread', tip1: 'Look for whole wheat flour as the first ingredient, ahead of any white flour.', std: /whole wheat flour as the first ingredient/, carry: /whole wheat/i },
  bagels: { decision: 'Whole wheat bagels, boiled before the oven, ingredients named.', cart_pick: 'Whole wheat boiled bakery bagels', alias_add: 'whole wheat bagels', tip1: 'Look for whole wheat flour on the bag, named before any other flour.', std: /whole wheat flour on the bag/, carry: /whole wheat/i },
  breakfast_cereal: { decision: 'Unfortified whole-grain cereal or granola, less added sugar, no dyes.', cart_pick: 'Unfortified whole-grain breakfast cereal', tip1: 'Look for a grain list with no added vitamins or minerals below it.', watch_add: 'A fortified cereal comes second, behind one with no vitamins or minerals added.', std: /no added vitamins or minerals/, carry: /unfortified/i },
  gluten_free_bread: { decision: 'Gluten-free bread with its flours named and the fewest gums.', cart_pick: 'Short-list gluten-free bread', tip1: 'Look for a single gum binder, such as xanthan gum, not two or more.', std: /single gum/, carry: /fewest gums|single gum/i },
  buns_rolls: { decision: 'Whole wheat buns and rolls with no added sugar.', tip1: 'Look for a list with no sugar or soybean oil after the whole wheat flour.', std: /no sugar or soybean oil/, carry: /no added sugar/i },
  pastries_muffins: { decision: 'All-butter bakery pastries, no shortening or hydrogenated oil.', cart_pick: 'All-butter bakery pastries', tip1: 'Look for butter as the only fat, with no shortening or hydrogenated oil.', std: /only fat/, carry: /all-butter/i },
  crackers: { decision: 'Whole grain crackers with olive oil, coconut oil or butter.', cart_pick: 'Short-list whole grain crackers', tip1: 'Look for whole grain flour, olive oil and salt, and little else, on the list.', std: /whole grain flour, olive oil and salt/, carry: /whole grain/i },
  pretzels: { decision: 'Whole wheat pretzels with a short ingredient list.', cart_pick: 'Whole wheat pretzel twists', tip1: 'Look for whole wheat flour, not enriched flour, at the top of the list.', std: /not enriched flour/, carry: /whole wheat/i },
  fresh_pasta: { decision: 'Fresh pasta of flour and egg, with nothing added.', cart_pick: 'Additive-free fresh egg pasta', tip1: 'Look for flour and egg alone, with no ascorbic or citric acid added.', std: /flour and egg alone/, carry: /nothing added|additive-free/i },
};
const IDS = Object.keys(BECAME);
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;
const TREATMENT = /\b(causes?|prevents?|lowers? (the )?risk|carcinogen|cancer|tumou?rs?|toxic|unsafe|harm\w*|risks?|linked to|hyperactiv|behaviou?r|attention|neurobehavioral|exacerbate)/i;
const REACH = [['pretzel sticks', 'pretzels'], ['pretzel twists', 'pretzels'], ['sourdough crackers', 'crackers'], ['sourdough bread', 'sourdough'], ['whole wheat bagels', 'bagels'], ['granola', 'breakfast_cereal']];
const idOf = (r) => r?.slug;

// Expected entry: the f488733 entry plus the BECAME fields, computed the way the Change section states.
function expected(id) {
  const w = structuredClone(was(id));
  const b = BECAME[id];
  const e = { ...w, buying_tips: [w.buying_tips[0], b.tip1, ...w.buying_tips.slice(1)] };
  for (const f of ['decision', 'cart_pick']) if (b[f]) e[f] = b[f];
  if (b.watch_add) e.watch_out = [...(w.watch_out ?? []), b.watch_add];
  if (b.alias_add) e.aliases = [...w.aliases, b.alias_add];
  return e;
}

// Every new string the batch writes into a field shoppers see.
const fresh = () => IDS.flatMap((id) => {
  const b = BECAME[id];
  return [b.decision, b.cart_pick, b.tip1, b.watch_add].filter(Boolean);
});

nonEmpty(IDS, 'IDS', 9);

test('C1 the 9 ids equal their expected entries and carry their phrase', () => {
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

test('C4 no new text carries a banned or treatment word, a dash, a straight apostrophe or first person', () => {
  const all = fresh();
  nonEmpty(all, 'written', 25);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, TREATMENT, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine|we|our|us)\b/, s);
    assert.ok(!s.includes('—') && !s.includes('–'), s);
    assert.ok(!s.includes("'"), s);
  }
});

test('C5 no bread or grain front names organic', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.doesNotMatch(`${l.decision} ${l.cart_pick || ''}`, /\borganic\b/i, id);
  }
});

test('C6 entries outside the batch deepEqual f488733; count and top-level keys unchanged', () => {
  const others = kb.entries.map(preCleanPick8).map(preCleanPick12).map(preCleanPick11).filter((e) => !IDS.includes(e.id) && !CLEAN_PICK_5.has(e.id) && !CLEAN_PICK_6.has(e.id) && !CLEAN_PICK_7.has(e.id) && !CP9or10(e.id));
  nonEmpty(others, 'others', 145);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
  assert.deepEqual(Object.keys(kb).sort(), Object.keys(base).sort());
  for (const k of Object.keys(base)) if (k !== 'entries') assert.deepEqual(kb[k], base[k], k);
});

test('C7 doLines.json unchanged; review headlines move only on the batch ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('f488733:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]).reverse()); // first row per id wins: the main table, not the historical notes
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('f488733:docs/do-lines-review.md'));
  nonEmpty([...baseRows.keys()], 'review rows', 150);
  assert.equal(liveRows.size, baseRows.size);
  let seen = 0;
  for (const [id, row] of baseRows) {
    if (CLEAN_PICK_5.has(id)) continue;
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
  nonEmpty(carts, 'carts', 9);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const all = fresh();
  nonEmpty(all, 'fresh', 25);
  for (const s of all) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || []), ...(e.watch_out || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 cereal: unfortified is the pick and fortified ranks second; reach queries still land', async () => {
  const l = live('breakfast_cereal');
  assert.match(l.decision, /unfortified/i, 'decision');
  assert.match(l.cart_pick, /unfortified/i, 'cart');
  const last = l.watch_out.at(-1);
  assert.match(last, /fortified/i, 'watch_out');
  assert.match(last, /second/i, 'watch_out rank');
  nonEmpty(REACH, 'reach', 6);
  for (const [q, id] of REACH) {
    const got = idOf(await matchItemToCard(q));
    assert.equal(got, id, `${q} -> ${got}`);
  }
});
