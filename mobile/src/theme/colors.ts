// Kristy brand palette — ported 1:1 from the web client's index.css :root.
// Deep forest green + brass. (The color-mix() gold/border tints from CSS are
// precomputed to rgba here.)
//
// Two rules the values alone cannot express, enforced at every use site:
//   • BRASS IS IDENTITY. It marks what a thing IS — the wordmark, the hairline+dot
//     motif, a tier badge, the active tab, chip text. It is never a large filled
//     surface, and never a sentence someone reads to make a decision.
//   • ONE FILLED BUTTON PER SCREEN, in `action`. Everything else is transparent
//     with a 0.5px `hairline` border, at radius 8. The pill is reserved for chips.

export const colors = {
  bgDeep: '#050D08',
  bg: '#0A1A11',
  surface: '#10251A', // cards
  surface2: '#16301F', // chips, inputs
  hairline: '#29402F',
  border: '#29402F', // alias — the shipped name for hairline
  borderGold: '#5A4C25',
  userBubble: '#16301F',
  aiBubble: '#10251A',

  brass: '#C4A65A',
  brassDim: '#5A4C25',
  accentGold: '#C4A65A', // alias for brass
  accentGoldMuted: '#5A4C25', // alias for brassDim
  accentMint: '#4A9B6F',
  accentSeafoam: '#6BBF8E',

  // The one filled action per screen.
  action: '#EFE9D8',
  actionInk: '#0A1A11',

  // Three text levels, none of them gold. `textSecondary` used to BE gold and
  // carried decks and why-lines; it is now the muted ink, and the alias stays so
  // no consumer has to be rewritten to stop shouting.
  ink: '#F4F1E8',
  inkBody: '#C7D6CB',
  inkMuted: '#9DB0A2',
  textPrimary: '#F4F1E8', // alias for ink
  textBody: '#C7D6CB', // alias for inkBody
  textSecondary: '#9DB0A2', // alias for inkMuted
  textMuted: '#9DB0A2', // alias for inkMuted
  ringTrack: '#16301F',

  // Weight-trend line colors (from Sidebar.jsx).
  trendMint: '#4A9B6F', // on-track
  trendMuted: '#6B9E85', // maintaining / off-goal

  // Precomputed color-mix tints.
  gold30: 'rgba(90,76,37,0.30)',
  gold40: 'rgba(90,76,37,0.40)',
  gold50: 'rgba(90,76,37,0.50)',
  border60: 'rgba(41,64,47,0.60)',
  goldTint9: 'rgba(196,166,90,0.09)', // selected plan card bg

  // Scrims / overlays.
  scrim: 'rgba(5,13,8,0.62)',
  scrimSoft: 'rgba(5,13,8,0.55)',
  scrimUpgrade: 'rgba(5,13,8,0.60)',

  // Status / danger.
  error: '#EE8888',
  danger: '#B04646',
  dangerBorder: '#7A3B3B',
  dangerTint: 'rgba(180,70,70,0.12)',

  black: '#000000',
  white: '#FFFFFF',
} as const;

// Corner radii. A button is 8; full-round is RESERVED for chips.
export const radii = {
  button: 8,
  card: 14,
  chip: 999,
} as const;

export type Colors = typeof colors;
