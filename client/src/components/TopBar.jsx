import { MenuIcon } from './Icons.jsx';
import { colors, fonts } from '../lib/tokens.js';
import GoalChip from './GoalChip.jsx';

// One word, gold, next to the goal chip — the membership should be findable from
// anywhere without ever becoming a banner. Visible, not interruptive.
function PremiumMark({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Kristy Premium"
      style={{
        appearance: 'none',
        background: 'none',
        border: 'none',
        padding: '6px 4px',
        minHeight: 44,
        cursor: 'pointer',
        color: colors.accentGold,
        fontFamily: fonts.ui,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      Premium
    </button>
  );
}

export default function TopBar({ onMenu, goalLabel, onGoalClick, showPremium, onPremium }) {
  return (
    <header className="topbar">
      <button
        className="icon-btn topbar__menu"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <GoalChip label={goalLabel} onClick={onGoalClick} />
        {showPremium && onPremium && <PremiumMark onClick={onPremium} />}
      </div>
    </header>
  );
}
