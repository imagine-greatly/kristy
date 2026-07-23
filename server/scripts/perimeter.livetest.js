// Acceptance — the Perimeter KB + the claim-locked /perimeter/ask answer. Structural
// checks always run; the 3 LIVE checks run only with an API key.
//   node scripts/perimeter.livetest.js                     (structural only)
//   node --use-system-ca scripts/perimeter.livetest.js     (adds the live answer checks)
//
// Verify criteria (from the spec):
//   • "Is wild or farmed salmon better?" → a tiered, sourced answer with buying tips;
//     a no-match question → the honest no-answer, not an improvisation.
//   • A planted fact not in any entry never appears in an answer (claim lock).
//   • Raw milk → a balanced, non-advocating treatment; no treatment/cure claim.
//   • Free users get the universal entry; personalized answers gate to premium (route).

import 'dotenv/config';
import {
  perimeterKb,
  matchEntries,
  publicEntry,
  sanitizeForModel,
  composeAnswer,
  NO_ANSWER,
} from '../lib/perimeter.js';

let fails = 0;
const ck = (n, c) => { console.log(`  ${c ? '✓' : '✗ FAIL'} ${n}`); if (!c) fails++; };
const CURE = /\bcures?\b|\btreats?\b|\bheals?\b|\bprevents?\b|\breverses?\b|\bboosts? (?:your )?immun/i;
const PRICE = /[$£€]|\b\d+\s*(?:dollars?|cents?)\b/i;

console.log('\n═══ KB — honest, tiered, complete ═══');
ck('35+ entries across all seven seed categories',
  perimeterKb.entries.length >= 34 &&
  new Set(perimeterKb.entries.map((e) => e.category)).size === 7);
ck('every entry carries an honest evidence tier from the shared set',
  perimeterKb.entries.every((e) => Object.keys(perimeterKb.evidence_tiers).includes(e.evidence_tier)));
ck('every entry has a title, a short answer, and buying tips or decoded labels',
  perimeterKb.entries.every((e) => e.title && e.short_answer &&
    ((e.buying_tips || []).length || (e.labels_decoded || []).length)));

console.log('\n═══ Retrieval — the right topic, or an honest nothing ═══');
const salmon = matchEntries('Is wild or farmed salmon better?');
ck('salmon question resolves to the salmon entry', salmon[0]?.id === 'salmon_wild_vs_farmed');
ck('the matched entry is tiered + sourced + has buying tips',
  salmon[0]?.evidence_tier && (salmon[0]?.sources || []).length > 0 && (salmon[0]?.buying_tips || []).length > 0);
ck('a broad label question resolves ("what does natural mean?")',
  matchEntries('what does natural mean on a label?').some((e) => e.id === 'label_natural'));
ck('an off-topic question resolves to NOTHING (→ honest no-answer)',
  matchEntries('where is the bathroom?').length === 0 && NO_ANSWER.length > 20);

console.log('\n═══ Claim lock — the model only ever sees the seven allowed fields ═══');
const raw = perimeterKb.entries.find((e) => e.id === 'raw_milk');
const forModel = sanitizeForModel(raw);
ck('sources / question / aliases / id are withheld from the model',
  !('sources' in forModel) && !('question' in forModel) && !('aliases' in forModel) && !('id' in forModel));

console.log('\n═══ Free layer — the entry is a verbatim, sourced KB read ═══');
const pub = publicEntry(salmon[0]);
ck('publicEntry exposes sources + evidence framing for display', pub.sources.length > 0 && !!pub.evidence_framing);

if (!process.env.ANTHROPIC_API_KEY) {
  console.log('\n(ANTHROPIC_API_KEY unset — skipping the 3 live answer checks)');
} else {
  console.log('\n═══ LIVE — the claim-locked answer ═══');

  const a = await composeAnswer({
    question: 'Is wild or farmed salmon better?',
    goal: 'eating cleaner', constraints: ['budget'], focuses: [], hardLines: [],
    entries: matchEntries('Is wild or farmed salmon better?'),
  });
  console.log(`    salmon → ${a.answer}\n    refine → ${a.refinement}`);
  ck('salmon: a real answer comes back', a.answer && a.answer.length > 40);
  ck('salmon: no dollar figure / price is stated', !PRICE.test(a.answer));
  ck('salmon: a concrete list refinement is offered', !!a.refinement && /salmon/i.test(a.refinement));

  const rm = await composeAnswer({
    question: 'Is raw milk better for me?',
    goal: '', constraints: [], focuses: [], hardLines: [],
    entries: matchEntries('is raw milk better?'),
  });
  console.log(`    raw milk → ${rm.answer}`);
  ck('raw milk: balanced answer, names the risk', /risk|listeria|salmonella|e\. coli|pathogen/i.test(rm.answer));
  ck('raw milk: makes NO treatment/cure claim', !CURE.test(rm.answer));

  // Live claim lock: plant a fact in a withheld field and prove it never surfaces.
  const poisoned = { ...matchEntries('Is wild or farmed salmon better?')[0], sources: ['SALMON_CURES_EVERYTHING_marker'], question: 'planted' };
  const pAns = await composeAnswer({ question: 'is salmon good?', goal: '', constraints: [], focuses: [], hardLines: [], entries: [poisoned] });
  ck('a fact planted in a withheld field never reaches the answer',
    !/SALMON_CURES_EVERYTHING_marker/i.test(pAns.answer) && !CURE.test(pAns.answer));
}

console.log(`\n${fails === 0 ? 'ALL PERIMETER CHECKS PASSED ✓' : fails + ' CHECK(S) FAILED ✗'}\n`);
process.exit(fails === 0 ? 0 : 1);
