// Day-boundary helpers: detect a new local day, persist the last-active date,
// and build the morning "clean slate" recap message.

import { fmt, dayKey } from './format.js';

const LAD_KEY = 'kristy:lastActiveDate';

export function getLastActiveDate() {
  try {
    return localStorage.getItem(LAD_KEY);
  } catch {
    return null;
  }
}

export function setLastActiveDate(key) {
  try {
    localStorage.setItem(LAD_KEY, key);
  } catch {
    /* ignore */
  }
}

function greeting(hour) {
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Hey';
  return 'Good evening';
}

/**
 * "Morning — yesterday you had 2,340 kcal and 156g protein.
 *  Today's a clean slate, goals reset to zero."
 */
export function buildRecap(prevTotals, now = new Date()) {
  const cal = fmt(prevTotals?.calories || 0);
  const protein = fmt(prevTotals?.protein || 0);
  return `${greeting(now.getHours())} — yesterday you had ${cal} kcal and ${protein}g protein. Today's a clean slate, goals reset to zero.`;
}

export const recapMessage = (prevTotals, now = new Date()) => ({
  id: `recap-${dayKey(now)}`,
  role: 'ai',
  content: buildRecap(prevTotals, now),
  macros: null,
  isRecap: true,
});

// Yesterday's local date key.
export const yesterdayKey = (now = new Date()) =>
  dayKey(new Date(now.getTime() - 86400000));
