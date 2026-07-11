// A single chat row. Ported from the web MessageBubble.jsx.
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { colors, fonts } from '../theme';
import MacroCard from './MacroCard';
import type { UiMessage } from '../lib/types';

interface Props {
  message: UiMessage;
  onUpgrade?: () => void;
}

export default function MessageBubble({ message, onUpgrade }: Props) {
  const { role, content, macros, isSummary } = message;

  if (role === 'user') {
    return (
      <View style={styles.rowUser}>
        <View style={styles.bubbleUser}>
          <Text style={styles.bubbleText}>{content}</Text>
        </View>
      </View>
    );
  }

  const hasMacros = macros && typeof macros.calories === 'number';
  return (
    <View style={styles.rowAi}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>K</Text>
      </View>
      <View style={styles.aiCol}>
        {isSummary ? <Text style={styles.summaryTag}>WEEKLY RECAP</Text> : null}
        {message.image ? (
          <Image source={{ uri: message.image }} style={styles.aiPhoto} resizeMode="cover" />
        ) : null}
        <View style={styles.bubbleAi}>
          <Text style={styles.bubbleText}>{content}</Text>
        </View>
        {hasMacros ? (
          <MacroCard
            macros={macros}
            insight={macros?.insight}
            isEstimate={macros?.isEstimate}
            estimateNote={macros?.estimateNote}
          />
        ) : null}
        {message.upgrade && onUpgrade ? (
          <Pressable style={styles.upgradeBtn} onPress={onUpgrade}>
            <Text style={styles.upgradeText}>Unlock coaching →</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const BUBBLE_MAX = 600;

const styles = StyleSheet.create({
  rowUser: { flexDirection: 'row', justifyContent: 'flex-end' },
  rowAi: { flexDirection: 'row', justifyContent: 'flex-start', gap: 8 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
    marginTop: 2,
  },
  avatarText: { fontFamily: fonts.mono, fontSize: 12, color: colors.accentGold },
  aiCol: { flexDirection: 'column', gap: 8, maxWidth: BUBBLE_MAX, flexShrink: 1 },
  bubbleUser: {
    maxWidth: BUBBLE_MAX,
    backgroundColor: colors.userBubble,
    borderWidth: 1,
    borderColor: colors.gold30,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexShrink: 1,
  },
  bubbleAi: {
    backgroundColor: colors.aiBubble,
    borderWidth: 1,
    borderColor: colors.border60,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  bubbleText: {
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  summaryTag: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.9,
    color: colors.accentGold,
    marginBottom: 2,
  },
  aiPhoto: {
    height: 48,
    width: 140,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold40,
  },
  upgradeBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 13,
  },
  upgradeText: { fontSize: 13, color: colors.accentGold, fontFamily: fonts.ui },
});
