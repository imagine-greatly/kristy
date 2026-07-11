// Settings sheet — goal / weight-unit / training edits, membership status +
// manage, and guarded account deletion. Ported from the web Settings.jsx.
// "Manage" opens the iOS system subscription screen (Apple manages Apple IAP);
// there is no Stripe portal on mobile.
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fonts } from '../src/theme';
import { useApp } from '../src/context/AppProvider';
import { STEPS } from '../src/lib/onboardingSteps';
import { CloseIcon } from '../src/components/Icons';
import type { Subscription, Profile } from '../src/lib/types';

const opt = (id: string) => STEPS.find((s) => s.id === id)?.options || [];
const GOAL_OPTIONS = opt('goal');
const SPORT_OPTIONS = opt('sport');
const FREQ_OPTIONS = opt('training_frequency');
const UNIT_OPTIONS = STEPS.find((s) => s.id === 'weight')?.units || [
  { label: 'lbs', value: 'lbs' },
  { label: 'kg', value: 'kg' },
];

const APPLE_SUBS_URL = 'https://apps.apple.com/account/subscriptions';

function membershipLine(sub: Subscription | null): string {
  if (!sub) return 'Free plan';
  if (sub.status === 'trialing' && sub.premium) {
    const d = sub.trialDaysLeft;
    return `${d} day${d === 1 ? '' : 's'} left in your trial`;
  }
  if (sub.status === 'active') return 'Premium — active';
  if (sub.status === 'past_due') return 'Payment issue — update your card';
  if (sub.trialExpired) return 'Trial ended';
  if (sub.status === 'canceled') return 'Canceled — renew anytime';
  return 'Free plan';
}

function ChipGroup({
  options,
  value,
  onPick,
  disabled,
}: {
  options: { label: string; value: string }[];
  value: string | null;
  onPick: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.chips}>
      {options.map((o) => (
        <Pressable
          key={o.value}
          style={[styles.chip, value === o.value && styles.chipSelected]}
          onPress={() => onPick(o.value)}
          disabled={disabled}
        >
          <Text style={[styles.chipText, value === o.value && styles.chipTextSelected]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, subscription, handleSaveProfile, handleDeleteAccount, openUpgrade } = useApp();

  const [vals, setVals] = useState({
    goal: profile?.goal || null,
    weight_unit: profile?.weight_unit || 'lbs',
    sport: profile?.sport || null,
    training_frequency: profile?.training_frequency || null,
  });
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  const canManage =
    subscription?.provider === 'apple' &&
    ['active', 'past_due', 'canceled'].includes(subscription?.status || '');

  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const canDelete = confirmText.trim().toLowerCase() === 'delete';

  async function change(key: keyof typeof vals, value: string) {
    if (vals[key] === value) return;
    const prev = vals;
    setVals({ ...vals, [key]: value });
    setSavingKey(key);
    setError('');
    try {
      await handleSaveProfile({ [key]: value } as Partial<Profile>);
    } catch {
      setVals(prev);
      setError('Could not save that — try again.');
    } finally {
      setSavingKey('');
    }
  }

  async function onDelete() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    setError('');
    try {
      await handleDeleteAccount(); // signs out → routing returns to /auth
    } catch (e: any) {
      setDeleting(false);
      setError(e?.message || 'Could not delete your account. Please try again.');
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Settings</Text>
        <Pressable style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Close settings" hitSlop={6}>
          <CloseIcon />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}>
        <View>
          <Text style={styles.sectionLabel}>MEMBERSHIP</Text>
          <View style={styles.membership}>
            <Text style={styles.membershipStatus}>{membershipLine(subscription)}</Text>
            {canManage ? (
              <Pressable style={styles.membershipBtn} onPress={() => Linking.openURL(APPLE_SUBS_URL)}>
                <Text style={styles.membershipBtnText}>Manage</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.membershipBtn} onPress={openUpgrade}>
                <Text style={styles.membershipBtnText}>{subscription?.premium ? 'See plans' : 'Upgrade'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>
            GOAL {savingKey === 'goal' ? <Text style={styles.saving}>saving…</Text> : null}
          </Text>
          <ChipGroup options={GOAL_OPTIONS} value={vals.goal} onPick={(v) => change('goal', v)} disabled={!!savingKey} />
        </View>

        <View>
          <Text style={styles.sectionLabel}>
            WEIGHT UNITS {savingKey === 'weight_unit' ? <Text style={styles.saving}>saving…</Text> : null}
          </Text>
          <ChipGroup options={UNIT_OPTIONS} value={vals.weight_unit} onPick={(v) => change('weight_unit', v)} disabled={!!savingKey} />
        </View>

        <View>
          <Text style={styles.sectionLabel}>
            TRAINING{' '}
            {savingKey === 'sport' || savingKey === 'training_frequency' ? (
              <Text style={styles.saving}>saving…</Text>
            ) : null}
          </Text>
          <Text style={styles.sub}>Sport</Text>
          <ChipGroup options={SPORT_OPTIONS} value={vals.sport} onPick={(v) => change('sport', v)} disabled={!!savingKey} />
          <Text style={styles.sub}>How often</Text>
          <ChipGroup
            options={FREQ_OPTIONS}
            value={vals.training_frequency}
            onPick={(v) => change('training_frequency', v)}
            disabled={!!savingKey}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.danger}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {!confirming ? (
            <Pressable style={styles.dangerBtn} onPress={() => setConfirming(true)}>
              <Text style={styles.dangerBtnText}>Delete my account</Text>
            </Pressable>
          ) : (
            <View style={{ gap: 12 }}>
              <Text style={styles.dangerWarn}>
                This permanently deletes your account and all your data — meals, weigh-ins, chats,
                and goals. This can't be undone. Type <Text style={styles.dangerWarnBold}>delete</Text> to confirm.
              </Text>
              <TextInput
                style={styles.dangerInput}
                autoFocus
                placeholder="delete"
                placeholderTextColor={colors.textMuted}
                value={confirmText}
                onChangeText={setConfirmText}
                editable={!deleting}
                autoCapitalize="none"
              />
              <View style={styles.dangerActions}>
                <Pressable
                  style={styles.dangerCancel}
                  onPress={() => {
                    setConfirming(false);
                    setConfirmText('');
                  }}
                  disabled={deleting}
                >
                  <Text style={styles.dangerCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.dangerGo, !canDelete && styles.dangerGoDisabled]} onPress={onDelete} disabled={!canDelete || deleting}>
                  <Text style={styles.dangerGoText}>{deleting ? 'Deleting…' : 'Delete forever'}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold30,
  },
  title: { fontFamily: fonts.serif, fontSize: 20, color: colors.accentGold },
  iconBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 26 },
  sectionLabel: { fontSize: 12, letterSpacing: 0.6, color: colors.textMuted, marginBottom: 12, fontFamily: fonts.ui },
  saving: { color: colors.accentGold, fontStyle: 'italic', letterSpacing: 0 },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 14, marginBottom: 8, fontFamily: fonts.ui },
  membership: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gold30,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  membershipStatus: { fontSize: 14, color: colors.textPrimary, flexShrink: 1, fontFamily: fonts.ui },
  membershipBtn: { backgroundColor: colors.accentGold, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
  membershipBtnText: { fontSize: 13, color: colors.bg, fontFamily: fonts.uiSemibold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { borderWidth: 1, borderColor: colors.gold40, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 15 },
  chipSelected: { backgroundColor: colors.accentGold, borderColor: colors.accentGold },
  chipText: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.ui },
  chipTextSelected: { color: colors.bg, fontFamily: fonts.uiSemibold },
  error: { fontSize: 13, color: colors.error, fontFamily: fonts.ui },
  danger: { borderTopWidth: 1, borderTopColor: colors.border60, paddingTop: 22 },
  dangerBtn: { borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignSelf: 'flex-start' },
  dangerBtnText: { color: colors.error, fontSize: 14, fontFamily: fonts.ui },
  dangerWarn: { fontSize: 13.5, lineHeight: 21, color: colors.textPrimary, fontFamily: fonts.ui },
  dangerWarnBold: { color: colors.error, fontFamily: fonts.uiSemibold },
  dangerInput: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },
  dangerActions: { flexDirection: 'row', gap: 10 },
  dangerCancel: { flex: 1, borderWidth: 1, borderColor: colors.gold40, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  dangerCancelText: { color: colors.textPrimary, fontSize: 14, fontFamily: fonts.ui },
  dangerGo: { flex: 1, backgroundColor: colors.danger, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  dangerGoDisabled: { opacity: 0.45 },
  dangerGoText: { color: colors.white, fontSize: 14, fontFamily: fonts.uiSemibold },
});
