import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { CloseIcon } from './Icons.jsx';
import { COACH_GOALS, FOCUSES, NON_NEGOTIABLES } from '../lib/coachGoals.js';

/* ═══════════════════════ Goal switcher — the chip's quick mode switch ═══════════════════════
   The header chip is a MODE, not an identity: tap it, switch what you're shopping
   for, and the next verdict reflects it. No confirmation friction. Below the goals,
   a quiet "keep an eye on" section (dietary focuses + hard lines) — the contextual
   home for what used to be a door-step step. Never pre-checked. Tokens only.

   Goal pick closes the sheet (it's a mode switch). Focus / hard-line toggles keep it
   open so several can be set. The one-time coach-not-doctor disclaimer is owned by
   the parent (fires on the first focus turned on). */
export default function GoalSwitcher({
  goal,
  focuses = [],
  nonNegotiables = [],
  onPickGoal,
  onToggleFocus,
  onToggleNonNegotiable,
  onClose,
}) {
  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="What are you shopping for?">
      <div style={styles.scrim} onClick={onClose} />
      <div style={styles.sheet}>
        <button style={styles.close} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div style={styles.body}>
          <h2 style={styles.title}>What are you shopping for?</h2>
          <p style={styles.sub}>I&rsquo;ll read every scan against this. Switch it anytime.</p>

          <div style={styles.goals}>
            {COACH_GOALS.map((g) => {
              const on = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => onPickGoal(g.value)}
                  aria-pressed={on}
                  style={{ ...styles.goal, ...(on ? styles.goalOn : null) }}
                >
                  <span style={styles.goalTitle}>{g.title}</span>
                  <span style={styles.goalBlurb}>{g.blurb}</span>
                  {on && <span style={styles.goalCheck}>✓</span>}
                </button>
              );
            })}
          </div>

          <div style={styles.threadWrap}>
            <GoldThread />
          </div>

          <h3 style={styles.section}>Anything you want me to keep an eye on?</h3>
          <p style={styles.sub}>Optional. Turn on what matters to you — I&rsquo;ll flag it as we shop.</p>
          <div style={styles.chips}>
            {FOCUSES.map((f) => {
              const on = focuses.includes(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onToggleFocus(f.value)}
                  aria-pressed={on}
                  style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                >
                  {f.label}
                  {on ? '  ✓' : ''}
                </button>
              );
            })}
          </div>

          <h3 style={styles.section}>Hard lines</h3>
          <p style={styles.sub}>I&rsquo;ll hold these on every product.</p>
          <div style={styles.chips}>
            {NON_NEGOTIABLES.map((n) => {
              const on = nonNegotiables.includes(n.value);
              return (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => onToggleNonNegotiable(n.value)}
                  aria-pressed={on}
                  style={{ ...styles.chip, ...(on ? styles.chipOn : null) }}
                >
                  {n.label}
                  {on ? '  ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrim: { position: 'absolute', inset: 0, background: colors.scrimVerdict },
  sheet: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    maxHeight: '92vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '22px 18px calc(22px + env(safe-area-inset-bottom))',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    border: `1px solid ${colors.border}`,
    borderBottom: 'none',
    background: colors.bg,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textMuted,
    cursor: 'pointer',
  },
  body: { display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 },
  title: { ...kristyVoice, margin: 0, fontSize: 24, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, color: colors.textMuted },
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
  goalCheck: { position: 'absolute', right: 16, top: 14, color: colors.accentGold, fontSize: 16, fontWeight: 700 },
  threadWrap: { margin: '8px 0 2px' },
  section: { ...kristyVoice, margin: '6px 0 0', fontSize: 18, color: colors.textPrimary },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, margin: '2px 0 4px' },
  chip: {
    padding: '9px 14px',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  chipOn: { borderColor: colors.borderGold, background: colors.goldTint9, color: colors.accentGold },
};
