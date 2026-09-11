/* The list→card match probe. Measures CORRECTNESS, and exits non-zero on a wrong match.
 *
 *   node scripts/listMatchProbe.js
 *
 * ═══ WHAT THE FIRST VERSION MEASURED, AND WHY THE NUMBER WAS HOLLOW ═══
 *
 * The Phase 1 probe reported 71%→83% coverage with ZERO false positives, and both figures
 * were true of what it asked. It asked the wrong thing, twice:
 *
 *   1. ITS FAILURE CLASS WAS ONLY "MATCHED SOMETHING WHEN IT SHOULD HAVE MATCHED NOTHING."
 *      Six items — cereal, dish soap, paper towels, ketchup, pasta sauce, tortillas — were
 *      marked `expect: 'none'`, and a hit on one of those was the only thing counted as a
 *      false positive. Everything else was scored `hit ? pass : miss`. An item that matched
 *      the WRONG CARD counted as a SUCCESS. "Frozen broccoli or green beans" landing on
 *      `beans_dried_vs_canned` — "fill a bag from the bulk bin" on a frozen item — would
 *      have been tallied as one of the 83%.
 *
 *   2. ITS INPUT WAS BARE NOUNS IT INVENTED. Thirty lowercase singles and pairs
 *      ("blueberries", "chicken thighs"), which is what a shopper TYPES. It is not what the
 *      compose flow EMITS: composed rows carry authored PICK names ("Frozen broccoli or
 *      green beans"), a `why` on all 51, and an authored `perimeterId` on 22.
 *
 * So the probe agreed with the mock, which agreed with the harness, which agreed with the
 * browser test — and none of them agreed with the product.
 *
 * ═══ WHAT THIS MEASURES INSTEAD ═══
 *
 * Ground truth, two sources, no hand-maintained expectation list:
 *
 *   AUTHORED   the 22 PICKS carrying a `perimeterId`. That id was chosen by a person and is
 *              claim-locked. Retrieval disagreeing with it is a WRONG MATCH, not a hit.
 *   OVERLAP    for a card reached by retrieval with no authored id, the card must share a
 *              real food word with the item. Zero food overlap is the shape every false
 *              positive in this class has taken — "tuna" reaching a fresh-counter card,
 *              "beans" reaching a dried-beans card, "unpasteurized" reaching a milk card,
 *              and "worth"/"buying" reaching a farmed-fish card in the ask pipeline.
 *
 *   STATE      an item that names canned / tinned / dried attached to a PRODUCE card whose own
 *              text names no state is WRONG. The produce section sells the fresh thing, so a
 *              stateless produce card is about the fresh thing (`cardStates`, listMatch.js),
 *              and "Canned tomatoes" → `produce_ripeness_by_item` told a shopper to smell the
 *              stem end of a tin (API-FINDINGS §17). The probe reads the card's text with the
 *              same STATES regexes and never the matcher's inference — a probe that asks the
 *              matcher whether the matcher is right proves nothing.
 *
 * ═══ TWO POPULATIONS, BECAUSE THE FIRST ONE COVERED THE DOOR NOBODY WALKS THROUGH FIRST ═══
 *
 * Moving off invented bare nouns onto PICKS fixed one blindness by creating another. PICKS
 * are the SEEDED path, where an authored `perimeterId` attaches regardless of aliases. The
 * BUILD path — the one every new shopper takes — has the model emit bare nouns and retrieval
 * is all there is, and this probe was green (37/37, 0 wrong) while five of the first walk's
 * eight rows attached nothing (API-FINDINGS §16, WALK-2026-09-10 W16). So BARE_NOUNS is the
 * second population: what a shopper TYPES, judged by the same two wrong-match rules.
 *
 * A MISS IS REPORTED AND DOES NOT FAIL. Coverage is an authoring backlog — that is what
 * `counter_gaps` is for. A WRONG MATCH FAILS, because a wrong do line is worse than no do
 * line and is the only outcome here that actively misinforms someone in a store.
 */

import { PICKS } from '../lib/list.js';
import { cardForItem, entryById, matchItemToCard, STATES } from '../lib/listMatch.js';
import { sectionForCategory } from '../lib/counterCards.js';
import { scoreEntries } from '../lib/perimeter.js';

/* Words that describe a STATE, a QUALITY or a package rather than a food. A card sharing
   only these with an item has not matched its subject — which is the whole failure mode. */
const NOT_A_FOOD = new Set([
  'and', 'the', 'for', 'with', 'from', 'any', 'two', 'kinds', 'whatever', 'own',
  'raw', 'plain', 'whole', 'real', 'fresh', 'frozen', 'canned', 'dried', 'dry', 'tinned',
  'ground', 'roasted', 'baby', 'sweet', 'steel', 'cut', 'live', 'culture', 'cultures',
  'grass', 'fed', 'pasture', 'raised', 'wild', 'caught', 'bone', 'bones', 'boneless',
  'unpasteurized', 'pasteurized', 'refrigerated', 'sprouted', 'extra', 'virgin', 'dark',
  'bottle', 'low', 'sugar', 'free', 'salt', 'just', 'season', 'lean', 'light', 'white',
  'best', 'buy', 'buying', 'worth', 'good', 'better', 'vs', 'versus', 'what', 'which',
  'grade', 'grades', 'label', 'labels', 'labeled', 'check', 'read', 'pick', 'picking',
]);

const words = (s) =>
  new Set(
    String(s || '')
      .toLowerCase()
      .match(/[a-z]+/g)
      ?.filter((w) => w.length > 2 && !NOT_A_FOOD.has(w)) || []
  );

const pad = (s, n) => String(s ?? '').padEnd(n);

/* ═══ BARE_NOUNS — what a shopper types, with its provenance ═══

   PROVENANCE, checked 2026-09-11. Neither measured input list survives: API-FINDINGS §16
   reports "19/34" and names only the 15 misses; WALK-2026-09-10 W16 reports "16 of 26" and
   names only the 10 misses; `grep -rn` over kristy-ios/docs and KristyUITests finds neither
   list. So this population is everything that IS recorded, in the words it was recorded in —
   it is not a reconstruction of either list and its attach count is not comparable to
   19/34 or 16/26. Extend it from a real list, never from the corpus's own vocabulary. */
const BARE_NOUNS = [
  // API-FINDINGS §16 — the 15 named misses, lowercase as measured.
  'apples', 'carrots', 'broccoli', 'leafy greens', 'spinach', 'bell peppers', 'cucumber',
  'celery', 'zucchini', 'lettuce', 'kale', 'grapes', 'peaches', 'milk', 'garlic',
  // WALK-2026-09-10 W16 — the named misses not already above.
  'lemons', 'frozen peas',
  // KristyUITests/FirstTripWalk — the 8 rows the model emitted from "chicken thighs, rice,
  // sweet potatoes, and produce for lunches and dinners this week", cased as emitted (§16).
  'Sweet potatoes', 'Bone-in, skin-on chicken thighs', 'Brown or jasmine rice', 'Carrots',
  'Broccoli', 'Bell peppers', 'Leafy greens', 'Apples',
  // API-FINDINGS §17 — the wrong match. Attaching it to a produce card is the STATE failure.
  'Canned tomatoes',
  // PLAN-step1-plumbing piece 4 — the bare nouns the hub-rule aliases were authored for.
  'apple', 'peach', 'nectarines', 'plums', 'limes', 'oranges', 'citrus', 'strawberries',
  'strawberry',
];

/* The states an ITEM can name that no stateless produce card can answer. `fresh` is not here
   on purpose: a fresh item on a fresh card is the agreeing case. `frozen` is not here because
   the rule was specified for the shelf-stable states (canned / tinned / dried — `tinned` is
   inside STATES.canned); a frozen item on a stateless produce card would be wrong in the same
   way, and adding it here is the same deliberate act as widening STATES. */
const SHELF_STATES = ['canned', 'dried'];

const cardOwnStates = (entry) => {
  const t = ` ${[entry?.title || '', ...(entry?.aliases || [])].join(' ').toLowerCase()} `;
  return new Set(Object.keys(STATES).filter((k) => STATES[k].test(t)));
};

/**
 * OVERLAP and STATE, for a card that retrieval reached with no authored id.
 * Returns `{ verdict, detail }`.
 */
function judgeRetrieved(name, slug) {
  const entry = entryById(slug);
  const itemT = ` ${String(name).toLowerCase()} `;
  const named = SHELF_STATES.filter((k) => STATES[k].test(itemT));
  if (named.length && sectionForCategory(entry?.category) === 'produce' && cardOwnStates(entry).size === 0) {
    return { verdict: 'WRONG', detail: `attached ${slug}, a produce card naming no state, to an item naming ${named.join('/')}` };
  }
  const itemW = words(name);
  const cardW = new Set([...words(entry?.title), ...(entry?.aliases || []).flatMap((a) => [...words(a)])]);
  const overlap = [...itemW].filter((w) => cardW.has(w));
  if (overlap.length === 0) {
    return { verdict: 'WRONG', detail: `attached ${slug} sharing no food word with "${name}"` };
  }
  return { verdict: 'CORRECT', detail: `on ${overlap.join(', ')}` };
}

const rows = [];
for (const [key, p] of Object.entries(PICKS)) {
  const item = { name: p.name, ...(p.perimeterId ? { perimeterId: p.perimeterId } : {}) };
  const shipped = cardForItem(item);
  const retrieved = matchItemToCard(p.name);
  const top = scoreEntries(p.name, 1)[0];

  let verdict;
  let detail = '';

  if (p.perimeterId) {
    // Ground truth exists. The row must end up on it.
    if (!shipped) {
      verdict = 'DROPPED';
      detail = `authored ${p.perimeterId}, nothing attached`;
    } else if (shipped.slug !== p.perimeterId) {
      verdict = 'WRONG';
      detail = `authored ${p.perimeterId}, attached ${shipped.slug}`;
    } else {
      verdict = 'CORRECT';
      // Worth surfacing: retrieval alone would have disagreed. Not a failure — precedence
      // is doing its job — but it is the count that says how much work precedence is doing.
      if (retrieved && retrieved.slug !== p.perimeterId) detail = `retrieval alone would have said ${retrieved.slug}`;
    }
  } else if (!shipped) {
    verdict = 'MISS';
    detail = top ? `best was ${top.entry.id} at ${top.score}` : 'nothing scored';
  } else {
    ({ verdict, detail } = judgeRetrieved(p.name, shipped.slug));
  }

  rows.push({ key, name: p.name, authored: p.perimeterId || null, slug: shipped?.slug || null, verdict, detail, score: shipped?.score ?? top?.score ?? 0 });
}

// An assertion over an empty collection passes. Bind at the collection.
if (rows.length < 20) {
  console.error(`only ${rows.length} PICKS read — the corpus did not load, and every rate below would be meaningless`);
  process.exit(1);
}

const bare = [];
for (const name of BARE_NOUNS) {
  const hit = matchItemToCard(name);
  const top = scoreEntries(name, 1)[0];
  let verdict;
  let detail = '';
  if (!hit) {
    verdict = 'MISS';
    detail = top ? `best was ${top.entry.id} at ${top.score}` : 'nothing scored';
  } else {
    ({ verdict, detail } = judgeRetrieved(name, hit.slug));
  }
  bare.push({ name, slug: hit?.slug || null, verdict, detail });
}
// Same guard, same reason: a population that did not load scores nothing wrong.
if (bare.length < 20) {
  console.error(`only ${bare.length} bare nouns — the population did not load`);
  process.exit(1);
}

const by = (v) => rows.filter((r) => r.verdict === v);
const correct = by('CORRECT');
const wrong = by('WRONG');
const dropped = by('DROPPED');
const miss = by('MISS');
const attached = rows.filter((r) => r.slug);

console.log('\n═══════════ EVERY PICK ═══════════');
for (const r of rows) {
  const mark = { CORRECT: ' ', WRONG: '✗', DROPPED: '✗', MISS: '·' }[r.verdict];
  console.log(`  ${mark} ${pad(r.verdict, 8)} ${pad(r.name, 40)} ${pad(r.slug || '(none)', 30)} ${r.detail}`);
}

console.log('\n═══════════ CORRECTNESS ═══════════');
console.log(`  picks                    : ${rows.length}`);
console.log(`  attached a card          : ${attached.length}`);
console.log(`  CORRECT                  : ${correct.length}`);
console.log(`  WRONG (fails this probe) : ${wrong.length}`);
console.log(`  DROPPED authored card    : ${dropped.length}`);
console.log(`  miss, no card (backlog)  : ${miss.length}`);
console.log(
  `\n  WRONG-MATCH RATE ON ATTACHED ROWS: ` +
  `${attached.length ? ((wrong.length / attached.length) * 100).toFixed(1) : '0.0'}% ` +
  `(${wrong.length}/${attached.length})`
);

const authored = rows.filter((r) => r.authored);
const authoredOk = authored.filter((r) => r.verdict === 'CORRECT');
console.log(
  `  AGAINST AUTHORED GROUND TRUTH    : ${authoredOk.length}/${authored.length} correct ` +
  `(${(((authored.length - authoredOk.length) / authored.length) * 100).toFixed(1)}% wrong)`
);
const rescued = correct.filter((r) => r.authored && r.detail.startsWith('retrieval alone'));
console.log(`  rows precedence is carrying      : ${rescued.length} (retrieval alone would have attached a different card)`);

const bareWrong = bare.filter((r) => r.verdict === 'WRONG');
const bareMiss = bare.filter((r) => r.verdict === 'MISS');
const bareAttached = bare.filter((r) => r.slug);

console.log('\n═══════════ EVERY BARE NOUN (what a shopper types) ═══════════');
for (const r of bare) {
  const mark = { CORRECT: ' ', WRONG: '✗', MISS: '·' }[r.verdict];
  console.log(`  ${mark} ${pad(r.verdict, 8)} ${pad(r.name, 40)} ${pad(r.slug || '(none)', 30)} ${r.detail}`);
}
console.log(`\n  BARE NOUNS ATTACHED              : ${bareAttached.length}/${bare.length}`);
console.log(`  WRONG (fails this probe)         : ${bareWrong.length}`);
console.log(`  miss, no card (backlog)          : ${bareMiss.length}`);

if (wrong.length || dropped.length || bareWrong.length) {
  console.error(`\n${wrong.length + dropped.length + bareWrong.length} WRONG OR DROPPED — a wrong do line is worse than no do line:`);
  for (const r of [...wrong, ...dropped, ...bareWrong]) console.error(`  ✗ ${pad(r.name, 40)} ${r.detail}`);
  process.exit(1);
}
console.log('\nno wrong matches');
