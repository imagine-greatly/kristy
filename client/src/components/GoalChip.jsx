import { colors, fonts } from '../lib/tokens.js';
import { GoldDot } from './GoldThread.jsx';

/* The active-goal chip for the app header: a gold dot + the goal label, on brand.
   It's a MODE switch, so it renders even with no goal set — tapping opens the
   switcher to pick one. Tokens only. */
export default function GoalChip({ label, onClick }) {
  const text = label || 'Set your goal';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ? `Shopping goal: ${label}` : 'Set your shopping goal'}
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
        // Truncate rather than push the header row apart — goal labels grew with the
    // deeper taxonomy and the topbar has the kcal pill and Premium beside it.
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 'min(46vw, 190px)',
      }}
    >
      <GoldDot size={6} />
      {text}
    </button>
  );
}
