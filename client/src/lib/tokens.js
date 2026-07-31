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

   THREE type voices, assigned strictly (see `fonts` below):
     • Playfair Display *italic* — DISPLAY only. Wordmark, page titles, pull-quotes.
       Minimum 26px, max 2 per screen, never inside a card. Its hairlines vanish at
       card sizes on a dark ground, which is why it is fenced off from body work.
     • Newsreader *roman* 500 — Kristy's VOICE. Every verdict headline on every
       counter card and every scan result. The most important text in the app, so
       it is set in the most legible of the three.
     • Inter — everything else: eyebrows, decks, checklists, buttons, badges, meta.
   DM Mono stays for numbers/data.

   GOLD IS IDENTITY ONLY: wordmark, the hairline+dot motif, tier badge, active tab,
   chip text. Never a large filled surface, and never a sentence a shopper reads to
   make a decision — those are --ink / --ink-body / --ink-muted. The primary action
   on a screen is `action` (warm bone), exactly one per screen. */

export const colors = {
  // ── Grounds ──
  bgDeep: '#050D08', // near-black "void" — card gradient top, <meta theme-color>, verdict scrim
  bg: '#0A1A11', // forest-green ground        (--bg)
  surface: '#10251A', // cards                  (--surface)
  surface2: '#16301F', // chips, inputs         (--surface-2)
  border: '#29402F', // the hairline            (--hairline / --border)
  hairline: '#29402F', //                       (--hairline)
  borderGold: '#5A4C25', //                     (--brass-dim)
  // A card is defined by its LIFT off the ground, not by an outline. These are the two
  // pieces that replaces a border with: a hairline top highlight for the lifted edge,
  // and the drop shadow that separates a surface from the ground beneath it.
  // (Block W — the all-green field read flat because every layer shared one value and
  // every element was outlined.)
  edgeHighlight: 'rgba(244,241,232,0.05)', // 1px inner top edge on a raised surface
  shadowCard: '0 1px 2px rgba(0,0,0,0.28)', // a row resting on the ground
  shadowRaised: '0 4px 14px rgba(0,0,0,0.34)', // the composer / an expanded drawer
  checkboxRest: 'rgba(244,241,232,0.22)', // unchecked box — visible, not gold
  userBubble: '#16301F',
  aiBubble: '#10251A',

  // ── Gold + accents ──
  // Brass is IDENTITY. It marks what a thing IS (a tier, the active tab, the
  // wordmark, the thread) and never what a thing SAYS.
  brass: '#C4A65A', //                          (--brass)
  brassDim: '#5A4C25', //                       (--brass-dim)
  accentGold: '#C4A65A', // alias — the shipped name for brass  (--accent-gold)
  accentGoldMuted: '#5A4C25', // alias for brass-dim (--accent-gold-muted)
  accentMint: '#4A9B6F', //                     (--accent-mint)
  accentSeafoam: '#6BBF8E', //                  (--accent-seafoam)

  // ── The one filled action ─────────────────────────────────────────────────
  // Warm bone, near-white. Exactly ONE per screen: the primary CTA (Go, Ask,
  // Scan a barcode, Add to cart). Every other button is transparent with a
  // hairline border. A gold fill used to carry this job and it made every
  // screen shout in the brand colour, which left nothing for identity.
  action: '#EFE9D8', //                         (--action)
  actionInk: '#0A1A11', //                      (--action-ink)

  // ── Text ─────────────────────────────────────────────────────────────────
  // Three levels, and none of them is gold. `textSecondary` used to BE gold and
  // carried decks and why-lines all over the app — that is the single biggest
  // source of gold on a sentence someone reads to make a decision.
  ink: '#F4F1E8', // verdict headlines          (--ink)
  inkBody: '#C7D6CB', // checklists, expanded body (--ink-body)
  inkMuted: '#9DB0A2', // decks, eyebrows, metadata (--ink-muted)
  textPrimary: '#F4F1E8', // alias for ink      (--text-primary)
  textSecondary: '#9DB0A2', // alias for ink-muted (--text-secondary)
  textBody: '#C7D6CB', // alias for ink-body    (--text-body)
  textMuted: '#9DB0A2', // alias for ink-muted  (--text-muted)
  ringTrack: '#16301F', //                      (--ring-track)

  // ── Weight-trend lines (Sidebar / weightChart) ──
  trendMint: '#4A9B6F', // on-track
  trendMuted: '#6B9E85', // maintaining / off-goal

  // ── Precomputed gold/border tints (CSS uses color-mix; JS gets the rgba) ──
  gold30: 'rgba(90,76,37,0.30)', //             (--gold-30)
  gold40: 'rgba(90,76,37,0.40)', //             (--gold-40)
  gold50: 'rgba(90,76,37,0.50)', //             (--gold-50)
  border60: 'rgba(41,64,47,0.60)', //           (--border-60)
  goldTint9: 'rgba(196,166,90,0.09)', // selected plan card bg
  // Mint counterparts, derived from accentSeafoam/accentMint at the same weights —
  // the approved register needs a tint of its own so an affirmation never has to
  // borrow gold. Gold marks a concern; mint marks a food Kristy stands behind.
  mint30: 'rgba(74,155,111,0.30)',
  mintTint9: 'rgba(107,191,142,0.09)',

  // ── Scrims / overlays ──
  scrim: 'rgba(5,13,8,0.62)',
  scrimSoft: 'rgba(5,13,8,0.55)',
  scrimUpgrade: 'rgba(5,13,8,0.60)',
  scrimVerdict: 'rgba(5,13,8,0.72)',

  // ── Status / danger ──
  error: '#EE8888',
  danger: '#B04646',
  dangerBorder: '#7A3B3B',
  dangerTint: 'rgba(180,70,70,0.12)',

  black: '#000000',
  white: '#FFFFFF',
};

// Font stacks. Both serifs are loaded in app.html and both fall back to Georgia,
// so a font failure degrades to the shipped serif, never to a generic sans.
export const fonts = {
  ui: "'Inter', system-ui, -apple-system, sans-serif", //        (--font-ui)
  mono: "'DM Mono', ui-monospace, monospace", //                 (--font-mono)
  serif: "Georgia, 'Times New Roman', serif", // fallback        (--font-serif)
  display: "'Playfair Display', Georgia, 'Times New Roman', serif", // (--font-display)
  voice: "'Newsreader', Georgia, 'Times New Roman', serif", //    (--font-voice)
};

// kristyDisplay — Playfair Display *italic*. The wordmark, page titles ("Your
// cart", "The counter", "Produce", "Your haul") and pull-quote lines, and nothing
// else. NEVER below 26px and NEVER inside a card: Playfair is a display face and
// its hairlines disappear at card sizes on a dark ground. Two per screen, max.
export const kristyDisplay = {
  fontFamily: fonts.display,
  fontStyle: 'italic',
};

// kristyVoice — Newsreader ROMAN 500. Kristy's speaking voice, and every verdict
// headline on every counter card and scan result. This is the most important text
// in the app, so it is set in the most legible face, not the prettiest one.
// The className twin is `.kristy-voice` in index.css.
export const kristyVoice = {
  fontFamily: fonts.voice,
  fontStyle: 'normal',
  fontWeight: 500,
  letterSpacing: '-0.005em',
};

// The verdict headline, complete. 21px/1.3 --ink. Spread this rather than
// re-deriving the size on each card, so every headline in the app matches.
export const verdictHeadline = {
  ...kristyVoice,
  fontSize: 21,
  lineHeight: 1.3,
  color: colors.ink,
};

// Corner radii. A button is 8px; full-round is RESERVED for chips. When both were
// pills there was no hierarchy between "tap this" and "this is a label".
export const radii = {
  button: 8,
  card: 14,
  chip: 999,
};

// The thin gold thread/dot motif, as tokens. The reusable element that draws it
// lives in components/GoldThread.jsx; canvas surfaces read these directly.
export const motif = {
  threadColor: colors.gold40, // hairline gold rule
  threadColorStrong: 'rgba(196,166,90,0.55)', // the emphasised rule on the verdict card
  dotColor: colors.brass,
  dotSize: 5, // px
};

// Layout constants, mirroring the --sidebar-w / --*-max vars in index.css.
export const layout = {
  sidebarW: 260,
  bubbleMax: 600,
  contentMax: 760,
  inputMax: 680,
};

export default { colors, fonts, kristyDisplay, kristyVoice, verdictHeadline, radii, motif, layout };
