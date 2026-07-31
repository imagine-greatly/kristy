import React from 'react';
import { colors, fonts, kristyDisplay, radii } from '../lib/tokens.js';

/**
 * Root error boundary. A crash anywhere in the tree used to unmount everything and
 * leave an empty #root on a #040805 body — a black screen with nothing to read and
 * nothing to do. This renders a legible failure instead, always.
 *
 * What it does NOT catch, and why the boot guard in app.html also exists: an error
 * thrown while the module graph is still EVALUATING (an import-time throw, a chunk
 * that 404s) happens before any of this is mounted. React cannot catch what runs
 * before React. That case is covered by the inline guard in app.html.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the real stack in the console — the visible message is deliberately calm,
    // but whoever is debugging still needs the whole thing.
    console.error('[kristy] render failed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const detail = String(this.state.error?.message || this.state.error || 'Unknown error');

    return (
      <div style={S.wrap}>
        <div style={S.inner}>
          <p style={S.voice}>Something in here broke.</p>
          <p style={S.body}>
            Not your shopping — this screen. Reloading usually clears it. If it doesn’t,
            the details below say what happened.
          </p>
          <button type="button" style={S.button} onClick={() => window.location.reload()}>
            Reload
          </button>
          <details style={S.details}>
            <summary style={S.summary}>Technical details</summary>
            <pre style={S.pre}>{detail}</pre>
          </details>
        </div>
      </div>
    );
  }
}

/* Inline styles on purpose: this surface has to render even when the stylesheet is
   the thing that failed. Values are read from the token module so the brand stays
   centralized (non-negotiable #1) — nothing here invents a color or a face. */
const S = {
  wrap: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background: colors.bgDeep,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },
  inner: { maxWidth: 380, width: '100%', textAlign: 'center' },
  voice: {
    ...kristyDisplay,
    fontSize: 26,
    margin: '0 0 10px',
    color: colors.ink,
  },
  body: { fontSize: 15, lineHeight: 1.55, color: colors.textMuted, margin: '0 0 18px' },
  button: {
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: 600,
    padding: '11px 22px',
    borderRadius: radii.button,
    border: 'none',
    background: colors.action,
    color: colors.actionInk,
    cursor: 'pointer',
  },
  details: { marginTop: 22, textAlign: 'left' },
  summary: { fontSize: 13, color: colors.textMuted, cursor: 'pointer' },
  pre: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    background: colors.surface,
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};
