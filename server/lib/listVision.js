// Transcribe a photographed shopping list.
//
// Same plumbing and same discipline as labelVision.js: the model is an OCR
// transcriber and nothing else. It does not judge a food, rank one, comment on one,
// or decide anything about the shopper. Every judgment on this path happens
// afterwards and deterministically, in listImport.js — which is what keeps a photo
// of someone's handwriting from becoming a route for new health claims.
//
// The one rule that matters most here is about NOT guessing. A grocery list is
// handwritten, abbreviated, and personal; a confident misread sends someone home
// with the wrong thing and quietly rewrites what they asked for. So an unclear word
// comes back marked unreadable, with whatever was legible, and the shopper fixes it.

import { anthropic, MODEL } from './anthropic.js';

const str = (v) => (typeof v === 'string' ? v.trim() : '');

export const LIST_VISION_SYSTEM = `You are an OCR transcriber for handwritten and printed shopping lists. You are shown a photo of someone's grocery list — it may be handwritten, messy, on a torn scrap, angled, or badly lit. Transcribe only what is WRITTEN.

You do not interpret, judge, rank, correct, or comment on anything. You never assess whether a food is healthy, never suggest an alternative, and never add an item that is not written down. You are not a coach here; you are a transcriber.

Rules:

1. One entry per item on the list. Transcribe each item as written. If the list names a brand, keep the brand exactly as written — but never supply one that is not on the page. Keep descriptors too ("the good sourdough", "the 2% not the whole"). Expand only obvious, unambiguous shopping shorthand — "OJ" is orange juice, "tp" is toilet paper, "1/2 gal milk" is milk. If an abbreviation could be more than one thing, do NOT expand it.

2. Drop quantities and units from the item text ("2 lbs chicken" is "chicken"), but keep any words that describe WHICH product it is.

3. If a word or line is illegible, do NOT guess it. Return that entry with "unreadable": true and put whatever letters you could actually make out in "text" (an empty string if none). A guess is worse than a blank here — someone will shop from this.

   THIS IS THE RULE YOU ARE MOST LIKELY TO BREAK, so apply a stricter test than "can I make a good guess". If you would not bet on the word, it is unreadable. A short scrawled word is the dangerous case: "tp" read as "butter" sends someone home with the wrong thing and quietly rewrites what they asked for. Marking a legible word unreadable costs one tap to fix. Inventing a plausible one costs their trust. When those two are close, choose "unreadable": true.

4. Ignore anything that is not a shopping item: headings ("Groceries", "Costco"), dates, prices, totals, doodles, phone numbers.

5. A CROSSED-OUT ITEM IS NOT ON THE LIST. Omit it completely — do not return it, not even marked unreadable. Any line with a stroke through the words, scribbled over, or struck through however faintly, was DELIBERATELY REMOVED by the person who wrote it. Putting it back is the worst mistake you can make here, worse than missing a legible item: they decided against it and you would be overruling them. If a line has a horizontal mark running through the text, it is crossed out even when the words underneath are perfectly readable — readability is not the test, the stroke is.

Return ONLY this JSON: {"items": [{"text": "milk", "unreadable": false}, {"text": "ch??se", "unreadable": true}]}

If the photo contains no legible list at all, return {"items": []}.`;

/** Defensive parse — same posture as parseIngredientsJSON. Never throws. */
export function parseListJSON(text) {
  let raw = str(text);
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) raw = fence[1].trim();
  const start = raw.indexOf('{');
  if (start > 0) raw = raw.slice(start);
  if (!raw.startsWith('{')) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  const out = [];
  for (const it of items) {
    // Accept a bare string too — a model that ignores the shape shouldn't cost the
    // shopper their list.
    if (typeof it === 'string') {
      const t = str(it);
      if (t) out.push({ text: t, unreadable: false });
      continue;
    }
    const t = str(it?.text);
    const unreadable = it?.unreadable === true;
    // An entry with no text AND no unreadable flag carries nothing — drop it. An
    // unreadable one is kept even when empty, so the shopper sees a row to fix.
    if (!t && !unreadable) continue;
    if (t.length > 80) continue;
    out.push({ text: t, unreadable });
  }
  return { items: out.slice(0, 60) };
}

/** Photo → the shopper's own item strings. Transcription only, never judgment. */
export async function readListPhoto({ base64, mediaType = 'image/jpeg' }) {
  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: LIST_VISION_SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          {
            type: 'text',
            text: 'Transcribe the shopping list in this photo, one entry per item. Mark anything you cannot read clearly as unreadable rather than guessing it.',
          },
        ],
      },
    ],
  });
  const text = completion.content?.[0]?.text || '';
  return parseListJSON(text) || { items: [] };
}
