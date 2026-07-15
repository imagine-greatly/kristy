/* ═══════════════════════════ Kristy — design tokens ═══════════════════════════
   The single JS source of truth for the LOCKED brand. Nothing here is invented:
   every value is lifted from what already shipped — index.css :root, the canvas
   renderer, and the landing page. When a value changes, change it here and in the
   matching --var in index.css (the CSS mirror).

   Two grounds of consumer import from this module:
     • JS / <canvas> consumers (verdictCanvas.js, upcoming verdict surfaces) need
       literal hex — canvas fillStyle can't read a CSS variable. They import from
       here.
     • className / CSS consumers read the twin --var in index.css.

   Two type voices (the personal layer must look as different as it is):
     • Inter  — everything factual, UI, and ingredient text.
     • Playfair Display *italic* — Kristy's spoken/coaching text (`kristyVoice`).
   DM Mono stays for numbers/data; Georgia is the wordmark + serif fallback. */

export const colors = {
  // ── Grounds ──
  bgDeep: '#040805', // near-black "void" — card gradient top, <meta theme-color>, verdict scrim
  bg: '#0B1F0F', // forest-green ground        (--bg)
  surface: '#122718', //                        (--surface)
  surface2: '#1A3320', //                       (--surface-2)
  border: '#1E3D26', //                         (--border)
  borderGold: '#8B6F2E', //                     (--border-gold)
  userBubble: '#1A3320',
  aiBubble: '#122718',

  // ── Gold + accents ──
  accentGold: '#C9A84C', //                     (--accent-gold)
  accentGoldMuted: '#8B6F2E', //                (--accent-gold-muted)
  accentMint: '#4A9B6F', //                     (--accent-mint)
  accentSeafoam: '#6BBF8E', //                  (--accent-seafoam)

  // ── Text ──
  textPrimary: '#F0E6C8', //                    (--text-primary)
  textSecondary: '#C9A84C', //                  (--text-secondary)
  textMuted: '#6B8F72', //                      (--text-muted)
  ringTrack: '#1A3320', //                      (--ring-track)

  // ── Weight-trend lines (Sidebar / weightChart) ──
  trendMint: '#4A9B6F', // on-track
  trendMuted: '#6B9E85', // maintaining / off-goal

  // ── Precomputed gold/border tints (CSS uses color-mix; JS gets the rgba) ──
  gold30: 'rgba(139,111,46,0.30)', //           (--gold-30)
  gold40: 'rgba(139,111,46,0.40)', //           (--gold-40)
  gold50: 'rgba(139,111,46,0.50)', //           (--gold-50)
  border60: 'rgba(30,61,38,0.60)', //           (--border-60)
  goldTint9: 'rgba(201,168,76,0.09)', // selected plan card bg

  // ── Scrims / overlays ──
  scrim: 'rgba(7,18,11,0.62)',
  scrimSoft: 'rgba(7,18,11,0.55)',
  scrimUpgrade: 'rgba(7,18,11,0.60)',
  scrimVerdict: 'rgba(4,8,5,0.72)',

  // ── Status / danger ──
  error: '#EE8888',
  danger: '#B04646',
  dangerBorder: '#7A3B3B',
  dangerTint: 'rgba(180,70,70,0.12)',

  black: '#000000',
  white: '#FFFFFF',
};

// Font stacks. `voice` is the one new rule — Kristy's coaching/spoken face. It
// leads with Playfair Display (loaded in app.html, exactly as the landing page)
// and falls back to Georgia so it degrades to the shipped serif, never to a
// generic sans.
export const fonts = {
  ui: "'Inter', system-ui, -apple-system, sans-serif", //        (--font-ui)
  mono: "'DM Mono', ui-monospace, monospace", //                 (--font-mono)
  serif: "Georgia, 'Times New Roman', serif", // wordmark + fallback (--font-serif)
  voice: "'Playfair Display', Georgia, 'Times New Roman', serif", // (--font-voice)
};

// kristyVoice — spread onto any element's inline style to render Kristy's voice.
// The className twin is `.kristy-voice` in index.css. Playfair Display *italic*.
export const kristyVoice = {
  fontFamily: fonts.voice,
  fontStyle: 'italic',
};

// The thin gold thread/dot motif, as tokens. The reusable element that draws it
// lives in components/GoldThread.jsx; canvas surfaces read these directly.
export const motif = {
  threadColor: colors.gold40, // hairline gold rule
  threadColorStrong: 'rgba(201,168,76,0.55)', // the emphasised rule on the verdict card
  dotColor: colors.accentGold,
  dotSize: 5, // px
};

// Layout constants, mirroring the --sidebar-w / --*-max vars in index.css.
export const layout = {
  sidebarW: 260,
  bubbleMax: 600,
  contentMax: 760,
  inputMax: 680,
};

export default { colors, fonts, kristyVoice, motif, layout };
