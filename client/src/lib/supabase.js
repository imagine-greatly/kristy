import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO } from './config.js';

// In demo mode we never touch Supabase.
export const supabase = IS_DEMO
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
