import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { FOCUS_DISCLAIMER } from '../lib/coachGoals.js';

/* The one-time, in-voice "coach, not doctor" note — shown the first time ANY focus
   is turned on, verbatim. Rendered above the sheets (z:70). Tokens only. Shared by
   the goal switcher and the contextual focus offer so the wording never drifts. */
export default function FocusDisclaimer({ onDismiss }) {
  return (
    <div style={styles.scrim} role="dialog" aria-modal="true" aria-label="A quick note from Kristy">
      <div style={styles.card}>
        <p style={{ ...kristyVoice, ...styles.text }}>{FOCUS_DISCLAIMER}</p>
        <button type="button" style={styles.btn} onClick={onDismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}

const styles = {
  scrim: {
    position: 'fixed',
    inset: 0,
    zIndex: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: colors.scrimVerdict,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 22,
    borderRadius: 18,
    border: `1px solid ${colors.borderGold}`,
    background: colors.surface,
    textAlign: 'center',
  },
  text: { margin: 0, fontSize: 17, lineHeight: 1.55, color: colors.textPrimary },
  btn: {
    padding: '13px 20px',
    borderRadius: 14,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
  },
};
