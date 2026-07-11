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
} as const;

// The @expo-google-fonts font map, imported + passed to useFonts() in _layout.
// (Kept here so the loader and the family names never drift.)
export type FontKey = keyof typeof fonts;
