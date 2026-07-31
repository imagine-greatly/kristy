// Applying the schema must never change what a shopper has.
//
// THE BUG THIS EXISTS TO PREVENT. A trial backfill sat at the bottom of schema.sql and
// fired on every re-run. It granted the one live account a 7-day trial twice, through two
// different doors, both times as a side effect of applying the schema to pick up a missing
// table. `on conflict (user_id) do nothing` reads as idempotent and is — per user, at one
// moment. Across time it is not: anyone who signed up since the last apply has no row to
// conflict with.
//
// And it is expensive, because ensureTrial() is idempotent BY EXISTENCE: any subscription
// row at all means the user can never be granted a trial again. A backfilled row silently
// spends the only trial they had, without them ever tapping the one explicit door.
//
// The fix is structural rather than procedural. Data writes live in their own file, which
// is never part of a schema apply, and this test makes the schema files incapable of
// growing one back.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_DIR = join(__dirname, '..', '..', 'supabase');

// The ONE file allowed to write rows. It is a one-off, run deliberately, never as part of
// applying a schema.
const DATA_FILES = new Set(['backfill_trials.sql']);

const sqlFiles = readdirSync(SQL_DIR).filter((f) => f.endsWith('.sql'));
const read = (f) => readFileSync(join(SQL_DIR, f), 'utf8');

/**
 * Strip comments and dollar-quoted bodies.
 *
 * The bodies matter: handle_new_user() legitimately contains `insert into user_goals`,
 * but that is a FUNCTION DEFINITION — it runs when a user signs up, not when the schema is
 * applied. Scanning raw text would flag it and the test would be wrong rather than strict.
 */
function executableStatements(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n]*/g, ' ')
    .replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, ' $BODY$ ');
}

const DATA_WRITE = /\b(insert\s+into|update\s+[a-z_."]+\s+set|delete\s+from|truncate)\b/i;

test('the SQL files actually parsed — this suite is not vacuously passing', () => {
  assert.ok(sqlFiles.length >= 5, `expected the migrations; got ${sqlFiles.join(', ') || 'none'}`);
  for (const name of ['schema.sql', 'counter_cards.sql', 'counter_gaps.sql', 'backfill_trials.sql']) {
    assert.ok(sqlFiles.includes(name), `${name} must be in supabase/`);
  }
});

test('NO schema file writes a single row', () => {
  for (const file of sqlFiles) {
    if (DATA_FILES.has(file)) continue;
    const body = executableStatements(read(file));
    const hit = body.match(DATA_WRITE);
    assert.equal(
      hit,
      null,
      `${file} contains a data write (${hit?.[0]}). Applying a schema must never change ` +
        `what a user has — move it to its own file, the way backfill_trials.sql is.`
    );
  }
});

test('function bodies are exempt, and the stripper is doing real work', () => {
  // The tripwire on the tripwire: handle_new_user() really does contain an insert, so if
  // the dollar-quote stripper ever stops working this test fails instead of the one above
  // silently loosening.
  const raw = read('schema.sql');
  assert.match(raw, /insert into public\.user_goals/i, 'handle_new_user should still seed a goals row');
  assert.doesNotMatch(
    executableStatements(raw),
    /insert into public\.user_goals/i,
    'the dollar-quoted body should have been stripped'
  );
});

test('the trial backfill is OUT of schema.sql and still exists on its own', () => {
  assert.doesNotMatch(
    read('schema.sql'),
    /insert into public\.subscriptions/i,
    'the trial backfill must never return to schema.sql — it fires on every apply'
  );
  // Not vacuous: the backfill still has to work when it is run on purpose.
  assert.match(read('backfill_trials.sql'), /insert into public\.subscriptions/i);
  assert.match(read('backfill_trials.sql'), /on conflict \(user_id\) do nothing/i);
});

test('the data file warns why it is dangerous, not just what it does', () => {
  // A one-off that grants trials needs its reasoning attached, or the next person moves it
  // back into the schema for convenience.
  const body = read('backfill_trials.sql');
  assert.match(body, /ensureTrial/, 'it must name the function that makes a stray row permanent');
  assert.match(body, /explicit door/i, 'it must point at the trial’s one legitimate path');
});
