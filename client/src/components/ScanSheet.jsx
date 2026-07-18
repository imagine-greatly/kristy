import { useRef } from 'react';
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
  onPickGoal,
  focusOffer,
  onAcceptFocus,
  onDismissFocus,
}) {
  const fileRef = useRef(null);
  if (!scan) return null;

  // The withheld-read CTA lives IN the card now (not a separate button below it):
  // members/free → "Unlock my read", guests → "Sign in for my read".
  const onUnlock = onUpgrade || onSignIn || null;
  const unlockLabel = onUpgrade ? 'Unlock my read' : 'Sign in for my read';

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
      <Centered title="Want the rest?" sub="You've had your look. Sign in and I'll read every scan against your goal.">
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
    // No readable ingredients (barcode not in the database, or an unreadable /
    // non-English label). Auto-pivot to the path that works: photograph the panel.
    const barcodeMiss = scan.mode === 'barcode';
    content = (
      <Centered
        title={barcodeMiss ? "I don't have that one" : "I can't read that one"}
        sub={
          barcodeMiss
            ? "That barcode isn't in the database — snap the ingredients panel and I'll read it straight off the label."
            : scan.message ||
              "That didn't come through. Try the ingredients panel again, better lit — or type the product name."
        }
      >
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
        <ScanVerdictCard
          verdict={scan.verdict}
          product={scan.product}
          goal={goal}
          onPickGoal={onPickGoal}
          pickingGoal={!!scan.pickingGoal}
          onUnlock={onUnlock}
          unlockLabel={unlockLabel}
        />
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
