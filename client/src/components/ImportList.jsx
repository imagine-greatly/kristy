import { useRef, useState } from 'react';
import { colors, fonts, kristyDisplay, kristyVoice, radii } from '../lib/tokens.js';
import { importList } from '../lib/list.js';

/* ═══════════════════ Import a list the shopper already wrote ═══════════════════
   Two ways in — a photo of a paper list, or paste/type it — and one promise
   underneath both: what they hand over comes back whole. Nothing is dropped,
   nothing they chose specifically is rewritten, and anything unreadable comes back
   as their own marks for them to fix rather than a confident guess.

   The copy carries that promise, because it's the thing that makes the feature
   safe to use on a list you actually care about. */
export default function ImportList({ onClose, onImported }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  async function run(args, mode) {
    setBusy(mode);
    setError('');
    try {
      const res = await importList(args);
      if (!res?.list) {
        setError(res?.summary || "No list found in that. Try typing it out.");
        return;
      }
      onImported(res.list, res.summary);
      onClose();
    } catch (err) {
      setError(err?.message || "That didn’t go through. Try again.");
    } finally {
      setBusy('');
    }
  }

  return (
    <div style={S.scrim} onClick={busy ? undefined : onClose}>
      <div style={S.sheet} role="dialog" aria-modal="true" aria-label="Import a list" onClick={(e) => e.stopPropagation()}>
        <div style={S.head}>
          <h2 style={S.title}>Bring your own list</h2>
          <button type="button" style={S.close} onClick={onClose} aria-label="Close" disabled={!!busy}>
            ✕
          </button>
        </div>

        <p style={S.line}>
          Hand it over however you have it. Everything on it stays on it &mdash; the generic
          stuff just gets sharpened into what to actually reach for.
        </p>

        <button
          type="button"
          style={{ ...S.photo, ...(busy ? S.dim : null) }}
          onClick={() => fileRef.current?.click()}
          disabled={!!busy}
        >
          {busy === 'photo' ? 'Reading it…' : 'Photograph a list'}
          <span style={S.photoSub}>Handwritten is fine</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) run({ file }, 'photo');
          }}
        />

        <div style={S.or}>or paste it</div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'milk\neggs\nbread\nchicken'}
          rows={6}
          style={S.area}
          aria-label="Paste or type your list"
          disabled={!!busy}
        />

        {error && <p style={S.err}>{error}</p>}

        <button
          type="button"
          style={{ ...S.go, ...(!text.trim() || busy ? S.dim : null) }}
          onClick={() => run({ text }, 'text')}
          disabled={!text.trim() || !!busy}
        >
          {busy === 'text' ? 'Sharpening it…' : 'Bring it in'}
        </button>
      </div>
    </div>
  );
}

const S = {
  scrim: {
    position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center', background: 'rgba(4,8,5,0.72)', padding: 0,
  },
  sheet: {
    width: '100%', maxWidth: 520, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 10,
    padding: '20px 18px calc(22px + env(safe-area-inset-bottom))',
    borderRadius: '20px 20px 0 0', border: `1px solid ${colors.border}`, borderBottom: 'none',
    background: colors.surface, maxHeight: '88vh', overflowY: 'auto',
  },
  head: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { ...kristyDisplay, margin: 0, fontSize: 26, color: colors.ink },
  close: {
    flex: '0 0 auto', width: 36, height: 36, borderRadius: 999, border: 'none',
    background: 'transparent', color: colors.textMuted, fontSize: 16, cursor: 'pointer',
  },
  line: { ...kristyVoice, margin: 0, fontSize: 15, lineHeight: 1.5, color: colors.textMuted },
  photo: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
    width: '100%', minHeight: 56, padding: '12px 16px', marginTop: 4,
    borderRadius: radii.button, border: `0.5px solid ${colors.hairline}`, background: 'transparent',
    color: colors.inkBody, fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 700,
    cursor: 'pointer', textAlign: 'left',
  },
  photoSub: { fontSize: 12.5, fontWeight: 500, color: colors.textMuted },
  or: {
    fontFamily: fonts.ui, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
    textTransform: 'uppercase', color: colors.textMuted, margin: '6px 0 0',
  },
  area: {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12,
    border: `1px solid ${colors.border}`, background: colors.bg, color: colors.textPrimary,
    fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.5, resize: 'vertical',
  },
  err: { ...kristyVoice, margin: 0, fontSize: 14, color: colors.error },
  go: {
    width: '100%', minHeight: 50, marginTop: 4, borderRadius: radii.button, border: 'none',
    background: colors.action, color: colors.actionInk,
    fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 700, cursor: 'pointer',
  },
  dim: { opacity: 0.5, cursor: 'default' },
};
