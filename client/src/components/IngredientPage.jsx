import { useEffect, useState } from 'react';
import { colors, fonts, kristyVoice } from '../lib/tokens.js';
import { GoldThread } from './GoldThread.jsx';
import { fetchIngredient } from '../lib/ingredients.js';
import { severityColor, SEVERITY_LABEL, EVIDENCE_LABEL, SEVERITY_CALL } from '../lib/verdictRamp.js';

/* ═══════════════════════ Ingredient detail page — /app/ingredient/:id ═══════════════════════
   The full story on one flagged ingredient, rendered ENTIRELY from its KB entry (a pure
   read — no model call, free on the universal layer). Tap any flag row on a verdict card
   to get here; it's also a shareable / indexable deep link.

   Sections, in order:
     • Name + aliases ("also appears as…")
     • Her verdict register line for its severity
     • WHY IT MATTERS — the lead (why-first one-liner + the longer why)
     • THE HISTORY — where it came from (only when the entry has one) — the persuasion layer
     • THE EVIDENCE — the tier tag + the honest framing + sources, listed plainly
     • GRAB INSTEAD — the swap
     • the one education ism its category triggers

   Tokens only. Kristy's spoken lines are kristyVoice (Playfair italic); everything
   factual/ingredient is Inter. */

function SwapText({ swap }) {
  const trimmed = String(swap).trim();
  const comma = trimmed.indexOf(',');
  const primary = comma === -1 ? trimmed : trimmed.slice(0, comma);
  const rest = comma === -1 ? '' : trimmed.slice(comma);
  return (
    <p style={styles.swapText}>
      <span style={styles.swapPrimary}>{primary}</span>
      {rest && <span style={styles.swapRest}>{rest}</span>}
    </p>
  );
}

export default function IngredientPage({ id, onClose }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, error: null });
    fetchIngredient(id)
      .then((data) => !cancelled && setState({ loading: false, data, error: null }))
      .catch((err) => !cancelled && setState({ loading: false, data: null, error: err }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { loading, data, error } = state;

  return (
    <div style={styles.page} role="dialog" aria-modal="true" aria-label="Ingredient detail">
      <div style={styles.bar}>
        <button style={styles.back} onClick={onClose} aria-label="Back">
          <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>‹</span> Back
        </button>
        <span style={styles.eyebrow}>Ingredient</span>
      </div>

      <div style={styles.scroll}>
        <div style={styles.inner}>
          {loading && <p style={styles.status}>Reading the file…</p>}

          {!loading && error && (
            <div style={styles.centered}>
              <p style={{ ...kristyVoice, ...styles.callLine }}>
                {error.notFound
                  ? "I don't have a page on that one yet."
                  : "I couldn't pull that up just now."}
              </p>
              <button style={styles.ghost} onClick={onClose}>
                Back to your scan
              </button>
            </div>
          )}

          {!loading && data && (
            <>
              {/* Name + aliases */}
              <h1 style={styles.name}>{data.name}</h1>
              {data.aliases?.length > 0 && (
                <p style={styles.aliases}>
                  also appears as {data.aliases.join(' · ')}
                </p>
              )}

              {/* Severity + evidence chips */}
              <div style={styles.chipRow}>
                <span style={styles.sevChip}>
                  <span style={{ ...styles.dot, background: severityColor(data.severity) }} />
                  {SEVERITY_LABEL[data.severity] || data.severity}
                </span>
                <span style={styles.evChip}>{EVIDENCE_LABEL[data.evidence_tier] || data.evidence_tier}</span>
              </div>

              {/* Her verdict register line */}
              <div style={styles.callWrap}>
                <p style={{ ...kristyVoice, ...styles.callLine }}>
                  {data.framing?.verdict || SEVERITY_CALL[data.severity] || ''}
                </p>
              </div>

              {/* WHY IT MATTERS — the lead */}
              <section style={styles.section}>
                <div style={styles.label}>Why it matters</div>
                <p style={styles.lead}>{data.one_liner}</p>
                {data.why && <p style={styles.body}>{data.why}</p>}
              </section>

              {/* THE HISTORY — the persuasion layer, only when seeded */}
              {data.history && (
                <section style={styles.historyBox}>
                  <div style={styles.label}>The history</div>
                  <p style={styles.historyText}>{data.history}</p>
                </section>
              )}

              {/* THE EVIDENCE — honestly tiered */}
              <section style={styles.section}>
                <div style={styles.label}>The evidence</div>
                <div style={styles.evLine}>
                  <span style={styles.evChip}>{EVIDENCE_LABEL[data.evidence_tier] || data.evidence_tier}</span>
                </div>
                {data.framing?.evidence && <p style={styles.body}>{data.framing.evidence}</p>}
                {data.sources?.length > 0 && (
                  <ul style={styles.sources}>
                    {data.sources.map((s, i) => (
                      <li key={i} style={styles.source}>
                        <span style={styles.sourceMark} aria-hidden="true">—</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* GRAB INSTEAD — the swap */}
              {data.swap && (
                <section style={styles.swapBox}>
                  <div style={styles.label}>Grab instead</div>
                  <SwapText swap={data.swap} />
                </section>
              )}

              {/* Education ism */}
              {data.education?.text && (
                <div style={styles.ism}>
                  <GoldThread />
                  <p style={{ ...kristyVoice, ...styles.ismText }}>{data.education.text}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: 'fixed',
    inset: 0,
    zIndex: 80,
    display: 'flex',
    flexDirection: 'column',
    background: `linear-gradient(180deg, ${colors.bgDeep} 0%, ${colors.bg} 34%)`,
    color: colors.textPrimary,
    fontFamily: fonts.ui,
  },
  bar: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'calc(10px + env(safe-area-inset-top)) 14px 10px',
    borderBottom: `1px solid ${colors.border}`,
    background: colors.bg,
  },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    padding: '6px 10px 6px 4px',
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  scroll: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  inner: {
    width: '100%',
    maxWidth: 640,
    margin: '0 auto',
    boxSizing: 'border-box',
    padding: '22px 18px calc(40px + env(safe-area-inset-bottom))',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  status: { color: colors.textMuted, fontSize: 15, fontStyle: 'italic', padding: '20px 0' },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16, paddingTop: 24 },

  name: { margin: 0, fontFamily: fonts.ui, fontSize: 28, fontWeight: 700, lineHeight: 1.15, color: colors.textPrimary },
  aliases: { margin: '-6px 0 0', fontSize: 13.5, color: colors.textMuted, fontStyle: 'italic' },

  chipRow: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  sevChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '5px 11px',
    borderRadius: 999,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    fontSize: 12.5,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  dot: { width: 9, height: 9, borderRadius: 999, flex: '0 0 auto' },
  evChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 11px',
    borderRadius: 999,
    border: `1px solid ${colors.gold30}`,
    background: colors.goldTint9,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 600,
  },

  callWrap: {
    padding: '14px 16px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.goldTint9,
  },
  callLine: { margin: 0, fontSize: 20, lineHeight: 1.35, color: colors.textPrimary },

  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  lead: { margin: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.45, color: colors.textPrimary },
  body: { margin: 0, fontSize: 15, lineHeight: 1.62, color: colors.textMuted },

  historyBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '16px 16px 16px 18px',
    borderRadius: 14,
    borderLeft: `2px solid ${colors.accentGold}`,
    border: `1px solid ${colors.border}`,
    borderLeftWidth: 2,
    borderLeftColor: colors.accentGold,
    background: colors.surface,
  },
  historyText: { margin: 0, fontSize: 15.5, lineHeight: 1.65, color: colors.textPrimary },

  evLine: { display: 'flex', gap: 8 },
  sources: { margin: '4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 },
  source: {
    display: 'flex',
    gap: 8,
    fontSize: 12.5,
    lineHeight: 1.5,
    color: colors.textMuted,
  },
  sourceMark: { color: colors.accentGoldMuted, flex: '0 0 auto' },

  swapBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '14px 16px',
    borderRadius: 14,
    border: `1px solid ${colors.borderGold}`,
    background: colors.surface2,
  },
  swapText: { margin: 0, fontSize: 16, lineHeight: 1.5 },
  swapPrimary: { color: colors.accentGold, fontWeight: 700 },
  swapRest: { color: colors.textPrimary },

  ghost: {
    padding: '11px 20px',
    borderRadius: 999,
    border: `1px solid ${colors.borderGold}`,
    background: 'transparent',
    color: colors.textSecondary,
    fontFamily: fonts.ui,
    fontWeight: 600,
    fontSize: 15,
    cursor: 'pointer',
  },

  ism: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 6 },
  ismText: { margin: 0, fontSize: 14.5, lineHeight: 1.55, textAlign: 'center', color: colors.textMuted, maxWidth: 340 },
};
