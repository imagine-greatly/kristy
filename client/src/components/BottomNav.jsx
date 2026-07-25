import { colors, fonts } from '../lib/tokens.js';
import { ListIcon, HaulIcon, BarcodeIcon } from './Icons.jsx';

/* ═══════════════════════ Three-moment nav — Cart · Scan · Haul ═══════════════════════
   The primary navigation of the grocery coach. Three PEER moments, in the order a trip
   happens: Cart (before) · Scan (in the aisle) · Haul (after).

   Scan keeps its raised gold treatment — in the aisle holding a box, scanning is the
   fast reflex and must be instant and satisfying. What changed is the CLAIM: the app no
   longer opens on the scanner as if scanning were the whole point. It's one strong
   action among three, and the Cart is home.

   Chat isn't here at all — it's the deep-input surface, docked as the composer and
   reachable from the top bar, not a fourth moment competing with the sequence.

   Tokens only. Fixed to the bottom for single-hand thumb reach. */

function SideTab({ label, active, icon, badge, onClick }) {
  const color = active ? colors.accentGold : colors.textMuted;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={badge ? `${label}, ${badge}` : label}
      aria-current={active ? 'page' : undefined}
      style={{ ...styles.tab, color }}
    >
      <span style={styles.tabIcon}>{icon}</span>
      <span style={styles.tabLabel}>{label}</span>
      {/* The trip, visible from anywhere: a scan or a check-off moves this. */}
      {badge && <span style={styles.badge}>{badge}</span>}
    </button>
  );
}

export default function BottomNav({ active, cartProgress, onList, onScan, onHaul }) {
  const p = cartProgress || null;
  const cartBadge = p && p.total > 0 ? `${p.checked}/${p.total}` : null;

  return (
    <nav style={styles.nav} aria-label="Primary">
      <div style={styles.row}>
        <SideTab
          label="Cart"
          active={active === 'list'}
          icon={<ListIcon />}
          badge={cartBadge}
          onClick={onList}
        />

        {/* Scan — center, raised, gold. A strong physical action, always in reach. */}
        <div style={styles.center}>
          <button type="button" onClick={onScan} aria-label="Scan a product" style={styles.scanBtn}>
            <BarcodeIcon size={26} />
          </button>
          <span style={styles.scanLabel}>Scan</span>
        </div>

        <SideTab label="Haul" active={active === 'haul'} icon={<HaulIcon />} onClick={onHaul} />
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    // Normal-flow bottom bar: the last flex child of .app, so content shrinks
    // above it and the raised Scan button never covers the docked composer.
    flex: '0 0 auto',
    zIndex: 40,
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  row: {
    position: 'relative',
    maxWidth: 520,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 84px 1fr',
    alignItems: 'end',
    padding: '8px 12px 10px',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '8px 4px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: fonts.ui,
  },
  tabIcon: { display: 'flex' },
  tabLabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' },
  badge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 1,
    color: colors.accentGold,
    padding: '3px 7px',
    borderRadius: 999,
    border: `1px solid ${colors.gold30}`,
    background: colors.goldTint9,
  },

  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  scanBtn: {
    // Raised above the bar so it reads as the primary action.
    marginTop: -26,
    width: 64,
    height: 64,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.accentGold,
    color: colors.bgDeep,
    border: `3px solid ${colors.bg}`,
    boxShadow: `0 6px 18px ${colors.gold40}`,
    cursor: 'pointer',
  },
  scanLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: colors.accentGold,
  },
};
