// Builds the context blocks Kristy needs on every call, from raw meal_logs.

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const n = (x) => Math.round(Number(x) || 0);
const fmt = (x) => n(x).toLocaleString('en-US');

/**
 * YYYY-MM-DD key in the *user's* local day.
 * offsetMin is Date.getTimezoneOffset() from the client (minutes; UTC = local + offset).
 * We shift the UTC instant by -offset, then read UTC parts → the client's calendar date.
 */
export function localDayKey(date, offsetMin = 0) {
  const d = new Date(new Date(date).getTime() - offsetMin * 60000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Back-compat: server-local day key (used where no client offset is available).
export const dayKey = (date) => localDayKey(date, new Date().getTimezoneOffset());

/** Roll a list of meal_logs up into per-day totals, keyed by the user's local date. */
export function aggregateByDay(meals = [], offsetMin = 0) {
  const byDay = new Map();
  for (const meal of meals) {
    const key = localDayKey(meal.logged_at, offsetMin);
    const cur =
      byDay.get(key) ||
      { date: key, calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
    cur.calories += n(meal.calories);
    cur.protein += n(meal.protein);
    cur.carbs += n(meal.carbs);
    cur.fat += n(meal.fat);
    cur.meals += 1;
    byDay.set(key, cur);
  }
  return byDay;
}

/** Totals for "today" in the user's local timezone. */
export function todayTotals(meals = [], offsetMin = 0) {
  const key = localDayKey(new Date(), offsetMin);
  return (
    aggregateByDay(meals, offsetMin).get(key) ||
    { date: key, calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 }
  );
}

/**
 * HISTORY_BLOCK — last 7 logged days, oldest → newest, numbered.
 * "Day 1 (Mon): 2,340 kcal | 156g protein | 210g carbs | 74g fat"
 */
export function buildHistoryBlock(meals = [], offsetMin = 0, weightTrend = null) {
  const byDay = aggregateByDay(meals, offsetMin);
  const days = [...byDay.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  // One-line weight trend appended when we have it (the optimization loop).
  const trendLine =
    weightTrend && weightTrend.trend !== 'insufficient_data'
      ? weightTrend.weeklyRate != null
        ? `\nWeight trend: ${weightTrend.trend}, ${weightTrend.weeklyRate}lbs/week over ${weightTrend.daysElapsed} days`
        : `\nWeight trend: ${weightTrend.trend} (${weightTrend.totalChange > 0 ? '+' : ''}${weightTrend.totalChange}lbs so far — too little time for a weekly rate)`
      : '';

  if (days.length === 0)
    return `No meals logged yet — this is a fresh start.${trendLine}`;

  return (
    days
      .map((d, i) => {
        const weekday = WEEKDAYS[new Date(`${d.date}T12:00:00`).getDay()];
        return `Day ${i + 1} (${weekday}): ${fmt(d.calories)} kcal | ${fmt(
          d.protein
        )}g protein | ${fmt(d.carbs)}g carbs | ${fmt(d.fat)}g fat`;
      })
      .join('\n') + trendLine
  );
}

/** GOALS_BLOCK — "2,500 kcal | 180g protein | 200g carbs | 80g fat" */
export function buildGoalsBlock(goals) {
  return `${fmt(goals.calories)} kcal | ${fmt(goals.protein)}g protein | ${fmt(
    goals.carbs
  )}g carbs | ${fmt(goals.fat)}g fat`;
}

/**
 * TODAY_BLOCK —
 * "1,240 kcal logged | 88g protein | 102g carbs | 41g fat | 1,260 kcal remaining"
 */
export function buildTodayBlock(today, goals, weightToday = null) {
  const remaining = n(goals.calories) - n(today.calories);
  const weightLine = weightToday
    ? ` | Weight logged today: ${weightToday.value}${weightToday.unit}`
    : '';
  return `${fmt(today.calories)} kcal logged | ${fmt(today.protein)}g protein | ${fmt(
    today.carbs
  )}g carbs | ${fmt(today.fat)}g fat | ${fmt(remaining)} kcal remaining${weightLine}`;
}

/** WEEKLY_DATA_BLOCK + averages, for the Sunday summary. */
export function buildWeeklyData(meals = [], goals, offsetMin = 0) {
  const byDay = aggregateByDay(meals, offsetMin);
  const days = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));

  const block =
    days.length === 0
      ? 'No meals were logged this week.'
      : days
          .map((d) => {
            const weekday = WEEKDAYS[new Date(`${d.date}T12:00:00`).getDay()];
            return `${weekday}: ${fmt(d.calories)} kcal | ${fmt(
              d.protein
            )}g protein | ${fmt(d.carbs)}g carbs | ${fmt(d.fat)}g fat`;
          })
          .join('\n');

  const loggedDays = days.length || 1;
  const sum = days.reduce(
    (a, d) => ({
      calories: a.calories + d.calories,
      protein: a.protein + d.protein,
      carbs: a.carbs + d.carbs,
      fat: a.fat + d.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return {
    block,
    averages: {
      calories: n(sum.calories / loggedDays),
      protein: n(sum.protein / loggedDays),
      carbs: n(sum.carbs / loggedDays),
      fat: n(sum.fat / loggedDays),
    },
  };
}
