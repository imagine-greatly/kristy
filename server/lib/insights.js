// Proactive insight logic — runs server-side after a meal is saved.
// Fires at most one insight per message, in the priority order below.

import { aggregateByDay, localDayKey, todayTotals } from './context.js';

/** Last N calendar days as user-local YYYY-MM-DD keys, newest first. */
function lastNDayKeys(n, offsetMin = 0) {
  const keys = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    keys.push(localDayKey(new Date(now - i * 86400000), offsetMin));
  }
  return keys;
}

/**
 * @param {Array} meals     last ~7 days of meal_logs (today's meal already saved)
 * @param {Object} goals    macro goals { calories, protein, carbs, fat }
 * @param {number} offsetMin client timezone offset (minutes, getTimezoneOffset)
 * @param {Object} profile  user profile { goal, sport, eating_pattern, ... }
 * @param {Object} weight   optional { trend, lastLoggedAt } for weight nudges
 * @returns {string} insight, or '' if nothing notable
 */
export function computeInsight(meals, goals, offsetMin = 0, profile = {}, weight = {}) {
  const byDay = aggregateByDay(meals, offsetMin);
  const today = todayTotals(meals, offsetMin);
  const recent = lastNDayKeys(7, offsetMin); // newest first

  const goal = profile.goal;
  const sport = profile.sport;

  // User-local wall-clock hour + weekday.
  const localNow = new Date(Date.now() - offsetMin * 60000);
  const hour = localNow.getUTCHours();
  const weekday = localNow.getUTCDay(); // 0 Sun … 6 Sat

  // Specifics Kristy quotes in her insights — never vague.
  const remainingProtein = Math.max(0, Math.round((goals.protein || 0) - today.protein));
  const remainingCarbs = Math.max(0, Math.round((goals.carbs || 0) - today.carbs));
  const timeStr = `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`; // e.g. "7pm"

  // Consecutive days (ending today) under the protein goal.
  let streak = 0;
  for (const key of recent) {
    const day = byDay.get(key);
    if (!day) break; // no logs that day → streak ends
    if (day.protein < goals.protein) streak += 1;
    else break;
  }

  // 1. Protein streak alert — under protein goal 3+ logged days in a row.
  //    Skipped for recomp users; trigger 7 gives them a goal-specific version.
  if (streak >= 3 && goal !== 'recomp') {
    return `Three days under on protein. Tonight get at least ${remainingProtein}g — chicken, beef, eggs, or Greek yogurt.`;
  }

  // 2. Under-eating flag — past 6pm (user-local) and >700 kcal under goal.
  if (hour >= 18 && goals.calories - today.calories > 700) {
    return `Light on calories for ${timeStr}. If that's not intentional, get a real meal in tonight.`;
  }

  // 3. Consistency win — logged every one of the last 7 days.
  const loggedAll7 = recent.every((key) => byDay.has(key));
  if (loggedAll7) {
    return 'Seven days logged. That consistency is what moves the needle.';
  }

  // 4. Goal hit celebration — protein goal reached today.
  if (today.protein >= goals.protein && goals.protein > 0) {
    return 'Protein target hit. Everything else today is a bonus.';
  }

  // 5. Post-workout protein window — for anyone who trains. In the couple of
  //    hours after a typical (≈5pm) training slot with protein still low.
  if (sport && hour >= 17 && hour < 19 && today.protein < 40) {
    return 'Get protein in within the next hour or two. 40 grams minimum — eggs, a shake, or Greek yogurt.';
  }

  // 6. Endurance carb flag — day before or day of a long session (Fri/Sat)
  //    with carbs running under half the daily target.
  if (
    sport === 'endurance' &&
    (weekday === 5 || weekday === 6) &&
    goals.carbs > 0 &&
    today.carbs < goals.carbs * 0.5
  ) {
    return `Carbs are low for a heavy training day — ${remainingCarbs}g short. Get rice, oats, potatoes, or fruit in before you train.`;
  }

  // 7. Recomp protein consistency — protein under goal 3+ consecutive days.
  if (goal === 'recomp' && streak >= 3) {
    return 'Three days under on protein — for recomping that\'s the one thing that matters most. Tonight make it the priority.';
  }

  // 8. Game day flag — team-sport users with calories very low heading into
  //    the evening (within ~4 hours of a typical 6pm).
  if (
    sport === 'team_sports' &&
    hour >= 14 &&
    hour < 18 &&
    goals.calories > 0 &&
    today.calories < goals.calories * 0.5
  ) {
    return "Calories are low heading into tonight. If you're playing, get a carb and protein meal in 2-3 hours before — rice and chicken, or pasta and lean beef.";
  }

  // 9. Combat / weight-class flag — martial-arts users very light past 4pm.
  if (
    sport === 'martial_arts' &&
    hour >= 16 &&
    goals.calories > 0 &&
    today.calories < goals.calories * 0.6
  ) {
    return "Light on calories today. If you're not cutting, get a solid protein source in tonight — chicken, beef, eggs, or Greek yogurt.";
  }

  // Weight nudges (lowest priority). Both are bounded to a single weekday so
  // they fire at most once a week without needing persistent fire-state.
  const { trend: wTrend, lastLoggedAt } = weight || {};
  const daysSinceWeigh = lastLoggedAt
    ? (Date.now() - new Date(lastLoggedAt).getTime()) / 86400000
    : Infinity;

  // 11. Weight-nutrition mismatch — 3+ weeks of data not tracking the goal.
  //     Monday review only.
  if (
    weekday === 1 &&
    wTrend &&
    wTrend.trend !== 'insufficient_data' &&
    wTrend.daysElapsed >= 21
  ) {
    if (goal === 'lose_fat' && wTrend.trend === 'maintaining') {
      return 'Three weeks without movement on weight. Calories look right — worth double-checking portions. Are you weighing your food?';
    }
    if (goal === 'build_muscle' && wTrend.trend !== 'gaining') {
      return "Three weeks and weight hasn't moved. You might need more calories — I've been conservative. Want to bump the target?";
    }
  }

  // 10. Weight-logging nudge — no weigh-in for 7+ days. Monday only (≈once/week).
  if (weekday === 1 && daysSinceWeigh >= 7) {
    return 'Weigh in when you get a chance — I track the trend to keep your targets accurate.';
  }

  return '';
}
