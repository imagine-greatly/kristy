import { colors, fonts, kristyDisplay, radii } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import AmbientIsm from './AmbientIsm.jsx';

/* A placeholder for a moment surface not yet built (List → Step 8, Haul → Step 7)
   or gated for guests. An invitation, never a dead end — always a way forward.
   Tokens only. Replaced wholesale by the real surfaces in later steps. */

export default function MomentStub({ icon, title, line, ctaLabel, onCta, locked = false, lockLine }) {
  return (
    <div style={styles.wrap}>
      {icon && <div style={styles.icon}>{icon}</div>}
      <GoldThread />
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.line}>{locked ? lockLine : line}</p>
      {onCta && (
        <button type="button" style={styles.cta} onClick={onCta}>
          {ctaLabel}
        </button>
      )}

      <AmbientIsm style={{ marginTop: 10 }} />
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 14,
    maxWidth: 380,
    margin: '0 auto',
    padding: '56px 24px 24px',
  },
  icon: { color: colors.accentGold, display: 'flex' },
  title: { ...kristyDisplay, margin: '2px 0 0', fontSize: 26, color: colors.ink },
  line: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.55, color: colors.textMuted, maxWidth: 320 },
  cta: {
    marginTop: 8,
    padding: '12px 24px',
    borderRadius: radii.button,
    border: 'none',
    background: colors.action,
    color: colors.actionInk,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
};
