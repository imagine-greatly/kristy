import { colors, fonts } from '../lib/tokens.js';
import { ListIcon, HaulIcon, BarcodeIcon, AisleIcon } from './Icons.jsx';

/* ═══════════════ Nav — Cart · [Scan | Aisle] · Haul ═══════════════
   The trip in order: Cart (before), the store itself (in it), Haul (after).

   THE STORE HAS TWO HALVES, and the nav says so. Scan reads the labeled half. Aisle
   reads the half with no label at all: the fish counter, the butcher, produce, dairy,
   bulk. Other scanners stop at the barcode; the unlabeled half is the part no scanner
   can do, so it is not a fallback link tucked under the scan buttons. It sits in the
   center pair at the same size, the same raise, the same reach.

   Gold fill goes to Scan because it is the one-handed physical reflex with a box in the
   other hand. Aisle takes a gold outline: equal billing, different act. Two center
   buttons, one product.

   Chat isn't here — it's the deep-input surface, docked as the composer and reachable
   from the top bar, not a moment competing with the sequence.

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

export default function BottomNav({ active, cartProgress, onList, onScan, onAisle, onHaul }) {
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

        {/* The store: both halves, side by side, same size and same raise. */}
        <div style={styles.center}>
          <div style={styles.pair}>
            <div style={styles.pairCol}>
              <button
                type="button"
                onClick={onScan}
                aria-label="Scan a product"
                aria-current={active === 'scan' ? 'page' : undefined}
                style={styles.scanBtn}
              >
                <BarcodeIcon size={24} />
              </button>
              <span style={styles.scanLabel}>Scan</span>
            </div>

            {onAisle && (
              <div style={styles.pairCol}>
                <button
                  type="button"
                  onClick={onAisle}
                  aria-label="The aisle — food with no label"
                  aria-current={active === 'aisle' ? 'page' : undefined}
                  style={{
                    ...styles.aisleBtn,
                    ...(active === 'aisle' ? styles.aisleBtnActive : null),
                  }}
                >
                  <AisleIcon size={24} />
                </button>
                <span style={styles.scanLabel}>Aisle</span>
              </div>
            )}
          </div>
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
    // Two center buttons now, not one — the store's two halves get equal footprint.
    gridTemplateColumns: '1fr 150px 1fr',
    alignItems: 'end',
    padding: '8px 10px 10px',
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
  pair: { display: 'flex', alignItems: 'flex-end', gap: 10 },
  pairCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  scanBtn: {
    // Raised above the bar so it reads as a primary action.
    marginTop: -24,
    width: 58,
    height: 58,
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
  // Same size, same raise, same reach. Outline instead of fill: equal billing for a
  // different kind of act, without spending gold twice in one row.
  aisleBtn: {
    marginTop: -24,
    width: 58,
    height: 58,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.surface2,
    color: colors.accentGold,
    border: `2px solid ${colors.gold40}`,
    boxShadow: colors.shadowRaised,
    cursor: 'pointer',
  },
  aisleBtnActive: { background: colors.goldTint9, borderColor: colors.accentGold },
  scanLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    color: colors.accentGold,
  },
};
