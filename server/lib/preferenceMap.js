// "Just tell me what you're shopping for" — natural language IN, enumerated
// preferences OUT.
//
// The model's only job is SELECTION. It picks from the taxonomy it is handed; it
// never authors a category, a rule, or a health claim. Everything it returns is
// then filtered against the enum again on our side, so even a model that ignores
// its instructions cannot introduce a new preference — the worst case is that a
// value gets dropped. That structural filter, not the prompt, is what makes this
// path safe (same doctrine as sanitizeFlagged in verdictNote.js).
//
// What it can't map, it must say out loud. A user who asks for something Kristy
// doesn't do should hear that plainly rather than silently get nothing.

import { anthropic, MODEL } from './anthropic.js';
import {
  GOALS, FOCUSES, HARD_LINES,
  GOAL_VALUES, FOCUS_VALUES, HARD_LINE_VALUES,
} from './taxonomy.js';
import { searchIngredients } from './hardLines.js';

const str = (x) => String(x ?? '').trim();

export const PREFERENCE_MAP_SYSTEM = `You are the intake mapper for Kristy, a grocery coach.

The user describes how they want to shop, in their own words. You map that onto a
FIXED taxonomy. You are a classifier, not an author.

ABSOLUTE RULES:
- You may ONLY return values from the lists provided in the DATA payload. Never invent
  a goal, focus, or hard line. Never return a value that is not in those lists.
- Pick AT MOST ONE goal — the closest match. If nothing is close, return null.
- Focuses and hard lines are subsets; return only what the user actually asked for.
  Do not pad the list with things they didn't say.
- Anything you could NOT map goes in "unmapped" as a short phrase in the user's own
  words. Be honest here — this is what Kristy tells them she couldn't do.
- You are not a medical system. Never infer a diagnosis or a condition from what they
  say, and never map a described condition onto a focus as if it were treatment.
  If someone names a medical condition, put it in "unmapped" — the focuses are
  preferences a person chooses, not conditions a system detects.
- Write nothing persuasive. No prose, no greeting.

Return ONLY this JSON:
{"goal": "<value>" or null, "focuses": ["<value>", ...], "hard_lines": ["<value>", ...], "unmapped": ["<phrase>", ...]}`;

/** Strip anything the model returned that isn't in the enum. The load-bearing guard. */
export function filterToTaxonomy(parsed, allowedHardLines = HARD_LINE_VALUES) {
  const uniq = (a) => [...new Set(a)];
  const goal = GOAL_VALUES.includes(parsed?.goal) ? parsed.goal : null;
  const focuses = uniq((Array.isArray(parsed?.focuses) ? parsed.focuses : []).map(str)).filter((f) =>
    FOCUS_VALUES.includes(f),
  );
  const hardLines = uniq((Array.isArray(parsed?.hard_lines) ? parsed.hard_lines : []).map(str)).filter((h) =>
    allowedHardLines.includes(h),
  );
  const unmapped = uniq((Array.isArray(parsed?.unmapped) ? parsed.unmapped : []).map(str).filter(Boolean));
  return { goal, focuses, hardLines, unmapped };
}

export function parseMapJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  if (!raw.startsWith('{')) {
    const a = raw.indexOf('{');
    const b = raw.lastIndexOf('}');
    if (a < 0 || b <= a) return null;
    raw = raw.slice(a, b + 1);
  }
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Kristy's reply about what she set and what she couldn't. Deterministic — this is
 * her voice, so it's authored here rather than generated, and it can only ever
 * name values that already passed the taxonomy filter.
 */
export function composeReply({ goal, focuses, hardLines, unmapped }, labels) {
  const set = [];
  if (goal) set.push(labels.goal(goal).toLowerCase());
  focuses.forEach((f) => set.push(labels.focus(f).toLowerCase()));
  hardLines.forEach((h) => set.push(labels.hardLine(h).toLowerCase()));

  if (!set.length && !unmapped.length) return "I didn't catch a preference in that — tell me what you're shopping for and I'll set it up.";

  const list = set.length > 1 ? `${set.slice(0, -1).join(', ')} and ${set[set.length - 1]}` : set[0];
  const head = set.length ? `I've set ${list}.` : "I couldn't map that to anything I hold a line on yet.";
  if (!unmapped.length) return head;

  const missed = unmapped.length > 1 ? `${unmapped.slice(0, -1).join(', ')} and ${unmapped[unmapped.length - 1]}` : unmapped[0];
  return `${head} The ${missed} part — that's not something I track yet. Pick the closest goal above and I'll hold the line on what I can see.`;
}

/** Map free text onto the taxonomy. Returns { goal, focuses, hardLines, unmapped, reply }. */
export async function interpretPreferences(text) {
  const input = str(text);
  if (!input) return { goal: null, focuses: [], hardLines: [], unmapped: [], reply: '' };

  // A custom hard line may name any KB ingredient, so the allowed set for THIS
  // call is the presets plus whatever the user's words actually surface in the KB.
  const custom = searchIngredients(input, 6).concat(
    input.split(/[,.;]| and /).flatMap((part) => searchIngredients(part, 3)),
  );
  const customValues = [...new Set(custom.map((c) => c.value))];
  const allowed = [...HARD_LINE_VALUES, ...customValues];

  const payload = {
    user_text: input,
    goals: GOALS,
    focuses: FOCUSES,
    hard_lines: [
      ...HARD_LINES.map((h) => ({ value: h.value, label: h.label })),
      ...custom.map((c) => ({ value: c.value, label: `no ${c.name.toLowerCase()}` })),
    ],
  };

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0,
    system: PREFERENCE_MAP_SYSTEM,
    messages: [{ role: 'user', content: `DATA:\n${JSON.stringify(payload)}` }],
  });

  const parsed = parseMapJSON(completion.content?.[0]?.text || '');
  const result = filterToTaxonomy(parsed || {}, allowed);

  const customLabel = (v) => {
    const hit = custom.find((c) => c.value === v);
    return hit ? `no ${hit.name.toLowerCase()}` : v;
  };
  const labels = {
    goal: (v) => GOALS.find((g) => g.value === v)?.label || v,
    focus: (v) => FOCUSES.find((f) => f.value === v)?.label || v,
    hardLine: (v) => HARD_LINES.find((h) => h.value === v)?.label || customLabel(v),
  };

  return { ...result, reply: composeReply(result, labels) };
}
