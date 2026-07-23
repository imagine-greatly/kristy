// Conversational list composer — the natural-language editor behind the List's
// "tell me what else you need" input and "build me a cart for ___".
//
// A shopping list is a list of GROCERY ITEM NAMES — it carries no health claim, so
// this is claim-safe by construction: the model may only emit item names + sections
// + a one-line summary. The prompt forbids every health claim, price, and any item
// that crosses a hard line, and the route applies the result deterministically
// (add/remove by name) so nothing free-form reaches a verdict or a KB.

import { anthropic, MODEL } from './anthropic.js';
import { labelForGoal, labelForFocus, labelForHardLine, labelForConstraint } from './taxonomy.js';

const str = (x) => String(x ?? '').trim();
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

// Walking-order store sections the model may assign. The client groups + orders by
// these (perimeter first, frozen last).
export const SECTIONS = ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Snacks', 'Frozen'];

export const LIST_COMPOSE_SYSTEM = `You are Kristy, a grocery coach, editing a shopper's SHOPPING LIST from a natural-language instruction. You output grocery ITEMS ONLY — plain things you buy at a store — plus a one-line summary of what you changed, in your voice.

You are given: the shopper's instruction, their current list (may be empty), and their preferences (goal / focuses / hard lines / constraints).

Return ONLY this JSON, nothing else:
{
  "add":    [ { "name": "ground beef", "section": "Meat & Seafood" } ],
  "remove": [ "white rice" ],
  "summary": "one line in your voice — what you did"
}
- "add": new grocery items to put on the list (empty array if none).
- "remove": names ALREADY on the current list to drop (match them closely; empty array if none).
- Each item's "section" MUST be exactly one of: ${SECTIONS.map((s) => `"${s}"`).join(', ')}.

HARD RULES — absolute:
- Items are PLAIN GROCERY NAMES. No brands-as-claims, no macros, no calories, no health/medical language of ANY kind. A list is a list.
- NO PRICE, ever. "Budget" means cheaper-per-nutrition SELECTION (dried beans, whole chicken, frozen veg), never a dollar figure or "cheap/expensive" label on the item.
- Respect HARD LINES: never add anything the shopper refuses (e.g. "no seed oils" → never margarine or vegetable/canola oil; use olive oil, butter, or ghee instead).
- Honor CONSTRAINTS in what you pick: budget → cheaper staples; short on time / no kitchen → no-/low-prep; picky kids → familiar; cooking for one → portionable. Still just item names.
- Fulfill the instruction concretely. "add taco night" → the real ingredients (ground beef or seasoned beans, tortillas, peppers, onion, cheese, salsa). "swap the rice for something faster" → remove the rice, add a faster starch (microwaveable rice pouch, couscous). "cooking for four" → say so in the summary; scale is quantity, so add only what's implied.
- summary is ONE sentence, warm and specific — no moralizing, no wellness-speak, no health claim.
- If the instruction isn't about groceries at all, return empty add/remove and a summary that says you weren't sure what to put on the list.`;

/** The DATA payload: instruction + current item names + the shopper's pref labels. */
export function buildComposeInput({ instruction, mode = 'edit', currentItems = [], goal, focuses, hardLines, constraints }) {
  return {
    mode, // 'edit' (change the current list) or 'build' (compose a fresh cart)
    instruction: str(instruction),
    currentList: (currentItems || []).map((n) => str(n)).filter(Boolean).slice(0, 120),
    shopper: {
      goal: goal ? labelForGoal(goal) || str(goal) : null,
      focuses: list(focuses).map((f) => labelForFocus(f) || f),
      hardLines: list(hardLines).map((h) => labelForHardLine(h) || h),
      constraints: list(constraints).map((c) => labelForConstraint(c) || c),
    },
  };
}

/** Parse the model's { add, remove, summary }. Defensive (same posture as parseNoteJSON). */
export function parseComposeJSON(text) {
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
  const add = Array.isArray(obj.add)
    ? obj.add
        .map((i) => ({
          name: str(i?.name),
          section: SECTIONS.includes(str(i?.section)) ? str(i.section) : 'Pantry',
        }))
        .filter((i) => i.name)
        .slice(0, 40)
    : [];
  const remove = list(obj.remove).slice(0, 40);
  const summary = str(obj.summary);
  if (!add.length && !remove.length && !summary) return null;
  return { add, remove, summary };
}

async function callCompose({ input, corrective }) {
  const data = `DATA:\n${JSON.stringify(input)}`;
  const userText = corrective
    ? `Your previous reply was not valid JSON. Reply again with ONLY the JSON object {"add":[...],"remove":[...],"summary":"..."} — no prose, no code fence.\n\n${data}`
    : data;
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    temperature: 0.4,
    system: LIST_COMPOSE_SYSTEM,
    messages: [{ role: 'user', content: userText }],
  });
  return completion.content?.[0]?.text || '';
}

/**
 * Compose a list edit from a natural-language instruction. Returns { add, remove, summary }.
 * @throws Error('list-compose-unparseable') when both attempts fail to parse.
 */
export async function composeListEdit(args) {
  const input = buildComposeInput(args);
  let parsed = parseComposeJSON(await callCompose({ input, corrective: false }));
  if (!parsed) parsed = parseComposeJSON(await callCompose({ input, corrective: true }));
  if (!parsed) throw new Error('list-compose-unparseable');
  return parsed;
}
