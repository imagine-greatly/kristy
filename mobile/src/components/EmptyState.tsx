// Time-aware greeting + example chips. Ported from the web EmptyState.jsx.
import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { colors, fonts } from '../theme';

const EXAMPLES = [
  '100g chicken breast, 150g rice',
  '3 scrambled eggs and half an avocado',
  'Protein shake with 300ml whole milk',
  'Big mac and medium fries',
];

const GREETINGS: Record<string, string[]> = {
  morning: ['Good morning.', "Morning. What's on the menu today?", 'New day, clean slate.'],
  afternoon: ['Hey. What have you eaten so far?', "How's the day going?", 'Afternoon. What did you have?'],
  evening: ["Evening. How'd you do today?", 'Good evening. What did you eat?', "Almost done for the day — what'd you have?"],
  night: ['Eating late?', 'Still going?', 'Late night. What are we logging?'],
};

const SUBTITLES = [
  "Tell me what you ate. I'll handle the rest.",
  "Just type it out — '100g rice, 100g beef' — I'll track it.",
  'No forms. Just talk.',
  "Type it like a text. I'll do the math.",
];

function timeBucket(hour: number): string {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface Props {
  onPick: (example: string) => void;
  greeting?: string;
  subtitle?: string;
}

export default function EmptyState({ onPick, greeting: greetingProp, subtitle: subtitleProp }: Props) {
  const randGreeting = useMemo(() => pick(GREETINGS[timeBucket(new Date().getHours())]), []);
  const randSubtitle = useMemo(() => pick(SUBTITLES), []);
  const greeting = greetingProp ?? randGreeting;
  const subtitle = subtitleProp ?? randSubtitle;

  return (
    <ScrollView
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.chips}>
        {EXAMPLES.map((ex) => (
          <Pressable
            key={ex}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
            onPress={() => onPick(ex)}
          >
            <Text style={styles.chipText}>{ex}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  greeting: {
    fontFamily: fonts.uiMedium,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 34,
    textAlign: 'center',
  },
  subtitle: { marginTop: 10, fontSize: 15, color: colors.textMuted, textAlign: 'center', fontFamily: fonts.ui },
  chips: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: 440,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipPressed: { borderColor: colors.accentGold, transform: [{ scale: 0.97 }] },
  chipText: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.ui },
});
