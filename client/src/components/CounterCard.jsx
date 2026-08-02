import { useState } from 'react';
import { colors, fonts, kristyVoice, radii } from '../lib/tokens.js';
import CardTeaser from './CardTeaser.jsx';

/* ═══════════════ Counter card — the summary is the product, the depth is on tap ═══════════════

   A shopper standing at a counter has about two seconds and one hand. The old card opened
   with a topic name, a decision, a why-line AND a three-item checklist — more than anyone
   reads in an aisle, and the checklist in particular pushed the action off the screen.

   SUMMARY   eyebrow · tier badge · headline · do · optional add-to-cart · "The full read ↓"
             Three lines and an action. NO deck paragraph. NO checklist.
   EXPANDED  why · look_for[] · watch_out[] · tier_note

   THE TIER CHIP STAYS ABOVE THE TAP even though the rest of the tier framing moved behind
   it. The headline is a claim, and settled science must never render identically to a
   whole-food standard. What got demoted is the PARAGRAPH explaining what the tier is
   worth, not the fact of which tier it is.

   A `home` card is about washing, storing or keeping. It gets a distinct eyebrow and
   NEVER an add-to-cart — there is nothing at a shelf to add. The CTA is suppressed in the
   server projection too, so this is the second of two locks, not the only one.

   Tokens only. Her spoken lines are kristyVoice, everything factual is Inter. */

const TIER_LABEL = {
  established: 'Settled',
  credible_concern: 'Credible concern',
  kristys_standard: 'Whole-food standard',
  time_tested: 'Time-tested',
};
export const tierLabel = (t) => TIER_LABEL[t] || t;

/* THE SUMMARY IS ALWAYS FREE — eyebrow, tier chip, headline, do line, cart pick. A
   shopper in an aisle never hits a wall. `card.locked` means the server withheld the
   depth: the tap then opens the TEASER rather than a padlock, because the point of the
   moment is showing how much is behind it. */
export default function CounterCard({
  card, onAddToCart, compact = false, defaultOpen = false, onUpgrade, onRequestFull,
  purchasable = true,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [added, setAdded] = useState(false);

  if (!card) return null;
  const s = compact ? compactStyles : fullStyles;

  const home = card.kind === 'home';
  const locked = card.locked === true;
  const lookFor = card.look_for || [];
  const watchOut = card.watch_out || [];
  const hasDepth = locked || Boolean(card.why || lookFor.length || watchOut.length || card.tier_note);

  return (
    <article style={s.card} data-counter-card={card.slug} data-kind={card.kind || 'shelf'}>
      {/* ── SUMMARY ───────────────────────────────────────────────────────── */}
      <div style={styles.top}>
        {/* The eyebrow is a LABEL, not content — it says what is being answered, and the
            headline under it is the answer. Some KB titles are long ("Egg labels:
            cage-free, free-range, pasture-raised, organic") and were wrapping to three
            lines, which pushed the do line off a phone screen to say nothing new. One
            line, truncated: a label that costs a third of the summary is not a label. */}
        <span
          style={{ ...s.eyebrow, ...styles.eyebrowClamp, ...(home ? styles.eyebrowHome : null) }}
          title={card.eyebrow}
          data-eyebrow
        >
          {home ? `At home · ${card.eyebrow}` : card.eyebrow}
        </span>
        {card.tier && (
          <span style={styles.tier} data-tier-badge>
            {tierLabel(card.tier)}
          </span>
        )}
      </div>

      {/* THE HEADLINE. Her call, stated as fact. */}
      <p style={{ ...kristyVoice, ...s.headline }} data-headline>
        {card.headline}
      </p>

      {/* THE DO LINE. The one thing a shopper can act on without reading anything else. */}
      {card.do && (
        <p style={s.doLine} data-do-line>
          {card.do}
        </p>
      )}

      {/* One tap into the cart. Never on a home card. */}
      {!home && card.cta_item && onAddToCart && (
        <button
          type="button"
          style={{ ...styles.cta, ...(added ? styles.ctaDone : null) }}
          disabled={added}
          data-cta
          onClick={() => {
            onAddToCart(card.cta_item);
            setAdded(true);
          }}
        >
          {added ? `In the cart — ${card.cta_item}` : `Add to cart — ${card.cta_item}`}
        </button>
      )}

      {hasDepth && (
        <button
          type="button"
          style={styles.moreBtn}
          onClick={() => {
            if (!open && locked && onRequestFull) onRequestFull(card.slug);
            setOpen((v) => !v);
          }}
          aria-expanded={open}
          data-full-read
        >
          {open ? 'Less' : 'The full read'}
          <span style={styles.moreCaret} aria-hidden="true">{open ? '↑' : '↓'}</span>
        </button>
      )}

      {/* ── EXPANDED ──────────────────────────────────────────────────────── */}
      {open && (
        <div style={styles.depth} data-expanded>
          {locked ? (
            <CardTeaser card={card} onUpgrade={onUpgrade} purchasable={purchasable} />
          ) : (
          <>
          {card.why && <p style={s.why}>{card.why}</p>}

          {lookFor.length > 0 && (
            <div style={styles.listBlock}>
              <span style={styles.listHead}>What to look for</span>
              <ul style={styles.list}>
                {lookFor.map((t, i) => (
                  <li key={i} style={styles.row}>
                    <span style={styles.markLook} aria-hidden="true">✓</span>
                    <span style={s.rowText}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* The traps, kept visually distinct from the checklist. A "watch out" filed
              under "look for" inverts the advice, which is worse than an empty block. */}
          {watchOut.length > 0 && (
            <div style={styles.listBlock}>
              <span style={styles.listHead}>Watch out</span>
              <ul style={styles.list}>
                {watchOut.map((t, i) => (
                  <li key={i} style={styles.row}>
                    <span style={styles.markWatch} aria-hidden="true">!</span>
                    <span style={s.rowText}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What the tier this card carries is actually worth. The chip above says WHICH
              kind of claim it is; this says what that kind of claim is worth. */}
          {card.tier_note && (
            <p style={styles.tierNote}>
              {card.tier && <span style={styles.tierNoteHead}>{tierLabel(card.tier)}. </span>}
              {card.tier_note}
            </p>
          )}
          </>
          )}
        </div>
      )}
    </article>
  );
}

const styles = {
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tier: {
    flex: '0 0 auto', fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.03em',
    color: colors.textSecondary, padding: '2px 8px', borderRadius: 999,
    border: `1px solid ${colors.gold30}`, background: colors.goldTint9, whiteSpace: 'nowrap',
  },
  eyebrowClamp: {
    flex: '1 1 auto', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  eyebrowHome: { color: colors.textSecondary, fontStyle: 'italic', letterSpacing: '0.07em' },
  cta: {
    alignSelf: 'stretch', marginTop: 2, minHeight: 44, padding: '11px 14px',
    borderRadius: radii.button, border: `0.5px solid ${colors.hairline}`,
    background: 'transparent', color: colors.ink, fontFamily: fonts.ui,
    fontWeight: 700, fontSize: 14, cursor: 'pointer', textAlign: 'left',
  },
  ctaDone: { color: colors.textMuted, cursor: 'default' },
  moreBtn: {
    alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 0', background: 'transparent', border: 'none',
    color: colors.inkMuted, fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700,
    letterSpacing: '0.02em', cursor: 'pointer',
  },
  moreCaret: { fontSize: 11, opacity: 0.8 },
  depth: {
    display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 2,
    paddingLeft: 11, borderLeft: `1px solid ${colors.gold30}`,
  },
  listBlock: { display: 'flex', flexDirection: 'column', gap: 6 },
  listHead: {
    fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  row: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  markLook: {
    flex: '0 0 auto', width: 15, height: 15, marginTop: 1, borderRadius: 4,
    display: 'grid', placeItems: 'center',
    border: `1px solid ${colors.gold30}`, background: colors.goldTint9,
    color: colors.accentGold, fontSize: 9.5, fontWeight: 700, lineHeight: 1,
  },
  markWatch: {
    flex: '0 0 auto', width: 15, height: 15, marginTop: 1, borderRadius: 4,
    display: 'grid', placeItems: 'center',
    border: `1px solid ${colors.hairline}`, background: 'transparent',
    color: colors.textSecondary, fontSize: 10, fontWeight: 700, lineHeight: 1,
  },
  tierNote: { margin: 0, fontFamily: fonts.ui, fontSize: 12, lineHeight: 1.45, color: colors.textMuted },
  tierNoteHead: { fontWeight: 700, color: colors.textSecondary },
};

const fullStyles = {
  card: {
    display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 15px',
    borderRadius: 14, border: 'none', background: colors.surface,
    boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
  },
  eyebrow: {
    fontFamily: fonts.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  headline: { margin: 0, fontSize: 20, lineHeight: 1.35, color: colors.textPrimary },
  doLine: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.5, fontWeight: 600, color: colors.textSecondary },
  why: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.55, color: colors.textPrimary },
  rowText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textMuted },
};

const compactStyles = {
  card: { display: 'flex', flexDirection: 'column', gap: 7, padding: 0 },
  eyebrow: {
    fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  headline: { margin: 0, fontSize: 16.5, lineHeight: 1.4, color: colors.textPrimary },
  doLine: { margin: 0, fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.5, fontWeight: 600, color: colors.textSecondary },
  why: { margin: 0, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.55, color: colors.textPrimary },
  rowText: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.45, color: colors.textMuted },
};
