// The message composer: barcode + photo shortcuts, an auto-growing text field,
// and the send button. Ported from the web InputBar.jsx (the hidden file input
// becomes an onPhoto callback that opens expo-image-picker).
import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Image } from 'react-native';
import { colors, fonts } from '../theme';
import { ArrowUpIcon, BarcodeIcon, CameraIcon } from './Icons';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
  onBarcode: () => void;
  onPhoto: () => void;
  photoPreview?: string | null;
  onClearPhoto: () => void;
  onSendPhoto: (text: string) => void;
}

export default function InputBar({
  value,
  onChange,
  onSend,
  disabled,
  onBarcode,
  onPhoto,
  photoPreview,
  onClearPhoto,
  onSendPhoto,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [height, setHeight] = useState(22);

  const hasText = value.trim().length > 0;
  const canSend = (hasText || !!photoPreview) && !disabled;

  const doSend = () => {
    if (!canSend) return;
    if (photoPreview) onSendPhoto(value);
    else onSend();
  };

  return (
    <View style={styles.wrap}>
      {photoPreview ? (
        <View style={styles.preview}>
          <Image source={{ uri: photoPreview }} style={styles.previewImg} />
          <Pressable style={styles.previewRemove} onPress={onClearPhoto} accessibilityLabel="Remove photo">
            <Text style={styles.previewRemoveText}>×</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.inner, focused && styles.innerFocused]}>
        <Pressable style={styles.iconBtn} onPress={onBarcode} accessibilityLabel="Scan barcode" hitSlop={6}>
          <BarcodeIcon />
        </Pressable>
        <Pressable style={styles.iconBtn} onPress={onPhoto} accessibilityLabel="Add a photo" hitSlop={6}>
          <CameraIcon />
        </Pressable>

        <TextInput
          style={[styles.input, { height: Math.min(Math.max(22, height), 120) }]}
          value={value}
          onChangeText={onChange}
          placeholder="What did you eat?"
          placeholderTextColor={colors.textMuted}
          multiline
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
        />

        <Pressable
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={doSend}
          disabled={!canSend}
          accessibilityLabel="Send"
        >
          <ArrowUpIcon color={canSend ? colors.bg : colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 4 },
  preview: { width: 60, height: 60, alignSelf: 'center', marginBottom: 8 },
  previewImg: { width: 60, height: 60, borderRadius: 10, borderWidth: 1, borderColor: colors.borderGold },
  previewRemove: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewRemoveText: { color: colors.textPrimary, fontSize: 14, lineHeight: 16 },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 16,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 12,
  },
  innerFocused: { borderColor: colors.accentGold },
  iconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 6,
    paddingBottom: 6,
    maxHeight: 120,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sendBtnActive: { backgroundColor: colors.accentGold },
});
