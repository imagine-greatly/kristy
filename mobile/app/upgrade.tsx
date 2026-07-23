// Upgrade sheet — the coach-vs-tracker framing from the web Upgrade.jsx, wired
// to RevenueCat (Apple IAP) instead of Stripe. Bottom sheet over a scrim.
// Includes the Apple-required "Restore purchases" action. Premium access is
// confirmed by re-reading the server subscription (the RevenueCat webhook upserts
// it), so the CTA polls getSubscription after a successful purchase.
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { colors, fonts } from '../src/theme';
import { useApp } from '../src/context/AppProvider';
import { CloseIcon } from '../src/components/Icons';
import {
  getCurrentOffering,
  splitPackages,
  purchase,
  restore,
  purchasesSupported,
} from '../src/lib/purchases';
import { PRICING as STATIC, PLAN_ORDER, type PlanId } from '../src/lib/pricing';
import { selectTick } from '../src/lib/haptics';

const INCLUDES = [
  'Adaptive targets that retune as your weight moves',
  'A weekly read every Sunday — what worked, what to fix',
  'Memory of every day and pattern, always on hand',
  'Weight trends and the full optimization loop',
];

// Static fallback copy (STATIC = the single pricing source in src/lib/pricing.ts)
// is shown until RevenueCat offerings load, or if IAP is unavailable (e.g. Expo
// Go). Apple prices are tier-based and already tax-inclusive by region, so
// there's no "+tax" logic here (unlike Stripe). The store's priceString from the
// loaded offering is the source of truth once offerings load.

export default function UpgradeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshSubscription } = useApp();

  const [plan, setPlan] = useState<PlanId>('annual');
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState<'' | 'checkout' | 'restore'>('');
  const [error, setError] = useState('');

  const [offerLoaded, setOfferLoaded] = useState(false);

  useEffect(() => {
    getCurrentOffering().then((o) => {
      setOffering(o);
      setOfferLoaded(true);
    });
  }, []);

  const { annual, monthly } = splitPackages(offering);
  const pkgFor = (id: PlanId): PurchasesPackage | null => (id === 'annual' ? annual : monthly);

  // Fail LOUDLY, never silently: if IAP is supported but the offering loaded with
  // no purchasable plans, the RevenueCat offering/products aren't wired. Log the
  // fact and surface a Kristy-voiced line instead of a dead "Start coaching" button.
  const plansUnavailable = purchasesSupported() && offerLoaded && !annual && !monthly;
  useEffect(() => {
    if (plansUnavailable) {
      console.error(
        '[kristy] RevenueCat offering loaded with no annual/monthly package — check the offering + product identifiers in the dashboard.'
      );
    }
  }, [plansUnavailable]);

  const priceFor = (id: PlanId) => {
    const pkg = pkgFor(id);
    if (pkg) return { price: pkg.product.priceString, per: id === 'annual' ? '/year' : '/month' };
    return { price: STATIC[id].price, per: STATIC[id].per };
  };

  // Poll the server subscription a few times (the RC webhook lands async).
  async function confirmPremiumThenClose() {
    for (let i = 0; i < 5; i++) {
      const sub = await refreshSubscription();
      if (sub.premium) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    router.back();
  }

  async function subscribe() {
    const pkg = pkgFor(plan);
    if (!pkg) {
      setError(
        !purchasesSupported()
          ? 'Purchases are only available in the App Store build.'
          : plansUnavailable
            ? "I can't open checkout right now — my membership isn't finished setting up on my end. Try again in a little while."
            : 'Plans are still loading — give it a moment and try again.'
      );
      return;
    }
    setLoading('checkout');
    setError('');
    try {
      const res = await purchase(pkg);
      if (res.cancelled) {
        setLoading('');
        return;
      }
      await confirmPremiumThenClose();
    } catch (e: any) {
      setError(e?.message || 'Could not complete the purchase.');
      setLoading('');
    }
  }

  async function onRestore() {
    setLoading('restore');
    setError('');
    try {
      const res = await restore();
      if (res.premium) {
        await confirmPremiumThenClose();
      } else {
        setError('No previous purchase found for this Apple ID.');
        setLoading('');
      }
    } catch (e: any) {
      setError(e?.message || 'Could not restore purchases.');
      setLoading('');
    }
  }

  return (
    <View style={styles.root}>
      <Pressable style={styles.scrim} onPress={() => router.back()} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable style={styles.close} onPress={() => router.back()} accessibilityLabel="Close" hitSlop={8}>
          <CloseIcon />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 12 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>K</Text>
          </View>
          <Text style={styles.title}>Kristy, the coach</Text>
          <Text style={styles.tag}>The tracker logs your food. The coach optimizes what happens next.</Text>

          <View style={styles.list}>
            {INCLUDES.map((line) => (
              <View key={line} style={styles.item}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.itemText}>{line}</Text>
              </View>
            ))}
          </View>

          <View style={styles.plans}>
            {PLAN_ORDER.map((id) => {
              const p = priceFor(id);
              const selected = plan === id;
              return (
                <Pressable
                  key={id}
                  style={[styles.plan, selected && styles.planSelected]}
                  onPress={() => {
                    selectTick();
                    setPlan(id);
                  }}
                >
                  {STATIC[id].badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{STATIC[id].badge}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.planLabel}>{STATIC[id].label}</Text>
                  <Text style={styles.planPrice}>
                    {p.price}
                    <Text style={styles.planPer}>{p.per}</Text>
                  </Text>
                  <Text style={styles.planNote}>{STATIC[id].note}</Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable style={[styles.cta, !!loading && styles.ctaDisabled]} onPress={subscribe} disabled={!!loading}>
            {loading === 'checkout' ? (
              <ActivityIndicator color={colors.bg} />
            ) : (
              <Text style={styles.ctaText}>Start coaching</Text>
            )}
          </Pressable>

          <Pressable onPress={onRestore} disabled={!!loading}>
            <Text style={styles.restore}>{loading === 'restore' ? 'Restoring…' : 'Restore purchases'}</Text>
          </Pressable>

          <Text style={styles.legal}>Cancel anytime in the App Store. Payment is charged to your Apple ID.</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrimUpgrade },
  sheet: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  close: { position: 'absolute', top: 12, right: 12, zIndex: 2, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
  },
  avatarText: { fontFamily: fonts.serif, fontSize: 18, color: colors.accentGold },
  title: { fontFamily: fonts.serif, fontSize: 22, color: colors.accentGold },
  tag: { fontSize: 14, lineHeight: 21, color: colors.textSecondary, textAlign: 'center', maxWidth: 360, fontFamily: fonts.ui },
  list: { width: '100%', maxWidth: 360, gap: 9, marginVertical: 6 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  check: { color: colors.accentMint, fontFamily: fonts.uiSemibold },
  itemText: { fontSize: 14, lineHeight: 20, color: colors.textPrimary, flexShrink: 1, fontFamily: fonts.ui },
  plans: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 360, marginTop: 6 },
  plan: {
    flex: 1,
    gap: 3,
    padding: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface2,
  },
  planSelected: { borderColor: colors.accentGold, backgroundColor: colors.goldTint9 },
  badge: {
    position: 'absolute',
    top: -9,
    right: 10,
    backgroundColor: colors.accentGold,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10, fontFamily: fonts.uiSemibold, color: colors.bg },
  planLabel: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.ui },
  planPrice: { fontFamily: fonts.mono, fontSize: 20, color: colors.textPrimary },
  planPer: { fontSize: 12, color: colors.textMuted },
  planNote: { fontSize: 11, lineHeight: 15, color: colors.textMuted, fontFamily: fonts.ui },
  error: { fontSize: 13, color: colors.error, textAlign: 'center', fontFamily: fonts.ui },
  cta: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.accentGold,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    alignItems: 'center',
  },
  ctaDisabled: { opacity: 0.6 },
  ctaText: { color: colors.bg, fontFamily: fonts.uiSemibold, fontSize: 15 },
  restore: { fontSize: 13, color: colors.textMuted, paddingVertical: 4, fontFamily: fonts.ui },
  legal: { fontSize: 12, color: colors.textMuted, textAlign: 'center', fontFamily: fonts.ui },
});
