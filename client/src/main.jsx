import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import { IS_MISCONFIGURED } from './lib/config.js';
import './index.css';

// A production build with no backend configured used to fall through to demo mode
// and answer every barcode with the same canned product. Fake data is never the
// safer failure — this says what's wrong instead.
function Misconfigured() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center', color: '#F2EFE6',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 380 }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 22, margin: '0 0 10px' }}>
          I can't reach my kitchen right now.
        </p>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: '#A8B5AC', margin: 0 }}>
          This build is missing its backend configuration, so nothing it showed you
          would be real. Set <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> and redeploy.
        </p>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {IS_MISCONFIGURED ? <Misconfigured /> : <App />}
    {/* Vercel Web Analytics — pageviews/visitors for the app. Only sends in
        production on Vercel; a no-op in dev/preview. */}
    <Analytics />
  </React.StrictMode>
);
