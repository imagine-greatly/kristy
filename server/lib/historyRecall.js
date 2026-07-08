// History-recall detection for AUTHENTICATED free users.
//
// Free users get full logging + conversation about TODAY. What they don't get is
// Kristy reaching back through their history — recalling a past day or pulling a
// week together. That's the coaching side. When a free user asks for it we don't
// show a paywall screen; Kristy answers in her own voice with a one-line nudge
// and the client offers the upgrade.
//
// This is deliberately narrow: it fires only on explicit past-time references or
// an explicit weekly/summary request. "How much protein do I have left?" and
// "am I on track today?" are about the current day — those stay free.

// Explicit references to a day (or span) other than today.
const PAST_DAY_RE =
  /\b(yesterday|last night|the other day|earlier this week|days? ago|previous days?|past (?:few )?days?|couple (?:of )?days ago|two days ago)\b/i;

// "what did I eat/have/log ..." — a request to recall logged items (any day).
const RECALL_VERB_RE =
  /\bwhat\s+(?:did|have)\s+i\s+(?:eat|eaten|have|had|log|logged|track|tracked)\b/i;

// A recall/question cue — distinguishes "how did I do yesterday?" (recall, gated)
// from "I had chicken yesterday" (a retroactive food log, NOT gated). Notably
// excludes bare food verbs (ate/had/eat) so a past-day log still logs.
const RECALL_CUE_RE =
  /\b(what|how|show|pull|recall|remember|check|see|did i|was i|were my|on track|hit|reach)\b|\?/i;

// Weekly summary / recap request.
const WEEKLY_RE =
  /\b(?:this\s+week|last\s+week|past\s+week|weekly)\b|\b(?:summary|recap|report)\b|\bhow(?:'?s| is| was)\s+(?:my|this|the)\s+week\b/i;

// Kristy's upgrade nudges — direct, warm, one sentence, never salesy.
const LINES = {
  history:
    "Reaching back through your history is my coaching side — want me to keep track of everything for you?",
  weekly:
    "Pulling your week together is part of the coaching — want me to start keeping your days so I can do that?",
};

/**
 * Does this authed free-user message require history beyond today?
 * @param {string} message
 * @returns {{locked:true, kind:'history'|'weekly', message:string} | {locked:false}}
 */
export function detectHistoryRecall(message) {
  const text = String(message || '').trim();
  if (!text) return { locked: false };

  if (WEEKLY_RE.test(text)) {
    return { locked: true, kind: 'weekly', message: LINES.weekly };
  }
  // Explicit recall verb ("what did I eat…"), or a past-day reference paired
  // with a recall/question cue ("how did I do yesterday?"). A bare past-day
  // food statement ("I had chicken yesterday") falls through and logs normally.
  if (RECALL_VERB_RE.test(text) || (PAST_DAY_RE.test(text) && RECALL_CUE_RE.test(text))) {
    return { locked: true, kind: 'history', message: LINES.history };
  }
  return { locked: false };
}

// The free-user weigh-in nudge (used by the chat pipeline when a non-premium
// user logs weight). We still acknowledge the number — we just don't track it.
export const WEIGHT_UPGRADE_LINE =
  "Tracking your weight trend and retuning your targets is where I do my best work — want me to keep track of everything for you?";
