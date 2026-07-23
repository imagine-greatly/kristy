import { useRef } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { BarcodeIcon, CameraIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';

/* ═══════════════════════ Scan moment — the front door ═══════════════════════
   The default surface. Kristy invites the in-aisle action: scan a barcode or
   photograph a label, and she reads it against your goal. Chat is reachable from
   here (demoted from a primary tab), not the other way around.

   Tokens only. `guest` softens the copy since a guest gets the universal read. */

export default function ScanHome({ onScanBarcode, onLabelFile, onOpenChat, onAskAisle, guest = false }) {
  const fileRef = useRef(null);

  return (
    <div style={styles.wrap}>
      <div style={styles.mark}>Kristy</div>
      <GoldThread />
      <h1 style={styles.headline}>
        {guest ? "Show me what's in your cart." : "What are we putting in the cart?"}
      </h1>
      <p style={styles.sub}>
        {guest
          ? "Scan a product and I'll tell you what's really in it — no account needed to look."
          : "Scan a product and I'll read it against your goal, right here in the aisle."}
      </p>

      <div style={styles.actions}>
        <button type="button" style={styles.primary} onClick={onScanBarcode}>
          <BarcodeIcon size={22} />
          <span>Scan a barcode</span>
        </button>

        <button type="button" style={styles.secondary} onClick={() => fileRef.current?.click()}>
          <CameraIcon size={20} />
          <span>Photograph the label</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // allow re-selecting the same file
            if (file) onLabelFile(file);
          }}
        />
      </div>

      {/* No barcode at the fish counter or the produce wall — ask the aisle instead. */}
      {onAskAisle && (
        <button type="button" style={styles.aisle} onClick={onAskAisle}>
          At the counter with nothing to scan? Ask about the aisle →
        </button>
      )}

      {onOpenChat && (
        <button type="button" style={styles.chatLink} onClick={onOpenChat}>
          Prefer to talk it through? Ask Kristy →
        </button>
      )}

      <AmbientIsm style={{ marginTop: 22 }} />
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 14,
    maxWidth: 420,
    margin: '0 auto',
    padding: '48px 22px 24px',
  },
  mark: { fontFamily: fonts.voice, fontStyle: 'italic', fontSize: 30, color: colors.accentGold },
  headline: { ...kristyVoice, margin: '4px 0 0', fontSize: 26, lineHeight: 1.25, color: colors.textPrimary },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.5, color: colors.textMuted, maxWidth: 320 },
  actions: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 },
  primary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '15px 20px',
    borderRadius: 14,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 16,
    cursor: 'pointer',
  },
  secondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '14px 20px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
  aisle: {
    marginTop: 6,
    padding: '10px 14px',
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
  },
  chatLink: {
    marginTop: 8,
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontSize: 13.5,
    cursor: 'pointer',
  },
};

