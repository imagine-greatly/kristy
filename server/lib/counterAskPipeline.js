// The counter's ask pipeline, in one place and testable without express.
//
//   scope → retrieve curated → retrieve generated → generate → lint+claimlock → persist → log
//
// Every stage can end the request, and the order is the cost order: the free deterministic
// checks run first so an off-topic question or an already-answered one never reaches a
// model call. Retrieval hits cost nothing and are not rate limited beyond the counter's
// own read bucket; only a GENERATION spends a slot.
//
// THE GAP LOG IS UNCONDITIONAL ON A MISS. Whatever the outcome — generated, refused,
// discarded, over budget — a question the curated KB could not answer lands in
// counter_gaps. That table is the authoring queue, and the questions worth authoring are
// exactly the ones the machine had to improvise or decline.

import { scoreEntries } from './perimeter.js';
import { inScope, outOfScopeLine } from './counterScope.js';
import { scrubQuestion, logCounterGap } from './counterGaps.js';
import { projectEntry, getGeneratedCards, scoreGenerated, bumpUseCount } from './counterCards.js';
import { generateCard, persistCard } from './counterGenerate.js';
import { generationLimited, globalCeilingReached } from './counterRate.js';

// The reviewed do lines, for projecting a curated entry into a card at request time.
//
// READ FROM lib/doLines.json, NOT FROM docs/. This used to read the review markdown
// through a try/catch that fell back to an empty Map, and the comment called that
// degradation "thinner rather than broken". It was broken: Railway's Root Directory is
// `server/`, docs/ never ships, and so EVERY curated card this pipeline returned carried
// an empty do line in production. The import below has no fallback on purpose — a missing
// file now takes the server down at boot instead of quietly serving gutted cards.
import doLines from './doLines.json' with { type: 'json' };

const reviewed = new Map(Object.entries(doLines).map(([slug, line]) => [slug, { do: line }]));

// RETRIEVAL CONFIDENCE IS ITS OWN NUMBER, and it is deliberately NOT the gap log's.
//
// These were one constant, justified as "one number, one meaning". They are two meanings.
// WEAK_MATCH_CEILING answers "does an entry exist that answers this badly enough to be
// worth re-authoring" — an editorial judgment about the backlog, and it stays at 3. This
// answers "is this match good enough to show a shopper instead of paying for a generation"
// — a retrieval judgment with a price attached. Sharing one number meant tuning retrieval
// silently re-scoped the authoring queue, and it pinned this gate to a value retrieval
// could not justify.
//
// THE OLD GATE WAS UNREACHABLE FOR THE COMMONEST QUESTION SHAPE. scoreEntries awards
// min(3, aliasWords) + 1 per alias hit, plus 1 per distinct title word. So a query whose
// only content word is a bare noun scores 2 for the single-word alias and 1 for the title
// overlap on that same noun. Three, always. Held to "> 3" it could never pass on that noun
// alone however exactly right the card was: "best yogurt to buy" scored 3 against
// yogurt_plain_vs_flavored — the correct card, no runner-up — and fell through to a
// 20-second generation every time. Three of the four cards the generator has written are
// duplicates of curated content it failed to retrieve this way, and one of those has
// already been served to three shoppers.
//
// MEASURED, not characterized, over 20 realistic queries: "> 3" answered 10 from curated,
// "> 2" answers 15. Every query the change rescues scored exactly 3 with NO RUNNER-UP, so
// the match was unambiguous and this buys recall without trading precision for it. "> 1"
// adds one more query and starts admitting bare title-word coincidences, which is where
// the trade would actually begin.
const CONFIDENT = 2;

// GENERATED CARDS GET THE SAME BAR. There is no longer an asymmetry to justify.
//
// This was a deliberately lower bar, resting on curated entries carrying "a dozen aliases"
// against a generated card's six. That premise was never measured and it is false. Curated
// alias counts, over all 79 entries: min 3, median 7, mean 7.11, max 19. Generated cards
// are authored with 6 to 8. Curated has no alias advantage, so there was never a reason
// for it to clear a higher bar — and the unchecked premise is exactly what kept it there.
//
// One alias hit is the floor either way: both scorers award 2 for a single-word alias, so
// this is "at least one authored alias matched". The costs are not symmetric — a slightly
// loose retrieval shows a closely-related card, a strict one bills for a duplicate answer.
const GENERATED_HIT = 2;

// What Kristy says when the corpus has nothing and generation could not run. Never an
// error, never an explanation of a budget.
const NO_READ = 'No solid read on that one yet.';

/**
 * Answer one counter question.
 *
 * @param {object} p
 * @param {string} p.query
 * @param {string|null} [p.userId]   null for an anonymous caller
 * @param {string} [p.ip]
 * @param {object} [p.client]        injectable Supabase client
 * @param {boolean} [p.allowGeneration=true]
 * @returns {Promise<object>} the response body
 */
export async function answerCounterQuestion({
  query,
  userId = null,
  ip = 'unknown',
  client = null,
  allowGeneration = true,
}) {
  const q = String(query || '').trim();

  /* ── 1. SCOPE. Free, deterministic, and it can never be skipped. ── */
  const scope = inScope(q);
  if (!scope.ok) {
    return { out_of_scope: true, reason: scope.reason, line: outOfScopeLine(scope.reason) };
  }

  /* ── 2a. RETRIEVE — curated, from memory, zero I/O. ── */
  const scored = scoreEntries(q, 3);
  const top = scored[0];
  if (top && top.score > CONFIDENT) {
    const card = projectEntry(top.entry, { doLine: reviewed.get(top.entry.id)?.do || '' });
    // The matched entries ride along for the PREMIUM personalization only. They are the
    // claim lock's input: composeAnswer sees seven whitelisted fields of these and nothing
    // else. A GENERATED card carries none, which is why it is never personalized — there
    // would be no locked source for the model to rephrase, and personalizing from thin air
    // is the exact failure the lock exists to prevent.
    return { card, source: 'curated', matched: true, score: top.score, entries: scored.map((s) => s.entry) };
  }

  /* ── 2b. RETRIEVE — generated, queried ONLY now, on a curated miss. ── */
  const gen = await getGeneratedCards(client);
  const genScored = scoreGenerated(q, gen.cards);
  const genTop = genScored[0];
  if (genTop && genTop.score >= GENERATED_HIT) {
    // A hit on a previously generated card is the loop paying off: someone else's question
    // answering this one, for free. It does not spend a generation slot.
    bumpUseCount(genTop.card.slug, client, genTop.card.use_count);
    return {
      card: genTop.card,
      source: 'generated',
      retrieved: true,
      matched: true,
      score: genTop.score,
      corpusTruncated: gen.truncated || undefined,
    };
  }

  // From here the curated KB has failed this question, so it belongs in the backlog no
  // matter how the rest of the request ends.
  const logMiss = (outcome = 'miss') =>
    logCounterGap({
      question: q,
      outcome,
      topEntryId: top?.entry?.id || null,
      topScore: top?.score ?? null,
    });

  /* ── 3. GENERATE, if there is budget for it. ── */
  const weakCurated = top ? { card: projectEntry(top.entry, { doLine: reviewed.get(top.entry.id)?.do || '' }), score: top.score } : null;

  const fallback = (reason) => {
    logMiss(top ? 'weak' : 'miss');
    // The nearest curated card beats an empty screen, but it is never presented as the
    // answer to the question actually asked.
    if (weakCurated) {
      return { card: weakCurated.card, source: 'curated', matched: false, nearest: true, line: NO_READ, reason };
    }
    return { card: null, matched: false, line: NO_READ, reason };
  };

  if (!allowGeneration) return fallback('generation_disabled');

  // FAIL CLOSED WHEN THE CORPUS IS UNREADABLE. If the generated cards cannot be queried,
  // two things are true at once: this question cannot be deduped against what already
  // exists, and a card written now probably cannot be stored either. Generating anyway
  // spends real money on an answer that evaporates and regenerates on the very next ask —
  // and the global ceiling counts PERSISTED rows, so it never engages to stop it.
  //
  // This is not hypothetical. counter_cards shipped without the `aliases` column, and that
  // is exactly the loop production ran until supabase/counter_cards_aliases.sql landed.
  if (gen.unavailable) return fallback('corpus_unavailable');

  const ceiling = await globalCeilingReached(client);
  if (ceiling.reached) return fallback(ceiling.reason === 'unreadable' ? 'ceiling_unreadable' : 'global_ceiling');

  if (generationLimited({ ip, userId })) return fallback('rate_limited');

  const { card, attempts, reason } = await generateCard({
    query: q,
    // The seed keeps the shopper's own wording — it is the Pass 5 authoring signal, and
    // normalizeQuestion would flatten exactly the part worth reading. Identity is still
    // scrubbed; see scrubQuestion.
    querySeed: scrubQuestion(q),
    entries: scored.map((s) => s.entry),
  });

  if (!card) {
    // Discarded, not softened. The question is logged either way.
    const out = fallback(reason || 'failed_checks');
    out.attempts = attempts.length;
    return out;
  }

  /* ── 4. PERSIST + LOG. ── */
  await persistCard(card, client);
  logMiss(top ? 'weak' : 'miss');

  return { card, source: 'generated', generated: true, matched: true, attempts: attempts.length };
}

export { NO_READ };
