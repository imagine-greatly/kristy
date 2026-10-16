// The counter's gap log — the moat widening from reality instead of guesswork.
//
// The Counter answers from a fixed KB of 77 entries. Every honest miss ("no solid
// read on that yet") is a real shopper naming, for free, exactly which entry should
// be written next. Unlogged, that signal evaporates: you cannot retroactively
// collect the questions your first users asked. So it is captured from day one.
//
// THE PRIVACY LINE, and it is the whole design:
//
//   QUESTIONS ARE POOLED. PEOPLE ARE NOT. This table records that a question was
//   asked and that nothing good answered it. It records nothing about who asked.
//   There is no per-user key on it and there never should be — the same discipline
//   scanned_products holds for products. A test greps this file for the column name
//   itself, which is why the name is spelled nowhere in this file, comments included.
//
//   THE TEXT IS NORMALIZED BEFORE IT IS STORED, not after. Free text typed by a
//   stranger is the one place identifying detail can arrive by accident, so the
//   raw string never reaches the database: it is lowercased, stripped of
//   punctuation, scrubbed of the two patterns that carry identity by construction
//   (an email address, a long digit run — a phone or a card), and capped. What
//   lands is a topic, which is all the authoring backlog ever needed.
//
//   AGGREGATE ONLY ON THE WAY OUT. gapFeed() returns counts per topic. There is no
//   read path that returns a single asking, because a single asking is not the
//   product question — "how many people wanted this" is.
//
// Fire-and-forget on every write, exactly like productStore: a shopper waiting on
// an answer must never wait on our analytics, and an unmigrated table must degrade
// to "not logged" rather than failing their question.

import { supabase } from './supabase.js';

const TABLE = 'counter_gaps';

// Two patterns that are identity by construction rather than by content. Anything
// else a shopper types about the fish counter is a topic, not a person.
const EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
// Five or more consecutive digits: a phone, a card, an order number. Short runs
// stay — "omega 3", "top 10 cuts", "2 percent milk" are the actual subject matter.
const LONG_DIGITS = /\b\d{5,}\b/g;

// A topic, not a transcript. Long enough for a real question, short enough that a
// pasted paragraph cannot ride in whole.
const MAX_LEN = 160;

/**
 * Reduce a shopper's question to the storable topic: scrubbed, normalized, capped.
 * Exported because the guarantee is worth testing directly rather than inferring
 * from what happens to land in a table.
 *
 * @returns {string} '' when nothing worth logging survives.
 */
export function normalizeQuestion(raw) {
  const scrubbed = String(raw ?? '')
    .replace(EMAIL, ' ')
    .replace(LONG_DIGITS, ' ');

  const topic = scrubbed
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LEN)
    .trim();

  // A one-character fragment is noise in the backlog, not a gap.
  return topic.length >= 3 ? topic : '';
}

/**
 * The question with its IDENTITY scrubbed but its wording intact — case, punctuation,
 * phrasing and all.
 *
 * `query_seed` on a generated card is the Pass 5 authoring signal: it is how you find out
 * that eleven people asked about cantaloupe and what words they used. normalizeQuestion
 * destroys that on purpose, because the GAP LOG only ever needed a topic to group on.
 * A stored card is different — it keeps one question, and the phrasing is the value.
 *
 * What does NOT relax is the scrub. Emails and long digit runs still go, and the cap still
 * applies, because free text typed by a stranger is the one place identity arrives by
 * accident and this table is shared by everyone. Preserving the sentence is not the same
 * as preserving the person.
 */
export function scrubQuestion(raw) {
  const scrubbed = String(raw ?? '')
    .replace(EMAIL, ' ')
    .replace(LONG_DIGITS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LEN)
    .trim();
  return scrubbed.length >= 3 ? scrubbed : '';
}

/**
 * The score at or below which a match is "weak" — an entry exists and answers the
 * question poorly. Worth logging separately from a clean miss: a miss says write a
 * new entry, a weak match says the entry you have is not being found or not
 * answering. Calibrated against matchEntries' scoring, where a single one-word
 * alias hit scores 2 and a three-word alias scores 4.
 *
 * THIS IS NOT THE RETRIEVAL GATE, and the two must not be re-merged. counterAskPipeline
 * once set its confidence threshold to this constant under "one number, one meaning" —
 * but this number is an EDITORIAL judgment (is this worth re-authoring?) and that one is a
 * RETRIEVAL judgment with a generation bill attached (is this good enough to show?). They
 * answer different questions and they move for different reasons: the pipeline's gate
 * dropped to 2 on measured recall, while a weak-match ceiling of 2 would quietly shrink
 * the authoring backlog to match a retrieval tuning decision. Keep them apart.
 */
export const WEAK_MATCH_CEILING = 3;

/**
 * Which surface the gap came from.
 *
 * AN ASK-MISS AND A LIST-MISS ARE DIFFERENT EVIDENCE, and pooling them makes the backlog
 * worse rather than bigger. An ask-miss is "a shopper wanted a read and got none" —
 * curiosity, and the wording is the signal. A list-miss is "a shopper is buying this every
 * week and the corpus is silent" — demand, and the frequency is the signal. Ranked in one
 * pile, silent weekly staples would outrank genuinely-asked questions, or the reverse; the
 * two need to be readable apart.
 *
 * `outcome` is deliberately NOT overloaded to carry this. It records how WELL the corpus
 * answered, which is orthogonal to where the question came from.
 */
// ponytail: an explicit "ask for this card" files as 'list' (the db check allows only ask/list),
// so a request adds weight to the same list topic; add a 'request' source with a migration if
// explicit asks ever need to be told apart.
const SOURCES = new Set(['ask', 'list']);

/**
 * Record one counter question that the KB did not answer well.
 *
 * @param {object} p
 * @param {string} p.question    the shopper's raw text — normalized here, never stored raw
 * @param {'miss'|'weak'} p.outcome
 * @param {'ask'|'list'} [p.source='ask']  which surface produced it
 * @param {string|null} [p.topEntryId]  for 'weak': what it did reach, so the fix is actionable
 * @param {number|null} [p.topScore]
 */
export async function logCounterGap({ question, outcome, source = 'ask', topEntryId = null, topScore = null }) {
  const topic = normalizeQuestion(question);
  if (!topic) return { logged: false, reason: 'nothing to log' };
  if (outcome !== 'miss' && outcome !== 'weak') return { logged: false, reason: 'bad outcome' };
  // An unknown source is a caller bug, and defaulting it silently would file list demand as
  // curiosity forever without anyone noticing.
  if (!SOURCES.has(source)) return { logged: false, reason: 'bad source' };

  try {
    const { error } = await supabase.from(TABLE).insert({
      question: topic,
      outcome,
      source,
      top_entry_id: topEntryId || null,
      top_score: Number.isFinite(topScore) ? topScore : null,
    });
    if (error) throw new Error(error.message);
    return { logged: true, topic };
  } catch (err) {
    // Unmigrated table / transient failure. Logged to the console, never surfaced,
    // never thrown — the shopper's answer does not depend on our backlog.
    console.warn('[kristy] counter gap not logged:', err?.message || err);
    return { logged: false, reason: err?.message || 'error' };
  }
}

/**
 * The frequency-ranked gap feed: the authoring backlog, in the order shoppers
 * actually asked for it.
 *
 * Aggregated in JS over a bounded recent window rather than by the SQL view in
 * schema.sql. Both exist on purpose — the view is for ad-hoc queries against the
 * database, this works today whether or not that migration has landed, which
 * matters because the loop has to capture (and be readable) from day one.
 *
 * @returns {Promise<{ rows: Array<{question,outcome,times_asked,last_asked,top_entry_id}>, total:number, window:number }>}
 */
export async function gapFeed({ limit = 50, sinceDays = 90, sampleCap = 5000 } = {}) {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('question, outcome, top_entry_id, asked_at')
      .gte('asked_at', since)
      .order('asked_at', { ascending: false })
      .limit(sampleCap);
    if (error) throw new Error(error.message);

    const byTopic = new Map();
    for (const r of data || []) {
      // Keyed by topic AND outcome: "nobody has an entry for lamb" and "the lamb
      // entry answers this badly" are different pieces of work.
      const key = `${r.outcome} ${r.question}`;
      const hit = byTopic.get(key);
      if (hit) {
        hit.times_asked += 1;
        if (r.asked_at > hit.last_asked) hit.last_asked = r.asked_at;
      } else {
        byTopic.set(key, {
          question: r.question,
          outcome: r.outcome,
          top_entry_id: r.top_entry_id || null,
          times_asked: 1,
          last_asked: r.asked_at,
        });
      }
    }

    const rows = [...byTopic.values()].sort(
      (a, b) => b.times_asked - a.times_asked || (a.last_asked < b.last_asked ? 1 : -1)
    );

    return {
      rows: rows.slice(0, limit),
      total: rows.length,
      // How many raw askings the ranking was computed from, so a truncated window
      // is visible in the dashboard rather than silently reading as "all of it".
      window: (data || []).length,
      truncated: (data || []).length >= sampleCap,
    };
  } catch (err) {
    console.warn('[kristy] gap feed unavailable:', err?.message || err);
    return { rows: [], total: 0, window: 0, truncated: false, unavailable: true };
  }
}
