// Kristy's conversational onboarding — one question at a time. Faithful port of
// the web Onboarding.jsx: quick (just-track) and full TDEE paths, chip options,
// two-stage weight+unit entry, and the completion macro card.
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../src/theme';
import { STEPS, COMPLETION_MESSAGES, finalizePayload } from '../src/lib/onboardingSteps';
import { saveOnboarding } from '../src/lib/data';
import { useApp } from '../src/context/AppProvider';
import { selectTick } from '../src/lib/haptics';
import MacroCard from '../src/components/MacroCard';
import type { Goals } from '../src/lib/types';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { userId, handleOnboarded } = useApp();

  const [data, setData] = useState<Record<string, any>>({});
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unitStage, setUnitStage] = useState(false);
  const [result, setResult] = useState<{ goals: Goals } | null>(null);

  const steps = useMemo(
    () => STEPS.filter((s) => !s.condition || s.condition(data)),
    [data]
  );
  const step = steps[Math.min(idx, steps.length - 1)];
  const inUnitStage = step?.type === 'measure' && !!step.unitPrompt && unitStage;

  const ready = (() => {
    if (!step) return false;
    if (step.type === 'text') return (data[step.id] || '').trim().length > 0;
    if (step.type === 'number') {
      const v = Number(data[step.id]);
      return (
        data[step.id] !== undefined &&
        data[step.id] !== '' &&
        v >= (step.min ?? 1) &&
        v <= (step.max ?? 999)
      );
    }
    if (step.type === 'measure') return Number(data[step.valueKey!]) > 0;
    if (step.type === 'multi') return true;
    return true;
  })();

  const set = (id: string, value: any) => {
    setError('');
    setData((d) => ({ ...d, [id]: value }));
  };

  async function finish(finalData: Record<string, any>) {
    setSaving(true);
    setError('');
    try {
      const payload = finalizePayload(finalData);
      const res = await saveOnboarding(userId!, payload);
      setResult(res);
    } catch {
      setError("Couldn't save that — give it another try.");
      setSaving(false);
    }
  }

  function advance(nextData?: Record<string, any>) {
    setUnitStage(false);
    const d = nextData || data;
    const live = STEPS.filter((s) => !s.condition || s.condition(d));
    if (idx >= live.length - 1) finish(d);
    else setIdx((i) => i + 1);
  }

  function tryAdvance(nextData?: Record<string, any>) {
    if (!ready) {
      setError(step.error || 'Add this so I can keep your targets accurate.');
      return;
    }
    setError('');
    if (step.type === 'measure' && step.unitPrompt && !unitStage) {
      setUnitStage(true);
      return;
    }
    advance(nextData);
  }

  function selectChip(value: string) {
    selectTick();
    const d = { ...data, [step.id]: value };
    setData(d);
    setError('');
    advance(d);
  }

  function selectUnit(value: string) {
    selectTick();
    const d = { ...data, [step.unitKey!]: value };
    setData(d);
    setError('');
    advance(d);
  }

  function toggleMulti(value: string) {
    setError('');
    const cur = Array.isArray(data[step.id]) ? data[step.id] : [];
    let next: string[];
    if (value === 'none') next = ['none'];
    else
      next = cur.includes(value)
        ? cur.filter((v: string) => v !== value)
        : [...cur.filter((v: string) => v !== 'none'), value];
    set(step.id, next);
  }

  function goBack() {
    setError('');
    if (inUnitStage) {
      setUnitStage(false);
      return;
    }
    setUnitStage(false);
    setIdx((i) => Math.max(0, i - 1));
  }

  /* ───────── Completion screen ───────── */
  if (result) {
    const quick = data.goal === 'just_track';
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.card}>
          <View style={styles.top}>
            <Text style={styles.logo}>Kristy</Text>
          </View>
          <View style={styles.body}>
            {quick ? (
              <Text style={styles.prompt}>{COMPLETION_MESSAGES.quick}</Text>
            ) : (
              <>
                <MacroCard macros={result.goals} />
                <Text style={styles.prompt}>{COMPLETION_MESSAGES.full}</Text>
              </>
            )}
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.btn} onPress={() => handleOnboarded(result)}>
              <Text style={styles.btnText}>Let's go</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const progress = ((idx + 1) / steps.length) * 100;
  const displayPrompt = inUnitStage ? step.unitPrompt!(data[step.valueKey!]) : step.prompt;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.top}>
            <Text style={styles.logo}>Kristy</Text>
            <Text style={styles.count}>
              {idx + 1} / {steps.length}
            </Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.body}>
            <Text style={styles.prompt}>{displayPrompt}</Text>
            {!inUnitStage && step.note ? <Text style={styles.note}>{step.note}</Text> : null}

            {step.type === 'chips' && (
              <View style={styles.chips}>
                {step.options!.map((o) => (
                  <Pressable
                    key={o.value}
                    style={[styles.chip, data[step.id] === o.value && styles.chipSelected]}
                    onPress={() => selectChip(o.value)}
                    disabled={saving}
                  >
                    <Text style={[styles.chipText, data[step.id] === o.value && styles.chipTextSelected]}>
                      {o.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {step.type === 'multi' && (
              <View style={styles.chips}>
                {step.options!.map((o) => {
                  const sel = (data[step.id] || []).includes(o.value);
                  return (
                    <Pressable
                      key={o.value}
                      style={[styles.chip, sel && styles.chipSelected]}
                      onPress={() => toggleMulti(o.value)}
                      disabled={saving}
                    >
                      <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {step.type === 'text' && (
              <TextInput
                style={styles.input}
                autoFocus
                placeholder={step.placeholder || ''}
                placeholderTextColor={colors.textMuted}
                value={data[step.id] || ''}
                onChangeText={(t) => set(step.id, t)}
                onSubmitEditing={() => tryAdvance()}
                returnKeyType="next"
              />
            )}

            {step.type === 'number' && (
              <View style={styles.measure}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  autoFocus
                  keyboardType="number-pad"
                  value={data[step.id] != null ? String(data[step.id]) : ''}
                  onChangeText={(t) => set(step.id, t)}
                  onSubmitEditing={() => tryAdvance()}
                  returnKeyType="next"
                />
                {step.suffix ? <Text style={styles.suffix}>{step.suffix}</Text> : null}
              </View>
            )}

            {step.type === 'measure' &&
              (inUnitStage ? (
                <View style={styles.chips}>
                  {step.units!.map((u) => {
                    const sel = (data[step.unitKey!] || step.defaultUnit) === u.value;
                    return (
                      <Pressable
                        key={u.value}
                        style={[styles.chip, sel && styles.chipSelected]}
                        onPress={() => selectUnit(u.value)}
                        disabled={saving}
                      >
                        <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{u.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.measure}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    autoFocus
                    keyboardType="decimal-pad"
                    value={data[step.valueKey!] != null ? String(data[step.valueKey!]) : ''}
                    onChangeText={(t) => set(step.valueKey!, t)}
                    onSubmitEditing={() => tryAdvance()}
                    returnKeyType="next"
                  />
                  {!step.unitPrompt && (
                    <View style={styles.units}>
                      {step.units!.map((u) => {
                        const active = (data[step.unitKey!] || step.defaultUnit) === u.value;
                        return (
                          <Pressable
                            key={u.value}
                            style={[styles.unit, active && styles.unitActive]}
                            onPress={() => set(step.unitKey!, u.value)}
                          >
                            <Text style={[styles.unitText, active && styles.unitTextActive]}>{u.label}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            {idx > 0 || inUnitStage ? (
              <Pressable style={styles.back} onPress={goBack} disabled={saving}>
                <Text style={styles.backText}>Back</Text>
              </Pressable>
            ) : (
              <View />
            )}
            {step.type !== 'chips' && !inUnitStage ? (
              <Pressable style={styles.btn} onPress={() => tryAdvance()} disabled={saving}>
                <Text style={styles.btnText}>
                  {saving ? 'Saving…' : idx >= steps.length - 1 ? 'Finish' : 'Continue'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  screen: { flexGrow: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 460, alignSelf: 'center', gap: 22 },
  top: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  logo: { fontFamily: fonts.serif, fontSize: 20, color: colors.accentGold },
  count: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },
  bar: { height: 4, borderRadius: 999, backgroundColor: colors.surface2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accentGold, borderRadius: 999 },
  body: { gap: 16, minHeight: 180 },
  prompt: { fontFamily: fonts.uiMedium, fontSize: 22, color: colors.textPrimary, lineHeight: 29, letterSpacing: -0.2 },
  note: { fontSize: 13, color: colors.textMuted, marginTop: -8, fontFamily: fonts.ui },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  chipSelected: { backgroundColor: colors.accentGold, borderColor: colors.accentGold },
  chipText: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.ui },
  chipTextSelected: { color: colors.bg, fontFamily: fonts.uiSemibold },
  input: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },
  measure: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  suffix: { fontFamily: fonts.mono, fontSize: 14, color: colors.textMuted },
  units: { flexDirection: 'row', gap: 6 },
  unit: {
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  unitActive: { backgroundColor: colors.surface2, borderColor: colors.accentGold },
  unitText: { fontFamily: fonts.mono, fontSize: 13, color: colors.textMuted },
  unitTextActive: { color: colors.accentGold },
  error: { fontSize: 13, color: colors.error, fontFamily: fonts.ui },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  back: { paddingVertical: 12, paddingHorizontal: 4 },
  backText: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.ui },
  btn: {
    marginLeft: 'auto',
    backgroundColor: colors.accentGold,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 26,
  },
  btnText: { color: colors.bg, fontFamily: fonts.uiSemibold, fontSize: 15 },
});
