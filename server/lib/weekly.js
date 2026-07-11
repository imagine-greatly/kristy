import { anthropic, MODEL } from './anthropic.js';
import {
  WEEKLY_SUMMARY_PROMPT,
  goalLabel,
  sportLabel,
} from './prompts.js';
import {
  getFullProfile,
  getRecentMeals,
  getWeightHistory,
  getAllUserIds,
  saveWeeklySummary,
} from './store.js';
import { getWeightTrend, normalizeToLbs } from './weightLog.js';
import { buildWeeklyData, buildGoalsBlock, dayKey } from './context.js';
import { isPremium } from './subscription.js';
import { pushToUser } from './push.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Compact weight section for the weekly summary, or '' when no data exists. */
function buildWeeklyWeightBlock(weekWeights = [], trend = null) {
  if ((!weekWeights || weekWeights.length === 0) && (!trend || trend.trend === 'insufficient_data')) {
    return '';
  }

  const lines = [];
  if (weekWeights.length) {
    const list = weekWeights
      .map((w) => {
        const day = WEEKDAYS[new Date(w.logged_at).getDay()];
        return `${normalizeToLbs(w.weight_value, w.weight_unit || 'lbs')}lbs (${day})`;
      })
      .join(', ');
    lines.push(`Weight this week: ${list}`);
  } else {
    lines.push('Weight this week: no weigh-ins logged');
  }

  if (trend && trend.trend !== 'insufficient_data') {
    if (trend.weeklyRate != null) {
      lines.push(`30-day trend: ${trend.trend} at ${trend.weeklyRate}lbs/week`);
    } else {
      lines.push(
        `30-day trend: ${trend.trend} (${trend.totalChange > 0 ? '+' : ''}${trend.totalChange}lbs so far — only same-day weigh-ins, not enough elapsed time for a weekly rate)`
      );
    }
  }
  return lines.join('\n');
}

/** Generate + store this past week's summary for one user. Returns the row or null. */
export async function generateWeeklySummaryForUser(userId) {
  // The Sunday summary is a premium (coaching) feature — skip non-premium users
  // entirely. Gates both the per-user route and the all-users cron below.
  if (!(await isPremium(userId))) return null;

  const [profile, meals, weekWeights, trend] = await Promise.all([
    getFullProfile(userId),
    getRecentMeals(userId, 7),
    getWeightHistory(userId, 7),
    getWeightTrend(userId, 30),
  ]);

  if (!meals.length) return null; // nothing to summarize

  const goals = {
    calories: profile.calories,
    protein: profile.protein,
    carbs: profile.carbs,
    fat: profile.fat,
  };
  const { block, averages } = buildWeeklyData(meals, goals);

  const completion = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: WEEKLY_SUMMARY_PROMPT({
          weeklyDataBlock: block,
          goalsBlock: buildGoalsBlock(goals),
          sport: sportLabel(profile.sport) || 'not specified',
          goalText: goalLabel(profile.goal),
          weightBlock: buildWeeklyWeightBlock(weekWeights, trend),
        }),
      },
    ],
  });

  const summaryText = (completion.content?.[0]?.text || '').trim();

  const weekStartDate = new Date();
  weekStartDate.setDate(weekStartDate.getDate() - 6);

  const row = await saveWeeklySummary(userId, {
    week_start: dayKey(weekStartDate),
    summary_text: summaryText,
    avg_calories: averages.calories,
    avg_protein: averages.protein,
    avg_carbs: averages.carbs,
    avg_fat: averages.fat,
  });

  // Mobile push: let the user know their Sunday read is ready. Fire-and-forget;
  // a no-op for users with no registered device.
  if (row) {
    pushToUser(userId, {
      title: 'Your weekly read is ready',
      body: 'Kristy summarized your week — what worked, and what to fix.',
      data: { type: 'weekly_summary' },
    }).catch(() => {});
  }

  return row;
}

/** Run for every user — used by the Sunday cron. */
export async function generateAllWeeklySummaries() {
  const ids = await getAllUserIds();
  let made = 0;
  for (const id of ids) {
    try {
      const row = await generateWeeklySummaryForUser(id);
      if (row) made += 1;
    } catch (err) {
      console.error(`[kristy] weekly summary failed for ${id}:`, err.message);
    }
  }
  console.log(`[kristy] weekly summaries generated: ${made}/${ids.length}`);
  return made;
}
