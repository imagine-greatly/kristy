// The core screen. Message list (inverted FlatList), typing indicator, macro
// cards in-thread, the composer, the slide-in Today panel, and the read-only
// past-day banner. Faithful port of the web App.jsx chat surface.
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, fonts } from '../src/theme';
import { useApp } from '../src/context/AppProvider';
import { dateLabel } from '../src/lib/format';
import TopBar from '../src/components/TopBar';
import MessageBubble from '../src/components/MessageBubble';
import TypingIndicator from '../src/components/TypingIndicator';
import InputBar from '../src/components/InputBar';
import EmptyState from '../src/components/EmptyState';
import Sidebar from '../src/components/Sidebar';
import type { UiMessage } from '../src/lib/types';

type Row = UiMessage | { __typing: true };

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const app = useApp();
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const viewingPast = app.viewingDate !== app.today;
  const showEmpty = app.messages.length === 0 && !app.typing && !viewingPast;

  // Inverted list → index 0 sits at the bottom. Newest-first, typing pinned last.
  const rows: Row[] = app.typing
    ? [{ __typing: true }, ...[...app.messages].reverse()]
    : [...app.messages].reverse();

  const onSend = () => {
    const text = input;
    setInput('');
    app.handleSend(text);
  };

  const onSendPhoto = (text: string) => {
    setInput('');
    app.handleSendPhoto(text);
  };

  async function pickPhoto() {
    Alert.alert('Add a meal photo', undefined, [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: chooseFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Enable camera access in Settings to snap a meal.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false });
    if (!res.canceled && res.assets?.[0]) app.setPhoto(res.assets[0].uri);
  }

  async function chooseFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Enable photo access in Settings to attach a meal.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled && res.assets?.[0]) app.setPhoto(res.assets[0].uri);
  }

  return (
    <View style={styles.flex}>
      <View style={{ paddingTop: insets.top }}>
        <TopBar onMenu={() => setSidebarOpen(true)} todayCalories={app.todayTotals.calories} />
      </View>

      {viewingPast ? (
        <View style={styles.readonlyBar}>
          <Text style={styles.readonlyText}>🔒 Viewing {dateLabel(app.viewingDate)} — read-only</Text>
          <Pressable style={styles.readonlyBtn} onPress={app.backToToday}>
            <Text style={styles.readonlyBtnText}>Back to today</Text>
          </Pressable>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        {showEmpty ? (
          <EmptyState onPick={(ex) => app.handleSend(ex)} />
        ) : (
          <FlatList
            data={rows}
            inverted
            keyExtractor={(item, i) => ('__typing' in item ? `typing-${i}` : item.id)}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            renderItem={({ item }) =>
              '__typing' in item ? (
                <TypingIndicator />
              ) : (
                <MessageBubble message={item} onUpgrade={app.openUpgrade} />
              )
            }
          />
        )}

        {!viewingPast ? (
          <View style={{ paddingBottom: insets.bottom + 10 }}>
            <InputBar
              value={input}
              onChange={setInput}
              onSend={onSend}
              disabled={app.typing}
              onBarcode={() => router.push('/scanner')}
              onPhoto={pickPhoto}
              photoPreview={app.photoUri}
              onClearPhoto={() => app.setPhoto(null)}
              onSendPhoto={onSendPhoto}
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenSettings={() => {
          setSidebarOpen(false);
          router.push('/settings');
        }}
        today={app.todayTotals}
        todayKey={app.today}
        goals={app.goals}
        weight={app.weight}
        weightHistory={app.weightHistory}
        onSaveGoal={app.handleSaveGoal}
        historyDays={app.historyDays}
        activeDay={app.viewingDate}
        onSelectDay={(date) => {
          setSidebarOpen(false);
          app.handleSelectDay(date);
        }}
        premium={app.subscription?.premium ?? true}
        onUpgrade={() => {
          setSidebarOpen(false);
          app.openUpgrade();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  readonlyBar: {
    marginHorizontal: 16,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.gold40,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  readonlyText: { fontSize: 13, color: colors.textPrimary, flexShrink: 1, fontFamily: fonts.ui },
  readonlyBtn: { backgroundColor: colors.accentGold, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  readonlyBtnText: { fontSize: 12, color: colors.bg, fontFamily: fonts.uiSemibold },
});
