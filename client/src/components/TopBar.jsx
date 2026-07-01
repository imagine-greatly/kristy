import { MenuIcon } from './Icons.jsx';
import { fmt } from '../lib/format.js';

export default function TopBar({ onMenu, todayCalories }) {
  return (
    <header className="topbar">
      <button
        className="icon-btn topbar__menu"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>
      <div className="kcal-pill">{fmt(todayCalories)} kcal</div>
    </header>
  );
}
