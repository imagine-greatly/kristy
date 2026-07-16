import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { COACH_GOALS, NON_NEGOTIABLES, goalPayoff } from '../lib/coachGoals.js';

/* ═══════════════════════ 60-second onboarding (Step 6) ═══════════════════════
   The grocery-coach front door: pick a goal, set non-negotiables, feel the
   personalization immediately (Kristy reacts in your goal's voice before you do
   any work). Persists { coach_goal, non_negotiables } and marks onboarded.

   Config-driven from lib/coachGoals.js — the optional "dietary focuses"
   multi-select is appended by a later step as another card here, no rebuild.

   Skippable: onSkip drops the user straight into scanning (guests get universal
   verdicts until they set a goal). Tokens only. */

export default function GroceryOnboarding({ onComplete, onSkip }) {
  const [step, setStep] = useState('goal'); // 'goal' | 'limits' | 'payoff'
  const [goal, setGoal] = useState(null);
  const [limits, setLimits] = useState([]); // non-negotiables

  const toggleLimit = (v) =>
    setLimits((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const finish = (startScan) => onComplete?.({ coach_goal: goal, non_negotiables: limits }, { startScan });

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <div style={styles.mark}>Kristy</div>
        <GoldThread />

        {step === 'goal' && (
          <>
            <h1 style={styles.q}>What are we shopping for?</h1>
            <p style={styles.sub}>Pick one. I'll read every scan against it.</p>
            <div style={styles.stack}>
              {COACH_GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(g.value)}
                  aria-pressed={goal === g.value}
                  style={{ ...styles.option, ...(goal === g.value ? styles.optionOn : null) }}
                >
                  <span style={styles.optTitle}>{g.title}</span>
                  <span style={styles.optBlurb}>{g.blurb}</span>
                </button>
              ))}
            </div>
            <button type="button" style={styles.primary} disabled={!goal} onClick={() => setStep('limits')}>
              Next
            </button>
            <button type="button" style={styles.skip} onClick={onSkip}>
              Skip for now
            </button>
          </>
        )}

        {step === 'limits' && (
          <>
            <h1 style={styles.q}>Any hard lines?</h1>
            <p style={styles.sub}>Optional. I'll hold these on every product.</p>
            <div style={styles.stack}>
              {NON_NEGOTIABLES.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => toggleLimit(n.value)}
                  aria-pressed={limits.includes(n.value)}
                  style={{ ...styles.option, ...(limits.includes(n.value) ? styles.optionOn : null) }}
                >
                  <span style={styles.optTitle}>{n.label}</span>
                  <span style={styles.check}>{limits.includes(n.value) ? '✓' : ''}</span>
                </button>
              ))}
            </div>
            <button type="button" style={styles.primary} onClick={() => setStep('payoff')}>
              Done
            </button>
            <button type="button" style={styles.skip} onClick={() => setStep('payoff')}>
              None of these
            </button>
          </>
        )}

        {step === 'payoff' && (
          <>
            <h1 style={styles.q}>You're set.</h1>
            {/* The instant payoff — Kristy reacts in the chosen goal's voice, before
                any work, so the personalization is felt immediately. */}
            <p style={{ ...kristyVoice, ...styles.payoff }}>{goalPayoff(goal)}</p>
            <button type="button" style={styles.primary} onClick={() => finish(true)}>
              Scan your first product
            </button>
            <button type="button" style={styles.skip} onClick={() => finish(false)}>
              I'll explore first
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    background: `linear-gradient(180deg, ${colors.bgDeep} 0%, ${colors.bg} 60%)`,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    textAlign: 'center',
  },
  mark: { fontFamily: fonts.voice, fontStyle: 'italic', fontSize: 30, color: colors.accentGold },
  q: { ...kristyVoice, margin: '4px 0 0', fontSize: 26, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14.5, color: colors.textMuted },
  payoff: { margin: '4px 0 6px', fontSize: 19, lineHeight: 1.5, color: colors.textPrimary, maxWidth: 340 },
  stack: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10, margin: '6px 0' },
  option: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    width: '100%',
    padding: '13px 16px',
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    cursor: 'pointer',
    textAlign: 'left',
    position: 'relative',
  },
  optionOn: { borderColor: colors.borderGold, background: colors.goldTint9 },
  optTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 600, color: colors.textPrimary },
  optBlurb: { fontFamily: fonts.ui, fontSize: 13, color: colors.textMuted },
  check: { position: 'absolute', right: 16, top: 14, color: colors.accentGold, fontSize: 16, fontWeight: 700 },
  primary: {
    width: '100%',
    marginTop: 6,
    padding: '14px 20px',
    borderRadius: 14,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
  },
  skip: {
    padding: '8px 12px',
    background: 'transparent',
    border: 'none',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 13.5,
    cursor: 'pointer',
  },
};
