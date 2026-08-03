// The list → card matcher, pinned.
//
// The claims worth a test here are the ones that were decisions rather than mechanics:
// there is ONE matcher and this is it, a home card never attaches, a miss is honest, the
// stamp makes it idempotent, and frozen is a location rule sitting on top of a knowledge
// match rather than a second matcher.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  matchItemToCard,
  attachCards,
  collapseByCard,
  groupForWalk,
  sectionForItem,
  LIST_SECTIONS,
} from './listMatch.js';
import { sanitizeList } from './cartEdit.js';
import { kindFor } from './counterCards.js';
import { nonEmpty } from './testGuards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const item = (name, over = {}) => ({ id: 'x', name, category: 'Added', checked: false, source: 'user', ...over });

/* ═══════════════ One matcher, not two ═══════════════ */

test('retrieval is scoreEntries — this module defines no scoring of its own', () => {
  const src = readFileSync(join(__dirname, 'listMatch.js'), 'utf8');
  assert.match(src, /import \{ scoreEntries \} from '\.\/perimeter\.js'/);
  // The two shapes a second matcher would have to take. Either would mean the list and the
  // ask could answer the same words differently, which is the thing the constraint forbids.
  assert.equal(/\baliases\b\s*\.\s*(some|filter|map)/.test(src), false, 'no private alias walk');
  assert.equal(/score\s*\+=/.test(src), false, 'no private scoring');
});

test('the scope gate is deliberately NOT consulted', () => {
  const src = readFileSync(join(__dirname, 'listMatch.js'), 'utf8');
  assert.equal(/from '\.\/counterScope\.js'/.test(src), false);
  // And the reason is recorded, because the next person will assume it was an oversight.
  assert.match(src, /WHY THE SCOPE GATE IS SKIPPED/);
});

/* ═══════════════ Bare nouns are the whole input ═══════════════ */

test('a bare noun with no question around it matches', () => {
  const cases = nonEmpty(
    [
      ['blueberries', 'berries_picking'],
      ['whole milk', 'whole_vs_reduced_fat_milk'],
      ['olive oil', 'olive_oil_grades'],
      ['ground beef', 'ground_beef_lean_ratio'],
      ['greek yogurt', 'yogurt_plain_vs_flavored'],
    ],
    'bare-noun cases'
  );
  for (const [name, slug] of cases) {
    const hit = matchItemToCard(name);
    assert.ok(hit, `"${name}" should match a card`);
    assert.equal(hit.slug, slug, `"${name}" -> ${hit.slug}, expected ${slug}`);
  }
});

test('the three list-surface aliases landed and still resolve', () => {
  // These were authored FROM the list item, not from the card's vocabulary — the defect
  // that had shipped five times running. Pinned so a corpus edit cannot quietly undo them.
  for (const [name, slug] of [
    ['tomatoes', 'produce_ripeness_by_item'],
    ['almonds', 'nuts_raw_vs_roasted'],
    ['cheddar', 'cheese_real_vs_processed'],
  ]) {
    assert.equal(matchItemToCard(name)?.slug, slug, `"${name}" must reach ${slug}`);
  }
});

test('a non-grocery matches nothing, and the gate is what refuses it', () => {
  for (const name of ['paper towels', 'dish soap', 'ketchup', 'pasta sauce', 'cereal']) {
    assert.equal(matchItemToCard(name), null, `"${name}" must not attach a card`);
  }
});

test('bacon is an honest miss, on purpose', () => {
  // deli_meat_uncured answers the UNCURED question — the celery-powder asterisk — which is
  // half an answer for someone who wrote "bacon" on a list. A half-right card is worse than
  // a miss, because the miss gets logged and the half-right one does not.
  assert.equal(matchItemToCard('bacon'), null);
  assert.ok(matchItemToCard('uncured bacon'), 'the question it DOES answer still resolves');
});

/* ═══════════════ Home cards never attach ═══════════════ */

test('a kitchen-technique card never attaches to a list item', () => {
  // "lettuce" matches revive_greens outright: a true card, and the wrong answer to someone
  // standing in produce deciding what to buy. Same category error as an add-to-cart button
  // on a technique card, one step earlier.
  const hit = matchItemToCard('lettuce');
  if (hit) assert.notEqual(kindFor(hit.slug), 'home', 'a home card reached a list row');
});

test('a home card is fallen THROUGH, not failed on', () => {
  // The distinction that matters: if the leader is a home card we keep looking rather than
  // returning null, so a shelf card ranked second still gets its row.
  const src = readFileSync(join(__dirname, 'listMatch.js'), 'utf8');
  assert.match(src, /for \(const c of scoreEntries/, 'it must iterate candidates, not take [0]');
  assert.match(src, /kindFor\(c\.entry\.id\) === 'home'\) continue/);
});

/* ═══════════════ Attachment is idempotent ═══════════════ */

test('every inspected row is stamped, including the ones that matched nothing', () => {
  const list = sanitizeList({ items: [item('blueberries'), item('paper towels')] });
  const out = attachCards(list, { log: false });
  assert.equal(out.items.length, 2);
  for (const it of out.items) assert.equal(it.carded, true, `${it.name} must be stamped`);
  assert.equal(out.items[0].cardSlug, 'berries_picking');
  assert.equal(out.items[1].cardSlug, undefined, 'a miss carries no slug');
});

test('a second pass is a no-op and returns the SAME object', () => {
  const list = sanitizeList({ items: [item('blueberries'), item('paper towels')] });
  const once = attachCards(list, { log: false });
  const twice = attachCards(once, { log: false });
  assert.equal(twice, once, 'nothing changed, so nothing should be rebuilt or re-logged');
});

test('the stamp survives sanitizeList, or the gap log becomes a visit counter', () => {
  const out = attachCards(sanitizeList({ items: [item('blueberries')] }), { log: false });
  const round = sanitizeList(out);
  assert.equal(round.items[0].carded, true);
  assert.equal(round.items[0].cardSlug, 'berries_picking');
  assert.equal(round.items[0].cardSection, 'produce');
});

test('scanned and swap rows are never carded', () => {
  const list = sanitizeList({
    items: [
      item('Chobani yogurt', { source: 'scan', tier: 'approved' }),
      item('Swap out: Wonder Bread', { source: 'swap', productName: 'Wonder Bread' }),
    ],
  });
  const out = attachCards(list, { log: false });
  for (const it of out.items) {
    assert.equal(it.cardSlug, undefined, `${it.source} row must carry no card`);
    assert.equal(it.carded, undefined, `${it.source} row must not even be stamped`);
  }
});

/* ═══════════════ Collapse ═══════════════ */

test('two items on one card render the card once, with both named', () => {
  const list = attachCards(
    sanitizeList({ items: [item('blueberries'), item('strawberries'), item('olive oil')] }),
    { log: false }
  );
  const groups = collapseByCard(list.items);
  const berries = groups.find((g) => g.slug === 'berries_picking');
  assert.ok(berries, 'the shared card must be present');
  assert.equal(berries.items.length, 2);
  assert.deepEqual(berries.items.map((i) => i.name), ['blueberries', 'strawberries']);
  assert.equal(groups.filter((g) => g.slug === 'berries_picking').length, 1, 'rendered once');
});

test('a collapse never moves a row past its earliest sibling', () => {
  const list = attachCards(
    sanitizeList({ items: [item('blueberries'), item('olive oil'), item('strawberries')] }),
    { log: false }
  );
  const groups = collapseByCard(list.items);
  assert.equal(groups[0].slug, 'berries_picking', 'the group takes the first claimant’s slot');
  assert.equal(groups[1].slug, 'olive_oil_grades');
});

/* ═══════════════ Walking order ═══════════════ */

test('label_terms is not a cart section', () => {
  assert.equal(LIST_SECTIONS.some((s) => s.id === 'label_terms'), false);
});

test('frozen is a LOCATION rule that overrides the card’s knowledge section', () => {
  // frozen_vs_fresh_produce is a produce card, correctly — it is about produce. But nobody
  // walks to produce for frozen peas, and leaving it there split one freezer across two
  // places on the same list.
  const hit = matchItemToCard('frozen vegetables');
  assert.equal(hit?.section, 'produce', 'the card itself stays filed under knowledge');
  assert.equal(
    sectionForItem({ name: 'frozen vegetables', cardSection: 'produce' }),
    'frozen',
    'but the row walks to the freezer'
  );
});

test('an unmatched row falls to the trailing group rather than inventing a section', () => {
  assert.equal(sectionForItem({ name: 'paper towels' }), null);
  const walk = groupForWalk(
    attachCards(sanitizeList({ items: [item('blueberries'), item('paper towels')] }), { log: false }).items
  );
  const last = walk[walk.length - 1];
  assert.equal(last.id, null);
  assert.equal(last.title, 'Everything else');
  assert.equal(last.rows[0].items[0].name, 'paper towels');
});

test('sections come out in walking order, perimeter first and frozen last', () => {
  const walk = groupForWalk(
    attachCards(
      sanitizeList({
        items: [item('olive oil'), item('frozen vegetables'), item('salmon'), item('blueberries')],
      }),
      { log: false }
    ).items
  );
  assert.deepEqual(walk.map((s) => s.id), ['produce', 'seafood', 'bulk_pantry', 'frozen']);
});
