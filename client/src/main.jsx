import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* Vercel Web Analytics — pageviews/visitors for the app. Only sends in
        production on Vercel; a no-op in dev/preview. */}
    <Analytics />
  </React.StrictMode>
);
