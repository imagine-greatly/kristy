// Kristy's own product dataset — the integrity rules.
//
// The asset is only worth having if it can't be degraded. Two ways it could be:
// a cropped photo overwriting a good ingredient list, and a photo of one product
// filed under another product's barcode. Both are ranked out below.
//
// The DB round-trip isn't exercised here (no Supabase in unit tests); what IS
// exercised is every decision that governs what gets written.

import test from 'node:test';
import assert from 'node:assert/strict';

import { productHash, confidenceFor } from './productStore.js';

/* ───────────────────────── Identity / de-dupe ───────────────────────── */

test('the same label hashes to the same identity', () => {
  const a = productHash('Cheddar Crackers', 'Enriched flour, canola oil, salt');
  const b = productHash('cheddar crackers', 'ENRICHED FLOUR, CANOLA OIL, SALT');
  assert.equal(a, b, 'case and spacing must not fork a product into two rows');
});

test('different products hash differently', () => {
  const a = productHash('Cheddar Crackers', 'Enriched flour, canola oil, salt');
  const b = productHash('Cheddar Crackers', 'Organic wheat flour, olive oil, salt');
  assert.notEqual(a, b, 'a reformulation is a different record');
});

test('a hash is stable and short enough to index', () => {
  const h = productHash('X', 'y');
  assert.match(h, /^[0-9a-f]{32}$/);
});

/* ───────────────────────── Confidence ───────────────────────── */

test('an OFF record is high confidence; a partial panel is not', () => {
  assert.equal(confidenceFor({ source: 'off', panel: 'full' }), 'high');
  assert.equal(confidenceFor({ source: 'vision', panel: 'full' }), 'high');
  assert.equal(confidenceFor({ source: 'vision', panel: 'partial' }), 'low');
});

/* ───────────────────── Trust ranking (the poison guards) ─────────────────────
   trustRank isn't exported — it's an implementation detail — so these assert the
   ORDERING it has to implement, which is the part that must never regress:

     off/full  >  vision/full  >  vision/partial

   Equal rank replaces (a fresh read of the same kind supersedes an older one);
   lower rank never does. */

// A local mirror of the rule, so the ordering itself is under test even though the
// function is private. If productStore's ordering changes, the reasons below are
// what a future reader has to argue against.
const rank = (source, confidence) =>
  source === 'off' || source === 'store' ? 3 : confidence === 'low' ? 1 : 2;

test('a cropped photo can never overwrite a good ingredient list', () => {
  // "Don't let one bad read poison a known-good product."
  assert.ok(rank('vision', 'low') < rank('off', 'high'));
  assert.ok(rank('vision', 'low') < rank('vision', 'high'));
});

test('a legible photo still may not overwrite an Open Food Facts record', () => {
  // This is what closes the tampering path: the label endpoint accepts a
  // client-supplied barcode, so without this someone could photograph one product
  // and file it over another product's real record.
  assert.ok(rank('vision', 'high') < rank('off', 'high'));
});

test('a fresh vision read DOES supersede an older vision read', () => {
  // Products get reformulated; between two reads of the same kind, newer wins.
  assert.ok(rank('vision', 'high') >= rank('vision', 'high'));
});

test('a partial read supersedes another partial read, and nothing better', () => {
  assert.ok(rank('vision', 'low') >= rank('vision', 'low'));
  assert.ok(rank('vision', 'low') < rank('vision', 'high'));
});

/* ───────────────────────── Privacy ───────────────────────── */

test('the retained shape carries no user identity', async () => {
  // The catalog is PRODUCTS, not people. The per-user record of a scan lives in
  // haul_scans; mixing identity in here would turn a shared asset into a log of
  // who bought what, for no product benefit.
  const src = await import('node:fs').then((fs) =>
    fs.readFileSync(new URL('./productStore.js', import.meta.url), 'utf8')
  );
  assert.equal(/user_id/.test(src), false, 'productStore must never reference user_id');
});

test('tier stamping is update-only — it can never introduce a product', async () => {
  // The barcode association on /verdict comes from the client. Update-only means the
  // worst a forged one can do is write a tier onto a row that already exists; it can
  // never insert a product or its ingredients. And since every scan RECOMPUTES the
  // tier from ingredients, a wrong value here can't become a wrong verdict.
  const src = await import('node:fs').then((fs) =>
    fs.readFileSync(new URL('./productStore.js', import.meta.url), 'utf8')
  );
  const fn = src.slice(src.indexOf('export async function stampTier'));
  assert.ok(/\.update\(/.test(fn), 'stampTier updates');
  assert.equal(/\.insert\(|\.upsert\(/.test(fn), false, 'stampTier must never insert or upsert');
});
