#!/usr/bin/env node
// Generate server/lib/doLines.json from docs/do-lines-review.md.
//
//   node scripts/buildDoLines.js
//
// WHY THIS FILE EXISTS: THE DEPLOY BOUNDARY. Railway's Root Directory is `server/`, so
// nothing outside it reaches production. Both the counter's card projection and its ask
// pipeline read the reviewed `do` lines from `docs/`, wrapped in a try/catch that fell
// back to an empty Map — so in production every curated card served by /api/counter/ask
// had an EMPTY do line. The do line is the whole point of the card, and asking is the
// lead interaction on the Counter. It had been that way since the lines were authored.
//
// The markdown stays the AUTHORED SOURCE, because it is reviewed by hand and its table
// is the reviewable artifact. This JSON is a build product of it that lives inside the
// deploy boundary, and `doLines.test.js` fails if the two disagree — so the generated
// file cannot drift from the reviewed one.
//
// Run this after editing the review table, and commit the result.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { parseReviewTable } from '../lib/counterCards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVIEW = join(__dirname, '..', '..', 'docs', 'do-lines-review.md');
const OUT = join(__dirname, '..', 'lib', 'doLines.json');

const reviewed = parseReviewTable(readFileSync(REVIEW, 'utf8'));
if (!reviewed.size) {
  console.error('[do-lines] the review table parsed to nothing — refusing to write an empty file.');
  process.exit(1);
}

// Slug -> do line. The `flag` column is review metadata and is deliberately not carried:
// production needs the line, not the notes about drafting it.
const out = {};
for (const slug of [...reviewed.keys()].sort()) {
  const line = String(reviewed.get(slug)?.do || '').trim();
  if (line) out[slug] = line;
}

writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`[do-lines] wrote ${Object.keys(out).length} do lines to lib/doLines.json ✓`);
