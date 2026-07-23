// The Perimeter — Kristy's sourced answers for the parts of the store with no barcode
// (produce, the butcher and fish counters, dairy, bulk bins, and label terms).
//
// This mirrors the ingredient KB but is a SEPARATE knowledge base, loaded here and
// NEVER fed into the verdict engine — perimeter entries are TOPICS that answer a
// question, not flags that score a product. matchIngredients / scoreVerdict never see
// them.
//
// The one model call (composeAnswer) sits behind the SAME structural claim lock as the
// verdict note: sanitizeForModel() reduces each retrieved entry to the seven fields the
// prompt is allowed to see, so the model can only rephrase what it was handed. `sources`,
// `aliases`, `question`, `id`, and `category` never reach the model — a fact planted in
// any of them cannot be echoed. Tradition (time_tested) may justify food-worth only, and
// the no-treatment rule is absolute, exactly as in verdictNote.js.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { anthropic, MODEL } from './anthropic.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_PATH = join(__dirname, '..', 'kristy_perimeter_kb.json');

export const perimeterKb = JSON.parse(readFileSync(KB_PATH, 'utf8'));

const str = (x) => String(x ?? '').trim();
const norm = (s) => str(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Common words that must never, on their own, match a topic (a title like "Beef cuts —
// what's for what" should not answer "what time does the store close?").
const STOPWORDS = new Set(
  'a an and are as at be but by do does for from how i if in is it its my no not of on or our so the their them then there this to up us was what when where which who why with you your'.split(' ')
);

export const NO_ANSWER =
  perimeterKb.no_answer ||
  "I don't have a solid answer on that one yet — and I'd rather say so than guess.";

/* ───────────────────────── Retrieval (deterministic, no model) ─────────────────────────
   Score each entry by how many of its alias phrases (and title words) appear in the
   question. Longer alias phrases weigh more. Returns the best matches above a floor, so
   an off-topic question yields nothing and Kristy says so honestly instead of improvising. */
export function matchEntries(question, limit = 3) {
  const q = ` ${norm(question)} `;
  if (q.trim().length < 2) return [];

  const scored = [];
  for (const e of perimeterKb.entries || []) {
    let score = 0;
    for (const alias of e.aliases || []) {
      const a = norm(alias);
      if (a && q.includes(` ${a} `)) score += Math.min(3, a.split(' ').length) + 1;
    }
    // Title-word overlap is a weaker signal (helps single-word questions). Deduped and
    // stopword-filtered so a common word can't manufacture a match on its own.
    for (const w of new Set(norm(e.title).split(' '))) {
      if (w.length >= 4 && !STOPWORDS.has(w) && q.includes(` ${w} `)) score += 1;
    }
    if (score > 0) scored.push({ e, score });
  }

  scored.sort((a, b) => b.score - a.score);
  // Only keep entries within reach of the top score, so a single strong match doesn't
  // drag in weakly-related ones.
  const top = scored[0]?.score || 0;
  return scored
    .filter((s) => s.score >= Math.max(2, top - 2))
    .slice(0, limit)
    .map((s) => s.e);
}

/* ───────────────────────── Free universal layer (verbatim KB read) ─────────────────────────
   The perimeter entries are FREE — the acquisition/SEO layer, same as the ingredient
   pages. This is a straight read of the file (no model), so there is nothing to
   claim-lock: every field is authored in the KB. `sources` is included here for display
   (it is NOT sent to the model). */
export function publicEntry(e) {
  return {
    id: e.id,
    title: e.title,
    category: e.category || null,
    question: e.question || null,
    short_answer: e.short_answer || '',
    detail: e.detail || '',
    evidence_tier: e.evidence_tier || null,
    evidence_framing: (e.evidence_tier && perimeterKb.evidence_tiers?.[e.evidence_tier]) || null,
    kristy_take: e.kristy_take || null,
    buying_tips: Array.isArray(e.buying_tips) ? e.buying_tips : [],
    labels_decoded: Array.isArray(e.labels_decoded) ? e.labels_decoded : [],
    sources: Array.isArray(e.sources) ? e.sources : [],
  };
}

/* ───────────────────────── The claim lock (what the MODEL may see) ─────────────────────────
   The structural boundary: exactly the seven allowed fields. Everything else on the
   entry — sources, aliases, question, id, category, and ANYTHING injected upstream —
   is dropped before the model is called, so it cannot surface a fact it never received. */
export function sanitizeForModel(e) {
  return {
    title: e.title,
    short_answer: e.short_answer,
    detail: e.detail,
    evidence_tier: e.evidence_tier,
    buying_tips: Array.isArray(e.buying_tips) ? e.buying_tips : [],
    labels_decoded: Array.isArray(e.labels_decoded) ? e.labels_decoded : [],
    kristy_take: e.kristy_take ?? null,
  };
}

// The EXACT system prompt for the perimeter answer — same claim-lock doctrine as the
// verdict note. Do NOT paraphrase.
export const PERIMETER_ANSWER_SYSTEM = `You are Kristy, a nutrition and grocery coach. A shopper is asking you about the parts
of the store that have no barcode — the fish counter, the butcher, produce, dairy, the
bulk aisle — or about what a label term actually means. You are warm, direct, and
practical, a coach who helps people buy well.

You will be given: the shopper's question, their goal/focuses/hard-lines/constraints (if
any), and one or more ENTRIES from your knowledge base — each with a short answer, a
fuller detail, an evidence tier, buying tips, decoded label terms, and (sometimes) your
own standard. Write Kristy's answer to the question, grounded ONLY in those entries.

Return two things:
1. answer — 2 to 5 sentences in your voice, answering the question directly and
   practically. Personalize to their goal/focuses/constraints when it genuinely fits
   (e.g. budget → point at the cheaper option in the entry; short on time → the no-prep
   one). Weave in a buying tip or a decoded label when useful.
2. refinement — if the question is about a specific item they might put on a list and
   the entry supports a concrete better version, give a SHORT refined item name (e.g.
   "Wild-caught salmon", "100% grass-finished ground beef", "Plain whole-milk yogurt").
   Otherwise set refinement to null.

HARD RULES — absolute:
- Use ONLY the facts in the provided entries. You may rephrase them in your voice. You
  may NEVER introduce a fact, statistic, health claim, or label rule that was not given
  to you. If it is not in the provided entries, it does not exist for this answer.
- Respect the evidence tier of each claim. For "established" speak plainly. For
  "credible_concern" say the concern is real but not fully settled. For
  "kristys_standard" frame it explicitly as YOUR standard/preference, not settled science
  ("that's my preference, not a proven upgrade"). For "time_tested" be clear that history
  is the evidence — a food-worth affirmation, never a health outcome.
- You are a coach, not a doctor. NEVER claim any food treats, manages, cures, prevents,
  or lowers the risk of a disease or condition — in either direction. Never state or imply
  the shopper has a medical condition. Never give a medical directive. If an entry notes
  something like mercury or a pathogen risk, present it as information about the food and
  defer anything medical to their doctor — never as a directive.
- NO PRICE. You do not know what anything costs at any store. You may say one option is
  cheaper per unit of nutrition or "does more per dollar" only if the entry frames it that
  way; you may NEVER quote a price or a dollar figure.
- If the entries don't actually answer their question, say so honestly and briefly rather
  than improvising from general knowledge.
- Keep it tight. No preamble, no sign-off.

Return ONLY this JSON: {"answer": "...", "refinement": "..." or null}`;

/** The payload for the answer call: the question + prefs + the SANITIZED entries. */
export function buildAnswerInput({ question, goal, focuses, hardLines, constraints, entries }) {
  const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
  return {
    question: str(question),
    shopper: {
      goal: str(goal) || null,
      focuses: list(focuses),
      hardLines: list(hardLines),
      constraints: list(constraints),
    },
    entries: (entries || []).map(sanitizeForModel),
  };
}

/** Parse the model's { answer, refinement }. Defensive, same posture as parseNoteJSON. */
export function parseAnswerJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a !== -1 && b !== -1) raw = raw.slice(a, b + 1);
  }
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }
  const answer = str(obj.answer);
  if (!answer) return null;
  const refinement = obj.refinement == null ? null : str(obj.refinement) || null;
  return { answer, refinement };
}

async function callAnswer({ input, corrective }) {
  const data = `DATA:\n${JSON.stringify(input)}`;
  const userText = corrective
    ? `Your previous reply was not valid JSON. Reply again with ONLY the JSON object {"answer": "...", "refinement": "..." or null} — no prose, no code fence.\n\n${data}`
    : data;
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0.4,
    system: PERIMETER_ANSWER_SYSTEM,
    messages: [{ role: 'user', content: userText }],
  });
  return completion.content?.[0]?.text || '';
}

/**
 * Compose Kristy's personalized perimeter answer for a question + matched entries.
 * @returns {Promise<{ answer:string, refinement:string|null }>}
 * @throws Error('perimeter-answer-unparseable') when both attempts fail to parse.
 */
export async function composeAnswer({ question, goal, focuses, hardLines, constraints, entries }) {
  const input = buildAnswerInput({ question, goal, focuses, hardLines, constraints, entries });
  let parsed = parseAnswerJSON(await callAnswer({ input, corrective: false }));
  if (!parsed) parsed = parseAnswerJSON(await callAnswer({ input, corrective: true }));
  if (!parsed) throw new Error('perimeter-answer-unparseable');
  return parsed;
}
