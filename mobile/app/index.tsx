// Entry gate. Shows a config screen if env is missing; otherwise a quiet loader
// while AppProvider resolves the session and redirects to /auth, /onboarding,
// or /chat.
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { isConfigured, SUPABASE_URL, SUPABASE_ANON_KEY, apiBase } from '../src/lib/config';
import { colors, fonts } from '../src/theme';

function ConfigError() {
  const missing = [
    !apiBase && 'EXPO_PUBLIC_API_URL',
    !SUPABASE_URL && 'EXPO_PUBLIC_SUPABASE_URL',
    !SUPABASE_ANON_KEY && 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ].filter(Boolean) as string[];

  return (
    <ScrollView contentContainerStyle={styles.center}>
      <Text style={styles.title}>Kristy isn't configured</Text>
      <Text style={styles.body}>
        Set these environment variables (a local .env for dev, or EAS environment
        variables for builds), then reload:
      </Text>
      {missing.map((m) => (
        <Text key={m} style={styles.code}>
          {m}
        </Text>
      ))}
      <Text style={styles.hint}>See mobile/.env.example and the README.</Text>
    </ScrollView>
  );
}

export default function Index() {
  if (!isConfigured) return <ConfigError />;
  return (
    <View style={styles.center}>
      <Text style={styles.leaf}>🌿</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 10,
  },
  leaf: { fontSize: 40 },
  title: { fontFamily: fonts.serif, fontSize: 22, color: colors.accentGold, marginBottom: 4 },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center', fontFamily: fonts.ui },
  code: { fontFamily: fonts.mono, fontSize: 13, color: colors.textPrimary },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 10, fontFamily: fonts.ui },
});
