// The slide-in Today panel — the mobile equivalent of the web's left sidebar.
// Today ring, macro rings, weight trend, editable goals, and day history. Ported
// from the web Sidebar.jsx; the CSS transform slide-in becomes an Animated
// overlay + backdrop (no navigation library — same custom approach as web).
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { fmt, n, dateLabel, clampPct } from '../lib/format';
import MacroRing from './MacroRing';
import WeightTrendChart from './WeightTrendChart';
import { CloseIcon, GearIcon } from './Icons';
import type { Goals, Totals, WeightSummary, WeightEntry } from '../lib/types';

const GOAL_FIELDS: { key: keyof Goals; label: string }[] = [
  { key: 'calories', label: 'Calories' },
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
];

const MACROS: { key: keyof Totals; name: string; color: string }[] = [
  { key: 'protein', name: 'Protein', color: colors.accentGold },
  { key: 'carbs', name: 'Carbs', color: colors.accentMint },
  { key: 'fat', name: 'Fat', color: colors.accentSeafoam },
];

// Arrow + label + color for the 7-day weight change, given the user's goal.
function weightTrendStyle(weekChange: number, goalType: string | null) {
  if (weekChange <= -0.1) {
    return { arrow: '↓', label: `${Math.abs(weekChange)} lbs this week`, color: colors.trendMint };
  }
  if (weekChange >= 0.1) {
    const onTrack = goalType === 'build_muscle';
    return {
      arrow: '↑',
      label: `${Math.abs(weekChange)} lbs this week`,
      color: onTrack ? colors.trendMint : colors.trendMuted,
    };
  }
  return { arrow: '→', label: 'maintaining', color: colors.trendMuted };
}

function GoalRow({
  field,
  value,
  onSave,
}: {
  field: { key: keyof Goals; label: string };
  value: number;
  onSave: (key: keyof Goals, value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    setEditing(false);
    const next = n(draft);
    if (next > 0 && next !== value) onSave(field.key, next);
    else setDraft(String(value));
  };

  return (
    <View style={styles.goalRow}>
      <Text style={styles.goalLabel}>{field.label}</Text>
      {editing ? (
        <TextInput
          style={styles.goalInput}
          autoFocus
          keyboardType="number-pad"
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          returnKeyType="done"
        />
      ) : (
        <Pressable
          onPress={() => {
            setDraft(String(value));
            setEditing(true);
          }}
        >
          <Text style={styles.goalValue}>
            {fmt(value)}
            {field.key !== 'calories' ? 'g' : ''}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  today: Totals;
  todayKey: string;
  goals: Goals;
  weight: WeightSummary | null;
  weightHistory: WeightEntry[];
  onSaveGoal: (key: keyof Goals, value: number) => void;
  historyDays: { date: string; calories: number; protein: number }[];
  activeDay: string;
  onSelectDay: (date: string) => void;
  premium?: boolean;
  onUpgrade: () => void;
}

export default function Sidebar({
  open,
  onClose,
  onOpenSettings,
  today,
  todayKey,
  goals,
  weight,
  weightHistory,
  onSaveGoal,
  historyDays,
  activeDay,
  onSelectDay,
  premium = true,
  onUpgrade,
}: Props) {
  const insets = useSafeAreaInsets();
  const screenW = Dimensions.get('window').width;
  const PANEL_W = Math.min(300, screenW * 0.86);

  const slide = useRef(new Animated.Value(open ? 0 : -PANEL_W)).current;
  const fade = useRef(new Animated.Value(open ? 1 : 0)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
    Animated.parallel([
      Animated.timing(slide, { toValue: open ? 0 : -PANEL_W, duration: 280, useNativeDriver: true }),
      Animated.timing(fade, { toValue: open ? 1 : 0, duration: 280, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, PANEL_W, slide, fade]);

  if (!mounted) return null;

  const remaining = n(goals.calories) - n(today.calories);
  const wTrend = weight ? weightTrendStyle(weight.weekChange, weight.goalType) : null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          { width: PANEL_W, paddingTop: insets.top, transform: [{ translateX: slide }] },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Kristy</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconBtn} onPress={onOpenSettings} accessibilityLabel="Settings" hitSlop={6}>
              <GearIcon />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={onClose} accessibilityLabel="Close menu" hitSlop={6}>
              <CloseIcon />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {/* Today */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TODAY</Text>
            <View style={styles.todayRing}>
              <MacroRing size={88} stroke={8} value={today.calories} goal={goals.calories} color={colors.accentGold}>
                <View style={styles.ringCenter}>
                  <Text style={styles.ringValue}>{fmt(today.calories)}</Text>
                  <Text style={styles.ringLabel}>kcal</Text>
                </View>
              </MacroRing>
              <View style={styles.todayMeta}>
                <Text style={styles.todayRemaining}>{fmt(Math.max(0, remaining))} kcal</Text>
                <Text style={styles.todaySub}>
                  {remaining >= 0 ? 'remaining' : `${fmt(-remaining)} over goal`}
                </Text>
              </View>
            </View>
          </View>

          {/* Macros */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MACROS</Text>
            <View style={styles.macroRings}>
              {MACROS.map((m) => (
                <View style={styles.macroRing} key={String(m.key)}>
                  <Text style={styles.macroName}>{m.name}</Text>
                  <MacroRing size={56} stroke={6} value={today[m.key]} goal={goals[m.key]} color={m.color}>
                    <Text style={styles.macroCenter}>{fmt(today[m.key])}g</Text>
                  </MacroRing>
                  <Text style={styles.macroPct}>{clampPct(today[m.key], goals[m.key])}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weight */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WEIGHT</Text>
            {!premium ? (
              <Pressable style={styles.weightLocked} onPress={onUpgrade}>
                <View style={styles.weightLockedRow}>
                  <Text style={styles.weightLock}>🔒</Text>
                  <Text style={styles.weightLockedTitle}>Weight trends & adaptive targets</Text>
                </View>
                <Text style={styles.weightLockedCta}>Part of coaching — unlock →</Text>
              </Pressable>
            ) : weight ? (
              <View style={{ gap: 4 }}>
                <Text style={styles.weightValue}>
                  {fmt(weight.current)} {weight.unit}
                </Text>
                <Text style={{ color: wTrend!.color, fontSize: 12, fontFamily: fonts.ui }}>
                  {wTrend!.arrow} {wTrend!.label}
                </Text>
                <WeightTrendChart history={weightHistory} unit={weight.unit} active={open} />
              </View>
            ) : (
              <View style={{ gap: 2 }}>
                <Text style={styles.weightEmpty}>Log your weight to track progress</Text>
                <Text style={styles.weightEmptyItalic}>Just tell Kristy your weight</Text>
              </View>
            )}
          </View>

          {/* Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GOALS</Text>
            {GOAL_FIELDS.map((f) => (
              <GoalRow key={String(f.key)} field={f} value={goals[f.key]} onSave={onSaveGoal} />
            ))}
          </View>

          {/* History */}
          <View style={[styles.section, { borderBottomWidth: 0 }]}>
            <Text style={styles.sectionTitle}>HISTORY</Text>
            <View style={{ gap: 6 }}>
              <Pressable
                style={[styles.historyItem, activeDay === todayKey && styles.historyItemActive]}
                onPress={() => onSelectDay(todayKey)}
              >
                <Text style={styles.historyDate}>
                  Today <Text style={styles.historyLive}>· live</Text>
                </Text>
                <Text style={styles.historyStats}>
                  {fmt(today.calories)} kcal · {fmt(today.protein)}g P
                </Text>
              </Pressable>

              {historyDays.length === 0 ? (
                <Text style={styles.historyEmpty}>No past days yet — start logging.</Text>
              ) : (
                historyDays.map((d) => (
                  <Pressable
                    key={d.date}
                    style={[styles.historyItem, activeDay === d.date && styles.historyItemActive]}
                    onPress={() => onSelectDay(d.date)}
                  >
                    <Text style={styles.historyDate}>{dateLabel(d.date)}</Text>
                    <Text style={styles.historyStats}>
                      {fmt(d.calories)} kcal · {fmt(d.protein)}g P
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.bg,
    borderRightWidth: 1,
    borderRightColor: colors.gold30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold30,
  },
  logo: { fontFamily: fonts.serif, fontSize: 18, color: colors.accentGold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,111,46,0.16)',
  },
  sectionTitle: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.9,
    color: colors.textMuted,
    marginBottom: 16,
  },
  todayRing: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringValue: { fontFamily: fonts.monoMedium, fontSize: 16, color: colors.accentGold, lineHeight: 18 },
  ringLabel: { fontFamily: fonts.mono, fontSize: 8, color: colors.textMuted, letterSpacing: 0.4 },
  todayMeta: { flexDirection: 'column', gap: 2 },
  todayRemaining: { fontFamily: fonts.mono, fontSize: 15, color: colors.accentGold },
  todaySub: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.ui },
  macroRings: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  macroRing: { flex: 1, alignItems: 'center', gap: 7 },
  macroName: { fontSize: 11, color: colors.textPrimary, fontFamily: fonts.uiMedium },
  macroCenter: { fontFamily: fonts.mono, fontSize: 12, color: colors.accentGold, textAlign: 'center' },
  macroPct: { fontFamily: fonts.mono, fontSize: 9, color: colors.textMuted },
  weightLocked: {
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  weightLockedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightLock: { fontSize: 13 },
  weightLockedTitle: { fontSize: 13, color: colors.textPrimary, flexShrink: 1, fontFamily: fonts.ui },
  weightLockedCta: { fontSize: 11, color: colors.accentGold, letterSpacing: 0.2, fontFamily: fonts.ui },
  weightValue: { fontFamily: fonts.mono, color: colors.accentGold, fontSize: 20 },
  weightEmpty: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.ui },
  weightEmptyItalic: { color: colors.textMuted, fontSize: 11, fontStyle: 'italic', fontFamily: fonts.ui },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139,111,46,0.12)',
  },
  goalLabel: { fontSize: 14, color: colors.textPrimary, fontFamily: fonts.ui },
  goalValue: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.accentGold,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  goalInput: {
    width: 90,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.accentGold,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentGold,
    paddingVertical: 4,
    paddingHorizontal: 2,
    textAlign: 'right',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  historyItemActive: { backgroundColor: colors.surface2, borderLeftColor: colors.accentGold },
  historyDate: { fontSize: 13, color: colors.textPrimary, fontFamily: fonts.ui },
  historyLive: { color: colors.accentGold, fontSize: 11 },
  historyStats: { fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted },
  historyEmpty: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', fontFamily: fonts.ui },
});
