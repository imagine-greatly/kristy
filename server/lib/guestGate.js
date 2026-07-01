// Guest memory-gate detection.
//
// A guest can log food and ask general nutrition questions for free — those are
// stateless. But the moment they ask Kristy to REMEMBER something (recall a past
// day, log a weigh-in to track over time, or get a weekly summary), there's no
// stored data to answer from. Rather than fake it, we trip a soft sign-in gate:
// "That's where I need to remember you."
//
// This is intentionally conservative — it fires only on clear memory-requiring
// intent, so general advice ("how much protein should I eat?") and plain meal
// logs still get real answers.

import { detectWeightLog } from './weightLog.js';

// Kristy's contextual invitations, per subtype. All use reason 'memory' to the
// client — the line is what changes.
const LINES = {
  weight:
    "That's a weigh-in — and a single number only means something once I can track it over time. Sign in and I'll start your trend, beginning with this one.",
  weekly:
    "A weekly read only works if I've been keeping the week. Sign in and I'll start remembering your days — then I can actually pull it together for you.",
  recall:
    "That's where I need to remember you. Sign in and I'll start keeping track — starting with this.",
};

// Explicit recall of a past day / prior logging.
const RECALL_RE =
  /\b(yesterday|last night|the other day|earlier (?:today|this week)|this morning|days? ago|previous days?|past (?:few )?days?|so far (?:today|this week))\b/i;

// Asking whether they hit / how they're doing against targets they'd need stored
// data to answer ("did I hit protein", "am I on track", "how am I doing").
const PROGRESS_RE =
  /\b(?:did|have)\s+i\s+(?:hit|reach|get|meet|make|log|eat|eaten|had|have)\b|\bam\s+i\s+(?:on track|hitting|getting|meeting|under|over)\b|\bhow\s+(?:am\s+i|'?m\s+i|i'?m)\s+doing\b|\bwhat\s+(?:did|have)\s+i\s+(?:eat|eaten|have|had|log|logged)\b|\bhow\s+much\s+(?:protein|carbs?|fat|calories?|cals?)\s+(?:have|did|do)\s+i\b|\bmy\s+(?:total|remaining|progress|streak)\b/i;

// Weekly summary / recap request.
const WEEKLY_RE =
  /\b(?:weekly|this\s+week|last\s+week|past\s+week)\b|\b(?:summary|recap|report)\b|\bhow(?:'?s| is| was)\s+(?:my|this|the)\s+week\b/i;

/**
 * Decide whether a guest message requires stored data (and therefore a sign-in).
 *
 * @param {string} message
 * @returns {{gate:true, reason:'memory', kristyLine:string} | {gate:false}}
 */
export function detectMemoryAction(message) {
  const text = String(message || '').trim();
  if (!text) return { gate: false };

  // A weigh-in is only meaningful once we can track the trend → gate it.
  if (detectWeightLog(text).isWeightLog) {
    return { gate: true, reason: 'memory', kristyLine: LINES.weight };
  }

  if (WEEKLY_RE.test(text)) {
    return { gate: true, reason: 'memory', kristyLine: LINES.weekly };
  }

  if (RECALL_RE.test(text) || PROGRESS_RE.test(text)) {
    return { gate: true, reason: 'memory', kristyLine: LINES.recall };
  }

  return { gate: false };
}
