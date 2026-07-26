// Central config + runtime mode detection.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const API_URL = import.meta.env.VITE_API_URL || ''; // '' → use Vite proxy (/api)

// Is the backend actually configured? Everything real depends on this.
export const IS_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Demo mode: mock data, zero backend. Explicit opt-in, or an UNCONFIGURED DEV build
// (the zero-setup convenience this was written for).
//
// It deliberately does NOT auto-engage in a production build. It used to: a deploy
// missing VITE_SUPABASE_* silently became a demo, and demo answers every barcode
// with the same canned fixture — so a shopper scanning chips got a coffee creamer,
// confidently, with a verdict on it. A missing env var must fail loudly, never
// quietly substitute fake data for a real answer.
export const IS_DEMO =
  import.meta.env.VITE_DEMO === 'true' || (!IS_CONFIGURED && import.meta.env.DEV);

// A production build with no backend configured. The app surfaces this instead of
// pretending to work.
export const IS_MISCONFIGURED = !IS_CONFIGURED && !IS_DEMO;

export const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
