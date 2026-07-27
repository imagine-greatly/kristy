import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO, IS_CONFIGURED } from './config.js';

// In demo mode we never touch Supabase — and when the keys are simply absent we hand
// back null rather than calling createClient at all.
//
// That second clause is load-bearing. `createClient('', '')` throws "supabaseUrl is
// required." at MODULE SCOPE, and App.jsx imports this file, so the throw happens
// while the module graph is still evaluating — before main.jsx's body runs, before
// React mounts, before any error boundary exists. The result is an empty #root on a
// near-black body: a black screen with nothing to read. A missing env var has to let
// the app boot far enough to SAY what's missing (main.jsx / IS_MISCONFIGURED).
//
// Null is safe here: every caller of `supabase` lives inside <App />, which never
// renders when the config is incomplete.
export const supabase =
  IS_DEMO || !IS_CONFIGURED
    ? null
    : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // Phone/SMS OTP resolves the session directly via verifyOtp — no URL
          // redirect. Left on (the Supabase default) but not relied upon here.
          detectSessionInUrl: true,
        },
      });
