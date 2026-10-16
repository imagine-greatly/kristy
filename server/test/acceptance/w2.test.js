// W2: the produce rule belongs to the section; grocery rows reach food families.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import kb from '../../kristy_perimeter_kb.json' with { type: 'json' };
import tips from '../../lib/sectionRules.json' with { type: 'json' };
import { nonEmpty } from '../../lib/testGuards.js';
import { attachCards, collapseByCard, matchItemToCard } from '../../lib/listMatch.js';
import { answerCounterQuestion } from '../../lib/counterAskPipeline.js';
import { kindFor } from '../../lib/counterCards.js';
import { lintSections } from '../../lib/counterCardLint.js';

const entries = nonEmpty(kb.entries, 'W2 corpus');
const byId = (id) => {
  const entry = entries.find((e) => e.id === id);
  assert.ok(entry, `${id} missing`);
  return entry;
};
const ITEM_ALIASES = nonEmpty([
  'onions', 'onion', 'kiwi', 'kiwis', 'potatoes', 'potato', 'apples', 'apple',
  'grapes', 'leafy greens', 'kale', 'spinach', 'lettuce',
], 'W2 item aliases', 13);
const FAMILIES = nonEmpty([
  ['produce_apples_pears', ['apples', 'apple']],
  ['produce_onions_garlic', ['onions', 'onion']],
  ['produce_root_vegetables', ['potatoes', 'potato']],
  ['produce_leafy_greens', ['leafy greens', 'kale', 'spinach', 'lettuce']],
], 'W2 family owners', 4);

test('W2 organic question card carries no grocery item aliases', () => {
  const aliases = nonEmpty(byId('organic_worth_it_by_type').aliases, 'organic question aliases');
  for (const alias of ITEM_ALIASES) assert.ok(!aliases.includes(alias), `organic hub owns ${alias}`);
});

test('W2 each moved noun reaches its family, including lettuce rather than home technique', () => {
  for (const [id, nouns] of FAMILIES) {
    const aliases = nonEmpty(byId(id).aliases, `${id} aliases`);
    for (const noun of nonEmpty(nouns, `${id} grocery nouns`)) {
      assert.ok(aliases.includes(noun), `${id} lacks ${noun}`);
      assert.equal(matchItemToCard(noun)?.slug, id, noun);
    }
  }
  assert.equal(kindFor('revive_greens'), 'home');
  assert.ok(!nonEmpty(byId('revive_greens').aliases, 'revival aliases').includes('lettuce'));
});

test('W2 eight produce rows collapse to five family cards without losing foods', () => {
  const names = nonEmpty([
    'apples', 'onions', 'potatoes', 'kale', 'spinach', 'blueberries', 'strawberries', 'raspberries',
  ], 'W2 grocery list', 8);
  const list = attachCards({ items: names.map((name) => ({ name, source: 'user', category: 'Produce' })) }, { log: false });
  const rows = nonEmpty(list.items, 'W2 attached rows', 8);
  const groups = nonEmpty(collapseByCard(rows), 'W2 collapsed cards', 5);
  assert.deepEqual(groups.map(({ slug, items }) => [slug, items.map((i) => i.name)]), [
    ['produce_apples_pears', ['apples']],
    ['produce_onions_garlic', ['onions']],
    ['produce_root_vegetables', ['potatoes']],
    ['produce_leafy_greens', ['kale', 'spinach']],
    ['berries_picking', ['blueberries', 'strawberries', 'raspberries']],
  ]);
  for (const row of rows) assert.notEqual(row.cardSlug, 'organic_worth_it_by_type');
});

test('W2 counter still answers is organic worth it from the organic card', async () => {
  // Keep the pipeline's usage-count bookkeeping in memory.
  const offline = {
    from() {
      let chain;
      chain = new Proxy({}, {
        get: (_, key) => key === 'then'
          ? (resolve) => Promise.resolve({ data: [], error: null }).then(resolve)
          : () => chain,
      });
      return chain;
    },
  };
  const out = await answerCounterQuestion({
    query: 'is organic worth it', allowGeneration: false,
    client: offline,
  });
  assert.equal(out.matched, true);
  assert.equal(out.card?.slug, 'organic_worth_it_by_type');
  assert.equal(out.source, 'curated');
});

test('W2 grapes and kiwi remain honest misses in the produce section', () => {
  const names = nonEmpty(['grapes', 'grape', 'kiwi', 'kiwis'], 'W2 uncovered fruit', 4);
  const list = attachCards({ items: names.map((name) => ({ name, source: 'user', category: 'Produce' })) }, { log: false });
  for (const group of nonEmpty(collapseByCard(list.items), 'W2 uncovered groups', 4)) {
    assert.equal(group.slug, null);
    assert.equal(group.section, 'produce');
    for (const row of nonEmpty(group.items, 'W2 uncovered rows')) assert.equal(row.pickId, undefined);
  }
});

test('W2 produce fronts leave the skin rule in the section and have distinct openers', () => {
  const produce = nonEmpty(entries.filter((e) => e.category === 'produce' && e.kind !== 'pick'), 'W2 produce cards');
  const sectionTips = nonEmpty(tips.filter((t) => t.section === 'produce'), 'W2 produce section');
  assert.equal(sectionTips[0].rule, 'Organic on anything you eat the skin of.');
  assert.deepEqual(lintSections(sectionTips, produce), []);
  const openers = new Map();
  for (const e of produce) {
    assert.ok(e.decision?.trim(), `${e.id} has no decision`);
    assert.ok(!(/organic/i.test(e.decision) && /skin/i.test(e.decision)), `${e.id}: organic + skin front`);
    const opener = e.decision.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).slice(0, 3).join(' ');
    assert.ok(!openers.has(opener), `${e.id} shares opener with ${openers.get(opener)}`);
    openers.set(opener, e.id);
  }
});

test('W2 changes only named produce aliases and fronts, preserving claims and card count', () => {
  const before = JSON.parse(execFileSync('git', ['show', '9fea1ee:server/kristy_perimeter_kb.json'], {
    cwd: fileURLToPath(new URL('../../../', import.meta.url)), maxBuffer: 64 << 20,
  }).toString());
  const oldEntries = nonEmpty(before.entries, 'W2 baseline corpus');
  const decisions = {
    organic_worth_it_by_type: 'Organic for produce eaten whole; conventional for produce you peel.',
    produce_onions_garlic: 'Conventional onions and garlic: firm, dry, papery skins, with no sprouts or mold.',
    produce_stone_fruit: 'Organic peaches, plums, nectarines and cherries, unbruised, with color fully turned.',
    produce_mushrooms: 'Conventional mushrooms, dry and firm, with no dark spots.',
  };
  const moved = new Map(FAMILIES);
  const expected = oldEntries.map((old) => {
    const e = structuredClone(old);
    if (e.id === 'organic_worth_it_by_type') e.aliases = e.aliases.filter((a) => !ITEM_ALIASES.includes(a));
    if (e.id === 'revive_greens') e.aliases = e.aliases.filter((a) => a !== 'lettuce');
    const added = (moved.get(e.id) || []).filter((a) => !e.aliases.includes(a));
    if (added.length) e.aliases = [...added, ...e.aliases];
    if (decisions[e.id]) e.decision = decisions[e.id];
    return e;
  });
  assert.deepEqual(kb, { ...before, entries: expected });
  assert.equal(entries.filter((e) => e.kind !== 'pick').length, 181);
});
