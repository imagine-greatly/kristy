// The sign-in wall. Ported from the web Auth.jsx layout — gold "K", wordmark,
// tagline, then the shared phone + SMS OTP form.
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../src/theme';
import SignInForm from '../src/components/SignInForm';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.wrap, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.leaf}>K</Text>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={styles.title}>Kristy</Text>
          <Text style={styles.tag}>
            A nutrition coach in your pocket that actually knows you — delivered as a
            conversation, not a dashboard.
          </Text>
        </View>
        <SignInForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  wrap: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 24,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  leaf: { fontFamily: fonts.serif, fontSize: 40, color: colors.accentGold },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.accentGold },
  tag: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
    fontFamily: fonts.ui,
  },
});
