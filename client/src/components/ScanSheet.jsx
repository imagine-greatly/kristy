import { useRef, useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import ScanVerdictCard from './ScanVerdictCard.jsx';
import AmbientIsm from './AmbientIsm.jsx';
import { CloseIcon } from './Icons.jsx';

/* ═══════════════════════ Scan sheet — the scan result surface ═══════════════════════
   The bottom-sheet chrome around a scan. Presents whatever runProductScan() returned:
     • loading  → Kristy is reading the label / looking up the barcode
     • gate     → guest hit the soft sign-in threshold
     • error    → a Kristy-voiced error, with what to do next
     • found:false → the "type the product" fallback (no ingredients readable)
     • verdict  → the Step-3 ScanVerdictCard

   Tokens only. The card itself owns the brand; this is just the frame + the
   non-verdict states. */

function Frame({ children, onClose }) {
  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Scan result">
      <div style={styles.scrim} onClick={onClose} />
      <div style={styles.sheet}>
        <button style={styles.close} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

/* The scan and the cart are ONE object, acted on two ways. A verdict is one tap from
   the trip, so scanning visibly builds the same cart you planned — the "keep it" of a
   real aisle. Her read rides along with the item (the cart shows the tier), so nothing
   about the coaching is lost when the sheet closes. */
function CartAction({ tier, onAddToCart, onOpenCart }) {
  const [added, setAdded] = useState(false);
  if (!onAddToCart) return null;

  const wouldSwap = tier === 'swap_recommended' || tier === 'skip';

  if (added) {
    return (
      <div style={styles.cartRow}>
        <span style={styles.cartDone}>In your cart ✓</span>
        {onOpenCart && (
          <button type="button" style={styles.cartGhost} onClick={onOpenCart}>
            View cart
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={styles.cartRow}>
      <button
        type="button"
        style={wouldSwap ? styles.cartGhostWide : styles.cartPrimary}
        onClick={() => {
          onAddToCart();
          setAdded(true);
        }}
      >
        {wouldSwap ? 'Add it anyway' : 'Keep it — add to cart'}
      </button>
    </div>
  );
}

function Centered({ title, sub, children }) {
  return (
    <div style={styles.centered}>
      <div style={styles.avatar}>K</div>
      <GoldThread />
      <div style={styles.title}>{title}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
      {children}
    </div>
  );
}

export default function ScanSheet({
  scan,
  goal,
  onClose,
  onSignIn,
  onLabelFile,
  onAsk,
  onUpgrade,
  onStartTrial,
  trialEligible = false,
  onPickGoal,
  onAddToCart,
  onOpenCart,
  focusOffer,
  onAcceptFocus,
  onDismissFocus,
  onOpenIngredient,
}) {
  const fileRef = useRef(null);
  if (!scan) return null;

  // The withheld-read CTA lives IN the card (not a separate button below it). For an
  // authed user who has never trialed, the peak-intent move is to START THE FREE WEEK
  // right here — the read they were blocked on then fills in place. A user who's
  // already used the trial routes to the paid Upgrade ("Unlock my read"); guests are
  // asked to sign in. (onUpgrade is present only for authed users; guests get onSignIn.)
  const canStartTrial = !!onStartTrial && trialEligible && !!onUpgrade;
  const onUnlock = canStartTrial ? onStartTrial : onUpgrade || onSignIn || null;
  const unlockLabel = canStartTrial
    ? 'Start my free week'
    : onUpgrade
      ? 'Unlock my read'
      : 'Sign in for my read';

  let content;
  if (scan.loading) {
    content = (
      <Centered
        title="Reading it…"
        sub={scan.mode === 'label' ? 'Pulling the ingredients off that label.' : 'Looking that one up.'}
      >
        <AmbientIsm style={{ marginTop: 6 }} />
      </Centered>
    );
  } else if (scan.gate) {
    content = (
      <Centered title="Want the rest?" sub="You've had your look. Sign in and every scan gets read against your goal.">
        {onSignIn && (
          <button style={styles.primaryBtn} onClick={onSignIn}>
            Sign in
          </button>
        )}
      </Centered>
    );
  } else if (scan.error) {
    content = (
      <Centered
        title="Hm."
        sub={scan.message || "That scan didn't go through — give it another try in a sec."}
      >
        <button style={styles.ghostBtn} onClick={onClose}>
          Close
        </button>
      </Centered>
    );
  } else if (scan.found === false) {
    // No readable ingredients: the barcode didn't decode cleanly, isn't in the
    // database, or the label is unreadable/non-English. In EVERY one of those cases
    // she says so and hands off to the path that always works — photographing the
    // panel. She never shows a different product in place of the one being held.
    const barcodeMiss = scan.mode === 'barcode';
    const title = scan.unreadable
      ? 'That barcode came through unclear'
      : barcodeMiss
        ? 'Not in the data yet'
        : "Can't read that panel";
    const sub = scan.unreadable
      ? "Guessing at a product from a partial read would be worse than not knowing. Snap the ingredient label — it gets read directly."
      : barcodeMiss
        ? 'Not in the data yet — snap the ingredient label and it gets read directly. That works on anything, barcode or not.'
        : scan.message ||
          'Try the ingredients panel again, better lit — or type the product name.';
    content = (
      <Centered title={title} sub={sub}>
        {scan.product?.name && <div style={styles.productHint}>{scan.product.name}</div>}
        {onLabelFile && (
          <>
            <button style={styles.primaryBtn} onClick={() => fileRef.current?.click()}>
              Photograph the label
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) onLabelFile(f);
              }}
            />
          </>
        )}
        <button style={styles.ghostBtn} onClick={onClose}>
          Type it instead
        </button>
      </Centered>
    );
  } else if (scan.verdict) {
    content = (
      <>
        {/* Sample data can never sit on the screen unlabeled. The demo fixture is the
            same product for every barcode, so without this it reads as a real lookup
            of whatever was just scanned. */}
        {scan.demo && (
          <div style={styles.demoBanner}>
            Sample product — demo mode isn't looking up real barcodes.
          </div>
        )}
        <ScanVerdictCard
          verdict={scan.verdict}
          product={scan.product}
          goal={goal}
          onPickGoal={onPickGoal}
          pickingGoal={!!scan.pickingGoal}
          onUnlock={onUnlock}
          unlockLabel={unlockLabel}
          onOpenIngredient={onOpenIngredient}
        />
        <CartAction tier={scan.verdict.tier} onAddToCart={onAddToCart} onOpenCart={onOpenCart} />
        {/* Contextual focus offer — a quiet, in-voice nudge after a pattern of the
            same flag. Never a modal; part of the sheet, dismissible, one per session. */}
        {focusOffer && (
          <div style={styles.focusOffer}>
            <p style={{ ...kristyVoice, ...styles.focusOfferLine }}>{focusOffer.line}</p>
            <div style={styles.focusOfferActions}>
              <button type="button" style={styles.focusYes} onClick={() => onAcceptFocus?.(focusOffer)}>
                Yes, watch it
              </button>
              <button type="button" style={styles.focusNo} onClick={() => onDismissFocus?.(focusOffer)}>
                Not now
              </button>
            </div>
          </div>
        )}
        {onAsk && (
          <button type="button" style={styles.askBtn} onClick={onAsk}>
            Ask Kristy about this
          </button>
        )}
      </>
    );
  } else {
    content = <Centered title="Nothing to show" sub="Try scanning again." />;
  }

  return <Frame onClose={onClose}>{content}</Frame>;
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 60,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrim: { position: 'absolute', inset: 0, background: colors.scrimVerdict },
  sheet: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    maxHeight: '92vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '20px 16px calc(20px + env(safe-area-inset-bottom))',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    border: `1px solid ${colors.border}`,
    borderBottom: 'none',
    background: colors.bg,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textMuted,
    cursor: 'pointer',
  },
  body: { paddingTop: 8 },

  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    textAlign: 'center',
    padding: '28px 18px 20px',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${colors.borderGold}`,
    background: colors.surface,
    color: colors.accentGold,
    fontFamily: fonts.voice,
    fontStyle: 'italic',
    fontSize: 24,
  },
  title: { ...kristyVoice, fontSize: 22, color: colors.textPrimary },
  sub: { fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.5, color: colors.textMuted, maxWidth: 320 },
  demoBanner: {
    width: '100%',
    maxWidth: 420,
    // Clears the absolutely-positioned close button (top:12, 36px tall), which is
    // opaque and would otherwise sit on top of this text.
    margin: '30px auto 12px',
    boxSizing: 'border-box',
    padding: '9px 14px',
    borderRadius: 10,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
    color: colors.accentGold,
    fontFamily: fonts.ui,
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
  productHint: {
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    color: colors.textPrimary,
    padding: '6px 12px',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  primaryBtn: {
    marginTop: 4,
    padding: '11px 22px',
    borderRadius: 999,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  ghostBtn: {
    marginTop: 4,
    padding: '10px 20px',
    borderRadius: 999,
    border: `1px solid ${colors.borderGold}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
  // ── The scan → cart action (one tap, "keep it") ──
  cartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    maxWidth: 420,
    margin: '14px auto 0',
  },
  cartPrimary: {
    flex: 1,
    minHeight: 48,
    padding: '13px 16px',
    borderRadius: 12,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  cartGhostWide: {
    flex: 1,
    minHeight: 48,
    padding: '13px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
  cartGhost: {
    flex: '0 0 auto',
    minHeight: 44,
    padding: '11px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.borderGold}`,
    background: 'transparent',
    color: colors.accentGold,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  cartDone: {
    flex: 1,
    fontFamily: fonts.ui,
    fontSize: 14.5,
    fontWeight: 700,
    color: colors.accentSeafoam,
  },
  askBtn: {
    display: 'block',
    width: '100%',
    maxWidth: 420,
    margin: '12px auto 0',
    padding: '12px 16px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },
  // ── Contextual focus offer (in-voice, dismissible, part of the sheet) ──
  focusOffer: {
    width: '100%',
    maxWidth: 420,
    margin: '14px auto 0',
    boxSizing: 'border-box',
    padding: '14px 16px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
  },
  focusOfferLine: { margin: 0, fontSize: 16, lineHeight: 1.5, color: colors.textPrimary },
  focusOfferActions: { display: 'flex', gap: 10, marginTop: 12 },
  focusYes: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 999,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  focusNo: {
    flex: '0 0 auto',
    padding: '10px 16px',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: 'transparent',
    color: colors.textMuted,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  unlockBtn: {
    display: 'block',
    width: '100%',
    maxWidth: 420,
    margin: '12px auto 0',
    padding: '13px 16px',
    borderRadius: 12,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
};
