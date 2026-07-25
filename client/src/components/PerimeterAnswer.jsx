import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';

/* ═══════════════════ Perimeter answer — a reference card, not a chat reply ═══════════════════
   The unlabeled half of the store (produce, the counter, bulk, label terms) deserves the
   same tactile treatment as a scan: a card you read at a glance, with the buying tips as a
   real "What to look for" CHECKLIST. Used in two places, identically —
     • inline inside a cart item (compact), so the coaching lives in the object
     • inside the Ask-the-aisle sheet, for a free-form question
   Tokens only; her spoken lines are kristyVoice, everything factual is Inter. */

const TIER_LABEL = {
  established: 'Settled',
  credible_concern: 'Credible concern',
  kristys_standard: "Kristy's standard",
  time_tested: 'Time-tested',
};
export const tierLabel = (t) => TIER_LABEL[t] || t;

export default function PerimeterAnswer({
  resp,
  allowRefine = false,
  onRefine,
  onUpgrade,
  compact = false,
}) {
  if (!resp) return null;
  const s = compact ? compactStyles : fullStyles;

  return (
    <div style={styles.wrap}>
      {/* The honest no-answer — she says so rather than improvising. */}
      {!resp.matched && resp.answer && (
        <p style={{ ...kristyVoice, ...s.answer }}>{resp.answer}</p>
      )}

      {/* The free universal layer: the matched entry, verbatim from the KB. */}
      {(resp.entries || []).map((e) => (
        <div key={e.id} style={s.entry}>
          <div style={styles.entryTop}>
            <span style={s.entryTitle}>{e.title}</span>
            {e.evidence_tier && <span style={styles.tier}>{tierLabel(e.evidence_tier)}</span>}
          </div>

          {e.short_answer && <p style={s.short}>{e.short_answer}</p>}

          {/* What to look for — a checklist you can run down in the aisle. */}
          {(e.buying_tips || []).length > 0 && (
            <div style={styles.tipsBlock}>
              <span style={styles.tipsHead}>What to look for</span>
              <ul style={styles.tips}>
                {e.buying_tips.map((t, i) => (
                  <li key={i} style={styles.tipRow}>
                    <span style={styles.tipMark} aria-hidden="true">✓</span>
                    <span style={s.tipText}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
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

          {(e.sources || []).length > 0 && (
            <p style={styles.sources}>Sources: {e.sources.join(' · ')}</p>
          )}
        </div>
      ))}

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
              Unlock my read
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
  labels: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 },
  labelRow: { display: 'flex', flexDirection: 'column', gap: 1 },
  labelTerm: { fontFamily: fonts.ui, fontSize: 12.5, fontWeight: 700, color: colors.textSecondary },
  labelMeaning: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.4, color: colors.textMuted },
  sources: { margin: '2px 0 0', fontFamily: fonts.ui, fontSize: 11, color: colors.textMuted },
  refine: {
    alignSelf: 'stretch', marginTop: 2, padding: '12px 16px', borderRadius: 12, border: 'none',
    background: colors.accentGold, color: colors.bgDeep, fontFamily: fonts.ui,
    fontWeight: 700, fontSize: 14.5, cursor: 'pointer', textAlign: 'left',
  },
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
    borderRadius: 14, border: `1px solid ${colors.border}`, background: colors.surface,
  },
  entryTitle: { fontFamily: fonts.ui, fontSize: 15.5, fontWeight: 700, color: colors.textPrimary },
  short: { margin: 0, fontFamily: fonts.ui, fontSize: 14.5, lineHeight: 1.5, color: colors.textPrimary },
  tipText: { fontFamily: fonts.ui, fontSize: 13, lineHeight: 1.45, color: colors.textMuted },
  answer: { margin: 0, fontSize: 17, lineHeight: 1.55, color: colors.textPrimary },
  gateLine: { margin: 0, fontSize: 16, lineHeight: 1.55, color: colors.textPrimary },
};

const compactStyles = {
  entry: { display: 'flex', flexDirection: 'column', gap: 7, padding: 0 },
  entryTitle: { fontFamily: fonts.ui, fontSize: 13.5, fontWeight: 700, color: colors.textPrimary },
  short: { margin: 0, fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 1.5, color: colors.textPrimary },
  tipText: { fontFamily: fonts.ui, fontSize: 12.5, lineHeight: 1.45, color: colors.textMuted },
  answer: { margin: 0, fontSize: 15, lineHeight: 1.55, color: colors.textPrimary },
  gateLine: { margin: 0, fontSize: 14.5, lineHeight: 1.55, color: colors.textPrimary },
};
