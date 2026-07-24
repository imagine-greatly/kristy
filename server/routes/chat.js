import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { buildPreferencesBlock } from '../lib/prompts.js';
import { generateReply } from '../lib/chatEngine.js';
import { premiumForReq } from '../lib/subscription.js';
import { migratePreferences } from '../lib/taxonomy.js';
import { looksLikePerimeterQuestion, looksLikePreferenceDeclaration } from '../lib/chatRouting.js';
import { interpretPreferences } from '../lib/preferenceMap.js';
import {
  matchEntries,
  composeAnswer,
  publicEntry,
  NO_ANSWER,
} from '../lib/perimeter.js';
import { getFullProfile, saveChatMessage, saveCoachProfile } from '../lib/store.js';

const router = Router();

/* ───────────────────────── Perimeter routing ─────────────────────────
   A no-barcode QUESTION ("is wild or farmed salmon better?", "which cut for
   stew?") is answered from the perimeter KB under its own claim lock — never
   from the model's own knowledge, and never mistaken for a meal to log. We only
   route questions (not statements or list commands), and only when the KB
   actually matches, so "I had chicken and rice" and "add chicken to my list"
   never get hijacked. Gating mirrors /api/perimeter/ask: free gets the KB
   entry's own words; premium gets the personalized, claim-locked read. */

const PERIMETER_UPSELL =
  "That's the honest rundown. Want my read for YOUR cart — against your goal and your week — and a swap I'll drop on your list? That part's for members.";

async function perimeterChatReply({ message, matched, premium, prefs }) {
  if (premium) {
    try {
      const { answer } = await composeAnswer({
        question: message,
        goal: prefs.goal,
        focuses: prefs.focuses,
        hardLines: prefs.hardLines,
        constraints: prefs.constraints,
        entries: matched,
      });
      if (answer) return answer;
    } catch (err) {
      console.error('[kristy] chat perimeter compose error:', err?.message || err);
      // fall through to the free KB read
    }
  }
  // Free (or a premium compose that failed): the entry's OWN words — claim-safe,
  // no model call.
  const top = publicEntry(matched[0]);
  const base = top.short_answer || top.detail || NO_ANSWER;
  return premium ? base : `${base} ${PERIMETER_UPSELL}`;
}

/* ───────────────────────── Preference declarations ─────────────────────────
   The shopper telling Kristy how they want to eat ("I eat holistically, no seed
   oils, take that into account"). Mapped onto the fixed taxonomy (the SAME claim-
   safe mapper the goal sheet uses — it can only ever select enum values, never
   author a claim), then — for members — persisted so it steers every future
   verdict, list, and perimeter answer. The confirmation names exactly what mapped
   and is honest about what didn't; the unmapped items are the user's own words,
   never a health claim. */

const uniq = (a) => [...new Set(a)];
const joinList = (arr) =>
  arr.length > 1 ? `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}` : arr[0] || '';

function composePrefConfirmation(mapped) {
  const names = mapped.labeled.map((x) => x.label.toLowerCase());
  let msg = `Locked in — ${joinList(names)}. That's my lens on every scan and every list from here.`;
  if (mapped.unmapped?.length) {
    msg += ` The ${joinList(mapped.unmapped)} part isn't something I hold a formal line on — I'll be straight with you about it when it comes up, not push it either way.`;
  }
  return msg;
}

function composePrefUpsell(mapped) {
  const names = mapped.labeled.map((x) => x.label.toLowerCase());
  return `I hear you — ${joinList(names)}. Holding that on every scan and building your list around it is the coaching part. Want me to lock it in so it steers every rec from here?`;
}

router.post('/chat', requireAuth, userRateLimit, async (req, res) => {
  const userId = req.user.id;
  const { message, conversationHistory = [] } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // The profile carries the shopping preferences Kristy speaks through on every
    // turn. There is no macro/meal/weight mode anymore — she is a grocery coach.
    const profile = await getFullProfile(userId);

    const migrated = migratePreferences({
      goal: profile.coach_goal,
      constraints: profile.constraints,
    });
    const prefs = {
      goal: migrated.goal,
      focuses: Array.isArray(profile.focuses) ? profile.focuses : [],
      hardLines: Array.isArray(profile.non_negotiables) ? profile.non_negotiables : [],
      constraints: migrated.constraints,
    };
    const preferencesBlock = buildPreferencesBlock(prefs);

    // Premium gate (one cached read per request) — for the personalized perimeter read.
    const premium = await premiumForReq(req);

    // 1. Perimeter question? Answer it from the KB (claim-locked) before the coach
    //    reply, so a no-barcode question is grounded in the KB, not improvised.
    if (looksLikePerimeterQuestion(message)) {
      const matched = matchEntries(message);
      if (matched.length) {
        const answer = await perimeterChatReply({ message, matched, premium, prefs });
        await saveChatMessage(userId, { role: 'user', content: message });
        await saveChatMessage(userId, { role: 'ai', content: answer });
        return res.json({
          message: answer,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          perimeter: true,
        });
      }
    }

    // 2. A standing PREFERENCE the shopper is declaring? Map it onto the taxonomy
    //    and — for members — persist it, so it steers every future verdict, list,
    //    and perimeter answer. Runs after perimeter so a question is never mistaken
    //    for a declaration; if nothing maps, falls through to the coach reply.
    if (looksLikePreferenceDeclaration(message)) {
      let mapped = null;
      try {
        mapped = await interpretPreferences(message);
      } catch (err) {
        console.error('[kristy] chat preference map error:', err?.message || err);
      }
      const hasAny =
        mapped &&
        (mapped.goal || mapped.focuses.length || mapped.hardLines.length || mapped.constraints.length);

      if (hasAny && premium) {
        const merged = {
          goal: mapped.goal || prefs.goal || null,
          focuses: uniq([...prefs.focuses, ...mapped.focuses]),
          hardLines: uniq([...prefs.hardLines, ...mapped.hardLines]),
          constraints: uniq([...prefs.constraints, ...mapped.constraints]),
        };
        try {
          await saveCoachProfile(userId, {
            coach_goal: merged.goal,
            non_negotiables: merged.hardLines,
            focuses: merged.focuses,
            constraints: merged.constraints,
          });
        } catch (err) {
          console.error('[kristy] chat preference save error:', err?.message || err);
          // Persist failed (e.g. unmigrated) — still confirm what mapped so the
          // turn isn't lost; the chips let the user re-apply from the switcher.
        }
        const answer = composePrefConfirmation(mapped);
        await saveChatMessage(userId, { role: 'user', content: message });
        await saveChatMessage(userId, { role: 'ai', content: answer });
        return res.json({
          message: answer,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          preferenceUpdate: { labeled: mapped.labeled, unmapped: mapped.unmapped, merged },
        });
      }

      if (hasAny) {
        // Free: name what she heard + an upsell. Capture is a member feature.
        const answer = composePrefUpsell(mapped);
        await saveChatMessage(userId, { role: 'user', content: message });
        await saveChatMessage(userId, { role: 'ai', content: answer });
        return res.json({
          message: answer,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          upgrade: true,
          preferenceLocked: true,
        });
      }
      // Nothing mapped → fall through to the normal coach reply.
    }

    // 3. Coach reply. The engine enforces the no-macro guarantee structurally.
    const profileLine = profile.name ? `Shopper: ${profile.name}.` : '';
    const result = await generateReply({
      message,
      conversationHistory,
      contextBlocks: { preferencesBlock, profileBlock: profileLine },
    });

    await saveChatMessage(userId, { role: 'user', content: message });
    await saveChatMessage(userId, { role: 'ai', content: result.message, macros: null });

    return res.json({ ...result });
  } catch (err) {
    console.error(
      `[kristy] /api/chat error (user ${userId}) @ ${new Date().toISOString()}:`,
      err?.message || err
    );
    return res.status(503).json({
      error: true,
      message: "I'm having trouble connecting right now — try that again in a moment.",
    });
  }
});

export default router;
