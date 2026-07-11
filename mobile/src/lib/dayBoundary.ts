// Day-boundary helpers: detect a new local day, persist the last-active date,
// and build the morning "clean slate" recap message. Ported from the web
// client's dayBoundary.js; localStorage → AsyncStorage (so the getters/setters
// are async here, awaited by the app provider).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fmt, dayKey } from './format';
import type { UiMessage, Totals } from './types';

const LAD_KEY = 'kristy:lastActiveDate';

export async function getLastActiveDate(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAD_KEY);
  } catch {
    return null;
  }
}

export async function setLastActiveDate(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAD_KEY, key);
  } catch {
    /* ignore */
  }
}

function greeting(hour: number): string {
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Hey';
  return 'Good evening';
}

/**
 * "Morning — yesterday you had 2,340 kcal and 156g protein.
 *  Today's a clean slate, goals reset to zero."
 */
export function buildRecap(prevTotals: Partial<Totals> | null, now = new Date()): string {
  const cal = fmt(prevTotals?.calories || 0);
  const protein = fmt(prevTotals?.protein || 0);
  return `${greeting(now.getHours())} — yesterday you had ${cal} kcal and ${protein}g protein. Today's a clean slate, goals reset to zero.`;
}

export const recapMessage = (
  prevTotals: Partial<Totals> | null,
  now = new Date()
): UiMessage => ({
  id: `recap-${dayKey(now)}`,
  role: 'ai',
  content: buildRecap(prevTotals, now),
  macros: null,
  isRecap: true,
});

// Yesterday's local date key.
export const yesterdayKey = (now = new Date()): string =>
  dayKey(new Date(now.getTime() - 86400000));
