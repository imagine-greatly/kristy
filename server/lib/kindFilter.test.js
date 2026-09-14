// THE PICK KIND LEAKS NOWHERE — proven by injection, because the corpus holds none yet.
//
// A `kind: 'pick'` entry is one authored sentence a shopper reads in the store on a list
// row that has no question card. It lives in kristy_perimeter_kb.json beside the cards
// because the alias table and the section filing are the same and the list matcher reads
// one file. Everything else that reads that file answers a QUESTION, and a pick must never
// come back as one: not from the ask pool, not from the web browse or the entry lookup,
// not from the section index, and never as a row in `counter_cards`.
//
// The exclusion is one predicate — `questionEntries` in lib/perimeter.js — read by every
// door. This file feeds a fixture pick through each door and watches it never arrive.
// Every assertion is paired with its NON-VACUOUS twin: the same fixture with the kind
// removed DOES arrive, so what is being tested is the filter and not an alias that never
// hit. A test blind to its subject goes green; that pairing is what keeps this one honest.
//
// The fixture food is invented and absent from the corpus (asserted), the line is a clean
// mechanical one, and each failing variant is built by inserting the defect into it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { nonEmpty } from './testGuards.js';
import {
  perimeterKb,
  isPick,
  questionEntries,
  pickEntries,
  scoreEntries,
  scorePool,
  publicIndex,
  questionEntryById,
  sectionIndex,
  sectionById,
} from './perimeter.js';
import { parseReviewTable, cardToRow, projectAll, RETIRED, RETIRED_GENERATED } from './counterCards.js';
import { lintCard } from './counterCardLint.js';
import { projectCorpus } from '../scripts/migrateCounterCards.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REVIEW_FILE = join(__dirname, '..', '..', 'docs', 'do-lines-review.md');

/* ═══════════════════ The fixture ═══════════════════ */

const PICK = Object.freeze({
  id: 'pick_kohlrabi',
  kind: 'pick',
  title: 'Kohlrabi',
  category: 'produce',
  aliases: ['kohlrabi', 'kohlrabis'],
  decision: 'Pick a bulb that feels heavy for its size with crisp leaves.',
  sources: [{ name: 'Extension produce guide (fixture)', url: 'https://example.invalid/kohlrabi' }],
});

// The same entry with the kind removed — a question entry in every other respect. What
// it retrieves is what the pick WOULD have retrieved, so the difference is the filter.
const AS_CARD = (() => {
  const { kind, ...rest } = PICK;
  return Object.freeze(rest);
})();

const REAL = nonEmpty(perimeterKb.entries || [], 'perimeterKb.entries');
const WITH_PICK = [...REAL, PICK];
const WITH_CARD = [...REAL, AS_CARD];

test('the fixture food is absent from the corpus, so a hit proves injection', () => {
  const blob = JSON.stringify(REAL).toLowerCase();
  assert.ok(!blob.includes('kohlrabi'), 'the fixture must not coincide with a real alias');
  assert.equal(isPick(PICK), true);
  assert.equal(isPick(AS_CARD), false);
});

test('questionEntries is the predicate, and it drops exactly the pick', () => {
  const kept = questionEntries(WITH_PICK);
  assert.equal(kept.length, REAL.length);
  assert.ok(!kept.some(isPick));
  assert.equal(questionEntries(WITH_CARD).length, REAL.length + 1, 'the twin is a question entry and stays');
});

/* ═══════════════════ Door 1 — the ask pool ═══════════════════ */

test('the ask pool never retrieves a pick, even for the pick’s own alias', () => {
  for (const q of ['kohlrabi', 'kohlrabis', 'how do i pick kohlrabi', 'is kohlrabi fresh']) {
    const scored = scoreEntries(q, 3, WITH_PICK);
    assert.ok(!scored.some((s) => isPick(s.entry)), `"${q}" retrieved a pick`);
    assert.ok(!scored.some((s) => s.entry.id === PICK.id), `"${q}" retrieved the pick by id`);
  }
  // The default pool, too — the one the routes read.
  assert.ok(!scoreEntries('kohlrabi').some((s) => isPick(s.entry)));
});

test('…and the twin IS retrieved, so the alias hits and only the kind excludes it', () => {
  const top = scoreEntries('kohlrabi', 3, WITH_CARD)[0];
  assert.ok(top, 'the alias must hit when the entry is a question entry');
  assert.equal(top.entry.id, PICK.id);
  assert.ok(top.aliasScore > 0, 'on an alias, through the real gate');
});

test('scorePool is the raw scorer for the pick floor, and pickEntries is its pool', () => {
  // NOT a door. The list matcher's pick floor scores a row with no card against the picks
  // with the identical alias arithmetic; this is the shape it reaches for, so that the
  // tempting alternative — taking the filter out of scoreEntries — never has a reason.
  assert.deepEqual(pickEntries(WITH_PICK).map((e) => e.id), [PICK.id]);
  assert.deepEqual(pickEntries(REAL), [], 'the corpus holds no pick yet — P3 changes this');
  const top = scorePool('kohlrabi', pickEntries(WITH_PICK))[0];
  assert.equal(top?.entry.id, PICK.id, 'the raw scorer sees the pick when handed the pick pool');
  assert.equal(top.aliasScore, 2, 'one bare-noun hit, the same floor the ask uses');
  // And scoreEntries is scorePool over the question pool — one arithmetic, two pools.
  assert.deepEqual(scoreEntries('eggs', 3), scorePool('eggs', questionEntries(), 3));
});

/* ═══════════════════ Door 2 — the web browse and lookup ═══════════════════ */

test('the public index, the entry lookup and the section index return zero picks', () => {
  assert.ok(!publicIndex(WITH_PICK).some((t) => t.id === PICK.id), 'GET /api/perimeter listed a pick');
  assert.equal(questionEntryById(PICK.id, WITH_PICK), null, 'GET /api/perimeter/:id served a pick');
  const produce = sectionById('produce', WITH_PICK);
  assert.ok(produce, 'produce section resolves');
  assert.ok(!produce.topics.some((t) => t.id === PICK.id), 'the produce section browsed a pick');
  for (const s of sectionIndex(WITH_PICK)) {
    assert.ok(![...s.topics, ...s.labelTopics].some((t) => t.id === PICK.id), `${s.id} browsed a pick`);
  }
});

test('…and the twin appears in all three, so the doors are open and the filter is what shuts them', () => {
  assert.ok(publicIndex(WITH_CARD).some((t) => t.id === PICK.id));
  assert.equal(questionEntryById(PICK.id, WITH_CARD)?.id, PICK.id);
  assert.ok(sectionById('produce', WITH_CARD).topics.some((t) => t.id === PICK.id));
});

// Source with its comments removed, so a pin counts CODE and a comment naming the field
// does not fail it.
const codeOf = (url) =>
  readFileSync(new URL(url, import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

test('the web route reads no entries array of its own', () => {
  // The route serves the KB off disk. A raw `perimeterKb.entries` read there would be a
  // second caller the predicate cannot see; it reads the two question doors and nothing
  // else, pinned as source because the failure is a line that LOOKS harmless.
  const src = codeOf('../routes/perimeter.js');
  assert.ok(!/perimeterKb/.test(src), 'routes/perimeter.js must not touch perimeterKb directly');
  assert.match(src, /publicIndex\(\)/);
  assert.match(src, /questionEntryById\(/);
  // And in the library, the raw array is read in exactly two places: the defaults of the
  // two halves of the partition, questionEntries and pickEntries. Every door goes through
  // the first; the list matcher's floor goes through the second; nothing reads it raw.
  const lib = codeOf('./perimeter.js');
  const reads = lib.match(/^.*perimeterKb\.entries.*$/gm) || [];
  assert.equal(reads.length, 2, `lib/perimeter.js reads perimeterKb.entries in ${reads.length} places:\n${reads.join('\n')}`);
  for (const line of reads) {
    assert.match(
      line,
      /function (questionEntries|pickEntries)\(entries = perimeterKb\.entries/,
      `a raw read outside the partition: ${line.trim()}`
    );
  }
});

/* ═══════════════════ Door 2b — the KB fallback behind the table doors ═══════════════════ */

test('projectAll, the fallback every /api/counter door degrades to, projects zero picks', () => {
  // When `selectCards` returns null — no client, a select error, a throw — and when the
  // essentials come back empty, the counter serves `projectAll()`. "Cannot leak by
  // construction" has to hold there too, or a pick is served exactly when the table is down.
  const cards = projectAll(WITH_PICK);
  assert.equal(cards.length, REAL.length);
  assert.ok(!cards.some((c) => c.slug === PICK.id), 'the fallback projected a pick into a card');
  assert.ok(!projectAll().some((c) => c.slug === PICK.id));
});

test('…and the twin IS projected, so the fallback is open and the partition is what shuts it', () => {
  const cards = projectAll(WITH_CARD);
  assert.equal(cards.length, REAL.length + 1);
  assert.ok(cards.some((c) => c.slug === PICK.id));
});

/* ═══════════════════ Door 3 — the migration ═══════════════════ */

const reviewed = nonEmpty(parseReviewTable(readFileSync(REVIEW_FILE, 'utf8')), 'the reviewed do-line table');

test('the migration skips the pick before projection: it never reaches cardToRow', () => {
  const { cards, picks, problems } = projectCorpus(WITH_PICK, reviewed);
  assert.equal(picks.length, 1, 'one pick skipped, counted');
  assert.equal(picks[0].id, PICK.id);
  assert.equal(cards.length, REAL.length, 'every question entry projected, the pick not');
  assert.ok(!cards.some((c) => c.slug === PICK.id), 'the pick was projected into a card');
  const rows = cards.map(cardToRow);
  assert.ok(!rows.some((r) => r.slug === PICK.id), 'the pick reached cardToRow');
  // Not reported as a card with no action either — it is not a card.
  assert.ok(!problems.missingDo.includes(PICK.id));
  // Skipped, not retired: the retirement lists are untouched by the kind.
  assert.ok(!RETIRED.includes(PICK.id) && !RETIRED_GENERATED.includes(PICK.id));
});

test('…and the twin is projected, so the skip is what removes it', () => {
  const { cards, picks, problems } = projectCorpus(WITH_CARD, reviewed);
  assert.equal(picks.length, 0);
  assert.ok(cards.some((c) => c.slug === PICK.id), 'a question entry with this shape is projected');
  // Which is the other half of why the skip exists: a pick has no do line, so unskipped it
  // would block the whole migration as a card with no action.
  assert.ok(problems.missingDo.includes(PICK.id));
});

test('with no pick in the pool the count is zero and the output is unchanged', () => {
  const { cards, picks } = projectCorpus(REAL, reviewed);
  assert.equal(picks.length, 0);
  assert.equal(cards.length, REAL.length);
});

/* ═══════════════════ The lint ═══════════════════ */

const codes = (v) => v.map((x) => x.code);

test('the fixture pick passes the lint', () => {
  assert.deepEqual(lintCard(PICK), []);
});

test('the lint fails the pick for each of the five defects it exists to catch', () => {
  // A question phrasing on a pick is the pick asking to be a card.
  assert.ok(codes(lintCard({ ...PICK, asked_as: ['how do i pick kohlrabi'] })).includes('PICK_FIELD_FORBIDDEN'));
  // A body word. The line here is about the vegetable's core, and it is vetoed anyway: the
  // veto is vocabulary, not sense, and that cost is accepted.
  assert.ok(codes(lintCard({ ...PICK, decision: 'Pick a bulb whose heart feels firm under the thumb.' })).includes('PICK_LINE_NOT_MECHANICAL'));
  // Seventeen words.
  const seventeen = 'Pick a bulb that feels heavy for its size with crisp leaves and a smooth unbroken skin.';
  assert.equal(seventeen.split(/\s+/).length, 17);
  assert.ok(codes(lintCard({ ...PICK, decision: seventeen })).includes('PICK_LINE_TOO_LONG'));
  // A digit.
  assert.ok(codes(lintCard({ ...PICK, decision: 'Pick a bulb under 3 inches across with crisp leaves.' })).includes('PICK_LINE_DIGIT'));
  // No plural.
  assert.ok(codes(lintCard({ ...PICK, aliases: ['kohlrabi', 'kohlrabi bulb'] })).includes('PICK_ALIASES_NO_NUMBER_PAIR'));
});
