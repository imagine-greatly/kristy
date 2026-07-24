import { colors, fonts } from '../lib/tokens.js';

// Kristy is a grocery coach — no macro cards, ever. An AI bubble renders her text,
// the weekly-recap tag, editable preference chips (when she just captured a
// preference from chat), and — for a locked free-user reply — a quiet upgrade link.
export default function MessageBubble({ message, onUpgrade, onRemovePref, onEditPrefs }) {
  const { role, content, isSummary } = message;

  if (role === 'user') {
    return (
      <div className="msg-row user">
        <div className="bubble user">{content}</div>
      </div>
    );
  }

  // AI. Preference chips render only when Kristy just set preferences from chat —
  // each is one tap to remove, so a wrong parse is one tap to fix.
  const chips = message.preferenceUpdate?.labeled || [];

  return (
    <div className="msg-row ai">
      <div className="avatar">K</div>
      <div className="ai-col">
        {isSummary && <span className="summary-tag">Weekly recap</span>}
        <div className="bubble ai">{content}</div>

        {chips.length > 0 && (
          <div style={pc.wrap}>
            <div style={pc.chips}>
              {chips.map((it) => (
                <button
                  key={`${it.kind}:${it.value}`}
                  type="button"
                  style={pc.chip}
                  onClick={() => onRemovePref?.(message.id, it.kind, it.value)}
                  aria-label={`Remove ${it.label}`}
                  title={`Remove ${it.label}`}
                >
                  <span>{it.label}</span>
                  <span style={pc.x} aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            {onEditPrefs && (
              <button type="button" style={pc.edit} onClick={onEditPrefs}>
                Edit preferences
              </button>
            )}
          </div>
        )}

        {/* A locked-feature reply for a free user: Kristy's line lands as a normal
            bubble, with a quiet upgrade link. */}
        {message.upgrade && onUpgrade && (
          <button className="bubble-upgrade" onClick={onUpgrade}>
            Unlock coaching →
          </button>
        )}
      </div>
    </div>
  );
}

const pc = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    padding: '7px 10px 7px 12px',
    borderRadius: 999,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
    color: colors.accentGold,
    fontFamily: fonts.ui,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    overflowWrap: 'anywhere',
    textAlign: 'left',
  },
  x: { fontSize: 15, lineHeight: 1, opacity: 0.8 },
  edit: {
    alignSelf: 'flex-start',
    background: 'none',
    border: 'none',
    padding: '2px 0',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 12.5,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};
