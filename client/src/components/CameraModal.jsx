import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { CloseIcon } from './Icons.jsx';

// Full-screen (mobile) / centered card (desktop) barcode scanner.
// Continuously decodes the camera stream; calls onScan(text) on first hit.
export default function CameraModal({ open, onClose, onScan }) {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  // ONE decode per opening of the camera. ZXing's callback fires per analyzed frame
  // and `controls.stop()` does not take effect synchronously, so without this a
  // sweep across a shelf could fire onScan TWICE — two lookups in flight, and
  // whichever resolved last rendered. That is a wrong-product bug by construction:
  // the shopper reads a verdict for a barcode they didn't mean to scan.
  const firedRef = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    firedRef.current = false;
    setError('');

    const reader = new BrowserMultiFormatReader();
    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, _err, controls) => {
        controlsRef.current = controls;
        if (cancelled) {
          controls.stop();
          return;
        }
        if (result) {
          if (firedRef.current) return; // a second decoded frame is not a second scan
          firedRef.current = true;
          controls.stop();
          onScan(result.getText());
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
        if (cancelled) controls.stop();
      })
      .catch((e) => {
        const denied =
          e?.name === 'NotAllowedError' || /permission|denied/i.test(e?.message || '');
        setError(
          denied
            ? 'Camera access needed — please allow camera in your browser settings'
            : 'Could not start the camera — try again.'
        );
      });

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop();
      } catch {
        /* ignore */
      }
      const v = videoRef.current;
      if (v && v.srcObject) {
        v.srcObject.getTracks().forEach((t) => t.stop());
        v.srcObject = null;
      }
    };
  }, [open, onScan]);

  if (!open) return null;

  return (
    <div className="scanner-overlay">
      <div className="scanner-card">
        <button className="scanner-close" onClick={onClose} aria-label="Close scanner">
          <CloseIcon />
        </button>

        {error ? (
          <div className="scanner-error">{error}</div>
        ) : (
          <>
            <div className="scanner-video-wrap">
              <video ref={videoRef} className="scanner-video" muted playsInline />
              {/* The viewfinder carries NO text — just the live feed and four gold
                  corner brackets (the motif's thin gold line weight) marking where
                  to place the barcode/label. All copy lives on ScanHome, before the
                  camera opens. No animation — nothing to respect under reduced-motion. */}
              <div className="scan-frame" aria-hidden="true">
                <span className="scan-corner scan-corner--tl" />
                <span className="scan-corner scan-corner--tr" />
                <span className="scan-corner scan-corner--bl" />
                <span className="scan-corner scan-corner--br" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
