import { useRef } from 'react';
import { colors, fonts, kristyDisplay, radii } from '../lib/tokens.js';
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
      {/* "Half the store, though." IS GONE. It conceded a limit the product does not have —
          this tab is one of two ways to fill the cart, not a partial version of the job. The
          concession also arrived at the worst possible moment: directly under the headline,
          before the shopper has done anything, arguing against the surface they just opened.
          The counter is a capability and it gets stated as one below, not as an apology. */}
      <p style={styles.sub}>
        {guest
          ? 'Ingredient by ingredient. No account needed.'
          : 'Ingredient by ingredient, against how you eat.'}
      </p>

      {/* PHOTO IS THE PRIMARY ACTION NOW, and it is the reflex one: big, physical, the
          thing you hit one-handed with a box in the other.

          It used to be the barcode, and measurement is what moved it. Coverage came in at
          19% on independently sourced products, and when the database did answer it was
          wrong badly enough to put a gold seal on a corn-syrup ketchup. The photo has none
          of those failure modes — right product, right market, right now — and it is truer
          to what Kristy is. A scanner looks up a number. She reads the label. */}
      <div style={styles.actions}>
        <button type="button" style={styles.primary} onClick={() => fileRef.current?.click()}>
          <CameraIcon size={24} />
          <span>Photograph the label</span>
        </button>

        <button type="button" style={styles.minor} onClick={onScanBarcode}>
          <BarcodeIcon size={17} />
          <span>Scan a barcode</span>
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

      {/* THIS LINE WAS EXACTLY BACKWARDS once the photo became primary — it framed the
          panel as the thing you do when the barcode misses. The barcode is the shortcut
          now, and the honest thing to say about it is that it is fast when it works. */}
      <p style={styles.aisleNote}>A barcode is faster when the database has it. The panel always reads.</p>

      {/* THE OTHER HALF, and it does not read as a fallback. "Nothing to scan?" framed
          the counter as what you do when the real feature fails. It is the differentiator:
          a barcode is table stakes, the counter is why anyone is here. Gold-edged card,
          stated as its own destination. */}
      {onAskAisle && (
        <button type="button" style={styles.otherHalf} onClick={onAskAisle}>
          <span style={styles.otherHalfIcon}>
            <AisleIcon size={20} />
          </span>
          {/* BOTH LINES USED TO DEFINE THIS HALF BY WHAT CANNOT READ IT — "The half with no
              barcode", "No scanner reads this half." True of scanners, and irrelevant: the
              claim that matters is that KRISTY reads it. Naming the gap is how the previous
              copy made the moat sound like a blind spot, on the one surface where a shopper
              is deciding whether the unlabeled half is covered at all. It is the moat, so it
              is stated as a capability. */}
          <span style={styles.otherHalfText}>
            <span style={styles.otherHalfTitle}>The counter, answered</span>
            <span style={styles.otherHalfSub}>
              Meat, seafood, produce, dairy, bulk. No barcode needed.
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
  mark: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.brass },
  headline: { ...kristyDisplay, margin: '4px 0 0', fontSize: 26, lineHeight: 1.25, color: colors.ink },
  sub: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.5, color: colors.textMuted, maxWidth: 320 },
  // `alignItems: center` so the primary sizes to its own content instead of inheriting the
  // column's full width — CENTER rather than flex-start because this whole surface is
  // centred (mark, headline, sub, footer line all are). Left-aligning just the button put it
  // out of square with everything above it, which the render showed and the style did not.
  // The barcode option below still stretches: it is a quiet outlined row, and a wide
  // hairline costs nothing. It is bone that has to be rationed, not width.
  actions: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 14 },
  /* THE REFLEX, AND STILL THE ONE FILLED ACTION — just no longer a banner. It was
     full-width at 19px padding and 16.5px type, which put a large field of near-white
     across the surface. Area was the problem, not the colour: the comment above this used
     to say "gold, tall, unmissable" while the style has been BONE the whole time, which is
     its own small lesson about comments describing what code once did. */
  primary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    padding: '13px 20px',
    borderRadius: radii.button,
    border: 'none',
    background: colors.action,
    color: colors.actionInk,
    boxShadow: colors.shadowRaised,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 15.5,
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
    borderRadius: radii.button,
    border: `0.5px solid ${colors.hairline}`,
    background: 'transparent',
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

