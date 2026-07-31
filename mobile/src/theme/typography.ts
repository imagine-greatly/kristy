import { Platform } from 'react-native';

// Font families. Inter (UI) + DM Mono (numbers/data) are bundled via
// @expo-google-fonts and loaded in the root layout.
//
// THREE voices, assigned strictly (parity with the web --font-display /
// --font-voice / --font-ui):
//   • display — Playfair Display ITALIC. Wordmark, page titles, pull-quotes.
//     Minimum 26px, max 2 per screen, NEVER inside a card: it is a display face
//     and its hairlines disappear at card sizes on a dark ground.
//   • voice   — Newsreader ROMAN 500. Kristy's voice, and every verdict headline
//     on every counter card and scan result. The most important text in the app,
//     so it is set in the most legible of the three.
//   • ui      — Inter. Everything else: eyebrows, decks, checklists, buttons.
//
// Neither serif is registered in useFonts() yet. During the RN port add
// @expo-google-fonts/playfair-display and @expo-google-fonts/newsreader, load
// them in _layout, and swap the two entries below to
// 'PlayfairDisplay_500Medium_Italic' and 'Newsreader_500Medium'. Until then both
// fall back to the system serif so nothing renders a generic sans.
export const fonts = {
  ui: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  voice: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
} as const;

// The verdict headline, complete — 21/1.3, so every card states it identically.
export const verdictHeadline = {
  fontFamily: fonts.voice,
  fontSize: 21,
  lineHeight: 27,
  letterSpacing: -0.1,
} as const;

// The @expo-google-fonts font map, imported + passed to useFonts() in _layout.
// (Kept here so the loader and the family names never drift.)
export type FontKey = keyof typeof fonts;
