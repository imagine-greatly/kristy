import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { COACH_GOALS, FOCUSES, NON_NEGOTIABLES, CONSTRAINTS, CONSTRAINTS_SECTION, FOCUS_DISCLAIMER } from '../lib/coachGoals.js';

/* ═══════════════════════ Coach onboarding — the front door ═══════════════════════
   The first thing a signed-in, goal-less user sees. This is where the coaching
   relationship begins: Kristy asking who she's shopping for — a goal, then the
   optional "keep an eye on" (focuses) and "never in the cart" (hard lines). It is
   NOT a fitness intake and NOT the TDEE macro setup; those live behind Settings.

   Completing it (a goal is chosen) calls saveCoachProfile → /onboarding/coach. It does
   NOT start the trial — that's a separate, explicit choice at the gate, after the user
   has spent their free tastes. It is fully skippable — skipping leaves the user
   goal-less on universal verdicts. The header goal chip remains the anytime editor;
   this is simply no longer the only path in. Tokens only; her spoken lines are
   kristyVoice (Playfair italic). */
export default function CoachOnboarding({ onComplete, onSkip, initialGoal = null }) {
  // A guest who expressed a goal before signing in arrives with it pre-filled — start
  // past the goal step (Back returns to it to change). Otherwise start at the goal.
  const [step, setStep] = useState(initialGoal ? 1 : 0); // 0 goal · 1 focuses · 2 constraints · 3 hard lines
  const [goal, setGoal] = useState(initialGoal);
  const [focuses, setFocuses] = useState([]);
  const [constraints, setConstraints] = useState([]);
  const [nonNegotiables, setNonNegotiables] = useState([]);
  const [busy, setBusy] = useState(false);
  const LAST_STEP = 3;

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  function pickGoal(value) {
    setGoal(value);
    setStep(1); // a goal auto-advances — the anchor is chosen, the rest is optional
  }

  function finish() {
    if (busy || !goal) return;
    setBusy(true);
    // The parent persists (optimistically) and unmounts us by setting coach_goal.
    onComplete({ coach_goal: goal, non_negotiables: nonNegotiables, focuses, constraints });
  }

  return (
    <div style={styles.screen} role="dialog" aria-modal="true" aria-label="Let's set up your cart">
      <div style={styles.card}>
        <div style={styles.top}>
          <span style={styles.logo}>Kristy</span>
          <div style={styles.dots} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ ...styles.dot, ...(i === step ? styles.dotOn : null) }} />
            ))}
          </div>
        </div>

        <div style={styles.body}>
          {step === 0 && (
            <>
              <h2 style={styles.prompt}>Before we shop &mdash; who am I shopping for?</h2>
              <p style={styles.sub}>
                Pick what this cart is really about. I&rsquo;ll read every scan against it, and
                you can change it any time.
              </p>
              <div style={styles.goals}>
                {COACH_GOALS.map((g) => {
                  const on = goal === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => pickGoal(g.value)}
                      aria-pressed={on}
                      style={{ ...styles.goal, ...(on ? styles.goalOn : null) }}
                    >
                      <span style={styles.goalTitle}>{g.title}</span>
                      <span style={styles.goalBlurb}>{g.blurb}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 style={styles.prompt}>Anything you want me to keep an eye on?</h2>
              <p style={styles.sub}>Optional. Turn on what matters to you &mdash; I&rsquo;ll flag it as we shop.</p>
              <div style={styles.chips}>
                {FOCUSES.map((f) => {
                  const on = focuses.includes(f.value);
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggle(focuses, setFocuses, f.value)}
                      aria-pressed={on}
                      style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                    >
                      {f.label}
                      {on ? '  ✓' : ''}
                    </button>
                  );
                })}
              </div>
              {/* The one-time coach-not-doctor note, in context: shown wherever focuses
                  are first offered. The parent marks it acknowledged on completion so
                  the standalone modal never double-fires later. */}
              {focuses.length > 0 && <p style={styles.note}>{FOCUS_DISCLAIMER}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={styles.prompt}>{CONSTRAINTS_SECTION.title}</h2>
              <p style={styles.sub}>{CONSTRAINTS_SECTION.sub}</p>
              <div style={styles.chips}>
                {CONSTRAINTS.map((c) => {
                  const on = constraints.includes(c.value);
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => toggle(constraints, setConstraints, c.value)}
                      aria-pressed={on}
                      style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                    >
                      {c.label}
                      {on ? '  ✓' : ''}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={styles.prompt}>Any hard lines?</h2>
              <p style={styles.sub}>
                Optional. Things you never want in the cart &mdash; I&rsquo;ll hold them on every product.
              </p>
              <div style={styles.chips}>
                {NON_NEGOTIABLES.map((n) => {
                  const on = nonNegotiables.includes(n.value);
                  return (
                    <button
                      key={n.value}
                      type="button"
                      onClick={() => toggle(nonNegotiables, setNonNegotiables, n.value)}
                      aria-pressed={on}
                      style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                    >
                      {n.label}
                      {on ? '  ✓' : ''}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={styles.threadWrap}>
          <GoldThread />
        </div>

        <div style={styles.actions}>
          {step > 0 && (
            <button type="button" style={styles.back} onClick={() => setStep((s) => s - 1)} disabled={busy}>
              Back
            </button>
          )}
          {(step === 1 || step === 2) && (
            <button type="button" style={styles.primary} onClick={() => setStep((s) => s + 1)} disabled={busy}>
              Continue
            </button>
          )}
          {step === LAST_STEP && (
            <button type="button" style={styles.primary} onClick={finish} disabled={busy}>
              {busy ? 'Setting up…' : "That's everything — let's shop"}
            </button>
          )}
        </div>

        {/* Skippable, and never a trap: the escape hatch lives on the goal step, where
            "skip" unambiguously means "don't set me up." Later steps mean a goal is
            already chosen — Back returns here to bail. */}
        {step === 0 && (
          <button type="button" style={styles.skip} onClick={onSkip} disabled={busy}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  screen: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: colors.bg,
    overflowY: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    margin: 'auto',
  },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { ...kristyVoice, fontSize: 22, color: colors.accentGold },
  dots: { display: 'flex', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 999, background: colors.border },
  dotOn: { background: colors.accentGold },
  body: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 },
  prompt: { ...kristyVoice, margin: 0, fontSize: 25, lineHeight: 1.25, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
  note: {
    ...kristyVoice,
    margin: '4px 0 0',
    fontSize: 13.5,
    lineHeight: 1.5,
    color: colors.textMuted,
  },
  goals: { display: 'flex', flexDirection: 'column', gap: 10, margin: '6px 0 2px' },
  goal: {
    position: 'relative',
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
  },
  goalOn: { borderColor: colors.borderGold, background: colors.goldTint9 },
  goalTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 600, color: colors.textPrimary },
  goalBlurb: { fontFamily: fonts.ui, fontSize: 13, color: colors.textMuted },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '6px 0 4px' },
  chip: {
    maxWidth: '100%',
    padding: '9px 14px',
    minHeight: 44,
    boxSizing: 'border-box',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    overflowWrap: 'anywhere',
  },
  chipOn: { borderColor: colors.borderGold, background: colors.goldTint9, color: colors.accentGold },
  threadWrap: { margin: '4px 0 0' },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  back: {
    flex: '0 0 auto',
    minHeight: 48,
    padding: '13px 18px',
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  primary: {
    flex: 1,
    minHeight: 48,
    padding: '13px 18px',
    borderRadius: 14,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  skip: {
    alignSelf: 'center',
    marginTop: 2,
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 13.5,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    cursor: 'pointer',
  },
};
