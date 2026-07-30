import { useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';

/* ═══════════════ Perimeter answer — the decision, then the reason, then the depth ═══════════════
   A shopper at a counter has ten seconds and one hand. This card used to open with the
   education: title, then a paragraph of sourced background, then eventually the call.
   Nobody reads that standing in an aisle, so the hierarchy is inverted.

     DECISION   the call, in one line, in her voice. First and largest.
     WHY        the teaching, in a phrase. This is how the counter teaches — the reason
                attached to the fast answer, absorbed over trips, not lectured.
     CART       one tap, where the entry resolves to a grocery.
     CHECKLIST  what to look for, short and scannable. Actionable, so it stays.
     ─ tap ─    the full read: the background, the tier framing, the decoded labels,
                the rest of the checklist, the sources. Nothing was deleted. It is
                one tap down instead of in front.

   The default view is meant to be readable in about five seconds. The EVIDENCE TIER
   chip stays on the surface rather than moving behind the tap: the decision IS a claim,
   and a reader must always be able to tell a settled one from a whole-food-standard one
   without opening anything. The tier's FRAMING (the paragraph explaining what the tier
   means) is what got demoted.

   Used in three places, identically — the Counter surface, a chat bubble, and inline in
   a cart item. Browse or ask, the answer is the same object.

   Tokens only. Her spoken lines are kristyVoice, everything factual is Inter. */

const TIER_LABEL = {
  established: 'Settled',
  credible_concern: 'Credible concern',
  kristys_standard: 'Whole-food standard',
  time_tested: 'Time-tested',
};
export const tierLabel = (t) => TIER_LABEL[t] || t;

// The default checklist is capped so the first view stays inside the five-second
// budget. The remainder is not dropped — it opens with the rest of the depth.
const TIPS_SHOWN = 3;

export default function PerimeterAnswer({
  resp,
  allowRefine = false,
  onRefine,
  onUpgrade,
  onAddToCart,
  compact = false,
}) {
  // The counter FILLS the cart, it does not only inform it. `cart_pick` is authored
  // in the KB as a grocery name, so this tap is free, deterministic, and available on
  // every tier — no model call, nothing to claim-lock.
  const [added, setAdded] = useState(null);
  // Which entries have had their depth opened. Per-entry, because an answer can carry
  // more than one and opening one should not unfold the rest.
  const [open, setOpen] = useState(() => new Set());

  if (!resp) return null;
  const s = compact ? compactStyles : fullStyles;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div style={styles.wrap}>
      {/* The honest no-answer — she says so rather than improvising. */}
      {!resp.matched && resp.answer && (
        <p style={{ ...kristyVoice, ...s.answer }}>{resp.answer}</p>
      )}

      {/* The free universal layer: the matched entry, verbatim from the KB. */}
      {(resp.entries || []).map((e) => {
        const tips = e.buying_tips || [];
        const shown = tips.slice(0, TIPS_SHOWN);
        const rest = tips.slice(TIPS_SHOWN);
        const isOpen = open.has(e.id);

        return (
          <div key={e.id} style={s.entry}>
            {/* The topic name is an overline, not a headline. It labels what is being
                answered; the decision under it is the answer. */}
            <div style={styles.entryTop}>
              <span style={s.topicName}>{e.title}</span>
              {e.evidence_tier && <span style={styles.tier}>{tierLabel(e.evidence_tier)}</span>}
            </div>

            {/* THE DECISION. Her call, stated as fact. */}
            {e.decision ? (
              <p style={{ ...kristyVoice, ...s.decision }}>{e.decision}</p>
            ) : (
              // An entry authored before the inversion still reads correctly rather
              // than rendering an empty card.
              e.short_answer && <p style={s.short}>{e.short_answer}</p>
            )}

            {/* THE WHY. One line, and the whole teaching mechanism of the surface. */}
            {e.why && <p style={s.why}>{e.why}</p>}

            {/* ONE TAP INTO THE CART, on the decision itself. Scanning puts a product
                in the trip; the counter has to do the same or it stays a reference
                book — and it has to do it here, beside the call, not under the essay. */}
            {e.cart_pick && onAddToCart && (
              <button
                type="button"
                style={{ ...styles.pick, ...(added === e.id ? styles.pickDone : null) }}
                disabled={added === e.id}
                onClick={() => {
                  onAddToCart(e.cart_pick);
                  setAdded(e.id);
                }}
              >
                {added === e.id ? `In the cart — ${e.cart_pick}` : `Add to cart — ${e.cart_pick}`}
              </button>
            )}

            {/* What to look for — a checklist you can run down in the aisle. It is
                actionable rather than prose, so it stays above the fold. */}
            {shown.length > 0 && (
              <div style={styles.tipsBlock}>
                <span style={styles.tipsHead}>What to look for</span>
                <ul style={styles.tips}>
                  {shown.map((t, i) => (
                    <li key={i} style={styles.tipRow}>
                      <span style={styles.tipMark} aria-hidden="true">✓</span>
                      <span style={s.tipText}>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── The full read, on tap. Everything the card used to open with. ── */}
            {(e.short_answer || e.detail || rest.length || (e.labels_decoded || []).length) && (
              <button
                type="button"
                style={styles.moreBtn}
                onClick={() => toggle(e.id)}
                aria-expanded={isOpen}
              >
                {isOpen ? 'Less' : 'The full read'}
                <span style={styles.moreCaret} aria-hidden="true">{isOpen ? '↑' : '↓'}</span>
              </button>
            )}

            {isOpen && (
              <div style={styles.depth}>
                {e.short_answer && <p style={s.short}>{e.short_answer}</p>}
                {e.detail && <p style={s.detail}>{e.detail}</p>}

                {rest.length > 0 && (
                  <ul style={styles.tips}>
                    {rest.map((t, i) => (
                      <li key={i} style={styles.tipRow}>
                        <span style={styles.tipMark} aria-hidden="true">✓</span>
                        <span style={s.tipText}>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {(e.labels_decoded || []).length > 0 && (
                  <div style={styles.labels}>
                    {e.labels_decoded.map((l, i) => (
                      <div key={i} style={styles.labelRow}>
                        <span style={styles.labelTerm}>{l.term}</span>
                        <span style={styles.labelMeaning}>{l.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Her standard on the topic, and what the tier actually means. The
                    chip above says WHICH kind of claim it is; this says what that
                    kind of claim is worth. */}
                {e.kristy_take && <p style={{ ...kristyVoice, ...s.take }}>{e.kristy_take}</p>}
                {e.evidence_framing && (
                  <p style={styles.framing}>
                    <span style={styles.framingHead}>{tierLabel(e.evidence_tier)}. </span>
                    {e.evidence_framing}
                  </p>
                )}

                {(e.sources || []).length > 0 && (
                  <p style={styles.sources}>Sources: {e.sources.join(' · ')}</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Kristy's personalized read (premium) + her better pick, one tap to apply. */}
      {resp.answer && resp.matched && (
        <>
          <GoldThread />
          <p style={{ ...kristyVoice, ...s.answer }}>{resp.answer}</p>
          {allowRefine && resp.refinement && onRefine && (
            <button type="button" style={styles.refine} onClick={() => onRefine(resp.refinement)}>
              Use this instead — {resp.refinement}
            </button>
          )}
        </>
      )}

      {/* The withheld personalized read (free user). The entry above still stands. */}
      {resp.gated && (
        <div style={styles.gate}>
          <GoldThread />
          <p style={{ ...kristyVoice, ...s.gateLine }}>{resp.upsell}</p>
          {onUpgrade && (
            <button type="button" style={styles.gateCta} onClick={onUpgrade}>
              Unlock the personalized read
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 12 },
  entryTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tier: {
    flex: '0 0 auto', fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.03em',
    color: colors.textSecondary, padding: '2px 8px', borderRadius: 999,
    border: `1px solid ${colors.gold30}`, background: colors.goldTint9, whiteSpace: 'nowrap',
  },
  tipsBlock: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 },
  tipsHead: {
    fontFamily: fonts.ui, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  tips: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  tipRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  tipMark: {
    flex: '0 0 auto', width: 15, height: 15, marginTop: 1, borderRadius: 4,
    display: 'grid', placeItems: 'center',
    border: `1px solid ${colors.gold30}`, background: colors.goldTint9,
    color: colors.accentGold, fontSize: 9.5, fontWeight: 700, lineHeight: 1,
  },
  // The depth. Quiet by construction: it is reference, and the call above it is not.
  moreBtn: {
    alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
    marginTop: 2, padding: '7px 0', background: 'transparent', border: 'none',
    color: colors.accentGoldMuted, fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700,
    letterSpacing: '0.02em', cursor: 'pointer',
  },
  moreCaret: { fontSize: 11, opacity: 0.8 },
  depth: {
    display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 2,
    paddingLeft: 11, borderLeft: `1px solid ${colors.gold30}`,
  },
  labels: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 },
  labelRow: { display: 'flex', flexDirection: 'column', gap: 1 },
  labelTerm: { fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700, color: colors.textSecondary },
  labelMeaning: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.4, color: colors.textMuted },
  framing: { margin: 0, fontFamily: fonts.ui, fontSize: 12, lineHeight: 1.45, color: colors.textMuted },
  framingHead: { fontWeight: 700, color: colors.textSecondary },
  sources: { margin: '2px 0 0', fontFamily: fonts.ui, fontSize: 11, color: colors.textMuted },
  refine: {
    alignSelf: 'stretch', marginTop: 2, padding: '12px 16px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui,
    fontWeight: 700, fontSize: 14.5, cursor: 'pointer', textAlign: 'left',
  },
  // The counter's cart tap. Gold-outlined rather than gold-filled: it is the entry's
  // action, not the loudest thing on a screen that is mostly guidance.
  pick: {
    alignSelf: 'stretch', marginTop: 4, minHeight: 44, padding: '11px 14px', borderRadius: 12,
    border: `1px solid ${colors.borderGold}`, background: colors.goldTint9,
    color: colors.textPrimary, fontFamily: fonts.ui, fontWeight: 700, fontSize: 14,
    cursor: 'pointer', textAlign: 'left',
  },
  pickDone: { color: colors.textMuted, cursor: 'default' },
  gate: { display: 'flex', flexDirection: 'column', gap: 10 },
  gateCta: {
    alignSelf: 'stretch', padding: '12px 16px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui,
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
  },
};

// The sheet gets the full-size treatment; inside a cart row everything steps down a
// notch and the entry loses its own card border (the item row is already the card).
const fullStyles = {
  entry: {
    display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 15px',
    borderRadius: 14, border: 'none', background: colors.surface, boxShadow: `inset 0 1px 0 ${colors.edgeHighlight}, ${colors.shadowCard}`,
  },
  // Small, muted, and above the call: a label for the topic, not the headline.
  topicName: {
    fontFamily: fonts.ui, fontSize: 11, fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  decision: { margin: 0, fontSize: 20, lineHeight: 1.35, color: colors.textPrimary },
  why: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.5, color: colors.textSecondary },
  short: { margin: 0, fontFamily: fonts.ui, fontSize: 14, lineHeight: 1.55, color: colors.textPrimary },
  detail: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.6, color: colors.textMuted },
  take: { margin: 0, fontSize: 15, lineHeight: 1.5, color: colors.textPrimary },
  tipText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textMuted },
  answer: { margin: 0, fontSize: 17, lineHeight: 1.55, color: colors.textPrimary },
  gateLine: { margin: 0, fontSize: 16, lineHeight: 1.55, color: colors.textPrimary },
};

const compactStyles = {
  entry: { display: 'flex', flexDirection: 'column', gap: 7, padding: 0 },
  topicName: {
    fontFamily: fonts.ui, fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: colors.textMuted,
  },
  decision: { margin: 0, fontSize: 16.5, lineHeight: 1.4, color: colors.textPrimary },
  why: { margin: 0, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.5, color: colors.textSecondary },
  short: { margin: 0, fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.55, color: colors.textPrimary },
  detail: { margin: 0, fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.6, color: colors.textMuted },
  take: { margin: 0, fontSize: 14, lineHeight: 1.5, color: colors.textPrimary },
  tipText: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.45, color: colors.textMuted },
  answer: { margin: 0, fontSize: 15, lineHeight: 1.55, color: colors.textPrimary },
  gateLine: { margin: 0, fontSize: 14.5, lineHeight: 1.55, color: colors.textPrimary },
};
