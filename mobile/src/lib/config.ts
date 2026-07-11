// Central config. Values come from EXPO_PUBLIC_* env (inlined by Metro) with an
// expo-constants `extra` fallback. Same Supabase project + same Railway API as
// the web client — mobile is a pure client of the existing backend.

import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl || '';
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey || '';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || '';
export const REVENUECAT_IOS_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || extra.revenueCatIosKey || '';

// API base with any trailing slash stripped (matches the web client).
export const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';

// True only when the essentials are present. The app shows a config screen
// otherwise instead of crashing deep in a fetch.
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && apiBase);

// The RevenueCat entitlement that maps to "premium coaching". Configure this
// exact identifier on the entitlement in the RevenueCat dashboard.
export const PREMIUM_ENTITLEMENT = 'premium';
