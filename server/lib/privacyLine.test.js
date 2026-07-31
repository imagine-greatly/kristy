// THE PRIVACY LINE, enforced by construction rather than by intention.
//
// The data-growth loops only work if two datasets grow side by side and never touch:
//
//   AGGREGATE — what products exist, what questions get asked. Pools across everyone,
//   improves the cores for everyone, belongs to nobody. scanned_products, counter_gaps.
//
//   INDIVIDUAL — what THIS shopper buys, keeps, removes and declines. Personalizes
//   their list and nothing else, and leaves with them when they delete their account.
//   shopping_lists and every other table keyed to a person.
//
// Crossing them is not a bug that shows up in a test run; it is a bug that shows up in
// a news story. So the separation is asserted here, against the migrations and against
// the deletion path, rather than trusted to whoever writes the next feature.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { USER_TABLES } from '../routes/account.js';
import { buildBaseline, suppressedByBaseline } from './listBaseline.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = join(__dirname, '..', '..', 'supabase');

// Every .sql migration, concatenated — the schema is spread across several files
// (schema.sql, verdicts.sql, push_tokens.sql, counter_cards.sql) and a table added in
// any of them counts.
const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith('.sql'))
  .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'))
  .join('\n');

/** Every `create table` block in the migrations, as { name, body }. */
function tableBlocks(text) {
  const out = [];
  const re = /create table if not exists\s+(\w+)\s*\(([\s\S]*?)\n\);/gi;
  let m;
  while ((m = re.exec(text))) out.push({ name: m[1], body: m[2] });
  return out;
}

const TABLES = tableBlocks(sql);

// The tables that deliberately hold no person: the aggregate pool.
const AGGREGATE_TABLES = ['scanned_products', 'counter_gaps', 'counter_cards'];

test('the migrations actually parsed — this suite is not vacuously passing', () => {
  assert.ok(TABLES.length >= 10, `expected the schema to parse; got ${TABLES.length} tables`);
  for (const name of [...AGGREGATE_TABLES, 'shopping_lists', 'user_goals']) {
    assert.ok(TABLES.some((t) => t.name === name), `${name} must be found in the migrations`);
  }
});

/* ═══════════════ The aggregate pool holds no people ═══════════════ */

test('no aggregate table has a per-user key', () => {
  for (const name of AGGREGATE_TABLES) {
    const table = TABLES.find((t) => t.name === name);
    assert.ok(table, `${name} must exist`);
    assert.equal(
      /user_id/.test(table.body),
      false,
      `${name} must never gain a per-user key — it is the shared pool, and joining ` +
        `individual habits into it is the one thing the privacy line forbids`
    );
    assert.equal(
      /references auth\.users/.test(table.body),
      false,
      `${name} must never reference auth.users`
    );
  }
});

test('no aggregate table is in the account-deletion sweep, because it holds nothing to delete', () => {
  for (const name of AGGREGATE_TABLES) {
    assert.equal(
      USER_TABLES.includes(name),
      false,
      `${name} must not be in USER_TABLES — deleting one shopper must never subtract ` +
        `from a product catalog or a question backlog that belongs to everyone`
    );
  }
});

/* ═══════════════ Every person-keyed table leaves with the person ═══════════════ */

test('EVERY table keyed to a person is cleared on account deletion', () => {
  // The drift tripwire. shopping_lists, haul_scans and push_tokens were each added to
  // the schema long after USER_TABLES was written, and none of them was added to it.
  // The cascade collected them anyway, so nothing survived — but the explicit sweep
  // exists precisely so the guarantee does not depend on the cascade, and a table
  // missing from it is silently outside that guarantee.
  const personKeyed = TABLES.filter((t) => /references auth\.users/.test(t.body)).map((t) => t.name);

  assert.ok(personKeyed.length >= 8, 'expected to find the per-user tables');

  const missing = personKeyed.filter((name) => !USER_TABLES.includes(name));
  assert.deepEqual(
    missing,
    [],
    `these tables hold a shopper's data and are not in USER_TABLES: ${missing.join(', ')}`
  );
});

test('the pattern memory specifically is deleted with the account', () => {
  // Called out on its own because it is the most personal thing Kristy stores: the
  // staples they actually buy, what they took off the list, what swaps they refused.
  assert.ok(
    USER_TABLES.includes('shopping_lists'),
    'shopping_lists holds the per-user pattern memory and must be cleared on deletion'
  );
});

test('USER_TABLES names no table that does not exist', () => {
  const known = new Set(TABLES.map((t) => t.name));
  for (const name of USER_TABLES) {
    assert.ok(known.has(name), `USER_TABLES names ${name}, which is in no migration`);
  }
});

/* ═══════════════ The pattern memory is grocery names, never a claim ═══════════════ */

test('the baseline is built only from what the shopper themselves did', () => {
  const baseline = buildBaseline({
    kept: ['bananas', 'bananas', 'whole milk', 'oats'],
    removed: ['soda'],
    declinedSwaps: [],
  });

  // Twice is a habit; once is a trip.
  assert.ok(baseline.staples.includes('bananas'), 'a repeated item is a staple');
  assert.equal(baseline.staples.includes('oats'), false, 'a single occurrence is not yet a pattern');

  // A removal is permanent, and it suppresses the ITEM.
  assert.equal(suppressedByBaseline('soda', baseline), true);
  assert.equal(suppressedByBaseline('bananas', baseline), false);
});

test('the baseline carries no health claim, tier or inference — only names', () => {
  const baseline = buildBaseline({ kept: ['whole milk', 'whole milk'], removed: [], declinedSwaps: [] });
  const serialized = JSON.stringify({
    staples: baseline.staples,
    avoided: [...baseline.avoided],
    declined: [...baseline.declined],
  });
  for (const forbidden of ['tier', 'severity', 'concern', 'approved', 'why', 'note']) {
    assert.equal(
      new RegExp(`"${forbidden}"`, 'i').test(serialized),
      false,
      `the baseline must stay grocery NAMES — a ${forbidden} in it would be a stored judgment`
    );
  }
});

/* ═══════════════ Nothing routes individual behaviour into the pool ═══════════════ */

test('the aggregate writers are never handed a shopper', () => {
  // counterGaps, productStore and counterCards are the only modules that write to the
  // shared pool. None may import the per-user readers — that import is what a join
  // would have to look like, and it is far easier to forbid than to detect afterwards.
  for (const mod of ['counterGaps.js', 'productStore.js', 'counterCards.js', 'counterGenerate.js']) {
    const src = readFileSync(join(__dirname, mod), 'utf8');
    assert.equal(
      /from '\.\/listBaseline\.js'|from '\.\/list\.js'|getShoppingList|getFullProfile/.test(src),
      false,
      `${mod} writes to the shared pool and must never read per-user state`
    );
  }
});
