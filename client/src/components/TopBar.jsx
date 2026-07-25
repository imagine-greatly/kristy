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

// The thread door. Chat is the deep-input surface, not a moment in the trip, so it
// gets persistent chrome up here rather than a fourth tab or a pill floating over the
// docked composer. Typing in the composer opens the same thread; this is how you get
// back to it without saying anything.
function AskMark({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ask Kristy"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 40,
        padding: '8px 13px',
        borderRadius: 999,
        border: `1px solid ${colors.gold30}`,
        background: 'transparent',
        color: colors.accentGold,
        fontFamily: fonts.ui,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 5, height: 5, borderRadius: 999, background: colors.accentGold, flex: '0 0 auto' }}
      />
      Ask Kristy
    </button>
  );
}

export default function TopBar({ onMenu, goalLabel, onGoalClick, showPremium, onPremium, onAsk }) {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <button className="icon-btn topbar__menu" onClick={onMenu} aria-label="Open menu">
          <MenuIcon />
        </button>
        {onAsk && <AskMark onClick={onAsk} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <GoalChip label={goalLabel} onClick={onGoalClick} />
        {showPremium && onPremium && <PremiumMark onClick={onPremium} />}
      </div>
    </header>
  );
}
