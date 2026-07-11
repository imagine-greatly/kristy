// Supabase client for React Native. Same project + anon key as web; the only
// differences are the storage adapter (AsyncStorage), no URL session detection
// (phone/SMS OTP resolves the session directly via verifyOtp), and the AppState
// hook Supabase recommends so tokens refresh while the app is foregrounded.

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// createClient requires a syntactically valid URL; fall back to a placeholder so
// a misconfigured build reaches the config screen instead of throwing on import.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

// Refresh the session while the app is in the foreground; pause when backgrounded.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/** The current access token, or undefined. Used to authorize API calls. */
export async function authToken(): Promise<string | undefined> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}
