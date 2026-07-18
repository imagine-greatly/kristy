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
        {/* Macro tracking is an opt-in feature now, not the identity — only surface
            the kcal pill once there's something logged today. A pure grocery user's
            header never reads like a fitness app. */}
        {todayCalories > 0 && <div className="kcal-pill">{fmt(todayCalories)} kcal</div>}
      </div>
    </header>
  );
}
