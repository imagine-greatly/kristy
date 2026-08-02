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
  RETIRED,
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

// Both imported lazily so --dry-run works with no Supabase credentials at all: the report
// is the useful half during authoring, and it should never need a database.
//
// dotenv has to land BEFORE lib/supabase.js evaluates, or the client is built with no URL
// and every failure below reports as "apply the SQL first" when the real cause is a
// missing credential — a wrong diagnosis is worse than no diagnosis.
// The write phase is a function so it can RETURN an exit code rather than call
// process.exit() mid-flight. Killing the process while a Supabase fetch handle is still
// closing trips a libuv assertion on Windows and the shell sees 127 — which reads as
// "command not found" rather than "the migration refused to write".
async function write() {
  await import('dotenv/config');
  const { supabase } = await import('../lib/supabase.js');

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n[counter-cards] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.');
    console.error('[counter-cards] nothing was written. --dry-run needs no credentials.');
    return 1;
  }

  const rows = cards.map(cardToRow);

  // PREFLIGHT — a real select, never a head:true count. PostgREST answers 204 / null count
  // / no error for a table that does not exist, which reads as "present, empty"; a real
  // select against a missing table returns PGRST205 and says so.
  const { data: before, error: preErr } = await supabase.from(TABLE).select('slug');
  if (preErr) {
    console.error('[counter-cards] cannot read the table:', preErr.message);
    console.error('[counter-cards] apply supabase/counter_cards.sql first.');
    return 1;
  }
  const existing = new Set((before || []).map((r) => r.slug));

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'slug' });
  if (error) {
    console.error('[counter-cards] upsert failed:', error.message);
    // 42P10 is Postgres saying ON CONFLICT (slug) has no unique index to infer from. It is
    // a LOUD failure, not a silent duplicate insert — but the index still has to be there,
    // and counter_cards_slug_key is what makes this script re-runnable at all.
    if (/42P10|no unique|exclusion constraint/i.test(error.message)) {
      console.error('[counter-cards] the unique index on slug is missing — counter_cards_slug_key.');
    }
    console.error('[counter-cards] has supabase/counter_cards.sql been applied?');
    return 1;
  }

  // ── Retirement, in the same run as the upsert ──
  // A folded card removed from the KB would otherwise keep answering from a row nobody can
  // edit any more, because the entry it was projected from is gone. Scoped to
  // source = 'curated' so a generated card can never be swept by a stale slug collision.
  if (RETIRED.length) {
    const { data: gone, error: delErr } = await supabase
      .from(TABLE)
      .delete()
      .in('slug', RETIRED)
      .eq('source', 'curated')
      .select('slug');
    if (delErr) {
      console.error('[counter-cards] retirement delete failed:', delErr.message);
      return 1;
    }
    const removed = (gone || []).map((r) => r.slug);
    console.log(
      `[counter-cards] retired ${RETIRED.length} slug(s); ${removed.length} row(s) deleted` +
        `${removed.length ? `: ${removed.join(', ')}` : ' (already absent)'}. ✓`
    );
  }

  // ── Idempotency, accounted for rather than asserted ──
  // A second run must report 0 inserted and every card updated. If the unique index on
  // slug were missing the upsert would append instead of update and the row count would
  // climb — so the count IS the live proof of the constraint, checked by behaviour rather
  // than by reading a catalog PostgREST will not show us.
  const inserted = rows.filter((r) => !existing.has(r.slug)).length;
  const updated = rows.length - inserted;

  const { data: after, error: postErr } = await supabase.from(TABLE).select('slug');
  if (postErr) {
    console.error('[counter-cards] wrote, but could not verify:', postErr.message);
    return 1;
  }
  const total = (after || []).length;
  const distinct = new Set((after || []).map((r) => r.slug)).size;

  console.log(
    `[counter-cards] upserted ${rows.length} curated cards — ${inserted} inserted, ${updated} updated. ✓`
  );
  console.log(`[counter-cards] table now holds ${total} rows (${distinct} distinct slugs).`);

  if (total !== distinct) {
    console.error(
      `\n[counter-cards] DUPLICATE SLUGS: ${total} rows for ${distinct} slugs — ` +
        'the unique index on slug is missing and the upsert appended instead of updating.'
    );
    return 1;
  }
  return 0;
}

process.exitCode = await write();
