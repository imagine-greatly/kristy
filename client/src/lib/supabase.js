import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_DEMO } from './config.js';

// In demo mode we never touch Supabase.
export const supabase = IS_DEMO
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // restores session from magic-link redirect
      },
    });
