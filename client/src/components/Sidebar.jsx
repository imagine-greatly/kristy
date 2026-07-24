import { CloseIcon, GearIcon } from './Icons.jsx';
import { colors, fonts } from '../lib/tokens.js';

// The grocery-coach menu. No kcal / macro / weight / goals — macro tracking was
// removed as a feature. Just a slim menu: Settings and membership.
export default function Sidebar({
  open,
  onClose,
  onOpenSettings,
  // Default NOT premium: render the free variant until the subscription resolves,
  // so entitlement never leaks during the load window.
  premium = false,
  onUpgrade,
}) {
  return (
    <>
      <div className={`backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="sidebar__header">
          <span className="sidebar__logo">Kristy</span>
          <div className="sidebar__actions">
            <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
              <GearIcon />
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Close menu">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div style={offStyles.menu}>
          <button style={offStyles.item} onClick={onOpenSettings}>
            <span>Settings</span>
            <span style={offStyles.chev}>›</span>
          </button>
          {!premium && (
            <button
              style={{ ...offStyles.item, ...offStyles.itemGold }}
              onClick={onUpgrade}
            >
              <span>Kristy Premium</span>
              <span style={offStyles.chev}>›</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

const offStyles = {
  menu: { display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 4px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 15,
    cursor: 'pointer',
  },
  itemGold: {
    border: `1px solid ${colors.borderGold}`,
    color: colors.accentGold,
    background: colors.goldTint9,
  },
  chev: { color: colors.textMuted, fontSize: 18, lineHeight: 1 },
};
