import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { imageUpload } from '../lib/upload.js';
import { anthropic, MODEL } from '../lib/anthropic.js';
import { parseChatJSON } from '../lib/parse.js';
import { saveMeal, saveChatMessage } from '../lib/store.js';

const router = Router();

const PHOTO_SYSTEM = `You are Kristy, a nutrition assistant. The user has sent a photo of their food. Estimate the macros as accurately as possible based on what you can see. Be honest about uncertainty — if it's hard to tell portion size, say so and give a range. Respond ONLY with valid JSON:
{
  "message": "conversational response describing what you see and acknowledging the estimate (1-2 sentences)",
  "hasFood": true,
  "macros": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
  "foods": ["identified item 1", "identified item 2"],
  "insight": "",
  "isEstimate": true,
  "estimateNote": "one short honest caveat about portion uncertainty if relevant, else empty string"
}`;

const ERROR_MSG = "Couldn't read that photo clearly — try again or type it out";

// POST /api/photo  (multipart: image, message?) → Claude vision estimate.
// Returns the same shape as /api/chat (plus isEstimate / estimateNote).
// userRateLimit runs before multer so a limited caller never uploads the file.
router.post('/photo', requireAuth, userRateLimit, imageUpload.single('image'), async (req, res) => {
  const userId = req.user.id;
  const message = (req.body?.message || '').trim();

  if (!req.file) {
    return res.status(400).json({ error: 'image is required' });
  }

  try {
    const base64 = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype || 'image/jpeg';

    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: PHOTO_SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: message || 'Here is a photo of my meal — what are the macros?',
            },
          ],
        },
      ],
    });

    const text = completion.content?.[0]?.text || '';
    const base = parseChatJSON(text); // { message, hasFood, macros, foods, insight }

    // parseChatJSON drops the vision-only fields, so pull them out directly.
    let isEstimate = true;
    let estimateNote = '';
    try {
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1) {
        const j = JSON.parse(text.slice(first, last + 1));
        if (typeof j.isEstimate === 'boolean') isEstimate = j.isEstimate;
        estimateNote = String(j.estimateNote || '');
      }
    } catch {
      /* keep defaults */
    }

    if (message) await saveChatMessage(userId, { role: 'user', content: message });

    if (base.hasFood) {
      await saveMeal(userId, {
        foods: base.foods,
        macros: base.macros,
        rawInput: message || '[photo]',
      });
    }

    await saveChatMessage(userId, {
      role: 'ai',
      content: base.message,
      macros: base.hasFood
        ? { ...base.macros, foods: base.foods, insight: base.insight, isEstimate, estimateNote }
        : null,
    });

    return res.json({ ...base, isEstimate, estimateNote });
  } catch (err) {
    console.error('[kristy] /api/photo error:', err.message);
    return res
      .status(500)
      .json({ error: 'vision failed', message: ERROR_MSG, hasFood: false, macros: null, foods: [], insight: '' });
  }
});

export default router;
