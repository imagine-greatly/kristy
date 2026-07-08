import { useEffect, useMemo, useState } from 'react';
import MacroRing from './MacroRing.jsx';
import { CloseIcon, GearIcon } from './Icons.jsx';
import { fmt, n, dateLabel, clampPct } from '../lib/format.js';
import { trendPoints, buildChart } from '../lib/weightChart.js';

const GOAL_FIELDS = [
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
];

function GoalRow({ field, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    const next = n(draft);
    if (next > 0 && next !== value) onSave(field.key, next);
    else setDraft(String(value));
  };

  return (
    <div className="goal-row">
      <span className="goal-row__label">{field.label}</span>
      {editing ? (
        <input
          className="goal-input"
          type="number"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') {
              setDraft(String(value));
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          className="goal-row__value"
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
        >
          {fmt(value)}
          {field.key !== 'calories' ? 'g' : ''}
        </button>
      )}
    </div>
  );
}

const MACROS = [
  { key: 'protein', name: 'Protein', color: '#C9A84C' }, // accent-gold
  { key: 'carbs', name: 'Carbs', color: '#4A9B6F' }, // accent-mint
  { key: 'fat', name: 'Fat', color: '#6BBF8E' }, // accent-seafoam
];

// Colors for the weight trend line.
const MINT = '#4A9B6F'; // on-track (loss, or gain when building muscle)
const MUTED = '#6B9E85'; // maintaining / off-goal gain

// Arrow + label + color for the 7-day weight change, given the user's goal.
function weightTrendStyle(weekChange, goalType) {
  if (weekChange <= -0.1) {
    return { arrow: '↓', label: `${Math.abs(weekChange)} lbs this week`, color: MINT };
  }
  if (weekChange >= 0.1) {
    const onTrack = goalType === 'build_muscle';
    return {
      arrow: '↑',
      label: `${Math.abs(weekChange)} lbs this week`,
      color: onTrack ? MINT : MUTED,
    };
  }
  return { arrow: '→', label: 'maintaining', color: MUTED };
}

const GOLD = '#C9A84C'; // accent-gold — matches the landing's trend line

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Pure-SVG line chart of the last 30 days of weigh-ins. Auto-scales to the
// data, draws itself in when the sidebar opens, and shows an empty state
// until there are at least two entries. No chart library.
function WeightTrendChart({ history, unit, active }) {
  const points = useMemo(() => trendPoints(history, unit, 30), [history, unit]);
  const chart = useMemo(() => buildChart(points), [points]);
  const [drawn, setDrawn] = useState(false);

  // Replay the draw-in each time the sidebar opens (when a real trend exists).
  useEffect(() => {
    if (!chart.ok) return undefined;
    if (!active || reduceMotion) {
      setDrawn(true);
      return undefined;
    }
    setDrawn(false);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setDrawn(true))
    );
    return () => cancelAnimationFrame(id);
  }, [active, chart.ok, chart.d]);

  if (!chart.ok) {
    return (
      <span style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>
        Log your weight to see your trend
      </span>
    );
  }

  return (
    <div style={{ marginTop: 4 }}>
      <svg
        viewBox={`0 0 ${chart.w} ${chart.h}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Weight trend, last 30 days"
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          // Box ratio == viewBox ratio, so scaling stays uniform (dots round).
          aspectRatio: `${chart.w} / ${chart.h}`,
          overflow: 'visible',
        }}
      >
        {/* faint baseline */}
        <line
          x1="0"
          y1={chart.h - 0.5}
          x2={chart.w}
          y2={chart.h - 0.5}
          stroke="rgba(201,168,76,0.12)"
          strokeWidth="1"
        />
        <path
          d={chart.d}
          fill="none"
          stroke={GOLD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: drawn ? 0 : 1,
            transition: reduceMotion
              ? 'none'
              : 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)',
          }}
        />
        {chart.coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="2.2"
            fill={GOLD}
            style={{
              opacity: drawn ? 1 : 0,
              transition: reduceMotion ? 'none' : `opacity .3s ease ${0.4 + i * 0.04}s`,
            }}
          />
        ))}
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 4,
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: '.02em' }}>
          weight trend
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>30 days</span>
      </div>
    </div>
  );
}

export default function Sidebar({
  open,
  onClose,
  onOpenSettings,
  today,
  todayKey,
  goals,
  weight,
  weightHistory,
  onSaveGoal,
  historyDays,
  activeDay,
  onSelectDay,
  premium = true,
  onUpgrade,
}) {
  const remaining = n(goals.calories) - n(today.calories);
  const wTrend = weight ? weightTrendStyle(weight.weekChange, weight.goalType) : null;

  return (
    <>
      <div className={`backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="sidebar__header">
          <span className="sidebar__logo">Kristy</span>
          <div className="sidebar__actions">
            <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
              <GearIcon />
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Today */}
        <div className="sb-section">
          <div className="sb-section__title">Today</div>
          <div className="today-ring">
            <MacroRing
              size={88}
              stroke={8}
              value={today.calories}
              goal={goals.calories}
              color="#C9A84C"
            >
              <span className="ring-center">
                <span className="ring-center__value">{fmt(today.calories)}</span>
                <span className="ring-center__label">kcal</span>
              </span>
            </MacroRing>
            <div className="today-ring__meta">
              <span className="today-ring__remaining">
                {fmt(Math.max(0, remaining))} kcal
              </span>
              <span className="today-ring__sub">
                {remaining >= 0 ? 'remaining' : `${fmt(-remaining)} over goal`}
              </span>
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="sb-section">
          <div className="sb-section__title">Macros</div>
          <div className="macro-rings">
            {MACROS.map((m) => (
              <div className="macro-ring" key={m.key}>
                <span className="macro-ring__name">{m.name}</span>
                <MacroRing
                  size={56}
                  stroke={6}
                  value={today[m.key]}
                  goal={goals[m.key]}
                  color={m.color}
                >
                  <span className="macro-ring__center">{fmt(today[m.key])}g</span>
                </MacroRing>
                <span className="macro-ring__pct">
                  {clampPct(today[m.key], goals[m.key])}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div className="sb-section">
          <div className="sb-section__title">Weight</div>
          {!premium ? (
            <button className="weight-locked" onClick={onUpgrade}>
              <span className="weight-locked__row">
                <span className="weight-locked__lock">🔒</span>
                <span className="weight-locked__title">Weight trends &amp; adaptive targets</span>
              </span>
              <span className="weight-locked__cta">Part of coaching — unlock →</span>
            </button>
          ) : weight ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-gold)',
                  fontSize: 20,
                }}
              >
                {fmt(weight.current)} {weight.unit}
              </span>
              <span style={{ color: wTrend.color, fontSize: 12 }}>
                {wTrend.arrow} {wTrend.label}
              </span>
              <WeightTrendChart
                history={weightHistory}
                unit={weight.unit}
                active={open}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                Log your weight to track progress
              </span>
              <span
                style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}
              >
                Just tell Kristy your weight
              </span>
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="sb-section">
          <div className="sb-section__title">Goals</div>
          {GOAL_FIELDS.map((f) => (
            <GoalRow
              key={f.key}
              field={f}
              value={goals[f.key]}
              onSave={onSaveGoal}
            />
          ))}
        </div>

        {/* History */}
        <div className="sb-section" style={{ borderBottom: 'none' }}>
          <div className="sb-section__title">History</div>
          <div className="history-list">
            {/* Live "today" — tap to return to the active chat */}
            <button
              className={`history-item${activeDay === todayKey ? ' active' : ''}`}
              onClick={() => onSelectDay(todayKey)}
            >
              <span className="history-item__date">
                Today <span className="history-item__live">· live</span>
              </span>
              <span className="history-item__stats">
                {fmt(today.calories)} kcal · {fmt(today.protein)}g P
              </span>
            </button>

            {historyDays.length === 0 ? (
              <div className="history-empty">No past days yet — start logging.</div>
            ) : (
              historyDays.map((d) => (
                <button
                  key={d.date}
                  className={`history-item${activeDay === d.date ? ' active' : ''}`}
                  onClick={() => onSelectDay(d.date)}
                >
                  <span className="history-item__date">{dateLabel(d.date)}</span>
                  <span className="history-item__stats">
                    {fmt(d.calories)} kcal · {fmt(d.protein)}g P
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
