import { Router } from 'express';
import { requireAuth } from '../lib/supabase.js';
import { userRateLimit } from '../lib/rateLimit.js';
import { buildProfileBlock, buildWeightBlock } from '../lib/prompts.js';
import { computeInsight } from '../lib/insights.js';
import { pushToUser } from '../lib/push.js';
import { resolveMeal, generateReply } from '../lib/chatEngine.js';
import { premiumForReq } from '../lib/subscription.js';
import { detectHistoryRecall, WEIGHT_UPGRADE_LINE } from '../lib/historyRecall.js';
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
    // 0. Is this a weight log? Decided up front so we can route around the food
    //    path (no Nutritionix/meal save) when it is.
    let detected = detectWeightLog(message);

    // 0a. Premium gate (one cached read per request). Free users keep meal
    //     logging + today's conversation; the coaching layer (weight tracking,
    //     history recall, insights) routes to an in-voice upgrade nudge instead.
    const premium = await premiumForReq(req);

    if (!premium) {
      // Weigh-in → acknowledge the number, but the trend + adaptive retune are
      // coaching. Don't save the weight; nudge to upgrade. (Client routes the
      // `locked` flag to the upgrade view.)
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

      // History beyond today ("what did I have yesterday", "this week's recap")
      // → warm one-line nudge in Kristy's voice, not a paywall screen.
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

    // 1. Gather context: profile + last 7 days of meals + weight trend + latest
    //    weigh-in (all defensive — weight reads return safe defaults if the
    //    migration hasn't been applied yet).
    const [profile, recentMeals, trend, latestWeight] = await Promise.all([
      getFullProfile(userId),
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

    // 2. If it's a weight log: save it, retune the target, and build the event.
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

        // Re-pull the goals row — calories/current_weight may have just changed.
        activeProfile = await getFullProfile(userId);
        goals = {
          calories: activeProfile.calories,
          protein: activeProfile.protein,
          carbs: activeProfile.carbs,
          fat: activeProfile.fat,
        };
        weightEvent = buildWeightEvent(detected, weightTrend, recalculated);
      } catch (err) {
        // Weight tables not ready / write failed → fall back to normal chat.
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

    // Typed-meal resolution — parse foods + grams, look each up in USDA for real
    // macros, scale and sum. Skipped for weigh-ins (handled above). Any failure
    // degrades gracefully to the old single-call behavior where Haiku estimates
    // the macros itself. Shared with /api/guest/chat via chatEngine.
    const mealResolution = detected.isWeightLog ? null : await resolveMeal(message);

    // 3–4. Build the system prompt around the real macros, run inference, parse,
    //       and override the macro card with authoritative USDA totals.
    const result = await generateReply({
      message,
      conversationHistory,
      contextBlocks: {
        profileBlock: buildProfileBlock(activeProfile),
        historyBlock: buildHistoryBlock(recentMeals, offsetMin, weightTrend),
        goalsBlock: buildGoalsBlock(goals),
        todayBlock: buildTodayBlock(todayTotals(recentMeals, offsetMin), goals, weightToday),
        weightBlock: buildWeightBlock(activeProfile, weightTrend),
      },
      mealResolution,
      weightEvent,
    });

    // 5. Persist. Always store the conversation so reloads restore it.
    await saveChatMessage(userId, { role: 'user', content: message });

    // A weight log never logs a meal, even if Haiku slips and returns hasFood.
    if (result.hasFood && !detected.isWeightLog) {
      await saveMeal(userId, {
        foods: result.foods,
        macros: result.macros,
        rawInput: message,
        // 'usda' when every item matched the database; 'estimate' if any item
        // (or the whole message, when the parser didn't classify it as a meal)
        // fell back to a Claude estimate.
        source: mealResolution ? mealResolution.source : 'estimate',
        breakdown: mealResolution ? mealResolution.breakdown : null,
      });

      // Proactive insights are a premium (coaching) feature. Free users still
      // get the meal logged with real macros — just no server-side nudge.
      if (premium) {
        // Re-pull meals (now including this one) and run proactive insight logic.
        const freshMeals = await getRecentMeals(userId, 7);
        const proactive = computeInsight(freshMeals, goals, offsetMin, activeProfile, {
          trend: weightTrend,
          lastLoggedAt: latestWeight?.logged_at,
        });
        if (proactive) {
          result.insight = proactive; // server insight wins
          // Mobile push: deliver the insight as a notification too. Fire-and-forget
          // and a no-op for users with no registered device (i.e. web-only users).
          pushToUser(userId, { title: 'Kristy', body: proactive }).catch(() => {});
        }
      } else {
        // Never leak a model-echoed insight to a free user.
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
    // Anthropic / USDA / Supabase failed. Log with context, and hand the client
    // a line Kristy could plausibly say so it renders as a normal chat bubble
    // instead of a broken UI. No stack trace or raw error leaves the server.
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
