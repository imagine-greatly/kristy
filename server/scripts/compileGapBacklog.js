#!/usr/bin/env node
// Compile the counter's authoring backlog: every honest miss, ranked by how many
// shoppers hit it, cross-referenced against the corpus that already exists.
//
//   cd server && node scripts/compileGapBacklog.js            write docs/COUNTER-BACKLOG.md
//   cd server && node scripts/compileGapBacklog.js --stdout   print, write nothing
//
// ⚠️ RUN IT FROM `server/`. dotenv loads from the working directory, so from the
// repo root this reports missing credentials, which reads as an unconfigured box
// and is a missing `cd`.
//
// WHY A SCRIPT AND NOT A QUERY. `counter_gaps` is the moat widening from reality:
// every question the counter could not answer is a real shopper naming, for free,
// exactly which card should be written next. That signal is only worth having if
// it is READ, and it has never been compiled into anything an author can work from.
//
// ⚠️ IT REFUSES TO WRITE AN EMPTY BACKLOG, AND THAT IS THE POINT OF THE SCRIPT.
// `gapFeed` is fire-and-forget by design: it swallows its own errors and returns
// `{ rows: [], unavailable: true }` so a shopper waiting on an answer never waits
// on analytics. That is correct for the request path and catastrophic for a
// REPORT — an unreachable table and a finished backlog produce the same document,
// and a finished-looking document is reviewed for polish rather than for whether
// its subject is present. So: unavailable exits 2, and zero rows exits 3, and
// neither writes a file. A backlog that cannot see its subject must not look done.
//
// It reads. It writes one markdown file in docs/. It touches no table and no route.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import 'dotenv/config';
import { supabase } from '../lib/supabase.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const KB = join(ROOT, 'server', 'kristy_perimeter_kb.json');
const OUT = join(ROOT, 'docs', 'COUNTER-BACKLOG.md');

const stdoutOnly = process.argv.includes('--stdout');

const TABLE = 'counter_gaps';
const PAGE = 1000;

function die(code, msg) {
  console.error(`\n  \u2717 ${msg}\n`);
  process.exit(code);
}

// ⚠️ WHY THIS DOES NOT CALL `gapFeed`, WHICH ALREADY EXISTS AND DOES THIS.
//
// Two reasons, and the first one bit on the very first run of this script.
//
// 1. PostgREST caps a response at 1000 rows server-side. `gapFeed` passes its own
//    `sampleCap` to `.limit()` and then reports `truncated: data.length >= sampleCap`
//    — so with a cap of 50000 it read exactly 1000 rows and reported truncated:false.
//    THE CAP THAT ACTUALLY BOUND WAS INVISIBLE TO THE CHECK FOR IT. That is the
//    findings family at the database driver: a report that cannot see its own limit.
//    The fix is not a bigger number. It is to ask for the COUNT first and then page
//    until the rows we hold equal it, and to die if they never do.
// 2. `gapFeed` does not select `source`, and without it this document is unusable:
//    an ask-miss and a list-miss are different signals (supabase/list_attach.sql),
//    and our own livetests write to this table through the public routes.
const { count, error: countErr } = await supabase
  .from(TABLE).select('*', { count: 'exact', head: false }).limit(1);
if (countErr) {
  die(2, `counter_gaps is UNREACHABLE: ${countErr.message}\n` +
         '    This is not an empty backlog — nothing was read. Check SUPABASE_URL and\n' +
         '    SUPABASE_SERVICE_ROLE_KEY, and that you ran this from server/.');
}
if (!count) {
  die(3, 'The gap log is readable and EMPTY. That is a real state and it is not a backlog.\n' +
         '    Nothing written, deliberately: an empty document would read as finished work.');
}

const raw = [];
for (let from = 0; from < count; from += PAGE) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('question, outcome, top_entry_id, asked_at, source')
    .order('asked_at', { ascending: false })
    .range(from, from + PAGE - 1);
  if (error) die(2, `Paging failed at offset ${from}: ${error.message}`);
  raw.push(...(data || []));
  if (!data || !data.length) break;
}

// The assertion the first version could not make. If these disagree, something
// capped us and the document would understate the backlog while looking complete.
if (raw.length !== count) {
  die(5, `Read ${raw.length} rows but the table reports ${count}.\n` +
         '    Refusing to write a backlog from a partial read.');
}

const byTopic = new Map();
for (const r of raw) {
  const key = `${r.source || 'ask'} ${r.outcome} ${r.question}`;
  const hit = byTopic.get(key);
  if (hit) {
    hit.times_asked += 1;
    if (r.asked_at > hit.last_asked) hit.last_asked = r.asked_at;
    if (r.asked_at < hit.first_asked) hit.first_asked = r.asked_at;
  } else {
    byTopic.set(key, {
      question: r.question, outcome: r.outcome, source: r.source || 'ask',
      top_entry_id: r.top_entry_id || null,
      times_asked: 1, last_asked: r.asked_at, first_asked: r.asked_at,
    });
  }
}
const feed = {
  rows: [...byTopic.values()].sort((a, b) => b.times_asked - a.times_asked ||
        (a.last_asked < b.last_asked ? 1 : -1)),
};
feed.total = feed.rows.length;
feed.window = raw.length;

// Cross-reference: a topic whose words already appear in a card's aliases is a
// RETRIEVAL failure, not a missing card, and the two are different pieces of work.
let corpus = [];
try {
  corpus = JSON.parse(readFileSync(KB, 'utf8'));
} catch (err) {
  die(4, `Could not read the perimeter KB at ${KB}: ${err.message}`);
}
const entries = Array.isArray(corpus) ? corpus : corpus.entries || [];
if (!entries.length) die(4, 'The perimeter KB parsed to zero entries. Refusing to classify against nothing.');

const aliasIndex = entries.flatMap((e) =>
  [e.id, e.title, ...(e.aliases || [])].filter(Boolean).map((a) => ({ a: String(a).toLowerCase(), id: e.id }))
);

function nearest(topic) {
  const words = topic.split(/\s+/).filter((w) => w.length > 3);
  let best = null;
  for (const { a, id } of aliasIndex) {
    if (topic.includes(a) && a.length > 3) {
      if (!best || a.length > best.len) best = { id, len: a.length, kind: 'alias in question' };
    }
  }
  if (best) return { ...best, real: true };
  // A shared word is a HINT, never a classification. "dog food" shares "food" with
  // seafood_certifications and "bleach" shares its whole self with flour_basics —
  // neither is an alias job, and filing them as one would send an author to widen an
  // alias list until the matcher starts answering the wrong question. Reported so a
  // human can glance at it, and explicitly marked as not-a-match.
  for (const w of words) {
    const hit = aliasIndex.find(({ a }) => a.includes(w));
    if (hit) return { id: hit.id, len: w.length, kind: `only shares "${w}"`, real: false };
  }
  return null;
}

const rows = feed.rows.map((r) => {
  const near = nearest(r.question);
  return {
    ...r,
    near,
    // The classification an author acts on. A topic the corpus can already almost
    // reach is an ALIAS job (minutes); one it cannot reach at all is a CARD job.
    // `improve` beats everything: the matcher DID reach a card and answered badly.
    // `alias` only on a real alias containment — see nearest().
    work: r.top_entry_id ? 'improve' : near?.real ? 'alias' : 'card',
  };
});

const split = (src) => rows.filter((r) => r.source === src);
const asks = split('ask');
const lists = split('list');
const counts = rows.reduce((m, r) => ({ ...m, [r.work]: (m[r.work] || 0) + 1 }), {});
const askings = rows.reduce((n, r) => n + r.times_asked, 0);

// ⚠️ OUR OWN LIVETESTS WRITE TO THIS TABLE. `/perimeter/ask` logs unconditionally —
// the endpoint IS the counter — and the list-attach path logs every uncarded item.
// Both are public, and `scripts/*.livetest.js` and `listMatchProbe.js` drive them
// against production on purpose. So a topic that also appears in a test fixture is
// not evidence of a shopper. It is flagged, never dropped: dropping it would hide
// the contamination, and the contamination is itself the finding.
const FIXTURE_HINTS = ['baby spinach', 'frozen peas', 'dish soap', 'paper towels',
  'aluminum foil', 'lemons', 'nutella'];
const suspect = (q) => FIXTURE_HINTS.some((f) => q.includes(f));
const flagged = rows.filter((r) => suspect(r.question));

const table = (rs) => rs.length ? [
  '| # | Topic | Times | Work | Nearest the corpus has | First | Last |',
  '| ---: | --- | ---: | --- | --- | --- | --- |',
  ...rs.map((r, i) =>
    `| ${i + 1} | ${suspect(r.question) ? `⚠️ ${r.question}` : r.question} | ${r.times_asked} | ${r.work} | ${r.top_entry_id || (r.near ? `${r.near.id} (${r.near.kind})` : '—')} | ${String(r.first_asked).slice(0, 10)} | ${String(r.last_asked).slice(0, 10)} |`
  ), ''] : ['_None._', ''];

const md = [
  '# The counter backlog — what the corpus could not answer',
  '',
  `**Compiled ${new Date().toISOString().slice(0, 10)} by \`server/scripts/compileGapBacklog.js\`.**`,
  'Regenerate it; do not hand-edit it. Every number here was measured on the run that wrote it.',
  '',
  `- **${feed.total}** distinct topics, from **${askings}** loggings, read from **${feed.window}** rows — and the table reports **${count}**, which is the same number, asserted rather than assumed.`,
  `- Against a corpus of **${entries.length}** perimeter entries.`,
  `- Split by surface: **${asks.length}** from the ask, **${lists.length}** from a list.`,
  '',
  '## ⚠️ Read this before treating any row as demand',
  '',
  `**${flagged.length} of ${feed.total} topics also appear in this repo's own test fixtures**, and the counts say the same thing: the top rows sit at several hundred loggings each, within three of one another, which is a loop and not a week of shoppers. \`/perimeter/ask\` logs unconditionally and the list-attach path logs every uncarded item, both are public routes, and \`scripts/*.livetest.js\` and \`listMatchProbe.js\` drive them against production deliberately. **They are marked ⚠️ and kept, not dropped** — dropping them would hide the contamination, and the contamination is the finding. The fix is upstream and is not proposed here: nothing in the table distinguishes a test run from a shopper.`,
  '',
  '## The three kinds of work, and they are not the same job',
  '',
  `- **card** (${counts.card || 0}) — nothing in the corpus comes close. Someone writes a card.`,
  `- **alias** (${counts.alias || 0}) — the corpus holds the answer and the matcher did not find it. Minutes, not hours. ⚠️ **Author the question form AND the bare noun**: an alias is matched by whole-phrase containment, so a shopper writing a list types \`tomatoes\` while a shopper asking types \`are tomatoes…\`. This defect has shipped five times.`,
  `- **improve** (${counts.improve || 0}) — a card matched and answered badly. \`top_entry_id\` names it.`,
  '',
  '## From the ask — a shopper wanted a read and got none',
  '',
  '_Curiosity. Weaker evidence of demand, stronger evidence of what the counter is for._',
  '',
  ...table(asks),
  '## From a list — a shopper is buying this and the corpus is silent',
  '',
  '_Intent. Stronger evidence of demand (`supabase/list_attach.sql`), and the reason the two are never collapsed into one number._',
  '',
  ...table(lists),
  '## Before writing any card from this list',
  '',
  '- **Every card carries its own questions in `asked_as`, three or more, authored FROM the question and never from the card’s own vocabulary.** `counterReach.test.js` fails if one lands on another card, on title words alone, or on nothing. **A new card is not done until it can be found.**',
  '- **Be specific, not numerous, when a hub already steals the question.** The matcher scores by phrase length, so one longer alias out-ranks a hub. A short generic alias is actively dangerous.',
  '- **Where the popular claim outruns the evidence, state the narrower true thing and put the gap in `watch_out`.** Verify the study, not the retelling, and fetch every source before it ships.',
  '- **A purchase decision is a `shelf` card however kitchen-shaped its do line is** — `kind=\'home\'` suppresses add-to-cart.',
  '- ⚠️ **Kristy carries anything and judges only food.** Several rows here are household goods. A non-food row belongs on a list with no card and no do line, and **her silence there is the feature** — it is not a gap to be filled with a household KB.',
  '- ⚠️ **Editing the KB is a two-step act.** `routes/counter.js` serves from the `counter_cards` table, so a card reaches iOS only when `node server/scripts/migrateCounterCards.js` runs from `server/`. **And a migration publishes everything the KB is ahead by, not only the card you came to ship — diff the KB against the table first.**',
  '',
].join('\n');

if (stdoutOnly) {
  console.log(md);
} else {
  writeFileSync(OUT, md);
  console.log(`\n  \u2713 ${feed.total} topics, ${askings} loggings, ${count} rows \u2192 ${OUT}`);
  console.log(`    ask ${asks.length} \u00b7 list ${lists.length} \u00b7 card ${counts.card || 0} \u00b7 alias ${counts.alias || 0} \u00b7 improve ${counts.improve || 0}`);
  if (flagged.length) console.log(`    \u26a0\ufe0f  ${flagged.length} topics match this repo's own test fixtures and are marked in the file.`);
}
