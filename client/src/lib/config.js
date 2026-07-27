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

// Exactly which required VITE_* vars this build is missing, by name. A deploy that
// says WHICH var is unset is fixable in one step; "something went wrong" is not.
//
// VITE_API_URL is required in a PRODUCTION build only. In dev, blank is the documented
// setup — it means "use the Vite proxy to localhost:3001" (see vite.config.js). In a
// production build blank makes apiBase '', so every fetch goes to the Vercel origin,
// where vercel.json has no /api rewrite: the app would load and then 404 on everything.
// That failure is worth catching at boot rather than one confusing request at a time.
export const MISSING_ENV = IS_DEMO
  ? []
  : [
      !SUPABASE_URL && 'VITE_SUPABASE_URL',
      !SUPABASE_ANON_KEY && 'VITE_SUPABASE_ANON_KEY',
      !API_URL && import.meta.env.PROD && 'VITE_API_URL',
    ].filter(Boolean);

// A build with no working backend. The app surfaces this instead of pretending to work.
export const IS_MISCONFIGURED = MISSING_ENV.length > 0;

export const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
