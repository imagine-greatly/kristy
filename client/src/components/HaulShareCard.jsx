import { useEffect, useRef, useState } from 'react';
import { colors, fonts } from '../lib/tokens.js';
import { CloseIcon } from './Icons.jsx';
import { drawHaulCard, canvasToBlob, ensureCardFonts } from '../lib/haulCanvas.js';

/* ═══════════════════════ Share your haul (Step 10) ═══════════════════════
   The Haul scorecard drawn to a branded PNG (forest green + gold, thread/dot,
   distribution + Kristy's read + wordmark + CTA). "Share" hands the image to the
   web share sheet; personal data is toggleable off before it leaves the phone.
   Tokens only. */

export default function HaulShareCard({ haul, onClose }) {
  const canvasRef = useRef(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [hidePersonal, setHidePersonal] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    let alive = true;
    ensureCardFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!fontsReady || !canvasRef.current) return;
    drawHaulCard(canvasRef.current, { distribution: haul?.distribution, read: haul?.read, hidePersonal });
  }, [fontsReady, hidePersonal, haul]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const flash = (m) => {
    setStatus(m);
    setTimeout(() => setStatus(''), 1800);
  };

  function download(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-haul.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function share() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'my-haul.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Haul' });
        return;
      }
      download(blob);
      flash('Saved image');
    } catch (e) {
      if (e?.name !== 'AbortError') flash("Couldn't share — try Save");
    }
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      download(await canvasToBlob(canvas));
      flash('Saved image');
    } catch {
      flash("Couldn't save — try again");
    }
  }

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Share your haul">
      <div style={styles.scrim} onClick={onClose} />
      <div style={styles.sheet}>
        <button style={styles.close} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div style={styles.canvasWrap}>
          <canvas ref={canvasRef} style={styles.canvas} />
        </div>

        <label style={styles.toggle}>
          <input type="checkbox" checked={hidePersonal} onChange={(e) => setHidePersonal(e.target.checked)} />
          <span>Hide personal data</span>
        </label>

        <div style={styles.actions}>
          <button style={styles.primary} onClick={share}>
            Share
          </button>
          <button style={styles.ghost} onClick={save}>
            Save image
          </button>
        </div>
        {status && <div style={styles.status}>{status}</div>}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 },
  scrim: { position: 'absolute', inset: 0, background: colors.scrimVerdict },
  sheet: { position: 'relative', width: '100%', maxWidth: 400, maxHeight: '92vh', overflowY: 'auto', boxSizing: 'border-box', padding: '18px 16px calc(18px + env(safe-area-inset-bottom))', borderRadius: 22, border: `1px solid ${colors.border}`, background: colors.bg, display: 'flex', flexDirection: 'column', gap: 14 },
  close: { position: 'absolute', top: 12, right: 12, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 999, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.textMuted, cursor: 'pointer' },
  canvasWrap: { width: '100%', borderRadius: 14, overflow: 'hidden', border: `1px solid ${colors.border}` },
  canvas: { width: '100%', height: 'auto', display: 'block' },
  toggle: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: fonts.ui, fontSize: 14.5, color: colors.textSecondary, cursor: 'pointer' },
  actions: { display: 'flex', gap: 10 },
  primary: { flex: 1, padding: '13px 16px', borderRadius: 12, border: 'none', background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
  ghost: { flex: 1, padding: '13px 16px', borderRadius: 12, border: `1px solid ${colors.borderGold}`, background: 'transparent', color: colors.textSecondary, fontFamily: fonts.ui, fontWeight: 600, fontSize: 15, cursor: 'pointer' },
  status: { textAlign: 'center', fontFamily: fonts.ui, fontSize: 13, color: colors.textMuted },
};
