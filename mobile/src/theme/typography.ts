import { Platform } from 'react-native';

// Font families. Inter (UI) + DM Mono (numbers/data) are bundled via
// @expo-google-fonts and loaded in the root layout. The serif wordmark uses
// Georgia — a system font on iOS, matching the web wordmark exactly.
export const fonts = {
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  // Kristy's spoken/coaching voice — Playfair Display *italic* per the locked
  // brand (parity with the web `--font-voice` / client lib/tokens.js). Playfair
  // is NOT yet registered in useFonts(); during the RN port, add
  // @expo-google-fonts/playfair-display, load it in _layout, and swap this to
  // 'PlayfairDisplay_400Regular_Italic'. Until then it falls back to the serif
  // so nothing renders a generic sans. Everything factual/UI stays `ui` (Inter).
  voice: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
} as const;

// The @expo-google-fonts font map, imported + passed to useFonts() in _layout.
// (Kept here so the loader and the family names never drift.)
export type FontKey = keyof typeof fonts;
