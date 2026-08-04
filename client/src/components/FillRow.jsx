import { colors, fonts } from '../lib/tokens.js';
import { BarcodeIcon, AisleIcon } from './Icons.jsx';

/* ═══════════ The two ways to fill the cart, at identical weight ═══════════
   This row is the whole positioning in one component. Scanning vets the packaged
   half; the counter answers the unlabeled half (meat, fish, eggs, produce, bulk).
   Neither is the primary. They are the same size, the same border, the same gold,
   and they sit side by side so the equality is impossible to miss.

   The cart header used to carry a solid-gold "Scan" pill and the counter got a plain
   grey ghost button further down the page. That was a throne in miniature.

   IT LIVES IN ITS OWN MODULE BECAUSE BOTH HALVES OF THE SPLIT NEED IT. When the cart's
   header and its trip question moved out to the dashboard, this was rendered by the piece
   that left AND by the piece that stayed. Copying it would have made the byte-identical
   styling below a coincidence maintained by hand — and that styling is the argument, not
   the decoration. One module, imported twice.

   IT IS ALSO THE REASON THE TAB BAR CAN STOP CARRYING THAT ARGUMENT. Scan and Counter are
   adjacent equal tabs today and that equality is the positioning; this row asserts exactly
   the same thing on the home surface, in the same treatment, which is what makes moving
   the cart into the dashboard safe rather than a quiet demotion of the counter. */
export default function FillRow({ onScan, onAskAisle }) {
  if (!onScan && !onAskAisle) return null;
  return (
    <div style={styles.fillRow}>
      {onScan && (
        <button type="button" style={styles.fill} onClick={onScan}>
          <span style={styles.fillIcon}><BarcodeIcon size={20} /></span>
          <span style={styles.fillLabel}>Scan</span>
          <span style={styles.fillSub}>The label, or a barcode</span>
        </button>
      )}
      {onAskAisle && (
        <button type="button" style={styles.fill} onClick={onAskAisle}>
          <span style={styles.fillIcon}><AisleIcon size={20} /></span>
          <span style={styles.fillLabel}>Counter</span>
          <span style={styles.fillSub}>Meat, fish, produce</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  /* THE TWO WAYS TO FILL THE CART. Byte-identical styling on purpose: same width,
     same border, same gold, same type. Whatever is true of one is true of the other,
     which is the entire point of the row. */
  fillRow: { display: 'flex', gap: 10 },
  fill: {
    flex: '1 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 3,
    padding: '13px 14px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
    textAlign: 'left',
    cursor: 'pointer',
  },
  fillIcon: { display: 'flex', color: colors.accentGold, marginBottom: 2 },
  fillLabel: { fontFamily: fonts.ui, fontSize: 15, fontWeight: 700, color: colors.textPrimary },
  fillSub: { fontFamily: fonts.ui, fontSize: 12, lineHeight: 1.35, color: colors.textMuted },
};
