// doLines.json is a BUILD PRODUCT of docs/do-lines-review.md, and this test is the only
// thing holding them together.
//
// The markdown is the authored source: it is reviewed by hand, it carries the drafting
// notes, and its table is what a person edits. The JSON exists solely because the markdown
// lives outside the deploy boundary (`server/`), so production never sees it — which is
// how every curated card on /api/counter/ask came to carry an empty do line.
//
// A generated file that nothing checks is a file that drifts. Edit the table, run
// `node scripts/buildDoLines.js`, commit both.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import perimeterKb from '../kristy_perimeter_kb.json' with { type: 'json' };
import doLines from './doLines.json' with { type: 'json' };
import { parseReviewTable, RETIRED } from './counterCards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reviewed = parseReviewTable(
  readFileSync(join(__dirname, '..', '..', 'docs', 'do-lines-review.md'), 'utf8')
);

test('doLines.json agrees with the reviewed markdown, exactly', () => {
  const fromMarkdown = {};
  for (const [slug, row] of reviewed) {
    const line = String(row?.do || '').trim();
    if (line) fromMarkdown[slug] = line;
  }
  assert.deepEqual(
    doLines,
    fromMarkdown,
    'lib/doLines.json is stale — run `node scripts/buildDoLines.js` and commit the result'
  );
});

test('every authored entry has a do line, and no retired one does', () => {
  // The do line is the field the card exists to carry, so a missing one is not a gap in
  // a build product — it is a card with no action on it.
  for (const e of perimeterKb.entries) {
    assert.ok(doLines[e.id], `${e.id} has no do line in doLines.json`);
  }
  for (const slug of RETIRED) {
    assert.ok(!doLines[slug], `${slug} is retired but still carries a do line`);
  }
});

test('the do lines survive the deploy boundary', () => {
  // The regression, stated as behaviour. Both consumers must resolve their do lines from
  // inside server/ — if either goes back to reading docs/, this fails wherever docs/ is
  // absent, which is exactly where it matters and nowhere a local test would notice.
  for (const file of ['counterCards.js', 'counterAskPipeline.js']) {
    const src = readFileSync(join(__dirname, file), 'utf8');
    assert.ok(
      !/\.\.\/\.\.\/docs/.test(src),
      `${file} reads docs/ again — that path does not exist in production`
    );
    assert.ok(/doLines\.json/.test(src), `${file} no longer reads doLines.json`);
  }
});
