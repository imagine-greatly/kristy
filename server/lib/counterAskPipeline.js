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
import { scrubQuestion, logCounterGap, WEAK_MATCH_CEILING } from './counterGaps.js';
import { projectEntry, getGeneratedCards, scoreGenerated, bumpUseCount } from './counterCards.js';
import { generateCard, persistCard } from './counterGenerate.js';
import { generationLimited, globalCeilingReached } from './counterRate.js';

// The reviewed do lines, for projecting a curated entry into a card at request time.
// Loaded once; see counterCards.js for why this is optional.
import { parseReviewTable } from './counterCards.js';
import { readFileSync } from 'node:fs';

const reviewed = (() => {
  try {
    return parseReviewTable(readFileSync(new URL('../../docs/do-lines-review.md', import.meta.url), 'utf8'));
  } catch {
    return new Map();
  }
})();

// A retrieval is confident enough to answer with when the deterministic matcher scores it
// above the weak ceiling — the same threshold the gap log uses to decide that an entry
// exists and answers badly. One number, one meaning.
const CONFIDENT = WEAK_MATCH_CEILING;

// GENERATED CARDS GET A LOWER BAR, and the asymmetry is deliberate.
//
// The curated ceiling assumes a KB entry carrying a dozen aliases, several of which hit a
// real question, so the scores accumulate past 3. A generated card carries six or seven
// aliases authored for ONE subject: on "how do I pick a good cantaloupe" exactly one of
// them lands — the bare noun — for a score of 2. Held to the curated ceiling, the card
// that was just written for this exact question never answers it, and the question
// regenerates at full price forever. That is precisely what it did.
//
// One alias hit is the floor: scoreGenerated awards 2 for a single-word alias, so this is
// "at least one authored alias matched". The costs are not symmetric — a slightly loose
// retrieval shows a closely-related card, a strict one bills for a duplicate answer.
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
