import { colors, fonts, kristyVoice, motif } from '../lib/tokens.js';
import { GoldThread, GoldDot } from './GoldThread.jsx';

/* ═══════════════════════ Scan Verdict Card — the in-aisle result ═══════════════════════
   Renders a /verdict response (Step 2 contract) top-to-bottom, as live DOM (this is
   NOT the shareable canvas card in VerdictCard.jsx — that's a separate feature):

     { tier, stamp, universalLayer:[{ id, name, one_liner, severity, evidence_tier }],
       note, swap }

   The product header (thumbnail / name / aisle) and the user's `goal` are scan CONTEXT,
   not part of the verdict — they arrive as props.

   Non-negotiables honored here:
     • Tokens only. Every color and face is imported from lib/tokens.js — nothing invented.
       Factual/UI/ingredient text is Inter; Kristy's note is `kristyVoice` (Playfair italic).
     • The stamp is earned. The gold "Kristy Approved" seal renders ONLY when `stamp === true`
       (i.e. tier === 'approved'). Every tier below gets a plain verdict bar.

   Mobile-first: one column, generous tap/scan targets, high contrast for bright store light. */

// tier → the plain-bar label + palette tone (shown whenever the seal is NOT earned).
// Labels are the fixed human tier names; tones stay strictly inside the token palette.
const TIER_META = {
  approved: { label: 'Approved', tone: 'mint' },
  approved_with_note: { label: 'Approved with note', tone: 'gold' },
  use_with_intention: { label: 'Use with intention', tone: 'gold' },
  swap_recommended: { label: 'Swap recommended', tone: 'goldStrong' },
  skip: { label: 'Skip', tone: 'danger' },
};

// evidence_tier → the small tag rendered on each "What's inside" chip.
const EVIDENCE_LABEL = {
  established: 'Established',
  credible_concern: 'Credible concern',
  kristys_standard: "Kristy's standard",
};

// Bar palette per tone — all pulled from tokens, never hand-mixed.
function barPalette(tone) {
  switch (tone) {
    case 'mint':
      return { fg: colors.accentSeafoam, border: colors.accentMint, bg: colors.surface2 };
    case 'goldStrong':
      return { fg: colors.accentGold, border: colors.borderGold, bg: colors.goldTint9 };
    case 'danger':
      return { fg: colors.error, border: colors.dangerBorder, bg: colors.dangerTint };
    case 'gold':
    default:
      return { fg: colors.textSecondary, border: colors.borderGold, bg: colors.goldTint9 };
  }
}

/* ───────────────────────── Sub-parts ───────────────────────── */

// Product header: thumbnail, name, aisle/type. Thumbnail falls back to a branded
// tile (forest-green ground + the product initial in gold) when there's no image.
function ProductHeader({ product = {} }) {
  const { image, name, aisle } = product;
  const initial = (name || '').trim().charAt(0).toUpperCase() || '·';
  return (
    <div style={styles.header}>
      {image ? (
        <img src={image} alt="" style={styles.thumb} />
      ) : (
        <div style={{ ...styles.thumb, ...styles.thumbFallback }} aria-hidden="true">
          {initial}
        </div>
      )}
      <div style={styles.headerText}>
        <div style={styles.productName}>{name || 'This product'}</div>
        {aisle && <div style={styles.aisle}>{aisle}</div>}
      </div>
    </div>
  );
}

// The earned seal — the gold "Kristy Approved" mark on the forest-green ground,
// framed top and bottom by the thin gold thread/dot motif. Only reached at
// tier === 'approved'.
function ApprovedSeal() {
  return (
    <div style={styles.seal} role="img" aria-label="Kristy Approved">
      <GoldThread strong />
      <div style={styles.sealMark}>
        <span style={styles.sealScript}>Kristy</span>
        <span style={styles.sealApproved}>APPROVED</span>
      </div>
      <GoldThread strong />
    </div>
  );
}

// The plain verdict bar — every tier below `approved`. Labelled with the tier name.
function VerdictBar({ meta }) {
  const p = barPalette(meta.tone);
  return (
    <div style={{ ...styles.bar, background: p.bg, borderColor: p.border }}>
      <GoldDot color={p.fg} size={7} />
      <span style={{ ...styles.barLabel, color: p.fg }}>{meta.label}</span>
    </div>
  );
}

// One "What's inside" chip: ingredient name, its one-liner, and the evidence-tier tag.
// All Inter (factual layer).
function InsideChip({ item }) {
  const evidence = EVIDENCE_LABEL[item.evidence_tier] || item.evidence_tier;
  return (
    <div style={styles.chip}>
      <div style={styles.chipTop}>
        <span style={styles.chipName}>{item.name}</span>
        {evidence && <span style={styles.evidenceTag}>{evidence}</span>}
      </div>
      {item.one_liner && <p style={styles.chipLine}>{item.one_liner}</p>}
    </div>
  );
}

// The swap block — the better pick on a forest-green fill, with the primary pick
// highlighted in gold. `swap` is a plain string from the engine; the first segment
// (up to the first comma) is the headline pick.
function SwapBlock({ swap }) {
  const trimmed = String(swap).trim();
  const comma = trimmed.indexOf(',');
  const primary = comma === -1 ? trimmed : trimmed.slice(0, comma);
  const rest = comma === -1 ? '' : trimmed.slice(comma); // includes the leading comma

  return (
    <div style={styles.swap}>
      <div style={styles.swapLabel}>Kristy&rsquo;s swap</div>
      <p style={styles.swapText}>
        <span style={styles.swapPrimary}>{primary}</span>
        {rest && <span style={styles.swapRest}>{rest}</span>}
      </p>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={styles.sectionLabel}>{children}</div>;
}

/* ───────────────────────── The card ───────────────────────── */

export default function ScanVerdictCard({ verdict, product = {}, goal }) {
  if (!verdict) return null;
  const { tier, stamp, universalLayer = [], note, swap } = verdict;
  const meta = TIER_META[tier] || TIER_META.approved_with_note;

  return (
    <div style={styles.card}>
      <ProductHeader product={product} />

      {/* Verdict — the earned seal, or a plain bar. Never the seal unless stamp is true. */}
      {stamp ? <ApprovedSeal /> : <VerdictBar meta={meta} />}

      {/* What's inside — the factual universal layer, one chip per flagged ingredient. */}
      {universalLayer.length > 0 && (
        <section style={styles.section}>
          <SectionLabel>What&rsquo;s inside</SectionLabel>
          <div style={styles.chips}>
            {universalLayer.map((item) => (
              <InsideChip key={item.id || item.name} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Kristy's note — her voice (Playfair italic), spoken through the user's goal. */}
      {note && (
        <section style={styles.section}>
          <div style={styles.noteLabel}>for your {goal || 'goal'}</div>
          <p style={{ ...kristyVoice, ...styles.note }}>{note}</p>
        </section>
      )}

      {/* Swap — only present when the engine returned one (never for approved tiers). */}
      {swap && <SwapBlock swap={swap} />}
    </div>
  );
}

/* ───────────────────────── Styles (tokens only) ─────────────────────────
   Every value below is a token from lib/tokens.js. No literal colors, no invented
   type. Inline so the card is self-contained and portable to the RN port. */
const styles = {
  card: {
    width: '100%',
    maxWidth: 420,
    margin: '0 auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    padding: 18,
    borderRadius: 20,
    border: `1px solid ${colors.border}`,
    background: `linear-gradient(180deg, ${colors.bgDeep} 0%, ${colors.bg} 42%)`,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },

  // ── Product header ──
  header: { display: 'flex', alignItems: 'center', gap: 12 },
  thumb: {
    width: 56,
    height: 56,
    flex: '0 0 auto',
    borderRadius: 12,
    objectFit: 'cover',
    border: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  thumbFallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.surface2,
    color: colors.accentGold,
    fontFamily: fonts.voice,
    fontSize: 24,
    fontWeight: 600,
  },
  headerText: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 },
  productName: {
    fontFamily: fonts.ui,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.25,
    color: colors.textPrimary,
  },
  aisle: {
    fontFamily: fonts.ui,
    fontSize: 12.5,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },

  // ── Earned seal ──
  seal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '18px 16px',
    borderRadius: 16,
    border: `1px solid ${colors.borderGold}`,
    background: colors.bg,
  },
  sealMark: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  sealScript: {
    fontFamily: fonts.voice,
    fontSize: 30,
    lineHeight: 1,
    color: colors.accentGold,
  },
  sealApproved: {
    fontFamily: fonts.ui,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.42em',
    textIndent: '0.42em', // balance the trailing letter-spacing so it reads centered
    color: colors.textSecondary,
  },

  // ── Plain verdict bar ──
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 16px',
    borderRadius: 12,
    border: '1px solid transparent',
  },
  barLabel: { fontFamily: fonts.ui, fontSize: 16, fontWeight: 600, letterSpacing: '0.01em' },

  // ── Sections ──
  section: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  // ── What's inside chips ──
  chips: { display: 'flex', flexDirection: 'column', gap: 8 },
  chip: {
    padding: '11px 13px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
  },
  chipTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  chipName: { fontFamily: fonts.ui, fontSize: 14.5, fontWeight: 600, color: colors.textPrimary },
  evidenceTag: {
    flex: '0 0 auto',
    fontFamily: fonts.ui,
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: '0.03em',
    color: colors.textSecondary,
    padding: '2px 8px',
    borderRadius: 999,
    border: `1px solid ${colors.gold30}`,
    background: colors.goldTint9,
    whiteSpace: 'nowrap',
  },
  chipLine: {
    margin: '5px 0 0',
    fontFamily: fonts.ui,
    fontSize: 13,
    lineHeight: 1.45,
    color: colors.textMuted,
  },

  // ── Kristy's note ──
  noteLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  note: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.5,
    color: colors.textPrimary,
  },

  // ── Swap block ──
  swap: {
    padding: '13px 15px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.surface2,
  },
  swapLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 5,
  },
  swapText: { margin: 0, fontFamily: fonts.ui, fontSize: 15, lineHeight: 1.45 },
  swapPrimary: { color: colors.accentGold, fontWeight: 700 },
  swapRest: { color: colors.textPrimary },
};
