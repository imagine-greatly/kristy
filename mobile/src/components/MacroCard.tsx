// The in-thread macro card. Ported from the web MacroCard.jsx.
import { StyleSheet, View, Text } from 'react-native';
import { colors, fonts } from '../theme';
import { fmt } from '../lib/format';
import type { MacroCardData } from '../lib/types';

const COLUMNS: { key: keyof MacroCardData; label: string; unit: string }[] = [
  { key: 'calories', label: 'Cal', unit: '' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];

interface Props {
  macros: MacroCardData | null;
  insight?: string;
  isEstimate?: boolean;
  estimateNote?: string;
}

export default function MacroCard({ macros, insight, isEstimate, estimateNote }: Props) {
  if (!macros) return null;
  const note = estimateNote || insight;
  return (
    <View style={styles.card}>
      {isEstimate ? <Text style={styles.estimate}>~ estimate</Text> : null}
      <View style={styles.grid}>
        {COLUMNS.map((col) => (
          <View style={styles.col} key={String(col.key)}>
            <Text style={styles.label}>{col.label}</Text>
            <Text style={styles.value}>
              {fmt(macros[col.key] as number)}
              {col.unit ? <Text style={styles.unit}>{col.unit}</Text> : null}
            </Text>
          </View>
        ))}
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold50,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  estimate: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.textMuted,
    marginBottom: 6,
  },
  grid: { flexDirection: 'row', gap: 8 },
  col: { flex: 1, gap: 3, alignItems: 'flex-start' },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  value: { fontFamily: fonts.monoMedium, fontSize: 17, color: colors.accentGold },
  unit: { fontFamily: fonts.ui, fontSize: 10, color: colors.textMuted },
  note: {
    marginTop: 9,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border60,
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    lineHeight: 17,
    fontFamily: fonts.ui,
  },
});
