import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { buildProfileBlock, buildWeightBlock, buildPreferencesBlock } from '../lib/prompts.js';
import { computeInsight } from '../lib/insights.js';
import { pushToUser } from '../lib/push.js';
import { resolveMeal, generateReply } from '../lib/chatEngine.js';
import { premiumForReq } from '../lib/subscription.js';
import { detectHistoryRecall, WEIGHT_UPGRADE_LINE } from '../lib/historyRecall.js';
import { migratePreferences } from '../lib/taxonomy.js';
import { looksLikePerimeterQuestion } from '../lib/chatRouting.js';
import {
  matchEntries,
  composeAnswer,
  publicEntry,
  NO_ANSWER,
} from '../lib/perimeter.js';
import {
  getFullProfile,
  getRecentMeals,
  getLatestWeight,
  saveMeal,
  saveChatMessage,
} from '../lib/store.js';
import {
  detectWeightLog,
  saveWeightLog,
  getWeightTrend,
  shouldRecalculateTDEE,
  recalculateTDEEFromTrend,
} from '../lib/weightLog.js';
import {
  buildHistoryBlock,
  buildGoalsBlock,
  buildTodayBlock,
  todayTotals,
  localDayKey,
} from '../lib/context.js';

const router = Router();

// Describe a trend in plain language for the weight-log acknowledgment.
function describeTrend(trend) {
  if (!trend || trend.trend === 'insufficient_data') return 'not enough history yet';
  const dir =
    trend.trend === 'losing' ? 'down' : trend.trend === 'gaining' ? 'up' : 'flat';
  const mag = Math.abs(trend.totalChange);
  const span = trend.daysElapsed >= 1 ? ` over ${trend.daysElapsed} days` : ' so far';
  return `${trend.trend} (${dir} ${mag}lbs${span})`;
}

// The "user just logged weight" event block injected into the system prompt.
function buildWeightEvent(detected, trend, recalc) {
  const lines = [`User just logged weight: ${detected.value}${detected.unit}.`];

  if (trend && trend.trend !== 'insufficient_data') {
    lines.push(`Weight trend (last 30 days): ${describeTrend(trend)}.`);
    if (trend.weeklyRate != null) lines.push(`Weekly rate: ${trend.weeklyRate}lbs/week.`);
    else lines.push('Too little elapsed time for a weekly rate yet — treat as a single data point.');
  } else {
    lines.push('Not enough history yet for a trend — this is one of the first entries.');
  }

  if (recalc && recalc.adjusted) {
    const sign = recalc.adjustment > 0 ? '+' : '';
    lines.push(
      `Calorie target has been adjusted by ${sign}${recalc.adjustment} calories based on trend. New daily target: ${recalc.newCalories} calories. Tell them this number directly.`
    );
  }

  lines.push(
    'Acknowledge this weigh-in per the WEIGHT LOGGING rules: brief and factual, mention the trend in plain language if it exists, never celebrate or judge the number. This is not a food message — respond with hasFood: false.'
  );
  return lines.join('\n');
}

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

router.post('/chat', requireAuth, userRateLimit, async (req, res) => {
  const userId = req.user.id;
  const { message, conversationHistory = [], tzOffset } = req.body || {};
  const offsetMin = Number.isFinite(Number(tzOffset))
    ? Number(tzOffset)
    : new Date().getTimezoneOffset();

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // Fetch the profile up front — it decides the whole mode (macro tracking is
    // opt-in, OFF by default) and carries the shopping preferences Kristy speaks
    // through on every turn.
    const profile = await getFullProfile(userId);
    const macroTracking = !!profile.macro_tracking;

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

    // Premium gate (one cached read per request).
    const premium = await premiumForReq(req);

    // 0. Perimeter question? Answer it from the KB (claim-locked) before any
    //    weight/meal handling, so a no-barcode question never logs or gets a
    //    macro card. Applies in both modes.
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
          recalculated: null,
        });
      }
    }

    /* ─────────────── Coach mode (macro tracking OFF — the default) ───────────────
       No calories, no macros, no meal/weight pipeline. Kristy coaches about the
       food and the shopping; chatEngine strips any macro the model slips in. */
    if (!macroTracking) {
      const profileLine = profile.name ? `Shopper: ${profile.name}.` : '';
      const result = await generateReply({
        message,
        conversationHistory,
        contextBlocks: { preferencesBlock, profileBlock: profileLine },
        macroTracking: false,
      });

      await saveChatMessage(userId, { role: 'user', content: message });
      await saveChatMessage(userId, {
        role: 'ai',
        content: result.message,
        macros: null,
      });
      return res.json({ ...result, recalculated: null, weightLogged: false });
    }

    /* ─────────────── Macro mode (opt-in) — the full tracker pipeline ─────────────── */

    // Is this a weight log? Decided up front so we can route around the food path.
    let detected = detectWeightLog(message);

    if (!premium) {
      // Weigh-in → acknowledge the number, but the trend + adaptive retune are
      // coaching. Don't save the weight; nudge to upgrade.
      if (detected.isWeightLog) {
        const msg = `Got it — ${detected.value}${detected.unit}. ${WEIGHT_UPGRADE_LINE}`;
        await saveChatMessage(userId, { role: 'user', content: message });
        await saveChatMessage(userId, { role: 'ai', content: msg });
        return res.json({
          message: msg,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          locked: 'weight',
          upgrade: true,
          weightLogged: false,
          recalculated: null,
        });
      }

      // History beyond today → warm one-line nudge in Kristy's voice.
      const recall = detectHistoryRecall(message);
      if (recall.locked) {
        await saveChatMessage(userId, { role: 'user', content: message });
        await saveChatMessage(userId, { role: 'ai', content: recall.message });
        return res.json({
          message: recall.message,
          hasFood: false,
          macros: null,
          foods: [],
          insight: '',
          locked: recall.kind,
          upgrade: true,
          recalculated: null,
        });
      }
    }

    // Gather macro context: last 7 days of meals + weight trend + latest weigh-in.
    const [recentMeals, trend, latestWeight] = await Promise.all([
      getRecentMeals(userId, 7),
      getWeightTrend(userId, 30),
      getLatestWeight(userId),
    ]);

    let goals = {
      calories: profile.calories,
      protein: profile.protein,
      carbs: profile.carbs,
      fat: profile.fat,
    };

    let weightEvent = '';
    let recalculated = null;
    let weightTrend = trend;
    let activeProfile = profile;

    if (detected.isWeightLog) {
      try {
        await saveWeightLog(userId, detected.value, detected.unit);
        weightTrend = await getWeightTrend(userId, 30); // now includes this entry

        if (await shouldRecalculateTDEE(userId)) {
          recalculated = await recalculateTDEEFromTrend(userId, weightTrend, goals);
        }

        activeProfile = await getFullProfile(userId);
        goals = {
          calories: activeProfile.calories,
          protein: activeProfile.protein,
          carbs: activeProfile.carbs,
          fat: activeProfile.fat,
        };
        weightEvent = buildWeightEvent(detected, weightTrend, recalculated);
      } catch (err) {
        console.error('[kristy] weight pipeline error:', err.message);
        detected = { isWeightLog: false };
        weightEvent = '';
      }
    }

    // Weight logged today (for TODAY_BLOCK) — from this message or a prior one.
    const todayKey = localDayKey(new Date(), offsetMin);
    let weightToday = null;
    if (detected.isWeightLog) {
      weightToday = { value: detected.value, unit: detected.unit };
    } else if (
      latestWeight &&
      localDayKey(latestWeight.logged_at, offsetMin) === todayKey
    ) {
      weightToday = {
        value: latestWeight.weight_value,
        unit: latestWeight.weight_unit || 'lbs',
      };
    }

    // Typed-meal resolution — parse foods + grams, look each up in USDA, sum.
    const mealResolution = detected.isWeightLog ? null : await resolveMeal(message);

    const result = await generateReply({
      message,
      conversationHistory,
      contextBlocks: {
        preferencesBlock,
        profileBlock: buildProfileBlock(activeProfile),
        historyBlock: buildHistoryBlock(recentMeals, offsetMin, weightTrend),
        goalsBlock: buildGoalsBlock(goals),
        todayBlock: buildTodayBlock(todayTotals(recentMeals, offsetMin), goals, weightToday),
        weightBlock: buildWeightBlock(activeProfile, weightTrend),
      },
      mealResolution,
      weightEvent,
      macroTracking: true,
    });

    // Persist. Always store the conversation so reloads restore it.
    await saveChatMessage(userId, { role: 'user', content: message });

    if (result.hasFood && !detected.isWeightLog) {
      await saveMeal(userId, {
        foods: result.foods,
        macros: result.macros,
        rawInput: message,
        source: mealResolution ? mealResolution.source : 'estimate',
        breakdown: mealResolution ? mealResolution.breakdown : null,
      });

      if (premium) {
        const freshMeals = await getRecentMeals(userId, 7);
        const proactive = computeInsight(freshMeals, goals, offsetMin, activeProfile, {
          trend: weightTrend,
          lastLoggedAt: latestWeight?.logged_at,
        });
        if (proactive) {
          result.insight = proactive;
          pushToUser(userId, { title: 'Kristy', body: proactive }).catch(() => {});
        }
      } else {
        result.insight = '';
      }
    }

    await saveChatMessage(userId, {
      role: 'ai',
      content: result.message,
      macros: result.hasFood
        ? { ...result.macros, foods: result.foods, insight: result.insight }
        : null,
    });

    return res.json({ ...result, recalculated, weightLogged: detected.isWeightLog });
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
