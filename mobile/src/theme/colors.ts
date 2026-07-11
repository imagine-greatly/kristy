// Kristy brand palette — ported 1:1 from the web client's index.css :root.
// Deep forest green + antique gold. (The color-mix() gold/border tints from CSS
// are precomputed to rgba here.)

export const colors = {
  bg: '#0B1F0F',
  surface: '#122718',
  surface2: '#1A3320',
  border: '#1E3D26',
  borderGold: '#8B6F2E',
  userBubble: '#1A3320',
  aiBubble: '#122718',
  accentGold: '#C9A84C',
  accentGoldMuted: '#8B6F2E',
  accentMint: '#4A9B6F',
  accentSeafoam: '#6BBF8E',
  textPrimary: '#F0E6C8',
  textSecondary: '#C9A84C',
  textMuted: '#6B8F72',
  ringTrack: '#1A3320',

  // Weight-trend line colors (from Sidebar.jsx).
  trendMint: '#4A9B6F', // on-track
  trendMuted: '#6B9E85', // maintaining / off-goal

  // Precomputed color-mix tints.
  gold30: 'rgba(139,111,46,0.30)',
  gold40: 'rgba(139,111,46,0.40)',
  gold50: 'rgba(139,111,46,0.50)',
  border60: 'rgba(30,61,38,0.60)',
  goldTint9: 'rgba(201,168,76,0.09)', // selected plan card bg

  // Scrims / overlays.
  scrim: 'rgba(7,18,11,0.62)',
  scrimSoft: 'rgba(7,18,11,0.55)',
  scrimUpgrade: 'rgba(7,18,11,0.60)',

  // Status / danger.
  error: '#EE8888',
  danger: '#B04646',
  dangerBorder: '#7A3B3B',
  dangerTint: 'rgba(180,70,70,0.12)',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export type Colors = typeof colors;
