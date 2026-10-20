import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { nonEmpty } from '../../lib/testGuards.js';
import { matchItemToCard } from '../../lib/listMatch.js';
import { CLEAN_PICK_3, CLEAN_PICK_4 } from './twoLinePin.js';

const LATER = new Set([...CLEAN_PICK_3, ...CLEAN_PICK_4]);

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const git = (ref) => execFileSync('git', ['show', ref], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
const kb = JSON.parse(readFileSync(new URL('../../kristy_perimeter_kb.json', import.meta.url), 'utf8'));
const base = JSON.parse(git('74237ce:server/kristy_perimeter_kb.json'));
const find = (k, id) => k.entries.find((e) => e.id === id);
const live = (id) => find(kb, id);
const was = (id) => find(base, id);
const words = (s) => s.trim().split(/\s+/).length;

const NEW_TIPS = {
  organic_worth_it_by_type: [[1, 'The USDA Organic seal on the sign or sticker is the standard to read.']],
  frozen_vs_fresh_produce: [[1, 'Frozen organic bags carry the same USDA Organic seal and rules as fresh.']],
  produce_seasonality: [[1, 'In-season organic produce carries the USDA Organic seal, fresh or frozen.']],
  sprouts_raw: [[1, 'Sprouts are eaten raw and whole, so the USDA Organic seal is the standard here.']],
  berries_picking: [[1, 'Berries are eaten whole, so the USDA Organic seal on the clamshell is the standard.']],
  produce_leafy_greens: [[1, 'Leaves are eaten whole, so the USDA Organic seal is the standard for greens.']],
  produce_peppers: [[1, 'The skin gets eaten, so the USDA Organic seal is the standard for peppers.']],
  produce_apples_pears: [[1, 'Apples and pears are eaten skin-on, so the USDA Organic seal is the standard.']],
  produce_stone_fruit: [[1, 'Stone fruit is eaten skin-on, so the USDA Organic seal is the standard here.']],
  produce_green_beans: [[1, 'The whole pod gets eaten, so the USDA Organic seal is the standard for beans.']],
  produce_root_vegetables: [[0, 'Potatoes rank high for residue in USDA testing, and the skin often gets eaten.'], [1, 'The USDA Organic seal on the bag is the standard for potatoes and carrots.']],
  produce_brassicas: [[0, 'Florets and leaves are eaten whole, with no peel to take surface residue away.'], [1, 'The USDA Organic seal is the standard for broccoli, cauliflower and cabbage.']],
  produce_onions_garlic: [[1, 'Organic onions and garlic are grown and certified to the USDA Organic standard.']],
  produce_citrus: [[1, 'Organic citrus carries the USDA Organic seal, which covers the peel used for zest.']],
  produce_mushrooms: [[1, 'Organic mushrooms carry the USDA Organic seal, loose or packed.']],
  produce_bananas: [[1, 'Organic bananas are grown and certified to the USDA Organic standard.']],
  label_organic_scope: [],
};

// Base tips that leave buying_tips and move, verbatim and in this order, to the end of detail.
const DROPPED = {
  organic_worth_it_by_type: [2, 3],
  produce_root_vegetables: [0],
  produce_brassicas: [0],
};
// Old tier notes that move to the end of detail, after any dropped tips.
const NOTE_DEMOTED = ['produce_root_vegetables', 'produce_brassicas', 'produce_onions_garlic', 'produce_citrus', 'produce_mushrooms', 'produce_bananas'];

const BECAME = {
  organic_worth_it_by_type: { decision: 'Organic produce, first on everything eaten skin-on.' },
  frozen_vs_fresh_produce: { decision: 'Plain organic frozen produce, picked ripe and frozen within hours.', cart_pick: 'Organic frozen vegetables' },
  produce_seasonality: { decision: 'Organic in-season produce, or frozen when out of season.' },
  sprouts_raw: { decision: 'Organic sprouts from the cold case, white roots, crisp stems.', cart_pick: 'Organic broccoli sprouts' },
  berries_picking: { cart_pick: 'Organic strawberries or blueberries' },
  produce_leafy_greens: { cart_pick: 'Organic spinach, kale, or lettuce' },
  produce_peppers: { cart_pick: 'Organic bell peppers' },
  produce_apples_pears: { cart_pick: 'Organic apples or pears' },
  produce_stone_fruit: { cart_pick: 'Organic peaches, plums, or cherries' },
  produce_green_beans: { cart_pick: 'Organic green beans' },
  produce_root_vegetables: {
    decision: 'Organic potatoes and carrots, firm, with nothing soft or sprouting.',
    cart_pick: 'Organic carrots and potatoes',
    tier_note: 'USDA testing ranks potatoes high for residue, and organic is the certified standard for both roots.',
  },
  produce_brassicas: {
    decision: 'Organic broccoli, cauliflower and cabbage, tight heads, no soft spots.',
    cart_pick: 'Organic broccoli, cauliflower, or cabbage',
    tier_note: 'Broccoli and cabbage are eaten without a peel, and organic heads are certified to the USDA standard.',
  },
  produce_onions_garlic: {
    decision: 'Organic onions and garlic, firm, with a dry neck.',
    cart_pick: 'Organic onions and garlic',
    tier_note: 'Onions and garlic grown to the USDA Organic standard carry the seal, papery skin and all.',
  },
  produce_citrus: {
    decision: 'Organic oranges, lemons and limes, firm with a smooth rind.',
    cart_pick: 'Organic oranges, lemons, or limes',
    tier_note: 'Zest goes in whole, and organic citrus is certified to the USDA Organic standard.',
  },
  produce_mushrooms: {
    decision: 'Organic mushrooms, dry and firm, with no dark spots.',
    cart_pick: 'Organic mushrooms',
    tier_note: 'Mushrooms get eaten whole, cap and stem, and organic ones carry the USDA Organic seal.',
  },
  produce_bananas: {
    decision: 'Organic bananas, green, to finish ripening on the counter.',
    cart_pick: 'Organic green bananas',
    tier_note: 'Organic bananas are certified to the USDA Organic standard and finish ripening on the counter the same way.',
  },
  label_organic_scope: {},
};

const NARROWED = 'Grown to the National Organic Program rules and certified, with no synthetic pesticides outside an approved list. Organic still allows some sprays: copper, spinosad and pyrethrins are approved ones.';

const IDS = Object.keys(BECAME);
const CARRY = {
  organic_worth_it_by_type: 'organic produce',
  frozen_vs_fresh_produce: 'organic frozen',
  produce_seasonality: 'organic in-season',
  sprouts_raw: 'organic sprouts',
  berries_picking: 'organic strawberries',
  produce_leafy_greens: 'organic spinach',
  produce_peppers: 'organic bell peppers',
  produce_apples_pears: 'organic apples',
  produce_stone_fruit: 'organic peaches',
  produce_green_beans: 'organic green beans',
  produce_root_vegetables: 'organic potatoes',
  produce_brassicas: 'organic broccoli',
  produce_onions_garlic: 'organic onions',
  produce_citrus: 'organic oranges',
  produce_mushrooms: 'organic mushrooms',
  produce_bananas: 'organic bananas',
  label_organic_scope: 'organic thin-skinned',
};
const DECISION_CHANGED = IDS.filter((id) => BECAME[id].decision);
const BANNED = /\b(health|healthy|healthier|safer|risk|cancer|disease|toxic|toxin|detox|pesticide-free|synthetic|price|cost|cheap|expensive)\b/i;

// Expected values computed from 74237ce plus the literals above.
function expected(id) {
  const b = structuredClone(was(id));
  const kept = b.buying_tips.filter((_, i) => !(DROPPED[id] || []).includes(i));
  for (const [at, s] of NEW_TIPS[id]) kept.splice(at, 0, s);
  const parts = (DROPPED[id] || []).map((i) => b.buying_tips[i]);
  if (NOTE_DEMOTED.includes(id)) parts.push(b.tier_note);
  const e = { ...b, ...BECAME[id], buying_tips: kept };
  if (parts.length) e.detail = `${b.detail} ${parts.join(' ')}`;
  if (id === 'organic_worth_it_by_type') {
    e.labels_decoded = structuredClone(b.labels_decoded);
    e.labels_decoded[0].meaning = NARROWED;
  }
  return e;
}

// Every string that is new at 74237ce, with the detail slice that was appended.
function written(id) {
  const b = was(id);
  const l = live(id);
  const out = [];
  for (const f of ['decision', 'cart_pick', 'tier_note']) if (l[f] && l[f] !== b[f]) out.push(l[f]);
  for (const t of l.buying_tips) if (!b.buying_tips.includes(t)) out.push(t);
  if (l.detail !== b.detail && l.detail.startsWith(b.detail)) out.push(l.detail.slice(b.detail.length));
  return out;
}

const idOf = (r) => r?.slug;

const LATER_2B = {
  organic_worth_it_by_type: ['short_answer', 'kristy_take', 'pick_steps', 'watch_out'],
  produce_bananas: ['short_answer', 'kristy_take', 'detail'],
};

nonEmpty(IDS, 'IDS', 17);

test('C1 the 17 B2 ids equal their final values; every other field is unchanged; the carrying phrase is present', () => {
  for (const id of IDS) {
    assert.ok(live(id), `${id} missing`);
    // clean-pick-2b owns these depth fields; cleanPick2b.test.js pins their values.
    const exp = expected(id);
    for (const f of LATER_2B[id] || []) exp[f] = live(id)[f];
    assert.deepEqual(live(id), exp, id);
    const l = live(id);
    const text = `${l.decision} ${l.cart_pick || ''}`.toLowerCase();
    assert.ok(text.includes(CARRY[id]), `${id} lacks "${CARRY[id]}"`);
  }
});

test('C2 decisions are at most 10 words and carts at most 46 characters', () => {
  for (const id of IDS) {
    const l = live(id);
    assert.ok(words(l.decision) <= 10, `${id} decision ${words(l.decision)} words`);
    if (l.cart_pick) assert.ok(l.cart_pick.length <= 46, `${id} cart ${l.cart_pick.length} chars`);
  }
});

test('C3 tips[0] is a why, not an imperative or the decision; tips[1] names organic', () => {
  for (const id of IDS) {
    const t = live(id).buying_tips;
    assert.doesNotMatch(t[0], /^(choose|pick|buy|read|check|look|skip|compare)\b/i, id);
    assert.notEqual(t[0], live(id).decision, id);
    assert.match(t[1], /organic/i, id);
  }
});

test('C4 no new text carries a banned word, first person, an em dash or a straight apostrophe', () => {
  const all = IDS.flatMap(written);
  nonEmpty(all, 'written', 30);
  for (const s of all) {
    assert.doesNotMatch(s, BANNED, s);
    assert.doesNotMatch(s, /\b(I|me|my|mine)\b/, s);
    assert.ok(!s.includes('—'), s);
    assert.ok(!s.includes("'"), s);
  }
  const m = live('organic_worth_it_by_type').labels_decoded[0].meaning;
  assert.equal(m, NARROWED);
  assert.doesNotMatch(m.replace(/\bsynthetic\b/, ''), BANNED);
});

test('C5 every B2 id names organic; outside the batch organic presence is unchanged', () => {
  const has = (e) => /organic/i.test(`${e.decision} ${e.cart_pick || ''}`);
  for (const id of IDS) assert.ok(has(live(id)), id);
  for (const e of kb.entries) if (!IDS.includes(e.id) && !LATER.has(e.id)) assert.equal(has(e), has(was(e.id)), e.id);
});

test('C6 entries outside the batch deepEqual 74237ce', () => {
  const others = kb.entries.filter((e) => !IDS.includes(e.id) && !LATER.has(e.id));
  nonEmpty(others, 'others', 159);
  assert.equal(kb.entries.length, base.entries.length);
  for (const e of others) assert.deepEqual(e, was(e.id), e.id);
});

test('C7 doLines.json unchanged; review headlines move only on decision-changed ids', () => {
  const now = JSON.parse(readFileSync(new URL('../../lib/doLines.json', import.meta.url), 'utf8'));
  assert.deepEqual(now, JSON.parse(git('74237ce:server/lib/doLines.json')));
  const rows = (txt) => new Map(txt.split('\n').filter((l) => l.startsWith('| `')).map((l) => [l.split('`')[1], l]).reverse()); // first row per id wins: the main table, not the historical notes
  const liveRows = rows(readFileSync(new URL('../../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  const baseRows = rows(git('74237ce:docs/do-lines-review.md'));
  nonEmpty([...baseRows.keys()], 'review rows', 150);
  assert.equal(liveRows.size, baseRows.size);
  let seen = 0;
  for (const [id, row] of baseRows) {
    if (LATER.has(id)) continue;
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

test('C8 every base tip is kept or demoted into detail', () => {
  for (const id of IDS) {
    const l = live(id);
    was(id).buying_tips.forEach((t, i) => {
      if ((DROPPED[id] || []).includes(i)) assert.ok(l.detail.includes(t), `${id} dropped tip ${i} not in detail`);
      else assert.ok(l.buying_tips.includes(t), `${id} lost tip ${i}`);
    });
  }
});

test('C9 each cart pick matches its own card', async () => {
  const carts = IDS.filter((id) => live(id).cart_pick);
  nonEmpty(carts, 'carts', 15);
  for (const id of carts) {
    const got = idOf(await matchItemToCard(live(id).cart_pick));
    assert.equal(got, id, `${live(id).cart_pick} -> ${got}`);
  }
});

test('C10 no new string sits on more than 2 entries', () => {
  const fresh = IDS.flatMap((id) => {
    const b = was(id);
    const l = live(id);
    const out = [];
    for (const f of ['decision', 'cart_pick', 'tier_note']) if (l[f] && l[f] !== b[f]) out.push(l[f]);
    for (const t of l.buying_tips) if (!b.buying_tips.includes(t)) out.push(t);
    return out;
  });
  nonEmpty(fresh, 'fresh', 30);
  for (const s of fresh) {
    const n = kb.entries.filter((e) => [e.decision, e.cart_pick, e.tier_note, ...(e.buying_tips || [])].includes(s)).length;
    assert.ok(n <= 2, `${s} on ${n} entries`);
  }
});

test('C11 no B2 decision says conventional', () => {
  for (const id of IDS) assert.doesNotMatch(live(id).decision, /conventional/i, id);
});
