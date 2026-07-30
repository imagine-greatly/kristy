// The internal growth view — the two things that must be true about it.
//
//   1. It is OFF unless deliberately turned on. A dashboard that quietly becomes
//      public in a new environment is the standard way this goes wrong.
//   2. It contains no individual data — not because it filters people out, but
//      because both tables it reads hold no people to filter.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { tokenMatches } from '../routes/internal.js';
import { topScannedProducts } from './productStore.js';

const SRC = readFileSync(new URL('../routes/internal.js', import.meta.url), 'utf8');

/* ═══════════════ Off by default ═══════════════ */

test('with no token configured, nothing matches', () => {
  // The module under test boots with INTERNAL_DASHBOARD_TOKEN unset, so the ambient
  // expected token is ''. Every one of these must fail closed.
  assert.equal(tokenMatches('anything'), false);
  assert.equal(tokenMatches(''), false);
  assert.equal(tokenMatches(undefined), false);
  assert.equal(tokenMatches(null), false);
});

test('an empty expected token can never be satisfied, including by an empty guess', () => {
  assert.equal(tokenMatches('', ''), false, 'blank must not authenticate against blank');
  assert.equal(tokenMatches(undefined, ''), false);
});

test('a correct token matches and a wrong one does not', () => {
  const token = 'a'.repeat(32);
  assert.equal(tokenMatches(token, token), true);
  assert.equal(tokenMatches('b'.repeat(32), token), false);
  assert.equal(tokenMatches(token.slice(0, 31), token), false, 'a prefix must not pass');
  assert.equal(tokenMatches(token + 'x', token), false, 'a superstring must not pass');
});

test('a short token is refused at boot rather than accepted as a gate', () => {
  assert.ok(/MIN_TOKEN_LEN\s*=\s*24/.test(SRC), 'a minimum token length must be enforced');
  assert.ok(
    /RAW_TOKEN\.length >= MIN_TOKEN_LEN \? RAW_TOKEN : ''/.test(SRC),
    'a too-short token must degrade to unset, not to a weak gate'
  );
});

test('an unauthorized caller gets 404, not 401', () => {
  // 401 confirms the endpoint exists and invites another attempt. The whole path is
  // meant to be invisible from outside.
  assert.equal(/status\(401\)/.test(SRC), false, 'the internal route must never answer 401');
  assert.ok(/status\(404\)/.test(SRC), 'an unauthorized caller must get 404');
});

test('the comparison is constant-time', () => {
  assert.ok(/timingSafeEqual/.test(SRC), 'the token compare must not leak length-wise');
  assert.equal(
    /provided === |=== TOKEN|TOKEN ===/.test(SRC),
    false,
    'no naive string equality on the token'
  );
});

/* ═══════════════ Aggregate only ═══════════════ */

test('the growth view reads no per-user source', () => {
  // The guarantee is structural: it may only import the two aggregate readers.
  for (const forbidden of [
    'listBaseline',
    'getShoppingList',
    'getFullProfile',
    'meal_logs',
    'chat_messages',
    'haul_scans',
    'shopping_lists',
    'requireAuth',
  ]) {
    assert.equal(
      new RegExp(forbidden).test(SRC),
      false,
      `the internal view must not reference ${forbidden} — it is aggregate only`
    );
  }
});

test('the growth view renders no identifying field', () => {
  // Everything the HTML prints comes from the snapshot; these are the field names that
  // would mean a person had got in.
  for (const forbidden of ['userId', 'user_id', 'email', 'phone']) {
    assert.equal(
      new RegExp(forbidden, 'i').test(SRC),
      false,
      `the internal view must never render ${forbidden}`
    );
  }
});

test('the browser view is marked no-index and no-store', () => {
  assert.ok(/noindex/.test(SRC), 'an internal page must not be indexable');
  assert.ok(/no-store/.test(SRC), 'a page carrying a token in its URL must not be cached');
});

test('rendered values are escaped', () => {
  // The gap topics are shopper-typed text. Normalization already strips punctuation,
  // but the view must not depend on an upstream scrub for its own safety.
  assert.ok(/const esc =/.test(SRC), 'the view must define an escaper');
  assert.ok(/&amp;|&lt;/.test(SRC), 'the escaper must handle markup characters');
  assert.ok(/esc\(g\.question\)/.test(SRC), 'shopper-typed topics must be escaped');
  assert.ok(/esc\(p\.name/.test(SRC), 'product names must be escaped');
});

/* ═══════════════ The reader it depends on ═══════════════ */

test('topScannedProducts asks for products, never a person', async () => {
  const asked = [];
  const client = {
    from: () => ({
      select(columns) {
        asked.push(columns);
        const q = {
          order: () => q,
          limit: () => q,
          then: (resolve) => resolve({ data: [{ name: 'Oat Crackers', scan_count: 9 }], error: null }),
        };
        return q;
      },
    }),
  };

  const rows = await topScannedProducts({ client });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Oat Crackers');
  assert.equal(/user|account|session/i.test(asked.join(' ')), false);
});

test('an unreachable table yields an empty list, not a crash', async () => {
  const broken = {
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => ({ then: (_r, rej) => rej(new Error('does not exist')) }),
        }),
      }),
    }),
  };
  assert.deepEqual(await topScannedProducts({ client: broken }), []);
});
