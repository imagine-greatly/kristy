// RevenueCat wrapper. All Apple IAP flows go through here. The server's
// `subscriptions` table stays the single source of truth for premium access —
// RevenueCat's webhook upserts it (provider='apple'), and the app reads it via
// getSubscription(). This module handles the on-device purchase/restore UX.
//
// IMPORTANT: react-native-purchases needs a native build (a dev/prod build,
// NOT Expo Go). Every call is guarded so the app degrades gracefully elsewhere.

import { Platform } from 'react-native';
import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
  type CustomerInfo,
} from 'react-native-purchases';
import { REVENUECAT_IOS_KEY, PREMIUM_ENTITLEMENT } from './config';

let configured = false;

/** Purchases only run on a native iOS build with a configured RC key. */
export function purchasesSupported(): boolean {
  return Platform.OS === 'ios' && !!REVENUECAT_IOS_KEY;
}

/**
 * Configure RevenueCat with the current Supabase user id as the RC App User ID.
 * Using our user id as the RC identity is what lets the RevenueCat webhook map an
 * Apple purchase back to the right row in our `subscriptions` table. Safe to call
 * repeatedly (e.g. on every sign-in); only the first configure() takes effect,
 * subsequent identity changes go through logIn().
 */
export async function configurePurchases(userId: string): Promise<void> {
  if (!purchasesSupported()) return;
  try {
    if (!configured) {
      Purchases.configure({ apiKey: REVENUECAT_IOS_KEY, appUserID: userId });
      configured = true;
    } else {
      await Purchases.logIn(userId);
    }
  } catch (e) {
    console.warn('[kristy] RevenueCat configure failed:', (e as Error)?.message);
  }
}

/** Detach the RC identity on sign-out (returns to an anonymous RC id). */
export async function logoutPurchases(): Promise<void> {
  if (!purchasesSupported() || !configured) return;
  try {
    await Purchases.logOut();
  } catch {
    /* ignore */
  }
}

/** The current offering (its availablePackages drive the plan cards). */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!purchasesSupported()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.warn('[kristy] getOfferings failed:', (e as Error)?.message);
    return null;
  }
}

/** Pick the monthly / annual packages out of an offering by RC package type. */
export function splitPackages(offering: PurchasesOffering | null) {
  const pkgs = offering?.availablePackages ?? [];
  const annual =
    offering?.annual ?? pkgs.find((p) => /annual|year/i.test(p.identifier)) ?? null;
  const monthly =
    offering?.monthly ?? pkgs.find((p) => /month/i.test(p.identifier)) ?? null;
  return { annual, monthly };
}

/** True when the customer holds the premium entitlement. */
export function hasPremium(info: CustomerInfo | null | undefined): boolean {
  return !!info?.entitlements.active[PREMIUM_ENTITLEMENT];
}

/**
 * Buy a package. Resolves { premium } on success. A user cancel resolves
 * { cancelled: true } (not an error). Any real failure throws.
 */
export async function purchase(
  pkg: PurchasesPackage
): Promise<{ premium: boolean; cancelled?: boolean }> {
  if (!purchasesSupported()) throw new Error('Purchases are only available on iOS.');
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { premium: hasPremium(customerInfo) };
  } catch (e: any) {
    if (e?.userCancelled) return { premium: false, cancelled: true };
    throw new Error(e?.message || 'Purchase could not be completed.');
  }
}

/** Restore prior purchases (Apple requires a visible restore action). */
export async function restore(): Promise<{ premium: boolean }> {
  if (!purchasesSupported()) throw new Error('Purchases are only available on iOS.');
  const info = await Purchases.restorePurchases();
  return { premium: hasPremium(info) };
}
