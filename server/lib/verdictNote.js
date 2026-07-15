// Kristy's Verdict — the note composer. This is the ONE model call in the verdict
// pipeline, and it sits behind the claim-sourcing lock: it may only rephrase the
// KB-sourced concerns the Step 1 engine already surfaced. It can NEVER introduce a
// health concern that was not handed to it.
//
// Enforcement is STRUCTURAL, not just prompt-deep: `buildNoteInput` reduces each
// matched entry to exactly the five KB fields the prompt is allowed to see
// (name, one_liner, severity, evidence_tier, swap). The entry's `why`, `sources`,
// `kristy_note`, and anything else — including any concern injected upstream —
// never reach the model, so it cannot echo what it never received.

import { anthropic, MODEL } from './anthropic.js';

const str = (x) => String(x ?? '').trim();

// The EXACT system prompt for the note call — do NOT paraphrase (Step 2 brand law).
// Every ingredient/health claim Kristy can surface originates from a matched KB
// entry; this prompt only lets her rephrase what buildNoteInput() feeds her.
export const VERDICT_NOTE_SYSTEM = `You are Kristy, a nutrition and grocery coach. You help people decide what to put in
their cart, based on the goal they told you. You are warm, direct, and confident — a
coach, never a scold. You never fear-monger: every time you flag something, you point
to a better option in the same breath.

You will be given: the user's goal and non-negotiables, the verdict tier for a scanned
product, and the list of flagged ingredients that matched our knowledge base — each
with a plain-language reason, a severity, and an evidence tier. For approved products
the flagged list is empty.

Write two things:
1. note — one or two sentences in your voice, speaking to THIS user through their goal.
   Reference the goal naturally. Lead with what matters most for them.
2. swap — if the tier is swap_recommended or skip, name a better pick using ONLY the
   swap suggestions provided. If approved or approved_with_note, set swap to null.

HARD RULES — absolute:
- Use only the ingredient reasons and evidence given to you. You may rephrase them in
  your voice. You may NEVER introduce a health concern, cancer link, or claim about an
  ingredient that was not given to you. If it is not in the provided data, it does not
  exist.
- Respect the evidence tier. For "established" speak plainly. For "credible_concern"
  say the concern is real but not fully settled. For "kristys_standard" frame it
  explicitly as your standard, not settled science ("I hold a tighter line on this
  than the label requires").
- You are a coach, not a doctor. Never claim a food treats, manages, cures, or prevents
  any disease or condition. Never state or imply the user has a medical condition.
  Never give a medical directive.
- Keep it tight. No preamble, no sign-off.

Return ONLY this JSON: {"note": "...", "swap": "..." or null}`;

/**
 * The claim lock's structural boundary. Reduce matched KB entries to ONLY the
 * fields the note prompt may see. Everything else on the entry — `why`, `sources`,
 * `kristy_note`, and ANY field injected upstream — is dropped before the model is
 * called, so the model literally cannot echo a concern it never received.
 */
export function sanitizeFlagged(matched) {
  return (matched || []).map((e) => ({
    name: e.name,
    one_liner: e.one_liner,
    severity: e.severity,
    evidence_tier: e.evidence_tier,
    swap: e.swap ?? null,
  }));
}

/**
 * Build the user-message payload for the note call: tier + goal + non-negotiables
 * + the sanitized flagged list. Nothing else. This is the ONLY data the model sees.
 */
export function buildNoteInput({ tier, goal, nonNegotiables, matched }) {
  return {
    goal: str(goal) || 'general',
    nonNegotiables: Array.isArray(nonNegotiables) ? nonNegotiables.map(str).filter(Boolean) : [],
    tier,
    flagged: sanitizeFlagged(matched),
  };
}

/**
 * Parse the model's `{ note, swap }`. Defensive against a stray ```json fence or
 * surrounding prose (same posture as parse.js / lib/verdict.js). Returns null on
 * anything unusable so the caller can retry once, then fail gracefully.
 */
export function parseNoteJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const first = raw.indexOf('{');
    const last = raw.lastIndexOf('}');
    if (first !== -1 && last !== -1) raw = raw.slice(first, last + 1);
  }

  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    return null;
  }

  const note = str(obj.note);
  if (!note) return null; // the note is the product — no note, retry
  const swap = obj.swap == null ? null : str(obj.swap) || null;
  return { note, swap };
}

/* ───────────────────────── The one model call ─────────────────────────
   Low temperature for consistency. On malformed JSON, ONE corrective retry, then
   throw a sentinel the route translates into Kristy's graceful error. */
async function callNote({ input, corrective }) {
  const data = `DATA:\n${JSON.stringify(input)}`;
  const userText = corrective
    ? `Your previous reply was not valid JSON. Reply again with ONLY the JSON object {"note": "...", "swap": "..." or null} — no prose, no code fence.\n\n${data}`
    : data;

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    temperature: 0.4,
    system: VERDICT_NOTE_SYSTEM,
    messages: [{ role: 'user', content: userText }],
  });
  return completion.content?.[0]?.text || '';
}

/**
 * Compose Kristy's personal note + swap for a scored verdict.
 * @param {{ tier:string, goal:string, nonNegotiables:string[], matched:object[] }} args
 * @returns {Promise<{ note:string, swap:string|null }>}
 * @throws  Error('verdict-note-unparseable') when both attempts fail to parse.
 */
export async function composeNote({ tier, goal, nonNegotiables, matched }) {
  const input = buildNoteInput({ tier, goal, nonNegotiables, matched });

  let parsed = parseNoteJSON(await callNote({ input, corrective: false }));
  if (!parsed) parsed = parseNoteJSON(await callNote({ input, corrective: true }));
  if (!parsed) throw new Error('verdict-note-unparseable');

  return parsed;
}
