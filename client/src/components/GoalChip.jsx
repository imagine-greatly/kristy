import { colors, fonts } from '../lib/tokens.js';
import { GoldDot } from './GoldThread.jsx';

/* The active-goal chip for the app header: a gold dot + the goal label, on brand.
   Renders nothing until a goal is set. Tokens only. */
export default function GoalChip({ label, onClick }) {
  if (!label) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Goal: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 12px 5px 10px',
        borderRadius: 999,
        border: `1px solid ${colors.borderGold}`,
        background: colors.surface2,
        color: colors.textSecondary,
        fontFamily: fonts.ui,
        fontSize: 13,
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
      }}
    >
      <GoldDot size={6} />
      {label}
    </button>
  );
}
