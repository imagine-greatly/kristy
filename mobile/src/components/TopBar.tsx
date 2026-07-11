// Floating top bar: menu button (opens the Today/sidebar panel) + today's kcal
// pill. Ported from the web TopBar.jsx.
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors, fonts } from '../theme';
import { fmt } from '../lib/format';
import { MenuIcon } from './Icons';

interface Props {
  onMenu: () => void;
  todayCalories: number;
}

export default function TopBar({ onMenu, todayCalories }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable style={styles.iconBtn} onPress={onMenu} accessibilityLabel="Open menu" hitSlop={8}>
        <MenuIcon />
      </Pressable>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{fmt(todayCalories)} kcal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pill: {
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 13,
  },
  pillText: { fontFamily: fonts.mono, fontSize: 13, color: colors.accentGold },
});
