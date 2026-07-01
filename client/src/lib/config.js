// Central config + runtime mode detection.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const API_URL = import.meta.env.VITE_API_URL || ''; // '' → use Vite proxy (/api)

// Demo mode: explicitly requested, or no Supabase configured yet.
// Lets the full UI run with mock data and zero backend setup.
export const IS_DEMO =
  import.meta.env.VITE_DEMO === 'true' || !SUPABASE_URL || !SUPABASE_ANON_KEY;

export const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
