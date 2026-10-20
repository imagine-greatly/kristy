// swap-picks-1: sourced, gentle list nudges; cards keep their own cart picks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { matchItemToCard, matchItemToPick, attachCards } from '../../lib/listMatch.js';
import { lintPick } from '../../lib/counterCardLint.js';
import { nonEmpty } from '../../lib/testGuards.js';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const BASE = '58d61608ce617596647c7df8ed2f84d6215911e3';
const kb = JSON.parse(readFileSync(join(ROOT, 'server/kristy_perimeter_kb.json'), 'utf8'));
const before = JSON.parse(execFileSync('git', ['show', `${BASE}:server/kristy_perimeter_kb.json`], {
  cwd: ROOT, encoding: 'utf8',
}));
const entries = nonEmpty(kb.entries, 'current corpus');
const original = nonEmpty(before.entries, 'base corpus');
const entry = (id) => {
  const found = entries.find((e) => e.id === id);
  assert.ok(found, `${id} missing`);
  return found;
};
const CARD_ALIASES = nonEmpty([
  ['white bread', 'sandwich_bread', 'Short-list whole wheat sandwich bread'],
  ['pancake syrup', 'maple_syrup', 'Pure maple syrup, any grade'],
], 'new card aliases', 2);
// Explicit row and source inventories keep omitted items from passing silently.
const SWAPS = nonEmpty([
  ['pick_artificial_sweetener', ['artificial sweetener', 'artificial sweeteners', 'sweetener packet', 'sweetener packets'], ['sugars', 'maple_syrup'], 'bulk_pantry'],
  ['pick_margarine', ['margarine', 'margarines', 'vegetable spread', 'vegetable spreads'], ['grassfed_butter', 'plant_butter'], 'dairy'],
  ['pick_shortening', ['shortening', 'shortenings'], ['lard_tallow'], 'bulk_pantry'],
  ['pick_soda', ['soda', 'sodas', 'diet soda', 'diet sodas', 'soft drink', 'soft drinks'], ['bottled_water_buying', 'kombucha'], 'bulk_pantry'],
  ['pick_sports_drink', ['sports drink', 'sports drinks'], ['coconut_water'], 'bulk_pantry'],
  ['pick_energy_drink', ['energy drink', 'energy drinks'], ['tea'], 'bulk_pantry'],
  ['pick_fruit_snacks', ['fruit snack', 'fruit snacks'], ['dried_fruit'], 'bulk_pantry'],
  ['pick_whipped_topping', ['whipped topping', 'whipped toppings'], ['cream_vs_creamer'], 'dairy'],
], 'swap inventory', 8);
const NEW_IDS = new Set(SWAPS.map(([id]) => id));
const NEGATIVES = nonEmpty([
  'baking soda', 'club soda', 'chocolate chips', 'cookie sheet', 'white bread flour',
  'bread flour', 'pancake mix', 'dressing', 'soda bread', 'cooking spray',
  'vegetable broth', 'salad greens', 'candy thermometer',
], 'negative rows', 13);
const CARRIED = nonEmpty([
  ['ranch dressing', 'The specified oil and vinegar cards do not author a dressing choice.'],
  ['salad dressing', 'The specified oil and vinegar cards do not author a dressing choice.'],
  ['candy', 'No card plainly supports a same-use candy choice.'],
  ['cookies', 'No card plainly supports a same-use cookie choice.'],
  ['instant noodles', 'No card plainly supports a same-use instant noodle choice.'],
  ['chips', 'The bare word is ambiguous, including chocolate chips; never add it as an alias.'],
], 'reasoned carries', 6);

for (const [name, id, cartPick] of CARD_ALIASES) {
  test(`swap-picks-1: ${name} attaches ${id} and its existing cart pick`, () => {
    assert.equal(matchItemToCard(name)?.slug, id);
    assert.equal(entry(id).cart_pick, cartPick);
    assert.equal(matchItemToPick(name), null);
  });
}

for (const [id, rows] of SWAPS) {
  for (const name of nonEmpty(rows, `${id} rows`)) {
    test(`swap-picks-1: ${name} gets ${id} without removing the row`, () => {
      assert.equal(matchItemToCard(name), null);
      const pick = matchItemToPick(name);
      assert.equal(pick?.id, id);
      assert.match(pick.line, /^Look for /);
      assert.equal(pick.line, entry(id).decision);
      const attached = attachCards({ items: [{ name, source: 'user' }] }, { log: false });
      assert.equal(attached.items.length, 1);
      assert.equal(attached.items[0].name, name);
      assert.equal(attached.items[0].source, 'user');
      assert.equal(attached.items[0].pickId, id);
      assert.equal(attached.items[0].pickLine, pick.line);
      assert.equal(attached.items[0].cardSlug, undefined);
    });
  }
}

test('swap-picks-1: sweetener label card is outside the list aisle path', () => {
  assert.equal(entry('label_sugar_free_substitutes').category, 'label_terms');
  assert.equal(matchItemToCard('artificial sweetener'), null);
  assert.equal(matchItemToCard('sweetener packets'), null);
});

test('swap-picks-1: negatives never attach a new pick or either new card alias', () => {
  const newAliasCards = new Set(CARD_ALIASES.map(([, id]) => id));
  for (const name of NEGATIVES) {
    assert.ok(!NEW_IDS.has(matchItemToPick(name)?.id), name);
    assert.ok(!newAliasCards.has(matchItemToCard(name)?.slug), name);
  }
  // Club soda is already a different water product. No "club" alias means the
  // whole-row coverage guard keeps this swap silent instead of nudging it again.
  assert.equal(matchItemToCard('club soda'), null);
  assert.equal(matchItemToPick('club soda'), null);
  assert.equal(matchItemToCard('white bread flour')?.slug, 'flour_basics');
  assert.equal(matchItemToCard('bread flour')?.slug, 'flour_basics');
});

test('swap-picks-1: reasoned carries stay without guidance', () => {
  for (const [name, reason] of CARRIED) {
    assert.ok(reason.length > 20, name);
    assert.equal(matchItemToCard(name), null, name);
    assert.equal(matchItemToPick(name), null, name);
  }
});

// Same recursive walk and URL extraction as t6_3.test.js; no network needed.
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const ARCHIVE = nonEmpty(walk(join(ROOT, 'docs/sources')), 'source archive', 10)
  .map((p) => readFileSync(p, 'utf8')).join('\n');
const urls = (e) => (e.sources || []).flatMap((s) =>
  (typeof s === 'string' ? s : s?.url || '').match(/https?:\/\/[^\s]+/g) || []);

test('swap-picks-1: every new source is copied verbatim and every URL is archived', () => {
  for (const [id, , sourceIds] of SWAPS) {
    const allowed = nonEmpty(sourceIds, `${id} source cards`).flatMap((sourceId) =>
      nonEmpty(entry(sourceId).sources, `${sourceId} sources`));
    // Unsourced strings (no URL) fail PICK_SOURCE_NO_URL, so only URL-bearing sources carry over.
    if (id === 'pick_margarine') assert.deepEqual(entry(id).sources, allowed.filter((s) => /https?:/.test(typeof s === 'string' ? s : s.url)), 'butter sources precede plant butter sources');
    for (const source of nonEmpty(entry(id).sources, `${id} sources`)) {
      // deepEqual accepts strings and full citation objects without normalizing either.
      assert.ok(allowed.some((candidate) => {
        try { assert.deepEqual(source, candidate); return true; } catch { return false; }
      }), `${id}: source is not verbatim from its named cards`);
    }
    for (const url of nonEmpty(urls(entry(id)), `${id} URLs`)) {
      assert.ok(ARCHIVE.includes(url), `${id}: unarchived URL ${url}`);
    }
  }
});

test('swap-picks-1: new picks follow the existing shape, copy rules and alias inventory', () => {
  for (const [id, aliases, , category] of SWAPS) {
    const pick = entry(id);
    assert.equal(pick.kind, 'pick');
    assert.equal(pick.category, category);
    assert.deepEqual(pick.aliases, aliases);
    assert.deepEqual(Object.keys(pick).sort(), ['id', 'kind', 'title', 'category', 'aliases', 'decision', 'sources'].sort());
    assert.deepEqual(lintPick(pick), [], id);
    assert.match(pick.decision, /^Look for /);
    for (const line of nonEmpty([pick.decision, pick.avoid].filter(Boolean), `${id} copy`)) {
      assert.doesNotMatch(line, /\b(I|me|my)\b|—|\$|price|cheap|healthier|safer|lowers|prevents|causes|toxic|bad for you/i, id);
      assert.doesNotMatch(line, /\b(cost|costs|expensive|affordable|budget|cool whip)\b/i, id);
      assert.ok(line.trim().split(/\s+/).length <= 20, `${id}: over 20 words`);
    }
  }
});

test('swap-picks-1: the 30 original picks and all original cards remain unchanged except two aliases', () => {
  const oldPicks = nonEmpty(original.filter((e) => e.kind === 'pick'), 'original picks', 30);
  assert.equal(oldPicks.length, 30);
  for (const pick of oldPicks) assert.deepEqual(entry(pick.id), pick, pick.id);
  for (const card of nonEmpty(original.filter((e) => e.kind !== 'pick'), 'original cards')) {
    const additions = CARD_ALIASES.filter(([, id]) => id === card.id).map(([alias]) => alias);
    const expected = additions.length ? { ...card, aliases: [...card.aliases, ...additions] } : card;
    assert.deepEqual(entry(card.id), expected, card.id);
  }
  const oldIds = new Set(original.map((e) => e.id));
  assert.deepEqual(entries.filter((e) => !oldIds.has(e.id)).map((e) => e.id).sort(), [...NEW_IDS].sort());
  assert.equal(new Set(entries.map((e) => e.id)).size, entries.length, 'duplicate corpus ids');
  const { entries: ignoredCurrent, ...metadata } = kb;
  const { entries: ignoredBase, ...oldMetadata } = before;
  assert.deepEqual(metadata, oldMetadata);
});
