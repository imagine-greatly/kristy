#!/usr/bin/env node
// Project the authored perimeter KB into counter_cards, and prove nothing was lost.
//
//   node scripts/migrateCounterCards.js --dry-run   report only, touches nothing
//   node scripts/migrateCounterCards.js             upsert every curated card
//
// THE KB IS THE SOURCE OF RECORD. This script re-derives every `source = 'curated'`
// row from kristy_perimeter_kb.json plus the reviewed `do` lines in
// docs/do-lines-review.md. It upserts on `slug`, so running it twice is the same as
// running it once, and editing the KB and re-running is the supported way to change a
// curated card. Generated cards are never touched.
//
// IT REFUSES TO REPORT SUCCESS WHILE ANYTHING IS UNPLACED. The summary/expanded split
// is a re-ranking of authored content, so every sentence the KB holds has to land
// somewhere on the card. Anything that does not is printed as a diff, by field, and
// the run exits non-zero.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import {
  TABLE,
  projectEntry,
  coverage,
  cardToRow,
  parseReviewTable,
} from '../lib/counterCards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVIEW_FILE = join(__dirname, '..', '..', 'docs', 'do-lines-review.md');

const DRY = process.argv.includes('--dry-run');

/* ── The reviewed do lines ─────────────────────────────────────────────────── */

let reviewed = new Map();
try {
  reviewed = parseReviewTable(readFileSync(REVIEW_FILE, 'utf8'));
} catch {
  console.error(`[counter-cards] no review file at ${REVIEW_FILE}`);
  console.error('[counter-cards] draft it first — the do line is authored, never derived.');
  process.exit(1);
}

/* ── Project ──────────────────────────────────────────────────────────────── */

const entries = perimeterKb.entries || [];
const cards = [];
const problems = { missingDo: [], unmapped: [], longHeadline: [], longDo: [], flagged: [] };

const words = (s) => (String(s || '').match(/[\w’'-]+/g) || []).length;

for (const entry of entries) {
  const review = reviewed.get(entry.id);
  const card = projectEntry(entry, { doLine: review?.do || '' });

  if (!card.do) problems.missingDo.push(entry.id);
  if (review?.flag && review.flag !== '—' && review.flag !== '-' && review.flag !== '') {
    problems.flagged.push(`${entry.id} — ${review.flag}`);
  }
  if (words(card.headline) > 12) problems.longHeadline.push(`${entry.id} (${words(card.headline)}w)`);
  if (card.do && words(card.do) > 14) problems.longDo.push(`${entry.id} (${words(card.do)}w)`);

  const cov = coverage(entry, card);
  for (const u of cov.unmapped) problems.unmapped.push(`${entry.id} · ${u.field}: ${u.text.slice(0, 90)}`);

  cards.push(card);
}

/* ── Report ───────────────────────────────────────────────────────────────── */

const line = (label, list) => {
  console.log(`\n${label}: ${list.length}`);
  for (const x of list) console.log(`  · ${x}`);
};

console.log(`[counter-cards] ${entries.length} authored entries → ${cards.length} cards`);
console.log(`[counter-cards] reviewed do lines found: ${reviewed.size}`);

if (problems.unmapped.length) line('UNPLACED CONTENT (must be zero)', problems.unmapped);
if (problems.missingDo.length) line('MISSING do LINE', problems.missingDo);
if (problems.longHeadline.length) line('HEADLINE OVER 12 WORDS', problems.longHeadline);
if (problems.longDo.length) line('do LINE OVER 14 WORDS', problems.longDo);
if (problems.flagged.length) line('FLAGGED IN REVIEW (not blocking)', problems.flagged);

const blocking =
  problems.unmapped.length + problems.missingDo.length + problems.longHeadline.length + problems.longDo.length;

if (blocking) {
  console.error(`\n[counter-cards] ${blocking} blocking problem(s) — nothing was written.`);
  process.exit(1);
}
console.log('\n[counter-cards] every authored sentence is placed. ✓');

if (DRY) {
  console.log('[counter-cards] --dry-run: nothing written.');
  process.exit(0);
}

/* ── Write ────────────────────────────────────────────────────────────────── */

// Imported lazily so --dry-run works with no Supabase credentials at all: the report
// is the useful half during authoring, and it should never need a database.
const { supabase } = await import('../lib/supabase.js');

const rows = cards.map(cardToRow);
const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'slug' });
if (error) {
  console.error('[counter-cards] upsert failed:', error.message);
  console.error('[counter-cards] has supabase/counter_cards.sql been applied?');
  process.exit(1);
}
console.log(`[counter-cards] upserted ${rows.length} curated cards. ✓`);
