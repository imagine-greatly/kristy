import { colors, fonts, kristyVoice, motif } from '../lib/tokens.js';
import { GoldThread, GoldDot } from './GoldThread.jsx';
import { goalPickerOptions } from '../lib/coachGoals.js';
import {
  severityColor,
  EVIDENCE_LABEL,
  sortFlags,
  affirmationColor,
  AFFIRMATION_MEANING,
} from '../lib/verdictRamp.js';

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

// The verdict as Kristy's CALL, not a score — her words for the same tier logic.
// Rendered in her voice (Playfair italic). Free on every card.
const TIER_CALL = {
  approved: 'Approved.',
  approved_with_note: 'Approved — with a note.',
  use_with_intention: 'Use it with intention.',
  swap_recommended: "Swap it — there's a better pick.",
  skip: 'Skip. Put it back.',
};

// The in-voice ask shown to a user with no stored goal (the contextual goal ask).
const GOAL_ASK = "Want my read on whether this belongs in your cart? Tell me what you're shopping for.";

// The persistent evidence-honesty footer under the universal layer — hers, free.
const EVIDENCE_FOOTER =
  "I grade my evidence — settled science, credible concern, or my standard. I'll always tell you which.";

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

// The verdict bar — every tier below `approved`. Kristy's CALL in her voice
// (Playfair italic), not a clinical score. Tone color stays inside the palette.
function VerdictBar({ meta, call }) {
  const p = barPalette(meta.tone);
  return (
    <div style={{ ...styles.bar, background: p.bg, borderColor: p.border }}>
      <GoldDot color={p.fg} size={7} />
      <span style={{ ...kristyVoice, ...styles.barCall, color: p.fg }}>{call}</span>
    </div>
  );
}

// One flag row: a severity dot (verdict-ramp color), the ingredient name, its
// evidence-tier tag, and ONE why-first line. Compact — the list should scan like a
// receipt of concerns. Tappable → the full ingredient page (a free KB read).
function FlagRow({ item, onOpen }) {
  const evidence = EVIDENCE_LABEL[item.evidence_tier] || item.evidence_tier;
  const clickable = !!onOpen && !!item.id;
  return (
    <button
      type="button"
      style={styles.row}
      onClick={clickable ? () => onOpen(item.id) : undefined}
      aria-label={clickable ? `${item.name} — read the full story` : item.name}
    >
      <span style={{ ...styles.rowDot, background: severityColor(item.severity) }} aria-hidden="true" />
      <span style={styles.rowMain}>
        <span style={styles.rowTop}>
          <span style={styles.rowName}>{item.name}</span>
          {evidence && <span style={styles.evidenceTag}>{evidence}</span>}
        </span>
        {item.one_liner && <span style={styles.rowLine}>{item.one_liner}</span>}
      </span>
      {clickable && (
        <span style={styles.rowChev} aria-hidden="true">›</span>
      )}
    </button>
  );
}

// One affirmation row — the positive counterpart to FlagRow. Same anatomy so the
// card reads as one system, but deliberately in the APPROVED register: a mint dot,
// never gold or red. This is Kristy affirming a whole food, not grading a concern,
// so there is no severity here — an affirmation doesn't carry one.
function AffirmRow({ item, onOpen }) {
  const evidence = EVIDENCE_LABEL[item.evidence_tier] || item.evidence_tier;
  const clickable = !!onOpen && !!item.id;
  return (
    <button
      type="button"
      style={styles.row}
      onClick={clickable ? () => onOpen(item.id) : undefined}
      aria-label={clickable ? `${item.name} — read the full story` : item.name}
    >
      <span style={{ ...styles.rowDot, background: affirmationColor() }} aria-hidden="true" />
      <span style={styles.rowMain}>
        <span style={styles.rowTop}>
          <span style={styles.rowName}>{item.name}</span>
          {evidence && <span style={{ ...styles.evidenceTag, ...styles.evidenceTagAffirm }}>{evidence}</span>}
        </span>
        {item.one_liner && <span style={styles.rowLine}>{item.one_liner}</span>}
      </span>
      {clickable && (
        <span style={styles.rowChev} aria-hidden="true">›</span>
      )}
    </button>
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

// The withheld-read slot — the tease as ABSENCE, never a modal, never blocking.
// Only rendered when there's no personalized note in hand. Three quiet states:
//   • pickingGoal → Kristy is composing the read the user just unlocked with a tap
//   • needsGoal   → the contextual goal ask + one-tap picker
//   • upsell      → the held-back last sentence + the unlock / sign-in affordance
function ReadSlot({ needsGoal, pickingGoal, upsell, onPickGoal, onUnlock, unlockLabel }) {
  if (pickingGoal) {
    return (
      <section style={styles.readSlot}>
        <p style={{ ...kristyVoice, ...styles.askLine }}>Reading it for you&hellip;</p>
      </section>
    );
  }
  if (needsGoal) {
    return (
      <section style={styles.readSlot}>
        <p style={{ ...kristyVoice, ...styles.askLine }}>{GOAL_ASK}</p>
        {onPickGoal && (
          <div style={styles.goalChips}>
            {goalPickerOptions().map((g) => (
              <button key={g.value} type="button" style={styles.goalChip} onClick={() => onPickGoal(g.value)}>
                {g.label}
              </button>
            ))}
          </div>
        )}
      </section>
    );
  }
  if (upsell) {
    return (
      <section style={styles.readSlot}>
        <p style={{ ...kristyVoice, ...styles.withheldLine }}>{upsell}</p>
        {onUnlock && (
          <button type="button" style={styles.unlockBtn} onClick={onUnlock}>
            {unlockLabel}
          </button>
        )}
      </section>
    );
  }
  return null;
}

/* ───────────────────────── The card ───────────────────────── */

export default function ScanVerdictCard({
  verdict,
  product = {},
  goal,
  onPickGoal,
  pickingGoal = false,
  onUnlock,
  unlockLabel = 'Unlock my read',
  onOpenIngredient,
}) {
  if (!verdict) return null;
  const {
    tier, stamp, universalLayer = [], affirmationLayer = [], note, swap, education, upsell,
    freeTastesLeft, needsGoal, signals, ingredientsRead,
  } = verdict;
  const meta = TIER_META[tier] || TIER_META.approved_with_note;
  const call = TIER_CALL[tier] || TIER_CALL.approved_with_note;
  // Worst-severity first, focus-relevant first (as the engine floated them).
  const flags = sortFlags(universalLayer, signals);
  const readCount =
    ingredientsRead != null
      ? `${ingredientsRead} ingredient${ingredientsRead === 1 ? '' : 's'} read · ${universalLayer.length} flagged`
      : `${universalLayer.length} flagged`;
  const tasteNudge =
    freeTastesLeft != null && freeTastesLeft <= 1
      ? freeTastesLeft <= 0
        ? "That's your last free read — membership unlocks the rest."
        : '1 free read left, then it becomes a membership perk.'
      : null;

  return (
    <div style={styles.card}>
      <ProductHeader product={product} />

      {/* Verdict — the earned seal, or Kristy's call. Never the seal unless stamp is true. */}
      {stamp ? <ApprovedSeal /> : <VerdictBar meta={meta} call={call} />}

      {/* What's inside — the factual universal layer, one chip per flagged ingredient,
          closed with Kristy's evidence-honesty line (free on every card). */}
      {universalLayer.length > 0 && (
        <section style={styles.section}>
          <SectionLabel>What&rsquo;s inside</SectionLabel>
          <p style={styles.readCount}>{readCount}</p>
          <div style={styles.rows}>
            {flags.map((item) => (
              <FlagRow key={item.id || item.name} item={item} onOpen={onOpenIngredient} />
            ))}
          </div>
          <p style={{ ...kristyVoice, ...styles.evidenceFooter }}>{EVIDENCE_FOOTER}</p>
        </section>
      )}

      {/* What's good in here — the affirmation layer. Same anatomy as the flag list
          so the card reads as one system, but in the approved register: this is
          Kristy standing behind a whole food, not grading a concern. Free on every
          card (a pure KB read), and it never moves the tier or the seal. */}
      {affirmationLayer.length > 0 && (
        <section style={styles.section}>
          <SectionLabel>What&rsquo;s good in here</SectionLabel>
          <div style={styles.rows}>
            {affirmationLayer.map((item) => (
              <AffirmRow key={item.id || item.name} item={item} onOpen={onOpenIngredient} />
            ))}
          </div>
          <p style={{ ...kristyVoice, ...styles.evidenceFooter }}>{AFFIRMATION_MEANING}</p>
        </section>
      )}

      {/* Kristy's note — her voice (Playfair italic), spoken through the user's goal.
          Present for members and free users with a taste remaining. */}
      {note && (
        <section style={styles.section}>
          <div style={styles.noteLabel}>for your {goal || 'goal'}</div>
          <p style={{ ...kristyVoice, ...styles.note }}>{note}</p>
          {tasteNudge && <div style={styles.tasteNudge}>{tasteNudge}</div>}
        </section>
      )}

      {/* Swap — the KB's generic better-pick is FREE (a field read); the goal-aware
          swap rides this same slot for members. Never present for approved tiers. */}
      {swap && <SwapBlock swap={swap} />}

      {/* The withheld read — only when there's no note in hand (goal ask / tease). */}
      {!note && (
        <ReadSlot
          needsGoal={needsGoal}
          pickingGoal={pickingGoal}
          upsell={upsell}
          onPickGoal={onPickGoal}
          onUnlock={onUnlock}
          unlockLabel={unlockLabel}
        />
      )}

      {/* Education — at most ONE contextual Kristy-ism, chosen server-side by the
          highest-priority trigger on this product. Free for guests + free users. */}
      {education?.text && (
        <div style={styles.ism}>
          <GoldThread />
          <p style={{ ...kristyVoice, ...styles.ismText }}>{education.text}</p>
        </div>
      )}
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
  // Kristy's call, in her voice (Playfair italic via kristyVoice spread).
  barCall: { fontSize: 18, lineHeight: 1.2 },

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

  // ── What's inside — flag rows (a receipt of concerns) ──
  readCount: {
    margin: '-2px 0 2px',
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: '0.01em',
  },
  rows: { display: 'flex', flexDirection: 'column', gap: 6 },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    textAlign: 'left',
    padding: '11px 12px',
    borderRadius: 12,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    cursor: 'pointer',
  },
  rowDot: { width: 9, height: 9, borderRadius: 999, flex: '0 0 auto', marginTop: 5 },
  rowMain: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  rowTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  // A long unbroken ingredient name (carboxymethylcellulose) would otherwise
  // shove the evidence tag off the row at 390px.
  rowName: {
    fontFamily: fonts.ui,
    fontSize: 14.5,
    fontWeight: 600,
    color: colors.textPrimary,
    minWidth: 0,
    overflowWrap: 'anywhere',
  },
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
  // The Time-tested tag, in the approved register — mint, never gold. A viewer
  // should be able to tell an affirmation from a concern without reading a word.
  evidenceTagAffirm: {
    color: colors.accentSeafoam,
    border: `1px solid ${colors.mint30}`,
    background: colors.mintTint9,
  },
  rowLine: {
    fontFamily: fonts.ui,
    fontSize: 12.5,
    lineHeight: 1.4,
    color: colors.textMuted,
  },
  rowChev: { flex: '0 0 auto', alignSelf: 'center', color: colors.textMuted, fontSize: 18, lineHeight: 1 },
  // Kristy's evidence-honesty line under the universal layer (hers, free).
  evidenceFooter: {
    margin: '2px 2px 0',
    fontSize: 13.5,
    lineHeight: 1.5,
    color: colors.textMuted,
  },

  // ── The withheld-read slot (goal ask / tease) ──
  readSlot: { display: 'flex', flexDirection: 'column', gap: 12 },
  askLine: { margin: 0, fontSize: 17, lineHeight: 1.5, color: colors.textPrimary },
  goalChips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  goalChip: {
    padding: '9px 14px',
    borderRadius: 999,
    border: `1px solid ${colors.borderGold}`,
    background: colors.surface2,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  withheldLine: { margin: 0, fontSize: 17, lineHeight: 1.5, color: colors.textPrimary },
  unlockBtn: {
    alignSelf: 'stretch',
    padding: '13px 16px',
    borderRadius: 12,
    border: 'none',
    background: colors.accentGold,
    color: colors.bgDeep,
    fontFamily: fonts.ui,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
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
  tasteNudge: { marginTop: 8, fontFamily: fonts.ui, fontSize: 12, color: colors.textMuted },

  // ── Gated upsell (member read) ──
  upsell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '14px 15px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
  },
  upsellLabel: {
    fontFamily: fonts.ui,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  upsellText: { margin: 0, fontSize: 17, lineHeight: 1.5, color: colors.textPrimary },

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

  // ── Education ism (footer) ──
  ism: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 2 },
  ismText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 320,
  },
};
