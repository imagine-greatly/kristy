import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icons.jsx';
import { drawVerdictCard, canvasToBlob, ensureCardFonts } from '../lib/verdictCanvas.js';

/* ═══════════════════════ Kristy's Verdict — the shareable card ═══════════════════════
   The whole feature. The card is drawn onto a <canvas> (see lib/verdictCanvas.js)
   so what you see is EXACTLY what exports. This component is the overlay chrome:
   loading/error states, the format toggle, and the Share / Save actions. Fonts
   are awaited before the first draw so a text-less export is impossible. */

export default function VerdictCard({ loading, verdict, error, isGuest, onClose, onSignIn }) {
  const canvasRef = useRef(null);
  const [format, setFormat] = useState('portrait');
  const [fontsReady, setFontsReady] = useState(false);
  const [status, setStatus] = useState('');

  // Ensure the card fonts are actually loaded before any rasterize.
  useEffect(() => {
    let alive = true;
    ensureCardFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Draw whenever we have a verdict, the fonts are ready, or the format flips.
  useEffect(() => {
    if (!verdict || !fontsReady || !canvasRef.current) return;
    drawVerdictCard(canvasRef.current, verdict, format);
  }, [verdict, format, fontsReady]);

  // Escape closes.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const flash = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(''), 1800);
  };

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'kristys-verdict.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Kristy's Verdict",
          text: verdict?.verdict_line || "Kristy's Verdict",
        });
        return;
      }
      // No file-share support (most desktops) → fall back to a download.
      downloadBlob(blob);
      flash('Saved image');
    } catch (err) {
      if (err?.name !== 'AbortError') flash("Couldn't share — try Save");
    }
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasToBlob(canvas);
      downloadBlob(blob);
      flash('Saved image');
    } catch {
      flash("Couldn't save — try again");
    }
  }

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kristys-verdict.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  return (
    <div className="verdict">
      <div className="verdict__scrim" onClick={onClose} />
      <div className="verdict__sheet" role="dialog" aria-modal="true" aria-label="Kristy's Verdict">
        <button className="verdict__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        {loading && (
          <div className="verdict__loading">
            <div className="verdict__avatar">K</div>
            <div className="verdict__looking">Looking…</div>
            <div className="verdict__sub">Reading your {isGuest ? 'haul' : 'plate'} against the goal.</div>
          </div>
        )}

        {!loading && error && (
          <div className="verdict__loading">
            <div className="verdict__avatar">K</div>
            <div className="verdict__looking">Hm.</div>
            <div className="verdict__sub">{error}</div>
            <button className="verdict__btn verdict__btn--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {!loading && !error && verdict && (
          <>
            <div className="verdict__canvas-wrap">
              <canvas ref={canvasRef} className={`verdict__canvas verdict__canvas--${format}`} />
            </div>

            <div className="verdict__formats">
              <button
                className={`verdict__fmt${format === 'portrait' ? ' active' : ''}`}
                onClick={() => setFormat('portrait')}
              >
                Portrait
              </button>
              <button
                className={`verdict__fmt${format === 'square' ? ' active' : ''}`}
                onClick={() => setFormat('square')}
              >
                Square
              </button>
            </div>

            <div className="verdict__actions">
              <button className="verdict__btn verdict__btn--primary" onClick={handleShare}>
                Share
              </button>
              <button className="verdict__btn verdict__btn--ghost" onClick={handleSave}>
                Save image
              </button>
            </div>
            {status && <div className="verdict__status">{status}</div>}

            {isGuest && (
              <div className="verdict__hook">
                <p>That&rsquo;s my read cold. Sign in and I&rsquo;ll read it against your actual targets.</p>
                <button className="verdict__signin" onClick={onSignIn}>
                  Sign in
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
