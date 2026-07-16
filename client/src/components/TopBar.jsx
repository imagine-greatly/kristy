import { MenuIcon } from './Icons.jsx';
import { fmt } from '../lib/format.js';
import GoalChip from './GoalChip.jsx';

export default function TopBar({ onMenu, todayCalories, goalLabel, onGoalClick }) {
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
        <div className="kcal-pill">{fmt(todayCalories)} kcal</div>
      </div>
    </header>
  );
}
