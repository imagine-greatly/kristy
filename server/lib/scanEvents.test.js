// Scan telemetry — the funnel table, and the two rules that make it safe to have.
//
// It exists to answer one question: did photo-first work, and did it work on the web or
// only in Swift. It must never be able to answer a question about a PERSON, and it must
// never be able to make a shopper wait.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { recordScan, summarize } from './scanEvents.js';
import { nonEmpty } from './testGuards.js';

const LIB = dirname(fileURLToPath(import.meta.url));
const ROOT = join(LIB, '..');

/* ═══════════ FIRE AND FORGET IS A RULE, NOT A HABIT ═══════════

   A verdict must never wait on a metric, and must never fail because one failed. That is
   easy to write in a comment and easy to break with one `await` added by someone being
   tidy — the same shape as `retainProduct`, `recordConflict` and `stampTier`, all of
   which are deliberately un-awaited.

   Forbidding it is cheaper than detecting it afterwards: an awaited insert shows up as
   "the scanner got slower" months later, with nothing pointing at the cause. */

test('nothing ever awaits a scan event', () => {
  const files = [];
  for (const dir of ['lib', 'routes']) {
    for (const f of readdirSync(join(ROOT, dir))) {
      if (!f.endsWith('.js') || f.endsWith('.test.js')) continue;
      files.push(join(ROOT, dir, f));
    }
  }
  files.push(join(ROOT, 'index.js'));
  nonEmpty(files, 'server source files');

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    assert.doesNotMatch(
      src,
      /await\s+recordScan\s*\(/,
      `${file} awaits recordScan — telemetry may never delay a verdict`
    );
    // `return recordScan(...)` from a route handler is the same defect wearing a hat.
    assert.doesNotMatch(
      src,
      /return\s+recordScan\s*\(/,
      `${file} returns recordScan — that makes the response wait on it`
    );
  }
});

test('a failing insert never throws — the verdict is already gone', async () => {
  const db = { from: () => ({ insert: async () => ({ error: { message: 'relation does not exist' } }) }) };
  const out = await recordScan({ path: 'photo', outcome: 'verdict', db });
  assert.equal(out.recorded, false, 'reported, not thrown');
});

/* ═══════════ THE TABLE CANNOT DESCRIBE A PERSON ═══════════ */

test('no identity, and no barcode, can reach the row', async () => {
  let written = null;
  const db = { from: () => ({ insert: async (row) => ((written = row), { error: null }) }) };

  await recordScan({
    path: 'photo', outcome: 'verdict', panel: 'full', attempt: 2,
    tier: 'approved', stamp: true, ingredientsRead: 24, catalog: 'new_row',
    latencyMs: 2100, visionMs: 1800, client: 'web', clientVersion: '2026.08.04',
    // Everything below is a caller trying to be helpful. None of it may land.
    barcode: '0013000006408', userId: 'abc-123', ip: '10.0.0.1', sessionId: 'sess_9',
    db,
  });

  for (const forbidden of ['barcode', 'user_id', 'userId', 'ip', 'session_id', 'sessionId']) {
    assert.ok(!(forbidden in written), `${forbidden} must never reach scan_events`);
  }
  /* THE BARCODE IS THE SUBTLE ONE. It is not identity by itself — but a barcode plus a
     timestamp plus a tier, in sequence, is a shopping trip, which is the closest thing
     this schema could hold to a fingerprint. It is dropped so `scan_events` and
     `scanned_products` stay UNJOINABLE. The question that costs — "which products fail
     most" — is answered by scanned_products.scan_count, from a table with no timeline. */
  assert.equal(written.attempt, 2);
  assert.equal(written.client_version, '2026.08.04');
});

test('a closed vocabulary rejects a typo instead of storing it', async () => {
  let written = null;
  const db = { from: () => ({ insert: async (row) => ((written = row), { error: null }) }) };
  await recordScan({ path: 'photo', outcome: 'verdict', panel: 'FULL-ish', catalog: 'newrow', client: 'android', db });
  assert.equal(written.panel, null, 'an unrecognized panel is null, not stored');
  assert.equal(written.catalog, null, 'and an unrecognized catalog value too');
  assert.equal(written.client, 'web', 'an unknown client falls back rather than inventing a category');

  // Grouping columns are required — a row missing one skews every rate computed from it.
  const bad = await recordScan({ outcome: 'verdict', db });
  assert.equal(bad.recorded, false, 'no path ⇒ not recorded');
});

test('attempt is floored at 1, so a client bug cannot halve the re-shoot rate', async () => {
  let written = null;
  const db = { from: () => ({ insert: async (row) => ((written = row), { error: null }) }) };
  await recordScan({ path: 'photo', outcome: 'verdict', attempt: 0, db });
  assert.equal(written.attempt, 1);
});

/* ═══════════ THE ARITHMETIC ═══════════ */

test('the summary answers the questions the table was built for', () => {
  const rows = [
    { path: 'photo', outcome: 'verdict', panel: 'full', attempt: 1, catalog: 'new_row', sugar_in_frame: true, latency_ms: 2000, vision_ms: 1800, client: 'web' },
    { path: 'photo', outcome: 'reshoot', panel: 'partial', attempt: 1, catalog: null, sugar_in_frame: false, latency_ms: 2200, vision_ms: 2000, client: 'web' },
    { path: 'photo', outcome: 'verdict', panel: 'full', attempt: 2, catalog: 'repeat', sugar_in_frame: false, latency_ms: 2400, vision_ms: 2100, client: 'web' },
    { path: 'photo', outcome: 'abandoned', panel: 'none', attempt: 3, catalog: null, sugar_in_frame: null, latency_ms: null, vision_ms: null, client: 'web' },
    { path: 'barcode_store', outcome: 'verdict', panel: null, attempt: 1, catalog: 'repeat', sugar_in_frame: null, latency_ms: 90, vision_ms: null, client: 'web' },
  ];
  const s = summarize(rows);

  assert.equal(s.total, 5);
  assert.equal(s.byPath.photo, 4);
  assert.equal(s.byOutcome.abandoned, 1, 'the shopper who gave up is counted');
  // The store answering is the moat working: 90ms against ~2.2s of vision.
  assert.equal(s.latencyByPath.barcode_store, 90);
  assert.equal(s.photo.firstTry, 1, 'one verdict on the first shot');
  assert.equal(s.photo.maxAttempts, 3, 'and someone who tried three times');
  assert.equal(s.photo.abandoned, 1);
  assert.equal(s.photo.sugarInFrameRate, 33, '1 of the 3 photos that reported it');
  /* THE MOAT METRIC, over PHOTO reads only. Two photo scans were retained (one new_row,
     one repeat) → 50%. The barcode_store row is deliberately excluded: a store hit is a
     repeat by definition, so counting it would drag this toward zero exactly as the
     catalog started working. This assertion is why that is scoped — it read 33% first. */
  assert.equal(s.catalogGrowthRate, 50);
});

test('empty input reports null rates rather than a confident zero', () => {
  const s = summarize([]);
  assert.equal(s.total, 0);
  // A rate over nothing is not 0% — it is unknown, and 0% would read as "the catalog is
  // not growing" when the truth is "nobody has scanned yet". Same defect class as a
  // head:true count that cannot tell a missing table from an empty one.
  assert.equal(s.catalogGrowthRate, null);
  assert.equal(s.photo.sugarInFrameRate, null);
});
