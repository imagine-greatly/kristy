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

// ─── RevenueCat identifiers — configuration, not hardcoded literals ───
// These MUST match exactly what's set up in the RevenueCat dashboard. Defaults
// are RevenueCat's conventional identifiers so a standard setup works with no
// extra env, but any of them can be overridden per build.

// The entitlement that maps to "premium coaching" (Project → Entitlements).
export const PREMIUM_ENTITLEMENT =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT || extra.revenueCatEntitlement || 'premium';

// The offering to present. Empty ⇒ use whichever offering is marked "current"
// in the dashboard; set it to select a specific offering by identifier.
export const REVENUECAT_OFFERING =
  process.env.EXPO_PUBLIC_REVENUECAT_OFFERING || extra.revenueCatOffering || '';

// Package identifiers within that offering. RevenueCat's built-in package types
// are "$rc_annual" / "$rc_monthly"; override if you named custom packages.
export const REVENUECAT_ANNUAL_PACKAGE =
  process.env.EXPO_PUBLIC_REVENUECAT_ANNUAL_PACKAGE || extra.revenueCatAnnualPackage || '$rc_annual';
export const REVENUECAT_MONTHLY_PACKAGE =
  process.env.EXPO_PUBLIC_REVENUECAT_MONTHLY_PACKAGE || extra.revenueCatMonthlyPackage || '$rc_monthly';
