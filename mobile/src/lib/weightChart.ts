// Pure geometry for the weight-trend chart. Ported verbatim from the web
// client's weightChart.js — no DOM, so the math is identical.

import type { WeightEntry } from './types';

const LB_PER_KG = 2.20462;
const KG_PER_LB = 0.453592;

export type Unit = 'lbs' | 'kg';

// Convert a weight into a target unit ('lbs' | 'kg').
export function toUnit(value: unknown, fromUnit: string | undefined, unit: Unit): number {
  const v = Number(value) || 0;
  if ((fromUnit || 'lbs') === unit) return v;
  return unit === 'lbs' ? v * LB_PER_KG : v * KG_PER_LB;
}

export interface TrendPoint {
  t: number;
  w: number;
}

/** The last `days` of weigh-ins, normalized to `unit`, oldest → newest. */
export function trendPoints(
  history: WeightEntry[] | undefined,
  unit: Unit = 'lbs',
  days = 30
): TrendPoint[] {
  if (!Array.isArray(history) || !history.length) return [];
  const cutoff = Date.now() - days * 86400000;
  return history
    .filter((e) => e && e.logged_at && new Date(e.logged_at).getTime() >= cutoff)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map((e) => ({
      t: new Date(e.logged_at).getTime(),
      w: Math.round(toUnit(e.weight_value, e.weight_unit, unit) * 10) / 10,
    }));
}

export interface ChartDims {
  w?: number;
  h?: number;
  padX?: number;
  padTop?: number;
  padBot?: number;
}

export interface ChartResult {
  ok: boolean;
  d?: string;
  coords?: { x: number; y: number; w: number }[];
  w?: number;
  h?: number;
  min?: number;
  max?: number;
  first?: number;
  last?: number;
  points?: TrendPoint[];
}

/**
 * Map points → an SVG path + scaled point coordinates inside a viewBox.
 * Y auto-scales to the data range with a little padding. Returns { ok:false }
 * when there are fewer than 2 points (caller shows the empty state).
 */
export function buildChart(points: TrendPoint[], dims: ChartDims = {}): ChartResult {
  const { w = 240, h = 72, padX = 6, padTop = 10, padBot = 14 } = dims;
  if (!Array.isArray(points) || points.length < 2) {
    return { ok: false, points: points || [] };
  }

  const ts = points.map((p) => p.t);
  const ws = points.map((p) => p.w);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const wMin = Math.min(...ws);
  const wMax = Math.max(...ws);

  // Pad the y-range so a flat or tiny-range line doesn't hug an edge.
  const wPad = Math.max(0.4, (wMax - wMin) * 0.15);
  const yLo = wMin - wPad;
  const yHi = wMax + wPad;

  const X = (t: number) =>
    padX + (tMax === tMin ? 0.5 : (t - tMin) / (tMax - tMin)) * (w - padX * 2);
  const Y = (val: number) =>
    padTop + (1 - (yHi === yLo ? 0.5 : (val - yLo) / (yHi - yLo))) * (h - padTop - padBot);

  const coords = points.map((p) => ({
    x: Math.round(X(p.t) * 100) / 100,
    y: Math.round(Y(p.w) * 100) / 100,
    w: p.w,
  }));
  const d = coords.map((c, i) => `${i ? 'L' : 'M'}${c.x},${c.y}`).join(' ');

  return {
    ok: true,
    d,
    coords,
    w,
    h,
    min: wMin,
    max: wMax,
    first: ws[0],
    last: ws[ws.length - 1],
  };
}
