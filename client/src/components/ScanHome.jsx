import { useRef } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { BarcodeIcon, CameraIcon, AisleIcon } from './Icons.jsx';
import AmbientIsm from './AmbientIsm.jsx';

/* ═══════════════════════ Scan — the labeled half of the store ═══════════════════════
   This surface reads what HAS a barcode. It is one half of the product, not the whole
   of it: the other half is the aisle with no label, which now has its own destination
   in the nav at the same weight. The link out of here is a peer, not a fallback.

   Tokens only. `guest` softens the copy since a guest gets the universal read. */

export default function ScanHome({ onScanBarcode, onLabelFile, onOpenChat, onAskAisle, guest = false }) {
  const fileRef = useRef(null);

  return (
    <div style={styles.wrap}>
      <div style={styles.mark}>Kristy</div>
      <GoldThread />
      <h1 style={styles.headline}>What&rsquo;s in the box?</h1>
      <p style={styles.sub}>
        {guest
          ? 'Ingredient by ingredient. No account needed. Half the store, though.'
          : 'Ingredient by ingredient, against how you eat. Half the store, though.'}
      </p>

      {/* ONE reflex action. The barcode button stays big and physical because it's
          the thing you hit one-handed with a box in the other. */}
      <div style={styles.actions}>
        <button type="button" style={styles.primary} onClick={onScanBarcode}>
          <BarcodeIcon size={24} />
          <span>Scan a barcode</span>
        </button>

        <button type="button" style={styles.minor} onClick={() => fileRef.current?.click()}>
          <CameraIcon size={17} />
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

      {/* The label path's real standing, stated once. Not error recovery: no barcode
          database covers a whole store, and a photographed panel reads anything. */}
      <p style={styles.aisleNote}>A photo of the ingredient panel reads anything a barcode misses.</p>

      {/* THE OTHER HALF, and it does not read as a fallback. "Nothing to scan?" framed
          the counter as what you do when the real feature fails. It is the differentiator:
          a barcode is table stakes, the counter is why anyone is here. Gold-edged card,
          stated as its own destination. */}
      {onAskAisle && (
        <button type="button" style={styles.otherHalf} onClick={onAskAisle}>
          <span style={styles.otherHalfIcon}>
            <AisleIcon size={20} />
          </span>
          <span style={styles.otherHalfText}>
            <span style={styles.otherHalfTitle}>The half with no barcode</span>
            <span style={styles.otherHalfSub}>
              Meat, seafood, produce, dairy, bulk. No scanner reads this half.
            </span>
          </span>
          <span style={styles.otherHalfChev} aria-hidden="true">›</span>
        </button>
      )}

      {onOpenChat && (
        <button type="button" style={styles.chatLink} onClick={onOpenChat}>
          Something messier to work through? →
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
  // Subordinate: a card lift, no gold, smaller type. Present, not competing.
  minor: {
    width: '100%',
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
  /* The other half of the store, as a real card. Gold-edged so it reads as a
     destination of equal standing, not a consolation link. */
  otherHalf: {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 15px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
    textAlign: 'left',
    cursor: 'pointer',
  },
  otherHalfIcon: { flex: '0 0 auto', display: 'flex', color: colors.accentGold },
  otherHalfText: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  otherHalfTitle: { fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 700, color: colors.textPrimary },
  otherHalfSub: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.4, color: colors.textMuted },
  otherHalfChev: { flex: '0 0 auto', color: colors.accentGoldMuted, fontSize: 18, lineHeight: 1 },
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

