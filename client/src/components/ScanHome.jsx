import { useRef } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { BarcodeIcon, CameraIcon, AisleIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';

/* ═══════════════════════ Scan moment — in the aisle ═══════════════════════
   One of three peer moments, not the app's identity and no longer where it boots.
   Three equal physical actions live here, because the store has two halves: scan a
   barcode, photograph a label, or — for produce, the counter, the bulk bins, where
   there's nothing to scan — ask about the aisle. The unlabeled half is a PEER of the
   scanned half, so its entry point is a button beside the others, not a link below them.

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
          ? "Scan a product — what's really in it, ingredient by ingredient. No account needed to look."
          : 'Scan it — the verdict against your goal, right here in the aisle.'}
      </p>

      {/* ONE reflex action, then two quiet fallbacks.
          These were three equal full-width buttons, which repeated the docked
          composer's job — it already does photo and ask on every surface. The barcode
          button stays big and physical because it's the thing you hit one-handed with a
          box in the other; the other two step down to a quiet pair, present without
          competing. */}
      <div style={styles.actions}>
        <button type="button" style={styles.primary} onClick={onScanBarcode}>
          <BarcodeIcon size={24} />
          <span>Scan a barcode</span>
        </button>

        <div style={styles.minorRow}>
          <button type="button" style={styles.minor} onClick={() => fileRef.current?.click()}>
            <CameraIcon size={17} />
            <span>Photograph the label</span>
          </button>
          {onAskAisle && (
            <button type="button" style={styles.minor} onClick={onAskAisle}>
              <AisleIcon size={17} />
              <span>Ask the aisle</span>
            </button>
          )}
        </div>

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

      {/* The label path's real standing, stated once. It isn't error recovery — no
          barcode database covers the whole store, and a photographed ingredient panel
          works on anything, including the products none of them have. */}
      <p style={styles.aisleNote}>
        No barcode, or nothing in the database? A photo of the ingredient panel reads
        on anything.
      </p>

      <p style={styles.aisleNote}>
        Produce, the counter, the bulk bins — the half of the store with no label has
        sourced answers too.
      </p>

      {onOpenChat && (
        <button type="button" style={styles.chatLink} onClick={onOpenChat}>
          Something messier to work through? Ask Kristy →
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
  actions: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 },
  // The reflex. Gold, tall, unmissable — one of the few places gold is spent.
  primary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    padding: '19px 20px',
    borderRadius: 16,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    boxShadow: colors.shadowRaised,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 16.5,
    cursor: 'pointer',
  },
  minorRow: { display: 'flex', gap: 10 },
  // Subordinate: a card lift, no gold, smaller type. Present, not competing.
  minor: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: '11px 12px',
    borderRadius: 12,
    border: 'none',
    background: colors.surface,
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 13.5,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  aisleNote: {
    margin: '2px 0 0',
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 1.5,
    color: colors.textMuted,
    maxWidth: 320,
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

