import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';

/* ═══════════════════════ Chat launcher — no blank box (Step 9) ═══════════════════════
   Chat is connective tissue, not a destination. When the thread is empty, the user
   never faces a blank input — they get concrete starting points tied to their real
   artifacts (a scan verdict, their haul, their list). Every thread opens from one
   of these. Tokens only. */

export default function ChatLauncher({ entries = [], onScan }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.avatar}>K</div>
      <GoldThread />
      <h2 style={styles.title}>What do you want to talk through?</h2>
      <p style={styles.sub}>Pick something we can actually look at together.</p>

      <div style={styles.stack}>
        {entries.map((e) => (
          <button key={e.id} type="button" style={styles.entry} onClick={e.onClick}>
            <span style={styles.entryLabel}>{e.label}</span>
            {e.sub && <span style={styles.entrySub}>{e.sub}</span>}
          </button>
        ))}
      </div>

      {onScan && (
        <button type="button" style={styles.scan} onClick={onScan}>
          Or scan a product to start →
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, maxWidth: 400, margin: '0 auto', padding: '40px 22px 20px' },
  avatar: { width: 48, height: 48, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colors.borderGold}`, background: colors.surface, color: colors.accentGold, fontFamily: fonts.voice, fontStyle: 'italic', fontSize: 22 },
  title: { ...kristyVoice, margin: '2px 0 0', fontSize: 22, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 14, color: colors.textMuted },
  stack: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 },
  entry: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%', padding: '13px 16px', borderRadius: 13, border: `1px solid ${colors.borderGold}`, background: colors.surface, cursor: 'pointer', textAlign: 'left' },
  entryLabel: { fontFamily: fonts.ui, fontSize: 15, fontWeight: 600, color: colors.textPrimary },
  entrySub: { fontFamily: fonts.ui, fontSize: 12.5, color: colors.textMuted },
  scan: { marginTop: 8, padding: '8px 12px', background: 'transparent', border: 'none', color: colors.textSecondary, fontFamily: fonts.ui, fontSize: 13.5, cursor: 'pointer' },
};
