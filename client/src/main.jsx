import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { IS_MISCONFIGURED, MISSING_ENV } from './lib/config.js';
import { colors, fonts, kristyDisplay } from './lib/tokens.js';
import './index.css';

// A production build with no backend configured used to fall through to demo mode
// and answer every barcode with the same canned product. Fake data is never the
// safer failure — this says what's wrong instead, and names the exact vars to set.
function Misconfigured() {
  return (
    <div style={S.wrap}>
      <div style={S.inner}>
        <p style={S.voice}>Kristy can’t start.</p>
        <p style={S.body}>
          This build is missing its configuration, so nothing it showed you would be
          real. Set {MISSING_ENV.length > 1 ? 'these' : 'this'} in the deployment
          environment and redeploy:
        </p>
        <ul style={S.list}>
          {MISSING_ENV.map((name) => (
            <li key={name} style={S.item}>
              <code>{name}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Inline styles, sourced from the token module: this surface has to render even when
   the stylesheet is the thing that failed. */
const S = {
  wrap: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    textAlign: 'center',
    background: colors.bgDeep,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },
  inner: { maxWidth: 380 },
  voice: {
    ...kristyDisplay,
    fontSize: 26,
    margin: '0 0 10px',
  },
  body: { fontSize: 15, lineHeight: 1.55, color: colors.textMuted, margin: 0 },
  list: { listStyle: 'none', padding: 0, margin: '14px 0 0' },
  item: { fontFamily: fonts.mono, fontSize: 13, color: colors.inkBody, lineHeight: 1.9 },
};

// The boundary wraps BOTH branches: a mount failure has to be legible whether the
// build is configured or not. It cannot catch an import-time throw, though — see the
// boot guard in app.html for that layer.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>{IS_MISCONFIGURED ? <Misconfigured /> : <App />}</ErrorBoundary>
    {/* Vercel Web Analytics — pageviews/visitors for the app. Only sends in
        production on Vercel; a no-op in dev/preview. */}
    <Analytics />
  </React.StrictMode>
);
