import { colors, fonts } from '../lib/tokens.js';
import { ListIcon, HaulIcon, BarcodeIcon, AisleIcon } from './Icons.jsx';

/* ═══════════════ Nav — Cart · Scan · Counter · Haul ═══════════════
   FOUR EQUAL TABS. No throne.

   The scanner used to sit here as an oversized raised gold circle, and Block 6 fixed
   the wrong half of that by giving the Counter a matching raised circle beside it: two
   thrones instead of one. A raised pair still says "these two are the app and the cart
   is a tab", which is exactly backwards. The cart is the sun. Scanning vets packaged
   things FOR the cart, the counter answers the unpackaged half going IN the cart, and
   the haul reads how it came out.

   So every tab is the same size, the same weight, the same treatment, and the active
   one is simply gold. Scan and Counter sit adjacent in the middle because they are the
   two ways to fill the cart, and their EQUALITY is the positioning: the labeled half
   and the unlabeled half matter the same, and the unlabeled half is the one no scanner
   can do.

   Chat isn't here — it's the deep-input surface, docked as the composer and reachable
   from the top bar, not a moment competing with the sequence.

   Tokens only. Fixed to the bottom for single-hand thumb reach. */

function Tab({ label, active, icon, badge, ariaLabel, onClick }) {
  const color = active ? colors.accentGold : colors.textMuted;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || (badge ? `${label}, ${badge}` : label)}
      aria-current={active ? 'page' : undefined}
      style={{ ...styles.tab, color }}
    >
      <span style={styles.tabIcon}>{icon}</span>
      <span style={styles.tabLabel}>{label}</span>
      {/* The trip, visible from anywhere: a scan or a check-off moves this. */}
      {badge ? <span style={styles.badge}>{badge}</span> : <span style={styles.badgeSpacer} />}
    </button>
  );
}

export default function BottomNav({ active, cartProgress, onList, onScan, onAisle, onHaul }) {
  const p = cartProgress || null;
  const cartBadge = p && p.total > 0 ? `${p.checked}/${p.total}` : null;

  return (
    <nav style={styles.nav} aria-label="Primary">
      <div style={styles.row}>
        <Tab
          label="Cart"
          active={active === 'list'}
          icon={<ListIcon size={22} />}
          badge={cartBadge}
          onClick={onList}
        />
        {/* The two ways to fill it. Identical treatment, on purpose. */}
        <Tab
          label="Scan"
          active={active === 'scan'}
          icon={<BarcodeIcon size={22} />}
          ariaLabel="Scan, the packaged half"
          onClick={onScan}
        />
        <Tab
          label="Counter"
          active={active === 'aisle'}
          icon={<AisleIcon size={22} />}
          ariaLabel="The counter, food with no barcode"
          onClick={onAisle}
        />
        <Tab label="Haul" active={active === 'haul'} icon={<HaulIcon size={22} />} onClick={onHaul} />
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    // Normal-flow bottom bar: the last flex child of .app, so content shrinks
    // above it and nothing overlaps the docked composer.
    flex: '0 0 auto',
    zIndex: 40,
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  row: {
    maxWidth: 520,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    alignItems: 'start',
    padding: '8px 6px 10px',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minHeight: 56,
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
  // Reserves the badge's height on every tab so the four labels sit on one baseline
  // whether or not a trip is underway.
  badgeSpacer: { height: 16 },
};
