import { colors, fonts } from '../lib/tokens.js';
import { ListIcon, HaulIcon, BarcodeIcon } from './Icons.jsx';

/* ═══════════════════════ Three-moment nav — List · Scan · Haul ═══════════════════════
   The primary navigation of the grocery coach. Three moments, in the order a trip
   happens: List (before) · Scan (in the aisle) · Haul (after). Scan is the front
   door — center, raised, gold, unmistakably the primary action; a tap opens the
   camera/barcode entry directly. List and Haul flank it as flat tabs.

   Tokens only. Fixed to the bottom for single-hand thumb reach. */

function SideTab({ label, active, icon, onClick }) {
  const color = active ? colors.accentGold : colors.textMuted;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      style={{ ...styles.tab, color }}
    >
      <span style={styles.tabIcon}>{icon}</span>
      <span style={styles.tabLabel}>{label}</span>
    </button>
  );
}

export default function BottomNav({ active, onList, onScan, onHaul, onChat }) {
  return (
    <nav style={styles.nav} aria-label="Primary">
      {/* Chat sits ABOVE the three moments rather than becoming a fourth one.
          List · Scan · Haul are a sequence — before, in the aisle, after — and
          slotting chat into that row would break the story and squeeze four
          labels into a 390px bar. As her own affordance it stays obvious without
          pretending to be a moment. Hidden while chat is already open. */}
      {onChat && active !== 'chat' && (
        <div style={styles.askRow}>
          <button type="button" onClick={onChat} style={styles.ask} aria-label="Ask Kristy">
            <span style={styles.askDot} aria-hidden="true" />
            Ask Kristy
          </button>
        </div>
      )}

      <div style={styles.row}>
        <SideTab label="List" active={active === 'list'} icon={<ListIcon />} onClick={onList} />

        {/* Scan — center, raised, primary. The front door. */}
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
  // Her affordance rides above the moment row, right-aligned for thumb reach.
  // Outlined gold, never filled — filled gold belongs to Scan, the primary action.
  askRow: {
    maxWidth: 520,
    margin: '0 auto',
    padding: '0 12px',
    display: 'flex',
    justifyContent: 'flex-end',
    transform: 'translateY(-10px)',
    pointerEvents: 'none',
  },
  ask: {
    pointerEvents: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    minHeight: 44,
    padding: '9px 15px',
    borderRadius: 999,
    background: colors.surface,
    border: `1px solid ${colors.accentGold}`,
    color: colors.accentGold,
    fontFamily: fonts.ui,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(0,0,0,0.32)',
  },
  askDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: colors.accentGold,
    flex: '0 0 auto',
  },
  nav: {
    // Normal-flow bottom bar: the last flex child of .app, so content shrinks
    // above it and the raised Scan button never covers the chat input.
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
